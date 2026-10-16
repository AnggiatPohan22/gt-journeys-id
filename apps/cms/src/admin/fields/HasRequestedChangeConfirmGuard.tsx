'use client'
/**
 * Step 3.4 — Confirmation modal untuk un-check `hasRequestedChange`.
 *
 * Pattern sama dengan DepartureDateConfirmGuard: UI sibling, useField
 * watch perubahan, modal "Lanjut / Batal", cancel revert via setValue.
 *
 * Trigger: hanya saat value TRUE → FALSE (un-check). Admin check-ulang
 * (false → true) tidak di-prompt (set-forward intentional).
 */
import React, { useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'

export default function HasRequestedChangeConfirmGuard() {
  const flag = useField<boolean | null | undefined>({ path: 'hasRequestedChange' })

  const prevValueRef = useRef<boolean | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const cur = flag.value === true
    if (prevValueRef.current === undefined) {
      prevValueRef.current = flag.initialValue === true || cur
      return
    }
    const prev = prevValueRef.current
    if (cur === prev) return

    if (prev === true && cur === false && !modalOpen) {
      // Un-check. Prompt.
      setModalOpen(true)
    } else {
      prevValueRef.current = cur
    }
  }, [flag.value, flag.initialValue, modalOpen])

  if (!modalOpen) return null

  const confirm = () => {
    prevValueRef.current = false
    setModalOpen(false)
  }
  const cancel = () => {
    flag.setValue(true)
    prevValueRef.current = true
    setModalOpen(false)
  }

  return (
    <div className="bk-modal" role="dialog" aria-modal="true" onClick={cancel}>
      <div
        className="bk-modal__inner"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bk-modal__header">
          <h3>Reset flag request change?</h3>
          <button type="button" className="bk-modal__close" onClick={cancel} aria-label="Close">
            ×
          </button>
        </header>
        <div className="bk-modal__body">
          <div className="bk-modal__warning bk-modal__warning--resend" role="alert">
            ⚠ Flag ini default <strong>one-shot</strong>: customer hanya
            boleh 1x submit permintaan reschedule/cancel. Setelah un-check,
            customer bisa submit permintaan baru dari halaman confirmation
            booking ini.
          </div>
          <p className="bk-modal__hint">
            Lanjutkan hanya untuk exceptional case (edge case customer yang perlu request ulang).
          </p>
        </div>
        <footer className="bk-modal__footer">
          <button type="button" className="bk-modal__btn" onClick={cancel}>
            Batal
          </button>
          <button type="button" className="bk-modal__btn bk-modal__btn--primary" onClick={confirm}>
            Reset flag
          </button>
        </footer>
      </div>
    </div>
  )
}
