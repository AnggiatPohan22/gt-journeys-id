# PROGRESS.md — Project Status & Phase Tracker

Dokumen ini melacak progress development DnJourneysBali dari awal sampai
launch. Update file ini setiap kali menyelesaikan task, agar siapapun
(termasuk AI agent baru) bisa langsung tahu posisi project saat ini.

**Cara update:** Pindahkan checkbox dari `[ ]` ke `[x]` saat selesai,
tambah tanggal, dan tulis catatan singkat kalau ada keputusan penting.

**Report per fase:** Setiap fase besar yang selesai wajib punya file
laporan di [`docs/reports/`](./reports/README.md). Lihat aturan &
template di [`AGENTS.md`](../AGENTS.md) Section 14.

---

## Status Ringkas

```
Current Phase:  CMS Enhancement Sprint COMPLETE (Phase 3.14–3.19)
                Sprint 0–4 semua ✅ · frontend build verified (76 pages)
                Next: Phase 4 Polish & Launch
Overall:        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ~97%
Last Updated:   2026-08-20
```

### CMS Enhancement Sprint — Ringkasan (Phase 3.14–3.19)

Report lengkap: [`docs/reports/sprint-cms-enhancement.md`](./reports/sprint-cms-enhancement.md)

```
Sprint 0  Technical Prerequisites ..... ✅  (schema sync + build 76 pages OK)
Sprint 1  Sidebar Reorganization ....... ✅  → Phase 3.14.1–3.14.3
Sprint 2  Seed Content & Testing ....... ✅  → Phase 3.14.4–3.14.5
Sprint 3  Service Management ........... ✅  → Phase 3.15–3.16 (ServiceTypes collection)
Sprint 4  Quick Wins .................. ✅  → Phase 3.16–3.19 (WA per-service, Testimonials collection, Dashboard)

Verifikasi akhir: pnpm --filter @dn-journeys/web build → 76 pages, Complete! (no error)
Pending manual (perlu login CMS): CRUD UI per role, visual dashboard, set WA number per service
```

---

## Phase 0 — Planning & Architecture ✅ DONE

- [x] Tentukan stack: Astro + Payload CMS + Cloudflare — 2026-08-04
- [x] Rancang content schema untuk 7 service modules — 2026-08-04
- [x] Tentukan hosting strategy: Full Cloudflare (Pages + Workers) — 2026-08-04
- [x] Rancang design direction: "Tropical Sophistication" — 2026-08-04
- [x] Buat dokumentasi: AGENTS.md, SETUP.md, WORKFLOW.md — 2026-08-04

**Catatan:** Budget hosting target $5/bulan (Workers paid plan).
Frontend gratis selamanya di Cloudflare Pages.

---

## Phase 1 — Foundation ✅ DONE

### 1.1 Monorepo Setup
- [x] Struktur folder: apps/web, apps/cms, packages/shared — 2026-08-04
- [x] pnpm workspace config — 2026-08-04
- [x] Root package.json dengan scripts — 2026-08-04

### 1.2 CMS Backend Scaffold
- [x] Payload CMS collections ditulis (13 collections) — 2026-08-04
- [x] Reusable fields (seo, pricing, status, location, whatsapp) — 2026-08-04
- [x] Access control / RBAC functions — 2026-08-04
- [x] Block definitions untuk page builder (11 blocks) — 2026-08-04
- [x] Next.js app router scaffold via Claude Code — 2026-08-04
- [x] CMS berhasil running lokal (localhost:3030) — 2026-08-04
- [x] Sharp image resize diaktifkan (import + property `sharp` di payload.config.ts) — 2026-08-04
- [x] Super-admin user pertama dibuat — 2026-08-04
- [x] Semua 13 collections diverifikasi muncul di admin panel — 2026-08-04
- [x] Test create/edit/delete di setiap collection — 2026-08-04

### 1.3 Frontend Scaffold
- [x] Astro project setup — 2026-08-04
- [x] Tailwind config dengan design system colors — 2026-08-04
- [x] Fix Tailwind v4 → v3.4 compatibility — 2026-08-04
- [x] Frontend berhasil running lokal (localhost:4321) — 2026-08-04
- [x] Font files self-hosted: Fraunces variable (67KB) + Plus Jakarta Sans variable (27KB) — 2026-08-04
- [x] BaseLayout final (head, meta, font preload) — 2026-08-04
- [x] Header + Footer components (di `components/navigation/`) — 2026-08-04
- [x] Payload API client tersambung ke CMS lokal — 2026-08-04
- [x] Path alias `@config/*` + `@styles/*` ditambahkan ke tsconfig — 2026-08-04

### 1.4 Connect Frontend ↔ Backend
- [x] apps/web/.env pointing ke CMS URL yang benar (http://localhost:3030) — 2026-08-04
- [x] Test fetch dari frontend ke CMS API berhasil — 2026-08-04
- [x] CORS/API access dikonfirmasi tidak ada blocking (same-origin dev, publik-read) — 2026-08-04
- [x] Bukti E2E: homepage `/` menampilkan live counts dari `/api/tours` & `/api/destinations` — 2026-08-04

**Blocker saat ini:** —

**Next action:** Frontend tour listing page & detail page (Phase 2.2).

---

## Phase 2 — Service Modules ✅ DONE

Ikuti urutan workflow di WORKFLOW.md Section 2 untuk setiap module.

### 2.1 Destinations & Categories (Foundation Data)
- [x] Seed script idempotent: `apps/cms/src/scripts/seed.ts` (jalankan via `pnpm seed`) — 2026-08-04
- [x] Isi Destinations: Lembongan, Nusa Penida, Mainland Bali (via seed, status=published) — 2026-08-04
- [x] Isi Categories untuk Tours: Island Hopping, Snorkeling Tour, Cultural Tour (via seed, status=published) — 2026-08-04
- [x] Verifikasi via API: 6 Destinations total (3 seed + 3 existing draft), 6 Categories total — 2026-08-04

**Catatan data existing (dari user):** Ceningan, Kuta, "Kelinging Beach" (destinations)
dan Tour/Accomodation/Water Activities (categories) semua masih status=draft.
Publish/hapus/rename lewat admin kalau perlu.

### 2.2 Tours & Activities ✅ DONE
- [x] Test collection di CMS dengan data dummy (1 tour: "Individual Bali Day Trip …") — 2026-08-04
- [x] Sample tour dipublikasi (id=1, `status=published`) — 2026-08-04
- [x] TourCard component (`apps/web/src/components/cards/TourCard.astro`) — 2026-08-04
- [x] Tour listing page (`/tours`) — 2026-08-04
- [x] Tour detail page (`/tours/[slug]` pakai `getStaticPaths()`) — 2026-08-04
- [x] WhatsApp booking integration (pakai `generateWhatsAppLink` + `tourBookingMessage`, override via `tour.whatsappMessage` field) — 2026-08-04
- [x] Lexical richtext plain-text extractor (`apps/web/src/lib/lexical.ts`) — 2026-08-04
- [x] `fetchCollection<T>()` refactor: proper generics + optional `status` param — 2026-08-04
- [x] Cleanup: hapus 2 folder artifact (`{tours,accommodations,...}` literal name di pages/ & components/) — 2026-08-04

### 2.3 Villa & Hotel (Accommodations) ✅ DONE
- [x] Sample "CIty Hotel Giattech" (hotel, 3-star, 2 room types) dipublikasi (id=1) — 2026-08-04
- [x] `AccommodationCard.astro` — type badge (Villa/Hotel/Resort/Guesthouse), star rating, cheapest-room price — 2026-08-04
- [x] Listing page `/accommodations` (`getAccommodations()`) — 2026-08-04
- [x] Detail page `/accommodations/[slug]` (`getStaticPaths()`) dengan room types, amenities, policies, check-in/out — 2026-08-04
- [x] WhatsApp booking pakai `accommodationMessage()` (override via `whatsappMessage` field) — 2026-08-04

### 2.4 Water Activities ✅ DONE
- [x] Sample "Snorkeling at Nusa Penida" (snorkeling type) dipublikasi (id=1) — 2026-08-04
- [x] `WaterActivityCard.astro` — activity type badge, difficulty level, duration, price — 2026-08-04
- [x] Listing `/water-activities` + detail `/water-activities/[slug]` (`getStaticPaths()`) — 2026-08-04
- [x] Detail sections: About, What to Bring, Requirements, Safety Info (lexical) — 2026-08-04
- [x] WhatsApp booking pakai `waterActivityMessage()` — 2026-08-04

### 2.5 Private Yacht ✅ DONE
- [x] Sample "Rent Yacth Premium" (sailing type) dipublikasi (id=1) — 2026-08-04
- [x] `YachtCard.astro` — yacht type badge, capacity, cheapest package price — 2026-08-04
- [x] Listing `/yacht` + detail `/yacht/[slug]` (`getStaticPaths()`) — 2026-08-04
- [x] Detail sections: About, Specifications (length/engine/crew/year), Amenities, Charter Packages (per-package includes + price) — 2026-08-04
- [x] WhatsApp booking pakai `yachtMessage()` — 2026-08-04

### 2.6 Restaurant Reservation ✅ DONE
- [x] Sample "Restaurant test 1" (mid_range) dipublikasi (id=1) — 2026-08-04
- [x] `RestaurantCard.astro` — price range badge ($/$$/$$$), cuisine types, destination — 2026-08-04
- [x] Listing `/restaurants` + detail `/restaurants/[slug]` (`getStaticPaths()`) — 2026-08-04
- [x] Detail sections: About, Menu Highlights (nama + harga + deskripsi), Features, Opening Hours (sorted mon–sun, Closed handling) — 2026-08-04
- [x] WhatsApp reservation pakai `restaurantMessage()` — 2026-08-04

### 2.7 Wedding & Event Services ✅ DONE
- [x] Sample "Wedding Garden Venue" (garden type) dipublikasi (id=1) — 2026-08-04
- [x] `VenueCard.astro` — venue type badge, capacity range, cheapest package price — 2026-08-04
- [x] Listing `/weddings` + detail `/weddings/[slug]` (`getStaticPaths()`) — 2026-08-04
- [x] Detail sections: About, Packages (with lexical description + includes + startingPrice), Testimonials (couple + date + quote) — 2026-08-04
- [x] WhatsApp enquiry pakai `venueMessage()` (auto-include eventType[0]) — 2026-08-04

### 2.8 Rental Service ✅ DONE
- [x] Sample "Rental Motor Ceningan" (motorbike type) dipublikasi (id=1) — 2026-08-04
- [x] `RentalCard.astro` — rental type badge, cheapest tier price dengan duration label — 2026-08-04
- [x] Listing `/rentals` + detail `/rentals/[slug]` (`getStaticPaths()`) — 2026-08-04
- [x] Detail sections: About, Specifications (brand/model/year/details), Included, Requirements, sidebar Pricing Tiers (hourly/half_day/full_day/weekly/monthly) — 2026-08-04
- [x] WhatsApp booking pakai `rentalMessage()` — 2026-08-04

**Next action:** Phase 3 — CMS features & dynamic content. Prioritas:
1. `BlockRenderer.astro` + 11 block components (hero, richText, image, gallery, cta, faq, testimonials, serviceGrid, contact, embed, spacer)
2. Dynamic pages `apps/web/src/pages/[...slug].astro` yang render Page collection dari CMS
3. `MenuRenderer` untuk Header navigation dari CMS (`getMenuBySlug('main-navigation')`)
4. Footer + Header pakai `SiteSettings` global (bukan siteConfig fallback)
5. Homepage `/` full build dari CMS blocks — ganti section E2E test

---

## Phase 3 — CMS Features & Dynamic Content ✅ DONE

- [x] BlockRenderer.astro + 11 block components (Hero, RichText, Image, Gallery, CTA, FAQ, Testimonials, ServiceGrid, Contact, Embed, Spacer) — 2026-08-04
- [x] Dynamic pages `[...slug].astro` (catch-all, `getStaticPaths()` fetch semua published Pages) — 2026-08-04
- [x] Header navigation dari CMS (`getMenuBySlug('main-navigation')` dengan support nested `children` dropdown) — 2026-08-04
- [x] Footer dari CMS SiteSettings (siteName, tagline, contact, social, copyright) — 2026-08-04
- [x] Global settings terpasang di semua halaman via `getSiteSettings()` di Header+Footer (dipakai PageLayout) — 2026-08-04
- [x] Homepage full build (hybrid: CMS Page slug='home' → fallback ke Hero + 3× ServiceGrid + CTA) — 2026-08-04
- [x] **Bonus fix (retroactive):** `fetchBySlug()` bug lama — key `where[slug[equals]]` (bracket bersarang salah) → `where[slug][equals]` (nested where object). Sebelumnya detail pages diam-diam return doc pertama yang published (bukan yg match slug); tersamar karena tiap collection cuma 1 published — 2026-08-04
- [x] `lexicalToHtml()` helper — render richText dengan formatting (paragraph, heading, list, link, bold/italic/underline/strike/code, blockquote) — 2026-08-04

### Manual Test Log — Phase 3

Audit trail semua manual test yang PASS untuk Phase 3.

```
Step 1 — BlockRenderer + 11 placeholder blocks
  [x] BlockRenderer.astro ter-create tanpa TypeScript error
  [x] Import 11 block components tidak error (placeholder minimal)

Step 2 — 11 Block Components (real markup)
  [x] Halaman test "About" (slug=about) dibuat di CMS dengan 3 block:
      Hero + RichText + ServiceGrid — data ter-isi lengkap
  [x] API /api/pages?where[slug][equals]=about return content sesuai
      ekspektasi (array of blocks dengan blockType yg benar)

Step 3 — Dynamic [...slug].astro
  [x] pnpm dev jalan di apps/web (localhost:4321)
  [x] /about → HTTP 200, render Hero + RichText + ServiceGrid berurutan
  [x] Data setiap block render benar (heading "About Us", lexical
      "What is Lorem Ipsum?", ServiceGrid reuse TourCard)
  [x] Slug tidak ada → HTTP 404 clean (bukan crash)
  [x] Draft page (/home) → HTTP 404 (getStaticPaths filter published)
  [x] Static route /tours tetap menang atas catch-all

Step 4 — Header/Footer CMS-driven
  [x] Header: siteName "DnJourneysBali - by Giattech" (dari CMS,
      bukan hardcoded "DnJourneysBali")
  [x] Header nav items: Home / About Us / Tours / Contact (dari
      menu 'main-navigation' CMS, bukan hardcoded)
  [x] Header "Book Now" pakai wa.me/6282386357012 (dari CMS)
  [x] Footer contact: example@giattech.com, 082386357012,
      "Nusa Ceningan - Bali" (semua dari CMS)
  [x] Footer social: Instagram/Facebook/TikTok icons render dengan URL
      auto-normalisasi dari bare handles CMS
  [x] Footer copyright "Created by Giattech" (dari CMS)
  [x] User konfirmasi manual: ganti siteName di CMS → refresh browser
      → Header+Footer ikut berubah (bukti CMS-driven, bukan hardcoded)

Step 5 — Homepage Full Build
  [x] / (homepage) → HTTP 200
  [x] Title "DnJourneysBali - by Giattech" (dari CMS siteName)
  [x] E2E test section dari Phase 1 SUDAH DIHAPUS (grep "Sync Test",
      "CMS Connected", "Sample Tour Fetched" → 0 match)
  [x] Sections tampil berurutan: Hero "test site setting" → Featured
      Tours (dgn TourCard "Individual Bali Day Trip") → Where to Stay
      (AccommodationCard "CIty Hotel Giattech") → On the Water
      (WaterActivityCard "Snorkeling at Nusa Penida") → CTA "Plan Your
      Bali Trip with Us" → Chat on WhatsApp button
  [x] Semua data dari CMS (siteName, tagline, tours, accommodations,
      water-activities, whatsapp number)
  [x] Regression check: /about tetap render RichText "What is Lorem
      Ipsum?" (bukan tercampur homepage fallback)
  [x] Regression check: /tours/individual-bali-day-trip-… title =
      "Individual Bali Day Trip …" (bukan cross-slug leak)
  [x] Regression check: /accommodations/city-hotel-giattech title =
      "CIty Hotel Giattech" (bukan cross-slug leak)
```

**Manual test yang PERLU KAMU LAKUKAN SENDIRI (browser-only):**
```
[ ] Buka http://localhost:4321/ di browser, cek visual layout Hero
    section (background overlay, typography, CTA button) — bukan cuma
    struktur DOM
[ ] Resize browser ke mobile (~375px width) → grid ServiceGrid collapse
    ke 1 kolom, Header muncul tombol hamburger (belum ada JS toggle
    interaction, itu polish Phase 4), Footer stack vertikal
[ ] Klik "Book Now" di Header → open WhatsApp dengan nomor
    6282386357012 (verifikasi kalau device punya WhatsApp)
[ ] Klik "Chat on WhatsApp" di CTA homepage → sama
[ ] Buat/publish Page baru di CMS dgn slug bebas (misal "policy") →
    langsung akses /policy → render pakai BlockRenderer (setelah
    touch [...slug].astro atau restart Astro)
```

---

## Phase 3.5 — Reference Layout Implementation ✅ DONE

Menerapkan reference desain (`ai/reference/home/`) ke komponen fixed/reusable
sebelum masuk Phase 4, agar animasi & polish tidak perlu rework kalau
layout berubah.

**Catatan scope:** User menyebutkan akan ada halaman baru "Property & Land
for Sale" di luar 7 service modules awal (Tours, Accommodations, Water
Activities, Yacht, Restaurants, Weddings, Rentals). Collection CMS-nya
belum dibuat (future scope). Sementara ini `/property` = coming-soon page
minimal supaya nav "Property" tidak 404.

