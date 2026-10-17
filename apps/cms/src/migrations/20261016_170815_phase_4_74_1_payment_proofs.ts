import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.74.1 — Payment Proofs + Admin Notifications.
 *
 * HAND-WRITTEN. Auto-generated version dari `pnpm schema:new` menyertakan
 * drift (otp_verifications + booking_templates re-CREATE + down() rebuild
 * bookings yang DESTRUKTIF untuk column phase 4.69.5+). Konsisten dengan
 * konvensi phase 4.67.2a: strip drift dari `.ts`, biarkan `.json` snapshot
 * utuh untuk baseline akurat.
 *
 * Schema:
 * 1. Table baru `payment_proofs` + 5 indexes (booking, proof_file, reviewed_by, updated_at, created_at).
 * 2. Table baru `admin_notifications` + 5 indexes.
 * 3. Table baru `admin_notifications_read_by` (array sub-table) + 3 indexes.
 * 4. Kolom baru di `bookings`:
 *    - `latest_payment_proof_id` (FK → payment_proofs, SET NULL)
 *    - `payment_proof_attempts`  (numeric, default 0)
 * 5. Kolom baru di `payload_locked_documents_rels`:
 *    - `payment_proofs_id` + `admin_notifications_id` (FK + index).
 *
 * Rollback: DROP 3 table baru + removal 2 kolom bookings + 2 kolom rels
 * (SQLite 3.35+ supports DROP COLUMN).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── 1. payment_proofs ───
  await db.run(sql`CREATE TABLE \`payment_proofs\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`booking_id\` integer NOT NULL,
    \`booking_ref_snapshot\` text,
    \`sender_name\` text NOT NULL,
    \`sender_bank\` text NOT NULL,
    \`amount\` numeric NOT NULL,
    \`currency\` text DEFAULT 'IDR',
    \`transfer_date\` text NOT NULL,
    \`transfer_time\` text,
    \`proof_file_id\` integer NOT NULL,
    \`customer_note\` text,
    \`submitted_at\` text,
    \`submitted_from_ip_hash\` text,
    \`submitted_user_agent\` text,
    \`status\` text DEFAULT 'pending' NOT NULL,
    \`reviewed_at\` text,
    \`reviewed_by_id\` integer,
    \`rejected_reason\` text,
    \`internal_note\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`proof_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`reviewed_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`CREATE INDEX \`payment_proofs_booking_idx\` ON \`payment_proofs\` (\`booking_id\`);`)
  await db.run(sql`CREATE INDEX \`payment_proofs_proof_file_idx\` ON \`payment_proofs\` (\`proof_file_id\`);`)
  await db.run(sql`CREATE INDEX \`payment_proofs_reviewed_by_idx\` ON \`payment_proofs\` (\`reviewed_by_id\`);`)
  await db.run(sql`CREATE INDEX \`payment_proofs_status_submitted_idx\` ON \`payment_proofs\` (\`status\`, \`submitted_at\`);`)
  await db.run(sql`CREATE INDEX \`payment_proofs_updated_at_idx\` ON \`payment_proofs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payment_proofs_created_at_idx\` ON \`payment_proofs\` (\`created_at\`);`)

  // ─── 2. admin_notifications ───
  await db.run(sql`CREATE TABLE \`admin_notifications\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`type\` text NOT NULL,
    \`title\` text NOT NULL,
    \`body\` text,
    \`severity\` text DEFAULT 'info',
    \`booking_id\` integer,
    \`payment_proof_id\` integer,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`payment_proof_id\`) REFERENCES \`payment_proofs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`CREATE INDEX \`admin_notifications_type_idx\` ON \`admin_notifications\` (\`type\`);`)
  await db.run(sql`CREATE INDEX \`admin_notifications_booking_idx\` ON \`admin_notifications\` (\`booking_id\`);`)
  await db.run(sql`CREATE INDEX \`admin_notifications_payment_proof_idx\` ON \`admin_notifications\` (\`payment_proof_id\`);`)
  await db.run(sql`CREATE INDEX \`admin_notifications_updated_at_idx\` ON \`admin_notifications\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`admin_notifications_created_at_idx\` ON \`admin_notifications\` (\`created_at\`);`)

  // ─── 3. admin_notifications_read_by (array sub-table) ───
  await db.run(sql`CREATE TABLE \`admin_notifications_read_by\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`user_id\` integer NOT NULL,
    \`read_at\` text NOT NULL,
    FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`admin_notifications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`admin_notifications_read_by_order_idx\` ON \`admin_notifications_read_by\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`admin_notifications_read_by_parent_id_idx\` ON \`admin_notifications_read_by\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`admin_notifications_read_by_user_idx\` ON \`admin_notifications_read_by\` (\`user_id\`);`)

  // ─── 4. bookings — 2 kolom baru ───
  // SQLite ADD COLUMN dengan REFERENCES: FK didefinisikan tapi hanya
  // enforced di row baru (SQLite limitation). Konsisten dengan pola
  // Phase 4.67.2a (returnFerryTicket, returnXxx fields).
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`latest_payment_proof_id\` integer REFERENCES payment_proofs(id);`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`payment_proof_attempts\` numeric DEFAULT 0;`)
  await db.run(sql`CREATE INDEX \`bookings_latest_payment_proof_idx\` ON \`bookings\` (\`latest_payment_proof_id\`);`)

  // ─── 5. payload_locked_documents_rels ───
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`payment_proofs_id\` integer REFERENCES payment_proofs(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`admin_notifications_id\` integer REFERENCES admin_notifications(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payment_proofs_id_idx\` ON \`payload_locked_documents_rels\` (\`payment_proofs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_admin_notifications_id_idx\` ON \`payload_locked_documents_rels\` (\`admin_notifications_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse order: drop indexes + columns di parent dulu, lalu table.
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_admin_notifications_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_payment_proofs_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`admin_notifications_id\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`payment_proofs_id\`;`)

  await db.run(sql`DROP INDEX IF EXISTS \`bookings_latest_payment_proof_idx\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`payment_proof_attempts\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`latest_payment_proof_id\`;`)

  await db.run(sql`DROP TABLE IF EXISTS \`admin_notifications_read_by\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`admin_notifications\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`payment_proofs\`;`)
}
