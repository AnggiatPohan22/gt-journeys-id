/**
 * Provider contracts — Phase 4.50.5.
 *
 * Adapter untuk backend-hit channels. Tambah provider baru (Telegram bot,
 * SMS via Twilio, dsb.) = tambah 1 file implement `ChannelProvider`.
 */

export interface ProviderChannelConfig {
  blockType: string
  index: number
  block: any
}

export interface ProviderReplyInput {
  content: string
  visitorId: string
  sessionId: string
  channelConfig: ProviderChannelConfig
}

export type ProviderReply =
  | { ok: true; reply: string; providerMeta?: Record<string, unknown> }
  | { ok: false; code: string; providerMeta?: Record<string, unknown> }

export interface ChannelProvider {
  reply(input: ProviderReplyInput): Promise<ProviderReply>
}
