'use client'
/**
 * GtJourneysID — Gallery Media Picker (Phase 4.40).
 *
 * Sibling `ui` field yang di-mount tepat sebelum array `gallery`. Menampilkan
 * dua tombol yang bersanding:
 *   📥 Upload new       → identik dengan GalleryBulkUpload lama (Phase 4.26).
 *   📎 Pick from library → membuka modal picker: grid thumbnail Media yang
 *                          sudah ada, multi-select, append sebagai row baru
 *                          TANPA re-upload file (hemat storage).
 *
 * Keduanya menghormati `remaining slots` (MAX_ROWS - currentCount), skip
 * media yang sudah ada di gallery ini, dan trigger `setModified(true)` biar
 * tombol Save lampu-menyala.
 *
 * Rilis bertahap: Destinations dulu (test), setelah UAT baru swap 10
 * koleksi lain dari GalleryBulkUpload → GalleryMediaPicker (config only).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast, useAllFormFields, useForm } from '@payloadcms/ui'

const MAX_ROWS = 10
const GALLERY_PATH = 'gallery'
const FETCH_TIMEOUT_MS = 60_000
const PAGE_SIZE = 48

// ── Types ────────────────────────────────────────────────────────
type MediaDoc = {
  id: number
  filename?: string | null
  alt?: string | null
  mimeType?: string | null
  url?: string | null
  sizes?: {
    thumbnail?: { url?: string | null } | null
    card?: { url?: string | null } | null
  } | null
}

// ── Helpers ──────────────────────────────────────────────────────
const filenameToAlt = (name: string): string => {
  const base = name.replace(/\.[^.]+$/, '')
  const cleaned = base.replace(/[-_]+/g, ' ').trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Image'
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

const thumbUrl = (m: MediaDoc): string => {
  return m.sizes?.thumbnail?.url ?? m.sizes?.card?.url ?? m.url ?? ''
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
    try { body = await res.json() } catch { /* non-json */ }
    if (!res.ok) {
      const msg = body?.errors?.[0]?.message || body?.message || `HTTP ${res.status}`
      return { ok: false, error: msg }
    }
    const id = body?.doc?.id ?? body?.id
    if (id === undefined || id === null) return { ok: false, error: 'No media id in response' }
    return { ok: true, id }
  } catch (e: any) {
    if (e?.name === 'AbortError') return { ok: false, error: `Timed out after ${FETCH_TIMEOUT_MS / 1000}s` }
    return { ok: false, error: e?.message || String(e) }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

// ── Component ────────────────────────────────────────────────────
const GalleryMediaPicker: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [errorLines, setErrorLines] = useState<string[]>([])
  const { dispatchFields, setModified } = useForm()
  const [fields] = useAllFormFields()

  // ── Modal state ──
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [docs, setDocs] = useState<MediaDoc[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // ── Current gallery counting ──
  const currentCount =
    typeof fields?.[GALLERY_PATH]?.value === 'number'
      ? (fields[GALLERY_PATH].value as number)
      : Array.isArray(fields?.[GALLERY_PATH]?.rows)
        ? (fields[GALLERY_PATH].rows as unknown[]).length
        : 0
  const remaining = Math.max(0, MAX_ROWS - currentCount)

  const alreadyPickedIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>()
    const rows = fields?.[GALLERY_PATH]?.rows as unknown[] | undefined
    const rowCount = rows?.length ?? currentCount
    for (let i = 0; i < rowCount; i++) {
      const v = fields?.[`${GALLERY_PATH}.${i}.image`]?.value
      if (typeof v === 'number') ids.add(v)
      else if (typeof v === 'string' && /^\d+$/.test(v)) ids.add(Number(v))
    }
    return ids
  }, [fields, currentCount])

  // ── UPLOAD path ──
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
      toast.warning(`Only ${remaining} slot${remaining === 1 ? '' : 's'} left — using the first ${remaining} of ${originalPicked}.`)
    }
    setBusy(true); setErrorLines([]); setProgressText(`Uploading 0 / ${files.length}…`)
    const succeeded: Array<{ id: number | string }> = []
    const failed: Array<{ name: string; error: string }> = []
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        setProgressText(`Uploading ${i + 1} / ${files.length} · ${f.name}`)
        const r = await uploadOne(f)
        if (r.ok) succeeded.push({ id: r.id })
        else failed.push({ name: f.name, error: r.error })
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
      if (succeeded.length > 0 && typeof setModified === 'function') setModified(true)
    } finally {
      setBusy(false); setProgressText('')
      if (inputRef.current) inputRef.current.value = ''
    }
    if (succeeded.length > 0) toast.success(`Uploaded ${succeeded.length} image${succeeded.length === 1 ? '' : 's'}. Don't forget to Save.`)
    if (failed.length > 0) {
      setErrorLines(failed.map((f) => `${f.name} — ${f.error}`))
      toast.error(`${failed.length} upload${failed.length === 1 ? '' : 's'} failed. See details below.`)
    }
  }

  // ── LIBRARY PICKER path ──
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(t)
  }, [query])

  const loadPage = async (p: number, q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(p),
        sort: '-createdAt',
        depth: '0',
      })
      if (q) {
        // Payload REST: search across searchable fields via `?search=`
        // is not built in; use filename `like` for the common case.
        params.set('where[filename][like]', q)
      }
      const res = await fetch(`/api/media?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      const rows: MediaDoc[] = (body?.docs ?? []).filter((d: MediaDoc) => (d.mimeType ?? '').startsWith('image/'))
      setDocs(rows)
      setTotalPages(body?.totalPages ?? 1)
    } catch (e: any) {
      toast.error(`Load media failed: ${e?.message || e}`)
      setDocs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pickerOpen) void loadPage(page, debouncedQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, page, debouncedQuery])

  const openLibrary = () => {
    if (remaining <= 0) {
      toast.warning(`Gallery is full (${MAX_ROWS} max). Remove some images to add more.`)
      return
    }
    setSelected(new Set())
    setQuery('')
    setDebouncedQuery('')
    setPage(1)
    setPickerOpen(true)
  }

  const toggleSelect = (id: number) => {
    if (alreadyPickedIds.has(id)) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= remaining) {
          toast.warning(`Only ${remaining} slot${remaining === 1 ? '' : 's'} left.`)
          return prev
        }
        next.add(id)
      }
      return next
    })
  }

  const commitPicks = () => {
    if (selected.size === 0) return
    let insertAt = currentCount
    for (const id of selected) {
      dispatchFields({
        type: 'ADD_ROW',
        path: GALLERY_PATH,
        rowIndex: insertAt,
        subFieldState: {
          image: { value: id, initialValue: id, valid: true },
          caption: { value: '', initialValue: '', valid: true },
        },
      })
      insertAt++
    }
    if (typeof setModified === 'function') setModified(true)
    toast.success(`Added ${selected.size} existing image${selected.size === 1 ? '' : 's'} to gallery.`)
    setPickerOpen(false)
  }

  // Close modal on ESC
  useEffect(() => {
    if (!pickerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickerOpen])

  const uploadLabel = busy ? (progressText || 'Uploading…') : `Upload new (${remaining} left)`
  const libLabel = `Pick from library`
  const btnBase: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--theme-elevation-150)',
    background: 'var(--theme-elevation-50)',
    color: 'var(--theme-text)',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
  }
  const btnDisabled: React.CSSProperties = { ...btnBase, background: 'var(--theme-elevation-100)', cursor: 'not-allowed' }

  return (
    <div className="dnj-bulk-upload" style={{ margin: '0 0 1rem' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { void handleFiles(e.currentTarget.files) }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <button type="button" onClick={openPicker} disabled={busy || remaining <= 0} style={busy || remaining <= 0 ? btnDisabled : btnBase}>
          <span aria-hidden>📥</span>
          <span style={{ maxWidth: '32ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadLabel}</span>
        </button>
        <button type="button" onClick={openLibrary} disabled={remaining <= 0} style={remaining <= 0 ? btnDisabled : btnBase}>
          <span aria-hidden>📎</span>
          <span>{libLabel}</span>
        </button>
      </div>

      <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>
        <strong>Upload new</strong>: pick banyak file dari disk sekaligus (alt otomatis dari nama file).{' '}
        <strong>Pick from library</strong>: pilih gambar yang sudah pernah di-upload — <em>tidak menambah storage</em>. Sisa slot: <strong>{remaining}</strong>. Existing gallery rows tetap dipertahankan. Jangan lupa <strong>Save</strong> setelah menambah.
      </p>

      {errorLines.length > 0 && (
        <div role="alert" style={{
          marginTop: '0.6rem', padding: '0.5rem 0.75rem',
          border: '1px solid var(--theme-error-500, #c33)',
          borderRadius: '0.375rem',
          background: 'var(--theme-error-50, rgba(204,51,51,0.08))',
          color: 'var(--theme-error-700, #a22)',
          fontSize: '0.75rem', lineHeight: 1.4,
        }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Upload errors:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {errorLines.map((l, i) => <li key={i} style={{ overflowWrap: 'anywhere' }}>{l}</li>)}
          </ul>
        </div>
      )}

      {pickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pick from media library"
          onClick={(e) => { if (e.target === e.currentTarget) setPickerOpen(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2vh 2vw',
          }}
        >
          <div style={{
            background: 'var(--theme-bg, #fff)', color: 'var(--theme-text)',
            width: 'min(1100px, 96vw)', maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
            borderRadius: '0.5rem', overflow: 'hidden',
            border: '1px solid var(--theme-elevation-150)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}>
            {/* Header */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--theme-elevation-150)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <strong style={{ fontSize: '0.95rem' }}>Pick from media library</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>
                {selected.size} selected · {remaining} slot{remaining === 1 ? '' : 's'} left
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="search"
                  placeholder="Search filename…"
                  value={query}
                  onChange={(e) => { setQuery(e.currentTarget.value); setPage(1) }}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--theme-elevation-150)',
                    background: 'var(--theme-input-bg, var(--theme-elevation-50))',
                    color: 'var(--theme-text)',
                    fontSize: '0.8rem',
                    minWidth: '18ch',
                  }}
                />
                <button type="button" onClick={() => setPickerOpen(false)} style={btnBase} aria-label="Close">✕</button>
              </div>
            </div>

            {/* Grid */}
            <div style={{ padding: '1rem', overflow: 'auto', flex: 1, background: 'var(--theme-elevation-25)' }}>
              {loading && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-elevation-500)' }}>Loading…</p>}
              {!loading && docs.length === 0 && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-elevation-500)' }}>
                  No images found{debouncedQuery ? ` for "${debouncedQuery}"` : ''}.
                </p>
              )}
              {!loading && docs.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.6rem',
                }}>
                  {docs.map((m) => {
                    const already = alreadyPickedIds.has(m.id)
                    const isSel = selected.has(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSelect(m.id)}
                        disabled={already}
                        title={already ? 'Already in this gallery' : (m.filename ?? m.alt ?? '')}
                        style={{
                          position: 'relative',
                          border: isSel ? '2px solid var(--theme-success-500, #2a9d5c)' : '1px solid var(--theme-elevation-150)',
                          borderRadius: '0.4rem',
                          padding: 0,
                          overflow: 'hidden',
                          background: 'var(--theme-elevation-50)',
                          cursor: already ? 'not-allowed' : 'pointer',
                          opacity: already ? 0.4 : 1,
                          aspectRatio: '4 / 3',
                        }}
                      >
                        {thumbUrl(m) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl(m)}
                            alt={m.alt ?? m.filename ?? ''}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '0.7rem', color: 'var(--theme-elevation-500)' }}>
                            no preview
                          </div>
                        )}
                        {isSel && (
                          <div style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'var(--theme-success-500, #2a9d5c)',
                            color: '#fff', fontSize: 14, lineHeight: '22px',
                            textAlign: 'center', fontWeight: 700,
                          }}>✓</div>
                        )}
                        {already && (
                          <div style={{
                            position: 'absolute', bottom: 4, left: 4, right: 4,
                            padding: '2px 6px', fontSize: 10,
                            background: 'rgba(0,0,0,0.55)', color: '#fff',
                            borderRadius: 3, textAlign: 'center',
                          }}>already in gallery</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--theme-elevation-150)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                style={page <= 1 || loading ? btnDisabled : btnBase}
              >← Prev</button>
              <span style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-500)' }}>Page {page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                style={page >= totalPages || loading ? btnDisabled : btnBase}
              >Next →</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setPickerOpen(false)} style={btnBase}>Cancel</button>
                <button
                  type="button"
                  onClick={commitPicks}
                  disabled={selected.size === 0}
                  style={{
                    ...(selected.size === 0 ? btnDisabled : btnBase),
                    background: selected.size === 0 ? undefined : 'var(--theme-success-500, #2a9d5c)',
                    color: selected.size === 0 ? undefined : '#fff',
                    borderColor: selected.size === 0 ? undefined : 'var(--theme-success-500, #2a9d5c)',
                    fontWeight: 600,
                  }}
                >Add {selected.size > 0 ? `${selected.size} ` : ''}to gallery</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryMediaPicker
