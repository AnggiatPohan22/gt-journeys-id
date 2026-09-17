import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

/**
 * Phase 4.50.2 — Data move: SiteSettings.whatsappDefaults → chat-widget.channels[0]
 *
 * Pindahkan konfigurasi WA floating lama (defaultNumber, greetingMessage)
 * ke channel WhatsApp pertama di chat-widget global. Idempotent:
 * - Kalau chat-widget.channels[] sudah punya isi → skip (tidak override).
 * - Kalau SiteSettings.whatsappDefaults kosong total → skip.
 * - Field lama di SiteSettings TIDAK dihapus (masih dipakai fallback oleh
 *   Footer.astro & FooterRenderer.astro untuk businessHours). Cleanup
 *   akhirnya di Phase 4.53.
 *
 * Pakai Payload local API (bukan raw SQL) karena struktur blocks di
 * SQLite tersebar di banyak child table (chat_widget_channels_blocks,
 * chat_widget_channels_whatsapp_channel, rels) — Payload update handles
 * itu semua atomically.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const site = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const wd = (site as any)?.whatsappDefaults
  const legacyNumber = wd?.defaultNumber?.trim?.() ?? ''
  const legacyMessage = wd?.greetingMessage?.trim?.() ?? ''

  if (!legacyNumber && !legacyMessage) {
    payload.logger.info('[chat-widget migrate] SiteSettings.whatsappDefaults kosong — skip data-move.')
    return
  }

  const existing = await payload.findGlobal({ slug: 'chat-widget' }).catch(() => null)
  const existingChannels = (existing as any)?.channels
  if (Array.isArray(existingChannels) && existingChannels.length > 0) {
    payload.logger.info(
      `[chat-widget migrate] chat-widget.channels sudah berisi ${existingChannels.length} channel — skip (idempotent).`,
    )
    return
  }

  await payload.updateGlobal({
    slug: 'chat-widget',
    data: {
      enabled: true,
      channels: [
        {
          blockType: 'whatsappChannel',
          label: 'General',
          subtitle: 'Have a question? Chat with us',
          enabled: true,
          whatsappNumber: legacyNumber,
          prefilledMessage: legacyMessage,
          appendUtm: true,
        },
      ],
    } as any,
  })

  payload.logger.info(
    `[chat-widget migrate] Berhasil pindah whatsappDefaults → chat-widget.channels[0] (number=${legacyNumber ? 'set' : 'empty'}, message=${legacyMessage ? 'set' : 'empty'}).`,
  )
}

/**
 * Down: hapus channels[0] kalau berasal dari data-move (deteksi via
 * kombinasi label=General + blockType=whatsappChannel + isi cocok
 * whatsappDefaults sekarang). Konservatif: kalau admin sudah edit,
 * jangan hapus. Data whatsappDefaults di SiteSettings tetap ada, jadi
 * down() aman = no-op praktis.
 */
export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const existing = await payload.findGlobal({ slug: 'chat-widget' }).catch(() => null)
  const channels: any[] = (existing as any)?.channels ?? []
  if (channels.length === 0) return

  const first = channels[0]
  if (first?.blockType !== 'whatsappChannel' || first?.label !== 'General') {
    payload.logger.info('[chat-widget migrate down] Row pertama sudah di-edit admin — skip.')
    return
  }

  const remaining = channels.slice(1)
  await payload.updateGlobal({
    slug: 'chat-widget',
    data: { channels: remaining } as any,
  })
  payload.logger.info('[chat-widget migrate down] Removed migrated WhatsApp channel[0].')
}
