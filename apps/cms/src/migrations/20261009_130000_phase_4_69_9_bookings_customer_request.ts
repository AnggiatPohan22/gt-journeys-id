import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.69.9 — Customer request fields untuk reschedule/cancel flow.
 *
 * - `customer_request_reason` (text, nullable) — alasan dari customer
 * - `customer_requested_at` (text, nullable) — timestamp ISO request
 * - `customer_request_kind` (text, nullable) — 'reschedule' | 'cancel'
 *
 * Semua nullable di DB; booking existing tidak terdampak.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`customer_request_reason\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`customer_requested_at\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`customer_request_kind\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`customer_request_kind\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`customer_requested_at\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`customer_request_reason\`;`)
}
