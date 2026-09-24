import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import {
  MEDIA_SUBFOLDER_FEATURED,
  MEDIA_SUBFOLDER_GALLERY,
  isModuleDisabled,
  mediaFolderForSlug,
} from '../config/mediaFolders'

/**
 * assignMediaFolder — afterChange hook factory (Phase 4.60).
 *
 * When a service/blog doc is saved, routes its uploaded images into the
 * module's media folder so the library stays organized automatically:
 *
 *   featuredImage        → <Module> / Featured
 *   gallery[].image      → <Module> / Gallery
 *
 * Rules:
 *   - Only touches media that has NO folder yet. A manual placement (user
 *     dragged an image into another folder) is never overridden.
 *   - Folders are find-or-created on demand (idempotent), so it also works
 *     if the seed script never ran.
 *   - Failures are logged, never thrown — image organization must never
 *     block a content save.
 *
 * Field names (`featuredImage`, `gallery[].image`) are consistent across all
 * service collections + Posts; override via opts if a collection differs.
 */

const FOLDERS = 'payload-folders' as const

type Opts = {
  /** Top-level upload field(s) treated as "featured". Default: ['featuredImage']. */
  featuredFields?: string[]
  /** Array field(s) whose rows hold a gallery image. Default: [{ array:'gallery', field:'image' }]. */
  galleryPaths?: Array<{ array: string; field: string }>
}

const toId = (v: unknown): number | string | null => {
  if (v == null) return null
  if (typeof v === 'number' || typeof v === 'string') return v
  if (typeof v === 'object' && 'id' in (v as any)) return (v as any).id ?? null
  return null
}

const collectFeatured = (doc: any, fields: string[]): Array<number | string> => {
  const ids: Array<number | string> = []
  for (const f of fields) {
    const id = toId(doc?.[f])
    if (id != null) ids.push(id)
  }
  return ids
}

const collectGallery = (
  doc: any,
  paths: Array<{ array: string; field: string }>,
): Array<number | string> => {
  const ids: Array<number | string> = []
  for (const { array, field } of paths) {
    const rows = doc?.[array]
    if (!Array.isArray(rows)) continue
    for (const row of rows) {
      const id = toId(row?.[field])
      if (id != null) ids.push(id)
    }
  }
  return ids
}

/** Find a folder by name + parent, or create it. Scoped to media. */
async function findOrCreateFolder(
  req: PayloadRequest,
  name: string,
  parentId: number | string | null,
): Promise<number | string> {
  const { payload } = req
  const existing = await payload.find({
    collection: FOLDERS,
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { name: { equals: name } },
        parentId == null ? { folder: { exists: false } } : { folder: { equals: parentId } },
      ],
    },
  })
  if (existing.docs[0]) return existing.docs[0].id
  const created = await payload.create({
    collection: FOLDERS,
    data: { name, folder: parentId ?? null, folderType: ['media'] } as any,
    depth: 0,
    req,
  })
  return created.id
}

/** Assign folder to each media id that currently has none. */
async function assignFolder(
  req: PayloadRequest,
  ids: Array<number | string>,
  folderId: number | string,
): Promise<void> {
  const { payload } = req
  for (const id of ids) {
    const media = await payload
      .findByID({ collection: 'media', id, depth: 0, req })
      .catch(() => null)
    // Respect manual placement: only fill an empty folder slot.
    if (media && toId((media as any).folder) == null) {
      await payload.update({
        collection: 'media',
        id,
        data: { folder: folderId } as any,
        depth: 0,
        req,
      })
    }
  }
}

export const assignMediaFolder = (
  collectionSlug: string,
  opts: Opts = {},
): CollectionAfterChangeHook => {
  const featuredFields = opts.featuredFields ?? ['featuredImage']
  const galleryPaths = opts.galleryPaths ?? [{ array: 'gallery', field: 'image' }]

  return async ({ doc, req }) => {
    const module = mediaFolderForSlug(collectionSlug)
    if (!module) return doc

    try {
      // Respect module kill-switch: a disabled module's folder is hidden and
      // its images belong in Uncategorized — so don't auto-route into it.
      const features = await req.payload
        .findGlobal({ slug: 'site-features', depth: 0, req })
        .catch(() => null)
      if (isModuleDisabled(collectionSlug, (features as any)?.modules)) return doc

      const featuredIds = collectFeatured(doc, featuredFields)
      const galleryIds = collectGallery(doc, galleryPaths)
      if (!featuredIds.length && !galleryIds.length) return doc

      const rootId = await findOrCreateFolder(req, module.name, null)

      if (featuredIds.length) {
        const featuredId = await findOrCreateFolder(req, MEDIA_SUBFOLDER_FEATURED, rootId)
        await assignFolder(req, featuredIds, featuredId)
      }
      if (galleryIds.length) {
        const galleryId = await findOrCreateFolder(req, MEDIA_SUBFOLDER_GALLERY, rootId)
        await assignFolder(req, galleryIds, galleryId)
      }
    } catch (err) {
      req.payload.logger.error({
        msg: `[assignMediaFolder] ${collectionSlug}: ${(err as Error).message}`,
      })
    }
    return doc
  }
}
