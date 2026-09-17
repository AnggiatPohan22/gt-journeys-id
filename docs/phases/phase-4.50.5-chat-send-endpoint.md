# Phase 4.50.5 — POST /api/chat/send endpoint (orchestrator + providers + audit)

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner UAT (butuh env vars + KV binding + `ANTHROPIC_API_KEY`)
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7)
**Scope:** 1 endpoint + orchestrator + 2 provider adapter + audit store. Consume lib dari Phase 4.50.4. Zero schema change.

## Motivasi

Setelah lib security (4.50.4) siap, phase ini menghadirkan endpoint konkret yang meng-orkestrasi semua layer untuk AI chatbot channel (dan stub untuk Email backend-mode). Setelah phase ini, admin bisa test end-to-end via cURL sebelum panel UI (4.50.6).

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/web/src/lib/chat/store.ts](../../apps/web/src/lib/chat/store.ts) | **NEW** — `PayloadChatStore` + `NoopChatStore`, REST client untuk 3 audit collection |
| [apps/web/src/lib/chat/providers/types.ts](../../apps/web/src/lib/chat/providers/types.ts) | **NEW** — `ChannelProvider` interface |
| [apps/web/src/lib/chat/providers/ai-anthropic.ts](../../apps/web/src/lib/chat/providers/ai-anthropic.ts) | **NEW** — Anthropic Messages API adapter (non-streaming, MVP) |
| [apps/web/src/lib/chat/providers/email.ts](../../apps/web/src/lib/chat/providers/email.ts) | **NEW** — Email STUB provider (log-only; real SMTP di follow-up) |
| [apps/web/src/lib/chat/orchestrator.ts](../../apps/web/src/lib/chat/orchestrator.ts) | **NEW** — `handleChatSend(input)` — 5-layer pipeline + provider dispatch + audit |
| [apps/web/src/pages/api/chat/send.ts](../../apps/web/src/pages/api/chat/send.ts) | **NEW** — thin Astro API endpoint (`prerender = false`) |

## Pipeline flow

```
POST /api/chat/send
  ↓
Parse body { channelIndex, message, sessionId, turnstileToken?, honeypot?, formOpenedAt? }
  ↓
getChatWidget() from CMS
  ↓
Resolve channel by index. Reject bila WA/LiveChat (client-side redirect).
  ↓
[env check] CHAT_IP_HASH_SALT & CHAT_VISITOR_COOKIE_SECRET min 16 char
  ↓
Extract IP + country (cf-connecting-ip, cf-ipcountry) → HMAC hash
  ↓
Resolve visitor cookie (mint bila baru) → mark isNew untuk Set-Cookie
  ↓
Upsert chat-visitors (baseline; belum increment messageCount)
  ↓
── Layer 5 (ipControls) + Layer 3 (backendValidation) + Layer 4 (botSignals) ──
Prefetch prevContentHash utk dedup consecutive
runSpamChecks(content, prevHash, honeypot, timing, UA, IP, country)
Fail → writeBlockedEvent + reject (blocked/invalid_message)
  ↓
── Layer 1 (rateLimit) ──
Load rules dari widget.rateLimitRules (fallback default 5/60s/ip/block)
Store = KV kalau ada, else Memory (dev)
checkRateLimits() — semua rule di-AND
Fail → writeBlockedEvent + reject (rate_limited, Retry-After header)
  ↓
── Layer 2 (humanVerification) ──
Bila verificationProvider ≠ 'none' & channel di whitelist:
  createVerificationVerifier(env.TURNSTILE_SECRET_KEY, env.RECAPTCHA_SECRET_KEY).verify(token, ip, minScore)
Fail → writeBlockedEvent + reject (verification_failed)
  ↓
Compute sha256(content) → contentHash
  ↓
writeMessage(direction=in, wasBlocked=false, contentHash, contentLength, content, verificationScore?)
  ↓
Provider dispatch:
  - aiChatbotChannel → AnthropicProvider.reply()
  - emailChannel → EmailLogProvider.reply() (stub OK)
Fail → writeMessage(direction=out, wasBlocked=true, blockReason) → reject (provider_error, 502)
  ↓
writeMessage(direction=out, contentHash, content, providerMeta)
upsertVisitor(incrementMessage=true)
  ↓
Return { ok: true, reply, messageId } + Set-Cookie (bila visitor baru)
```

