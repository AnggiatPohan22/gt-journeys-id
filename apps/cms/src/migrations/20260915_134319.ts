// Phase 4.48.1 — Add `show_social_links` (default true) ke
// `footer_settings_layout_columns` untuk kolom type `brand` supaya
// SA bisa toggle tampilan ikon social per row (dari SiteSettings.
// socialMedia). Reversible.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`footer_settings_layout_columns\` ADD \`show_social_links\` integer DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`footer_settings_layout_columns\` DROP COLUMN \`show_social_links\`;`)
}
