## Phase: 4.67.2e — API `/api/bookings/create` 2-Leg Persist

**Tanggal**: 2026-10-07
**Status**: Selesai (pending manual smoke test — submit booking round-trip ke DB)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan **persist 2-leg** di endpoint `POST /api/bookings/create`.
Form field `tripType=round-trip` → endpoint:
(1) **Validate** `returnDate` (format YYYY-MM-DD, >= departureDate, >= today),
(2) **Verify** `returnFerryTicketId` via `getFerryForCheckout` (status
published + sanity check slug match + classes non-empty),
(3) **Recompute** `returnUnitPrice` + `returnTotalEstimate` dari CMS
(fallback childPrice = 50% unitPrice, konsisten dgn outbound),
(4) **Sanity check reverse route**: `returnOrigin.id === outboundDest.id`
AND `returnDest.id === outboundOrigin.id` → reject `return_route_mismatch`,
(5) **Currency check**: outbound + return harus sama → reject
`return_currency_mismatch` (per audit §11),
(6) **Snapshot** semua return fields (`returnOriginLocation`,
`returnDestinationLocation`, `returnScheduleTimeLabel`,
`returnFerryClassName`, `returnFerryClassType`) ke `createBooking`
payload,
(7) **`totalEstimate` di-persist = grand total** (outbound + return).

