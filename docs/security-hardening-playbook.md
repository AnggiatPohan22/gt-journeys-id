# Security Hardening & Booking UI Playbook

Master reference for Claude Code. Source: read-only security audit of Bookings (Oct 2026).
Place this file at `docs/security-hardening-playbook.md` in the repo.

---

## 0. HOW YOU (THE AGENT) MUST USE THIS FILE

1. Read this repo's rules file (AGENTS.md / CLAUDE.md) first, then this file.
2. Work on **ONE step at a time**, and ONLY the step the user names
   (e.g. "do step 1.2"). Never start the next step on your own, even if it
   looks trivial or related.
3. Before starting a step, check the Progress Tracker (section 2):
   - All earlier steps in the same stage must be `MERGED` or explicitly
     skipped by the user. If not, STOP and tell the user.
4. Branch rule: **one stage = one branch created from the current `main`**
   (names given per stage). Never branch from another feature branch.
5. Commit rule: **one step = one commit** (separate concern per commit).
   Do not mix unrelated changes. Do not touch files outside the step's scope.
6. After finishing a step:
   - Run relevant type-check/tests that do not modify tracked files.
   - Update the step's status in section 2 to `DONE-UNVERIFIED`.
   - Report using the report format in section 3.
   - **STOP and wait for the user's verification.** Do not merge, push to
     main, tag, or delete branches unless the user explicitly asks.
7. Hard rules (always):
   - No schema change, new package, rename of routes/collections/fields, or
     auth/security logic change beyond what the step says. If a step seems to
     require one, STOP and ask.
   - Do not print real secrets or real customer data in reports (mask them).
   - Do not force-push, reset --hard, or delete branches/tags.
   - Keep `backup/pre-merge-*` tags untouched.
   - Do not reintroduce deferred work (see section 5).
8. If the code contradicts an assumption in this file, trust the code, report
   the difference, and ask before proceeding.
9. Language: code, commits, and this file in English. **Reports to the user in
   Bahasa Indonesia** (casual but clear). Keep identifiers/paths in original form.

---

## 1. Context

- Project: GtJourneysID, monorepo: `apps/cms` (Payload v3 on Next.js, deployed
  to Cloudflare Workers via opennextjs-cloudflare, D1/libsql, R2) and
  `apps/web` (Astro). The two apps deploy separately; never mix concerns.
- The business is a THIRD-PARTY booking agent (not the ferry operator),
  currently an individual (no legal entity). Never write "PT" or any
  legal-entity wording. Never generate anything that looks like an operator
  ticket.
- State: main = develop = `cd4d55b` (phases 4.33 to 4.72 merged). Not yet
  deployed to production.
