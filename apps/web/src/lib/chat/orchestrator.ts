/**
 * Chat orchestrator — Phase 4.50.5.
 *
 * Menjalankan pipeline security lengkap untuk 1 request send:
 *   1. Resolve visitor cookie (mint kalau baru).
 *   2. Hash IP.
 *   3. Load config chat-widget dari CMS.
 *   4. Validate channel exists + enabled.
 *   5. Layer 5 IP/country control (fail-fast, sebelum increment counter).
 *   6. Layer 1 rate-limit (KV increment).
 *   7. Layer 2 verification (Turnstile / reCAPTCHA v3) — hanya untuk
 *      channel yang di-configure.
 *   8. Layer 3+4 spam checks (length, keyword, honeypot, timing, UA,
 *      duplicate).
 *   9. Kalau block/challenge di layer manapun → tulis chat-blocked-event
 *      + reject.
 *  10. Bila lolos → forward ke provider (AI Anthropic, Email stub).
 *  11. Write chat-visitors + chat-messages (inbound + outbound bila ada
 *      reply).
 *
 * Return payload minimal untuk client — tidak leak signal internal
 * (ruleTriggered) supaya spammer tidak bisa reverse-engineer.
 */

import {
  MemoryRateLimitStore,
  CloudflareKvRateLimitStore,
  createIpHasher,
  getClientCountry,
  getClientIp,
  createVerificationVerifier,
  resolveVisitor,
  buildSetCookieHeader,
  runSpamChecks,
  checkRateLimits,
  sha256Hex,
  type KvBinding,
  type RateLimitRule,
  type RateLimitStore,
  type SpamCheckConfig,
  type VerificationProvider,
} from '@lib/chat-security'

import { PayloadChatStore, NoopChatStore, type ChatStore } from './store'
import type { ChannelProvider } from './providers/types'
import { AnthropicProvider } from './providers/ai-anthropic'
import { WorkersAiProvider } from './providers/ai-workers'
import { EmailLogProvider } from './providers/email'

// ── Types ──────────────────────────────────────────────────────────
export interface HandleSendInput {
  request: Request
  body: {
    channelKey?: string
    channelIndex?: number
    message?: string
    sessionId?: string
    turnstileToken?: string
    recaptchaToken?: string
    honeypot?: string
    formOpenedAt?: number
  }
  widget: any
  env: {
    CMS_URL?: string
    PAYLOAD_API_KEY?: string
    CHAT_IP_HASH_SALT?: string
    CHAT_VISITOR_COOKIE_SECRET?: string
    TURNSTILE_SECRET_KEY?: string
    RECAPTCHA_SECRET_KEY?: string
    ANTHROPIC_API_KEY?: string
    OPENAI_API_KEY?: string
    CLOUDFLARE_API_TOKEN?: string
    CLOUDFLARE_ACCOUNT_ID?: string
    [k: string]: string | undefined
  }
  kv?: KvBinding
  /** Cloudflare Workers AI binding (`env.AI`). Kalau ada → WorkersAiProvider pakai binding, else fallback REST. */
  ai?: { run: (model: string, input: any) => Promise<any> }
}

export type HandleSendErrorCode =
  | 'invalid_body'
  | 'channel_not_found'
  | 'channel_disabled'
  | 'rate_limited'
  | 'verification_failed'
  | 'invalid_message'
  | 'blocked'
  | 'provider_error'
  | 'misconfigured'

export type HandleSendResult =
  | {
      ok: true
      reply?: string
      messageId?: string
      setCookie?: string
    }
  | {
      ok: false
      code: HandleSendErrorCode
      retryAfterSeconds?: number
      setCookie?: string
    }

// ── Config coercion ────────────────────────────────────────────────
function coerceRateLimitRules(widget: any, defaultChannel: string): RateLimitRule[] {
  const raw = widget?.rateLimitRules
  if (!Array.isArray(raw) || raw.length === 0) {
    // Default sane rule kalau CMS belum di-config: 5 per menit per IP.
    return [
      {
        id: 'default-5-per-min',
        limitCount: 5,
        windowSeconds: 60,
        keyBy: 'ip',
        scope: 'global',
        action: 'block',
      },
    ]
  }
  return raw
    .filter(
      (r) =>
        Number.isFinite(r?.limitCount) &&
        Number.isFinite(r?.windowSeconds) &&
        r?.keyBy &&
        r?.action,
    )
    .map((r, i) => ({
      id: `rl-${i}-${r.limitCount}-per-${r.windowSeconds}s`,
      limitCount: r.limitCount,
      windowSeconds: r.windowSeconds,
      keyBy: r.keyBy,
      scope: r.scope ?? 'global',
      action: r.action,
    }))
}

