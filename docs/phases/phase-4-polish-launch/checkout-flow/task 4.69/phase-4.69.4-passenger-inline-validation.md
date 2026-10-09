## Phase: 4.69.4 — Passenger Inline Validation (Format, DOB, Issue/Expiry, Duplicate)

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Tambah layer validasi passenger data **inline di form** + **server-side
mirror** untuk defense-in-depth. 5 rule baru (dari §4 phase 4.69 analisa
= R3). Zero schema change — pure logic layer.

Rule yang di-cover:
1. **Passport number format** per nationality (regex ICAO-approx per
   negara + fallback generic 6–12 alfanumerik upper).
2. **DOB sanity vs passenger type** (adult ≥ 12y, child 2–11y pada
   tanggal departure).
3. **Issue date** ≤ today AND ≥ DOB.
4. **Expiry > Issue** (menambah existing `≥ departure+6m` dari Phase 4.63).
5. **Duplicate passport number** reject (same normalized value di ≥ 2
   passenger).

### Keputusan Owner (approved sebelumnya)

- **D4** YES — inline format only (NO identity verification). Rule set
  di sini match persis rekomendasi §4 phase 4.69 analisa.

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/web/src/lib/checkout/passengerValidation.ts` | BARU | SSOT rule set: `PASSPORT_FORMATS` (10 negara + generic fallback), `normalizePassport()`, `validatePassportFormat()`, `ageAt()`, `validatePassenger()` (returns `PassengerIssue[]`), `detectDuplicatePassports()` |
| `apps/web/src/pages/api/bookings/create.ts` | Edit | Import validators, run `validatePassenger` per passenger + `detectDuplicatePassports`, redirect dgn `?err=passenger_<code>` (10 kode baru) kalau ada issue |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Edit | (a) 10 entry baru di `errorMessages` map. (b) Tambah `data-pax-dob`, `data-pax-issue`, `data-pax-expiry`, `data-pax-nationality` ke input existing + `<ul data-pax-errors>` di bawah passport row tiap passenger. (c) ~160 LOC client-side validator mirror lib (standalone — rule constants + regex didup supaya tidak impor library di client bundle Astro); auto-uppercase passport pada input; validate on blur/change; aggregate per-passenger errors + cross-check duplicates; submit handler scan + aggregate ke validation alert existing. |
| `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/phase-4.69.4-passenger-inline-validation.md` | BARU | File ini |

### Arsitektur — Rule Mirror (Client ↔ Server)

Server-side (`passengerValidation.ts`): SSOT, enforced di
`/api/bookings/create` sesudah stamp + email verified + passport-expiry
existing check. Issue list collect → redirect `?err=passenger_<first_code>`
kalau non-empty.

Client-side (`[slug].astro` inline script): mirror rule constants
(`PASSPORT_SPECS`, `ADULT_MIN`, `CHILD_MIN/MAX`), compute per
passenger, render ke `<ul data-pax-errors="{i}">`. Juga full-pass
di submit → block submit + append ke validation alert existing dari
Phase 4.67.3 polish-2.

Trade-off: rule constant diduplicate di 2 tempat (lib + inline script).
Astro doesn't bundle lib ke client script tag secara otomatis — jalur
import akan butuh client component atau build-script custom. Untuk MVP,
dup konstanta + 2 developer test cover drift. Doc ini mencatat lokasi
kedua rule set supaya future refactor (misal pindah ke React component)
bisa unify.

### UI Pattern

```
[Passport Number]  [Issue Date]  [Expiry Date]
─────────────────────────────────────
• Format passport tidak sesuai (1-2 huruf + 7 digit).
• Nomor passport sama dengan Penumpang 2.
```

- `<ul data-pax-errors="{i}">` hidden by default, muncul saat ada issue
- Field offending dapat `ring-2 ring-coral` highlight
- Red-hint style match pattern `#checkoutValidationAlert` existing
  (coral border + list markers)
- Trigger: blur / change event di passport, DOB, issue, expiry, nationality
  (nationality change → re-eval passport format)

### Passport Format Table (10 nasionality + generic)

