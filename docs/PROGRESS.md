# Project Progress — DnJourneysBali

> Dashboard tingkat tinggi. Detail tiap fase ada di [`docs/phases/`](phases/).
> Konten detail lama (1067 baris) diarsipkan utuh di
> [`docs/archive/progress-archive-2026-08-23.md`](archive/progress-archive-2026-08-23.md).
>
> **Last updated:** 2026-08-31

## Project Overview

Website multi-layanan pariwisata Bali (**DnJourneysBali**) — 7 modul layanan (Tours,
Villa/Hotel, Water Activities, Yacht, Restaurant, Wedding & Event, Rental) dengan
booking via WhatsApp. Stack: **Astro** (frontend SSG) + **Payload CMS** (backend, RBAC
multi-user) + **Cloudflare** (Pages + Workers, target $5/bln). Tujuan: situs
CMS-driven yang fully manageable client, plus dipaketkan sebagai template reusable.

```
Overall progress:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░  ~97% code · pra-deploy
Current phase:     Phase 3.24 (header/footer template system) CODE selesai → butuh CMS schema push + seed + verifikasi UI
```

## Phase Status Dashboard

| Phase | Nama | Status | Detail |
|-------|------|--------|--------|
| 0–1 | Planning & Foundation | ✅ Complete | [phase-1-foundation.md](phases/phase-1-foundation.md) |
| 2 | Service Modules (7 modul) | ✅ Complete | [phase-2-service-modules.md](phases/phase-2-service-modules.md) |
| 3 (–3.13) | CMS-Driven Features & Content | ✅ Code · 🔨 manual test | [phase-3-cms-driven.md](phases/phase-3-cms-driven.md) |
| 3.14–3.19 | CMS Enhancement Sprint | ✅ Complete (build 76 pages OK) | [phase-3.14-cms-enhancement-sprint.md](phases/phase-3.14-cms-enhancement-sprint.md) |
| 3.20 | Service Listing Fixes (Consolidation + SEO) | ✅ Code + data · build 46 pages OK · belum merge | [phase-3.20-service-listing-fixes.md](phases/phase-3.20-service-listing-fixes.md) |
| 3.21 | CMS-Editable Section Listing Header | ✅ Code · dev render OK · belum merge | [phase-3.21-cms-section-listing-header.md](phases/phase-3.21-cms-section-listing-header.md) |
| 3.22 | Hierarchical Destinations (Core + Child Filter) | 🔨 Code · ⏳ butuh CMS schema push + seed hierarki | [phase-3.22-hierarchical-destinations.md](phases/phase-3.22-hierarchical-destinations.md) |
| 3.23 | Dynamic Destination Types System | ✅ Code + schema + seed selesai & terverifikasi · merged ke main | [phase-3.23-dynamic-destination-types.md](phases/phase-3.23-dynamic-destination-types.md) |
| 3.24 | Header & Footer Template System + Import/Export | 🔨 Code selesai · ⏳ butuh CMS schema push + seed + verifikasi UI | [phase-3.24-header-footer-template-system.md](phases/phase-3.24-header-footer-template-system.md) |
| 4 | Polish & Launch | 🔨 In Progress (SEO technical sebagian ✅) | [phase-4-polish-launch.md](phases/phase-4-polish-launch.md) |
| 4.1 | Admin Dashboard Redesign + Login/Sidebar Branding (UI only) | ✅ Code selesai · login terverifikasi (DOM) · ⏳ screenshot dashboard | [phase-4.1-admin-dashboard-redesign.md](phases/phase-4.1-admin-dashboard-redesign.md) |
| 4.2 | Admin Dashboard Polish — Sidebar, Layout, Color Theming (UI only) | ✅ Code selesai · login terverifikasi (DOM) · ⏳ screenshot dashboard/sidebar | [phase-4.2-admin-dashboard-polish.md](phases/phase-4.2-admin-dashboard-polish.md) |
| 4.3 | Role-Based Dashboard (super-admin/admin/editor layouts) (UI only) | ✅ Code selesai · compile OK · ⏳ screenshot per-role (login) | [phase-4.3-role-based-dashboard.md](phases/phase-4.3-role-based-dashboard.md) |
| 4.4 | Sidebar (design4: black glossy, icons, accordion, giattech) & Light/Dark (UI only) | ✅ Code selesai · theming terverifikasi (computed) · ⏳ screenshot sidebar | [phase-4.4-sidebar-and-theming.md](phases/phase-4.4-sidebar-and-theming.md) |
| 4.5 | Sidebar Redesign — Accordion, Fixed 3-zone (header/menu-scroll/footer), Transitions (UI only) | ✅ **Sidebar UI/UX OK** (terverifikasi user) | [phase-4.5-sidebar-redesign.md](phases/phase-4.5-sidebar-redesign.md) |
| 4.6 | Dashboard Refinement — compact stat row (super 6/admin 5/editor 5), icon-only Quick Access per role (UI only) | ✅ Code selesai · compile OK · ⏳ screenshot per-role | [phase-4.6-dashboard-refinement.md](phases/phase-4.6-dashboard-refinement.md) |
| 4.7 | Breadcrumb logo dari SiteSettings (graphics.Icon) + sembunyikan panah ▾ Edit/Reset (UI only) | ✅ Code selesai · compile OK · ⏳ screenshot | [phase-4.7-dashboard-logo-and-cleanup.md](phases/phase-4.7-dashboard-logo-and-cleanup.md) |
| 4.8 | Page Editor UX — Preview, Sidebar Tabs, Block Polish, Sticky Bar (collapsible sidebar dibatalkan) | ✅ Done (commit `cc384d7`) · tsc clean · ⏳ visual verify (login) | [phase-4.8-page-editor-ux.md](phases/phase-4.8-page-editor-ux.md) |
| 4.9 | Editor UX Replication — sidebar tabs + preview button di Group A (8 services) + Group B (Destinations, ServiceTypes) | ✅ Done (commit `37dfde9`) · tsc clean · ⏳ visual verify per collection | [phase-4.9-editor-ux-replication.md](phases/phase-4.9-editor-ux-replication.md) |
| 4.10 | Main-Content Tabs Visual Polish — sticky pill tabs di 8 service collections | ✅ Done (commit `c1cc86d`) · tsc clean · ⏳ visual verify | (in-doc) |
| 4.11 | Media Library List Redesign — View selector (Detail/S/M/L), CSS grid transform, hide Columns | ✅ Done (commit `edc2846`) · tsc clean · ⏳ visual verify (login) | [phase-4.11-media-library-redesign.md](phases/phase-4.11-media-library-redesign.md) |
| 4.12 | List View Redesign + Breadcrumb Back Nav — Pages + 8 services + 5 taxonomy (14 collections) | ✅ Done (commits `e5ca1f0`, `d2f93ca`, `6f28c7b`) · tsc clean · ⏳ visual verify | [phase-4.12-list-view-redesign.md](phases/phase-4.12-list-view-redesign.md) |
| 4.13 | Menu Editor Redesign — main-vs-sub cards, per-type badges, scoped nested-array polish | ✅ Done (commit `f176492`) · tsc clean · ⏳ visual verify | [phase-4.13-menu-editor-redesign.md](phases/phase-4.13-menu-editor-redesign.md) |
| 4.14 | Users Collection Redesign — Tracks A+B: avatar/phone/address/enabled/lastLoginAt + password generator + force unlock (email forgot-password + WA reset deferred) | ✅ Code selesai (commit `50a300c` + fix `f37d8ee` + types `6595200`) · tsc clean · ⏳ DB schema push + login verify | [phase-4.14-users-redesign.md](phases/phase-4.14-users-redesign.md) |
| 4.15 | Service Grid Card Styles — add `cardVariant` (compact/detailed) mirroring Service Listing | ✅ Code selesai (commit `156e369`) · tsc clean · ⏳ visual verify | [phase-4.15-service-grid-card-styles.md](phases/phase-4.15-service-grid-card-styles.md) |
| 4.16 | Curated Alternatives → Service Grid Template — retire 8 hardcoded recommended sections, add `curated` template + `auto` selection mode | ✅ Done (Pass 1 `4ee3998` + Pass 2) · Astro build OK · ⏳ visual verify | [phase-4.16-curated-alternatives-to-template.md](phases/phase-4.16-curated-alternatives-to-template.md) |
| 4.17 | Related Services — Hybrid Cascade System (Global Default + Per Service Type + Per Service Override) | ✅ Done · Astro build 50 pages OK · ⏳ CMS schema push + visual verify | [phase-4.17-related-services-hybrid.md](phases/phase-4.17-related-services-hybrid.md) |
| 4.18 | Service Content Tabs V2 — 6-Tab Accordion Structure (all 8 services) + Centralized Config | ✅ Done (Pass 1–3) · Astro build 50 pages OK · ⏳ CMS visual verify | [phase-4.18-service-content-tabs-v2.md](phases/phase-4.18-service-content-tabs-v2.md) |
| 4.19 | Icon System — Iconify Migration (select enum → searchable picker, 200k+ icons) | ✅ Done · Astro build 50 pages OK · ⏳ CMS schema push + visual verify | [phase-4.19-icon-system-migration.md](phases/phase-4.19-icon-system-migration.md) |
| 4.20 | Block Spacing Audit — vertical spacing inventory across 16 blocks | ✅ Audit selesai (read-only, no code changes) | [phase-4.20-block-spacing-audit.md](phases/phase-4.20-block-spacing-audit.md) |
| 4.21 | Block Spacing Refactor — centralized gap system + outlier fixes | ✅ Done · Astro build 50 pages OK · ⏳ CMS schema push + visual verify | [phase-4.21-block-spacing-refactor.md](phases/phase-4.21-block-spacing-refactor.md) |
| 4.21b | Block Spacing Bugfix — last-block footer gap restored | ✅ Done · Astro build 50 pages OK · ⏳ visual verify | [phase-4.21-block-spacing-bugfix.md](phases/phase-4.21-block-spacing-bugfix.md) |
| 4.22 | Spacing System v2 — sibling-margin + beforeFooter + per-block spacingOverride | ✅ Done (Phase 1+2 code) · ⏳ CMS schema push + visual verify | [phase-4.22-spacing-v2.md](phases/phase-4.22-spacing-v2.md) |
| 4.23 | Stat Banner Cleanup + 2-Theme System — audit + Part A surgical fix (Editorial Grid baseline) + Part B per-instance theme selector (Theme 1 / Theme 2 Feature Cards) + post-merge schema fix | ✅ **Complete** · Part A + B merged ke `feature/phase4-polish-launch` · schema pushed manual (9 tables) · CMS API 11/11 green · Theme 1 & Theme 2 verified rendering di web dev | [phase-4.23-stat-banner-audit.md](phases/phase-4.23-stat-banner-audit.md) |
| 5 | Production Deploy (+ 6 Packaging) | ⬜ Not Started | [phase-5-deploy.md](phases/phase-5-deploy.md) |

