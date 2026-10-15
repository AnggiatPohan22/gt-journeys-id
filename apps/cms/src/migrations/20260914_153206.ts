// Phase 4.39 — Destinations gallery parity: add optional `caption` column
// to `destinations_gallery` so the shared bulk-upload + framed grid UI
// components (Phase 4.26 → 4.29 pilot) can be wired to this collection
// too. Zero data migration needed — caption is nullable, existing rows
// stay untouched.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`destinations_gallery\` ADD \`caption\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`destinations_gallery\` DROP COLUMN \`caption\`;`)
}
