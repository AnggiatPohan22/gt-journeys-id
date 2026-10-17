'use client'

/**
 * BellNotifications — Phase 4.74.5 (sidebar) → 4.74.7 (top-bar fixed).
 *
 * Fixed-position bell top-right admin: polling
 * `/api/admin-notifications/unread-count` tiap 30s, render icon dgn badge
 * count (99+ max) + dropdown panel list 20 terbaru.
 *
 * Phase 4.74.7 changes:
 *   - Dipindah dari `afterNavLinks` ke `providers` (via BellMount wrapper)
 *     supaya tetap terlihat saat sidebar collapsed / di semua route admin.
 *   - Position fixed top-right, visually dekat account icon header.
 *   - Click handler per-type: payment_proof_submitted → payment-proof edit
 *     (admin review flow). All others w/ booking → booking edit (lihat
 *     status terbaru). Fallback → payment-proof.
 *   - Login route (`/admin/login*`) auto-hide via location check.
 *
 * MVP constraints:
 *   - Polling (bukan SSE/DO) — swap kalau cost tinggi.
 *   - Per-user read tracker via POST `/api/admin-notifications/:id/read`.
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

/**
 * Phase 4.74.7a — type-based color coding (user feedback):
 *   - approve (type `other` + title "approved") → hijau
 *   - decline/reject (`payment_rejected`, critical severity)   → merah
 *   - request (`reschedule_request`, `cancel_request`)         → kuning
 *   - new booking (`booking_new`)                              → biru
 *   - aktifitas lain (`payment_proof_submitted`, `other` misc) → orange
 */
const COLOR_GREEN = '#16a34a'
const COLOR_RED = '#dc2626'
const COLOR_YELLOW = '#ca8a04'
const COLOR_BLUE = '#2563eb'
const COLOR_ORANGE = '#ea580c'

