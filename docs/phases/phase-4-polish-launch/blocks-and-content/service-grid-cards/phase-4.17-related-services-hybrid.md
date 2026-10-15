# Phase 4.17 — Hybrid Related Services System (Global Default + Per Service Override)

> **Status:** ✅ Done — Astro build 50 pages OK · ⏳ CMS schema push + visual verify
> **Date:** 2026-08-29
> **Payload:** 3.33.0
> **Depends on:** Phase 4.15 (cardVariant) + Phase 4.16 (curated template + auto mode)
> **Branch:** `feature/phase4-polish-launch`

---

## 0. TL;DR

Replace the Phase 4.16 hardcoded fallback with a **3-layer cascade system** that
gives editors full control over the "Related Services" section on every service
detail page:

1. **Global Default** (SiteSettings) — one config applies to ALL services
2. **Per Service Type Override** (ServiceTypes collection) — override for all
   services of a given type (e.g., "all tours use 4 items instead of 3")
3. **Per Individual Service Override** (each service collection) — override or
   disable for a single service page

Cascade: **Individual > Service Type > Global**. Editors only see override fields
when they activate them — zero UI clutter by default.

---

## 1. Audit — Current State

### 1.1 Phase 4.15 — Card Styles (Done)

- **`cardVariant`** field added to `serviceGrid` block: `compact` | `detailed`
- Both variants are already rendered by all 8 service card components
  (`TourCard`, `AccommodationCard`, etc.) — they accept `variant` prop
- ServiceGrid now passes `variant={cardVariant}` to all card renders

### 1.2 Phase 4.16 — Curated Template + Auto Mode (Done)

- **`template`** field added: `default` | `curated`
- **`selectionMode`** field added: `manual` | `auto`
- **`sectionTitle`** field added: optional override for heading text
- **`CuratedCard.astro`** component: extracted from hardcoded design, handles
  all 8 service types with per-type price/meta logic
- **`ServiceGridBlock.astro`**: curated template branch renders the section
  with heading + explore-all link + 3-col grid of CuratedCards
- **`BlockRenderer.astro`**: passes `excludeId` to ServiceGrid blocks
- **`extraWhere`** prop: synthesizer-only path for sub-type filters
  (villa/spa/rental)

### 1.3 Current Fallback Mechanism (Phase 4.16 Pass 2)

All 8 service detail pages (`tour/[slug].astro`, `villa/[slug].astro`, etc.)
currently use this pattern:

```astro
const hasCuratedGrid = (additionalBlocks as any[]).some(
  (b) => b?.blockType === 'serviceGrid' && b?.template === 'curated',
)

{additionalBlocks.length > 0 && <BlockRenderer blocks={additionalBlocks} excludeId={item.id} />}

{!hasCuratedGrid && (
  <ServiceGridBlock
    block={{ blockType: 'serviceGrid', serviceType: 'tours', template: 'curated', selectionMode: 'auto' } as any}
    excludeId={item.id}
  />
)}
```

**Problems with current approach:**
- Config is hardcoded per-page (title, item count, selection mode)
- No way for editors to change title/count/style without adding a manual block
- No global "kill switch" to disable the section everywhere
- No per-service-type customization (e.g., "yachts should show 4 items")
- Sub-type filters (`extraWhere`) are synthesizer-only, not exposed in CMS

### 1.4 Existing Globals

| Global | Slug | Purpose | Access |
|--------|------|---------|--------|
| SiteSettings | `site-settings` | Branding, contact, SEO, WA, section pages, error pages | read: public, update: admin |
| SiteFeatures | `site-features` | Module toggles, section toggles, feature flags | read: public, update: super-admin |
| HomepageContent | `homepage-content` | Homepage sections/blocks | read: public |
| HeaderSettings | `header-settings` | Header template config | read: public |
| FooterSettings | `footer-settings` | Footer template config | read: public |

**Fetch helpers already exist** in `apps/web/src/lib/payload.ts`:
```ts
export const getSiteSettings = () => fetchGlobal<SiteSetting>('site-settings')
export const getSiteFeatures = () => fetchGlobal<any>('site-features')
```

**Already fetched in detail pages:** `getSiteSettings()` is called in every
service detail page (for WhatsApp number). Adding one more field read is free.

