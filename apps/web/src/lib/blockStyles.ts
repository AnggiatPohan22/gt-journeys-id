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
// Phase 4.56 — SEMUA preset (reveal + fade/zoom/slide-*) scroll-triggered
// via IntersectionObserver di `apps/web/src/lib/animations.ts`. CSS ada di
// `global.css` — element mulai hidden, class `.is-in-view` di-toggle observer
// saat section masuk viewport. Speed dari CMS jadi CSS var `--entry-duration`.
//
// `reveal` masih pakai GSAP path (durasi diperhatikan lewat data-entry-duration).
// Preset lain pakai class `entry-<name>` + observer.
const SPEED_MS: Record<string, number> = {
  slow: 1500,
  normal: 900,
  fast: 500,
}

export interface ResolvedEntryAnimation {
  useDataAnimate: boolean       // true untuk 'reveal' GSAP path
  className: string             // 'entry-fade'/'entry-zoom'/dst (kosong kalau reveal/none)
  dataAnimate: string | undefined
  durationMs: number            // dipakai GSAP path & CSS var
  style: string                 // '--entry-duration:900ms' (kosong kalau none)
}

export const resolveEntryAnimation = (
  v?: string,
  speed?: string,
  customMs?: number | null,
): ResolvedEntryAnimation => {
  const anim = v ?? 'reveal'
  const useDataAnimate = anim === 'reveal'
  const isNone = anim === 'none'

  const durationMs = speed === 'custom' && customMs
    ? Math.max(100, Math.min(5000, customMs))
    : (SPEED_MS[speed ?? 'normal'] ?? 900)

  return {
    useDataAnimate,
    className: !useDataAnimate && !isNone ? `entry-${anim}` : '',
    dataAnimate: useDataAnimate ? 'reveal' : undefined,
    durationMs,
    style: isNone ? '' : `--entry-duration:${durationMs}ms`,
  }
}

// ── Dual-mode color helpers (Phase 4.55) ─────────────────────
// Value bisa token slug lama (`"coral"`, `"ocean"`, …) atau free hex
// (`"#E07A5F"`, `"#1B3A4B99"` dgn alpha). Backward compatible dgn data
// pre-4.55 (semua block CMS diubah dari `select` ke `colorPickerField`).
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const TOKEN_BG_CLASS: Record<string, string> = {
  sand: 'bg-sand', ocean: 'bg-ocean', coral: 'bg-coral',
  leaf: 'bg-leaf', stone: 'bg-stone', midnight: 'bg-midnight', white: 'bg-white',
}
const TOKEN_BORDER_CLASS: Record<string, string> = {
  sand: 'border-sand', ocean: 'border-ocean', coral: 'border-coral',
  leaf: 'border-leaf', stone: 'border-stone', midnight: 'border-midnight', white: 'border-white',
}
const TOKEN_TEXT_CLASS: Record<string, string> = {
  sand: 'text-sand', ocean: 'text-ocean', coral: 'text-coral',
  leaf: 'text-leaf', stone: 'text-stone', midnight: 'text-midnight', white: 'text-white',
}

/**
 * Resolve color value → {className, style}. Hex → inline style, slug →
 * Tailwind class. Sentinel values (`inherit`, `default`, empty) → keduanya kosong.
 */
export const resolveColorValue = (
  val: string | undefined | null,
  prefix: 'text' | 'bg' | 'border',
): { className: string; style: string } => {
  if (!val || val === 'inherit' || val === 'default') return { className: '', style: '' }
  if (HEX_RE.test(val)) {
    const prop = prefix === 'text' ? 'color' : prefix === 'bg' ? 'background-color' : 'border-color'
    return { className: '', style: `${prop}:${val}` }
  }
  const map = prefix === 'text' ? TOKEN_TEXT_CLASS : prefix === 'bg' ? TOKEN_BG_CLASS : TOKEN_BORDER_CLASS
  return { className: map[val] ?? '', style: '' }
}

// ── Background ───────────────────────────────────────────────
export interface ResolvedBackground {
  bgClass: string          // Solid color background class (empty kalau hex/default)
  bgStyle: string          // Inline style utk hex path (empty kalau slug)
  imageUrl: string         // Non-empty = render bg image
  overlayOpacity: number   // 0-1 (only used if imageUrl set)
}

