import { sql } from '@payloadcms/db-sqlite/drizzle'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

/**
 * Phase 4.58 — tambah 5 kolom di `site_features` untuk widget dashboard baru:
 *   - dashboard_widgets_smart_insight_seo         (integer/bool, default true)
 *   - dashboard_widgets_smart_insight_image_tag   (integer/bool, default false)
 *   - dashboard_widgets_top_performing_views      (integer/bool, default true)
 *   - dashboard_widgets_top_performing_inquiries  (integer/bool, default true)
 *   - dashboard_widgets_analytics_provider        (text, default 'none')
 *
 * Zero recreate-table — semua ADD COLUMN dengan default, aman untuk SQLite.
 * Pattern konsisten dgn migrasi 20260912_124950.ts (blog_enabled/enable_ads).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_smart_insight_seo\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_smart_insight_image_tag\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_top_performing_views\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_top_performing_inquiries\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_analytics_provider\` text DEFAULT 'none';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_smart_insight_seo\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_smart_insight_image_tag\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_top_performing_views\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_top_performing_inquiries\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_analytics_provider\`;`)
}
