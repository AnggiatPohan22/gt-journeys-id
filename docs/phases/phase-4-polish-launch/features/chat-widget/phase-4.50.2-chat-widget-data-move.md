# Phase 4.50.2 — Chat Widget data-move (whatsappDefaults → channels[0])

**Tanggal:** 2026-09-17
**Status:** ✅ Code complete · ⏳ Owner run migration
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.7)
**Scope:** 1 migration TS baru + register di `migrations/index.ts`. Zero schema change, zero code change di frontend.

## Motivasi

Setelah Phase 4.50.1 memasang schema `chat-widget` global, data existing di [SiteSettings.whatsappDefaults](../../apps/cms/src/globals/SiteSettings.ts:174) harus dipindah ke `chat-widget.channels[0]` (WhatsApp block) supaya:

1. Widget baru (Phase 4.50.3) bisa langsung baca dari 1 sumber (chat-widget), tidak dual-read.
2. Data user tidak hilang saat cutover (verified via `apps/cms/cms.db`: `whatsapp_defaults_default_number` = '6282386357012', `whatsapp_defaults_greeting_message` = testing string).
3. `whatsappDefaults` field lama tetap ada 1–2 release sebagai deprecated fallback (Footer masih pakai `businessHours`) → drop di Phase 4.53.

## Perubahan file

| File | Perubahan |
|---|---|
| [apps/cms/src/migrations/20260917_060000_chat_widget_data_move.ts](../../apps/cms/src/migrations/20260917_060000_chat_widget_data_move.ts) | **NEW** — data-move via Payload local API (bukan raw SQL) |
| [apps/cms/src/migrations/index.ts](../../apps/cms/src/migrations/index.ts) | Register migration baru di array `migrations` |

**Tidak diubah**: `SiteSettings.ts`, `FooterSettings.ts`, komponen frontend.

## Design decision — Payload local API bukan raw SQL

Struktur blocks di SQLite tersebar di ~5 tabel:
- `chat_widget` (root)
- `chat_widget_blocks_whatsapp_channel` (whatsapp block table)
- `chat_widget_blocks_ai_chatbot_channel` (ai block table)
- child `_rels` untuk upload rels
- order index di parent

Menulis raw INSERT ke 5 tabel + jaga foreign keys + order index = fragile. `payload.updateGlobal({ slug: 'chat-widget', data: { channels: [...] } })` handle semua itu atomically via Payload internal.

Trade-off: Payload local API di dalam migration lebih lambat, tapi ini one-shot data-move (bukan hot path).

## Idempotency

Migration aman di-jalankan berulang / di-rollback tanpa data loss:

**Up guards**:
- `whatsappDefaults` kosong total → skip (log info).
- `chat-widget.channels[]` sudah punya ≥1 entry (admin sudah manual-input) → skip (log info).

**Down**:
- Hanya hapus channel[0] kalau `blockType === 'whatsappChannel' && label === 'General'` (marker seed migration).
- Kalau admin sudah edit label/type → skip (log info).
- Data `whatsappDefaults` di SiteSettings tidak pernah disentuh → down = safe.

## Impact

- **Database**: no schema change. Data upsert ke `chat_widget_blocks_whatsapp_channel` (row 1).
- **CMS**: setelah `schema:migrate` lolos, buka `/admin/globals/chat-widget` → tab Channels sudah punya 1 row WhatsApp dengan nomor + greeting dari data lama.
- **Frontend**: none. `WhatsAppFloating.astro` masih baca `siteSettings.whatsappDefaults` (belum di-refactor — Phase 4.50.3).
- **Deploy needed**: cms only.

## Testing

- [ ] `pnpm --filter @dn-journeys/cms schema:migrate` → lihat log ada line `[chat-widget migrate] Berhasil pindah whatsappDefaults → chat-widget.channels[0] (number=set, message=set)`.
- [ ] Buka `/admin/globals/chat-widget` → tab **General** `enabled` = true.
- [ ] Tab **Channels** → 1 row block WhatsApp dengan:
  - `label` = "General"
  - `subtitle` = "Have a question? Chat with us"
  - `enabled` = true
  - `whatsappNumber` = "6282386357012"
  - `prefilledMessage` = "Hello my dear Customer, welcome to DN testing message WhatsApp"
  - `appendUtm` = true
- [ ] SiteSettings → Contact → WhatsApp Floating Button Defaults masih menampilkan data yang sama (tidak dihapus).
- [ ] Homepage frontend `/` → floating WA button masih muncul dan berfungsi (baca dari `whatsappDefaults` lama, belum di-cutover).
- [ ] Test idempotency: `pnpm schema:down && pnpm schema:migrate` → log kali kedua = "chat-widget.channels sudah berisi 1 channel — skip".
- [ ] Test empty case: `pnpm schema:down`, edit chat-widget bersihkan channels[0] di admin, kosongkan whatsappDefaults di admin, `pnpm schema:migrate` → log = "SiteSettings.whatsappDefaults kosong — skip data-move".

## Rollback

1. `pnpm --filter @dn-journeys/cms schema:down` → migration `20260917_060000_chat_widget_data_move` di-revert. `channels[0]` dihapus (kalau masih matches marker); `whatsappDefaults` di SiteSettings intact.
2. Bila ingin rollback penuh sampai Phase 4.50.1: jalankan `schema:down` sekali lagi untuk revert `20260917_052423_chat_widget_init` — semua tabel `chat_widget_*`, `chat_visitors`, `chat_messages`, `chat_blocked_events` di-drop.

## Next Steps

- **Phase 4.50.3** — Rename `WhatsAppFloating.astro` → `ChatWidget.astro`. Extract adapter di `apps/web/src/lib/chat-channels/{whatsapp,ai_chatbot,live_chat,email}.ts`. Mount di `BaseLayout.astro`. Baca dari `chat-widget` global; fallback ke `whatsappDefaults` masih boleh (transitional) supaya rollback aman.
