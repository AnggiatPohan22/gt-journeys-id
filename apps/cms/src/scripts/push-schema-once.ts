// Push schema ONCE, out-of-band from `pnpm dev`.
//
// Why: Payload's Next.js dev integration fires multiple parallel RSC
// calls at cold start. Each one calls getPayload({ config }) → each
// tries pushDevSchema → they race → "index already exists" crashes.
// Phase 4.25 fixed this by keeping push:false in the config, but that
// leaves us with no way to push new schema when we add collections.
//
// This script bypasses the race entirely: single process, single init,
// push runs once. Force-enables push via env var override in the
// adapter's env-driven config (see below).
//
// Usage:
//   1. Stop CMS (Ctrl+C).
//   2. Ensure payload.config.ts has push:false (the default post-4.25).
//   3. Run:  cd apps/cms && pnpm tsx src/scripts/push-schema-once.ts
//   4. Wait for "✓ schema push done — safe to start pnpm dev".
//   5. cd apps/cms && pnpm dev  → boot normally.

// Force schema push for this one process, before the config is imported.
process.env.PAYLOAD_FORCE_PUSH = 'true'
process.env.NODE_ENV = 'development'

// Dynamically import so the env override above is in place when the
// config module reads it.
const { getPayload } = await import('payload')
const configMod = await import('../payload.config')

// Monkey-patch the adapter's push flag. The config exports a resolved
// buildConfig() call — we tweak the db adapter's push option in place
// before init picks it up.
const cfg = configMod.default as any
const resolved = typeof cfg?.then === 'function' ? await cfg : cfg
try {
  if (resolved?.db && typeof resolved.db === 'object') {
    resolved.db.push = true
  }
} catch { /* best-effort */ }

console.log('Pushing schema... (single-process, no race)')
try {
  await getPayload({ config: resolved })
  console.log('\n✓ schema push done — safe to start pnpm dev.')
  process.exit(0)
} catch (err: any) {
  console.error('\n✗ schema push failed:', err?.message ?? err)
  if (err?.cause) console.error('cause:', err.cause?.message ?? err.cause)
  process.exit(1)
}
