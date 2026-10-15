import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.70.3.1b — Payment audit log column (split dari 4.70.3.1).
 *
 * Alasan split: `payment_audit_log` ditambahkan ke migration original setelah
 * sebagian user sudah run `payload migrate` (file original tercatat di tabel
 * `payload_migrations` → Payload skip migration itu meski file-nya di-update).
 *
 * Migration terpisah ini pastikan kolom ter-ADD di env user existing. Fresh
 * install dapat kolom via migration ini (original tidak lagi punya baris ADD
 * untuk payment_audit_log).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`payment_audit_log\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`payment_audit_log\`;`)
}
