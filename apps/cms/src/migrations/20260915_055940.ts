// Phase 4.45 — Drop `announcement_bar.theme` preset select. Warna
// sekarang sepenuhnya dari group `advanced` (mendukung alpha).
// Existing rows dengan theme != 'ocean' kehilangan preset — SA re-pick
// via Advanced Colors. Reversible: DOWN re-add kolom dgn default 'ocean'
// tapi TIDAK memulihkan nilai lama (data hilang saat DROP).

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`announcement_bar\` DROP COLUMN \`theme\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`announcement_bar\` ADD \`theme\` text DEFAULT 'ocean' NOT NULL;`)
}
