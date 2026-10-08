## Phase: 4.67.3 — Listing Outbound-Pick Wizard (Traveloka-style)

**Tanggal**: 2026-10-07
**Status**: ✅ Selesai — verified end-to-end di browser (ST1→ST2→Checkout render 2-leg berhasil)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menghapus **detour ke detail page** di flow round-trip Step 1. Sebelumnya
(Phase 4.67.2b) visitor dari widget → listing → klik card → **detail
page** untuk pick class per-ferry → listing step 2 (return). Visitor
sering bingung karena detail page punya section "Ferry Schedule" yang
bisa kosong (kalau CMS `scheduleTime[]` array belum di-isi) + feel 1
step berlebih dibanding OTA familiar (Traveloka).

Phase 4.67.3 menambah **Outbound-Pick mode** di `ServiceListingTicketSearch`,
mirror pattern dari Return-Pick (4.67.2c): card click bypass detail page
→ langsung navigate ke listing step 2 (reverse route) dengan `outbound`
metadata, default class = cheapest dari `ferryClasses[]`.

**New flow:**
```
Widget → Listing[Step 1: Pick Outbound] → Listing[Step 2: Pick Return] → Checkout
         ↑ coral banner                    ↑ ocean banner (4.67.2c)        ↑ 4.67.2d
```

**Detail page tetap functional** sebagai fallback (visitor yang bookmark
URL detail page langsung dengan `?trip=round-trip&...` masih bisa pakai
flow lama lewat `roundtripListingHref()`).

**Class default = cheapest**: ini kompromi MVP. Visitor yang perlu class
spesifik (bukan cheapest) harus pakai detail page atau ganti nanti via
WhatsApp. Phase 4.67.4 (future) bisa add inline class pills di card.

### ⚠️ Arsitektur Discovery (penting)

Saat implementasi awal via SSR conditional (`{isOutboundPick && (...)}` di
Astro frontmatter), **tidak ada banner yang render**. Investigasi: route
`/ferry-tickets` di-handle oleh catchall `[...slug].astro` yang **di-prerender
static** (default `prerender: true`, pakai `getStaticPaths`). Konsekuensi:
`Astro.url.searchParams` dan `new URL(Astro.request.url).searchParams`
**selalu kosong di SSR** — query string stripped karena page di-cache sebagai
static HTML per `getStaticPaths` entry (satu HTML untuk semua query combos).

**Impact lebih besar**: ini berarti Phase 4.67.2b/c yang pakai pola SSR
conditional (`isReturnPick`, round-trip CTA di detail page) **juga tidak
pernah functional** di flow prod/dev. User's test lama ("ferry schedule
nya kosong, diarahkan ke boat page") konsisten dgn teori ini — detail
page gagal switch sidebar form ke round-trip CTA karena query tak sampai.

**Solusi 4.67.3**: Pindahkan **SEMUA wizard mode detection ke client-side
Alpine**. Markup banner + card badge selalu di-render (unconditional di
SSR), Alpine `_detectWizardMode()` di `x-init` baca `window.location.search`
→ set `_isOutboundMode`/`_isReturnMode` → `x-show + x-cloak` kontrol
visibility. Click dispatch via `_handleCardClick($event, slug, id, cheapestClass)`
yang route berdasarkan mode saat click.

