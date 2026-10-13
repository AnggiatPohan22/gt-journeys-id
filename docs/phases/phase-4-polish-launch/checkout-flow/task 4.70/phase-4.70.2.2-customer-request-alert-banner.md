## Phase: 4.70.2.2 — Customer Request Alert Banner + Hide Collapsible

**Tanggal**: 2026-10-13
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Konteks

Phase 4.69.9 taruh info customer request di collapsible "Customer Request"
(initCollapsed: true) di tengah form Booking edit. Problem: admin sering
lewatkan karena harus scroll + buka collapse. Request yang perlu attention
(reschedule/cancel) tidak visible saat edit view pertama kali load.

### Perubahan

#### 1. `BookingRequestAlert.tsx` — banner prominent di top edit view

Render sebagai UI field pertama. Hanya tampil saat status =
`reschedule_request` atau `cancel_request`. Design:
- Border tebal berwarna (merah untuk cancel, amber untuk reschedule)
- Pulse animation sekali saat load (grab attention)
- Icon besar (❌ atau 🔁)
- Badge "PENDING CUSTOMER REQUEST"
- Title: "Reschedule Request" / "Cancellation Request"
- Meta kanan atas: timestamp lengkap + relative time ("2 jam yang lalu")
- Reason block: alasan customer di-highlight dengan quote style
- Action hint: pointer ke "Send Reschedule/Cancel Response di Admin Actions"

#### 2. Hide collapsible "Customer Request" lama

Field `customerRequestKind`, `customerRequestedAt`, `customerRequestReason`
sekarang `admin.hidden: true`. Data tetap persisted di DB (dibaca oleh
banner via `useAllFormFields`). Super-admin bisa un-hide sementara kalau
perlu edit manual (edge case).

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/admin/BookingRequestAlert.tsx` | BARU — Client component banner dengan conditional render + animation + formatted meta. |
| `apps/cms/src/collections/Bookings.ts` | +`requestAlert` UI field di posisi pertama. Hide 3 raw field customer request (dari collapsible yang direplace). |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Regenerate — register BookingRequestAlert path. |

### UX

**Sebelum:**
- Admin buka booking → form panjang → scroll untuk cari collapsible → klik buka → baca 3 readonly fields.
- Mudah lewatkan.

**Sesudah:**
- Admin buka booking → banner besar langsung mencolok di atas → semua info sekali lihat → action hint ke tombol handoff.
- Pulse animation sekali load untuk draw attention.

### Testing

```
1. Restart CMS dev.
2. Buat booking test → customer request reschedule dgn alasan "Pindah tanggal karena kerjaan"
3. Login CMS → chip "🔁 Reschedule" → open booking.
4. Expected: banner amber besar di atas dengan:
   - 🔁 icon
   - "Reschedule Request" title
   - Timestamp + relative "X menit yang lalu"
   - Reason block: "Pindah tanggal karena kerjaan"
   - Action hint: "Review alasan customer lalu klik Send Reschedule Response..."
5. Scroll ke bawah: collapsible "Customer Request" lama TIDAK ADA.
6. Repeat dengan cancel request → banner merah.
7. Open booking status normal (awaiting_review) → banner TIDAK ADA.
```

### Impact

- **Database**: zero change (fields tetap, cuma UI hidden).
- **CMS**: 1 component baru, 1 UI field, 3 field raw di-hide.
- **Deploy needed**: **cms only**.

### Known Limitations

- Banner read dari `useAllFormFields` → beroperasi di client. Kalau user
  edit field manually (super-admin un-hide + edit) tanpa save, banner
  reflect unsaved state. Minor UX quirk, acceptable.
- Animation pulse hanya sekali (iteration count 1). Future bisa jadi
  loop sampai admin interact — tapi bisa jadi annoying.
- Field hidden tetap di DB → ketiga field tidak bisa di-null-kan via UI
  (hanya via DB atau super-admin un-hide).
