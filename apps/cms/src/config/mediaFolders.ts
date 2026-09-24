/**
 * Media folder taxonomy — single source of truth (Phase 4.60).
 *
 * Drives BOTH:
 *   1. `scripts/seed-media-folders.ts` — pre-creates the folder tree so the
 *      structure is visible in the CMS even before any content is saved.
 *   2. `hooks/assignMediaFolder.ts` — routes uploads from a service/page
 *      into its module folder (featuredImage → Featured, gallery → Gallery)
 *      when the media has no folder yet (manual placement is never touched).
 *
 * Folder names here are the human-facing labels shown in the media library.
 * Rename a label in ONE place and both the seed + the hook follow.
 *
 * Folder model (Payload native `payload-folders`):
 *   <Module>              ← main/top-level folder (folderType: ['media'])
 *     ├── Featured        ← sub-folder for hero/featured images
 *     └── Gallery         ← sub-folder for gallery + secondary images
 */

/** Sub-folders created under every module folder. */
export const MEDIA_SUBFOLDER_FEATURED = 'Featured'
export const MEDIA_SUBFOLDER_GALLERY = 'Gallery'

/** Root bucket for media that hasn't been placed into any folder. */
export const MEDIA_FOLDER_UNCATEGORIZED = 'Uncategorized'

export type MediaFolderModule = {
  /** Collection slug this folder belongs to. */
  slug: string
  /** Human-facing folder label (top-level). */
  name: string
  /** Whether the auto-routing hook targets this module. */
  autoRoute: boolean
  /**
   * SiteFeatures `modules.<key>` toggle that governs this module, if any.
   * When that toggle is OFF the folder + subfolders are hidden from the
   * media library and its images are moved to Uncategorized.
   * NOTE: keys differ from slugs — e.g. yachts→`yacht`, venues→`weddings`,
   * water-activities→`waterActivities`, ferry-tickets→`ferryTickets`.
   * Pages & Blog are not service modules → no featureKey (always shown).
   */
  featureKey?: string
}

/**
 * Modules that get a dedicated media folder.
 * `autoRoute: true` → the afterChange hook moves its uploads into the folder.
 * Pages relies on blocks/SEO for imagery (deeply nested + variable), so it
 * gets a folder for manual organization but no auto-routing.
 */
export const MEDIA_FOLDER_MODULES: MediaFolderModule[] = [
  { slug: 'tours', name: 'Tours', autoRoute: true, featureKey: 'tours' },
  { slug: 'accommodations', name: 'Accommodations', autoRoute: true, featureKey: 'accommodations' },
  { slug: 'water-activities', name: 'Water Activities', autoRoute: true, featureKey: 'waterActivities' },
  { slug: 'yachts', name: 'Yachts', autoRoute: true, featureKey: 'yacht' },
  { slug: 'restaurants', name: 'Restaurants', autoRoute: true, featureKey: 'restaurants' },
  { slug: 'venues', name: 'Venues', autoRoute: true, featureKey: 'weddings' },
  { slug: 'rentals', name: 'Rentals', autoRoute: true, featureKey: 'rentals' },
  { slug: 'spa', name: 'Spa', autoRoute: true, featureKey: 'spa' },
  { slug: 'ferry-tickets', name: 'Ferry Tickets', autoRoute: true, featureKey: 'ferryTickets' },
  { slug: 'posts', name: 'Blog', autoRoute: true },
  { slug: 'pages', name: 'Pages', autoRoute: false },
]

/** Lookup a module folder config by collection slug. */
export const mediaFolderForSlug = (slug: string): MediaFolderModule | undefined =>
  MEDIA_FOLDER_MODULES.find((m) => m.slug === slug)

/**
 * Given a SiteFeatures `modules` object ({ tours: true, yacht: false, ... }),
 * return the folder NAMES whose module is disabled. A missing key = enabled
 * (defaultValue true). Used by the sidebar (hide) + the sync hook (move to
 * Uncategorized).
 */
export const disabledModuleFolderNames = (
  modules: Record<string, unknown> | null | undefined,
): string[] => {
  if (!modules) return []
  return MEDIA_FOLDER_MODULES.filter(
    (m) => m.featureKey && modules[m.featureKey] === false,
  ).map((m) => m.name)
}

/** True when the module for a collection slug is disabled per SiteFeatures. */
export const isModuleDisabled = (
  slug: string,
  modules: Record<string, unknown> | null | undefined,
): boolean => {
  const mod = mediaFolderForSlug(slug)
  if (!mod?.featureKey || !modules) return false
  return modules[mod.featureKey] === false
}
