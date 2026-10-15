# Phase 4.14 — Users Collection Redesign

> **Status:** ✅ Tracks A + B shipped (owner approved 2026-08-28) —
> avatar/phone/address/enabled/lastLoginAt fields, main-content tabs
> (Profile / Security / Activity), avatar list cell, password
> generator, force-unlock button. tsc clean. Awaiting DB schema push +
> login verify. Tracks C (email forgot-password) and D (WhatsApp
> reset) deferred to future improvements (see §11).
> **Scope:** Enrich Users with avatar/phone/address, tidy the edit view,
> and document a safe password-management flow.
> **Date:** 2026-08-28
> **Payload:** 3.33.0 · **DB:** SQLite (dev) / D1 (prod target)

---

## 0. TL;DR

- **Add 3 new fields** (avatar upload, phone, address) — pure schema
  add, no data migration for existing rows (columns default nullable).
- **Password rules (non-negotiable):** passwords are ONE-WAY hashed
  (Payload uses PBKDF2-SHA256 via `crypto.pbkdf2`) → never viewable to
  anyone, including super-admin. Payload's admin edit view already
  enforces this: it exposes a "Change Password" input on your own doc
  and lets super-admin write a new password onto another user (Payload
  hashes it before store). It **never renders** or exposes the hash.
- **Native password flows Payload already ships:** `changePassword`
  (via editing the user doc), `resetPassword` (token), `forgotPassword`
  (sends token via email), `unlock` (clears lockout after N failed
  logins). All work today. The only missing infrastructure is the
  **email adapter** — not configured in `payload.config.ts` — so the
  forgot-password email flow won't send emails until it is.
- **Recommendation:** ship the profile fields + super-admin password
  reset flow now (both feasible with zero infra). Defer email-based
  forgot-password until an email adapter is chosen (Phase 5 prep).
- **Effort:** ~4–6 h implementation + 1 h admin sanity + 1 DB schema push.

---

## 1. Current state (audit)

### 1.1 Users.ts (as of `f176492`)

```ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,                        // ← Payload auto-adds email, password, salt, hash, resetPasswordToken, resetPasswordExpiration, loginAttempts, lockUntil
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    hidden: ({ user }) => user?.role !== 'super-admin',  // sidebar-hidden for admin/editor
  },
  access: {
    read: authenticatedRead,          // any signed-in user can read (needed so /me works)
    create: isSuperAdmin,             // only super-admin can create new users
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return user.id === id           // otherwise: only self
    },
    delete: isSuperAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', required: true, defaultValue: 'editor',
      options: [/* editor / admin / super-admin */],
      access: { update: ({ req }) => req.user?.role === 'super-admin' },
      admin: { position: 'sidebar' },
    },
  ],
}
```

### 1.2 Fields Payload auto-adds when `auth: true`

From `payload/dist/auth/baseFields/*.d.ts`:

| Field | Purpose | Storage | Viewable? |
|---|---|---|---|
| `email` | Login identifier | plain text | Yes (admin UI) |
| `password` | User password | **PBKDF2-hashed** into `hash` + `salt` columns | **NO — write-only input** |
| `salt` | PBKDF2 salt | random per user | never rendered |
| `hash` | PBKDF2 hash | one-way | never rendered |
| `resetPasswordToken` | Forgot-password token | random | admin-visible for debug |
| `resetPasswordExpiration` | Token expiry | timestamp | admin-visible |
| `loginAttempts` | Failed login counter | integer | admin-visible |
| `lockUntil` | Lockout timestamp | timestamp | admin-visible |
| `sessions` | Active session list | array | admin-visible |

**Password write UI** is a plain input in the admin edit view — Payload
hashes on save. There is NO endpoint or admin surface that reveals the
existing password.

### 1.3 Access control matrix (verified against roles.ts + Users.ts)

