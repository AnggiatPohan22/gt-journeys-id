/**
 * NUCLEAR — drop main + semua subtables untuk 4 collection:
 * water_activities, yachts, restaurants, venues.
 *
 * ⚠️  HILANGKAN SEMUA DATA. Jalankan HANYA kalau mild recovery gagal.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/drop-services-nuclear.ts
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbPath = path.resolve(dirname, '../../cms.db')

const client = createClient({ url: `file:${dbPath}` })

const patterns = ['water_activities', 'yachts', 'restaurants', 'venues']
const conditions = patterns.flatMap((p) => [
  `name = '${p}'`,
  `name LIKE '${p}_%'`,
  `name LIKE '_${p}_v%'`,
  `name LIKE '__new_${p}%'`,
]).join(' OR ')

const listRes = await client.execute(
  `SELECT name FROM sqlite_master WHERE type='table' AND (${conditions})`
)

const targets = listRes.rows.map((r) => r.name as string).sort()

if (targets.length === 0) {
  process.stdout.write('No matching tables. Nothing to do.\n')
  process.exit(0)
}

process.stdout.write(`⚠️  Akan DROP ${targets.length} tables:\n`)
for (const t of targets) process.stdout.write(`  - ${t}\n`)
process.stdout.write(`\nSemua data 4 collection HILANG. Ctrl+C untuk batal (3s)...\n`)

await new Promise((r) => setTimeout(r, 3000))

let dropped = 0
for (const t of targets) {
  try {
    await client.execute(`DROP TABLE IF EXISTS "${t}"`)
    process.stdout.write(`✓ ${t}\n`)
    dropped++
  } catch (e: any) {
    process.stdout.write(`× ${t}: ${e.message}\n`)
  }
}

process.stdout.write(`\n${dropped}/${targets.length} dropped.\n`)
process.stdout.write(`\n📝 Restart CMS: cd apps/cms && pnpm dev\n`)
process.stdout.write(`   Prompt "rename or create" → CREATE untuk semua.\n`)

client.close()
