## Phase: 4.69.9 — Customer Reschedule / Cancel Request Flows

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Flow dua arah untuk reschedule/cancel request:

**Customer side** (confirmation page):
- 2 tombol "Request Reschedule" + "Request Cancellation" muncul di halaman konfirmasi
  (hanya untuk status aktif: awaiting_review, awaiting_payment, payment_review, confirmed).
- Modal textarea (10–500 char) untuk alasan.
- Submit → endpoint web → CMS update status + save alasan.
- Rate-limit per IP (reuse `checkBookingRateLimit`, 3 req/15min).

**Admin side** (CMS):
- `BookingAdminActions` extended dengan 2 tombol baru:
  - "Send Reschedule Response" (status=reschedule_request → tetap, admin lanjut manual)
  - "Send Cancel Response" (status=cancel_request → `cancelled`)
- Preview modal + render template dari global `booking-templates`.
- Email send via Resend (reuse pattern Phase 4.69.7).
- Collapsible "Customer Request" di edit view: baca alasan + timestamp
  sebelum response (auto-visible saat status reschedule_request/cancel_request).

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/migrations/20261009_130000_phase_4_69_9_bookings_customer_request.ts` | BARU | ALTER TABLE ADD 3 kolom (customer_request_reason, customer_requested_at, customer_request_kind). |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration. |
| `apps/cms/src/collections/Bookings.ts` | Edit | +3 field (collapsible "Customer Request"), +3 endpoint (customer-request public, sendReschedule, sendCancel), +shared `handleSendResponse()` helper untuk reduce duplication. |
| `apps/cms/src/admin/BookingAdminActions.tsx` | Edit | Extend ActionKind → 4 variant. kindToPath/Label/Emoji helpers. Reschedule+Cancel buttons untuk status reschedule_request/cancel_request. |
| `apps/web/src/pages/api/bookings/request-change.ts` | BARU | POST endpoint customer-side: validate (ref, token) → rate-limit → forward ke CMS custom endpoint via API-Key. |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Edit | Section "Need to change your booking?" (2 button) + modal textarea + inline script submit/handling. Juga status badge "Request submitted" kalau sudah di reschedule_request/cancel_request. |
| `packages/shared/src/types/payload-types.ts` | Regenerate | BookingType punya 3 field baru. |

### Flow Diagram

```
┌────────────┐  click "Request Reschedule"
│  Customer  │ ──────────────────────────────┐
└────────────┘                               ▼
                                 ┌─────────────────────┐
                                 │ Modal: reason input │
                                 └─────────┬───────────┘
                                           │ POST /api/bookings/request-change
                                           ▼
                                 ┌─────────────────────────────────────┐
                                 │ Web endpoint                        │
                                 │  - validate (ref, token)            │
                                 │  - rate-limit IP (3/15min)          │
                                 │  - call CMS /:id/customer-request   │
                                 └─────────┬───────────────────────────┘
                                           │ POST + API-Key
                                           ▼
                                 ┌─────────────────────────────────────┐
                                 │ CMS /:id/customer-request           │
                                 │  - admin role check                 │
                                 │  - status gate (active statuses)    │
                                 │  - update: status=reschedule_request│
                                 │    + customerRequestReason/Kind/At  │
                                 └─────────┬───────────────────────────┘
                                           │ 200 OK
                                           ▼
                                      Reload page
                                      (SSR shows "Request submitted" badge)
                                           │
                                           ▼
┌────────────┐  filter chip "🔁 Reschedule" (Phase 4.69.8)
│   Admin    │ ──────────────────────────────┐
└────────────┘                               ▼
                                 Open booking → read Customer Request section
                                           │ click "Send Reschedule Response"
                                           ▼
                                 Modal preview email + WA (reschedule template)
                                           │ Confirm & Send
                                           ▼
                                 CMS /:id/send-reschedule-response
                                  - render template (D10 ERROR check)
                                  - Resend send
                                  - status stays reschedule_request
                                  - return wa.me link

