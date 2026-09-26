import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`ferry_tickets_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`style\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_badges_order_idx\` ON \`ferry_tickets_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_badges_parent_id_idx\` ON \`ferry_tickets_badges\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`ferry_tickets_ferry_classes\` ADD \`original_price\` numeric;`)
  await db.run(sql`ALTER TABLE \`ferry_tickets\` ADD \`operator_logo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`ferry_tickets\` ADD \`booked_count\` numeric;`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_operator_logo_idx\` ON \`ferry_tickets\` (\`operator_logo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`ferry_tickets_badges\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_ferry_tickets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`destination_id\` integer NOT NULL,
  	\`category_id\` integer,
  	\`origin_location_id\` integer,
  	\`arrival_location_id\` integer,
  	\`origin\` text,
  	\`arrival\` text,
  	\`duration\` text,
  	\`operator\` text,
  	\`departure_time\` text,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`video_url\` text,
  	\`additional_remark\` text,
  	\`whatsapp_message\` text,
  	\`how_to_check_in\` text,
  	\`purchase_notice\` text,
  	\`additional_info\` text,
  	\`related_override\` text DEFAULT 'default',
  	\`related_section_title\` text,
  	\`related_card_style\` text DEFAULT 'curated',
  	\`related_max_items\` numeric DEFAULT 3,
  	\`related_selection_mode\` text DEFAULT 'same_type',
  	\`related_show_explore_all\` integer DEFAULT true,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`destination_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`origin_location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`arrival_location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets\`("id", "slug", "status", "sort_order", "is_featured", "title", "subtitle", "destination_id", "category_id", "origin_location_id", "arrival_location_id", "origin", "arrival", "duration", "operator", "departure_time", "description", "featured_image_id", "video_url", "additional_remark", "whatsapp_message", "how_to_check_in", "purchase_notice", "additional_info", "related_override", "related_section_title", "related_card_style", "related_max_items", "related_selection_mode", "related_show_explore_all", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "updated_at", "created_at") SELECT "id", "slug", "status", "sort_order", "is_featured", "title", "subtitle", "destination_id", "category_id", "origin_location_id", "arrival_location_id", "origin", "arrival", "duration", "operator", "departure_time", "description", "featured_image_id", "video_url", "additional_remark", "whatsapp_message", "how_to_check_in", "purchase_notice", "additional_info", "related_override", "related_section_title", "related_card_style", "related_max_items", "related_selection_mode", "related_show_explore_all", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "updated_at", "created_at" FROM \`ferry_tickets\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets\` RENAME TO \`ferry_tickets\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`ferry_tickets_slug_idx\` ON \`ferry_tickets\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_destination_idx\` ON \`ferry_tickets\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_category_idx\` ON \`ferry_tickets\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_origin_location_idx\` ON \`ferry_tickets\` (\`origin_location_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_arrival_location_idx\` ON \`ferry_tickets\` (\`arrival_location_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_featured_image_idx\` ON \`ferry_tickets\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_seo_seo_og_image_idx\` ON \`ferry_tickets\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_updated_at_idx\` ON \`ferry_tickets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_created_at_idx\` ON \`ferry_tickets\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`ferry_tickets_ferry_classes\` DROP COLUMN \`original_price\`;`)
}
