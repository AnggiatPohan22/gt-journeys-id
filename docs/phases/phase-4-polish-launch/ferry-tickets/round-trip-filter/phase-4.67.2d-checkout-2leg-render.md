## Phase: 4.67.2d — Checkout Page 2-Leg Render

**Tanggal**: 2026-10-07
**Status**: Selesai (pending manual smoke test di browser)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan **render 2-leg** di halaman checkout Ferry Ticket. URL dari
listing return-pick (4.67.2c) membawa `trip=round-trip` +
`returnFerryId=<id>` + `returnTicketSlug=<slug>` + optional
`returnClass=<classType>`. Checkout page sekarang:
(1) **Fetch return ferry** dari CMS via slug + verify id match (defense-in-depth);
(2) **Compute return pricing** (adultLineTotal + childLineTotal, child
fallback 50% kalau tidak diset);
(3) **Render 2 trip strip** di atas form — Outbound (sand) + Return (leaf);
(4) **Hidden input baru** di form: `tripType`, `returnDate`,
`returnFerryTicketId`, `returnTicketSlug`, `returnFerryClassType`,
`returnFerryClassName`;
(5) **Sidebar Booking Summary** expand: badge "Round Trip" (ganti "One Way"),
Return breakdown block (adult/child line + subtotal) di dalam
collapsible "Show Details", grand total = outbound + return;
(6) **Guard SSR**: `trip=round-trip` tapi `returnTicketSlug` kosong /
return ferry tidak ketemu / id mismatch → redirect ke detail outbound
dgn err (`needs_return_ferry` / `return_ferry_not_found` /
`return_ferry_mismatch`).

Mode one-way (default): **ZERO perubahan visual atau behaviour**. Trip
strip pakai pola existing (satu baris), badge "One Way", sidebar tanpa
return block. Submit API `POST /api/bookings/create` TETAP jalan sebagai
1-leg sampai 4.67.2e mengaktifkan 2-leg persist.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | (1) Frontmatter: parse `qTrip`, `qReturnDate`, `qReturnFerryId`, `qReturnTicketSlug`, `qReturnClass`, `isRoundTrip`. Guard redirect ke detail outbound kalau round-trip tapi return field incomplete (3 err codes baru). SSR fetch `returnItem` via `getFerryTicketsBySlug(qReturnTicketSlug)` + id-match check. Compute `returnPreselected`, `returnRouteLabel`, `returnOrigin`/`returnDestination`, `returnUnitPrice`, `returnChildUnitPrice`, `returnAdultLineTotal`, `returnChildLineTotal`, `returnTicketFare`, `returnSubtotal`, `returnDepDateFmt`, `returnHeroImg`. `totalPrice` = outbound subtotal + return subtotal (0 untuk one-way). (2) Trip strips: wrap dalam `space-y-2`, outbound dapat badge "OUTBOUND" (ocean) saat round-trip, tambah return strip (leaf accent) + badge "RETURN" + ferry title + route + `event_repeat` icon + date + class pill, tombol "Change return →" link ke listing return-pick dgn state ter-preserve. (3) Hidden inputs: `tripType` always (`one-way`/`round-trip`), round-trip saja: `returnDate`, `returnFerryTicketId`, `returnTicketSlug`, `returnFerryClassType`, `returnFerryClassName`. (4) Sidebar: badge pojok kanan atas "One Way" → `{isRoundTrip ? 'Round Trip' : 'One Way'}`. Di dalam `collapsibleDetails`, tambah block "Return — <date>" (leaf-dark header + `event_repeat` icon) dgn Ferry/Class rows + Adult/Child line items + Subtotal (Return). Grand total line "Total price" tetap sama tapi value sekarang reflect 2-leg sum. |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Tambah 3 entri di `checkoutNotice` map: `needs_return_ferry`, `return_ferry_not_found`, `return_ferry_mismatch` — pesan English, display di notice box coral saat visitor di-redirect balik dari checkout karena return incomplete. |

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**: Checkout page 2 mode (one-way default + round-trip). URL round-trip minimal: `?date=&trip=round-trip&return=&returnFerryId=&returnTicketSlug=&adults=&children=`. `returnClass` optional, fallback cheapest return ferry.
- **Routes**: none (reuse `/api/bookings/create` existing — behaviour 2-leg menyusul 4.67.2e).
- **RBAC**: none.

### Design Decisions

**Fetch return ferry via slug (bukan id)**
`getFerryTicketsBySlug` sudah ada & dipakai untuk outbound. Reuse =
zero new helper. ID dari URL dipakai sebagai defense-in-depth check
(mismatch slug/id → redirect). Alternative (fetch via id) butuh helper
baru dan tidak lebih aman — payload API tetap return record yang sama.

