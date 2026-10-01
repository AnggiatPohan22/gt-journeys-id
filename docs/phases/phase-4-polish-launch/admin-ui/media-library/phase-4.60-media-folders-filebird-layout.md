# Phase 4.60 — Media Folders + FileBird Layout (v2)

**Status:** ✅ Selesai (kode + migrasi + verifikasi visual via browser pane)
**Tanggal:** 2026-09-24
**Branch:** `feature/phase4-polish-launch`
**Dikerjakan oleh:** Claude Code (Opus 4.8)
**Lanjutan dari:** [`phase-4.59-cms-bugs.md`](phase-4.59-cms-bugs.md) (Media library enhancement v1 — thumbnail fix + 6 field baru)
**Report detail (langkah-per-langkah):**
- [`docs/reports/phase-media-folders.md`](../reports/phase-media-folders.md) — aktivasi Folders native + migrasi
- [`docs/reports/phase-media-filebird-layout.md`](../reports/phase-media-filebird-layout.md) — layout FileBird + semua addendum

---

## Ringkasan

"Version 2" dari halaman Media CMS: dari sekadar list gambar jadi **media library
ber-folder gaya FileBird**. Gambar upload kini terorganisir per service (folder +
sub-folder Featured/Gallery), user bisa buat/rename/hapus folder sendiri, dan
halaman Media tampil dua-panel (sidebar folder + grid) yang **muat penuh di
viewport desktop tanpa page scroll** untuk semua mode (Detail/S/M/L).

Dua sub-fase:
- **4.60** — aktifkan fitur **Folders bawaan Payload** untuk Media + auto-routing.
- **4.61** — layout **FileBird** dua-panel + module-aware + selection bar + fit-to-viewport.

---

## 1. Fondasi — Payload native Folders (4.60)

Payload 3.87 punya fitur Folders bawaan (buat folder + subfolder, scoping per-collection,
item tanpa folder = root/Uncategorized).

- `payload.config.ts` → `folders: { collectionSpecific: true, browseByFolder: false }`.
  (`browseByFolder: false` = hilangkan nav global "Browse by Folder" di sidebar admin;
  toggle "By Folder" per-collection di halaman tetap ada.)
- `collections/Media.ts` → `folders: true`.
- Migrasi **batch 27** `20260924_032356_phase_4_60_media_folders`:
  tabel `payload_folders` + `payload_folders_folder_type`, kolom `media.folder_id`,
  kolom `payload_locked_documents_rels.payload_folders_id`, 8 index.

### ⚠️ Perbaikan rantai snapshot migrasi (penting)
Saat generate migrasi ditemukan snapshot `.json` rusak: `20260918_..._phase_4_56_...json`
berisi `{}` (korup) dan migrasi 4.58.x/4.59 tak punya `.json`. `payload migrate:create`
membaca **satu `.json` bernama terbesar** sebagai basis diff → error + akan menghasilkan
migrasi "catch-up" yang gagal apply. **Fix:** capture schema terkini (pre-folders) ke
json valid, pasang sebagai snapshot terbaru (`20260922_...media_enrichment.json`), sehingga
diff folders bersih (hanya delta folders). Backup DB + migrations disimpan di scratchpad.

## 2. Struktur folder + auto-routing

- **Config tunggal** `config/mediaFolders.ts` — daftar modul→folder (9 service + Blog +
  Pages), nama sub-folder Featured/Gallery, Uncategorized, dan pemetaan `featureKey`
  (SiteFeatures `modules.<key>` → folder; catatan: `yacht`→Yachts, `weddings`→Venues,
  `waterActivities`→Water Activities, `ferryTickets`→Ferry Tickets).
- **Seed** `scripts/seed-media-folders.ts` (`pnpm seed:media-folders`) — buat 34 folder
  idempotent (retry tahan SQLite BUSY).
- **Auto-routing** `hooks/assignMediaFolder.ts` — afterChange di 9 service + Posts:
  `featuredImage` → `<Modul>/Featured`, `gallery[].image` → `<Modul>/Gallery`, hanya
  untuk media yang belum punya folder (penempatan manual tak ditimpa). Skip bila modul disabled.

## 3. Module-aware (modul nonaktif)

- Sidebar baca `/api/globals/site-features`; folder modul yang toggle-nya OFF (beserta
  subfolder) **disembunyikan**.
- `hooks/syncMediaFoldersToFeatures.ts` (afterChange SiteFeatures) — saat modul dimatikan,
  semua gambar di folder modul itu dipindah ke **Uncategorized** (`folder: null`). Idempoten.
- `assignMediaFolder` skip auto-routing untuk modul disabled.

## 4. Layout FileBird dua-panel (4.61)

Augmentasi list Media native (bukan rewrite) — reuse pagination/search/seleksi/upload Payload.

- `admin/MediaFolderSidebar.tsx` (provider, portal ke `.collection-list__wrap`):
  header + **New Folder**, toolbar (Sort A–Z / Collapse / Refresh, **Rename/Delete inline**
  pada folder aktif), filter nama, **All Files / Uncategorized / Directories + hitungan**.
  Klik folder → filter grid via `?where[folder][equals]=…`.
- `admin/MediaListEnhancer.tsx` — default view grid (M); toolbar Group by + View
  (Detail/S/M/L); limit per-view (Detail 10 / S 24 / M 12 / L 4).
- `admin/media-list.css` — styling sidebar + kartu (token tema admin, light/dark), kolom
  grid tetap per mode (S 6, M 4, L 2).

## 5. Selection bar konsolidasi

