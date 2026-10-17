'use client'
/**
 * BookingPaymentProofButton — Phase 4.75.
 *
 * Context button di booking edit view yang menautkan admin langsung ke
 * Payment Proof terkait (atau create form manual kalau proof belum ada —
 * case WA/offline). Tujuan: alur reservasi → review → check payment →
 * send e-ticket jalan tanpa admin lompat-lompat.
 *
 * Visibility:
 *   - status = payment_review + latestPaymentProof ADA  → "Review Payment Proof" (primary)
 *   - status = payment_review + latestPaymentProof null → "Open Payment Proofs (Manual Entry)" (secondary)
 *   - status != payment_review                          → render null (hidden)
 */

import React from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

const BookingPaymentProofButton: React.FC = () => {
  const { id: bookingId } = useDocumentInfo()
  const [fields] = useAllFormFields()

  const status =
    (typeof fields?.status?.value === 'string' && fields.status.value) || ''
  if (status !== 'payment_review') return null

  const bookingRef =
    (typeof fields?.bookingRef?.value === 'string' && fields.bookingRef.value) || ''

  // latestPaymentProof field value bisa number (id langsung) atau object
  // dengan .value (Payload form state wrapper). Normalize ke number.
  const rawLatest = fields?.latestPaymentProof?.value as unknown
  const proofId =
    typeof rawLatest === 'number'
      ? rawLatest
      : typeof rawLatest === 'string' && rawLatest
        ? Number(rawLatest)
        : typeof rawLatest === 'object' && rawLatest !== null
          ? Number((rawLatest as { id?: number | string }).id ?? 0)
          : 0

  const hasProof = proofId > 0

  const href = hasProof
    ? `/admin/collections/payment-proofs/${proofId}`
    : `/admin/collections/payment-proofs/create`

  const label = hasProof
    ? '📄 Review Payment Proof'
    : '➕ Open Payment Proofs (Manual Entry)'

  const bgColor = hasProof ? 'var(--theme-success-500, #10B981)' : 'var(--theme-elevation-500, #6B7280)'
  const hoverFilter = 'brightness(0.92)'

  const infoText = hasProof
    ? `Bukti pembayaran tersedia — klik untuk approve/reject. Approve otomatis kirim receipt + e-ticket ke customer.`
    : `Belum ada bukti pembayaran self-service. Buat entry manual (case WA/offline). Pilih booking "${bookingRef || `#${bookingId}`}" dari relationship dropdown di form create.`

  return (
    <div
      style={{
        marginTop: 12,
        marginBottom: 12,
        padding: 14,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-500)',
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Phase 4.75 — Payment Proof Shortcut
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <a
          href={href}
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: bgColor,
            color: '#fff',
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 13,
            transition: 'filter 150ms',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.filter = hoverFilter
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.filter = 'none'
          }}
        >
          {label}
        </a>
        <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)', flex: '1 1 240px', lineHeight: 1.5 }}>
          {infoText}
        </div>
      </div>
      {!hasProof && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            fontSize: 11,
            color: 'var(--theme-warning-700, #B45309)',
            background: 'var(--theme-warning-50, #FEF3C7)',
            border: '1px solid var(--theme-warning-200, #FDE68A)',
            borderRadius: 4,
          }}
        >
          ⚠ Reminder: upload e-ticket di section "Payment → E-Tickets" sebelum approve. Tanpa e-ticket, approve akan ditolak.
        </div>
      )}
    </div>
  )
}

export default BookingPaymentProofButton
