/**
 * Bookings rate-limit — Phase 4.62.1 → 4.66.9.
 *
 * Best-effort in-memory rate limiter per Worker isolate. Mirrors the pattern
 * in `@lib/newsletter/validators.ts` — good enough for casual spam. Untuk
 * anti-abuse yang serius, upgrade ke Cloudflare KV atau Durable Object
 * yang di-share antar isolate (menunggu KV/DO binding di project Pages).
 *
 * Phase 4.66.9 (finding S-07):
 *   - Turunkan RATE_MAX 5 → 3 supaya batas per window lebih ketat.
 *   - Bucket key = salted-hash IP (bukan raw IP) supaya map key tidak
 *     bocor identitas visitor kalau memory di-inspect / di-dump.
 *   - Bounded LRU: max 10k entries di map supaya memory tidak grow tak
 *     terhingga di isolate long-running.
 *
 * Sengaja terpisah dari newsletter's map supaya spam newsletter tidak
 * ikut-ikutan menahan submit booking (dan sebaliknya).
 */

const RATE_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const RATE_MAX = 3                     // Phase 4.66.9: turunkan dari 5 → 3.
const MAX_MAP_ENTRIES = 10_000         // Guard memory growth.

const hits = new Map<string, number[]>()

function evictOldestIfNeeded(): void {
  while (hits.size > MAX_MAP_ENTRIES) {
    const firstKey = hits.keys().next().value
    if (firstKey === undefined) break
    hits.delete(firstKey)
  }
}

export function checkBookingRateLimit(ipKey: string, now = Date.now()): boolean {
  const window = hits.get(ipKey)?.filter((t) => now - t < RATE_WINDOW_MS) ?? []
  if (window.length >= RATE_MAX) {
    hits.set(ipKey, window)
    return false
  }
  window.push(now)
  hits.set(ipKey, window)
  evictOldestIfNeeded()
  return true
}

/**
 * SHA-256 the IP with a rotating salt for logs / metrics. Never use the raw
 * IP as identifier in stored data.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${ip}::${salt}`),
  )
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex.slice(0, 32)
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
