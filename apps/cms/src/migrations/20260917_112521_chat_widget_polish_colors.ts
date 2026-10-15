import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // Defensive: bersihkan orphan dari attempt migration sebelumnya yg gagal
  // (CREATE TABLE tidak selalu ke-rollback saat step berikutnya error).
  await db.run(sql`DROP TABLE IF EXISTS \`__new_chat_widget\`;`)
  await db.run(sql`CREATE TABLE \`__new_chat_widget\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`display_scope\` text DEFAULT 'all',
  	\`hide_on_mobile\` integer,
  	\`hide_on_desktop\` integer,
  	\`position\` text DEFAULT 'bottomRight',
  	\`offset_x\` numeric DEFAULT 24,
  	\`offset_y\` numeric DEFAULT 24,
  	\`size\` text DEFAULT 'md',
  	\`button_style\` text DEFAULT 'iconOnly',
  	\`button_label\` text DEFAULT 'Chat',
  	\`pulse_animation\` integer DEFAULT false,
  	\`entrance_animation\` text DEFAULT 'fadeUp',
  	\`brand_color\` text,
  	\`brand_color_text\` text,
  	\`chat_background_color\` text,
  	\`chat_border_color\` text,
  	\`user_bubble_color\` text,
  	\`user_bubble_text_color\` text,
  	\`bot_bubble_color\` text,
  	\`bot_bubble_text_color\` text,
  	\`send_button_color\` text,
  	\`send_button_text_color\` text,
  	\`back_button_color\` text,
  	\`back_button_text_color\` text,
  	\`wa_channel_color\` text,
  	\`ai_channel_color\` text,
  	\`live_chat_channel_color\` text,
  	\`email_channel_color\` text,
  	\`popup_title\` text DEFAULT 'Start a Conversation',
  	\`popup_subtitle\` text DEFAULT 'The team typically replies in a few minutes.',
  	\`brand_name\` text,
  	\`header_avatar_id\` integer,
  	\`show_online_badge\` integer,
  	\`show_typing_indicator\` integer,
  	\`enable_business_hours\` integer,
  	\`timezone\` text DEFAULT 'Asia/Makassar',
  	\`offline_behavior\` text DEFAULT 'showAnyway',
  	\`offline_message\` text,
  	\`show_delay_seconds\` numeric DEFAULT 0,
  	\`show_after_scroll_pct\` numeric DEFAULT 0,
  	\`auto_open_once_after\` numeric,
  	\`exit_intent_desktop\` integer,
  	\`dismissible\` integer DEFAULT false,
  	\`dismiss_memory_hours\` numeric DEFAULT 24,
  	\`mobile_fullscreen_sheet\` integer DEFAULT true,
  	\`ga_event_name\` text DEFAULT 'chat_widget_click',
  	\`cloudflare_tracking\` integer DEFAULT true,
  	\`utm_source\` text DEFAULT 'chat_widget',
  	\`utm_medium\` text DEFAULT 'floating',
  	\`utm_campaign\` text,
  	\`require_consent\` integer,
  	\`security_version\` numeric DEFAULT 1,
  	\`block_duration_seconds\` numeric DEFAULT 300,
  	\`verification_provider\` text DEFAULT 'none',
  	\`verification_site_key\` text,
  	\`verification_secret_key_ref\` text,
  	\`verification_min_score\` numeric DEFAULT 0.5,
  	\`verification_mode\` text DEFAULT 'silent',
  	\`send_cooldown_ms\` numeric DEFAULT 1500,
  	\`client_min_interval_ms\` numeric DEFAULT 800,
  	\`min_message_length\` numeric DEFAULT 2,
  	\`max_message_length\` numeric DEFAULT 1000,
  	\`block_duplicate_consecutive\` integer DEFAULT true,
  	\`block_duplicate_window_minutes\` numeric DEFAULT 5,
  	\`enable_honeypot\` integer DEFAULT true,
  	\`enable_timing_check\` integer DEFAULT true,
  	\`min_form_fill_ms\` numeric DEFAULT 1500,
  	\`enable_user_agent_check\` integer DEFAULT true,
  	\`country_mode\` text DEFAULT 'off',
  	\`visitor_cookie_name\` text DEFAULT '__cwvid',
  	\`visitor_cookie_ttl_days\` numeric DEFAULT 90,
  	\`ip_hash_salt_ref\` text DEFAULT 'CHAT_IP_HASH_SALT',
  	\`audit_retention_days\` numeric DEFAULT 30,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`header_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  // FIX (manual): auto-generated migration di-copy 15 kolom baru
  // (brand_color_text, chat_background_color, dst.) di SELECT — padahal
  // source `chat_widget` belum punya kolom-kolom itu (baru di-add di migration
  // ini). Hapus dari INSERT/SELECT column list → default NULL di target,
  // admin bisa isi belakangan lewat CMS.
  await db.run(sql`INSERT INTO \`__new_chat_widget\`("id", "enabled", "display_scope", "hide_on_mobile", "hide_on_desktop", "position", "offset_x", "offset_y", "size", "button_style", "button_label", "pulse_animation", "entrance_animation", "brand_color", "popup_title", "popup_subtitle", "brand_name", "header_avatar_id", "show_online_badge", "show_typing_indicator", "enable_business_hours", "timezone", "offline_behavior", "offline_message", "show_delay_seconds", "show_after_scroll_pct", "auto_open_once_after", "exit_intent_desktop", "dismissible", "dismiss_memory_hours", "mobile_fullscreen_sheet", "ga_event_name", "cloudflare_tracking", "utm_source", "utm_medium", "utm_campaign", "require_consent", "security_version", "block_duration_seconds", "verification_provider", "verification_site_key", "verification_secret_key_ref", "verification_min_score", "verification_mode", "send_cooldown_ms", "client_min_interval_ms", "min_message_length", "max_message_length", "block_duplicate_consecutive", "block_duplicate_window_minutes", "enable_honeypot", "enable_timing_check", "min_form_fill_ms", "enable_user_agent_check", "country_mode", "visitor_cookie_name", "visitor_cookie_ttl_days", "ip_hash_salt_ref", "audit_retention_days", "updated_at", "created_at") SELECT "id", "enabled", "display_scope", "hide_on_mobile", "hide_on_desktop", "position", "offset_x", "offset_y", "size", "button_style", "button_label", "pulse_animation", "entrance_animation", "brand_color", "popup_title", "popup_subtitle", "brand_name", "header_avatar_id", "show_online_badge", "show_typing_indicator", "enable_business_hours", "timezone", "offline_behavior", "offline_message", "show_delay_seconds", "show_after_scroll_pct", "auto_open_once_after", "exit_intent_desktop", "dismissible", "dismiss_memory_hours", "mobile_fullscreen_sheet", "ga_event_name", "cloudflare_tracking", "utm_source", "utm_medium", "utm_campaign", "require_consent", "security_version", "block_duration_seconds", "verification_provider", "verification_site_key", "verification_secret_key_ref", "verification_min_score", "verification_mode", "send_cooldown_ms", "client_min_interval_ms", "min_message_length", "max_message_length", "block_duplicate_consecutive", "block_duplicate_window_minutes", "enable_honeypot", "enable_timing_check", "min_form_fill_ms", "enable_user_agent_check", "country_mode", "visitor_cookie_name", "visitor_cookie_ttl_days", "ip_hash_salt_ref", "audit_retention_days", "updated_at", "created_at" FROM \`chat_widget\`;`)
  await db.run(sql`DROP TABLE \`chat_widget\`;`)
  await db.run(sql`ALTER TABLE \`__new_chat_widget\` RENAME TO \`chat_widget\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`chat_widget_header_avatar_idx\` ON \`chat_widget\` (\`header_avatar_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_chat_widget\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`display_scope\` text DEFAULT 'all',
  	\`hide_on_mobile\` integer,
  	\`hide_on_desktop\` integer,
  	\`position\` text DEFAULT 'bottomRight',
  	\`offset_x\` numeric DEFAULT 24,
  	\`offset_y\` numeric DEFAULT 24,
  	\`button_style\` text DEFAULT 'iconOnly',
  	\`button_label\` text DEFAULT 'Chat',
  	\`brand_color\` text DEFAULT '#25D366',
  	\`size\` text DEFAULT 'md',
  	\`pulse_animation\` integer DEFAULT false,
  	\`entrance_animation\` text DEFAULT 'fadeUp',
  	\`popup_title\` text DEFAULT 'Start a Conversation',
  	\`popup_subtitle\` text DEFAULT 'The team typically replies in a few minutes.',
  	\`brand_name\` text,
  	\`header_avatar_id\` integer,
  	\`show_online_badge\` integer,
  	\`show_typing_indicator\` integer,
  	\`enable_business_hours\` integer,
  	\`timezone\` text DEFAULT 'Asia/Makassar',
  	\`offline_behavior\` text DEFAULT 'showAnyway',
  	\`offline_message\` text,
  	\`show_delay_seconds\` numeric DEFAULT 0,
  	\`show_after_scroll_pct\` numeric DEFAULT 0,
  	\`auto_open_once_after\` numeric,
  	\`exit_intent_desktop\` integer,
  	\`dismissible\` integer DEFAULT false,
  	\`dismiss_memory_hours\` numeric DEFAULT 24,
  	\`mobile_fullscreen_sheet\` integer DEFAULT true,
  	\`ga_event_name\` text DEFAULT 'chat_widget_click',
  	\`cloudflare_tracking\` integer DEFAULT true,
  	\`utm_source\` text DEFAULT 'chat_widget',
  	\`utm_medium\` text DEFAULT 'floating',
  	\`utm_campaign\` text,
  	\`require_consent\` integer,
  	\`security_version\` numeric DEFAULT 1,
  	\`block_duration_seconds\` numeric DEFAULT 300,
  	\`verification_provider\` text DEFAULT 'none',
  	\`verification_site_key\` text,
  	\`verification_secret_key_ref\` text,
  	\`verification_min_score\` numeric DEFAULT 0.5,
  	\`verification_mode\` text DEFAULT 'silent',
  	\`send_cooldown_ms\` numeric DEFAULT 1500,
  	\`client_min_interval_ms\` numeric DEFAULT 800,
  	\`min_message_length\` numeric DEFAULT 2,
  	\`max_message_length\` numeric DEFAULT 1000,
  	\`block_duplicate_consecutive\` integer DEFAULT true,
  	\`block_duplicate_window_minutes\` numeric DEFAULT 5,
  	\`enable_honeypot\` integer DEFAULT true,
  	\`enable_timing_check\` integer DEFAULT true,
  	\`min_form_fill_ms\` numeric DEFAULT 1500,
  	\`enable_user_agent_check\` integer DEFAULT true,
  	\`country_mode\` text DEFAULT 'off',
  	\`visitor_cookie_name\` text DEFAULT '__cwvid',
  	\`visitor_cookie_ttl_days\` numeric DEFAULT 90,
  	\`ip_hash_salt_ref\` text DEFAULT 'CHAT_IP_HASH_SALT',
  	\`audit_retention_days\` numeric DEFAULT 30,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`header_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_chat_widget\`("id", "enabled", "display_scope", "hide_on_mobile", "hide_on_desktop", "position", "offset_x", "offset_y", "button_style", "button_label", "brand_color", "size", "pulse_animation", "entrance_animation", "popup_title", "popup_subtitle", "brand_name", "header_avatar_id", "show_online_badge", "show_typing_indicator", "enable_business_hours", "timezone", "offline_behavior", "offline_message", "show_delay_seconds", "show_after_scroll_pct", "auto_open_once_after", "exit_intent_desktop", "dismissible", "dismiss_memory_hours", "mobile_fullscreen_sheet", "ga_event_name", "cloudflare_tracking", "utm_source", "utm_medium", "utm_campaign", "require_consent", "security_version", "block_duration_seconds", "verification_provider", "verification_site_key", "verification_secret_key_ref", "verification_min_score", "verification_mode", "send_cooldown_ms", "client_min_interval_ms", "min_message_length", "max_message_length", "block_duplicate_consecutive", "block_duplicate_window_minutes", "enable_honeypot", "enable_timing_check", "min_form_fill_ms", "enable_user_agent_check", "country_mode", "visitor_cookie_name", "visitor_cookie_ttl_days", "ip_hash_salt_ref", "audit_retention_days", "updated_at", "created_at") SELECT "id", "enabled", "display_scope", "hide_on_mobile", "hide_on_desktop", "position", "offset_x", "offset_y", "button_style", "button_label", "brand_color", "size", "pulse_animation", "entrance_animation", "popup_title", "popup_subtitle", "brand_name", "header_avatar_id", "show_online_badge", "show_typing_indicator", "enable_business_hours", "timezone", "offline_behavior", "offline_message", "show_delay_seconds", "show_after_scroll_pct", "auto_open_once_after", "exit_intent_desktop", "dismissible", "dismiss_memory_hours", "mobile_fullscreen_sheet", "ga_event_name", "cloudflare_tracking", "utm_source", "utm_medium", "utm_campaign", "require_consent", "security_version", "block_duration_seconds", "verification_provider", "verification_site_key", "verification_secret_key_ref", "verification_min_score", "verification_mode", "send_cooldown_ms", "client_min_interval_ms", "min_message_length", "max_message_length", "block_duplicate_consecutive", "block_duplicate_window_minutes", "enable_honeypot", "enable_timing_check", "min_form_fill_ms", "enable_user_agent_check", "country_mode", "visitor_cookie_name", "visitor_cookie_ttl_days", "ip_hash_salt_ref", "audit_retention_days", "updated_at", "created_at" FROM \`chat_widget\`;`)
  await db.run(sql`DROP TABLE \`chat_widget\`;`)
  await db.run(sql`ALTER TABLE \`__new_chat_widget\` RENAME TO \`chat_widget\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`chat_widget_header_avatar_idx\` ON \`chat_widget\` (\`header_avatar_id\`);`)
}
