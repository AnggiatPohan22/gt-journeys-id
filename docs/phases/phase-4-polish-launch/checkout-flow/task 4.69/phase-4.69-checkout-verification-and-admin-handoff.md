## Phase: 4.69 — Checkout Verification + Admin-Triggered Payment Handoff (ANALYSIS ONLY)

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: 📋 ANALISA — belum dieksekusi (menunggu approval owner)
**Dikerjakan oleh**: Claude Code (Opus 4.7)

> ⚠️ Dokumen ini **analisa + rekomendasi**, bukan phase report eksekusi. Report
> eksekusi (dengan tabel file berubah, migration, testing) akan dibuat
> per-sub-phase saat masing-masing di-approve. Lihat §9 untuk rencana
> breakdown sub-phase.

---

### 1. Konteks & Masalah yang Mau Dipecahkan

Flow checkout Ferry Ticket saat ini (sampai Phase 4.67.2g):

```
Customer                                    Admin
───────────────────────────────────────────────────────────────────
1. Isi form checkout (contact + passengers)
2. Submit → Booking row dibuat di CMS (status=pending, channel=manual_wa)
3. Lempar ke confirmation page + tombol "Kirim ke WhatsApp"
4. Customer klik → buka wa.me/<admin-no> dengan pesan ringkas
                                            5. Admin terima pesan WA
                                            6. Admin cek CMS, confirm, hitung harga
                                            7. Admin balas manual: invoice + instruksi bayar
```

**Dua masalah utama** yang user mau selesaikan di Phase 4.69:

**A. Verifikasi kontak lemah.**
Email + nomor WhatsApp = kanal penyampaian invoice + e-ticket. Saat ini
hanya validasi *format* (regex email + length digit phone). Customer bisa
typo (`anggi@gmial.com`, nomor WA kurang 1 digit) → admin kirim invoice
ke alamat yang tidak akan sampai → booking stuck pending → revenue loss +
support cost. Begitu juga passport number penumpang: typo di `A1234567`
berarti saat check-in ferry nama tidak match passport → penumpang
ditolak boarding. Pekerjaan admin untuk re-verifikasi lewat WA = friction
yang sebaiknya di-shift ke customer *saat dia masih di form*.

**B. Flow handoff via wa.me rapuh.**
Model sekarang mengandalkan **customer memulai percakapan ke WA admin**.
Problem konkret:
- Kalau customer tidak klik tombol / lupa / buka di PC tanpa WA Desktop
  → admin tidak tahu ada booking baru (harus polling CMS).
- Pesan WA di-generate dari browser → customer bisa edit sebelum kirim →
  bookingRef bisa salah ketik.
- URL `wa.me/?text=...` masuk history + referrer → sejak Phase 4.66.10
  (S-13) kita sudah ramping-kan pesan ini (buang email/notes/passport),
  tapi tetap mengekspos nama + ref + rute ke browser history.
- Admin tidak kontrol **kapan** invoice dikirim. Idealnya admin
  dulu *verifikasi tanggal + ketersediaan ferry + ketersediaan kelas*
  SEBELUM invoice dikirim ke customer (menghindari refund saat tanggal
  ternyata full).

**Target state:**

```
Customer                                    Admin
───────────────────────────────────────────────────────────────────
1. Isi form checkout
   - Verifikasi email (OTP) ✦ baru
   - Verifikasi WA number (OTP) ✦ baru
   - Validasi passport inline ✦ baru
2. Submit → Booking row dibuat (status=awaiting_review)
3. Lempar ke confirmation page: "Terima kasih,
   admin sedang verifikasi, invoice akan dikirim ke
   email + WA dalam [X jam]"
                                            4. Admin lihat queue "Awaiting Review" di CMS
                                            5. Admin verifikasi: tanggal, kuota, pricing
                                            6. Admin klik tombol "Send Payment Instructions"
                                            7. CMS kirim WA + Email otomatis dari template
                                               (template editable di Global settings)
                                            8. Status booking → awaiting_payment
9. Customer terima pesan di WA + email
10. Customer bayar
                                            11. Admin konfirmasi payment
                                                → status=confirmed, kirim e-ticket (template kedua)
```

Admin sekarang **tidak lagi perlu menyusun pesan WA manual**. Pekerjaan
admin disempitkan ke: *review*, *klik kirim*, *konfirmasi payment*.
Juga buka jalan untuk re-schedule / cancel request dari customer (lihat §6).

---

### 2. Breakdown Permintaan User

| # | Permintaan | Kategori |
|---|---|---|
| R1 | Verifikasi nomor WhatsApp benar/aktif | Contact verification |
| R2 | Verifikasi email benar/aktif | Contact verification |
| R3 | Validasi inline di form passenger data (nomor passport tertera) | Form validation |
| R4 | **Masukan**: perlukah verifikasi lebih untuk passenger data? | Owner decision — rekomendasi di §5 |
| R5 | Data langsung masuk CMS **tanpa** customer kirim WA | Flow redesign |
| R6 | Admin tinggal klik button → kirim invoice ke WA + Email | Admin tool |
| R7 | Template invoice/payment editable dari CMS (super-admin) | CMS feature |
| R8 | Admin focus: filter booking yg butuh payment / reschedule / cancel | Admin UX |

