## Phase: 4.67.2a — Bookings Round-Trip Schema

**Tanggal**: 2026-10-07
**Status**: Selesai (migration applied batch 43, types regenerated)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Tambah `tripType` (one-way / round-trip, default one-way) + 10 field snapshot
leg return di collection `Bookings`. Semua additive, non-destructive —
booking 1-leg existing tetap valid tanpa backfill. Nama kolom strict
parallel ke outbound supaya future migration ke multi-city `legs[]` cukup
copy-and-rename.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Bookings.ts` | +`tripType` select di sidebar (default `one-way`), +collapsible "Return Trip" conditional (`data.tripType === 'round-trip'`) berisi 10 field: `returnDate`, `returnFerryTicket` (relationship → ferry-tickets), `returnOriginLocation`, `returnDestinationLocation`, `returnScheduleTimeLabel`, `returnFerryClassName`, `returnFerryClassType`, `returnUnitPrice`, `returnTotalEstimate`. Update deskripsi `totalEstimate` → "grand total (outbound + return) kalau round-trip". Komentar inline jelaskan migration path ke multi-city. |
| `apps/cms/src/migrations/20261007_061355_phase_4_67_2a_bookings_roundtrip.ts` | Migration baru. `up()` 11 statements (10 ADD COLUMN + 1 CREATE INDEX). `down()` 11 statements (DROP INDEX + 10 DROP COLUMN). |
| `apps/cms/src/migrations/20261007_061355_phase_4_67_2a_bookings_roundtrip.json` | Snapshot schema state terbaru (auto). |
| `apps/cms/src/migrations/index.ts` | +Entry baru untuk migration. |
| `packages/shared/src/types/payload-types.ts` | Regenerated — interface `Booking` dapat `tripType`, `returnDate`, `returnFerryTicket`, dst. Interface `BookingsSelect` juga diupdate. |

### Impact
- **Database**: migration `20261007_061355_phase_4_67_2a_bookings_roundtrip` applied di batch 43. Tabel `bookings` total 40 kolom (30 → 40). Index baru: `bookings_return_ferry_ticket_idx`.
- **CMS**: Admin Bookings edit view — field `tripType` muncul di sidebar; collapsible "Return Trip" hanya tampil saat `tripType=round-trip` (default `one-way`, hidden).
- **Frontend**: ZERO perubahan di 4.67.2a. UI round-trip (detail → listing return → checkout → confirmation → WA) menyusul di sub-phase 4.67.2b–g.
- **Routes**: none.
- **RBAC**: none — pakai access rule yang sama dgn kolom lain di `Bookings`.

### Design Decisions

**Catatan drift migration generator**
`pnpm schema:new` emit diff out-of-scope untuk `site_settings` (brand
rename 4.73), `popup_settings` (EN defaults 20260930_120000), dan
`bookings.access_token` (4.66.5) karena 3 migration itu hand-written
tanpa `.json` snapshot — generator anggap mereka "belum ada" lalu re-emit.
Semua drift sudah live di DB, jadi diff out-of-scope di-STRIP manual dari
`.ts` file. `.json` snapshot dibiarkan menyimpan state penuh — baseline
akurat untuk migration berikutnya tidak akan repeat drift. **Rekomendasi
untuk workflow mendatang**: hand-written migration selalu disertai
`.json` snapshot (pola yang sudah dipakai sejak phase 4.61+).

**Kenapa `tripType` NOT NULL default `one-way` (bukan nullable)?**
Konsisten dgn `status`, `channel`, `serviceType` yang juga NOT NULL
default. Visitor tidak pernah lihat booking `trip_type=NULL` di admin
list — selalu ada display value. Backfill = GRATIS karena DEFAULT clause.

**Kenapa `returnFerryTicket` BUKAN NOT NULL?**
Round-trip booking butuh return ferry — tapi 1-leg existing (dan 1-leg
future) tidak. NULL = benar untuk one-way. Validasi "wajib ada kalau
round-trip" dilakukan di API endpoint (4.67.2e), bukan di schema level,
karena schema-level rule tidak bisa express conditional constraint
cross-field di SQLite tanpa trigger.

**Kenapa `collapsible` BUKAN `group`?**
`collapsible` memberi admin opsi collapse/expand (hemat vertikal), dan
`condition` membuat section hilang total saat one-way (bukan collapsed
kosong). `group` tetap render container kosong — noisy.

**Field naming strict-parallel**
`departureDate ↔ returnDate`, `ferryTicket ↔ returnFerryTicket`, dst.
Zero deviation. Alasan: migration path ke `legs: [{date, ferry, …}]`
tinggal copy outbound → legs[0] dan return → legs[1] secara mekanis.
Kalau sekarang pakai `secondLegDate` atau `backTripFerry`, migration
nanti harus rename yang bikin diff lebih riskan.

### Testing

- [x] `pnpm schema:migrate` sukses — migration applied, no error.
- [x] `PRAGMA table_info(bookings)` menampilkan 40 kolom (10 kolom round-trip baru hadir).
- [x] `PRAGMA index_list(bookings)` menampilkan `bookings_return_ferry_ticket_idx`.
- [x] `payload_migrations` berisi row `20261007_061355_phase_4_67_2a_bookings_roundtrip` batch 43.
- [x] `pnpm generate:types` sukses — interface `Booking` + `BookingsSelect` punya field baru di `packages/shared/src/types/payload-types.ts`.
- [ ] Admin UI smoke test — buka `/admin/collections/bookings/create`, verify `tripType` di sidebar + collapsible "Return Trip" conditional. **Pending user manual verify.**
- [ ] Booking existing (1-leg): buka edit view, verify tidak ada field "Return Trip" (karena `tripType=one-way`). **Pending user manual verify.**

### Rollback
```powershell
cd apps/cms
pnpm schema:down   # roll back batch 43 → 42
```
Lalu `git revert` commit ini → `Bookings.ts` + `payload-types.ts`
kembali ke keadaan pre-4.67.2a. Zero data loss untuk booking 1-leg.
Booking round-trip yang terlanjur persist (kalau ada antara deploy &
rollback) akan kehilangan 10 field return — leg outbound tetap utuh.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2a-bookings-roundtrip-schema.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru
- [x] `docs/02-DATABASE-SCHEMA.md` — entry Bookings.tripType + 10 field return

### Next Steps
- **4.67.2b** — Detail page `/ferry-tickets/[slug].astro`: deteksi
  `trip=round-trip` dari URL → tombol sidebar jadi "Continue to pick return"
  yang redirect ke listing `/ferry-tickets?origin=…&destination=…&date=return&outbound=…&outboundDate=…&outboundClass=…`.
- **4.67.2c** — Listing page `/ferry-tickets/index.astro`: mode
  return-pick (MVP ringkas) — passthrough state ke checkout.
- **4.67.2d–g** — Checkout, API, Confirmation, WA message (lihat
  [phase-4.67.2-roundtrip-booking-audit.md](phase-4.67.2-roundtrip-booking-audit.md) section 10).
