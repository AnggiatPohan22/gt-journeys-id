## Phase: 4.61.7 — Ticket Search Template + Real-time Calendar
**Tanggal**: 2026-09-28
**Status**: Selesai (pending manual verify di frontend)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menyelesaikan Ferry Ticket sebagai template reusable untuk service ticket
lain (train, plane, bus). Tambah **Template 2 "Ticket Search"** ke
ServiceListing block (Trip pill + Origin/Destination + Departure Date +
Passenger stepper + Sort), dengan config per-block di tab Filter & Search.
Locations dapat field `locationType` (5 kategori) — dropdown Ticket Search
otomatis filter by type. FerryTickets dapat `durationMinutes` (auto by hook)
untuk sort "Shortest Duration". Semua date picker (listing, detail sidebar,
server-side booking API) enforce `min={today}` supaya visitor tidak bisa
book tanggal lewat. Font Departure/Arrival di card ticket disamakan dengan
font Location title.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/cards/TicketRouteCard.astro` | `.tkc__time` disamakan dgn `.tkc__name` (14/16/20 px vs sebelumnya 16/22/30). Color: coral, weight 700, letter-spacing ringan supaya tetap menonjol. |
| `apps/cms/src/collections/Locations.ts` | Tambah field `locationType` (select: ferry-port / train-station / airport / bus-terminal / city, default ferry-port). |
| `apps/cms/src/collections/FerryTickets.ts` | Tambah hidden `durationMinutes` (number, readOnly, auto-set by hook). |
| `apps/cms/src/hooks/computeFerryDuration.ts` | Set `data.durationMinutes = diff` bersamaan dengan format string `duration`. |
| `apps/cms/src/blocks/index.ts` | Tambah layout option `ticket-search` di ServiceListing. Di tab Filter & Search: collapsible **Ticket Search — Template 2 Config** (10 field: enableRoundTrip, enableInfant, maxAdults/Children/Infants, locationType, startingPointLabel, destinationLabel, submitButtonText, defaultSort). Semua conditional `layout === 'ticket-search'`. |
| `apps/cms/src/migrations/20260928_152436_phase_4_61_7_ticket_search.ts` | **NEW** — 91 kolom ADD (10 kolom per 9 block table = pages/posts/tours/yachts/restaurants/venues/rentals/spa + locations + ferry_tickets). Non-destructive, semua defaultable. |
| `apps/cms/src/migrations/index.ts` | Register migration baru. |
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | **NEW** — Template 2 hero + widget + grid. Alpine.js passenger stepper (+/-). Server-side filter by from/to + sort. Round Trip pill visible + disabled + "Soon" badge. Query params passthrough ke detail via `hrefBase + ?date=`. |
| `apps/web/src/components/blocks/ServiceListingBlock.astro` | Dispatch ke `ServiceListingTicketSearch` jika `layout === 'ticket-search'`. |
| `apps/web/src/lib/payload.ts` | Tambah `LocationDoc` interface + `getLocations()` helper. |
| `apps/web/src/lib/date.ts` | **NEW** — `todayLocalISO()` (YYYY-MM-DD server local) + `isPastDate(dateStr)`. |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Sidebar date input tambah `min={todayLocalISO()}`. |
| `apps/web/src/pages/api/bookings/create.ts` | Defense-in-depth: reject `departureDate < today` → redirect `?err=past_departure_date`. |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Map err `past_departure_date` → pesan Indonesia. |
| `packages/shared/src/types/payload-types.ts` | Auto-regenerated. |

### Impact
- **Database**: migration `20260928_152436_phase_4_61_7_ticket_search` (91 kolom ADD, non-destructive, semua defaultable).
- **CMS**: ServiceListing block dapat layout ketiga `ticket-search`. Editor bisa pilih per-block. Untuk Ferry Ticket page → switch ke `ticket-search`; service lain tetap default `editorial-featured`. Locations dapat `locationType` (default `ferry-port` → existing data otomatis kompatibel).
- **Frontend**: layout `ticket-search` render hero gradient + widget floating (Trip / From / To / Date / Passenger / Update) + sort dropdown + grid. Card ticket font time compact. Query params: `?from=<slug>&to=<slug>&date=YYYY-MM-DD&adults=2&children=0&infants=0&trip=one-way&sort=earliest`.
- **Routes**: none — semua flow tetap `/ferry-tickets` + `/ferry-tickets/[slug]` + `/checkout/ferry-tickets/[slug]`.
- **RBAC**: none.

### Design Decisions

**Kenapa layout ketiga bukan CardVariant baru?**
Layout = struktur halaman (hero, search widget, grid). CardVariant = tampilan
kartu (compact/detailed/ticket). Ticket Search butuh WIDGET custom (bukan
sekadar pill tabs + search bar generic). Layout terpisah = separation of concerns
yang bersih.

**Kenapa Locations `locationType` bukan collection terpisah**?
Data structure ferry-port ≈ train-station ≈ airport (name, terminal, country,
timezone, map). Cukup 1 kolom kategori. Kalau nanti butuh field khusus per-tipe
(mis. gate number untuk airport), migrate ke collection terpisah. Sekarang
overkill.

**Kenapa Round Trip UI visible tapi disabled?**
User request: "biar UI secara keseluruhan muncul walaupun fungsi belum di buat".
Booking Round Trip perlu schema change di Bookings collection (2 legs) —
scoped di Phase 4.65. Disini cukup radio pill visible + `disabled` + "Soon" badge.

**Kenapa client-side sort di ticket-search bukan server-side query**?
Data 24 items per page (default limit). Sort in-memory murah. Kalau nanti scale
> 100 items, bisa refactor ke fetch Payload dengan `sort` param.

**`durationMinutes` sebagai kolom terpisah**?
Field `duration` string ("1h 15m") tidak sortable numerik. `durationMinutes`
auto-set oleh `computeFerryDuration` hook — user tidak perlu isi. Frontend
sort by `durationMinutes ?? 99999` (missing → dorong ke bawah).

**`todayLocalISO()` bukan pakai `toISOString().slice(0,10)`**?
`toISOString()` = UTC. Di WIB (UTC+7) jam 03:00 lokal, UTC masih 20:00 hari
kemarin — user tak bisa book "hari ini". `todayLocalISO()` pakai
`getFullYear/getMonth/getDate` yang honor local timezone server. Dokumentasi
di file: kalau server runs di UTC (production Cloudflare), edge case masih
ada — server-side validation adalah backstop.

### Testing (manual — pending user verify)
- [ ] `/ferry-tickets` (asumsi ServiceListing block layout diubah user ke `ticket-search` via CMS): render hero gradient + widget floating.
- [ ] Widget: Round Trip pill visible dgn "Soon" badge, tidak bisa dipilih. One Way pill default checked & bisa dipilih.
- [ ] Klik dropdown Starting Point: hanya lokasi `locationType = ferry-port` yang muncul.
- [ ] Swap button (⇄) tukar Origin ↔ Destination di select.
- [ ] Departure Date input: tanggal kemarin di-block (grayed out di native date picker).
- [ ] Klik Passenger button → dropdown +/- stepper muncul. Adult min 1 / max 9, Child min 0 / max 6, Infant min 0 / max 2 (Infant tidak muncul kalau `enableInfant = false`).
- [ ] Klik Update: URL update dgn query params, grid re-render sesuai filter + sort default `earliest`.
- [ ] Sort dropdown: pilih "Cheapest" → grid re-order. State from/to/date persist.
- [ ] Klik ferry card → detail page dengan `?date=YYYY-MM-DD` (kalau date diisi).
- [ ] Detail page sidebar date input: kemarin tidak bisa dipilih.
- [ ] Coba POST langsung ke `/api/bookings/create` dengan `departureDate=2020-01-01` → 400 `past_departure_date`.
- [ ] Card ticket di `/ferry-tickets`: font waktu departure & arrival sekarang sama ukuran dengan Location title (tidak dominan lagi).
- [ ] CMS: buka Pages block editor → tambah ServiceListing → pilih layout "Ticket Search" → tab Filter & Search muncul collapsible "Ticket Search — Template 2 Config" (previous 2 layout tidak menampilkannya).

### Rollback
1. `cd apps/cms && pnpm payload migrate:down` (91 kolom DROP)
2. `git revert <commit-4.61.7>` — semua file phase kembali
3. `pnpm generate:types` sync types
4. Kalau block di CMS sudah pakai `layout = ticket-search`, ubah ke `editorial-featured` sebelum revert.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/search-template/phase-4.61.7-ticket-search-template.md` (file ini)
- [ ] `docs/PROGRESS.md` (add entry)
- [ ] `docs/03-CONTENT-MODEL.md` (jika ada — jelaskan `locationType` & `ticketSearchConfig` field group)

