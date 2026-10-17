import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.75 — Admin Flow Linearization: E-Ticket + Receipt Bundling.
 *
 * HAND-WRITTEN. Auto-generated version (`pnpm schema:new`) menyertakan drift
 * berat (booking_templates re-CREATE 1300+ baris HTML template defaults).
 * Konsisten dengan konvensi Phase 4.74.1: strip drift dari `.ts`, biarkan
 * `.json` snapshot utuh untuk baseline akurat.
 *
 * Schema delta:
 * 1. Table baru `bookings_rels` — generic join table untuk field `hasMany`
 *    relationship/upload di Bookings. Discriminator `path` membedakan field
 *    (saat ini: `eTickets`). Pattern Payload v3 standard.
 *      - id, order, parent_id (FK bookings), path, media_id (FK media)
 *      - 4 index: order, parent, path, media_id
 * 2. Kolom baru di `bookings`:
 *      - `e_ticket_sent_at` (text ISO timestamp) — frozen on first-send.
 *
 * Rationale:
 *   - `eTickets` field (upload hasMany) → butuh join table; tidak bisa pakai
 *     foreign key kolom tunggal karena satu booking bisa punya N e-ticket
 *     (roundtrip: outbound + return).
 *   - `eTicketSentAt` → audit timestamp, mirror pola `sentTicketAt` existing.
 *
 * Rollback: DROP table bookings_rels + DROP column bookings.e_ticket_sent_at.
 * SQLite 3.35+ supports native DROP COLUMN (no __new_bookings rebuild needed).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── 1. bookings_rels (hasMany join table) ───
  await db.run(sql`CREATE TABLE \`bookings_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`media_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`bookings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`bookings_rels_order_idx\` ON \`bookings_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`bookings_rels_parent_idx\` ON \`bookings_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`bookings_rels_path_idx\` ON \`bookings_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`bookings_rels_media_id_idx\` ON \`bookings_rels\` (\`media_id\`);`)

  // ─── 2. bookings.e_ticket_sent_at ───
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`e_ticket_sent_at\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse order: drop column first (SQLite doesn't require FK off for simple
  // DROP COLUMN since 3.35), then drop join table + its indexes (DROP TABLE
  // cascades indexes automatically).
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`e_ticket_sent_at\`;`)
  await db.run(sql`DROP TABLE \`bookings_rels\`;`)
}
