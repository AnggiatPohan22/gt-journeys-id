# Phase 3.23: Dynamic Destination Types System (AUDIT & PLAN)

**Status:** ✅ Code + schema push + seed/migrate SELESAI & terverifikasi (2026-08-24) · belum merge

> **Update 2026-08-24:** Owner approve → **kode diimplementasikan**. Lihat
> **§0 Status Implementasi + Runbook Aktivasi** di bawah. Bagian §1–§5 adalah
> audit/rencana asli (arsip).

---

## 0. Status Implementasi & Runbook Aktivasi (2026-08-24)

### Yang sudah dikerjakan (kode)

| File | Perubahan | Area |
|------|-----------|------|
| `apps/cms/src/collections/DestinationTypes.ts` | **Baru** — collection (name, slug auto, `isActive` checkbox, `sortOrder`); read public, create/delete SA, update gated toggle | [cms] |
| `apps/cms/src/hooks/autoSortOrder.ts` | **Baru** — beforeChange: auto max+1 (create) + swap (update konflik), guard anti-loop | [cms] |
| `apps/cms/src/collections/Destinations.ts` | Field `type` select → **relationship** `destination-types` | [cms] |
| `apps/cms/src/globals/SiteFeatures.ts` | + `destinations.destinationTypesEnabled` (checkbox, default true) | [cms] |
| `apps/cms/src/payload.config.ts` | Registrasi collection `DestinationTypes` | [cms] |
| `apps/cms/src/scripts/seed-destination-types.ts` | **Baru** — seed Island/Mainland + assign type ke 6 destinasi (by slug, deterministik) | [cms] |
| `apps/cms/src/scripts/seed.ts` | Resolve `type` relationship by slug (bukan string) | [cms] |
| `packages/shared/src/types/payload-types.ts` | regenerate — `DestinationType` + `Destination.type: number \| DestinationType` | [shared] |
| docs (04-RBAC, 02-DATABASE-SCHEMA, PROGRESS, phase) | update | [docs] |
| ~~03-CONTENT-MODEL~~ | N/A — type internal, tak menyentuh frontend content | [docs] |

**Keputusan terpakai:** Goal 5 frontend **tidak dibuat** (0 file [web]); toggle **soft**
(collection tetap terlihat, hanya gate `update` admin); `isActive` **checkbox**; type
**orthogonal** dgn hierarki 3.22; tipe dinamai **"Island"/"Mainland"**.

### 🐛 Fix 2026-08-24 — error `delete from destinations`

Push pertama gagal: `Failed query: delete from destinations`. Penyebab: field
`type` di-set `required: true` → kolom `type_id` NOT NULL → Drizzle coba hapus
6 row lama yang kosong, gagal karena FK dari collection service (tours/accommodations/dst)
ke `destinations`. **Fix:** `type` dibuat **optional** (tanpa `required`). Kolom
`type_id` nullable → tak ada `delete from`, push lancar. Integritas diisi via seed.
DB tervalidasi bersih pasca-rollback (destination_types ada, tak ada shadow table).

### ➕ 3.23.1 — sortOrder auto+swap untuk Destinations (2026-08-24)

Tambahan CMS-only (tak pengaruh frontend): hook `autoSortOrder` yang sama dipasang
ke collection **Destinations** (Content → Destinations). Perilaku identik dgn
Destination Types: create → auto max+1; ubah manual ke nilai bentrok → **swap
otomatis** (tanpa popup, sesuai keputusan owner).

| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Destinations.ts` | + `hooks.beforeChange: [autoSortOrder]` |
| `apps/cms/src/scripts/backfill-destination-sortorder.ts` | **Baru** — isi 6 destinasi (semua sortOrder 0) → 1..6 by id |

**Verifikasi (✅ 2026-08-24):**
- Backfill: Kuta=1, Kelinging Beach=2, Nusa Ceningan=3, Nusa Lembongan=4, Nusa Penida=5, Bali=6.
- Swap: ubah "Nusa Penida" (5) → 1 → tertukar dgn "Kuta" (jadi 5); sisanya utuh; lalu di-restore.
- Owner bisa atur ulang urutan via drag/edit sortOrder di admin; swap menjaga tak ada duplikat.

### ⚠️ Runbook Aktivasi (WAJIB — owner jalankan)

DB dev sudah di-backup: `apps/cms/cms.db.bak-3.23`.

```
# 1. Stop CMS dev (Ctrl+C di terminal CMS)

