## Phase 4.20: Block Spacing Audit
**Tanggal**: 2026-08-31
**Status**: Selesai (audit only — no code changes)
**Dikerjakan oleh**: Claude Code

### Findings Summary
Block vertical spacing is **mostly consistent** — 11 of 16 blocks use a shared
`resolvePadding()` helper (compact/normal/spacious presets), already CMS-editable
per-block via the `sectionPadding` field in each block's Advanced tab. The
inconsistency comes from **5 outlier blocks** that bypass this system: HeroBlock
(own padding logic), EmbedBlock (hardcoded CSS class), ValuePropsBannerBlock
(hardcoded `-mt-16 mb-8`), ServiceGridBlock curated template (`mb-24` only),
and ServiceListingHeroImmersive (no outer padding at all).

The gap _between_ consecutive blocks is **not controlled globally** — it is a
side-effect of each block's own `py-*` padding stacking. There is no
`space-y-*`, `gap`, or wrapper element in BlockRenderer that controls inter-block
gap. This means two consecutive blocks with `py-16` produce a visual gap of
`16+16 = 32` spacing units between their content — double what a single `gap-16`
would produce. Whether this is "too large" depends on the block combination.

### Recommended Next Step
Add a single CMS-controlled "block gap" field (to the `sectionPages` group in
SiteSettings, or a new `layout` group) that renders as a CSS variable or a
wrapper `gap-*` class on BlockRenderer. Strip outer `py-*` from blocks and
replace with `pt-*` only (or inner-only padding), so the gap comes from one
place. Migrate block by block (trial on RichTextBlock first, then replicate).

---

## Block Spacing Audit

### Renderer
- `apps/web/src/components/blocks/BlockRenderer.astro` — **does NOT** apply any
  wrapper spacing. Renders each block via a bare `switch/case` with no wrapper
  `<div>`, no `space-y-*`, no `gap-*`. All spacing is owned by individual blocks.

### Per-block outer spacing

| # | Block | File | Outer spacing classes | Responsive? | Notes |
|---|-------|------|-----------------------|-------------|-------|
| 1 | Hero | `HeroBlock.astro` | Own logic: compact=`py-12 md:py-20`, normal=`py-20 md:py-32`, spacious=`py-28 md:py-40` + `min-h-[calc(100vh-5rem)]` | Yes | Does NOT use `resolvePadding()`. Own switch with different values. |
| 2 | RichText | `RichTextBlock.astro` | `resolvePadding()`: compact=`py-8 md:py-12`, normal=`py-16 md:py-24`, spacious=`py-24 md:py-32` | Yes | Standard |
| 3 | Image | `ImageBlock.astro` | `resolvePadding()` (same as RichText) | Yes | Standard |
| 4 | Gallery | `GalleryBlock.astro` | `resolvePadding()` | Yes | Standard |
| 5 | CTA | `CTABlock.astro` | `resolvePadding()` | Yes | Standard |
| 6 | FAQ | `FAQBlock.astro` | `resolvePadding()` | Yes | Standard |
| 7 | Testimonials | `TestimonialsBlock.astro` | `resolvePadding()` | Yes | Standard |
| 8a | ServiceGrid (default) | `ServiceGridBlock.astro` | `resolvePadding()` | Yes | Standard |
| 8b | ServiceGrid (curated) | `ServiceGridBlock.astro` | `mb-24` only, no top padding | Fixed | Intentional: curated cards float closer to content above |
| 9 | Contact | `ContactBlock.astro` | `resolvePadding()` | Yes | Standard |
| 10 | Embed | `EmbedBlock.astro` | CSS class `.section-padding` = `py-16 md:py-24 lg:py-32` | Yes | Hardcoded CSS class. Has `lg:py-32` breakpoint others lack. No Advanced tab / no `sectionPadding` field. |
| 11 | Spacer | `SpacerBlock.astro` | None (height only: `h-8`/`h-16`/`h-24`/`h-40`) | Fixed | Dedicated spacing block — no padding/margin |
| 12 | ValuePropsBanner | `ValuePropsBannerBlock.astro` | `-mt-16 mb-8` | Fixed | Intentional overlap effect. No `resolvePadding`. |
| 13 | StatsBanner | `StatsBannerBlock.astro` | `resolvePadding()` | Yes | Standard |
| 14 | TestimonialsCarousel | `TestimonialsCarouselBlock.astro` | `resolvePadding()` | Yes | Standard |
| 15 | ServiceListing | `ServiceListingBlock.astro` | None (dispatcher) | N/A | Delegates to Editorial or HeroImmersive sub-layout |
| 15a | — Editorial | `ServiceListingEditorial.astro` | `resolvePadding()` via `paddingClass` | Yes | Standard |
| 15b | — HeroImmersive | `ServiceListingHeroImmersive.astro` | None on root `<section>` | — | Full-bleed hero; internal sections have own spacing |
| 16 | TrustBadges | `TrustBadgesBlock.astro` | `resolvePadding()` | Yes | Standard |

