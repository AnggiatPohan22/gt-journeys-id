# Phase 4.7 — Dashboard Logo (SiteSettings) + Edit/Reset Cleanup

> **Status:** ✅ Code selesai · compile & serve OK · ⏳ screenshot (login)
> **Scope:** UI/UX only — SiteSettings dibaca (read-only), fitur Payload
> disembunyikan (bukan dihapus).
> **Date:** 2026-08-26
> Catatan: dinomori **4.7** karena `phase-4.6` sudah dipakai
> ([dashboard-refinement](phase-4.6-dashboard-refinement.md)) di sesi yang sama.

---

## 1. Logo Situs di BREADCRUMB Top-Bar (bukan Overview)

**Tujuan:** ikon brand di **breadcrumb top-bar** (posisi ikon "DJ" — muncul di
SEMUA halaman admin) diganti dengan **logo situs dari SiteSettings**. Logo HANYA
di sini — **tidak** di section Overview / konten dashboard.

> Revisi: task awal sempat menaruh logo di header Overview; itu **dipindahkan**
> ke breadcrumb (dan dihapus dari Overview).

### Config option yang mengontrol ikon breadcrumb
**`admin.components.graphics.Icon`** (`payload.config.ts`) →
`/admin/graphics/Icon#default`. Payload merender komponen ini sebagai
**server component** dengan `serverProps` (termasuk `payload`), di breadcrumb
top-bar (`templates/Default` → `CustomIcon`). `graphics.Logo` (besar) dipakai di
halaman login — tidak diubah.

### Field SiteSettings yang dipakai
`globals/SiteSettings.ts` (slug `site-settings`): `logo` (upload→media, light) &
`logoDark` (upload→media, "Logo (Dark Background)").

### Implementasi (`admin/graphics/Icon.tsx`)
Server component **async**, fetch via Local API:
```ts
const ss = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
logo     = ss?.logo?.url || null
logoDark = ss?.logoDark?.url || logo
```
- Render 2 `<img>` (light + dark), height **26px**, width auto, object-fit
  contain, **tidak clickable**.
- **Dark/light:** swap via CSS (`.dnj-brand-icon__img--light/--dark`,
  `html[data-theme='dark']`). Kalau `logoDark` kosong → pakai `logo` di kedua mode.
- **Fallback:** kalau `logo` kosong / SiteSettings error → tampil **badge "DJ"**
  (default lama). Tidak pernah error.
- Tampil di semua halaman admin (breadcrumb) → `graphics.Icon` di-fetch per load
  (1 query global, murah).

---

## 2. Fitur Disembunyikan — "Edit Dashboard" & "Reset Layout"

Dropdown **"Dashboard ▾"** di breadcrumb step-nav (pojok kiri-atas konten)
berisi **Edit Dashboard** & **Reset Layout**. Ini bawaan Payload, **bukan**
komponen kita.

### Di mana dirender
- Payload v3.87 punya **ModularDashboard** (eksperimental) — dashboard berbasis
  widget. Komponennya:
  `@payloadcms/next/dist/views/Dashboard/Default/ModularDashboard/DashboardStepNav.js`.
- Ia menyuntik dropdown ke **step-nav breadcrumb** via `SetStepNav`. Class:
  `.dashboard-breadcrumb-select` (toggler), `.dashboard-breadcrumb-dropdown__actions`
  / `__editing` (isi popup Edit/Reset).

### Apa itu "Edit Dashboard"?
- Sistem **kustomisasi widget** bawaan Payload: masuk edit-mode → drag/resize/
  **Add Widget** (mis. widget "Collections").
- **Kenapa "Add Widget: Collections" kosong / tak berefek:** kita **tidak**
  mengonfigurasi `admin.dashboard.widgets`, DAN body ModularDashboard (tempat
  widget dirender) kita **sembunyikan** via CSS
  (`.dashboard > .dnj-dash ~ * { display:none }`, custom.css) karena kita pakai
  komponen kustom `beforeDashboard` (`DashboardStats`). Jadi target widget tidak
  terlihat → menambah widget tak berdampak.
- **Agar berfungsi di masa depan:** bangun framework widget kustom — either
  konfigurasi `admin.dashboard.widgets` (API eksperimental) ATAU adopsi penuh
  ModularDashboard (lepas komponen `beforeDashboard` kustom, buat widget sendiri).

### Apa itu "Reset Layout"?
- Mengembalikan **layout widget tersimpan** (di **user preferences** Payload) ke
  susunan default.
- Di setup kita (tanpa widget + body modular disembunyikan): klik → mereset
  layout kosong → **tak ada efek visual**. Tapi bisa membingungkan.

### Kenapa keduanya disembunyikan
- **Tidak kompatibel** dengan dashboard kustom kita (widget target disembunyikan).
- **Tidak ada manfaat fungsional** saat ini.
- **Potensi bingung / reset tak sengaja** bagi user.

