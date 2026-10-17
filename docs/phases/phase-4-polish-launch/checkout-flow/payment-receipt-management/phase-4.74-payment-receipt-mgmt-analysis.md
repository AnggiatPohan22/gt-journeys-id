## Phase: 4.74 — Payment & Receipt Management + Admin Notifications (ANALYSIS / PROPOSAL)
**Tanggal**: 2026-10-17
**Status**: 📋 Reported (analysis only — belum ada code change)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Scope**: Analisa + blueprint, bukan implementasi. Implementasi dipecah ke sub-phase 4.74.1 → 4.74.6 (lihat §9).

---

### 0. Konteks

Menu **Bookings** di CMS saat ini punya 3 item:
1. **Bookings** — list booking yang masuk ([`apps/cms/src/collections/Bookings.ts`](../../../../../apps/cms/src/collections/Bookings.ts), ~2306 LOC)
2. **OTP Verifications** — log OTP yang terkirim ([`apps/cms/src/collections/OtpVerifications.ts`](../../../../../apps/cms/src/collections/OtpVerifications.ts))
3. **Booking Templates** — email/WA template settings ([`apps/cms/src/globals/BookingTemplates.ts`](../../../../../apps/cms/src/globals/BookingTemplates.ts))

**State machine** `booking.status` saat ini (Bookings.ts:2067–2082):
`awaiting_review` → `awaiting_payment` → `payment_review` → `confirmed` → (opsional `reschedule_request` / `cancel_request` / `cancelled` / `expired`)

**Masalah utama** yang user sampaikan:
- Payment instruction mengarahkan customer kirim bukti transfer via **WhatsApp admin** → human error tinggi: bukti nyasar, admin lupa update CMS, timestamp tidak akurat, tidak ada single source of truth, status real-time di admin dashboard tidak tersedia.
- Belum ada **payment gateway** (Xendit/Midtrans masih commented, Bookings.ts:2093–2095). Model yang dipakai = **manual bank transfer + admin verification**.
- Admin tidak dapat **notifikasi real-time** di dashboard saat booking baru masuk atau bukti bayar diupload.

---

### 1. Rekomendasi Scope Phase 4.74

**YA, Payment & Receipt Management perlu dibangun** — dengan 2 pilar:

**Pilar A — Customer-side upload bukti transfer** (hilangkan jalur WA → ganti self-service upload page).
**Pilar B — Admin-side verification workflow + real-time notification dashboard**.

Prioritas notifikasi (sesuai permintaan user): **(1) Booking baru masuk** → **(2) Payment proof masuk** → selanjutnya menyusul (reschedule request, OTP failure spike, dsb.).

---

### 2. Alur End-to-End yang Diusulkan

#### 2.1. Flow Payment Submission (customer)

```
[Customer submit checkout]
   └─> status: awaiting_review (existing)
          │
          │  Admin klik "Send Payment Instructions" (existing endpoint
          │  Bookings.ts:317 — /:id/send-payment)
          ▼
   status: awaiting_payment
   Email + WA terkirim ke customer dgn:
      • Rekening tujuan + jumlah + deadline (existing)
      • ✨ NEW: Tombol "Upload Bukti Pembayaran" →
                https://gtjourneys.id/payment/<bookingRef>?t=<accessToken>
      • ✨ NEW: Instruksi fallback WA tetap ada (opsional)
          │
          ▼
[Customer buka halaman upload — token-gated, mirror pola 4.66.5]
   Form:
      • Bank pengirim (select, dari BookingTemplates.bankAccounts)
      • Nama pengirim (text, required)
      • Nominal transfer (number, prefilled dari booking.totalEstimate)
      • Tanggal transfer (date, max=today)
      • Jam transfer (time)
      • File bukti (image/pdf, max 5MB — upload ke R2 via Payload Media)
      • Catatan opsional (textarea 500 char)
          │  Submit → POST /api/bookings/:id/submit-payment-proof
          │          (token verify + rate limit 3/15min per IP+token)
          ▼
   status: payment_review
   paymentProof record dibuat (lihat §3)
   Email + WA notifikasi admin: "Payment proof submitted for #BK-xxxx"
   Halaman konfirmasi upload: "Terima kasih, kami review dalam 1x24 jam"
          │
          ▼
[Admin verifikasi di CMS]
   Edit view Bookings → tab "Payment" collapsible (reuse pola 4.73):
      • Preview bukti (image/pdf viewer)
      • Field verify: paymentBank, paymentDate, paymentAmount (confirmed)
      • Tombol "Confirm Payment & Send Ticket" (existing)
          │
          ├─ Approve → status: confirmed → kirim e-ticket (existing endpoint)
          └─ Reject → status: awaiting_payment (kembali)
                      kirim email: "Bukti tidak valid, mohon kirim ulang: <alasan>"
                      paymentProof.rejectedReason + rejectedAt + rejectedBy
```

