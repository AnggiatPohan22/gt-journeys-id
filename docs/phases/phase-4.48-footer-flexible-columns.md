# Phase 4.48 — Footer Flexible Column Builder + Payment Methods

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** 2 field baru + 1 migration + FooterTemplate1 refactor dual-state. Task 1 (footer newsletter) di-solve via SiteFeatures toggle di CMS — 0 code change.

## Motivasi

Dua request owner (audit fase sebelumnya):
1. **Footer newsletter "Get Bali Travel Inspiration"** di semua halaman blog/blog-detail — mau dihilangkan karena sudah ada Newsletter Block.
2. **Multi-column footer (template-1)** hardcode struktur 4-slot (Brand · Menu Columns · Services · Contact). Owner mau bisa **arrange kolom 1..4 bebas** + selipkan **Payment Methods** di bawah Contact.

## Keputusan

### Task 1 — Newsletter footer: 0 code, cukup toggle CMS

Audit: `NewsletterSignup.astro` (footer bar) di-gate `isSectionEnabled('newsletter')` — hanya konsumen `SiteFeatures.sections.newsletter`. `NewsletterBlock.astro` (block editor) tidak baca SiteFeatures. Jadi:

**Owner cukup matikan `Site Features → Section Halaman → Newsletter Signup`** → bar footer hilang di seluruh site, block newsletter yang editor pasang manual di Page/Post **tetap jalan normal**. Reversible via toggle sama.

**Tidak ada code change** untuk Task 1. Newsletter component tetap ada di codebase (kalau owner mau nyalakan lagi tinggal toggle).

### Task 2 — Flexible column builder (Interpretasi X, dual-state safe)

Mode baru **hidup berdampingan** dengan mode lama (backward compat):

- **Layout Columns kosong** (`footerCfg.layoutColumns` tidak ada / 0 rows) → FooterTemplate1 render **layout lama** (Brand · Menu Columns · Services · Contact). Tidak ada regresi visual buat site yang belum migrate.
- **Layout Columns ≥1 row** → FooterTemplate1 render sesuai definisi array.

Kolom = 1-4 rows, tiap row punya `type` + `width` + content-per-type:

| type | Content field | Deskripsi |
|---|---|---|
| `brand` | (otomatis) | Logo + siteName + tagline + social. `heading` di-abaikan. |
| `menuList` | `menu` (rel→Menus), `heading` | Kolom link generik dari koleksi Menus. |
| `services` | `menu` (opsional override), `heading` | Auto dari ServiceTypes; kalau `menu` di-set, override auto. |
| `contact` | `heading`, `showBusinessHours`, `showPaymentMethods` | Contact info dari SiteSettings + optional payment badges di bawah. |
| `paymentMethods` | `heading` | Kolom khusus payment badges (dari SiteSettings). |
| `custom` | `customContent` (richText), `heading` | Rich text bebas — sponsor logo, disclaimer, promo. |

**Width preset:** `auto` (bagi rata sisa space) · `25` · `33` · `50` (%). Frontend map ke Tailwind flex-basis:
- `25` → `basis-full md:basis-1/2 lg:basis-1/4`
- `33` → `basis-full md:basis-1/2 lg:basis-1/3`
- `50` → `basis-full md:basis-1/2`
- `auto` → `basis-full md:basis-1/2 lg:flex-1`

Mobile: semua kolom `basis-full` (stack 1 kolom). Tablet: 2 kolom. Desktop: sesuai preset.

### Task 3 — Payment Methods di SiteSettings (source of truth)

Field baru di **SiteSettings → Contact & Socials → Payment Methods** (collapsible baru, initCollapsed):

- `paymentMethods` array (max N):
  - `label` (text, required) — mis. "Visa", "GoPay"
  - `logo` (upload → media, required) — transparent PNG/SVG, tinggi ~24-32px
  - `url` (text, opsional) — URL provider

Frontend fetch di FooterRenderer, filter yang punya `logo.url`, ekspos sebagai `paymentMethods` prop ke template. Dipakai `contact` (dgn `showPaymentMethods=true`) atau `paymentMethods` type dedicated.

## Migration

[`apps/cms/src/migrations/20260915_120444.ts`](../../apps/cms/src/migrations/20260915_120444.ts) — dua sub-table baru:

