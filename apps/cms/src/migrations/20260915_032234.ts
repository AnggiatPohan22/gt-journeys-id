// Phase 4.41 — Header Advanced Theming. Adds 9 nullable color-override
// columns to `header_settings` for menu/CTA/icon/top-bar. Kosong (null)
// → frontend fallback ke warna default template. Reversible.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_menu_default_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_menu_hover_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_menu_active_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_cta_bg_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_cta_bg_hover_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_cta_text_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_icon_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_top_bar_bg_color\` text;`)
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_top_bar_text_color\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_menu_default_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_menu_hover_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_menu_active_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_cta_bg_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_cta_bg_hover_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_cta_text_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_icon_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_top_bar_bg_color\`;`)
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_top_bar_text_color\`;`)
}
