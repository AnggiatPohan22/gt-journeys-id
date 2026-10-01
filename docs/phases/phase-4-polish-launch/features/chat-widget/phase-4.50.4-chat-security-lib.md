# Phase 4.50.4 — Chat security library (rate-limit / IP hash / verification / spam checks)

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner UAT (unit sanity + typecheck)
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7)
**Scope:** 8 file baru di `apps/web/src/lib/chat-security/`. Zero consumer, zero schema change, zero migration. Pure library — di-consume Phase 4.50.5.

## Motivasi

Phase 4.50.1 sudah pasang schema config anti-spam (Tab Security 5 layer). Sebelum bikin endpoint API (Phase 4.50.5), pisahkan lib primitives supaya:

1. Endpoint jadi tipis (thin controller pattern seperti `newsletter-subscribe.ts`).
2. Setiap provider (KV/DO/Redis untuk rate-limit; Turnstile/reCAPTCHA untuk verify) di-swap tanpa sentuh consumer.
3. Web Crypto (portable Cloudflare Workers native) — no `nodejs_compat` dependency untuk primitives ini.
4. Testable secara isolated.

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/web/src/lib/chat-security/types.ts](../../apps/web/src/lib/chat-security/types.ts) | **NEW** — 10 interface (`RateLimitRule`, `RateLimitStore`, `IpHasher`, `VerificationVerifier`, `VisitorCookieOptions`, `SpamCheckConfig`, dll.) |
| [apps/web/src/lib/chat-security/crypto-utils.ts](../../apps/web/src/lib/chat-security/crypto-utils.ts) | **NEW** — Web Crypto helpers (`sha256Hex`, `hmacSha256Hex`, `bufferToHex`, `safeEqualHex`) |
| [apps/web/src/lib/chat-security/ip-hasher.ts](../../apps/web/src/lib/chat-security/ip-hasher.ts) | **NEW** — `createIpHasher(salt)` HMAC-SHA256 dengan 128-bit truncation + helper `getClientIp` / `getClientCountry` |
| [apps/web/src/lib/chat-security/rate-limit-store.ts](../../apps/web/src/lib/chat-security/rate-limit-store.ts) | **NEW** — `MemoryRateLimitStore` (dev), `CloudflareKvRateLimitStore` (prod), `checkRateLimit` / `checkRateLimits` |
| [apps/web/src/lib/chat-security/verification.ts](../../apps/web/src/lib/chat-security/verification.ts) | **NEW** — `createVerificationVerifier` (Turnstile + reCAPTCHA v3 siteverify HTTP call) |
| [apps/web/src/lib/chat-security/visitor-cookie.ts](../../apps/web/src/lib/chat-security/visitor-cookie.ts) | **NEW** — `resolveVisitor(request)` + `buildSetCookieHeader` (HMAC-signed cookie, HttpOnly + SameSite=Lax + Secure) |
| [apps/web/src/lib/chat-security/spam-checks.ts](../../apps/web/src/lib/chat-security/spam-checks.ts) | **NEW** — `runSpamChecks(ctx, cfg)` composite untuk Layer 3/4/5 (length, honeypot, timing, keyword, regex, dedup, UA blocklist, IP blocklist, country) |
| [apps/web/src/lib/chat-security/index.ts](../../apps/web/src/lib/chat-security/index.ts) | **NEW** — public API re-export |

## Design decisions

### Web Crypto vs node:crypto

Existing endpoint [newsletter-subscribe.ts](../../apps/web/src/pages/api/newsletter-subscribe.ts) pakai `node:crypto`. Untuk chat-security saya pakai **Web Crypto** (`crypto.subtle`) — alasan:

- Portable ke Cloudflare Workers **tanpa** flag `nodejs_compat` di wrangler.
- Runtime API standard (Web APIs) → runbook lebih stabil kalau Cloudflare rombak compat mode.
- Sedikit lebih lambat karena async, tapi rate-limit path async anyway (KV round-trip).
- Trade-off: 4 line boilerplate `TextEncoder` di `hmacSha256Hex` — worth it.

Kalau nanti mau bergeser semua ke Web Crypto termasuk newsletter, itu refactor terpisah.

### Rate-limit store abstraction

`RateLimitStore` interface hanya 2 method: `increment` + `peek`. Cukup untuk sliding-window fixed. Dua implementasi bawaan:

- `MemoryRateLimitStore` — in-memory Map, cocok test/dev. **Bukan untuk prod** — Cloudflare Workers isolate short-lived, state hilang antar request.
- `CloudflareKvRateLimitStore` — pakai `KVNamespace` binding. TTL native (KV `expirationTtl`). Race antar increment paralel = eventually consistent (bukan hard atomic) — cukup untuk spam prevention. Untuk hard atomic → upgrade ke Durable Object (buat `DoRateLimitStore` implement interface yang sama — zero perubahan di consumer).

Interface `KvBinding` di-declare minimum-shape (bukan import `@cloudflare/workers-types`) supaya lib bisa dipakai di test environment tanpa dependency.

### IP hashing

