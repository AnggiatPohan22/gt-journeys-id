## Phase 4.22: Spacing System v2 — Sibling Margin + Per-Block Override
**Tanggal**: 2026-08-31
**Status**: Selesai (Phase 1 + 2 code) · ⏳ CMS schema push + visual verify
**Dikerjakan oleh**: Claude Code
**Basis**: Approved spec "Spacing System v2 — Approval & Corrected Implementation Spec"

### Ringkasan

Refactor spacing system dari flex `gap` ke CSS sibling-margin pattern
(`> * + *`), supaya per-block spacing override bisa menimpa via inline style
(tanpa `!important`). Tambah `beforeFooter` token terpisah di SiteSettings
dan `spacingOverride` group di Advanced tab semua block (default OFF).

**`afterHeader` token sengaja TIDAK diimplementasi** — header `position: fixed`,
space setelah header ditangani oleh top padding block pertama masing-masing.
Jika header berubah ke `static`/in-flow, revisit sebagai task terpisah.

### Phase 1 — Mechanism Fix + `beforeFooter` Token

**Goal**: Convert `gap` → sibling-margin. Add `beforeFooter`. Zero visual change.

| Perubahan | Detail |
|-----------|--------|
| `gap-*` Tailwind classes removed from wrapper | Replaced by `.block-stack > * + *` CSS rule |
| `--block-gap` CSS variable | Unchanged — same values per preset |
| `padding-bottom` | Moved from `[data-block-gap]` to `[data-before-footer]` attribute |
| `.block-overlap` | Changed from `margin-top: calc(-1 * gap)` to `margin-top: 0` |
| `beforeFooter` field | Added to SiteSettings.layout, defaults to `blockGap` value |

**CSS mechanism comparison:**

```
BEFORE (flex gap):
  wrapper: flex flex-col gap-8 md:gap-12
  .block-overlap: margin-top = -var(--block-gap) → cancels gap → net 0

AFTER (sibling margin):
  wrapper: flex flex-col block-stack
  .block-stack > * + *: margin-top = var(--block-gap)
  .block-overlap: margin-top = 0 → same net 0
```

**Verified pixel-identical values (normal preset):**
- Inter-block: 2rem (mobile) / 3rem (desktop) — SAME
- beforeFooter: 4rem / 6rem — SAME (now via `data-before-footer`)
- `.block-overlap` net spacing: 0 — SAME

### Phase 2 — Per-Block `spacingOverride` (default OFF)

**Goal**: Add `spacingOverride` to all blocks. Default `enabled: false`. Zero visual change.

| Perubahan | Detail |
|-----------|--------|
| `spacingOverride` group | Added to `commonAdvancedFields` in `advancedStyle.ts` |
| Fields | `enabled` (checkbox, default false), `mt`/`mb` (preset select), `topPx`/`btmPx` (custom px) |
| BlockRenderer | Reads `spacingOverride`, wraps block in `<div style="margin-top:...">` when enabled |
| `resolveSpacingOverride()` | New function in `blockStyles.ts` |
| Column naming | Short names (`mt`, `mb`, `topPx`, `btmPx`) to stay under 63-char DB limit |

**spacingOverride presets:**
| Preset | Value |
|--------|-------|
| none | 0px |
| compact | 2rem |
| normal | 4rem |
| spacious | 6rem |
| custom | User-defined px (0-500) |

**Blocks with spacingOverride (15/16):**
All blocks except Spacer (which doesn't have an Advanced tab and already controls its own spacing via `height` field).

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/web/src/components/blocks/BlockRenderer.astro` | Phase 1: gap→sibling-margin, `data-before-footer`, `.block-overlap` fix. Phase 2: import `resolveSpacingOverride`, conditional wrapper div |
| `apps/web/src/lib/blockStyles.ts` | Phase 2: add `resolveSpacingOverride()` function |
| `apps/cms/src/globals/SiteSettings.ts` | Phase 1: add `beforeFooter` select to `layout` group |
| `apps/cms/src/fields/advancedStyle.ts` | Phase 2: add `spacingOverride` group to `commonAdvancedFields` |
| `packages/shared/src/types/payload-types.ts` | Regenerated — `beforeFooter` + `spacingOverride` fields |

### Verified Unchanged (Phase 1)

Spacing pixel values are identical to pre-Phase-4.22 state for all presets:

| Metric | compact (mobile/desktop) | normal (mobile/desktop) | spacious (mobile/desktop) |
|--------|-------------------------|------------------------|--------------------------|
| `--block-gap` | 1rem / 1.5rem | 2rem / 3rem | 4rem / 5rem |
| `padding-bottom` | 2rem / 3rem | 4rem / 6rem | 6rem / 8rem |
| `.block-overlap` net | 0 / 0 | 0 / 0 | 0 / 0 |

Compiled CSS verified via `grep` on `dist/_astro/*.css`.

### Verified Unchanged (Phase 2)

Since `spacingOverride.enabled` defaults to `false` for every existing block,
no block gets a wrapper div. The rendered HTML is identical to Phase 1 output.
Zero visual change until the owner manually enables an override in CMS.

### Pages NOT using BlockRenderer (truly unaffected)

- `property.astro` — standalone layout with `.section-padding`
- `404.astro` — hardcoded layout with `py-24`
- Homepage fallback path — renders blocks directly without wrapper
- Service detail main content — hardcoded per-service layout

### Impact

- **Database**: Schema change — add `beforeFooter` to SiteSettings.layout, add
  `spacingOverride` group (5 fields) to every block type's Advanced tab
- **CMS**: Admin sees new "Spacing Override" collapsible in Advanced tab (default OFF,
  hidden until enabled). New "Before Footer" select in Layout settings.
- **Frontend**: CSS mechanism changed (gap→margin). `resolveSpacingOverride()` added.
  Conditional wrapper div for blocks with override enabled.
- **Visual**: Zero change until owner touches new fields
- **RBAC**: none
- **Deploy needed**: CMS (schema) + Web (CSS + BlockRenderer)

### Design Decision: `afterHeader` Excluded

`afterHeader` token was proposed in the v2 plan but **deliberately excluded** per
owner's review. Reasoning: header is `position: fixed`, so the space after it is
already owned by each block's own top padding (`pt-*` via `sectionPadding`). Adding
a global token whose default is permanently `0px` with no current use case adds
unnecessary schema surface. If header design changes from `fixed` to `static`/in-flow,
revisit as a separate task — not part of this phase.

### Testing

- [x] TypeScript — CMS: no new errors. Web: compiles clean
- [x] Payload types — regenerated with `beforeFooter` + `spacingOverride`
- [x] Compiled CSS — verified pixel-identical `--block-gap` and `padding-bottom` values
- [x] Compiled CSS — verified `.block-stack > * + *` rule is global (unscoped)
- [x] Compiled CSS — verified `.block-overlap` uses `margin-top: 0`
- [ ] Astro build — ⏳ requires CMS running for page generation
- [ ] CMS visual verify — restart CMS, accept schema push, test spacingOverride
- [ ] Frontend visual verify — screenshot comparison per-page

### Rollback

1. Revert `BlockRenderer.astro` — restore `gap-*` classes, remove `block-stack`,
   restore `.block-overlap { margin-top: calc(-1 * var(--block-gap)) }`
2. Revert `blockStyles.ts` — remove `resolveSpacingOverride()`
3. Revert `advancedStyle.ts` — remove `spacingOverride` group and `spacingPresetOptions`
4. Revert `SiteSettings.ts` — remove `beforeFooter` field
5. Regenerate `payload-types.ts`
6. CMS restart — Payload drops unused columns
