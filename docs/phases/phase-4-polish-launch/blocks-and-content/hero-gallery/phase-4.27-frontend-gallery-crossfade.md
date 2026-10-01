## Phase: 4.27 — Frontend Gallery: Consistent Frame + Crossfade Transitions
**Tanggal**: 2026-09-03
**Status**: ✅ Complete — user-verified (villa detail page pilot)
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Villa detail page (`/villa/[slug]`) — Cliff Resort Uluwatu pilot. Other service detail pages deferred to [Phase 4.28](phase-4.28-hero-bento-gallery-rollout.md).
**Commits**:
- `98df149` [web] feat(villa+lightbox): consistent frame + crossfade transitions
- `d98ad5b` [web] fix(villa+lightbox): crossfade — inline opacity + settled guard (browser-tab robustness + double-run guard)
- `778a765` [web] fix(villa+lightbox): uniform crossfade for featured to gallery (warm-preload + first-open fade)

### Ringkasan
Three related issues on the villa detail page's photo navigation:
1. **Hero swipe snapped** — bare `img.src` swap, no transition (choppy/patah-patah).
2. **Lightbox layout shift** — `object-contain` with no fixed frame, so each image resized the display box on nav; wide→tall photos made arrows/counter jump.
3. **Featured felt different from gallery** — even after unifying `allPhotos = [featured, ...gallery]`, subtle asymmetries (cold-cache first swipe + first-open snap) made featured feel "stiff".

Fix: fixed 16:9 lightbox frame, dual-layer opacity crossfade, warm-preload of all photos, uniform behavior on first open. Pure CSS transition, no new dependency. 350ms `cubic-bezier(0.16, 1, 0.3, 1)` — matches site's "Tropical Sophistication" motion feel.

Base commit `98df149` + follow-up fix `d98ad5b` (crossfade wiring bugs found in verification) + `778a765` (uniform behavior polish) are consolidated in this one report because they all deliver the same intent — landed as three separate commits for granular rollback.

### Step 1 — Findings

**Files involved**:
- Hero: [apps/web/src/pages/villa/[slug].astro](../../apps/web/src/pages/villa/[slug].astro) (bento wrapper + hero swipe script).
- Lightbox: [apps/web/src/components/gallery/PhotoLightbox.astro](../../apps/web/src/components/gallery/PhotoLightbox.astro) (mounted for hero cells + "Show all photos").

**Pre-4.27 state**:
| Surface | Frame | `object-fit` | Transition on nav |
|---|---|---|---|
| Hero main bento cell | Locked by parent grid (`h-[50vh] md:h-[70vh]`, viewport-driven) | `cover` | **None** — bare `img.src = p.url` swap |
| Lightbox `.lb-img` | **Not locked** — `max-w-full max-h-[80vh] object-contain` | `contain` (letterboxed; frame resized per image) | Only `lbImgIn` scale-in keyframe re-triggered per nav — made snap worse |

**Featured Image aspect convention** (CMS side): 16:9 (Media collection defines `hero: 1920x1080`; Accommodations field description says "landscape 16:9 min 1600px"). Locked lightbox frame to match.

**Motion library**: `gsap` present in monorepo but villa page uses pure Tailwind + CSS transitions. Recommended CSS (matches existing pattern, zero bundle cost).

### Approach
- **Dual-image layers per surface** (`.villa-hero-a`/`-b` on hero, `.lb-img--a`/`-b` in lightbox), both `position:absolute; object-cover; inset-0`.
- **On nav**: preload next `src` via `new Image()` → set inactive layer's src → set active/inactive opacity via inline `style.opacity` → after ~380ms transition, promote inactive → active.
- **`setTimeout(0)` yield** (not `requestAnimationFrame`) — `rAF` is throttled in background tabs; `setTimeout` runs regardless. Verified in dev browser pane.
- **`settled` flag** in setPhoto/commit closure to prevent double-run from fallback timer.
- **Warm-preload of all `allPhotos` on init** + **prime layer B with photos[1] on init** → first swipe out of featured has no cold-cache pause.
- **First-open of lightbox**: same preload → fade-in path (opacity 0 → 1 over 350ms), not the previous snap. Uniform with subsequent nav.

### Files Changed
- [apps/web/src/pages/villa/[slug].astro](../../apps/web/src/pages/villa/[slug].astro):
  - Main bento cell → dual `<img>` layers `#villa-hero-a` / `-b` with inline `style="opacity:1"` / `"opacity:0"`.
  - Rewrote inline swipe/tap script for crossfade + preload + `settled` + `setTimeout(0)`.
  - Warm-preload loop on init; prime layer B with `photos[1]`.
  - Scoped `<style is:global>` for `.villa-hero-layer { transition: opacity 350ms + transform 700ms; ... }` (transform kept for hover-zoom, honored `prefers-reduced-motion`).
- [apps/web/src/components/gallery/PhotoLightbox.astro](../../apps/web/src/components/gallery/PhotoLightbox.astro):
  - New `.lb-frame` wrapper with `aspect-ratio: 16 / 9`, cap `max-w-[min(90vw,80vh*16/9)]`.
  - Two `.lb-img--a`/`-b` layers with `object-cover` (was `contain`).
  - Rewrote `show(idx)`: caption/counter update instantly; images preload → crossfade via inline opacity. Deleted first-render snap branch (778a765) — first open at any index goes through the same preload + fade path.
  - Replaced per-nav `lbImgIn` scale keyframe with plain `.lb-img { transition: opacity 350ms cubic-bezier(0.16,1,0.3,1) }`. Modal open animation (`lbFadeIn` on `.photo-lightbox.is-open`) preserved.

### Impact
- **CMS / data**: unchanged. Featured & gallery stay separate CMS fields; merged only at frontend render.
- **New dependency**: none.
- **Bandwidth**: warm-preload dispatches up to 11 background image fetches on page load (~2-4MB for a full 10-gallery villa). Deprioritized; doesn't compete with critical resources.
- **Frame ratio 16:9 for lightbox**: portrait sources crop top/bottom rather than letterbox — explicit ask per task ("no letterboxing").
- **Zoom-in-frame** (from Phase 4.26): preserved on both layers.

### Verification (browser pane, in-session)
- ✅ Hero: single swipe crossfades correctly, state persists (no revert), subsequent swipes advance photos.
- ✅ Lightbox: opens with fixed 16:9 frame (1024x576), `frameStable: true` across 3 nav clicks, layers alternate opacity cleanly, counter updates 1/N → 2/N → 3/N.
- ✅ Layer B primed with photos[1] on init (verified `bSrc: cliff-resort-2.jpeg, bOp: 0`).
- ✅ Lightbox first open fades in (`t=0: aOp=0` → `t=500: aOp=1`) — no snap.
- ✅ `prefers-reduced-motion` snap swap preserved.
- ✅ All existing triggers, keyboard nav, swipe still work.

### Rollback
```
git revert 778a765 d98ad5b 98df149
```
(Three commits; revert in reverse order for clean history.)

### Next
- [Phase 4.27a](phase-4.27a-hero-zoom-fix.md) — hover-zoom "kaku" fix (CSS shorthand collision found post-verification).
- [Phase 4.28](phase-4.28-hero-bento-gallery-rollout.md) — rollout the pattern to the 7 other service detail pages via a shared `HeroBentoGallery.astro` component.
