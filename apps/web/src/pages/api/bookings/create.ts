/**
 * POST /api/bookings/create — Phase 4.62 → 4.63 → 4.66.4.
 *
 * Receives the Ferry Ticket checkout form (contact + passenger array),
 * validates, and creates a Booking record with default channel `manual_wa`.
 * Anti-spam: honeypot + signed formStamp (Phase 4.62) + IP rate-limit
 * (Phase 4.62.2).
 *
 * Passenger array (Phase 4.63): fields arrive as `passengers[N][key]` in
 * FormData. Server enforces: N === adults + children, firstName/lastName
 * present, passport expiry >= departure + 6 months when passport is filled.
 *
 * Phase 4.66.4 — Server recompute price/currency/snapshot dari CMS
 * (finding S-03 + S-06). `ferryTicketId` sekarang WAJIB dan diverifikasi:
 *   1. Ada di CMS + status published.
 *   2. `ferryClassType` dari hidden input harus match salah satu
 *      `ferryClasses[].classType` di ferry itu — kalau tidak, pakai class
 *      pertama (yang termurah sesuai sort di detail page).
 *   3. `unitPrice`, `childPrice`, `currency`, `ferryClassName`,
 *      `originLocation`, `destinationLocation`, `scheduleTimeLabel`
 *      SEMUA di-overwrite dari record CMS — hidden input diabaikan.
 *   4. `totalEstimate` = adults*unitPrice + children*childPrice (childPrice
 *      fallback ke unitPrice/2 kalau tidak diset di CMS).
 * Konsekuensi: attacker yang kirim `unitPrice=1` tidak berhasil.
 */

import type { APIRoute } from 'astro'
import { createBooking, generateBookingRef, generateAccessToken, getFerryForCheckout } from '@lib/checkout/store'
import { verifyFormStamp } from '@lib/checkout/signedToken'
import { checkBookingRateLimit, getClientIp, hashIp } from '@lib/checkout/rateLimit'
import { resolveLocation } from '@lib/location'

// Phase 4.66.9 — rate-limit key = salted-hash IP (bukan raw IP) supaya
// map key tidak bocor identitas visitor. Salt di-baca dari env; fall
// back ke konstanta dev (bukan security-critical secret).
const RL_SALT = import.meta.env.BOOKING_RL_SALT || 'dnj-booking-rl-salt'

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

  // Rate-limit BEFORE HMAC. Phase 4.66.9 — bucket = hash(salt, ip).
  const ipHash = await hashIp(getClientIp(request), RL_SALT)
  if (!checkBookingRateLimit(ipHash)) {
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

  // ── Phase 4.66.4 — verifikasi ferry + recompute pricing dari CMS ─────
  const ferryTicketIdRaw = String(form.get('ferryTicketId') ?? '').trim()
  const ferryTicketId = Number(ferryTicketIdRaw)
  if (!ferryTicketIdRaw || !Number.isFinite(ferryTicketId) || ferryTicketId <= 0) {
    return errorRedirect(back, 'invalid_ferry')
  }
  const ferry = await getFerryForCheckout(ferryTicketId)
  if (!ferry || (ferry as any).status && (ferry as any).status !== 'published') {
    return errorRedirect(back, 'ferry_not_found')
  }
  // Confirm the slug we routed with actually belongs to this ferry — cheap
  // guard against ID/slug mismatch (attacker swaps id but keeps slug).
  if (typeof (ferry as any).slug === 'string' && (ferry as any).slug !== slug) {
    return errorRedirect(back, 'ferry_slug_mismatch')
  }

  const ferryClassesRaw = Array.isArray((ferry as any).ferryClasses) ? (ferry as any).ferryClasses : []
  if (ferryClassesRaw.length === 0) {
    return errorRedirect(back, 'ferry_no_class')
  }
  // Sort like the checkout page does (cheapest first) so "fallback to first"
  // stays deterministic.
  const sortedClasses = ferryClassesRaw
    .slice()
    .sort((a: any, b: any) => (a.adultPrice ?? 0) - (b.adultPrice ?? 0))
  const requestedClassType = String(form.get('ferryClassType') ?? '').trim().slice(0, 30)
  const cls = sortedClasses.find((c: any) => c.classType === requestedClassType) ?? sortedClasses[0]
  if (!cls || typeof cls.adultPrice !== 'number' || cls.adultPrice < 0) {
    return errorRedirect(back, 'ferry_no_price')
  }

  const unitPrice: number = cls.adultPrice
  const childUnit: number =
    typeof cls.childPrice === 'number' && cls.childPrice >= 0
      ? cls.childPrice
      : Math.round(unitPrice / 2)
  const currency: string = (typeof cls.currency === 'string' ? cls.currency : 'IDR').slice(0, 8)
  const totalEstimate = unitPrice * adults + childUnit * children

  const originName =
    resolveLocation((ferry as any).originLocation, (ferry as any).origin)?.name ?? null
  const destinationName =
    resolveLocation((ferry as any).arrivalLocation, (ferry as any).arrival)?.name ?? null
  const scheduleTimeLabel =
    typeof (ferry as any).scheduleTimeLabel === 'string' && (ferry as any).scheduleTimeLabel.trim()
      ? String((ferry as any).scheduleTimeLabel).slice(0, 100)
      : null

  const bookingRef = generateBookingRef('FT')
  const accessToken = generateAccessToken()

  const result = await createBooking({
    bookingRef,
    accessToken,
    serviceType: 'ferry-ticket',
    ferryTicket: ferryTicketId as unknown as number,
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
    originLocation: originName,
    destinationLocation: destinationName,
    scheduleTimeLabel,
    ferryClassName: typeof cls.name === 'string' ? cls.name.slice(0, 100) : null,
    ferryClassType: typeof cls.classType === 'string' ? cls.classType : null,
    unitPrice,
    currency,
    totalEstimate,
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
  // Phase 4.66.5 — URL konfirmasi mengandung accessToken (capability).
  // Tanpa `?t=<token>` yang valid, halaman `/confirmation/<ref>` → 404.
  return redirect(
    `/checkout/ferry-tickets/confirmation/${bookingRef}?t=${encodeURIComponent(accessToken)}`,
    302,
  )
}

function errorRedirect(path: string, code: string): Response {
  const sep = path.includes('?') ? '&' : '?'
  return new Response(null, {
    status: 302,
    headers: { Location: `${path}${sep}err=${encodeURIComponent(code)}` },
  })
}
