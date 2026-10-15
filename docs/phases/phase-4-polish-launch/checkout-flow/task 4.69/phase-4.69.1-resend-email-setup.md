## Phase: 4.69.1 — Resend Email Provider Setup (Sandbox Dev)

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (dev — sandbox mode)
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Setup infrastruktur email dasar untuk Phase 4.69 (checkout verification +
admin handoff). Pattern **provider-agnostic**: `EmailProvider` interface
di [types.ts](../../../../apps/web/src/lib/email/types.ts) +
`ResendProvider` impl via fetch (zero npm, sesuai D2) +
`getEmailProvider()` factory di [index.ts](../../../../apps/web/src/lib/email/index.ts)
yang resolve dari env sekali per modul load. Caller cukup
`import { sendEmail } from '@lib/email'` — swap provider nanti (SES,
Mailgun) tanpa ubah caller.

Dev stage pakai sandbox Resend (`onboarding@resend.dev` sebagai FROM) —
delivery dibatasi ke email yang di-whitelist di dashboard Resend owner.
Launch stage flip 2 env var (`RESEND_FROM_EMAIL` + `RESEND_REPLY_TO_EMAIL`)
ke `@gtjourneys.id` saat domain siap + DNS verified. Zero code change.

### Keputusan Owner (approved 2026-10-09)

- **D1** YES — email-OTP only (WA OTP future)
- **D2** YES — zero npm baru; pakai `fetch` + `AbortController`
- **D7** RESEND — provider terpilih
- **D8** `noreply@gtjourneys.id` (from, production) + `booking@gtjourneys.id` (reply-to, production)
- **D-domain-4** YES — dev pakai sandbox `onboarding@resend.dev`

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/web/src/lib/email/types.ts` | BARU | `EmailAddress`, `EmailPayload`, `EmailResult`, `EmailProvider` interface |
| `apps/web/src/lib/email/resend.ts` | BARU | `ResendProvider` class — fetch wrapper ke `https://api.resend.com/emails` dgn AbortController timeout 10s, idempotency-key passthrough, error normalization |
| `apps/web/src/lib/email/index.ts` | BARU | `getEmailProvider()` factory + `sendEmail()` shortcut + `NoopEmailProvider` fallback (dev tanpa `.env` tetap jalan dgn warning, tidak crash) + `__resetEmailProviderForTests()` |
| `apps/web/.env.example` | Edit | Tambah section Phase 4.69.1: `RESEND_API_KEY=`, `RESEND_FROM_EMAIL=onboarding@resend.dev`, `RESEND_REPLY_TO_EMAIL=`, `RESEND_FROM_NAME=` + komentar launch-stage flip |
| `apps/web/.env` | Edit (local, not committed) | Owner-filled: `RESEND_API_KEY=re_<redacted>`, `RESEND_FROM_EMAIL=onboarding@resend.dev`, `RESEND_REPLY_TO_EMAIL=anggiatcool1@gmail.com`. OTP vars dibiarkan commented (scope 4.69.2) |
| `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/phase-4.69.1-resend-email-setup.md` | BARU | File ini |

### Arsitektur — Kenapa Provider-Agnostic

1. **Interface terpisah dari impl**: caller (`sendEmail({ to, subject, text })`) tidak tahu Resend/SES/Mailgun. Swap = ganti class di `index.ts` factory, zero caller change.
2. **Noop fallback**: dev tanpa `RESEND_API_KEY` tetap boot normal; `.send()` return `{ ok: false }` + log warning. Sudut penting karena endpoint checkout di dev yang belum setup Resend tidak crash.
3. **Error swallow pattern**: provider **tidak throw** — selalu return `{ ok, error, status }`. Caller bebas putuskan retry / show error / fallback. Match pattern `apps/web/src/lib/newsletter/notifiers.ts` (Phase 4.33) — notifier MUST NOT throw.
4. **Idempotency-key passthrough**: Resend dedupe otomatis 24 jam kalau header `Idempotency-Key` di-set. Dipakai nanti saat 4.69.2 (OTP) & 4.69.7 (admin send payment) untuk mencegah double-send saat admin double-click atau request retry.
5. **AbortController timeout 10s**: Cloudflare Workers punya CPU budget ketat. Resend down → request hang → endpoint timeout. 10s cukup untuk Resend yang biasanya respond <500ms.

### Env Setup Flow

**Dev (sekarang)**:
```bash
# apps/web/.env
RESEND_API_KEY=re_xxxxxxxxxxxxx          # Sending-access key dari resend.com
RESEND_FROM_EMAIL=onboarding@resend.dev  # Sandbox
RESEND_REPLY_TO_EMAIL=anggiatcool1@gmail.com
```

Delivery hanya ke email yang di-whitelist di dashboard Resend (biasanya
cuma email signup owner). Cukup untuk owner + 2–3 tester lewat whitelist.

