# GtJourneysID — Master-Mind Monorepo

> **Private repo.** Codebase ini di-posisikan sebagai **GtJourneysID** —
> umbrella brand yang general-purpose, bisa di-deploy per region (Bali,
> Jakarta, dsb.) atau per vertical (ferry-only, spa-only, dsb.). GitHub repo:
> [`gt-journeys-id`](https://github.com/AnggiatPohan22/gt-journeys-id).
> Brand display di frontend + CMS = `GtJourneysID`.
>
> **Master-mind monorepo:** 1 codebase, 9+ service modules yang modular dan
> on/off-able, yang bisa:
>
> - Jalan **penuh** (travel marketplace lengkap untuk 1 agency), atau
> - Jalan **fokus** satu service saja (misal "ferry-ticket-only" buat
>   operator ferry, "spa-only" buat booking spa, dst.) — tanpa fork repo,
>   cukup toggle via admin UI.
>
> Semua service module baru ke depan di-build di sini dulu, baru di-spawn
> jadi project turunan kalau butuh deploy independen. **Reader utama =
> future-me 6 bulan lagi**, jadi README ini sengaja detail.

---

## Table of Contents

1. [Visi: Master-Mind + Spawned Products](#visi-master-mind--spawned-products)
2. [Current State](#current-state)
3. [Arsitektur](#arsitektur)
4. [Service Modules (9 aktif, extensible)](#service-modules-9-aktif-extensible)
5. [Focused Mode via SiteFeatures](#focused-mode-via-sitefeatures)
6. [Monorepo Structure](#monorepo-structure)
7. [Dev Setup](#dev-setup)
8. [Content Model & RBAC Singkat](#content-model--rbac-singkat)
9. [Branch Strategy & Git Flow](#branch-strategy--git-flow)
10. [Phase/Docs Convention](#phasedocs-convention)
11. [Security Posture](#security-posture)
12. [Deploy Flow](#deploy-flow)
13. [Roadmap](#roadmap)
14. [Troubleshooting](#troubleshooting)

---

## Visi: Master-Mind + Spawned Products

Satu codebase, dua mode operasi:

**Mode A — Full travel platform** (default)
Semua module aktif. 1 deploy = 1 agency website lengkap (tours, villas, ferry,
spa, dsb.). Ini mode utama GtJourneysID flagship (Bali) hari ini.

**Mode B — Focused single-service** (via SiteFeatures)
Admin toggle hanya 1 module → sisa service module tidak di-render di
frontend, tidak muncul di admin sidebar, tidak muncul di menu. Cocok untuk:

- Ferry operator yang cuma butuh ticketing + CMS blog
- Spa yang cuma butuh booking + landing
- Villa host yang cuma butuh showcase + inquiry

**Mode C — Spawned fork** (future)
Kalau sebuah service tumbuh sendiri (misal "DN Ferry" jadi produk standalone),
fork repo → delete module yang tidak dipakai → ganti branding + domain. Repo
asli tetap jadi "master mind" yang mewarisi feature improvement ke semua
spawned project. Belum ada tooling automation untuk ini — manual sampai
butuh.

---

## Current State

| Area | Status |
|------|--------|
| Monorepo scaffold | ✅ Stabil (Phase 1–2) |
| CMS backbone (Payload + D1 + R2) | ✅ Running |
| 9 service modules collection + routing | ✅ All live |
| Frontend builder (CMS-driven blocks, 22+ block types) | ✅ Phase 4.55 |
| Admin UI redesign (sidebar, dashboard, editor UX) | ✅ Phase 4.1–4.9 |
| Theming system (header/footer/colors, light+dark) | ✅ Phase 4.41–4.45 |
| Ferry ticket end-to-end (card + search + checkout) | ✅ Phase 4.61–4.65 |
| Checkout security hardening | ✅ Phase 4.66 (13 findings closed) |
| Dependency upgrade (73 pnpm audit vuln) | ⏳ Deferred → Phase 4.67 |
| KV-backed rate limit (vs in-memory) | ⏳ Deferred → Phase 4.68 |
| Turnstile integration | ⏳ Phase 4.69 |
| Booking retention + resend link | ⏳ Phase 4.70–4.71 |
| Production deploy (Cloudflare Pages + Workers) | 🔨 Phase 5 (pending) |

Timeline detail: [`docs/PROGRESS.md`](docs/PROGRESS.md).

---

## Arsitektur

```
┌───────────────────────────────────────────────────────────┐
│                   Cloudflare (Pages + Workers)             │
│                                                            │
│   ┌───────────────────┐          ┌──────────────────────┐  │
│   │  apps/web          │          │  apps/cms             │  │
│   │  Astro 5 SSG+SSR   │  ◀──────▶│  Payload CMS 3        │  │
│   │  Tailwind 4 / GSAP │  REST    │  Lexical editor       │  │
│   │  Alpine.js         │  API     │  on Cloudflare Workers│  │
│   │  → Pages           │          │  → Workers            │  │
│   └───────────────────┘          └──────────────────────┘  │
│                                           │                 │
│                                           ▼                 │
│                                   ┌──────────────────┐      │
│                                   │  D1 (SQLite)      │      │
│                                   │  R2 (media)       │      │
│                                   └──────────────────┘      │
└───────────────────────────────────────────────────────────┘
```

**Prinsip arsitektur:**

- **CMS = single source of truth.** Semua konten + sebagian besar config
  (theming, module toggle, SEO, dsb.) tinggal di Payload. Frontend consume
  via REST API saat build/SSR.
- **CMS-driven blocks, bukan hardcoded pages.** Admin bikin halaman via
  block builder di CMS (hero, gallery, service listing, dsb.). Frontend
  render dari block tree, bukan dari file `.astro` per halaman.
- **Service module pattern.** Setiap service (tours, ferry, spa, dsb.) =
  1 Payload collection + 1 service type entry di taxonomy + 1 listing page
  + 1 detail route. Nambah service baru = ikut pola yang sudah ada.
- **Zero-fork multi-tenant via SiteFeatures.** On/off module via admin UI
  tanpa deploy baru (lihat section Focused Mode).
- **Edge-first.** Semua di Cloudflare → low latency global, cost murah.
  Astro static-first (CDN cache agresif), CMS Workers untuk admin + API.

Detail arsitektur: [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md),
decision log: [`docs/07-DECISION-LOG.md`](docs/07-DECISION-LOG.md).

---

## Service Modules (9 aktif, extensible)

| # | Module | Collection | Status |
|---|--------|-----------|--------|
| 1 | Tours & Activities | `tours` | ✅ |
| 2 | Villas & Hotels | `accommodations` | ✅ |
| 3 | Water Activities | `water-activities` | ✅ |
| 4 | Private Yacht | `yachts` | ✅ |
| 5 | Restaurants | `restaurants` | ✅ |
| 6 | Weddings & Events | `venues` | ✅ |
| 7 | Rental Service | `rentals` | ✅ |
| 8 | Spa & Wellness | `spa` | ✅ |
| 9 | Ferry Tickets | `ferry-tickets` | ✅ (ter-dalam, checkout + bookings) |

**Taxonomy pendukung** (bukan service, tapi dipakai lintas service):
`destinations`, `destination-types`, `service-types`, `locations`, `categories`,
`tags`, `authors`, `testimonials`.

**Transactional** (hanya aktif kalau checkout flow dinyalakan):
`bookings`, `newsletter-subscribers`, `chat-*`.

**Content vertical** (opt-in via SiteFeatures):
`posts`, `blog-categories` → aktifkan Blog vertical.

Pola menambah service baru: [`docs/guides/adding-new-service.md`](docs/guides/adding-new-service.md).

---

## Focused Mode via SiteFeatures

Admin bisa matikan module yang tidak dipakai per-instance tanpa deploy baru.

**Di CMS admin:**
Globals → **Site Features** → tab per module. Setiap module punya toggle
master + sub-feature (misal Ferry Tickets bisa dimatikan tapi Ferry Blog
tetap jalan, dsb.).

**Efek runtime saat module di-off:**

- Admin sidebar — collection module itu di-hide
- Media folder milik module itu — gambar auto-pindah ke "Uncategorized"
- Menu CMS — item link yang reference ke module itu di-filter
- Frontend routing — halaman listing + detail module itu return 404
- Block builder — block yang query module itu render empty (atau fallback)
- SEO — sitemap tidak include halaman module yang dimatikan

**Implementasi:**

- Config source: `apps/cms/src/globals/SiteFeatures.ts`
- Enforcement middleware (admin): `apps/cms/src/hooks/` (hook per
  collection + sidebar filter)
- Frontend reader: `apps/web/src/lib/site-features.ts` (SSR-time check,
  memoized per build)

Detail history: Phase 4.32, 4.37, 4.49 di
[`docs/phases/phase-4-polish-launch/admin-ui/site-settings/`](docs/phases/phase-4-polish-launch/admin-ui/site-settings/).

---

## Monorepo Structure

```
gt-journeys-id/
├── apps/
│   ├── web/                 Astro frontend (Cloudflare Pages)
│   │   ├── src/
│   │   │   ├── pages/       File-based routing
│   │   │   ├── components/  Astro + island components
│   │   │   ├── layouts/     PageLayout, section wrappers
│   │   │   ├── lib/         CMS client, checkout channels, env helpers
│   │   │   └── styles/      Tailwind entry + theme CSS
│   │   └── public/          Static assets (termasuk _headers security)
│   │
│   └── cms/                 Payload CMS (Cloudflare Workers)
│       ├── src/
│       │   ├── collections/ 27 collections (service + taxonomy + transactional)
│       │   ├── globals/     10 globals (SiteSettings, SiteFeatures, dsb.)
│       │   ├── blocks/      22+ CMS block types (hero, gallery, dsb.)
│       │   ├── fields/      Reusable field groups
│       │   ├── access/      RBAC rules (super-admin/admin/editor/author)
│       │   ├── hooks/       beforeChange / afterRead / dsb.
│       │   ├── admin/       Custom admin UI components (React)
│       │   └── migrations/  Payload-generated migrations
│       └── wrangler.toml    Cloudflare Workers config
│
├── packages/
│   └── shared/              Types + utils dipakai web ↔ cms
│
├── docs/                    Project docs (lihat section Phase/Docs)
├── ai/                      AI agent working files (prompt, reference)
└── CLAUDE.md, AGENTS.md     Rules untuk Claude Code & agent lain
```

---

## Dev Setup

### Prasyarat

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **Cloudflare account** (gratis) — hanya butuh untuk deploy. Dev lokal
  pakai SQLite file.

### First-time

```bash
# 1. Install
pnpm install

# 2. Env files
cp apps/web/.env.example apps/web/.env
cp apps/cms/.env.example apps/cms/.env

# 3. Generate PAYLOAD_SECRET (random 32-byte hex)
# Isi ke apps/cms/.env → PAYLOAD_SECRET=<hasilnya>
openssl rand -hex 32          # linux/mac
# atau di PowerShell:
# [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N') | % { $_.Substring(0,64) }
```

Env minimal yang wajib (dev):

```ini
# apps/web/.env
CMS_URL=http://localhost:3030
PUBLIC_SITE_URL=http://localhost:4321
BOOKING_FORM_SECRET=dev-only-random-32char-string

# apps/cms/.env
PAYLOAD_SECRET=<hasil openssl rand -hex 32>
DATABASE_URI=file:./cms.db
```

### Jalan

Dua terminal:

```bash
# Terminal 1 — CMS
pnpm dev:cms          # → http://localhost:3030/admin

# Terminal 2 — Frontend
pnpm dev:web          # → http://localhost:4321
```

Pertama kali buka `/admin` → Payload minta bikin super-admin user.

### Setelah collection di-ubah

```bash
pnpm generate:types          # regen packages/shared/payload-types.ts
pnpm schema:new <name>       # bikin migration file (JANGAN pakai push)
pnpm schema:migrate          # apply migration ke DB
```

**PENTING:** schema change via **migrations only**. Jangan pernah
`PAYLOAD_FORCE_PUSH=1` di env — risiko data loss. Alur ini wajib
([`docs/02-DATABASE-SCHEMA.md`](docs/02-DATABASE-SCHEMA.md)).

---

## Content Model & RBAC Singkat

**Role hierarchy** (lihat [`docs/04-RBAC.md`](docs/04-RBAC.md)):

- **super-admin** — full access, bisa ubah SiteSettings + SiteFeatures,
  satu-satunya role yang boleh touch `passportNumber` (field-level access)
- **admin** — CRUD semua konten + user management (kecuali super-admin
  stuff), bisa read passport (ticketing) tapi tidak update
- **editor** — CRUD konten (pages, posts, service entries), tidak boleh
  user/settings
- **author** — hanya CRUD content yang dia buat sendiri (ownership-based)

**Content model** (lihat [`docs/03-CONTENT-MODEL.md`](docs/03-CONTENT-MODEL.md)):

- Pages = CMS-driven block tree (bukan `.astro` file)
- Service entries = collection row + relation ke ServiceTypes
- Blocks = reusable, 22+ type, per-block padding + color override
- Media = R2-backed, folder-based (Payload native folders + custom routing hook)

---

## Branch Strategy & Git Flow

```
main                production truth, deploy ke Cloudflare Pages prod
  ▲ PR (audit via preview deploy + CI)
develop             staging/integration, preview deploy
  ▲ merge
feature/*           kerja harian (prefix: feature/, fix/, docs/, refactor/,
hotfix/*            phase-*/, dll)
```

**Rules:**

- Jangan push langsung ke `main`. Semua masuk via PR dari `develop`.
- `develop` wajib build + preview deploy OK sebelum PR ke `main`.
- `hotfix/*` boleh langsung ke `main` untuk emergency prod issue (lalu
  back-merge ke `develop`).
- Branch `feature/*` di-rebase atau `--no-ff` merge ke `develop`. Preferensi:
  **merge commit** untuk feature (biar graph kebaca per-feature), **squash**
  untuk PR `develop → main` (biar `main` history flat per release).
- Branch yang sudah di-merge otomatis di-delete (GitHub setting).

**Branch protection:**
Lihat guidelines manual di history conversation (atau nanti saya extract
ke `docs/09-BRANCH-PROTECTION.md` kalau sudah mantap).

**Rollback point:** tag `pre-develop-flow-2026-10-01` = snapshot `main`
sebelum konvensi ini di-apply.

---

## Phase/Docs Convention

Setiap kerjaan non-trivial (code change / schema change / deploy change) =
1 phase report di `docs/phases/<phase-folder>/`. Nomor phase monotonic
naik; sub-phase pakai dot notation (misal 4.66.5 = sub-phase ke-5 dari
Phase 4.66).

Struktur folder: lihat
[`docs/phases/phase-4-polish-launch/README.md`](docs/phases/phase-4-polish-launch/README.md).

**Dashboard tingkat atas:** [`docs/PROGRESS.md`](docs/PROGRESS.md).

**Docs matrix:**

| File | Isi |
|---|---|
| [`00-PROJECT-OVERVIEW.md`](docs/00-PROJECT-OVERVIEW.md) | Overview |
| [`01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) | Arsitektur monorepo + Cloudflare |
| [`02-DATABASE-SCHEMA.md`](docs/02-DATABASE-SCHEMA.md) | ERD + per-collection schema |
| [`03-CONTENT-MODEL.md`](docs/03-CONTENT-MODEL.md) | CMS content model + block system |
| [`04-RBAC.md`](docs/04-RBAC.md) | Access control matrix |
| [`05-INFRA.md`](docs/05-INFRA.md) | Deploy + env + secrets |
| [`06-MAINTENANCE-RUNBOOK.md`](docs/06-MAINTENANCE-RUNBOOK.md) | Operasional day-to-day |
| [`07-DECISION-LOG.md`](docs/07-DECISION-LOG.md) | ADR arsitektur |
| [`08-SECURITY-PATCH.md`](docs/08-SECURITY-PATCH.md) | Master security log |
| [`PROGRESS.md`](docs/PROGRESS.md) | Timeline keseluruhan |
| [`phases/*`](docs/phases/) | Detail per phase (dikelompokkan per topik) |

**Agent rules:** [`AGENTS.md`](AGENTS.md) (master) + [`CLAUDE.md`](CLAUDE.md) (pointer untuk Claude Code).

---

## Security Posture

Status terkini:

- ✅ Checkout flow hardened (Phase 4.66: 13 findings closed — payload secret,
  CSRF, security headers, server-side price recompute, booking access token,
  passport field access, fail-fast env, rate-limit, WA message trim)
- ⚠️ Rate-limit masih in-memory per isolate (interim, upgrade ke KV di Phase 4.68)
- ⚠️ 73 dependency vulnerabilities (3 Critical, 26 High) — upgrade pending Phase 4.67
- ⚠️ Belum ada Turnstile — Phase 4.69

Master log + per-phase breakdown + status:
[`docs/08-SECURITY-PATCH.md`](docs/08-SECURITY-PATCH.md).

**Secrets handling:**

- `PAYLOAD_SECRET` → `wrangler secret put PAYLOAD_SECRET` (TIDAK di `wrangler.toml`)
- `PAYLOAD_API_KEY`, `BOOKING_FORM_SECRET` → fail-fast di prod kalau kosong
- Local dev `.env` di-gitignore. Jangan commit.

---

## Deploy Flow

**Production (`main`):**

```bash
# CMS → Cloudflare Workers
pnpm deploy:cms

# Frontend → Cloudflare Pages
pnpm deploy:web
# atau: auto-deploy via Cloudflare Pages GitHub integration (preferred)
```

**Preview (`develop` + feature branches):**
Auto-deploy via Cloudflare Pages GitHub integration — tiap push ke
non-prod branch generate preview URL.

**Pastikan production branch = `main`** di Cloudflare Pages project
settings (bukan default-ke-current-branch), supaya push ke `develop`
TIDAK update prod.

Setup detail: [`docs/05-INFRA.md`](docs/05-INFRA.md).

---

## Roadmap

**Short-term (Phase 4.67–4.71):**

- 4.67 Dependency upgrade (clear 73 audit findings)
- 4.68 KV-backed rate-limit (replace in-memory)
- 4.69 Turnstile integration (bot protection di checkout + newsletter)
- 4.70 Booking retention policy (auto-expire after N days)
- 4.71 Booking resend-link endpoint (customer lost confirmation link)

**Phase 5 — Production deploy.**

**Mid-term:**

- Payment gateway integration (Xendit/Midtrans) — slot sudah di-prepare via
  `CheckoutChannel` strategy pattern di `apps/web/src/lib/checkout/channels/`
- 2-leg round-trip booking (Phase 4.65 scope)
- Multi-currency pricing
- Multi-language (i18n)

**Long-term (master-mind spawning):**

- Tooling untuk fork repo + strip-down module (biar bisa spawn
  "ferry-only" / "spa-only" product dari repo ini otomatis)
- Shared theme package yang bisa di-override per spawn
- Shared service collection schema (biar schema change di master
  propagate ke spawned project via rebase)

---

## Troubleshooting

| Gejala | Penyebab umum | Fix |
|--------|---------------|-----|
| `wrangler dev` error binding D1 | `database_id` belum diisi di `wrangler.toml` | Jalankan `wrangler d1 create` lalu paste `database_id`-nya |
| Frontend tidak dapat data dari CMS | `CMS_URL` di `apps/web/.env` salah, atau CMS belum running | Cek CMS di port 3030 (dev) atau 8787 (wrangler dev) |
| `pnpm: command not found` | Belum install pnpm | `npm install -g pnpm` |
| Collection baru tidak muncul di admin | Belum register di `payload.config.ts` | Tambahkan import + spread ke `collections: [...]` |
| Migration error "field X not nullable" | Collection schema conflict dengan data existing | Bikin migration manual yang handle backfill, jangan `PAYLOAD_FORCE_PUSH` |
| Admin sidebar hilang 1 module | Module di-off di SiteFeatures | Globals → Site Features → aktifkan toggle module itu |
| Payload cold-start `error 500` di boot | Known issue, sudah di-mitigasi di Phase 4.25 | Reload. Kalau persist, cek `apps/cms/src/payload.config.ts` warm-up singleton |

---

## Lisensi

Private, proprietary. Tidak untuk re-distribution.

---

_Last meaningful rewrite: 2026-10-01 (Phase 4.72)._
