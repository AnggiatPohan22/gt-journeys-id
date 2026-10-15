# Service Listing — Visual Consistency & CMS Integration Audit

**Generated**: 2026-08-21
**Dikerjakan oleh**: Claude Code (Fase 1 read-only audit + Fase 2 planning)
**Scope**: Konsistensi visual & tingkat integrasi CMS untuk halaman service listing
vs halaman CMS-managed (Pages collection block system)

> ⚠️ **Read-only + planning.** Tidak ada kode diubah. Fase 2 = rencana saja,
> **belum dieksekusi**. Semua temuan dari inspeksi kode + verifikasi live di
> `localhost:4321` (dev server berjalan), bukan asumsi.

---

## TL;DR — Temuan Terpenting (baca ini dulu)

**Hybrid yang diminta di Fase 2 SUDAH ADA dan SUDAH JALAN.** Codebase punya block
`serviceListing` (CMS Pages) yang auto-fetch produk per `serviceType` + render
hero/filter/search/featured-card/grid, dan bisa dicampur dengan block lain
(Hero, FAQ, CTA, TrustBadges, Testimonials, Text). **Halaman service utama yang
di-link dari nav (singular: `/tour`, `/villa`, `/restaurant`, `/rental`,
`/venue`, `/water-activity`, `/yacht`) SUDAH CMS-managed penuh** via block ini.

Jadi framing task ("service listing pages hardcoded, tidak CMS") **tidak akurat
untuk halaman utama** — mereka sudah CMS. Yang benar-benar jadi masalah:

1. 🔴 **REGRESI `/yacht`** — file `apps/web/src/pages/yacht/index.astro` (dibuat
   di task sebelumnya) **men-shadow** CMS Page `yacht`. Jadi `/yacht` render grid
   sederhana hardcoded, bukan CMS landing (hero + filter + trustBadges) seperti
   `/restaurant`. **Ini persis gejala "tampil berbeda" yang dilaporkan.**
2. 🔴 **Reserved-slug guard bentrok** — `apps/cms/src/fields/reservedSlugs.ts`
   me-reserve slug `yacht`, padahal CMS Page landing pakai slug `yacht`. Efek:
   simpan-ulang Page `yacht` di admin akan **ditolak**. Bug dari task sebelumnya.
3. 🟠 **Inkonsistensi layout** — `/villa` pakai layout `editorial-featured`
   (ada kartu "EDITOR'S CHOICE", tanpa hero image), sementara `/tour`,
   `/restaurant`, dst pakai `hero-immersive` (hero image + tanpa featured card).
   Dua-duanya CMS, tapi beda tampilan.
4. 🟠 **Halaman plural "view all" masih hardcoded & redundant** — `/tours`,
   `/accommodations`, `/restaurants`, `/rentals`, `/weddings`,
   `/water-activities` = grid sederhana (`ListingHeader` + cards, hasil wiring
   task audit sebelumnya). Isinya **duplikat** dgn halaman singular CMS (yang
   sudah tampilkan full koleksi + filter). Di-link dari tombol "All X" di
   TrustBadges.
5. 🟡 **Gap teknis nyata** (belum ada sama sekali): **JSON-LD structured data**,
   **breadcrumbs**, **canonical URL** di head. Field `template` di Pages
   (termasuk opsi `service_listing`) **tidak pernah dibaca frontend** — dead metadata.

**Feasibility hybrid: bukan cuma feasible — sudah 80% terbangun.** Sisa kerjanya
lebih ke *reconciliation + polish*, bukan bangun arsitektur baru.

---

## FASE 1 — AUDIT VISUAL & STRUCTURAL

### 1. Arsitektur route service (peta lengkap)

Ada **dua keluarga route** untuk tiap service — by design, tapi membingungkan:

| Keluarga | Contoh URL | Sumber | Rendering | Di-link dari |
|----------|-----------|--------|-----------|--------------|
| **Singular (landing)** | `/tour`, `/villa`, `/restaurant`, `/rental`, `/venue`, `/water-activity`, `/yacht` | **CMS Pages** (via `[...slug].astro`) | `serviceListing` block + `trustBadges` (+ blok lain) | **Nav utama** |
| **Plural (view all)** | `/tours`, `/accommodations`, `/restaurants`, `/rentals`, `/weddings`, `/water-activities` | **Hardcoded** `index.astro` | `ListingHeader` + product grid sederhana | Tombol "All X" di TrustBadges |

