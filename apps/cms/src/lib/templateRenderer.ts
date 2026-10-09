/**
 * Template renderer — Phase 4.69.7 (CMS side).
 *
 * MIRROR dari `apps/web/src/lib/checkout/templateRenderer.ts`. Dua copy
 * ditempatkan intentional (zero shared workspace dep di CMS saat ini).
 * Kalau salah satu diubah, update dua-duanya. SSOT = file di `apps/web`.
 *
 * Pure function, no side-effect — aman di-run di Payload custom endpoint
 * (admin "Send Payment Instructions" button, Phase 4.69.7).
 */

export type TemplateContext = Record<string, string | number | null | undefined>

export const KNOWN_VARIABLES = new Set<string>([
  // Booking
  'bookingRef',
  'accessToken',
  'confirmationUrl',
  // Customer
  'customerName',
  'customerEmail',
  'customerWhatsapp',
  'customerCountry',
  // Trip
  'tripType',
  'departureDate',
  'returnDate',
  'originLocation',
  'destinationLocation',
  'ferryClassName',
  'adults',
  'children',
  'passengerList',
  // Pricing
  'unitPrice',
  'totalEstimate',
  'currency',
  // Payment
  'bankAccountsBlock',
  'paymentDeadline',
  // Admin
  'adminName',
  'adminWhatsapp',
  // OTP (template-specific)
  'otp',
  'otpTtlMinutes',
])

export const OPTIONAL_VARIABLES = new Set<string>([
  'returnDate',
  'customerCountry',
  'customerEmail',
  'customerWhatsapp',
  'confirmationUrl',
  'accessToken',
])

export interface RenderResult {
  ok: boolean
  rendered: string
  errors: string[]
}

const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g

export function extractVariables(template: string): string[] {
  const names = new Set<string>()
  let m: RegExpExecArray | null
  const re = new RegExp(VAR_RE.source, 'g')
  while ((m = re.exec(template)) !== null) {
    names.add(m[1])
  }
  return [...names]
}

export function renderTemplate(template: string, ctx: TemplateContext): RenderResult {
  const errors: string[] = []
  const used = extractVariables(template)

  for (const name of used) {
    if (!KNOWN_VARIABLES.has(name)) {
      errors.push(`Variable "{{${name}}}" tidak dikenal engine. Lihat tab "Variables Reference".`)
      continue
    }
    const v = ctx[name]
    const empty = v === null || v === undefined || (typeof v === 'string' && v.trim() === '')
    if (empty && !OPTIONAL_VARIABLES.has(name)) {
      errors.push(`Variable "{{${name}}}" kosong di booking ini. Isi field terkait sebelum kirim pesan.`)
    }
  }

  if (errors.length > 0) {
    return { ok: false, rendered: template, errors }
  }

  const rendered = template.replace(VAR_RE, (_, name: string) => {
    const v = ctx[name]
    if (v === null || v === undefined) return ''
    return String(v)
  })

  return { ok: true, rendered, errors: [] }
}

export interface BookingLike {
  bookingRef?: string | null
  accessToken?: string | null
  customerName?: string | null
  customerEmail?: string | null
  customerWhatsapp?: string | null
  customerCountry?: string | null
  tripType?: string | null
  departureDate?: string | null
  returnDate?: string | null
  originLocation?: string | null
  destinationLocation?: string | null
  ferryClassName?: string | null
  adults?: number | null
  children?: number | null
  unitPrice?: number | null
  totalEstimate?: number | null
  currency?: string | null
  passengers?: Array<{
    passengerType?: string | null
    title?: string | null
    firstName?: string | null
    lastName?: string | null
    nationality?: string | null
    dateOfBirth?: string | null
  }> | null
}

export function formatPassengerList(passengers: BookingLike['passengers']): string {
  if (!passengers || passengers.length === 0) return ''
  return passengers
    .map((p, i) => {
      const idx = i + 1
      const type = p.passengerType === 'child' ? 'Child' : 'Adult'
      const title = p.title ? `${p.title.charAt(0).toUpperCase()}${p.title.slice(1)}.` : ''
      const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
      const nat = p.nationality ? ` · ${p.nationality}` : ''
      return `${idx}. [${type}] ${title} ${name}${nat}`.trim()
    })
    .join('\n')
}

export function formatBankAccountsBlock(
  banks: Array<{ bankName?: string | null; accountHolder?: string | null; accountNumber?: string | null }> | null | undefined,
): string {
  if (!banks || banks.length === 0) return ''
  return banks
    .map((b) => `• ${b.bankName ?? ''} — ${b.accountHolder ?? ''} — ${b.accountNumber ?? ''}`)
    .join('\n')
}

export function buildContext(
  booking: BookingLike,
  extras: Partial<TemplateContext> & {
    bankAccountsBlock?: string
    paymentDeadline?: string
    adminName?: string
    adminWhatsapp?: string
    passengerList?: string
  } = {},
): TemplateContext {
  return {
    bookingRef: booking.bookingRef ?? null,
    accessToken: booking.accessToken ?? null,
    customerName: booking.customerName ?? null,
    customerEmail: booking.customerEmail ?? null,
    customerWhatsapp: booking.customerWhatsapp ?? null,
    customerCountry: booking.customerCountry ?? null,
    tripType: booking.tripType ?? null,
    departureDate: booking.departureDate ?? null,
    returnDate: booking.returnDate ?? null,
    originLocation: booking.originLocation ?? null,
    destinationLocation: booking.destinationLocation ?? null,
    ferryClassName: booking.ferryClassName ?? null,
    adults: booking.adults ?? null,
    children: booking.children ?? null,
    unitPrice: booking.unitPrice ?? null,
    totalEstimate: booking.totalEstimate ?? null,
    currency: booking.currency ?? null,
    passengerList: extras.passengerList ?? formatPassengerList(booking.passengers),
    ...extras,
  }
}

export function computePaymentDeadline(hours: number): string {
  return new Date(Date.now() + Math.max(1, hours) * 60 * 60 * 1000).toISOString()
}

/**
 * Format WA number (+6281234...) → wa.me path (6281234...). Strip
 * leading `+` dan non-digit. Return null kalau tidak valid.
 */
export function waNumberForLink(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8) return null
  return digits
}

/**
 * Build wa.me deep-link dgn pesan URL-encoded.
 */
export function buildWaLink(number: string | null | undefined, text: string): string | null {
  const num = waNumberForLink(number)
  if (!num) return null
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
}
