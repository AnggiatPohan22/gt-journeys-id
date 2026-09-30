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

/**
 * Phase 4.66.10 (finding S-13) — WA message dirampingkan.
 *
 * Sebelumnya message body membawa email, negara, notes, dan tiap-tiap
 * passenger (nama/DOB/nasionalitas/masked passport) ke query URL
 * `wa.me/?text=...`. URL WA masuk browser history + kemungkinan referrer
 * ke wa.me, jadi setiap detail di sana adalah PII yang tumpah keluar
 * dari halaman confirmation (yang sekarang sudah dilindungi access
 * token di Phase 4.66.5).
 *
 * Message sekarang minimal: ref + trip essentials + jumlah pax + nama
 * pemesan + WA (untuk admin re-verifikasi). Semua detail lain (email,
 * notes, per-passenger, harga) tetap tersedia di halaman konfirmasi &
 * di CMS admin. Admin bisa buka via link URL yang mengandung access
 * token — Phase 4.66.11 akan menambahkan URL konfirmasi ke message ini
 * kalau feature flag di-enable.
 */
function buildMessage(b: Booking): string {
  const date = b.departureDate ? String(b.departureDate).slice(0, 10) : '[tanggal]'
  const route =
    [b.originLocation, b.destinationLocation].filter(Boolean).join(' → ') || '[rute]'
  const ferryTitle =
    typeof b.ferryTicket === 'object' && b.ferryTicket && 'title' in b.ferryTicket
      ? (b.ferryTicket as { title?: string }).title
      : null
  const paxCount =
    `${b.adults ?? 1} dewasa` +
    ((b.children ?? 0) > 0 ? ` + ${b.children} anak` : '')

  const lines = [
    'Halo DnJourneysBali! 👋',
    '',
    'Saya ingin konfirmasi booking Ferry Ticket:',
    `🔖 *Ref:* ${b.bookingRef}`,
    ferryTitle ? `⛴️ *Ferry:* ${ferryTitle}` : null,
    `📍 *Rute:* ${route}`,
    `📅 *Tanggal:* ${date}`,
    `👥 *Jumlah:* ${paxCount}`,
    b.ferryClassName ? `🎫 *Kelas:* ${b.ferryClassName}` : null,
    '',
    `*Nama:* ${b.customerName}`,
    `*WhatsApp:* ${b.customerWhatsapp}`,
    '',
    'Mohon konfirmasi ketersediaan & langkah berikutnya. Terima kasih!',
  ].filter((x): x is string => typeof x === 'string')

  return lines.join('\n')
}
