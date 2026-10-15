/**
 * Template renderer — Phase 4.69.6.
 *
 * Substitusi `{{varname}}` di template body/subject dengan nilai dari
 * booking + computed values (misal `paymentDeadline` = now + N hours).
 *
 * Rules (owner approved D10 = ERROR):
 *   1. Variable **harus** ter-whitelist di `KNOWN_VARIABLES` — kalau
 *      template mengandung `{{xxx}}` yang tidak di-whitelist → ERROR.
 *   2. Variable yang ter-whitelist tapi nilainya null/undefined/empty
 *      → ERROR. Fail-safe: admin harus isi field yang missing dulu
 *      sebelum kirim pesan.
 *   3. Exception: field opsional (seperti `returnDate` saat one-way)
 *      ditandai di `OPTIONAL_VARIABLES` — kalau null, render string
 *      kosong (bukan error).
 *
 * Design: pure function, zero side-effect. Input = template string +
 * context object. Output = `{ ok: true, rendered }` atau `{ ok: false,
 * errors }` dgn daftar variable yang gagal.
 */

export type TemplateContext = Record<string, string | number | null | undefined>

/**
 * Variable yang diakui engine. Variable yang tidak di sini + muncul di
 * template → `unknown_variable` error. Daftar HARUS sync dengan tab
 * "Variables Reference" di global `booking-templates`.
 */
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
  // Phase 4.70.2 — Brand + per-template fields (sync dgn CMS SSOT).
  'brandHeaderHtml',
  'brandAccentColor',
  'brandCompanyName',
  'supportEmail',
  'footerDisclaimer',
  'otpHeroHeadline',
  'otpHeroSubtext',
  'otpSecurityNote',
  'paymentHeroHeadline',
  'paymentHeroSubtext',
  'paymentSecurityNote',
  'ticketHeroHeadline',
  'ticketHeroSubtext',
  'ticketChecklistTitle',
  'rescheduleHeroHeadline',
  'rescheduleHeroSubtext',
  'rescheduleEmailBody',
  // Phase 4.70.2.6 — Confirm/Decline split
  'rescheduleConfirmHeroHeadline',
  'rescheduleConfirmHeroSubtext',
  'rescheduleConfirmEmailBody',
  'rescheduleConfirmNote',
  'rescheduleDeclineHeroHeadline',
  'rescheduleDeclineHeroSubtext',
  'rescheduleDeclineEmailBody',
  'rescheduleDeclineReason',
  'cancelHeroHeadline',
  'cancelHeroSubtext',
  'cancelEmailBody',
  // Phase 4.70.2.8 — Cancel Confirm/Decline split
  'cancelConfirmHeroHeadline',
  'cancelConfirmHeroSubtext',
  'cancelConfirmEmailBody',
  'cancelConfirmNote',
  'cancelDeclineHeroHeadline',
  'cancelDeclineHeroSubtext',
  'cancelDeclineEmailBody',
  'cancelDeclineReason',
  'customerRequestReason',
  // Phase 4.70.2.4 — Snapshot departure + schedule time (reschedule flow)
  'scheduleTimeLabel',
  'originalDepartureDate',
  'originalScheduleTimeLabel',
  'departureDisplay',
  'originalDepartureDisplay',
  'departureBlock',
])

/**
 * Variable yang boleh kosong (render → string kosong) tanpa error.
 * Semua variable lain yang terpakai di template harus ada nilainya.
 */
export const OPTIONAL_VARIABLES = new Set<string>([
  'returnDate',
  'customerCountry',
  'customerEmail',
  'customerWhatsapp',
  'confirmationUrl',
  'accessToken',
  // Phase 4.70.2 — Brand + per-template fields OPTIONAL.
  'brandHeaderHtml', 'brandAccentColor', 'brandCompanyName', 'supportEmail', 'footerDisclaimer',
  'otpHeroHeadline', 'otpHeroSubtext', 'otpSecurityNote',
  'paymentHeroHeadline', 'paymentHeroSubtext', 'paymentSecurityNote',
  'ticketHeroHeadline', 'ticketHeroSubtext', 'ticketChecklistTitle',
  'rescheduleHeroHeadline', 'rescheduleHeroSubtext', 'rescheduleEmailBody',
  // Phase 4.70.2.6 — Confirm/Decline split (semua OPTIONAL)
  'rescheduleConfirmHeroHeadline', 'rescheduleConfirmHeroSubtext',
  'rescheduleConfirmEmailBody', 'rescheduleConfirmNote',
  'rescheduleDeclineHeroHeadline', 'rescheduleDeclineHeroSubtext',
  'rescheduleDeclineEmailBody', 'rescheduleDeclineReason',
  'cancelHeroHeadline', 'cancelHeroSubtext', 'cancelEmailBody',
  // Phase 4.70.2.8 — Cancel Confirm/Decline split (semua OPTIONAL)
  'cancelConfirmHeroHeadline', 'cancelConfirmHeroSubtext',
  'cancelConfirmEmailBody', 'cancelConfirmNote',
  'cancelDeclineHeroHeadline', 'cancelDeclineHeroSubtext',
  'cancelDeclineEmailBody', 'cancelDeclineReason',
  'customerRequestReason',
  // Phase 4.70.2.4 — snapshot vars OPTIONAL
  'scheduleTimeLabel', 'originalDepartureDate', 'originalScheduleTimeLabel',
  'departureDisplay', 'originalDepartureDisplay',
  'departureBlock',
])

