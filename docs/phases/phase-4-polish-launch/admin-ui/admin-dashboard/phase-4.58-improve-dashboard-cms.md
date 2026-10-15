# Phase 4.58 — Improve Dashboard CMS (Smart Insight + Top Performing Scaffolding)

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.3 (dashboard role-based rewrite), Phase 4.32 (SiteFeatures tabs)

## Motivasi (owner report)

> "Saya mau tampilan informasi di dashboard itu lebih lengkap untuk superadmin dan admin, seperti penambahan:
> 1. AI Assistant / Smart Insight Widget — berisi SEO and Content Suggestions + Auto Image Tagging & Optimization.
> 2. Traffic and Performance — bisa menampilkan Top Performing destinations/services dengan views dan inquiries tertinggi.
> Semua fitur di-control di pengaturan oleh superadmin sehingga punya kuasa menon-aktifkan fitur tersebut."

## Scope keputusan (owner)

1. **AI provider:** Placeholder dulu — pakai heuristic rule-based checks (bukan AI call). Toggle field siap, real AI provider di-wire di 4.58.x kemudian.
2. **Data source Top Performing:** Hybrid — own counter + optional GA integration. Field `analyticsProvider` di CMS punya 3 opsi (`none` / `own` / `ga`). Scaffolding sekarang, wiring di 4.58.1 (own counter) & 4.58.2 (GA4 Data API).
3. **Scope phase 4.58:** Scaffolding + 4 toggles + 1 fitur wired end-to-end (Smart Insight heuristic).

## Perubahan

### 1. CMS — SiteFeatures baru tab "Dashboard Widgets"

`apps/cms/src/globals/SiteFeatures.ts` — tab baru (posisi ke-5, sebelum "Fitur Opsional") berisi group `dashboardWidgets`:

**Collapsible "AI Assistant / Smart Insight":**
- `smartInsightSeo` (checkbox, default `true`) — SEO & Content Suggestions
- `smartInsightImageTag` (checkbox, default `false`) — Auto Image Tagging (placeholder untuk phase berikutnya, butuh AI vision)

**Collapsible "Traffic & Performance":**
- `topPerformingViews` (checkbox, default `true`) — Top Performing (Views)
- `topPerformingInquiries` (checkbox, default `true`) — Top Performing (Inquiries)
- `analyticsProvider` (select, default `'none'`) — 3 opsi:
  - `none` — Belum diaktifkan (placeholder)
  - `own` — Own counter (frontend beacon → DB), akan di-wire di 4.58.1
  - `ga` — Google Analytics 4 Data API, akan di-wire di 4.58.2

**Access:** update = `isSuperAdmin` (inherit dari SiteFeatures global). Read = public (dashboard baca lewat local API).

### 2. Migration — 5 kolom ALTER TABLE `site_features`

`apps/cms/src/migrations/20260921_101203_phase_4_58_dashboard_widgets.ts`:

```ts
ALTER TABLE `site_features` ADD `dashboard_widgets_smart_insight_seo`       integer DEFAULT true;
ALTER TABLE `site_features` ADD `dashboard_widgets_smart_insight_image_tag` integer DEFAULT false;
ALTER TABLE `site_features` ADD `dashboard_widgets_top_performing_views`    integer DEFAULT true;
ALTER TABLE `site_features` ADD `dashboard_widgets_top_performing_inquiries`integer DEFAULT true;
ALTER TABLE `site_features` ADD `dashboard_widgets_analytics_provider`      text    DEFAULT 'none';
```

Pure ADD COLUMN dgn default — aman untuk SQLite (no recreate-table). Reversible via DROP COLUMN. **Applied:** batch 23, 113ms. Registered di `migrations/index.ts`.

Types regen (`packages/shared/src/types/payload-types.ts`) — 5 field baru di `SiteFeature.dashboardWidgets`.

### 3. Dashboard — 2 widget baru (admin + super-admin only)

`apps/cms/src/admin/DashboardStats.tsx`:

**Fetch site-features saat render:**
```ts
if (isAdminUp) {
  const sf = await payload.findGlobal({ slug: 'site-features' })
  widgetToggles = { ...(sf.dashboardWidgets ?? {}) }
}
```