### Design Round 3 (boarding-pass style, pre-commit)
Refactor total mengikuti referensi mobile app di `ai/reference/filter-search-mobile/`. Design mobile-first yang seamless ke tablet & desktop via `max-w-lg mx-auto` (satu code path, tidak ada layout khusus per breakpoint).

| File | Change | Reason |
|------|--------|--------|
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | **Total rewrite**: card `rounded-3xl` boarding-pass style. Trip type segmented pill (bg-sand, active white shadow + coral dot; Round Trip disabled dgn amber "SOON" badge). Route section: 2 STACKED cards (Origin & Destination) rounded-2xl dengan icon di kotak kecil, label uppercase 10px, input bold 14px, subtitle country. Swap button floating absolute di kanan tengah antara 2 cards (rotate-180 on hover). Date card rounded-2xl dengan icon + "Today"/"Tomorrow" badge. Quick date chips (Today/Tomorrow/day-after) di bawah date card. Passenger card rounded-2xl expandable dgn breakdown chips ("2 Adult · 0 Child · 0 Infant") saat collapsed dan +/- stepper saat open. Submit button orange full-width rounded-2xl dgn search icon + uppercase label. | User request: reference sedekat mungkin, seamless mobile→desktop. |
| `apps/web/src/components/blocks/ServiceListingTicketSearchLegacy.astro` | **NEW** (renamed dari `.legacy.astro` karena Astro tidak accept dot-in-basename import path). Copy exact dari Round 2 design (5-column horizontal). | **Rollback safety net**. |
| `apps/web/src/components/blocks/ServiceListingBlock.astro` | Import both new + Legacy. `TICKET_SEARCH_LEGACY = import.meta.env.TICKET_SEARCH_LEGACY === '1'`. Template dispatch conditional. Semua imports diletakkan sebelum `const` (Astro compiler groups imports at top). | Enables env-flag rollback. |

