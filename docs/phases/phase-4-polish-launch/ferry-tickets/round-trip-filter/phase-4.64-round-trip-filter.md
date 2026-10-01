## Phase: 4.64 — Round Trip di Filter & Search
**Tanggal**: 2026-09-30
**Status**: Selesai (pending manual verify di frontend)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan pill **Round Trip** di widget Ticket Search (mobile + desktop),
menambah **Return Date card** conditional (`x-show="trip==='round-trip'"`)
dengan quick chips relatif departure (Same day / +2 / +3 / +7), dan
passthrough `trip` + `return` ke URL, sort form, dan href detail page.
Server API `POST /api/bookings/create` dapat guard defensif:
`return < departure` → `err=return_before_departure`;
`trip=round-trip` tanpa `return` → `err=missing_return_date`.
**Tidak ada schema change** — booking flow round-trip 2-leg tetap
ditunda ke Phase 4.65 (Bookings collection belum menerima returnDate).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | (1) Parse `qReturnDateRaw` + gate `qReturnDate` (hanya honor kalau trip=round-trip). (2) Add Alpine state `returnDate` + methods `addDaysISO`, `pickTrip`, `minReturn`, `quickReturn`, `humanReturnDate`, `returnBadge`, `syncReturn`. (3) `applyFilter()` sekarang call `syncReturn()` dulu + set `return` di URL saat round-trip. (4) Mobile pill Round Trip: hapus `disabled` + "Soon" badge, wire `@click="pickTrip('round-trip')"`. Desktop pill sama. (5) Mobile: Return Date card baru (leaf accent) di antara Date & Passenger, conditional. Quick chips return relatif departure. (6) Desktop: Return Date row baru sub-grid `md:col-span-6 md:col-start-7` di bawah main grid, conditional. Quick chips inline di lg+. (7) Hidden input `return` conditional bind (kosong kalau one-way). (8) Sort form passthrough `return`. (9) Card href builder pakai `URLSearchParams` — passthrough `date`, `trip`, `return`. |
| `apps/web/src/pages/api/bookings/create.ts` | Guard baru: reject `return < departure` (`return_before_departure`) dan `trip=round-trip` tanpa `return` (`missing_return_date`). Validate-only — tidak dipersist (schema Bookings 1-leg). |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Tambah 2 pesan Indonesia untuk error code baru di `errorMessages`. |
| `apps/cms/src/blocks/index.ts` | Update description `ticketEnableRoundTrip` — hilangkan "Coming soon", jelaskan bahwa filter sudah support & booking 2-leg tersisa di Phase 4.65. |

### Impact
- **Database**: none. Tidak ada migration baru. Bookings collection tetap 1-leg.
- **CMS**: field `ticketEnableRoundTrip` tetap sama; hanya deskripsi editor UI berubah. Editor yang sudah set `false` → pill row (dan return card) hilang total di kedua variant.
- **Frontend**: `?trip=round-trip&return=YYYY-MM-DD` sekarang state URL yang valid untuk Ticket Search block. Widget mempertahankan return date lintas resize (state Alpine share antar variant mobile & desktop). One-Way tetap default; switch ke Round Trip auto-set `returnDate = departureDate + 3` (fallback: `todayISO + 3` kalau departure kosong).
- **Routes**: none — tidak ada endpoint baru.
- **RBAC**: none.

### Design Decisions

**Kenapa filter-only (Opsi A1) bukan pairing preview atau split section?**
Listing tetap tampilkan outbound tickets saja (from→to). Return date hanya
persist ke URL & passthrough ke detail page. Detail page & checkout API
belum aware 2-leg — akan diselesaikan bersamaan di Phase 4.65 saat schema
Bookings ditambah `returnDate`, `returnFerryTicket`, `returnFerryClass*`.
Kalau kita rush A3 (split section outbound + return) sekarang, checkout
akan bingung leg mana yang harus dibook — inconsistent UX.

**Default return = departure + 3 hari**
Pola booking travel paling umum (weekend trip / long weekend). Kalau user
mau lain, quick chips (Same day / +2 / +3 / +7) atau native date picker
tersedia. `pickTrip('one-way')` juga auto-clear `returnDate` supaya URL
tidak carry orphan value.

**Kenapa `return` hidden input bind conditional (kosong saat one-way)?**
Alpine `x-bind:value="trip === 'round-trip' ? returnDate : ''"` mencegah
form submit `?return=YYYY-MM-DD` ketika user switch ke one-way sesaat
sebelum submit — supaya server tidak dapat kombinasi absurd
(`trip=one-way&return=2026-10-05`).