## Design decisions

### Thin controller pattern

Endpoint = ~80 baris. Semua logic di orchestrator. Ganti provider = ganti class di `pickProvider`. Ganti store = ganti factory di orchestrator. Mengikuti pola `newsletter-subscribe.ts` yang sudah ada di codebase.

### Response codes (client-friendly, no signal leak)

Client dapat 8 code stabil:
- `invalid_body` (400), `invalid_message` (400)
- `channel_not_found` (404), `channel_disabled` (403)
- `rate_limited` (429) — dengan `Retry-After` header + `retryAfterSeconds` di body
- `verification_failed` (403)
- `blocked` (403) — generic; TIDAK bocorkan `ruleTriggered` (spammer tidak bisa reverse-engineer rule)
- `provider_error` (502), `misconfigured` (500)

Detail `ruleTriggered` hanya masuk ke `chat-blocked-events` untuk admin forensics — bukan response body.

### Audit fail-soft

Kalau CMS unreachable saat `store.writeMessage()`, endpoint TIDAK reject user. Spam prevention tetap jalan (KV rate-limit + Turnstile verify + spam-checks in-memory). Audit hanya untuk forensics — data loss di audit ≠ security failure.

### Provider abstraction

`ChannelProvider` interface trivial (`reply(input) → { ok, reply?, code? }`). Nambah provider:
1. Buat file `apps/web/src/lib/chat/providers/foo.ts` implement interface
2. Tambah 1 branch di `pickProvider` di orchestrator
3. Zero perubahan endpoint/security lib.

### Streaming (SSE) — deferred

MVP non-streaming. Untuk streaming Anthropic:
- Response `Content-Type: text/event-stream`
- Endpoint handler return `ReadableStream`
- Payload audit `writeMessage` outbound baru di-execute setelah stream selesai
- Frontend consume `EventSource`
Datang di Phase 4.50.6 bersama panel UI.

### KV binding access

Cloudflare adapter expose bindings di `Astro.locals.runtime.env.<BINDING_NAME>`. Endpoint fallback: kalau `locals.runtime` absent (dev tanpa wrangler), pakai `MemoryRateLimitStore` (in-memory, per-isolate). Ini deterministic untuk unit test; production wajib set `CHAT_RATE_LIMIT_KV` binding.

## Env vars & KV binding yang dibutuhkan

**apps/web/.dev.vars** (dev, gitignored):
```
CMS_URL=http://localhost:3030
PAYLOAD_API_KEY=<same as newsletter>
CHAT_IP_HASH_SALT=<random 32+ char, JANGAN diganti setelah prod>
CHAT_VISITOR_COOKIE_SECRET=<random 32+ char>
ANTHROPIC_API_KEY=<sk-ant-...>
# Optional
TURNSTILE_SECRET_KEY=
RECAPTCHA_SECRET_KEY=
```

**wrangler config** (prod, di `apps/web/wrangler.jsonc`):
```jsonc
{
  "vars": {},  // secrets via `wrangler secret put ...`
  "kv_namespaces": [
    { "binding": "CHAT_RATE_LIMIT_KV", "id": "<from: wrangler kv:namespace create chat-rl>" }
  ]
}
```

Set secrets:
```bash
wrangler secret put CHAT_IP_HASH_SALT
wrangler secret put CHAT_VISITOR_COOKIE_SECRET
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY  # optional
```

## Impact

- **Database**: no schema change. Populates `chat-visitors`, `chat-messages`, `chat-blocked-events` bila endpoint dipanggil.
- **CMS**: no change. Admin bisa lihat audit trail di 3 collection setelah traffic.
- **Frontend**: **belum ada consumer**. Panel UI + fetch call datang Phase 4.50.6. Endpoint bisa di-test via cURL dulu.
- **Routes**: `POST /api/chat/send` baru (prerender=false).
- **Deploy**: web only, tapi WAJIB set env + KV sebelum go-live untuk AI channel.

## Testing (manual via cURL)

Setelah env di-set + dev server jalan (`pnpm --filter @dn-journeys/web dev`):

**1. Basic invalid body**:
```bash
curl -X POST http://localhost:4321/api/chat/send \
  -H "content-type: application/json" -d '{}'
# → 400 { ok:false, code:"invalid_body" }
```

