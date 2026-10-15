## Phase: 4.70.2 — Structured Brand + Per-Template Editable Fields

**Tanggal**: 2026-10-12
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Super-admin sekarang bisa edit **logo, warna, teks hero, dan contact info**
di CMS tanpa sentuh HTML. Berlaku untuk **semua 5 email**: OTP, Payment,
Confirmation, Reschedule, Cancel.

**Reschedule + Cancel** sekarang punya **HTML template** juga (sebelumnya
plain text only), lengkap dengan tampilan **alasan customer** (dari
`customerRequestReason`) sebagai audit trail yang di-highlight di email.

### Field baru di CMS

#### Tab "Brand" (shared, apply ke semua email)

| Field | Type | Default |
|---|---|---|
| `brandLogo` | upload (relationship Media) | — (fallback: "GT" text badge) |
| `brandAccentColor` | text (hex) | `#0EA5E9` |
| `brandCompanyName` | text | `PT GtJourneys Nusantara Indonesia` |
| `supportEmail` | text | `billing@gtjourneys.id` |
| `footerDisclaimer` | textarea | brand tagline |

#### Per-template fields

| Tab | Fields |
|---|---|
| **OTP** | `otpHeroHeadline`, `otpHeroSubtext`, `otpSecurityNote` |
| **Payment** | `paymentHeroHeadline`, `paymentHeroSubtext`, `paymentSecurityNote` |
| **Confirmation** | `ticketHeroHeadline`, `ticketHeroSubtext`, `ticketChecklistTitle` |
| **Reschedule** | `rescheduleHeroHeadline`, `rescheduleHeroSubtext` |
| **Cancel** | `cancelHeroHeadline`, `cancelHeroSubtext` |

Semua field punya `defaultValue` sensible — admin tinggal tweak.

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/migrations/20261012_150000_phase_4_70_2_structured_brand_fields.ts` | BARU | 20 ALTER TABLE ADD COLUMN + index untuk brand_logo FK. |
| `apps/cms/src/migrations/index.ts` | Edit | Register. |
| `apps/cms/src/globals/bookingTemplatesDefaults.ts` | Refactor | Shell + 3 template existing di-parameterize dgn vars. +2 template baru (reschedule, cancel). +`defaultFieldValues` export untuk field defaults. |
| `apps/cms/src/globals/BookingTemplates.ts` | Edit | +Tab "Brand" (5 field). +Per-template fields di 5 tab. +HTML field untuk reschedule/cancel (hidden by default). |
| `apps/cms/src/lib/templateRenderer.ts` | Edit | +22 var di whitelist (brand + per-template + customerRequestReason). Semua OPTIONAL. +`rawVars` option untuk trusted-HTML substitution. |
| `apps/web/src/lib/checkout/templateRenderer.ts` | Edit | Sama. |
| `apps/cms/src/collections/Bookings.ts` | Edit | +`buildBrandContext()`, +`pickTemplateFields()`, +`RAW_VARS`. `readTemplates` pakai `depth:1` untuk resolve logo URL. 4 endpoint (payment/ticket/reschedule/cancel) inject brand + per-template vars. Reschedule/cancel render HTML template juga. |
| `apps/web/src/pages/api/checkout/verify/email-send.ts` | Edit | +`buildBrandCtx()` resolve logo URL dari fetched global. Inline OTP default HTML pakai brand vars. Fallback ke hardcoded brand jika CMS unreachable. |
| `packages/shared/src/types/payload-types.ts` | Regenerate | +22 field di `BookingTemplate` type. |
| `docs/phases/.../phase-4.70.2-structured-brand-fields.md` | BARU | File ini. |

### How It Works

#### Logo picker
Admin → CMS → Booking Templates → Brand tab → upload / pick dari Media
→ save. Endpoint fetch global dengan `depth: 1` → resolve ke `{ url, alt }`
→ compose `brandHeaderHtml` sebagai `<img src="..." alt="...">` → inject
sebagai `{{brandHeaderHtml}}` ke template.

**Fallback (no logo)**: Server compose `<div>GT</div><span>brandName</span>`
→ konsisten dgn tanpa logo.

#### Color
`brandAccentColor` sebagai hex (default `#0EA5E9`) di-replace di template
HTML pada: hero gradient, link color, CTA button, border accent, bullet
numbers.