**Rollback plan** (jika design baru bermasalah di production):
1. **Instan (env var)**: set `TICKET_SEARCH_LEGACY=1` di `.env` (dev) atau di Cloudflare Pages env vars (prod) → rebuild/deploy. Tidak ada perubahan code.
2. **File-level**: `git revert <commit-round-3>` mengembalikan design Round 2.
3. **Manual permanent**: hapus baris `TICKET_SEARCH_LEGACY` di [ServiceListingBlock.astro:24-25](apps/web/src/components/blocks/ServiceListingBlock.astro) dan pakai `ServiceListingTicketSearchLegacy` langsung untuk `layout === 'ticket-search'`.

**Design decisions**:
- **Kenapa mobile-first + max-w-lg?** Reference mobile pattern (card boarding-pass) inherently works di desktop sebagai centered focused search — cocok untuk single-purpose search widget, tidak butuh side-by-side desktop layout yang lebar. Simpler, konsisten, satu code path.
- **Kenapa swap button floating absolute?** Match reference pattern; visually connects the two route cards.
- **Kenapa quick date chips?** UX shortcut untuk booking hari-ini / besok yang paling umum di ferry booking.
- **Kenapa breakdown chips vs full stepper collapsed?** Menampilkan info penuh (2 Adult · 0 Child · 0 Infant) tanpa mengambil space; stepper hanya muncul saat user butuh edit.

**Verified**:
- Desktop: card centered `max-w-lg`, all elements render, autocomplete works.
- Mobile 375×812: stacked layout matches reference layout & spacing, all controls accessible.
- Zero console errors.

### Bugfix Round 2 (UX polish, superseded by Round 3)
| File | Change | Reason |
|------|--------|--------|
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | Starting Point & Destination `<select>` → **combobox autocomplete** (text input + filtered suggestions dropdown). Alpine state: `locations[]`, `fromQ`/`toQ` (display), `fromSlug`/`toSlug` (form value), `fromOpen`/`toOpen`. `filtered(q)` filter case-insensitive by name+terminal. Clear × button per input. `pick(field, loc)` sets display+slug+close. `swap()` exchanges state. Hidden `name="from"`/`name="to"` bound to slug. | Select bakal panjang & tidak scale kalau >5 lokasi. Autocomplete lebih clean, mobile-friendly, memudahkan visitor ketik "batam" → langsung filter port di Batam. |
| Same file — swap button | Class `hidden lg:flex` → `flex` di semua breakpoint + `mx-auto` + `rotate-90 lg:rotate-0` (↕ vertical arrow di mobile antara stacked inputs, ⇄ horizontal di desktop). Handler `swap()` sekarang manipulate Alpine state (bukan DOM select). | Swap tidak muncul di mobile — hidden by responsive class. Sekarang selalu visible + rotate 90° supaya semantik "swap vertikal" di stacked layout. |

Verified via browser pane:
- Desktop: autocomplete filter ("batam" → 1 match), swap horizontal ⇄, ×-clear button per input.
- Mobile (375×812): swap button ↕ visible di antara stacked From & To inputs (40×40, rotated 90°). Font Departure/Arrival time compact.
- Zero console errors.