### 1.5 ServiceTypes Collection

- **8 records** (one per service vertical): tours, accommodations,
  water-activities, yachts, restaurants, venues, rentals, spa
- **Current fields:** name, slug, key (select), status, order, description
  (richText), iconName, coverImage, WhatsApp (collapsible), SEO (collapsible)
- **Already has override pattern:** WhatsApp collapsible overrides SiteSettings
  WhatsApp — same cascade pattern we want for related services
- **Relationship:** Services do NOT have a `relationTo: 'service-types'` field.
  The link is implicit via the `serviceType` key (e.g., `'tours'` matches
  `ServiceTypes.key = 'tours'`).
- **Frontend fetch:** `getServiceTypeByKey(key)` already exists and is called
  in `ServiceGridBlock.astro` for heading fallback.
- **Adding fields:** New optional fields are safe — Payload back-fills defaults
  at read time. No schema push required for existing data.

### 1.6 Service Collections — Tab Structure

All 8 service collections share this root tab structure (via `type: 'tabs'`
with `admin.className: 'dnj-main-tabs'`):

**Tours (representative):** Overview | Media | Quick Specs | Highlights & Meeting |
Itinerary | Includes & Info | Pricing | 🔒 Custom Sections | Booking

The `🔒 Custom Sections` tab (super-admin only) contains `additionalBlocks`
(blocks field). All 8 collections have this same tab.

**Sidebar tabs** (3 tabs via `sidebarTabsField`): General | SEO | Publishing

### 1.7 Build-Time Data Fetching

Current fetch pattern per service detail page (Astro SSG):

| Data | Fetch call | Already exists? |
|------|-----------|-----------------|
| Service document | `getTourBySlug(slug)` etc. | ✅ Yes |
| SiteSettings | `getSiteSettings()` | ✅ Yes (for WhatsApp) |
| ServiceType metadata | `getServiceTypeByKey(key)` | ✅ Yes (in ServiceGridBlock) |
| Related services | fetch same collection | ✅ Yes (in ServiceGridBlock auto mode) |

**All 3 cascade layers are ALREADY fetched** (or could piggyback on existing
fetches) — no additional API calls needed.

---

## 2. Design — 3-Layer Cascade Architecture

### 2.1 Layer 1 — Global Default (SiteSettings)

Add a new `relatedServices` group to `SiteSettings`:

```
relatedServices (group, label: "Related Services — Default")
├── enabled       : checkbox (default: true)
│                   "Show related services section on all detail pages"
├── sectionTitle   : text (default: '')
│                   "Leave blank = auto per service type (Curated Alternatives / More Yachts)"
├── cardStyle      : select → 'curated' | 'compact' | 'detailed' (default: 'curated')
│                   "Card layout for the related services grid"
├── maxItems       : number (default: 3, min: 2, max: 8)
│                   "Maximum items shown"
├── selectionMode  : select → 'same_type' | 'same_destination' | 'random' (default: 'same_type')
│                   "How related services are picked"
└── showExploreAll : checkbox (default: true)
                     "Show 'Explore All <Type>' link"
```

**Why SiteSettings and not SiteFeatures?** SiteFeatures is for on/off toggles
(super-admin). Related services config is editorial (title, count, style) — it
belongs with other editorial settings in SiteSettings, with the `enabled` toggle
serving as the kill switch. Access: admin-level update (not just super-admin).

### 2.2 Layer 2 — Per Service Type Override (ServiceTypes collection)

Add a new collapsible group to each ServiceType record:

```
Related Services Override (collapsible, initCollapsed: true)
├── overrideRelated : checkbox (default: false)
│                     "Customize related services for this service type"
│
│   (fields below: admin.condition → only visible when overrideRelated = true)
│
├── enabled         : checkbox (default: true)
├── sectionTitle    : text
├── cardStyle       : select → 'curated' | 'compact' | 'detailed'
├── maxItems        : number (min: 2, max: 8)
├── selectionMode   : select → 'same_type' | 'same_destination' | 'random'
└── showExploreAll  : checkbox (default: true)
```

When `overrideRelated: false` → service type uses global defaults (zero fields
visible).

### 2.3 Layer 3 — Per Individual Service Override (each service collection)

Add a new collapsible inside the existing `🔒 Custom Sections` tab:

