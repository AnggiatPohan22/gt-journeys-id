/**
 * POST /api/bookings/:ref/submit-payment-proof — Phase 4.74.2.
 *
 * Customer self-service upload bukti transfer. Replace jalur manual
 * "customer kirim ke WA admin" yang human-error prone.
 *
 * Flow:
 *   1. Verify token (`?t=<accessToken>`) via `getBookingByRefAndToken`
 *      — reuse pola 4.66.5. Mismatch → 404 (jangan reveal apakah ref ada).
 *   2. Rate-limit per IP+ref (bucket `payment_proof:<hash>:<ref>`, 3/15min,
 *      reuse `checkBookingRateLimit`).
 *   3. Status gate: booking.status harus `awaiting_payment` OR
 *      `payment_review` (allow resubmit setelah reject). Lainnya → 409.
 *   4. Soft-cap `paymentProofAttempts >= 3` → 429 "too_many_attempts"
 *      (customer harus hubungi admin via WA fallback).
 *   5. Parse multipart form:
 *      - senderName, senderBank, amount, transferDate, transferTime?, customerNote?
 *      - proofFile: validasi MIME whitelist + size max 5MB.
 *   6. Upload file ke `media` → dapat `mediaId`.
 *   7. Create `payment-proofs` record (status=pending).
 *      Hook afterChange di CMS akan:
 *        - Update bookings.latestPaymentProof + bump paymentProofAttempts.
 *        - Transition booking.status → `payment_review`.
 *        - Create AdminNotifications `payment_proof_submitted`.
 *   8. Return {ok: true, paymentProofId, redirectUrl: /payment/<ref>/success}.
 *
 * Rejection codes (JSON body + 4xx):
 *   - `unauthorized`      — token missing/invalid
 *   - `rate_limited`      — IP+ref over 3 submissions/15min
 *   - `too_many_attempts` — paymentProofAttempts >= 3 (soft cap)
 *   - `wrong_status`      — booking tidak di awaiting_payment/payment_review
 *   - `missing_field`     — field required kosong
 *   - `invalid_amount`    — amount <= 0 atau mismatch > 20% dari totalEstimate
 *   - `invalid_file`      — MIME tidak di whitelist
 *   - `file_too_large`    — > 5MB
 *   - `server_error`      — upload/create gagal di CMS
 */

import type { APIRoute } from 'astro'
import { getBookingByRefAndToken } from '@lib/checkout/store'
import { uploadProofFileToMedia, createPaymentProof } from '@lib/checkout/paymentProofStore'
import { checkBookingRateLimit, getClientIp, hashIp } from '@lib/checkout/rateLimit'
import { stripExifIfJpeg } from '@lib/checkout/exifStrip'

export const prerender = false

const RL_SALT = import.meta.env.BOOKING_RL_SALT || 'dnj-booking-rl-salt'

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_ATTEMPTS = 3

const ALLOWED_STATUSES_FOR_SUBMIT = new Set(['awaiting_payment', 'payment_review'])

