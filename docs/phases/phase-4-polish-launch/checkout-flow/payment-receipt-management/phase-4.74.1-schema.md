## Phase: 4.74.1 — PaymentProofs + AdminNotifications Schema
**Tanggal**: 2026-10-17
**Status**: ✅ Selesai · migration applied batch 59 (local, 204ms) · CMS boot verify pending
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74-payment-receipt-mgmt-analysis.md`](phase-4.74-payment-receipt-mgmt-analysis.md)

### Ringkasan
Sub-phase pertama dari series 4.74 — foundation schema untuk Payment & Receipt Management + Admin Notifications. Hanya schema layer: 2 collection baru + 2 kolom di `bookings` + 2 kolom di `payload_locked_documents_rels`. **Zero endpoint, zero UI change** di sub-phase ini (menyusul di 4.74.2–4.74.6).

### File yang Berubah / Baru
| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/PaymentProofs.ts` | **NEW** — collection `payment-proofs`, 19 field, 3 FK (booking/media/users), field-level access super-admin untuk `internalNote`/`submittedFromIpHash`/`submittedUserAgent` |
| `apps/cms/src/collections/AdminNotifications.ts` | **NEW** — collection `admin-notifications`, 7 field + sub-array `readBy[]`, 2 FK (booking/payment-proofs), per-user `readBy` tracker |
| `apps/cms/src/collections/Bookings.ts` | Tambah 2 field read-only di collapsible akhir: `latestPaymentProof` (rel → payment-proofs) + `paymentProofAttempts` (number, default 0) |
| `apps/cms/src/payload.config.ts` | Register `PaymentProofs` + `AdminNotifications` di grup Bookings (urut sidebar) |
| `apps/cms/src/migrations/20261016_170815_phase_4_74_1_payment_proofs.ts` | **NEW** — hand-written migration (replace auto-gen yg drift) |
| `apps/cms/src/migrations/20261016_170815_phase_4_74_1_payment_proofs.json` | Snapshot auto-gen dibiarkan (baseline accuracy per konvensi 4.67.2a) |

### Keputusan Default (6 Open Questions dari Analysis)
Dari §10 analysis doc — default yg dipilih mengikuti rekomendasi:
1. **Auto-expire deadline cron** → defer ke sub-phase 4.74.7 (post-MVP).
2. **Max resubmit attempts** → 3 (soft limit via `paymentProofAttempts` counter + rate-limit di endpoint 4.74.2).
3. **Admin notification scope** → global pool + per-user `readBy[]` (schema sudah support).
4. **R2 bucket terpisah** → defer ke 4.74.6 hardening; sub-phase 4.74.1 pakai `media` collection existing dulu.
5. **Payment gateway roadmap** → tetap stub (comment di `Bookings.channel`); manual-only indefinitely.
6. **Admin WA/Telegram relay** → defer ke 4.74.7.

### Schema (SQL)
```sql
-- payment_proofs (new table)
CREATE TABLE payment_proofs (
  id INTEGER PK,
  booking_id INTEGER NOT NULL → bookings(id) SET NULL,
  booking_ref_snapshot TEXT,
  sender_name TEXT NOT NULL,
  sender_bank TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'IDR',
  transfer_date TEXT NOT NULL,
  transfer_time TEXT,
  proof_file_id INTEGER NOT NULL → media(id) SET NULL,
  customer_note TEXT,
  submitted_at TEXT,
  submitted_from_ip_hash TEXT,  -- super-admin only
  submitted_user_agent TEXT,    -- super-admin only
  status TEXT DEFAULT 'pending' NOT NULL,  -- pending|approved|rejected
  reviewed_at TEXT,
  reviewed_by_id INTEGER → users(id) SET NULL,
  rejected_reason TEXT,
  internal_note TEXT,           -- super-admin only
  updated_at TEXT, created_at TEXT
);
-- 6 indexes: booking, proof_file, reviewed_by, (status, submitted_at), updated_at, created_at

-- admin_notifications (new table)
CREATE TABLE admin_notifications (
  id INTEGER PK,
  type TEXT NOT NULL,  -- booking_new|payment_proof_submitted|payment_rejected|reschedule_request|cancel_request|other
  title TEXT NOT NULL,
  body TEXT,
  severity TEXT DEFAULT 'info',
  booking_id INTEGER → bookings(id) SET NULL,
  payment_proof_id INTEGER → payment_proofs(id) SET NULL,
  updated_at TEXT, created_at TEXT
);
-- 5 indexes: type, booking, payment_proof, updated_at, created_at

-- admin_notifications_read_by (array sub-table)
CREATE TABLE admin_notifications_read_by (
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL → admin_notifications(id) CASCADE,
  id TEXT PK,
  user_id INTEGER NOT NULL → users(id) SET NULL,
  read_at TEXT NOT NULL
);
-- 3 indexes

-- bookings (additive)
ALTER TABLE bookings ADD latest_payment_proof_id INTEGER → payment_proofs(id);
ALTER TABLE bookings ADD payment_proof_attempts NUMERIC DEFAULT 0;
CREATE INDEX bookings_latest_payment_proof_idx;

-- payload_locked_documents_rels (additive)
ALTER TABLE payload_locked_documents_rels ADD payment_proofs_id INTEGER → payment_proofs(id);
ALTER TABLE payload_locked_documents_rels ADD admin_notifications_id INTEGER → admin_notifications(id);
-- 2 indexes
```

