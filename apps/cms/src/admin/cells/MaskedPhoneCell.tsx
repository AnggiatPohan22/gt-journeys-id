'use client'
/**
 * Step 3.2 — Masked phone cell for Bookings list view.
 *
 * Reusable untuk `customerWhatsapp` (snapshot `{region}{phone}`) +
 * `contactPhone` (region di kolom lain). Rule: tampilkan optional
 * leading '+' + 1–3 digit awal (country code) + bullets + 2 digit
 * terakhir.
 *
 *   "+6281234567890" → "+62•••••••90"
 *   "81234567890"    → "8•••••••90"
 *   "12345"          → "1••45"   (fall back lebih aman untuk short)
 *   ""               → "—"
 *   "???"            → "•••"
 *
 * Full value visible di detail view.
 */
import React from 'react'

type Props = { cellData?: unknown }

function maskPhone(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // Preserve leading '+' kalau ada, lalu ambil digit saja.
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D+/g, '')
  if (digits.length === 0) return '•••'
  if (digits.length <= 4) {
    // Short string (unusual) — tampilkan 1 head + bullets + 2 tail.
    const head = digits.slice(0, 1)
    const tail = digits.slice(-2)
    return `${hasPlus ? '+' : ''}${head}••${tail}`
  }

  // Head: 2 digits (sesuai pola country code tanpa +, e.g. "62", "65"),
  // atau 3 kalau ada '+' (preserve "+62"). Keep sederhana — 2 default.
  const headLen = hasPlus ? Math.min(2, digits.length - 2) : Math.min(1, digits.length - 2)
  const head = digits.slice(0, headLen)
  const tail = digits.slice(-2)
  const midLen = Math.max(3, digits.length - headLen - 2)
  const bullets = '•'.repeat(midLen)
  return `${hasPlus ? '+' : ''}${head}${bullets}${tail}`
}

const MaskedPhoneCell: React.FC<Props> = ({ cellData }) => {
  const raw = typeof cellData === 'string' ? cellData : ''
  if (!raw) return <span className="dnj-masked-cell dnj-masked-cell--empty">—</span>
  return (
    <span
      className="dnj-masked-cell"
      title="Full number visible on the booking detail page"
    >
      {maskPhone(raw)}
    </span>
  )
}

export default MaskedPhoneCell