### `resolvePadding()` — the shared spacing helper

**File:** `apps/web/src/lib/blockStyles.ts:55`

```
compact:  py-8 md:py-12      (32px / 48px)
normal:   py-16 md:py-24     (64px / 96px)  ← default
spacious: py-24 md:py-32     (96px / 128px)
```

**CMS field:** `sectionPadding` select (compact/normal/spacious) in each block's
Advanced tab, defined in `apps/cms/src/fields/advancedStyle.ts:114`.

11 of 16 blocks use this system. The "normal" default means two consecutive
standard blocks produce **128px** (2 × 64px) of visual gap on mobile and
**192px** (2 × 96px) on desktop between their content areas.

### Existing spacing CSS class

**File:** `apps/web/src/styles/global.css:43`

```css
.section-padding { @apply py-16 md:py-24 lg:py-32; }
```

Used only by EmbedBlock and the `property.astro` page. Differs slightly from
`resolvePadding('normal')` by having an additional `lg:py-32` breakpoint.

### Existing tokens
- **Tailwind config** (`tailwind.config.mjs`): No custom spacing scale. Uses
  Tailwind defaults. No CSS variables for spacing.
- **packages/shared**: No design tokens or spacing scale exported. Only types
  and utilities.
- **No `design-system-skill.md`** or spacing token config found anywhere.
- **No CSS custom properties** (`--section-gap`, `--block-gap`, etc.) in use.

### Global Settings scoping

SiteSettings currently has 8 top-level field groups:

| # | Group name | Purpose |
|---|-----------|---------|
| 1 | (top-level) | `siteName`, `tagline`, `logo`, `logoDark`, `favicon` |
| 2 | `contact` | email, phone, whatsapp, address, mapEmbed |
| 3 | `socialMedia` | instagram, facebook, tiktok, youtube, tripadvisor |
| 4 | `defaultSeo` | metaTitle, metaDescription, ogImage, GA4 ID, CF Analytics |
| 5 | `whatsappDefaults` | defaultNumber, greetingMessage, businessHours |
| 6 | `footer` | copyrightText, additionalScripts |
| 7 | `sectionPages` | listingTitle, listingSubtitle |
| 8 | `relatedServices` | global defaults for related services cascade |
| 9 | `errorPages` | 404 + property coming soon copy |

**Suggested module for block gap field:** Add a new `layout` group (additive, no
rename/removal) with a `blockGap` select field (compact/normal/spacious),
defaulting to `normal`. This is cleaner than extending `sectionPages` (which is
listing-header specific). The new group can also house future global layout
controls (max content width, section dividers, etc.).

Schema change requires explicit approval per AGENTS.md Section 9.

### Spacing inconsistencies confirmed

| Issue | Detail |
|-------|--------|
| Double-stacking | Two consecutive `py-16` blocks → 128px visual gap (each block owns both top AND bottom padding). A single `gap-16` wrapper would produce 64px. |
| HeroBlock drift | Uses different padding scale than other blocks (its "normal" = `py-20 md:py-32` vs `py-16 md:py-24`). |
| EmbedBlock orphan | Uses `.section-padding` CSS class instead of `resolvePadding()`. Has extra `lg:` breakpoint others lack. |
| ValuePropsBanner | Hardcoded `-mt-16 mb-8` — intentional overlap, but not adjustable from CMS. |
| ServiceGrid curated | `mb-24` only — no padding preset, no CMS control. |
| HeroImmersive | No outer spacing at all on root `<section>`. |
| No inter-block gap control | BlockRenderer has no wrapper gap — gap = sum of adjacent blocks' padding. |
