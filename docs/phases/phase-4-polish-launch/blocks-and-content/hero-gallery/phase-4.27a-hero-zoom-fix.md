## Phase: 4.27a — Hero Hover-Zoom "Kaku" Fix (CSS Shorthand Collision)
**Tanggal**: 2026-09-03
**Status**: ✅ Complete
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Villa detail page (`/villa/[slug]`) — one CSS rule in the scoped `<style>` block.
**Commits**:
- `474573e` [web] fix(villa): unstick hero hover-zoom — restore transform transition

### Ringkasan
User post-4.27 report: featured image (large left of the hero bento) still felt "kaku" on hover, while the two smaller side gallery cells zoomed smoothly. Investigation confirmed: my 4.27 CSS shorthand `.villa-hero-layer { transition: opacity 350ms … }` silently reset every `transition-*` longhand — Tailwind's `transition-transform duration-700` was overridden. Result: `transform` had **no transition at all** → hover `scale-105` snapped instantly from 1 → 1.05 = the "kaku" the user saw. Side cells (single `<img>` with no crossfade CSS) kept smooth `transform 0.7s cubic-bezier(0.4,0,0.2,1)`.

### Root Cause
- Featured image rendered by: hero cell dual-layer at [apps/web/src/pages/villa/[slug].astro](../../apps/web/src/pages/villa/[slug].astro) (`#villa-hero-a` / `-b`).
- Its animation was driven by: Tailwind `transition-transform duration-700 group-hover:scale-105` (700ms zoom on hover) + my 4.27 `<style>` rule.
- **Why 4.27 missed it**: my 4.27 CSS used the `transition:` **shorthand** — `.villa-hero-layer { transition: opacity 350ms … }`. Shorthand resets EVERY `transition-*` longhand.
- Verified via `getComputedStyle` in the browser pane:
  - Before: hero `transition-property: opacity` (only), `duration: 0.35s`.
  - Side: `transition-property: transform`, `duration: 0.7s` (unchanged, smooth).
- Side cells kept smooth because they had no overriding CSS rule.

### Fix
Expanded the `.villa-hero-layer` transition rule to list BOTH properties with their own timings:
```css
.villa-hero-layer {
  transition:
    opacity 350ms cubic-bezier(0.16, 1, 0.3, 1),      /* crossfade — unchanged intent */
    transform 700ms cubic-bezier(0.4, 0, 0.2, 1);     /* hover-zoom — matches Tailwind exactly */
  will-change: opacity, transform;
}
```
Extended `will-change` to `opacity, transform`. Reduced-motion snap unchanged.

### Files Changed
- [apps/web/src/pages/villa/[slug].astro](../../apps/web/src/pages/villa/[slug].astro) — one CSS rule updated inside the scoped `<style is:global>` block.

### Impact
- **CMS / data**: unchanged.
- **New dependency**: none.
- **Scope**: villa detail page only (pilot for 4.27; 4.28 rollout will pick this up via the shared component).

### Verification (browser pane)
- ✅ Hero `transition-property: opacity, transform` (both), duration `0.35s, 0.7s`, timings match crossfade + Tailwind zoom exactly.
- ✅ Side cells unchanged (`transform 0.7s cubic-bezier(0.4,0,0.2,1)`).
- ✅ Hero + side hover-zoom timing now identical (0.7s ease).
- Visual hard-refresh check by user: **not recorded** in session transcript.

### Rollback
```
git revert 474573e
```

### Next
[Phase 4.28](phase-4.28-hero-bento-gallery-rollout.md) — extract shared `HeroBentoGallery.astro` (carries this fix) and roll out to 7 other service detail pages.
