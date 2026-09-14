# Phase 4.35 — Blog Feature Scaffold + Migration System Bootstrap

**Date:** 2026-09-12
**Branch:** `feature/phase4-polish-launch`
**Status:** 🔨 Code complete · ⏳ Owner UAT (seed data + verify frontend routes)

## Two-part phase

This phase bundles **two concurrent deliveries**:

1. **Blog feature scaffold** — Authors + Posts collections, five new blog blocks, `/blog/[slug]` detail route, RSS feed, JSON-LD stack.
2. **Migration-system bootstrap** — retire the ad-hoc dev-push workflow entirely. Payload migrations become the single source of truth for schema evolution. Full audit + rationale in [docs/reports/schema-management-audit.md](../reports/schema-management-audit.md).

Both had to ship together because Blog was the third collection-add in a row where dev push failed with the same class of errors — that's what motivated the switch.

## Owner decisions (locked before implementation)

| # | Decision | Landing |
|---|---|---|
| 1 | Comments — **skip in v1** | No comments collection, no endpoint. |
| 2 | Ads — **manual AdSlot block only** | AdSense + Custom HTML providers, gated behind `enableAds` toggle. AdSense loader script deliberately not injected yet. |
| 3 | Bylines — **separate Authors collection** | External contributors keep their real name; decoupled from Payload Users. |
| 4 | Popular Posts — **analytics-driven with isFeatured fallback** | `top-posts.json` skeleton at launch; block auto-falls back to `-isFeatured,-publishedAt`. |
| 5 | RSS — **at launch** | Hand-rolled RSS 2.0 (no `@astrojs/rss` dep). |

## What shipped

### Migration system (bootstrap)
- [apps/cms/src/payload.config.ts](../../apps/cms/src/payload.config.ts) — `push: false` permanent, `migrationDir: './migrations'` set.
- [apps/cms/src/migrations/](../../apps/cms/src/migrations/) — new folder. Five migrations landed:

  | Batch | File | Purpose |
  |---|---|---|
  | 1 | `20260912_114854_initial-baseline.ts` | Snapshot of the DB as of pre-Blog state. Marked applied via a one-time bootstrap script (never actually run — DB already matched). |
  | 2 | `20260912_115008_add-authors-and-blog-enum.ts` | 118-line diff: Authors collection + `blog` value in Categories.module + `authors_id` FK on payload_locked_documents_rels. |
  | 3 | `20260912_124731_add-posts-collection.ts` | 1,074 lines: Posts + posts_gallery + 30 posts_blocks_* sub-tables + posts_rels + FK add. |
  | 4 | `20260912_124950_add-site-features-blog-ads.ts` | 27ms diff: blog.enabled + blog.enableAds columns on site_features. |
  | 5 | `20260912_125056_add-5-blog-blocks.ts` | 2,359 lines: 66 tables — 5 new blocks × every collection that embeds `blocks`. |

- [apps/cms/package.json](../../apps/cms/package.json) — new scripts: `schema:new`, `schema:migrate`, `schema:status`, `schema:down`, `schema:refresh`, `schema:fresh`. Removed the retired `schema:safe-push`.
- [apps/cms/src/scripts/archive/pre-migrations-era/](../../apps/cms/src/scripts/archive/pre-migrations-era/) — 22 obsolete scripts moved here (db-safe-push, push-schema-once, phase4.33/4.35 preflight/finalize/diagnose, drop-*, inspect-*, nuclear-*). README in that folder marks them do-not-run.
- [docs/DB-SCHEMA-CHANGES.md](../DB-SCHEMA-CHANGES.md) — rewritten around the migration workflow. Old push-based prompt guide archived at the bottom.
- [AGENTS.md](../../AGENTS.md) §6 — updated to reference the migration workflow. `PAYLOAD_FORCE_PUSH` explicitly banned.

