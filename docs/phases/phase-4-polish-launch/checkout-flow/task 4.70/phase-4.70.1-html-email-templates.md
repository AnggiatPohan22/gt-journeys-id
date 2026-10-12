## Phase: 4.70.1 — HTML Email Templates (OTP, Payment, Confirmation)

**Tanggal**: 2026-10-12
**Branch**: `feat/checkout-verification-phase-4.69` (akan di-merge sebelum branch rename)
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

3 email customer sekarang punya **HTML version branded**, bukan plain text
yang terlihat seperti spam:

1. **OTP email** — Google-style minimal (header cyan + kode OTP besar + grace note).
2. **Payment Instructions** — Hero gradient, booking card, total callout
   dengan deadline, bank accounts block, 3-step guide, WhatsApp CTA, security
   notice. Design per `ai/reference/booking/payment-instruction/`.
3. **Ticket Confirmation** — Hero success-green, booking ref, trip details
   dengan arrow visual, passenger manifest, check-in checklist.

Semua template:
- Max-width 640px, email-client safe (table layout + inline styles).
- Shared "shell" wrapper (brand header + corporate footer dengan contact + anti-spam notice).
- Plain-text version tetap dikirim sebagai fallback (Resend auto-fallback).
- Variable sama dgn text template → zero migration kerja admin saat edit.
- **HTML-escaped** values via `renderTemplate(opts.escapeHtml=true)` → XSS-safe
  walau customer input mengandung `<script>`.

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/migrations/20261012_140000_phase_4_70_1_html_templates.ts` | BARU | ALTER TABLE ADD 3 cols: `otp_email_body_html`, `payment_email_body_html`, `ticket_email_body_html`. |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | BARU | 3 default HTML templates + shared `shell()` wrapper + brand color palette constants. |
| `apps/cms/src/globals/BookingTemplates.ts` | Edit | +3 field (`paymentEmailBodyHtml`, `ticketEmailBodyHtml`, `otpEmailBodyHtml`) dgn defaultValue dari defaults file. Super-admin only edit. |
| `apps/cms/src/lib/templateRenderer.ts` | Edit | +`escapeHtml` option. HTML entity escape untuk `& < > " '`. |
| `apps/web/src/lib/checkout/templateRenderer.ts` | Edit | Sama. |
| `apps/cms/src/lib/sendEmail.ts` | Edit | +`html?: string` input param, forward ke Resend body. |
| `apps/cms/src/collections/Bookings.ts` | Edit | sendPayment + sendTicket endpoints render HTML version juga, pass ke sendEmail. Preview response include `emailBodyHtml`. |
| `apps/cms/src/admin/BookingAdminActions.tsx` | Edit | Modal preview tampilkan iframe HTML (sandbox) + collapsible plain-text fallback. |
| `apps/web/src/pages/api/checkout/verify/email-send.ts` | Edit | Fetch booking-templates global, render subject + text + HTML dari admin-edited template (fallback ke inline default kalau CMS unreachable). |
| `packages/shared/src/types/payload-types.ts` | Regenerate | +3 HTML field di `BookingTemplate` type. |
| `docs/phases/.../phase-4.70.1-html-email-templates.md` | BARU | File ini. |

### Design Summary

**Brand palette** (per `ai/reference/booking/payment-instruction/DESIGN.md`):
- Primary `#0F172A` (midnight slate), Secondary `#0EA5E9` (ocean cyan)
- Background `#F0F9FF` (sky), Surface `#FFFFFF`
- Success `#10B981`, Warn `#F59E0B`

**Fonts**: Plus Jakarta Sans (web-safe fallback: Arial), Inter for mono.

**Email structure** (shared shell):
```
┌─────────────────────────────────┐
│ Brand header (logo + Secure)    │
├─────────────────────────────────┤
│                                 │
│ Hero section (per template)     │
│                                 │
│ Content sections                │
│                                 │
├─────────────────────────────────┤
│ Corporate footer                │
│  - Company name                 │
│  - WhatsApp + email contact     │
│  - Anti-spam reminder           │
│  - "sent to {{customerEmail}}"  │
└─────────────────────────────────┘
```

