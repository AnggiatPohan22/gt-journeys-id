## Phase 4.21 Bugfix: Block Spacing — Last-Block Footer Gap
**Tanggal**: 2026-08-31
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Basis**: Regresi dari Phase 4.21 Block Spacing Refactor

### Bug Reports

| # | Deskripsi | Severity |
|---|-----------|----------|
| 1 | CTA block sebagai block terakhir tidak ada spacing sebelum footer | High |
| 2 | RichText block di halaman About punya spacing yang tidak seimbang | Medium |

### Root-Cause Analysis

**Akar masalah tunggal**: Phase 4.21 mengubah `resolvePadding()` dari `py-*` (symmetric)
ke `pt-*` (top-only). Semua block kehilangan bottom padding. Wrapper `padding-bottom`
di BlockRenderer terlalu kecil — hanya menggunakan gap value (2rem/3rem untuk "normal"),
padahal seharusnya mengkompensasi bottom padding lama (4rem/6rem dari `py-16 md:py-24`).

**Efek**:
- Space antara block terakhir dan footer berkurang ~50% (dari 4rem/6rem ke 2rem/3rem)
- Terlihat jelas pada CTA block (Bug #1) karena CTA sering jadi block terakhir
- Halaman About (Bug #2) — RichText blocks terlihat "flush" ke footer

**Bukti dari compiled CSS (sebelum fix)**:
```css
[data-block-gap=normal]{--block-gap: 2rem; padding-bottom: 2rem}
/* seharusnya padding-bottom: 4rem (= py-16 bottom) */
```

### Gap System Strategy

BlockRenderer menggunakan:
- `flex flex-col` + `gap-*` (Tailwind) untuk inter-block spacing
- `data-block-gap` attribute untuk CSS variable `--block-gap` + `padding-bottom`
- CSS TIDAK di-scope oleh Astro (attribute selector = unscoped) ✅ cocok

### Fix Applied

**File**: `apps/web/src/components/blocks/BlockRenderer.astro` (CSS only)

Wrapper `padding-bottom` ditingkatkan agar sama dengan bottom padding lama dari `py-*`:

| Preset | Mobile (old → fix) | Desktop (old → fix) |
|--------|-------------------|---------------------|
| compact | 1rem → **2rem** | 1.5rem → **3rem** |
| normal | 2rem → **4rem** | 3rem → **6rem** |
| spacious | 4rem → **6rem** | 5rem → **8rem** |

`--block-gap` value TIDAK berubah — inter-block spacing tetap sama.

### Page Template Audit

| Template | Pakai BlockRenderer? | Terpengaruh? |
|----------|---------------------|-------------|
| `[...slug].astro` (About, Contact, Terms, Privacy, Explore Bali) | ✅ Ya | ✅ Fixed — padding-bottom restored |
| `index.astro` CMS path (Homepage) | ✅ Ya | ✅ Fixed — padding-bottom restored |
| `index.astro` fallback path | ❌ Tidak | ❌ Unchanged — renders blocks directly |
| 8 service listing pages (tour, villa, dll) | ✅ Ya (additionalBlocks only) | ✅ Fixed — padding-bottom restored |
| `property.astro` | ❌ Tidak | ❌ Unchanged — uses `.section-padding` |
| `404.astro` | ❌ Tidak | ❌ Unchanged — hardcoded layout |
| Service detail pages (`[slug].astro`) | ✅ additionalBlocks only | ✅ Fixed if additionalBlocks exist |

### Verified Unchanged

Halaman-halaman ini **tidak terpengaruh** oleh fix ini (tidak menggunakan BlockRenderer
untuk konten utama):

- `property.astro` — layout mandiri dengan `.section-padding`
- `404.astro` — layout hardcoded dengan `py-24`
- Homepage fallback path — render block langsung tanpa wrapper
- Semua service detail page main content — layout hardcoded per-service

### Impact

- **Database**: Tidak ada schema change
- **Frontend**: Hanya CSS `padding-bottom` di BlockRenderer wrapper — memperbesar
  jarak antara block terakhir dan footer. Inter-block gap TIDAK berubah.
- **CMS**: Tidak ada perubahan
- **Visual**: Space sebelum footer dipulihkan ke nilai pre-Phase-4.21.
  Halaman yang memakai BlockRenderer mendapat spacing footer yang konsisten.
- **RBAC**: none
- **Deploy needed**: Web only (CSS change)

### Testing

- [x] Astro build — 50 pages built successfully
- [x] Compiled CSS verified — padding-bottom values correct
- [x] Page template audit — 14 BlockRenderer pages fixed, 3 non-BlockRenderer unchanged
- [ ] Visual verify — check About, Contact, dan homepage di browser

### Rollback

1. Revert `padding-bottom` values di BlockRenderer.astro CSS ke gap values
   (compact: 1rem/1.5rem, normal: 2rem/3rem, spacious: 4rem/5rem)
2. Rebuild Astro