**a. `<SmartInsightWidget />` — WIRED END-TO-END (heuristic)**

Server Component `buildSmartInsight(payload)` menghitung 3 metrik lewat `payload.count`:
- **Meta description missing** — scan `pages` + 9 service collections (`tours`, `accommodations`, dst) untuk field `meta.description` atau `seo.metaDescription` yang kosong / tak ada. Pattern try-both (schema-agnostic).
- **Images missing alt text** — `media` collection dgn `alt` empty/absent.
- **Drafts pending publish** — `_status = 'draft'` across pages + service collections.

Render list card dengan:
- Icon + accent color (coral/leaf/ocean)
- Label + hint (Indonesia)
- Count (tabular-nums, muted saat 0)
- Link ke collection listing untuk quick fix
- Bonus row "Auto Image Tagging — Soon" muncul kalau `smartInsightImageTag = true` (owner explicit opt-in placeholder)

Zero AI call. Full scan biaya = 1× count per (collection × field pattern) = ~30 count query terpanggil paralel. Cached secara implicit di query planner SQLite.

**b. `<TopPerformingWidget />` — PLACEHOLDER**

Tampilkan empty state dgn 2 mode:
- `analyticsProvider === 'none'` → CTA "Pilih Analytics Provider di Pengaturan Fitur → Dashboard Widgets untuk mengaktifkan". Sub-hint jelasin `own` = phase 4.58.1, `ga` = phase 4.58.2.
- `analyticsProvider === 'own'|'ga'` → note "Provider dipilih tapi tracker belum di-wire (phase 4.58.x)".

Badge "Setup required" / "Own counter" / "Google Analytics" sesuai state.

**Gate render:**
```tsx
{(showSmartInsight || showTopPerforming) && (
  <div className="dnj-widgets">
    {showSmartInsight && <SmartInsightWidget items={smartInsightItems} imageTagEnabled={...} />}
    {showTopPerforming && <TopPerformingWidget provider={...} showViews={...} showInquiries={...} />}
  </div>
)}
```

Widget hanya muncul untuk role `admin` + `super-admin`. Editor tetap dashboard lama (stat row + quick access + activity).

### 4. CSS — grid 2-kolom + card style

`apps/cms/src/admin/custom.css`:

- `.dnj-widgets` — CSS Grid `1fr 1fr` di ≥1024px, `1fr` di mobile.
- `.dnj-insight` + `.dnj-toppf` — panel dgn radius/border/padding konsisten `.dnj-panel`.
- `.dnj-insight__badge` — pill "Heuristic" / "Setup required" / dst di header widget.
- `.dnj-insight__list > .dnj-insight__row` — flex row (icon + body + count), hover highlight, link full-width clickable.
- `.dnj-insight__count` — 20px tabular-nums, warna sesuai accent kalau `count > 0`, muted kalau `= 0`.
- Dark-mode: 2 widget baru di-append ke selector diagonal-sheen (parity dgn `.dnj-frame`, `.dnj-panel`, dst).

### 5. Icons baru (4)

`ICON_PATHS` extend dgn: `sparkles` (Smart Insight header), `trending` (Top Performing header), `alert` (missing meta), `tag` (image tag row).

## Non-impact / backward compat

- Toggle default `true` untuk 3 dari 4 fitur → owner yang existing langsung lihat widget tanpa perlu setting. `smartInsightImageTag = false` default (opt-in) karena placeholder.
- `analyticsProvider = 'none'` default → Top Performing tampil sebagai CTA setup, tak ada API call.
- Fetch site-features lewat `payload.findGlobal` yang error di-catch → dashboard **tak crash** kalau global belum ada / migration belum apply (fallback: semua toggle off, widget tak render).
- Zero perubahan di frontend `apps/web/**` — semua kerja di admin CMS.
- Editor role: dashboard identik seperti sebelumnya (widget tak di-render untuk editor).
- Backward compat penuh dgn Phase 4.3 (role-based dashboard) dan Phase 4.32 (SiteFeatures 4-tabs → sekarang 5-tab).