| Negara | Pattern | Hint |
|---|---|---|
| Indonesia | `^[A-Z]{1,2}\d{7}$` | 1-2 huruf + 7 digit |
| Singapore | `^[A-Z]\d{7}[A-Z]$` | 1 huruf + 7 digit + 1 huruf |
| Malaysia | `^[A-Z]\d{8}$` | 1 huruf + 8 digit |
| Philippines | `^[A-Z]\d{7}[A-Z]?$` | 1 huruf + 7 digit (opsional huruf) |
| Thailand | `^[A-Z]{1,2}\d{7}$` | 1-2 huruf + 7 digit |
| Vietnam | `^[A-Z]\d{7}$` | 1 huruf + 7 digit |
| US / UK | `^\d{9}$` | 9 digit |
| Australia | `^[A-Z]\d{7}$` | 1 huruf + 7 digit |
| Japan | `^[A-Z]{2}\d{7}$` | 2 huruf + 7 digit |
| *fallback* | `^[A-Z0-9]{6,12}$` | 6–12 huruf besar / angka |

Pattern approximation dari ICAO + Wikipedia — tidak 100% strict
(misal: Indonesia check-digit tidak di-validate). Tujuan menangkap
typo nyata, bukan verify authenticity.

### Testing

#### Browser smoke test (localhost:4321, 3 passenger 2A+1C)

| Scenario | Expected | Actual |
|---|---|---|
| Adult pax 0 DOB 2020-01-01 (6y at departure) | "Adult ≥ 12 tahun…" | ✅ shown |
| Child pax 2 DOB 1990-01-01 (36y) | "Child 2–11 tahun…" | ✅ shown |
| Duplicate passport AB1234567 di pax 0 + 1 | Both pax show "Penumpang N" cross-ref | ✅ shown |
| Lowercase `ab1234567` input | Auto-uppercase on blur | ✅ `AB1234567` + detected as dup |
| Pax 1 nat=Indonesia pp=`bad` | "Format passport tidak sesuai (1-2 huruf + 7 digit)." | ✅ shown |
| Pax 0 issue=2026-01-01 expiry=2025-01-01 | "Masa berlaku passport harus setelah tanggal terbit." | ✅ shown |
| All valid data | zero errors in all 3 `<ul>` | ✅ `errorCount: 0` |

#### Server-side guard

Already covered by TypeScript imports. Order di `/api/bookings/create`:
1. Honeypot → rate-limit → stamp → contact fields → **email verified** → departure/return date → passengers presence → **passport expiry (existing)** → **inline validation (NEW)** → ferry verify → store.

Client bypass test: attempt POST dengan passport invalid + bypass
client validator → server reject `?err=passenger_passport_format`.

#### TypeScript check

Zero error baru di 1 file lib + 2 file edit.

### Impact

- **Database**: none
- **CMS**: none
- **Frontend**:
  - `[slug].astro` +~190 LOC inline JS, +~20 LOC markup (`<ul>` tiap passenger)
  - Lib baru 220 LOC (reuse-able by future endpoints)
- **Routes**: none
- **RBAC**: none
- **Env**: none
- **Deploy needed**: **web** saja

### Rollback

Revert 3 file edit. Server guard tidak block existing booking yang
sudah pass (field-level validation hanya di submit path baru). Lib
file bisa di-hapus tanpa affect lain — no other caller.

### Security Notes

- Validation **tidak** reveal apapun yang bersifat sensitif — misal:
  tidak compare passport dengan DB record (karena memang tidak
  ada), tidak expose rule set yang bisa dipakai social engineering
- Pattern per-nationality adalah public info (ICAO), bukan secret
- Duplicate detection batasi scope ke dalam 1 booking saja — tidak
  cross-booking (ada risiko privacy kalau admin bisa infer customer
  pakai passport yang sama di multi-booking)
- Server guard adalah SSOT — client validator UX only

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/PROGRESS.md` — update akhir series 4.69

### Next Steps

**Phase 4.69.5 — Bookings status enum + audit fields**:
1. Migration tambah 4 enum: `awaiting_review`, `payment_review`, `reschedule_request`, `cancel_request`
2. 6 field audit baru: `sentPaymentAt`, `sentPaymentBy`, `sentTicketAt`, `sentTicketBy`, `emailVerifiedAt`, `whatsappVerifiedAt`
3. Default status untuk booking baru → `awaiting_review` (ganti dari `pending`)
4. CMS edit view: status transition hint
