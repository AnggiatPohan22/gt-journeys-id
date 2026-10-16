# Stage 2 — Field-level Data Integrity Locks

**Branch**: `fix/booking-field-locks` (merged → main via PR #4)
**Tanggal**: 2026-10-16
**Scope**: 3 step. Server-side `access.update` guards + auto audit
hook. Zero schema change.

## Steps

| Step | File | Finding | Commit |
|---|---|---|---|
| 2.1 | [lock-receipt-audit-fields](phase-2.1-lock-receipt-audit-fields.md) | #4, #5 | `07c531f` |
| 2.2 | [superadmin-passport-dates](phase-2.2-superadmin-passport-dates.md) | #1 (partial) | `a1723e5` |
| 2.3 | [auto-audit-log-manual-edits](phase-2.3-auto-audit-log-manual-edits.md) | audit gap | `0ba8eac` |

## Smoke test checklist (post-merge, verified by REST probe)

- [x] REST PATCH `receiptNumber` / `receiptIssuedAt` / `paymentAuditLog` → silently dropped, DB untouched.
- [x] send-ticket endpoint (uses `overrideAccess: true`) → tetap jalan.
- [x] Admin biasa PATCH `passengers.0.dateOfBirth` → di-drop. Super-admin PATCH sukses.
- [x] Admin edit `paymentBank` di booking confirmed → audit log entry append dengan suffix `manual-edit`.
- [x] Admin edit `customerName` → audit log TIDAK berubah (scope sempit hanya tracked fields).
- [x] send-ticket resend → `context.skipAuditLogHook = true` → hook skip → tidak dobel entry.

## Follow-up findings addressed

- #1 Medium — field access on customer*/passport dates → **partial** (dates done; email/WA/phone sengaja tidak dilock, mask di UI via Stage 3.2).
- #4 Medium — paymentAuditLog editable by super-admin → **done**
- #5 Low — receiptNumber/receiptIssuedAt unguarded → **done**
