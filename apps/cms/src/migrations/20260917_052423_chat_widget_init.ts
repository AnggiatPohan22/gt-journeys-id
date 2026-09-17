import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`chat_visitors\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`visitor_id\` text NOT NULL,
  	\`ip_hash\` text,
  	\`user_agent_hash\` text,
  	\`country\` text,
  	\`status\` text DEFAULT 'active' NOT NULL,
  	\`blocked_until\` text,
  	\`block_reason\` text,
  	\`message_count\` numeric DEFAULT 0,
  	\`first_seen_at\` text,
  	\`last_seen_at\` text,
  	\`context\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`chat_visitors_visitor_id_idx\` ON \`chat_visitors\` (\`visitor_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_visitors_ip_hash_idx\` ON \`chat_visitors\` (\`ip_hash\`);`)
  await db.run(sql`CREATE INDEX \`chat_visitors_status_idx\` ON \`chat_visitors\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`chat_visitors_last_seen_at_idx\` ON \`chat_visitors\` (\`last_seen_at\`);`)
  await db.run(sql`CREATE INDEX \`chat_visitors_updated_at_idx\` ON \`chat_visitors\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`chat_visitors_created_at_idx\` ON \`chat_visitors\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`chat_messages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`visitor_id\` integer,
  	\`session_id\` text,
  	\`channel_type\` text NOT NULL,
  	\`direction\` text NOT NULL,
  	\`content_hash\` text,
  	\`content_length\` numeric,
  	\`content\` text,
  	\`was_blocked\` integer DEFAULT false,
  	\`block_reason\` text,
  	\`spam_score\` numeric,
  	\`verification_provider\` text,
  	\`verification_score\` numeric,
  	\`ip_hash\` text,
  	\`context\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`visitor_id\`) REFERENCES \`chat_visitors\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_messages_visitor_idx\` ON \`chat_messages\` (\`visitor_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_session_id_idx\` ON \`chat_messages\` (\`session_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_channel_type_idx\` ON \`chat_messages\` (\`channel_type\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_content_hash_idx\` ON \`chat_messages\` (\`content_hash\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_was_blocked_idx\` ON \`chat_messages\` (\`was_blocked\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_ip_hash_idx\` ON \`chat_messages\` (\`ip_hash\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_updated_at_idx\` ON \`chat_messages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_created_at_idx\` ON \`chat_messages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`chat_blocked_events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`visitor_id\` integer,
  	\`session_id\` text,
  	\`message_id\` integer,
  	\`layer\` text NOT NULL,
  	\`rule_triggered\` text NOT NULL,
  	\`action\` text NOT NULL,
  	\`ip_hash\` text,
  	\`country\` text,
  	\`user_agent\` text,
  	\`context\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`visitor_id\`) REFERENCES \`chat_visitors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`message_id\`) REFERENCES \`chat_messages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_visitor_idx\` ON \`chat_blocked_events\` (\`visitor_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_session_id_idx\` ON \`chat_blocked_events\` (\`session_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_message_idx\` ON \`chat_blocked_events\` (\`message_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_layer_idx\` ON \`chat_blocked_events\` (\`layer\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_rule_triggered_idx\` ON \`chat_blocked_events\` (\`rule_triggered\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_ip_hash_idx\` ON \`chat_blocked_events\` (\`ip_hash\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_updated_at_idx\` ON \`chat_blocked_events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`chat_blocked_events_created_at_idx\` ON \`chat_blocked_events\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocks_whatsapp_channel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	\`agent_name\` text,
  	\`agent_avatar_id\` integer,
  	\`icon_override\` text DEFAULT 'default',
  	\`brand_color_override\` text,
  	\`whatsapp_number\` text,
  	\`prefilled_message\` text,
  	\`append_utm\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`agent_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_whatsapp_channel_order_idx\` ON \`chat_widget_blocks_whatsapp_channel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_whatsapp_channel_parent_id_idx\` ON \`chat_widget_blocks_whatsapp_channel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_whatsapp_channel_path_idx\` ON \`chat_widget_blocks_whatsapp_channel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_whatsapp_channel_agent_avatar_idx\` ON \`chat_widget_blocks_whatsapp_channel\` (\`agent_avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocks_ai_chatbot_channel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	\`agent_name\` text,
  	\`agent_avatar_id\` integer,
  	\`icon_override\` text DEFAULT 'default',
  	\`brand_color_override\` text,
  	\`provider\` text DEFAULT 'anthropic',
  	\`model\` text,
  	\`endpoint_url\` text,
  	\`system_prompt\` text,
  	\`welcome_message\` text,
  	\`streaming\` integer DEFAULT true,
  	\`api_key_ref\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`agent_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_ai_chatbot_channel_order_idx\` ON \`chat_widget_blocks_ai_chatbot_channel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_ai_chatbot_channel_parent_id_idx\` ON \`chat_widget_blocks_ai_chatbot_channel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_ai_chatbot_channel_path_idx\` ON \`chat_widget_blocks_ai_chatbot_channel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_ai_chatbot_channel_agent_avatar_idx\` ON \`chat_widget_blocks_ai_chatbot_channel\` (\`agent_avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocks_live_chat_channel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	\`agent_name\` text,
  	\`agent_avatar_id\` integer,
  	\`icon_override\` text DEFAULT 'default',
  	\`brand_color_override\` text,
  	\`provider\` text DEFAULT 'crisp',
  	\`site_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`agent_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_live_chat_channel_order_idx\` ON \`chat_widget_blocks_live_chat_channel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_live_chat_channel_parent_id_idx\` ON \`chat_widget_blocks_live_chat_channel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_live_chat_channel_path_idx\` ON \`chat_widget_blocks_live_chat_channel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_live_chat_channel_agent_avatar_idx\` ON \`chat_widget_blocks_live_chat_channel\` (\`agent_avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocks_email_channel\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`label\` text NOT NULL,
  	\`subtitle\` text,
  	\`agent_name\` text,
  	\`agent_avatar_id\` integer,
  	\`icon_override\` text DEFAULT 'default',
  	\`brand_color_override\` text,
  	\`to_address\` text NOT NULL,
  	\`default_subject\` text,
  	\`default_body\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`agent_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_email_channel_order_idx\` ON \`chat_widget_blocks_email_channel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_email_channel_parent_id_idx\` ON \`chat_widget_blocks_email_channel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_email_channel_path_idx\` ON \`chat_widget_blocks_email_channel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocks_email_channel_agent_avatar_idx\` ON \`chat_widget_blocks_email_channel\` (\`agent_avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`day\` text,
  	\`closed\` integer,
  	\`open\` text,
  	\`close\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_hours_order_idx\` ON \`chat_widget_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_hours_parent_id_idx\` ON \`chat_widget_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_enabled_layers\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_enabled_layers_order_idx\` ON \`chat_widget_enabled_layers\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_enabled_layers_parent_idx\` ON \`chat_widget_enabled_layers\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_rate_limit_rules\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`limit_count\` numeric DEFAULT 5 NOT NULL,
  	\`window_seconds\` numeric DEFAULT 60 NOT NULL,
  	\`key_by\` text DEFAULT 'ip' NOT NULL,
  	\`scope\` text DEFAULT 'global',
  	\`action\` text DEFAULT 'block',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_rate_limit_rules_order_idx\` ON \`chat_widget_rate_limit_rules\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_rate_limit_rules_parent_id_idx\` ON \`chat_widget_rate_limit_rules\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_verification_channels\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_verification_channels_order_idx\` ON \`chat_widget_verification_channels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_verification_channels_parent_idx\` ON \`chat_widget_verification_channels\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocked_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocked_keywords_order_idx\` ON \`chat_widget_blocked_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocked_keywords_parent_id_idx\` ON \`chat_widget_blocked_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocked_patterns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`pattern\` text NOT NULL,
  	\`flags\` text DEFAULT 'i',
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocked_patterns_order_idx\` ON \`chat_widget_blocked_patterns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocked_patterns_parent_id_idx\` ON \`chat_widget_blocked_patterns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_custom_blocked_user_agents\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`pattern\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_custom_blocked_user_agents_order_idx\` ON \`chat_widget_custom_blocked_user_agents\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_custom_blocked_user_agents_parent_id_idx\` ON \`chat_widget_custom_blocked_user_agents\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_blocked_ips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_blocked_ips_order_idx\` ON \`chat_widget_blocked_ips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_blocked_ips_parent_id_idx\` ON \`chat_widget_blocked_ips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_country_codes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_country_codes_order_idx\` ON \`chat_widget_country_codes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_country_codes_parent_id_idx\` ON \`chat_widget_country_codes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget\` (
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
  await db.run(sql`CREATE INDEX \`chat_widget_header_avatar_idx\` ON \`chat_widget\` (\`header_avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_widget_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`chat_widget\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_widget_rels_order_idx\` ON \`chat_widget_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_rels_parent_idx\` ON \`chat_widget_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_rels_path_idx\` ON \`chat_widget_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`chat_widget_rels_pages_id_idx\` ON \`chat_widget_rels\` (\`pages_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_footer_settings_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`column_label\` text NOT NULL,
  	\`menu_id\` integer NOT NULL,
  	FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_footer_settings_columns\`("_order", "_parent_id", "id", "column_label", "menu_id") SELECT "_order", "_parent_id", "id", "column_label", "menu_id" FROM \`footer_settings_columns\`;`)
  await db.run(sql`DROP TABLE \`footer_settings_columns\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer_settings_columns\` RENAME TO \`footer_settings_columns\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_order_idx\` ON \`footer_settings_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_parent_id_idx\` ON \`footer_settings_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_menu_idx\` ON \`footer_settings_columns\` (\`menu_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`chat_visitors_id\` integer REFERENCES chat_visitors(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`chat_messages_id\` integer REFERENCES chat_messages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`chat_blocked_events_id\` integer REFERENCES chat_blocked_events(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_visitors_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_visitors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_blocked_events_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_blocked_events_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`chat_visitors\`;`)
  await db.run(sql`DROP TABLE \`chat_messages\`;`)
  await db.run(sql`DROP TABLE \`chat_blocked_events\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocks_whatsapp_channel\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocks_ai_chatbot_channel\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocks_live_chat_channel\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocks_email_channel\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_hours\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_enabled_layers\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_rate_limit_rules\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_verification_channels\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocked_keywords\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocked_patterns\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_custom_blocked_user_agents\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_blocked_ips\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_country_codes\`;`)
  await db.run(sql`DROP TABLE \`chat_widget\`;`)
  await db.run(sql`DROP TABLE \`chat_widget_rels\`;`)
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
  	FOREIGN KEY (\`newsletter_subscribers_id\`) REFERENCES \`newsletter_subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "posts_id", "blog_categories_id", "tags_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id") SELECT "id", "order", "parent_id", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "authors_id", "posts_id", "blog_categories_id", "tags_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "ferry_tickets_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id" FROM \`payload_locked_documents_rels\`;`)
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
  await db.run(sql`CREATE TABLE \`__new_footer_settings_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`column_label\` text,
  	\`menu_id\` integer,
  	FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_footer_settings_columns\`("_order", "_parent_id", "id", "column_label", "menu_id") SELECT "_order", "_parent_id", "id", "column_label", "menu_id" FROM \`footer_settings_columns\`;`)
  await db.run(sql`DROP TABLE \`footer_settings_columns\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer_settings_columns\` RENAME TO \`footer_settings_columns\`;`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_order_idx\` ON \`footer_settings_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_parent_id_idx\` ON \`footer_settings_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_columns_menu_idx\` ON \`footer_settings_columns\` (\`menu_id\`);`)
}
