import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.1 — HTML email templates.
 *
 * Tambah 3 kolom di `booking_templates` untuk HTML body (OTP, Payment,
 * Ticket). Field text body existing dibiarkan sebagai fallback plain-text
 * untuk email client yang tidak render HTML.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`otp_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`payment_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`ticket_email_body_html\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`ticket_email_body_html\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`payment_email_body_html\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`otp_email_body_html\`;`)
}
