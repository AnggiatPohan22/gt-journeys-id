# Phase 4.16 — "Curated Alternatives" → Reusable Service Grid Template

> **Status:** ✅ SELESAI (Pass 1 + Pass 2)
> - **Pass 1** (commit `4ee3998`): block field baru + `CuratedCard.astro`
>   + branch `template === 'curated'` + `excludeId` di `BlockRenderer`.
> - **Pass 2**: hardcode "Curated Alternatives" / "More X" DIHAPUS dari
>   8 halaman detail. Fallback synthesizer render `<ServiceGridBlock>`
>   curated auto otomatis kalau editor belum pasang block-nya sendiri.
>   `extraWhere` prop di-tambah supaya villa/spa/rental preserve
>   same-sub-type filter (villa `type`, spa `treatmentType`, rental
>   `rentalType`). Astro build 50 halaman sukses — halaman count identik.
> **Scope:** Retire the hardcoded "recommended alternatives" section
> at the bottom of every service detail page. Fold its card design
> into the Service Grid block as a new template so editors control
> the section from the CMS (title, size, filtering, position).
> **Date:** 2026-08-28 · **Payload:** 3.33.0 · **Depends on:** Phase 4.15.

---

## 0. TL;DR

- **All 8 service detail pages have the same hardcoded pattern.** Same
  fetch (`get<Service>(sort: 'sortOrder', limit: 10)` → filter out
  current → first 3) + same 3-col card grid. Only the heading text
  differs (`"Curated Alternatives"` on 4 pages, `"More <Type>"` on 4).
- **Every one of those 8 pages already renders `additionalBlocks` via
  `<BlockRenderer>` immediately BEFORE the hardcoded section** — the
  drop-in slot for a Service Grid block already exists. Replacing the
  hardcode with a CMS-driven block is architecturally free.
- **Recommendation:** add a new `template` field to the `serviceGrid`
  block with a `curated` option that mirrors the current hardcoded
  card look, plus a `mode` (auto = "same type minus current" / all).
  Ship the block + the auto mode first, then remove hardcode in a
  second pass with a safe fallback so pages without the block don't
  end blankly.
- **Effort:** ~3–4 h across CMS + Astro + doc.

---

## 1. Part 1 — Hardcoded sections found

Grep result (`Curated|Alternative|More <Type>|recommended` across
`apps/web/src/pages/*/[slug].astro`):

| Service Page | File | Heading text | Line numbers | Selection |
|---|---|---|---|---|
| Tour | [tour/[slug].astro](apps/web/src/pages/tour/[slug].astro) | **"Curated Alternatives"** | 425–466 (section) · 96–100 (fetch) | `getTours({ limit: 10, sort: 'sortOrder' })` → filter `id !== current` → `.slice(0, 3)` |
| Villa | [villa/[slug].astro](apps/web/src/pages/villa/[slug].astro) | **"Curated Alternatives"** | 465–end · 122–130 (fetch) | Same pattern on `getAccommodations` |
| Spa | [spa/[slug].astro](apps/web/src/pages/spa/[slug].astro) | **"Curated Alternatives"** | 387–end · 102–109 | Same on `getSpas` |
| Rental | [rental/[slug].astro](apps/web/src/pages/rental/[slug].astro) | **"Curated Alternatives"** | 384–end · 99–… | Same on `getRentals` |
| Yacht | [yacht/[slug].astro](apps/web/src/pages/yacht/[slug].astro) | **"More Yachts"** | 256–… · 72–75 | Same on `getYachts` |
| Water Activity | [water-activity/[slug].astro](apps/web/src/pages/water-activity/[slug].astro) | **"More Activities"** | 231–… · 78–81 | Same on `getWaterActivities` |
| Restaurant | [restaurant/[slug].astro](apps/web/src/pages/restaurant/[slug].astro) | **"More Restaurants"** | 278–… · (fetch line similar) | Same on `getRestaurants` |
| Venue | [venue/[slug].astro](apps/web/src/pages/venue/[slug].astro) | **"More Venues"** | 287–… · (fetch line similar) | Same on `getVenues` |

**All 8 pages share the identical algorithm.** The 4 non-"Curated"
pages just use a shorter heading. Structurally they're the same
section; naming was inconsistent because each page was authored
piecemeal.

