## Phase: 4.69.10 — Cron OTP Cleanup

**Tanggal**: 2026-10-10
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (endpoint ready — cron scheduler setup manual, lihat §Setup)
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Ephemeral OTP records (Phase 4.69.2) terakumulasi di tabel
`otp_verifications` tiap verify email. Tiap record TTL 10 menit tapi
tidak auto-dihapus — tanpa cleanup, tabel membengkak terus (potensi
~1k rows/hari saat traffic). Phase ini menambah **endpoint cleanup**
yang bisa dipanggil external cron (weekly disarankan).

Konfigurable **grace window** 7 hari default — admin masih bisa audit
record setelah expired, baru dihapus setelah window habis.

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/collections/OtpVerifications.ts` | Edit | +endpoint `POST /cleanup` (admin API-key). Find records `expiresAt < now - graceDays`, delete batch max 1000, return `{deleted, hasMore}`. |
| `apps/web/src/pages/api/cron/cleanup-otp.ts` | BARU | POST + GET endpoint untuk cron caller. Bearer auth dgn `CRON_SECRET` (constant-time compare). Loop batch sampai `hasMore=false`, max 10 batch per invocation (safety cap 10k records/call). |
| `apps/web/.env.example` | Edit | Tambah `CRON_SECRET` placeholder dgn generate instruction. |
| `docs/phases/.../phase-4.69.10-cron-otp-cleanup.md` | BARU | File ini. |

### Endpoints

#### CMS: `POST /api/otp-verifications/cleanup`

Body: `{ graceDays?: number }` (default 7, clamp [0, 90])
Auth: Admin API-Key via `Authorization: users API-Key <KEY>`
Response:
```json
{
  "ok": true,
  "deleted": 42,
  "scanned": 42,
  "cutoffISO": "2026-10-03T00:00:00.000Z",
  "hasMore": false
}
```

#### Web: `POST /api/cron/cleanup-otp`

Auth: `Authorization: Bearer <CRON_SECRET>` (constant-time)
Body (optional): `{ graceDays?: number }`
Response:
```json
{
  "ok": true,
  "totalDeleted": 42,
  "batches": 1,
  "graceDays": 7
}
```

Health check: `GET /api/cron/cleanup-otp` (same auth) → `{ ok: true, service: "cleanup-otp", ready: true }`

### Setup: Memilih Cron Scheduler

Cloudflare Pages (dipakai web app) **tidak support** cron trigger
natively. Pilih salah satu:

#### Option A — GitHub Actions (recommended, free, zero infra)

Buat file `.github/workflows/cron-otp-cleanup.yml`:

```yaml
name: OTP Cleanup Cron
on:
  schedule:
    - cron: '0 2 * * 0'  # Sunday 02:00 UTC
  workflow_dispatch: {}  # manual trigger button

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Invoke cleanup endpoint
        run: |
          curl -fsSL -X POST "https://gtjourneysid.com/api/cron/cleanup-otp" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"graceDays": 7}'
```

Setup:
1. Repo settings → Secrets → add `CRON_SECRET` (identical dgn env web)
2. Push workflow file
3. Monitor di Actions tab

#### Option B — Separate Cloudflare Worker (triggers from CF infra)

Buat Worker baru `cron-cleanup-worker` dengan `wrangler.toml`:

```toml
name = "cron-cleanup-worker"
main = "src/index.ts"
compatibility_date = "2026-10-10"

[triggers]
crons = ["0 2 * * 0"]

[vars]
CRON_URL = "https://gtjourneysid.com/api/cron/cleanup-otp"

# Setelah deploy:
# wrangler secret put CRON_SECRET
```

`src/index.ts`:
```typescript
export default {
  async scheduled(_event, env, ctx) {
    await fetch(env.CRON_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ graceDays: 7 }),
    })
  }
}
```

#### Option C — External service (Cronhub, EasyCron, UptimeRobot)

Buat scheduled HTTP request POST ke endpoint. Minimum setup:
- URL: `https://gtjourneysid.com/api/cron/cleanup-otp`
- Method: POST
- Headers: `Authorization: Bearer <CRON_SECRET>`
- Schedule: Weekly Sunday 02:00 UTC