**Return trip strip pakai leaf accent (bukan sand sama seperti outbound)**
Visual differentiation: outbound = sand (warm, default), return = leaf
(hijau, "coming back"). Konsisten dgn semantic Phase 4.67.2b banner
yang pakai ocean untuk "going out". User scanning sidebar/form langsung
tahu mana leg mana tanpa membaca label.

**Hidden input `tripType` always rendered**
Konsisten dgn pola `serviceType` di collection Bookings. One-way kirim
`tripType=one-way` → API endpoint 4.67.2e cukup check field ini saja
untuk decide 1-leg vs 2-leg path, tidak perlu guess dari field lain.

**Guard SSR early redirect (bukan render dgn warning)**
Kalau `trip=round-trip` tapi return data incomplete, visitor TIDAK
akan dapat UX yang masuk akal — form akan looks like 1-leg + partial
sidebar. Redirect ke detail outbound dgn err code lebih jujur:
"Please pick a return ferry before continuing to checkout". Fail-closed.

**Child unit price: ambil dari CMS atau fallback 50%**
Mirror pola outbound (line 131-134). Kalau ferry return punya
`childPrice` di CMS → pakai. Else `Math.round(unitPrice/2)`. Zero
pricing bug.

**ID-match check (defense-in-depth)**
URL dari listing membawa BOTH `returnFerryId` + `returnTicketSlug`.
Attacker bisa swap satu. Guard: fetch by slug, lalu compare returned
record.id dengan URL id. Mismatch → redirect `return_ferry_mismatch`.
Pola sama dgn Phase 4.66.4 untuk outbound (`ferry_slug_mismatch`).

**Tombol "Change return" link preserve state**
URL = `/ferry-tickets?trip=round-trip&outbound=<outboundId>&outboundSlug=&outboundClass=&departure=<qDate>&date=<qReturnDate>&return=<qReturnDate>&adults=&children=`.
Visitor kembali ke listing return-pick (4.67.2c) dgn semua state
outbound terjaga — hanya return pilihan yang baru.

### Smoke Test — End-to-End Round-Trip Flow (Phase 4.67.2a → 4.67.2d)

> **Prerequisite**: CMS running di `localhost:3030`, web dev server di
> `localhost:4321`, minimal **2 Ferry Tickets published** di CMS dgn
> origin+arrival yang reverse (mis. Batam→Singapore dan Singapore→Batam),
> masing-masing punya `ferryClasses` lengkap (adultPrice minimal).

#### Setup Data (sekali saja)
1. Buka `localhost:3030/admin/collections/ferry-tickets` → pastikan ada:
   - Ferry A: Batam → Singapore (publish), minimal 1 class
   - Ferry B: Singapore → Batam (publish), minimal 1 class
2. Buka `localhost:3030/admin/collections/locations` → pastikan Batam & Singapore punya `locationType=port` (atau sesuai config widget).

---

#### Smoke Test 1: One-Way Regression (CRITICAL — jangan skip)
**Tujuan**: pastikan 4.67.2a-d TIDAK merusak flow one-way existing.

1. Buka `http://localhost:4321/ferry-tickets`.
2. Widget filter: pastikan pill **"One Way"** aktif (default).
3. Pick origin=Batam, destination=Singapore, date=besok, klik "Find Tickets".
4. ✅ **Expect**: listing menampilkan Ferry A. **TIDAK ADA** banner "Round trip · Step 2 of 2" di atas listing.
5. Klik card Ferry A → masuk `/ferry-tickets/<slug>?date=…`.
6. ✅ **Expect**: sidebar tetap pakai layout lama — label **"Reserve Now"**, 1 date picker ("Ferry Schedule Date"), adults/children stepper.
7. ✅ **Expect**: per-class card CTA = **"Book Now"** (coral, bukan dimmed).
8. Submit sidebar → masuk `/checkout/ferry-tickets/<slug>?date=&adults=&children=`.
9. ✅ **Expect**:
   - Breadcrumb stepper normal.
   - **1 trip strip** sand (tanpa badge "OUTBOUND").
   - Sidebar Booking Summary badge **"ONE WAY"** di pojok kanan atas.
   - Collapsible "Show Details" menampilkan **1 breakdown block** (Departure), tanpa section Return.
   - Total price = outbound subtotal saja.
10. (Opsional) Isi form + submit → booking created 1-leg di CMS (unchanged, Phase 4.67.2e-g yg akan 2-leg aware).

**Pass criteria**: SEMUA 9 point di atas tanpa warning Alpine di console atau mismatch visual.

---

#### Smoke Test 2: Round-Trip Full Wizard
**Tujuan**: flow round-trip dari filter → detail → listing return → checkout 2-leg.