### Security Notes

- `renderTemplate(..., { escapeHtml: true })` escape semua values saat
  substitusi di HTML template → XSS-safe untuk input customer.
- Template body sendiri (admin-edited) **tidak di-escape** — admin trusted
  untuk tulis HTML tag.
- Iframe preview di admin modal pakai `sandbox=""` → script di template
  tidak execute saat preview (defense-in-depth).
- Email `html` + `text` dikirim barengan → Resend serve HTML ke client yang
  support, text ke yang tidak (plain fallback).

### Backfill untuk Existing Global Row

Global `booking-templates` adalah singleton row yang sudah ada sebelum
migration ini. Kolom HTML baru akan **NULL** di row existing — endpoint
akan skip HTML send (text-only, backward compatible).

**Setup setelah deploy**:
1. Login CMS super-admin
2. Buka Globals → Booking Templates
3. Scroll ke Payment Instructions / Confirmation / OTP tab
4. Field `*EmailBodyHtml` akan menampilkan default HTML (ter-populate dari
   field schema `defaultValue`)
5. Klik Save → nilai persist ke DB
6. Verify dgn test send dari Admin Actions di sembarang booking

### Testing

#### Migration
```
pnpm schema:migrate → Migrated: 20261012_140000_phase_4_70_1_html_templates (57ms) ✓
```

#### TypeScript
```
pnpm tsc --noEmit → zero new errors.
Types regenerated via pnpm payload generate:types.
```

#### Manual (dev)
```
1. Buka CMS → Booking Templates global → save sekali (populate HTML defaults).
2. Buat test booking (status awaiting_review).
3. Admin edit view → Admin Actions → Send Payment Instructions.
4. Modal preview tampilkan iframe HTML render → verify branding + layout.
5. Confirm & Send → cek inbox customer:
   - Gmail/web: tampil HTML full-color.
   - Terminal mail / plain client: fallback plain-text.
6. Repeat untuk Confirm Payment & Send Ticket (status payment_review).
7. OTP: pergi ke checkout page, verify email → cek inbox → HTML OTP email.
```

#### Preview iframe sanity
- Admin modal → preview HTML punya `sandbox=""` → tidak execute JS.
- Open customer email di client → tampilan match preview.

### Impact

- **Database**: +3 kolom nullable di `booking_templates`.
- **CMS**: 1 globals field extension, 1 shared default file, 1 renderer option.
- **Frontend web**: OTP endpoint fetch template dari CMS (new behavior).
- **Env**: tidak ada perubahan.
- **Deploy needed**: **cms + web**.

### Known Limitations

- **HTML defaults tidak auto-backfill** ke row existing — admin harus save sekali
  manually (lihat §Backfill). Trade-off vs menulis migration yang embed HTML
  (verbose + sulit maintain in-sync dgn TS defaults).
- **Shell footer `{{adminWhatsapp}}` dan `{{customerEmail}}`** = required di
  context — kalau salah satu kosong di booking, render **ERROR** (per D10).
  Mitigasi: ensure booking punya email + adminWhatsapp ter-set di global.
- **Outlook Desktop (old)** mungkin degrade layout — table-based layout
  kompatibel umum tapi gradient hero mungkin flat ke solid color. Testing
  real device belum dilakukan — plan untuk Phase 4.70.2 kalau diperlukan.
- **Preview iframe tinggi fixed 500px** di modal. Email asli lebih panjang
  → scroll iframe. Future bisa auto-size via `postMessage`.

### Next Steps (series 4.70)

- Phase 4.70.2 — Design polish: dark mode support, additional variables
  (sumber booking URL, SSE embed, logo image dari Media collection)
- Phase 4.70.3 — E-ticket PDF attach (seperti user mention di awal)
- Phase 4.70.4 — Reschedule/cancel response HTML templates (saat ini masih text)