| Action | super-admin | admin | editor |
|---|:-:|:-:|:-:|
| See Users in sidebar nav | ✅ | ❌ (hidden) | ❌ (hidden) |
| Read any user | ✅ | ✅ (via `/me` etc.) | ✅ |
| Create user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| Update ANY user | ✅ | ❌ | ❌ |
| Update SELF | ✅ | ✅ | ✅ |
| Change SELF password | ✅ | ✅ | ✅ (via password input on own doc) |
| Reset ANOTHER user's password | ✅ (write new value on doc) | ❌ | ❌ |
| Change `role` field | ✅ (field-level access) | ❌ | ❌ |

### 1.4 Email adapter — NOT configured

`grep -iE 'email:' apps/cms/src/payload.config.ts` → no match. Payload's
`email` config on `buildConfig` is absent. **Forgot-password flow will
error until an adapter is added.** Options:
- `@payloadcms/email-nodemailer` (SMTP)
- `@payloadcms/email-resend` (Resend API)
- Custom adapter (any transport implementing `sendEmail`)

### 1.5 Current UI (Payload defaults)

- **Users list:** default table `id | email` (no chip / no timestamps).
- **User edit view:** default form: `email` input, `Change Password`
  section (with confirm), `name` input, sidebar with `role`. Sessions,
  lockUntil, resetPasswordToken visible to super-admin (Payload auto-
  hides them for non-super-admin via the field's own access rules).

---

## 2. New field analysis

### 2.1 Field-by-field proposal

| Field | Type | Required | Access — read | Access — write | Migration |
|---|---|:-:|---|---|---|
| **`avatar`** | `upload → media` | ❌ | any authenticated | self OR super-admin | +1 nullable FK column |
| **`name`** | already exists (`text`, required) | — | — | self OR super-admin (default) | ✅ no change |
| **`email`** | Payload auth field | ✅ | any authenticated | self OR super-admin | ✅ no change |
| **`phone`** | `text` (with format hint) | ❌ | any authenticated | self OR super-admin | +1 nullable column |
| **`address`** | `textarea` | ❌ | any authenticated | self OR super-admin | +1 nullable column |

**Optional additions worth considering:**
- `lastLoginAt` — Payload doesn't track this natively; could add via a
  `beforeLogin` hook writing to a nullable timestamp. Useful for the
  edit-view "Last login: 2h ago" mockup.
- `title` (Job title, e.g. "Content Editor") — nice-to-have; skip
  unless requested.

### 2.2 DB migration assessment

**Risk: LOW.** SQLite (dev) via Drizzle + Payload's schema push:
- All 3 new columns are **nullable** with no default → existing rows
  remain valid without backfill.
- No column TYPE changes → no rewrite of existing values.
- No rename of `email`/`password`/`role` → auth untouched.
- Migration flow: `pnpm dev` in CMS will prompt "create column? [y/n]"
  three times → answer `+ create column` for each.
- Production (D1 target): same push mechanism; test on a copy before
  running prod.

**Not risky, but do:**
- Take a `cms.db.bak-4.14` before schema push (project convention — see
  Phase 3.23 for the same pattern).
- Verify `/api/users/me` still returns the expected shape after push.
- Verify existing users can still log in.

### 2.3 Avatar rendering plan

- Field: `{ name: 'avatar', type: 'upload', relationTo: 'media' }` with
  `admin.description` on max size / recommended dimensions.
- **List view:** small round thumbnail in the leftmost custom cell
  (reuse the pattern from Phase 4.11 media grid — same asset URL path).
- **Edit view:** show the avatar as a large circular preview at the top
  of the "Profile" tab; fall back to the SidebarFooter initials avatar
  when empty (already implemented in `admin/SidebarFooter.tsx`).
- **Sidebar nav profile card:** update `SidebarFooter.tsx` to read
  `user?.avatar?.url` (populated because the sidebar footer already
  fetches `useAuth().user`); fall back to initials as today.

### 2.4 Validation

- **Phone:** loose regex OK (`/^[+0-9 ()-]{6,20}$/`); leave strict E.164
  validation to a future WhatsApp integration.
- **Address:** free text, `maxLength: 500` to bound row size.
- **Avatar:** rely on Media collection's `mimeTypes` filter (already
  restricts to image types).

---

## 3. Password & security analysis

### 3.1 Security rule (non-negotiable)

