# Phase 4.45 — Alpha Color Support + Remove AnnouncementBar theme select

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Perluas `ColorSwatchField` ke alpha channel (8-digit hex). Hapus preset theme select AnnouncementBar (Advanced sole source). Migration 1 DROP COLUMN. Sekaligus fix bug Footer divider container opacity (Phase 4.43).

## Motivasi (owner)

1. AnnouncementBar tab "Content & Theme" masih ada preset theme select — sementara Advanced sudah cover semua warna. Duplikat & bikin bingung ("mana yang berlaku?"). Hapus preset, Advanced satu-satunya sumber.
2. Warna butuh **transparansi** — contoh PromoBanner panel backdrop menggunakan alpha 60%. Sekarang picker cuma 6-digit hex → SA tidak bisa pilih transparency dari UI. Kalau ada, developer bisa tweak halus per project.

## Perubahan

### 1. Alpha channel support (universal, semua consumer)

[`apps/cms/src/components/ColorSwatchField.tsx`](../../apps/cms/src/components/ColorSwatchField.tsx):
- Swap `HexColorPicker` → **`HexAlphaColorPicker`** dari react-colorful (menambah alpha slider di bawah hue slider).
- `HexColorInput` sekarang pakai prop `alpha` — menerima 4/8-digit hex.
- Regex validasi diperluas jadi `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`.
- Swatch preview: warna solid di-layer di atas **checker pattern** — transparansi kelihatan.
- Popup naik dari 160→190px height untuk fit alpha slider.
- Field bisa opt-out via `admin.custom.alpha: false` (belum dipakai, cadangan).

[`apps/cms/src/fields/colorPicker.ts`](../../apps/cms/src/fields/colorPicker.ts):
- `ColorPickerOpts` menerima `alpha?: boolean` (default true).
- Regex validate diperluas.
- Error message update: "Format harus hex, mis. #1B3A4B, #FFF, atau #1B3A4B99 (dgn alpha)."

Semua consumer helper (Header 4.41, Footer 4.43, AnnouncementBar 4.44, PromoBanner 4.44) langsung dapat alpha support tanpa perubahan config.

### 2. Hapus AnnouncementBar `theme` preset

[`apps/cms/src/globals/AnnouncementBar.ts`](../../apps/cms/src/globals/AnnouncementBar.ts):
- Field `theme` (select ocean/coral/leaf/sand) dihapus dari tab **Content & Theme**.
- `beforeChange` hash tidak lagi ikutkan `theme` (removed from `contentBits`).
- Advanced collapsible relabel "Colors (override preset theme)" → **"Colors"** (default expanded, satu-satunya sumber warna).
- Description update: "Warna bar. Kosong = pakai default ocean. Dukung 8-digit hex (`#1B3A4B99` = 60% alpha)."

[`apps/web/src/components/common/AnnouncementBar.astro`](../../apps/web/src/components/common/AnnouncementBar.astro):
- Hapus `themeDefaults` map. Ganti dengan satu `abDefaults` (ocean palette).
- Hapus `const theme = bar?.theme ?? 'ocean'`. Frontend tidak lagi baca `theme`.

### 3. Migration

[`apps/cms/src/migrations/20260915_055940.ts`](../../apps/cms/src/migrations/20260915_055940.ts) — `ALTER TABLE announcement_bar DROP COLUMN theme;`. DOWN re-add kolom dengan default 'ocean' (nilai lama TIDAK dipulihkan; kalau SA sebelumnya pakai `coral/leaf/sand`, mereka perlu re-pick lewat Advanced). Applied batch 14.

### 4. PromoBanner cleanup

Karena backdrop & body sekarang bisa punya alpha di value hex sendiri, `color-mix` untuk simulasi 60%/75% alpha tidak perlu:

