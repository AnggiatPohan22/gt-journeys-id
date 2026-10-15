# Phase 4.9 — Editor UX Replication (Group A + B)

> **Status:** ✅ Done — helpers extracted, Group A (8 collections) + Group
> B (2 collections) implemented, tsc clean, docs updated. Awaiting login
> verification per collection.
> **Scope:** Roll Phase 4.8's page-editor UX (sidebar tabs + Preview
> button) out to service + taxonomy collections.
> **Date:** 2026-08-27 (audit + implementation same day)
> **Payload version:** 3.33.0 · **Frontend:** Astro `output: 'static'` (SSG)
> **Depends on:** [Phase 4.8](phase-4.8-page-editor-ux.md) landed at commit
> `cc384d7` on `feature/phase4-polish-launch`.

---

## 0. TL;DR

Phase 4.8's Pages edit view got sidebar tabs + block badges + a conditional
Preview button + sticky Save bar. Two of those (**block badges** and
**sticky Save bar**) are already GLOBAL — every collection that renders the
default edit view inherits them for free. The two that need per-collection
work are **sidebar tabs** and the **Preview button**.

**Group A — Full replication (8 collections):** all 7 service collections
(Tours / Accommodations / WaterActivities / Yachts / Restaurants / Venues /
Rentals / Spa). Each has a slug, a `status`, `seoFields`, and a matching
Astro detail page (`SERVICE_DETAIL_BASE` in
[`apps/web/src/lib/structuredData.ts`](../../apps/web/src/lib/structuredData.ts)).
Add sidebar tabs + `admin.preview`.

**Group B — Partial (2 collections):** Destinations and ServiceTypes have
worthwhile sidebar fields but NO frontend detail page → sidebar tabs
only, no preview button.

**Group C — No change (7 collections):** Categories, DestinationTypes,
Menus, Media, Testimonials, Users — small sidebar / no user-facing detail
page / auth collection.

**Estimated effort:** ~2–2.5 hours (or ~1.5 h if we factor a shared helper
first).

---

## 1. Part 1 — Pages verification

Phase 4.8's changes live in the **collection config**
([`collections/Pages.ts`](../../apps/cms/src/collections/Pages.ts)) plus
**global providers/CSS** — nothing is scoped to a single row.

| Improvement | Where implemented | Applies to |
|-------------|-------------------|------------|
| Sidebar tabs | `Pages.ts` (UI field + `withSidebarTab` wrapper) | Every Page (all rows) |
| Preview button | `Pages.admin.preview` | Every Page |
| Block badges | `blocks/index.ts` (per-block `admin.components.Label`) + `edit-view.css` | Every doc that embeds `blocks` |
| Sticky Save bar | `edit-view.css` targeting `.doc-controls` | Every edit view (all collections/globals) |

→ **Verified: every page in the Pages collection inherits the redesign**
(no data-driven gates, no per-row conditions). Ready to expand.

---

## 2. Part 2 — Full collection audit

### 2.1 Field-presence matrix (auto-extracted)

