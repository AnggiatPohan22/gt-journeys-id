# Phase 4.73 — Brand Rename: DnJourneysBali → GtJourneysID

**Status:** ✅ Done
**Date:** 2026-10-01
**Branch:** `refactor/brand-rename-dn-to-gt`
**Scope:** display + internal identifier rename (comprehensive). Historical
docs + migrations sengaja tidak di-rename.

## Alasan

Repo di-reposisi sebagai umbrella brand `GtJourneysID` (general-purpose,
multi-region/vertical) — bukan lagi 1 travel agency Bali. Nama baru di
GitHub: `gt-journeys-id`. Lihat README untuk framing lengkap.

Karena project belum di-deploy ke Cloudflare + belum live, rename internal
identifier (package scope, wrangler resource names) aman dilakukan **sekarang**
tanpa migration data.

## Yang berubah

### Pattern replacement (longest-first)

```
@dn-journeys/     → @gt-journeys/
dn-journeys-bali  → gt-journeys-id
DnJourneysBali    → GtJourneysID
dnjourneysbali    → gtjourneysid
dn-journeys       → gt-journeys
dn_journeys       → gt_journeys
```

Plus 2 fix manual:

- `apps/web/.env.example` — `SITE_URL=https://dnjourneysbali.com` →
  `https://example.com` (domain belum ditentukan)
- `packages/shared/src/template-registry.ts` — `REGISTRY_ID =
  'dnjourneys-headerfooter'` → `'gtjourneys-headerfooter'`

### Scope

**86 file** di-rewrite, **229 file** di-skip:

- Rewritten: package manifest (4), wrangler config (1), source code
  (`apps/**/*.{ts,tsx,astro,css,mjs}`), current state docs
  (`docs/00-08.md`, PROGRESS, AGENTS, CLAUDE, SETUP, guides), seed scripts,
  structured data, chat providers, WA templates, lockfile (auto-regen).
- Skipped by prefix list:
  - `docs/phases/**` — historical phase reports
  - `docs/archive/**` — archived content
  - `docs/reports/**` — historical reports
  - `ai/prompt/**` — AI working context
  - `apps/cms/src/migrations/**` — schema snapshots (schema hash integrity)
  - `node_modules/`, `.git/`, `.wrangler/`

### Key identifier changes

| File | Before | After |
|------|--------|-------|
| `package.json` name | `dn-journeys-bali` | `gt-journeys-id` |
| Workspace scope | `@dn-journeys/*` | `@gt-journeys/*` |
| `wrangler.toml` worker | `dn-journeys-cms` | `gt-journeys-cms` |
| `wrangler.toml` D1 | `dn-journeys-db` | `gt-journeys-db` |
| `wrangler.toml` R2 | `dn-journeys-media` | `gt-journeys-media` |
| Site config `name` | `DnJourneysBali` | `GtJourneysID` |
| Template registry id | `dnjourneys-headerfooter` | `gtjourneys-headerfooter` |

### Validation

- `pnpm install` regenerated `pnpm-lock.yaml` dengan scope baru — Done in 58s.
- `pnpm --filter @gt-journeys/web build` run sampai module resolution OK;
  gagal di static-path fetch (CMS tidak running) — expected, bukan error
  dari rename.
- Verifikasi akhir: `git grep -E 'DnJourneys|dn-journeys|dnjourneys'` di
  luar skip list = **clean** (0 leftover).

## Rollback

```bash
git revert <merge commit>
```

Nama lama kembali semua (termasuk lockfile).

## Follow-up

- Kalau nanti Cloudflare resource mau pakai nama lama (`dn-journeys-*`),
  edit balik `wrangler.toml` — resource belum di-provision jadi aman.
- Local folder `C:\laragon\www\dn-journeys-bali` → `gt-journeys-id`:
  dilakukan terpisah oleh owner setelah commit ini merged. Session Claude
  perlu dibuka ulang dari path baru.
- Phase B expanded (migration data kalau sudah ada D1 live) — N/A sekarang.

## Tidak termasuk scope

- Phase docs (`docs/phases/**`) — sejarah proyek, nama lama = fakta
  historis.
- Migration JSON — schema snapshot historis, hash integrity.
- Archive + reports lama — status "archive".
- AI prompt files — konteks lama, tidak dibaca runtime.
- Domain production — belum ditentukan, placeholder `example.com`.
