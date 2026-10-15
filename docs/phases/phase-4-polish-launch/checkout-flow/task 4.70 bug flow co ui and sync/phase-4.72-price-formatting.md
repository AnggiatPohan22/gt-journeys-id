# Phase 4.72 — Centralized Price Formatting (IDR dot thousands)

**Status**: ✅ Implemented
**Branch**: `feat/price-formatting-phase-4.72`
**Date**: 2026-10-15

---

## 1. Context

Admin + customer melihat harga IDR muncul sebagai `IDR 250000` di beberapa tempat (email, PDF, admin list) — tidak readable. Request: titik ribuan di IDR (`Rp 250.000`), currency lain tetap pakai Intl standard, semua lewat satu helper.

---

## 2. Decisions (user-approved)

1. IDR → `id-ID` locale, dot thousands, no decimals (`Rp 250.000`).
2. Currency lain → `en-US` locale, standard Intl 2-decimal rendering.
3. Satu shared helper. No scattered manual formatting.
4. Applied EVERYWHERE: web (checkout, confirmation, cards), CMS admin UI, email HTML/text/WA, PDF receipt.
5. Stored values raw. Formatting display-only.
6. PDF: NBSP normalized → regular space. Workers-runtime safe.
7. Unit tests: IDR, non-IDR, zero, large numbers.

---

## 3. Commits (one concern each)

| # | Commit | What |
|---|---|---|
| 1 | `03e24a5` | `formatPrice` upgrade generic + `formatPriceAscii` + 15 unit tests (`node --test` via tsx) |
| 2 | `c28a6f8` | Receipt PDF uses shared `formatPriceAscii`; add `@gt-journeys/shared` workspace dep to CMS |
| 3 | `4d7f7f0` | `{{totalEstimateDisplay}}` variable + migration swap all default templates |
| 4 | `9284694` | `PriceCell` custom admin cell for Bookings list — unitPrice, totalEstimate, return pair |

---

## 4. Files changed

```
packages/shared/src/utils/format-price.ts            (upgraded)
packages/shared/src/utils/format-price.test.ts       (NEW — 15 tests)
packages/shared/package.json                         (+ test script)

apps/cms/package.json                                (+ workspace dep)
apps/cms/src/lib/receiptPdf.ts                       (delegates to shared)
apps/cms/src/lib/templateRenderer.ts                 (+ totalEstimateDisplay)
apps/cms/src/collections/Bookings.ts                 (PriceCell wiring)
apps/cms/src/globals/BookingTemplates.ts             (default swap + reference doc)
apps/cms/src/globals/bookingTemplatesDefaults.ts     (4 HTML + 1 defaults swap)
apps/cms/src/admin/cells/PriceCell.tsx               (NEW)
apps/cms/src/migrations/20261017_100000_phase_4_72_price_display.ts  (NEW)
apps/cms/src/migrations/index.ts                     (register)
apps/cms/src/app/(payload)/admin/importMap.js        (regenerated)
```

Web layer (cards + checkout + confirmation) tidak ter-touch — sudah pakai shared `formatPrice`. Upgrade helper otomatis fix mereka.

pnpm-lock.yaml updated (workspace link, no new npm download).

---

## 5. Variables (template renderer)

| Variable | Status | Example |
|---|---|---|
| `{{totalEstimateDisplay}}` | NEW — RECOMMENDED | `Rp 250.000` |
| `{{totalEstimate}}` | Backward-compat | `250000` |
| `{{currency}}` | Backward-compat | `IDR` |
| `{{unitPrice}}` | Unchanged | `75000` |

Admin yang pakai `{{currency}} {{totalEstimate}}` manual tetap works (output `IDR 250000`), tapi default sudah di-swap ke `{{totalEstimateDisplay}}`.

---

## 6. Migration

```bash
pnpm --filter cms payload migrate
```

Expected: `✔ Migrating... 20261017_100000_phase_4_72_price_display`.

Scope UPDATE:
- 2 text defaults (`payment_email_body`, `payment_whatsapp_body`) — exact-match conditional (admin-customized rows untouched).
- 4 HTML defaults (payment, ticket, reschedule, cancel `email_body_html`) — substring `>{{currency}} {{totalEstimate}}<` → `>{{totalEstimateDisplay}}<` via REPLACE().

Reversible via `down()`.

---

## 7. Test plan

1. **Unit tests**: `pnpm --filter @gt-journeys/shared test` — 15 cases pass.
2. **Web cards**: open any ferry listing → card shows `Rp 250.000` (not `IDR 250000`).
3. **Checkout page**: route cards + summary pakai dot thousands.
4. **Confirmation page**: unit price, totals, child breakdown all formatted.
5. **CMS admin Bookings list**: unitPrice + totalEstimate columns show `Rp 250.000`.
6. **Send Payment preview**: hero "Total" card + email body text + WA body + "Pay before" box — all `Rp 250.000`.
7. **Send Receipt**: PDF renders `Rp 250.000` (no NBSP corruption, no `?` for arrow).
8. **Non-IDR fallback**: temporarily set a booking currency to `USD` + render templates → should show `$1,234.50`.

---

## 8. Not in scope

- `unitPriceDisplay` / `childPriceDisplay` — currently no template references them (only `totalEstimate`). Add later when template default needs them.
- Format locale beyond `id-ID` / `en-US` (future i18n).
- Currency conversion / FX display.
- UI label i18n (English vs Bahasa) — unchanged.
