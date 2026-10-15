## Phase: 4.69.3 — Form UI Email Verification (OTP Wall)

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (dev — sandbox mode)
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Wire UI verifikasi email ke checkout form Ferry Ticket. Tombol **Verify**
muncul di sebelah input email. Klik → fetch `/api/checkout/verify/email-send`
(Phase 4.69.2) → OTP panel inline muncul dengan countdown 10:00. Customer
masukkan 6 digit → fetch `/email-check` → `email_verified_token` tersimpan
di hidden input. Submit button client-side dan server-side **menolak**
booking tanpa token tervalidasi.

Email change setelah verified → UI reset ke idle + token di-clear
(invalidate). Server-side defense-in-depth: `targetHash` dari token
di-compare dengan hash email yang sebenarnya di-submit → mismatch
→ `email_mismatch` 302 redirect.

### Keputusan Owner (approved sebelumnya)

- **D1** YES — email-OTP wajib sebelum booking tersubmit
- UX pattern: **inline verify-per-field** (Traveloka-style) — rekomendasi §3.3 phase 4.69 analisa

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Edit | (1) Email field diperluas: tombol Verify di samping, panel OTP inline (countdown 10m, resend button, attempts hint, error line), badge "Verified", hidden input `emailVerifiedToken`. (2) 3 entry baru di `errorMessages` map: `email_not_verified`, `email_verification_expired`, `email_mismatch`. (3) ~190 LOC JS state machine: idle→sending→otp-input→verifying→verified; countdown timer; email-change auto-reset; error handling (rate_limited, otp_mismatch, too_many_attempts, no_active_otp). (4) Submit handler: tambah guard — kalau `emailVerifiedToken` kosong, block submit + append ke validation alert list. |
| `apps/web/src/pages/api/bookings/create.ts` | Edit | Import `verifyEmailVerifiedToken` + `hashWithSalt`. Setelah validate contact fields: verify token, cek expired/malformed, compare `targetHash` dgn hash email yang di-submit. 3 error code baru routed via `errorRedirect`. |
| `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/phase-4.69.3-form-ui-email-verification.md` | BARU | File ini |

### Arsitektur — UI State Machine

```
┌─────────┐  click Verify  ┌─────────┐
│  idle   │ ─────────────→ │ sending │
│         │                └────┬────┘
└─────────┘                     │ response
     ▲                          ▼
     │                   ┌────────────┐
     │                   │ otp-input  │  countdown 10:00
     │                   └──────┬─────┘
     │                          │ submit OTP
     │                          ▼
     │                   ┌───────────┐
     │                   │ verifying │
     │                   └─────┬─────┘
     │                         │ response
     │  email changed          ▼
     └────────────────── ┌──────────┐
                         │ verified │  badge + token ready
                         └──────────┘
```

Trigger reset-to-idle: user ketik di input email → kalau nilai berbeda
dari `verifiedEmail` → clear token, hide badge, enable Verify button,
readonly=false.

### Error Handling di UI

| Server error | UI shown (Bahasa) | Action |
|---|---|---|
| `rate_limited` | "Terlalu banyak permintaan. Coba lagi dalam X menit." | Verify button tetap enabled; biarkan user retry setelah TTL |
| `invalid_email` | "Format email tidak valid." | Focus email input |
| `send_failed` | "Gagal mengirim email verifikasi. Coba lagi atau gunakan email lain." | Verify button tetap enabled |
| `otp_mismatch` | "Kode salah. Sisa percobaan: N." | Clear OTP input, update attempts hint, re-enable Check |
| `too_many_attempts` | "Terlalu banyak percobaan salah. Klik 'Kirim ulang kode'." | Disable Check button, user harus klik Resend |
| `no_active_otp` | "Kode tidak ditemukan atau sudah kadaluarsa. Klik 'Kirim ulang kode'." | Disable Check button |
| Countdown expired (0:00) | "Kode OTP kadaluarsa. Klik 'Kirim ulang kode'." | Disable Check button |

### Submit Flow Server-Side (`/api/bookings/create`)

Order verifikasi:
1. Honeypot (silent redirect)
2. Rate-limit (phase 4.62.2/4.66.9)
3. formStamp HMAC + TTL (phase 4.62)
4. Validate contact fields + email format
5. **NEW** — `emailVerifiedToken` present → verify HMAC + TTL → compare `targetHash` dgn `SHA-256(customerEmail || salt)`
6. Validate departure date + passengers + ferry (phase 4.63, 4.66.4, 4.67.2e)
7. Create booking record

