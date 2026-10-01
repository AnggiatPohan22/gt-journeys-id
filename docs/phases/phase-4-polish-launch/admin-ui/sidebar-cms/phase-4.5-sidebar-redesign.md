# Phase 4.5 — Sidebar Redesign (Accordion · Fixed Panel · Transitions)

> **Status:** ✅ Code selesai · app compile & serve OK · ⏳ screenshot sidebar (butuh login)
> **Scope:** UI/UX only — tidak ada perubahan collection, global, route, atau business logic.
> **Date:** 2026-08-26
> Lanjutan [phase-4.4](phase-4.4-sidebar-and-theming.md). Doc terpisah.

## Overview

Formalisasi + finalisasi sidebar: **layout 3-seksi** (header logo / menu
scroll / footer fixed), **accordion** grup, **footer selalu terlihat**
(profil user + logout + toggle tema), **scrollbar tipis**, dan **transisi
halus** di semua elemen interaktif. Semua via CSS + slot komponen resmi
Payload (`beforeNavLinks`/`afterNavLinks`) — **tanpa custom Nav**, jadi semua
menu/akses tetap dari Payload (tak ada yang hilang / rusak).

### Penambahan (2026-08-26)

- **Item "Dashboard"** di atas grup menu (di atas Pages) → `NavDashboardLink`
  (client, `usePathname()`) di `beforeNavLinks`. Pakai class `.nav__link` →
  otomatis dapat ikon (home, via `href$='/admin'`) + pill aktif. Payload default
  tak punya link Dashboard, jadi ditambah manual (bukan ubah menu bawaan).
- **Header sidebar**: logo giattech (kiri, diperbesar 24→30px). **Tombol close
  = tombol NATIVE Payload** (`.nav__header`) yang digeser ke KANAN via CSS
  (`.nav__header-content` justify-end, desktop ≥769px) → cukup **1 tombol**
  (tombol duplikat saya dihapus). `Giattech` kembali server component (logo saja).
- **Font "Dashboard"** dipin persis ke gaya item menu lain
  (`.nav__link` = 17.5px/30px, weight 400; bold hanya saat aktif).

## Struktur sidebar (hasil riset Payload)

```
.nav (sticky, h100vh, overflow hidden)
 ├─ .nav__header (absolute)         → brand/logo app (bawaan Payload)
 └─ .nav__scroll (overflow-y:auto)  → MIDDLE yang men-scroll
     └─ .nav__wrap (flex column, flex-grow:1)
         ├─ [beforeNavLinks]  → Giattech (logo developer)
         ├─ DefaultNavClient  → grup + menu (Content, Services, …)
         ├─ [afterNavLinks]   → SidebarFooter (.dnj-footer) + NavAccordion
         └─ .nav__controls    → logout+gear bawaan  → DISEMBUNYIKAN (CSS)
```

## Fixed bottom panel — pendekatan CSS (flexbox + sticky)

Karena `.nav__scroll` membungkus **semua** (menu + footer) dan tidak bisa
mengubah DOM tanpa custom Nav, footer di-pin dengan **`position: sticky;
bottom: 0`** + **`margin-top: auto`**:

- `margin-top: auto` → dorong footer ke bawah saat menu pendek.
- `position: sticky; bottom: 0` → tetap terlihat saat menu overflow & di-scroll.
- `background` opaque (match sidebar) + `border-top` → konten yang ke-scroll
  tersembunyi rapi di belakang footer.
- `padding-bottom / margin-bottom: ±(--base*2)` → footer flush ke tepi bawah
  (mengisi `padding-block-end` bawaan `.nav__scroll`).
- Native `.nav__controls` (logout + settings gear) `display:none` → fungsinya
  dipindah ke `SidebarFooter` (pakai API resmi Payload), tak ada tombol dobel.

## Accordion — implementasi teknis

- Grup Payload (`NavGroup`) **sudah** collapsible + animasi tinggi (komponen
  `Collapsible` internal — buka/tutup sudah smooth). Open-state dibaca dari
  preference server (`navPreferences.groups[label].open`), **default terbuka**.
- **Default tertutup** dicapai `NavAccordion.tsx` (client, `afterNavLinks`):
  di kunjungan pertama (ditandai `localStorage`) meng-collapse grup non-aktif
  dengan meng-klik `.nav-group__toggle`. Payload persist pilihan itu → load
  berikutnya no-op. Defensif: gagal = grup tetap terbuka, navigasi tak rusak.
