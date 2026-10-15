## Phase: 4.67.2 — Round Trip Booking Flow (AUDIT & SKEMA, pre-eksekusi)

**Tanggal**: 2026-10-06
**Status**: Draft audit — belum eksekusi, menunggu approval user
**Dikerjakan oleh**: Claude Code (audit only, zero file berubah)

> File ini adalah **audit + rekomendasi skema**. Tidak ada perubahan kode
> dalam fase ini. Setelah user baca & setuju arah, eksekusi dipecah ke
> sub-phase (4.67.2a schema, 4.67.2b UI detail, 4.67.2c checkout, dst).

---

### 1. Ringkasan Masalah

Phase 4.64 (2026-09-30) **sudah mengaktifkan filter Round Trip** di widget
`ServiceListingTicketSearch` — pill "Round Trip" aktif, Return Date card
muncul conditional, URL carry `?trip=round-trip&return=YYYY-MM-DD`.

Tapi semua layer SETELAH widget filter masih **1-leg**:

| Layer | Status 1-leg saat ini | Yang dibutuhkan untuk round-trip |
|-------|-----------------------|----------------------------------|
| Detail page `/ferry-tickets/[slug]` | Sidebar 1 date picker + 1 class selector | 2 date picker, 2 class selector (ATAU wizard 2 langkah) |
| Checkout page `/checkout/ferry-tickets/[slug]` | 1 Trip Details strip, 1 price breakdown | 2 strip (Outbound + Return), 2 breakdown row |
| API `POST /api/bookings/create` | Verify 1 ferry + recompute 1 harga | Verify 2 ferry + recompute 2 harga |
| Collection `Bookings` | 1 set field snapshot (departureDate, ferryTicket, …) | Tambah 1 set field untuk leg return |
| Confirmation page | 1 route card | 2 route card (Outbound + Return) |
| WhatsApp message | 1 leg | 2 leg |

Guard server di `POST /api/bookings/create` saat ini **reject** kombinasi
`trip=round-trip` tanpa `return` (`err=missing_return_date`) — artinya
sampai Phase 4.67.2 live, visitor yang pilih Round Trip di filter TIDAK
BISA sampai halaman confirmation. Ini aman (fail-closed), bukan broken.

---

### 2. Pertanyaan Desain yang Harus Dijawab DULU

Sebelum tulis skema, 4 keputusan user yang menentukan arah implementasi:

#### Q1. Return ferry = ferry yang sama (reverse route) atau boleh beda ferry?

- **Opsi A (auto-reverse)**: User hanya pilih tanggal return. Sistem
  auto-cari ferry yang route-nya kebalikan outbound (origin↔destination
  swap) di tanggal return. Kalau tidak ada → fallback: pakai ferry yang
  sama (anggap PP). Paling SIMPLE, cocok kalau operator kecil (1-2 ferry
  wira-wiri route itu-itu saja).
- **Opsi B (user pick)**: User pilih ferry return secara eksplisit —
  bisa beda operator, beda jam, beda kelas. Butuh **2-step wizard**:
  (1) pilih outbound di `/ferry-tickets/[slug]`, (2) redirect ke
  `/ferry-tickets?origin=X&destination=Y&date=returnDate` yang
  pre-filtered reverse. Setelah pilih outbound+return baru lanjut
  ke checkout. Lebih fleksibel, mirror pola Traveloka / 12Go.
- **Opsi C (hybrid)**: Default auto-reverse (Opsi A) + link "pick a
  different return ferry" yang trigger Opsi B.

**Rekomendasi Claude:** **Opsi B (2-step wizard)**. Alasan: (a) real-world
schedule ferry PP sering beda operator / jam / harga; auto-reverse akan
over-fit ke 1 operator dan menyembunyikan pilihan sah lain, (b) UX ini
sudah familiar (Traveloka, 12Go, Direct Ferries) — zero learning curve
visitor, (c) existing listing `/ferry-tickets` sudah punya filter
origin+destination+date, tinggal passthrough state.

#### Q2. Return ticket boleh **kelas berbeda** dari outbound?

- **Opsi A**: Tidak — class di-lock sama. Lebih simpel, 1 selector.
- **Opsi B**: Ya — tiap leg boleh beda kelas (mis. Ekonomi berangkat,
  Emerald pulang). Butuh 2 selector `classType` di snapshot.

**Rekomendasi:** **Opsi B**. Marginal cost di schema (1 field tambahan
`returnFerryClassType`), tapi kehilangan sales kalau user mau upgrade
leg return doang.

