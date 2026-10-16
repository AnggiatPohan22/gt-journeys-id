/**
 * POST /api/cron/anonymize-pii — Phase 4.74.4.2 (Stage 4.2).
 *
 * Anonymize passport PII (passportNumber, dateOfBirth, passportIssueDate,
 * passportExpiryDate) untuk booking dengan `departureDate < now - N months`.
 *
 * N default = 12 bulan (keputusan user Stage 4.2). Override via body
 * `{ monthsThreshold: 24 }` kalau perlu.
 *
 * Auth: Bearer header dgn `CRON_SECRET` (sama dengan cleanup-otp).
 *
 * Jadwal yang disarankan: weekly (Sunday 02:00 WITA). Harian overkill —
 * data retention bergerak lambat. Monthly juga OK (lebih hemat invocations).
 *
 * Flow:
 *   1. Verify Bearer header (constant-time).
 *   2. Call CMS /api/bookings/anonymize-pii via API-Key (role 'api' sejak
 *      Stage 4.1, atau admin kalau belum rotate).
 *   3. Loop sampai `hasMore=false` (safety cap: 10 batch × 100 = 1000
 *      booking per invocation).
 *   4. Return summary (dry-run reports scanned/anonymized tanpa write).
 *
 * Idempotent: endpoint CMS filter booking yang masih punya passport data,
 * jadi re-run tidak double-anonymize.
 *
 * Dry-run: body `{ dryRun: true }` → log yang akan di-anonymize tanpa write.
 * Pakai di staging sebelum go-live.
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

  // 2. Optional overrides dari body.
  let body: { monthsThreshold?: number; dryRun?: boolean; batchSize?: number } = {}
  try {
    body = await request.json()
  } catch {
    // Empty body OK — pakai default (12 bulan, non-dry-run, batch 100).
  }
  const monthsThreshold = Number.isFinite(body.monthsThreshold) ? body.monthsThreshold : 12
  const dryRun = body.dryRun === true
  const batchSize = Number.isFinite(body.batchSize) ? body.batchSize : 100

  // 3. Call CMS anonymize endpoint. Loop sampai hasMore=false.
  let totalAnonymized = 0
  let totalScanned = 0
  let batches = 0
  const maxBatches = 10 // safety cap: 10 × 100 = 1000 booking per invocation
  const errors: Array<{ id: string; error: string }> = []

  while (batches < maxBatches) {
    batches++
    let res: Response
    try {
      res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/bookings/anonymize-pii`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `users API-Key ${API_KEY}`,
        },
        body: JSON.stringify({ monthsThreshold, dryRun, batchSize }),
      })
    } catch (e) {
      return new Response(
        JSON.stringify({ ok: false, error: `cms-fetch-fail: ${(e as Error).message}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return new Response(
        JSON.stringify({ ok: false, status: res.status, body: text.slice(0, 500) }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      scanned?: number
      anonymized?: number
      hasMore?: boolean
      errors?: Array<{ id: string; error: string }>
    }
    totalScanned += data.scanned ?? 0
    totalAnonymized += data.anonymized ?? 0
    if (Array.isArray(data.errors)) errors.push(...data.errors)
    if (!data.hasMore) break
    if (dryRun) break // dry-run tidak modifikasi, hasMore permanent true → stop satu batch
  }

  return new Response(
    JSON.stringify({
      ok: true,
      dryRun,
      monthsThreshold,
      batches,
      scanned: totalScanned,
      anonymized: totalAnonymized,
      errors: errors.length > 0 ? errors : undefined,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
