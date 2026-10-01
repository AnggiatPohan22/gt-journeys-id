## Spacing System v2 — Plan (Needs Approval)
**Tanggal**: 2026-08-31
**Status**: 📋 Plan — belum diimplementasi
**Dikerjakan oleh**: Claude Code

### Motivasi

Spacing system v1 (Phase 4.21) hanya punya satu token global (`blockGap`) yang
mengatur jarak antar block. Ini sudah jauh lebih baik dari double-stacking `py-*`,
tapi masih ada keterbatasan:

1. **Tidak bisa mengontrol afterHeader & beforeFooter terpisah** — padding-bottom
   wrapper saat ini hardcoded proporsional ke gap preset
2. **Tidak ada per-block spacing override** — semua block selalu pakai gap yang sama
3. **Owner tidak bisa fine-tune spacing halaman tertentu** tanpa mempengaruhi semua halaman

### Design: Three Tokens + Per-Block Override

#### A. Global Tokens (SiteSettings → `layout` group)

| Token | Deskripsi | Default (measured from current state) |
|-------|-----------|---------------------------------------|
| `betweenBlocks` | Jarak antar block (flex gap) | compact/normal/spacious (same as v1) |
| `afterHeader` | Space setelah header sebelum block pertama | `0` — header fixed, block pertama punya own padding |
| `beforeFooter` | Space setelah block terakhir sebelum footer | compact: 2rem/3rem · normal: 4rem/6rem · spacious: 6rem/8rem |

**Default-value rule**: Setiap default HARUS menghasilkan spacing yang identik
dengan rendered state saat ini (post-bugfix). Diukur, bukan diestimasi.

#### B. Measured Baselines (Current Rendered Values)

```
betweenBlocks (inter-block gap — Tailwind gap classes):
  compact:  mobile 16px (gap-4)   desktop 24px (gap-6)
  normal:   mobile 32px (gap-8)   desktop 48px (gap-12)
  spacious: mobile 64px (gap-16)  desktop 80px (gap-20)

afterHeader:
  0px — header is position:fixed, content starts under it
  Hero blocks handle their own min-height overlap

beforeFooter (wrapper padding-bottom):
  compact:  mobile 32px (2rem)    desktop 48px (3rem)
  normal:   mobile 64px (4rem)    desktop 96px (6rem)
  spacious: mobile 96px (6rem)    desktop 128px (8rem)

Per-block internal padding (resolvePadding — top-only):
  compact:  mobile 32px (pt-8)    desktop 48px (pt-12)
  normal:   mobile 64px (pt-16)   desktop 96px (pt-24)
  spacious: mobile 96px (pt-24)   desktop 128px (pt-32)
```

#### C. Per-Block Spacing Override

Tambah field opsional di Advanced tab setiap block:

```
spacingOverride: {
  type: 'group',
  label: 'Spacing Override',
  admin: { condition: (_, siblingData) => !!siblingData?.spacingOverride?.enabled },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'marginTop', type: 'select', options: ['none', 'compact', 'normal', 'spacious', 'custom'] },
    { name: 'marginBottom', type: 'select', options: ['none', 'compact', 'normal', 'spacious', 'custom'] },
    { name: 'customTopPx', type: 'number', admin: { condition: ... } },
    { name: 'customBottomPx', type: 'number', admin: { condition: ... } },
  ]
}
```

**Implementasi**: BlockRenderer membaca `spacingOverride` dari setiap block dan
menambahkan inline `margin-top` / `margin-bottom` yang menimpa flex gap.

#### D. Schema Changes Required

| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteSettings.ts` | Tambah `afterHeader` dan `beforeFooter` di `layout` group |
| `apps/cms/src/blocks/index.ts` | Tambah `spacingOverride` group di Advanced tab semua block |
| `apps/web/src/components/blocks/BlockRenderer.astro` | Baca `afterHeader`, `beforeFooter`, per-block override |
| `apps/web/src/lib/blockStyles.ts` | Tambah resolver untuk `afterHeader`, `beforeFooter`, per-block margin |
| `packages/shared/src/types/payload-types.ts` | Regenerate |

### Migration Strategy

1. **Phase 1**: Tambah `afterHeader` dan `beforeFooter` fields (default = current values) → NO visual change
2. **Phase 2**: Tambah `spacingOverride` ke Advanced tab — default OFF → NO visual change
3. **Phase 3**: Owner bisa mulai fine-tune via CMS

### Risks

| Risk | Mitigasi |
|------|----------|
| Schema change di SiteSettings | Payload handles additive fields gracefully |
| Per-block override complexity | Default OFF, hidden behind checkbox toggle |
| Performance (reading override per block) | Minimal — data sudah ada di block object |
| Backward compatibility | Semua default = current values, zero visual diff |

### Decision Points for Owner

1. **Apakah `afterHeader` diperlukan?** Header fixed positioned — space "setelah header"
   sebenarnya ditangani oleh top padding block pertama. Token ini mungkin tidak berguna
   kecuali ada rencana mengubah header ke non-fixed.

2. **Per-block override scope**: Apakah cukup preset (compact/normal/spacious/none)
   atau perlu custom pixel value juga?

3. **Priority**: Implement v2 sekarang atau nanti setelah launch?

### NOT Included (Out of Scope)

- Responsive breakpoint customization per-token (cukup mobile/desktop saja)
- Per-page spacing override (hanya global + per-block)
- Animation/transition pada spacing change
