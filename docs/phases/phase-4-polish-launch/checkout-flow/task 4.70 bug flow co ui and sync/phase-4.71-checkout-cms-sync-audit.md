# Phase 4.71 — Checkout → CMS Data Sync Audit

**Status**: 📋 Reported (audit only, no code changes)
**Date**: 2026-10-15
**Branch recommendation**: `feat/checkout-cms-sync-phase-4.71` (not yet created)
**Scope**: Audit field-by-field data flow from customer-facing checkout form → CMS Bookings record, identify fields that silently drop/null, and propose fixes.

---

## 1. Trigger

Admin melaporkan dua gejala saat buka Bookings di CMS + klik **Send Payment Instructions**:

1. **Waktu ferry (jam) tidak tampil di CMS** — field `scheduleTimeLabel` ada di schema Bookings, tapi row baru selalu kosong meski customer sudah pilih jadwal spesifik di frontend.
2. **Payment email "Departure" render `2026-10-20T00:00:00.000Z`** (atau serupa) — bukan tanggal yang readable + jam yang customer pilih.

Hipotesis awal: ada mismatch antara schema FerryTickets (sumber) dengan logic sync di `/api/bookings/create`.

---

## 2. Root cause findings

### Finding A — `scheduleTimeLabel` NEVER populated (outbound & return)

**File**: [apps/web/src/pages/api/bookings/create.ts:299-302](apps/web/src/pages/api/bookings/create.ts:299)

```ts
const scheduleTimeLabel =
  typeof (ferry as any).scheduleTimeLabel === 'string' && (ferry as any).scheduleTimeLabel.trim()
    ? String((ferry as any).scheduleTimeLabel).slice(0, 100)
    : null
```

Logic baca `ferry.scheduleTimeLabel`. **FerryTickets collection tidak punya field itu**:

- [apps/cms/src/collections/FerryTickets.ts:125](apps/cms/src/collections/FerryTickets.ts:125) — hanya ada `departureTime` (string "08:00") dan `arrivalTime` (string "09:15") di `scheduleOverview`.
- Field lama `scheduleTimeLabel` di schedule-array section (line 352-414) sudah **di-hide Phase 4.61.6**, dan di-replace oleh single-schedule `departureTime`/`arrivalTime` di Overview.

→ `(ferry as any).scheduleTimeLabel` SELALU `undefined` → booking persist `scheduleTimeLabel: null`.

**Return leg same bug** — [create.ts:378-381](apps/web/src/pages/api/bookings/create.ts:378) duplicate pattern untuk `returnScheduleTimeLabel`.

**Impact**:
- CMS admin UI kolom "Schedule Time Label" selalu empty.
- `{{scheduleTimeLabel}}` di semua email templates (payment, ticket, reschedule, cancel, receipt PDF) render empty string.
- Receipt PDF menampilkan departure tanpa waktu.
- WhatsApp message juga kehilangan info jam.

### Finding B — `{{departureDate}}` templated as raw ISO datetime

**File**: [apps/cms/src/globals/bookingTemplatesDefaults.ts:150](apps/cms/src/globals/bookingTemplatesDefaults.ts:150) + line 280

Default payment email HTML (dan beberapa template default lain) emit `{{departureDate}}` directly:

```html
<td>{{departureDate}}</td>
```

Payload `date` field dengan `pickerAppearance: 'dayOnly'` tetap stored sebagai ISO datetime `2026-10-20T00:00:00.000Z` (SQLite text). Context builder ([templateRenderer.ts:322](apps/cms/src/lib/templateRenderer.ts:322)) just passes it through:

```ts
departureDate: booking.departureDate ?? null,
```

Admin see "Departure: 2026-10-20T00:00:00.000Z" di CMS preview + customer dapat email dengan string raw itu.

**Note**: Context builder sudah expose `{{departureDisplay}}` (sudah formatted `"20 October 2026 · 08:00 → 09:15"`) di templateRenderer.ts:333. Template default **BELUM** pakai variable itu.

### Finding C — Checkout page's time display is UI-only (not persisted)

