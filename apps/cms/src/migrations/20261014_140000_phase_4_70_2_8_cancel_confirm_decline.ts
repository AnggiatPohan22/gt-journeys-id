import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.2.8 — Cancel Confirm/Decline split.
 *
 * Mirror Phase 4.70.2.6 (reschedule split) untuk cancel request.
 * - `cancel_confirm_*` × 6 kolom
 * - `cancel_decline_*` × 6 kolom
 *
 * Kolom lama `cancel_email_*` + `cancel_hero_*` tetap di DB tapi
 * field di-hide di UI (deprecated).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Cancel Confirm (6 fields)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_confirm_email_subject\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_confirm_email_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_confirm_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_confirm_whatsapp_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_confirm_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_confirm_hero_subtext\` text;`)

  // Cancel Decline (6 fields)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_decline_email_subject\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_decline_email_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_decline_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_decline_whatsapp_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_decline_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`cancel_decline_hero_subtext\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_decline_hero_subtext\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_decline_hero_headline\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_decline_whatsapp_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_decline_email_body_html\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_decline_email_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_decline_email_subject\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_confirm_hero_subtext\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_confirm_hero_headline\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_confirm_whatsapp_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_confirm_email_body_html\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_confirm_email_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`cancel_confirm_email_subject\`;`)
}