Urutan halaman yang direncanakan ke depan (referensi, belum tentu
urutan pengerjaan): Home, About, Tour, Villa, Water Activities,
Private Yacht, Restaurant, Wedding & Event Services, Property & Land
for Sale, Contact.

### 3.5.1 Fixed/Reusable Components ✅ DONE
- [x] Header — reference diterapkan, mapped tokens (ocean/coral), CTA pill "WhatsApp Booking", mobile drawer + JS toggle (ESC/outside-click/link close, matchMedia auto-close) — 2026-08-05
- [x] Footer — reference diterapkan, bg ocean, 4-col grid, contact icons via Icon component, social wrapped bulat, "Designed with ♥ in Bali" tagline — 2026-08-05
- [x] `apps/web/src/components/common/Icon.astro` — helper icon lookup (33+ icon SVG map, no CDN, replaces Material Symbols) — 2026-08-05
- [x] Filter & Booking Floating — `apps/web/src/components/common/FilterBookingBar.astro` reusable, sticky-top, destination tabs (radio+peer, no JS), booking search inputs (native form GET), preview di `/demo-filter` — 2026-08-05
- [x] CTA Floating (WhatsApp) — `apps/web/src/components/common/WhatsAppFloating.astro` popup pattern (Intercom-style): bulat toggle → open panel dengan chat options → klik option buka WA. Data cascade CMS-first. Icon brand WA asli (bukan generic chat) — 2026-08-05

### 3.5.2 Home Page ✅ DONE
- [x] Layout Home diterapkan sesuai reference (8 sections: Hero + ValuePropsBanner overlap + 3× ServiceGrid + StatsBanner + TestimonialsCarousel + CTA) — 2026-08-05
- [x] 3 CMS block baru ditambah di `apps/cms/src/blocks/index.ts`:
      `ValuePropsBanner`, `StatsBanner`, `TestimonialsCarousel` — 2026-08-05
- [x] Types regen via `pnpm generate:types` — 2026-08-05
- [x] 3 frontend block components di `apps/web/src/components/blocks/` — 2026-08-05
- [x] BlockRenderer register 3 block baru — 2026-08-05
- [x] `apps/web/src/pages/index.astro` restructure fallback: preserve hybrid CMS Page 'home' + fallback komposisi block sesuai reference — 2026-08-05

### 3.5.3 Coming Soon Page
- [x] `apps/web/src/pages/property.astro` — coming-soon minimal, WA Enquire button pakai CMS whatsapp number — 2026-08-05

### Manual Test Log — Phase 3.5

Audit trail semua manual test yang PASS.

```
Step 2 — Header
  [x] Header render CMS data (siteName, nav, WA number)
  [x] Active state indicator (border-b-2 border-coral)
  [x] Fallback ke siteConfig kalau CMS unreachable
  [x] Mobile drawer + JS toggle: click → open, click link/ESC/outside → close,
      resize ≥1024px → auto-close
  [x] Konsisten di 2 halaman berbeda (/ dan /tours)
  [x] Icon via Icon component (menu, chat, close) — no CDN

Step 3 — Footer
  [x] Bg ocean (mapped dari reference primary-container teal)
  [x] 4-col grid: Brand+social / Quick Links / Our Services / Contact
  [x] Contact icons via Icon component (phone, mail, location_on, schedule)
  [x] Social auto-normalize bare handles → full URL
  [x] Brand social SVGs preserved (bukan generic Material Symbols)
  [x] "Designed with ♥ in Bali" copyright tagline

Step 4 — Filter & Booking Floating
  [x] /demo-filter renders 2 example configurations (Accommodations dgn
      CMS destinations + Tours dgn custom searchFields)
  [x] Sticky top-20 z-30 (di bawah header 80px)
  [x] Destination tabs pakai radio + peer-checked (no JS active state)
  [x] Form GET → navigate ke searchAction dgn query params
  [x] Reusable — configurable via props (destinations, searchFields, searchAction, sticky)
  [x] Bug fix: Tailwind JIT cache stale untuk file di folder baru — resolved dgn touch config

Step 5 — WhatsApp Floating (popup pattern)
  [x] Bulat toggle 56px bottom-right z-50 dengan icon brand WhatsApp asli
  [x] Klik toggle → popup panel muncul (header hijau + subtitle + option list)
  [x] Option card: border-l-4 hijau + WA icon bulat + title/subtitle
  [x] 1 option default auto-generate dari CMS greeting message
  [x] Interactive: toggle click, ESC key, outside click, option click → close
  [x] Icon konsisten pakai WA brand di 4 tempat (toggle + header + option kiri + accent kanan)
  [x] No close X — toggle button icon selalu WA (per user preference)
  [x] Bug fix: CSS transition opacity stuck di preview pane — resolved dgn no-transition
      (snap in/out reliable across environments)

Step 6 — Home Full Layout
  [x] 3 CMS block baru terdaftar di CMS + types regen benar (grep validated)
  [x] BlockRenderer switch case cover semua 14 block types
  [x] Homepage HTTP 200 dgn semua 8 section render:
      Hero → ValueProps (4 items) → Featured Tours → Where to Stay →
      On the Water → Stats (4 items) → Testimonials (3 items) → CTA + WA Floating
  [x] Regression: /about /tours /demo-filter /property tetap 200
```

**Manual test browser (kamu verify langsung):**
```
[ ] Refresh browser di / — visual check:
    1. Hero image full-width + heading + CTA orange
    2. Value Props Banner overlap bawah hero (-mt-16), 4 items dgn icon bulat
    3. Featured Tours / Where to Stay / On the Water — card grid dari CMS
    4. Stats banner bg ocean dgn 4 stats putih + icon besar
    5. Testimonials 3-col dgn quote italic + avatar/initial + stars
    6. CTA Banner hijau WhatsApp
    7. Floating WA button bulat di bottom-right — klik → popup muncul
[ ] Test /about → tetap render 3 CMS block (Hero, RichText, ServiceGrid)
[ ] Buka /admin/collections/pages/create → cek 14 block options tersedia
    di block picker (11 lama + 3 baru: Value Props Banner, Stats Banner,
    Testimonials Carousel)
[ ] Buat Page slug='home' di CMS dgn komposisi block bebas → publish →
    refresh homepage → CMS Page override fallback
[ ] Mobile ~375px: semua section stack proper, floating WA tidak menutupi
    tombol CTA banner (kalau overlap, tap salah satu tetap bisa)
```