**Launch (future, saat domain siap)**:
```bash
RESEND_FROM_EMAIL=noreply@gtjourneys.id    # Flip
RESEND_REPLY_TO_EMAIL=booking@gtjourneys.id # Flip
RESEND_FROM_NAME=GtJourneysID Booking      # Optional display name
```

Prasyarat:
1. Domain `gtjourneys.id` dibeli.
2. Resend dashboard → Domains → Add → copy 3-4 DNS record (SPF/DKIM/DMARC) ke DNS provider.
3. Tunggu verif (15m–4h biasanya).
4. Inbox real untuk `booking@gtjourneys.id` (Google Workspace / Zoho / Hostinger).

Zero code change saat flip — hanya env var + redeploy.

### Testing

#### 1. Live Smoke-Test (Phase 4.69.1 verification)

Dilakukan selama eksekusi phase ini via curl langsung ke Resend API
(bukan via lib, karena lib butuh Astro runtime):

```bash
# PowerShell / Git Bash
KEY=$(grep "^RESEND_API_KEY=" apps/web/.env | cut -d= -f2- | tr -d ' \r')
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": ["anggiatcool1@gmail.com"],
    "subject": "GtJourneysID Phase 4.69.1 smoke test",
    "text": "Kalau terima email ini, Resend setup berhasil."
  }'
```

**Hasil**: HTTP 200, email id `01a11fea-1449-7880-bf92-70fbd4235b1f`,
email sampai di inbox `anggiatcool1@gmail.com` dalam < 30 detik.
✓ Confirmed by owner.

#### 2. TypeScript check

```bash
pnpm --filter @gt-journeys/web exec tsc --noEmit
```

**Hasil**: Zero error di 3 file baru (`types.ts`, `resend.ts`, `index.ts`).
2 pre-existing error di `newsletter/index.ts` + `payload-types.ts`
unrelated to this phase.

#### 3. Lib Integration Test (Deferred — ship saat 4.69.2 ada endpoint)

Lib `sendEmail()` baru di-exercise saat Phase 4.69.2 bangun endpoint
`/api/checkout/verify/email-send`. Smoke test lewat endpoint OTP = test
real-flow lib ini juga.

### Impact

- **Database**: none
- **CMS**: none
- **Frontend**: 3 file baru di `src/lib/email/` (belum dipakai oleh page/endpoint apapun — infrastruktur saja; dipakai mulai 4.69.2)
- **Routes**: none
- **RBAC**: none
- **Deploy needed**: **web** saat 4.69.2+ ship (phase ini standalone tidak butuh deploy — tidak ada caller yang mengaktifkannya)
- **Env vars baru**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO_EMAIL`, `RESEND_FROM_NAME`

### Rollback

Revert 3 file lib baru + section Phase 4.69.1 di `.env.example`. `apps/web/.env`
dibiarkan (owner cleanup manual). Zero caller yang depend pada lib ini di
phase ini → rollback 100% aman tanpa downstream break.

### Security Notes (untuk `docs/08-SECURITY-PATCH.md` saat series 4.69 complete)

- API key disimpan di env, **bukan** di source. `.env` di-gitignore.
- Launch stage: API key simpan via `wrangler secret put RESEND_API_KEY` (bukan `[vars]` di `wrangler.toml`) — konsisten dgn pattern Phase 4.66.1 (`PAYLOAD_SECRET` keluar dari `[vars]`).
- `AbortController` timeout 10s — mitigation slow-loris / dangling connection.
- Error message dari Resend tidak di-expose ke user — hanya di-log server-side. Caller terima `EmailResult` object yang bisa decide pesan user-facing sendiri.
- Email body: HTML template-controlled only (no user input raw-inject). Enforcement nanti di 4.69.6 (BookingTemplates variable substitution dengan HTML escape per `{{var}}`).

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/PROGRESS.md` — akan di-update di akhir series 4.69, atau saat sub-phase pertama yang user-visible (4.69.3) ship. Phase 4.69.1 pure infrastruktur, defer entry PROGRESS.
- [ ] `docs/08-SECURITY-PATCH.md` — update saat series 4.69 complete (satu entry log untuk 4.69.1→4.69.10)
- [ ] `docs/05-INFRA.md` — update env list saat launch-stage flip (future)

### Next Steps

**Phase 4.69.2 — OTP schema + endpoints**:
1. Migration `otp_verifications` table (D1)
2. API `POST /api/checkout/verify/email-send` + `POST /api/checkout/verify/email-check`
3. HMAC `email_verified_token` (TTL 30m, single-use)
4. Rate-limit terpisah dari booking rate-limit (3 send/15min per IP+email, 5 check-attempt/OTP)
5. Variable `OTP_SALT` + 4 config vars di `.env` (uncomment yg sekarang di-comment)
6. Pakai `sendEmail()` dari lib ini untuk kirim OTP

Setelah 4.69.2 selesai, lanjut 4.69.3 (UI form inline verify).
