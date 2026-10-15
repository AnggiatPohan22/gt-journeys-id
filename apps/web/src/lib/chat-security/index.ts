/**
 * Chat security public API — Phase 4.50.4.
 *
 * Consumer (endpoint /api/chat/*) hanya perlu import dari '@lib/chat-security'.
 * Semua implementasi detail (KV store, Web Crypto, provider HTTP) tersembunyi.
 */

export type {
  RateLimitRule,
  RateLimitStore,
  RateLimitCheckInput,
  RateLimitCheckResult,
  IpHasher,
  VerificationVerifier,
  VerificationProvider,
  VerifyInput,
  VerifyResult,
  VisitorCookieOptions,
  VisitorIdentity,
  SpamCheckContext,
  SpamCheckConfig,
  SpamCheckResult,
} from './types'

export {
  MemoryRateLimitStore,
  CloudflareKvRateLimitStore,
  checkRateLimit,
  checkRateLimits,
  type KvBinding,
} from './rate-limit-store'

export { createIpHasher, getClientIp, getClientCountry } from './ip-hasher'
export { createVerificationVerifier } from './verification'
export { resolveVisitor, buildSetCookieHeader } from './visitor-cookie'
export { runSpamChecks } from './spam-checks'
export { sha256Hex, hmacSha256Hex, safeEqualHex, bufferToHex } from './crypto-utils'
