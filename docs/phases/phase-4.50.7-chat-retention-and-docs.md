# Phase 4.50.7 — Chat retention cron + doc sweep

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner UAT (setelah env `CHAT_RETENTION_CRON_KEY` set)
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7)
**Scope:** Retention job (lib + CLI + HTTP + cron trigger) + dokumentasi (PROGRESS, RUNBOOK, DECISION-LOG, CONTENT-MODEL). Closing phase seri 4.50.

## Motivasi

Setelah 3 audit collection (`chat-visitors`, `chat-messages`, `chat-blocked-events`) mulai menerima traffic (Phase 4.50.5 endpoint aktif), tabel akan tumbuh cepat. Owner sudah pilih `auditRetentionDays` default 30 di Phase 4.50.1 — sekarang implementasi job yang enforce itu. Sekalian sweep dokumentasi supaya seri 4.50 tercatat rapi di reference docs.

## Design keputusan retention

### 2-fase purge (bukan 1× delete)

```
day 0 ────────── day retentionDays/2 ─────────── day retentionDays
   [row full]              [row w/o content]              [deleted]
```

- **Fase 1 (`retentionDays / 2`)**: purge `chat-messages.content` (raw body). `contentHash` + `contentLength` + `wasBlocked` + `blockReason` + `context` (JSON) tetap ada. Rasional: forensik "berapa banyak spam attempt di hari X" & dedup detection masih jalan tanpa raw text visitor.
- **Fase 2 (`retentionDays`)**: hard delete row `chat-messages` + `chat-blocked-events`.
- **`chat-visitors`**: TIDAK di-delete otomatis di phase ini — cookie visitor lifetime bisa lebih panjang (default 90 hari). Archive job optional di follow-up.

Kalau `auditRetentionDays = 0` atau kosong → skip (retain forever) — admin bisa disable via CMS tanpa deploy code.

### Batching + iteration guard

Setiap fase pakai batch `limit: 100` × max 50 iterasi = ceiling 5000 row per fase per run. Cukup untuk daily cron di traffic normal; hard cap supaya CPU-limit Cloudflare Workers tidak trip di run pertama setelah retention di-enable di database besar. Bila lag, run berikut lanjutkan sisanya (idempotent by `createdAt < cutoff` filter).

### Idempotent + fail-soft

- Setiap iteration query fresh — kalau collection sudah bersih, break early.
- `.catch(() => null)` per delete — 1 row bermasalah tidak block sisanya.
- Bila CMS/DB unreachable saat cron fires → HTTP endpoint return `server_error`, cron trigger akan retry di siklus berikut (Cloudflare guarantees at-least-once).

### 3 cara invoke (progressive escalation)

| Cara | Kapan pakai |
|---|---|
| `pnpm --filter @dn-journeys/cms retention:chat` (CLI) | Manual / debug / one-off / testing di dev |
| `POST /api/chat-retention` dengan `x-cron-key` header | External cron (cron-job.org, GitHub Actions, `curl` dari mesin lain) |
| Cloudflare Workers cron trigger (`wrangler.toml [triggers] crons`) | Production default — daily 03:00 UTC |

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/cms/src/lib/chat-retention.ts](../../apps/cms/src/lib/chat-retention.ts) | **NEW** — `runChatRetention(payload)` 2-fase idempotent |
| [apps/cms/src/scripts/chat-retention.ts](../../apps/cms/src/scripts/chat-retention.ts) | **NEW** — CLI wrapper (`pnpm retention:chat`) |
| [apps/cms/src/app/(payload)/api/chat-retention/route.ts](../../apps/cms/src/app/(payload)/api/chat-retention/route.ts) | **NEW** — HTTP endpoint gated by `CHAT_RETENTION_CRON_KEY` |
| [apps/cms/package.json](../../apps/cms/package.json) | Register script `retention:chat` |
| [apps/cms/wrangler.toml](../../apps/cms/wrangler.toml) | Tambah `[triggers] crons = ["0 3 * * *"]` |
| [docs/03-CONTENT-MODEL.md](../03-CONTENT-MODEL.md) | Update row Floating WA → ChatWidget; tambah row chat-widget global |
| [docs/06-MAINTENANCE-RUNBOOK.md](../06-MAINTENANCE-RUNBOOK.md) | Section 1.9 baru: **Chat Widget** (config walkthrough, AI setup steps, audit trail, retention command) |
| [docs/07-DECISION-LOG.md](../07-DECISION-LOG.md) | **ADR-018** (blocks over array+condition), **ADR-019** (HMAC IP hash), **ADR-020** (rate-limit KV bukan collection); template counter naik ke ADR-021 |
| [docs/PROGRESS.md](../PROGRESS.md) | Row Phase 4.50 komprehensif (7 sub-phase + linked reports) + last-updated timestamp |

## Cron trigger note (Cloudflare Workers)

`[triggers] crons = ["0 3 * * *"]` di `wrangler.toml` menjadwalkan wakeup Worker, tapi OpenNext adapter untuk Next.js **belum otomatis** wire event `scheduled` ke fetch endpoint. Untuk full-otomatis prod:

**Opsi A (recommended)**: tambah scheduled handler custom di worker entry:

