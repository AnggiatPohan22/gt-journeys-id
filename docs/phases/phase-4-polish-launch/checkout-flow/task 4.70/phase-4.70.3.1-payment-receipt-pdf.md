## Phase: 4.70.3.1 — Payment Receipt PDF

**Tanggal**: 2026-10-14
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Audit**: diskusi delta → final plan di konteks turn sebelum ini

### Konteks

Platform tidak boleh menerbitkan e-ticket resmi — itu urusan operator
ferry. Phase ini kirim **Payment Receipt PDF** sebagai bukti pembayaran
customer, dilampirkan di email "Confirm Payment & Send Receipt". Legally
safer: dokumen keuangan, bukan dokumen perjalanan.

### Runtime verification

CMS deployed to **Cloudflare Workers** via `@opennextjs/cloudflare` →
`pdfkit` (butuh Node streams + fs) ❌. Pakai **`pdf-lib`** ✅ (pure JS,
promise-based, Workers-compatible).

Confirmed via:
- `apps/cms/package.json` deploy script: `next build && opennextjs-cloudflare build && wrangler deploy`
- Dependencies include `@opennextjs/cloudflare`, `@libsql/client`, `wrangler`
- `apps/cms/wrangler.toml` present

### Keputusan Desain (per user approval)

1. **Library**: `pdf-lib` (Workers-compat).
2. **Storage**: stateless (no file saved). Metadata persist di `bookings` (receiptNumber, receiptIssuedAt, paymentDate, paymentBank).
3. **CMS fields** (5): receiptBusinessName (+runtime fallback "GtJourneysID"), receiptAddress, receiptBusinessId (optional), receiptDisclaimerText (+runtime fallback bilingual), receiptFooterNote. No "PT"/legal-entity. No signature.
4. **Bank**: admin picks dari global `bankAccounts` dropdown; required; default first entry.
5. **No signature**.
6. **File name & receipt number**: `RCPT-{bookingRef}-{YYYYMMDD(Asia/Makassar)}`. Issue date FROZEN first-issue.
7. **Attach only to "Confirm Payment"** email.
8. **No inline PDF preview** in CMS (indicator only).

Additional:
- UI label: "Confirm Payment & Send Ticket" → "Confirm Payment & Send **Receipt**".
- Endpoint route `send-ticket` **tetap** (technical debt noted).
- PDF NOT show: admin verifier, customer country, customer WhatsApp. Admin verifier in internal `sentTicketBy` only.
- PDF-fail resilient: generate → send email → update status. If PDF fail, email tetap kirim (dengan wording "receipt akan dikirimkan menyusul"), status tetap `confirmed`, admin bisa retry.
- Non-Latin names: sanitize NFKD + strip diacritics + replace >0xFF dengan `?`.

### Perubahan

#### 1. Schema (migration `20261015_100000_phase_4_70_3_1_payment_receipt.ts`)

**`bookings` × 4 kolom** (nullable, hidden):
- `receipt_number` — frozen first-issue
- `receipt_issued_at` — frozen first-issue (ISO)
- `payment_date` — admin pick (overwritable on resend)
- `payment_bank` — admin pick (overwritable on resend)

**`booking_templates` × 5 kolom** (nullable):
- `receipt_business_name`, `receipt_address`, `receipt_business_id`
- `receipt_disclaimer_text`, `receipt_footer_note`

**Wording migration (conditional UPDATE)**: 5 field (ticket subject + hero × 2 + body + wa) di-replace **hanya kalau value = old default** atau NULL. Admin-customized values TIDAK disentuh.

Down migration: reverse wording + drop columns.

#### 2. PDF generator (`apps/cms/src/lib/receiptPdf.ts`) — NEW

Pure function `generatePaymentReceipt(ctx) → Uint8Array` pakai pdf-lib.

Helpers:
- `sanitizeForPdfText(str)`: preserve `\n`, strip C0/C1 controls, NFKD strip diacritics, replace char >0xFF dengan `?`, collapse 3+ newlines ke 2.
- `getMakassarYYYYMMDD(d)`: `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' })` → `YYYYMMDD`.
- `formatDateMakassar(iso)`: `"15 Oct 2026"` di Asia/Makassar.
- `wrapText(text, font, size, maxWidth)`: manual word wrap pakai `font.widthOfTextAtSize`, respect existing newlines.
- `ensureSpace(state, required, continuationLabel)`: auto-add page kalau yCursor + required > bottom margin. Multi-page passenger list.
- Draw helpers: `drawText`, `drawTextWrapped`, `drawHRule`, `drawSectionTitle`, `drawLabelValue`, `drawDisclaimerBox`.

