## Phase: 4.70.2.5 — Reschedule "Previous" Block Fallback

**Tanggal**: 2026-10-14
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Follow-up dari**: [phase-4.70.2.4-reschedule-template-fix-and-cancel-post-payment.md](phase-4.70.2.4-reschedule-template-fix-and-cancel-post-payment.md)

### Konteks

Test Phase 4.70.2.4 ketemu bug: block **Previous** di email reschedule
response kosong (tanggal tidak muncul). Root cause: booking yang di-test
sudah masuk status `reschedule_request` **sebelum** migrasi 4.70.2.4
jalan → kolom snapshot `original_departure_date` dan
`original_schedule_time_label` kosong di DB.

Legacy booking tidak bisa di-backfill karena admin sudah ubah
`departure_date` destructive → nilai asli hilang permanen.

### Keputusan Desain (per user approval)

- **Sembunyikan block Previous** kalau snapshot kosong, bukan placeholder.
  Alasan: placeholder "(tidak tersedia)" malah bikin bingung customer.
  Lebih baik render single "New Departure" card saja.
- Untuk booking BARU (post-migrasi 4.70.2.4), snapshot akan terisi
  normal → block Previous→New tampil utuh.

### Implementasi

#### 1. Server-side composed `{{departureBlock}}`

Pindahkan logic "Previous→New vs single card" ke server, inject sebagai
raw HTML variable ke template. Template cuma punya satu slot
`{{departureBlock}}`.

File: [apps/cms/src/collections/Bookings.ts](../../../../apps/cms/src/collections/Bookings.ts)

Helper baru `buildDepartureBlock(booking, brandAccentColor)`:
- Kalau `booking.originalDepartureDate` kosong → render single card hijau
  dengan label "New Departure".
- Kalau ada → render dual block: kiri merah strikethrough (Previous),
  arrow tengah, kanan hijau bold (New).
- Format tanggal pakai `toLocaleDateString('en-GB')` + append time label
  kalau ada (`"15 Oct 2026 · 08:30"`).
- Escape semua value dgn `escapeAttr()` untuk XSS safety.

HTML di-inject ke `ctx.departureBlock`. Register di `RAW_VARS` supaya
tidak di-escape saat render:
```ts
const RAW_VARS = new Set(['brandHeaderHtml', 'departureBlock'])
```

#### 2. Template simplification

File: [apps/cms/src/globals/bookingTemplatesDefaults.ts](../../../../apps/cms/src/globals/bookingTemplatesDefaults.ts)

Replace inline `<table>` Previous→New di
`DEFAULT_RESCHEDULE_EMAIL_BODY_HTML` dengan single var:
```html
{{departureBlock}}
```

#### 3. Register var di both templateRenderer

- `apps/cms/src/lib/templateRenderer.ts`
- `apps/web/src/lib/checkout/templateRenderer.ts`

Tambah `departureBlock` ke `KNOWN_VARIABLES` + `OPTIONAL_VARIABLES`
(OPTIONAL supaya kosong-empty tidak error — walau praktis server
selalu kirim non-empty string).

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Bookings.ts` | +`buildDepartureBlock` helper, +`departureBlock` ke RAW_VARS, inject ke ctx di `handleSendResponse`. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Reschedule template: `<table Previous→New>` → `{{departureBlock}}`. |
| `apps/cms/src/lib/templateRenderer.ts` | +`departureBlock` ke KNOWN+OPTIONAL. |
| `apps/web/src/lib/checkout/templateRenderer.ts` | Idem (SSOT mirror). |

### Testing

```
1. Restart CMS dev (no migration needed — Phase 4.70.2.4 migrasi sudah run).
2. Legacy booking test:
   - Buka booking yg sudah status reschedule_request pre-4.70.2.4
     (test dari sesi sebelumnya).
   - Admin edit departureDate → save.
   - Click "Send Reschedule Response" → cek preview + email.
   - Expected: SINGLE "New Departure" card (hijau). TIDAK ADA block
     "Previous" kosong.
3. New booking test (verify snapshot flow kerja):
   - Buat booking baru → checkout sampai awaiting_payment.
   - Confirmation page → Request Reschedule, isi reason.
   - Admin edit departureDate → save.
   - Send Reschedule Response → email expected: dual block
     "Previous → New" dengan tanggal asli di kiri (strikethrough) dan
     tanggal baru di kanan.
```

### Impact

- **Database**: zero.
- **CMS**: 1 helper function + template HTML slot change.
- **Frontend web**: 1 KNOWN var registration.
- **Env**: zero.
- **Deploy needed**: **cms + web** (web minimal, hanya KNOWN set sync).
- **Breaking**: tidak — booking dgn snapshot ada tetap render dual block.

### Known Limitations

- Admin tidak bisa edit layout `departureBlock` via CMS (sekarang
  server-composed). Trade-off accepted: logic kondisional "ada snapshot
  vs tidak" sulit express di plain template. Admin masih bisa edit
  wrapper `rescheduleEmailBodyHtml` kalau mau ubah styling sekitarnya.
- Fallback single card tetap pakai `brandAccentColor` untuk arrow →
  hanya relevant kalau dual block aktif.
