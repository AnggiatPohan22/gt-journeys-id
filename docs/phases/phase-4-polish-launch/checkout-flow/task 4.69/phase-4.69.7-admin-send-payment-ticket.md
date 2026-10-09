## Phase: 4.69.7 — Admin "Send Payment" + "Send Ticket" Buttons

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Fitur UX utama admin-handoff flow:
- **Tombol "Send Payment Instructions"** di edit view Booking — muncul saat
  `status = awaiting_review`. Klik → modal preview email + WA → confirm
  send → status transisi ke `awaiting_payment` + audit timestamp.
- **Tombol "Confirm Payment & Send Ticket"** — muncul saat
  `status = payment_review` (atau `awaiting_payment` sebagai shortcut).
  Transisi ke `confirmed` + audit `sentTicketAt/By`.
- **Modal preview** (sebelum kirim): subject email, body email, body WA
  — hasil render dari template global (Phase 4.69.6).
- **wa.me deep-link** (D9 Opsi C): email auto-kirim via Resend, WA button
  buka wa.me di tab baru dengan pesan ter-prefilled (admin klik Send manual).
- **Template error UI**: list missing/unknown variable agregat → admin fix
  field booking atau template dulu.

### Keputusan Owner (approved sebelumnya)

- **D9** Opsi C — email auto-send + wa.me manual click (bukan WA Cloud API)
- **D10** ERROR — missing/unknown variable blokir send
- **Role gate** — admin + super-admin (bukan super-admin only)

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/lib/templateRenderer.ts` | BARU | Mirror pure renderer dari `apps/web/src/lib/checkout/templateRenderer.ts`. Tambah helper `waNumberForLink()` + `buildWaLink()`. |
| `apps/cms/src/lib/sendEmail.ts` | BARU | Minimal Resend fetch wrapper (zero npm dep). Baca `process.env.RESEND_*`. |
| `apps/cms/src/collections/Bookings.ts` | Edit | Tambah 2 endpoint (`:id/send-payment`, `:id/send-ticket`) + UI field `adminActions` (visible admin+). |
| `apps/cms/src/admin/BookingAdminActions.tsx` | BARU | Client component dgn modal preview + confirm. Esc close, success state + wa.me link. |
| `apps/cms/.env` + `.env.example` | Edit | Tambah `SITE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`. |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Regenerate | Daftar `/admin/BookingAdminActions#default`. |
| `docs/phases/.../phase-4.69.7-admin-send-payment-ticket.md` | BARU | File ini. |

### Flow Admin "Send Payment"

```
Admin opens Booking edit view (status=awaiting_review)
  ↓
Click "Send Payment Instructions"
  ↓
Modal opens → POST /api/bookings/:id/send-payment { previewOnly: true }
  ↓
Server:
  - Load booking (overrideAccess)
  - Load global booking-templates
  - Build context (bankAccountsBlock, paymentDeadline, confirmationUrl, ...)
  - Render emailSubject + emailBody + waBody
  - If errors → return 400 { errors: [...] }  → UI shows error list
  - Else → return rendered content
  ↓
Modal shows preview (subject + body + WA message)
  ↓
Click "Confirm & Send" → POST same endpoint { previewOnly: false }
  ↓
Server:
  - Status check: must be awaiting_review (or legacy pending)
  - Send email via Resend → if fail, return 502, booking NOT updated
  - Update booking: status=awaiting_payment, sentPaymentAt=now, sentPaymentBy=req.user.id
  - Return { ok, waUrl, newStatus, sentEmailId }
  ↓
Modal shows success + wa.me button (new tab)
  ↓
Admin clicks "Close & Reload" → form reload picks up new status/timestamps
```

### Idempotency

`idempotencyKey = "payment:{bookingRef}:{adminUserId}"` — kalau admin
double-click Send, Resend dedupe otomatis dalam 24 jam. Catatan: kalau
admin BERBEDA klik Send untuk booking yang sama, email akan terkirim 2x
(key berbeda). Ini intentional supaya admin kedua tidak terjebak oleh
cache admin pertama.

### Rollback-safe (email-first)

Urutan: **email send DULU**, lalu DB update. Kalau Resend 502 → booking
status TIDAK berubah → admin bisa retry. Kebalikannya (DB update dulu)
berisiko status "awaiting_payment" tanpa email terkirim.

Trade-off: kalau email sukses TAPI DB update gagal (jarang, atomic SQLite
single-row), Resend sudah log + idempotency key akan prevent re-send pada
retry oleh admin yang sama → tidak double-email, tapi status bisa stuck
di awaiting_review. Admin tinggal retry — update akan jalan tanpa
re-send.