**Legenda:** ✅ Complete · 🔨 In Progress · 📋 Planned · ⬜ Not Started · ⏸️ Paused

**Phase 3.23 (Code selesai 2026-08-24):** Field `type` Destinations (select hardcoded) →
collection baru `destination-types` CRUD-able (name/slug/`isActive` checkbox/`sortOrder`
auto-increment+swap), toggle super-admin `destinationTypesEnabled` (soft-gate `update`
admin), access berlapis. Goal 5 frontend **dibatalkan** → type = taksonomi internal,
orthogonal dgn hierarki 3.22. **Butuh aktivasi**: CMS schema push (jawab `+ create column`)
+ `pnpm tsx src/scripts/seed-destination-types.ts` — runbook di
[phase-3.23](phases/phase-3.23-dynamic-destination-types.md) §0. DB backup: `cms.db.bak-3.23`.

**Phase 3.24 (Planned 2026-08-25):** Header & Footer dari satu layout hardcoded →
**sistem template**: registry di code (`packages/shared`), Super Admin pilih template +
isi slot content dinamis (Payload `select` + `admin.condition`, dispatch build-time Astro
— pola block `serviceListing`), import/export config JSON antar-project, konvensi porting
cross-framework. Audit lengkap (feasibility, risk, arsitektur, JSON schema, migrasi,
rollback, acceptance, ~4.75–6.25 hari) di
[phase-3.24](phases/phase-3.24-header-footer-template-system.md). Branch:
`feature/header-footer-service-fixes`. **Butuh keputusan owner** (cakupan template,
UI import/export, thumbnail, slot storage) sebelum eksekusi.

