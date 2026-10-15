## Phase: 4.62.2 — Bookings endpoint rate-limit per IP hash
**Tanggal**: 2026-09-27
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menambah rate-limit ke `POST /api/bookings/create` — **5 booking / 15 menit
per IP** — sebagai layer anti-spam ketiga (setelah honeypot & signed
time-trap dari Phase 4.62). Pattern in-memory Map mirror
`@lib/newsletter/validators.ts`. Best-effort per Worker isolate; sudah
cukup untuk casual spam. Kalau abuse eskalasi → upgrade ke Cloudflare KV
atau Durable Object.

### File yang Berubah
| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/web/src/lib/checkout/rateLimit.ts` | BARU | `checkBookingRateLimit(ipKey)` (Map-based, 15min window, max 5), `hashIp(ip, salt)` (SHA-256 via Web Crypto), `getClientIp(request)` (baca `cf-connecting-ip` / `x-forwarded-for`). Map terpisah dari newsletter agar spam salah satu tidak mempengaruhi yang lain. |
| `apps/web/src/pages/api/bookings/create.ts` | Edit | Rate-limit check DILETAKKAN sebelum stamp/field validation (biar traffic abusif tidak burn CPU HMAC). Kalau limit hit → 302 → `?err=rate_limited`. |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Edit | Tambah entry `rate_limited` di `errorMessages`. |

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**: `/api/bookings/create` sekarang menolak submit >5x dari IP yang sama dalam 15 menit dengan pesan user-friendly di checkout page.
- **Routes**: none baru; endpoint yang sama sekarang gate rate-limit.
- **RBAC**: none.
- **Deploy needed**: **web only**.

### Testing (dev 4321 + CMS 3030)
- [x] 5 submit valid consecutive → semua 302 → confirmation page (booking dibuat).
- [x] Submit ke-6 → 302 → `/checkout/ferry-tickets/batam-fast?err=rate_limited`. Halaman menampilkan pesan Indonesia yang jelas.
- [x] Rate check dilakukan **sebelum** verifikasi stamp — jadi bot spam massal tidak membebani HMAC. Verified by code inspection.
- [x] Honeypot tetap silent-redirect ke `/` (rate limit tidak trigger sebelumnya, karena honeypot dicek dulu).
- [x] Cleanup: 5 test-booking (F16E17, 362672, 9B52A3, F7333F, 97678E) dihapus via API. Hanya UAT booking `FT-20260927-E2F55C` yang tersisa.

### Konfigurasi
- `RATE_WINDOW_MS = 15 * 60 * 1000` (15 menit)
- `RATE_MAX = 5` (5 percobaan / window / IP)

Ubah di `apps/web/src/lib/checkout/rateLimit.ts` bila perlu di-tuning
(mis. 3/10min untuk lebih ketat, atau 10/1jam untuk lebih longgar).

### Batasan (yang perlu diketahui)
1. **In-memory per Worker isolate**: Cloudflare bisa spin-up beberapa isolate; tiap isolate punya Map sendiri. Attacker dgn koneksi banyak → bisa lolos 5×N. OK untuk casual spam, tidak OK untuk targeted DDoS.
2. **Reset saat isolate restart**: cold-start = reset counter. Konsekuensi: attacker yang tunggu 5 menit + dapat isolate lain bisa reset lebih cepat dari 15 menit.
3. **IP shared (NAT/corporate)**: user di jaringan sama saling batasi. Untuk booking, 5/15min per NAT masih longgar (biasanya 1 IP publik = 1-100 user).

Upgrade path (jika perlu):
- **KV**: `await env.RATE_LIMIT.get(ipKey)` — shared antar isolate, 1 kv-op read + 1 write per request (~$0.50/1M ops).
- **Durable Object**: single serialization, presisi 100%. Cocok untuk API-level rate limit.

### Rollback
```
# Revert code
git checkout HEAD -- apps/web/src/lib/checkout/rateLimit.ts \
  apps/web/src/pages/api/bookings/create.ts \
  apps/web/src/pages/checkout/ferry-tickets/[slug].astro

# Tidak ada migration untuk di-down.
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/checkout-flow/phase-4.62.2-bookings-rate-limit.md` (file ini)
- [x] `docs/PROGRESS.md`

### Next Steps
Lanjutan dari [phase-4.62 Next Steps](phase-4.62-ferry-ticket-checkout-flow.md):
- Cron auto-expire booking pending
- Extend flow ke Tour/Hotel/Car Rental
- Integrasi payment gateway (Xendit/Midtrans)