WinAnsi safety:
- Default Helvetica + HelveticaBold (built-in standard fonts).
- Zero emoji di PDF code (semua teks ASCII/Latin-1).
- "→" diganti `->` di route display.
- "⚠" diganti teks bold `DISCLAIMER`.

#### 3. sendEmail extension (`apps/cms/src/lib/sendEmail.ts`)

Tambah `attachments?: SendEmailAttachment[]` param. Forward ke Resend `attachments: [{ filename, content, content_type? }]`.

#### 4. sendTicketEndpoint refactor (`apps/cms/src/collections/Bookings.ts`)

Perubahan utama:
- Accept body: `{ previewOnly, paymentBank, paymentDate }`.
- Validate (non-preview):
  - `bankAccounts.length > 0` → else `400`.
  - `paymentBank` ∈ `bankAccounts[*].bankName` → else `400`.
  - `paymentDate` non-empty + `<=` today(Asia/Makassar) → else `400 payment_date_future`.
- Allow `fromStatuses = ['payment_review', 'awaiting_payment', 'confirmed']`.
- Receipt metadata: reuse existing `receiptNumber` + `receiptIssuedAt` kalau sudah set (resend); compose fresh kalau first send.
- Generate PDF via `generatePaymentReceipt`:
  - Pass semua ctx (business info, booking, passenger list, payment info, disclaimer, footer).
  - Fallback runtime: `receiptBusinessName` → "GtJourneysID", `receiptDisclaimerText` → default bilingual.
  - On exception: `pdfError` logged, `pdfBytes = null`, continue flow.
- Inject `receiptAttachedNote` ke email ctx — success/failed variant.
- Send email (with/without PDF attachment).
- Email fail → return 502, status NOT updated. Admin retries.
- Email OK → update booking: status=confirmed, receiptNumber, receiptIssuedAt (frozen if existing), paymentBank, paymentDate, sentTicketAt (frozen if resend), sentTicketBy (frozen if resend).
- Response: `{ ok, newStatus, receiptNumber, warning? }` — warning kalau PDF failed.
- Idempotency key per-attempt: `ticket:${bookingRef}:${Date.now()}` → Resend tidak dedup → PDF retry delivers.

Helper `uint8ArrayToBase64` (chunked `String.fromCharCode` + global `btoa`) untuk encode PDF ke base64 di Workers runtime.

#### 5. BookingAdminActions modal (`apps/cms/src/admin/BookingAdminActions.tsx`)

- Label `ticket` kind: "Confirm Payment & Send Receipt".
- Modal buka → fetch `/api/globals/booking-templates?depth=0` untuk ambil `bankAccounts`.
- UI inputs:
  - Dropdown "Payment Bank" (populated dari bankAccounts, options show "BankName — Holder (Account)").
  - Date picker "Payment Date" (`max` = today).
  - Warning banner amber: "⚠ Pastikan customer sudah transfer sebelum confirm. Pilih bank penerima + tanggal transfer di bawah."
  - Error box kalau `bankAccounts.length === 0`.
- Preview on-demand (button disabled kalau bank/date kosong).
- Success section: display `receiptNumber.pdf` kalau sent.
- Warning badge kalau response `warning` (PDF failed).

Preview response includes `receiptPreview: { number, willAttachPdf, paymentBank, paymentDate }` untuk indicator di UI.

#### 6. Template defaults (`apps/cms/src/globals/bookingTemplatesDefaults.ts`)

Updated:
- `ticketHeroHeadline`: "Your ferry ticket is confirmed!" → "Pembayaran dikonfirmasi — payment receipt terlampir".
- `ticketHeroSubtext`: baru mention receipt + tiket resmi dari operator.
- +5 receipt field defaults.
- +2 helpers: `receiptAttachedNoteSuccess`, `receiptAttachedNoteFailed` — in-memory only (bukan CMS field), dipakai saat endpoint inject ctx.

Default disclaimer **bilingual** (ID + EN).

#### 7. BookingTemplates (`apps/cms/src/globals/BookingTemplates.ts`)

