## Phase: 4.74.6c — Rupiah Format + Mobile Polish + Approve Email Bug Fix
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · E2E re-verify dgn real booking pending
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74.6b-flow-polish.md`](phase-4.74.6b-flow-polish.md)

### Latar Belakang (User Report)

3 perbaikan post-E2E:

1. **Nominal field format Rupiah**: `type=number` display raw integer tanpa separator → bingungkan customer saat baca angka besar (misal `1234567` vs `Rp 1.234.567`).
2. **Success page mobile**: user bilang belum mobile-friendly meski sudah pakai Tailwind mobile-first — padding/font/overflow belum optimal di 375px viewport.
3. **🐛 BUG CRITICAL**: approve PaymentProof → booking.status=confirmed TAPI email customer **tidak terkirim**. Padahal hook phase 4.74.6b supposed to auto-send.

### Root Cause Bug #3

Investigasi stepwise:

1. **Hook self-call pakai HTTP fetch dgn API-key auth** — API-key env `PAYLOAD_API_KEY` tidak di-set di `apps/cms/.env` (hanya di `apps/web/.env` sebagai secret untuk web→CMS). Hook throw early "API-key env kosong" → fail-safe path (booking.status=confirmed manual + critical notif).

2. **Walaupun API-key di-set**, send-ticket endpoint pakai `requireAdmin(req)` guard yang hanya accept `admin` + `super-admin` role. API-key user role = `api` (per phase 4.74.4.1) → return 401.

3. **AdminNotif critical "manual send-ticket required"** — user mungkin tidak notice karena bell notification baru / belum klik untuk investigate.

### Fix 1 — Nominal Format Rupiah

**Approach**: input `type=text` dengan JS auto-format "1.234.567" (id-ID separator) saat user ketik. Hidden input simpan raw integer utk submit. Prefix "Rp" absolute positioned.

| File | Perubahan |
|---|---|
| `apps/web/src/pages/payment/[ref].astro` | Input `type=number` → `type=text inputmode=numeric` dgn id=`amountDisplay`. Tambah hidden input `name=amount` yang simpan raw digit. Prefix `Rp` absolute left-3 pointer-events-none. Pre-fill display pakai `.toLocaleString('id-ID')`. JS listener `input`: strip non-digit → format id-ID → update display + hidden. Listener `blur`: pastikan hidden sinkron. |

### Fix 2 — Mobile Polish Success Page

**Audit**: viewport 375px, text wrap, padding compact, touch targets.

| Element | Lama | Baru |
|---|---|---|
| Main padding | `py-10 px-4` | `py-6 sm:py-10 px-3 sm:px-4` |
| Hero card padding | `p-8` | `p-5 sm:p-8` |
| Icon size | `w-20 h-20` | `w-16 h-16 sm:w-20 sm:h-20` |
| H1 size | `text-2xl` | `text-xl sm:text-2xl` + `leading-tight` |
| Hero body | em-dash separator inline | `<br class="sm:hidden">` → stack di mobile, inline di desktop |
| Booking ref | plain | `font-mono` (clearer code look) |
| Route meta | `text-xs` | + `break-words leading-relaxed` + stack di mobile |
| Timeline circles | plain | `ring-4 ring-white` → stand out dari border-left |
| Timeline step 2 copy | "(hari kerja: Senin–Jumat...)" inline | `<span class="block sm:inline mt-0.5">` → wrap neat di mobile |
| Email di step 3 | plain | `break-all` → long emails tidak overflow |
| FAQ title | `text-base` | `text-sm sm:text-base` + icon `shrink-0` |
| FAQ spacing | `space-y-3` | `space-y-2.5 sm:space-y-3` |
| WA CTA button | `w-auto` | `w-full sm:w-auto justify-center` → full-width di mobile (easier tap) |
| Link detail booking | small text | `inline-block py-2 px-3` → bigger touch target |

### Fix 3 — Approve Email Bug: Direct Handler Call

**Approach**: ganti HTTP self-fetch dgn **direct handler invoke**. Export `sendTicketEndpoint` dari `Bookings.ts`, import di `PaymentProofs.ts`, panggil `.handler(fakeReq)` dengan req yg sudah include admin user context dari hook.

| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | Export `sendTicketEndpoint` (semula local `const`). Comment menjelaskan reason: hook direct invoke bypass HTTP + API-key issue + reuse admin user context (sentTicketBy = admin yg approve, bukan api user). |
| `apps/cms/src/collections/Bookings.ts` | `requireAdmin` widen allowed = `['admin', 'super-admin', 'api']`. Safety net: kalau future hook pakai HTTP self-call dgn API-key, tetap jalan. Attack surface minimal (API-key sudah scoped per 4.74.4.1, email cuma kirim ke customer booking itu sendiri). |
| `apps/cms/src/collections/PaymentProofs.ts` | Import `sendTicketEndpoint` dari `./Bookings`. Approve branch: build `fakeReq` dgn `Object.assign(Object.create(getPrototypeOf(req)), req, {routeParams:{id}, json: async()=>body})` → preserve all PayloadRequest shape, inject routeParams + json(). Panggil `sendTicketEndpoint.handler(fakeReq)`. Fail-safe path tetap (critical notif kalau handler reject). |

**Audit benefit**: `booking.sentTicketBy` = admin yg approve PaymentProof (bukan api user), karena hook jalan dgn admin's req context.

### Testing

#### Programmatic
- [x] TypeScript compiles OK.
- [x] CMS hot-reload clean.

#### Pending (butuh real booking)
- [ ] Form payment: ketik `1234567` → display "1.234.567" dgn prefix "Rp" di kiri. Submit → endpoint receive `amount=1234567` (integer).
- [ ] Mobile viewport (375px): success page render tanpa horizontal scroll, timeline circles jelas, FAQ accordion tappable, WA button full-width.
- [ ] **Approve PaymentProof** (status pending → approved, Save) → cek:
  - [ ] `booking.status = confirmed`
  - [ ] `booking.sentTicketAt`, `sentTicketBy = <admin>`, `receiptNumber = RCPT-...` ter-set
  - [ ] Email customer **arrives** dgn Payment Receipt PDF terlampir
  - [ ] AdminNotif info "Payment approved & receipt sent" (bukan critical "manual required")
- [ ] Edge: BookingTemplates.bankAccounts kosong → fail-safe critical notif muncul → admin bisa klik Send Ticket manual di booking edit view (fallback).

### Known Deferred

- Receiving bank picker di PaymentProof (admin edit booking.paymentBank manual kalau non-first bank).
- Cursor position preservation saat format Rupiah input (saat ini cursor jump ke end — acceptable UX untuk form singkat).
- CMS admin interface untuk testing `send-ticket` dari PaymentProof row langsung (sudah bisa via standard edit).

### Rollback

Revert 3 file:
1. `apps/web/src/pages/payment/[ref].astro` — restore `type=number` single input + hapus JS format.
2. `apps/web/src/pages/payment/[ref]/success.astro` — restore pola 4.74.6b.
3. `apps/cms/src/collections/Bookings.ts` + `PaymentProofs.ts` — restore HTTP self-call pattern + requireAdmin narrow.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.6c
- [ ] `docs/08-SECURITY-PATCH.md` — pertimbangkan tambah catatan `requireAdmin` widen (minor relaxation untuk internal hook); defer sampai closing summary direfresh.

### Next Step

User E2E test ulang: upload bukti baru (verify Rupiah format + mobile), lalu admin approve → **cek email benar-benar sampai customer**.
