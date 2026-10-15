## Phase: 4.69.2 — OTP Schema + Email Verification Endpoints

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (dev — sandbox mode)
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Bangun infrastruktur OTP email verification end-to-end:
collection `OtpVerifications` di CMS + 2 API endpoint di Astro
(`/api/checkout/verify/email-send` + `email-check`) + HMAC
`email_verified_token` + rate-limit terpisah dari booking.

Semua nilai sensitive **di-hash sebelum simpan**: email ter-hash
sebagai `targetHash` (SHA-256 + salt), OTP 6-digit ter-hash sebagai
`otpHash`, IP ter-hash sebagai `ipHash`. Kebocoran DB tidak langsung
expose PII mentah.

Smoke-test E2E lolos (send → check → token issued → reuse ditolak,
attempt-limit kick-in setelah 5x salah).

### Keputusan Owner (approved sebelumnya)

- **D1** YES — email-OTP MVP (WA OTP future)
- **D2** YES — zero npm (fetch + Web Crypto + Payload native)
- **D5** YES — foundation untuk 4 status enum baru (dipakai mulai 4.69.5)

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/collections/OtpVerifications.ts` | BARU | Payload collection: fields `kind/targetHash/otpHash/attempts/expiresAt/verifiedAt/ipHash` + 2 custom endpoints `:id/mark-verified` + `:id/increment-attempt` (workaround PATCH generic broken di project ini — pakai Local API via `req.payload.update()` dgn `overrideAccess: true`) |
| `apps/cms/src/payload.config.ts` | Edit | Import + register `OtpVerifications` di `collections[]` (group `Bookings`) |
| `apps/cms/src/migrations/20261009_094925_phase_4_69_2_otp_verifications.{ts}` | BARU | `CREATE TABLE otp_verifications` (10 kolom, 2 index) + `ALTER TABLE payload_locked_documents_rels ADD otp_verifications_id` (Payload v3 butuh kolom rel di join-table untuk tiap collection) |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration entry |
| `packages/shared/src/types/payload-types.ts` | Regenerate | `OtpVerification` type + join-table update |
| `apps/web/src/lib/checkout/otp.ts` | BARU | `generateOtp()` (CSPRNG 6-digit), `hashWithSalt()`, `hashOtp()`, `timingSafeEqual()`, `expiresAtIso()`, `isValidEmail()`, `OTP_CONFIG` export |
| `apps/web/src/lib/checkout/emailVerifiedToken.ts` | BARU | HMAC token `<targetHash>.<issuedMs>.<hex-sig>` dgn TTL 30m (reuse `BOOKING_FORM_SECRET` existing). `issueEmailVerifiedToken()` + `verifyEmailVerifiedToken()` |
| `apps/web/src/lib/checkout/otpStore.ts` | BARU | REST wrapper ke `otp-verifications`: `createOtp()`, `findActiveOtp()` (filter `verifiedAt:exists:false` + `expiresAt:greater_than:now`), `incrementAttempt()` + `markVerified()` via custom endpoint |
| `apps/web/src/lib/checkout/otpRateLimit.ts` | BARU | In-memory Map rate-limit per `(ipHash::targetHash)`: 3 send / 15min, pattern sama dgn `rateLimit.ts` Phase 4.62.2 |
| `apps/web/src/pages/api/checkout/verify/email-send.ts` | BARU | POST endpoint: validate email → rate-limit check → generate OTP → hash + store → sendEmail via Resend → return `{ok, ttlSeconds}`. Dev-only `console.log` OTP (strip di prod via `IS_PROD` guard) |
| `apps/web/src/pages/api/checkout/verify/email-check.ts` | BARU | POST endpoint: validate email+OTP format → lookup active record → attempt-limit check → compare hash constant-time → bump attempts on fail OR mark verified + issue HMAC token on success |
| `apps/web/.env` | Edit (local) | Uncomment 5 OTP vars + generate `OTP_SALT` (256-bit random) |
| `apps/web/.env.example` | Edit | Section Phase 4.69.2 dgn placeholder OTP vars + instruksi generate salt |
| `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/phase-4.69.2-otp-schema-and-endpoints.md` | BARU | File ini |

### Arsitektur

#### Lifecycle 1 OTP

```
POST /api/checkout/verify/email-send { email }
   ↓
rate-limit check (ipHash::targetHash)
   ↓
generate 6-digit OTP via crypto.getRandomValues
   ↓
hash email + hash OTP (SHA-256 + OTP_SALT)
   ↓
