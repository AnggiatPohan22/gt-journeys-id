# Phase 4.12 — List View Redesign + Breadcrumb Back Navigation

> **Status:** ✅ Done — Pages trial + rolled out to Group A (8 services)
> + Group B (Destinations, ServiceTypes, Categories, Menus, Testimonials).
> tsc clean. Awaiting login visual verify.
> **Scope:** Custom cell components (status chip, template chip, block
> count, relative date) + a global back-nav polish on the step-nav
> breadcrumb.
> **Date:** 2026-08-28
> **Payload version:** 3.33.0 · **Depends on:** Phase 4.8–4.11.

---

## 0. TL;DR

- **List view (Pages trial):** the plain table now shows a colored
  Status chip, a subtle Template chip, a monospace `/slug`, a
  brand-accented "N blocks" pill, and a relative "2 hours ago" cell
  (tooltip = full date). All via per-field `admin.components.Cell`.
- **Back navigation:** Payload's `<StepNav>` breadcrumb already renders
  parent segments as `<Link>` — so "Pages" on `/admin/collections/pages/1`
  is already the working back-to-list link. **No new button was added.**
  We styled `.step-nav > a` as tappable chips with a `←` glyph that
  slides in on hover, so they visibly read as "back". Global — every
  collection edit view inherits it.
- **Reusable:** `StatusCell`, `TemplateCell`, `RelativeDateCell`,
  `BlockCountCell` are collection-agnostic. Attach `admin.components.Cell`
  per field on other collections to opt in.

---

## 1. Part 1 — Audit findings

### Current Pages list view (before)
- Default Payload table: `title | slug | template | status` (raw text)
- No status colors, template shown as raw value, dates raw ISO
- Search on `title`+`slug` (Payload default from `useAsTitle`)

### Payload v3 customization options — verified
- `admin.defaultColumns` ✅ — chooses columns + order
- `admin.listSearchableFields` ✅ — extends the search input
- Per-field `admin.components.Cell` ✅ — replaces one cell's render
- `admin.components.views.list.Component` — full custom view (heavy;
  skipped — per-cell is enough for this scope)
- `ui`-type fields with `admin.components.Cell` ✅ — perfect for virtual
  derived columns like block count / relative date without DB changes
- `<StepNav>` breadcrumb: parent segments are `<Link>` (verified in
  [`@payloadcms/ui/dist/elements/StepNav/index.js`](../../apps/cms/node_modules/@payloadcms/ui/dist/elements/StepNav/index.js)) → back nav is native.

---

## 2. Part 2 — What was built

### Reusable Cell components (`apps/cms/src/admin/cells/*.tsx`)

| Component | Reads | Renders | Reuse-ready? |
|---|---|---|---|
| `StatusCell` | `cellData` (string) | Colored chip w/ dot: published/active → green; draft → coral; archived/inactive → neutral. Handles all status enums we use. | ✅ any collection with a status-like select |
| `TemplateCell` | `cellData` (string) | Subtle neutral chip with the human label. | ⚠️ label map is Pages-specific (default/about/contact/…) — extend the map or subclass for another collection |
| `RelativeDateCell` | `cellData` (ISO string) | `Intl.RelativeTimeFormat` → "2 hours ago"; `title=` full localized timestamp. | ✅ any date field |
| `BlockCountCell` | `rowData.content` | "N blocks" pill; "—" when empty. | ⚠️ hardcoded to `rowData.content` — for other collections wire a similar cell reading their array |

### Pages.ts changes
- Added two `ui`-type virtual fields — `blockCount`, `updatedAtRelative`
  — each with its Cell. Zero schema change.
- `admin.defaultColumns` = `['title', 'status', 'template', 'slug', 'blockCount', 'updatedAtRelative']`
- `admin.listSearchableFields` = `['title', 'slug']`
- Attached `Cell: StatusCell` to Pages' `status` field (override on a
  local copy — the shared `fields/status.ts#statusField` is UNCHANGED so
  other collections keep default rendering until they opt in).
- Attached `Cell: TemplateCell` to Pages' `template` field.

### Row-level CSS polish (`list-view.css`)
- Subtle hover tint on rows
- Title cell weight-600 + accent color on hover
- Slug cell monospaced with a `/` prefix rendered via `::before`

### Step-nav breadcrumb back polish (global)
- `.step-nav > a` styled as a chip: padding, border-radius, hover fill.
- Non-home parent links get a `←` glyph via `mask-image` that slides in
  on hover (0→12px width transition). So "Pages" on the edit view
  reads as "← Pages" while hovering, before click.
- Home icon and the last (current) segment are untouched.

---

## 3. Part 3 — Back button decision

The task said "if a breadcrumb already links back, style it prominently
— no need to add a separate button." Payload's step-nav satisfies that:

```
[Home icon] / <Link>Pages</Link> / <span>Home</span>
                └─ back to /admin/collections/pages       └─ current (no link)
```

So **no extra button was added.** Only CSS: `.step-nav > a` becomes a
chip; hover reveals the `←` glyph. Applies to every collection edit view.