### Blog feature — CMS (apps/cms)
- New [src/collections/Authors.ts](../../apps/cms/src/collections/Authors.ts) — bylines: name, slug, avatar, role, bio, socialLinks[]. Admin-created (adminCreate), editor-updatable.
- New [src/collections/Posts.ts](../../apps/cms/src/collections/Posts.ts) — Fields: title, slug, publishedAt (sidebar), author (rel, required), readingTimeMinutes, isFeatured, excerpt, category (rel filtered `module=blog`), tags (hasMany rel), featuredImage, gallery[], body (lexical richText), additionalBlocks[] (SA-only). `create: authenticatedUpdate` — **the one RBAC widening** — editors can create posts.
- [src/collections/Categories.ts](../../apps/cms/src/collections/Categories.ts) — added `{ label: 'Blog', value: 'blog' }` to the `module` enum.
- [src/blocks/index.ts](../../apps/cms/src/blocks/index.ts) — appended five new blocks:
  - `PostList` — grid, category filter, featuredOnly, View-All CTA
  - `FeaturedPost` — 2-col hero card + 3 side cards; auto = isFeatured first then latest, or manual pick
  - `CategoryGrid` — tile grid; `module` field lets it work for any vertical
  - `PopularPosts` — sidebar + grid variants
  - `AdSlot` — AdSense/custom; superadmin-only customHtml
- [src/globals/SiteFeatures.ts](../../apps/cms/src/globals/SiteFeatures.ts) — new "Blog & Ads" tab with `blog.enabled` + `blog.enableAds`.
- [src/payload.config.ts](../../apps/cms/src/payload.config.ts) — registered Authors + Posts.

### Blog feature — Frontend (apps/web)
- [src/lib/structuredData.ts](../../apps/web/src/lib/structuredData.ts) — added `blogPostingSchema` + `blogSchema` helpers (Article/Person/Organization + mainEntityOfPage).
- [src/components/common/LexicalRenderer.astro](../../apps/web/src/components/common/LexicalRenderer.astro) — thin wrapper around the existing `lexicalToHtml` serializer with scoped article-body typography.
- [src/components/blocks/PostListBlock.astro](../../apps/web/src/components/blocks/PostListBlock.astro)
- [src/components/blocks/FeaturedPostBlock.astro](../../apps/web/src/components/blocks/FeaturedPostBlock.astro)
- [src/components/blocks/CategoryGridBlock.astro](../../apps/web/src/components/blocks/CategoryGridBlock.astro)
- [src/components/blocks/PopularPostsBlock.astro](../../apps/web/src/components/blocks/PopularPostsBlock.astro) — reads `data/top-posts.json`, falls back to `-isFeatured,-publishedAt`.
- [src/components/blocks/AdSlotBlock.astro](../../apps/web/src/components/blocks/AdSlotBlock.astro) — returns nothing when `blog.enableAds` is off.
- [src/components/blocks/BlockRenderer.astro](../../apps/web/src/components/blocks/BlockRenderer.astro) — 5 new case branches.
- New [src/pages/blog/[slug].astro](../../apps/web/src/pages/blog/[slug].astro) — static route via `getStaticPaths()` gated by `blog.enabled`. Hero + `<LexicalRenderer>` + `additionalBlocks` + sidebar (PopularPosts + Categories tag cloud) + Related Posts + full JSON-LD (BlogPosting + BreadcrumbList + WebPage) + `<link rel="alternate">` for RSS.
- New [src/pages/blog/rss.xml.ts](../../apps/web/src/pages/blog/rss.xml.ts) — hand-rolled RSS 2.0. Returns empty feed when `blog.enabled` is off.
- New [src/data/top-posts.json](../../apps/web/src/data/top-posts.json) — placeholder `posts: []`.
- [src/lib/features.ts](../../apps/web/src/lib/features.ts) — added `blog` group + `isBlogFlagEnabled()`.
- [src/lib/payload.ts](../../apps/web/src/lib/payload.ts) — added `getPosts/getPostBySlug/getAuthors/getAuthorBySlug`.

## Phase 4.35.1 addendum (same-day) — BlogSettings global + Related Posts config-driven

Adding editable control for Related Posts + Sidebar via CMS. Ships as **Migrations 6+7+8**.

- New global [globals/BlogSettings.ts](../../apps/cms/src/globals/BlogSettings.ts) — 2 tabs:
  - **Related Posts** — `enabled`, heading, subtitle, `selectionMode` (same-category / same-tags / same-author / latest / manual), `limit`, `columns`, `cardVariant` (compact / detailed / horizontal), `show*` toggles, View All group, styling (background — sand-family site tokens — + padding). SA-only fields for structural styling.
  - **Sidebar** — `showPopularPosts` + heading + limit; `showAdSlot` + `adSlotPosition` (top / between / bottom); `showCategories` + heading + limit; `showNewsletter` + heading.
