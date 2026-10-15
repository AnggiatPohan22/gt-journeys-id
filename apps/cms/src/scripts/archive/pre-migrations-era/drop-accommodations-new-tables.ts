/**
 * Recovery script — drop tables baru yg ditambahkan di Phase 3.7.1.2
 * (additionalBlocks + quickSpecs + subtables baru) supaya Payload bisa
 * recreate clean saat restart.
 *
 * TIDAK drop main `accommodations` table — data existing (villa/hotel entries)
 * aman. Kalau restart CMS masih 500 setelah script ini, jalankan
 * drop-accommodations-nuclear.ts (di bawah) — TAPI itu HILANGKAN semua data.
 *
 * WHY: Adding `additionalBlocks` (blocks type) creates ~16 accommodations_blocks_*
 * subtables. Drizzle push kadang gagal mid-way → 500 saat query pages/API.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/drop-accommodations-new-tables.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbPath = path.resolve(dirname, '../../cms.db')

const client = createClient({ url: `file:${dbPath}` })

// All 16 block slugs from apps/cms/src/blocks/index.ts (snake_case)
const blockSlugs = [
  'hero', 'rich_text', 'image', 'gallery', 'cta', 'faq',
  'testimonials', 'service_grid', 'contact', 'embed', 'spacer',
  'value_props_banner', 'stats_banner', 'testimonials_carousel',
  'service_listing', 'trust_badges',
]

// Subtable naming pattern for each block: accommodations_blocks_<slug>
// Plus nested (image_slider, images, items) and versioned variants.
const buildBlockTargets = (slug: string) => [
  `__new_accommodations_blocks_${slug}`,
  `accommodations_blocks_${slug}_image_slider`,
  `accommodations_blocks_${slug}_images`,
  `accommodations_blocks_${slug}_items`,
  `accommodations_blocks_${slug}_badges`,
  `_accommodations_v_blocks_${slug}_image_slider`,
  `_accommodations_v_blocks_${slug}_images`,
  `_accommodations_v_blocks_${slug}_items`,
  `_accommodations_v_blocks_${slug}_badges`,
  `accommodations_blocks_${slug}`,
  `_accommodations_v_blocks_${slug}`,
]

// NEW subtables from Phase 3.7.1.1 & 3.7.1.2 (safe to drop — likely empty).
const newSubtables = [
  '__new_accommodations',
  '__new_accommodations_quick_specs',
  '__new_accommodations_highlight_tags',
  '__new_accommodations_nearby_landmarks',
  '__new_accommodations_curated_experiences',
  'accommodations_quick_specs',
  'accommodations_highlight_tags',
  'accommodations_nearby_landmarks',
  'accommodations_curated_experiences',
  '_accommodations_v_quick_specs',
  '_accommodations_v_highlight_tags',
  '_accommodations_v_nearby_landmarks',
  '_accommodations_v_curated_experiences',
]

const allTargets = [
  ...blockSlugs.flatMap(buildBlockTargets),
  ...newSubtables,
]

let dropped = 0
let skipped = 0

for (const t of allTargets) {
  try {
    const res = await client.execute(`DROP TABLE IF EXISTS "${t}"`)
    // rowsAffected returns 0 for both "table not exists" and "table dropped"
    // — use a follow-up check to distinguish. But for simplicity, count all.
    process.stdout.write(`✓ dropped ${t}\n`)
    dropped++
  } catch (e: any) {
    process.stdout.write(`× skip ${t}: ${e.message}\n`)
    skipped++
  }
}

process.stdout.write(`\nSummary: ${dropped} DROP IF EXISTS statements executed, ${skipped} skipped.\n`)
process.stdout.write(`Main 'accommodations' table + existing data (gallery, amenities, room_types) tetap ada.\n`)
process.stdout.write(`\n📝 Restart CMS: cd apps/cms && pnpm dev\n`)
process.stdout.write(`   Kalau Drizzle prompt "rename or create": pilih CREATE untuk semua.\n`)
process.stdout.write(`\nKalau masih 500 setelah restart → jalankan drop-accommodations-nuclear.ts\n`)
process.stdout.write(`(TAPI hilangkan semua data villa/hotel — perlu re-entry).\n`)

client.close()
