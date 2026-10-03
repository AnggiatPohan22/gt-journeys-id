## Phase: 4.68 — Quick Access configurable untuk Super Admin
**Tanggal**: 2026-10-03
**Status**: Selesai (pending migration apply + verifikasi dev)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Super-admin Quick Access yang sebelumnya hardcoded 8 ikon di `DashboardStats.tsx` kini configurable dari CMS Settings → Site Features → Dashboard Widgets → section "⚡ Access · Quick Access (per role)". Satu field `quickAccessSuper` baru melengkapi `quickAccessAdmin` + `quickAccessEditor` yang sudah ada sejak Phase 4.58.1, sehingga ketiga role di proyek (super/admin/editor per [docs/04-RBAC.md](../../../../04-RBAC.md)) kini punya kontrol penuh dari UI yang sama. Default per role tetap sama dengan sebelum 4.68 → zero regression.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteFeatures.ts` | Tambah 6 opsi di `QUICK_ACCESS_OPTIONS` (bookings/posts/testimonials + 3 shortcut `new-*`). Tambah field `quickAccessSuper` di collapsible Quick Access. Perjelas description. |
| `apps/cms/src/admin/DashboardStats.tsx` | Tambahkan `bookings/posts/testimonials/new-page/new-dest/new-cat` ke `ACTION_REGISTRY`. Ganti `superActions` hardcoded dengan `DEFAULT_SUPER_ACTION_KEYS`. `resolveActions` sekarang terima `'super' \| 'admin' \| 'editor'`. Super tidak difilter `isModuleActive` (akses penuh walau modul off di frontend). |
| `apps/cms/src/migrations/20261003_022915_phase_4_68_quick_access_super.ts` | Migration baru: `CREATE TABLE IF NOT EXISTS site_features_dashboard_widgets_quick_access_super` (child table untuk select hasMany) + drift re-create `site_settings` & `popup_settings` (dari Phase 4.73 brand rename yang belum di-capture; data preserved via `INSERT INTO __new_X SELECT ... FROM X`). Pakai `IF NOT EXISTS` di `CREATE TABLE/INDEX` quick_access_super agar re-runnable (lihat **Known issue** di bawah). |
| `apps/cms/src/migrations/20261003_022915_phase_4_68_quick_access_super.json` | Snapshot schema. |
| `apps/cms/src/migrations/index.ts` | Register migration baru. |
| `packages/shared/src/types/payload-types.ts` | Regen — `quickAccessSuper?: ...` di tipe `SiteFeature`. |

### Impact
- **Database**: migration ditambah `20261003_022915_phase_4_68_quick_access_super` (belum di-apply di dev — lihat Testing).
- **CMS**: field baru di global `site-features` → `dashboardWidgets.quickAccessSuper`.
- **Frontend**: none (dashboard admin only).
- **Routes**: none.
- **RBAC**: none (hanya UI config, bukan access rule).

### Known issue (fixed) — drift `bookings.access_token`
Generator `payload migrate:create` dijalankan **sebelum** phase 4.66.5 di-apply, sehingga diff ikut menambahkan `ALTER TABLE bookings ADD access_token text NOT NULL;` ke migration 4.68 (padahal 4.66.5 yang resmi menanganinya). Saat `schema:migrate` dijalankan, 4.66.5 masuk duluan + sukses tambah kolom → 4.68 gagal di langkah ALTER (duplicate column). Fix (sudah di-apply di file migration):
1. Hapus `ALTER TABLE bookings ADD access_token` + `CREATE UNIQUE INDEX bookings_access_token_idx` dari `up()`.
2. Hapus pasangan `DROP INDEX` + `ALTER TABLE ... DROP COLUMN access_token` dari `down()`.
3. Ganti `CREATE TABLE quick_access_super` + 2 CREATE INDEX → `IF NOT EXISTS` agar re-runnable (karena run pertama sudah terlanjur bikin tabel sebelum error).
4. Tambah `PRAGMA foreign_keys=ON` di akhir `up()` yang hilang di generator.

Lesson learned: selalu `schema:migrate` dulu untuk apply semua pending migration sebelum `schema:new`, supaya snapshot JSON yang dipakai generator sudah up-to-date dengan DB terakhir.

### Testing
- [x] `pnpm schema:migrate` di `apps/cms` → apply 2 pending migrations (4.66.5 booking token + 4.68 ini). Berhasil di 141ms setelah fix di atas. Verifikasi: `pnpm schema:status` → kedua migration = `Yes`.
- [ ] Login sebagai super-admin → buka `/admin/globals/site-features` → tab "Dashboard Widgets" → section Quick Access → field "Super Admin — pilih icon" muncul.
- [ ] Kosongkan field → save → dashboard super render 8 ikon default (new-page/new-dest/new-cat/menu/media/users/site-features/site-settings).
- [ ] Pilih subset custom (misal: pages/bookings/testimonials) → save → dashboard super render icon sesuai pilihan + order sesuai urutan pilih.
- [ ] Verifikasi admin & editor dashboard tetap sama (tidak berubah dari 4.58.2).
- [ ] Toggle modul layanan off di Site Features → cek super dashboard **tetap** menampilkan modul tsb (super tidak difilter), admin/editor **tidak** menampilkan.

### Rollback
1. `pnpm schema:down` di `apps/cms` → turunkan migration 4.68.
2. Revert commit → file `SiteFeatures.ts`, `DashboardStats.tsx`, `migrations/index.ts`, `payload-types.ts` kembali ke pre-4.68.
3. Delete file migration `20261003_022915_phase_4_68_*`.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/admin-ui/admin-dashboard/phase-4.68-quick-access-super-config.md` (file ini)
- [ ] `docs/PROGRESS.md` — tambah 1 baris Phase 4.68
- [ ] `docs/03-CONTENT-MODEL.md` (opsional — field baru di global site-features)

### Next Steps
- Phase 4.68.1 (opsional): drag-and-drop reorder via custom field component React untuk UX pemilihan order yg lebih intuitif.
- Phase 4.68.2 (opsional): per-user override di collection `Users` (field `dashboardQuickAccess` opsional yg override global per akun).
- Phase 4.73.x (follow-up): capture secara eksplisit drift `site_settings.site_name` default rename dari brand rename agar migration future lebih bersih.