#### Q3. Return booking = **1 record Bookings** atau **2 record linked**?

- **Opsi A — Satu record flat** (field tambahan `returnDate`,
  `returnFerryTicket`, dst di collection `Bookings`): konsisten dgn pola
  snapshot flat yang sudah ada (`departureDate`, `ferryTicket`, dst).
  Zero refactor hooks/API baru di collection. Admin melihat 1 baris di
  list = 1 trip (lebih dekat dgn mental model customer).
- **Opsi B — Array `legs` di Bookings**: refactor besar — semua kode yang
  sudah membaca `bookingRef.departureDate` (confirmation page, WA
  template, pricing calc) harus diubah ke `bookingRef.legs[0].…`. Lebih
  "benar" arsitektur-nya kalau nanti support **multi-city** (3+ legs,
  mis. Bali→Lombok→Komodo→Bali). Tapi hari ini kita cuma butuh 2 leg.
- **Opsi C — Dua record Bookings linked by groupRef**: paling isolasi
  (tiap leg bisa confirmed independen di payment gateway nanti), tapi
  double query di confirmation page + WA + report; `bookingRef` yang
  dikasih ke customer jadi ambigu (`FT-...-A` vs `FT-...-B`?).

**Rekomendasi:** **Opsi A untuk sekarang**, dgn migrasi path ke Opsi B
kalau nanti multi-city dibutuhkan. Alasan: scope round-trip = 2 leg
hard-coded, YAGNI untuk array. Migration path B tetap aman karena kita
cukup tambah array `legs` dan backfill 2 row per booking existing.

#### Q4. `bookingRef` untuk round-trip = 1 ref atau 2 ref?

- **Opsi A** — 1 ref (`FT-20261006-A1B2C3`) covers both legs. Customer
  terima 1 WA message berisi 2 leg. Konsisten dgn Opsi A di Q3.
- **Opsi B** — 2 ref (`FT-20261006-A1B2C3-OUT` + `-RET`). Hanya masuk
  akal kalau Q3=C.

**Rekomendasi:** **Opsi A** (1 ref). Satu transaksi = satu ref.

---

### 3. Rekomendasi Skema (ringkas eksekutif)

Berdasarkan Q1=B, Q2=B, Q3=A, Q4=A:

```
UX  : 2-step wizard
       Step 1 — detail outbound ferry (existing) → tombol "Continue"
       Step 2 — listing return (reverse route + returnDate preset) →
                pilih return ferry → tombol "Review booking"
       Step 3 — checkout page (existing) + strip "Return trip" extra
Data: 1 Bookings record dgn flat fields untuk leg return (tripType,
       returnDate, returnFerryTicket + 4 snapshot fields + returnUnitPrice
       + returnTotalEstimate)
Ref : 1 bookingRef, 1 accessToken
WA  : 1 pesan, dua block "Outbound" + "Return"
```

---

### 4. Rencana Schema Change (`apps/cms/src/collections/Bookings.ts`)

**Field baru** (semua **optional** supaya migration non-destructive dan
booking 1-leg existing tetap valid):

| Field | Type | Index | Keterangan |
|-------|------|-------|------------|
| `tripType` | select `one-way` / `round-trip` | — | Default `one-way`. Driver untuk render return block di admin. |
| `returnDate` | date | — | Tanggal return. `>= departureDate` divalidasi di endpoint. |
| `returnFerryTicket` | relationship → `ferry-tickets` | yes | Rujukan ferry leg return. |
| `returnScheduleTimeLabel` | text | — | Snapshot `"HH:mm → HH:mm"` leg return. |
| `returnFerryClassName` | text | — | Snapshot nama kelas leg return. |
| `returnFerryClassType` | text | — | Snapshot `classType` leg return (`ekonomi`/`emerald`/…). |
| `returnOriginLocation` | text | — | Snapshot origin leg return (= destination outbound). |
| `returnDestinationLocation` | text | — | Snapshot destination leg return (= origin outbound). |
| `returnUnitPrice` | number | — | Harga adult leg return (snapshot). |
| `returnTotalEstimate` | number | — | Total leg return (adults×unitPrice + children×childPrice). |

**Hal yang TIDAK diubah:**

- `departureDate`, `ferryTicket`, `scheduleTimeLabel`, `ferryClassName`,
  `ferryClassType`, `unitPrice`, `totalEstimate` → tetap sebagai field
  **leg outbound**. Nama tidak perlu rename untuk hindari migration cascade.
