# Phase 3: CMS-Driven Features & Dynamic Content

**Status:** ✅ Code Complete · 🔨 sebagian sub-phase punya manual test / data-apply pending
**Timeline:** 2026-08-04 → 2026-08-08
**Depends on:** [Phase 2 — Service Modules](phase-2-service-modules.md)

## Tujuan

Mengubah situs dari halaman berbasis kode menjadi **CMS-driven**: block system
(BlockRenderer + 14+ block), dynamic pages dari collection Pages, Header/Footer dari
CMS, homepage hybrid, service landing pages, feature toggle, dan migrasi konten
hardcoded ke CMS. Fase ini mencakup sub-phase 3.0 (core) sampai 3.13.

> **Catatan status:** Beberapa sub-phase ditandai "🔨 IN PROGRESS" di log asli
> karena menyisakan **manual test browser** atau **restart CMS** yang tidak bisa
> dilakukan otomatis oleh agent — bukan karena kode belum selesai. Kode semua
> sub-phase di bawah sudah selesai.

## Status Detail per Sub-task

| Sub-task | Status | Catatan |
|----------|--------|---------|
| 3.0 Core (BlockRenderer, dynamic pages, Header/Footer CMS, homepage) | ✅ | Manual test PASS lengkap |
| 3.5 Reference Layout Implementation | ✅ | 5 fixed components + home 8-section |
| 3.6 Block System Enhancement | ✅ code | Media/text-style/advanced-style ke semua block |
| 3.7 Service Landing Pages | ✅ code | 7 collection restructure + singular detail routes; 2 manual test /villa pending |
| 3.8 Header & Footer CMS Sync | ✅ | Global HeaderSettings + FooterSettings |
| 3.9 Feature Toggle CMS | ✅ code | Regen types + E2E toggle test pending (butuh restart) |
| 3.10 Footer & Utility Wiring | ✅ | Analytics/favicon/OG fallback; manual verify pending |
| 3.11 Hardcoded Content Migration | ✅ | HomepageContent + Testimonials + errorPages; manual verify pending |
| 3.12 Menu Manager UX | ✅ | RowLabel + sub-menu type; manual test pending |
| 3.13 ServiceListing Template 2 (Hero Immersive) | ✅ code | 5 visual/manual test pending |

---

## Phase 3.0 — CMS Features & Dynamic Content ✅ DONE

- [x] BlockRenderer.astro + 11 block components (Hero, RichText, Image, Gallery, CTA, FAQ, Testimonials, ServiceGrid, Contact, Embed, Spacer) — 2026-08-04
- [x] Dynamic pages `[...slug].astro` (catch-all, `getStaticPaths()` fetch semua published Pages) — 2026-08-04
- [x] Header navigation dari CMS (`getMenuBySlug('main-navigation')` dengan support nested `children` dropdown) — 2026-08-04
- [x] Footer dari CMS SiteSettings (siteName, tagline, contact, social, copyright) — 2026-08-04
- [x] Global settings terpasang di semua halaman via `getSiteSettings()` di Header+Footer (dipakai PageLayout) — 2026-08-04
- [x] Homepage full build (hybrid: CMS Page slug='home' → fallback ke Hero + 3× ServiceGrid + CTA) — 2026-08-04
- [x] **Bonus fix (retroactive):** `fetchBySlug()` bug lama — key `where[slug[equals]]` (bracket bersarang salah) → `where[slug][equals]` (nested where object). Sebelumnya detail pages diam-diam return doc pertama yang published (bukan yg match slug); tersamar karena tiap collection cuma 1 published — 2026-08-04
- [x] `lexicalToHtml()` helper — render richText dengan formatting (paragraph, heading, list, link, bold/italic/underline/strike/code, blockquote) — 2026-08-04

### Manual Test Log — Phase 3.0 (semua PASS)

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
  [x] Header: siteName "DnJourneysBali - by Giattech" (dari CMS, bukan hardcoded)
  [x] Header nav items: Home / About Us / Tours / Contact (dari menu 'main-navigation' CMS)
  [x] Header "Book Now" pakai wa.me/6282386357012 (dari CMS)
  [x] Footer contact: example@giattech.com, 082386357012, "Nusa Ceningan - Bali" (dari CMS)
  [x] Footer social: Instagram/Facebook/TikTok icons render dengan URL auto-normalisasi dari bare handles CMS
  [x] Footer copyright "Created by Giattech" (dari CMS)
  [x] User konfirmasi manual: ganti siteName di CMS → refresh browser → Header+Footer ikut berubah

