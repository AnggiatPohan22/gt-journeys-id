import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: 'file:' + path.resolve(dirname, '../../cms.db') })

const collections = ['pages', 'accommodations', 'rentals', 'restaurants', 'tours', 'venues', 'yachts']
for (const col of collections) {
  const t = `${col}_blocks_service_listing`
  try {
    const r = await c.execute(`SELECT COUNT(*) as n FROM ${t}`)
    const rc = r.rows[0].n
    const ct = `${t}_accommodation_types`
    let ac = 0
    try {
      const r2 = await c.execute(`SELECT COUNT(*) as n FROM ${ct}`)
      ac = Number(r2.rows[0].n)
    } catch {}
    console.log(`${t}: ${rc} rows (accommodation_types: ${ac})`)
  } catch (e) {
    console.log(`${t}: NO TABLE`)
  }
}

process.exit(0)
