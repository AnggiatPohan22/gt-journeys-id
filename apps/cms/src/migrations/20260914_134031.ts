// Data migration: rename legacy `background='muted'` → `'sand'` on
// `blog_settings.related_posts_background`.
//
// Reason: the enum value 'muted' rendered as bg-stone/5 which visibly
// differs from the page body (bg-sand cream). Renaming to a site-token
// enum ('sand', 'sand-light', 'ocean', ...) makes Related Posts section
// seamless with body background and matches other sections' palette.
// See globals/BlogSettings.ts + components/blog/RelatedPosts.astro.
//
// Purely a DATA update — no schema change. Idempotent.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    UPDATE \`blog_settings\`
    SET \`related_posts_background\` = 'sand'
    WHERE \`related_posts_background\` = 'muted';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    UPDATE \`blog_settings\`
    SET \`related_posts_background\` = 'muted'
    WHERE \`related_posts_background\` = 'sand';
  `)
}
