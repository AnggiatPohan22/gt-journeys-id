# Phase 4.50.1 — Chat Widget schema + Security & Anti-Spam

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner UAT (`pnpm schema:new` + admin walkthrough)
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7) + owner review
**Scope:** CMS-only. Zero frontend change. 1 global baru + 3 collection baru + 1 registrasi payload.config.

## Motivasi (owner report)

1. Floating WA button di homepage hanya bisa diatur dari 3 field di `SiteSettings.whatsappDefaults` (defaultNumber, greetingMessage, businessHours) dan komponen hanya di-mount di `index.astro` — halaman lain tidak menampilkannya. Owner minta setting yang lebih lengkap + scalable, siap tambah channel baru (AI chatbot, live chat, email).
2. Owner minta anti-spam multi-layer sejak awal supaya saat AI chatbot masuk, backend sudah punya rate-limit, human verification (Turnstile / reCAPTCHA v3), backend validation (length, cooldown, dedup), bot signals (honeypot, timing), dan IP/country control — semua ter-config dari CMS, bukan hardcode.
3. Struktur harus scalable: tambah channel baru = tambah 1 block schema; tambah rule baru = tambah 1 signal ke JSON `context` — tanpa merombak DB.

## Keputusan arsitektur

### Channel-agnostic via Payload `blocks` (bukan `array + condition`)

Bandingkan dua pola di Payload 3.33 (versi project ini — verified di [package.json](../../apps/cms/package.json)):

| Aspek | `array` + `admin.condition` | `blocks` (tiap channel = 1 block) |
|---|---|---|
| Schema DB | Semua kolom in-line di 1 tabel array; kolom yang tidak relevan jadi NULL | 1 tabel per block-type; kolom hanya milik channel itu |
| Nambah channel | Edit 1 file, tambah option + field ber-condition | Tambah 1 file block, register di array `blocks: []`, **channel lama nol perubahan** |
| Type-safety | Semua field jadi optional | Discriminated union by `blockType` — TS narrow otomatis |
| Migration saat nambah | Kolom baru di tabel array yang sama | Tabel block baru — zero-touch data lama |

**Keputusan**: blocks. WA vs AI-chatbot schema divergen signifikan (`whatsappNumber+prefilledMessage` vs `provider+model+systemPrompt+streaming+apiKeyRef`) — array+condition akan menumpuk >15 conditional field di 1 row. Shared field (label, enabled, subtitle, avatar, iconOverride, brandColorOverride) di-extract ke helper `commonChannelFields` untuk hindari drift.

Detail perbandingan penuh di jawaban audit — kode helper di [ChatWidgetSettings.ts:21-64](../../apps/cms/src/globals/ChatWidgetSettings.ts).

### Scalability guardrail untuk anti-spam

| Rencana upgrade masa depan | Cara zero-migration |
|---|---|
| Tambah verification provider (hcaptcha, arkose) | 1 option baru di select `verificationProvider` |
| Tambah layer 6 (mis. proof-of-work) | 1 option baru di `enabledLayers[]` multi-select |
| Tambah signal bot baru (canvas fingerprint, WebGL) | Tulis ke `chat-blocked-events.context` (JSON) — no schema change |
| Tambah rule pattern baru | Tambah row di `blockedPatterns[]` array |
| Multi-window rate-limit (5/min AND 100/hour) | Tambah row di `rateLimitRules[]` — schema mendukung sejak awal |
| Ganti store rate-limit counter (Redis → KV → DO) | Abstract di lib `RateLimitStore` interface — TIDAK ada tabel Payload untuk counter |
| Naik version security (mis. wajibkan verification untuk semua channel) | Increment `securityVersion` — backend branch by version |
| Rule/reason baru di audit log | `ruleTriggered` = string bebas kebab-case; `context` = JSON |

### Privacy defaults

