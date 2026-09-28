import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`locations\` ADD \`timezone\` text DEFAULT 'Asia/Jakarta';`)
  await db.run(sql`ALTER TABLE \`locations\` ADD \`map_embed_url\` text;`)
  await db.run(sql`ALTER TABLE \`locations\` ADD \`map_link\` text;`)
  await db.run(sql`ALTER TABLE \`ferry_tickets\` ADD \`arrival_time\` text;`)
  await db.run(sql`ALTER TABLE \`ferry_tickets\` ADD \`duration_override\` integer;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`locations\` DROP COLUMN \`timezone\`;`)
  await db.run(sql`ALTER TABLE \`locations\` DROP COLUMN \`map_embed_url\`;`)
  await db.run(sql`ALTER TABLE \`locations\` DROP COLUMN \`map_link\`;`)
  await db.run(sql`ALTER TABLE \`ferry_tickets\` DROP COLUMN \`arrival_time\`;`)
  await db.run(sql`ALTER TABLE \`ferry_tickets\` DROP COLUMN \`duration_override\`;`)
}
