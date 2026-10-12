/**
 * Email sender — Phase 4.69.7 (CMS side).
 *
 * Minimal Resend fetch wrapper untuk admin "Send Payment Instructions"
 * endpoint. Zero npm dep — mirror ringkas dari
 * `apps/web/src/lib/email/resend.ts` (SSOT).
 *
 * Reads from `process.env` (Payload server-side, bukan import.meta.env).
 * Return `{ ok, id?, error?, status? }` — caller putuskan rollback.
 */

const RESEND_API_URL = 'https://api.resend.com/emails'
const DEFAULT_TIMEOUT_MS = 10_000

export interface SendEmailInput {
  to: string
  subject: string
  text: string
  /** Optional HTML version (Phase 4.70.1). Resend auto-fallback ke text kalau client tidak render HTML. */
  html?: string
  idempotencyKey?: string
}

export interface SendEmailResult {
  ok: boolean
  id?: string
  error?: string
  status?: number
}

function composeFrom(email: string, displayName?: string): string {
  const name = displayName?.trim()
  if (!name) return email
  const safe = name.replace(/"/g, '\\"')
  return `"${safe}" <${email}>`
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const fromName = process.env.RESEND_FROM_NAME
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL

  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not set' }
  if (!from) return { ok: false, error: 'RESEND_FROM_EMAIL not set' }

  const body: Record<string, unknown> = {
    from: composeFrom(from, fromName),
    to: [input.to],
    subject: input.subject,
    text: input.text,
  }
  if (input.html) body.html = input.html
  if (replyTo) body.reply_to = replyTo

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
    if (input.idempotencyKey) headers['Idempotency-Key'] = input.idempotencyKey

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
      // Non-JSON response (biasanya 5xx HTML).
    }

    if (!res.ok) {
      const err = extractError(data) ?? `Resend HTTP ${res.status}`
      return { ok: false, status: res.status, error: err }
    }

    const id =
      typeof data === 'object' && data && 'id' in data
        ? String((data as { id: unknown }).id)
        : undefined
    return { ok: true, status: res.status, id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const kind = e instanceof Error && e.name === 'AbortError' ? 'timeout' : 'network'
    return { ok: false, error: `Resend ${kind}: ${msg}` }
  } finally {
    clearTimeout(timer)
  }
}

function extractError(data: unknown): string | undefined {
  if (typeof data !== 'object' || !data) return undefined
  const d = data as { message?: unknown; name?: unknown }
  if (typeof d.message === 'string') return d.message
  if (typeof d.name === 'string') return d.name
  return undefined
}
