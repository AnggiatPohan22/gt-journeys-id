/**
 * POST /api/bookings/create — Phase 4.62 → 4.63 → 4.66.4 → 4.67.2e.
 *
 * Receives the Ferry Ticket checkout form (contact + passenger array),
 * validates, and creates a Booking record with default channel `manual_wa`.
 * Anti-spam: honeypot + signed formStamp (Phase 4.62) + IP rate-limit
 * (Phase 4.62.2).
 *
 * Phase 4.67.2e — Round-trip 2-leg support:
 *   - `tripType=round-trip` triggers 2-leg flow: verify `returnFerryTicketId`
 *     via `getFerryForCheckout`, recompute `returnUnitPrice`/`returnTotalEstimate`
 *     dari CMS, snapshot `returnOrigin/DestinationLocation`,
 *     `returnScheduleTimeLabel`, `returnFerryClass*`.
 *   - Sanity check reverse route: return origin.id must equal outbound
 *     destination.id AND vice versa — reject `return_route_mismatch`.
 *   - Currency sanity: outbound + return harus sama currency (reject
 *     `return_currency_mismatch`). Audit §11 — multi-currency defer.
 *   - `totalEstimate` persist di DB = grand total (outbound + return).
 *   - Field return nullable di DB (schema 4.67.2a); one-way kirim null
 *     → zero impact.
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
import { verifyEmailVerifiedToken } from '@lib/checkout/emailVerifiedToken'
import { hashWithSalt } from '@lib/checkout/otp'
import { validatePassenger, detectDuplicatePassports } from '@lib/checkout/passengerValidation'

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

/**
 * Phase 4.71 — Compose `scheduleTimeLabel` dari FerryTickets.departureTime
 * + arrivalTime. FerryTickets collection TIDAK punya field `scheduleTimeLabel`
 * (field lama di-hide sejak Phase 4.61.6 → sekarang pakai single-schedule
 * `departureTime` + `arrivalTime` di scheduleOverview). Sebelum fix ini,
 * create endpoint baca `ferry.scheduleTimeLabel` yang always undefined →
 * Bookings.scheduleTimeLabel selalu null → waktu jam tidak muncul di CMS
 * dan email template.
 *
 * Separator: U+2192 "→" (pretty, HTML-safe). PDF renderer punya
 * `sanitizeForPdfText` yang convert → ke "->" untuk WinAnsi safety.
 */