- `adults`, `children`, `passengers[]` → **shared** antara 2 leg
  (asumsi: jumlah penumpang sama di outbound dan return). Kalau ada
  kebutuhan beda nanti → tambah `passengersReturn[]`, tapi hari ini NO.
- `currency` → tetap 1 field. Asumsi: round-trip tidak campur IDR+SGD.
  Kalau beda → aggregate dalam IDR saja.
- `totalEstimate` di-upgrade meaning jadi **grand total** (outbound +
  return) kalau `tripType=round-trip`, else tetap outbound saja. Supaya
  "list column" admin tetap akurat tanpa compute.

**Migration file** (nama kandidat):
`src/migrations/20261006_HHMMSS_phase_4_67_2_bookings_roundtrip.ts`

Semua `ALTER TABLE … ADD COLUMN … NULL` → zero data loss, zero
breaking change. Booking 1-leg existing: `tripType=NULL` → UI treat as
`one-way`.

**Rollback:** `pnpm schema:down` membalik migration; booking 1-leg
TIDAK terpengaruh. Booking round-trip yang sudah terlanjur dibuat
antara deploy & rollback akan kehilangan field return (tapi `departureDate`
+ leg outbound tetap utuh — fallback ke 1-leg).

---

### 5. Rencana Perubahan Detail Page (`/ferry-tickets/[slug].astro`)

**Mode detect:** Baca `url.searchParams.get('trip')`. Jika `round-trip`:

1. Sidebar sticky dapat tombol baru label **"Continue to pick return"**
   (menggantikan "Continue to checkout") untuk round-trip mode.
2. Tombol redirect ke:
   ```
   /ferry-tickets?origin=<destinationLocationId>
                 &destination=<originLocationId>
                 &date=<returnDate>
                 &trip=round-trip
                 &return=<returnDate>
                 &outbound=<thisFerryId>
                 &outboundDate=<departureDate>
                 &outboundClass=<classType>
                 &adults=N&children=M
   ```
3. **One-way mode**: tidak berubah — tombol lanjut langsung ke checkout.

**Kenapa pakai URL state (bukan sessionStorage/cookie)?**
Astro SSG + Cloudflare Pages = stateless. URL = single source of truth,
shareable, bookmarkable, dan tahan refresh.

---

### 6. Rencana Perubahan Listing Page (`/ferry-tickets/index.astro`)

Mode "pick return": kalau URL carry `outbound=<id>&outboundDate=…`:

1. Banner atas listing: "Choose your return trip — Thursday 15 Oct 2026,
   Singapore → Batam" + chip "Outbound: Ekonomi · Batam→Singapore
   · 10 Oct · from IDR 350k · [Change]".