**2. Channel not found** (belum config AI channel di CMS):
```bash
curl -X POST http://localhost:4321/api/chat/send \
  -H "content-type: application/json" \
  -d '{"channelIndex":99,"message":"hi","sessionId":"test-1"}'
# → 404 { ok:false, code:"channel_not_found" }
```

**3. Length too short** (setelah admin tambah AI block di CMS, index 1):
```bash
curl -X POST http://localhost:4321/api/chat/send \
  -H "content-type: application/json" \
  -d '{"channelIndex":1,"message":"a","sessionId":"test-1"}'
# → 400 { ok:false, code:"invalid_message" }
# Audit di /admin/collections/chat-blocked-events akan ada row layer=backendValidation, ruleTriggered=length-below-min
```

**4. Rate limit** (invoke 6× cepat, default rule 5/60s):
```bash
for i in 1 2 3 4 5 6; do
  curl -X POST http://localhost:4321/api/chat/send \
    -H "content-type: application/json" \
    -d '{"channelIndex":1,"message":"halo","sessionId":"rl-test"}'
done
# → 5× 200 (bila AI channel + ANTHROPIC_API_KEY set) atau 502; ke-6 = 429 with Retry-After
```

**5. Happy path** (AI channel + ANTHROPIC_API_KEY set):
```bash
curl -X POST http://localhost:4321/api/chat/send \
  -H "content-type: application/json" \
  -d '{"channelIndex":1,"message":"Halo, ada tour ke Nusa Penida?","sessionId":"chat-1"}'
# → 200 { ok:true, reply:"...", messageId:"..." }
# Audit: /admin/collections/chat-messages ada 2 row (direction=in, direction=out)
# /admin/collections/chat-visitors: 1 row baru (visitorId hex, ipHash HMAC)
```

**6. Cookie roundtrip** (visitor persistence):
```bash
curl -X POST http://localhost:4321/api/chat/send \
  -H "content-type: application/json" \
  -c /tmp/cookies.txt -b /tmp/cookies.txt \
  -d '{"channelIndex":1,"message":"first","sessionId":"session-a"}'
# Set-Cookie: __cwvid=<32hex>.<32hex>; ...

curl -X POST http://localhost:4321/api/chat/send \
  -H "content-type: application/json" \
  -c /tmp/cookies.txt -b /tmp/cookies.txt \
  -d '{"channelIndex":1,"message":"second","sessionId":"session-a"}'
# Reuse visitor; chat-visitors.messageCount naik jadi 2
```

**7. Duplicate consecutive** (kalau blockDuplicateConsecutive=true):
```bash
# Kirim 2× isi persis sama di session yg sama → yg kedua di-block
```

## Rollback

1. `git revert <commit-hash>` → hapus endpoint + orchestrator + provider + store.
2. Data audit di 3 collection tetap ada (tidak dihapus) — bisa di-drop manual bila mau.
3. Env vars & KV binding tetap valid untuk consumer lain (kalau ada) — bisa dihapus bila tidak dipakai.

## Security notes

- **No PII leak di response**: hanya code stable (`blocked`, `rate_limited`), tidak ada rule name.
- **IP hash truncated 128-bit**: cukup uniqueness, GDPR-friendly.
- **Cookie signed**: forge = butuh secret. Constant-time compare.
- **Anthropic secret dari env, bukan CMS raw**: admin isi `apiKeyRef` = "ANTHROPIC_API_KEY", bukan raw key.
- **Fail-closed pada config lemah**: salt/secret < 16 char → 500 misconfigured, bukan silent bypass.
- **Provider error tidak leak stack ke response**: cukup `provider_error` + audit context di CMS untuk debug.

## Next Steps

- **Phase 4.50.6** — Frontend AI panel UI (chat thread + input + Turnstile widget mount + honeypot + cooldown button). `ChatWidget.astro` di-extend: AI channel `disabled=false`, mode='panel' fungsional. Fetch call ke `/api/chat/send`. Streaming SSE upgrade.
- **Phase 4.50.7** — Retention cron via wrangler cron trigger (purge `chat-messages.content` + delete old rows setelah `auditRetentionDays`). Documentation sweep.
- **Follow-up terpisah** — Email provider real (Resend / Postmark / SMTP) menggantikan `EmailLogProvider` stub.
