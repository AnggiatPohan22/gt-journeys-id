/**
 * POST /api/cron/cleanup-otp — Phase 4.69.10.
 *
 * Scheduled OTP cleanup. Dipanggil external cron (Cloudflare Cron Trigger
 * via Worker binding, GitHub Actions schedule, Cronhub, dsb). Weekly
 * disarankan (Sunday 02:00 UTC): tiap OTP record TTL = 10 menit, 7 hari
 * grace = window audit admin.
 *
 * Auth: Bearer header dgn `CRON_SECRET`. Secret di-set di env Cloudflare
 * Pages + di sisi cron caller (identical). Constant-time compare untuk
 * mitigate timing attack.
 *
 * Flow:
 *   1. Verify Bearer header.
 *   2. Call CMS /api/otp-verifications/cleanup via API-Key.
 *   3. Return summary ke caller.
 *
 * Idempotent: cron bisa jalan ulang kapan saja tanpa side-effect selain
 * cleanup records lama.
 */

import type { APIRoute } from 'astro'
import { IS_PROD, requireEnvStrict } from '@lib/env'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = IS_PROD
  ? requireEnvStrict('PAYLOAD_API_KEY', import.meta.env.PAYLOAD_API_KEY)
  : import.meta.env.PAYLOAD_API_KEY || ''
const CRON_SECRET = IS_PROD
  ? requireEnvStrict('CRON_SECRET', import.meta.env.CRON_SECRET)
  : import.meta.env.CRON_SECRET || ''

export const prerender = false

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export const POST: APIRoute = async ({ request }) => {
  // 1. Auth: Bearer header must match CRON_SECRET.
  const auth = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${CRON_SECRET}`
  if (!CRON_SECRET || !auth || !constantTimeEqual(auth, expected)) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!CMS_URL || !API_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Optional graceDays dari body.
  let body: { graceDays?: number } = {}
  try {
    body = await request.json()
  } catch {
    // Empty body OK — use default.
  }
  const graceDays = Number.isFinite(body.graceDays) ? body.graceDays : 7

  // 3. Call CMS cleanup endpoint. Loop sampai hasMore=false (batch 1000/call).
  let totalDeleted = 0
  let batches = 0
  const maxBatches = 10 // safety cap: 10 x 1000 = 10k per invocation

  while (batches < maxBatches) {
    batches++
    let res: Response
    try {
      res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/otp-verifications/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `users API-Key ${API_KEY}`,
        },
        body: JSON.stringify({ graceDays }),
      })
    } catch (e) {
      return new Response(
        JSON.stringify({ ok: false, error: 'cms_unreachable', message: (e as Error).message, totalDeleted, batches }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      deleted?: number
      hasMore?: boolean
      error?: string
    }

    if (!res.ok || !data.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: data.error ?? 'cms_error', totalDeleted, batches }),
        { status: res.status || 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    totalDeleted += data.deleted ?? 0
    if (!data.hasMore) break
  }

  return new Response(
    JSON.stringify({ ok: true, totalDeleted, batches, graceDays }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

/**
 * GET /api/cron/cleanup-otp — reserved untuk health-check cron caller
 * (biar cron service verifikasi endpoint hidup tanpa trigger cleanup).
 */
export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${CRON_SECRET}`
  if (!CRON_SECRET || !auth || !constantTimeEqual(auth, expected)) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ ok: true, service: 'cleanup-otp', ready: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
