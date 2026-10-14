## Phase: 4.70.2.6 — Reschedule Confirm/Decline Split

**Tanggal**: 2026-10-14
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Analisa**: [phase-4.70.2.3-reschedule-template-bug-analysis.md](phase-4.70.2.3-reschedule-template-bug-analysis.md)
**Follow-up dari**: [phase-4.70.2.5](phase-4.70.2.5-reschedule-previous-block-fallback.md)

### Konteks

Phase 4.70.2.4 kasih admin satu button "Send Reschedule Response" yang
auto-confirm. User temukan ini kurang fleksibel — tidak semua request
reschedule bisa di-accommodate (slot full, kebijakan, dsb). Admin perlu
dua opsi explicit: **Confirm** (approve) atau **Decline** (tolak dgn
alasan).

### Keputusan Desain (per user approval)

1. `preRequestStatus` snapshot — 1 kolom nullable
2. Template decline editable di CMS (parity dgn template lain)
3. Variable split: `{{rescheduleConfirmNote}}` + `{{rescheduleDeclineReason}}`
4. 5 button sejajar di Admin Actions; confirm/decline hanya muncul saat
   status `reschedule_request`
5. Phase 4.70.2.5 (fallback bug) + Phase 4.70.2.6 (confirm/decline)
   dipisah — ini report untuk 4.70.2.6

### Perubahan

#### 1. Schema

File: `apps/cms/src/migrations/20261014_100000_phase_4_70_2_6_reschedule_confirm_decline.ts`

- `bookings.pre_request_status` (text, nullable) — snapshot status asli
  sebelum customer request.
- `booking_templates` × 12 kolom baru (2 × 6 fields = confirm + decline):
  `reschedule_confirm_*` + `reschedule_decline_*` dengan sufix:
  `email_subject`, `email_body`, `email_body_html`, `whatsapp_body`,
  `hero_headline`, `hero_subtext`.

Kolom lama `reschedule_email_*` TETAP di DB tapi field di-hide di UI
dengan label "[Deprecated 4.70.2.6]". Future cleanup phase bisa drop
kalau diinginkan.

#### 2. Endpoint — split jadi 2

File: [apps/cms/src/collections/Bookings.ts](../../../../apps/cms/src/collections/Bookings.ts)

- `POST /:id/send-reschedule-response` → **DIHAPUS**.
- `POST /:id/confirm-reschedule` → kirim template "Disetujui". Admin
  note **OPSIONAL** (fallback ke "Tidak ada catatan tambahan.").
  Admin SUDAH update `departureDate` manual sebelum klik.
- `POST /:id/decline-reschedule` → kirim template "Ditolak". Admin
  note **WAJIB** min 10 char (= alasan decline).
- Keduanya restore `status` ke `preRequestStatus` snapshot (fallback
  `awaiting_payment` kalau null).
- Keduanya cleanup `customerRequest*` + `originalDeparture*` +
  `preRequestStatus` fields → banner alert hilang, snapshot bersih untuk
  reschedule request berikutnya.

**Request body**: `{ previewOnly: boolean, adminNote: string }`

#### 3. `customer-request` endpoint — snapshot `preRequestStatus`

Saat customer click Request Reschedule/Cancel, selain store reason+kind+
timestamp, juga simpan `preRequestStatus = booking.status`. Dipakai nanti
oleh confirm/decline endpoint untuk restore.

#### 4. `handleSendResponse` — generalized

Tambah ke `ResponseConfig`:
- `toStatusFromField?: string` — baca toStatus dari booking field.
  Fallback ke `toStatus` kalau null.
- `adminNoteCtxKey?: string` — nama ctx key untuk inject admin note.
- `adminNoteRequired?: boolean` — kalau true, reject empty.
- `defaultSubject`, `defaultEmailBody`, `defaultWaBody` — fallback kalau
  CMS field kosong (karena Payload v3 tidak backfill `defaultValue` ke
  row global existing).

#### 5. Template HTML split

File: [apps/cms/src/globals/bookingTemplatesDefaults.ts](../../../../apps/cms/src/globals/bookingTemplatesDefaults.ts)

- `DEFAULT_RESCHEDULE_EMAIL_BODY_HTML` → rename jadi
  `DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML` (alias export tetap ada
  untuk legacy import).
