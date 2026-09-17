/**
 * Chat security type contracts — Phase 4.50.4.
 *
 * Shared interfaces untuk multi-layer anti-spam. Semua provider (KV/DO/
 * Redis untuk rate-limit, Turnstile/reCAPTCHA untuk verification) di-
 * abstract lewat interface di sini supaya swap implementasi tidak
 * menyentuh consumer (`/api/chat/*` endpoints).
 */

// ── Rate Limit ──────────────────────────────────────────────────────
export interface RateLimitRule {
  /** Kebab-case ID (mis. "wa-5-per-min"). Muncul di chat-blocked-events.ruleTriggered. */
  id: string
  limitCount: number
  windowSeconds: number
  /** Kunci pembeda counter — ip / visitor / gabungan. */
  keyBy: 'ip' | 'visitor' | 'both'
  /** global = 1 counter untuk semua channel; perChannel = counter terpisah per channelType. */
  scope: 'global' | 'perChannel'
  action: 'block' | 'challenge' | 'log'
}

export interface RateLimitCheckInput {
  rule: RateLimitRule
  ipHash: string
  visitorId?: string
  channelType?: string
  now?: number
}

export interface RateLimitCheckResult {
  allowed: boolean
  ruleId: string
  action: RateLimitRule['action']
  count: number
  limit: number
  windowSeconds: number
  resetAt: number
}

/**
 * Store abstract — sliding-window counter dengan TTL native. Swappable:
 * CloudflareKvRateLimitStore | MemoryRateLimitStore | (future) DoStore.
 */
export interface RateLimitStore {
  /** Increment counter untuk (key, windowSeconds). Return count baru + resetAt (epoch ms). */
  increment(key: string, windowSeconds: number, now?: number): Promise<{ count: number; resetAt: number }>
  /** Peek counter tanpa increment (untuk log/allowed=false path). */
  peek(key: string, windowSeconds: number, now?: number): Promise<{ count: number; resetAt: number }>
}

// ── IP Hashing ──────────────────────────────────────────────────────
export interface IpHasher {
  hash(ip: string): Promise<string>
}

// ── Verification (Turnstile / reCAPTCHA v3) ─────────────────────────
export type VerificationProvider = 'none' | 'turnstile' | 'recaptcha_v3'

export interface VerifyInput {
  provider: VerificationProvider
  token: string
  remoteIp?: string
  /** Untuk reCAPTCHA v3, threshold minimum score (0.0-1.0). Ignored by Turnstile. */
  minScore?: number
}

export interface VerifyResult {
  ok: boolean
  provider: VerificationProvider
  score?: number
  errorCodes?: string[]
  raw?: unknown
}

export interface VerificationVerifier {
  verify(input: VerifyInput): Promise<VerifyResult>
}

// ── Visitor Cookie ──────────────────────────────────────────────────
export interface VisitorCookieOptions {
  name: string
  ttlDays: number
  /** Secret env-var value untuk HMAC sign cookie (bukan raw signature — value HMAC). */
  signingSecret: string
}

export interface VisitorIdentity {
  visitorId: string
  isNew: boolean
}

// ── Spam Check Composite ────────────────────────────────────────────
export interface SpamCheckContext {
  content: string
  previousContentHash?: string
  formOpenedAt?: number
  submittedAt?: number
  honeypotValue?: string
  userAgent?: string
  country?: string
}

export interface SpamCheckConfig {
  minMessageLength: number
  maxMessageLength: number
  blockDuplicateConsecutive: boolean
  blockedKeywords: string[]
  blockedPatterns: Array<{ pattern: string; flags?: string }>
  enableHoneypot: boolean
  enableTimingCheck: boolean
  minFormFillMs: number
  enableUserAgentCheck: boolean
  customBlockedUserAgents: string[]
  blockedIps: string[]
  countryMode: 'off' | 'allowlist' | 'blocklist'
  countryCodes: string[]
  ipToCheck?: string
}

export interface SpamCheckResult {
  ok: boolean
  ruleTriggered?: string
  layer?: 'backendValidation' | 'botSignals' | 'ipControls'
  context?: Record<string, unknown>
}
