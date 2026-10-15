# Phase 4.18 — Service Content Tabs V2 (6-Tab Structure)

> **Status:** ✅ Implemented — All 8 services restructured · Astro build 50 pages OK · ⏳ CMS visual verify  
> **Branch:** `feature/phase4-polish-launch`  

---

## 0. Tujuan

Konsolidasi tab editor CMS dari 8–9 tab menjadi **6 tab** yang lebih terstruktur dan
intuitif. Penambahan field **Facilities** (grouped/categorized) untuk detail fasilitas
ala Booking.com.

**Prinsip:**
- Unnamed/interfaceOnly tabs — ZERO database impact untuk field yang dipindah
- Field name, type, validation TIDAK berubah — existing data tetap utuh
- Frontend (Astro) TIDAK dimodifikasi
- Trial di Accommodations dulu, replikasi ke 7 service lain setelah approved

---

## 1. Audit — Accommodations (Sebelum)

### Tab Structure Lama (9 tab)

| # | Tab Label | Field Count | Fields |
|---|-----------|:-----------:|--------|
| 1 | Overview | 5 | name, subtitle, type+starRating (row), destination+category (row), description |
| 2 | Media | 2 | featuredImage, gallery |
| 3 | Quick Specs | 1 | quickSpecs (array, max 4) |
| 4 | Amenities & Highlights | 2 | highlightTags (array), amenities (array) |
| 5 | Rooms & Pricing | 2 | checkInTime+checkOutTime (row), roomTypes (array) |
| 6 | Location & Experiences | 4 | locationType, locationFields, nearbyLandmarks, curatedExperiences |
| 7 | Policies | 1 | policies (richText) |
| 8 | 🔒 Custom Sections | 2 | relatedServices (Phase 4.17), additionalBlocks |
| 9 | Booking | 1 | whatsappField |

**Total: 9 tab, 20 field groups**

### Sidebar Fields (tidak diubah)
- sidebarTabsField (General/SEO/Publishing tabs — Phase 4.9)
- slug, status, sortOrder, isFeatured, updatedAtRelative
- seoFields

---

## 2. Tab Structure Baru (6 tab)

| # | Tab Label | Fields | Perubahan |
|---|-----------|--------|-----------|
| 1 | **Overview** | name, subtitle, type+starRating, destination+category, description, quickSpecs, highlightTags | ← Gabung: Overview + Quick Specs + highlightTags dari Amenities |
| 2 | **Media** | featuredImage, gallery | Tidak berubah |
| 3 | **Rooms & Pricing** | checkInTime+checkOutTime, roomTypes, whatsappField | ← Gabung: Rooms & Pricing + Booking |
| 4 | **Amenities & Location** | amenities, **facilities (NEW)**, locationType, locationFields, nearbyLandmarks, curatedExperiences | ← Gabung: amenities dari Amenities & Highlights + Location & Experiences + NEW facilities |
| 5 | **Policies** | policies | Tidak berubah |
| 6 | **🔒 Custom Sections** | relatedServices, additionalBlocks | Tidak berubah |

### Perubahan Detail

| Field | Tab Lama | Tab Baru | DB Impact |
|-------|----------|----------|-----------|
| quickSpecs | Tab 3 (Quick Specs) | Tab 1 (Overview) | NONE — repositioned |
| highlightTags | Tab 4 (Amenities & Highlights) | Tab 1 (Overview) | NONE — repositioned |
| amenities | Tab 4 (Amenities & Highlights) | Tab 4 (Amenities & Location) | NONE — repositioned |
| locationType, locationFields, nearbyLandmarks, curatedExperiences | Tab 6 (Location & Experiences) | Tab 4 (Amenities & Location) | NONE — repositioned |
| whatsappField | Tab 9 (Booking) | Tab 3 (Rooms & Pricing) | NONE — repositioned |
| **facilities** | — | Tab 4 (Amenities & Location) | **YES — new field** |

---

## 3. Field Baru: Facilities

### Desain

```typescript
{
  name: 'facilities',
  type: 'array',
  label: 'Facilities',
  fields: [
    { name: 'category', type: 'text', required: true, label: 'Category Name' },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      fields: [
        { name: 'name', type: 'text', required: true },
      ],
    },
  ],
}
```

### Contoh Data

```
├── Category: "Languages Spoken"
│   └── Items: English, Chinese, Indonesian, Malay
├── Category: "Outdoor"
│   └── Items: Bicycles, Garden, Swimming pool
├── Category: "Getting Around"
│   └── Items: Car park, Shuttle service, Taxi
└── Category: "Things to Do"
    └── Items: Billiards, Diving, Fitness center, Spa
```

### Analisis: Facilities vs Amenities

| Aspek | Amenities | Facilities |
|-------|-----------|------------|
| Struktur | Flat list (name + icon) | Grouped by category (category → items) |
| UI | Icon grid bulat | Kolom-kolom dengan header kategori |
| Tujuan | Quick visual overview | Detail breakdown (ala Booking.com) |
| Contoh | "Pool", "WiFi", "AC" | "Outdoor" → Pool, Garden, BBQ area |

