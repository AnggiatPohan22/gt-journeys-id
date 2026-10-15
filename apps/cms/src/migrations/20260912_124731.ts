import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`posts_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_gallery_order_idx\` ON \`posts_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_gallery_parent_id_idx\` ON \`posts_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_gallery_image_idx\` ON \`posts_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_hero_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_image_slider_order_idx\` ON \`posts_blocks_hero_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_image_slider_parent_id_idx\` ON \`posts_blocks_hero_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_image_slider_image_idx\` ON \`posts_blocks_hero_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_hero\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_order_idx\` ON \`posts_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_parent_id_idx\` ON \`posts_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_path_idx\` ON \`posts_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_single_image_idx\` ON \`posts_blocks_hero\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_video_file_idx\` ON \`posts_blocks_hero\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_video_poster_idx\` ON \`posts_blocks_hero\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_background_background_image_idx\` ON \`posts_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_hero_background_image_idx\` ON \`posts_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_rich_text\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_rich_text_order_idx\` ON \`posts_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_rich_text_parent_id_idx\` ON \`posts_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_rich_text_path_idx\` ON \`posts_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_rich_text_background_background_image_idx\` ON \`posts_blocks_rich_text\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_image\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_order_idx\` ON \`posts_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_parent_id_idx\` ON \`posts_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_path_idx\` ON \`posts_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_image_idx\` ON \`posts_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_background_background_image_idx\` ON \`posts_blocks_image\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_images_order_idx\` ON \`posts_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_images_parent_id_idx\` ON \`posts_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_images_image_idx\` ON \`posts_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_gallery\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_order_idx\` ON \`posts_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_parent_id_idx\` ON \`posts_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_path_idx\` ON \`posts_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_background_background_image_idx\` ON \`posts_blocks_gallery\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_cta_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_fit\` text DEFAULT 'cover',
  	\`image_position\` text DEFAULT 'center',
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_image_slider_order_idx\` ON \`posts_blocks_cta_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_image_slider_parent_id_idx\` ON \`posts_blocks_cta_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_image_slider_image_idx\` ON \`posts_blocks_cta_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_cta\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_order_idx\` ON \`posts_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_parent_id_idx\` ON \`posts_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_path_idx\` ON \`posts_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_single_image_idx\` ON \`posts_blocks_cta\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_video_file_idx\` ON \`posts_blocks_cta\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_video_poster_idx\` ON \`posts_blocks_cta\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_cta_background_background_image_idx\` ON \`posts_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_faq_items_order_idx\` ON \`posts_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_faq_items_parent_id_idx\` ON \`posts_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_faq\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_faq_order_idx\` ON \`posts_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_faq_parent_id_idx\` ON \`posts_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_faq_path_idx\` ON \`posts_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_faq_background_background_image_idx\` ON \`posts_blocks_faq\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_testimonials_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_items_order_idx\` ON \`posts_blocks_testimonials_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_items_parent_id_idx\` ON \`posts_blocks_testimonials_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_items_photo_idx\` ON \`posts_blocks_testimonials_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_testimonials\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_order_idx\` ON \`posts_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_parent_id_idx\` ON \`posts_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_path_idx\` ON \`posts_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_filter_dest_idx\` ON \`posts_blocks_testimonials\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_background_background_image_idx\` ON \`posts_blocks_testimonials\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_service_grid\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_grid_order_idx\` ON \`posts_blocks_service_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_grid_parent_id_idx\` ON \`posts_blocks_service_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_grid_path_idx\` ON \`posts_blocks_service_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_grid_background_background_image_idx\` ON \`posts_blocks_service_grid\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_contact\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_contact_order_idx\` ON \`posts_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_contact_parent_id_idx\` ON \`posts_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_contact_path_idx\` ON \`posts_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_contact_background_background_image_idx\` ON \`posts_blocks_contact\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_embed\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_embed_order_idx\` ON \`posts_blocks_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_embed_parent_id_idx\` ON \`posts_blocks_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_embed_path_idx\` ON \`posts_blocks_embed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_embed_background_background_image_idx\` ON \`posts_blocks_embed\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT 'md',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_spacer_order_idx\` ON \`posts_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_spacer_parent_id_idx\` ON \`posts_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_spacer_path_idx\` ON \`posts_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_value_props_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_value_props_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_value_props_banner_items_order_idx\` ON \`posts_blocks_value_props_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_value_props_banner_items_parent_id_idx\` ON \`posts_blocks_value_props_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_value_props_banner\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_value_props_banner_order_idx\` ON \`posts_blocks_value_props_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_value_props_banner_parent_id_idx\` ON \`posts_blocks_value_props_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_value_props_banner_path_idx\` ON \`posts_blocks_value_props_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_value_props_banner_background_background_im_idx\` ON \`posts_blocks_value_props_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_stats_banner_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_stats_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_banner_items_order_idx\` ON \`posts_blocks_stats_banner_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_banner_items_parent_id_idx\` ON \`posts_blocks_stats_banner_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_stats_banner\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_banner_order_idx\` ON \`posts_blocks_stats_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_banner_parent_id_idx\` ON \`posts_blocks_stats_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_banner_path_idx\` ON \`posts_blocks_stats_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_banner_background_image_idx\` ON \`posts_blocks_stats_banner\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_testimonials_carousel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`location\` text,
  	\`quote\` text,
  	\`photo_id\` integer,
  	\`rating\` numeric DEFAULT 5,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_testimonials_carousel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_items_order_idx\` ON \`posts_blocks_testimonials_carousel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_items_parent_id_idx\` ON \`posts_blocks_testimonials_carousel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_items_photo_idx\` ON \`posts_blocks_testimonials_carousel_items\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_testimonials_carousel\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_order_idx\` ON \`posts_blocks_testimonials_carousel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_parent_id_idx\` ON \`posts_blocks_testimonials_carousel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_path_idx\` ON \`posts_blocks_testimonials_carousel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_filter_dest_idx\` ON \`posts_blocks_testimonials_carousel\` (\`filter_dest_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_testimonials_carousel_background_background_idx\` ON \`posts_blocks_testimonials_carousel\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_service_listing_accommodation_types\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_accommodation_types_order_idx\` ON \`posts_blocks_service_listing_accommodation_types\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_accommodation_types_parent_idx\` ON \`posts_blocks_service_listing_accommodation_types\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_service_listing_image_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_service_listing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_image_slider_order_idx\` ON \`posts_blocks_service_listing_image_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_image_slider_parent_id_idx\` ON \`posts_blocks_service_listing_image_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_image_slider_image_idx\` ON \`posts_blocks_service_listing_image_slider\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_service_listing\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_order_idx\` ON \`posts_blocks_service_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_parent_id_idx\` ON \`posts_blocks_service_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_path_idx\` ON \`posts_blocks_service_listing\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_single_image_idx\` ON \`posts_blocks_service_listing\` (\`single_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_video_file_idx\` ON \`posts_blocks_service_listing\` (\`video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_video_poster_idx\` ON \`posts_blocks_service_listing\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_service_listing_background_background_image_idx\` ON \`posts_blocks_service_listing\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_trust_badges_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon_name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_trust_badges\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_trust_badges_badges_order_idx\` ON \`posts_blocks_trust_badges_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_trust_badges_badges_parent_id_idx\` ON \`posts_blocks_trust_badges_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_trust_badges\` (
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_trust_badges_order_idx\` ON \`posts_blocks_trust_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_trust_badges_parent_id_idx\` ON \`posts_blocks_trust_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_trust_badges_path_idx\` ON \`posts_blocks_trust_badges\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_trust_badges_background_background_image_idx\` ON \`posts_blocks_trust_badges\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`published_at\` text,
  	\`author_id\` integer NOT NULL,
  	\`reading_time_minutes\` numeric,
  	\`is_featured\` integer DEFAULT false,
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
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_author_idx\` ON \`posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_category_idx\` ON \`posts\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_featured_image_idx\` ON \`posts\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_seo_seo_og_image_idx\` ON \`posts\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_categories_id_idx\` ON \`posts_rels\` (\`categories_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`posts_gallery\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_hero_image_slider\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_cta_image_slider\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_testimonials_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_service_grid\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_embed\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_value_props_banner_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_value_props_banner\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_stats_banner_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_stats_banner\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_testimonials_carousel_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_testimonials_carousel\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_service_listing_accommodation_types\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_service_listing_image_slider\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_service_listing\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_trust_badges_badges\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_trust_badges\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id") SELECT "id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
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
