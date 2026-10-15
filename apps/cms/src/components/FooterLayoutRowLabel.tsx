'use client'
/**
 * GtJourneysID — Footer Layout Column RowLabel (Phase 4.48.1).
 *
 * Registered via `admin.components.RowLabel` pada
 * `footerSettings.layoutColumns` array. Payload render sebagai header
 * baris (kolapsed row) menggantikan default "Row 01".
 *
 * Output shape:
 *   [🟦 BRAND]  "Contact Us"  · 25%             #01
 *   └badge─┘    └── heading ──┘  └width┘        └row #┘
 *
 * Warna badge di-sync dengan CSS `[data-type]` di `footer-layout.css`
 * (dan border-left row via `:has()` selector).
 */
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type ColumnType = 'brand' | 'menuList' | 'services' | 'contact' | 'paymentMethods' | 'custom'

type Data = {
  type?: ColumnType
  width?: 'auto' | '25' | '33' | '50'
  heading?: string
}

// Mirror admin-global.css brand palette (ocean/coral/leaf/stone/midnight).
const TYPE_META: Record<ColumnType, { label: string; color: string }> = {
  brand:          { label: 'Brand',           color: '#1b3a4b' /* ocean */ },
  menuList:       { label: 'Menu List',       color: '#3d405b' /* stone */ },
  services:       { label: 'Services',        color: '#24506a' /* ocean-mid */ },
  contact:        { label: 'Contact',         color: '#484850' /* neutral-3 */ },
  paymentMethods: { label: 'Payment',         color: '#c98a5f' /* amber-coral */ },
  custom:         { label: 'Custom',          color: '#6b9080' /* leaf */ },
}

const FALLBACK = { label: 'Column', color: '#585860' }

const WIDTH_LABEL: Record<NonNullable<Data['width']>, string> = {
  auto: 'auto',
  '25': '25%',
  '33': '33%',
  '50': '50%',
}

const FooterLayoutRowLabel: React.FC = () => {
  const row = useRowLabel<Data>()
  const data = (row?.data ?? {}) as Data
  const type = data.type ?? undefined
  const meta = type ? TYPE_META[type] ?? FALLBACK : FALLBACK
  const heading = (data.heading ?? '').trim()
  const widthLabel = data.width ? WIDTH_LABEL[data.width] : ''
  const rowNum =
    typeof row?.rowNumber === 'number' ? String(row.rowNumber + 1).padStart(2, '0') : null

  return (
    <span className="dnj-fl-row" data-type={type ?? 'unknown'}>
      <span
        className="dnj-fl-row__badge"
        style={{ background: meta.color, color: '#fff' }}
      >
        {meta.label}
      </span>
      {heading ? (
        <span className="dnj-fl-row__summary">{heading}</span>
      ) : type === 'brand' ? (
        <span className="dnj-fl-row__summary dnj-fl-row__summary--dim">Logo · tagline · social</span>
      ) : type === 'paymentMethods' ? (
        <span className="dnj-fl-row__summary dnj-fl-row__summary--dim">Badges dari SiteSettings</span>
      ) : (
        <span className="dnj-fl-row__summary dnj-fl-row__summary--empty">(no heading)</span>
      )}
      {widthLabel && (
        <span className="dnj-fl-row__width">{widthLabel}</span>
      )}
      {rowNum !== null && (
        <span className="dnj-fl-row__num">#{rowNum}</span>
      )}
    </span>
  )
}

export default FooterLayoutRowLabel
