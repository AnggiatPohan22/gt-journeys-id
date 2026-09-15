# Phase 4.46 — HomepageContent Tabs Refactor

**Status:** ✅ Code complete · ⏳ Owner UAT (login CMS, buka global, cek 3 tab)
**Branch:** `feature/phase4-polish-launch`
**Scope:** Pure UI refactor 1 global via `type: 'tabs'`. Zero schema/migration/payload-types shape change (unnamed tabs = presentation-only).

## Motivasi

Owner minta rapikan **Homepage — Fallback Content** biar konsisten dengan global lain yang sudah pakai tab (Header/Footer/AB/PB). Sebelumnya: 5 collapsible flat berjajar vertikal. Sekarang: 3 tab dengan pengelompokan semantic (Hero → Body Sections → Bottom CTA), matching struktur halaman itu sendiri.

## Perubahan

[`apps/cms/src/globals/HomepageContent.ts`](../../apps/cms/src/globals/HomepageContent.ts) — wrap seluruh field ke satu `type: 'tabs'` container:

| Tab | Isi |
|---|---|
| **Hero** | `heroHeading` · `heroCtaText` · `heroSubheading` · `heroCtaLink` |
| **Content Sections** | 3 collapsibles: **Value Propositions (4 items)** array · **Stats Banner** (eyebrow/heading + `stats` array) · **Testimonials Section** (eyebrow + heading; item ambil dari collection Testimonials) |
| **Bottom CTA** | `ctaHeading` · `ctaDescription` · `ctaButtonText` · `ctaButtonLinkOverride` |

Field name/type semua persis sama dengan sebelumnya — 0 rename, 0 migration.

Kenapa 3 tab (bukan 4/5)?
- Semantic natural homepage = **atas (Hero) · badan (Sections) · bawah (CTA)**.
- Testimonials di sini cuma heading (isi dari collection Testimonials) — terlalu sparse untuk tab sendiri; jadikan collapsible di dalam "Content Sections" bersama Value Props & Stats.
- Global ini tidak butuh tab **General/Advanced/Import-Export** karena pure editorial content — beda profil dari Header/Footer (yang punya template + warna).

## Non-impact

- **Zero schema change** — `type: 'tabs'` unnamed tidak bikin key baru, semua field name tetap di root global. `payload-types.ts` diff = 3 baris JSDoc description tambahan pada `heroCtaLink` (murni doc, tidak mengubah type).
- **Zero data change** — nilai existing di `homepage-content` tetap ada di kolom yang sama.
- **Zero apps/web change** — `apps/web/src/pages/index.astro` (yang fetch `getHomepageContent`) baca field lewat nama yang tak berubah.

## Files touched

- **Modified:** `apps/cms/src/globals/HomepageContent.ts`
- **Regenerated:** `packages/shared/src/types/payload-types.ts` (+3 baris JSDoc)

## UAT checklist

1. Login CMS sebagai super-admin → **Settings → Appearance → Homepage — Fallback Content**.
2. Sekarang muncul **3 tab** di atas: Hero · Content Sections · Bottom CTA.
3. **Hero** — 4 field flat (heading, CTA text row + subheading + CTA link).
4. **Content Sections** — 3 collapsible: Value Propositions (default open), Stats Banner (default closed), Testimonials Section (default closed).
5. **Bottom CTA** — 4 field flat.
6. Isi salah satu (mis. ubah `heroHeading`) → Save → frontend homepage terupdate (kalau `Page(slug=home)` tidak ada).
7. Editor login → global tetap tidak muncul (hidden existing dipertahankan).
