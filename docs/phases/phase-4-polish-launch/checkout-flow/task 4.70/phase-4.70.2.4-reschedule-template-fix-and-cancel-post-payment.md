## Phase: 4.70.2.4 — Reschedule Template Fix + Cancel Post-Payment

**Tanggal**: 2026-10-13
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Analisa**: [phase-4.70.2.3-reschedule-template-bug-analysis.md](phase-4.70.2.3-reschedule-template-bug-analysis.md)

### Konteks

User temukan 2 masalah di flow reschedule:

1. **Email template reschedule** salah info — hanya 1 baris "Current
   departure" (yang sudah ter-overwrite), waktu `00:00:00.000Z`, section
   "Your Reason" + "Our Response" verbose.
2. **Business rule**: reschedule setelah payment risiko tinggi
   (tiket sudah issued). Policy baru: reschedule pre-payment only, cancel
   boleh pre+post-payment.

User pilih **Opsi A** (dua kolom snapshot explicit) + **satu phase**
untuk gabung template fix + business rule.

### Perubahan

#### 1. Snapshot original departure (schema)

File: `apps/cms/src/migrations/20261013_120000_phase_4_70_2_4_reschedule_snapshot.ts`

```sql
ALTER TABLE bookings ADD original_departure_date text;
ALTER TABLE bookings ADD original_schedule_time_label text;
```

Nullable; booking existing tidak terdampak.

Fields di `Bookings.ts` → `admin.hidden: true` + `readOnly`. Data persisted
di DB, dibaca template renderer saat admin kirim reschedule response.

#### 2. Customer-request endpoint — snapshot + split status

[apps/cms/src/collections/Bookings.ts](../../../../apps/cms/src/collections/Bookings.ts)
`customerRequestEndpoint`:

- **Split `activeStatuses`** per kind:
  - `activeForReschedule`: `['awaiting_review', 'awaiting_payment', 'payment_review', 'pending']`
  - `activeForCancel`: idem + `'confirmed'`
- Error message khusus kalau reschedule confirmed booking:
  `"Reschedule tidak tersedia setelah pembayaran. Silakan kontak admin via WhatsApp."`
- Saat `kind === 'reschedule'`, snapshot `departureDate` + `scheduleTimeLabel`
  ke dua kolom baru → admin boleh ubah `departureDate` setelahnya tanpa
  kehilangan referensi awal.

#### 3. Template renderer — expose snapshot + display helper

Edit DUA file (SSOT di web):
- `apps/web/src/lib/checkout/templateRenderer.ts`
- `apps/cms/src/lib/templateRenderer.ts`

Tambah:
- `KNOWN_VARIABLES` + `OPTIONAL_VARIABLES`: `scheduleTimeLabel`,
  `originalDepartureDate`, `originalScheduleTimeLabel`, `departureDisplay`,
  `originalDepartureDisplay`.
- `BookingLike` interface: 3 fields baru.
- `buildContext()`: expose 5 vars baru.
- **Helper baru** `formatDepartureDisplay(iso, timeLabel)` → `"15 Oct 2026"`
  atau `"15 Oct 2026 · 08:30 → 09:30"`. Pakai `toLocaleDateString('en-GB')`
  dengan fallback raw string kalau parse gagal.

#### 4. Rewrite `DEFAULT_RESCHEDULE_EMAIL_BODY_HTML`

File: `apps/cms/src/globals/bookingTemplatesDefaults.ts`

Struktur baru:
1. Hero (keep, headline di-update → "Reschedule confirmed")
2. **Previous → New departure block** — dua kolom side-by-side:
   - Kiri: merah strikethrough `{{originalDepartureDisplay}}`
   - Panah tengah
   - Kanan: hijau bold `{{departureDisplay}}`
3. Trip details (route, class, pax) — ambil dari current booking
4. Admin note inline (`{{rescheduleEmailBody}}` tanpa header "Our Response")
5. **Payment Instructions block** (total + bank + CTA WA bukti transfer) —
   reuse pola Payment email, karena reschedule hanya pre-payment =
   customer PASTI belum bayar.

**Dihilangkan**:
- Section "Your Reason" (redundan untuk customer)
- Header "Our Response"
- Row "Current departure" (yang confusing)

Default field values (`defaultFieldValues`) juga di-update:
- `rescheduleHeroHeadline`: "Reschedule confirmed — detail tiket baru di bawah"
- `rescheduleHeroSubtext`: "tim kami sudah proses permintaan reschedule
  kamu. Berikut detail tiket terbaru + instruksi pembayaran."

#### 5. handleSendResponse ctx — tambah bankAccountsBlock

Reschedule template butuh `{{bankAccountsBlock}}` (payment section).
Added di `handleSendResponse()`:

```ts
const banks = Array.isArray(tpl.bankAccounts) ? ... : []
const ctx = buildContext(booking as any, {
  ...,
  bankAccountsBlock: formatBankAccountsBlock(banks),
  ...
})
```

Cancel template tidak reference `{{bankAccountsBlock}}` → preflight scan
skip, tidak error.

#### 6. Confirmation page — split cancel vs reschedule button

File:
[apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](../../../../apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro)

