## Phase: 4.70.2.8 — Cancel Confirm/Decline Split

**Tanggal**: 2026-10-14
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai (implementasi), menunggu verifikasi user
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Follow-up dari**: [phase-4.70.2.7](phase-4.70.2.7-decline-payment-info-and-one-shot-request.md)

### Konteks

Phase 4.70.2.6 + 4.70.2.7 kasih admin pilihan Confirm/Decline untuk
reschedule request + decline template dengan payment info. User minta
pattern yang sama diterapkan untuk **cancel request** biar flow handling
customer request konsisten.

### Keputusan Desain

Mirror persis Phase 4.70.2.6 (reschedule split):

- 2 endpoint baru: `/confirm-cancel`, `/decline-cancel`
- 2 template baru editable di CMS (confirm + decline)
- Admin note opsional untuk confirm, WAJIB untuk decline
- Decline template juga punya payment info block (customer belum bayar
  → tetap perlu transfer; mirror decline reschedule 4.70.2.7)
- Confirm cancel: status → `cancelled` (terminal, final)
- Decline cancel: status → `preRequestStatus` snapshot (restore ke
  pre-request lifecycle, biasanya `awaiting_payment`)

Note: `hasRequestedChange` dari Phase 4.70.2.7 TETAP = true setelah
confirm atau decline → customer tidak bisa submit lagi via frontend.
Prevent spam.

### Perubahan

#### 1. Schema

File: `apps/cms/src/migrations/20261014_140000_phase_4_70_2_8_cancel_confirm_decline.ts`

- 12 kolom baru di `booking_templates`:
  - `cancel_confirm_*` (email_subject, email_body, email_body_html,
    whatsapp_body, hero_headline, hero_subtext)
  - `cancel_decline_*` (6 kolom sama)

Kolom lama `cancel_email_*` + `cancel_hero_*` tetap di DB, field di-hide
di UI dengan "[Deprecated 4.70.2.8]".

#### 2. Endpoint split

File: [apps/cms/src/collections/Bookings.ts](../../../../apps/cms/src/collections/Bookings.ts)

- `POST /:id/send-cancel-response` → **DIHAPUS**.
- `POST /:id/confirm-cancel` → kirim template "Dikonfirmasi". Admin
  note **OPSIONAL** (misal info refund/kebijakan). Status → `cancelled`.
- `POST /:id/decline-cancel` → kirim template "Belum Bisa Diproses".
  Admin note **WAJIB** min 10 char. Status → `preRequestStatus` snapshot.

Cleanup `customerRequest*` + `preRequestStatus` + `originalDeparture*`
tetap fire pada decline (via `toStatusFromField === 'preRequestStatus'`
path). `hasRequestedChange` tidak tersentuh → one-shot preserved.

Confirm tidak cleanup — booking cancelled terminal, audit trail
customerRequest* dipertahankan.

#### 3. Template HTML

File: [apps/cms/src/globals/bookingTemplatesDefaults.ts](../../../../apps/cms/src/globals/bookingTemplatesDefaults.ts)

- `DEFAULT_CANCEL_EMAIL_BODY_HTML` → rename jadi
  `DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML` + alias legacy.
- Hero badge "❌ Cancellation" → "❌ Pembatalan Dikonfirmasi".
- Replace variables: `{{cancelHeroHeadline}}` → `{{cancelConfirmHeroHeadline}}`,
  `{{cancelEmailBody}}` → `{{cancelConfirmNote}}` dengan styling box
  "Catatan dari admin".
- Row "Original departure" pakai `{{departureDisplay}}` (bukan ISO raw).
- Hilangkan "Your Reason" section (consistent dgn reschedule-confirm).

