/**
 * Email types — Phase 4.69.1.
 *
 * Provider-agnostic contract. Current impl: Resend (via fetch). Pola
 * sama dengan `apps/web/src/lib/checkout/channels/` — swap provider
 * nanti (misal ke SES, Mailgun) tanpa ubah caller.
 */

export interface EmailAddress {
  /** Email address (RFC 5322). */
  email: string
  /** Display name opsional ("GtJourneysID Booking <booking@gtjourneys.id>"). */
  name?: string
}

export interface EmailPayload {
  /** Satu atau beberapa recipient. Resend sandbox hanya kirim ke whitelisted address. */
  to: string | string[]
  /** Subject line. Required, max 998 char per RFC. */
  subject: string
  /** Plain-text body. Minimal satu dari `text` / `html` wajib. */
  text?: string
  /** HTML body. Konten harus TEMPLATE-CONTROLLED (no user HTML injection). */
  html?: string
  /** Override `from` (default: `RESEND_FROM_EMAIL`). Jarang dipakai. */
  from?: string
  /** Override `reply-to` (default: `RESEND_REPLY_TO_EMAIL`). */
  replyTo?: string
  /** Tag key-value untuk analytics Resend. Optional. */
  tags?: Record<string, string>
  /** Idempotency key (Resend header `Idempotency-Key`). Mencegah double-send saat retry. */
  idempotencyKey?: string
}

export interface EmailResult {
  /** `true` kalau provider confirm pengiriman (bukan delivery — itu async). */
  ok: boolean
  /** Provider message id untuk audit / tracking di dashboard. */
  id?: string
  /** Human-readable error untuk log; jangan expose ke customer. */
  error?: string
  /** HTTP status dari provider, untuk debugging. */
  status?: number
}

/**
 * Email provider interface. Caller tidak boleh ketahui impl mana yang aktif.
 */
export interface EmailProvider {
  readonly name: string
  send(payload: EmailPayload): Promise<EmailResult>
}
