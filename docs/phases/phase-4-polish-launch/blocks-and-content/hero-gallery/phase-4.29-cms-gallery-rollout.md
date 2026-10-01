## Phase: 4.29 — CMS Gallery Bulk Upload + Grid UI Rollout to Remaining Service Collections
**Tanggal**: 2026-09-05
**Status**: ✅ Complete — all 7 remaining service collections wired · ⏳ owner UAT per collection
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Tours, Restaurants, WaterActivities, Venues, Yachts, Rentals, Spa. (Accommodations already done as pilot in Phases 4.26 → 4.26d.)
**Commits**:
- `8f9e2b7` [cms] rollout(tours): bulk upload + grid gallery UI
- `9504c01` [cms] rollout(restaurants): bulk upload + grid gallery UI
- `1247355` [cms] rollout(water-activities): bulk upload + grid gallery UI
- `8d48e7e` [cms] rollout(venues): bulk upload + grid gallery UI
- `6dcca0b` [cms] rollout(yachts): bulk upload + grid gallery UI
- `ecf3270` [cms] rollout(rentals): bulk upload + grid gallery UI
- `d4c4833` [cms] rollout(spa): bulk upload + grid gallery UI
- `093d1e1` [cms] regen payload-types after 4.29 rollout

### Ringkasan
[Phase 4.26 → 4.26d](phase-4.26-gallery-bulk-upload-photo-viewer.md) validated the CMS gallery upgrade (bulk upload max 10 + custom thumbnail grid + framed card with number badge + bottom toolbar) on Accommodations. This phase rolls out the SAME pattern to the 7 remaining service collections so the [Phase 4.28](phase-4.28-hero-bento-gallery-rollout.md) frontend rollout can be tested end-to-end with real gallery data per collection.

No prep commit needed — the two shared components (`GalleryBulkUpload.tsx`, `GalleryGrid.tsx`) both hardcode `GALLERY_PATH = 'gallery'` which matches every target collection. Rollout is pure config wiring in 7 collection files.

### Step 1 — Findings

**Pilot state (Accommodations)** — at [apps/cms/src/collections/Accommodations.ts:125-155](../../apps/cms/src/collections/Accommodations.ts):
- `ui` sibling `galleryBulkUpload` → renders `/admin/GalleryBulkUpload#default` (bulk upload button).
- `array` field `gallery` with `maxRows: 10`, `admin.className: 'dnj-gallery-grid'`, `admin.components.afterInput: ['/admin/GalleryGrid#default']`.
- Sub-fields: `{ image: upload → media (required), caption: text }`.

**Shared components — already reusable**:
- [apps/cms/src/admin/GalleryBulkUpload.tsx](../../apps/cms/src/admin/GalleryBulkUpload.tsx) — hardcodes `GALLERY_PATH = 'gallery'` (line 27). Works on any field named `gallery`.
- [apps/cms/src/admin/GalleryGrid.tsx](../../apps/cms/src/admin/GalleryGrid.tsx) — same, hardcodes `GALLERY_PATH = 'gallery'`.

**Target collections — zero variance**: verified all 7 have identical gallery structure — same field name (`gallery`), same array shape, same sub-fields (`image: upload → media (required)`, `caption: text`), no prior `maxRows`, no `admin.description`, no custom components. Sitting inside a `collapsible` labeled from shared `s.media.sections.gallery`.

No edge cases. No collection-specific accommodation. No schema change (`maxRows: 10` is a Payload validation constraint at write time, not a DB column).

### Approach
Straight config wiring per collection. For each of the 7:
- Locate the `gallery` array field.
- Add `ui` sibling `galleryBulkUpload` above it.
- Expand array config with `maxRows: 10`, `admin.description` (generic — dropped the villa-bento-specific "First 2 = side bento" reference), `admin.className: 'dnj-gallery-grid'`, `admin.components.afterInput: ['/admin/GalleryGrid#default']`.
- Sub-fields unchanged.

One commit per collection so per-collection rollback is possible. Plus one housekeeping commit for the `payload-types.ts` regen.

### Files Changed
Seven collection files (one commit each):
- [apps/cms/src/collections/Tours.ts](../../apps/cms/src/collections/Tours.ts)
- [apps/cms/src/collections/Restaurants.ts](../../apps/cms/src/collections/Restaurants.ts)
- [apps/cms/src/collections/WaterActivities.ts](../../apps/cms/src/collections/WaterActivities.ts)
- [apps/cms/src/collections/Venues.ts](../../apps/cms/src/collections/Venues.ts)
- [apps/cms/src/collections/Yachts.ts](../../apps/cms/src/collections/Yachts.ts)
- [apps/cms/src/collections/Rentals.ts](../../apps/cms/src/collections/Rentals.ts)
- [apps/cms/src/collections/Spa.ts](../../apps/cms/src/collections/Spa.ts)

Plus one regen commit:
- [packages/shared/src/types/payload-types.ts](../../packages/shared/src/types/payload-types.ts) — auto-regen from `pnpm --filter cms generate:types`. Just adds the new JSDoc description to each of the 7 rolled-out collections' `gallery` field. Data shape / interfaces unchanged (~21 line insertions total, all doc comments).

**Not touched:**
- `payload.config.ts` (importMap already has both components registered from pilot).
- Media collection (`alt` still required — bulk uploader auto-fills from filename).
- AdminStyles.tsx (`gallery-grid.css` already imported; `.dnj-gallery-grid` scope now applies to all 7 too).
- Shared components (`GalleryBulkUpload.tsx`, `GalleryGrid.tsx` — already generic).
- DB / migrations (no schema change).
- Frontend rendering (`item.gallery[]` shape unchanged; 4.28 shared component already handles any gallery length; max-10 constraint prevents CMS from ever storing more than 10).

### Impact
- **DB / schema**: none. `maxRows: 10` enforced at Payload write-time, not in DB.
- **Data shape**: unchanged. All existing `gallery[]` rows across all 7 collections render identically.
- **Existing photos on any record**: untouched.
- **Featured Image**: untouched on every collection.
- **Max-10**: now enforced across all 7 (server + client via bulk uploader remaining-slot count).
- **New dependency**: none.
- **Scope**: CMS-side only. Frontend rendering (4.28) already picks up whatever gallery data exists.
- **Risk**: very low. Same pattern already validated on Accommodations.

### Verification (Step 4)
- ⏳ **Owner UAT** per collection (recommended): log into CMS admin, open one existing record per collection (or create one if empty), verify:
  - Bulk upload button visible above the gallery, correct slots-left count.
  - Existing gallery rows (if any) render as the framed thumbnail grid — not the default array UI.
  - Bulk upload of 3+ images works, appends new rows, Save persists.
  - Try 11 → blocked with "Only N slots left" toast.
  - Edit ✎ opens Media drawer; Delete 🗑 removes only that row; ← → reorders.
- Code-level: importmap unchanged (both components already registered), TypeScript regen clean (only JSDoc changes).

### Rollback
Per-collection surgical revert works — each commit touches only one collection file. Full rollback (leaves pilot Accommodations wiring intact):
```
git revert 093d1e1 d4c4833 ecf3270 6dcca0b 8d48e7e 1247355 9504c01 8f9e2b7
```

### Next
Owner UAT per collection. Any regression → surgical revert of that one collection's commit. Once all 7 clear, this closes the multi-phase gallery arc (4.26 → 4.28 → 4.29) — CMS-side + frontend-side both fully rolled out across all 8 service collections + their detail pages.