- Raw IP tidak disimpan. Hanya `ipHash = HMAC-SHA256(env.CHAT_IP_HASH_SALT, ip)`. Rotasi salt = invalidate history — sesuai GDPR.
- Cookie visitor: HttpOnly + SameSite=Lax + Secure (default nama: `__cwvid`, TTL 90 hari).
- Verification secret **wajib** disimpan sebagai env-var name (`verificationSecretKeyRef` = `TURNSTILE_SECRET_KEY`), bukan raw secret di DB. Sama pola dengan `aiChatbotChannel.apiKeyRef`.
- Audit retention default 30 hari — retention job akan di-implement di Phase 4.50.7.

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/cms/src/globals/ChatWidgetSettings.ts](../../apps/cms/src/globals/ChatWidgetSettings.ts) | **NEW** — global `chat-widget`, 8 tab, blocks-based `channels[]` (whatsappChannel / aiChatbotChannel / liveChatChannel / emailChannel) + Tab 8 Security 5 layer collapsible |
| [apps/cms/src/collections/ChatVisitors.ts](../../apps/cms/src/collections/ChatVisitors.ts) | **NEW** — visitor record (`visitorId`, `ipHash`, `status`, `messageCount`, `context` JSON). Server-to-server write only. |
| [apps/cms/src/collections/ChatMessages.ts](../../apps/cms/src/collections/ChatMessages.ts) | **NEW** — audit per message (channelType, direction, contentHash, contentLength, wasBlocked, blockReason, verificationScore, `context` JSON) |
| [apps/cms/src/collections/ChatBlockedEvents.ts](../../apps/cms/src/collections/ChatBlockedEvents.ts) | **NEW** — audit per rule trigger (layer, ruleTriggered kebab-case, action, `context` JSON snapshot) |
| [apps/cms/src/payload.config.ts](../../apps/cms/src/payload.config.ts) | Import + register 1 global + 3 collection |

**Tidak diubah** (sesuai plan):

- `apps/cms/src/globals/SiteSettings.ts` — `whatsappDefaults` masih ada sebagai legacy fallback (belum di-deprecate; itu Phase 4.53).
- `apps/cms/src/globals/SiteFeatures.ts` — `whatsappFloat` flag tetap; opsional rename ke `chatWidget` di phase terpisah.
- `apps/web/src/components/common/WhatsAppFloating.astro` — belum di-rename; belum baca chat-widget global. Itu Phase 4.50.3.
- 10 page detail (tour, villa, spa, dst.) yang panggil `generateWhatsAppLink` — TIDAK BERUBAH; helper tetap eksis.

## Struktur 8 tab ChatWidgetSettings

1. **General** — enabled, displayScope (all/home/custom), includePages, excludePages, hideOnMobile/Desktop
2. **Appearance** — position, offsetX/Y, buttonStyle (iconOnly/pill), brandColor, size, pulse & entrance animation
3. **Popup** — popupTitle, popupSubtitle, brandName, headerAvatar, showOnlineBadge, showTypingIndicator
4. **Channels** — `blocks` field, 4 block schema (whatsapp / aiChatbot / liveChat / email) + shared `commonChannelFields`
5. **Availability** — enableBusinessHours, timezone, hours[] per hari, offlineBehavior (showAnyway/showOfflineNotice/hideButton), offlineMessage
6. **Behavior** — showDelaySeconds, showAfterScrollPct, autoOpenOnceAfter, exitIntentDesktop, dismissible, dismissMemoryHours, mobileFullscreenSheet
7. **Tracking** — gaEventName, cloudflareTracking, UTM (source/medium/campaign), requireConsent
8. **Security** — `securityVersion`, `enabledLayers[]`, 5 collapsible per-layer (rateLimit/humanVerification/backendValidation/botSignals/ipControls) + Visitor & Privacy group

## Impact

- **Database**: 1 migration akan ditambah (belum di-generate — owner run `pnpm schema:new chat_widget_init`). Tabel yang akan dibuat:
  - `chat_widget` (root global)
  - `chat_widget_channels_whatsapp_channel`, `..._ai_chatbot_channel`, `..._live_chat_channel`, `..._email_channel` (blocks)
  - `chat_widget_hours` (business hours array)
  - `chat_widget_security_rate_limit_rules`, `..._blocked_keywords`, `..._blocked_patterns`, `..._blocked_ips`, `..._country_codes`, `..._custom_blocked_user_agents` (security arrays)
  - `chat_visitors`, `chat_messages`, `chat_blocked_events` (audit collections)
  - `chat_widget_rels` + collection rels
