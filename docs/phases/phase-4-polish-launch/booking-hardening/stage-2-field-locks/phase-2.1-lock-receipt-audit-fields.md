## Phase: 2.1 — Lock receipt + audit fields server-side

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #4) — VERIFIED via REST attack
**Commit**: `07c531f`
**Finding**: #4 (Medium), #5 (Low)

### Ringkasan
`receiptNumber`, `receiptIssuedAt`, `paymentAuditLog` → `admin.readOnly: true` hanya block admin panel; REST/GraphQL super-admin masih bisa overwrite. Tambah `access.update: () => false` server-side guard. Endpoint `send-ticket` pakai `overrideAccess: true` → tetap bisa auto-write via Payload API.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | 3 field: `access: { update: () => false }`. |

### Dampak
- REST PATCH `{receiptNumber: "HACKED"}` → request accepted (200) tapi field silently dropped. DB untouched.
- `send-ticket` endpoint (yang pakai `overrideAccess: true`) → tetap bisa set `receiptNumber`/`receiptIssuedAt` first-send + append `paymentAuditLog` entries pada resend.
- Admin UI `readOnly: true` tetap jalan sebagai UX hint (field disabled di form).

### Testing (verified)
- [x] REST PATCH `receiptNumber` sebagai super-admin → DB tidak berubah.
- [x] REST PATCH `receiptIssuedAt` sebagai super-admin → DB tidak berubah.
- [x] REST PATCH `paymentAuditLog` sebagai super-admin → DB tidak berubah.
- [x] send-ticket flow (first send + resend) → tetap jalan, field ter-populate otomatis.

### Scope
- Zero schema change, zero endpoint change, zero new package.

### Rollback
```bash
git revert 07c531f
```
