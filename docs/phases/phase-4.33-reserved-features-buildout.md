## Phase 4.33: Reserved Feature Build-out — Announcement Bar, Promo Banner Modal, Newsletter Signup
**Date**: 2026-09-07
**Status**: ✅ Code complete — awaiting owner UAT (CMS schema push + login-based verification)
**Author**: Claude Code (Opus 4.7)
**Branch**: `feature/phase4-polish-launch`
**Commits**: `2a8c9c0`, `64b9a1a`, `4bb0dbb`, `9e6f567`, `a1fe15a`, `a700dbb`, `e1cc9a2`

### Summary
The three "(reserved — Phase 4)" toggles previously identified by the Phase 4.32 audit are now real, editor-usable features. Each has real CMS content fields (not just a boolean), a properly wired Astro component styled per the Tropical Sophistication tokens, and defensive gate logic (master toggle + content-exists + optional date window).

- **Announcement Bar** — slim (~36 px) site-wide bar above the header, 4 themes, optional link + date window, dismissible with content-hash-versioned localStorage persistence, zero-flash on repeat visits via an inline head script.
- **Promo Banner** — timed pop-up modal (not an inline section, per owner revision), 2 themes (with-image / text-only), super-admin-adjustable trigger delay (0–60 s) and per-visitor frequency (1–90 days), scroll-suppression, and homepage-only-by-default scope.
- **Newsletter Signup** — footer section, 3 themes, submits to a modular Astro POST endpoint that stores subscribers in a new Payload collection (`newsletter-subscribers`). Notifier interface stubbed for future SMTP/Hostinger/webhook chain.

### Files created / changed
| File | Action | Feature |
|---|---|---|
| `apps/cms/src/collections/NewsletterSubscribers.ts` | NEW | Newsletter |
| `apps/cms/src/globals/AnnouncementBar.ts` | NEW | Announcement Bar |
| `apps/cms/src/globals/PromoBanner.ts` | NEW (4 tabs) | Promo Banner |
| `apps/cms/src/globals/FooterSettings.ts` | EDIT (`newsletter` group added, `showNewsletter` retired) | Newsletter |
| `apps/cms/src/globals/SiteFeatures.ts` | EDIT (3 "(reserved)" labels replaced with real descriptions) | All |
| `apps/cms/src/payload.config.ts` | EDIT (register 2 globals + 1 collection) | All |
| `apps/web/src/lib/payload.ts` | EDIT (+`getAnnouncementBar`, `getPromoBanner`) | AB, PB |
| `apps/web/src/lib/newsletter/{validators,store,notifiers,index}.ts` | NEW (modular orchestrator) | Newsletter |
| `apps/web/src/pages/api/newsletter-subscribe.ts` | NEW (`prerender=false`) | Newsletter |
| `apps/web/src/components/common/NewsletterSignup.astro` | NEW | Newsletter |
| `apps/web/src/components/common/AnnouncementBar.astro` | NEW | Announcement Bar |
| `apps/web/src/components/common/PromoBannerModal.astro` | NEW | Promo Banner |
| `apps/web/src/layouts/BaseLayout.astro` | EDIT (SSR ab-version fetch + inline zero-flash head script + global CSS rule) | Announcement Bar |
| `apps/web/src/layouts/PageLayout.astro` | EDIT (inject `<AnnouncementBar />` + `<PromoBannerModal />`) | AB, PB |
| `apps/web/src/components/navigation/Footer.astro` | EDIT (inject `<NewsletterSignup />` above columns) | Newsletter |
| `apps/web/astro.config.mjs` | EDIT (output: 'static' → 'hybrid' + @astrojs/cloudflare adapter) | Newsletter |

### CMS structure (post-phase)
- **New globals** (both under Settings, super-admin only):
  - `announcement-bar` — message, link{enabled,label,url,newTab}, theme, dismissible, startDate, endDate, version (auto-hash sidebar readOnly)
  - `promo-banner` — 4 tabs: Content & Theme / Trigger & Behavior / Schedule / Advanced
- **FooterSettings**: `showNewsletter` boolean retired → replaced with `newsletter` group (heading, description, placeholder, button, success/error copy, theme). Content is gated by the FooterSettings collapsible's existing `supports('newsletterToggle')` condition — surfaced for footer templates that declare that slot.
- **SiteFeatures**: three toggles kept as master kill-switches, "(reserved — Phase 4)" removed, descriptions rewritten to point at their content locations.
- **New collection**: `newsletter-subscribers` (email/status/source/userAgent/ipHash/notes), Administration group, editor hidden, super-admin delete.