- [collections/Posts.ts](../../apps/cms/src/collections/Posts.ts) sidebar tab **Related Posts (override)** — checkbox `overrideRelated` + conditional `heading` / `selectionMode` / `limit` / `manualPosts` (hasMany relationship). Global default + per-post override = same hybrid pattern as Related Services (Phase 4.17).
- New helper [lib/relatedPosts.ts](../../apps/web/src/lib/relatedPosts.ts) — `resolveRelatedConfig()` merges global + override; `fetchRelatedPosts()` runs the selection query with fallback.
- New component [components/blog/RelatedPosts.astro](../../apps/web/src/components/blog/RelatedPosts.astro) — 3 card variants render inline based on config.
- [lib/payload.ts](../../apps/web/src/lib/payload.ts) — added `getBlogSettings`.
- [pages/blog/[slug].astro](../../apps/web/src/pages/blog/[slug].astro) — refactored sidebar (widget order from config, per-widget config) + Related section (component-driven).
- Migration 6 `20260914_032538_add-blog-settings-and-related-override.ts` — CREATE TABLE blog_settings + 4 ALTER TABLE posts ADD COLUMN.
- Migration 7 `20260914_131144_add-blog-settings-fk.ts` — hand-written follow-up: `payload_locked_documents_rels.blog_settings_id` + `payload_preferences_rels.blog_settings_id` (drizzle-kit skipped these; same class as Phase 4.33 newsletter_subscribers).
- Migration 8 `20260914_134031_rename-muted-to-sand.ts` — data-only UPDATE `background='muted'` → `'sand'` after renaming enum values to use site tokens (sand family + ocean) so Related section is seamless with body `bg-sand` (was visibly different `bg-stone/5`). Rendering conditionally drops `border-t` when bg=sand for zero-seam look.
- 10-col grid on blog detail: main `md:col-span-7` (~70%) + aside `md:col-span-3` (~30%) with sticky sidebar (`md:sticky md:top-24`).

## Phase 4.35.2 addendum (same day) — /blog index page + Newsletter block

- New CMS block **Newsletter** in [blocks/index.ts](../../apps/cms/src/blocks/index.ts) — inline signup section. Fields: heading, description, placeholderText, buttonLabel, success/error messages, `theme` (sand/ocean/leaf/white), `layout` (stacked/centered). Submits to `/api/newsletter-subscribe` (same endpoint as footer NewsletterSignup, Phase 4.33).
- New Astro component [components/blocks/NewsletterBlock.astro](../../apps/web/src/components/blocks/NewsletterBlock.astro) — theme-aware inline form + inline JS init (idempotent, coexists with footer NewsletterSignup binding).
- [components/blocks/BlockRenderer.astro](../../apps/web/src/components/blocks/BlockRenderer.astro) — 1 new case branch.
- Migration 9 `20260914_065240_add-newsletter-block.ts` — Newsletter block × every collection embedding `blocks` (Pages.content + all 8 service `additionalBlocks` + Post.additionalBlocks). Additive, applied cleanly, no FK finalize needed this time.
- New seed script [scripts/seed-blog-index-page.ts](../../apps/cms/src/scripts/seed-blog-index-page.ts) — idempotent upsert of CMS Page `slug='blog'` composed of 5 blocks: Hero + FeaturedPost + CategoryGrid + PostList + Newsletter. Also appends `Blog → /blog` to `main-navigation` menu. Registered as `pnpm seed:blog-index`.
- **Result:** `/blog` renders 5 sections matching `ai/reference/blog` — Hero, "Popular Posts" (1 large + 3 side), "Explore by Category" (6-tile grid with article counts), "Latest Stories" (3-col grid), inline Newsletter (bg-sand seamless).

## Phase 4.35.3 addendum (2026-09-14) — POSTS admin group + Categories split + Tags collection

Adds a dedicated **POSTS** sidebar accordion group focused on article authoring, splits the cross-module `Categories` collection into `blog-categories` (Posts group, editor-owned) + the existing `categories` (Content group, service verticals), adds a new editor-createable `Tags` collection, and injects quick "+ Add" shortcut links under each editorial collection.