---

## Phase 3.6 — Block System Enhancement 🔨 IN PROGRESS

Memperkaya block system dengan opsi media flexible, rich text formatting,
dan advanced styling (background/button/animasi), plus compact CMS UI
pakai tabs. Dikerjakan sebelum mulai halaman baru (About, Tour, dst)
supaya semua halaman ke depan bisa langsung pakai block yang sudah kaya
opsi, tidak perlu rework berulang.

**Strategi:** Pilot di Hero block dulu (CMS + frontend end-to-end),
baru batch ke block lain setelah pattern tervalidasi.

### 3.6.1 Reusable Field Groups (Foundation) ✅ DONE
- [x] fields/media.ts — mediaType branching (single/multiple/video/none), video URL/upload dgn poster fallback, transition preset (fade/slide/zoom/none) + interval, lazyLoad — 2026-08-05
- [x] fields/advancedStyle.ts — sectionPadding (compact/normal/spacious), background (default/color/image + overlay), button (variant/color/textColor/radius/hoverAnimation) — semua sinkron design tokens tailwind — 2026-08-05
- [x] Lexical features diaktifkan: Paragraph, Heading(h2-h4), Bold/Italic/Underline/Strikethrough/Sub/Sup/InlineCode, Align/Indent, UL/OL, Link/Upload/Relationship, Blockquote/HR, Inline+Fixed toolbars, TextStateFeature (color → 5 design tokens: ocean/coral/leaf/stone/midnight) — 2026-08-05

### 3.6.2 Pilot: Hero Block ✅ DONE
- [x] Hero block direstructure pakai `type: 'tabs'` (Content / Media / Advanced) + reusable field groups — 2026-08-05
- [x] Legacy fields `backgroundImage` + `overlayOpacity` di-preserve sebagai hidden (schema additive, no rename ambiguity for Drizzle push) — 2026-08-05
- [x] HeroBlock.astro update lengkap: mediaType branching render (single image / slider dgn CSS transition + JS interval / video YouTube/Vimeo/direct file dgn poster fallback / none), Advanced styling (bg color/image/overlay, button variant/color/radius/hover animation), section padding preset — 2026-08-05
- [x] Homepage fallback config diperbarui pakai schema baru (mediaType='none', background/button defaults) — 2026-08-05
- [x] Backward compat: existing Hero data yang punya `backgroundImage` tetap tersimpan di DB (via hidden legacy field); frontend fallback safe kalau field baru kosong — 2026-08-05
- [x] DB migration recovery: dropped stale `pages_blocks_hero*` tables setelah Drizzle sempat corrupt schema push mid-way (rename ambiguity) — Payload recreate fresh schema saat restart — 2026-08-05

### 3.6.3 Batch Rollout — Media-relevant blocks ✅ DONE
- [x] Image block — tabs Content/Advanced, tambah aspectRatio + imageFit + imagePosition, advancedStyleFieldsNoButton — 2026-08-06
- [x] Gallery block — tabs Content/Advanced, per-image fit+position, layout+columns di-`row` — 2026-08-06
- [x] CTA block — tabs Content/Media/Advanced, mediaLayout (background/left/right/above/below), advancedStyleFields (with button), legacy `style` preserved hidden — 2026-08-06
- [x] Shared helper `apps/web/src/lib/blockStyles.ts` — resolver fit/pos/align/container/padding/entry/bg/button dipakai lintas komponen (Image/Gallery/CTA) — 2026-08-06
- [x] `advancedStyleFieldsNoButton` variant export — untuk block tanpa CTA (Image, Gallery) — 2026-08-06
- [x] `buildFitPositionRow()` + `imageFitOptions`/`imagePositionOptions` export dari media.ts — reusable di block lain — 2026-08-06

### 3.6.3.1 Text Style + Slider AutoStart + CTA Templates + Gallery Lightbox ✅ DONE
- [x] `apps/cms/src/fields/textStyle.ts` — `buildTextStyleField(elements)` generator per-element color + animIn (default 'inherit') — 2026-08-06
- [x] `apps/web/src/lib/blockStyles.ts` — `resolveTextColor` + `resolveTextAnimIn` helpers — 2026-08-06
- [x] `apps/web/src/styles/global.css` — text-anim-* keyframes (fade/fade-up/fade-down/zoom/slide-left/slide-right/blur) reduced-motion aware — 2026-08-06
- [x] `sliderAutoStart` checkbox di mediaFields — Hero slider trigger first transition on load — 2026-08-06
- [x] Hero: buildTextStyleField(['heading','subheading']) + sliderAutoStart wired ke JS — 2026-08-06
- [x] Image: buildTextStyleField(['caption']) — 2026-08-06
- [x] Gallery: replace `columns` dgn desktopColumns/tabletColumns/mobileColumns (row 3-col dgn emoji hint), enableLightbox toggle, hoverEffect select (none/zoom/lift/overlay/grayscale), buildTextStyleField(['caption']). Legacy `columns` preserved hidden. Lightbox modal built-in dgn prev/next arrows (desktop), ESC/arrow key, backdrop click close — 2026-08-06
- [x] CTA: buildTextStyleField(['heading','description']) + 2 new mediaLayout templates: `scrolling-columns` (2-col vertical infinite loop, 5-10 images, ref cta-idea-1) dan `dual-frames` (2 overlapping rotated cards, ref cta-idea-2) — 2026-08-06

### 3.6.4 Batch Rollout — Text & sisanya ✅ DONE
- [x] RichText — tabs Content/Advanced. Advanced pakai advancedStyleFieldsNoButton + buildTextStyleField(['paragraph']). Legacy `alignment` preserved hidden — 2026-08-06
- [x] FAQ — tabs Content/Advanced. Advanced + buildTextStyleField(['heading','quote']). Text answer render via existing rich-text class — 2026-08-06
- [x] Testimonials — tabs Content/Advanced. Advanced + buildTextStyleField(['heading','quote']). Default bg-sand kalau bg advanced default — 2026-08-06
- [x] ServiceGrid — tabs Content/Advanced. Advanced + buildTextStyleField(['heading']). Limit + featuredOnly di-row-kan — 2026-08-06
- [x] Contact — tabs Content/Advanced. Advanced + buildTextStyleField(['paragraph']). showMap+showWhatsApp di-row-kan — 2026-08-06
- [x] ValuePropsBanner — tabs Content/Advanced. Advanced + buildTextStyleField(['label','subheading']). Overlap positioning (-mt-16) tetap — 2026-08-06
- [x] StatsBanner — tabs Content/Advanced. Advanced TANPA background group (hindari kolom bentrok dgn existing `backgroundImage`). + buildTextStyleField(['eyebrow','heading','label','caption']) — 2026-08-06
- [x] TestimonialsCarousel — tabs Content/Advanced. Advanced + buildTextStyleField(['eyebrow','heading','quote']) — 2026-08-06
- [x] Embed, Spacer — skip sesuai plan (sudah cukup simple)

**Manual Test Log — Phase 3.6**
(diisi setelah setiap step)

---

## Phase 3.7 — Service Landing Pages 🔨 IN PROGRESS

Halaman filter+search per service module dgn destination pills (dari CMS
Destinations), editorial featured card, listing grid, dan concierge/trust
section. Reference: `ai/reference/villa/code.html`.

### 3.7.0 CMS-driven service landing blocks ✅ DONE
- [x] `ServiceListing` block (CMS) — bundle heading + destination filter tabs + search bar + featured editorial + grid. Auto-fetch dari service collection sesuai serviceType. Client-side filter (destination + name search). Featured mode auto/none — 2026-08-06
- [x] `TrustBadges` block (CMS) — 2-col concierge (text+buttons+badge grid), min 2 max 8 badges — 2026-08-06
- [x] Frontend components: `ServiceListingBlock.astro`, `TrustBadgesBlock.astro` — 2026-08-06
- [x] Register di BlockRenderer — 2026-08-06
- [x] `seed-villa-page.ts` — idempotent seed CMS Page slug='villa' dgn ServiceListing (accommodations, type=villa/hotel/resort) + TrustBadges (4 badges) — 2026-08-06

### 3.7.1.2 Accommodations quickSpecs + icon picker + super-admin blocks ✅ DONE
- [x] `apps/cms/src/fields/iconOptions.ts` — shared icon options (~32 icons) dgn emoji hint di label → editor pilih dari dropdown (bukan input manual) — 2026-08-06
- [x] `quickSpecs` array field (max 4) di tab baru "Quick Specs" — iconName (select), label, subtitle. Frontend: kalau CMS diisi override; kosong = auto-derive dari rooms/guests/rating/amenities — 2026-08-06
- [x] `amenities.icon` diganti dari text ke select pakai iconOptions — 2026-08-06
- [x] `additionalBlocks` (type: blocks) di tab baru "🔒 Custom Sections" — full access ke semua 16 block. Field-level access: `update: superAdminFieldAccess` (super-admin only bisa edit; editor lain read-only) — 2026-08-06
- [x] Frontend villa/[slug]: render CMS quickSpecs kalau ada, else fallback derived. BlockRenderer untuk additionalBlocks setelah main section (di antara Room Options dan Recommended Alternatives) — 2026-08-06

### 3.7.1.1 Accommodations CMS restructure ✅ DONE
- [x] `Accommodations.ts` restructure jadi 7 tabs: Overview / Media / Amenities & Highlights / Rooms & Pricing / Location & Experiences / Policies / Booking. seoFields tetap sidebar — 2026-08-06
- [x] Field baru: `subtitle` (short tagline), `highlightTags[]` (chip sidebar, fallback ke amenities), `nearbyLandmarks[]` ({name, distance}), `curatedExperiences[]` ({name}) — 2026-08-06
- [x] `type` + `starRating` di-row, `destination` + `category` di-row, roomType `bedType`+`maxGuests` di-row + `pricePerNight`+`currency` di-row, `checkInTime`+`checkOutTime` di-row — kompaktkan admin UI — 2026-08-06
- [x] Villa/[slug] update konsumsi field baru: subtitle di bawah title, highlightTags override sidebar tags, nearbyLandmarks + curatedExperiences render side-by-side setelah map, policies section, check-in/out di sidebar sebelum Concierge — 2026-08-06

### 3.7.1 Villa (pilot) ✅ DONE
- [x] Villa listing = CMS Page slug='villa' dgn ServiceListing + TrustBadges block — 2026-08-06
- [x] `apps/web/src/pages/villa/[slug].astro` — detail route mengikuti reference villa_detail: hero bento gallery (1 big + 2 side), 12-col layout (8 left detail + 4 sticky booking), quick specs 4-card (rooms/guests/rating/amenities), amenities grid dgn icon bulat, location dgn map embed fallback, room types list, sticky booking sidebar (tags+price+form+Reserve WA+Concierge), recommended alternatives 3 card — 2026-08-06
- [x] `AccommodationCard` diberi prop `hrefBase` (default `/accommodations`, ServiceListing pass `/villa`) — 2026-08-06
- [x] `ServiceListingBlock` detailRouteMap accommodations → `/villa` (default asumsi ServiceListing dipakai untuk villa/hotel/resort pattern) — 2026-08-06
- [x] Filter type villa/hotel/resort di getStaticPaths — guesthouse tetap di /accommodations legacy route
- [x] `apps/web/src/pages/villa/index.astro` — full page dgn: editorial heading, destination filter pills (CMS destinations + "All Bali"), search bar (name/dates/guests), featured villa editorial card (isFeatured first, fallback first), listings grid dgn AccommodationCard, concierge/trust section (4 badges), client-side JS filter (destination + name) — 2026-08-06
- [x] Filter type: `villa` OR `hotel` (guesthouse/resort tetap di /accommodations)
- [x] Featured card: image full-bleed + gradient ocean overlay, editor choice badge, star rating, destination, price/night, "Reserve Experience" CTA
- [x] Client filter JS: destination tab click → filter by data-dest, search input → filter by name (live), empty state message
- [x] Concierge section: WhatsApp inquiry CTA + link ke /accommodations, 4 trust badges (verified/support/best-price/curated)
- [x] `apps/cms/src/scripts/add-menu-item.ts` — script idempotent tambah "Villa" ke main-navigation menu (insert after Home)
- [ ] Manual test: buka /villa, verify filter pill click, search input, featured card render, mobile responsive
- [ ] Run add-menu-item script → verify nav "Villa" muncul di Header

