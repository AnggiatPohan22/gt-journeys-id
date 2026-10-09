'use client'
/**
 * BookingStatusFilterBar — Phase 4.69.8.
 *
 * Chip bar di atas list Bookings:
 *   [All]  [⚠ Needs review 3]  [💰 Awaiting payment 1]  [💳 Payment review 2]
 *   [✅ Confirmed 42]  [🔁 Reschedule 0]  [❌ Cancel request 1]
 *   [🚫 Cancelled 5]  [⏳ Expired 2]
 *
 * Fitur:
 * - Count per status (REST `?limit=0&where[status][equals]=X`) di-fetch
 *   parallel on mount + saat URL berubah (reflect sort/filter interaction).
 * - Click chip → push URL dgn `where[status][equals]=X` (reset lain supaya
 *   tidak bentrok).
 * - "All" chip → clear filter status.
 * - Active chip highlighted dari query param.
 * - Priority chips (needs action: awaiting_review, payment_review,
 *   cancel_request, reschedule_request) warna warm supaya admin fokus.
 *
 * Pakai `useRouter` + `useSearchParams` dari next/navigation (Payload v3
 * admin = Next.js App Router).
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type StatusKey =
  | 'awaiting_review'
  | 'awaiting_payment'
  | 'payment_review'
  | 'confirmed'
  | 'reschedule_request'
  | 'cancel_request'
  | 'cancelled'
  | 'expired'
  | 'pending'

interface ChipDef {
  key: StatusKey | '__all__'
  label: string
  emoji: string
  tone: 'urgent' | 'warm' | 'neutral' | 'ok' | 'cool'
}

// Order dari priority UX: yang butuh action admin paling kiri.
const CHIPS: ChipDef[] = [
  { key: '__all__',           label: 'All',               emoji: '📋', tone: 'neutral' },
  { key: 'awaiting_review',   label: 'Needs review',      emoji: '⚠',  tone: 'urgent' },
  { key: 'payment_review',    label: 'Payment review',    emoji: '💳', tone: 'urgent' },
  { key: 'cancel_request',    label: 'Cancel request',    emoji: '❌', tone: 'warm' },
  { key: 'reschedule_request',label: 'Reschedule',        emoji: '🔁', tone: 'warm' },
  { key: 'awaiting_payment',  label: 'Awaiting payment',  emoji: '💰', tone: 'cool' },
  { key: 'confirmed',         label: 'Confirmed',         emoji: '✅', tone: 'ok' },
  { key: 'cancelled',         label: 'Cancelled',         emoji: '🚫', tone: 'neutral' },
  { key: 'expired',           label: 'Expired',           emoji: '⏳', tone: 'neutral' },
]

async function fetchCount(status: StatusKey | null): Promise<number> {
  const qs = status
    ? `?limit=0&depth=0&where[status][equals]=${encodeURIComponent(status)}`
    : '?limit=0&depth=0'
  const res = await fetch(`/api/bookings${qs}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return 0
  const data = (await res.json()) as { totalDocs?: number }
  return typeof data.totalDocs === 'number' ? data.totalDocs : 0
}

const BookingStatusFilterBar: React.FC = () => {
  const router = useRouter()
  const sp = useSearchParams()

  // Deteksi filter aktif dari URL. Payload list URL pattern:
  // ?where[status][equals]=X atau ?where[and][0][status][equals]=X dsb.
  // Kita cek dua pola umum.
  const activeStatus = useMemo<string | null>(() => {
    const direct = sp.get('where[status][equals]')
    if (direct) return direct
    // Fallback: scan semua keys yang matching
    for (const [k, v] of sp.entries()) {
      if (/where(\[.+?\])*\[status\]\[equals\]/.test(k)) return v
    }
    return null
  }, [sp])

  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const tasks = CHIPS.map(async (c) => {
      const n = await fetchCount(c.key === '__all__' ? null : (c.key as StatusKey))
      return [c.key, n] as const
    })
    Promise.all(tasks).then((entries) => {
      if (cancelled) return
      const next: Record<string, number> = {}
      for (const [k, n] of entries) next[k] = n
      setCounts(next)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const applyFilter = (key: ChipDef['key']) => {
    const next = new URLSearchParams(sp.toString())
    // Clear semua variant where[...][status]... supaya tidak bentrok
    for (const k of Array.from(next.keys())) {
      if (/where(\[.+?\])*\[status\]\[equals\]/.test(k)) next.delete(k)
    }
    // Reset ke page 1 saat ganti filter
    next.delete('page')
    if (key !== '__all__') {
      next.set('where[status][equals]', key)
    }
    router.push(`?${next.toString()}`)
  }

  return (
    <div className="bk-filter-bar" role="toolbar" aria-label="Booking status filter">
      <style>{css}</style>
      <div className="bk-filter-bar__chips">
        {CHIPS.map((c) => {
          const isActive =
            (c.key === '__all__' && !activeStatus) || c.key === activeStatus
          const count = counts[c.key]
          return (
            <button
              key={c.key}
              type="button"
              className={`bk-chip bk-chip--${c.tone} ${isActive ? 'bk-chip--active' : ''}`}
              onClick={() => applyFilter(c.key)}
              aria-pressed={isActive}
            >
              <span className="bk-chip__emoji" aria-hidden="true">{c.emoji}</span>
              <span className="bk-chip__label">{c.label}</span>
              <span className="bk-chip__count">
                {loading ? '…' : (count ?? 0)}
              </span>
            </button>
          )
        })}
      </div>
      <p className="bk-filter-bar__hint">
        Priority: <strong>Needs review</strong> & <strong>Payment review</strong> perlu action admin.
        {' '}Click chip untuk filter. Combine dgn kolom sort di atas tabel.
      </p>
    </div>
  )
}

export default BookingStatusFilterBar

const css = `
.bk-filter-bar {
  padding: 0.75rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--theme-elevation-100, #e5e7eb);
}
.bk-filter-bar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.bk-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: var(--theme-elevation-50, #f6f6f6);
  border: 1px solid var(--theme-elevation-100, #e5e7eb);
  border-radius: 999px;
  color: var(--theme-text, #1a1a1a);
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 80ms ease, box-shadow 120ms ease, background 120ms ease;
}
.bk-chip:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.bk-chip__emoji { font-size: 1rem; line-height: 1; }
.bk-chip__count {
  display: inline-block;
  min-width: 1.5rem;
  padding: 0 0.4rem;
  text-align: center;
  background: var(--theme-elevation-150, #e5e7eb);
  color: var(--theme-text, #1a1a1a);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Tones */
