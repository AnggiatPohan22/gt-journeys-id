import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: `file:${path.resolve(dirname, '../../cms.db')}` })

const tables = [
  'newsletter_subscribers',
  'announcement_bar',
  'announcement_bar_link',
  'promo_banner',
  'promo_banner_cta',
  'footer_settings',
]
for (const t of tables) {
  const cols = await c.execute(`PRAGMA table_info("${t}")`)
  const names = cols.rows.map((r: any) => r.name).join(', ')
  console.log(`\n[${t}]`)
  console.log('  ', names || '(TABLE MISSING)')
}
process.exit(0)
