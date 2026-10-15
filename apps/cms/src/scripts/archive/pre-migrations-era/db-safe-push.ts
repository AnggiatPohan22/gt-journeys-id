// db-safe-push.ts — one-command safe schema push for Payload/SQLite.
//
// Runs the full "add-a-collection-without-500-errors" workflow every
// time (all steps are idempotent so re-running is safe):
//
//   1. Guard: fail loudly if CMS is running (port 3030 in use) — the
//      SQLite exclusive lock would corrupt this run.
//   2. Backup DB with timestamp suffix (rollback path if anything goes
//      sideways).
//   3. Preflight: drop every Payload `*_idx` index. Payload's push calls
//      CREATE INDEX without IF NOT EXISTS, so any pre-existing index
//      from a previous boot halts the whole push. Dropping them all
//      lets push recreate cleanly.
//   4. Single-process push: init Payload once, in this process, with
//      push forced to true. No parallel RSC race like `next dev` has.
//      Interactive y/N prompts for data-loss warnings still surface —
//      answer them in the same terminal.
//   5. Auto-finalize: read the resolved config's collection slugs, and
//      for every slug make sure the two central join tables
//      (`payload_locked_documents_rels` and `payload_preferences_rels`)
//      have a `<slug>_id` FK column + matching index. Payload's push
//      sometimes skips these on newly-added collections (the exact bug
//      that caused the 500 on Authors and NewsletterSubscribers before).
//
// Usage:
//   cd apps/cms
//   pnpm schema:safe-push
//
// Prerequisites:
//   - CMS process stopped (Ctrl+C `pnpm dev`).
//   - Working tree contains the new/changed collection you want pushed.

