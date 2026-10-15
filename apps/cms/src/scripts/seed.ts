/**
 * Seed script — foundation data untuk Destinations & Categories.
 *
 * Idempotent: upsert by slug. Aman dijalankan berulang.
 *
 * Jalankan dengan:  pnpm seed  (dari apps/cms/)
 * NOTE: matikan `pnpm dev` CMS dulu supaya tidak konflik lock SQLite.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

type DestinationSeed = {
  name: string
  slug: string
  type: 'island' | 'mainland'
}

type CategorySeed = {
  name: string
  slug: string
  module: 'tours' | 'accommodations' | 'water-activities' | 'yachts' | 'restaurants' | 'venues' | 'rentals'
}

const destinations: DestinationSeed[] = [
  { name: 'Lembongan', slug: 'lembongan', type: 'island' },
  { name: 'Nusa Penida', slug: 'nusa-penida', type: 'island' },
  { name: 'Mainland Bali', slug: 'mainland-bali', type: 'mainland' },
]

const categories: CategorySeed[] = [
  { name: 'Island Hopping', slug: 'island-hopping', module: 'tours' },
  { name: 'Snorkeling Tour', slug: 'snorkeling-tour', module: 'tours' },
  { name: 'Cultural Tour', slug: 'cultural-tour', module: 'tours' },
]

const seed = async () => {
  const payload = await getPayload({ config })

  log('— Seeding Destinations —')
  // Phase 3.23: `type` kini relationship ke destination-types. Resolve id by slug.
  // Prasyarat: jalankan `seed-destination-types.ts` dulu agar tipe Island/Mainland ada.
  const typeIdBySlug: Record<string, number | string> = {}
  for (const slug of ['island', 'mainland']) {
    const t = await payload.find({ collection: 'destination-types', where: { slug: { equals: slug } }, limit: 1 })
    if (t.docs.length > 0) typeIdBySlug[slug] = t.docs[0].id
  }
  for (const dest of destinations) {
    const existing = await payload.find({
      collection: 'destinations',
      where: { slug: { equals: dest.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  · "${dest.name}" already exists (id=${existing.docs[0].id}) — skipped`)
      continue
    }
    const typeId = typeIdBySlug[dest.type]
    if (!typeId) {
      log(`  ⚠ Tipe "${dest.type}" belum ada — jalankan seed-destination-types.ts dulu. Skip "${dest.name}".`)
      continue
    }
    const created = await payload.create({
      collection: 'destinations',
      data: { name: dest.name, slug: dest.slug, type: typeId, status: 'published' },
    })
    log(`  ✓ Created "${created.name}" (id=${created.id})`)
  }

  log('— Seeding Categories —')
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  · "${cat.name}" already exists (id=${existing.docs[0].id}) — skipped`)
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: { ...cat, status: 'published' },
    })
    log(`  ✓ Created "${created.name}" (id=${created.id})`)
  }

  log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  process.stderr.write(`[seed] FAILED: ${err instanceof Error ? err.stack : String(err)}\n`)
  process.exit(1)
})