> Passwords are stored as one-way PBKDF2-SHA256 hashes (Payload's
> `password → hash + salt` fields, verified in
> `payload/dist/auth/crypto.d.ts`). They cannot be reversed. No admin
> surface — including super-admin — will ever be given a "view
> password" capability. Anyone asking for that pattern is asking to
> break the security model. Refuse.

Applies to every proposal below.

### 3.2 Option matrix

| Option | Feasible now? | Payload native? | Depends on | Risk | Effort |
|---|:-:|:-:|---|:-:|---|
| **1 — Self-service password change** | ✅ YES | ✅ **Native** | none | 🟢 LOW | 0 h (already works) |
| **2 — Super-admin resets another user's password** | ✅ YES | ✅ **Native** (write to `password` field on that doc; Payload hashes) | none | 🟢 LOW | 0.5–1 h polish |
| **3 — Forgot password (email token)** | ⚠️ PARTIAL | ✅ endpoint native | **Email adapter required** | 🟡 MED | 2–3 h + adapter setup |
| **4 — Reset by WhatsApp** | ❌ NO | ❌ | Meta / Twilio / 360Dialog WA Business API | 🔴 HIGH | 3–5 d + monthly $$ + KYC |

**Recommendation for Phase 4.14:** Ship Options 1 + 2 now (both zero
infra). Document Option 3 as unblocked by an email-adapter decision
(Phase 5). Defer Option 4 — WA Business API needs a business account,
template approval, and adds recurring cost; not worth it when email
covers 99% of resets.

### 3.3 Native flow details

**Option 1 — self-change:** Payload's edit-your-own-doc form already
shows a "Change Password" section (new + confirm). Access: self only
(collection `update` access + field-level `access` on `password` gates
this). No code needed.

**Option 2 — super-admin reset:** Same "Change Password" section
appears when super-admin edits ANOTHER user's doc (because
collection-level `update` access permits super-admin on any id). Type
a new password → save → Payload hashes → user must log in with new
password. **Polish opportunity:** add a small "Generate random 16-char
password" helper button next to the field (custom Field component,
zero server-side change; the button just calls `crypto.getRandomValues`
+ populates the input for admin to copy-paste to the user out-of-band).

**Option 3 — forgot password:** Payload exposes
`POST /api/users/forgot-password` which:
1. Looks up the user by email
2. Writes `resetPasswordToken` + `resetPasswordExpiration` on the doc
3. Calls the configured email adapter with a templated reset link
   (default template lives in
   `payload/dist/auth/generateEmailHTML.d.ts`)

Without an email adapter, step 3 throws. To enable:
```ts
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'no-reply@dnjourneysbali.com',
    defaultFromName: 'DnJourneysBali CMS',
    transportOptions: { host: '…', port: 587, auth: { user, pass } },
  }),
  …
})
```
Login page needs a "Forgot password?" link → Payload ships one when a
reset endpoint is configured (verify after adapter add).

**Option 4 — WhatsApp:** don't bother. Meta requires a WA Business
account, template pre-approval per message (24h turnaround), and
$0.005–$0.09 per conversation depending on region — plus the developer
work to sign requests and handle webhooks for delivery status. Email
is free and universal.

### 3.4 Access control ratification

Task's matrix matches what Payload/Users.ts already enforces today.
**No change needed** — verified above:

| Action | super-admin | admin | editor |
|---|:-:|:-:|:-:|
| Change own password | ✅ | ✅ | ✅ |
| Reset another user's password | ✅ | ❌ | ❌ |
| View any user's password | ❌ | ❌ | ❌ |
| Force unlock | ✅ (POST `/api/users/unlock`) | ❌ | ❌ |
| Create new users | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Edit user profile (name/phone/address/avatar) | ✅ any | ✅ own | ✅ own |
| Change user role | ✅ | ❌ | ❌ |

To add: expose a "Force unlock" button on the super-admin edit view
that POSTs the `unlock` endpoint. Small custom component. Nice-to-have.

---

## 4. UI/UX design proposal

Payload's edit view already gives us a sidebar (Role) + main column.
Use the Phase 4.8 tabs helper here too so the main column is organized:

```
┌──────────────────────────────────────────────────────────────────┐
│ [← Back]  User: John Doe                    Edit · API   Save ⋮ │
├──────────────────────────────────────────────────────────┬───────┤
│                                                          │ ROLE  │
│  ┌──────────────────────────────┐                        │  Super │
│  │ [Avatar circle]  John Doe    │                        │  Admin ▾│
│  │      📷          admin@x.com │                        │        │
│  └──────────────────────────────┘                        │ STATUS │
│                                                          │  Active│
│  ┌ Tabs ─────────────────────────────────────────────┐   │        │
│  │  Profile · Security · Activity                   │   │ ACCOUNT│
│  ├──────────────────────────────────────────────────┤   │  Force │
│  │  Name       [John Doe                          ] │   │  unlock│
│  │  Email      [admin@x.com                       ] │   │        │
│  │  Phone      [+62 812 xxxx-xxxx                 ] │   │        │
│  │  Address    [Nusa Ceningan                     ] │   │ SESSIONS│
│  │             [Bali, Indonesia                   ] │   │  2 active│
│  └──────────────────────────────────────────────────┘   │        │
└──────────────────────────────────────────────────────────┴───────┘
```

- **Profile tab:** avatar preview + name/email/phone/address inputs
- **Security tab:** the Change-Password section (Payload's native
  input, styled), plus (super-admin only) a "Generate random password"
  helper next to it
- **Activity tab:** `sessions` array, `lastLoginAt` (if we add it),
  `loginAttempts`, `lockUntil` — read-only for auditors
- **Sidebar:** Role (existing) + Status (soft-add: `enabled` boolean,
  gates login without deleting) + Force Unlock button (super-admin) +
  Sessions count

**Header:** phase-4.12 back-arrow already lands there globally. Reuse.

**List view:** apply phase-4.12 StatusCell (if we add a status enum),
`updatedAtRelativeField`, and an avatar column via a new
`UserAvatarCell` (~30 lines, reuses the media-list thumbnail pattern).

---

## 5. Implementation plan (ordered)

**Track A — profile + list view (zero infra, ~2 h):**
1. Backup DB: `cp apps/cms/cms.db apps/cms/cms.db.bak-4.14`.
2. Add fields to `Users.ts`: `avatar` (upload), `phone` (text +
   description), `address` (textarea). Wrap sidebar `role` + optional
   new `enabled` checkbox with `withSidebarTab` (Phase 4.8 helper).
3. Attach `admin.components.Cell` for avatar in list view (new
   `apps/cms/src/admin/cells/UserAvatarCell.tsx`).
4. Set `admin.defaultColumns = ['avatar', 'name', 'email', 'role', 'updatedAtRelative']`.
5. Add `main` tabs via existing `type: 'tabs'` root: `Profile /
   Security / Activity`.
6. `SidebarFooter.tsx`: prefer `user.avatar?.url` over initials.
7. Push schema (`pnpm dev` → `+ create column` × 3).
8. Login-verify each role can only do what §3.4 allows.

**Track B — super-admin password reset polish (~0.5 h):**
9. Small custom field component next to the password input: "Generate
   random 16-char" button (client-side; fills the input, admin
   copies-and-sends via WA/other out-of-band).
10. "Force unlock" button component on Security tab (POSTs
    `/api/users/unlock` with email); super-admin-only via field access.

**Track C — email-driven reset (blocked, do NOT ship in 4.14):**
11. **Decision needed:** pick email adapter (Resend recommended for
    Cloudflare-friendly deploy; SMTP works for a client-hosted mail
    server).
12. Add `email:` config to `payload.config.ts` with credentials from
    env vars.
13. Customize `forgotPassword` email HTML if branded template needed.
14. Add "Forgot password?" link to login page (Payload ships this once
    email is configured — verify).
15. Test end-to-end: request reset → email arrives → token link opens
    → new password saved → login works.

---