| Collection | sidebar fields | blocks | status | seo | slug | Frontend detail page | Note |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|-----|
| **Accommodations** | 2 | ✅ | ✅ | ✅ | ✅ | `/villa/[slug]` | villa/hotel/resort/guesthouse all route through /villa |
| **Tours** | 1 | ✅ | ✅ | ✅ | ✅ | `/tour/[slug]` | |
| **Rentals** | 1 | ✅ | ✅ | ✅ | ✅ | `/rental/[slug]` | |
| **Restaurants** | 1 | ✅ | ✅ | ✅ | ✅ | `/restaurant/[slug]` | |
| **Spa** | 1 | ✅ | ✅ | ✅ | ✅ | `/spa/[slug]` | |
| **Venues** | 1 | ✅ | ✅ | ✅ | ✅ | `/venue/[slug]` | |
| **WaterActivities** | 1 | ✅ | ✅ | ✅ | ✅ | `/water-activity/[slug]` | |
| **Yachts** | 1 | ✅ | ✅ | ✅ | ✅ | `/yacht/[slug]` | |
| **Destinations** | 3 | ❌ | ✅ | ✅ | ✅ | ❌ (filter taxonomy) | Tabs useful; no preview URL |
| **ServiceTypes** | 4 | ❌ | ✅ (`active`/`draft`/`archived`) | ❌ | ✅ | ❌ (drives Pages catch-all) | Tabs useful; no preview URL |
| **Categories** | 1 | ❌ | ✅ | ❌ | ✅ | ❌ | Only 1 sidebar field — tabs not worth it |
| **DestinationTypes** | 3 | ❌ | ❌ | ❌ | ✅ | ❌ | No status/SEO → tabs would collapse to 1 |
| **Menus** | 1 | ❌ | ✅ (`active`/`inactive`) | ❌ | ✅ | ❌ (site chrome) | Only 1 sidebar field |
| **Media** | 0 | ❌ | ❌ | ❌ | ❌ | ❌ | File library |
| **Testimonials** | 0 | ❌ | ✅ | ❌ | ❌ | ❌ (embedded in blocks) | |
| **Users** | 1 | ❌ | ❌ | ❌ | ❌ | ❌ | Auth |
| Pages (reference) | 4 | ✅ | ✅ | ✅ | ✅ | `/[...slug]` | Already done in 4.8 |

### 2.2 Global improvements — no per-collection action needed

- **Block badges + row borders + picker groups** — added via
  `blocks/index.ts` (`admin.components.Label`, `admin.group`) + `edit-view.css`.
  Every collection embedding the `blocks` array (all 8 service collections
  + Pages) already inherits them today, at zero extra cost.
- **Sticky Save bar (`.doc-controls`)** — one CSS rule in `edit-view.css`,
  applied globally. Nothing to do per collection.

### 2.3 Astro URL map (verified against `SERVICE_DETAIL_BASE`)

Source: [`apps/web/src/lib/structuredData.ts`](../../apps/web/src/lib/structuredData.ts)

| Collection | Astro route file | URL base | Verified? |
|------------|------------------|----------|:-:|
| Tours | `apps/web/src/pages/tour/[slug].astro` | `/tour/<slug>` | ✅ |
| Accommodations | `apps/web/src/pages/villa/[slug].astro` | `/villa/<slug>` | ✅ (all accommodation types route through `/villa`) |
| WaterActivities | `apps/web/src/pages/water-activity/[slug].astro` | `/water-activity/<slug>` | ✅ |
| Yachts | `apps/web/src/pages/yacht/[slug].astro` | `/yacht/<slug>` | ✅ |
| Restaurants | `apps/web/src/pages/restaurant/[slug].astro` | `/restaurant/<slug>` | ✅ |
| Venues | `apps/web/src/pages/venue/[slug].astro` | `/venue/<slug>` | ✅ |
| Rentals | `apps/web/src/pages/rental/[slug].astro` | `/rental/<slug>` | ✅ |
| Spa | `apps/web/src/pages/spa/[slug].astro` | `/spa/<slug>` | ✅ |
| Destinations / ServiceTypes / Categories / DestinationTypes / Menus / Media / Testimonials / Users | — | — | No detail page → **no `admin.preview`** |

### 2.4 Risk assessment