```
Related Services (collapsible, initCollapsed: true, description:
  "Override related services section for this page only")
├── relatedOverride : select → 'default' | 'customize' | 'disable'
│                     (default: 'default')
│                     default   = use Service Type or Global settings
│                     customize = show override fields below
│                     disable   = hide section entirely on this page
│
│   (fields below: admin.condition → only visible when relatedOverride = 'customize')
│
├── sectionTitle    : text
├── cardStyle       : select → 'curated' | 'compact' | 'detailed'
├── maxItems        : number (min: 2, max: 8)
├── selectionMode   : select → 'same_type' | 'same_destination' | 'random' | 'manual'
│                     'manual' option ONLY available at this layer
└── manualPicks     : relationship (many: true, relationTo: same collection)
                      admin.condition → only visible when selectionMode = 'manual'
                      "Hand-pick specific services to show"
```

**Why inside 🔒 Custom Sections?**
- Already super-admin only — power-user feature
- Conceptually related to `additionalBlocks` (both control the bottom of the page)
- Doesn't add a 10th main tab
- Doesn't clutter the sidebar (which is for metadata, not content)

### 2.4 `manualPicks` — Relationship Details

The `manualPicks` field uses `relationTo` pointing to the SAME collection.
This requires a self-referential relationship:
- Tours.ts: `relationTo: 'tours'`
- Accommodations.ts: `relationTo: 'accommodations'`
- etc.

Payload supports this natively. The relationship picker shows a list of other
services in the same collection. `hasMany: true` allows multiple selections.
When `selectionMode !== 'manual'`, the field is hidden via `admin.condition`.

---

## 3. Cascade Resolution Logic

### 3.1 Resolution Function

```ts
// apps/web/src/lib/relatedServices.ts

interface RelatedConfig {
  enabled: boolean
  sectionTitle: string      // '' = use per-type default
  cardStyle: 'curated' | 'compact' | 'detailed'
  maxItems: number
  selectionMode: 'same_type' | 'same_destination' | 'random' | 'manual'
  showExploreAll: boolean
  manualPicks?: any[]       // only from Layer 3
}

const DEFAULTS: RelatedConfig = {
  enabled: true,
  sectionTitle: '',
  cardStyle: 'curated',
  maxItems: 3,
  selectionMode: 'same_type',
  showExploreAll: true,
}

export function resolveRelatedConfig(
  service: any,
  serviceType: any,
  globalSettings: any,
): RelatedConfig | null {
  // Layer 3: Individual service says disable → no section
  if (service?.relatedOverride === 'disable') return null

  // Layer 3: Individual service has custom settings → use them
  if (service?.relatedOverride === 'customize') {
    return {
      enabled: true,
      sectionTitle: service.relatedSectionTitle ?? '',
      cardStyle: service.relatedCardStyle ?? 'curated',
      maxItems: service.relatedMaxItems ?? 3,
      selectionMode: service.relatedSelectionMode ?? 'same_type',
      showExploreAll: service.relatedShowExploreAll ?? true,
      manualPicks: service.relatedManualPicks ?? [],
    }
  }

  // Layer 2: Service Type has override → use service type settings
  if (serviceType?.overrideRelated === true) {
    return {
      enabled: serviceType.relatedEnabled ?? true,
      sectionTitle: serviceType.relatedSectionTitle ?? '',
      cardStyle: serviceType.relatedCardStyle ?? 'curated',
      maxItems: serviceType.relatedMaxItems ?? 3,
      selectionMode: serviceType.relatedSelectionMode ?? 'same_type',
      showExploreAll: serviceType.relatedShowExploreAll ?? true,
    }
  }

  // Layer 1: Global default
  const g = globalSettings?.relatedServices
  if (g && g.enabled === false) return null

  return {
    enabled: g?.enabled ?? true,
    sectionTitle: g?.sectionTitle ?? '',
    cardStyle: g?.cardStyle ?? 'curated',
    maxItems: g?.maxItems ?? 3,
    selectionMode: g?.selectionMode ?? 'same_type',
    showExploreAll: g?.showExploreAll ?? true,
  }
}
```

### 3.2 Build-Time Efficiency

In Astro SSG, `getStaticPaths()` runs once per collection, and each `[slug].astro`
page renders per-doc. The cascade adds NO extra API calls because:

1. **Global settings** → `getSiteSettings()` — already called (WhatsApp number)
2. **Service type** → `getServiceTypeByKey(key)` — already called in
   `ServiceGridBlock.astro`; we move this call up to the page level and pass the
   result down
3. **Individual service** → the doc itself — already fetched

The resolver is pure JS (no I/O) — just reads fields from objects already in
memory.

**Build time impact:** Zero measurable difference. Currently 50 pages build in
~8–12 seconds. Adding ~10 bytes of field reads per page is noise.

---

## 4. Frontend Component Design

### 4.1 Shared `RelatedServices.astro` Component

```
apps/web/src/components/common/RelatedServices.astro

Props:
  - config: RelatedConfig | null    (from resolveRelatedConfig)
  - serviceType: string             (collection key, e.g. 'tours')
  - excludeId: number | string      (current page's doc id)
  - extraWhere?: Record<string, any> (sub-type filter for villa/spa/rental)

Behaviour:
  1. If config is null → render nothing (disabled)
  2. If config.enabled is false → render nothing
  3. Fetch related services based on config.selectionMode:
     - same_type: same collection, exclude current, sort by sortOrder
     - same_destination: same collection + where destination = current
     - random: same collection, random shuffle
     - manual: use config.manualPicks directly (no fetch needed)
  4. Slice to config.maxItems
  5. Render section using:
     - config.cardStyle = 'curated' → <CuratedCard> (already exists)
     - config.cardStyle = 'compact' → <TourCard variant="compact"> etc.
     - config.cardStyle = 'detailed' → <TourCard variant="detailed"> etc.
  6. Title: config.sectionTitle || per-type default from lookup table
  7. Explore All link: config.showExploreAll → link to listing page
```

### 4.2 Replacing Phase 4.16 Fallback

Every service detail page currently has:

```astro
{!hasCuratedGrid && (
  <ServiceGridBlock block={...synthesized...} excludeId={item.id} />
)}
```

This gets replaced with:

```astro
{/* Related Services — 3-layer cascade */}
<RelatedServices
  config={relatedConfig}
  serviceType="tours"
  excludeId={item.id}
/>
```

Where `relatedConfig` is computed in the frontmatter:

```astro
import { resolveRelatedConfig } from '@lib/relatedServices'

const settings = await getSiteSettings()  // already fetched above for WA
const svcType = await getServiceTypeByKey('tours').catch(() => null)
const relatedConfig = resolveRelatedConfig(item, svcType, settings)
```

### 4.3 Selection Mode Query Patterns

| Mode | Query | Feasibility at build time |
|------|-------|--------------------------|
| `same_type` | Same collection, `{ id: { not_equals: excludeId } }`, sort: `sortOrder`, limit: `maxItems + 2` (buffer for exclude) | ✅ Already works (Phase 4.16 auto mode) |
| `same_destination` | Same collection, `{ destination: { equals: currentDestId }, id: { not_equals: excludeId } }` | ✅ Standard Payload `where` clause. Destination is a relationship field on all 8 collections |
| `random` | Fetch all, client-side `Math.random()` shuffle, take N. At build time "random" means "random at build, fixed until next build" — acceptable for SSG | ✅ Feasible. Note: shuffle seed changes each build, so results vary per deploy |
| `manual` | No query — use `manualPicks` relationship array directly. Payload depth handles population | ✅ Native relationship — Payload returns populated docs. Must set `depth: 1` on the relationship or fetch-with-depth |

**`most_popular` (from task spec) — DEFERRED.** No popularity metric exists
(no view counts, no analytics, no `popularityScore` field). Adding one requires:
either a server-side view counter (needs a runtime server, not SSG) or a manual
"featured sort" field. Recommendation: defer to a future phase when analytics
integration exists. The existing `same_type` + `sortOrder` effectively acts as
editorial popularity (admin controls order).

### 4.4 Card Style Rendering

The `RelatedServices.astro` component renders cards based on `cardStyle`:

| cardStyle | Component | Already exists? |
|-----------|-----------|-----------------|
| `curated` | `<CuratedCard>` | ✅ Phase 4.16 |
| `compact` | `<TourCard variant="compact">` etc. (8 card components) | ✅ Phase 4.15 |
| `detailed` | `<TourCard variant="detailed">` etc. (same 8 components) | ✅ Phase 4.15 |