**Step A — Widget filter: pilih Round Trip**
1. Buka `http://localhost:4321/ferry-tickets`.
2. Klik pill **"Round Trip"** (sebelumnya disabled "Soon", sejak 4.64 aktif).
3. ✅ **Expect**: Return Date card muncul (mobile: di antara Date & Passenger; desktop: di bawah main grid). Default return = departure + 3 hari.
4. Set origin=Batam, destination=Singapore, date=besok, return=besok+3, adults=2, children=1 (atau sesuai preferensi).
5. Klik "Find Tickets".
6. ✅ **Expect URL**: `?trip=round-trip&return=YYYY-MM-DD&from=batam&to=singapore&date=…&adults=2&children=1`.
7. ✅ **Expect**: listing menampilkan Ferry A (Batam→Singapore). **TIDAK ADA** banner Step 2 of 2 (karena belum ada `outbound` param).

**Step B — Detail outbound: round-trip sidebar**
8. Klik card Ferry A → masuk `/ferry-tickets/<slug-ferry-a>?date=&trip=round-trip&return=&…`.
9. ✅ **Expect**: sidebar **BERUBAH** jadi round-trip layout:
   - Banner ocean "Round trip — Step 1 of 2: confirm dates, then pick your return ferry.".
   - **2 date picker**: Departure (pre-filled dari URL) + Return (pre-filled dari URL).
   - Adults/Children stepper preserve state URL.
   - Button **"Continue to pick return →"** (bukan "Reserve Now").
10. ✅ **Expect per-class card CTA**:
    - Kalau date+return keduanya di URL → label **"Pick Return · Ekonomi"** (/`Emerald`/…), coral solid.
    - Kalau direct bookmark tanpa date → label **"Choose Ekonomi"**, dimmed (coral/60), href `#reserve-form`.
11. Klik tombol **"Continue to pick return →"** di sidebar.
12. ✅ **Expect redirect URL**: `/ferry-tickets?trip=round-trip&outbound=<ferryA.id>&outboundSlug=<slug-ferry-a>&outboundClass=<cheapest>&departure=<departure>&date=<return>&return=<return>&from=singapore&to=batam&adults=2&children=1`.

**Step C — Listing return-pick mode**
13. ✅ **Expect banner atas listing**: ocean bg, swap_horiz icon, "Round trip · Step 2 of 2 — Choose your return ferry", teks "Outbound <Slug-Ferry-A-Title-Case> · Departure Mon, DD Mmm YYYY · Return Thu, DD Mmm YYYY".
14. ✅ **Expect**: listing hanya tampil Ferry B (reverse route: Singapore→Batam). Alpine filter state: fromSlug=singapore, toSlug=batam.
15. ✅ **Expect**: setiap card dapat **badge coral "Select Return →"** di top-right (pointer-events-none, non-interactive, hanya hint).
16. ✅ **Expect tombol "← Change outbound"** di banner kanan — klik → kembali ke detail Ferry A dgn state terjaga.
17. Klik card Ferry B (any area body atau tombol "Book Now" di dalam card).
18. ✅ **Expect redirect URL**: `/checkout/ferry-tickets/<slug-ferry-a>?trip=round-trip&date=<departure>&return=<returnDate>&adults=2&children=1&class=<outboundClass>&returnFerryId=<ferryB.id>&returnTicketSlug=<slug-ferry-b>`.

**Step D — Checkout 2-leg render**
19. ✅ **Expect checkout page berubah mode round-trip**:
    - **2 trip strip stack**:
      - **Outbound** (sand bg): badge "OUTBOUND" ocean, Ferry A title, route Batam→Singapore, departure date, pax, class pill, link "Change trip →" ke detail Ferry A.
      - **Return** (leaf-light bg): badge "RETURN" leaf-dark, Ferry B title, route Singapore→Batam, return date, class pill, link "Change return →" ke listing return-pick.
    - Form hidden inputs include: `tripType=round-trip`, `returnDate`, `returnFerryTicketId`, `returnTicketSlug`, `returnFerryClassType`, `returnFerryClassName`.
20. ✅ **Expect sidebar Booking Summary**:
    - Badge pojok kanan atas: **"ROUND TRIP"** (uppercase, ganti "ONE WAY").
    - Klik "Show Details":
      - Block **"Departure — <date>"** (unchanged): Ferry/Class rows + Adult/Child line + Subtotal (Departure).
      - Block **"Return — <date>"** NEW (leaf-dark header + `event_repeat` icon): Ferry B / Class rows + Adult/Child line + Subtotal (Return).
    - **Total price** di bawah = outbound subtotal + return subtotal (verify manual: adult×2×unit + child×1×childPrice untuk kedua leg).
