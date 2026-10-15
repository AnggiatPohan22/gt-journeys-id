import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.2.4 — Snapshot kolom original departure saat customer
 * request reschedule.
 *
 * Alasan: endpoint customer-request (Phase 4.69.9) hanya simpan reason
 * + kind + timestamp. Admin lalu edit `departureDate` destructive →
 * tanggal awal hilang permanen → template "Reschedule Response" tidak
 * bisa tunjukkan "Previous → New departure".
 *
 * Dua kolom baru (nullable):
 * - `original_departure_date` (text, ISO) — tanggal awal sebelum admin ubah.
 * - `original_schedule_time_label` (text) — jam awal sebelum admin ubah.
 *
 * Keduanya di-set oleh `customer-request` endpoint saat kind='reschedule'
 * (tidak di-set untuk cancel karena tidak relevan). Admin boleh clear
 * manual lewat super-admin un-hide, atau akan di-clear otomatis kalau
 * admin manually transition status (future flow).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`original_departure_date\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`original_schedule_time_label\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`original_schedule_time_label\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`original_departure_date\`;`)
}