- **BARU** `DEFAULT_CANCEL_DECLINE_EMAIL_BODY_HTML`:
  - Hero orange gradient, badge "⚠ Pembatalan Belum Bisa Diproses"
  - Booking reference block (tetap pakai color brand, tidak strikethrough)
  - Row Status: "Tetap berlaku" (hijau)
  - Alasan admin block (red left border, `{{cancelDeclineReason}}`)
  - Reminder hijau "Booking tetap berlaku + lanjut pembayaran"
  - Payment Instructions (Total due + Bank Transfer + CTA WA) —
    reuse pola payment/reschedule-decline

#### 4. CMS global fields

File: [apps/cms/src/globals/BookingTemplates.ts](../../../../apps/cms/src/globals/BookingTemplates.ts)

Tab "Cancellation Response" direorganisasi:
- 6 field baru CONFIRM: `cancelConfirmHero*`, `cancelConfirmEmail*`,
  `cancelConfirmWhatsappBody`.
- 6 field baru DECLINE: `cancelDeclineHero*`, `cancelDeclineEmail*`,
  `cancelDeclineWhatsappBody`.
- 5 field lama (`cancelHero*`, `cancelEmail*`, `cancelWhatsappBody`)
  → `admin.hidden: true` dengan description "[Deprecated 4.70.2.8]".

#### 5. Template renderer

Dua file (CMS + web): +8 var baru ke KNOWN+OPTIONAL (`cancelConfirm*`
+ `cancelDecline*` termasuk `Note` dan `Reason`).

#### 6. BookingAdminActions UI

File: [apps/cms/src/admin/BookingAdminActions.tsx](../../../../apps/cms/src/admin/BookingAdminActions.tsx)

- `ActionKind` union: `cancel` dibuang, `cancelConfirm` + `cancelDecline` ditambah.
- `statusToKinds('cancel_request')` → return `['cancelConfirm', 'cancelDecline']`.
- Label, path, emoji, note label, warning untuk 2 kind baru:
  - cancelConfirm emoji 🗑, warning: "⚠ Setelah send, status jadi cancelled (final)".
  - cancelDecline emoji ⚠, warning: "ℹ Booking tetap berlaku jadwal semula".
- Button color: cancelConfirm merah tua (`#991B1B`), cancelDecline
  amber (`#D97706`).
- Modal pattern sama dgn reschedule split — textarea adminNote, preview
  on-demand.

### File yang Berubah

| File | Perubahan |
|------|-----------|
| `apps/cms/src/migrations/20261014_140000_phase_4_70_2_8_cancel_confirm_decline.ts` | **BARU** — 12 ADD COLUMN. |
| `apps/cms/src/migrations/index.ts` | Register. |
| `apps/cms/src/collections/Bookings.ts` | Split endpoint (confirm/decline cancel), update imports + endpoints array. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Rename `DEFAULT_CANCEL_EMAIL_BODY_HTML` → `_CONFIRM_`, +alias legacy, +`_DECLINE_` template baru, +4 default field values. |
| `apps/cms/src/globals/BookingTemplates.ts` | +12 field confirm/decline, hide 5 field lama. |
| `apps/cms/src/lib/templateRenderer.ts` | +8 vars KNOWN+OPTIONAL. |
| `apps/web/src/lib/checkout/templateRenderer.ts` | Idem (SSOT mirror). |
| `apps/cms/src/admin/BookingAdminActions.tsx` | Split ActionKind, label/path/emoji/warning untuk cancel kinds. |

### Testing