```

### Status Transition Matrix

| From status                              | Customer can request? | Resulting status      |
|------------------------------------------|-----------------------|-----------------------|
| awaiting_review / awaiting_payment / payment_review / confirmed / pending | ✅ | reschedule_request / cancel_request |
| reschedule_request / cancel_request      | ❌ (sudah pending)    | — (UI shows "Request submitted") |
| cancelled / expired                      | ❌                    | — (UI shows "no longer available") |

Admin response:
- Send Reschedule Response → status TETAP di `reschedule_request` (admin lanjut
  manual: update tanggal, kembalikan ke `awaiting_review` atau `confirmed`).
- Send Cancel Response → status → `cancelled` (final, locked).

### Rate Limit + Security

- **Customer endpoint**: 3 req/15min per IP via `checkBookingRateLimit`.
  Attacker tidak bisa spam DOS admin.
- **Validation**: ref + token constant-time compare (sama dgn confirmation page).
- **Reason length**: 10–500 char enforced di client + server + CMS endpoint
  (defense-in-depth).
- **No PII di error response**: generic error codes (`not_found`, `rate_limited`).
- **CMS endpoint auth**: API-key only (role admin). Public tidak bisa langsung
  panggil CMS.

### Testing

#### Migration
```
pnpm schema:migrate → Migrated: 20261009_130000_phase_4_69_9_bookings_customer_request (61ms) ✓
```

#### TypeScript
```
pnpm tsc --noEmit → zero new errors (pre-existing defaultSort unrelated).
Types regenerated via pnpm generate:types.
```

#### Manual flow (dev)
```
1. Buat booking test (status default = awaiting_review).
2. Buka confirmation URL `/checkout/ferry-tickets/confirmation/<ref>?t=<token>`.
3. Scroll ke section "Need to change your booking?" → 2 button terlihat.
4. Click "Request Reschedule" → modal muncul.
5. Isi reason < 10 char → submit → inline error "at least 10 characters".
6. Isi reason valid → submit → spinner → reload → UI tampilkan "Request submitted".
7. Login CMS → chip filter "🔁 Reschedule" → booking terlihat.
8. Open booking → collapsible "Customer Request" tampil dgn alasan.
9. Scroll ke Admin Actions → tombol "Send Reschedule Response" muncul.
10. Click → modal preview email + WA → Confirm & Send → email terkirim.
11. Status TETAP reschedule_request (admin bisa update manual tanggal).

Cancel flow:
12. Buat booking test lagi.
13. Confirmation page → "Request Cancellation" → modal → submit.
14. CMS: status cancel_request → admin klik "Send Cancel Response" → status → cancelled.
```

### Impact

- **Database**: +3 kolom di `bookings` (nullable, backward compat).
- **CMS**: +3 field, +3 endpoint (1 public customer-request, 2 admin send-response), 1 extended component.
- **Frontend web**: 1 endpoint baru, 1 section baru di confirmation page.
- **Env**: tidak ada perubahan.
- **Deploy needed**: **cms + web**.

### Known Limitations

- Rate-limit customer request **shared counter** dengan booking create → user yang baru booking lalu refresh berulang kali bisa kena limit kalau dalam 15 menit yang sama. Separate counter bisa jadi future improvement.
- Reschedule flow belum ada **date-picker inline** — admin masih update tanggal via field manual di CMS. Future: tambah mini-widget di modal untuk propose dates ke customer langsung.
- Admin **tidak notified** otomatis saat customer request masuk — tergantung chip filter. Future: email notification admin via webhook/afterChange hook.
- Customer **bisa cancel booking yang sudah `confirmed`** (e-ticket terkirim) — behavior intentional supaya customer tidak terkunci, tapi admin harus hati-hati dengan refund policy di template cancelResponse.

### Dokumentasi yang Diupdate

- [x] File phase ini

### Next Steps

**Phase 4.69.10 — Cron OTP cleanup**:
1. Cloudflare cron trigger weekly (via Wrangler config)
2. Delete OTP records yang `expiresAt < now - 7 days` (keep 7 day grace untuk audit)
3. Reuse Payload Local API via scheduled task
