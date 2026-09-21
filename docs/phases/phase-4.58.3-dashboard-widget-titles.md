# Phase 4.58.3 — Dashboard Widget Titles Custom (Super-Admin Editable)

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.58.2 (dashboard widget tab UX polish)

## Motivasi (owner report)

> "Terakhir sebelum commit, saya mau super-admin bisa merubah title seperti 'At A Glance' itu bisa di-rubah menjadi apa menyesuaikan nanti. Karena saat ini itu tidak bisa di-rubah di CMS. Begitu juga untuk title yang lain di dashboard."

## Ringkasan

Super-admin sekarang bisa **override** semua label/judul di admin dashboard via CMS (Pengaturan Fitur → Dashboard Widgets). 9 field text baru — semua **opsional**: kosong = runtime fallback ke default hardcoded (English/heuristic), backward-compat penuh.

Label yg bisa di-override:
- Dashboard header title + subtitle (dgn `{name}` placeholder)
- At A Glance panel title
- Recent Activity panel title
- Quick Access panel title
- System Health panel title (kosong = auto heuristic)
- Smart Insight widget title
- Top Performing widget title
- Analytics Card (Traffic & Performance setup) title

## Perubahan

### 1. CMS — 9 field text baru di `SiteFeatures.dashboardWidgets`

`apps/cms/src/globals/SiteFeatures.ts`:

**Seksi 0 baru — "🎯 Header · Judul & Subjudul Dashboard"** (collapsible, initCollapsed true):
- `headerTitle` (text, placeholder `Overview`) — h2 di paling atas dashboard
- `headerSubtitle` (textarea, placeholder default English) — mendukung `{name}` placeholder yg di-replace runtime dgn nama user

**Per-widget title** dipasang di collapsible existing masing-masing:
- 📊 At A Glance: `atAGlanceTitle` (placeholder `At a glance`) — di atas row toggle
- 🕒 Recent Activity: `recentActivityTitle` (placeholder `Recent activity`) — di atas row toggle
- ⚡ Quick Access: `quickAccessTitle` (placeholder `Quick access`) — di atas per-role picker
- 🩺 System Health: `systemHealthTitle` (placeholder `System Health / Media Usage (auto)`) — di atas per-role picker. Kosong → auto heuristic (jika hanya media+storage → "Media Usage", else "System Health").
- ✨ Smart Insight: `smartInsightTitle` (placeholder `Smart Insight`) — di atas row toggle
- 📈 Traffic & Top Performing: `analyticsCardTitle` + `topPerformingTitle` (row 50/50, placeholder `Traffic & Performance` + `Top Performing`)

Semua field text `type: 'text'` (kecuali `headerSubtitle` = `textarea`), nullable, no defaultValue → NULL kalau tak diisi → consumer fallback runtime.

### 2. Migration — 9 kolom text opsional

`apps/cms/src/migrations/20260921_110920_phase_4_58_3_dashboard_titles.ts`:

```sql
ALTER TABLE `site_features` ADD `dashboard_widgets_header_title`           text;
ALTER TABLE `site_features` ADD `dashboard_widgets_header_subtitle`        text;
ALTER TABLE `site_features` ADD `dashboard_widgets_at_a_glance_title`      text;
ALTER TABLE `site_features` ADD `dashboard_widgets_recent_activity_title`  text;
ALTER TABLE `site_features` ADD `dashboard_widgets_quick_access_title`     text;
ALTER TABLE `site_features` ADD `dashboard_widgets_system_health_title`    text;
ALTER TABLE `site_features` ADD `dashboard_widgets_smart_insight_title`    text;
ALTER TABLE `site_features` ADD `dashboard_widgets_top_performing_title`   text;
ALTER TABLE `site_features` ADD `dashboard_widgets_analytics_card_title`   text;
```

Pure ADD COLUMN, semua nullable (no default → NULL fallback). Reversible via DROP COLUMN 9×.

**Applied:** batch 25, 432ms.

### 3. DashboardStats — resolver + prop plumbing

`apps/cms/src/admin/DashboardStats.tsx`:

**Widget config loader** extended: 9 title fields di-cast ke `String(dw.<field> ?? '')` (kosong string kalau NULL).

**Title resolver** dgn fallback helper:
```ts
const t = (custom: string, fallback: string) => (custom.trim() || fallback)
const titles = {
  header:         t(widgetToggles.headerTitle,         'Overview'),
  atAGlance:      t(widgetToggles.atAGlanceTitle,      'At a glance'),
  recentActivity: t(widgetToggles.recentActivityTitle, 'Recent activity'),
  quickAccess:    t(widgetToggles.quickAccessTitle,    'Quick access'),
  smartInsight:   t(widgetToggles.smartInsightTitle,   'Smart Insight'),
  topPerforming:  t(widgetToggles.topPerformingTitle,  'Top Performing'),
  analyticsCard:  t(widgetToggles.analyticsCardTitle,  'Traffic & Performance'),
}
```

