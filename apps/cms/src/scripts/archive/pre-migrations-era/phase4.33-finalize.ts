// Finalize Phase 4.33 schema by hand — adds the one column that push
// keeps missing. Idempotent.
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

async function addFkColumn(table: string, column: string, refTable: string) {
  if (await hasColumn(table, column)) {
    console.log(`  · ${table}.${column} already present — skip`)
    return
  }
  // Payload's FK columns use ON UPDATE NO ACTION ON DELETE CASCADE
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

async function addColumn(table: string, column: string, type: string, defaultLiteral?: string) {
  if (await hasColumn(table, column)) {
    console.log(`  · ${table}.${column} already present — skip`)
    return
  }
  const def = defaultLiteral !== undefined ? ` DEFAULT ${defaultLiteral}` : ''
  await c.execute(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}${def}`)
  console.log(`  ✓ added ${table}.${column} (${type})`)
}

console.log('Phase 4.33 finalize — payload_locked_documents_rels\n')
await addFkColumn('payload_locked_documents_rels', 'newsletter_subscribers_id', 'newsletter_subscribers')
await ensureIndex(
  'payload_locked_documents_rels_newsletter_subscribers_id_idx',
  'payload_locked_documents_rels',
  'newsletter_subscribers_id',
)

console.log('\nPhase 4.33 finalize — footer_settings newsletter columns')
await addColumn('footer_settings', 'newsletter_heading', 'TEXT', "'Get Bali Travel Inspiration'")
await addColumn('footer_settings', 'newsletter_theme', 'TEXT', "'ocean'")
await addColumn('footer_settings', 'newsletter_description', 'TEXT')
await addColumn('footer_settings', 'newsletter_placeholder_text', 'TEXT', "'your@email.com'")
await addColumn('footer_settings', 'newsletter_button_label', 'TEXT', "'Subscribe'")
await addColumn('footer_settings', 'newsletter_success_message', 'TEXT', "'Thanks! We''ll be in touch.'")
await addColumn('footer_settings', 'newsletter_error_message', 'TEXT', "'Something went wrong. Please try again.'")

console.log('\n✓ Finalize done.')
process.exit(0)
