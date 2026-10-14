'use client'
/**
 * BookingAdminActions — Phase 4.69.7 (+ 4.70.2.6 split reschedule).
 *
 * Admin button sesuai status booking:
 *   - awaiting_review/pending       → Send Payment Instructions
 *   - payment_review/awaiting_payment → Confirm Payment & Send Ticket
 *   - reschedule_request            → Confirm Reschedule + Decline Reschedule
 *   - cancel_request                → Send Cancel Response
 *
 * Flow click:
 *   1. Open modal, textarea adminNote (opsional/wajib tergantung kind).
 *   2. Admin isi note → klik "Preview" → fetch POST { previewOnly: true, adminNote }.
 *   3. Render preview (subject + HTML/text + WA body).
 *   4. Admin klik "Confirm & Send" → POST ulang tanpa previewOnly.
 *   5. On success: show success + wa.me link → close reload form.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

type ActionKind =
  | 'payment'
  | 'ticket'
  | 'rescheduleConfirm'
  | 'rescheduleDecline'
  | 'cancelConfirm'
  | 'cancelDecline'

interface PreviewResult {
  ok: boolean
  previewOnly: boolean
  emailSubject?: string
  emailBody?: string
  emailBodyHtml?: string
  whatsappBody?: string
  waUrl?: string | null
  sentEmailId?: string
  newStatus?: string
  errors?: string[]
  // Phase 4.70.3.1
  receiptPreview?: { number: string; willAttachPdf: boolean; paymentBank: string; paymentDate: string }
  receiptNumber?: string
  warning?: string
}

interface BankAccount {
  bankName?: string
  accountNumber?: string
  accountHolder?: string
}

function statusToKinds(status: string | undefined): ActionKind[] {
  if (status === 'awaiting_review' || status === 'pending') return ['payment']
  if (status === 'payment_review' || status === 'awaiting_payment') return ['ticket']
  if (status === 'reschedule_request') return ['rescheduleConfirm', 'rescheduleDecline']
  if (status === 'cancel_request') return ['cancelConfirm', 'cancelDecline']
  return []
}

function kindToPath(kind: ActionKind): string {
  switch (kind) {
    case 'payment':           return 'send-payment'
    case 'ticket':            return 'send-ticket'
    case 'rescheduleConfirm': return 'confirm-reschedule'
    case 'rescheduleDecline': return 'decline-reschedule'
    case 'cancelConfirm':     return 'confirm-cancel'
    case 'cancelDecline':     return 'decline-cancel'
  }
}

function kindToLabel(kind: ActionKind): string {
  switch (kind) {
    case 'payment':           return 'Send Payment Instructions'
    case 'ticket':            return 'Confirm Payment & Send Receipt'
    case 'rescheduleConfirm': return 'Confirm Reschedule'
    case 'rescheduleDecline': return 'Decline Reschedule'
    case 'cancelConfirm':     return 'Confirm Cancellation (status → cancelled)'
    case 'cancelDecline':     return 'Decline Cancellation'
  }
}

function kindToEmoji(kind: ActionKind): string {
  switch (kind) {
    case 'payment':           return '📧'
    case 'ticket':            return '🎫'
    case 'rescheduleConfirm': return '✅'
    case 'rescheduleDecline': return '❌'
    case 'cancelConfirm':     return '🗑'
    case 'cancelDecline':     return '⚠'
  }
}

function kindNeedsNote(kind: ActionKind): 'optional' | 'required' | 'none' {
  if (kind === 'rescheduleConfirm') return 'optional'
  if (kind === 'rescheduleDecline') return 'required'
  if (kind === 'cancelConfirm') return 'optional'
  if (kind === 'cancelDecline') return 'required'
  return 'none'
}

function kindNoteLabel(kind: ActionKind): string {
  if (kind === 'rescheduleConfirm')
    return 'Catatan untuk customer (opsional — misal info biaya tambahan, kursi, atau ketentuan reschedule)'
  if (kind === 'rescheduleDecline')
    return 'Alasan DECLINE (WAJIB, min 10 karakter — misal "slot tanggal diminta sudah penuh")'
  if (kind === 'cancelConfirm')
    return 'Catatan untuk customer (opsional — misal info refund, kebijakan, atau next step)'
  if (kind === 'cancelDecline')
    return 'Alasan DECLINE (WAJIB, min 10 karakter — misal "sudah dekat tanggal keberangkatan, kebijakan tidak membolehkan cancel")'
  return ''
}

function kindNoteWarning(kind: ActionKind): string | null {
  if (kind === 'rescheduleConfirm')
    return '⚠ Pastikan Departure Date sudah di-update di form sebelum klik Preview.'
  if (kind === 'rescheduleDecline')
    return 'ℹ Jangan ubah Departure Date — booking akan tetap pakai jadwal semula.'
  if (kind === 'cancelConfirm')
    return '⚠ Setelah send, status booking jadi "cancelled" (final, tidak bisa di-undo via UI).'
  if (kind === 'cancelDecline')
    return 'ℹ Booking tetap berlaku jadwal semula. Status kembali ke status pre-request (misal awaiting_payment).'
  return null
}

const BookingAdminActions: React.FC = () => {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const status =
    (typeof fields?.status?.value === 'string' && fields.status.value) || ''
  const kinds = statusToKinds(status)

  const [open, setOpen] = useState(false)
  const [activeKind, setActiveKind] = useState<ActionKind | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [error, setError] = useState<string[] | null>(null)
  const [sent, setSent] = useState<PreviewResult | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  // Phase 4.70.3.1 — payment info untuk ticket kind.
  const [bankOptions, setBankOptions] = useState<BankAccount[] | null>(null)
  const [bankOptionsError, setBankOptionsError] = useState<string | null>(null)
  const [paymentBank, setPaymentBank] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  // Phase 4.70.3.1 (post-review) — in-flight guard untuk prevent double-send
  // race ketika admin klik "Confirm & Send" cepat 2x sebelum `loading` state propagate.
  const inflightRef = useRef<boolean>(false)

  const endpointPath = (k: ActionKind) => `/api/bookings/${id}/${kindToPath(k)}`

  // Phase 4.70.3.1 — Fetch global booking-templates untuk ambil bankAccounts
  // + default paymentDate (today in local).
  const fetchBankOptions = useCallback(async () => {
    setBankOptions(null)
    setBankOptionsError(null)
    try {
      const res = await fetch('/api/globals/booking-templates?depth=0', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { bankAccounts?: BankAccount[] }
      const banks = Array.isArray(data.bankAccounts) ? data.bankAccounts : []
      setBankOptions(banks)
      // Default first entry
      if (banks.length > 0 && !paymentBank) {
        setPaymentBank((banks[0].bankName ?? '').trim())
      }
    } catch (e: any) {
      setBankOptionsError(e?.message ?? 'Failed to fetch bank accounts')
    }
  }, [paymentBank])

  const fetchPreview = useCallback(
    async (k: ActionKind, note: string, bank?: string, date?: string) => {
      setLoading(true)
      setError(null)
      setPreview(null)
      setSent(null)
      try {
        const body: Record<string, unknown> = { previewOnly: true, adminNote: note }
        if (k === 'ticket') {
          body.paymentBank = bank ?? ''
          body.paymentDate = date ?? ''
        }
        const res = await fetch(endpointPath(k), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const data = (await res.json()) as PreviewResult
        if (!res.ok || !data.ok) {
          setError(data.errors ?? [`HTTP ${res.status}`])
          return
        }
        setPreview(data)
      } catch (e: any) {
        setError([e?.message ?? 'Network error'])
      } finally {
        setLoading(false)
      }
    },
    [id],
  )

  const openModal = (k: ActionKind) => {
    setActiveKind(k)
    setAdminNote('')
    setPreview(null)
    setError(null)
    setSent(null)
    setPaymentBank('')
    setPaymentDate('')
    setOpen(true)
    if (k === 'ticket') {
      // Phase 4.70.3.1 — fetch bank options + default paymentDate today.
      fetchBankOptions()
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      setPaymentDate(`${yyyy}-${mm}-${dd}`)
      // Don't auto-fetch preview — admin pick bank + date dulu, baru click Preview.
    } else if (kindNeedsNote(k) === 'none') {
      fetchPreview(k, '')
    }
  }

  const refreshPreview = () => {
    if (!activeKind) return
    if (activeKind === 'ticket') {
      if (!paymentBank) { setError(['Pilih Payment Bank dulu.']); return }
      if (!paymentDate) { setError(['Pilih Payment Date dulu.']); return }
      fetchPreview(activeKind, '', paymentBank, paymentDate)
      return
    }
    const noteKind = kindNeedsNote(activeKind)
    if (noteKind === 'required' && adminNote.trim().length < 10) {
      setError(['Alasan minimal 10 karakter.'])
      return
    }
    fetchPreview(activeKind, adminNote)
  }

  const confirmSend = useCallback(async () => {
    if (!activeKind) return
    // Phase 4.70.3.1 (post-review) — re-entrancy guard. `loading` state propagate
    // async; dua klik cepat sebelum setLoading(true) commit = dua request.
    // Idempotency key kita sekarang per-attempt (Date.now()), jadi dua request
    // = dua email terkirim. Guard via ref sinkronus.
    if (inflightRef.current) return
    inflightRef.current = true
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { previewOnly: false, adminNote }
      if (activeKind === 'ticket') {
        body.paymentBank = paymentBank
        body.paymentDate = paymentDate
      }
      const res = await fetch(endpointPath(activeKind), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as PreviewResult
      if (!res.ok || !data.ok) {
        setError(data.errors ?? [`HTTP ${res.status}`])
        return
      }
      setSent(data)
      setPreview(data)
    } catch (e: any) {
      setError([e?.message ?? 'Network error'])
    } finally {
      setLoading(false)
      inflightRef.current = false
    }
  }, [activeKind, adminNote, paymentBank, paymentDate, id])

  const close = () => {
    setOpen(false)
    setPreview(null)
    setError(null)
    setActiveKind(null)
    setAdminNote('')
    if (sent) {
      window.setTimeout(() => window.location.reload(), 200)
    }
    setSent(null)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sent])

  if (!id) {
    return (
      <div className="bk-admin-actions">
        <p className="bk-admin-actions__caption">
          Save booking terlebih dahulu untuk mengaktifkan admin actions.
        </p>
      </div>
    )
  }

  const noteMode = activeKind ? kindNeedsNote(activeKind) : 'none'
  const noteWarning = activeKind ? kindNoteWarning(activeKind) : null
  const previewDisabled =
    loading ||
    (noteMode === 'required' && adminNote.trim().length < 10)

  return (
    <div className="bk-admin-actions">
      <style>{css}</style>
      {kinds.length === 0 && (
        <p className="bk-admin-actions__caption">
          Admin actions tidak tersedia untuk status <strong>{status || 'unknown'}</strong>.
        </p>
      )}

      {kinds.length > 0 && (
        <div className="bk-admin-actions__row">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              className={`bk-admin-actions__btn bk-admin-actions__btn--${k}`}
              onClick={() => openModal(k)}
            >
              {kindToEmoji(k)} {kindToLabel(k)}
            </button>
          ))}
          <span className="bk-admin-actions__hint">
            Preview email + WA message akan ditampilkan sebelum kirim.
          </span>
        </div>
      )}

      {open && activeKind && (
        <div className="bk-modal" role="dialog" aria-modal="true" onClick={close}>
          <div
            className="bk-modal__inner"
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="bk-modal__header">
              <h3>{kindToLabel(activeKind)}</h3>
              <button
                type="button"
                className="bk-modal__close"
                onClick={close}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="bk-modal__body">
              {activeKind === 'ticket' && (
                <section className="bk-modal__section">
                  {status === 'confirmed' && (
                    <div className="bk-modal__warning bk-modal__warning--resend" role="alert">
                      <strong>Resend mode:</strong> Booking ini sudah pernah dikonfirmasi.
                      Submit akan mengirim <strong>receipt KEDUA</strong> ke customer dengan nomor &amp; tanggal terbit yang sama.
                      Perubahan Payment Bank atau Payment Date akan dicatat di <code>paymentAuditLog</code> untuk audit.
                    </div>
                  )}
                  <div className="bk-modal__warning bk-modal__warning--ticket" role="status">
                    ⚠ Pastikan customer sudah transfer sebelum confirm. Pilih bank penerima + tanggal transfer di bawah.
                  </div>
                  {bankOptionsError && (
                    <div className="bk-modal__error" role="alert">Failed to load bank accounts: {bankOptionsError}</div>
                  )}
                  {bankOptions !== null && bankOptions.length === 0 && (
                    <div className="bk-modal__error" role="alert">
                      Bank Accounts belum dikonfigurasi di global <strong>Booking Templates → tab Bank Accounts</strong>. Tambahkan dulu sebelum send receipt.
                    </div>
                  )}
                  {bankOptions === null && !bankOptionsError && (
                    <p className="bk-modal__loading">Loading bank options…</p>
                  )}
                  {bankOptions !== null && bankOptions.length > 0 && (
                    <div className="bk-modal__payment-grid">
                      <div className="bk-modal__field">
                        <label htmlFor="bk-payment-bank">Payment Bank *</label>
                        <select
                          id="bk-payment-bank"
                          className="bk-modal__input"
                          value={paymentBank}
                          onChange={(e) => setPaymentBank(e.target.value)}
                        >
                          <option value="">— Pilih bank —</option>
                          {bankOptions.map((b, i) => (
                            <option key={i} value={(b.bankName ?? '').trim()}>
                              {b.bankName} — {b.accountHolder} ({b.accountNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="bk-modal__field">
                        <label htmlFor="bk-payment-date">Payment Date *</label>
                        <input
                          id="bk-payment-date"
                          type="date"
                          className="bk-modal__input"
                          value={paymentDate}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setPaymentDate(e.target.value)}
                        />
                      </div>
                      <div className="bk-modal__note-meta" style={{ gridColumn: '1 / -1' }}>
                        <span className="bk-modal__hint">Receipt PDF akan di-attach ke email customer.</span>
                        <button
                          type="button"
                          className="bk-modal__btn bk-modal__btn--primary"
                          onClick={refreshPreview}
                          disabled={loading || !paymentBank || !paymentDate}
                        >
                          {loading ? 'Loading…' : preview ? 'Refresh Preview' : 'Preview'}
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {noteMode !== 'none' && (
                <section className="bk-modal__section">
                  {noteWarning && (
                    <div className={`bk-modal__warning bk-modal__warning--${activeKind}`} role="status">
                      {noteWarning}
                    </div>
                  )}
                  <label className="bk-modal__note-label" htmlFor="bk-admin-note">
                    {kindNoteLabel(activeKind)}
                  </label>
                  <textarea
                    id="bk-admin-note"
                    className="bk-modal__textarea"
                    rows={4}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={noteMode === 'required' ? 'Contoh: Slot tanggal 15 Oct sudah penuh, mohon pilih tanggal lain.' : 'Opsional — kosongkan kalau tidak ada catatan.'}
                    maxLength={500}
                  />
                  <div className="bk-modal__note-meta">
                    <span>{adminNote.length} / 500</span>
                    <button
                      type="button"
                      className="bk-modal__btn bk-modal__btn--primary"
                      onClick={refreshPreview}
                      disabled={previewDisabled}
                    >
                      {loading ? 'Loading…' : preview ? 'Refresh Preview' : 'Preview'}
                    </button>
                  </div>
                </section>
              )}

              {loading && !preview && <p className="bk-modal__loading">Rendering template…</p>}

              {error && (
                <div className="bk-modal__error" role="alert">
                  <strong>Errors:</strong>
                  <ul>
                    {error.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!loading && preview && !error && (
                <>
                  <section className="bk-modal__section">
                    <h4>Email</h4>
                    <div className="bk-modal__field">
                      <label>Subject</label>
                      <div className="bk-modal__value">{preview.emailSubject}</div>
                    </div>
                    {preview.emailBodyHtml ? (
                      <div className="bk-modal__field">
                        <label>HTML preview (what customer sees)</label>
                        <iframe
                          title="Email HTML preview"
                          srcDoc={preview.emailBodyHtml}
                          sandbox=""
                          className="bk-modal__iframe"
                        />
                        <details className="bk-modal__details">
                          <summary>Plain-text fallback</summary>
                          <pre className="bk-modal__pre">{preview.emailBody}</pre>
                        </details>
                      </div>
                    ) : (
                      <div className="bk-modal__field">
                        <label>Body (plain text)</label>
                        <pre className="bk-modal__pre">{preview.emailBody}</pre>
                      </div>
                    )}
                  </section>

                  <section className="bk-modal__section">
                    <h4>WhatsApp Message</h4>
                    <pre className="bk-modal__pre">{preview.whatsappBody}</pre>
                  </section>

                  {preview?.receiptPreview && (
                    <section className="bk-modal__section">
                      <h4>Receipt PDF</h4>
                      <div className="bk-modal__field">
                        <div className="bk-modal__value">
                          📎 Attached: <code>{preview.receiptPreview.number}.pdf</code>
                        </div>
                      </div>
                    </section>
                  )}
                  {sent && sent.ok && (
                    <section className="bk-modal__success" role="status">
                      <p>✅ Email terkirim (id: <code>{sent.sentEmailId}</code>). Status booking → <code>{sent.newStatus}</code>.</p>
                      {sent.receiptNumber && (
                        <p>Receipt: <code>{sent.receiptNumber}.pdf</code></p>
                      )}
                      {sent.warning && (
                        <p className="bk-modal__warning-text">⚠ {sent.warning}</p>
                      )}
                      {sent.waUrl && (
                        <p>
                          <a
                            href={sent.waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bk-modal__wa-link"
                          >
                            → Open WhatsApp with prefilled message
                          </a>
                        </p>
                      )}
                      <p className="bk-modal__hint">
                        Click close untuk reload form.
                      </p>
                    </section>
                  )}
                </>
              )}
            </div>

            <footer className="bk-modal__footer">
              {!sent && preview && !error && (
                <button
                  type="button"
                  className="bk-modal__btn bk-modal__btn--primary"
                  onClick={confirmSend}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Confirm & Send'}
                </button>
              )}
              <button type="button" className="bk-modal__btn" onClick={close}>
                {sent ? 'Close & Reload' : 'Cancel'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingAdminActions

const css = `
.bk-admin-actions {
  padding: 1rem;
  background: var(--theme-elevation-50, #f6f6f6);
  border: 1px solid var(--theme-elevation-100, #e0e0e0);
  border-radius: 6px;
  margin-bottom: 1rem;
}
.bk-admin-actions__row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
.bk-admin-actions__btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #1B3A4B;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.bk-admin-actions__btn--payment            { background: #1B3A4B; }
.bk-admin-actions__btn--ticket             { background: #6B9080; }
.bk-admin-actions__btn--rescheduleConfirm  { background: #059669; }
.bk-admin-actions__btn--rescheduleDecline  { background: #DC2626; }
.bk-admin-actions__btn--cancelConfirm      { background: #991B1B; }
.bk-admin-actions__btn--cancelDecline      { background: #D97706; }
.bk-admin-actions__btn:hover { opacity: 0.9; }
.bk-admin-actions__hint, .bk-admin-actions__caption {
  font-size: 0.85rem;
  color: var(--theme-text-dim, #666);
}
.bk-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.bk-modal__inner {
  background: var(--theme-bg, #fff);
  color: var(--theme-text, #1a1a1a);
  width: 90vw;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}
.bk-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--theme-elevation-100, #eee);
}
.bk-modal__header h3 { margin: 0; font-size: 1.1rem; }
.bk-modal__close {
  background: none;
  border: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: var(--theme-text, #333);
}
.bk-modal__body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}
.bk-modal__loading { color: var(--theme-text-dim, #777); }
.bk-modal__error {
  background: #fdecea;
  border: 1px solid #e74c3c;
  color: #641e16;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}
.bk-modal__error ul { margin: 0.4rem 0; padding-left: 1.4rem; }
.bk-modal__warning {
  padding: 0.6rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}
.bk-modal__warning--rescheduleConfirm,
.bk-modal__warning--cancelConfirm {
  background: #fef9c3;
  border: 1px solid #fde047;
  color: #713f12;
}
.bk-modal__warning--rescheduleDecline,
.bk-modal__warning--cancelDecline {
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
  color: #075985;
}
.bk-modal__warning--ticket {
  background: #fef9c3;
  border: 1px solid #fde047;
  color: #713f12;
}
.bk-modal__warning--resend {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #7f1d1d;
  margin-bottom: 0.5rem;
}
.bk-modal__warning--resend code {
  font-size: 0.8rem;
  background: rgba(0,0,0,0.08);
  padding: 1px 4px;
  border-radius: 3px;
}
.bk-modal__warning-text {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  margin: 0.5rem 0;
}
.bk-modal__payment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.bk-modal__input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--theme-elevation-100, #ccc);
  border-radius: 4px;
  font: inherit;
  font-size: 0.9rem;
  background: var(--theme-bg, #fff);
  color: var(--theme-text, #1a1a1a);
  box-sizing: border-box;
}
.bk-modal__note-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--theme-text, #333);
  margin-bottom: 0.4rem;
}
.bk-modal__textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--theme-elevation-100, #ccc);
  border-radius: 4px;
  font: inherit;
  font-size: 0.9rem;
  resize: vertical;
  background: var(--theme-bg, #fff);
  color: var(--theme-text, #1a1a1a);
  box-sizing: border-box;
}
.bk-modal__note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: var(--theme-text-dim, #666);
}
.bk-modal__section {
  margin-bottom: 1.5rem;
}
.bk-modal__section h4 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: var(--theme-text-dim, #555);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.bk-modal__field { margin-bottom: 0.75rem; }
.bk-modal__field label {
  display: block;
  font-size: 0.75rem;
  color: var(--theme-text-dim, #666);
  margin-bottom: 0.2rem;
}
.bk-modal__value {
  font-weight: 500;
  padding: 0.4rem 0.6rem;
  background: var(--theme-elevation-50, #f8f8f8);
  border-radius: 4px;
}
.bk-modal__iframe {
  width: 100%;
  min-height: 500px;
  border: 1px solid var(--theme-elevation-100, #e5e7eb);
  border-radius: 6px;
  background: #fff;
}
.bk-modal__details {
  margin-top: 8px;
  font-size: 0.8rem;
}
.bk-modal__details summary {
  cursor: pointer;
  color: var(--theme-text-dim, #666);
  padding: 4px 0;
}
.bk-modal__pre {
  background: var(--theme-elevation-50, #f8f8f8);
  padding: 0.75rem;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.85rem;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
}
.bk-modal__success {
  background: #e8f5e9;
  border: 1px solid #4caf50;
  color: #1b5e20;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}
.bk-modal__wa-link {
  display: inline-block;
  background: #25D366;
  color: #fff !important;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  margin: 0.5rem 0;
}
.bk-modal__hint { font-size: 0.8rem; color: #666; }
.bk-modal__footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--theme-elevation-100, #eee);
}
.bk-modal__btn {
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  border: 1px solid var(--theme-elevation-100, #ccc);
  background: var(--theme-elevation-50, #fff);
  color: var(--theme-text, #333);
  cursor: pointer;
}
.bk-modal__btn--primary {
  background: #1B3A4B;
  color: #fff;
  border-color: #1B3A4B;
}
.bk-modal__btn:disabled { opacity: 0.5; cursor: not-allowed; }
`
