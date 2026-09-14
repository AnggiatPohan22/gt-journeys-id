// Phase 4.33 diagnostics — inspect DB state to see exactly why push
// is failing. Read-only; safe to run any time.
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const c = createClient({ url: `file:${dbPath}` })

async function main() {
  console.log('=== Phase 4.33 tables present ===')
  const t = await c.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'newsletter%' OR name LIKE 'announcement%' OR name LIKE 'promo%') ORDER BY name`,
  )
  if (t.rows.length === 0) console.log('  (none)')
  for (const r of t.rows) console.log('  -', (r as any).name)

  console.log('\n=== payload_locked_documents_rels columns ===')
  const cols = await c.execute('PRAGMA table_info(payload_locked_documents_rels)')
  for (const r of cols.rows) console.log('  -', (r as any).name, '(', (r as any).type, ')')
  const hasNL = cols.rows.some((r) => (r as any).name === 'newsletter_subscribers_id')
  console.log('\n  newsletter_subscribers_id present?', hasNL ? 'YES' : 'NO')

  console.log('\n=== footer_settings.show_newsletter still present? ===')
  const fs = await c.execute('PRAGMA table_info(footer_settings)')
  const hasShowNL = fs.rows.some((r) => (r as any).name === 'show_newsletter')
  console.log('  ', hasShowNL ? 'YES (blocks migration)' : 'NO (good)')

  console.log('\n=== Duplicate index checks ===')
  const targets = [
    'water_activities_blocks_rich_text_order_idx',
    'rentals_blocks_trust_badges_order_idx',
  ]
  for (const name of targets) {
    const r = await c.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='index' AND name = ?`,
      args: [name],
    })
    console.log('  -', name, ':', r.rows.length > 0 ? 'EXISTS' : 'absent')
  }

  console.log('\n=== Payload indexes total ===')
  const allIdx = await c.execute(
    `SELECT COUNT(*) as n FROM sqlite_master WHERE type='index' AND name LIKE '%_idx' AND name NOT LIKE 'sqlite_%'`,
  )
  console.log('  ', (allIdx.rows[0] as any).n)

  console.log('\n=== Shadow tables ===')
  const shadow = await c.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '__new_%'`,
  )
  console.log('  ', shadow.rows.length === 0 ? 'none' : shadow.rows.map((r) => (r as any).name).join(', '))

  console.log('\n=== payload.config globals coverage ===')
  const globalsRow = await c.execute(
    `SELECT DISTINCT global_slug FROM payload_locked_documents WHERE global_slug IS NOT NULL ORDER BY global_slug`,
  )
  console.log('  slugs known to payload_locked_documents:')
  for (const r of globalsRow.rows) console.log('    ·', (r as any).global_slug)
}

main().catch((e) => { console.error(e); process.exit(1) }).then(() => process.exit(0))
