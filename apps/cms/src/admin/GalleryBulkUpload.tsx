'use client'
/**
 * DnJourneysBali — Gallery bulk uploader (Phase 4.26 · A, pilot; v2 bugfix).
 *
 * Rendered as a `ui` field sibling right before `gallery` on the
 * Accommodations edit view. Lets the editor pick up to 10 image files
 * at once from disk, uploads each to /api/media (Payload REST), then
 * appends one row per success to the existing `gallery` array WITHOUT
 * touching rows that were already there.
 *
 * v2 (Phase 4.26a bugfix — v1 hung silently on any failure):
 *   1. All fetches run first, sequentially, each with 60s AbortController
 *      timeout — no more infinite hangs.
 *   2. Only after all fetches complete do we dispatch ADD_ROW actions
 *      (avoids interleaving fetches with form re-renders).
 *   3. try/finally guarantees the busy flag clears no matter what.
 *   4. Failures surface both as toast AND as an inline error panel
 *      under the button — editor sees them without opening devtools.
 *   5. setModified(true) fires after successful dispatches — Save
 *      button lights up so the editor can actually persist.
 *   6. console.info at each step + explicit filename on FormData.
 */
import React, { useRef, useState } from 'react'
import { toast, useAllFormFields, useForm } from '@payloadcms/ui'

const MAX_ROWS = 10
const GALLERY_PATH = 'gallery'
const FETCH_TIMEOUT_MS = 60_000

const filenameToAlt = (name: string): string => {
  const base = name.replace(/\.[^.]+$/, '')
  const cleaned = base.replace(/[-_]+/g, ' ').trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Image'
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

const uploadOne = async (
  file: File,
): Promise<{ ok: true; id: number | string } | { ok: false; error: string }> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const fd = new FormData()
    fd.append('file', file, file.name)
    fd.append('_payload', JSON.stringify({ alt: filenameToAlt(file.name) }))

    const res = await fetch('/api/media', {
      method: 'POST',
      credentials: 'include',
      body: fd,
      signal: controller.signal,
    })

    let body: any = null
    try {
      body = await res.json()
    } catch {
      /* non-json body — ignore, fall back to status text */
    }

    if (!res.ok) {
      const msg =
        body?.errors?.[0]?.message ||
        body?.message ||
        `HTTP ${res.status} ${res.statusText || ''}`.trim()
      return { ok: false, error: msg }
    }

    const id = body?.doc?.id ?? body?.id
    if (id === undefined || id === null) {
      return { ok: false, error: 'No media id in response' }
    }
    return { ok: true, id }
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      return { ok: false, error: `Timed out after ${FETCH_TIMEOUT_MS / 1000}s` }
    }
    return { ok: false, error: e?.message || String(e) }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

const GalleryBulkUpload: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [progressText, setProgressText] = useState<string>('')
  const [errorLines, setErrorLines] = useState<string[]>([])
  const { dispatchFields, setModified } = useForm()
  const [fields] = useAllFormFields()

  const currentCount =
    typeof fields?.[GALLERY_PATH]?.value === 'number'
      ? (fields[GALLERY_PATH].value as number)
      : Array.isArray(fields?.[GALLERY_PATH]?.rows)
        ? (fields[GALLERY_PATH].rows as unknown[]).length
        : 0

  const remaining = Math.max(0, MAX_ROWS - currentCount)

  const openPicker = () => {
    if (busy) return
    if (remaining <= 0) {
      toast.warning(`Gallery is full (${MAX_ROWS} max). Remove some images to add more.`)
      return
    }
    setErrorLines([])
    inputRef.current?.click()
  }

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    let files = Array.from(fileList)
    const originalPicked = files.length
    if (files.length > remaining) {
      files = files.slice(0, remaining)
      toast.warning(
        `Only ${remaining} slot${remaining === 1 ? '' : 's'} left — using the first ${remaining} of ${originalPicked}.`,
      )
    }

    setBusy(true)
    setErrorLines([])
    setProgressText(`Uploading 0 / ${files.length}…`)
    // eslint-disable-next-line no-console
    console.info('[GalleryBulkUpload] starting', { count: files.length, currentCount })

    const succeeded: Array<{ id: number | string; name: string }> = []
    const failed: Array<{ name: string; error: string }> = []

    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        setProgressText(`Uploading ${i + 1} / ${files.length} · ${f.name}`)
        // eslint-disable-next-line no-console
        console.info('[GalleryBulkUpload] uploading', f.name, `${(f.size / 1024).toFixed(0)}KB`)
        const result = await uploadOne(f)
        if (result.ok) {
          succeeded.push({ id: result.id, name: f.name })
          // eslint-disable-next-line no-console
          console.info('[GalleryBulkUpload] uploaded', f.name, '→ id', result.id)
        } else {
          failed.push({ name: f.name, error: result.error })
          // eslint-disable-next-line no-console
          console.error('[GalleryBulkUpload] failed', f.name, result.error)
        }
      }

      let insertAt = currentCount
      for (const s of succeeded) {
        dispatchFields({
          type: 'ADD_ROW',
          path: GALLERY_PATH,
          rowIndex: insertAt,
          subFieldState: {
            image: { value: s.id, initialValue: s.id, valid: true },
            caption: { value: '', initialValue: '', valid: true },
          },
        })
        insertAt++
      }
      if (succeeded.length > 0 && typeof setModified === 'function') {
        setModified(true)
      }
    } finally {
      setBusy(false)
      setProgressText('')
      if (inputRef.current) inputRef.current.value = ''
      // eslint-disable-next-line no-console
      console.info('[GalleryBulkUpload] done', {
        succeeded: succeeded.length,
        failed: failed.length,
      })
    }

    if (succeeded.length > 0) {
      toast.success(
        `Added ${succeeded.length} image${succeeded.length === 1 ? '' : 's'} to gallery. Don't forget to Save.`,
      )
    }
    if (failed.length > 0) {
      setErrorLines(failed.map((f) => `${f.name} — ${f.error}`))
      toast.error(
        `${failed.length} upload${failed.length === 1 ? '' : 's'} failed. See details below the button.`,
      )
    }
  }

  const label = busy
    ? progressText || 'Uploading…'
    : `Bulk upload (max ${MAX_ROWS}, ${remaining} left)`

  const btnDisabled = busy || remaining <= 0

  return (
    <div className="dnj-bulk-upload" style={{ margin: '0 0 1rem' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          void handleFiles(e.currentTarget.files)
        }}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={btnDisabled}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--theme-elevation-150)',
          background: btnDisabled ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          cursor: btnDisabled ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          maxWidth: '100%',
        }}
      >
        <span aria-hidden="true">📥</span>{' '}
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '32ch',
          }}
        >
          {label}
        </span>
      </button>
      <p
        style={{
          margin: '0.4rem 0 0',
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-500)',
        }}
      >
        Pick multiple photos at once. Alt text is auto-filled from filename and can be edited later
        on each Media doc. Existing gallery rows are preserved. Remember to <strong>Save</strong>{' '}
        the document to persist the new rows.
      </p>
      {errorLines.length > 0 && (
        <div
          role="alert"
          style={{
            marginTop: '0.6rem',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--theme-error-500, #c33)',
            borderRadius: '0.375rem',
            background: 'var(--theme-error-50, rgba(204,51,51,0.08))',
            color: 'var(--theme-error-700, #a22)',
            fontSize: '0.75rem',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Upload errors:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {errorLines.map((line, i) => (
              <li key={i} style={{ overflowWrap: 'anywhere' }}>
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default GalleryBulkUpload
