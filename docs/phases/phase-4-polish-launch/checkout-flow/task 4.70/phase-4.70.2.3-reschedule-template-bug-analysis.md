## Phase: 4.70.2.3 — Reschedule Response Template & Business Rule Analysis

**Tanggal**: 2026-10-13
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: 📋 Analisa — belum implementasi (user minta analisa dulu)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Follow-up dari**: [phase-4.70.2.2-customer-request-alert-banner.md](phase-4.70.2.2-customer-request-alert-banner.md)

### Konteks

User test flow reschedule dengan case nyata:

- Booking `#11` (status `reschedule_request`, awal berangkat tanggal X)
- Customer isi reason: "pindah ke tanggal 15 October 2026, jam & rute sama"
- Admin ubah `departureDate` di CMS → `2026-10-15`
- Admin klik **Send Reschedule Response** → preview + email terkirim

Masalah ditemukan di email render + juga satu pertanyaan business rule
untuk reschedule setelah pembayaran. Report ini **tidak melakukan
implementasi** — hanya analisa, trade-off, dan rekomendasi untuk approval
user.

---

### Bug Report A — Reschedule email template salah informasi

#### A1. "Current departure" ambigu — tidak jelas mana sebelum/sesudah

Lokasi:
[apps/cms/src/globals/bookingTemplatesDefaults.ts:332](../../../../apps/cms/src/globals/bookingTemplatesDefaults.ts) baris 332

```html
<tr><td>Current departure</td><td align="right">{{departureDate}}</td></tr>
```

Yang di-render: hanya 1 baris `departureDate` → ini adalah tanggal **BARU**
(karena admin sudah ubah sebelum klik Send). Customer tidak lihat tanggal
awal → bingung konfirmasi perubahan.

**Expected UX** (per user):
- Baris 1: `Previous departure` (tanggal lama)
- Baris 2: `New departure` (tanggal baru)
- Hint visual: strikethrough / arrow / warna beda untuk kontras

**Root cause**: data model tidak snapshot `departureDate` lama saat
customer click Request Reschedule. Endpoint
[customer-request](../../../../apps/cms/src/collections/Bookings.ts) hanya
tulis 3 field: `status`, `customerRequestKind`, `customerRequestReason`,
`customerRequestedAt`. Admin ubah `departureDate` destructive → nilai lama
hilang permanen.

#### A2. Waktu keberangkatan tampil `00:00:00.000Z`

Lokasi: context pass `departureDate: booking.departureDate` di
[apps/cms/src/lib/templateRenderer.ts:245](../../../../apps/cms/src/lib/templateRenderer.ts).

Payload field config:
```ts
{ name: 'departureDate', type: 'date', required: true,
  admin: { date: { pickerAppearance: 'dayOnly' } } }
```

`pickerAppearance: 'dayOnly'` → UI picker day-only, tapi Payload tetap
simpan sebagai full ISO datetime di DB. Default time = midnight UTC →
`2026-10-15T00:00:00.000Z`. Template render raw ISO string → tampilan
jelek.

Field waktu asli ada di [Bookings.ts:1003](../../../../apps/cms/src/collections/Bookings.ts):
```ts
{ name: 'scheduleTimeLabel', ... }   // ex: "08:30", "14:00"
```

Ini **TIDAK** diteruskan oleh `buildContext()` ke template → variable
`{{scheduleTimeLabel}}` tidak available. Perlu di-wire ulang di 2 tempat:
1. [templateRenderer.ts](../../../../apps/cms/src/lib/templateRenderer.ts) — tambah ke `TemplateContext`, KNOWN, buildContext mapping
2. [cms versi mirror](../../../../apps/cms/src/lib/templateRenderer.ts) — SSOT di web, apps/cms juga punya mirror

#### A3. "Your Reason" + "Our Response" rendundan untuk customer

Current output:
```
🔁 Reschedule Request
...
Your Reason:
  "Pindah ke 15 October, kerjaan"

Our Response:
  [free text admin]
```

**User feedback**: section `Your Reason` tidak perlu untuk customer
(customer sudah tahu alasannya — toh dia yang tulis). Dan `Our Response`
header verbose.

**Expected**: email cukup langsung sampaikan **detail tiket baru + status
pembayaran**, meniru pola **Payment Instructions** template. Hirarki:

```
🔁 Reschedule confirmed
├─ Booking Reference
├─ Previous departure → New departure (visual contrast)
├─ Updated trip details (route, class, pax)
├─ Payment status conditional:
│   • Jika belum bayar → block bank transfer + bukti transfer
│   • Jika sudah bayar → block "Simpan bukti pembayaran kamu"
└─ Admin note (opsional, free text pendek — bukan "Our Response" header)
```

