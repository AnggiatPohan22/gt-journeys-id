## Phase: 4.26d — Gallery Card Framed Layout Polish
**Tanggal**: 2026-09-03
**Status**: ✅ Complete
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Accommodations `GalleryGrid.tsx` component + `gallery-grid.css` only.
**Commits**:
- `155c14d` [cms] polish(accommodations): framed gallery cards with bottom toolbar

### Ringkasan
Pure presentational polish on top of [Phase 4.26c](phase-4.26c-gallery-grid-custom-component.md). Restructure each card from a single aspect-4/3 frame with over-image absolute buttons into a **two-zone framed layout**:

```
┌─────────────────────────┐
│  Image (aspect 4/3)     │  ← thumbnail + [1] badge overlay
├─────────────────────────┤
│  [←] [→]      [✎] [🗑]  │  ← toolbar band (light bg + top border)
└─────────────────────────┘
```

Zero functional changes — same handlers, same dispatches, same DocumentDrawer wiring, same batched media fetch.

### Approach
- **Card**: `display:flex; flex-direction:column`; aspect-ratio moved off card and onto `.dnj-gg__image` only.
- **Image zone**: hosts thumbnail + number badge overlay.
- **Toolbar zone**: `display:flex; justify-content:space-between; min-height:44px`; own bg (`--theme-elevation-100`) + top border for visual separation. Two flex groups:
  - Left: nav (← →), 8px inner gap.
  - Right: actions (✎ Edit / 🗑 Delete), 8px inner gap.
- Buttons swap from dark-translucent (over-image style) to theme-aware neutral chips (elevation-0 bg + elevation-200 border) that read on light band. Edit hover reveals green tint; Delete hover reveals red tint; nav stays neutral.
- **Number badge**: stays over image, gains 1px white ring + soft drop shadow → legible on both light AND dark photos.

### Files Changed
- [apps/cms/src/admin/GalleryGrid.tsx](../../apps/cms/src/admin/GalleryGrid.tsx) — Card JSX restructured: wrap thumb + badge in `.dnj-gg__image`; wrap the four buttons in `.dnj-gg__toolbar` with two `.dnj-gg__group` flex groups. Handlers untouched.
- [apps/cms/src/admin/gallery-grid.css](../../apps/cms/src/admin/gallery-grid.css) — added `.dnj-gg__image`, `.dnj-gg__toolbar`, `.dnj-gg__group`; dropped obsolete `.dnj-gg__btn--prev/--next` absolute-positioning; updated `.dnj-gg__btn` to light-band chip style; kept `--edit`/`--delete` color variants on hover; badge gains ring + shadow.

### Impact
- **Data structure**: unchanged (same array of `{image, caption}`).
- **Bulk upload / max-10 / grid / responsive 4→3→2→1**: preserved.
- **Reorder / Edit / Delete**: functionally unchanged, only placement moved into the toolbar.
- **New dependency**: none.
- **DB/Schema**: none.

### Verification
- ✅ Code-level: JSX groups render nav-left / actions-right with `justify-content: space-between`.
- ✅ Handlers/dispatches unchanged from 4.26c.
- ✅ CSS scoped under `.dnj-gg` (grid) and `.dnj-gallery-grid` (hide default) — no leakage.
- User visual verification not recorded in session transcript beyond commit landing.

### Rollback
```
git revert 155c14d
```

### Next
Pilot on Accommodations remained per user decision — no rollout of the gallery-grid to other collections. Frontend viewer work continued under Phase 4.27 (villa detail page).
