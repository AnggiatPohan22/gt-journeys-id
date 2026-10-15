## Phase: 4.60.2 — "Choose from existing" Media Picker (ListDrawer)
**Tanggal**: 2026-09-25
**Status**: Selesai (verified via browser pane, login super-admin)
**Dikerjakan oleh**: Claude Code (Opus 4.8)
**Berkaitan dengan**: [`phase-4.60.1-media-edit-compact.md`](phase-4.60.1-media-edit-compact.md),
[`phase-4.59-cms-bugs.md`](phase-4.59-cms-bugs.md) — kelanjutan pembenahan Media CMS.

### Ringkasan
Drawer **"Choose from existing"** (Payload `ListDrawer`) pada field upload yang
menunjuk ke collection `media` — mis. **Featured Image** di
`/admin/collections/ferry-tickets/1` — dirapikan. Sebelumnya baris tabel setinggi
**185px** karena kolom Preview me-render gambar ukuran natural (**217×163**), plus
thumbnail kecil duplikat di kolom File Name. **Selain berantakan, picker-nya juga
rusak fungsional**: klik thumbnail justru **navigasi ke edit view** (`Leave without
saving`), bukan memilih gambar. Kedua masalah diperbaiki: baris kini **70px**,
thumbnail seragam **72×54**, dan klik thumbnail **memilih gambar + menutup drawer**.

### Akar Masalah
1. **Layout** — `MediaListEnhancer` hanya menulis `body[data-view-mode]` pada
   *route* list Media (`/admin/collections/media`), bukan di dalam drawer (drawer =
   portal overlay, bukan navigasi). Semua CSS ukuran thumbnail di `media-list.css`
   di-scope ke `body[data-view-mode]`, jadi di drawer thumbnail render tanpa batas.
2. **Selection rusak** — kolom `thumbnail` adalah *linked column* (paling depan) &
   punya **custom Cell** (`MediaThumbnailCell`). Payload merender custom Cell lewat
   `RenderCustomComponent` dan **melewati `RenderDefaultCell`** — padahal justru di
   situ Payload membungkus linked cell dengan `<button onClick={onSelect}>` saat di
   dalam ListDrawer. Akibatnya `onSelect` tak pernah terpasang; `MediaThumbnailCell`
   malah selalu render `<a href={edit}>` (via fallback `collectionSlug`+`id`) → klik
   = navigasi keluar. (Verified di `@payloadcms/ui/dist/providers/TableColumns/
   RenderDefaultCell` & `buildColumnState/renderCell.js`.)

### Solusi
- `MediaThumbnailCell` dijadikan **client component** & sadar konteks drawer via
  `useListDrawerContext()` (aman di luar drawer: context default `{}`). Di dalam
  drawer → render `<button>` yang memanggil `onSelect({collectionSlug, doc, docID})`
  (kontrak sama dgn `RenderDefaultCell`; handler upload field = `onListSelect` yang
  set value + `closeListDrawer()`). Di luar drawer → tetap `<a href={edit}>` (perilaku
  list lama tak berubah).
- CSS baru di `media-list.css` di-scope **`.list-drawer .collection-list--media`**
  saja (tak menyentuh route list utama maupun drawer collection lain): thumbnail
  kompak 72×54, baris center, hover-ring (`--theme-success-500`) sbg afordансi klik,
  dan sembunyikan thumbnail duplikat di kolom File Name.

### Addendum — kontrol Detail / S / M / L di dalam drawer (2026-09-25)
Atas permintaan owner, ditambah kontrol kepadatan **Detail / S / M / L** langsung di
toolbar drawer supaya user bisa atur sendiri (default **Detail** = list kompak).
- `MediaListEnhancer` mendeteksi drawer media (`.list-drawer` yang memuat
  `.collection-list--media`) via MutationObserver — **route-independent**, karena
  drawer bisa terbuka dari edit view collection mana pun. Kontrol di-portal ke
  `.list-drawer .search-bar__actions` (sebelah Columns/Filters).
