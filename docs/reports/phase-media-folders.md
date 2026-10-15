## Phase: Media Folders (4.60)
**Tanggal**: 2026-09-24
**Status**: Selesai (kode + migrasi + seed) · verifikasi visual folder view menunggu sesi admin login
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan fitur **Folders bawaan Payload** untuk collection Media sehingga
gambar upload terorganisir per folder (bukan satu tumpukan flat). Setiap
service + Blog + Pages punya folder sendiri (dengan sub-folder Featured &
Gallery), upload dari service otomatis dirutekan ke folder modulnya via
afterChange hook, gambar tanpa folder masuk root/Uncategorized, dan folder
view diberi kontrol density **Detail / S / M / L**.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/payload.config.ts` | Tambah `folders: { collectionSpecific: true, browseByFolder: true }` |
| `apps/cms/src/collections/Media.ts` | Tambah `folders: true` (opt-in folder untuk media) |
| `apps/cms/src/config/mediaFolders.ts` | **Baru** — single source of truth: daftar modul→folder, sub-folder Featured/Gallery, Uncategorized |
| `apps/cms/src/hooks/assignMediaFolder.ts` | **Baru** — afterChange hook factory: featuredImage→Featured, gallery→Gallery, hanya untuk media tanpa folder |
| `apps/cms/src/collections/{Tours,Accommodations,WaterActivities,Yachts,Restaurants,Venues,Rentals,Spa,FerryTickets,Posts}.ts` | Daftarkan `hooks.afterChange: [assignMediaFolder('<slug>')]` (10 collection) |
| `apps/cms/src/scripts/seed-media-folders.ts` | **Baru** — seed idempotent 34 folder (retry tahan SQLite BUSY) |
| `apps/cms/package.json` | Tambah script `seed:media-folders` |
| `apps/cms/src/admin/MediaListEnhancer.tsx` | Tambah kontrol density Detail/S/M/L untuk folder view (portal ke `.search-bar__actions`) |
| `apps/cms/src/admin/media-list.css` | CSS override `.item-card-grid` per density + styling kontrol |
| `apps/cms/src/migrations/20260924_032356_phase_4_60_media_folders.{ts,json}` | **Baru** — migrasi folders (batch 27) |
| `packages/shared/src/types/payload-types.ts` | Regenerated — tambah `payload-folders` + `media.folder` |

### Impact
- **Database**: migration ditambah `20260924_032356_phase_4_60_media_folders` (batch 27) — tabel `payload_folders` + `payload_folders_folder_type`, kolom `media.folder_id`, kolom `payload_locked_documents_rels.payload_folders_id`, 8 index.
- **CMS**: Collection baru (sistem) `payload-folders`. Media dapat "Browse by Folder" view + field `folder`.
- **Frontend**: none (frontend fetch `/api/media` tetap sama; `folder` field opsional, tidak memengaruhi output URL gambar).
- **Routes**: `/admin/browse-by-folder` (global) + `/admin/collections/media/folders` (per-collection) — otomatis dari Payload.
- **RBAC**: none eksplisit — folder collection pakai default Payload (authenticated). Media access tak diubah.

### Catatan Perbaikan Snapshot Migrasi (penting)
Rantai snapshot `.json` migrasi ternyata rusak sejak 2026-09-18:
`20260918_170000_phase_4_56_entry_speed.json` berisi `{}` (korup) dan migrasi
4.58.x + 4.59 tidak punya `.json` sama sekali. `payload migrate:create` membaca
**satu `.json` bernama terbesar** sebagai basis diff, jadi ini menyebabkan error
zod + akan menghasilkan migrasi "catch-up" yang gagal saat apply.
Diperbaiki dengan: capture schema terkini (pre-folders) ke json valid dan
memasangnya sebagai snapshot terbaru (`20260922_...media_enrichment.json`),
sehingga diff folders bersih (hanya delta folders). Backup DB + migrations
disimpan di scratchpad session. **Follow-up**: pertimbangkan regenerasi snapshot
`.json` untuk migrasi 4.58.x agar rantai benar-benar utuh (opsional; hanya
`migrate:create` yang membacanya, `migrate` apply tidak).

### Testing
- [x] `pnpm schema:migrate` — migrasi folders ter-apply (batch 27), hanya delta folders.
- [x] DB verify — `payload_folders` + `media.folder_id` ada.
- [x] `pnpm generate:types` — `payload-folders` + `media.folder` muncul.
- [x] `pnpm seed:media-folders` — 34 folder terbentuk (Uncategorized + 11 modul × Featured/Gallery), idempotent.
- [x] `npx tsc --noEmit` — tak ada error baru (semua error pre-existing).
- [x] Admin login page load — 0 console error (config + provider baru compile & runtime OK).
- [ ] **Visual folder view** — folder tampil, kontrol density S/M/L bekerja (butuh admin login).
- [ ] **Auto-routing** — simpan Tour dgn featuredImage/gallery → cek gambar masuk Tours/Featured & Tours/Gallery (butuh admin login).

### Rollback
1. `cd apps/cms && pnpm schema:down` (turunkan batch 27 — drop tabel folders + kolom).
2. Revert `folders: true` di `Media.ts` dan blok `folders` di `payload.config.ts`.
3. Hapus `hooks.afterChange: [assignMediaFolder(...)]` di 10 collection + import-nya.
4. Hapus file baru: `config/mediaFolders.ts`, `hooks/assignMediaFolder.ts`, `scripts/seed-media-folders.ts`, script `seed:media-folders`.
5. Revert perubahan `MediaListEnhancer.tsx` + `media-list.css` (blok Phase 4.60).
6. `pnpm generate:types`.
Backup DB pra-perubahan tersedia di scratchpad session.

### Dokumentasi yang Diupdate
- [x] `docs/reports/phase-media-folders.md` (file ini)
- [x] `docs/PROGRESS.md`
- [x] `docs/02-DATABASE-SCHEMA.md`
- [x] `docs/03-CONTENT-MODEL.md`

### Next Steps
1. Login admin → verifikasi visual folder view + density + auto-routing (checklist di atas).
2. Opsional: perluas auto-routing untuk Pages (imagery ada di blocks — perlu traversal block/seo).
3. Opsional: regenerasi snapshot `.json` migrasi 4.58.x agar rantai utuh.
4. Saat deploy CMS ke Cloudflare: jalankan `pnpm seed:media-folders` sekali di lingkungan D1 (atau biarkan hook auto-create saat konten pertama disimpan).