---

## 2. Part 2 — Visual design of the current hardcoded section

Quoted verbatim from `tour/[slug].astro:425–466` (all 8 pages use this
same shape, only the collection type + heading text vary):

```astro
<section class="container-content mb-24">
  <div class="flex flex-wrap justify-between items-end gap-4 mb-10">
    <h2 class="font-display text-2xl md:text-3xl text-ocean">Curated Alternatives</h2>
    <a href="/tour" class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:text-coral no-underline">
      Explore All Tours <Icon name="arrow_forward" />
    </a>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
    {recommended.map((rec) => (
      <a href={`/tour/${rec.slug}`} class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-sand-dark/20 hover:-translate-y-1 no-underline">
        <div class="relative h-56 overflow-hidden">
          {rUrl && <img src={rUrl} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
          {rPrice && (
            <div class="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
              <span class="text-xs font-semibold text-ocean">{price}<span class="font-normal">/pax</span></span>
            </div>
          )}
        </div>
        <div class="p-5">
          <h3 class="font-display text-lg text-ocean mb-1 group-hover:text-coral">{rec.title}</h3>
          {rDest && <p class="text-xs text-stone-light mb-3"><Icon name="location_on" /> {rDest.name}</p>}
          <div class="flex items-center gap-4 text-stone-light text-xs">
            {rec.duration && <span><Icon name="schedule" /> {rec.duration}</span>}
            {rec.maxParticipants && <span><Icon name="group" /> Max {rec.maxParticipants}</span>}
          </div>
        </div>
      </a>
    ))}
  </div>
  <div class="mt-8 text-center sm:hidden">
    <a href="/tour" class="inline-flex items-center gap-2 text-sm font-semibold text-ocean bg-ocean/10 px-6 py-3 rounded-lg no-underline">
      Explore All Tours <Icon name="arrow_forward" />
    </a>
  </div>
</section>
```

**Design characteristics:**
- Section title: `font-display text-2xl md:text-3xl text-ocean`
- Right-aligned "Explore All X" pill link (hidden on mobile, replaced
  with a full-width version at the bottom)
- Grid: 1 col mobile, 3 cols ≥md; gap 6/8
- Card: white bg, rounded-2xl, subtle shadow, hover lift + border tint
- Image: `h-56 object-cover`, hover zoom (`scale-105`), rounded top
- Price chip: absolute top-right, white/95 backdrop-blur, ocean text
- Meta row: destination pin + 1–2 stats (duration, max group, etc.)
  — chosen per service type (tour uses duration/participants; villa
  uses beds/baths; etc.)