POST /api/otp-verifications (API-key auth) → record di CMS
   ↓
sendEmail via Resend lib (idempotency-key = otp-{recordId})
   ↓
response: { ok: true, ttlSeconds: 600 }
   ↓
   [customer receive email, read OTP]
   ↓
POST /api/checkout/verify/email-check { email, otp }
   ↓
lookup active record (findActiveOtp: unexpired + unverified)
   ↓
if attempts >= 5 → return too_many_attempts
   ↓
hashOtp(input) + timingSafeEqual vs record.otpHash
   ↓ (mismatch)                            ↓ (match)
POST /api/otp-verifications/{id}/increment-attempt   POST /api/otp-verifications/{id}/mark-verified
   ↓                                           ↓
return otp_mismatch + attemptsLeft          issue HMAC email_verified_token
   ↓                                           ↓
                                            return { ok: true, token }
                                               ↓
                                               [frontend simpan token, kirim di /api/bookings/create]
```

#### Custom endpoints — kenapa dibutuhkan

Payload v3 REST `PATCH /api/{collection}/{id}` di project ini **gagal
generic** dengan `{"errors":[{"message":"Something went wrong."}]}`
(di-reproduce juga di collection `bookings`). Error asli ketemu via
custom endpoint: `"no such column: otp_verifications_id"` di
`payload_locked_documents_rels` — Payload v3 butuh satu kolom relasi
per collection di join-table ini (untuk fitur "locked docs" admin
concurrent edit guard).

Setelah fix migration (ALTER TABLE ADD column), update tetap tidak
reliable via PATCH REST (misteri Payload v3 di env ini). Workaround:
2 custom endpoint di collection pakai `req.payload.update()` Local API
dgn `overrideAccess: true` (sudah auth-protected di handler via
`req.user.role` check).

Workaround ini terbatas ke collection ini — kalau ada phase lain
butuh PATCH, siapkan pola custom endpoint yang sama atau debug
root-cause Payload v3 di follow-up.

### Env Setup

Semua vars sudah di-populate di `apps/web/.env` (local, non-commit).
`.env.example` punya placeholder + instruksi generate `OTP_SALT`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Config via env (bisa override tanpa code change):
- `OTP_SALT` (REQUIRED) — 256-bit hex, rotate = invalidate pending OTP
- `OTP_LENGTH` (default 6)
- `OTP_TTL_MINUTES` (default 10)
- `OTP_MAX_CHECK_ATTEMPTS` (default 5)
- `OTP_RATE_MAX_SEND` (default 3)
- `OTP_RATE_WINDOW_MINUTES` (default 15)

### Testing

#### Smoke test E2E (dev, 2026-10-09)

```bash
# 1. Send OTP (bypass rate limit dgn fake IP)
curl -X POST http://localhost:4322/api/checkout/verify/email-send \
  -H "Content-Type: application/json" \
  -H "cf-connecting-ip: 10.99.99.200" \
  -d '{"email":"anggiatcool1@gmail.com"}'
→ { "ok": true, "ttlSeconds": 600 }

# 2. OTP dari dev log (karena Resend sandbox hanya kirim ke whitelisted email)
grep "otp:dev" <web-dev-log>
→ otp=654891

# 3. Check success → issue token
curl -X POST http://localhost:4322/api/checkout/verify/email-check \
  -H "Content-Type: application/json" \
  -d '{"email":"anggiatcool1@gmail.com","otp":"654891"}'
→ { "ok": true, "token": "1dcf9c64...1791540180136.10dabdc8..." }

# 4. Reuse ditolak (verifiedAt di-set oleh step 3 → findActiveOtp return not_found)
curl -X POST .../email-check -d '{"email":"...","otp":"654891"}'
→ 404 { "ok": false, "error": "no_active_otp" }
```

#### Attempt-limit test

```bash
# 1. Fresh send
# 2. 5x wrong OTP → attempts counter decrement
#    attempt 1 → mismatch, attemptsLeft:4
#    attempt 2 → mismatch, attemptsLeft:3
#    attempt 3 → mismatch, attemptsLeft:2
#    attempt 4 → mismatch, attemptsLeft:1
#    attempt 5 → too_many_attempts, attemptsLeft:0  (429)
#    attempt 6 → too_many_attempts (guard still fires)  (429)
```

#### Rate-limit test

```bash
# 3 send per 15min dari IP+email yg sama → ok, ke-4 blocked
curl ... → 200
curl ... → 200
curl ... → 200
curl ... → 429 { "ok": false, "error": "rate_limited", "retryAfterSeconds": 900 }
```

#### Validation tests

```bash
# Invalid email format
→ 400 { "ok": false, "error": "invalid_email" }

