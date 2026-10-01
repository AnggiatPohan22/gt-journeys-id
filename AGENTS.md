# AGENTS.md — DnJourneysBali Master Rules

This file is the master rule for all AI agents working on this project.
Read this file first before making any changes.

---

## 1. Project Identity

**Project:** DnJourneysBali — Travel Website Template
**Architecture:** Monorepo with separated Frontend + Backend CMS
**Goal:** Reusable travel website template with 7 service modules,
CMS-managed content, WhatsApp-first booking, deployable to Cloudflare.

---

## 2. Monorepo Structure — TWO SEPARATE APPS

This project is a monorepo with two independent applications.
They share types but deploy separately. Never mix their concerns.

```
dn-journeys-bali/
├── apps/web/          ← FRONTEND (Astro static site)
├── apps/cms/          ← BACKEND  (Payload CMS on Next.js)
├── packages/shared/   ← SHARED types & utilities only
├── ai/                ← AI agent rules (this file lives here or root)
└── docs/              ← Documentation
```

### apps/web/ — FRONTEND

| Attribute | Value |
|-----------|-------|
| Framework | Astro 5 |
| Styling | Tailwind CSS 3.4 + GSAP 3 + Alpine.js |
| Output | Static HTML (pre-built at deploy time) |
| Hosting | Cloudflare Pages (FREE tier) |
| Data source | Fetches from CMS API at build time |
| Size concern | Keep small — only static assets + HTML |

### apps/cms/ — BACKEND CMS

| Attribute | Value |
|-----------|-------|
| Framework | Payload CMS 3.x on Next.js 15 |
| Runtime | Node.js (locally) / Cloudflare Workers (production) |
| Database | SQLite locally / Cloudflare D1 (production) |
| File storage | Local disk (dev) / Cloudflare R2 (production) |
| Adapter | OpenNext Cloudflare adapter |
| Hosting | Cloudflare Workers ($5/month paid plan) |
| Size concern | Keep lean — no frontend assets here |

### packages/shared/ — SHARED CODE

| Attribute | Value |
|-----------|-------|
| Contains | TypeScript types, formatting utilities |
| Used by | Both apps/web and apps/cms |
| Never contains | Components, styles, images, business logic |

---

## 3. THE GOLDEN RULE — Separation of Concerns

```
FRONTEND (apps/web/)           BACKEND (apps/cms/)
─────────────────────          ─────────────────────
Astro components               Payload collections
Tailwind styles                Access control (RBAC)
GSAP animations                Block definitions
Page templates                 Field configs
Static assets (images, fonts)  Hooks (slug generation, etc.)
WhatsApp link helpers          Database schema (auto from collections)
SEO/Schema.org markup          Media upload handling
                               Admin panel UI (built-in Payload)

          ┌─────────────────────┐
          │  packages/shared/   │
          │  TypeScript types   │
          │  Format utilities   │
          └─────────────────────┘
```

**Rules:**
- Frontend NEVER contains database logic, auth, or server-side code
- Backend NEVER contains styles, components, animations, or page layouts
- Shared NEVER contains anything that imports from Astro or Payload
- Images and fonts go in apps/web/public/ — NEVER in apps/cms/
- CMS media (user uploads) are stored in R2 — NEVER in the git repo

---

## 4. Development Workflow

### Local Development

```bash
# Terminal 1 — CMS Backend (must start first)
cd apps/cms
pnpm dev                # → localhost:3000/admin (Next.js dev server)

# Terminal 2 — Frontend
cd apps/web
pnpm dev                # → localhost:4321 (Astro dev server)
```

The frontend fetches data from the CMS at `http://localhost:3000/api/`.
Set this in `apps/web/.env`:
```
CMS_URL=http://localhost:3000
```

### Build Commands

```bash
# Frontend only
cd apps/web && pnpm build     # Output: apps/web/dist/

# CMS only
cd apps/cms && pnpm build     # Output: apps/cms/.next/ + .open-next/
```

---

## 5. Deploy Scheme — Frontend and Backend are INDEPENDENT

### Frontend Deploy → Cloudflare Pages (FREE)

