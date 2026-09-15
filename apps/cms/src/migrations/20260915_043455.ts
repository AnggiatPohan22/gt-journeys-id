// Phase 4.42 — Add `advanced_cta_radius` (enum-as-text) untuk Header CTA
// button shape. Default 'pill' cocok dengan tampilan lama (rounded-full).
// Nullable-friendly: kalau kosong frontend fallback ke 'pill'.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header_settings\` ADD \`advanced_cta_radius\` text DEFAULT 'pill';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`header_settings\` DROP COLUMN \`advanced_cta_radius\`;`)
}
