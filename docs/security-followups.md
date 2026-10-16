# Security Follow-ups — Tracker

Daftar 22 temuan audit security (Bookings, Oct 2026) + rencana penanganan.
Sumber: audit report (dimiliki user) dan ringkasannya di
[`docs/security-hardening-playbook.md`](security-hardening-playbook.md) §6.

Status values:
- `planned` — ada step di playbook, belum dikerjakan.
- `in-progress` — sedang dikerjakan di branch stage terkait.
- `done` — step sudah MERGED ke `main`.
- `accepted` — risiko sengaja diterima, tidak dikerjakan.
- `no-action` — info-only finding, tidak perlu perubahan.
- `deferred` — ditunda ke post-launch / butuh keputusan bisnis.

Severity mengikuti audit asli: `High` / `Medium` / `Low` / `Info`.

Update file ini di commit yang sama ketika sebuah step yang terkait
berpindah status (planned → in-progress → done).

---

## Table

| # | Finding | Severity | Planned step | Status | Notes |
|---|---|---|---|---|---|
| 1 | No field access on `customer*` / passport dates | Medium | 2.2 (dates) + 3.2 (UI masking email/WA/phone) | done-unverified | 2.2: passport dates + DOB → `superAdminFieldAccess`. 3.2: `customerEmail` (`j••@gmail.com`), `customerWhatsapp` + `contactPhone` (`+62•••••••90`) masked di list view via `MaskedEmailCell` + `MaskedPhoneCell`. Full value tetap di detail view (sengaja — admin perlu edit) |
| 2 | `send-payment` race on double click | Medium | 1.1, 1.3 | done | 1.1 + 1.3 MERGED |
| 3 | `send-ticket` per-attempt idempotency — double click = 2 emails | High | 1.1, 1.2 | done | 1.1 + 1.2 MERGED. **Pertahankan** per-attempt idempotency key — tetap pakai `Date.now()` |
| 4 | `paymentAuditLog` editable by super-admin | Medium | 2.1 | done | 2.1 VERIFIED (REST attack test): `access.update: () => false`; endpoint pakai `overrideAccess: true` |
| 5 | `receiptNumber` / `receiptIssuedAt` unguarded | Low | 2.1 | done | 2.1 VERIFIED: sama seperti #4 |
| 6 | `bookingRef` enumerable (mitigated by 128-bit token) | Info | — | accepted | Token sudah 128-bit; enumeration tidak bisa akses booking |
| 7 | `accessToken` shown in plaintext in admin list | Low | 3.1 | done-unverified | Step 3.1: `AccessTokenCell` mask (`••••••••••••{last4}`) + click-to-reveal (per-row, non-persistent) + copy button (full token). Non-telemetric |
| 8 | No CMS-side rate limit on admin endpoints | Medium | — | accepted | Admin trusted; web layer sudah rate-limit customer requests |
| 9 | `PAYLOAD_API_KEY` belongs to admin-role user | High | Stage 4.1 | code-done | Role baru `api` di Users + `isApiOrAdmin` helper. 3 collection widened (bookings create/update, otp-verifications CRUD, newsletter-subscribers CRU). USER manual: bikin user `api-web@internal.gtjourneys.id` role `api` + enable API key + rotate CF secret. Lihat [`phase-4.1`](phases/phase-4-polish-launch/booking-hardening/stage-4-pre-production/phase-4.1-api-user-role.md) |
| 10 | OTP cleanup cron must be scheduled | Low | Stage 4 | planned | Verify `cleanup-otp` cron trigger terdaftar di Cloudflare |
| 11 | No retention / cleanup for booking PII | Medium | Stage 4.2 | code-done | 12-month anonymize untuk 4 field passport PII (passportNumber, dateOfBirth, passportIssueDate, passportExpiryDate). Nama/email/WA sengaja tetap. Endpoint `/api/bookings/anonymize-pii` (CMS) + `/api/cron/anonymize-pii` (web proxy). USER manual: staging dry-run + setup cron trigger. Lihat [`phase-4.2`](phases/phase-4-polish-launch/booking-hardening/stage-4-pre-production/phase-4.2-pii-retention.md) |
| 12 | Logs and PII | Info | — | no-action | Tidak ada tindakan |
| 13 | Email template HTML escaping | Info | — | no-action | Jangan expand `RAW_VARS` ke customer values |
| 14 | Receipt PDF content | Info | — | no-action | Konten sudah OK |
| 15 | GraphQL not disabled | Medium | 1.4 | done | 1.4 MERGED. Set `graphQL: { disable: true }` di payload.config. Grep: 0 app code pakai `/api/graphql` |
| 16 | `enabled` / `role` field access | Info | — | no-action | Default access sudah cukup |
| 17 | Login lockout implicit, no 2FA | Low | 1.5 (lockout now), 2FA later | in-progress | Lockout DONE (1.5 MERGED): `maxLoginAttempts: 5`, `lockTime: 600_000` eksplisit di `Users.auth`. 2FA super-admin → post-launch tetap pending |
| 18 | Media collection public read | Info | — | no-action | Jangan upload passport scans ke Media collection |
| 19 | `bankAccounts` readable by all admins | Info | — | no-action | Admin dianggap trusted |
| 20 | Status transition guards | Info | — | no-action | Logic sudah OK |
| 21 | `customerRequestReason` escaping | Info | — | no-action | Escaping sudah OK |
| 22 | `send-ticket` validates `paymentBank` / `paymentDate` | Info | — | no-action | Validasi sudah OK |

---

## Ringkasan jumlah

- **High (2):** #3, #9
- **Medium (6):** #1, #2, #4, #8, #11, #15
- **Low (4):** #5, #7, #10, #17
- **Info (10):** #6, #12, #13, #14, #16, #18, #19, #20, #21, #22

**Dikerjakan di playbook (14):** #1, #2, #3, #4, #5, #7, #9, #10, #11, #15, #17 (+ sub-items di Stage 2/3/4).
**Accepted risk (2):** #6, #8.
**No-action info (10):** #12, #13, #14, #16, #18, #19, #20, #21, #22 (tetap didokumentasikan di sini supaya tahu alasan tidak diproses).

---

## Cara pakai file ini

- Setiap kali step di playbook berpindah status (TODO → DONE-UNVERIFIED → MERGED),
  update kolom `Status` finding terkait di tabel di atas, di commit yang sama
  dengan update tracker playbook (§2).
- Kalau menemukan finding baru yang belum ada di tabel, **STOP dan tanya user**
  — jangan menambahkan sendiri. File ini mirror audit resmi, bukan catatan ad-hoc.
- File ini **index** saja. Detail implementasi tetap di phase report
  (`docs/phases/...`) dan/atau log keamanan (`docs/08-SECURITY-PATCH.md`).
