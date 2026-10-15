'use client'
/**
 * Phase 4.72 — Formatted price cell for Bookings list view.
 *
 * Reads `cellData` (the price field value) + `rowData.currency` (sibling
 * on the same booking row) and renders via shared `formatPrice`. Falls
 * back to "-" for empty/NaN amounts.
 *
 * Payload v3 passes `rowData` so we can combine fields; useful for
 * `unitPrice`, `totalEstimate`, `returnUnitPrice`, `returnTotalEstimate`
 * — all share one currency per booking.
 */
import React from 'react'
import { formatPrice } from '@gt-journeys/shared'

type Props = {
  cellData?: unknown
  rowData?: { currency?: string | null } & Record<string, unknown>
}

const PriceCell: React.FC<Props> = ({ cellData, rowData }) => {
  const amount =
    typeof cellData === 'number'
      ? cellData
      : typeof cellData === 'string' && cellData.trim() !== ''
      ? Number(cellData)
      : null
  const currency = typeof rowData?.currency === 'string' ? rowData.currency : 'IDR'
  return <span className="dnj-price-cell tabular-nums">{formatPrice(amount, currency)}</span>
}

export default PriceCell