### 3.7.2 Tour CMS restructure ✅ DONE
- [x] `Tours.ts` restructure jadi 9 tabs: Overview / Media / Quick Specs / Highlights & Meeting / Itinerary / Includes & Info / Pricing / 🔒 Custom Sections / Booking — 2026-08-06
- [x] Field baru: `meetingPoint` group (name, time, address, mapEmbed), `pickupService` group (available checkbox + areas + notes conditional), `additionalInfo` richText, `itinerary[].iconName` (select) — 2026-08-06
- [x] Reuse: `pricingFields` (adult/child/infant + note), `subtitle` (existing), `highlights`, `includes`, `excludes` — 2026-08-06
- [x] `additionalBlocks` (blocks type, super-admin only via `superAdminFieldAccess`) — full 16 block (tours_blocks_ prefix pendek, no filter needed) — 2026-08-06
- [x] `quickSpecs` array (max 4, iconName select + label + subtitle) — 2026-08-06
- [x] Rows untuk kompak: destination+category, duration+min+max participants, itinerary time+title+icon — 2026-08-06
- [x] Frontend `/tour/[slug]` detail page mirror `/villa/[slug]`: hero bento, 12-col split, quick specs, highlights, itinerary timeline dgn icon+time, includes/excludes side-by-side, meeting point + pickup service, additional info, sidebar booking (date + adults + children + Book Tour WA), additionalBlocks, recommended tours — 2026-08-06

### 3.7.4 WaterActivities + Yachts + Restaurants + Venues rollout ✅ DONE
- [x] `WaterActivities.ts` — 8 tabs: Overview / Media / Quick Specs / What to Bring & Safety / Pricing / 🔒 Custom Sections / Booking. Field baru: subtitle, quickSpecs, whatToBring[].icon (select), additionalBlocks filter [valuePropsBanner, testimonialsCarousel, serviceListing] karena water_activities_blocks_ prefix panjang — 2026-08-07
- [x] `Yachts.ts` — 9 tabs: Overview / Media / Quick Specs / Amenities / Specifications / Cruise Packages / 🔒 Custom Sections / Booking. Field baru: subtitle, quickSpecs, amenities.icon (select), additionalBlocks (full blocks, prefix pendek) — 2026-08-07
- [x] `Restaurants.ts` — 8 tabs: Overview / Media / Quick Specs / Features / Menu Highlights / Location & Hours / 🔒 Custom Sections / Booking. Field baru: subtitle, quickSpecs, features (name+icon), cuisine dgn emoji, additionalBlocks filter [valuePropsBanner, testimonialsCarousel] — 2026-08-07
- [x] `Venues.ts` — 10 tabs: Overview / Media / Quick Specs / Features / Packages / Location / Testimonials / 🔒 Custom Sections / Booking. Field baru: subtitle, quickSpecs, features (name+icon), additionalBlocks (full blocks) — 2026-08-07
- [x] `seed-landing-pages.ts` extended dgn 4 CMS Pages: water-activity, yacht, restaurant, venue — masing2 dgn ServiceListing + TrustBadges konten adapted per niche + nav item — 2026-08-07
- [x] Frontend `/water-activity/[slug]`, `/yacht/[slug]`, `/restaurant/[slug]`, `/venue/[slug]` — mirror villa/[slug] layout: hero bento, 12-col split, quick specs 4-card, "amenities-style" grid per niche (what-to-bring/amenities/features/features), "location-style" (map/specs/hours), "policies-style" (safety/req), "options-style" list (packages/menu/packages), sidebar (tags+price+form+CTA+info bar+concierge), additionalBlocks BlockRenderer, recommended 3-card — 2026-08-07
- [x] Card hrefBase prop: WaterActivityCard, YachtCard, RestaurantCard, VenueCard — semua accept override, default ke coded plural route — 2026-08-07
- [x] ServiceGrid + ServiceListing detailRouteMap + hrefBase pass update: water-activities→/water-activity, yachts→/yacht, restaurants→/restaurant, venues→/venue — 2026-08-07

### 3.7.3 Rental CMS restructure ✅ DONE
- [x] `Rentals.ts` restructure jadi 8 tabs: Overview / Media / Quick Specs / Specifications / Includes & Requirements / Pricing Tiers / 🔒 Custom Sections / Booking — 2026-08-06
- [x] Field baru: `subtitle`, `features` array (name + icon select — mirip amenities), `quickSpecs`, `additionalBlocks` (super-admin) — 2026-08-06
- [x] `rentalType` labels dpt emoji hint (🏍️ Motorbike, 🚗 Car, 🚴 Bicycle, 🚤 Boat, 🏄 Surfboard, 🤿 Snorkel, 📷 Camera, 📦 Other) — 2026-08-06
- [x] Specs group (brand+model+year row) di-kompaktkan — 2026-08-06
- [x] Pricing tiers row (duration+price+currency) — 2026-08-06
- [x] Frontend `/rental/[slug]` detail page mirror `/villa/[slug]`: hero bento, 12-col split, quick specs, specifications (brand/model/year card grid + details textarea + features grid dgn icon), includes list, pricing tiers table, requirements, sidebar booking (pickup + return date + quantity select + Book Rental WA), additionalBlocks, recommended (same rentalType) — 2026-08-06
- [x] `TourCard` + `RentalCard` diberi prop `hrefBase` (default `/tours`, `/rentals`). ServiceGrid + ServiceListing pass `/tour` `/rental` supaya click card ke CMS-driven detail — 2026-08-06
- [x] `ServiceListingBlock.detailRouteMap`: tours→/tour, rentals→/rental — 2026-08-06

---

## Phase 3.8 — Header & Footer CMS Sync 🔨 IN PROGRESS

Gap ditemukan (investigasi 2026-08-07): Header 80% CMS-driven, Footer 60%.
Yang masih hardcoded: Header CTA button text, Footer Quick Links column.
Setup Global baru "Header Settings" + "Footer Settings" (grup System) untuk
kontrol struktural (menu wiring + CTA + toggle). Kontak/social/copyright
TETAP di SiteSettings (tidak duplikasi).

### 3.8.1 CMS — Global Settings Baru ✅ DONE
- [x] `apps/cms/src/globals/HeaderSettings.ts` — primaryMenu relationship, showCtaButton, ctaText, ctaType (whatsapp/custom), ctaCustomLink (conditional), stickyOnScroll, transparentOnTop. Grup System, super-admin only — 2026-08-07
- [x] `apps/cms/src/globals/FooterSettings.ts` — columns array (columnLabel + menu relationship, max 4). Grup System, super-admin only — 2026-08-07
- [x] Registrasi kedua global di payload.config.ts `globals: [SiteSettings, HeaderSettings, FooterSettings]` — 2026-08-07

### 3.8.2 Seed Data ✅ DONE
- [x] `seed-header-footer.ts` — idempotent create menu `footer-quick-links` (Home/About/Contact/Property) + set HeaderSettings defaults (primaryMenu=main-navigation, showCta=true, ctaText="WhatsApp Booking", ctaType=whatsapp) + FooterSettings (1 column: Quick Links → footer-quick-links) — 2026-08-07

### 3.8.3 Frontend — Sync ✅ DONE
- [x] `apps/web/src/lib/payload.ts` — tambah `getHeaderSettings()` + `getFooterSettings()` — 2026-08-07
- [x] Header.astro — fetch HeaderSettings, resolve primaryMenu.slug (fallback main-navigation), CTA config-driven (showCtaButton/ctaText/ctaType/ctaCustomLink), transparent behavior: prop override → HeaderSettings.transparentOnTop → default false. Both desktop + mobile CTA updated — 2026-08-07
- [x] Footer.astro — fetch FooterSettings + async loop menus per column, render CMS-driven columns. Fallback ke hardcoded Quick Links kalau FooterSettings.columns kosong (safety net). SiteSettings preserved untuk brand/contact/social/copyright. Services column tetap dari `enabledModules()` (per user decision) — 2026-08-07
- [x] **Fix**: Menu items di Header & Footer Quick Links tidak sync (selalu fallback). Root cause: `getMenuBySlug()` pakai `fetchBySlug` yang filter `status=published`, sedangkan collection Menus pakai enum `status: 'active' | 'inactive'` → filter tidak match → return null → jatuh ke fallback nav. Fix Opsi A: konsumsi `headerCfg.primaryMenu.items` dan `footerCfg.columns[].menu.items` yang sudah ter-populate langsung dari global fetch (relationship di-resolve Payload by default), hilangkan double-fetch. `servicesMenu` di Footer ikut fix pola sama. — 2026-08-07

### Decision Log — Phase 3.8
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-07 | Header/Footer Settings TIDAK duplikasi field contact/social/copyright dari SiteSettings | Single source of truth: SiteSettings sudah full untuk konten branding. HeaderSettings hanya kontrol structural (menu wiring + CTA behavior). FooterSettings hanya kontrol kolom menu ekstra. |
| 2026-08-07 | Services column Footer tetap dari `enabledModules()` config, bukan CMS Menu | User decision. Services = struktur produk (per-toggle di config), bukan editorial menu. Zero duplikasi data. |
| 2026-08-07 | Footer fallback ke hardcoded Quick Links kalau FooterSettings.columns kosong | Safety net supaya Footer tetap punya konten kalau editor belum isi FooterSettings. Fallback disappear otomatis begitu editor tambah minimal 1 column. |
| 2026-08-07 | Konsumsi relationship menu dari global response langsung (bukan re-fetch via `getMenuBySlug`) | Payload sudah populate relationship di response Global by default (`primaryMenu.items` dan `columns[].menu.items` sudah ada). Re-fetch redundan + expose bug: collection `Menus` pakai status enum `'active'/'inactive'` sedangkan `fetchBySlug` default filter `status=published` → mismatch → semua menu return null. Konsumsi langsung = 1 request lebih sedikit + tidak ada risiko status filter mismatch. |

**Manual Test Log — Phase 3.8**
(diisi setelah setiap step)

---

## Phase 3.13 — ServiceListing Template 2 (Hero Immersive) 🔨 IN PROGRESS

Menambahkan opsi layout kedua ke block `ServiceListing`: **Hero Immersive** (hero image/video background + floating filter tabs + search bar di dalam hero, tanpa featured card, dengan cards style "detailed" — multi-image slider, rating, description, amenity badges, Book Now button). Layout existing tetap tersedia sebagai **Editorial Featured** (default) dan tidak berubah visualnya.

### Approach
- **CMS**: field `layout` (select: editorial-featured / hero-immersive) di atas tabs, super-admin only via `superAdminFieldAccess`. Field additive lainnya opsional + default aman.
- **Frontend**: split ke 3 file — `ServiceListingBlock.astro` (dispatcher tipis), `ServiceListingEditorial.astro` (markup existing, verbatim), `ServiceListingHeroImmersive.astro` (baru). Split dipilih karena struktur Template 2 (hero full-width + floating filter) beda fundamental, bukan sekadar tweak class. Split = regression risk nol untuk Template 1.
- **Cards**: 7 card component (`Accommodation/Tour/WaterActivity/Yacht/Restaurant/Venue/Rental`) diberi prop `variant?: 'compact' | 'detailed'`. Default `compact` (tidak berubah). `detailed` delegate ke shared `DetailedCard.astro` — multi-image slider + rating + description + amenity pills + Book Now button.

### 3.13.1 CMS Block Config ✅ DONE
- [x] `layout` field super-admin only di ServiceListing block — 2026-08-08
- [x] Tab baru "Hero" (conditional pada layout=hero-immersive) — heroBackground group (backgroundType image/video, backgroundImage, backgroundVideo, overlayOpacity) — 2026-08-08
- [x] Tab "Filter & Search" diperluas — showDatePicker, showGuestCount, searchButtonText — 2026-08-08
- [x] Tab baru "Card Style" — cardVariant (compact/detailed), showLoadMore + loadMoreText + initialVisibleCount — 2026-08-08