- Replace variable: `{{rescheduleHeroHeadline}}` → `{{rescheduleConfirmHeroHeadline}}`,
  `{{rescheduleHeroSubtext}}` → `{{rescheduleConfirmHeroSubtext}}`,
  `{{rescheduleEmailBody}}` → `{{rescheduleConfirmNote}}` dengan styling
  box "Catatan tambahan".
- Hero badge "🔁 Reschedule Confirmed" → "✅ Reschedule Disetujui".
- **BARU** `DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML`:
  - Hero red gradient, badge "❌ Mohon Maaf"
  - Reference block (tetap pakai jadwal semula, departureDisplay)
  - Alasan admin block (red left border, dari `{{rescheduleDeclineReason}}`)
  - Info "Booking Anda tetap berlaku sesuai jadwal semula" (hijau)
  - CTA WhatsApp untuk diskusi

#### 6. CMS global fields

File: [apps/cms/src/globals/BookingTemplates.ts](../../../../apps/cms/src/globals/BookingTemplates.ts)

Tab "Reschedule Response" direorganisasi:
- 6 field baru CONFIRM: `rescheduleConfirmHeroHeadline/Subtext`,
  `rescheduleConfirmEmailSubject/Body/BodyHtml`, `rescheduleConfirmWhatsappBody`.
- 6 field baru DECLINE: `rescheduleDeclineHeroHeadline/Subtext`,
  `rescheduleDeclineEmailSubject/Body/BodyHtml`, `rescheduleDeclineWhatsappBody`.
- 6 field lama (`rescheduleHero*`, `rescheduleEmail*`, `rescheduleWhatsappBody`)
  → `admin.hidden: true` dengan description "[Deprecated 4.70.2.6]".

Section header pakai description prefix (✅ CONFIRM / ❌ DECLINE) karena
Payload v3 belum punya built-in section-title field type yg aman.

#### 7. Template renderer

Dua file (`apps/cms/src/lib/templateRenderer.ts` +
`apps/web/src/lib/checkout/templateRenderer.ts`): tambah 8 var baru ke
KNOWN+OPTIONAL (`rescheduleConfirm*` + `rescheduleDecline*` termasuk
`Note` dan `Reason`).

#### 8. BookingAdminActions UI — split jadi 2 button + modal textarea

File: [apps/cms/src/admin/BookingAdminActions.tsx](../../../../apps/cms/src/admin/BookingAdminActions.tsx)

- `statusToKind()` → `statusToKinds()` (return array; `reschedule_request`
  return `['rescheduleConfirm', 'rescheduleDecline']`).
- Button layout: `.map(kinds)` → 2 button muncul saat `reschedule_request`.
- Color: confirm hijau (`#059669`), decline merah (`#DC2626`).
- Modal flow baru untuk kind yg butuh note:
  - Textarea `adminNote` di atas (above preview section).
  - Warning banner:
    - Confirm: "⚠ Pastikan Departure Date sudah di-update".
    - Decline: "ℹ Jangan ubah Departure Date — booking tetap pakai
      jadwal semula."
  - Preview button → fetch preview dengan adminNote.
  - Preview-not-auto: admin isi note dulu, baru klik Preview (karena
    konten preview depends on note).
  - Decline: button Preview disabled kalau note < 10 char.
- Modal flow lama (payment/ticket/cancel): tetap auto-fetch preview.

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/migrations/20261014_100000_phase_4_70_2_6_reschedule_confirm_decline.ts` | **BARU** — 13 ADD COLUMN. |
| `apps/cms/src/migrations/index.ts` | Register migration. |
| `apps/cms/src/collections/Bookings.ts` | Split endpoint (confirm/decline), extend `ResponseConfig` + `handleSendResponse` dgn adminNote + toStatusFromField + default text fallbacks, snapshot `preRequestStatus` di customer-request, +1 hidden field `preRequestStatus`. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Rename `DEFAULT_RESCHEDULE_EMAIL_BODY_HTML` → `_CONFIRM_`, +alias legacy, +`_DECLINE_` template baru, +4 default field values. |
| `apps/cms/src/globals/BookingTemplates.ts` | +12 field confirm/decline, hide 6 field lama (deprecated label). |
| `apps/cms/src/lib/templateRenderer.ts` | +8 vars KNOWN+OPTIONAL. |
| `apps/web/src/lib/checkout/templateRenderer.ts` | Idem (SSOT mirror). |
| `apps/cms/src/admin/BookingAdminActions.tsx` | ActionKind union 4→5, button rendering dari array, modal textarea adminNote, warning banner per-kind, preview on-demand. |

### Testing

```
1. Run migration:
   pnpm --filter cms payload migrate
