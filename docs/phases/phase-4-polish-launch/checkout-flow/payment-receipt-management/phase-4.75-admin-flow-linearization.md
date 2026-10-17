# Phase 4.75 — Admin Flow Linearization: Payment Review → E-Ticket → Confirm

**Status**: 🚧 In progress
**Scope**: 1 collection schema change (Bookings), 2 hook guards, 1 new UI component, email attachment extension.
**Dependencies**: Phase 4.74 series (Payment Proofs + bell notifications).

## Problem

Alur approve payment saat ini mengirim receipt otomatis tanpa e-ticket operator yang harus GtJourneysID peroleh dari operator ferry (GtJourneysID tidak menerbitkan e-ticket sendiri). Receipt tanpa e-ticket = pengiriman tidak lengkap.

Selain itu, admin harus lompat-lompat antara `/admin/collections/bookings/<id>` dan `/admin/collections/payment-proofs/<pid>` untuk approve. Konteks hilang, workflow terputus.

## Goal

1. **Guard**: Approve payment proof **tidak bisa jalan** sebelum admin upload e-ticket di booking.
2. **Context button**: Di halaman edit booking, saat status `payment_review`, tampilkan tombol langsung ke Payment Proof terkait (atau ke create form manual kalau proof belum ada — case WA/offline).
3. **Atomic send**: Saat approve, email ke customer berisi receipt PDF **+ e-ticket operator (multi-file)** sekaligus.
4. **Multi-ticket**: Support roundtrip (bisa upload >1 e-ticket per booking).

## Scope

### Schema

`apps/cms/src/collections/Bookings.ts` → section "Payment" collapsible, tambah:

- `eTickets` — array of upload (relationTo: media), multiple file. PDF/JPG/PNG. Required saat approve guard aktif.
- `eTicketSentAt` — date readOnly, auto-filled saat send-ticket sukses dgn attachment e-ticket.

### Guards

1. **`paymentProofGuardHook` (beforeChange)** → tambah check: saat `pending → approved`, kalau `booking.eTickets` kosong atau null → throw error dengan pesan jelas ("Upload e-ticket di booking dulu sebelum approve. Buka booking → Payment section → Upload E-Tickets.").
2. **`sendTicketEndpoint`** → kalau `eTickets.length === 0` dan status pre-send bukan `confirmed` (first-send), return 400 dgn pesan sama. Resend (`isResend=true`) tetap boleh tanpa cek baru — e-ticket sudah pernah terkirim.

### UI Component

`apps/cms/src/admin/BookingPaymentProofButton.tsx` (NEW, client component):

- Baca `data.status` + `data.latestPaymentProof` + `data.id` dari form context (`useFormFields` / `useDocumentInfo`).
- Status = `payment_review`:
  - `latestPaymentProof` ada → "📄 Review Payment Proof" primary → navigate `/admin/collections/payment-proofs/<pid>`.
  - `latestPaymentProof` null → "➕ Open Payment Proofs (Manual Entry)" → navigate `/admin/collections/payment-proofs/create` dengan info banner "Pilih booking **{bookingRef}** dari relationship dropdown — case WA/offline".
- Status != `payment_review` → null.
- Mounted di sidebar area booking fields (via `type: 'ui'` dengan Field component).

### Email Attachment

`sendTicketEndpoint` di `Bookings.ts`:

- Setelah PDF receipt generated, kalau `booking.eTickets.length > 0`:
  - Loop setiap `eTicketItem.file` (relationship ke media).
  - `req.payload.findByID({collection: 'media', id: fileId, depth: 0})` → dapat `url` + `filename` + `mimeType`.
  - `await fetch(mediaDoc.url).then(r => r.arrayBuffer())` → base64 encode via `uint8ArrayToBase64`.
  - Push ke `attachments[]` array dengan `filename`, `content`, `content_type: mediaDoc.mimeType`.