### 3.13.2 Frontend Split ✅ DONE
- [x] `ServiceListingBlock.astro` di-rewrite jadi dispatcher (~15 lines) — 2026-08-08
- [x] `ServiceListingEditorial.astro` = markup existing verbatim + tambahan variant pass-through + Load More support — 2026-08-08
- [x] `ServiceListingHeroImmersive.astro` baru — hero image/video background (YouTube/Vimeo/direct file/image), floating destination pills + search bar di dalam hero area, tanpa featured card, cards default `detailed` — 2026-08-08
- [x] Editorial JS query id prefix ketatkan ke `sl-` supaya tidak double-bind ke Hero Immersive grids (prefix `slh-`) — 2026-08-08

### 3.13.3 Detailed Card Variant ✅ DONE
- [x] `apps/web/src/components/cards/DetailedCard.astro` shared component (multi-image slider dgn dot indicator + JS, badge, eyebrow, title + rating stars, description 2-line clamp, amenity pills, price + Book Now button) — 2026-08-08
- [x] 7 card diextend dgn prop `variant`: Accommodation, Tour, WaterActivity, Yacht, Restaurant, Venue, Rental — semua additive, default `compact` (regression-safe) — 2026-08-08

### Decision Log — Phase 3.13
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-08 | Split frontend jadi 3 file (dispatcher + 2 layout) alih-alih conditional dalam 1 file | Struktur Hero Immersive fundamental beda (hero full-width vs section datar, floating filter vs section terpisah, no featured card). 1-file bakal ~700+ baris dgn 2 markup path yang sulit di-review. Split = regression Template 1 zero-risk (markup asli dipindah utuh via `cp`). |
| 2026-08-08 | `DetailedCard.astro` shared component (satu markup, 7 adapter di masing2 card) | Alternatif duplikasi markup di 7 card = 500+ baris redundant, sulit maintain (fix bug di dot indicator = edit 7x). Adapter approach: masing2 card normalize data-nya sendiri (subtitle/description/gallery/amenities/features) → delegate ke DetailedCard. Kalau butuh style perbedaan per-service nanti, tinggal split. |
| 2026-08-08 | Search/filter + Load More = VISUAL ONLY (JS interaction ada, tapi belum ada logic dates/guests) | Sesuai instruksi user. Destination filter + name search JS functional (client-side hide/show). Date picker + guest count = input placeholder saja (belum wired ke query/API). Load More: functional (reveal hidden cards) tapi belum ada pagination fetch. Follow-up task terpisah. |
| 2026-08-08 | Hero Immersive default `cardVariant='detailed'` (bukan mengikuti CMS field default `compact`) | Reference `template2-target.png` selalu detailed cards. Kalau editor override ke compact via Card Style tab, tetap dihormati. |
| 2026-08-08 | Field-level access `superAdminFieldAccess` untuk `layout` (bukan collection-level) | Editor & Admin tetap bisa edit semua konten & blocks; hanya field `layout` yang read-only untuk mereka. Match instruksi user: "user lain hanya bisa melakukan edit, penambahan block akan tetapi tidak dapat melakukan perubahan template". |

**Fixes & Enhancements — Phase 3.13**
- [x] Fix: unified frame untuk destination tabs + search bar — tabs dan search bar dibungkus dalam SATU card sesuai reference. — 2026-08-08
- [x] Enhancement: CMS-controlled pagination — field `paginationType` (select: load-more / pages) di tab Card Style. Load More = reveal batch berikutnya per klik. Pages = numbered pagination (1, 2, 3… + prev/next). Kedua template (Editorial + HeroImmersive) support. Filter/search reset ke page 1. — 2026-08-08
- [x] Enhancement: Pagination ditambahkan ke 3 block lain — Testimonials, TestimonialsCarousel, ServiceGrid. Field CMS: `paginate` (checkbox), `pageMode` (load-more/pages), `pageSize` (number), `moreText` (text). Field names pendek untuk avoid 63-char overflow. — 2026-08-08
- [x] Fix: scroll position saat ganti page — semua 5 komponen pagination sekarang scroll ke posisi atas grid cards (dengan offset 100px untuk fixed header), bukan `scrollIntoView` yang bisa tertutup header. — 2026-08-08
- [x] Enhancement: mobile responsive pagination — pada mobile (<768px), cards per page ditampilkan dalam horizontal swipeable row (scroll-snap) yang bisa di-swipe. Pagination nav tetap di bawah. Desktop tetap grid layout biasa. Berlaku untuk semua 5 komponen: Testimonials, TestimonialsCarousel, ServiceGrid, ServiceListingEditorial, ServiceListingHeroImmersive. — 2026-08-08

**Manual Test Log — Phase 3.13**
- [x] `pnpm astro sync` sukses di apps/web — types + imports valid
- [ ] CMS admin: field `layout` muncul di ServiceListing block, super-admin bisa switch, editor read-only — pending manual test
- [ ] Conditional tabs (Hero) hanya muncul saat layout=hero-immersive — pending manual test
- [ ] Regression: block ServiceListing existing (default `editorial-featured`) render identik dgn sebelumnya — pending manual test
- [ ] Template 2 visual vs `template2-target.png`: hero background, floating filter pills, search bar rounded, detailed card layout (multi-image, rating, description, amenities, Book Now, Load More) — pending manual test
- [ ] Multi-instance: 2 ServiceListing block di 1 halaman (mixed editorial + hero-immersive) — JS scope terisolasi by listing-id — pending manual test

---

## Phase 3.14 — CMS Admin UX Restructure + Demo Content Seeding ✅ DONE

Merapikan sidebar admin (role-based visibility + regrouping + ordering) supaya
client (role admin) hanya melihat menu yang relevan, plus seed konten demo
lengkap untuk semua halaman utama + landing pages agar frontend punya data
nyata untuk verifikasi.

### 3.14.1 Role-based sidebar visibility (`admin.hidden`) ✅ DONE
- [x] Roles existing dikonfirmasi: `editor` / `admin` / `super-admin` (di `Users.ts`, checker di `access/roles.ts`) — 2026-08-19
- [x] `Users` collection — `hidden` untuk non super-admin — 2026-08-19
- [x] `Menus` collection — `hidden` untuk editor (admin+ visible) — 2026-08-19
- [x] Globals `SiteSettings`, `HeaderSettings`, `FooterSettings`, `HomepageContent` — `hidden` untuk editor — 2026-08-19
- [x] Global `SiteFeatures` — `hidden` untuk non super-admin — 2026-08-19
- [x] `admin.hidden` HANYA menyembunyikan dari sidebar UI — access control (read/create/update/delete) tidak diubah, tetap enforce di API level — 2026-08-19

### 3.14.2 Admin access update — client (admin) bisa edit settings ✅ DONE
- [x] `SiteSettings`, `HeaderSettings`, `FooterSettings` — `access.update` diubah dari `isSuperAdmin` → `isAdmin` supaya client (role admin) bisa adjust brand/kontak/nav/footer sendiri. Editor tetap tidak bisa (hidden + no update access) — 2026-08-19

### 3.14.3 Sidebar group restructure + ordering ✅ DONE
- [x] Payload 3.x TIDAK support custom nav icon bawaan (butuh override Nav component) — di-skip — 2026-08-19
- [x] Group baru: `Content` (Pages + Destinations + Categories + Testimonials), `Services` (7 service collections), `Site Builder` (Menus + Media), `Administration` (Users), `Settings` (5 globals) — 2026-08-19
- [x] `Pages` dipindah dari group `Layout` → `Content`; `Media` dari `Content` → `Site Builder`; `Menus` dari `Layout` → `Site Builder`; `Users` dari `System` → `Administration`; semua globals dari `System` → `Settings` — 2026-08-19
- [x] Ordering via urutan registrasi di `payload.config.ts` — Content → Services → Site Builder → Administration; globals: SiteSettings → Header → Footer → HomepageContent → SiteFeatures — 2026-08-19

### 3.14.4 Demo content seed — main pages ✅ DONE
- [x] `seed-demo-content.ts` + script `pnpm seed:demo` — 5 pages: home, about, contact, privacy-policy, terms — 2026-08-19
- [x] Home: Hero + ValuePropsBanner + 3× ServiceGrid + StatsBanner + TestimonialsCarousel (6) + CTA — 2026-08-19
- [x] About: Hero + RichText (company story) + StatsBanner + TestimonialsCarousel (3) + CTA — 2026-08-19
- [x] Contact: Hero + Contact + CTA. Privacy/Terms: RichText (full legal copy travel-themed) — 2026-08-19
- [x] Semua page `status: published`, idempotent (upsert by slug), travel-themed copy — 2026-08-19

### 3.14.5 Service landing pages repair + Explore Bali ✅ DONE
- [x] **Bug ditemukan**: landing pages `/tour /yacht /restaurant /rental /water-activity /venue` kehilangan blok `serviceListing` (hanya `trustBadges` tersisa) — cards tidak tampil. Kemungkinan ter-wipe saat nuclear-reset serviceListing; hanya `/villa` yang lengkap. Data service records utuh (4-5/collection) — 2026-08-19
- [x] `seed-service-landing-content.ts` + script `pnpm seed:landing` — re-seed 6 landing pages dgn `serviceListing` (hero-immersive, mirror shape /villa yg working) + `trustBadges`. NO schema change (data only, nol risiko CMS 500) — 2026-08-19
- [x] Page baru `explore-bali` — Hero + ValuePropsBanner + 4× ServiceGrid (Tours/Stays/Activities/Yachts) + StatsBanner + CTA. Nav item "Explore Bali" ditambah after Home — 2026-08-19
- [x] Script verifikasi in-line: konfirmasi `serviceListing` ter-persist di semua 6 page sebelum exit — 2026-08-19

### 3.14.6 Homepage SEO title fix ✅ DONE
- [x] `apps/web/src/pages/index.astro` — `pageTitle` untuk homepage CMS-driven pakai `seo.metaTitle ?? title` (sebelumnya cuma `title` = "Home"). Menyelaraskan dgn `[...slug].astro` yg sudah pakai metaTitle — 2026-08-19

**Manual Test Log — Phase 3.14 (frontend rendering verification)**
```
Pages verified (desktop + mobile 375px, zero console errors, no horizontal overflow):
  [x] /                → 8 blocks, title = metaTitle (fixed), links functional
  [x] /about           → 5 blocks, all render
  [x] /contact         → 3 blocks (kontak pakai placeholder SiteSettings — low, expected)
  [x] /privacy-policy  → RichText full copy
  [x] /terms           → RichText full copy
  [x] /tour            → serviceListing 4 tours + trustBadges + pagination
  [x] /yacht           → serviceListing 5 yachts + trustBadges + pagination
  [x] /restaurant      → serviceListing 4 restaurants + pagination
  [x] /rental          → serviceListing 4 rentals + pagination
  [x] /water-activity  → serviceListing 4 activities + pagination
  [x] /venue           → serviceListing 5 venues + pagination (mobile page-click works: 3+2)
  [x] /explore-bali    → hero + 4 serviceGrids (12 cards) + stats + CTA
  [x] /villa (regression) → tetap lengkap, mobile cards 327px swipe
```

**Known follow-ups (Phase 4 backlog):**
- [ ] Hero background image landing pages di-assign arbitrer dari media pool (mis. /yacht pakai foto motor) → client upload & assign hero sesuai per page di CMS
- [ ] RichText privacy/terms: section heading ("1. General" dst) render sbagai paragraph biasa (seed helper cuma emit paragraph node) → editor format heading di CMS, atau upgrade helper
- [ ] SiteSettings kontak + map embed belum diisi → Contact block tampil placeholder
- [ ] Manual test admin panel: login sebagai role `admin` & `editor` → verify sidebar visibility sesuai matrix (butuh CMS restart)

