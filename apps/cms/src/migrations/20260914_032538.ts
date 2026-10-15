import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`blog_settings\` (
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
  await db.run(sql`ALTER TABLE \`posts\` ADD \`related_override_enabled\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`related_override_heading\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`related_override_selection_mode\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`related_override_limit\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`blog_settings\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`related_override_enabled\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`related_override_heading\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`related_override_selection_mode\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`related_override_limit\`;`)
}