function jsonErr(code: string, message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: code, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const POST: APIRoute = async ({ request, params, url }) => {
  const ref = String(params.ref ?? '').trim()
  const token = url.searchParams.get('t') ?? ''

  if (!ref || !token) {
    return jsonErr('unauthorized', 'Missing booking reference or access token.', 401)
  }

  // ─── Rate-limit (before DB lookup) ───
  const ip = getClientIp(request)
  const ipHash = await hashIp(ip, RL_SALT)
  const rlKey = `payment_proof:${ipHash}:${ref}`
  if (!checkBookingRateLimit(rlKey)) {
    return jsonErr('rate_limited', 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.', 429)
  }

  // ─── Token verify + booking lookup ───
  const booking = await getBookingByRefAndToken(ref, token)
  if (!booking) {
    // Keep message generic — don't reveal whether ref exists.
    return jsonErr('unauthorized', 'Link bukti transfer tidak valid atau sudah expired.', 401)
  }

  // ─── Status gate ───
  const status = String((booking as { status?: string }).status ?? '')
  if (!ALLOWED_STATUSES_FOR_SUBMIT.has(status)) {
    return jsonErr(
      'wrong_status',
      `Booking status "${status}" tidak menerima upload bukti saat ini. Hubungi admin via WhatsApp.`,
      409,
    )
  }

  // ─── Attempts soft cap ───
  const attempts = Number((booking as { paymentProofAttempts?: number }).paymentProofAttempts ?? 0)
  if (attempts >= MAX_ATTEMPTS) {
    return jsonErr(
      'too_many_attempts',
      `Sudah ${attempts}x upload — hubungi admin via WhatsApp untuk follow-up manual.`,
      429,
    )
  }

  // ─── Parse multipart ───
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return jsonErr('invalid_file', 'Form data tidak valid (bukan multipart).', 400)
  }

  const senderName = String(form.get('senderName') ?? '').trim()
  const senderBank = String(form.get('senderBank') ?? '').trim()
  const amountRaw = String(form.get('amount') ?? '').trim()
  const customerNote = String(form.get('customerNote') ?? '').trim().slice(0, 500) || undefined
  const file = form.get('proofFile')

  if (!senderName) return jsonErr('missing_field', 'Nama pengirim wajib diisi.', 400)
  if (!senderBank) return jsonErr('missing_field', 'Bank asal wajib diisi.', 400)
  if (!amountRaw) return jsonErr('missing_field', 'Nominal transfer wajib diisi.', 400)

  // Phase 4.74.6b — Auto-fill transferDate + transferTime di server (bukan
  // dari form customer). Reduce fraud / typo / sengaja mengakalin waktu
  // yang tidak sync dgn bukti transfer. Format WITA (Asia/Makassar) biar
  // konsisten dgn timezone operasional.
  const nowServer = new Date()
  const transferDate = nowServer.toISOString().slice(0, 10) // YYYY-MM-DD UTC
  const transferTime = (() => {
    try {
      const fmt = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      return fmt.format(nowServer)
    } catch {
      return nowServer.toISOString().slice(11, 16)
    }
  })()

  const amount = Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonErr('invalid_amount', 'Nominal transfer tidak valid.', 400)
  }

  // Soft tolerance: amount boleh beda ±20% dari totalEstimate (biaya transfer,
  // kembalian, dsb.). Beda > 20% kemungkinan typo → reject supaya admin tak
  // perlu reconcile besar.
  const expected = Number((booking as { totalEstimate?: number }).totalEstimate ?? 0)
  if (expected > 0) {
    const diff = Math.abs(amount - expected) / expected
    if (diff > 0.2) {
      return jsonErr(
        'invalid_amount',
        `Nominal transfer (${amount}) beda > 20% dari total booking (${expected}). Periksa kembali.`,
        400,
      )
    }
  }

  // ─── File validation ───
  if (!(file instanceof File)) {
    return jsonErr('invalid_file', 'File bukti transfer wajib di-upload.', 400)
  }
  if (file.size <= 0) {
    return jsonErr('invalid_file', 'File bukti transfer kosong.', 400)
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return jsonErr('file_too_large', 'Ukuran file maksimal 5MB.', 413)
  }
  const mime = (file.type || '').toLowerCase()
  if (!ALLOWED_MIME.has(mime)) {
    return jsonErr('invalid_file', `Format file ${mime || '(unknown)'} tidak didukung. Gunakan JPG/PNG/WebP/PDF.`, 400)
  }

  // ─── EXIF strip (Phase 4.74.6) — drop GPS/device metadata dari JPEG
  // sebelum simpan. Non-JPEG passthrough. Fail-safe: return original kalau
  // parse error.
  const cleanedFile = await stripExifIfJpeg(file)

  // ─── Upload file → media ───
  const uploaded = await uploadProofFileToMedia(cleanedFile, `Payment proof ${ref}`)
  if (!uploaded.ok) {
    return jsonErr(
      'server_error',
      `Upload file gagal: ${uploaded.detail ?? uploaded.reason}`,
      500,
    )
  }

  // ─── Create payment-proof record ───
  const bookingId = Number((booking as { id?: number }).id ?? 0)
  if (!bookingId) {
    return jsonErr('server_error', 'Booking id tidak valid.', 500)
  }

  const created = await createPaymentProof({
    booking: bookingId,
    bookingRefSnapshot: ref,
    senderName,
    senderBank,
    amount,
    currency: String((booking as { currency?: string }).currency ?? 'IDR'),
    transferDate,
    transferTime,
    proofFile: uploaded.id,
    customerNote,
    submittedAt: new Date().toISOString(),
    submittedFromIpHash: ipHash,
    submittedUserAgent: (request.headers.get('user-agent') ?? '').slice(0, 500),
  })
  if (!created.ok) {
    return jsonErr(
      'server_error',
      `Simpan bukti gagal: ${created.detail ?? created.reason}`,
      500,
    )
  }

  // Success — redirect ke success page (hook di CMS urus booking.status + AdminNotif).
  return new Response(
    JSON.stringify({
      ok: true,
      paymentProofId: created.id,
      redirectUrl: `/payment/${encodeURIComponent(ref)}/success?t=${encodeURIComponent(token)}`,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    },
  )
}
