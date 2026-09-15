# Phase 4.43 — Footer Settings Tabs + Advanced Theming (rollout ke Footer)

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Mirror pola Header (Phase 4.41 + 4.42/4.42a) ke FooterSettings. Zero komponen baru — reuse `ColorSwatchField` + `colorPickerField` helper. Migration 6 kolom nullable.

## Motivasi

Phase 4.42a UAT sukses (drag color picker aman). Owner minta rollout pola reusable ke Footer. FooterSettings sebelumnya:
- Field-field flat 10+ tanpa tab → berantakan.
- 3 template semua hardcoded `bg-ocean text-white/*` → warna footer tak bisa di-adjust dari CMS.

## Perubahan

### 1. FooterSettings restructure (4 tab)

Mirror Header:

| Tab | Isi | Akses |
|---|---|---|
| **General** | Template picker (SA) | admin+ (template SA-only via `access.update`) |
| **Content** | Brand column, showSocialLinks, Menu Columns array, Services column, Contact column, Newsletter Signup group, legalLinks, bottomBarRightText | admin+ |
| **Advanced** | Group `advanced` — 6 warna override | **SA only** via `admin.condition: ({user}) => role==='super-admin'` + field-level `superAdminFieldAccess` |
| **Import / Export** | UI komponen JSON snapshot lama | admin+ |

Semua field lama tetap nama & tipe — 0 data rewrite.

### 2. Advanced group — 6 warna

Pakai `colorPickerField()` helper (Phase 4.42) — 1-baris config per field. 2 collapsible group:

- **Surface & Text** (2 baris × 2 kolom):
  - `bgColor` (default `#1B3A4B`) — background footer
  - `textColor` (default `#D9DEE1`) — teks default (paragraph, link normal)
  - `mutedTextColor` (default `#8FA0A9`) — teks kecil (copyright, bottom bar)
  - `linkHoverColor` (default `#FFFFFF`) — link saat hover
- **Headings & Divider** (1 baris × 2 kolom):
  - `headingColor` (default `#FFFFFF`) — heading kolom
  - `dividerColor` (default `#FFFFFF`, `opacity: 0.10` di CSS) — garis pemisah

### 3. Migration

[`apps/cms/src/migrations/20260915_050611.ts`](../../apps/cms/src/migrations/20260915_050611.ts) — 6× `ALTER TABLE footer_settings ADD advanced_*_color text` nullable. Reversible. Applied batch 12.

### 4. Frontend — CSS custom properties

Mirror Header 4.41. `FooterRenderer.astro`:
- Hitung default per-template (semua 3 template pakai palette ocean/white sama).
- Override dengan `advanced.*` → serialize jadi inline `style="--f-bg:#…;…"`.
- Pass sebagai `themeStyle` prop.
- `<style is:global>` scoped `#main-footer`:
  ```css
  #main-footer { background-color: var(--f-bg); color: var(--f-text); }
  #main-footer .dnj-f-muted { color: var(--f-muted); }
  #main-footer .dnj-f-heading { color: var(--f-heading); }
  #main-footer .dnj-f-divider { border-color: var(--f-divider); opacity: 0.10; }
  #main-footer a.dnj-f-link { color: var(--f-text); transition: color 200ms; }
  #main-footer a.dnj-f-link:hover { color: var(--f-link-hover); }
  #main-footer .dnj-f-social a { color: var(--f-text); transition: color 200ms; }
  #main-footer .dnj-f-social a:hover { color: var(--f-link-hover); }
  ```

Templates 1/2/3 refactor:
- Root `<footer>` tambah `id="main-footer" style={themeStyle}`.
- Kelas Tailwind `bg-ocean`, `text-white/85`, `text-white/70`, `text-white/50`, `border-white/10` dihapus dari template surface + digantikan class `dnj-f-*`. Kelas layout non-warna (`flex`, `gap-*`, `max-w-*`, dsb) tetap.
- Social icon container di-wrap dengan `.dnj-f-social` biar rule CSS ambil alih.

### 5. Non-impact

- Layout 3 template tak berubah — hanya warna aksesorial yang bergerak.
- Newsletter section pakai theme select sendiri (ocean/sand/leaf) → **sengaja dibiarkan** (beda kontrak, kalau di-override malah rusak coherent themes).
- `payload-types.ts` menambah 6 field opsional di `FooterSetting` type.

## Files touched

- **New:** `apps/cms/src/migrations/20260915_050611.ts` + `.json`, `docs/phases/phase-4.43-footer-advanced-theming.md`
- **Modified:** `apps/cms/src/globals/FooterSettings.ts`, `apps/cms/src/migrations/index.ts`, `apps/web/src/components/navigation/FooterRenderer.astro`, 3× `apps/web/src/components/navigation/templates/FooterTemplate*.astro`, `packages/shared/src/types/payload-types.ts` (regen)

## UAT checklist

Di CMS:
1. Login admin (non-SA) → Footer Settings → **3 tab** (General, Content, Import/Export). Tab Advanced tidak muncul.
2. Login SA → **4 tab** termasuk Advanced. Dua collapsible group (Surface & Text · Headings & Divider) dengan 6 swatch picker.
3. Drag SV picker → tidak ada runtime error (Phase 4.42a fix efektif juga di sini karena reuse komponen).
4. Isi `bgColor = #6B9080` (leaf), `linkHoverColor = #E07A5F` (coral), `headingColor = #F5F0E8` (sand) → Save.

Di frontend:
5. Reload halaman apa pun → footer berubah bg leaf, heading sand, link hover coral.
6. Kosongkan salah satu (mis. `bgColor`) → Save → footer bg balik ke default template.
7. Ganti template ke `footer-2` atau `footer-3` → warna override tetap terapkan (mereka share var set).
8. Editor login → Footer Settings tidak muncul di sidebar (perilaku existing tetap).
