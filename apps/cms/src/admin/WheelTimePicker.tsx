'use client'
/**
 * WheelTimePicker — Phase 4.61.6 refinement.
 *
 * Custom Payload Field untuk field `text` yang menyimpan waktu format
 * "HH:mm" (24 jam). Menggantikan input teks polos dengan tombol yang
 * membuka popover berisi 2 kolom scroll (jam & menit) dengan snap.
 *
 * UX:
 *  - Klik tombol → popover terbuka di bawah field.
 *  - Scroll (mouse wheel / touch / click item) → tiap kolom snap ke value.
 *  - Tombol "Set" → tulis "HH:mm" ke form state via useField.setValue.
 *  - "Clear" → set null.
 *  - Klik di luar popover / tombol Esc → tutup tanpa menyimpan.
 *
 * Dipakai pada FerryTickets.departureTime & FerryTickets.arrivalTime.
 * Nilai yang di-persist tetap kompatibel dgn validate regex existing.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'

type Props = {
  path: string
  field?: {
    label?: string | Record<string, string>
    required?: boolean
    admin?: { description?: string; placeholder?: string; width?: string }
    name?: string
  }
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/
const ITEM_HEIGHT = 34 // px, per item di wheel
const VISIBLE_ROWS = 5 // ganjil supaya ada item tengah sebagai indikator

const pad2 = (n: number) => String(n).padStart(2, '0')
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

const parseHHMM = (v: unknown): { h: number; m: number } => {
  if (typeof v === 'string') {
    const match = HHMM.exec(v.trim())
    if (match) return { h: Number(match[1]), m: Number(match[2]) }
  }
  return { h: 8, m: 0 } // default 08:00 saat pertama buka
}

const resolveLabel = (field: Props['field']): string => {
  if (!field) return ''
  const l = field.label
  if (!l) return ''
  if (typeof l === 'string') return l
  return l.en ?? Object.values(l)[0] ?? ''
}

// ── Wheel column (jam / menit) ────────────────────────────────────
const WheelColumn: React.FC<{
  items: number[]
  value: number
  onChange: (v: number) => void
  ariaLabel: string
}> = ({ items, value, onChange, ariaLabel }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const suppressScrollRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  // Scroll ke posisi value saat mount / value berubah dari luar.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const targetTop = value * ITEM_HEIGHT
    if (Math.abs(el.scrollTop - targetTop) > 1) {
      suppressScrollRef.current = true
      el.scrollTop = targetTop
      // biarkan browser render → next tick lepas suppress
      requestAnimationFrame(() => {
        suppressScrollRef.current = false
      })
    }
  }, [value])

  const handleScroll = useCallback(() => {
    if (suppressScrollRef.current) return
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(items.length - 1, idx))
      if (clamped !== value) onChange(items[clamped])
    })
  }, [items, onChange, value])

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }, [])

  const pad = Math.floor(VISIBLE_ROWS / 2)

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={ariaLabel}
      onScroll={handleScroll}
      style={{
        height: ITEM_HEIGHT * VISIBLE_ROWS,
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        flex: 1,
        borderRadius: 6,
      }}
    >
      <div style={{ height: pad * ITEM_HEIGHT }} aria-hidden />
      {items.map((n) => {
        const selected = n === value
        return (
          <div
            key={n}
            role="option"
            aria-selected={selected}
            onClick={() => onChange(n)}
            style={{
              height: ITEM_HEIGHT,
              lineHeight: `${ITEM_HEIGHT}px`,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
              fontSize: selected ? '1.15rem' : '0.95rem',
              fontWeight: selected ? 700 : 500,
              color: selected ? 'var(--theme-text)' : 'var(--theme-elevation-500)',
              scrollSnapAlign: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'font-size .1s ease, color .1s ease',
            }}
          >
            {pad2(n)}
          </div>
        )
      })}
      <div style={{ height: pad * ITEM_HEIGHT }} aria-hidden />
    </div>
  )
}

// ── Field wrapper ────────────────────────────────────────────────
const WheelTimePicker: React.FC<Props> = (props) => {
  const { path, field } = props
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  const [open, setOpen] = useState(false)
  const parsed = useMemo(() => parseHHMM(value), [value])
  const [hour, setHour] = useState(parsed.h)
  const [minute, setMinute] = useState(parsed.m)

  // Re-sync internal state saat popover dibuka.
  useEffect(() => {
    if (open) {
      const p = parseHHMM(value)
      setHour(p.h)
      setMinute(p.m)
    }
  }, [open, value])

  const wrapRef = useRef<HTMLDivElement | null>(null)

  // Klik luar / Esc → tutup
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = resolveLabel(field) || field?.name || path
  const description = field?.admin?.description
  const placeholder = field?.admin?.placeholder ?? '08:00'
  const required = !!field?.required
  const display = typeof value === 'string' && HHMM.test(value) ? value : ''

  const commit = () => {
    setValue(`${pad2(hour)}:${pad2(minute)}`)
    setOpen(false)
  }
  const clear = () => {
    setValue(null)
    setOpen(false)
  }

  // Payload row layout supplies width via CSS class .field-type--width-N.
  // Since we override the Field component fully, we replicate that class
  // AND set an inline flex-basis fallback so widths like 20/25 that Payload
  // does not ship as a default class still work.
  const width = field?.admin?.width
  const widthClass = width ? `field-type--width-${width.replace('%', '')}` : ''
  const rootStyle: React.CSSProperties = width
    ? { position: 'relative', flexBasis: width, maxWidth: width, minWidth: 0 }
    : { position: 'relative' }

  return (
    <div className={`field-type text ${widthClass}`.trim()} style={rootStyle} ref={wrapRef}>
      <label className="field-label" htmlFor={`wtp-${path}`}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <button
          id={`wtp-${path}`}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: `1px solid ${showError ? 'var(--theme-error-500)' : 'var(--theme-elevation-200)'}`,
            borderRadius: 4,
            background: 'var(--theme-input-bg, var(--theme-elevation-0))',
            color: display ? 'var(--theme-text)' : 'var(--theme-elevation-400)',
            fontSize: '0.95rem',
            fontVariantNumeric: 'tabular-nums',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          {display || placeholder}
        </button>
        {display && (
          <button
            type="button"
            onClick={() => setValue(null)}
            aria-label="Clear time"
            title="Clear"
            style={{
              padding: '0 10px',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: 4,
              background: 'transparent',
              color: 'var(--theme-elevation-500)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}
      </div>
      {description && (
        <div className="field-description" style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--theme-elevation-500)' }}>
          {description}
        </div>
      )}
      {showError && errorMessage && (
        <div className="field-error" style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--theme-error-500)' }}>
          {errorMessage}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={`Pilih ${label}`}
          style={{
            position: 'absolute',
            zIndex: 100,
            top: 'calc(100% + 6px)',
            left: 0,
            width: 260,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            padding: 12,
          }}
        >
          <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
            {/* Indikator baris tengah */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: Math.floor(VISIBLE_ROWS / 2) * ITEM_HEIGHT,
                height: ITEM_HEIGHT,
                borderTop: '1px solid var(--theme-elevation-200)',
                borderBottom: '1px solid var(--theme-elevation-200)',
                background: 'var(--theme-elevation-50)',
                pointerEvents: 'none',
                borderRadius: 4,
              }}
            />
            <WheelColumn items={HOURS} value={hour} onChange={setHour} ariaLabel="Jam" />
            <div
              aria-hidden
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--theme-text)',
              }}
            >
              :
            </div>
            <WheelColumn items={MINUTES} value={minute} onChange={setMinute} ariaLabel="Menit" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 12 }}>
            <button
              type="button"
              onClick={clear}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: 4,
                background: 'transparent',
                color: 'var(--theme-elevation-500)',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Clear
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: 4,
                  background: 'transparent',
                  color: 'var(--theme-text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commit}
                style={{
                  padding: '6px 14px',
                  border: '1px solid var(--theme-success-500, #2e8b57)',
                  borderRadius: 4,
                  background: 'var(--theme-success-500, #2e8b57)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Set {pad2(hour)}:{pad2(minute)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WheelTimePicker