**How it differs from Service Grid's current compact card:**
- Larger image (h-56 vs compact's smaller preview)
- Price chip is FLOATING over the image (compact renders price below)
- Distinct hover animation: card lifts + image zooms simultaneously
- Meta line uses per-collection icons (`schedule`/`group`/`bed`/
  `bath`) instead of the compact card's simple text row.

Verdict: **not identical to the existing `compact` or `detailed`
variants**. Reasonable to introduce as a third **`curated`** template
option in the block.

---

## 3. Part 3 — Custom section / blocks status

All 8 service pages already fetch and render CMS blocks:

```astro
// e.g. tour/[slug].astro:79
const additionalBlocks = ((item as any).additionalBlocks ?? []) as any[]

// e.g. tour/[slug].astro:422–423
{/* ═══ CUSTOM SECTIONS (super-admin blocks) ═══ */}
{additionalBlocks.length > 0 && <BlockRenderer blocks={additionalBlocks} />}

{/* ═══ RECOMMENDED ALTERNATIVES ═══ */}   // ← hardcoded below
```

**The `additionalBlocks` slot renders IMMEDIATELY BEFORE the
hardcoded section.** So a super-admin adding a Service Grid block to
that slot with the `curated` template today would render right where
the hardcoded section currently sits. The two would double up until
the hardcode is removed.

**Answers to Part 3 questions:**
- Services have a custom block section: **YES** (all 8, via
  `additionalBlocks`).
- Block can render in the same position as the hardcode: **YES**
  (immediately above; visually indistinguishable once the hardcode is
  removed).
- Full CMS control feasible: **YES** — title, item count, filter,
  visibility, and even removing the section entirely all become
  editorial decisions.

---

## 4. Part 4 — Plan (proposed)

Ship in **two safe passes** so no page ever loses its recommended
section mid-flight.

### Pass 1 — Add the `curated` template + `auto` mode to Service Grid
(Ship-with-hardcode-still-live so nothing breaks visually.)

**CMS side** ([`apps/cms/src/blocks/index.ts`](apps/cms/src/blocks/index.ts) — `ServiceGrid`):
- Add `template` select (default `default`) alongside the Phase 4.15
  `cardVariant`. Options:
  - `default` — current 3-up grid using `cardVariant`
  - `curated` — matches the hardcoded look above (large image, floating
    price chip, per-type meta line)
- Add `selectionMode` select (default `manual`) to describe HOW items
  are chosen when `template === 'curated'`:
  - `manual` — respect `serviceType` + `limit` + `featuredOnly` (today)
  - `auto` (recommended for the Curated preset) — same-service-type,
    exclude the CURRENT detail-page doc, take first N sorted by
    `sortOrder`. Zero manual curation needed → editors just drop the
    block on a detail page's custom section, and it auto-fills.
- Add optional `sectionTitle` (default: derived from `serviceType` →
  "Curated Alternatives" / "More Yachts" etc.). Editor can override.
- Add optional `viewAllLink` (already exists in Service Grid). Reuse
  for the "Explore All …" link.

**Frontend side:**
- Add `apps/web/src/components/cards/CuratedCard.astro` — extracted
  from the hardcode above; accepts `{ item, hrefBase, serviceType }`
  and renders the correct per-type meta line via a small `switch`.
- `ServiceGridBlock.astro`: when `block.template === 'curated'`,
  render the section wrapper + heading + right-pill + `CuratedCard`
  loop + bottom mobile CTA. Grid columns fixed at `md:grid-cols-3`
  for this template (part of the design contract).
- When `selectionMode === 'auto'` AND the block runs on a detail
  page, we need the CURRENT doc's id to exclude. Two options:
  - (i) Pass `Astro.props.excludeId` from each detail page into
    `<BlockRenderer blocks={additionalBlocks} excludeId={item.id} />`.
    Small `BlockRenderer` signature bump; ServiceGridBlock reads via
    Astro `Astro.props`. Cleanest.
  - (ii) Read from a URL slug + a helper. More brittle.
  Recommend (i).

**No DB migration.** `template` / `selectionMode` / `sectionTitle` are
optional selects/strings with defaults, back-fill at read time.

### Pass 2 — Remove the hardcoded section from each detail page
(Only after Pass 1 is verified in prod on at least one page.)

- Remove lines 425–466 (tour) and equivalent blocks on the other 7
  pages.
- Also remove the `let recommended = …` fetch block above (unused
  after Pass 1 covers it).
- **Fallback safety:** each page can render a Service Grid block on
  the fly if the doc's `additionalBlocks` is empty AND no `curated`
  block exists. Two implementation options:
  - (a) Silent removal — trusts editors to add the block. Simplest,
    but any published page without one shows nothing there.
  - (b) Frontend default: when `additionalBlocks.length === 0`, render
    `<ServiceGridFallback serviceType=… excludeId=… />` with the
    `curated` template preset. Zero data change, guarantees the
    section still appears everywhere.
  Recommend (b) — matches current behaviour byte-identical when the
  editor takes no action.

### One-time data step (optional, deferred)
For any existing published service doc that WANTS the curated block
customized (different title, extra manual picks), the editor adds it
manually. No bulk migration needed. If bulk migration is later
requested, write a `pnpm tsx` script that iterates every service doc
and injects a `serviceGrid` block with `{template: 'curated',
selectionMode: 'auto'}` at the tail of `additionalBlocks`.

---

## 5. Part 5 — Risk assessment

| Risk | Level | Explanation | Mitigation |
|---|:-:|---|---|
| Existing service pages lose their recommended section between passes | 🟡 MED | If Pass 2 ships before editors add blocks, pages go blank in that slot | Ship Pass 2's frontend fallback (option b) — auto-render Service Grid `curated` when the slot is empty. Zero-config for editors. |
| `curated` template visual doesn't match the hardcode exactly | 🟢 LOW | Extraction preserves classes 1:1 (Tailwind classes are already in the JSX) | Trial on Tour first, diff screenshot vs baseline, tweak once |
| Per-type meta line drift (bed/bath/duration/participants differ per service) | 🟢 LOW | Handled explicitly by service-type switch inside CuratedCard | Table-drive the per-type meta config in one place |
| Frontend build regressions | 🟢 LOW | Astro `output: 'static'` — build fails loudly if a prop shape drifts | tsc + astro build in CI before ship |
| CMS-user confusion after removal | 🟢 LOW | Pass 2 keeps a fallback; editors only need to know the block exists if they want to customize | Note in CMS `admin.description` on the block + phase doc |
| `additionalBlocks` position vs desired position | 🟢 LOW | Hardcode sits IMMEDIATELY AFTER `additionalBlocks` today, so behaviour identical | Verified in §3 |
| Fetch cost duplication | 🟢 LOW | Pass 2's fallback runs on every service page (as today); explicit editorial block would replace it | Cache remains Astro's `getStaticPaths` render cache — same as today |

---

## 6. Estimated effort

| Task | Effort |
|---|---|
| Add `template`/`selectionMode`/`sectionTitle` fields to ServiceGrid | 20 min |
| `CuratedCard.astro` extraction from tour/villa/etc. + per-type switch | 45 min |
| `ServiceGridBlock.astro` template branch + `excludeId` prop plumbing | 30 min |
| `BlockRenderer.astro` signature bump for `excludeId` | 10 min |
| Frontend fallback (Pass 2 option b) | 30 min |
| Remove hardcode from 8 pages | 20 min |
| Verification pass — screenshot diff on Tour/Villa/etc. | 30 min |
| Docs + tsc + astro build check | 15 min |
| **Total** | **~3–4 h** |

---

## 7. Recommendation

- **Approve Pass 1** first as a low-risk feature add. Ship the
  template + fields + `CuratedCard` component. Do NOT remove any
  hardcode yet.
- **Verify** on one page (Tour recommended) that Service Grid with
  `template: 'curated', selectionMode: 'auto'` renders identical to
  the hardcode.
- **Pass 2** after verification — remove hardcode from all 8 pages,
  ship the fallback so blank pages still show a section.
- **Optional Pass 3** (future): bulk-inject a `curated` block into
  every existing service doc's `additionalBlocks` so editors have an
  editable block to tweak (instead of relying on the frontend
  fallback).

---

## 8. Files that would change (Pass 1 + Pass 2)

| File | Change |
|---|---|
| `apps/cms/src/blocks/index.ts` | +3 fields on `serviceGrid` (`template`, `selectionMode`, `sectionTitle`) |
| `apps/web/src/components/cards/CuratedCard.astro` | NEW — extracted from tour/villa/rental/spa card JSX; per-type meta line |
| `apps/web/src/components/blocks/ServiceGridBlock.astro` | branch on `template === 'curated'`; auto-mode fetch (respects `excludeId`) |
| `apps/web/src/components/blocks/BlockRenderer.astro` | +1 prop: `excludeId?: number \| string` — pass-through to Service Grid |
| `apps/web/src/pages/{tour,villa,rental,spa,yacht,water-activity,restaurant,venue}/[slug].astro` | Pass 2: remove hardcoded section (lines specified in §1) + drop unused `recommended` fetch. Add the fallback `<ServiceGridFallback>` (or equivalent) when `additionalBlocks.length === 0`. |
| `packages/shared/src/types/payload-types.ts` | auto-regenerated |
| `apps/cms/src/app/(payload)/admin/importMap.js` | unaffected (no new admin components) |

**Zero:** DB schema, access rules, other blocks, CMS list views,
admin UI beyond one extra select field.

---

## 9. Rollback

- Pass 1: block-config-only revert. Delete the added fields; the
  `CuratedCard` component becomes dead code but breaks nothing.
- Pass 2: `git revert` restores the hardcoded sections on all 8 pages
  in one commit.
- No data migration to reverse.
