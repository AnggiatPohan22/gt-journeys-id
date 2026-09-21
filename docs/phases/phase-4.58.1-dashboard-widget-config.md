# Phase 4.58.1 — Dashboard Widget Config (At A Glance / Recent Activity / Quick Access / System Health)

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.58 (Dashboard Widgets scaffolding — SiteFeatures tab + Smart Insight + Top Performing)

## Motivasi (owner report)

> "Tambahkan lagi untuk di Settings — Pengaturan Fitur — Dashboard Widgets, yang ada di halaman dashboard seperti:
> • **At A Glance** saya mau bisa di-atur juga, dan saat di-klik dia masuk ke tujuan (Pages → pages, dst). Ada opsi juga untuk memilih apa saja yang ditampilkan, dengan noted maksimal 6 block.
> • **Recent Activity**.
> • **Quick Access** — super-admin bisa atur apa saja yang tampil di Admin dan Editor dari sini juga.
> • **System Health** — super-admin bisa atur apa saja yang tampil di Admin dan Editor dari sini juga.
> Update report ini di phase 4.58.1 untuk lanjutan task main 4.58 biar lebih mudah audit."

## Ringkasan

Extend `SiteFeatures.dashboardWidgets` (Phase 4.58) dgn **4 sub-section baru** untuk kontrol 4 widget dashboard yg tadinya hardcoded. Super-admin sekarang bisa memilih:
- Stat mana yg tampil di At A Glance (max 6) + apakah clickable.
- Toggle & item limit untuk Recent Activity.
- Action apa yg tampil di Quick Access **per role** (Admin vs Editor).
- Info System Health apa yg tampil **per role** (Admin vs Editor).

Super-admin sendiri tetap dapat set lengkap (tak dibatasi CMS toggle — dia yg mengatur, dia lihat default hardcoded penuh).

## Perubahan

### 1. CMS — SiteFeatures.dashboardWidgets baru 4 collapsible

`apps/cms/src/globals/SiteFeatures.ts`:

**Registry option constants** di top file (single source of truth, konsisten dgn `SERVICE_MODULES`):
- `QUICK_ACCESS_OPTIONS` — 17 action (Pages / Tours / Accommodations / Water Activities / Yachts / Restaurants / Venues / Rentals / Spa / Ferry Tickets / Destinations / Categories / Menu / Media / Users / Site Features / Site Settings)
- `SYSTEM_HEALTH_OPTIONS` — 5 info (Media files / Storage / Payload / Node / Backup)

**Collapsible "At A Glance (Stat Row)":**
- `atAGlanceEnabled` (checkbox, default true) — master toggle
- `atAGlanceClickable` (checkbox, default true) — kalau on: stat box jadi `<a>` ke collection listing
- `atAGlanceStats` (select `hasMany`, default `['pages', 'destinations', 'categories', 'services', 'media', 'users']`) — 11 option (6 core + 5 modul spesifik: tours/accommodations/water-activities/yachts/restaurants). Runtime cap 6.

**Collapsible "Recent Activity":**
- `recentActivityEnabled` (checkbox, default true)
- `recentActivityLimit` (number, default 10, 3–20)

**Collapsible "Quick Access (Admin & Editor)":**
- `quickAccessAdmin` (select `hasMany`) — dari `QUICK_ACCESS_OPTIONS`, kosong → default (semua service + menu)
- `quickAccessEditor` (select `hasMany`) — sama pool, kosong → default (semua service + media)
- Runtime cap 10 (icon-only slots di UI dashboard)

**Collapsible "System Health (Admin & Editor)":**
- `systemHealthAdmin` (select `hasMany`) — dari `SYSTEM_HEALTH_OPTIONS`, kosong → default (semua 5 info)
- `systemHealthEditor` (select `hasMany`) — kosong → default (`['media', 'storage']`)

**Access:** update = super-admin only (inherit SiteFeatures). Read = public (dashboard local API).

### 2. Migration — 4 kolom + 5 junction table

`apps/cms/src/migrations/20260921_103429_phase_4_58_1_dashboard_widget_config.ts`:

**Kolom scalar di `site_features` (4):**
```sql
ALTER TABLE `site_features` ADD `dashboard_widgets_at_a_glance_enabled`     integer DEFAULT true;
ALTER TABLE `site_features` ADD `dashboard_widgets_at_a_glance_clickable`   integer DEFAULT true;
ALTER TABLE `site_features` ADD `dashboard_widgets_recent_activity_enabled` integer DEFAULT true;
ALTER TABLE `site_features` ADD `dashboard_widgets_recent_activity_limit`   numeric DEFAULT 10;
```