All 3 styles are already built. The component just needs a switch.

---

## 5. CMS UX — Override Fields Placement

### Recommendation: Inside `🔒 Custom Sections` Tab (Option C from task spec)

**Why this is best:**

1. **Already super-admin gated** — power users only, hidden from editors
2. **Conceptually grouped** — "custom sections" = customizing the bottom of
   the page; related services IS the bottom section
3. **No new tab added** — Tours already has 9 tabs; a 10th would overflow on
   smaller screens
4. **Sidebar stays clean** — sidebar is for metadata (slug, status, SEO), not
   content layout decisions
5. **Hidden by default** — collapsible `initCollapsed: true` + select defaulting
   to `'default'` means zero visual noise unless activated

**Implementation:** Add a collapsible ABOVE the `additionalBlocks` blocks field
in the Custom Sections tab, with a description explaining the cascade:

> "Override the Related Services section for this page. By default, this page
> uses the settings from its Service Type, or the global default in Site Settings."

### Layer 2 (ServiceTypes) Placement

Add as a new collapsible in ServiceTypes, similar to the existing WhatsApp
collapsible. Position after WhatsApp, before SEO:

```
ServiceTypes collection fields:
  name, slug, key, status, order, description, iconName, coverImage
  ├── WhatsApp (collapsible)
  ├── Related Services Override (collapsible) ← NEW
  └── SEO (collapsible)
```

The WhatsApp override pattern is precedent — editors already understand
"collapsible = optional override."

### Layer 1 (SiteSettings) Placement

Add as a new group after `sectionPages` and before `errorPages`:

```
SiteSettings fields:
  siteName, tagline, logo, logoDark, favicon, contact, socialMedia,
  defaultSeo, whatsappDefaults, footer, sectionPages
  ├── Related Services (group) ← NEW
  └── Error Pages (group)
```

---

## 6. Risk Assessment

| Risk | Level | Explanation | Mitigation |
|------|:-----:|-------------|------------|
| DB schema change (SiteSettings) | 🟢 LOW | New optional group with defaults. No existing data affected. Payload reads defaults at read time. | No migration. |
| DB schema change (ServiceTypes) | 🟢 LOW | New optional collapsible with defaults. 8 existing records unaffected. | No migration. |
| DB schema change (8 service collections) | 🟡 MED | New fields on all 8 collections. Must add to each collection config file. | Template the fields in a shared helper (like `sidebarTabs.ts`). One change point. |
| Breaking existing pages during migration | 🟢 LOW | Phase 4.16 fallback stays active until all 3 layers are wired. New system produces byte-identical output by default. | Ship global default first; test; then wire up service types; then per-service. |
| Build time performance | 🟢 NONE | All 3 data sources already fetched. Resolver is pure JS (no I/O). | n/a |
| CMS UI complexity (3 layers confuse users) | 🟢 LOW | Layer 1 (global) is one collapsible in Settings. Layer 2 (per type) is hidden by `overrideRelated` toggle. Layer 3 (per service) is in super-admin-only tab, hidden by select defaulting to 'default'. | `admin.description` on each field explains the cascade. |
| Reusability for future projects | 🟢 LOW | Shared fields helper + shared resolver function + generic RelatedServices component = drop-in for new projects. | See §8. |
| Rollback difficulty | 🟢 LOW | New optional fields; removing them reverts to Phase 4.16 fallback. | `git revert` restores fallback. No data migration to undo. |

---

## 7. Implementation Order

### Step 1 — Shared Field Helpers (CMS)
**File:** `apps/cms/src/fields/relatedServices.ts` (NEW)

Create reusable field definitions for Layers 2 and 3:
- `relatedServicesOverrideFields()` — generates the collapsible + inner fields
  with `admin.condition` wiring
- `relatedServicesPerServiceFields(collectionSlug)` — generates per-service
  override fields including `manualPicks` with self-referential relationship

**Effort:** 30 min

### Step 2 — Global Default (Layer 1)
**Files:** `apps/cms/src/globals/SiteSettings.ts`

Add `relatedServices` group with 6 fields.

**Effort:** 15 min