2. Setiap card ferry di listing: tombol "Select return" (bukan "View
   details"). Klik → redirect langsung ke:
   ```
   /checkout/ferry-tickets/<outboundSlug>
        ?date=<outboundDate>&class=<outboundClass>
        &adults=N&children=M
        &trip=round-trip&return=<returnDate>
        &returnFerryId=<pickedReturnId>
        &returnClass=<pickedReturnClass>
   ```
3. Filter listing di mode ini: lock `origin` + `destination` (swap dari
   outbound), lock `date=return`, hide trip pill (user sudah commit ke
   round-trip).

**Alternatif ringkas (fallback):** kalau implementasi listing-mode kompleks,
MVP cukup redirect ke listing BIASA dgn URL `?origin=…&destination=…&date=…`,
tanpa banner / tanpa lock — visitor klik ferry mana saja → masuk detail
return → di detail return baru redirect ke checkout. Trade-off: 1 extra
click (detail→checkout) tapi UI reuse 100%.

**Rekomendasi:** MVP = alternatif ringkas. Banner + button polish =
Phase 4.67.3 (polish, bukan blocker).

---

### 7. Rencana Perubahan Checkout Page

Sekarang: 1 strip "Trip Details" read-only + 1 price breakdown row.

Round-trip: 2 strip (Outbound + Return) + 2 breakdown row.

**Hidden input tambahan** (semua di `<form method="POST" action="/api/bookings/create">`):

```html
<input type="hidden" name="tripType" value="round-trip" />
<input type="hidden" name="returnDate" value="2026-10-15" />
<input type="hidden" name="returnFerryTicketId" value="42" />
<input type="hidden" name="returnFerryClassType" value="ekonomi" />
```

**Price breakdown** dapat section tambahan:

```
Departure (Mon, 10 Oct)
  Adult (2 × IDR 350.000)      IDR 700.000
  Child (1 × IDR 175.000)      IDR 175.000
  Subtotal (Departure)         IDR 875.000

Return (Thu, 15 Oct)
  Adult (2 × IDR 320.000)      IDR 640.000
  Child (1 × IDR 160.000)      IDR 160.000
  Subtotal (Return)            IDR 800.000

Total                          IDR 1.675.000
```

**Guard di checkout page** (SSR): kalau `trip=round-trip` tapi
`returnFerryId` / `returnDate` kosong → redirect ke
`/ferry-tickets/<outboundSlug>?err=needs_return_ferry&…`.

---

### 8. Rencana Perubahan API `POST /api/bookings/create`

**Guard baru (hapus `missing_return_date`):**

- Jika `tripType=round-trip`:
  - `returnDate` wajib, format `YYYY-MM-DD`, >= `departureDate`.
  - `returnFerryTicketId` wajib, resolve via `getFerryForCheckout` (reuse
    helper existing).
  - Verify return ferry: `status === 'published'`, `ferryClasses` non-empty.
  - Pick `returnCls` dari `returnFerryClassType` (fallback cheapest, sama
    pola outbound).
  - Recompute `returnUnitPrice` + `returnTotalEstimate` dari CMS record.
  - **Sanity check**: `returnOriginLocation.id === outboundDestinationLocation.id`
    (dan vice versa) — kalau tidak match, reject `err=return_route_mismatch`.
    Alasan: cegah visitor book `A→B` outbound + `C→D` return yang
    kombinasinya bukan round-trip real.
- Jika `tripType=one-way` atau kosong: field return diabaikan (bahkan
  kalau terkirim).

**`createBooking` payload**: tambah `tripType`, `returnDate`,
`returnFerryTicket`, `returnScheduleTimeLabel`, `returnFerryClassName`,
`returnFerryClassType`, `returnOriginLocation`, `returnDestinationLocation`,
`returnUnitPrice`, `returnTotalEstimate`.

**`totalEstimate` saat round-trip**: outbound total + return total.

---

### 9. Rencana Perubahan Confirmation Page & WhatsApp Message

**Confirmation page** (`/checkout/ferry-tickets/confirmation/[ref].astro`):

- Kalau `booking.tripType === 'round-trip'` → tampilkan 2 `TicketRouteCard`
  (Outbound + Return) stack vertical, dgn label section "Outbound trip" dan
  "Return trip".
- Satu passenger summary (shared antara 2 leg).

**WA message template** (`apps/web/src/lib/checkout/channels/manualWa.ts`
atau serupa — perlu verify path saat eksekusi):

```
*Ferry Ticket Booking — FT-20261006-A1B2C3*

👤 John Doe · 2 Adults · 1 Child
📞 +6281234567890 (WA)

🚢 *Outbound* — Mon, 10 Oct 2026
Batam → Singapore · 08:00 → 09:15 · Ekonomi
IDR 875.000

🚢 *Return* — Thu, 15 Oct 2026
Singapore → Batam · 17:30 → 18:45 · Ekonomi
IDR 800.000

*Total: IDR 1.675.000*

Please confirm this booking.
```

---

### 10. Rangkuman Breakdown Sub-Phase (eksekusi berurutan)

| Sub-phase | Scope | Deploy risk |
|-----------|-------|-------------|
| **4.67.2a** | Schema Bookings + migration + `generate:types` | low (additive) |
| **4.67.2b** | Detail page round-trip mode (continue → pick return) | low (SSR only) |
| **4.67.2c** | Listing page return-pick flow (MVP ringkas) | low |
| **4.67.2d** | Checkout page 2-leg strip + 2-leg breakdown | medium (form schema) |
| **4.67.2e** | API `/api/bookings/create` 2-leg validation + persist | **high** (regresi 1-leg mungkin) — butuh regression test matrix |
| **4.67.2f** | Confirmation page 2 route card | low |
| **4.67.2g** | WA message template 2-leg | low |
| **4.67.2h** | Hapus guard `missing_return_date` (deprecated setelah 4.67.2e) | low |

**Rekomendasi urutan deploy**: 4.67.2a di-deploy sendiri dulu (CMS only,
zero frontend impact) → verify admin & existing booking tidak broken →
baru 4.67.2b–h di-deploy bersamaan sebagai 1 release web.

---

### 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Visitor pilih return ferry yang route-nya tidak reverse outbound | Sanity check `returnOrigin === outboundDestination` di API (step 8). |
| Harga leg return beda `currency` dari outbound (mis. SGD) | Snapshot `returnCurrency` TIDAK ditambah — konversi semua ke IDR di endpoint (atau reject beda currency). Keputusan: **reject** untuk MVP, log untuk policy nanti. |
| Return ferry sudah departure sebelum request confirm (user lambat checkout) | `return < today` → reject `err=past_return_date`. Mirror guard outbound existing. |
| Child price berbeda di 2 leg | Masing-masing leg hitung sendiri (`cls.childPrice ?? unitPrice/2`). Zero cross-contamination. |
| Round-trip booking yang sudah persist, kemudian user cancel 1 leg | **Out of scope 4.67.2** — refund logic butuh payment gateway (Phase 5+). Status cukup `cancelled` monolitik. |
| Report / export (admin) breaking karena field baru | Payload admin otomatis render field baru tanpa kode. Export CSV existing: field baru akan muncul sebagai kolom tambahan — opt-in. |
| Migration cascade enum 63-char overflow | `tripType` select slug = `bookings_trip_type` (18 char, aman). Field lain = text/number/date/relationship, zero enum. |

---

### 12. Yang HARUS Dikonfirmasi User sebelum Eksekusi

1. **Q1** (section 2) → **Opsi A, B, atau C?** (Rekomendasi: B — 2-step wizard)
2. **Q2** → kelas boleh beda per leg? (Rekomendasi: ya)
3. **Q3** → 1 record flat vs 2 record linked vs array `legs`? (Rekomendasi: 1 record flat)
4. **Q4** → 1 `bookingRef` atau 2? (Rekomendasi: 1)
5. **Scope WA message**: oke 1 pesan 2 block, atau mau 2 pesan terpisah?
6. **Return currency**: reject kalau beda outbound? (Rekomendasi: reject, log, revisit kalau butuh)
7. **Deploy strategy**: 4.67.2a sendiri dulu, atau release monolitik?

---

### 13. File yang Diprediksi Berubah (preview — tidak ada perubahan di fase audit ini)

| File | Role |
|------|------|
| `apps/cms/src/collections/Bookings.ts` | Tambah 10 field return. |
| `apps/cms/src/migrations/20261006_HHMMSS_phase_4_67_2_bookings_roundtrip.ts` | Migration auto-generated by `pnpm schema:new`. |
| `packages/shared/src/types/payload-types.ts` | Regenerate dari CMS types. |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Round-trip CTA → redirect ke listing. |
| `apps/web/src/pages/ferry-tickets/index.astro` | Return-pick mode banner (MVP ringkas). |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | 2-strip trip details + hidden input return. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | 2 route card. |
| `apps/web/src/pages/api/bookings/create.ts` | Verify 2 ferry + recompute 2 harga + persist return field. |
| `apps/web/src/lib/checkout/store.ts` | `createBooking` payload shape. |
| `apps/web/src/lib/checkout/channels/*` | WA template 2-leg. |
| `docs/02-DATABASE-SCHEMA.md` | Entry Bookings.returnXxx fields. |
| `docs/03-CONTENT-MODEL.md` | Catatan tripType flow. |
| `docs/PROGRESS.md` | Entry 4.67.2. |

### Rollback (keseluruhan 4.67.2)

1. `pnpm schema:down` → migration return field dibalik.
2. `git revert` 4.67.2b–h commits → UI kembali 1-leg; filter 4.64 tetap
   aktif (visitor pilih round-trip di widget → sampai detail outbound,
   lalu guard server `missing_return_date` kembali reject).
3. Phase 4.64 TETAP valid; 4.67.2 adalah additive, bukan refactor.

### Dokumentasi yang Diupdate

- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2-roundtrip-booking-audit.md` (file ini)
- [ ] Setelah eksekusi: `docs/02-DATABASE-SCHEMA.md`, `docs/03-CONTENT-MODEL.md`, `docs/PROGRESS.md`, dan phase report per sub-phase.

### Next Steps

Baca Q1–Q7 di section 12, konfirmasi pilihan → saya start **4.67.2a**
(schema + migration) sebagai eksekusi pertama. Setelah schema stabil
baru masuk UI changes.
