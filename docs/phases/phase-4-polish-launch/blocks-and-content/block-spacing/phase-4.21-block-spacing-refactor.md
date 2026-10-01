## Phase 4.21: Block Spacing Refactor
**Tanggal**: 2026-08-31
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Basis**: Phase 4.20 Block Spacing Audit findings

### Ringkasan
Refactor sistem vertical spacing antar block dari double-stacking `py-*` ke
centralized gap system. CMS-controlled `blockGap` field di SiteSettings
menentukan jarak antar block secara global. Semua block standar sekarang pakai
top-only padding (`pt-*`), dan inter-block gap dikontrol oleh BlockRenderer
wrapper. Outlier blocks (HeroBlock, EmbedBlock, ValuePropsBannerBlock,
ServiceGridBlock curated) dimigrasikan ke sistem yang seragam.

### Perubahan Arsitektur

**Sebelum (double-stacking):**
```
[Block A: py-16] → 64px bottom padding
[Block B: py-16] → 64px top padding
Total gap: 128px (uncontrolled)
```

**Sesudah (centralized gap):**
```
[Block A: pt-16]  → no bottom padding
  ↕ gap-8 (32px)  → controlled by SiteSettings.layout.blockGap
[Block B: pt-16]  → 64px top padding
Total gap: 96px (reduced, CMS-controlled)
```

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteSettings.ts` | Tambah `layout` group dengan `blockGap` select field (compact/normal/spacious) |
| `apps/web/src/lib/blockStyles.ts` | `resolvePadding()` → `pt-*` (top-only), tambah `resolveBlockGap()` |
| `apps/web/src/components/blocks/BlockRenderer.astro` | Flex wrapper dengan `gap-*` + CSS variable `--block-gap` + bottom padding + overlap handler |
| `apps/web/src/components/blocks/EmbedBlock.astro` | `.section-padding` → `resolvePadding()` |
| `apps/web/src/components/blocks/HeroBlock.astro` | Own padding logic → `resolvePadding()` + `min-h-*` |
| `apps/web/src/components/blocks/ValuePropsBannerBlock.astro` | Hapus `mb-8`, `-mt-16` dipertahankan + gap cancellation via `.block-overlap` wrapper |
| `apps/web/src/components/blocks/ServiceGridBlock.astro` | Curated template: `mb-24` → `resolvePadding()` via `paddingClass` |
| `apps/cms/src/blocks/index.ts` | Embed block: tambah tabs structure dengan Advanced tab (`sectionPadding`, `background`, dll) |
| `packages/shared/src/types/payload-types.ts` | Regenerated — `layout.blockGap` + Embed Advanced fields |

### Gap Values (per preset)

| Setting | Mobile | Desktop (md:) | Tailwind |
|---------|--------|---------------|----------|
| compact | 16px (1rem) | 24px (1.5rem) | `gap-4 md:gap-6` |
| normal | 32px (2rem) | 48px (3rem) | `gap-8 md:gap-12` |
| spacious | 64px (4rem) | 80px (5rem) | `gap-16 md:gap-20` |

### Impact
- **Database**: Schema change — tambah `layout` group dengan `blockGap` field di SiteSettings.
  Embed block sekarang punya Advanced tab fields (sectionPadding, contentAlignment, dll).
- **Frontend**: 11 standard blocks otomatis berubah via `resolvePadding()` (dari `py-*` ke `pt-*`).
  BlockRenderer membungkus semua block dalam flex container dengan gap.
- **CMS**: Admin bisa mengatur jarak antar block dari Site Settings → Layout → Block Gap.
  Embed block sekarang punya Advanced tab seperti block lain.
- **Visual**: Jarak antar block berkurang ~25% (dari 128px ke 96px pada mobile untuk preset normal).
  Spacing sekarang konsisten dan terpusat.
- **RBAC**: none
- **Deploy needed**: CMS (schema change) + Web (BlockRenderer + block updates)

### Outlier Block Fixes

| Block | Sebelum | Sesudah |
|-------|---------|---------|
| HeroBlock | Own padding switch (`py-12/20/28 md:py-20/32/40`) | `resolvePadding()` + `min-h-[calc(100vh-5rem)]` |
| EmbedBlock | Hardcoded `.section-padding` CSS class | `resolvePadding(b.sectionPadding)` + Advanced tab |
| ValuePropsBanner | `-mt-16 mb-8` | `-mt-16` (preserved) + `mb-8` removed + wrapped in `.block-overlap` (gap cancelled) |
| ServiceGrid curated | `mb-24` only | `resolvePadding()` via `paddingClass` |

### Testing
- [x] TypeScript — no new errors (CMS + Web)
- [x] Astro build — 50 pages built successfully
- [x] Types regenerated with new fields
- [ ] CMS visual verify — restart CMS, accept schema change, test Block Gap setting
- [ ] Frontend visual verify — check spacing between blocks on various pages

### Rollback
1. Revert `resolvePadding()` in blockStyles.ts → restore `py-*` instead of `pt-*`
2. Revert BlockRenderer.astro → remove flex wrapper and gap
3. Revert outlier blocks to their previous spacing classes
4. Remove `layout` group from SiteSettings.ts
5. Revert Embed block to flat field structure (no tabs)
6. Regenerate payload-types.ts
7. CMS restart — Payload drops unused columns