function coerceSpamCheckConfig(widget: any, ip: string, country?: string): SpamCheckConfig {
  return {
    minMessageLength: Number.isFinite(widget?.minMessageLength) ? widget.minMessageLength : 2,
    maxMessageLength: Number.isFinite(widget?.maxMessageLength) ? widget.maxMessageLength : 1000,
    blockDuplicateConsecutive: widget?.blockDuplicateConsecutive !== false,
    blockedKeywords: (widget?.blockedKeywords ?? [])
      .map((k: any) => k?.value)
      .filter((v: any): v is string => typeof v === 'string' && v.length > 0),
    blockedPatterns: (widget?.blockedPatterns ?? [])
      .filter((p: any) => p?.pattern)
      .map((p: any) => ({ pattern: p.pattern, flags: p.flags })),
    enableHoneypot: widget?.enableHoneypot !== false,
    enableTimingCheck: widget?.enableTimingCheck !== false,
    minFormFillMs: Number.isFinite(widget?.minFormFillMs) ? widget.minFormFillMs : 1500,
    enableUserAgentCheck: widget?.enableUserAgentCheck !== false,
    customBlockedUserAgents: (widget?.customBlockedUserAgents ?? [])
      .map((u: any) => u?.pattern)
      .filter((v: any): v is string => typeof v === 'string' && v.length > 0),
    blockedIps: (widget?.blockedIps ?? [])
      .map((b: any) => b?.value)
      .filter((v: any): v is string => typeof v === 'string' && v.length > 0),
    countryMode: widget?.countryMode ?? 'off',
    countryCodes: (widget?.countryCodes ?? [])
      .map((c: any) => c?.code)
      .filter((v: any): v is string => typeof v === 'string' && v.length > 0),
    ipToCheck: ip,
  }
}

function findChannel(widget: any, channelKey?: string, channelIndex?: number): { block: any; index: number } | null {
  const channels = widget?.channels ?? []
  if (!Array.isArray(channels)) return null
  if (typeof channelIndex === 'number' && channelIndex >= 0 && channelIndex < channels.length) {
    return { block: channels[channelIndex], index: channelIndex }
  }
  // Fallback: parse key format "<type>-<n>" (dari resolvedChannel.key di frontend adapter).
  if (channelKey) {
    const m = channelKey.match(/-(\d+)$/)
    if (m) {
      const idx = parseInt(m[1], 10)
      if (channels[idx]) return { block: channels[idx], index: idx }
    }
  }
  return null
}

function pickProvider(
  blockType: string,
  block: any,
  env: HandleSendInput['env'],
  ai?: HandleSendInput['ai'],
): ChannelProvider | null {
  if (blockType === 'aiChatbotChannel') {
    const aiProvider = block?.provider ?? 'anthropic'
    if (aiProvider === 'workers-ai') return new WorkersAiProvider((name) => env[name], ai)
    // Default & 'anthropic'. Provider 'openai' & 'custom' belum di-wire —
    // return null → orchestrator kembalikan provider_error, dan admin
    // dapat sinyal di /admin/collections/chat-blocked-events context.
    if (aiProvider === 'anthropic') return new AnthropicProvider((name) => env[name])
    return null
  }
  if (blockType === 'emailChannel') return new EmailLogProvider()
  return null
}

function providerNeedsBackend(blockType: string): boolean {
  return blockType === 'aiChatbotChannel' || blockType === 'emailChannel'
}

function verificationRequiredForChannel(widget: any, blockType: string): boolean {
  const provider = (widget?.verificationProvider ?? 'none') as VerificationProvider
  if (provider === 'none') return false
  const channels: string[] = widget?.verificationChannels ?? []
  if (!Array.isArray(channels) || channels.length === 0) return false
  return channels.includes(blockType)
}