**Pending — butuh CMS restart untuk apply group/hidden/access changes:**
- [ ] Restart `pnpm dev` di apps/cms → verify sidebar groups + role visibility + admin bisa edit SiteSettings/Header/Footer

---

## Phase 3.19 — Admin Dashboard Overview (nice-to-have) ✅ DONE

Custom overview stats + recent activity di atas dashboard admin Payload.
Payload 3.x mendukung ini via `admin.components.beforeDashboard` (Server
Component) — tidak terlalu kompleks, jadi dikerjakan (bukan di-skip).

### Implementasi ✅ DONE
- [x] `apps/cms/src/admin/DashboardStats.tsx` — async Server Component. Query via `payload` local API (count + find), no HTTP — 2026-08-20
- [x] Stat cards: Pages (published/draft), Active Services, Testimonials, Media — 2026-08-20
- [x] Recent Activity: last 5 edits across 12 collections (sort -updatedAt, merge, take 5), link ke edit view — 2026-08-20
- [x] Styling pakai CSS var tema Payload (`--theme-elevation-*`, `--theme-text`) → konsisten light/dark. Accent border pakai design token brand — 2026-08-20
- [x] Register di `payload.config.ts` `admin.components.beforeDashboard: ['/admin/DashboardStats#default']` + `pnpm generate:importmap` — 2026-08-20

### Manual Test Log — Phase 3.19
```
[x] importMap ter-generate dgn entry DashboardStats
[x] CMS boot bersih, /admin (login) render 200 tanpa console error → komponen kompilasi OK
[x] Data queries terverifikasi via REST: Pages 12 pub/1 draft, Services 7,
    Testimonials 7, Media 22, recent activity dgn timestamp benar
[ ] Visual render dashboard (post-login) — PERLU login super-admin (tidak bisa
    dilakukan otomatis; password entry di luar kemampuan agent)
```

### Decision Log — Phase 3.19
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Pakai `beforeDashboard` (bukan override full dashboard view) | Lebih ringan & aman — nambah section di atas dashboard default, tidak mengganti UI Payload existing |
| 2026-08-20 | Server Component + `payload` local API | Query langsung tanpa HTTP round-trip; standar Payload 3 untuk admin RSC |
| 2026-08-20 | safeCount() try/catch per query | Kalau satu collection error, dashboard tetap render (graceful degradation) |

---

## Phase 3.18 — Testimonials: Block dari Collection ✅ DONE

Testimonials SUDAH dedicated collection (Phase 3.11). Task ini menyambungkan
block `testimonials` & `testimonialsCarousel` supaya bisa pilih sumber:
**inline** (isi manual, existing) atau **collection** (ambil dari koleksi
Testimonials dgn filter service/destination/featured/limit).

### 3.18.1 Collection enhancement (additive) ✅ DONE
- [x] Testimonials collection TIDAK dibuat ulang (sudah ada) — hanya tambah 2 field: `destination` (relationship→destinations, untuk filter "by destination") + `date` (untuk urutan kronologis). Field lain (name/quote/rating/avatar/`sourceModule`/isFeatured/status) tetap — 2026-08-20

### 3.18.2 Block config — source toggle ✅ DONE
- [x] Helper `testimonialSourceFields()` di blocks/index.ts — `source` (inline/collection), `svc` (service filter), `filterDest` (relationship), `onlyFeatured`, `maxItems`. Dipakai di kedua block — 2026-08-20
- [x] Nama field select SENGAJA pendek (`source`/`svc`) — worst case `enum_water_activities_blocks_testimonials_carousel_source`=57 (<63). `items` array jadi conditional (source≠collection), required→false — 2026-08-20

### 3.18.3 Frontend ✅ DONE
- [x] `TestimonialsBlock.astro` + `TestimonialsCarouselBlock.astro` — kalau source=collection: fetch `getTestimonials` dgn where {sourceModule, isFeatured, destination} + limit + sort '-date'; map avatar→photoUrl. Kalau inline: pakai block.items (existing) — 2026-08-20
- [x] `seed-testimonials.ts` (+ `pnpm seed:testimonials`) — 7 record contoh dgn sourceModule/destination/featured/date — 2026-08-20
- [x] About page di-set source=collection (featured only) sebagai demo real; homepage tetap inline — 2026-08-20

### ⚠️ Schema migration recovery (Payload SQLite push bug)
- [x] Menambah field ke block existing memicu bug Payload: push meng-emit `CREATE INDEX` dobel untuk block sub-table yg di-ALTER → gagal. Drop index saja tak cukup (push emit ulang) — 2026-08-20
- [x] **Recovery**: drop 26 tabel `*_blocks_testimonials*` (bukan tabel utama `testimonials`, bukan `venues_testimonials`) → push recreate fresh (sekali, no dup) → sukses. Data block inline (home/about/villa) di-restore via re-seed (seed-demo-content + seed-villa-page) — 2026-08-20
- [x] Pola drop-and-recreate ini konsisten dgn recovery block sebelumnya (drop-cta-tables dll) — 2026-08-20

### Manual Test Log — Phase 3.18 (empiris)
```
[x] Schema push sukses setelah recovery — /api/testimonials → 200 (7 records)
[x] Filter API: sourceModule=tours + featured → Sarah Mitchell ✅
[x] Source=collection (About page): tampil 4 featured dari collection
    (Chen/Mitchell/Bergmann/Emma) + lokasi; nama inline lama (Alex/Sophie/Mark) hilang ✅
[x] Source=inline (Homepage): tetap inline (Sarah Mitchell "Australia" dst) — regresi OK ✅
[x] Semua page 200 server-side; warm reload 59 resources semua 200 (500 sempat
    transient saat CMS restart, benign) ✅
```

### Decision Log — Phase 3.18
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Tidak recreate collection, hanya tambah destination+date | Instruksi: skip step 2 kalau collection sudah ada. Field existing (name/quote/sourceModule/isFeatured) sudah cukup untuk sebagian besar filter |
| 2026-08-20 | Field select block pakai nama pendek `source`/`svc` | testimonialsCarousel embed di additionalBlocks water_activities → prefix 51 char, budget 12. `filterService` (13) overflow, `svc` (3) aman |
| 2026-08-20 | Recovery via drop block TABLES (bukan index) | Bug Payload emit CREATE INDEX dobel saat ALTER; drop index tak menolong. Drop tabel → recreate fresh sekali. Data inline di-restore via re-seed |
| 2026-08-20 | About page → source=collection sebagai demo | Bukti end-to-end + improvement nyata (About tampil testimonial asli dari CMS, bukan hardcode) |

**Catatan dev:** `/explore-bali` sempat 404 di dev (getStaticPaths cache) — touch `[...slug].astro` untuk refresh. Production build selalu fresh.

---

## Phase 3.17 — WhatsApp Deep Integration (template + variables) ✅ DONE

Menyempurnakan WA per-service: Task 3.3 sudah wire NOMOR; sekarang wire
TEMPLATE pesan (CMS-editable) dengan dukungan variabel placeholder, plus
verifikasi empiris penuh (custom number, fallback, variable replacement).

### 3.17.1 Field verification ✅
- [x] `whatsappNumber` + `whatsappTemplate` sudah ada di ServiceTypes (dari 3.15) — skip penambahan field. SiteSettings sudah punya WA default (`contact.whatsapp`) — 2026-08-20

### 3.17.2 Template renderer + variables ✅ DONE
- [x] `lib/whatsapp.ts` — `renderWhatsAppTemplate(template, vars)` — ganti `{{serviceName}}`, `{{destination}}`, `{{date}}`, `{{userName}}`, `{{price}}`. Variabel tak terisi → placeholder `[nama]` untuk diisi visitor — 2026-08-20
- [x] `ServiceTypes.whatsappTemplate` field description didokumentasikan dengan daftar variabel — 2026-08-20
- [x] `seed-service-types.ts` — 7 template di-upgrade pakai variabel (mis. accommodations: "...booking *{{serviceName}}* di {{destination}}. Check-in: {{date}}...") + re-seed — 2026-08-20

### 3.17.3 Frontend integration (7 detail pages) ✅ DONE
- [x] Priority pesan WA: `item.whatsappMessage` (override per-listing) → `ServiceType.whatsappTemplate` (rendered) → builder per-collection (fallback) — 2026-08-20
- [x] Priority nomor WA: `ServiceType.whatsappNumber` → SiteSettings → siteConfig — 2026-08-20
- [x] Wire villa/tour/rental/yacht/venue/restaurant/water-activity detail — 2026-08-20
- [x] CTA/Contact block generik tetap pakai WA global (tidak punya konteks service) — by design — 2026-08-20

### Manual Test Log — Phase 3.17 (empiris, via frontend)
```
[x] Variable replacement — /villa/seaside-villa-lembongan booking button:
    "...booking *Seaside Villa Lembongan* di Lembongan. Check-in: [date]..."
    → {{serviceName}}→nama, {{destination}}→Lembongan, {{date}}→[date] ✅
[x] Custom WA number — set yachts.whatsappNumber=6280000000009 (test) →
    /yacht/ocean-serenity-catamaran booking → number=6280000000009 ✅
    (test number di-clear kembali ke null setelah verifikasi)
[x] Fallback global — service tanpa custom number (villa) → 6282386357012
    (SiteSettings) ✅
[x] 7 detail page render tanpa error (hanya HMR WebSocket dev-only)
```

### Decision Log — Phase 3.17
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Template = priority DI ATAS builder (di bawah item override) | Task minta pesan digenerate dari template CMS. Client kini kontrol pesan; builder jadi fallback kalau template kosong |
| 2026-08-20 | Variabel tak terisi → `[nama]` bukan string kosong | {{userName}}/{{date}} tak ada datanya di SSG → visitor isi sendiri di chat, konsisten dgn pola builder lama ("[isi tanggal]") |
| 2026-08-20 | CTA/Contact block generik tetap WA global | Block generik tidak punya konteks service type; WA per-service hanya relevan di detail page & landing |

---

## Phase 3.16 — Wire ServiceTypes ke Consumer (Task 3.3) ✅ DONE

Menyambungkan collection `service-types` (dibuat di 3.15) ke consumer frontend
supaya metadata yang di-edit client benar-benar reflect di situs — services
jadi "fully manageable" untuk 7 vertical tetap (bukan sekadar collection
menganggur). Semua wiring bersifat **additive/fallback** → nol regresi.

### Keputusan scope (user: "Semua di atas")
- Sambungkan: landing hero/desc/SEO, WhatsApp per-service, nav + block heading.
- Header nav TIDAK di-override (sudah pakai CMS Menu by design) → "nav" dicover
  Footer (3.15) + block heading fallback. Menghindari bentrok sistem Menu.

### 3.16.1 Block enrichment (heading/description/hero fallback) ✅ DONE
- [x] `ServiceListingBlock.astro` dispatcher — fetch `getServiceTypeByKey(serviceType)`, pass `serviceMeta` ke kedua layout — 2026-08-20
- [x] `ServiceListingHeroImmersive.astro` — heading/description fallback ke ServiceType.name/description; hero singleImage fallback ke ServiceType.coverImage — 2026-08-20
- [x] `ServiceListingEditorial.astro` — heading/description fallback sama — 2026-08-20
- [x] `ServiceGridBlock.astro` — heading fallback ke ServiceType.name — 2026-08-20
- [x] Pola: field blok = OVERRIDE (menang), ServiceType = fallback. Editor tetap bisa custom editorial copy per-blok — 2026-08-20

### 3.16.2 SEO fallback ✅ DONE
- [x] `[...slug].astro` — kalau slug page == ServiceType.slug, SEO fallback ke ServiceType.metaTitle/metaDescription (Page.seo tetap menang kalau diisi) — 2026-08-20

