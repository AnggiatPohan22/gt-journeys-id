## Phase: 4.69.6 — BookingTemplates Global + Template Renderer

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Fondasi template engine untuk admin-handoff flow:
- **Global baru `booking-templates`** di group `Bookings` dengan 7 tab:
  Payment Instructions, Confirmation/E-Ticket, Reschedule Response,
  Cancellation Response, OTP Email, Bank Accounts, Variables Reference.
- **5 pair template (email subject + email body + WA body)** = 15
  editable text field + bank accounts array + 3 config field
  (adminWhatsapp, adminName, paymentDeadlineHours).
- **Super-admin only** update (field-level `superAdminFieldAccess`
  defense + global `access.update: req.user.role === 'super-admin'`).
- **Template renderer lib** (`apps/web/src/lib/checkout/templateRenderer.ts`)
  dengan whitelist 25 variable + fail-safe D10=ERROR mode.

### Keputusan Owner (approved sebelumnya)

- **D6** YES — breakdown ke sub-phase ini sesuai plan
- **D10** ERROR — unknown var atau missing var → reject + show error
  ke admin. Fail-safe, bukan fail-silent.
- Super-admin only edit (default rekomendasi §6.4 phase 4.69 analisa)

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/globals/BookingTemplates.ts` | BARU | GlobalConfig: slug `booking-templates`, admin group `Bookings`, access `read: isAdmin + update: super-admin only`, 7 tab, 15 template field + bankAccounts array + 3 admin field + variables reference doc |
| `apps/cms/src/payload.config.ts` | Edit | Import + register di `globals[]` sebagai item pertama (group Bookings) |
| `apps/cms/src/migrations/20261009_121202_phase_4_69_6_booking_templates.ts` | BARU | `CREATE TABLE booking_templates` (18 kolom) + sub-table `booking_templates_bank_accounts` (6 kolom + FK cascade + 2 index) |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration |
| `packages/shared/src/types/payload-types.ts` | Regenerate | `BookingTemplate` type |
| `apps/web/src/lib/checkout/templateRenderer.ts` | BARU | `renderTemplate()`, `extractVariables()`, `buildContext()`, `formatPassengerList()`, `formatBankAccountsBlock()`, `computePaymentDeadline()`, konstanta `KNOWN_VARIABLES` (25) + `OPTIONAL_VARIABLES` (6) |
| `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/phase-4.69.6-booking-templates-global.md` | BARU | File ini |

### Variable Whitelist

**25 variabel ter-whitelist** (sync dengan tab "Variables Reference"):

- **Booking**: `bookingRef`, `accessToken`, `confirmationUrl`
- **Customer**: `customerName`, `customerEmail`, `customerWhatsapp`, `customerCountry`
- **Trip**: `tripType`, `departureDate`, `returnDate`, `originLocation`, `destinationLocation`, `ferryClassName`, `adults`, `children`, `passengerList`
- **Pricing**: `unitPrice`, `totalEstimate`, `currency`
- **Payment**: `bankAccountsBlock`, `paymentDeadline`
- **Admin**: `adminName`, `adminWhatsapp`
- **OTP** (template-specific): `otp`, `otpTtlMinutes`

**6 OPTIONAL** (boleh kosong, render → `""`): `returnDate`,
`customerCountry`, `customerEmail`, `customerWhatsapp`,
`confirmationUrl`, `accessToken`.

Semua variable lain yang kosong → **ERROR**, admin harus isi field
terkait di booking atau template dulu.

### Default Templates

Default values populated di collection schema — admin bisa langsung
pakai tanpa setup, baru tweak sesuai kebutuhan. Semua default:
- Dalam Bahasa Indonesia (customer utama = Indonesia)
- Pattern "Halo {{customerName}}... detail... call to action"
- WA message pakai emoji; email plain text (admin bisa override ke HTML)

### Access Control

| Role | Read | Update |
|---|---|---|
| super-admin | ✅ | ✅ (full) |
| admin | ✅ (preview) | ❌ (field-level `superAdminFieldAccess` reject) |
| editor | ❌ (hidden dari sidebar) | ❌ |

Defense-in-depth:
- Global-level: `access.update: ({req}) => req.user?.role === 'super-admin'`
- Field-level: setiap field template punya `access.update: superAdminFieldAccess`
- Admin UI: hidden untuk editor via `admin.hidden`

### Testing

#### Migration

```
pnpm schema:migrate → Migrated: 20261009_121202_phase_4_69_6_booking_templates (30ms) ✓
```

Verify tabel + sub-table + 2 index exist via sqlite query. ✓

#### Global accessible via REST

```bash
GET /api/globals/booking-templates (API-key auth)
→ 200
{
  "paymentEmailSubject": "Payment Instructions for Booking {{bookingRef}}",
  "paymentDeadlineHours": 24,
  ...
}
```

Default values ter-populate dari schema. ✓

#### Renderer engine (pure logic)

Smoke test 4 skenario via Node mirror script:
1. **Happy path**: `"Hi {{customerName}}, booking {{bookingRef}} total {{currency}} {{totalEstimate}}"` + ctx lengkap → ok, rendered correct ✓
2. **Missing required**: `{{totalEstimate}}` tapi ctx kosong → `errors: ["missing totalEstimate"]` ✓
3. **Unknown variable**: `{{foobar}}` → `errors: ["unknown foobar"]` ✓
4. **Optional empty**: `{{returnDate}}` dgn ctx null → ok, render empty string ✓

#### TypeScript check

Zero error baru. 2 pre-existing unrelated.

### Impact

- **Database**: 2 tabel baru (`booking_templates` + `booking_templates_bank_accounts`) + 2 index. Backward compatible.
- **CMS**: global baru tampil di sidebar group **Bookings** untuk admin+ (super-admin edit, admin read-only).
- **Frontend**: lib baru siap-pakai untuk Phase 4.69.7 (admin "Send Payment" endpoint).
- **Routes**: tidak ada route baru di phase ini (lib + global saja).
- **RBAC**: `BookingTemplates` — read admin+, update super-admin only. Field-level defense via `superAdminFieldAccess`.
- **Env**: tidak ada
- **Deploy needed**: **cms + web**

### Rollback

```bash
pnpm --filter @gt-journeys/cms run schema:down
```

Revert 2 file + payload.config entry. Zero caller dependency di phase
ini → rollback aman tanpa downstream break (Phase 4.69.7 belum ship).

### Security Notes

- Field-level `superAdminFieldAccess` di SEMUA template field → defense-in-depth. Admin login tidak bisa update template tanpa escalate ke super-admin.
- Variable substitution engine **whitelist-only** → mitigate template injection (contoh: `{{__proto__}}`, `{{constructor}}`, etc. tidak akan ter-replace karena bukan di set).
- D10=ERROR mencegah pesan "half-rendered" terkirim ke customer (contoh: email dengan "Total: {{totalEstimate}}" literal karena variable tidak ter-populate).
- Pre-flight error dilaporkan agregat (semua missing/unknown dilist sekaligus) supaya admin bisa fix semua sekali edit.
- Variabel bersifat **data-only** (tidak ada eval, tidak ada JavaScript execution). Template body = plain text/HTML dgn string substitution.

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/02-DATABASE-SCHEMA.md` — update akhir series 4.69 (tambah 2 tabel)
- [ ] `docs/04-RBAC.md` — update akhir series 4.69

### Next Steps

**Phase 4.69.7 — Admin "Send Payment Instructions" button**:
1. Custom Payload component di edit view Booking (`BookingSendPaymentButton.tsx`)
2. Modal confirm dgn preview email + WA message (hasil render template)
3. Backend endpoint `POST /api/admin/booking-send-payment` (Payload custom endpoint): auth admin+ via `req.user.role`, lookup booking + template, render dgn context, send email via Resend, generate wa.me deep-link (D9 Opsi C), update booking (status → awaiting_payment, sentPaymentAt/By)
4. Similar "Confirm Payment & Send Ticket" button untuk transition awaiting_payment → confirmed
5. Error UI untuk template render failures (missing variable, send failed)