- `ticketEmailSubject` default: pakai wording receipt baru.
- `ticketEmailBody` default: tambah `{{receiptAttachedNote}}` block + wording "tiket resmi oleh operator".
- `ticketWhatsappBody` default: tambah `{{receiptAttachedNote}}` + wording.
- Tab baru **"Receipt / Bukti Pembayaran"** di antara "Cancellation Response" dan "Bank Accounts" — 5 fields (semua super-admin editable).

#### 8. templateRenderer (`apps/cms/src/lib/templateRenderer.ts`) — minimal

+1 var `receiptAttachedNote` di KNOWN+OPTIONAL. Receipt business/address/dll fields TIDAK masuk templateRenderer (dibaca langsung dari `tpl` object di `receiptPdf.ts`). File `apps/web/src/lib/checkout/templateRenderer.ts` **tidak disentuh**.

#### 9. Dependency

`apps/cms/package.json` +`pdf-lib ^1.17.1`. Installed via `pnpm install`.

### File yang Berubah

| # | File | Status |
|---|------|--------|
| 1 | `apps/cms/src/migrations/20261015_100000_phase_4_70_3_1_payment_receipt.ts` | NEW (9 ADD COLUMN + 5 UPDATE conditional) |
| 2 | `apps/cms/src/migrations/index.ts` | modify (register) |
| 3 | `apps/cms/src/collections/Bookings.ts` | +4 hidden fields, sendTicketEndpoint rewrite |
| 4 | `apps/cms/src/globals/BookingTemplates.ts` | +Receipt tab (5 fields), update ticket default wording + add `{{receiptAttachedNote}}` reference |
| 5 | `apps/cms/src/globals/bookingTemplatesDefaults.ts` | +receipt defaults (bilingual disclaimer), update ticketHero defaults, +receiptAttachedNoteSuccess/Failed |
| 6 | `apps/cms/src/lib/receiptPdf.ts` | NEW (generator + sanitizer + wrap + multi-page) |
| 7 | `apps/cms/src/lib/templateRenderer.ts` | +receiptAttachedNote ke KNOWN+OPTIONAL |
| 8 | `apps/cms/src/lib/sendEmail.ts` | +attachments param |
| 9 | `apps/cms/src/admin/BookingAdminActions.tsx` | +bank dropdown + date picker + warning + receipt indicator |
| 10 | `apps/cms/package.json` | +pdf-lib |

### Testing

```
1. Install deps + migration:
   pnpm install
   pnpm --filter cms payload migrate
2. Restart CMS dev.

3. CMS Setup:
   Globals → Booking Templates → tab "Receipt / Bukti Pembayaran":
   - receiptBusinessName: biarin blank → verify runtime fallback "GtJourneysID"
   - receiptAddress: "Jl. Contoh No. 123, Jakarta"
   - receiptBusinessId: biarin kosong (optional)
   - receiptDisclaimerText: biarin blank → verify runtime fallback bilingual
   - receiptFooterNote: "Terima kasih telah mempercayakan..."
   Globals → Booking Templates → tab "Bank Accounts":
   - Tambah minimal 1 bank (BCA, holder, account number)

4. SKENARIO A — Happy path:
   - Buat booking test → payment_review.
   - CMS → booking → "Confirm Payment & Send Receipt" button.
   - Modal: bank dropdown populated, date = today, preview button enabled.
   - Pilih BCA, date today → Preview → cek:
     - Email subject: "Booking ... Dikonfirmasi — Payment Receipt Terlampir"
     - Email body: mention receipt attached (success wording)
     - Receipt PDF indicator: "📎 Attached: RCPT-FT-...-20261015.pdf"
   - Confirm & Send → cek email customer:
     - PDF attached, open di viewer → semua section render:
       header (business name/address), title "BUKTI PEMBAYARAN - PAYMENT RECEIPT",
       customer (name+email, NO WA/country), booking detail, passenger list,
       pembayaran (BCA, today, total), DISCLAIMER (bilingual boxed), footer note.
   - Status booking → confirmed.

5. SKENARIO B — PDF fail then resend delivers PDF:
   - Simulasi: hapus field receiptBusinessName & receiptDisclaimerText (should fallback runtime OK).
   - Alternative simulate failure: temporarily corrupt pdf-lib import, atau pass invalid data.
   - Admin "Confirm & Send" → email terkirim tanpa attachment, status confirmed, response warning.
   - Cek email: wording receipt "akan dikirimkan menyusul" (BUKAN "terlampir").
   - Fix issue → admin klik "Confirm Payment & Send Receipt" lagi (status sekarang 'confirmed').
   - Modal buka ulang; pilih bank + date; Preview → Send.
   - Email baru terkirim DENGAN PDF (receiptNumber + receiptIssuedAt sama dengan send pertama).

6. SKENARIO C — Long passenger list (2nd page):
   - Buat booking dengan 10+ passengers.
   - Send receipt → PDF 2 halaman, halaman 2 mulai dengan "Continued - Passenger List (page 2)".

7. SKENARIO D — Non-Latin names + newlines in textarea:
   - Passenger name: "José María Nuñez"
   - receiptAddress: multi-line (3 baris pakai \n)
   - Send → PDF tidak crash, nama tampil "Jose Maria Nunez" (diacritic stripped),
     alamat wrap sesuai layout.

8. SKENARIO E — Validation errors:
   - bankAccounts kosong → modal show error, Preview disabled.
   - paymentDate kosong → Preview button disabled.
   - paymentDate = besok → server reject 400 "Tanggal pembayaran tidak boleh di masa depan."
   - paymentBank bukan dari list → 400.

9. SKENARIO F — Resend from confirmed:
   - Booking status=confirmed (dari send sebelumnya).
   - Admin klik "Confirm Payment & Send Receipt" lagi → modal buka.
   - Edit paymentDate (koreksi), click Confirm & Send.
   - Email terkirim lagi (Resend tidak dedup karena idempotency key per-timestamp).
   - receiptNumber tetap, receiptIssuedAt tetap (frozen).
   - paymentDate di DB terupdate ke nilai baru.

10. SKENARIO G — Migration:
    - Up: 9 ADD COLUMN, 5 UPDATE conditional only replace defaults.
    - Down: reverse UPDATEs + DROP COLUMNS → verify tidak corrupt data existing.

11. SKENARIO H — Wording migration (admin-customized protection):
    - Admin edit ticketEmailSubject custom (bukan default).
    - Re-run migration up → cek value admin TIDAK berubah.
```

