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
  // Phase 4.70.2 — Brand (shared across all templates)
  'brandHeaderHtml',
  'brandAccentColor',
  'brandCompanyName',
  'supportEmail',
  'footerDisclaimer',
  // Per-template hero/section fields
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
  // Customer request audit (dari Phase 4.69.9) — tampil di reschedule/cancel HTML
  'customerRequestReason',
  // Phase 4.70.2.4 — Snapshot departure + schedule time (reschedule flow)
  'scheduleTimeLabel',
  'originalDepartureDate',
  'originalScheduleTimeLabel',
  'departureDisplay',
  'originalDepartureDisplay',
  'departureBlock',
])

export const OPTIONAL_VARIABLES = new Set<string>([
  'returnDate',
  'customerCountry',
  'customerEmail',
  'customerWhatsapp',
  'confirmationUrl',
  'accessToken',
  // Phase 4.70.2 — Brand + per-template fields semua OPTIONAL (template
  // non-HTML tidak mereferensi; HTML default pakai). Kalau admin kosongkan,
  // render string kosong (fallback-safe).
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
  // Phase 4.70.2.6 — Confirm/Decline split (semua OPTIONAL)
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
  // Phase 4.70.2.8 — Cancel Confirm/Decline split (semua OPTIONAL)
  'cancelConfirmHeroHeadline',
  'cancelConfirmHeroSubtext',
  'cancelConfirmEmailBody',
  'cancelConfirmNote',
  'cancelDeclineHeroHeadline',
  'cancelDeclineHeroSubtext',
  'cancelDeclineEmailBody',
  'cancelDeclineReason',
  'customerRequestReason',
  // Phase 4.70.2.4 — snapshot vars OPTIONAL (hanya terisi untuk reschedule flow)
  'scheduleTimeLabel',
  'originalDepartureDate',
  'originalScheduleTimeLabel',
  'departureDisplay',
  'originalDepartureDisplay',
  'departureBlock',
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

/**
 * Escape HTML special chars untuk mitigate XSS saat substitusi di dalam
 * HTML template. Dipakai saat `escapeHtml: true` (Phase 4.70.1).
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
  /** Escape HTML chars pada nilai saat substitusi. WAJIB `true` untuk HTML template. */
  escapeHtml?: boolean
  /** Set nama variable yang NILAInya adalah TRUSTED HTML (jangan escape).
   *  Phase 4.70.2 — brandHeaderHtml yang dibangun server-side perlu raw. */
  rawVars?: Set<string>
}

export function renderTemplate(template: string, ctx: TemplateContext, opts: RenderOptions = {}): RenderResult {
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
    const str = String(v)
    if (opts.escapeHtml && !opts.rawVars?.has(name)) return escapeHtml(str)
    return str
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
