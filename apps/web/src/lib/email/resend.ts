/**
 * Resend provider — Phase 4.69.1.
 *
 * Minimal fetch wrapper ke https://api.resend.com/emails. Zero npm
 * dependency (sesuai D2 approved) — pakai Web Crypto / fetch stdlib
 * yang compatible dgn Cloudflare Workers runtime (dipakai Astro adapter).
 *
 * Design notes:
 * - Semua error di-swallow jadi `{ ok: false, error }` — caller putuskan
 *   apakah mau retry / fallback / show error ke user. Pattern sama dgn
 *   `apps/web/src/lib/newsletter/notifiers.ts` (contract: notifier MUST
 *   NOT throw).
 * - Timeout 10s via AbortController supaya request hang tidak block
 *   endpoint (Cloudflare Workers CPU budget).
 * - Idempotency-Key diteruskan ke Resend header kalau diset (Resend
 *   dedupe otomatis selama 24 jam).
 * - FROM email di-compose dgn display name opsional via `RESEND_FROM_NAME`
 *   env — jatuh ke raw email kalau tidak diset.
 */

import type { EmailPayload, EmailProvider, EmailResult } from './types'

const RESEND_API_URL = 'https://api.resend.com/emails'
const DEFAULT_TIMEOUT_MS = 10_000

interface ResendSendBody {
  from: string
  to: string[]
  subject: string
  text?: string
  html?: string
  reply_to?: string
  tags?: { name: string; value: string }[]
}

export class ResendProvider implements EmailProvider {
  readonly name = 'resend'

  constructor(
    private readonly apiKey: string,
    private readonly defaultFrom: string,
    private readonly defaultReplyTo?: string,
    private readonly fromDisplayName?: string,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  async send(payload: EmailPayload): Promise<EmailResult> {
    if (!payload.text && !payload.html) {
      return { ok: false, error: 'Email body kosong: `text` atau `html` wajib diisi.' }
    }

    const body: ResendSendBody = {
      from: composeFrom(payload.from ?? this.defaultFrom, this.fromDisplayName),
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
    }
    if (payload.text) body.text = payload.text
    if (payload.html) body.html = payload.html
    const replyTo = payload.replyTo ?? this.defaultReplyTo
    if (replyTo) body.reply_to = replyTo
    if (payload.tags) {
      body.tags = Object.entries(payload.tags).map(([name, value]) => ({ name, value }))
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      }
      if (payload.idempotencyKey) {
        headers['Idempotency-Key'] = payload.idempotencyKey
      }

      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      let data: unknown = null
      try {
        data = await res.json()
      } catch {
        // Response bukan JSON — biasanya 5xx HTML page dari CDN.
      }

      if (!res.ok) {
        const err = extractError(data) ?? `Resend HTTP ${res.status}`
        return { ok: false, status: res.status, error: err }
      }

      const id = typeof data === 'object' && data && 'id' in data
        ? String((data as { id: unknown }).id)
        : undefined

      return { ok: true, status: res.status, id }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const kind = (e instanceof Error && e.name === 'AbortError') ? 'timeout' : 'network'
      return { ok: false, error: `Resend ${kind}: ${msg}` }
    } finally {
      clearTimeout(timer)
    }
  }
}

function composeFrom(email: string, displayName?: string): string {
  const name = displayName?.trim()
  if (!name) return email
  // Escape double-quotes di display name supaya header valid.
  const safe = name.replace(/"/g, '\\"')
  return `"${safe}" <${email}>`
}

function extractError(data: unknown): string | undefined {
  if (typeof data !== 'object' || !data) return undefined
  const d = data as { message?: unknown; name?: unknown }
  if (typeof d.message === 'string') return d.message
  if (typeof d.name === 'string') return d.name
  return undefined
}
