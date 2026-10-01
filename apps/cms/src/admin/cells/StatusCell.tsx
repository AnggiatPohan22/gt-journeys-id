'use client'
/**
 * GtJourneysID — Colored status chip for list views (Phase 4.12).
 *
 * Registered per-collection via a field's `admin.components.Cell`.
 * Reusable across every collection that has a `status` field. Reads
 * `cellData` (the raw select value) and renders a chip with color
 * driven by the status token.
 *
 * Status vocab this handles:
 *   - published → green (leaf)
 *   - draft     → amber/coral
 *   - active    → green (for ServiceTypes / Menus enum)
 *   - archived  → neutral gray
 *   - inactive  → neutral gray
 *   - (unknown) → neutral gray, raw value
 */
import React from 'react'

type Props = { cellData?: unknown }

const MAP: Record<string, { label: string; bg: string; fg: string; ring: string }> = {
  published: { label: 'Published', bg: 'rgba(107,144,128,0.15)', fg: '#3f7a5f', ring: 'rgba(107,144,128,0.35)' },
  active:    { label: 'Active',    bg: 'rgba(107,144,128,0.15)', fg: '#3f7a5f', ring: 'rgba(107,144,128,0.35)' },
  draft:     { label: 'Draft',     bg: 'rgba(224,122,95,0.15)',  fg: '#b95c3f', ring: 'rgba(224,122,95,0.35)' },
  archived:  { label: 'Archived',  bg: 'rgba(61,64,91,0.12)',    fg: '#3d405b', ring: 'rgba(61,64,91,0.28)' },
  inactive:  { label: 'Inactive',  bg: 'rgba(61,64,91,0.12)',    fg: '#3d405b', ring: 'rgba(61,64,91,0.28)' },
}

const StatusCell: React.FC<Props> = ({ cellData }) => {
  const raw = typeof cellData === 'string' ? cellData : ''
  const meta = MAP[raw] ?? { label: raw || '—', bg: 'rgba(133,133,141,0.14)', fg: '#585860', ring: 'rgba(133,133,141,0.30)' }
  return (
    <span
      className="dnj-status-chip"
      data-status={raw}
      style={{
        background: meta.bg,
        color: meta.fg,
        boxShadow: `inset 0 0 0 1px ${meta.ring}`,
      }}
    >
      {meta.label}
    </span>
  )
}

export default StatusCell