Mode one-way (`tripType=one-way` atau kosong): **ZERO perubahan
behaviour** — endpoint skip blok return processing, kirim `tripType='one-way'`
+ semua `returnXxx: null` ke createBooking. Validasi outbound (4.66.4)
tetap sama.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/api/bookings/create.ts` | (1) Parse `tripType` + `isRoundTrip` + `returnDate` dari form, ganti guard legacy 4.64 (`missing_return_date` / `return_before_departure`) dgn validasi lengkap: round-trip wajib returnDate valid + >= departureDate + >= today (new err `past_return_date`). (2) Setelah outbound ferry processing: blok `if (isRoundTrip) { ... }` fetch return ferry, verify (status/slug/classes/price), reverse-route check via `locationId()` helper, currency match, recompute pricing, snapshot locations/schedule/class. (3) `grandTotal = totalEstimate + returnTotalEstimate` dipakai sebagai `totalEstimate` di createBooking payload. (4) Payload tambah 10 field: `tripType`, `returnDate`, `returnFerryTicket`, `returnOriginLocation`, `returnDestinationLocation`, `returnScheduleTimeLabel`, `returnFerryClassName`, `returnFerryClassType`, `returnUnitPrice`, `returnTotalEstimate`. One-way: semua null kecuali `tripType='one-way'`. (5) Doc header updated. |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Tambah 8 entri di `errorMessages` map: `past_return_date`, `invalid_return_ferry`, `return_ferry_not_found`, `return_ferry_slug_mismatch`, `return_ferry_no_class`, `return_ferry_no_price`, `return_route_mismatch`, `return_currency_mismatch`. English copy, display di error banner box coral di atas form saat visitor di-redirect dari endpoint. |

### Impact
- **Database**: none — field schema sudah ada sejak 4.67.2a; 4.67.2e cuma kirim data ke sana.
- **CMS**: none.
- **Frontend**: checkout page sekarang menerima 8 err code baru untuk display (menggantikan fallback generic "Something went wrong").
- **Routes**: `/api/bookings/create` — 8 err code baru (plus pertahankan existing).
- **RBAC**: none.

### Design Decisions

**Validasi `>= today` untuk returnDate**
Mirror pola outbound (`past_departure_date` guard). Mencegah booking
return di masa lalu — rare tapi defensive (bookmark lama + form stamp
expired → user bisa submit tanggal lampau).

**Reverse-route check lenient (skip saat location.id null)**
Legacy ferry data mungkin pakai enum `origin`/`arrival` string tanpa
relationship. `locationId()` return null untuk kasus ini. Skip check =
graceful fallback (data lama tetap bisa book round-trip walau tanpa
sanity reverse). New data (phase 4.61+) wajib pakai relationship →
check aktif. Trade-off: 1 attack vector untuk legacy data, zero impact
untuk data current.

**Currency match reject (bukan konversi)**
Audit §11 keputusan: reject multi-currency di MVP, defer FX conversion
ke phase payment gateway (5+). Konsekuensi: operator yang punya route
Batam→Singapore (IDR) + Singapore→Batam (SGD) tidak bisa dibook sebagai
round-trip di sini. Workaround: admin pastikan `ferryClasses[].currency`
konsisten per route-pair.

**One-way kirim `tripType='one-way'` explicit (bukan null)**
Konsisten dgn pola `serviceType` + `status` di collection — enum
NOT NULL default. One-way submission dari form 4.67.2d sekarang
include `<input type="hidden" name="tripType" value="one-way" />`.
Admin melihat kolom "Trip Type" di list = selalu ada value, tidak
pernah blank.

**Return fields di payload: null untuk one-way (bukan absent)**
Payload REST API: field dgn value `undefined` di JSON body → tidak
di-set. Field dgn `null` → explicit null di DB. Pakai `null` memberi
clean DB state (bukan "mungkin ada mungkin tidak"). Konsekuensi: tiap
booking punya baris 10 kolom return — kosong untuk one-way, berisi
untuk round-trip. Admin bisa filter by `tripType` atau cek
`returnFerryTicket IS NULL`.

**Idempotency: no deduplication at API level**
Rate-limit (5 submit / 15 min / IP hash) sudah ada di Phase 4.62.2.
Belum ada idempotency key — user double-submit = 2 booking. Acceptable
untuk MVP; payment gateway nanti (Xendit/Midtrans) akan handle idempotency
via invoice id. Phase 4.67+ bisa tambah form-level idempotency token
kalau terbukti problem.

**Session timer (4.67.1) tidak terdampak**
Timer 15 menit di sidebar hanya client-side guard. API endpoint tidak
tahu / tidak peduli timer status — ia validate `formStamp` TTL 30
menit (margin aman). Round-trip submission tetap tunduk pada
`stamp_expired` kalau user idle > 30 menit.

### Smoke Test — API 2-Leg Submission (Phase 4.67.2a → 4.67.2e Complete)

> **Prerequisite**: SETUP 2 Ferry Tickets dgn reverse route sudah
> dilakukan (lihat phase-4.67.2d doc). CMS dev + web dev running.
> `apps/cms/.env` sudah set `PAYLOAD_API_KEY` (dari Phase 4.62.1 flow).

#### Smoke Test 4: Full Round-Trip Submit (ULTIMATE E2E)
**Tujuan**: booking round-trip tersimpan di DB sebagai 1 record 2-leg.

1. Jalankan Smoke Test 2 (phase-4.67.2d doc) step A–D sampai sampai di checkout page round-trip (step 19-20).
2. **DI STEP 20**: verify kalkulasi grand total manual di sidebar:
   - Outbound subtotal: `adults × unitPrice_outbound + children × childPrice_outbound`
   - Return subtotal:   `adults × unitPrice_return  + children × childPrice_return`
   - Total price = outbound + return. Match dgn display.
3. Isi form:
   - Contact: Full Name "Test User", Email "test@example.com", Phone "+62 812-3456-7890", Country "Indonesia".
   - Passenger 1 (adult): First "Test", Last "Adult", DOB any past date, Passport "A1234567" (opsional), Passport Expiry = minimal 6 bulan setelah departure.
   - Passenger 2 (child, kalau ada): First "Test", Last "Child", DOB.
4. Klik **"Continue to Booking Confirmation"**.
5. ✅ **Expect**: redirect ke `/checkout/ferry-tickets/confirmation/<FT-ref>?t=<token>`. Zero err.
6. **Verify di CMS admin** (`localhost:3030/admin/collections/bookings`):
   - Buka row terbaru (sorted by createdAt desc).
   - Sidebar: **Trip Type = "Round Trip"** (badge visible).
   - Collapsible **"Return Trip"** TAMPIL (hanya saat round-trip).
   - Field terisi:
     - `returnDate` = tanggal yg di-pick di widget.
     - `returnFerryTicket` relationship ke Ferry B.
     - `returnOriginLocation` = destination outbound (mis. "Singapore").
     - `returnDestinationLocation` = origin outbound (mis. "Batam").
     - `returnScheduleTimeLabel` (kalau outbound scheduleTimeLabel ada).
     - `returnFerryClassName` + `returnFerryClassType` sesuai pick (atau cheapest default).
     - `returnUnitPrice` = Ferry B's cheapest/picked adultPrice.
     - `returnTotalEstimate` = adults*return_adult + children*return_child.
   - Field outbound tetap terisi (unchanged).
   - `totalEstimate` di main row = outbound + return (grand total).
7. (Opsional) Query DB langsung:
   ```sql
   SELECT booking_ref, trip_type, departure_date, return_date,
          origin_location, destination_location,
          return_origin_location, return_destination_location,
          unit_price, return_unit_price, total_estimate
   FROM bookings ORDER BY id DESC LIMIT 1;
   ```
   ✅ Expect: `trip_type='round-trip'`, both legs filled, `total_estimate` = sum.

**Pass criteria**: step 5 (redirect sukses) + step 6 (10 field return terisi benar di admin).

---

#### Smoke Test 5: API Validation Errors (round-trip)
**Tujuan**: 8 err code baru fire dengan benar.

Jalankan via browser DevTools / curl. Gunakan form yang di-render di checkout round-trip (atau direct POST). Verify setiap case redirect ke `/checkout/ferry-tickets/<slug>?err=<CODE>` + display error banner English yg sesuai.

| Test | Modify form | Expected err code |
|------|-------------|-------------------|
| 1 | `tripType=round-trip` + hapus `returnDate` | `missing_return_date` |
| 2 | `tripType=round-trip` + `returnDate=2020-01-01` | `past_return_date` |
| 3 | `tripType=round-trip` + `returnDate` < `departureDate` | `return_before_departure` |
| 4 | `tripType=round-trip` + hapus `returnFerryTicketId` | `invalid_return_ferry` |
| 5 | `tripType=round-trip` + `returnFerryTicketId=999999` (non-existent) | `return_ferry_not_found` |
| 6 | `tripType=round-trip` + `returnFerryTicketId=<ferryB.id>` + `returnTicketSlug=wrong-slug` | `return_ferry_slug_mismatch` |
| 7 | Setup: Ferry B dgn classes DIHAPUS semua. Submit round-trip. | `return_ferry_no_class` |
| 8 | `returnFerryClassType=nonexistent` + Ferry B class pricing invalid | `return_ferry_no_price` (jarang, fallback cheapest biasanya cover) |
| 9 | Setup: Ferry B route = Jakarta→Bali (bukan reverse Batam↔Singapore). Submit round-trip pakai Ferry B sebagai return. | `return_route_mismatch` |
| 10 | Setup: Ferry B's `ferryClasses[0].currency='SGD'` (beda dgn outbound IDR). | `return_currency_mismatch` |

**Pass criteria**: 10/10 err code benar + banner English display sesuai.

---

#### Smoke Test 6: One-Way Regression After 4.67.2e
**Tujuan**: pastikan jalur one-way masih persist 1-leg utuh.

1. Jalankan Smoke Test 1 (phase-4.67.2d doc) step 1-9 sampai checkout page one-way.
2. Isi form + submit.
3. ✅ Expect: redirect ke confirmation page sukses.
4. Verify di admin booking terbaru:
   - **Trip Type = "One Way"** (badge).
   - Collapsible "Return Trip" **TIDAK TAMPIL** (condition `tripType === 'round-trip'` false).
   - Field return di DB: `return_date=NULL`, `return_ferry_ticket_id=NULL`, dst — zero data loss.
   - `total_estimate` = outbound saja (sama seperti pre-4.67.2e).
5. (Opsional) Query DB:
   ```sql
   SELECT trip_type, return_date, return_ferry_ticket_id, total_estimate
   FROM bookings ORDER BY id DESC LIMIT 1;
   ```
   ✅ Expect: `trip_type='one-way'`, return fields NULL.

**Pass criteria**: booking one-way tersimpan bersih, tanpa field return accidentally terisi.

---

### Rollback
`git revert <commit-4.67.2e>` → 2 file:
- `apps/web/src/pages/api/bookings/create.ts`: kembalikan guard legacy
  (missing_return_date / return_before_departure di awal) + hilangkan
  blok return processing + payload tanpa tripType/return*. One-way flow
  tetap jalan 100%. Round-trip submission akan treated as 1-leg (return
  fields diabaikan — data loss di submission antara deploy & rollback,
  acceptable karena schema 4.67.2a tetap, booking existing utuh).
- `apps/web/src/pages/checkout/ferry-tickets/[slug].astro`: hilangkan 8
  entri err baru di errorMessages (fallback generic kicks in).

Zero schema change rollback (field 4.67.2a tetap).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2e-api-2leg-persist.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru
- [ ] `docs/03-CONTENT-MODEL.md` — tidak perlu update (CMS field tidak berubah; 4.67.2a sudah cover).

### Next Steps
- **4.67.2f** — Confirmation page `/checkout/ferry-tickets/confirmation/[ref].astro`:
  deteksi `tripType === 'round-trip'` dari booking record → render **2
  `TicketRouteCard`** stack vertical (Outbound + Return) dgn header
  section "Outbound trip" + "Return trip". Shared passenger summary
  (1 block untuk 2 leg, konsisten dgn asumsi `passengers[]` shared).
- **4.67.2g** — WhatsApp message template (`apps/web/src/lib/checkout/channels/*`):
  render 2 block "🚢 Outbound" + "🚢 Return" di pesan WA.
- **4.67.2h** — (hapus guard `missing_return_date` di API) — sudah
  dilakukan di 4.67.2e scope. Mark sub-phase done.
