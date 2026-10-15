/**
 * Newsletter — storage layer (Phase 4.33).
 *
 * The store interface abstracts where subscribers persist. Today: Payload
 * CMS collection `newsletter-subscribers` via REST API-key auth. Future:
 * swap to another provider (e.g. Mailchimp) by implementing the same
 * interface — the API endpoint won't change.
 */

export interface SubscriberInput {
  email: string
  source?: string
  userAgent?: string
  ipHash?: string
}

export type StoreResult =
  | { ok: true; id?: string; alreadyExists?: boolean }
  | { ok: false; reason: 'duplicate' | 'server_error' | 'misconfigured' }

export interface NewsletterStore {
  save(sub: SubscriberInput): Promise<StoreResult>
}

// ── Payload REST store ─────────────────────────────────────────────
export class PayloadStore implements NewsletterStore {
  constructor(
    private readonly cmsUrl: string,
    private readonly apiKey: string,
  ) {}

  async save(sub: SubscriberInput): Promise<StoreResult> {
    if (!this.cmsUrl || !this.apiKey) return { ok: false, reason: 'misconfigured' }

    let res: Response
    try {
      res = await fetch(`${this.cmsUrl.replace(/\/$/, '')}/api/newsletter-subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Payload API-key format: "users API-Key <key>"
          Authorization: `users API-Key ${this.apiKey}`,
        },
        body: JSON.stringify({
          email: sub.email,
          status: 'active',
          source: sub.source ?? '',
          userAgent: sub.userAgent ?? '',
          ipHash: sub.ipHash ?? '',
        }),
      })
    } catch {
      return { ok: false, reason: 'server_error' }
    }

    if (res.ok) {
      const doc = await res.json().catch(() => ({}))
      return { ok: true, id: doc?.doc?.id ?? doc?.id }
    }

    // Payload returns 400 with a ValidationError when unique constraint hits.
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}))
      const msg = JSON.stringify(body).toLowerCase()
      if (msg.includes('unique') || msg.includes('duplicate')) {
        return { ok: false, reason: 'duplicate' }
      }
    }

    return { ok: false, reason: 'server_error' }
  }
}
