import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── Idempotent cleanup — safe to re-run after partial failure. ──
  // A prior attempt of this migration failed mid-way at the __new_posts
  // rebuild (FK constraint since blog_categories was still empty). This
  // block drops any leftover partial state so re-running from scratch is
  // deterministic.
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_posts\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`blog_categories_slug_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`blog_categories_parent_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`blog_categories_icon_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`blog_categories_featured_image_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`blog_categories_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`blog_categories_created_at_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`blog_categories\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags_slug_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags_created_at_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`tags\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  await db.run(sql`CREATE TABLE \`blog_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`parent_id\` integer,
  	\`description\` text,
  	\`icon_id\` integer,
  	\`featured_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_categories_slug_idx\` ON \`blog_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`blog_categories_parent_idx\` ON \`blog_categories\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_categories_icon_idx\` ON \`blog_categories\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_categories_featured_image_idx\` ON \`blog_categories\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_categories_updated_at_idx\` ON \`blog_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_categories_created_at_idx\` ON \`blog_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`tags\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`color\` text,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tags_slug_idx\` ON \`tags\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`tags_updated_at_idx\` ON \`tags\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tags_created_at_idx\` ON \`tags\` (\`created_at\`);`)

  // ── Seed blog_categories from Categories WHERE module='blog'. ──
  // IDs are preserved so existing posts.category_id (e.g. =7) still
  // resolve after the FK swap to blog_categories. Categories.parent_id
  // may point at non-blog categories (cross-module reference); we set
  // parent to NULL to keep blog_categories self-consistent.
  await db.run(sql`INSERT INTO \`blog_categories\` (id, name, slug, parent_id, description, icon_id, featured_image_id, status, sort_order, updated_at, created_at) SELECT id, name, slug, NULL, description, icon_id, featured_image_id, status, sort_order, updated_at, created_at FROM \`categories\` WHERE module='blog';`)

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`pages_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_post_list\` RENAME TO \`pages_blocks_post_list\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_order_idx\` ON \`pages_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_parent_id_idx\` ON \`pages_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_path_idx\` ON \`pages_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_filter_category_idx\` ON \`pages_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_background_background_image_idx\` ON \`pages_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_posts_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_posts_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`posts_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts_blocks_post_list\` RENAME TO \`posts_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_order_idx\` ON \`posts_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_parent_id_idx\` ON \`posts_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_path_idx\` ON \`posts_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_filter_category_idx\` ON \`posts_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_background_background_image_idx\` ON \`posts_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`published_at\` text,
  	\`author_id\` integer NOT NULL,
  	\`reading_time_minutes\` numeric,
  	\`is_featured\` integer DEFAULT false,
  	\`related_override_enabled\` integer DEFAULT false,
  	\`related_override_heading\` text,
  	\`related_override_selection_mode\` text,
  	\`related_override_limit\` numeric,
  	\`excerpt\` text,
  	\`category_id\` integer NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`body\` text NOT NULL,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_posts\`("id", "title", "slug", "published_at", "author_id", "reading_time_minutes", "is_featured", "related_override_enabled", "related_override_heading", "related_override_selection_mode", "related_override_limit", "excerpt", "category_id", "featured_image_id", "body", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "status", "sort_order", "updated_at", "created_at") SELECT "id", "title", "slug", "published_at", "author_id", "reading_time_minutes", "is_featured", "related_override_enabled", "related_override_heading", "related_override_selection_mode", "related_override_limit", "excerpt", "category_id", "featured_image_id", "body", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "status", "sort_order", "updated_at", "created_at" FROM \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts\` RENAME TO \`posts\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_author_idx\` ON \`posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_category_idx\` ON \`posts\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_featured_image_idx\` ON \`posts\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_seo_seo_og_image_idx\` ON \`posts\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  // ── posts_rels rebuild — hard reset for tags. ──
  // Old posts_rels has (id, order, parent_id, path, categories_id, posts_id);
  // new shape is (id, order, parent_id, path, posts_id, tags_id). Rows where
  // categories_id IS NOT NULL were tag-references to Categories (path='tags'
  // pointed at blog categories) — dropped per the hard-reset choice. Users
  // re-tag posts manually with Tag docs after the migration.
  await db.run(sql`INSERT INTO \`__new_posts_rels\`("id", "order", "parent_id", "path", "posts_id", "tags_id") SELECT "id", "order", "parent_id", "path", "posts_id", NULL FROM \`posts_rels\` WHERE \`categories_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts_rels\` RENAME TO \`posts_rels\`;`)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_tags_id_idx\` ON \`posts_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_tours_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_tours_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`tours_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_tours_blocks_post_list\` RENAME TO \`tours_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_order_idx\` ON \`tours_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_parent_id_idx\` ON \`tours_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_path_idx\` ON \`tours_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_filter_category_idx\` ON \`tours_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_background_background_image_idx\` ON \`tours_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`accommodations_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_blocks_post_list\` RENAME TO \`accommodations_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_order_idx\` ON \`accommodations_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_parent_id_idx\` ON \`accommodations_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_path_idx\` ON \`accommodations_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_filter_category_idx\` ON \`accommodations_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_background_background_im_idx\` ON \`accommodations_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_water_activities_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_water_activities_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`water_activities_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_water_activities_blocks_post_list\` RENAME TO \`water_activities_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_order_idx\` ON \`water_activities_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_parent_id_idx\` ON \`water_activities_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_path_idx\` ON \`water_activities_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_filter_category_idx\` ON \`water_activities_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_background_background__idx\` ON \`water_activities_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_yachts_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_yachts_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`yachts_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_yachts_blocks_post_list\` RENAME TO \`yachts_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_order_idx\` ON \`yachts_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_parent_id_idx\` ON \`yachts_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_path_idx\` ON \`yachts_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_filter_category_idx\` ON \`yachts_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_background_background_image_idx\` ON \`yachts_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_restaurants_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_restaurants_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`restaurants_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_restaurants_blocks_post_list\` RENAME TO \`restaurants_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_order_idx\` ON \`restaurants_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_parent_id_idx\` ON \`restaurants_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_path_idx\` ON \`restaurants_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_filter_category_idx\` ON \`restaurants_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_background_background_image_idx\` ON \`restaurants_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_venues_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_venues_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`venues_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_venues_blocks_post_list\` RENAME TO \`venues_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_order_idx\` ON \`venues_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_parent_id_idx\` ON \`venues_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_path_idx\` ON \`venues_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_filter_category_idx\` ON \`venues_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_background_background_image_idx\` ON \`venues_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_rentals_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_rentals_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`rentals_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_rentals_blocks_post_list\` RENAME TO \`rentals_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_order_idx\` ON \`rentals_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_parent_id_idx\` ON \`rentals_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_path_idx\` ON \`rentals_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_filter_category_idx\` ON \`rentals_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_background_background_image_idx\` ON \`rentals_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_spa_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_spa_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`spa_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_spa_blocks_post_list\` RENAME TO \`spa_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_order_idx\` ON \`spa_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_parent_id_idx\` ON \`spa_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_path_idx\` ON \`spa_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_filter_category_idx\` ON \`spa_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_background_background_image_idx\` ON \`spa_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_ferry_tickets_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`blog_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets_blocks_post_list\` RENAME TO \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_order_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_parent_id_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_path_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_filter_category_idx\` ON \`ferry_tickets_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_background_background_ima_idx\` ON \`ferry_tickets_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`blog_categories_id\` integer REFERENCES blog_categories(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`tags_id\` integer REFERENCES tags(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`)

  // ── Delete blog rows from Categories. ──
  // All references have been migrated to blog_categories. The 'blog'
  // value has been removed from Categories.module enum in the code
  // (docs/phases/phase-4.35 §4.35.3), so leaving these rows would be an
  // invalid enum state.
  await db.run(sql`DELETE FROM \`categories\` WHERE module='blog';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`blog_categories\`;`)
  await db.run(sql`DROP TABLE \`tags\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`pages_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_post_list\` RENAME TO \`pages_blocks_post_list\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_order_idx\` ON \`pages_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_parent_id_idx\` ON \`pages_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_path_idx\` ON \`pages_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_filter_category_idx\` ON \`pages_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_background_background_image_idx\` ON \`pages_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_posts_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_posts_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`posts_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts_blocks_post_list\` RENAME TO \`posts_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_order_idx\` ON \`posts_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_parent_id_idx\` ON \`posts_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_path_idx\` ON \`posts_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_filter_category_idx\` ON \`posts_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_background_background_image_idx\` ON \`posts_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`published_at\` text,
  	\`author_id\` integer NOT NULL,
  	\`reading_time_minutes\` numeric,
  	\`is_featured\` integer DEFAULT false,
  	\`related_override_enabled\` integer DEFAULT false,
  	\`related_override_heading\` text,
  	\`related_override_selection_mode\` text,
  	\`related_override_limit\` numeric,
  	\`excerpt\` text,
  	\`category_id\` integer NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`body\` text NOT NULL,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_posts\`("id", "title", "slug", "published_at", "author_id", "reading_time_minutes", "is_featured", "related_override_enabled", "related_override_heading", "related_override_selection_mode", "related_override_limit", "excerpt", "category_id", "featured_image_id", "body", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "status", "sort_order", "updated_at", "created_at") SELECT "id", "title", "slug", "published_at", "author_id", "reading_time_minutes", "is_featured", "related_override_enabled", "related_override_heading", "related_override_selection_mode", "related_override_limit", "excerpt", "category_id", "featured_image_id", "body", "seo_meta_title", "seo_meta_description", "seo_og_image_id", "status", "sort_order", "updated_at", "created_at" FROM \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts\` RENAME TO \`posts\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_author_idx\` ON \`posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_category_idx\` ON \`posts\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_featured_image_idx\` ON \`posts\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_seo_seo_og_image_idx\` ON \`posts\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_posts_rels\`("id", "order", "parent_id", "path", "posts_id", "categories_id") SELECT "id", "order", "parent_id", "path", "posts_id", "categories_id" FROM \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts_rels\` RENAME TO \`posts_rels\`;`)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_categories_id_idx\` ON \`posts_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_tours_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_tours_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`tours_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_tours_blocks_post_list\` RENAME TO \`tours_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_order_idx\` ON \`tours_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_parent_id_idx\` ON \`tours_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_path_idx\` ON \`tours_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_filter_category_idx\` ON \`tours_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_background_background_image_idx\` ON \`tours_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`accommodations_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_blocks_post_list\` RENAME TO \`accommodations_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_order_idx\` ON \`accommodations_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_parent_id_idx\` ON \`accommodations_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_path_idx\` ON \`accommodations_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_filter_category_idx\` ON \`accommodations_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_background_background_im_idx\` ON \`accommodations_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_water_activities_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_water_activities_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`water_activities_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_water_activities_blocks_post_list\` RENAME TO \`water_activities_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_order_idx\` ON \`water_activities_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_parent_id_idx\` ON \`water_activities_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_path_idx\` ON \`water_activities_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_filter_category_idx\` ON \`water_activities_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_background_background__idx\` ON \`water_activities_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_yachts_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_yachts_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`yachts_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_yachts_blocks_post_list\` RENAME TO \`yachts_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_order_idx\` ON \`yachts_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_parent_id_idx\` ON \`yachts_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_path_idx\` ON \`yachts_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_filter_category_idx\` ON \`yachts_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_background_background_image_idx\` ON \`yachts_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_restaurants_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_restaurants_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`restaurants_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_restaurants_blocks_post_list\` RENAME TO \`restaurants_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_order_idx\` ON \`restaurants_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_parent_id_idx\` ON \`restaurants_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_path_idx\` ON \`restaurants_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_filter_category_idx\` ON \`restaurants_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_background_background_image_idx\` ON \`restaurants_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_venues_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_venues_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`venues_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_venues_blocks_post_list\` RENAME TO \`venues_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_order_idx\` ON \`venues_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_parent_id_idx\` ON \`venues_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_path_idx\` ON \`venues_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_filter_category_idx\` ON \`venues_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_background_background_image_idx\` ON \`venues_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_rentals_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_rentals_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`rentals_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_rentals_blocks_post_list\` RENAME TO \`rentals_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_order_idx\` ON \`rentals_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_parent_id_idx\` ON \`rentals_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_path_idx\` ON \`rentals_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_filter_category_idx\` ON \`rentals_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_background_background_image_idx\` ON \`rentals_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_spa_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_spa_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`spa_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_spa_blocks_post_list\` RENAME TO \`spa_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_order_idx\` ON \`spa_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_parent_id_idx\` ON \`spa_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_path_idx\` ON \`spa_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_filter_category_idx\` ON \`spa_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_background_background_image_idx\` ON \`spa_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_ferry_tickets_blocks_post_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Latest Stories',
  	\`description\` text,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`columns\` text DEFAULT '3',
  	\`filter_category_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text DEFAULT 'View All Articles',
  	\`view_all_link\` text DEFAULT '/blog',
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
  	\`background_type\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay_opacity\` numeric DEFAULT 40,
  	\`pad_enabled\` integer DEFAULT false,
  	\`pad_top\` text DEFAULT 'inherit',
  	\`pad_bottom\` text DEFAULT 'inherit',
  	\`pad_top_mob_px\` numeric,
  	\`pad_top_desk_px\` numeric,
  	\`pad_btm_mob_px\` numeric,
  	\`pad_btm_desk_px\` numeric,
  	\`spacing_override_enabled\` integer DEFAULT false,
  	\`spacing_override_mt\` text,
  	\`spacing_override_mb\` text,
  	\`spacing_override_top_px\` numeric,
  	\`spacing_override_btm_px\` numeric,
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets_blocks_post_list\`("_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "description", "limit", "featured_only", "columns", "filter_category_id", "show_view_all", "view_all_text", "view_all_link", "section_padding", "content_alignment", "container_width", "entry_animation", "background_type", "background_color", "background_image_id", "background_overlay_opacity", "pad_enabled", "pad_top", "pad_bottom", "pad_top_mob_px", "pad_top_desk_px", "pad_btm_mob_px", "pad_btm_desk_px", "spacing_override_enabled", "spacing_override_mt", "spacing_override_mb", "spacing_override_top_px", "spacing_override_btm_px", "ts_heading_color", "ts_heading_anim_in", "ts_description_color", "ts_description_anim_in", "block_name" FROM \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets_blocks_post_list\` RENAME TO \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_order_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_parent_id_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_path_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_filter_category_idx\` ON \`ferry_tickets_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_background_background_ima_idx\` ON \`ferry_tickets_blocks_post_list\` (\`background_image_id\`);`)
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`service_types_id\`) REFERENCES \`service_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`destinations_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`destination_types_id\`) REFERENCES \`destination_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
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
  	FOREIGN KEY (\`newsletter_subscribers_id\`) REFERENCES \`newsletter_subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "posts_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id") SELECT "id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "posts_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id" FROM \`payload_locked_documents_rels\`;`)
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
}
