# Phase 4.58.2 — Dashboard Widget Tab UX Polish + Module-Aware Quick Access

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.58.1 (dashboard widget config)

## Motivasi (owner report)

> "Untuk tampilan pada TABS Dashboard Widgets, saya mau di-perbaiki biar lebih user-friendly agar memudahkan dev. Satu lagi: perbaiki service yang di-non-aktifkan jangan di-tampilkan di Quick Access — nanti ambigu karena statusnya non-aktif di Modul Layanan. Dan untuk max-nya sampai penuh satu baris Quick Access saja, coba hitung apakah muat 14 atau 15, dan jangan buat tampilan box Quick Access bertambah."

## Ringkasan

Tiga perbaikan berbeda dalam satu phase:

1. **UX polish** — 6 collapsible di tab Dashboard Widgets di-restructure jadi 3 seksi bernama (Core · Access · Insight), pakai emoji + prefix seksi, layout row 2-per-col untuk toggle pair, deskripsi disederhanakan.
2. **Module-aware filter** — modul layanan yang di-off di tab "Modul Layanan" **otomatis di-hide** dari Quick Access + At A Glance walaupun terpilih di CMS. Mencegah ambigu (icon Tours muncul padahal modul Tours off).
3. **Single-row cap** — Quick Access di-cap **12 icon** (fits `.dnj-col--main` 2fr ≈ 760px inner, 46px icon + 10px gap = 56px × 12 = 672px + padding). CSS `.dnj-quick__grid` diubah dari `flex-wrap: wrap` → `nowrap + overflow: hidden` supaya box tak bertambah tinggi kalau ada spillover.

## Perubahan

### 1. `apps/cms/src/globals/SiteFeatures.ts` — tab UX restructure

**3 seksi bernama** (via comment separator + emoji prefix di label collapsible, tanpa custom UI component — hindari kompleksitas Payload custom Field import map):

```
📊 Core · At A Glance (Stat Row)          ← seksi 1: dasar
🕒 Core · Recent Activity                  ← seksi 1
⚡ Access · Quick Access (per role)        ← seksi 2: per-role picker
🩺 Access · System Health (per role)       ← seksi 2
✨ Insight · AI Smart Insight              ← seksi 3: widget baru 4.58
📈 Insight · Traffic & Top Performing      ← seksi 3
```

**Layout row 2-per-col** untuk toggle pair — pakai `type: 'row'` + `admin.width: '50%'`:
- At A Glance: `atAGlanceEnabled` + `atAGlanceClickable`
- Recent Activity: `recentActivityEnabled` + `recentActivityLimit`
- Smart Insight: `smartInsightSeo` + `smartInsightImageTag`
- Top Performing: `topPerformingViews` + `topPerformingInquiries`

**initCollapsed strategi**:
- Core panels (At A Glance + Recent) → `false` (paling sering diakses)
- Access Control + Insight → `true` (advanced, jarang diubah)

**Description polish** — Indonesia lebih ringkas, action-oriented, mention "modul off otomatis di-hide" di Quick Access collapsible.

**Analytics provider select** dikasih emoji prefix (`⏸️ / 🗄️ / 📊`) supaya user langsung tahu state.

**Group-level description** diupdate mention 3 seksi + note filter modul.

### 2. `apps/cms/src/admin/DashboardStats.tsx` — module-aware filter

Widget config loader extended: fetch `siteModules` (dari `sf.modules`) selain `dashboardWidgets` — reuse call `payload.findGlobal`, no extra query.

**Helper baru** — `SLUG_TO_MODULE` map + `isModuleActive(slug)`:

```ts
const SLUG_TO_MODULE: Record<string, string> = {
  tours: 'tours',
  accommodations: 'accommodations',
  'water-activities': 'waterActivities',
  yachts: 'yacht',
  restaurants: 'restaurants',
  venues: 'weddings',
  rentals: 'rentals',
  spa: 'spa',
  'ferry-tickets': 'ferryTickets',
}
const isModuleActive = (slug: string): boolean => {
  const modKey = SLUG_TO_MODULE[slug]
  if (!modKey) return true // non-service slug (pages/media/menu/dst) — selalu aktif
  return siteModules[modKey] !== false
}
```

Mapping identik dgn `SERVICE_TYPE_TO_MODULE` di `apps/web/src/lib/features.ts` — perhatikan aliasi (`venues` slug ↔ `weddings` module, `yachts` slug ↔ `yacht` module).

**Terapkan di 2 tempat:**
- **At A Glance stats**: `.filter((k) => isModuleActive(k))` sebelum map ke registry → stat modul spesifik (Tours/Accommodations/Water Activities/Yachts/Restaurants) di-skip kalau module off.
- **Quick Access actions** (per role): `.filter(isModuleActive)` sebelum map registry → 9 service slug + 8 non-service slug; hanya service yang di-cek.

Non-service slug (pages/media/menu/destinations/categories/users/site-features/site-settings) selalu tampil.

