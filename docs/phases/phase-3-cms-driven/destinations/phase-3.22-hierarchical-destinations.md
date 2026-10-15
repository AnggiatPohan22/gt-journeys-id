# Phase 3.22: Hierarchical Destinations (Core + Child Filter)

**Status:** 🔨 Code selesai · ⏳ butuh CMS schema push + seed hierarki · belum merge
**Timeline:** 2026-08-23
**Depends on:** [Phase 3.21 CMS Section Listing Header](phase-3.21-cms-section-listing-header.md)
**Branch:** `feature/service-listing-fixes`

## Fokus / Tujuan

Destinasi jadi **berjenjang (parent → child)**. Di filter/search listing hanya
muncul **4 "core"** (owner: Main Island, Nusa Penida, Nusa Lembongan, Nusa
Ceningan). Sub-lokasi (Kuta, Sanur, Nusa Dua, Kelingking Beach, dll.)
**disembunyikan** dari tab, tapi **ikut cocok** saat core-nya dipilih atau saat
dicari via teks.

Kontrol:
- **Super Admin** menandai destinasi sebagai "core" (field `showInFilter`) dan
  mengaktifkan fitur (toggle di Pengaturan Fitur).
- **Admin** bisa CRUD destinasi + set `parent` (bukan core flag).
- **Type tetap 2**: `island` + `mainland` (label "Mainland" → **"Main Island"**,
  value tidak berubah → tanpa migrasi data). Core/child **orthogonal** terhadap type.

## Keputusan Owner (2026-08-23)

1. Penetapan core = **checkbox** (`showInFilter`), bukan derivasi "parentless".
2. `showInFilter` = **Super Admin only** (field access); `parent` = admin boleh edit.
3. Label type "Mainland" → **"Main Island"** (value `mainland` tetap).
4. **Text search hierarkis** = ya (ketik nama core/child → item muncul).
5. Berlaku untuk **kedua layout** listing (hero-immersive + editorial).

## Yang Dikerjakan

### 1. CMS — `Destinations` collection
File: [apps/cms/src/collections/Destinations.ts](apps/cms/src/collections/Destinations.ts)
- `type` option relabel: `Mainland` → `Main Island` (value tetap `mainland`).
- **+ `parent`** — relationship self (`relationTo: 'destinations'`), opsional,
  sidebar. Kosong = top-level. Editable oleh admin (update access collection = any-auth).
- **+ `showInFilter`** — checkbox "Core Destination", `defaultValue: false`,
  field access `create/update: superAdminFieldAccess` (Super Admin only), sidebar.

### 2. CMS — `SiteFeatures` global (Super Admin only)
File: [apps/cms/src/globals/SiteFeatures.ts](apps/cms/src/globals/SiteFeatures.ts)
- **+ group `destinations`** → checkbox **`hierarchicalFilter`** (`defaultValue: false`).
  OFF = perilaku flat lama; ON = mode core/child.

### 3. Types — regenerate
File: `packages/shared/src/types/payload-types.ts` (auto)
- `Destination.parent`, `Destination.showInFilter`,
  `SiteFeature.destinations.hierarchicalFilter` muncul di shared types.

### 4. Frontend — kedua varian listing
Files:
[ServiceListingHeroImmersive.astro](apps/web/src/components/blocks/ServiceListingHeroImmersive.astro),
[ServiceListingEditorial.astro](apps/web/src/components/blocks/ServiceListingEditorial.astro)
- Fetch `getSiteFeatures()` → `hierEnabled = destinations.hierarchicalFilter === true`.
- Bangun `destBySlug` map + helper `coreSlugOf()` (walk parent chain via map) +
  `coreNameOf()`.
- Tab filter: kalau `hierEnabled`, hanya destinasi `showInFilter === true`; else semua.
- Kartu: `data-dest` = **core slug** (kalau hierEnabled) atau slug sendiri (else).
- Search: `data-name` = nama item **+ nama destinasi sendiri + nama core**
  (kalau hierEnabled) → ketik "main island" surface child-nya.
- `getDestinations` limit **20 → 100** (child mengembang jumlah destinasi).
- **`<script>` JS tidak diubah** — tetap exact-match `data-dest` + substring `data-name`.
  Hierarki diselesaikan build-time; JS cukup match key yang sudah dihitung.

**Degradasi aman:** kalau fitur OFF / CMS belum push schema, `hierEnabled=false`
→ perilaku persis seperti sebelum fase ini (flat, semua destinasi jadi tab).