```
Developer pushes to GitHub
        │
        └──→ Cloudflare Pages watches /apps/web/
             │
             ├── Build command:  cd apps/web && pnpm install && pnpm build
             ├── Output dir:     apps/web/dist
             ├── Build output:   Static HTML + CSS + JS + images
             └── Result:         Live at dnjourneysbali.com

Size: typically 5-20 MB (HTML + optimized assets)
Cost: $0/month (Cloudflare Pages free tier)
Rebuild trigger: git push OR CMS webhook on content save
```

**What gets deployed:** Only the `dist/` folder — pre-rendered HTML pages,
CSS bundles, optimized images, and minimal JS for interactions.

**What does NOT get deployed:** No node_modules, no source TypeScript,
no CMS code, no server-side logic.

### Backend Deploy → Cloudflare Workers ($5/month)

```
Developer runs: cd apps/cms && pnpm deploy
        │
        ├── Step 1: next build (builds Payload + Next.js)
        ├── Step 2: opennextjs-cloudflare build (converts to Worker)
        ├── Step 3: wrangler deploy (uploads to Cloudflare Workers)
        │
        ├── Worker bundle:   .open-next/worker.js
        ├── Database:        Cloudflare D1 (managed, no file in repo)
        ├── Media storage:   Cloudflare R2 (managed, no file in repo)
        └── Result:          Live at cms.dnjourneysbali.com

Size: Worker bundle ~3-10 MB (Cloudflare limit: varies by plan)
Cost: $5/month (Workers paid plan)
Deploy trigger: manual (pnpm deploy:cms) — NOT auto on git push
```

**What gets deployed:** Only the Worker bundle (.open-next/worker.js) —
compiled server-side code that runs the CMS API and admin panel.

**What does NOT get deployed:** No frontend assets, no images,
no fonts, no static HTML, no node_modules.

### Why They Deploy Separately

1. **Size:** Frontend is static files (~10 MB). CMS is a server app (~5 MB worker).
   Combining them would double deploy size for no reason.

2. **Cost:** Frontend is free on Cloudflare Pages. CMS costs $5/month on Workers.
   Deploying frontend changes should never require the $5 plan.

3. **Speed:** Frontend rebuilds take 30-60 seconds (static generation).
   CMS deploys take 2-3 minutes (Next.js build + OpenNext conversion).
   Independent deploys mean frontend content changes ship fast.

4. **Independence:** Updating a Tailwind color doesn't need a CMS redeploy.
   Adding a new collection field doesn't need a frontend redeploy
   (unless you add UI for it).

---

## 6. CMS Architecture — Payload on Next.js

### Required File Structure for apps/cms/

Payload CMS 3.x runs inside Next.js. The minimum required structure:

```
apps/cms/
├── src/
│   ├── app/                          ← Next.js App Router (required by Payload)
│   │   ├── (payload)/                ← Payload admin panel routes
│   │   │   ├── admin/
│   │   │   │   └── [[...segments]]/
│   │   │   │       └── page.tsx      ← Payload admin catch-all
│   │   │   ├── layout.tsx            ← Root layout for admin
│   │   │   └── custom.scss           ← Optional admin styling
│   │   ├── api/
│   │   │   └── [...slug]/
│   │   │       └── route.ts          ← Payload REST API catch-all
│   │   └── my-route/                 ← Any custom API endpoints
│   │       └── route.ts
│   │
│   ├── collections/                  ← Payload collection configs
│   ├── globals/                      ← Payload global configs
│   ├── blocks/                       ← Block definitions for page builder
│   ├── fields/                       ← Reusable field groups
│   ├── access/                       ← RBAC access control functions
│   ├── hooks/                        ← Lifecycle hooks
│   └── payload.config.ts             ← Main Payload configuration
│
├── next.config.mjs                   ← Next.js config (withPayload wrapper)
├── wrangler.toml                     ← Cloudflare Workers config
├── tsconfig.json
└── package.json
```

**Key point:** The `src/app/` directory is Next.js boilerplate required
by Payload 3. It contains route handlers, NOT custom UI. Do not add
React components, pages, or styles here — Payload's admin UI is built-in.

### Database Adapter

```
Local dev:     SQLite file (auto-created by Payload)
Production:    Cloudflare D1 (configured in wrangler.toml)
```

