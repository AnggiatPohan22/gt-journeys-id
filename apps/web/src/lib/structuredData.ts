/**
 * Structured data (JSON-LD schema.org) builders — dipakai untuk SEO rich
 * results. Semua builder mengembalikan plain object; render via
 * `components/common/StructuredData.astro` atau `Breadcrumbs.astro`.
 *
 * Lihat `docs/reports/service-listing-visual-audit.md` §D-tech.
 */

/** Site origin default (selaras `astro.config.mjs` `site`). */
export const SITE_URL = 'https://dnjourneysbali.com'

/** Absolutize a path/URL terhadap site origin. */
export const absUrl = (path: string, site: string = SITE_URL): string => {
  if (!path) return site
  if (/^https?:\/\//.test(path)) return path
  const base = site.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export interface Crumb {
  name: string
  url: string
}

/** BreadcrumbList — Home › … › current. */
export function breadcrumbListSchema(items: Crumb[], site: string = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.url, site),
    })),
  }
}

/** WebPage — generic CMS page (about, contact, dst). */
export function webPageSchema(opts: {
  name: string
  description?: string
  url: string
  site?: string
}) {
  const s: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    url: absUrl(opts.url, opts.site),
  }
  if (opts.description) s.description = opts.description
  return s
}

/** ItemList — untuk listing/collection page (produk di grid). */
export function itemListSchema(opts: {
  name: string
  description?: string
  urls: string[]
  site?: string
}) {
  const s: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    numberOfItems: opts.urls.length,
    itemListElement: opts.urls.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl(u, opts.site),
    })),
  }
  if (opts.description) s.description = opts.description
  return s
}

/** serviceType (ServiceTypes.key) → schema.org @type untuk detail page. */
export const SERVICE_SCHEMA_TYPE: Record<string, string> = {
  tours: 'TouristTrip',
  accommodations: 'LodgingBusiness',
  'water-activities': 'SportsActivityLocation',
  yachts: 'Product',
  restaurants: 'Restaurant',
  venues: 'EventVenue',
  rentals: 'Product',
  spa: 'HealthAndBeautyBusiness',
  'ferry-tickets': 'TouristTrip',
}

/** serviceType → base route detail (singular canonical). */
export const SERVICE_DETAIL_BASE: Record<string, string> = {
  tours: '/tour',
  accommodations: '/villa',
  'water-activities': '/water-activity',
  yachts: '/yacht',
  restaurants: '/restaurant',
  venues: '/venue',
  rentals: '/rental',
  spa: '/spa',
  'ferry-tickets': '/ferry-tickets',
}

/**
 * Schema untuk satu item service (detail page). Type menyesuaikan serviceType.
 * `offers` ditambahkan hanya kalau ada harga.
 */
export function serviceItemSchema(opts: {
  serviceType: string
  name: string
  description?: string
  url: string
  image?: string
  price?: number | null
  currency?: string
  addressLocality?: string
  ratingValue?: number
  ratingCount?: number
  site?: string
}) {
  const type = SERVICE_SCHEMA_TYPE[opts.serviceType] ?? 'Product'
  const s: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name: opts.name,
    url: absUrl(opts.url, opts.site),
  }
  if (opts.description) s.description = opts.description
  if (opts.image) s.image = absUrl(opts.image, opts.site)
  if (opts.addressLocality) {
    s.address = {
      '@type': 'PostalAddress',
      addressLocality: opts.addressLocality,
      addressRegion: 'Bali',
      addressCountry: 'ID',
    }
  }
  if (typeof opts.price === 'number' && opts.price > 0) {
    s.offers = {
      '@type': 'Offer',
      price: opts.price,
      priceCurrency: opts.currency ?? 'IDR',
      availability: 'https://schema.org/InStock',
      url: absUrl(opts.url, opts.site),
    }
  }
  if (typeof opts.ratingValue === 'number' && opts.ratingCount) {
    s.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: opts.ratingValue,
      reviewCount: opts.ratingCount,
    }
  }
  return s
}

// ── Blog / Article schemas (SEO + GEO + AEO) ─────────────────────
// BlogPosting is the schema.org type most search engines and answer
// engines index as an article. `datePublished` + `dateModified` +
// `author` + `image` are the required signals; `articleSection` and
// `keywords` boost topical clustering.

export interface PostAuthor {
  name: string
  url?: string
  image?: string
}

export interface Publisher {
  name: string
  logo?: string
  url?: string
}

/** BlogPosting — one article detail page. */
export function blogPostingSchema(opts: {
  headline: string
  description?: string
  url: string
  image?: string
  datePublished?: string | Date
  dateModified?: string | Date
  author?: PostAuthor
  publisher?: Publisher
  articleSection?: string
  keywords?: string[]
  wordCount?: number
  site?: string
}) {
  const s: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.headline,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absUrl(opts.url, opts.site),
    },
    url: absUrl(opts.url, opts.site),
  }
  if (opts.description) s.description = opts.description
  if (opts.image) s.image = absUrl(opts.image, opts.site)
  if (opts.datePublished) s.datePublished = new Date(opts.datePublished).toISOString()
  if (opts.dateModified) s.dateModified = new Date(opts.dateModified).toISOString()
  if (opts.author) {
    const a: Record<string, unknown> = { '@type': 'Person', name: opts.author.name }
    if (opts.author.url) a.url = absUrl(opts.author.url, opts.site)
    if (opts.author.image) a.image = absUrl(opts.author.image, opts.site)
    s.author = a
  }
  if (opts.publisher) {
    const p: Record<string, unknown> = { '@type': 'Organization', name: opts.publisher.name }
    if (opts.publisher.url) p.url = absUrl(opts.publisher.url, opts.site)
    if (opts.publisher.logo) {
      p.logo = { '@type': 'ImageObject', url: absUrl(opts.publisher.logo, opts.site) }
    }
    s.publisher = p
  }
  if (opts.articleSection) s.articleSection = opts.articleSection
  if (opts.keywords && opts.keywords.length) s.keywords = opts.keywords.join(', ')
  if (typeof opts.wordCount === 'number') s.wordCount = opts.wordCount
  return s
}

/** Blog — index page listing multiple posts. */
export function blogSchema(opts: {
  name: string
  description?: string
  url: string
  posts?: Array<{ url: string; headline: string; datePublished?: string | Date }>
  publisher?: Publisher
  site?: string
}) {
  const s: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: opts.name,
    url: absUrl(opts.url, opts.site),
  }
  if (opts.description) s.description = opts.description
  if (opts.publisher) {
    const p: Record<string, unknown> = { '@type': 'Organization', name: opts.publisher.name }
    if (opts.publisher.url) p.url = absUrl(opts.publisher.url, opts.site)
    if (opts.publisher.logo) {
      p.logo = { '@type': 'ImageObject', url: absUrl(opts.publisher.logo, opts.site) }
    }
    s.publisher = p
  }
  if (opts.posts && opts.posts.length) {
    s.blogPost = opts.posts.map((p) => {
      const entry: Record<string, unknown> = {
        '@type': 'BlogPosting',
        headline: p.headline,
        url: absUrl(p.url, opts.site),
      }
      if (p.datePublished) entry.datePublished = new Date(p.datePublished).toISOString()
      return entry
    })
  }
  return s
}