function composeTimeLabel(dep: unknown, arr: unknown): string | null {
  const d = typeof dep === 'string' ? dep.trim() : ''
  const a = typeof arr === 'string' ? arr.trim() : ''
  if (!d && !a) return null
  if (d && a) return `${d} → ${a}`.slice(0, 100)
  return (d || a).slice(0, 100)
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
  // Preserve query params needed by checkout page frontmatter — kalau `date`
  // hilang dari URL, halaman checkout bounce balik ke detail page (ferry
  // classes). Rekonstruksi dari form data sendiri biar error flow tetap
  // mendarat di checkout, bukan di listing/detail.
  const backParams = new URLSearchParams()
  const dateForBack = String(form.get('departureDate') ?? '').trim()
  const adultsForBack = String(form.get('adults') ?? '').trim()
  const childrenForBack = String(form.get('children') ?? '').trim()
  const classForBack = String(form.get('ferryClassType') ?? '').trim()
  const tripForBack = String(form.get('tripType') ?? '').trim()
  const returnDateForBack = String(form.get('returnDate') ?? '').trim()
  const returnFerryIdForBack = String(form.get('returnFerryTicketId') ?? '').trim()
  const returnSlugForBack = String(form.get('returnTicketSlug') ?? '').trim()
  const returnClassForBack = String(form.get('returnFerryClassType') ?? '').trim()
  if (dateForBack) backParams.set('date', dateForBack)
  if (adultsForBack) backParams.set('adults', adultsForBack)
  if (childrenForBack) backParams.set('children', childrenForBack)
  if (classForBack) backParams.set('class', classForBack)
  if (tripForBack === 'round-trip') {
    backParams.set('tripType', 'round-trip')
    if (returnDateForBack) backParams.set('returnDate', returnDateForBack)
    if (returnFerryIdForBack) backParams.set('returnFerryTicketId', returnFerryIdForBack)
    if (returnSlugForBack) backParams.set('returnTicketSlug', returnSlugForBack)
    if (returnClassForBack) backParams.set('returnFerryClassType', returnClassForBack)
  }
  const backQs = backParams.toString()
  const back = slug ? `/checkout/ferry-tickets/${slug}${backQs ? '?' + backQs : ''}` : '/'

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

  // Phase 4.69.3 — Email verification wall. Reject kalau token tidak ada,
  // signature invalid, expired, atau targetHash tidak match customerEmail
  // (customer edit email setelah verify → UI reset tapi defense-in-depth).
  const emailToken = String(form.get('emailVerifiedToken') ?? '').trim()
  if (!emailToken) {
    return errorRedirect(back, 'email_not_verified')
  }
  const tokenCheck = await verifyEmailVerifiedToken(emailToken)
  if (!tokenCheck.ok) {
    return errorRedirect(back, tokenCheck.reason === 'expired' ? 'email_verification_expired' : 'email_not_verified')
  }
  const emailTargetHash = await hashWithSalt(email)
  if (emailTargetHash !== tokenCheck.targetHash) {
    return errorRedirect(back, 'email_mismatch')
  }
  // Phase 4.61.7 — defense-in-depth: reject past departure date. Client
  // date input already has `min={today}`, but a bypass would land here.
  {
    const today = new Date().toISOString().slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(departureDate) && departureDate < today) {
      return errorRedirect(back, 'past_departure_date')
    }
  }
  // Phase 4.67.2e — Round-trip tripType parse (full 2-leg validation
  // dilakukan setelah outbound ferry resolved di bawah).
  const tripType = String(form.get('tripType') ?? form.get('trip') ?? 'one-way').trim()
  const isRoundTrip = tripType === 'round-trip'
  const returnDate = String(form.get('returnDate') ?? form.get('return') ?? '').trim()
  if (isRoundTrip) {
    if (!returnDate || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
      return errorRedirect(back, 'missing_return_date')
    }
    if (returnDate < departureDate) {
      return errorRedirect(back, 'return_before_departure')
    }
    const todayISO = new Date().toISOString().slice(0, 10)
    if (returnDate < todayISO) {
      return errorRedirect(back, 'past_return_date')
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

  // Phase 4.69.4 — passenger inline validation (passport format, DOB vs
  // passenger type, issue vs today/dob, expiry > issue, duplicate passport).
  const inlineIssues = passengers.flatMap((p, i) =>
    validatePassenger(p, i, departureDate),
  )
  const dupIssues = detectDuplicatePassports(passengers)
  const allIssues = [...inlineIssues, ...dupIssues]
  if (allIssues.length > 0) {
    // Encode kode issue pertama supaya UI bisa menunjukkan field spesifik.
    // (UI utama tetap melakukan client-side validation yang menampilkan
    // seluruh daftar issue — ini guard SSOT kalau client di-bypass.)
    const first = allIssues[0]
    return errorRedirect(back, `passenger_${first.code}`)
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
  // Phase 4.71 — Compose dari departureTime + arrivalTime (FerryTickets
  // tidak punya field scheduleTimeLabel; lihat composeTimeLabel helper).
  const scheduleTimeLabel = composeTimeLabel(
    (ferry as any).departureTime,
    (ferry as any).arrivalTime,
  )

  // ── Phase 4.67.2e — Return ferry verify + recompute (round-trip only) ──
  // Semua snapshot ambil dari CMS (never trust hidden input price/class
  // dari client). Sanity check reverse route: return origin == outbound
  // destination, dan sebaliknya. Pola mirror outbound guard 4.66.4.
  const locationId = (rel: unknown): number | null => {
    if (typeof rel === 'number') return rel
    if (rel && typeof rel === 'object' && typeof (rel as any).id === 'number') return (rel as any).id
    return null
  }
  let returnFerry: any = null
  let returnUnitPrice: number | null = null
  let returnChildUnit = 0
  let returnTotalEstimate = 0
  let returnOriginName: string | null = null
  let returnDestinationName: string | null = null
  let returnScheduleTimeLabel: string | null = null
  let returnClassName: string | null = null
  let returnClassType: string | null = null
  const returnFerryIdRaw = String(form.get('returnFerryTicketId') ?? '').trim()
  const returnTicketSlug = String(form.get('returnTicketSlug') ?? '').trim()
  const requestedReturnClassType = String(form.get('returnFerryClassType') ?? '').trim().slice(0, 30)

  if (isRoundTrip) {
    const returnFerryId = Number(returnFerryIdRaw)
    if (!returnFerryIdRaw || !Number.isFinite(returnFerryId) || returnFerryId <= 0) {
      return errorRedirect(back, 'invalid_return_ferry')
    }
    returnFerry = await getFerryForCheckout(returnFerryId)
    if (!returnFerry || (returnFerry as any).status && (returnFerry as any).status !== 'published') {
      return errorRedirect(back, 'return_ferry_not_found')
    }
    // Slug match (attacker swap id-only). Compare only kalau slug dikirim.
    if (returnTicketSlug && typeof (returnFerry as any).slug === 'string' && (returnFerry as any).slug !== returnTicketSlug) {
      return errorRedirect(back, 'return_ferry_slug_mismatch')
    }
    const returnClassesRaw = Array.isArray((returnFerry as any).ferryClasses) ? (returnFerry as any).ferryClasses : []
    if (returnClassesRaw.length === 0) {
      return errorRedirect(back, 'return_ferry_no_class')
    }
    const returnSorted = returnClassesRaw
      .slice()
      .sort((a: any, b: any) => (a.adultPrice ?? 0) - (b.adultPrice ?? 0))
    const rCls = returnSorted.find((c: any) => c.classType === requestedReturnClassType) ?? returnSorted[0]
    if (!rCls || typeof rCls.adultPrice !== 'number' || rCls.adultPrice < 0) {
      return errorRedirect(back, 'return_ferry_no_price')
    }

    // Sanity check reverse route — pakai location.id perbandingan.
    // Skip kalau salah satu location null (legacy data tanpa relationship).
    const outboundOriginId = locationId((ferry as any).originLocation)
    const outboundDestId   = locationId((ferry as any).arrivalLocation)
    const returnOriginId   = locationId((returnFerry as any).originLocation)
    const returnDestId     = locationId((returnFerry as any).arrivalLocation)
    if (outboundOriginId != null && outboundDestId != null && returnOriginId != null && returnDestId != null) {
      if (returnOriginId !== outboundDestId || returnDestId !== outboundOriginId) {
        return errorRedirect(back, 'return_route_mismatch')
      }
    }

    returnUnitPrice = rCls.adultPrice
    returnChildUnit =
      typeof rCls.childPrice === 'number' && rCls.childPrice >= 0
        ? rCls.childPrice
        : Math.round(returnUnitPrice! / 2)
    // Guard beda currency outbound vs return (audit §11): reject.
    const rCurrency: string = (typeof rCls.currency === 'string' ? rCls.currency : 'IDR').slice(0, 8)
    if (rCurrency !== currency) {
      return errorRedirect(back, 'return_currency_mismatch')
    }
    returnTotalEstimate = returnUnitPrice! * adults + returnChildUnit * children
    returnOriginName =
      resolveLocation((returnFerry as any).originLocation, (returnFerry as any).origin)?.name ?? null
    returnDestinationName =
      resolveLocation((returnFerry as any).arrivalLocation, (returnFerry as any).arrival)?.name ?? null
    // Phase 4.71 — Mirror outbound (see composeTimeLabel helper).
    returnScheduleTimeLabel = composeTimeLabel(
      (returnFerry as any).departureTime,
      (returnFerry as any).arrivalTime,
    )
    returnClassName = typeof rCls.name === 'string' ? rCls.name.slice(0, 100) : null
    returnClassType = typeof rCls.classType === 'string' ? rCls.classType : null
  }

  // Grand total = outbound + return (0 kalau one-way).
  const grandTotal = totalEstimate + returnTotalEstimate

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
    totalEstimate: grandTotal,
    // Phase 4.67.2e — Round-trip persistence (null kalau one-way).
    tripType: isRoundTrip ? 'round-trip' : 'one-way',
    returnDate: isRoundTrip ? returnDate : null,
    returnFerryTicket: isRoundTrip && returnFerry ? ((returnFerry as any).id as number) : null,
    returnOriginLocation: returnOriginName,
    returnDestinationLocation: returnDestinationName,
    returnScheduleTimeLabel,
    returnFerryClassName: returnClassName,
    returnFerryClassType: returnClassType,
    returnUnitPrice,
    returnTotalEstimate: isRoundTrip ? returnTotalEstimate : null,
    // Phase 4.69.5 — default booking baru = awaiting_review (admin verify tanggal/kuota
    // sebelum kirim invoice ke customer via Phase 4.69.7).
    status: 'awaiting_review',
    channel: 'manual_wa',
    channelData: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengers,
    // Phase 4.69.3 + 4.69.5 — emailVerifiedToken sudah diverifikasi di guard
    // di atas (stamp + token + targetHash match customerEmail). Simpan
    // timestamp verifikasi untuk audit trail.
    emailVerifiedAt: new Date().toISOString(),
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
