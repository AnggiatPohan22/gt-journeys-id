// Push schema in a retry loop: each failed CREATE INDEX drops that
// specific index and retries. Push runs single-process (no race).
//
// This is a pragmatic workaround for Payload's schema-push emitting
// non-idempotent CREATE INDEX statements after prior partial pushes.

import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')

async function dropIndex(name: string) {
  const c = createClient({ url: `file:${dbPath}` })
  await c.execute(`DROP INDEX IF EXISTS "${name}"`)
  console.log(`  ⤷ dropped index "${name}"`)
}

process.env.NODE_ENV = 'development'

const MAX_ATTEMPTS = 40
let attempt = 0

while (attempt < MAX_ATTEMPTS) {
  attempt++
  console.log(`\n=== push attempt ${attempt} ===`)
  try {
    // Fresh import so init state resets each attempt
    const { getPayload } = await import('payload')
    const configMod = await import('../payload.config?t=' + Date.now())
    const resolved: any = configMod.default
    try { if (resolved?.db) resolved.db.push = true } catch {}
    await getPayload({ config: resolved })
    console.log('\n✓ schema push done after', attempt, 'attempt(s).')
    process.exit(0)
  } catch (err: any) {
    const msg: string = err?.message ?? String(err)
    const causeMsg: string = err?.cause?.message ?? ''
    const combined = `${msg}\n${causeMsg}`

    // Match "index NAME already exists"
    const idxMatch = combined.match(/index ([A-Za-z0-9_]+) already exists/i)
    if (idxMatch) {
      console.log(`✗ duplicate index detected: ${idxMatch[1]}`)
      await dropIndex(idxMatch[1])
      // Also try to break the payload singleton cache so next attempt
      // does a fresh init.
      try {
        const g: any = globalThis as any
        if (g._payload) g._payload = new Map()
      } catch {}
      continue
    }

    console.error('\n✗ schema push failed (non-retryable):', msg)
    if (causeMsg) console.error('cause:', causeMsg)
    process.exit(1)
  }
}

console.error(`\n✗ Gave up after ${MAX_ATTEMPTS} attempts.`)
process.exit(1)
