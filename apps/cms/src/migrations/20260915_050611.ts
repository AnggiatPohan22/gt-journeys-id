// Phase 4.43 — Footer Advanced Theming. Adds 6 nullable color-override
// columns ke `footer_settings` untuk bg / text / muted / link hover /
// heading / divider. Kosong (null) → frontend fallback ke warna default
// template. Reversible.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`footer_settings\` ADD \`advanced_bg_color\` text;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` ADD \`advanced_text_color\` text;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` ADD \`advanced_muted_text_color\` text;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` ADD \`advanced_link_hover_color\` text;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` ADD \`advanced_heading_color\` text;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` ADD \`advanced_divider_color\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`footer_settings\` DROP COLUMN \`advanced_bg_color\`;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` DROP COLUMN \`advanced_text_color\`;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` DROP COLUMN \`advanced_muted_text_color\`;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` DROP COLUMN \`advanced_link_hover_color\`;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` DROP COLUMN \`advanced_heading_color\`;`)
  await db.run(sql`ALTER TABLE \`footer_settings\` DROP COLUMN \`advanced_divider_color\`;`)
}
