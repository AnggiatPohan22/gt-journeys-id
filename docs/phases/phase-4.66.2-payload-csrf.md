## Phase: 4.66.2 — Payload CSRF whitelist

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Finding**: S-05 (High) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
Tambahkan array `csrf: [...]` di `buildConfig` Payload. Sebelumnya tidak ada, sehingga cookie sesi admin bisa dipakai request cross-origin (state-changing) dari domain manapun. Sekarang di-whitelist: localhost dev + `SITE_URL` + `SERVER_URL`.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/cms/src/payload.config.ts](apps/cms/src/payload.config.ts) | Tambah blok `csrf: [ ... ].filter(Boolean)` tepat setelah `cors: [...]`. |

### Impact
- **Database**: none
- **CMS**: Payload sekarang menolak state-changing request lewat cookie sesi kalau `Origin` bukan dari whitelist. **Pengaruh nol** untuk:
  - Admin dashboard di origin yang benar
  - Astro server → `/api/bookings` (pakai `Authorization: users API-Key` header, tanpa cookie → tidak kena CSRF check)
- **Frontend**: none
- **Routes**: none
- **RBAC**: none

### Testing
- [x] Admin login tetap jalan dari `http://localhost:3030` (self-origin).
- [ ] Manual (butuh setup jahat sederhana): buat HTML `<form action="http://localhost:3030/api/users/logout" method="POST">` di origin lain → submit → sebelum patch: logout admin session; sesudah patch: 403 CSRF.
- [x] Astro `/api/bookings/create` → CMS `/api/bookings` via API-key tetap 201 (tidak pakai cookie, CSRF check skipped).

### Rollback
```bash
git revert <commit-hash-of-4.66.2>
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.2-payload-csrf.md`

### Next Steps
Phase 4.66.3 — S-04: tambah `apps/web/public/_headers` (CSP + X-Frame-Options + Referrer-Policy + …).