**Junction table baru (5)** untuk `hasMany: true` select fields. Struktur konsisten dgn `restaurants_cuisine_type` (pattern Payload SQLite adapter):
- `site_features_dashboard_widgets_at_a_glance_stats`
- `site_features_dashboard_widgets_quick_access_admin`
- `site_features_dashboard_widgets_quick_access_editor`
- `site_features_dashboard_widgets_system_health_admin`
- `site_features_dashboard_widgets_system_health_editor`

Setiap junction:
```sql
CREATE TABLE `<table>` (
  `order`     integer NOT NULL,
  `parent_id` integer NOT NULL,
  `value`     text,
  `id`        integer PRIMARY KEY NOT NULL,
  FOREIGN KEY (`parent_id`) REFERENCES `site_features`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `<table>_order_idx`  ON `<table>` (`order`);
CREATE INDEX `<table>_parent_idx` ON `<table>` (`parent_id`);
```

Nama tabel diperoleh dari `payload generate:db-schema` (temp file, dihapus setelah dipakai) — supaya konsisten 100% dgn ekspektasi ORM.

**Applied:** batch 24, 150ms. Reversible (DROP TABLE + DROP COLUMN).

### 3. DashboardStats — registry-driven refactor

`apps/cms/src/admin/DashboardStats.tsx`:

**Type update:**
- `Stat` dapat `key` + optional `href` (untuk clickable link).
- `Action` dapat `key`.
- Type baru `HealthKey = 'media' | 'storage' | 'payload' | 'node' | 'backup'`.

**Data fetch tambahan** (untuk stat opsi 5 modul spesifik):
```ts
Promise.all([
  ...existing 6,
  safeCount('tours'), safeCount('accommodations'), safeCount('water-activities'),
  safeCount('yachts'), safeCount('restaurants'),
])
```

**Registry** — 3 map keyed by slug:
- `STAT_REGISTRY` (11 entry) — semua opsi At A Glance.
- `ACTION_REGISTRY` (17 entry) — semua opsi Quick Access.
- Health resolved inline dari `healthKeys: HealthKey[]`.

**Widget config loader** (`isAdminUp` gate dihapus dari fetch — semua role load config biar At A Glance/Recent Activity juga bisa di-off untuk editor):
```ts
try {
  const sf = await payload.findGlobal({ slug: 'site-features' })
  const dw = sf.dashboardWidgets
  // resolve 15 field jadi struktur `widgetToggles`
} catch { /* pre-migration → default */ }
```

**Resolver helpers:**
- `stats = selectedStatKeys.filter(k => k !== 'users' || isSuper).map(STAT_REGISTRY[k]).slice(0, 6)` — users hanya untuk super, cap 6.
- `resolveActions('admin' | 'editor')` — pilih dari CMS config atau default, cap 10.
- `healthKeys` — super pakai full default, admin/editor pakai CMS config atau default per role.

**StatRow update** — accept `clickable` prop. Kalau `true` dan stat punya `href`, render `<a class="dnj-stat dnj-stat--link" href>` gantinya `<div class="dnj-stat">`.

**SystemHealth update** — refactor dari `full: boolean` ke `healthKeys: HealthKey[]`. `has(k)` gate tiap row. Title heuristic: "Media Usage" kalau hanya media/storage, else "System Health". `healthKeys.length === 0 → return null` (widget hidden total).

**Recent Activity update** — `recentAll` (unsliced) → sliced di consumer dgn `Math.max(3, Math.min(20, limit))`. Wrapper `{showRecentActivity && <RecentActivity … />}`.

**At A Glance gate** — `{showAtAGlance && <StatRow … />}` di kedua branch (editor + admin/super).

### 4. CSS — clickable stat box

`apps/cms/src/admin/custom.css`:

```css
.dnj-stat--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.dnj-stat--link:hover {
  border-color: var(--dnj-ocean);
}
```

Hover state existing `.dnj-stat:hover` (translateY + shadow) tetap berlaku karena `.dnj-stat--link` juga match `.dnj-stat`. Border color update jadi visual affordance klik.

## Non-impact / backward compat

