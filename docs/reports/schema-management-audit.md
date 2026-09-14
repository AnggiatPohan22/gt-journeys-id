# Schema Management Audit — Why every DB change is painful

**Date:** 2026-09-12
**Trigger:** Phase 4.35 Authors collection push failed 3× with 3 different errors, mirroring Phase 4.33 pain. Every schema change to this repo has been an emergency instead of routine.
**Scope:** How Payload/Drizzle/SQLite schema evolution works in this repo TODAY, what's structurally wrong, and how to fix it once so future collections/fields "just work".

---

## 1. Facts (what actually happens today)

### 1a. The design that was chosen
- [payload.config.ts:108-118](apps/cms/src/payload.config.ts:108) uses `sqliteAdapter` with `push: false` by default. Push only turns on when `PAYLOAD_FORCE_PUSH=true` is set in env.
- The comment there says: *"Dev schema-push disabled: cold-start bisa memicu 2+ init paralel"* — so `push: false` is a **defensive** setting, not the intended workflow.
- The same comment claims *"Prod deploy tetap pakai migrations (PAYLOAD_MIGRATING)"* — but **there is no `apps/cms/src/migrations/` folder**. No migrations exist. The claim is aspirational, not real.
- The result: **the codebase has no working schema evolution strategy** — not for dev, not for prod. Everything schema-related is manual.

### 1b. Every collection change is a firefight
Historical evidence in [PROGRESS.md:75](docs/PROGRESS.md):
> "Hotfixes traced during owner boot (9677f88, 0abfdd9, 890079f, 59f6a55): Payload's non-idempotent CREATE INDEX + Phase-4.25 cold-start race prevents automatic schema push → recovered with phase4.33-preflight.ts + phase4.33-finalize.ts (manual ALTER TABLE ADD COLUMN for payload_locked_documents_rels.newsletter_subscribers_id + 7 footer_settings.newsletter_*)"

Phase 4.35 (this session) has now hit **the same class of failure with the same shape**:
1. First attempt: `PAYLOAD_FORCE_PUSH=true` typed with Bash syntax → PowerShell ignored it → 500 on missing `authors_id` column.
2. Second attempt (correct PowerShell syntax): push started → hit `CREATE INDEX ... already exists` on `water_activities_blocks_contact_order_idx`.
3. Third attempt (with `db-safe-push` script that drops indexes first): push started → hit the SAME index-collision error on a DIFFERENT index (`yachts_blocks_rich_text_order_idx`).
4. Fourth attempt (monkey-patch client.execute to add `IF NOT EXISTS`): setter trap installed successfully but push crashed inside drizzle-kit with `Cannot read properties of undefined (reading 'enums')` — the monkey-patch broke drizzle-kit's schema introspection.

The pattern is **not intermittent bugs**. It's a **structural mismatch** between how Payload dev push works and how this repo is set up to use it.

### 1c. Symptoms accumulated
Beyond this session, the codebase carries visible scar tissue:
- Sixteen (16) one-off scripts in [apps/cms/src/scripts/](apps/cms/src/scripts) named `drop-*`, `phase4.33-*`, `phase4.35-*`, `push-schema-*`, `inspect-*`, `fix-*`, `nuclear-*`. Each script fixes a specific past incident.
- Six DB backups (`cms.db.bak-3.23`, `.bak-4.22-fix`, `.bak-4.23-pre-theme`, `.bak-4.33`, `.bak-diag-*`, `.bak-pre-push`) — one per surgical intervention.
- 90-line [DB-SCHEMA-CHANGES.md](docs/DB-SCHEMA-CHANGES.md) documenting how to answer Drizzle prompts and work around identifier-length errors — good doc, but it exists BECAUSE the workflow is manual and error-prone.
- Comments in-code like *"Legacy field preserved (hidden) — Drizzle tidak minta rename"* ([blocks/index.ts:329-338](apps/cms/src/blocks/index.ts:329)) — code carrying dead fields because dropping them would trigger the push flow this repo can't reliably run.