CMS Pages yang di-seed (script `seed-landing-pages.ts` + `seed-service-landing-content.ts`
+ `seed-villa-page.ts`): slug `villa`, `tour`, `rental`, `water-activity`, `yacht`,
`restaurant`, `venue`, `explore-bali`.

### 2. Layout Comparison Table

| Aspek | CMS Pages (mis. `/restaurant`) | Service Listing plural (mis. `/accommodations`) | Gap |
|-------|-------------------------------|------------------------------------------------|-----|
| **Layout wrapper** | `PageLayout` → `BlockRenderer` | `PageLayout` → `<section>` manual | Wrapper sama (`PageLayout`), tapi body beda |
| **Hero/Header** | `serviceListing` hero-immersive: hero image + overlay + eyebrow/heading/desc | `ListingHeader`: eyebrow + H1 + intro, **tanpa image** | Plural jauh lebih polos |
| **Filter/Search** | Destination pill tabs + search bar (date/guest) | **Tidak ada** | Gap besar |
| **Featured card** | Editorial: "EDITOR'S CHOICE" card (opsional) | Tidak ada | — |
| **Product grid** | Cards `detailed` (multi-image, rating, amenity badges, Book Now) | Cards `compact` (image + title + price) | Kualitas kartu beda |
| **Content blocks lain** | Bisa: Hero, FAQ, CTA, TrustBadges, Testimonials, Text, Gallery, dst | **Tidak ada** (hanya grid) | Gap besar |
| **Footer CTA** | `trustBadges` block (concierge + badges + 2 button) | Tidak ada | Gap |
| **Spacing/padding** | Per-block `sectionPadding` (CMS-editable) | Fixed `section-padding` di markup | Plural tak bisa diatur |
| **SEO meta** | `page.seo.metaTitle/Description` (CMS) → fallback ServiceType | `resolveListingHeader` → ServiceType `metaTitle/Description` | Dua-duanya OK; sumber beda |
| **OG image / canonical** | ❌ tidak ada (BaseLayout hanya og:title/desc/type) | ❌ tidak ada | Gap di dua-duanya |
| **Breadcrumbs** | ❌ tidak ada | ❌ tidak ada | Gap di dua-duanya |
| **JSON-LD** | ❌ tidak ada | ❌ tidak ada | Gap di dua-duanya |

### 3. Per-Page Gap Analysis (state LIVE, terverifikasi di browser)

| URL | Yang render sekarang | CMS integration | Catatan |
|-----|----------------------|-----------------|---------|
| `/restaurant` | ✅ CMS Page — serviceListing **hero-immersive** + trustBadges | **Full** | Referensi "bagus" |
| `/tour` | ✅ CMS Page — hero-immersive + trustBadges | **Full** | — |
| `/rental` | ✅ CMS Page (hero-immersive) | **Full** | — |
| `/venue` | ✅ CMS Page (hero-immersive) | **Full** | — |
| `/water-activity` | ✅ CMS Page (hero-immersive) | **Full** | — |
| `/villa` | ✅ CMS Page — serviceListing **editorial-featured** + trustBadges | **Full** | 🟠 Beda layout dari yang lain |
| `/yacht` | 🔴 **Hardcoded `yacht/index.astro`** (grid polos) | **Broken** | Shadow CMS Page `yacht`. **REGRESI** |
| `/explore-bali` | ✅ CMS Page — Hero + valueProps + 4× serviceGrid + stats + CTA | **Full** | Showcase multi-service |
| `/tours` | 🟡 Hardcoded `ListingHeader` + grid | Header only (ServiceType) | "View all" — redundant dgn `/tour` |
| `/accommodations` | 🟡 Hardcoded | Header only | "View all" — redundant dgn `/villa` |
| `/restaurants` | 🟡 Hardcoded | Header only | redundant dgn `/restaurant` |
| `/rentals` | 🟡 Hardcoded | Header only | redundant dgn `/rental` |
| `/weddings` | 🟡 Hardcoded | Header only | redundant dgn `/venue` |
| `/water-activities` | 🟡 Hardcoded | Header only | redundant dgn `/water-activity` |

