/**
 * OTP store — Phase 4.69.2.
 *
 * REST wrapper ke Payload collection `otp-verifications`. Pattern sama
 * dengan `store.ts` (bookings) & newsletter — auth via API-key, public
 * create tertutup di collection level.
 *
 * Operasi:
 *   - createOtp()      → tulis record baru (saat email-send dipanggil)
 *   - findActiveOtp()  → cari record aktif (unexpired, unverified) untuk target
 *   - incrementAttempt() → bump attempts counter (saat check gagal)
 *   - markVerified()   → set verifiedAt (saat check sukses)
 */

import { IS_PROD, requireEnvStrict } from '@lib/env'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = IS_PROD
  ? requireEnvStrict('PAYLOAD_API_KEY', import.meta.env.PAYLOAD_API_KEY)
  : import.meta.env.PAYLOAD_API_KEY || ''

export interface OtpRecord {
  id: number
  kind: 'email' | 'whatsapp'
  targetHash: string
  otpHash: string
  attempts: number
  expiresAt: string
  verifiedAt?: string | null
  ipHash?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOtpInput {
  kind: 'email' | 'whatsapp'
  targetHash: string
  otpHash: string
  expiresAt: string
  ipHash?: string
}

type StoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'misconfigured' | 'not_found' | 'server_error'; detail?: string }

function endpoint(path: string): string {
  return `${CMS_URL.replace(/\/$/, '')}${path}`
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${API_KEY}`,
  }
}

function configured(): boolean {
  return Boolean(CMS_URL && API_KEY)
}

export async function createOtp(input: CreateOtpInput): Promise<StoreResult<OtpRecord>> {
  if (!configured()) return { ok: false, reason: 'misconfigured' }
  try {
    const res = await fetch(endpoint('/api/otp-verifications'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...input, attempts: 0 }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, reason: 'server_error', detail: `${res.status}: ${body.slice(0, 200)}` }
    }
    const doc = await res.json().catch(() => ({}))
    return { ok: true, data: (doc?.doc ?? doc) as OtpRecord }
  } catch (err) {
    return { ok: false, reason: 'server_error', detail: (err as Error).message }
  }
}

/**
 * Cari OTP paling baru untuk target+kind yang masih aktif
 * (expiresAt > now AND verifiedAt null). Return `not_found` kalau tidak ada.
 */
export async function findActiveOtp(
  kind: 'email' | 'whatsapp',
  targetHash: string,
  now: Date = new Date(),
): Promise<StoreResult<OtpRecord>> {
  if (!configured()) return { ok: false, reason: 'misconfigured' }
  const query = new URLSearchParams({
    'where[kind][equals]': kind,
    'where[targetHash][equals]': targetHash,
    'where[verifiedAt][exists]': 'false',
    'where[expiresAt][greater_than]': now.toISOString(),
    sort: '-createdAt',
    limit: '1',
    depth: '0',
  })
  try {
    const res = await fetch(endpoint(`/api/otp-verifications?${query}`), {
      method: 'GET',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, reason: 'server_error', detail: `${res.status}: ${body.slice(0, 200)}` }
    }
    const data = await res.json().catch(() => ({}))
    const docs = (data?.docs ?? []) as OtpRecord[]
    if (docs.length === 0) return { ok: false, reason: 'not_found' }
    return { ok: true, data: docs[0] }
  } catch (err) {
    return { ok: false, reason: 'server_error', detail: (err as Error).message }
  }
}

/**
 * Panggil custom Payload endpoint. Payload v3 REST PATCH generic fail
 * di project ini ("Something went wrong") — pakai Local API via custom
 * endpoint `/api/otp-verifications/:id/<action>`.
 */
async function callCustom(id: number, action: 'mark-verified' | 'increment-attempt'): Promise<StoreResult<{ id: number }>> {
  if (!configured()) return { ok: false, reason: 'misconfigured' }
  try {
    const res = await fetch(endpoint(`/api/otp-verifications/${id}/${action}`), {
      method: 'POST',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, reason: 'server_error', detail: `${res.status}: ${body.slice(0, 200)}` }
    }
    const doc = await res.json().catch(() => ({}))
    return { ok: true, data: doc as { id: number } }
  } catch (err) {
    return { ok: false, reason: 'server_error', detail: (err as Error).message }
  }
}

export async function incrementAttempt(id: number): Promise<StoreResult<{ id: number }>> {
  return callCustom(id, 'increment-attempt')
}

export async function markVerified(id: number): Promise<StoreResult<{ id: number }>> {
  return callCustom(id, 'mark-verified')
}
