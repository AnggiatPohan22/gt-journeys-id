# Phase 4.44 — Marketing Globals Advanced Theming (AnnouncementBar + PromoBanner)

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Rollout pattern reusable (Phase 4.42 helpers) ke dua global Marketing. Zero komponen baru. Migration 12 kolom nullable + 1 kolom radius.

## Motivasi

Owner UAT Phase 4.43 (Footer) sukses. Lanjut rollout ke Marketing:
- **AnnouncementBar** — 4 preset theme (ocean/coral/leaf/sand). Bagus untuk client, tapi SA sering minta warna spesifik (mis. `#95a4b0`) yang bukan brand palette.
- **PromoBanner** — 2 layout theme (with-image / text-only) + palette panel `#F5F0E8` sand + heading `#1B3A4B` ocean + CTA `#E07A5F` coral, semua hardcoded. Tidak bisa custom per-campaign.

Solusi: tambah **override warna & shape opsional** di tab Advanced yang sudah ada (sparse). Preset theme lama tetap sebagai default & UI utama; override hanya isi kalau memang mau spesifik.

## Perubahan

### 1. AnnouncementBar — tab Advanced

Collapsible baru **"Colors (override preset theme)"** dengan 1 group `advanced`:

| Field | Default | Fungsi |
|---|---|---|
| `bgColor` | (preset ocean `#1B3A4B` / coral `#E07A5F` / leaf `#6B9080` / sand `#F5F0E8`) | Background bar |
| `textColor` | (preset default sand/ocean) | Teks utama |
| `linkColor` | (preset default) | Link CTA (kalau ada) |
| `linkHoverColor` | (preset default) | Hover link |

### 2. PromoBanner — tab Advanced

Collapsible baru **"Colors & Shape (override defaults)"** dengan 1 group `advanced`:

| Field | Default | Fungsi |
|---|---|---|
| `panelBgColor` | `#F5F0E8` | Background panel modal |
| `backdropColor` | `#0D1B2A` | Backdrop (60% alpha via `color-mix`) |
| `headingColor` | `#1B3A4B` | Warna heading + close button base |
| `bodyColor` | `#1B3A4B` (75% alpha) | Warna subheadline |
| `ctaBgColor` | `#E07A5F` | Background tombol CTA |
| `ctaBgHoverColor` | `#C4583E` | Hover background CTA |
| `ctaTextColor` | `#F5F0E8` | Teks tombol CTA |
| `ctaRadius` (via `buttonStyleFields`) | `rounded` (12px) | Pill / Rounded / Rounded-md / Square |

### 3. Migration

[`apps/cms/src/migrations/20260915_052058.ts`](../../apps/cms/src/migrations/20260915_052058.ts) — 12 nullable text columns:

- `announcement_bar.advanced_bg_color`, `_text_color`, `_link_color`, `_link_hover_color`
- `promo_banner.advanced_panel_bg_color`, `_backdrop_color`, `_heading_color`, `_body_color`, `_cta_bg_color`, `_cta_bg_hover_color`, `_cta_text_color`
- `promo_banner.advanced_cta_radius` (text DEFAULT `'rounded'`)

Reversible. Applied batch 13.

### 4. Frontend

**AnnouncementBar** ([`AnnouncementBar.astro`](../../apps/web/src/components/common/AnnouncementBar.astro)):
- `themeDefaults` map preset theme → palette default.
- `advanced.*` fills override preset.
- Serialize `themeVars` jadi inline `style="--ab-bg:#…;…"` di `.dnj-ab`.
- `<style is:global>` scoped: `.dnj-ab { background: var(--ab-bg); color: var(--ab-text); }`, `.dnj-ab .dnj-ab-link { color: var(--ab-link); } :hover { color: var(--ab-link-hover); }`.
- Kelas Tailwind hardcoded `bg-[#…] text-[#…]` dihapus dari markup; layout tetap.

**PromoBannerModal** ([`PromoBannerModal.astro`](../../apps/web/src/components/common/PromoBannerModal.astro)):
- Serialize `themeVars` (7 warna + 1 radius) di `.dnj-pb`.
- `<style is:global>` scoped semua warna via CSS vars:
  ```css
  .dnj-pb .dnj-pb-panel { background-color: var(--pb-panel-bg); color: var(--pb-heading); }
  .dnj-pb .dnj-pb-heading { color: var(--pb-heading); }
  .dnj-pb .dnj-pb-body { color: color-mix(in srgb, var(--pb-body) 75%, transparent); }
  .dnj-pb .dnj-pb-close { background-color: color-mix(in srgb, var(--pb-heading) 10%, transparent); … }
  .dnj-pb .dnj-pb-cta { background: var(--pb-cta-bg); color: var(--pb-cta-text); border-radius: var(--pb-cta-radius); }
  .dnj-pb .dnj-pb-cta:hover { background: var(--pb-cta-bg-hover); }
  .dnj-pb .dnj-pb-backdrop { background-color: color-mix(in srgb, var(--pb-backdrop) 60%, transparent); }
  ```
- Kelas Tailwind hardcoded `bg-[#F5F0E8]`, `text-[#1B3A4B]`, `bg-[#E07A5F]`, `bg-[#1B3A4B]/10`, `bg-[#0D1B2A]/60`, `rounded-lg`, dsb dihapus dari markup — semua migrasi ke class `dnj-pb-*` + CSS var.
- Script open/close (opacity fade, scroll-lock, focus-trap) tak disentuh.

### Non-impact

- Preset theme AnnouncementBar (`ocean/coral/leaf/sand`) tetap jadi UI utama & default. Kalau owner cuek dengan advanced, perilaku identik sebelum phase ini.
- PromoBanner default (sand/ocean/coral) tetap. `ctaRadius` default `'rounded'` = `12px` (mirip `rounded-lg` lama). Zero visual regression.
- Dismiss cookie versioning (`beforeChange` hook) tak disentuh — perubahan warna tidak menginvalidasi dismissal (sengaja: warna edit ≠ content edit).

## Files touched

- **New:** `apps/cms/src/migrations/20260915_052058.ts` + `.json`, `docs/phases/phase-4.44-marketing-advanced-theming.md`
- **Modified:** `apps/cms/src/globals/AnnouncementBar.ts`, `apps/cms/src/globals/PromoBanner.ts`, `apps/cms/src/migrations/index.ts`, `apps/web/src/components/common/AnnouncementBar.astro`, `apps/web/src/components/common/PromoBannerModal.astro`, `packages/shared/src/types/payload-types.ts` (regen)

## UAT checklist

Announcement Bar:
1. Login SA → Marketing → Announcement Bar → tab Advanced → **Colors (override preset theme)** collapse (default tertutup).
2. Expand → 4 swatch picker. Drag SV → 60fps smooth, no error (Phase 4.42a fix).
3. Isi mis. `bgColor = #95A4B0` (grey-blue) → Save.
4. Reload halaman apapun → bar bg berubah jadi grey-blue. Kosongkan → fallback ke preset theme.

Promo Banner:
5. Marketing → Promo Banner → tab Advanced → **Colors & Shape** collapse.
6. Expand → 7 swatch + shape selector. Isi `ctaBgColor = #6B9080` (leaf), `ctaRadius = Square` → Save.
7. Tunggu modal trigger (5s default) → CTA tombol jadi leaf, sudut siku.
8. Uji ganti `panelBgColor = #FFFFFF` + `backdropColor = #FFFFFF` → panel jadi putih, backdrop putih (60% alpha).

Editor tetap tidak lihat kedua global sama sekali (existing SA-only).
