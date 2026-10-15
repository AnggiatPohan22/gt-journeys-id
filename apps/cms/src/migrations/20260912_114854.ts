import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_slider_order_idx\` ON \`pages_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_slider_parent_id_idx\` ON \`pages_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_slider_image_idx\` ON \`pages_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_single_image_idx\` ON \`pages_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_video_file_idx\` ON \`pages_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_video_poster_idx\` ON \`pages_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_background_background_image_idx\` ON \`pages_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_background_image_idx\` ON \`pages_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_order_idx\` ON \`pages_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_parent_id_idx\` ON \`pages_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_path_idx\` ON \`pages_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_background_background_image_idx\` ON \`pages_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_order_idx\` ON \`pages_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_parent_id_idx\` ON \`pages_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_path_idx\` ON \`pages_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_image_idx\` ON \`pages_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_background_background_image_idx\` ON \`pages_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_order_idx\` ON \`pages_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_parent_id_idx\` ON \`pages_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_image_idx\` ON \`pages_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_order_idx\` ON \`pages_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_parent_id_idx\` ON \`pages_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_path_idx\` ON \`pages_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_background_background_image_idx\` ON \`pages_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_image_slider_order_idx\` ON \`pages_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_image_slider_parent_id_idx\` ON \`pages_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_image_slider_image_idx\` ON \`pages_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_single_image_idx\` ON \`pages_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_video_file_idx\` ON \`pages_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_video_poster_idx\` ON \`pages_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_background_background_image_idx\` ON \`pages_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_order_idx\` ON \`pages_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_parent_id_idx\` ON \`pages_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_order_idx\` ON \`pages_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_parent_id_idx\` ON \`pages_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_path_idx\` ON \`pages_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_background_background_image_idx\` ON \`pages_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_items_order_idx\` ON \`pages_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_items_parent_id_idx\` ON \`pages_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_items_photo_idx\` ON \`pages_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_order_idx\` ON \`pages_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_parent_id_idx\` ON \`pages_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_path_idx\` ON \`pages_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_filter_dest_idx\` ON \`pages_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_background_background_image_idx\` ON \`pages_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`pages_blocks_service_grid_order_idx\` ON \`pages_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_grid_parent_id_idx\` ON \`pages_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_grid_path_idx\` ON \`pages_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_grid_background_background_image_idx\` ON \`pages_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_order_idx\` ON \`pages_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_parent_id_idx\` ON \`pages_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_path_idx\` ON \`pages_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_background_background_image_idx\` ON \`pages_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_order_idx\` ON \`pages_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_parent_id_idx\` ON \`pages_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_path_idx\` ON \`pages_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_background_background_image_idx\` ON \`pages_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_spacer_order_idx\` ON \`pages_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_spacer_parent_id_idx\` ON \`pages_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_spacer_path_idx\` ON \`pages_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_value_props_banner_items_order_idx\` ON \`pages_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_value_props_banner_items_parent_id_idx\` ON \`pages_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_value_props_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_value_props_banner_order_idx\` ON \`pages_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_value_props_banner_parent_id_idx\` ON \`pages_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_value_props_banner_path_idx\` ON \`pages_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_value_props_banner_background_background_im_idx\` ON \`pages_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_banner_items_order_idx\` ON \`pages_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_banner_items_parent_id_idx\` ON \`pages_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_banner_order_idx\` ON \`pages_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_banner_parent_id_idx\` ON \`pages_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_banner_path_idx\` ON \`pages_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_banner_background_image_idx\` ON \`pages_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_items_order_idx\` ON \`pages_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_items_parent_id_idx\` ON \`pages_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_items_photo_idx\` ON \`pages_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_carousel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`heading\` text DEFAULT 'Memories That Last Forever',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 3,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_order_idx\` ON \`pages_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_parent_id_idx\` ON \`pages_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_path_idx\` ON \`pages_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_filter_dest_idx\` ON \`pages_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_carousel_background_background_idx\` ON \`pages_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_accommodation_types_order_idx\` ON \`pages_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_accommodation_types_parent_idx\` ON \`pages_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_image_slider_order_idx\` ON \`pages_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_image_slider_parent_id_idx\` ON \`pages_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_image_slider_image_idx\` ON \`pages_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_order_idx\` ON \`pages_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_parent_id_idx\` ON \`pages_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_path_idx\` ON \`pages_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_single_image_idx\` ON \`pages_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_video_file_idx\` ON \`pages_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_video_poster_idx\` ON \`pages_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_service_listing_background_background_image_idx\` ON \`pages_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_trust_badges_badges_order_idx\` ON \`pages_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_trust_badges_badges_parent_id_idx\` ON \`pages_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_trust_badges_order_idx\` ON \`pages_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_trust_badges_parent_id_idx\` ON \`pages_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_trust_badges_path_idx\` ON \`pages_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_trust_badges_background_background_image_idx\` ON \`pages_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`template\` text DEFAULT 'default',
  	\`parent_id\` integer,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_seo_og_image_idx\` ON \`pages\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`service_types\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`key\` text NOT NULL,
  	\`status\` text DEFAULT 'active',
  	\`order\` numeric DEFAULT 0,
  	\`description\` text,
  	\`icon_name\` text,
  	\`cover_image_id\` integer,
  	\`related_override_enabled\` integer DEFAULT false,
  	\`related_enabled\` integer DEFAULT true,
  	\`related_section_title\` text,
  	\`related_card_style\` text DEFAULT 'curated',
  	\`related_max_items\` numeric DEFAULT 3,
  	\`related_selection_mode\` text DEFAULT 'same_type',
  	\`related_show_explore_all\` integer DEFAULT true,
  	\`whatsapp_number\` text,
  	\`whatsapp_template\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_types_slug_idx\` ON \`service_types\` (\`slug\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`service_types_key_idx\` ON \`service_types\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`service_types_cover_image_idx\` ON \`service_types\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`service_types_updated_at_idx\` ON \`service_types\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`service_types_created_at_idx\` ON \`service_types\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`destinations_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`destinations_gallery_order_idx\` ON \`destinations_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`destinations_gallery_parent_id_idx\` ON \`destinations_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`destinations_gallery_image_idx\` ON \`destinations_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`destinations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`type_id\` integer,
  	\`parent_id\` integer,
  	\`show_in_filter\` integer DEFAULT false,
  	\`description\` text,
  	\`featured_image_id\` integer,
  	\`location_address\` text,
  	\`location_map_embed\` text,
  	\`location_latitude\` numeric,
  	\`location_longitude\` numeric,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`type_id\`) REFERENCES \`destination_types\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`destinations_slug_idx\` ON \`destinations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`destinations_type_idx\` ON \`destinations\` (\`type_id\`);`)
  await db.run(sql`CREATE INDEX \`destinations_parent_idx\` ON \`destinations\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`destinations_featured_image_idx\` ON \`destinations\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`destinations_seo_seo_og_image_idx\` ON \`destinations\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`destinations_updated_at_idx\` ON \`destinations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`destinations_created_at_idx\` ON \`destinations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`destination_types\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`is_active\` integer DEFAULT true,
  	\`sort_order\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`destination_types_slug_idx\` ON \`destination_types\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`destination_types_updated_at_idx\` ON \`destination_types\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`destination_types_created_at_idx\` ON \`destination_types\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`module\` text NOT NULL,
  	\`parent_id\` integer,
  	\`description\` text,
  	\`icon_id\` integer,
  	\`featured_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_parent_idx\` ON \`categories\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_icon_idx\` ON \`categories\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_featured_image_idx\` ON \`categories\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`location\` text,
  	\`quote\` text NOT NULL,
  	\`rating\` numeric DEFAULT 5 NOT NULL,
  	\`source_module\` text DEFAULT 'general',
  	\`avatar_id\` integer,
  	\`destination_id\` integer,
  	\`date\` text,
  	\`is_featured\` integer DEFAULT false,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`destination_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials_avatar_idx\` ON \`testimonials\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_destination_idx\` ON \`testimonials\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`tours_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_quick_specs_order_idx\` ON \`tours_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_quick_specs_parent_id_idx\` ON \`tours_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_highlights_order_idx\` ON \`tours_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_highlights_parent_id_idx\` ON \`tours_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_gallery_order_idx\` ON \`tours_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_gallery_parent_id_idx\` ON \`tours_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_gallery_image_idx\` ON \`tours_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_itinerary\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`time\` text,
  	\`title\` text NOT NULL,
  	\`icon_name\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_itinerary_order_idx\` ON \`tours_itinerary\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_itinerary_parent_id_idx\` ON \`tours_itinerary\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_includes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_includes_order_idx\` ON \`tours_includes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_includes_parent_id_idx\` ON \`tours_includes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_excludes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_excludes_order_idx\` ON \`tours_excludes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_excludes_parent_id_idx\` ON \`tours_excludes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_image_slider_order_idx\` ON \`tours_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_image_slider_parent_id_idx\` ON \`tours_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_image_slider_image_idx\` ON \`tours_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_order_idx\` ON \`tours_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_parent_id_idx\` ON \`tours_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_path_idx\` ON \`tours_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_single_image_idx\` ON \`tours_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_video_file_idx\` ON \`tours_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_video_poster_idx\` ON \`tours_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_background_background_image_idx\` ON \`tours_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_hero_background_image_idx\` ON \`tours_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_rich_text_order_idx\` ON \`tours_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_rich_text_parent_id_idx\` ON \`tours_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_rich_text_path_idx\` ON \`tours_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_rich_text_background_background_image_idx\` ON \`tours_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_image_order_idx\` ON \`tours_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_image_parent_id_idx\` ON \`tours_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_image_path_idx\` ON \`tours_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_image_image_idx\` ON \`tours_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_image_background_background_image_idx\` ON \`tours_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_images_order_idx\` ON \`tours_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_images_parent_id_idx\` ON \`tours_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_images_image_idx\` ON \`tours_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_order_idx\` ON \`tours_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_parent_id_idx\` ON \`tours_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_path_idx\` ON \`tours_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_gallery_background_background_image_idx\` ON \`tours_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_image_slider_order_idx\` ON \`tours_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_image_slider_parent_id_idx\` ON \`tours_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_image_slider_image_idx\` ON \`tours_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_order_idx\` ON \`tours_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_parent_id_idx\` ON \`tours_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_path_idx\` ON \`tours_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_single_image_idx\` ON \`tours_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_video_file_idx\` ON \`tours_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_video_poster_idx\` ON \`tours_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_cta_background_background_image_idx\` ON \`tours_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_faq_items_order_idx\` ON \`tours_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_faq_items_parent_id_idx\` ON \`tours_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_faq_order_idx\` ON \`tours_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_faq_parent_id_idx\` ON \`tours_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_faq_path_idx\` ON \`tours_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_faq_background_background_image_idx\` ON \`tours_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_items_order_idx\` ON \`tours_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_items_parent_id_idx\` ON \`tours_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_items_photo_idx\` ON \`tours_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_order_idx\` ON \`tours_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_parent_id_idx\` ON \`tours_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_path_idx\` ON \`tours_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_filter_dest_idx\` ON \`tours_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_background_background_image_idx\` ON \`tours_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`tours_blocks_service_grid_order_idx\` ON \`tours_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_grid_parent_id_idx\` ON \`tours_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_grid_path_idx\` ON \`tours_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_grid_background_background_image_idx\` ON \`tours_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_contact_order_idx\` ON \`tours_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_contact_parent_id_idx\` ON \`tours_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_contact_path_idx\` ON \`tours_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_contact_background_background_image_idx\` ON \`tours_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_embed_order_idx\` ON \`tours_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_embed_parent_id_idx\` ON \`tours_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_embed_path_idx\` ON \`tours_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_embed_background_background_image_idx\` ON \`tours_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_spacer_order_idx\` ON \`tours_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_spacer_parent_id_idx\` ON \`tours_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_spacer_path_idx\` ON \`tours_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_value_props_banner_items_order_idx\` ON \`tours_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_value_props_banner_items_parent_id_idx\` ON \`tours_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_value_props_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_value_props_banner_order_idx\` ON \`tours_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_value_props_banner_parent_id_idx\` ON \`tours_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_value_props_banner_path_idx\` ON \`tours_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_value_props_banner_background_background_im_idx\` ON \`tours_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_stats_banner_items_order_idx\` ON \`tours_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_stats_banner_items_parent_id_idx\` ON \`tours_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_stats_banner_order_idx\` ON \`tours_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_stats_banner_parent_id_idx\` ON \`tours_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_stats_banner_path_idx\` ON \`tours_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_stats_banner_background_image_idx\` ON \`tours_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_items_order_idx\` ON \`tours_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_items_parent_id_idx\` ON \`tours_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_items_photo_idx\` ON \`tours_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_testimonials_carousel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`heading\` text DEFAULT 'Memories That Last Forever',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 3,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_order_idx\` ON \`tours_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_parent_id_idx\` ON \`tours_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_path_idx\` ON \`tours_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_filter_dest_idx\` ON \`tours_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_testimonials_carousel_background_background_idx\` ON \`tours_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`tours_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_accommodation_types_order_idx\` ON \`tours_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_accommodation_types_parent_idx\` ON \`tours_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_image_slider_order_idx\` ON \`tours_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_image_slider_parent_id_idx\` ON \`tours_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_image_slider_image_idx\` ON \`tours_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_order_idx\` ON \`tours_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_parent_id_idx\` ON \`tours_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_path_idx\` ON \`tours_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_single_image_idx\` ON \`tours_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_video_file_idx\` ON \`tours_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_video_poster_idx\` ON \`tours_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_service_listing_background_background_image_idx\` ON \`tours_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_trust_badges_badges_order_idx\` ON \`tours_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_trust_badges_badges_parent_id_idx\` ON \`tours_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_blocks_trust_badges_order_idx\` ON \`tours_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_trust_badges_parent_id_idx\` ON \`tours_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_trust_badges_path_idx\` ON \`tours_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_trust_badges_background_background_image_idx\` ON \`tours_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`destination_id\` integer NOT NULL,
  	\`category_id\` integer,
  	\`duration\` text,
  	\`min_participants\` numeric DEFAULT 1,
  	\`max_participants\` numeric,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`video_url\` text,
  	\`meeting_point_name\` text,
  	\`meeting_point_time\` text,
  	\`meeting_point_address\` text,
  	\`meeting_point_map_embed\` text,
  	\`pickup_service_available\` integer DEFAULT false,
  	\`pickup_service_areas\` text,
  	\`pickup_service_notes\` text,
  	\`pricing_adult_price\` numeric,
  	\`pricing_child_price\` numeric,
  	\`pricing_infant_price\` numeric,
  	\`pricing_currency\` text DEFAULT 'IDR',
  	\`pricing_price_note\` text,
  	\`pricing_discount_label\` text,
  	\`whatsapp_message\` text,
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
  await db.run(sql`CREATE UNIQUE INDEX \`tours_slug_idx\` ON \`tours\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`tours_destination_idx\` ON \`tours\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_category_idx\` ON \`tours\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_featured_image_idx\` ON \`tours\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_seo_seo_og_image_idx\` ON \`tours\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_updated_at_idx\` ON \`tours\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tours_created_at_idx\` ON \`tours\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`tours_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tours_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tours_id\`) REFERENCES \`tours\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tours_rels_order_idx\` ON \`tours_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`tours_rels_parent_idx\` ON \`tours_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_rels_path_idx\` ON \`tours_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`tours_rels_tours_id_idx\` ON \`tours_rels\` (\`tours_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_quick_specs_order_idx\` ON \`accommodations_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_quick_specs_parent_id_idx\` ON \`accommodations_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_highlight_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_highlight_tags_order_idx\` ON \`accommodations_highlight_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_highlight_tags_parent_id_idx\` ON \`accommodations_highlight_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_order_idx\` ON \`accommodations_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_parent_id_idx\` ON \`accommodations_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_image_idx\` ON \`accommodations_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_room_types_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_room_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_room_types_images_order_idx\` ON \`accommodations_room_types_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_room_types_images_parent_id_idx\` ON \`accommodations_room_types_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_room_types_images_image_idx\` ON \`accommodations_room_types_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_room_types\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`bed_type\` text,
  	\`max_guests\` numeric,
  	\`price_per_night\` numeric,
  	\`currency\` text DEFAULT 'IDR',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_room_types_order_idx\` ON \`accommodations_room_types\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_room_types_parent_id_idx\` ON \`accommodations_room_types\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_amenities\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_amenities_order_idx\` ON \`accommodations_amenities\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_amenities_parent_id_idx\` ON \`accommodations_amenities\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_facilities_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_facilities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_facilities_items_order_idx\` ON \`accommodations_facilities_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_facilities_items_parent_id_idx\` ON \`accommodations_facilities_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_facilities\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`category\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_facilities_order_idx\` ON \`accommodations_facilities\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_facilities_parent_id_idx\` ON \`accommodations_facilities\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_nearby_landmarks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`distance\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_nearby_landmarks_order_idx\` ON \`accommodations_nearby_landmarks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_nearby_landmarks_parent_id_idx\` ON \`accommodations_nearby_landmarks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_curated_experiences\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_curated_experiences_order_idx\` ON \`accommodations_curated_experiences\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_curated_experiences_parent_id_idx\` ON \`accommodations_curated_experiences\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_image_slider_order_idx\` ON \`accommodations_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_image_slider_parent_id_idx\` ON \`accommodations_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_image_slider_image_idx\` ON \`accommodations_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_order_idx\` ON \`accommodations_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_parent_id_idx\` ON \`accommodations_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_path_idx\` ON \`accommodations_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_single_image_idx\` ON \`accommodations_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_video_file_idx\` ON \`accommodations_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_video_poster_idx\` ON \`accommodations_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_background_background_image_idx\` ON \`accommodations_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_hero_background_image_idx\` ON \`accommodations_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_rich_text_order_idx\` ON \`accommodations_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_rich_text_parent_id_idx\` ON \`accommodations_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_rich_text_path_idx\` ON \`accommodations_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_rich_text_background_background_im_idx\` ON \`accommodations_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_image_order_idx\` ON \`accommodations_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_image_parent_id_idx\` ON \`accommodations_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_image_path_idx\` ON \`accommodations_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_image_image_idx\` ON \`accommodations_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_image_background_background_image_idx\` ON \`accommodations_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_images_order_idx\` ON \`accommodations_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_images_parent_id_idx\` ON \`accommodations_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_images_image_idx\` ON \`accommodations_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_order_idx\` ON \`accommodations_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_parent_id_idx\` ON \`accommodations_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_path_idx\` ON \`accommodations_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_gallery_background_background_imag_idx\` ON \`accommodations_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_image_slider_order_idx\` ON \`accommodations_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_image_slider_parent_id_idx\` ON \`accommodations_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_image_slider_image_idx\` ON \`accommodations_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_order_idx\` ON \`accommodations_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_parent_id_idx\` ON \`accommodations_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_path_idx\` ON \`accommodations_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_single_image_idx\` ON \`accommodations_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_video_file_idx\` ON \`accommodations_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_video_poster_idx\` ON \`accommodations_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_cta_background_background_image_idx\` ON \`accommodations_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_faq_items_order_idx\` ON \`accommodations_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_faq_items_parent_id_idx\` ON \`accommodations_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_faq_order_idx\` ON \`accommodations_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_faq_parent_id_idx\` ON \`accommodations_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_faq_path_idx\` ON \`accommodations_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_faq_background_background_image_idx\` ON \`accommodations_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_items_order_idx\` ON \`accommodations_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_items_parent_id_idx\` ON \`accommodations_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_items_photo_idx\` ON \`accommodations_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_order_idx\` ON \`accommodations_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_parent_id_idx\` ON \`accommodations_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_path_idx\` ON \`accommodations_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_filter_dest_idx\` ON \`accommodations_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_testimonials_background_background_idx\` ON \`accommodations_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`accommodations_blocks_service_grid_order_idx\` ON \`accommodations_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_service_grid_parent_id_idx\` ON \`accommodations_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_service_grid_path_idx\` ON \`accommodations_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_service_grid_background_background_idx\` ON \`accommodations_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_contact_order_idx\` ON \`accommodations_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_contact_parent_id_idx\` ON \`accommodations_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_contact_path_idx\` ON \`accommodations_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_contact_background_background_imag_idx\` ON \`accommodations_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_embed_order_idx\` ON \`accommodations_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_embed_parent_id_idx\` ON \`accommodations_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_embed_path_idx\` ON \`accommodations_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_embed_background_background_image_idx\` ON \`accommodations_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_spacer_order_idx\` ON \`accommodations_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_spacer_parent_id_idx\` ON \`accommodations_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_spacer_path_idx\` ON \`accommodations_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_stats_banner_items_order_idx\` ON \`accommodations_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_stats_banner_items_parent_id_idx\` ON \`accommodations_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_stats_banner_order_idx\` ON \`accommodations_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_stats_banner_parent_id_idx\` ON \`accommodations_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_stats_banner_path_idx\` ON \`accommodations_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_stats_banner_background_image_idx\` ON \`accommodations_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_trust_badges_badges_order_idx\` ON \`accommodations_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_trust_badges_badges_parent_id_idx\` ON \`accommodations_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_trust_badges_order_idx\` ON \`accommodations_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_trust_badges_parent_id_idx\` ON \`accommodations_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_trust_badges_path_idx\` ON \`accommodations_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_trust_badges_background_background_idx\` ON \`accommodations_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`name\` text NOT NULL,
  	\`subtitle\` text,
  	\`type\` text NOT NULL,
  	\`star_rating\` numeric,
  	\`destination_id\` integer NOT NULL,
  	\`category_id\` integer,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`check_in_time\` text,
  	\`check_out_time\` text,
  	\`whatsapp_message\` text,
  	\`location_type\` text,
  	\`location_address\` text,
  	\`location_map_embed\` text,
  	\`location_latitude\` numeric,
  	\`location_longitude\` numeric,
  	\`policies\` text,
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
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_slug_idx\` ON \`accommodations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_destination_idx\` ON \`accommodations\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_category_idx\` ON \`accommodations\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_featured_image_idx\` ON \`accommodations\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_seo_seo_og_image_idx\` ON \`accommodations\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_updated_at_idx\` ON \`accommodations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_created_at_idx\` ON \`accommodations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`accommodations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_rels_order_idx\` ON \`accommodations_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_parent_idx\` ON \`accommodations_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_path_idx\` ON \`accommodations_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_rels_accommodations_id_idx\` ON \`accommodations_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_quick_specs_order_idx\` ON \`water_activities_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_quick_specs_parent_id_idx\` ON \`water_activities_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_gallery_order_idx\` ON \`water_activities_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_gallery_parent_id_idx\` ON \`water_activities_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_gallery_image_idx\` ON \`water_activities_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_what_to_bring\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_what_to_bring_order_idx\` ON \`water_activities_what_to_bring\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_what_to_bring_parent_id_idx\` ON \`water_activities_what_to_bring\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_image_slider_order_idx\` ON \`water_activities_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_image_slider_parent_id_idx\` ON \`water_activities_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_image_slider_image_idx\` ON \`water_activities_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_order_idx\` ON \`water_activities_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_parent_id_idx\` ON \`water_activities_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_path_idx\` ON \`water_activities_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_single_image_idx\` ON \`water_activities_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_video_file_idx\` ON \`water_activities_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_video_poster_idx\` ON \`water_activities_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_background_background_image_idx\` ON \`water_activities_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_hero_background_image_idx\` ON \`water_activities_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_rich_text_order_idx\` ON \`water_activities_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_rich_text_parent_id_idx\` ON \`water_activities_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_rich_text_path_idx\` ON \`water_activities_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_rich_text_background_background__idx\` ON \`water_activities_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_image_order_idx\` ON \`water_activities_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_image_parent_id_idx\` ON \`water_activities_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_image_path_idx\` ON \`water_activities_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_image_image_idx\` ON \`water_activities_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_image_background_background_imag_idx\` ON \`water_activities_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_images_order_idx\` ON \`water_activities_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_images_parent_id_idx\` ON \`water_activities_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_images_image_idx\` ON \`water_activities_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_order_idx\` ON \`water_activities_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_parent_id_idx\` ON \`water_activities_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_path_idx\` ON \`water_activities_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_gallery_background_background_im_idx\` ON \`water_activities_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_image_slider_order_idx\` ON \`water_activities_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_image_slider_parent_id_idx\` ON \`water_activities_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_image_slider_image_idx\` ON \`water_activities_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_order_idx\` ON \`water_activities_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_parent_id_idx\` ON \`water_activities_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_path_idx\` ON \`water_activities_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_single_image_idx\` ON \`water_activities_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_video_file_idx\` ON \`water_activities_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_video_poster_idx\` ON \`water_activities_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_cta_background_background_image_idx\` ON \`water_activities_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_faq_items_order_idx\` ON \`water_activities_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_faq_items_parent_id_idx\` ON \`water_activities_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_faq_order_idx\` ON \`water_activities_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_faq_parent_id_idx\` ON \`water_activities_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_faq_path_idx\` ON \`water_activities_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_faq_background_background_image_idx\` ON \`water_activities_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_items_order_idx\` ON \`water_activities_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_items_parent_id_idx\` ON \`water_activities_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_items_photo_idx\` ON \`water_activities_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_order_idx\` ON \`water_activities_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_parent_id_idx\` ON \`water_activities_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_path_idx\` ON \`water_activities_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_filter_dest_idx\` ON \`water_activities_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_testimonials_background_backgrou_idx\` ON \`water_activities_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`water_activities_blocks_service_grid_order_idx\` ON \`water_activities_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_service_grid_parent_id_idx\` ON \`water_activities_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_service_grid_path_idx\` ON \`water_activities_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_service_grid_background_backgrou_idx\` ON \`water_activities_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_contact_order_idx\` ON \`water_activities_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_contact_parent_id_idx\` ON \`water_activities_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_contact_path_idx\` ON \`water_activities_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_contact_background_background_im_idx\` ON \`water_activities_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_embed_order_idx\` ON \`water_activities_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_embed_parent_id_idx\` ON \`water_activities_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_embed_path_idx\` ON \`water_activities_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_embed_background_background_imag_idx\` ON \`water_activities_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_spacer_order_idx\` ON \`water_activities_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_spacer_parent_id_idx\` ON \`water_activities_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_spacer_path_idx\` ON \`water_activities_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_stats_banner_items_order_idx\` ON \`water_activities_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_stats_banner_items_parent_id_idx\` ON \`water_activities_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_stats_banner_order_idx\` ON \`water_activities_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_stats_banner_parent_id_idx\` ON \`water_activities_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_stats_banner_path_idx\` ON \`water_activities_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_stats_banner_background_image_idx\` ON \`water_activities_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`activity_type\` text NOT NULL,
  	\`difficulty_level\` text,
  	\`destination_id\` integer NOT NULL,
  	\`category_id\` integer,
  	\`duration\` text,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`pricing_adult_price\` numeric,
  	\`pricing_child_price\` numeric,
  	\`pricing_infant_price\` numeric,
  	\`pricing_currency\` text DEFAULT 'IDR',
  	\`pricing_price_note\` text,
  	\`pricing_discount_label\` text,
  	\`whatsapp_message\` text,
  	\`requirements\` text,
  	\`safety_info\` text,
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
  await db.run(sql`CREATE UNIQUE INDEX \`water_activities_slug_idx\` ON \`water_activities\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_destination_idx\` ON \`water_activities\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_category_idx\` ON \`water_activities\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_featured_image_idx\` ON \`water_activities\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_seo_seo_og_image_idx\` ON \`water_activities\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_updated_at_idx\` ON \`water_activities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_created_at_idx\` ON \`water_activities\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`water_activities_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`water_activities_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_rels_order_idx\` ON \`water_activities_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_parent_idx\` ON \`water_activities_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_path_idx\` ON \`water_activities_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_rels_water_activities_id_idx\` ON \`water_activities_rels\` (\`water_activities_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_quick_specs_order_idx\` ON \`yachts_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_quick_specs_parent_id_idx\` ON \`yachts_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_gallery_order_idx\` ON \`yachts_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_gallery_parent_id_idx\` ON \`yachts_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_gallery_image_idx\` ON \`yachts_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_packages_includes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_packages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_packages_includes_order_idx\` ON \`yachts_packages_includes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_packages_includes_parent_id_idx\` ON \`yachts_packages_includes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_packages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`duration\` text,
  	\`description\` text,
  	\`price\` numeric,
  	\`currency\` text DEFAULT 'IDR',
  	\`price_note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_packages_order_idx\` ON \`yachts_packages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_packages_parent_id_idx\` ON \`yachts_packages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_amenities\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_amenities_order_idx\` ON \`yachts_amenities\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_amenities_parent_id_idx\` ON \`yachts_amenities\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_image_slider_order_idx\` ON \`yachts_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_image_slider_parent_id_idx\` ON \`yachts_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_image_slider_image_idx\` ON \`yachts_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_order_idx\` ON \`yachts_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_parent_id_idx\` ON \`yachts_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_path_idx\` ON \`yachts_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_single_image_idx\` ON \`yachts_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_video_file_idx\` ON \`yachts_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_video_poster_idx\` ON \`yachts_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_background_background_image_idx\` ON \`yachts_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_hero_background_image_idx\` ON \`yachts_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_rich_text_order_idx\` ON \`yachts_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_rich_text_parent_id_idx\` ON \`yachts_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_rich_text_path_idx\` ON \`yachts_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_rich_text_background_background_image_idx\` ON \`yachts_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_image_order_idx\` ON \`yachts_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_image_parent_id_idx\` ON \`yachts_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_image_path_idx\` ON \`yachts_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_image_image_idx\` ON \`yachts_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_image_background_background_image_idx\` ON \`yachts_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_images_order_idx\` ON \`yachts_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_images_parent_id_idx\` ON \`yachts_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_images_image_idx\` ON \`yachts_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_order_idx\` ON \`yachts_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_parent_id_idx\` ON \`yachts_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_path_idx\` ON \`yachts_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_gallery_background_background_image_idx\` ON \`yachts_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_image_slider_order_idx\` ON \`yachts_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_image_slider_parent_id_idx\` ON \`yachts_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_image_slider_image_idx\` ON \`yachts_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_order_idx\` ON \`yachts_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_parent_id_idx\` ON \`yachts_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_path_idx\` ON \`yachts_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_single_image_idx\` ON \`yachts_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_video_file_idx\` ON \`yachts_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_video_poster_idx\` ON \`yachts_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_cta_background_background_image_idx\` ON \`yachts_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_faq_items_order_idx\` ON \`yachts_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_faq_items_parent_id_idx\` ON \`yachts_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_faq_order_idx\` ON \`yachts_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_faq_parent_id_idx\` ON \`yachts_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_faq_path_idx\` ON \`yachts_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_faq_background_background_image_idx\` ON \`yachts_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_items_order_idx\` ON \`yachts_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_items_parent_id_idx\` ON \`yachts_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_items_photo_idx\` ON \`yachts_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_order_idx\` ON \`yachts_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_parent_id_idx\` ON \`yachts_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_path_idx\` ON \`yachts_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_filter_dest_idx\` ON \`yachts_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_background_background_image_idx\` ON \`yachts_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_grid_order_idx\` ON \`yachts_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_grid_parent_id_idx\` ON \`yachts_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_grid_path_idx\` ON \`yachts_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_grid_background_background_image_idx\` ON \`yachts_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_contact_order_idx\` ON \`yachts_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_contact_parent_id_idx\` ON \`yachts_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_contact_path_idx\` ON \`yachts_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_contact_background_background_image_idx\` ON \`yachts_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_embed_order_idx\` ON \`yachts_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_embed_parent_id_idx\` ON \`yachts_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_embed_path_idx\` ON \`yachts_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_embed_background_background_image_idx\` ON \`yachts_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_spacer_order_idx\` ON \`yachts_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_spacer_parent_id_idx\` ON \`yachts_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_spacer_path_idx\` ON \`yachts_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_value_props_banner_items_order_idx\` ON \`yachts_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_value_props_banner_items_parent_id_idx\` ON \`yachts_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_value_props_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_value_props_banner_order_idx\` ON \`yachts_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_value_props_banner_parent_id_idx\` ON \`yachts_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_value_props_banner_path_idx\` ON \`yachts_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_value_props_banner_background_background_i_idx\` ON \`yachts_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_stats_banner_items_order_idx\` ON \`yachts_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_stats_banner_items_parent_id_idx\` ON \`yachts_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_stats_banner_order_idx\` ON \`yachts_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_stats_banner_parent_id_idx\` ON \`yachts_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_stats_banner_path_idx\` ON \`yachts_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_stats_banner_background_image_idx\` ON \`yachts_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_items_order_idx\` ON \`yachts_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_items_parent_id_idx\` ON \`yachts_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_items_photo_idx\` ON \`yachts_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_testimonials_carousel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`heading\` text DEFAULT 'Memories That Last Forever',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 3,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_order_idx\` ON \`yachts_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_parent_id_idx\` ON \`yachts_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_path_idx\` ON \`yachts_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_filter_dest_idx\` ON \`yachts_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_testimonials_carousel_background_backgroun_idx\` ON \`yachts_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`yachts_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_accommodation_types_order_idx\` ON \`yachts_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_accommodation_types_parent_idx\` ON \`yachts_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_image_slider_order_idx\` ON \`yachts_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_image_slider_parent_id_idx\` ON \`yachts_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_image_slider_image_idx\` ON \`yachts_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_order_idx\` ON \`yachts_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_parent_id_idx\` ON \`yachts_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_path_idx\` ON \`yachts_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_single_image_idx\` ON \`yachts_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_video_file_idx\` ON \`yachts_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_video_poster_idx\` ON \`yachts_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_service_listing_background_background_imag_idx\` ON \`yachts_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_trust_badges_badges_order_idx\` ON \`yachts_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_trust_badges_badges_parent_id_idx\` ON \`yachts_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_blocks_trust_badges_order_idx\` ON \`yachts_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_trust_badges_parent_id_idx\` ON \`yachts_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_trust_badges_path_idx\` ON \`yachts_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_trust_badges_background_background_image_idx\` ON \`yachts_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`name\` text NOT NULL,
  	\`subtitle\` text,
  	\`yacht_type\` text,
  	\`capacity\` numeric,
  	\`destination_id\` integer,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`specifications_length\` text,
  	\`specifications_engine\` text,
  	\`specifications_crew_size\` numeric,
  	\`specifications_year_built\` text,
  	\`whatsapp_message\` text,
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
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`yachts_slug_idx\` ON \`yachts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`yachts_destination_idx\` ON \`yachts\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_featured_image_idx\` ON \`yachts\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_seo_seo_og_image_idx\` ON \`yachts\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_updated_at_idx\` ON \`yachts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`yachts_created_at_idx\` ON \`yachts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`yachts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`yachts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`yachts_id\`) REFERENCES \`yachts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`yachts_rels_order_idx\` ON \`yachts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_parent_idx\` ON \`yachts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_path_idx\` ON \`yachts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_rels_yachts_id_idx\` ON \`yachts_rels\` (\`yachts_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_cuisine_type\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_cuisine_type_order_idx\` ON \`restaurants_cuisine_type\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_cuisine_type_parent_idx\` ON \`restaurants_cuisine_type\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_quick_specs_order_idx\` ON \`restaurants_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_quick_specs_parent_id_idx\` ON \`restaurants_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_gallery_order_idx\` ON \`restaurants_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_gallery_parent_id_idx\` ON \`restaurants_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_gallery_image_idx\` ON \`restaurants_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_menu_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`price\` numeric,
  	\`image_id\` integer,
  	\`description\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_menu_highlights_order_idx\` ON \`restaurants_menu_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_menu_highlights_parent_id_idx\` ON \`restaurants_menu_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_menu_highlights_image_idx\` ON \`restaurants_menu_highlights\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_features_order_idx\` ON \`restaurants_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_features_parent_id_idx\` ON \`restaurants_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_opening_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`day\` text,
  	\`open\` text,
  	\`close\` text,
  	\`is_closed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_opening_hours_order_idx\` ON \`restaurants_opening_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_opening_hours_parent_id_idx\` ON \`restaurants_opening_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_image_slider_order_idx\` ON \`restaurants_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_image_slider_parent_id_idx\` ON \`restaurants_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_image_slider_image_idx\` ON \`restaurants_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_order_idx\` ON \`restaurants_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_parent_id_idx\` ON \`restaurants_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_path_idx\` ON \`restaurants_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_single_image_idx\` ON \`restaurants_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_video_file_idx\` ON \`restaurants_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_video_poster_idx\` ON \`restaurants_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_background_background_image_idx\` ON \`restaurants_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_hero_background_image_idx\` ON \`restaurants_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_rich_text_order_idx\` ON \`restaurants_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_rich_text_parent_id_idx\` ON \`restaurants_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_rich_text_path_idx\` ON \`restaurants_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_rich_text_background_background_image_idx\` ON \`restaurants_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_image_order_idx\` ON \`restaurants_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_image_parent_id_idx\` ON \`restaurants_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_image_path_idx\` ON \`restaurants_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_image_image_idx\` ON \`restaurants_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_image_background_background_image_idx\` ON \`restaurants_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_images_order_idx\` ON \`restaurants_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_images_parent_id_idx\` ON \`restaurants_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_images_image_idx\` ON \`restaurants_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_order_idx\` ON \`restaurants_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_parent_id_idx\` ON \`restaurants_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_path_idx\` ON \`restaurants_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_gallery_background_background_image_idx\` ON \`restaurants_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_image_slider_order_idx\` ON \`restaurants_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_image_slider_parent_id_idx\` ON \`restaurants_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_image_slider_image_idx\` ON \`restaurants_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_order_idx\` ON \`restaurants_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_parent_id_idx\` ON \`restaurants_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_path_idx\` ON \`restaurants_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_single_image_idx\` ON \`restaurants_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_video_file_idx\` ON \`restaurants_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_video_poster_idx\` ON \`restaurants_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_cta_background_background_image_idx\` ON \`restaurants_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_faq_items_order_idx\` ON \`restaurants_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_faq_items_parent_id_idx\` ON \`restaurants_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_faq_order_idx\` ON \`restaurants_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_faq_parent_id_idx\` ON \`restaurants_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_faq_path_idx\` ON \`restaurants_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_faq_background_background_image_idx\` ON \`restaurants_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_items_order_idx\` ON \`restaurants_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_items_parent_id_idx\` ON \`restaurants_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_items_photo_idx\` ON \`restaurants_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_order_idx\` ON \`restaurants_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_parent_id_idx\` ON \`restaurants_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_path_idx\` ON \`restaurants_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_filter_dest_idx\` ON \`restaurants_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_testimonials_background_background_im_idx\` ON \`restaurants_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_grid_order_idx\` ON \`restaurants_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_grid_parent_id_idx\` ON \`restaurants_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_grid_path_idx\` ON \`restaurants_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_grid_background_background_im_idx\` ON \`restaurants_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_contact_order_idx\` ON \`restaurants_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_contact_parent_id_idx\` ON \`restaurants_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_contact_path_idx\` ON \`restaurants_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_contact_background_background_image_idx\` ON \`restaurants_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_embed_order_idx\` ON \`restaurants_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_embed_parent_id_idx\` ON \`restaurants_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_embed_path_idx\` ON \`restaurants_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_embed_background_background_image_idx\` ON \`restaurants_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_spacer_order_idx\` ON \`restaurants_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_spacer_parent_id_idx\` ON \`restaurants_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_spacer_path_idx\` ON \`restaurants_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_stats_banner_items_order_idx\` ON \`restaurants_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_stats_banner_items_parent_id_idx\` ON \`restaurants_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_stats_banner_order_idx\` ON \`restaurants_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_stats_banner_parent_id_idx\` ON \`restaurants_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_stats_banner_path_idx\` ON \`restaurants_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_stats_banner_background_image_idx\` ON \`restaurants_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`restaurants_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_accommodation_types_order_idx\` ON \`restaurants_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_accommodation_types_parent_idx\` ON \`restaurants_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_image_slider_order_idx\` ON \`restaurants_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_image_slider_parent_id_idx\` ON \`restaurants_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_image_slider_image_idx\` ON \`restaurants_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_order_idx\` ON \`restaurants_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_parent_id_idx\` ON \`restaurants_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_path_idx\` ON \`restaurants_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_single_image_idx\` ON \`restaurants_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_video_file_idx\` ON \`restaurants_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_video_poster_idx\` ON \`restaurants_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_service_listing_background_background_idx\` ON \`restaurants_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_trust_badges_badges_order_idx\` ON \`restaurants_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_trust_badges_badges_parent_id_idx\` ON \`restaurants_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_trust_badges_order_idx\` ON \`restaurants_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_trust_badges_parent_id_idx\` ON \`restaurants_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_trust_badges_path_idx\` ON \`restaurants_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_trust_badges_background_background_im_idx\` ON \`restaurants_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`name\` text NOT NULL,
  	\`subtitle\` text,
  	\`price_range\` text,
  	\`location_type\` text,
  	\`destination_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`whatsapp_message\` text,
  	\`location_address\` text,
  	\`location_map_embed\` text,
  	\`location_latitude\` numeric,
  	\`location_longitude\` numeric,
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
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`restaurants_slug_idx\` ON \`restaurants\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_destination_idx\` ON \`restaurants\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_featured_image_idx\` ON \`restaurants\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_seo_seo_og_image_idx\` ON \`restaurants\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_updated_at_idx\` ON \`restaurants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_created_at_idx\` ON \`restaurants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`restaurants_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`restaurants_id\`) REFERENCES \`restaurants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`restaurants_rels_order_idx\` ON \`restaurants_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_parent_idx\` ON \`restaurants_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_path_idx\` ON \`restaurants_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_rels_restaurants_id_idx\` ON \`restaurants_rels\` (\`restaurants_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_event_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_event_types_order_idx\` ON \`venues_event_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`venues_event_types_parent_idx\` ON \`venues_event_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_quick_specs_order_idx\` ON \`venues_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_quick_specs_parent_id_idx\` ON \`venues_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_gallery_order_idx\` ON \`venues_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_gallery_parent_id_idx\` ON \`venues_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_gallery_image_idx\` ON \`venues_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_packages_includes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_packages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_packages_includes_order_idx\` ON \`venues_packages_includes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_packages_includes_parent_id_idx\` ON \`venues_packages_includes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_packages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`starting_price\` numeric,
  	\`currency\` text DEFAULT 'IDR',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_packages_order_idx\` ON \`venues_packages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_packages_parent_id_idx\` ON \`venues_packages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_features_order_idx\` ON \`venues_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_features_parent_id_idx\` ON \`venues_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`couple_name\` text,
  	\`event_date\` text,
  	\`photo_id\` integer,
  	\`quote\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_testimonials_order_idx\` ON \`venues_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_testimonials_parent_id_idx\` ON \`venues_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_testimonials_photo_idx\` ON \`venues_testimonials\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_image_slider_order_idx\` ON \`venues_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_image_slider_parent_id_idx\` ON \`venues_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_image_slider_image_idx\` ON \`venues_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_order_idx\` ON \`venues_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_parent_id_idx\` ON \`venues_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_path_idx\` ON \`venues_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_single_image_idx\` ON \`venues_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_video_file_idx\` ON \`venues_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_video_poster_idx\` ON \`venues_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_background_background_image_idx\` ON \`venues_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_hero_background_image_idx\` ON \`venues_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_rich_text_order_idx\` ON \`venues_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_rich_text_parent_id_idx\` ON \`venues_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_rich_text_path_idx\` ON \`venues_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_rich_text_background_background_image_idx\` ON \`venues_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_image_order_idx\` ON \`venues_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_image_parent_id_idx\` ON \`venues_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_image_path_idx\` ON \`venues_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_image_image_idx\` ON \`venues_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_image_background_background_image_idx\` ON \`venues_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_images_order_idx\` ON \`venues_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_images_parent_id_idx\` ON \`venues_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_images_image_idx\` ON \`venues_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_order_idx\` ON \`venues_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_parent_id_idx\` ON \`venues_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_path_idx\` ON \`venues_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_gallery_background_background_image_idx\` ON \`venues_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_image_slider_order_idx\` ON \`venues_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_image_slider_parent_id_idx\` ON \`venues_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_image_slider_image_idx\` ON \`venues_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_order_idx\` ON \`venues_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_parent_id_idx\` ON \`venues_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_path_idx\` ON \`venues_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_single_image_idx\` ON \`venues_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_video_file_idx\` ON \`venues_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_video_poster_idx\` ON \`venues_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_cta_background_background_image_idx\` ON \`venues_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_faq_items_order_idx\` ON \`venues_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_faq_items_parent_id_idx\` ON \`venues_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_faq_order_idx\` ON \`venues_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_faq_parent_id_idx\` ON \`venues_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_faq_path_idx\` ON \`venues_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_faq_background_background_image_idx\` ON \`venues_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_items_order_idx\` ON \`venues_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_items_parent_id_idx\` ON \`venues_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_items_photo_idx\` ON \`venues_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_order_idx\` ON \`venues_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_parent_id_idx\` ON \`venues_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_path_idx\` ON \`venues_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_filter_dest_idx\` ON \`venues_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_background_background_image_idx\` ON \`venues_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`venues_blocks_service_grid_order_idx\` ON \`venues_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_grid_parent_id_idx\` ON \`venues_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_grid_path_idx\` ON \`venues_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_grid_background_background_image_idx\` ON \`venues_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_contact_order_idx\` ON \`venues_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_contact_parent_id_idx\` ON \`venues_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_contact_path_idx\` ON \`venues_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_contact_background_background_image_idx\` ON \`venues_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_embed_order_idx\` ON \`venues_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_embed_parent_id_idx\` ON \`venues_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_embed_path_idx\` ON \`venues_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_embed_background_background_image_idx\` ON \`venues_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_spacer_order_idx\` ON \`venues_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_spacer_parent_id_idx\` ON \`venues_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_spacer_path_idx\` ON \`venues_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_value_props_banner_items_order_idx\` ON \`venues_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_value_props_banner_items_parent_id_idx\` ON \`venues_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_value_props_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_value_props_banner_order_idx\` ON \`venues_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_value_props_banner_parent_id_idx\` ON \`venues_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_value_props_banner_path_idx\` ON \`venues_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_value_props_banner_background_background_i_idx\` ON \`venues_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_stats_banner_items_order_idx\` ON \`venues_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_stats_banner_items_parent_id_idx\` ON \`venues_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_stats_banner_order_idx\` ON \`venues_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_stats_banner_parent_id_idx\` ON \`venues_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_stats_banner_path_idx\` ON \`venues_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_stats_banner_background_image_idx\` ON \`venues_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_items_order_idx\` ON \`venues_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_items_parent_id_idx\` ON \`venues_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_items_photo_idx\` ON \`venues_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_testimonials_carousel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`heading\` text DEFAULT 'Memories That Last Forever',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 3,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_order_idx\` ON \`venues_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_parent_id_idx\` ON \`venues_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_path_idx\` ON \`venues_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_filter_dest_idx\` ON \`venues_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_testimonials_carousel_background_backgroun_idx\` ON \`venues_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`venues_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_accommodation_types_order_idx\` ON \`venues_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_accommodation_types_parent_idx\` ON \`venues_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_image_slider_order_idx\` ON \`venues_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_image_slider_parent_id_idx\` ON \`venues_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_image_slider_image_idx\` ON \`venues_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_order_idx\` ON \`venues_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_parent_id_idx\` ON \`venues_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_path_idx\` ON \`venues_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_single_image_idx\` ON \`venues_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_video_file_idx\` ON \`venues_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_video_poster_idx\` ON \`venues_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_service_listing_background_background_imag_idx\` ON \`venues_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_trust_badges_badges_order_idx\` ON \`venues_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_trust_badges_badges_parent_id_idx\` ON \`venues_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_blocks_trust_badges_order_idx\` ON \`venues_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_trust_badges_parent_id_idx\` ON \`venues_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_trust_badges_path_idx\` ON \`venues_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_trust_badges_background_background_image_idx\` ON \`venues_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`name\` text NOT NULL,
  	\`subtitle\` text,
  	\`venue_type\` text,
  	\`destination_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
  	\`capacity_min_guests\` numeric,
  	\`capacity_max_guests\` numeric,
  	\`featured_image_id\` integer NOT NULL,
  	\`whatsapp_message\` text,
  	\`location_address\` text,
  	\`location_map_embed\` text,
  	\`location_latitude\` numeric,
  	\`location_longitude\` numeric,
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
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`venues_slug_idx\` ON \`venues\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`venues_destination_idx\` ON \`venues\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_featured_image_idx\` ON \`venues\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_seo_seo_og_image_idx\` ON \`venues\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_updated_at_idx\` ON \`venues\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`venues_created_at_idx\` ON \`venues\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`venues_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`venues_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`venues_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_rels_order_idx\` ON \`venues_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`venues_rels_parent_idx\` ON \`venues_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_rels_path_idx\` ON \`venues_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`venues_rels_venues_id_idx\` ON \`venues_rels\` (\`venues_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_quick_specs_order_idx\` ON \`rentals_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_quick_specs_parent_id_idx\` ON \`rentals_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_gallery_order_idx\` ON \`rentals_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_gallery_parent_id_idx\` ON \`rentals_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_gallery_image_idx\` ON \`rentals_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_features_order_idx\` ON \`rentals_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_features_parent_id_idx\` ON \`rentals_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_pricing_tiers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`duration\` text,
  	\`price\` numeric NOT NULL,
  	\`currency\` text DEFAULT 'IDR',
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_pricing_tiers_order_idx\` ON \`rentals_pricing_tiers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_pricing_tiers_parent_id_idx\` ON \`rentals_pricing_tiers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_includes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_includes_order_idx\` ON \`rentals_includes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_includes_parent_id_idx\` ON \`rentals_includes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_image_slider_order_idx\` ON \`rentals_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_image_slider_parent_id_idx\` ON \`rentals_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_image_slider_image_idx\` ON \`rentals_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_order_idx\` ON \`rentals_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_parent_id_idx\` ON \`rentals_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_path_idx\` ON \`rentals_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_single_image_idx\` ON \`rentals_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_video_file_idx\` ON \`rentals_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_video_poster_idx\` ON \`rentals_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_background_background_image_idx\` ON \`rentals_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_hero_background_image_idx\` ON \`rentals_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_rich_text_order_idx\` ON \`rentals_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_rich_text_parent_id_idx\` ON \`rentals_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_rich_text_path_idx\` ON \`rentals_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_rich_text_background_background_image_idx\` ON \`rentals_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_image_order_idx\` ON \`rentals_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_image_parent_id_idx\` ON \`rentals_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_image_path_idx\` ON \`rentals_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_image_image_idx\` ON \`rentals_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_image_background_background_image_idx\` ON \`rentals_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_images_order_idx\` ON \`rentals_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_images_parent_id_idx\` ON \`rentals_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_images_image_idx\` ON \`rentals_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_order_idx\` ON \`rentals_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_parent_id_idx\` ON \`rentals_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_path_idx\` ON \`rentals_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_gallery_background_background_image_idx\` ON \`rentals_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_image_slider_order_idx\` ON \`rentals_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_image_slider_parent_id_idx\` ON \`rentals_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_image_slider_image_idx\` ON \`rentals_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_order_idx\` ON \`rentals_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_parent_id_idx\` ON \`rentals_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_path_idx\` ON \`rentals_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_single_image_idx\` ON \`rentals_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_video_file_idx\` ON \`rentals_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_video_poster_idx\` ON \`rentals_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_cta_background_background_image_idx\` ON \`rentals_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_faq_items_order_idx\` ON \`rentals_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_faq_items_parent_id_idx\` ON \`rentals_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_faq_order_idx\` ON \`rentals_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_faq_parent_id_idx\` ON \`rentals_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_faq_path_idx\` ON \`rentals_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_faq_background_background_image_idx\` ON \`rentals_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_items_order_idx\` ON \`rentals_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_items_parent_id_idx\` ON \`rentals_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_items_photo_idx\` ON \`rentals_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_order_idx\` ON \`rentals_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_parent_id_idx\` ON \`rentals_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_path_idx\` ON \`rentals_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_filter_dest_idx\` ON \`rentals_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_background_background_image_idx\` ON \`rentals_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_grid_order_idx\` ON \`rentals_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_grid_parent_id_idx\` ON \`rentals_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_grid_path_idx\` ON \`rentals_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_grid_background_background_image_idx\` ON \`rentals_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_contact_order_idx\` ON \`rentals_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_contact_parent_id_idx\` ON \`rentals_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_contact_path_idx\` ON \`rentals_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_contact_background_background_image_idx\` ON \`rentals_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_embed_order_idx\` ON \`rentals_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_embed_parent_id_idx\` ON \`rentals_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_embed_path_idx\` ON \`rentals_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_embed_background_background_image_idx\` ON \`rentals_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_spacer_order_idx\` ON \`rentals_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_spacer_parent_id_idx\` ON \`rentals_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_spacer_path_idx\` ON \`rentals_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_value_props_banner_items_order_idx\` ON \`rentals_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_value_props_banner_items_parent_id_idx\` ON \`rentals_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_value_props_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_value_props_banner_order_idx\` ON \`rentals_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_value_props_banner_parent_id_idx\` ON \`rentals_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_value_props_banner_path_idx\` ON \`rentals_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_value_props_banner_background_background__idx\` ON \`rentals_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_stats_banner_items_order_idx\` ON \`rentals_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_stats_banner_items_parent_id_idx\` ON \`rentals_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_stats_banner_order_idx\` ON \`rentals_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_stats_banner_parent_id_idx\` ON \`rentals_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_stats_banner_path_idx\` ON \`rentals_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_stats_banner_background_image_idx\` ON \`rentals_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_items_order_idx\` ON \`rentals_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_items_parent_id_idx\` ON \`rentals_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_items_photo_idx\` ON \`rentals_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_testimonials_carousel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`heading\` text DEFAULT 'Memories That Last Forever',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 3,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_order_idx\` ON \`rentals_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_parent_id_idx\` ON \`rentals_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_path_idx\` ON \`rentals_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_filter_dest_idx\` ON \`rentals_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_testimonials_carousel_background_backgrou_idx\` ON \`rentals_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rentals_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_accommodation_types_order_idx\` ON \`rentals_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_accommodation_types_parent_idx\` ON \`rentals_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_image_slider_order_idx\` ON \`rentals_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_image_slider_parent_id_idx\` ON \`rentals_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_image_slider_image_idx\` ON \`rentals_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_order_idx\` ON \`rentals_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_parent_id_idx\` ON \`rentals_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_path_idx\` ON \`rentals_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_single_image_idx\` ON \`rentals_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_video_file_idx\` ON \`rentals_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_video_poster_idx\` ON \`rentals_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_service_listing_background_background_ima_idx\` ON \`rentals_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_trust_badges_badges_order_idx\` ON \`rentals_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_trust_badges_badges_parent_id_idx\` ON \`rentals_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_blocks_trust_badges_order_idx\` ON \`rentals_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_trust_badges_parent_id_idx\` ON \`rentals_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_trust_badges_path_idx\` ON \`rentals_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_trust_badges_background_background_image_idx\` ON \`rentals_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`rental_type\` text NOT NULL,
  	\`destination_id\` integer,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`specifications_brand\` text,
  	\`specifications_model\` text,
  	\`specifications_year\` text,
  	\`specifications_details\` text,
  	\`whatsapp_message\` text,
  	\`requirements\` text,
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
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`rentals_slug_idx\` ON \`rentals\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`rentals_destination_idx\` ON \`rentals\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_featured_image_idx\` ON \`rentals\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_seo_seo_og_image_idx\` ON \`rentals\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_updated_at_idx\` ON \`rentals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`rentals_created_at_idx\` ON \`rentals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`rentals_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rentals_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rentals_id\`) REFERENCES \`rentals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rentals_rels_order_idx\` ON \`rentals_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_parent_idx\` ON \`rentals_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_path_idx\` ON \`rentals_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_rels_rentals_id_idx\` ON \`rentals_rels\` (\`rentals_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_quick_specs_order_idx\` ON \`spa_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_quick_specs_parent_id_idx\` ON \`spa_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_gallery_order_idx\` ON \`spa_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_gallery_parent_id_idx\` ON \`spa_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_gallery_image_idx\` ON \`spa_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_features_order_idx\` ON \`spa_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_features_parent_id_idx\` ON \`spa_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_pricing_tiers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`duration\` text,
  	\`price\` numeric NOT NULL,
  	\`currency\` text DEFAULT 'IDR',
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_pricing_tiers_order_idx\` ON \`spa_pricing_tiers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_pricing_tiers_parent_id_idx\` ON \`spa_pricing_tiers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_includes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_includes_order_idx\` ON \`spa_includes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_includes_parent_id_idx\` ON \`spa_includes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_image_slider_order_idx\` ON \`spa_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_image_slider_parent_id_idx\` ON \`spa_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_image_slider_image_idx\` ON \`spa_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_order_idx\` ON \`spa_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_parent_id_idx\` ON \`spa_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_path_idx\` ON \`spa_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_single_image_idx\` ON \`spa_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_video_file_idx\` ON \`spa_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_video_poster_idx\` ON \`spa_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_background_background_image_idx\` ON \`spa_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_hero_background_image_idx\` ON \`spa_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_rich_text_order_idx\` ON \`spa_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_rich_text_parent_id_idx\` ON \`spa_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_rich_text_path_idx\` ON \`spa_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_rich_text_background_background_image_idx\` ON \`spa_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_image_order_idx\` ON \`spa_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_image_parent_id_idx\` ON \`spa_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_image_path_idx\` ON \`spa_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_image_image_idx\` ON \`spa_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_image_background_background_image_idx\` ON \`spa_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_images_order_idx\` ON \`spa_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_images_parent_id_idx\` ON \`spa_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_images_image_idx\` ON \`spa_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_order_idx\` ON \`spa_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_parent_id_idx\` ON \`spa_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_path_idx\` ON \`spa_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_gallery_background_background_image_idx\` ON \`spa_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_image_slider_order_idx\` ON \`spa_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_image_slider_parent_id_idx\` ON \`spa_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_image_slider_image_idx\` ON \`spa_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_order_idx\` ON \`spa_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_parent_id_idx\` ON \`spa_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_path_idx\` ON \`spa_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_single_image_idx\` ON \`spa_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_video_file_idx\` ON \`spa_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_video_poster_idx\` ON \`spa_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_cta_background_background_image_idx\` ON \`spa_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_faq_items_order_idx\` ON \`spa_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_faq_items_parent_id_idx\` ON \`spa_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_faq_order_idx\` ON \`spa_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_faq_parent_id_idx\` ON \`spa_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_faq_path_idx\` ON \`spa_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_faq_background_background_image_idx\` ON \`spa_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_items_order_idx\` ON \`spa_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_items_parent_id_idx\` ON \`spa_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_items_photo_idx\` ON \`spa_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_order_idx\` ON \`spa_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_parent_id_idx\` ON \`spa_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_path_idx\` ON \`spa_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_filter_dest_idx\` ON \`spa_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_background_background_image_idx\` ON \`spa_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`spa_blocks_service_grid_order_idx\` ON \`spa_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_grid_parent_id_idx\` ON \`spa_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_grid_path_idx\` ON \`spa_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_grid_background_background_image_idx\` ON \`spa_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_contact_order_idx\` ON \`spa_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_contact_parent_id_idx\` ON \`spa_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_contact_path_idx\` ON \`spa_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_contact_background_background_image_idx\` ON \`spa_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_embed_order_idx\` ON \`spa_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_embed_parent_id_idx\` ON \`spa_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_embed_path_idx\` ON \`spa_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_embed_background_background_image_idx\` ON \`spa_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_spacer_order_idx\` ON \`spa_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_spacer_parent_id_idx\` ON \`spa_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_spacer_path_idx\` ON \`spa_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_value_props_banner_items_order_idx\` ON \`spa_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_value_props_banner_items_parent_id_idx\` ON \`spa_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_value_props_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_value_props_banner_order_idx\` ON \`spa_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_value_props_banner_parent_id_idx\` ON \`spa_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_value_props_banner_path_idx\` ON \`spa_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_value_props_banner_background_background_imag_idx\` ON \`spa_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_stats_banner_items_order_idx\` ON \`spa_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_stats_banner_items_parent_id_idx\` ON \`spa_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_stats_banner_order_idx\` ON \`spa_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_stats_banner_parent_id_idx\` ON \`spa_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_stats_banner_path_idx\` ON \`spa_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_stats_banner_background_image_idx\` ON \`spa_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_items_order_idx\` ON \`spa_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_items_parent_id_idx\` ON \`spa_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_items_photo_idx\` ON \`spa_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_testimonials_carousel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`heading\` text DEFAULT 'Memories That Last Forever',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 3,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_order_idx\` ON \`spa_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_parent_id_idx\` ON \`spa_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_path_idx\` ON \`spa_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_filter_dest_idx\` ON \`spa_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_testimonials_carousel_background_background_i_idx\` ON \`spa_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`spa_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_accommodation_types_order_idx\` ON \`spa_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_accommodation_types_parent_idx\` ON \`spa_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_image_slider_order_idx\` ON \`spa_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_image_slider_parent_id_idx\` ON \`spa_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_image_slider_image_idx\` ON \`spa_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_service_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'editorial-featured' NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 24,
  	\`featured_mode\` text DEFAULT 'auto',
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`hero_overlay_opacity\` numeric DEFAULT 40,
  	\`hero_min_height\` text DEFAULT 'md',
  	\`enable_destination_filter\` integer DEFAULT true,
  	\`enable_search\` integer DEFAULT true,
  	\`search_name_placeholder\` text DEFAULT 'Where are you staying?',
  	\`show_date_picker\` integer DEFAULT true,
  	\`show_guest_count\` integer DEFAULT true,
  	\`search_button_text\` text DEFAULT 'Search Collection',
  	\`card_variant\` text DEFAULT 'compact',
  	\`show_load_more\` integer DEFAULT false,
  	\`pagination_type\` text DEFAULT 'load-more',
  	\`load_more_text\` text DEFAULT 'Load More',
  	\`initial_visible_count\` numeric DEFAULT 6,
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_order_idx\` ON \`spa_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_parent_id_idx\` ON \`spa_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_path_idx\` ON \`spa_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_single_image_idx\` ON \`spa_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_video_file_idx\` ON \`spa_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_video_poster_idx\` ON \`spa_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_service_listing_background_background_image_idx\` ON \`spa_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_trust_badges_badges_order_idx\` ON \`spa_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_trust_badges_badges_parent_id_idx\` ON \`spa_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_trust_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Bespoke Concierge Service' NOT NULL,
  	\`description\` text,
  	\`primary_button_text\` text,
  	\`primary_button_link\` text,
  	\`secondary_button_text\` text,
  	\`secondary_button_link\` text,
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
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_blocks_trust_badges_order_idx\` ON \`spa_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_trust_badges_parent_id_idx\` ON \`spa_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_trust_badges_path_idx\` ON \`spa_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_trust_badges_background_background_image_idx\` ON \`spa_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft',
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_featured\` integer DEFAULT false,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`treatment_type\` text NOT NULL,
  	\`destination_id\` integer,
  	\`description\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`specifications_brand\` text,
  	\`specifications_model\` text,
  	\`specifications_year\` text,
  	\`specifications_details\` text,
  	\`whatsapp_message\` text,
  	\`requirements\` text,
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
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`spa_slug_idx\` ON \`spa\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`spa_destination_idx\` ON \`spa\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_featured_image_idx\` ON \`spa\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_seo_seo_og_image_idx\` ON \`spa\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_updated_at_idx\` ON \`spa\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`spa_created_at_idx\` ON \`spa\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`spa_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`spa_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`spa_id\`) REFERENCES \`spa\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`spa_rels_order_idx\` ON \`spa_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`spa_rels_parent_idx\` ON \`spa_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_rels_path_idx\` ON \`spa_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`spa_rels_spa_id_idx\` ON \`spa_rels\` (\`spa_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_quick_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_quick_specs_order_idx\` ON \`ferry_tickets_quick_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_quick_specs_parent_id_idx\` ON \`ferry_tickets_quick_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_highlights_order_idx\` ON \`ferry_tickets_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_highlights_parent_id_idx\` ON \`ferry_tickets_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_gallery_order_idx\` ON \`ferry_tickets_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_gallery_parent_id_idx\` ON \`ferry_tickets_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_gallery_image_idx\` ON \`ferry_tickets_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_schedule_time\` (
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
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_order_idx\` ON \`ferry_tickets_schedule_time\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_schedule_time_parent_id_idx\` ON \`ferry_tickets_schedule_time\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_ferry_classes_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_ferry_classes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_ferry_classes_images_order_idx\` ON \`ferry_tickets_ferry_classes_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_ferry_classes_images_parent_id_idx\` ON \`ferry_tickets_ferry_classes_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_ferry_classes_images_image_idx\` ON \`ferry_tickets_ferry_classes_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_ferry_classes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`class_type\` text NOT NULL,
  	\`currency\` text DEFAULT 'IDR',
  	\`adult_price\` numeric NOT NULL,
  	\`child_price\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_ferry_classes_order_idx\` ON \`ferry_tickets_ferry_classes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_ferry_classes_parent_id_idx\` ON \`ferry_tickets_ferry_classes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_image_slider_order_idx\` ON \`ferry_tickets_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_image_slider_parent_id_idx\` ON \`ferry_tickets_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_image_slider_image_idx\` ON \`ferry_tickets_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`cta_text\` text,
  	\`cta_link\` text,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_subheading_color\` text DEFAULT 'inherit',
  	\`ts_subheading_anim_in\` text DEFAULT 'inherit',
  	\`overlay_opacity\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_order_idx\` ON \`ferry_tickets_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_parent_id_idx\` ON \`ferry_tickets_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_path_idx\` ON \`ferry_tickets_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_single_image_idx\` ON \`ferry_tickets_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_video_file_idx\` ON \`ferry_tickets_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_video_poster_idx\` ON \`ferry_tickets_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_background_background_image_idx\` ON \`ferry_tickets_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_hero_background_image_idx\` ON \`ferry_tickets_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`alignment\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_rich_text_order_idx\` ON \`ferry_tickets_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_rich_text_parent_id_idx\` ON \`ferry_tickets_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_rich_text_path_idx\` ON \`ferry_tickets_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_rich_text_background_background_ima_idx\` ON \`ferry_tickets_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`size\` text DEFAULT 'full',
  	\`aspect_ratio\` text DEFAULT 'auto',
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_image_order_idx\` ON \`ferry_tickets_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_image_parent_id_idx\` ON \`ferry_tickets_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_image_path_idx\` ON \`ferry_tickets_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_image_image_idx\` ON \`ferry_tickets_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_image_background_background_image_idx\` ON \`ferry_tickets_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_images_order_idx\` ON \`ferry_tickets_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_images_parent_id_idx\` ON \`ferry_tickets_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_images_image_idx\` ON \`ferry_tickets_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`desktop_columns\` numeric DEFAULT 3,
  	\`tablet_columns\` numeric DEFAULT 2,
  	\`mobile_columns\` numeric DEFAULT 1,
  	\`enable_lightbox\` integer DEFAULT true,
  	\`hover_effect\` text DEFAULT 'zoom',
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
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`columns\` numeric,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_order_idx\` ON \`ferry_tickets_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_parent_id_idx\` ON \`ferry_tickets_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_path_idx\` ON \`ferry_tickets_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_gallery_background_background_image_idx\` ON \`ferry_tickets_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_image_slider_order_idx\` ON \`ferry_tickets_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_image_slider_parent_id_idx\` ON \`ferry_tickets_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_image_slider_image_idx\` ON \`ferry_tickets_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`button_text\` text NOT NULL,
  	\`button_link\` text NOT NULL,
  	\`media_type\` text DEFAULT 'single' NOT NULL,
  	\`single_image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`image_transition\` text DEFAULT 'fade',
  	\`transition_interval\` numeric DEFAULT 5,
  	\`slider_auto_start\` integer DEFAULT false,
  	\`video_source\` text DEFAULT 'url',
  	\`video_url\` text,
  	\`video_file_id\` integer,
  	\`video_poster_id\` integer,
  	\`video_options_autoplay\` integer DEFAULT true,
  	\`video_options_muted\` integer DEFAULT true,
  	\`video_options_loop\` integer DEFAULT true,
  	\`video_options_controls\` integer DEFAULT false,
  	\`lazy_load\` integer DEFAULT true,
  	\`media_layout\` text DEFAULT 'background',
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
  	\`button_variant\` text DEFAULT 'solid',
  	\`button_color\` text DEFAULT 'coral',
  	\`button_radius\` text DEFAULT 'rounded',
  	\`button_hover_animation\` text DEFAULT 'scale',
  	\`button_text_color\` text DEFAULT 'default',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_description_color\` text DEFAULT 'inherit',
  	\`ts_description_anim_in\` text DEFAULT 'inherit',
  	\`style\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`single_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_order_idx\` ON \`ferry_tickets_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_parent_id_idx\` ON \`ferry_tickets_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_path_idx\` ON \`ferry_tickets_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_single_image_idx\` ON \`ferry_tickets_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_video_file_idx\` ON \`ferry_tickets_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_video_poster_idx\` ON \`ferry_tickets_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_cta_background_background_image_idx\` ON \`ferry_tickets_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_faq_items_order_idx\` ON \`ferry_tickets_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_faq_items_parent_id_idx\` ON \`ferry_tickets_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Frequently Asked Questions',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_faq_order_idx\` ON \`ferry_tickets_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_faq_parent_id_idx\` ON \`ferry_tickets_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_faq_path_idx\` ON \`ferry_tickets_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_faq_background_background_image_idx\` ON \`ferry_tickets_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_items_order_idx\` ON \`ferry_tickets_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_items_parent_id_idx\` ON \`ferry_tickets_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_items_photo_idx\` ON \`ferry_tickets_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'What Our Guests Say',
  	\`source\` text DEFAULT 'inline',
  	\`svc\` text DEFAULT 'all',
  	\`max_items\` numeric DEFAULT 6,
  	\`filter_dest_id\` integer,
  	\`only_featured\` integer DEFAULT false,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 6,
  	\`more_text\` text DEFAULT 'Load More',
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
  	\`ts_quote_color\` text DEFAULT 'inherit',
  	\`ts_quote_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`filter_dest_id\`) REFERENCES \`destinations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_order_idx\` ON \`ferry_tickets_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_parent_id_idx\` ON \`ferry_tickets_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_path_idx\` ON \`ferry_tickets_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_filter_dest_idx\` ON \`ferry_tickets_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_testimonials_background_background__idx\` ON \`ferry_tickets_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_service_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`service_type\` text NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`featured_only\` integer DEFAULT false,
  	\`card_variant\` text DEFAULT 'compact',
  	\`template\` text DEFAULT 'default',
  	\`selection_mode\` text DEFAULT 'manual',
  	\`section_title\` text,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_text\` text,
  	\`view_all_link\` text,
  	\`paginate\` integer DEFAULT false,
  	\`page_mode\` text DEFAULT 'load-more',
  	\`page_size\` numeric DEFAULT 3,
  	\`more_text\` text DEFAULT 'Load More',
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
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_service_grid_order_idx\` ON \`ferry_tickets_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_service_grid_parent_id_idx\` ON \`ferry_tickets_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_service_grid_path_idx\` ON \`ferry_tickets_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_service_grid_background_background__idx\` ON \`ferry_tickets_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_map\` integer DEFAULT true,
  	\`show_whats_app\` integer DEFAULT true,
  	\`additional_text\` text,
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
  	\`ts_paragraph_color\` text DEFAULT 'inherit',
  	\`ts_paragraph_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_contact_order_idx\` ON \`ferry_tickets_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_contact_parent_id_idx\` ON \`ferry_tickets_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_contact_path_idx\` ON \`ferry_tickets_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_contact_background_background_image_idx\` ON \`ferry_tickets_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`embed_type\` text,
  	\`embed_code\` text NOT NULL,
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
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_embed_order_idx\` ON \`ferry_tickets_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_embed_parent_id_idx\` ON \`ferry_tickets_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_embed_path_idx\` ON \`ferry_tickets_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_embed_background_background_image_idx\` ON \`ferry_tickets_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_spacer_order_idx\` ON \`ferry_tickets_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_spacer_parent_id_idx\` ON \`ferry_tickets_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_spacer_path_idx\` ON \`ferry_tickets_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_stats_banner_items_order_idx\` ON \`ferry_tickets_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_stats_banner_items_parent_id_idx\` ON \`ferry_tickets_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_stats_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme-1',
  	\`eyebrow\` text DEFAULT 'Why Choose Us',
  	\`heading\` text DEFAULT 'Your Journey is Our Priority' NOT NULL,
  	\`background_image_id\` integer,
  	\`section_padding\` text DEFAULT 'normal',
  	\`content_alignment\` text DEFAULT 'center',
  	\`container_width\` text DEFAULT 'normal',
  	\`entry_animation\` text DEFAULT 'reveal',
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
  	\`ts_eyebrow_color\` text DEFAULT 'inherit',
  	\`ts_eyebrow_anim_in\` text DEFAULT 'inherit',
  	\`ts_heading_color\` text DEFAULT 'inherit',
  	\`ts_heading_anim_in\` text DEFAULT 'inherit',
  	\`ts_label_color\` text DEFAULT 'inherit',
  	\`ts_label_anim_in\` text DEFAULT 'inherit',
  	\`ts_caption_color\` text DEFAULT 'inherit',
  	\`ts_caption_anim_in\` text DEFAULT 'inherit',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_stats_banner_order_idx\` ON \`ferry_tickets_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_stats_banner_parent_id_idx\` ON \`ferry_tickets_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_stats_banner_path_idx\` ON \`ferry_tickets_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_stats_banner_background_image_idx\` ON \`ferry_tickets_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets\` (
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
  await db.run(sql`CREATE UNIQUE INDEX \`ferry_tickets_slug_idx\` ON \`ferry_tickets\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_destination_idx\` ON \`ferry_tickets\` (\`destination_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_category_idx\` ON \`ferry_tickets\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_featured_image_idx\` ON \`ferry_tickets\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_seo_seo_og_image_idx\` ON \`ferry_tickets\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_updated_at_idx\` ON \`ferry_tickets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_created_at_idx\` ON \`ferry_tickets\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`ferry_tickets_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`ferry_tickets_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_order_idx\` ON \`ferry_tickets_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_parent_idx\` ON \`ferry_tickets_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_path_idx\` ON \`ferry_tickets_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_rels_ferry_tickets_id_idx\` ON \`ferry_tickets_rels\` (\`ferry_tickets_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_items_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text DEFAULT 'custom_url' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`target\` text DEFAULT '_self',
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_items_children_order_idx\` ON \`menus_items_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_items_children_parent_id_idx\` ON \`menus_items_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`menus_items_children_page_idx\` ON \`menus_items_children\` (\`page_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text DEFAULT 'custom_url' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`target\` text DEFAULT '_self',
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_items_order_idx\` ON \`menus_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_items_parent_id_idx\` ON \`menus_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`menus_items_page_idx\` ON \`menus_items\` (\`page_id\`);`)
  await db.run(sql`CREATE TABLE \`menus\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'active',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`menus_slug_idx\` ON \`menus\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`menus_updated_at_idx\` ON \`menus\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`menus_created_at_idx\` ON \`menus\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`credit\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`avatar_id\` integer,
  	\`name\` text NOT NULL,
  	\`phone\` text,
  	\`address\` text,
  	\`last_login_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`users_avatar_idx\` ON \`users\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`newsletter_subscribers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	\`status\` text DEFAULT 'active' NOT NULL,
  	\`source\` text,
  	\`user_agent\` text,
  	\`ip_hash\` text,
  	\`notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`newsletter_subscribers_email_idx\` ON \`newsletter_subscribers\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`newsletter_subscribers_updated_at_idx\` ON \`newsletter_subscribers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`newsletter_subscribers_created_at_idx\` ON \`newsletter_subscribers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_service_types_id_idx\` ON \`payload_locked_documents_rels\` (\`service_types_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_destinations_id_idx\` ON \`payload_locked_documents_rels\` (\`destinations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_destination_types_id_idx\` ON \`payload_locked_documents_rels\` (\`destination_types_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
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
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'DnJourneysBali' NOT NULL,
  	\`tagline\` text,
  	\`logo_id\` integer,
  	\`logo_dark_id\` integer,
  	\`favicon_id\` integer,
  	\`contact_email\` text,
  	\`contact_phone\` text,
  	\`contact_whatsapp\` text,
  	\`contact_address\` text,
  	\`contact_map_embed\` text,
  	\`whatsapp_defaults_default_number\` text,
  	\`whatsapp_defaults_greeting_message\` text,
  	\`whatsapp_defaults_business_hours\` text,
  	\`social_media_instagram\` text,
  	\`social_media_facebook\` text,
  	\`social_media_tiktok\` text,
  	\`social_media_youtube\` text,
  	\`social_media_tripadvisor\` text,
  	\`default_seo_meta_title\` text,
  	\`default_seo_meta_description\` text,
  	\`default_seo_og_image_id\` integer,
  	\`default_seo_google_analytics_id\` text,
  	\`default_seo_cloudflare_web_analytics_token\` text,
  	\`layout_block_gap\` text DEFAULT 'normal',
  	\`layout_before_footer\` text,
  	\`layout_block_padding_top_mobile\` numeric DEFAULT 48,
  	\`layout_block_padding_top_desktop\` numeric DEFAULT 64,
  	\`layout_block_padding_bottom_mobile\` numeric DEFAULT 48,
  	\`layout_block_padding_bottom_desktop\` numeric DEFAULT 64,
  	\`section_pages_listing_title\` text DEFAULT 'Luxury Collections',
  	\`section_pages_listing_subtitle\` text DEFAULT 'properties available in Bali & surrounding islands',
  	\`related_services_enabled\` integer DEFAULT true,
  	\`related_services_section_title\` text,
  	\`related_services_card_style\` text DEFAULT 'curated',
  	\`related_services_max_items\` numeric DEFAULT 3,
  	\`related_services_selection_mode\` text DEFAULT 'same_type',
  	\`related_services_show_explore_all\` integer DEFAULT true,
  	\`error_pages_not_found_title\` text DEFAULT 'Halaman Tidak Ditemukan',
  	\`error_pages_not_found_message\` text DEFAULT 'Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau modul-nya sedang dinonaktifkan.',
  	\`error_pages_not_found_button_text\` text DEFAULT 'Kembali ke Beranda',
  	\`error_pages_property_coming_soon_eyebrow\` text DEFAULT 'Coming Soon',
  	\`error_pages_property_coming_soon_title\` text DEFAULT 'Property & Land for Sale',
  	\`error_pages_property_coming_soon_description\` text DEFAULT 'Layanan property & land for sale di Bali sedang kami siapkan. Sementara ini, kalau kamu tertarik cari villa, tanah, atau rumah investasi di Bali, hubungi kami langsung — tim lokal kami siap bantu dengan listing eksklusif yang belum masuk website.',
  	\`error_pages_property_coming_soon_whatsapp_message\` text DEFAULT 'Halo DnJourneysBali! 👋
  
  Saya tertarik dengan Property & Land for Sale di Bali. Boleh info listing yang tersedia?',
  	\`error_pages_property_coming_soon_primary_button_text\` text DEFAULT 'Enquire via WhatsApp',
  	\`error_pages_property_coming_soon_secondary_button_text\` text DEFAULT 'Back to Home',
  	\`footer_copyright_text\` text,
  	\`footer_additional_scripts\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_dark_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_dark_idx\` ON \`site_settings\` (\`logo_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_default_seo_og_image_idx\` ON \`site_settings\` (\`default_seo_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`header_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`template\` text DEFAULT 'header-1' NOT NULL,
  	\`sticky_on_scroll\` integer DEFAULT true,
  	\`transparent_on_top\` integer DEFAULT false,
  	\`primary_menu_id\` integer,
  	\`secondary_menu_id\` integer,
  	\`show_search\` integer DEFAULT true,
  	\`show_social_links\` integer DEFAULT true,
  	\`show_cta_button\` integer DEFAULT true,
  	\`cta_text\` text DEFAULT 'WhatsApp Booking',
  	\`cta_type\` text DEFAULT 'whatsapp',
  	\`cta_custom_link\` text,
  	\`show_top_bar_address\` integer DEFAULT true,
  	\`show_top_bar_phone\` integer DEFAULT true,
  	\`top_bar_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`primary_menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`secondary_menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`header_settings_primary_menu_idx\` ON \`header_settings\` (\`primary_menu_id\`);`)
  await db.run(sql`CREATE INDEX \`header_settings_secondary_menu_idx\` ON \`header_settings\` (\`secondary_menu_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_settings_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`column_label\` text,
  	\`menu_id\` integer,
  	FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_order_idx\` ON \`footer_settings_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_parent_id_idx\` ON \`footer_settings_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_menu_idx\` ON \`footer_settings_columns\` (\`menu_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`template\` text DEFAULT 'footer-1' NOT NULL,
  	\`show_brand_column\` integer DEFAULT true,
  	\`brand_tagline_override\` text,
  	\`show_social_links\` integer DEFAULT true,
  	\`show_services_column\` integer DEFAULT true,
  	\`services_column_label\` text DEFAULT 'Our Services',
  	\`services_menu_id\` integer,
  	\`show_contact_column\` integer DEFAULT true,
  	\`contact_column_label\` text DEFAULT 'Contact Us',
  	\`newsletter_heading\` text DEFAULT 'Get Bali Travel Inspiration' NOT NULL,
  	\`newsletter_theme\` text DEFAULT 'ocean' NOT NULL,
  	\`newsletter_description\` text,
  	\`newsletter_placeholder_text\` text DEFAULT 'your@email.com' NOT NULL,
  	\`newsletter_button_label\` text DEFAULT 'Subscribe' NOT NULL,
  	\`newsletter_success_message\` text DEFAULT 'Thanks! We''ll be in touch.' NOT NULL,
  	\`newsletter_error_message\` text DEFAULT 'Something went wrong. Please try again.' NOT NULL,
  	\`legal_links_id\` integer,
  	\`bottom_bar_right_text\` text DEFAULT 'Designed with ♥ in Bali',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`services_menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`legal_links_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_settings_services_menu_idx\` ON \`footer_settings\` (\`services_menu_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_legal_links_idx\` ON \`footer_settings\` (\`legal_links_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_content_value_props\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_content_value_props_order_idx\` ON \`homepage_content_value_props\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_content_value_props_parent_id_idx\` ON \`homepage_content_value_props\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_content_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_content_stats_order_idx\` ON \`homepage_content_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_content_stats_parent_id_idx\` ON \`homepage_content_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_content\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_heading\` text DEFAULT 'Discover Bali Beyond Ordinary',
  	\`hero_cta_text\` text DEFAULT 'Explore Tours',
  	\`hero_subheading\` text DEFAULT 'Explore breathtaking destinations, stay in exclusive villas, enjoy adventures, and create unforgettable memories.',
  	\`hero_cta_link\` text DEFAULT '/tours',
  	\`stats_eyebrow\` text DEFAULT 'Why Choose Us',
  	\`stats_heading\` text DEFAULT 'Your Journey is Our Priority',
  	\`testimonials_eyebrow\` text DEFAULT 'What Our Clients Say',
  	\`testimonials_heading\` text DEFAULT 'Memories That Last Forever',
  	\`cta_heading\` text DEFAULT 'Ready to Plan Your Perfect Trip?',
  	\`cta_description\` text DEFAULT 'Chat with us on WhatsApp and get the best offers!',
  	\`cta_button_text\` text DEFAULT 'Chat on WhatsApp',
  	\`cta_button_link_override\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`site_features\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`modules_tours\` integer DEFAULT true,
  	\`modules_accommodations\` integer DEFAULT true,
  	\`modules_water_activities\` integer DEFAULT true,
  	\`modules_yacht\` integer DEFAULT true,
  	\`modules_restaurants\` integer DEFAULT true,
  	\`modules_weddings\` integer DEFAULT true,
  	\`modules_rentals\` integer DEFAULT true,
  	\`modules_spa\` integer DEFAULT true,
  	\`modules_ferry_tickets\` integer DEFAULT true,
  	\`sections_testimonials\` integer DEFAULT true,
  	\`sections_faq\` integer DEFAULT true,
  	\`sections_promo_banner\` integer DEFAULT false,
  	\`sections_newsletter\` integer DEFAULT false,
  	\`destinations_hierarchical_filter\` integer DEFAULT false,
  	\`destinations_destination_types_enabled\` integer DEFAULT true,
  	\`features_whatsapp_float\` integer DEFAULT true,
  	\`features_announcement_bar\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`announcement_bar\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`message\` text NOT NULL,
  	\`theme\` text DEFAULT 'ocean' NOT NULL,
  	\`dismissible\` integer DEFAULT true,
  	\`link_enabled\` integer DEFAULT false,
  	\`link_label\` text,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`display_frequency\` text DEFAULT '1440' NOT NULL,
  	\`reset_visitor_cookies\` integer DEFAULT false,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`show_on_homepage_only\` integer DEFAULT false,
  	\`version\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`promo_banner\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'theme1-with-image' NOT NULL,
  	\`headline\` text NOT NULL,
  	\`subheadline\` text,
  	\`image_id\` integer,
  	\`cta_label\` text DEFAULT 'Learn More' NOT NULL,
  	\`cta_url\` text NOT NULL,
  	\`cta_new_tab\` integer DEFAULT false,
  	\`trigger_delay\` numeric DEFAULT 5 NOT NULL,
  	\`display_frequency\` text DEFAULT '1440' NOT NULL,
  	\`suppress_after_scroll\` integer DEFAULT true,
  	\`reset_visitor_cookies\` integer DEFAULT false,
  	\`version\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`show_on_homepage_only\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`promo_banner_image_idx\` ON \`promo_banner\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`service_types\`;`)
  await db.run(sql`DROP TABLE \`destinations_gallery\`;`)
  await db.run(sql`DROP TABLE \`destinations\`;`)
  await db.run(sql`DROP TABLE \`destination_types\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`tours_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`tours_highlights\`;`)
  await db.run(sql`DROP TABLE \`tours_gallery\`;`)
  await db.run(sql`DROP TABLE \`tours_itinerary\`;`)
  await db.run(sql`DROP TABLE \`tours_includes\`;`)
  await db.run(sql`DROP TABLE \`tours_excludes\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`tours\`;`)
  await db.run(sql`DROP TABLE \`tours_rels\`;`)
  await db.run(sql`DROP TABLE \`accommodations_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`accommodations_highlight_tags\`;`)
  await db.run(sql`DROP TABLE \`accommodations_gallery\`;`)
  await db.run(sql`DROP TABLE \`accommodations_room_types_images\`;`)
  await db.run(sql`DROP TABLE \`accommodations_room_types\`;`)
  await db.run(sql`DROP TABLE \`accommodations_amenities\`;`)
  await db.run(sql`DROP TABLE \`accommodations_facilities_items\`;`)
  await db.run(sql`DROP TABLE \`accommodations_facilities\`;`)
  await db.run(sql`DROP TABLE \`accommodations_nearby_landmarks\`;`)
  await db.run(sql`DROP TABLE \`accommodations_curated_experiences\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`accommodations\`;`)
  await db.run(sql`DROP TABLE \`accommodations_rels\`;`)
  await db.run(sql`DROP TABLE \`water_activities_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`water_activities_gallery\`;`)
  await db.run(sql`DROP TABLE \`water_activities_what_to_bring\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`water_activities\`;`)
  await db.run(sql`DROP TABLE \`water_activities_rels\`;`)
  await db.run(sql`DROP TABLE \`yachts_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`yachts_gallery\`;`)
  await db.run(sql`DROP TABLE \`yachts_packages_includes\`;`)
  await db.run(sql`DROP TABLE \`yachts_packages\`;`)
  await db.run(sql`DROP TABLE \`yachts_amenities\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`yachts\`;`)
  await db.run(sql`DROP TABLE \`yachts_rels\`;`)
  await db.run(sql`DROP TABLE \`restaurants_cuisine_type\`;`)
  await db.run(sql`DROP TABLE \`restaurants_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`restaurants_gallery\`;`)
  await db.run(sql`DROP TABLE \`restaurants_menu_highlights\`;`)
  await db.run(sql`DROP TABLE \`restaurants_features\`;`)
  await db.run(sql`DROP TABLE \`restaurants_opening_hours\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`restaurants\`;`)
  await db.run(sql`DROP TABLE \`restaurants_rels\`;`)
  await db.run(sql`DROP TABLE \`venues_event_types\`;`)
  await db.run(sql`DROP TABLE \`venues_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`venues_gallery\`;`)
  await db.run(sql`DROP TABLE \`venues_packages_includes\`;`)
  await db.run(sql`DROP TABLE \`venues_packages\`;`)
  await db.run(sql`DROP TABLE \`venues_features\`;`)
  await db.run(sql`DROP TABLE \`venues_testimonials\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`venues\`;`)
  await db.run(sql`DROP TABLE \`venues_rels\`;`)
  await db.run(sql`DROP TABLE \`rentals_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`rentals_gallery\`;`)
  await db.run(sql`DROP TABLE \`rentals_features\`;`)
  await db.run(sql`DROP TABLE \`rentals_pricing_tiers\`;`)
  await db.run(sql`DROP TABLE \`rentals_includes\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`rentals\`;`)
  await db.run(sql`DROP TABLE \`rentals_rels\`;`)
  await db.run(sql`DROP TABLE \`spa_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`spa_gallery\`;`)
  await db.run(sql`DROP TABLE \`spa_features\`;`)
  await db.run(sql`DROP TABLE \`spa_pricing_tiers\`;`)
  await db.run(sql`DROP TABLE \`spa_includes\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`spa\`;`)
  await db.run(sql`DROP TABLE \`spa_rels\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_quick_specs\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_highlights\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_gallery\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_schedule_time\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_ferry_classes_images\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_ferry_classes\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_rels\`;`)
  await db.run(sql`DROP TABLE \`menus_items_children\`;`)
  await db.run(sql`DROP TABLE \`menus_items\`;`)
  await db.run(sql`DROP TABLE \`menus\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`newsletter_subscribers\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`header_settings\`;`)
  await db.run(sql`DROP TABLE \`footer_settings_columns\`;`)
  await db.run(sql`DROP TABLE \`footer_settings\`;`)
  await db.run(sql`DROP TABLE \`homepage_content_value_props\`;`)
  await db.run(sql`DROP TABLE \`homepage_content_stats\`;`)
  await db.run(sql`DROP TABLE \`homepage_content\`;`)
  await db.run(sql`DROP TABLE \`site_features\`;`)
  await db.run(sql`DROP TABLE \`announcement_bar\`;`)
  await db.run(sql`DROP TABLE \`promo_banner\`;`)
}