## Files touched

**Modified:**
- `apps/cms/src/globals/SiteFeatures.ts` — tab baru "Dashboard Widgets" (5 field, 2 collapsible)
- `apps/cms/src/admin/DashboardStats.tsx` — widget fetch + gate + 2 komponen (SmartInsightWidget, TopPerformingWidget) + 4 icon baru
- `apps/cms/src/admin/custom.css` — `.dnj-widgets`, `.dnj-insight*`, `.dnj-toppf*`, responsive breakpoint, dark-mode selector
- `apps/cms/src/migrations/index.ts` — register migration baru
- `packages/shared/src/types/payload-types.ts` — regen (5 field baru di SiteFeature.dashboardWidgets)

**Added:**
- `apps/cms/src/migrations/20260921_101203_phase_4_58_dashboard_widgets.ts` — ALTER TABLE 5 kolom (reversible)

## UAT checklist

1. **Migration terapply**: `pnpm --filter cms schema:status` → migrasi `20260921_101203_phase_4_58_dashboard_widgets` = `Yes`.
2. **CMS admin sebagai Super Admin** → buka Pengaturan Fitur → tab "Dashboard Widgets" muncul (posisi ke-5). Verify 2 collapsible + 5 field.
3. **Dashboard admin (super-admin)**:
   - Overview stat row masih ada.
   - Grid 2-kolom "Smart Insight" (kiri) + "Top Performing" (kanan) muncul di atas Analytics + Quick Access + Recent Activity.
   - Smart Insight: 3 row (Meta / Alt / Drafts) dgn count real, klik → collection listing.
   - Top Performing: card "Setup required" dgn CTA link ke Pengaturan Fitur.
4. **Toggle Top Performing (Views) OFF** → refresh dashboard → widget Top Performing tetap muncul karena Inquiries masih ON.
5. **Toggle KEDUA views + inquiries OFF** → widget Top Performing hilang total.
6. **Toggle Smart Insight SEO OFF** → widget Smart Insight hilang.
7. **Toggle KEDUA (Smart Insight OFF + kedua Top Performing OFF)** → grid `.dnj-widgets` tak render sama sekali (dashboard kembali seperti pra-4.58).
8. **Toggle Auto Image Tagging ON** → row bonus "Auto Image Tagging — Soon" muncul di Smart Insight (opt-in placeholder).
9. **Pilih Analytics Provider = "Own counter"** → Top Performing badge berubah ke "Own counter", copy note update.
10. **Login sebagai Admin (non super)** → dashboard render widget yang sama (widget gate pakai `isAdminUp`, bukan `isSuper`).
11. **Login sebagai Editor** → widget baru **tidak muncul** (dashboard editor identik seperti sebelumnya).
12. **Dark mode toggle** → 2 widget baru dapat sheen diagonal parity dgn card lain.
13. **Responsive**: viewport <1024px → grid jadi 1-kolom (Smart Insight lalu Top Performing stack).

## Follow-up (roadmap)

- **Phase 4.58.1** — Own counter tracker:
  - Buat collection `page_views` (slug, count, updatedAt) + `inquiries` (slug, count, source).
  - API endpoint `POST /api/pixel` di CMS untuk increment (rate-limit + slug validation).
  - Frontend beacon di `BaseLayout.astro` (fetch on mount, WhatsApp click event).
  - Wire `TopPerformingWidget` baca top-5 dari kedua collection.
- **Phase 4.58.2** — GA4 Data API integration:
  - Field baru di SiteSettings: `gaPropertyId` + service account JSON (secret).
  - Server-side call ke `analyticsdata.googleapis.com/v1beta/properties/:id:runReport` untuk top pages.
  - Fallback graceful kalau credentials hilang.
- **Phase 4.58.3** — AI provider untuk Smart Insight:
  - Env `ANTHROPIC_API_KEY` (Claude Haiku untuk cost).
  - Enhance SEO row jadi "AI suggestion" per page — panggil model dgn page title + first paragraph, tampilkan 1-liner improvement.
  - Vision call untuk auto-alt-text saat media upload (hook `afterChange`).
