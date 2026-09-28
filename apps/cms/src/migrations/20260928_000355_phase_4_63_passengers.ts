import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`bookings_passengers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`passenger_type\` text DEFAULT 'adult' NOT NULL,
  	\`title\` text,
  	\`gender\` text,
  	\`nationality\` text,
  	\`first_name\` text NOT NULL,
  	\`last_name\` text NOT NULL,
  	\`date_of_birth\` text,
  	\`passport_number\` text,
  	\`passport_issue_date\` text,
  	\`passport_expiry_date\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`bookings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`bookings_passengers_order_idx\` ON \`bookings_passengers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`bookings_passengers_parent_id_idx\` ON \`bookings_passengers\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`contact_phone_region\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`contact_phone\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`contact_phone_is_whatsapp\` integer DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`bookings_passengers\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`contact_phone_region\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`contact_phone\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`contact_phone_is_whatsapp\`;`)
}