- Audit finding numbers (#1 to #22) below refer to the audit report. The user
  has the full report; findings are summarized in section 6.

---

## 2. Progress Tracker

Status values: `TODO` | `IN-PROGRESS` | `DONE-UNVERIFIED` | `VERIFIED` | `MERGED` | `SKIPPED`
Owner: `USER` = the user does it manually, agent must not. `AGENT` = agent does it.

| Step | Owner | Description | Findings | Status |
|---|---|---|---|---|
| 0.1 | USER | Decide GitHub branch protection (allow merge commits, keep PR required) | n/a | VERIFIED |
| 0.2 | USER | Run typecheck (cms, web), shared tests, run migration 4.72 on local D1, check price display | n/a | VERIFIED |
| 0.3 | AGENT | Add "Deferred" section to docs | n/a | MERGED |
| 0.4 | AGENT | Create `docs/security-followups.md` tracker | all | MERGED |
| 1.1 | AGENT | Disable Send buttons while request in flight | #2, #3 | VERIFIED |
| 1.2 | AGENT | send-ticket server guard against rapid duplicate requests | #3 | DONE-UNVERIFIED |
| 1.3 | AGENT | send-payment optimistic lock | #2 | TODO |
| 1.4 | AGENT | Disable GraphQL | #15 | TODO |
| 1.5 | AGENT | Explicit login lockout config | #17 | TODO |
| 2.1 | AGENT | Lock audit/receipt fields from manual update | #4, #5 | TODO |
| 2.2 | AGENT | Super-admin-only update for passport dates and dateOfBirth | #1 (partial) | TODO |
| 2.3 | AGENT | Auto audit log on manual edits of payment/departure fields | audit gap | TODO |
| 3.0 | AGENT | Booking UI design BRIEF only (no code) | #1, #7 | TODO |
| 3.1 | AGENT | accessToken cell: mask + click-to-reveal + copy | #7 | TODO |
| 3.2 | AGENT | List view masking for email/WhatsApp/passport | #1 | TODO |
| 3.3 | AGENT | Friendlier detail layout (grouped sections) | UX | TODO |
| 3.4 | AGENT | Confirmation modals for risky actions | audit sec. D | TODO |
| 3.5 | AGENT | Resend notice: customer receives a second receipt | audit gap | TODO |
| 4.x | MIXED | Pre-production checklist (section 4) | #9, #10, #11 | TODO |

When you complete or change a step, update this table in the same commit.

---

## 3. Report format (after each step, in Bahasa Indonesia)

```
## Step X.Y: <name>

### Yang berubah
- `path/file` : apa yang berubah

### Dampak
- DB/schema: tidak ada | ...
- Route/endpoint: tidak ada | ...
- Perilaku yang berubah: ...

### Cara tes manual (untuk user)
1. ...
2. ...

### Rollback
`git revert <hash>`

### Yang belum bisa diverifikasi
...

### Status
DONE-UNVERIFIED. Menunggu verifikasi user.
```

---

## 4. STEPS

### STAGE 0: Preparation

**0.1 (USER)** Decide GitHub branch protection. Recommended: allow merge
commits (project uses `--no-ff` to keep per-phase history), keep "require PR".
When merging PRs use "Create a merge commit" (never squash or rebase: it
destroys per-phase history and changes hashes referenced by tags/docs).

**0.2 (USER)** Run locally: typecheck for cms and web, `@gt-journeys/shared`
tests, apply migration 4.72 to local D1, check price formatting in the admin
preview. Only known allowed type error: `not-found.tsx:12`.

**0.3 (AGENT)** Branch `docs/deferred-index` from `main`.
Add a `## Deferred` section to `docs/post-deploy-todo.md` (or the phase series
index if more appropriate; state which you chose) listing:
- 4.70.3.2 Upload operator e-ticket per booking: waiting for operator
  (no agent agreement, ticket format unknown).
- 4.70.3.3 Voucher PDF: only if the operator allows it.
- 4.71 Fix C: admin list cell for `departureDate` (date-only display).
- 4.71.1 extras: deadline reminder email, timezone selector in CMS, rename
  "Bank Accounts" tab to "Payment Settings & Banks".
Include the reason for each. Docs only. One commit. Report, stop.

**0.4 (AGENT)** Branch `docs/security-followups` from `main`.
Create `docs/security-followups.md` with a table of all 22 audit findings
(section 6 of this file has the list): columns Finding | Severity | Planned step |
Status | Notes. Statuses per section 6. Docs only. One commit. Report, stop.

### STAGE 1: Quick fixes. Branch `fix/booking-security-quick`

Create the branch from `main` at the start of 1.1. Steps 1.2 to 1.5 continue on
the same branch. One commit per step.

**1.1 Disable Send buttons while in flight.**
File: `apps/cms/src/admin/BookingAdminActions.tsx`. For send-payment and
send-ticket modals (and ideally all confirm/decline actions), disable the
submit button and show a loading state from click until the response returns.
Also guard against re-entry in the handler (ignore clicks while a request is
pending). Test: rapid double-click sends one request.

**1.2 send-ticket server guard.**
File: `apps/cms/src/collections/Bookings.ts` (sendTicketEndpoint).
Reject a second request for the same booking within 30 seconds of the previous
attempt, with a clear 409 message (Indonesian, user-facing).
**IMPORTANT: keep the per-attempt idempotency key. Do NOT change it to a
per-user key.** A deliberate resend after a PDF failure must still send a new
email with the PDF. A resend after the 30 second window must work.
Use an existing field or timestamp if possible. If a new field/schema is
needed, STOP and ask before adding it.
Preview requests (`previewOnly`) must not be blocked or counted as attempts.

**1.3 send-payment optimistic lock.**
In the send-payment endpoint, make the status update conditional on the
current status still being `awaiting_review` (e.g. `where` clause on the
update), so two parallel requests cannot both succeed. If the update affects
zero rows, return 409 and do not send a duplicate email (check ordering:
if the email is sent before the update today, report the race and propose the
safest ordering before changing it).

**1.4 Disable GraphQL.**
In `apps/cms/src/payload.config.ts` set `graphql: { disable: true }`.
FIRST grep both apps for any use of `/api/graphql` or GraphQL clients; if any
exist, STOP and report. Confirm the Payload admin panel still works.

**1.5 Explicit login lockout.**
In `apps/cms/src/collections/Users.ts` auth config set `maxLoginAttempts: 5`
and `lockTime: 600000` explicitly (check Payload v3 option names in the
installed version first).

After 1.5: update tracker + `docs/security-followups.md`, report manual tests
for all five items, STOP. User verifies, then merges (PR with "Create a merge
commit") and deletes the branch.

### STAGE 2: Data integrity locks. Branch `fix/booking-field-locks`

New branch from the updated `main` (after Stage 1 is merged). No schema
changes, so no migrations.

**2.1 Lock append-only/frozen fields.**
Set `access: { update: () => false }` on `paymentAuditLog`, `receiptNumber`,
`receiptIssuedAt` in `Bookings.ts`. The endpoints write them with
`overrideAccess: true`, which must keep working.
**Mandatory test:** full flow on a fresh booking created through the web app
(API key path): create, send-payment, send-ticket (receipt), resend, and
confirm nothing is rejected by the new access rules.

**2.2 Super-admin-only update for passport dates and dateOfBirth.**
Apply `superAdminFieldAccess` update access to `passengers[].dateOfBirth`,
`passportIssueDate`, `passportExpiryDate` (passportNumber already has it).
**DO NOT lock `customerEmail`, `customerWhatsapp`, or `contactPhone`**:
regular admins must be able to fix typos. Those get UI masking later (step 3.2).

**2.3 Auto audit log for manual edits.**
Add a `beforeChange` hook (or equivalent) that appends to `paymentAuditLog`
(old -> new, user, timestamp) when `paymentBank`, `paymentDate`, or
`departureDate` is changed manually on a booking whose status is
`confirmed` (or later). Must not duplicate entries already written by the
send-ticket resend flow. Must not log personal data beyond these fields.

After 2.3: update tracker + followups doc, report, STOP. Cross-role test (user):
log in as super-admin, admin, editor and compare real behavior with the audit's
access matrix.

### STAGE 3: Booking UI redesign. Branch `feat/booking-ui-redesign`

New branch from the updated `main`.

**3.0 Design brief ONLY (no code).**
Produce `docs/booking-ui-redesign-brief.md` (in Bahasa Indonesia, since the
user reviews it): current UI problems (read the existing list/detail/actions
components), proposed layout for list view and detail view, which fields are
masked, where confirmation modals appear, per-role visibility, and a list of
files to change per step 3.1 to 3.5. Use audit section D rules:
- accessToken: masked by default, click-to-reveal, copy button.
- passportNumber: masked in list (last 4).
- customerEmail / WhatsApp / phone: masked in list, full in detail.
- paymentAuditLog, receiptNumber, receiptIssuedAt: always read-only.
- hasRequestedChange: un-check needs a confirmation modal.
STOP after the brief. The user reviews and approves before any code.

**3.1 accessToken cell**: mask (e.g. `************cd4a`), click-to-reveal, copy
to clipboard. Never render plaintext in list cells.

**3.2 List view masking** for email, WhatsApp/phone, passport; full values only
in the detail view.

**3.3 Detail layout**: group into Customer, Trip, Payment, History/Audit.
Preserve all existing fields and actions; do not remove features.

**3.4 Confirmation modals** for: editing `departureDate` after `confirmed`,
un-checking `hasRequestedChange`, changing `paymentBank`/`paymentDate` when
resending from `confirmed`, deleting a booking.

**3.5 Resend notice**: when resending a receipt from `confirmed`, show that the
customer will receive a second receipt, and that receiptNumber/issue date stay
the same.

Each of 3.1 to 3.5 is its own commit, with manual test steps in the report.

### STAGE 4: Before production deploy (checklist; mostly NOT agent code)

Do not start any of these unless the user names the item.

- [ ] (AGENT, after user decision) Create a dedicated API user for web->CMS calls
      with scoped access instead of reusing an admin; rotate `PAYLOAD_API_KEY` (#9).
- [ ] (USER decides, then AGENT implements) Data retention policy for
      passenger PII (UU PDP): e.g. anonymize passport fields after departure
      + N months. Needs a business/legal decision first. Agent must not invent
      the policy (#11).
- [ ] (AGENT) Fix type error `apps/cms/src/app/(payload)/admin/[[...segments]]/not-found.tsx:12`.
- [ ] (AGENT) Replace the `https://example.com` placeholder (`// TODO: set production domain`).
- [ ] (USER) Build and test on Linux/WSL2/CI: `opennextjs-cloudflare build` and
      `preview`; record Worker bundle size; generate one receipt under workerd
      (Phase 4.70.3.1 is unverified on Workers).
- [ ] (USER) Test all 55+ migrations from an EMPTY database on staging, up and down.
- [ ] (USER) Set Cloudflare secrets: `PAYLOAD_SECRET`, `PAYLOAD_API_KEY`,
      `BOOKING_FORM_SECRET`, `CHAT_RETENTION_CRON_KEY`, Resend key. Verify the
      `cleanup-otp` cron trigger is scheduled (#10).
- [ ] (USER) Fill real business name and address in CMS Receipt tab
      (no sample address on a real customer's receipt).
- [ ] (USER) Verify `_redirects` per `docs/post-deploy-todo.md`; smoke-test
      the full checkout flow on staging.
- [ ] (LATER) 2FA plan for super-admin (post-launch acceptable) (#17).

---

## 5. Deferred: DO NOT BUILD

- 4.70.3.2 Upload operator e-ticket per booking (waiting for operator).
- 4.70.3.3 Voucher PDF (only if the operator permits).
- 4.71 Fix C, 4.71.1 extras (reminder email, timezone selector, tab rename).
- Endpoint rename `send-ticket` to `send-receipt` (known technical debt).
- Finding #8 CMS-side admin rate limiting: accepted risk (admin is trusted;
  the web layer already rate-limits customer requests).

---

## 6. Audit findings reference

| # | Area | Severity | Planned step / status |
|---|---|---|---|
| 1 | No field access on customer*/passport dates | Medium | 2.2 (dates only) + 3.2 (UI masking). Email/WhatsApp intentionally NOT locked |
| 2 | send-payment race on double click | Medium | 1.1, 1.3 |
| 3 | send-ticket per-attempt idempotency, double click = 2 emails | High | 1.1, 1.2 (keep per-attempt key) |
| 4 | paymentAuditLog editable by super-admin | Medium | 2.1 |
| 5 | receiptNumber/receiptIssuedAt unguarded | Low | 2.1 |
| 6 | bookingRef enumerable (mitigated by 128-bit token) | Info | accepted |
| 7 | accessToken shown in plaintext in admin | Low | 3.1 |
| 8 | No CMS-side rate limit on admin endpoints | Medium | accepted risk |
| 9 | PAYLOAD_API_KEY belongs to an admin-role user | High | Stage 4 (before production) |
| 10 | OTP cleanup cron must be scheduled | Low | Stage 4 |
| 11 | No retention/cleanup for booking PII | Medium | Stage 4 (needs business/legal decision) |
| 12 | Logs and PII | Info | no action |
| 13 | Email template HTML escaping | Info | no action; do not expand RAW_VARS to customer values |
| 14 | Receipt PDF content | Info | no action |
| 15 | GraphQL not disabled | Medium | 1.4 |
| 16 | enabled/role field access | Info | no action |
| 17 | Login lockout implicit, no 2FA | Low | 1.5 now, 2FA later |
| 18 | Media collection public read | Info | no action; never upload passport scans to Media |
| 19 | bankAccounts readable by all admins | Info | no action |
| 20 | Status transition guards | Info | no action |
| 21 | customerRequestReason escaping | Info | no action |
| 22 | send-ticket validates paymentBank/paymentDate | Info | no action |

---

## 7. How the user will drive you

The user sends one instruction at a time, for example:
- "Do step 0.3"
- "Do step 1.1" (create the stage branch first if it does not exist)
- "Continue to step 1.2"
- "Step 1.2 verified and merged, mark it MERGED, do step 1.3"

On each instruction: confirm preconditions (section 0, rule 3), do only that
step, update the tracker, report in Bahasa Indonesia, STOP.
