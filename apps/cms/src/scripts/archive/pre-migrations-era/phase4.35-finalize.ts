// Phase 4.35 finalize — hand-add anything Payload's push still keeps
// missing after the preflight + FORCE_PUSH cycle. Mirror of
// phase4.33-finalize.ts. Idempotent.
//
// Usage: cd apps/cms && pnpm tsx src/scripts/phase4.35-finalize.ts

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const c = createClient({ url: `file:${dbPath}` })

async function hasColumn(table: string, column: string): Promise<boolean> {
  const res = await c.execute(`PRAGMA table_info("${table}")`)
  return res.rows.some((r) => (r as any).name === column)
}

async function tableExists(table: string): Promise<boolean> {
  const r = await c.execute({
    sql: `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
    args: [table],
  })
  return r.rows.length > 0
}

async function addFkColumn(table: string, column: string, refTable: string) {
  if (!(await tableExists(table))) {
    console.log(`  × ${table} missing — cannot add ${column} (aborting this step)`)
    return
  }
  if (await hasColumn(table, column)) {
    console.log(`  · ${table}.${column} already present — skip`)
    return
  }
  await c.execute(
    `ALTER TABLE "${table}" ADD COLUMN "${column}" INTEGER REFERENCES "${refTable}"(id) ON UPDATE NO ACTION ON DELETE CASCADE`,
  )
  console.log(`  ✓ added ${table}.${column} → ${refTable}(id)`)
}

async function ensureIndex(name: string, table: string, column: string) {
  const r = await c.execute({
    sql: `SELECT 1 FROM sqlite_master WHERE type='index' AND name = ?`,
    args: [name],
  })
  if (r.rows.length > 0) {
    console.log(`  · index ${name} already present — skip`)
    return
  }
  await c.execute(`CREATE INDEX "${name}" ON "${table}"("${column}")`)
  console.log(`  ✓ created index ${name}`)
}

console.log('Phase 4.35 finalize — payload_locked_documents_rels / payload_preferences_rels\n')

await addFkColumn('payload_locked_documents_rels', 'authors_id', 'authors')
await ensureIndex(
  'payload_locked_documents_rels_authors_id_idx',
  'payload_locked_documents_rels',
  'authors_id',
)

await addFkColumn('payload_preferences_rels', 'authors_id', 'authors')
await ensureIndex(
  'payload_preferences_rels_authors_id_idx',
  'payload_preferences_rels',
  'authors_id',
)

console.log('\n✓ Finalize done.')
console.log('Now re-run:  pnpm tsx src/scripts/phase4.35-diagnose.ts')
console.log('All lines should say YES.')
process.exit(0)
