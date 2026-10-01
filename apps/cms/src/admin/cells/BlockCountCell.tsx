'use client'
/**
 * GtJourneysID — Block-count cell for the Pages list (Phase 4.12).
 *
 * Attached as `admin.components.Cell` on a `ui`-type virtual field.
 * Reads rowData.content (the Pages blocks array) and renders "N blocks".
 * Falls back to "—" when the page has no content.
 */
import React from 'react'

type Props = { rowData?: { content?: unknown[] } | Record<string, unknown> }

const BlockCountCell: React.FC<Props> = ({ rowData }) => {
  const content = (rowData as any)?.content
  const n = Array.isArray(content) ? content.length : 0
  if (!n) return <span className="dnj-block-count dnj-block-count--empty">—</span>
  return <span className="dnj-block-count">{n} {n === 1 ? 'block' : 'blocks'}</span>
}

export default BlockCountCell
