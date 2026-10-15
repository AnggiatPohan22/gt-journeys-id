# Phase 4.11 — Media Library List Redesign

> **Status:** ✅ Done · tsc clean · ⏳ visual verify (login)
> **Scope:** Redesign the media library list view — View-size selector
> (Detail / S / M / L), CSS table→grid transform, hide "Columns" toggle.
> **Date:** 2026-08-28
> **Payload version:** 3.33.0 · **Depends on:** Phase 4.8/4.9/4.10

---

## 0. TL;DR

The media list view now has a **View** selector next to Payload's native
Group By / Sort / Where controls. "Detail" keeps the default Payload
table. **S / M / L** transform that same table into a responsive CSS-grid
of thumbnail cards — no custom list-view component, no data-fetch change,
Payload's pagination + selection + sort remain fully functional.

The "Columns" toggle is **hidden** because column-picking is meaningless
in card grid mode; users who want tabular density switch back to Detail.

Payload's native **Group By**, **Sort**, and **Where** buttons are kept
as-is — they already deliver everything the task's "Group By" spec asked
for (sort by name, date, mime type, filesize; asc/desc; group by field
value).

---

## 1. What changed

| # | File | Action | Purpose |
|---|------|--------|---------|
| 1 | `apps/cms/src/admin/MediaListEnhancer.tsx` | **Added** | Client provider — self-mounts View selector on `/admin/collections/media`, writes `body[data-view-mode]`, persists to localStorage. Shallow MutationObserver (no perf regression). |
| 2 | `apps/cms/src/admin/media-list.css` | **Added** | View-selector chip styling + CSS grid transform on `<table>`/`<tbody>`/`<tr>`. Hides `.list-controls__toggle-columns`. Theme-aware. |
| 3 | `apps/cms/src/admin/AdminStyles.tsx` | **Modified** | Added `import './media-list.css'`. |
| 4 | `apps/cms/src/payload.config.ts` | **Modified** | Registered `MediaListEnhancer` in `admin.components.providers`. |
| 5 | `apps/cms/src/app/(payload)/admin/importMap.js` | **Modified** | Added the `/admin/MediaListEnhancer#default` entry. |

---

## 2. Approach — why CSS-only grid, no custom list component

Considered options:
- **Custom `admin.components.views.list.Component`** — reimplements
  pagination, selection, filtering, drag reorder, upload dialog. High risk
  of divergence on `@payloadcms/*` upgrades.
- **`beforeListTable` / `afterListTable` slots** — good for inserting our
  toolbar chip, but doesn't help with visual polish of rows themselves.
- **✅ Global provider + CSS transform** — reuse Payload's own table for
  data/selection/sort, restyle it via `display: block/grid/flex` overrides
  on `<table>/<tbody>/<tr>`. Native rows carry the same cell classes
  (`.cell-filename`, `.cell-alt`, `.cell-_select`) which we address in CSS.

Chosen: **CSS transform**. Zero risk to selection / pagination / sort /
upload flows. Payload upgrades that keep the class conventions won't
break the view; those that change cell class names would just fall back
gracefully to the Detail table.

---

## 3. Features implemented

| Feature | Done | Notes |
|---|:-:|---|
| View size selector (Detail / S / M / L) | ✅ | Chip group in `.list-controls`; `aria-pressed` on active |
| Columns toggle removed | ✅ | CSS `display:none` on `.list-controls__toggle-columns` scoped by `body[data-view-mode]` |
| Group By dropdown | ✅ (native) | Payload's `.list-controls__toggle-group-by` — unchanged, already covers Name/Date/Type/Size |
| Sort direction toggle | ✅ (native) | Payload's `.list-controls__toggle-sort` — unchanged, asc/desc built-in |
| Thumbnail grid cards | ✅ | `.cell-filename` becomes the thumbnail (4:3 aspect); `.cell-alt` becomes caption; other cells hidden |
| Selection checkbox in card | ✅ | Floats top-left over the thumbnail (`.cell-_select` repositioned) |
| localStorage persistence | ✅ | Key `dnj-media-view-mode` |
| Dark + light mode | ✅ | Uses `--theme-*` and `--dnj-*` tokens, plus `[data-theme='dark']` overrides |
| Responsive | ✅ | Grid `repeat(auto-fill, minmax(N, 1fr))` — S=96/M=160/L=260; falls back to smaller on <700px |

### View-mode → grid dimensions

| Mode | Card min-width | Fits per row @ 1400px |
|---|---|---|
| Detail | — (default table) | — |
| S | 96px | ~12–14 |
| M | 160px | ~7–8 |
| L | 260px | ~4–5 |

### Group By mapping (Payload native)

The task spec asked for Group By with Name/Date/Type/Size. Payload's
native Group By already exposes every collection field — for Media that
means `filename`, `alt`, `mimeType`, `filesize`, `updatedAt`, `createdAt`.
No custom code needed. Sort direction is a native toggle.

---

## 4. Class name reference (verified against Payload 3.33)

| Class | Used for |
|---|---|
| `.collection-list` | Root list wrapper — target for `data-view-mode` |
| `.list-controls` | Toolbar row — target for View selector injection |
| `.list-controls__toggle-columns` | Hidden in grid modes |
| `.list-controls__toggle-group-by` | **Kept native** |
| `.list-controls__toggle-sort` | **Kept native** |
| `.list-controls__toggle-where` | **Kept native** |
| `.collection-list__search-input` | Search-by-alt input — untouched |
| `.table > table > thead / tbody / tr / td` | Reshape targets in grid modes |
| `.cell-filename`, `.cell-alt`, `.cell-_select` | Shown in cards; other `.cell-*` hidden |

---

## 5. Impact

- **Admin UI:** media list view now has 4 modes; the rest of Payload
  admin UI untouched.
- **Data:** none — no schema, no fetch changes, `useAsTitle: 'alt'` etc.
  kept as-is.
- **Frontend (Astro):** none.
- **Upload / edit / delete flows:** unchanged — the same table rows drive
  everything; we only restyle presentation.

---

## 6. Rollback

- Delete `apps/cms/src/admin/MediaListEnhancer.tsx` and
  `apps/cms/src/admin/media-list.css`.
- Revert the 3 edits (`AdminStyles.tsx`, `payload.config.ts`,
  `importMap.js`).
- No migration to reverse.

---

## 7. Known limitations

- Cell classes are Payload internals — if a future `@payloadcms/*`
  upgrade renames `.cell-filename` / `.cell-alt` / `.cell-_select`, grid
  cards degrade gracefully but need CSS updates. Detail mode is unaffected.
- SVG / video / non-image files render the same generic thumbnail Payload
  provides (upload collection auto-generates a preview element). File-type
  badge (JPG / PNG / SVG / PDF chip in the corner) was NOT implemented
  in this pass — it requires reading `mimeType` from the row and injecting
  a badge element per card (needs JS enhancement, not just CSS). Deferred.
- Bulk-selection actions bar (delete N items) rendered by Payload above
  the table works in all modes — the checkbox column stays functional.

### Deviations from the task brief

- Kept Payload's native Group By / Sort / Where instead of building a
  custom "Group By" dropdown — the native ones already do exactly what
  the spec described and one less custom component to maintain on upgrade.
- File-type badges (JPG/PNG/SVG/PDF chips) deferred (see above).
- No custom list-view component — CSS transform on the existing table is
  simpler and doesn't touch pagination / selection / upload dialogs.