#### Hero text
Admin edit `*HeroHeadline` + `*HeroSubtext` per template. HTML template
pakai `{{paymentHeroHeadline}}` dsb. XSS-safe karena di-escape via
`renderTemplate({ escapeHtml: true })`.

#### Audit trail (Reschedule/Cancel)
Email template auto-include block "Your Reason: ..." dari
`customerRequestReason` (dari Phase 4.69.9 — customer isi saat request).
Pembeda dari OTP/Payment/Confirm yang tidak punya reason.

### Security

- Per-field access tetap `superAdminFieldAccess` (admin role bisa read, super-admin only edit).
- Values admin-edited di-HTML-escape via `renderTemplate({ escapeHtml: true })` → customer input `<script>` tidak execute.
- `rawVars: Set(['brandHeaderHtml'])` — hanya brandHeaderHtml yang di-trust sebagai HTML; dibangun server-side dari field yang validated.
- Logo URL di-escape via `escapeAttr()` saat di-inject ke `<img src>` attribute.
- Hidden raw HTML fields untuk reschedule/cancel (admin.hidden: true, consistent dgn 4.70.1).

### Testing

#### Migration
```
pnpm schema:migrate → Migrated: 20261012_150000_phase_4_70_2_structured_brand_fields (395ms) ✓
```

#### TypeScript
Zero new errors. Pre-existing defaultSort warning tetap.

#### Manual flow
```
1. Restart CMS + web dev.
2. CMS → Booking Templates → Brand tab:
   - Upload logo (atau pick dari Media)
   - Ganti brandAccentColor ke #10B981 (contoh warna hijau)
   - Save
3. Buat booking test → Admin Actions → Send Payment Instructions.
4. Preview modal: HTML pakai logo + warna hijau yang baru.
5. Confirm & Send → cek inbox: branding ter-update.
6. Repeat untuk Ticket, Reschedule, Cancel, OTP.
7. Verify: tanpa reload CMS, perubahan di Brand tab langsung apply ke 5 template.
```

#### Reschedule / Cancel HTML
```
1. Buat booking test → customer click "Request Reschedule" dengan alasan "Pindah tanggal karena kerjaan"
2. CMS → booking → chip "🔁 Reschedule" → open booking
3. Admin Actions → "Send Reschedule Response" → preview iframe:
   - Hero: "Reschedule request diterima"
   - Block "Your Reason: 'Pindah tanggal karena kerjaan'" ter-highlight
4. Confirm & Send → inbox customer: HTML terkirim dengan reason block.
```

### Impact

- **Database**: +20 kolom di `booking_templates` (semua nullable).
- **CMS**: 5 field baru di Brand tab + 13 editable field di 5 template tab.
- **Frontend web**: OTP endpoint consume brand fields dari CMS.
- **Env**: tidak ada perubahan.
- **Deploy needed**: **cms + web**.

### Known Limitations

- **Reschedule/Cancel body text** masih di global (sama untuk semua booking).
  Phase 4.70.3 future bisa tambah per-send modal input untuk customize
  per-case.
- **Logo image** harus di-serve dari Media CMS (R2) atau URL public. Email client
  tidak support hotlink dari internal/local URL.
- Admin yang clear `brandCompanyName` → fallback ke "GtJourneysID" (defensive
  code di `buildBrandContext`).
- Field `*EmailBodyHtml` masih ada di schema (hidden), dev bisa un-hide untuk
  struktural override (edge case).

### Dokumentasi yang Diupdate

- [x] File phase ini

### Next Steps

- Phase 4.70.3 — E-Ticket PDF attach (sudah diminta user di phase sebelumnya)
- Phase 4.70.4 (optional) — Dark mode styling untuk HTML emails
