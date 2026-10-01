# Phase 4.50.6 — AI panel UI + frontend enforcement (Turnstile, honeypot, cooldown, behavior)

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner UAT (butuh env + AI channel di CMS)
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7)
**Scope:** Rewrite `ChatWidget.astro` dengan panel mode swap + AI conversation UI + full client enforcement. Zero schema, zero migration. Endpoint dari Phase 4.50.5 sudah support flow ini.

## Motivasi

Setelah endpoint `/api/chat/send` siap (4.50.5), user butuh UI untuk actually chat dengan AI langsung di popup — bukan hanya kartu disabled dengan tooltip. Selain itu, semua field CMS di Tab Behavior + Security (verificationSiteKey, sendCooldownMs, showDelaySeconds, autoOpenOnceAfter, dst.) belum diterapkan di frontend. Phase ini implementasi semua itu.

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/web/src/lib/chat-channels/types.ts](../../apps/web/src/lib/chat-channels/types.ts) | Tambah `channelIndex: number` + `welcomeMessage?` di `ResolvedChannel` |
| [apps/web/src/lib/chat-channels/whatsapp.ts](../../apps/web/src/lib/chat-channels/whatsapp.ts) | Pass through `channelIndex` |
| [apps/web/src/lib/chat-channels/email.ts](../../apps/web/src/lib/chat-channels/email.ts) | Pass through `channelIndex` |
| [apps/web/src/lib/chat-channels/live_chat.ts](../../apps/web/src/lib/chat-channels/live_chat.ts) | Pass through `channelIndex` |
| [apps/web/src/lib/chat-channels/ai_chatbot.ts](../../apps/web/src/lib/chat-channels/ai_chatbot.ts) | **Unlock**: hapus `disabled: true`; return `mode: 'panel'` + `welcomeMessage` |
| [apps/web/src/components/common/ChatWidget.astro](../../apps/web/src/components/common/ChatWidget.astro) | Rewrite mayor — panel mode swap, chat thread UI, form, honeypot, Turnstile mount, cooldown, dedup, timing, behavior enforcement |

## Feature checklist

### Panel modes
- ✅ **Menu mode** (default): list kartu channel seperti sebelumnya. Klik WA → `wa.me` new tab. Klik Email → `mailto:`. Klik AI → swap ke chat mode.
- ✅ **Chat mode**: header berubah ke label channel + tombol back, thread area (user vs bot bubble), input textarea, char counter, send button, error banner inline. Typing indicator (3 dots animasi) selama request pending.

### Security enforcement (frontend layer)
- ✅ **Honeypot** — hidden field `<input name="website">` di form. Kirim ke `payload.honeypot`; server reject via layer 4 `botSignals`.
- ✅ **Timing check** — `formOpenedAt` = timestamp saat panel dibuka. Server reject bila submit < `minFormFillMs`.
- ✅ **Send cooldown** — `sendCooldownMs` disable button setelah click.
- ✅ **Client min-interval** — reject send bila delta < `clientMinIntervalMs` dari last send (defensive; server otoritatif via rate-limit KV).
- ✅ **Max/min length** — HTML `maxlength` + JS enforce sebelum submit + char counter live.
- ✅ **Duplicate consecutive** — cache last inbound content di memory session; reject re-send identik dengan pesan sebelumnya.
- ✅ **Turnstile invisible mount** — load script `challenges.cloudflare.com/turnstile/v0/api.js` conditionally (bila `verificationProvider=turnstile` & channel type di `verificationChannels[]`). Execute get-token sebelum fetch. Silent untuk user normal.
- ✅ **reCAPTCHA v3 fallback path** — endpoint sudah support (verify() di lib), tapi client mount di widget belum diimplementasi (Turnstile-first). Bila admin pilih reCAPTCHA, endpoint tetap menerima token dari body — client harus di-extend di follow-up (site key di CMS aman untuk client-side; grecaptcha.js loader mirror pattern Turnstile).