**Keputusan:** Keduanya TETAP ada — Amenities untuk quick visual, Facilities untuk detail.
Category free-text (bukan predefined select) agar fleksibel per properti.

---

## 4. File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Accommodations.ts` | 9 tab → 6 tab, tambah facilities field |
| `docs/PROGRESS.md` | Tambah Phase 4.18 row |

**TIDAK dimodifikasi:** Frontend (Astro), sidebar fields, field names/types/validation.

---

## 5. Verifikasi

- [x] TypeScript compile — no new errors (pre-existing errors only)
- [x] Astro build — 50 pages OK
- [ ] CMS list view — accommodations list loads
- [ ] CMS edit — 6 tabs render, existing data loads
- [ ] Save — no data loss
- [ ] New record — all tabs accessible
- [ ] Sidebar tabs — General/SEO/Publishing still work
- [ ] Frontend — villa/[slug] pages render correctly (no frontend changes)

---

## 6. Proposed Tab Mapping — All 8 Services

✅ **Implemented.** All 8 services restructured with accordion sections + color-coded tabs.

| Tab | Accommodations | Tours | Yachts | Restaurants | Spa | Venues | Rentals | Water Activities |
|-----|---------------|-------|--------|-------------|-----|--------|---------|-----------------|
| 1 | Overview | Overview | Overview | Overview | Overview | Overview | Overview | Overview |
| 2 | Media | Media | Media | Media | Media | Media | Media | Media |
| 3 | Rooms & Pricing | Itinerary & Pricing | Charter & Pricing | Menu & Dining | Treatments & Pricing | Packages & Pricing | Rental & Pricing | Activity & Pricing |
| 4 | Amenities & Location | Inclusions & Info | Amenities | Features & Location | Includes & Requirements | Features & Location | Includes & Requirements | Safety & Requirements |
| 5 | Policies | Policies | — | — | — | — | — | — |
| 6 | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections |

### Per-Service Results

| Service | Tabs Before → After | Notes |
|---------|:-------------------:|-------|
| **Accommodations** | 9 → 6 | roomTypes + checkIn/Out + whatsapp in Tab 3; facilities (NEW) in Tab 4 |
| **Tours** | 9 → 6 | itinerary + meeting/pickup + pricing in Tab 3; includes/excludes in Tab 4; additionalInfo as Policies |
| **Yachts** | 8 → 5 | specs + packages + whatsapp in Tab 3; amenities in Tab 4; no policies field |
| **Restaurants** | 8 → 5 | menuHighlights + whatsapp in Tab 3; features + location + hours in Tab 4 |
| **Spa** | 9 → 5 | specs + features + pricingTiers + whatsapp in Tab 3; includes + requirements in Tab 4 |
| **Venues** | 10 → 5 | packages + whatsapp in Tab 3; features + location + testimonials in Tab 4 |
| **Rentals** | 9 → 5 | specs + features + pricingTiers + whatsapp in Tab 3; includes + requirements in Tab 4 |
| **Water Activities** | 7 → 5 | whatToBring + pricing + whatsapp in Tab 3; safety + requirements in Tab 4 |

---

## 7. Accordion Sections + Color-Coded Tabs

### Arsitektur

| Komponen | File | Fungsi |
|----------|------|--------|
| `AccordionSections.tsx` | `apps/cms/src/admin/` | Client component — MutationObserver, auto-close siblings, tab-switch reset |
| `accordion-sections.css` | `apps/cms/src/admin/` | Color-coded borders, icon badges, section styling |
| `AdminStyles.tsx` | `apps/cms/src/admin/` | Provider yang load CSS + wrap AccordionSections |

### Pendekatan

- **Accordion:** MutationObserver pada class changes di `.accordion-section` collapsibles. Saat satu section dibuka (class `collapsible--collapsed` dihapus), semua sibling section di tab yang sama di-close otomatis.
- **Tab reset:** Saat tab aktif berubah, section pertama auto-open, sisanya auto-close.
- **Scoping:** Hanya element dengan class `accordion-section` yang terpengaruh. Nested collapsibles (array items, sub-groups) TIDAK terpengaruh.

### Color System

| Tab | Color Name | CSS Variable | Light | Dark |
|-----|-----------|-------------|:-----:|:----:|
| Overview | Ocean | `--acc-overview` | `#1b3a4b` | `#5ba3c9` |
| Media | Leaf | `--acc-media` | `#6b9080` | `#8bd6b6` |
| Rooms & Pricing | Coral | `--acc-rooms` | `#e07a5f` | `#f0a08a` |
| Amenities & Location | Teal | `--acc-amenities` | `#1a8a7a` | `#5cd6c6` |
| Policies | Stone | `--acc-policies` | `#585860` | `#9494a0` |
| Custom Sections | Midnight | `--acc-custom` | `#0d1b2a` | `#7a8fa8` |

### Icon Map per Section

