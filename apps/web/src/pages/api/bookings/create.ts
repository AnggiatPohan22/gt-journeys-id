/**
 * POST /api/bookings/create — Phase 4.62 → 4.63.
 *
 * Receives the Ferry Ticket checkout form (contact + passenger array),
 * validates, and creates a Booking record with default channel `manual_wa`.
 * Anti-spam: honeypot + signed formStamp (Phase 4.62) + IP rate-limit
 * (Phase 4.62.2).
 *
 * Passenger array (Phase 4.63): fields arrive as `passengers[N][key]` in
 * FormData. Server enforces: N === adults + children, firstName/lastName
 * present, passport expiry >= departure + 6 months when passport is filled.
 */

import type { APIRoute } from 'astro'
import { createBooking, generateBookingRef } from '@lib/checkout/store'
import { verifyFormStamp } from '@lib/checkout/signedToken'
import { checkBookingRateLimit, getClientIp } from '@lib/checkout/rateLimit'

export const prerender = false

interface Passenger {
  passengerType: 'adult' | 'child'
  title?: string | null
  gender?: string | null
  firstName: string
  lastName: string
  nationality?: string | null
  dateOfBirth?: string | null
  passportNumber?: string | null
  passportIssueDate?: string | null
  passportExpiryDate?: string | null
}

const PASSPORT_MIN_MONTHS_AFTER_DEPARTURE = 6

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function normalizePhone(v: string): string {
  return v.trim().replace(/[^\d+]/g, '')
}

function parsePassengers(form: FormData): Passenger[] | null {
  // Collect by index. Keys look like `passengers[0][firstName]`.
  const buckets = new Map<number, Record<string, string>>()
  const re = /^passengers\[(\d+)\]\[(\w+)\]$/
  for (const [k, v] of form.entries()) {
    const m = k.match(re)
    if (!m) continue
    const idx = Number(m[1])
    const field = m[2]
    if (!buckets.has(idx)) buckets.set(idx, {})
    buckets.get(idx)![field] = typeof v === 'string' ? v : ''
  }
  if (buckets.size === 0) return null

  const indices = [...buckets.keys()].sort((a, b) => a - b)
  const out: Passenger[] = []
  for (const i of indices) {
    const b = buckets.get(i)!
    const first = (b.firstName ?? '').trim()
    const last = (b.lastName ?? '').trim()
    if (!first || !last) return null // hard-required
    const type = b.passengerType === 'child' ? 'child' : 'adult'
    out.push({
      passengerType: type,
      title: (b.title ?? '').trim() || null,
      gender: (b.gender ?? '').trim() || null,
      firstName: first.slice(0, 80),
      lastName: last.slice(0, 80),
      nationality: (b.nationality ?? '').trim().slice(0, 60) || null,
      dateOfBirth: (b.dateOfBirth ?? '').trim() || null,
      passportNumber: (b.passportNumber ?? '').trim().slice(0, 30) || null,
      passportIssueDate: (b.passportIssueDate ?? '').trim() || null,
      passportExpiryDate: (b.passportExpiryDate ?? '').trim() || null,
    })
  }
  return out
}

