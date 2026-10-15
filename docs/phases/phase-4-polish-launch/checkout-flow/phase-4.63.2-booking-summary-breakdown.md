## Phase: 4.63.2 — Booking Summary price breakdown

**Tanggal**: 2026-09-28
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan

Memperluas sidebar Booking Summary di halaman checkout Ferry Ticket supaya customer melihat rincian harga lebih jelas sebelum submit:

- Departure kini menampilkan hari + tanggal (mis. "Thu, 15 Oct 2026").
- Price Breakdown baru: baris Adult (N x unit) dan Child (M x unit), langsung dikalikan. Child unit mengambil preselected.childPrice dari CMS bila tersedia, else fallback 50% adult.
- Ticket fare = subtotal adult + child.
- Subtotal (Departure) = ticket fare + service fee - discount.
- Total Price (paling bawah, coral besar) = subtotal departure.

Baris Service Fee & Discount disembunyikan sampai fee configurable & promo code aktif. Struktur DOM siap, cukup ubah serviceFee/discount != 0 di source.

### Keputusan owner

- Child price: prefer childPrice dari CMS; fallback 50% adult.
- Service fee: sembunyikan untuk sekarang.
- Discount: sembunyikan untuk sekarang.
- Subtotal (Departure): tampilkan (siap round-trip nanti).

### File yang Berubah

- apps/web/src/pages/checkout/ferry-tickets/[slug].astro — depDateFmt include weekday short; tambah computed childUnitPrice/adultLineTotal/childLineTotal/ticketFare/serviceFee(=0)/discount(=0)/subtotalDeparture/totalPrice + helper priceFmt; rewrite sidebar jadi Price Breakdown (adult/child rows, ticket fare, subtotal, total price coral 2xl).
- docs/phases/phase-4-polish-launch/checkout-flow/phase-4.63.2-booking-summary-breakdown.md — BARU.
- docs/PROGRESS.md — update header.

### Impact

- Database: none. CMS: none (ferry class childPrice sudah ada sejak Phase 4.61).
- Frontend: sidebar checkout transparan.
- Deploy needed: web only.

### Testing (dev 4321 + CMS 3030)

- Sidebar render dgn Departure "Thu, 15 Oct 2026" + breakdown Adult/Child + Ticket fare + Subtotal + Total. OK.
- Class dgn childPrice null: child pakai 50% adult (verified via code inspection). OK.
- children=0: baris Child tidak muncul. OK.
- pnpm build sukses 23.95s. Zero JS deps, semua SSR.

### Rollback

git checkout HEAD -- apps/web/src/pages/checkout/ferry-tickets/[slug].astro

### Catatan Teknis

- serviceFee & discount di-hardcode 0. Ketika payment gateway aktif, kedua nilai HARUS dihitung server-side & disimpan ke Booking record (kolom baru + migration) supaya total tidak bisa dimanipulasi frontend.
- Halaman confirmation belum menampilkan breakdown yang sama, pending kalau owner request.

### Next Steps

- Owner UAT tampilan sidebar dgn berbagai kombinasi adult/child.
- Bila service fee & discount aktif: Phase 4.65 kolom Booking baru + field CMS + logika promo code.
- Sync confirmation page ke layout breakdown yang sama (kecil).
