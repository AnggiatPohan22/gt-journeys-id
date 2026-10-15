import type { CollectionBeforeChangeHook } from 'payload'

/**
 * autoSortOrder — beforeChange hook untuk collection ber-`sortOrder`.
 *
 * - CREATE tanpa sortOrder → auto `max(sortOrder) + 1`.
 * - UPDATE dengan sortOrder yang bentrok dengan doc lain → SWAP: doc lain
 *   diberi nilai sortOrder lama milik doc ini (tukar posisi), sehingga tidak
 *   ada dua doc dengan sortOrder sama.
 *
 * Guard `context.skipSortOrder` mencegah swap memicu hook lagi (infinite loop).
 * Generic terhadap collection — `collectionSlug` diambil dari args.
 */
export const autoSortOrder: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
  collection,
  context,
}) => {
  if (context?.skipSortOrder) return data

  const payload = req.payload
  const slug = collection?.slug
  if (!slug) return data

  // ── CREATE: isi otomatis kalau kosong ──
  if (operation === 'create') {
    if (data.sortOrder === undefined || data.sortOrder === null) {
      const res = await payload.find({
        collection: slug as any,
        sort: '-sortOrder',
        limit: 1,
        depth: 0,
      })
      const max = (res.docs[0] as any)?.sortOrder ?? 0
      data.sortOrder = max + 1
    }
    return data
  }

  // ── UPDATE: swap kalau nilai baru bentrok ──
  if (
    operation === 'update' &&
    data.sortOrder !== undefined &&
    data.sortOrder !== null &&
    originalDoc &&
    data.sortOrder !== originalDoc.sortOrder
  ) {
    const target = data.sortOrder
    const conflict = await payload.find({
      collection: slug as any,
      where: {
        sortOrder: { equals: target },
        id: { not_equals: originalDoc.id },
      },
      limit: 1,
      depth: 0,
    })
    const other = conflict.docs[0] as any
    if (other) {
      await payload.update({
        collection: slug as any,
        id: other.id,
        data: { sortOrder: originalDoc.sortOrder },
        context: { skipSortOrder: true },
        overrideAccess: true,
      })
    }
  }

  return data
}
