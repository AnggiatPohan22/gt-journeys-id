# DB Schema Changes — Runbook

> **Since 2026-09-12 this project uses Payload migrations as the
> single source of truth for the DB schema.** Everything below reflects
> that workflow. The old push-based workflow (with its Drizzle prompts,
> preflight/finalize scripts, and "please answer y/N to data-loss
> warnings") is retired. Historical notes are at the bottom.

## The workflow

### 1. Change your CMS code
Edit a collection, global, block — whatever schema-relevant.

### 2. Generate a migration
From `apps/cms/`:
```powershell
pnpm schema:new -- --name short-kebab-description
```
Payload writes `apps/cms/src/migrations/<timestamp>_<name>.ts` — a
TypeScript file with `up()` (apply) and `down()` (roll back) SQL, plus
a matching `<timestamp>_<name>.json` snapshot that future runs diff
against.

### 3. Review the migration
Open the generated file. Confirm the SQL matches your intent. Common
things to check on SQLite:

- **New table:** the `CREATE TABLE` lists every column with the right
  type, default, and FK.
- **New relationship field:** the migration should
  `ALTER TABLE payload_locked_documents_rels ADD <slug>_id INTEGER
  REFERENCES <slug>(id)` and add a matching index.
- **Enum-like `select` fields:** Payload stores these as plain `text`
  columns; the CHECK constraint is enforced at the application layer,
  not by SQLite. So adding a new option to a `select` field usually
  produces NO SQL diff, which is correct — the value just becomes
  accepted at the API layer.
- **Dropped/renamed fields:** the down() function should recreate them
  if you care about rollback fidelity. Most of the time you don't and
  it's fine to leave whatever Payload generated.

If drizzle-kit generated something obviously wrong (e.g. a duplicated
`CREATE INDEX` because a block is embedded in multiple field paths),
edit the file by hand. Once. Never again — the file is committed and
that fix stays forever.

### 4. Commit the migration file
Both the `.ts` and the `.json` snapshot. They belong to the git history
of the schema.

### 5. Apply
```powershell
pnpm schema:migrate
```
This runs `up()` for every migration not yet in the `payload_migrations`
table. On success:
- `payload_migrations` gains a row `{name, batch, timestamps}`.
- Payload boots at `pnpm --filter cms dev` normally (no push, no prompts).

### 6. Regenerate types
```powershell
pnpm generate:types
```

Done. If the schema change involved a new collection, the frontend can
now query it via `apps/web/src/lib/payload.ts`.

## Other commands

| Command | Purpose |
|---|---|
| `pnpm schema:status` | Show which migrations are executed and which are pending. |
| `pnpm schema:down` | Roll back the last-run migration (uses its `down()` function). |
| `pnpm schema:refresh` | Roll back all, then re-apply. Dev only. |
| `pnpm schema:fresh` | Drop the DB and re-run every migration from scratch. Destructive. |
| `pnpm schema:new -- --name X` | Generate a new migration for the current code-vs-snapshot diff. |
| `pnpm schema:migrate` | Apply all pending migrations. |

## Prod / Cloudflare deploy

- Migrations run on prod boot when `PAYLOAD_MIGRATING=true` is set OR
  when `pnpm schema:migrate` is called by the deploy pipeline before
  the app starts. Choose one.
- The `payload_migrations` table exists on prod exactly as in dev; the
  same numbered files apply in the same order.
- The D1 adapter is a drop-in replacement — same migration files run
  against it. Only the driver in `payload.config.ts` changes.

## Common problems

### "It looks like you've run Payload in dev mode … proceed?"
Payload sees dev-push evidence (a `batch=-1` row in `payload_migrations`)
and warns before running migrations. **Answer `y` when your migrations
are additive** (only CREATE / ADD COLUMN), since additive migrations
against a dev-pushed schema are safe. Never answer `y` blindly when a
migration also drops columns — data loss is real then.

### "SQLITE_ERROR: no such column: X_id"
Some new collection was added to the config but the corresponding
migration wasn't generated / applied. Fix:
```powershell
pnpm schema:new -- --name add-<slug>
pnpm schema:migrate
```

### "table X already exists"
The migration is trying to CREATE a table that's already in the DB
from a pre-migrations dev push. Two fixes:
1. If the existing table is truly disposable: manually
   `DROP TABLE X`, then run `pnpm schema:migrate`.
2. If it has data: hand-edit the migration to use
   `CREATE TABLE IF NOT EXISTS` and confirm the existing structure
   matches — or write a follow-up migration that reconciles column
   differences.

### "index already exists"
Same as above — leftover from a pre-migrations push. Drop it manually
(`DROP INDEX X`) then re-run migrate. In new migration files, drizzle-kit
occasionally emits a duplicated `CREATE INDEX` when a block is embedded
in multiple field paths. Hand-edit the migration to remove the
duplicate.

### "Cannot add NOT NULL column without default"
SQLite doesn't allow adding a non-nullable column without a default to
a table with existing rows. Change your field to include `defaultValue`,
regenerate the migration, or edit it to first ADD the column as
nullable, backfill data, then ALTER to NOT NULL (SQLite requires a
table recreate for that last step).

### Identifier length errors (Postgres only)
Not applicable on SQLite. If we ever swap to Postgres (or D1 in a
future release), block table names in deeply-nested paths can exceed
63 characters. Rename the block or shorten field names. Example fix
in [apps/cms/src/blocks/index.ts:895](../apps/cms/src/blocks/index.ts:895).

## What NOT to do

- **Do not set `PAYLOAD_FORCE_PUSH=true`.** The env var is a legacy
  escape hatch. If you need to change schema, write a migration.
- **Do not add fields directly to the DB with a script.** Every schema
  change belongs in a migration file.
- **Do not `payload_migrations` row-hack** except during the one-time
  bootstrap (2026-09-12). If you need to reconcile drift, generate an
  empty migration and hand-write the SQL, so the fix is visible in
  git.
- **Do not commit `cms.db`.** The migration files are the schema; the
  DB is a build artifact.

---

## Historical: the old push-based workflow

Before 2026-09-12, this project relied on Payload's `push: true` dev
schema push, which turned every collection change into a firefight
(RSC parallel-init race → "index already exists", missing FK columns
in central rels tables, schema drift accumulating without a clean
history). Sixteen (16) one-off scripts under
`apps/cms/src/scripts/archive/pre-migrations-era/` chronicle that era.

The migration bootstrap is documented in
[docs/reports/schema-management-audit.md](reports/schema-management-audit.md)
Section 3c. The audit doc explains the "why".
