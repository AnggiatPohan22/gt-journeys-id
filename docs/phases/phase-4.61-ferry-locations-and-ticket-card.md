## Phase: 4.61 — Ferry Locations (CMS-managed) + Reusable Ticket Card
**Tanggal**: 2026-09-26
**Status**: Dalam Pengerjaan
**Dikerjakan oleh**: Claude Code

> Phase 4.61 menjadi wadah untuk penyesuaian fitur CMS **skala kecil** ke depannya
> (sub-phase 4.61.x). Task pertama: Origin/Arrival Ferry Tickets dikelola via CMS
> (bukan hardcode) + template card tiket-rute baru yang reusable.

### Ringkasan
Origin/Arrival pada Ferry Tickets sebelumnya adalah `select` hardcoded (4 opsi:
Batam, Tanjung Pinang, Singapore, Malaysia) di 2 tempat (top-level & di dalam
array `scheduleTime`). Diubah menjadi **relationship** ke collection baru generik
**`locations`** sehingga admin bisa menambah lokasi/pelabuhan baru tanpa ubah kode.
Migrasi dilakukan **additif bertahap** agar aman terhadap data existing.

---

### Roadmap (multi-stage)

| Stage | Deskripsi | Status |
|-------|-----------|--------|
| **1** | CMS: collection `locations` + field relationship (additif, select lama disembunyikan tapi belum dihapus) + migration + types | ✅ Selesai |
| **2** | Backfill: seed 4 lokasi awal + isi relationship record ferry existing dari value enum lama | ✅ Selesai |
| **3** | Frontend baca relationship (card + detail page), buang map `portLabel` hardcode | ✅ Selesai |
| 4 | Hapus field `select` lama (origin/arrival, departurePort/arrivalPort) — migration destruktif terpisah | ⬜ Belum (tunda sampai data dikonfirmasi) |
| **5** | Task B: `TicketRouteCard.astro` reusable + variant `ticket` di FerryTicketsCard + field CMS optional kartu | ✅ Selesai |

---

### Stage 1 — File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Locations.ts` | **BARU** — collection lokasi generik reusable (name, terminalName, country, code, slug, isActive, sortOrder). Group `Content`, read publik. |
| `apps/cms/src/payload.config.ts` | Register `Locations` (setelah `Categories`). |
| `apps/cms/src/collections/FerryTickets.ts` | Tambah `originLocation`/`arrivalLocation` (relationship→locations) di samping select lama; tambah `departureLocation`/`arrivalLocation` di `scheduleTime`. Select lama (`origin`,`arrival`,`departurePort`,`arrivalPort`) di-`required:false` + disembunyikan via `admin.condition: () => false` (deprecated, dihapus Stage 4). |
| `apps/cms/src/migrations/20260925_163237_phase_4_61_locations.ts` | **BARU** — CREATE `locations`; tambah kolom FK `origin_location_id`/`arrival_location_id` di `ferry_tickets` & `departure_location_id`/`arrival_location_id` di `ferry_tickets_schedule_time`; kolom `origin`/`arrival` jadi nullable; tambah `locations_id` di `payload_locked_documents_rels`. Diberi guard idempotent (IF NOT EXISTS / DROP IF EXISTS scratch table) + fix quirk drizzle (INSERT…SELECT tidak boleh menyebut kolom baru dari tabel lama). |
| `apps/cms/src/migrations/index.ts` | Register migration baru. |
| `packages/shared/src/types/payload-types.ts` | Regenerated — `Location`, `originLocation`, `arrivalLocation`, `departureLocation`, `arrivalLocation`. |

### Impact
- **Database**: migration ditambah: `20260925_163237_phase_4_61_locations`. Tabel baru `locations`. Kolom additif di `ferry_tickets` & `ferry_tickets_schedule_time`. **Tidak ada data loss** — `origin`/`arrival` lama dipertahankan (nullable).
- **CMS**: Collection baru `Locations` (Content group). Field relationship baru di FerryTickets; select lama disembunyikan.
- **Frontend**: none (Stage 3).
- **Routes**: none.
- **RBAC**: `Locations` — read publik, create=admin+, update=authenticated, delete=super-admin (pola taksonomi standar).

