# Phase 4.47 — Sidebar Icons: fill missing + differentiate Users/Authors

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Pure CSS. Zero schema/migration/component change. Affects sidebar nav only.

## Motivasi

Beberapa item nav sidebar tampil dengan **icon default circle** (`--dnj-ic-default`) karena belum ada mapping href → icon. Dan **Authors** salah kamar — pakai icon multi-person (`--dnj-ic-users`) yang identik dengan **Users**, bikin bingung "yang mana Users, yang mana Authors" saat sekilas.

## Perubahan

[`apps/cms/src/admin/admin-global.css`](../../apps/cms/src/admin/admin-global.css) — dua bagian:

### 1. Icon variables baru (SVG data URI, Lucide-style)

Ditambah di `:root`:

| Var | Bentuk | Kandidat pakai |
|---|---|---|
| `--dnj-ic-mail` | Envelope | Newsletter Subscribers |
| `--dnj-ic-megaphone` | Megaphone/horn | Announcement Bar |
| `--dnj-ic-percent` | Percent symbol (%) | Promo Banner |
| `--dnj-ic-ship` | Boat + waves | Ferry Tickets |
| `--dnj-ic-pen` | Pen/marker | Authors |

Bentuk mengikuti stroke-based lucide.dev icons: `stroke='%23000' stroke-width='2' stroke-linecap='round'`. Warna di-tint dari `currentColor` via `-webkit-mask`/`mask` di `.nav__link::before` (mekanisme existing Phase 4.4).

### 2. Rule mapping href → icon

| Selector | Icon baru | Sebelumnya |
|---|---|---|
| `collections/ferry-tickets` | 🚢 ship | (default circle — bukan di daftar layers) |
| `collections/newsletter-subscribers` | ✉️ mail | (default circle) |
| `globals/announcement-bar` | 📢 megaphone | (default circle) |
| `globals/promo-banner` | % percent | (default circle) |
| `collections/authors` | 🖊️ pen | 👥 users (bentrok dengan Users) |

**Users** (collection `users`) tetap `--dnj-ic-users` (2-person). Authors sekarang beda visual → sekilas jelas mana team admin vs. writer blog.

## Non-impact

- **Zero schema/data/config change.** Payload config files tidak disentuh.
- **Zero build effect** — CSS ada di file yang sudah loaded via `AdminStyles.tsx` provider global. Tidak perlu re-generate importMap/types.
- Icon fallback (`--dnj-ic-default` circle) tetap ada untuk future collection/global yang belum di-map.
- Nav link yang tidak di-map masih tampil (dengan circle), tidak error.

## Files touched

- **Modified:** `apps/cms/src/admin/admin-global.css`

## UAT checklist

1. Login CMS super-admin → sidebar terlihat:
   - **Services group**: Ferry Tickets pakai icon ship (khas), tetap ocean palette + hover behavior.
   - **Administration group**: Newsletter Subscribers pakai envelope; Users tetap multi-person.
   - **Posts group**: Authors pakai pen; Users beda visual jelas.
   - **Marketing group**: Announcement Bar megaphone, Promo Banner percent.
2. Toggle theme dark ↔ light → semua icon tetap terlihat (mask + currentColor).
3. Hover / active state → icon ikut warna aksen aktif (currentColor pattern, sudah bekerja).