.bk-chip--urgent  { border-color: #e07a5f; }
.bk-chip--urgent .bk-chip__count { background: #fde4de; color: #7a2919; }
.bk-chip--warm    { border-color: #d9a441; }
.bk-chip--warm .bk-chip__count { background: #fcefc9; color: #6b4a05; }
.bk-chip--cool    { border-color: #1B3A4B; }
.bk-chip--cool .bk-chip__count { background: #dde5ea; color: #0d1b2a; }
.bk-chip--ok      { border-color: #6B9080; }
.bk-chip--ok .bk-chip__count { background: #dceadf; color: #244532; }
.bk-chip--neutral { border-color: var(--theme-elevation-200, #d1d5db); }

/* Active state */
.bk-chip--active {
  background: var(--theme-elevation-200, #1a1a1a);
  color: #fff;
}
.bk-chip--active.bk-chip--urgent  { background: #e07a5f; color: #fff; border-color: #c2614a; }
.bk-chip--active.bk-chip--warm    { background: #d9a441; color: #fff; border-color: #a67a1f; }
.bk-chip--active.bk-chip--cool    { background: #1B3A4B; color: #fff; border-color: #0d1b2a; }
.bk-chip--active.bk-chip--ok      { background: #6B9080; color: #fff; border-color: #4e6a5e; }
.bk-chip--active.bk-chip--neutral { background: #4b5563; color: #fff; }
.bk-chip--active .bk-chip__count {
  background: rgba(255,255,255,0.25);
  color: #fff;
}

.bk-filter-bar__hint {
  font-size: 0.75rem;
  color: var(--theme-text-dim, #666);
  margin: 0;
}

/* Dark mode compatibility (Payload has data-theme=dark) */
html[data-theme="dark"] .bk-chip {
  background: var(--theme-elevation-100, #1f2937);
}
html[data-theme="dark"] .bk-chip__count {
  background: var(--theme-elevation-200, #374151);
  color: #f3f4f6;
}
`
