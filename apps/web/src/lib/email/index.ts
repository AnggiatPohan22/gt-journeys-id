/**
 * Email entry — Phase 4.69.1.
 *
 * Resolve EmailProvider dari env sekali per modul load. Caller cukup
 * import `getEmailProvider()` + panggil `.send(payload)`. Kalau env
 * belum lengkap, factory return provider "noop" yang log + return
 * `{ ok: false }` — supaya dev tanpa `.env` tetap jalan dgn warning
 * jelas, tidak crash saat import.
 */

import { requireEnv } from '@lib/env'
import type { EmailPayload, EmailProvider, EmailResult } from './types'
import { ResendProvider } from './resend'

export type { EmailPayload, EmailProvider, EmailResult } from './types'

class NoopEmailProvider implements EmailProvider {
  readonly name = 'noop'
  constructor(private readonly reason: string) {}
  async send(payload: EmailPayload): Promise<EmailResult> {
    // eslint-disable-next-line no-console
    console.warn(
      `[email] Provider in noop mode (${this.reason}). Email NOT sent. ` +
      `to=${Array.isArray(payload.to) ? payload.to.join(',') : payload.to} subject="${payload.subject}"`,
    )
    return { ok: false, error: `email provider in noop mode: ${this.reason}` }
  }
}

let cached: EmailProvider | null = null

export function getEmailProvider(): EmailProvider {
  if (cached) return cached

  const apiKey = requireEnv('RESEND_API_KEY', import.meta.env.RESEND_API_KEY as string | undefined)
  const from   = requireEnv('RESEND_FROM_EMAIL', import.meta.env.RESEND_FROM_EMAIL as string | undefined)
  const replyTo = (import.meta.env.RESEND_REPLY_TO_EMAIL as string | undefined)?.trim() || undefined
  const fromName = (import.meta.env.RESEND_FROM_NAME as string | undefined)?.trim() || undefined

  if (!apiKey) {
    cached = new NoopEmailProvider('RESEND_API_KEY not set')
    return cached
  }
  if (!from) {
    cached = new NoopEmailProvider('RESEND_FROM_EMAIL not set')
    return cached
  }

  cached = new ResendProvider(apiKey, from, replyTo, fromName)
  return cached
}

/**
 * Shortcut untuk caller yang cuma mau sekali send. Equivalent dengan
 * `getEmailProvider().send(payload)`.
 */
export function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  return getEmailProvider().send(payload)
}

/**
 * TEST-ONLY — reset cache. Jangan dipakai di production code.
 * (Ekspor di sini supaya smoke-test script bisa reset antar iterasi.)
 */
export function __resetEmailProviderForTests(): void {
  cached = null
}