### Bugfix Round 1 (post-initial commit)
| File | Bug | Fix |
|------|-----|-----|
| `apps/web/src/lib/payload.ts` | `getLocations()` return 0 rows — default `status: 'published'` filter, tapi Locations tidak punya `status` field. | Override ke `status: 'all'`. |
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | Alpine `x-data="ticketSearch({...})"` throw `ReferenceError: adults is not defined` — `Alpine.data()` registration timing tidak sinkron dengan DOM walk saat HMR. | Pindah state langsung ke inline `x-data="{...}"` object literal (bypass factory registration). Script sisa hanya `import Alpine + Alpine.start()` sekali guarded by `window.__dnjAlpineStarted`. |
| `packages/shared/src/icon-map.ts` | Icon `swap_horiz` (widget swap button), `flight_land`, `access_time`, `map` (Phase 4.61.6 quickSpecs & Location Port button) tidak render. | Tambah 4 mapping baru ke Lucide equivalents. |

Verified via browser pane:
- Location dropdowns: 5 opsi (Any + 4 lokasi dgn terminal name).
- One Way pill enabled, Round Trip disabled dgn badge SOON.
- Swap icon (⇄) render.
- Passenger button klik → dropdown stepper terbuka, Adult/Child/Infant +/- bekerja.
- 2 ferry ticket cards (Batam Fast + Majestic) tampil di grid.
- Zero console errors di fresh tab.

### Round 4 — Responsive: two-variant (mobile stacked + Template 1-style horizontal desktop)
**Tanggal**: 2026-09-29
**File**: `apps/web/src/components/blocks/ServiceListingTicketSearch.astro`

**Request user (iterasi 3)**: "buat frame dari filter and search itu
memanjang horizontal seperti template 1 yang ada di /rental, bukan tetap
memakai frame untuk mode mobile nya."

**Approach akhir**: alih-alih meregangkan boarding-pass card mobile ke
desktop (yang tetap terasa "sempit" & padded seperti mobile), render
**dua variant terpisah** yang share Alpine state:
- **Mobile** (`md:hidden`): boarding-pass card `rounded-3xl shadow-2xl p-5` — persis sama seperti sebelumnya (unchanged).
- **Desktop** (`hidden md:flex`): Template 1-style — `bg-white rounded-2xl shadow-xl border border-sand-dark/10 p-3 lg:p-4 gap-2 lg:gap-3 items-stretch`, satu bar horizontal dengan input sand-filled + tombol Search coral di kanan, mirror `ServiceListingEditorial.astro:261` yang dipakai `/rental`.

**Struktur desktop variant** (frame = full container width, sama panjang dgn Template 1 /rental):
```
[hidden md:flex md:flex-row w-full bg-white rounded-2xl shadow-xl border p-3 lg:p-4 gap-2 lg:gap-3 items-stretch]
  ├─ [flex-1 flex flex-row gap-2 lg:gap-3 items-stretch min-w-0]
  │    Origin(flex-1)  ⇄swap(shrink-0)  Destination(flex-1)  Date(flex-1)  Passenger(flex-1)
  └─ [button coral shrink-0 px-6 lg:px-8 py-3] Search
```

**Frame width — smoke tested vs /rental HTML output**:
Smoke test dgn `curl http://localhost:4321/rental` dan `curl /ferry-tickets`
menemukan:
- Rental pakai `ServiceListingHeroImmersive` (BUKAN Editorial), search bar
  wrapper `max-w-5xl mx-auto bg-white/95 backdrop-blur` — cap 1024px.
- Rental parent = `max-w-7xl` (1280px), field count = 3 (name/date/guests)
  → per-field space ~256px = roomy.
- Ferry parent = `max-w-7xl` (1280px). Kalau bar juga di-cap `max-w-5xl`,
  ferry get 1024px / 5 fields (+swap+submit) = **~170px per field = gepeng**.

**Keputusan**: form `max-w-lg md:max-w-none mx-auto` — biarkan mengisi
100% parent (`containerClass` = default max-w-7xl = 1280px). Ferry bar
= 1280px / ~6 slots = **~215px per field** — lebih dekat ke rental's
256px meski total lebar bar Ferry > Rental. Trade-off yang disengaja
karena ferry punya field count lebih banyak (Origin/swap/Dest/Date/
Passenger/Submit).

