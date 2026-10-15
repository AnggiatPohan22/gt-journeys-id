/**
 * Recovery MILD — drop tables baru dari Phase 3.7.4 rollout
 * (WaterActivities + Yachts + Restaurants + Venues restructure).
 *
 * Drop hanya:
 *   - subtables baru (quick_specs, features, additional_blocks_*)
 *   - __new_* scratch
 *   - versioned _*_v_* untuk subtables baru
 *
 * PRESERVE main tables + existing subtables (gallery, amenities, packages,
 * pricing_tiers, room_types, dst) — data existing aman.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/drop-services-new-tables.ts
 * NOTE: stop `pnpm dev` dulu (SQLite lock).
 *
 * Kalau setelah script + restart masih 500 → jalankan nuclear (per collection).
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbPath = path.resolve(dirname, '../../cms.db')

const client = createClient({ url: `file:${dbPath}` })

const collections = ['water_activities', 'yachts', 'restaurants', 'venues']

const blockSlugs = [
  'hero', 'rich_text', 'image', 'gallery', 'cta', 'faq',
  'testimonials', 'service_grid', 'contact', 'embed', 'spacer',
  'value_props_banner', 'stats_banner', 'testimonials_carousel',
  'service_listing', 'trust_badges',
]

// Subtables baru per collection (semua yg dibuat di Phase 3.7.4).
const buildTargets = (col: string) => {
  const blockTables = blockSlugs.flatMap((slug) => [
    `__new_${col}_blocks_${slug}`,
    `${col}_blocks_${slug}_image_slider`,
    `${col}_blocks_${slug}_images`,
    `${col}_blocks_${slug}_items`,
    `${col}_blocks_${slug}_badges`,
    `_${col}_v_blocks_${slug}_image_slider`,
    `_${col}_v_blocks_${slug}_images`,
    `_${col}_v_blocks_${slug}_items`,
    `_${col}_v_blocks_${slug}_badges`,
    `${col}_blocks_${slug}`,
    `_${col}_v_blocks_${slug}`,
  ])
  return [
    // Scratch tables
    `__new_${col}`,
    `__new_${col}_quick_specs`,
    `__new_${col}_features`,
    `__new_${col}_what_to_bring`,
    `__new_${col}_amenities`,
    `__new_${col}_menu_highlights`,
    `__new_${col}_opening_hours`,
    `__new_${col}_packages`,
    `__new_${col}_testimonials`,
    // NEW subtables
    `${col}_quick_specs`,
    `${col}_features`,
    `${col}_what_to_bring`,
    // Versioned copies of new subtables
    `_${col}_v_quick_specs`,
    `_${col}_v_features`,
    `_${col}_v_what_to_bring`,
    ...blockTables,
  ]
}

const allTargets = collections.flatMap(buildTargets)

let dropped = 0
for (const t of allTargets) {
  try {
    await client.execute(`DROP TABLE IF EXISTS "${t}"`)
    process.stdout.write(`✓ ${t}\n`)
    dropped++
  } catch (e: any) {
    process.stdout.write(`× ${t}: ${e.message}\n`)
  }
}

process.stdout.write(`\nDone: ${dropped} DROP statements executed.\n`)
process.stdout.write(`Main tables (${collections.join(', ')}) + existing subtables tetap ada.\n`)
process.stdout.write(`\n📝 Restart CMS: cd apps/cms && pnpm dev\n`)
process.stdout.write(`   Kalau Drizzle prompt → CREATE untuk semua.\n`)
process.stdout.write(`\nKalau masih 500 → jalankan drop-services-nuclear.ts\n`)
process.stdout.write(`(TAPI hilangkan semua data 4 collection).\n`)

client.close()
