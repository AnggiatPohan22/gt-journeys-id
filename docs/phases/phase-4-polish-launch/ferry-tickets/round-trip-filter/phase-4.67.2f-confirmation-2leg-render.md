## Phase: 4.67.2f — Confirmation Page 2-Leg Render

**Tanggal**: 2026-10-07
**Status**: Selesai (pending manual verify di browser)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan **render 2-leg** di halaman `/checkout/ferry-tickets/confirmation/[ref]`.
Booking record (persist 4.67.2e) membawa `tripType` + 10 return field →
confirmation page sekarang:
(1) **Success hero** dapat badge **"Round Trip"** di sebelah "Booking Created"
label (+swap_horiz icon, ocean bg) + copy intro mention "both outbound and
return legs";
(2) **Sidebar Booking Summary** badge pojok kanan atas:
`'Round Trip · Confirmed'` saat round-trip (ganti plain 'Confirmed');
(3) **Return heading block** di sidebar (leaf-dark header + `event_repeat` icon)
di bawah Departure heading — tampil tanggal return, route, schedule time;
(4) **Collapsible "Show Details"** price breakdown jadi 2 section:
"Outbound Breakdown" (adult/child line + Subtotal Departure) + "Return
Breakdown" (ferry+class rows + adult/child line + Subtotal Return);
(5) **Fix bug lama**: child line sebelumnya `= total - adult*unit`
(approximate single-leg, broken untuk 2-leg). Sekarang pakai
`childUnitOf(ferry, classType, unitPrice)` helper yang baca
`ferry.ferryClasses[].childPrice` dari populated relationship (fallback
50% konsisten dgn checkout/API).

**Estimated Total** di sidebar tetap pakai `booking.totalEstimate` (yg
sejak 4.67.2e = grand total untuk round-trip, outbound-only untuk one-way).

Mode one-way: **ZERO visual change** selain fix child line display
(sekarang lebih akurat untuk booking yg punya `ferryClasses[].childPrice`
eksplisit di CMS).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | (1) Frontmatter: parse `isRoundTrip`, `returnFerryObj` (populated), `returnFerryTitle`, `returnDateISO`, `returnDepDateFmt`, `returnRouteLabel`, `returnScheduleTimeLabel`, `returnClassName`, `returnUnitPriceNum`, `returnUnit`. Helper `childUnitOf(ferry, classType, unitPrice)` baca populated `ferryClasses[].childPrice` dgn fallback 50% unitPrice. Compute `outboundChildUnit`/`returnChildUnit`, `outboundAdultLine`/`outboundChildLine`/`outboundSubtotal`, `returnAdultLine`/`returnChildLine`/`returnSubtotal`. (2) Success hero: badge "Round Trip" conditional (ocean bg + swap_horiz) + copy intro yg beda untuk 2-leg. (3) Sidebar header: badge "Confirmed" → "Round Trip · Confirmed" conditional. (4) Setelah Departure heading block di sidebar, tambah Return heading block (leaf-dark + event_repeat) conditional. (5) Collapsible details price breakdown: existing single section direstructure jadi "Outbound Breakdown" + "Return Breakdown" (round-trip saja). Fix child line pakai `outboundChildUnit`/`returnChildUnit` (bukan `total - adult*unit` buggy). |

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**: confirmation page 2 mode (one-way + round-trip). Mode detect dari `booking.tripType === 'round-trip'`.
- **Routes**: none.
- **RBAC**: none.
- **Bugfix side-effect** (one-way impact): child line price sekarang akurat per CMS (`childPrice` field di `ferryClasses`), bukan sekadar `total - adult subtotal`. Impact: minor display accuracy improvement untuk booking lama yg punya childPrice beda dari 50%.

### Design Decisions

**Reuse structure sidebar (bukan 2 TicketRouteCard di main column)**
Audit §9 menyarankan 2 `TicketRouteCard` stack di main column, tapi
layout confirmation page existing TIDAK pakai TicketRouteCard — semua
info trip di sidebar Booking Summary (left column fokus Contact +
Passenger + Handoff CTA). Konsisten dgn pola existing: tambahkan Return
section mirror Departure di SIDEBAR. Zero architecture refactor,
visual continuity dgn checkout page 4.67.2d yg juga pakai sidebar
summary approach.

**Child unit lookup via populated relationship**
`getBookingByRefAndToken` sudah pakai `depth=2` sejak Phase 4.66.5
(untuk access token lookup). `booking.ferryTicket` + `booking.returnFerryTicket`
otomatis populated dgn `ferryClasses[]`. Baca `childPrice` dari sana
= single source of truth. Bukan tersimpan di booking record (hanya
`unitPrice` adult yg disnapshot) → ini kompromi: booking lama tetap
reflect current CMS state (bagus untuk display, risky kalau admin
ubah childPrice setelah booking dibuat; tapi outbound sudah pakai pola
yg sama di checkout page 4.63.2 — konsisten).