**Kenapa flex + flex-1 (bukan grid arbitrary)?** Iterasi sebelumnya pakai
`md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]`
tapi Tailwind JIT tidak konsisten meng-compile arbitrary grid-cols panjang
dgn nested `minmax()`, sehingga di runtime grid tidak apply → kolom stack
vertikal seakan mobile layout. Switched ke `flex flex-row` + `flex-1
min-w-0` pada tiap kolom (utility class dasar, dijamin generated) →
horizontal bar reliable.
- Semua input pakai style Template 1: `pl-12 pr-4 py-3 rounded-xl border-none bg-sand focus:bg-white focus:ring-2 focus:ring-ocean`.
- Icon leading via `absolute left-4 top-1/2`.
- Autocomplete dropdown (from/to) & passenger stepper pakai `absolute top-full` overlay.
- Swap button inline di kolom `auto` tengah antara Origin & Destination.

**Shared state via Alpine**: kedua variant di dalam `<form>` yang sama,
share x-data di parent `<section>`. Field `fromQ`, `toQ`, `date`, `adults`,
`children`, `infants`, `trip`, `fromOpen`, `toOpen`, `passengerOpen` semua
sync bilateral (ubah di satu variant terbawa ke variant lain saat resize).

**Hidden inputs consolidated ke form-level**: sebelumnya `<input type=date name=date>` visible dan hidden inputs (from/to/adults/dst) tersebar di dalam block. Sekarang SEMUA name-having inputs pindah ke bagian bawah form sebagai `<input type=hidden x-bind:value>`:
```html
<input type="hidden" name="trip" x-bind:value="trip" />
<input type="hidden" name="from" x-bind:value="fromSlug" />
<input type="hidden" name="to"   x-bind:value="toSlug" />
<input type="hidden" name="date" x-bind:value="date" />
<input type="hidden" name="adults" x-bind:value="adults" />
<input type="hidden" name="children" x-bind:value="children" />
<input type="hidden" name="infants" x-bind:value="infants" />
<input type="hidden" name="sort" value={qSort} />
```
Visible date input di kedua variant tidak lagi punya `name=` (hanya
`x-model="date"`), mencegah duplicate submission (`?date=X&date=X`)
karena kedua variant tetap ada di DOM meski salah satu display:none.

**Kenapa dua variant vs satu responsive?**
Mobile boarding-pass style (`rounded-3xl` cards with elevated icon boxes,
uppercase micro-labels, breakdown chips) adalah paradigma visual yang
berbeda dari Template 1 (`rounded-xl bg-sand` inline inputs). Meregang-
kan boarding-pass ke horizontal menghasilkan visual berat & tidak match
konsistensi Template 1. Dua variant terpisah = tiap breakpoint dapat
pattern yang tepat, plus Tailwind hanya perlu utility class dasar
(tidak ada arbitrary value yang bisa gagal ter-scan JIT).

**Kenapa tetap satu `<form>`?**
Alpine state, submit handler, dan hidden inputs semuanya konsisten.
Kedua variant secara semantik = satu form yang tampil beda di viewport
berbeda. Kalau dua form terpisah = risiko state divergence saat resize.

**Testing** (pending manual verify — dev server chat lain jalan):
- [ ] Mobile 375×812: boarding-pass card stacked, unchanged dari Round 3.
- [ ] Tablet 768: satu bar horizontal Template 1-style, 5 kolom + tombol Search kanan.
- [ ] Desktop ≥1024: bar horizontal `p-4 gap-3`, form mengisi penuh `max-w-5xl` container.
- [ ] Query params ter-submit tanpa duplicate: `?from=X&to=Y&date=YYYY-MM-DD&adults=2&children=0&infants=0&trip=one-way&sort=earliest` (satu key per field).
- [ ] Autocomplete from/to jalan di kedua variant (Alpine state share).
- [ ] Passenger stepper: mobile expand in-place; desktop overlay `absolute top-full` dari passenger button.
- [ ] Swap button: mobile absolute ↕ (rotate-90); desktop inline ⇄ di kolom tengah.
- [ ] Resize dari mobile → desktop: state (fromQ, date, adults) terbawa lintas variant.

**Kenapa horizontal grid vs mempertahankan card centered?**
Pattern booking widget travel-industry (Traveloka, Skyscanner, 12Go) di
desktop selalu horizontal — memaksimalkan ruang layar wide, mengurangi
scroll, mendekatkan search fields dengan tombol submit sehingga alurnya
linear (kiri→kanan = baca→klik). Mobile tetap boarding-pass stacked
karena viewport sempit tidak mengakomodasi 4 kolom.

**Kenapa satu grid utama + sub-grid route (bukan 5 kolom flat)?**
Route (Origin + swap + Destination) adalah unit semantik tunggal. Sub-grid
`1fr auto 1fr` memberi swap button posisi tetap di tengah tanpa mengganggu
proporsi 2.2fr yang dialokasikan untuk route di grid utama. Kalau flat
5 kolom, swap button akan compete dengan Date/Passenger untuk space.

