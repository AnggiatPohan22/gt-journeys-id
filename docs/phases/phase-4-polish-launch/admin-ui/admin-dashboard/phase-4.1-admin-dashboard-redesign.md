# Phase 4.1 — Admin Dashboard Redesign

> **Status:** ✅ Code selesai · ⏳ butuh verifikasi visual (login admin)
> **Scope:** UI/UX only — tidak ada perubahan business logic, data model, atau API.
> **Date:** 2026-08-25

## Overview

Redesign halaman **Overview** dashboard admin Payload (`/admin`) supaya
tampil profesional & polished, terinspirasi referensi desain
`ai/cms/emerald_voyage_main_dashboard`. Perubahan sepenuhnya kosmetik:
komponen `beforeDashboard` yang sudah ada di-upgrade + ditambah stylesheet
kustom yang di-scope ketat.

Yang dulu: 4 stat card polos (inline style) + list "Recent Activity" sederhana.
Sekarang: header sambutan, **hero card gradient** + grid stat card dengan
icon-chip, baris **Quick Actions**, dan panel **Recent Activity** yang
di-restyle dengan icon per tipe konten.

## Design decisions

**Diambil dari referensi (Emerald Voyage):**
- Layout card "floating" rounded dengan hover lift + soft shadow.
- Hero stat card ber-gradient (metrik utama) vs stat card sekunder.
- Icon-chip (kotak rounded ber-tint) di tiap card & action.
- Section label uppercase kecil ("Quick actions", "Recent activity").
- Grid responsif auto-fit yang runtuh rapi ke 1 kolom di layar sempit.

**Diadaptasi / TIDAK diambil:**
- **Palet warna** — referensi pakai emerald hijau; kita tetap pakai brand
  DnJourneysBali (`ocean #1B3A4B`, `coral #E07A5F`, `leaf #6B9080`,
  `stone #3D405B`). Referensi murni acuan layout, bukan warna.
- **Sidebar / top bar** referensi TIDAK ditiru — kita pakai chrome bawaan
  Payload (nav, topbar, form) supaya semua fungsi CRUD/navigasi tetap utuh.
- Chart/tabel finansial referensi tidak relevan → diganti data CMS nyata.
- Warna surface/teks memakai CSS var tema Payload (`--theme-elevation-*`,
  `--theme-text`) → otomatis benar di **light & dark mode**.

**Data ditampilkan (semua real count via Payload local API):**
- Pages (total + breakdown published/draft) — hero card
- Service Listings (jumlah gabungan 8 modul service)
- Active Services (service-types status active)
- Destinations, Testimonials, Media
- Recent Activity: 6 edit terbaru lintas 13 koleksi
- Quick Actions: New Page, New Tour, Media Library, Testimonials,
  Header & Footer, Site Settings

## File impact

### Pass 1 — Dashboard overview

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/DashboardStats.tsx` | **Modified** | Rewrite: tambah hero card, icon SVG inline, quick actions, service-listing count, restyle recent activity. Tetap Server Component async (local API). |
| `apps/cms/src/admin/custom.css` | **Created** | Stylesheet dashboard, SEMUA rule di-scope `.dnj-dash`. Di-import dari `DashboardStats.tsx`. |

### Pass 2 — Login + sidebar branding

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/graphics/Logo.tsx` | **Created** | Brand logo (badge monogram gradient + wordmark) menggantikan logo default di halaman login. `admin.components.graphics.Logo`. |
| `apps/cms/src/admin/graphics/Icon.tsx` | **Created** | Brand icon kecil untuk header sidebar. `admin.components.graphics.Icon`. |
| `apps/cms/src/admin/BeforeLogin.tsx` | **Created** | Tagline sambutan di atas form login. `admin.components.beforeLogin`. |
| `apps/cms/src/admin/AdminStyles.tsx` | **Created** | Provider (`'use client'`) yang import `admin-global.css` → satu-satunya cara load CSS global di semua route admin. `admin.components.providers`. |
| `apps/cms/src/admin/admin-global.css` | **Created** | CSS global additive: accent coral pada nav item aktif (`.nav__link-indicator`) + tombol login ocean (scoped `.login`) + tagline. Brand var di `:root`. |
| `apps/cms/src/payload.config.ts` | **Modified** | Tambah `beforeLogin`, `providers`, `graphics.Logo`, `graphics.Icon` di `admin.components`. (Sempat coba `admin.css` — tidak ada di tipe Payload v3 ini — lalu di-revert; CSS di-load via provider/komponen.) |
| `apps/cms/src/app/(payload)/admin/importMap.js` | **Regenerated** | `payload generate:importmap` menambah 5 komponen baru. |