Step 5 — Homepage Full Build
  [x] / (homepage) → HTTP 200
  [x] Title "DnJourneysBali - by Giattech" (dari CMS siteName)
  [x] E2E test section dari Phase 1 SUDAH DIHAPUS (grep "Sync Test", "CMS Connected", "Sample Tour Fetched" → 0 match)
  [x] Sections tampil berurutan: Hero → Featured Tours → Where to Stay → On the Water → CTA → Chat on WhatsApp
  [x] Semua data dari CMS
  [x] Regression check: /about, /tours/…, /accommodations/… tetap render benar (bukan cross-slug leak)
```

**Manual test browser-only (perlu dilakukan owner):**
```
[ ] Visual layout Hero section (overlay, typography, CTA) di http://localhost:4321/
[ ] Resize mobile ~375px → grid collapse, hamburger muncul, footer stack
[ ] Klik "Book Now" / "Chat on WhatsApp" → open WhatsApp 6282386357012
[ ] Buat/publish Page baru di CMS (slug bebas) → akses langsung → render via BlockRenderer
```

---

## Phase 3.5 — Reference Layout Implementation ✅ DONE

Menerapkan reference desain (`ai/reference/home/`) ke komponen fixed/reusable
sebelum masuk Phase 4, agar animasi & polish tidak perlu rework kalau layout berubah.

**Catatan scope:** User menyebutkan akan ada halaman baru "Property & Land for Sale"
di luar 7 service modules awal. Collection CMS-nya belum dibuat (future scope).
Sementara `/property` = coming-soon page minimal supaya nav "Property" tidak 404.

Urutan halaman yang direncanakan (referensi): Home, About, Tour, Villa, Water
Activities, Private Yacht, Restaurant, Wedding & Event Services, Property & Land
for Sale, Contact.

### 3.5.1 Fixed/Reusable Components ✅ DONE
- [x] Header — reference diterapkan, mapped tokens (ocean/coral), CTA pill "WhatsApp Booking", mobile drawer + JS toggle (ESC/outside-click/link close, matchMedia auto-close) — 2026-08-05
- [x] Footer — reference diterapkan, bg ocean, 4-col grid, contact icons via Icon component, social wrapped bulat, "Designed with ♥ in Bali" tagline — 2026-08-05
- [x] `apps/web/src/components/common/Icon.astro` — helper icon lookup (33+ icon SVG map, no CDN, replaces Material Symbols) — 2026-08-05
- [x] Filter & Booking Floating — `apps/web/src/components/common/FilterBookingBar.astro` reusable, sticky-top, destination tabs (radio+peer, no JS), booking search inputs (native form GET), preview di `/demo-filter` — 2026-08-05
- [x] CTA Floating (WhatsApp) — `apps/web/src/components/common/WhatsAppFloating.astro` popup pattern (Intercom-style). Data cascade CMS-first. Icon brand WA asli — 2026-08-05

### 3.5.2 Home Page ✅ DONE
- [x] Layout Home diterapkan sesuai reference (8 sections: Hero + ValuePropsBanner overlap + 3× ServiceGrid + StatsBanner + TestimonialsCarousel + CTA) — 2026-08-05
- [x] 3 CMS block baru di `apps/cms/src/blocks/index.ts`: `ValuePropsBanner`, `StatsBanner`, `TestimonialsCarousel` — 2026-08-05
- [x] Types regen via `pnpm generate:types` — 2026-08-05
- [x] 3 frontend block components di `apps/web/src/components/blocks/` — 2026-08-05
- [x] BlockRenderer register 3 block baru — 2026-08-05
- [x] `apps/web/src/pages/index.astro` restructure fallback: preserve hybrid CMS Page 'home' + fallback komposisi block sesuai reference — 2026-08-05

### 3.5.3 Coming Soon Page ✅ DONE
- [x] `apps/web/src/pages/property.astro` — coming-soon minimal, WA Enquire button pakai CMS whatsapp number — 2026-08-05

### Manual Test Log — Phase 3.5 (semua PASS)

```
Step 2 — Header
  [x] Render CMS data (siteName, nav, WA number); active state; fallback siteConfig;
      mobile drawer toggle (open/close/ESC/outside/resize); konsisten di 2 halaman; Icon via component
Step 3 — Footer
  [x] Bg ocean; 4-col grid; contact icons; social auto-normalize; brand SVG preserved; copyright tagline
Step 4 — Filter & Booking Floating
  [x] /demo-filter 2 config; sticky top-20 z-30; radio+peer tabs; form GET; reusable via props
  [x] Bug fix: Tailwind JIT cache stale untuk file folder baru → touch config
