## Phase: 4.70.2.1 — Payment "Change Plan" Link + Confirmation Locked

**Tanggal**: 2026-10-13
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Konteks

Audit manual customer flow menemukan 2 UX gap:

1. **Payment email tidak kasih tahu customer bisa reschedule/cancel.**
   Walaupun tombolnya ada di confirmation page, customer yang sudah
   close page cuma punya email payment → tidak tahu cara akses kembali.
2. **Confirmation email masih link ke confirmation page** padahal
   setelah paid + e-ticket terkirim, cancel/reschedule tidak boleh.
   Link cuma noise.

### Perubahan

#### 1. Payment email — tambah block "Berubah pikiran?"

Sebelum Security Notice, muncul card dashed border:
> 🔁 **Berubah pikiran?**
> Kamu bisa reschedule atau cancel booking ini **sebelum pembayaran**.
> [Kelola booking →]  (button linking to {{confirmationUrl}})
> Simpan link ini — kamu bisa akses booking kapan saja selama belum di-cancel/expired.

Memakai `{{confirmationUrl}}` yang sudah di-populate oleh endpoint
`send-payment` (Phase 4.69.7).

#### 2. Confirmation email — hapus link page

Section "Confirmation URL (bookmark this)" dihapus. Ganti dengan hint
singkat:
> Tunjukkan reference ini saat check-in di terminal — baik via email ini
> atau screenshot.

Reference `{{bookingRef}}` tetap di-highlight sebagai primary identifier.

#### 3. Confirmation page — hide cancel/reschedule setelah `confirmed`

- Front: `ACTIVE` set tidak lagi include `'confirmed'`
- Server (`customer-request` endpoint): `activeStatuses` tidak include `'confirmed'`

Setelah payment paid + e-ticket terkirim, customer tidak bisa trigger
request change. Admin masih bisa update manual via CMS untuk kasus
exceptional (refund/dispute).

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Payment template: tambah "Berubah pikiran?" block dgn CTA ke confirmationUrl. Ticket template: hapus confirmation URL block, ganti dgn hint reference. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | `ACTIVE` set hapus `'confirmed'`. |
| `apps/cms/src/collections/Bookings.ts` | `customer-request` endpoint `activeStatuses` hapus `'confirmed'` (defense-in-depth, parity dgn UI). |

### Testing

```
1. Restart dev. Buat booking test (status awaiting_review).
2. Admin → Send Payment Instructions → cek inbox.
3. Verify: block "Berubah pikiran?" tampil dgn tombol "Kelola booking →".
4. Click tombol → opens confirmation page → tombol reschedule/cancel ada.
5. Admin: mark booking as confirmed → Send Ticket.
6. Verify ticket email: NO confirmation URL block, cuma hint "Tunjukkan reference ini...".
7. Reload confirmation page: tombol "Request Reschedule"/"Request Cancellation" HILANG.
8. API test: POST /api/bookings/request-change ke confirmed booking → 409 status_locked.
```

### Impact

- **Database**: zero.
- **CMS**: template HTML default refactor (code SSOT).
- **Frontend web**: 1 Set change di confirmation page.
- **Env**: zero.
- **Deploy needed**: **cms + web**.

### Notes

- Payment template "Berubah pikiran?" block hanya tampil kalau
  `confirmationUrl` ter-populate. Kalau booking tanpa accessToken
  (edge case), link rendering `/checkout/.../confirmation/<ref>?t=`
  dengan token kosong — frontend akan reject.
- Confirmation page UI tetap render section "Need to change your booking?"
  dengan message "This booking is confirmed — change requests are no
  longer available." (existing code path untuk status di luar ACTIVE).