- Chevron: `.nav-group__toggle svg` diberi `transition: transform .28s
  ease-in-out`; saat `.nav-group--collapsed` → `rotate(-90deg)`.

## Transition / animation specs

| Elemen | Properti | Durasi | Easing |
|--------|----------|--------|--------|
| Grup buka/tutup | height (Collapsible bawaan Payload) | ~ Payload | ease |
| Chevron | `transform: rotate` | 280ms | ease-in-out |
| Hover menu item | background | 160ms | ease |
| Active pill | background (gradient) | 160ms | ease |
| Hover profil / logout / toggle | background/color | 150ms | ease |
| Grup label | color | 150ms | ease |
| Scrollbar | color (fade saat hover) | 200ms | ease |

Tidak ada library animasi — CSS transitions saja.

## Footer components

- **SidebarFooter.tsx** (`'use client'`): kartu profil (`useAuth()` → avatar
  inisial + nama + role/email), **tombol Logout** (ikon pintu di kanan kartu,
  `useAuth().logOut()` resmi), **toggle tema** (`useTheme()`). Semua sticky
  di footer.
- **Giattech.tsx**: logo developer (swap PNG per tema) di atas menu.

## Logo dark/light — solusi sekarang & cara nambah dual-logo

- Sekarang: 2 `<img>` (`public/logo-giattech/white-logo-giattech.png` untuk
  dark, `navy-logo-giattech.png` untuk light), CSS show/hide per tema. Posisi
  tetap → toggle tak menggeser layout.
- Nambah/ganti: taruh PNG/SVG di `public/logo-giattech/`, update `src` di
  `Giattech.tsx`. Untuk logo brand utama (bukan developer), pakai
  `admin.components.graphics.Logo/Icon` (lihat [phase-4.1](phase-4.1-admin-dashboard-redesign.md)).

## Color variables (sidebar)

Semua di `admin/admin-global.css` (`:root` + `html[data-theme='dark']`).

| Var | Peran |
|-----|-------|
| `--color-base-0…1000` | Ramp netral (light→near-black) → semua surface/text sidebar via `--theme-elevation-*` |
| `--dnj-active-grad` | Pill aktif + avatar (gradient ocean→leaf) |
| `--dnj-hover-grad` | Hover item/profil/toggle |
| `--dnj-coral` | Logout hover, aksen |
| `--dnj-leaf` | Label role |
| `--theme-elevation-*` | Surface/border footer, scrollbar (auto light/dark) |

Sidebar dark = gradient `rgb(28,28,32)→rgb(12,12,15)`; footer dark solid
`rgb(13,13,16)`.

## File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/SidebarFooter.tsx` | **Created** | Footer sticky: profil user + logout (`logOut()`) + toggle tema (`useTheme()`). |
| `apps/cms/src/admin/UserCard.tsx` | **Deleted** | Digabung ke SidebarFooter. |
| `apps/cms/src/admin/AdminThemeToggle.tsx` | **Deleted** | Digabung ke SidebarFooter. |
| `apps/cms/src/admin/admin-global.css` | **Modified** | Layout 3-seksi, footer sticky, hide `.nav__controls`, scrollbar tipis, transisi chevron/hover, profil+logout+toggle. |
| `apps/cms/src/admin/NavAccordion.tsx` | Ada (4.4) | Default-collapse grup. |
| `apps/cms/src/admin/Giattech.tsx` | **Modified** | Jadi client — header row: logo (kiri, lebih besar) + close (`NavToggler`, kanan). |
| `apps/cms/src/admin/NavDashboardLink.tsx` | **Created** | Item "Dashboard" di atas grup (client, `usePathname()`). |
| `apps/cms/src/payload.config.ts` | **Modified** | `afterNavLinks` = [SidebarFooter, NavAccordion]. |
| `apps/cms/src/app/(payload)/admin/importMap.js` | **Regenerated** | UserCard/AdminThemeToggle dihapus, SidebarFooter ditambah. |

**Class Payload di-target (audit/rollback):** `.nav__scroll`, `.nav__wrap`,
`.nav__controls`, `.nav-group__toggle`, `.nav-group--collapsed`, `.nav__link`.
Tidak menyentuh form/list/editor.