## Current Focus

[Phase 3.22](phases/phase-3.22-hierarchical-destinations.md) **code selesai** di branch
`feature/service-listing-fixes` — destinasi jadi berjenjang (parent→child): filter listing
hanya menampilkan 4 "core" (Super Admin toggle `showInFilter`), child disembunyikan tapi
ikut cocok saat core dipilih/dicari; digate toggle **Hierarchical Destinations** di
Pengaturan Fitur (default OFF → degradasi aman ke perilaku flat lama). Berlaku di kedua
layout listing. **Butuh aktivasi**: restart CMS (schema push, jawab `+ create column`) +
seed 4 core & parent child + nyalakan toggle — lihat phase doc.

Sebelumnya [Phase 3.21](phases/phase-3.21-cms-section-listing-header.md) menjadikan judul +
subtitle listing editable dari Site Settings → Section Pages. Sisa: **merge ke `main`**,
lalu Phase 4 Polish & Launch.

## Quick Links

- [All Reports](reports/README.md) — audit & phase reports
- [Guides](guides/) — how-to developer, mis. [Menambahkan Service Baru](guides/adding-new-service.md)
- [Post-Deploy TODO](post-deploy-todo.md) — item yang hanya bisa diverifikasi di produksi
- [Dev Reference](dev-reference.md) — foundational decision log, known issues/tech-debt, quick commands
- [Archived full progress](archive/progress-archive-2026-08-23.md) — snapshot PROGRESS.md lama (utuh)
- [AGENTS.md](../AGENTS.md) — AI agent rules & reporting template (Section 14)
- Reference docs: [Overview](00-PROJECT-OVERVIEW.md) · [Architecture](01-ARCHITECTURE.md) · [DB Schema](02-DATABASE-SCHEMA.md) · [Content Model](03-CONTENT-MODEL.md) · [RBAC](04-RBAC.md) · [Infra](05-INFRA.md) · [Runbook](06-MAINTENANCE-RUNBOOK.md) · [Decision Log](07-DECISION-LOG.md)

## Blockers / Decisions Needed

- **Merge branch** — `feature/service-listing-fixes` sudah code+data complete & build
  bersih; belum di-merge ke `main`. Phase 4 sebaiknya mulai dari main yang bersih.
- **Manual test butuh login CMS** — beberapa verifikasi role/sidebar/dashboard tidak
  bisa diotomasi (password entry). Perlu owner.
- **Konten dummy** — sebagian data masih demo/draft (SiteSettings kontak sudah terisi);
  real content final di-input saat Phase 5.

---

## Known Issues & Commands

Ringkasan tech-debt dan perintah cepat dipindah ke [Dev Reference](dev-reference.md).
Highlight yang perlu diingat:

- Astro dev cache `getStaticPaths()` → touch `[slug].astro` setelah publish entry baru (produksi fresh).
- Tailwind JIT cache stale saat tambah file di folder baru → touch `tailwind.config.mjs` (produksi tidak terpengaruh).
- Seed CMS harus dijalankan saat `pnpm dev` CMS **stop** (SQLite exclusive lock).
