## Phase: 3.5.1 — Expose resend-receipt UI entry on confirmed bookings

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — VERIFIED via browser automation
**Commit**: `92406af`
**Finding**: smoke test finding (pre-existing gap, bukan dari Stage 3)

### Ringkasan
Smoke test Step 3.5 reveal: `statusToKinds('confirmed')` return `[]` → tidak ada tombol action untuk booking confirmed → modal "Confirm Payment & Send Receipt" **tidak pernah bisa dibuka dari UI** → warning resend 3.5 (dan warning yang sudah ada sebelumnya) **unreachable**.

Backend `send-ticket` endpoint sudah support resend dari confirmed (Phase 4.70.3.1: reuse `receiptNumber` + `receiptIssuedAt`, boleh update `paymentBank`/`paymentDate`). Pre-existing gap: UI entry point tidak ada → admin tidak bisa trigger resend lewat tombol, hanya bisa via REST langsung.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/admin/BookingAdminActions.tsx` | `statusToKinds`: add `if (status === 'confirmed') return ['ticket']`. |

### Dampak
- Booking confirmed sekarang nampilkan tombol "🎫 Confirm Payment & Send Receipt" di admin actions.
- Modal buka → enhanced warning 3.5 fire dengan live `customerEmail` + `receiptNumber` + `receiptIssuedAt` + audit log mention.
- Tombol primary label rename ke "Confirm & Send Receipt (Resend)" (sudah di-code Step 3.5, sekarang reachable).

### Testing (verified)
- [x] Reload booking confirmed → tombol muncul (sebelum patch: 0 buttons + warning "Admin actions tidak tersedia").
- [x] Klik tombol → modal buka → enhanced warning render.
- [x] Submit button label correct.

### Scope
- 1 baris change. Zero schema change, zero endpoint change, zero new file.

### Rollback
```bash
git revert 92406af
```
