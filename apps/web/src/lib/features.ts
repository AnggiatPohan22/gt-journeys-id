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

export interface SiteFeaturesShape {
  modules: Record<ServiceModule, boolean>
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
    const fresh: SiteFeaturesShape = {
      modules: { ...DEFAULT_FEATURES.modules, ...(raw?.modules ?? {}) },
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
