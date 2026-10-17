# Payment & Receipt Management — Series Closing Summary

**Series**: Phase 4.74.1 → 4.74.6
**Tanggal**: 2026-10-17 (single-day series)
**Status**: ✅ Code selesai, migration applied batch 59 lokal · Deploy pending user action

---

## Problem Statement (dari user)

> "Payment instruction mengarahkan customer untuk mengirimkan bukti transfer ke WA admin dimana itu akan banyak human error-nya."

Pain points:
- Bukti nyasar, admin lupa update CMS, timestamp tidak akurat.
- Tidak ada single source of truth.
- Status real-time di admin dashboard tidak tersedia.
- Belum pakai payment gateway (manual bank transfer only).

---

## Solution

Replace jalur manual dengan **self-service upload page** (customer) + **admin verify workflow** (CMS) + **real-time bell notifications** (admin dashboard).

### 6 Sub-phase

| # | Scope | File utama | Status |
|---|---|---|---|
| **4.74.1** | Schema: PaymentProofs + AdminNotifications collection + 2 field di Bookings + migration | [phase-4.74.1-schema.md](phase-4.74.1-schema.md) | ✅ migration applied batch 59 |
| **4.74.2** | Customer upload endpoint + rate-limit + file validation + hook afterChange create | [phase-4.74.2-submit-endpoint.md](phase-4.74.2-submit-endpoint.md) | ✅ |
| **4.74.3** | Frontend upload form + success page + template variable `{{paymentUploadUrl}}` | [phase-4.74.3-upload-page-ui.md](phase-4.74.3-upload-page-ui.md) | ✅ |
| **4.74.4** | Admin approve/reject workflow (standard edit view) + customer reject email + beforeChange guard | [phase-4.74.4-approve-reject.md](phase-4.74.4-approve-reject.md) | ✅ |
| **4.74.5** | Bell notifications sidebar + 2 endpoint (unread-count + mark-read) + polling 30s | [phase-4.74.5-bell-notifications.md](phase-4.74.5-bell-notifications.md) | ⚠️ butuh dev restart |
| **4.74.6** | EXIF strip JPEG + TTL cleanup endpoint + security master log entry + closing docs | [phase-4.74.6-hardening-closing.md](phase-4.74.6-hardening-closing.md) | ✅ |

---

## Flow End-to-End

```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER FLOW                              │
└─────────────────────────────────────────────────────────────────┘

[Admin: Send Payment Instructions]
   └─> Email + WA ke customer dgn {{paymentUploadUrl}}
         └─> https://gtjourneys.id/payment/<ref>?t=<token>
               │
               ▼
   [Customer buka URL (token-gated SSR)]
         └─> Form upload: senderName/senderBank/amount/transferDate/
             transferTime/proofFile (JPG/PNG/WebP/PDF max 5MB)/customerNote
               │  POST /api/bookings/<ref>/submit-payment-proof?t=<token>
               ▼
   [Validation]
         ├─ Rate-limit 3/15min per IP+ref                 → 429
         ├─ Status gate awaiting_payment∪payment_review   → 409
         ├─ Soft-cap paymentProofAttempts >= 3            → 429
         ├─ MIME whitelist + size max 5MB                 → 400/413
         ├─ Amount tolerance ±20% vs totalEstimate        → 400
         └─ EXIF strip JPEG (drop GPS + device PII)
               │
               ▼
   [POST payment-proofs collection (status=pending)]
         │  afterChange hook (best-effort try/catch):
         │  ├─ booking.latestPaymentProof = <id>
         │  ├─ booking.paymentProofAttempts += 1
         │  ├─ booking.status: awaiting_payment → payment_review
         │  └─ AdminNotif: payment_proof_submitted (warning)
         │
         ▼
   [Redirect /payment/<ref>/success?t=<token>]
         └─> "Terima kasih, admin review dalam 1x24 jam"


┌─────────────────────────────────────────────────────────────────┐
│                       ADMIN FLOW                                │
└─────────────────────────────────────────────────────────────────┘

[Bell notification polling 30s] → badge +1
   │ Click bell → side-panel 20 latest, click row
   ▼
[Open PaymentProof edit view]
   │ Review: proofFile preview + senderName + amount + customerNote
   │
   ├─ Approve path:
   │     Status: pending → approved → Save
   │     ▼  beforeChange: capture reviewedAt + reviewedBy
   │     ▼  afterChange: booking.status → confirmed
   │     ▼  AdminNotif info "proof approved"
   │     [Admin lanjut ke Booking edit → "Confirm Payment & Send Ticket"]
   │     (existing endpoint phase 4.70.3.1 → kirim e-ticket + PDF receipt)
   │
   └─ Reject path:
         Status: pending → rejected + Isi rejectedReason (wajib)
         Save
         ▼  beforeChange: validate reason + capture reviewer
         ▼  afterChange:
         ▼    - booking.status → awaiting_payment
         ▼    - sendEmail customer (Resend) dgn link upload ulang
         ▼    - AdminNotif warning "proof rejected"
         Customer buka email → upload ulang → attempts++ (max 3 soft-cap)
```

---

## Impact

