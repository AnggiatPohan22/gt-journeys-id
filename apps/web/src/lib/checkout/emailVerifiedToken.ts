/**
 * Email verified token — Phase 4.69.2.
 *
 * Short-lived capability token diterbitkan saat OTP email berhasil
 * diverifikasi. Dikirim bersama submit final ke `/api/bookings/create`
 * untuk membuktikan email verified. Format identik dgn formStamp
 * (Phase 4.62): `<targetHash>.<issuedMs>.<hex-hmac-sha256>`.
 *
 * TTL 30 menit (sama dgn formStamp max age) supaya window verify →
 * submit tidak terlalu ketat.
 *
 * Single-use: endpoint `/api/bookings/create` nanti verify token +
 * cek bahwa token's targetHash == hash dari `customerEmail` yang
 * dikirim di form. Kalau user ubah email setelah verify → hash tidak
 * match → reject.
 */

import { requireEnv } from '@lib/env'

const SECRET = requireEnv(
  'BOOKING_FORM_SECRET',
  import.meta.env.BOOKING_FORM_SECRET,
  'dnj-dev-booking-secret-change-in-prod',
)

const TTL_MS = 30 * 60 * 1000

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let out = ''
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0')
  return out
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/** Issue token setelah OTP sukses. `targetHash` = SHA-256(email || salt). */
export async function issueEmailVerifiedToken(targetHash: string, now: number = Date.now()): Promise<string> {
  const key = await importKey()
  const payload = `${targetHash}.${now}`
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${toHex(sig)}`
}

export type EmailTokenVerdict =
  | { ok: true; targetHash: string; issuedAt: number }
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'expired' }

export async function verifyEmailVerifiedToken(
  token: string | undefined | null,
  now: number = Date.now(),
): Promise<EmailTokenVerdict> {
  if (!token || typeof token !== 'string') return { ok: false, reason: 'malformed' }
  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, reason: 'malformed' }
  const [targetHash, tsPart, sigPart] = parts
  const issued = Number(tsPart)
  if (!targetHash || !issued || !sigPart) return { ok: false, reason: 'malformed' }

  const key = await importKey()
  const sigBytes = new Uint8Array((sigPart.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16)))
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(`${targetHash}.${issued}`),
  )
  if (!valid) return { ok: false, reason: 'bad_signature' }

  if (now - issued > TTL_MS) return { ok: false, reason: 'expired' }

  return { ok: true, targetHash, issuedAt: issued }
}