| Risk | Answer |
|------|--------|
| Can sidebar tabs be added without breaking anything? | **Yes.** `withSidebarTab()` only appends a class to `admin.className`; fields never unmount, only CSS hides inactive-tab groups. Same pattern already runs live on Pages. |
| Any collection-specific sidebar fields that don't fit the 3 tabs? | **Yes — minor:** `isFeaturedField` (all services), `Destinations.parent`/`.showInFilter`, `ServiceTypes.order` don't naturally sit in General/SEO/Publishing → all belong under **Publishing** (they control listing behaviour). See §4 for per-collection tab assignments. |
| Preview URL — accommodation types other than villa? | **Handled today.** All 4 accommodation subtypes (villa, hotel, resort, guesthouse) already resolve to `/villa/<slug>` in Astro, matching `SERVICE_DETAIL_BASE.accommodations = '/villa'`. So one preview URL covers the whole collection. |
| DB / migration impact? | **None.** All changes are admin-UI only (config + component wiring). Zero schema changes. |
| Pre-existing SidebarTabs component hardcodes "General / SEO / Publishing" — does it fit Group B (no SEO)? | For **ServiceTypes** (no SEO, but has `metaTitle`/`metaDescription` inside the `whatsapp` group nested elsewhere), we'd need either a 2-tab variant or reuse "General / Publishing" (SEO tab renders empty). Simplest: pass tab labels as a prop or provide a `sidebarTabsField2` variant. See §4.5. |

---

## 3. Part 3 — Grouping

### Group A — Full replication (sidebar tabs + preview button)
1. Accommodations
2. Tours
3. Rentals
4. Restaurants
5. Spa
6. Venues
7. WaterActivities
8. Yachts

### Group B — Partial (sidebar tabs only, no preview)
9. Destinations
10. ServiceTypes

### Group C — No changes (already inherits block badges + sticky bar globally)
11. Categories — one sidebar field
12. DestinationTypes — three sidebar fields but no status/SEO → tabs would collapse
13. Menus — one sidebar field
14. Media — no sidebar fields
15. Testimonials — no sidebar fields
16. Users — auth collection, one sidebar field

---

## 4. Part 4 — Implementation plan per collection

### 4.1 One-time refactor — shared helpers (recommended FIRST step)

Currently `withSidebarTab` and `sidebarTabsField` live inline in
`collections/Pages.ts`. Move them to a shared file so every collection
imports the same thing:

**New file:** `apps/cms/src/fields/sidebarTabs.ts`
```ts
import type { Field } from 'payload'

export type SidebarTab = 'general' | 'seo' | 'status'

export const withSidebarTab = <T extends Field>(field: T, tab: SidebarTab): T => ({
  ...field,
  admin: {
    ...((field as any).admin || {}),
    className: [((field as any).admin?.className ?? ''), `sidebar-field--${tab}`]
      .filter(Boolean).join(' '),
  },
}) as T

export const sidebarTabsField: Field = {
  name: 'sidebarTabs',
  type: 'ui',
  admin: {
    position: 'sidebar',
    components: { Field: '/admin/SidebarTabs#default' },
  },
}
```

Then Pages.ts + every Group A collection imports it. **Effort:** 15 min.

### 4.2 Preview helper (recommended)

To keep `admin.preview` DRY across 8 collections:

**Extend:** `apps/cms/src/fields/preview.ts` (new)
```ts
export const makePreview = (base: string) => (doc: any) => {
  if (!doc || doc.status !== 'published' || !doc.slug) return null
  const siteUrl = (process.env.SITE_URL || 'http://localhost:4321').replace(/\/$/, '')
  return `${siteUrl}${base}/${doc.slug}`
}
```

Then per collection: `admin: { preview: makePreview('/tour') }`.

### 4.3 Group A — per-collection implementation (Tours as template)

```ts
// apps/cms/src/collections/Tours.ts
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { makePreview } from '../fields/preview'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    preview: makePreview('/tour'),                   // ← NEW
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    sidebarTabsField,                                 // ← NEW (first sidebar field)
    withSidebarTab({ name: 'slug', … }, 'general'),   // ← wrap existing
    // …
    withSidebarTab(statusField,      'status'),
    withSidebarTab(sortOrderField,   'status'),
    withSidebarTab(isFeaturedField,  'status'),
    withSidebarTab(seoFields,        'seo'),
  ],
}
```