### Behavior enforcement (Tab 6 di CMS)
- ✅ **`showDelaySeconds`** — setTimeout sebelum button reveal (opacity 0 → 1 dengan entrance animation).
- ✅ **`showAfterScrollPct`** — scroll listener; reveal saat visitor scroll ≥ N% page height.
- ✅ **`autoOpenOnceAfter`** — auto-open panel sekali per session (sessionStorage marker).
- ✅ **`exitIntentDesktop`** — mouseleave viewport top pada desktop (≥768px) trigger auto-open (sekali per page load).
- ✅ **`dismissible`** — tombol X di header popup; klik = localStorage TTL (`dismissMemoryHours`) → widget hidden sampai TTL lewat.
- ⏸️ **`mobileFullscreenSheet`** — belum diterapkan (popup mobile masih floating card). Datang di follow-up UI polish.

### AI flow
- ✅ Generate `sessionId` (crypto.randomUUID fallback ke Math.random) tiap panel dibuka.
- ✅ Reset thread + welcome message saat AI channel dipilih.
- ✅ Focus input otomatis 50ms setelah swap ke chat mode.
- ✅ Fetch `POST /api/chat/send` dengan `credentials: 'same-origin'` supaya visitor cookie roundtrip.
- ✅ Error handling per code — user-facing message dalam Bahasa Indonesia; tidak leak rule name.
- ✅ Set-Cookie dari server otomatis di-persist browser (visitor cookie).

## Design decisions

### Config serialization

Client config di-serialize sebagai `<script type="application/json" id="chat-widget-config">`. Widget script parse sekali di init. Bukan window global (avoid pollution) dan bukan data-attribute per field (readable + testable).

### Turnstile invisible mode

Pakai `appearance: 'interaction-only'` supaya challenge hanya muncul kalau Cloudflare deem suspicious. User normal experience: zero friction. Bila token gagal di-execute (timeout / no widget), submit tetap dilanjutkan dengan token kosong — server akan reject sebagai `verification_failed` bila channel wajib verify. Ini fail-safe di UX (server otoritatif).

Script Turnstile hanya di-load bila channel yang diklik butuh (guarded di `renderTurnstile`). Kalau widget-nya WA-only, script Turnstile TIDAK di-load — hemat request.

### Response code → user message mapping

Map internal code (`rate_limited`, `blocked`, `verification_failed`) ke Bahasa Indonesia friendly text. TIDAK expose `ruleTriggered` walaupun server pun tidak kirim (double defense).

### Behavior reveal race

`revealButton()` cukup di-panggil sekali (via `revealed` flag). Bila delay & scroll dua-duanya di-set, mana yang duluan lolos akan reveal — TIDAK compound. Ini match ekspektasi admin: "muncul setelah 30% scroll ATAU 5 detik".

### Dismiss vs off-hours hide

Kalau `enableBusinessHours && offlineBehavior === 'hideButton'`, widget masih render — hide di server-side belum diterapkan (butuh timezone-aware compute). Datang di Phase 4.50.7 bersama retention job. Sementara admin cukup pakai `dismissible` untuk visitor manual-hide.

## Type-check status

Verified via `tsc --noEmit`. Zero error dari `apps/web/src/{lib/chat,lib/chat-channels,lib/chat-security,components/common/ChatWidget.astro,pages/api/chat}`. Sisa 2 error pre-existing (`newsletter/index.ts` + `payload-types.ts`) unrelated.

## Impact

- **Database**: none.
- **CMS**: none.
- **Frontend**:
  - Widget sekarang punya 2 view mode (menu + chat AI).
  - Turnstile script (external, ~30KB) hanya di-load per demand.
  - Behavior config CMS diterapkan runtime.
- **Routes**: none baru. Consume endpoint dari 4.50.5.
- **Deploy**: web only.

## Testing (dev, dengan AI block di CMS + env set)

### Prerequisite:
1. `.dev.vars` sudah punya `CHAT_IP_HASH_SALT`, `CHAT_VISITOR_COOKIE_SECRET`, `ANTHROPIC_API_KEY`.
2. Buka `/admin/globals/chat-widget` → Tab Channels → add block "AI Chatbot":
   - label = "Ask AI"
   - provider = "Anthropic (Claude)"
   - model = "claude-haiku-4-5" (atau leave default)
   - systemPrompt = "You are a helpful Bali travel assistant."
   - welcomeMessage = "Hi! Ada yang bisa dibantu tentang layanan kami?"
   - apiKeyRef = "ANTHROPIC_API_KEY"
3. Save.