2. Restart CMS dev.
3. Buat booking test baru (fresh, pasti ada snapshot).
4. Confirmation page → Request Reschedule → "Pindah ke 15 Oct 2026".
5. CMS → open booking → verify:
   - Banner alert "PENDING CUSTOMER REQUEST" (Phase 4.70.2.2) muncul.
   - Admin Actions muncul 2 button sejajar: ✅ Confirm Reschedule + ❌ Decline Reschedule.

6. SKENARIO A — Confirm:
   - Admin edit Departure Date → 2026-10-15, SAVE form.
   - Klik "✅ Confirm Reschedule" → modal buka.
   - Textarea muncul dgn label "Catatan untuk customer (opsional...)".
   - Warning: "⚠ Pastikan Departure Date sudah di-update".
   - Isi note "Tidak ada biaya tambahan, kursi tetap sama." → klik Preview.
   - Preview HTML: hero hijau "✅ Reschedule Disetujui", Previous→New block,
     catatan tambahan, payment instructions.
   - Klik "Confirm & Send" → email terkirim.
   - Status booking kembali ke pre-request status (misal awaiting_payment).
   - Banner alert HILANG. customerRequest* + originalDeparture* ter-reset.

7. SKENARIO B — Decline (buat booking lain + request reschedule):
   - Klik "❌ Decline Reschedule" → modal buka.
   - Textarea muncul dgn label "Alasan DECLINE (WAJIB...)".
   - Warning: "ℹ Jangan ubah Departure Date".
   - Kosongkan → klik Preview → tombol disabled sampai isi >10 char.
   - Isi "Slot tanggal 15 Oct sudah penuh, mohon pilih tanggal lain." → Preview.
   - Preview HTML: hero merah "❌ Mohon Maaf", alasan admin dalam box merah,
     reminder "Booking tetap berlaku jadwal semula" hijau, CTA WA.
   - Klik "Confirm & Send" → email terkirim.
   - Status kembali ke pre-request. Departure Date TIDAK berubah (kalau admin
     tidak edit tadi).

8. SKENARIO C — Payment/Ticket/Cancel: pastikan button + flow tetap
   bekerja seperti sebelumnya (tidak regress).

9. API defense test:
   POST /api/bookings/<id>/decline-reschedule
     { "previewOnly": true, "adminNote": "short" } → 400 min length error.
```

### Impact

- **Database**: +13 kolom nullable (1 di bookings, 12 di booking_templates). 1 migration.
- **CMS**: endpoint split + schema fields + UI component.
- **Frontend web**: 1 KNOWN set sync (web templateRenderer).
- **Env**: zero.
- **Deploy needed**: **cms + web**.
- **Breaking**: minor — endpoint lama `/:id/send-reschedule-response` dihapus.
  Kalau ada integrasi eksternal yg call endpoint ini, perlu update.
  Internal UI (BookingAdminActions) sudah di-migrate.

### Known Limitations

- Legacy field `rescheduleEmail*` di booking-templates tidak di-drop
  dari DB — hanya hidden di UI. Alasan: safety (bisa un-hide manually
  kalau butuh referensi). Future cleanup phase bisa drop kalau mau.
- Preview tidak auto-refresh saat admin ubah adminNote — perlu klik
  tombol "Refresh Preview" manual. Alternatif debounced auto-refresh
  bisa dipertimbangkan di polish phase.
- Default fallback (`defaultSubject`/`defaultEmailBody`/`defaultWaBody`)
  di-hardcode di `Bookings.ts` endpoint config. SSOT split antara
  `bookingTemplatesDefaults.ts` (HTML + hero) vs `Bookings.ts` (text
  bodies). Tidak ideal tapi acceptable — fallback hanya kena saat row
  global belum pernah di-save oleh admin.
- `preRequestStatus` di-snapshot juga untuk cancel request (walau tidak
  dipakai), demi konsistensi. Harmless — tidak break flow cancel.