### Frontend rendering pattern (per feature)

**Announcement Bar** — placed in-flow at the top of `PageLayout.astro`. Gate = `isFeatureEnabled('announcementBar') && bar.message && dateWindowValid`. Dismissal key `dnj:ab-dismissed:{version}`. Zero-flash: `BaseLayout` runs SSR `getAnnouncementBar()`, inlines a tiny `is:inline` head script that stamps `<html data-ab-hidden="true">` if the visitor already dismissed this exact version, and a global CSS rule hides the bar under that attribute before body paint. Editing `message` in CMS auto-changes `version` via `beforeChange` hook (SHA-256 truncated to 12 chars) → all prior dismissals invalidated.

**Promo Banner Modal** — placed once at the end of `PageLayout.astro`. Component self-gates on `showOnHomepageOnly`: default true → only renders on `/`; when off it appears site-wide. Trigger via `setTimeout(triggerDelay * 1000)` after `astro:page-load`. Frequency via `localStorage["dnj:promo:lastShown"]` (timestamp ms). `suppressAfterScroll` skips the trigger if the visitor has already scrolled past ~50 % of the page. Focus-trap-lite: focus close button on open, restore previously-focused element on close. Backdrop click / ESC / × / CTA all close and record the shown timestamp.

**Newsletter Signup** — placed in `Footer.astro` above the columns. Gate = `isSectionEnabled('newsletter') && newsletter.heading`. Form has a hidden honeypot field named `website`. Submits `POST /api/newsletter-subscribe` (JSON `{email, website}`). Endpoint is thin (parses body, hashes IP, delegates to `subscribe()`), all logic lives in `@lib/newsletter`. Store is a `PayloadStore` that POSTs to `${CMS_URL}/api/newsletter-subscribers` with `Authorization: users API-Key <key>`. Duplicate email is treated as success (idempotent). Rate limit: 5 req/min per IP (per Worker isolate, best-effort).

### Impact
- **Database (Payload SQLite → D1 in prod)**: adds one collection (`newsletter-subscribers`) with 6 fields + timestamps, plus two globals with the fields listed above. Schema push required before this branch is usable.
- **CMS admin UI**: 2 new items in Settings sidebar (Announcement Bar, Promo Banner), 1 new item in Administration sidebar (Newsletter Subscribers). Footer Settings gains a "Newsletter Signup" collapsible in place of the old reserved checkbox.
- **Frontend Astro**:
  - New DOM at the top of every page (announcement bar) and at the end of every page (modal — hidden until timer fires). Both are zero-render when master toggle is OFF or content is missing.
  - Footer gains a signup section above the existing columns.
  - Build output shifts from pure `output: 'static'` to `output: 'hybrid'` on the Cloudflare adapter. All existing pages remain pre-rendered (SSG) — only `apps/web/src/pages/api/newsletter-subscribe.ts` runs on demand via a Pages Function. **This is a deploy-target change** and needs an env-var pass on Cloudflare Pages before the newsletter endpoint works.
- **payload-types.ts**: needs regeneration (`pnpm --filter cms exec payload generate:types`). Two new globals + one collection interface will appear. Not committed in this phase — regen locally after schema push.

### Environment variables (new)
Set in `apps/web` on both dev and Cloudflare Pages:
| Var | Purpose | Notes |
|---|---|---|
| `CMS_URL` | Payload base URL | Was already used elsewhere (defaulted to `http://localhost:3030`). Confirm prod value. |
| `PAYLOAD_API_KEY` | `users` API key used by the newsletter store | Issue by editing an admin user in CMS → "Enable API Key" → copy generated key. |
| `NEWSLETTER_IP_SALT` | Salt for GDPR-friendly IP hashing (SHA-256 stored) | Any long random string; keep stable across deploys or hashes drift. |

### Design tokens applied
Palette: `#1B3A4B` Deep Ocean, `#F5F0E8` Warm Sand, `#E07A5F` Coral Sunset, `#6B9080` Tropical Leaf. Fonts: Fraunces (display) for headings, Plus Jakarta Sans (body) for form/link text. Announcement Bar: 4 themes × the palette. Newsletter: 3 themes. Promo Modal: fixed Coral CTA over Sand card (both themes).