### Cara HIDE (yang diterapkan) — HANYA panah ▾, teks "Dashboard" tetap
`.dashboard-breadcrumb-select` adalah **react-select** (prefix `rs`). Kita
pertahankan teks "Dashboard" (`.rs__single-value`) dan hanya sembunyikan panah +
matikan interaksinya (popup tak bisa dibuka) — di `admin/admin-global.css`
section 5:
```css
.dashboard-breadcrumb-select .rs__indicators { display: none !important; }  /* panah ▾ */
.dashboard-breadcrumb-select .rs__control {
  pointer-events: none; cursor: default; min-height: 0 !important;
  background: transparent !important; border: none !important; box-shadow: none !important;
}
.dashboard-breadcrumb-select .rs__value-container { padding: 0 !important; }
```
→ Di halaman dashboard breadcrumb tampil `[Logo] / Dashboard` (tanpa panah, tak
bisa diklik). Halaman lain (Pages/Tours/…) memakai breadcrumb normal Payload
(tidak terpengaruh — hanya dashboard yang punya `.dashboard-breadcrumb-select`).

### Cara RE-ENABLE di masa depan
1. **Unhide panah:** hapus blok `.dashboard-breadcrumb-select .rs__*` di
   `admin-global.css` (section 5) → panah + dropdown Edit/Reset kembali aktif.
2. **Agar fungsional:** perlu framework widget —
   - Konfigurasi `admin.dashboard.widgets` di `payload.config.ts` (API
     eksperimental Payload), dan/atau
   - Lepas/adaptasi `beforeDashboard` kustom + `.dashboard > .dnj-dash ~ *`
     hide-rule supaya area widget kembali terlihat.
3. **Saran fase "Customizable Dashboard" mendatang:** bangun widget kustom
   (stat, quick-access, activity) sebagai widget ModularDashboard resmi,
   menggantikan komponen `beforeDashboard` monolitik — sehingga Edit/Reset jadi
   bermakna.

**Status: HIDDEN (tidak dihapus)** — re-enable saat sistem widget kustom dibangun.

---

## 3. File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/graphics/Icon.tsx` | **Rewritten** | Server component async: fetch SiteSettings, render logo di breadcrumb (light/dark), fallback badge "DJ". |
| `apps/cms/src/admin/admin-global.css` | **Modified** | Section 5: style `.dnj-brand-icon` (logo breadcrumb, theme-swap) + sembunyikan HANYA panah react-select (`.rs__indicators`) + matikan interaksi. |
| `apps/cms/src/admin/DashboardStats.tsx` | **Reverted** | Logo di header Overview DIHAPUS (logo hanya di breadcrumb). |
| `apps/cms/src/admin/custom.css` | **Reverted** | Style `.dnj-dash__brand`/`.dnj-dash__logo-img` dihapus. |
| `globals/SiteSettings.ts` | **TIDAK diubah** | Hanya dibaca. |

## 3b. Follow-up fixes (2026-08-27)

**Logo breadcrumb terpotong → diberi ruang.** Container ikon bawaan Payload
(`.step-nav__home` 18×18 / span `.step-nav` `overflow:hidden`) memotong logo.
Fix di `admin-global.css` section 5: `.dnj-brand-icon` + wrapper-nya
(`.step-nav__home`, `.step-nav :has(> .dnj-brand-icon)`, dst) di-set
`width/height:auto; max-width:none; overflow:visible`; logo `height:28px`.

**Sidebar accordion mengikuti navigasi (UI/UX + a11y).** Dulu klik Quick Access
(mis. Users) membuka halaman tapi grup **Administration** di sidebar tidak
otomatis terbuka → item aktif tersembunyi. `NavAccordion.tsx` ditulis ulang:
- Pakai `usePathname()` → tiap pindah halaman, grup yang **memuat halaman aktif
  dibuka**, grup non-aktif **ditutup** otomatis.
- Grup aktif dideteksi dgn mencocokkan `href` link ke `pathname` (tahan race &
  tetap terbaca walau grup collapsed — Collapsible Payload = animate-height,
  anak tetap di DOM).
- Perilaku single-open (klik manual) tetap; `programmatic` ref mencegah loop.

## 4. Known limitations
- Logo dark-mode: kalau `logoDark` tidak di-set, logo light dipakai di dark
  (belum ada auto-filter kontras).
- URL logo memakai `media.url` dari Payload; jika storage/CDN berubah, `url`
  tetap mengikuti konfigurasi media.
- Edit/Reset hanya di-hide via CSS (bukan dinonaktifkan di level config) — sesuai
  aturan "jangan hapus core, hanya sembunyikan".
- Butuh login untuk verifikasi visual.