Mismatch between token's `targetHash` dan hash email yang di-submit
= **defense-in-depth**: UI sudah reset state on email change, tapi
attacker bisa manipulasi hidden input. Server-side compare mencegah
reuse token untuk email lain.

### Testing

#### UI Smoke Test (browser pane, 2026-10-09)

1. **Verify button renders** di sebelah email input ✓
2. **Click Verify** → fetch POST ke `/api/checkout/verify/email-send` ✓
3. **Response ok** → OTP panel muncul, countdown mulai dari 10:00 ✓
4. **Response rate_limited** → error "Terlalu banyak permintaan. Coba lagi dalam 15 menit." ditampilkan di `[data-email-error]` ✓
5. **Response send_failed** (Resend sandbox daily limit saat retry banyak) → error UI benar ✓
6. **Masukkan OTP salah → attemptsLeft decrement** di UI ✓
7. **Masukkan OTP benar** → token tersimpan di hidden input, badge "Verified" tampil, Verify button → "Verified" + disabled, email readOnly=true, OTP panel hidden ✓
8. **Edit email setelah verified** → token cleared, badge hidden, Verify button → "Verify" + enabled, email readOnly=false ✓

#### Server Guard Test

```bash
# POST tanpa stamp dan tanpa token → stamp_malformed (urutan pertama yang fail)
curl -X POST /api/bookings/create -d "...fields..."
→ 302 → ?err=stamp_malformed

# Dengan valid stamp tapi tanpa token (via browser form) → UI block di submit handler
→ validation alert list termasuk "Email verification (klik tombol Verify...)"

# Bypass UI → server reject
# Dengan valid stamp + valid fields tapi emailVerifiedToken kosong
→ 302 → ?err=email_not_verified
```

#### TypeScript check

Zero error di file yang diubah. 2 pre-existing error unrelated.

### Impact

- **Database**: none (sudah ada dari 4.69.2)
- **CMS**: none
- **Frontend**:
  - Checkout form Ferry Ticket panjang +40 lines markup (email section)
  - Script bundle +~5KB (JS state machine)
- **Routes**: tidak ada route baru
- **RBAC**: tidak ada
- **Deploy needed**: **web** saja

### Rollback

Revert 2 file edit (`[slug].astro` + `bookings/create.ts`). Phase 4.69.1
+ 4.69.2 tetap intact — API endpoints masih berdiri, cuma tidak dipakai
dari UI.

Alternatif soft-rollback: hide tombol Verify via feature flag di
Astro frontmatter kalau mau test fallback behavior tanpa revert code
(tidak di-ship, future consideration).

### Security Notes

- Server guard di `/api/bookings/create` wajib ada **meskipun** UI
  sudah block — klien bisa dimanipulasi, server adalah SSOT
- `targetHash` compare mencegah "token reuse for different email"
  attack (user verify `foo@a.com`, lalu edit input ke `bar@b.com`
  dengan DevTools, submit → server reject)
- Token TTL 30m sudah cukup singkat — kalau user tutup browser setelah
  verify tapi belum submit, dalam 30m masih bisa resume
- OTP mentah tidak pernah tampil di URL / request body response —
  hanya di-submit sekali ke `/email-check`
- Error message ke user **informatif tapi tidak membocorkan** apa yang
  wrong (misal "no_active_otp" vs "wrong_target_hash" — kedua kondisi
  di-generalize jadi "no active OTP")

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/PROGRESS.md` — update akhir series 4.69
- [ ] `docs/08-SECURITY-PATCH.md` — update akhir series 4.69

### Next Steps

**Phase 4.69.4 — Passenger inline validation (R3)**:
1. Client+server rule set untuk passport number format per nationality
2. DOB sanity (adult 12+, child 2-11, infant 0-1 vs passenger type stepper)
3. Issue date <= today AND >= DOB
4. Issue vs Expiry: expiry > issue (sudah ada expiry >= departure + 6m dari Phase 4.63)
5. Duplicate passport reject (same passport number di > 1 passenger)
6. UI red-hint reuse pattern Phase 4.67.3 polish-2
7. Zero schema change — pure validation layer
