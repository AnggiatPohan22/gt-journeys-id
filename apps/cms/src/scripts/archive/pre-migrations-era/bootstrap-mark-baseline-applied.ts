// One-shot bootstrap: create the payload_migrations table if missing
// and mark the initial baseline migration as ALREADY applied — without
// running its UP function. The current DB is presumed to already reflect
// the baseline schema (from years of dev pushes).
//
// After running this, future `pnpm schema:migrate` will only apply
// migrations that come AFTER the baseline. Delete this script after
// bootstrap (it is one-time-use only).
//
// Usage:  cd apps/cms && pnpm tsx src/scripts/bootstrap-mark-baseline-applied.ts

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const BASELINE_NAME = '20260912_114854' // matches src/migrations/<name>.ts

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const c = createClient({ url: `file:${dbPath}` })

async function tableExists(name: string): Promise<boolean> {
  const r = await c.execute({
    sql: `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
    args: [name],
  })
  return r.rows.length > 0
}

console.log('Bootstrap: creating payload_migrations table if missing…')
await c.execute(`
  CREATE TABLE IF NOT EXISTS payload_migrations (
    id integer PRIMARY KEY AUTOINCREMENT,
    name text,
    batch numeric,
    updated_at text DEFAULT CURRENT_TIMESTAMP,
    created_at text DEFAULT CURRENT_TIMESTAMP
  )
`)
console.log('  ✓ payload_migrations ready')

console.log(`Bootstrap: checking whether ${BASELINE_NAME} is already recorded…`)
const existing = await c.execute({
  sql: `SELECT id FROM payload_migrations WHERE name = ?`,
  args: [BASELINE_NAME],
})
if (existing.rows.length > 0) {
  console.log('  · already recorded — nothing to do')
  process.exit(0)
}

console.log(`Bootstrap: marking ${BASELINE_NAME} as applied (batch=1, without running UP)…`)
await c.execute({
  sql: `INSERT INTO payload_migrations (name, batch) VALUES (?, ?)`,
  args: [BASELINE_NAME, 1],
})
console.log('  ✓ baseline marked applied')

console.log('\nNext: any future `pnpm schema:new` generates diff-migrations only.')
console.log('       `pnpm schema:status` should show baseline = executed.')
process.exit(0)