- `admin/MediaSelectionBar.tsx` (Media `admin.components.beforeListTable`, di dalam
  SelectionProvider): **N selected · Select all · Deselect all · Edit · Delete** dalam satu bar.
  Edit/Delete reuse `EditMany`/`DeleteMany` Payload. Cluster seleksi native (`.list-selection`)
  disembunyikan agar tak dobel. Bar memakai **slot tinggi tetap** → grid tak melompat saat
  select/deselect; frame hanya muncul saat ada seleksi.

## 6. Fit-to-viewport (no page scroll) — diukur langsung

Diukur via browser pane (emulasi 1440×900) untuk semua mode.

- **Akar page scroll**: layout grid lama pakai `grid-row: 1 / 9999` pada sidebar →
  ~9998 baris implicit hantu (menambah ±400–500px). **Fix:** sidebar → `position: absolute`
  (keluar dari flow) + `padding-left` pada wrap → sidebar tak pernah menggelembungkan halaman.
- **Fit:** `.collection-list__tables` dibatasi `max-height: calc(100vh - var(--dnj-media-chrome, 300px))`
  + `overflow-y: auto` (scroll internal), padding-bottom wrap dipangkas.
- **Hasil terukur:** Detail/S/M/L semua `pageScrolls: false` (docScroll = tinggi viewport),
  pagination selalu terlihat. `--dnj-media-chrome` memakai `100vh` → skala ikut tinggi layar user.

---

## File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/payload.config.ts` | `folders` config (browseByFolder false) + daftar provider |
| `apps/cms/src/collections/Media.ts` | `folders: true` + `beforeListTable` MediaSelectionBar |
| `apps/cms/src/config/mediaFolders.ts` | **Baru** — config folder + featureKey + helpers |
| `apps/cms/src/hooks/assignMediaFolder.ts` | **Baru** — auto-routing (skip modul disabled) |
| `apps/cms/src/hooks/syncMediaFoldersToFeatures.ts` | **Baru** — pindah gambar modul disabled → Uncategorized |
| `apps/cms/src/globals/SiteFeatures.ts` | Daftar hook sync |
| `apps/cms/src/collections/{Tours,Accommodations,WaterActivities,Yachts,Restaurants,Venues,Rentals,Spa,FerryTickets,Posts}.ts` | Daftar hook assignMediaFolder |
| `apps/cms/src/scripts/seed-media-folders.ts` + `package.json` | **Baru** — seed folder |
| `apps/cms/src/admin/MediaFolderSidebar.tsx` | **Baru** — panel folder |
| `apps/cms/src/admin/MediaSelectionBar.tsx` | **Baru** — selection bar |
| `apps/cms/src/admin/MediaListEnhancer.tsx` | View mode grid default + limit per view + folder-view density |
| `apps/cms/src/admin/media-list.css` | Layout FileBird absolute + fit-to-viewport + styling |
| `apps/cms/src/migrations/20260924_032356_phase_4_60_media_folders.{ts,json}` | **Baru** — migrasi folders (batch 27) |
| `apps/cms/src/migrations/20260922_..._media_enrichment.json` | **Baru** — snapshot perbaikan rantai |
| `apps/cms/src/migrations/20260918_..._entry_speed.json` | **Dihapus** — snapshot korup `{}` |
| `packages/shared/src/types/payload-types.ts` | Regen (payload-folders + media.folder) |
| `docs/02-DATABASE-SCHEMA.md`, `docs/03-CONTENT-MODEL.md`, `docs/PROGRESS.md` | Update |

## Impact

- **Database:** migrasi batch 27 (folders). Tabel sistem `payload-folders`.
- **CMS:** Media dapat folder view + `folder` field; SiteFeatures dapat afterChange hook.
- **Frontend (web):** none (field `folder` opsional, tak memengaruhi output URL gambar).
- **RBAC:** none.
- **Deploy needed:** cms.

## Rollback

1. `cd apps/cms && pnpm schema:down` (turunkan batch 27).
2. Revert `folders` di config + `folders: true` di Media.ts.
3. Hapus hook `assignMediaFolder` (10 collection) + `syncMediaFoldersToFeatures` (SiteFeatures).
4. Hapus file baru: `mediaFolders.ts`, `assignMediaFolder.ts`, `syncMediaFoldersToFeatures.ts`,
   `MediaFolderSidebar.tsx`, `MediaSelectionBar.tsx`, `seed-media-folders.ts`.
5. Revert `MediaListEnhancer.tsx` + `media-list.css` (blok Phase 4.60/4.61).
6. `pnpm generate:types`.

Backup DB pra-perubahan tersedia di scratchpad session.

## UAT (verified via browser pane, login super-admin)

1. ✅ **Folders:** Media → toggle "By Folder" / sidebar tampilkan All Files / Uncategorized /
   Directories (Tours, Accommodations, …) + hitungan.
2. ✅ **Navigasi:** klik direktori → highlight pindah + grid ter-filter.
3. ✅ **New Folder / Rename / Delete** inline berfungsi (delete → gambar ke Uncategorized).
4. ✅ **Module-aware:** matikan modul di Settings → folder hilang + gambar ke Uncategorized.
5. ✅ **Selection bar:** pilih gambar → N selected + Select all / Deselect all / Edit / Delete;
   grid tak melompat saat select/deselect.
6. ✅ **Fit-to-viewport:** Detail/S/M/L semua muat tanpa page scroll; pagination terlihat.

## Catatan / Follow-up

- **Restart dev server** setelah perubahan config/hook (Payload cache config singleton per proses).
- Angka item/halaman (limit) kadang di-override preferensi Payload; tidak memengaruhi fit
  karena area grid sudah scroll internal.
- `--dnj-media-chrome` (default 300px) bisa disetel bila header admin user berbeda tinggi.
- Opsional: regen snapshot `.json` untuk migrasi 4.58.x agar rantai benar-benar utuh.
- Opsional: perluas auto-routing untuk Pages (imagery ada di blocks — perlu traversal).
