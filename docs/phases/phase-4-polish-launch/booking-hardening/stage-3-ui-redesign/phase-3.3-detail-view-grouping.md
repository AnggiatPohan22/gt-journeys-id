## Phase: 3.3 — Detail view grouping: Pricing/Payment/Request History collapsibles + un-hide 11 fields

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — VERIFIED via browser automation
**Commit**: `cbea9ac`
**Finding**: UX (audit section D)

### Ringkasan
Booking detail view ~40 field flat dengan 11 field `hidden: true` yang sebenarnya informatif saat troubleshoot. Step 3.3 expose + group tanpa remove fitur.

### Perubahan (`apps/cms/src/collections/Bookings.ts`)
3 collapsible baru:

| Collapsible | initCollapsed | Isi |
|---|---|---|
| **Pricing** | false | wrap existing `unitPrice` / `currency` / `totalEstimate` row |
| **Payment** | true | wrap + un-hide `receiptNumber` (readOnly), `receiptIssuedAt` (readOnly), `paymentDate` (editable), `paymentBank` (editable) |
| **Request History** | true | wrap + un-hide `customerRequestKind` (readOnly), `customerRequestedAt` (readOnly), `customerRequestReason` (readOnly), `originalDepartureDate` (readOnly), `originalScheduleTimeLabel` (readOnly), `preRequestStatus` (readOnly), `hasRequestedChange` (editable super-admin — confirm modal via 3.4) |

### Scope reduction (vs. brief §4)
**Skip wrap `Customer` + `Trip` collapsibles.** Alasan: wrap murni butuh re-indent 300+ baris existing field blocks tanpa UX win baru (section-section itu sudah visually distinct via row + description). Decision deferred ke follow-up (3.3b) kalau user mau.

### Un-hide safety
- Field access rules TIDAK berubah. `receiptNumber` + `receiptIssuedAt` + `paymentAuditLog` tetap `access.update: () => false` dari Step 2.1 → REST/GraphQL write masih di-drop silently.
- Field required/validate/defaultValue TIDAK berubah.
- Semua readOnly field tetap readOnly di admin UI.

### Testing (verified via DOM inspection)
- [x] 3 collapsible baru muncul di detail view.
- [x] `receiptNumber` + `paymentAuditLog` + audit field: DOM `disabled` attribute present.
- [x] `paymentBank` + `hasRequestedChange`: DOM `disabled: false` → editable sesuai design.
- [x] Save tanpa edit → no audit log entry baru.
- [x] REST PATCH `receiptNumber` → silently dropped (Step 2.1 tetap aktif).

### Scope
- Zero schema change, zero endpoint change, zero new file.
- payload-types regen hanya description delta (benign).

### Rollback
```bash
git revert cbea9ac
```
