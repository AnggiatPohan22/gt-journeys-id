# Booking UI Redesign — Design Brief (Stage 3)

**Branch:** `feat/booking-ui-redesign`
**Status:** DRAFT — menunggu approval user sebelum ke step 3.1.
**Scope:** Hanya UI admin CMS untuk collection `bookings`. **Zero schema change, zero endpoint change, zero access-rule change** (semua access guard sudah selesai di Stage 2).

> Dokumen ini adalah **brief**, bukan implementasi. Code mulai di 3.1 setelah user setujui layout + masking rules di sini.

---

## 1. Konteks & tujuan

Stage 2 sudah mengunci data integrity di server (field access, audit hook). Stage 3 melengkapi dari sisi UX:

1. **Privacy by default di list view** — PII (passport, email, WhatsApp, token) tidak boleh terlihat sekilas oleh admin yang hanya scroll table.
2. **Reduce human error** — aksi destruktif / high-impact (edit `departureDate` setelah confirmed, un-check `hasRequestedChange`, delete booking, resend receipt dengan ubah bank/tanggal) wajib confirm dulu.
3. **Clarity di detail view** — field booking sekarang ~40 item flat; group ke 4 section membuat admin lebih cepat menemukan field yang relevan.
4. **Resend expectation** — admin saat ini bisa "Confirm Payment & Send Receipt" lagi pada booking status `confirmed` tanpa warning yang jelas bahwa customer akan menerima email receipt kedua. 3.5 fix ini.

Target: admin biasa + super-admin. Editor tidak melihat collection ini sama sekali (sudah di-hide).

---

## 2. Masalah UI saat ini (observed)

Dibaca dari `apps/cms/src/collections/Bookings.ts` + `apps/cms/src/admin/*`:

### 2.1 List view (`defaultColumns`)
```
['bookingRef', 'serviceType', 'status', 'channel', 'customerName', 'departureDate', 'createdAt']
```
Tidak ada PII di default columns — bagus. **Tapi:**
- `accessToken` muncul di cell default kalau admin add column; nilai 128-bit plaintext.
- `customerEmail`, `customerWhatsapp`, `contactPhone`, `passportNumber` juga plaintext kalau admin add column.
- Belum ada cell custom untuk masking apapun kecuali `StatusCell`, `PriceCell`, `RelativeDateCell`.

### 2.2 Detail view
~40+ fields flat (tanpa pengelompokan di top-level) di urutan: `requestAlert`, `adminActions`, `bookingRef`, `accessToken`, `serviceType`, `ferryTicket`, customer row, passengers array (collapsible), departure row, origin/destination, scheduleTimeLabel, ferry class, return trip collapsible, pricing row, status, channel, channelData, expiresAt, 5 customer-request fields (hidden), 4 original-* fields (hidden), 2 receipt fields (hidden), paymentDate (hidden), paymentBank (hidden), Admin Handoff Audit (collapsible).

Masalah:
- `accessToken` plaintext di edit view, no copy/reveal pattern.
- Admin yang baru susah tahu field mana yang auto-generated vs manual-input.
- Hidden fields (receipt, paymentDate/Bank, customerRequest*, originalDeparture*) sebenarnya informatif saat super-admin troubleshoot — layak di-group sendiri yang collapsed default.

### 2.3 Risky actions tanpa confirm
- Edit `departureDate` setelah status `confirmed` → langsung ke-save, trigger audit log, tapi tanpa warning "ini akan terlihat di audit trail + mungkin bentrok sama tiket yang sudah dikirim."
- Un-check `hasRequestedChange` → silent save; sengaja ada untuk exceptional case tapi tidak explain konsekuensi (customer bisa submit request lagi).
- Delete booking (super-admin only, lewat 3-dots menu) → tombol native Payload, no extra confirm.
- Modal "Confirm Payment & Send Receipt" sudah ada warning saat status `confirmed` (lihat `bk-modal__warning--resend` di `BookingAdminActions.tsx:383`), **tapi** warning hanya 1 baris, tidak nyebut `receiptNumber`/`receiptIssuedAt` **frozen** dan customer akan menerima email kedua. 3.5 perkuat ini.

---

## 3. Proposed design — List view

### 3.1 accessToken cell (step 3.1)
- **Default render:** `••••••••••••cd4a` (12 dots + 4 digit terakhir, monospace).
- **Click-to-reveal:** klik cell → nilai penuh muncul (toggle, bukan permanent). Reveal state **local** ke row, tidak persist antar reload.
- **Copy button:** icon kecil di sebelah value, salin full token ke clipboard (bukan masked). Pakai `navigator.clipboard.writeText`.
- **No telemetry:** jangan log kapan admin reveal.
- **Fallback:** kalau JS disabled, tetap tampilkan masked (`••••cd4a`), tanpa reveal.

