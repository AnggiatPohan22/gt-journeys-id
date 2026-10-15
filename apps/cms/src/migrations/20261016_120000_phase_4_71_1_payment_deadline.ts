import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.71.1 — Payment deadline readable format.
 *
 * `{{paymentDeadline}}` sebelumnya render raw ISO (2026-10-20T07:30:00.000Z).
 * Phase ini tambah `{{paymentDeadlineDisplay}}` yang format WITA readable
 * ("20 Oct 2026, 14:30 WITA"), lalu swap default template ke pakai variable
 * baru. `{{paymentDeadline}}` tetap valid (backward-compat untuk raw ISO).
 *
 * Schema: TIDAK ada perubahan kolom. `paymentDeadlineHours` sudah ada di
 * booking_templates sejak Phase 4.69.6 — Phase 4.71.1 hanya memindah UI
 * lokasi tab (dari "Bank Accounts" → "Payment Instructions"); DB column
 * sama.
 *
 * Migration content: 4 conditional UPDATE (text defaults — payment email,
 * payment WA, payment hero subtext) + HTML substring REPLACE untuk payment
 * HTML. Mirror Phase 4.71 (departureDate) pattern — rows yang masih di
 * default lama = updated; admin yang sudah customize = tidak kena.
 */

// ─── Payment Email Body (text) ──────────────────────────────────────
const OLD_PAYMENT_EMAIL_BODY =
  'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDisplay}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{currency}} {{totalEstimate}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadline}}.\n\nTerima kasih,\nGtJourneysID'
const NEW_PAYMENT_EMAIL_BODY =
  'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDisplay}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{currency}} {{totalEstimate}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadlineDisplay}}.\n\nTerima kasih,\nGtJourneysID'

// ─── Payment WhatsApp Body ──────────────────────────────────────────
const OLD_PAYMENT_WA_BODY =
  'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDisplay}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{currency}} {{totalEstimate}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadline}}.'
const NEW_PAYMENT_WA_BODY =
  'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDisplay}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{currency}} {{totalEstimate}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadlineDisplay}}.'

// ─── Payment Hero Subtext ──────────────────────────────────────────
const OLD_PAYMENT_HERO_SUBTEXT =
  'terima kasih sudah memesan tiket di GtJourneysID. Kursi kamu sudah di-reserve sementara — lengkapi pembayaran sebelum {{paymentDeadline}}.'
const NEW_PAYMENT_HERO_SUBTEXT =
  'terima kasih sudah memesan tiket di GtJourneysID. Kursi kamu sudah di-reserve sementara — lengkapi pembayaran sebelum {{paymentDeadlineDisplay}}.'

// ─── HTML substring swap (payment_email_body_html) ─────────────────
// Boundary `>{{...}}<` strong-enough guard, mirror Phase 4.71.
const HTML_OLD = '>{{paymentDeadline}}<'
const HTML_NEW = '>{{paymentDeadlineDisplay}}<'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_email_body\` = ${NEW_PAYMENT_EMAIL_BODY}
    WHERE \`payment_email_body\` = ${OLD_PAYMENT_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_whatsapp_body\` = ${NEW_PAYMENT_WA_BODY}
    WHERE \`payment_whatsapp_body\` = ${OLD_PAYMENT_WA_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_hero_subtext\` = ${NEW_PAYMENT_HERO_SUBTEXT}
    WHERE \`payment_hero_subtext\` = ${OLD_PAYMENT_HERO_SUBTEXT};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\`
    SET \`payment_email_body_html\` = REPLACE(\`payment_email_body_html\`, ${HTML_OLD}, ${HTML_NEW})
    WHERE \`payment_email_body_html\` LIKE '%' || ${HTML_OLD} || '%';
  `)
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
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_hero_subtext\` = ${OLD_PAYMENT_HERO_SUBTEXT}
    WHERE \`payment_hero_subtext\` = ${NEW_PAYMENT_HERO_SUBTEXT};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\`
    SET \`payment_email_body_html\` = REPLACE(\`payment_email_body_html\`, ${HTML_NEW}, ${HTML_OLD})
    WHERE \`payment_email_body_html\` LIKE '%' || ${HTML_NEW} || '%';
  `)
}
