# Phase 4.38 — Posts Gallery Bulk Upload Parity

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Config-only patch pada 1 collection (Posts). Zero component code baru, zero schema change, zero migration, zero payload-types change.

## Motivasi

Owner report: koleksi **Posts** punya field `gallery` (max 10 image + caption per row) tapi masih pakai UI upload default Payload — pilih satu file per row, tambah row satu-satu. Sementara koleksi service (Accommodations, Tours, dst, hasil Phase 4.26 → 4.29) sudah punya:
- **Bulk uploader** — pick banyak file sekaligus → auto-upload ke `/api/media` + append ke array.
- **Framed grid** — kartu foto dengan tombol ←/→ (reorder), ✎ (edit/ganti via drawer), 🗑 (hapus), badge index, semua theme-aware.

Owner minta parity supaya editor blog pakai flow yang sama saat isi gallery article.

## Audit

Grep `type: 'array'` × `gallery` di semua collection:

| Collection | Gallery shape | Bulk + Grid |
|---|---|---|
| Accommodations, Tours, WaterActivities, Yachts, Restaurants, Venues, Rentals, Spa, FerryTickets | `{image, caption}`, maxRows 10 | ✅ (Phase 4.26 pilot + 4.29 rollout) |
| **Posts** | `{image, caption}`, maxRows 10 | ✗ **← target patch ini** |
| Destinations | `{image}` (no caption), no maxRows | ✗ (schema beda — deferred, lihat Follow-up) |

Posts sudah punya shape `{image, caption}` maxRows 10 yang **identik persis** dengan koleksi service. Komponen shared `/admin/GalleryBulkUpload#default` + `/admin/GalleryGrid#default` hardcode `GALLERY_PATH = 'gallery'` (nama field-nya sama) → cukup wire config, tidak perlu ubah komponen.

## Perubahan

[`apps/cms/src/collections/Posts.ts`](../../apps/cms/src/collections/Posts.ts) tab Media — 3 tambahan config:

1. **Sibling UI field** `galleryBulkUpload` sebelum `gallery` → memasang tombol bulk-upload dropzone.
2. **`admin.className: 'dnj-gallery-grid'`** di `gallery` → CSS pilot menyembunyikan UI array default Payload.
3. **`admin.components.afterInput: ['/admin/GalleryGrid#default']`** → mount grid custom (kartu foto dengan aksi ←/→/✎/🗑).

Deskripsi field diselaraskan dengan koleksi service ("Additional photos (max 10). ... Grid: ← → reorder, ✎ edit/ganti (drawer Payload), 🗑 hapus.").

## Non-impact

- **Zero komponen baru** — reuse `GalleryBulkUpload.tsx` + `GalleryGrid.tsx` yang sudah ter-importMap.
- **Zero schema change** — shape `{image, caption}` di DB tidak berubah, `maxRows: 10` tetap.
- **Zero payload-types change** — array sub-fields identik dengan sebelumnya.
- **Zero web-side change** — `apps/web` (blog post detail) tetap iterasi `post.gallery[]` seperti biasa.

## Files touched

- **Modified (1):** `apps/cms/src/collections/Posts.ts` — Media tab

## UAT checklist

1. `pnpm --filter cms dev` → login sebagai admin/editor → buka Posts → pilih 1 post existing atau Create New.
2. Tab **Media** → di bawah Featured Image kini muncul tombol **"📥 Bulk upload (max 10, N left)"** dengan helper text.
3. Klik tombol → OS file-picker → select 3–5 gambar → progress `Uploading i / N · <filename>` → toast success → grid di bawahnya menampilkan kartu foto baru dengan badge index dan tombol aksi.
4. Verifikasi tombol ← → reorder foto, ✎ membuka drawer Payload untuk edit/ganti media, 🗑 konfirmasi + hapus.
5. Save post → refresh → gallery persist dengan urutan yang sama.
6. Frontend `/blog/<slug>` render gallery seperti biasa (tidak ada perubahan).

## Follow-up (opsional)

- **Destinations gallery** — punya field array `gallery: [{image}]` tanpa `caption`. Kalau mau parity juga, ada 2 pilihan:
  - **Opsi A:** tambah `caption` opsional ke schema Destinations (butuh 1 migration), lalu wire bulk+grid seperti Posts.
  - **Opsi B:** buat varian `GalleryBulkUpload`/`GalleryGrid` yang parametric (baca daftar sub-field dari config), lebih rapi tapi effort besar.
  - Belum diprioritaskan — Destinations bukan konten yang sering ditambah galery-nya.