### 3.16.3 WhatsApp per-service ✅ DONE
- [x] `lib/serviceTypes.ts` — helper `getServiceWhatsApp(key, fallbackNumber)` → nomor dari ServiceType.whatsappNumber, fallback ke SiteSettings/siteConfig — 2026-08-20
- [x] Wire 7 detail page NEW routes: villa/tour/rental/yacht/venue/restaurant/water-activity — precedence: ServiceType.whatsappNumber → SiteSettings → siteConfig. Pesan tetap pakai per-listing builder (lebih kaya) — 2026-08-20
- [x] Legacy plural routes (accommodations/tours/dst) sengaja tidak disentuh (deprecated) — 2026-08-20

### 3.16.4 Footer (dari 3.15) — konfirmasi ulang ✅
- [x] Footer services column sudah CMS-driven via `getResolvedServiceTypes()` — 2026-08-20

### Manual Test Log — Phase 3.16
```
[x] Footer CMS-driven (dari 3.15): label "Private Yachts"/"Rentals"/"Restaurants & Dining" (cmsDriven:true)
[x] /villa landing render OK — block override heading tetap jalan, 4 cards, hero (no regresi)
[x] /villa/[slug] detail — render OK, 4 WA links, nomor fallback benar (ServiceType.whatsappNumber null → SiteSettings 6282386357012)
[x] /yacht/[slug] + /tour/[slug] detail — render OK, WA present, no page error (7 detail edits non-breaking)
[x] Semua page: hanya error HMR WebSocket (dev-only), tidak ada page/console error
```

### Batas "fully manageable" (tetap berlaku)
- ✅ Editable via CMS: label/ikon/urutan (nav+footer), SEO per-service, WA number per-service, hero cover (kalau di-upload), deskripsi (fallback)
- ⚠️ Editorial heading/description landing = block override (page-specific, sengaja tidak dipaksa dari ServiceType)
- 🔒 TETAP butuh code: tambah TIPE service baru (mis. "Spa") — path full-dynamic yang tidak dipilih

### Decision Log — Phase 3.16
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Block heading/description = override, ServiceType = fallback (tidak strip block fields) | Copy hero landing legit page-specific & lebih editorial dari label pendek nav. Strip = kehilangan polish + risiko re-persist blok serviceListing yg rapuh |
| 2026-08-20 | WA: wire NUMBER ke 7 detail page, message tetap per-listing builder | Nomor per-service = nilai utama (routing booking). Pesan builder lebih kaya (nama+destinasi) drpd template generik ServiceType |
| 2026-08-20 | Header nav tidak di-override ke ServiceTypes | Header sudah pakai CMS Menu (hand-curated). Footer + block heading sudah cukup untuk "nav services" |

---

## Phase 3.15 — ServiceTypes CMS Collection (Task 3.2) ✅ DONE

Memindahkan METADATA 7 service vertical (Tours/Villa/Water Activities/Yacht/
Restaurant/Wedding&Event/Rental) dari hardcoded `config/modules.ts` ke CMS
collection `service-types` — supaya client bisa adjust label/ikon/urutan/
deskripsi/hero/WA/SEO tanpa deploy. Scope "metadata editable" (bukan full
dynamic — 7 tipe tetap fixed, schema listing per-tipe tidak berubah).

### Task 3.1 — Investigation (arsitektur services) ✅ DONE
- [x] Konfirmasi: service TYPES hardcoded di 6 lapisan (config/modules.ts, lib/features.ts, SiteFeatures global, block serviceType select ×2, Categories.module, lib/payload getters). Service LISTINGS ada di 7 collection terpisah dgn schema per-tipe. TIDAK ada collection "Services" sebelumnya — 2026-08-19
- [x] Keputusan user: "Metadata editable (recommended)" — buat collection metadata, 7 tipe tetap fixed — 2026-08-19

### 3.15.1 CMS collection ✅ DONE
- [x] `apps/cms/src/collections/ServiceTypes.ts` — fields: name, slug (auto), key (select 7 fixed, super-admin-only, pengikat ke collection listing), status (active/draft/archived), order, description (richText), iconName (select iconOptions), coverImage (upload), whatsappNumber, whatsappTemplate, metaTitle, metaDescription. Group `Content`, useAsTitle name, defaultSort order — 2026-08-19
- [x] **Deviasi dari spec (didokumentasikan)**: `read: () => true` (public) bukan `authenticated` — WAJIB karena frontend SSG fetch tanpa auth; authenticated-only bikin fitur percuma. Access lain sesuai spec: create/delete super-admin, update admin+super-admin — 2026-08-19
- [x] **Tambahan dari spec**: field `key` (7 enum fixed) — pemetaan ke collection listing existing; tanpa ini collection jadi orphan metadata — 2026-08-19
- [x] Register di `payload.config.ts` (group Content, setelah Pages) — 2026-08-19
- [x] Tabel `service_types` dibuat via schema push (additive, nol rename ambiguity). Identifier terpanjang `service_types_hero_image_id` ~27 char (aman < 63) — 2026-08-19

### 3.15.2 Data migration ✅ DONE
- [x] `seed-service-types.ts` + script `pnpm seed:service-types` — 7 row dari modules.ts, idempotent (upsert by key). Slug diselaraskan ke landing page CMS (tour/villa/water-activity/yacht/restaurant/venue/rental) — 2026-08-19
- [x] `pnpm generate:types` — `ServiceType` interface + slug `service-types` masuk payload-types.ts — 2026-08-19

### 3.15.3 Frontend — CMS-first dengan fallback ✅ DONE
- [x] `apps/web/src/lib/payload.ts` — `getServiceTypes()` + `ServiceTypeDoc` (typed loose; status enum active/draft/archived → fetch `status:'all'` + where active) — 2026-08-19
- [x] `apps/web/src/lib/serviceTypes.ts` — resolver `getResolvedServiceTypes()` + `getServiceTypeByKey()`, CMS-first dgn fallback ke modules.ts (pola features.ts). Cache per build — 2026-08-19
- [x] `Footer.astro` services column — cascade: servicesMenu (CMS eksplisit) → ServiceTypes collection → modules.ts fallback. Bonus fix: slug service kini BENAR (/tour /villa dst; sebelumnya modules.ts salah /tours /accommodations) — 2026-08-19
- [x] **By design TETAP hardcoded**: block `serviceType` select enum (Payload select tak bisa dynamic dari collection; convert→relationship = risiko CMS 500 di embedded blocks). 7 collection listing + schema per-tipe tidak berubah — 2026-08-19

### Manual Test Log — Phase 3.15
```
[x] Seed sukses: 7 service-types created (CMS stopped, no SQLite lock conflict)
[x] API public-readable: /api/service-types return 7 docs tanpa auth (read:()=>true works)
[x] Exact resolver query (status=all + where[status]=active) → 7 docs CMS names
[x] Footer CMS-driven CONFIRMED: label "Private Yachts"/"Rentals"/"Restaurants & Dining"
    (CMS) menggantikan "Private Yacht"/"Rental Service"/"Restaurants" (modules.ts fallback)
[x] Regression: /yacht landing tetap render 5 listing cards (Footer change additive)
[x] Fallback path verified: saat CMS down, Footer jatuh ke modules.ts (tidak crash)
```

### Decision Log — Phase 3.15
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-19 | `read: () => true` (public), override spec `authenticated` | Frontend SSG fetch tanpa auth. Authenticated-only → frontend selalu fallback → fitur CMS-editable percuma. Konsisten dgn semua content collection lain |
| 2026-08-19 | Tambah field `key` (7 enum fixed, super-admin-only) | Spec tidak punya field pemetaan. Tanpa `key`, ServiceTypes = orphan metadata yg tak terhubung ke collection listing (tours/yachts/…) |
| 2026-08-19 | Block `serviceType` TETAP select enum (tidak convert ke relationship) | Payload select tak bisa dynamic dari collection lain. Convert→relationship = schema change di embedded blocks lintas banyak collection → risiko CMS 500 (yang user sangat hindari). Scope "metadata editable" tidak butuh ini |
| 2026-08-19 | Resolver CMS-first + fallback modules.ts (pola features.ts) | Preview/build tetap jalan kalau CMS kosong/unreachable. Zero-downtime migration |

**Follow-ups (Phase 4 backlog):**
- [ ] Wire lebih banyak consumer ke ServiceTypes: landing page hero/description/SEO (dari coverImage/description/metaTitle), block heading fallback ke ServiceType.name, WhatsApp per-service (whatsappNumber/whatsappTemplate)
- [ ] Upload coverImage per service type di CMS admin (saat ini null → landing pakai hero image dari block)
- [ ] iconName rentals sementara `badge` (tak ada ikon car/motor di Icon.astro) — tambah ikon kendaraan atau pilih yg lebih pas
- [ ] Manual test CMS admin: ServiceTypes muncul di group Content, admin bisa edit, field `key` read-only untuk non-super-admin

---

## Phase 3.12 — Menu Manager UX ✅ DONE

- [x] `MenuItemRowLabel.tsx` + `MenuChildRowLabel.tsx` client components — 2026-08-07
- [x] Menus.ts refactor — `initCollapsed: true` di items & children; RowLabels wired via importMap — 2026-08-07
- [x] Sub-menu (children) dapat field `type` — `page/custom_url/anchor/none` (`none` = label-only header) — 2026-08-07
- [x] Conditional fields per type; `page` relationship untuk children type `page` — 2026-08-07
- [x] Header.astro `resolveChildUrl()` + render `asSpan` branch untuk label-only child — 2026-08-07
- [x] 06-MAINTENANCE-RUNBOOK §1.5 diupdate — 2026-08-07
- [x] Report `docs/reports/phase-menu-manager-ux.md` — 2026-08-07
- [ ] Manual test admin panel + verify data lama tetap render normal — pending

---

## Phase 3.11 — Hardcoded Content Migration ✅ DONE

- [x] Global `HomepageContent` (`homepage-content`) — hero/valueProps/stats/testimonials heading/CTA — 2026-08-07
- [x] Collection `Testimonials` — name/quote/rating/location/avatar/sourceModule + status/sortOrder/isFeatured — 2026-08-07
- [x] Extend `SiteSettings.errorPages` — `notFound` + `propertyComingSoon` groups — 2026-08-07
- [x] `pages/index.astro` rewrite — 3-level cascade (Page(slug=home) → HomepageContent + Testimonials → hardcoded defaults) — 2026-08-07
- [x] `pages/404.astro` retain-with-fallback wiring — 2026-08-07
- [x] `pages/property.astro` retain-with-fallback wiring — 2026-08-07
- [x] Empty-state text 6 module index.astro digenericize (Bahasa Indonesia, dev instruksi dihapus) — 2026-08-07
- [x] `pages/demo-filter.astro` **dihapus** — 2026-08-07
- [x] Helpers: `getHomepageContent`, `getTestimonials` di `lib/payload.ts` — 2026-08-07
- [x] Docs: 03-CONTENT-MODEL §2.3, §2.5, §2.6 diupdate — 2026-08-07
- [x] Report: `docs/reports/phase-hardcoded-migration.md` — 2026-08-07
- [ ] Test manual: buat testimonial dummy di admin → rebuild → verify — pending
- [ ] Test manual: isi HomepageContent field → rebuild → verify override — pending
- [ ] Test manual: isi errorPages copy → rebuild → verify 404 + /property — pending

---

## Phase 3.10 — Footer & Utility Wiring ✅ DONE

- [x] Field baru `cloudflareWebAnalyticsToken` di `site-settings.defaultSeo` — 2026-08-07
- [x] BaseLayout wire `site-settings.favicon` → `<link rel=icon>` — 2026-08-07
- [x] BaseLayout wire `defaultSeo.metaTitle/metaDescription` sebagai fallback — 2026-08-07
- [x] BaseLayout wire `defaultSeo.ogImage` sebagai fallback OG image — 2026-08-07
- [x] BaseLayout inject GA4 gtag snippet dari `defaultSeo.googleAnalyticsId` — 2026-08-07
- [x] BaseLayout inject Cloudflare Web Analytics beacon dari `defaultSeo.cloudflareWebAnalyticsToken` — 2026-08-07
- [x] Footer render `site-settings.footer.additionalScripts` via `set:html` — 2026-08-07
- [x] Docs: 03-CONTENT-MODEL §2.9 diupdate (4 ⚠️ hilang) — 2026-08-07
- [x] Report: `docs/reports/phase-footer-cms-migration.md` — 2026-08-07
- [ ] Test manual: isi field di admin → rebuild → verify di frontend — pending

