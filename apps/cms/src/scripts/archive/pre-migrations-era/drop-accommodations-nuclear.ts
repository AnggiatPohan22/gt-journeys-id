/**
 * NUCLEAR recovery — drop main `accommodations` table + ALL subtables +
 * versioned copies. Payload recreate fresh schema saat restart.
 *
 * ⚠️  HILANGKAN SEMUA DATA VILLA/HOTEL/RESORT/GUESTHOUSE.
 * ⚠️  Jalankan HANYA kalau drop-accommodations-new-tables.ts sudah dicoba
 *     dan CMS masih 500.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/drop-accommodations-nuclear.ts
 * NOTE: matikan `pnpm dev` CMS dulu.
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbPath = path.resolve(dirname, '../../cms.db')

const client = createClient({ url: `file:${dbPath}` })

// Discover all accommodations-related tables (main + subtables + versioned).
const listRes = await client.execute(
  `SELECT name FROM sqlite_master WHERE type='table' AND (name = 'accommodations' OR name LIKE 'accommodations_%' OR name LIKE '_accommodations_v%' OR name LIKE '__new_accommodations%')`
)

const targets = listRes.rows.map((r) => r.name as string).sort()

if (targets.length === 0) {
  process.stdout.write('No accommodations-related tables found. Nothing to do.\n')
  process.exit(0)
}

process.stdout.write(`⚠️  Akan DROP ${targets.length} tables:\n`)
for (const t of targets) process.stdout.write(`  - ${t}\n`)
process.stdout.write(`\nSemua data villa/hotel/resort/guesthouse HILANG.\n`)
process.stdout.write(`Tunggu 3 detik... (Ctrl+C untuk batal)\n`)

await new Promise((r) => setTimeout(r, 3000))

let dropped = 0
for (const t of targets) {
  try {
    await client.execute(`DROP TABLE IF EXISTS "${t}"`)
    process.stdout.write(`✓ dropped ${t}\n`)
    dropped++
  } catch (e: any) {
    process.stdout.write(`× failed ${t}: ${e.message}\n`)
  }
}

process.stdout.write(`\nSummary: ${dropped}/${targets.length} tables dropped.\n`)
process.stdout.write(`\n📝 Restart CMS: cd apps/cms && pnpm dev\n`)
process.stdout.write(`   Kalau Drizzle prompt "rename or create": pilih CREATE untuk semua.\n`)
process.stdout.write(`\n   Setelah CMS start clean, curl localhost:3030/api/accommodations return 200.\n`)
process.stdout.write(`   Kamu perlu buat villa/hotel entries baru manual di CMS admin.\n`)

client.close()