---

## 4. File impact

| File | Action |
|------|--------|
| `apps/cms/src/admin/cells/StatusCell.tsx` | Added |
| `apps/cms/src/admin/cells/TemplateCell.tsx` | Added |
| `apps/cms/src/admin/cells/RelativeDateCell.tsx` | Added |
| `apps/cms/src/admin/cells/BlockCountCell.tsx` | Added |
| `apps/cms/src/admin/list-view.css` | Added — chip styles + row polish + breadcrumb back arrow |
| `apps/cms/src/admin/AdminStyles.tsx` | Imports the new CSS |
| `apps/cms/src/collections/Pages.ts` | Virtual fields + defaultColumns + Cell overrides on `status` + `template` |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Payload auto-regenerates on next dev boot with the 4 new Cell paths |

Data model / DB / Astro / upload / edit / delete: **unchanged**.

---

## 5. Replication guide

To roll this to another collection (e.g. Destinations, Tours):

1. **Status chip (universally applicable):** attach on that collection's
   status field:
   ```ts
   {
     ...statusField,
     admin: {
       ...(statusField as any).admin,
       components: { Cell: '/admin/cells/StatusCell#default' },
     },
   } as any
   ```
   `StatusCell` already understands `published/draft/active/archived/inactive`.

2. **Relative date:** add a `ui` field:
   ```ts
   { name: 'updatedAtRelative', type: 'ui', label: 'Modified',
     admin: { components: { Cell: '/admin/cells/RelativeDateCell#default' } } }
   ```
   and include `'updatedAtRelative'` in `admin.defaultColumns`.

3. **Template chip:** collection-specific labels — either extend
   `TemplateCell`'s `LABELS` map to include the new enum, or write a
   thin wrapper `<XyzTemplateCell>` reusing the same CSS class
   `.dnj-template-chip`.

4. **Item count:** for a collection with an array field (e.g. `blocks`,
   `gallery`), duplicate `BlockCountCell` reading `rowData.<fieldName>`.
   Or generalize `BlockCountCell` to take a field name via a factory.

5. **Row polish** and **breadcrumb back arrow** are global — no
   per-collection work.

---

## 6. Known limitations

- **`updatedAtRelative` isn't sortable** because it's a `ui` field, not
  a real DB column. Users can still sort by native `updatedAt` via
  Payload's Sort control. Documented.
- **`blockCount` isn't sortable** for the same reason. Pages have
  0–20-ish blocks; sorting by count wasn't a strong use case.
- **`StatusCell` covers only the status vocab we use today** —
  published, draft, active, archived, inactive. Unknown values render as
  a neutral chip with the raw string. Extendable.
- Row layout stays the standard Payload table — a "card-style" 2-line
  row (like the mockup) was scoped out to keep the trial small; the
  chip cells already give the density boost the task was after. If you
  want the 2-line card look, add a follow-up phase mirroring the media
  grid CSS transform.
- Breadcrumb parent links visually appear as chips only when there IS a
  parent segment — the Home icon alone (dashboard) is untouched.

---

## 6.1 Rollout status (updated 2026-08-28)

Shared helper `apps/cms/src/fields/listCells.ts` was added exposing
`withStatusCell(field)` and `updatedAtRelativeField` — makes each
collection's opt-in 2 lines of code.

**Rolled out (Pages + 8 Group A + 5 Group B = 14 collections):**

| Collection | Status chip | Relative date | Notes |
|---|:-:|:-:|---|
| Pages | ✅ | ✅ | + blockCount (Pages-specific) + Template chip |
| Tours | ✅ | ✅ | |
| Accommodations | ✅ | ✅ | |
| Rentals | ✅ | ✅ | |
| Restaurants | ✅ | ✅ | |
| Spa | ✅ | ✅ | |
| Venues | ✅ | ✅ | |
| WaterActivities | ✅ | ✅ | |
| Yachts | ✅ | ✅ | |
| Destinations | ✅ | ✅ | |
| ServiceTypes | ✅ | ✅ | Uses inline status field (active/draft/archived) |
| Categories | ✅ | ✅ | |
| Menus | ✅ | ✅ | Uses inline status field (active/inactive) |
| Testimonials | ✅ | ✅ | |

**Not touched (intentionally):**
- Media — has its own Phase 4.11 redesign; different UX
- Users — auth collection, doesn't fit the pattern (no status)
- DestinationTypes — uses `isActive` checkbox instead of status enum

The shared `fields/status.ts#statusField` helper is **still unchanged** —
every collection opts in via `withStatusCell(statusField)` on its own
copy, so removing the opt-in is a one-token revert.

---

## 7. Rollback

- Delete `apps/cms/src/admin/cells/` folder and `list-view.css`.
- Remove the `import './list-view.css'` from `AdminStyles.tsx`.
- Revert the Pages.ts changes (drop `listVirtualFields`, `defaultColumns`,
  `Cell` attachments on `status`/`template`).
- No migration / data change to reverse.