## 6. Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|:-:|:-:|---|
| Schema push fails on existing users | Low | Medium | All new columns nullable; backup DB first |
| Custom sidebar tabs conflict with existing role sidebar | Low | Low | Use same `withSidebarTab` helper, already proven across 14 collections |
| Avatar upload creates orphaned media | Low | Low | Media collection already has delete gate; UI shows preview on save |
| Broken auth (worst case) | Very Low | Critical | Track A doesn't touch `email`/`password`/`role`/`salt`/`hash`; auth surface untouched |
| Forgot-password email spam / relay abuse | Medium (only if Track C) | Medium | Configure rate limits + SPF/DKIM/DMARC on chosen adapter (Phase 5 concern) |
| Phone/address field misuse as unstructured PII | Low | Low | Optional fields; document data-retention in privacy notes |

---

## 7. Estimated effort

| Track | Effort |
|---|---|
| A — profile fields + list view + edit tabs | 3–4 h code + 0.5 h DB push + 0.5 h verify |
| B — super-admin reset polish + Force Unlock | 0.5–1 h |
| C — email adapter (blocked on decision) | 2–3 h once adapter chosen |

**Total for shipping now (A + B):** ~4–6 h.
**Total including C:** +2–3 h + adapter subscription/config.

---

## 8. Owner decisions required

1. **Add fields Y/N?** — Track A. My recommendation: YES, low risk, high user value.
2. **Add `enabled` (soft-disable) flag Y/N?** — nice to have, lets
   super-admin lock a user without deleting.
3. **Email adapter choice** for Track C — Resend / Nodemailer / other?
4. **`lastLoginAt` field Y/N?** — one extra hook + column; enables the
   "Last login: 2h ago" line in the mockup.

---

## 9. Files that would change (planning only — no edits made)

- `apps/cms/src/collections/Users.ts` (add fields + tabs + Cell refs)
- `apps/cms/src/admin/cells/UserAvatarCell.tsx` (NEW)
- `apps/cms/src/admin/SidebarFooter.tsx` (read avatar URL)
- `apps/cms/src/admin/PasswordGeneratorButton.tsx` (NEW, Track B)
- `apps/cms/src/admin/ForceUnlockButton.tsx` (NEW, Track B)
- `apps/cms/src/payload.config.ts` (Track C only: `email:` block)
- `apps/cms/cms.db` (schema push adds 3 columns; back it up first)
- `apps/cms/src/app/(payload)/admin/importMap.js` (auto-regenerated)

No frontend (Astro) files affected.

---

## 10. Implementation notes (added 2026-08-28)

### Files added
| File | Purpose |
|------|---------|
| `apps/cms/src/hooks/updateLastLogin.ts` | `afterLogin` collection hook — writes `lastLoginAt` (ISO) via `req.payload.update` with `overrideAccess: true`. Swallows errors so a stat-write failure never blocks login. |
| `apps/cms/src/admin/cells/UserAvatarCell.tsx` | Circular 32px avatar cell for the list view. Uses `avatar.thumbnailURL || avatar.url`; falls back to name/email initials. |
| `apps/cms/src/admin/PasswordGeneratorButton.tsx` | Client-side 16-char password generator (`crypto.getRandomValues`); auto-copies to clipboard; auto-hides after 30s to reduce shoulder-surf risk. Never writes to the password field automatically — super-admin copy-pastes into Payload's native input which is hashed on save. |
| `apps/cms/src/admin/ForceUnlockButton.tsx` | POSTs the native `/api/users/unlock` endpoint with the current form's email. Success/error inline message; super-admin gated via `admin.condition`. |
| `apps/cms/src/admin/users-editor.css` | Circular avatar cell + password generator card + force unlock card styling. Theme-aware. |

### Files modified
- `apps/cms/src/collections/Users.ts` — completely rewritten:
  - New fields: `avatar` (upload → media, with `UserAvatarCell`), `phone` (text + regex validate), `address` (textarea, max 500), `enabled` (checkbox, sidebar, super-admin write), `lastLoginAt` (date, readOnly, `access.update: () => false`).
  - `admin.defaultColumns` = `['avatar', 'name', 'email', 'role', 'updatedAtRelative']`.
  - `admin.listSearchableFields` = `['name', 'email']`.
  - Sidebar tabs (Phase 4.9 helper): `role` in **General**, `enabled` in **Publishing**.
  - Main tabs (Phase 4.10 sticky pill styling): **Profile** (avatar/name/phone/address) · **Security** (password generator + force unlock, both super-admin gated) · **Activity** (lastLoginAt, read-only).
  - `hooks.afterLogin: [updateLastLogin]`.
