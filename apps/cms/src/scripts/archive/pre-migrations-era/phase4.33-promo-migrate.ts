// Migrate PromoBanner schema for the frequency-preset + reset-button tweak.
// Idempotent: safe to run multiple times.
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: `file:${path.resolve(dirname, '../../cms.db')}` })

async function hasColumn(table: string, column: string): Promise<boolean> {
  const res = await c.execute(`PRAGMA table_info("${table}")`)
  return res.rows.some((r: any) => r.name === column)
}

async function addColumn(table: string, column: string, type: string, def?: string) {
  if (await hasColumn(table, column)) {
    console.log(`  · ${table}.${column} already present — skip`)
    return
  }
  const dv = def !== undefined ? ` DEFAULT ${def}` : ''
  await c.execute(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}${dv}`)
  console.log(`  ✓ added ${table}.${column} (${type})`)
}

async function dropColumn(table: string, column: string) {
  if (!(await hasColumn(table, column))) {
    console.log(`  · ${table}.${column} already absent — skip`)
    return
  }
  await c.execute(`ALTER TABLE "${table}" DROP COLUMN "${column}"`)
  console.log(`  ✓ dropped ${table}.${column}`)
}

console.log('Migrating promo_banner…\n')
await addColumn('promo_banner', 'display_frequency', 'TEXT', "'1440'")
await addColumn('promo_banner', 'reset_visitor_cookies', 'INTEGER', '0')
await addColumn('promo_banner', 'version', 'TEXT')
// Retire the old numeric field (data was seconds/days — replaced by preset)
await dropColumn('promo_banner', 'display_frequency_days')

console.log('\n✓ Done. Restart CMS if it is running.')
process.exit(0)