- Dua Set terpisah: `ACTIVE_FOR_RESCHEDULE` vs `ACTIVE_FOR_CANCEL`.
- `canReschedule` ≠ `canCancel` → tombol di-render masing-masing.
- Status `confirmed` → hanya tombol Cancel + hint:
  > Note: Reschedule is no longer available after the ticket has been
  > issued. Please contact admin via WhatsApp for exceptional cases.
- Section intro copy berubah untuk `confirmed`:
  > Your ticket is already issued. Cancellation is still possible — our
  > admin will reply with refund details.

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/migrations/20261013_120000_phase_4_70_2_4_reschedule_snapshot.ts` | **BARU** — 2 ADD COLUMN nullable. |
| `apps/cms/src/migrations/index.ts` | Register migration. |
| `apps/cms/src/collections/Bookings.ts` | Split `activeStatuses`, snapshot pada kind=reschedule, 2 hidden fields baru, bankAccountsBlock di handleSendResponse ctx. |
| `apps/cms/src/lib/templateRenderer.ts` | 5 vars baru di KNOWN+OPTIONAL, 3 fields di `BookingLike`, 5 outputs di `buildContext`, helper `formatDepartureDisplay`. |
| `apps/web/src/lib/checkout/templateRenderer.ts` | Idem (SSOT mirror). |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Rewrite `DEFAULT_RESCHEDULE_EMAIL_BODY_HTML` + update `rescheduleHeroHeadline`/`Subtext` defaults. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Split Set active per button, intro copy conditional, hint untuk confirmed. |

### Testing

```
1. Restart CMS dev (migrasi auto-run saat start, column baru siap).
2. Buat booking test → status awaiting_review.
3. Buka confirmation page → click Request Reschedule, isi reason
   "Pindah ke 15 Oct, kerjaan" → submit.
4. CMS: open booking → banner banner reschedule muncul (Phase 4.70.2.2).
5. Admin edit departureDate → 2026-10-15, save.
6. Click "Send Reschedule Response" di Admin Actions.
7. Expected email:
   - Hero: "Reschedule confirmed — detail tiket baru di bawah"
   - Block "Previous → New":
     - Previous (merah, strikethrough): "<tgl awal> · <jam awal>"
     - New (hijau, bold): "15 Oct 2026 · <jam>"
   - Trip details route/class/pax
   - Admin note inline (free text yang admin isi)
   - Total due + Bank transfer block
   - CTA: "💬 Kirim Bukti via WhatsApp"
   - TIDAK ADA section "Your Reason" / "Our Response"
8. Simulasi confirmed booking:
   - Buat booking lain, admin send payment + mark confirmed.
   - Buka confirmation page → tombol "Request Reschedule" HILANG,
     tombol "Request Cancellation" MUNCUL + hint "Reschedule no
     longer available after ticket issued".
9. API test defense:
   POST /api/bookings/request-change dgn action=reschedule ke booking
   confirmed → 409 status_locked dgn message mentioning WhatsApp.
```

### Impact

- **Database**: +2 kolom nullable di `bookings`. 1 migration.
- **CMS**: endpoint logic + template HTML + 2 hidden fields.
- **Frontend web**: 1 .astro file (split Set + conditional UI).
- **Env**: zero.
- **Deploy needed**: **cms + web** (bersamaan, karena schema + template +
  UI harus sinkron).
- **Breaking**: tidak — kolom baru nullable, status matrix additive
  (hanya menambah `confirmed` ke daftar yang bisa cancel). Booking existing
  tetap work.

### Known Limitations

- **No restore on manual admin action**: kalau admin manually transition
  status reschedule_request → awaiting_payment via UI (bukan via Send
  Reschedule Response endpoint), snapshot original tidak di-clear. Minor:
  snapshot field tidak break anything, cuma residual data. Future bisa
  cleanup via hook `afterChange`.
- **Reschedule post-payment via admin override**: endpoint tidak support,
  tapi super-admin masih bisa manual edit DB. Dokumentasikan di
  maintenance runbook (future task).
- **Payment deadline di template reschedule**: hard-coded "Awaiting
  payment" label, tidak compute deadline dinamis (unlike payment email).
  Alasan: reschedule response bisa dikirim beberapa hari setelah initial
  booking, deadline original mungkin sudah lewat; display status saja
  lebih aman. Admin bisa edit template HTML di CMS kalau mau beda.
- **departureDate di template Payment/Ticket**: masih render ISO raw
  (`2026-10-15T00:00:00.000Z`). Phase ini scope: hanya reschedule. Variable
  `{{departureDisplay}}` sudah available untuk future migrate (akan
  dilakukan di phase berikutnya kalau diminta).
- **`scheduleTimeLabel`**: snapshot ambil nilai di saat customer request
  (bukan saat admin ubah). Kalau customer request → admin edit
  `scheduleTimeLabel` sebelum snapshot query — tidak kejadian, karena
  snapshot taken di endpoint sebelum admin punya kesempatan.

### Database state matrix (updated)

| Status | Reschedule | Cancel |
|---|---|---|
| `pending` / `awaiting_review` / `awaiting_payment` / `payment_review` | ✅ | ✅ |
| `confirmed` | ❌ (409 + hint ke WA admin) | ✅ |
| `reschedule_request` / `cancel_request` | ❌ (sudah pending) | ❌ |
| `cancelled` / `expired` | ❌ | ❌ |
