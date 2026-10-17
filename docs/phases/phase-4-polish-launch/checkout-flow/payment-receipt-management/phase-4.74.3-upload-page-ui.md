## Phase: 4.74.3 — Payment Upload Page UI + Template Variable
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · route compiled OK (SSR+404 redirect verified) · E2E dgn real booking pending
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74-payment-receipt-mgmt-analysis.md`](phase-4.74-payment-receipt-mgmt-analysis.md)
**Dependency**: [`phase-4.74.2-submit-endpoint.md`](phase-4.74.2-submit-endpoint.md)

### Ringkasan
Frontend customer-facing untuk upload bukti transfer: 2 halaman Astro SSR token-gated + 1 template variable `{{paymentUploadUrl}}` di konteks email/WA. Dengan sub-phase ini, flow end-to-end customer sudah fungsional (upload → submit endpoint → hook sync booking + create AdminNotif).

### File yang Berubah / Baru

| File | Jenis | Perubahan |
|---|---|---|
| `apps/web/src/pages/payment/[ref].astro` | **NEW** | Upload form page. SSR token verify (reuse 4.66.5), status gate (`awaiting_payment`∪`payment_review`), soft-cap attempts, no-store headers + noindex (4.66.6). Form multipart: senderName, senderBank, amount (pre-filled totalEstimate), transferDate (max=today), transferTime, proofFile (JPG/PNG/WebP/PDF, max 5MB), customerNote (500 char). Submit async via fetch → redirect `/payment/[ref]/success` saat ok. Alert banner saat gagal. Mobile-first Tailwind (konsisten pola 4.65). |
| `apps/web/src/pages/payment/[ref]/success.astro` | **NEW** | Konfirmasi sukses token-gated. Panel green dgn checklist "yang terjadi selanjutnya" (admin verify 1x24jam, status payment_review, email hasil verifikasi, e-ticket+receipt setelah approve). Tombol "Lihat halaman booking →" ke confirmation page. |
| `apps/cms/src/collections/Bookings.ts` | Modified | `sendPaymentEndpoint`: build `paymentUploadUrl = ${siteUrl}/payment/${bookingRef}?t=${accessToken}` + inject ke `buildContext`. 1 variable baru di ctx (dibarengi `confirmationUrl`). |
| `apps/cms/src/lib/templateRenderer.ts` | Modified | Register `paymentUploadUrl` di `KNOWN_VARIABLES` + `OPTIONAL_VARIABLES` (optional supaya reschedule/cancel templates tidak break). |

### UX Pola

- **Blocker state**: kalau status bukan `awaiting_payment`/`payment_review` ATAU `paymentProofAttempts >= 3`, render coral alert panel + link ke confirmation page (bukan form). Reason text per-case: `confirmed` → sudah bayar, `cancelled`/`expired` → tidak terima, 3x attempts → hubungi admin WA.
- **Amount pre-fill**: value = `booking.totalEstimate` (nominal exact), hint "±20% toleransi di server".
- **Date pre-fill**: `max=today`, `value=today` (default hari ini).
- **Async submit**: `preventDefault` + fetch, button disabled + "Mengirim..." state. Response JSON `{ok, redirectUrl}` → navigate; `{ok:false, message}` → alert banner inline.
- **File type guard** (client-side cosmetic): `accept="image/jpeg,image/png,image/webp,application/pdf"` di input (server-side whitelist tetap authoritative).

### Template Variable `{{paymentUploadUrl}}`

Format: `https://gtjourneys.id/payment/<bookingRef>?t=<accessToken>`

Tersedia di konteks `sendPaymentEndpoint` (email + WA body saat admin klik "Send Payment Instructions"). Admin bisa include tombol/link di template default dengan `{{paymentUploadUrl}}` — misal di `payment_whatsapp_body`:

```
...
Sudah transfer? Upload bukti di sini (lebih cepat dari WA):
{{paymentUploadUrl}}

Atau kirim foto bukti balas pesan ini.
```

**NOTE**: default template body di CMS belum diupdate otomatis — admin bisa edit manual via Booking Templates global, atau update default string di `apps/cms/src/globals/bookingTemplatesDefaults.ts` (defer ke sub-phase 4.74.6 bundle dgn hardening polish; sub-phase ini **cuma expose variable**, decision copy-nya tetap milik admin).

Scope conscious: variable belum di-inject di `confirmRescheduleEndpoint` + `confirmCancelEndpoint` (2 lokasi lain `confirmationUrl` build) — reschedule-confirm sebenarnya trigger payment flow juga, tapi defer ke 4.74.4 (admin approve/reject + reconfirm paths).

### Testing

#### Programmatic
- [x] 2 route Astro compile OK.
- [x] Navigate `/payment/<ref>?t=<fake-token>` → redirect ke `/404` (SSR + `getBookingByRefAndToken` + mismatch guard aktif).
- [x] Dev server web (localhost:4321) hot-reload tanpa error.
- [x] CMS hot-reload tanpa error setelah add `paymentUploadUrl` ke KNOWN_VARIABLES.

#### Pending (butuh real booking end-to-end)
- [ ] Admin trigger Send Payment Instructions pada booking dgn status `awaiting_review` → verifikasi email body mengandung `paymentUploadUrl` resolved ke URL valid (bila admin pakai `{{paymentUploadUrl}}` di template).
- [ ] Customer buka `paymentUploadUrl` → form render dgn pre-filled amount.
- [ ] Upload file JPG 500KB + sender data → POST endpoint → sukses → redirect `/payment/[ref]/success`.
- [ ] CMS booking status → `payment_review`, `latestPaymentProof` ter-set, `paymentProofAttempts = 1`.
- [ ] CMS list AdminNotifications: 1 row `payment_proof_submitted` severity=warning muncul.
- [ ] Blocker UX: booking status=`confirmed` buka upload URL → coral alert banner render, no form.
- [ ] Blocker UX: `paymentProofAttempts=3` buka upload URL → "hubungi admin" blocker, no form.
- [ ] Mobile viewport (375px): form layout masih usable, no horizontal scroll.

### Known Deferred

- **EXIF strip JPEG** di upload (4.74.6 hardening).
- **R2 bucket terpisah** `gt-journeys-payment-proofs` (4.74.6).
- **Admin approve/reject endpoint + email reject customer** (4.74.4).
- **CMS admin UI** tab "Payment & Proofs" di edit Booking (4.74.4).
- **Top-bar bell notif admin** (4.74.5).
- **Default template body update** (misal auto-insert `{{paymentUploadUrl}}` di `payment_whatsapp_body` default) — defer 4.74.6 bundle polish.
- **Reschedule/cancel-confirm paths** inject `paymentUploadUrl` — defer kalau butuh.

### Rollback

Revert 4 file (2 route Astro + Bookings.ts endpoint context + templateRenderer.ts KNOWN/OPTIONAL list). Zero schema change.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.3
- [ ] `docs/02-DATABASE-SCHEMA.md` — N/A (no schema change)
- [ ] `docs/04-RBAC.md` — defer ke 4.74.6
- [ ] `docs/08-SECURITY-PATCH.md` — defer ke 4.74.6

### Next Step

Sub-phase **4.74.4** — CMS admin UI (tab "Payment & Proofs" di edit view Bookings, list view PaymentProofs filter default pending, approve/reject endpoints + customer reject email).