**File**: [apps/web/src/pages/checkout/ferry-tickets/[slug].astro](apps/web/src/pages/checkout/ferry-tickets/[slug].astro)

Checkout page compose string jam dari `departureTime` + `arrivalTime` purely untuk render ke customer. **Tidak** di-submit sebagai hidden input ke `/api/bookings/create`. API harus derive sendiri dari CMS ferry record.

→ Fix di API side (bukan tambah hidden input), consistent dengan Phase 4.66.4 "server recompute from CMS truth".

---

## 3. Other fields — sync check (all OK)

Audit field-by-field di `/api/bookings/create` → `createBooking` payload:

| Customer-input field | Form key | Persisted field | Status |
|---|---|---|---|
| Full name | `customerName` | `customerName` | ✅ |
| Email | `customerEmail` | `customerEmail` | ✅ |
| Phone region | `contactPhoneRegion` | `contactPhoneRegion` | ✅ |
| Phone | `contactPhone` | `contactPhone` | ✅ |
| WA flag | `contactPhoneIsWhatsapp` | `contactPhoneIsWhatsapp` | ✅ |
| Country | `customerCountry` | `customerCountry` | ✅ |
| Notes | `customerNotes` | `customerNotes` | ✅ |
| Departure date | `departureDate` | `departureDate` | ✅ (stored, but render issue — see B) |
| Adults | `adults` | `adults` | ✅ |
| Children | `children` | `children` | ✅ |
| Trip type | `tripType` | `tripType` | ✅ |
| Return date | `returnDate` | `returnDate` | ✅ |
| Passengers[N] | FormData regex | `passengers[]` | ✅ |
| Ferry ticket ID | `ferryTicketId` | `ferryTicket` (relation) | ✅ |
| Ferry class type | `ferryClassType` | `ferryClassType` | ✅ |
| **Schedule time label** | — (derived) | `scheduleTimeLabel` | ❌ **Finding A** |
| **Return schedule time** | — (derived) | `returnScheduleTimeLabel` | ❌ **Finding A** |

Price/location fields all server-recomputed from CMS truth (correct per Phase 4.66.4).

---

## 4. Proposed fix (Phase 4.71 implementation)

### Fix A — Compose `scheduleTimeLabel` from `departureTime` + `arrivalTime`

Replace outbound block [create.ts:299-302](apps/web/src/pages/api/bookings/create.ts:299):

```ts
const scheduleTimeLabel = composeTimeLabel(
  (ferry as any).departureTime,
  (ferry as any).arrivalTime,
)
```

Where `composeTimeLabel` is:

```ts
function composeTimeLabel(dep: unknown, arr: unknown): string | null {
  const d = typeof dep === 'string' ? dep.trim() : ''
  const a = typeof arr === 'string' ? arr.trim() : ''
  if (!d && !a) return null
  if (d && a) return `${d} → ${a}`.slice(0, 100)
  return (d || a).slice(0, 100)
}
```

Mirror same call for return leg at [create.ts:378-381](apps/web/src/pages/api/bookings/create.ts:378).

**Backfill plan** (SHOULD FIX): existing bookings created pre-fix have `scheduleTimeLabel: null`. Options:
- (a) One-shot migration that joins Bookings → FerryTickets by `ferryTicket` id, composes label from FerryTickets.departureTime/arrivalTime, UPDATEs only where current value IS NULL.
- (b) Leave as-is; receipt/email for legacy bookings falls back to `{{departureDate}}` alone.

Recommend (a) — ~30 lines SQL migration, low risk.

### Fix B — Switch default templates from `{{departureDate}}` → `{{departureDisplay}}`

[bookingTemplatesDefaults.ts](apps/cms/src/globals/bookingTemplatesDefaults.ts): all `{{departureDate}}` di payment/ticket/receipt/reschedule/cancel HTML + text + wa bodies → `{{departureDisplay}}`.

Wording migration (conditional UPDATE pattern dari Phase 4.70.3.1) perlu replace old default string → new default string ONLY where admin belum customize. Low risk — exact-string match.