export interface RenderResult {
  ok: boolean
  rendered: string
  errors: string[]
}

const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g

/**
 * Scan template → extract list variable names yang disebut.
 */
export function extractVariables(template: string): string[] {
  const names = new Set<string>()
  let m: RegExpExecArray | null
  const re = new RegExp(VAR_RE.source, 'g')
  while ((m = re.exec(template)) !== null) {
    names.add(m[1])
  }
  return [...names]
}

/**
 * Render template dengan context. Return render result + daftar error
 * kalau ada variable unknown / missing.
 */
/**
 * Escape HTML special chars untuk mitigate XSS saat substitusi di HTML
 * template (Phase 4.70.1).
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface RenderOptions {
  escapeHtml?: boolean
  /** Phase 4.70.2 — Set nama var yg nilai-nya trusted HTML (jangan escape). */
  rawVars?: Set<string>
}

export function renderTemplate(template: string, ctx: TemplateContext, opts: RenderOptions = {}): RenderResult {
  const errors: string[] = []
  const used = extractVariables(template)

  // Pre-flight: cek semua variable di template.
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
    const str = String(v)
    if (opts.escapeHtml && !opts.rawVars?.has(name)) return escapeHtml(str)
    return str
  })

  return { ok: true, rendered, errors: [] }
}

/**
 * Build default context dari booking + extras. Caller (admin endpoint
 * Phase 4.69.7) tetap bisa override field manual.
 */
export interface BookingLike {
  bookingRef?: string | null
  accessToken?: string | null
  customerName?: string | null
  customerEmail?: string | null
  customerWhatsapp?: string | null
  customerCountry?: string | null
  tripType?: string | null
  departureDate?: string | null
  scheduleTimeLabel?: string | null
  originalDepartureDate?: string | null
  originalScheduleTimeLabel?: string | null
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

/**
 * Format passenger list — satu baris per passenger.
 */
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

/**
 * Format bank accounts block — satu baris per rekening.
 */
export function formatBankAccountsBlock(
  banks: Array<{ bankName?: string | null; accountHolder?: string | null; accountNumber?: string | null }> | null | undefined,
): string {
  if (!banks || banks.length === 0) return ''
  return banks
    .map((b) => `• ${b.bankName ?? ''} — ${b.accountHolder ?? ''} — ${b.accountNumber ?? ''}`)
    .join('\n')
}

/**
 * Phase 4.70.2.4 — Format departure date (+ optional time) jadi string
 * human-readable: "15 Oct 2026" atau "15 Oct 2026 · 08:30 → 09:30".
 * Return null kalau date kosong/invalid.
 */
export function formatDepartureDisplay(
  dateIso: string | null | undefined,
  timeLabel: string | null | undefined,
): string | null {
  if (!dateIso) return null
  let dateStr = dateIso
  try {
    const d = new Date(dateIso)
    if (!Number.isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  } catch { /* fallback: raw string */ }
  const time = (timeLabel ?? '').trim()
  return time ? `${dateStr} · ${time}` : dateStr
}

/**
 * Compose context dari booking + settings + extras. Field yang undefined
 * di booking tetap bisa di-override dari extras (misal `otp`, `confirmationUrl`).
 */
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
    scheduleTimeLabel: booking.scheduleTimeLabel ?? null,
    originalDepartureDate: booking.originalDepartureDate ?? null,
    originalScheduleTimeLabel: booking.originalScheduleTimeLabel ?? null,
    departureDisplay: formatDepartureDisplay(booking.departureDate, booking.scheduleTimeLabel),
    originalDepartureDisplay: formatDepartureDisplay(booking.originalDepartureDate, booking.originalScheduleTimeLabel),
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

/**
 * Compute paymentDeadline ISO dari now + hours.
 */
export function computePaymentDeadline(hours: number): string {
  return new Date(Date.now() + Math.max(1, hours) * 60 * 60 * 1000).toISOString()
}