#### 2.2. Flow Notifikasi Admin Dashboard (real-time)

Target: badge count + bell icon + feed panel di top-bar admin Payload.

**Trigger** (dari hook `afterChange` di 2 collection):
- `Bookings.create` (status=awaiting_review) → notification type: `booking_new`
- `PaymentProofs.create` → notification type: `payment_proof_submitted`

**Delivery** (MVP → progressive enhancement):
- **MVP (4.74.5)**: polling `/api/admin-notifications/unread-count` tiap 30s dari komponen custom `AdminTopBarBell.tsx` (Payload admin.components.beforeNavLinks). Response: `{count: number, items: [{id, type, bookingRef, createdAt, read}]}`.
- **Future (post-launch)**: swap ke SSE / WebSocket (Cloudflare Durable Object) kalau polling cost terlalu tinggi atau butuh <5s latency.

Click bell → side-panel list 20 terbaru + "Mark all read" + deep-link ke booking edit view.

---

### 3. Perubahan Schema (CMS)

#### 3.1. Collection baru: `PaymentProofs`

Dipisah dari `Bookings` (bukan array di dalamnya) supaya:
- Multi-attempt per booking (reject + resubmit) ter-record dgn history utuh.
- Query terpisah di admin ("semua payment pending review today").
- Field-level access gampang (bukti bisa super-admin-only, metadata editor+).

```ts
PaymentProofs {
  id: uuid
  booking: relationship → Bookings (required, indexed)
  bookingRefSnapshot: text (denormalized untuk list view)
  // Submission data (dari customer)
  senderName: text (required)
  senderBank: text (required)
  amount: number (required, currency IDR)
  transferDate: date (required)
  transferTime: text (HH:MM)
  proofFile: upload → Media (required, R2)
  customerNote: textarea (optional, 500 char)
  // Submission context
  submittedAt: date (auto, default now)
  submittedFromIpHash: text (admin-only, mirror pola 4.66.9)
  submittedUserAgent: text (admin-only)
  // Admin verification
  status: select ['pending', 'approved', 'rejected']  default 'pending'
  reviewedAt: date (set oleh hook saat status berubah dari pending)
  reviewedBy: relationship → Users
  rejectedReason: textarea (required jika status='rejected')
  internalNote: textarea (admin-only, PII hygiene)
  // Access
  access: { read: superAdmin|admin|editor, create: anyone + token guard di endpoint, update: admin+ }
}

Indexes:
  - booking_idx
  - status_submitted_idx (status, submittedAt DESC)   // untuk filter "pending oldest"
```

#### 3.2. Field tambahan di `Bookings`

```ts
latestPaymentProof: relationship → PaymentProofs  (auto-set via hook, admin UI only)
paymentProofAttempts: number (default 0, +1 per submission — rate guard)
```

Semua field existing (`paymentBank`, `paymentDate`, `paymentAuditLog`, `receiptNumber`) tetap — jadi **source of truth untuk "pembayaran yang DIKONFIRMASI admin"**. PaymentProofs = **evidence trail dari customer**.

#### 3.3. Collection baru: `AdminNotifications`

```ts
AdminNotifications {
  id: uuid
  type: select ['booking_new', 'payment_proof_submitted', 'payment_rejected_by_customer', ...]
  booking: relationship → Bookings (optional)
  paymentProof: relationship → PaymentProofs (optional)
  title: text   // "New booking #BK-xxxx — Ferry Ticket Batam→Singapore"
  body: text    // short preview
  severity: select ['info', 'warning', 'critical']  default 'info'
  createdAt: date (auto)
  readBy: array of { user: rel→Users, readAt: date }   // per-user read flag
  // TTL: cron purge > 60 days ATAU readByAll=true > 7 days (future)
  access: { read: admin+, update: admin+ }
}

Indexes:
  - createdAt_idx DESC
  - type_createdAt_idx
```

