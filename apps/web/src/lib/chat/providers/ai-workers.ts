import type { ChannelProvider, ProviderReply, ProviderReplyInput } from './types'

/**
 * Cloudflare Workers AI provider adapter — Phase 4.50.5.x.
 *
 * Dua mode akses:
 *   (A) Native binding: `env.AI.run(model, { messages })`. Aktif kalau
 *       `wrangler.jsonc` punya `[ai] binding = "AI"`. Tidak butuh API key
 *       — auth via binding. Latency rendah (co-located di edge).
 *   (B) REST fallback: `POST api.cloudflare.com/client/v4/accounts/{id}/ai/run/{model}`.
 *       Butuh env `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. Dipakai
 *       di dev (`pnpm dev` tanpa wrangler runtime) atau bila binding
 *       belum di-provision.
 *
 * Config dari CMS block `aiChatbotChannel`:
 *   provider: 'workers-ai'
 *   model: '@cf/meta/llama-3.1-8b-instruct' (contoh; owner isi model id sendiri)
 *   systemPrompt, welcomeMessage
 *   apiKeyRef: N/A untuk binding mode; untuk REST diabaikan (pakai env
 *     fix CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).
 */

interface AiBinding {
  run: (model: string, input: any) => Promise<any>
}

export class WorkersAiProvider implements ChannelProvider {
  constructor(
    private secretResolver: (envName: string) => string | undefined,
    private aiBinding?: AiBinding,
  ) {}

  async reply(input: ProviderReplyInput): Promise<ProviderReply> {
    const block = input.channelConfig.block
    if (block?.provider !== 'workers-ai') return { ok: false, code: 'unsupported_provider' }

    const model = block?.model?.trim?.() || '@cf/meta/llama-3.1-8b-instruct'
    const systemPrompt =
      block?.systemPrompt?.trim?.() ||
      'You are a helpful assistant for GtJourneysID, a Bali travel service.'
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input.content },
    ]

    // ── Mode A: native binding ───────────────────────────────────────
    if (this.aiBinding && typeof this.aiBinding.run === 'function') {
      try {
        const res = await this.aiBinding.run(model, { messages, max_tokens: 512 })
        // Workers AI response shape (text-generation): { response: string, usage?: {...} }
        const text = extractText(res)
        if (!text) return { ok: false, code: 'empty_reply', providerMeta: { via: 'binding', raw: res } }
        return {
          ok: true,
          reply: text,
          providerMeta: { via: 'binding', model, usage: (res as any)?.usage },
        }
      } catch (e) {
        // Fall through ke REST kalau binding error (mis. quota) — cek fallback dulu
        if (!this.canFallbackToRest()) {
          return { ok: false, code: 'provider_binding_error', providerMeta: { err: String(e) } }
        }
      }
    }

    // ── Mode B: REST fallback ────────────────────────────────────────
    const token = this.secretResolver('CLOUDFLARE_API_TOKEN')
    const accountId = this.secretResolver('CLOUDFLARE_ACCOUNT_ID')
    if (!token || !accountId) {
      return { ok: false, code: 'missing_secret', providerMeta: { note: 'Workers AI butuh binding atau (CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).' } }
    }

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages, max_tokens: 512 }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return {
          ok: false,
          code: `provider_http_${res.status}`,
          providerMeta: { via: 'rest', status: res.status, body: errText.slice(0, 300) },
        }
      }

      const data = (await res.json()) as {
        success?: boolean
        result?: { response?: string; usage?: any }
        errors?: any[]
      }
      if (data.success === false) {
        return { ok: false, code: 'provider_rest_error', providerMeta: { via: 'rest', errors: data.errors } }
      }
      const text = extractText(data?.result ?? data)
      if (!text) return { ok: false, code: 'empty_reply', providerMeta: { via: 'rest' } }
      return {
        ok: true,
        reply: text,
        providerMeta: { via: 'rest', model, usage: data?.result?.usage },
      }
    } catch (e) {
      return { ok: false, code: 'provider_fetch_error', providerMeta: { err: String(e) } }
    }
  }

  private canFallbackToRest(): boolean {
    return !!this.secretResolver('CLOUDFLARE_API_TOKEN') && !!this.secretResolver('CLOUDFLARE_ACCOUNT_ID')
  }
}

/**
 * Text-extraction untuk beragam bentuk response Workers AI:
 *   text-generation      → { response: '...' }
 *   chat (some models)   → { response: '...' } atau { output: [...] }
 *   streaming (not used) → { response: '...' } concatenated
 */
function extractText(raw: any): string {
  if (!raw) return ''
  if (typeof raw.response === 'string') return raw.response
  if (Array.isArray(raw.output)) {
    return raw.output
      .map((o: any) => (typeof o?.content === 'string' ? o.content : ''))
      .join('\n')
      .trim()
  }
  if (typeof raw === 'string') return raw
  return ''
}
