## Phase: 4.59.2 — Checkout form data loss on passport expiry + refresh guard

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Fixed
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Bug Report (dari user)

> "Disaat saya mencoba booking dan ternyata mendapatkan notice
> 'at least one passenger's passport expired within 6 months after
> departure', itu data yang saya isi hilang. Sehingga kalau di isi ulang,
> saya harus mengisi atau mengirim OTP kembali ke email saya. Mau ini
> diperbaiki agar hanya berupa alert tanpa membuat data yang sudah di isi
> hilang atau ter-refresh. Dan tambahkan alert disaat mau me-refresh
> halaman ini seperti 'apakah anda ingin keluar dari halaman ini?' karena
> jika di refresh maka dia akan kembali ke halaman sebelumnya sehingga
> halaman checkout ini menjadi halaman yang tidak bisa di refresh demi
> menjaga OTP tadi."

### Root Cause

**Rule "passport expiry ≥ departure + 6 bulan"** cuma di-enforce di
server-side (`apps/web/src/pages/api/bookings/create.ts:237` via
`passportExpiryOk()`). Client-side `paxValidate()` sudah cover:
- Passport format
- DOB vs type (adult/child age range)
- Issue date vs today/DOB
- Expiry > Issue

Tapi **tidak** 6-month-after-departure rule → form submit → server
reject → `errorRedirect('invalid_passport_expiry')` → page re-render
dengan form kosong (Astro SSR tanpa state preservation).

Dampak:
- Semua data penumpang (yang bisa panjang untuk 2-4 pax) hilang.
- OTP verification token di memory state hilang → user harus kirim OTP
  ulang → berisiko kena rate-limit (3 send/15 menit per IP+email).

### Fix

#### 1. Client-side 6-month-after-departure check

Tambah rule #5 di `paxValidate(idx)`:

```typescript
// 5. Expiry MUST be >= departureDate + 6 months.
if (expiry?.value) {
  const dep = getDeparture()
  if (dep) {
    const minExpiry = new Date(dep)
    minExpiry.setMonth(minExpiry.getMonth() + 6)
    const eT = new Date(expiry.value).getTime()
    if (!isNaN(eT) && eT < minExpiry.getTime()) {
      msgs.push(`Masa berlaku passport harus minimal 6 bulan setelah tanggal keberangkatan (minimal ${label}).`)
      expiry.classList.add('ring-2', 'ring-coral')
    }
  }
}
```

Trigger on blur/change → inline alert di `<ul data-pax-errors>` + ring
highlight. Submit juga re-validate agregat → block kalau ada error.
**Form data tetap utuh**, hanya alert yang muncul.

Server-side guard tetap ada (defense-in-depth) — kalau client bypass
somehow (JS disabled, old browser), server masih reject.

#### 2. `beforeunload` refresh guard

Tambah listener di script DOMContentLoaded:

```typescript
let formDirty = false
checkoutFormEl.addEventListener('input', () => { formDirty = true }, { capture: true })
checkoutFormEl.addEventListener('change', () => { formDirty = true }, { capture: true })

window.addEventListener('beforeunload', (e) => {
  if ((window as any).__checkoutSubmitting) return
  if (!formDirty) return
  e.preventDefault()
  e.returnValue = ''
})
```

- **Trigger**: hanya kalau user sudah interact (input/change event) + bukan
  dalam proses submit.
- **Clear**: submit handler set `__checkoutSubmitting = true` sebelum
  native submit → prompt tidak muncul saat redirect ke confirmation page.
- **Browser behavior**: Modern browser (Chrome/Firefox/Safari) tampilkan
  native prompt "Changes you made may not be saved" — tidak bisa custom
  message sejak 2016 untuk security.

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Edit | 2 patch: rule #5 di `paxValidate()` (+16 lines), `beforeunload` + dirty tracking (+22 lines di akhir script). |
| `docs/phases/phase-4-polish-launch/cms-infra/cms-bug/phase-4.59.2/phase-4.59.2-checkout-passport-expiry-data-loss.md` | BARU | File ini. |

### Testing

#### Manual
```
1. Open /checkout/ferry-tickets/<slug>?date=<depDate>&adults=1 (dev).
2. Verify email (OTP flow sampai verified).
3. Isi 1 passenger lengkap, tapi passport expiry = departureDate + 3 bulan.
4. Expected (BARU): tombol submit tidak respond, inline error di passenger
   section: "Masa berlaku passport harus minimal 6 bulan setelah tanggal
   keberangkatan (minimal DD MMM YYYY)." Form data + OTP token UTUH.
5. Fix expiry → departureDate + 7 bulan → inline error hilang → submit OK.

Refresh guard:
6. Isi email + klik Verify → setelah OTP masuk + verified, isi beberapa field.
7. Tekan Ctrl+R / F5 → browser prompt native tampil "Leave site? Changes
   you made may not be saved." Pilih Cancel → tetap di halaman.
8. Setelah submit sukses (semua valid) → redirect ke confirmation → tidak
   ada prompt (karena `__checkoutSubmitting = true`).
```

#### Build check
- TypeScript: zero new error (Astro inline `<script>` tidak di-type-check
  oleh default, tapi IDE tetap bersih).

### Impact

- **Database**: zero.
- **Server**: zero (server-side guard dibiarkan sebagai defense-in-depth).
- **Deploy needed**: **web only**.
- **UX**: cegah data loss + spam OTP → direct improvement untuk conversion
  rate booking.

### Related

- Phase 4.69.3 — Email OTP wall (introduce OTP token state yang kini
  dilindungi).
- Phase 4.69.4 — Passenger inline validation (framework di mana rule #5
  ditambahkan).
- Phase 4.69.5+ — Admin handoff flow (benefit dari form yang stable).

### Known Limitations

- `beforeunload` tidak block **programmatic** navigation dari dalam JS
  (misal `window.location.href = ...`). Tidak masalah untuk use case ini
  karena form submission adalah satu-satunya navigation yang kita trigger
  manual.
- Browser **iOS Safari** kadang skip beforeunload prompt kalau back-swipe
  gesture dari sisi layar. Mitigasi: tidak ada — platform limitation.
- Browser **belum support custom message** sejak 2016 (Chrome 51+). Message
  dari user "apakah anda ingin keluar dari halaman ini?" tidak bisa literal
  dipakai — browser pakai string sendiri. Semantik "warn before leave" tetap
  tercapai.
