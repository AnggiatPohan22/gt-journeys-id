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
import { renderTemplate } from '@lib/checkout/templateRenderer'
import { IS_PROD } from '@lib/env'

const RL_SALT = import.meta.env.BOOKING_RL_SALT || 'dnj-booking-rl-salt'
const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = import.meta.env.PAYLOAD_API_KEY || ''

/** Fetch booking-templates global dari CMS. Non-fatal — fallback ke
 * default inline kalau gagal (dev tanpa CMS running). */
async function fetchOtpTemplate(): Promise<{
  subject: string
  text: string
  html: string | null
} | null> {
  if (!CMS_URL || !API_KEY) return null
  try {
    const res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/globals/booking-templates`, {
      headers: { Authorization: `users API-Key ${API_KEY}` },
    })
    if (!res.ok) return null
    const data = (await res.json().catch(() => ({}))) as {
      otpEmailSubject?: string
      otpEmailBody?: string
      otpEmailBodyHtml?: string | null
    }
    return {
      subject: data.otpEmailSubject ?? 'GtJourneysID verification code: {{otp}}',
      text: data.otpEmailBody ?? '',
      html: data.otpEmailBodyHtml ?? null,
    }
  } catch {
    return null
  }
}

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

  // Phase 4.70.1 — Fetch template dari CMS global; fallback ke default
  // inline kalau CMS unreachable (dev tanpa CMS).
  const tpl = await fetchOtpTemplate()
  const ctx = { otp, otpTtlMinutes: OTP_CONFIG.ttlMinutes }

  let subject = `GtJourneysID verification code: ${otp}`
  let text = buildOtpText(otp)
  let html: string | undefined

  if (tpl) {
    const subjR = renderTemplate(tpl.subject, ctx)
    const textR = renderTemplate(tpl.text, ctx)
    if (subjR.ok) subject = subjR.rendered
    if (textR.ok) text = textR.rendered
    if (tpl.html) {
      const htmlR = renderTemplate(tpl.html, ctx, { escapeHtml: true })
      if (htmlR.ok) html = htmlR.rendered
    }
  }

  // Kirim email. Idempotency-key = otp record id supaya retry tidak kirim dua.
  const emailRes = await sendEmail({
    to: emailRaw,
    subject,
    text,
    html,
    idempotencyKey: `otp-${String(store.data.id)}`,
    tags: { phase: '4-70-1', kind: 'email-otp' },
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
