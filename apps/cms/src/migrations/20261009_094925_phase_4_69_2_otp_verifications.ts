import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.69.2 — OTP verifications table.
 *
 * Ephemeral storage untuk OTP (email + WA future). Semua sensitive values
 * di-hash sebelum simpan (lihat `apps/cms/src/collections/OtpVerifications.ts`
 * untuk kontrak). TTL + attempt-limit + rate-limit enforced di endpoint.
 *
 * Columns parallel dengan Payload collection schema v3 (Payload SQLite
 * adapter: `created_at` + `updated_at` otomatis via `timestamps: true`).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Payload v3 SQLite expects integer auto-increment PK (match other collections).
  await db.run(sql`
    CREATE TABLE \`otp_verifications\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`kind\` text DEFAULT 'email' NOT NULL,
      \`target_hash\` text NOT NULL,
      \`otp_hash\` text NOT NULL,
      \`attempts\` numeric DEFAULT 0,
      \`expires_at\` text NOT NULL,
      \`verified_at\` text,
      \`ip_hash\` text,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    );
  `)

  // Index untuk lookup cepat saat verify (target + kind + unexpired + unverified).
  await db.run(sql`CREATE INDEX \`otp_verifications_target_hash_idx\` ON \`otp_verifications\` (\`target_hash\`);`)
  await db.run(sql`CREATE INDEX \`otp_verifications_expires_at_idx\` ON \`otp_verifications\` (\`expires_at\`);`)

  // Payload v3 butuh kolom relasi di `payload_locked_documents_rels` untuk
  // tiap collection — dipakai internal untuk fitur "locked docs" (admin
  // concurrent edit guard). Tanpa ini, `payload.update()` crash dgn
  // "no such column: otp_verifications_id".
  await db.run(sql`
    ALTER TABLE \`payload_locked_documents_rels\`
    ADD \`otp_verifications_id\` integer REFERENCES \`otp_verifications\`(\`id\`) ON UPDATE no action ON DELETE cascade;
  `)
  await db.run(sql`
    CREATE INDEX \`payload_locked_documents_rels_otp_verifications_id_idx\`
    ON \`payload_locked_documents_rels\` (\`otp_verifications_id\`);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_otp_verifications_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`otp_verifications_id\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`otp_verifications_expires_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`otp_verifications_target_hash_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`otp_verifications\`;`)
}