---

### 3. Analisa R1 + R2 — Verifikasi Email & WhatsApp

**Pola standar industri (Traveloka / Agoda / Booking.com / tiket.com):**
pakai **OTP** (One-Time Password) 4–6 digit, berlaku 5–10 menit, kirim
ke kanal yang mau diverifikasi. Customer input kode → form unlock bagian
berikut atau tombol submit. Tanpa OTP sukses, booking tidak boleh dibuat.

#### 3.1. Email verification

**Rekomendasi: OTP email 6 digit, TTL 10 menit, rate-limit 3× / 15 menit per IP+email.**

Opsi provider (saya rekomendasikan ranking berikut berdasarkan infra existing):

| Opsi | Pros | Cons | Rekomendasi |
|---|---|---|---|
| **(A) Resend** (`resend.com`) | DX bagus, free tier 3k email/bulan, Cloudflare-friendly | Butuh verifikasi domain | ✅ **PILIH** |
| (B) Hostinger SMTP (via Nodemailer) | Kalau email domain memang di Hostinger | Nodemailer tidak native di Cloudflare Workers (butuh workaround) | ⚠️ Hindari di Workers |
| (C) Cloudflare Email Workers + Postmark/Sendgrid | Cloudflare-native | Setup lebih kompleks | 🔸 Kalau Resend tidak mungkin |
| (D) Google SMTP / Gmail App Password | Gratis, cepat setup | Rate limit ketat, bukan untuk production | ❌ |

Pola implementasi:

```
POST /api/checkout/verify/email-send
  body: { email, formStamp }
  action: generate 6-digit OTP, store hashed (SHA-256) di D1 tabel
          `otp_verifications` (email_hash, otp_hash, expires_at, attempts),
          kirim email via Resend dgn template Payload-controlled

POST /api/checkout/verify/email-check
  body: { email, otp, formStamp }
  action: lookup, compare constant-time, mark verified=true,
          issue short-lived "email_verified_token" (HMAC, 30min TTL)
          — token ini wajib dikirim bersama submit final ke /api/bookings/create.
```

Schema baru:
```sql
CREATE TABLE otp_verifications (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,          -- 'email' | 'whatsapp'
  target_hash TEXT NOT NULL,    -- SHA-256 email atau WA number (jangan simpan raw)
  otp_hash TEXT NOT NULL,       -- SHA-256 OTP (jangan simpan raw)
  attempts INTEGER DEFAULT 0,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  ip_hash TEXT,                 -- rate-limit scope
  created_at DATETIME NOT NULL
);
CREATE INDEX otp_target_kind ON otp_verifications(kind, target_hash);
CREATE INDEX otp_expires ON otp_verifications(expires_at);
```

Row di-cleanup via cron weekly (atau on-write TTL check).

#### 3.2. WhatsApp verification — **CRITICAL analisa**

OTP via WhatsApp **tidak bisa pakai `wa.me` link** (karena itu bikin
customer kirim pesan ke kita, bukan sebaliknya). Pilihan:

| Opsi | Pros | Cons | Biaya |
|---|---|---|---|
| **(A) WhatsApp Cloud API** (Meta, business) | Resmi, template OTP pre-approved Meta, delivery stabil | Butuh business verification Meta + Facebook Business Manager + nomor WA bisnis non-personal | ~$0.005/pesan Indonesia |
| **(B) WhatsApp Business API via BSP** (Twilio, Vonage, Fonnte, Wablas) | Setup lebih cepat (BSP handle verifikasi Meta) | Lock-in BSP, cost 20–50% lebih mahal | $0.01–0.03/pesan |
| **(C) SMS OTP sebagai fallback** | Universal, tidak butuh WA aktif | Butuh SMS gateway (Twilio/Nexmo/Nusa SMS) + biaya | $0.03–0.08/SMS Indonesia |
| **(D) "WA probe" via wa.me/check** (unofficial) | Gratis | Tidak reliable, bisa kena ban Meta, ToS violation | ❌ Jangan |
| **(E) Skip WA OTP, cukup email OTP** | Zero biaya baru, cepat ship | WA number tetap bisa typo | Gratis |

**Rekomendasi saya (ranking):**

1. **Jangka pendek (ship fast):** Opsi **(E) — skip WA OTP**, cukup
   email OTP. Nomor WA divalidasi *format* (region code + digit count
   via `libphonenumber-js` ringan) + ditampilkan untuk konfirmasi
   customer di confirmation page. **Admin yang kirim pesan pertama**
   (via R6 di bawah) → kalau WA tidak sampai, admin re-contact via email
   (yang sudah terverifikasi). **Satu kanal verified cukup** untuk
   kasus booking tiket tourist.
2. **Jangka menengah (post-launch, kalau fraud / typo WA jadi masalah):**
   Opsi **(A) WhatsApp Cloud API** untuk OTP WA. Setup: register nomor
   bisnis Meta, approve template OTP (`"Kode verifikasi GtJourneysID: {{1}}"`),
   simpan `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_TOKEN` di env.
