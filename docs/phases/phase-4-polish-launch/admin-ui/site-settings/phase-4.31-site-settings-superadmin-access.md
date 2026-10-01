## Phase 4.31: Site Settings — Restrict Content Defaults & Advanced Tabs to Super-Admin
**Tanggal**: 2026-09-06
**Status**: ✅ Code complete — menunggu owner UAT (login-based verification)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Branch**: `fix/site-settings-superadmin-access`
**Commits**: `afce46e` (access + condition)

### Ringkasan
Mengunci akses **edit** untuk 2 tab di Site Settings global — **Content Defaults** dan **Advanced** — hanya untuk super-admin. Admin biasa dan editor tidak bisa lagi menulis ke 4 field di tab tersebut (`sectionPages`, `relatedServices`, `errorPages`, `footer`) baik lewat admin UI maupun REST/GraphQL API. Read tetap public (frontend Astro build butuh field-field ini untuk render copyright, 404, listing header, tracking scripts).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteSettings.ts` | Import `superAdminFieldAccess`, `Condition`, `GroupField` dari payload/roles. Tambah 2 helper lokal: `superAdminOnly` (Condition untuk `admin.condition`) + `superAdminUpdateOnly` (object `{ update: superAdminFieldAccess }` untuk `access`). Diterapkan ke 4 named groups (`sectionPages`, `relatedServices` via factory augmentation, `errorPages`, `footer`) + 5 collapsible wrapper (agar tab body benar-benar kosong untuk non-super-admin, bukan tampil kontrol yang bakal ditolak saat save). |

### Struktur Akses Baru
| Tab | Sub-section (field) | read | update | admin.condition |
|---|---|---|---|---|
| Brand · Contact & Socials · SEO & Analytics · Layout | *(unchanged)* | public | admin+ (global-level) | none |
| Content Defaults | `sectionPages` (Listing Page Headline) | public | **super-admin only** | super-admin only |
| Content Defaults | `relatedServices` (Global Default cascade) | public | **super-admin only** | super-admin only |
| Content Defaults | `errorPages` (404 + Property Coming Soon) | public | **super-admin only** | super-admin only |
| Advanced | `footer` (Copyright + Tracking Scripts) | public | **super-admin only** | super-admin only |

### Mekanisme (Dua Lapis)
1. **Server-side (enforcement asli)** — `access.update: superAdminFieldAccess` pada 4 named groups. Payload menolak write di REST + GraphQL untuk role selain super-admin. Ini yang sebenarnya menjaga data.
2. **Client-side (UX)** — `admin.condition: superAdminOnly` pada collapsible wrapper + group. Admin tidak melihat field controls sama sekali di UI, sehingga tab body tampil kosong (bukan controls yang error saat save). Ini murni kosmetik.

### Impact
- **Database**: none. Access rules tidak mengubah kolom D1.
- **CMS admin UI**:
  - **super-admin**: semua 6 tab utuh, tidak ada perubahan visual.
  - **admin**: tab "Content Defaults" dan "Advanced" masih tampak di tab bar tapi body-nya kosong (semua accordion di-hide via `admin.condition`). Tab lain (Brand, Contact & Socials, SEO & Analytics, Layout) tetap fully editable.
  - **editor**: whole global tetap hidden via existing `admin.hidden` di level global (tidak diubah).
- **Frontend Astro**: nol impact. Public read tetap aktif. Semua field yang dikonsumsi (`sectionPages.listingTitle/Subtitle`, `errorPages.*`, `footer.copyrightText`, `footer.additionalScripts`) tetap accessible tanpa auth di build time.
- **Routes**: none.
- **RBAC**: reuse `superAdminFieldAccess` dari `apps/cms/src/access/roles.ts` (sudah ada sejak awal). Tidak ada helper baru, tidak ada perubahan Users schema.
- **payload-types.ts**: unchanged. Access rules tidak masuk generated types (mereka runtime-only).

### Reasoning: Field-level, Not Global-level
Global `access.update` sudah `isAdmin` (Phase 3.14 sengaja downgrade dari `isSuperAdmin` supaya client bisa edit brand/contact/nav). Task ini tidak mengembalikan seluruh global ke super-admin — hanya 2 tab spesifik yang high-blast-radius:
- **Content Defaults** — mengubah listing headline, related-services cascade default, atau error copy berdampak ke semua service pages sekaligus. Butuh super-admin.
- **Advanced** — footer copyright teks minor risk, tapi `additionalScripts` adalah raw HTML injection ke `</body>` di semua halaman. XSS risk tinggi. Wajib super-admin.

Sisanya (Brand, Contact & Socials, SEO & Analytics, Layout) tetap admin-editable karena client operasional butuh update kontak/logo/GA ID tanpa ganggu super-admin.

### Reasoning: Read Tidak Direstriksi
Site global punya `access.read: () => true` (public). Astro frontend build fetch tanpa auth. Kalau `access.read` juga dikunci super-admin, build akan hilangkan field-field ini dari response dan seluruh footer / 404 / listing header break di production. Task ini hanya soal EDIT.

### Testing
- [x] `pnpm --filter cms exec tsc --noEmit` — hanya pre-existing errors (page.tsx, DestinationTypes/ServiceTypes defaultSort). Tidak ada error dari SiteSettings.ts.
- [x] `payload generate:types` — sukses, `packages/shared/src/types/payload-types.ts` unchanged (access tidak masuk types).
- [ ] **Manual UI check (owner) — super-admin**: login → `/admin/globals/site-settings` → 6 tab utuh, isi 4 field terestriksi (`sectionPages`, `relatedServices`, `errorPages`, `footer`), save sukses.
- [ ] **Manual UI check (owner) — admin**: login sebagai role `admin` → `/admin/globals/site-settings` → 4 tab pertama editable, tab "Content Defaults" & "Advanced" body kosong (tidak ada accordion). Save di tab lain sukses.
- [ ] **Manual UI check (owner) — editor**: login → whole global tetap hidden dari sidebar Settings.
- [ ] **API write test (super-admin)**: `PATCH /api/globals/site-settings` dengan payload `{ footer: { copyrightText: 'test' } }` menggunakan JWT super-admin → 200 OK.
- [ ] **API write test (admin)**: same PATCH dengan JWT admin → field ditolak/di-strip (200 tapi footer tidak berubah, atau 403 tergantung Payload behavior). Ini yang membuktikan enforcement asli.
- [ ] **Frontend smoke**: `cd apps/web && pnpm build` → build sukses, `dist/` render footer/404/listing header seperti sebelumnya.

### Rollback
```bash
git checkout feature/phase4-polish-launch
git branch -D fix/site-settings-superadmin-access
```
Atau revert single commit: `git revert afce46e`.

Karena tidak ada schema change / migration / data write, rollback aman dan instant.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/admin-ui/site-settings/phase-4.31-site-settings-superadmin-access.md` (file ini)
- [x] `docs/PROGRESS.md` — row 4.31 ditambahkan setelah row 4.30.

### Constraints yang Dipenuhi
- ✅ Tidak ada rename `name` attribute / schema key / DB field
- ✅ Reuse `superAdminFieldAccess` helper existing (tidak duplicate)
- ✅ Tidak ada perubahan Users collection role schema
- ✅ Hanya 2 tab yang disebutkan (Content Defaults + Advanced) yang disentuh — 4 tab lain access tetap sama
- ✅ Read tetap public (frontend build tidak break)
- ✅ Tidak ada package npm/composer baru
- ✅ payload-types.ts unchanged

### Next Steps (opsi, tidak dieksekusi)
- **Pisah `additionalScripts` ke global sendiri** (`SiteScripts`) — dokumentasi ini masih di Phase 4.30 next steps; tetap valid. Field ini paling high-risk di seluruh CMS.
- **Tambah `type: 'ui'` info field** di tab body yang menampilkan "Only super-admin can edit these settings" untuk admin, biar tab tidak kelihatan benar-benar kosong. Butuh Client component, kompleksitas lebih tinggi — skip kecuali ada complaint.
- **PR ke `main`** — belum di-push. Branch lokal saja (`fix/site-settings-superadmin-access`).
