/**
 * Recovery script — drop broken pages_blocks_cta tables so Payload can
 * recreate them cleanly on next `pnpm dev` restart.
 *
 * WHY: Drizzle SQLite table-recreate migration failed mid-way (large
 * schema additions for CTA block Phase 3.6.3) leaving __new_pages_blocks_cta
 * scratch table + stale pages_blocks_cta with mismatched columns.
 *
 * SAFE TO RUN: only touches CTA block tables. Other content (pages, users,
 * media, all other collections + blocks) untouched. You'll need to re-add
 * CTA blocks that were on existing pages (usually few/none in dev).
 *
 * USAGE:
 *   1. Stop `pnpm dev` in apps/cms (SQLite lock)
 *   2. cd apps/cms && pnpm tsx src/scripts/drop-cta-tables.ts
 *   3. pnpm dev
 */

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbPath = path.resolve(dirname, '../../cms.db')

const client = createClient({ url: `file:${dbPath}` })

const targets = [
  '__new_pages_blocks_cta',
  '_pages_v_blocks_cta',
  '__new__pages_v_blocks_cta',
  'pages_blocks_cta',
  // Nested media/button/background sub-tables kalau ada
  'pages_blocks_cta_image_slider',
  '_pages_v_blocks_cta_image_slider',
]

for (const t of targets) {
  try {
    await client.execute(`DROP TABLE IF EXISTS "${t}"`)
    console.log(`✓ dropped ${t}`)
  } catch (e: any) {
    console.log(`× skip ${t}: ${e.message}`)
  }
}

console.log('\nDone. Restart `pnpm dev` — Payload akan recreate fresh schema.')
client.close()