---

## 2. Root causes (why is it like this)

There are **three** structural problems, in order of severity.

### 2a. Wrong tool for the job — `push: true` is not a schema evolution strategy
Payload's `push: true` dev mode uses **drizzle-kit push** under the hood. This is a **prototyping tool**, not a schema-management tool. Its assumptions:
- Single dev, single terminal, single push at a time.
- Fresh DB or trivial diffs.
- Human sitting at terminal to answer prompts.
- No parallel initialization (which is exactly what Next.js dev with RSC does).

drizzle-kit push emits raw DDL from a schema diff. It is **not idempotent** — if the diff computer produces a duplicate `CREATE INDEX` (e.g. because a block schema is embedded in multiple field paths), it fails the second time. It has **no rollback semantics** — a mid-push crash leaves the DB half-migrated.

Payload's own docs are clear: dev push is for iterating in isolation; **production and any shared/persistent DB should use migrations**.

### 2b. Next.js + Payload combines badly with `push: true`
The Next.js App Router fires **multiple parallel RSC calls at cold start**. Each RSC that touches Payload triggers `getPayload({ config })` → `db.init(...)` → `connect()` → `pushDevSchema(...)`. These push calls **race each other** on the same SQLite file:
- Two `CREATE INDEX foo` statements from two processes hit the DB at overlapping times.
- First succeeds. Second fails with "index already exists". Whichever RSC that was becomes a 500.
- Partial DDL commits leave the DB in a state neither push agrees on.

This is why [payload.config.ts:117](apps/cms/src/payload.config.ts:117) has `push: false` as default — someone hit this and decided to bandage it.

But turning push off entirely means **there is no automated path from "I edited a collection file" to "the DB reflects it"**. The only path is: manually flip the env var, cross fingers, patch by hand when it fails.

### 2c. Schema drift accumulates because there's no forward-only history
Because there's no migration list, the DB's **actual** schema drifts from the **declared** schema over time. Concretely:
- `ferry_tickets.min_participants`, `pickup_service_available`, `pricing_currency` are columns that exist in the DB with data but no longer exist in the collection config. drizzle-kit sees these as "orphan → propose to delete".
- Every push run re-detects this drift and re-prompts. Every accept propagates the delete only if the push doesn't crash first.
- Existing dead columns like the ones in [blocks/index.ts:98-111](apps/cms/src/blocks/index.ts:98) are marked `admin: { hidden: true }` **specifically to avoid triggering rename/create prompts** — code is contorted to hide the schema drift.

The drift itself is not dangerous. The dangerous thing is that **each new push runs against an unpredictable baseline**, so failure modes stack.

---

## 3. What the fix looks like

The fix is not another script. The fix is **using Payload migrations** — which is the actual designed workflow, not a workaround.

### 3a. What migrations give you

| Failure mode today | With migrations |
|---|---|
| Parallel RSC race on push | Migrations run once, out-of-band, from a single Node process. No race is possible. |
| Non-idempotent CREATE INDEX | drizzle-kit's `generate` command produces `CREATE INDEX IF NOT EXISTS` OR a proper drop-then-create sequence. Non-idempotent SQL is fixed in the migration file by hand, once, and never runs twice. |
| Missing FK column in `payload_locked_documents_rels` | The migration captures the FULL diff at generate-time. Nothing is skipped. |
| Data-loss warnings on every boot | Warnings surface at `migrate:create` (during dev), not on every startup. Once the migration file is committed, running it is silent. |
| Partial-crash state pollution | Migrations run inside a transaction. Crash mid-migration → rollback. State stays consistent. |
| Multiple concurrent devs | Migrations are numbered; each dev pulls the branch and runs `pnpm payload migrate` — deterministic ordering. |
| Prod deployment | Same command in prod (`payload migrate` on boot). No fresh drift-detection in prod. |

