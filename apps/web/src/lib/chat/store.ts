/**
 * Chat audit store — Phase 4.50.5.
 *
 * Thin Payload REST client untuk 3 collection audit (chat-visitors,
 * chat-messages, chat-blocked-events). Pattern paralel dengan
 * `lib/newsletter/store.ts` — pakai API-key auth.
 *
 * Semua method fail-soft: kalau CMS unreachable, log lalu return
 * degraded response. Kita TIDAK menolak request user hanya karena
 * audit gagal ditulis — spam prevention masih jalan (rate-limit KV
 * dan verifikasi provider), audit hanya untuk forensik.
 */

export interface ChatVisitorUpsertInput {
  visitorId: string
  ipHash?: string
  userAgentHash?: string
  country?: string
  incrementMessage?: boolean
}

export interface ChatMessageWriteInput {
  visitorDocId?: string
  sessionId: string
  channelType: string
  direction: 'in' | 'out'
  contentHash?: string
  contentLength?: number
  content?: string
  wasBlocked?: boolean
  blockReason?: string
  spamScore?: number
  verificationProvider?: string
  verificationScore?: number
  ipHash?: string
  context?: Record<string, unknown>
}

export interface ChatBlockedEventWriteInput {
  visitorDocId?: string
  sessionId?: string
  messageDocId?: string
  layer: string
  ruleTriggered: string
  action: 'block' | 'challenge' | 'log'
  ipHash?: string
  country?: string
  userAgent?: string
  context?: Record<string, unknown>
}

export interface ChatStore {
  upsertVisitor(input: ChatVisitorUpsertInput): Promise<{ ok: boolean; docId?: string }>
  writeMessage(input: ChatMessageWriteInput): Promise<{ ok: boolean; docId?: string }>
  writeBlockedEvent(input: ChatBlockedEventWriteInput): Promise<{ ok: boolean; docId?: string }>
  getVisitorPrevMessageHash(visitorDocId: string, sessionId: string): Promise<string | null>
}

export class PayloadChatStore implements ChatStore {
  constructor(private cmsUrl: string, private apiKey: string) {}

  private headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${this.apiKey}`,
    }
  }

  private base() {
    return this.cmsUrl.replace(/\/$/, '')
  }

  private async ok(): Promise<boolean> {
    return !!(this.cmsUrl && this.apiKey)
  }

  async upsertVisitor(input: ChatVisitorUpsertInput) {
    if (!(await this.ok())) return { ok: false }
    try {
      // Look up existing by visitorId
      const q = new URLSearchParams({
        'where[visitorId][equals]': input.visitorId,
        limit: '1',
        depth: '0',
      })
      const findRes = await fetch(`${this.base()}/api/chat-visitors?${q}`, {
        headers: this.headers(),
      })
      const found = findRes.ok ? await findRes.json().catch(() => null) : null
      const existing = found?.docs?.[0]

      const nowIso = new Date().toISOString()
      const body: Record<string, unknown> = {
        visitorId: input.visitorId,
        ipHash: input.ipHash,
        userAgentHash: input.userAgentHash,
        country: input.country,
        lastSeenAt: nowIso,
      }
      if (!existing) {
        body.firstSeenAt = nowIso
        body.messageCount = input.incrementMessage ? 1 : 0
        body.status = 'active'
      } else if (input.incrementMessage) {
        body.messageCount = (existing.messageCount ?? 0) + 1
      }

      const res = existing
        ? await fetch(`${this.base()}/api/chat-visitors/${existing.id}`, {
            method: 'PATCH',
            headers: this.headers(),
            body: JSON.stringify(body),
          })
        : await fetch(`${this.base()}/api/chat-visitors`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(body),
          })

      if (!res.ok) return { ok: false }
      const doc = await res.json().catch(() => ({}))
      return { ok: true, docId: doc?.doc?.id ?? doc?.id ?? existing?.id }
    } catch {
      return { ok: false }
    }
  }

  async writeMessage(input: ChatMessageWriteInput) {
    if (!(await this.ok())) return { ok: false }
    try {
      const body: Record<string, unknown> = {
        visitor: input.visitorDocId,
        sessionId: input.sessionId,
        channelType: input.channelType,
        direction: input.direction,
        contentHash: input.contentHash,
        contentLength: input.contentLength,
        content: input.content,
        wasBlocked: input.wasBlocked ?? false,
        blockReason: input.blockReason,
        spamScore: input.spamScore,
        verificationProvider: input.verificationProvider,
        verificationScore: input.verificationScore,
        ipHash: input.ipHash,
        context: input.context ?? {},
      }
      const res = await fetch(`${this.base()}/api/chat-messages`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
      })
      if (!res.ok) return { ok: false }
      const doc = await res.json().catch(() => ({}))
      return { ok: true, docId: doc?.doc?.id ?? doc?.id }
    } catch {
      return { ok: false }
    }
  }

  async writeBlockedEvent(input: ChatBlockedEventWriteInput) {
    if (!(await this.ok())) return { ok: false }
    try {
      const body: Record<string, unknown> = {
        visitor: input.visitorDocId,
        sessionId: input.sessionId,
        message: input.messageDocId,
        layer: input.layer,
        ruleTriggered: input.ruleTriggered,
        action: input.action,
        ipHash: input.ipHash,
        country: input.country,
        userAgent: input.userAgent,
        context: input.context ?? {},
      }
      const res = await fetch(`${this.base()}/api/chat-blocked-events`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
      })
      if (!res.ok) return { ok: false }
      const doc = await res.json().catch(() => ({}))
      return { ok: true, docId: doc?.doc?.id ?? doc?.id }
    } catch {
      return { ok: false }
    }
  }

  async getVisitorPrevMessageHash(visitorDocId: string, sessionId: string): Promise<string | null> {
    if (!(await this.ok())) return null
    try {
      const q = new URLSearchParams({
        'where[visitor][equals]': visitorDocId,
        'where[sessionId][equals]': sessionId,
        'where[direction][equals]': 'in',
        'where[wasBlocked][equals]': 'false',
        sort: '-createdAt',
        limit: '1',
        depth: '0',
      })
      const res = await fetch(`${this.base()}/api/chat-messages?${q}`, {
        headers: this.headers(),
      })
      if (!res.ok) return null
      const data = await res.json().catch(() => null)
      const hash = data?.docs?.[0]?.contentHash
      return typeof hash === 'string' ? hash : null
    } catch {
      return null
    }
  }
}

/** No-op store — dipakai bila CMS credentials absent (dev tanpa CMS). */
export class NoopChatStore implements ChatStore {
  async upsertVisitor() {
    return { ok: false }
  }
  async writeMessage() {
    return { ok: false }
  }
  async writeBlockedEvent() {
    return { ok: false }
  }
  async getVisitorPrevMessageHash() {
    return null
  }
}
