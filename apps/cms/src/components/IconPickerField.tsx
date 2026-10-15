'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useField } from '@payloadcms/ui'

interface IconResult {
  id: string
  prefix: string
  name: string
  body: string
  width: number
  height: number
}

const PREFIXES = [
  { value: '', label: 'All' },
  { value: 'mdi', label: 'Material Design' },
  { value: 'lucide', label: 'Lucide' },
]

const IconPickerField: React.FC<any> = (props) => {
  const path: string = props?.path ?? props?.field?.name ?? 'iconName'
  const required: boolean = props?.field?.required ?? false
  const { value, setValue } = useField<string>({ path })

  const [query, setQuery] = useState('')
  const [prefix, setPrefix] = useState('')
  const [results, setResults] = useState<IconResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<IconResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchIcons = useCallback(async (q: string, pfx: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '48' })
      if (q) params.set('q', q)
      if (pfx) params.set('prefix', pfx)
      const res = await fetch(`/api/icons?${params}`)
      if (res.ok) {
        const data: IconResult[] = await res.json()
        setResults(data)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchIcons(query, prefix), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, prefix, open, fetchIcons])

  useEffect(() => {
    if (value && value.includes(':')) {
      const [pfx, name] = value.split(':', 2)
      fetch(`/api/icons?q=${encodeURIComponent(name)}&prefix=${pfx}&limit=1`)
        .then(r => r.json())
        .then((data: IconResult[]) => {
          const match = data.find(d => d.id === value)
          if (match) setSelectedIcon(match)
        })
        .catch(() => {})
    }
  }, [value])

  const select = (icon: IconResult) => {
    setValue(icon.id)
    setSelectedIcon(icon)
    setOpen(false)
  }

  const clear = () => {
    setValue('')
    setSelectedIcon(null)
  }

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
        Icon {required && <span style={{ color: 'var(--theme-error-500)' }}>*</span>}
      </label>

      {/* Current selection */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        padding: '8px 12px',
        border: '1px solid var(--theme-elevation-150, #ccc)',
        borderRadius: 6,
        background: 'var(--theme-elevation-0, #fff)',
        minHeight: 42,
      }}>
        {selectedIcon ? (
          <>
            <svg
              viewBox={`0 0 ${selectedIcon.width} ${selectedIcon.height}`}
              fill="currentColor"
              style={{ width: 24, height: 24, flexShrink: 0 }}
              dangerouslySetInnerHTML={{ __html: selectedIcon.body }}
            />
            <code style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>{value}</code>
            <button type="button" onClick={clear} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--theme-error-500)', fontSize: 18, lineHeight: 1, padding: '2px 6px',
            }}>×</button>
          </>
        ) : value ? (
          <>
            <code style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>{value} (legacy)</code>
            <button type="button" onClick={clear} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--theme-error-500)', fontSize: 18, lineHeight: 1, padding: '2px 6px',
            }}>×</button>
          </>
        ) : (
          <span style={{ fontSize: 13, opacity: 0.5 }}>No icon selected</span>
        )}
        <button type="button" onClick={() => setOpen(!open)} style={{
          background: 'var(--theme-elevation-100, #f5f5f5)',
          border: '1px solid var(--theme-elevation-200, #ddd)',
          borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
          fontSize: 12, fontWeight: 500,
        }}>
          {open ? 'Close' : 'Browse'}
        </button>
      </div>

      {/* Picker panel */}
      {open && (
        <div style={{
          border: '1px solid var(--theme-elevation-200, #ddd)',
          borderRadius: 8,
          background: 'var(--theme-elevation-50, #fafafa)',
          padding: 12,
          maxHeight: 420,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Search icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1, padding: '6px 10px', fontSize: 13,
                border: '1px solid var(--theme-elevation-200, #ddd)',
                borderRadius: 4, background: 'var(--theme-elevation-0, #fff)',
                outline: 'none',
              }}
            />
            {PREFIXES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPrefix(p.value)}
                style={{
                  padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                  border: prefix === p.value
                    ? '2px solid var(--theme-success-500, #2e8b57)'
                    : '1px solid var(--theme-elevation-200, #ddd)',
                  background: prefix === p.value
                    ? 'var(--theme-success-50, #eefaf2)'
                    : 'var(--theme-elevation-0, #fff)',
                  fontWeight: prefix === p.value ? 600 : 400,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Results grid */}
          <div style={{
            overflowY: 'auto', flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
            gap: 4,
          }}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, opacity: 0.5, fontSize: 13 }}>
                Loading…
              </div>
            ) : results.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, opacity: 0.5, fontSize: 13 }}>
                {query ? 'No icons found' : 'Type to search icons'}
              </div>
            ) : (
              results.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  title={icon.id}
                  onClick={() => select(icon)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 2,
                    padding: 6, borderRadius: 6, cursor: 'pointer',
                    border: value === icon.id
                      ? '2px solid var(--theme-success-500, #2e8b57)'
                      : '1px solid transparent',
                    background: value === icon.id
                      ? 'var(--theme-success-50, #eefaf2)'
                      : 'var(--theme-elevation-0, #fff)',
                  }}
                >
                  <svg
                    viewBox={`0 0 ${icon.width} ${icon.height}`}
                    fill="currentColor"
                    style={{ width: 22, height: 22 }}
                    dangerouslySetInnerHTML={{ __html: icon.body }}
                  />
                  <span style={{
                    fontSize: 8, opacity: 0.5, lineHeight: 1.1, textAlign: 'center',
                    maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{icon.name}</span>
                </button>
              ))
            )}
          </div>

          <div style={{ fontSize: 11, opacity: 0.4, marginTop: 8, textAlign: 'right' }}>
            {results.length} icons · {prefix || 'mdi + lucide'}
          </div>
        </div>
      )}
    </div>
  )
}

export default IconPickerField
export { IconPickerField }
