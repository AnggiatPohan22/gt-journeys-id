import type { Access } from 'payload'

/**
 * Module gate for service collections (Phase 4.37).
 *
 * SiteFeatures → Modul Layanan hanya berpengaruh kalau collection-nya
 * ikut mengintip toggle itu. Sebelum patch ini, admin/editor tetap
 * melihat & bisa buka koleksi service walau Super Admin mematikannya
 * dari CMS — karena `access.read` di setiap koleksi cuma `() => true`.
 *
 * Kontrak:
 * - Anonymous (frontend SSG fetch): selalu diloloskan — koleksi tetap
 *   publik untuk render statis, meski moduler off (frontend routing
 *   yang memutuskan 404 lewat `isModuleEnabled`).
 * - SEMUA role (super-admin, admin, editor): read/create/update/delete
 *   di-gate `site-features.modules[<moduleKey>]`. False → koleksi
 *   hilang dari sidebar (Payload auto-hide saat read=false) dan direct
 *   URL 403. Super-admin ikut disembunyikan biar tidak bingung; toggle
 *   dinyalakan lagi lewat Settings → Pengaturan Fitur.
 *
 * Kegagalan fetch global → default aman = allow (jangan blokir editor
 * kalau CMS-nya sendiri lagi bermasalah).
 */
export type ServiceModuleKey =
  | 'tours'
  | 'accommodations'
  | 'waterActivities'
  | 'yacht'
  | 'restaurants'
  | 'weddings'
  | 'rentals'
  | 'spa'
  | 'ferryTickets'

const isModuleEnabled = async (
  req: Parameters<Access>[0]['req'],
  key: ServiceModuleKey,
): Promise<boolean> => {
  try {
    const sf = await req.payload.findGlobal({ slug: 'site-features', depth: 0 })
    return (sf as any)?.modules?.[key] !== false
  } catch {
    return true
  }
}

/** Read publik untuk anonymous; semua role (termasuk super-admin) di-gate SiteFeatures. */
export const moduleRead = (key: ServiceModuleKey): Access => async ({ req }) => {
  const user = req.user
  if (!user) return true // frontend SSG fetch tetap boleh
  return isModuleEnabled(req, key)
}

/** Create hanya admin+ DAN module aktif (super-admin ikut kena — biar konsisten dgn sidebar). */
export const moduleCreate = (key: ServiceModuleKey): Access => async ({ req }) => {
  const user = req.user
  if (!user) return false
  if (!['admin', 'super-admin'].includes(user.role)) return false
  return isModuleEnabled(req, key)
}

/** Update untuk user authenticated DAN module aktif. */
export const moduleUpdate = (key: ServiceModuleKey): Access => async ({ req }) => {
  const user = req.user
  if (!user) return false
  return isModuleEnabled(req, key)
}

/** Delete hanya super-admin, tetap patuh pada toggle module. */
export const moduleDelete = (key: ServiceModuleKey): Access => async ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role !== 'super-admin') return false
  return isModuleEnabled(req, key)
}

/** Bundel keempat access function untuk satu module. */
export const moduleAccess = (key: ServiceModuleKey) => ({
  read: moduleRead(key),
  create: moduleCreate(key),
  update: moduleUpdate(key),
  delete: moduleDelete(key),
})
