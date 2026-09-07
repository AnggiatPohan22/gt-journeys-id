/**
 * Newsletter — request validators.
 *
 * Kept dependency-free so it can be reused server-side or in tests.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type ValidationResult =
  | { ok: true; email: string }
  | { ok: false; reason: 'invalid_email' | 'honeypot' | 'rate_limited' }

export function validateEmail(raw: unknown): raw is string {
  return typeof raw === 'string' && raw.trim().length <= 254 && EMAIL_RE.test(raw.trim())
}

export function isHoneypotFilled(raw: unknown): boolean {
  return typeof raw === 'string' && raw.trim().length > 0
}

// ── In-memory IP rate-limit (per Worker isolate) ────────────────────
// Best-effort only: multiple Cloudflare isolates → each has its own map.
// Good enough for casual spam; upgrade to KV/Durable Object if abuse escalates.
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5
const hits = new Map<string, number[]>()

export function checkRateLimit(ipKey: string, now = Date.now()): boolean {
  const window = hits.get(ipKey)?.filter((t) => now - t < RATE_WINDOW_MS) ?? []
  if (window.length >= RATE_MAX) {
    hits.set(ipKey, window)
    return false
  }
  window.push(now)
  hits.set(ipKey, window)
  return true
}

export function validate(input: {
  email: unknown
  honeypot?: unknown
  ipKey: string
}): ValidationResult {
  if (isHoneypotFilled(input.honeypot)) return { ok: false, reason: 'honeypot' }
  if (!validateEmail(input.email)) return { ok: false, reason: 'invalid_email' }
  if (!checkRateLimit(input.ipKey)) return { ok: false, reason: 'rate_limited' }
  return { ok: true, email: (input.email as string).trim().toLowerCase() }
}
