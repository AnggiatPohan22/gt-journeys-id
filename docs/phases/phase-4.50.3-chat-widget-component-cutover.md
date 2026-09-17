# Phase 4.50.3 — Component cutover (WhatsAppFloating → ChatWidget, global mount)

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner UAT (visual walkthrough di dev server)
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7)
**Scope:** Rename komponen + extract adapters + mount site-wide via `BaseLayout`. Zero schema change, zero migration.

## Motivasi

Setelah schema (4.50.1) dan data-move (4.50.2), frontend masih membaca dari `whatsappDefaults` lama dan hanya di-mount di `index.astro`. Owner minta:

1. Widget muncul di **semua halaman**, bukan hanya home.
2. Baca konfigurasi dari `chat-widget` global (Phase 4.50.1), bukan lagi `whatsappDefaults`.
3. Siap tambah channel baru (AI chatbot, live chat, email) tanpa refactor komponen.
4. Rename komponen ke `ChatWidget` sesuai konsep channel-agnostic.

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/web/src/lib/chat-channels/types.ts](../../apps/web/src/lib/chat-channels/types.ts) | **NEW** — `ChannelBlockType`, `ResolveContext`, `ResolvedChannel` interface |
| [apps/web/src/lib/chat-channels/whatsapp.ts](../../apps/web/src/lib/chat-channels/whatsapp.ts) | **NEW** — adapter WA (wa.me link + UTM appending) |
| [apps/web/src/lib/chat-channels/ai_chatbot.ts](../../apps/web/src/lib/chat-channels/ai_chatbot.ts) | **NEW** — stub adapter AI chatbot (disabled + tooltip, backend datang 4.50.5) |
| [apps/web/src/lib/chat-channels/live_chat.ts](../../apps/web/src/lib/chat-channels/live_chat.ts) | **NEW** — stub adapter live chat (disabled + tooltip) |
| [apps/web/src/lib/chat-channels/email.ts](../../apps/web/src/lib/chat-channels/email.ts) | **NEW** — adapter Email (mailto: link) |
| [apps/web/src/lib/chat-channels/index.ts](../../apps/web/src/lib/chat-channels/index.ts) | **NEW** — dispatch `resolveChannel(block, ctx, idx)` + bulk `resolveChannels()` |
| [apps/web/src/lib/payload.ts](../../apps/web/src/lib/payload.ts) | Tambah getter `getChatWidget()` |
| [apps/web/src/components/common/ChatWidget.astro](../../apps/web/src/components/common/ChatWidget.astro) | **NEW** (rename dari `WhatsAppFloating.astro`, rewrite) — baca chat-widget + fallback legacy |
| `apps/web/src/components/common/WhatsAppFloating.astro` | **DELETED** |
| [apps/web/src/layouts/BaseLayout.astro](../../apps/web/src/layouts/BaseLayout.astro) | Mount `<ChatWidget pathname={Astro.url.pathname} />` sebelum GSAP init script |
| [apps/web/src/pages/index.astro](../../apps/web/src/pages/index.astro) | Hapus import + mount lokal (sudah di-cover BaseLayout) |

## Backward-compat guarantees

- **`generateWhatsAppLink`** tetap eksis — 10 page detail (tour, villa, spa, dst.) + property.astro tidak berubah.
- **`SiteSettings.contact.whatsapp`** tetap valid — 18 konsumen tidak disentuh.
- **`SiteSettings.whatsappDefaults`** legacy path masih di-read sebagai fallback bila `chat-widget.channels` kosong. Bila `chat-widget` global belum di-populate (mis. environment lama sebelum migrate), widget masih render dengan 1 WA default dari legacy path.
- **`SiteFeatures.whatsappFloat`** tetap jadi master toggle global (belum di-rename ke `chatWidget`).
- Fetch failure (chat-widget global unavailable): fallback path tetap jalan.

## Adapter contract

```ts
interface ResolvedChannel {
  key: string
  blockType: 'whatsappChannel' | 'aiChatbotChannel' | 'liveChatChannel' | 'emailChannel'
  label: string
  subtitle: string
  agentName?: string
  agentAvatarUrl?: string | null
  iconName: string
  brandColor: string
  mode: 'link' | 'panel' | 'script'
  href?: string
  disabled?: boolean
  disabledReason?: string
}
```

- **`mode: 'link'`** — `<a href target=_blank>` (WA, Email). Rendered fully interactive.
- **`mode: 'panel'`** — trigger inline panel di widget (AI chatbot). Rendered as disabled dulu, tooltip explanatif.
- **`mode: 'script'`** — trigger provider script (Live chat Crisp/Tawk). Rendered disabled dulu.

