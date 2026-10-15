// One-shot: drop the partial authors tables + indexes that were left in
// the DB by a crashed pre-migrations push. After this, the migration file
// `20260912_115008.ts` can run UP cleanly on a bare DB slot.
// Delete this script after use.
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: `file:${path.resolve(dirname, '../../cms.db')}` })

const indexes = [
  'authors_slug_idx',
  'authors_avatar_idx',
  'authors_seo_seo_og_image_idx',
  'authors_updated_at_idx',
  'authors_created_at_idx',
  'authors_social_links_order_idx',
  'authors_social_links_parent_id_idx',
]
for (const i of indexes) {
  await c.execute(`DROP INDEX IF EXISTS "${i}"`)
  console.log(`  dropped index ${i}`)
}
// Order matters: drop child first (has FK to authors)
await c.execute(`DROP TABLE IF EXISTS "authors_social_links"`)
console.log('  dropped table authors_social_links')
await c.execute(`DROP TABLE IF EXISTS "authors"`)
console.log('  dropped table authors')
console.log('\n✓ Partial state cleared. Safe to run: pnpm schema:migrate')
process.exit(0)
