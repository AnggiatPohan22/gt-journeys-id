# Booking Hardening Series — Closing Summary (Stage 1 → 4)

**Periode**: 2026-10-15 → 2026-10-16 (2 hari)
**Branch**: 4 feature branch (merged) + 1 docs reorganize branch
**PR**: 8 PR merged ke `main` (#3, #4, #5, #6, #7, #8, #9, #10)
**Commits**: 15 step commits (Stage 1 × 5 + Stage 2 × 3 + Stage 3 × 7 + Stage 4 × 4 + docs)
**Status**: ✅ **All AGENT scope complete.** 📋 Beberapa USER-only items pending sebelum production.

---

## 1. Scope keseluruhan

Hasil dari audit kedua terhadap collection `bookings` (22 finding, Oct 2026). Playbook: [`../../../security-hardening-playbook.md`](../../../security-hardening-playbook.md). Dibagi 4 stage per severity + risk model:

| Stage | Theme | PR | Status |
|---|---|---|---|
| [1 Quick wins](stage-1-quick-wins/README.md) | Idempotency + rate-limit + GraphQL off + login lockout | [#3](https://github.com/AnggiatPohan22/gt-journeys-id/pull/3) | ✅ MERGED |
| [2 Field locks](stage-2-field-locks/README.md) | Server-side `access.update` guards + auto audit hook | [#4](https://github.com/AnggiatPohan22/gt-journeys-id/pull/4) | ✅ MERGED |
| [3 UI redesign](stage-3-ui-redesign/README.md) | Masking + grouping + confirm modals + resend copy | [#5](https://github.com/AnggiatPohan22/gt-journeys-id/pull/5) | ✅ MERGED |
| [4 Pre-production](stage-4-pre-production/README.md) | API user scoping + PII retention + hygiene fixes | #7, #8, #9, #10 | ✅ CODE MERGED · ⏳ USER steps pending |

Dokumen bantuan:
- [Backfill phase reports PR #6](https://github.com/AnggiatPohan22/gt-journeys-id/pull/6) — reorganize report-report ke struktur `booking-hardening/` ini.

---

## 2. Finding resolution matrix (22 finding audit)

### High + Medium (closed)

| # | Severity | Finding | Resolution | Stage |
|---|---|---|---|---|
| #2 | Medium | send-payment race on double click | Client inflight guard + server optimistic lock + rollback-on-email-fail | [1.1](stage-1-quick-wins/phase-1.1-admin-send-button-inflight-guard.md), [1.3](stage-1-quick-wins/phase-1.3-send-payment-optimistic-lock.md) |
| #3 | **High** | send-ticket per-attempt idempotency — double click = 2 emails | Client inflight guard + server 30s rate-limit guard | [1.1](stage-1-quick-wins/phase-1.1-admin-send-button-inflight-guard.md), [1.2](stage-1-quick-wins/phase-1.2-send-ticket-rate-limit.md) |
| #4 | Medium | paymentAuditLog editable by super-admin | `access.update: () => false` server-side | [2.1](stage-2-field-locks/phase-2.1-lock-receipt-audit-fields.md) |
| #5 | Low | receiptNumber / receiptIssuedAt unguarded | Same pattern dengan #4 | [2.1](stage-2-field-locks/phase-2.1-lock-receipt-audit-fields.md) |
| #15 | Medium | GraphQL not disabled | `graphQL: { disable: true }` di payload.config | [1.4](stage-1-quick-wins/phase-1.4-disable-graphql.md) |
| #17 | Low | Login lockout implicit | Explicit `maxLoginAttempts: 5` + `lockTime: 600_000` | [1.5](stage-1-quick-wins/phase-1.5-login-lockout-config.md) · 2FA deferred post-launch |
| #1 | Medium | No field access on customer* / passport dates | 2.2 server lock dates + DOB (`superAdminFieldAccess`); 3.2 UI mask email/WA/phone | [2.2](stage-2-field-locks/phase-2.2-superadmin-passport-dates.md), [3.2](stage-3-ui-redesign/phase-3.2-list-masking.md) |
| #7 | Low | accessToken plaintext in admin list | `AccessTokenCell`: mask + click-to-reveal + copy, no telemetry, reload re-masks | [3.1](stage-3-ui-redesign/phase-3.1-accesstoken-cell.md) |
| #9 | **High** | PAYLOAD_API_KEY belongs to admin-role user | Role baru `api` + `isApiOrAdmin` helper + 3 collection widen (bookings/otp/newsletter) | [4.1](stage-4-pre-production/phase-4.1-api-user-role.md) · ⏳ USER rotate pending |
| #11 | Medium | No retention / cleanup for booking PII | 12-month passport anonymize endpoint + web cron proxy. Dry-run mode. Idempotent | [4.2](stage-4-pre-production/phase-4.2-pii-retention.md) · ⏳ USER staging dry-run + cron activation pending |

### Audit gaps (bukan finding dengan nomor, ditemukan selama kerja)

| Gap | Resolution | Stage |
|---|---|---|
| Manual admin edits (paymentBank/Date/departure) untracked | `beforeChange` hook `auditManualEditHook` dengan suffix `manual-edit` | [2.3](stage-2-field-locks/phase-2.3-auto-audit-log-manual-edits.md) |
| Detail view 40+ field flat; 11 hidden | 3 collapsible baru + un-hide fields | [3.3](stage-3-ui-redesign/phase-3.3-detail-view-grouping.md) |
| Risky-action tanpa confirm (departureDate edit, hasRequestedChange uncheck) | Sibling-UI pattern DepartureDateConfirmGuard + HasRequestedChangeConfirmGuard | [3.4](stage-3-ui-redesign/phase-3.4-confirmation-modals.md) |
| Resend expectation unclear | Enhanced warning dengan live interpolate (email + receiptNumber + issuedAt Asia/Makassar); button rename "(Resend)" | [3.5](stage-3-ui-redesign/phase-3.5-resend-notice-copy.md), [3.5.1](stage-3-ui-redesign/phase-3.5.1-expose-resend-ui-entry.md) |
| Admin scaffold TS2322 (searchParams prop type) | Narrow Args type di `[[...segments]]/not-found.tsx` + `page.tsx` | [4.3](stage-4-pre-production/phase-4.3-fix-admin-scaffold-types.md) |
| `https://example.com` placeholder | Set `https://gtjourneys.id` di `site.ts` + `.env.example` | [4.4](stage-4-pre-production/phase-4.4-set-production-domain.md) |

### Accepted risk / no-action (12 finding)

| # | Severity | Finding | Alasan |
|---|---|---|---|
| #6 | Info | `bookingRef` enumerable | Mitigated by 128-bit accessToken (Phase 4.66.5) |
| #8 | Medium | No CMS-side rate limit admin endpoints | Admin trusted; web rate-limits customer requests |
| #12 | Info | Logs and PII | No sensitive data in logs by design |
| #13 | Info | Email template HTML escaping | Already correct (RAW_VARS not expanded to customer values) |
| #14 | Info | Receipt PDF content | OK |
| #16 | Info | `enabled` / `role` field access | Default access cukup |
| #18 | Info | Media collection public read | By design — jangan upload passport scans ke Media |
| #19 | Info | `bankAccounts` readable by all admins | Admin trusted |
| #20 | Info | Status transition guards | Logic OK |
| #21 | Info | `customerRequestReason` escaping | OK |
| #22 | Info | send-ticket validates paymentBank/paymentDate | OK |
| #10 | Low | OTP cleanup cron scheduling | ⏳ USER verify (Stage 4.7) |

---

## 3. USER manual steps outstanding (sebelum production go-live)

Playbook explicit: **"Do not start any of these unless the user names the item."** AGENT selesai code; USER lanjutkan ops.

### Dari Stage 4 AGENT work
- **4.1 rotate** — bikin user `api-web@internal.gtjourneys.id` role `API Integration` di CMS admin UI → enable API key → `wrangler secret put PAYLOAD_API_KEY` di apps/cms + apps/web → smoke test → disable API key di user admin lama. Detail: [phase-4.1](stage-4-pre-production/phase-4.1-api-user-role.md).
- **4.2 activate** — set `CRON_SECRET` di CF secret kalau belum → dry-run staging via curl → live run manual sekali → setup cron trigger (wrangler.toml weekly `0 2 * * 0` atau external scheduler). Detail: [phase-4.2](stage-4-pre-production/phase-4.2-pii-retention.md).

### Stage 4 USER-only (belum di-touch AGENT)
- **4.5** Build + test `opennextjs-cloudflare build && preview` on Linux/WSL2/CI. Record Worker bundle size. Generate 1 receipt di workerd (Phase 4.70.3.1 unverified on Workers).
- **4.6** Test 55+ migrations from EMPTY DB on staging — up + down.
- **4.7** Set Cloudflare secrets: `PAYLOAD_SECRET`, `PAYLOAD_API_KEY` (dari 4.1), `BOOKING_FORM_SECRET`, `CHAT_RETENTION_CRON_KEY`, Resend key. Verify `cleanup-otp` cron trigger terdaftar (#10 Low).
- **4.8** Fill real business name + address di CMS Receipt tab (replace sample).
- **4.9** Verify `_redirects` per [`docs/post-deploy-todo.md`](../../../post-deploy-todo.md). Smoke staging checkout end-to-end.
- **4.10** 2FA super-admin — deferred post-launch (#17 Low).

---

## 4. Changes aggregate

### Collection schema
- **Zero** schema change / migration (semua additive — field access, hooks, endpoint additions, role option).

### New files (code)
- `apps/cms/src/admin/cells/AccessTokenCell.tsx` (3.1)
- `apps/cms/src/admin/cells/MaskedEmailCell.tsx` (3.2)
- `apps/cms/src/admin/cells/MaskedPhoneCell.tsx` (3.2)
- `apps/cms/src/admin/fields/DepartureDateConfirmGuard.tsx` (3.4)
- `apps/cms/src/admin/fields/HasRequestedChangeConfirmGuard.tsx` (3.4)
- `apps/web/src/pages/api/cron/anonymize-pii.ts` (4.2)

### New files (docs)
- `docs/booking-ui-redesign-brief.md` (3.0, dalam BI)
- 17 phase reports di `docs/phases/phase-4-polish-launch/booking-hardening/` (series overview + 4 stage README + 15 per-step report)
- Dokumen ini (CLOSING-SUMMARY.md)

### Modified files (core logic)
- `apps/cms/src/access/roles.ts` — add `isApi` + `isApiOrAdmin` helpers (4.1)
- `apps/cms/src/collections/Users.ts` — add role option `'api'` + explicit login lockout config (1.5, 4.1)
- `apps/cms/src/collections/Bookings.ts` — field access locks (2.1, 2.2), audit hook (2.3), new collapsibles + un-hide (3.3), confirm guard registrations (3.4), access widen (4.1), anonymize endpoint (4.2)
- `apps/cms/src/collections/OtpVerifications.ts` — access widen (4.1)
- `apps/cms/src/collections/NewsletterSubscribers.ts` — access widen (4.1)
- `apps/cms/src/payload.config.ts` — GraphQL disable (1.4)
- `apps/cms/src/admin/BookingAdminActions.tsx` — inflight guard (1.1), resend copy enhance (3.5), statusToKinds fix (3.5.1)
- `apps/cms/src/admin/list-view.css` — token cell + masked cell styles (3.1, 3.2)
- `apps/cms/src/app/(payload)/admin/[[...segments]]/not-found.tsx` + `page.tsx` — TS2322 fix (4.3)
- `apps/web/src/config/site.ts` + `apps/web/.env.example` — production domain (4.4)

### Autogen regen (manual via `pnpm generate:*`)
- `apps/cms/src/app/(payload)/admin/importMap.js` — register custom components
- `packages/shared/src/types/payload-types.ts` — field descriptions sync

### Trackers kept in sync
- `docs/security-followups.md` — 22-row finding tracker (updated per step)
- `docs/security-hardening-playbook.md` §2 — step status (updated per step)
- `docs/08-SECURITY-PATCH.md` — series row "Phase 4.74" dengan link ke tiap phase report (updated di PR #6)

---

## 5. Testing summary

- **Stage 1**: smoke test via dev CMS + REST probe.
- **Stage 2**: REST attack test (verified dropped).
- **Stage 3**: browser automation via Claude built-in browser pane — AccessToken reveal/copy/re-mask, list masking, collapsibles, confirm modals + revert, enhanced resend warning dengan live values.
- **Stage 4**: tsc clean; dry-run endpoint ready (4.2) — USER staging smoke pending.

---

## 6. Pekerjaan yang sengaja TIDAK dilakukan di series ini

- **Stage 3 Customer/Trip wrap collapsibles** — butuh re-indent 300+ baris existing field blocks tanpa UX win baru. Deferred ke follow-up kalau user mau.
- **Stage 3.4 delete-booking confirm** — Payload native dialog cukup + konsisten dengan finding #8 "admin trusted" accepted.
- **Right-to-deletion endpoint** (customer self-service minta hapus) — separate feature post-launch, bukan Stage 4.2 scope.
- **Chat collection HTTP broken** (pre-existing `create: () => false` + web pakai HTTP) — orthogonal, bukan security hardening scope.
- **2FA super-admin** (#17) — post-launch LATER per playbook.

---

## 7. Rollback guidance

Setiap commit designed independent rollback (merge-commit history preserved via `--merge` strategy, bukan squash). Lihat per-phase report untuk `git revert` command.

**Catatan khusus 4.2**: data yang sudah di-anonymize tidak bisa di-restore dari revert — passport data sudah hilang permanen. Backup D1 kalau mau rollback data; tapi tujuan retention memang bikin hilang permanen (compliance intent).

---

## 8. Kontak + referensi

- Playbook: [`docs/security-hardening-playbook.md`](../../../security-hardening-playbook.md)
- Finding tracker: [`docs/security-followups.md`](../../../security-followups.md)
- Master security log: [`docs/08-SECURITY-PATCH.md`](../../../08-SECURITY-PATCH.md) section "Phase 4.74"
- Design brief Stage 3: [`docs/booking-ui-redesign-brief.md`](../../../booking-ui-redesign-brief.md)
