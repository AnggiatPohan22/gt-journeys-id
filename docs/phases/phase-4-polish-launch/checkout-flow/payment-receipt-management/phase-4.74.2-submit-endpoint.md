## Phase: 4.74.2 — Payment Proof Submit Endpoint + Hooks
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · smoke test pending (butuh 4.74.3 upload page UI)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74-payment-receipt-mgmt-analysis.md`](phase-4.74-payment-receipt-mgmt-analysis.md)
**Dependency**: [`phase-4.74.1-schema.md`](phase-4.74.1-schema.md) (migration batch 59 applied)

### Ringkasan
Server-side plumbing untuk flow upload bukti transfer customer: 1 endpoint Astro + 1 store helper + 2 Payload hooks. Zero UI — form customer di sub-phase 4.74.3.

### File yang Berubah / Baru

| File | Jenis | Perubahan |
|---|---|---|
| `apps/web/src/lib/checkout/paymentProofStore.ts` | **NEW** | `uploadProofFileToMedia(file, altText)` (multipart POST → `media`) + `createPaymentProof(input)` (JSON POST → `payment-proofs`). Reuse pola `createBooking` + `PAYLOAD_API_KEY` (role `api`). |
| `apps/web/src/pages/api/bookings/[ref]/submit-payment-proof.ts` | **NEW** | `POST` endpoint: token verify (reuse 4.66.5 `getBookingByRefAndToken`), rate limit 3/15min per IP+ref (reuse `checkBookingRateLimit`), status gate (`awaiting_payment` OR `payment_review`), attempts soft-cap 3, parse multipart, MIME whitelist (jpeg/png/webp/pdf), size max 5MB, amount tolerance ±20% vs `totalEstimate`, upload file → create payment-proof record. Return `{ok, paymentProofId, redirectUrl}`. |
| `apps/cms/src/collections/Bookings.ts` | Modified | Import `CollectionAfterChangeHook`; tambah `notifyAdminOnBookingCreateHook` (op=create → create AdminNotif type `booking_new`); register di `hooks.afterChange`. |
| `apps/cms/src/collections/PaymentProofs.ts` | Modified | Tambah `syncBookingAndNotifyOnCreateHook` (op=create → update bookings.latestPaymentProof + bump paymentProofAttempts + status awaiting_payment→payment_review + create AdminNotif type `payment_proof_submitted` severity warning); register di `hooks.afterChange`. |

### Rejection Codes Endpoint

| Code | Status | Scenario |
|---|---|---|
| `unauthorized` | 401 | Token missing/invalid (generic message — no ref enumeration) |
| `rate_limited` | 429 | IP+ref > 3 submissions / 15 min |
| `too_many_attempts` | 429 | `paymentProofAttempts >= 3` (soft-cap, hubungi admin manual) |
| `wrong_status` | 409 | Booking tidak di `awaiting_payment` atau `payment_review` |
| `missing_field` | 400 | Field required kosong / tanggal format salah / tanggal di masa depan |
| `invalid_amount` | 400 | Amount ≤ 0 atau beda > 20% dari totalEstimate |
| `invalid_file` | 400 | MIME tidak di whitelist / file kosong / bukan File instance |
| `file_too_large` | 413 | > 5MB |
| `server_error` | 500 | Upload media gagal / create payment-proof gagal |

### Hook Behavior

**Bookings.afterChange** (`notifyAdminOnBookingCreateHook`):
- Op=create only (update tidak trigger — reschedule/cancel notif menyusul di 4.74.7).
- Create AdminNotif: `type=booking_new`, `title="New booking <ref> — <origin → dest>"`, `severity=info`.
- Best-effort try/catch — kalau notif gagal, booking create tetap sukses.

**PaymentProofs.afterChange** (`syncBookingAndNotifyOnCreateHook`):
- Op=create only (approve/reject state transition di 4.74.4).
- Step 1-3 atomik (satu update call): sync `latestPaymentProof` + bump counter + status transition `awaiting_payment → payment_review` (skip jika sudah `payment_review` resubmit).
- Step 4: create AdminNotif `type=payment_proof_submitted` severity=warning dengan amount + sender.
- `context: { skipAuditLogHook: true }` saat update booking supaya `auditManualEditHook` (phase 4.70.3.1) tidak nge-log transisi otomatis ini.

### Security Reuse

- **Token gate**: `getBookingByRefAndToken` constant-time compare (Phase 4.66.5).
- **Rate limit**: `checkBookingRateLimit` dengan bucket key `payment_proof:<ipHash>:<ref>` — isolated dari booking create bucket.
- **IP hash**: `hashIp(ip, BOOKING_RL_SALT)` — stored di `submittedFromIpHash` (super-admin only field).
- **No-store headers**: `Cache-Control: no-store` di semua response (reuse pola 4.66.6).
- **User-agent truncated** ke 500 char di `submittedUserAgent` (super-admin only).
- **MIME whitelist** strict (bukan sniff) — hanya image + PDF.
- **Amount sanity**: ±20% toleransi vs `totalEstimate` — reject typo besar sebelum admin reconcile.

### Testing

#### Programmatic
- [x] TypeScript compiles (CollectionAfterChangeHook type match, APIRoute signature OK).
- [x] Dev server Next.js hot-reload CMS tanpa error.

#### Pending (butuh 4.74.3 frontend)
- [ ] `curl -X POST /api/bookings/<ref>/submit-payment-proof?t=<token>` dengan multipart form → sukses create payment-proof + booking.status transition + AdminNotif muncul.
- [ ] Rate limit: 4x submit dari IP sama → request ke-4 return 429 `rate_limited`.
- [ ] Attempts soft-cap: 3x successful upload (resubmit setelah admin reject) → upload ke-4 return 429 `too_many_attempts`.
- [ ] Status gate: booking status=`confirmed` → return 409 `wrong_status`.
- [ ] File validation: 6MB file → 413, .exe MIME → 400 `invalid_file`.
- [ ] Amount tolerance: amount 50% dari total → 400 `invalid_amount`.
- [ ] AdminNotif muncul di list CMS: 1 row `booking_new` per booking create + 1 row `payment_proof_submitted` per proof submit.

### Known Deferred

- **EXIF strip**: untuk JPEG belum di-implement (butuh image processing lib di edge runtime). Interim: file dibiarkan sebagaimana adanya; admin review bisa lihat metadata di preview. Defer ke sub-phase 4.74.6 hardening.
- **R2 bucket terpisah**: masih pakai `media` collection existing. Bucket `gt-journeys-payment-proofs` dgn 12-month lifecycle di 4.74.6.
- **Admin approve/reject endpoint**: belum (sub-phase 4.74.4).
- **Customer upload page UI**: belum (sub-phase 4.74.3).
- **Email customer saat reject**: belum (bundle dgn 4.74.4).

### Rollback

- Revert 4 file (paymentProofStore.ts, submit-payment-proof.ts, Bookings.ts hook addition, PaymentProofs.ts hook addition).
- Collection schema (4.74.1) tetap intact — tidak perlu `pnpm schema:down`.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.2
- [ ] `docs/02-DATABASE-SCHEMA.md` — defer ke 4.74.6 closing (no schema change di sub-phase ini)
- [ ] `docs/04-RBAC.md` — defer ke 4.74.6
- [ ] `docs/08-SECURITY-PATCH.md` — entry defer ke 4.74.6 (full hardening summary)

### Next Step

Sub-phase **4.74.3** — frontend upload page (`apps/web/src/pages/payment/[ref].astro` + success page + email/WA template variable `{{paymentUploadUrl}}`).