- State khusus drawer: `localStorage['dnj-media-drawer-view']` + atribut
  `data-drawer-view` pada elemen `.list-drawer` (via `.closest`) — **tidak** menulis
  `body[data-view-mode]`, jadi mengatur picker tak pernah mengubah route list utama.
- **S/M/L** = grid kartu responsif (`auto-fill minmax` 112/168/240px, thumbnail
  96/132/180px, nama file sbg caption); **Detail** = list kompak baseline. Pemilihan
  tetap jalan di semua mode (thumbnail = `<button>` onSelect).
- **Bug fix (dari laporan owner)**: di S/M/L gambar tak muncul & tak bisa diklik —
  penyebab: rule Detail `td.cell-thumbnail { width: 1% }` masih menang di grid → sel
  menciut ~1px. Ditambah override `td.cell-thumbnail { width: 100% }` khusus mode
  `data-drawer-view=s/m/l`. Verified: S=6 kolom, M=4 kolom (190×132), L=3 kolom;
  klik kartu memilih gambar + menutup drawer.

### Addendum — cakupan seluruh project + dukungan video (2026-09-25)
Owner minta perbaikan ini diterapkan ke **semua collection/service** (aktif maupun
nonaktif) dan memastikan setiap tombol **"Choose from existing"** (pilih image **atau
video** dari database) mengikuti tampilan yang sama agar selaras.

**Temuan arsitektur — sudah universal secara desain:**
- Project ini hanya punya **satu** upload collection: `media` (`upload: true`).
  Audit: **46** field `relationTo: 'media'` di seluruh collection/field/block, dan
  **0** upload `hasMany` → semua picker adalah single-select ke collection `media`.
- Karena `MediaThumbnailCell`, CSS drawer (`.list-drawer .collection-list--media`),
  dan kontrol Detail/S/M/L semuanya di-scope ke **collection media** (bukan per
  collection sumber), maka SETIAP "Choose from existing" — dari Tours, Accommodations,
  Rentals, FerryTickets, **maupun collection nonaktif** (Spa, Yachts, Restaurants,
  Venues, WaterActivities, dll.) — otomatis memakai tampilan yang sama. **Tidak perlu
  perubahan per-collection.**
- `media.upload.mimeTypes` mencakup `video/mp4`, dan field video (`videoFile`,
  `videoPoster` di `fields/media.ts`) juga `type: 'upload' relationTo: 'media'` →
  memakai drawer yang sama.

**Dukungan video (agar image + video selaras):**
- `MediaThumbnailCell` kini mendeteksi `mimeType` `video/*` dan menampilkan **ikon
  play-badge** yang khas (bukan ikon dokumen generik), memakai class
  `.dnj-media-thumb__icon` yang sama → ukuran/posisi konsisten di Detail & grid.
