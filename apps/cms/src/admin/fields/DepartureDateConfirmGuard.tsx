'use client'
/**
 * Step 3.4 — Confirmation modal untuk edit `departureDate` saat booking
 * sudah ∈ {confirmed, reschedule_request, cancel_request, cancelled,
 * expired}.
 *
 * Pattern: UI sibling (bukan field replacement). useField watch
 * `departureDate` + `status`. Saat value berubah DAN status di gated
 * set, tampilkan modal "Lanjut ubah / Batal". Cancel → revert via
 * setValue(prev). Confirm → accept new value.
 *
 * Pattern "confirm after change" (bukan "confirm before"): user tetap
 * lihat date picker native Payload, modal datang setelah commit value.
 * Cancel sepenuhnya revert — nilai di-rollback sebelum save, sehingga
 * audit hook (Step 2.3) tidak fire.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'

const GATED_STATUSES = new Set([
  'confirmed',
  'reschedule_request',
  'cancel_request',
  'cancelled',
  'expired',
])

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '(none)'
  const trimmed = String(iso).slice(0, 10)
  return trimmed || '(none)'
}

export default function DepartureDateConfirmGuard() {
  const date = useField<string | null>({ path: 'departureDate' })
  const status = useField<string>({ path: 'status' })

  // `undefined` = not initialized yet. First effect pass seeds it from
  // initialValue → prevents false-positive modal on form hydrate.
  const prevValueRef = useRef<string | null | undefined>(undefined)
  const [modal, setModal] = useState<{ next: string | null; prev: string | null } | null>(null)

  useEffect(() => {
    const cur = date.value ?? null
    if (prevValueRef.current === undefined) {
      prevValueRef.current = date.initialValue ?? cur
      return
    }
    const prev = prevValueRef.current
    if (cur === prev) return

    const effectiveStatus = typeof status.value === 'string' ? status.value : ''
    if (GATED_STATUSES.has(effectiveStatus) && !modal) {
      setModal({ next: cur, prev })
    } else {
      prevValueRef.current = cur
    }
  }, [date.value, date.initialValue, status.value, modal])

  if (!modal) return null

  const confirm = () => {
    prevValueRef.current = modal.next
    setModal(null)
  }
  const cancel = () => {
    date.setValue(modal.prev)
    prevValueRef.current = modal.prev
    setModal(null)
  }

  return (
    <div className="bk-modal" role="dialog" aria-modal="true" onClick={cancel}>
      <div
        className="bk-modal__inner"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bk-modal__header">
          <h3>Ubah tanggal keberangkatan?</h3>
          <button type="button" className="bk-modal__close" onClick={cancel} aria-label="Close">
            ×
          </button>
        </header>
        <div className="bk-modal__body">
          <div className="bk-modal__warning bk-modal__warning--resend" role="alert">
            ⚠ Booking status saat ini: <strong>{status.value}</strong>. Mengubah
            tanggal keberangkatan akan tercatat di <strong>Payment Audit Log</strong>.
            Customer <strong>tidak otomatis diberitahu</strong> — kirim notifikasi
            manual via resend receipt kalau perlu.
          </div>
          <p className="bk-modal__hint">
            Dari <strong>{formatDate(modal.prev)}</strong> ke <strong>{formatDate(modal.next)}</strong>.
          </p>
        </div>
        <footer className="bk-modal__footer">
          <button type="button" className="bk-modal__btn" onClick={cancel}>
            Batal
          </button>
          <button type="button" className="bk-modal__btn bk-modal__btn--primary" onClick={confirm}>
            Lanjut ubah
          </button>
        </footer>
      </div>
    </div>
  )
}
