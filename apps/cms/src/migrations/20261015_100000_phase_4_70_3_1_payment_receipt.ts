import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.3.1 — Payment Receipt PDF.
 *
 * Schema:
 * - `bookings` × 4 kolom (nullable):
 *   - receipt_number: RCPT-{bookingRef}-{YYYYMMDD(Makassar)}, FROZEN on first send.
 *   - receipt_issued_at: ISO timestamp, FROZEN on first send (first-issue date).
 *   - payment_date: ISO date, admin pick di modal.
 *   - payment_bank: text, admin pick dari global bankAccounts dropdown.
 *
 * - `booking_templates` × 5 kolom (nullable, runtime fallback):
 *   - receipt_business_name
 *   - receipt_address
 *   - receipt_business_id
 *   - receipt_disclaimer_text
 *   - receipt_footer_note
 *
 * Wording migration (conditional UPDATE):
 * Replace ticket email wording defaults ke versi "payment receipt" HANYA kalau
 * row masih pakai old default (artinya admin belum customize). Admin yang sudah
 * ubah = tidak kena.
 */

// Old defaults (hardcoded di sini untuk deterministic migrate; TIDAK import dari
// TS code supaya migration future-proof terhadap perubahan code di depannya).
const OLD_TICKET_SUBJECT = 'Your Ferry Ticket — Booking {{bookingRef}} Confirmed'
const NEW_TICKET_SUBJECT = 'Booking {{bookingRef}} Dikonfirmasi — Payment Receipt Terlampir'

const OLD_TICKET_HERO_HEADLINE = 'Your ferry ticket is confirmed!'
const NEW_TICKET_HERO_HEADLINE = 'Pembayaran dikonfirmasi — payment receipt terlampir'

const OLD_TICKET_HERO_SUBTEXT =
  'pembayaran kamu sudah kami terima. Berikut detail perjalanan kamu — simpan email ini untuk check-in.'
const NEW_TICKET_HERO_SUBTEXT =
  'pembayaran kamu sudah kami terima. Payment receipt (PDF) terlampir sebagai bukti pembayaran. Tiket resmi akan diterbitkan oleh operator ferry saat check-in di terminal.'

const OLD_TICKET_EMAIL_BODY =
  'Hi {{customerName}},\n\nPembayaran kamu sudah kami terima — booking {{bookingRef}} CONFIRMED.\n\n*Detail Perjalanan:*\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDate}}\n*Class:* {{ferryClassName}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n\n{{passengerList}}\n\nMohon tiba di terminal 60 menit sebelum keberangkatan. Siapkan passport fisik untuk check-in.\n\nTerima kasih,\nGtJourneysID'
const NEW_TICKET_EMAIL_BODY =
  'Hi {{customerName}},\n\nPembayaran kamu sudah kami terima — booking {{bookingRef}} CONFIRMED.\n\n{{receiptAttachedNote}}\n\n*Detail Perjalanan:*\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDate}}\n*Class:* {{ferryClassName}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n\n{{passengerList}}\n\nTiket resmi diterbitkan oleh operator ferry saat check-in di terminal. Mohon tiba 60 menit sebelum keberangkatan dengan passport fisik.\n\nTerima kasih,\nGtJourneysID'

const OLD_TICKET_WA_BODY =
  '✅ *Booking Confirmed!*\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDate}}\n🎫 Kelas: {{ferryClassName}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n\nTiba di terminal 60 menit sebelum berangkat. Jangan lupa bawa passport fisik ya!'
const NEW_TICKET_WA_BODY =
  '✅ *Booking Confirmed!*\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDate}}\n🎫 Kelas: {{ferryClassName}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n\n{{receiptAttachedNote}}\n\nTiket resmi diterbitkan oleh operator saat check-in. Tiba di terminal 60 menit sebelum berangkat ya!'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── bookings columns ───
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`receipt_number\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`receipt_issued_at\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`payment_date\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`payment_bank\` text;`)
  // NOTE: `payment_audit_log` di-split ke migration 20261015_110000_phase_4_70_3_1b
  // supaya user yang sudah run migrate 100000 (versi awal tanpa audit_log) bisa
  // dapat kolom tersebut.

  // ─── booking_templates columns ───
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`receipt_business_name\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`receipt_address\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`receipt_business_id\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`receipt_disclaimer_text\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`receipt_footer_note\` text;`)

  // ─── Wording migration (conditional) ───
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_email_subject\` = ${NEW_TICKET_SUBJECT}
    WHERE \`ticket_email_subject\` = ${OLD_TICKET_SUBJECT} OR \`ticket_email_subject\` IS NULL;
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_hero_headline\` = ${NEW_TICKET_HERO_HEADLINE}
    WHERE \`ticket_hero_headline\` = ${OLD_TICKET_HERO_HEADLINE} OR \`ticket_hero_headline\` IS NULL;
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_hero_subtext\` = ${NEW_TICKET_HERO_SUBTEXT}
    WHERE \`ticket_hero_subtext\` = ${OLD_TICKET_HERO_SUBTEXT} OR \`ticket_hero_subtext\` IS NULL;
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_email_body\` = ${NEW_TICKET_EMAIL_BODY}
    WHERE \`ticket_email_body\` = ${OLD_TICKET_EMAIL_BODY} OR \`ticket_email_body\` IS NULL;
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_whatsapp_body\` = ${NEW_TICKET_WA_BODY}
    WHERE \`ticket_whatsapp_body\` = ${OLD_TICKET_WA_BODY} OR \`ticket_whatsapp_body\` IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse wording (if still at new default)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_whatsapp_body\` = ${OLD_TICKET_WA_BODY}
    WHERE \`ticket_whatsapp_body\` = ${NEW_TICKET_WA_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_email_body\` = ${OLD_TICKET_EMAIL_BODY}
    WHERE \`ticket_email_body\` = ${NEW_TICKET_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_hero_subtext\` = ${OLD_TICKET_HERO_SUBTEXT}
    WHERE \`ticket_hero_subtext\` = ${NEW_TICKET_HERO_SUBTEXT};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_hero_headline\` = ${OLD_TICKET_HERO_HEADLINE}
    WHERE \`ticket_hero_headline\` = ${NEW_TICKET_HERO_HEADLINE};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_email_subject\` = ${OLD_TICKET_SUBJECT}
    WHERE \`ticket_email_subject\` = ${NEW_TICKET_SUBJECT};
  `)

  // Drop columns (reverse order)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`receipt_footer_note\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`receipt_disclaimer_text\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`receipt_business_id\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`receipt_address\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`receipt_business_name\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`payment_bank\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`payment_date\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`receipt_issued_at\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`receipt_number\`;`)
}
