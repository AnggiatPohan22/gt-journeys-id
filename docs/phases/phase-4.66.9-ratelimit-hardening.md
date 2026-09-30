## Phase: 4.66.9 — Rate-limit hardening

**Tanggal**: 2026-09-30
**Status**: Selesai (interim — KV/DO upgrade di-defer sampai Pages binding tersedia)
**Dikerjakan oleh**: Claude Code
**Finding**: S-07 (Medium) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
Rate limiter tetap in-memory per Worker isolate (belum ada KV binding). Interim hardening:
1. `RATE_MAX` turun dari 5 → 3 per 15-menit window.
2. Kunci map = hash(salt, IP) via SubtleCrypto SHA-256, bukan raw IP → memory dump tidak bocor identitas.
3. Bounded LRU: max 10.000 entries, eviksi entri terlama kalau melewati limit → cegah memory growth di isolate long-running.

Migration ke Cloudflare KV / Durable Object dijadwalkan sebagai enhancement mendatang (butuh binding di project Cloudflare Pages yang belum ada).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/web/src/lib/checkout/rateLimit.ts](apps/web/src/lib/checkout/rateLimit.ts) | `RATE_MAX = 3` (dari 5). Tambah `MAX_MAP_ENTRIES = 10_000` + helper `evictOldestIfNeeded`. Update docstring. |
| [apps/web/src/pages/api/bookings/create.ts](apps/web/src/pages/api/bookings/create.ts) | Import `hashIp`. Baca env `BOOKING_RL_SALT` (fallback konstanta). Pakai `hashIp(ip, salt)` sebagai key `checkBookingRateLimit`. |

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**: pengguna wajar tidak terpengaruh (3 attempts / 15 min per IP masih longgar untuk retry karena typo). Attacker yang scripted → hit limit lebih cepat.
- **Routes**: none.
- **RBAC**: none.
- **Env baru**: `BOOKING_RL_SALT` (opsional, non-critical). Kalau tidak diset, fallback konstanta digunakan.

### Testing
- [x] Grep — `RATE_MAX = 3` verified.
- [ ] Manual: POST `/api/bookings/create` 4× cepat dari IP yang sama (via `curl`) → attempt ke-4 redirect `?err=rate_limited`.
- [ ] Reset (tunggu 15 menit atau restart dev server) → counter reset.
- [ ] Verify no PII in map keys: `console.log([...hits.keys()])` — hanya string hex, bukan `1.2.3.4`.

### Rollback
```bash
git revert <commit-hash-of-4.66.9>
```

### Follow-up (di luar Phase 4.66)
Enhancement mendatang: pindah ke Cloudflare KV (shared across isolates). Sketch:
1. Tambah `[[kv_namespaces]]` di Pages Functions config.
2. `RateLimit` service: `env.RATE_LIMIT_KV.get(hashKey)` → JSON list of timestamps, atomic update via `put`.
3. Fallback ke in-memory kalau binding tidak ada (dev / initial deploy).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.9-ratelimit-hardening.md`

### Next Steps
Phase 4.66.10 — S-13: trim WA message (Manual WhatsApp channel) supaya PII yang bocor ke URL query WA minimal.
