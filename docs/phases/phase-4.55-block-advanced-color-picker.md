# Phase 4.55 — Block Advanced: Color Picker + Collapsible Sections (Full Rollout: 22 Blocks)

**Status:** ✅ Code complete · ⏳ Owner UAT · 🎯 Scope: **Semua 22 block CMS** (Hero, RichText, Image, Gallery, CTA, Testimonials, TestimonialsCarousel, ServiceGrid, ServiceListing, FAQ, ContactBlock, EmbedBlock, NewsletterBlock, ValuePropsBanner, StatsBanner, TrustBadges, Spacer, PostList, FeaturedPost, PopularPosts, AdSlot, CategoryGrid)
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.42 (`ColorSwatchField` + `colorPickerField` helper)

## Motivasi (owner request)

> "Untuk 22 block yang existing saya mau kamu lakukan audit — colour yang di gunakan itu masih hardcore, tidak seperti colour yang digunakan di settings … saya mau ini juga di terapkan di semua block yang terdapat advance untuk setting colour masing-masing. Contoh mulai dari 1 block dahulu yaitu HERO di halaman Home. TABS Advanced-nya saya mau di buat lebih maksimal biar tidak terlalu panjang kebawah, jadi lebih minimalis tanpa mengurangi value dan informasi."

Sebelum 4.55, `background.color` / `button.color` / `button.textColor` / `ts.headingColor` / `ts.subheadingColor` = **hardcoded `select`** (8 token slug: sand/ocean/coral/leaf/stone/midnight/white/default). Editor tidak bisa isi hex bebas → tidak bisa match warna kustom brand campaign. Advanced tab juga panjang scroll (7 grup vertikal).

## Perubahan (Hero pilot)

### 1. Refactor besar — `apps/cms/src/fields/advancedStyle.ts`

Sebelumnya `advancedStyleFields`/`advancedStyleFieldsNoButton` = flat `Field[]` array. Sekarang jadi **function `(opts) => Field[]`** dengan `opts.textElements` + `opts.omitBackground`. Text Styles collapsible di-inline (dulu terpisah lewat `buildTextStyleField(...)` di tiap block). Layout auto: 5 collapsibles disebar 2 per baris (Bg+Btn · TS+Pad · Spacing sendirian) sehingga semua 50% breathing room.

**File `heroAdvanced.ts` pilot dihapus** — Hero sekarang pakai helper generic yg sama.

**File `textStyle.ts` disederhanakan** ke type-only export `TextElement` (helper `buildTextStyleField` dihapus, sudah tidak dipakai).

**Struktur output** (`heroAdvancedFields: Field[]`) — semua collapsibles 50/50 supaya expand tidak mepet:

1. **Row 1** — Layout row (padding · alignment · container width) — **visible**
2. **Row 2** — `entryAnimation` select — **visible**
3. **Row 3** (2-kol, semua `initCollapsed: true`):
   - `collapsible` "Background" (50%) → `background` group (type/color-picker/image/overlayOpacity)
   - `collapsible` "Button (CTA)" (50%) → `button` group (variant/radius row · color-picker/textColor-picker row · hoverAnimation)
4. **Row 4** (2-kol, semua `initCollapsed: true`):
   - `collapsible` "Text Styles" (50%) → `ts` group (headingColor-picker + headingAnimIn · subheadingColor-picker + subheadingAnimIn)
   - `collapsible` "Padding Override" (50%) → `pad` group (unchanged fields)
5. **Row 5** (1 item, `initCollapsed: true`):
   - `collapsible` "Spacing Override" (50%, alone) → `spacingOverride` group (unchanged fields)

**Kompresi**: 7 grup vertikal → 5 baris (2 visible + 3 baris collapsibles). 50/50 dipilih supaya saat expand tiap section punya breathing room (33/34/33 sebelumnya terlalu mepet). Baris 5 sengaja 50% + kosong (bukan full-width) untuk konsistensi visual grid.

**Color fields swap** — `select` → `colorPickerField()`:
- `background.color`  → swatch popover, preset chips (7 warna theme), default `#1B3A4B`
- `button.color`      → default `#E07A5F` (coral)
- `button.textColor`  → default `#FFFFFF`
- `ts.headingColor`   → default `#FFFFFF`
- `ts.subheadingColor`→ default `#FFFFFF`

Preset chip = 7 warna brand tailwind (`#1B3A4B` ocean · `#E07A5F` coral · `#6B9080` leaf · `#F5F0E8` sand · `#3D405B` stone · `#0D1B2A` midnight · `#FFFFFF` white) — editor klik-cepat tanpa hafal hex.

