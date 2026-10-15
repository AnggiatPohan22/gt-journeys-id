// Phase 4.35 preflight — Authors collection schema push.
//
// Mirror of phase4.33-preflight.ts (proven pattern):
//   - Payload's schema push calls CREATE INDEX without IF NOT EXISTS.
//   - Any pre-existing `*_idx` from a previous boot halts the push mid-way,
//     leaving the new collection (authors) never created, which then breaks
//     admin queries that reference `payload_locked_documents_rels.authors_id`.
//   - Solution: drop every Payload-owned index BEFORE the push. Payload
//     recreates them all on the next boot, this time cleanly.
//
// Also takes a timestamped DB backup so we can roll back in seconds.
//
// Idempotent: running twice is a no-op.
//
// Usage:  cd apps/cms && pnpm tsx src/scripts/phase4.35-preflight.ts

import { createClient } from '@libsql/client'
import { copyFile } from 'node:fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const backupPath = `${dbPath}.bak-4.35-pre-push-${Date.now()}`

console.log(`Phase 4.35 preflight — backing up DB`)
await copyFile(dbPath, backupPath)
console.log(`  ✓ backup → ${path.basename(backupPath)}\n`)

const c = createClient({ url: `file:${dbPath}` })

async function dropAllPayloadIndexes(): Promise<void> {
  const res = await c.execute(
    `SELECT name FROM sqlite_master
     WHERE type='index'
       AND name LIKE '%_idx'
       AND name NOT LIKE 'sqlite_%'`,
  )
  console.log(`Phase 4.35 preflight — dropping ${res.rows.length} Payload index(es)`)
  console.log(`  (Payload will recreate them on next boot; bypasses "index already exists".)\n`)
  let dropped = 0
  for (const row of res.rows) {
    const name = (row as any).name as string
    try {
      await c.execute(`DROP INDEX IF EXISTS "${name}"`)
      dropped++
    } catch (e: any) {
      console.log(`  × ${name}: ${e.message}`)
    }
  }
  console.log(`  ✓ dropped ${dropped}/${res.rows.length} indexes`)
}

await dropAllPayloadIndexes()

console.log(`\n✓ Preflight done.
Next:
  1. Make sure NO 'pnpm --filter cms dev' is running (SQLite lock).
  2. Start CMS with:  PAYLOAD_FORCE_PUSH=true pnpm --filter cms dev
  3. Answer every prompt with the CREATE variant (never rename/drop).
     Expected new tables: authors, authors_social_links.
     Expected altered:    categories (CHECK on 'module' gains 'blog').
     Expected added cols: payload_locked_documents_rels.authors_id,
                          payload_preferences_rels.authors_id.
  4. After CMS boots without errors, re-run:
        pnpm tsx src/scripts/phase4.35-diagnose.ts
     Any remaining "NO" line → run phase4.35-finalize.ts.
`)

process.exit(0)
