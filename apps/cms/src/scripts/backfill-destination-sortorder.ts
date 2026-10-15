/**
 * Phase 3.23.1 — backfill sortOrder Destinations.
 *
 * 6 destinasi awal semua ber-sortOrder 0. Script ini memberi nilai berurutan
 * 1..N (urut by id, stabil). Setelah ini, swap otomatis (hook autoSortOrder)
 * berlaku normal saat sortOrder diubah manual di admin.
 *
 * `context.skipSortOrder` dipakai supaya penulisan langsung tidak memicu logika
 * swap hook selama backfill.
 *
 * Idempotent-ish: aman dijalankan berulang (menormalkan ulang jadi 1..N by id).
 * Matikan `pnpm dev` CMS dulu (lock SQLite).
 *
 * Jalankan:  pnpm tsx src/scripts/backfill-destination-sortorder.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

const run = async () => {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'destinations', sort: 'id', limit: 500, depth: 0 })
  log(`— Backfill sortOrder untuk ${res.docs.length} destinasi —`)
  let n = 1
  for (const d of res.docs as any[]) {
    const target = n++
    if (d.sortOrder === target) {
      log(`  · "${d.name}" sudah sortOrder=${target} — skip`)
      continue
    }
    await payload.update({
      collection: 'destinations',
      id: d.id,
      data: { sortOrder: target },
      overrideAccess: true,
      context: { skipSortOrder: true },
    })
    log(`  ✓ "${d.name}" → sortOrder=${target}`)
  }
  log('Selesai.')
  process.exit(0)
}

run().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`)
  process.exit(1)
})
