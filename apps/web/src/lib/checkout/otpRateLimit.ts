/**
 * OTP rate limit — Phase 4.69.2.
 *
 * In-memory rate limiter khusus endpoint OTP, terpisah dari booking
 * rate-limit supaya satu tidak block yang lain. Pola sama dgn
 * `rateLimit.ts` (Phase 4.62.2 → 4.66.9).
 *
 * Rules (konfigurable via env):
 *   - OTP_RATE_MAX_SEND (default 3) send per OTP_RATE_WINDOW_MINUTES (default 15m)
 *     per IP+target composite key.
 *   - OTP_MAX_CHECK_ATTEMPTS (default 5) check attempt per OTP record
 *     — enforced di endpoint saat verify (bukan di sini).
 */

const WINDOW_MS = (Number(import.meta.env.OTP_RATE_WINDOW_MINUTES ?? 15) || 15) * 60 * 1000
const MAX_SEND = Number(import.meta.env.OTP_RATE_MAX_SEND ?? 3) || 3
const MAX_MAP_ENTRIES = 10_000

const hits = new Map<string, number[]>()

function evictOldestIfNeeded(): void {
  while (hits.size > MAX_MAP_ENTRIES) {
    const firstKey = hits.keys().next().value
    if (firstKey === undefined) break
    hits.delete(firstKey)
  }
}

/**
 * `key` = `${ipHash}::${targetHash}` supaya attacker tidak bisa pakai
 * banyak IP untuk flood 1 email, dan tidak bisa pakai 1 IP untuk flood
 * banyak email beda.
 */
export function checkOtpSendRateLimit(key: string, now: number = Date.now()): boolean {
  const window = hits.get(key)?.filter((t) => now - t < WINDOW_MS) ?? []
  if (window.length >= MAX_SEND) {
    hits.set(key, window)
    return false
  }
  window.push(now)
  hits.set(key, window)
  evictOldestIfNeeded()
  return true
}

export const OTP_RATE_CONFIG = {
  windowMs: WINDOW_MS,
  maxSend: MAX_SEND,
}