---

## Phase 3.9 — Feature Toggle CMS 🔨 IN PROGRESS

- [x] Global `SiteFeatures` (`site-features`) — modules/sections/features groups — 2026-08-07
- [x] Register di `payload.config.ts` — 2026-08-07
- [x] Access: read public, update super-admin only — 2026-08-07
- [x] `apps/web/src/lib/features.ts` — `getFeatures/isModuleEnabled/isFeatureEnabled/isSectionEnabled/enabledModulesAsync` — 2026-08-07
- [x] Footer services column pakai `enabledModulesAsync()` — 2026-08-07
- [x] WhatsAppFloating pakai `isFeatureEnabled('whatsappFloat')` — 2026-08-07
- [x] Route guards di 5 index.astro + 12 [slug].astro (rewrite/return []) — 2026-08-07
- [x] `pages/404.astro` dibuat sebagai fallback rewrite — 2026-08-07
- [x] Docs updated: 03-CONTENT-MODEL, 04-RBAC, phase report — 2026-08-07
- [ ] Regen `payload-types.ts` (butuh CMS restart di dev) — pending
- [ ] Test end-to-end di admin panel (toggle OFF → rebuild → verify 404) — pending
- [ ] Webhook rebuild trigger saat `site-features` diupdate — Phase 5

**Catatan**: Toggle change butuh rebuild frontend (SSG mode). Otomatisasi via
Cloudflare Pages build hook ada di Phase 5. Untuk sementara dev perlu manual
restart `pnpm dev`.

Report lengkap: [`docs/reports/phase-feature-toggle.md`](./reports/phase-feature-toggle.md)

---

## Phase 4 — Polish & Launch ⬜ NOT STARTED

- [ ] GSAP animations semua preset terpasang
- [ ] "Journey Path" visual signature diimplementasi
- [ ] SEO: structured data (Schema.org) per module
- [ ] Sitemap generation terverifikasi
- [ ] Meta tags dinamis per halaman
- [ ] Performance audit: Lighthouse 90+ (semua kategori)
- [ ] Mobile responsive QA — test semua breakpoint
- [ ] Cross-browser test (Chrome, Safari, Firefox)
- [ ] WhatsApp flow end-to-end test
- [ ] Accessibility check (alt text, contrast, keyboard nav)

---

## Phase 5 — Production Deploy ⬜ NOT STARTED

- [ ] Cloudflare account setup + Workers paid plan ($5/mo)
- [ ] D1 database provisioned
- [ ] R2 bucket provisioned
- [ ] CMS deployed ke Cloudflare Workers
- [ ] Super-admin user dibuat di production
- [ ] Real content di-input (bukan dummy data)
- [ ] Frontend connected ke Cloudflare Pages (GitHub auto-deploy)
- [ ] Environment variables production di-set
- [ ] Custom domain pointing (dnjourneysbali.com)
- [ ] SSL terverifikasi aktif
- [ ] Build webhook CMS → Pages terpasang
- [ ] Content webhook → auto-rebuild frontend saat CMS save (pindah dari Phase 3 — hanya bisa dites di production dgn Cloudflare Pages build hook)
- [ ] Final smoke test di production URL

---

## Phase 6 — Documentation & Template Packaging ⬜ NOT STARTED

- [ ] Update SETUP.md dengan langkah final yang sudah teruji
- [ ] Content guide untuk client (cara pakai CMS admin)
- [ ] Screenshot/video tutorial CMS usage
- [ ] Template checklist final untuk reuse ke client berikutnya
- [ ] Git tag versi template: v1.0.0

---

## Decision Log

Catatan keputusan penting yang diambil selama development,
supaya tidak perlu tanya ulang alasan di belakang keputusan.

| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-04 | Payload CMS dipilih, bukan Keystatic | Butuh RBAC multi-user + relational data untuk 7 modules |
| 2026-08-04 | Full Cloudflare (Pages + Workers) | Termurah ($5/bln), bandwidth unlimited, single ecosystem |
| 2026-08-04 | Tailwind 3.4, bukan 4.x | @astrojs/tailwind plugin belum compatible dengan v4 syntax |
| 2026-08-04 | Monorepo dengan pnpm workspace | Frontend & backend perlu deploy terpisah tapi share types |
| 2026-08-04 | CMS port 3030 (bukan default 3000) | Port 3000 dipakai proses lain saat scaffolding pertama; 3030 dipilih sebagai port tetap agar tidak konflik dengan tool lain (langganan Laragon dsb.) |
| 2026-08-04 | Frontend fonts self-hosted (latin subset variable) | Privacy (bebas Google Fonts CDN tracking) + performa (preload di BaseLayout, tanpa DNS extra ke fonts.gstatic.com) |
| 2026-08-04 | Seed script pakai `tsx` (bukan `payload run`) | `payload run` silent-exit di Windows/Node 22; tsx (~5MB devDep) transpile TS on-the-fly dengan reliable stdout |
| 2026-08-04 | Homepage index.astro punya section E2E test | Bukti koneksi frontend↔backend live; wajib DIHAPUS begitu Phase 2.2 (TourCard + listing) real content mengganti |
| 2026-08-04 | Astro dynamic route pakai `getStaticPaths()`, bukan SSR | astro.config `output: 'static'` — build-time prerender lebih murah di Cloudflare Pages (free tier); SSR baru dipertimbangkan kalau ada halaman yang perlu real-time (harga dinamis, availability) |
| 2026-08-04 | Rich-text lexical → plain text extractor sederhana (bukan lexical-to-HTML) | MVP Tour detail cukup teks (whitespace-pre-line); rendering full formatted lexical (bold/list/link) ditunda ke Phase 3 saat BlockRenderer dibuat |
| 2026-08-04 | Phase 3 — extend `lib/lexical.ts` dengan `lexicalToHtml()`, bukan install `@payloadcms/richtext-lexical/html` | Custom converter ~50 baris, tanpa dep baru (aturan AGENTS.md §11), coverage cukup: p/heading/list/link/bold/italic/underline/strike/code/blockquote/linebreak |
| 2026-08-04 | Homepage `/` pakai hybrid CMS-Page + fallback (bukan pure CMS-driven atau pure hardcoded) | (1) Editor bisa restructure via CMS Page slug='home' tanpa deploy, (2) fallback tetap render homepage bermakna kalau CMS home belum diisi, (3) reuse block components (ServiceGrid, Hero, CTA) — nol duplikasi markup |
| 2026-08-04 | Fix bug lama `fetchBySlug` (Phase 2) — `where[slug[equals]]` → nested `{slug:{equals:...}}` yg di-flatten benar | Payload silently mengabaikan filter salah dan return doc pertama published. Tersamar karena tiap collection cuma 1 published entry saat Phase 2. Ditemukan saat Step 5 homepage — getPageBySlug('home') return About page. |
| 2026-08-04 | Pindahkan item "Content webhook auto-rebuild" dari Phase 3 → Phase 5 | Butuh Cloudflare Pages build hook yang live — tidak bisa dites di lokal, jadi baru relevan saat production deploy |
| 2026-08-05 | Phase 3.5 — mapped reference color palette (teal/orange M3) ke existing token (ocean/coral/leaf/sand/stone) alih-alih adopt palette M3 penuh | Zero breaking change untuk 30+ existing Phase 2 components; visual close enough dgn reference; tokens existing sudah battle-tested |
| 2026-08-05 | Icon inline SVG per-icon (helper `Icon.astro`), bukan Material Symbols CDN | Konsisten no-CDN policy (Phase 1 decision), controllable size, ~1KB per icon acceptable. 33+ icon terdaftar; tambah per step saat needed |
| 2026-08-05 | Property page = coming-soon dedicated `property.astro` (bukan `#` no-op) | Nav link "Property" di Header berfungsi meaningful; landing yang menghubungkan visitor ke WhatsApp untuk enquiry sementara collection belum ada |
| 2026-08-05 | Component reusable baru (FilterBookingBar, WhatsAppFloating, Icon) di folder `apps/web/src/components/common/` | Folder baru — konsisten dgn existing `cards/` + `navigation/`. `common/` = utility reusable lintas-page yg bukan navigation atau card |
| 2026-08-05 | WhatsAppFloating pakai popup pattern (Intercom-style), bukan direct-to-WA button | Higher engagement — visitor lebih intentional sebelum initiate chat. Multi-option support siap dipakai kalau nanti perlu (Booking / General / Support). Backward compatible: 1 option default auto dari CMS |
| 2026-08-05 | Homepage fallback = hardcoded komposisi block (Hero+VP+3×SG+Stats+Test+CTA), bukan wajib pakai CMS Page | Sensible default kalau editor belum susun 'home' di CMS. Hybrid preserved: CMS Page 'home' published → override fallback. Zero markup duplication (100% pakai block components) |
| 2026-08-05 | 3 CMS block baru (`ValuePropsBanner`, `StatsBanner`, `TestimonialsCarousel`) — schema change ke Pages | Extend Phase 3 architecture dgn tetap CMS-driven. Editor bisa remake homepage dari admin tanpa deploy. Icon name reference lookup ke Icon.astro map |

---

## Known Issues / Tech Debt

Hal-hal yang perlu diperbaiki tapi belum urgent.

- [x] ~~Sharp belum aktif → upload gambar belum auto-resize~~ — resolved 2026-08-04 (aktif via `sharp` property di payload.config.ts)
- [x] ~~`fetchCollection()` hardcode filter `status=published`~~ — resolved 2026-08-04 (sekarang ada opsi `status: 'published' | 'draft' | 'all'`, default tetap published)
- [ ] Data pre-existing di CMS masih banyak status=draft (Kuta, Ceningan, "Kelinging Beach", kategori Tour/Accomodation/Water Activities) — publish/rename/hapus manual
- [ ] Webhook auto-rebuild belum di-setup (masih manual trigger)
- [ ] Belum ada automated testing (unit/e2e)
- [x] ~~Homepage `index.astro` masih pakai E2E test section~~ — resolved 2026-08-04 (Phase 3 Step 5: hybrid CMS Page 'home' + fallback dgn block components)
- [ ] Astro dev caching `getStaticPaths()`: setelah publish/create entry baru di CMS, harus touch file `[slug].astro` supaya path baru muncul. Production build fresh setiap deploy jadi tidak berpengaruh live.
- [ ] **Tailwind JIT cache stale saat tambah file di folder baru**: `@astrojs/tailwind` integration kadang tidak scan file baru yang berada di subfolder yang belum pernah di-scan sebelumnya (misal `components/common/` yang baru dibuat di Phase 3.5). Symptom: kelas Tailwind yang unik (belum dipakai file lain — misal `top-20`, `pl-12`, `pointer-events-none`, `peer-checked`, `md:grid-cols-3`) tidak compile → element render tanpa styling. **Fix:** `touch apps/web/tailwind.config.mjs` untuk force full rebuild. Production build (`pnpm build`) fresh setiap kali jadi tidak berpengaruh live. Setelah folder pertama kali di-scan, HMR normal berikutnya bekerja.
- [ ] Tailwind `container-page` class dipakai Header/Footer tapi tidak jelas di config — perlu audit tailwind.config.mjs vs global.css (mungkin sama dengan `container-content`)

---

## Quick Status Check Commands

```powershell
# Cek CMS jalan
cd apps/cms && pnpm dev            # → localhost:3030/admin

# Cek Frontend jalan
cd apps/web && pnpm dev            # → localhost:4321

# Seed foundation data (Destinations + Categories)
cd apps/cms && pnpm seed           # NOTE: stop `pnpm dev` dulu (SQLite lock)

# Regenerate types dari CMS ke shared package
cd apps/cms && pnpm generate:types

# Cek collections yang sudah ada di CMS
# Buka http://localhost:3030/admin

# Cek API response
curl http://localhost:3030/api/tours
curl http://localhost:3030/api/destinations
curl http://localhost:3030/api/categories
```
