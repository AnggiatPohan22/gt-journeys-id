/**
 * Bookings rate-limit — Phase 4.62.1.
 *
 * Best-effort in-memory rate limiter per Worker isolate. Mirrors the pattern
 * in `@lib/newsletter/validators.ts` — good enough for casual spam. If abuse
 * escalates, upgrade to Cloudflare KV or a Durable Object shared across
 * isolates.
 *
 * Sengaja terpisah dari newsletter's map supaya spam newsletter tidak
 * ikut-ikutan menahan submit booking (dan sebaliknya).
 */

const RATE_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const RATE_MAX = 5                     // 5 attempts / window / IP

const hits = new Map<string, number[]>()

export function checkBookingRateLimit(ipKey: string, now = Date.now()): boolean {
  const window = hits.get(ipKey)?.filter((t) => now - t < RATE_WINDOW_MS) ?? []
  if (window.length >= RATE_MAX) {
    hits.set(ipKey, window)
    return false
  }
  window.push(now)
  hits.set(ipKey, window)
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
