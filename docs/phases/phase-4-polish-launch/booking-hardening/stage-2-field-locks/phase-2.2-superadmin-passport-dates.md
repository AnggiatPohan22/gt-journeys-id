## Phase: 2.2 — Super-admin-only update untuk passport dates + DOB

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #4)
**Commit**: `a1723e5`
**Finding**: #1 (Medium) — partial (dates done; email/WA/phone deferred ke Stage 3.2 UI mask)

### Ringkasan
Konsisten dengan `passportNumber` yang sudah pakai `superAdminFieldAccess` sejak Phase 4.66.7. Tiga field passenger sensitif (`dateOfBirth`, `passportIssueDate`, `passportExpiryDate`) di-naikkan ke level yang sama: admin biasa bisa baca untuk ticketing tapi tidak bisa update.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | `passengers[].dateOfBirth`, `passengers[].passportIssueDate`, `passengers[].passportExpiryDate`: tambah `access: { update: superAdminFieldAccess }`. Description notes "Update dibatasi super-admin (Step 2.2)". |

### Keputusan sengaja TIDAK di-lock
`customerEmail`, `customerWhatsapp`, `contactPhone` → admin biasa harus bisa fix typo. UI masking via Step 3.2 (list cells) adalah mitigasi yang dipilih, bukan server-side lock.

### Testing
- [x] Admin biasa PATCH `passengers.0.dateOfBirth` → di-drop (field access).
- [x] Super-admin PATCH sama → sukses.
- [x] Admin UI edit page: field disabled untuk admin biasa, enabled untuk super-admin.

### Scope
- Zero schema change, zero new package.

### Rollback
```bash
git revert a1723e5
```
