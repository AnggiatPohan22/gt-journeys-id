## Phase 4.33: Reserved Feature Build-out — Announcement Bar, Promo Banner Modal, Newsletter Signup
**Dates**: 2026-09-07 → 2026-09-09 (initial ship + owner-driven tweaks + hotfixes)
**Status**: ✅ Code complete — awaiting owner final UAT on new tweak surface
**Author**: Claude Code (Opus 4.7)
**Branch**: `feature/phase4-polish-launch`
**Commits (16 total, chronological)**:

Initial build (2026-09-07):
- `2a8c9c0` [cms] Newsletter subscribers collection + FooterSettings newsletter group
- `64b9a1a` [cms] Announcement Bar global + version auto-hash hook
- `4bb0dbb` [cms] Promo Banner global (4 tabs, 2 themes, timed modal)
- `9e6f567` [cms] Site Features — replace reserved labels with real descriptions
- `a1fe15a` [web] Newsletter — modular lib + API endpoint + Footer signup component
- `a700dbb` [web] Announcement Bar — component + BaseLayout inline dismiss check + PageLayout inject
- `e1cc9a2` [web] Promo Banner Modal — timed trigger + frequency cookie + PageLayout inject
- `899527b` [docs] Phase 4.33 report + PROGRESS row (initial)

