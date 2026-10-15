# Archived — Pre-Migrations-Era Schema Scripts

**Do not run these.** They were emergency scripts written to work
around the fact that this repo had no schema evolution strategy.

Since **2026-09-12** the repo uses Payload's built-in migrations
system (`apps/cms/src/migrations/`). All schema changes now go
through:

```
pnpm --filter cms schema:new -- --name what-changed
# review the generated migration file
pnpm --filter cms schema:migrate
```

See [docs/DB-SCHEMA-CHANGES.md](../../../../../docs/DB-SCHEMA-CHANGES.md)
and [docs/reports/schema-management-audit.md](../../../../../docs/reports/schema-management-audit.md).

These files are preserved for git archaeology only.
