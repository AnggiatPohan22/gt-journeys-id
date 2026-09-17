# Phase 4.53 — Service Listing Mobile Polish + Per-Breakpoint Pagination

**Status:** ✅ Code complete · migration applied · dev-verified · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** CMS block schema (2 new fields) + 2 frontend Astro templates. Migration `20260917_145526.ts` applied batch 19.

## Motivasi

Owner UAT `/tour` di mobile menemukan 2 masalah + 1 request:

1. **Destination filter pills** (baris pertama di area filter) memakan ruang di layar sempit — di mobile hampir tak terpakai karena user cenderung pakai search bar. Owner minta **disembunyikan di mobile saja** (desktop & tablet tetap).
2. **Grid horizontal swipe** (`sl-swipe` / `slh-swipe`) di mobile — 1 card per swipe — tidak sesuai preferensi owner. Owner mau grid vertikal biasa: **3 cards ke bawah, lalu tombol Load More** untuk reveal batch berikutnya.
3. **`initialVisibleCount`** hanya 1 nilai global — tidak bisa membedakan berapa items tampil di mobile vs tablet vs desktop. Owner minta bisa set count per-breakpoint via CMS tanpa hardcode.

## Perubahan

### 1. CMS — 2 field baru [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts)

Tab **Card Style** → row kedua (di bawah row `loadMoreText` + `initialVisibleCount`):

| Field | Type | Default | Label |
|---|---|---|---|
| `initialVisibleCount` (existing) | number | 6 | Initial Visible Count (**Desktop**) — description clarify "≥1024px" |
| `initialVisibleCountTablet` | number | 4 | Initial Visible Count (**Tablet**) — 640–1023px |
| `initialVisibleCountMobile` | number | 3 | Initial Visible Count (**Mobile**) — <640px |

Semua 3 field di-gate `showLoadMore === true` (nyala hanya kalau pagination aktif). Tablet & Mobile fallback ke Desktop kalau kosong.

### 2. Migration [`apps/cms/src/migrations/20260917_145526.ts`](../../apps/cms/src/migrations/20260917_145526.ts)

Auto-generated via `pnpm --filter cms schema:new --name phase_4_53_per_bp_pagination`. UP: `ALTER TABLE ADD` 2 nullable columns per 8 tabel service_listing block (`pages_blocks_service_listing`, `posts_…`, `tours_…`, `yachts_…`, `restaurants_…`, `venues_…`, `rentals_…`, `spa_…`) — 16 statement total. DOWN reversible via `DROP COLUMN`. Applied batch 19 (`pnpm --filter cms schema:migrate`, 332ms).

### 3. Frontend [`ServiceListingEditorial.astro`](../../apps/web/src/components/blocks/ServiceListingEditorial.astro) + [`ServiceListingHeroImmersive.astro`](../../apps/web/src/components/blocks/ServiceListingHeroImmersive.astro)

Perubahan paralel di kedua template (Editorial default `/tour`, Hero Immersive alternatif):

- **Read 3 counts** dari block:
  ```ts
  const perDesktop = typeof b.initialVisibleCount === 'number' ? b.initialVisibleCount : 6
  const perTablet  = typeof b.initialVisibleCountTablet === 'number' ? b.initialVisibleCountTablet : perDesktop
  const perMobile  = typeof b.initialVisibleCountMobile === 'number' ? b.initialVisibleCountMobile : perDesktop
  ```

- **Grid data attrs** — ganti `data-per-page` → `data-per-mobile` + `data-per-tablet` + `data-per-desktop`.

- **SSR baseline** pakai `perDesktop` untuk `hiddenByPagination` (no-flash pada desktop; JS re-reconcile untuk mobile/tablet on mount).

- **Destination pills** di area filter dikasih class `hidden md:flex` (Editorial) / `hidden md:flex` (Hero Immersive floating card). Mobile → filter tab hilang; tablet & desktop tetap.

- **Border-t search bar** di Hero Immersive di-gate `md:` supaya tak muncul garis kosong ketika dest filter hilang di mobile.

- **Remove `sl-swipe`/`slh-swipe` CSS + class** — grid vertikal biasa `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` di semua breakpoint. Pagination Load More jadi mekanisme pagination utama.

- **JS `readPerPage(grid)`** — helper baru: `window.innerWidth < 640` → mobile, `< 1024` → tablet, else desktop. Return count sesuai.

- **`applyView` inisial** dipanggil setelah setup listener supaya reconcile SSR (desktop count) dengan viewport aktual.

- **Resize handler baru** — debounce 150ms + `orientationchange`. Kalau `readPerPage()` return nilai beda dari sebelumnya, update `perPage` variable, reset `currentPage=1` + `loadMoreRevealed=0`, panggil `applyView()`. Konsekuensi: user rotate HP atau resize window ke breakpoint lain → jumlah items tampil menyesuaikan.