### 3b. What the workflow becomes
Once migrations are the workflow:

```bash
# 1. Edit collection file(s)
# 2. Generate a migration (creates a numbered .ts file with UP + DOWN SQL)
pnpm payload migrate:create --name add-authors-collection

# 3. Review the generated file. If drizzle-kit emitted a non-idempotent
#    statement (rare but happens), edit it. Commit the file to git.

# 4. Apply the migration
pnpm payload migrate

# 5. Regenerate types
pnpm payload generate:types
```

That's it. No preflight, no finalize, no diagnose, no `PAYLOAD_FORCE_PUSH`, no race, no 500. New collections are one predictable pipeline.

### 3c. What has to happen once, up front

To move from "push everything, hope nothing breaks" to "migrations only", we need a **one-time bootstrap**:

1. **Freeze the current DB as the migration baseline.** Take the existing schema (as it exists in `cms.db` right now — including the drift) as migration `000-initial`. This is an empty-body migration that just records "the DB matches this schema at this checkpoint". drizzle-kit calls this `generate` against the current state.
2. **Clean up the schema drift in a real migration.** Migration `001-drop-ferry-tickets-orphan-columns` explicitly drops `min_participants`, `pickup_service_available`, `pricing_currency`. Reviewable, committed to git, deterministic.
3. **Add Authors + `blog` in Categories.module as migration `002`.** Same generated diff, reviewed, committed.
4. **Add Posts + join tables as migration `003`.** Same.
5. **Turn `push` off permanently** in [payload.config.ts](apps/cms/src/payload.config.ts). Set `PAYLOAD_MIGRATING=true` at dev boot to signal Payload not to attempt push. Adapter has this path.
6. **Retire the one-off scripts** (`db-safe-push`, `phase4.35-*`, `phase4.33-*`, `push-schema-*`). Keep them in git history for archaeology, delete from `scripts/`. Replace with a single `pnpm schema:migrate` command that just wraps `payload migrate`.
7. **Update [DB-SCHEMA-CHANGES.md](docs/DB-SCHEMA-CHANGES.md)** to reflect the migration workflow. The old prompts-and-workarounds doc becomes historical.

The bootstrap takes maybe half a day. After that, this class of pain never returns.

### 3d. Trade-offs (honest)

- **Every dev needs to run `pnpm payload migrate` after pulling a branch that changed collections.** This is a habit shift. It's the same habit any Django/Rails/Laravel team already has.
- **Reviewing generated SQL adds a step to PRs.** But it also catches bugs early — e.g. a drizzle-kit generation quirk becomes visible in the diff, not at production deploy.
- **The one-time bootstrap requires 1–2 hours of focused work.** Not more.
- **If a migration has a bug in prod, rolling back needs care.** Payload has `payload migrate:down`. Feature-flagging schema-dependent code is standard practice.

Compared to the current cost (every collection change = half-day emergency, three retries, hand-written finalize scripts, database backups every time), migrations are a large net win.

---

## 4. What to do RIGHT NOW to unstick Authors

If migration bootstrap is a "next week" project, we still need to get past the current Authors push today. Two paths:

