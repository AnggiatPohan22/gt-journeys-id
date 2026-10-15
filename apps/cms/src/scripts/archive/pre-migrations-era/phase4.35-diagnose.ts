// Phase 4.35 diagnose — inspect DB state after a partial schema push
// for the `authors` collection. Read-only; safe to run anytime.
//
// Usage: cd apps/cms && pnpm tsx src/scripts/phase4.35-diagnose.ts
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const c = createClient({ url: `file:${dbPath}` })

async function tablesLike(pattern: string): Promise<string[]> {
  const r = await c.execute({
    sql: `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE ? ORDER BY name`,
    args: [pattern],
  })
  return r.rows.map((row) => (row as any).name)
}

async function columns(table: string): Promise<string[]> {
  const r = await c.execute(`PRAGMA table_info("${table}")`)
  return r.rows.map((row) => (row as any).name)
}

async function indexesOn(pattern: string): Promise<Array<{ name: string; tbl: string }>> {
  const r = await c.execute({
    sql: `SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND (name LIKE ? OR tbl_name LIKE ?) ORDER BY tbl_name, name`,
    args: [pattern, pattern],
  })
  return r.rows.map((row) => ({ name: (row as any).name, tbl: (row as any).tbl_name }))
}

console.log('Phase 4.35 diagnose — Authors collection DB state\n')

console.log('── authors-related tables ──')
const authorTables = await tablesLike('%author%')
if (authorTables.length === 0) console.log('  (none)')
for (const t of authorTables) {
  console.log(`  ${t}`)
  const cols = await columns(t)
  console.log(`     cols: ${cols.join(', ')}`)
}

console.log('\n── payload_locked_documents_rels columns ──')
const lockedCols = await columns('payload_locked_documents_rels')
console.log(`  ${lockedCols.join(', ')}`)
console.log(`  authors_id present? → ${lockedCols.includes('authors_id') ? 'YES' : 'NO ← THIS IS THE 500 ROOT CAUSE'}`)

console.log('\n── payload_preferences_rels columns ──')
const prefCols = await columns('payload_preferences_rels')
console.log(`  ${prefCols.join(', ')}`)
console.log(`  authors_id present? → ${prefCols.includes('authors_id') ? 'YES' : 'NO'}`)

console.log('\n── indexes touching authors ──')
const idxs = await indexesOn('%author%')
if (idxs.length === 0) console.log('  (none)')
for (const i of idxs) console.log(`  ${i.tbl} → ${i.name}`)

console.log('\n── categories.module enum check-constraint (SQLite stores as CHECK) ──')
const catSql = await c.execute({
  sql: `SELECT sql FROM sqlite_master WHERE type='table' AND name='categories'`,
  args: [],
})
const sql = (catSql.rows[0] as any)?.sql ?? ''
const hasBlogEnum = sql.includes("'blog'")
console.log(`  'blog' present in CHECK? → ${hasBlogEnum ? 'YES' : 'NO — will 500 saat pilih Blog di dropdown'}`)

process.exit(0)
