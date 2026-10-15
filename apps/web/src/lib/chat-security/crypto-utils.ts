/**
 * Web Crypto helpers — Phase 4.50.4.
 *
 * Portable ke Cloudflare Workers native (crypto.subtle) tanpa
 * `nodejs_compat` flag. Semua fungsi async karena Web Crypto memang
 * async — bukan trade-off.
 */

const enc = new TextEncoder()

/** Convert Uint8Array/ArrayBuffer → lowercase hex string. */
export function bufferToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0')
  }
  return out
}

/** SHA-256 hex digest. */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input))
  return bufferToHex(digest)
}

/** HMAC-SHA256 hex digest keyed by `secret`. */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return bufferToHex(sig)
}

/** Constant-time string compare untuk mencegah timing attack pada verifikasi HMAC. */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
