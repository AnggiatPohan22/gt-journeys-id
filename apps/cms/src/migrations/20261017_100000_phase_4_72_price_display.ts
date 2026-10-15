import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.72 — Formatted total price variable swap.
 *
 * `{{currency}} {{totalEstimate}}` renders raw: "IDR 250000". Phase ini
 * tambah `{{totalEstimateDisplay}}` yang format via shared formatPrice:
 * IDR → "Rp 250.000", non-IDR → Intl standard. Swap default template ke
 * variable baru. `{{currency}}` + `{{totalEstimate}}` tetap valid untuk
 * backward-compat / manual override.
 *
 * Schema: TIDAK ada perubahan kolom.
 *
 * Scope UPDATE: 2 text templates (paymentEmailBody, paymentWhatsappBody)
 * + 4 HTML templates (payment, ticket, reschedule, cancel email_body_html).
 * Pattern conditional UPDATE Phase 4.71.1 — admin yang sudah customize =
 * TIDAK ter-touch.
 */

// Text — payment email + WA (post-Phase 4.71.1 wording)
const OLD_PAYMENT_EMAIL_BODY =
  'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDisplay}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{currency}} {{totalEstimate}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadlineDisplay}}.\n\nTerima kasih,\nGtJourneysID'
const NEW_PAYMENT_EMAIL_BODY =
  'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDisplay}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{totalEstimateDisplay}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadlineDisplay}}.\n\nTerima kasih,\nGtJourneysID'

const OLD_PAYMENT_WA_BODY =
  'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDisplay}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{currency}} {{totalEstimate}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadlineDisplay}}.'
const NEW_PAYMENT_WA_BODY =
  'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDisplay}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{totalEstimateDisplay}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadlineDisplay}}.'

// HTML substring swap — payment, ticket, reschedule, cancel HTML all share
// the pattern `>{{currency}} {{totalEstimate}}<` di total card. Boundary
// `>` + `<` jaga false-positive (mirror Phase 4.71 pattern).
const HTML_OLD = '>{{currency}} {{totalEstimate}}<'
const HTML_NEW = '>{{totalEstimateDisplay}}<'

const HTML_FIELDS = [
  'payment_email_body_html',
  'ticket_email_body_html',
  'reschedule_email_body_html',
  'cancel_email_body_html',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_email_body\` = ${NEW_PAYMENT_EMAIL_BODY}
    WHERE \`payment_email_body\` = ${OLD_PAYMENT_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_whatsapp_body\` = ${NEW_PAYMENT_WA_BODY}
    WHERE \`payment_whatsapp_body\` = ${OLD_PAYMENT_WA_BODY};
  `)

  for (const field of HTML_FIELDS) {
    await db.run(sql.raw(`
      UPDATE \`booking_templates\`
      SET \`${field}\` = REPLACE(\`${field}\`, '>{{currency}} {{totalEstimate}}<', '>{{totalEstimateDisplay}}<')
      WHERE \`${field}\` LIKE '%>{{currency}} {{totalEstimate}}<%';
    `))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_email_body\` = ${OLD_PAYMENT_EMAIL_BODY}
    WHERE \`payment_email_body\` = ${NEW_PAYMENT_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_whatsapp_body\` = ${OLD_PAYMENT_WA_BODY}
    WHERE \`payment_whatsapp_body\` = ${NEW_PAYMENT_WA_BODY};
  `)

  for (const field of HTML_FIELDS) {
    await db.run(sql.raw(`
      UPDATE \`booking_templates\`
      SET \`${field}\` = REPLACE(\`${field}\`, '>{{totalEstimateDisplay}}<', '>{{currency}} {{totalEstimate}}<')
      WHERE \`${field}\` LIKE '%>{{totalEstimateDisplay}}<%';
    `))
  }
}
