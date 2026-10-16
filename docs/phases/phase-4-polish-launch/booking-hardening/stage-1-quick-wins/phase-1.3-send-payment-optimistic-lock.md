## Phase: 1.3 — `send-payment` optimistic lock + rollback on email fail

**Tanggal**: 2026-10-15
**Status**: MERGED (PR #3)
**Commit**: `637cb08`
**Finding**: #2 (Medium) — server-side portion

### Ringkasan
Replace ordering `sendEmail → update` dengan `optimistic update → sendEmail → rollback on failure`. Satu-satu-nya request paralel yang bisa flip status dari `awaiting_review` ke `awaiting_payment` → yang lain dapat 0 rows → 409 tanpa kirim email duplicate.

### Design keputusan
- Optimistic update pakai conditional WHERE:
  ```ts
  where: { and: [
    { id: { equals: id } },
    { status: { in: ['awaiting_review', 'pending'] } },
  ]}
  ```
  SQL UPDATE di D1/libsql serialized → hanya 1 request yang flip. Yang lain 0 rows updated → 409 "Booking sudah di-process oleh request lain. Reload halaman untuk status terbaru." TANPA email.
- Pre-capture `previousStatus` untuk rollback target.
- On sendEmail failure: best-effort rollback status + `sentPaymentAt` + `sentPaymentBy`. Return 502 "status sudah di-rollback". Kalau rollback juga fail → `console.error`, admin fix manual.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | `sendPaymentEndpoint`: optimistic update + rollback flow. |

### Yang dipertahankan
- Idempotency key `payment:${bookingRef}:${userId}` (per-user, bukan per-attempt — pattern existing, send-payment tidak support resend).
- Status gate check di awal (early reject).
- Template rendering sebelum update (surface errors sebelum DB write).
- `previewOnly` tetap skip semua side effect.

### Trade-off
Window kecil (<1s) dimana booking berstatus `awaiting_payment` padahal email belum sampai (antara optimistic update sukses & sendEmail selesai). Rare + self-correcting via rollback. Rollback best-effort: kalau rollback fail setelah email fail, booking stuck di `awaiting_payment`. User-visible (admin bisa fix via field), bukan silent.

### Testing
- [x] Trigger 2 send-payment paralel (curl ampersand) → 1 sukses, 1 dapat 409.
- [x] Simulate email fail (invalid SMTP) → status di-rollback, response 502.
- [x] previewOnly → status tidak berubah.

### Scope
- Zero schema change, zero endpoint change, zero new package.

### Rollback
```bash
git revert 637cb08
```
