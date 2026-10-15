/**
 * Nuclear reset for ServiceListing block tables — untuk fix loop
 * "created or renamed" yang tidak selesai-selesai.
 *
 * Drop SEMUA `<collection>_blocks_service_listing*` + shadow `__new_*`.
 * Payload akan recreate fresh dengan schema baru saat CMS restart.
 *
 * Data loss: 7 rows di pages_blocks_service_listing (blocks di CMS Pages
 * villa/tour/water-activity/yacht/restaurant/venue/rental). Restore via:
 *   pnpm tsx src/scripts/seed-landing-pages.ts
 *
 * Run: pnpm tsx src/scripts/nuclear-reset-service-listing.ts
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const c = createClient({ url: `file:${dbPath}` })

// Find all matching tables
const tables = await c.execute(
  `SELECT name FROM sqlite_master WHERE type='table' AND (
     name LIKE '%_blocks_service_listing%'
     OR name LIKE '__new_%_blocks_service_listing%'
   ) ORDER BY name`,
)

console.log(`Found ${tables.rows.length} table(s) to drop:`)
tables.rows.forEach((r) => console.log(`  - ${r.name}`))

if (tables.rows.length === 0) {
  console.log('Nothing to drop. Done.')
  process.exit(0)
}

// Disable FK enforcement temporarily so drops work in any order
await c.execute('PRAGMA foreign_keys = OFF')

// Drop indexes first
for (const row of tables.rows) {
  const t = row.name as string
  const idxRes = await c.execute(
    `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='${t}'`,
  )
  for (const idx of idxRes.rows) {
    const idxName = idx.name as string
    if (!idxName.startsWith('sqlite_')) {
      await c.execute(`DROP INDEX IF EXISTS "${idxName}"`)
      console.log(`  dropped index: ${idxName}`)
    }
  }
}

// Drop child tables first (accommodation_types), then parent tables
const sorted = [...tables.rows].sort((a, b) => (b.name as string).length - (a.name as string).length)
for (const row of sorted) {
  const t = row.name as string
  await c.execute(`DROP TABLE IF EXISTS "${t}"`)
  console.log(`  dropped table: ${t}`)
}

await c.execute('PRAGMA foreign_keys = ON')

console.log('\n✓ Nuclear reset done.')
console.log('  Next: run `pnpm dev` — Payload will recreate tables with the new schema.')
console.log('  After CMS is up, restore data: `pnpm tsx src/scripts/seed-landing-pages.ts`')
process.exit(0)