Reason customer tidak perlu echo kembali; sudah di-audit via
`customerRequestReason` di DB + banner admin.

---

### Bug Report B — Business rule: boleh reschedule setelah payment?

#### User's proposed policy

> Reschedule hanya bisa dilakukan **sebelum payment**. Setelah admin
> kirim e-ticket dan status = `confirmed`, reschedule DILARANG. Customer
> harus kontak admin langsung untuk kasus exceptional.
>
> Cancel tetap boleh **sebelum atau sesudah payment** (refund flow
> terpisah).

#### Analisa trade-off

**Status checkpoint saat ini** (Phase 4.70.2.1):

| Status | Customer bisa reschedule? | Customer bisa cancel? |
|---|---|---|
| `pending` / `awaiting_review` / `awaiting_payment` / `payment_review` | ✅ (via confirmation page button) | ✅ |
| `confirmed` (sudah bayar + e-ticket terkirim) | ❌ (tombol disembunyikan di 4.70.2.1) | ❌ (tombol juga disembunyikan — **ini masalahnya**) |
| `cancelled` / `expired` / `cancel_request` / `reschedule_request` | ❌ | ❌ |

**Observasi**: di 4.70.2.1, kedua tombol (reschedule + cancel)
disembunyikan serempak saat `confirmed`. User sekarang minta
**pisahkan** policy keduanya.

**Argumen pro-pisah** (saya setuju):
- **Reschedule post-payment** = kompleks: butuh koordinasi ulang kursi,
  ferry schedule, kemungkinan beda harga tiket. Risiko tinggi inkonsistensi
  data + penipuan ("saya sudah bayar, tolong pindah tanggal" padahal
  tiket sudah di-issue oleh operator).
- **Cancel post-payment** = refund flow. Umumnya partial refund
  (cancellation fee), tapi flow-nya linear: void tiket + proses refund.
  Industry standard allow cancellation post-payment dengan fee.
- **Ferry operator SOP**: tiket sudah issued = booking kursi sudah tercatat
  di manifest operator. Reschedule = reissue tiket + re-coordinate; cancel
  = release kursi + mark voided. Operasional cancel lebih sederhana.

**Argumen contra-pisah**:
- UI jadi lebih complex (conditional per button). Tapi minor — satu
  Set check tambahan.
