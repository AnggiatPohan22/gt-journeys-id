/**
 * Newsletter — orchestrator.
 *
 * One entry point the API endpoint calls. Runs validators → store → notifiers.
 * Adding SMTP/Hostinger/webhook later = new Notifier + one line here.
 */
import { validate, type ValidationResult } from './validators'
import { PayloadStore, type NewsletterStore, type StoreResult } from './store'
import { LogNotifier, runNotifiers, type Notifier } from './notifiers'

export interface SubscribeRequest {
  email: unknown
  honeypot?: unknown
  source?: string
  userAgent?: string
  ipKey: string
  ipHash?: string
}

export type SubscribeOutcome =
  | { status: 'ok' }
  | { status: 'duplicate' }
  | { status: 'invalid'; reason: ValidationResult extends { ok: false; reason: infer R } ? R : never }
  | { status: 'rate_limited' }
  | { status: 'server_error' }
  | { status: 'misconfigured' }

let cachedStore: NewsletterStore | null = null
function getDefaultStore(): NewsletterStore {
  if (cachedStore) return cachedStore
  const cmsUrl = import.meta.env.CMS_URL || 'http://localhost:3030'
  const apiKey = import.meta.env.PAYLOAD_API_KEY || ''
  cachedStore = new PayloadStore(cmsUrl, apiKey)
  return cachedStore
}

const defaultNotifiers: readonly Notifier[] = [new LogNotifier()]

export async function subscribe(
  req: SubscribeRequest,
  overrides?: { store?: NewsletterStore; notifiers?: readonly Notifier[] },
): Promise<SubscribeOutcome> {
  const validation = validate({ email: req.email, honeypot: req.honeypot, ipKey: req.ipKey })
  if (!validation.ok) {
    if (validation.reason === 'rate_limited') return { status: 'rate_limited' }
    return { status: 'invalid', reason: validation.reason }
  }

  const store = overrides?.store ?? getDefaultStore()
  const result: StoreResult = await store.save({
    email: validation.email,
    source: req.source,
    userAgent: req.userAgent,
    ipHash: req.ipHash,
  })

  if (!result.ok) {
    if (result.reason === 'duplicate') return { status: 'duplicate' }
    if (result.reason === 'misconfigured') return { status: 'misconfigured' }
    return { status: 'server_error' }
  }

  // Fire-and-forget; don't await notifiers in the request path if latency
  // matters. For MVP we await so logs land in the same request cycle.
  await runNotifiers(overrides?.notifiers ?? defaultNotifiers, {
    email: validation.email,
    source: req.source,
  })

  return { status: 'ok' }
}