- `apps/cms/src/admin/SidebarFooter.tsx` — prefers `user.avatar?.thumbnailURL || user.avatar?.url`; falls back to existing initials chip.
- `apps/cms/src/admin/AdminStyles.tsx` — imports `users-editor.css`.
- `apps/cms/src/app/(payload)/admin/importMap.js` — Payload auto-regenerates on next `pnpm dev` boot (4 new component paths).

### Security posture (unchanged)
- Payload's password/salt/hash fields still one-way PBKDF2-SHA256, never rendered or returned by any API.
- The generator's plaintext value lives only in the browser (state + clipboard), auto-clears in 30s. Never sent to any server — super-admin still pastes it into Payload's own password input, which handles hashing.
- Force Unlock uses Payload's native endpoint; access = super-admin only, enforced both at the button visibility layer (`admin.condition`) AND at the collection `update` access + field access on `role`. Non-super-admins never see the Security tab UI hooks.

### DB migration (required after this commit)
The three new columns (`avatar`, `phone`, `address`, `enabled`, `lastLoginAt`) are all nullable → no data risk for existing rows.

Runbook:
```bash
# 1. backup
cp apps/cms/cms.db apps/cms/cms.db.bak-4.14

# 2. stop dev cleanly (SQLite lock)
#    then start dev — Drizzle prompts once per new column:
pnpm --filter cms dev
# → answer `+ create column` for avatar_id, phone, address, enabled, last_login_at

# 3. verify /api/users/me still returns the expected shape
# 4. verify existing users can still log in
```

### Rollback
- Revert this commit.
- Drop the 5 added columns manually if you also want the schema clean — otherwise leaving them nullable is harmless (they just sit empty). `cms.db.bak-4.14` restores the pre-4.14 state as a nuclear option.
- No Astro / no auth-surface change to undo.

---

## 11. Future improvements (Tracks C + D — DEFERRED)

Per owner decision on 2026-08-28: these remain valuable but are OUT OF
SCOPE for Phase 4.14. Ship when ready.

### Track C — Email forgot-password (blocked on infra decision)
- Payload's `POST /api/users/forgot-password` + `/api/users/reset-password`
  endpoints already ship. Missing piece is the **email adapter**.
- Recommended: `@payloadcms/email-resend` for a Cloudflare-friendly
  deploy (matches the Phase 5 target). Falls back gracefully to
  `@payloadcms/email-nodemailer` if the client already has an SMTP
  relay.
- Estimated work once adapter is picked: 2–3 h (adapter install +
  `email:` config in `payload.config.ts` with env-driven credentials +
  optional branded HTML template + "Forgot password?" link visibility
  check on login page).
- Deploy considerations: SPF / DKIM / DMARC on the sending domain,
  rate-limit the endpoint to avoid abuse, verify Cloudflare Workers
  outbound-email compatibility.

### Track D — WhatsApp password reset (long horizon)
- Requires Meta / Twilio / 360Dialog WhatsApp Business API access, a
  business account, template message pre-approval per market, and
  handles delivery-status webhooks.
- Cost model: $0.005–$0.09 per conversation depending on region; plus
  provider monthly fee.
- Estimated work: 3–5 days once WA Business account is provisioned.
- Recommendation: **only pursue if a real user population cannot
  reliably receive email** — email covers ~99% of resets at zero
  incremental cost. Revisit alongside a broader multi-channel notification
  strategy, not in isolation.

### Nice-to-have polish (optional, later)
- `sessions` array — render as a "signed in from X since Y" list on the
  Activity tab (Payload already tracks sessions natively).
- 2FA / TOTP — Payload supports via plugin; document if we ever need
  compliance-grade auth.
- Audit log — hook `afterChange` on Users to append a row to a
  `user_activity_log` collection whenever role/enabled/password
  changes. Only if a compliance requirement surfaces.