### CMS
- New collection [collections/Tags.ts](../../apps/cms/src/collections/Tags.ts) — name, slug, description, color, status, sortOrder. `create: authenticatedUpdate` — editors add tags. Group: `Posts`.
- New collection [collections/BlogCategories.ts](../../apps/cms/src/collections/BlogCategories.ts) — clone of Categories minus the `module` discriminator field. Fields: name, slug, parent (self-ref), description, icon, featuredImage. `create: authenticatedUpdate` — editors create blog categories. Group: `Posts`.
- [collections/Posts.ts](../../apps/cms/src/collections/Posts.ts) — `admin.group: 'Posts'` (was `Content`). `category.relationTo: 'blog-categories'` (was `categories` filtered by module). `tags.relationTo: 'tags'` (was `categories` filtered by module).
- [collections/Categories.ts](../../apps/cms/src/collections/Categories.ts) — removed `'blog'` value from the `module` enum. Cross-module categories continue to serve tours/villa/etc under the Content group.
- [blocks/index.ts](../../apps/cms/src/blocks/index.ts) — PostList block's `filterCategory.relationTo` retargeted from `categories` (filtered) → `blog-categories`.
- [payload.config.ts](../../apps/cms/src/payload.config.ts) — registered `BlogCategories` + `Tags`. `collections` array reordered so POSTS group first-appears between CONTENT and SERVICES.

### Sidebar quick-add
- [admin/NavAccordion.tsx](../../apps/cms/src/admin/NavAccordion.tsx) — added a 3rd useEffect that injects `+ Add [Singular]` links below the list-view link of Posts, Authors, Tags, BlogCategories. Idempotent (guards against duplicate injection). Convention hardcoded via `QUICK_ADD` map inside the component — no fragile `admin.custom` type gymnastics.
- [admin/admin-global.css](../../apps/cms/src/admin/admin-global.css) — added `.nav__link--quick-add` styles (smaller, indented, subdued opacity). Also added icon mappings for `posts`, `blog-categories`, `tags`, `authors`, and the `blog-settings` global that were missing.

### Frontend
- [lib/payload.ts](../../apps/web/src/lib/payload.ts) — added `getBlogCategories`, `getBlogCategoryBySlug`, `getTags`, `getTagBySlug` fetchers.
- [components/blocks/CategoryGridBlock.astro](../../apps/web/src/components/blocks/CategoryGridBlock.astro) — module branch: `module='blog'` fetches from `blog-categories`; other modules keep fetching from `categories` with module filter.
- [pages/blog/[slug].astro](../../apps/web/src/pages/blog/[slug].astro) — sidebar Categories widget now fetches from `getBlogCategories` (was `getCategories({where:{module=blog}})`).

### Migrations (2 files this addendum)
- **Migration 10** `20260914_121211_add-tags-and-blog-categories.ts` — schema + data + cleanup, all in one file:
  - CREATE TABLE `blog_categories` + `tags` + indexes.
  - **Seed** `blog_categories` from `categories` WHERE `module='blog'`, preserving IDs (existing `posts.category_id=7` still resolves after FK swap). Parent IDs nulled (cross-module parent references dropped).
  - Rebuild `posts.category_id` FK from `categories` → `blog_categories`, all 11 `*_blocks_post_list.filter_category_id` FKs likewise.
  - Rebuild `posts_rels` shape: added `tags_id`, dropped `categories_id`. Old tag rels dropped (**hard reset** per owner decision — 4 rows tagged-as-categories were deleted; users re-tag manually with real Tag docs).
  - ADD FK columns to `payload_locked_documents_rels`: `blog_categories_id` + `tags_id` (drizzle-kit emitted these correctly this time).
  - DELETE FROM `categories` WHERE `module='blog'` — enum cleanup so no invalid values remain.
  - **Idempotent cleanup block at start** — drops `__new_posts` leftover + empty `blog_categories`/`tags` from any partial prior run, so re-executing after a failure is deterministic.
- No follow-up FK-finalize migration needed (all rels FKs landed in Migration 10).

### RBAC
Editor role now has `create` on `authors`, `posts`, `blog-categories`, and `tags` (was: only on `posts`+`authors`). All within the POSTS admin group — matches "focus on article authoring" intent.