function colorForNotif(n: NotifItem): string {
  if (n.type === 'booking_new') return COLOR_BLUE
  if (n.type === 'payment_rejected') return COLOR_RED
  if (n.type === 'reschedule_request' || n.type === 'cancel_request') return COLOR_YELLOW
  if (n.type === 'other') {
    const t = String(n.title ?? '').toLowerCase()
    if (n.severity === 'critical') return COLOR_RED
    if (t.includes('approved') || t.includes('approve')) return COLOR_GREEN
    return COLOR_ORANGE
  }
  // payment_proof_submitted + fallback
  return COLOR_ORANGE
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

/**
 * Phase 4.74.7 — per-type routing policy:
 *   - payment_proof_submitted  → payment-proof edit (admin review uploaded file)
 *   - semua tipe lain (booking_new, payment_rejected, "other" approve/reject,
 *     reschedule_request, cancel_request) → booking edit kalau ada,
 *     supaya admin lihat status terbaru (confirmed, dsb.)
 *   - Fallback: payment-proof kalau tidak ada booking rel.
 */
function targetHref(n: NotifItem): string | null {
  const bid = typeof n.booking === 'number' ? n.booking : n.booking?.id
  const pid = typeof n.paymentProof === 'number' ? n.paymentProof : n.paymentProof?.id
  if (n.type === 'payment_proof_submitted' && pid) {
    return '/admin/collections/payment-proofs/' + pid
  }
  if (bid) return '/admin/collections/bookings/' + bid
  if (pid) return '/admin/collections/payment-proofs/' + pid
  return null
}

type TabKey = 'unread' | 'read'

const BellNotifications: React.FC = () => {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotifItem[]>([])
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [marking, setMarking] = useState(false)
  const [tab, setTab] = useState<TabKey>('unread')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Phase 4.74.7 — hide di login route (user belum auth, API 401).
  useEffect(() => {
    try {
      const p = window.location.pathname
      const onLogin = p.startsWith('/admin/login') || p === '/admin/logout' || p.startsWith('/admin/forgot')
      setVisible(!onLogin)
    } catch {
      setVisible(true)
    }
  }, [])

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
    if (!visible) return
    fetchUnread()
    const id = window.setInterval(fetchUnread, POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [fetchUnread, visible])

  useEffect(() => {
    // Phase 4.74.7b — reset ke tab "Belum dibaca" setiap kali panel dibuka,
    // supaya admin selalu lihat unread dulu.
    if (open) setTab('unread')
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const handleMarkAllRead = useCallback(async () => {
    if (marking) return
    setMarking(true)
    try {
      await fetch('/api/admin-notifications/mark-all-read', {
        method: 'POST',
        credentials: 'same-origin',
      })
      await fetchUnread()
    } catch {
      // silent
    } finally {
      setMarking(false)
    }
  }, [marking, fetchUnread])

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

  if (!visible) return null

  const s = {
    wrapper: {
      // Phase 4.74.7c — `position: absolute` (bukan fixed) supaya bell
      // scroll-away bareng page header persis seperti account icon Payload.
      // Fixed sebelumnya tetap melekat di viewport saat scroll → menimpa
      // tab/konten di bawahnya. Absolute relatif ke initial containing
      // block (viewport) tapi ikut scroll dgn document.
      position: 'absolute' as const,
      top: 12,
      right: 120,
      zIndex: 100,
    },
    btn: {
      position: 'relative' as const,
      display: 'inline-flex',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: 36,
      height: 36,
      padding: 0,
      background: 'transparent',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer' as const,
      color: 'var(--theme-elevation-800, #0f172a)',
      transition: 'background .15s ease',
    },
    btnHover: { background: 'var(--theme-elevation-100, #f1f5f9)' },
    badge: {
      position: 'absolute' as const,
      top: -2,
      right: -2,
      display: 'inline-flex',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      background: '#dc2626',
      color: '#fff',
      borderRadius: 9,
      fontSize: 10.5,
      fontWeight: 700,
      boxShadow: '0 0 0 2px var(--theme-bg, #fff)',
      pointerEvents: 'none' as const,
    },
    panel: {
      position: 'absolute' as const,
      top: 'calc(100% + 8px)',
      right: 0,
      width: 360,
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'min(70vh, 520px)',
      overflow: 'hidden' as const,
      background: 'var(--theme-elevation-0, #fff)',
      border: '1px solid var(--theme-elevation-150, #e2e8f0)',
      borderRadius: 10,
      boxShadow: '0 12px 32px rgba(15,23,42,.18)',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    head: {
      padding: '12px 14px',
      borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)',
      display: 'flex',
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      gap: 8,
      fontSize: 13,
    },
    headLeft: { display: 'flex' as const, flexDirection: 'column' as const, gap: 2 },
    meta: { fontSize: 11, color: 'var(--theme-elevation-500, #64748b)' },
    tabs: {
      display: 'flex' as const,
      borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)',
      padding: '0 8px',
      gap: 4,
    },
    tabBtn: (active: boolean) => ({
      position: 'relative' as const,
      padding: '10px 12px',
      background: 'transparent',
      border: 'none',
      borderBottom: active
        ? '2px solid var(--theme-elevation-800, #0f172a)'
        : '2px solid transparent',
      cursor: 'pointer' as const,
      fontSize: 12,
      fontWeight: active ? 700 : 500,
      color: active ? 'var(--theme-elevation-900, #0f172a)' : 'var(--theme-elevation-500, #64748b)',
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      gap: 6,
      marginBottom: -1,
    }),
    tabPill: (active: boolean) => ({
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minWidth: 18,
      height: 18,
      padding: '0 6px',
      borderRadius: 9,
      background: active ? 'var(--theme-elevation-800, #0f172a)' : 'var(--theme-elevation-150, #e2e8f0)',
      color: active ? 'var(--theme-bg, #fff)' : 'var(--theme-elevation-600, #475569)',
      fontSize: 10,
      fontWeight: 700,
    }),
    markAllBtn: {
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      gap: 4,
      padding: '5px 10px',
      background: 'transparent',
      border: '1px solid var(--theme-elevation-150, #e2e8f0)',
      borderRadius: 6,
      cursor: 'pointer' as const,
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--theme-elevation-800, #0f172a)',
      whiteSpace: 'nowrap' as const,
    },
    markAllBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed' as const,
    },
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

  const btnLabel = count > 0 ? `Notifications (${count} unread)` : 'Notifications'

  return (
    <div style={s.wrapper} ref={wrapperRef}>
      <button
        type="button"
        style={s.btn}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, s.btnHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        aria-label={btnLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={btnLabel}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span style={s.badge} aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (() => {
        const unreadItems = items.filter((n) => !n.read)
        const readItems = items.filter((n) => n.read)
        const list = tab === 'unread' ? unreadItems : readItems
        const emptyMsg = tab === 'unread' ? 'Belum ada notifikasi.' : 'Belum ada riwayat terbaca.'
        return (
          <div style={s.panel} role="dialog" aria-label="Notifications">
            <div style={s.head}>
              <div style={s.headLeft}>
                <strong>Notifications</strong>
                <span style={s.meta}>{count} unread</span>
              </div>
              <button
                type="button"
                style={{
                  ...s.markAllBtn,
                  ...(marking || count === 0 ? s.markAllBtnDisabled : {}),
                }}
                onClick={handleMarkAllRead}
                disabled={marking || count === 0}
                aria-label="Sudah baca semua"
                title="Tandai semua sudah dibaca"
              >
                {marking ? 'Menyimpan…' : '✓ Sudah baca semua'}
              </button>
            </div>
            <div style={s.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'unread'}
                style={s.tabBtn(tab === 'unread')}
                onClick={() => setTab('unread')}
              >
                Belum dibaca
                <span style={s.tabPill(tab === 'unread')}>{unreadItems.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'read'}
                style={s.tabBtn(tab === 'read')}
                onClick={() => setTab('read')}
              >
                Sudah dibaca
                <span style={s.tabPill(tab === 'read')}>{readItems.length}</span>
              </button>
            </div>
            <div style={s.list}>
              {list.length === 0 && <div style={s.empty}>{emptyMsg}</div>}
              {list.map((n) => {
                const href = targetHref(n)
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    style={s.row(n.read)}
                    onClick={() => handleRowClick(n, href)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRowClick(n, href)
                    }}
                  >
                    <span style={s.dot(colorForNotif(n))} aria-hidden="true" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.rowTitle}>{n.title}</div>
                      {n.body && <div style={s.rowBody}>{n.body}</div>}
                      <div style={s.rowMeta}>
                        {timeAgo(n.createdAt)} · {n.type}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default BellNotifications
