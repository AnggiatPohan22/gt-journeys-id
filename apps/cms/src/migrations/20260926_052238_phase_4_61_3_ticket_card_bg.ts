import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_tours_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_tours_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_tours_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_accommodations_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_accommodations_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_accommodations_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_water_activities_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_water_activities_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_water_activities_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_yacht_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_yacht_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_yacht_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_restaurants_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_restaurants_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_restaurants_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_weddings_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_weddings_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_weddings_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_rentals_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_rentals_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_rentals_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_spa_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_spa_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_spa_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_ferry_tickets_ticket_bg_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_ferry_tickets_ticket_bg_opacity\` numeric DEFAULT 8;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_ferry_tickets_ticket_bg_position\` text DEFAULT 'right';`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_tours_ticket_bg_idx\` ON \`site_features\` (\`modules_tours_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_accommodations_ticket_bg_idx\` ON \`site_features\` (\`modules_accommodations_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_water_activities_ticket_bg_idx\` ON \`site_features\` (\`modules_water_activities_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_yacht_ticket_bg_idx\` ON \`site_features\` (\`modules_yacht_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_restaurants_ticket_bg_idx\` ON \`site_features\` (\`modules_restaurants_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_weddings_ticket_bg_idx\` ON \`site_features\` (\`modules_weddings_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_rentals_ticket_bg_idx\` ON \`site_features\` (\`modules_rentals_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_spa_ticket_bg_idx\` ON \`site_features\` (\`modules_spa_ticket_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_features_modules_modules_ferry_tickets_ticket_bg_idx\` ON \`site_features\` (\`modules_ferry_tickets_ticket_bg_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_features\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`modules_tours\` integer DEFAULT true,
  	\`modules_tours_design\` text DEFAULT 'compact',
  	\`modules_accommodations\` integer DEFAULT true,
  	\`modules_accommodations_design\` text DEFAULT 'compact',
  	\`modules_water_activities\` integer DEFAULT true,
  	\`modules_water_activities_design\` text DEFAULT 'compact',
  	\`modules_yacht\` integer DEFAULT true,
  	\`modules_yacht_design\` text DEFAULT 'compact',
  	\`modules_restaurants\` integer DEFAULT true,
  	\`modules_restaurants_design\` text DEFAULT 'compact',
  	\`modules_weddings\` integer DEFAULT true,
  	\`modules_weddings_design\` text DEFAULT 'compact',
  	\`modules_rentals\` integer DEFAULT true,
  	\`modules_rentals_design\` text DEFAULT 'compact',
  	\`modules_spa\` integer DEFAULT true,
  	\`modules_spa_design\` text DEFAULT 'compact',
  	\`modules_ferry_tickets\` integer DEFAULT true,
  	\`modules_ferry_tickets_design\` text DEFAULT 'ticket',
  	\`sections_testimonials\` integer DEFAULT true,
  	\`sections_faq\` integer DEFAULT true,
  	\`sections_promo_banner\` integer DEFAULT false,
  	\`sections_newsletter\` integer DEFAULT false,
  	\`destinations_hierarchical_filter\` integer DEFAULT false,
  	\`destinations_destination_types_enabled\` integer DEFAULT true,
  	\`blog_enabled\` integer DEFAULT true,
  	\`blog_enable_ads\` integer DEFAULT false,
  	\`dashboard_widgets_header_title\` text,
  	\`dashboard_widgets_header_subtitle\` text,
  	\`dashboard_widgets_at_a_glance_title\` text,
  	\`dashboard_widgets_at_a_glance_enabled\` integer DEFAULT true,
  	\`dashboard_widgets_at_a_glance_clickable\` integer DEFAULT true,
  	\`dashboard_widgets_recent_activity_title\` text,
  	\`dashboard_widgets_recent_activity_enabled\` integer DEFAULT true,
  	\`dashboard_widgets_recent_activity_limit\` numeric DEFAULT 10,
  	\`dashboard_widgets_quick_access_title\` text,
  	\`dashboard_widgets_system_health_title\` text,
  	\`dashboard_widgets_smart_insight_title\` text,
  	\`dashboard_widgets_smart_insight_seo\` integer DEFAULT true,
  	\`dashboard_widgets_smart_insight_image_tag\` integer DEFAULT false,
  	\`dashboard_widgets_analytics_card_title\` text,
  	\`dashboard_widgets_top_performing_title\` text,
  	\`dashboard_widgets_top_performing_views\` integer DEFAULT true,
  	\`dashboard_widgets_top_performing_inquiries\` integer DEFAULT true,
  	\`dashboard_widgets_analytics_provider\` text DEFAULT 'none',
  	\`features_whatsapp_float\` integer DEFAULT true,
  	\`features_announcement_bar\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_features\`("id", "modules_tours", "modules_tours_design", "modules_accommodations", "modules_accommodations_design", "modules_water_activities", "modules_water_activities_design", "modules_yacht", "modules_yacht_design", "modules_restaurants", "modules_restaurants_design", "modules_weddings", "modules_weddings_design", "modules_rentals", "modules_rentals_design", "modules_spa", "modules_spa_design", "modules_ferry_tickets", "modules_ferry_tickets_design", "sections_testimonials", "sections_faq", "sections_promo_banner", "sections_newsletter", "destinations_hierarchical_filter", "destinations_destination_types_enabled", "blog_enabled", "blog_enable_ads", "dashboard_widgets_header_title", "dashboard_widgets_header_subtitle", "dashboard_widgets_at_a_glance_title", "dashboard_widgets_at_a_glance_enabled", "dashboard_widgets_at_a_glance_clickable", "dashboard_widgets_recent_activity_title", "dashboard_widgets_recent_activity_enabled", "dashboard_widgets_recent_activity_limit", "dashboard_widgets_quick_access_title", "dashboard_widgets_system_health_title", "dashboard_widgets_smart_insight_title", "dashboard_widgets_smart_insight_seo", "dashboard_widgets_smart_insight_image_tag", "dashboard_widgets_analytics_card_title", "dashboard_widgets_top_performing_title", "dashboard_widgets_top_performing_views", "dashboard_widgets_top_performing_inquiries", "dashboard_widgets_analytics_provider", "features_whatsapp_float", "features_announcement_bar", "updated_at", "created_at") SELECT "id", "modules_tours", "modules_tours_design", "modules_accommodations", "modules_accommodations_design", "modules_water_activities", "modules_water_activities_design", "modules_yacht", "modules_yacht_design", "modules_restaurants", "modules_restaurants_design", "modules_weddings", "modules_weddings_design", "modules_rentals", "modules_rentals_design", "modules_spa", "modules_spa_design", "modules_ferry_tickets", "modules_ferry_tickets_design", "sections_testimonials", "sections_faq", "sections_promo_banner", "sections_newsletter", "destinations_hierarchical_filter", "destinations_destination_types_enabled", "blog_enabled", "blog_enable_ads", "dashboard_widgets_header_title", "dashboard_widgets_header_subtitle", "dashboard_widgets_at_a_glance_title", "dashboard_widgets_at_a_glance_enabled", "dashboard_widgets_at_a_glance_clickable", "dashboard_widgets_recent_activity_title", "dashboard_widgets_recent_activity_enabled", "dashboard_widgets_recent_activity_limit", "dashboard_widgets_quick_access_title", "dashboard_widgets_system_health_title", "dashboard_widgets_smart_insight_title", "dashboard_widgets_smart_insight_seo", "dashboard_widgets_smart_insight_image_tag", "dashboard_widgets_analytics_card_title", "dashboard_widgets_top_performing_title", "dashboard_widgets_top_performing_views", "dashboard_widgets_top_performing_inquiries", "dashboard_widgets_analytics_provider", "features_whatsapp_float", "features_announcement_bar", "updated_at", "created_at" FROM \`site_features\`;`)
  await db.run(sql`DROP TABLE \`site_features\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_features\` RENAME TO \`site_features\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
