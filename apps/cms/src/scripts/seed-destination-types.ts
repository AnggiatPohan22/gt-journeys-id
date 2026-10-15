/**
 * Phase 3.23 — seed + migrate Destination Types.
 *
 * 1) Upsert 2 tipe awal: Island (sortOrder 1), Mainland (sortOrder 2).
 * 2) Set field `type` (relationship) untuk semua destinasi existing berdasarkan
 *    slug → tipe. Deterministik (dari audit) supaya tanpa data loss.
 *
 * Idempotent: aman dijalankan berulang.
 *
 * PRASYARAT: jalankan SETELAH schema push (collection destination-types +
 * kolom destinations.type_id sudah ada). Matikan `pnpm dev` CMS dulu (lock SQLite).
 *
 * Jalankan:  pnpm tsx src/scripts/seed-destination-types.ts   (dari apps/cms/)
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

// Tipe awal.
const types: { name: string; slug: string; sortOrder: number }[] = [
  { name: 'Island', slug: 'island', sortOrder: 1 },
  { name: 'Mainland', slug: 'mainland', sortOrder: 2 },
]

// Mapping destinasi existing (by slug) → tipe (by slug). Dari audit Phase 3.23.
const destTypeMap: Record<string, 'island' | 'mainland'> = {
  'mainland-bali': 'mainland',
  'main-island': 'mainland',
  'nusa-penida': 'island',
  lembongan: 'island',
  'nusa-lembongan': 'island',
  ceningan: 'island',
  'nusa-ceningan': 'island',
  'kelingking-beach': 'island',
  kuta: 'mainland',
  sanur: 'mainland',
  'nusa-dua': 'mainland',
}
// Default untuk destinasi yang tak ada di map (dilog sebagai warning).
const DEFAULT_TYPE_SLUG: 'island' | 'mainland' = 'island'

const run = async () => {
  const payload = await getPayload({ config })

  // ── 1. Upsert tipe ──
  log('— Seeding Destination Types —')
  const typeIdBySlug: Record<string, number | string> = {}
  for (const t of types) {
    const existing = await payload.find({
      collection: 'destination-types',
      where: { slug: { equals: t.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      typeIdBySlug[t.slug] = existing.docs[0].id
      log(`  · "${t.name}" sudah ada (id=${existing.docs[0].id}) — skip`)
      continue
    }
    const created = await payload.create({
      collection: 'destination-types',
      data: { name: t.name, slug: t.slug, isActive: true, sortOrder: t.sortOrder },
    })
    typeIdBySlug[t.slug] = created.id
    log(`  ✓ Created "${created.name}" (id=${created.id})`)
  }

  // ── 2. Assign type ke destinasi existing ──
  log('— Assigning type ke Destinations —')
  const dests = await payload.find({ collection: 'destinations', limit: 200, depth: 0 })
  for (const d of dests.docs as any[]) {
    // Sudah punya type (relationship terisi) → skip.
    if (d.type) {
      log(`  · "${d.name}" sudah punya type — skip`)
      continue
    }
    const wantSlug = destTypeMap[d.slug] ?? DEFAULT_TYPE_SLUG
    if (!destTypeMap[d.slug]) {
      log(`  ⚠ "${d.name}" (slug=${d.slug}) tak ada di map → default "${wantSlug}". Cek manual di admin.`)
    }
    const typeId = typeIdBySlug[wantSlug]
    await payload.update({
      collection: 'destinations',
      id: d.id,
      data: { type: typeId },
      overrideAccess: true,
    })
    log(`  ✓ "${d.name}" → type "${wantSlug}" (id=${typeId})`)
  }

  log('Selesai.')
  process.exit(0)
}

run().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`)
  process.exit(1)
})
