import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── Phase 4.68 — Quick Access per role (super) field ───────────────────
  // IF NOT EXISTS: migration bisa di-rerun kalau sebelumnya gagal di tengah
  // (mis. drift bookings.access_token dari 4.66.5 yang terbawa ke generator
  // sebelum 4.66.5 di-apply — lihat phase report 4.68 untuk konteks).
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`site_features_dashboard_widgets_quick_access_super\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`site_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`site_features_dashboard_widgets_quick_access_super_order_idx\` ON \`site_features_dashboard_widgets_quick_access_super\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`site_features_dashboard_widgets_quick_access_super_parent_idx\` ON \`site_features_dashboard_widgets_quick_access_super\` (\`parent_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'GtJourneysID' NOT NULL,
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
  	\`error_pages_property_coming_soon_whatsapp_message\` text DEFAULT 'Halo GtJourneysID! 👋
  
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
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "tagline", "logo_id", "logo_dark_id", "favicon_id", "contact_email", "contact_phone", "contact_whatsapp", "contact_address", "contact_map_embed", "whatsapp_defaults_default_number", "whatsapp_defaults_greeting_message", "whatsapp_defaults_business_hours", "social_media_instagram", "social_media_facebook", "social_media_tiktok", "social_media_youtube", "social_media_tripadvisor", "default_seo_meta_title", "default_seo_meta_description", "default_seo_og_image_id", "default_seo_google_analytics_id", "default_seo_cloudflare_web_analytics_token", "layout_block_gap", "layout_before_footer", "layout_block_padding_top_mobile", "layout_block_padding_top_desktop", "layout_block_padding_bottom_mobile", "layout_block_padding_bottom_desktop", "section_pages_listing_title", "section_pages_listing_subtitle", "related_services_enabled", "related_services_section_title", "related_services_card_style", "related_services_max_items", "related_services_selection_mode", "related_services_show_explore_all", "error_pages_not_found_title", "error_pages_not_found_message", "error_pages_not_found_button_text", "error_pages_property_coming_soon_eyebrow", "error_pages_property_coming_soon_title", "error_pages_property_coming_soon_description", "error_pages_property_coming_soon_whatsapp_message", "error_pages_property_coming_soon_primary_button_text", "error_pages_property_coming_soon_secondary_button_text", "footer_copyright_text", "footer_additional_scripts", "updated_at", "created_at") SELECT "id", "site_name", "tagline", "logo_id", "logo_dark_id", "favicon_id", "contact_email", "contact_phone", "contact_whatsapp", "contact_address", "contact_map_embed", "whatsapp_defaults_default_number", "whatsapp_defaults_greeting_message", "whatsapp_defaults_business_hours", "social_media_instagram", "social_media_facebook", "social_media_tiktok", "social_media_youtube", "social_media_tripadvisor", "default_seo_meta_title", "default_seo_meta_description", "default_seo_og_image_id", "default_seo_google_analytics_id", "default_seo_cloudflare_web_analytics_token", "layout_block_gap", "layout_before_footer", "layout_block_padding_top_mobile", "layout_block_padding_top_desktop", "layout_block_padding_bottom_mobile", "layout_block_padding_bottom_desktop", "section_pages_listing_title", "section_pages_listing_subtitle", "related_services_enabled", "related_services_section_title", "related_services_card_style", "related_services_max_items", "related_services_selection_mode", "related_services_show_explore_all", "error_pages_not_found_title", "error_pages_not_found_message", "error_pages_not_found_button_text", "error_pages_property_coming_soon_eyebrow", "error_pages_property_coming_soon_title", "error_pages_property_coming_soon_description", "error_pages_property_coming_soon_whatsapp_message", "error_pages_property_coming_soon_primary_button_text", "error_pages_property_coming_soon_secondary_button_text", "footer_copyright_text", "footer_additional_scripts", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_dark_idx\` ON \`site_settings\` (\`logo_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_default_seo_og_image_idx\` ON \`site_settings\` (\`default_seo_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_popup_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`default_title\` text DEFAULT 'Confirm',
  	\`confirm_label\` text DEFAULT 'Continue',
  	\`cancel_label\` text DEFAULT 'Cancel',
  	\`show_close_button\` integer DEFAULT true,
  	\`show_icon\` integer DEFAULT true,
  	\`icon_name\` text DEFAULT 'help',
  	\`size\` text DEFAULT 'md',
  	\`radius\` text DEFAULT '2xl',
  	\`backdrop\` text DEFAULT 'blur',
  	\`bg_color\` text,
  	\`title_color\` text,
  	\`text_color\` text,
  	\`icon_color\` text,
  	\`confirm_bg\` text,
  	\`confirm_text\` text,
  	\`cancel_bg\` text,
  	\`cancel_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_popup_settings\`("id", "enabled", "default_title", "confirm_label", "cancel_label", "show_close_button", "show_icon", "icon_name", "size", "radius", "backdrop", "bg_color", "title_color", "text_color", "icon_color", "confirm_bg", "confirm_text", "cancel_bg", "cancel_text", "updated_at", "created_at") SELECT "id", "enabled", "default_title", "confirm_label", "cancel_label", "show_close_button", "show_icon", "icon_name", "size", "radius", "backdrop", "bg_color", "title_color", "text_color", "icon_color", "confirm_bg", "confirm_text", "cancel_bg", "cancel_text", "updated_at", "created_at" FROM \`popup_settings\`;`)
  await db.run(sql`DROP TABLE \`popup_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_popup_settings\` RENAME TO \`popup_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  // NOTE: `bookings.access_token` + unique index SENGAJA tidak di-touch di
  // migration ini — sudah ditangani migration 4.66.5
  // (`20260930_231200_phase_4_66_5_booking_access_token`). Generator diff
  // sempat ikut menambahkannya karena 4.68 di-generate sebelum 4.66.5 apply.
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`site_features_dashboard_widgets_quick_access_super\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_popup_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`default_title\` text DEFAULT 'Konfirmasi',
  	\`confirm_label\` text DEFAULT 'Lanjutkan',
  	\`cancel_label\` text DEFAULT 'Batal',
  	\`show_close_button\` integer DEFAULT true,
  	\`show_icon\` integer DEFAULT true,
  	\`icon_name\` text DEFAULT 'help',
  	\`size\` text DEFAULT 'md',
  	\`radius\` text DEFAULT '2xl',
  	\`backdrop\` text DEFAULT 'blur',
  	\`bg_color\` text,
  	\`title_color\` text,
  	\`text_color\` text,
  	\`icon_color\` text,
  	\`confirm_bg\` text,
  	\`confirm_text\` text,
  	\`cancel_bg\` text,
  	\`cancel_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_popup_settings\`("id", "enabled", "default_title", "confirm_label", "cancel_label", "show_close_button", "show_icon", "icon_name", "size", "radius", "backdrop", "bg_color", "title_color", "text_color", "icon_color", "confirm_bg", "confirm_text", "cancel_bg", "cancel_text", "updated_at", "created_at") SELECT "id", "enabled", "default_title", "confirm_label", "cancel_label", "show_close_button", "show_icon", "icon_name", "size", "radius", "backdrop", "bg_color", "title_color", "text_color", "icon_color", "confirm_bg", "confirm_text", "cancel_bg", "cancel_text", "updated_at", "created_at" FROM \`popup_settings\`;`)
  await db.run(sql`DROP TABLE \`popup_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_popup_settings\` RENAME TO \`popup_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
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
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "tagline", "logo_id", "logo_dark_id", "favicon_id", "contact_email", "contact_phone", "contact_whatsapp", "contact_address", "contact_map_embed", "whatsapp_defaults_default_number", "whatsapp_defaults_greeting_message", "whatsapp_defaults_business_hours", "social_media_instagram", "social_media_facebook", "social_media_tiktok", "social_media_youtube", "social_media_tripadvisor", "default_seo_meta_title", "default_seo_meta_description", "default_seo_og_image_id", "default_seo_google_analytics_id", "default_seo_cloudflare_web_analytics_token", "layout_block_gap", "layout_before_footer", "layout_block_padding_top_mobile", "layout_block_padding_top_desktop", "layout_block_padding_bottom_mobile", "layout_block_padding_bottom_desktop", "section_pages_listing_title", "section_pages_listing_subtitle", "related_services_enabled", "related_services_section_title", "related_services_card_style", "related_services_max_items", "related_services_selection_mode", "related_services_show_explore_all", "error_pages_not_found_title", "error_pages_not_found_message", "error_pages_not_found_button_text", "error_pages_property_coming_soon_eyebrow", "error_pages_property_coming_soon_title", "error_pages_property_coming_soon_description", "error_pages_property_coming_soon_whatsapp_message", "error_pages_property_coming_soon_primary_button_text", "error_pages_property_coming_soon_secondary_button_text", "footer_copyright_text", "footer_additional_scripts", "updated_at", "created_at") SELECT "id", "site_name", "tagline", "logo_id", "logo_dark_id", "favicon_id", "contact_email", "contact_phone", "contact_whatsapp", "contact_address", "contact_map_embed", "whatsapp_defaults_default_number", "whatsapp_defaults_greeting_message", "whatsapp_defaults_business_hours", "social_media_instagram", "social_media_facebook", "social_media_tiktok", "social_media_youtube", "social_media_tripadvisor", "default_seo_meta_title", "default_seo_meta_description", "default_seo_og_image_id", "default_seo_google_analytics_id", "default_seo_cloudflare_web_analytics_token", "layout_block_gap", "layout_before_footer", "layout_block_padding_top_mobile", "layout_block_padding_top_desktop", "layout_block_padding_bottom_mobile", "layout_block_padding_bottom_desktop", "section_pages_listing_title", "section_pages_listing_subtitle", "related_services_enabled", "related_services_section_title", "related_services_card_style", "related_services_max_items", "related_services_selection_mode", "related_services_show_explore_all", "error_pages_not_found_title", "error_pages_not_found_message", "error_pages_not_found_button_text", "error_pages_property_coming_soon_eyebrow", "error_pages_property_coming_soon_title", "error_pages_property_coming_soon_description", "error_pages_property_coming_soon_whatsapp_message", "error_pages_property_coming_soon_primary_button_text", "error_pages_property_coming_soon_secondary_button_text", "footer_copyright_text", "footer_additional_scripts", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_dark_idx\` ON \`site_settings\` (\`logo_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_default_seo_og_image_idx\` ON \`site_settings\` (\`default_seo_og_image_id\`);`)
}