| Dimensi | Perubahan |
|---|---|
| **Database** | 3 tabel baru (payment_proofs, admin_notifications, admin_notifications_read_by) + 2 kolom bookings (latest_payment_proof_id + payment_proof_attempts) + 2 kolom payload_locked_documents_rels. Migration batch 59. |
| **CMS admin** | Grup Bookings sekarang 4 menu (Bookings, OTP Verifications, Payment Proofs baru, Admin Notifications baru). Bell notification di sidebar footer dgn unread badge. Tab Payment status di edit PaymentProofs. |
| **Frontend web** | 2 route baru `/payment/[ref]` + `/payment/[ref]/success` (token-gated SSR, mobile-first). |
| **API endpoints** | 4 endpoint baru: `POST /api/bookings/[ref]/submit-payment-proof` (customer) + `GET /api/admin-notifications/unread-count` + `POST /api/admin-notifications/[id]/read` + `POST /api/admin-notifications/cleanup` (admin). |
| **Template variable** | `{{paymentUploadUrl}}` tersedia di konteks sendPayment (email + WA body). |
| **Hooks** | 1 beforeChange (PaymentProofs guard) + 2 afterChange (Bookings notif create, PaymentProofs lifecycle). |
| **Security** | 11 guards logged di [`docs/08-SECURITY-PATCH.md`](../../../../../08-SECURITY-PATCH.md#phase-474-series-b--payment--receipt-management-flow-2026-10-17): token gate, rate-limit, MIME whitelist, EXIF strip, soft-cap, amount sanity, field-level access, required reason, admin+ auth, no-store headers, TTL cleanup. |
| **Deploy** | Zero wrangler.toml change (reuse `media` bucket + Resend API). Migration apply manual, cron external untuk cleanup. |

---

## Decisions (6 Open Questions dari Analysis)

Sesuai [analysis §10](phase-4.74-payment-receipt-mgmt-analysis.md#10-open-questions-untuk-user), dipilih sesuai rekomendasi:

| # | Question | Decision |
|---|---|---|
| 1 | Auto-expire deadline cron | Defer ke 4.74.7 (butuh keputusan bisnis strict vs rolling) |
| 2 | Max resubmit attempts | 3 (soft-cap via `paymentProofAttempts` counter) |
| 3 | Admin notification scope | Global pool + per-user `readBy[]` tracker |
| 4 | R2 bucket terpisah | Defer ke 4.74.8 (pakai `media` existing dulu — proof file CMS admin-only) |
| 5 | Payment gateway roadmap | Tetap stub, manual-only indefinitely sampai 5.0 |
| 6 | Admin WA/Telegram relay | Defer ke 4.74.7 |

---

## Deployment Checklist (user action)

Sebelum push ke production:

- [ ] Backup DB production.
- [ ] `cd apps/cms && pnpm schema:migrate` di production (confirm dev-mode drift prompt).
- [ ] Verify 3 tabel baru + 2 kolom bookings terbuat di prod DB.
- [ ] Secret rotate jika pakai berbeda (BOOKING_RL_SALT, PAYLOAD_API_KEY — pattern phase 4.66.8).
- [ ] Admin edit `Booking Templates` global → tambah `{{paymentUploadUrl}}` di `paymentEmailBody` + `paymentWhatsappBody` (defer: migration default phase 4.74.8).
- [ ] Setup cron external untuk `POST /api/admin-notifications/cleanup` daily dgn body `{olderThanDays:60}` + API key (atau tunggu phase 4.74.8 Scheduled Worker).
- [ ] Smoke test end-to-end: create booking → admin Send Payment → customer buka link → upload JPG → verify DB sync + AdminNotif + bell → admin approve/reject.
- [ ] UAT 3-role: editor (no new menu visible), admin (approve/reject + bell), super-admin (semua + field sensitif seperti IP hash + user agent).

---

## Follow-up Roadmap

- **Phase 4.74.7**: Auto-expire booking cron + admin WA/Telegram relay notif.
- **Phase 4.74.8**: R2 bucket terpisah + HTML template polish reject email + default `{{paymentUploadUrl}}` di `payment_whatsapp_body` + mark-all-read button + custom Approve/Reject button di Bookings edit view.
- **Phase 5.0**: Payment gateway (Xendit/Midtrans) replace manual flow.

---

## File Index

Dokumentasi series:
- [phase-4.74-payment-receipt-mgmt-analysis.md](phase-4.74-payment-receipt-mgmt-analysis.md) — analisa + blueprint
- [phase-4.74.1-schema.md](phase-4.74.1-schema.md)
- [phase-4.74.2-submit-endpoint.md](phase-4.74.2-submit-endpoint.md)
- [phase-4.74.3-upload-page-ui.md](phase-4.74.3-upload-page-ui.md)
- [phase-4.74.4-approve-reject.md](phase-4.74.4-approve-reject.md)
- [phase-4.74.5-bell-notifications.md](phase-4.74.5-bell-notifications.md)
- [phase-4.74.6-hardening-closing.md](phase-4.74.6-hardening-closing.md)

Related master docs:
- [docs/PROGRESS.md](../../../../../PROGRESS.md) — timeline keseluruhan
- [docs/08-SECURITY-PATCH.md](../../../../../08-SECURITY-PATCH.md#phase-474-series-b--payment--receipt-management-flow-2026-10-17) — security guards logged
