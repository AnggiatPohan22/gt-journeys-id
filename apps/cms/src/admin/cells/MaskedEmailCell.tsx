'use client'
/**
 * Step 3.2 — Masked email cell for Bookings list view.
 *
 * Render: first char of local part + bullets + full domain, e.g.
 *   "jane@gmail.com" → "j••@gmail.com"
 *   "a@b.co"         → "a••@b.co"
 *   "no-at-string"   → "•••" (defensive — never leak)
 *
 * Full value tetap tersedia di detail view (field tanpa Cell custom di
 * sana). Masking di sini adalah UX layer; server access rule tidak
 * berubah.
 */
import React from 'react'

type Props = { cellData?: unknown }

function maskEmail(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const atIdx = trimmed.lastIndexOf('@')
  if (atIdx < 1) return '•••'
  const local = trimmed.slice(0, atIdx)
  const domain = trimmed.slice(atIdx) // includes '@'
  const head = local[0] ?? ''
  return `${head}••${domain}`
}

const MaskedEmailCell: React.FC<Props> = ({ cellData }) => {
  const raw = typeof cellData === 'string' ? cellData : ''
  if (!raw) return <span className="dnj-masked-cell dnj-masked-cell--empty">—</span>
  return (
    <span
      className="dnj-masked-cell"
      title="Full email visible on the booking detail page"
    >
      {maskEmail(raw)}
    </span>
  )
}

export default MaskedEmailCell