[`apps/web/src/components/common/PromoBannerModal.astro`](../../apps/web/src/components/common/PromoBannerModal.astro):
- Default `backdropColor` `#0D1B2A` → **`#0D1B2A99`** (60% alpha 8-digit).
- Default `bodyColor` `#1B3A4B` → **`#1B3A4BBF`** (75% alpha).
- CSS: `.dnj-pb-backdrop { background-color: var(--pb-backdrop) }` (drop color-mix).
- CSS: `.dnj-pb-body { color: var(--pb-body) }` (drop color-mix).
- Close-btn + image bg CSS masih pakai `color-mix` karena mereka derivative dari `heading` (bukan field sendiri).

Zero visual regression karena default value dipilih persis produce hasil yang sama dengan color-mix sebelumnya.

### 5. Fix bonus — Footer divider container opacity bug (Phase 4.43)

Bug lama: `#main-footer .dnj-f-divider { opacity: 0.10 }` meredupkan **seluruh container** (termasuk anak `.dnj-f-muted` copyright/bottomRight paragraphs) ke 10%. Seharusnya hanya border-color yang faint.

Fix:
- Default `dividerColor` `#FFFFFF` → **`#FFFFFF1A`** (10% alpha).
- CSS drop `opacity: 0.10`. Sekarang border tetap faint, tapi anak-anak (`.dnj-f-muted`) tampil dengan warna muted-nya sendiri, tidak dobel-redup.

### 6. Regex expansion (consistency)

`FooterRenderer.astro` + `HeaderRenderer.astro` `pick()` regex diperluas ke 3/4/6/8-digit hex — supaya field warna existing yang di-set alpha di CMS terbaca (kalau SA masukkan 8-digit) tanpa jatuh ke default.

## Non-impact

- Header/Footer field warna existing (6-digit) tetap valid — regex superset.
- PromoBanner default hasil visual: identical (color-mix vs 8-digit hex, sama render).
- AnnouncementBar existing rows: kalau `theme` sebelumnya `coral/leaf/sand`, SA perlu re-pick warna via Advanced. Owner-facing (jarang), acceptable trade-off.

## Files touched

- **New:** `apps/cms/src/migrations/20260915_055940.ts` + `.json`, `docs/phases/phase-4-polish-launch/theming/theme-cleanup/phase-4.45-alpha-and-remove-ab-theme.md`
- **Modified:** `apps/cms/src/components/ColorSwatchField.tsx`, `apps/cms/src/fields/colorPicker.ts`, `apps/cms/src/globals/AnnouncementBar.ts`, `apps/cms/src/migrations/index.ts`, `apps/web/src/components/common/AnnouncementBar.astro`, `apps/web/src/components/common/PromoBannerModal.astro`, `apps/web/src/components/navigation/FooterRenderer.astro`, `apps/web/src/components/navigation/HeaderRenderer.astro`, `packages/shared/src/types/payload-types.ts` (regen)

## UAT checklist

Alpha picker:
1. SA → Header Settings / Footer Settings / Announcement Bar / Promo Banner → tab Advanced → klik swatch mana pun → popover sekarang punya **alpha slider** (di bawah hue). Text field menerima 8-digit hex.
2. Set `bgColor = #1B3A4B80` (50% alpha) di Header → Save → frontend header semi-transparent (background asli tembus).
3. Swatch di CMS: kalau isi hex dengan alpha < FF → checker pattern kelihatan di belakang, konfirmasi transparansi.

AnnouncementBar:
4. Marketing → Announcement Bar → **tab Content & Theme sekarang tak ada Theme select** (cuma Message, Dismissible, Optional Link).
5. Warna kontrol di **Advanced → Colors** (default expanded). Kosongkan `bgColor` → fallback ke `#1B3A4B` ocean.

PromoBanner:
6. Marketing → Promo Banner → tab Advanced → set `backdropColor = #C4583EAA` (coral 67% alpha) → Save → tunggu modal → backdrop coral semi-transparent.

Footer divider:
7. Buka footer di frontend → copyright / bottom-right paragraphs sekarang tampil dengan warna muted yang sebenarnya (tidak redup dobel gara-gara container opacity).
