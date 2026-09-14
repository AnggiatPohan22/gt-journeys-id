/**
 * Related Posts — selection algorithm.
 *
 * Resolves the final list of "You Might Also Like" posts for a given
 * article, merging the global BlogSettings.relatedPosts defaults with
 * an optional per-post `relatedOverride` group from the Posts collection.
 *
 * Selection modes:
 *   - same-category  → same category, exclude current, fill w/ latest
 *   - same-tags      → any matching tag, exclude current, fill w/ latest
 *   - same-author    → same author, exclude current, fill w/ latest
 *   - latest         → newest published, exclude current
 *   - manual         → per-post `manualPosts` picks (order preserved),
 *                       no fill — hides section if empty
 *
 * Never fetches the current post as a related item. Fallback to
 * latest ensures the section stays populated when the primary query
 * returns fewer than `limit`.
 */

import { getPosts } from './payload'

export interface RelatedConfig {
  enabled: boolean
  heading: string
  subtitle: string
  selectionMode: 'same-category' | 'same-tags' | 'same-author' | 'latest' | 'manual'
  limit: number
  columns: '2' | '3' | '4'
  cardVariant: 'compact' | 'detailed' | 'horizontal'
  showCategory: boolean
  showExcerpt: boolean
  showDate: boolean
  showReadingTime: boolean
  showViewAll: boolean
  viewAllText: string
  viewAllLink: string
  background: 'sand' | 'sand-light' | 'white' | 'ocean-tint' | 'ocean' | 'transparent'
  padding: 'sm' | 'md' | 'lg'
}

const DEFAULT_CONFIG: RelatedConfig = {
  enabled: true,
  heading: 'You Might Also Like',
  subtitle: 'Continue your journey with more insights from our travel editors.',
  selectionMode: 'same-category',
  limit: 3,
  columns: '3',
  cardVariant: 'compact',
  showCategory: true,
  showExcerpt: true,
  showDate: true,
  showReadingTime: false,
  showViewAll: true,
  viewAllText: 'View All Articles',
  viewAllLink: '/blog',
  background: 'sand',
  padding: 'md',
}

const idOf = (v: unknown): number | string | null =>
  v == null ? null : typeof v === 'object' ? ((v as any).id ?? null) : (v as any)

/**
 * Merge global BlogSettings.relatedPosts with per-post override group.
 * Override wins field-by-field only when `relatedOverride.enabled === true`
 * AND the specific field has a truthy value.
 */
export function resolveRelatedConfig(
  globalRelated: any,
  postOverride: any,
): RelatedConfig {
  const g = globalRelated ?? {}
  const overrideActive = postOverride?.enabled === true
  return {
    enabled: g.enabled !== false,
    heading: (overrideActive && postOverride?.heading) || g.heading || DEFAULT_CONFIG.heading,
    subtitle: g.subtitle ?? DEFAULT_CONFIG.subtitle,
    selectionMode: ((overrideActive && postOverride?.selectionMode) || g.selectionMode || DEFAULT_CONFIG.selectionMode) as RelatedConfig['selectionMode'],
    limit: Math.max(1, Math.min(6, Number((overrideActive && postOverride?.limit) || g.limit || DEFAULT_CONFIG.limit))),
    columns: (g.columns || DEFAULT_CONFIG.columns) as RelatedConfig['columns'],
    cardVariant: (g.cardVariant || DEFAULT_CONFIG.cardVariant) as RelatedConfig['cardVariant'],
    showCategory: g.showCategory !== false,
    showExcerpt: g.showExcerpt !== false,
    showDate: g.showDate !== false,
    showReadingTime: g.showReadingTime === true,
    showViewAll: g.showViewAll !== false,
    viewAllText: g.viewAllText || DEFAULT_CONFIG.viewAllText,
    viewAllLink: g.viewAllLink || DEFAULT_CONFIG.viewAllLink,
    background: (g.background || DEFAULT_CONFIG.background) as RelatedConfig['background'],
    padding: (g.padding || DEFAULT_CONFIG.padding) as RelatedConfig['padding'],
  }
}

/**
 * Fetch related posts for a given post using the resolved config.
 * Returns array of post docs (depth=1, published only). Preserves
 * ordering from the source query; manual mode preserves the editor's
 * picked order.
 */
export async function fetchRelatedPosts(opts: {
  currentPost: { id: number | string; category?: any; tags?: any[]; author?: any }
  config: RelatedConfig
  override?: { manualPosts?: any[] } | null
}): Promise<any[]> {
  const { currentPost, config, override } = opts
  const { selectionMode, limit } = config

  // Manual mode — respect editor picks, no fill.
  if (selectionMode === 'manual') {
    const picks = Array.isArray(override?.manualPosts) ? override.manualPosts : []
    return picks
      .filter((p: any) => typeof p === 'object')
      .filter((p: any) => p.id !== currentPost.id)
      .slice(0, limit)
  }

  const currentId = currentPost.id
  let primary: any[] = []

  // Primary query per selection mode.
  if (selectionMode === 'same-category') {
    const catId = idOf(currentPost.category)
    if (catId != null) {
      const { docs } = await getPosts({
        limit: limit + 1,
        where: { category: { equals: catId }, id: { not_equals: currentId } as any },
        sort: '-publishedAt',
      }).catch(() => ({ docs: [] as any[] }))
      primary = docs
    }
  } else if (selectionMode === 'same-tags') {
    const tagIds = (currentPost.tags ?? [])
      .map((t: any) => idOf(t))
      .filter((v: any): v is number | string => v != null)
    if (tagIds.length > 0) {
      const { docs } = await getPosts({
        limit: limit + 1,
        where: { tags: { in: tagIds.join(',') as any }, id: { not_equals: currentId } as any },
        sort: '-publishedAt',
      }).catch(() => ({ docs: [] as any[] }))
      primary = docs
    }
  } else if (selectionMode === 'same-author') {
    const authorId = idOf(currentPost.author)
    if (authorId != null) {
      const { docs } = await getPosts({
        limit: limit + 1,
        where: { author: { equals: authorId }, id: { not_equals: currentId } as any },
        sort: '-publishedAt',
      }).catch(() => ({ docs: [] as any[] }))
      primary = docs
    }
  }
  // 'latest' skips primary; goes straight to fallback.

  let picked = primary.filter((p) => p.id !== currentId).slice(0, limit)

  // Fill with latest (any) if primary short.
  if (picked.length < limit) {
    const { docs: fallback } = await getPosts({
      limit: limit + picked.length + 1,
      sort: '-publishedAt',
    }).catch(() => ({ docs: [] as any[] }))
    const seen = new Set([currentId, ...picked.map((p) => p.id)])
    for (const p of fallback) {
      if (picked.length >= limit) break
      if (!seen.has(p.id)) picked.push(p)
    }
  }

  return picked
}