### Impact

- **Database**: +9 kolom nullable (4 bookings + 5 booking_templates). 5 conditional UPDATE.
- **CMS**: +1 helper module (receiptPdf.ts, ~400 LoC), endpoint rewrite, modal input UI, +Receipt tab (5 fields).
- **Frontend web**: zero (templateRenderer di apps/web TIDAK disentuh).
- **Dependency**: +`pdf-lib@^1.17.1` di apps/cms.
- **Env**: zero.
- **Deploy needed**: **cms only**.
- **Breaking**: UI label change ("Send Ticket" → "Send Receipt"). Endpoint path unchanged (`send-ticket` → technical debt).

### Known Limitations

- **WinAnsi encoding**: default Helvetica tidak support karakter > 0xFF. Non-Latin names disanitasi (diacritic stripped). Future upgrade: embed TTF (Jakarta Sans / Noto) via R2 fetch at request-time.
- **No inline PDF preview di CMS**: admin cek dengan send test ke email sendiri atau unduh dari email client.
- **No "Download Receipt" button**: future feature. MVP cuma attach ke email.
- **No customer self-download URL**: future (butuh web endpoint + token).
- **Resend attachment base64 size**: Resend limit 40MB email total. Receipt ~50-200KB — comfortably under.
- **Admin verifier**: `sentTicketBy` tetap di-persist (audit trail) tapi TIDAK ditampilkan di PDF per policy.
- **Technical debt**: endpoint route `send-ticket` tidak di-rename ke `send-receipt`. Follow-up phase bisa rename kalau mau full consistency.
- **Web wording**: `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` masih punya beberapa referensi "e-ticket" di copy customer. List untuk admin edit manual:
  - Line 249: `"Booking confirmation & e-ticket delivery"` → `"Booking confirmation & payment receipt"`
  - Line 445: `"...payment instructions, and your e-ticket once payment is received."` → `"...payment instructions, and a payment receipt (PDF) once payment is confirmed. The official ferry ticket is issued by the operator at check-in."`
  - Line 423: "accessible to our admin for ticket issuance" → OK (factual context operator).
  - Lines 482, 835: "Official partner tickets"/"Official Tickets" → OK (refers to legit operator tickets).
  Admin boleh edit manual kapan saja (tidak blocking).

### Phase 4.70.3.2 + 4.70.3.3 — DEFERRED

- **4.70.3.2 Upload operator e-ticket per booking** — tunggu format resmi dari operator.
- **4.70.3.3 Voucher PDF** — hanya kalau operator mengizinkan.
