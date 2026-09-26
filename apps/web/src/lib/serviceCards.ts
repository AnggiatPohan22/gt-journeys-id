/**
 * Phase 4.61.1 — resolve desain kartu per-service dari Global site-features.
 *
 * Single source of truth: Settings → Pengaturan Fitur → Modul Layanan.
 * Desain disimpan di `site-features.modules.<moduleKey>Design`. Helper ini
 * menerima raw global (hasil getSiteFeatures) dan mengembalikan variant kartu
 * untuk sebuah serviceType (slug collection frontend).
 *
 * Menggantikan logika cardVariant per-block (field itu kini deprecated) dan
 * hardcode ferry→ticket dari Phase 4.61.
 */
export type CardVariant = 'compact' | 'detailed' | 'ticket'

/** serviceType (slug collection) → moduleKey (SiteFeatures/SERVICE_MODULES). */
const SERVICE_TYPE_TO_MODULE: Record<string, string> = {
  tours: 'tours',
  accommodations: 'accommodations',
  'water-activities': 'waterActivities',
  yachts: 'yacht',
  restaurants: 'restaurants',
  venues: 'weddings',
  rentals: 'rentals',
  spa: 'spa',
  'ferry-tickets': 'ferryTickets',
}

/**
 * @param serviceType slug collection, mis. 'ferry-tickets', 'tours'.
 * @param rawFeatures hasil getSiteFeatures() (boleh null).
 */
export function resolveCardVariant(serviceType: string, rawFeatures: any): CardVariant {
  const moduleKey = SERVICE_TYPE_TO_MODULE[serviceType]
  const v = moduleKey ? rawFeatures?.modules?.[`${moduleKey}Design`] : undefined
  if (v === 'compact' || v === 'detailed' || v === 'ticket') return v
  // Fallback aman bila belum diset: ferry → ticket, lainnya → compact.
  return serviceType === 'ferry-tickets' ? 'ticket' : 'compact'
}
