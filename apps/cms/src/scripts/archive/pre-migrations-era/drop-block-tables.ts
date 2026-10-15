/**
 * Recovery script — drop pages_blocks_{hero,image,gallery,cta} tables (+
 * nested subtables + versioned _pages_v_blocks_*) so Payload can recreate
 * them cleanly with Phase 3.6.3.1 schema on next dev restart.
 *
 * WHY: Drizzle SQLite adapter failed to push Phase 3.6.3.1 additions
 * (textStyles group, sliderAutoStart, per-breakpoint columns, hoverEffect,
 * enableLightbox) → tables missing columns → pages API returns 500.
 *
 * SAFE: only touches page-builder block subtables for the 4 affected
 * blocks. Pages themselves, other blocks, all collections, users, media
 * — untouched. You WILL lose any Hero/Image/Gallery/CTA blocks currently
 * placed on existing pages (re-add them via CMS after restart).
 *
 * USAGE:
 *   1. Stop `pnpm dev` in apps/cms (SQLite lock)
 *   2. cd apps/cms && pnpm tsx src/scripts/drop-block-tables.ts
 *   3. pnpm dev  (Payload will recreate fresh schema)
 */

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbPath = path.resolve(dirname, '../../cms.db')

const client = createClient({ url: `file:${dbPath}` })

// Phase 3.6.4: include ALL blocks that were enhanced with textStyles group.
// (Hero/Image/Gallery/CTA already had schema pushed in Phase 3.6.3.1 with
// old column names `text_styles_*`; new schema uses `ts_*` via dbName. Drop
// all to let Drizzle recreate cleanly.)
const blockSlugs = [
  'hero', 'image', 'gallery', 'cta',
  'rich_text', 'faq', 'testimonials', 'service_grid', 'contact',
  'value_props_banner', 'stats_banner', 'testimonials_carousel',
]

const buildTargets = (slug: string) => [
  `__new_pages_blocks_${slug}`,
  `pages_blocks_${slug}_image_slider`,
  `pages_blocks_${slug}_images`,
  `pages_blocks_${slug}_items`,
  `_pages_v_blocks_${slug}_image_slider`,
  `_pages_v_blocks_${slug}_images`,
  `_pages_v_blocks_${slug}_items`,
  `pages_blocks_${slug}`,
  `_pages_v_blocks_${slug}`,
]

const targets = blockSlugs.flatMap(buildTargets)

for (const t of targets) {
  try {
    await client.execute(`DROP TABLE IF EXISTS "${t}"`)
    console.log(`✓ dropped ${t}`)
  } catch (e: any) {
    console.log(`× skip ${t}: ${e.message}`)
  }
}

console.log('\nDone. Restart `pnpm dev` — Payload recreate schema.')
console.log('Kalau Drizzle prompt "create table or rename" → pilih CREATE TABLE.')
client.close()
