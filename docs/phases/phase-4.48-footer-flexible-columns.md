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

---

## 4.48.1 Addendum — Brand social toggle + row polish (2026-09-15)

Owner UAT: dua penyempurnaan kecil setelah pemakaian awal.

### 1. `showSocialLinks` untuk brand type

Owner report: kolom `brand` di Layout Columns bisa render logo + tagline + social, tapi tidak ada cara matikan social kalau SA cuma mau brand + tagline saja (yang di legacy fields ada `showSocialLinks` top-level).

**Fix:** field baru **`showSocialLinks`** (checkbox, default true) di array row, conditional visible saat `type === 'brand'`. Migration [`20260915_134319.ts`](../../apps/cms/src/migrations/20260915_134319.ts) — `ALTER TABLE footer_settings_layout_columns ADD show_social_links integer DEFAULT true`, reversible, applied batch 17. Frontend `LayoutColumnOut` menambah field; `FooterTemplate1` brand branch cek `col.showSocialLinks !== false` sebelum render `.dnj-f-social`.

Default true → row brand yang sudah dibuat sebelum phase ini (kalau ada) tetap tampilkan social otomatis.

### 2. Row label + colored border per type

Owner report: row array masih menampilkan label default Payload "Row 01, Row 02" — tidak informatif. Minta pola sama dengan **block system di /admin/collections/pages/1** (badge + summary + row #, plus border kiri berwarna per type).

**Fix:**
- New: [`apps/cms/src/components/FooterLayoutRowLabel.tsx`](../../apps/cms/src/components/FooterLayoutRowLabel.tsx) — client component pakai `useRowLabel<Data>()` (mirror pola `MenuItemRowLabel`, `BlockLabel`). Output: `[BADGE type] · heading · [width chip] · #01`. Fallback text untuk brand ("Logo · tagline · social") dan paymentMethods ("Badges dari SiteSettings") ketika heading kosong.
- Palette selaras Phase 4.8 BlockLabel:
  - `brand` `#1b3a4b` (ocean)
  - `menuList` `#3d405b` (stone)
  - `services` `#24506a` (ocean-mid)
  - `contact` `#484850` (neutral-3)
  - `paymentMethods` `#c98a5f` (amber-coral)
  - `custom` `#6b9080` (leaf)
- Registered via `admin.components.RowLabel: '/components/FooterLayoutRowLabel#default'` pada array `layoutColumns`.
- New CSS [`apps/cms/src/admin/footer-layout.css`](../../apps/cms/src/admin/footer-layout.css) — styling `.dnj-fl-row*` + `:has()` selector di `.array-field__draggable-rows > .collapsible` untuk border-left berwarna per type (persis pola block row Phase 4.8). Loaded via `AdminStyles.tsx` provider (global admin).

### Files touched (Addendum)

- **New:** `apps/cms/src/components/FooterLayoutRowLabel.tsx`, `apps/cms/src/admin/footer-layout.css`, `apps/cms/src/migrations/20260915_134319.ts` + `.json`
- **Modified:** `apps/cms/src/globals/FooterSettings.ts` (RowLabel registration + showSocialLinks conditional field), `apps/cms/src/migrations/index.ts`, `apps/cms/src/admin/AdminStyles.tsx` (import footer-layout.css), `apps/cms/src/app/(payload)/admin/importMap.js` (auto-regen), `apps/web/src/components/navigation/FooterRenderer.astro` (`LayoutColumnOut.showSocialLinks`), `apps/web/src/components/navigation/templates/FooterTemplate1.astro` (brand branch cek `col.showSocialLinks`), `packages/shared/src/types/payload-types.ts` (regen)

### UAT (Addendum)

1. Buka Footer Settings → Layout Columns → Add row → select `type = brand`.
   - Row label sekarang: **`[BRAND]` Logo · tagline · social · [auto] #01**. Border kiri ocean.
   - Checkbox baru **"Show Social Links"** muncul (default checked).
2. Ganti type ke `menuList` → badge jadi stone, border stone.
3. Add row × 6 (mis. brand · menuList · services · contact · paymentMethods · custom) → warna badge + border beda-beda per type.
4. Isi heading pada row → summary di label ikut update saat row di-collapse.
5. Uncheck Show Social Links di brand row → save → frontend footer kolom brand tampil logo+tagline saja tanpa social icons.

### 3. Hotfix — Footer Settings 500 saat load (Payload renderField error)

**Report:** Setelah 4.48.1 deploy, `/admin/globals/footer-settings` melempar `TypeError: Cannot read properties of undefined (reading 'singular')` di `renderField.js:118` — form Payload gagal build, Footer Settings tidak muncul.

**Root cause:** Kedua array baru (`site_settings.paymentMethods` + `footer_settings.layoutColumns`) di-declare dengan `label: false`. Payload v3 fieldSchemasToFormState mengiterasi array rows dan mengakses `field.labels.singular` — kalau `label: false`, Payload skip generate default `labels` object → undefined → crash.

**Fix (1 baris per array):** ganti `label: false` jadi label string + `labels: { singular, plural }` explisit:

```ts
// site_settings.paymentMethods
label: 'Payment Methods',
labels: { singular: 'Payment Method', plural: 'Payment Methods' },

// footer_settings.layoutColumns
label: 'Footer Columns',
labels: { singular: 'Column', plural: 'Columns' },
```

Zero migration/data impact. Label header muncul di atas array (cosmetic), sudah dibingkai collapsible parent — tidak menyusahkan.

**Lesson:** Pola `label: false` aman untuk `type: 'group'` (dipakai di Header advanced) tapi TIDAK untuk `type: 'array'` — array wajib punya `labels.singular` untuk row header state.