3. **Opsi backup:** fallback ke SMS lewat BSP yang sama kalau WA
   delivery gagal.

**Decision point untuk owner:**

> **Q1 (approval):** Ship Phase 4.69 dgn email-OTP saja (recommended),
> atau tunggu WA Cloud API disetup dulu (butuh ~3–5 hari admin + biaya
> ~$0.005/OTP)?

Phase doc ini akan asumsikan jawaban = email-OTP saja; WA OTP di-tag
sebagai **Phase 4.69.x future**.

#### 3.3. UX form

Saat ini form checkout 1 halaman panjang. Dengan OTP, perlu transisi:

```
[ Contact ]
  Name: _______________
  Email: _____________ [Verify] ← tombol
    (setelah klik: input OTP 6 digit muncul inline)
    (setelah verify: ✓ Verified, tombol disabled)
  Phone: __________________
  Country: ________________
  Notes: __________________

[ Passengers ]
  ...

[ Trip Summary + Submit ]
  Submit button disabled sampai email verified.
```

Alternatif **less-disruptive**: tetap 1 page, OTP sebagai modal yang
muncul **sebelum** `/api/bookings/create` dipanggil (yaitu di submit
button customer click). Pros: user cuma masukin OTP 1x di akhir dan
tidak ketemu OTP sebelum form selesai; Cons: kalau OTP gagal setelah
15 menit field passenger di-isi, data tetap live di form (asalkan
form tidak reload).

**Rekomendasi**: pola **inline-verify-per-field** (Traveloka style)
untuk email, karena pattern ini juga meng-educate user bahwa email
mereka valid *sebelum* commit submit → mengurangi dropout.

---

### 4. Analisa R3 — Validasi Passenger Data Inline

Yang **sudah ada** (Phase 4.63 server-side only, inline di
`/api/bookings/create`):
- firstName / lastName required (non-empty)
- passportExpiryDate ≥ departureDate + 6 bulan
- passengerCount = adults + children

Yang **belum ada**:
- Format passport number per negara (lemah di beberapa yurisdiksi, tapi beberapa negara ada pola)
- DOB sanity (bayi < 2 tahun = infant, 2–11 = child, 12+ = adult)
- Issue date < expiry date
- Issue date < today
- DOB > issue date (passport tidak mungkin terbit sebelum lahir)
- Nationality vs passport issuing country konsistensi

**Rekomendasi R3 — "level-1 inline validation" (ship sekarang):**

| Field | Rule | Error UX |
|---|---|---|
| Passport number | regex per-nationality (fallback: 6–12 alfanumerik upper-case) | Inline red hint "Format passport tidak sesuai" |
| Passport issue date | <= today AND >= DOB AND <= passport expiry (−6 bulan rule tetap) | Inline red hint spesifik |
| DOB | adult >= 12y pada departure; child 2–11y; infant 0–1y (sesuai kategori stepper) | Inline red hint "Umur tidak sesuai kategori penumpang" |
| Issue vs Expiry | expiry > issue | Inline |
| passengerType otomatis | kalau DOB diisi, hint "Harusnya ini Child/Infant" | Auto-correct or warn |

Pattern: validasi **client-side** untuk UX cepat (Alpine/vanilla reactive
error states), **server-side** sebagai source of truth di endpoint
(sudah ada partial). Error client ditampilkan di bawah field dgn warna
coral + icon warning (reuse style dari validation alert Phase 4.67.3
patch-2).

---

### 5. R4 — Jawaban: **"Apakah perlu verifikasi aktif untuk passenger data (passport)?"**

**Rekomendasi: TIDAK untuk MVP. Cukup validasi format + logical constraint (R3).**

Alasan:
1. **Verifikasi "aktif" passport (apakah nomor itu benar milik orang itu)
   hanya mungkin lewat API immigration pemerintah** — tidak tersedia
   untuk vendor privat di Indonesia/Singapore/Malaysia secara umum. Negara
   lain (US, UK) ada layanan MRZ/OCR via vendor seperti Onfido/Jumio tapi
   per-check biayanya $1–3 → tidak scalable untuk ferry ticket $10–30.
2. **Operator ferry sendiri cek passport di gate boarding**. Kalau nomor
   di booking salah tapi orang + passport fisik match nama di manifest,
   boarding tetap jalan (operator tolerant terhadap typo nomor sepanjang
   nama + nationality + DOB match).
3. **Risiko bisnis utama bukan nama palsu, tapi NAMA SALAH KETIK**. Itu
   dicegah dgn R3 (inline validation) + **"Review passenger" step** di
   confirmation page (customer baca ulang list sebelum submit final).
4. **Field KYC/verification identity hanya worth it kalau rata-rata
   value transaksi > $100** dan ada risiko fraud/money-laundering. Ferry
   ticket Batam–Singapore ~$30/pax, use-case tourist short-haul, risiko
   fraud rendah.

