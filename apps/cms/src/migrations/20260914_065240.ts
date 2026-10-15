import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`pages_blocks_newsletter_order_idx\` ON \`pages_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_newsletter_parent_id_idx\` ON \`pages_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_newsletter_path_idx\` ON \`pages_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_newsletter_background_background_image_idx\` ON \`pages_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`posts_blocks_newsletter_order_idx\` ON \`posts_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_newsletter_parent_id_idx\` ON \`posts_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_newsletter_path_idx\` ON \`posts_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_newsletter_background_background_image_idx\` ON \`posts_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`tours_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`tours_blocks_newsletter_order_idx\` ON \`tours_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_newsletter_parent_id_idx\` ON \`tours_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_newsletter_path_idx\` ON \`tours_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`tours_blocks_newsletter_background_background_image_idx\` ON \`tours_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`accommodations_blocks_newsletter_order_idx\` ON \`accommodations_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_newsletter_parent_id_idx\` ON \`accommodations_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_newsletter_path_idx\` ON \`accommodations_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_blocks_newsletter_background_background_i_idx\` ON \`accommodations_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`water_activities_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`water_activities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_newsletter_order_idx\` ON \`water_activities_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_newsletter_parent_id_idx\` ON \`water_activities_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_newsletter_path_idx\` ON \`water_activities_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`water_activities_blocks_newsletter_background_background_idx\` ON \`water_activities_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`yachts_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`yachts_blocks_newsletter_order_idx\` ON \`yachts_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_newsletter_parent_id_idx\` ON \`yachts_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_newsletter_path_idx\` ON \`yachts_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`yachts_blocks_newsletter_background_background_image_idx\` ON \`yachts_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`restaurants_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`restaurants_blocks_newsletter_order_idx\` ON \`restaurants_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_newsletter_parent_id_idx\` ON \`restaurants_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_newsletter_path_idx\` ON \`restaurants_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`restaurants_blocks_newsletter_background_background_imag_idx\` ON \`restaurants_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`venues_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`venues_blocks_newsletter_order_idx\` ON \`venues_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_newsletter_parent_id_idx\` ON \`venues_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_newsletter_path_idx\` ON \`venues_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`venues_blocks_newsletter_background_background_image_idx\` ON \`venues_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`rentals_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`rentals_blocks_newsletter_order_idx\` ON \`rentals_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_newsletter_parent_id_idx\` ON \`rentals_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_newsletter_path_idx\` ON \`rentals_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rentals_blocks_newsletter_background_background_image_idx\` ON \`rentals_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`spa_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  await db.run(sql`CREATE INDEX \`spa_blocks_newsletter_order_idx\` ON \`spa_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_newsletter_parent_id_idx\` ON \`spa_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_newsletter_path_idx\` ON \`spa_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`spa_blocks_newsletter_background_background_image_idx\` ON \`spa_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`ferry_tickets_blocks_newsletter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Never Miss a Story' NOT NULL,
  	\`description\` text DEFAULT 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
  	\`placeholder_text\` text DEFAULT 'Your email address',
  	\`button_label\` text DEFAULT 'Subscribe',
  	\`success_message\` text DEFAULT 'Thanks! We''ll be in touch.',
  	\`error_message\` text DEFAULT 'Something went wrong. Please try again.',
  	\`theme\` text DEFAULT 'sand',
  	\`layout\` text DEFAULT 'stacked',
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ferry_tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_newsletter_order_idx\` ON \`ferry_tickets_blocks_newsletter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_newsletter_parent_id_idx\` ON \`ferry_tickets_blocks_newsletter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_newsletter_path_idx\` ON \`ferry_tickets_blocks_newsletter\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`ferry_tickets_blocks_newsletter_background_background_im_idx\` ON \`ferry_tickets_blocks_newsletter\` (\`background_image_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blog_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`related_posts_enabled\` integer DEFAULT true,
  	\`related_posts_heading\` text DEFAULT 'You Might Also Like',
  	\`related_posts_subtitle\` text DEFAULT 'Continue your journey with more insights from our travel editors.',
  	\`related_posts_selection_mode\` text DEFAULT 'same-category',
  	\`related_posts_limit\` numeric DEFAULT 3,
  	\`related_posts_columns\` text DEFAULT '3',
  	\`related_posts_card_variant\` text DEFAULT 'compact',
  	\`related_posts_show_category\` integer DEFAULT true,
  	\`related_posts_show_excerpt\` integer DEFAULT true,
  	\`related_posts_show_date\` integer DEFAULT true,
  	\`related_posts_show_reading_time\` integer DEFAULT false,
  	\`related_posts_show_view_all\` integer DEFAULT true,
  	\`related_posts_view_all_text\` text DEFAULT 'View All Articles',
  	\`related_posts_view_all_link\` text DEFAULT '/blog',
  	\`related_posts_background\` text DEFAULT 'sand',
  	\`related_posts_padding\` text DEFAULT 'md',
  	\`sidebar_show_popular_posts\` integer DEFAULT true,
  	\`sidebar_popular_posts_heading\` text DEFAULT 'Popular Posts',
  	\`sidebar_popular_posts_limit\` numeric DEFAULT 5,
  	\`sidebar_show_ad_slot\` integer DEFAULT true,
  	\`sidebar_ad_slot_position\` text DEFAULT 'between',
  	\`sidebar_show_categories\` integer DEFAULT true,
  	\`sidebar_categories_heading\` text DEFAULT 'Categories',
  	\`sidebar_categories_limit\` numeric DEFAULT 12,
  	\`sidebar_show_newsletter\` integer DEFAULT false,
  	\`sidebar_newsletter_heading\` text DEFAULT 'Stay Inspired',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_settings\`("id", "related_posts_enabled", "related_posts_heading", "related_posts_subtitle", "related_posts_selection_mode", "related_posts_limit", "related_posts_columns", "related_posts_card_variant", "related_posts_show_category", "related_posts_show_excerpt", "related_posts_show_date", "related_posts_show_reading_time", "related_posts_show_view_all", "related_posts_view_all_text", "related_posts_view_all_link", "related_posts_background", "related_posts_padding", "sidebar_show_popular_posts", "sidebar_popular_posts_heading", "sidebar_popular_posts_limit", "sidebar_show_ad_slot", "sidebar_ad_slot_position", "sidebar_show_categories", "sidebar_categories_heading", "sidebar_categories_limit", "sidebar_show_newsletter", "sidebar_newsletter_heading", "updated_at", "created_at") SELECT "id", "related_posts_enabled", "related_posts_heading", "related_posts_subtitle", "related_posts_selection_mode", "related_posts_limit", "related_posts_columns", "related_posts_card_variant", "related_posts_show_category", "related_posts_show_excerpt", "related_posts_show_date", "related_posts_show_reading_time", "related_posts_show_view_all", "related_posts_view_all_text", "related_posts_view_all_link", "related_posts_background", "related_posts_padding", "sidebar_show_popular_posts", "sidebar_popular_posts_heading", "sidebar_popular_posts_limit", "sidebar_show_ad_slot", "sidebar_ad_slot_position", "sidebar_show_categories", "sidebar_categories_heading", "sidebar_categories_limit", "sidebar_show_newsletter", "sidebar_newsletter_heading", "updated_at", "created_at" FROM \`blog_settings\`;`)
  await db.run(sql`DROP TABLE \`blog_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_settings\` RENAME TO \`blog_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`tours_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`accommodations_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`water_activities_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`yachts_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`restaurants_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`venues_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`rentals_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`spa_blocks_newsletter\`;`)
  await db.run(sql`DROP TABLE \`ferry_tickets_blocks_newsletter\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blog_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`related_posts_enabled\` integer DEFAULT true,
  	\`related_posts_heading\` text DEFAULT 'You Might Also Like',
  	\`related_posts_subtitle\` text DEFAULT 'Continue your journey with more insights from our travel editors.',
  	\`related_posts_selection_mode\` text DEFAULT 'same-category',
  	\`related_posts_limit\` numeric DEFAULT 3,
  	\`related_posts_columns\` text DEFAULT '3',
  	\`related_posts_card_variant\` text DEFAULT 'compact',
  	\`related_posts_show_category\` integer DEFAULT true,
  	\`related_posts_show_excerpt\` integer DEFAULT true,
  	\`related_posts_show_date\` integer DEFAULT true,
  	\`related_posts_show_reading_time\` integer DEFAULT false,
  	\`related_posts_show_view_all\` integer DEFAULT true,
  	\`related_posts_view_all_text\` text DEFAULT 'View All Articles',
  	\`related_posts_view_all_link\` text DEFAULT '/blog',
  	\`related_posts_background\` text DEFAULT 'muted',
  	\`related_posts_padding\` text DEFAULT 'md',
  	\`sidebar_show_popular_posts\` integer DEFAULT true,
  	\`sidebar_popular_posts_heading\` text DEFAULT 'Popular Posts',
  	\`sidebar_popular_posts_limit\` numeric DEFAULT 5,
  	\`sidebar_show_ad_slot\` integer DEFAULT true,
  	\`sidebar_ad_slot_position\` text DEFAULT 'between',
  	\`sidebar_show_categories\` integer DEFAULT true,
  	\`sidebar_categories_heading\` text DEFAULT 'Categories',
  	\`sidebar_categories_limit\` numeric DEFAULT 12,
  	\`sidebar_show_newsletter\` integer DEFAULT false,
  	\`sidebar_newsletter_heading\` text DEFAULT 'Stay Inspired',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_settings\`("id", "related_posts_enabled", "related_posts_heading", "related_posts_subtitle", "related_posts_selection_mode", "related_posts_limit", "related_posts_columns", "related_posts_card_variant", "related_posts_show_category", "related_posts_show_excerpt", "related_posts_show_date", "related_posts_show_reading_time", "related_posts_show_view_all", "related_posts_view_all_text", "related_posts_view_all_link", "related_posts_background", "related_posts_padding", "sidebar_show_popular_posts", "sidebar_popular_posts_heading", "sidebar_popular_posts_limit", "sidebar_show_ad_slot", "sidebar_ad_slot_position", "sidebar_show_categories", "sidebar_categories_heading", "sidebar_categories_limit", "sidebar_show_newsletter", "sidebar_newsletter_heading", "updated_at", "created_at") SELECT "id", "related_posts_enabled", "related_posts_heading", "related_posts_subtitle", "related_posts_selection_mode", "related_posts_limit", "related_posts_columns", "related_posts_card_variant", "related_posts_show_category", "related_posts_show_excerpt", "related_posts_show_date", "related_posts_show_reading_time", "related_posts_show_view_all", "related_posts_view_all_text", "related_posts_view_all_link", "related_posts_background", "related_posts_padding", "sidebar_show_popular_posts", "sidebar_popular_posts_heading", "sidebar_popular_posts_limit", "sidebar_show_ad_slot", "sidebar_ad_slot_position", "sidebar_show_categories", "sidebar_categories_heading", "sidebar_categories_limit", "sidebar_show_newsletter", "sidebar_newsletter_heading", "updated_at", "created_at" FROM \`blog_settings\`;`)
  await db.run(sql`DROP TABLE \`blog_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_settings\` RENAME TO \`blog_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