### Option A — Nuclear reset of current attempt, one clean push
1. Restore the earliest safe-push backup (`cms.db.bak-safe-push-1789208257244` — pre any of today's attempts).
2. Delete every existing `_idx` index and every `authors*` table (should be none — none were created cleanly).
3. Stop using `db-safe-push` (the monkey-patch is what triggered the `enums` crash).
4. Directly hand-write the DDL for Authors: `CREATE TABLE authors ...`, `CREATE TABLE authors_social_links ...`, `ALTER TABLE payload_locked_documents_rels ADD COLUMN authors_id ...`, matching indexes. This is ~40 lines of SQL. Run it once. Verify with `pnpm tsx src/scripts/phase4.35-diagnose.ts`.
5. Boot CMS normally with `push: false`. Payload reads the new tables as-is, admin renders.

This is Option A that DOES NOT try to run Payload's push at all. Zero race, zero collision, deterministic. The downside is we hand-write ~40 lines of DDL instead of generating them, and the ferry_tickets drift remains (which is fine — nothing depends on it).

### Option B — Take the bootstrap step now
Same as Section 3c above, but in fast-forward:
1. `pnpm payload migrate:create --name initial` → generates baseline migration reflecting current DB.
2. Review + commit.
3. `pnpm payload migrate:create --name add-blog-baseline` → generates migration for Categories enum + Authors table.
4. Review the generated SQL — this is where you might spot drizzle-kit's non-idempotent CREATE INDEX and add `IF NOT EXISTS` by hand once.
5. `pnpm payload migrate` — runs both migrations against the DB.
6. Boot CMS with `PAYLOAD_MIGRATING=true` env var (tells adapter to skip push).

This is more upfront work than Option A but eliminates the class of pain going forward — including for Posts, which is scheduled next.

**Recommendation: Option B.** Two hours of setup today prevents ten similar half-days over the next few months. Posts is coming, and Posts has `additionalBlocks: blocks` — the highest-risk schema in the whole repo. Doing Posts on the current push-based workflow is asking for the same debugging session again.

---

## 5. What NOT to do (mistakes to avoid repeating)

- **Do not** add more `phase4.NN-preflight.ts` / `phase4.NN-finalize.ts` scripts. Each one is a fix for one specific incident that will not exactly repeat.
- **Do not** monkey-patch drizzle-orm or drizzle-kit at runtime. The `Cannot read properties of undefined (reading 'enums')` error is a live example of how fragile that is.
- **Do not** rely on `PAYLOAD_FORCE_PUSH=true` in normal dev. It bypasses the guard [payload.config.ts:117](apps/cms/src/payload.config.ts:117) put there for a reason.
- **Do not** answer "y" to data-loss prompts without a backup and a git-clean working tree. `cms.db.bak-safe-push-*` files exist for a reason.
- **Do not** leave orphan columns as "legacy hidden fields" forever ([blocks/index.ts:98](apps/cms/src/blocks/index.ts:98)). Drop them via a real migration.

---

## 6. Suggested acceptance criteria for "this is fixed"

- [ ] `apps/cms/src/migrations/` exists with a baseline migration + Blog migration(s) committed.
- [ ] [payload.config.ts](apps/cms/src/payload.config.ts) reads `PAYLOAD_MIGRATING` (or equivalent) and disables push in dev.
- [ ] `pnpm --filter cms dev` boots on a fresh clone WITHOUT ever prompting for schema changes.
- [ ] Adding a new collection is: edit file → `pnpm payload migrate:create --name X` → review → `pnpm payload migrate`. No preflight, no finalize.
- [ ] [DB-SCHEMA-CHANGES.md](docs/DB-SCHEMA-CHANGES.md) rewritten around the migration workflow. Old prompts-and-workarounds text moves to an archive section.
- [ ] `db-safe-push`, `phase4.35-*`, `phase4.33-*`, `push-schema-*` scripts removed from `apps/cms/src/scripts/`.
- [ ] Phase 4.35 (Blog) shipped via migration `add-blog-collections.ts` — not via a hand-run push.

---

## 7. Next-step decision

You choose:

**A. Continue patching (Option A above).** I hand-write the Authors DDL, we get past the current block today, but the next collection (Posts) will hit the same class of problem. Estimated: 30 min for Authors, TBD for Posts.

**B. Bootstrap migrations now (Option B / Section 3c).** ~2 hours today, but every subsequent schema change is routine. Blog Posts, plus any future collection, uses the same predictable flow. Recommended.

If B, next action from me is: propose the exact list of migration files to generate, verify Payload's migration CLI is wired in `package.json`, and produce the baseline migration.

Tell me A or B.