**Yang recommended ditambah (ringan, hig-ROI):**

a. **"Review your booking" expand-collapsible** di confirmation page
   dgn tombol "Edit" per passenger yang balik ke form (preserve data) —
   customer baca ulang nama/passport sebelum ngirim WA/email ke admin.
b. **Server-side cross-check**: kalau 2 passenger di 1 booking punya
   nomor passport sama → reject (`err=duplicate_passport`).
c. **Rate-limit per passport number**: nomor passport yang sama dipakai
   di > 3 booking berbeda dalam 24 jam → flag di admin (bukan reject;
   bisa jadi legitimate rebook, bisa juga spam).

---

### 6. Analisa R5 + R6 + R8 — Admin-Triggered Payment Handoff

**Perubahan paling besar di Phase 4.69.** Flow baru:

```
Customer                        CMS (admin)                    Comms
──────────────────────────────────────────────────────────────────
1. Submit → Booking row dgn
   status='awaiting_review'
   channel='manual_wa' (nama legacy, kita rename ke 'admin_handoff')
2. Confirmation page: "Admin
   sedang verifikasi. Invoice
   akan dikirim ke email + WA."

                                3. Admin lihat Dashboard
                                   "Awaiting Review" (default view)
                                4. Buka 1 booking → verifikasi:
                                   - Tanggal masih available?
                                   - Kelas masih available?
                                   - Harga masih valid?
                                5. Admin klik "Send Payment Instructions"
                                   → Modal konfirmasi: pilih template +
                                     preview isi + confirm
                                6. Backend: generate pesan dari template
                                   + variable (bookingRef, pax, harga,
                                   bank-no, link bayar nanti kalau ada),
                                   kirim ke email + WA
                                   → status='awaiting_payment'
                                   → log di booking: sentAt, sentBy
                                                               → 📧 Email
                                                               → 💬 WA

7. Customer bayar (transfer / Qris / dsb)
   Upload bukti ke email / WA

                                8. Admin verifikasi bukti bayar
                                9. Admin klik "Confirm Payment & Send Ticket"
                                   → status='confirmed'
                                   → kirim e-ticket (template kedua)
                                                               → 📧 E-ticket
                                                               → 💬 Confirmation

[ Side-tracks ]
Customer email/WA reply ke admin: "Mau reschedule" / "Mau cancel"
                                → Admin manual update status +
                                  "Send Reschedule Response" / "Send Cancellation Response"
                                  dari template (optional sub-phase).
```

#### 6.1. Status enum baru

Current (Phase 4.62): `pending / awaiting_payment / confirmed / cancelled / expired`

Proposed Phase 4.69:

```
pending            → initial state, honeypot/stamp sudah lolos tapi belum verified email
awaiting_review    ← NEW. Default state setelah submit sukses + email verified.
                     Admin perlu verifikasi tanggal/kuota.
awaiting_payment   → setelah admin klik "Send Payment Instructions".
                     Payment belum masuk.
payment_review     ← NEW. Customer sudah kirim bukti bayar, admin verify.
confirmed          → payment verified, e-ticket terkirim.
reschedule_request ← NEW. Customer minta reschedule.
cancel_request     ← NEW. Customer minta cancel.
cancelled          → final cancellation.
expired            → auto-expired (admin tidak respond dalam 48 jam, dll).
refunded           ← NEW (optional). Setelah cancel + refund issued.
```

Konsekuensi UI/filter: admin perlu **tab/filter view**:
- 🔵 **Awaiting Review** (default landing, "needs admin attention now")
- 🟡 **Awaiting Payment** (sent, waiting customer)
- 🟠 **Payment Review** ("customer sent proof, verify now")
- 🟣 **Reschedule / Cancel Requests** (combined, needs admin response)
- ✅ **Confirmed** (archive)
- ⚫ **Cancelled / Expired** (archive)

Payload native punya `admin.listFilter` + `admin.components.beforeList`
yang bisa dipakai untuk tab bar kustom.

#### 6.2. Tombol "Send Payment Instructions"

Payload custom component di edit view booking:
- `apps/cms/src/components/BookingSendPaymentButton.tsx` (client component)
- Dependency: endpoint internal `POST /api/admin/booking-send-payment`
  dgn Payload auth (admin+).
