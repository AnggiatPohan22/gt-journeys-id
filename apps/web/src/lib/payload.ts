import type {
  Tour,
  Accommodation,
  WaterActivity,
  Yacht,
  Restaurant,
  Venue,
  Rental,
  Spa,
  FerryTicket,
  Destination,
  Category,
  Page,
  Menu,
  SiteSetting,
} from '@shared/types/payload-types'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'

type WherePrimitive = string | number | boolean
type WhereClause = Record<string, WherePrimitive | Record<string, WherePrimitive>>

interface FetchOptions {
  collection: string
  /**
   * Nested where clause matching Payload's REST syntax.
   *   Shorthand: `{ slug: 'home' }`      → where[slug][equals]=home
   *   Explicit:  `{ slug: { equals: 'home' } }`
   *              `{ price: { greater_than: 100 } }`
   */
  where?: WhereClause
  limit?: number
  sort?: string
  depth?: number
  page?: number
  /** 'published' (default), 'draft', or 'all' to skip the status filter entirely */
  status?: 'published' | 'draft' | 'all'
}

export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Flatten a nested where clause into Payload's `where[field][operator]=value` query params.
function whereToQueryParts(where: WhereClause): string[] {
  const parts: string[] = []
  for (const [field, value] of Object.entries(where)) {
    if (value !== null && typeof value === 'object') {
      for (const [op, val] of Object.entries(value)) {
        parts.push(
          `${encodeURIComponent(`where[${field}][${op}]`)}=${encodeURIComponent(String(val))}`,
        )
      }
    } else {
      parts.push(
        `${encodeURIComponent(`where[${field}][equals]`)}=${encodeURIComponent(String(value))}`,
      )
    }
  }
  return parts
}

export async function fetchCollection<T>({
  collection,
  where = {},
  limit = 10,
  sort = '-createdAt',
  depth = 1,
  page = 1,
  status = 'published',
}: FetchOptions): Promise<PaginatedResult<T>> {
  const parts: string[] = [
    `limit=${encodeURIComponent(String(limit))}`,
    `sort=${encodeURIComponent(sort)}`,
    `depth=${encodeURIComponent(String(depth))}`,
    `page=${encodeURIComponent(String(page))}`,
  ]
  if (status !== 'all') {
    parts.push(`${encodeURIComponent('where[status][equals]')}=${encodeURIComponent(status)}`)
  }
  parts.push(...whereToQueryParts(where))

  const res = await fetch(`${CMS_URL}/api/${collection}?${parts.join('&')}`)
  if (!res.ok) throw new Error(`CMS error: ${res.status} fetching ${collection}`)
  return res.json() as Promise<PaginatedResult<T>>
}

export async function fetchBySlug<T>(
  collection: string,
  slug: string,
  status: FetchOptions['status'] = 'published',
): Promise<T | null> {
  const data = await fetchCollection<T>({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    status,
  })
  return data.docs[0] || null
}

export async function fetchGlobal<T>(slug: string, depth = 0): Promise<T> {
  const q = depth > 0 ? `?depth=${encodeURIComponent(String(depth))}` : ''
  const res = await fetch(`${CMS_URL}/api/globals/${slug}${q}`)
  if (!res.ok) throw new Error(`CMS global error: ${res.status}`)
  return res.json() as Promise<T>
}

// ── Convenience exports ───────────────────────────────
export const getTours = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Tour>({ collection: 'tours', ...opts })
export const getTourBySlug = (slug: string) => fetchBySlug<Tour>('tours', slug)

export const getAccommodations = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Accommodation>({ collection: 'accommodations', ...opts })
export const getAccommodationBySlug = (slug: string) =>
  fetchBySlug<Accommodation>('accommodations', slug)

export const getWaterActivities = (opts?: Partial<FetchOptions>) =>
  fetchCollection<WaterActivity>({ collection: 'water-activities', ...opts })
export const getWaterActivityBySlug = (slug: string) =>
  fetchBySlug<WaterActivity>('water-activities', slug)

export const getYachts = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Yacht>({ collection: 'yachts', ...opts })
export const getYachtBySlug = (slug: string) => fetchBySlug<Yacht>('yachts', slug)

export const getRestaurants = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Restaurant>({ collection: 'restaurants', ...opts })
export const getRestaurantBySlug = (slug: string) =>
  fetchBySlug<Restaurant>('restaurants', slug)

export const getVenues = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Venue>({ collection: 'venues', ...opts })
export const getVenueBySlug = (slug: string) => fetchBySlug<Venue>('venues', slug)

export const getRentals = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Rental>({ collection: 'rentals', ...opts })
export const getRentalBySlug = (slug: string) => fetchBySlug<Rental>('rentals', slug)

export const getSpas = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Spa>({ collection: 'spa', ...opts })
export const getSpaBySlug = (slug: string) => fetchBySlug<Spa>('spa', slug)