**Subtitle special-case** — support `{name}` placeholder:
```ts
const subtitleTemplate = widgetToggles.headerSubtitle.trim()
  || 'Welcome back, {name} — here’s what’s happening across your site.'
const subtitle = subtitleTemplate.replace(/\{name\}/g, String(displayName))
```

**System Health special-case** — pass `titleOverride` (raw string, empty allowed). Component decides: `titleOverride.trim() || (onlyMedia ? 'Media Usage' : 'System Health')` — supaya heuristic tetap jalan kalau super-admin biarkan kosong.

**Prop plumbing** — 6 komponen sekarang terima `title` prop:
- `StatRow({ stats, clickable, title })`
- `QuickAccess({ actions, prominent, title })`
- `AnalyticsCard({ title })`
- `SystemHealth({ …, titleOverride })` (empty → auto)
- `SmartInsightWidget({ items, imageTagEnabled, title })`
- `TopPerformingWidget({ provider, showViews, showInquiries, title })`
- `RecentActivity({ recents, title })` — sudah punya `title` prop dari sebelumnya, sekarang di-pass `titles.recentActivity`.

Dashboard render pakai `{titles.header}` untuk `<h2>` + `{subtitle}` untuk `<p>` di header.

**Cleanup**: hapus `.slice(0, 10)` di QuickAccess component karena cap 12 sudah di `resolveActions` level (4.58.2). Konsistensi 1 tempat cap.

## Non-impact / backward compat

- Field kosong (NULL / '') → semua widget tampil dgn default English identik pre-4.58.3.
- `{name}` placeholder di subtitle template — kalau user tak pakai, template biasa berjalan normal.
- System Health heuristic (Media Usage vs System Health) tetap aktif kalau `systemHealthTitle` kosong.
- Zero perubahan `apps/web/**`.
- Backward-compat penuh dgn 4.58 + 4.58.1 + 4.58.2.

## Files touched

**Modified:**
- `apps/cms/src/globals/SiteFeatures.ts` — seksi 0 baru "Header" + 7 title field per-widget
- `apps/cms/src/admin/DashboardStats.tsx` — extended widgetToggles state (+9), titles resolver, subtitle {name} replace, prop plumbing di 6 komponen, cleanup QuickAccess slice
- `apps/cms/src/migrations/index.ts` — register migration baru
- `packages/shared/src/types/payload-types.ts` — regen (9 field baru `string | null` di `SiteFeature.dashboardWidgets`)

**Added:**
- `apps/cms/src/migrations/20260921_110920_phase_4_58_3_dashboard_titles.ts` — 9 ALTER TABLE ADD COLUMN text (reversible)

## UAT checklist

1. **Migration**: `pnpm --filter cms schema:status` → `20260921_110920_phase_4_58_3_dashboard_titles` = `Yes`.
2. **CMS admin sebagai Super-Admin** → Pengaturan Fitur → tab "Dashboard Widgets":
   - Collapsible baru "🎯 Header · Judul & Subjudul Dashboard" di paling atas.
   - Setiap collapsible widget existing punya field "Judul panel" di atas.
   - Placeholder text terlihat (mis. `At a glance` gray) — konfirmasi default hardcoded.
3. **Test override**:
   - Isi `headerTitle` = "Ringkasan Situs" → save → dashboard `<h2>` berubah.
   - Isi `headerSubtitle` = "Halo {name}, selamat pagi!" → dashboard subtitle: "Halo <username>, selamat pagi!".
   - Isi `atAGlanceTitle` = "Angka-angka" → panel stat row title berubah.
   - Isi `quickAccessTitle` = "Akses Cepat" → panel Quick Access title berubah.
   - Isi `smartInsightTitle` = "AI Insight" → widget title berubah.
   - Isi `topPerformingTitle` = "Top Berkinerja" → widget title berubah.
   - Isi `analyticsCardTitle` = "Traffic Situs" → card GA setup berubah.
   - Isi `systemHealthTitle` = "Kesehatan Sistem" → panel bawah berubah (override heuristic).
   - Isi `recentActivityTitle` = "Aktivitas Terbaru" → panel activity berubah.
4. **Test kosongkan → fallback**:
   - Hapus `systemHealthTitle` isi → dashboard kembali ke "Media Usage" (kalau hanya media+storage) atau "System Health".
   - Hapus semua title override → dashboard identik pre-4.58.3.
5. **{name} placeholder edge**:
   - `headerSubtitle` = "Hello world" (tanpa `{name}`) → subtitle tampil apa adanya.
   - `headerSubtitle` = "{name} {name} test" → duplikasi replace berhasil.
6. **Editor role**: dashboard header title + subtitle + At A Glance + Recent Activity + Quick Access + System Health titles semua kena override sama (config global, tak per-role).