### Testing (Stage 1)
- [x] `pnpm schema:new` → migration ter-generate.
- [x] `pnpm schema:migrate` → sukses (setelah fix quirk drizzle + guard idempotent atas partial-run pertama).
- [x] Verifikasi DB: tabel `locations` ada; `ferry_tickets` punya kolom lama+baru; data record #1 (`singapore→batam`) utuh; `locations_id` di locked_rels.
- [x] `pnpm generate:types` → tipe baru muncul.
- [ ] Manual: buka admin `/admin/collections/locations` & `/admin/collections/ferry-tickets/1` — cek collection + field relationship tampil (perlu dev server, dilakukan owner).

### Rollback (Stage 1)
```
cd apps/cms
pnpm schema:down            # jalankan down() migration ini (drop locations, kembalikan kolom)
# revert file: Locations.ts, payload.config.ts, FerryTickets.ts, migrations/index.ts, payload-types.ts
```
Backup DB pre-migrate: `apps/cms/cms.db.bak-4.61-pre-migrate`.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.61-ferry-locations-and-ticket-card.md` (file ini)
- [ ] `docs/02-DATABASE-SCHEMA.md` (setelah semua stage selesai)
- [ ] `docs/03-CONTENT-MODEL.md` (Stage 3)
- [ ] `docs/PROGRESS.md`

---

### Stage 2 — File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/scripts/seed-locations.ts` | **BARU** — idempotent seed 4 lokasi (Batam/Tanjung Pinang/Singapore/Malaysia + terminalName & code) via Payload Local API, lalu backfill `originLocation`/`arrivalLocation` (dan `scheduleTime[].departureLocation`/`arrivalLocation`) dari value enum lama. |

### Testing (Stage 2)
- [x] `pnpm tsx src/scripts/seed-locations.ts` → 4 lokasi created, ferry #1 ter-backfill.
- [x] Verifikasi DB: locations id 1–4 benar; ferry #1 `origin_location_id=3` (Singapore), `arrival_location_id=1` (Batam) — cocok enum lama (`singapore→batam`).
- [x] Enum lama (`origin`/`arrival`) tetap ada sebagai jaring pengaman.

---

### Stage 3 — File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/lib/location.ts` | **BARU** — helper reusable `resolveLocation()` & `routeLabelFrom()`: resolve nama/terminal lokasi dari relationship (`locations`) dengan fallback ke enum lama. |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Ganti map `portLabel` hardcode dengan `routeLabelFrom(originLocation, arrivalLocation, origin, arrival)`. |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Buang `portLabel` hardcode; route label + schedule rows (departure/arrival) kini via `resolveLocation()`, plus render `terminalName` sebagai baris kedua. |

Catatan depth: `fetchCollection` default `depth=1` (listing) & `fetchBySlug` `depth=2`
(detail) → relationship `locations` otomatis ter-populate jadi objek. Tidak perlu
ubah fetch.

### Testing (Stage 3)
- [x] API `/api/ferry-tickets?depth=1` → `originLocation`="Singapore / Singapore Cruise Center", `arrivalLocation`="Batam / Batam Centre Terminal-BTC".
- [x] Render `/ferry-tickets/bintan-resort-ferries` → route "Singapore → Batam" + terminal name tampil; **0 console error**.
- [x] Fallback enum lama tetap aktif bila relationship kosong.

---

