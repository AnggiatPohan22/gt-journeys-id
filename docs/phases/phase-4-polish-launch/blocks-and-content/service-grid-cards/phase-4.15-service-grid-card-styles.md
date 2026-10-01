# Phase 4.15 — Service Grid Card Styles

> **Status:** ✅ Done — CMS field + frontend prop wired. tsc clean on
> CMS. Types will regenerate on next dev boot. Awaiting login verify +
> single Detailed render check on any published page using serviceGrid.
> **Scope:** Give the `serviceGrid` block a `cardVariant` field so
> content editors can pick Compact vs Detailed card layout, same as
> `serviceListing` already has.
> **Date:** 2026-08-28
> **Payload:** 3.33.0

---

## 0. TL;DR

**Near-zero-risk change.** The 8 service-specific card components
(`TourCard`, `AccommodationCard`, …) **already accept the same
`variant?: 'compact' | 'detailed'` prop and are already used by
BOTH blocks**. `serviceListing` passes `variant` through; `serviceGrid`
just doesn't pass it (falls back to card default = `compact`).

Change is entirely mechanical:
1. Add one `cardVariant` select field to `serviceGrid` block config.
2. Read it in `ServiceGridBlock.astro` and pass `variant={cardVariant}`
   to all 8 `<XCard>` lines.

**Effort:** ~15 min. **DB migration risk:** none — new optional field,
existing rows fall back to `compact`.

---

## 1. Part 1 — Service Listing (has the pattern)

### 1.1 Block config
File: [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts)
(see `ServiceListing` block, in the "Card Style" tab):

```ts
{
  name: 'cardVariant',
  type: 'select',
  defaultValue: 'compact',
  options: [
    { label: 'Compact (default — image + title + price)', value: 'compact' },
    { label: 'Detailed (multi-image, rating, description, amenity badges, Book Now)', value: 'detailed' },
  ],
  admin: {
    description: 'Detailed variant matches Hero Immersive template but works with any layout.',
  },
}
```

Two variants: `compact` (default) and `detailed`.

### 1.2 Frontend rendering
`serviceListing` has TWO layout templates:

| File | Default variant | Notes |
|------|-----------------|-------|
| [`ServiceListingEditorial.astro`](../../apps/web/src/components/blocks/ServiceListingEditorial.astro) | `compact` (line 189) | Standard editorial-with-heading layout |
| [`ServiceListingHeroImmersive.astro`](../../apps/web/src/components/blocks/ServiceListingHeroImmersive.astro) | `detailed` (line 201) | Immersive hero + floating filter |

Both read the block's `cardVariant` and pass it through:

```astro
const cardVariant: 'compact' | 'detailed' =
  b.cardVariant === 'detailed' ? 'detailed' : 'compact'

{serviceType === 'tours' && <TourCard tour={item} hrefBase={detailBase} variant={cardVariant} />}
{serviceType === 'accommodations' && <AccommodationCard accommodation={item} hrefBase={detailBase} variant={cardVariant} />}
// … 6 more identical lines for each service type
```

### 1.3 Card components — the actual variant renderer
Confirmed on `TourCard.astro` (identical shape across all 8):

```astro
interface Props {
  tour: Tour
  hrefBase?: string
  variant?: 'compact' | 'detailed'
}
const { tour, hrefBase = '/tour', variant = 'compact' } = Astro.props

{variant === 'detailed' ? (
  // multi-image + rating + description + amenity badges + Book Now
) : (
  // compact: image + title + price
)}
```

So the `variant` prop is a full-fledged, shipping API on **every**
service card. Nothing to build — just needs to be plumbed through the
grid block.

---

## 2. Part 2 — Service Grid (needs the pattern)

### 2.1 Block config
File: [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts)
`ServiceGrid` block, Content tab:

Current fields: `heading`, `serviceType`, `limit`, `featuredOnly`,
`showViewAll`, `viewAllText`, `viewAllLink`, `paginate`, `pageMode`,
`pageSize`, `moreText`, plus an Advanced tab for styling.

**No `cardVariant` field.** No visual/layout/appearance field of any
kind for the card itself.

### 2.2 Frontend rendering
File: [`ServiceGridBlock.astro`](../../apps/web/src/components/blocks/ServiceGridBlock.astro)

