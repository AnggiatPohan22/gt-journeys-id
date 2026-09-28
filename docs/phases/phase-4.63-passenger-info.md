## Phase: 4.63 — Passenger Information + Contact Enrichment
**Tanggal**: 2026-09-28
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Memperluas form checkout Ferry Ticket dari sekadar "data kontak" menjadi
**contact + passenger array**. Sekarang customer mengisi:
- **Contact**: Full Name, Email (required), Phone `[Region ▾] [Number] [☐ Also WhatsApp]`, Country (opsional), Notes.
- **Passenger blocks (dinamis, jumlah = adults + children)**: Title (Mr/Mrs/Ms/Master/Miss), Gender (Male/Female), Nationality, First Name, Last Name, DOB, Passport Number, Passport Issue Date, Passport Expiry Date, plus checkbox "Remember" yang disabled (siap untuk Phase 4.64).

Passport disimpan **penuh** di CMS (untuk manifest, ticketing, gateway
nanti); di halaman confirmation customer-facing + pesan WhatsApp hanya
tampil **4 digit terakhir** (mis. `••••4567`). Passport expiry
divalidasi server-side: minimal **6 bulan** setelah departure date.

### Keputusan owner (approvals)
1. **[SCHEMA]** Extend `Bookings` (+ 3 contact fields, + `passengers` array). `SavedPassengers` **ditunda ke Phase 4.64** dgn desain keamanan tambahan (endpoint prefill hanya kirim nama+DOB, passport di-resolve server-side saat submit).
2. **[FIELDS]** Tambah `gender` (male/female). Skip middleName & emergencyContact.
3. **[TITLE]** mr/mrs/ms/master/miss.
4. **[REGION]** Hardcode `phoneRegions.ts` (~50 negara SE Asia + APAC + Europe + Americas + Africa, ordered by market relevance).
5. **[REMEMBER PASSENGER]** UI disabled dgn label "Remember (soon)" + tooltip; belum functional.
6. **[VALIDATION]** Passport expiry ≥ departure + 6 bulan.
7. **[CONFIRMATION]** Passenger list tampil di confirmation page & WA message; passport masked 4-digit terakhir.