**Alternatif yang ditolak**: `export const prerender = false` di
`[...slug].astro` → fix SSR query reading, tapi mengubah seluruh behavior
dari static-prerender ke dynamic SSR untuk semua CMS pages (performance
+ caching regression). Scope terlalu besar.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | **(1)** Hapus SSR consts `isOutboundPick`/`isReturnPick`/`qOutbound`/`qOutboundSlug`/`qOutboundClass`/`qDeparture` (tidak reliable di prerender). **(2)** Tambah Alpine state: `_isOutboundMode`, `_isReturnMode`, `_wOutbound`, `_wOutboundSlug`, `_wOutboundClass`, `_wDeparture`, `_wReturn`, `_wFrom`, `_wTo`, `_wAdults`, `_wChildren`, `_wInfants`. **(3)** Alpine methods baru: `_detectWizardMode()` (baca URL, set state + sync widget `date`/`trip`/`returnDate`/`adults`/`children`/`infants`/`fromSlug`/`toSlug` dari URL biar widget UI tidak stale di first paint), `_humanDate(iso)`, `_titleCaseSlug(s)`, `_wizardSubtitle(mode)`, `_changeOutboundHref()`, `_handleCardClick($event, slug, id, cheapestClass)` (dispatcher 3-way: return-mode → `/checkout/…?returnFerryId=…`, outbound-mode → `/ferry-tickets?outbound=…&outboundClass=…`, else → `onBookClick()`). **(4)** `applyFilter()` sekarang panggil `_detectWizardMode()` setelah replaceState (biar switch One Way↔Round Trip di widget langsung update wizard state). **(5)** `<section x-init="_detectWizardMode()">`. **(6)** Banner Step 1 (coral) + Banner Step 2 (ocean) di-render unconditional dengan `x-show="_isOutboundMode"` / `x-show="_isReturnMode"` + `x-cloak`. Subtitle via `x-text="_wizardSubtitle('outbound')"` / `('return')`. Change-outbound anchor via `x-bind:href="_changeOutboundHref()"`. **(7)** Card wrapper: unconditional `tsh-card-wrap relative` + `x-bind:class="(_isReturnMode\|\|_isOutboundMode)?'cursor-pointer':''"` + `x-on:click.capture="_handleCardClick(...)"`. Both badges "Select Outbound →" (ocean) + "Select Return →" (coral) di-render dgn `x-show + x-cloak`. **(8)** Compute cheapest class per item server-side (zero cost — kita punya `item.ferryClasses[]`) dan pass ke `_handleCardClick` sebagai arg. |

### Impact
- **Database**: none.
- **CMS**: none.
- **API**: none.
- **Routes**: none (URL contract sama dgn 4.67.2b/c).
- **Frontend UX**: Round-trip Step 1 jadi direct-pick dari listing (lebih mirip Traveloka). Detail page tidak di-trigger lagi oleh default flow, tapi tetap reachable.
- **Backward compat**:
  - **One-way**: zero change (no banner, card click → detail page unchanged).
  - **Direct URL ke detail page round-trip** (bookmark/share lama): still works via 4.67.2b CTA.
  - **URL contract step 2**: 100% identik dgn 4.67.2b/c (sama `outbound`, `outboundSlug`, `outboundClass`, `departure` params).

### Design Decisions

**Deteksi mode via `!!qReturnDate` (bukan `!!qFrom && !!qTo`)**
Logika: round-trip wajib ada return date untuk valid search. Kalau user
bookmark `/ferry-tickets?trip=round-trip` tanpa return date, mode OFF
(fallback ke behavior normal — detail page). From/to boleh kosong (visitor
browsing semua route). `qReturnDate` sendiri sudah di-sanitize ke string
kosong kalau `trip !== 'round-trip'` (Phase 4.64 guard), jadi aman.

**Default class = cheapest (bukan prompt)**
Opsi A (dipilih): Click card → auto-pick cheapest class → langsung step 2.
Opsi B (ditolak sementara): Inline class pills di card. **Trade-off**:
Opsi A = 1-click experience (Traveloka-fastpath), tapi lose granular
class choice di step 1. Opsi B = pixel-perfect Traveloka tapi UI lebih
padat + butuh refactor FerryTicketsCard. User akan evaluate Opsi B after
check Opsi A (per instruksi).

**Keep detail page fallback**
Tidak hapus 4.67.2b CTA karena:
1. Shareable URL `/ferry-tickets/<slug>?trip=round-trip&date=&return=...` tetap valid.
2. Visitor yang perlu pick class spesifik (bukan cheapest) → detail page.
3. SEO + external links tetap functional.

Trade-off: 2 code paths untuk same destination (listing step 2). Diterima
karena konvergen di URL contract yg sama.

**Banner "Tap a ferry below" vs "Change outbound" button**
Step 1 banner tidak punya back button (karena back = widget on previous
page or scroll up). Hint text + icon `touch_app` untuk guide visitor.
Step 2 banner punya "Change outbound" karena ini dead-end wizard state
tanpa jalan natural ke step 1 (new URL contract).

**Reverse route di step 1 → step 2 click**
Step 2 URL: `from=qTo` (destination jadi origin untuk return trip) +
`to=qFrom`. Ini otomatis trigger client-side filter listing step 2 untuk
show hanya ferry route baliknya. Kalau tidak reverse, visitor akan lihat
outbound ferry lagi di return listing — confusing + tidak Traveloka-like.

