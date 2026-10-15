/**
 * ServiceType resolver — CMS-first metadata untuk 7 service vertical, dengan
 * fallback ke `config/modules.ts` (pola sama seperti `lib/features.ts`).
 *
 * Kontrak:
 * - Source of truth = CMS collection `service-types` (label/ikon/urutan/slug/
 *   deskripsi/hero/WA/SEO). Client bisa adjust tanpa deploy.
 * - Kalau CMS kosong / unreachable → fallback ke modules.ts hardcoded, jadi
 *   preview & build tetap jalan.
 * - `key` = enum fixed (7) yang mengikat ke collection listing existing.
 *
 * Cache: di-memo per build invocation (Astro SSG memanggil ini banyak kali).
 */
import { modules, type ServiceModule, type ModuleConfig } from '@config/modules'
import { getServiceTypes, type ServiceTypeDoc } from '@lib/payload'

export interface ResolvedServiceType {
  key: string
  name: string
  slug: string
  iconName?: string
  order: number
  description?: unknown
  coverImage?: unknown
  whatsappNumber?: string
  whatsappTemplate?: string
  metaTitle?: string
  metaDescription?: string
  relatedOverrideEnabled?: boolean
  relatedEnabled?: boolean
  relatedSectionTitle?: string
  relatedCardStyle?: string
  relatedMaxItems?: number
  relatedSelectionMode?: string
  relatedShowExploreAll?: boolean
}

// modules.ts pakai camelCase key; ServiceTypes.key pakai collection slug.
const MODULE_TO_KEY: Record<ServiceModule, string> = {
  tours: 'tours',
  accommodations: 'accommodations',
  waterActivities: 'water-activities',
  yacht: 'yachts',
  restaurants: 'restaurants',
  weddings: 'venues',
  rentals: 'rentals',
  spa: 'spa',
  ferryTickets: 'ferry-tickets',
}

// Landing page slug per key (selaras dgn CMS landing pages).
const KEY_TO_SLUG: Record<string, string> = {
  tours: 'tour',
  accommodations: 'villa',
  'water-activities': 'water-activity',
  yachts: 'yacht',
  restaurants: 'restaurant',
  venues: 'venue',
  rentals: 'rental',
  spa: 'spa',
  'ferry-tickets': 'ferry-tickets',
}

let cache: ResolvedServiceType[] | null = null

/** Fallback dari modules.ts hardcoded (kalau CMS kosong/unreachable). */
function fallbackFromModules(): ResolvedServiceType[] {
  return (Object.entries(modules) as Array<[ServiceModule, ModuleConfig]>)
    .filter(([, cfg]) => cfg.enabled)
    .map(([mod, cfg], i) => {
      const key = MODULE_TO_KEY[mod]
      return {
        key,
        name: cfg.label,
        slug: KEY_TO_SLUG[key] ?? cfg.slug,
        iconName: cfg.icon,
        order: i + 1,
      }
    })
}

/**
 * CMS-first list of active service types, ordered. Fallback ke modules.ts.
 *
 * Phase 4.49 — kalau CMS mengembalikan sebagian modul saja (mis. Ferry
 * Tickets belum di-seed di collection ServiceTypes atau statusnya draft/
 * archived), key yang missing di-backfill dari `modules.ts` fallback.
 * Ini memastikan modul yang di-centang di SiteFeatures.modules TETAP tampil
 * di frontend walau ServiceType record-nya belum dibuat.
 */
export async function getResolvedServiceTypes(): Promise<ResolvedServiceType[]> {
  if (cache) return cache
  const fallback = fallbackFromModules()
  try {
    const res = await getServiceTypes()
    if (res.docs.length > 0) {
      const fromCms: ResolvedServiceType[] = res.docs.map((d: ServiceTypeDoc) => ({
        key: d.key,
        name: d.name,
        slug: d.slug || KEY_TO_SLUG[d.key] || d.key,
        iconName: d.iconName ?? undefined,
        order: typeof d.order === 'number' ? d.order : 0,
        description: d.description ?? undefined,
        coverImage: d.coverImage ?? undefined,
        whatsappNumber: d.whatsappNumber ?? undefined,
        whatsappTemplate: d.whatsappTemplate ?? undefined,
        metaTitle: d.metaTitle ?? undefined,
        metaDescription: d.metaDescription ?? undefined,
        relatedOverrideEnabled: d.relatedOverrideEnabled ?? undefined,
        relatedEnabled: d.relatedEnabled ?? undefined,
        relatedSectionTitle: d.relatedSectionTitle ?? undefined,
        relatedCardStyle: d.relatedCardStyle ?? undefined,
        relatedMaxItems: d.relatedMaxItems ?? undefined,
        relatedSelectionMode: d.relatedSelectionMode ?? undefined,
        relatedShowExploreAll: d.relatedShowExploreAll ?? undefined,
      }))
      // Backfill: modul di modules.ts (enabled) yang belum ada di CMS list.
      // Order-nya taruh setelah CMS items, kemudian sort keseluruhan by order.
      const cmsKeys = new Set(fromCms.map((s) => s.key))
      const cmsMaxOrder = fromCms.reduce((max, s) => Math.max(max, s.order), 0)
      const backfill = fallback
        .filter((s) => !cmsKeys.has(s.key))
        .map((s, i) => ({ ...s, order: cmsMaxOrder + i + 1 }))
      cache = [...fromCms, ...backfill].sort((a, b) => a.order - b.order)
      return cache
    }
  } catch {
    /* fall through to fallback fully */
  }
  cache = fallback
  return cache
}

/** Ambil satu service type by key (CMS-first). */
export async function getServiceTypeByKey(key: string): Promise<ResolvedServiceType | null> {
  const all = await getResolvedServiceTypes()
  return all.find((s) => s.key === key) ?? null
}

/**
 * WhatsApp per-service — nomor & template dari ServiceType (CMS), dgn fallback
 * ke nomor default (SiteSettings). Dipakai detail page booking button supaya
 * client bisa route booking per-service ke WA line berbeda tanpa deploy.
 */
export async function getServiceWhatsApp(
  key: string,
  fallbackNumber: string,
): Promise<{ number: string; template?: string }> {
  const st = await getServiceTypeByKey(key).catch(() => null)
  const num = (st?.whatsappNumber ?? '').replace(/\D/g, '')
  return {
    number: num || fallbackNumber,
    template: st?.whatsappTemplate ?? undefined,
  }
}