| Tab | Section | Icon | CSS Class |
|-----|---------|------|-----------|
| Overview | Overview & Description | FileText | `section--overview-desc` |
| Overview | Quick Specs | BarChart3 | `section--quick-specs` |
| Overview | Highlight Tags | Star | `section--highlights` |
| Media | Featured Image | Image | `section--featured-img` |
| Media | Gallery | Copy | `section--gallery` |
| Rooms & Pricing | Check-in & Check-out | Clock | `section--checkin` |
| Rooms & Pricing | Room Types | Bed | `section--rooms` |
| Rooms & Pricing | Booking (WhatsApp) | Phone | `section--booking` |
| Amenities & Location | Amenities | Sparkles | `section--amenities` |
| Amenities & Location | Facilities | Building | `section--facilities` |
| Amenities & Location | Location | MapPin | `section--location` |
| Amenities & Location | Nearby & Experiences | Compass | `section--experiences` |
| Policies | Booking Policies | Shield | `section--policies` |
| Custom Sections | Related Services | Radio | `section--related` |
| Custom Sections | Content Blocks | LayoutGrid | `section--blocks` |

### Behavior Rules

1. Accordion hanya di section level — nested array items expand/collapse independen
2. Section pertama auto-open saat switch tab
3. State TIDAK dipersist — reset saat navigasi
4. Transisi smooth via CSS transition
5. Tidak ada konflik dengan block badges di Custom Sections tab

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Data hilang saat reposisi tab | NONE | Unnamed tabs = field tetap di root level DB |
| Facilities field pada record existing | NONE | Field optional, default kosong |
| Frontend rusak | NONE | Zero frontend changes, field names tidak berubah |
| Sidebar tabs konflik | NONE | Sidebar tabs terpisah dari main tabs |

---

## 9. Additional Section Icons (Pass 2)

New CSS icon classes added for service-specific sections:

| Section | Icon | CSS Class | Used By |
|---------|------|-----------|---------|
| Pricing | DollarSign | `section--pricing` | Tours, WA, Rentals, Spa |
| Packages | Package | `section--packages` | Yachts, Venues, Spa |
| Specifications | Wrench | `section--specs` | Yachts, Rentals, Spa |
| Itinerary | TrendingUp | `section--itinerary` | Tours |
| Meeting & Pickup | Bell | `section--meeting` | Tours |
| What's Included | CheckCircle | `section--includes` | Tours, WA, Rentals, Spa |
| Video | Play | `section--video` | Tours |
| Safety | ShieldCheck | `section--safety` | WA, Rentals, Spa |
| Menu Highlights | Utensils | `section--menu` | Restaurants |
| Opening Hours | Calendar | `section--hours` | Restaurants |
| Features | CheckSquare | `section--features` | Restaurants, Venues, Rentals |
| Testimonials | MessageSquare | `section--testimonials` | Venues |
| Capacity | Users | `section--capacity` | Venues |

---

## 10. Centralized Config Refactor (Pass 3)

### Keputusan: Opsi C — Developer-Editable Config File

Tiga opsi dipertimbangkan:
- **Opsi A:** Hardcoded per collection (status quo) — mudah tapi rawan inkonsistensi
- **Opsi B:** CMS-editable via Global Settings — over-engineering, tab structure = template concern
- **Opsi C (dipilih):** Centralized TypeScript config file — single source of truth, zero runtime overhead

### File Baru

| File | Fungsi |
|------|--------|
| `apps/cms/src/config/serviceTabsConfig.ts` | Config labels/icons/colors untuk semua 8 service |
| `docs/guides/service-tabs-config-guide.md` | Developer guide untuk editing config |

### Arsitektur

```
serviceTabsConfig.ts (SINGLE SOURCE OF TRUTH)
  ├── accommodationsTabs → Accommodations.ts (imports config) ✅
  ├── toursTabs          → Tours.ts (imports config) ✅
  ├── waterActivitiesTabs → WaterActivities.ts (imports config) ✅
  ├── yachtsTabs         → Yachts.ts (imports config) ✅
  ├── restaurantsTabs    → Restaurants.ts (imports config) ✅
  ├── venuesTabs         → Venues.ts (imports config) ✅
  ├── rentalsTabs        → Rentals.ts (imports config) ✅
  ├── spaTabs            → Spa.ts (imports config) ✅
  └── sectionClass(color, icon) → generates CSS className string
```

- `sectionClass('overview', 'overview-desc')` → `'accordion-section accordion-tab--overview section--overview-desc'`
- All 8 service collections refactored to import labels/icons/colors from config
- AGENTS.md updated with config reference + reusability step

---

## 11. Next Steps

1. ⏳ Owner verify: login CMS → buka ALL services → cek tabs + existing data
2. ⏳ CMS schema push untuk `facilities` field baru pada Accommodations (jawab `+ create column`)
3. ✅ Refactor all 8 services to use `serviceTabsConfig.ts` — completed
4. Frontend: render Facilities section di detail page (Phase 4.19)