- HMAC-SHA256 dengan salt di env (`ipHashSaltRef` → `CHAT_IP_HASH_SALT`).
- Truncate ke 128-bit (32 hex) — collision resistance masih ~2^64, cukup untuk audit.
- `createIpHasher` **throw** bila salt < 16 char — bukan silent fallback. Salt lemah = privacy vulnerability nyata.

### Verification

Turnstile + reCAPTCHA v3 pakai HTTP siteverify endpoint. Both fail-closed (`ok=false`) bila:

- `token` kosong
- Secret env-var missing
- fetch error / provider error

reCAPTCHA v3 tambahan: score di-compare dengan `minScore` (default 0.5). Kalau score < minScore, `ok=false` dengan errorCode `score_below_min:0.3`.

### Visitor cookie

- Cookie value: `<id>.<sig>` di mana `sig = HMAC-SHA256(secret, id).slice(0,32)`.
- 128-bit random id via `crypto.getRandomValues` (bukan `Math.random`).
- Verify pakai `safeEqualHex` (constant-time compare) — hindari timing attack pada HMAC.
- `signingSecret < 16 char` → throw at construction (parallel dengan `createIpHasher`).

### Spam-check ordering

Fail-fast dari yang paling murah ke paling mahal:

1. Length (0 network, 0 crypto)
2. Honeypot (string check)
3. Timing (2 timestamp subtract)
4. Keywords / regex (in-memory)
5. Duplicate consecutive (1 SHA-256 — Web Crypto async, tetap cepat)
6. UA blocklist (regex)
7. IP blocklist + country (in-memory)

Return generic `SpamCheckResult` — caller catat ke `chat-blocked-events` dengan `layer` + `ruleTriggered` sesuai schema Phase 4.50.1.

## Scalability

| Upgrade masa depan | Cara zero-consumer-change |
|---|---|
| Durable Object rate-limit (hard atomic) | Buat `DoRateLimitStore implements RateLimitStore` — swap di consumer factory |
| Redis via Hyperdrive | `RedisRateLimitStore` sama pattern |
| hCaptcha / Arkose | Tambah branch di `createVerificationVerifier` + `VerificationProvider` union |
| IPv6 blocklist | Extend `ipInBlocklist` — spam-checks.ts internal, tidak break API |
| Perceptual dedup (Levenshtein / SimHash) | Tambah 1 check di `runSpamChecks` — API tetap |

## Impact

- **Database**: none.
- **CMS**: none.
- **Frontend**: none. Lib belum di-import komponen manapun.
- **Routes**: none. Endpoint datang Phase 4.50.5.
- **Deploy**: none (nothing to deploy sampai ada consumer).

## Env vars yang akan dibutuhkan (Phase 4.50.5)

Tambahkan ke `apps/web/.dev.vars` (dev) & `wrangler.jsonc` secrets (prod):

```
CHAT_IP_HASH_SALT=<random 32+ char>
CHAT_VISITOR_COOKIE_SECRET=<random 32+ char>
# Bila pakai Turnstile:
TURNSTILE_SECRET_KEY=<from cloudflare dashboard>
# Bila pakai reCAPTCHA:
RECAPTCHA_SECRET_KEY=<from google admin console>
```

KV namespace binding (di `wrangler.jsonc`):

```jsonc
{
  "kv_namespaces": [
    { "binding": "CHAT_RATE_LIMIT_KV", "id": "<from wrangler kv:namespace create>" }
  ]
}
```

## Testing

- [x] `pnpm --filter @dn-journeys/web tsc --noEmit` → lib compile clean (verified). 2 error pre-existing (newsletter, payload-types) tidak terkait.
- [ ] Owner sanity (manual): buat file `apps/web/src/lib/chat-security/_sanity.ts` sementara, panggil sebagian fungsi dengan mock KV → hapus setelah verify. Optional; endpoint di 4.50.5 akan implicit-test lib ini.
- [ ] Verify `crypto.getRandomValues` available di Astro dev server (Node 20+ punya native).

## Rollback

1. `git revert <commit-hash>` → hapus 8 file `apps/web/src/lib/chat-security/`.
2. Zero consumer → zero blast radius.

## Next Steps

- **Phase 4.50.5** — `apps/web/src/pages/api/chat/send.ts` endpoint. Thin controller yang:
  1. Ambil chat-widget config (getChatWidget).
  2. Resolve visitor cookie.
  3. Hash IP.
  4. Run rate-limit rules per config.
  5. Verify Turnstile/reCAPTCHA (kalau enabled untuk channel ini).
  6. Run spam checks.
  7. Bila lolos: forward ke channel provider (AI: call Anthropic/OpenAI; Email: send via SMTP/API).
  8. Write audit ke chat-visitors + chat-messages + chat-blocked-events via PAYLOAD_API_KEY.
- **Phase 4.50.6** — Frontend behavior enforcement (Turnstile widget mount, honeypot, cooldown button, dedup client, AI panel UI).
- **Phase 4.50.7** — Retention cron via wrangler cron trigger + doc sweep.
