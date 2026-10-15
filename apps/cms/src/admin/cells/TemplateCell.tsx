'use client'
/**
 * GtJourneysID — Template badge for the Pages list (Phase 4.12).
 *
 * Reads cellData (the raw `template` select value) and renders a subtle
 * neutral chip so it doesn't compete visually with the Status chip.
 */
import React from 'react'

const LABELS: Record<string, string> = {
  default:          'Default',
  about:            'About',
  contact:          'Contact',
  landing:          'Landing',
  service_listing:  'Service Listing',
}

const TemplateCell: React.FC<{ cellData?: unknown }> = ({ cellData }) => {
  const raw = typeof cellData === 'string' ? cellData : ''
  const label = LABELS[raw] ?? raw ?? '—'
  return (
    <span className="dnj-template-chip" data-template={raw}>{label}</span>
  )
}

export default TemplateCell