```astro
{serviceType === 'tours' && <TourCard tour={item} hrefBase={hrefBase} />}
{serviceType === 'accommodations' && <AccommodationCard accommodation={item} hrefBase={hrefBase} />}
{serviceType === 'water-activities' && <WaterActivityCard activity={item} hrefBase={hrefBase} />}
{serviceType === 'yachts' && <YachtCard yacht={item} hrefBase={hrefBase} />}
{serviceType === 'restaurants' && <RestaurantCard restaurant={item} hrefBase={hrefBase} />}
{serviceType === 'venues' && <VenueCard venue={item} hrefBase={hrefBase} />}
{serviceType === 'rentals' && <RentalCard rental={item} hrefBase={hrefBase} />}
{serviceType === 'spa' && <SpaCard spa={item} hrefBase={hrefBase} />}
```

**Identical 8-card imports/lines as ServiceListing**, but `variant` is
never passed → each card uses its own `variant = 'compact'` default.

### 2.3 Data source and services selected
- Fetches directly from the service collection matching `serviceType`
  (`getTours`, `getAccommodations`, etc.) via `@lib/payload`.
- Options: `{ limit, where: featuredOnly ? { isFeatured: true } : {}, sort: 'sortOrder' }`.
- Pagination is client-side (a `pg-*` classnames convention) — doesn't
  affect the card render.
- All grid columns/responsive layout come from `.blockStyles`
  helpers (`resolveContainer`, `resolvePadding`, etc.) applied at the
  wrapper level, not the card. So changing card variant doesn't
  interact with grid layout math.

---

## 3. Part 3 — Compatibility matrix

| Aspect | Service Listing | Service Grid | Match? |
|---|---|---|:-:|
| Block file | `apps/cms/src/blocks/index.ts` (`ServiceListing`) | same file (`ServiceGrid`) | ✅ |
| Frontend renderer | `ServiceListingEditorial.astro` + `ServiceListingHeroImmersive.astro` | `ServiceGridBlock.astro` | Different files, same import list |
| **Card components used** | `TourCard`, `AccommodationCard`, `WaterActivityCard`, `YachtCard`, `RestaurantCard`, `VenueCard`, `RentalCard`, `SpaCard` | **exactly the same 8** | ✅ |
| Card `variant` prop supported | `variant={cardVariant}` passed | not passed (defaults to `compact`) | ✅ prop exists on both sides |
| Data source | Same `get<Service>()` fetch helpers via `@lib/payload` | Same 8 fetch helpers | ✅ |
| Grid layout / responsive | Container helpers from `blockStyles` | Same helpers | ✅ |
| `cardVariant` block field | Present (`compact` \| `detailed`) | Absent | ⬜ add |

### Key answers to the audit questions
1. **Same card component?** YES — literally the same 8 files. No
   unification work needed.
2. **Card styles visually compatible with grid layout?** YES — card
   width is set by the wrapper grid; the card fills whatever width
   it's given regardless of variant. ServiceListingEditorial uses the
   same wrapper approach and both variants render fine there.
3. **DB migration?** NO structural change. `cardVariant` is a
   `type: 'select'` with `defaultValue: 'compact'` → Payload treats
   missing values in existing rows as the default at read time.
   Existing service-grid block instances (in Pages and elsewhere)
   continue to render exactly as they do today (compact).

---

## 4. Part 4 — Risk assessment

| Risk | Level | Explanation |
|------|:-:|-------------|
| Breaking existing `serviceGrid` blocks | 🟢 LOW | New optional field with default `compact` — existing rows keep their current visual output byte-for-byte. |
| Frontend regressions on published pages | 🟢 LOW | The only wire change is passing `variant={cardVariant}` to cards that already default to `compact`. Zero visual change for existing blocks; new blocks and edits opt into `detailed` by choice. |
| DB migration needed | 🟢 NONE | Payload's `select` field with `defaultValue` is read-time back-filled; no schema push required for existing rows. |
| Shared card component conflicts | 🟢 NONE | Cards are already dual-consumer — ServiceListing has used them with both variants for months. |
| CMS edit view impact | 🟢 LOW | One extra select in the Content tab of a block that already has ~11 fields. |
| Advanced-tab styles interfere | 🟢 LOW | The Advanced tab (padding/container/animation/text) wraps the whole block; it doesn't touch card internals. |