export const getFerryTickets = (opts?: Partial<FetchOptions>) =>
  fetchCollection<FerryTicket>({ collection: 'ferry-tickets', ...opts })
export const getFerryTicketsBySlug = (slug: string) =>
  fetchBySlug<FerryTicket>('ferry-tickets', slug)

// Phase 4.61.7 — Locations (ferry ports, train stations, etc.).
export interface LocationDoc {
  id: number
  name: string
  terminalName?: string
  slug: string
  code?: string
  country?: string
  timezone?: string
  locationType?: 'ferry-port' | 'train-station' | 'airport' | 'bus-terminal' | 'city'
  isActive?: boolean
  mapEmbedUrl?: string
  mapLink?: string
}
export const getLocations = (opts?: Partial<FetchOptions>) =>
  // Locations don't have a `status` field — must fetch with status:'all' or
  // the default status=published filter returns zero rows.
  fetchCollection<LocationDoc>({ collection: 'locations', sort: 'sortOrder', limit: 200, status: 'all', ...opts })

/**
 * ServiceType metadata doc. Typed locally (loose) so builds don't hard-depend
 * on regenerated payload-types before `generate:types` runs. Status enum is
 * 'active' | 'draft' | 'archived' (NOT published) → fetch with status:'all'
 * and filter by status=active.
 */
export interface ServiceTypeDoc {
  id: number
  key: string
  name: string
  slug: string
  order?: number | null
  status?: 'active' | 'draft' | 'archived'
  iconName?: string | null
  coverImage?: unknown
  description?: unknown
  whatsappNumber?: string | null
  whatsappTemplate?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  relatedOverrideEnabled?: boolean | null
  relatedEnabled?: boolean | null
  relatedSectionTitle?: string | null
  relatedCardStyle?: string | null
  relatedMaxItems?: number | null
  relatedSelectionMode?: string | null
  relatedShowExploreAll?: boolean | null
}

export const getServiceTypes = (opts?: Partial<FetchOptions>) =>
  fetchCollection<ServiceTypeDoc>({
    collection: 'service-types',
    status: 'all',
    where: { status: { equals: 'active' } },
    sort: 'order',
    limit: 20,
    ...opts,
  })

export const getDestinations = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Destination>({ collection: 'destinations', ...opts })

export const getCategories = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Category>({ collection: 'categories', ...opts })

export const getPages = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Page>({ collection: 'pages', ...opts })
export const getPageBySlug = (slug: string) => fetchBySlug<Page>('pages', slug)

export const getMenuBySlug = (slug: string) => fetchBySlug<Menu>('menus', slug)

export const getSiteSettings = () => fetchGlobal<SiteSetting>('site-settings')
export const getHeaderSettings = () => fetchGlobal<any>('header-settings')
export const getFooterSettings = () => fetchGlobal<any>('footer-settings')
// depth=1 supaya upload (ticket card background per-service) ter-populate jadi
// objek media (url + sizes), bukan sekadar id. (Phase 4.61.3)
export const getSiteFeatures = () => fetchGlobal<any>('site-features', 1)
export const getHomepageContent = () => fetchGlobal<any>('homepage-content')
export const getAnnouncementBar = () => fetchGlobal<any>('announcement-bar')
export const getPromoBanner = () => fetchGlobal<any>('promo-banner')
export const getBlogSettings = () => fetchGlobal<any>('blog-settings')
export const getChatWidget = () => fetchGlobal<any>('chat-widget')
// Phase 4.59.1 — Popup Settings global (Settings → Popup).
export const getPopupSettings = () => fetchGlobal<any>('popup-settings')
export const getTestimonials = (opts?: Partial<FetchOptions>) =>
  fetchCollection<any>({ collection: 'testimonials', sort: 'sortOrder', ...opts })

// ── Blog ──────────────────────────────────────────────────────
// Posts + Authors typed loosely — cast where needed until callers
// specialize. Depth 2 pulls category + author relationships.
export const getPosts = (opts?: Partial<FetchOptions>) =>
  fetchCollection<any>({ collection: 'posts', sort: '-publishedAt', depth: 2, ...opts })
export const getPostBySlug = (slug: string) =>
  fetchBySlug<any>('posts', slug)

export const getAuthors = (opts?: Partial<FetchOptions>) =>
  fetchCollection<any>({ collection: 'authors', sort: 'sortOrder', ...opts })
export const getAuthorBySlug = (slug: string) =>
  fetchBySlug<any>('authors', slug)

export const getBlogCategories = (opts?: Partial<FetchOptions>) =>
  fetchCollection<any>({ collection: 'blog-categories', sort: 'sortOrder', ...opts })
export const getBlogCategoryBySlug = (slug: string) =>
  fetchBySlug<any>('blog-categories', slug)

export const getTags = (opts?: Partial<FetchOptions>) =>
  fetchCollection<any>({ collection: 'tags', sort: 'sortOrder', ...opts })
export const getTagBySlug = (slug: string) =>
  fetchBySlug<any>('tags', slug)