### 3.2 List masking cells (step 3.2)
Field yang di-mask di list view (tapi tetap full di detail view):

| Field | List render | Detail render |
|---|---|---|
| `customerEmail` | `j••@gmail.com` (char pertama + domain penuh) | penuh |
| `customerWhatsapp` | `+62•••••••42` (region code + last 2 digit) | penuh |
| `contactPhone` | sama pola seperti whatsapp | penuh |
| `passengers[].passportNumber` | tidak di-expose di list cell (passenger array tidak muncul di list) — N/A | last 4 only via existing admin description note |
| `accessToken` | ditangani 3.1 | penuh via reveal |

**Note:** `customerName` tidak di-mask — admin perlu nama untuk recognize booking saat triage. Konsisten dengan audit rec (data minimization: nama booking sudah public di bukti transfer / tiket).

### 3.3 Default columns tidak berubah
Tetap `['bookingRef', 'serviceType', 'status', 'channel', 'customerName', 'departureDate', 'createdAt']`. Admin yang add column PII akan dapat masked version.

---

## 4. Proposed design — Detail view (step 3.3)

Grouping dengan `tabs` (atau `collapsible` kalau tabs clash sama existing `requestAlert` + `adminActions` yang harus tetap di paling atas). **Rekomendasi: pakai `collapsible` groups**, karena 2 UI fields di atas (banner + action buttons) harus selalu visible dan tabs akan menyembunyikannya.

### Order final (top → bottom)
1. **`requestAlert`** (UI, existing banner — unchanged)
2. **`adminActions`** (UI, existing action buttons — unchanged)
3. **`bookingRef`** + **`accessToken`** + **`serviceType`** + **`tripType`** (sidebar) — identitas booking, tidak di-group.
4. **Collapsible: "Customer"** (initCollapsed: false)
   - customerName / customerEmail row
   - contactPhoneRegion / contactPhone / contactPhoneIsWhatsapp row
   - customerWhatsapp / customerCountry row
   - customerNotes
   - **Passengers array** (sudah initCollapsed: false — tetap)
5. **Collapsible: "Trip"** (initCollapsed: false)
   - ferryTicket relationship
   - departureDate / adults / children row
   - originLocation / destinationLocation
   - scheduleTimeLabel
   - ferryClassName / ferryClassType
   - Return Trip (existing collapsible, nested — tetap)
6. **Collapsible: "Pricing"** (initCollapsed: false)
   - unitPrice / currency / totalEstimate
7. **Collapsible: "Payment"** (initCollapsed: true) — un-hide 4 field yang sekarang `hidden: true` tapi tetap `readOnly: true` di admin UI (data integrity sudah di server via Step 2.1):
   - receiptNumber
   - receiptIssuedAt
   - paymentDate (editable — ada warning via 3.4 modal)
   - paymentBank (editable — ada warning via 3.4 modal)
8. **Collapsible: "Request History"** (initCollapsed: true) — un-hide customerRequest* + original* + preRequestStatus + hasRequestedChange:
   - customerRequestKind / customerRequestedAt (readOnly)
   - customerRequestReason (readOnly)
   - originalDepartureDate / originalScheduleTimeLabel (readOnly)
   - preRequestStatus (readOnly)
   - hasRequestedChange (checkbox — editable super-admin, confirm modal via 3.4)
9. **Admin Handoff Audit** (existing collapsible — tetap)
10. **Sidebar** (tetap): status, channel, tripType, expiresAt

**Keputusan masking di detail view:** full values. Admin yang buka detail view sudah intend untuk kerja dengan booking tsb; masking di detail = friction tanpa benefit.

**Scope guard:** semua existing field, access rule, dan hook tetap. Ini **re-arrangement** + un-hide beberapa field — tidak boleh ada perubahan `access`, `required`, `validate`, atau default value.

---

## 5. Confirmation modals (step 3.4)

Pakai pattern `bk-modal` yang sudah ada di `BookingAdminActions.tsx` (header + body + footer, backdrop click close). 4 modal baru:

### 5.1 Edit `departureDate` saat status ∈ {confirmed, reschedule_request, cancel_request}
- **Trigger:** `beforeChange` field-level hook? → tidak bisa trigger modal dari server. **Pakai custom field component** untuk `departureDate` yang intercept onChange: kalau `status` existing ∈ gate dan nilai berubah, show modal.
- **Modal content:**
  - Title: "Ubah tanggal keberangkatan?"
  - Warning: booking sudah `{status}`. Perubahan akan ter-audit (lihat Payment Audit Log). Customer **tidak** otomatis diberitahu — kirim notifikasi manual via resend receipt kalau perlu.
  - Buttons: `Batal` / `Lanjut ubah`.
