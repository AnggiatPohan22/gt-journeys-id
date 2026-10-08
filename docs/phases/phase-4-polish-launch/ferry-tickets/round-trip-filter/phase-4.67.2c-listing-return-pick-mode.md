## Phase: 4.67.2c — Listing Return-Pick Mode

**Tanggal**: 2026-10-07
**Status**: Selesai (pending manual verify di browser)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan **mode return-pick** di widget listing Ferry Ticket
(`ServiceListingTicketSearch.astro`). Saat URL carry
`?trip=round-trip&outbound=<id>&outboundSlug=<slug>&departure=YYYY-MM-DD`,
listing menampilkan **banner "Step 2 of 2 — Choose your return ferry"**
di atas grid, dan tiap card dapat **click interceptor** yang bypass
detail page dan redirect langsung ke
`/checkout/ferry-tickets/<outboundSlug>` dgn `returnFerryId=<thisCardId>` +
semua outbound metadata di URL. Card dapat badge coral "Select Return →"
sebagai hint visual. Mode default (one-way / no outbound metadata): **ZERO
perubahan** — click handler + card variant persis seperti sebelum
4.67.2c.

Juga: fix inkonsistensi kontrak URL 4.67.2b — detail page sekarang pass
hidden input `from=<destinationSlug>` + `to=<originSlug>` (slug location,
match widget contract `?from=<slug>&to=<slug>`), bukan `origin`/`destination`
sebagai ID. Alpine state `fromSlug`/`toSlug` di listing otomatis
pre-filter listing ke reverse route.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | (1) Frontmatter: parse `qOutbound`, `qOutboundSlug`, `qOutboundClass`, `qDeparture` (dgn regex guard), compute `isReturnPick`. Helper `_humanDate(iso)` + `_titleCaseSlug(s)`. (2) Banner conditional sebelum listing header: ocean bg, swap_horiz icon, step 2 of 2 label, outbound slug + departure/return date, tombol "← Change outbound" link ke detail page outbound. (3) Card wrapper: branch `isReturnPick ? returnPickClickAttr : bookClickAttr`. Return-pick click handler compose URL `/checkout/ferry-tickets/<outboundSlug>?trip=round-trip&date=<departure>&return=<returnDate>&adults=&children=&infants=&class=<outboundClass>&returnFerryId=<item.id>&returnTicketSlug=<item.slug>` lalu `window.location.href` navigate. Card dapat badge pointer-events-none "Select Return →" di top-right (coral). |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Fix kontrak URL: `_locId` → `_locSlug` (extract `slug` dari relationship, fallback legacy enum string). Hidden input berubah dari `origin=<id>`/`destination=<id>` → `from=<destinationSlug>`/`to=<originSlug>`. Helper `roundtripListingHref()` juga pakai `from`/`to`. Alasan: widget `ServiceListingTicketSearch` kontrak URL = `?from=<slug>&to=<slug>` dan Alpine state `fromSlug`/`toSlug` pre-filter listing by slug. |

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**:
  - Listing `/ferry-tickets` (via CMS Page dgn block `serviceListing` layout `ticket-search`) sekarang 2 mode: default + return-pick.
  - Mode detect dari 4 URL params: `trip=round-trip` + `outbound` + `outboundSlug` + `departure`. Semua harus ada.
  - Detail page `[slug].astro` fix hidden input nama field (bugfix di dalam 4.67.2b scope — strict parallel ke widget contract).
- **Routes**: none.
- **RBAC**: none.

### Design Decisions

**Click.capture di card wrapper, bukan ganti href di FerryTicketsCard**
FerryTicketsCard variant `ticket` punya nested anchor (TicketRouteCard
pakai `href` + `bookHref` + `moreInfoHref`). Mengubah variant atau prop
untuk return-pick akan merusak semantic card + require refactor
sub-component. Lebih aman: card tetap render seperti biasa, tapi
wrapper `tsh-card-wrap` yang membungkus intercept click lebih awal
via Alpine `@click.capture.prevent.stop` dan swap destination lewat
`window.location.href`. Zero touch ke FerryTicketsCard.

**Kenapa `date` di URL submit (dari detail page) = return date, bukan departure?**
Kontrak URL listing: `?date=…` dipakai Alpine state `date` → di-display
di cards via `selectedDate={qDate || today}`. Dalam return-pick mode,
visitor sedang MELIHAT jadwal return — jadi tanggal yang di-display di
tiap card = tanggal return. Konsekuensinya `qDate` = return date, dan
`qDeparture` (nama field tambahan 4.67.2b) = outbound date. Trade-off:
sedikit konvensi non-trivial, tapi reuse semua machinery display
existing (selectedDate, FerryTicketsCard, humanDate helpers) tanpa
cabang baru.

**Kenapa banner include "Change outbound" link?**
Visitor realistik akan sadar outbound-nya salah pilih setelah lihat
pilihan return. Link kembali ke detail outbound (`/ferry-tickets/<outboundSlug>?trip=round-trip&date=…&return=…`)
preserve state wizard. Dari detail outbound mereka bisa:
- Submit lagi sidebar form → kembali ke listing return-pick dgn ferry
  yang sama (atau beda jika kelas diubah).
- Klik "← Ferry Tickets" di breadcrumb → cari ferry outbound lain
  (akan kehilangan return state, acceptable).

