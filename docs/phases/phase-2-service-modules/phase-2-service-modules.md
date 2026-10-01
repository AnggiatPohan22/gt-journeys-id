# Phase 2: Service Modules

**Status:** ✅ Complete
**Timeline:** 2026-08-04
**Depends on:** [Phase 1 — Foundation](phase-1-foundation.md)

## Tujuan

Membangun 7 modul layanan (Tours, Accommodations, Water Activities, Yacht,
Restaurants, Weddings/Venues, Rentals) end-to-end: seed data foundation, card
component, listing page, detail page (`getStaticPaths()`), dan integrasi booking
WhatsApp per-modul. Ikuti urutan workflow di WORKFLOW.md Section 2 untuk setiap module.

## Yang Dikerjakan

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

## Status Detail per Sub-task

| Sub-task | Status | Catatan |
|----------|--------|---------|
| 2.1 Destinations & Categories | ✅ | Seed idempotent, sebagian data existing masih draft |
| 2.2 Tours | ✅ | TourCard, listing, detail, WA, lexical extractor |
| 2.3 Accommodations | ✅ | Type badge, star rating, room types |
| 2.4 Water Activities | ✅ | Difficulty, duration, safety info |
| 2.5 Yacht | ✅ | Charter packages, specs |
| 2.6 Restaurants | ✅ | Price range, menu highlights, opening hours |
| 2.7 Weddings/Venues | ✅ | Packages, testimonials |
| 2.8 Rentals | ✅ | Pricing tiers hourly→monthly |

## File/Modul yang Terpengaruh

- 7 card components di `apps/web/src/components/cards/` (Tour/Accommodation/WaterActivity/Yacht/Restaurant/Venue/Rental)
- 7 listing + 7 detail routes (plural, `getStaticPaths()`) — kemudian dikonsolidasi ke singular di [Phase 3.20](phase-3.20-service-listing-fixes.md)
- `apps/web/src/lib/lexical.ts`, `fetchCollection<T>()` generics
- WhatsApp message builders per-modul

## Yang Masih Pending / Bisa Di-improve

- Data pre-existing masih banyak `status=draft` (Kuta, Ceningan, "Kelinging Beach",
  kategori Tour/Accomodation/Water Activities) — perlu publish/rename/hapus manual.
- Rute plural (`/tours`, `/accommodations`, dst) kemudian di-deprecate → singular
  canonical di Phase 3.20.

## Related Reports

- [hardcoded-pages-audit.md](../reports/hardcoded-pages-audit.md) — audit route frontend vs CMS