Menambah channel baru (mis. Telegram):
1. Tambah slug `telegramChannel` di [ChatWidgetSettings.ts](../../apps/cms/src/globals/ChatWidgetSettings.ts) blocks
2. Tambah option `'telegramChannel'` di `ChannelBlockType` union
3. Buat file `apps/web/src/lib/chat-channels/telegram.ts` (implement `resolveTelegramChannel`)
4. Register 1 branch di `apps/web/src/lib/chat-channels/index.ts` switch
5. Migration Payload otomatis (tabel block baru). **Channel lain nol perubahan.**

## Impact

- **Database**: none.
- **CMS**: none.
- **Frontend**: 
  - Widget sekarang render di setiap page yang extend `BaseLayout` (via `PageLayout` atau langsung).
  - `index.astro` mount lokal dihapus — no duplicate render.
  - `displayScope` config di CMS diterapkan: `all` (default) → semua page; `home` → hanya `/`; `custom` → treat as `all` untuk sekarang (relationship filter datang Phase 4.50.5).
  - `position`/`offsetX`/`offsetY`/`size`/`brandColor`/popup avatar dsb. semua CMS-driven.
  - Multi-channel: setiap block WA/Email di CMS = 1 kartu di popup, drag-reorder di admin = urutan di popup.
- **Routes**: none.
- **RBAC**: none.
- **Security/Behavior tabs**: field ada di CMS tapi belum di-enforce di komponen ini. Rate limit, honeypot, verification, cooldown, delay, dismissible — semua Phase 4.50.4 / 4.50.5 / 4.50.6.
- **Deploy needed**: web only.

## Testing

- [ ] `pnpm --filter @dn-journeys/web dev` → homepage `/` menampilkan widget seperti sebelumnya (visual regression baseline).
- [ ] Buka halaman non-home (mis. `/tour/[slug]`, `/villa/[slug]`, `/blog`) — widget **sekarang muncul** (ini fix utama phase ini).
- [ ] Buka `/admin/globals/chat-widget` → tab General → ubah `displayScope` = "Home saja" → save → reload frontend → widget hilang di non-home, tetap di `/`.
- [ ] Set kembali `displayScope` = "Semua halaman".
- [ ] Tab Channels → tambah Email block (`toAddress` = misalnya `hello@dnjourneysbali.com`, label "Email") → save → widget popup di frontend menampilkan 2 kartu (WA + Email); klik Email → buka `mailto:`.
- [ ] Tambah AI Chatbot block → save → kartu AI muncul dengan style disabled + tooltip "AI chatbot backend belum aktif (Phase 4.50.5)".
- [ ] Tab Appearance → ubah `position` = "Bottom left" → widget pindah ke kiri.
- [ ] Tab Appearance → `size` = SM/LG → button size berubah.
- [ ] SiteFeatures → matikan `whatsappFloat` → widget hilang dari semua page.
- [ ] Backward-compat: kosongkan `chat-widget.channels[]` di admin (bila brave) → widget masih render 1 default dari `whatsappDefaults` (fallback path). Restore setelahnya.
- [ ] Console browser: tidak ada error `chat-widget` fetch (kalau ada — periksa PAYLOAD_API_URL / apiURL).

## Rollback

1. `git revert <commit-hash>` — mengembalikan `WhatsAppFloating.astro`, menghapus adapter/`ChatWidget.astro`, un-mount dari BaseLayout, restore mount di `index.astro`.
2. Data di `chat-widget` global tetap ada (tidak disentuh). Legacy `whatsappDefaults` juga intact.
3. Tidak ada migration DB yang perlu di-down.

## Dokumentasi yang perlu di-sync (batch di Phase 4.50.7 atau saat merge)

- [ ] [docs/03-CONTENT-MODEL.md](../03-CONTENT-MODEL.md) — replace baris "Floating WA" dengan "Chat Widget"
- [ ] [docs/07-DECISION-LOG.md](../07-DECISION-LOG.md) — decision entry "Blocks over array+condition" & "Widget global mount via BaseLayout"
- [ ] [docs/PROGRESS.md](../PROGRESS.md)

## Next Steps

- **Phase 4.50.4** — Implement `RateLimitStore` interface (Cloudflare KV backend), `IpHasher` (HMAC-SHA256), `VerificationVerifier` (Turnstile + reCAPTCHA v3) di `apps/web/src/lib/chat-security/`. Belum ada consumer — cukup lib + tests.
- **Phase 4.50.5** — API endpoint `/api/chat/ai` untuk AI chatbot channel — pakai security lib dari 4.50.4, write audit ke `chat-visitors`/`chat-messages`/`chat-blocked-events`. Baru di-sini AI channel adapter berubah `disabled: false` + `mode: 'panel'` fungsional.
- **Phase 4.50.6** — Frontend behavior enforcement (send-cooldown, maxlength, dedup client-side, Turnstile widget mount, honeypot form). Panel AI inline UI (message thread + input).
- **Phase 4.50.7** — Retention cron via wrangler cron trigger + doc sweep + PROGRESS.md + DECISION-LOG.md.
