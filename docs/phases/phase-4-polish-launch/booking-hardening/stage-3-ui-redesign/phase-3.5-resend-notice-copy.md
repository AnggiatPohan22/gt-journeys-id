## Phase: 3.5 — Enhanced resend-receipt notice with immutability callout

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — VERIFIED (setelah patch 3.5.1 expose UI entry)
**Commit**: `3dd206a`
**Finding**: audit gap (resend expectation)

### Ringkasan
Modal "Confirm Payment & Send Receipt" pada booking yang sudah `confirmed` sebelumnya hanya tampilkan 1-liner "Resend mode". Step 3.5 enhance jadi bullet list eksplisit 3 point dengan live interpolate values.

### Perubahan (`apps/cms/src/admin/BookingAdminActions.tsx`)
- Read 3 field baru dari form state: `customerEmail`, `receiptNumber`, `receiptIssuedAt`.
- Timezone-aware formatter untuk `receiptIssuedAt` pakai Asia/Makassar (match template convention).
- Enhance `.bk-modal__warning--resend` block (ticket kind + status confirmed):
  - **Bullet 1**: Kirim email receipt kedua ke customer `{customerEmail}`.
  - **Bullet 2**: Pakai `receiptNumber` yang SAMA (`{receiptNumber}`) dan tanggal issue yang SAMA (`{receiptIssuedAt}` Asia/Makassar). Tidak ada receipt baru dibuat.
  - **Bullet 3**: Append entry ke `paymentAuditLog` kalau Payment Bank / Payment Date diubah.
- Rename submit button saat `ticket + confirmed`: "Confirm & Send Receipt (Resend)" (bukan plain "Confirm & Send").

### Dependency
**Patch 3.5.1 (`92406af`) wajib** untuk UI entry point — tanpa itu, `statusToKinds('confirmed')` return `[]` dan modal tidak pernah buka. Lihat [phase-3.5.1-expose-resend-ui-entry.md](phase-3.5.1-expose-resend-ui-entry.md).

### Testing (verified via browser automation, after 3.5.1)
- [x] Booking confirmed, klik "Confirm Payment & Send Receipt" → modal buka.
- [x] Warning render: "⚠ RESEND NOTICE — booking sudah confirmed."
- [x] Bullet 1 interpolate real `customerEmail` (bukan placeholder).
- [x] Bullet 2 interpolate `receiptNumber` (RCPT-FT-...) dan `receiptIssuedAt` ("15 Okt 2026, 23.24" Asia/Makassar).
- [x] Bullet 3 mention paymentAuditLog.
- [x] Submit button label "Confirm & Send Receipt (Resend)" (post-preview).

### Scope
- Zero schema change, zero endpoint change, zero new file.
- Only 1 file edit (BookingAdminActions.tsx) + leftover autogen regen.

### Rollback
```bash
git revert 3dd206a
```
