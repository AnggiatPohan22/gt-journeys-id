// Phase 4.48 — Footer flexible columns + SiteSettings payment methods.
// Dua sub-table baru:
//   * site_settings_payment_methods — array badge (Visa, GoPay, dst)
//     dgn logo (media FK) + optional URL. Source of truth global.
//   * footer_settings_layout_columns — array builder kolom footer
//     (max 4, type+width+heading+content). Kalau kosong → renderer
//     fallback ke legacy slot logic (backward compat). Kalau di-isi →
//     footer-1 render kolom sesuai definisi ini.
// Reversible: DOWN DROP TABLE (destroys any layout data — dokumentasi
// migration jalan warning migrate command).

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings_payment_methods\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`logo_id\` integer NOT NULL,
  	\`url\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_payment_methods_order_idx\` ON \`site_settings_payment_methods\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_payment_methods_parent_id_idx\` ON \`site_settings_payment_methods\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_payment_methods_logo_idx\` ON \`site_settings_payment_methods\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_settings_layout_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'menuList' NOT NULL,
  	\`width\` text DEFAULT 'auto' NOT NULL,
  	\`heading\` text,
  	\`menu_id\` integer,
  	\`show_business_hours\` integer DEFAULT true,
  	\`show_payment_methods\` integer DEFAULT false,
  	\`custom_content\` text,
  	FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_settings_layout_columns_order_idx\` ON \`footer_settings_layout_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_layout_columns_parent_id_idx\` ON \`footer_settings_layout_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_settings_layout_columns_menu_idx\` ON \`footer_settings_layout_columns\` (\`menu_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings_payment_methods\`;`)
  await db.run(sql`DROP TABLE \`footer_settings_layout_columns\`;`)
}
