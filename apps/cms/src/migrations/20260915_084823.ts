// Phase 4.41.1 (addendum ke Phase 4.41) — tambah `header_settings.
// advanced_bg_color`. Kolom nullable text; kosong = fallback ke default
// per-template di HeaderRenderer.astro. Reversible.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_bg_color\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_bg_color\`;`)
}
