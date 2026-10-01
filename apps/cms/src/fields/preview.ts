/**
 * GtJourneysID — Preview URL helper (Phase 4.9).
 *
 * Turns a per-collection URL base (e.g. `/tour`, `/villa`) into a
 * `admin.preview` function that:
 *   - Returns null unless the doc is published + has a slug → Payload
 *     hides the Preview button. All roles that can read the doc see it.
 *   - Uses SITE_URL (production) with localhost:4321 fallback (Astro dev).
 *   - Trims trailing slash from SITE_URL to avoid `//` in the URL.
 *
 * NOTE (per Phase 4.8): this opens the *published* page (Astro SSG), not
 * unsaved edits. True draft preview needs an Astro hybrid preview route
 * (documented in phase-4.8 §B/C Goal 1 Option B). Not scoped here.
 */
export type PreviewableDoc = {
  slug?: string | null
  status?: string | null
} | null | undefined

export const makePreview = (base: string) => (doc: PreviewableDoc): string | null => {
  if (!doc || doc.status !== 'published' || !doc.slug) return null
  const siteUrl = (process.env.SITE_URL || 'http://localhost:4321').replace(/\/$/, '')
  const path = base.startsWith('/') ? base : `/${base}`
  return `${siteUrl}${path}/${doc.slug}`
}