### 2. Zero migration

Semua kolom target (`background_color`, `button_color`, `button_text_color`, `ts_heading_color`, `ts_subheading_color`) sudah `text` type di SQLite → swap `select` → `colorPickerField` (juga `text`) = **0 schema change**. Verified di migration `20260912_114854.ts` line 49, 65, 68-71.

### 2b. Refactor `apps/cms/src/components/ColorSwatchField.tsx` — compact mode

Custom prop `admin.custom.compact: boolean` (via `colorPickerField(..., { compact: true })`):
- Label pakai `display: flex` + ikon `?` di ujung dengan `title` tooltip (description direlokasi kesini)
- Hex text input inline **dihilangkan** — edit hex via popover picker (`HexColorInput` di dalam picker)
- Reset button langsung di sebelah swatch (space saving)
- Kode hex ditampilkan **di bawah** swatch (monospace, uppercase, read-only)
- `<p>` description di bawah swatch di-skip (sudah pindah ke tooltip)

Non-compact mode default preserved untuk 9 field HeaderSettings Phase 4.42 → zero regression di luar block Advanced.

### 3. Frontend `apps/web/src/lib/blockStyles.ts` — dual-mode resolvers

Value bisa **token slug** (data lama: `"coral"`, `"ocean"`, …) atau **hex** (`"#E07A5F"`, `"#1B3A4B99"` dgn alpha). Detection via regex `HEX_RE`, mapping ke:
- Slug → Tailwind class (`text-coral`, `bg-ocean`, …) — existing behavior preserved
- Hex → inline `style="color:#…"` / `background-color:#…`

**Shared helpers di `blockStyles.ts`** (dipakai 15+ block components):
- `resolveColorValue(v, 'text'|'bg'|'border')` → `{ className, style }`
- `resolveBackground(bg)` → tambah field `bgStyle` di return object (backward compat: `bgClass` string tetap ada)
- `resolveButtonClasses(btn)` → return **object** `{ classes, style }` (BREAKING dari `string[]` sebelumnya — updated CTABlock caller pass `style={btnStyle || undefined}` di 5 anchor)
- `resolveTextColor(v)` → tetap return `string` (backward compat); companion `resolveTextColorStyle(v)` untuk inline style

**HeroBlock.astro** — pakai `resolveColorValue` shared helper (dulu inline). Applied ke:
- `background.color` → `sectionBgClass` + `sectionBgStyle`
- `ts.headingColor` → `headingRes.className` + `headingHexStyle` (see below)
- `ts.subheadingColor` → `subheadingRes.className` + `subheadingRes.style`
- `button.color` (variant-aware — solid: bg; outline: border+text; ghost: text) + `button.textColor` override / auto-contrast

**CSS var untuk heading override**: `.hero-block h1 { color: white !important }` di style block bisa menang atas inline `color:hex`. Solusi: ubah jadi `color: var(--hero-heading-color, white) !important`, inline `style="--hero-heading-color:#…;color:#…"` saat editor pilih hex. Token path tetap pakai class specificity (var tak perlu di-set).

**Auto-contrast solid button**: hex path → hitung luma dari RGB, `luma > 0.7` → `text-ocean` else `text-white`. Token path → existing behavior (`white`/`sand` → `text-ocean` else `text-white`).

### 4. Types regenerated

`packages/shared/src/types/payload-types.ts` — Hero block `background.color?: string | null`, `button.color?: string | null`, `button.textColor?: string | null`, `ts.headingColor?: string | null`, `ts.subheadingColor?: string | null` (sebelumnya enum union).

## Non-impact / backward compat

- Data lama `background.color = "coral"` → frontend map ke `bg-coral` class → render identik dengan sebelum 4.55. Test:
  - Home hero (default: `background.type='default'`, `button.color='coral'`, `ts.headingColor='inherit'`) → dev browser inspect:
    - Bg: `rgb(27, 58, 75)` (bg-ocean fallback) ✓
    - CTA: `bg-coral` class + `text-white` ✓
    - h1: putih ✓ (var default fallback)
    - No inline `style` attribute pada element (semua path token) ✓
- Data lama `button.textColor = "default"` → resolveColor returns `{ className:'', style:'' }` → auto-contrast path fire → identik sebelum 4.55.
- CSS var + `!important` menang: verified dgn inject `style="--hero-heading-color:#E07A5F;color:#E07A5F"` → computed `rgb(224, 122, 95)` ✓.
- 21 block lain (RichText/Image/Gallery/Testimonials/dst) **tak disentuh** — masih pakai `advancedStyleFields`/`advancedStyleFieldsNoButton` + `buildTextStyleField(...)`.

