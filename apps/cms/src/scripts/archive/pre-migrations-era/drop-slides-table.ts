/**
 * One-off cleanup: drop the polluting global `slides` table that was created
 * when imageSlider array had `dbName: 'slides'`. That dbName made all block
 * instances across collections share ONE table → FK constraint violations.
 *
 * After running this + fixing block config, restart CMS to let Payload
 * recreate proper `<collection>_blocks_service_listing_image_slider` tables.
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: 'file:' + path.resolve(dirname, '../../cms.db') })

await c.execute('PRAGMA foreign_keys = OFF')

const idxRes = await c.execute(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='slides'`)
for (const r of idxRes.rows) {
  const n = r.name as string
  if (!n.startsWith('sqlite_')) {
    await c.execute(`DROP INDEX IF EXISTS "${n}"`)
    console.log('dropped index:', n)
  }
}
await c.execute(`DROP TABLE IF EXISTS "slides"`)
console.log('dropped table: slides')

const shadows = await c.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '__new_%'`)
for (const r of shadows.rows) {
  const n = r.name as string
  await c.execute(`DROP TABLE IF EXISTS "${n}"`)
  console.log('dropped shadow:', n)
}

await c.execute('PRAGMA foreign_keys = ON')
console.log('\n✓ done. Restart CMS.')
process.exit(0)