# 2. Start CMS → Drizzle akan prompt schema. Jawab:
cd apps/cms && pnpm dev
#   · destinations: kolom type_id
#       "is type_id created or renamed from type?" → pilih  + create column
#   · drop column `type` (text lama)             → y
#   · site_features: kolom destination_types_enabled → + create column
#   (destination_types + parent_id/show_in_filter sudah ada dari push sebelumnya)
#   type_id kini NULLABLE → TIDAK ada lagi error "delete from destinations".
#   Tunggu CMS start bersih.

# 3. Stop CMS lagi (Ctrl+C) — lepas lock SQLite untuk seed

# 4. Seed + migrate (buat Island/Mainland + assign type ke 6 destinasi):
pnpm tsx src/scripts/seed-destination-types.ts

# 5. Restart CMS
pnpm dev
```

### ✅ Verifikasi SELESAI (2026-08-24, via DB + script)
- [x] Skema ter-migrasi: `destinations.type_id` (nullable FK), kolom `type` lama di-drop,
  tabel `destination_types` + index, `site_features.destinations_destination_types_enabled`.
- [x] Seed: `destination-types` = Island(sort 1, active) & Mainland(sort 2, active).
- [x] 6 destinasi ter-assign benar: Kuta & Mainland Bali → Mainland; Nusa
  Penida/Lembongan/Ceningan & Kelinging Beach → Island. 0 tanpa type.
- [x] Hook auto-increment: create tanpa sortOrder → dapat 3 (max+1).
- [x] Hook swap: update ke sortOrder yang dipakai → tertukar, tak ada duplikat.
- [ ] (Owner, di admin UI) Toggle `destinationTypesEnabled` OFF → admin non-SA tak bisa
  simpan edit Destination Types; Super Admin tetap bisa. *(belum diuji via UI)*
- [x] Filter destinasi frontend (Phase 3.22) tidak berubah (type tak dipakai di FE).

### 🐛 Catatan proses (error yang dilewati)
1. `required: true` → error `delete from destinations` (FK). **Fix:** field dibuat optional.
2. Setelah fix, push kedua sempat menampilkan error replay `CREATE UNIQUE INDEX
   destinations_slug_idx` — ternyata DDL sudah ter-apply penuh (non-transactional replay).
   Skema sudah di target; seed dijalankan → push jadi no-op. **Selesai.**
   → Owner cukup **restart CMS normal**; tidak ada prompt/error lagi.

---
**Timeline:** dibuat 2026-08-24
**Depends on:** [Phase 3.22 Hierarchical Destinations](phase-3.22-hierarchical-destinations.md)
**Branch (rencana):** `feature/dynamic-destination-types`

> Dokumen ini **hanya perencanaan**. Tidak ada source code yang diubah.
> Semua temuan berbasis inspeksi kode aktual per 2026-08-24.

---

## 1. Overview & Goals

Menggantikan field `type` di collection `Destinations` (saat ini select
hardcoded `island` / `mainland`) menjadi **relationship** ke collection baru
`destination-types` yang CRUD-able dari CMS, dengan feature toggle super-admin,
auto-increment sortOrder + swap, access control berlapis, dan rendering frontend
dinamis.

**6 goal:**
1. Collection baru `destination-types` (name, slug auto, isActive, sortOrder). Destinations refer via relationship.
2. Feature toggle `destinationTypesEnabled` di Globals (super-admin).
3. sortOrder auto-increment (max+1) + swap saat konflik; list admin sort asc.
4. Access: super-admin full CRUD+toggle; admin read+update (saat enabled); editor read-only.
5. Frontend ganti string type hardcoded → data dinamis; filter/search render type aktif urut sortOrder.
6. Update shared types: `DestinationType` + `Destination` yang diperbarui.

---

## 2. Phase A — Feasibility Findings

### Konteks kode saat ini (hasil inspeksi)

| Aspek | Temuan |
|-------|--------|
| `Destinations.type` | Select `island`/`mainland` (label "Main Island" utk mainland, Phase 3.22). Wajib (`required: true`). |
| **Pemakaian `type` di frontend** | **NOL.** Tidak ada komponen Astro yang membaca `destination.type`. Filter listing (Phase 3.22) memakai **slug + hierarki (parent/showInFilter)**, bukan `type`. `villa/[slug].astro:218` = tipe *accommodation*. `FilterBookingBar` = hardcode *destinasi* (slug), bukan type. |
| Preseden collection "registry" | [`ServiceTypes.ts`](apps/cms/src/collections/ServiceTypes.ts) — name, slug (hook `generateSlug`), `status`, `order`, `iconName`, akses read-public/create-SA/update-admin/delete-SA. **Template siap-pakai** untuk `destination-types`. |
| Preseden relationship self/lookup | `Destinations.parent`, `Categories.parent`, semua service `destination` (relationship ke `destinations`). |
| Reusable fields | `sortOrderField` (number, default 0), `statusField` (select draft/published, `access.update: adminFieldAccess`). |
| Slug otomatis | [`generateSlug`](apps/cms/src/hooks/generateSlug.ts) — field hook `beforeValidate`, **tanpa** akses `req.payload`. |
| Hook auto-increment | **Tidak ada.** Belum ada collection dengan `beforeChange` yang query `req.payload.find`. |
| Globals | `SiteSettings, HeaderSettings, FooterSettings, HomepageContent, SiteFeatures`. [`SiteFeatures`](apps/cms/src/globals/SiteFeatures.ts) = rumah toggle super-admin (sudah ada grup `modules`, `sections`, `features`, `destinations`). |
| Access helpers | [`roles.ts`](apps/cms/src/access/roles.ts): `isEditor`(any-auth), `isAdmin`, `isSuperAdmin`, `adminFieldAccess`, `superAdminFieldAccess`. |
| Registrasi | Collection didaftarkan di [`payload.config.ts:109`](apps/cms/src/payload.config.ts); globals di `:133`. |
| Shared types | Auto-generate ke `packages/shared/src/types/payload-types.ts` (via `pnpm generate:types`). `Destination.type: 'island' | 'mainland'` di line ~1961. |

### Penilaian per-goal

**Goal 1 — Collection `destination-types` + relationship — ✅ YES**
- **Didukung oleh:** pola `ServiceTypes` (persis), `generateSlug` hook, `sortOrderField`.
- **Perlu diubah:** buat `apps/cms/src/collections/DestinationTypes.ts`; daftarkan di `payload.config`; ganti field `type` di `Destinations` dari `select` → `relationship relationTo: 'destination-types'`. **Ini schema change + migrasi data** (lihat §4 & Risk).
- **Catatan `isActive`:** disarankan pakai `checkbox isActive` (sesuai goal) **atau** samakan dgn pola `status` existing. Goal minta `isActive` boolean → pakai checkbox.

**Goal 2 — Feature toggle `destinationTypesEnabled` — ⚠️ YES (dengan catatan)**
- **Didukung oleh:** `SiteFeatures` global (super-admin, `access.update: isSuperAdmin`, `hidden` utk non-SA). Frontend sudah punya pola baca `getSiteFeatures()` (dipakai Phase 3.22).
- **Perlu diubah:** tambah field toggle (mis. `destinations.typesEnabled` atau grup baru) di `SiteFeatures`.
- **KENDALA penting:** "admin **hides** type management saat OFF" **tidak bisa** murni via `admin.hidden` — signature Payload v3 `hidden?: boolean | (({ user }) => boolean)` bersifat **sinkron & hanya menerima `user`**, tidak bisa membaca nilai Global. Opsi:
  - (a) **Gate via access-control**: `access.read/update` collection `destination-types` async membaca global → kalau OFF, non-SA tak punya akses → Payload menyembunyikan dari nav. **Tapi** ini juga memblokir kebutuhan lain; dan read frontend harus tetap publik. Perlu desain hati-hati (read tetap publik, hanya update yang di-gate).
  - (b) **Soft**: collection tetap terlihat, tapi frontend yang benar-benar OFF; admin diberi deskripsi "fitur nonaktif". Paling sederhana, rendah risiko.
  - (c) Custom admin component (paling mahal).
  - **Rekomendasi:** (b) untuk admin-visibility + toggle murni meng-gate **rendering frontend** dan **field `type` di Destinations** (via `admin.condition` yang bisa async? — TIDAK, `condition` juga sinkron). → Realistis: toggle meng-gate **frontend** penuh; sisi admin bersifat informatif. Perlu keputusan owner.

**Goal 3 — Auto-increment sortOrder + swap — ✅ YES (butuh hook baru)**
- **Didukung oleh:** Payload `hooks.beforeChange` dengan `req.payload.find`/`update` (standar v3). `defaultSort: 'order'` sudah dipakai di `ServiceTypes`.
- **Perlu diubah:** hook baru `apps/cms/src/hooks/autoSortOrder.ts`:
  - `create` tanpa sortOrder → `max(sortOrder)+1`.
  - `update` dgn sortOrder yang bentrok → tukar (swap) nilai dgn doc pemilik nilai itu (via `payload.update`).
  - **Edge:** hindari infinite loop (guard `context`/flag saat swap), race pada edit paralel (dev/CMS kecil → LOW). Kompleksitas **MEDIUM**.
- Admin list asc → `admin.defaultSort: 'sortOrder'`.

**Goal 4 — Access control — ✅ YES**
- **Didukung oleh:** `roles.ts` lengkap. Pola `ServiceTypes`: `create: isSuperAdmin, update: isAdmin, delete: isSuperAdmin, read: () => true`.
- **Perlu diubah:** untuk memenuhi "admin update **hanya saat enabled**", `update` = fungsi async yang cek role admin **dan** global toggle. Editor read-only sudah otomatis (read publik; tak punya create/update/delete). Toggle super-admin: `SiteFeatures.access.update: isSuperAdmin` (sudah).

**Goal 5 — Frontend dinamis — ⚠️ SEBAGIAN (klarifikasi diperlukan)**
- **Realita:** `destination.type` **belum pernah** dirender/di-filter di frontend. Jadi "mengganti string type hardcoded" nyaris **tidak ada yang diganti** untuk field type.
- **"Filter/search render type aktif urut sortOrder"** = **fitur BARU** (UI filter berbasis type belum ada). Ini menambah, bukan mengganti.
- **Ambiguitas (perlu keputusan owner):**
  1. Apakah type dipakai sebagai **filter baru** di listing (di samping/menggantikan filter destinasi hierarkis Phase 3.22)? atau
  2. Type hanya **label/badge** di kartu/halaman destinasi? atau
  3. Type murni **taksonomi internal CMS** (tak tampil) — maka goal 5 praktis kosong.
- **Didukung oleh (jika jadi filter):** pola `getDestinations` + tab filter di `ServiceListing*` (bisa dikembangkan). `getSiteFeatures` untuk gating.
- **Kesimpulan:** feasible secara teknis, tapi **scope goal 5 harus ditegaskan** sebelum implementasi.

**Goal 6 — Shared types — ✅ YES**
- **Didukung oleh:** `pnpm --filter cms generate:types` (dipakai di 3.21 & 3.22). Otomatis membuat `DestinationType` interface + mengubah `Destination.type` menjadi `(number | null) | DestinationType`.
- **Perlu diubah:** jalankan generate:types; audit pemakaian tipe `'island' | 'mainland'` di kode (saat ini **tidak ada** di frontend → aman).

### Ringkasan feasibility

| Goal | Feasible | Catatan |
|------|----------|---------|
| 1 Collection + relationship | ✅ YES | Pola ServiceTypes; schema change + migrasi 6 row |
| 2 Feature toggle | ⚠️ YES* | "Hide admin" tak native — perlu keputusan pendekatan |
| 3 Auto-increment + swap | ✅ YES | Hook `beforeChange` baru, MEDIUM |
| 4 Access control | ✅ YES | Pola roles siap; update gated toggle = async access |
| 5 Frontend dinamis | ❌ DIBATALKAN | Owner tak butuh; type = internal-only |
| 6 Shared types | ✅ YES | generate:types otomatis |

---

## 3. Phase B — Risk Assessment

| Risiko | Level | Penjelasan & Mitigasi |
|--------|-------|----------------------|
| **Data loss saat migrasi field `type`** | 🟠 **MEDIUM** | Ubah `select` → `relationship` = kolom `type` (enum string) diganti `type_id` (FK). Nilai lama (`island`/`mainland`) **tidak auto-map** ke row `destination-types`. Mitigasi: (1) seed 2 row awal (`Island`, `Main Island`), (2) migrasi: baca 6 destinasi existing, set `type_id` sesuai string lama sebelum drop kolom. Ikuti [DB-SCHEMA-CHANGES.md](../DB-SCHEMA-CHANGES.md): kemungkinan prompt "create vs rename" → pilih **create** (tipe beda: enum→FK). Backup `cms.db` dulu. |
| **Merusak query/komponen frontend** | 🟢 **LOW** | `destination.type` **tidak dipakai** di frontend. `getDestinations` depth=1 akan populate relasi `type` sebagai objek — aman. Risiko hanya jika goal 5 menambah UI baru (itu additive). |
| **Merusak workflow admin** | 🟠 **MEDIUM** | Field `type` yang tadinya dropdown 2-opsi jadi relationship (pilih dari list). Admin harus paham. Toggle yang meng-gate update bisa membingungkan bila "hide" tak konsisten (lihat Goal 2). Mitigasi: deskripsi field jelas + default toggle ON setelah seed. |
| **Konflik dgn collection/global lain** | 🟢 **LOW** | Slug `destination-types` unik (belum ada). Nama tabel `destination_types` pendek → aman dari limit 63-char. Tak bentrok dgn `service-types`/`categories`. |
| **Dampak ke shared types package** | 🟢 **LOW** | Auto-generate. `Destination.type` berubah bentuk; karena tak ada consumer FE yang meng-assert `'island'|'mainland'`, tak ada compile break. Perlu cek seed scripts CMS yang set `type: 'island'` (ada di scripts) → harus diupdate ke id/slug. |
| **Dampak build/deploy** | 🟢 **LOW** | Tak ada perubahan pipeline. FE tetap SSG fetch dari CMS. CMS schema push lokal (SQLite) → prompt Drizzle. Prod (D1) butuh migration file bila di-deploy — catat di [post-deploy-todo](../post-deploy-todo.md). |
| **Kompleksitas rollback** | 🟠 **MEDIUM** | Bila kolom `type` sudah di-drop & data ter-migrasi, rollback butuh restore backup DB. Kode bisa `git revert`. Mitigasi: kerjakan di branch terpisah, backup DB sebelum schema push, seed script reproducible. |

**Kesimpulan risiko:** Manageable. Titik paling sensitif = **migrasi field `type` (MEDIUM)** dan **desain toggle "hide admin" (MEDIUM)**. Sisanya LOW.

---

## 4. Phase C — Implementation Plan

### Langkah berurut (dengan dependensi)

1. **Backup DB dev** (`Copy-Item apps/cms/cms.db cms.db.bak`). *(prasyarat semua)*
2. **Collection `DestinationTypes.ts`** — name, slug (generateSlug), `isActive` (checkbox, default true), `sortOrder`; access read-public/create-SA/update-admin/delete-SA; `admin.defaultSort: 'sortOrder'`, `useAsTitle: 'name'`, group 'Content'. *(dep: 1)*
3. **Hook `autoSortOrder.ts`** — beforeChange: auto max+1 saat create; swap saat update konflik (guard anti-loop). Pasang di `DestinationTypes`. *(dep: 2)*
4. **Registrasi** di `payload.config.ts` collections. *(dep: 2)*
5. **Seed `seed-destination-types.ts`** — buat 2 row awal: `Island` (sortOrder 1), `Main Island` (sortOrder 2). *(dep: 4 + CMS restart/schema push)*
6. **Migrasi Destinations** — ubah field `type` select → relationship `relationTo: 'destination-types'`. Script migrasi: map string lama (`island`→row Island, `mainland`→row Main Island) ke `type_id` untuk 6 row existing. *(dep: 5)*
7. **Toggle di `SiteFeatures`** — field `destinationTypesEnabled` (grup `destinations` atau baru). *(dep: independen, bisa paralel)*
8. **Access `update` gated toggle** — `DestinationTypes.access.update` = async cek `isAdmin` && global toggle ON. *(dep: 7)*
9. **generate:types** → `DestinationType` + `Destination` baru di shared. *(dep: 6)*
10. **Frontend (SCOPE goal 5 — tunggu keputusan owner)** — bila type jadi filter/badge: baca `getDestinationTypes()` (helper baru di `payload.ts`), render urut sortOrder, gate via `getSiteFeatures()`. *(dep: 9)*
11. **Update seed scripts lama** yang set `type: 'island'|'mainland'` → id/slug relationship. *(dep: 6)*
12. **Docs** — update `03-CONTENT-MODEL.md`, `04-RBAC.md`, `02-DATABASE-SCHEMA.md`, PROGRESS.md; report akhir. *(dep: semua)*

### Daftar dampak file (per area)

**[cms] — baru**
- `apps/cms/src/collections/DestinationTypes.ts`
- `apps/cms/src/hooks/autoSortOrder.ts`
- `apps/cms/src/scripts/seed-destination-types.ts`
- `apps/cms/src/scripts/migrate-destination-type.ts` (one-time)

**[cms] — diubah**
- `apps/cms/src/collections/Destinations.ts` (field `type`: select → relationship)
- `apps/cms/src/globals/SiteFeatures.ts` (toggle `destinationTypesEnabled`)
- `apps/cms/src/payload.config.ts` (registrasi collection)
- Seed scripts existing yang menulis `type` destinasi (grep `type: 'island'|'mainland'`)

**[shared] — diubah (auto)**
- `packages/shared/src/types/payload-types.ts` (generate:types)

**[web] — diubah (kondisional, tergantung scope goal 5)**
- `apps/web/src/lib/payload.ts` (`getDestinationTypes` helper)
- `apps/web/src/components/blocks/ServiceListingHeroImmersive.astro` / `ServiceListingEditorial.astro` (bila type jadi filter)
- Komponen kartu/halaman destinasi (bila type jadi badge)

**[docs] — diubah**
- `docs/03-CONTENT-MODEL.md`, `docs/04-RBAC.md`, `docs/02-DATABASE-SCHEMA.md`, `docs/PROGRESS.md`, report phase.

### Strategi migrasi data existing

1. Backup `cms.db`.
2. Seed 2 `destination-types` (`island`, `mainland`/Main Island) **sebelum** mengubah field Destinations.
3. Ubah field → relationship (optional dulu / non-required sementara agar tak NOT-NULL error).
4. Jalankan script migrasi: untuk tiap destinasi, set `type` = id row type sesuai string lama.
5. Verifikasi 6 destinasi ter-set, baru (opsional) jadikan `required`.
6. Jawab prompt Drizzle sesuai [DB-SCHEMA-CHANGES.md](../DB-SCHEMA-CHANGES.md) (create column utk `type_id`, drop `type` lama setelah data aman).

### Rollback plan

1. `git revert`/checkout branch untuk semua file kode.
2. Restore `cms.db` dari backup (`cms.db.bak`) → kembalikan kolom `type` enum + data lama.
3. `generate:types` ulang.
4. Restart CMS. (Prod D1: jangan drop manual — buat migration balik + test staging.)

### Acceptance criteria

- [ ] Collection `destination-types` muncul di admin (group Content), list sort `sortOrder` asc.
- [ ] Create type tanpa isi sortOrder → dapat `max+1` otomatis.
- [ ] Set sortOrder ke nilai yang dipakai type lain → kedua nilai **tertukar** (swap), tak ada duplikat.
- [ ] Slug auto dari name; `isActive` toggle jalan.
- [ ] Destinations `type` kini relationship; 6 destinasi existing tetap punya type benar (tanpa data loss).
- [ ] Super-admin: full CRUD type + bisa ubah toggle. Admin: bisa update saat toggle ON, tak bisa create/delete. Editor: read-only (tak lihat aksi tulis).
- [ ] Toggle OFF → frontend tak render filter/badge type (data tetap ada di DB).
- [ ] `generate:types` menghasilkan `DestinationType`; build FE (`pnpm --filter @dn-journeys/web build`) sukses.
- [ ] (Goal 5 sesuai scope final) filter/badge type render urut sortOrder & hanya yang `isActive`.

### Estimasi effort

| Bagian | Estimasi |
|--------|----------|
| Collection + hook auto/swap + registrasi | 0.5 hari |
| Toggle + access gating | 0.25 hari |
| Migrasi data + seed + verifikasi schema push | 0.5 hari |
| Shared types + update seed lama | 0.25 hari |
| Frontend | ~~dibatalkan~~ 0 (Goal 5 dibatalkan) |
| Docs + testing | 0.25 hari |
| **Total** | **~1.75–2 hari kerja** |

---

## 5. Keputusan Owner — SUDAH DIPUTUSKAN (2026-08-24)

1. **Scope Goal 5 — ❌ DIBATALKAN.** Type **tidak** dirender di frontend (bukan filter, bukan badge). Type = **taksonomi internal CMS saja**. → Langkah implementasi #10 (frontend) & seluruh dampak file [web] **dihapus dari scope**.
2. **Toggle di admin — ✅ SOFT.** Collection `destination-types` tetap terlihat di admin; toggle `destinationTypesEnabled` hanya (a) informatif di admin dan (b) meng-gate `access.update` untuk admin (bukan super-admin). Tidak ada usaha menyembunyikan collection secara native.
3. **`isActive` — ✅ checkbox** (`type: 'checkbox'`, defaultValue true). Bukan pola `status`.
4. **Relasi dgn Phase 3.22 — ✅ DIKLARIFIKASI: dua sumbu ORTHOGONAL.**
   - **Axis A (3.22) Hierarki** (`parent` + `showInFilter`) = satu-satunya yang mengatur filter frontend.
   - **Axis B (3.23) Type** = kategori internal, tak tampil di frontend.
   - Keduanya independen; type **tidak** menggantikan/menimpa hierarki. Kode FE 3.22 tak pernah baca `d.type` → tak ada risiko break.
   - **Rekomendasi penamaan:** seed type sebagai **"Island"** & **"Mainland"** (generik) agar tidak bentrok dengan nama destinasi core "Main Island". Relabel "Mainland→Main Island" dari 3.22 jadi tak relevan (label kini row di collection type).

### Dampak keputusan ke rencana
- **Goal 5 & langkah #10 dihapus.** Effort frontend → **0**. Total estimasi turun jadi **~1.75–2 hari**.
- Area **[web]** dihapus dari daftar dampak file (kecuali bila nanti butuh `getDestinationTypes` untuk keperluan lain — saat ini tidak).
- Toggle: cukup field boolean di `SiteFeatures` + dipakai di `access.update` collection (async cek `isAdmin` && toggle). Read tetap publik; frontend tak terpengaruh.

---

## 6. Related Docs

- [Phase 3.22 Hierarchical Destinations](phase-3.22-hierarchical-destinations.md)
- [DB-SCHEMA-CHANGES.md](../DB-SCHEMA-CHANGES.md)
- [03-CONTENT-MODEL.md](../03-CONTENT-MODEL.md), [04-RBAC.md](../04-RBAC.md)
- Preseden: [`ServiceTypes.ts`](apps/cms/src/collections/ServiceTypes.ts)