Repeat for the other 7 Group A collections with these preview bases:

| # | Collection | `makePreview` arg |
|---|------------|-------------------|
| 1 | Tours | `'/tour'` |
| 2 | Accommodations | `'/villa'` |
| 3 | Rentals | `'/rental'` |
| 4 | Restaurants | `'/restaurant'` |
| 5 | Spa | `'/spa'` |
| 6 | Venues | `'/venue'` |
| 7 | WaterActivities | `'/water-activity'` |
| 8 | Yachts | `'/yacht'` |

**Common sidebar fields for all 8:** `slug` (General), `statusField` (Publishing),
`sortOrderField` (Publishing), `isFeaturedField` (Publishing), `seoFields` (SEO).

**Effort per collection:** ~8–10 min. **Total Group A:** ~1.5 h.

### 4.4 Group B — sidebar tabs only, no preview

#### 4.4.1 Destinations
Sidebar fields: `slug` (General), `parent` (General), `showInFilter`
(Publishing), `statusField` (Publishing), `sortOrderField` (Publishing),
`seoFields` (SEO).
Files to modify: [`collections/Destinations.ts`](../../apps/cms/src/collections/Destinations.ts).
No `admin.preview` — no detail page.

#### 4.4.2 ServiceTypes
Sidebar fields: `slug` (General), `iconName`? (General — currently main
column but consider moving), `status` (Publishing — enum
`active/draft/archived`), `order` (Publishing).
No SEO group in sidebar → **either** collapse `SidebarTabs` to a 2-tab
variant (`general | status`), **or** keep the 3-tab component and let the
"SEO" tab render empty (Payload UI handles empty tabs gracefully — just
awkward UX). Recommendation: add an optional `tabs` prop to `SidebarTabs`.

Files to modify: [`collections/ServiceTypes.ts`](../../apps/cms/src/collections/ServiceTypes.ts).
No `admin.preview`.

**Effort Group B:** ~30 min.

### 4.5 SidebarTabs enhancement (needed for §4.4.2)

Extend `SidebarTabs.tsx` to accept a `tabs` prop via the field
`clientProps`:

```ts
// In the ui field:
{ ...sidebarTabsField, admin: { ...sidebarTabsField.admin,
  clientProps: { tabs: ['general', 'status'] } } }
```

Then `SidebarTabs.tsx` reads `clientProps.tabs` and filters TABS accordingly.
This keeps Group A on the default 3-tab layout while letting ServiceTypes
opt into 2 tabs. **Effort:** ~15 min.

### 4.6 Group C — no changes

Collections in Group C already inherit:
- **Sticky doc-controls** (global CSS)
- **Block badges** — only if they embed `blocks`, which none of these do

No implementation work needed. Confirm by opening any Categories /
Menus / Media / Testimonials / Users edit view — the Save bar should stick
on scroll, and everything else looks default (which is correct).

---

## 5. Total estimated effort

| Task | Effort |
|------|--------|
| Extract helpers (`fields/sidebarTabs.ts`, `fields/preview.ts`) | 15 min |
| Refactor Pages.ts to use extracted helpers | 10 min |
| Group A × 8 collections | ~1.5 h |
| SidebarTabs `tabs` prop | 15 min |
| Group B (Destinations + ServiceTypes) | 30 min |
| Regenerate importMap (auto on `pnpm dev`) | 0 |
| Login-verify each collection | ~20 min |
| **Total** | **~2.5–3 h** |

---

## 6. Rollout order recommendation

1. Land helper refactor (`fields/sidebarTabs.ts` + `fields/preview.ts`) and
   update Pages to use them → verify Pages still works.
2. **Group A batch 1:** Tours, Accommodations, Yachts (most-used).
3. Verify visually + close the loop with owner.
4. **Group A batch 2:** Rentals, Restaurants, Spa, Venues, WaterActivities.
5. SidebarTabs `tabs` prop + Group B (Destinations, ServiceTypes).

