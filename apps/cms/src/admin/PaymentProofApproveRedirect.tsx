'use client'
/**
 * PaymentProofApproveRedirect — Phase 4.75.
 *
 * Client UI component (zero visual output) di PaymentProofs edit view.
 * Fungsi: setelah admin SAVE perubahan status ke `approved`, redirect
 * otomatis ke booking edit view supaya admin bisa confirm status booking
 * sudah jadi `confirmed` + lihat e-ticket terkirim.
 *
 * Detection pattern:
 *   - Watch `updatedAt` field value (Payload refresh form state setelah
 *     save sukses; updatedAt dari server berubah).
 *   - Transisi updatedAt (prev → curr) = sinyal "save just completed".
 *   - Kalau saat itu status=approved + ada booking relation → redirect.
 *
 * Tidak intercept save button — biar Payload native flow (validation,
 * error handling, success toast) tetap jalan. Redirect fire SETELAH
 * save sukses, dengan small delay supaya toast sempat terlihat.
 */

import React, { useEffect, useRef } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

const PaymentProofApproveRedirect: React.FC = () => {
  const [fields] = useAllFormFields()
  const prevUpdatedAtRef = useRef<string | null>(null)
  const didInitRef = useRef(false)
  const didRedirectRef = useRef(false)

  useEffect(() => {
    const curUpdatedAt =
      typeof fields?.updatedAt?.value === 'string' ? fields.updatedAt.value : ''

    // First mount: just snapshot current updatedAt as baseline.
    if (!didInitRef.current) {
      prevUpdatedAtRef.current = curUpdatedAt
      didInitRef.current = true
      return
    }

    // Guard: redirect only once per mount; subsequent re-renders no-op.
    if (didRedirectRef.current) return

    // Save completion signal: updatedAt changed from baseline.
    if (
      curUpdatedAt &&
      prevUpdatedAtRef.current !== null &&
      curUpdatedAt !== prevUpdatedAtRef.current
    ) {
      prevUpdatedAtRef.current = curUpdatedAt

      const status =
        typeof fields?.status?.value === 'string' ? fields.status.value : ''
      if (status !== 'approved') return

      // Resolve booking id (field value bisa number direct atau object).
      const raw = fields?.booking?.value as unknown
      const bookingId =
        typeof raw === 'number'
          ? raw
          : typeof raw === 'string' && raw
            ? Number(raw)
            : typeof raw === 'object' && raw !== null
              ? Number((raw as { id?: number | string }).id ?? 0)
              : 0
      if (!bookingId || Number.isNaN(bookingId) || bookingId <= 0) return

      didRedirectRef.current = true
      // Small delay supaya success toast + hook afterChange (send-ticket
      // self-call) sempat kelar sebelum redirect.
      window.setTimeout(() => {
        window.location.href = `/admin/collections/bookings/${bookingId}`
      }, 1200)
    }
  }, [fields])

  return null
}

export default PaymentProofApproveRedirect
