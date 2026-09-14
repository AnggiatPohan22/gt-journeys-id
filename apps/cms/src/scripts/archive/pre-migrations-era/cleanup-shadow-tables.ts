// Drops orphan `__new_*` SQLite shadow tables left behind by failed
// Drizzle push migrations. Safe: shadow tables are internal-only migration
// scratchpads; production data lives in the non-prefixed tables.
//
// Usage: pnpm tsx src/scripts/cleanup-shadow-tables.ts
//
// Also drops any indexes attached to shadow tables. Run before restarting
// CMS if `pnpm dev` keeps re-prompting "created or renamed" every start.

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const client = createClient({ url: `file:${dbPath}` })

const shadowTables = await client.execute(
  `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '__new_%' ORDER BY name`,
)

if (shadowTables.rows.length === 0) {
  console.log('✓ No shadow tables found. DB is clean.')
  process.exit(0)
}

console.log(`Found ${shadowTables.rows.length} shadow table(s):`)
for (const row of shadowTables.rows) {
  console.log(`  - ${row.name}`)
}

console.log('\nDropping shadow tables...')
for (const row of shadowTables.rows) {
  const name = row.name as string
  // Drop associated indexes first
  const idxRes = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='${name}'`,
  )
  for (const idx of idxRes.rows) {
    const idxName = idx.name as string
    if (!idxName.startsWith('sqlite_')) {
      await client.execute(`DROP INDEX IF EXISTS "${idxName}"`)
      console.log(`  dropped index: ${idxName}`)
    }
  }
  await client.execute(`DROP TABLE IF EXISTS "${name}"`)
  console.log(`  dropped table: ${name}`)
}

console.log('\n✓ Cleanup done. Restart CMS (pnpm dev) to retry migration cleanly.')
process.exit(0)
