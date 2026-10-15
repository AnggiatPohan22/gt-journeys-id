'use client'
/**
 * GtJourneysID — Menu child (sub-item) RowLabel (Phase 4.13).
 *
 * Same layout as MenuItemRowLabel but marks itself as child so CSS in
 * `admin/menu-editor.css` can render the indent, smaller badge, and
 * muted accent.
 */
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type Data = {
  label?: string
  type?: 'page' | 'custom_url' | 'anchor' | 'none'
  url?: string
  page?: { slug?: string; title?: string } | string | null
}

const TYPE_META: Record<NonNullable<Data['type']>, { icon: string; label: string }> = {
  page:       { icon: '📄', label: 'Page' },
  custom_url: { icon: '🔗', label: 'URL' },
  anchor:     { icon: '⚓', label: 'Anchor' },
  none:       { icon: '🏷️', label: 'Label' },
}

export const MenuChildRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Data>()

  if (!data?.label) {
    return (
      <span className="dnj-menu-row dnj-menu-row--child dnj-menu-row--empty">
        <span className="dnj-menu-row__badge dnj-menu-row__badge--empty">NEW</span>
        <span className="dnj-menu-row__label">
          Sub-item baru — klik untuk edit
          <span className="dnj-menu-row__idx">#{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
        </span>
      </span>
    )
  }

  const meta = data.type ? TYPE_META[data.type] : { icon: '🔗', label: '—' }
  const preview =
    data.type === 'none'
      ? '(label only)'
      : data.type === 'page' && typeof data.page === 'object' && data.page
        ? `/${data.page.slug ?? '…'}`
        : data.url || '—'

  return (
    <span className="dnj-menu-row dnj-menu-row--child" data-type={data.type ?? 'unknown'}>
      <span className="dnj-menu-row__badge" data-type={data.type ?? 'unknown'}>
        <span className="dnj-menu-row__badge-icon" aria-hidden="true">{meta.icon}</span>
        <span className="dnj-menu-row__badge-text">{meta.label}</span>
      </span>
      <span className="dnj-menu-row__label">{data.label}</span>
      <span className="dnj-menu-row__url">{preview}</span>
    </span>
  )
}

export default MenuChildRowLabel