Payload generates the schema from collection configs. Since 2026-09-12
the DB is evolved through **migrations**, not dev push.

Workflow (from `apps/cms/`):
```
pnpm schema:new -- --name short-description   # generate diff migration
# review the .ts + .json in src/migrations/, commit both
pnpm schema:migrate                            # apply pending migrations
pnpm generate:types                            # regenerate payload-types.ts
```

Never set `PAYLOAD_FORCE_PUSH=true`. Never write ad-hoc DDL scripts.
See [`docs/DB-SCHEMA-CHANGES.md`](./docs/DB-SCHEMA-CHANGES.md) for the
runbook and [`docs/reports/schema-management-audit.md`](./docs/reports/schema-management-audit.md)
for the "why".

---

## 7. Collection Module Pattern

Every service module follows this pattern. When creating a new one,
copy an existing collection and modify fields.

```typescript
// Standard collection structure
export const ModuleName: CollectionConfig = {
  slug: 'module-name',
  admin: {
    useAsTitle: 'title',        // or 'name'
    group: 'Services',          // Admin sidebar group
    defaultColumns: [...],      // List view columns
  },
  access: {
    read: () => true,           // Public read (for API)
    create: adminCreate,        // Admin+ can create
    update: authenticatedUpdate, // Any auth user can edit
    delete: superAdminDelete,   // Only super-admin deletes
  },
  fields: [
    // 1. Title + Slug (always first)
    // 2. Relationships (destination, category)
    // 3. Description (richText)
    // 4. Module-specific fields
    // 5. Pricing (if applicable — use pricingFields)
    // 6. Media (featuredImage + gallery)
    // 7. WhatsApp message template
    // 8. Sidebar: seoFields, statusField, sortOrderField, isFeaturedField
  ],
}
```

**Reusable fields** (in `src/fields/`):
- `seoFields` — meta title, description, OG image
- `pricingFields` — adult/child/infant price, currency, notes
- `statusField` — draft/published (admin+ only can publish)
- `sortOrderField` — manual sort ordering
- `isFeaturedField` — show on homepage
- `whatsappField` — pre-filled WA message template
- `locationFields` — address, map embed, coordinates

**Service tab config** (in `src/config/serviceTabsConfig.ts`):
- Centralized labels, icons, and colors for all 8 service collection tabs
- `sectionClass(color, icon)` helper generates accordion CSS classNames
- Edit this file (NOT individual collection files) to rename tabs or swap icons
- See `docs/guides/service-tabs-config-guide.md` for full details

---

## 8. User Roles & Permissions

| Action | Editor | Admin | Super Admin |
|--------|--------|-------|-------------|
| Edit existing content | ✅ | ✅ | ✅ |
| Upload media | ✅ | ✅ | ✅ |
| Create new entries | ❌ | ✅ | ✅ |
| Publish/unpublish | ❌ | ✅ | ✅ |
| Delete entries | ❌ | ❌ | ✅ |
| Create/delete pages | ❌ | ❌ | ✅ |
| Edit navigation/menus | ❌ | ❌ | ✅ |
| Edit site settings | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

Access control functions are in `src/access/roles.ts`.
Use them in every collection's `access` config.

---

## 9. Frontend Design System

### Colors (defined in apps/web/tailwind.config.mjs)

| Token | Hex | Use |
|-------|-----|-----|
| `ocean` | #1B3A4B | Primary — headers, nav, text emphasis |
| `sand` | #F5F0E8 | Background — warm cream, not cold white |
| `coral` | #E07A5F | Accent — CTAs, buttons, highlights, prices |
| `leaf` | #6B9080 | Secondary — tags, secondary buttons |
| `stone` | #3D405B | Body text — warm dark gray |
| `midnight` | #0D1B2A | Footer, dark sections |

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Fraunces (variable serif) | h1, h2, hero text, section headlines |
| Body | Plus Jakarta Sans (variable sans) | Everything else |

Fonts are self-hosted in `apps/web/public/fonts/` as .woff2 files.
Never use Google Fonts CDN — self-hosting is faster and privacy-friendly.

### GSAP Animations