### 4. Screenshot Description (apa yang terlihat)

- **`/restaurant` (CMS, hero-immersive)**: hero banner ber-image dgn overlay,
  eyebrow "TASTE OF BALI", heading besar, deskripsi; deret pill destination
  (All Bali / Mainland / Nusa Penida / Lembongan) + search "Search Collection";
  grid kartu *detailed* dgn badge amenity (Ocean View, Free WiFi…), harga,
  tombol "Reserve"; pagination (1, 2); lalu section "Reserve with Ease" +
  4 trust badge. Terasa penuh & premium.
- **`/villa` (CMS, editorial-featured)**: eyebrow "THE COLLECTION", heading,
  deskripsi; pill filter + Search; **kartu besar "EDITOR'S CHOICE"** (featured);
  "Full Collection" grid; lalu "Bespoke Concierge Service" trust badges.
  Penuh juga, **tapi komposisi beda** (tanpa hero image, ada featured card).
- **`/yacht` (hardcoded, REGRESI)**: eyebrow "CHARTER IN BALI", heading
  "Private Yachts", teks intro; langsung "5 yachts available" + grid kartu
  *compact* (badge tipe, kapasitas, harga). **Tanpa** hero image, filter,
  search, trust badges. Terlihat kosong dibanding `/restaurant`.
- **`/accommodations` (hardcoded "view all")**: mirip `/yacht` — header + grid
  compact, tanpa filter/hero/trust.

### 5. CMS Pages Collection — mekanisme yang sudah ada

- **Block system**: 16 block terdaftar (`apps/cms/src/blocks/index.ts`):
  Hero, RichText, Image, Gallery, CTA, FAQ, Testimonials, ServiceGrid, Contact,
  Embed, Spacer, ValuePropsBanner, StatsBanner, TestimonialsCarousel,
  **ServiceListing**, TrustBadges. Dispatcher: `BlockRenderer.astro`.
- **`serviceListing` block** = inti hybrid. Field: `layout`
  (editorial-featured | hero-immersive, super-admin only), eyebrow/heading/
  description, `serviceType` (7 enum), `accommodationTypes` subset, limit,
  featuredMode, hero media, destination filter, search, cardVariant
  (compact|detailed), pagination. Frontend: `ServiceListingBlock.astro` →
  `ServiceListingEditorial.astro` / `ServiceListingHeroImmersive.astro`.
  Enrich metadata dari `getServiceTypeByKey()` (fallback).