---

## 7. Known limitations

- Preview button shows the **published** page, not unsaved edits — same
  Phase 4.8 limitation carries over.
- `ServiceTypes.status` enum is `active`/`draft`/`archived` (not
  `published`) — different from other collections. If we ever add
  `admin.preview` to ServiceTypes, the condition needs to be
  `status === 'active'`, not `'published'`.
- Menu items use nested `type: 'array'` structures — no changes to those.

---

## 8. Rollback

Every change is additive:
- Delete the two new files (`fields/sidebarTabs.ts`, `fields/preview.ts`).
- Revert per-collection edits (single commit per collection recommended
  so cherry-pick / revert is simple).
- No migration or schema change to reverse.

---

## 9. Implementation Notes (added 2026-08-27)

### Files added
| File | Purpose |
|------|---------|
| `apps/cms/src/fields/sidebarTabs.ts` | Exports `sidebarTabsField`, `sidebarTabsFieldWith(tabs)`, `withSidebarTab(field, tab)` — extracted from Pages.ts |
| `apps/cms/src/fields/preview.ts` | Exports `makePreview(base)` — factory for `admin.preview` |

### Files modified
- `apps/cms/src/admin/SidebarTabs.tsx` — added `tabs?: TabKey[]` prop (via `clientProps.tabs`); default = all three. Filters ALL_TABS accordingly and preserves persisted-tab restore.
- `apps/cms/src/collections/Pages.ts` — inlined helpers replaced with imports from `fields/sidebarTabs.ts`; `admin.preview` still bespoke because slug=`home` maps to `/` (not `/home`).
- `apps/cms/src/collections/{Tours,Accommodations,Rentals,Restaurants,Spa,Venues,WaterActivities,Yachts}.ts` — added `sidebarTabsField` + wrapped slug (general), statusField/sortOrderField/isFeaturedField (status), seoFields (seo); added `preview: makePreview('/<base>')` per URL map.
- `apps/cms/src/collections/Destinations.ts` — 3-tab sidebar wrapping slug/parent (general), showInFilter/statusField/sortOrderField (status), seoFields (seo). **No preview** — no detail page.
- `apps/cms/src/collections/ServiceTypes.ts` — 2-tab sidebar via `sidebarTabsFieldWith(['general','status'])`, wrapping slug/key (general), inline status/order (status). **No preview** — landing page rendered through `Pages` catch-all.
- `apps/cms/src/app/(payload)/admin/importMap.js` — no regen needed; SidebarTabs entry from Phase 4.8 is reused as-is (same component path `/admin/SidebarTabs#default`).

### Group C — confirmed unchanged
Categories, DestinationTypes, Menus, Media, Testimonials, Users. Inherit the global block badges + sticky Save bar via CSS/component registration from Phase 4.8. No per-collection edits.

### Deviations from the audit plan
- Pages.ts keeps its bespoke `admin.preview` (rather than switching to `makePreview`) because slug=`home` maps to `/` (root), which the generic helper does not model. All other collections use `makePreview()` unchanged.
- `sidebarTabsFieldWith` was created in addition to the plain `sidebarTabsField` so ServiceTypes could opt into 2 tabs cleanly (rather than a `clientProps.tabs` prop tacked onto the existing field). Simpler at the call site.
- `importMap.js` did NOT need regenerating — Payload's importMap keys by component path (`/admin/SidebarTabs#default`), and every collection reuses the same path.

### Known limitations
- Preview shows the **published** page, not unsaved drafts (Phase 4.8 §D.5 carryover).
- `ServiceTypes.status` enum is `active/draft/archived`, not `published`. `makePreview` gates on `status === 'published'` — so even if we added preview later, it'd need a different helper (kept out of scope).
- Restart of `pnpm dev` recommended after this commit so Next re-compiles the new `fields/*.ts` modules cleanly.