Use `data-animate` attributes on HTML elements:
- `data-animate="reveal"` — fade up on scroll
- `data-animate="stagger"` — children reveal one by one
- `data-animate="parallax"` — subtle depth on scroll

Animations auto-initialize via `initAnimations()` in BaseLayout.
Always respect `prefers-reduced-motion`.

---

## 10. File Size Guidelines

### Frontend (apps/web/) — Target: < 20 MB deployed

| File Type | Where | Rule |
|-----------|-------|------|
| Fonts (.woff2) | public/fonts/ | Max 2 font families, variable only |
| Images | public/ or src/assets/ | Optimize before commit. Use Astro <Image> |
| CSS | src/styles/ | Single global.css + Tailwind. No CSS frameworks |
| JS | Minimal | GSAP + Alpine.js only. No React, no Vue |
| Pages | src/pages/ | Static .astro files. Keep logic in lib/ |

**Never add to frontend:**
- node_modules (gitignored)
- CMS admin code
- Server-side dependencies
- Unoptimized images (> 500 KB)
- Video files (use YouTube/Vimeo embeds)

### Backend CMS (apps/cms/) — Target: < 10 MB Worker bundle

| File Type | Where | Rule |
|-----------|-------|------|
| Collections | src/collections/ | One file per module |
| Fields | src/fields/ | Reusable groups only |
| Hooks | src/hooks/ | Keep minimal |
| App routes | src/app/ | Payload boilerplate only — no custom UI |