**Kenapa passenger stepper jadi absolute overlay di md+?**
In-place expand di horizontal layout akan menambah tinggi kolom passenger
saja, membuat grid `items-stretch` menarik semua kolom lain jadi tinggi,
menciptakan white-space kosong. Overlay dropdown mempertahankan tinggi
row + gestur familiar dari legacy widget.

**Fallback**: Legacy 5-column horizontal (`ServiceListingTicketSearchLegacy.astro`)
masih tersedia via env `TICKET_SEARCH_LEGACY=1`. Round 4 ini membuat
overhaul design (Round 3) juga responsif horizontal — jadi tidak perlu
lagi legacy toggle untuk kebutuhan horizontal desktop.

**Testing** (pending manual verify — dev server chat lain sedang jalan):
- [ ] Mobile 375×812: layout stacked boarding-pass tidak berubah.
- [ ] Tablet 768×1024: 4 kolom horizontal, semua field visible tanpa overflow.
- [ ] Desktop ≥1024: 4 kolom lebih lega, submit button tinggi penuh.
- [ ] Passenger stepper: mobile push layout in-place; desktop overlay dropdown, `@click.outside` close.
- [ ] Swap button: mobile absolute rotate-90; desktop inline di tengah dgn arrow horizontal.
- [ ] Combobox autocomplete tetap work (`x-model="fromQ"`, `filtered()`).
- [ ] Submit form: `?from=...&to=...&date=...` query params tetap ter-submit.

### Round 5 — Desktop/Tablet frame proporsional (labeled-field cells)
**Tanggal**: 2026-09-29
**File**: `apps/web/src/components/blocks/ServiceListingTicketSearch.astro`

**Request user (iterasi 4)**: "filter and search yang ada di /ferry-tickets
pada mode desktop dan tablet nya secara tampilan tidak pendek seperti saat
ini, saya mau tampilannya dari segi panjang dan tinggi frame itu lebih
proporsional. Take noted untuk mode mobile jangan diganggu, cukup perbaiki
mode desktop dan tablet."

**Problem Round 4**: variant desktop pakai satu baris input tipis
(`py-3`) di dalam container `p-3 lg:p-4` → total tinggi frame ~72px, terlihat
gepeng dibanding hero besar di atasnya. Ratio tinggi vs lebar terlalu
horizontal → tidak match dgn scale visual layout Ticket Search.

**Approach**: transform variant `hidden md:flex` (single-row inputs) menjadi
`hidden md:block` labeled-field card 3 baris:

```
┌─ Trip pill row (One Way / Round Trip Soon) ───────── (h~40px)
├─ Fields row inside inner tray bg-sand/40 rounded-2xl:
│   [icon+label+value cell] ⇄ [cell] [cell] [cell]     (h~76px per cell)
└─ Footer row: [Quick date chips] ─────────── [Submit] (h~48px)
```

**Perubahan class utama**:
- Container: `rounded-2xl shadow-xl border p-3 lg:p-4` → `rounded-3xl shadow-2xl border p-5 lg:p-6`.
- Fields row dibungkus inner tray `rounded-2xl bg-sand/40 border p-2 lg:p-2.5` supaya cells visual grouped + border halus, bukan flat.
- Setiap cell = mini boarding-pass style: icon box kecil (`p-2 rounded-xl bg-sand`) + micro-label uppercase `text-[10px] font-bold tracking-wider text-stone-light` + value bold `text-sm font-bold text-ocean tracking-tight`. Padding cell `px-4 py-3 lg:py-3.5`.
- Origin/Dest input reset ke bare (`p-0 border-0 bg-transparent`) supaya struktur label+value tetap terlihat rapi saat user mengetik.
- Date cell: label "Departure Date" + humanDate() sebagai display, native `<input type="date">` di-overlay `absolute inset-0 opacity-0` (sama pattern dgn mobile).
- Passenger cell: `<button>` full cell, dropdown stepper tetap `absolute top-full` overlay.
- Submit button naik ke `py-3.5 rounded-xl uppercase tracking-wide`.

**Kenapa pindah dari `md:flex` (single-row) ke `md:block` (multi-row)?**
Tinggi frame naik ~68% (~72px → ~200px) tanpa mengorbankan horizontal
layout Origin/Dest/Date/Passenger (mereka tetap side-by-side di dalam
fields row). Trip pill (yg dulu tidak ada di desktop, hanya mobile) sekarang
muncul di header desktop = fitur parity. Quick date chips (dulu mobile-only)
juga muncul di footer desktop = UX shortcut untuk booking hari ini/besok.

