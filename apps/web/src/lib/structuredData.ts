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