### Verified
- DB post-migration: 6 blog_categories rows (IDs 7-12 preserved), 0 tags, 3 posts with `category_id` preserved (all → Lagoy #7), 6 categories rows non-blog only, `posts_rels` new shape, migration recorded batch 9.
- Admin sidebar (browser-checked): POSTS group sits between CONTENT and SERVICES; contains Posts, Blog Categories, Tags; "+ Add …" quick-add links appear under each and jump to the create form.

### Retired
- The cross-module `Categories.module='blog'` values (6 rows) are gone from Categories. The `blog` enum option is retired from the Categories.module select.

## What's deferred

- **Analytics fetch job** populating `top-posts.json` from Cloudflare Web Analytics. Block already handles a populated file — flipping this on later needs only the script + a token env var.
- **Comments** (skipped per owner decision).
- **AdSense loader script** — not wired until first live AdSense unit ships.
- **`/author/[slug]` page** — JSON-LD emits the URL prophetically for future retrofit.
- **Reading-time auto-compute** — manual field for now.

## RBAC change (only one)

| Collection | create | update | delete |
|---|---|---|---|
| `posts` | `authenticatedUpdate` (any editor) | `authenticatedUpdate` | `superAdminDelete` |
| `authors` | `adminCreate` | `authenticatedUpdate` | `superAdminDelete` |

Structural placement inside `Posts.additionalBlocks` is guarded by `superAdminFieldAccess` — editors can't drop random Embed/AdSlot blocks. `AdSlot.customHtml` is likewise SA-only.

## Reserved-slug impact

None. `/blog/[slug]` is a static subpath route; the catch-all resolves after static routes, so a CMS Page at slug `blog` (the index) coexists with `/blog/foo` (a Post) with no collision.

## Cloudflare / hosting

- D1: +2 collections + 30 posts_blocks tables + 66 new blog-block sub-tables. Payload's rowsize per block is small; negligible D1 usage.
- R2: reuses existing Media pipeline.
- Build time: `+N` prerendered routes where N = published posts count. At <500 posts negligible.
- SSR: only `blog/rss.xml.ts` runs on-demand (Cloudflare Pages Function). One endpoint.

## Verification steps for owner

1. **CMS admin:**
   - Boot: `pnpm --filter cms dev`
   - `/admin/collections/authors` renders bare (empty state).
   - Create one Author (name + slug + optional avatar) → save.
   - `/admin/collections/categories` — create one with module = `Blog`.
   - `/admin/collections/posts` — Create New. Fill: title, slug (auto), author (pick your Author), category (pick your Blog category), featuredImage, body (some paragraphs), publishedAt (set today). Save + publish.
   - `/admin/globals/site-features` — new "Blog & Ads" tab with two toggles. Confirm `blog.enabled=true` (default).
2. **Frontend build/dev:**
   - `pnpm --filter web dev`
   - `/blog/<your-post-slug>` — hero + article body + sidebar (Popular + Categories) + related. `view-source` and grep `application/ld+json` — should show `BlogPosting` + `BreadcrumbList` + `WebPage`.
   - `/blog/rss.xml` — RSS 2.0 feed with your post as `<item>`.
   - Create a CMS Page at slug `blog` (from `/admin/collections/pages`). Add blocks: Hero + FeaturedPost + PostList + CategoryGrid. Publish. Visit `/blog` → composed index page.
3. **Migration workflow smoke test:**
   - `pnpm --filter cms schema:status` — all 5 migrations show `Ran: Yes`.
   - Add a trivial field to any collection (e.g. `test123` text on Authors), run `pnpm --filter cms schema:new -- --name test-add-field`, review the tiny generated diff, `pnpm --filter cms schema:migrate` → applied. Then delete the field, generate + apply a `remove` migration. Confirm the workflow is smooth.

## Follow-ups (post-verification)

- Delete pre-Blog `cms.db.bak-safe-push-*` backups (4 files) after confirming migration workflow reliable — they were only kept as belt-and-braces.
- Wire the analytics fetch job to populate `top-posts.json`.
- If comments needed later: new `Comments` collection with public-write access via API key + honeypot + rate-limit + SSR `/api/comment-submit` endpoint (same pattern as NewsletterSubscribers).
- If AdSense goes live: add loader script in `<BaseLayout>` gated on `blog.enableAds`.
