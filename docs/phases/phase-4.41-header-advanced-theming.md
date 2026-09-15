# Phase 4.41 — Header Settings Tabs + Advanced Theming (SA)

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Restructure Header Settings jadi 4 tab + tambah warna aksesorial yang bisa di-adjust SA. Migration 9 kolom nullable. Frontend refactor ke CSS custom properties.

## Motivasi

Owner report:
1. 3 template Header ada (Classic / Search&Social / TopBar), tapi **warna menu-active + hover** hardcoded di setiap template — tidak bisa di-tweak dari CMS.
2. Halaman Header Settings juga tampak berantakan (10+ field flat) — mau lebih rapi lewat tab.
3. Kontrol warna sebaiknya **super-admin only** — Header Settings sendiri bisa diakses admin untuk fitur tertentu (menu wiring, CTA content), tapi warna = keputusan brand → SA.

## Perubahan

### 1. HeaderSettings restructure (4 tab)

Sebelumnya: field-field flat berurut vertikal. Sekarang di-wrap dalam `type: 'tabs'`:

| Tab | Isi | Akses |
|---|---|---|
| **General** | Template picker (SA), sticky/transparent behavior | admin+ (template picker tetap SA-only via `access.update`) |
| **Content** | primaryMenu, secondaryMenu, showSearch, showSocialLinks, CTA (show/text/type/link), top-bar (address/phone/text) | admin+ |
| **Advanced** | Group `advanced` — override warna menu/CTA/icon/top-bar | **SA only** — hidden dari admin/editor via `admin.condition: ({user}) => user?.role === 'super-admin'` + field-level `access.update: superAdminFieldAccess` |
| **Import / Export** | UI komponen JSON snapshot lama | admin+ |

### 2. Advanced fields (SA-only)

Group `advanced` berisi 9 field `type: 'text'` opsional (validate hex `#XXX`/`#XXXXXX`). Kosong = pakai default template.

Dikelompokkan dalam collapsibles:
- **Menu Colors**: `menuDefaultColor`, `menuHoverColor`, `menuActiveColor`
- **CTA Button Colors**: `ctaBgColor`, `ctaBgHoverColor`, `ctaTextColor`
- **Icon Color**: `iconColor`
- **Top Bar Colors** (visible kalau template mendukung slot top-bar): `topBarBgColor`, `topBarTextColor`

### 3. Migration

[`apps/cms/src/migrations/20260915_032234.ts`](../../apps/cms/src/migrations/20260915_032234.ts) — 9 `ALTER TABLE header_settings ADD advanced_*_color text` nullable. Reversible via `DROP COLUMN`. Applied lokal (batch 10). `payload generate:types` menambah ~57 baris di `payload-types.ts`.

### 4. Frontend — CSS custom properties

Pola: `HeaderRenderer.astro` menghitung **default per-template** lalu di-override dengan `advanced.*` kalau ada. Hasilnya di-serialize jadi inline `style="--h-menu-text: #…; …"` yang di-apply pada `<header id="main-header">`. Selector CSS scoped ke `#main-header` (via `<style is:global>` di renderer) baca var:

```css
#main-header .dnj-nav-link { color: var(--h-menu-text); }
#main-header .dnj-nav-link:hover { color: var(--h-menu-hover); }
#main-header .dnj-nav-link--active { color: var(--h-menu-active); font-weight: 700; }
#main-header .dnj-cta { background-color: var(--h-cta-bg); color: var(--h-cta-text); }
#main-header .dnj-cta:hover { background-color: var(--h-cta-bg-hover); }
#main-header .dnj-icon-btn { color: var(--h-icon); }
#main-header .dnj-topbar { background-color: var(--h-topbar-bg); color: var(--h-topbar-text); }
```

Template 1/2/3 + `_HeaderNavDesktop.astro` + `_HeaderNavMobile.astro` di-refactor ke class-class `dnj-*` di atas alih-alih Tailwind color hardcode. Utility Tailwind non-warna (`text-sm`, `font-semibold`, `flex`, dst) tetap.

Default per-template:
- **header-1 / header-2**: menu ocean palette (menu default `#3D405B` stone, active/hover `#1B3A4B` ocean, CTA `#1B3A4B` → hover `#2D5F73`).
- **header-3**: sama untuk menu, **CTA `#E07A5F` coral → hover `#C4583E`** (mempertahankan look "Top Bar" existing).

## Non-impact

- Layout theme (ukuran, arrangement, spacing) tetap fixed — hanya warna aksesorial yang bergerak.
- Field lama (primaryMenu, ctaText, showSearch, dll) semua tetap dengan nama & tipe sama → 0 data rewrite.
- `payload-types.ts` menambah 9 field opsional di `HeaderSetting` type + `HeaderSettingsSelect`. Semua nullable string.
- `apps/web` fetch shape tetap; `HeaderRenderer` menambah kalkulasi `themeStyle` + pass ke template.

## Files touched

- **New:** `apps/cms/src/migrations/20260915_032234.ts` + `.json`
- **Modified:** `apps/cms/src/globals/HeaderSettings.ts`, `apps/cms/src/migrations/index.ts`, `apps/web/src/components/navigation/HeaderRenderer.astro`, 3 template astro, 2 nav shared astro
- **Regenerated:** `packages/shared/src/types/payload-types.ts` (+57 baris)

## UAT checklist

Di CMS:
1. Login **admin (non-SA)** → buka Header Settings → mestinya lihat **3 tab**: General, Content, Import/Export. Tab **Advanced tidak muncul**.
2. Login **super-admin** → buka Header Settings → lihat **4 tab** termasuk Advanced.
3. Tab Advanced → tiga collapsible group (Menu / CTA / Icon) + Top Bar (kalau template = header-3). Isi hex tak valid (mis. `abc`) → tampil error validate.
4. Save `menuActiveColor` = `#E07A5F`, `menuHoverColor` = `#E07A5F`, `ctaBgColor` = `#6B9080`.

Di frontend:
5. Reload halaman apa saja → link menu aktif berubah jadi coral, hover coral, tombol CTA hijau leaf.
6. Kosongkan salah satu field (mis. `menuActiveColor`) → Save → frontend link aktif kembali ke ocean default template.
7. Ganti template (SA) di General ke `header-3` → CTA default coral (bukan ocean lagi), kecuali `ctaBgColor` di-set custom.
8. Editor login → Header Settings **tidak muncul** di sidebar (perilaku existing tetap).

## Follow-up (nanti)

- Color picker widget custom (native `<input type="color">` in a Payload UI component) sebagai pengganti text hex — quality-of-life. Field storage tetap sama.
- Terapkan pola serupa (advanced theming SA-only) di FooterSettings kalau ada permintaan.