Step 5 — WhatsApp Floating
  [x] Toggle 56px bottom-right; popup panel; option card; auto-generate dari CMS greeting;
      interactive close; icon konsisten 4 tempat; no close-X (per user)
  [x] Bug fix: CSS transition opacity stuck di preview → no-transition (snap reliable)
Step 6 — Home Full Layout
  [x] 3 block baru terdaftar + types regen; BlockRenderer cover 14 block types
  [x] Homepage 200 dgn 8 section render; regression /about /tours /demo-filter /property tetap 200
```

---

## Phase 3.6 — Block System Enhancement ✅ (code)

Memperkaya block system dengan opsi media flexible, rich text formatting, dan
advanced styling (background/button/animasi), plus compact CMS UI pakai tabs.
**Strategi:** pilot di Hero block dulu, baru batch ke block lain.

### 3.6.1 Reusable Field Groups (Foundation) ✅ DONE
- [x] fields/media.ts — mediaType branching (single/multiple/video/none), video URL/upload + poster fallback, transition preset + interval, lazyLoad — 2026-08-05
- [x] fields/advancedStyle.ts — sectionPadding, background (default/color/image + overlay), button (variant/color/textColor/radius/hoverAnimation) — sinkron design tokens — 2026-08-05
- [x] Lexical features diaktifkan: Paragraph, Heading(h2-h4), Bold/Italic/Underline/Strike/Sub/Sup/InlineCode, Align/Indent, UL/OL, Link/Upload/Relationship, Blockquote/HR, toolbars, TextStateFeature (5 design tokens) — 2026-08-05

### 3.6.2 Pilot: Hero Block ✅ DONE
- [x] Hero block direstructure pakai `type: 'tabs'` (Content / Media / Advanced) + reusable field groups — 2026-08-05
- [x] Legacy fields `backgroundImage` + `overlayOpacity` di-preserve sebagai hidden (schema additive) — 2026-08-05
- [x] HeroBlock.astro update lengkap: mediaType branching render, Advanced styling, section padding preset — 2026-08-05
- [x] Homepage fallback config diperbarui pakai schema baru — 2026-08-05
- [x] Backward compat: existing Hero data tetap tersimpan (hidden legacy field); frontend fallback safe — 2026-08-05
- [x] DB migration recovery: dropped stale `pages_blocks_hero*` tables setelah Drizzle sempat corrupt schema push (rename ambiguity) — Payload recreate fresh saat restart — 2026-08-05

### 3.6.3 Batch Rollout — Media-relevant blocks ✅ DONE
- [x] Image block — tabs Content/Advanced, aspectRatio + imageFit + imagePosition, advancedStyleFieldsNoButton — 2026-08-06
- [x] Gallery block — tabs Content/Advanced, per-image fit+position, layout+columns di-`row` — 2026-08-06
- [x] CTA block — tabs Content/Media/Advanced, mediaLayout (background/left/right/above/below), advancedStyleFields, legacy `style` preserved hidden — 2026-08-06
- [x] Shared helper `apps/web/src/lib/blockStyles.ts` — resolver fit/pos/align/container/padding/entry/bg/button — 2026-08-06
- [x] `advancedStyleFieldsNoButton` variant export — 2026-08-06
- [x] `buildFitPositionRow()` + `imageFitOptions`/`imagePositionOptions` export dari media.ts — 2026-08-06

### 3.6.3.1 Text Style + Slider AutoStart + CTA Templates + Gallery Lightbox ✅ DONE
- [x] `apps/cms/src/fields/textStyle.ts` — `buildTextStyleField(elements)` per-element color + animIn — 2026-08-06
- [x] `apps/web/src/lib/blockStyles.ts` — `resolveTextColor` + `resolveTextAnimIn` — 2026-08-06
- [x] `apps/web/src/styles/global.css` — text-anim-* keyframes (reduced-motion aware) — 2026-08-06
- [x] `sliderAutoStart` checkbox di mediaFields — Hero slider trigger first transition on load — 2026-08-06
- [x] Hero: buildTextStyleField(['heading','subheading']) + sliderAutoStart wired — 2026-08-06
- [x] Image: buildTextStyleField(['caption']) — 2026-08-06
- [x] Gallery: desktopColumns/tabletColumns/mobileColumns, enableLightbox, hoverEffect, buildTextStyleField(['caption']). Lightbox modal built-in (prev/next, ESC/arrow, backdrop close). Legacy `columns` preserved hidden — 2026-08-06
- [x] CTA: buildTextStyleField(['heading','description']) + 2 mediaLayout templates: `scrolling-columns`, `dual-frames` — 2026-08-06

### 3.6.4 Batch Rollout — Text & sisanya ✅ DONE
- [x] RichText — tabs Content/Advanced + advancedStyleFieldsNoButton + buildTextStyleField(['paragraph']). Legacy `alignment` hidden — 2026-08-06
- [x] FAQ — tabs + buildTextStyleField(['heading','quote']) — 2026-08-06
- [x] Testimonials — tabs + buildTextStyleField(['heading','quote']). Default bg-sand — 2026-08-06
- [x] ServiceGrid — tabs + buildTextStyleField(['heading']). Limit + featuredOnly di-row — 2026-08-06
- [x] Contact — tabs + buildTextStyleField(['paragraph']). showMap+showWhatsApp di-row — 2026-08-06
- [x] ValuePropsBanner — tabs + buildTextStyleField(['label','subheading']). Overlap (-mt-16) tetap — 2026-08-06
- [x] StatsBanner — tabs, Advanced TANPA background group (hindari kolom bentrok) + buildTextStyleField(['eyebrow','heading','label','caption']) — 2026-08-06
- [x] TestimonialsCarousel — tabs + buildTextStyleField(['eyebrow','heading','quote']) — 2026-08-06
- [x] Embed, Spacer — skip sesuai plan (sudah cukup simple)

---

## Phase 3.7 — Service Landing Pages ✅ (code) · 🔨 2 manual test /villa pending

Halaman filter+search per service module dgn destination pills, editorial featured
card, listing grid, concierge/trust section. Reference: `ai/reference/villa/code.html`.
Fase ini merestrukturisasi 7 collection ke tab-based CMS UI + membuat rute detail
**singular** (`/villa/[slug]`, `/tour/[slug]`, dst) yang mirror layout villa.

### 3.7.0 CMS-driven service landing blocks ✅ DONE
- [x] `ServiceListing` block — heading + destination filter tabs + search bar + featured editorial + grid. Auto-fetch per serviceType. Client-side filter. Featured mode auto/none — 2026-08-06
- [x] `TrustBadges` block — 2-col concierge (text+buttons+badge grid), min 2 max 8 badges — 2026-08-06
- [x] Frontend: `ServiceListingBlock.astro`, `TrustBadgesBlock.astro`; register di BlockRenderer — 2026-08-06
- [x] `seed-villa-page.ts` — idempotent seed CMS Page slug='villa' (ServiceListing accommodations + TrustBadges) — 2026-08-06

### 3.7.1 Villa (pilot) ✅ DONE
- [x] Villa listing = CMS Page slug='villa' dgn ServiceListing + TrustBadges — 2026-08-06
- [x] `apps/web/src/pages/villa/[slug].astro` — hero bento gallery, 12-col layout (8 detail + 4 sticky booking), quick specs 4-card, amenities grid, location map embed, room types, sticky booking sidebar, recommended alternatives 3-card — 2026-08-06
- [x] `AccommodationCard` prop `hrefBase` (default `/accommodations`, ServiceListing pass `/villa`) — 2026-08-06
- [x] `ServiceListingBlock` detailRouteMap accommodations → `/villa` — 2026-08-06
- [x] Filter type villa/hotel/resort di getStaticPaths — guesthouse tetap di /accommodations legacy — 2026-08-06
- [x] `apps/web/src/pages/villa/index.astro` — editorial heading, destination pills, search bar, featured editorial card, listings grid, concierge/trust, client-side JS filter — 2026-08-06
- [x] `apps/cms/src/scripts/add-menu-item.ts` — idempotent tambah "Villa" ke main-navigation — 2026-08-06
- [ ] Manual test: buka /villa, verify filter pill, search, featured card, mobile responsive — **pending**
- [ ] Run add-menu-item script → verify nav "Villa" muncul di Header — **pending**

### 3.7.1.1 Accommodations CMS restructure ✅ DONE
- [x] `Accommodations.ts` restructure jadi 7 tabs: Overview / Media / Amenities & Highlights / Rooms & Pricing / Location & Experiences / Policies / Booking — 2026-08-06
- [x] Field baru: `subtitle`, `highlightTags[]`, `nearbyLandmarks[]` ({name, distance}), `curatedExperiences[]` — 2026-08-06
- [x] Row-kan field untuk kompaktkan admin UI (type+starRating, destination+category, bedType+maxGuests, dst) — 2026-08-06
- [x] Villa/[slug] konsumsi field baru (subtitle, highlightTags, nearbyLandmarks, curatedExperiences, policies, check-in/out) — 2026-08-06

### 3.7.1.2 Accommodations quickSpecs + icon picker + super-admin blocks ✅ DONE
- [x] `apps/cms/src/fields/iconOptions.ts` — shared icon options (~32 icons) dgn emoji hint — 2026-08-06
- [x] `quickSpecs` array (max 4) di tab "Quick Specs" — iconName/label/subtitle; CMS override else auto-derive — 2026-08-06
- [x] `amenities.icon` text → select pakai iconOptions — 2026-08-06
- [x] `additionalBlocks` (type: blocks) di tab "🔒 Custom Sections" — full 16 block, field-level `update: superAdminFieldAccess` — 2026-08-06
- [x] Frontend villa/[slug]: render CMS quickSpecs else fallback derived; BlockRenderer untuk additionalBlocks — 2026-08-06

### 3.7.2 Tour CMS restructure ✅ DONE
- [x] `Tours.ts` restructure jadi 9 tabs: Overview / Media / Quick Specs / Highlights & Meeting / Itinerary / Includes & Info / Pricing / 🔒 Custom Sections / Booking — 2026-08-06
- [x] Field baru: `meetingPoint`, `pickupService`, `additionalInfo` richText, `itinerary[].iconName` — 2026-08-06
- [x] Reuse pricingFields, subtitle, highlights, includes, excludes; `additionalBlocks` super-admin; `quickSpecs` — 2026-08-06
- [x] Frontend `/tour/[slug]` mirror `/villa/[slug]`: hero bento, 12-col, quick specs, highlights, itinerary timeline, includes/excludes, meeting point + pickup, additional info, sidebar booking, additionalBlocks, recommended tours — 2026-08-06

### 3.7.3 Rental CMS restructure ✅ DONE
- [x] `Rentals.ts` restructure jadi 8 tabs: Overview / Media / Quick Specs / Specifications / Includes & Requirements / Pricing Tiers / 🔒 Custom Sections / Booking — 2026-08-06
- [x] Field baru: `subtitle`, `features` array (name+icon), `quickSpecs`, `additionalBlocks` — 2026-08-06
- [x] `rentalType` labels dpt emoji hint; specs group row; pricing tiers row — 2026-08-06
- [x] Frontend `/rental/[slug]` mirror villa: hero bento, 12-col, quick specs, specifications, includes, pricing tiers, requirements, sidebar booking, additionalBlocks, recommended — 2026-08-06
- [x] `TourCard` + `RentalCard` prop `hrefBase`; ServiceGrid + ServiceListing pass `/tour` `/rental`; detailRouteMap tours→/tour, rentals→/rental — 2026-08-06

### 3.7.4 WaterActivities + Yachts + Restaurants + Venues rollout ✅ DONE
- [x] `WaterActivities.ts` — 8 tabs; field baru subtitle, quickSpecs, whatToBring[].icon; additionalBlocks filter (prefix panjang) — 2026-08-07
- [x] `Yachts.ts` — 9 tabs; subtitle, quickSpecs, amenities.icon, additionalBlocks full — 2026-08-07
- [x] `Restaurants.ts` — 8 tabs; subtitle, quickSpecs, features, cuisine emoji, additionalBlocks filter — 2026-08-07
- [x] `Venues.ts` — 10 tabs; subtitle, quickSpecs, features, additionalBlocks full — 2026-08-07
- [x] `seed-landing-pages.ts` extended: water-activity, yacht, restaurant, venue (ServiceListing + TrustBadges + nav item) — 2026-08-07
- [x] Frontend `/water-activity/[slug]`, `/yacht/[slug]`, `/restaurant/[slug]`, `/venue/[slug]` — mirror villa layout per niche — 2026-08-07
- [x] Card hrefBase prop (WaterActivity/Yacht/Restaurant/Venue); ServiceGrid + ServiceListing detailRouteMap + hrefBase update ke singular — 2026-08-07

---

## Phase 3.8 — Header & Footer CMS Sync ✅ DONE

Gap ditemukan (investigasi 2026-08-07): Header 80% CMS-driven, Footer 60%. Yang
masih hardcoded: Header CTA button text, Footer Quick Links column. Setup Global
baru "Header Settings" + "Footer Settings" (grup System) untuk kontrol struktural.
Kontak/social/copyright TETAP di SiteSettings (tidak duplikasi).

### 3.8.1 CMS — Global Settings Baru ✅ DONE
- [x] `HeaderSettings.ts` — primaryMenu relationship, showCtaButton, ctaText, ctaType, ctaCustomLink (conditional), stickyOnScroll, transparentOnTop. Grup System, super-admin only — 2026-08-07
- [x] `FooterSettings.ts` — columns array (columnLabel + menu relationship, max 4). Grup System, super-admin only — 2026-08-07
- [x] Registrasi kedua global di payload.config.ts — 2026-08-07

### 3.8.2 Seed Data ✅ DONE
- [x] `seed-header-footer.ts` — idempotent create menu `footer-quick-links` + set HeaderSettings/FooterSettings defaults — 2026-08-07

### 3.8.3 Frontend — Sync ✅ DONE
- [x] `apps/web/src/lib/payload.ts` — `getHeaderSettings()` + `getFooterSettings()` — 2026-08-07
- [x] Header.astro — fetch HeaderSettings, resolve primaryMenu.slug, CTA config-driven, transparent behavior cascade — 2026-08-07
- [x] Footer.astro — fetch FooterSettings + loop menus per column, fallback hardcoded Quick Links kalau kosong. Services column tetap dari `enabledModules()` — 2026-08-07
- [x] **Fix**: Menu items tidak sync (root cause: `getMenuBySlug()` filter `status=published`, tapi Menus pakai enum `active/inactive` → mismatch → null → fallback). Fix Opsi A: konsumsi `primaryMenu.items` / `columns[].menu.items` yang sudah ter-populate dari global fetch, hilangkan double-fetch — 2026-08-07

### Decision Log — Phase 3.8
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-07 | Header/Footer Settings TIDAK duplikasi contact/social/copyright | Single source of truth: SiteSettings. HeaderSettings hanya struktural (menu + CTA); FooterSettings hanya kolom menu ekstra |
| 2026-08-07 | Services column Footer tetap dari `enabledModules()` config | User decision. Services = struktur produk (per-toggle), bukan editorial menu. Zero duplikasi |
| 2026-08-07 | Footer fallback hardcoded Quick Links kalau columns kosong | Safety net; hilang otomatis begitu editor tambah ≥1 column |
| 2026-08-07 | Konsumsi relationship menu dari global response langsung | Payload sudah populate relationship. Re-fetch redundan + expose bug status filter mismatch |

---

## Phase 3.9 — Feature Toggle CMS ✅ (code) · 🔨 regen types + E2E pending

- [x] Global `SiteFeatures` (`site-features`) — modules/sections/features groups — 2026-08-07
- [x] Register di `payload.config.ts` — 2026-08-07
- [x] Access: read public, update super-admin only — 2026-08-07
- [x] `apps/web/src/lib/features.ts` — `getFeatures/isModuleEnabled/isFeatureEnabled/isSectionEnabled/enabledModulesAsync` — 2026-08-07
- [x] Footer services column pakai `enabledModulesAsync()` — 2026-08-07
- [x] WhatsAppFloating pakai `isFeatureEnabled('whatsappFloat')` — 2026-08-07
- [x] Route guards di 5 index.astro + 12 [slug].astro (rewrite/return []) — 2026-08-07
- [x] `pages/404.astro` dibuat sebagai fallback rewrite — 2026-08-07
- [x] Docs updated: 03-CONTENT-MODEL, 04-RBAC, phase report — 2026-08-07
- [ ] Regen `payload-types.ts` (butuh CMS restart di dev) — **pending**
- [ ] Test end-to-end di admin panel (toggle OFF → rebuild → verify 404) — **pending**
- [ ] Webhook rebuild trigger saat `site-features` diupdate — **Phase 5**

**Catatan**: Toggle change butuh rebuild frontend (SSG mode). Otomatisasi via
Cloudflare Pages build hook ada di Phase 5.

Report lengkap: [`phase-feature-toggle.md`](../reports/phase-feature-toggle.md)

---

## Phase 3.10 — Footer & Utility Wiring ✅ DONE

- [x] Field baru `cloudflareWebAnalyticsToken` di `site-settings.defaultSeo` — 2026-08-07
- [x] BaseLayout wire `site-settings.favicon` → `<link rel=icon>` — 2026-08-07
- [x] BaseLayout wire `defaultSeo.metaTitle/metaDescription` fallback — 2026-08-07
- [x] BaseLayout wire `defaultSeo.ogImage` fallback OG image — 2026-08-07
- [x] BaseLayout inject GA4 gtag dari `defaultSeo.googleAnalyticsId` — 2026-08-07
- [x] BaseLayout inject Cloudflare Web Analytics beacon — 2026-08-07
- [x] Footer render `site-settings.footer.additionalScripts` via `set:html` — 2026-08-07
- [x] Docs: 03-CONTENT-MODEL §2.9 diupdate — 2026-08-07
- [x] Report: `phase-footer-cms-migration.md` — 2026-08-07
- [ ] Test manual: isi field di admin → rebuild → verify di frontend — **pending**

Report lengkap: [`phase-footer-cms-migration.md`](../reports/phase-footer-cms-migration.md)

---

## Phase 3.11 — Hardcoded Content Migration ✅ DONE

- [x] Global `HomepageContent` — hero/valueProps/stats/testimonials heading/CTA — 2026-08-07
- [x] Collection `Testimonials` — name/quote/rating/location/avatar/sourceModule + status/sortOrder/isFeatured — 2026-08-07
- [x] Extend `SiteSettings.errorPages` — `notFound` + `propertyComingSoon` groups — 2026-08-07
- [x] `pages/index.astro` rewrite — 3-level cascade (Page(slug=home) → HomepageContent + Testimonials → hardcoded defaults) — 2026-08-07
- [x] `pages/404.astro` + `pages/property.astro` retain-with-fallback wiring — 2026-08-07
- [x] Empty-state text 6 module index.astro digenericize (dev instruksi dihapus) — 2026-08-07
- [x] `pages/demo-filter.astro` **dihapus** — 2026-08-07
- [x] Helpers: `getHomepageContent`, `getTestimonials` di `lib/payload.ts` — 2026-08-07
- [x] Docs: 03-CONTENT-MODEL §2.3, §2.5, §2.6 diupdate — 2026-08-07
- [x] Report: `phase-hardcoded-migration.md` — 2026-08-07
- [ ] Test manual: testimonial dummy → rebuild → verify — **pending**
- [ ] Test manual: isi HomepageContent → rebuild → verify override — **pending**
- [ ] Test manual: isi errorPages copy → rebuild → verify 404 + /property — **pending**

Report lengkap: [`phase-hardcoded-migration.md`](../reports/phase-hardcoded-migration.md)

---

## Phase 3.12 — Menu Manager UX ✅ DONE

- [x] `MenuItemRowLabel.tsx` + `MenuChildRowLabel.tsx` client components — 2026-08-07
- [x] Menus.ts refactor — `initCollapsed: true`; RowLabels wired via importMap — 2026-08-07
- [x] Sub-menu (children) dapat field `type` — `page/custom_url/anchor/none` (`none` = label-only header) — 2026-08-07
- [x] Conditional fields per type; `page` relationship untuk children type `page` — 2026-08-07
- [x] Header.astro `resolveChildUrl()` + render `asSpan` branch untuk label-only child — 2026-08-07
- [x] 06-MAINTENANCE-RUNBOOK §1.5 diupdate — 2026-08-07
- [x] Report `phase-menu-manager-ux.md` — 2026-08-07
- [ ] Manual test admin panel + verify data lama tetap render normal — **pending**

Report lengkap: [`phase-menu-manager-ux.md`](../reports/phase-menu-manager-ux.md)

---

## Phase 3.13 — ServiceListing Template 2 (Hero Immersive) ✅ (code) · 🔨 visual test pending

Menambahkan opsi layout kedua ke block `ServiceListing`: **Hero Immersive** (hero
image/video background + floating filter tabs + search bar di dalam hero, cards
style "detailed"). Layout existing tetap **Editorial Featured** (default) dan tidak
berubah.

### Approach
- **CMS**: field `layout` (select) di atas tabs, super-admin only. Field additive lain opsional + default aman.
- **Frontend**: split 3 file — dispatcher tipis + `ServiceListingEditorial.astro` (verbatim) + `ServiceListingHeroImmersive.astro` (baru). Split = regression Template 1 nol.
- **Cards**: 7 card diberi prop `variant?: 'compact' | 'detailed'`. Default compact. `detailed` delegate ke shared `DetailedCard.astro`.

### 3.13.1 CMS Block Config ✅ DONE
- [x] `layout` field super-admin only di ServiceListing block — 2026-08-08
- [x] Tab "Hero" (conditional layout=hero-immersive) — heroBackground group — 2026-08-08
- [x] Tab "Filter & Search" diperluas — showDatePicker, showGuestCount, searchButtonText — 2026-08-08
- [x] Tab "Card Style" — cardVariant, showLoadMore + loadMoreText + initialVisibleCount — 2026-08-08

### 3.13.2 Frontend Split ✅ DONE
- [x] `ServiceListingBlock.astro` dispatcher (~15 lines) — 2026-08-08
- [x] `ServiceListingEditorial.astro` = markup existing verbatim + variant pass-through + Load More — 2026-08-08
- [x] `ServiceListingHeroImmersive.astro` baru — hero bg (YouTube/Vimeo/file/image), floating pills + search, cards detailed — 2026-08-08
- [x] Editorial JS query id prefix `sl-` (Hero Immersive `slh-`) — 2026-08-08

### 3.13.3 Detailed Card Variant ✅ DONE
- [x] `DetailedCard.astro` shared (multi-image slider + dots, badge, eyebrow, title + rating, description clamp, amenity pills, price + Book Now) — 2026-08-08
- [x] 7 card diextend prop `variant` (additive, default compact) — 2026-08-08

### Decision Log — Phase 3.13
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-08 | Split frontend jadi 3 file | Struktur Hero Immersive fundamental beda; 1-file ~700+ baris sulit review. Split = regression Template 1 zero-risk |
| 2026-08-08 | `DetailedCard.astro` shared (7 adapter) | Duplikasi 7 card = 500+ baris redundant. Adapter normalize data → delegate |
| 2026-08-08 | Search/filter + Load More = VISUAL ONLY | Per instruksi user. Destination + name search functional; date/guest = placeholder; Load More reveal (belum pagination fetch) |
| 2026-08-08 | Hero Immersive default `cardVariant='detailed'` | Reference selalu detailed; editor override compact tetap dihormati |
| 2026-08-08 | Field-level `superAdminFieldAccess` untuk `layout` | Editor/Admin tetap edit konten & blocks; hanya `layout` read-only |

### Fixes & Enhancements — Phase 3.13
- [x] Fix: unified frame untuk destination tabs + search bar (satu card, sesuai reference) — 2026-08-08
- [x] Enhancement: CMS-controlled pagination — `paginationType` (load-more / pages) di Card Style, kedua template support — 2026-08-08
- [x] Enhancement: pagination ke 3 block lain — Testimonials, TestimonialsCarousel, ServiceGrid (`paginate`/`pageMode`/`pageSize`/`moreText`) — 2026-08-08
- [x] Fix: scroll position saat ganti page (5 komponen scroll ke top grid + offset 100px) — 2026-08-08
- [x] Enhancement: mobile responsive pagination — horizontal swipeable row (scroll-snap) <768px, 5 komponen — 2026-08-08

### Manual Test Log — Phase 3.13
- [x] `pnpm astro sync` sukses — types + imports valid
- [ ] CMS admin: field `layout` muncul, super-admin switch, editor read-only — **pending**
- [ ] Conditional tabs (Hero) hanya muncul saat layout=hero-immersive — **pending**
- [ ] Regression: block ServiceListing existing render identik — **pending**
- [ ] Template 2 visual vs `template2-target.png` — **pending**
- [ ] Multi-instance: 2 ServiceListing block di 1 halaman — **pending**

---

## Yang Masih Pending / Bisa Di-improve (Phase 3 keseluruhan)

- **Manual test browser & admin-login** di 3.0, 3.7.1, 3.9, 3.10, 3.11, 3.12, 3.13 —
  butuh interaksi visual / login CMS yang tidak bisa dilakukan agent otomatis.
- **Regen `payload-types.ts`** (3.9) — butuh CMS restart di dev.
- **Webhook auto-rebuild** saat `site-features` berubah — di-defer ke Phase 5.
- Konsolidasi rute plural→singular diselesaikan di [Phase 3.20](phase-3.20-service-listing-fixes.md).

## File/Modul yang Terpengaruh

- `apps/cms/src/blocks/index.ts` (14+ block), `apps/cms/src/fields/*` (media, advancedStyle, textStyle, iconOptions), 7 collection restructure (tabs)
- Globals: `HeaderSettings`, `FooterSettings`, `SiteFeatures`, `HomepageContent`; collection `Testimonials`
- `apps/web/src/components/blocks/*`, `cards/*` (variant), `common/*` (Icon, WhatsAppFloating, FilterBookingBar, DetailedCard)
- `apps/web/src/lib/*` (payload, features, blockStyles, lexical), `BlockRenderer.astro`, `[...slug].astro`, singular detail routes
- Seed scripts: villa-page, landing-pages, header-footer

## Related Reports

- [phase-feature-toggle.md](../reports/phase-feature-toggle.md) (3.9)
- [phase-footer-cms-migration.md](../reports/phase-footer-cms-migration.md) (3.10)
- [phase-hardcoded-migration.md](../reports/phase-hardcoded-migration.md) (3.11)
- [phase-menu-manager-ux.md](../reports/phase-menu-manager-ux.md) (3.12)
