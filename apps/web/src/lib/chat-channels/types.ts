/**
 * Chat-channel adapter contract — Phase 4.50.3.
 *
 * Setiap channel type (WhatsApp, AI chatbot, Live chat, Email) di-resolve
 * ke bentuk uniform yang di-consume ChatWidget.astro. Menambah channel baru
 * (Telegram, SMS, dst.) = tambah 1 file adapter + 1 branch di dispatcher.
 */

export type ChannelBlockType =
  | 'whatsappChannel'
  | 'aiChatbotChannel'
  | 'liveChatChannel'
  | 'emailChannel'

export interface ResolveContext {
  /** Fallback nomor WA global (SiteSettings.contact.whatsapp) */
  fallbackWhatsappNumber?: string
  /** Fallback greeting message (SiteSettings.whatsappDefaults.greetingMessage) */
  fallbackWhatsappMessage?: string
  /** UTM params dari ChatWidgetSettings.Tracking */
  utm?: { source?: string; medium?: string; campaign?: string }
}

/**
 * Hasil resolve — bentuk uniform yang di-render sebagai kartu chat option.
 *
 * `mode`:
 * - 'link'  = <a href> yang buka tab baru (WA, Email)
 * - 'panel' = trigger buka panel dalam (AI chatbot) — belum implemented
 *             di Phase 4.50.3, sementara di-treat sebagai disabled.
 * - 'script'= trigger provider script (Live chat Crisp/Tawk/Intercom) —
 *             belum implemented; disabled untuk sekarang.
 */
export interface ResolvedChannel {
  key: string
  /** 0-based index di widget.channels[] — dipakai body request /api/chat/send. */
  channelIndex: number
  blockType: ChannelBlockType
  label: string
  subtitle: string
  agentName?: string
  agentAvatarUrl?: string | null
  iconName: string
  brandColor: string
  mode: 'link' | 'panel' | 'script'
  href?: string
  /** Untuk mode='panel': welcome message di-render di atas thread saat panel dibuka. */
  welcomeMessage?: string
  disabled?: boolean
  disabledReason?: string
}
