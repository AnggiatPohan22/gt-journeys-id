# Phase 4.39 — Destinations Gallery Bulk Upload Parity

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** 1 collection (Destinations) + 1 kolom baru + 1 migration. Reuse komponen shared, zero komponen code baru.

## Motivasi

Follow-up dari Phase 4.38. Audit di 4.38 mencatat `Destinations.gallery` sebagai deferred karena shape-nya beda (hanya `{image}`, tanpa `caption`, tanpa `maxRows`) — beda dari 10 koleksi lain yang sudah punya bulk-upload + framed grid. Owner minta parity juga untuk Destinations.

Dari 2 opsi yang diusulkan di 4.38:
- **Opsi A** — tambah `caption` opsional ke schema Destinations (1 migration ADD COLUMN), lalu wire bulk+grid seperti Posts. ← dipilih
- Opsi B — buat varian komponen parametric — di-defer, effort besar dan tidak diperlukan untuk case sederhana ini.

## Perubahan

### Schema

[`apps/cms/src/collections/Destinations.ts`](../../apps/cms/src/collections/Destinations.ts):

- `gallery` array kini punya sub-field `caption` (opsional, `type: 'text'`).
- Tambah `maxRows: 10` (seragam dengan koleksi lain).
- Tambah `admin.description`, `admin.className: 'dnj-gallery-grid'`, `admin.components.afterInput: ['/admin/GalleryGrid#default']`.
- Sibling UI field `galleryBulkUpload` (type `ui`) di-mount setelah `featuredImage`.

### Migration

[`apps/cms/src/migrations/20260914_153206.ts`](../../apps/cms/src/migrations/20260914_153206.ts) — di-generate via `pnpm --filter cms schema:new -- --name add-destinations-gallery-caption`, kemudian nama file dibersihkan ke `20260914_153206.ts` untuk konsisten dengan konvensi timestamp-only + import di `migrations/index.ts` disamakan.

UP:
```sql
ALTER TABLE `destinations_gallery` ADD `caption` text;
```

DOWN:
```sql
ALTER TABLE `destinations_gallery` DROP COLUMN `caption`;
```

- Kolom nullable → row lama tidak terpengaruh (data migration = zero).
- Applied lokal: `pnpm --filter cms schema:migrate` (auto-y untuk warning "dev push" — false-positive; ADD COLUMN pure additive tidak ada risiko data loss).
- `schema:status` konfirmasi migration ter-record batch 9.
- `payload generate:types` konfirmasi: 5 baris tambahan di `payload-types.ts` (caption? di `Destination.gallery` + di `DestinationsSelect`).

## Non-impact

- **`apps/web`** — konsumsi `Destination.gallery` (kalau ada) hanya baca `image`; `caption` tambahan opsional, tidak wajib dipakai. Tidak ada perubahan render/logic.
- **Existing rows** — 0 update; caption `null` sampai editor mengisi.
- **Migration reversible** — `down()` `DROP COLUMN` bersih.

## Files touched

- **Modified (2):** `apps/cms/src/collections/Destinations.ts`, `apps/cms/src/migrations/index.ts`
- **New (2):** `apps/cms/src/migrations/20260914_153206.ts` + `.json` snapshot
- **Regenerated:** `packages/shared/src/types/payload-types.ts` (+5 baris)

## UAT checklist

1. `pnpm --filter cms dev` → login → buka Destinations → pilih destinasi mana pun atau Create.
2. Di bawah **Featured Image** kini muncul tombol **"📥 Bulk upload (max 10, N left)"**.
3. Klik → pilih 3–5 gambar → progress + toast success → kartu foto muncul di grid framed di bawahnya.
4. Aksi ←/→/✎/🗑 pada tiap kartu berjalan sama seperti di Accommodations/Tours/Posts.
5. Isi `caption` pada 1 row → Save → refresh → caption persist.
6. Frontend (kalau ada halaman destinasi yang render gallery) tetap normal — sub-field `caption` opsional, konsumer boleh abaikan.
