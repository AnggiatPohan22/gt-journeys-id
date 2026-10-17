## Phase: 4.74.6b — Flow Polish (Auto-fill Date/Time + Post-Payment Journey + Auto Send Ticket)
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · butuh E2E verify dgn real booking
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74.6a-upload-cta-primary.md`](phase-4.74.6a-upload-cta-primary.md)

### Latar Belakang (User Report)

3 temuan dari E2E test pertama:

1. **Form customer**: date + time field manual → rawan customer typo atau sengaja mengakalin waktu yang tidak sync dgn bukti transfer.
2. **Success page**: setelah upload, button "Lihat halaman booking" bawa ke halaman confirmation (yg sudah customer tahu) — info yang customer BUTUHKAN adalah "apa yang terjadi setelah payment, berapa lama proses, dsb."
3. **Approve workflow**: admin approve PaymentProof → booking.status jadi confirmed, TAPI email receipt + e-ticket belum dikirim. Admin masih harus klik "Confirm Payment & Send Ticket" manual (dan dapat notice "resend" yg misleading karena ini first send).

### Fix 1 — Auto-fill transferDate + transferTime (Fraud Reduction)

**Problem**: field manual = customer bisa salah tulis atau sengaja isi tanggal lama padahal transfer baru dilakukan (misleading audit).

**Fix**: hilangkan 2 field dari form, auto-set di server saat submit.

| File | Perubahan |
|---|---|
| `apps/web/src/pages/api/bookings/[ref]/submit-payment-proof.ts` | Hapus parsing `transferDate` + `transferTime` dari form. Auto-set `transferDate = nowServer.toISOString().slice(0,10)` (UTC) + `transferTime = Intl.DateTimeFormat('id-ID', timeZone:'Asia/Makassar').format(now)` (HH:MM WITA). Hapus 10-line validation block (format + future-date check — tidak perlu karena server-generated). |
| `apps/web/src/pages/payment/[ref].astro` | Hapus grid 2-col transferDate+amount → amount jadi full-width single row. Hapus transferTime input block. Hapus const `todayIso` dari frontmatter. Replace dgn info panel abu-abu: "ℹ Tanggal & jam transfer otomatis — Waktu submit dicatat server (WITA). Pastikan upload setelah transfer berhasil supaya waktu match dgn mutasi bank." |

Field `transferDate` + `transferTime` di `payment-proofs` collection tetap ada — admin bisa lihat waktu customer klik submit. Admin edit view masih bisa modify kalau perlu adjust manual.

### Fix 2 — Post-Payment Journey Success Page

**Problem**: lama hanya 1 card "bukti terkirim" + checklist tapis + CTA ke confirmation (ngarah ke info booking existing yang sudah customer tahu dari email sebelumnya).

**Fix**: rewrite dgn fokus post-payment journey.

| File | Perubahan |
|---|---|
| `apps/web/src/pages/payment/[ref]/success.astro` | Rewrite full. 5 section visual: (1) **Hero success** dgn green checkmark + customer name + booking ref + route + depDate; (2) **Timeline 4-step** visual (bullet-list vertical w/ border-left): ✓ Bukti terkirim (done, green) → ⏳ Admin review 1-24jam (pulse coral) → ⏳ E-ticket+Receipt dikirim ke email (pending slate opacity-70) → ⏳ Hari H keberangkatan (pending slate opacity-50); (3) **FAQ 4 pertanyaan collapsible** (berapa lama verifikasi / kalau ditolak / kapan e-ticket / tidak dapat email); (4) **WhatsApp CTA sekunder** (hanya render kalau env `PUBLIC_ADMIN_WHATSAPP` di-set); (5) **Link kecil tersier** "Lihat detail booking →" (text-xs, bukan button). Footer disclaimer. Gradient background slate→blue-50. Mobile-first. |

Design: button "Lihat halaman booking" dari lama = demoted ke text link tersier (user tidak banyak butuh info itu). Primary attention sekarang di timeline + FAQ.

### Fix 3 — Approve PaymentProof = Auto Send Receipt + E-Ticket

**Problem**: approve hanya set booking.status=confirmed. Admin masih harus klik "Send Ticket" manual = 2-step tidak smooth + resend notice misleading.

**Fix**: hook `pending → approved` branch self-call existing send-ticket endpoint.

| File | Perubahan |
|---|---|
| `apps/cms/src/collections/PaymentProofs.ts` (approve branch di `paymentProofsLifecycleHook`) | Fetch global BookingTemplates → derive `firstBankName` dari `bankAccounts[0].bankName`. Derive `transferDate` dari `doc.transferDate` (auto-set oleh Fix 1). Self-call `POST ${SERVER_URL}/api/bookings/<id>/send-ticket` dgn API-key auth + body `{paymentBank: firstBankName, paymentDate: transferDate}`. Endpoint handle semua: PDF receipt generation, status=confirmed transition, sentTicketAt+By, receiptNumber frozen, email send dgn attachment, idempotency. AdminNotif info "Payment approved & receipt sent" dgn body menyebut receiving bank. **Fail-safe**: kalau self-call gagal (API key kosong, bank kosong, PDF error), set booking.status=confirmed manual + buat AdminNotif **critical** "manual send-ticket required" dgn error detail — admin tahu harus klik Send Ticket manual di edit view. |

**Derivasi `paymentBank`**: pakai first non-empty bank dari `BookingTemplates.bankAccounts`. Pola konsisten dgn send-ticket endpoint existing yg default ke `banks[0]?.bankName` saat preview mode. Admin yg terima pembayaran di bank berbeda bisa edit `booking.paymentBank` manual nanti (field tetap editable di booking edit view).

**Derivasi `paymentDate`**: dari `proof.transferDate` yg sekarang auto-set server (Fix 1) = reliable (bukan customer input).

**Env requirements**:
- `SERVER_URL` (fallback `http://localhost:3030`)
- `PAYLOAD_API_KEY` — same env yg dipakai web→CMS calls

