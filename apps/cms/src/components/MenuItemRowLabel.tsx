'use client'
/**
 * GtJourneysID — Menu item RowLabel (Phase 4.13).
 *
 * Rendered by Payload as the collapsed row header on Menus > items.
 * Reads the row data via `useRowLabel` and emits classed markup so all
 * styling lives in `admin/menu-editor.css` (no inline styles).
 *
 * Output shape:
 *   [🔗 CUSTOM]  Home         /home             · 3 sub-items
 *   └badge─┘     └─label──┘   └────url────┘     └children hint┘
 */
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type Data = {
  label?: string
  type?: 'page' | 'service_index' | 'custom_url' | 'anchor' | 'none'
  url?: string
  page?: { slug?: string; title?: string } | string | null
  children?: unknown[]
}

const TYPE_META: Record<NonNullable<Data['type']>, { icon: string; label: string }> = {
  page:          { icon: '📄', label: 'Page' },
  service_index: { icon: '🧭', label: 'Service' },
  custom_url:    { icon: '🔗', label: 'URL' },
  anchor:        { icon: '⚓', label: 'Anchor' },
  none:          { icon: '🏷️', label: 'Group' },
}

export const MenuItemRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Data>()

  if (!data?.label) {
    return (
      <span className="dnj-menu-row dnj-menu-row--empty">
        <span className="dnj-menu-row__badge dnj-menu-row__badge--empty">NEW</span>
        <span className="dnj-menu-row__label">
          Menu item baru — klik untuk edit
          <span className="dnj-menu-row__idx">#{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
        </span>
      </span>
    )
  }

  const meta = data.type ? TYPE_META[data.type] : { icon: '•', label: '—' }
  const preview =
    data.type === 'none'
      ? '(dropdown only)'
      : data.type === 'page' && typeof data.page === 'object' && data.page
        ? `/${data.page.slug ?? '…'}`
        : data.url || '—'
  const childCount = Array.isArray(data.children) ? data.children.length : 0

  return (
    <span className="dnj-menu-row" data-type={data.type ?? 'unknown'}>
      <span className="dnj-menu-row__badge" data-type={data.type ?? 'unknown'}>
        <span className="dnj-menu-row__badge-icon" aria-hidden="true">{meta.icon}</span>
        <span className="dnj-menu-row__badge-text">{meta.label}</span>
      </span>
      <span className="dnj-menu-row__label">{data.label}</span>
      <span className="dnj-menu-row__url">{preview}</span>
      {childCount > 0 && (
        <span className="dnj-menu-row__count">{childCount} {childCount === 1 ? 'sub-item' : 'sub-items'}</span>
      )}
    </span>
  )
}

export default MenuItemRowLabel
