import { sql } from '@payloadcms/db-sqlite/drizzle'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

/**
 * Phase 4.58.1 — tambah kolom scalar + 5 junction table untuk widget
 * dashboard config yang dipilih via UI di SiteFeatures.dashboardWidgets.
 *
 * Scalar columns di `site_features`:
 *   - dashboard_widgets_at_a_glance_enabled       integer default true
 *   - dashboard_widgets_at_a_glance_clickable     integer default true
 *   - dashboard_widgets_recent_activity_enabled   integer default true
 *   - dashboard_widgets_recent_activity_limit     numeric default 10
 *
 * Junction tables (5) untuk `hasMany: true` select fields — struktur konsisten
 * dgn `restaurants_cuisine_type` (pattern Payload SQLite adapter):
 *   - order        integer NOT NULL
 *   - parent_id    integer NOT NULL (FK → site_features.id ON DELETE cascade)
 *   - value        text (nullable, enum)
 *   - id           integer PRIMARY KEY
 *   + index (order), index (parent_id)
 *
 * Tables:
 *   - site_features_dashboard_widgets_at_a_glance_stats
 *   - site_features_dashboard_widgets_quick_access_admin
 *   - site_features_dashboard_widgets_quick_access_editor
 *   - site_features_dashboard_widgets_system_health_admin
 *   - site_features_dashboard_widgets_system_health_editor
 *
 * Zero data mutation — kalau junction kosong (data lama tak ada), consumer
 * di DashboardStats fallback ke default hardcoded.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── Scalar columns ─────────────────────────────────────────
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_at_a_glance_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_at_a_glance_clickable\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_recent_activity_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`dashboard_widgets_recent_activity_limit\` numeric DEFAULT 10;`)

  // ── Junction: At A Glance stats ────────────────────────────
  await db.run(sql`CREATE TABLE \`site_features_dashboard_widgets_at_a_glance_stats\` (
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`value\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`site_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_at_a_glance_stats_order_idx\` ON \`site_features_dashboard_widgets_at_a_glance_stats\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_at_a_glance_stats_parent_idx\` ON \`site_features_dashboard_widgets_at_a_glance_stats\` (\`parent_id\`);`)

  // ── Junction: Quick Access Admin ───────────────────────────
  await db.run(sql`CREATE TABLE \`site_features_dashboard_widgets_quick_access_admin\` (
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`value\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`site_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_quick_access_admin_order_idx\` ON \`site_features_dashboard_widgets_quick_access_admin\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_quick_access_admin_parent_idx\` ON \`site_features_dashboard_widgets_quick_access_admin\` (\`parent_id\`);`)

  // ── Junction: Quick Access Editor ──────────────────────────
  await db.run(sql`CREATE TABLE \`site_features_dashboard_widgets_quick_access_editor\` (
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`value\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`site_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_quick_access_editor_order_idx\` ON \`site_features_dashboard_widgets_quick_access_editor\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_quick_access_editor_parent_idx\` ON \`site_features_dashboard_widgets_quick_access_editor\` (\`parent_id\`);`)

  // ── Junction: System Health Admin ──────────────────────────
  await db.run(sql`CREATE TABLE \`site_features_dashboard_widgets_system_health_admin\` (
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`value\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`site_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_system_health_admin_order_idx\` ON \`site_features_dashboard_widgets_system_health_admin\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_system_health_admin_parent_idx\` ON \`site_features_dashboard_widgets_system_health_admin\` (\`parent_id\`);`)

  // ── Junction: System Health Editor ─────────────────────────
  await db.run(sql`CREATE TABLE \`site_features_dashboard_widgets_system_health_editor\` (
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`value\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`site_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_system_health_editor_order_idx\` ON \`site_features_dashboard_widgets_system_health_editor\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_features_dashboard_widgets_system_health_editor_parent_idx\` ON \`site_features_dashboard_widgets_system_health_editor\` (\`parent_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_features_dashboard_widgets_system_health_editor\`;`)
  await db.run(sql`DROP TABLE \`site_features_dashboard_widgets_system_health_admin\`;`)
  await db.run(sql`DROP TABLE \`site_features_dashboard_widgets_quick_access_editor\`;`)
  await db.run(sql`DROP TABLE \`site_features_dashboard_widgets_quick_access_admin\`;`)
  await db.run(sql`DROP TABLE \`site_features_dashboard_widgets_at_a_glance_stats\`;`)

  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_recent_activity_limit\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_recent_activity_enabled\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_at_a_glance_clickable\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`dashboard_widgets_at_a_glance_enabled\`;`)
}
