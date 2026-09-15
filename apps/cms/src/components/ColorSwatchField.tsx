'use client'
/**
 * ColorSwatchField — reusable Payload custom field.
 *
 * Phase 4.42 (v1)  — swatch + popover picker (react-colorful HexColorPicker).
 * Phase 4.42a (v2) — local `draft` + 80ms debounced `setValue` (fix "Maximum
 *                    update depth exceeded" saat drag SV/hue).
 * Phase 4.45 (v3)  — dukungan alpha channel via HexAlphaColorPicker: value
 *                    boleh 3/4/6/8-digit hex (`#RGB`, `#RGBA`, `#RRGGBB`,
 *                    `#RRGGBBAA`). Swatch preview di-layer di atas checker
 *                    pattern supaya transparansi kelihatan.
 *
 * Value tetap disimpan sebagai string hex — drop-in ke kolom text existing,
 * 0 migration.
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
 *   - `presets` (string[]) — chip preset di atas picker.
 *   - `alpha` (boolean, default true) — kalau false, matikan alpha channel.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { HexAlphaColorPicker, HexColorPicker, HexColorInput } from 'react-colorful'

// Terima 3/4/6/8-digit hex. Alpha-aware.
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const COMMIT_DEBOUNCE_MS = 80

// Checker pattern jadi background swatch supaya transparansi kelihatan.
const CHECKER_BG = 'repeating-conic-gradient(#d0d5db 0% 25%, #f4f5f7 0% 50%) 50% / 10px 10px'

const ColorSwatchField: React.FC<any> = (props) => {
  const path: string = props?.path ?? props?.field?.name ?? ''
  const label: string | false | undefined = props?.field?.label
  const required: boolean = props?.field?.required ?? false
  const description: string | undefined = props?.field?.admin?.description
  const swatchDefault: string = props?.field?.admin?.custom?.swatchDefault ?? '#1B3A4B'
  const presets: string[] = props?.field?.admin?.custom?.presets ?? []
  const alpha: boolean = props?.field?.admin?.custom?.alpha !== false
  const readOnly: boolean = props?.readOnly ?? false

  const { value, setValue, errorMessage } = useField<string>({ path })
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Debounced buffer (Phase 4.42a — cegah drag loop).
  const [draft, setDraft] = useState<string>(value ?? '')
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCommittedRef = useRef<string>(value ?? '')

  useEffect(() => {
    const v = value ?? ''
    if (v !== lastCommittedRef.current) {
      lastCommittedRef.current = v
      setDraft(v)
    }
  }, [value])

  const flushCommit = useCallback((next: string) => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current)
      commitTimer.current = null
    }
    if (next !== (value ?? '')) {
      lastCommittedRef.current = next
      setValue(next)
    }
  }, [setValue, value])

  const scheduleCommit = useCallback((next: string) => {
    lastCommittedRef.current = next
    if (commitTimer.current) clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(() => {
      commitTimer.current = null
      setValue(next)
    }, COMMIT_DEBOUNCE_MS)
  }, [setValue])

  useEffect(() => () => {
    if (commitTimer.current) clearTimeout(commitTimer.current)
  }, [])

  const handlePickerChange = useCallback((hex: string) => {
    if (readOnly) return
    const norm = hex.startsWith('#') ? hex : `#${hex}`
    setDraft(norm)
    scheduleCommit(norm)
  }, [readOnly, scheduleCommit])

  const handleTextInput = useCallback((raw: string) => {
    if (readOnly) return
    setDraft(raw)
    scheduleCommit(raw)
  }, [readOnly, scheduleCommit])

  const handleReset = useCallback(() => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current)
      commitTimer.current = null
    }
    lastCommittedRef.current = ''
    setDraft('')
    setValue('')
  }, [setValue])

  const handleClose = useCallback(() => {
    if (commitTimer.current) {
      const pending = lastCommittedRef.current
      flushCommit(pending)
    }
    setOpen(false)
  }, [flushCommit])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) handleClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, handleClose])

  const isValid = useMemo(() => !!draft && HEX_RE.test(draft), [draft])
  const swatchColor = isValid ? draft : swatchDefault
  const pickerColor = isValid ? draft : swatchDefault

  // Layer solid color di atas checker → transparansi kelihatan.
  const swatchBackground = `linear-gradient(${swatchColor}, ${swatchColor}), ${CHECKER_BG}`

  // Pilih picker component: alpha-aware vs plain hex.
  const Picker = alpha ? HexAlphaColorPicker : HexColorPicker

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
        {/* Swatch button (checker beneath, solid on top → alpha shows) */}
        <button
          type="button"
          onClick={() => !readOnly && setOpen((o) => !o)}
          aria-label={open ? 'Close color picker' : 'Open color picker'}
          disabled={readOnly}
          style={{
            width: 38, height: 38, flexShrink: 0,
            borderRadius: 6,
            border: '1px solid var(--theme-elevation-200)',
            background: swatchBackground,
            cursor: readOnly ? 'not-allowed' : 'pointer',
            padding: 0,
          }}
        />
        {/* Hex text input */}
        <input
          id={path}
          type="text"
          value={draft}
          onChange={(e) => handleTextInput(e.currentTarget.value)}
          placeholder={swatchDefault}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            width: alpha ? '16ch' : '13ch',
            padding: '0.4rem 0.6rem',
            borderRadius: 6,
            border: `1px solid ${draft && !isValid ? 'var(--theme-error-500)' : 'var(--theme-elevation-200)'}`,
            background: 'var(--theme-input-bg, var(--theme-elevation-50))',
            color: 'var(--theme-text)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        {draft && !readOnly && (
          <button
            type="button"
            onClick={handleReset}
            title="Kosongkan (pakai default)"
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
            <Picker
              color={pickerColor}
              onChange={handlePickerChange}
              style={{ width: '100%', height: alpha ? 190 : 160 }}
            />

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--theme-elevation-500)', fontFamily: 'monospace', fontSize: '0.85rem' }}>#</span>
              <HexColorInput
                color={pickerColor.replace('#', '')}
                onChange={handlePickerChange}
                prefixed={false}
                alpha={alpha}
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

            {alpha && (
              <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: 'var(--theme-elevation-500)', lineHeight: 1.4 }}>
                Format: <code>#RRGGBB</code> atau <code>#RRGGBBAA</code> (dgn alpha 00–FF).
              </p>
            )}

            {presets.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePickerChange(p)}
                    title={p}
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      border: '1px solid var(--theme-elevation-200)',
                      background: `linear-gradient(${p}, ${p}), ${CHECKER_BG}`,
                      cursor: 'pointer', padding: 0,
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
