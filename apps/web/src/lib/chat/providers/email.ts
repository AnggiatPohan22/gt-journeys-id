import type { ChannelProvider, ProviderReply, ProviderReplyInput } from './types'

/**
 * Email provider — Phase 4.50.5 STUB.
 *
 * Email channel di widget saat ini pakai `mailto:` (client-side). Bila
 * ke depan admin ingin form-based email (POST body → server sends via
 * SMTP/Resend/Postmark), adapter ini yang di-extend.
 *
 * Sekarang: log-only. Endpoint tetap accept, audit ke chat-messages
 * dengan direction='in' (sebagai record), tidak ada reply (mode
 * fire-and-forget).
 */
export class EmailLogProvider implements ChannelProvider {
  async reply(_input: ProviderReplyInput): Promise<ProviderReply> {
    return { ok: true, reply: 'ok', providerMeta: { note: 'email_stub_no_send' } }
  }
}
