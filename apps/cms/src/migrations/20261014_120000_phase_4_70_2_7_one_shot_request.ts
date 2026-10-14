import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.2.7 — One-shot customer change request.
 *
 * Tambah 1 kolom `bookings.has_requested_change` (boolean, default false).
 * Dipakai untuk mencegah spam: customer hanya bisa 1x request
 * reschedule/cancel per booking dari confirmation page. Field ini
 * TIDAK di-reset saat admin confirm/decline — satu kali seumur hidup
 * booking (admin bisa override manual via CMS kalau exceptional case).
 *
 * SQLite boolean = INTEGER (0/1). Default 0.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`has_requested_change\` integer DEFAULT 0;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`has_requested_change\`;`)
}