### Testing

#### Smoke test manual (dev)
```bash
# Set CRON_SECRET di apps/web/.env dulu
curl -X POST http://localhost:4321/api/cron/cleanup-otp \
  -H "Authorization: Bearer <CRON_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"graceDays": 0}'
# → {"ok":true,"totalDeleted":N,"batches":1,"graceDays":0}

# Health check
curl http://localhost:4321/api/cron/cleanup-otp \
  -H "Authorization: Bearer <CRON_SECRET>"
# → {"ok":true,"service":"cleanup-otp","ready":true}
```

Set `graceDays: 0` untuk cleanup segera semua yang expired. Default `7`
di cron production.

#### Unauthorized test
```bash
curl -X POST http://localhost:4321/api/cron/cleanup-otp \
  -H "Authorization: Bearer wrong"
# → 401 {"ok":false,"error":"unauthorized"}
```

### Impact

- **Database**: zero schema change. Delete only.
- **CMS**: 1 custom endpoint baru di `OtpVerifications`.
- **Frontend web**: 1 endpoint baru.
- **Env**: 1 variable baru di web (`CRON_SECRET`).
- **Deploy needed**: **cms + web** (sekali untuk endpoint deploy).
- **Infra setup**: external cron (GitHub Actions / Worker / cron service) — **manual** (one-time setup).

### Security

- **Auth boundary**: web endpoint `CRON_SECRET` (shared secret). CMS endpoint
  API-Key (role admin). Dua lapis → cron caller tidak punya akses CMS langsung.
- **Constant-time compare** untuk Bearer header → mitigate timing attack.
- **Idempotent**: delete expired record aman di-run berulang kali.
- **No PII exposed**: endpoint response hanya count + cutoff ISO, tidak
  mengembalikan konten record.
- **Rate-limit tidak perlu**: endpoint di-auth secret + batch cap internal.
- **Grace window** cegah data loss accidental saat admin lagi audit.

### Known Limitations

- Max 10,000 records per invocation (10 batch × 1000). Kalau accumulation
  jauh lebih besar, cron butuh ditambah frekuensi atau cap dinaikkan.
- Tidak ada lock mechanism — kalau cron dipanggil 2x bersamaan (race),
  kedua call bisa coba delete record sama. Payload gracefully handle
  (second delete fails silently). Tidak ideal tapi tidak merusak.
- Scheduler setup external (manual) — tidak otomatis di-deploy bersama
  codebase. Dokumentasi 3 opsi di atas supaya ops mudah pilih.
- GET health-check pakai auth yang sama supaya scanner public tidak bisa
  info-leak service name. Trade-off: cron service health check butuh secret.

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/06-MAINTENANCE-RUNBOOK.md` — tambah entry cron cleanup setup
- [ ] `docs/05-INFRA.md` — tambah dependency external scheduler

### Series 4.69 — SELESAI

Phase 4.69.1 — Resend provider setup ✅
Phase 4.69.2 — OTP schema + email endpoints ✅
Phase 4.69.3 — Form UI email verification wall ✅
Phase 4.69.4 — Passenger inline validation ✅
Phase 4.69.5 — Bookings status enum + admin-handoff audit fields ✅
Phase 4.69.6 — BookingTemplates global + template renderer ✅
Phase 4.69.7 — Admin "Send Payment" + "Send Ticket" buttons ✅
Phase 4.69.8 — Admin booking list filter bar ✅
Phase 4.69.9 — Customer reschedule/cancel request flows ✅
**Phase 4.69.10 — Cron OTP cleanup** ✅

Deferred (future enhancement):
- Phase 4.69.11 — WhatsApp OTP via WA Cloud API
- Phase 4.69.12 — E-ticket PDF attach