**Kenapa inner tray `bg-sand/40`?**
Membedakan area input dari container putih di luarnya (label header
di atas + submit footer di bawah) tanpa terlalu kontras. Cell putih di
atas tray sand memberi depth halus, mirip Trip.com booking widget.

**Kenapa cell padding vertikal `py-3.5` (bukan tetap `py-3`)?**
Dengan label micro (14px baseline) + value bold (20px baseline) + gap
antar = total ~44px konten. `py-3.5` (14px) di atas & bawah → cell height
~72px, memberi napas & match tinggi cell di reference (mobile boarding-
pass). `py-3` (12px) terasa cramped di density label+value ganda.

**Mobile tidak diubah**: block `md:hidden` (baris 229-448 di file) sama
persis dengan Round 3. Alpine state, methods, hidden inputs, script, style
juga tidak berubah.

**Testing** (pending manual verify — dev server chat lain masih jalan):
- [ ] Mobile 375×812: boarding-pass stacked card tidak berubah.
- [ ] Tablet 768×1024: frame putih rounded-3xl dgn trip pill di atas, 4 cells + swap di tengah, footer dgn quick chips + submit. Frame tinggi ~200px (dulu ~72px).
- [ ] Desktop ≥1024: sama seperti tablet, padding lebih besar (`p-6`, `gap-3`, `py-3.5`).
- [ ] Trip pill: One Way default. Round Trip disabled + Soon badge.
- [ ] Quick date chips (Today/Tomorrow/day-after) klik → date state update + input date reflect.
- [ ] Passenger dropdown stepper: `absolute top-full`, `@click.outside` close.
- [ ] Autocomplete Origin/Dest: dropdown muncul di bawah cell, hover highlight.
- [ ] Submit query params identik dgn Round 4 (satu key per field).

**Rollback**: `git revert <commit-round-5>` mengembalikan Round 4 single-row.
Legacy fallback `TICKET_SEARCH_LEGACY=1` masih tersedia untuk kembali ke
Round 2 (5-column horizontal). Mobile variant tidak terpengaruh baik commit
nor revert.

### Round 6 — Hero media (HeroImmersive parity) + wider box desktop/tablet
**Tanggal**: 2026-09-29
**File**: `apps/web/src/components/blocks/ServiceListingTicketSearch.astro`

**Request user (iterasi 5)**:
1. "Pada template Ticket Search saya mau tambahkan Hero, dan detail-nya
   sama dengan Hero yang ada di Layout Hero Immersive." — berlaku untuk
   semua breakpoint.
2. "Box dari Filter and search saya mau dipanjangkan lagi agar section
   yang ada di dalamnya tidak mepet dan tertumpuk" (lihat screenshot:
   label 'STARTING POINT' truncated jadi 'STARTING PO...', 'DESTINA...',
   'DEPARTU...'). — hanya untuk desktop dan tablet.

**Problem**:
1. Hero Round 5 hanya gradient `bg-gradient-to-br from-ocean via-ocean/85
   to-leaf` dengan tinggi `min-h-[280px] md:min-h-[360px]` (`heroMinHeight='md'`)
   — jauh lebih pendek dan tidak sematang HeroImmersive (`min-h-[520px] md:min-h-[560px]`).
   Editor tidak bisa upload image/video/slider ke hero Ticket Search.
2. Form widget di-wrap oleh `containerClass` yang default `max-w-5xl` (1024px).
   Setelah `p-6` outer + inner tray padding + 4 cell + swap + gap, per-cell
   sisa ~180px → label 10px truncate dan value tertumpuk.

**Approach**:

**A. Hero media parity dgn HeroImmersive**:
- Import `Media` type, tambah helper `asMedia`, `fitClass`, `posClass`, `parseVideo`.
- Baca 4 mediaType dari block: `single` (img `b.singleImage`), `multiple`
  (slider `b.imageSlider` array), `video` (`b.videoSource='file'` → `b.videoFile`
  atau `b.videoSource='url'` → `b.videoUrl`, support YouTube + Vimeo embed +
  file), `none` (gradient fallback).
- Overlay `bg-black opacity:{heroOverlayOpacity/100}` (default 40%).
- Fallback `singleImg` ke `serviceMeta.coverImage` (parity dgn Immersive).
- `heroMinHeightClass` di-upsize:
  - `sm: min-h-[420px]` (dari `240px md:300px`)
  - `md: min-h-[520px] md:min-h-[560px]` (dari `280px md:360px`)
  - `lg: min-h-[600px] md:min-h-[680px]` (dari `340px md:440px`)
  - `full: min-h-screen` (dari `60vh`)
