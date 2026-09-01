## Phase: 4.24 — Per-Block Padding System
**Tanggal**: 2026-09-01
**Status**: 📋 Part A audit selesai (read-only) · ⏳ Part B plan pending · ⏳ Part C implementation menunggu approval
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/per-block-padding` (cut dari `feature/phase4-polish-launch`, commit `ff68b0f`)

### Ringkasan
Audit internal top/bottom padding di tiap block untuk mendiagnosis "ketimpangan" visual yang masih terasa setelah Phase 4.20–4.22 memperbaiki inter-block gap. Hipotesis awal: setiap block hardcode padding sendiri, sehingga rhythm tetap tidak konsisten walaupun gap antar block sudah uniform. **Audit ini konfirmasi hipotesis dengan twist penting** — lihat diagnosis di bawah.

---

## Part A — Audit & Root-Cause Diagnosis

### A.1 Internal padding inventory (semua block yang terdaftar di [BlockRenderer.astro](../../apps/web/src/components/blocks/BlockRenderer.astro))

Semua nilai diukur pada preset default `normal` (`sectionPadding` = `undefined` → default branch di [`resolvePadding`](../../apps/web/src/lib/blockStyles.ts#L55)).

| Block | File | Top (mobile / desktop) | Bottom (mobile / desktop) | Source |
|---|---|---|---|---|
| Hero | [HeroBlock.astro:211](../../apps/web/src/components/blocks/HeroBlock.astro#L211) | 64 / 96 px | **0 / 0 px** (min-height `calc(100vh - 5rem)` + flex-center memaksakan viewport-height "padding" implisit) | `paddingClass` via `resolvePadding` (top-only) |
| RichText | [RichTextBlock.astro:30](../../apps/web/src/components/blocks/RichTextBlock.astro#L30) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| Image | [ImageBlock.astro:48](../../apps/web/src/components/blocks/ImageBlock.astro#L48) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| Gallery | [GalleryBlock.astro:64](../../apps/web/src/components/blocks/GalleryBlock.astro#L64) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| CTA | [CTABlock.astro:107](../../apps/web/src/components/blocks/CTABlock.astro#L107) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| FAQ | [FAQBlock.astro:29](../../apps/web/src/components/blocks/FAQBlock.astro#L29) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| Testimonials | [TestimonialsBlock.astro:78](../../apps/web/src/components/blocks/TestimonialsBlock.astro#L78) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| TestimonialsCarousel | [TestimonialsCarouselBlock.astro:80](../../apps/web/src/components/blocks/TestimonialsCarouselBlock.astro#L80) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| ServiceGrid | [ServiceGridBlock.astro:206](../../apps/web/src/components/blocks/ServiceGridBlock.astro#L206) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| ServiceListing → Editorial | [ServiceListingEditorial.astro:200](../../apps/web/src/components/blocks/ServiceListingEditorial.astro#L200) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| ServiceListing → HeroImmersive | [ServiceListingHeroImmersive.astro:230,295,376](../../apps/web/src/components/blocks/ServiceListingHeroImmersive.astro) | **0 / 0 px** on `<section>` root, tapi hero inner `py-16 md:py-20` = **64/80** implicit top+bottom, listing content `py-12 md:py-16` = **48/64** top+bottom (atau `pt-10 md:pt-12 pb-12 md:pb-16` = 40/48 top, 48/64 bottom kalau filter aktif) | **Hardcoded, bypass `paddingClass` sepenuhnya** |
| Contact | [ContactBlock.astro:37](../../apps/web/src/components/blocks/ContactBlock.astro#L37) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| Embed | [EmbedBlock.astro:18](../../apps/web/src/components/blocks/EmbedBlock.astro#L18) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| TrustBadges | [TrustBadgesBlock.astro:31](../../apps/web/src/components/blocks/TrustBadgesBlock.astro#L31) | 64 / 96 px | **0 / 0 px** | `paddingClass` (top-only) |
| ValuePropsBanner | [ValuePropsBannerBlock.astro:28](../../apps/web/src/components/blocks/ValuePropsBannerBlock.astro#L28) | **−64 px (`-mt-16` overlap)** on `<section>`, inner card `p-6 md:p-8` = **24/32** internal | **Hardcoded, bypass `paddingClass`** — deliberate overlap dgn block sebelumnya |
| StatsBanner | [StatsBannerBlock.astro:53](../../apps/web/src/components/blocks/StatsBannerBlock.astro#L53) | 64 / 96 px pada `<section>` | **32 / 48 px** dari `pb-8 md:pb-12` di interior `<div class="grid">` (di-add pada polish `ff68b0f`) | `paddingClass` (top) + hardcoded padding di interior grid |
| Spacer | [SpacerBlock.astro](../../apps/web/src/components/blocks/SpacerBlock.astro) | — (adjustable "height" prop) | — | Dedicated spacing block, tidak relevan untuk audit ini |

**Preset variants** yang tersedia via `sectionPadding` field (Advanced tab):
| Preset | Top (mobile / desktop) | Bottom |
|---|---|---|
| `compact` | 32 / 48 px | 0 |
| `normal` (default) | 64 / 96 px | 0 |
| `spacious` | 96 / 128 px | 0 |

Semua preset **top-only**. Bottom = 0 by design.

### A.2 Ketimpangan diagnosis

**Root cause utama (tidak sesuai hipotesis awal):**

Hipotesis owner adalah *"setiap block hardcode padding berbeda-beda"*. Audit menunjukkan **top padding sudah uniform** — hampir semua block pakai `resolvePadding` yang sama, jadi `pt-16 md:pt-24` (64/96 px) muncul konsisten. Yang tidak seragam adalah **bottom padding = 0 di 13 dari 15 block yang relevan**, karena `resolvePadding` sengaja hanya return `pt-*` (comment di [blockStyles.ts:54](../../apps/web/src/lib/blockStyles.ts#L54): *"top-only — inter-block gap handled by BlockRenderer"*).

**Akibat ketimpangan yang di-observe owner:**

1. Setiap block habis di baseline konten terakhir (0 bottom padding). Sibling-margin di `.block-stack > * + *` menyediakan `1rem/2rem/4rem` gap. Lalu block berikut menyumbang lagi `pt-16 md:pt-24` = 64/96 px sebelum konten mulai.
   → **Rhythm asimetris**: block sebelumnya "kepotong" tepat di konten, block sesudahnya "bald spot" gede di atas. Total space antara konten = `0 + gap + 64-96` = 80-128 px (mobile-`normal`, sampai spacious desktop 152 px). Persepsi "top-heavy" pada tiap section.

2. Owner baru saja menambah `pb-8 md:pb-12` (32/48 px) ke interior grid StatsBanner dalam polish Phase 4.23 (commit `ff68b0f`). Ini fix satu block, tapi sekarang StatsBanner jadi **satu-satunya block dengan bottom padding visible** di antara semua block regular → **inkonsistensi baru** karena block lain tetap 0.

3. **ServiceListingHeroImmersive** bypass `paddingClass` sepenuhnya dan pakai `py-*` (dua sisi), sehingga ada bottom 64/80 px. Dibandingkan tetangga yang bottom 0, ini terlihat mencolok (contoh: HeroImmersive → CTA berikutnya berjarak ~144 px, sedangkan sesama-`paddingClass` block ke CTA cuma ~80 px). Menyumbang rhythm inconsistency antar page yang pakai HeroImmersive.

4. **HeroBlock** memakai `min-h-[calc(100vh-5rem)] + flex justify-center` — top padding literal 64/96 tetap ada tapi di-*dominate* oleh viewport height + flex centering. Efeknya `paddingClass` di Hero hampir tidak visible (kecuali konten Hero sangat pendek).

**Widest spread pada bottom padding** (pada preset default `normal`):
- Minimum: 0 px (13 dari 15 block regular)
- Middle: 32/48 px (StatsBanner interior, post-`ff68b0f`)
- Maximum: 64/80 px (ServiceListingHeroImmersive hero inner) sampai 48/64 px (HeroImmersive listing content)
- Range: **0 → 80 px** = ketimpangan 80 px pada desktop, jelas terlihat mata

**Widest spread pada top padding** (preset `normal`):
- Semua block regular = 64/96 px (uniform)
- ServiceListingHeroImmersive = 0 pada `<section>` root (padding pindah ke inner)
- ValuePropsBanner = −64 px (`-mt-16` deliberate overlap)
- Range praktis: **0 → 96 px** — tapi 2 dari 3 outlier adalah deliberate design (overlap valueprops, listing-specific hero), bukan bug

### A.3 Interaction dengan Phase 4.22 spacing

Referensi: [phase-4.22-spacing-v2.md](phase-4.22-spacing-v2.md). Phase 4.22 memperkenalkan sibling-margin di [BlockRenderer.astro:115-117](../../apps/web/src/components/blocks/BlockRenderer.astro#L115) dan wrapper `padding-bottom` untuk `beforeFooter` token, plus per-block `spacingOverride` via inline `style=margin-top/margin-bottom`.

**Additive stacking (verified via source):**

| Site setting | Stacking = 0-padding-bottom + gap + full top padding | Total (px, default-normal, desktop) |
|---|---|---|
| Block A (`pb-0`) + gap (`3rem` normal desktop) + Block B (`pt-24`) | 0 + 48 + 96 | **144 px** breathing between visible content |
| Same, tapi Block A = StatsBanner post-polish (`pb-12` interior) | 48 + 48 + 96 | **192 px** — StatsBanner terasa lebih "berjarak" dari block sesudahnya |
| Last block + wrapper `padding-bottom: 6rem` (beforeFooter=normal desktop) | 0 + 96 + footer | 96 px lompatan block-akhir ke footer (0 bottom padding + 96 wrapper) — sudah OK dari Phase 4.22 |

**Kesimpulan interaksi:** Phase 4.22 sudah menyelesaikan gap ANTAR-block (sibling margin) dan gap block-terakhir-ke-footer (wrapper padding-bottom). Yang belum diselesaikan: **bottom padding INTERNAL block itu sendiri = 0**, sehingga total breathing space antara dua konten adjacent = gap + top-only-padding = asimetris (kecil di atas gap, besar di bawah gap). Ini ROOT CAUSE ketimpangan yang tersisa.

**Additive/collision issues yang perlu diwaspadai saat Part C:** kalau nanti Part C menambah `pb-*` uniform ke semua block, harus dipastikan interior padding block yang sudah ada (StatsBanner `pb-8 md:pb-12`, ValueProps `p-6 md:p-8` inner card, HeroImmersive `py-16 md:py-20` inner) **dihapus** — jangan dobel. Kalau tidak, StatsBanner akan jadi 32+48 = 80 px bottom padding sekaligus (over-shoot ke sisi lain).

### A.4 Ringkasan temuan (untuk input Part B)

1. **Top padding sudah uniform** — kepercayaan hipotesis awal *bisa* keliru, mayoritas block sudah pakai `pt-16 md:pt-24` yang sama. Yang perlu di-unify adalah **bottom padding**, bukan top.
2. **Bottom padding = 0 pada 13/15 block** — ini penyebab utama rhythm asimetris. Fix = tambahkan `pb-*` yang matching dengan `pt-*` (atau nilai yang di-pilih owner).
3. **3 outlier yang bypass sistem**: ServiceListingHeroImmersive (hardcoded `py-*`), ValuePropsBanner (`-mt-16` overlap), StatsBanner interior grid (`pb-8 md:pb-12` post-polish). Part C harus refactor ketiganya supaya juga consume unified system — kecuali ValueProps yang overlap-nya deliberate (perlu diskusi apakah override khusus atau tetap opt-out).
4. **HeroBlock kasus khusus**: `min-h-[calc(100vh-5rem)]` mendominasi padding. Perlu keputusan owner: apakah Hero ikut sistem uniform padding, atau tetap viewport-driven (rekomendasi: tetap viewport-driven karena visual behavior beda dari section biasa).
5. `paddingOverride` per-block harus punya `top` dan `bottom` terpisah supaya editor bisa reduce/expand satu sisi saja tanpa harus custom kedua sisi.

---

## Part B — Proposed Plan
**Status**: ⏳ menunggu owner approval untuk (B.1) default value dan (B.2) schema. Approval untuk `Hero opt-out = YES` dan `ValuePropsBanner overlap opt-out = YES` sudah masuk (2026-09-01).

### B.1 Proposed unified default

```
blockPadding: {
  top:    { mobile: 48px, desktop: 64px }    // Tailwind equivalent: pt-12 md:pt-16
  bottom: { mobile: 48px, desktop: 64px }    // Tailwind equivalent: pb-12 md:pb-16
}
```

**Anchor & reasoning:**

- **Anchored to current mobile top value** (`pt-8 md:pt-24` compact vs `pt-16 md:pt-24` normal — the `pt-16` = 64 desktop, `pt-12` = 48 mobile — jadi 48/64 mengambil nilai *tighter* dari current desktop dan *slightly tighter* dari current mobile top). Bukan "guess", tapi *derived* dari existing scale: 48 = 3 × 16, 64 = 4 × 16 — masih di dalam Tailwind 4-unit rhythm yang project sudah pakai.
- **Symmetric top = bottom** (bukan `top < bottom` maupun sebaliknya). Alasan: audit menunjukkan **root cause ketimpangan adalah asimetri**, bukan besaran padding. Cara paling langsung menghilangkan asimetri = pilih nilai simetris. Bias intentional (top > bottom untuk "content sits closer to what follows") baru ditambah kalau setelah Phase 1 owner review dan minta demikian.
- **Total space antara konten adjacent** (desktop, `normal` preset gap = 48 px):
  - **Sekarang**: 0 (bottom Block A) + 48 (gap) + 96 (top Block B) = **144 px** — asimetris
  - **Setelah Phase 1**: 64 (bottom Block A) + 48 (gap) + 64 (top Block B) = **176 px** — simetris; +32 px total = ~22% lebih spacious tapi rhythm jauh lebih rapi
- **Mobile behavior**: 48 + 32 (gap normal mobile) + 48 = **128 px** vs sekarang 0 + 32 + 64 = 96 px. +33% mobile — jadi mobile terasa **lebih lega dari sebelumnya**, yang sesuai dengan feedback "berantakan di mobile" (implicit dari Phase 4.23 discussion).
- **Edge case Hero**: opt-out — `min-h-[calc(100vh-5rem)]` tetap driver utama. Padding value dari sistem tetap di-consume kalau editor mau override, tapi default behavior tidak berubah.
- **Edge case ValuePropsBanner**: opt-out — `-mt-16` overlap dipertahankan; Part C tidak menyentuh block ini kecuali menambah field `paddingOverride` supaya editor bisa opt-in ke sistem kalau mau.

**Alternatives yang dipertimbangkan (jika owner ingin adjust):**
| Choice | Values | Total desktop (with gap) | Character |
|---|---|---|---|
| A (**recommended**) | 48/64 both sides | 176 px | Symmetric, moderate breathing, closest to current density |
| B — more spacious | 64/80 both sides (`py-16 md:py-20`) | 208 px | +44% vs current; more editorial feel |
| C — tighter | 40/56 both sides (`py-10 md:py-14`) | 160 px | Only +11% vs current, minimal disruption |
| D — top-biased | top 64/80, bottom 48/64 | 192 px | Sections feel "led into" (top > bottom); asymmetric on purpose |
| E — bottom-biased | top 48/64, bottom 64/80 | 192 px | Sections feel "closing" (bottom > top); less common convention |

Recommendation tetap **A**. Kalau owner pilih B/C/D/E, tinggal ganti angka — schema tidak berubah.

### B.2 Schema design

#### Two additions:

**(1) Global default** — di [`apps/cms/src/globals/SiteSettings.ts`](../../apps/cms/src/globals/SiteSettings.ts) grup `layout` (sama tempat Phase 4.22's `blockGap` / `beforeFooter` hidup):

```ts
{
  name: 'blockPadding',
  type: 'group',
  admin: { description: 'Internal top/bottom padding default untuk semua block (bisa di-override per-block di Advanced tab).' },
  fields: [
    {
      name: 'top',
      type: 'group',
      fields: [
        { name: 'mobile',  type: 'number', defaultValue: 48, min: 0, max: 200, admin: { description: 'px, mobile (<768px)' }},
        { name: 'desktop', type: 'number', defaultValue: 64, min: 0, max: 200, admin: { description: 'px, ≥768px' }},
      ],
    },
    {
      name: 'bottom',
      type: 'group',
      fields: [
        { name: 'mobile',  type: 'number', defaultValue: 48, min: 0, max: 200 },
        { name: 'desktop', type: 'number', defaultValue: 64, min: 0, max: 200 },
      ],
    },
  ],
}
```

**Kenapa pakai `number` (px) bukan preset select:** owner minta "measured, not guessed" — angka langsung mudah di-tune dan di-verify di DevTools. Preset select bisa ditambahkan nanti kalau ternyata owner cuma pakai 2-3 nilai populer.

**(2) Per-block override** — field `paddingOverride` group di **Advanced tab setiap block** di [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts), mirror pattern `spacingOverride` dari Phase 4.22:

```ts
{
  name: 'paddingOverride',
  type: 'group',
  admin: { description: 'Override internal top/bottom padding untuk block ini. Default OFF = pakai global blockPadding.' },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false, admin: { description: 'Aktifkan override' } },
    {
      type: 'row',
      admin: { condition: (_, sib) => sib?.enabled === true },
      fields: [
        {
          name: 'top',
          type: 'select',
          defaultValue: 'inherit',
          admin: { width: '50%', description: 'Top padding preset' },
          options: [
            { label: 'Inherit (pakai global)', value: 'inherit' },
            { label: 'None (0)', value: 'none' },
            { label: 'Compact (~32/48)', value: 'compact' },
            { label: 'Normal (~48/64)', value: 'normal' },
            { label: 'Spacious (~80/96)', value: 'spacious' },
            { label: 'Custom (isi px di bawah)', value: 'custom' },
          ],
        },
        {
          name: 'bottom',
          type: 'select',
          defaultValue: 'inherit',
          admin: { width: '50%' },
          options: [
            { label: 'Inherit (pakai global)', value: 'inherit' },
            { label: 'None (0)', value: 'none' },
            { label: 'Compact (~32/48)', value: 'compact' },
            { label: 'Normal (~48/64)', value: 'normal' },
            { label: 'Spacious (~80/96)', value: 'spacious' },
            { label: 'Custom (isi px di bawah)', value: 'custom' },
          ],
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_, sib) => sib?.enabled === true && (sib?.top === 'custom' || sib?.bottom === 'custom') },
      fields: [
        { name: 'customTopMobile',  type: 'number', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.top === 'custom', description: 'top mobile px' }},
        { name: 'customTopDesktop', type: 'number', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.top === 'custom', description: 'top desktop px' }},
        { name: 'customBtmMobile',  type: 'number', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.bottom === 'custom', description: 'bottom mobile px' }},
        { name: 'customBtmDesktop', type: 'number', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.bottom === 'custom', description: 'bottom desktop px' }},
      ],
    },
  ],
}
```

`inherit` = pakai global default (per side, jadi editor bisa `top: inherit, bottom: none` untuk reduce satu sisi saja).

**Preset scale — share dengan Phase 4.22 `betweenBlocks` atau terpisah?**
**Recommendation: TERPISAH.** Alasan:
- `betweenBlocks` adalah *gap ANTAR* block (margin) — nilai berbeda konteks (spacing negatif antar entitas berbeda).
- `blockPadding` adalah *padding DALAM* block — nilai berbeda konteks (space internal single entitas).
- Membaginya risiko: mengubah preset "normal" di satu tempat diam-diam mengubah rhythm di tempat lain. Semantic decoupling lebih aman.
- Nilai preset boleh mirip (dan default `normal` di dua sistem kebetulan bisa dekat: gap normal desktop = 48, padding normal desktop = 64) tapi tetap constant literal terpisah di [`blockStyles.ts`](../../apps/web/src/lib/blockStyles.ts).

**DB impact (per `docs/DB-SCHEMA-CHANGES.md`):**
- SiteSettings global — 4 kolom numeric baru: `site_settings.layout_block_padding_top_mobile`, `..._top_desktop`, `..._bottom_mobile`, `..._bottom_desktop`. Panjang max ~55 char, di bawah 63-char limit.
- Setiap collection yang mengandung block (~10 collections × ~16 block types × 6 kolom per `paddingOverride`) = ~1000 kolom baru. **Ini banyak.** Alternative: simpan `paddingOverride` sebagai `json` field tunggal → 1 kolom per block per collection (~160 kolom total). Ada tradeoff query-ability vs kompleksitas.
  - **Recommendation: pakai group fields (Payload standard).** Column count besar tapi Drizzle handle otomatis. Sudah pola yang dipakai `spacingOverride` di Phase 4.22 dengan skala mirip. Konsistensi > penghematan kolom.
- **Nama field pendek**: `pad` bukan `paddingOverride` di enum/table name → risiko overflow lebih rendah. Full column contoh: `water_activities_blocks_stats_banner_pad_custom_top_desktop` = 60 char, tepat di batas 63-char. **Perlu diverifikasi saat schema push**. Alternatif kalau overflow: pakai `dbName` prefix per collection.

### B.3 Implementation surface (files yang berubah)

**CMS:**
- [apps/cms/src/globals/SiteSettings.ts](../../apps/cms/src/globals/SiteSettings.ts) — tambah `blockPadding` group di `layout` group
- [apps/cms/src/fields/advancedStyle.ts](../../apps/cms/src/fields/advancedStyle.ts) *(assumed path — verify)* — tambah `paddingOverrideFields` array yang di-spread ke tab Advanced setiap block. Alternative: buat helper `paddingOverrideField` yang di-import per block config di [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts).

**Web (single point of extension):**
- [apps/web/src/lib/blockStyles.ts](../../apps/web/src/lib/blockStyles.ts) — refactor `resolvePadding`. Signature baru:
  ```ts
  resolvePadding(block: any, globalPad?: BlockPadding): { style: string; className: string }
  ```
  Menggantikan pola return Tailwind class saat ini. Sebisanya pakai inline `style="padding-top:Xpx;padding-bottom:Ypx"` (bukan class) supaya nilai numeric dari CMS bisa langsung ter-render tanpa perlu Tailwind JIT re-scan. Preset (`compact/normal/spacious`) di-map ke pixel di helper.
- [apps/web/src/components/blocks/BlockRenderer.astro](../../apps/web/src/components/blocks/BlockRenderer.astro) — teruskan `globalPad` (dari `settings.layout.blockPadding`) ke setiap block via prop atau CSS variable pada wrapper `.block-stack`. **Recommendation: CSS variable** (`--block-pad-top-mobile`, dst.) — konsisten dengan pola `--block-gap` dari Phase 4.22, tidak perlu ubah signature 16 block components.

**Web (setiap block component — 15 file):**
- [HeroBlock.astro](../../apps/web/src/components/blocks/HeroBlock.astro) — **opt-out**: hapus `paddingClass` DAN jangan consume new system. Tetap `min-h-[calc(100vh-5rem)]`.
- [ValuePropsBannerBlock.astro](../../apps/web/src/components/blocks/ValuePropsBannerBlock.astro) — **opt-out**: `-mt-16` overlap dipertahankan. Kalau editor set `paddingOverride.enabled=true`, respect override; kalau default, tetap overlap.
- [StatsBannerBlock.astro](../../apps/web/src/components/blocks/StatsBannerBlock.astro) — **hapus** `pb-8 md:pb-12` yang baru ditambah owner di commit `ff68b0f`. Let unified system drive it. Ini rollback partial dari polish sebelumnya — perlu di-flag ke owner.
- [ServiceListingHeroImmersive.astro](../../apps/web/src/components/blocks/ServiceListingHeroImmersive.astro) — refactor `py-16 md:py-20` (hero inner) dan `py-12 md:py-16` (listing content) untuk consume unified system atau at least align dengan preset yang sama.
- **Semua block lain** (RichText, Image, Gallery, CTA, FAQ, Testimonials, TestimonialsCarousel, ServiceGrid, ServiceListingEditorial, Contact, Embed, TrustBadges) — ganti call `resolvePadding(sectionPadding)` dengan `resolvePadding(block, globalPad)` (block-aware).

**Types:**
- `packages/shared/src/types/payload-types.ts` — auto-regenerate saat CMS field ditambah.

### B.4 Rollout plan (2-phase, sesuai task)

**Phase 1 — Unification (satu commit di Part C):**
1. Tambah global `blockPadding` field di SiteSettings dengan approved default (48/64 kalau approve rekomendasi A).
2. Refactor `resolvePadding` di `blockStyles.ts` untuk consume globalPad.
3. Wire CSS variable di `BlockRenderer.astro`.
4. Update setiap block component: hapus hardcoded `pb-*`/`pt-*` yang bertentangan dengan sistem, opt-out untuk Hero + ValueProps.
5. **Rollback polish `pb-8 md:pb-12` dari StatsBanner** (bagian dari refactor).
6. Verify: build 50 pages, screenshot before/after tiap page template (home, tour detail, accommodation detail, service listing), diff visual.
7. **Owner review checkpoint** — sign off visual outcome sebelum Phase 2 (kalau owner tidak suka, tune angka dulu di step 1, ulangi tanpa menambah field baru).

**Phase 2 — Override capability (commit kedua di Part C):**
1. Tambah field `paddingOverride` group ke Advanced tab setiap block config di CMS.
2. Extend `resolvePadding` di web untuk read + apply override.
3. Verify: create test page dengan 1 block override enabled, check inline style menang.
4. **Owner review**: no visual change on existing pages (semua `enabled=false`), tapi field tersedia di admin.

**Between phases owner review checkpoint** = **hard stop**. Jangan gabungkan dua commit.

### B.5 Rollback plan

**Phase 1:**
- `git revert <phase-1-commit>` di `feature/per-block-padding`
- `ALTER TABLE site_settings DROP COLUMN layout_block_padding_top_mobile` (dst, 4 kolom) — atau abaikan, kolom kosong tidak mengganggu

**Phase 2:**
- `git revert <phase-2-commit>`
- DROP COLUMN untuk setiap `*_pad_*` kolom di semua collection tables (bulk script, sama pola dengan Phase 4.23 fix)

## Part C — Implementation
**Status**: ⏳ blocked oleh approval owner untuk Part B.1 (default value) dan B.2 (schema — terutama column-count concern dan `enabled=false` default). Setelah approve, Phase 1 dulu → review → Phase 2.

---

### Approvals dibutuhkan sebelum Part C

1. **B.1 default value** — approve rekomendasi A (48/64 symmetric), atau pilih B/C/D/E, atau nilai kustom?
2. **B.2 schema** — approve pakai group fields (~1000 kolom baru), atau minta pakai JSON single-column (~160 kolom)?
3. **Konfirmasi rollback pb-8 pada StatsBanner polish (commit `ff68b0f`)** dianggap OK karena akan diganti dengan unified padding? (Visual endpoint sama — StatsBanner tetap punya bottom breathing, hanya sourcenya berpindah dari hardcode ke global.)
4. **HeroBlock opt-out**: ✅ approved (2026-09-01)
5. **ValuePropsBanner overlap opt-out**: ✅ approved (2026-09-01)
