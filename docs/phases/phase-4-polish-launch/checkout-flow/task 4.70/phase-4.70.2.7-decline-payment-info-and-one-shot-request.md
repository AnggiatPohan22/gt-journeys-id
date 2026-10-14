## Phase: 4.70.2.7 — Decline Payment Info + One-Shot Change Request

**Tanggal**: 2026-10-14
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Follow-up dari**: [phase-4.70.2.6](phase-4.70.2.6-reschedule-confirm-decline.md)

### Konteks

Test Phase 4.70.2.6 menghasilkan dua feedback:

1. **Email decline tidak kasih info pembayaran.** Padahal customer belum
   bayar (reschedule hanya pre-payment) — walau reschedule ditolak,
   booking tetap berlaku dan customer tetap perlu bayar. Jadi info bank
   transfer harus tetap muncul.
2. **Spam gate di confirmation page.** Setelah admin confirm/decline
   dan status kembali ke pre-request, customer masih bisa buka
   confirmation page dan submit request lagi — potensi spam. Perlu
   limit 1x request seumur hidup booking.

### Perubahan

#### 1. Decline template — tambah payment block

File: [apps/cms/src/globals/bookingTemplatesDefaults.ts](../../../../apps/cms/src/globals/bookingTemplatesDefaults.ts)

`DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML` tambah:
- Reminder box hijau: "Booking Anda tetap berlaku. Silakan lanjut
  selesaikan pembayaran di bawah ini..."
- Total due banner (dark primary bg, `{{currency}} {{totalEstimate}}`)
- Bank Transfer section pakai `{{bankAccountsBlock}}` (SSOT dgn template
  payment/reschedule-confirm)
- CTA WhatsApp "💬 Kirim Bukti via WhatsApp"

Flow sekarang: customer dapat info decline + alasan + reminder jadwal
lama + instruksi bayar. Satu email, info lengkap.

#### 2. One-shot customer change request

**Schema**:
File: `apps/cms/src/migrations/20261014_120000_phase_4_70_2_7_one_shot_request.ts`
```sql
ALTER TABLE bookings ADD has_requested_change integer DEFAULT 0;
```

**Collection schema**:
File: [apps/cms/src/collections/Bookings.ts](../../../../apps/cms/src/collections/Bookings.ts)
+1 hidden checkbox `hasRequestedChange` (default: false). Admin boleh
un-check manual via CMS kalau exceptional case.

**customer-request endpoint**:
- Tolak kalau `booking.hasRequestedChange === true` dgn error
  `already_requested` + message friendly ("Silakan kontak admin via WA").
- Pada success, set `hasRequestedChange: true` sekaligus dengan status
  change + reason + snapshot.

**Cleanup saat admin confirm/decline reschedule**:
Cleanup object (`customerRequestKind`, `customerRequestReason`,
`customerRequestedAt`, `originalDepartureDate`, `originalScheduleTimeLabel`,
`preRequestStatus`) → **tetap tidak** termasuk `hasRequestedChange`.
Field persistent seumur hidup booking.

**Frontend confirmation page**:
File: [apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](../../../../apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro)
- `hasRequestedChange = Boolean((booking as any).hasRequestedChange)`
- `canReschedule = !hasRequestedChange && ACTIVE_FOR_RESCHEDULE.has(status)`
- `canCancel = !hasRequestedChange && ACTIVE_FOR_CANCEL.has(status)`
- Fallback copy saat tombol hilang:
  > A change request has already been submitted and processed for this
  > booking. For further assistance, please contact admin via WhatsApp.

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/migrations/20261014_120000_phase_4_70_2_7_one_shot_request.ts` | **BARU** — 1 ADD COLUMN. |
| `apps/cms/src/migrations/index.ts` | Register. |
| `apps/cms/src/collections/Bookings.ts` | +1 hidden field, reject logic di customer-request endpoint, set field di update. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Decline template: tambah reminder + payment block + CTA WA. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Gate tombol pakai `hasRequestedChange`, fallback copy. |

### Testing

```
1. Run migration:
   pnpm --filter cms payload migrate
2. Restart CMS + web dev.

3. Test DECLINE flow lengkap:
   - Buat booking test baru (awaiting_payment).
   - Request Reschedule → isi alasan.
   - CMS → ❌ Decline Reschedule → isi alasan min 10 char → Preview → Send.
   - Expected email:
     - Hero merah "Mohon Maaf"
     - Alasan admin di box merah
     - Reminder hijau "Booking tetap berlaku + lanjut pembayaran"
     - Total due banner dark
     - Bank Transfer block (dari {{bankAccountsBlock}})
     - CTA "Kirim Bukti via WhatsApp"
   - Status booking kembali ke awaiting_payment.

4. Test one-shot gate:
   - Buka confirmation page booking yang baru di-decline di atas.
   - Expected: tombol "Request Reschedule" + "Request Cancellation"
     HILANG.
   - Expected copy: "A change request has already been submitted and
     processed for this booking. For further assistance, please contact
     admin via WhatsApp."

5. Test defensive server-side:
   - POST /api/bookings/request-change (via curl / Postman) ke booking
     yang hasRequestedChange=true → 409 already_requested.

6. Test admin override (edge case):
   - CMS → open booking → un-check `hasRequestedChange` field (super-admin
     only ← actually just hidden; buka dgn un-hide).
   - Reload confirmation page → tombol muncul lagi.

7. Test CONFIRM flow (regress):
   - Buat booking baru, request reschedule, admin confirm → status
     restore + hasRequestedChange tetap true.
   - Buka confirmation page → tombol tidak muncul lagi.
```

### Impact

- **Database**: +1 kolom nullable (default 0) di `bookings`. 1 migration.
- **CMS**: 1 field schema, logic di customer-request endpoint, template HTML update.
- **Frontend web**: 2 condition update di confirmation page.
- **Env**: zero.
- **Deploy needed**: **cms + web**.
- **Breaking**: tidak — booking existing dgn `hasRequestedChange=0`
  (default) tetap bisa request change pertama kalinya.

### Known Limitations

- Admin un-check `hasRequestedChange` butuh un-hide field dulu (karena
  `admin.hidden: true`). Future bisa tambah button "Reset Request Flag"
  di BookingAdminActions supaya tidak perlu DB fiddling.
- One-shot = seumur hidup booking. Kalau admin confirm reschedule tapi
  nanti customer mau cancel juga → tidak bisa dari frontend; harus
  contact admin. Trade-off accepted — pattern umum di industri (reschedule
  = reissue tiket, cancel-after = refund, dua-dua perlu admin touch).
- Decline email bank block reuse `{{bankAccountsBlock}}` — kalau admin
  belum konfigurasi bank di global, template error dengan message
  "Variable {{bankAccountsBlock}} kosong". Admin seharusnya SUDAH punya
  bank accounts karena payment flow juga butuh.
- `hasRequestedChange` type `checkbox` di SQLite di-serialize ke INTEGER
  0/1. Frontend `Boolean((booking as any).hasRequestedChange)` handle
  dua-dua karena `Boolean(1) === true`, `Boolean(0) === false`.