### Testing / UAT checklist
- [ ] **CMS schema push** — `cd apps/cms && pnpm dev`, answer "y" to create the new columns for the two globals + the collection.
- [ ] **Regenerate types** — `pnpm --filter cms exec payload generate:types`.
- [ ] **Payload API key** — log in as super-admin → Administration → Users → open self → toggle "Enable API Key" → copy to `apps/web/.env` as `PAYLOAD_API_KEY`.
- [ ] **Env vars** — `CMS_URL`, `PAYLOAD_API_KEY`, `NEWSLETTER_IP_SALT` in `apps/web/.env` (dev) and Cloudflare Pages dashboard (prod).
- [ ] **Astro dev boot** — `cd apps/web && pnpm dev` starts cleanly with `output: 'hybrid'`.
- [ ] **Astro build** — `pnpm --filter @dn-journeys/web build` produces `dist/` with pre-rendered pages + one server-rendered function for `/api/newsletter-subscribe`.
- [ ] **Announcement Bar**
  - OFF at master toggle → no DOM in header top, no CLS.
  - ON with empty `message` → no render.
  - ON with message + no window → renders in Ocean theme, click × → smooth 200 ms collapse, refresh → does not reappear.
  - Edit message in CMS → save → refresh → bar re-appears (version changed).
  - Optional link visible when `link.enabled=true`, hides when off.
  - Test theme cycle: coral, leaf, sand.
- [ ] **Promo Banner Modal**
  - OFF at master → no modal.
  - ON, homepage `/` → wait `triggerDelay` seconds → modal fades in.
  - Close (×) → refresh → does not re-open for `displayFrequencyDays` days.
  - `showOnHomepageOnly=true` → visit `/tour` → no modal.
  - Flip `showOnHomepageOnly=false` → visit `/tour` → modal fires after delay.
  - `suppressAfterScroll=true` → scroll past 50 % within delay → modal does not fire.
  - Theme 1 with image → image renders left/top; without image → auto-degrades to Theme 2 layout.
  - Theme 2 → centered text + CTA.
  - ESC + backdrop click both close.
- [ ] **Newsletter Signup**
  - OFF at master or empty `heading` → no section in footer.
  - ON with valid email → success message + subscriber appears in CMS collection.
  - Same email twice → success (idempotent), no duplicate row (unique constraint holds).
  - Invalid email → error message, no CMS row.
  - Honeypot filled by curl → 400 error.
  - Rate limit: 6th request in 60 s → 429.
  - Theme cycle: ocean / sand / leaf.

### Risks / known trade-offs
- **Static → hybrid switch** is a deploy-target change. All existing pages remain pre-rendered so runtime cost per non-API request is unchanged, but the deploy adapter now targets Cloudflare Pages Functions. `wrangler pages deploy dist/` still works; confirm the pages project has Functions enabled.
- **In-memory rate limit** does not persist across Worker isolates. Sufficient for casual spam, not for coordinated attacks. Upgrade path: swap to KV or Durable Object storage in `validators.ts` (interface unchanged).
- **Announcement Bar dismissal** relies on the `version` field. If an editor somehow blanks or hard-edits `version`, the beforeChange hook re-hashes it on next save. Field is `readOnly` in the UI to prevent that.
- **Promo Modal on homepage-only** is default true. If the owner opens up site-wide, detail-page conversion can dip. Keep an eye on funnel metrics.
- **PayloadStore misconfigured** (missing API key) returns 500 "server_error" to the user — the endpoint logs the specific `misconfigured` reason, so debug via server logs first if signups start failing after deploy.

### Rollback
- Full revert:
  ```bash
  git revert e1cc9a2 a700dbb a1fe15a 9e6f567 4bb0dbb 64b9a1a 2a8c9c0
  ```
- Partial (keep newsletter, drop modal): revert `e1cc9a2` + `4bb0dbb` only.
- Partial (keep everything, revert to static build): revert only the `astro.config.mjs` diff and remove `pages/api/newsletter-subscribe.ts`.
- SQLite: the new collection/globals stay in the schema after rollback (harmless — no code path reads them). Manually drop columns only if you want a truly clean DB.

### Docs updated
- [x] `docs/phases/phase-4.33-reserved-features-buildout.md` (this file)
- [x] `docs/PROGRESS.md` — row 4.33 added after 4.32.

### Next steps (not in scope)
- Wire a real notifier: `SmtpNotifier` using Hostinger SMTP, or a `WebhookNotifier` posting to Zapier/Make → add to `defaultNotifiers` in `lib/newsletter/index.ts`.
- Add a Cloudflare Turnstile widget in `NewsletterSignup.astro` if spam volume exceeds the current honeypot + IP rate-limit.
- Consider promoting the in-memory rate-limit to KV / Durable Object storage.
- Add an "Unsubscribe" page/flow that flips `status = 'unsubscribed'` via a signed link.
