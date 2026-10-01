'use client'
/**
 * GtJourneysID — Relative date cell (Phase 4.12).
 *
 * Renders "2 hours ago" style text with the full ISO timestamp exposed
 * via `title` tooltip. Reusable across every list view that displays
 * updatedAt / createdAt.
 *
 * Uses `Intl.RelativeTimeFormat` (built-in) — no dependency added.
 * The visible text updates once per mount; users refresh the list
 * naturally by navigating, so a live tick isn't needed.
 */
import React from 'react'

const format = (input?: unknown): { rel: string; abs: string } => {
  if (!input) return { rel: '—', abs: '' }
  const d = new Date(input as any)
  if (isNaN(d.getTime())) return { rel: '—', abs: String(input) }
  const abs = d.toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const diffMs = d.getTime() - Date.now()
  const absDiff = Math.abs(diffMs)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year',   365 * 24 * 60 * 60 * 1000],
    ['month',   30 * 24 * 60 * 60 * 1000],
    ['week',     7 * 24 * 60 * 60 * 1000],
    ['day',          24 * 60 * 60 * 1000],
    ['hour',              60 * 60 * 1000],
    ['minute',                 60 * 1000],
    ['second',                      1000],
  ]
  for (const [unit, ms] of units) {
    if (absDiff >= ms || unit === 'second') {
      const value = Math.round(diffMs / ms)
      return { rel: rtf.format(value, unit), abs }
    }
  }
  return { rel: 'just now', abs }
}

const RelativeDateCell: React.FC<{ cellData?: unknown }> = ({ cellData }) => {
  const { rel, abs } = format(cellData)
  return (
    <span className="dnj-relative-date" title={abs}>{rel}</span>
  )
}

export default RelativeDateCell
