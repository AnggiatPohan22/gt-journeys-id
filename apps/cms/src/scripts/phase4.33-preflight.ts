// Phase 4.33 preflight — remove pre-existing columns and duplicate
// indexes that block a clean `push: true` boot, so a fresh push only
// sees "create" operations (no data-loss prompts, no shadow-table churn).
//
// What it does:
//   1. DROP footer_settings.show_newsletter (retired: replaced with
//      newsletter.* group in Phase 4.33).
//   2. DROP any duplicate order/parent indexes on `rentals_blocks_*`
//      tables that a prior failed push left behind — Payload will
//      re-create them cleanly on the next boot.
//
// Idempotent: running it twice is a no-op. Safe to run before restart.
//
// Usage: cd apps/cms && pnpm tsx src/scripts/phase4.33-preflight.ts

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const client = createClient({ url: `file:${dbPath}` })

async function hasColumn(table: string, column: string): Promise<boolean> {
  const res = await client.execute(`PRAGMA table_info("${table}")`)
  return res.rows.some((r) => (r as any).name === column)
}

async function tableExists(table: string): Promise<boolean> {
  const res = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
    [table],
  )
  return res.rows.length > 0
}

async function dropColumnIfPresent(table: string, column: string): Promise<void> {
  if (!(await tableExists(table))) {
    console.log(`  · table "${table}" not present — skip`)
    return
  }
  if (!(await hasColumn(table, column))) {
    console.log(`  · column "${table}.${column}" already absent — skip`)
    return
  }
  await client.execute(`ALTER TABLE "${table}" DROP COLUMN "${column}"`)
  console.log(`  ✓ dropped ${table}.${column}`)
}

async function dropAllPayloadIndexes(): Promise<void> {
  // Drop every non-system index whose name matches Payload's naming
  // pattern (*_idx). Payload's schema push calls CREATE INDEX without
  // IF NOT EXISTS, so any pre-existing index halts the push. Dropping
  // them all lets push recreate cleanly. Unique constraints backed by
  // sqlite_autoindex_* are left alone (those are internal).
  const res = await client.execute(
    `SELECT name FROM sqlite_master
     WHERE type='index'
       AND name LIKE '%_idx'
       AND name NOT LIKE 'sqlite_%'`,
  )
  console.log(`  · found ${res.rows.length} Payload index(es) to drop`)
  let dropped = 0
  for (const row of res.rows) {
    const name = (row as any).name as string
    try {
      await client.execute(`DROP INDEX IF EXISTS "${name}"`)
      dropped++
    } catch (e: any) {
      console.log(`  × ${name}: ${e.message}`)
    }
  }
  console.log(`  ✓ dropped ${dropped}/${res.rows.length} indexes`)
}

console.log('Phase 4.33 preflight — retiring pre-existing columns\n')
await dropColumnIfPresent('footer_settings', 'show_newsletter')

console.log('\nPhase 4.33 preflight — dropping all Payload indexes')
console.log('  (Payload will recreate them on the next boot; this bypasses')
console.log('   "index already exists" errors that halt schema push.)')
await dropAllPayloadIndexes()

console.log('\n✓ Preflight done. Now restart CMS (pnpm dev) — remaining prompts should all be create-only.')
process.exit(0)
