## Phase: 1.5 — Explicit login lockout config

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #3)
**Commit**: `e59a993`
**Finding**: #17 (Low) — partial (lockout done; 2FA deferred ke post-launch)

### Ringkasan
Users.ts `auth`: tambah `maxLoginAttempts: 5` + `lockTime: 600_000` (10 menit) eksplisit. Default Payload v3 sama persis (verifikasi di `node_modules/payload/dist/auth/types.d.ts`), tapi explicit menjaga perilaku stabil kalau default berubah antar versi dan tercatat untuk audit.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Users.ts` | `auth: { useAPIKey: true, maxLoginAttempts: 5, lockTime: 600_000 }`. |

### Mekanisme
Setelah 5 failed login berturut-turut, Payload set `lockUntil` ke `now + lockTime`. Super-admin bisa force-unlock via Security tab `ForceUnlockButton` (sudah ada dari phase sebelumnya).

### Testing
- [x] Login salah 5x → akun locked 10 menit (verify via `loginAttempts` + `lockUntil` di DB).
- [x] Login benar sebelum attempt ke-5 → counter reset.
- [x] Super-admin klik Force Unlock di user profile → `lockUntil` cleared.

### Scope
- Zero schema change (`loginAttempts` + `lockUntil` kolom sudah ada dari `auth: true`).
- Zero new package, zero new endpoint.

### Follow-up
- 2FA untuk super-admin → deferred post-launch (finding #17 tetap in-progress).

### Rollback
```bash
git revert e59a993
```