```ts
// Post-processed di .open-next/worker.js — atau di custom entry:
export default {
  fetch: openNextHandler,  // existing
  async scheduled(event, env, ctx) {
    await fetch(`${env.SERVER_URL}/api/chat-retention`, {
      method: 'POST',
      headers: { 'x-cron-key': env.CHAT_RETENTION_CRON_KEY },
    })
  },
}
```

**Opsi B**: pakai external cron (cron-job.org / GitHub Actions scheduled workflow) yang POST ke `/api/chat-retention` — no code change, tapi bergantung pada external service.

**Opsi C**: sementara manual `pnpm retention:chat` sekali seminggu — cukup untuk MVP traffic rendah.

Config di `wrangler.toml` sudah siap; wire event ke fetch = follow-up ops task (bukan code refactor). Didokumentasikan di runbook 1.9 supaya admin tahu 3 opsi.

## Env vars yang perlu di-set

```bash
# CMS side
wrangler secret put CHAT_RETENTION_CRON_KEY  # min 16 char, random
```

## Testing

- [ ] Local: `cd apps/cms && pnpm retention:chat` → output `[chat-retention] {"ok":true,"redactedContent":0,"deletedMessages":0,"deletedBlockedEvents":0,"reason":"retention_disabled"}` (bila `auditRetentionDays` = 0 di widget).
- [ ] Set `chat-widget.auditRetentionDays = 7` di admin → run ulang → tetap 0 karena data belum lama.
- [ ] Manual insert row `chat-messages` dengan `createdAt` > 8 hari lalu (via DB tool) → run → row content di-null (bila > 3.5 hari) atau di-delete (bila > 7 hari).
- [ ] HTTP endpoint: `curl -X POST -H "x-cron-key: <key>" http://localhost:3030/api/chat-retention` → 200 dengan JSON hasil.
- [ ] HTTP wrong key: `-H "x-cron-key: bad"` → 401.
- [ ] HTTP no key set: unset env `CHAT_RETENTION_CRON_KEY` → 500 `misconfigured`.

## Impact

- **Database**: no schema change. Populates/purges 3 chat audit collection.
- **CMS**: 1 route baru + 1 cron trigger + 1 script. Admin panel unchanged.
- **Frontend**: none.
- **Deploy**: cms only (retention berjalan di worker CMS, bukan web).
- **Docs**: PROGRESS + RUNBOOK + DECISION-LOG + CONTENT-MODEL semua updated.

## Rollback

1. `git revert <commit-hash>` → hapus lib + script + route + cron config + doc updates.
2. Data di 3 chat collection tetap ada (tidak dihapus).
3. Cron trigger di Cloudflare akan berhenti otomatis pada next deploy (config sudah tidak ada).

## Closing Phase 4.50 series

Semua 7 sub-phase selesai code-side:
1. ✅ 4.50.1 Schema + Security 5-layer config
2. ✅ 4.50.2 Data-move migration (idempotent)
3. ✅ 4.50.3 Component cutover (ChatWidget + adapters + BaseLayout mount)
4. ✅ 4.50.4 Security lib (Web Crypto + KV rate-limit + Turnstile/reCAPTCHA + visitor cookie + spam checks)
5. ✅ 4.50.5 Endpoint `/api/chat/send` + orchestrator + Anthropic provider + audit store
6. ✅ 4.50.6 AI panel UI + frontend enforcement + behavior
7. ✅ 4.50.7 Retention cron + docs

**Sisa yang butuh owner**:
- [ ] Run `pnpm --filter @dn-journeys/cms schema:migrate` (init + data-move sudah registered).
- [ ] Run `pnpm --filter @dn-journeys/cms generate:types` untuk regenerate `payload-types.ts`.
- [ ] Config env di dev + prod: `CHAT_IP_HASH_SALT`, `CHAT_VISITOR_COOKIE_SECRET`, `CHAT_RETENTION_CRON_KEY`. Untuk AI: `ANTHROPIC_API_KEY`. Untuk Turnstile: `TURNSTILE_SECRET_KEY` + `verificationSiteKey` di CMS.
- [ ] Provision KV binding `CHAT_RATE_LIMIT_KV` (untuk web app, bila web deploy via wrangler pages).
- [ ] Walkthrough UAT: buka widget di beberapa halaman non-home, verifikasi tampil; test cURL endpoint; add AI channel di CMS lalu test end-to-end conversation.
- [ ] (Opsional prod) Wire Cloudflare `scheduled()` event ke `/api/chat-retention` di CMS worker.

## Follow-up terpisah (bukan blocker phase)

- **Phase 4.51+** — Live chat provider real (Crisp/Tawk/Intercom wire).
- **Streaming SSE upgrade** — endpoint `/api/chat/send` return `ReadableStream`; widget swap fetch ke `EventSource`.
- **Mobile fullscreen sheet** — `mobileFullscreenSheet` config enforcement (breakpoint switch).
- **reCAPTCHA v3 client mount** — endpoint sudah support, frontend hanya perlu grecaptcha.js loader mirror pattern Turnstile.
- **Email real provider** — Resend / Postmark / SMTP replace `EmailLogProvider` stub.
- **Phase 4.53** — deprecate & drop `SiteSettings.whatsappDefaults` (setelah 1–2 release safe).