- Catatan: saat ini DB berisi 64 media, **semuanya image (0 video)**, jadi tampilan
  video terverifikasi secara logika/kode; visual video akan otomatis mengikuti begitu
  ada aset video di-upload.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/admin/MediaThumbnailCell.tsx` | Server → **client component**; tambah `useListDrawerContext()`; cabang drawer render `<button onClick={onSelect}>` (select + close), di luar drawer tetap `<a href={edit}>`. Addendum: deteksi `video/*` → ikon play-badge khusus (image+video selaras). |
| `apps/cms/src/admin/MediaListEnhancer.tsx` | Addendum: `DrawerDensityControl` (Detail/S/M/L) + effect deteksi drawer media (MutationObserver, route-independent) + portal ke `.search-bar__actions`; state `dnj-media-drawer-view` → atribut `data-drawer-view` di `.list-drawer`. |
| `apps/cms/src/admin/media-list.css` | Blok "Phase 4.60.2" — rules `.list-drawer .collection-list--media`: thumbnail 72×54, baris center, hover/focus ring, hide duplikat `.cell-filename .file__thumbnail`. Addendum: styling `.dnj-drawer-density*` + grid transform `.list-drawer[data-drawer-view=s/m/l]` (termasuk override `cell-thumbnail width:100%`). |

### Impact
- **Database**: none.
- **CMS**: picker "Choose from existing" untuk semua field upload → collection
  `media` (Featured Image, Gallery, dll.) kini rapi & fungsional. Berlaku umum
  (config/CSS global), bukan per-field.
- **Frontend (web)**: none.
- **Routes**: none.
- **RBAC**: none.
- **Deploy needed**: cms (UI admin).

### Sebelum → Sesudah (terukur)
| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| Tinggi baris | 185px | **70px** |
| Ukuran thumbnail Preview | 217×163 (natural) | **72×54** (uniform, `object-fit: cover`) |
| Thumbnail duplikat di File Name | tampil | **disembunyikan** |
| Klik thumbnail | navigasi ke edit (`Leave without saving`) | **pilih gambar + tutup drawer** |

### Testing (verified via browser pane, login super-admin, dark mode)
- [x] `ferry-tickets/1` → Featured Image → "Choose from existing": baris kompak 70px,
  info terbaca `Preview · File Name · Alt Text · Updated At`.
- [x] Klik thumbnail `singapore.jpg` → Featured Image ter-set (`265KB — 1264x848`),
  drawer tertutup, **tanpa** navigasi/`Leave without saving`.
- [x] Hover thumbnail → ring `--theme-success-500` muncul (afordansi klik).
- [x] Metrik via JS: rowH 70, thumb `<button>` 72×54, img 70×52, duplikat `display:none`.
- [x] Warna pakai `--theme-*` token → aman light/dark otomatis.
- [x] `npx tsc --noEmit` — tak ada error baru terkait file yang diubah.
- [x] Data asli aman: perubahan featured image tak pernah di-Save (discard via reload).

**Verifikasi live lintas-collection (2026-09-25):**
- [x] `tours/4` (aktif, modul berbeda) → drawer identik; kontrol Detail/S/M/L muncul,
  mode terakhir (**L**) diingat, gambar + nama file tampil.
- [x] `accommodations/4` (aktif) → identik: `data-drawer-view=l`, 4 tombol kontrol,
  grid 3 kolom (img 259px). Toggle **Detail** → `data-drawer-view=detail`, tombol
  Detail aktif, thumbnail 72×54 (list kompak). Semua sinkron.
- [x] `yachts/create` (nonaktif) → route "Nothing found": collection nonaktif memang
  disembunyikan dari admin sampai diaktifkan; begitu aktif, field-nya `relationTo:
  'media'` → memakai drawer yang sama (dijamin oleh arsitektur single media collection).
- [x] Data aman: featured image `tours/4` (`tour-kuta-1.jpg`) & `accommodations/4`
  (`cliff-resort-1.jpg`) utuh — semua perubahan uji di-discard via force-reload,
  tidak ada tulisan ke DB.

### Rollback
- `MediaThumbnailCell.tsx`: kembalikan ke versi server-component sebelumnya (hapus
  `'use client'`, `useListDrawerContext`, dan cabang `<button>`; kembalikan render
  `<a>` tunggal). Lihat git history commit ini.
- `media-list.css`: hapus blok komentar "Phase 4.60.2 — Choose from existing".

### Catatan teknis
- `MediaThumbnailCell` sekarang client component, tapi DOM di list utama identik
  (`<a class="dnj-media-thumb dnj-media-thumb--link">`) → perilaku click-to-edit +
  grid S/M/L tak berubah.
- Custom Cell di kolom pertama = pola berulang yang mem-bypass wiring bawaan Payload
  (bdk. Phase 4.59 Users/Media BUG#1). Untuk picker, wiring yang di-bypass adalah
  `onSelect` — kini di-handle sendiri via `useListDrawerContext`.

### Next Steps
- Opsional: samakan tinggi thumbnail (72×54) untuk drawer collection non-media bila
  kelak ada picker lain yang juga terasa "berantakan".
- Opsional: tambah kolom dimensi/ukuran file di drawer bila owner ingin info lebih.
