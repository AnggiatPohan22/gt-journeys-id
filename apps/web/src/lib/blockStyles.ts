/**
 * Shared style resolver untuk block components yang pakai advanced tab
 * (Hero, Image, Gallery, CTA, dan block lain saat rollout).
 *
 * Semua helper defensive terhadap undefined — safe untuk data block lama
 * yang tidak punya field advanced sama sekali.
 */

import type { Media } from '@shared/types/payload-types'

// ── Image fit + position ─────────────────────────────────────
const fitClassMap: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  'scale-down': 'object-scale-down',
}
const posClassMap: Record<string, string> = {
  'top-left': 'object-left-top',
  top: 'object-top',
  'top-right': 'object-right-top',
  left: 'object-left',
  center: 'object-center',
  right: 'object-right',
  'bottom-left': 'object-left-bottom',
  bottom: 'object-bottom',
  'bottom-right': 'object-right-bottom',
}

export const resolveFitClass = (v?: string) => fitClassMap[v ?? 'cover'] ?? 'object-cover'
export const resolvePosClass = (v?: string) => posClassMap[v ?? 'center'] ?? 'object-center'

// ── Content alignment ────────────────────────────────────────
export type Alignment = 'left' | 'center' | 'right'
export const resolveAlignment = (v?: string) => {
  const align = (v ?? 'center') as Alignment
  return {
    text: align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center',
    margin: align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto',
    flex: align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center',
  }
}

// ── Container width ──────────────────────────────────────────
export const resolveContainer = (v?: string) => {
  switch (v) {
    case 'full':   return 'w-full px-4 sm:px-6 lg:px-8'
    case 'wide':   return 'w-full max-w-7xl px-4 sm:px-6 lg:px-8'
    case 'narrow': return 'w-full max-w-3xl px-4 sm:px-6 lg:px-8'
    default:       return 'w-full max-w-5xl px-4 sm:px-6 lg:px-8'
  }
}

// ── Section padding preset (Phase 4.24 — SYMMETRIC top+bottom) ─────
// Sebelumnya top-only sehingga adjacent-block rhythm asimetris
// (0 pb + gap + 96 pt). Sekarang preset selalu simetris; default
// (undefined) menggunakan CSS variable dari SiteSettings.layout.blockPadding
// via class `block-pad-default` — value di-emit di BlockRenderer wrapper.
// Overload: accept preset string (backward compat) atau block object.
// Kalau block.pad.enabled → paksa `block-pad-default` supaya inline style
// dari resolvePaddingOverrideStyle bisa shadow global vars.
const resolvePresetPadding = (v?: string): string => {
  switch (v) {
    case 'none':     return ''
    case 'compact':  return 'pt-8 pb-8 md:pt-12 md:pb-12'
    case 'spacious': return 'pt-20 pb-20 md:pt-24 md:pb-24'
    default:         return 'block-pad-default'
  }
}
export const resolvePadding = (input?: string | Record<string, any> | null): string => {
  if (input == null || typeof input === 'string') return resolvePresetPadding(input as string | undefined)
  const block = input
  if (block?.pad?.enabled) return 'block-pad-default'
  return resolvePresetPadding(block?.sectionPadding)
}

// Phase 4.24 Part 2 — per-block padding override.
// Returns inline `--block-pt-m/-d/--block-pb-m/-d` CSS variables that
// shadow the wrapper's globals. Only emits sides where the override
// is explicit (top/bottom = inherit → no emit for that side, keeping
// global default). Preset values must stay in sync with
// SiteSettings preset labels (compact ~32/48, normal ~48/64, spacious ~80/96).
const padPresetPx: Record<string, [number, number]> = {
  none:     [0, 0],
  compact:  [32, 48],
  normal:   [48, 64],
  spacious: [80, 96],
}
export const resolvePaddingOverrideStyle = (block: any): string | undefined => {
  const pad = block?.pad
  if (!pad?.enabled) return undefined
  const resolveSide = (side: 'top' | 'bottom'): [number, number] | null => {
    const val = pad[side]
    if (!val || val === 'inherit') return null
    if (val === 'custom') {
      const m = side === 'top' ? pad.topMobPx : pad.btmMobPx
      const d = side === 'top' ? pad.topDeskPx : pad.btmDeskPx
      if (m == null && d == null) return null
      return [Number(m ?? 0), Number(d ?? 0)]
    }
    return padPresetPx[val] ?? null
  }
  const top = resolveSide('top')
  const btm = resolveSide('bottom')
  if (!top && !btm) return undefined
  const parts: string[] = []
  if (top) parts.push(`--block-pt-m:${top[0]}px`, `--block-pt-d:${top[1]}px`)
  if (btm) parts.push(`--block-pb-m:${btm[0]}px`, `--block-pb-d:${btm[1]}px`)
  return parts.join(';')
}

// ── Block gap (kept for backward compat; BlockRenderer now uses CSS sibling margin) ─
export const resolveBlockGap = (v?: string) => {
  switch (v) {
    case 'compact':  return 'gap-4 md:gap-6'
    case 'spacious': return 'gap-16 md:gap-20'
    default:         return 'gap-8 md:gap-12'
  }
}

// ── Spacing override (Phase 4.22) ────────────────────────────
const spacingPresetToPx: Record<string, string> = {
  none:     '0px',
  compact:  '2rem',
  normal:   '4rem',
  spacious: '6rem',
}
export const resolveSpacingOverride = (block: any): string | undefined => {
  const so = block?.spacingOverride
  if (!so?.enabled) return undefined
  const parts: string[] = []
  if (so.mt) {
    const val = so.mt === 'custom' ? `${so.topPx ?? 0}px` : spacingPresetToPx[so.mt]
    if (val) parts.push(`margin-top:${val}`)
  }
  if (so.mb) {
    const val = so.mb === 'custom' ? `${so.btmPx ?? 0}px` : spacingPresetToPx[so.mb]
    if (val) parts.push(`margin-bottom:${val}`)
  }
  return parts.length > 0 ? parts.join(';') : undefined
}

