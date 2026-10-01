# Phase 4.8 — Page Editor UX Overhaul (Preview · Tabs · Block Polish · Sticky Bar)

> **Status:** ✅ Code selesai · compile OK · ⏳ visual verify (login)
> **Scope:** Admin edit-view UX for `pages` collection (replicable to all collections).
> **Date:** 2026-08-27 (audit) · 2026-08-27 (implementation) · 2026-08-27 (Goal 3 removed)
> **Payload version:** 3.33.0 · **Frontend:** Astro `output: 'static'` (SSG)
>
> ⚠️ **Goal 3 (collapsible sidebar) removed 2026-08-27** — floating toggle
> button caused z-index/overlap bugs with the block picker drawer and,
> after scroll, detached from its intended position on the divider. Per
> user decision the page-settings sidebar is now a **static fixed layout**
> (Payload default). Related files deleted / cleaned:
> - `apps/cms/src/admin/EditSidebarToggle.tsx` — **deleted**
> - `payload.config.ts` `admin.components.providers` — reverted to
>   `['/admin/AdminStyles#default']` only
> - `edit-view.css` — Goal 3 section removed (collapse rules + toggle
>   button styles); Goals 2, 4, 5 sections kept intact
> - `body[data-sidebar-collapsed]` no longer used anywhere
>
> **Numbering note:** requested as "phase 4.7" but `4.7` is already used by
> [dashboard-logo-and-cleanup](phase-4.7-dashboard-logo-and-cleanup.md) (committed).
> Per the project's own renumber convention (see that doc's header), this audit is
> filed as **4.8** to avoid overwriting/confusing an existing phase.

---

## 0. TL;DR — Feasibility Matrix

