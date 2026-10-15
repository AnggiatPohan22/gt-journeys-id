'use client'
/**
 * BookingRequestAlert — Phase 4.70.2.2.
 *
 * Banner alert prominent di atas Booking edit view saat booking punya
 * pending request dari customer (reschedule_request / cancel_request).
 * Replace collapsible "Customer Request" lama (Phase 4.69.9) yang terlalu
 * tersembunyi — admin sering lewatkan.
 *
 * Rendered sebagai UI field pertama di collection schema. Hanya tampil
 * saat status cocok; kalau tidak, render null (invisible slot).
 */

import React from 'react'
import { useAllFormFields } from '@payloadcms/ui'

function formatDate(iso: string | undefined): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return `${sec}d yang lalu`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min} menit yang lalu`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr} jam yang lalu`
    const day = Math.floor(hr / 24)
    return `${day} hari yang lalu`
  } catch {
    return ''
  }
}

const BookingRequestAlert: React.FC = () => {
  const [fields] = useAllFormFields()
  const status = (fields?.status?.value as string) || ''
  const kind = (fields?.customerRequestKind?.value as string) || ''
  const reason = (fields?.customerRequestReason?.value as string) || ''
  const requestedAt = (fields?.customerRequestedAt?.value as string) || ''

  if (status !== 'reschedule_request' && status !== 'cancel_request') return null

  const isCancel = kind === 'cancel' || status === 'cancel_request'
  const label = isCancel ? 'Cancellation Request' : 'Reschedule Request'
  const emoji = isCancel ? '❌' : '🔁'
  const color = isCancel ? '#DC2626' : '#D97706'
  const bgColor = isCancel ? '#FEF2F2' : '#FFFBEB'
  const borderColor = isCancel ? '#FCA5A5' : '#FCD34D'
  const action = isCancel
    ? 'Review alasan customer lalu klik "Send Cancel Response" di Admin Actions.'
    : 'Review alasan customer lalu klik "Send Reschedule Response" di Admin Actions.'

  return (
    <div className="bk-req-alert" role="alert">
      <style>{css(color, bgColor, borderColor)}</style>
      <div className="bk-req-alert__header">
        <span className="bk-req-alert__icon" aria-hidden="true">{emoji}</span>
        <div className="bk-req-alert__title-wrap">
          <div className="bk-req-alert__badge">PENDING CUSTOMER REQUEST</div>
          <h3 className="bk-req-alert__title">{label}</h3>
        </div>
        <div className="bk-req-alert__meta">
          <div className="bk-req-alert__meta-label">Diterima</div>
          <div className="bk-req-alert__meta-value">{formatDate(requestedAt)}</div>
          <div className="bk-req-alert__meta-relative">{relativeTime(requestedAt)}</div>
        </div>
      </div>

      <div className="bk-req-alert__reason">
        <div className="bk-req-alert__reason-label">Alasan customer:</div>
        <blockquote className="bk-req-alert__reason-body">
          {reason ? `"${reason}"` : '(tidak disebutkan)'}
        </blockquote>
      </div>

      <div className="bk-req-alert__action">
        <span className="bk-req-alert__action-icon">👉</span>
        <span>{action}</span>
      </div>
    </div>
  )
}

export default BookingRequestAlert

const css = (color: string, bgColor: string, borderColor: string) => `
.bk-req-alert {
  background: ${bgColor};
  border: 2px solid ${borderColor};
  border-left: 6px solid ${color};
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin: 0 0 1.5rem;
  animation: bk-req-pulse 2s ease-in-out 1;
}
@keyframes bk-req-pulse {
  0%   { box-shadow: 0 0 0 0 ${color}66; }
  70%  { box-shadow: 0 0 0 12px ${color}00; }
  100% { box-shadow: 0 0 0 0 ${color}00; }
}
.bk-req-alert__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.bk-req-alert__icon {
  font-size: 1.75rem;
  line-height: 1;
  flex-shrink: 0;
}
.bk-req-alert__title-wrap { flex: 1; min-width: 0; }
.bk-req-alert__badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${color};
  margin-bottom: 0.15rem;
}
.bk-req-alert__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${color};
  line-height: 1.3;
}
.bk-req-alert__meta {
  text-align: right;
  flex-shrink: 0;
}
.bk-req-alert__meta-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--theme-text-dim, #666);
  margin-bottom: 0.1rem;
}
.bk-req-alert__meta-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--theme-text, #1a1a1a);
}
.bk-req-alert__meta-relative {
  font-size: 0.7rem;
  color: var(--theme-text-dim, #777);
  font-style: italic;
}
.bk-req-alert__reason {
  background: #fff;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid ${borderColor}80;
}
.bk-req-alert__reason-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--theme-text-dim, #666);
  margin-bottom: 0.35rem;
}
.bk-req-alert__reason-body {
  margin: 0;
  padding: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--theme-text, #1a1a1a);
  font-style: italic;
  border: none;
}
.bk-req-alert__action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${color}15;
  border-radius: 6px;
  font-size: 0.85rem;
  color: ${color};
  font-weight: 500;
}
.bk-req-alert__action-icon { font-size: 1rem; }

/* Dark mode */
html[data-theme="dark"] .bk-req-alert__reason {
  background: var(--theme-elevation-100, #1f2937);
  border-color: ${borderColor}30;
}
html[data-theme="dark"] .bk-req-alert__reason-body {
  color: #f3f4f6;
}
`
