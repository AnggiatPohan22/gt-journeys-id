import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_order_idx\` ON \`pages_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_parent_id_idx\` ON \`pages_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_path_idx\` ON \`pages_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_filter_category_idx\` ON \`pages_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_post_list_background_background_image_idx\` ON \`pages_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_post_order_idx\` ON \`pages_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_post_parent_id_idx\` ON \`pages_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_post_path_idx\` ON \`pages_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_post_featured_post_idx\` ON \`pages_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_post_background_background_image_idx\` ON \`pages_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_category_grid_order_idx\` ON \`pages_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_category_grid_parent_id_idx\` ON \`pages_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_category_grid_path_idx\` ON \`pages_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_category_grid_background_background_image_idx\` ON \`pages_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_popular_posts_order_idx\` ON \`pages_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_popular_posts_parent_id_idx\` ON \`pages_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_popular_posts_path_idx\` ON \`pages_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_popular_posts_background_background_image_idx\` ON \`pages_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_ad_slot_order_idx\` ON \`pages_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_ad_slot_parent_id_idx\` ON \`pages_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_ad_slot_path_idx\` ON \`pages_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_order_idx\` ON \`posts_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_parent_id_idx\` ON \`posts_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_path_idx\` ON \`posts_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_filter_category_idx\` ON \`posts_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_post_list_background_background_image_idx\` ON \`posts_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_featured_post_order_idx\` ON \`posts_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_featured_post_parent_id_idx\` ON \`posts_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_featured_post_path_idx\` ON \`posts_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_featured_post_featured_post_idx\` ON \`posts_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_featured_post_background_background_image_idx\` ON \`posts_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_category_grid_order_idx\` ON \`posts_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_category_grid_parent_id_idx\` ON \`posts_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_category_grid_path_idx\` ON \`posts_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_category_grid_background_background_image_idx\` ON \`posts_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_popular_posts_order_idx\` ON \`posts_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_popular_posts_parent_id_idx\` ON \`posts_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_popular_posts_path_idx\` ON \`posts_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_popular_posts_background_background_image_idx\` ON \`posts_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_ad_slot_order_idx\` ON \`posts_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_ad_slot_parent_id_idx\` ON \`posts_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_ad_slot_path_idx\` ON \`posts_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_order_idx\` ON \`tours_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_parent_id_idx\` ON \`tours_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_path_idx\` ON \`tours_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_filter_category_idx\` ON \`tours_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_post_list_background_background_image_idx\` ON \`tours_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_featured_post_order_idx\` ON \`tours_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_featured_post_parent_id_idx\` ON \`tours_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_featured_post_path_idx\` ON \`tours_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_featured_post_featured_post_idx\` ON \`tours_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_featured_post_background_background_image_idx\` ON \`tours_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_category_grid_order_idx\` ON \`tours_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_category_grid_parent_id_idx\` ON \`tours_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_category_grid_path_idx\` ON \`tours_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_category_grid_background_background_image_idx\` ON \`tours_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_popular_posts_order_idx\` ON \`tours_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_popular_posts_parent_id_idx\` ON \`tours_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_popular_posts_path_idx\` ON \`tours_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_popular_posts_background_background_image_idx\` ON \`tours_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_ad_slot_order_idx\` ON \`tours_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_ad_slot_parent_id_idx\` ON \`tours_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_ad_slot_path_idx\` ON \`tours_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_order_idx\` ON \`accommodations_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_parent_id_idx\` ON \`accommodations_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_path_idx\` ON \`accommodations_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_filter_category_idx\` ON \`accommodations_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_post_list_background_background_im_idx\` ON \`accommodations_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_featured_post_order_idx\` ON \`accommodations_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_featured_post_parent_id_idx\` ON \`accommodations_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_featured_post_path_idx\` ON \`accommodations_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_featured_post_featured_post_idx\` ON \`accommodations_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_featured_post_background_backgroun_idx\` ON \`accommodations_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_category_grid_order_idx\` ON \`accommodations_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_category_grid_parent_id_idx\` ON \`accommodations_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_category_grid_path_idx\` ON \`accommodations_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_category_grid_background_backgroun_idx\` ON \`accommodations_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_popular_posts_order_idx\` ON \`accommodations_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_popular_posts_parent_id_idx\` ON \`accommodations_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_popular_posts_path_idx\` ON \`accommodations_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_popular_posts_background_backgroun_idx\` ON \`accommodations_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_ad_slot_order_idx\` ON \`accommodations_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_ad_slot_parent_id_idx\` ON \`accommodations_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_ad_slot_path_idx\` ON \`accommodations_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_order_idx\` ON \`water_activities_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_parent_id_idx\` ON \`water_activities_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_path_idx\` ON \`water_activities_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_filter_category_idx\` ON \`water_activities_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_post_list_background_background__idx\` ON \`water_activities_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_featured_post_order_idx\` ON \`water_activities_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_featured_post_parent_id_idx\` ON \`water_activities_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_featured_post_path_idx\` ON \`water_activities_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_featured_post_featured_post_idx\` ON \`water_activities_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_featured_post_background_backgro_idx\` ON \`water_activities_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_category_grid_order_idx\` ON \`water_activities_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_category_grid_parent_id_idx\` ON \`water_activities_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_category_grid_path_idx\` ON \`water_activities_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_category_grid_background_backgro_idx\` ON \`water_activities_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_popular_posts_order_idx\` ON \`water_activities_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_popular_posts_parent_id_idx\` ON \`water_activities_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_popular_posts_path_idx\` ON \`water_activities_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_popular_posts_background_backgro_idx\` ON \`water_activities_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_ad_slot_order_idx\` ON \`water_activities_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_ad_slot_parent_id_idx\` ON \`water_activities_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_ad_slot_path_idx\` ON \`water_activities_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_order_idx\` ON \`yachts_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_parent_id_idx\` ON \`yachts_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_path_idx\` ON \`yachts_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_filter_category_idx\` ON \`yachts_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_post_list_background_background_image_idx\` ON \`yachts_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_featured_post_order_idx\` ON \`yachts_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_featured_post_parent_id_idx\` ON \`yachts_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_featured_post_path_idx\` ON \`yachts_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_featured_post_featured_post_idx\` ON \`yachts_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_featured_post_background_background_image_idx\` ON \`yachts_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_category_grid_order_idx\` ON \`yachts_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_category_grid_parent_id_idx\` ON \`yachts_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_category_grid_path_idx\` ON \`yachts_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_category_grid_background_background_image_idx\` ON \`yachts_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_popular_posts_order_idx\` ON \`yachts_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_popular_posts_parent_id_idx\` ON \`yachts_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_popular_posts_path_idx\` ON \`yachts_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_popular_posts_background_background_image_idx\` ON \`yachts_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_ad_slot_order_idx\` ON \`yachts_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_ad_slot_parent_id_idx\` ON \`yachts_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_ad_slot_path_idx\` ON \`yachts_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_order_idx\` ON \`restaurants_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_parent_id_idx\` ON \`restaurants_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_path_idx\` ON \`restaurants_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_filter_category_idx\` ON \`restaurants_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_post_list_background_background_image_idx\` ON \`restaurants_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_featured_post_order_idx\` ON \`restaurants_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_featured_post_parent_id_idx\` ON \`restaurants_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_featured_post_path_idx\` ON \`restaurants_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_featured_post_featured_post_idx\` ON \`restaurants_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_featured_post_background_background_i_idx\` ON \`restaurants_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_category_grid_order_idx\` ON \`restaurants_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_category_grid_parent_id_idx\` ON \`restaurants_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_category_grid_path_idx\` ON \`restaurants_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_category_grid_background_background_i_idx\` ON \`restaurants_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_popular_posts_order_idx\` ON \`restaurants_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_popular_posts_parent_id_idx\` ON \`restaurants_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_popular_posts_path_idx\` ON \`restaurants_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_popular_posts_background_background_i_idx\` ON \`restaurants_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_ad_slot_order_idx\` ON \`restaurants_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_ad_slot_parent_id_idx\` ON \`restaurants_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_ad_slot_path_idx\` ON \`restaurants_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_order_idx\` ON \`venues_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_parent_id_idx\` ON \`venues_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_path_idx\` ON \`venues_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_filter_category_idx\` ON \`venues_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_post_list_background_background_image_idx\` ON \`venues_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_featured_post_order_idx\` ON \`venues_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_featured_post_parent_id_idx\` ON \`venues_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_featured_post_path_idx\` ON \`venues_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_featured_post_featured_post_idx\` ON \`venues_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_featured_post_background_background_image_idx\` ON \`venues_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_category_grid_order_idx\` ON \`venues_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_category_grid_parent_id_idx\` ON \`venues_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_category_grid_path_idx\` ON \`venues_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_category_grid_background_background_image_idx\` ON \`venues_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_popular_posts_order_idx\` ON \`venues_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_popular_posts_parent_id_idx\` ON \`venues_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_popular_posts_path_idx\` ON \`venues_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_popular_posts_background_background_image_idx\` ON \`venues_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_ad_slot_order_idx\` ON \`venues_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_ad_slot_parent_id_idx\` ON \`venues_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_ad_slot_path_idx\` ON \`venues_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_order_idx\` ON \`rentals_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_parent_id_idx\` ON \`rentals_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_path_idx\` ON \`rentals_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_filter_category_idx\` ON \`rentals_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_post_list_background_background_image_idx\` ON \`rentals_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_featured_post_order_idx\` ON \`rentals_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_featured_post_parent_id_idx\` ON \`rentals_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_featured_post_path_idx\` ON \`rentals_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_featured_post_featured_post_idx\` ON \`rentals_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_featured_post_background_background_image_idx\` ON \`rentals_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_category_grid_order_idx\` ON \`rentals_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_category_grid_parent_id_idx\` ON \`rentals_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_category_grid_path_idx\` ON \`rentals_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_category_grid_background_background_image_idx\` ON \`rentals_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_popular_posts_order_idx\` ON \`rentals_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_popular_posts_parent_id_idx\` ON \`rentals_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_popular_posts_path_idx\` ON \`rentals_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_popular_posts_background_background_image_idx\` ON \`rentals_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_ad_slot_order_idx\` ON \`rentals_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_ad_slot_parent_id_idx\` ON \`rentals_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_ad_slot_path_idx\` ON \`rentals_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_order_idx\` ON \`spa_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_parent_id_idx\` ON \`spa_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_path_idx\` ON \`spa_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_filter_category_idx\` ON \`spa_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_post_list_background_background_image_idx\` ON \`spa_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_featured_post_order_idx\` ON \`spa_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_featured_post_parent_id_idx\` ON \`spa_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_featured_post_path_idx\` ON \`spa_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_featured_post_featured_post_idx\` ON \`spa_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_featured_post_background_background_image_idx\` ON \`spa_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_category_grid_order_idx\` ON \`spa_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_category_grid_parent_id_idx\` ON \`spa_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_category_grid_path_idx\` ON \`spa_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_category_grid_background_background_image_idx\` ON \`spa_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_popular_posts_order_idx\` ON \`spa_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_popular_posts_parent_id_idx\` ON \`spa_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_popular_posts_path_idx\` ON \`spa_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_popular_posts_background_background_image_idx\` ON \`spa_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_ad_slot_order_idx\` ON \`spa_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_ad_slot_parent_id_idx\` ON \`spa_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_ad_slot_path_idx\` ON \`spa_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_post_list\` (
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
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_order_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_parent_id_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_path_idx\` ON \`ferry_tickets_blocks_post_list\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_filter_category_idx\` ON \`ferry_tickets_blocks_post_list\` (\`filter_category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_post_list_background_background_ima_idx\` ON \`ferry_tickets_blocks_post_list\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_featured_post\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`selection_mode\` text DEFAULT 'auto',
  	\`featured_post_id\` integer,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_featured_post_order_idx\` ON \`ferry_tickets_blocks_featured_post\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_featured_post_parent_id_idx\` ON \`ferry_tickets_blocks_featured_post\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_featured_post_path_idx\` ON \`ferry_tickets_blocks_featured_post\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_featured_post_featured_post_idx\` ON \`ferry_tickets_blocks_featured_post\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_featured_post_background_background_idx\` ON \`ferry_tickets_blocks_featured_post\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_category_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Explore by Category',
  	\`module\` text DEFAULT 'blog',
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_count\` integer DEFAULT true,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_category_grid_order_idx\` ON \`ferry_tickets_blocks_category_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_category_grid_parent_id_idx\` ON \`ferry_tickets_blocks_category_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_category_grid_path_idx\` ON \`ferry_tickets_blocks_category_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_category_grid_background_background_idx\` ON \`ferry_tickets_blocks_category_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_popular_posts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Popular Posts',
  	\`limit\` numeric DEFAULT 5,
  	\`variant\` text DEFAULT 'sidebar',
  	\`days_window\` numeric DEFAULT 30,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_popular_posts_order_idx\` ON \`ferry_tickets_blocks_popular_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_popular_posts_parent_id_idx\` ON \`ferry_tickets_blocks_popular_posts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_popular_posts_path_idx\` ON \`ferry_tickets_blocks_popular_posts\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_popular_posts_background_background_idx\` ON \`ferry_tickets_blocks_popular_posts\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_ad_slot\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_name\` text NOT NULL,
  	\`size\` text DEFAULT '300x600' NOT NULL,
  	\`provider\` text DEFAULT 'adsense',
  	\`adsense_client\` text,
  	\`adsense_slot_id\` text,
  	\`custom_html\` text,
  	\`placement\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_ad_slot_order_idx\` ON \`ferry_tickets_blocks_ad_slot\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_ad_slot_parent_id_idx\` ON \`ferry_tickets_blocks_ad_slot\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_ad_slot_path_idx\` ON \`ferry_tickets_blocks_ad_slot\` (\`_path\`);`)
  await db.run(sql`ALTER TABLE \`posts_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`tours_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`tours_rels_posts_id_idx\` ON \`tours_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`accommodations_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_posts_id_idx\` ON \`accommodations_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`water_activities_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_posts_id_idx\` ON \`water_activities_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`yachts_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_posts_id_idx\` ON \`yachts_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`restaurants_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_posts_id_idx\` ON \`restaurants_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`venues_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`venues_rels_posts_id_idx\` ON \`venues_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`rentals_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_posts_id_idx\` ON \`rentals_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`spa_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`spa_rels_posts_id_idx\` ON \`spa_rels\` (\`posts_id\`);`)
  await db.run(sql`ALTER TABLE \`ferry_tickets_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_posts_id_idx\` ON \`ferry_tickets_rels\` (\`posts_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_ad_slot\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_post_list\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_featured_post\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_category_grid\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_popular_posts\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_ad_slot\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_posts_rels\`("id", "order", "parent_id", "path", "categories_id") SELECT "id", "order", "parent_id", "path", "categories_id" FROM \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts_rels\` RENAME TO \`posts_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_categories_id_idx\` ON \`posts_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_tours_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tours_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tours_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_tours_rels\`("id", "order", "parent_id", "path", "tours_id") SELECT "id", "order", "parent_id", "path", "tours_id" FROM \`tours_rels\`;`)
  await db.run(sql`DROP TABLE \`tours_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_tours_rels\` RENAME TO \`tours_rels\`;`)
  await db.run(sql`CREATE INDEX \`tours_rels_order_idx\` ON \`tours_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`tours_rels_parent_idx\` ON \`tours_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_rels_path_idx\` ON \`tours_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`tours_rels_tours_id_idx\` ON \`tours_rels\` (\`tours_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`accommodations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_rels\`("id", "order", "parent_id", "path", "accommodations_id") SELECT "id", "order", "parent_id", "path", "accommodations_id" FROM \`accommodations_rels\`;`)
  await db.run(sql`DROP TABLE \`accommodations_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_rels\` RENAME TO \`accommodations_rels\`;`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_order_idx\` ON \`accommodations_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_parent_idx\` ON \`accommodations_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_path_idx\` ON \`accommodations_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_accommodations_id_idx\` ON \`accommodations_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_water_activities_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`water_activities_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`water_activities_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_water_activities_rels\`("id", "order", "parent_id", "path", "water_activities_id") SELECT "id", "order", "parent_id", "path", "water_activities_id" FROM \`water_activities_rels\`;`)
  await db.run(sql`DROP TABLE \`water_activities_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_water_activities_rels\` RENAME TO \`water_activities_rels\`;`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_order_idx\` ON \`water_activities_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_parent_idx\` ON \`water_activities_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_path_idx\` ON \`water_activities_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_water_activities_id_idx\` ON \`water_activities_rels\` (\`water_activities_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_yachts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`yachts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`yachts_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_yachts_rels\`("id", "order", "parent_id", "path", "yachts_id") SELECT "id", "order", "parent_id", "path", "yachts_id" FROM \`yachts_rels\`;`)
  await db.run(sql`DROP TABLE \`yachts_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_yachts_rels\` RENAME TO \`yachts_rels\`;`)
  await db.run(sql`CREATE INDEX \`yachts_rels_order_idx\` ON \`yachts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_parent_idx\` ON \`yachts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_path_idx\` ON \`yachts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_yachts_id_idx\` ON \`yachts_rels\` (\`yachts_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_restaurants_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`restaurants_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`restaurants_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_restaurants_rels\`("id", "order", "parent_id", "path", "restaurants_id") SELECT "id", "order", "parent_id", "path", "restaurants_id" FROM \`restaurants_rels\`;`)
  await db.run(sql`DROP TABLE \`restaurants_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_restaurants_rels\` RENAME TO \`restaurants_rels\`;`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_order_idx\` ON \`restaurants_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_parent_idx\` ON \`restaurants_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_path_idx\` ON \`restaurants_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_restaurants_id_idx\` ON \`restaurants_rels\` (\`restaurants_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_venues_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`venues_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`venues_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_venues_rels\`("id", "order", "parent_id", "path", "venues_id") SELECT "id", "order", "parent_id", "path", "venues_id" FROM \`venues_rels\`;`)
  await db.run(sql`DROP TABLE \`venues_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_venues_rels\` RENAME TO \`venues_rels\`;`)
  await db.run(sql`CREATE INDEX \`venues_rels_order_idx\` ON \`venues_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`venues_rels_parent_idx\` ON \`venues_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_rels_path_idx\` ON \`venues_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`venues_rels_venues_id_idx\` ON \`venues_rels\` (\`venues_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_rentals_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rentals_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rentals_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_rentals_rels\`("id", "order", "parent_id", "path", "rentals_id") SELECT "id", "order", "parent_id", "path", "rentals_id" FROM \`rentals_rels\`;`)
  await db.run(sql`DROP TABLE \`rentals_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_rentals_rels\` RENAME TO \`rentals_rels\`;`)
  await db.run(sql`CREATE INDEX \`rentals_rels_order_idx\` ON \`rentals_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_parent_idx\` ON \`rentals_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_path_idx\` ON \`rentals_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_rentals_id_idx\` ON \`rentals_rels\` (\`rentals_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_spa_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`spa_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`spa_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_spa_rels\`("id", "order", "parent_id", "path", "spa_id") SELECT "id", "order", "parent_id", "path", "spa_id" FROM \`spa_rels\`;`)
  await db.run(sql`DROP TABLE \`spa_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_spa_rels\` RENAME TO \`spa_rels\`;`)
  await db.run(sql`CREATE INDEX \`spa_rels_order_idx\` ON \`spa_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`spa_rels_parent_idx\` ON \`spa_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_rels_path_idx\` ON \`spa_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`spa_rels_spa_id_idx\` ON \`spa_rels\` (\`spa_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_ferry_tickets_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`ferry_tickets_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`ferry_tickets_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_ferry_tickets_rels\`("id", "order", "parent_id", "path", "ferry_tickets_id") SELECT "id", "order", "parent_id", "path", "ferry_tickets_id" FROM \`ferry_tickets_rels\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_ferry_tickets_rels\` RENAME TO \`ferry_tickets_rels\`;`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_order_idx\` ON \`ferry_tickets_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_parent_idx\` ON \`ferry_tickets_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_path_idx\` ON \`ferry_tickets_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_ferry_tickets_id_idx\` ON \`ferry_tickets_rels\` (\`ferry_tickets_id\`);`)
}
