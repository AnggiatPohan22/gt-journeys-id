/**
 * Manual WhatsApp channel — Phase 4.62.
 *
 * Fallback / non-gateway handoff. Composes a formatted WhatsApp message
 * from the booking snapshot and points the customer at wa.me/<admin-number>.
 * Kept as an ADMIN-facing tombol even after Xendit/Midtrans go live, so
 * customers with issues can still reach a human.
 */

import type { Booking } from '@shared/types/payload-types'
import { generateWhatsAppLink } from '@lib/whatsapp'
import { formatPrice } from '@shared/utils/format-price'
import { maskPassport } from '../mask'
import type { CheckoutChannel, CheckoutHandoff } from '../types'

export class ManualWhatsAppChannel implements CheckoutChannel {
  readonly slug = 'manual_wa'

  constructor(private readonly waNumber: string) {}

  async handle(booking: Booking): Promise<CheckoutHandoff> {
    const msg = buildMessage(booking)
    return {
      redirectUrl: generateWhatsAppLink(this.waNumber, msg),
      buttonLabel: 'Kirim ke WhatsApp',
      channelLabel: 'Manual WhatsApp confirmation',
    }
  }
}

function buildMessage(b: Booking): string {
  const currency = (b.currency as 'IDR' | 'USD' | undefined) ?? 'IDR'
  const unit = b.unitPrice != null ? formatPrice(b.unitPrice, currency) : null
  const total = b.totalEstimate != null ? formatPrice(b.totalEstimate, currency) : null
  const date = b.departureDate ? String(b.departureDate).slice(0, 10) : '[tanggal]'
  const route = [b.originLocation, b.destinationLocation].filter(Boolean).join(' → ') || '[rute]'
  const ferryTitle =
    typeof b.ferryTicket === 'object' && b.ferryTicket && 'title' in b.ferryTicket
      ? (b.ferryTicket as { title?: string }).title
      : null

  const passengerLines = Array.isArray(b.passengers) && b.passengers.length > 0
    ? b.passengers.map((p, i) => {
        const titleStr = p.title ? p.title.charAt(0).toUpperCase() + p.title.slice(1) + '.' : ''
        const nameParts = [titleStr, p.firstName, p.lastName].filter(Boolean).join(' ')
        const typeTag = p.passengerType === 'child' ? 'Child' : 'Adult'
        const nat = p.nationality ? ` · ${p.nationality}` : ''
        const dob = p.dateOfBirth ? ` · DOB ${String(p.dateOfBirth).slice(0, 10)}` : ''
        const pp = p.passportNumber ? ` · Passport ${maskPassport(p.passportNumber)}` : ''
        return `${i + 1}. [${typeTag}] ${nameParts}${nat}${dob}${pp}`
      })
    : []

  const lines = [
    'Halo DnJourneysBali! 👋',
    '',
    `Saya ingin konfirmasi booking Ferry Ticket:`,
    `🔖 *Ref:* ${b.bookingRef}`,
    ferryTitle ? `⛴️ *Ferry:* ${ferryTitle}` : null,
    `📍 *Rute:* ${route}`,
    b.scheduleTimeLabel ? `🕒 *Jadwal:* ${b.scheduleTimeLabel}` : null,
    `📅 *Tanggal:* ${date}`,
    `👥 *Jumlah:* ${b.adults ?? 1} dewasa${b.children ? ` + ${b.children} anak` : ''}`,
    b.ferryClassName ? `🎫 *Kelas:* ${b.ferryClassName}` : null,
    unit ? `💰 *Harga:* ${unit} / dewasa${total ? ` (est. total ${total})` : ''}` : null,
    '',
    `*Nama pemesan:* ${b.customerName}`,
    `*WhatsApp:* ${b.customerWhatsapp}`,
    b.customerEmail ? `*Email:* ${b.customerEmail}` : null,
    b.customerCountry ? `*Negara:* ${b.customerCountry}` : null,
    b.customerNotes ? `*Catatan:* ${b.customerNotes}` : null,
    passengerLines.length > 0 ? '' : null,
    passengerLines.length > 0 ? '*Data Penumpang:*' : null,
    ...(passengerLines.length > 0 ? passengerLines : []),
    '',
    'Mohon konfirmasi ketersediaan & langkah berikutnya. Terima kasih!',
  ].filter((x) => x !== null && x !== undefined) as string[]

  return lines.join('\n')
}