Hotfixes (2026-09-08, root-cause traced from `pnpm dev` boot):
- `9677f88` [cms] Manual schema finalize + diagnostic scripts (Payload's non-idempotent CREATE INDEX + push race, see §Hotfixes)
- `0abfdd9` [web] Astro 5 removed `output: 'hybrid'` → `output: 'static'` + `@astrojs/cloudflare` adapter
- `890079f` [web] BaseLayout inline `<style>` syntax — template-literal-inside-style broke PostCSS
- `59f6a55` [web] Features cache stale in dev + newsletter wiring landed in dead footer file (pre-Phase-3.24 leftover)

Owner-driven tweaks (2026-09-08 → 2026-09-09):
- `112e5f5` [web] Announcement Bar placement moved from above header → below header
- `f791142` [web+cms] Promo Banner — frequency preset + versioned reset (dropped free-form days)
- `23022cd` [web] Promo Modal locks background scroll while open
- `6c25e48` [web+cms] Announcement Bar reaches feature parity with Promo Banner — 4 tabs, frequency preset, reset checkbox, homepage-scope switch

### Summary
The three "(reserved — Phase 4)" toggles previously flagged by Phase 4.32 are now real, editor-usable features with full CMS content, matching frontend components styled per the Tropical Sophistication tokens, and defensive gate logic (master toggle + content-exists + optional date window + page-scope).

Two of the three (Announcement Bar and Promo Banner) share a common shape after the owner tweaks landed: 4-tab CMS layout, `displayFrequency` preset (30 min / 1 h / 6 h / 12 h / 1 d), auto-versioned dismiss cookie (`version` hashed in `beforeChange`, so any CMS save invalidates all visitor cookies), a `resetVisitorCookies` checkbox for manual reset without content edit, and a `showOnHomepageOnly` Advanced flag. Newsletter is a separate shape (footer section + submission endpoint + subscribers collection) but follows the same "master toggle + content-exists" gate pattern.

### Final CMS surface

**Global: `announcement-bar`** (Settings group, super-admin only, 4 tabs)
- Tab 1 · Content & Theme — `message`, `theme` (ocean/coral/leaf/sand), `dismissible`, `link { enabled, label, url, newTab }` inside a collapsible.
- Tab 2 · Trigger & Behavior — `displayFrequency` select (preset minutes), `resetVisitorCookies` checkbox (auto-unchecks).
- Tab 3 · Schedule — `startDate`, `endDate`.
- Tab 4 · Advanced — `showOnHomepageOnly` (default OFF; AB is usually site-wide).
- Sidebar readOnly — `version` (auto-hashed in `beforeChange` from theme + message + dismissible + displayFrequency + link + homepage-scope + reset nonce).

**Global: `promo-banner`** (Settings group, super-admin only, 4 tabs)
- Tab 1 · Content & Theme — `theme` (theme1-with-image | theme2-text-only), `headline`, `subheadline`, `image` (conditional on theme1; auto-degrades to theme2 layout if theme1 selected without an image), `cta { label, url, newTab }`.
- Tab 2 · Trigger & Behavior — `triggerDelay` (number, 0–60 s), `displayFrequency` select (preset minutes), `suppressAfterScroll` (default true), `resetVisitorCookies` (auto-unchecks).
- Tab 3 · Schedule — `startDate`, `endDate`.
- Tab 4 · Advanced — `showOnHomepageOnly` (default ON; site-wide is opt-in).
- Sidebar readOnly — `version` (auto-hashed).

**Global: `footer-settings`** (existing, extended)
- The `showNewsletter` boolean placeholder retired. Replaced with a `newsletter` group (`heading`, `description`, `placeholderText`, `buttonLabel`, `successMessage`, `errorMessage`, `theme` = ocean/sand/leaf), surfaced inside a collapsible gated by the same footer-template `supports('newsletterToggle')` condition.

**Collection: `newsletter-subscribers`** (new, Administration group)
- `email` (unique, indexed), `status` (active/unsubscribed/bounced), `source` (URL path, readOnly), `userAgent` (readOnly), `ipHash` (SHA-256 of IP + salt, readOnly), `notes`.
- `read` / `create` / `update` = admin+ (create restricted so anon POSTs to Payload's REST endpoint are refused; the Astro API endpoint authenticates as an admin API-key user). `delete` = super-admin only. Editor role: whole collection hidden.

**Global: `site-features`** (existing, relabeled)
- The three placeholders lost the "(reserved — Phase 4)" suffix:
  - `sections.promoBanner` → "Show promotional pop-up modal (content in Promo Banner global)."
  - `sections.newsletter` → "Show newsletter signup section in footer (content in Footer Settings → Newsletter)."
  - `features.announcementBar` → "Show announcement bar below the header (content in Announcement Bar global)."

### Files (create/change) — final set

**CMS (backend):**
- ➕ `apps/cms/src/collections/NewsletterSubscribers.ts`
- ➕ `apps/cms/src/globals/AnnouncementBar.ts` (4 tabs, `beforeChange` hook, `version` sidebar)
- ➕ `apps/cms/src/globals/PromoBanner.ts` (4 tabs, `beforeChange` hook, `version` sidebar)
- ✏️ `apps/cms/src/globals/FooterSettings.ts` (retire `showNewsletter`, add `newsletter` group)
- ✏️ `apps/cms/src/globals/SiteFeatures.ts` (rewrite three descriptions)
- ✏️ `apps/cms/src/payload.config.ts` (register 2 globals + 1 collection)

**CMS scripts (added during hotfix, kept for future reference):**
- ➕ `apps/cms/src/scripts/phase4.33-preflight.ts` — drop retired columns + all Payload indexes so schema push starts clean
- ➕ `apps/cms/src/scripts/phase4.33-diagnose.ts` — read-only DB inspection
- ➕ `apps/cms/src/scripts/phase4.33-finalize.ts` — surgical `ALTER TABLE ADD COLUMN` for the two columns push kept missing (`payload_locked_documents_rels.newsletter_subscribers_id` + `footer_settings.newsletter_*`)
- ➕ `apps/cms/src/scripts/phase4.33-promo-migrate.ts` — retire `display_frequency_days`, add `display_frequency` / `reset_visitor_cookies` / `version` on `promo_banner`
- ➕ `apps/cms/src/scripts/phase4.33-ab-migrate.ts` — add `display_frequency` / `reset_visitor_cookies` / `show_on_homepage_only` on `announcement_bar`
- ➕ `apps/cms/src/scripts/push-schema-once.ts`, `push-schema-loop.ts`, `list-all-indexes.ts`, `inspect-4.33-tables.ts`, `test-locked-docs-query.ts` — supplementary diagnostics

**Frontend (Astro):**
- ➕ `apps/web/src/components/common/AnnouncementBar.astro` — in-flow slim bar under header, 4 themes, dismiss with per-visitor duration + version-keyed localStorage
- ➕ `apps/web/src/components/common/PromoBannerModal.astro` — timed pop-up, 2 themes, scroll-lock while open, versioned frequency cookie, self-gates on homepage-only vs site-wide
- ➕ `apps/web/src/components/common/NewsletterSignup.astro` — footer section, 3 themes, honeypot, inline status message
- ➕ `apps/web/src/lib/newsletter/{validators,store,notifiers,index}.ts` — modular orchestrator (validate → Payload REST store → notifier chain)
- ➕ `apps/web/src/pages/api/newsletter-subscribe.ts` — thin POST controller (`prerender = false`)
- ✏️ `apps/web/src/lib/payload.ts` — `getAnnouncementBar`, `getPromoBanner` helpers
- ✏️ `apps/web/src/lib/features.ts` — skip module-level cache in dev (`import.meta.env.DEV`) so CMS toggle flips reflect immediately without server restart
- ✏️ `apps/web/src/layouts/BaseLayout.astro` — SSR ab-version + frequency fetch, inline `is:inline` head script + global CSS rule for zero-flash dismissal
- ✏️ `apps/web/src/layouts/PageLayout.astro` — `<Header />` first, then `<AnnouncementBar />` (below header), and `<PromoBannerModal />` at the end
- ✏️ `apps/web/src/components/navigation/FooterRenderer.astro` — `<NewsletterSignup />` above whichever footer template renders (Phase-3.24 template dispatcher path)
- ✏️ `apps/web/astro.config.mjs` — `output: 'static'` + `@astrojs/cloudflare` adapter (Astro 5 removed `output: 'hybrid'`; static output now natively supports opt-in on-demand routes)

### How the version + reset flow works (Announcement Bar / Promo Banner)
Both globals use the same pattern:

1. On Save, a `beforeChange` hook computes `version = sha256(content bits + reset nonce).slice(0, 12)`. Content bits include the visual/copy fields plus `displayFrequency` and `showOnHomepageOnly`. Reset nonce is empty unless `resetVisitorCookies === true`; if set, it becomes `String(Date.now())`. The hook also unsets `resetVisitorCookies` back to `false` before persisting, so the checkbox never stays "on".
2. On the frontend, the component renders a `data-*-version` attribute holding that hash. Client-side JS keys its localStorage entry as `dnj:<feature>:<state>:<version>` (e.g. `dnj:promo:lastShown:a7c0f84ad87a`, `dnj:ab-dismissed:{version}`).
3. Any content edit → new hash → new localStorage key → visitor sees the feature again on next page load.
4. `resetVisitorCookies` gives a manual escape hatch when there is no content change (e.g. testing frequency changes) — checking the box + Save also bumps the hash.
5. The dismissal value is now a **timestamp** (ms) rather than the earlier `'1'` sentinel. Runtime script + BaseLayout head script both compare `Date.now() - ts` against `displayFrequency * 60_000`. Once the window elapses, the stale key is cleared and the bar/modal shows again. BaseLayout's head script keeps a back-compat branch that still treats a legacy `'1'` value as "still dismissed" to avoid a surprise re-show for returning visitors from before the frequency change.

### Newsletter submission flow
- Form posts JSON `{ email, website }` to `/api/newsletter-subscribe` (`website` is the honeypot).
- Endpoint reads `cf-connecting-ip`, hashes with `NEWSLETTER_IP_SALT` (SHA-256, GDPR-friendly), and forwards to `subscribe()` in `@lib/newsletter`.
- The orchestrator runs `validate` (email format, honeypot, in-memory per-IP rate limit 5/60 s) → `PayloadStore.save` (POST to `${CMS_URL}/api/newsletter-subscribers` with `Authorization: users API-Key <key>`) → `runNotifiers` (currently just `LogNotifier`; the `Notifier` interface is the plug point for future SMTP/Hostinger/webhook).
- Duplicate email is treated as success (idempotent 200 from user's POV; Payload's unique constraint is what enforces one row per email).
- Errors: invalid email → 400 `invalid_email`; honeypot filled → 400 `honeypot`; rate-limited → 429; store misconfigured (missing API key) → 500 with a specific log line.

### Impact
- **Database** — one new collection (`newsletter_subscribers`), two new globals (`announcement_bar`, `promo_banner`), the join table `payload_locked_documents_rels` gained a `newsletter_subscribers_id` FK column + idx, and `footer_settings` gained 7 `newsletter_*` columns. All schema changes were applied via the finalize/migrate scripts (see §Hotfixes for the root cause of not being able to push automatically).
- **CMS admin UI** — 2 new items in Settings sidebar, 1 new item in Administration sidebar; Footer Settings gains a Newsletter Signup collapsible in place of the old reserved checkbox.
- **Frontend Astro** — Announcement Bar in-flow below the header on every page (site-wide by default), Promo Banner Modal appended after the footer of every page (self-gates to homepage by default), Newsletter Signup section above every footer template. All three are zero-render when master toggle is OFF or content is missing.
- **Build target** — `output: 'static'` + `@astrojs/cloudflare` adapter. All existing pages remain pre-rendered (SSG); only `pages/api/newsletter-subscribe.ts` runs on demand via a Pages Function. `wrangler pages deploy dist/` continues to work; the Pages project must have Functions enabled.
- **payload-types.ts** — regenerated. Three new interfaces: `NewsletterSubscriber`, `AnnouncementBar`, `PromoBanner` (with their `displayFrequency: '30' | '60' | '360' | '720' | '1440'` union, `resetVisitorCookies`, `showOnHomepageOnly`, `version`).

### Environment variables (new; required in `apps/web`)
| Var | Purpose | Notes |
|---|---|---|
| `CMS_URL` | Payload base URL | Was already used; default `http://localhost:3030`. Confirm prod value. |
| `PAYLOAD_API_KEY` | `users` API key used by the newsletter store | Issue by editing an admin user in CMS → "Enable API Key" → copy the generated key. |
| `NEWSLETTER_IP_SALT` | Salt for GDPR-friendly IP hashing (SHA-256) | Any long random string; must remain stable across deploys or the hashes drift. |

### Hotfixes — what happened during the first `pnpm dev` and how it was resolved

Owner ran `pnpm dev` in `apps/cms` after pulling the first 8 commits and hit `no such column: newsletter_subscribers_id` on `/admin/login`. Investigation traced two overlapping root causes:

1. **Payload's schema push is not idempotent in the SQLite adapter** — `CREATE INDEX ...` is emitted without `IF NOT EXISTS`. Any prior partial push commits DDL (SQLite auto-commits schema changes), so the next attempt crashes on the first pre-existing index it hits and halts *before* the `ALTER TABLE ADD COLUMN` operations that would have added the new FK columns. In our case: the three new tables were created, but `payload_locked_documents_rels.newsletter_subscribers_id` and 7 `footer_settings.newsletter_*` columns were never applied.
2. **Cold-start init race** — the same race Phase 4.25 fixed. Flipping the config back to `push: true` for a one-off migration re-opens the two-parallel-init window; the two pushes crash each other. This is why manual push loops appeared to "get further each time" but never completed.

Recovery approach (all documented in the phase's diagnostic scripts):
- Keep `push: false` in `payload.config.ts` (retain the Phase 4.25 fix).
- Drop all `_idx` indexes via `phase4.33-preflight.ts` so any subsequent push starts clean.
- Add the missing columns surgically via `phase4.33-finalize.ts` (bypassing Payload's push entirely).
- Re-run `payload generate:types` once the schema is complete.

Two further hotfixes surfaced when the frontend booted:
- **Astro 5 removed `output: 'hybrid'`**. Setting `output: 'static'` with `@astrojs/cloudflare` adapter installed gives the same "SSG by default, opt-in on-demand routes via `prerender = false`" behavior.
- **`<style is:global>{`...`}</style>`** — template-literal-inside-style-block is not valid Astro; the whole content is sent to PostCSS which chokes on the backticks. Fixed by writing plain CSS between the tags.

Then two subtle rendering issues (still under hotfix banner):
- **`lib/features.ts` module-level cache** captured the initial (all-default) toggle state at Astro dev's first import and never refreshed for the life of the dev server. Flipping a toggle in the CMS had no visible effect until the whole Astro dev server was restarted. Fix: skip the cache when `import.meta.env.DEV` is truthy. Prod SSG build still memoizes.
- **Newsletter injection landed in `navigation/Footer.astro`**, which is dead in the current render path — Phase 3.24 introduced `FooterRenderer` (template dispatcher) and `PageLayout` uses that. The injection was moved to `FooterRenderer.astro` above `<Template ... />`, so the section renders regardless of which footer template is selected.

### Owner-driven tweaks (2026-09-08 → 2026-09-09)

- **Announcement Bar placement** — was rendered above the header, which visually clashed with the fixed-position header templates. Moved to render *after* `<Header />` in `PageLayout` so it sits directly below the header (each header template has an in-flow spacer of h-20/h-16/h-[100px] that offsets the fixed header, and the bar lands after that spacer regardless of template choice).
- **Promo Banner frequency preset** — the original free-form `displayFrequencyDays` (number, 1–90 days) was too coarse. Replaced with a `displayFrequency` select of preset values (30 min / 1 h / 6 h / 12 h / 1 d, stored as string minutes).
- **Promo Banner versioned reset** — added `version` (auto-hashed) + `resetVisitorCookies` (checkbox, auto-unchecks). Frontend key is now `dnj:promo:lastShown:{version}`. Any content edit invalidates all visitor cookies; the reset checkbox is the manual escape.
- **Promo Modal scroll-lock** — while the modal is open, `<body> { overflow: hidden }` prevents the page underneath from scrolling; padding-right compensates for the scrollbar so nothing shifts. Restored precisely on close.
- **Announcement Bar reaches parity** — same tab structure (4 tabs), same frequency preset, same `resetVisitorCookies` checkbox, same `showOnHomepageOnly` Advanced flag. Dismissal became a timestamp instead of the earlier `'1'` sentinel; runtime + head-side check both compare against the frequency window and clean up stale keys. Back-compat with the old `'1'` sentinel preserved so returning visitors don't get a surprise re-show.

### Testing / UAT checklist
- [x] Schema push — replaced by manual `phase4.33-finalize.ts` (documented, idempotent).
- [x] `payload generate:types` — regenerated post-migration.
- [ ] **Payload API key** — issue via CMS Users → self → "Enable API Key" → copy to `apps/web/.env` as `PAYLOAD_API_KEY`.
- [ ] **Env vars** — `CMS_URL`, `PAYLOAD_API_KEY`, `NEWSLETTER_IP_SALT` in `apps/web/.env` and Cloudflare Pages dashboard.
- [ ] **Astro dev boot** — `cd apps/web && pnpm dev` starts on port 4321 without PostCSS or output warnings.
- [ ] **Astro build** — `pnpm --filter @dn-journeys/web build` produces `dist/` with pre-rendered pages + one function for `/api/newsletter-subscribe`.
- [ ] **Announcement Bar** — save a message, verify (a) bar renders below header on every page, (b) × dismiss + refresh hides for the chosen frequency window, (c) editing the message causes bar to re-appear for previously-dismissed visitors, (d) `resetVisitorCookies` + Save without content edit also re-appears, (e) `showOnHomepageOnly = ON` restricts to `/` only.
- [ ] **Promo Banner Modal** — save headline + CTA, verify (a) modal fires on `/` after `triggerDelay` seconds, (b) background scroll locked while open, (c) × / ESC / backdrop click all close + record shown timestamp, (d) refresh within frequency window: no re-show, (e) edit content or check `resetVisitorCookies` + Save: modal reappears, (f) `showOnHomepageOnly = OFF` fires modal on all pages, (g) `suppressAfterScroll` skips modal if visitor is >50 % down the page when timer fires, (h) theme1 without image auto-degrades to theme2 layout.
- [ ] **Newsletter Signup** — enable master toggle, fill copy, verify (a) section shows above footer on every page, (b) valid email → success message + subscriber row in CMS, (c) same email again → idempotent 200 no duplicate, (d) invalid email → 400 + error copy, (e) honeypot filled via curl → 400, (f) 6th POST in 60 s → 429, (g) three theme options (ocean/sand/leaf) render correctly.

### Risks / known trade-offs
- **Static → hybrid → static (Astro 5) transition** is a deploy-target change. All existing pages remain SSG so per-request cost is unchanged, but Cloudflare Pages Functions must be enabled on the project.
- **In-memory rate limit** does not persist across Cloudflare Worker isolates. Sufficient for casual spam, not coordinated attacks. Upgrade path: swap to KV or Durable Object storage in `validators.ts` (interface unchanged).
- **Version hash relies on `beforeChange` running** — if the CMS ever bypasses beforeChange (e.g. direct DB writes, migrations), `version` may stall. Auto-hash re-fires on the next legitimate save, so drift is temporary.
- **Announcement Bar dismissal timestamp is per-version** — if `displayFrequency` changes while a visitor is dismissed, they see the bar as soon as the version changes (this is the intended behavior; the frequency-change is itself a content change).
- **Promo Modal on homepage-only** default is true — flipping to site-wide can hurt conversion on detail pages if the campaign is not tightly scoped. The default stays homepage-only for that reason.

### Rollback
- **Full revert** (16 commits, chronological reverse):
  ```bash
  git revert 6c25e48 23022cd f791142 112e5f5 59f6a55 890079f 0abfdd9 9677f88 899527b e1cc9a2 a700dbb a1fe15a 9e6f567 4bb0dbb 64b9a1a 2a8c9c0
  ```
- **Rollback just the tweaks (keep initial features)**: revert `6c25e48 23022cd f791142 112e5f5`.
- **Rollback newsletter only**: revert `2a8c9c0 a1fe15a` — this drops the collection registration and the API endpoint. Existing subscriber rows in the DB remain (harmless without the code path).
- **Rollback CMS-side without touching frontend**: revert the four `[cms]` commits from the initial ship. Frontend components stay but gate to false because content globals return 404 — safe.
- The manual schema changes (columns added by finalize/migrate scripts) stay in the DB after any code revert. They are harmless if unread. Manual drop only if a truly clean DB is required.

### Docs updated
- [x] `docs/phases/phase-4.33-reserved-features-buildout.md` (this file, rewritten to cover the full arc after the initial 899527b commit)
- [x] `docs/PROGRESS.md` — row 4.33 updated to reference the tweaks + hotfixes and the final commit list

### Constraints upheld
- ✅ No data loss from any of the schema operations (retired columns held only placeholder booleans that were always `false`)
- ✅ `push: false` retained per Phase 4.25 (schema push race remains fixed)
- ✅ No new npm dependencies (`@astrojs/cloudflare` was already installed for the deploy target)
- ✅ Owner Option A (Phase 4.32) fulfilled — the "(reserved — Phase 4)" placeholders now do what they promised
- ✅ No breaking changes for editor / admin roles (super-admin-only surface for both new globals; editor never sees them)

### Next steps (not in scope)
- Wire a real notifier: `SmtpNotifier` (Hostinger SMTP) or `WebhookNotifier` (Zapier/Make). Add to `defaultNotifiers` in `lib/newsletter/index.ts`.
- Add a Cloudflare Turnstile widget in `NewsletterSignup.astro` if spam volume exceeds the current honeypot + IP rate-limit.
- Promote the in-memory rate-limit to KV / Durable Object for cross-isolate correctness.
- Add an unsubscribe page/flow that flips `status = 'unsubscribed'` via a signed link.
- Consider extracting the shared "versioned dismissal" pattern (used identically by AnnouncementBar and PromoBanner) into a tiny shared helper if a third similar feature ships.
