'use client'
/**
 * GtJourneysID — Custom collapsed block header (Phase 4.8, Goal 4).
 *
 * Registered via `admin.components.Label` on each block in `blocks/index.ts`.
 * Payload renders this in place of the default "Hero 01" row header.
 *
 * Reads block data via `useRowLabel` (Payload UI hook). Because the block's
 * own `blockType` is available on `data`, ONE component covers all 16 blocks
 * → colour + summary are driven from the map below (single source of truth).
 *
 * Renders:
 *   [🟦 Hero]  ·  "Discover Bali"                             #3
 *   └ badge ─┘   └── summary (first meaningful field) ──┘   └ row #
 *
 * Design tokens: colours pulled from admin-global.css / custom.css brand
 * palette (ocean/coral/leaf/stone/midnight) — same TextStateFeature palette
 * as Lexical rich text.
 */
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type BadgeSpec = { label: string; color: string; group?: string }

const BLOCK_META: Record<string, BadgeSpec> = {
  // Layout
  hero:                  { label: 'Hero',                 color: '#1b3a4b' /* ocean */ },
  spacer:                { label: 'Spacer',               color: '#94949c' /* neutral */ },
  // Content
  richText:              { label: 'Text',                 color: '#3d405b' /* stone */ },
  image:                 { label: 'Image',                color: '#6b9080' /* leaf */ },
  gallery:               { label: 'Gallery',              color: '#6b9080' /* leaf */ },
  embed:                 { label: 'Embed',                color: '#767680' /* neutral-dark */ },
  // Marketing
  cta:                   { label: 'CTA',                  color: '#e07a5f' /* coral */ },
  trustBadges:           { label: 'Trust Badges',         color: '#e07a5f' /* coral */ },
  valuePropsBanner:      { label: 'Value Props',          color: '#c98a5f' /* amber-coral */ },
  statsBanner:           { label: 'Stats Banner',         color: '#0d1b2a' /* midnight */ },
  // Services
  serviceGrid:           { label: 'Service Grid',         color: '#24506a' /* ocean-mid */ },
  serviceListing:        { label: 'Service Listing',      color: '#1b3a4b' /* ocean */ },
  // Social proof
  testimonials:          { label: 'Testimonials',         color: '#0d1b2a' /* midnight */ },
  testimonialsCarousel:  { label: 'Testimonials Carousel',color: '#0d1b2a' /* midnight */ },
  faq:                   { label: 'FAQ',                  color: '#585860' /* neutral-2 */ },
  // Utility
  contact:               { label: 'Contact',              color: '#484850' /* neutral-3 */ },
}

const FALLBACK: BadgeSpec = { label: 'Block', color: '#585860' }

/** Truncate a string to n chars (word-safe when possible). */
const clip = (s: string, n = 60): string => {
  if (!s) return ''
  const trimmed = s.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= n) return trimmed
  return trimmed.slice(0, n - 1).replace(/\s\S*$/, '') + '…'
}

/** Extract a meaningful preview from the block's data based on its type. */
const summarize = (blockType: string, d: Record<string, any>): string => {
  if (!d) return ''
  // Direct text fields (common)
  const candidates = [d.heading, d.title, d.eyebrow, d.embedType, d.serviceType]
  for (const c of candidates) if (typeof c === 'string' && c.trim()) return clip(c)

  switch (blockType) {
    case 'richText': {
      // Lexical root → try to yank the first paragraph text
      const root = d?.content?.root
      const first = root?.children?.[0]?.children?.[0]?.text
      if (typeof first === 'string' && first.trim()) return clip(first)
      return ''
    }
    case 'image':   return d.caption ? clip(d.caption) : d.image ? '1 image' : ''
    case 'gallery': {
      const n = Array.isArray(d.images) ? d.images.length : 0
      return n ? `${n} image${n === 1 ? '' : 's'}` : ''
    }
    case 'faq': {
      const n = Array.isArray(d.items) ? d.items.length : 0
      return n ? `${n} question${n === 1 ? '' : 's'}` : ''
    }
    case 'testimonials':
    case 'testimonialsCarousel': {
      const src = d.source === 'collection' ? 'From collection' : 'Inline'
      const n = Array.isArray(d.items) ? d.items.length : 0
      return d.source === 'collection' ? src : n ? `${n} testimonial${n === 1 ? '' : 's'}` : src
    }
    case 'valuePropsBanner':
    case 'trustBadges': {
      const arr = d.items || d.badges
      const n = Array.isArray(arr) ? arr.length : 0
      return n ? `${n} item${n === 1 ? '' : 's'}` : ''
    }
    case 'spacer': return d.height ? `Height: ${d.height}` : ''
    case 'embed':  return d.embedType ? d.embedType : ''
    case 'contact': {
      const flags: string[] = []
      if (d.showMap) flags.push('Map')
      if (d.showWhatsApp) flags.push('WhatsApp')
      return flags.join(' · ')
    }
    case 'cta':    return d.buttonText ? clip(d.buttonText) : ''
    default:       return ''
  }
}

/**
 * Single Label component for all 16 blocks. Determines colour + display name
 * from `data.blockType`. Registered as `/blocks/BlockLabel#default` on every
 * block in `blocks/index.ts`.
 */
const BlockLabel: React.FC = () => {
  const row = useRowLabel<Record<string, any>>()
  const data = (row?.data ?? {}) as Record<string, any> & { blockType?: string }
  const type = data.blockType ?? ''
  const meta = BLOCK_META[type] ?? FALLBACK
  const summary = summarize(type, data)
  const rowNum = typeof row?.rowNumber === 'number' ? row.rowNumber + 1 : null

  return (
    <span className="dnj-block-label" data-block-type={type}>
      <span
        className="dnj-block-label__badge"
        style={{
          background: meta.color,
          color: '#fff',
        }}
      >
        {meta.label}
      </span>
      {summary ? (
        <span className="dnj-block-label__summary">{summary}</span>
      ) : (
        <span className="dnj-block-label__summary dnj-block-label__summary--empty">
          (empty)
        </span>
      )}
      {rowNum !== null && (
        <span className="dnj-block-label__num">#{rowNum}</span>
      )}
    </span>
  )
}

export default BlockLabel