> **Panduan lengkap maintenance sidebar** (tambah/hapus/ubah menu, layout,
> warna) → [`docs/guides/setup-sidebar.md`](../guides/setup-sidebar.md).

## Cara nambah grup / item menu (future)

- **Item**: tambah collection/global seperti biasa; set `admin.group` untuk
  grupnya. Nav Payload otomatis menampilkan (kita tidak hardcode item). Untuk
  **ikon** item baru: tambah mapping `--i` di `admin-global.css`
  (`.nav__link[href$='/collections/<slug>'] { --i: var(--dnj-ic-…) }`) — kalau
  tidak, pakai ikon default.
- **Grup baru**: cukup pakai nama `admin.group` baru; otomatis jadi accordion.

## Polish Pass — Design System Applied (2026-08-26)

Refinement mengikuti spec desain profesional. Semua warna via CSS variables.

### Active & hover (halus, bukan blob)

- **Active**: tint aksen translucent + **bar aksen 3px di kiri** (`::after`),
  teks & ikon warna aksen, weight **500**, radius **8px**. Bukan gradient blob.
- **Hover**: geseran netral halus dari bg sidebar (5%), radius 8px, 150ms.

### Color variables (dark & light)

| Variable | Light | Dark | Peran |
|----------|-------|------|-------|
| `--dnj-accent` | `#1b3a4b` (ocean) | `#8bd6b6` (mint) | Teks/ikon/bar item aktif |
| `--dnj-active-bg` | `rgba(27,58,75,0.08)` | `rgba(139,214,182,0.12)` | Tint background aktif |
| `--dnj-hover-bg` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.05)` | Background hover |
| `--dnj-active-grad` | ocean→leaf | `#24506a`→`#6b9080` | Avatar + tombol login (bukan nav) |
| `--color-base-0…1000` | ramp netral (putih→hitam) | (invert) | Semua surface/text via `--theme-elevation-*` |
| `--dnj-coral` | `#e07a5f` | sama | Logout hover |

> Diverifikasi via computed style (login route): keenam token resolve tepat
> di light & dark.

### Spacing & typography

- **Grid 4px**: padding item 8×12px, gap ikon-label 10px, margin item 2px,
  radius 8px, bar aktif 3×18px, avatar 34px.
- **Item menu**: `.nav__link` 17.5px / line-height 30px, weight 400 (aktif 500).
- **Grup label**: 11px, weight 700, uppercase, letter-spacing 0.08em.
- **Footer**: profil radius 12px, toggle radius 10px, padding 8px; border-top
  pemisah dari menu.

### Transitions

- Hover bg **150ms** ease · warna teks/aktif **200ms** · chevron **250ms**
  (rotate **180°** saat collapse) · theme switch (bg/border sidebar) **200ms** ·
  grup buka/tutup = animasi tinggi bawaan Payload (Collapsible).

### Accordion

- **Single-open**: `NavAccordion` menutup grup lain saat satu grup dibuka
  (listener klik, capture phase; klik programatik untuk menutup tidak
  meng-cascade). First-load: hanya grup halaman aktif yang terbuka.

### Scrollbar

- Lebar **4px**, thumb rounded muted semi-transparan, track transparan,
  muncul saat hover `.nav__scroll` (Chrome `::-webkit-scrollbar`, Firefox
  `scrollbar-color`).

## Known limitations

- Accordion default-collapse = trik kunjungan-pertama (localStorage + klik
  toggle), bukan API resmi → mungkin 1x animasi collapse di load pertama.
- `.nav__controls` bawaan (settings gear) disembunyikan; akun diakses via kartu
  profil (→ `/admin/account`), logout via tombol footer.
- Scrollbar fade "on scroll" penuh tak didukung CSS lintas-browser; dipakai
  fade **on hover** (Chrome via `::-webkit-scrollbar`, Firefox via
  `scrollbar-color`).
- Avatar = inisial (Users belum punya field foto).
- Screenshot final butuh login (kredensial di sisi user).

## Future improvements

- Custom Nav component penuh bila ingin default-collapse tanpa localStorage +
  DOM 3-seksi murni (footer benar-benar di luar area scroll).
- Field `avatar` (upload) di Users untuk foto profil asli.
- Sidebar collapse icon-only (rail).