- **Template field**: Pages punya `template` select (default/about/contact/
  landing/**service_listing**). 🔴 **Frontend TIDAK pernah membaca field ini** —
  `[...slug].astro` render `page.content` apa adanya. Jadi `service_listing`
  = opsi mati; **tidak ada** `linkedServiceType` field.
- **Merge mechanism**: tidak perlu "merge" khusus — editor tinggal susun blok
  di `page.content`: blok apa pun **sebelum** dan **sesudah** `serviceListing`
  otomatis jadi "before_products" / "after_products". (Requirement Fase-2
  soal posisi before/after **sudah ke-cover** by design array blocks.)

### 6. Dynamic Route Behavior & Collisions

- `[...slug].astro`: `getStaticPaths` dari `getPages({limit:500})` → filter
  yg punya slug → render `page.content` via `BlockRenderer`. SEO: `page.seo`
  → fallback `ServiceType` (by slug match). Jalan **setelah** route statis
  (Astro precedence), jadi file statis menang.
- **Exclusion**: tidak ada exclusion eksplisit; service singular ke-render CMS
  karena **tidak ada** file statis di slug itu — **kecuali `/yacht`** (ada
  `yacht/index.astro` → menang → shadow CMS). Ini satu-satunya collision aktif.
- **Reserved-slug guard** (`fields/reservedSlugs.ts`) reserve: `tours,
  accommodations, restaurants, rentals, weddings, water-activities, yacht,
  property, 404`. 🔴 **`yacht` salah masuk** — itu slug CMS landing yang sah.
  Slug plural lain aman (memang punya index.astro statis, bukan CMS Page).

### Architecture — Data Flow

```
CMS-managed service page (mis. /restaurant):
  Browser → /restaurant
    → tidak ada file statis di /restaurant
    → [...slug].astro getStaticPaths → getPageBySlug('restaurant')
    → PageLayout(seo) → BlockRenderer(page.content)
        ├─ serviceListing → fetch restaurants collection → hero+filter+grid
        └─ trustBadges → concierge section
    = kaya, CMS-editable ✅

Hardcoded "view all" page (mis. /accommodations):
  Browser → /accommodations
    → accommodations/index.astro (statis, MENANG)
    → PageLayout(resolveListingHeader→ServiceType) 
    → ListingHeader + getAccommodations() grid compact
    = polos, hanya header CMS-driven 🟡

REGRESI /yacht:
  Browser → /yacht
    → yacht/index.astro (statis, MENANG) ← SHADOW
    → grid compact polos
    → CMS Page 'yacht' (serviceListing+trustBadges) TAK PERNAH render 🔴
```

---

## FASE 2 — ARCHITECTURE PLAN (belum dieksekusi)

Karena hybrid sudah ada, plan ini **reconciliation + polish**, bukan rebuild.

### Bagian A — Reconcile regresi & collision (WAJIB, cepat, low-risk)

**A1. Kembalikan `/yacht` ke CMS landing**
- **Hapus** `apps/web/src/pages/yacht/index.astro` → `[...slug].astro` akan
  render CMS Page `yacht` (serviceListing hero-immersive + trustBadges), konsisten
  dgn `/restaurant`.
- ⚠️ **Konsekuensi**: `/yacht` tidak lagi jadi "view all" grid. Semua service
  lain punya split (`/tour` landing vs `/tours` view-all), tapi yacht tak punya
  bentuk plural. **Keputusan owner (D1)**: (a) cukup `/yacht` CMS saja tanpa
  "view all" terpisah, atau (b) buat route "view all" baru khusus yacht
  (mis. `/yachts` atau `/yacht/all`) + update tombol "All Yachts".
- **Verifikasi**: buka `/yacht` → harus tampil hero + filter + trustBadges.

**A2. Perbaiki reserved-slug guard**
- Buang `'yacht'` dari `RESERVED_PAGE_SLUGS` di
  `apps/cms/src/fields/reservedSlugs.ts` (setelah A1 — supaya CMS Page `yacht`
  bisa disimpan lagi). Kalau owner pilih D1(b) `/yachts`, tambahkan `'yachts'`
  ke reserved (karena jadi route statis baru).
- Reserved lain (`tours, accommodations, …`) tetap benar.

> A1+A2 langsung menutup gejala utama "tampil berbeda". **Effort: ~10 menit.**

### Bagian B — Standardisasi layout (RECOMMENDED, low-risk, content-level)

**B1. Samakan layout serviceListing antar service.**
- Pilihan owner (D2): semua **hero-immersive** (paling konsisten dgn 6 dari 7
  halaman sekarang) — ubah Page `villa` set `layout: 'hero-immersive'` +
  tambah hero image. ATAU standar lain yg dipilih owner.
- Ini **data change** (edit Page di admin / re-run seed), **bukan code**.
- Alternatif: biarkan beda **secara sengaja** (villa editorial sebagai signature)
  → cukup dokumentasikan sebagai keputusan, bukan bug.

### Bagian C — Keputusan nasib halaman plural "view all" (butuh owner)

Halaman singular CMS sudah menampilkan **full koleksi + filter + search**
(limit 24). Jadi plural `/tours` dll **sebagian besar redundant**.

Opsi (D3):
- **C-opsi 1 — Hapus plural, redirect ke singular** (paling bersih): hapus 6
  `index.astro`, tambah 301 `/tours → /tour` dst di `public/_redirects`, ganti
  semua `secondaryButtonLink` di CMS Pages ("All Tours" → `/tour`). Konsisten:
  satu halaman kaya per service. **Tapi** hilangkan opsi "grid cepat tanpa hero".
- **C-opsi 2 — Pertahankan plural sebagai "view all" ringan**: biarkan, tapi
  naikkan konsistensi visual (lihat B). Berguna kalau owner mau versi cepat/
  ringan (SEO/perf) tanpa hero besar.
- **C-opsi 3 — Upgrade plural jadi CMS juga**: kurang disarankan (nambah
  permukaan maintenance untuk konten yang sama).

**Rekomendasi**: **C-opsi 1** kalau tujuan utama konsistensi & satu source of
truth per service. **C-opsi 2** kalau "view all" ringan memang dipakai.

### Bagian D — Enhancement teknis (gap nyata; independen, bisa dicicil)

**D-tech1. JSON-LD structured data** (belum ada sama sekali)
- Tambah component `StructuredData.astro` (script `application/ld+json`).
- `ItemList` untuk listing (produk di grid), `BreadcrumbList`, dan
  `TouristAttraction`/`LodgingBusiness`/`Restaurant`/`Product` per service type.
- Pasang di `serviceListing` block (punya data produk) + detail pages.

**D-tech2. Breadcrumbs** (belum ada)
- Component `Breadcrumbs.astro` konsisten (Home › Service › Item).
- Pasang di `PageLayout` (opsional prop) atau per block.

**D-tech3. SEO head lengkap** di `BaseLayout.astro`
- Tambah `<link rel="canonical">`, `og:image` default (dari ServiceType
  coverImage / site default), `og:url`, twitter card.

**D-tech4. (Opsional) Wire template `service_listing` + `linkedServiceType`**
- Kalau owner mau UX admin lebih terpandu: tambah field `linkedServiceType`
  (relationship/select) di Pages saat `template === 'service_listing'`, dan
  auto-inject `serviceListing` block default. **Tapi** ini *nice-to-have* —
  editor sudah bisa tambah block `serviceListing` manual. Prioritas rendah.

### Visual Consistency Checklist (target akhir)

- [ ] Semua service page pakai `PageLayout` (✅ sudah)
- [ ] Layout `serviceListing` seragam (B1) — hero-immersive (atau standar owner)
- [ ] `/yacht` = CMS landing, bukan grid hardcoded (A1)
- [ ] Card variant seragam (`detailed` di landing)
- [ ] TrustBadges/footer CTA muncul di semua landing (✅ sudah, kecuali yacht setelah A1)
- [ ] Breadcrumb component konsisten (D-tech2)
- [ ] Spacing via `sectionPadding` CMS (✅ untuk CMS pages)
- [ ] Mobile responsive konsisten (blok sudah responsive; QA setelah perubahan)
- [ ] JSON-LD di semua listing + detail (D-tech1)

### Constraint Teknis (dicatat dari inspeksi)

- **Payload enum 63-char limit** (Postgres identifier): sudah jadi alasan
  beberapa field `serviceListing` di-trim (lihat komentar di `blocks/index.ts`
  soal `imageSlider` / `slides` table). Hati-hati kalau menambah field array
  bernama panjang ke block yg di-embed di collection nama panjang.
- **Astro static output**: `[...slug]` butuh semua slug diketahui saat build
  (`getPages`). CMS Page baru → perlu rebuild. `_redirects` hanya jalan di
  Cloudflare Pages (bukan `astro dev`).
- **Route precedence**: file statis SELALU menang atas `[...slug]`. Jadi jangan
  bikin file statis di slug yang mau di-CMS-kan (pelajaran dari `/yacht`).
- **`layout` field super-admin only** — editor biasa tak bisa ganti layout
  serviceListing (by design). Standardisasi (B1) mungkin perlu akses super-admin.

---

## Decision Points untuk Owner

| ID | Keputusan | Opsi | Rekomendasi |
|----|-----------|------|-------------|
| **D1** | Nasib "view all" yacht setelah `/yacht` balik ke CMS | (a) tanpa view-all khusus, (b) buat `/yachts` baru | (a) — sederhana; yacht landing sudah tampilkan semua |
| **D2** | Layout standar serviceListing | hero-immersive semua / editorial semua / biarkan beda sengaja | **hero-immersive semua** (6/7 sudah) |
| **D3** | Nasib halaman plural "view all" | hapus+redirect / pertahankan ringan / upgrade CMS | **hapus+redirect** (konsistensi) atau pertahankan kalau butuh versi ringan |
| **D4** | JSON-LD + breadcrumbs sekarang atau nanti | sekarang / backlog | Sekarang (SEO value tinggi, independen) |
| **D5** | Wire template `service_listing`+linkedServiceType | ya / skip | Skip dulu (nice-to-have) |

---

## File Change Estimation

### Bagian A (WAJIB — reconcile) — ~15 menit, sangat rendah risiko
| File | Aksi | Effort |
|------|------|--------|
| `apps/web/src/pages/yacht/index.astro` | **Hapus** | trivial |
| `apps/cms/src/fields/reservedSlugs.ts` | Buang `'yacht'` (atau ganti `'yachts'` kalau D1(b)) | ~2 baris |
| `apps/web/public/_redirects` | (kalau D1(b)) tambah rule | ~1 baris |
| CMS Page `yacht` (data) | (kalau perlu) re-save/re-seed | data |

### Bagian B (layout) — ~30 menit, content-level
| File/Target | Aksi | Effort |
|------|------|--------|
| CMS Page `villa` (data) | set `layout: hero-immersive` + hero image, ATAU dokumentasikan beda sengaja | data |
| `seed-villa-page.ts` (opsional) | update supaya idempotent match | ~5 baris |

### Bagian C (plural pages) — tergantung D3
| File | Aksi (C-opsi 1) | Effort |
|------|------|--------|
| 6× `pages/{tours,accommodations,restaurants,rentals,weddings,water-activities}/index.astro` | Hapus | trivial |
| `apps/web/public/_redirects` | 6 rule 301 plural→singular | ~6 baris |
| CMS Pages (data) | ganti `secondaryButtonLink` "All X" → singular | data |
| `resolveListingHeader` + `ListingHeader.astro` + `lib/listingHeader.ts` | Hapus kalau tak terpakai lagi | cleanup |
| (C-opsi 2) | Tidak hapus; standarisasi visual saja | — |

### Bagian D (enhancement) — ~2-4 jam, independen
| File | Aksi | Effort |
|------|------|--------|
| `apps/web/src/components/common/StructuredData.astro` | **Baru** — JSON-LD (ItemList/BreadcrumbList/service schema) | Medium |
| `ServiceListingEditorial.astro` + `HeroImmersive.astro` | Inject ItemList dari produk | Medium |
| `apps/web/src/components/common/Breadcrumbs.astro` | **Baru** | Kecil |
| `PageLayout.astro` | Optional breadcrumb slot | Kecil |
| `BaseLayout.astro` | canonical + og:image default + twitter | Kecil |
| (D5) `apps/cms/src/collections/Pages.ts` + hook | `linkedServiceType` conditional field | Medium |

---

## Recommended Execution Order (session berikutnya)

1. **A1 + A2** (reconcile `/yacht` + reserved guard) — tutup regresi utama. ~15 mnt.
2. **B1** (standardisasi layout villa → hero-immersive, atau putuskan sengaja). ~30 mnt.
3. **D3 decision → Bagian C** (hapus+redirect plural, atau pertahankan). 30–60 mnt.
4. **D-tech (JSON-LD + breadcrumbs + canonical)** — SEO polish, independen. 2–4 jam.
5. **D5** (template wiring) — hanya kalau owner mau UX admin lebih terpandu. Backlog.

**Blocker utama**: tidak ada blocker teknis. Semua perubahan additive/cleanup.
Satu-satunya yang butuh keputusan manusia = D1–D5 (bukan teknis, tapi produk/SEO).

---

## Lampiran — Ringkasan angka

| Metrik | Nilai |
|--------|-------|
| Service route families | 2 (singular CMS + plural hardcoded) |
| Halaman service CMS-managed penuh | 6 (`/tour,/villa,/restaurant,/rental,/venue,/water-activity`) + explore-bali |
| Halaman service ke-shadow (regresi) | 1 (`/yacht`) |
| Halaman plural hardcoded "view all" | 6 |
| serviceListing layouts dipakai | 2 (hero-immersive ×5, editorial-featured ×1) |
| Block tersedia di CMS | 16 |
| Gap teknis nyata | 3 (JSON-LD, breadcrumbs, canonical/og-image) |
| Dead metadata | 1 (`template` field tak dibaca frontend) |
| Reserved-slug bug | 1 (`yacht` salah reserve) |

---

## Execution Log — 2026-08-23

Dieksekusi di branch `feature/service-listing-fixes` (approved execution order).
Keputusan owner: **/yacht → CMS page** (delete static, unreserve) + **plural
listing → delete + redirect** (singular canonical).

### Step 1: A1 + A2 — ✅ DONE (committed `f074174`)
- Files: deleted `apps/web/src/pages/yacht/index.astro`; edited
  `apps/cms/src/fields/reservedSlugs.ts` (remove `yacht`).
- Verified browser: `/yacht` kini render CMS landing page (hero-immersive
  serviceListing + trustBadges), konsisten dgn `/restaurant`. No console errors.

### Step 2: B1 — ✅ CODE DONE (committed `81649bc`) · ⏳ DATA-APPLY PENDING
- Files: `seed-villa-page.ts` + `seed-landing-pages.ts` → villa serviceListing
  `layout: hero-immersive` + hero image + detailed cards.
- **Belum ter-apply ke DB**: butuh jalankan seed dgn CMS dev **stop** (SQLite
  lock; tidak ada API creds). Sampai seed dijalankan, `/villa` masih
  editorial-featured di DB.
  Run: `cd apps/cms && pnpm tsx src/scripts/seed-villa-page.ts` (matikan CMS dulu).

### Step 3: C-Opsi 1 — ✅ DONE (committed `7eb3507`)
- Deleted 6 plural listing `index.astro` + orphaned `ListingHeader.astro` +
  `lib/listingHeader.ts`.
- `public/_redirects`: tambah exact-path 301 (plural listing → singular);
  wildcard detail redirects sudah ada dari task sebelumnya.
- Internal links → singular: Header/Footer fallback nav, homepage hero CTA;
  stale card JSDoc + FilterBookingBar example.
- Seeds: `secondaryButtonLink` "All X" → singular (⏳ data-apply pending, sama
  seperti B1 — via seed run).
- Verified: `/tours` → 404 di dev (prod 301 → `/tour`); singular detail + CMS
  listing render OK; no console errors. (Note: plural *detail* routes sudah
  dihapus+redirect di task hardcoded-audit sebelumnya.)

### Step 4: D-tech — ✅ DONE (committed `92a4a37`)
- Baru: `lib/structuredData.ts`, `components/common/StructuredData.astro`,
  `components/common/Breadcrumbs.astro`.
- `BaseLayout.astro`: canonical, og:url/site_name/locale/type, Twitter card,
  robots (+ `noindex` prop; 404 noindex). `PageLayout.astro` forward props.
- `[...slug].astro`: WebPage + BreadcrumbList; ItemList (produk) untuk page
  ber-serviceListing block.
- 7 detail pages: per-type JSON-LD (TouristTrip / LodgingBusiness / Restaurant /
  EventVenue / SportsActivityLocation / Product) + Offer + breadcrumbs visual.
- `index.astro`: WebSite + Organization.
- Verified browser (valid JSON, correct canonical/OG):
  `/villa/luxury-hotel-kuta` → BreadcrumbList + LodgingBusiness, breadcrumb
  "Home / Villas & Hotels / Luxury Hotel Kuta"; `/restaurant` → WebPage +
  BreadcrumbList + ItemList(4, singular URLs); `/about` → WebPage +
  BreadcrumbList; `/` → WebSite + Organization. No console errors dari perubahan
  ini (404 media di homepage = missing seed images, pre-existing, bukan dari SEO).

### Pending / Handoff (data-apply — butuh CMS di-stop)
Dua perubahan **data CMS** sudah disiapkan di seed (committed) tapi belum
di-apply ke DB karena CMS dev sedang jalan (SQLite exclusive lock) & tidak ada
API creds:
1. **B1** — villa layout → hero-immersive.
2. **C-opsi 1 button links** — `secondaryButtonLink` "All X" → singular.

**Cara apply** (owner / saat CMS bisa di-stop):
```
# stop CMS dev dulu, lalu:
cd apps/cms
pnpm tsx src/scripts/seed-landing-pages.ts        # villa layout + semua button links
pnpm tsx src/scripts/seed-service-landing-content.ts   # button links tour/yacht/dst
# restart CMS dev
```
Catatan: sampai di-apply, `/villa` masih editorial-featured & tombol "All X"
masih plural (tetap berfungsi — 301 ke singular via _redirects di prod).

### Backlog (tidak dikerjakan)
- **D5** — template `service_listing` + `linkedServiceType` wiring (owner minta eksplisit).
- Homepage media 404 di dev (missing seed images) — di luar scope SEO task ini.
