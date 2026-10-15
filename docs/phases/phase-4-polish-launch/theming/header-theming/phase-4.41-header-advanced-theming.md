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

---

## 4.41.1 Addendum — Header polish + audit fix (2026-09-15)

Owner UAT: 3 bug ditemukan setelah pemakaian nyata. Semua di-fix di sini (bukan phase doc terpisah, biar riwayat Header terkumpul).

### Bug 1 — Advanced tidak "follow" saat ganti template

**Report:** Set `ctaBgColor = purple` saat template = Classic (T1). Ganti ke Top Bar (T3) → CTA malah kembali coral (default T3).

**Investigasi:** `HeaderRenderer.astro` melakukan `pick(adv.ctaBgColor, d.ctaBg)` yang **selalu menang** ke advanced kalau di-set. Kalau override tidak apply → kemungkinan besar (a) belum Save antar-ganti, atau (b) yang di-Reset (kosong) sebenarnya menyebabkan fallback ke default template baru. **Kode tidak buggy.**

**Klarifikasi philosophy** (owner minta pandangan) — pilih pola **A: advanced selalu menang**, dokumentasikan supaya jelas:
- Field warna Advanced di-set → berlaku untuk **semua template**, tidak reset saat SA ganti template. Kalau SA mau lihat default template baru → klik tombol **Reset** per-field.
- Kelebihan opsi A: predictable + power-user friendly. Owner bisa "brand-lock" satu warna CTA untuk seluruh template.
- Kekurangan: kalau SA lupa Reset, warna override bisa bentrok dengan visual template baru. Mitigasi: description tab Advanced sekarang eksplisit jelaskan behavior ini.

Description Advanced tab diperbarui:
> Override selalu menang di semua template — kalau kamu ganti template, warna Advanced yang sudah di-set TETAP berlaku (bukan reset ke default template baru). Ingin balik ke default template terbaru? Klik "Reset" per-field.

### Bug 2 — `transparentOnTop` tidak terasa efeknya

**Root cause:**
- **T3 tidak respect** `transparent` prop sama sekali — main-bar `<div>` hardcode `bg-white/90`.
- **T1/T2 respect** tapi menerapkan `bg-transparent` **selalu** (tanpa scroll listener). Kalau halaman tidak taruh hero konten di belakang header, "transparent" cuma bikin header hilang di-scroll juga → user tidak lihat perbedaan berarti.

**Fix (real behavior):**
- Perkenalkan class `.dnj-header-surface` sebagai satu-satunya sumber bg + backdrop-blur + border + shadow.
- Tambah data attribute `data-transparent-top="0|1"` dan `data-scrolled="0|1"` di `#main-header`.
- CSS di `HeaderRenderer.astro`:
  ```css
  #main-header .dnj-header-surface {
    background-color: var(--h-bg);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(212, 197, 169, 0.20);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: 250ms;
  }
  #main-header[data-transparent-top="1"][data-scrolled="0"] .dnj-header-surface {
    background-color: transparent;
    backdrop-filter: none;
    border-color: transparent;
    box-shadow: none;
  }
  ```
- Client script inline: bind sekali per header, listen `scroll`, toggle `data-scrolled` berdasar `scrollY > 40`.
- T3: main-bar `<div>` pakai `.dnj-header-surface`; top-bar tetap opaque via `--h-topbar-bg` (top-bar tidak ikut transparent-mode).

Efeknya sekarang: kalau `transparentOnTop` ON, header **jernih di scroll paling atas** dan **frost/solid setelah scroll**. Persis pola hero landing modern.

### Bug 3 — Header bgColor tidak ada di Advanced

**Report:** Warna surface header (frost putih) tidak bisa di-adjust dari CMS.

**Fix:**
- **New field** `advanced.bgColor` di collapsible baru **"Header Surface"** (paling atas Advanced group, sebelum Menu Colors).
- Migration `20260915_084823.ts` — `ALTER TABLE header_settings ADD advanced_bg_color text` nullable, reversible, applied batch 15.
- Default per-template di renderer:
  - T1: `#FFFFFFD9` (~85% alpha, seperti Tailwind `bg-white/85` lama)
  - T2: `#FFFFFFE6` (~90% alpha)
  - T3: `#FFFFFFE6`
- Konsumer: `--h-bg` di `themeVars` → `.dnj-header-surface { background-color: var(--h-bg) }`. Alpha didukung (Phase 4.45) — SA bisa set semi-transparent surface.

### Bug 4 (audit) — `stickyOnScroll` checkbox tidak wired

**Root cause:** Checkbox ada di config default true, tapi ketiga template hardcode `class="fixed top-0 ..."`. Jadi toggle ini **dead** — tidak berpengaruh apapun.

**Fix:**
- `HeaderRenderer.astro` baca `sticky = headerCfg?.stickyOnScroll !== false`, forward sebagai prop `sticky` ke template.
- Templates T1/T2/T3: root `<header>` class conditional `sticky ? 'fixed top-0' : 'relative'`; spacer `<div class="h-20">` / `h-[100px]` hanya dirender kalau `sticky` (in-flow header tidak butuh spacer).
- Sekarang: `stickyOnScroll=false` → header ikut scroll ke atas (in-flow), tidak overlay page.

### Files touched (Addendum 4.41.1)

- **Modified:** `apps/cms/src/globals/HeaderSettings.ts` (tambah collapsible Header Surface, update description Advanced tab), `apps/cms/src/migrations/index.ts`, `apps/web/src/components/navigation/HeaderRenderer.astro` (add `--h-bg`, sticky, CSS + script), `apps/web/src/components/navigation/templates/HeaderTemplate1.astro`, `HeaderTemplate2.astro`, `HeaderTemplate3.astro`, `packages/shared/src/types/payload-types.ts` (regen).
- **New:** `apps/cms/src/migrations/20260915_084823.ts` + `.json`

### UAT re-run

1. Login SA → Header Settings → Advanced → collapsible **Header Surface** muncul paling atas, dengan swatch `bgColor` default `#FFFFFFE6`.
2. Set `bgColor = #F5F0E880` (sand 50% alpha) → Save. Frontend header terlihat sand semi-transparan.
3. Kembalikan `transparentOnTop = ON`, buka halaman apa pun → di scrollY < 40, header **transparan penuh** (tidak ada bg, tidak ada blur, tidak ada border). Scroll turun → header **fade in ke surface penuh**. Toggle di dev-tools atau nyalakan reduced-motion untuk verifikasi transisi 250ms.
4. Ganti `template` ke T3 → main bar juga respect transparent-on-top; top bar tetap opaque (di-warnai `--h-topbar-bg`).
5. Set `stickyOnScroll = OFF` → header sekarang **in-flow**, ikut scroll ke atas, tidak overlay body.
6. Set `stickyOnScroll = ON` lagi → header kembali fixed di top.
7. Set `ctaBgColor = #6B9080` (leaf), ganti template T1 → T3 → T2 → warna leaf tetap konsisten di ketiga template. Reset field → CTA kembali ke default template yang sedang aktif.

### Closed / bebas bug

- ✅ Bug 1 (advanced persist across template switch) — sudah correct, description explisit.
- ✅ Bug 2 (transparentOnTop) — sekarang scroll-driven, T3 juga respect.
- ✅ Bug 3 (bgColor) — field + migration + wired.
- ✅ Bug 4 (stickyOnScroll dead) — sekarang aktif.
