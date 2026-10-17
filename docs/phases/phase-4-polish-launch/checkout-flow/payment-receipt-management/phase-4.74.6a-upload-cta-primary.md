## Phase: 4.74.6a — Upload Button Primary CTA + Default Template Swap
**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · user harus reset template field untuk apply ke record existing
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74.6-hardening-closing.md`](phase-4.74.6-hardening-closing.md)

### Latar Belakang (User Report)

> "Saya sudah tambahkan `{{paymentUploadUrl}}` di email dan WA, akan tetapi di email itu tidak muncul link-nya. Mungkin bisa dirubah dari template yg saat ini 'Kirim Bukti via WhatsApp' menjadi 'Upload Bukti Disini', dan WA itu hanya untuk informasi lebih lanjutnya. Saya mau link ini berupa main button dan WA second for more information."

Root cause: user menambah `{{paymentUploadUrl}}` di text email body + WA body saja. **HTML email body** (`paymentEmailBodyHtml`) tidak di-sentuh — ketika email dikirim via Resend, HTML content di-prefer oleh email client, sehingga text version (yang punya link) tidak terlihat. HTML version masih punya tombol lama `💬 Kirim Bukti via WhatsApp` sebagai primary CTA.

### Fix

**Swap primary CTA di 3 default template** supaya upload page jadi tombol utama + WA jadi secondary "info lebih lanjut":

| File | Perubahan |
|---|---|
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` (DEFAULT_PAYMENT_EMAIL_BODY_HTML) | Line "Kirim ke Admin · Via WhatsApp verifikasi" → "Upload Bukti · Klik tombol di bawah". Replace primary CTA block (green WhatsApp button) dgn: (a) **primary** block coral/accent "📤 Upload Bukti Transfer" dgn `{{paymentUploadUrl}}` + shadow + letter-spacing (bold prominent), (b) **secondary** ghost button "💬 Hubungi Admin via WhatsApp" dgn teks hijau outline (bukan solid), dgn label "Butuh bantuan atau info lebih lanjut?". |
| `apps/cms/src/globals/BookingTemplates.ts` (`paymentEmailBody` default) | Replace "Setelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}" → "Setelah transfer, UPLOAD bukti pembayaran di sini: {{paymentUploadUrl}}" + 1 line "Untuk info lebih lanjut hubungi admin via WhatsApp: {{adminWhatsapp}}". |
| `apps/cms/src/globals/BookingTemplates.ts` (`paymentWhatsappBody` default) | Replace "Kirim bukti transfer balas pesan ini ya" → block "📤 *Upload bukti transfer di sini:* {{paymentUploadUrl}}" + "Formulir aman — admin review dalam 1x24 jam. Untuk info lebih lanjut, balas pesan ini." |

### Impact ke Record Existing

Payload `defaultValue` di field hanya apply saat **create row baru**. BookingTemplates row admin saat ini **tidak otomatis update**. Admin harus manual:

**Option A** — Reset ke default baru (recommended):
1. Buka `/admin/globals/booking-templates`
2. Tab "Payment Instructions" → `paymentEmailBodyHtml`
3. **Clear field (delete semua isi)** → Save
4. Payload akan re-fill dengan default baru (upload CTA primary).
5. Repeat untuk `paymentEmailBody` + `paymentWhatsappBody`.

**Option B** — Manual edit:
1. Buka field → cari block `<a href="https://wa.me/...">💬 Kirim Bukti via WhatsApp</a>`
2. Replace dgn HTML block baru (ambil dari [`bookingTemplatesDefaults.ts`](../../../../../../apps/cms/src/globals/bookingTemplatesDefaults.ts) line ~205-220).

**Option C** — Migration conditional update (defer):
Mirror pola Phase 4.70.3.1 wording migration: UPDATE `booking_templates` SET field=NEW_DEFAULT WHERE field=OLD_DEFAULT. Pre-requirement: user HAVEN'T edited the HTML template yet (atau mereka OK kehilangan customization). Karena user sudah edit (menambah `{{paymentUploadUrl}}`), migration conditional akan skip row mereka → tidak membantu. **Defer**.

### Visual Hierarchy Design

**HTML email** (after fix):
```
┌──────────────────────────────────────┐
│  📤 UPLOAD BUKTI TRANSFER            │ ← PRIMARY (coral/accent, large, shadow)
│  (big button, prominent)             │
├──────────────────────────────────────┤
│  Form upload aman — PDF/JPG/PNG,     │
│  max 5MB. Admin review 1x24 jam.    │
└──────────────────────────────────────┘

Butuh bantuan atau info lebih lanjut?
┌─────────────────────────────────┐
│  💬 Hubungi Admin via WhatsApp   │ ← SECONDARY (ghost outline, small)
└─────────────────────────────────┘
```

**WhatsApp message** (after fix):
```
Halo {{customerName}}! 👋

Booking kamu di GtJourneysID sudah kami review ✅

🔖 Ref: {{bookingRef}}
📍 Rute: ...
...

Silakan transfer ke:
{{bankAccountsBlock}}

📤 *Upload bukti transfer di sini:*     ← Primary action (bold + emoji)
{{paymentUploadUrl}}

Formulir aman — admin review dalam 1x24 jam.
Untuk info lebih lanjut, balas pesan ini.  ← Secondary (plain text)

Batas waktu pembayaran: ...
```

### Testing

#### Programmatic
- [x] TypeScript compile OK.
- [x] CMS reload — defaults loaded tanpa error.

#### Pending (butuh user action)
- [ ] Admin reset 1 field default (misal `paymentEmailBodyHtml` di global BookingTemplates: clear → Save).
- [ ] Trigger Send Payment Instructions pada booking → verify email baru:
  - Primary coral button "📤 Upload Bukti Transfer" muncul besar.
  - Click button → navigate ke `/payment/<ref>?t=<token>` (page render form).
  - WhatsApp link di bawah smaller + ghost outline.
- [ ] Lihat WhatsApp message — upload link muncul sebagai primary action.

### Rollback

Revert 2 file (`bookingTemplatesDefaults.ts` + `BookingTemplates.ts`). Existing records tidak terpengaruh (karena user harus manual reset untuk apply changes).

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.6a

### Next Step

Default template update sudah di-code. User tolong:
1. Reset `paymentEmailBodyHtml` field di global BookingTemplates (clear → Save) untuk pick up primary CTA baru.
2. Reset `paymentEmailBody` + `paymentWhatsappBody` sama cara.
3. Trigger Send Payment ke booking test → verify upload button muncul besar + prominent.

Alternative: edit manual sesuai pattern di atas kalau mau preserve customization lain.
