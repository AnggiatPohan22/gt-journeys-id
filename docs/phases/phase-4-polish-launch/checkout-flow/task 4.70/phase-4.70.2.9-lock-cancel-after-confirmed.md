## Phase: 4.70.2.9 — Lock Cancel Request After E-Ticket Issued

**Tanggal**: 2026-10-14
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Follow-up dari**: [phase-4.70.2.8](phase-4.70.2.8-cancel-confirm-decline.md)

### Konteks

User menemukan tombol "Request Cancellation" masih muncul di confirmation
page saat status booking `confirmed` (e-ticket sudah terkirim). Ini
tersisa dari Phase 4.70.2.1 — waktu itu kami pisah policy: reschedule
pre-payment only, cancel pre+post-payment (dgn asumsi refund flow).

User sekarang minta cancel juga locked setelah `confirmed`:
> "jika e-ticket atau ticket sudah confirm dan di kirimkan maka
> pembatalan tidak dapat di lakukan"

### Keputusan Desain

Semua customer-triggered change request (reschedule DAN cancel) =
**pre-payment only**. Setelah `confirmed`:
- Customer kontak admin manual via WhatsApp.
- Admin handle refund/void tiket operator di luar sistem (atau via CMS
  admin override).

Alasan:
- Prevent abuse (customer booking → bayar → terima tiket → cancel
  untuk refund → ulang terus-menerus).
- Simplify flow: 1 policy untuk semua customer-triggered change.
- Admin masih bisa manual cancel booking confirmed via CMS kalau benar-
  benar perlu (super-admin edit status).

### Perubahan

#### 1. Server-side gate

File: [apps/cms/src/collections/Bookings.ts](../../../../apps/cms/src/collections/Bookings.ts)

Endpoint `customer-request`:
- Hapus `activeForCancel` (yang include `confirmed`).
- Satu `activeStatuses` untuk kedua kind:
  `['awaiting_review', 'awaiting_payment', 'payment_review', 'pending']`.
- Error message untuk status `confirmed` di-generalize: menyebut kind
  (reschedule/pembatalan) sesuai request.

#### 2. Frontend gate

File: [apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](../../../../apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro)

- `ACTIVE_FOR_RESCHEDULE` + `ACTIVE_FOR_CANCEL` → merge jadi satu `ACTIVE` Set
  (keduanya pakai set yang sama = pre-payment statuses).
- `canReschedule = canCancel = !hasRequestedChange && ACTIVE.has(status)`.
- Intro copy untuk `isConfirmed`:
  > Your ticket is already issued. Reschedule or cancellation is no
  > longer available online — please contact admin directly via WhatsApp
  > for exceptional cases.
- Hint note yang muncul di bawah tombol (saat `isConfirmed`): update
  wording jadi "After the ticket has been issued, both reschedule and
  cancellation require admin assistance".

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Bookings.ts` | `customer-request` endpoint: unify activeStatuses untuk reschedule+cancel. Error message generalize. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Merge ACTIVE sets jadi satu, update intro + hint copy. |

### Testing

```
1. Restart web dev (CMS auto-reload juga OK karena hot reload).
2. Buat booking test → selesaikan payment flow → admin send e-ticket →
   status: confirmed.
3. Buka confirmation page booking tsb.
4. Expected:
   - Section "Need to change your booking?" tetap render.
   - Tombol "Request Reschedule" HILANG. ✓ (sudah dari 4.70.2.1)
   - Tombol "Request Cancellation" HILANG. ✓ (BARU di phase ini)
   - Intro copy: "Your ticket is already issued. Reschedule or
     cancellation is no longer available online — please contact admin
     directly via WhatsApp for exceptional cases."
   - Hint note di bawah: "After the ticket has been issued, both
     reschedule and cancellation require admin assistance...".
5. Defense test (server-side):
   POST /api/bookings/request-change { action: 'cancel', ... }
   ke booking status `confirmed` → 409 status_locked dengan message
   "Pembatalan tidak tersedia setelah e-ticket terkirim. Silakan kontak
    admin via WhatsApp untuk request khusus."
6. Regress:
   - Pre-payment booking → tombol reschedule + cancel tetap muncul normal.
   - Setelah pernah request (hasRequestedChange=true) → tombol hilang
     (Phase 4.70.2.7 gate masih aktif).
```

### Impact

- **Database**: zero.
- **CMS**: 1 endpoint logic change.
- **Frontend web**: 1 Astro file (Set + copy change).
- **Env**: zero.
- **Deploy needed**: **cms + web**.
- **Breaking**: minor UX — booking yang sudah `confirmed` tidak bisa
  cancel dari frontend. Harus kontak admin. Konsisten dgn reschedule
  (yang sudah locked sejak 4.70.2.1).

### State matrix (final, updated)

| Status | Request Reschedule | Request Cancellation |
|---|---|---|
| `awaiting_review` / `awaiting_payment` / `payment_review` / `pending` | ✅ | ✅ |
| `confirmed` | ❌ (contact admin) | ❌ (contact admin) |
| `reschedule_request` / `cancel_request` | ❌ (pending) | ❌ (pending) |
| `cancelled` / `expired` | ❌ | ❌ |
| `hasRequestedChange: true` (lifetime one-shot) | ❌ | ❌ |

### Known Limitations

- Admin tetap bisa cancel booking confirmed via CMS super-admin
  (edit status langsung di DB atau un-hide `hasRequestedChange`
  + reset status). Pattern ini untuk exceptional/manual handling.
- Tidak ada hint UI untuk guide customer ke WhatsApp beyond copy text —
  future bisa tambah CTA button "Contact Admin" di confirmation page
  khusus untuk status `confirmed`.
