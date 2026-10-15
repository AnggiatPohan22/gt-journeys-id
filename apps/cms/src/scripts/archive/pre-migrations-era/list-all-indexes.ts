import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: `file:${path.resolve(dirname, '../../cms.db')}` })
const r = await c.execute(
  `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
)
console.log('Total:', r.rows.length)
for (const row of r.rows) console.log('  ', (row as any).name)
process.exit(0)
