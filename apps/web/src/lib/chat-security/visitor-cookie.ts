import type { VisitorCookieOptions, VisitorIdentity } from './types'
import { hmacSha256Hex, safeEqualHex } from './crypto-utils'

/**
 * Visitor cookie — Phase 4.50.4.
 *
 * Format cookie value: `<id>.<sig>` di mana:
 *   - id  : 16-byte hex random ID (32 char)
 *   - sig : HMAC-SHA256(signingSecret, id).slice(0, 32)
 *
 * Server-signed → visitor tidak bisa forge cookie tanpa secret. HttpOnly
 * + SameSite=Lax + Secure — set di Set-Cookie header oleh consumer.
 *
 * Tidak menyimpan PII di cookie. Cross-session correlation dilakukan di
 * server via `chat-visitors` collection (relasi visitorId → ipHash).
 */

function generateRandomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  let out = ''
  for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, '0')
  return out
}

/** Parse Cookie header → map. */
function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const k = part.slice(0, eq).trim()
    const v = part.slice(eq + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

async function signId(id: string, secret: string): Promise<string> {
  const hex = await hmacSha256Hex(secret, id)
  return hex.slice(0, 32)
}

/**
 * Baca cookie dari request; verifikasi signature. Kalau tidak ada atau
 * invalid → mint fresh visitorId. Consumer tanggung jawab set Set-Cookie
 * di response bila `isNew=true` (atau selalu untuk rolling expiry).
 */
export async function resolveVisitor(
  request: Request,
  opts: VisitorCookieOptions,
): Promise<VisitorIdentity> {
  if (!opts.signingSecret || opts.signingSecret.length < 16) {
    throw new Error('[chat-security] visitor signingSecret harus min 16 char.')
  }
  const cookies = parseCookies(request.headers.get('cookie'))
  const raw = cookies[opts.name]

  if (raw) {
    const dot = raw.indexOf('.')
    if (dot > 0) {
      const id = raw.slice(0, dot)
      const sig = raw.slice(dot + 1)
      const expected = await signId(id, opts.signingSecret)
      if (safeEqualHex(sig, expected) && /^[0-9a-f]{32}$/.test(id)) {
        return { visitorId: id, isNew: false }
      }
    }
  }

  // Mint fresh
  const id = generateRandomHex(16)
  return { visitorId: id, isNew: true }
}

/**
 * Build Set-Cookie header value untuk visitor cookie. Consumer append ke
 * response headers. `secure` default true — di dev tanpa HTTPS override
 * ke false via optional flag.
 */
export async function buildSetCookieHeader(
  identity: VisitorIdentity,
  opts: VisitorCookieOptions & { secure?: boolean; sameSite?: 'Lax' | 'Strict' | 'None' },
): Promise<string> {
  const sig = await signId(identity.visitorId, opts.signingSecret)
  const value = `${identity.visitorId}.${sig}`
  const maxAge = Math.max(0, Math.floor(opts.ttlDays * 86400))
  const parts = [
    `${opts.name}=${encodeURIComponent(value)}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=${opts.sameSite ?? 'Lax'}`,
  ]
  if (opts.secure !== false) parts.push('Secure')
  return parts.join('; ')
}