### Stage 5 — File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/cards/TicketRouteCard.astro` | **BARU** — kartu tiket-rute horizontal **reusable & generik** (tak tahu domain). Props: `operator{name,logo}`, `badges[]`, `image`, `from/to{name,terminal,time,date}`, `middle{label,icon,duration,bookedLabel}`, `price{amount,currency,per,total,className,original,savePct}`, `bookHref`, `moreInfoHref`. Responsif (kolom rute menumpuk di mobile). Modul transport lain cukup panggil komponen ini. |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Tambah `variant: 'ticket'` yang mapping data ferry → `TicketRouteCard`. `compact`/`detailed` tetap utuh. |
| `apps/cms/src/collections/FerryTickets.ts` | Field optional baru: collapsible "Card Display (Ticket)" → `operatorLogo` (upload), `bookedCount` (number), `badges[]` (text + style select); `originalPrice` (number) di `ferryClasses`. |
| `apps/cms/src/blocks/index.ts` | Tambah opsi `ticket` di 2 field `cardVariant` (ServiceGrid + ServiceListing). |
| `apps/web/src/components/blocks/ServiceGridBlock.astro`, `ServiceListingEditorial.astro`, `ServiceListingHeroImmersive.astro` | Perlebar tipe `cardVariant` agar meneruskan `'ticket'`. |
| `apps/cms/src/migrations/20260925_171415_phase_4_61_ticket_fields.ts` | **BARU** — CREATE `ferry_tickets_badges`; ADD `original_price` di `ferry_tickets_ferry_classes`; ADD `operator_logo_id` + `booked_count` di `ferry_tickets`. Murni additif (ADD COLUMN, tanpa recreate). |
| `packages/shared/src/types/payload-types.ts` | Regenerated. |

### Impact (Stage 5)
- **Database**: migration `20260925_171415_phase_4_61_ticket_fields` — additif murni, tanpa data loss.
- **CMS**: field kartu optional di FerryTickets; opsi `Ticket` di card style block.
- **Frontend**: komponen reusable `TicketRouteCard` + variant `ticket`.
- **Deploy needed**: cms + web.

### Testing (Stage 5)
- [x] Migration apply + `generate:types` sukses.
- [x] Preview page (temp) render 2 kartu: (A) data ferry asli variant ticket — elemen kosong tersembunyi rapi; (B) sample lengkap **sangat mirip gambar target** (badges, harga+Save%, rute+jam+terminal, booked, More info/Book Now).
- [x] 0 console error (selain 404 gambar sample yang memang kosong).
- [x] Card `compact`/`detailed` lama tidak berubah (zero breaking).

### Cara pakai (owner)
1. Di block listing (ServiceGrid/ServiceListing) untuk Ferry Tickets → **Card Style = Ticket**.
2. Di Ferry Ticket → Overview → **Card Display (Ticket)**: isi operator logo, booked count, badges. Di Schedule & Pricing → Ferry Classes → isi **originalPrice** untuk harga coret + Save%. Jam/tanggal diambil dari Schedule Time baris pertama.

---

### Stage 5.1 — Follow-up fixes (2026-09-26)
Setelah owner mengecek, dua isu ditemukan & diperbaiki:

| Isu | Sebab | Perbaikan | File |
|-----|-------|-----------|------|
| Frontend masih card lama | Variant `ticket` dibuat opt-in; block halaman `/ferry-tickets` masih `cardVariant=compact`. Owner memilih **ferry selalu Ticket otomatis**. | Ferry-tickets kini **default ke `ticket`** di 3 block (override ke `detailed` tetap bisa). | `ServiceGridBlock.astro`, `ServiceListingEditorial.astro`, `ServiceListingHeroImmersive.astro` |
| Kartu ticket terjepit (nama jadi "S."/"B.") | Grid listing 2–3 kolom, padahal ticket horizontal butuh full-width. | Saat `cardVariant==='ticket'` grid jadi **1 kolom full-width** (`grid-cols-1`). | 3 block di atas |
| Preview button ferry → `/tour/<slug>` (404) | `makePreview('/tour')` salah base. | Ganti ke `makePreview('/ferry-tickets')`. | `apps/cms/src/collections/FerryTickets.ts` |

**Verifikasi:** `/ferry-tickets` render 2 kartu Ticket full-width (Batam Fast & Bintan Resort Ferries), nama & terminal tampil penuh (grid `grid-cols-1`, kartu 945px), 0 error. Badges/harga/Save%/booked akan muncul begitu field optional diisi di admin.

**Catatan:** perubahan `preview` di config CMS mungkin perlu restart `pnpm dev` CMS agar terbaca.

### Next Steps
Stage 4 (opsional, destruktif) — hapus field `select` lama
(`origin`,`arrival`,`departurePort`,`arrivalPort`) via migration terpisah +
bersihkan fallback enum di `location.ts`. **Hanya setelah** owner konfirmasi semua
record ferry sudah punya relationship lokasi. Sebelum itu, semua fitur inti sudah
berfungsi dengan fallback aman.
