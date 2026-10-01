# Phase 4.4 — Sidebar Redesign & Light/Dark Mode Theming

> **Status:** ✅ Code selesai · theming terverifikasi (computed styles, login) · ⏳ screenshot sidebar/dashboard (butuh login)
> **Scope:** UI/UX only — tidak ada perubahan collection, global, route, atau business logic.
> **Date:** 2026-08-26 (revisi mengikuti referensi `dashboard-design4` + permintaan user)
> Lanjutan [phase-4.3](phase-4.3-role-based-dashboard.md). Doc terpisah.

## Overview

Referensi utama sidebar: **`ai/cms/dashboard-design4`** ("Cybernetic Void" —
sidebar hitam pekat glossy, grup collapsible + ikon per item, active pill,
bawah ada toggle tema + logout + kredit). Permintaan spesifik user:

1. Sidebar mengikuti design4.
2. **Grup menu (Content, Services, dst) default TERTUTUP**, buka saat diklik.
3. **Ikon di setiap item** sidebar.
4. **Space logo developer "giattech"** di atas; di **light mode** pindah ke
   bawah dekat logout.
5. **Logout dibuat button** supaya area bawah tidak kosong.
6. Warna dark: **hitam (bukan navy) dengan kesan glossy**.
7. Active/hover: **ada sentuhan gradasi (gradient)**.

### Revisi lanjutan (2026-08-26)

- **Logo giattech = file asli** (`apps/cms/public/logo-giattech/`):
  `white-logo-giattech.png` untuk **dark**, `navy-logo-giattech.png` untuk
  **light**. (File `navy-logo-giattech .png` yang ada spasi di nama **di-rename**
  hilangkan spasinya.) Logo **posisi tetap di atas** sidebar — hanya gambar
  yang di-swap per tema.
- **Toggle Light/Night = tetap di bawah dekat Logout** (kedua mode). Saat
  diklik, **tidak ada pergeseran posisi** apa pun — hanya warna/gambar yang
  berubah. (Trik lama "giattech pindah atas↔bawah per tema" DIHAPUS karena
  menggeser layout; semua override tema sekarang colour/content-only.)
- **Kartu user login** di bawah dekat Logout: avatar (inisial) + nama + role
  (Super Admin / Admin / Editor) via `UserCard` (client, `useAuth()`).
  Referensi `dashboard-design4`. Klik → `/admin/account`.

## Cara Payload menangani tema (hasil riset)

- **Light/dark native: YES.** `admin.theme: 'all'` (default) → toggle tersedia.
  Payload set `html[data-theme="light|dark"]` + preference user. Toggle bawaan
  ada di **Account** (`/admin/account` → Theme). Kita tambah toggle terlihat di
  sidebar (`AdminThemeToggle`, pakai hook resmi `useTheme()` → tetap sinkron).
- **Satu ramp greyscale** `--color-base-0…1000` (di `@payloadcms/ui`
  `scss/colors.scss`) menurunkan semua warna:
  - light `:root`: `--theme-elevation-N = --color-base-N` (0 = putih).
  - dark `html[data-theme=dark]`: `--theme-elevation-0 = --color-base-900`,
    `-50 = base-850`, … (ujung gelap ramp dipakai jadi surface dark).
  → **Override ramp = re-theme dua mode sekaligus**, kontras bawaan terjaga.
- **Default grup nav = terbuka**, open-state dibaca dari preference server
  (`navPreferences.groups[label].open`). Tidak ada opsi config untuk
  default-collapse → lihat solusi accordion di bawah.

## Bagian 1 — Sidebar

- **Warna hitam glossy (bukan navy):** ramp dibuat **netral** (abu tanpa
  tint biru); ujung gelap near-black (`base-900 = rgb(17,17,20)`,
  `base-1000 = rgb(4,4,6)`). "Glossy" = gradient di sidebar
  (`linear-gradient(180deg,#1c1c20→#0c0c0f)`) + sheen diagonal tipis di card
  (`custom.css`, blok `html[data-theme=dark]`).
