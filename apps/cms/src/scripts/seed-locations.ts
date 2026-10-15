/**
 * Phase 4.61 (Stage 2) — seed + backfill Locations.
 *
 * 1) Upsert 4 lokasi awal (persis opsi lama: Batam, Tanjung Pinang, Singapore,
 *    Malaysia) dengan terminalName contoh.
 * 2) Backfill relationship di Ferry Tickets existing:
 *    - originLocation / arrivalLocation  ← dari enum origin / arrival
 *    - scheduleTime[].departureLocation / arrivalLocation ← dari departurePort / arrivalPort
 *
 * Idempotent: aman dijalankan berulang (skip yang sudah terisi).
 *
 * PRASYARAT: jalankan SETELAH migration Stage 1 (collection locations + kolom
 * *_location_id sudah ada). Matikan `pnpm dev` CMS dulu (lock SQLite).
 *
 * Jalankan:  pnpm tsx src/scripts/seed-locations.ts   (dari apps/cms/)
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

// Lokasi awal — value = slug lama enum, agar backfill deterministik.
const locations: {
  slug: string
  name: string
  terminalName: string
  country: string
  code: string
  sortOrder: number
}[] = [
  { slug: 'batam',         name: 'Batam',          terminalName: 'Batam Centre Terminal-BTC',            country: 'Indonesia', code: 'BTM', sortOrder: 1 },
  { slug: 'tanjungpinang', name: 'Tanjung Pinang', terminalName: 'Sri Bintan Pura Terminal',             country: 'Indonesia', code: 'TNJ', sortOrder: 2 },
  { slug: 'singapore',     name: 'Singapore',      terminalName: 'Singapore Cruise Center (HarbourFront)', country: 'Singapore', code: 'SIN', sortOrder: 3 },
  { slug: 'malaysia',      name: 'Malaysia',       terminalName: 'Stulang Laut / Puteri Harbour',        country: 'Malaysia',  code: 'MYS', sortOrder: 4 },
]

const run = async () => {
  const payload = await getPayload({ config })

  // ── 1. Upsert lokasi ──
  log('— Seeding Locations —')
  const locIdBySlug: Record<string, number | string> = {}
  for (const l of locations) {
    const existing = await payload.find({
      collection: 'locations',
      where: { slug: { equals: l.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      locIdBySlug[l.slug] = existing.docs[0].id
      log(`  · "${l.name}" sudah ada (id=${existing.docs[0].id}) — skip`)
      continue
    }
    const created = await payload.create({
      collection: 'locations',
      data: {
        name: l.name,
        slug: l.slug,
        terminalName: l.terminalName,
        country: l.country,
        code: l.code,
        isActive: true,
        sortOrder: l.sortOrder,
      },
      overrideAccess: true,
    })
    locIdBySlug[l.slug] = created.id
    log(`  ✓ Created "${created.name}" (id=${created.id})`)
  }

  // ── 2. Backfill Ferry Tickets ──
  log('— Backfilling Ferry Tickets —')
  const tickets = await payload.find({ collection: 'ferry-tickets', limit: 500, depth: 0 })
  for (const t of tickets.docs as any[]) {
    const patch: Record<string, unknown> = {}

    // top-level origin/arrival → *Location (hanya kalau relationship masih kosong)
    if (!t.originLocation && t.origin && locIdBySlug[t.origin]) {
      patch.originLocation = locIdBySlug[t.origin]
    }
    if (!t.arrivalLocation && t.arrival && locIdBySlug[t.arrival]) {
      patch.arrivalLocation = locIdBySlug[t.arrival]
    }

    // scheduleTime[] port → *Location
    if (Array.isArray(t.scheduleTime) && t.scheduleTime.length > 0) {
      let touched = false
      const newSchedule = t.scheduleTime.map((row: any) => {
        const r = { ...row }
        if (!r.departureLocation && r.departurePort && locIdBySlug[r.departurePort]) {
          r.departureLocation = locIdBySlug[r.departurePort]
          touched = true
        }
        if (!r.arrivalLocation && r.arrivalPort && locIdBySlug[r.arrivalPort]) {
          r.arrivalLocation = locIdBySlug[r.arrivalPort]
          touched = true
        }
        return r
      })
      if (touched) patch.scheduleTime = newSchedule
    }

    if (Object.keys(patch).length === 0) {
      log(`  · "${t.title}" (id=${t.id}) — tidak ada yang perlu di-backfill`)
      continue
    }
    await payload.update({
      collection: 'ferry-tickets',
      id: t.id,
      data: patch,
      overrideAccess: true,
    })
    log(`  ✓ "${t.title}" (id=${t.id}) → ${Object.keys(patch).join(', ')}`)
  }

  log('Selesai.')
  process.exit(0)
}

run().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`)
  process.exit(1)
})