**Fix nama hidden input `origin`/`destination` → `from`/`to`**
4.67.2b submit ke listing dgn hidden input `origin=<destId>`/`destination=<originId>`
(ID numerik), tapi listing (sejak Phase 4.61.7) kontrak URL = `?from=<slug>&to=<slug>`.
Mismatch → listing TIDAK pre-filter ke reverse route; semua ferry tampil.
Fix: ambil slug dari relationship, pakai `from`/`to`. Juga reuse Alpine
state `fromSlug`/`toSlug` yg sudah menjadi filter key sejak 4.61.9.
Fix ini bagian dari 4.67.2c scope karena mempengaruhi flow test
return-pick end-to-end.

**Mengapa widget filter form TIDAK dilock di return-pick mode?**
Audit section 6 menyarankan "MVP ringkas" — polish (lock, hide, chip
outbound preview) di-defer ke Phase 4.67.3. Konsekuensi: visitor yang
ubah from/to & submit "Find Tickets" di return-pick mode akan keluar
dari context (`applyFilter()` build URL dari Alpine state saja; outbound
metadata ter-strip). Banner hilang + card revert ke normal. Acceptable
untuk MVP — visitor tahu dari banner yg hilang bahwa mereka keluar step 2.

### Testing (manual — pending user verify)

**End-to-end round-trip wizard**
- [ ] `/ferry-tickets?trip=round-trip&return=2026-10-15&from=batam&to=singapore` → pilih outbound → masuk `/ferry-tickets/<slug>?trip=round-trip&date=…&return=2026-10-15&…`.
- [ ] Submit sidebar form di detail (dari 4.67.2b) → redirect ke `/ferry-tickets?trip=round-trip&outbound=<id>&outboundSlug=<slug>&outboundClass=ekonomi&date=<return>&return=<return>&departure=<outbound>&from=singapore&to=batam&adults=&children=`.
- [ ] Listing render **banner coral/ocean** "Round trip · Step 2 of 2 — Choose your return ferry" dgn outbound slug + departure + return date.
- [ ] Alpine filter state pre-set: fromSlug=singapore, toSlug=batam (reverse). Listing hanya tampil ferry Singapore→Batam.
- [ ] Setiap card dapat badge "Select Return →" top-right (coral, non-interactive).
- [ ] Klik card body (any area, termasuk "Book Now" button) → redirect ke `/checkout/ferry-tickets/<outboundSlug>?trip=round-trip&date=<departure>&return=<return>&adults=&children=&class=<outboundClass>&returnFerryId=<cardFerryId>&returnTicketSlug=<cardSlug>`. **Checkout page BELUM render 2-leg (menunggu 4.67.2d)** — untuk sekarang akan tampil seperti 1-leg biasa dgn warning "needs_return_ferry" atau similar.
- [ ] Tombol "← Change outbound" di banner → kembali ke detail outbound dgn state terjaga.

**One-way regression**
- [ ] `/ferry-tickets` tanpa URL param atau dgn `trip=one-way` → **tidak ada banner**, card wrapper sama seperti pre-4.67.2c, click intercept = bookClickAttr existing.
- [ ] Klik "Book Now" di card → confirm popup → checkout 1-leg (unchanged).
- [ ] Klik card body (bukan button) → navigate ke detail page (unchanged).

**Edge cases**
- [ ] URL partial (`?trip=round-trip&outbound=5` tapi `outboundSlug` kosong atau `departure` invalid) → `isReturnPick = false` → listing render default. Banner tidak muncul (fail-closed).
- [ ] `outboundSlug` dgn karakter aneh (XSS attempt) → `_titleCaseSlug` + `encodeURIComponent` di href lindungi; Astro default-escape text content di JSX.
- [ ] Infants > 0 di URL asal → passthrough ke checkout URL (optional field).

### Rollback
`git revert <commit-4.67.2c>` → kembalikan 2 file:
- `ServiceListingTicketSearch.astro`: hapus banner + branch isReturnPick, kembali ke bookClickAttr unconditional.
- `[slug].astro`: hidden input `origin`/`destination` ID kembali (dari revert 4.67.2b fix). Catatan: pre-4.67.2c state 4.67.2b juga punya bug nama field (sudah di-fix sebagai bagian scope ini).

Zero data loss. Zero schema. Visitor dgn `?trip=round-trip&outbound=…` di URL (bookmark antara deploy & rollback) akan treated as default — URL params diabaikan, zero error.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2c-listing-return-pick-mode.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru
- [ ] `docs/03-CONTENT-MODEL.md` — tidak perlu update (CMS field tidak berubah).

### Next Steps
- **4.67.2d** — Checkout page `/checkout/ferry-tickets/[slug].astro`:
  deteksi `trip=round-trip` + `returnFerryId` + `returnTicketSlug` di URL
  → fetch return ferry dari CMS → render **2 strip Trip Details**
  (Outbound + Return) + **2 price breakdown row** di sidebar Booking
  Summary (Phase 4.63.2 structure). Hidden input `returnFerryTicketId`,
  `returnFerryClassType`, `returnDate` di-pass ke `POST /api/bookings/create`
  (4.67.2e next). Guard SSR: kalau `trip=round-trip` tapi `returnFerryId`/`returnDate`
  kosong → redirect balik ke `/ferry-tickets/<slug>?err=needs_return_ferry`.
