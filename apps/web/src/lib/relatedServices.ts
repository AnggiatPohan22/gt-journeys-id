/**
 * Phase 4.17 — Related Services cascade resolver.
 *
 * Resolves the 3-layer cascade:
 *   Individual service > Service Type > Global (SiteSettings)
 *
 * Pure function — no I/O, no side effects. All data must be
 * pre-fetched and passed in.
 */

export interface RelatedConfig {
  enabled: boolean
  sectionTitle: string
  cardStyle: 'curated' | 'compact' | 'detailed'
  maxItems: number
  selectionMode: 'same_type' | 'same_destination' | 'random' | 'manual'
  showExploreAll: boolean
  manualPicks?: any[]
}

const DEFAULTS: RelatedConfig = {
  enabled: true,
  sectionTitle: '',
  cardStyle: 'curated',
  maxItems: 3,
  selectionMode: 'same_type',
  showExploreAll: true,
}

const validCardStyle = (v: unknown): v is RelatedConfig['cardStyle'] =>
  v === 'curated' || v === 'compact' || v === 'detailed'

const validSelectionMode = (v: unknown): v is RelatedConfig['selectionMode'] =>
  v === 'same_type' || v === 'same_destination' || v === 'random' || v === 'manual'

export function resolveRelatedConfig(
  service: any,
  serviceType: any,
  globalSettings: any,
): RelatedConfig | null {
  // Layer 3: Individual service disables the section
  if (service?.relatedOverride === 'disable') return null

  // Layer 3: Individual service has custom settings
  if (service?.relatedOverride === 'customize') {
    const mode = validSelectionMode(service.relatedSelectionMode)
      ? service.relatedSelectionMode
      : 'same_type'
    return {
      enabled: true,
      sectionTitle: service.relatedSectionTitle ?? '',
      cardStyle: validCardStyle(service.relatedCardStyle) ? service.relatedCardStyle : 'curated',
      maxItems: typeof service.relatedMaxItems === 'number' ? service.relatedMaxItems : 3,
      selectionMode: mode,
      showExploreAll: service.relatedShowExploreAll ?? true,
      manualPicks: mode === 'manual' ? (service.relatedManualPicks ?? []) : undefined,
    }
  }

  // Layer 2: Service Type overrides global
  if (serviceType?.relatedOverrideEnabled === true) {
    if (serviceType.relatedEnabled === false) return null
    return {
      enabled: true,
      sectionTitle: serviceType.relatedSectionTitle ?? '',
      cardStyle: validCardStyle(serviceType.relatedCardStyle) ? serviceType.relatedCardStyle : 'curated',
      maxItems: typeof serviceType.relatedMaxItems === 'number' ? serviceType.relatedMaxItems : 3,
      selectionMode: validSelectionMode(serviceType.relatedSelectionMode) ? serviceType.relatedSelectionMode : 'same_type',
      showExploreAll: serviceType.relatedShowExploreAll ?? true,
    }
  }

  // Layer 1: Global default from SiteSettings
  const g = globalSettings?.relatedServices
  if (g?.enabled === false) return null

  return {
    enabled: g?.enabled ?? DEFAULTS.enabled,
    sectionTitle: g?.sectionTitle ?? DEFAULTS.sectionTitle,
    cardStyle: validCardStyle(g?.cardStyle) ? g.cardStyle : DEFAULTS.cardStyle,
    maxItems: typeof g?.maxItems === 'number' ? g.maxItems : DEFAULTS.maxItems,
    selectionMode: validSelectionMode(g?.selectionMode) ? g.selectionMode : DEFAULTS.selectionMode,
    showExploreAll: g?.showExploreAll ?? DEFAULTS.showExploreAll,
  }
}