**Overall risk: LOW.** Safest possible feature addition.

---

## 5. Part 5 — Implementation plan (exact steps)

### 5.1 CMS side — 1 file, ~7 lines
**File:** [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts)

Inside the `ServiceGrid` block's `Content` tab `fields:` array, add
between `featuredOnly` row and the `View All Button` collapsible:

```ts
{
  name: 'cardVariant',
  type: 'select',
  defaultValue: 'compact',
  options: [
    { label: 'Compact (default — image + title + price)', value: 'compact' },
    { label: 'Detailed (multi-image, rating, description, amenity badges, Book Now)', value: 'detailed' },
  ],
  admin: {
    description: 'Card layout. Compact = small grid tile. Detailed = richer per-item info.',
  },
},
```

(Copy-paste of ServiceListing's field verbatim — deliberate, so both
blocks share the exact same UX label and default.)

### 5.2 Frontend side — 1 file, ~9 lines
**File:** [`apps/web/src/components/blocks/ServiceGridBlock.astro`](../../apps/web/src/components/blocks/ServiceGridBlock.astro)

Just before the map (around line ~125), add:
```ts
const cardVariant: 'compact' | 'detailed' =
  block.cardVariant === 'detailed' ? 'detailed' : 'compact'
```

Then in each of the 8 card-render lines, add `variant={cardVariant}`
(same pattern as ServiceListingEditorial):
```astro
{serviceType === 'tours' && <TourCard tour={item} hrefBase={hrefBase} variant={cardVariant} />}
{serviceType === 'accommodations' && <AccommodationCard accommodation={item} hrefBase={hrefBase} variant={cardVariant} />}
// … 6 more
```

### 5.3 Shared component strategy
No new shared component needed. The 8 service cards **already are** the
shared component library — both blocks (grid + listing) consume them
via the same import paths with the same `variant` prop.

If future block types need service cards, they just import from
`@components/cards/*Card.astro` and pass `variant`.

### 5.4 Default value
**Default: `compact`**. Reasons:
- Matches what `serviceGrid` renders today (existing pages don't shift).
- Matches ServiceListingEditorial's default (visual consistency across
  templates that lean on grid density).
- Matches each card component's own internal default → no cascade
  surprises.

### 5.5 File impact list
| File | Change |
|------|--------|
| `apps/cms/src/blocks/index.ts` | +7 lines (one select field) |
| `apps/web/src/components/blocks/ServiceGridBlock.astro` | +1 line (cardVariant const) + 8 modified lines (add `variant={cardVariant}` prop) |
| `packages/shared/src/types/payload-types.ts` | auto-regenerated on next dev boot |
| `apps/cms/src/app/(payload)/admin/importMap.js` | unaffected (no new component paths) |

**Zero:** frontend fetch helpers, DB schema, card components, other
blocks, Payload access rules, Astro routes.

### 5.6 Verification checklist
- [ ] Existing service-grid instances on published Pages render byte-
      identical (still compact).
- [ ] New block instance → Content tab shows the Card Style dropdown.
- [ ] Choose Detailed → cards render with richer layout.
- [ ] All 8 service types (tours, accommodations, water-activities,
      yachts, restaurants, venues, rentals, spa) render both variants
      without console errors.
- [ ] Grid columns/spacing (Advanced tab) still work in both variants.
- [ ] Pagination (load-more / numbered pages) still works in both
      variants.
- [ ] Type-check clean (`tsc --noEmit` in `apps/cms` and `apps/web`).

---

## 6. Estimated effort

| Task | Effort |
|------|--------|
| CMS block field addition | 5 min |
| Frontend prop plumbing (`ServiceGridBlock.astro`) | 5 min |
| Type regen + tsc verify | 2 min |
| Local build + login-verify per service type | 15–20 min |
| **Total** | **~30–35 min** |

---

## 7. Owner decisions required

None strictly — plan is low-risk and mirrors an existing shipped
pattern. But worth confirming:

1. **Default = `compact`?** — matches current visual output. Recommend
   yes.
2. **Any additional variants** (e.g. `horizontal`, `list`)? — none
   proposed here; scope is "match Service Listing". If a third variant
   is desired later, add options to all 8 cards + the select in one
   sweep.
3. **Description text** ("Compact = small grid tile…") — happy to
   tweak the copy on approval.
