## Phase: 1.2 — `send-ticket` server-side 30s rate-limit guard

**Tanggal**: 2026-10-15
**Status**: MERGED (PR #3)
**Commit**: `284cb4d`
**Finding**: #3 (High) — server-side portion

### Ringkasan
Server guard untuk reject duplicate `send-ticket` attempt dalam 30 detik dari previous attempt (HTTP 409, pesan Indonesia). Resend setelah 30s tetap jalan (playbook rule: "A resend after the 30 second window must work").

### Design keputusan
- **Zero schema change** — pakai 2 field existing: `sentTicketAt` (anchor "booking ini pernah di-send", frozen di resend) + `updatedAt` (auto-field, bump tiap write).
- Guard pakai `max(sentTicketAt, updatedAt)`.
- Aktif **hanya** kalau `sentTicketAt` sudah set → first-send pada booking yang baru di-edit manual tidak terblokir.
- `previewOnly: true` di-skip total → preview tidak terhitung attempt.
- Idempotency key per-attempt (`Date.now()`) **dipertahankan** → resend >30s kirim email baru dengan PDF.
- Guard di-pasang **setelah** status validity check, **sebelum** readTemplates/PDF generation → request terblokir hemat resource.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | `sendTicketEndpoint`: tambah guard 30s di depan. |

### Trade-off
Manual edit admin ke booking confirmed bump `updatedAt` → send-ticket berikutnya terjeda sampai 30s. Rare, harmless, admin tinggal tunggu. Tidak melindungi race benar-benar concurrent <1s (Request 1 belum commit saat Request 2 read); scenario tersebut cover Step 1.1 client-side.

### Testing
- [x] Klik "Confirm Payment & Send Receipt" 2x dalam 5s → 2nd attempt 409 "Terlalu cepat, coba lagi dalam 30 detik".
- [x] Wait 35s → send-ticket berhasil (resend window elapsed).
- [x] First-send booking (sentTicketAt null) → tidak terblokir meskipun updatedAt baru.

### Scope
- Zero schema change, zero endpoint rename, zero new package.

### Rollback
```bash
git revert 284cb4d
```