#### 3.4. Migration plan

- 1 migration: `phase_4_74_1_payment_proofs_schema` (CREATE TABLE payment_proofs + payment_proofs_rels + 2 kolom di bookings + CREATE TABLE admin_notifications).
- Semua additive, non-destructive. Rollback via `pnpm schema:down`.

---

### 4. Perubahan API / Endpoint

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/bookings/:id/submit-payment-proof` | POST (multipart) | token (`?t=<accessToken>`) + rate-limit 3/15min per IP+token | Customer upload bukti → create PaymentProofs record, update booking.status → `payment_review`, create AdminNotifications |
| `/api/payment-upload/:ref` | GET (SSR Astro) | token gate | Halaman upload (apps/web/src/pages/payment/[ref].astro) |
| `/api/admin-notifications` | GET | admin+ | List + pagination |
| `/api/admin-notifications/unread-count` | GET | admin+ | `{count, latest5}` untuk bell polling |
| `/api/admin-notifications/:id/read` | POST | admin+ | Mark read |
| `/api/payment-proofs/:id/approve` | POST | admin+ (reuse `/:id/send-ticket` existing? atau wrap?) | Approve → status confirmed + e-ticket |
| `/api/payment-proofs/:id/reject` | POST | admin+ | Reject + alasan + email customer |

**Reuse pattern** dari Phase 4.66.5 (access token) + 4.66.9 (rate limit hash IP) + 4.66.6 (no-store headers di payment page).

---

### 5. Perubahan Frontend (apps/web)

**File baru**:
- `apps/web/src/pages/payment/[ref].astro` — halaman upload (token-gated, SSR fetch booking state, form multipart POST).
- `apps/web/src/pages/payment/[ref]/success.astro` — "terima kasih, direview dalam 24 jam".
- `apps/web/src/components/payment/PaymentProofForm.astro` (atau Alpine component inline).

**File diubah**:
- Template email + WA di `BookingTemplates.ts` → tambah variable `{{paymentUploadUrl}}` yang di-resolve server-side jadi `https://gtjourneys.id/payment/<ref>?t=<token>`.
- `receiptPdf.ts` — tidak berubah; tetap generate saat admin confirm.

**UX design**:
- Mobile-first (konsisten 4.65/4.67.1).
- Pre-fill nominal dari `booking.totalEstimate` (readonly) → kurangi human error.
- Preview file sebelum submit (object URL thumbnail).
- Progress bar upload (R2 PUT direct atau proxy via Worker, decide di sub-phase 4.74.3).
- Session timer 15 menit mirror 4.67.1 (optional, decide).

---

### 6. Perubahan CMS Admin UI

- **Edit view Bookings → tab "Payment & Proofs" baru** (collapsible, pattern dari 4.73):
  - Section 1: Latest Proof preview (image viewer + metadata)
  - Section 2: All attempts (table rows read-only, link ke PaymentProofs edit)
  - Section 3: Admin verify form (existing fields paymentBank/paymentDate + tombol Confirm/Reject)
- **List view PaymentProofs**: filter default `status=pending` sort `submittedAt ASC` (oldest first → FIFO fairness).
- **Top-bar bell** (`admin.components.beforeNavLinks` di payload.config.ts):
  - Badge angka unread
  - Click → side-panel 20 terbaru + "Mark all read" + deep-link
  - Polling 30s via `/api/admin-notifications/unread-count`.
- Konsisten dengan sidebar group **Bookings** dari Phase 4.68 (PaymentProofs + AdminNotifications masuk ke grup ini).

---

### 7. Keamanan & Privacy