### Status Gate

| From status                       | Endpoint    | → To status      |
|-----------------------------------|-------------|------------------|
| `awaiting_review` (atau `pending` legacy) | send-payment | `awaiting_payment` |
| `payment_review` (atau `awaiting_payment`) | send-ticket  | `confirmed`      |

Status lain → 409 `conflict` dengan message jelas. Preview mode (`previewOnly: true`) **tidak** cek status — admin bisa preview rendering kapan saja.

### Security

- **Auth**: `req.user` wajib + role admin/super-admin. Session cookie Payload admin.
- **Role gate**: hardcoded di handler (`req.user.role === 'admin' | 'super-admin'`).
- **Template render**: whitelist-only (25 variabel). Unknown variable
  → error, tidak di-replace, tidak di-eval.
- **Idempotency key** = ref:userId → prevent accidental duplicate send
  dalam window Resend 24h.
- **Overrideaccess di Local API**: controlled, cuma di-handler yang
  sudah role-gated.
- **Audit trail**: `sentPaymentAt/By`, `sentTicketAt/By` read-only (lihat
  Phase 4.69.5). Admin yang klik Send tercatat.
- **No PII in error response**: error strings = template variable name,
  bukan nilai booking.

### Testing

#### Build check
```
pnpm payload generate:importmap → importMap includes BookingAdminActions ✓
pnpm tsc --noEmit → zero new errors (pre-existing defaultSort errors unrelated)
```

#### Manual flow (dev)
Pre-req: `.env` di `apps/cms` sudah berisi `RESEND_API_KEY` sama dengan
`apps/web/.env`. Resend sandbox mode = kirim ke address verified saja.

```
1. Create test booking via frontend (status default = awaiting_review).
2. Login CMS admin, open booking edit view.
3. Lihat section "adminActions" muncul di atas form.
4. Click "Send Payment Instructions" → modal preview tampil.
5. Verify: email subject + body ter-render dengan {{bookingRef}}, {{customerName}},
   {{totalEstimate}}, {{bankAccountsBlock}}, {{paymentDeadline}} ter-substitusi.
6. Click "Confirm & Send" → spinner → success banner + wa.me link.
7. Reload form → status = awaiting_payment, sentPaymentAt + sentPaymentBy terisi.
8. Lihat inbox customer → email received.
9. Set status manual → payment_review → tombol berubah ke "Confirm Payment & Send Ticket".
10. Repeat steps 4-7 untuk ticket flow.
```

#### Error cases
- Template dengan variable `{{foobar}}` → modal preview tampilkan error:
  `[Email Body] Variable "{{foobar}}" tidak dikenal engine...`
- Booking tanpa `customerEmail` → send gagal dengan `Customer email kosong`.
- Status salah → 409 dengan message: `Booking status "confirmed" tidak valid untuk Send Payment`.
- Resend sandbox hit daily limit → 502 dengan Resend error message, booking tidak transisi.

### Impact

- **Database**: zero schema change (reuse audit fields dari Phase 4.69.5).
- **CMS**: 2 endpoint baru di collection Bookings, 1 UI field, 1 React component.
- **Frontend web**: tidak terdampak.
- **Env**: tambah `SITE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
  `RESEND_FROM_NAME` di `apps/cms/.env`.
- **Deploy needed**: **cms only** (web tidak berubah).

### Known Limitations / Future Work

- Template renderer **duplicated** antara `apps/web` dan `apps/cms` (SSOT = web).
  Alternatif cleaner: move ke `packages/shared/src/checkout/`. Deferred supaya
  phase ini tetap minimal — update dua-duanya kalau ada perubahan rule.
- WA message butuh admin klik manual (D9 Opsi C). Phase 4.69.11 future bisa
  pakai WA Cloud API untuk auto-send.
- Preview mode tidak di-cache — tiap klik modal fetch ulang. Fine untuk sekarang
  (template kecil), nanti bisa ditambah client-side state kalau perlu.
- Email body sekarang **plain-text only**. HTML template bisa ditambahkan dgn
  field `paymentEmailBodyHtml` di global + render parallel.

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/04-RBAC.md` — update akhir series 4.69 (admin+ bisa send email)
- [ ] `docs/08-SECURITY-PATCH.md` — tambah entry series 4.69 akhir

### Next Steps

**Phase 4.69.8 — Admin dashboard filter/tabs**:
1. List view preset per status (chip filter atau tab)
2. Badge count sidebar per status (butuh client component Payload)
3. Default filter: `awaiting_review` muncul paling atas (prioritas action)