```
1. Run migration:
   pnpm --filter cms payload migrate
2. Restart CMS + web dev.

3. SKENARIO A — Confirm Cancel:
   - Buat booking test baru → awaiting_payment.
   - Confirmation page → Request Cancellation → isi alasan.
   - CMS → open booking → verify 2 button:
     🗑 Confirm Cancellation + ⚠ Decline Cancellation.
   - Klik 🗑 Confirm → modal buka → textarea adminNote (opsional).
   - Warning: "⚠ Setelah send, status jadi cancelled (final)".
   - Isi "Refund akan diproses dalam 7 hari kerja" → Preview.
   - Preview HTML: hero merah "Pembatalan Dikonfirmasi", booking ref
     strikethrough, departureDisplay, admin note box.
   - Confirm & Send → status booking → cancelled.

4. SKENARIO B — Decline Cancel:
   - Buat booking lain → request cancel.
   - CMS → ⚠ Decline Cancellation → modal buka.
   - Textarea WAJIB (min 10 char). Warning: "ℹ Booking tetap berlaku...".
   - Isi "Sudah dekat tanggal keberangkatan, tidak bisa cancel sesuai kebijakan." → Preview.
   - Preview HTML: hero orange "Pembatalan Belum Bisa Diproses",
     Status "Tetap berlaku" (hijau), alasan admin box merah,
     reminder hijau, Payment block (bank transfer + CTA WA).
   - Confirm & Send → status booking restore ke pre-request
     (misal awaiting_payment).

5. Verify one-shot gate (Phase 4.70.2.7):
   - Buka confirmation page booking yg di-decline di atas.
   - Expected: tombol "Request Reschedule" + "Request Cancellation" HILANG.
   - Copy: "A change request has already been submitted..."

6. Regress test:
   - Reschedule confirm/decline flow (Phase 4.70.2.6) tetap jalan normal.
   - Payment, ticket flow tetap normal.

7. Defense test:
   - POST /api/bookings/<id>/decline-cancel { adminNote: "short" } → 400.
   - POST /api/bookings/<id>/confirm-cancel ke booking status payment_review → 409.
```

### Impact

- **Database**: +12 kolom nullable di `booking_templates`. 1 migration.
- **CMS**: endpoint split + schema fields + UI component.
- **Frontend web**: 1 KNOWN set sync (web templateRenderer).
- **Env**: zero.
- **Deploy needed**: **cms + web**.
- **Breaking**: minor — endpoint lama `/:id/send-cancel-response` dihapus.
  Internal UI sudah di-migrate; integrasi eksternal perlu update kalau ada.

### Known Limitations

- Legacy cancel field (5 kolom) tidak di-drop dari DB — hanya hidden
  di UI. Safety fallback kalau butuh referensi. Future cleanup phase
  bisa drop semua legacy fields (reschedule + cancel) sekaligus.
- Decline cancel template SELALU tampilkan payment block, walaupun
  booking original status pre-request-nya `confirmed` (sudah bayar).
  Kondisi ini **impossible** dalam flow normal karena cancel pre-payment
  (`awaiting_review/awaiting_payment/payment_review/pending`) +
  `confirmed` → setelah decline akan kembali ke `confirmed`, dan customer
  "tetap berlaku" yg berarti e-ticket sudah ada → payment block irrelevant.
  Admin bisa edit template HTML `cancelDeclineEmailBodyHtml` manually
  per kasus langka ini (super-admin only via DB atau un-hide field).
- Cancel-confirm cleanup tidak fire → `customerRequest*` data preserved
  di DB sebagai audit trail. Harmless karena booking `cancelled` terminal.
- `hasRequestedChange` tidak di-reset by confirm/decline cancel → one-shot
  gate active seumur hidup booking. Konsisten dgn Phase 4.70.2.7.

### State matrix (final, setelah 4.70.2.4–4.70.2.8)

| Status | Reschedule req | Cancel req | Reschedule confirm | Reschedule decline | Cancel confirm | Cancel decline |
|---|---|---|---|---|---|---|
| `awaiting_review`/`awaiting_payment`/`payment_review`/`pending` | ✅ | ✅ | — | — | — | — |
| `reschedule_request` | — | — | ✅ | ✅ | — | — |
| `cancel_request` | — | — | — | — | ✅ | ✅ |
| `confirmed` | ❌ | ✅ | — | — | — | — |
| `cancelled`/`expired` | ❌ | ❌ | — | — | — | — |

(✅ = allowed, ❌ = blocked by status, — = N/A untuk status ini)

Button `cancelConfirm` + `cancelDecline` muncul **hanya** saat
`cancel_request`, otherwise hidden.
