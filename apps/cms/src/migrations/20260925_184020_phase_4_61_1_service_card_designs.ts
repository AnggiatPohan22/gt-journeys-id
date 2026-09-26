import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_tours_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_accommodations_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_water_activities_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_yacht_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_restaurants_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_weddings_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_rentals_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_spa_design\` text DEFAULT 'compact';`)
  await db.run(sql`ALTER TABLE \`site_features\` ADD \`modules_ferry_tickets_design\` text DEFAULT 'ticket';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_tours_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_accommodations_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_water_activities_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_yacht_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_restaurants_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_weddings_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_rentals_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_spa_design\`;`)
  await db.run(sql`ALTER TABLE \`site_features\` DROP COLUMN \`modules_ferry_tickets_design\`;`)
}
