/**
 * Bookings store — Phase 4.62.
 *
 * Server-side wrapper around the Payload REST API for the `bookings`
 * collection. Mirrors the pattern in `@lib/newsletter/store.ts`: public
 * create is closed at the collection level, this module authenticates
 * with `PAYLOAD_API_KEY` (users.enableAPIKey) to write on the customer's
 * behalf.
 */

import type { Booking } from '@shared/types/payload-types'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = import.meta.env.PAYLOAD_API_KEY || ''

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
