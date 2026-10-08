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
 * di CMS admin.
 *
 * Phase 4.67.2g — 2-leg round-trip support.
 *   One-way (default): layout lama tidak berubah.
 *   Round-trip (`b.tripType === 'round-trip'`): render 2 block (OUTBOUND +
 *   RETURN) + header "Round Trip" supaya admin langsung paham ada 2 leg
 *   untuk diverifikasi ketersediaan + harga. Tetap minim PII (ikut rule
 *   S-13: tidak sertakan harga/email/notes/per-passenger).
 */
function buildMessage(b: Booking): string {
  const isRoundTrip = b.tripType === 'round-trip'
  const paxCount =
    `${b.adults ?? 1} dewasa` +
    ((b.children ?? 0) > 0 ? ` + ${b.children} anak` : '')

  const ferryTitleOf = (rel: unknown): string | null =>
    typeof rel === 'object' && rel && 'title' in rel
      ? ((rel as { title?: string }).title ?? null)
      : null

  const outboundDate = b.departureDate ? String(b.departureDate).slice(0, 10) : '[tanggal]'
  const outboundRoute =
    [b.originLocation, b.destinationLocation].filter(Boolean).join(' → ') || '[rute]'
  const outboundFerryTitle = ferryTitleOf(b.ferryTicket)

  if (!isRoundTrip) {
    // One-way (unchanged layout).
    const lines = [
      'Halo GtJourneysID! 👋',
      '',
      'Saya ingin konfirmasi booking Ferry Ticket:',
      `🔖 *Ref:* ${b.bookingRef}`,
      outboundFerryTitle ? `⛴️ *Ferry:* ${outboundFerryTitle}` : null,
      `📍 *Rute:* ${outboundRoute}`,
      `📅 *Tanggal:* ${outboundDate}`,
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

  // Round-trip (2-leg).
  const returnDate = b.returnDate ? String(b.returnDate).slice(0, 10) : '[tanggal return]'
  const returnRoute =
    [b.returnOriginLocation, b.returnDestinationLocation].filter(Boolean).join(' → ') || '[rute return]'
  const returnFerryTitle = ferryTitleOf(b.returnFerryTicket)

  const lines = [
    'Halo GtJourneysID! 👋',
    '',
    'Saya ingin konfirmasi booking *Round Trip* Ferry Ticket:',
    `🔖 *Ref:* ${b.bookingRef}`,
    `👥 *Jumlah:* ${paxCount}`,
    '',
    '🛫 *OUTBOUND*',
    outboundFerryTitle ? `⛴️ Ferry: ${outboundFerryTitle}` : null,
    `📍 Rute: ${outboundRoute}`,
    `📅 Tanggal: ${outboundDate}`,
    b.ferryClassName ? `🎫 Kelas: ${b.ferryClassName}` : null,
    '',
    '🔄 *RETURN*',
    returnFerryTitle ? `⛴️ Ferry: ${returnFerryTitle}` : null,
    `📍 Rute: ${returnRoute}`,
    `📅 Tanggal: ${returnDate}`,
    b.returnFerryClassName ? `🎫 Kelas: ${b.returnFerryClassName}` : null,
    '',
    `*Nama:* ${b.customerName}`,
    `*WhatsApp:* ${b.customerWhatsapp}`,
    '',
    'Mohon konfirmasi ketersediaan kedua leg & langkah berikutnya. Terima kasih!',
  ].filter((x): x is string => typeof x === 'string')

  return lines.join('\n')
}
