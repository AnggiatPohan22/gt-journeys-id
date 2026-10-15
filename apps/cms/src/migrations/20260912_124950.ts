import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`blog_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`blog_enable_ads\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`blog_enabled\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`blog_enable_ads\`;`)
}
