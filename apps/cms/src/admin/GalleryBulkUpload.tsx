'use client'
/**
 * DnJourneysBali — Gallery bulk uploader (Phase 4.26 · A, pilot).
 *
 * Rendered as a `ui` field sibling right before `gallery` on the
 * Accommodations edit view. Lets the editor pick up to 10 image files
 * at once from disk, uploads each to /api/media (Payload REST), and
 * appends one row per success to the existing `gallery` array WITHOUT
 * touching rows that were already there.
 *
 * Pilot scope: Accommodations only. Do not wire onto other services
 * until UX is validated.
 */
import React, { useRef, useState } from 'react'
import { toast, useAllFormFields, useForm } from '@payloadcms/ui'

const MAX_ROWS = 10
const GALLERY_PATH = 'gallery'

const filenameToAlt = (name: string): string => {
  const base = name.replace(/\.[^.]+$/, '')
  return base
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const GalleryBulkUpload: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const { dispatchFields } = useForm()
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
    inputRef.current?.click()
  }

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    let files = Array.from(fileList)
    const truncated = files.length > remaining
    if (truncated) {
      files = files.slice(0, remaining)
      toast.warning(
        `Only ${remaining} slot${remaining === 1 ? '' : 's'} left — using the first ${remaining} of ${fileList.length}.`,
      )
    }

    setBusy(true)
    setProgress({ done: 0, total: files.length })
    const failures: string[] = []
    let insertAt = currentCount

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('_payload', JSON.stringify({ alt: filenameToAlt(file.name) }))

        const res = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: fd,
        })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(text || `HTTP ${res.status}`)
        }
        const body = await res.json()
        const mediaId = body?.doc?.id ?? body?.id
        if (!mediaId) throw new Error('No media id in response')

        dispatchFields({
          type: 'ADD_ROW',
          path: GALLERY_PATH,
          rowIndex: insertAt,
          subFieldState: {
            image: { value: mediaId, initialValue: mediaId, valid: true },
            caption: { value: '', initialValue: '', valid: true },
          },
        })
        insertAt++
      } catch (e: any) {
        failures.push(file.name)
        // eslint-disable-next-line no-console
        console.error('[GalleryBulkUpload] upload failed', file.name, e)
      }
      setProgress({ done: i + 1, total: files.length })
    }

    setBusy(false)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''

    const ok = files.length - failures.length
    if (ok > 0) toast.success(`Added ${ok} image${ok === 1 ? '' : 's'} to gallery.`)
    if (failures.length > 0) {
      toast.error(`Failed: ${failures.join(', ')}`)
    }
  }

  const label = busy
    ? progress
      ? `Uploading ${progress.done}/${progress.total}…`
      : 'Uploading…'
    : `Bulk upload (max ${MAX_ROWS}, ${remaining} left)`

  return (
    <div className="dnj-bulk-upload" style={{ margin: '0 0 1rem' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.currentTarget.files)}
      />
      <button
        type="button"
        className="btn btn--style-secondary btn--size-small"
        onClick={openPicker}
        disabled={busy || remaining <= 0}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--theme-elevation-150)',
          background: busy || remaining <= 0 ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          cursor: busy || remaining <= 0 ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <span aria-hidden="true">📥</span> {label}
      </button>
      <p
        style={{
          margin: '0.4rem 0 0',
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-500)',
        }}
      >
        Pick multiple photos at once. Alt text is auto-filled from filename and can be edited later on each Media doc. Existing gallery rows are preserved.
      </p>
    </div>
  )
}

export default GalleryBulkUpload
