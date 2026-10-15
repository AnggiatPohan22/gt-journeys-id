import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.66.5 — Bookings.accessToken (finding S-02).
 *
 * Tambah kolom `access_token` (128-bit random hex) untuk membatasi akses
 * ke halaman konfirmasi (`/checkout/ferry-tickets/confirmation/<ref>`).
 * `bookingRef` sendiri hanya ~24-bit (FT-YYYYMMDD-<6 hex>) sehingga
 * enumerable. URL final menjadi `.../confirmation/<ref>?t=<token>`.
 *
 * Kolom nullable di DB (SQLite unique-index mengabaikan NULL) sehingga
 * migration bisa dijalankan tanpa harus mengubah row existing dulu.
 * Backfill dilakukan langsung di step berikutnya untuk row yang sudah
 * ada, sehingga URL lama tetap bisa dibuka admin dari CMS.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Tambah kolom nullable.
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`access_token\` text;`)

  // 2. Backfill row existing (kalau ada) dengan 32-hex-char random.
  //    SQLite `hex(randomblob(16))` = 32 hex chars = 128 bit acak.
  await db.run(sql`UPDATE \`bookings\` SET \`access_token\` = lower(hex(randomblob(16))) WHERE \`access_token\` IS NULL;`)

  // 3. Unique index.
  await db.run(sql`CREATE UNIQUE INDEX \`bookings_access_token_idx\` ON \`bookings\` (\`access_token\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`bookings_access_token_idx\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`access_token\`;`)
}