- Flow:
  1. Admin klik tombol → modal confirm.
  2. Modal tampilkan **preview** pesan email + WA (variable sudah di-substitute).
  3. Admin bisa edit draft pesan **sekali** sebelum kirim (optional
     feature, tapi high-value untuk edge case).
  4. Klik "Send" → backend fetch template, substitute variable,
     kirim via email provider (Resend) + WA provider (atau wa.me
     generation ke admin's own number untuk legacy mode).
  5. Log sent event di booking: `sentPaymentAt`, `sentPaymentBy`,
     `sentPaymentChannels: ['email','whatsapp']`.
  6. Status transition `awaiting_review` → `awaiting_payment`.

**WA sending — pilihan implementasi:**
- **Opsi A (recommended, zero-cost):** `wa.me` deep-link **tapi dari
  CMS**, bukan browser customer. Backend generate URL
  `https://wa.me/{customer}?text=<encoded>`, admin tinggal klik → buka
  WA Desktop dari browser admin → send. Masih **manual click**, tapi
  text sudah pre-filled dari template.
- **Opsi B (fully-automated):** WA Cloud API — langsung kirim tanpa
  click admin. Butuh setup §3.2.
- **Opsi C (hybrid):** email auto-send + WA pakai `wa.me` deep-link.

**Rekomendasi: Opsi C untuk MVP** — email benar-benar automated
(customer kanal utama), WA sebagai confirmation sekunder dgn pre-filled
template, admin klik 1x untuk ke WA Desktop dan hit send. Minimal
dependency baru.

#### 6.3. Template editable dari CMS

Opsi struktur:

**Opsi 1 — Global baru `BookingTemplates`:**

```typescript
export const BookingTemplates: GlobalConfig = {
  slug: 'booking-templates',
  admin: {
    group: 'Bookings',  // group CMS yang Phase 4.68.1 bikin
    description: 'Template pesan untuk invoice, konfirmasi, reschedule, cancel. Variables: {{bookingRef}}, {{customerName}}, {{totalAmount}}, dst.',
  },
  access: {
    read: isAdmin,
    update: isSuperAdmin,  // 🔒 hanya super-admin bisa edit (user request)
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Payment Instructions',
          fields: [
            { name: 'paymentEmailSubject', type: 'text', required: true, defaultValue: 'Payment Instructions for Booking {{bookingRef}}' },
            { name: 'paymentEmailBody', type: 'richText', required: true },
            { name: 'paymentWhatsappBody', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Confirmation / E-Ticket',
          fields: [
            { name: 'ticketEmailSubject', type: 'text', required: true },
            { name: 'ticketEmailBody', type: 'richText', required: true },
            { name: 'ticketWhatsappBody', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Reschedule Response',
          fields: [
            { name: 'rescheduleEmailBody', type: 'richText' },
            { name: 'rescheduleWhatsappBody', type: 'textarea' },
          ],
        },
        {
          label: 'Cancellation Response',
          fields: [
            { name: 'cancelEmailBody', type: 'richText' },
            { name: 'cancelWhatsappBody', type: 'textarea' },
          ],
        },
        {
          label: 'OTP Email (Email Verification)',
          fields: [
            { name: 'otpEmailSubject', type: 'text', required: true, defaultValue: 'Your GtJourneysID verification code' },
            { name: 'otpEmailBody', type: 'richText', required: true, admin: { description: 'Harus mengandung variabel {{otp}}.' } },
          ],
        },
        {
          label: 'Variables Reference',
          fields: [
            {
              name: 'variablesReference',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/VariablesReferenceField',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'bankAccounts',  // mutable, admin edit disini sekali
      type: 'array',
      fields: [
        { name: 'bankName', type: 'text', required: true },
        { name: 'accountNumber', type: 'text', required: true },
        { name: 'accountHolder', type: 'text', required: true },
      ],
    },
  ],
}
```

**Variable yang di-substitute** (sintaks `{{var}}`):
- `{{bookingRef}}`, `{{accessToken}}` (link confirmation)
- `{{customerName}}`, `{{customerEmail}}`, `{{customerWhatsapp}}`
- `{{tripType}}`, `{{departureDate}}`, `{{returnDate}}` (round-trip)
- `{{originLocation}}`, `{{destinationLocation}}`
- `{{ferryClassName}}`, `{{adults}}`, `{{children}}`
- `{{unitPrice}}`, `{{totalEstimate}}`, `{{currency}}` (formatted)
- `{{passengerList}}` (block, each line: `[Type] Title FirstName LastName · Nationality`)
- `{{paymentDeadline}}` (configurable, default +24 jam)
- `{{bankAccountsBlock}}` (format bank list)
- `{{confirmationUrl}}` (full URL dgn access token)
- `{{adminName}}`, `{{adminWhatsapp}}` (contact point)

Engine substitusi: simple `{{key}}` → regex replace, server-side,
dibatasi key whitelist (no eval, no arbitrary access). Pattern udah ada
di Phase 4.33 newsletter.

#### 6.4. Super-admin only editability untuk template

Access control di global:
```typescript
access: {
  read: isAdmin,           // semua admin+ bisa baca (untuk preview + variable info)
  update: isSuperAdmin,    // hanya super-admin bisa simpan perubahan
}
```

Plus field-level `access.update: superAdminFieldAccess` kalau mau ekstra
defense (pola existing dari Phase 4.66.7 untuk passport).

---

### 7. R7 — Jawaban eksplisit "Perlu penambahan menu di Booking?"

**Ya, 2 menu baru di CMS group "Bookings":**

| Menu | Jenis | Fungsi |
|---|---|---|
| `Booking Templates` | Global baru | Editable template invoice/ticket/reschedule/cancel/OTP + bank accounts |
| `Booking Dashboard` *(optional)* | Custom view / dashboard | Landing khusus admin dgn 6 tab filter + bulk actions (lihat §6.1) |

`Booking Dashboard` bisa di-ship via custom Payload component di
`admin.components.views[]`, tapi mungkin **defer ke sub-phase lanjutan**
(ship dulu Bookings collection yg sudah ada dgn `defaultListFilter`
sederhana + `preset` views; dashboard full-fitur di 4.69.x).

**Collection `Bookings` existing** (Phase 4.62 + 4.63) **tidak perlu
rename atau split**. Cukup extend:
- Tambah 3 status enum baru (`awaiting_review`, `payment_review`,
  `reschedule_request`, `cancel_request`).
- Tambah field `sentPaymentAt`, `sentPaymentBy`, `sentTicketAt`,
  `sentTicketBy`, `emailVerifiedAt`, `whatsappVerifiedAt` (nullable).
- Tambah field relationship `templateUsed` (optional, audit trail).

Juga pertimbangkan nanti (Phase 4.70+) **collection `BookingEvents`**
(audit log terpisah) kalau trail jadi kompleks, tapi untuk MVP cukup
field snapshot di `Bookings`.

---

### 8. Risiko + Trade-off yang Harus Owner Approve

| # | Risiko | Mitigation | Owner decision |
|---|---|---|---|
| 1 | Email OTP delivery lambat/spam folder → bikin dropout | Resend reputation + domain SPF/DKIM + preview di confirmation "Cek folder spam juga" | ✅ risiko dipakai |
| 2 | Dependency baru (Resend) → service outage affect checkout | Fallback: kalau OTP send fail > 2x retry, skip verifikasi (log admin warning) atau tampilkan "contact admin manually" | ⚠️ Approve fallback policy |
| 3 | Admin lupa klik "Send Payment Instructions" → booking expired | Auto-reminder email ke admin setelah 2 jam `awaiting_review` + badge count di sidebar | ⚠️ Approve threshold |
| 4 | Template rusak (sintaks `{{}}` typo) → kirim pesan dgn `{{bookingRef}}` literal | Validator di global save hook: regex scan + warn kalau ada `{{xxx}}` yang bukan whitelisted var | ✅ ship with validator |
| 5 | Super-admin edit template saat ada admin lagi klik "Send" → race race | Lock-on-read tidak worth it; cukup kirim snapshot template version dgn tiap send + log `templateVersion` di booking | ✅ ship with snapshot |
| 6 | Customer email benar tapi WA typo → invoice email arrive, WA tidak → admin bingung | WA sebagai sekunder, email sebagai primary. UI confirmation: "Kalau WA tidak sampai dalam 5 menit, cek email juga" | ✅ ship as rec |
| 7 | OTP tabel di D1 bisa membengkak | Cron weekly `DELETE WHERE expires_at < NOW() - 7 days` | ✅ ship with cron |
| 8 | PII (email + hash OTP) di D1 bocor | Store hash saja, bukan raw. OTP 6-digit bisa brute-force kalau tabel bocor + salt-less → simpan dgn salt per-row atau pakai argon2id | ✅ Approve: argon2id atau bcrypt (via lib ringan) |
| 9 | Rate-limit OTP terlalu ketat → user yang beneran bisa stuck | 3 send / 15 min + 5 check-attempt / OTP + progressive delay | ✅ ship with defaults |
| 10 | WA Cloud API decision defer → user janji "WA verification" tidak terpenuhi di phase ini | **Rename phase scope**: "Email verification + admin handoff". WA verification sebagai Phase 4.69.6 future | ⚠️ Owner konfirmasi scope naming |

---

### 9. Rencana Breakdown Sub-Phase

Pecah supaya tiap langkah shippable + reviewable. Tiap sub-phase =
1 file di `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/`.

| Sub-phase | Judul | Scope | Depends on | Deploy need |
|---|---|---|---|---|
| **4.69.1** | Email provider setup (Resend) | Env var, lib wrapper `apps/web/src/lib/email/`, sanity test send | — | env |
| **4.69.2** | OTP schema + endpoints | Migration `otp_verifications`, API `/api/checkout/verify/email-send` + `/email-check`, HMAC `email_verified_token` | 4.69.1 | cms + web |
| **4.69.3** | Form UI email verification | Inline verify UX di `[slug].astro`, Alpine state, token submit integration ke `/api/bookings/create` | 4.69.2 | web |
| **4.69.4** | Passenger inline validation (R3) | Client+server rule set, UI red-hint reuse Phase 4.67.3 pattern | — (independent) | web |
| **4.69.5** | Bookings status enum + fields | Migration add 4 status + 6 timestamp/user fields | — | cms |
| **4.69.6** | BookingTemplates global | New global, access rules, field-level super-admin lock, variable substitution helper | 4.69.5 | cms |
| **4.69.7** | Admin "Send Payment" button | Custom component di edit view, endpoint `/api/admin/booking-send-payment`, email + WA deep-link | 4.69.1, 4.69.5, 4.69.6 | cms |
| **4.69.8** | Admin dashboard tabs/filter | List view presets per status, badge count sidebar | 4.69.5 | cms |
| **4.69.9** | Reschedule / cancel request flows | Customer-facing endpoints + admin response buttons | 4.69.5, 4.69.6, 4.69.7 | web + cms |
| **4.69.10** | Cron cleanup OTP | Cloudflare cron trigger weekly, delete expired OTP | 4.69.2 | web (worker cron) |
| **4.69.11** *(future)* | WhatsApp OTP (Cloud API) | Full WA number verification | 4.69.3 | web + env |
| **4.69.12** *(future)* | E-ticket PDF attach | Generate PDF ticket + attach ke email saat `confirmed` | 4.69.7 | web |

**Minimum shippable MVP** = 4.69.1 → 4.69.8 (urutan di atas). ~5–7 hari
developer effort.

---

### 10. Dependency Baru yang Perlu Install (perlu approval per AGENTS.md §11)

| Package | Alasan | Alternatif |
|---|---|---|
| `resend` (npm) | Email provider SDK | Pakai `fetch` ke Resend REST API tanpa SDK (zero dep) |
| `libphonenumber-js` (npm, lightweight 150KB) | Validasi phone region+format | Regex per-region (sudah ada partial) |
| `argon2` atau `@noble/hashes` | OTP hashing yg lebih strong dari SHA-256 | Pakai SHA-256 + salt per-row (acceptable untuk OTP 6-digit TTL 10m) |

**Rekomendasi**: zero npm baru. Pakai `fetch` ke Resend REST, regex +
hand-rolled region validation (sudah ada `phoneRegions.ts`), SHA-256 +
per-row salt untuk OTP.

---

### 11. Env Vars Baru (perlu update `.env.example` + CI secret)

```bash
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@gtjourneys.id
RESEND_REPLY_TO_EMAIL=booking@gtjourneys.id

# OTP
OTP_SALT=<64-hex>              # salt untuk hashing OTP (rotate = invalidate all pending OTP)
OTP_LENGTH=6
OTP_TTL_MINUTES=10
OTP_RATE_MAX_SEND=3
OTP_RATE_WINDOW_MINUTES=15

# Admin WhatsApp (existing: PUBLIC_WHATSAPP_NUMBER — tetap dipakai)
# Future (Phase 4.69.11):
# WHATSAPP_CLOUD_API_TOKEN=
# WHATSAPP_PHONE_NUMBER_ID=
# WHATSAPP_OTP_TEMPLATE_NAME=
```

---

### 12. Impact ke Flow Existing (Backward Compat)

- **Round-trip booking** (Phase 4.67.2): zero schema impact. tripType + 10 field return tetap intact. Status transition baru independen dari tripType.
- **Access token confirmation page** (Phase 4.66.5): tetap wajib. URL confirmation masih `/checkout/.../confirmation/[ref]?t=<token>` — belum berubah.
- **Form stamp HMAC** (Phase 4.62): tetap aktif, verify sebelum rate-limit (Phase 4.66.9).
- **Rate-limit 3/15min IP hash** (Phase 4.66.9): tetap. OTP endpoint pakai rate-limit terpisah (Phase 4.69.2).
- **WA deep-link `wa.me` manual customer**: **removed as primary flow**. Tombol di confirmation page diubah jadi "Download booking confirmation PDF" + "Contact admin" (bukan "Kirim ke WhatsApp" lagi). Legacy booking yg channel=`manual_wa` tetap bisa dibaca.

---

### 13. Security Checklist (akan dicatat juga di `docs/08-SECURITY-PATCH.md` saat eksekusi)

- [ ] OTP hashed di DB (never raw)
- [ ] OTP rate-limit per IP+target (3 send / 15 min)
- [ ] OTP check attempt limit (5 attempts / OTP → invalidate)
- [ ] OTP TTL 10 min (shorter if possible)
- [ ] `email_verified_token` HMAC + TTL 30 min + single-use (consumed di `/api/bookings/create`)
- [ ] Resend domain verified (SPF/DKIM/DMARC)
- [ ] Email body sanitized (no user HTML injection; template-controlled only)
- [ ] WA deep-link URL-encoded dgn hati-hati (phase 4.66.10 pattern)
- [ ] Admin "Send Payment" endpoint: Payload auth + role check `isAdmin`
- [ ] Template editability: `superAdminFieldAccess` di sensitive fields (bank account, OTP email)
- [ ] CSP (Phase 4.66.3) updated kalau Resend/image domain baru dipakai
- [ ] Audit log: `sentBy`, `sentAt` immutable (field-level update deny setelah initial write)

---

### 14. Testing Plan (per sub-phase, akan dirinci di masing-masing phase doc)

Smoke test minimum:
- Email OTP: happy path (send → receive → check → verified), timeout, wrong OTP, rate-limit kena, race condition double-submit.
- Form submission tanpa `email_verified_token` → reject 400 `err=email_not_verified`.
- Admin send payment: template substitution, email delivered, WA deep-link URL opens with correct text, status transition correct, double-click button idempotent.
- Template edit: non-super-admin can read + preview but update rejected 403.
- Bank account rotation: new value appears in next-sent template (snapshot test).

---

### 15. Rollback Plan (per sub-phase)

- 4.69.1 (Resend): revert env, revert email lib file.
- 4.69.2 (OTP): `pnpm schema:down` 1 batch + revert endpoint files.
- 4.69.5 (status enum): migration `down()` drops new enum values + columns. **Blocker: existing booking dgn status baru → fail. Mitigate: migrate down → update all `awaiting_review` → `pending` first.**
- 4.69.7 (admin button): revert component file + endpoint. Status update tetap bisa manual via Payload native edit.

---

### 16. Owner Decisions — FINAL (approved 2026-10-09)

| # | Keputusan | Jawaban | Implikasi |
|---|---|---|---|
| D1 | Scope MVP = email-OTP only | ✅ YES | WA OTP → Phase 4.69.11 future |
| D2 | Zero npm baru (Resend via fetch, SHA-256+salt) | ✅ YES | Pakai Web Crypto + fetch, tidak install Resend SDK |
| D3 | `channel=manual_wa` rename? | ✅ KEEP | Flow baru dibedakan via `status` enum, bukan rename `channel`. Legacy booking tetap valid. |
| D4 | Passenger validation = inline format only | ✅ YES | No identity verification; validasi R3 di §4 (format passport, DOB sanity, issue vs expiry, duplicate passport reject) |
| D5 | 4 status baru | ✅ YES | `awaiting_review`, `payment_review`, `reschedule_request`, `cancel_request` ditambah ke enum existing |
| D6 | Breakdown 10 sub-phase MVP + 2 future | ✅ YES | Urutan eksekusi: 4.69.1 → 4.69.10 |
| D7 | Email provider | ✅ RESEND | Via fetch REST, no SDK |
| D8 | From / reply-to email | ✅ `noreply@gtjourneys.id` + `booking@gtjourneys.id` | Keduanya di domain `gtjourneys.id`. Pre-launch: setup DNS verif. Dev: sandbox. |
| D9 | Admin WA = Opsi C (email auto + WA deep-link manual) | ✅ YES | WA via `wa.me/<customer>?text=` dari CMS admin button |
| D10 | Template missing variable fallback | ✅ ERROR | Tolak kirim + tampilkan error ke admin ("Variable `{{xxx}}` kosong — isi dulu field tersebut"). Fail-safe, bukan fail-silent. |

### 16a. Domain Decisions — FINAL (approved 2026-10-09)

| # | Keputusan | Jawaban | Implikasi |
|---|---|---|---|
| D-domain-1 | Domain `gtjourneys.id` sudah dibeli? | ❌ **BELUM** | Separate workstream — tidak block Phase 4.69. Perlu dibeli sebelum launch day. |
| D-domain-2 | DNS managed di mana? | N/A | Diputuskan saat domain dibeli |
| D-domain-3 | Inbox `booking@gtjourneys.id` provider? | N/A (defer) | Diputuskan pre-launch |
| D-domain-4 | Dev pakai sandbox Resend? | ✅ **YES** | Phase 4.69.1 ship dengan `RESEND_FROM_EMAIL=onboarding@resend.dev` (sandbox). Hanya bisa kirim ke email di-whitelist Resend (owner + tester). Zero domain dependency di dev. |

### 16b. Launch-Day Checklist (dibuat terpisah saat domain siap)

Begitu domain dibeli:
1. Register domain di Resend dashboard → **Add Domain**
2. Copy 3–4 DNS record (SPF, DKIM, DMARC) ke DNS provider domain
3. Tunggu verifikasi Resend (biasanya 15 menit – 4 jam)
4. Setup inbox real untuk `booking@gtjourneys.id` (Google Workspace / Zoho / Hostinger)
5. Flip env prod: `RESEND_FROM_EMAIL=noreply@gtjourneys.id`, `RESEND_REPLY_TO_EMAIL=booking@gtjourneys.id`
6. Deploy
7. Smoke test: trigger OTP ke email customer eksternal → cek inbox (bukan spam)

Dev → prod flip = **1 env var change**. Zero code change.

### 16c. Siap Mulai Eksekusi

Semua decision ter-approve. Branch `feat/checkout-verification-phase-4.69`
sudah di-cut. Sub-phase 4.69.1 (Resend sandbox setup + email lib wrapper)
bisa langsung dieksekusi dengan phase doc standar (format: Ringkasan,
Keputusan owner, File yang berubah, Impact, Testing, Rollback,
Dokumentasi yang diupdate).

---

### 17. Catatan Branch

- Branch: `feat/checkout-verification-phase-4.69` (sudah dibuat dari `develop`)
- Base: `c5ab2fa` (Phase 4.68 series complete)
- Working tree ada 2 file modified sebelum branch dibuat (`importMap.js`, `payload-types.ts`) — auto-generated artifacts dari Phase 4.68, ikut terbawa ke branch baru. **Tidak akan di-commit di phase ini** kecuali sub-phase eksekusi butuh regen (akan di-commit sebagai bagian dari sub-phase relevan).

---

**End of analysis. No code change dilakukan di dokumen ini.**
