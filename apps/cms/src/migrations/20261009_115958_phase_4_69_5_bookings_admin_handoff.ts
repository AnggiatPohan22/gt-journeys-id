import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.69.5 — Bookings admin-handoff fields + status enum expansion.
 *
 * Status enum (defined di Payload collection — SQLite stores plain text,
 * tidak ada CHECK constraint; migration ini tidak alter column, cuma
 * dokumentasi):
 *   OLD: pending / awaiting_payment / confirmed / cancelled / expired
 *   NEW: + awaiting_review / payment_review / reschedule_request / cancel_request
 *
 * 6 field audit baru + 2 FK ke users:
 *   - sent_payment_at (datetime, nullable)
 *   - sent_payment_by_id (FK users, nullable)
 *   - sent_ticket_at (datetime, nullable)
 *   - sent_ticket_by_id (FK users, nullable)
 *   - email_verified_at (datetime, nullable) — di-set oleh /api/bookings/create
 *     saat emailVerifiedToken terbukti valid (phase 4.69.3)
 *   - whatsapp_verified_at (datetime, nullable) — reserved untuk Phase 4.69.11
 *
 * Backfill: existing booking `status='pending'` dibiarkan — tidak
 * di-migrate otomatis ke `awaiting_review` supaya admin bisa review
 * dulu. Flow baru hanya berlaku untuk booking yang dibuat setelah phase
 * ini aktif (default di collection di-ganti ke `awaiting_review` di
 * 4.69.5 — tapi existing row tidak ter-sentuh).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`sent_payment_at\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`sent_payment_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`sent_ticket_at\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`sent_ticket_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`email_verified_at\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`whatsapp_verified_at\` text;`)

  // Index untuk filter admin dashboard (Phase 4.69.8) — status + createdAt.
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`bookings_status_created_at_idx\` ON \`bookings\` (\`status\`, \`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`bookings_sent_payment_by_id_idx\` ON \`bookings\` (\`sent_payment_by_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`bookings_sent_ticket_by_id_idx\` ON \`bookings\` (\`sent_ticket_by_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`bookings_sent_ticket_by_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`bookings_sent_payment_by_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`bookings_status_created_at_idx\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`whatsapp_verified_at\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`email_verified_at\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`sent_ticket_by_id\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`sent_ticket_at\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`sent_payment_by_id\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`sent_payment_at\`;`)
}
