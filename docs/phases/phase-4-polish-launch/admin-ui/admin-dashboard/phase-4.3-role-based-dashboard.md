# Phase 4.3 — Role-Based Admin Dashboard

> **Status:** ✅ Code selesai · app compile & serve OK · ⏳ screenshot per-role (butuh login)
> **Scope:** UI/UX only — tidak ada perubahan business logic, collection, global, atau API.
> **Date:** 2026-08-25
> Lanjutan [phase-4.2](phase-4.2-admin-dashboard-polish.md). Doc terpisah.

## Overview — apa yang dilihat tiap role

Satu komponen (`DashboardStats.tsx`) membaca `user.role`
(`editor | admin | super-admin`) lalu merender layout berbeda.

| Section | Super Admin | Admin | Editor |
|---------|:-----------:|:-----:|:------:|
| Stat row | ✅ 6 (Pages, Destinations, Categories, Services, Media, **Users**) | ✅ 5 (tanpa Users) | — |
| Quick Access | ✅ 6 aksi | ✅ 4 aksi | ✅ 4 aksi (**prominent, paling atas**) |
| Analytics placeholder | ✅ | ✅ | — |
| Recent Activity (10) | ✅ | ✅ | ✅ |
| System Health | ✅ full (Media, Storage, Payload, Node, Backup) | ✅ Media Usage (Media, Storage) | ✅ Media Usage |

- **Super Admin:** stat row 6 kartu → grid 2 kolom [Analytics + Quick Access | Recent Activity + System Health full].
- **Admin:** sama, stat row 5 kartu, System Health versi ringkas (Media Usage).
- **Editor:** tanpa stat/analytics. Quick Access tampil **prominent** paling atas, lalu 2 kolom [Recent Activity | Media Usage].

## Layout decisions (dari `dashboard-design2`)

Referensi utama `ai/cms/dashboard-design2` = dashboard padat, gelap, dengan
pola **dua kolom seimbang** supaya tidak ada area kosong ("kopong"):

- **Stat row padat** di atas — kartu compact (icon chip + label uppercase +
  angka besar), bukan kartu besar berisi banyak ruang kosong. Swipeable
  (SwipeTrack) di layar sempit.
- **Grid 2 kolom (`~1.9fr / 1fr`)**: kolom kiri menumpuk **Analytics +
  Quick Access**, kolom kanan menumpuk **Recent Activity + System Health**.
  Tinggi antar-kolom saling mengimbangi → ruang terisi, gap konsisten
  (`--dnj-gap: 18px`). Ini kunci "no kopong" dari design2.
- **Analytics** bukan kartu mungil — `min-height: 300px`, konten ter-center
  (icon chip besar, banner info, teks, tombol) supaya mengisi kolom kiri
  sejajar dengan Recent Activity + Health di kanan.
- **Quick Access** = grid tombol icon-atas-label (3 kolom; editor auto-fit
  prominent) — meniru "Quick Actions" design2.
- **Responsif:** ≥1440 tetap 2 kolom (cegah kartu melar); ≤1024 → 1 kolom,
  stat jadi carousel geser; ≤640 → quick access 2 kolom, stat swipe 80%.

**Warna:** design2 aslinya emerald/dark. Sesuai keputusan fase sebelumnya
(hybrid) + aturan "pakai CSS var tema dari task sebelumnya", palet tetap
brand DnJourneysBali (ocean/coral/leaf/stone) di atas token tema Payload
(light & dark). design2 dipakai untuk **layout/spacing/density**, bukan warna.

## Component architecture

- **Role detection:** `ServerProps.user.role` (server component, RSC). Tidak
  ada HTTP/endpoint baru. Pola role mengikuti `src/access/roles.ts`
  (`editor`/`admin`/`super-admin`).
- **Conditional render:** satu `DashboardStats` async. Query di-gate per role
  (mis. count `users` hanya untuk super-admin; stat hanya admin+). Section
  dipecah jadi helper (`StatRow`, `QuickAccess`, `AnalyticsCard`,
  `RecentActivity`, `SystemHealth`) lalu dikomposisi per role.
