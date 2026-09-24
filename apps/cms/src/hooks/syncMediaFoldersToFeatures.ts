import type { GlobalAfterChangeHook } from 'payload'
import { disabledModuleFolderNames } from '../config/mediaFolders'

/**
 * syncMediaFoldersToFeatures — SiteFeatures afterChange hook (Phase 4.61).
 *
 * When a service module is turned OFF, its media folder + subfolders are
 * hidden from the library. To keep those images reachable, this moves every
 * image inside a disabled module's folder (root + Featured/Gallery) back to
 * Uncategorized (folder = null).
 *
 * Idempotent: runs on every SiteFeatures save; once a folder is emptied there
 * is nothing left to move. Re-enabling a module does NOT pull images back
 * (they stay in Uncategorized) — by design. The empty module folder is left
 * in place so it reappears (empty) when the module is re-enabled.
 *
 * Failures are logged, never thrown — a toggle save must not break.
 */
const FOLDERS = 'payload-folders' as const

export const syncMediaFoldersToFeatures: GlobalAfterChangeHook = async ({ doc, req }) => {
  const { payload } = req
  try {
    const disabledNames = disabledModuleFolderNames((doc as any)?.modules)
    if (!disabledNames.length) return doc

    for (const name of disabledNames) {
      // Root folder for this module (top-level, media-scoped).
      const rootRes = await payload.find({
        collection: FOLDERS,
        depth: 0,
        limit: 1,
        pagination: false,
        req,
        where: {
          and: [{ name: { equals: name } }, { folder: { exists: false } }],
        },
      })
      const root = rootRes.docs[0]
      if (!root) continue

      // Its subfolders (Featured / Gallery).
      const subRes = await payload.find({
        collection: FOLDERS,
        depth: 0,
        limit: 100,
        pagination: false,
        req,
        where: { folder: { equals: root.id } },
      })
      const folderIds = [root.id, ...subRes.docs.map((d) => d.id)]

      // Move all media in those folders to Uncategorized (folder = null).
      await payload.update({
        collection: 'media',
        where: { folder: { in: folderIds } },
        data: { folder: null } as any,
        depth: 0,
        req,
      })
    }
  } catch (err) {
    payload.logger.error({
      msg: `[syncMediaFoldersToFeatures] ${(err as Error).message}`,
    })
  }
  return doc
}
