/**
 * Header/Footer Template Registry — Phase 3.24
 *
 * SATU-SATUNYA sumber kebenaran template (framework-agnostic, ZERO dependency
 * ke Astro/Payload). Diimpor oleh:
 *  - CMS Payload (opsi select + admin.condition slot + validasi import/export)
 *  - Frontend Astro (dispatch komponen build-time)
 *  - Project Payload LAIN (copy file ini / install sbg package) → portabilitas.
 *
 * Menambah template = tambah entri di sini + buat komponen Astro + deploy.
 */

export type TemplateKind = 'header' | 'footer'

/** Semua slot content yang mungkin dipakai lintas template. */
export type SlotKey =
  // shared
  | 'logo'
  | 'primaryMenu'
  | 'secondaryMenu'
  | 'ctaButton'
  | 'searchToggle'
  | 'socialLinks'
  | 'address'
  | 'phone'
  | 'email'
  | 'customText'
  // footer-only
  | 'columns'
  | 'copyrightText'
  | 'newsletterToggle'
  | 'legalLinks'

export interface TemplateDef {
  templateId: string
  name: string
  kind: TemplateKind
  slots: SlotKey[]
  /** Path thumbnail (di-serve CMS: apps/cms/public/admin-thumbs/*). */
  thumbnail: string
}

// ── Fingerprint kontrak (untuk portabilitas antar-project) ──────────────
export const REGISTRY_ID = 'gtjourneys-headerfooter'
export const REGISTRY_VERSION = '1.0.0'
export const SCHEMA_VERSION = '1.0'

// ── Header templates ────────────────────────────────────────────────────
export const HEADER_TEMPLATES: TemplateDef[] = [
  {
    templateId: 'header-1',
    name: 'Classic — Logo · Menu · CTA',
    kind: 'header',
    slots: ['logo', 'primaryMenu', 'ctaButton'],
    thumbnail: '/admin-thumbs/header-1.svg',
  },
  {
    templateId: 'header-2',
    name: 'Search & Social — Logo · Search · Menu · Social',
    kind: 'header',
    slots: ['logo', 'searchToggle', 'primaryMenu', 'socialLinks'],
    thumbnail: '/admin-thumbs/header-2.svg',
  },
  {
    templateId: 'header-3',
    name: 'Top Bar — Address/Phone/Social + Logo · Menu · CTA',
    kind: 'header',
    slots: ['logo', 'primaryMenu', 'ctaButton', 'address', 'phone', 'socialLinks', 'customText'],
    thumbnail: '/admin-thumbs/header-3.svg',
  },
]

// ── Footer templates ────────────────────────────────────────────────────
export const FOOTER_TEMPLATES: TemplateDef[] = [
  {
    templateId: 'footer-1',
    name: 'Multi-column — Brand · Columns · Services · Contact',
    kind: 'footer',
    slots: ['logo', 'columns', 'socialLinks', 'address', 'phone', 'email', 'copyrightText', 'newsletterToggle'],
    thumbnail: '/admin-thumbs/footer-1.svg',
  },
  {
    templateId: 'footer-2',
    name: 'Simple — Logo · Copyright · Social',
    kind: 'footer',
    slots: ['logo', 'copyrightText', 'socialLinks'],
    thumbnail: '/admin-thumbs/footer-2.svg',
  },
  {
    templateId: 'footer-3',
    name: 'Minimal — Copyright · Legal Links',
    kind: 'footer',
    slots: ['copyrightText', 'legalLinks'],
    thumbnail: '/admin-thumbs/footer-3.svg',
  },
]

export const ALL_TEMPLATES: TemplateDef[] = [...HEADER_TEMPLATES, ...FOOTER_TEMPLATES]

// ── Helpers ─────────────────────────────────────────────────────────────
export const templatesByKind = (kind: TemplateKind): TemplateDef[] =>
  ALL_TEMPLATES.filter((t) => t.kind === kind)

export const getTemplate = (templateId: string | undefined | null): TemplateDef | undefined =>
  ALL_TEMPLATES.find((t) => t.templateId === templateId)

/** Apakah template `templateId` memakai `slot`? Dipakai di admin.condition. */
export const templateSupports = (templateId: string | undefined | null, slot: SlotKey): boolean =>
  !!getTemplate(templateId)?.slots.includes(slot)

/** Opsi untuk field `select` Payload (label/value). */
export const toSelectOptions = (kind: TemplateKind): { label: string; value: string }[] =>
  templatesByKind(kind).map((t) => ({ label: t.name, value: t.templateId }))

export const defaultTemplateId = (kind: TemplateKind): string =>
  templatesByKind(kind)[0]?.templateId ?? ''

// ── Export/Import contract ──────────────────────────────────────────────
export interface TemplateExport {
  schemaVersion: string
  kind: TemplateKind
  templateId: string
  registryId: string
  registryVersion: string
  exportedAt: string
  exportedFrom?: string
  /** Nilai slot. Relationship = ref portable (menu slug, media filename/url). */
  content: Record<string, unknown>
}

export interface ValidateResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

/** Bandingkan mayor semver (major beda = incompatible). */
const majorOf = (v: string): string => (v || '').split('.')[0] ?? ''

/**
 * Validasi berlapis file import terhadap registry lokal.
 * ok=false kalau ada error (schema/registry/template tak dikenal).
 */
export const validateExport = (data: unknown, expectedKind?: TemplateKind): ValidateResult => {
  const errors: string[] = []
  const warnings: string[] = []
  const d = data as Partial<TemplateExport> | null

  if (!d || typeof d !== 'object') {
    return { ok: false, errors: ['File tidak valid (bukan objek JSON).'], warnings }
  }
  if (d.schemaVersion !== SCHEMA_VERSION) {
    // beda minor toleran, tapi wajib ada
    if (!d.schemaVersion) errors.push('schemaVersion tidak ada.')
    else warnings.push(`schemaVersion "${d.schemaVersion}" ≠ "${SCHEMA_VERSION}" (dicoba tetap).`)
  }
  if (d.registryId !== REGISTRY_ID) {
    errors.push(`registryId "${d.registryId}" ≠ "${REGISTRY_ID}" — file dari registry lain.`)
  }
  if (d.registryVersion && majorOf(d.registryVersion) !== majorOf(REGISTRY_VERSION)) {
    warnings.push(`registryVersion major berbeda (${d.registryVersion} vs ${REGISTRY_VERSION}) — slot mungkin berubah.`)
  }
  if (expectedKind && d.kind !== expectedKind) {
    errors.push(`kind "${d.kind}" ≠ "${expectedKind}".`)
  }
  const tpl = getTemplate(d.templateId)
  if (!tpl) {
    errors.push(`template not found: "${d.templateId}" tidak ada di registry target.`)
  } else if (expectedKind && tpl.kind !== expectedKind) {
    errors.push(`template "${d.templateId}" bukan kind "${expectedKind}".`)
  }
  if (d.content && typeof d.content === 'object' && tpl) {
    for (const key of Object.keys(d.content)) {
      if (!tpl.slots.includes(key as SlotKey)) {
        warnings.push(`slot "${key}" tak dikenal template "${d.templateId}" — diabaikan.`)
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings }
}
