/**
 * Cleanup — drop orphan indexes untuk 4 services collections.
 *
 * Kejadian: DROP TABLE tidak selalu cascade drop indexes di SQLite.
 * Payload restart → CREATE INDEX gagal karena existing.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/drop-services-indexes.ts
 * (Stop CMS dulu)
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
  `name LIKE '${p}_%'`,
  `name LIKE '_${p}_v%'`,
  `name LIKE '__new_${p}%'`,
]).join(' OR ')

// Cari semua index yg match pattern
const listRes = await client.execute(
  `SELECT name FROM sqlite_master WHERE type='index' AND (${conditions})`
)

const indexes = listRes.rows.map((r) => r.name as string).sort()

if (indexes.length === 0) {
  process.stdout.write('No orphan indexes found. Nothing to do.\n')
  process.exit(0)
}

process.stdout.write(`Drop ${indexes.length} orphan indexes:\n`)
let dropped = 0
for (const i of indexes) {
  try {
    await client.execute(`DROP INDEX IF EXISTS "${i}"`)
    process.stdout.write(`✓ ${i}\n`)
    dropped++
  } catch (e: any) {
    process.stdout.write(`× ${i}: ${e.message}\n`)
  }
}

process.stdout.write(`\n${dropped}/${indexes.length} dropped.\n`)
process.stdout.write(`\n📝 Restart CMS: cd apps/cms && pnpm dev\n`)

client.close()
