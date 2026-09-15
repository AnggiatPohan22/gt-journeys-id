// Phase 4.44 — Marketing globals (AnnouncementBar + PromoBanner) Advanced
// theming. Adds 4 warna override untuk announcement_bar (bg/text/link/
// link hover) dan 7 warna + 1 radius untuk promo_banner (panel bg/backdrop/
// heading/body/CTA bg/CTA hover/CTA text/CTA radius default 'rounded').
// Semua nullable → kosong = fallback ke preset (announcement_bar.theme
// select) atau default hex hardcoded lama (promo_banner). Reversible.

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`announcement_bar\` ADD \`advanced_bg_color\` text;`)
  await db.run(sql`ALTER TABLE \`announcement_bar\` ADD \`advanced_text_color\` text;`)
  await db.run(sql`ALTER TABLE \`announcement_bar\` ADD \`advanced_link_color\` text;`)
  await db.run(sql`ALTER TABLE \`announcement_bar\` ADD \`advanced_link_hover_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_panel_bg_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_backdrop_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_heading_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_body_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_cta_bg_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_cta_bg_hover_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_cta_text_color\` text;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` ADD \`advanced_cta_radius\` text DEFAULT 'rounded';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`announcement_bar\` DROP COLUMN \`advanced_bg_color\`;`)
  await db.run(sql`ALTER TABLE \`announcement_bar\` DROP COLUMN \`advanced_text_color\`;`)
  await db.run(sql`ALTER TABLE \`announcement_bar\` DROP COLUMN \`advanced_link_color\`;`)
  await db.run(sql`ALTER TABLE \`announcement_bar\` DROP COLUMN \`advanced_link_hover_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_panel_bg_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_backdrop_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_heading_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_body_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_cta_bg_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_cta_bg_hover_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_cta_text_color\`;`)
  await db.run(sql`ALTER TABLE \`promo_banner\` DROP COLUMN \`advanced_cta_radius\`;`)
}