- **CMS**: sidebar "Settings" tambah entry "Chat Widget"; sidebar "Administration" tambah 3 collection.
- **Frontend**: none. Widget tetap `WhatsAppFloating.astro` yang lama, mount di `index.astro`.
- **RBAC**: 3 collection = admin (read/update); super-admin only (delete). Global chat-widget = super-admin only (update).
- **Routes**: none.
- **Deploy needed**: cms only.

## Testing

- [ ] `pnpm --filter @dn-journeys/cms schema:new chat_widget_init` → review migration `.ts` di `apps/cms/src/migrations/`. Pastikan ada CREATE TABLE untuk 4 tabel utama + arrays + blocks.
- [ ] `pnpm --filter @dn-journeys/cms schema:migrate` → tidak ada error.
- [ ] `pnpm --filter @dn-journeys/cms generate:types` → `packages/shared/src/types/payload-types.ts` update, ada type `ChatWidget`, `ChatVisitor`, `ChatMessage`, `ChatBlockedEvent`.
- [ ] Buka `/admin/globals/chat-widget` → 8 tab semua render, blocks-picker di tab Channels menampilkan 4 opsi (WhatsApp / AI Chatbot / Live Chat / Email).
- [ ] Add row "WhatsApp" block → field WA lengkap muncul (whatsappNumber, prefilledMessage, appendUtm).
- [ ] Tab Security → 5 collapsible visible, `securityVersion` readOnly = 1, `enabledLayers` default = [rateLimit, backendValidation].
- [ ] `/admin/collections/chat-visitors` → tabel kosong, kolom default (visitorId, ipHash, status, messageCount, lastSeenAt).
- [ ] `/admin/collections/chat-messages` & `/admin/collections/chat-blocked-events` sama — tabel kosong, kolom default sesuai.
- [ ] Frontend `pnpm --filter @dn-journeys/web dev` → homepage tetap punya WA floating (component lama masih dipakai). No regression.

## Rollback

1. `git revert <commit-hash>` untuk 4 file baru + payload.config.
2. `pnpm --filter @dn-journeys/cms schema:down` (roll back migration terakhir).
3. Data di 3 collection & global tinggal di DB tapi tidak lagi ter-referensi — bisa di-drop manual atau biarkan.
4. `SiteSettings.whatsappDefaults` tidak pernah disentuh → tetap valid.
5. WhatsAppFloating.astro tidak disentuh → tetap render normal.

## Dokumentasi yang perlu diupdate (di phase-4.50.x lanjutan)

- [ ] `docs/02-DATABASE-SCHEMA.md` — dokumentasikan chat-widget global + 3 collection setelah migration merged.
- [ ] `docs/03-CONTENT-MODEL.md` — replace row "Floating WA" dengan "Chat Widget" setelah Phase 4.50.3.
- [ ] `docs/06-MAINTENANCE-RUNBOOK.md` — runbook untuk retention job (Phase 4.50.7).
- [ ] `docs/07-DECISION-LOG.md` — tambah decision: (a) blocks-over-array-condition, (b) IP HMAC bukan raw, (c) rate-limit counter di store abstract bukan tabel.
- [ ] `docs/PROGRESS.md` — mark Phase 4.50.1 complete.

## Next Steps

- **Phase 4.50.2** — data-move migration `SiteSettings.whatsappDefaults` → `chat-widget.channels[0]` (WA block).
- **Phase 4.50.3** — rename `WhatsAppFloating.astro` → `ChatWidget.astro`, mount di `BaseLayout.astro`, extract `chat-channels/{whatsapp,ai_chatbot,live_chat,email}.ts` adapters.
- **Phase 4.50.4** — implement `RateLimitStore` (Cloudflare KV backend), `IpHasher`, `VerificationVerifier` di `apps/web/src/lib/chat-security/`.
- **Phase 4.50.5** — API endpoint `/api/chat/send` dengan enforcement 5 layer + audit write.
- **Phase 4.50.6** — frontend enforcement (send-cooldown, maxlength, dedup client-side, Turnstile widget mount, honeypot).
- **Phase 4.50.7** — retention cron (purge `chat-messages.content` + old row) via `wrangler.jsonc` cron trigger.
- **Phase 4.53** — deprecate & drop `SiteSettings.whatsappDefaults`.