export const resolveBackground = (bg: any, themeDefault = ''): ResolvedBackground => {
  const type = bg?.type ?? 'default'
  const overlayOpacity = ((bg?.overlayOpacity ?? 40) / 100)
  const asMedia = (v: unknown): Media | null =>
    v && typeof v === 'object' ? (v as Media) : null

  if (type === 'color' && bg?.color) {
    const r = resolveColorValue(bg.color, 'bg')
    return {
      bgClass: r.className || (r.style ? '' : themeDefault),
      bgStyle: r.style,
      imageUrl: '',
      overlayOpacity: 0,
    }
  }
  if (type === 'image') {
    const img = asMedia(bg?.image)
    const url = img?.sizes?.hero?.url ?? img?.url ?? ''
    return { bgClass: themeDefault, bgStyle: '', imageUrl: url, overlayOpacity }
  }
  return { bgClass: themeDefault, bgStyle: '', imageUrl: '', overlayOpacity: 0 }
}

// ── Button ───────────────────────────────────────────────────
export interface ResolvedButton {
  classes: string[]
  style: string
}

// Luma-based auto-contrast utk hex path (0.299R+0.587G+0.114B).
const autoContrastFor = (val: string): { className: string; style: string } => {
  if (HEX_RE.test(val)) {
    const hex = val.slice(1)
    const r = parseInt(hex.substring(0, 2) || '0', 16)
    const g = parseInt(hex.substring(2, 4) || '0', 16)
    const b = parseInt(hex.substring(4, 6) || '0', 16)
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luma > 0.7 ? { className: 'text-ocean', style: '' } : { className: 'text-white', style: '' }
  }
  return ['white', 'sand'].includes(val)
    ? { className: 'text-ocean', style: '' }
    : { className: 'text-white', style: '' }
}

export const resolveButtonClasses = (btn: any): ResolvedButton => {
  const variant = btn?.variant ?? 'solid'
  const color = (btn?.color ?? 'coral') as string
  const radius = btn?.radius ?? 'rounded'
  const hover = btn?.hoverAnimation ?? 'scale'
  const textColor = (btn?.textColor ?? 'default') as string

  const radiusClass =
    radius === 'sharp' ? 'rounded-none' :
    radius === 'pill'  ? 'rounded-full' :
                         'rounded-lg'
  const hoverClass =
    hover === 'fade'      ? 'hover:opacity-80' :
    hover === 'underline' ? 'hover:underline underline-offset-4' :
    hover === 'none'      ? '' :
                            'hover:scale-105'

  const base = ['inline-flex items-center gap-2 px-8 py-4 font-semibold no-underline transition-all', radiusClass, hoverClass]

  const bgRes = resolveColorValue(color, 'bg')
  const borderRes = resolveColorValue(color, 'border')
  const txtRes = resolveColorValue(color, 'text')

  const classes = [...base]
  const styles: string[] = []

  if (variant === 'ghost') {
    classes.push(txtRes.className, 'hover:bg-white/10')
    if (txtRes.style) styles.push(txtRes.style)
  } else if (variant === 'outline') {
    classes.push('border-2', borderRes.className, txtRes.className)
    if (borderRes.style) styles.push(borderRes.style)
    if (txtRes.style) styles.push(txtRes.style)
    if (!bgRes.style) classes.push(`hover:${bgRes.className}`, 'hover:text-white')
  } else {
    classes.push(bgRes.className)
    if (bgRes.style) styles.push(bgRes.style)
    if (textColor && textColor !== 'default') {
      const overrideRes = resolveColorValue(textColor, 'text')
      classes.push(overrideRes.className)
      if (overrideRes.style) styles.push(overrideRes.style)
    } else {
      const auto = autoContrastFor(color)
      classes.push(auto.className)
      if (auto.style) styles.push(auto.style)
    }
  }
  return { classes: classes.filter(Boolean), style: styles.join(';') }
}

// ── Text color (per-element, from textStyles group) ─────────
// Returns className string. Hex path → empty class → caller pakai
// `resolveTextColorStyle(v)` untuk inline style (backward compat helper —
// callers baru bisa pakai `resolveColorValue(v, 'text')` langsung).
export const resolveTextColor = (v?: string) => resolveColorValue(v, 'text').className
export const resolveTextColorStyle = (v?: string) => resolveColorValue(v, 'text').style

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