> Registrasi `beforeDashboard` tidak berubah. Komponen baru butuh importMap
> regenerate (sudah dilakukan).

**Payload class yang di-target CSS global (untuk audit / rollback):**
`.nav__link-indicator`, `.nav__link:has(.nav__link-indicator) .nav__link-label`,
`.login .btn--style-primary`, `.login__brand`. Tidak menyentuh form/list/editor.

## Before / after (deskripsi layout)

**Before:** Judul "Overview" → 4 kartu angka rata (border kiri berwarna,
inline style) → satu kartu "Recent Activity" berisi list teks + badge.

**After:**
1. Header: "Overview" + subjudul sambutan.
2. Grid stat: kartu **hero gradient ocean→leaf** (Pages) + 5 kartu sekunder
   (Service Listings, Active Services, Destinations, Testimonials, Media),
   masing-masing dengan icon-chip ber-tint & hover lift.
3. "QUICK ACTIONS": 6 tombol-kartu link ke create/list/global tersering.
4. "RECENT ACTIVITY": panel berisi 6 baris (icon tipe + judul + label + waktu
   relatif), row hover highlight, klik → dokumen terkait.

Konten di bawah komponen ini (list koleksi bawaan Payload) tidak berubah.

## Cara customize lanjutan

- **Ubah/ tambah stat card:** edit array `stats` di `DashboardStats.tsx`.
  Tambah `safeCount(payload, '<slug>', where?)` lalu push objek `{label,
  value, sub, accent, icon}`.
- **Ubah quick actions:** edit array `actions` (title/desc/href/accent/icon).
- **Tambah icon:** tambah key baru di objek `p` dalam komponen `Icon`
  (path SVG stroke, `viewBox 0 0 24 24`).
- **Ubah warna/spacing/hover:** edit `custom.css` — token brand ada di
  blok `.dnj-dash { --dnj-* }`.
- **Warna brand** sengaja hardcode (`BRAND` di komponen + `--dnj-*` di CSS)
  karena tetap terbaca di light & dark; surface/teks tetap ikut tema Payload.

## Verification

- **Login page — TERVERIFIKASI (DOM):** logo brand render ("DJ /
  DnJourneysBali / BALI TRAVEL CMS"), tagline tampil, tombol submit =
  `rgb(27,58,75)` (ocean `#1B3A4B`), stylesheet global (`admin-global.css`)
  ter-load. Konfirmasi provider global CSS + `graphics.Logo` + `beforeLogin`
  bekerja.
- **Sidebar active nav & dashboard overview — pending login:** mekanisme sama
  (provider CSS global sudah terbukti load di semua route), tapi butuh sesi
  login untuk screenshot. Typecheck bersih untuk semua file.
- Screenshot belum bisa diambil (Browser pane belum ditampilkan di sisi user).

## Known limitations
- Tidak ada grafik/tren (referensi punya chart cash-flow) — CMS belum punya
  data time-series yang relevan, jadi sengaja dihilangkan.
- Redesign hanya menyentuh **halaman Overview**. List/edit/global view masih
  memakai UI default Payload (memang disengaja demi keamanan fungsi).
- Import global CSS lewat komponen valid di Next app router (dipakai Payload
  v3). Kalau kelak upgrade Payload menyediakan opsi `admin.css`, bisa pindah
  ke sana untuk lebih idiomatik.
