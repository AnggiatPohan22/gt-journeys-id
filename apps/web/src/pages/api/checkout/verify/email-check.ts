/**
 * POST /api/checkout/verify/email-check — Phase 4.69.2.
 *
 * Verifikasi OTP email. Kalau sukses, issue `email_verified_token` HMAC
 * (TTL 30 menit) yang customer sertakan di submit final ke
 * `/api/bookings/create` sebagai bukti email verified.
 *
 * Request:
 *   Content-Type: application/json
 *   body: { email: string, otp: string }
 *
 * Response:
 *   { ok: true, token: string }                          ← email verified
 *   { ok: false, error: 'invalid_email' }
 *   { ok: false, error: 'invalid_otp' }                  ← OTP mentah malformed
 *   { ok: false, error: 'no_active_otp' }                ← tidak ada send sebelumnya / expired
 *   { ok: false, error: 'otp_mismatch', attemptsLeft }   ← kode salah
 *   { ok: false, error: 'too_many_attempts' }            ← attempts >= OTP_MAX_CHECK_ATTEMPTS
 *   { ok: false, error: 'misconfigured' }
 *
 * Security:
 *   - Compare constant-time otp hash.
 *   - Max 5 attempt per OTP record → invalidate.
 *   - Setelah sukses, mark `verifiedAt` → record single-use.
 */

import type { APIRoute } from 'astro'
import { hashOtp, hashWithSalt, timingSafeEqual, isValidEmail, OTP_CONFIG } from '@lib/checkout/otp'
import { findActiveOtp, incrementAttempt, markVerified } from '@lib/checkout/otpStore'
import { issueEmailVerifiedToken } from '@lib/checkout/emailVerifiedToken'

export const prerender = false

interface CheckBody {
  email?: unknown
  otp?: unknown
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
  let payload: CheckBody
  try {
    payload = (await request.json()) as CheckBody
  } catch {
    return jsonResponse({ ok: false, error: 'malformed_body' }, 400)
  }

  const emailRaw = typeof payload.email === 'string' ? payload.email.trim() : ''
  const otpRaw = typeof payload.otp === 'string' ? payload.otp.trim() : ''

  if (!emailRaw || !isValidEmail(emailRaw)) {
    return jsonResponse({ ok: false, error: 'invalid_email' }, 400)
  }
  if (!otpRaw || !/^\d{4,8}$/.test(otpRaw)) {
    return jsonResponse({ ok: false, error: 'invalid_otp' }, 400)
  }

  const targetHash = await hashWithSalt(emailRaw)
  const activeRes = await findActiveOtp('email', targetHash)
  if (!activeRes.ok) {
    if (activeRes.reason === 'not_found') {
      return jsonResponse({ ok: false, error: 'no_active_otp' }, 404)
    }
    if (activeRes.reason === 'misconfigured') {
      return jsonResponse({ ok: false, error: 'misconfigured' }, 500)
    }
    return jsonResponse({ ok: false, error: 'server_error' }, 500)
  }

  const record = activeRes.data

  // Attempt-limit check sebelum compare — walau attempts counter di-bump
  // SETELAH mismatch (lihat di bawah), guard ini mencegah brute-force
  // yang spam setelah threshold tercapai.
  if (record.attempts >= OTP_CONFIG.maxCheckAttempts) {
    return jsonResponse({ ok: false, error: 'too_many_attempts' }, 429)
  }

  const otpHashCandidate = await hashOtp(otpRaw)
  if (!timingSafeEqual(otpHashCandidate, record.otpHash)) {
    // Bump attempts (best-effort — kalau PATCH gagal tetap return mismatch).
    const nextAttempts = record.attempts + 1
    await incrementAttempt(record.id)
    const attemptsLeft = Math.max(0, OTP_CONFIG.maxCheckAttempts - nextAttempts)
    return jsonResponse(
      {
        ok: false,
        error: attemptsLeft === 0 ? 'too_many_attempts' : 'otp_mismatch',
        attemptsLeft,
      },
      attemptsLeft === 0 ? 429 : 400,
    )
  }

  // Sukses: mark verified + issue token.
  await markVerified(record.id)
  const token = await issueEmailVerifiedToken(targetHash)

  return jsonResponse({ ok: true, token })
}