1. **`site_settings_payment_methods`** — `_order` · `_parent_id` (FK site_settings) · `id` · `label` (text NOT NULL) · `logo_id` (FK media NOT NULL) · `url` (text nullable).
2. **`footer_settings_layout_columns`** — `_order` · `_parent_id` (FK footer_settings) · `id` · `type` (text DEFAULT `'menuList'`) · `width` (text DEFAULT `'auto'`) · `heading` (nullable) · `menu_id` (FK menus nullable) · `show_business_hours` (integer DEFAULT true) · `show_payment_methods` (integer DEFAULT false) · `custom_content` (text nullable, richText JSON).

Reversible via `DROP TABLE`. **DOWN destructive** untuk data layout — SA yang sudah isi Layout Columns akan kehilangan setup kalau rollback. Warning: data existing di kolom `footer_settings.columns` (menu columns lama) tetap utuh — safe untuk toggle mode kapan pun.

Applied batch 16. `payload generate:types` menambah type `SiteSetting.paymentMethods` + `FooterSetting.layoutColumns`.

## Files touched

- **New:** `apps/cms/src/migrations/20260915_120444.ts` + `.json`, `docs/phases/phase-4.48-footer-flexible-columns.md`
- **Modified:** `apps/cms/src/globals/SiteSettings.ts` (tambah Payment Methods collapsible di Contact & Socials tab), `apps/cms/src/globals/FooterSettings.ts` (tambah Layout Columns collapsible di Content tab paling atas, description Content tab update), `apps/cms/src/migrations/index.ts`, `apps/web/src/components/navigation/FooterRenderer.astro` (fetch paymentMethods + parse layoutColumns + forward `useLayoutColumns` flag), `apps/web/src/components/navigation/templates/FooterTemplate1.astro` (dual-mode: layoutColumns branch + legacy branch, payment badge chip CSS scoped), `packages/shared/src/types/payload-types.ts` (regen)

## Non-impact

- Site tanpa payment methods → kolom `paymentMethods` render pesan bantuan (buat SA yang lupa isi). Kolom `contact` dgn `showPaymentMethods=true` tapi belum ada data → section badges cuma tidak render.
- Site belum touch Layout Columns → footer tampil identik dengan Phase 4.43 (legacy path). Zero visual regression.
- Newsletter footer diatur via SiteFeatures toggle (Task 1) — kalau owner nyalakan lagi, tetap kompatibel.

## UAT checklist

**Task 1 (toggle):**
1. Login SA → **Settings → Pengaturan Fitur → Section Halaman → Newsletter Signup** → uncheck → Save.
2. Buka halaman blog / detail post → bar "Get Bali Travel Inspiration" di atas footer hilang.
3. Buka Page/Post yang punya Newsletter Block → block tetap render + tetap bisa submit.

**Task 3 (Payment Methods):**
4. SA → **Settings → Site Settings → Contact & Socials → Payment Methods** → expand → Add row → label `Visa`, upload logo, save. Ulangi untuk GoPay/BCA/dll.

**Task 2 (Layout builder):**
5. SA → **Settings → Footer Settings → Content tab → Layout Columns (flexible builder)** → Add row × 4:
   - Row 1: type `brand`, width `25`
   - Row 2: type `menuList`, width `25`, heading "Quick Links", menu → main-navigation
   - Row 3: type `services`, width `25`, heading "Our Services"
   - Row 4: type `contact`, width `25`, heading "Contact Us", `showBusinessHours=true`, `showPaymentMethods=true`
6. Save → refresh frontend → footer render 4 kolom sesuai; kolom Contact ada payment badges di bawahnya.
7. Ganti Row 4 type ke `paymentMethods` (kolom dedicated) → refresh → kolom terakhir cuma badge grid.
8. Custom column: tambah Row 5? Tidak bisa (maxRows: 4). Ganti salah satu row jadi `custom` + isi rich text → render sebagai rich text.
9. Kosongkan seluruh Layout Columns (hapus semua row) → Save → footer kembali ke layout lama otomatis (backward compat).

## Rollout ke template-2 / template-3?

Sekarang **cuma FooterTemplate1** (Multi-column) yang consume `layoutColumns`. Template-2 (Simple centered) dan Template-3 (Minimal) desain-nya tidak ada kolom → tidak perlu builder. Skip.

## Follow-up (nanti)

- Hapus field legacy (`footer_settings.columns`, `show_brand_column`, `show_services_column`, `show_contact_column`, `services_column_label`, `contact_column_label`, `services_menu`) di phase cleanup setelah owner konfirmasi semua site sudah pakai Layout Columns.
- Potential rollout ke checkout page: `paymentMethods` sudah source of truth global, tinggal fetch.
