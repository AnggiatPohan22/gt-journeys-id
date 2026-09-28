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

  const lines = [
    'Halo DnJourneysBali! 👋',
    '',
    `Saya ingin konfirmasi booking Ferry Ticket:`,
    `🔖 *Ref:* ${b.bookingRef}`,
    ferryTitle ? `⛴️ *Ferry:* ${ferryTitle}` : null,
    `📍 *Rute:* ${route}`,
    b.scheduleTimeLabel ? `🕒 *Jadwal:* ${b.scheduleTimeLabel}` : null,
    `📅 *Tanggal:* ${date}`,
    `👥 *Penumpang:* ${b.adults ?? 1} dewasa${b.children ? ` + ${b.children} anak` : ''}`,
    b.ferryClassName ? `🎫 *Kelas:* ${b.ferryClassName}` : null,
    unit ? `💰 *Harga:* ${unit} / dewasa${total ? ` (est. total ${total})` : ''}` : null,
    '',
    `*Nama:* ${b.customerName}`,
    `*WhatsApp:* ${b.customerWhatsapp}`,
    b.customerEmail ? `*Email:* ${b.customerEmail}` : null,
    b.customerCountry ? `*Negara:* ${b.customerCountry}` : null,
    b.customerNotes ? `*Catatan:* ${b.customerNotes}` : null,
    '',
    'Mohon konfirmasi ketersediaan & langkah berikutnya. Terima kasih!',
  ].filter(Boolean)

  return lines.join('\n')
}
