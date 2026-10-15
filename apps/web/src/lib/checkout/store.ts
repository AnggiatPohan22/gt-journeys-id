/**
 * Bookings store — Phase 4.62.
 *
 * Server-side wrapper around the Payload REST API for the `bookings`
 * collection. Mirrors the pattern in `@lib/newsletter/store.ts`: public
 * create is closed at the collection level, this module authenticates
 * with `PAYLOAD_API_KEY` (users.enableAPIKey) to write on the customer's
 * behalf.
 *
 * Phase 4.66.4 — tambah `getFerryForCheckout(id)` sebagai server-side
 * lookup dengan API key. Dipakai `/api/bookings/create` untuk recompute
 * price/currency/snapshot fields dari CMS truth (tidak dari hidden input
 * yang dikirim client, yang trusted → bisa tampered).
 */

import type { Booking, FerryTicket } from '@shared/types/payload-types'
import { requireEnvStrict, IS_PROD } from '@lib/env'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
// Phase 4.66.8 — fail-fast di production kalau API key kosong.
// Dev boleh kosong (fitur booking non-fungsional, tapi server tidak crash).
const API_KEY = IS_PROD
  ? requireEnvStrict('PAYLOAD_API_KEY', import.meta.env.PAYLOAD_API_KEY)
  : import.meta.env.PAYLOAD_API_KEY || ''

export type CreateBookingInput = Omit<
  Booking,
  'id' | 'createdAt' | 'updatedAt' | 'bookingRef'
> & { bookingRef: string }

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: 'misconfigured' | 'server_error'; detail?: string }

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  if (!CMS_URL || !API_KEY) return { ok: false, reason: 'misconfigured' }

  let res: Response
  try {
    res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `users API-Key ${API_KEY}`,
      },
      body: JSON.stringify(input),
    })
  } catch (err) {
    return { ok: false, reason: 'server_error', detail: (err as Error).message }
  }

  if (res.ok) {
    const doc = await res.json().catch(() => ({}))
    return { ok: true, booking: (doc?.doc ?? doc) as Booking }
  }

  const body = await res.text().catch(() => '')
  return { ok: false, reason: 'server_error', detail: `${res.status}: ${body.slice(0, 200)}` }
}

export async function getBookingByRef(ref: string): Promise<Booking | null> {
  if (!CMS_URL || !API_KEY) return null
  const url = new URL(`${CMS_URL.replace(/\/$/, '')}/api/bookings`)
  url.searchParams.set('where[bookingRef][equals]', ref)
  url.searchParams.set('limit', '1')
  url.searchParams.set('depth', '2')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `users API-Key ${API_KEY}` },
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return (data?.docs?.[0] as Booking) ?? null
}

/**
 * Phase 4.66.5 (finding S-02) — lookup booking berdasarkan (ref, token).
 * Confirmation page publik memakai ini alih-alih `getBookingByRef` sehingga
 * ref yang guessable saja tidak cukup untuk membuka booking. Compare
 * constant-time (via SubtleCrypto equal-length XOR loop pada byte).
 */
export async function getBookingByRefAndToken(
  ref: string,
  token: string,
): Promise<Booking | null> {
  if (!ref || !token) return null
  if (typeof token !== 'string' || !/^[0-9a-f]{32}$/i.test(token)) return null

  const booking = await getBookingByRef(ref)
  if (!booking) return null
  const stored = String((booking as { accessToken?: string }).accessToken ?? '')
  if (!stored || stored.length !== token.length) return null
  if (!constantTimeEqual(stored, token.toLowerCase())) return null
  return booking
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** 128-bit hex (32 chars). Aman untuk URL, tanpa symbol khusus. */
export function generateAccessToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

/**
 * Server-side fetch untuk 1 ferry ticket by numeric id — dipakai
 * `/api/bookings/create` untuk memverifikasi id dari client + ambil
 * pricing/currency/location authoritative. Menggunakan API-key user
 * (yang di-scope ke role admin) supaya konsisten dgn `createBooking`.
 * `depth=2` supaya origin/arrival location ter-populate ke nama.
 */
export async function getFerryForCheckout(id: number): Promise<FerryTicket | null> {
  if (!CMS_URL || !API_KEY) return null
  if (!Number.isFinite(id) || id <= 0) return null

  const url = `${CMS_URL.replace(/\/$/, '')}/api/ferry-tickets/${id}?depth=2`
  const res = await fetch(url, {
    headers: { Authorization: `users API-Key ${API_KEY}` },
  })
  if (!res.ok) return null
  const doc = await res.json().catch(() => null)
  return (doc as FerryTicket) ?? null
}

export function generateBookingRef(prefix = 'FT'): string {
  const now = new Date()
  const ymd =
    now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0')
  // 6 hex chars from crypto.randomUUID (available in Node & Workers)
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `${prefix}-${ymd}-${rand}`
}
