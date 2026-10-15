## Phase: 4.66.7 — Field-level access untuk `passengers.passportNumber`

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Finding**: S-09 (Medium) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
Passport number di-simpan penuh (unmasked) di DB — data paling sensitif di collection Bookings. Collection-level `update: isAdmin` sudah menutup editor, tapi field ini masih bisa diubah admin biasa. Naikkan gate ke `superAdminFieldAccess` untuk update: admin bisa **membaca** (untuk ticketing) tapi tidak bisa mengubah passport. Sesuai principle of least privilege.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/cms/src/collections/Bookings.ts](apps/cms/src/collections/Bookings.ts) | Tambah `access: { update: superAdminFieldAccess }` pada field `passengers[].passportNumber`. Update description supaya jelas ke UI admin. Import `superAdminFieldAccess`. |

### Impact
- **Database**: none (field-level access hanya application-layer).
- **CMS**: admin (non-super) melihat passport tapi field-nya read-only di edit view. Super-admin normal.
- **Frontend**: none.
- **Routes**: none.
- **RBAC**: field-level tightening — dokumentasi RBAC (`docs/04-RBAC.md`) akan di-refresh batch di akhir Phase 4.66.

### Testing
- [ ] Login sebagai admin non-super → buka Booking → passport row terlihat, tapi input `passportNumber` disabled. Field lain (nationality, DOB, dsb.) tetap editable.
- [ ] Login sebagai super-admin → passport editable normal.
- [ ] REST: PATCH `/api/bookings/<id>` dengan payload `{ passengers: [{ ..., passportNumber: 'HACKED' }] }` via API-key user yang bukan super-admin → passport tetap tidak berubah (Payload silently strip / reject sesuai field access).

### Rollback
```bash
git revert <commit-hash-of-4.66.7>
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/security-patch/phase-4.66.7-passport-field-access.md`
- [ ] `docs/04-RBAC.md` — akan di-batch update di akhir series 4.66.

### Next Steps
Phase 4.66.8 — S-10 + S-11: fail-fast env checks (`PAYLOAD_API_KEY`, `BOOKING_FORM_SECRET`) di production.