- **Swipe:** `SwipeTrack.tsx` (`'use client'`) — wheel→scroll + drag +
  native touch, tanpa library (dari 4.2).

## Data sources (Payload Local API — read-only)

| Data | Sumber |
|------|--------|
| Pages, Destinations, Categories, Media, Users | `payload.count({ collection })` |
| Services | Σ `count` dari 8 koleksi service (tours, accommodations, water-activities, yachts, restaurants, venues, rentals, spa) |
| Recent Activity | `payload.find({ sort: '-updatedAt', limit: 10 })` per 14 koleksi, digabung & di-sort, ambil 10 |
| Media files + Storage | `payload.find({ collection:'media', limit:500 })` → jumlah `filesize` |
| Node version | `process.version` |
| Payload version | `createRequire`→`payload/package.json` (best-effort, fallback `3.x`) |

Semua query pakai local API (overrideAccess default) — **tidak ada mutasi data**.

## File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/DashboardStats.tsx` | **Rewritten** | Role-based: baca `user.role`, gate query, komposisi section per role. Tambah icons (users/category/chart/server/storage/history), helper `formatBytes`, Payload/Node version, Analytics placeholder, System Health. |
| `apps/cms/src/admin/custom.css` | **Rewritten** | Layout design2: header + status pill, stat row compact, grid 2 kolom, Analytics card, Quick Access grid, System Health info rows, tombol ghost. Pertahankan rule sembunyikan konten default + swipe. |
| `apps/cms/src/admin/SwipeTrack.tsx` | Unchanged | Dipakai untuk stat row. |
| `apps/cms/src/admin/admin-global.css` | Unchanged | Sidebar/login brand (4.1–4.2). |

> Tidak ada perubahan `payload.config.ts`/importMap (path `beforeDashboard`
> tetap `/admin/DashboardStats#default`). Tidak ada perubahan collection/global.

## Verification

- **App compile & serve:** OK (login route render normal setelah perubahan).
- **Typecheck:** bersih untuk semua file (sisa error hanya di file generated
  Payload `page.tsx`/`not-found.tsx`, pre-existing).
- **Screenshot per-role:** ⏳ butuh login (kredensial di sisi user). Hanya
  bisa dilihat sesuai role akun yang login.
- **Catatan dev-server:** jika sebelumnya menambah komponen config (4.1) dan
  belum restart, restart dev server untuk membersihkan log importMap.

## Known limitations

- **Analytics belum terhubung** — Section Analytics murni placeholder UI
  (banner + tombol "Setup Analytics" non-fungsional). By design.
- **Backup non-fungsional** — "No backups configured" + link ke Site Settings;
  tidak ada sistem backup nyata.
- **Recent Activity tidak menampilkan "siapa yang mengedit"** dan **Editor
  tidak difilter per-user** — koleksi tidak punya field `updatedBy`/versions
  (mengubah collection dilarang di task UI-only). Jadi Recent Activity
  bersifat site-wide untuk semua role (diberi judul netral "Recent activity",
  bukan "Your edits", agar tidak menyesatkan).
- **Storage size = estimasi** atas maksimal 500 file media pertama (jumlah
  `filesize`), tidak termasuk ukuran varian resize.
- **Payload version** best-effort dari `payload/package.json`; fallback `3.x`
  bila resolusi package gagal di bundler.

## Future improvements

- **Audit trail nyata:** aktifkan `versions`/`drafts` atau tambah field
  `updatedBy` (via hook) supaya Recent Activity bisa tampil editor + filter
  per-user (mengaktifkan "Your edits" untuk role editor).
- **Google Analytics real** di section Analytics (GA4 Data API) menggantikan
  placeholder.
- **Backup nyata** (D1/R2 export) + tanggal backup terakhir.
- **Storage akurat** via agregasi DB (`SUM(filesize)`) daripada limit 500.
- Dark mode fine-tuning (mekanisme theme-var sudah ada).