## File yang Berubah

| File | Perubahan | Area |
|------|-----------|------|
| `apps/cms/src/collections/Destinations.ts` | relabel type + field `parent` + `showInFilter` (SA-only) | [cms] |
| `apps/cms/src/globals/SiteFeatures.ts` | + group `destinations.hierarchicalFilter` | [cms] |
| `packages/shared/src/types/payload-types.ts` | regenerate (auto) | [shared] |
| `apps/web/.../ServiceListingHeroImmersive.astro` | hierarki: tabs core, match core, search hierarkis | [web] |
| `apps/web/.../ServiceListingEditorial.astro` | idem | [web] |
| `docs/03-CONTENT-MODEL.md` | update mapping destinasi | [docs] |
| `docs/PROGRESS.md` | entry Phase 3.22 | [docs] |
| `docs/phases/phase-3.22-...md` | report ini | [docs] |

## Impact

- **Database**: schema change — kolom baru di tabel `destinations`
  (`parent_id`, `show_in_filter`) + `site_features` (`destinations_hierarchical_filter`).
  Semua nama kolom pendek, tanpa nesting block → aman di bawah 63-char.
- **CMS**: Destinations dapat 2 field baru; SiteFeatures dapat 1 toggle baru.
- **Frontend**: filter/search destinasi di kedua layout listing jadi hierarkis
  **saat fitur diaktifkan**.
- **Routes**: none.
- **RBAC**: `showInFilter` field-level = Super Admin only (`superAdminFieldAccess`);
  `parent` mengikuti collection update access (any-auth). Collection access lain tetap.

## ⚠️ Langkah Aktivasi (WAJIB — belum dijalankan)

1. **Restart CMS** (`cd apps/cms && pnpm dev`). Drizzle akan prompt kolom baru —
   jawab **`+ create column`** untuk `parent_id`, `show_in_filter`,
   `destinations_hierarchical_filter` (semua BARU, bukan rename). Lihat
   [DB-SCHEMA-CHANGES.md §1](../DB-SCHEMA-CHANGES.md).
2. **Set data hierarki** (via admin atau seed):
   - Tandai 4 core (`showInFilter = true`): Main Island, Nusa Penida, Nusa
     Lembongan, Nusa Ceningan.
   - Set `parent` tiap sub-lokasi ke core-nya (Kuta/Sanur/Nusa Dua → Main Island;
     Kelingking Beach → Nusa Penida; dst).
   - Data saat ini (6): Mainland Bali, Nusa Penida, Lembongan, Ceningan,
     Kelingking Beach, Kuta → perlu ditata jadi 4 core + child.
3. **Aktifkan toggle**: Pengaturan Fitur → Destinasi → **Hierarchical Destinations** ✔.
4. **Rebuild frontend** (`pnpm --filter @dn-journeys/web build`) atau reload dev.

## Testing

- [x] `generate:types` → `parent`, `showInFilter`, `hierarchicalFilter` muncul.
- [x] Logic flat-path (fitur OFF) identik dgn sebelumnya (verifikasi kode).
- [ ] CMS schema push (butuh restart + jawab prompt) — **belum**.
- [ ] Fitur ON + 4 core + child parent → tab hanya 4 core; pilih Main Island →
  item di Kuta/Sanur ikut muncul — **belum** (butuh data).
- [ ] Search "main island" surface child — **belum**.
- [ ] Kedua layout (immersive `/villa`, editorial) — **belum**.

## Rollback

1. Hapus `parent` + `showInFilter` dari `Destinations.ts`; balikkan label
   type "Main Island" → "Mainland".
2. Hapus group `destinations` dari `SiteFeatures.ts`.
3. Balikkan blok hierarki + card computation + limit (100→20) di kedua
   komponen Astro (git revert file).
4. `generate:types` + restart CMS (drop kolom via prompt Drizzle).

## Dokumentasi yang Diupdate

- [x] `docs/03-CONTENT-MODEL.md`
- [x] `docs/PROGRESS.md`
- [x] `docs/phases/phase-3-cms-driven/destinations/phase-3.22-hierarchical-destinations.md` (baru)
- [ ] `docs/04-RBAC.md` — field-level SA access baru (opsional, belum)

## Next Steps

- Owner jalankan **Langkah Aktivasi** di atas.
- (Opsional) seed script untuk 4 core + parent child biar reproducible.
- Merge `feature/service-listing-fixes` → `main` (pending sejak 3.20).
