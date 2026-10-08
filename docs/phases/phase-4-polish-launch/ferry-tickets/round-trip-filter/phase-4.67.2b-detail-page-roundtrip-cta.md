## Phase: 4.67.2b — Detail Page Round-Trip CTA

**Tanggal**: 2026-10-07
**Status**: Selesai (pending manual verify di browser)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan **mode round-trip** di halaman detail Ferry Ticket
(`/ferry-tickets/[slug]`). Saat URL carry `?trip=round-trip`:
(1) sidebar form berubah dari "Reserve Now" (langsung ke checkout)
menjadi **"Continue to pick return →"** yang redirect ke listing
`/ferry-tickets` dgn **reverse route** (origin↔destination swap),
return date pre-fill, dan outbound metadata (`outbound`, `outboundSlug`,
`outboundClass`, `departure`, `adults`, `children`) di URL;
(2) tombol "Book Now" per-class card berubah label jadi "Pick Return · <Kelas>"
dan URL-nya ikut carry outbound metadata; kalau prasyarat `date`+`return`
belum ada di URL, tombol jadi dimmed + anchor `#reserve-form` sebagai
hint "pilih tanggal dulu di sidebar".

Mode one-way (default): **ZERO perubahan visual atau behaviour** —
semua ferry/checkout existing jalan persis seperti sebelumnya.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/ferry-tickets/[slug].astro` | (1) Frontmatter: parse `qTrip` + gate `isRoundTrip`, `qReturn`, `qDate` (dgn regex guard), `qAdults`, `qChildren`. Helper `_locId()` extract id dari relationship field, compute `originLocId` + `destinationLocId`. Helper `roundtripListingHref(outboundClass)` compose URL ke listing (null kalau date missing). (2) Ferry Classes block: per-card CTA jadi object `{ href, label, dimmed }` yg di-branching 3 cabang (one-way / round-trip+ready / round-trip+missing-dates). (3) Sidebar form: branching `isRoundTrip ? <round-trip-form /> : <one-way-form />`. Round-trip form: hidden metadata (trip, outbound, outboundSlug, outboundClass, origin, destination), 2 date picker (Departure `name="departure"` + Return `name="date"`), hidden mirror `return`, adults/children stepper preserve `qAdults`/`qChildren`, tombol "Continue to pick return →". Tambah `id="reserve-form"` di kedua form supaya anchor `#reserve-form` dari per-class card bisa jump balik ke sidebar. |

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**: `/ferry-tickets/[slug]` sekarang 2 mode: default one-way (unchanged) + round-trip (baru). Mode detect dari `?trip=round-trip` URL param — hanya diaktifkan oleh widget Ticket Search (Phase 4.64).
- **Routes**: tidak ada endpoint baru. Form POST GET ke `/ferry-tickets` (listing).
- **RBAC**: none.

### Design Decisions

**Kenapa `date` field name = Return Date value (bukan rename ke `returnDate`)?**
Listing page di 4.67.2c (next sub-phase) akan render return-pick mode
yang filter listing by date yang user cari = tanggal return. Pakai field
name `date` konsisten dgn kontrak URL listing existing (widget Phase 4.64:
`?origin=&destination=&date=`). Nama `departure` dipakai untuk hidden
outbound date — zero bentrok, zero refactor listing filter logic di
sub-phase berikutnya.

**Kenapa 2 date picker (bukan Alpine stepper dinamis)?**
Konsistensi dgn pola widget Phase 4.64 yang pakai 2 input date native
(Departure + Return). Alpine stepper (quick chips Same day / +2 / +3 /
+7) bisa menyusul di polish phase (4.67.3+) tanpa refactor markup.
Static `min={qDate || todayLocalISO()}` cukup untuk MVP — kalau user
ubah departure di SSR output, validasi akhir dilakukan browser native
`min=` + guard server di `/api/bookings/create` (sudah ada sejak 4.64).

**Per-class card CTA dibuat 3 cabang (bukan hanya 2)?**
Round-trip tanpa `date`+`return` di URL (mis. visitor bookmark direct
ke `/ferry-tickets/[slug]?trip=round-trip` tanpa lewat widget) → kita
TIDAK bisa compose listing URL penuh. Alternatif brute-force (redirect
ke listing tanpa date) akan bikin listing kosong atau ambigu. Lebih
jujur: dimmed button + anchor ke sidebar dgn hint title. User fill
dates di sidebar → tombol per-class otomatis "aktif" lagi di render
berikutnya (via form submit).

