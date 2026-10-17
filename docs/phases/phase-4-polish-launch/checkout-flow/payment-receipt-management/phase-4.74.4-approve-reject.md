## Phase: 4.74.4 — Admin Approve/Reject Workflow + Customer Reject Email
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · CMS hot-reload OK · E2E test pending real booking
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74-payment-receipt-mgmt-analysis.md`](phase-4.74-payment-receipt-mgmt-analysis.md)
**Dependency**: [`phase-4.74.3-upload-page-ui.md`](phase-4.74.3-upload-page-ui.md)

### Ringkasan
Admin workflow untuk verify bukti transfer customer: beforeChange guard (require `rejectedReason` + auto-capture reviewer) + extended afterChange lifecycle hook yang handle status transition `pending → approved/rejected`. Zero endpoint baru — admin pakai standard Payload edit view (ubah status select → save). Reject auto-send email customer dgn link upload ulang.

**Decision**: tidak buat custom button "Approve/Reject" di edit view Bookings. Alasan: Payload's native edit view PaymentProofs sudah cukup (edit status dropdown + rejectedReason textarea + save = done). Menambah custom React component adalah polish defer-able. Admin workflow:
1. Buka top-bar bell (sub-phase 4.74.5) atau Payment Proofs list (filter default pending).
2. Klik row → preview file + review data.
3. Ubah status → approved (hook auto booking.status=confirmed) ATAU rejected + isi rejectedReason (hook auto email customer + revert booking.status=awaiting_payment).
4. Jika approved: admin lanjut ke Booking edit → klik existing "Confirm Payment & Send Ticket" (phase 4.70.3.1) untuk kirim e-ticket + PDF receipt.

Alasan 2-step (approve → send ticket): proses send ticket butuh admin isi `paymentBank` + `paymentDate` (existing fields phase 4.70.3.1) untuk receipt PDF — tidak bisa auto-triggered dari approve.

### File yang Berubah

| File | Jenis | Perubahan |
|---|---|---|
| `apps/cms/src/collections/PaymentProofs.ts` | Modified | (a) Tambah `paymentProofGuardHook` (beforeChange): throw error jika `status=rejected` tanpa `rejectedReason`; auto-set `reviewedAt=now` + `reviewedBy=req.user.id` saat transition `pending→approved/rejected`. (b) Rename `syncBookingAndNotifyOnCreateHook` → `paymentProofsLifecycleHook` (unified create+update handling). (c) Branch update: `pending→approved` → booking.status=confirmed + AdminNotif info "proof approved"; `pending→rejected` → booking.status=awaiting_payment + sendEmail customer + AdminNotif warning "proof rejected". |

### Hook Behavior Detail

**beforeChange `paymentProofGuardHook`** (op=update only):
- Throw `Error('rejectedReason wajib...')` jika akan save dengan status=rejected tapi tidak ada rejectedReason baru atau existing.
- Auto-set `reviewedAt=new Date().toISOString()` + `reviewedBy=req.user.id` saat transition pending→approved atau pending→rejected (lebih reliable dari field admin.readOnly karena hooks `overrideAccess:true` dari endpoint lain tidak akan skip).

**afterChange `paymentProofsLifecycleHook`** (unified):
- **Create branch** (op=create): sama persis dgn phase 4.74.2 — sync `latestPaymentProof` + bump counter + status transition + AdminNotif submitted.
- **Update branch pending → approved**:
  - `bookings.status → confirmed` (via `req.payload.update` with `overrideAccess:true` + `context.skipAuditLogHook:true`).
  - AdminNotif: type=`other` severity=info, title="Payment approved for <ref>", body reminder "klik Send Ticket".
- **Update branch pending → rejected**:
  - `bookings.status → awaiting_payment` (customer bisa resubmit, counter tetap).
  - **Send customer email** via `sendEmail` helper (Resend API, phase 4.69.7):
    - `to`: `booking.customerEmail` (skip jika kosong).
    - `subject`: "Bukti pembayaran perlu dikirim ulang — Booking <ref>".
    - `text`: multi-line dgn `rejectedReason` + link `/payment/<ref>?t=<token>` (reuse pola 4.74.3).
    - `idempotencyKey: payment-reject:<proofId>` — safe retry.
  - AdminNotif: type=`payment_rejected` severity=warning, body = reason (truncated 120 char).
- Best-effort try/catch per side-effect (log error only).

### Admin UX Flow (End-to-End)

```
[Customer submit bukti] (4.74.3)
         │
         ▼  afterChange create hook
   booking.status: awaiting_payment → payment_review
   booking.latestPaymentProof = <id>
   booking.paymentProofAttempts += 1
   AdminNotif: payment_proof_submitted (warning)
         │
         ▼