import { createClient } from '@libsql/client'
import { copyFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')

// ── Step 1: port-in-use guard ───────────────────────────────────
async function assertPortFree(port: number): Promise<void> {
  const inUse = await new Promise<boolean>((resolve) => {
    const s = net.createServer()
    s.once('error', (err: any) => resolve(err?.code === 'EADDRINUSE'))
    s.once('listening', () => s.close(() => resolve(false)))
    s.listen(port, '127.0.0.1')
  })
  if (inUse) {
    console.error(`\n✗ Port ${port} is in use — CMS is likely running. Stop it (Ctrl+C) before running this script.\n`)
    process.exit(1)
  }
}

console.log('▶ db-safe-push — Step 1/5: checking port 3030 is free')
await assertPortFree(3030)
console.log('  ✓ port 3030 free\n')

// ── Step 2: backup DB ───────────────────────────────────────────
const backupPath = `${dbPath}.bak-safe-push-${Date.now()}`
console.log('▶ db-safe-push — Step 2/5: backing up DB')
await copyFile(dbPath, backupPath)
console.log(`  ✓ backup → ${path.basename(backupPath)}\n`)

// ── Step 3: preflight (drop indexes) ────────────────────────────
console.log('▶ db-safe-push — Step 3/5: dropping Payload indexes (they will be recreated by push)')
const c = createClient({ url: `file:${dbPath}` })

async function dropAllPayloadIndexes(): Promise<void> {
  const res = await c.execute(
    `SELECT name FROM sqlite_master
     WHERE type='index'
       AND name LIKE '%_idx'
       AND name NOT LIKE 'sqlite_%'`,
  )
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
  console.log(`  ✓ dropped ${dropped}/${res.rows.length} indexes\n`)
}

await dropAllPayloadIndexes()

// ── Step 4: single-process push (with idempotent-DDL client wrap) ──
// Force schema push for this process, before the config is imported
// (the adapter reads process.env at module-eval time).
process.env.PAYLOAD_FORCE_PUSH = 'true'
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'

console.log('▶ db-safe-push — Step 4/5: initializing Payload with push=true (single process, no race)')
console.log('  Client.execute is wrapped to add IF NOT EXISTS on CREATE INDEX,')
console.log('  so Payload push emitting the same index twice no longer crashes.')
console.log('  (Data-loss warnings will still prompt for y/N — answer in this terminal.)\n')

const { getPayload } = await import('payload')
const configMod = await import('../payload.config')
const cfg = configMod.default as any
const resolved = typeof cfg?.then === 'function' ? await cfg : cfg

// Force push:true on the resolved adapter (belt-and-braces alongside the env var).
try {
  if (resolved?.db && typeof resolved.db === 'object') {
    resolved.db.push = true
  }
} catch { /* best-effort */ }

// Payload's sqliteAdapter returns { defaultIDType, init: factory }.
// `beforeSchemaInit` is captured from the ORIGINAL args at factory
// construction — modifying `resolved.db.beforeSchemaInit` doesn't
// affect what Payload actually runs. So we wrap `db.init` (the
// factory) to inject our hook into the ADAPTER's own
// `beforeSchemaInit` array before Payload calls `adapter.init()`
// (which is where the hooks fire and where `client` still doesn't
// exist yet — so our hook installs a setter trap on adapter.client).
const installIdempotentDdlTrap = async ({ adapter }: any) => {
    if (!adapter || (adapter as any).__ddlTrapInstalled) return

    const rewrite = (sql: string): string => {
      const re = /^(\s*CREATE\s+(?:UNIQUE\s+)?INDEX\s+)(?!IF\s+NOT\s+EXISTS\b)/i
      return re.test(sql) ? sql.replace(re, '$1IF NOT EXISTS ') : sql
    }

    const rewriteArg = (arg: any): any => {
      if (typeof arg === 'string') return rewrite(arg)
      if (arg && typeof arg === 'object' && typeof arg.sql === 'string') {
        return { ...arg, sql: rewrite(arg.sql) }
      }
      return arg
    }

    const wrapClient = (client: any) => {
      if (!client || (client as any).__ddlWrapped) return client
      if (typeof client.execute === 'function') {
        const originalExecute = client.execute.bind(client)
        client.execute = async (arg: any) => originalExecute(rewriteArg(arg))
      }
      if (typeof client.executeMultiple === 'function') {
        const originalMulti = client.executeMultiple.bind(client)
        client.executeMultiple = async (sql: any) =>
          originalMulti(typeof sql === 'string' ? rewrite(sql) : sql)
      }
      if (typeof client.batch === 'function') {
        const originalBatch = client.batch.bind(client)
        client.batch = async (stmts: any[], mode?: any) => {
          const patched = Array.isArray(stmts) ? stmts.map(rewriteArg) : stmts
          return mode === undefined ? originalBatch(patched) : originalBatch(patched, mode)
        }
      }
      ;(client as any).__ddlWrapped = true
      console.log('  ✓ client.execute / .executeMultiple / .batch wrapped — CREATE INDEX is now idempotent')
      return client
    }

    // If a client already exists at this point (unlikely but safe), wrap it now.
    let stored = adapter.client ? wrapClient(adapter.client) : undefined

    // Install accessor: catch the future `this.client = createClient(...)` set.
    try {
      Object.defineProperty(adapter, 'client', {
        get() { return stored },
        set(value) { stored = wrapClient(value) },
        configurable: true,
        enumerable: true,
      })
      ;(adapter as any).__ddlTrapInstalled = true
      console.log('  ✓ beforeSchemaInit hook fired — client setter trap installed')
    } catch (e) {
      console.warn('  ⚠ could not install DDL trap:', (e as any)?.message)
    }
  }

if (resolved?.db && typeof resolved.db.init === 'function') {
  const originalDbInit = resolved.db.init.bind(resolved.db)
  resolved.db.init = function wrappedDbInit(args: any) {
    const adapter = originalDbInit(args)
    // adapter is the actual DrizzleAdapter instance. Its
    // beforeSchemaInit array is what init() executes.
    if (adapter && typeof adapter === 'object') {
      const existing = Array.isArray(adapter.beforeSchemaInit) ? adapter.beforeSchemaInit : []
      adapter.beforeSchemaInit = [...existing, installIdempotentDdlTrap]
      console.log('  ✓ injected DDL-trap hook into adapter.beforeSchemaInit')
    }
    return adapter
  }
} else {
  console.warn('  ⚠ resolved.db.init not a function — cannot inject DDL trap')
}

try {
  await getPayload({ config: resolved })
  console.log('\n  ✓ Payload push complete')
} catch (err: any) {
  console.error('\n✗ Push failed:', err?.message ?? err)
  if (err?.cause) console.error('  cause:', err?.cause?.message ?? err.cause)
  console.error(`\nDB backup preserved at: ${path.basename(backupPath)}`)
  console.error('To roll back:  cp cms.db.bak-safe-push-<ts> cms.db')
  process.exit(1)
}

// ── Step 5: auto-finalize FK columns ────────────────────────────
// Payload's push occasionally skips adding the per-collection FK column
// to the central rels tables. Detect any missing ones by iterating
// every resolved collection slug and ensuring the two tables have it.
console.log('\n▶ db-safe-push — Step 5/5: verifying FK columns in central rels tables')

const slugs: string[] = ((resolved?.collections ?? []) as any[])
  .map((c: any) => c?.slug)
  .filter((s: unknown): s is string => typeof s === 'string' && s.length > 0)

async function hasColumn(table: string, column: string): Promise<boolean> {
  const res = await c.execute(`PRAGMA table_info("${table}")`)
  return res.rows.some((r) => (r as any).name === column)
}

async function tableExists(table: string): Promise<boolean> {
  const r = await c.execute({
    sql: `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
    args: [table],
  })
  return r.rows.length > 0
}

async function ensureFkAndIndex(relsTable: string, slug: string): Promise<'ok' | 'added' | 'missing-target'> {
  // Payload snake-cases the slug for both table and column names.
  const snake = slug.replace(/-/g, '_')
  const targetTable = snake         // e.g. "ferry_tickets", "authors"
  const fkCol = `${snake}_id`
  const idxName = `${relsTable}_${fkCol}_idx`

  if (!(await tableExists(targetTable))) {
    return 'missing-target'
  }

  let added = false
  if (!(await hasColumn(relsTable, fkCol))) {
    await c.execute(
      `ALTER TABLE "${relsTable}" ADD COLUMN "${fkCol}" INTEGER REFERENCES "${targetTable}"(id) ON UPDATE NO ACTION ON DELETE CASCADE`,
    )
    added = true
    console.log(`  ✓ ${relsTable}.${fkCol} added → ${targetTable}(id)`)
  }

  const idxCheck = await c.execute({
    sql: `SELECT 1 FROM sqlite_master WHERE type='index' AND name = ?`,
    args: [idxName],
  })
  if (idxCheck.rows.length === 0) {
    await c.execute(`CREATE INDEX "${idxName}" ON "${relsTable}"("${fkCol}")`)
    added = true
    console.log(`  ✓ index ${idxName}`)
  }

  return added ? 'added' : 'ok'
}

const relsTables = ['payload_locked_documents_rels', 'payload_preferences_rels']
let totalAdded = 0
const missing: string[] = []

for (const slug of slugs) {
  for (const rels of relsTables) {
    const r = await ensureFkAndIndex(rels, slug)
    if (r === 'added') totalAdded++
    if (r === 'missing-target') missing.push(`${slug} (target table not present)`)
  }
}

if (missing.length > 0) {
  console.log('\n  ⚠ Some collection tables were not created by push:')
  for (const m of missing) console.log(`     ${m}`)
  console.log('     Re-run this script; if it persists, inspect the push output above.')
}

console.log(`\n  ✓ FK verify done — ${totalAdded === 0 ? 'nothing to add' : `added ${totalAdded} column/index entries`}\n`)

console.log('══════════════════════════════════════════════════════')
console.log('✓ db-safe-push complete.')
console.log('')
console.log('Next steps (manual):')
console.log('  1. pnpm --filter cms generate:types')
console.log('  2. pnpm --filter cms dev   (boots normally, push stays OFF by default)')
console.log(`  3. Rollback if needed:  cp ${path.basename(backupPath)} cms.db`)
console.log('══════════════════════════════════════════════════════')

process.exit(0)