Reuse semua guard dari security master log Phase 4.66 series:
- **Token gate** `?t=<accessToken>` di halaman upload (reuse `bookings.accessToken` 4.66.5 — satu token melayani konfirmasi + upload).
- **Rate limit**: 3 submissions / 15 min / IP+token (mirror 4.66.9).
- **File validation** (server-side):
  - MIME whitelist: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
  - Max size: 5MB.
  - **Scan EXIF strip** untuk JPEG (hilangkan GPS/device PII — rawan customer upload foto HP tanpa sadar).
  - **No executable extensions** (double-extension guard).
- **Storage**: R2 bucket `payment-proofs/` isolated path, admin-only signed URL untuk preview di CMS (TTL 10 min).
- **CSP**: tambah `img-src https://media.gtjourneys.id` ke `_headers` 4.66.3 bila belum.
- **Retention**: PaymentProofs file di-purge otomatis setelah **12 bulan post-confirmation** (konsisten dgn Stage 4.2 passenger PII retention 2026-10 — booking-hardening Stage 4). Kolom metadata tetap untuk audit.
- **Field-level access** `rejectedReason` + `internalNote` + `submittedFromIpHash` + `submittedUserAgent` = admin+ only.
- **No PII leak** di URL/query (sebut hanya `ref` + token).

Entri master log security: tambah 1 baris di [`docs/08-SECURITY-PATCH.md`](../../../../../08-SECURITY-PATCH.md) saat sub-phase 4.74.1 selesai (schema + endpoint hardening).

---

### 8. Dampak ke Modul Lain

| Modul | Dampak |
|---|---|
| OTP Verifications | None — flow terpisah |
| Booking Templates | +3 variable baru (`paymentUploadUrl`, `paymentProofReviewedAt`, `paymentProofRejectReason`) + 2 template baru (adminNotif body short, customerRejectEmail) |
| receiptPdf.ts | None — tetap generate saat `confirmed` (sub-phase 4.70.3.1 existing) |
| Round-trip (4.67.2 series) | None — payment flow leg-agnostic (totalEstimate sudah grand total) |
| Access control (04-RBAC.md) | +2 collection permissions matrix: PaymentProofs (editor read-only / admin verify / super-admin override) + AdminNotifications (admin read own, super-admin all) |
| Chat Widget | None — payment flow self-service, bukan via chat |
| Rate limit infra | Reuse existing (shared helper), tambah bucket key `payment_proof_submit:<hash>` |

---

### 9. Breakdown Sub-Phase (Implementation Order)

| Sub-phase | Scope | Est. effort | Dependency |
|---|---|---|---|
| **4.74.1** | Schema: PaymentProofs + AdminNotifications collection + 2 field di Bookings + migration | S | — |
| **4.74.2** | Endpoint `/api/bookings/:id/submit-payment-proof` + rate limit + file validation + hook create AdminNotifications | M | 4.74.1 |
| **4.74.3** | Frontend `apps/web/src/pages/payment/[ref].astro` + upload form + success page + email/WA template integration (`{{paymentUploadUrl}}`) | M | 4.74.2 |
| **4.74.4** | CMS edit view Bookings tab "Payment & Proofs" + list view PaymentProofs + approve/reject endpoints | M | 4.74.2 |
| **4.74.5** | Admin dashboard notifications: top-bar bell component + polling API + side-panel list + mark-read | M | 4.74.1 |
| **4.74.6** | Hardening + QA: EXIF strip, retention cron, 08-SECURITY-PATCH.md entry, UAT 3-role, closing summary | S | 4.74.1–5 |

Setiap sub-phase menghasilkan 1 file `phase-4.74.N-*.md` di folder yang sama (`docs/phases/phase-4-polish-launch/checkout-flow/payment-receipt-management/`).

---

### 10. Open Questions untuk User

