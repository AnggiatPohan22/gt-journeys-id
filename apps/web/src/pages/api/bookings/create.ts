/**
 * POST /api/bookings/create — Phase 4.62.
 *
 * Receives the Ferry Ticket checkout form, validates, creates a Booking
 * record via the Payload API (with `manual_wa` as default channel), and
 * redirects the customer to the confirmation page. Anti-spam:
 *   - honeypot field `website` must be empty
 *   - signed `formStamp` must verify AND be older than 3s / younger than 30m
 */

import type { APIRoute } from 'astro'
import { createBooking, generateBookingRef } from '@lib/checkout/store'
import { verifyFormStamp } from '@lib/checkout/signedToken'

export const prerender = false

interface CheckoutFormFields {
  slug: string
  ferryTicketId?: string
  customerName: string
  customerEmail?: string
  customerWhatsapp: string
  customerCountry?: string
  customerNotes?: string
  departureDate: string
  adults: number
  children: number
  originLocation?: string
  destinationLocation?: string
  scheduleTimeLabel?: string
  ferryClassName?: string
  ferryClassType?: string
  unitPrice?: number
  currency?: string
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function normalizePhone(v: string): string {
  return v.trim().replace(/[^\d+]/g, '')
}

function pickFields(form: FormData): CheckoutFormFields | null {
  const slug = String(form.get('slug') ?? '').trim()
  const name = String(form.get('customerName') ?? '').trim()
  const wa = String(form.get('customerWhatsapp') ?? '').trim()
  const date = String(form.get('departureDate') ?? '').trim()
  if (!slug || !name || name.length < 2 || !wa || !date) return null

  const email = String(form.get('customerEmail') ?? '').trim() || undefined
  if (email && !isEmail(email)) return null

  return {
    slug,
    ferryTicketId: String(form.get('ferryTicketId') ?? '').trim() || undefined,
    customerName: name.slice(0, 200),
    customerEmail: email,
    customerWhatsapp: normalizePhone(wa).slice(0, 40),
    customerCountry: (String(form.get('customerCountry') ?? '').trim() || undefined)?.slice(0, 100),
    customerNotes: (String(form.get('customerNotes') ?? '').trim() || undefined)?.slice(0, 1000),
    departureDate: date,
    adults: Math.max(1, Math.min(50, Number(form.get('adults') ?? 1) || 1)),
    children: Math.max(0, Math.min(50, Number(form.get('children') ?? 0) || 0)),
    originLocation: String(form.get('originLocation') ?? '').trim() || undefined,
    destinationLocation: String(form.get('destinationLocation') ?? '').trim() || undefined,
    scheduleTimeLabel: String(form.get('scheduleTimeLabel') ?? '').trim() || undefined,
    ferryClassName: String(form.get('ferryClassName') ?? '').trim() || undefined,
    ferryClassType: String(form.get('ferryClassType') ?? '').trim() || undefined,
    unitPrice: Number(form.get('unitPrice') ?? 0) || undefined,
    currency: (String(form.get('currency') ?? 'IDR').trim() || 'IDR').slice(0, 8),
  }
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData().catch(() => null)
  if (!form) return errorRedirect('/', 'invalid_body')

  const honeypot = String(form.get('website') ?? '').trim()
  if (honeypot) return redirect('/', 302)

  const stamp = String(form.get('formStamp') ?? '')
  const stampCheck = await verifyFormStamp(stamp)
  if (!stampCheck.ok) {
    const back = String(form.get('slug') ?? '')
      ? `/checkout/ferry-tickets/${String(form.get('slug'))}`
      : '/'
    return errorRedirect(back, `stamp_${stampCheck.reason}`)
  }

  const fields = pickFields(form)
  if (!fields) {
    const back = String(form.get('slug') ?? '')
      ? `/checkout/ferry-tickets/${String(form.get('slug'))}`
      : '/'
    return errorRedirect(back, 'invalid_fields')
  }

  const bookingRef = generateBookingRef('FT')
  const totalEstimate =
    fields.unitPrice ? fields.unitPrice * fields.adults + (fields.unitPrice / 2) * fields.children : undefined

  const result = await createBooking({
    bookingRef,
    serviceType: 'ferry-ticket',
    ferryTicket: fields.ferryTicketId ? (Number(fields.ferryTicketId) as unknown as number) : null,
    customerName: fields.customerName,
    customerEmail: fields.customerEmail ?? null,
    customerWhatsapp: fields.customerWhatsapp,
    customerCountry: fields.customerCountry ?? null,
    customerNotes: fields.customerNotes ?? null,
    departureDate: fields.departureDate,
    adults: fields.adults,
    children: fields.children,
    originLocation: fields.originLocation ?? null,
    destinationLocation: fields.destinationLocation ?? null,
    scheduleTimeLabel: fields.scheduleTimeLabel ?? null,
    ferryClassName: fields.ferryClassName ?? null,
    ferryClassType: fields.ferryClassType ?? null,
    unitPrice: fields.unitPrice ?? null,
    currency: fields.currency ?? 'IDR',
    totalEstimate: totalEstimate ?? null,
    status: 'pending',
    channel: 'manual_wa',
    channelData: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  } as any)

  if (!result.ok) {
    console.error('[bookings] create failed:', result)
    return errorRedirect(`/checkout/ferry-tickets/${fields.slug}`, `store_${result.reason}`)
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
