// Migrate AnnouncementBar schema for the frequency-preset + reset-button
// + homepage-scope tweak. Idempotent.
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

console.log('Migrating announcement_bar…\n')
await addColumn('announcement_bar', 'display_frequency',     'TEXT',    "'1440'")
await addColumn('announcement_bar', 'reset_visitor_cookies', 'INTEGER', '0')
await addColumn('announcement_bar', 'show_on_homepage_only', 'INTEGER', '0')

console.log('\n✓ Done.')
process.exit(0)
