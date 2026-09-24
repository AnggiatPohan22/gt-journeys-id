## Phase: 4.60.1 — Media Edit View Compact Layout
**Tanggal**: 2026-09-24
**Status**: Selesai (verifikasi visual via browser pane, login super-admin)
**Dikerjakan oleh**: Claude Code (Opus 4.8)
**Berkaitan dengan**: [`phase-4.60-media-folders-filebird-layout.md`](../phases/phase-4.60-media-folders-filebird-layout.md) — lanjutan Media CMS.

### Ringkasan
Tampilan **edit gambar** (`/admin/collections/media/<id>`) dibuat lebih ringkas &
tidak "ribet". Sebelumnya 9 field full-width bertumpuk vertikal → scroll panjang.
Sekarang dua-kolom: kolom utama = preview + field editorial (Alt/Caption/Description),
sidebar = klasifikasi/metadata (Category/License/Credit/Tags/Related*). Helper text
dipendekkan. Karena `Media.ts` adalah config collection, perubahan otomatis berlaku
untuk **semua** gambar (bukan per-gambar).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Media.ts` | Split fields: `alt`/`caption`/`description` tetap di main; `category`/`license`/`credit`/`tags`/`relatedDestination`/`relatedService` → `admin.position: 'sidebar'`. Helper `description` dipendekkan; deskripsi field sidebar dihapus (label sudah jelas); `description` textarea `admin.rows: 3`. |
| `apps/cms/src/admin/MediaListEnhancer.tsx` | Deteksi route edit media (`MEDIA_EDIT_RE`) → set `body[data-media-edit]`. |
| `apps/cms/src/admin/media-list.css` | Trim padding-bottom gutter di route edit media. |

### Impact
- **Database**: none (hanya penataan admin, tanpa perubahan field DB).
- **CMS**: edit view Media jadi dua-kolom ringkas.
- **Frontend (web)**: none.
- **RBAC**: none.
- **Deploy needed**: cms (UI admin).

### Sebelum → Sesudah
- **Sebelum**: Preview card + Alt, Caption, Description, Category, Tags, Credit,
  License, Related Destination, Related Service — semua full-width, 1 per baris → scroll panjang.
- **Sesudah**: Kolom utama (preview + Alt + Caption + Description) | Sidebar
  (Category, License, Photo Credit, Tags, Related Destination, Related Service).
  Semua field tampil dalam satu view dua-kolom.

### Catatan teknis
- Config collection Payload di-cache singleton per-proses, tapi perubahan struktur
  field ter-hot-reload pada dev ini (terverifikasi tanpa perlu restart). Jika di
  environment lain tak muncul, restart dev server.
- **Residual page-scroll kecil (~garis)**: `collection-edit__form` Payload mengisi
  tinggi viewport secara desain (berlaku untuk SEMUA collection, bukan spesifik Media)
  dan menolak override CSS height tanpa risiko mengubah layout edit global. Karena itu
  TIDAK diakali; masalah inti (tumpukan field yang bikin ribet) sudah teratasi. Hanya
  padding-bottom gutter yang dipangkas untuk sedikit menghemat ruang.

### Testing (verified via browser pane, login super-admin, emulasi 1440×900)
- [x] `/admin/collections/media/64` → layout dua-kolom: main (Alt/Caption/Description)
  + sidebar (Category/License/Credit/Tags/Related Destination/Related Service).
- [x] Preview gambar tampil di kolom utama.
- [x] `npx tsc --noEmit` — tak ada error baru.
- [x] Berlaku umum (semua media pakai config sama).

### Rollback
- `Media.ts`: hapus `admin.position: 'sidebar'` dari 6 field (kembali ke stack), pulihkan
  helper description bila diinginkan.
- `MediaListEnhancer.tsx`: hapus `MEDIA_EDIT_RE`/`EDIT_ATTR`/effect `data-media-edit`.
- `media-list.css`: hapus blok `body[data-media-edit] … padding-bottom`.

### Next Steps
- Opsional (jika owner mau edit view benar-benar zero-scroll di semua collection):
  butuh override layout edit-view Payload secara global — di luar scope 4.60.1.
