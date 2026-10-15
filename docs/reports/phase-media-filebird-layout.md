## Phase: Media FileBird Layout + Refinements (4.61)
**Tanggal**: 2026-09-24
**Status**: Selesai (kode) · verifikasi visual oleh owner
**Dikerjakan oleh**: Claude Code

### Ringkasan
Halaman list Media (`/admin/collections/media`) diubah jadi layout dua-panel
gaya FileBird: sidebar folder di kiri + grid aset native Payload di kanan
(augmentasi, bukan rewrite view). Ditambah 4 refinement sesuai feedback owner:
sembunyikan folder modul yang dinonaktifkan, pindahkan gambarnya ke
Uncategorized, ukuran grid tetap per view (tanpa scroll panjang), dan fix
highlight folder aktif.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/admin/MediaFolderSidebar.tsx` | **Baru** — panel folder (navigasi, New Folder, hitungan, filter, sort/collapse/refresh). Fix deteksi active pakai `params.forEach` (bukan regex `toString()` yang meng-encode `[`). Sembunyikan folder modul disabled. |
| `apps/cms/src/admin/MediaListEnhancer.tsx` | Default view = grid (M). Limit halaman tetap per view: Detail 10, S 24, M 12, L 4 (di-set via URL `?limit=`). |
| `apps/cms/src/admin/media-list.css` | Layout grid 2-kolom (`body[data-media-filebird]`), styling sidebar (token tema). Kolom grid tetap: S 6, M 4, L 2 (+ fallback responsif). |
| `apps/cms/src/config/mediaFolders.ts` | Tambah `featureKey` (peta SiteFeatures→folder), helper `disabledModuleFolderNames` + `isModuleDisabled`. |
| `apps/cms/src/hooks/assignMediaFolder.ts` | Skip auto-routing bila modul disabled (baca `site-features`). |
| `apps/cms/src/hooks/syncMediaFoldersToFeatures.ts` | **Baru** — SiteFeatures afterChange: pindah gambar folder modul disabled → Uncategorized (`folder: null`). |
| `apps/cms/src/globals/SiteFeatures.ts` | Daftarkan hook `syncMediaFoldersToFeatures`. |
| `apps/cms/src/payload.config.ts` | Daftarkan provider `MediaFolderSidebar`. |

### Detail Perbaikan (feedback owner)
1. **Modul nonaktif → folder & subfolder hilang.** Sidebar fetch
   `/api/globals/site-features`; folder root modul yang `enabled=false`
   (beserta subtree Featured/Gallery) di-exclude dari tree.
   Peta key→folder: `yacht`→Yachts, `weddings`→Venues,
   `waterActivities`→Water Activities, `ferryTickets`→Ferry Tickets, dst.
2. **Gambar di folder nonaktif → Uncategorized.** Saat SiteFeatures disimpan,
   hook memindahkan semua media di folder modul disabled (root+sub) ke
   `folder: null`. Idempoten. Re-enable tidak menarik gambar kembali (tetap di
   Uncategorized) — by design. Modul yang SUDAH disabled sebelum fitur ini:
   cukup simpan ulang SiteFeatures sekali untuk memicu pemindahan.
3. **Ukuran grid tetap (anti scroll panjang).** Kolom×baris dipatok + limit
   halaman: **Detail 10**, **S 6×4=24**, **M 4×3=12**, **L 2×2=4**.
4. **Fix highlight active.** Bug: `params.toString()` meng-encode `[`/`]`
   sehingga regex `where[folder]...` tak pernah match → All Files selalu
   terlihat aktif. Fix: baca key ter-decode via `params.forEach` + cocokkan
   suffix `[folder][equals]` / `[folder][exists]` (toleran nesting Payload).

### Impact
- **Database**: none (tak ada migrasi — hanya perilaku hook + UI).
- **CMS**: SiteFeatures dapat afterChange hook. Media list route dapat sidebar.
- **Frontend (web)**: none.
- **RBAC**: none.

### Testing
- [x] `npx tsc --noEmit` — tak ada error baru.
- [x] Admin build/route load — 0 console error.
- [ ] Sidebar: klik direktori → highlight pindah ke direktori itu (bukan All Files). *(owner login)*
- [ ] Toggle modul OFF di Settings → folder modul hilang dari sidebar + gambarnya muncul di Uncategorized. *(owner login)*
- [ ] View S/M/L → jumlah kolom & item per halaman sesuai (24/12/4), tanpa scroll panjang. *(owner login)*

### Rollback
- Hapus provider `MediaFolderSidebar` di payload.config + file komponennya.
- Hapus hook `syncMediaFoldersToFeatures` + registrasinya di SiteFeatures.
- Revert `assignMediaFolder.ts` (hapus cek disabled), `mediaFolders.ts` (hapus featureKey+helper), `MediaListEnhancer.tsx` (limit/default), `media-list.css` (blok FileBird + kolom fixed).

### Next Steps
- Owner verifikasi 3 checklist di atas.

### Addendum (2026-09-24) — perbaikan lanjutan feedback owner
| Isu | Penyebab | Perbaikan |
|-----|----------|-----------|
| Alert "document with ID folders could not be found" | Tombol Manage/Rename/Delete mengarah ke `/admin/collections/media/folders`; rute folder Payload sebenarnya pakai slug folder = `payload-folders`, jadi `folders` dianggap ID dokumen | Buang navigasi ke rute itu; rute view diperbaiki jadi `payload-folders` di `FOLDER_ROUTE_RE` |
| Tombol "Manage" tak berguna | Mengarah ke rute salah | Dihapus. **Rename & Delete kini berfungsi inline** di panel (aksi pada folder yang sedang aktif): Rename→PATCH, Delete→DELETE (gambar otomatis pindah ke Uncategorized via FK `ON DELETE set null`). Disabled saat All Files/Uncategorized. |
| Search berada di atas filter (buang 1 baris → grid turun) | `.list-controls` membungkus `.search-bar` full-width di baris sendiri | CSS: `.search-bar` jadi field inline (`flex:1`), sejajar dengan toolbar di satu baris → grid naik, muat penuh di layar |

File tambahan yang berubah pada addendum: `MediaFolderSidebar.tsx` (rename/delete inline, hapus Manage), `MediaListEnhancer.tsx` (fix `FOLDER_ROUTE_RE`), `media-list.css` (search inline + style tombol danger).

### Addendum 2 (2026-09-24) — clean-up nav, search inline, deselect all
| Isu | Penyebab | Perbaikan |
|-----|----------|-----------|
| Nav "Browse by Folder" di sidebar admin bikin tidak clean (fitur sama sudah ada via toggle "By Folder" di kanan atas halaman) | Root `folders.browseByFolder: true` menambah nav link + global view | Set `folders.browseByFolder: false` di `payload.config.ts`. Toggle "By Folder" per-collection tetap (digating `collectionConfig.folders`, bukan root flag). |
| Search masih menumpuk di atas filter (makan space, grid turun) | `.list-controls` Payload = `flex-direction: column` (di `@layer payload-default`); override sebelumnya set `display:flex` tapi tak set arah | Tambah `flex-direction: row` di `media-list.css` (CSS unlayered menang atas @layer). Search kini sebaris dengan toolbar → grid naik. |
| Tak ada opsi "unselect all" setelah select all | Grid mode menyembunyikan `thead` (checkbox select-all/deselect native). Native tak punya tombol deselect terpisah | Komponen `MediaSelectionBar` (Media `admin.components.beforeListTable`, di dalam SelectionProvider) menampilkan "N selected · Select all · **Deselect all**" saat ada seleksi. Deselect = `toggleAll()` (selalu clear saat count>0 karena provider effect menjaga `selectAll` di some/allInPage/allAvailable). |

File addendum 2: `payload.config.ts` (browseByFolder false), `media-list.css` (flex-direction row + style selection bar), `MediaSelectionBar.tsx` (**baru**), `collections/Media.ts` (daftarkan beforeListTable).

### Addendum 4 (2026-09-24) — fit-to-viewport (no page scroll)
Diukur langsung via browser pane (emulasi 1440×900).
- **Akar penyebab page scroll**: layout 2-kolom sebelumnya pakai CSS grid dengan `grid-row: 1 / 9999` pada sidebar → menghasilkan ~9998 baris implicit hantu (0.05–20px) yang menambah ~400–500px tinggi halaman. **Fix**: sidebar diubah ke `position: absolute` (keluar dari flow) + `padding-left` pada wrap → sidebar tak pernah menggelembungkan tinggi halaman.
- **Fit semua mode**: area grid/tabel (`.collection-list__tables`) dibatasi `max-height: calc(100vh - var(--dnj-media-chrome, 300px))` + `overflow-y: auto` (scroll internal), dan `padding-bottom` wrap dipangkas ke 12px agar pagination tetap di viewport.
- **Hasil terukur**: Detail/S/M/L semua `pageScrolls: false` (docScroll = 900 = vh), pagination terlihat di semua mode. `--dnj-media-chrome` memakai `100vh` sehingga ikut skala tinggi layar user.
File: `media-list.css` (layout absolute + fit-to-viewport).

### Addendum 3 (2026-09-24) — konsolidasi Edit/Delete ke selection bar
Cluster seleksi native di header ("N selected · Select all · Edit · Delete", `.list-selection`) disembunyikan via CSS agar info tidak dobel. Edit & Delete dipindah ke `MediaSelectionBar` dengan menggunakan ulang komponen Payload `EditMany` & `DeleteMany` (cukup prop `collection` dari `getEntityConfig({ collectionSlug: 'media' })`; seleksi & permission diambil dari context). Toggle "By Folder" (`.default-list-view-tabs`, sibling di header) tetap. Bar kini: **N selected · Select all · Deselect all · Edit · Delete** dalam satu tempat.
File: `MediaSelectionBar.tsx` (+EditMany/DeleteMany), `media-list.css` (hide `.list-selection` + style `.dnj-media-selbar__bulk`).
