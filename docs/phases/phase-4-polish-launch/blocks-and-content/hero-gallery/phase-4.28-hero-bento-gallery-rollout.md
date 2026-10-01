## Phase: 4.28 — HeroBentoGallery Shared Component + Rollout to All Service Detail Pages
**Tanggal**: 2026-09-03
**Status**: ✅ Complete — all 7 service detail pages migrated + villa refactored to use the shared component
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: All 8 service detail pages: villa (refactor), tour, restaurant, water-activity, venue, yacht, rental, spa. New shared `HeroBentoGallery.astro` component.
**Commits**:
- `8e914e2` [web] refactor(gallery): extract HeroBentoGallery shared component (prep)
- `be2b087` [web] rollout(tour): use HeroBentoGallery shared component
- `59de847` [web] rollout(restaurant): use HeroBentoGallery shared component
- `631fb7f` [web] rollout(water-activity): use HeroBentoGallery shared component
- `483f502` [web] rollout(venue): use HeroBentoGallery shared component
- `c034663` [web] rollout(yacht): use HeroBentoGallery shared component
- `79cdfd7` [web] rollout(rental): use HeroBentoGallery shared component
- `03d4f50` [web] rollout(spa): use HeroBentoGallery shared component

### Ringkasan
[Phase 4.27](phase-4.27-frontend-gallery-crossfade.md) + [Phase 4.27a](phase-4.27a-hero-zoom-fix.md) validated the pattern on villa detail. Task DRY-rollout to the 7 remaining service detail pages without copy-pasting ~55-90 lines per page.

Approach: **extract** villa's post-pilot code into `HeroBentoGallery.astro` (one shared Astro component owning bento markup + dual-layer crossfade + swipe/tap script + warm-preload + PhotoLightbox mount + CSS + mobile pill) → **refactor** villa to use it (parity gate) → **roll out** to the 7 others, one commit per page. Total: 8 commits (1 prep + 7 rollouts).

### Step 1 — Findings
**7 target pages** (routes confirmed): `/tour/[slug]`, `/water-activity/[slug]`, `/yacht/[slug]`, `/restaurant/[slug]`, `/venue/[slug]`, `/rental/[slug]`, `/spa/[slug]`.

**Data shape — zero variance**: every one uses identical field names `item.featuredImage` (Media relation) + `item.gallery[]` with `{ image: Media, caption?: string }` per row.

**Hero markup — zero variance**: every 7 uses the same pre-pilot bento block as villa was pre-4.26. Same bugs present on all 7:
- **B1** — main cell missing `overflow-hidden` → hover scale bleeds into side cells.
- **B2** — `<a href="#options">` scrolls to offerings section instead of opening a lightbox (no PhotoLightbox mounted).
- No hero-cell crossfade, no swipe, no featured/gallery unification, no fixed 16:9 lightbox.

All fixes from 4.26 / 4.27 / 4.27a inherited automatically by using the shared component.

### Files
- **New shared component** [apps/web/src/components/gallery/HeroBentoGallery.astro](../../apps/web/src/components/gallery/HeroBentoGallery.astro) — extracted from villa's post-pilot code. Owns:
  - Bento layout (main cell + 2 side thumbnails on desktop, mobile "Show all N photos" pill).
  - Dual-layer crossfade on main cell + swipe/tap script (`settled` guard + `setTimeout(0)` yield from 4.27 fix).
  - Warm-preload of all photos on init + prime layer B with photos[1].
  - `<PhotoLightbox id={id} photos={allPhotos} />` mount.
  - Scoped `<style is:global>` for `.hero-bento-layer { transition: opacity + transform; ... }` (4.27a shorthand-collision fix preserved via generic class name).
  - Element ids scoped by prop `id` (`hero-bento-<id>-cell` / `-a` / `-b`) so multiple instances would never collide (defensive; not currently needed).
  - Props: `id`, `heroImg: Media | null`, `heroAlt?: string`, `gallery?: Array<{ image?; caption? }>`.

