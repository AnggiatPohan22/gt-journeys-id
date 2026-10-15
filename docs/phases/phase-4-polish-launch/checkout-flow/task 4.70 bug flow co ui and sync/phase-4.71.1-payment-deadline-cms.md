# Phase 4.71.1 — Payment Deadline CMS-editable + Readable Format

**Status**: ✅ Implemented
**Branch**: `feat/payment-deadline-cms-phase-4.71.1`
**Date**: 2026-10-15
**Depends on**: Phase 4.71 (checkout-cms sync)

---

## 1. Context

Admin melaporkan dua masalah terkait payment deadline:
1. Deadline window **tidak terlihat bisa di-edit** di CMS (field tersembunyi di tab "Bank Accounts").
2. Pada **Send Payment Instructions** preview + email, `{{paymentDeadline}}` render raw ISO (`2026-10-20T07:30:00.000Z`) di section "Pay before" — tidak readable.

Audit menunjukkan field `paymentDeadlineHours` sudah ada di `BookingTemplates` global (sejak Phase 4.69.6), tapi lokasinya di tab "Bank Accounts" yang tidak kontekstual. Rendering bug mirror Phase 4.71 (`departureDate`): raw ISO di-emit langsung.

---

## 2. Changes

### A. UI — Pindah field ke tab yang kontekstual

[apps/cms/src/globals/BookingTemplates.ts](apps/cms/src/globals/BookingTemplates.ts)

- Pindah `paymentDeadlineHours` dari tab **"Bank Accounts"** → tab **"Payment Instructions"** sebagai field pertama (di atas hero fields). Description di-expand: "Window pembayaran dalam JAM dari saat email dikirim. Default 24 (1 hari). Range 1–168 jam. Dipakai menghitung {{paymentDeadline}} dan {{paymentDeadlineDisplay}}."
- Schema DB tidak berubah — kolom `payment_deadline_hours` tetap di tabel `booking_templates`.

### B. Variable baru `{{paymentDeadlineDisplay}}`

[apps/cms/src/lib/templateRenderer.ts](apps/cms/src/lib/templateRenderer.ts)

- Tambah helper `formatPaymentDeadlineDisplay(iso)` pakai `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Makassar', ... })` → format `"20 Oct 2026, 14:30 WITA"`.
- Register `paymentDeadlineDisplay` di `KNOWN_VARIABLES` dan `OPTIONAL_VARIABLES`.
- Expand `buildContext()` type signature untuk accept `paymentDeadlineDisplay` di extras.
- `{{paymentDeadline}}` tetap valid sebagai raw ISO (backward-compat untuk admin yang customize).

[apps/cms/src/collections/Bookings.ts](apps/cms/src/collections/Bookings.ts)

- `sendPaymentEndpoint` sekarang pass `paymentDeadlineDisplay: formatPaymentDeadlineDisplay(deadlineIso) ?? deadlineIso` ke context.

### C. Default template swap

- [bookingTemplatesDefaults.ts](apps/cms/src/globals/bookingTemplatesDefaults.ts):
  - `paymentHeroSubtext`: `{{paymentDeadline}}` → `{{paymentDeadlineDisplay}}`.
  - HTML "Pay before" box: `{{paymentDeadline}}` → `{{paymentDeadlineDisplay}}`.
- [BookingTemplates.ts](apps/cms/src/globals/BookingTemplates.ts):
  - `paymentEmailBody` (text): same swap.
  - `paymentWhatsappBody`: same swap.
  - Variables Reference tab doc di-update tambah `{{paymentDeadlineDisplay}}` entry.

### D. Migration `20261016_120000_phase_4_71_1_payment_deadline`

Conditional UPDATE 3 text templates (payment email, payment WA, payment hero subtext) + REPLACE() substring untuk payment HTML. Pattern mirror Phase 4.71 — admin-customized rows TIDAK ter-touch, hanya rows yang masih di default lama ter-update.

Reversible via `down()`.

---

## 3. Test plan

1. **Admin UI** — Buka BookingTemplates global → tab "Payment Instructions" → field `paymentDeadlineHours` muncul paling atas, bisa di-edit (1–168 jam).
2. **Preview Send Payment** — Set `paymentDeadlineHours = 48`, preview booking baru. Section "Pay before" render e.g. `"17 Oct 2026, 14:30 WITA"` (bukan ISO raw).
3. **Email + WA body** — Text version render "Batas waktu pembayaran: 17 Oct 2026, 14:30 WITA".
4. **Custom edit admin** — Admin yang pre-migrate sudah modifikasi `payment_email_body` dengan string lain → migration TIDAK ter-touch (verify dgn test customized row).
5. **Deadline hours edit** — Ubah 24 → 72, kirim payment. Deadline di email bergeser 48 jam dari kirim.
6. **Backward compat** — Admin yang pakai `{{paymentDeadline}}` manual (raw ISO) tetap render ISO (variable tetap valid).
7. **Timezone edge** — Deadline di 00:30 UTC render WITA (08:30 WITA). Verify tanggal + jam konsisten di Makassar tz.
8. **Migration down** — Run `payload migrate:down` → kembali ke `{{paymentDeadline}}` di default rows.

---

## 4. Files changed

```
apps/cms/src/globals/BookingTemplates.ts
apps/cms/src/globals/bookingTemplatesDefaults.ts
apps/cms/src/collections/Bookings.ts
apps/cms/src/lib/templateRenderer.ts
apps/cms/src/migrations/20261016_120000_phase_4_71_1_payment_deadline.ts (NEW)
apps/cms/src/migrations/index.ts
```

---

## 5. Deployment

```bash
pnpm --filter cms payload migrate
```

Expected: `✔ Migrating... 20261016_120000_phase_4_71_1_payment_deadline`.

---

## 6. Not in scope

- Multiple deadline presets per channel/service type (hanya 1 global setting).
- Timezone selector di CMS (hardcoded Asia/Makassar sesuai convention Phase 4.70.3.1).
- Reminder email saat deadline-X-hours (defer, feature baru).
- Admin UI label rename "Payment Settings & Banks" (defer; cosmetic).