| # | Goal | Feasible? | Payload support | Risk | Effort | Blocking dependency |
|---|------|-----------|-----------------|------|--------|---------------------|
| 1 | **Preview button** | PARTIAL | `admin.preview` native (button), but frontend is **static** | **HIGH** | 1.5–3 d | Astro SSR/hybrid preview route + drafts data model |
| 2 | **Sidebar tabs** | PARTIAL | Not native (tabs can't live in sidebar) → custom | MEDIUM | 0.5–1 d | none |
| 3 | **Collapsible sidebar** | YES | Custom component + CSS (no built-in) | LOW–MED | 0.5 d | none |
| 4 | **Block visual polish** | YES | `admin.components.Label` + `images` + CSS (native) | LOW | 0.5–1 d | none |
| 5 | **Additional UX** | PARTIAL | Some native (unsaved-changes, Ctrl+S), some custom | LOW | 0.25–0.5 d | none |

**Recommended order:** 4 → 3 → 2 → 5 → 1. Do the low-risk, self-contained wins
first (block polish, collapsible sidebar, tabs); tackle Preview last because it is
the only goal that reaches into the **data model** and the **Astro frontend**.

**Recommended MVP scope:** ship goals 2, 3, 4, 5 as a pure admin-UI phase (all LOW–MED
risk, ~2 days, zero frontend/DB impact). Treat goal 1 (Preview) as a **separate
decision** because it forces a choice about drafts architecture and Astro rendering
mode — see §1.

---

## Phase A — Current State (inspected)

### A.1 Pages collection — all fields
Source: [`apps/cms/src/collections/Pages.ts`](../../apps/cms/src/collections/Pages.ts)

| Field | Type | Position | Notes |
|-------|------|----------|-------|
| `title` | text (required) | main | `useAsTitle` |
| `slug` | text (required, unique) | **sidebar** | `beforeValidate: generateSlug`, `validate: validateReservedSlug` |
| `template` | select | **sidebar** | default/about/contact/landing/service_listing |
| `content` | **blocks** | main | label "Page Content", 16 block types |
| `parent` | relationship→pages | **sidebar** | "Parent Page" |
| `seo` | group | **sidebar** | metaTitle, metaDescription, ogImage (see [`fields/seo.ts`](../../apps/cms/src/fields/seo.ts)) |
| `status` | select | **sidebar** | draft/published — **custom field**, `update: adminFieldAccess` (see [`fields/status.ts`](../../apps/cms/src/fields/status.ts)) |
| `sortOrder` | number | **sidebar** | "Lower numbers appear first" |

So the sidebar currently stacks **6 items**: slug, template, parent, SEO group,
status, sortOrder. This is exactly what Goal 2 (tabs) and Goal 3 (collapse) target.

### A.2 Edit view structure
**Default Payload edit view.** No custom `admin.components.views.edit` anywhere.
`payload.config.ts` only registers global chrome (dashboard, login, sidebar nav,
graphics, providers) — nothing touches the document edit view. The admin CSS
([`custom.css`](../../apps/cms/src/admin/custom.css), [`admin-global.css`](../../apps/cms/src/admin/admin-global.css))
styles the dashboard/nav sidebar only — **no edit-view rules exist yet** (greenfield).

### A.3 Block types in Page Content (16)
Source: [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts)

`hero`, `richText`, `image`, `gallery`, `cta`, `faq`, `testimonials`,
`serviceGrid`, `contact`, `embed`, `spacer`, `valuePropsBanner`, `statsBanner`,
`testimonialsCarousel`, `serviceListing`, `trustBadges`.

Most already use internal **tabs** (Content / Media / Advanced / Display / Hero /
Filter & Search / Card Style) and `labels: { singular, plural }`. None define
`admin.components.Label` or `images` (icon/thumbnail) → Goal 4 is unstarted.

### A.4 Sidebar fields
See A.1 — all 6 use `admin.position: 'sidebar'`. `status` and (via `seoFields`)
the SEO group carry field-level access; `slug` carries hooks + validation.

### A.5 Files involved in the page edit view
- [`apps/cms/src/collections/Pages.ts`](../../apps/cms/src/collections/Pages.ts) — collection config
- [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts) — block definitions
- [`apps/cms/src/fields/seo.ts`](../../apps/cms/src/fields/seo.ts), [`status.ts`](../../apps/cms/src/fields/status.ts), [`reservedSlugs.ts`](../../apps/cms/src/fields/reservedSlugs.ts) — sidebar fields
- [`apps/cms/src/hooks/generateSlug.ts`](../../apps/cms/src/hooks/generateSlug.ts) — slug hook
- [`apps/cms/src/payload.config.ts`](../../apps/cms/src/payload.config.ts) — admin.components registry + importMap.baseDir=`src`
- [`apps/cms/src/admin/custom.css`](../../apps/cms/src/admin/custom.css), [`admin-global.css`](../../apps/cms/src/admin/admin-global.css) — injected via `AdminStyles` provider
- **Frontend (Preview only):** [`apps/web/src/pages/[...slug].astro`](../../apps/web/src/pages/[...slug].astro), [`apps/web/src/lib/payload.ts`](../../apps/web/src/lib/payload.ts), [`apps/web/astro.config.mjs`](../../apps/web/astro.config.mjs)

---

## Phase B + C — Payload v3 Research, Feasibility & Risk (per goal)

### GOAL 1 — Preview Button  → PARTIAL · HIGH risk

**What Payload supports**
- **`admin.preview`** (collection or global): `preview: (doc, { locale, req, token }) => string | null`.
  Returns an absolute URL or relative path (may be async). Renders a **Preview
  button** in the edit view for *all* roles that can read the doc — this alone
  satisfies "a button next to Save for superadmin/admin/editor."
- **`admin.livePreview`** (`{ url, breakpoints }`): renders an **iframe** and pushes
  live edits via `window.postMessage`. Frontend must run `@payloadcms/live-preview`
  and re-render on message — needs a **dynamic** frontend.
- **Draft Preview** works off a `draft: true` query param + the `_status` field,
  which only exists when `versions.drafts` is enabled.

**Why it's only PARTIAL here — two hard blockers:**

1. **Astro is `output: 'static'` (SSG).** [`[...slug].astro`](../../apps/web/src/pages/[...slug].astro)
   uses `getStaticPaths()` and is built ahead of time. A static build can only show
   **published, already-built** content — it cannot render an editor's *unsaved/draft*
   page on demand. `admin.preview` would just deep-link to the built page (published
   state), which is **not** "preview before publishing." A true preview needs an
   **on-demand-rendered route** → Astro server/hybrid mode + a Node/Cloudflare adapter.

2. **Drafts aren't in the data model.** The project uses a **custom `status` select**
   ('draft'|'published'), and the frontend filters on it:
   [`payload.ts`](../../apps/web/src/lib/payload.ts) hard-codes
   `where[status][equals]=published`. Payload's native draft preview expects the
   system `_status` field from `versions.drafts` — which is **not enabled**. Enabling
   it would add a *second* status concept alongside the custom one (data-model
   duplication) unless the two are reconciled.

**Minimum viable preview options (pick one):**

- **Option A — "Open live page" deep-link (LOW effort, not true draft preview).**
  Add `admin.preview: (doc) => \`${SITE_URL}/${doc.slug}\``. Button works for all roles;
  opens the **published** page. Honest label: "View published page." **Does not** show
  unsaved edits. Zero frontend/DB change. *Recommended if the real need is "jump to the
  live URL from the editor."*

- **Option B — SSR preview route (MEDIUM–HIGH effort, true draft preview).**
  1. Add an on-demand-rendered Astro route, e.g. `apps/web/src/pages/preview/[...slug].astro`
     with `export const prerender = false`, guarded by a shared secret/token.
  2. Add an Astro adapter (`@astrojs/node` for local, Cloudflare for prod) so a subset
     of routes render on request (Astro static+server "hybrid").
  3. That route fetches with `status: 'draft'`/`'all'` (helper already supports it —
     `fetchBySlug(collection, slug, 'all')`) and reuses `BlockRenderer`.
  4. `admin.preview: (doc, { token }) => \`${SITE_URL}/preview/${doc.slug}?token=…\``.
  Caveat: still previews the **last saved draft**, not live keystrokes.

- **Option C — Live Preview iframe (HIGHEST effort).** Requires Option B's SSR route
  **plus** `@payloadcms/live-preview` wiring on the Astro side (postMessage listener +
  client re-render). Heavy for an Astro/SSG stack; **not recommended** now.

**Draft-model reconciliation (needed for B/C):** either (a) enable
`versions: { drafts: true }` and migrate the frontend + all listing queries from the
custom `status` field to `_status` (touches every `fetchCollection` call and the
`status` field across many collections — large blast radius), or (b) keep the custom
`status` field and drive preview purely off `status` via the token'd SSR route
(smaller blast radius, no `_status`). **Option (b) is preferred** to avoid a
dual-status data model.

| Aspect | Verdict |
|--------|---------|
| Feasible? | **PARTIAL** (button: yes; true draft preview: needs frontend rework) |
| Payload support | Native button (`admin.preview`); live preview needs dynamic frontend |
| Risk | **HIGH** (Astro rendering-mode change + drafts/data-model + deploy adapter) |
| Effort | A ≈ 1–2 h · B ≈ 1.5–2.5 d · C ≈ 3–4 d |
| Dependencies | Astro SSR/hybrid + adapter; token guard; `SITE_URL`/CORS already set |
| Limitations | Static build can't show unsaved edits; B previews last *saved* draft only |

---

### GOAL 2 — Sidebar Tabs  → PARTIAL · MEDIUM risk

**What Payload supports**
- The `tabs` field type renders **only in the main content area**. `admin.position:
  'sidebar'` is honored on **individual data fields**, not on presentational
  containers (`tabs`, `collapsible`, `row`) — there is **no native "tabbed sidebar."**
- The document sidebar is not a documented per-collection replaceable slot (no
  `admin.components.edit.Sidebar`). You can override the **entire** edit view
  (`admin.components.views.edit.Default`) but that's heavyweight and re-implements
  Payload's form scaffolding.

**Custom approaches (no full-view override):**
- **B1 (recommended) — `collapsible` grouping + CSS, presented as an accordion.**
  Keep fields in sidebar but wrap related ones so the sidebar reads as tidy sections
  (SEO, Publishing, Routing). Lowest risk; not literal "tabs" but solves the
  "scroll to find fields" pain. *Note:* `collapsible` isn't natively sidebar-positioned
  either, so this still leans on CSS to lay the sidebar out as sections.
- **B2 — custom `admin.components.Field` "tab bar" injected into the sidebar.**
  Add one presentational sidebar field whose `Field` component renders tab buttons
  that toggle a CSS class on the sidebar; each "tab" shows/hides groups of sibling
  fields via CSS (`data-tab` attributes). Fields stay mounted (form state safe) —
  only visibility toggles. Medium effort, closest to the requested "tab bar."
- **B3 — full edit-view override.** Most control, highest risk (must reproduce
  Payload form internals, breaks on version bumps). **Not recommended.**

| Aspect | Verdict |
|--------|---------|
| Feasible? | **PARTIAL** (no native tabbed sidebar; achievable via custom component/CSS) |
| Payload support | Custom component needed (`admin.components.Field` + CSS) |
| Risk | **MEDIUM** (CSS depends on Payload's `.document-fields__sidebar` internals) |
| Effort | B1 ≈ 2–4 h · B2 ≈ 0.5–1 d |
| Dependencies | none |
| Limitations | CSS targets undocumented class names → re-verify on Payload upgrades |

---

### GOAL 3 — Collapsible Sidebar  → YES · LOW–MEDIUM risk

**What Payload supports**
- **No built-in edit-view sidebar toggle.** The edit view layout is
  `.document-fields` → `.document-fields__main` + `.document-fields__sidebar`
  (class names to confirm at implementation on 3.33.0).

**Approach (CSS-only hide, state preserved):**
- Inject a small toggle button via a custom component (e.g. an
  `admin.components.Field` presentational field, or the existing global
  `providers`/`AdminStyles` provider that already runs on every route).
- Toggle a class on a stable ancestor (e.g. `body[data-sidebar-collapsed]`);
  CSS then `display:none`s `.document-fields__sidebar` and lets `__main` grow.
- **Persist** via `localStorage` (same pattern the nav sidebar/theme toggle already
  use). Because we only **hide via CSS** (never unmount), Payload's form state and
  field registration are untouched — this is the key safety property.

| Aspect | Verdict |
|--------|---------|
| Feasible? | **YES** |
| Payload support | Custom component + CSS (no native toggle) |
| Risk | **LOW–MEDIUM** (relies on internal layout classes; CSS-only = no state loss) |
| Effort | ≈ 3–5 h incl. persistence + responsive |
| Dependencies | none |
| Limitations | Class names undocumented → re-verify on upgrade; pure visual hide |

---

### GOAL 4 — Content Blocks Visual Polish  → YES · LOW risk (mostly native)

**What Payload supports (native, v3)**
- **`block.admin.components.Label`** — custom React component for the **collapsed
  block header** (replaces name+label); can show a colored badge + summary text
  (e.g. Hero heading, image count). *This is the headline win.*
- **`block.admin.components.Block`** — replace the entire block render (heavier; not
  needed).
- **`block.imageURL`/`images.icon` (20×20) + `images.thumbnail` (3:2)** — icons and
  thumbnails in the **block picker drawer** and Lexical menu.
- **`block.admin.group`** — group block types in the picker drawer (e.g. "Layout",
  "Content", "Social proof").
- **`labels`** — already set on all 16 blocks.

**For borders / drag handles / block-count indicator:** Payload's block rows expose
stable-ish classes (`.blocks-field`, `.array-actions`, drag handle from
`react-sortablejs`). Borders, handle emphasis, and per-type badge colors are pure
**CSS** in the existing injected stylesheet. A **block-count indicator** ("3 of 16
blocks") can be a tiny custom label on the `content` field
(`content.admin.components.Label` / description) or CSS `::after` counting rows.

**Suggested badge color map** (design-token aligned; see
[`payload.config.ts`](../../apps/cms/src/payload.config.ts) TextStateFeature palette):
hero=ocean, richText=stone, image/gallery=leaf, cta/trustBadges=coral,
testimonials*/statsBanner=midnight, serviceGrid/serviceListing=ocean, structural
(spacer/embed/contact/faq)=neutral gray.

| Aspect | Verdict |
|--------|---------|
| Feasible? | **YES** |
| Payload support | **Native** (`admin.components.Label`, `images`, `group`) + CSS |
| Risk | **LOW** (additive; no data/schema change) |
| Effort | ≈ 0.5–1 d for all 16 blocks + CSS |
| Dependencies | none |
| Limitations | One reusable Label factory keeps it DRY; row CSS targets internal classes |

---

### GOAL 5 — Additional low-risk UX  → PARTIAL · LOW risk

| Feature | Native in v3? | Notes |
|---------|---------------|-------|
| **Unsaved-changes warning** | ✅ Built-in | Payload's "leave without saving" prompt is on by default (`LeaveWithoutSaving`). Verify it's active; no work likely needed. |
| **Ctrl/Cmd+S to save** | ✅ Built-in | Payload edit view supports Cmd/Ctrl+S. Verify + document. |
| **Autosave / draft indicator** | ⚠️ Requires drafts | `versions.drafts.autosave` — **gated on Goal 1's drafts decision.** Do **not** enable standalone (same `_status`/custom-`status` conflict). |
| **Duplicate document** | ✅ Built-in | `admin` doc controls; already available. |
| **Collapse-all / expand-all blocks** | ➖ Custom | Small custom control; optional. |
| **Sticky Save/Preview bar** | ➖ CSS | `.doc-controls` sticky on scroll — pure CSS, nice for long pages. |

**Recommended additional wins (no drafts dependency):** confirm & document
unsaved-changes + Ctrl+S (free), add **sticky doc-controls** CSS (tiny), optional
**collapse-all blocks** button. Defer autosave to the Goal 1 drafts decision.

| Aspect | Verdict |
|--------|---------|
| Feasible? | **PARTIAL** (native bits free; autosave blocked on drafts) |
| Risk | **LOW** |
| Effort | ≈ 2–4 h |

---

## Phase D — Implementation Plan

### D.1 Recommended order & phasing
**Track 1 — Admin-UI only (ship together, ~2 days, LOW–MED risk, zero FE/DB impact):**
`Goal 4 (block polish)` → `Goal 3 (collapsible sidebar)` → `Goal 2 (sidebar tabs)` →
`Goal 5 (sticky bar, verify shortcuts)`.

**Track 2 — Preview (separate decision, HIGH risk):** `Goal 1` after owner picks
Option A vs B (see §1). Only Track 2 touches the Astro frontend and/or data model.

### D.2 Per-goal steps & APIs

**Goal 4 — Block polish** (native-first)
1. New file `apps/cms/src/blocks/BlockLabel.tsx` — a factory `makeBlockLabel(cfg)`
   returning a client component reading `useRowLabel()`/block data → renders colored
   badge + summary. Register per block: `admin: { components: { Label: '/blocks/BlockLabel#HeroLabel' } }`
   (paths resolve against `importMap.baseDir = src`, already configured).
2. Add `admin.group` to blocks for a tidier picker; optionally `images.icon`.
3. CSS in [`custom.css`](../../apps/cms/src/admin/custom.css): borders on `.blocks-field`
   rows, drag-handle emphasis, per-type badge colors, block-count `::after`.
4. Files: `blocks/index.ts` (add `admin.components`/`group`), new `blocks/BlockLabel.tsx`, `admin/custom.css`.

**Goal 3 — Collapsible sidebar**
1. New `apps/cms/src/admin/EditSidebarToggle.tsx` (client) — button that toggles
   `document.body.dataset.sidebarCollapsed` + persists to `localStorage`.
2. Mount globally via existing `admin.components.providers` (runs on every route;
   the button self-hides on non-edit routes by checking for `.document-fields`).
3. CSS: `body[data-sidebar-collapsed] .document-fields__sidebar { display:none }` +
   widen `.document-fields__main`.
4. Files: `payload.config.ts` (providers array — already used), new component, `admin-global.css`.

**Goal 2 — Sidebar tabs** (choose B1 accordion or B2 tab bar)
1. B2: new `apps/cms/src/admin/SidebarTabs.tsx` presentational `Field` component; add
   a UI-only field to Pages sidebar (`type: 'ui'`, `admin.position: 'sidebar'`) whose
   component renders tab buttons and toggles `data-sidebar-tab` on the sidebar.
2. Tag each sidebar field group with a CSS-addressable wrapper (via `admin.className`
   where available) so tabs can show/hide by CSS.
3. Files: `collections/Pages.ts` (add `ui` field + optional `className`s), new component, CSS.
   *Replication:* the `ui` field + component are collection-agnostic → drop into any collection's sidebar.

**Goal 5 — Sticky bar + shortcuts**
1. CSS: `.doc-controls { position: sticky; top: 0; z-index }` in edit-view CSS.
2. Verify `LeaveWithoutSaving` + Cmd/Ctrl+S in a login session; document. No code if native.

**Goal 1 — Preview** (if approved; recommend Option A first)
- **Option A:** add `admin.preview: (doc) => \`${process.env.SITE_URL}/${doc.slug}\`` to
  `Pages.admin`. Label honestly ("View published page"). Files: `collections/Pages.ts`. Done.
- **Option B (frontend work required):**
  - `apps/web/astro.config.mjs`: add adapter + `output: 'static'` with per-route
    `export const prerender = false` for the preview route (Astro hybrid).
  - New `apps/web/src/pages/preview/[...slug].astro`: token-guarded, fetches
    `getPageBySlug(slug, 'all')` (extend helper to pass status), renders `BlockRenderer`.
  - `collections/Pages.ts`: `admin.preview` returning the token'd `/preview/…` URL.
  - Decide drafts model — prefer **keep custom `status`, no `versions.drafts`** (§1).

### D.3 What must change on the Astro frontend (Preview / Option B only)
- **Rendering mode:** Astro `static` → **hybrid** (adapter + `prerender=false` on the
  preview route only). The public site stays SSG; only `/preview/*` renders on demand.
- **Data fetch:** reuse `fetchBySlug(collection, slug, 'all')` — the status param
  already exists in [`payload.ts`](../../apps/web/src/lib/payload.ts) (line 92–105).
- **Auth guard:** validate a shared token/`?token=` before serving draft content
  (Payload passes `token` into `admin.preview`). Never expose drafts unauthenticated.
- **Deploy:** the Cloudflare target ($5/mo, Pages+Workers) must run the adapter for
  the preview route — confirm with Phase 5 infra.

### D.4 Replication guide (apply to other collections later)
- **Block polish:** the `makeBlockLabel` factory + CSS are already global — any
  collection embedding `blocks` inherits it for free once blocks carry
  `admin.components.Label`.
- **Collapsible sidebar:** global provider component → applies to **every** edit view
  automatically; nothing per-collection.
- **Sidebar tabs:** export the `ui` tab field + `SidebarTabs` component; add the one
  `ui` field to any collection's sidebar. Services collections (Tours, Accommodations,
  etc.) have similarly crowded sidebars and benefit most.
- **Preview:** add `admin.preview` per collection with that collection's URL base
  (e.g. `/tour/${doc.slug}`); the SSR preview route can be generalized to
  `/preview/[collection]/[...slug]`.

### D.5 Known limitations
- Goals 2 & 3 CSS targets **undocumented Payload internal class names**
  (`.document-fields__sidebar`, `.doc-controls`, `.blocks-field`) — re-verify after
  any `@payloadcms/*` upgrade.
- Goal 1 Option A shows **published** content only (not unsaved edits); Option B shows
  the **last saved** draft (not live keystrokes); true live preview (Option C) is
  disproportionate effort for an SSG/Astro stack.
- Enabling `versions.drafts` would introduce `_status` alongside the existing custom
  `status` field → **avoid** unless a full migration of frontend queries is scoped.
- Autosave (Goal 5) is intentionally deferred — it depends on drafts.
- All admin-UI changes require a **CMS login** to verify visually (same constraint as
  Phases 4.1–4.7).

### D.6 Estimated total effort
- **Track 1 (Goals 2–5, admin UI):** ~2 days.
- **Track 2 (Goal 1):** Option A ~1–2 h · Option B ~1.5–2.5 d · Option C ~3–4 d.
- **Combined (Track 1 + Preview Option A):** ~2.5 days, LOW–MED risk, no frontend rework.
- **Combined (Track 1 + Preview Option B):** ~4–4.5 days, introduces Astro hybrid + deploy change.

---

## Implementation Notes (added 2026-08-27)

### Files added / changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/cms/src/blocks/BlockLabel.tsx` | **Added** | Single `useRowLabel`-driven component that renders coloured badge + summary + row#. Handles all 16 block types via a `blockType → { label, color }` map + a per-type summarizer. |
| `apps/cms/src/blocks/index.ts` | **Modified** | Added `admin: { group, components: { Label: '/blocks/BlockLabel#default' } }` to every block. Groups: Layout (hero, spacer), Content (richText, image, gallery, embed), Marketing (cta, trustBadges, valuePropsBanner, statsBanner), Services (serviceGrid, serviceListing), Social Proof (faq, testimonials, testimonialsCarousel), Utility (contact). |
| `apps/cms/src/admin/EditSidebarToggle.tsx` | **Added** | Global client provider. Restores `body[data-sidebar-collapsed]` from localStorage on mount, injects a floating toggle button when `.doc-controls`/`.document-fields` is present, self-removes on non-edit routes via MutationObserver. |
| `apps/cms/src/admin/SidebarTabs.tsx` | **Added** | UI-field component (client). Renders 3-tab bar (General / SEO / Publishing), writes `data-sidebar-tab` on `.document-fields__sidebar`, persists active tab to localStorage. |
| `apps/cms/src/admin/edit-view.css` | **Added** | Edit-view CSS: sticky `.doc-controls`, collapse rules, sidebar tab visibility, block label badge, per-type block row borders, drag-handle emphasis. Theme-aware (light/dark). |
| `apps/cms/src/admin/AdminStyles.tsx` | **Modified** | Added `import './edit-view.css'` alongside the existing `admin-global.css` import. |
| `apps/cms/src/payload.config.ts` | **Modified** | Added `EditSidebarToggle` to `admin.components.providers` array. |
| `apps/cms/src/collections/Pages.ts` | **Modified** | Added `admin.preview` (Option A — conditional on `status==='published'`, `home`→`/`, uses `SITE_URL` env). Added `sidebarTabsField` (ui type, first in sidebar). Wrapped each existing sidebar field with `withSidebarTab(field, tab)` helper that appends `sidebar-field--<tab>` to `admin.className`. |

### Class names used (Payload 3.33 — upgrade reference)

| Purpose | Class name | Verified as |
|---------|-----------|-------------|
| Save/Preview bar | `.doc-controls` | Sticky top target |
| Edit form wrapper | `.document-fields` | Router presence sentinel for toggle |
| Main content column | `.document-fields__main` | Widens when sidebar collapsed |
| Right sidebar | `.document-fields__sidebar` | Hidden by `body[data-sidebar-collapsed]`; carries `data-sidebar-tab` |
| Blocks field | `.blocks-field` | Wrapper for the whole blocks input |
| Block row | `.blocks-field__row` | Collapsed row; `:has(.dnj-block-label[data-block-type=…])` drives border colour |
| Drag handle | `.drag-handle`, `[class*="DragHandle"]`, `[class*="drag-handle"]` | Broad selector — Payload uses per-file CSS-module names so we cover all |

> ⚠️ Re-verify these after any `@payloadcms/*` upgrade — they are internal
> UI classes. If Payload renames one, only the CSS in `edit-view.css` needs
> updating; the components/config are name-agnostic.

### Built-in features verified / documented

| Feature | Status | Notes |
|---------|--------|-------|
| **`Ctrl/Cmd+S` save shortcut** | ✅ Native in Payload 3.x | No code needed; part of `SaveButton` component. |
| **Leave-without-saving warning** | ✅ Native in Payload 3.x | `LeaveWithoutSaving` guard mounted by default in edit view. |
| **Duplicate document** | ✅ Native | Available in `…` dropdown in doc-controls. |
| **Autosave / draft indicator** | ⛔ Deferred | Requires `versions.drafts` which introduces `_status` alongside the custom `status` field — see §B/C Goal 1 for reconciliation approach. Not enabled in this phase. |

### Goal 1 (Preview) — chosen approach

Implemented **Option A** (conditional deep-link, honest label):

```ts
admin: {
  preview: (doc) => {
    if (!doc || doc.status !== 'published' || !doc.slug) return null
    const siteUrl = (process.env.SITE_URL || 'http://localhost:4321').replace(/\/$/, '')
    const path = doc.slug === 'home' ? '' : `/${doc.slug}`
    return `${siteUrl}${path}`
  },
}
```

**Behaviour:**
- Draft → returning `null` → Payload suppresses the button (all roles).
- Published → button appears next to Save → opens the built page in a new tab.
- `home` slug → root URL (`/`), matching Astro's static home mount.
- URL base from `SITE_URL` env (production); localhost:4321 fallback (Astro dev).

**Caveat (documented in-app via honesty of scope):** this opens the *published* page,
not "unsaved-edit preview." True draft preview is Option B in §B/C and needs an
Astro hybrid route — deferred to a future phase.

### Replication guide (apply to other collections)

For any collection that uses the default edit view:

1. **Block polish** — nothing to do. If the collection embeds `blocks`, they already
   inherit the label component + CSS globally.
2. **Collapsible sidebar** — nothing to do. `EditSidebarToggle` runs on every edit route.
3. **Sticky doc-controls** — nothing to do. CSS is global.
4. **Sidebar tabs** — per collection:
   - Import the same `sidebarTabsField` + `withSidebarTab` helper (or move both to
     a shared `apps/cms/src/fields/sidebarTabs.ts` when rolling out broadly).
   - Add `sidebarTabsField` as the FIRST field.
   - Wrap each existing sidebar field with `withSidebarTab(field, tab)` where `tab` is
     `'general' | 'seo' | 'status'` (rename tab keys per collection needs; update
     the CSS visibility matrix in `edit-view.css` if you add tabs).
5. **Preview button** — add `admin.preview` per collection:
   ```ts
   preview: (doc) => doc?.status !== 'published' || !doc?.slug ? null
     : `${SITE_URL}/tour/${doc.slug}`  // adjust base per collection
   ```

**Candidates for next rollout:** Tours, Accommodations, WaterActivities, Yachts,
Restaurants, Venues, Rentals, Spa — all have sidebar-heavy edit views and are
routed at singular `/<service>/<slug>`.

### Known limitations
- CSS targets internal Payload class names (`.document-fields__sidebar`,
  `.blocks-field__row`, `.doc-controls`). Re-verify on `@payloadcms/*` upgrade.
- Sidebar tabs classNames are applied at the field wrapper Payload renders; if a
  future Payload UI change moves `admin.className` off the wrapper, the visibility
  rules stop hiding but fields still work (graceful degradation → shown as
  ungrouped list).
- Preview shows **published** content only. Draft preview requires Astro hybrid
  mode (Option B) — deferred.
- Block-count indicator was scoped to CSS-only in the plan; punted to a future
  enhancement (needs a small custom Label on the `content` field or a client
  counter, both trivial follow-ups).
- Verified via `tsc --noEmit` (no errors in new files). **Visual verification
  still requires a CMS login** — same constraint as Phases 4.1–4.7.

### Rollback
Revert commits touching `apps/cms/src/blocks/BlockLabel.tsx`,
`apps/cms/src/admin/{EditSidebarToggle,SidebarTabs,edit-view.css}` and undo the
edits to `AdminStyles.tsx`, `payload.config.ts`, `collections/Pages.ts`,
`blocks/index.ts`. No DB schema change → no migration to reverse.

---

## References
- Payload Preview: https://payloadcms.com/docs/admin/preview
- Payload Live Preview: https://payloadcms.com/docs/live-preview/overview
- Payload Drafts: https://payloadcms.com/docs/versions/drafts
- Payload Blocks field (admin.components.Label, images, group): https://payloadcms.com/docs/fields/blocks
- Related: [CMS admin custom CSS memory], [phase-4.5 sidebar redesign](phase-4.5-sidebar-redesign.md), [phase-4.7 dashboard logo](phase-4.7-dashboard-logo-and-cleanup.md)
