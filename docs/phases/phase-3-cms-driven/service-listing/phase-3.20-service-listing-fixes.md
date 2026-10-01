# Phase 3.20: Service Listing Fixes (Consolidation + SEO)

**Status:** ✅ Code + data-apply complete · build verified (46 pages) · belum merge ke main
**Timeline:** 2026-08-23
**Depends on:** [Phase 3.14–3.19 Sprint](phase-3.14-cms-enhancement-sprint.md)
**Branch:** `feature/service-listing-fixes`

## Tujuan

Menindaklanjuti dua audit ([service-listing-visual-audit](../reports/service-listing-visual-audit.md)
+ [hardcoded-pages-audit](../reports/hardcoded-pages-audit.md)): konsolidasi rute
service ke **singular canonical**, hapus/redirect rute plural, samakan layout villa
ke hero-immersive, dan tambah **SEO technical** (JSON-LD structured data, breadcrumbs,
canonical/OG tags) — sebagian pekerjaan SEO Phase 4 yang bisa dikerjakan di kode.

Keputusan owner: **/yacht → CMS page** (delete static, unreserve) + **plural listing
→ delete + redirect** (singular canonical).

## Yang Dikerjakan

### Step 1: A1 + A2 — ✅ DONE (commit `f074174`)
- Deleted `apps/web/src/pages/yacht/index.astro`; edited `apps/cms/src/fields/reservedSlugs.ts` (remove `yacht`).
- Verified browser: `/yacht` render CMS landing page (hero-immersive serviceListing + trustBadges), konsisten dgn `/restaurant`. No console errors.

### Step 2: B1 — ✅ DONE (commit `81649bc` + data applied 2026-08-23)
- Files: `seed-villa-page.ts` + `seed-landing-pages.ts` → villa serviceListing `layout: hero-immersive` + hero image + detailed cards.
- **Data-apply DONE** (owner menjalankan seed): CMS API mengonfirmasi villa page `serviceListing.layout = hero-immersive`. `/villa` kini konsisten dgn landing lain.

### Step 3: C-Opsi 1 (konsolidasi plural→singular) — ✅ DONE (commit `7eb3507`)
- Deleted 6 plural listing `index.astro` + orphaned `ListingHeader.astro` + `lib/listingHeader.ts`.
- `public/_redirects`: tambah exact-path 301 (plural listing → singular); wildcard detail redirects sudah ada dari task sebelumnya.
- Internal links → singular: Header/Footer fallback nav, homepage hero CTA; stale card JSDoc + FilterBookingBar example.
- Seeds: `secondaryButtonLink` "All X" → singular (✅ data-apply DONE — 7 landing page CMS API mengonfirmasi link singular: /villa /tour /yacht /restaurant /rental /venue /water-activity).
- Verified: `/tours` → 404 di dev (prod 301 → `/tour`); singular detail + CMS listing render OK; no console errors.

### Step 4: D-tech (SEO structured data) — ✅ DONE (commit `92a4a37`)
- Baru: `lib/structuredData.ts`, `components/common/StructuredData.astro`, `components/common/Breadcrumbs.astro`.
- `BaseLayout.astro`: canonical, og:url/site_name/locale/type, Twitter card, robots (+ `noindex` prop; 404 noindex). `PageLayout.astro` forward props.
- `[...slug].astro`: WebPage + BreadcrumbList; ItemList (produk) untuk page ber-serviceListing block.
- 7 detail pages: per-type JSON-LD (TouristTrip / LodgingBusiness / Restaurant / EventVenue / SportsActivityLocation / Product) + Offer + breadcrumbs visual.
- `index.astro`: WebSite + Organization.
- Verified browser (valid JSON, correct canonical/OG): `/villa/luxury-hotel-kuta` → BreadcrumbList + LodgingBusiness ("Home / Villas & Hotels / Luxury Hotel Kuta"); `/restaurant` → WebPage + BreadcrumbList + ItemList(4, singular URLs); `/about` → WebPage + BreadcrumbList; `/` → WebSite + Organization. No console errors dari perubahan ini.

