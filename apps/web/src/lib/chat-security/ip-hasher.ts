import type { IpHasher } from './types'
import { hmacSha256Hex } from './crypto-utils'

/**
 * IP hasher — HMAC-SHA256(salt, ip). Salt di env (rotasi = invalidate
 * history, sesuai audit privacy). Truncated ke 32 hex char (128 bit) —
 * cukup untuk uniqueness ratusan juta record tanpa collision, hemat storage.
 */
export function createIpHasher(salt: string): IpHasher {
  if (!salt || salt.length < 16) {
    // Fail loud di runtime — bukan silent fallback. Salt lemah = privacy vuln.
    throw new Error('[chat-security] ipHashSalt harus minimal 16 char. Set env var yang aman.')
  }
  return {
    async hash(ip: string): Promise<string> {
      const normalized = (ip ?? '').trim().toLowerCase()
      if (!normalized) return 'unknown'
      const hex = await hmacSha256Hex(salt, normalized)
      return hex.slice(0, 32)
    },
  }
}

/**
 * Ambil client IP dari Request headers ala Cloudflare Worker.
 * Prioritas cf-connecting-ip (native CF), x-forwarded-for (proxy chain),
 * fallback 'unknown'.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

/** Ambil country dari CF-IPCountry header (Cloudflare set otomatis). */
export function getClientCountry(request: Request): string | undefined {
  const raw = request.headers.get('cf-ipcountry')
  if (!raw || raw === 'XX' || raw === 'T1') return undefined
  return raw.toUpperCase()
}