Keduanya sudah ada di dev + prod per existing checkout flow (phase 4.66.8 fail-fast env).

### Impact Flow End-to-End

**Sebelum**:
```
Customer upload bukti (dgn date/time manual, rawan typo)
   → PaymentProof pending
   → Admin approve → booking.confirmed (tapi email belum terkirim)
   → Admin BUKA booking → klik "Confirm Payment & Send Ticket" (manual)
     dgn notice "resend" misleading
   → Email receipt + e-ticket akhirnya terkirim
```

**Sesudah**:
```
Customer upload bukti (hanya 3 field: senderName, bank, amount; date/time auto)
   → Success page: timeline post-payment + FAQ (bukan ngarah ke booking page)
   → PaymentProof pending
   → Admin approve dropdown + Save
   → Hook: derive paymentBank (first) + paymentDate (proof.transferDate)
   → Self-call send-ticket endpoint
     → PDF receipt generated
     → Email terkirim dgn attachment
     → booking.status=confirmed, sentTicketAt, receiptNumber frozen
   → AdminNotif "Payment approved & receipt sent"
   → DONE — 1 klik admin, 0 misleading notice
```

### Testing

#### Programmatic
- [x] TypeScript compile OK.
- [x] CMS hot-reload tanpa error.

#### Pending (butuh real booking + email provider ready)
- [ ] Submit payment proof via form → verify `payment_proofs.transferDate` = tanggal server (bukan yg di-input customer, karena field tidak ada lagi).
- [ ] Verify form upload hanya tampil 3 field required (senderName, senderBank, amount) + file + note opsional + info panel abu-abu.
- [ ] Submit sukses → verify success page baru render dgn timeline + FAQ (bukan page lama).
- [ ] Admin edit PaymentProof → status=approved → Save → cek:
  - [ ] booking.status = confirmed
  - [ ] email customer berisi receipt PDF attached
  - [ ] AdminNotif "Payment approved & receipt sent" muncul (bukan "manual send-ticket required")
  - [ ] booking.receiptNumber + sentTicketAt + paymentBank + paymentDate ter-set
- [ ] Edge: BookingTemplates.bankAccounts kosong → self-call fail → AdminNotif **critical** muncul dgn error detail → booking.status tetap confirmed → admin klik Send Ticket manual works.

### Known Deferred

- **Receiving bank picker di PaymentProof** — kalau admin terima transfer di bank non-first, saat ini harus edit booking.paymentBank manual setelah approve. Nice-to-have: add `receivingBank` select field di PaymentProof (dari BookingTemplates.bankAccounts dropdown) → hook pakai itu alih-alih first bank. Defer sampai user minta.
- **FAQ copy polish** — bisa di-pindah ke global settings supaya admin edit tanpa deploy. Defer.
- **Timeline live update** — saat ini static per-SSR. Bisa ditambah polling status via API supaya kalau admin approve, success page auto-refresh timeline. Defer (customer biasanya tutup halaman setelah lihat).

### Rollback

Revert 4 file:
1. `apps/web/src/pages/api/bookings/[ref]/submit-payment-proof.ts` — restore date/time parsing.
2. `apps/web/src/pages/payment/[ref].astro` — restore 2 form fields + `todayIso`.
3. `apps/web/src/pages/payment/[ref]/success.astro` — restore ke pola 4.74.3 lama.
4. `apps/cms/src/collections/PaymentProofs.ts` — approve branch kembali ke pola 4.74.4 (manual send-ticket).

Zero schema change.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.6b
- [ ] `docs/08-SECURITY-PATCH.md` — tidak perlu update (improvements, bukan security guard baru)

### Next Step

User tolong E2E verify dgn real booking (restart CMS dev jika belum, submit via form, approve → cek email + AdminNotif).
