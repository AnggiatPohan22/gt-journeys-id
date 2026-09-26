import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Idempotent guards: a partially-applied earlier run of this migration may
  // have left `locations` and the transient `__new_*` scratch tables behind.
  // Clean them so a re-run succeeds. `__new_*` are drizzle scratch tables that
  // are always dropped/renamed within this same migration — safe to drop.
  await db.run(sql`DROP TABLE IF EXISTS \`__new_ferry_tickets_schedule_time\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_ferry_tickets\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`locations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`terminal_name\` text,
  	\`country\` text,
  	\`code\` text,
  	\`slug\` text NOT NULL,
  	\`is_active\` integer DEFAULT true,
  	\`sort_order\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`locations_slug_idx\` ON \`locations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`locations_updated_at_idx\` ON \`locations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`locations_created_at_idx\` ON \`locations\` (\`created_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_ferry_tickets_schedule_time\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`departure_location_id\` integer,
  	\`arrival_location_id\` integer,
  	\`departure_port\` text,
  	\`arrival_port\` text,
  	\`departure_time\` text NOT NULL,
  	\`arrival_time\` text NOT NULL,
  	\`duration\` text,
  	\`notes\` text,
  	FOREIGN KEY (\`departure_location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`arrival_location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets_schedule_time\`("_order", "_parent_id", "id", "departure_port", "arrival_port", "departure_time", "arrival_time", "duration", "notes") SELECT "_order", "_parent_id", "id", "departure_port", "arrival_port", "departure_time", "arrival_time", "duration", "notes" FROM \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets_schedule_time\` RENAME TO \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_order_idx\` ON \`ferry_tickets_schedule_time\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_parent_id_idx\` ON \`ferry_tickets_schedule_time\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_departure_location_idx\` ON \`ferry_tickets_schedule_time\` (\`departure_location_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_arrival_location_idx\` ON \`ferry_tickets_schedule_time\` (\`arrival_location_id\`);`)
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
  await db.run(sql`INSERT INTO \`__new_ferry_tickets\`("id", "slug", "status", "sort_order", "is_featured", "title", "subtitle", "destination_id", "category_id", "origin", "arrival", "duration", "operator", "departure_time", "description", "featured_image_id", "video_url", "additional_remark", "whatsapp_message", "how_to_check_in", "purchase_notice", "additional_info", "related_override", "related_section_title", "related_card_style", "related_max_items", "related_selection_mode", "related_show_explore_all", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "updated_at", "created_at") SELECT "id", "slug", "status", "sort_order", "is_featured", "title", "subtitle", "destination_id", "category_id", "origin", "arrival", "duration", "operator", "departure_time", "description", "featured_image_id", "video_url", "additional_remark", "whatsapp_message", "how_to_check_in", "purchase_notice", "additional_info", "related_override", "related_section_title", "related_card_style", "related_max_items", "related_selection_mode", "related_show_explore_all", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "updated_at", "created_at" FROM \`ferry_tickets\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets\` RENAME TO \`ferry_tickets\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`ferry_tickets_slug_idx\` ON \`ferry_tickets\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_destination_idx\` ON \`ferry_tickets\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_category_idx\` ON \`ferry_tickets\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_origin_location_idx\` ON \`ferry_tickets\` (\`origin_location_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_arrival_location_idx\` ON \`ferry_tickets\` (\`arrival_location_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_featured_image_idx\` ON \`ferry_tickets\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_seo_seo_og_image_idx\` ON \`ferry_tickets\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_updated_at_idx\` ON \`ferry_tickets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_created_at_idx\` ON \`ferry_tickets\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`locations_id\` integer REFERENCES locations(id);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_locations_id_idx\` ON \`payload_locked_documents_rels\` (\`locations_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`locations\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_ferry_tickets_schedule_time\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`departure_port\` text NOT NULL,
  	\`arrival_port\` text NOT NULL,
  	\`departure_time\` text NOT NULL,
  	\`arrival_time\` text NOT NULL,
  	\`duration\` text,
  	\`notes\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets_schedule_time\`("_order", "_parent_id", "id", "departure_port", "arrival_port", "departure_time", "arrival_time", "duration", "notes") SELECT "_order", "_parent_id", "id", "departure_port", "arrival_port", "departure_time", "arrival_time", "duration", "notes" FROM \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets_schedule_time\` RENAME TO \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_order_idx\` ON \`ferry_tickets_schedule_time\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_parent_id_idx\` ON \`ferry_tickets_schedule_time\` (\`_parent_id\`);`)
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
  	\`origin\` text NOT NULL,
  	\`arrival\` text NOT NULL,
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
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets\`("id", "slug", "status", "sort_order", "is_featured", "title", "subtitle", "destination_id", "category_id", "origin", "arrival", "duration", "operator", "departure_time", "description", "featured_image_id", "video_url", "additional_remark", "whatsapp_message", "how_to_check_in", "purchase_notice", "additional_info", "related_override", "related_section_title", "related_card_style", "related_max_items", "related_selection_mode", "related_show_explore_all", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "updated_at", "created_at") SELECT "id", "slug", "status", "sort_order", "is_featured", "title", "subtitle", "destination_id", "category_id", "origin", "arrival", "duration", "operator", "departure_time", "description", "featured_image_id", "video_url", "additional_remark", "whatsapp_message", "how_to_check_in", "purchase_notice", "additional_info", "related_override", "related_section_title", "related_card_style", "related_max_items", "related_selection_mode", "related_show_explore_all", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "updated_at", "created_at" FROM \`ferry_tickets\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets\` RENAME TO \`ferry_tickets\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`ferry_tickets_slug_idx\` ON \`ferry_tickets\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_destination_idx\` ON \`ferry_tickets\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_category_idx\` ON \`ferry_tickets\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_featured_image_idx\` ON \`ferry_tickets\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_seo_seo_og_image_idx\` ON \`ferry_tickets\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_updated_at_idx\` ON \`ferry_tickets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_created_at_idx\` ON \`ferry_tickets\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`service_types_id\` integer,
  	\`destinations_id\` integer,
  	\`destination_types_id\` integer,
  	\`categories_id\` integer,
  	\`testimonials_id\` integer,
  	\`authors_id\` integer,
  	\`posts_id\` integer,
  	\`blog_categories_id\` integer,
  	\`tags_id\` integer,
  	\`tours_id\` integer,
  	\`accommodations_id\` integer,
  	\`water_activities_id\` integer,
  	\`yachts_id\` integer,
  	\`restaurants_id\` integer,
  	\`venues_id\` integer,
  	\`rentals_id\` integer,
  	\`spa_id\` integer,
  	\`ferry_tickets_id\` integer,
  	\`menus_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	\`newsletter_subscribers_id\` integer,
  	\`chat_visitors_id\` integer,
  	\`chat_messages_id\` integer,
  	\`chat_blocked_events_id\` integer,
  	\`payload_folders_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`service_types_id\`) REFERENCES \`service_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`destinations_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`destination_types_id\`) REFERENCES \`destination_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_categories_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tours_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`water_activities_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`yachts_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`restaurants_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`venues_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rentals_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`spa_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`ferry_tickets_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`menus_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`newsletter_subscribers_id\`) REFERENCES \`newsletter_subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`chat_visitors_id\`) REFERENCES \`chat_visitors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`chat_messages_id\`) REFERENCES \`chat_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`chat_blocked_events_id\`) REFERENCES \`chat_blocked_events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_folders_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "posts_id", "blog_categories_id", "tags_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id", "chat_visitors_id", "chat_messages_id", "chat_blocked_events_id", "payload_folders_id") SELECT "id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "posts_id", "blog_categories_id", "tags_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id", "chat_visitors_id", "chat_messages_id", "chat_blocked_events_id", "payload_folders_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_service_types_id_idx\` ON \`payload_locked_documents_rels\` (\`service_types_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_destinations_id_idx\` ON \`payload_locked_documents_rels\` (\`destinations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_destination_types_id_idx\` ON \`payload_locked_documents_rels\` (\`destination_types_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tours_id_idx\` ON \`payload_locked_documents_rels\` (\`tours_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_accommodations_id_idx\` ON \`payload_locked_documents_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_water_activities_id_idx\` ON \`payload_locked_documents_rels\` (\`water_activities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_yachts_id_idx\` ON \`payload_locked_documents_rels\` (\`yachts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_restaurants_id_idx\` ON \`payload_locked_documents_rels\` (\`restaurants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_venues_id_idx\` ON \`payload_locked_documents_rels\` (\`venues_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_rentals_id_idx\` ON \`payload_locked_documents_rels\` (\`rentals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_spa_id_idx\` ON \`payload_locked_documents_rels\` (\`spa_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_ferry_tickets_id_idx\` ON \`payload_locked_documents_rels\` (\`ferry_tickets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_menus_id_idx\` ON \`payload_locked_documents_rels\` (\`menus_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_newsletter_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`newsletter_subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_visitors_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_visitors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_blocked_events_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_blocked_events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payload_folders_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_folders_id\`);`)
}