21. ⚠️ **Expect SUBMIT belum 2-leg**: isi form, klik "Continue to Booking Confirmation". `POST /api/bookings/create` akan accept data dan create 1-leg booking (ignore returnFerryTicketId dkk) — **ini expected, 4.67.2e** yg akan handle persist 2-leg + sanity check. Jadi untuk sekarang **jangan submit** kalau tidak mau pollute booking DB; cukup verify UI render.

**Pass criteria**: SEMUA ✅ di step A-D above. Minor polish (spacing, color) OK ditunda. Hard blockers: step 9 (sidebar form branching), step 13 (banner), step 19 (2 strips), step 20 (2 breakdown).

---

#### Smoke Test 3: Guard SSR Edge Cases
**Tujuan**: fail-closed behaviour di URL malformed.

1. Buka manual `http://localhost:4321/checkout/ferry-tickets/<slug-ferry-a>?date=2026-11-01&trip=round-trip&adults=1&children=0` (tanpa `returnTicketSlug` + tanpa `return`).
   - ✅ **Expect**: redirect ke `/ferry-tickets/<slug-ferry-a>?err=needs_return_ferry`. Notice box coral muncul di sidebar detail: "Please pick a return ferry before continuing to checkout."
2. Buka manual `http://localhost:4321/checkout/ferry-tickets/<slug-ferry-a>?date=2026-11-01&trip=round-trip&return=2026-11-04&returnTicketSlug=nonexistent-slug&adults=1&children=0`.
   - ✅ **Expect**: redirect ke `/ferry-tickets/<slug-ferry-a>?err=return_ferry_not_found`. Notice: "The return ferry is no longer available."
3. Buka manual `http://localhost:4321/checkout/ferry-tickets/<slug-ferry-a>?date=2026-11-01&trip=round-trip&return=2026-11-04&returnTicketSlug=<slug-ferry-b>&returnFerryId=99999&adults=1&children=0` (id salah).
   - ✅ **Expect**: redirect `/ferry-tickets/<slug-ferry-a>?err=return_ferry_mismatch`. Notice: "Return ferry data mismatch. Please reload the page and try again."
4. Buka URL VALID (dari Smoke Test 2 step 18) → ✅ **Expect**: render normal 2-leg. No redirect.

**Pass criteria**: 4 cases redirect dgn benar + notice tampil.

---

### Testing Checklist Ringkas (untuk commit review)
- [ ] One-way regression (ST1) PASS 9/9
- [ ] Round-trip wizard (ST2 Step A→D) PASS semua ✅
- [ ] Guard SSR edge cases (ST3) PASS 4/4
- [ ] Zero console error (Alpine, hydration, 404)
- [ ] Sidebar Alpine `date` state init correct untuk kedua mode
- [ ] Session timer (4.67.1) tetap jalan 15:00 countdown di kedua mode

### Rollback
`git revert <commit-4.67.2d>` → 2 file kembali:
- `checkout/ferry-tickets/[slug].astro`: hilangkan round-trip SSR fetch + 2 strip + sidebar return block + hidden inputs.
- `ferry-tickets/[slug].astro`: hilangkan 3 err code di `checkoutNotice`.

Zero schema, zero API change. Visitor yang terlanjur klik sampai checkout dgn URL round-trip (antara deploy & rollback) akan dapat 1-leg render (returnFerryId diabaikan) — behaviour sama seperti pre-4.67.2d. Submit → 1-leg booking tersimpan. Acceptable.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2d-checkout-2leg-render.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru
- [ ] `docs/03-CONTENT-MODEL.md` — tidak perlu update (CMS field tidak berubah).

### Next Steps
- **4.67.2e** — API `POST /api/bookings/create`: handle 2-leg path. Jika `tripType=round-trip`:
  1. Validate `returnDate` (format, >= `departureDate`).
  2. Verify `returnFerryTicketId` via `getFerryForCheckout` + status published.
  3. Recompute return unitPrice + totalEstimate dari CMS (snapshot).
  4. **Sanity check**: `returnOriginLocation.id === outboundDestinationLocation.id` AND vice versa. Reject `err=return_route_mismatch` kalau tidak.
  5. Pass semua snapshot ke `createBooking` payload — fields `returnDate`, `returnFerryTicket`, `returnFerryClass*`, `returnOrigin/DestinationLocation`, `returnScheduleTimeLabel`, `returnUnitPrice`, `returnTotalEstimate`.
  6. `totalEstimate` = outbound total + return total (grand).
  7. Hapus guard existing `missing_return_date` (deprecated oleh 4.67.2d SSR guard).