function passportExpiryOk(passengers: Passenger[], departureDate: string): boolean {
  const dep = new Date(departureDate)
  if (isNaN(dep.getTime())) return false
  const min = new Date(dep)
  min.setMonth(min.getMonth() + PASSPORT_MIN_MONTHS_AFTER_DEPARTURE)
  for (const p of passengers) {
    if (!p.passportNumber) continue // rule only applies when passport supplied
    if (!p.passportExpiryDate) return false
    const exp = new Date(p.passportExpiryDate)
    if (isNaN(exp.getTime()) || exp < min) return false
  }
  return true
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData().catch(() => null)
  if (!form) return errorRedirect('/', 'invalid_body')

  const slug = String(form.get('slug') ?? '')
  const back = slug ? `/checkout/ferry-tickets/${slug}` : '/'

  // Honeypot — silent success.
  if (String(form.get('website') ?? '').trim()) return redirect('/', 302)

  // Rate-limit BEFORE HMAC.
  if (!checkBookingRateLimit(getClientIp(request))) {
    return errorRedirect(back, 'rate_limited')
  }

  // Time-trap / signed stamp.
  const stampCheck = await verifyFormStamp(String(form.get('formStamp') ?? ''))
  if (!stampCheck.ok) return errorRedirect(back, `stamp_${stampCheck.reason}`)

  // Contact fields.
  const name = String(form.get('customerName') ?? '').trim()
  const email = String(form.get('customerEmail') ?? '').trim()
  const region = String(form.get('contactPhoneRegion') ?? '').trim()
  const phone = String(form.get('contactPhone') ?? '').trim()
  const isWa = form.get('contactPhoneIsWhatsapp') === '1'
  const departureDate = String(form.get('departureDate') ?? '').trim()
  const adults = Math.max(1, Math.min(10, Number(form.get('adults') ?? 1) || 1))
  const children = Math.max(0, Math.min(6, Number(form.get('children') ?? 0) || 0))
  if (!slug || !name || name.length < 2 || !region || !phone || !departureDate || !email || !isEmail(email)) {
    return errorRedirect(back, 'invalid_fields')
  }
  // Phase 4.61.7 — defense-in-depth: reject past departure date. Client
  // date input already has `min={today}`, but a bypass would land here.
  {
    const today = new Date().toISOString().slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(departureDate) && departureDate < today) {
      return errorRedirect(back, 'past_departure_date')
    }
  }
  // Phase 4.64 — Round Trip guard: kalau field `return` dikirim (misal
  // dari widget filter atau bookmark), pastikan >= departureDate. Booking
  // flow round-trip (2 legs) diaktifkan di Phase 4.65 — di sini kita hanya
  // validate, tidak persist ke Booking record.
  {
    const tripType = String(form.get('trip') ?? '').trim()
    const returnDate = String(form.get('return') ?? '').trim()
    if (returnDate && /^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
      if (returnDate < departureDate) {
        return errorRedirect(back, 'return_before_departure')
      }
    } else if (tripType === 'round-trip' && !returnDate) {
      return errorRedirect(back, 'missing_return_date')
    }
  }
  const composedWa = normalizePhone(`${region}${phone}`).slice(0, 40)

  // Passengers.
  const passengers = parsePassengers(form)
  if (!passengers || passengers.length !== adults + children) {
    return errorRedirect(back, 'invalid_passengers')
  }
  if (!passportExpiryOk(passengers, departureDate)) {
    return errorRedirect(back, 'invalid_passport_expiry')
  }

  const unitPrice = Number(form.get('unitPrice') ?? 0) || undefined
  const currency = (String(form.get('currency') ?? 'IDR').trim() || 'IDR').slice(0, 8)
  const totalEstimate = unitPrice
    ? unitPrice * adults + (unitPrice / 2) * children
    : undefined

  const bookingRef = generateBookingRef('FT')
  const ferryTicketIdRaw = String(form.get('ferryTicketId') ?? '').trim()

  const result = await createBooking({
    bookingRef,
    serviceType: 'ferry-ticket',
    ferryTicket: ferryTicketIdRaw ? (Number(ferryTicketIdRaw) as unknown as number) : null,
    customerName: name.slice(0, 200),
    customerEmail: email,
    contactPhoneRegion: region.slice(0, 8),
    contactPhone: phone.slice(0, 30),
    contactPhoneIsWhatsapp: isWa,
    customerWhatsapp: composedWa,
    customerCountry: (String(form.get('customerCountry') ?? '').trim() || null)?.slice(0, 100),
    customerNotes: (String(form.get('customerNotes') ?? '').trim() || null)?.slice(0, 1000),
    departureDate,
    adults,
    children,
    originLocation: String(form.get('originLocation') ?? '').trim() || null,
    destinationLocation: String(form.get('destinationLocation') ?? '').trim() || null,
    scheduleTimeLabel: String(form.get('scheduleTimeLabel') ?? '').trim() || null,
    ferryClassName: String(form.get('ferryClassName') ?? '').trim() || null,
    ferryClassType: String(form.get('ferryClassType') ?? '').trim() || null,
    unitPrice: unitPrice ?? null,
    currency,
    totalEstimate: totalEstimate ?? null,
    status: 'pending',
    channel: 'manual_wa',
    channelData: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengers,
  } as any)

  if (!result.ok) {
    console.error('[bookings] create failed:', result)
    return errorRedirect(back, `store_${result.reason}`)
  }
  return redirect(`/checkout/ferry-tickets/confirmation/${bookingRef}`, 302)
}

function errorRedirect(path: string, code: string): Response {
  const sep = path.includes('?') ? '&' : '?'
  return new Response(null, {
    status: 302,
    headers: { Location: `${path}${sep}err=${encodeURIComponent(code)}` },
  })
}
