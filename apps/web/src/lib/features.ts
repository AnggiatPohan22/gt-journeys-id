/**
 * Feature Toggle utilities — merge structural module metadata dari
 * `config/modules.ts` dengan CMS Global `site-features`.
 *
 * Kontrak:
 * - Structural metadata (label/slug/icon/collection) → config/modules.ts
 * - Enabled flag → CMS Global site-features
 * - Fallback: kalau CMS unreachable, semua defaultnya ON (biar preview tetap jalan)
 *
 * Cache: hasil di-memo per module invocation (build). Astro static build memanggil
 * ini banyak kali per halaman — hindari refetch identik.
 */
import { modules, type ServiceModule, type ModuleConfig } from '@config/modules'
import { getSiteFeatures } from '@lib/payload'

export type CardDesign = 'compact' | 'detailed' | 'ticket'

export interface SiteFeaturesShape {
  modules: Record<ServiceModule, boolean>
  /** Phase 4.61.1 — desain kartu per-service (single source of truth). */
  serviceCards: Record<ServiceModule, CardDesign>
  sections: {
    testimonials: boolean
    faq: boolean
    promoBanner: boolean
    newsletter: boolean
  }
  features: {
    whatsappFloat: boolean
    announcementBar: boolean
  }
  blog: {
    enabled: boolean
    enableAds: boolean
  }
}

const DEFAULT_FEATURES: SiteFeaturesShape = {
  modules: {
    tours: true,
    accommodations: true,
    waterActivities: true,
    yacht: true,
    restaurants: true,
    weddings: true,
    rentals: true,
    spa: true,
    ferryTickets: true,
  },
  serviceCards: {
    tours: 'compact',
    accommodations: 'compact',
    waterActivities: 'compact',
    yacht: 'compact',
    restaurants: 'compact',
    weddings: 'compact',
    rentals: 'compact',
    spa: 'compact',
    ferryTickets: 'ticket',
  },
  sections: { testimonials: true, faq: true, promoBanner: false, newsletter: false },
  features: { whatsappFloat: true, announcementBar: false },
  blog: { enabled: true, enableAds: false },
}

let cache: SiteFeaturesShape | null = null

/**
 * Fetch & normalize toggle state dari CMS. Fallback ke DEFAULT saat gagal.
 *
 * Cache: hanya aktif di production build. Di dev (`import.meta.env.DEV`)
 * cache di-skip supaya toggle yang di-flip di CMS langsung tercermin di
 * frontend tanpa perlu restart Astro dev server.
 */
export async function getFeatures(): Promise<SiteFeaturesShape> {
  const isDev = Boolean(import.meta.env?.DEV)
  if (!isDev && cache) return cache
  try {
    const raw = await getSiteFeatures()
    const rawModules = (raw?.modules ?? {}) as Record<string, unknown>
    // Phase 4.61.1 — desain kartu disimpan di modules.<key>Design; ekstrak ke
    // serviceCards. Nilai invalid/absent → fallback ke default.
    const serviceCards = { ...DEFAULT_FEATURES.serviceCards }
    for (const key of Object.keys(DEFAULT_FEATURES.serviceCards) as ServiceModule[]) {
      const v = rawModules[`${key}Design`]
      if (v === 'compact' || v === 'detailed' || v === 'ticket') {
        serviceCards[key] = v
      }
    }
    // modules: hanya ambil flag boolean (buang key *Design agar kontrak tetap bersih).
    const modules = { ...DEFAULT_FEATURES.modules }
    for (const key of Object.keys(DEFAULT_FEATURES.modules) as ServiceModule[]) {
      if (typeof rawModules[key] === 'boolean') modules[key] = rawModules[key] as boolean
    }
    const fresh: SiteFeaturesShape = {
      modules,
      serviceCards,
      sections: { ...DEFAULT_FEATURES.sections, ...(raw?.sections ?? {}) },
      features: { ...DEFAULT_FEATURES.features, ...(raw?.features ?? {}) },
      blog: { ...DEFAULT_FEATURES.blog, ...((raw as any)?.blog ?? {}) },
    }
    if (!isDev) cache = fresh
    return fresh
  } catch {
    if (!isDev) cache = DEFAULT_FEATURES
    return DEFAULT_FEATURES
  }
}

/** Cek apakah satu modul enabled (CMS-aware). */
export async function isModuleEnabled(key: ServiceModule): Promise<boolean> {
  const f = await getFeatures()
  return f.modules[key] !== false
}

// Mapping dari service-type slug (CMS collection key) ke ServiceModule enum
// di SiteFeatures. Kebalikan dari MODULE_TO_KEY di lib/serviceTypes.ts.
const SERVICE_TYPE_TO_MODULE: Record<string, ServiceModule> = {
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
 * Cek apakah satu service-type (slug seperti `water-activities`, `yachts`)
 * enabled — via SiteFeatures.modules toggle. Dipakai block seperti Service
 * Grid supaya tidak render section untuk modul yang di-off oleh Super Admin.
 */
export async function isServiceTypeEnabled(serviceTypeKey: string): Promise<boolean> {
  const mod = SERVICE_TYPE_TO_MODULE[serviceTypeKey]
  if (!mod) return true
  return isModuleEnabled(mod)
}

/** Cek section enabled (CMS-aware). */
export async function isSectionEnabled(key: keyof SiteFeaturesShape['sections']): Promise<boolean> {
  const f = await getFeatures()
  return f.sections[key] !== false
}

/** Cek fitur opsional enabled (CMS-aware). */
export async function isFeatureEnabled(key: keyof SiteFeaturesShape['features']): Promise<boolean> {
  const f = await getFeatures()
  return f.features[key] !== false
}

/** Cek toggle Blog group (enabled, enableAds). */
export async function isBlogFlagEnabled(key: keyof SiteFeaturesShape['blog']): Promise<boolean> {
  const f = await getFeatures()
  return f.blog[key] !== false
}

/**
 * Async version of `enabledModules()` — merge CMS toggle dengan config metadata.
 * Dipakai Footer/Header/homepage listing.
 */
export async function enabledModulesAsync(): Promise<Array<{ key: ServiceModule } & ModuleConfig>> {
  const f = await getFeatures()
  return (Object.entries(modules) as Array<[ServiceModule, ModuleConfig]>)
    .filter(([key, cfg]) => cfg.enabled && f.modules[key] !== false)
    .map(([key, cfg]) => ({ key, ...cfg }))
}
