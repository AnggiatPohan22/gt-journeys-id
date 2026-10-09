'use client'
/**
 * BookingAdminActions — Phase 4.69.7.
 *
 * Tombol-tombol admin di edit view Booking:
 *   - "Send Payment Instructions" (visible saat status = awaiting_review)
 *   - "Confirm Payment & Send Ticket" (visible saat status = payment_review)
 *
 * Flow click:
 *   1. Open modal.
 *   2. Fetch preview via `POST /:id/send-{payment|ticket} { previewOnly: true }`.
 *   3. Render preview (email subject + email body + WA body).
 *   4. Admin klik "Send" → POST ulang tanpa previewOnly.
 *   5. On success: show success + wa.me link (new-tab).
 *   6. User re-save form → status + sent*At terupdate dari server.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

type ActionKind = 'payment' | 'ticket'

interface PreviewResult {
  ok: boolean
  previewOnly: boolean
  emailSubject?: string
  emailBody?: string
  whatsappBody?: string
  waUrl?: string | null
  sentEmailId?: string
  newStatus?: string
  errors?: string[]
}

function statusToKind(status: string | undefined): ActionKind | null {
  if (status === 'awaiting_review' || status === 'pending') return 'payment'
  if (status === 'payment_review' || status === 'awaiting_payment') return 'ticket'
  return null
}

const BookingAdminActions: React.FC = () => {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const status =
    (typeof fields?.status?.value === 'string' && fields.status.value) || ''
  const kind = statusToKind(status)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [error, setError] = useState<string[] | null>(null)
  const [sent, setSent] = useState<PreviewResult | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  const endpointPath = (k: ActionKind) =>
    k === 'payment' ? `/api/bookings/${id}/send-payment` : `/api/bookings/${id}/send-ticket`

  const fetchPreview = useCallback(
    async (k: ActionKind) => {
      setLoading(true)
      setError(null)
      setPreview(null)
      setSent(null)
      try {
        const res = await fetch(endpointPath(k), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ previewOnly: true }),
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
    setOpen(true)
    fetchPreview(k)
  }

  const confirmSend = useCallback(async () => {
    if (!kind) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(endpointPath(kind), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ previewOnly: false }),
      })
      const data = (await res.json()) as PreviewResult
      if (!res.ok || !data.ok) {
        setError(data.errors ?? [`HTTP ${res.status}`])
        return
      }
      setSent(data)
      // Preview = sent (konten identik)
      setPreview(data)
    } catch (e: any) {
      setError([e?.message ?? 'Network error'])
    } finally {
      setLoading(false)
    }
  }, [kind, id])

  const close = () => {
    setOpen(false)
    setPreview(null)
    setError(null)
    // Kalau sudah sent, reload supaya status + sent*At ter-sync dari server.
    if (sent) {
      window.setTimeout(() => window.location.reload(), 200)
    }
    setSent(null)
  }

  // Esc untuk tutup
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  const btnLabel =
    kind === 'payment'
      ? 'Send Payment Instructions'
      : kind === 'ticket'
        ? 'Confirm Payment & Send Ticket'
        : null

  return (
    <div className="bk-admin-actions">
      <style>{css}</style>
      {!kind && (
        <p className="bk-admin-actions__caption">
          Admin actions tidak tersedia untuk status <strong>{status || 'unknown'}</strong>.
          Transisi otomatis muncul saat booking <code>awaiting_review</code> atau <code>payment_review</code>.
        </p>
      )}

      {kind && (
        <>
          <div className="bk-admin-actions__row">
            <button
              type="button"
              className={`bk-admin-actions__btn bk-admin-actions__btn--${kind}`}
              onClick={() => openModal(kind)}
            >
              {kind === 'payment' ? '📧' : '🎫'} {btnLabel}
            </button>
            <span className="bk-admin-actions__hint">
              Preview email + WA message akan ditampilkan sebelum kirim.
            </span>
          </div>
        </>
      )}

      {open && (
        <div className="bk-modal" role="dialog" aria-modal="true" onClick={close}>
          <div
            className="bk-modal__inner"
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="bk-modal__header">
              <h3>{btnLabel} — Preview</h3>
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
              {loading && <p className="bk-modal__loading">Rendering template…</p>}

              {error && (
                <div className="bk-modal__error" role="alert">
                  <strong>Template errors:</strong>
                  <ul>
                    {error.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                  <p>Fix field yang kosong di booking atau update template di global <code>booking-templates</code>, lalu coba lagi.</p>
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
                    <div className="bk-modal__field">
                      <label>Body (plain text)</label>
                      <pre className="bk-modal__pre">{preview.emailBody}</pre>
                    </div>
                  </section>

                  <section className="bk-modal__section">
                    <h4>WhatsApp Message</h4>
                    <pre className="bk-modal__pre">{preview.whatsappBody}</pre>
                  </section>

                  {sent && sent.ok && (
                    <section className="bk-modal__success" role="status">
                      <p>✅ Email terkirim (id: <code>{sent.sentEmailId}</code>). Status booking → <code>{sent.newStatus}</code>.</p>
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
                        Click close untuk reload form (ambil status & timestamp baru).
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
  gap: 1rem;
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
.bk-admin-actions__btn--payment { background: #1B3A4B; }
.bk-admin-actions__btn--ticket  { background: #6B9080; }
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
}
.bk-modal__error ul { margin: 0.4rem 0; padding-left: 1.4rem; }
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
