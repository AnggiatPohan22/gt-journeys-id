/**
 * OTP helpers — Phase 4.69.2.
 *
 * Generate 6-digit OTP, hash dengan salt, timing-safe compare.
 * Semua pakai Web Crypto (globalThis.crypto.subtle) supaya compatible
 * Cloudflare Workers runtime (Astro adapter).
 *
 * Security notes:
 * - OTP random generated via `crypto.getRandomValues()` (CSPRNG) → bukan
 *   `Math.random()` yang predictable.
 * - Hash = SHA-256(otp || "::" || salt). Salt per-deployment (rotate =
 *   invalidate all pending OTP) di env `OTP_SALT`.
 * - Compare constant-time untuk cegah timing attack walau 6-digit space
 *   kecil (10^6 = 1M, mitigasi utama = attempt-limit + rate-limit).
 */

import { requireEnv } from '@lib/env'

const SALT = requireEnv(
  'OTP_SALT',
  import.meta.env.OTP_SALT as string | undefined,
  'dnj-dev-otp-salt-change-in-prod',
)

const OTP_LENGTH = Number(import.meta.env.OTP_LENGTH ?? 6) || 6
const OTP_TTL_MINUTES = Number(import.meta.env.OTP_TTL_MINUTES ?? 10) || 10

/** Generate numeric OTP (default 6 digit) via CSPRNG. */
export function generateOtp(length: number = OTP_LENGTH): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += (bytes[i] % 10).toString()
  }
  return out
}

/** SHA-256(target || "::" || SALT) → 64 hex chars. Dipakai untuk `targetHash` + `otpHash`. */
export async function hashWithSalt(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${value.trim().toLowerCase()}::${SALT}`),
  )
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

/** Hash OTP (preserve case/digits — tidak lowercase). */
export async function hashOtp(otp: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${otp}::${SALT}`),
  )
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

/** Constant-time string compare (walau target hex 64 char, tetap pakai TimingSafeEqual pattern). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/** ISO string untuk `expiresAt` field. */
export function expiresAtIso(fromMs: number = Date.now()): string {
  return new Date(fromMs + OTP_TTL_MINUTES * 60 * 1000).toISOString()
}

/** Validate email format (shared dgn booking endpoint pattern). */
export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export const OTP_CONFIG = {
  length: OTP_LENGTH,
  ttlMinutes: OTP_TTL_MINUTES,
  maxCheckAttempts: Number(import.meta.env.OTP_MAX_CHECK_ATTEMPTS ?? 5) || 5,
}
