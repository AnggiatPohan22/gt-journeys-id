# Phase 4.6 — Dashboard Refinement (Stat Row + Quick Access)

> **Status:** ✅ Code selesai · compile & serve OK · ⏳ screenshot per-role (login)
> **Scope:** UI/UX only — read-only queries, tidak ada perubahan collection/route.
> **Date:** 2026-08-26
> Lanjutan [phase-4.3](phase-4.3-role-based-dashboard.md). Sidebar (4.4–4.5) sudah OK.

## Overview

Merapikan dashboard admin (`beforeDashboard` → `DashboardStats.tsx`) sesuai
feedback: stat row lebih **minimalis & 1 baris tanpa swipe**, Quick Access jadi
**ikon-only per role**, dan pill "System online" dihilangkan.

## Perubahan

### 1. Stat row "At a glance" — compact, 1 baris, tanpa swipe
- **Hapus swipe** (SwipeTrack tidak dipakai lagi) → `flex` `flex-wrap`, tiap
  kotak `flex: 1` sehingga proporsional dalam satu baris (wrap otomatis di
  layar sempit = responsif).
- Kotak **diperkecil / minimalis**: padding 10–12px, ikon 26px, angka 20px,
  label 10px uppercase (sebelumnya 15px/36px/27px).
- **Jumlah kotak per role:**
  - **Super Admin: 6** — Pages, Destinations, Categories, Services, Media, Users
  - **Admin: 5** — tanpa Users
  - **Editor: 5** — sama dengan Admin (sebelumnya editor tak punya stat row)

### 2. "System online" (pojok kanan atas) — DIHILANGKAN
Pill status dihapus dari header (tidak informatif).

### 3. Quick Access — ikon-only, per role, maks 10
- **Tanpa teks** → tombol kotak kecil (46px) ber-tint warna accent, **nama via
  tooltip** (`title`/`aria-label`) saat hover. Frame membatasi **maksimal 10**.
- **Super Admin (8):** New Page · New Destination · New Category · Menu ·
  Media · Users · Site Features · Site Settings
- **Admin (10):** Pages · Tours · Accommodation · Water Activities · Yachts ·
  Restaurants · Venues · Rentals · Spa · Menu
- **Editor (10):** Pages · Tours · Accommodation · Water Activities · Yachts ·
  Restaurants · Venues · Rentals · Spa · Media
- Tiap service punya **ikon berbeda** (compass, bed, wave, anchor, utensils,
  building, car, flower, dll) supaya tetap terbaca walau tanpa teks.

### 4. Tooltip kustom Quick Access (semua role)
Tooltip bawaan (`title`) diganti tooltip kustom (`::after` + `data-tip`):
muncul **di bawah box** saat hover (slide turun), dan **slide naik seolah masuk
kembali ke button** + fade saat kursor dilepas. Bukan lagi tooltip browser di
bawah kursor.

### 5. System Health / Media Usage → horizontal di bawah Quick Access
Dipindah dari kolom kanan ke **strip full-width horizontal** di bawah konten
(`horizontal` prop → info jadi chip berjajar/wrap), sehingga panel lebar &
pendek — tidak memanjang ke bawah. Berlaku untuk semua role yang punya panel
ini (super = System Health full, admin/editor = Media Usage).

## File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/DashboardStats.tsx` | **Modified** | Stat untuk semua role; StatRow tanpa SwipeTrack; QuickAccess ikon-only + slice(10); list aksi per role; hapus pill online; tambah 9 ikon service; hapus import SwipeTrack. |
| `apps/cms/src/admin/custom.css` | **Modified** | `.dnj-statgrid` (flex 1 baris) + `.dnj-stat` compact; `.dnj-qa` jadi tombol ikon-only ber-tint; bersihkan CSS `.dnj-track*` & media query lama. |
| `apps/cms/src/admin/SwipeTrack.tsx` | Tidak dipakai | Masih ada (harmless); bisa dihapus nanti. |

## Known limitations

- **Admin "services tergantung yang diaktifkan superadmin":** saat ini semua
  10 aksi ditampilkan; belum difilter berdasarkan status aktif `service-types`
  (belum ada pemetaan 1:1 yang pasti antar koleksi service & service-type).
  Future: filter berdasarkan service-type aktif.
- Quick Access ikon-only → nama hanya via tooltip (bukan teks). Sesuai
  permintaan ("tanpa teks kalau bisa").
- Butuh login untuk screenshot per-role (kredensial di user).

## Future

- Filter Quick Access admin berdasarkan modul yang diaktifkan.
- Hapus `SwipeTrack.tsx` bila benar-benar tak dipakai lagi di tempat lain.