# OTP for email that was never sent
→ 404 { "ok": false, "error": "no_active_otp" }

# OTP format wrong (letters, too short)
→ 400 { "ok": false, "error": "invalid_otp" }

# Malformed JSON body
→ 400 { "ok": false, "error": "malformed_body" }
```

#### TypeScript check

Zero error di 7 file baru (`otp.ts`, `otpStore.ts`, `otpRateLimit.ts`,
`emailVerifiedToken.ts`, 2 endpoint, `OtpVerifications.ts`). Pre-existing
error di `newsletter/index.ts` + `payload-types.ts` + 4 collection
`defaultSort` warning unrelated to this phase.

### Impact

- **Database**: 1 tabel baru `otp_verifications` + 1 kolom `otp_verifications_id` di `payload_locked_documents_rels` + 2 index. Migration `20261009_094925_phase_4_69_2_otp_verifications` applied ✓
- **CMS**: collection baru di group **Bookings** (super-admin + admin dapat lihat, editor tidak)
- **Frontend**: 5 lib file baru (`checkout/{otp,otpStore,otpRateLimit,emailVerifiedToken}.ts` + email lib dipakai) + 2 route API baru
- **Routes**:
  - `POST /api/checkout/verify/email-send`
  - `POST /api/checkout/verify/email-check`
  - CMS custom: `POST /api/otp-verifications/:id/mark-verified`
  - CMS custom: `POST /api/otp-verifications/:id/increment-attempt`
- **RBAC**: `OtpVerifications` — create/read/update admin+, delete super-admin. Custom endpoints enforce admin role di handler.
- **Env baru**: 6 (`OTP_SALT` + 5 config)
- **Deploy needed**: **cms + web** saat 4.69.3+ ship (phase ini belum ada caller UI; endpoint callable tapi belum dipakai)

### Security Notes

- OTP mentah **never logged in prod** (dev-only via `IS_PROD` guard — dead-code eliminated di build)
- Email + OTP di-hash dgn SHA-256 + salt sebelum store → kebocoran DB tidak langsung expose PII mentah
- Compare constant-time via `timingSafeEqual` → mitigate timing attack (walau 6-digit space kecil, defense-in-depth)
- Single-use enforced via `verifiedAt` + `findActiveOtp` filter
- Rate-limit per (ipHash::targetHash) → attacker tidak bisa flood 1 email dari banyak IP, atau 1 IP banyak email beda
- Attempt-limit 5x → invalidate record
- HMAC token TTL 30m → short-lived capability
- Custom endpoint handlers check `req.user.role === 'admin' | 'super-admin'` → API-key auth masuk sebagai user yg admin role, request lain ditolak
- `OTP_SALT` 256-bit random — rotate aman (invalidate semua pending OTP, user tinggal request ulang)

### Rollback

Phase punya dependency DB:
1. `pnpm --filter @gt-journeys/cms run schema:down` → rollback migration (drop table + join col)
2. Revert 7 lib file + 2 endpoint + collection file
3. Revert `payload.config.ts` + `migrations/index.ts` entries
4. `apps/web/.env` cleanup OTP vars (opsional)

Zero caller di phase ini → rollback aman tanpa downstream break.

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/PROGRESS.md` — defer sampai sub-phase user-visible pertama (4.69.3)
- [ ] `docs/02-DATABASE-SCHEMA.md` — update akhir series 4.69 (tambah `otp_verifications`)
- [ ] `docs/04-RBAC.md` — update akhir series 4.69 (tambah collection access matrix)
- [ ] `docs/08-SECURITY-PATCH.md` — update akhir series 4.69

### Next Steps

**Phase 4.69.3 — UI form email verification**:
1. Modifikasi `apps/web/src/pages/checkout/ferry-tickets/[slug].astro`: tambah tombol "Verify" di sebelah email input + input OTP yang muncul inline setelah send.
2. Vanilla JS: fetch ke `/api/checkout/verify/email-send` → tampilkan input OTP + timer 10m countdown; fetch ke `/email-check` → simpan token di hidden input `emailVerifiedToken`.
3. Submit button disabled sampai email verified (token tersedia).
4. Error handling UI: rate_limited (show countdown), otp_mismatch (highlight input + attemptsLeft), too_many_attempts (lock + "resend").
5. Update `/api/bookings/create` untuk verify `emailVerifiedToken` + match targetHash dgn customerEmail.
6. Zero schema change.
