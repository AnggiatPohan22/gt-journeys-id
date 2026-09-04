## Phase: 4.26c — Gallery Grid: Fully Custom Render Component (supersedes 4.26b)
**Tanggal**: 2026-09-02
**Status**: ✅ Complete — user-verified
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Accommodations gallery array field only (pilot).
**Commits**:
- `5dc91f3` [cms] fix(accommodations): rewrite gallery grid as fully custom component

### Ringkasan
[Phase 4.26b](phase-4.26b-gallery-grid-css-attempt.md)'s CSS-only restyle of Payload's default array UI failed — rows didn't stretch, only 1 image visible, buttons overlapped label + upload-cell controls. Root cause: Payload's `Collapsible` wraps row content in a `react-animate-height` div with **inline `style="height:0"`** when collapsed, and CSS `!important` cannot defeat inline styles reliably. Also array rows are nested inside unclassed dnd wrapper divs → grid cells landed on wrappers, not on styled rows.

**Pivot**: stop fighting Payload's DOM. Hide the default array UI entirely and render a **fully custom grid from form state**. Edit UX (Payload's "Choose from library" / "Create new" / drawer popup) is preserved via `useDocumentDrawer` hook — no dependency on the array row DOM.

### Root Cause (of 4.26b failure)
Traced against Payload 3.87 source (`@payloadcms/ui/dist/fields/Array/*` + `elements/Collapsible/*`):

- **Rendered as rows, not grid**: `.array-field__draggable-rows` gets `display:grid` correctly, but its direct children are **unclassed dnd wrapper divs** (`ArrayRow` outer element from `DraggableSortableItem` Fragment). Grid items = wrappers, not `.array-field__row` we styled. Rows inherited default block flow.
- **Only 1 card visible**: Payload's `Collapsible` wraps content in a `react-animate-height` div with **inline `style="height:0"`** when collapsed. Rows init collapsed → invisible. `.collapsible__content { display:block !important; height:100% }` cannot defeat parent inline style.
- **Delete overlapped label**: hide-selector missed `.collapsible__header-wrap` (actual container of "Gallery 01"). Overlay `top:8px` delete button landed on top.
- **Reorder mepet with Edit**: overlay `bottom:8px` buttons collided with Payload's upload-cell action buttons in the same band.

Data check confirmed record #4 had 5 photos in DB (verified via frontend villa page rendering 5 gallery images) — pure render bug, not missing data.

### Fix Approach
Full custom component. Payload's own array field stays wired for validation + serialization only — its UI is CSS-hidden.

### Files Changed
- **New** [apps/cms/src/admin/GalleryGrid.tsx](../../apps/cms/src/admin/GalleryGrid.tsx) — ~230 LOC client component mounted via `admin.components.afterInput` on the array. Owns:
  - `useAllFormFields()` → read rows + media ids.
  - Batched `GET /api/media?where[id][in]=...&depth=0&limit=<n>` → cache `id → { thumbnailUrl, filename, alt }`.
  - Responsive CSS grid (4/3/2/1 cols at 900/640/480px breakpoints).
  - Per card: thumbnail, index badge (top-L), Edit ✎ + Delete 🗑 (top-R, 12px gap), reorder ← / → (bottom corners — opposite side from top-R, guaranteed no overlap).
  - Edit ✎ uses `useDocumentDrawer({ collectionSlug: 'media', id: mediaId })` → opens Payload's built-in Media doc drawer (replace file, edit alt/caption — same UX as clicking a Payload upload cell today).
  - Delete 🗑 → `dispatchFields({type:'REMOVE_ROW', ...})` + `setModified(true)` + `window.confirm`.
  - Reorder → `dispatchFields({type:'MOVE_ROW', ...})` + `setModified(true)`. First card's ← disabled; last card's → disabled.
  - Missing-media state (deleted Media doc referenced) renders warning card, not blank.
  - Empty state points at Bulk upload above.
- **Rewritten** [apps/cms/src/admin/gallery-grid.css](../../apps/cms/src/admin/gallery-grid.css) — dropped "restyle Payload's rows" rules; new rules hide `.array-field__draggable-rows` + `__header` + `__add-row` under `.dnj-gallery-grid` scope; owns `.dnj-gg` + `.dnj-gg__card` + `.dnj-gg__btn` classes for the new layout. No `!important` fights.
- **Edit** [apps/cms/src/collections/Accommodations.ts](../../apps/cms/src/collections/Accommodations.ts) — gallery `admin.components.afterInput = ['/admin/GalleryGrid#default']`; removed row-level `beforeInput` overlay (4.26b).
- **Deleted** `apps/cms/src/admin/GalleryCardOverlay.tsx` — superseded by GalleryGrid.
- Regen `importMap.js` (auto: GalleryGrid registered, overlay removed).

### Impact
- **CMS / data**: unchanged. Same array of `{image, caption}` rows. Existing photos render as-is; no migration.
- **New dependency**: none.
- **Bulk upload / max-10 (Phase 4.26 / 4.26a)**: preserved — separate `ui` field above the array, untouched.
- **Edit (E3 UX)**: preserved via Payload's built-in `useDocumentDrawer`.

### Trade-offs
- Reorder is now arrows-only (drag-and-drop dropped — grid doesn't play well with dnd-kit's 1D vertical strategy).
- Payload upload-cell's "Choose from library" / "Create new" shortcut buttons removed from cards; users bulk-upload new photos and delete unwanted ones. Edit-in-place drawer covers file-replace on an existing row.

### Verification (offline, pre-user)
- ✅ `useDocumentDrawer` API signature checked (`{collectionSlug, id}` → `[Drawer, Toggler, ctx]`).
- ✅ Reducer actions `REMOVE_ROW` / `MOVE_ROW` unchanged from 4.26/4.26a.
- ✅ Importmap registered; obsolete overlay removed.
- ✅ CSS scoped to `.dnj-gallery-grid` — no leakage.
- ✅ User-verified end-to-end after commit landed.

### Rollback
```
git revert 5dc91f3
```
Or `git revert 5dc91f3 f892e79` to also drop the 4.26b attempt (both cleanly independent).

### Next
[Phase 4.26d](phase-4.26d-gallery-card-framed-layout.md) — polish each card into a framed layout with image top + bottom toolbar.