- Receipt PDF attachment TETAP primary (filename `RCPT-xxx.pdf`), e-ticket attachment DI BAWAH.
- Kalau fetch gagal (R2 timeout, network) → log error, skip e-ticket attachment itu, tetap kirim email dengan receipt + e-ticket lain yg sukses. Return `warning: 'eticket_fetch_partial'` di response.
- Set `booking.eTicketSentAt = nowIso` saat update final.

### Flow Diagram (post-4.75)

```
Customer transfer → upload proof via /payment/<ref>?t=<token>
→ booking.status = payment_review (hook auto-set)
→ AdminNotif "Payment proof submitted" (bell top-bar)

Admin login → bell shows unread → click → routed to BOOKING edit view
→ [new] "Review Payment Proof" button visible
→ click → go to PaymentProofs edit view
  → BUT first: upload e-ticket di booking (admin manual navigates back if forgot)

Admin at booking edit → scroll to Payment section → upload e-tickets (multi file)
→ save booking
→ click "Review Payment Proof" button
→ at PaymentProofs edit view
→ set status = approved
  → beforeChange guard: check booking.eTickets.length > 0 — else THROW
  → afterChange hook: self-call sendTicketEndpoint
    → PDF receipt generated
    → e-ticket fetched + base64 encoded + attached
    → email sent with receipt.pdf + eticket1.pdf + eticket2.pdf
    → booking.status = confirmed
    → booking.sentTicketAt + eTicketSentAt set
    → bell notif "Payment approved & receipt+eticket sent"
```

Case WA/offline (customer chat admin via WA, kirim bukti transfer manual):

```
Admin receives WA message with proof screenshot
→ Admin opens booking edit view
→ Admin manually sets status = payment_review
→ [new] "Open Payment Proofs (Manual Entry)" button visible
→ click → go to PaymentProofs create form
→ Admin fills: booking (pick from dropdown), senderName, amount, transferDate, proofFile (upload screenshot WA)
→ Save → afterChange hook auto-sets booking.latestPaymentProof + attempts
→ Back at booking: upload e-tickets
→ Return to PaymentProofs → set approved → flow identik dengan self-service case
```

### Rejected Flow (unchanged, documented for completeness)

Reject proof → booking.status reverts ke `awaiting_payment` → customer email dgn `rejectedReason` + resubmit link. Flow existing dari Phase 4.74.4; tidak di-touch Phase 4.75.

## Rollback

1. Remove `eTickets` + `eTicketSentAt` dari Bookings fields array (lines in Payment collapsible).
2. Remove e-ticket guard di `paymentProofGuardHook` (search `eTickets` guard block).
3. Remove e-ticket guard + attachment loop di `sendTicketEndpoint`.
4. Remove `/admin/BookingPaymentProofButton#default` registration di Bookings fields.
5. Keep imports if used elsewhere (none expected).
6. Data `eTickets` + `eTicketSentAt` di DB rows tetap orphaned column — tidak merusak apa pun.

## Testing checklist

- [ ] Fresh booking: customer submit proof → status payment_review → admin tries approve TANPA e-ticket → error visible (red toast) + status tetap pending.
- [ ] Upload e-ticket single PDF → approve → receipt.pdf + eticket.pdf arrive di customer inbox.
- [ ] Upload 2 e-ticket (roundtrip) → approve → 3 attachments: receipt + 2 e-ticket.
- [ ] Status = payment_review, proof ADA → "Review Payment Proof" button appears, click → routes ke proof.
- [ ] Status = payment_review, proof null (manual admin status change) → "Open Payment Proofs (Manual Entry)" button appears, click → routes ke create.
- [ ] Status != payment_review → button hidden (invisible — not a disabled button).
- [ ] Reject flow unchanged: proof reject → booking back to awaiting_payment + customer email.
- [ ] Resend ticket (status already confirmed): tetap jalan, e-ticket guard di-skip (resend path).
- [ ] Mobile responsive: tombol tetap readable di viewport sempit.

## Attribution

Phase doc + implementation by Claude Opus 4.7. Human direction: Anggi — alur operasional (payment review → e-ticket → confirm) + decision on multi-ticket + PDF/image flexibility.