## Files touched

**New:**
- `docs/phases/phase-4.55-block-advanced-color-picker.md` — dokumen ini

**Deleted:**
- `apps/cms/src/fields/heroAdvanced.ts` — pilot helper, di-merge ke generic `advancedStyleFields`

**Modified (CMS):**
- `apps/cms/src/fields/advancedStyle.ts` — flat `Field[]` → function `(opts) => Field[]` dengan `textElements`/`omitBackground` args, layout compact/collapsible 2-kol auto-batch
- `apps/cms/src/fields/textStyle.ts` — trim ke type-only export `TextElement`
- `apps/cms/src/fields/colorPicker.ts` — tambah `compact?: boolean` di `ColorPickerOpts`
- `apps/cms/src/components/ColorSwatchField.tsx` — compact mode: `?` tooltip label, hide inline hex input, hex code display di bawah swatch
- `apps/cms/src/blocks/index.ts` — 22 block Advanced tab swap ke function-form (`advancedStyleFields[NoButton]({ textElements: […] })`)

**Modified (Web):**
- `apps/web/src/lib/blockStyles.ts` — new `resolveColorValue()` + `resolveTextColorStyle()`, `resolveBackground` tambah `bgStyle`, `resolveButtonClasses` breaking → object return `{ classes, style }`, hex auto-contrast luma
- `apps/web/src/components/blocks/HeroBlock.astro` — pakai shared `resolveColorValue`, CSS var `--hero-heading-color` untuk override `!important`
- `apps/web/src/components/blocks/CTABlock.astro` — adapt ke `resolveButtonClasses` return object; 5 anchor CTA + `style={btnStyle || undefined}`

**Regen:**
- `packages/shared/src/types/payload-types.ts` — 22 block × ~5 color field jadi `string | null` (dulu enum tuple)

## Rekomendasi rollout ke 21 block lain (Post-UAT)

Pola sama, per block builder (`richTextAdvanced.ts`, `galleryAdvanced.ts`, dst) atau **satu helper generic** `buildAdvancedFields({ hasButton, textElements })` yang kembalikan collapsible tree + color pickers. Recommend approach kedua supaya:
- Konsistensi UI 22 block (semua Advanced tab layout sama)
- Perubahan future (mis. tambah field baru) 1 tempat = 22 block dapat sekaligus
- Codebase lebih tipis

Sisa block (categorized by content shape):
- **CTA-bearing** (heroAdvancedFields equivalent — with button): CTA, ServiceGrid, ServiceListing (Editorial + Hero Immersive), NewsletterBlock, PostListBlock
- **No CTA button** (advancedStyleFieldsNoButton equivalent): RichText, Image, Gallery, FAQ, Testimonials, TestimonialsCarousel, ValuePropsBanner, StatsBanner, TrustBadges, ContactBlock, EmbedBlock, Spacer, FeaturedPostBlock, PopularPostsBlock, AdSlotBlock, CategoryGridBlock

## UAT checklist (Hero block on Home)

1. Super-admin login → **Pages → home → Hero block**. Klik tab **Advanced**.
2. Verifikasi **5 collapsibles** (Background · Button · Text Styles · Padding · Spacing) semua **collapsed** di initial render. Layout row + Entry Animation langsung terlihat.
3. Klik "Background" → group expand. Set `type = Solid Color` → field `Background Color` muncul dengan **swatch 38×38 + hex input + preset chip strip**. Klik chip Ocean → nilai jadi `#1B3A4B` + swatch berubah. Klik swatch → **HexColorPicker popover** muncul. Drag SV / hue → hex live update. Klik outside → tutup.
4. Set custom hex (mis. `#7C3AED` purple) → Save. Refresh preview `/` → hero bg berubah jadi purple (inline `background-color: rgb(...)` di div `.absolute.inset-0.z-0`).
5. Klik "Text Styles" → set `Heading Color = #FFEF00` (kuning) + `Subheading Color = ` preset Coral. Save. Frontend h1 kuning, p coral.
6. Klik "Button (CTA)" → `Button Color` preset Leaf, `Text Color` kosongkan (biar auto-contrast). Save. CTA jadi hijau bg + text putih (leaf gelap → luma < 0.7).
7. Reset test — clear `Background Color` (klik Reset di picker) → fallback ke `bg-ocean` default. ✓
8. Backward-compat test — buat Hero baru **tanpa sentuh Advanced** → render harus identik dengan hero sebelum 4.55 (bg ocean, CTA coral, h1 putih).
9. Mobile viewport check — collapsibles tetap collapse/expand normal, picker popover tidak overflow layar.
