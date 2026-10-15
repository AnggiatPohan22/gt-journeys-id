import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.69.6 — BookingTemplates global.
 *
 * Tabel singleton `booking_templates` (single-row seperti global lain
 * di Payload v3) + sub-table `booking_templates_bank_accounts` untuk
 * array bank accounts.
 *
 * Semua kolom text nullable di DB — Payload enforce `required` di
 * validation layer. Default value diisi dari collection schema saat
 * first-read via Payload adapter.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Main global table — 1 row only, Payload maintain singleton.
  await db.run(sql`
    CREATE TABLE \`booking_templates\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`payment_email_subject\` text,
      \`payment_email_body\` text,
      \`payment_whatsapp_body\` text,
      \`ticket_email_subject\` text,
      \`ticket_email_body\` text,
      \`ticket_whatsapp_body\` text,
      \`reschedule_email_subject\` text,
      \`reschedule_email_body\` text,
      \`reschedule_whatsapp_body\` text,
      \`cancel_email_subject\` text,
      \`cancel_email_body\` text,
      \`cancel_whatsapp_body\` text,
      \`otp_email_subject\` text,
      \`otp_email_body\` text,
      \`admin_whatsapp\` text,
      \`admin_name\` text,
      \`payment_deadline_hours\` numeric DEFAULT 24,
      \`variables_reference_doc\` text,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    );
  `)

  // Sub-table untuk array bankAccounts — Payload convention: parent_id FK + _order.
  await db.run(sql`
    CREATE TABLE \`booking_templates_bank_accounts\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`bank_name\` text NOT NULL,
      \`account_number\` text NOT NULL,
      \`account_holder\` text NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`booking_templates\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `)
  await db.run(sql`CREATE INDEX \`booking_templates_bank_accounts_parent_idx\` ON \`booking_templates_bank_accounts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`booking_templates_bank_accounts_order_idx\` ON \`booking_templates_bank_accounts\` (\`_order\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`booking_templates_bank_accounts_order_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`booking_templates_bank_accounts_parent_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`booking_templates_bank_accounts\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`booking_templates\`;`)
}