### Step 3 — Cascade Resolver (Frontend Lib)
**File:** `apps/web/src/lib/relatedServices.ts` (NEW)

Pure function: `resolveRelatedConfig(service, serviceType, globalSettings)`.
No side effects, no I/O. Easy to unit-test.

**Effort:** 20 min

### Step 4 — `RelatedServices.astro` Component
**File:** `apps/web/src/components/common/RelatedServices.astro` (NEW)

Shared component that:
- Receives resolved config
- Fetches related items (or uses manualPicks)
- Renders using the chosen cardStyle
- Handles empty state / disabled state

**Effort:** 45 min

### Step 5 — Wire Up in Service Detail Pages
**Files:** 8 `[slug].astro` pages

Replace Phase 4.16 fallback with `<RelatedServices>` component.
Each page:
1. Import `resolveRelatedConfig` and `RelatedServices`
2. Fetch `getServiceTypeByKey(key)` (or reuse if already fetched)
3. Call `resolveRelatedConfig(item, svcType, settings)`
4. Render `<RelatedServices config={relatedConfig} ... />`
5. Remove the `hasCuratedGrid` check and synthesized `<ServiceGridBlock>` fallback

**Effort:** 40 min (8 pages × 5 min each)

### Step 6 — ServiceTypes Override (Layer 2)
**File:** `apps/cms/src/collections/ServiceTypes.ts`

Add `relatedServicesOverrideFields()` collapsible.

**Effort:** 15 min

### Step 7 — Per-Service Override (Layer 3)
**Files:** 8 collection configs (Tours.ts, Accommodations.ts, etc.)

Add `relatedServicesPerServiceFields(slug)` inside Custom Sections tab.

**Effort:** 30 min (reusable helper, but must add to each file)

### Step 8 — Type Regen + Build Verify
**Commands:**
```bash
pnpm --filter cms dev   # triggers type regen
pnpm --filter web build # verify 50 pages still build
```

**Effort:** 10 min

### Step 9 — Documentation Update
**Files:** `docs/phases/phase-4-polish-launch/blocks-and-content/service-grid-cards/phase-4.17-related-services-hybrid.md` (update status),
`docs/PROGRESS.md`

**Effort:** 10 min

### Total Estimated Effort

| Step | Task | Effort |
|------|------|--------|
| 1 | Shared field helpers | 30 min |
| 2 | Global default (SiteSettings) | 15 min |
| 3 | Cascade resolver | 20 min |
| 4 | RelatedServices.astro | 45 min |
| 5 | Wire up 8 detail pages | 40 min |
| 6 | ServiceTypes override | 15 min |
| 7 | Per-service override (8 collections) | 30 min |
| 8 | Type regen + build | 10 min |
| 9 | Docs | 10 min |
| **Total** | | **~3.5 h** |

---

## 8. Reusability Assessment

### 8.1 Portable Components

| Component | Location | Project-agnostic? |
|-----------|----------|:-:|
| `relatedServices.ts` (field helper) | `apps/cms/src/fields/` | ✅ Generic — just needs collection slug param |
| `resolveRelatedConfig()` | `apps/web/src/lib/` | ✅ Pure function, no project-specific logic |
| `RelatedServices.astro` | `apps/web/src/components/common/` | 🟡 Needs per-project card components, but the shell is generic |
| `CuratedCard.astro` | `apps/web/src/components/cards/` | 🟡 Design-specific (Tailwind classes match DnJourneysBali theme) |
| Global settings fields | `SiteSettings` group | ✅ Copy-paste to any Payload project |
| ServiceType override fields | `ServiceTypes` collapsible | ✅ If project has ServiceTypes pattern |

### 8.2 New Project Setup

For a new project using this template:

**Template developer** (one-time):
1. Copy `fields/relatedServices.ts` + `lib/relatedServices.ts`
2. Add `relatedServices` group to project's Site Settings global
3. Add override collapsible to ServiceTypes (if applicable)
4. Add per-service override to each collection
5. Create project-specific `CuratedCard.astro` (or use compact/detailed variants)
6. Add `<RelatedServices>` component to detail pages

**Client admin** (daily usage):
1. Open Site Settings → Related Services → set global defaults
2. (Optional) Open a Service Type → Related Services Override → customize
3. (Optional) Open a specific service → Custom Sections → Related Services →
   customize or disable

