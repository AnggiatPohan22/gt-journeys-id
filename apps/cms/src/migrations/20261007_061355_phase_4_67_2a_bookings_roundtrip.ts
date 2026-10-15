import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.67.2a — Bookings round-trip schema.
 *
 * Tambah `trip_type` + 10 field snapshot leg return di `bookings`.
 * Semua additive, non-destructive. Existing booking 1-leg: `trip_type`
 * default `one-way`, field return NULL → UI treat as one-way (behaviour
 * identik dgn pre-4.67.2a).
 *
 * Catatan generator: `pnpm schema:new` juga emit diff untuk brand rename
 * `site_settings` (4.73), popup EN defaults (20260930_120000), dan
 * `bookings.access_token` (4.66.5) karena migration itu hand-written tanpa
 * .json snapshot. Semua drift itu SUDAH live di DB — kita HAPUS dari file
 * ini supaya hanya round-trip changes yang di-apply. .json snapshot tetap
 * punya state penuh supaya migration berikutnya tidak repeat drift.
 *
 * Nama kolom STRICT PARALLEL ke outbound. Lihat komentar `tripType` di
 * `Bookings.ts` untuk future migration path ke multi-city `legs[]`.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`trip_type\` text DEFAULT 'one-way' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_date\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_ferry_ticket_id\` integer REFERENCES ferry_tickets(id);`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_origin_location\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_destination_location\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_schedule_time_label\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_ferry_class_name\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_ferry_class_type\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_unit_price\` numeric;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`return_total_estimate\` numeric;`)
  await db.run(sql`CREATE INDEX \`bookings_return_ferry_ticket_idx\` ON \`bookings\` (\`return_ferry_ticket_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`bookings_return_ferry_ticket_idx\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_total_estimate\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_unit_price\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_ferry_class_type\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_ferry_class_name\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_schedule_time_label\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_destination_location\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_origin_location\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_ferry_ticket_id\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`return_date\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`trip_type\`;`)
}
