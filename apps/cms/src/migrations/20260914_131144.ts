// Follow-up migration to 20260914_032538 (add-blog-settings-and-related-override).
//
// drizzle-kit's generated migration created the `blog_settings` global
// table + `posts.related_override_*` columns, but skipped emitting the
// FK columns that Payload's admin queries expect on the two central
// join tables. Without these, admin routes 500 with
//   "no such column: blog_settings_id"
// on the first admin page load (same class of failure as Phase 4.33
// newsletter_subscribers and Phase 4.35 authors).
//
// This migration is purely additive: 2 columns + 2 indexes. Reviewable,
// re-runnable on a fresh DB via `payload migrate`.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // payload_locked_documents_rels — admin lock tracking (used by every
  // admin doc view).
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\`
    ADD \`blog_settings_id\` integer
    REFERENCES \`blog_settings\`(id) ON UPDATE no action ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_settings_id_idx\`
    ON \`payload_locked_documents_rels\` (\`blog_settings_id\`);`)

  // payload_preferences_rels — per-user admin UI prefs.
  await db.run(sql`ALTER TABLE \`payload_preferences_rels\`
    ADD \`blog_settings_id\` integer
    REFERENCES \`blog_settings\`(id) ON UPDATE no action ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_blog_settings_id_idx\`
    ON \`payload_preferences_rels\` (\`blog_settings_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_preferences_rels_blog_settings_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_preferences_rels\` DROP COLUMN \`blog_settings_id\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_blog_settings_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`blog_settings_id\`;`)
}