- Kalau user cancel → revert field value ke previous.

### 5.2 Un-check `hasRequestedChange`
- **Trigger:** field component custom pada checkbox, atau wrap existing field dengan `Field` custom component.
- **Modal content:**
  - Title: "Reset flag request change?"
  - Warning: setelah uncheck, customer bisa submit permintaan reschedule/cancel baru dari halaman confirmation. Flag ini default sengaja one-shot untuk cegah spam.
  - Buttons: `Batal` / `Reset flag`.

### 5.3 Delete booking (super-admin only)
- Payload default sudah ada confirm dialog native. **Tambah custom confirm** via `admin.components.beforeDocumentControls`? → riskan, Payload API bisa berubah.
- **Alternative yang aman:** tambah `admin.description` di collection level yang nampilkan ikon ⚠ + warning text, tapi tidak override delete button. **Rekomendasi: SKIP di 3.4** — Payload native confirm sudah cukup, dan super-admin dianggap trusted (konsisten dengan finding #8 "admin trusted" yang di-accept). Document decision di phase report.

### 5.4 Resend receipt (step 3.5 — related to 3.4)
Modal existing di `BookingAdminActions.tsx:383` (`bk-modal__warning--resend`). Enhance isi warning saja (lihat §6 di bawah).

---

## 6. Resend notice copy (step 3.5)

Modify warning banner di `bk-modal__warning--resend` (BookingAdminActions.tsx:383). Target state:

```
⚠ RESEND NOTICE — booking sudah confirmed.

Mengirim ulang akan:
  • Kirim email receipt kedua ke customer ({customerEmail}).
  • Pakai receiptNumber yang SAMA ({receiptNumber}) dan tanggal issue
    yang SAMA ({receiptIssuedAt}). Tidak ada receipt baru dibuat.
  • Append entry ke Payment Audit Log kalau Payment Bank / Payment Date
    diubah di modal ini.

Lanjutkan hanya kalau customer memang perlu salinan ulang.
```

Nilai `{customerEmail}`, `{receiptNumber}`, `{receiptIssuedAt}` dari form state (sudah tersedia di component via `useFormFields` / props).

Juga: tombol primary `Send Receipt` → rename ke `Send Receipt (Resend)` saat status `confirmed` untuk clarity.

---

## 7. Per-role visibility matrix

Semua masking + modal berjalan sama untuk admin dan super-admin — tidak ada role gating di UI layer (role gating sudah di server access rules). Visibility reminder:

| Resource | editor | admin | super-admin |
|---|---|---|---|
| Collection visible | ❌ (hidden) | ✅ | ✅ |
| List view | ❌ | ✅ (masked PII) | ✅ (masked PII) |
| Detail view | ❌ | ✅ (full PII) | ✅ (full PII) |
| Edit passport dates | ❌ | ❌ (locked, Stage 2.2) | ✅ |
| Edit receiptNumber / Issued / Audit | ❌ | ❌ (locked, Stage 2.1) | ❌ (locked, Stage 2.1) |
| Delete | ❌ | ❌ | ✅ |
| Reveal accessToken di list | — | ✅ (client-side) | ✅ (client-side) |

---

## 8. Files to change per step

Semua file sudah ada; **tidak ada file baru** kecuali cell components masking (3 file baru di `admin/cells/`).

### 8.1 — accessToken cell
- **NEW:** `apps/cms/src/admin/cells/AccessTokenCell.tsx` (mask + reveal + copy)
- **EDIT:** `apps/cms/src/collections/Bookings.ts` — tambah `admin.components.Cell` pada field `accessToken` (~line 1499).
- **EDIT:** `apps/cms/src/admin/admin-global.css` (atau file CSS yang relevan) — style untuk reveal/copy button.

### 3.2 — List masking
- **NEW:** `apps/cms/src/admin/cells/MaskedEmailCell.tsx`
- **NEW:** `apps/cms/src/admin/cells/MaskedPhoneCell.tsx` (reusable untuk `customerWhatsapp` + `contactPhone`)
- **EDIT:** `apps/cms/src/collections/Bookings.ts` — tambah `admin.components.Cell` pada `customerEmail`, `customerWhatsapp`, `contactPhone` (~row ~1568-1588).

### 3.3 — Detail layout
- **EDIT:** `apps/cms/src/collections/Bookings.ts` — bungkus field groups dengan `collapsible` wrapper type. Un-hide 4 payment fields + 7 request-history fields (ubah `admin.hidden: true` → remove). Pertahankan `admin.readOnly` untuk audit fields.
- **No new files.**

### 3.4 — Confirmation modals
- **NEW:** `apps/cms/src/admin/fields/DepartureDateWithConfirm.tsx` (wraps date field, intercepts change saat status gated).
- **NEW:** `apps/cms/src/admin/fields/HasRequestedChangeWithConfirm.tsx` (wraps checkbox).
- **EDIT:** `apps/cms/src/collections/Bookings.ts` — set `admin.components.Field` pada `departureDate` dan `hasRequestedChange`.
- **EDIT:** CSS untuk modal (reuse `bk-modal` dari existing).

### 3.5 — Resend notice
- **EDIT ONLY:** `apps/cms/src/admin/BookingAdminActions.tsx` — enhance text di `bk-modal__warning--resend` block, rename tombol kalau status confirmed.
- **No new files.**

---

## 9. Out of scope (tegas)

Tidak dikerjakan di Stage 3; kalau user mau, buat Stage lain:

- Server-side rate limit admin requests (finding #8 — accepted).
- 2FA super-admin (finding #17 — post-launch).
- Logging + alert kalau accessToken di-reveal (overkill; admin trusted).
- Reset accessToken button (butuh keputusan: apakah invalidate URL yang sudah dikirim ke customer? Terlalu banyak side-effect — defer).
- Perubahan email template receipt (bukan admin UI).
- UI untuk customerRequestReason display sebagai Markdown (saat ini raw text — sudah OK, finding #21 accepted).

---

## 10. Testing per step (preview)

Setiap step punya smoke test manual yang detail di phase report-nya; preview:

- **3.1:** list view, add `accessToken` column → masked. Click → reveal. Click copy → clipboard berisi full token. Reload → masked lagi.
- **3.2:** list view, add email/WA/phone columns → masked. Detail view → full. Super-admin flow sama (role tidak influence masking).
- **3.3:** detail view booking existing (status `confirmed`) → semua existing field tetap accessible, group section bisa dibuka/collapsed, no field removed. Save tanpa edit → tidak ada diff (hook tidak trigger).
- **3.4:** booking `confirmed`, ubah `departureDate` → modal muncul. Cancel → field revert. Confirm → save + audit log entry (dari Stage 2.3 hook). Un-check `hasRequestedChange` → modal muncul.
- **3.5:** booking `confirmed`, buka modal "Confirm Payment & Send Receipt" → warning banner mention customerEmail + receiptNumber + receiptIssuedAt + mention bahwa receipt stays the same. Tombol labeled "Send Receipt (Resend)".

---

## 11. Commit plan

5 commit terpisah, masing-masing self-contained (bisa rollback independen):

1. `[feat] Step 3.1 — AccessToken cell: mask + click-to-reveal + copy`
2. `[feat] Step 3.2 — List view masking for email, WhatsApp, phone`
3. `[refactor] Step 3.3 — Group detail view into Customer/Trip/Payment/History sections`
4. `[feat] Step 3.4 — Confirmation modals for departureDate edit + hasRequestedChange reset`
5. `[ux] Step 3.5 — Explicit resend notice with receipt immutability callout`

Semua commit end dengan trailer `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.

Setiap commit = 1 phase report di `docs/phases/phase-4-71-N.md` + update `docs/security-followups.md` + update `docs/08-SECURITY-PATCH.md` (series row untuk Stage 3) + update tracker di `docs/security-hardening-playbook.md` §2.

---

## 12. Pertanyaan untuk user (approve dulu sebelum 3.1)

1. **Grouping style di 3.3** — `collapsible` groups (rekomendasi saya; preserve `requestAlert` + `adminActions` di atas) atau pakai `tabs` top-level (lebih rapi tapi harus pindahkan 2 UI field)?
2. **`customerName` masking di list** — tetap full (rekomendasi) atau mask juga?
3. **Delete booking confirm (5.3)** — skip custom confirm (rekomendasi: pakai Payload native) atau tetap kerjakan?
4. **AccessToken reveal timeout** — reveal permanent sampai click lagi (rekomendasi), atau auto re-mask setelah 10 detik?
5. **Un-hide payment & request-history fields di 3.3** — approve? (Konsekuensi: admin biasa jadi bisa lihat `receiptNumber`, `paymentDate`, dsb. — read-only, tapi informasi sensitif soal transaksi.)

Setelah approve 5 keputusan di atas (atau redirect kalau pilih option lain), saya mulai step 3.1.