### 3. `apps/cms/src/admin/DashboardStats.tsx` — cap 12 Quick Access

`QUICK_ACCESS_CAP = 12` (dari 10 sebelumnya). `.slice(0, QUICK_ACCESS_CAP)` di `resolveActions`.

**Perhitungan muat 1 baris:**
- `.dnj-col--main` (2fr dari 3fr grid) di layout ~1200px content = ~760px inner.
- `.dnj-quick__grid` padding 18-20px, gap 10px, icon 46×46px.
- Available: `760 - 40 (padding) = 720px`
- Per icon slot: `46 + 10 (gap) = 56px`
- Max: `720 / 56 = 12.85` → cap 12 aman (13 mungkin overflow di padding).

Editor & Super render Quick Access di `prominent` mode (full width) — muat lebih banyak, tapi cap 12 dijaga konsisten (super pakai `superActions` hardcoded 8, tak terpengaruh).

### 4. `apps/cms/src/admin/custom.css` — single-row enforcement

```css
/* Phase 4.58.2 — cap Quick Access to single row. */
.dnj-quick__grid {
  display: flex;
  flex-wrap: nowrap;      /* was: wrap */
  gap: 10px;
  min-width: 0;
  overflow: hidden;       /* clip kalau slot > cap runtime (safety net) */
}
```

Bersama runtime cap 12, box Quick Access **tak akan bertambah tinggi** (`.dnj-quick` padding fixed, icon 46px height konsisten).

## Non-impact / backward compat

- Field CMS **tidak ada penambahan** — hanya restructure layout + label + description. Zero migration.
- Super-admin Quick Access tak difilter modul (dia dapat `superActions` hardcoded 8 fixed: New Page, New Dest, New Cat, Menu, Media, Users, Site Features, Site Settings — semua non-service).
- Kalau semua service module aktif (default) → dashboard tampil identik pre-4.58.2 (kecuali cap 12 vs 10, tapi default admin/editor list hanya 10 items sehingga tak terlihat).
- Fallback tetap: pilihan CMS kosong → default hardcoded per role.
- Zero perubahan di `apps/web/**`.

## Files touched

**Modified:**
- `apps/cms/src/globals/SiteFeatures.ts` — restructure 6 collapsible dgn 3-seksi prefix + emoji + row 2-col + description polish
- `apps/cms/src/admin/DashboardStats.tsx` — `SLUG_TO_MODULE` + `isModuleActive` helper, filter di stats + resolveActions, cap 12
- `apps/cms/src/admin/custom.css` — `.dnj-quick__grid` nowrap + overflow hidden
- `apps/cms/src/app/(payload)/admin/importMap.js` — regen (via `payload generate:importmap`)
- `packages/shared/src/types/payload-types.ts` — regen (perubahan label description, no schema diff)

## UAT checklist

1. **CMS admin sebagai Super-Admin** → Pengaturan Fitur → tab "Dashboard Widgets":
   - 6 collapsible tampil dgn prefix seksi (📊 Core · / 🕒 Core · / ⚡ Access · / 🩺 Access · / ✨ Insight · / 📈 Insight ·).
   - "Core" collapsible open by default; "Access" + "Insight" collapsed.
   - Toggle pair 2-per-col (At A Glance / Recent Activity / Smart Insight / Top Performing).
   - Analytics Provider select dgn emoji per opsi.
2. **Modul Layanan filter (Quick Access)**:
   - Off modul "Tours" di tab Modul Layanan → save.
   - Refresh dashboard sebagai Admin → Quick Access **tidak ada icon Tours** walaupun terpilih (atau di default).
   - Non-service icon (Menu, Media, Users) tetap tampil.
3. **Modul Layanan filter (At A Glance)**:
   - Isi `atAGlanceStats` = [Pages, Tours, Yachts] → off modul "Yachts" → refresh → hanya Pages + Tours tampil (Yachts di-skip).
4. **Single-row cap**:
   - Isi `quickAccessAdmin` = 15 item → login Admin → hanya 12 icon tampil (sisanya di-truncate runtime).
   - Resize window sempit → icon flex `nowrap`, tak wrap ke baris 2. Kalau viewport terlalu sempit, sisanya clipped (bukan grow).
5. **Kasus edge**:
   - Semua modul aktif + config kosong → dashboard identik pre-4.58.2.
   - Semua modul off (misal) → Quick Access untuk Admin hanya sisa non-service (kalau default) = Menu saja; untuk Editor = Media saja.
6. **Super-admin tak terpengaruh** — Quick Access tetap 8 icon hardcoded (superActions).

## Follow-up (unchanged from 4.58)

- **Phase 4.58.3** — Own counter tracker (views + inquiries) → wire Top Performing widget.
- **Phase 4.58.4** — GA4 Data API integration.
- **Phase 4.58.5** — AI provider Claude Haiku untuk Smart Insight heuristic → LLM.