## Status Detail per Sub-task

| Step | Nama | Status | Commit |
|------|------|--------|--------|
| 1 (A1+A2) | /yacht → CMS page + unreserve slug | ✅ DONE | `f074174` |
| 2 (B1) | Villa layout → hero-immersive | ✅ DONE (data applied) | `81649bc` |
| 3 (C-Opsi 1) | Plural listing delete + 301 redirect | ✅ DONE (button links applied) | `7eb3507` |
| 4 (D-tech) | JSON-LD + breadcrumbs + canonical/OG | ✅ DONE | `92a4a37` |

### Verifikasi build & data — 2026-08-23 (setelah owner apply seed)
- `apps/web/src/pages/villa/[slug].astro` sempat terhapus di working tree → **dipulihkan** (`git checkout`); SEO wiring (LodgingBusiness JSON-LD + breadcrumbs) utuh.
- `pnpm --filter @dn-journeys/web build` → **Complete! 46 pages** (turun dari 76 era sprint karena 6 plural listing + plural detail routes sudah dihapus/redirect). Villa detail build 4 halaman.
- `sitemap-index.xml` ter-generate otomatis saat build (`@astrojs/sitemap`).
- CMS API konfirmasi: villa `serviceListing.layout=hero-immersive`; 7 landing `secondaryButtonLink` singular; SiteSettings contact + mapEmbed terisi.

## Yang Masih Pending / Bisa Di-improve

### Data-apply — ✅ SELESAI (2026-08-23)
Dua perubahan data CMS yang sebelumnya menunggu CMS di-stop kini **sudah di-apply**
oleh owner (seed dijalankan) dan diverifikasi via CMS API:
1. **B1** — villa layout → hero-immersive ✅
2. **C-opsi 1 button links** — `secondaryButtonLink` "All X" → singular ✅ (7 landing)

Seed reference (kalau perlu re-apply di environment lain):
```
# stop CMS dev dulu, lalu:
cd apps/cms
pnpm tsx src/scripts/seed-landing-pages.ts          # villa layout + semua button links
pnpm tsx src/scripts/seed-service-landing-content.ts # button links tour/yacht/dst
# restart CMS dev
```

### Sisa handoff
- **Merge** `feature/service-listing-fixes` → `main` (belum dilakukan).

### Backlog (tidak dikerjakan)
- **D5** — template `service_listing` + `linkedServiceType` wiring (owner minta eksplisit tunda).
- Homepage media 404 di dev (missing seed images) — di luar scope SEO task ini.

### Verifikasi produksi (di-defer ke deploy)
Redirect 301 & canonical absolute URL **hanya bisa diverifikasi penuh di produksi**
(Cloudflare Pages membaca `_redirects` dari root output; canonical butuh production URL,
bukan localhost). Lihat [post-deploy-todo.md](../post-deploy-todo.md).

## File/Modul yang Terpengaruh

- **Deleted**: `pages/yacht/index.astro`, 6 plural listing `index.astro`, `ListingHeader.astro`, `lib/listingHeader.ts`
- **Edited**: `reservedSlugs.ts`, `public/_redirects`, `BaseLayout.astro`, `PageLayout.astro`, `[...slug].astro`, `index.astro`, 7 detail routes, Header/Footer fallback nav
- **New**: `lib/structuredData.ts`, `components/common/StructuredData.astro`, `components/common/Breadcrumbs.astro`
- **Seed (data-apply pending)**: `seed-villa-page.ts`, `seed-landing-pages.ts`, `seed-service-landing-content.ts`

## Related Reports

- [service-listing-visual-audit.md](../reports/service-listing-visual-audit.md) — audit + plan + **Execution Log 2026-08-23** (sumber utama fase ini)
- [hardcoded-pages-audit.md](../reports/hardcoded-pages-audit.md) — audit route yang memicu konsolidasi
