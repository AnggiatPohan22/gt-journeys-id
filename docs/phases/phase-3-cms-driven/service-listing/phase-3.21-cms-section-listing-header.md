# Phase 3.21: CMS-Editable Section Listing Header

**Status:** ✅ Code selesai · build/render verified (dev) · belum merge ke main
**Timeline:** 2026-08-23
**Depends on:** [Phase 3.20 Service Listing Fixes](phase-3.20-service-listing-fixes.md)
**Branch:** `feature/service-listing-fixes`

## Fokus / Tujuan

Header listing di halaman section (layout **hero-immersive**) sebelumnya
**hardcoded**: judul `"Luxury Collections"` dan subtitle
`"properties available in Bali & surrounding islands"` ditulis langsung di
komponen Astro. Owner tidak bisa mengubahnya dari CMS.

Phase ini membuat **judul + subtitle listing** editable dari
**Site Settings → Section Pages** (group baru di global `site-settings`),
mengikuti pola retain-with-fallback yang sudah dipakai `errorPages`
(`/property`, `/404`). Angka jumlah hasil (**live count**) tetap dinamis —
tidak diubah.

Scope sengaja **sempit** (hanya varian hero-immersive) sesuai keputusan owner:
varian Editorial (`"Full Collection"`) **tidak** disentuh di fase ini.

## Yang Dikerjakan

### 1. CMS — group `sectionPages` di SiteSettings
File: [apps/cms/src/globals/SiteSettings.ts](apps/cms/src/globals/SiteSettings.ts)
- Tambah `group` bernama `sectionPages` (label "Section Pages"), berisi 2 field text:
  - `listingTitle` — defaultValue `"Luxury Collections"`
  - `listingSubtitle` — defaultValue `"properties available in Bali & surrounding islands"`
- Ditempatkan tepat sebelum group `errorPages`, konsisten dengan konvensi
  "copy per-halaman" yang sudah ada di global ini.

### 2. Types — regenerate
File: `packages/shared/src/types/payload-types.ts` (auto-generated)
- `pnpm --filter cms generate:types` → `SiteSetting.sectionPages.{listingTitle,listingSubtitle}` muncul di shared types (dipakai `@shared/types/payload-types`).

### 3. Frontend — render dinamis
File: [apps/web/src/components/blocks/ServiceListingHeroImmersive.astro](apps/web/src/components/blocks/ServiceListingHeroImmersive.astro)
- Import `getSiteSettings` + fetch `await getSiteSettings().catch(() => null)`
  (pola sama seperti Header/Footer/WhatsAppFloating).
- `listingTitle = sp.listingTitle || 'Luxury Collections'`
- `listingSubtitle = sp.listingSubtitle || 'properties available in Bali & surrounding islands'`
- Markup `<h3>` pakai `{listingTitle}`; baris subtitle jadi
  `<span data-role="count">{count}</span> {listingSubtitle}`.
- **Catatan desain:** toggle singular/plural lama (`property`/`properties`)
  di-collapse jadi satu string editable. Ini aman karena JS filter/search
  **tidak pernah** meng-update kata itu (hanya angka `data-role="count"`).

## File yang Berubah

| File | Perubahan | Area |
|------|-----------|------|
| `apps/cms/src/globals/SiteSettings.ts` | + group `sectionPages` (2 text field) | [cms] |
| `packages/shared/src/types/payload-types.ts` | regenerate (auto) | [shared] |
| `apps/web/src/components/blocks/ServiceListingHeroImmersive.astro` | fetch settings + render judul/subtitle dinamis + fallback | [web] |
| `docs/03-CONTENT-MODEL.md` | update §2.5 (listing header → CMS Hybrid) | [docs] |
| `docs/PROGRESS.md` | tambah baris Phase 3.21 | [docs] |
| `docs/phases/phase-3.21-...md` | report ini | [docs] |

## Impact

- **Database**: schema change — global `site_settings` dapat kolom baru
  `section_pages.listing_title` + `section_pages.listing_subtitle`.
  Tabel `site_settings` (13 char), tanpa nesting `additionalBlocks` → jauh
  di bawah limit 63-char Postgres. Aman.
- **CMS**: global `site-settings` dapat group baru "Section Pages".
- **Frontend**: header listing hero-immersive (dipakai `/villa`, `/tour`,
  `/yacht`, `/restaurant`, `/rental`, `/venue`, `/water-activity`, `/spa`)
  sekarang render judul/subtitle dari CMS.
- **Routes**: none.
- **RBAC**: none — update `site-settings` sudah dibatasi `isAdmin` (existing).

## Testing

- [x] `generate:types` → `sectionPages` muncul di `payload-types.ts` (line ~22638).
- [x] CMS API `GET /api/globals/site-settings` → `sectionPages` terisi default
  (`{listingTitle:"Luxury Collections", listingSubtitle:"properties available in Bali & surrounding islands"}`).
- [x] Dev render `/villa` (localhost:4321): `<h3>` = "Luxury Collections",
  baris subtitle = "4 properties available in Bali & surrounding islands"
  (count live = 4). Tidak ada console error.
- [ ] Ubah nilai di CMS admin → verifikasi frontend berubah setelah rebuild
  (belum diuji; default = teks lama sehingga visual identik).
- [ ] Production build (`pnpm --filter @dn-journeys/web build`) — belum dijalankan di fase ini.

## Rollback

1. Hapus group `sectionPages` dari `apps/cms/src/globals/SiteSettings.ts`.
2. Kembalikan markup hardcoded di `ServiceListingHeroImmersive.astro`
   (`<h3>Luxury Collections</h3>` + subtitle statis) dan hapus import
   `getSiteSettings` + blok fetch.
3. `pnpm --filter cms generate:types` untuk regen types.
4. Restart CMS (drop kolom via prompt Drizzle — lihat DB-SCHEMA-CHANGES.md).

## Dokumentasi yang Diupdate

- [x] `docs/03-CONTENT-MODEL.md` (§2.5)
- [x] `docs/PROGRESS.md`
- [x] `docs/phases/phase-3-cms-driven/service-listing/phase-3.21-cms-section-listing-header.md` (baru)
- [ ] `docs/02-DATABASE-SCHEMA.md` — opsional (perubahan global kecil; belum diupdate)

## Next Steps

- Owner uji ubah nilai di CMS admin → rebuild → cek frontend.
- (Opsional, backlog) wire varian Editorial `"Full Collection"` ke setting
  yang sama kalau owner mau kedua layout CMS-driven.
- Merge `feature/service-listing-fixes` → `main` (masih pending dari 3.20).