### Test cases:
- [ ] `pnpm --filter @dn-journeys/web dev` → open homepage.
- [ ] Widget muncul, popup buka menampilkan 2 kartu (WA + Ask AI).
- [ ] Klik "Ask AI" → panel swap ke chat mode; header berubah ke "Ask AI"; welcome message bubble muncul.
- [ ] Input < 2 char → send button disabled.
- [ ] Input "Halo, ada rekomendasi tour?" → send → typing indicator → ~2s → bubble reply dari AI.
- [ ] Klik back arrow → kembali ke menu.
- [ ] Retest AI: character counter live, tidak bisa > maxlength.
- [ ] Send pesan yang sama 2× → yang kedua muncul error "Pesan yang sama sudah dikirim."
- [ ] Set `sendCooldownMs = 3000` di CMS → send → button disabled 3 detik.
- [ ] Loop 6× send cepat → yg ke-6 dapat "Terlalu banyak permintaan. Coba lagi dalam ~detik".
- [ ] Buka `/admin/collections/chat-blocked-events` → ada row `layer=rateLimit`, `ruleTriggered=default-5-per-min`.
- [ ] Buka `/admin/collections/chat-messages` → row per pesan (direction=in + out).
- [ ] Buka `/admin/collections/chat-visitors` → 1 row baru dengan `ipHash` HMAC hex.

### Turnstile test (optional):
- [ ] Set `verificationProvider = turnstile`, isi `verificationSiteKey` (dari Cloudflare), env `TURNSTILE_SECRET_KEY`.
- [ ] Buka widget → klik AI → open network tab → ada request ke `challenges.cloudflare.com/turnstile/v0/api.js`.
- [ ] Send pesan → payload include `turnstileToken`.
- [ ] Bila token invalid (mis. secret salah) → error "Verifikasi gagal".

### Behavior test:
- [ ] Set `showDelaySeconds = 5` → widget hidden 5 detik lalu muncul.
- [ ] Set `autoOpenOnceAfter = 3` → panel auto-open setelah 3 detik (sekali per session).
- [ ] Set `dismissible = true` → tombol X di header muncul; klik = widget hilang sampai `dismissMemoryHours` lewat.
- [ ] Set `showAfterScrollPct = 50` → widget muncul saat scroll 50%.

## Rollback

1. `git revert <commit-hash>` — ChatWidget.astro balik ke versi 4.50.3, adapter AI kembali disabled.
2. Endpoint `/api/chat/send` tetap eksis (Phase 4.50.5). Bila mau full rollback, lakukan revert Phase 4.50.5 juga.
3. Zero DB / migration impact.

## Known limitations & follow-ups

- **Streaming SSE** — MVP non-streaming. Full-response setelah AI selesai. Untuk streaming: endpoint upgrade ke `ReadableStream`, widget swap `fetch` ke `EventSource`. Datang di Phase 4.50.8+ (optional).
- **Mobile fullscreen sheet** — `mobileFullscreenSheet` config belum diterapkan. Sekarang popup mobile floating card dengan max-width. Butuh CSS breakpoint + JS layout switch — follow-up.
- **reCAPTCHA v3 client mount** — endpoint support, tapi widget hanya mount Turnstile. Untuk switch, tambah `loadRecaptchaScript` + `grecaptcha.execute()` (mirror Turnstile). Follow-up.
- **Message persistence lintas session** — thread hilang saat panel di-close. Untuk konvensi "resume conversation": load history dari `chat-messages` by visitorId + latest sessionId. Butuh endpoint GET terpisah. Follow-up.
- **Optimistic UI cancel** — user tidak bisa cancel in-flight request. Follow-up UX polish.

## Next Steps

- **Phase 4.50.7** — Retention cron via wrangler cron trigger:
  - purge `chat-messages.content` (retain metadata) setelah `auditRetentionDays / 2`
  - delete row `chat-messages` + `chat-blocked-events` setelah `auditRetentionDays`
  - archive `chat-visitors` inactive > 180d
  - dokumentasi sweep (03-CONTENT-MODEL, 06-MAINTENANCE-RUNBOOK, 07-DECISION-LOG, PROGRESS)
- **Phase 4.53** — deprecate & drop `SiteSettings.whatsappDefaults`.
