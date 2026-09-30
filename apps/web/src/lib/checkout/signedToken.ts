/**
 * Signed timestamp — Phase 4.62.
 *
 * Cheap anti-spam without a package. Every checkout form embeds a hidden
 * field `formStamp` = `<issuedMs>.<hex-hmac-sha256>` signed with
 * `BOOKING_FORM_SECRET`. The API endpoint verifies:
 *   1. HMAC matches → the value came from our own server (not fabricated).
 *   2. `now - issued > 3000ms` → not a bot immediate-submit.
 *   3. `now - issued < 30min`  → not a stale/replayed form.
 *
 * We use Web Crypto (globalThis.crypto.subtle) so this works in the
 * Cloudflare Workers runtime the Astro adapter targets.
 */

import { requireEnv } from '@lib/env'

// Phase 4.66.8 — fail-fast di prod kalau BOOKING_FORM_SECRET kosong.
// Fallback di dev tetap dipertahankan supaya `pnpm dev` tanpa .env
// masih jalan. Kalau ada di prod, throw langsung supaya HMAC signing
// tidak pakai secret yang publik (yang sudah bocor di git).
const SECRET = requireEnv(
  'BOOKING_FORM_SECRET',
  import.meta.env.BOOKING_FORM_SECRET,
  'dnj-dev-booking-secret-change-in-prod',
)
const MIN_AGE_MS = 3_000
const MAX_AGE_MS = 30 * 60 * 1000

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let out = ''
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0')
  return out
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function issueFormStamp(now = Date.now()): Promise<string> {
  const key = await importKey(SECRET)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(now)))
  return `${now}.${toHex(sig)}`
}

export type StampVerdict =
  | { ok: true; issuedAt: number }
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'too_fast' | 'expired' }

export async function verifyFormStamp(stamp: string | undefined | null, now = Date.now()): Promise<StampVerdict> {
  if (!stamp || typeof stamp !== 'string') return { ok: false, reason: 'malformed' }
  const [tsPart, sigPart] = stamp.split('.')
  const issued = Number(tsPart)
  if (!issued || !sigPart) return { ok: false, reason: 'malformed' }

  const key = await importKey(SECRET)
  const sigBytes = new Uint8Array((sigPart.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16)))
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(String(issued)),
  )
  if (!valid) return { ok: false, reason: 'bad_signature' }

  const age = now - issued
  if (age < MIN_AGE_MS) return { ok: false, reason: 'too_fast' }
  if (age > MAX_AGE_MS) return { ok: false, reason: 'expired' }
  return { ok: true, issuedAt: issued }
}
