import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Popup Settings — swap the initial Indonesian defaults for English
 * (Phase 4.59.1 follow-up).
 *
 * Only rewrites values that still match the original defaults from
 * `20260930_081508` so any admin edits are preserved. Idempotent:
 * running it twice is a no-op.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`popup_settings\` SET \`default_title\` = 'Confirm'  WHERE \`default_title\` = 'Konfirmasi'`)
  await db.run(sql`UPDATE \`popup_settings\` SET \`confirm_label\` = 'Continue' WHERE \`confirm_label\` = 'Lanjutkan'`)
  await db.run(sql`UPDATE \`popup_settings\` SET \`cancel_label\`  = 'Cancel'   WHERE \`cancel_label\`  = 'Batal'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`popup_settings\` SET \`default_title\` = 'Konfirmasi' WHERE \`default_title\` = 'Confirm'`)
  await db.run(sql`UPDATE \`popup_settings\` SET \`confirm_label\` = 'Lanjutkan'  WHERE \`confirm_label\` = 'Continue'`)
  await db.run(sql`UPDATE \`popup_settings\` SET \`cancel_label\`  = 'Batal'      WHERE \`cancel_label\`  = 'Cancel'`)
}
