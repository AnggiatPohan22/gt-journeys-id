# Stage 3 — Admin UI Redesign (Booking)

**Branch**: `feat/booking-ui-redesign` (merged → main via PR #5)
**Tanggal**: 2026-10-16
**Scope**: 7 commit (brief + 5 step + 1 patch). Semua layer UX admin
CMS. Zero schema / endpoint / access rule change.

## Steps

| Step | File | Finding | Commit |
|---|---|---|---|
| 3.0 | [design-brief](phase-3.0-design-brief.md) | — | `67062c6` |
| 3.1 | [accesstoken-cell](phase-3.1-accesstoken-cell.md) | #7 | `1f8863d` |
| 3.2 | [list-masking](phase-3.2-list-masking.md) | #1 | `52ee2ba` |
| 3.3 | [detail-view-grouping](phase-3.3-detail-view-grouping.md) | UX | `cbea9ac` |
| 3.4 | [confirmation-modals](phase-3.4-confirmation-modals.md) | audit sec. D | `4041756` |
| 3.5 | [resend-notice-copy](phase-3.5-resend-notice-copy.md) | audit gap | `3dd206a` |
| 3.5.1 | [expose-resend-ui-entry](phase-3.5.1-expose-resend-ui-entry.md) | smoke test finding | `92406af` |

## Smoke test checklist (verified via browser automation, 2026-10-16)

- [x] **3.1** List: cell `••••••••••••{last4}`; click reveal full 32-hex; copy writes full token; icon ⧉→✓→⧉; reload re-masks.
- [x] **3.2** List: email `a••@gmail.com`, phone `8•••••••12`, WA `+62••••••••12`; detail penuh.
- [x] **3.3** 3 collapsible baru (Pricing expanded, Payment+Request History collapsed); 11 field un-hidden; `receiptNumber`+`paymentAuditLog`+audit DOM `disabled`; `paymentBank`+`hasRequestedChange` editable.
- [x] **3.4** departureDate edit pada confirmed → modal "Ubah tanggal keberangkatan?"; Cancel revert. hasRequestedChange un-check → modal "Reset flag"; set-forward tidak prompt.
- [x] **3.5+3.5.1** Tombol "Confirm Payment & Send Receipt" muncul di confirmed booking; modal render warning dengan live `customerEmail` + `receiptNumber` + `receiptIssuedAt` (Asia/Makassar); submit button rename "Confirm & Send Receipt (Resend)".

## Follow-up findings addressed

- #1 Medium → **done-unverified** (3.2 UI mask untuk email/WA/phone; passport dates sudah 2.2 server lock).
- #7 Low → **done-unverified** (3.1 AccessTokenCell).
- UX gaps audit section D → **done-unverified** (3.3/3.4/3.5/3.5.1).

## Scope reduction documented

- **3.3**: skip wrap `Customer`/`Trip` collapsibles — butuh re-indent 300+ baris existing field blocks tanpa UX win baru. Deferred ke follow-up kalau user mau.
- **3.4**: skip custom delete-booking confirm — Payload native dialog cukup + konsisten dengan finding #8 "admin trusted" (accepted).

## Patch note

**3.5.1** adalah hasil smoke test: `statusToKinds('confirmed')` return `[]` → tombol resend tidak muncul → warning 3.5 unreachable. Fix 1-line menambah `['ticket']` untuk status `confirmed`. Pre-existing gap, bukan dari Stage 3 code.