- **Refactored** [apps/web/src/pages/villa/[slug].astro](../../apps/web/src/pages/villa/[slug].astro) — replaced ~170 lines of inline bento markup + CSS + swipe script with a single `<HeroBentoGallery id="villa-photos" heroImg={heroImg} heroAlt={heroAlt} gallery={item.gallery} />` call. Dropped now-unused locals (`galleryEntries`, `galleryImages`, `sideImg1/2`, `totalPhotos`, `allPhotos`); `heroUrl`/`heroAlt` kept for StructuredData schema + PageLayout ogImage.

- **Rollout** to each of the 7 pages ([tour](../../apps/web/src/pages/tour/[slug].astro), [restaurant](../../apps/web/src/pages/restaurant/[slug].astro), [water-activity](../../apps/web/src/pages/water-activity/[slug].astro), [venue](../../apps/web/src/pages/venue/[slug].astro), [yacht](../../apps/web/src/pages/yacht/[slug].astro), [rental](../../apps/web/src/pages/rental/[slug].astro), [spa](../../apps/web/src/pages/spa/[slug].astro)):
  - Added `import HeroBentoGallery from '@components/gallery/HeroBentoGallery.astro'`.
  - Deleted inline `{/* HERO BENTO GALLERY */}` `<section>` block.
  - Replaced with `<HeroBentoGallery id="<service>-photos" heroImg={heroImg} heroAlt={heroAlt} gallery={item.gallery} />`.
  - Cleaned up unused `sideImg1`, `sideImg2`, `totalPhotos`, `galleryImages` locals.
  - Everything else on each page (breadcrumbs, sidebars, WhatsApp CTAs, room lists, offerings) untouched.

### What every page now gets, uniformly
- Featured + gallery merged into one viewer sequence (featured = idx 0).
- Fixed 16:9 lightbox frame (matches CMS `landscape 16:9` convention).
- `object-fit: cover` on every image (no letterbox, no frame resize).
- Dual-layer opacity crossfade, 350ms `cubic-bezier(0.16, 1, 0.3, 1)`, applied uniformly to hero swipe + lightbox nav + first open.
- Hover-zoom 700ms `cubic-bezier(0.4, 0, 0.2, 1)` on hero cell (matches side thumbnails — 4.27a fix).
- Warm-preload of all photos + prime layer B with photos[1] → no cold-cache first-swipe pause.
- Broken `<a href="#options">` anchor **fixed** on all 7 rollouts — real lightbox open.
- B1 zoom-overflow fix inherited automatically on all 7 (hero cell has `overflow-hidden`).
- Mobile-only "Show all N photos" pill (was villa-exclusive) now on every service page.
- `prefers-reduced-motion: reduce` honored.

### Impact
- **CMS / data**: unchanged.
- **New dependency**: none.
- **Net LOC**: prep +290/-233 (component +260, villa -170). Rollouts avg -18 each × 7 ≈ -130. Net ≈ **-70 LOC** replacing 7 near-identical bento copies with one shared component.
- **Bundle**: one component replaces ~440 lines of duplicated markup + scripts.

### Verification (browser pane, in-session)
- ✅ Villa parity after prep commit: hero-bento-villa-photos-cell + both layers + 16:9 frame + 9 photos + 5 open triggers + opener global + both `opacity, transform` transitions.
- ✅ Tour (`nusa-penida-island-hopping`): hero-bento-tour-photos-cell/-a/-b all present, 16:9 lightbox mounted, `opacity, transform` transitions.
- ✅ Yacht (`thunder-speedboat`): same — all wired correctly.
- Tour/yacht data currently has only featured (no gallery items) → correctly renders single-photo mode (main cell only, no side thumbs, no "Show all" pill).
- User acceptance testing on live records with real gallery data per page: **not recorded** in session transcript; pending owner.

### Rollback
Per-page revert works — commits are independent by page. To roll back everything:
```
git revert 03d4f50 79cdfd7 c034663 483f502 631fb7f 59de847 be2b087 8e914e2
```
Or roll back just one page (leaves the shared component in place, restores that page's old inline bento).

### Next
Owner acceptance testing on live records per page. If any page's data doesn't populate `item.gallery`, the component gracefully renders single-photo mode (verified on tour + yacht). Any regression → surgical revert of the affected page's commit only.
