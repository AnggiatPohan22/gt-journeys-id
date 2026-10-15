## Phase: 4.26b — Gallery Thumbnail-Grid UI (pure-CSS attempt, superseded)
**Tanggal**: 2026-09-02
**Status**: ⚠️ Superseded by Phase 4.26c — approach did not deliver the intended grid
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Accommodations gallery array field only (pilot).
**Commits**:
- `f892e79` [cms] feat(accommodations): gallery thumbnail-grid UI (pilot)

### Ringkasan
Attempt #1 to replace the default "Gallery 01 / 02 / ..." vertical row stack on the Accommodations gallery array with a **4-per-row thumbnail grid** using **CSS-only restyle** of Payload's own array UI (no custom render component). Approach: add `admin.className: 'dnj-gallery-grid'` on the array + a `beforeInput` overlay component (`GalleryCardOverlay.tsx`) for reorder / delete buttons + scoped CSS that hides Payload's row header and turns the rows list into a grid.

Owner testing showed the approach broke visually — see [Phase 4.26c](phase-4.26c-gallery-grid-custom-component.md) for the root-cause investigation and the successful rewrite.

### What Was Attempted
- **New CSS** `apps/cms/src/admin/gallery-grid.css` — scoped under `.dnj-gallery-grid.array-field`, tried to:
  - Turn `.array-field__draggable-rows` into `display: grid; grid-template-columns: repeat(4, 1fr)`.
  - Restyle each `.array-field__row` as an aspect-ratio 4/3 card.
  - Force `.collapsible__content { display: block !important; height: 100% }` to defeat the always-collapsed state.
  - Hide row header, caption input, add-row button, three-dot popup.
- **New component** `apps/cms/src/admin/GalleryCardOverlay.tsx` — rendered per row via `admin.components.beforeInput` on the inner `image` upload field. Provided ← → reorder + 🗑 delete overlay + index badge. Dispatched `MOVE_ROW`/`REMOVE_ROW` via `useForm().dispatchFields`.
- **Edit** [apps/cms/src/collections/Accommodations.ts](../../apps/cms/src/collections/Accommodations.ts) — added `admin.className: 'dnj-gallery-grid'` on gallery array + `beforeInput` slot on the image upload field.
- **Edit** [apps/cms/src/admin/AdminStyles.tsx](../../apps/cms/src/admin/AdminStyles.tsx) — imported new CSS.
- Regen `importMap.js`.

### Why It Didn't Work (root causes, verified against Payload 3.87 source)
Documented in [Phase 4.26c](phase-4.26c-gallery-grid-custom-component.md) Step 1 audit. Summary:
- `.array-field__row` is NOT a direct child of `.array-field__draggable-rows` — Payload wraps it in an **unclassed dnd wrapper div** (`ArrayRow` outer element). Grid cells landed on wrappers, not on styled rows.
- Payload's `Collapsible` wraps content in a `react-animate-height` div with **inline `style="height:0"`** when collapsed. CSS `!important` cannot defeat inline styles reliably. Rows initialize collapsed → invisible content → user saw only 1 image rendered.
- Row header ("Gallery 01" label) lives inside `.collapsible__header-wrap` (not `.array-field__row-header` I targeted) → hide selector missed → overlay Delete button landed on top of the visible label.
- Overlay reorder buttons at `bottom:8px` collided with Payload's upload-cell action buttons in the same band ("mepet").

### Impact
- **CMS / data**: unchanged.
- **New dependency**: none.
- **Scope**: Accommodations only.

### Verification
- ❌ Owner testing showed: still rendering as rows (not grid), only 1 image visible, Delete overlapped label, reorder mepet with Edit.
- Investigation → Phase 4.26c rewrite (pivot to fully custom render component).

### Rollback
```
git revert f892e79
```
Superseded by Phase 4.26c (`5dc91f3`). If reverting the whole pilot, revert both hashes.

### Next
[Phase 4.26c](phase-4.26c-gallery-grid-custom-component.md) — abandon the CSS-restyle approach, hide Payload's default array UI entirely, render a fully custom grid from form state via `useDocumentDrawer` for the Edit action.