- Customer mungkin bingung kenapa boleh cancel tapi tidak reschedule.
  → Mitigasi: UI copy jelas ("Cancel booking (refund fee berlaku)"
  vs disabled reschedule dengan hint "Reschedule setelah pembayaran?
  Kontak admin via WA").

**Rekomendasi**: setuju dengan proposed policy user. Reschedule lebih
restrictive dari cancel adalah pattern industry-common (Garuda, AirAsia,
pelni semua pakai pattern mirip).

#### Proposed state matrix (jika di-approve)

| Status | Can reschedule? | Can cancel? | UI pada confirmation page |
|---|---|---|---|
| `pending` → `payment_review` | ✅ | ✅ | 2 tombol enabled |
| `confirmed` | ❌ | ✅ (dengan warning fee) | 1 tombol (cancel only) + hint reschedule |
| `reschedule_request` / `cancel_request` | ❌ | ❌ | Pending state message |
| `cancelled` / `expired` | ❌ | ❌ | Terminal state |

Server-side (endpoint
[customer-request](../../../../apps/cms/src/collections/Bookings.ts)) perlu
split: `activeStatusesForReschedule` ≠ `activeStatusesForCancel`.

---

### Required Changes (jika di-approve, DILAKUKAN DI PHASE TERPISAH)

#### Backend / data (schema)

1. **Snapshot `departureDate` lama** saat customer request reschedule.
   - Opsi A: tambah field `originalDepartureDate` + `originalScheduleTimeLabel`
     di Bookings. Set oleh endpoint `customer-request` dari current
     booking value. Clear ketika admin send response (atau keep forever
     untuk audit).
   - Opsi B: simpan sebagai JSON blob di `customerRequestSnapshot`
     (object: `{ departureDate, scheduleTimeLabel, originLocation, destinationLocation }`).
     Lebih flexibel tapi less schema-rigor.
   - **Rekomendasi**: Opsi A (dua kolom explicit, type-safe, mudah di-render di template).

2. **Expose `scheduleTimeLabel` ke template context**.
   - Edit 2 file `templateRenderer.ts` (web + cms mirror):
     - Tambah ke `TemplateContext` interface + `KNOWN` set.
     - Tambah ke `buildContext()` return.
     - Format `departureDate` jadi `dd MMM yyyy` (bukan ISO) via helper.
     - Compose displayable string: `{{departureDisplay}}` = `"15 Oct 2026 · 08:30"`.

#### Email template (reschedule)

3. **Rewrite** `DEFAULT_RESCHEDULE_EMAIL_BODY_HTML` dengan struktur:
   - Hero (keep)
   - Booking ref + **Previous departure → New departure** block (visual
     contrast: strikethrough tanggal lama, arrow, tanggal baru bold)
   - Trip details (route, class, pax — pakai nilai current)
   - **Payment status conditional**:
     - If `status in ['awaiting_payment', 'payment_review', 'awaiting_review']`:
       render payment block (bank transfer + CTA WA bukti transfer).
       Reuse snippet dari `DEFAULT_PAYMENT_EMAIL_BODY_HTML`.
     - If `status === 'confirmed'`: render "Simpan bukti pembayaran kamu"
       hint saja — tapi **ini tidak akan ketemu** karena policy baru
       (B) blokir reschedule post-payment. Jadi effectively hanya cabang
       `unpaid` yang kena.
   - Admin note (opsional, inline free text — hilangkan "Our Response" header)
   - Hilangkan "Your Reason" block

4. **Default field values**: update `rescheduleHeroHeadline` + Subtext
   di `defaultFieldValues` biar match context baru ("Reschedule
   confirmed — detail tiket kamu di bawah").

5. **CMS editable fields**: Phase 4.70.2 sudah expose
   `rescheduleEmailBodyHtml`. Admin masih bisa override full HTML kalau
   mau. Tapi mungkin tambah 1 field `rescheduleAdminNote` (textarea)
   supaya admin bisa isi short note tanpa edit raw HTML.

#### Business rule enforcement

6. **Split `activeStatuses`** di `customer-request` endpoint:
   ```ts
   const activeForReschedule = ['awaiting_review','awaiting_payment','payment_review','pending']
   const activeForCancel = [...activeForReschedule, 'confirmed']
   ```
   Return `409 status_locked` kalau mismatch.

7. **Confirmation page UI**
   ([apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](../../../../apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro)):
   dua Set terpisah untuk kedua tombol. Status `confirmed` → hanya
   render tombol Cancel + hint reschedule.

---

### File yang Akan Berubah (preview — belum dilakukan)

| File | Rencana perubahan |
|------|-----------|
| `apps/cms/src/migrations/20261013_*_originalDeparture.ts` | **BARU** — ADD COLUMN `original_departure_date`, `original_schedule_time_label` di `bookings`. |
| `apps/cms/src/collections/Bookings.ts` | +2 hidden fields untuk snapshot. `customer-request` endpoint snapshot + split `activeStatuses`. |
| `apps/cms/src/lib/templateRenderer.ts` + `apps/web/src/lib/templateRenderer.ts` | Expose `scheduleTimeLabel`, `departureDisplay`, `originalDepartureDisplay` ke context + KNOWN. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Rewrite `DEFAULT_RESCHEDULE_EMAIL_BODY_HTML` + update `defaultFieldValues` + opsional +1 field `rescheduleAdminNote`. |
| `apps/cms/src/globals/BookingTemplates.ts` | +1 field `rescheduleAdminNote` (opsional). |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Split active status Set — reschedule vs cancel. UI hint untuk status `confirmed`. |

### Pertanyaan untuk User

Sebelum implementasi, saya butuh konfirmasi:

1. **Snapshot original departure**: pakai Opsi A (2 kolom explicit) atau Opsi B (JSON blob)? → saya rekomendasi A.
2. **Admin note di reschedule template**: perlu tambah field terpisah di CMS? atau cukup edit `rescheduleEmailBodyHtml` raw?
3. **Policy cancel post-payment**: perlu display warning "cancellation fee berlaku" di UI tombol? Atau pure flow (customer klik → ketemu admin lewat WA)?
4. **Grouping phase**: implementasi digabung di satu phase 4.70.2.4, atau pisah jadi dua (4.70.2.4 template fix, 4.70.2.5 business rule)?

### Known Non-Issues (konfirmasi tidak ter-affect)

- Cancel template struktur: tidak ter-affect oleh bug ini. Tetap pakai pattern current (reason + response).
- OTP / Payment / Confirmation template: tidak ter-affect.
- Banner request alert (4.70.2.2): tetap bekerja — baca `customerRequestReason` dari form fields.

### Impact (estimasi untuk phase implementasi nanti)

- **Database**: +2 kolom di `bookings` (nullable). 1 migration.
- **CMS**: endpoint + template refactor, +1 optional field.
- **Frontend web**: 1 Set split + 1 UI copy update.
- **Env**: zero.
- **Deploy needed**: **cms + web** (bersamaan, karena schema + UI).
- **Breaking**: tidak — field baru nullable, status matrix additive.
