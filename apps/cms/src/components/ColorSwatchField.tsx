'use client'
/**
 * ColorSwatchField — reusable Payload custom field (Phase 4.42).
 *
 * Menggantikan text-input hex biasa dengan swatch + popover picker
 * (`react-colorful` HexColorPicker + HexColorInput). Value tetap disimpan
 * sebagai string hex (`#RRGGBB` atau `#RGB`), jadi kompatibel penuh dengan
 * kolom text existing — 0 migration untuk swap ke sini.
 *
 * Pemakaian di config Payload:
 *
 *   { name: 'menuActiveColor', type: 'text', validate,
 *     admin: {
 *       components: { Field: '/components/ColorSwatchField#default' },
 *     }
 *   }
 *
 * Props opsional lewat `admin.custom`:
 *   - `swatchDefault` (string) — warna yang ditampilkan swatch kalau field kosong.
 *   - `presets` (string[]) — chip preset di atas picker (opsional).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { HexColorPicker, HexColorInput } from 'react-colorful'

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const ColorSwatchField: React.FC<any> = (props) => {
  const path: string = props?.path ?? props?.field?.name ?? ''
  // `label` can be string, false (hide), or undefined
  const label: string | false | undefined = props?.field?.label
  const required: boolean = props?.field?.required ?? false
  const description: string | undefined = props?.field?.admin?.description
  const swatchDefault: string = props?.field?.admin?.custom?.swatchDefault ?? '#1B3A4B'
  const presets: string[] = props?.field?.admin?.custom?.presets ?? []
  const readOnly: boolean = props?.readOnly ?? false

  const { value, setValue, errorMessage } = useField<string>({ path })
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const isValid = useMemo(() => !!value && HEX_RE.test(value), [value])
  const swatchColor = isValid ? (value as string) : swatchDefault

  // Close popover on outside click / ESC
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const commit = (hex: string) => {
    if (readOnly) return
    setValue(hex.startsWith('#') ? hex : `#${hex}`)
  }

  return (
    <div className="field-type" style={{ marginBottom: '1rem' }}>
      {label !== false && (
        <label
          htmlFor={path}
          className="field-label"
          style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}
        >
          {label || path}
          {required && <span style={{ color: 'var(--theme-error-500)' }}> *</span>}
        </label>
      )}

      <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Swatch button */}
        <button
          type="button"
          onClick={() => !readOnly && setOpen((o) => !o)}
          aria-label={open ? 'Close color picker' : 'Open color picker'}
          disabled={readOnly}
          style={{
            width: 38, height: 38, flexShrink: 0,
            borderRadius: 6,
            border: '1px solid var(--theme-elevation-200)',
            background: isValid
              ? swatchColor
              : `${swatchDefault} repeating-conic-gradient(rgba(0,0,0,0.06) 0% 25%, rgba(0,0,0,0.02) 0% 50%) 50% / 12px 12px`,
            cursor: readOnly ? 'not-allowed' : 'pointer',
            padding: 0,
          }}
        />
        {/* Hex text input */}
        <input
          id={path}
          type="text"
          value={value || ''}
          onChange={(e) => commit(e.currentTarget.value)}
          placeholder={swatchDefault}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            width: '13ch',
            padding: '0.4rem 0.6rem',
            borderRadius: 6,
            border: `1px solid ${value && !isValid ? 'var(--theme-error-500)' : 'var(--theme-elevation-200)'}`,
            background: 'var(--theme-input-bg, var(--theme-elevation-50))',
            color: 'var(--theme-text)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        {/* Reset (only shown when a value is set) */}
        {value && !readOnly && (
          <button
            type="button"
            onClick={() => setValue('')}
            title="Kosongkan (pakai default template)"
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: 6,
              border: '1px solid var(--theme-elevation-200)',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-elevation-600)',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >Reset</button>
        )}

        {/* Popover */}
        {open && (
          <div
            role="dialog"
            aria-label="Color picker"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              zIndex: 100,
              background: 'var(--theme-bg, #fff)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 10,
              padding: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.20)',
              width: 240,
            }}
          >
            {/* SV rectangle + hue slider from react-colorful */}
            <HexColorPicker
              color={isValid ? (value as string) : swatchDefault}
              onChange={commit}
              style={{ width: '100%', height: 160 }}
            />

            {/* Hex input row */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--theme-elevation-500)', fontFamily: 'monospace', fontSize: '0.85rem' }}>#</span>
              <HexColorInput
                color={(isValid ? (value as string) : swatchDefault).replace('#', '')}
                onChange={commit}
                prefixed={false}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-input-bg, var(--theme-elevation-50))',
                  color: 'var(--theme-text)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  outline: 'none',
                }}
              />
            </div>

            {/* Presets */}
            {presets.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => commit(p)}
                    title={p}
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      border: '1px solid var(--theme-elevation-200)',
                      background: p, cursor: 'pointer', padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {description && (
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>
          {description}
        </p>
      )}
      {errorMessage && (
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--theme-error-500)' }}>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default ColorSwatchField