## Non-impact

- **Desktop UX tak berubah** — count 6 (default) atau nilai yang sudah di-set owner tetap dipakai. Destination filter tetap tampil. Grid layout `lg:grid-cols-3` tak disentuh.
- **Tablet UX minim ubah** — destination filter tetap tampil. Cards jumlahnya bisa berbeda (owner-controlled via `initialVisibleCountTablet`, default 4).
- Zero schema break — kedua kolom nullable dengan default; existing records baca `null` → fallback ke desktop count di frontend.
- Zero perubahan `enableDestinationFilter` semantic — kalau owner off dari CMS, dest filter tetap tak render di semua breakpoint.
- Backward-compat script pagination-pages (numbered pagination) — masih pakai `perDesktop` untuk `totalPg` (konservatif; user jarang pakai mode ini di mobile).

## Files touched

- **Modified:**
  - `apps/cms/src/blocks/index.ts` (Card Style tab)
  - `apps/web/src/components/blocks/ServiceListingEditorial.astro`
  - `apps/web/src/components/blocks/ServiceListingHeroImmersive.astro`
- **Created:**
  - `apps/cms/src/migrations/20260917_145526.ts` (16 ALTER TABLE, reversible)

## Verifikasi (dev-browser, `/tour`)

- **Mobile viewport (375px):** `data-per-mobile="3"`, destination tabs `display: none`, 3 cards visible, Load More button ada. Klik Load More → 4 visible (total 4, semua tampil), Load More auto-hide.
- **Tablet viewport (768px):** `data-per-tablet="4"`, destination tabs kembali tampil (`display: flex`), 4 cards visible, Load More hidden (semua tampil).
- **Desktop viewport (≥1024px):** `data-per-desktop="3"` (current CMS record), destination tabs tampil, grid `lg:grid-cols-3`.
- Resize mobile→tablet→desktop di runtime: `applyView` dipanggil ulang, count sync.

## Addendum — Date range picker auto-open (Phase 4.54 inline)

Owner minta field calendar pada search bar (`Check-in — Check-out`) auto memunculkan calendar saat di-klik, biar visitor tak perlu manual ketik tanggal.

**Perubahan:**

- Ganti `<input type="text" placeholder="Check-in — Check-out">` → wrapper `<label data-role="date-range">` berisi 2 `<input type="date" data-role="checkin/checkout">` side-by-side dengan pemisah "—". Styling wrapper mirror bg-sand focus:bg-white supaya visual sama dengan text input lain.
- CSS `.dnj-date-input` — reset native appearance, hide default border, calendar picker indicator opacity 0.6 → 1 saat hover.
- JS `initDatePickers()` (Editorial + Hero Immersive, guard `data-dp-bound` supaya idempotent):
  - Klik wrapper (di luar input) → call `input.showPicker()` pada checkin (fallback checkout).
  - Focus (keyboard tab) → juga `showPicker()`.
  - `checkin.change` → set `checkout.min = checkin.value` (cegah pilih check-out sebelum check-in) + auto-adjust checkout kalau invalid.
- `showPicker()` supported: Chrome 99+, Edge 99+, Safari 16+, Firefox 101+. Fallback: klik di area calendar indicator native tetap trigger picker default browser.

**Files touched (addendum):**
- `apps/web/src/components/blocks/ServiceListingEditorial.astro` (input markup, CSS block, JS initDatePickers)
- `apps/web/src/components/blocks/ServiceListingHeroImmersive.astro` (idem)

**Verified:** `wrap.dataset.dpBound === "1"`, 2 date inputs bound, `showPicker` API available (Chromium). Visual: field tampil `dd/mm/yyyy — dd/mm/yyyy` + calendar icon di kanan tiap input.

## Owner UAT

1. Buka [`/admin/collections/pages/6`](http://localhost:3030/admin/collections/pages/6) → block Service Listing → tab **Card Style** → nyalakan `showLoadMore` → set 3 count sesuai kebutuhan (default Mobile=3, Tablet=4, Desktop=6). Save.
2. Buka `/tour` di HP asli atau DevTools mobile viewport (375px):
   - Filter destination hilang, search bar tetap tampil.
   - 3 cards tampil vertikal 1 kolom.
   - Klik Load More → 3 cards tambahan.
3. Resize / rotate ke tablet (~768px): destination filter kembali, grid jadi 2 kolom, jumlah tampil = tablet count.
4. Resize ke desktop (≥1024px): grid 3 kolom, jumlah tampil = desktop count.
5. Verifikasi juga di halaman lain yang pakai Service Listing block (villa, water-activity, dst) — pola sama.