- Semua field baru **optional**. Config kosong (data pre-migration atau field belum diisi) → dashboard fallback ke pola default hardcoded — **visually identik** dgn pre-4.58.1.
- Master toggle `atAGlanceEnabled`/`recentActivityEnabled` default `true` → widget existing tetap tampil.
- `atAGlanceClickable` default `true` → improvement langsung terlihat (stat box jadi link), tak perlu setting.
- Super-admin selalu lihat set lengkap Quick Access + System Health (CMS toggle hanya berlaku untuk admin & editor).
- Editor role sekarang juga baca site-features (sebelum 4.58.1 skip); kalau global belum ada tetap fallback default.
- Zero perubahan di `apps/web/**` — semua kerja di admin CMS.
- Backward-compat penuh dgn Phase 4.58 (Smart Insight + Top Performing widget) — 4 field lama tetap.

## Files touched

**Modified:**
- `apps/cms/src/globals/SiteFeatures.ts` — 4 collapsible baru di tab Dashboard Widgets, registry option constants, 4 scalar + 5 hasMany select field
- `apps/cms/src/admin/DashboardStats.tsx` — Stat/Action registry, config loader extended, resolver helpers (stats/actions/health), StatRow clickable, SystemHealth healthKeys, recentAll trim
- `apps/cms/src/admin/custom.css` — `.dnj-stat--link` clickable variant
- `apps/cms/src/migrations/index.ts` — register migration baru
- `packages/shared/src/types/payload-types.ts` — regen (4 scalar + 5 array field di `SiteFeature.dashboardWidgets`)

**Added:**
- `apps/cms/src/migrations/20260921_103429_phase_4_58_1_dashboard_widget_config.ts` — ALTER TABLE 4 kolom + 5 CREATE TABLE junction + 10 CREATE INDEX (reversible)

## UAT checklist

1. **Migration**: `pnpm --filter cms schema:status` → `20260921_103429_phase_4_58_1_dashboard_widget_config` = `Yes`.
2. **CMS admin sebagai Super Admin** → Pengaturan Fitur → tab "Dashboard Widgets" → 4 collapsible baru tampil sebelum AI Assistant.
3. **At A Glance**:
   - Semua 6 stat default masih tampil di dashboard.
   - Klik salah satu → navigate ke collection listing (Pages → `/admin/collections/pages`, dst).
   - Ubah `atAGlanceStats` jadi `[pages, tours, media]` → refresh dashboard → hanya 3 stat tampil (Pages/Tours/Media).
   - Off `atAGlanceClickable` → stat box jadi `<div>` biasa (tak ada cursor pointer, border tak highlight).
   - Off `atAGlanceEnabled` → StatRow hilang total.
4. **Recent Activity**:
   - Ubah `recentActivityLimit` = 5 → refresh → hanya 5 item.
   - Ubah = 20 → refresh → up to 20 item (kalau data cukup).
   - Off `recentActivityEnabled` → widget Recent Activity hilang.
5. **Quick Access**:
   - Kosongkan `quickAccessAdmin` → login sbg Admin → dashboard lihat default (semua service + menu).
   - Isi `quickAccessAdmin` = [Pages, Media, Menu] → login sbg Admin → hanya 3 icon.
   - Isi `quickAccessEditor` = [Pages, Tours] → login sbg Editor → hanya 2 icon.
   - Super-admin sendiri tak terpengaruh (lihat 8 icon default).
6. **System Health**:
   - Kosongkan `systemHealthEditor` → login sbg Editor → lihat 2 default (Media + Storage).
   - Isi `systemHealthEditor` = [Payload, Node] → Editor lihat Payload version + Node version (title jadi "System Health", bukan "Media Usage").
   - Isi `systemHealthAdmin` = kosong → Admin lihat 5 default penuh.
   - Isi `systemHealthAdmin` = [Backup] → Admin hanya lihat Last backup row + "Backup settings →" link.
7. **Dark mode** — clickable stat box hover: border ocean tetap terbaca.
8. **Responsive** (<1024px) — At A Glance flex-wrap (sudah ada), 6 kotak stack rapi.
9. **Zero regression** — Smart Insight + Top Performing widget dari Phase 4.58 tetap berfungsi seperti sebelumnya.

## Follow-up

Rencana yang belum berubah dari [phase-4.58](phase-4.58-improve-dashboard-cms.md):
- **Phase 4.58.2** — Own counter tracker (views + inquiries) untuk wire Top Performing widget.
- **Phase 4.58.3** — GA4 Data API integration.
- **Phase 4.58.4** — AI provider untuk Smart Insight (Claude Haiku heuristic → LLM).