// ── Entry animation ──────────────────────────────────────────
// 'reveal' → gunakan data-animate GSAP existing.
// Preset lain → class CSS-only (butuh matching @keyframes di block yg pakai).
export const resolveEntryAnimation = (v?: string) => {
  const anim = v ?? 'reveal'
  const useDataAnimate = anim === 'reveal'
  return {
    useDataAnimate,
    className: !useDataAnimate && anim !== 'none' ? `entry-${anim}` : '',
    dataAnimate: useDataAnimate ? 'reveal' : undefined,
  }
}

// ── Background ───────────────────────────────────────────────
const bgColorMap: Record<string, string> = {
  sand: 'bg-sand', ocean: 'bg-ocean', coral: 'bg-coral',
  leaf: 'bg-leaf', stone: 'bg-stone', midnight: 'bg-midnight',
  white: 'bg-white', default: '',
}

export interface ResolvedBackground {
  bgClass: string          // Solid color background class (empty = theme default)
  imageUrl: string         // Non-empty = render bg image
  overlayOpacity: number   // 0-1 (only used if imageUrl set)
}

export const resolveBackground = (bg: any, themeDefault = ''): ResolvedBackground => {
  const type = bg?.type ?? 'default'
  const overlayOpacity = ((bg?.overlayOpacity ?? 40) / 100)
  const asMedia = (v: unknown): Media | null =>
    v && typeof v === 'object' ? (v as Media) : null

  if (type === 'color' && bg?.color) {
    return { bgClass: bgColorMap[bg.color] ?? themeDefault, imageUrl: '', overlayOpacity: 0 }
  }
  if (type === 'image') {
    const img = asMedia(bg?.image)
    const url = img?.sizes?.hero?.url ?? img?.url ?? ''
    return { bgClass: themeDefault, imageUrl: url, overlayOpacity }
  }
  return { bgClass: themeDefault, imageUrl: '', overlayOpacity: 0 }
}

// ── Button ───────────────────────────────────────────────────
const btnBgSolid: Record<string, string> = {
  sand: 'bg-sand', ocean: 'bg-ocean', coral: 'bg-coral',
  leaf: 'bg-leaf', stone: 'bg-stone', midnight: 'bg-midnight', white: 'bg-white',
}
const btnBorder: Record<string, string> = {
  sand: 'border-sand', ocean: 'border-ocean', coral: 'border-coral',
  leaf: 'border-leaf', stone: 'border-stone', midnight: 'border-midnight', white: 'border-white',
}
const btnText: Record<string, string> = {
  sand: 'text-sand', ocean: 'text-ocean', coral: 'text-coral',
  leaf: 'text-leaf', stone: 'text-stone', midnight: 'text-midnight', white: 'text-white',
}

export const resolveButtonClasses = (btn: any): string[] => {
  const variant = btn?.variant ?? 'solid'
  const color = btn?.color ?? 'coral'
  const radius = btn?.radius ?? 'rounded'
  const hover = btn?.hoverAnimation ?? 'scale'
  const textColor = btn?.textColor ?? 'default'

  const radiusClass =
    radius === 'sharp' ? 'rounded-none' :
    radius === 'pill' ? 'rounded-full' :
                        'rounded-lg'

  const hoverClass =
    hover === 'fade'      ? 'hover:opacity-80' :
    hover === 'underline' ? 'hover:underline underline-offset-4' :
    hover === 'none'      ? '' :
                            'hover:scale-105'

  const base = ['inline-flex items-center gap-2 px-8 py-4 font-semibold no-underline transition-all', radiusClass, hoverClass]

  const autoContrast = ['white', 'sand'].includes(color) ? 'text-ocean' : 'text-white'

  if (variant === 'ghost') return [...base, btnText[color], 'hover:bg-white/10']
  if (variant === 'outline') return [...base, 'border-2', btnBorder[color], btnText[color], `hover:${btnBgSolid[color]}`, 'hover:text-white']

  const textClass = textColor === 'default' ? autoContrast : btnText[textColor]
  return [...base, btnBgSolid[color], textClass]
}

// ── Text color (per-element, from textStyles group) ─────────
const textColorClassMap: Record<string, string> = {
  inherit: '',
  ocean: 'text-ocean',
  coral: 'text-coral',
  leaf: 'text-leaf',
  sand: 'text-sand',
  stone: 'text-stone',
  midnight: 'text-midnight',
  white: 'text-white',
}
export const resolveTextColor = (v?: string) => textColorClassMap[v ?? 'inherit'] ?? ''

// ── Per-element text entry animation ─────────────────────────
// Returns className string for CSS keyframe entry. 'inherit' = no class
// (falls through to block-level entryAnimation). 'none' = explicit skip.
export const resolveTextAnimIn = (v?: string): string => {
  const anim = v ?? 'inherit'
  if (anim === 'inherit' || anim === 'none') return ''
  return `text-anim-${anim}`
}

// ── Shared CSS block (entry animation keyframes) ─────────────
// Import ini di komponen astro via <Fragment set:html={entryAnimationCss} />
// tidak praktis. Sebagai gantinya komponen include sendiri via <style>
// block. Untuk konsistensi disediakan class list yang dipakai.
export const entryAnimationClassNames = [
  'entry-fade', 'entry-zoom', 'entry-slide-left', 'entry-slide-right',
]
