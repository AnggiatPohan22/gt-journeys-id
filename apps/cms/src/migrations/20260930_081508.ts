import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`popup_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`default_title\` text DEFAULT 'Konfirmasi',
  	\`confirm_label\` text DEFAULT 'Lanjutkan',
  	\`cancel_label\` text DEFAULT 'Batal',
  	\`show_close_button\` integer DEFAULT true,
  	\`show_icon\` integer DEFAULT true,
  	\`icon_name\` text DEFAULT 'help',
  	\`size\` text DEFAULT 'md',
  	\`radius\` text DEFAULT '2xl',
  	\`backdrop\` text DEFAULT 'blur',
  	\`bg_color\` text,
  	\`title_color\` text,
  	\`text_color\` text,
  	\`icon_color\` text,
  	\`confirm_bg\` text,
  	\`confirm_text\` text,
  	\`cancel_bg\` text,
  	\`cancel_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`popup_settings\`;`)
}
