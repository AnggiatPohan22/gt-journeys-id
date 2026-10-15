/**
 * POST /api/bookings/request-change — Phase 4.69.9.
 *
 * Customer-side endpoint untuk request reschedule/cancel dari confirmation
 * page. Validate (ref, token) via lookup → rate-limit per IP → forward ke
 * CMS custom endpoint `/api/bookings/:id/customer-request`.
 *
 * Body: { bookingRef, accessToken, action: 'reschedule' | 'cancel', reason }
 *
 * Rate-limit: reuse `checkBookingRateLimit` (3 request/15 min per IP) —
 * sama dgn booking create. Alasan: request change jarang (max 1-2 per
 * booking), tapi tanpa limit attacker bisa spam untuk DOS admin.
 */

import type { APIRoute } from 'astro'
import { getBookingByRefAndToken } from '@lib/checkout/store'
import { checkBookingRateLimit, getClientIp, hashIp } from '@lib/checkout/rateLimit'
import { IS_PROD, requireEnvStrict } from '@lib/env'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = IS_PROD
  ? requireEnvStrict('PAYLOAD_API_KEY', import.meta.env.PAYLOAD_API_KEY)
  : import.meta.env.PAYLOAD_API_KEY || ''
const RL_SALT = import.meta.env.BOOKING_RL_SALT || 'dnj-booking-rl-salt'

export const prerender = false

function jsonError(code: string, status = 400, message?: string): Response {
  return new Response(JSON.stringify({ ok: false, error: code, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  // 1. Parse body.
  let body: {
    bookingRef?: string
    accessToken?: string
    action?: string
    reason?: string
  }
  try {
    body = await request.json()
  } catch {
    return jsonError('invalid_body', 400)
  }

  const bookingRef = (body.bookingRef ?? '').trim()
  const accessToken = (body.accessToken ?? '').trim().toLowerCase()
  const action = body.action
  const reason = (body.reason ?? '').trim()

  if (!bookingRef || !accessToken) return jsonError('missing_fields', 400)
  if (action !== 'reschedule' && action !== 'cancel') return jsonError('bad_action', 400)
  if (reason.length < 10) return jsonError('reason_too_short', 400, 'Alasan minimal 10 karakter.')
  if (reason.length > 500) return jsonError('reason_too_long', 400, 'Alasan maksimal 500 karakter.')

  // 2. Rate limit.
  const ip = getClientIp(request)
  const ipKey = await hashIp(ip, RL_SALT)
  if (!checkBookingRateLimit(ipKey)) {
    return jsonError('rate_limited', 429, 'Terlalu banyak request dari device ini. Coba lagi 15 menit lagi.')
  }

  // 3. Validate (ref, token).
  const booking = await getBookingByRefAndToken(bookingRef, accessToken)
  if (!booking) return jsonError('not_found', 404)

  // 4. Forward ke CMS custom endpoint.
  if (!CMS_URL || !API_KEY) return jsonError('misconfigured', 500)

  const url = `${CMS_URL.replace(/\/$/, '')}/api/bookings/${booking.id}/customer-request`
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `users API-Key ${API_KEY}`,
      },
      body: JSON.stringify({ kind: action, reason }),
    })
  } catch (e) {
    return jsonError('cms_unreachable', 502, (e as Error).message)
  }

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    error?: string
    message?: string
    newStatus?: string
  }

  if (!res.ok || !data.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: data.error ?? 'cms_error', message: data.message }),
      { status: res.status || 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ ok: true, newStatus: data.newStatus }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