**Kenapa `defaultOutboundClass` = cheapest?**
Konsisten dgn display sidebar ("From {priceFormatted}" pakai cheapest
class). User yang klik "Continue to pick return →" di sidebar form
tanpa pilih kelas spesifik → outbound = kelas termurah (asumsi sensible
default). User yang ingin kelas spesifik → klik tombol per-class card
("Pick Return · Emerald"), yg override `outboundClass` di URL.

**Zero impact ke one-way**
Branching `isRoundTrip ? … : …` di sidebar + per-class CTA memastikan
jalur one-way existing 100% backward-compatible. Visitor one-way:
URL tidak carry `?trip=…` → `isRoundTrip = false` → render form & CTA
seperti sebelum 4.67.2b.

### Testing (manual — pending user verify)

**One-way baseline (regression)**
- [ ] Buka `/ferry-tickets/<slug>` tanpa URL param. Sidebar: "Reserve Now" + 1 date picker.
- [ ] Submit sidebar → redirect ke `/checkout/ferry-tickets/<slug>?date=…&adults=…&children=…`.
- [ ] Per-class "Book Now" card → redirect ke `/checkout/.../<slug>?class=ekonomi`.
- [ ] Zero visual perubahan di one-way mode (sidebar, header, class cards, layout, animations).

**Round-trip baru**
- [ ] Dari `/ferry-tickets?trip=round-trip&return=2026-10-15` → pilih ferry → klik card.
      Detail page URL = `/ferry-tickets/<slug>?trip=round-trip&date=…&return=2026-10-15&…`.
- [ ] Sidebar menampilkan: banner "Round trip — Step 1 of 2", 2 date picker (Departure + Return), adults/children stepper preserve URL state.
- [ ] Return date `min` = departure date (atau today kalau departure kosong).
- [ ] Tombol: "Continue to pick return →" + sub-text "You'll choose the return ferry on the next page.".
- [ ] Submit → redirect ke `/ferry-tickets?trip=round-trip&outbound=<id>&outboundSlug=<slug>&outboundClass=ekonomi&date=<return>&return=<return>&departure=<date>&adults=…&children=…&origin=<destId>&destination=<origId>`.
      ⚠️ **Listing belum render return-pick mode sampai 4.67.2c** — untuk sekarang listing akan tampil seperti filter biasa dgn param tersebut (akan kelihatan reverse route tetapi tanpa banner "pick your return"). Ini expected.
- [ ] Per-class card CTA (saat dates ready): label "Pick Return · Ekonomi/Emerald", href = listing URL dgn outboundClass=sesuai kelas.
- [ ] Per-class card CTA (saat `date`+`return` kosong, mis. bookmark langsung tanpa widget state): label "Choose Ekonomi/Emerald", dimmed, href `#reserve-form` → scroll ke sidebar.
- [ ] Switch mode: hapus `?trip=round-trip` dari URL manual → sidebar kembali ke "Reserve Now".

**Edge cases**
- [ ] Ferry tanpa `originLocation`/`arrivalLocation` relationship (legacy enum): `originLocId`/`destinationLocId` = null → form hidden input `origin`/`destination` di-skip; listing redirect tetap jalan tapi tanpa pre-filter location. Expected (fallback graceful).
- [ ] `qReturn` dari URL berisi value invalid (mis. `?return=abc`): regex guard → `qReturn = ''` → return date input empty, user harus pick manual.
- [ ] `qDate` empty (user datang tanpa widget state tapi URL ada `trip=round-trip`): departure input empty, user harus pick manual; return `min` fallback ke today.

### Rollback
`git revert <commit-4.67.2b>` → `[slug].astro` kembali ke pre-4.67.2b:
sidebar hanya "Reserve Now", per-class "Book Now" ke checkout langsung.
Visitor dari widget dgn `trip=round-trip` akan treated as one-way (URL
param diabaikan — zero error, hanya kehilangan reverse-pick flow).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2b-detail-page-roundtrip-cta.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru
- [ ] `docs/03-CONTENT-MODEL.md` — tidak perlu update (CMS field tidak berubah).

### Next Steps
- **4.67.2c** — Listing page `/ferry-tickets/index.astro`: render **return-pick mode** banner saat URL carry `?outbound=<id>&trip=round-trip`. Setiap card dapat tombol "Select return →" yg redirect ke `/checkout/ferry-tickets/<outboundSlug>?trip=round-trip&date=<departure>&returnFerryId=<thisId>&returnDate=<return>&outboundClass=…&adults=…&children=…`. **Ini bridge terakhir** antara detail outbound (4.67.2b) & checkout 2-leg (4.67.2d).
