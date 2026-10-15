import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`posts_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`posts_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`tours_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`tours_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`yachts_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`yachts_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`restaurants_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`restaurants_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`venues_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`venues_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`rentals_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`rentals_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
  await db.run(sql`ALTER TABLE \`spa_blocks_service_listing\` ADD \`initial_visible_count_tablet\` numeric DEFAULT 4;`)
  await db.run(sql`ALTER TABLE \`spa_blocks_service_listing\` ADD \`initial_visible_count_mobile\` numeric DEFAULT 3;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`posts_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`posts_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`tours_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`tours_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`yachts_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`yachts_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`restaurants_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`restaurants_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`venues_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`venues_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`rentals_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`rentals_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
  await db.run(sql`ALTER TABLE \`spa_blocks_service_listing\` DROP COLUMN \`initial_visible_count_tablet\`;`)
  await db.run(sql`ALTER TABLE \`spa_blocks_service_listing\` DROP COLUMN \`initial_visible_count_mobile\`;`)
}
