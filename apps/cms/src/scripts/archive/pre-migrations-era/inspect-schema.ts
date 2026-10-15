// One-shot diagnostic: list all tables + columns matching a pattern.
// Usage: pnpm tsx src/scripts/inspect-schema.ts
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const client = createClient({ url: `file:${dbPath}` })

const filter = process.argv[2] ?? 'service_listing'

const tablesRes = await client.execute(
  `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%${filter}%' ORDER BY name`,
)
console.log(`\nTables matching '${filter}':`)
for (const row of tablesRes.rows) {
  const name = row.name as string
  console.log(`\n  ${name} (${name.length} chars)`)
  const cols = await client.execute(`PRAGMA table_info(${name})`)
  for (const c of cols.rows) {
    console.log(`    - ${c.name} :: ${c.type}${c.notnull ? ' NOT NULL' : ''}${c.dflt_value ? ` default=${c.dflt_value}` : ''}`)
  }
}

process.exit(0)
