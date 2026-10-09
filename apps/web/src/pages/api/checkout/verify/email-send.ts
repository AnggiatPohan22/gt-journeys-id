/**
 * POST /api/checkout/verify/email-send — Phase 4.69.2.
 *
 * Generate OTP email + simpan hash di CMS + kirim via Resend. Dipanggil
 * dari form checkout (Phase 4.69.3) saat customer klik tombol "Verify
 * email".
 *
 * Request:
 *   Content-Type: application/json
 *   body: { email: string, formStamp?: string }
 *
 * Response (JSON):
 *   { ok: true,  ttlSeconds: number }                         ← OTP dikirim
 *   { ok: false, error: 'invalid_email' }
 *   { ok: false, error: 'rate_limited', retryAfterSeconds }
 *   { ok: false, error: 'send_failed' }                       ← Resend fail
 *   { ok: false, error: 'misconfigured' }                     ← env/API-key hilang
 *
 * Security:
 *   - Rate-limit per (ipHash, emailHash): 3 send / 15min.
 *   - OTP di-hash sebelum store (jangan simpan raw digit).
 *   - Email di-hash sebelum store (jangan simpan raw email di tabel OTP).
 *   - Response TIDAK berisi OTP mentah (OTP hanya di email).
 */

import type { APIRoute } from 'astro'
import { sendEmail } from '@lib/email'
import { generateOtp, hashOtp, hashWithSalt, expiresAtIso, isValidEmail, OTP_CONFIG } from '@lib/checkout/otp'
import { createOtp } from '@lib/checkout/otpStore'
import { checkOtpSendRateLimit, OTP_RATE_CONFIG } from '@lib/checkout/otpRateLimit'
import { getClientIp, hashIp } from '@lib/checkout/rateLimit'
import { IS_PROD } from '@lib/env'

const RL_SALT = import.meta.env.BOOKING_RL_SALT || 'dnj-booking-rl-salt'

export const prerender = false

interface SendBody {
  email?: unknown
}

function jsonResponse(body: Record<string, unknown>, status: number = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export const POST: APIRoute = async ({ request }) => {
  let payload: SendBody
  try {
    payload = (await request.json()) as SendBody
  } catch {
    return jsonResponse({ ok: false, error: 'malformed_body' }, 400)
  }

  const emailRaw = typeof payload.email === 'string' ? payload.email.trim() : ''
  if (!emailRaw || !isValidEmail(emailRaw)) {
    return jsonResponse({ ok: false, error: 'invalid_email' }, 400)
  }

  const ip = getClientIp(request)
  const [ipHash, targetHash] = await Promise.all([
    hashIp(ip, RL_SALT),
    hashWithSalt(emailRaw),
  ])

  const rlKey = `${ipHash}::${targetHash}`
  if (!checkOtpSendRateLimit(rlKey)) {
    return jsonResponse(
      {
        ok: false,
        error: 'rate_limited',
        retryAfterSeconds: Math.floor(OTP_RATE_CONFIG.windowMs / 1000),
      },
      429,
    )
  }

  // Generate + persist OTP (store hashed).
  const otp = generateOtp()
  const otpHash = await hashOtp(otp)
  const expiresAt = expiresAtIso()

  const store = await createOtp({
    kind: 'email',
    targetHash,
    otpHash,
    expiresAt,
    ipHash,
  })
  if (!store.ok) {
    if (store.reason === 'misconfigured') {
      return jsonResponse({ ok: false, error: 'misconfigured' }, 500)
    }
    return jsonResponse({ ok: false, error: 'send_failed', detail: 'storage' }, 500)
  }

  // Kirim email. Idempotency-key = otp record id supaya retry tidak kirim dua.
  const emailRes = await sendEmail({
    to: emailRaw,
    subject: `GtJourneysID verification code: ${otp}`,
    text: buildOtpText(otp),
    idempotencyKey: `otp-${String(store.data.id)}`,
    tags: { phase: '4-69-2', kind: 'email-otp' },
  })

  if (!emailRes.ok) {
    // Log tapi masih return send_failed — jangan expose provider detail.
    // eslint-disable-next-line no-console
    console.warn(`[otp:email-send] email send failed: ${emailRes.error}`)
    return jsonResponse({ ok: false, error: 'send_failed', detail: 'email' }, 502)
  }

  // DEV-ONLY: log raw OTP ke server console supaya tester bisa pakai
  // tanpa harus buka inbox real (Resend sandbox hanya kirim ke email
  // whitelisted). JANGAN pernah expose ini di prod — IS_PROD guard
  // membuat dead-code elimination strip baris ini di build.
  if (!IS_PROD) {
    // eslint-disable-next-line no-console
    console.log(`[otp:dev] email=${emailRaw} otp=${otp} (dev-only log; strip di prod via IS_PROD)`)
  }

  return jsonResponse({
    ok: true,
    ttlSeconds: OTP_CONFIG.ttlMinutes * 60,
  })
}

function buildOtpText(otp: string): string {
  return [
    'Halo,',
    '',
    `Kode verifikasi GtJourneysID kamu: ${otp}`,
    '',
    `Kode berlaku selama ${OTP_CONFIG.ttlMinutes} menit. Jangan bagikan ke siapapun.`,
    '',
    'Kalau kamu tidak meminta kode ini, abaikan email ini.',
    '',
    '— GtJourneysID',
  ].join('\n')
}