**Never add to CMS:**
- Frontend components or styles
- Images, fonts, or static assets
- Heavy npm packages not needed for CMS
- Custom React pages (use Payload's built-in admin)

### Shared (packages/shared/) — Target: < 50 KB

Only TypeScript types and tiny utility functions.
No dependencies. No imports from Astro or Payload.

---

## 11. Safety Rules

**Never do without explicit approval:**
- Change database schema (add/remove collections or fields) — jika perubahan
  schema disetujui, ikuti [`docs/DB-SCHEMA-CHANGES.md`](./docs/DB-SCHEMA-CHANGES.md)
  untuk menghindari 63-char enum overflow & prompt "create vs rename"
- Install new npm packages
- Change the deploy configuration (wrangler.toml, astro.config)
- Delete existing files or features
- Rename collections, slugs, or API endpoints
- Change access control rules

**Always do:**
- Inspect existing files before editing
- List files that will change before changing them
- Test locally before suggesting deploy
- Keep commits focused on one concern
- Update documentation when adding features

---

## 12. Git Workflow

**Branch naming:**
- `feature/[area]-[name]` — e.g. `feature/web-tour-listing`
- `fix/[area]-[name]` — e.g. `fix/cms-slug-generation`
- `docs/[name]` — e.g. `docs/content-guide`

**Area prefixes:**
- `web-` for frontend changes
- `cms-` for backend changes
- `shared-` for shared package changes

**Commit messages:**
```
[web] Add tour listing page with filters
[cms] Add WaterActivities collection
[shared] Add accommodation type interfaces
[docs] Update deploy guide
```

This makes it clear which app is affected by each commit,
and helps when debugging deploy issues.

---

## 13. Reusability — Template for New Clients

When reusing this template for a new travel client:

1. Clone the repo
2. `apps/web/tailwind.config.mjs` — change brand colors
3. `apps/web/src/config/modules.ts` — toggle services on/off
4. `apps/web/public/fonts/` — swap fonts if needed
5. `apps/cms/src/config/serviceTabsConfig.ts` — rename CMS tab labels/icons per industry
6. `apps/cms/wrangler.toml` — change worker/DB/bucket names
7. `apps/web/.env` — point to new CMS URL
8. Deploy CMS → create super-admin → populate content
9. Deploy frontend → point domain → done

**What changes:** Colors, fonts, enabled modules, content, domain.
**What stays:** All code, collections, components, animations, layouts.

Target setup time for new client: **2-4 hours** (mostly content entry).

---

## 14. Report Format & Phase Reporting

Setiap task/fase yang dikerjakan oleh AI agent **WAJIB** menghasilkan
laporan dalam file terpisah.

### Lokasi & Penamaan

- **Folder:** `docs/reports/`
- **Format nama file:** `phase-[nama-fase].md`
- **Contoh:** `docs/reports/phase-feature-toggle.md`,
  `docs/reports/phase-footer-migration.md`

### Template Report (wajib diikuti)

```markdown
## Phase: [Nama Phase]
**Tanggal**: YYYY-MM-DD
**Status**: Selesai / Dalam Pengerjaan / Blocked
**Dikerjakan oleh**: Claude Code / Manual / Hybrid

### Ringkasan
[1–2 kalimat: apa yang dikerjakan dan hasilnya]

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `path/to/file` | Deskripsi perubahan |

### Impact
- **Database**: none / migration ditambah: [nama]
- **CMS**: none / Global/Collection ditambah: [nama]
- **Frontend**: none / [komponen] sekarang render dari CMS
- **Routes**: none / ditambah: [route]
- **RBAC**: none / access control diupdate di: [file]

### Testing
- [ ] Test case 1 — hasil
- [ ] Test case 2 — hasil

### Rollback
[Langkah untuk undo perubahan ini]

### Dokumentasi yang Diupdate
- [ ] `docs/03-CONTENT-MODEL.md`
- [ ] `docs/PROGRESS.md`
- [ ] [file lain yang relevan]

### Next Steps
[Rekomendasi task selanjutnya]
```

### Matrix: Docs yang WAJIB Diupdate Per Task

| Kondisi | File yang Diupdate |
|---------|-------------------|
| Schema/DB berubah | `docs/02-DATABASE-SCHEMA.md` |
| Komponen hardcoded → CMS | `docs/03-CONTENT-MODEL.md` |
| RBAC / access control berubah | `docs/04-RBAC.md` |
| Infra / deploy berubah | `docs/05-INFRA.md` |
| Runbook / maintenance berubah | `docs/06-MAINTENANCE-RUNBOOK.md` |
| Keputusan arsitektur baru | `docs/07-DECISION-LOG.md` |
| **Pekerjaan security** (audit, hardening, patch CVE, pengetatan RBAC, dsb.) | `docs/08-SECURITY-PATCH.md` — tambah 1 baris di tabel series yang relevan (atau buka series baru). Isi ringkas saja; detail tetap di phase report. |
| Apapun yang selesai | `docs/PROGRESS.md` |
| **Selalu** | `docs/reports/phase-[nama].md` (buat baru) |

### Aturan khusus Security (Phase 4.66+)

Semua perintah user yang menyentuh **security** (audit, hardening, patch, pengetatan access control, CSP, rate-limit, secret rotation, dsb.) wajib:

1. Dijalankan sebagai phase bernomor di `docs/phases/phase-<N>-*.md` seperti task biasa.
2. **DITAMBAHKAN entri garis-besar** di [`docs/08-SECURITY-PATCH.md`](docs/08-SECURITY-PATCH.md) — satu baris per phase, dengan finding ID, severity, link, status.
3. Jangan menduplikasi isi phase report ke `08-SECURITY-PATCH.md`. File itu adalah **index**, bukan laporan.
4. Series security baru (bukan sub-phase dari series yang sudah ada) dibuat sebagai **section baru** di `08-SECURITY-PATCH.md`, mengikuti template yang ada di akhir file tsb.
5. PROGRESS.md tetap diupdate seperti biasa untuk timeline keseluruhan proyek — security bukan pengecualian.

Rasionale: developer yang masuk project butuh satu tempat untuk cek "proteksi apa saja yang sudah terpasang" tanpa harus scroll PROGRESS.md yang bercampur dengan pekerjaan UI/content/CMS.

### Format Ringkas (untuk update inline di chat / commit message)

```
## Task: [name]

### Changed
- `path/to/file` — what changed

### Area
- [web] / [cms] / [shared] / [docs]

### Impact
- DB: none | collection added/changed
- Routes: none | added [route]
- Frontend: none | [page/component] updated
- Deploy needed: web / cms / both / none

### Next
[recommended next task]
```

Format ringkas boleh dipakai untuk task kecil. Untuk fase besar
(migrasi, integrasi CMS, schema change), **wajib** file report lengkap
di `docs/reports/`.
