## Phase: 4.74.6 — Hardening + Series Closing
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai (EXIF strip + TTL cleanup + security master log + closing doc)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74-payment-receipt-mgmt-analysis.md`](phase-4.74-payment-receipt-mgmt-analysis.md)
**Dependency**: [`phase-4.74.5-bell-notifications.md`](phase-4.74.5-bell-notifications.md)

### Ringkasan
Sub-phase akhir series 4.74 — EXIF strip JPEG di upload endpoint, TTL cleanup endpoint untuk AdminNotifications, security master log entry (11 guards), series closing summary. Beberapa item (R2 bucket terpisah, HTML template polish, auto-expire cron, admin WA relay) di-defer eksplisit ke 4.74.7/4.74.8 — bukan karena malas tapi karena perlu provisioning / keputusan bisnis / scope lebih besar.

### File yang Berubah / Baru

| File | Jenis | Perubahan |
|---|---|---|
| `apps/web/src/lib/checkout/exifStrip.ts` | **NEW** | Pure-JS JPEG EXIF stripper (zero npm dep, Workers runtime safe). Scan marker stream, drop APP1 (0xFFE1) segment yg berisi EXIF/GPS/device PII. Non-JPEG passthrough. Fail-safe return original kalau parse error. |
| `apps/web/src/pages/api/bookings/[ref]/submit-payment-proof.ts` | Modified | Call `stripExifIfJpeg(file)` sebelum `uploadProofFileToMedia`. 1 line integration. |
| `apps/cms/src/collections/AdminNotifications.ts` | Modified | Tambah `cleanupEndpoint` (POST `/cleanup`, admin+ only, batch 1000, body `{olderThanDays?: 7–365, default 60}`). Return `{deleted, scanned, cutoffISO, hasMore}`. Mirror pola `OtpVerifications.cleanup` (4.69.10). |
| `docs/08-SECURITY-PATCH.md` | Modified | Tambah section "Phase 4.74 Series B — Payment & Receipt Management Flow" dgn 11 guards (PR-G1 token gate → PR-G11 TTL cleanup) + 5 deferred follow-ups + 4 accepted risk. |
| `docs/phases/.../phase-4.74.6-hardening-closing.md` | **NEW** | File ini. |
| `docs/phases/.../CLOSING-SUMMARY.md` | **NEW** | Rangkuman series 4.74.1 → 4.74.6 (lihat §Closing di bawah). |

### EXIF Strip Algorithm

JPEG marker stream parsing:
- SOI (0xFFD8) at start, EOI (0xFFD9) at end — standalone markers.
- RSTn (0xFFD0–D7) — restart markers, no length.
- SOS (0xFFDA) — start of scan, payload sampai EOI dicopy as-is.
- Length-bearing segment: 0xFF 0xXX + length (2 bytes BE, includes self).

Logic:
1. Validate SOI.
2. Scan markers; APP1 (0xFFE1) → **drop** entire segment (marker + length + payload).
3. Preserve semua segment lain (APP0 JFIF benign, APP2 ICC profile benign, DQT, DHT, DRI, SOF, dst).
4. On SOS: copy semua byte sampai akhir file (SOS payload has byte-stuffing 0xFF 0x00 — too complex to re-parse; marker-based copy aman).
5. Reconstruct `new File([stripped], file.name, {type, lastModified})`.

Kalau EXIF tidak ditemukan (strippedCount === 0): return original File (avoid unnecessary realloc). Kalau parse error / corrupt: return original (fail-safe, admin review bisa lihat metadata di preview).

**Scope**: hanya image/jpeg + image/jpg MIME. PNG tidak scan (biasanya tidak carry EXIF, benign tEXt chunks). PDF metadata (author/producer) tidak di-strip — assumed tidak sensitif untuk receipt scan.

### TTL Cleanup Endpoint

```
POST /api/admin-notifications/cleanup
Body: { "olderThanDays": 60 }   // optional, clamp 7..365
Response: { ok, deleted, scanned, cutoffISO, hasMore }
```

- Auth: admin+ only.
- Batch 1000 per call (loop di cron kalau `hasMore=true`).
- Dipanggil cron external (sama pola OTP 4.69.10). Cron setup belum di-automate — admin bisa trigger manual via curl + API key atau tunggu phase 4.74.8 (Cloudflare Scheduled Worker).

### Testing

#### Programmatic
- [x] `stripExifIfJpeg(file)` TypeScript compiles.
- [x] Endpoint integration: 1 line call sebelum upload, non-blocking (`await` tapi fast).
- [x] CMS reload: cleanup endpoint registered di importMap (via auto-regen).

#### Pending (butuh real file + cron trigger)
- [ ] Upload JPEG dgn EXIF GPS → cek file hasil (di `media` collection) via exiftool / online EXIF viewer → GPS section hilang.
- [ ] Upload PNG → file byte-identical ke input (passthrough).
- [ ] Upload JPEG tanpa EXIF → file byte-identical (strippedCount=0 return original).
- [ ] Upload malformed JPEG → return original (fail-safe, tidak error).
- [ ] POST `/api/admin-notifications/cleanup` dgn body `{olderThanDays:30}` setelah seed data > 30 hari → return `deleted` matching jumlah old rows.
- [ ] Cron setup di CF Scheduled Worker atau system cron (defer 4.74.8).

### Series Closing Summary

Lihat [`CLOSING-SUMMARY.md`](CLOSING-SUMMARY.md) — rangkuman 6 sub-phase, impact metrics, deployment checklist, deferred roadmap.

### Deferred ke 4.74.7 / 4.74.8 / 5.0

| Item | Phase | Alasan defer |
|---|---|---|
| Auto-expire booking cron (deadline passed → expired + reminder email H-2jam) | 4.74.7 | Butuh keputusan bisnis: deadline strict atau rolling? Email reminder tone? |
| Admin WA/Telegram relay notif (supplement bell in-app) | 4.74.7 | Butuh integrasi Twilio / WA Business API — scope separate. |
| R2 bucket terpisah `gt-journeys-payment-proofs` + 12-month lifecycle | 4.74.8 | Butuh provisioning CF R2 + wrangler.toml binding + migration media file ke bucket baru. |
| HTML template polish email reject (match brand phase 4.70.2) | 4.74.8 | Text-only acceptable untuk MVP. Polish setelah user feedback. |
| Default `payment_whatsapp_body` include `{{paymentUploadUrl}}` tanpa admin edit manual | 4.74.8 | Butuh update `bookingTemplatesDefaults.ts` + migration update existing bookingTemplate row (konsisten dgn pola 4.70.3.1 wording migration). |
| Mark all read button di bell panel | 4.74.8 | Nice-to-have UX. |
| Custom "Approve/Reject" quick-action buttons di Booking edit view | 4.74.8 | Standard edit PaymentProofs cukup untuk MVP. |
| Payment gateway integration (Xendit/Midtrans) | 5.0 | Replace manual flow entirely. Stub `channel: xendit/midtrans` di Bookings sudah ada. |

### Rollback

Per-sub-phase (lihat masing-masing phase doc). Full series rollback:
1. Revert code (4.74.6 → 4.74.1 urutan terbalik).
2. `pnpm schema:down` × 1 (reverse batch 59).

### Dokumentasi yang Diupdate

- [x] `docs/08-SECURITY-PATCH.md` — section Phase 4.74 Series B dgn 11 guards
- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.6 + series closing reference
- [ ] `docs/02-DATABASE-SCHEMA.md` — defer bundled dgn deploy phase 5
- [ ] `docs/04-RBAC.md` — defer bundled dgn deploy phase 5
- [ ] `AGENTS.md` — tidak perlu (no rule change)

### Next Step

**Sub-phase 4.74 series: COMPLETE** 🎉

User action yang dibutuhkan sebelum deploy:
1. Backup DB → `pnpm schema:migrate` di production.
2. Secret rotation jika pakai berbeda dari dev.
3. Smoke test end-to-end dgn real booking (admin trigger Send Payment → customer buka URL → upload → admin verify).
4. Setup cron external untuk `/api/admin-notifications/cleanup` (daily, body `{olderThanDays:60}`).
5. Admin edit `Booking Templates` global → tambah `{{paymentUploadUrl}}` di `paymentEmailBody` + `paymentWhatsappBody` biar customer dapat link upload di email/WA (defer alt: 4.74.8 default string migration).

Next feature roadmap: Phase 4.74.7 (auto-expire + admin WA relay) atau Phase 4.75 (feature baru per user prioritas).