- **Ikon per item** (permintaan #3): CSS `.nav__link::before` pakai
  `mask-image` SVG (di-tint `currentColor`, jadi ikut warna item/aktif).
  Tiap href di-map ke ikon lewat variabel `--i` (end-anchored, presisi):
  Pages→doc, Destinations→pin, Destination Types→tag, Categories→grid,
  Testimonials→star, 8 koleksi Services→layers, Menus→menu, Media→image,
  Users→users, Site Settings→gear, Header/Footer→layout, dst. Fallback =
  ikon default. **Tidak** pakai custom Nav → semua item & akses tetap dari
  Payload (tidak ada yang hilang / rusak).
- **Active & hover = gradient** (permintaan #7): active pill
  `linear-gradient(135deg, #1b3a4b→#4d7d66)` (dark sedikit lebih terang),
  hover pill gradient brand transparan.
- **Grup accordion default-tertutup** (permintaan #2): komponen client
  `NavAccordion` (`afterNavLinks`) meng-collapse grup non-aktif **sekali di
  kunjungan pertama** (ditandai `localStorage`), lalu buka/tutup native
  Payload. Defensif: kalau DOM Payload berubah, grup cuma tetap terbuka —
  navigasi tak pernah rusak.
- **giattech** (permintaan #4): komponen `Giattech` dua slot —
  `beforeNavLinks` (Top) & `afterNavLinks` (Bottom). CSS tampilkan **Top di
  dark**, **Bottom (dekat logout) di light/system**.
- **Logout jadi button** (permintaan #5): `.nav__log-out` di-style full-width
  bertepi coral + hover gradient. Toggle tema + giattech(light) + logout
  mengisi area bawah agar tidak kosong.
- **Grup label** (Content/Services/Site Builder/Administration/Settings)
  distyle uppercase kecil; grouping ini **sudah** berasal dari `admin.group`
  koleksi (tidak diubah).

## Bagian 2 — Palet warna (CSS variables)

Semua warna via variabel — ubah di `admin/admin-global.css`.

### Neutral ramp (light→dark, dipakai dua mode)

| Var | Hex/RGB | Peran |
|-----|---------|-------|
| `--color-base-0` | rgb(250,250,251) | Light bg (elevation-0) |
| `--color-base-50` | rgb(244,244,246) | Light card low |
| `--color-base-100` | rgb(235,235,238) | Border light |
| `--color-base-500` | rgb(118,118,126) | Muted text (dua mode) |
| `--color-base-800` | rgb(34,34,39) | Dark card |
| `--color-base-850` | rgb(25,25,29) | Dark container-low |
| `--color-base-900` | rgb(17,17,20) | **Dark app bg (near-black)** |
| `--color-base-1000` | rgb(4,4,6) | Deepest black |

> Netral (tanpa biru) = dark tampil hitam, bukan navy. Nilai luminance dekat
> default Payload → kontras form/tabel/input aman.

### Brand & gradient

| Var | Value | Peran |
|-----|-------|-------|
| `--dnj-ocean` | #1B3A4B | Primary |
| `--dnj-coral` | #E07A5F | Accent (logout, hover) |
| `--dnj-leaf` | #6B9080 | Accent sekunder |
| `--dnj-stone` | #3D405B | Accent sekunder |
| `--dnj-active-grad` | `linear-gradient(135deg,#1b3a4b→#4d7d66)` (dark: `#24506a→#6b9080`) | Active pill, tombol login |
| `--dnj-hover-grad` | gradient brand transparan | Hover pill / toggle |
| `--dnj-ic-*` | SVG data-URI | Ikon sidebar per item |

Surface/teks memakai `--theme-elevation-*`/`--theme-text` Payload → ikut
light/dark otomatis.

### Cara ganti warna nanti

- **Ubah keseluruhan surface** (light+dark): edit blok ramp `--color-base-*`.
- **Dark lebih/kurang hitam**: geser `--color-base-850/900/1000`.
- **Warna brand/aktif/hover**: edit `--dnj-ocean`/`--dnj-*grad`.
- **Ikon item**: edit `--dnj-ic-*` (data-URI) atau map `--i` per href.
- **Glossy dark card**: blok `html[data-theme=dark] .dnj-*` di `custom.css`.

## Theme toggle — lokasi

- Bawaan Payload: **Account → Theme** (Auto/Light/Dark).
- Ditambah: tombol **"Light/Dark mode"** di sidebar bawah (`afterNavLinks`),
  sinkron via `useTheme()`.

## File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/admin-global.css` | **Rewritten** | Ramp netral black-end, sidebar glossy dark, gradient active/hover, ikon per item, logout button, giattech per-tema, toggle, login gradient. |
| `apps/cms/src/admin/custom.css` | **Modified** | Tambah blok glossy dark untuk card dashboard + status pill. |
| `apps/cms/src/admin/Giattech.tsx` | **Rewritten** | Logo giattech (2 `<img>` PNG, swap per tema, posisi tetap di atas). |
| `apps/cms/src/admin/UserCard.tsx` | **Created** | Kartu user login (avatar inisial + nama + role) via `useAuth()`. |
| `apps/cms/src/admin/NavAccordion.tsx` | **Created** | Client — grup default-collapse di kunjungan pertama. |
| `apps/cms/src/admin/AdminThemeToggle.tsx` | Ada (4.4 awal) | Toggle light/dark via `useTheme()`. |
| `apps/cms/public/logo-giattech/navy-logo-giattech.png` | **Renamed** | Dari `navy-logo-giattech .png` (buang spasi di nama). |
| `apps/cms/src/payload.config.ts` | **Modified** | `beforeNavLinks` (Giattech), `afterNavLinks` (UserCard, ThemeToggle, NavAccordion). |
| `apps/cms/src/app/(payload)/admin/importMap.js` | **Regenerated** | Komponen baru terdaftar. |

**Class Payload yang di-target (audit/rollback):** `.nav`, `.nav__link`
(+`::before`), `.nav-group__toggle`, `.nav__link-indicator`, `.nav__log-out`,
`--color-base-*`. Tidak menyentuh form/list/editor.

## Verifikasi

- **Computed styles (login route, publik):** `--color-base-900 = rgb(17,17,20)`
  (near-black, bukan navy), `--dnj-active-grad` gradient aktif, tombol login
  render gradient, variabel ikon (`--dnj-ic-doc`) ter-load. App compile & serve OK.
- **Typecheck:** bersih untuk semua file (sisa error hanya di file generated
  Payload, pre-existing).
- **Sidebar/dashboard (dark+light), accordion, ikon, giattech, logout button:**
  ⏳ butuh **login** untuk screenshot (kredensial di sisi user).
- **Restart dev server** diperlukan setelah menambah komponen config
  (`beforeNavLinks`/`afterNavLinks`) agar importMap ter-bundle ulang.

## Deskripsi tampilan (dark vs light)

- **Dark:** sidebar hitam glossy (gradient + edge highlight), item ber-ikon,
  active = pill gradient ocean→leaf bercahaya, grup tertutup default. giattech
  di atas. Card dashboard hitam dengan sheen diagonal tipis (kesan kaca).
- **Light:** surface abu netral bersih, card putih, active pill gradient sama,
  giattech pindah ke bawah dekat tombol Logout (button coral).

## Known limitations

- **Accordion default-collapse** = trik kunjungan-pertama (localStorage +
  klik toggle), bukan API resmi Payload → ada kemungkinan 1x animasi collapse
  di load pertama. Tidak memengaruhi navigasi.
- **giattech** memakai file logo resmi (`public/logo-giattech/*.png`,
  terverifikasi HTTP 200). Nama `navy-logo-giattech .png` (ada spasi) sudah
  di-rename → `navy-logo-giattech.png`.
- **UserCard** avatar = inisial (koleksi Users belum punya field foto). Tambah
  field `avatar` (upload) kalau mau foto asli.
- Ikon per item via CSS attribute-selector → jika slug koleksi berubah, map
  ikon perlu ditambah (fallback ikon default tetap tampil).
- Screenshot final belum diambil (Browser pane belum ditampilkan / butuh login).

## Future improvements

- Ganti trik accordion dengan **custom Nav component** penuh bila ingin
  default-collapse tanpa localStorage + kontrol layout total.
- Logo giattech asli (SVG) + link ke situs giattech.
- Sidebar collapse icon-only (rail) seperti tombol "<" di design4.
