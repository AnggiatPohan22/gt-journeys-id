import type { ChannelProvider, ProviderReply, ProviderReplyInput } from './types'

/**
 * Anthropic Messages API adapter (non-streaming).
 *
 * Untuk MVP Phase 4.50.5: single-turn request/response. Streaming
 * (SSE) datang di Phase 4.50.6 bersama panel UI di frontend.
 *
 * Reads config dari channel block: provider, model, systemPrompt,
 * welcomeMessage, apiKeyRef. Secret di-resolve dari env di runtime.
 */
export class AnthropicProvider implements ChannelProvider {
  constructor(private secretResolver: (envName: string) => string | undefined) {}

  async reply(input: ProviderReplyInput): Promise<ProviderReply> {
    const block = input.channelConfig.block
    const provider = block?.provider
    if (provider !== 'anthropic') {
      return { ok: false, code: 'unsupported_provider' }
    }

    const envName = block?.apiKeyRef?.trim?.() || 'ANTHROPIC_API_KEY'
    const apiKey = this.secretResolver(envName)
    if (!apiKey) return { ok: false, code: 'missing_secret' }

    const model = block?.model?.trim?.() || 'claude-haiku-4-5'
    const systemPrompt =
      block?.systemPrompt?.trim?.() ||
      'You are a helpful assistant for GtJourneysID, a Bali travel service.'

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: input.content }],
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return {
          ok: false,
          code: `provider_http_${res.status}`,
          providerMeta: { status: res.status, body: errText.slice(0, 200) },
        }
      }

      const data = (await res.json()) as {
        content?: Array<{ type: string; text?: string }>
        usage?: { input_tokens?: number; output_tokens?: number }
        id?: string
      }
      const text =
        data.content
          ?.filter((c) => c.type === 'text' && c.text)
          .map((c) => c.text as string)
          .join('\n') ?? ''

      if (!text.trim()) return { ok: false, code: 'empty_reply' }

      return {
        ok: true,
        reply: text,
        providerMeta: {
          model,
          providerRequestId: data.id,
          inputTokens: data.usage?.input_tokens,
          outputTokens: data.usage?.output_tokens,
        },
      }
    } catch (e) {
      return { ok: false, code: 'provider_fetch_error', providerMeta: { err: String(e) } }
    }
  }
}