[Admin: Dashboard → bell → "Payment proof submitted for FT-xxx"]
         │
         ▼
[Admin: click → opens PaymentProof edit view]
         │  Review:
         │  - proofFile preview (image/PDF viewer native Payload)
         │  - senderName, senderBank, amount, transferDate
         │  - customerNote
         │
         ├─ Approve path:
         │     Change status: pending → approved → Save
         │     ▼  beforeChange: capture reviewedAt+By
         │     ▼  afterChange: booking.status → confirmed
         │     ▼  AdminNotif info "proof approved"
         │     Admin lanjut ke Booking edit → "Confirm Payment & Send Ticket"
         │     (existing phase 4.70.3.1 endpoint → kirim e-ticket + PDF receipt)
         │
         └─ Reject path:
               Change status: pending → rejected
               Isi rejectedReason (wajib — guard throws error jika kosong)
               Save
               ▼  beforeChange: validate reason + capture reviewer
               ▼  afterChange: booking.status → awaiting_payment
               ▼              sendEmail customer dgn link upload ulang
               ▼              AdminNotif warning "proof rejected"
               Customer buka email → klik link → upload ulang → attempts++
               (max 3 attempts, soft-cap phase 4.74.2)
```

### Testing

#### Programmatic
- [x] TypeScript compiles.
- [x] CMS boot clean (navigate /admin → no console errors).

#### Pending (butuh real booking + payment-proof)
- [ ] Create booking + simulate customer upload (via POST endpoint 4.74.2) → verify AdminNotif submitted muncul.
- [ ] Admin edit PaymentProof → status=approved → save. Verify: `reviewedAt`+`reviewedBy` ter-set, `booking.status=confirmed`, AdminNotif "approved" muncul.
- [ ] Admin edit PaymentProof → status=rejected tanpa rejectedReason → save. Verify: UI error dari `beforeChange` throw.
- [ ] Admin edit PaymentProof → status=rejected + rejectedReason="buram, upload ulang" → save. Verify: `reviewedAt`+`reviewedBy` ter-set, `booking.status=awaiting_payment`, customer dapat email dgn link upload, AdminNotif "rejected" muncul.
- [ ] Customer buka link email → form upload render (status awaiting_payment OK), submit ke-2 → `paymentProofAttempts=2`, status payment_review lagi.
- [ ] Edge: approve pada proof yg sudah approved (idempotent) → hook skip (prev==next).

### Known Deferred

- **Custom "Approve/Reject" button** di edit view Bookings (quick action tanpa harus navigate ke PaymentProofs row) — nice-to-have, defer ke 4.74.6 polish.
- **Reject email HTML template** — saat ini text-only. Match brand email template phase 4.70.2 jika mau polish — defer 4.74.6.
- **Approve auto-send ticket**: 2-step dipertahankan karena admin perlu isi paymentBank+paymentDate untuk receipt PDF (phase 4.70.3.1). Change ke 1-step requires UI combined form — defer.
- **Multi-approve bulk action** (list view checkboxes → bulk approve) — defer.
- **Resend reject email** button (jika email delivery gagal) — defer.

### Rollback

Revert `PaymentProofs.ts` ke versi phase 4.74.2 (hapus beforeChange + hapus update branch dari afterChange). Collection schema (phase 4.74.1) tetap intact. Status transition yg sudah terjadi di booking tidak di-revert otomatis.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.4
- [ ] `docs/02-DATABASE-SCHEMA.md` — N/A (no schema change)
- [ ] `docs/04-RBAC.md` — defer ke 4.74.6
- [ ] `docs/08-SECURITY-PATCH.md` — defer ke 4.74.6

### Next Step

Sub-phase **4.74.5** — Admin dashboard top-bar bell notifications (polling 30s, side-panel list 20 terbaru, mark-read per-user).
