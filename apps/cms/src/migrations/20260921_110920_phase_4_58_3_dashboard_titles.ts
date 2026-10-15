import { sql } from '@payloadcms/db-sqlite/drizzle'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

/**
 * Phase 4.58.3 — tambah 9 kolom text opsional di `site_features` untuk
 * label kustom super-admin pada tiap widget dashboard. Kosongkan → runtime
 * fallback ke default hardcoded (backward compat penuh).
 *
 * Kolom:
 *   - dashboard_widgets_header_title            text (dashboard header title, default "Overview")
 *   - dashboard_widgets_header_subtitle         text (dashboard header subtitle, default "Welcome back, {name} — …")
 *   - dashboard_widgets_at_a_glance_title       text (default "At a glance")
 *   - dashboard_widgets_recent_activity_title   text (default "Recent activity")
 *   - dashboard_widgets_quick_access_title      text (default "Quick access")
 *   - dashboard_widgets_system_health_title     text (default auto: "Media Usage" / "System Health")
 *   - dashboard_widgets_smart_insight_title     text (default "Smart Insight")
 *   - dashboard_widgets_top_performing_title    text (default "Top Performing")
 *   - dashboard_widgets_analytics_card_title    text (default "Traffic & Performance")
 *
 * Semua nullable, no default → NULL kalau tak diisi → consumer runtime pakai
 * fallback string. Pure ADD COLUMN, reversible.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_header_title\`           text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_header_subtitle\`        text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_at_a_glance_title\`      text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_recent_activity_title\`  text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_quick_access_title\`     text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_system_health_title\`    text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_smart_insight_title\`    text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_top_performing_title\`   text;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_analytics_card_title\`   text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_analytics_card_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_top_performing_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_smart_insight_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_system_health_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_quick_access_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_recent_activity_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_at_a_glance_title\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_header_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_header_title\`;`)
}
