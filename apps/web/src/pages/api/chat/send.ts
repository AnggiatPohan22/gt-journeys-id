import type { APIRoute } from 'astro'
import { getChatWidget } from '@lib/payload'
import { handleChatSend } from '@lib/chat/orchestrator'
import type { KvBinding } from '@lib/chat-security'

/**
 * POST /api/chat/send — Phase 4.50.5.
 *
 * Thin controller. Semua logic security + provider + audit di
 * `lib/chat/orchestrator.ts`. File ini hanya:
 *   1. Parse body.
 *   2. Ambil chat-widget global.
 *   3. Resolve env & KV binding dari Astro.locals.runtime (Cloudflare adapter).
 *   4. Delegate ke handleChatSend.
 *   5. Set-Cookie kalau visitor baru.
 *
 * Body JSON: {
 *   channelIndex: number,   // preferred
 *   channelKey?: string,    // fallback: "ai-0" / "email-1"
 *   message: string,
 *   sessionId: string,      // UUID per panel-open, di-gen di client
 *   turnstileToken?: string,
 *   recaptchaToken?: string,
 *   honeypot?: string,      // hidden field, harus kosong
 *   formOpenedAt?: number,  // epoch ms saat panel dibuka
 * }
 *
 * Response 2xx: { ok: true, reply?: string, messageId?: string }
 * Response 4xx: { ok: false, code: string, retryAfterSeconds?: number }
 */
export const prerender = false

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...(headers ?? {}) },
  })
}

const codeToStatus: Record<string, number> = {
  invalid_body: 400,
  invalid_message: 400,
  channel_not_found: 404,
  channel_disabled: 403,
  rate_limited: 429,
  verification_failed: 403,
  blocked: 403,
  provider_error: 502,
  misconfigured: 500,
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, code: 'invalid_body' }, 400)
  }

  const widget = await getChatWidget().catch(() => null)
  if (!widget) return json({ ok: false, code: 'misconfigured' }, 500)
  if (widget.enabled === false) return json({ ok: false, code: 'channel_disabled' }, 403)

  // Cloudflare runtime bindings — akses env + KV lewat Astro.locals.runtime.env.
  // Fallback ke import.meta.env untuk dev tanpa adapter runtime.
  const runtimeEnv = (locals as any)?.runtime?.env ?? {}
  const env = {
    CMS_URL: runtimeEnv.CMS_URL ?? import.meta.env.CMS_URL,
    PAYLOAD_API_KEY: runtimeEnv.PAYLOAD_API_KEY ?? import.meta.env.PAYLOAD_API_KEY,
    CHAT_IP_HASH_SALT: runtimeEnv.CHAT_IP_HASH_SALT ?? import.meta.env.CHAT_IP_HASH_SALT,
    CHAT_VISITOR_COOKIE_SECRET:
      runtimeEnv.CHAT_VISITOR_COOKIE_SECRET ?? import.meta.env.CHAT_VISITOR_COOKIE_SECRET,
    TURNSTILE_SECRET_KEY: runtimeEnv.TURNSTILE_SECRET_KEY ?? import.meta.env.TURNSTILE_SECRET_KEY,
    RECAPTCHA_SECRET_KEY: runtimeEnv.RECAPTCHA_SECRET_KEY ?? import.meta.env.RECAPTCHA_SECRET_KEY,
    ANTHROPIC_API_KEY: runtimeEnv.ANTHROPIC_API_KEY ?? import.meta.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: runtimeEnv.OPENAI_API_KEY ?? import.meta.env.OPENAI_API_KEY,
    CLOUDFLARE_API_TOKEN: runtimeEnv.CLOUDFLARE_API_TOKEN ?? import.meta.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: runtimeEnv.CLOUDFLARE_ACCOUNT_ID ?? import.meta.env.CLOUDFLARE_ACCOUNT_ID,
  }
  const kv = runtimeEnv.CHAT_RATE_LIMIT_KV as KvBinding | undefined
  // Cloudflare Workers AI native binding (bila `wrangler.jsonc` punya `[ai] binding = "AI"`).
  const ai = runtimeEnv.AI as { run: (model: string, input: any) => Promise<any> } | undefined

  const result = await handleChatSend({ request, body, widget, env, kv, ai })

  const headers: Record<string, string> = {}
  if ('setCookie' in result && result.setCookie) headers['set-cookie'] = result.setCookie

  if (result.ok) {
    return json(
      { ok: true, reply: result.reply, messageId: result.messageId },
      200,
      headers,
    )
  }

  const status = codeToStatus[result.code] ?? 400
  if (result.code === 'rate_limited' && result.retryAfterSeconds) {
    headers['retry-after'] = String(result.retryAfterSeconds)
  }
  return json(
    {
      ok: false,
      code: result.code,
      ...(result.retryAfterSeconds ? { retryAfterSeconds: result.retryAfterSeconds } : {}),
    },
    status,
    headers,
  )
}
