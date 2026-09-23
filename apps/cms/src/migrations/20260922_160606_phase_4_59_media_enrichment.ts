import { sql } from '@payloadcms/db-sqlite/drizzle'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

/**
 * Phase 4.59 addendum (2026-09-22) — Media library enrichment.
 *
 * Owner request: perkaya media collection dgn field organizational + legal
 * safety net. Full-set enhancement:
 *   - description (textarea max 500)
 *   - category (select enum)
 *   - tags (hasMany text → media_texts junction)
 *   - license (select enum, default 'unknown')
 *   - relatedDestination (relationship → media.related_destination_id FK)
 *   - relatedService (polymorphic relationship → media_rels junction)
 *
 * Total: 4 ALTER TABLE ADD COLUMN (media) + 2 CREATE TABLE (media_texts,
 * media_rels) + 15 CREATE INDEX + FKs.
 *
 * Kolom scalar nullable / punya default → tak butuh backfill. Zero data loss.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── Scalar columns di `media` ──────────────────────────────
  await db.run(sql`ALTER TABLE \`media\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`category\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`license\` text DEFAULT 'unknown';`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`related_destination_id\` integer REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`media_related_destination_idx\` ON \`media\` (\`related_destination_id\`);`)

  // ── Junction: media_texts (untuk `tags` hasMany text) ──────
  await db.run(sql`CREATE TABLE \`media_texts\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`media_texts_order_parent\` ON \`media_texts\` (\`order\`, \`parent_id\`);`)

  // ── Junction: media_rels (untuk `relatedService` polymorphic) ─
  await db.run(sql`CREATE TABLE \`media_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`tours_id\` integer,
    \`accommodations_id\` integer,
    \`water_activities_id\` integer,
    \`yachts_id\` integer,
    \`restaurants_id\` integer,
    \`venues_id\` integer,
    \`rentals_id\` integer,
    \`spa_id\` integer,
    \`ferry_tickets_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`tours_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`water_activities_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`yachts_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`restaurants_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`venues_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`rentals_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`spa_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`ferry_tickets_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`media_rels_order_idx\` ON \`media_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_parent_idx\` ON \`media_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_path_idx\` ON \`media_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_tours_id_idx\` ON \`media_rels\` (\`tours_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_accommodations_id_idx\` ON \`media_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_water_activities_id_idx\` ON \`media_rels\` (\`water_activities_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_yachts_id_idx\` ON \`media_rels\` (\`yachts_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_restaurants_id_idx\` ON \`media_rels\` (\`restaurants_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_venues_id_idx\` ON \`media_rels\` (\`venues_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_rentals_id_idx\` ON \`media_rels\` (\`rentals_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_spa_id_idx\` ON \`media_rels\` (\`spa_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_ferry_tickets_id_idx\` ON \`media_rels\` (\`ferry_tickets_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`media_rels\`;`)
  await db.run(sql`DROP TABLE \`media_texts\`;`)
  await db.run(sql`DROP INDEX \`media_related_destination_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`related_destination_id\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`license\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`description\`;`)
}
