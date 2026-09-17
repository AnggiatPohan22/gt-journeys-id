import type { VerificationVerifier, VerifyInput, VerifyResult } from './types'

/**
 * Human verification — Phase 4.50.4.
 *
 * Support 2 provider: Cloudflare Turnstile & Google reCAPTCHA v3. Keduanya
 * silent-verify by default: user tidak melihat CAPTCHA challenge kecuali
 * skor rendah (reCAPTCHA) atau managed-challenge (Turnstile server decision).
 *
 * Secret key TIDAK di-inline — resolve dari env at construction time.
 * Kalau secret hilang → verify() akan fail-closed (ok=false) supaya tidak
 * ada silent bypass.
 */

const TURNSTILE_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const RECAPTCHA_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify'

async function verifyTurnstile(input: VerifyInput, secret: string): Promise<VerifyResult> {
  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', input.token)
  if (input.remoteIp) body.set('remoteip', input.remoteIp)

  try {
    const res = await fetch(TURNSTILE_ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    const data = (await res.json()) as {
      success: boolean
      ['error-codes']?: string[]
    }
    return {
      ok: !!data.success,
      provider: 'turnstile',
      errorCodes: data['error-codes'] ?? undefined,
      raw: data,
    }
  } catch (e) {
    return { ok: false, provider: 'turnstile', errorCodes: ['fetch_error'], raw: String(e) }
  }
}

async function verifyRecaptchaV3(input: VerifyInput, secret: string): Promise<VerifyResult> {
  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', input.token)
  if (input.remoteIp) body.set('remoteip', input.remoteIp)

  try {
    const res = await fetch(RECAPTCHA_ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    const data = (await res.json()) as {
      success: boolean
      score?: number
      action?: string
      ['error-codes']?: string[]
    }
    const score = typeof data.score === 'number' ? data.score : undefined
    const scoreOk = score === undefined ? true : score >= (input.minScore ?? 0.5)
    return {
      ok: !!data.success && scoreOk,
      provider: 'recaptcha_v3',
      score,
      errorCodes: [
        ...(data['error-codes'] ?? []),
        ...(!scoreOk && score !== undefined ? [`score_below_min:${score}`] : []),
      ],
      raw: data,
    }
  } catch (e) {
    return { ok: false, provider: 'recaptcha_v3', errorCodes: ['fetch_error'], raw: String(e) }
  }
}

export function createVerificationVerifier(secretResolver: {
  turnstile?: string
  recaptcha?: string
}): VerificationVerifier {
  return {
    async verify(input: VerifyInput): Promise<VerifyResult> {
      if (input.provider === 'none') return { ok: true, provider: 'none' }
      if (!input.token) {
        return { ok: false, provider: input.provider, errorCodes: ['missing_token'] }
      }
      if (input.provider === 'turnstile') {
        const secret = secretResolver.turnstile
        if (!secret) {
          return { ok: false, provider: 'turnstile', errorCodes: ['missing_secret'] }
        }
        return verifyTurnstile(input, secret)
      }
      if (input.provider === 'recaptcha_v3') {
        const secret = secretResolver.recaptcha
        if (!secret) {
          return { ok: false, provider: 'recaptcha_v3', errorCodes: ['missing_secret'] }
        }
        return verifyRecaptchaV3(input, secret)
      }
      return { ok: false, provider: input.provider, errorCodes: ['unsupported_provider'] }
    },
  }
}
