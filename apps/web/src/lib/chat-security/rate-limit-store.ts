import type {
  RateLimitCheckInput,
  RateLimitCheckResult,
  RateLimitRule,
  RateLimitStore,
} from './types'

/**
 * Sliding-window rate-limit counter — Phase 4.50.4.
 *
 * Store abstraction dengan 2 implementasi bawaan:
 *   - MemoryRateLimitStore : in-memory Map, cocok untuk dev/test.
 *     TIDAK persisted, TIDAK shared antar worker instance — di production
 *     Cloudflare Workers isolate short-lived, jadi hanya deterministic
 *     untuk 1 request lifetime. Jangan pakai di prod.
 *   - CloudflareKvRateLimitStore : pakai Cloudflare KV namespace. TTL
 *     native ke KV (ex_seconds), atomic put+get per key. Ini yang dipakai
 *     endpoint /api/chat/* di prod.
 *
 * Bila nanti mau upgrade ke Durable Objects (untuk atomic increment
 * benar-benar konsisten cross-region), cukup buat DoRateLimitStore yang
 * implement `RateLimitStore` interface — zero perubahan di consumer.
 */

// ── Memory implementation (dev / test) ──────────────────────────────
export class MemoryRateLimitStore implements RateLimitStore {
  private map = new Map<string, { count: number; resetAt: number }>()

  async increment(key: string, windowSeconds: number, now = Date.now()) {
    const existing = this.map.get(key)
    if (!existing || existing.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowSeconds * 1000 }
      this.map.set(key, fresh)
      return fresh
    }
    existing.count += 1
    return existing
  }

  async peek(key: string, windowSeconds: number, now = Date.now()) {
    const existing = this.map.get(key)
    if (!existing || existing.resetAt <= now) {
      return { count: 0, resetAt: now + windowSeconds * 1000 }
    }
    return existing
  }
}

// ── Cloudflare KV implementation (prod) ─────────────────────────────
// Minimum shape yang dipakai — kompatibel dengan Cloudflare Workers `KVNamespace`.
export interface KvBinding {
  get(key: string, options?: { type?: 'json' | 'text' | 'arrayBuffer' }): Promise<any>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number; expiration?: number },
  ): Promise<void>
}

export class CloudflareKvRateLimitStore implements RateLimitStore {
  constructor(private kv: KvBinding, private prefix = 'rl:') {}

  private k(key: string) {
    return `${this.prefix}${key}`
  }

  async increment(key: string, windowSeconds: number, now = Date.now()) {
    const raw = await this.kv.get(this.k(key), { type: 'json' })
    let record: { count: number; resetAt: number } | null =
      raw && typeof raw === 'object' && 'count' in raw && 'resetAt' in raw ? raw : null

    if (!record || record.resetAt <= now) {
      record = { count: 1, resetAt: now + windowSeconds * 1000 }
    } else {
      record.count += 1
    }

    // TTL: sisa detik sampai reset (+ 1 detik buffer). KV expiration
    // berbasis wallclock, jadi race antar increment paralel masih
    // eventually-consistent — untuk hard consistency pakai Durable Object.
    const ttlMs = Math.max(1000, record.resetAt - now + 1000)
    await this.kv.put(this.k(key), JSON.stringify(record), {
      expirationTtl: Math.ceil(ttlMs / 1000),
    })

    return record
  }

  async peek(key: string, windowSeconds: number, now = Date.now()) {
    const raw = await this.kv.get(this.k(key), { type: 'json' })
    const record: { count: number; resetAt: number } | null =
      raw && typeof raw === 'object' && 'count' in raw && 'resetAt' in raw ? raw : null
    if (!record || record.resetAt <= now) {
      return { count: 0, resetAt: now + windowSeconds * 1000 }
    }
    return record
  }
}

// ── Check helper ────────────────────────────────────────────────────
function buildKey(rule: RateLimitRule, input: RateLimitCheckInput): string {
  const parts: string[] = [`r=${rule.id}`, `w=${rule.windowSeconds}`]
  if (rule.keyBy === 'ip' || rule.keyBy === 'both') parts.push(`ip=${input.ipHash}`)
  if (rule.keyBy === 'visitor' || rule.keyBy === 'both') parts.push(`v=${input.visitorId ?? '-'}`)
  if (rule.scope === 'perChannel' && input.channelType) parts.push(`c=${input.channelType}`)
  return parts.join('|')
}

/**
 * Check-and-record 1 rule. Return allowed:false hanya kalau action=block
 * dan count > limit; challenge/log tetap allowed=true tapi info diteruskan
 * ke caller untuk decide next step (mis. mandatory Turnstile).
 */
export async function checkRateLimit(
  store: RateLimitStore,
  input: RateLimitCheckInput,
): Promise<RateLimitCheckResult> {
  const now = input.now ?? Date.now()
  const key = buildKey(input.rule, input)
  const { count, resetAt } = await store.increment(key, input.rule.windowSeconds, now)

  const exceeded = count > input.rule.limitCount
  const allowed = !exceeded || input.rule.action !== 'block'

  return {
    allowed,
    ruleId: input.rule.id,
    action: input.rule.action,
    count,
    limit: input.rule.limitCount,
    windowSeconds: input.rule.windowSeconds,
    resetAt,
  }
}

/**
 * Check semua rules — return semua yang triggered (bukan cuma yang pertama)
 * supaya audit chat-blocked-events bisa catat multiple layer sekali request.
 */
export async function checkRateLimits(
  store: RateLimitStore,
  rules: RateLimitRule[],
  base: Omit<RateLimitCheckInput, 'rule'>,
): Promise<RateLimitCheckResult[]> {
  const results: RateLimitCheckResult[] = []
  for (const rule of rules) {
    const r = await checkRateLimit(store, { ...base, rule })
    results.push(r)
  }
  return results
}
