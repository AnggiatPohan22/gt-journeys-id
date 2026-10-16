## Phase: 2.3 — Auto audit log untuk manual edit payment/departure fields

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #4)
**Commit**: `0ba8eac`
**Finding**: audit gap (manual admin edits untracked)

### Ringkasan
`beforeChange` hook `auditManualEditHook` append entry ke `paymentAuditLog` saat admin mengubah `paymentBank`, `paymentDate`, atau `departureDate` lewat admin UI / REST biasa pada booking yang sudah confirmed+. Membedakan dari send-ticket resend flow via `context.skipAuditLogHook` guard.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | Tambah `auditManualEditHook` function + register di `hooks.beforeChange`. Modifikasi `sendTicketEndpoint` → set `req.context.skipAuditLogHook = true` saat update. |

### Behavior
- **Gated statuses**: `confirmed`, `reschedule_request`, `cancel_request`, `cancelled`, `expired`. Status pre-confirmed (`awaiting_review`, `awaiting_payment`, `payment_review`, `pending`) → hook skip (field memang belum ter-set, noise).
- **Tracked fields**: `paymentBank` (string normalize), `paymentDate` + `departureDate` (compare YYYY-MM-DD, ignore time portion).
- **Format entry**: `{ISO} {user.email} | field: old -> new | ... | manual-edit`. Suffix `manual-edit` membedakan dari send-ticket resend entries.
- **Guard duplikasi**: send-ticket endpoint set `context.skipAuditLogHook: true` → hook skip → tidak dobel dengan send-ticket's own audit entry.

### Testing (verified)
- [x] PATCH `paymentBank` pada booking confirmed → audit log entry append dengan format persis + suffix `manual-edit`.
- [x] PATCH `customerName` pada booking confirmed → audit log TIDAK berubah (scope sempit).
- [x] send-ticket resend → hook skip → tidak ada dobel entry (verify via log count).
- [x] PATCH `paymentBank` pada booking `awaiting_review` → hook skip (status pre-confirmed).

### Scope
- Zero schema change, zero endpoint rename, zero new package.
- `paymentAuditLog` field sudah exist dari Phase 4.70.3.1.

### Rollback
```bash
git revert 0ba8eac
```