For custom-edited templates: admin perlu manual edit (sama pattern seperti Phase 4.70.3.1 wording migration).

### Fix C — Admin UI: tampilkan Departure sebagai date-only di list view

Separate quick-win: Bookings list column `departureDate` currently shows ISO raw. Add `admin.components.Cell` yang format `YYYY-MM-DD` (slice first 10 chars) atau pakai `{{departureDisplay}}` via custom cell. **Defer** sampai fix A+B landed — this is cosmetic.

---

## 5. Test plan

1. Create new one-way booking end-to-end — verify CMS Bookings row has `scheduleTimeLabel: "08:00 → 09:15"` (atau format yang benar sesuai ferry).
2. Create round-trip booking — verify both `scheduleTimeLabel` dan `returnScheduleTimeLabel` populated.
3. Admin click **Preview Payment** → preview shows "Departure: 20 October 2026 · 08:00 → 09:15" (bukan raw ISO).
4. Admin click **Send Payment** → customer email shows same formatted departure.
5. Admin click **Confirm Payment & Send Receipt** → PDF receipt menampilkan departure dengan time.
6. Legacy booking (pre-fix, `scheduleTimeLabel: null`) + custom-edited template masih punya `{{departureDate}}` → verify email render date-only (no raw ISO) — IF Fix C-template-migration diterapkan.
7. Ferry record dengan `departureTime` kosong tapi `arrivalTime` ada — pastikan compose return single-sided value (atau null, decide), tidak crash.
8. Migration backfill `scheduleTimeLabel` untuk existing bookings — verify affects only NULL rows; UP + DOWN works.

---

## 6. Decisions needed from user before implementation

1. **Separator character**: `08:00 → 09:15` (arrow U+2192) vs `08:00 - 09:15` vs `08:00 to 09:15`. Receipt PDF (WinAnsi) sudah pakai `->` (Phase 4.70.3.1). Email HTML aman untuk `→`. Konsistensi:
   - Option 1: Pakai `→` di DB (email context), convert ke `->` saat render ke PDF only.
   - Option 2: Standardize semua ke `->` (ASCII-safe, works anywhere).
   - **Rekomendasi**: Option 1 — DB simpan `→` (pretty), PDF renderer sanitize ke `->` (sudah ada `sanitizeForPdfText` helper).

2. **Backfill migration**: Jalankan sekarang atau skip (legacy bookings keep empty)?
   - Rekomendasi: jalankan — safe (only NULL rows), low LoC.

3. **Template default migration scope**: Replace `{{departureDate}}` → `{{departureDisplay}}` di templates. OK?
   - Rekomendasi: ya, 1 phase saja (bundle dengan Fix A).

4. **Admin UI (Fix C)**: Masuk Phase 4.71 ini atau defer ke phase cosmetic terpisah?
   - Rekomendasi: defer.

---

## 7. Files that will change (Phase 4.71 implementation)

- `apps/web/src/pages/api/bookings/create.ts` — add `composeTimeLabel`, replace 2 blocks.
- `apps/cms/src/globals/bookingTemplatesDefaults.ts` — switch `{{departureDate}}` → `{{departureDisplay}}` di semua templates.
- `apps/cms/src/migrations/20261016_100000_phase_4_71_schedule_time_backfill.ts` — NEW migration:
  - Conditional UPDATE existing bookings `scheduleTimeLabel` dari joined FerryTickets.
  - Conditional UPDATE booking_templates to swap variable name di templates yang masih default.
- `apps/cms/src/migrations/index.ts` — register.
- (Optional Fix C): `apps/cms/src/collections/Bookings.ts` — admin cell component.

---

## 8. Not in scope

- Change FerryTickets schema (tetap pakai `departureTime`/`arrivalTime` sebagai source).
- Store `departureTime`/`arrivalTime` sebagai raw fields di Bookings (snapshot label is enough).
- Timezone handling (data saat ini tanpa tz suffix, treat sebagai local Asia/Makassar sesuai convention Phase 4.70.3.1).
- Receipt PDF layout changes.
- Changes to other collections / pages di luar checkout flow.
