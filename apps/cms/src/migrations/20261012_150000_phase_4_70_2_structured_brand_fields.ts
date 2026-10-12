import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.2 — Structured brand + per-template editable fields.
 *
 * Admin bisa edit logo (relationship ke Media), warna accent, nama brand,
 * support email, disclaimer, dan per-template hero headline/subtext tanpa
 * sentuh HTML. Endpoint compose HTML dgn fields ini sebagai variables.
 *
 * Juga tambah 2 kolom HTML untuk reschedule + cancel (sebelumnya belum
 * ada HTML template).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Shared brand fields (apply ke semua 5 template)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`brand_logo_id\` integer REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`brand_accent_color\` text DEFAULT '#0EA5E9';`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`brand_company_name\` text DEFAULT 'PT GtJourneys Nusantara Indonesia';`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`support_email\` text DEFAULT 'billing@gtjourneys.id';`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`footer_disclaimer\` text;`)

  // OTP editable
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`otp_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`otp_hero_subtext\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`otp_security_note\` text;`)

  // Payment editable
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`payment_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`payment_hero_subtext\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`payment_security_note\` text;`)

  // Ticket editable
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`ticket_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`ticket_hero_subtext\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`ticket_checklist_title\` text;`)

  // Reschedule — HTML + editable headlines
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_hero_subtext\` text;`)

  // Cancel — HTML + editable headlines
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_hero_subtext\` text;`)

  // Index untuk brand_logo FK
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`booking_templates_brand_logo_idx\` ON \`booking_templates\` (\`brand_logo_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`booking_templates_brand_logo_idx\`;`)
  const cols = [
    'cancel_hero_subtext', 'cancel_hero_headline', 'cancel_email_body_html',
    'reschedule_hero_subtext', 'reschedule_hero_headline', 'reschedule_email_body_html',
    'ticket_checklist_title', 'ticket_hero_subtext', 'ticket_hero_headline',
    'payment_security_note', 'payment_hero_subtext', 'payment_hero_headline',
    'otp_security_note', 'otp_hero_subtext', 'otp_hero_headline',
    'footer_disclaimer', 'support_email', 'brand_company_name',
    'brand_accent_color', 'brand_logo_id',
  ]
  for (const c of cols) {
    await db.run(sql.raw(`ALTER TABLE \`booking_templates\` DROP COLUMN \`${c}\`;`))
  }
}