**Fix "child line = total - adult" bug**
Pre-4.67.2f confirmation page compute `child line = max(0, total -
unitPrice*adults)`. Approximation ini salah di 2 kasus:
1. **Round-trip**: `total` sekarang = grand total (outbound + return),
   sehingga child line display akan super inflated.
2. **One-way dgn promo/service fee** (future): kalau ada charge
   tambahan di `totalEstimate`, child line jadi bias.

Fix: compute child line dari `childUnit * children` langsung. Konsisten
dgn checkout page 4.63.2 + API 4.67.2e.

**Collapsible details: 2 breakdown section (tidak merged)**
Alternatif: 1 section "Price Breakdown" dgn 4 baris (Outbound adult/child
+ Return adult/child). Trade-off: visual lebih padat tapi label kurang
jelas. Pilih: 2 section terpisah dgn Subtotal (Departure) + Subtotal
(Return). Konsisten dgn pola checkout page 4.67.2d yg juga 2 blok.

**Hero badge "Round Trip" + copy differentiation**
Visitor landing di confirmation page langsung tahu dari header: ini
booking round-trip, bukan one-way (penting karena WA button + handoff
URL sama). Copy intro juga di-tweak: "both outbound and return legs"
→ reminder konkret ke customer bahwa 2 ferry sudah di-book.

### Testing (manual — pending user verify)

**Round-trip confirmation render**
- [ ] Dari Smoke Test 4 (ST4 dari 4.67.2e doc), submit booking round-trip sukses → sampai di `/checkout/ferry-tickets/confirmation/<FT-ref>?t=<token>`.
- [ ] ✅ **Hero**: "Booking Created" label dapat badge "Round Trip" (ocean, swap_horiz icon) di sampingnya.
- [ ] ✅ **Hero copy**: "Your round-trip booking includes both outbound and return legs. Click the WhatsApp button..."
- [ ] ✅ **Sidebar header badge**: "ROUND TRIP · CONFIRMED" (uppercase).
- [ ] ✅ **Sidebar Departure block**: unchanged.
- [ ] ✅ **Sidebar Return block** (baru, di bawah Departure): leaf-dark heading dgn `event_repeat` icon, "Return — <returnDate>", route label (reverse), schedule time (kalau ada).
- [ ] Klik "Show Details":
  - ✅ Block **"Outbound Breakdown"**: Adult (adults × unitPrice) + Child (children × childUnit) + Subtotal (Departure).
  - ✅ Block **"Return Breakdown"**: Ferry row (return ferry title) + Class row (return class name) + Adult + Child + Subtotal (Return).
  - ✅ Grand total "Estimated Total" di bawah = sum keduanya (match `booking.totalEstimate`).
- [ ] WhatsApp handoff button tetap jalan (click → send to WA).
- [ ] Session timer / passenger accordion / copy-ref button tetap functional.

**One-way regression**
- [ ] Dari Smoke Test 6 (ST6 dari 4.67.2e doc), submit booking one-way → confirmation page.
- [ ] ✅ Hero: label "Booking Created" tanpa badge Round Trip. Copy intro lama ("Please keep your reference number...").
- [ ] ✅ Sidebar badge: "CONFIRMED" (plain, tanpa "Round Trip ·").
- [ ] ✅ **TIDAK ADA** Return heading block.
- [ ] ✅ "Show Details" tampil 1 section "Price Breakdown" (bukan "Outbound Breakdown") dgn Adult + Child + Subtotal (Departure).
- [ ] ✅ **TIDAK ADA** "Return Breakdown" section.
- [ ] Grand total = outbound subtotal (unchanged).

**Price accuracy**
- [ ] Verify manual kalkulasi: `outbound subtotal = adults × unitPrice + children × childPrice (CMS)` matches display di "Subtotal (Departure)".
- [ ] Verify manual: `return subtotal = adults × returnUnitPrice + children × returnChildPrice (CMS)` matches "Subtotal (Return)".
- [ ] Grand total "Estimated Total" = outbound + return. Match `booking.totalEstimate` di DB.

### Rollback
`git revert <commit-4.67.2f>` → confirmation page kembali ke pre-4.67.2f:
- Frontmatter: hilangkan round-trip parse + child unit lookup.
- Hero: tanpa badge "Round Trip".
- Sidebar: badge "Confirmed" plain, tanpa Return heading, tanpa Return Breakdown.
- Price breakdown: single section dgn "child line = total - adult*unit" approximation (buggy untuk round-trip tapi functional untuk one-way).

Zero schema, zero data loss. Booking round-trip yang terlanjur dibuat (via 4.67.2e) akan ditampilkan sebagai "one-way-looking" di confirmation — return data tetap ada di DB, hanya tidak di-render di UI. Customer bisa cek admin / WA message untuk konfirmasi.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2f-confirmation-2leg-render.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru

### Next Steps
- **4.67.2g** — WhatsApp message template (`apps/web/src/lib/checkout/channels/*`): render 2 block "🚢 Outbound" + "🚢 Return" di pesan WA + grand total. **Ini sub-phase terakhir** sebelum 4.67.2 bisa dinyatakan complete.
