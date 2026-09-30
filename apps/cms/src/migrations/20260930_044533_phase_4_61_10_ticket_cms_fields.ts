import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_ticket_badges_order_idx\` ON \`pages_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`pages_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_ticket_badges_order_idx\` ON \`posts_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`posts_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_ticket_badges_order_idx\` ON \`tours_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`tours_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_ticket_badges_order_idx\` ON \`yachts_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`yachts_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_ticket_badges_order_idx\` ON \`restaurants_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`restaurants_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_ticket_badges_order_idx\` ON \`venues_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`venues_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_ticket_badges_order_idx\` ON \`rentals_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`rentals_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_service_listing_ticket_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`color\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_ticket_badges_order_idx\` ON \`spa_blocks_service_listing_ticket_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_ticket_badges_parent_id_idx\` ON \`spa_blocks_service_listing_ticket_badges\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`posts_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`tours_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`yachts_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`restaurants_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`venues_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`rentals_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
  await db.run(sql`ALTER TABLE \`spa_blocks_service_listing\` ADD \`ticket_status_indicator\` text DEFAULT 'Instant Confirmation · Multi-Route Coverage';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_service_listing_ticket_badges\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`posts_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`tours_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`yachts_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`restaurants_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`venues_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`rentals_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
  await db.run(sql`ALTER TABLE \`spa_blocks_service_listing\` DROP COLUMN \`ticket_status_indicator\`;`)
}