### Catatan Penting: Auto-Gen Drift

`pnpm schema:new` mem-generate migration auto yang membawa drift besar:
- `CREATE TABLE otp_verifications` (sudah ada, Phase 4.69.2)
- `CREATE TABLE booking_templates_bank_accounts` + `CREATE TABLE booking_templates` (sudah ada)
- `down()` yg DESTRUKTIF — INSERT-SELECT di `__new_bookings` hanya baca kolom yg ada di baseline snapshot, **akan menghapus kolom Phase 4.69.5 → 4.70.3.1** (customer_request_kind, receipt_number, payment_date, payment_audit_log, dsb.)

Konsisten dengan konvensi Phase 4.67.2a: `.ts` di-replace dengan **hand-written migration minimal** yang hanya melakukan additive change; `.json` snapshot dibiarkan untuk baseline accuracy di generation berikutnya.

Pattern mirror Phase 4.70.3.1 payment_receipt (`ALTER TABLE ADD` daripada rename-swap).

### Testing

#### Programmatic (schema level)
- [x] `apps/cms/src/collections/PaymentProofs.ts` — TypeScript compiles (CollectionConfig type match).
- [x] `apps/cms/src/collections/AdminNotifications.ts` — TypeScript compiles.
- [x] `pnpm schema:new -- phase_4_74_1_payment_proofs` → auto-gen file created (then replaced hand-written).

#### Manual
- [x] `cd apps/cms && pnpm schema:migrate` — **applied batch 59 (local, 204ms, 2026-10-17)**. User sudah backup DB sebelum konfirmasi dev-mode drift prompt.
- [ ] CMS boot: `pnpm dev` → login → verifikasi:
  - Sidebar group "Bookings" sekarang punya 4 item: Bookings, OTP Verifications, Payment Proofs, Admin Notifications.
  - Edit view Booking → section akhir ada 2 field read-only: Latest Payment Proof + Payment Proof Attempts.
  - List view Payment Proofs: kolom default `bookingRefSnapshot`, `senderName`, `amount`, `status`, `submittedAt`.
  - List view Admin Notifications: kolom default `type`, `title`, `severity`, `createdAt`.
- [ ] Role test (editor/admin/super-admin): editor TIDAK melihat 2 menu baru (hidden flag), admin+ melihat.
- [ ] `pnpm schema:down` → migration reverse → 3 table drop + 2 kolom bookings removed (SQLite 3.35+ DROP COLUMN).

### Rollback
```bash
cd apps/cms
pnpm schema:down   # reverse 20261016_170815_phase_4_74_1_payment_proofs
```
+ `git revert` commit sub-phase ini (collection files + payload.config + Bookings edit).

### Dokumentasi yang Diupdate
- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.1
- [ ] `docs/02-DATABASE-SCHEMA.md` — ERD + 2 collection baru (defer ke 4.74.6 closing summary, bundle dgn full series schema)
- [ ] `docs/04-RBAC.md` — matrix access PaymentProofs + AdminNotifications (defer ke 4.74.6)
- [ ] `docs/08-SECURITY-PATCH.md` — entry defer ke 4.74.2/4.74.6 (endpoint + full hardening)

### Next Step
Setelah user apply migration + verify CMS boot: lanjut sub-phase **4.74.2** (endpoint `/api/bookings/:id/submit-payment-proof` + rate-limit + file validation + hook create AdminNotifications on booking.create + payment_proof.create).