### 8.3 Packaging Recommendation

Create a `packages/shared/src/related-services/` directory containing:
- `fields.ts` — CMS field helpers (Layer 1/2/3 field definitions)
- `resolver.ts` — cascade resolution function
- `types.ts` — `RelatedConfig` interface

The frontend component stays in `apps/web/` (Astro-specific).

---

## 9. Rollback Plan

| Scenario | Rollback |
|----------|----------|
| Step 1–3 (fields + resolver only) | Remove fields from configs. No data loss — fields were optional with defaults. |
| Step 4–5 (component + wiring) | `git revert` restores Phase 4.16 fallback on all 8 pages. |
| Step 6–7 (Layer 2+3 overrides) | Remove field groups from ServiceTypes + 8 collections. Any data entered in those fields is lost (acceptable — it's override config, not content). |
| Full rollback | `git revert` all Phase 4.17 commits → Phase 4.16 fallback re-activates. Zero page breakage. |

No database migration to reverse. All new fields are optional with defaults.

---

## 10. Owner Decisions (Resolved 2026-08-29)

1. **Phase numbering:** ✅ Confirmed as **4.17**.

2. **`most_popular` selection mode:** ✅ **Deferred.** `sortOrder` di CMS sudah
   cukup untuk kontrol editorial. Metric popularitas (view count, analytics)
   bisa ditambahkan di fase mendatang jika dibutuhkan.

3. **`same_destination` mode:** ✅ **Same collection only** untuk fase ini.
   Cross-collection (e.g., tour di Ubud menampilkan villa di Ubud) disimpan
   untuk Phase 5+ agar desain dan logika data tetap konsisten.

4. **`showDivider` field:** ✅ **Skip.** Tidak perlu — UI sudah otomatis
   konsisten dengan spacing `container-content mb-24`. Menghindari kerumitan
   opsi CMS yang tidak memberikan nilai tambah.

5. **Access level:**
   - **Layer 2 (ServiceTypes):** ✅ Akses **Admin** — `update: isAdmin`.
     Admin cukup mengatur preferensi Related Services di tingkat Service Type
     tanpa harus mengedit satu per satu produk.
   - **Layer 3 (per-service override):** ✅ Tetap **Super-admin only** —
     di dalam `🔒 Custom Sections` tab. Override kasus tertentu saja.

---

## 11. Files That Would Change

| File | Change |
|------|--------|
| `apps/cms/src/fields/relatedServices.ts` | **NEW** — shared field helpers for Layers 2+3 |
| `apps/cms/src/globals/SiteSettings.ts` | +1 group (6 fields) |
| `apps/cms/src/collections/ServiceTypes.ts` | +1 collapsible (7 fields) |
| `apps/cms/src/collections/Tours.ts` | +1 collapsible in Custom Sections tab |
| `apps/cms/src/collections/Accommodations.ts` | same |
| `apps/cms/src/collections/WaterActivities.ts` | same |
| `apps/cms/src/collections/Yachts.ts` | same |
| `apps/cms/src/collections/Restaurants.ts` | same |
| `apps/cms/src/collections/Venues.ts` | same |
| `apps/cms/src/collections/Rentals.ts` | same |
| `apps/cms/src/collections/Spa.ts` | same |
| `apps/web/src/lib/relatedServices.ts` | **NEW** — cascade resolver |
| `apps/web/src/components/common/RelatedServices.astro` | **NEW** — shared component |
| `apps/web/src/pages/tour/[slug].astro` | Replace fallback with `<RelatedServices>` |
| `apps/web/src/pages/villa/[slug].astro` | same |
| `apps/web/src/pages/spa/[slug].astro` | same |
| `apps/web/src/pages/rental/[slug].astro` | same |
| `apps/web/src/pages/yacht/[slug].astro` | same |
| `apps/web/src/pages/water-activity/[slug].astro` | same |
| `apps/web/src/pages/restaurant/[slug].astro` | same |
| `apps/web/src/pages/venue/[slug].astro` | same |
| `packages/shared/src/types/payload-types.ts` | auto-regenerated |

**Zero:** importMap.js, admin CSS, admin components, access rules, DB schema push
(all fields optional with defaults).