### File yang Berubah
| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/collections/Bookings.ts` | Edit | +3 kolom contact (`contactPhoneRegion`, `contactPhone`, `contactPhoneIsWhatsapp`). +array `passengers` dgn 10 field (passengerType, title, gender, firstName, lastName, nationality, dateOfBirth, passportNumber, passportIssueDate, passportExpiryDate). `customerWhatsapp` dipertahankan sebagai snapshot final. |
| `apps/cms/src/migrations/20260928_000355_phase_4_63_passengers.{ts,json}` | BARU | Migration: `CREATE TABLE bookings_passengers` (11 kolom + 2 index + FK cascade ke bookings) + 3 kolom baru di `bookings`. |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration. |
| `packages/shared/src/types/payload-types.ts` | Regenerate | Booking type sekarang punya `passengers` array + contact phone fields. |
| `apps/web/src/config/phoneRegions.ts` | BARU | 50 negara dgn `code`/`iso`/`name`/`flag`, ordered SE-Asia first. |
| `apps/web/src/lib/checkout/mask.ts` | BARU | `maskPassport(v)` → `••••{last4}`. Dipakai confirmation page + WA message. |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Rewrite | Form baru: contact section (region dropdown + number + Also-WA checkbox), trip section, passenger blocks (server-render initial + client vanilla JS re-render on adults/children change, preserve values). Notes section. Error messages diperluas (`invalid_passengers`, `invalid_passport_expiry`, `rate_limited`). |
| `apps/web/src/pages/api/bookings/create.ts` | Rewrite | `parsePassengers` (regex `passengers[N][key]` → typed array), `passportExpiryOk` (6-month rule), compose `customerWhatsapp` dari `{region}{phone}`, simpan `passengers` array + 3 kolom contact. |
| `apps/web/src/lib/checkout/channels/manualWhatsApp.ts` | Edit | Pesan WA sekarang berisi section "*Data Penumpang:*" dgn baris per passenger `[Type] Title FirstName LastName · Nationality · DOB · Passport ••••XXXX`. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Edit | Tambah card "Data Penumpang" di antara ringkasan booking & handoff. Passport ditampilkan masked. |
| `docs/phases/phase-4.63-passenger-info.md` | BARU | File ini. |
| `docs/PROGRESS.md` | Edit | Update dashboard header. |

### Impact
- **Database**: 1 tabel baru (`bookings_passengers`), 3 kolom baru di `bookings`. Migration `20260928_000355_phase_4_63_passengers` applied ✓.
- **CMS**: form edit booking di admin sekarang menampilkan array `Passengers` (Payload native repeater UI) + 3 field contact phone. Data 1 record eksisting (`FT-20260927-E2F55C`) tetap valid — field baru nullable / default OK.
- **Frontend**: form checkout Ferry Ticket 2× lebih panjang sekarang tapi 100% functional. JS ~7KB inline untuk dynamic re-render.
- **Routes**: tidak ada perubahan (path lama masih pakai).
- **RBAC**: tidak berubah.
- **Deploy needed**: **cms + web**.

### Testing (dev 4321 + CMS 3030)
- [x] `pnpm schema:migrate` sukses.
- [x] `pnpm generate:types` sukses — `Booking.passengers` array + contact fields ada.
- [x] `pnpm build` web sukses (23.4s, static ferry-tickets tetap prerender).
- [x] Checkout page render — 3 passenger blocks server-side (2 adults + 1 child), region dropdown ada, formStamp signed.
- [x] Submit full form (2 adults + 1 child, semua field + passport) → 302 → confirmation.
- [x] Confirmation page tampil "Data Penumpang" 3 baris. Passport masked `••••4567`, `••••4321`. Raw passport (`A1234567`, `B7654321`) TIDAK muncul di halaman.
- [x] WA message berisi passenger list dgn passport masked (verified via URL decode).
- [x] Server-side validation: `passportExpiryDate = 2027-01-01` untuk `departureDate = 2026-10-15` (jarak <6 bulan) → 302 → `?err=invalid_passport_expiry`.
- [x] Rate-limit 5/15min (Phase 4.62.2) masih jalan.
- [x] Cleanup: test booking `FT-20260927-B30F2B` dihapus. Hanya UAT `FT-20260927-E2F55C` tersisa.

### Batasan yang perlu diketahui
1. **JS re-render adults/children**: nilai passenger yang sudah terisi **hilang** kalau count berkurang lalu bertambah lagi lebih dari sebelumnya (block baru kosong). Nilai di index yang tetap ada — dipertahankan.
2. **Passport masking**: 4 digit terakhir masih bisa cukup untuk brute-force kalau attacker punya nama+DOB. Kalau ini masalah, upgrade masking ke tampilkan hanya 2 digit terakhir atau hilangkan sepenuhnya di customer-facing surface.
3. **DOB validation**: belum ada aturan "adult ≥ X tahun, child < X tahun". Bisa ditambah kalau ferry operator punya rule spesifik.
4. **"Remember this passenger"** checkbox: UI ada tapi disabled — tidak menghasilkan efek apapun saat submit. Perlu Phase 4.64.

### Rollback
```
git checkout HEAD -- apps/cms/src/collections/Bookings.ts \
  apps/cms/src/migrations/index.ts \
  apps/web/src/config/phoneRegions.ts \
  apps/web/src/lib/checkout/mask.ts \
  apps/web/src/lib/checkout/channels/manualWhatsApp.ts \
  apps/web/src/pages/checkout/ferry-tickets/[slug].astro \
  apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro \
  apps/web/src/pages/api/bookings/create.ts

cd apps/cms && pnpm schema:down
rm apps/cms/src/migrations/20260928_000355_phase_4_63_passengers.*
pnpm generate:types
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.63-passenger-info.md` (file ini)
- [x] `docs/PROGRESS.md`

### Next Steps (Phase 4.64 — Saved Passengers, MUST include security notes below)
1. Collection `SavedPassengers` di CMS, indexed by hash(email+phone).
2. Endpoint `GET /api/passengers/saved?contactHash=xxx` — **hanya return nama + DOB** untuk dropdown.
3. Endpoint checkout submit: kalau UI kirim `passengers[N][savedId]`, resolve passport info **server-side** dari `SavedPassengers` (tidak pernah round-trip via browser).
4. UI: dropdown "Load previous passenger" per block; centang "Remember" mengaktifkan simpan post-submit.
5. Retention policy: opsional TTL utk `SavedPassengers` (mis. 2 tahun tanpa aktivitas).
