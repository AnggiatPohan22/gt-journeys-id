import type { SpamCheckConfig, SpamCheckContext, SpamCheckResult } from './types'
import { sha256Hex } from './crypto-utils'

/**
 * Composite spam checks — Phase 4.50.4.
 *
 * Layer 3 (backend validation), 4 (bot signals), 5 (IP controls) diagregat
 * di sini karena banyak signal cheap yang bisa fail-fast tanpa network call.
 *
 * Ordering: fail-fast dari yang paling murah:
 *   1. Length min/max
 *   2. Honeypot (bila enabled)
 *   3. Timing (bila enabled)
 *   4. Blocked keywords / patterns
 *   5. Duplicate consecutive (butuh contentHash caller)
 *   6. UA blocklist
 *   7. IP blocklist / country control
 *
 * Return generic `SpamCheckResult` — caller catat ke chat-blocked-events
 * dengan layer + ruleTriggered. Context field dipakai untuk snapshot
 * diagnostik (mis. { keyword: '***', matchedAt: 12 }).
 */

const KNOWN_BOT_UA_PATTERNS = [
  /curl\//i,
  /python-requests/i,
  /Go-http-client/i,
  /Java\//i,
  /wget/i,
  /HeadlessChrome/i,
  /PhantomJS/i,
  /scrapy/i,
]

function matchesAnyRegex(value: string, patterns: RegExp[]): boolean {
  return patterns.some((r) => r.test(value))
}

/** Basic CIDR / exact IP match. IPv4 only untuk sekarang; IPv6 support datang belakangan. */
function ipInBlocklist(ip: string, blocklist: string[]): boolean {
  if (!ip || ip === 'unknown') return false
  for (const entry of blocklist) {
    if (!entry) continue
    if (entry === ip) return true
    if (entry.includes('/')) {
      // Naive CIDR check: prefix match on dotted octets.
      const [range, bitsStr] = entry.split('/')
      const bits = parseInt(bitsStr, 10)
      if (!range || !Number.isFinite(bits)) continue
      const rangeParts = range.split('.').map((n) => parseInt(n, 10))
      const ipParts = ip.split('.').map((n) => parseInt(n, 10))
      if (rangeParts.length !== 4 || ipParts.length !== 4) continue
      if (rangeParts.some((n) => !Number.isFinite(n)) || ipParts.some((n) => !Number.isFinite(n))) continue
      const rangeInt = ((rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3]) >>> 0
      const ipInt = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
      if ((rangeInt & mask) === (ipInt & mask)) return true
    }
  }
  return false
}

export async function runSpamChecks(
  ctx: SpamCheckContext,
  cfg: SpamCheckConfig,
): Promise<SpamCheckResult> {
  const content = (ctx.content ?? '').trim()

  // ── Layer 3: Length ────────────────────────────────────────────────
  if (content.length < cfg.minMessageLength) {
    return {
      ok: false,
      ruleTriggered: 'length-below-min',
      layer: 'backendValidation',
      context: { length: content.length, min: cfg.minMessageLength },
    }
  }
  if (content.length > cfg.maxMessageLength) {
    return {
      ok: false,
      ruleTriggered: 'length-above-max',
      layer: 'backendValidation',
      context: { length: content.length, max: cfg.maxMessageLength },
    }
  }

  // ── Layer 4: Honeypot ──────────────────────────────────────────────
  if (cfg.enableHoneypot && ctx.honeypotValue && ctx.honeypotValue.trim() !== '') {
    return {
      ok: false,
      ruleTriggered: 'honeypot',
      layer: 'botSignals',
      context: { honeypotLength: ctx.honeypotValue.length },
    }
  }

  // ── Layer 4: Timing ────────────────────────────────────────────────
  if (
    cfg.enableTimingCheck &&
    typeof ctx.formOpenedAt === 'number' &&
    typeof ctx.submittedAt === 'number'
  ) {
    const delta = ctx.submittedAt - ctx.formOpenedAt
    if (delta < cfg.minFormFillMs) {
      return {
        ok: false,
        ruleTriggered: 'timing-too-fast',
        layer: 'botSignals',
        context: { deltaMs: delta, minMs: cfg.minFormFillMs },
      }
    }
  }

  // ── Layer 3: Keywords ──────────────────────────────────────────────
  const lower = content.toLowerCase()
  for (const kw of cfg.blockedKeywords) {
    if (kw && lower.includes(kw.toLowerCase())) {
      return {
        ok: false,
        ruleTriggered: 'keyword-blocklist',
        layer: 'backendValidation',
        context: { keyword: kw.slice(0, 6) + (kw.length > 6 ? '…' : '') },
      }
    }
  }

  // ── Layer 3: Regex patterns ────────────────────────────────────────
  for (const p of cfg.blockedPatterns) {
    if (!p?.pattern) continue
    try {
      const re = new RegExp(p.pattern, p.flags ?? 'i')
      if (re.test(content)) {
        return {
          ok: false,
          ruleTriggered: 'pattern-blocklist',
          layer: 'backendValidation',
          context: { pattern: p.pattern.slice(0, 32) },
        }
      }
    } catch {
      // Invalid regex di CMS — skip, log ke audit endpoint side.
    }
  }

  // ── Layer 3: Duplicate consecutive ─────────────────────────────────
  if (cfg.blockDuplicateConsecutive && ctx.previousContentHash) {
    const currentHash = await sha256Hex(content)
    if (currentHash === ctx.previousContentHash) {
      return {
        ok: false,
        ruleTriggered: 'duplicate-consecutive',
        layer: 'backendValidation',
        context: {},
      }
    }
  }

  // ── Layer 4: User-Agent blocklist ──────────────────────────────────
  if (cfg.enableUserAgentCheck && ctx.userAgent) {
    if (matchesAnyRegex(ctx.userAgent, KNOWN_BOT_UA_PATTERNS)) {
      return {
        ok: false,
        ruleTriggered: 'ua-known-bot',
        layer: 'botSignals',
        context: { ua: ctx.userAgent.slice(0, 60) },
      }
    }
    for (const raw of cfg.customBlockedUserAgents ?? []) {
      if (!raw) continue
      try {
        const re = new RegExp(raw, 'i')
        if (re.test(ctx.userAgent)) {
          return {
            ok: false,
            ruleTriggered: 'ua-custom',
            layer: 'botSignals',
            context: { pattern: raw.slice(0, 32) },
          }
        }
      } catch {
        /* invalid regex, skip */
      }
    }
  }

  // ── Layer 5: IP blocklist ──────────────────────────────────────────
  if (cfg.ipToCheck && ipInBlocklist(cfg.ipToCheck, cfg.blockedIps ?? [])) {
    return {
      ok: false,
      ruleTriggered: 'ip-blocklist',
      layer: 'ipControls',
      context: {},
    }
  }

  // ── Layer 5: Country control ───────────────────────────────────────
  if (cfg.countryMode !== 'off' && ctx.country) {
    const listed = (cfg.countryCodes ?? []).map((c) => c.toUpperCase()).includes(ctx.country.toUpperCase())
    if (cfg.countryMode === 'allowlist' && !listed) {
      return {
        ok: false,
        ruleTriggered: 'country-not-in-allowlist',
        layer: 'ipControls',
        context: { country: ctx.country },
      }
    }
    if (cfg.countryMode === 'blocklist' && listed) {
      return {
        ok: false,
        ruleTriggered: 'country-in-blocklist',
        layer: 'ipControls',
        context: { country: ctx.country },
      }
    }
  }

  return { ok: true }
}