- Padding hero content `py-16 md:py-20` (dari `py-10 md:py-14`).
- Heading typography `text-4xl md:text-5xl lg:text-6xl` (dari `text-3xl md:text-5xl`).
- Slider di-CSS + JS: class prefix `.tsh-slider` / `.tsh-slide` (mirror `.slh-*` HeroImmersive), 8 transisi (fade/slide/zoom/blur/wipe/parallax/none), interval configurable, autostart optional. Init guarded oleh `__inited` flag per element.

**B. Box wider di md+**:
- Wrapper form di-lepas dari `containerClass`. Sebelumnya:
  ```
  <div class:list={['relative z-20 mx-auto px-4 -mt-16 md:-mt-20', containerClass]}>
    <form class="max-w-lg md:max-w-none mx-auto">
  ```
  Sekarang:
  ```
  <div class="relative z-20 mx-auto px-4 -mt-14 md:-mt-16 w-full">
    <form class="max-w-lg md:max-w-6xl lg:max-w-[1360px] mx-auto">
  ```
- Efek: form md+ dapat 1152px (md) sampai 1360px (lg), independen dari
  `block.containerWidth` yang biasanya narrow/default (1024px atau kurang).
- Cell math (lg 1360px): container p-6=48px, inner tray p-2.5=20px, swap+gaps ~64px → 4 cell ~ 1228/4 = 307px per cell = lega, tidak truncate lagi.
- Mobile (`< md`) tidak berubah: `max-w-lg mx-auto`, boarding-pass card sama persis.

**Kenapa `max-w-[1360px]` bukan `max-w-7xl` (1280px)?**
Ferry punya 4 field + swap + trip pill di header + quick chips di footer.
Referensi Rental (HeroImmersive) pakai `max-w-5xl` untuk 3 field simple.
Ferry butuh lebar ekstra supaya per-cell tidak kurang dari 280px. 1360px
memberi margin buffer di viewport ≥1440px (desktop besar) sekaligus tetap
muat di viewport 1280px (px-4 = 32px total, form 1360px clamp otomatis
oleh viewport karena container `w-full` di atasnya).

**Kenapa hero pakai containerClass tapi form tidak?**
Hero content (eyebrow/heading/description) idealnya narrow (`max-w-3xl`
di dalam containerClass) supaya baris teks tidak terlalu panjang untuk
dibaca. Form widget kebalikan: butuh horizontal room untuk cells. Dua
subject beda = dua containment strategy beda.

**Kenapa `-mt-14 md:-mt-16` (sedikit lebih kecil dari `-mt-16 md:-mt-20` sebelumnya)?**
Hero lebih tinggi sekarang (~520-560px) → overlap ke bawah tetap terlihat
proporsional dgn negative margin lebih kecil. Overlap terlalu besar
membuat widget "menggantung" jauh dari edge hero.

**File changes**: hanya 1 file (`ServiceListingTicketSearch.astro`). Tidak
ada perubahan schema, tidak ada migration baru. Hero mediaFields sudah
ada di block schema (dipakai Editorial & Immersive) — Ticket Search
hanya mulai membacanya.

**Testing** (pending manual verify — dev server chat lain masih jalan):
- [ ] Mobile 375×812: boarding-pass card + hero gradient default (mediaType='none') tetap tidak berubah. Kalau editor set mediaType='single' + image → hero image muncul.
- [ ] Tablet 768: hero image full-bleed 520px+, box widget 1152px wide, 4 cell tidak truncate.
- [ ] Desktop 1440: hero 560px+, box 1360px wide, cell spacious.
- [ ] Slider `mediaType='multiple'`: transisi (fade/slide/zoom/blur/wipe/parallax/none) jalan sesuai `imageTransition`.
- [ ] Video `mediaType='video'`: YouTube/Vimeo embed autoplay muted loop; file → `<video>` autoplay muted loop.
- [ ] Overlay opacity: editor set 60% → dark overlay lebih pekat.
- [ ] Editor bisa set `heroMinHeight='lg'` → hero 600px/680px.

**Rollback**: `git revert <commit-round-6>` mengembalikan Round 5
(gradient-only hero + narrow box). Alpine state, mobile variant, widget
Round 5 tidak terpengaruh.

### Next Steps
- **Phase 4.64 — Service Section Visibility Framework** (tunggu request user)
- **Phase 4.65 — Round Trip booking flow**: schema Bookings 2 legs + checkout support outbound + return, aktifkan Round Trip pill di widget.
- **Phase 4.61.8** (opsional): media hero (image/video) untuk Ticket Search layout (currently gradient only) — reuse pattern dari `HeroImmersive`. Class/Type filter (Ekonomi/Emerald). Time-of-day filter.
- **Backfill Locations**: user isi `locationType` untuk lokasi non-ferry kalau ke depan add train-stations, dst.
