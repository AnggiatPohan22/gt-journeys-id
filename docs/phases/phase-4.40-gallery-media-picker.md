# Phase 4.40 — Gallery Media Picker (Upload + Pick-from-Library)

**Status:** 🧪 Test on Destinations only · ⏳ Owner UAT gate before rollout
**Branch:** `feature/phase4-polish-launch`
**Scope:** 1 komponen client baru + swap UI-field pada Destinations. Zero schema/migration/payload-types change. 10 koleksi lain **belum** disentuh — sengaja, per permintaan owner.

## Motivasi

`GalleryBulkUpload` (Phase 4.26) hanya menyediakan flow **upload dari disk** → editor yang ingin menaruh gambar yang **sudah pernah di-upload** ke gallery lain harus meng-upload ulang → duplikasi row di `media` collection + boros storage saat launch. Owner minta opsi "**pick from library**" — pilih dari Media collection existing tanpa upload ulang.

## Design

### Satu komponen, dua flow

`apps/cms/src/admin/GalleryMediaPicker.tsx` — client component, mounted via `type:'ui'` field, menampilkan dua tombol bersanding di satu baris:

- **📥 Upload new** — identik dengan `GalleryBulkUpload` (multi-file dari disk → `/api/media` → append rows).
- **📎 Pick from library** — membuka modal picker: grid thumbnail media existing, multi-select, append ID sebagai row baru **tanpa upload**.

Keduanya:
- Menghormati `MAX_ROWS=10` & `remaining` slot dari state `gallery`.
- Trigger `setModified(true)` supaya tombol Save lampu-menyala.
- Filter otomatis: hanya `mimeType` diawali `image/`; media yang **sudah** ada di gallery ini di-disable + ditandai "already in gallery".

### Modal picker UX

- Fullscreen overlay + panel 1100px, ESC & backdrop close.
- Header: judul + counter "N selected · M slots left" + search input (debounce 300ms, `where[filename][like]`) + tombol ✕.
- Body: grid auto-fill 140px, aspect-ratio 4/3, `object-fit: cover`, thumbnail dari `sizes.thumbnail.url` fallback `sizes.card.url` fallback `url`.
- Select toggle: outline hijau + checkmark. Klik thumbnail already-picked = no-op (opacity 0.4).
- Footer: Prev / Page N/M / Next · Cancel · **Add N to gallery** (hijau, disabled saat 0).
- Fetch: `/api/media?limit=48&page=N&sort=-createdAt&depth=0` + optional `where[filename][like]`.

### Kenapa satu komponen, bukan dua UI-field?

Alternatif lain adalah menambah sibling `galleryPickExisting` di samping `galleryBulkUpload`. Ditolak karena:
- Dua UI-field → dua baris di form → tinggi.
- Rollout ke 10 koleksi lain = 10 tempat × 2 edit config. Satu komponen = 1 tempat × 1 edit config.
- Header text "Upload new / Pick from library" lebih jelas sebagai pasangan di satu baris.

## Rilis bertahap (test-first)

Owner minta test dulu di Destinations (`/admin/collections/destinations/6`) sebelum rollout. **Perubahan pada phase ini terbatas pada Destinations**:

- `Destinations.ts`: rename UI-field `galleryBulkUpload` → `galleryMediaPicker` + swap `Field: '/admin/GalleryBulkUpload#default'` → `'/admin/GalleryMediaPicker#default'`.
- 10 koleksi lain (Posts + 9 service) tetap pakai `GalleryBulkUpload` sampai UAT Destinations lulus.

**Follow-up (Phase 4.40.1 nanti setelah UAT):** swap 10 koleksi ke `GalleryMediaPicker` dengan pola edit yang sama.

## Files touched

- **New:** `apps/cms/src/admin/GalleryMediaPicker.tsx`
- **Modified:** `apps/cms/src/collections/Destinations.ts` (1 UI-field swap)
- **Regenerated:** `apps/cms/src/app/(payload)/admin/importMap.js` (auto via `pnpm generate:importmap`)

## UAT checklist

Di `/admin/collections/destinations/6` (atau destinasi mana pun):

1. Di bawah **Featured Image** kini muncul **2 tombol bersanding**: 📥 Upload new · 📎 Pick from library.
2. Klik **Pick from library** → modal terbuka, grid thumbnail media existing, counter "0 selected · N left".
3. Ketik di search → daftar terfilter setelah 300ms.
4. Klik beberapa thumbnail → outline hijau + checkmark. Overflow beyond `remaining` → toast warning.
5. Media yang sudah ada di gallery ini muncul redup + label "already in gallery" + tidak bisa dipilih.
6. Klik **Add N to gallery** → modal close, kartu foto muncul di framed grid, tombol Save aktif.
7. Save → refresh → row persist (image ID sama, storage `media` tidak nambah).
8. **📥 Upload new** (flow lama) tetap berfungsi identik dengan sebelumnya.
9. ESC menutup modal tanpa apply.

## Rollback

Kalau UAT gagal: edit `Destinations.ts` swap balik ke `galleryBulkUpload` + `/admin/GalleryBulkUpload#default` + `pnpm generate:importmap`. Zero data yang perlu dibersihkan.

## Non-impact

- **`apps/web`** — 0 sentuhan.
- **Schema/migration/payload-types** — 0 perubahan (Phase 4.39 sudah punya `caption` di destinations_gallery).
- **10 koleksi lain** — 0 perubahan, sengaja.
