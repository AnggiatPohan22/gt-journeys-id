// Add DB columns that Drizzle-kit push silently skipped for a new service.
//
// Why this exists:
//   Drizzle-kit's SQLite adapter is selective about ALTER TABLE. It reliably
//   CREATEs new tables (e.g. `ferry_tickets*`) but SKIPS `ADD COLUMN` on
//   large FK-heavy tables (`payload_locked_documents_rels`) and global
//   tables with many pre-existing columns (`site_features`). No error is
//   raised — the push finishes with a green tick, and the missing column
//   only surfaces at query time as `SqliteError: no such column: X`.
//
// This script parametrises the manual ALTER we've had to do for every new
// service (Spa, Ferry Tickets, …). Point it at a new service and it will
// audit + fix the two tables Drizzle keeps missing.
//
// Usage:
//   cd apps/cms && pnpm tsx src/scripts/add-service-missing-cols.ts <slug>
//
// Where <slug> = the collection slug (kebab-case), e.g. `ferry-tickets`,
// `spa`, `water-activities`. The script converts to snake_case for column
// names (Payload's own convention).
//
// Safe to run repeatedly — every ALTER is guarded by an existence check.
//
// Run AFTER `push-schema-once.ts` / `push-schema-loop.ts`, before `pnpm dev`.

import { createClient } from '@libsql/client'
import path from 'path'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: pnpm tsx src/scripts/add-service-missing-cols.ts <collection-slug>')
  console.error('Example: pnpm tsx src/scripts/add-service-missing-cols.ts ferry-tickets')
  process.exit(1)
}

// kebab-case → snake_case (Payload's DB-name convention)
const snake = slug.replace(/-/g, '_')

const c = createClient({ url: 'file:' + path.resolve('cms.db') })

async function columnExists(table: string, col: string): Promise<boolean> {
  const cols = await c.execute(`PRAGMA table_info("${table}")`)
  return cols.rows.some((r: any) => r.name === col)
}

async function tableExists(table: string): Promise<boolean> {
  const r = await c.execute({
    sql: "SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?",
    args: [table],
  })
  return r.rows.length > 0
}

async function tryExec(sql: string, label: string) {
  try {
    await c.execute(sql)
    console.log(`  ✓ ${label}`)
  } catch (e: any) {
    console.log(`  ✗ ${label}: ${e.message}`)
  }
}

async function main() {
  console.log(`\nAuditing missing DB columns for service "${slug}" (snake: ${snake})\n`)

  // Prereq: base collection table must exist (from push-schema-loop).
  if (!(await tableExists(snake))) {
    console.error(`✗ Base table "${snake}" does not exist yet. Run push-schema-loop.ts first.`)
    process.exit(1)
  }

  // 1. site_features.modules_<snake>
  //    Payload's SiteFeatures global usually has a checkbox per service.
  //    Column name = "modules_" + snake_case of the checkbox name. When the
  //    checkbox name matches the collection slug (kebab-case), the resulting
  //    column matches this pattern. If a service used a different checkbox
  //    name (e.g. `weddings` for `venues`), pass the checkbox name instead
  //    of the slug — or edit this line.
  if (await tableExists('site_features')) {
    if (await columnExists('site_features', `modules_${snake}`)) {
      console.log(`  · site_features.modules_${snake}: already exists`)
    } else {
      await tryExec(
        `ALTER TABLE site_features ADD COLUMN modules_${snake} INTEGER DEFAULT true`,
        `site_features.modules_${snake}`,
      )
    }
  }

  // 2. payload_locked_documents_rels.<snake>_id (FK + index)
  //    Every registered collection gets a nullable FK in this rels table.
  //    Drizzle-kit consistently skips ADD COLUMN here.
  if (await tableExists('payload_locked_documents_rels')) {
    if (await columnExists('payload_locked_documents_rels', `${snake}_id`)) {
      console.log(`  · payload_locked_documents_rels.${snake}_id: already exists`)
    } else {
      await tryExec(
        `ALTER TABLE payload_locked_documents_rels ADD COLUMN ${snake}_id INTEGER REFERENCES ${snake}(id) ON DELETE CASCADE`,
        `payload_locked_documents_rels.${snake}_id`,
      )
      await tryExec(
        `CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_${snake}_id_idx ON payload_locked_documents_rels(${snake}_id)`,
        `payload_locked_documents_rels_${snake}_id_idx`,
      )
    }
  }

  console.log(`\nDone. If a query still fails with "no such column: X_${snake}" or "${snake}_id",`)
  console.log(`add another ALTER here for that table and re-run.`)
  process.exit(0)
}

main()