1. **Payment deadline enforcement**: kalau customer tidak upload bukti dalam `paymentDeadlineHours` (24 jam default), apakah booking otomatis `expired` lewat cron? Atau tetap manual admin? *(Rekomendasi: cron auto-expire + email reminder di H-2 jam — tapi defer ke 4.74.7 bila mau fokus MVP.)*
2. **Multi-proof per booking**: boleh resubmit setelah reject (data model sudah support). Berapa max attempts? *(Rekomendasi: 3 attempts, lebih dari itu force admin manual follow-up via WA.)*
3. **Admin notification scope**: notif per-user atau global pool? *(Rekomendasi: global pool + per-user `readBy[]` — supaya shift admin bisa lihat yang unread shift sebelumnya.)*
4. **File hosting**: R2 bucket terpisah untuk payment proofs? *(Rekomendasi: ya — `gt-journeys-payment-proofs` dengan lifecycle rule 12-month purge, isolated dari `gt-journeys-media` public bucket.)*
5. **Payment gateway roadmap**: setelah 4.74 selesai, apakah Xendit/Midtrans masih di-plan atau manual-only indefinitely? *(Jika iya, stub `paymentMethod='xendit'` sudah ada di state machine — tinggal aktifkan.)*
6. **WA notification admin**: selain in-app bell, apakah admin juga mau notif WA/Telegram saat payment proof masuk? *(Defer ke 4.74.7.)*

---

### 11. File yang Akan Berubah (per sub-phase, estimasi)

Sub-phase 4.74.1 (schema):
- `apps/cms/src/collections/PaymentProofs.ts` (new)
- `apps/cms/src/collections/AdminNotifications.ts` (new)
- `apps/cms/src/collections/Bookings.ts` (2 field tambahan + hook latestPaymentProof)
- `apps/cms/src/payload.config.ts` (register 2 collection + sidebar group Bookings)
- `apps/cms/src/migrations/<timestamp>_phase_4_74_1_payment_proofs.ts`
- `docs/02-DATABASE-SCHEMA.md`, `docs/04-RBAC.md`, `docs/08-SECURITY-PATCH.md`

Sub-phase 4.74.2–4.74.6: lihat per-doc nanti.

---

### 12. Impact (overall)

- **Database**: 2 collection baru + 2 kolom di `bookings` + indexes.
- **CMS**: 2 menu baru di grup Bookings (PaymentProofs + AdminNotifications), tab baru di edit Bookings, top-bar bell component.
- **Frontend**: 2 route baru (`/payment/[ref]`, `/payment/[ref]/success`), 2 template email/WA diperbarui.
- **Routes/API**: 6 endpoint baru.
- **RBAC**: 2 collection masuk matrix access.
- **Deploy**: tambah R2 bucket binding + env var (jika pakai bucket terpisah).
- **Security**: masuk master log 08 — token gate + rate limit + file validation + retention.

---

### 13. Testing (per sub-phase, outline)

- Schema: migration up/down roundtrip, strict parallel field naming check.
- Endpoint: happy path + 10+ error codes (invalid token, rate limit, oversize file, bad MIME, EXIF with GPS stripped, booking status gate, double-submit race).
- UI customer: mobile + desktop + iOS Safari file picker + preview thumbnail + session timer timeout.
- UI admin: approve/reject flow, bell polling, deep-link, read state per user.
- Security: curl replay attack, token enumeration, path traversal filename.
- UAT 3-role (editor view read-only / admin verify / super-admin full).

---

### 14. Rollback

Setiap sub-phase punya rollback terpisah (`pnpm schema:down` + revert file). Full phase rollback: urutan terbalik 4.74.6 → 4.74.1. R2 objects stay untuk audit kecuali diminta explicit cleanup.

---

### 15. Dokumentasi yang Akan Diupdate (saat implementasi mulai)

- [ ] `docs/PROGRESS.md` — 1 baris per sub-phase 4.74.1–6
- [ ] `docs/02-DATABASE-SCHEMA.md` — ERD + 2 collection baru + 2 kolom bookings
- [ ] `docs/03-CONTENT-MODEL.md` — tidak perlu (bukan CMS content model, service data)
- [ ] `docs/04-RBAC.md` — matrix access PaymentProofs + AdminNotifications
- [ ] `docs/05-INFRA.md` — R2 bucket + env var baru
- [ ] `docs/08-SECURITY-PATCH.md` — 1 section baru "Payment Proof Submission Hardening" (series) atau extend 4.66 series dengan baris 4.74.*
- [ ] `AGENTS.md` — tidak perlu (tidak mengubah rule proyek)

---

### 16. Next Step

User review dokumen ini → konfirmasi 6 open questions di §10 → mulai sub-phase 4.74.1 (schema) dengan approval eksplisit (AGENTS.md §11 — schema change butuh approval).