**Kenapa server guard tanpa persist ke Bookings?**
Booking flow round-trip belum aktif — form checkout Ferry Ticket hanya
punya 1 date field. Kalau user browser bypass dan POST `return=` ke
`/api/bookings/create`, kita reject supaya tidak masuk state pending
1-leg dengan data return yang hilang. Ini defensive posture sampai
Phase 4.65 aktifkan flow penuh.

**Quick chips return relatif departure, bukan `today`**
Semantik: "berapa lama nginap" — makes sense relatif keberangkatan.
`quickReturn(off)` compute `departure + off`; `humanReturnDate()`
tampilkan absolute date. `returnBadge()` tampilkan `+Nd` diff supaya
user lihat sekilas.

**Auto-clear via `syncReturn()` di `applyFilter()` bukan `x-effect`**
`x-effect` untuk auto-clear akan trigger tiap user ketik date input
karakter per karakter (invalid intermediate states). Cukup validate saat
submit — kalau `return < departure` di state, di-clear sebelum push URL.

### Testing (manual — pending user verify)
- [ ] `/ferry-tickets`: pill "Round Trip" tidak lagi disabled, badge "Soon" hilang di mobile & desktop.
- [ ] Klik "Round Trip": Return Date card muncul di mobile (leaf accent, di antara Date & Passenger) & di desktop (sub-grid col-start-7, di bawah main grid).
- [ ] Return Date default: departure + 3 hari kalau departure sudah dipilih, else today + 3.
- [ ] Klik "One Way": Return Date card hilang, `returnDate` di-clear.
- [ ] Quick chip mobile "+3 days": `returnDate = departure + 3`. Kalau departure kosong → dari today.
- [ ] Quick chips desktop (lg+): visible inline di dalam card, klik update state (event `.stop` supaya tidak trigger native date picker).
- [ ] Native date picker return: `min` = departure (atau today kalau departure kosong).
- [ ] Ganti departure ke tanggal setelah return → submit filter → `returnDate` auto-clear (`syncReturn()`).
- [ ] Submit round-trip: URL berisi `?trip=round-trip&return=YYYY-MM-DD&...`.
- [ ] Submit one-way: URL tidak berisi `return` (hidden input bind kosong).
- [ ] Sort dropdown pertahankan `return` param kalau ada.
- [ ] Card outbound klik → detail URL passthrough `?date=&trip=round-trip&return=`.
- [ ] CMS `ticketEnableRoundTrip = false` → pill row & Return Date card hilang di kedua variant.
- [ ] `TICKET_SEARCH_LEGACY=1`: legacy variant tidak diubah (masih tanpa Round Trip). OK sebagai backup.
- [ ] Server: POST manual dgn `trip=round-trip` tanpa `return` → 302 `err=missing_return_date` → pesan Indonesia muncul di checkout page.
- [ ] Server: POST manual dgn `return=2020-01-01&departureDate=2027-01-01` → 302 `err=return_before_departure` → pesan Indonesia.
- [ ] Bookmark link `?trip=one-way&return=2027-01-01` → `qReturnDate = ''` (gated), Return Date card tidak muncul.

### Rollback
1. Widget: `git revert <commit-4.64>` mengembalikan pill Round Trip disabled + "Soon" badge dan menghapus Return Date UI + state.
2. Server API: revert menghapus 2 guard defensif — endpoint kembali tidak validate `return`.
3. CMS description: revert mengembalikan copy lama "Coming soon".
4. Tidak ada migration untuk di-rollback (schema tak berubah).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.64-round-trip-filter.md` (file ini)
- [x] `docs/PROGRESS.md` (add entry — lihat commit terpisah)
- [ ] `docs/03-CONTENT-MODEL.md` — tidak perlu update (field CMS tidak berubah, hanya deskripsi UI).

### Next Steps
- **Phase 4.65 — Round Trip booking flow (2-leg)**:
  - Schema Bookings tambah `tripType`, `returnDate`, `returnFerryTicket`, `returnScheduleTimeLabel`, `returnFerryClassName`, `returnFerryClassType`, `returnUnitPrice`, `returnTotalEstimate`.
  - Migration additive (non-destructive, all defaultable).
  - Detail page ferry: mode round-trip → sidebar 2 date + selector ticket return.
  - Checkout page: baris "Return trip" di summary, hidden input `returnDate` & `returnFerryTicketId`.
  - `createBooking` accept 2-leg snapshot.
  - WA message template render 2 legs (outbound + return).
  - Confirmation page tampilkan 2 legs.
  - Hapus guard `missing_return_date` di API kalau checkout page sudah bisa render return picker (guard tetap defensif untuk direct POST).
