'use client'

/**
 * BellNotifications — Phase 4.74.5.
 *
 * Top-bar bell admin: polling `/api/admin-notifications/unread-count` tiap
 * 30s, render icon dgn badge count + side-panel list 20 terbaru.
 *
 * MVP constraints:
 *   - Polling (bukan SSE/DO) — swap kalau cost tinggi.
 *   - Per-user read tracker via POST `/api/admin-notifications/:id/read`.
 *   - Deep-link ke booking atau payment-proof edit view saat klik row.
 *
 * Mount: `admin.components.afterNavLinks` di payload.config.ts (sidebar
 * footer area, selalu terlihat).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'

interface NotifItem {
  id: number
  type: string
  title: string
  body?: string
  severity: 'info' | 'warning' | 'critical'
  createdAt: string
  booking?: number | { id?: number }
  paymentProof?: number | { id?: number }
  read: boolean
}

interface UnreadResponse {
  ok: boolean
  count?: number
  items?: NotifItem[]
}

const POLL_INTERVAL_MS = 30_000

const SEVERITY_COLORS: Record<NotifItem['severity'], string> = {
  info: '#2563eb',
  warning: '#d97706',
  critical: '#dc2626',
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60_000)
    if (m < 1) return 'baru saja'
    if (m < 60) return m + ' min'
    const h = Math.floor(m / 60)
    if (h < 24) return h + ' jam'
    const d = Math.floor(h / 24)
    return d + ' hari'
  } catch {
    return ''
  }
}

function targetHref(n: NotifItem): string | null {
  const bid = typeof n.booking === 'number' ? n.booking : n.booking?.id
  if (bid) return '/admin/collections/bookings/' + bid
  const pid = typeof n.paymentProof === 'number' ? n.paymentProof : n.paymentProof?.id
  if (pid) return '/admin/collections/payment-proofs/' + pid
  return null
}

const BellNotifications: React.FC = () => {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotifItem[]>([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/admin-notifications/unread-count', {
        credentials: 'same-origin',
      })
      if (!res.ok) return
      const data: UnreadResponse = await res.json()
      if (data.ok) {
        setCount(data.count ?? 0)
        setItems(data.items ?? [])
      }
    } catch {
      // silent — next poll retry
    }
  }, [])

  useEffect(() => {
    fetchUnread()
    const id = window.setInterval(fetchUnread, POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [fetchUnread])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const handleRowClick = useCallback(
    async (n: NotifItem, href: string | null) => {
      if (!n.read) {
        try {
          await fetch('/api/admin-notifications/' + n.id + '/read', {
            method: 'POST',
            credentials: 'same-origin',
          })
        } catch {}
        fetchUnread()
      }
      if (href) window.location.href = href
    },
    [fetchUnread],
  )

  const styleHref = {
    wrapper: { position: 'relative' as const, margin: '8px 10px' },
    btn: {
      display: 'flex',
      alignItems: 'center' as const,
      gap: 8,
      width: '100%',
      padding: '8px 10px',
      background: 'transparent',
      border: '1px solid var(--theme-elevation-150, #e2e8f0)',
      borderRadius: 6,
      cursor: 'pointer' as const,
      color: 'inherit',
      fontSize: 13,
    },
    label: { flex: 1, textAlign: 'left' as const },
    badge: {
      display: 'inline-flex',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      background: '#dc2626',
      color: '#fff',
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 700,
    },
    panel: {
      position: 'absolute' as const,
      left: '100%',
      bottom: 0,
      marginLeft: 10,
      width: 340,
      maxHeight: 480,
      overflow: 'hidden' as const,
      background: 'var(--theme-elevation-0, #fff)',
      border: '1px solid var(--theme-elevation-150, #e2e8f0)',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    head: {
      padding: '12px 14px',
      borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)',
      display: 'flex',
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      fontSize: 13,
    },
    meta: { fontSize: 11, color: 'var(--theme-elevation-500, #64748b)' },
    list: { flex: 1, overflowY: 'auto' as const },
    empty: {
      padding: 24,
      textAlign: 'center' as const,
      color: 'var(--theme-elevation-500, #64748b)',
      fontSize: 12,
    },
    row: (read: boolean) => ({
      display: 'flex' as const,
      gap: 10,
      padding: '10px 14px',
      cursor: 'pointer' as const,
      borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)',
      opacity: read ? 0.6 : 1,
    }),
    dot: (color: string) => ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      marginTop: 6,
      flexShrink: 0,
      backgroundColor: color,
    }),
    rowTitle: { fontSize: 13, fontWeight: 600, lineHeight: 1.3 },
    rowBody: {
      marginTop: 2,
      fontSize: 11.5,
      color: 'var(--theme-elevation-700, #334155)',
      lineHeight: 1.4,
    },
    rowMeta: {
      marginTop: 4,
      fontSize: 10.5,
      color: 'var(--theme-elevation-500, #64748b)',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.3,
    },
  }

  return (
    <div style={styleHref.wrapper} ref={panelRef}>
      <button
        type="button"
        style={styleHref.btn}
        onClick={() => setOpen((v) => !v)}
        aria-label={'Notifications (' + count + ' unread)'}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span style={styleHref.label}>Notifications</span>
        {count > 0 && (
          <span style={styleHref.badge} aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={styleHref.panel} role="dialog" aria-label="Notifications">
          <div style={styleHref.head}>
            <strong>Notifications</strong>
            <span style={styleHref.meta}>{count} unread</span>
          </div>
          <div style={styleHref.list}>
            {items.length === 0 && <div style={styleHref.empty}>No notifications yet.</div>}
            {items.map((n) => {
              const href = targetHref(n)
              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  style={styleHref.row(n.read)}
                  onClick={() => handleRowClick(n, href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRowClick(n, href)
                  }}
                >
                  <span style={styleHref.dot(SEVERITY_COLORS[n.severity])} aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styleHref.rowTitle}>{n.title}</div>
                    {n.body && <div style={styleHref.rowBody}>{n.body}</div>}
                    <div style={styleHref.rowMeta}>
                      {timeAgo(n.createdAt)} · {n.type}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default BellNotifications