// ── Main entry ─────────────────────────────────────────────────────
export async function handleChatSend(input: HandleSendInput): Promise<HandleSendResult> {
  const { request, body, widget, env, kv, ai } = input

  if (!body?.message || typeof body.message !== 'string') {
    return { ok: false, code: 'invalid_body' }
  }
  if (!body?.sessionId || typeof body.sessionId !== 'string') {
    return { ok: false, code: 'invalid_body' }
  }

  // Config & context ────────────────────────────────────────────────
  const enabledLayers: string[] = widget?.enabledLayers ?? [
    'rateLimit',
    'backendValidation',
  ]

  const channel = findChannel(widget, body.channelKey, body.channelIndex)
  if (!channel) return { ok: false, code: 'channel_not_found' }
  if (channel.block?.enabled === false) return { ok: false, code: 'channel_disabled' }
  if (!providerNeedsBackend(channel.block?.blockType)) {
    // WA/LiveChat = client-side redirect; endpoint tidak seharusnya dipanggil.
    return { ok: false, code: 'channel_disabled' }
  }

  const ip = getClientIp(request)
  const country = getClientCountry(request)
  const userAgent = request.headers.get('user-agent') ?? ''

  const salt = env.CHAT_IP_HASH_SALT ?? ''
  const cookieSecret = env.CHAT_VISITOR_COOKIE_SECRET ?? ''
  if (!salt || salt.length < 16 || !cookieSecret || cookieSecret.length < 16) {
    return { ok: false, code: 'misconfigured' }
  }
  const ipHasher = createIpHasher(salt)
  const ipHash = await ipHasher.hash(ip)
  const uaHash = userAgent ? (await sha256Hex(userAgent)).slice(0, 32) : undefined

  const cookieName = widget?.visitorCookieName ?? '__cwvid'
  const cookieTtl = Number.isFinite(widget?.visitorCookieTtlDays) ? widget.visitorCookieTtlDays : 90

  const visitor = await resolveVisitor(request, {
    name: cookieName,
    ttlDays: cookieTtl,
    signingSecret: cookieSecret,
  })
  const setCookie = visitor.isNew
    ? await buildSetCookieHeader(visitor, {
        name: cookieName,
        ttlDays: cookieTtl,
        signingSecret: cookieSecret,
      })
    : undefined

  // Store
  const store: ChatStore =
    env.CMS_URL && env.PAYLOAD_API_KEY
      ? new PayloadChatStore(env.CMS_URL, env.PAYLOAD_API_KEY)
      : new NoopChatStore()

  const visitorRow = await store.upsertVisitor({
    visitorId: visitor.visitorId,
    ipHash,
    userAgentHash: uaHash,
    country,
  })
  const visitorDocId = visitorRow.ok ? visitorRow.docId : undefined

  // Helper untuk block+return
  async function blockAndAudit(
    layer: 'rateLimit' | 'humanVerification' | 'backendValidation' | 'botSignals' | 'ipControls',
    ruleTriggered: string,
    ctx: Record<string, unknown>,
    action: 'block' | 'challenge' = 'block',
    responseCode: HandleSendErrorCode = 'blocked',
    retryAfterSeconds?: number,
  ): Promise<HandleSendResult> {
    await store.writeBlockedEvent({
      visitorDocId,
      sessionId: body.sessionId!,
      layer,
      ruleTriggered,
      action,
      ipHash,
      country,
      userAgent,
      context: ctx,
    })
    return { ok: false, code: responseCode, retryAfterSeconds, setCookie }
  }

  // ── Layer 5: IP/country + spam pre-check (cheap, fail-fast) ──────
  if (enabledLayers.includes('ipControls') || enabledLayers.includes('backendValidation') || enabledLayers.includes('botSignals')) {
    const preCheckCfg = coerceSpamCheckConfig(widget, ip, country)
    // Prev-hash untuk dedup consecutive
    const prevHash =
      preCheckCfg.blockDuplicateConsecutive && visitorDocId
        ? await store.getVisitorPrevMessageHash(visitorDocId, body.sessionId)
        : null

    const spamRes = await runSpamChecks(
      {
        content: body.message,
        previousContentHash: prevHash ?? undefined,
        formOpenedAt: body.formOpenedAt,
        submittedAt: Date.now(),
        honeypotValue: body.honeypot,
        userAgent,
        country,
      },
      preCheckCfg,
    )
    if (!spamRes.ok && spamRes.ruleTriggered && spamRes.layer) {
      // Skip audit kalau layer-nya di-disable
      if (!enabledLayers.includes(spamRes.layer)) {
        // layer disabled → allow
      } else {
        const codeMap: Record<string, HandleSendErrorCode> = {
          'length-below-min': 'invalid_message',
          'length-above-max': 'invalid_message',
        }
        const responseCode = codeMap[spamRes.ruleTriggered] ?? 'blocked'
        return blockAndAudit(spamRes.layer, spamRes.ruleTriggered, spamRes.context ?? {}, 'block', responseCode)
      }
    }
  }

  // ── Layer 1: Rate-limit ──────────────────────────────────────────
  if (enabledLayers.includes('rateLimit')) {
    const rules = coerceRateLimitRules(widget, channel.block?.blockType)
    const rlStore: RateLimitStore = kv
      ? new CloudflareKvRateLimitStore(kv)
      : new MemoryRateLimitStore()

    const results = await checkRateLimits(rlStore, rules, {
      ipHash,
      visitorId: visitor.visitorId,
      channelType: channel.block?.blockType,
    })

    for (const r of results) {
      if (r.allowed) continue
      const retry = Math.max(1, Math.ceil((r.resetAt - Date.now()) / 1000))
      return blockAndAudit(
        'rateLimit',
        r.ruleId,
        { count: r.count, limit: r.limit, windowSeconds: r.windowSeconds },
        r.action === 'challenge' ? 'challenge' : 'block',
        'rate_limited',
        retry,
      )
    }
  }

  // ── Layer 2: Verification ───────────────────────────────────────
  let verificationScore: number | undefined
  if (enabledLayers.includes('humanVerification') && verificationRequiredForChannel(widget, channel.block?.blockType)) {
    const provider = (widget?.verificationProvider ?? 'none') as VerificationProvider
    const token = provider === 'turnstile' ? body.turnstileToken : body.recaptchaToken
    const verifier = createVerificationVerifier({
      turnstile: env.TURNSTILE_SECRET_KEY,
      recaptcha: env.RECAPTCHA_SECRET_KEY,
    })
    const vr = await verifier.verify({
      provider,
      token: token ?? '',
      remoteIp: ip,
      minScore: widget?.verificationMinScore,
    })
    verificationScore = vr.score
    if (!vr.ok) {
      return blockAndAudit(
        'humanVerification',
        `verification-${provider}-failed`,
        { errorCodes: vr.errorCodes, score: vr.score },
        'block',
        'verification_failed',
      )
    }
  }

  // ── Content hash untuk audit ────────────────────────────────────
  const contentHash = await sha256Hex(body.message)

  // ── Write inbound message ───────────────────────────────────────
  const inboundRes = await store.writeMessage({
    visitorDocId,
    sessionId: body.sessionId,
    channelType: channel.block?.blockType,
    direction: 'in',
    contentHash,
    contentLength: body.message.length,
    content: body.message,
    wasBlocked: false,
    ipHash,
    verificationProvider: widget?.verificationProvider,
    verificationScore,
  })
  const inboundId = inboundRes.docId

  // ── Provider call ───────────────────────────────────────────────
  const provider = pickProvider(channel.block?.blockType, channel.block, env, ai)
  if (!provider) {
    return { ok: false, code: 'provider_error', setCookie }
  }
  const pr = await provider.reply({
    content: body.message,
    visitorId: visitor.visitorId,
    sessionId: body.sessionId,
    channelConfig: { blockType: channel.block?.blockType, index: channel.index, block: channel.block },
  })

  if (!pr.ok) {
    await store.writeMessage({
      visitorDocId,
      sessionId: body.sessionId,
      channelType: channel.block?.blockType,
      direction: 'out',
      wasBlocked: true,
      blockReason: pr.code,
      ipHash,
      context: pr.providerMeta,
    })
    return { ok: false, code: 'provider_error', setCookie }
  }

  // ── Write outbound + increment visitor.messageCount ─────────────
  const outboundHash = await sha256Hex(pr.reply)
  const outboundRes = await store.writeMessage({
    visitorDocId,
    sessionId: body.sessionId,
    channelType: channel.block?.blockType,
    direction: 'out',
    contentHash: outboundHash,
    contentLength: pr.reply.length,
    content: pr.reply,
    ipHash,
    context: pr.providerMeta,
  })

  await store.upsertVisitor({
    visitorId: visitor.visitorId,
    ipHash,
    userAgentHash: uaHash,
    country,
    incrementMessage: true,
  })

  return {
    ok: true,
    reply: pr.reply,
    messageId: outboundRes.docId ?? inboundId,
    setCookie,
  }
}
