import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.2.6 — Reschedule Confirm/Decline split.
 *
 * Perubahan:
 * 1. `bookings.pre_request_status` (nullable) — snapshot status asli
 *    sebelum customer request, dipakai untuk restore ke status itu
 *    setelah admin confirm/decline reschedule.
 * 2. `booking_templates` dapat 12 kolom baru (2 × 6 = confirm + decline):
 *    - *_email_subject
 *    - *_email_body
 *    - *_email_body_html
 *    - *_whatsapp_body
 *    - *_hero_headline
 *    - *_hero_subtext
 *
 * Kolom lama `reschedule_email_*` tetap di DB (deprecated di UI, tidak
 * dipakai lagi oleh endpoint). Future cleanup phase bisa drop kalau mau.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`pre_request_status\` text;`)

  // Reschedule Confirm (6 fields)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_confirm_email_subject\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_confirm_email_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_confirm_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_confirm_whatsapp_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_confirm_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_confirm_hero_subtext\` text;`)

  // Reschedule Decline (6 fields)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_decline_email_subject\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_decline_email_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_decline_email_body_html\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_decline_whatsapp_body\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_decline_hero_headline\` text;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` ADD \`reschedule_decline_hero_subtext\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_decline_hero_subtext\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_decline_hero_headline\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_decline_whatsapp_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_decline_email_body_html\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_decline_email_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_decline_email_subject\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_confirm_hero_subtext\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_confirm_hero_headline\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_confirm_whatsapp_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_confirm_email_body_html\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_confirm_email_body\`;`)
  await db.run(sql`ALTER TABLE \`booking_templates\` DROP COLUMN \`reschedule_confirm_email_subject\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`pre_request_status\`;`)
}