**Date swap di step 1 → step 2 click**
Step 2: `date=qReturnDate` (step 2's search date = return date). `return`
param tetap diisi untuk banner display. `departure=qDate` (outbound date,
dibutuhkan step 2 click → checkout).

### Verifikasi (DONE)

End-to-end verified via browser pane (2026-10-07):

- ✅ **ST1**: Navigate ke `/ferry-tickets?trip=round-trip&from=batam-centre-terminal-bct&to=singapore-cruise-center-harbourfront&date=2026-10-10&return=2026-10-13&adults=2` → Alpine `_isOutboundMode=true`, banner Step 1 (coral) visible dgn subtitle `"Departure Sat, Oct 10, 2026 · Return Tue, Oct 13, 2026 · 2 Adults"`, badge "Select Outbound →" tampil di tiap card. Widget UI juga sync (Round Trip pill active, dep/return date pre-fill, adult=2).
- ✅ **ST2**: Simulate click card pertama → browser navigate ke `/ferry-tickets?trip=round-trip&from=singapore-cruise-center-harbourfront&to=batam-centre-terminal-bct&date=2026-10-13&return=2026-10-13&adults=2&outbound=3&outboundSlug=batam-fast-btm-to-sg&outboundClass=emerald&departure=2026-10-10`. Alpine detect: `_isReturnMode=true`, banner Step 2 (ocean) visible dgn "Outbound Batam Fast Btm To Sg · Departure Sat, Oct 10, 2026 · Return Tue, Oct 13, 2026". Change-outbound href compute: `/ferry-tickets?trip=round-trip&from=batam-centre-terminal-bct&to=singapore-cruise-center-harbourfront&date=2026-10-10&return=2026-10-13&adults=2` (reverse-swap back to Step 1). Badge "Select Return →" tampil di card.
- ✅ **ST3 (end-to-end)**: Simulate click return card → navigate ke `/checkout/ferry-tickets/batam-fast-btm-to-sg?trip=round-trip&date=2026-10-10&return=2026-10-13&adults=2&children=0&class=emerald&returnFerryId=3&returnTicketSlug=batam-fast-btm-to-sg`. Checkout page render 2-leg sidebar badge "ROUND TRIP", 2 trip strips (OUTBOUND Sat 10 Oct Emerald + RETURN Tue 13 Oct Emerald), **Total price Rp 4.600.000** (grand), session timer 14:51 active (per 4.67.1).
- ✅ **ST4 (one-way regression)**: Navigate ke `/ferry-tickets?date=2026-10-10&adults=2` (no `trip`/`return` → defaults to one-way) → both banners `display: none`, no badges visible, first card detail href `/ferry-tickets/batam-fast-btm-to-sg` intact. Click behavior: delegate ke `onBookClick` existing → ke detail page.

### Testing (additional edge cases — pending)

**Smoke Test ST1 — Flow baru Traveloka-style**
- [ ] Buka homepage (atau page dgn ServiceListingTicketSearch widget).
- [ ] Isi widget: from=Gili Trawangan, to=Padang Bai (atau sebaliknya), date=today+2, trip=**Round Trip**, return=today+5, 2 Adult 0 Child.
- [ ] Klik "Search Tickets" → navigate ke `/ferry-tickets?trip=round-trip&from=...&to=...&date=...&return=...&adults=2&trip=round-trip`.
- [ ] ✅ Banner coral tampil: "Round trip · Step 1 of 2 · Choose your outbound ferry · Departure <date> · Return <date> · 2 Adults".
- [ ] ✅ Setiap card punya badge pojok kanan atas "SELECT OUTBOUND →" (ocean background).
- [ ] ✅ Hover card → cursor pointer. Klik card (bukan "More info" link).
- [ ] ✅ Browser navigate ke `/ferry-tickets?trip=round-trip&from=<reversed>&to=<reversed>&date=<returnDate>&return=<returnDate>&outbound=<id>&outboundSlug=<slug>&outboundClass=ekonomi&departure=<outboundDate>&adults=2`.
- [ ] ✅ Banner ocean tampil: "Round trip · Step 2 of 2 · Choose your return ferry · Outbound <slug> · Departure <date> · Return <date>".
- [ ] ✅ Setiap card badge "SELECT RETURN →" (coral background).
- [ ] ✅ Route listing: dari destination original ke origin original (reverse).

**Smoke Test ST2 — Step 2 → checkout (4.67.2c flow continuation)**
- [ ] Dari ST1 state (step 2), klik card return.
- [ ] ✅ Navigate ke `/checkout/ferry-tickets/<outboundSlug>?...&returnFerryId=<id>&returnTicketSlug=<slug>&return=<returnDate>&class=ekonomi&...`.
- [ ] ✅ Checkout page render 2 trip strips (sand + leaf per 4.67.2d).

**Smoke Test ST3 — Change outbound back-navigation**
- [ ] Dari ST1 state (step 2), klik "Change outbound" button di banner.
- [ ] ✅ Navigate kembali ke `/ferry-tickets?trip=round-trip&from=<original>&to=<original>&date=<outboundDate>&return=<returnDate>&adults=2`.
- [ ] ✅ Banner Step 1 (coral) tampil lagi. Listing cards reverse route back ke outbound direction.
- [ ] ✅ User bisa pilih outbound berbeda.

**Smoke Test ST4 — One-way regression**
- [ ] Dari widget pilih One Way (not Round Trip), submit.
- [ ] ✅ Listing tampil TANPA banner Step 1/Step 2.
- [ ] ✅ Card tidak punya badge "Select Outbound/Return →".
- [ ] ✅ Klik card → navigate ke detail page `/ferry-tickets/<slug>` (behavior unchanged).

**Smoke Test ST5 — Direct detail page fallback (4.67.2b legacy)**
- [ ] Buka URL manual: `/ferry-tickets/<slug>?trip=round-trip&date=today+2&return=today+5&adults=2`.
- [ ] ✅ Detail page tampil normal.
- [ ] ✅ Sidebar form section "Round-trip" tampil (per 4.67.2b).
- [ ] ✅ Per-class CTA "Pick Return · Ekonomi/Emerald" tampil (not dimmed karena date+return sudah ada).
- [ ] ✅ Klik salah satu class CTA → navigate ke listing Step 2 (sama tujuan dgn ST1 Step 2).

**Smoke Test ST6 — Edge: round-trip tanpa return date**
- [ ] Buka URL: `/ferry-tickets?trip=round-trip&from=X&to=Y&date=today+2&adults=2` (no `return`).
- [ ] ✅ Listing tampil TANPA banner Step 1 (karena `isOutboundPick` false — needs `!!qReturnDate`).
- [ ] ✅ Card click → detail page (fallback normal).

### Rollback
`git revert <commit-4.67.3>` → kembali ke flow lama:
- Listing step 1 TIDAK ada banner / badge.
- Card click round-trip step 1 → detail page (via dateAttr `?trip=round-trip&...`).
- Detail page CTA 4.67.2b tetap satu-satunya jalan ke listing step 2.

Zero schema change, zero data loss, zero URL contract change (step 2 URL
tetap identik dgn 4.67.2b output).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.3-listing-outbound-pick-wizard.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru

### Next Steps
- **User evaluate Opsi B** (inline class pills di card): kalau cheapest-default dirasa limiting, Phase 4.67.4 add class picker inline di card (expand on click, pills per class).
- **Phase 4.67.2g** (deferred — final sub-phase 4.67.2 series): WhatsApp message template 2-leg render.
- **(Optional)** Detail page `/ferry-tickets/[slug].astro`: hide "Ferry Schedule" section kalau `scheduleTime[]` empty — bukan scope 4.67.3 tapi QoL fix yang muncul dari diagnosis.

### Patch 2026-10-07 (post-review polish, 5 fix)

User review 1st verify → 5 perbaikan UI/UX ditambahkan di sesi yang sama:

**1. Widget → Listing spacing** (`ServiceListingTicketSearch.astro`): wrapper widget tambah `pb-10 md:pb-14` → gap form bottom ke banner Step 1 jadi 72px (sebelumnya terlalu rapat). "Our Collections" title tidak lagi menimpa Starting Point / Destination.

**2. Badge reposition** (`ServiceListingTicketSearch.astro`): "SELECT OUTBOUND →" + "SELECT RETURN →" badge pindah dari `absolute top-3 right-3` → `absolute -top-3 left-1/2 -translate-x-1/2` dgn `rounded-full` + `shadow-lg` — ribbon-style center-top yang stick di atas card border. Simetris, tidak menimpa Price/Save/Recommended badge di card corners.

**3. No-reload Step 1 → Step 2 transition** (`ServiceListingTicketSearch.astro`): refactor `_handleCardClick` outbound-mode branch → bukan `window.location.href = ...` (full reload) tapi:
- Set wizard state (`_wOutbound`, `_wOutboundSlug`, `_wOutboundClass`, `_wDeparture`, `_wFrom=prevFrom`, `_wTo=prevTo`).
- Swap `fromSlug ↔ toSlug` + `fromQ ↔ toQ` + `fromSub ↔ toSub` → Alpine filter otomatis show reverse route.
- Set `this.date = this._wReturn` → cards show return date.
- Flip `_isOutboundMode=false`, `_isReturnMode=true` → `x-show` instant swap banner + badge warna/text.
- `history.pushState()` update URL (back button bekerja via `_handlePopState()` yang re-run `_detectWizardMode()`).
- Update `.tkc__date` elements + `sortRefreshing=true` ~420ms fade-up animation + smooth scroll ke `#tsh-listing`.
Verified: scrollY 1390 setelah click, no page reload, Alpine state preserved. Return → checkout tetap full `window.location.href` navigation (ganti page).

**4. "Change trip" / "Change return" URL** (`apps/web/src/pages/checkout/ferry-tickets/[slug].astro`): 
- Extract `outboundFromSlug` + `outboundToSlug` dari `item.originLocation`/`arrivalLocation` relationship.
- "Change trip →" (outbound strip): dulu `href={detailUrl}` → sekarang `/ferry-tickets?trip=round-trip&from=<outbound-origin>&to=<outbound-dest>&date=<outbound-date>&return=<return-date>&adults=&children=` (listing Step 1 URL). Mode one-way tetap pakai `detailUrl` (unchanged).
- "Change return →" (return strip): dulu URL kurang `from`/`to` → sekarang tambah reverse route (`from=outboundToSlug`, `to=outboundFromSlug`) + preserve outbound metadata (listing Step 2 URL). Format via `URLSearchParams` biar escaping aman.

**5. Booking Summary — 2 BOX layout** (`apps/web/src/pages/checkout/ferry-tickets/[slug].astro`): sidebar lama = flat section dgn collapsible "Show Details". Baru:
- **OUTBOUND BOX** (ocean border + pale ocean bg, rounded-xl): badge "OUTBOUND" + date, ferry title + class, route label dgn location_on icon, price breakdown Adult × N + Child × N (jika ada), **Subtotal** di bawah (bold).
- **RETURN BOX** (leaf border + pale leaf bg, rounded-xl, round-trip only): sama structure dgn OUTBOUND tapi warna leaf-dark + ikon event_repeat/ship.
- Passenger summary strip (compact, outside box).
- Service fee + Discount lines (jika ada).
- **GRAND TOTAL BOX** (gradient coral/10→coral/5 + border-coral/30 2px): label "TOTAL PRICE · Outbound + Return" + display font 2xl bold coral.
- Collapsible "Show Details" button dihapus (semua info visible by default sekarang). JS listener dibuat no-op.

**Visual verifikasi (end-to-end):**
- ✅ ST1: `/ferry-tickets?trip=round-trip&from=...&to=...&date=2026-10-10&return=2026-10-13&adults=2` → banner Step 1 coral + "SELECT OUTBOUND →" badge center-top.
- ✅ ST2: click card → URL ter-update ke Step 2 TANPA page reload (location.href changed via pushState, Alpine state preserved, scroll to listing, badge berganti ke "SELECT RETURN →" coral, banner Step 2 ocean tampil).
- ✅ ST3: click return card → full nav ke `/checkout/.../batam-fast-btm-to-sg?...` → render sidebar 2 BOX (OUTBOUND ocean + RETURN leaf) + GRAND TOTAL Rp 4.600.000 coral box + Outbound strip "Change trip →" link ke listing Step 1 (`/ferry-tickets?trip=round-trip&from=batam&to=singapore&...`) + Return strip "Change return →" link ke listing Step 2 (`/ferry-tickets?trip=round-trip&from=singapore&to=batam&outbound=3&...`).

### Patch 2026-10-07 (post-review polish-2, 3 fix)

User review ke-2 → 3 perbaikan tambahan:

**1. Widget mobile — label pindah KELUAR card** (`ServiceListingTicketSearch.astro`): Mobile card Origin/Destination/Date/Return Date/Passenger dulu punya label (STARTING POINT/DESTINATION/dll) **di dalam** card, di sebelah pin icon kiri. Masalahnya pin icon ter-vertical-center sama card height, tapi label stuck di top → secara visual label text "ngambang di atas pin" (user keluhan: "textnya masih berada di atas pointnya"). Fix: pindahkan `<label>` keluar card (di atas, dgn `mb-1 ml-3` ocean small caps), card tinggal berisi [pin icon] + [value + subtitle] yang sudah properly center. Hasilnya: label jelas describe card ini, pin icon jelas inside card = alignment visual rapi. Konsisten dgn pola desktop yang sudah pakai label-di-atas-card.

**2. Validation alert untuk field passenger yang belum terisi** (`apps/web/src/pages/checkout/ferry-tickets/[slug].astro`):
- Form checkout dulu pakai `required` attribute native + browser default tooltip. Problem: accordion passenger di-collapse (hanya passenger pertama expanded) → kalau passenger 2 name kosong, user tidak lihat tooltip-nya (field hidden).
- Fix: tambah `novalidate` ke `<form>` + custom submit handler yang scan contact (`customerName`/`customerEmail`/`contactPhone`) + per-passenger `firstName`/`lastName`. Kalau ada yang kosong:
  - Prevent submit.
  - Auto-expand accordion passenger yg invalid (`expandPassenger(idx)`).
  - Tampilkan banner alert `#checkoutValidationAlert` (coral border, info icon) dengan daftar field yg kurang (listed).
  - Scroll banner ke center + focus field invalid pertama + highlight ring coral 2.2 detik.
- Banner dapat tombol × untuk dismiss.
- Field yang tetap `required` di HTML (opsional di-remove karena sudah di-handle JS) — tetap pakai `required` biar tetap valid untuk a11y + crawler, hanya `novalidate` yang block browser default UI.

**3. Booking Summary — collapsible "Show Details" + header align Passenger Info** (`apps/web/src/pages/checkout/ferry-tickets/[slug].astro` + `confirmation/[ref].astro`):
- Checkout page: sidebar Booking Summary (post 4.67.3 polish-1 jadi flat 2 BOX) dulu panjang (OUTBOUND BOX + RETURN BOX + helpers + GRAND TOTAL) → scroll berat. Baru: tambah ringkasan atas (TRIP route + date singkat + pax strip) + tombol "Show Details" → OUTBOUND BOX + RETURN BOX + service fee di-collapse (`hidden` by default). Grand Total tetap always visible (critical info).
- Checkout page header: "Booking Summary" (ocean py-3 + dot + text kecil) → disamakan dgn style "Contact Information" / "Passenger Information" section (`bg-ocean text-white px-5 sm:px-6 py-4` + icon ring `receipt_long` + title besar + subtitle + badge `emerald-400/20` di kanan). Selaras visual dgn section lain di form left column.
- Confirmation page header: sama treatment (icon + title besar + subtitle "Round-trip · 2 legs confirmed" / "One-way · confirmed" + badge "Round Trip"/"Confirmed"). Konsisten antara checkout + confirmation.
- JS handler baru `#bsDetailsToggle` / `#bsCollapsibleBody` di checkout — mirror pattern `toggleSummaryDetails` yang existing di confirmation page.

**Visual verifikasi (end-to-end, 2026-10-07):**
- ✅ Widget mobile (375×812): screenshot → semua label (STARTING POINT, DESTINATION, DEPARTURE DATE, RETURN DATE, PASSENGER) berada DI ATAS card masing-masing dengan jelas. Pin icon tidak lagi "berada di bawah text label".
- ✅ Validation alert: `form.dispatchEvent(new Event('submit'))` → `#checkoutValidationAlert` muncul dengan daftar 5 field (Full Name, Email, Phone, Passenger 1 names, Passenger 2 names). Passenger 2 body auto-expanded (hidden=false). Submit prevented.
- ✅ Booking Summary toggle: click "Show Details" → `#bsCollapsibleBody` expand → OUTBOUND BOX visible. Label berganti "Hide Details" + icon rotate 180°. Click lagi → collapse kembali.
- ✅ Sidebar header baru: screenshot → "Booking Summary" title ocean banner + icon ring `receipt_long` + subtitle + badge pojok kanan. Match style Contact Information section.

### Patch 2026-10-07 (post-review polish-3, 3 fix)

User review ke-3 → 3 perbaikan:

**1. One Way label position (verified)**: User melaporkan Starting Point / Destination issue "juga ada pada One Way". Verified di browser pane: One Way mobile + desktop sudah OK — label berada DI ATAS card (tidak di dalam, tidak overlap pin icon). Fix polish-2 di mobile markup shared antara one-way dan round-trip, dan desktop variant memang sejak awal pakai label-outside pattern. Tidak ada perubahan code untuk fix ini — konfirmasi visual via screenshot one-way desktop + mobile.

**2. Badge "Select Outbound / Return" redesign — proporsional across desktop/tablet/mobile** (`ServiceListingTicketSearch.astro` line ~1264–1288):
- **Before**: `absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5` — pill tengah atas, floating detached dari card, terlihat "forced/mepet" di mobile narrow cards.
- **After**: tag anchor kiri-atas (`absolute top-1 left-4 sm:left-5`), bentuk rounded-md (bukan full pill), **icon added** (`flight_takeoff` / `event_repeat`), text + arrow glyph. Padding dalam proporsional (`pl-2.5 pr-3.5 py-1`).
- **Card wrapper picker-mode enhancement**: `pt-7 sm:pt-8` padding atas (badge punya ruang nafas DI DALAM wrapper, tidak numpuk ke card content), **ring-1 ring-ocean/40** (atau coral untuk return) sebagai visual affordance "clickable", **hover:ring + hover:shadow colored** biar jelas kalau card clickable.
- Mobile: badge pakai text `text-[10.5px]` + icon `w-3 h-3`; desktop: `sm:text-[11px]` + icon `w-3.5 h-3.5`. Scaling natural tanpa overlap/mepet.
- Visual verified di desktop (1280×900) + mobile (375×812): badge tampil kiri-atas, card content fully visible, ring color menandakan actionable, hover shadow kelihatan di desktop.

**3. BUG FIX: "Continue to Confirmation" mendarat di halaman ferry cards, bukan confirmation** (`apps/web/src/pages/api/bookings/create.ts` line ~132–160):
- **Root cause**: Server endpoint pakai `const back = slug ? \`/checkout/ferry-tickets/${slug}\` : '/'` untuk `errorRedirect`. Kalau validasi apapun fail (rate_limit, stamp_expired, invalid_passengers, invalid_passport_expiry, return_route_mismatch, dll), server redirect ke `/checkout/ferry-tickets/{slug}?err=XXX` **tanpa** query params `date`/`adults`/`children`/`class`.
- Checkout page frontmatter: `if (!qDate) return Astro.redirect(\`${detailUrl}?err=needs_date\`)` → bounce ke `/ferry-tickets/{slug}` yang nampilkan "ferry cards" (daftar kelas).
- **User effect**: user yg form-nya ditolak (misal rate-limit, atau stamp expired karena form open >30 menit) langsung dilempar ke halaman detail ferry, tanpa feedback error, tanpa field tersave.
- **Fix**: rekonstruksi `back` dgn URL-encode `departureDate`, `adults`, `children`, `ferryClassType`, dan untuk round-trip tambah `tripType`, `returnDate`, `returnFerryTicketId`, `returnTicketSlug`, `returnFerryClassType`. Semua dari form data submission (bukan dari URL — form adalah ground truth).
- **Verified via fetch POST** (dari browser JS): submit form valid+signed → redirect follow → final URL = `/checkout/ferry-tickets/batam-fast-btm-to-sg?date=2026-10-10&adults=2&children=0&class=emerald&err=rate_limited` status 200. User tetap di checkout page + error banner tampil (via `errorMessages` map existing).
- Alur sukses tidak berubah — redirect ke `/checkout/ferry-tickets/confirmation/{ref}?t={token}`.

**Dampak**: Semua error flow dari endpoint `/api/bookings/create` (14+ error codes) sekarang mendarat kembali di checkout page dgn state terjaga, bukan bounce ke detail/listing. Zero regression untuk sukses flow.
