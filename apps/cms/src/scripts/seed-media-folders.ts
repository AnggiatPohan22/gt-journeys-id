/**
 * Seed the media folder tree (Phase 4.60).
 *
 * Pre-creates the Payload native `payload-folders` structure so the media
 * library shows the organization even before any content is uploaded:
 *
 *   Uncategorized
 *   Tours ├─ Featured └─ Gallery
 *   Accommodations ├─ Featured └─ Gallery
 *   ... (all 9 services + Blog + Pages)
 *
 * Idempotent: find-or-create by (name, parent). Safe to re-run — the same
 * find-or-create logic backs the assignMediaFolder afterChange hook, so the
 * two never fight over duplicates.
 *
 * Run (stop `pnpm dev` first — SQLite single-writer lock):
 *   cd apps/cms && pnpm seed:media-folders
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  MEDIA_FOLDER_MODULES,
  MEDIA_FOLDER_UNCATEGORIZED,
  MEDIA_SUBFOLDER_FEATURED,
  MEDIA_SUBFOLDER_GALLERY,
} from '../config/mediaFolders'

const FOLDERS = 'payload-folders' as const
const log = (msg: string) => process.stdout.write(`${msg}\n`)

/** Retry a write a few times to ride out SQLite BUSY locks (dev server may
 * hold the single writer). Idempotent callers only. */
async function withRetry<T>(fn: () => Promise<T>, label: string, tries = 6): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const wait = 250 * (i + 1)
      process.stdout.write(`  … retry ${label} (${i + 1}/${tries}) after ${wait}ms\n`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw lastErr
}

async function main() {
  const payload = await getPayload({ config })

  async function findOrCreate(
    name: string,
    parentId: number | string | null,
  ): Promise<{ id: number | string; created: boolean }> {
    const existing = await withRetry(
      () =>
        payload.find({
          collection: FOLDERS,
          depth: 0,
          limit: 1,
          pagination: false,
          where: {
            and: [
              { name: { equals: name } },
              parentId == null
                ? { folder: { exists: false } }
                : { folder: { equals: parentId } },
            ],
          },
        }),
      `find ${name}`,
    )
    if (existing.docs[0]) return { id: existing.docs[0].id, created: false }
    const created = await withRetry(
      () =>
        payload.create({
          collection: FOLDERS,
          data: { name, folder: parentId ?? null, folderType: ['media'] } as any,
          depth: 0,
        }),
      `create ${name}`,
    )
    return { id: created.id, created: true }
  }

  let created = 0
  const note = (label: string, r: { created: boolean }) => {
    if (r.created) created++
    log(`  ${r.created ? '＋' : '·'} ${label}`)
  }

  log('Seeding media folders…')

  // Root "Uncategorized" bucket.
  note(MEDIA_FOLDER_UNCATEGORIZED, await findOrCreate(MEDIA_FOLDER_UNCATEGORIZED, null))

  // Module folders + Featured/Gallery sub-folders.
  for (const mod of MEDIA_FOLDER_MODULES) {
    const root = await findOrCreate(mod.name, null)
    note(mod.name, root)
    const featured = await findOrCreate(MEDIA_SUBFOLDER_FEATURED, root.id)
    note(`${mod.name} / ${MEDIA_SUBFOLDER_FEATURED}`, featured)
    const gallery = await findOrCreate(MEDIA_SUBFOLDER_GALLERY, root.id)
    note(`${mod.name} / ${MEDIA_SUBFOLDER_GALLERY}`, gallery)
  }

  log(`Done. ${created} folder(s) created (rest already existed).`)
  process.exit(0)
}

main().catch((err) => {
  process.stderr.write(`${(err as Error).stack ?? err}\n`)
  process.exit(1)
})
