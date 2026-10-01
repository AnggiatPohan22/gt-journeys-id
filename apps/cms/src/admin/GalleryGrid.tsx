'use client'
/**
 * GtJourneysID — Gallery thumbnail grid (Phase 4.26c, pilot rewrite).
 *
 * Rendered via `admin.components.afterInput` on the Accommodations
 * `gallery` array field. Fully owns the visual layout — the default
 * Payload array UI is hidden by gallery-grid.css. Underlying form
 * state (the `gallery` array of {image, caption}) is untouched:
 * this component only reads it and dispatches Payload's standard
 * MOVE_ROW / REMOVE_ROW actions.
 *
 * Why a full custom component instead of restyling Payload's rows
 * (which 4.26b tried): Payload wraps each row in a Collapsible
 * whose body sits inside a `react-animate-height` div with inline
 * `height:0` when collapsed. CSS `!important` can't defeat inline
 * style reliably. Rather than fight the DOM, we hide it and render
 * our own cards.
 *
 * Edit UX (E3) is preserved via Payload's own DocumentDrawer hook —
 * clicking ✎ opens the Media doc drawer (same UX as clicking a
 * Payload upload cell today: replace file, edit alt/caption, etc.).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  toast,
  useAllFormFields,
  useDocumentDrawer,
  useForm,
} from '@payloadcms/ui'

const GALLERY_PATH = 'gallery'

type MediaMeta = {
  id: number | string
  filename?: string
  alt?: string
  thumbnailUrl?: string
}

type Row = { rowId: string; index: number; mediaId: number | string | null }

/** Extract rows and their media ids from Payload form state. */
const readRows = (fields: Record<string, any>): Row[] => {
  const rowsMeta = fields?.[GALLERY_PATH]?.rows
  if (!Array.isArray(rowsMeta)) return []
  return rowsMeta.map((r: any, i: number) => {
    const mid = fields?.[`${GALLERY_PATH}.${i}.image`]?.value
    return {
      rowId: String(r?.id ?? i),
      index: i,
      mediaId: mid === undefined || mid === null || mid === '' ? null : (mid as number | string),
    }
  })
}

/** Fetch metadata for a set of media ids. One request, batched. */
const fetchMediaMeta = async (
  ids: Array<number | string>,
  signal?: AbortSignal,
): Promise<Record<string, MediaMeta>> => {
  if (ids.length === 0) return {}
  const params = new URLSearchParams()
  ids.forEach((id) => params.append('where[id][in]', String(id)))
  params.set('limit', String(Math.max(ids.length, 25)))
  params.set('depth', '0')
  const res = await fetch(`/api/media?${params.toString()}`, {
    credentials: 'include',
    signal,
  })
  if (!res.ok) throw new Error(`Media fetch failed: HTTP ${res.status}`)
  const body = await res.json()
  const docs: any[] = body?.docs ?? []
  const out: Record<string, MediaMeta> = {}
  for (const doc of docs) {
    out[String(doc.id)] = {
      id: doc.id,
      filename: doc.filename,
      alt: doc.alt,
      thumbnailUrl: doc?.sizes?.thumbnail?.url ?? doc?.url,
    }
  }
  return out
}

/**
 * One card. Owns its own DocumentDrawer instance (Payload's built-in
 * media edit drawer) — must be a component so the hook can bind.
 */
const Card: React.FC<{
  row: Row
  total: number
  meta: MediaMeta | null
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  onEditSaved: (mediaId: number | string) => void
}> = ({ row, total, meta, onMove, onRemove, onEditSaved }) => {
  const collectionSlug = 'media'
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
    collectionSlug,
    id: row.mediaId ?? undefined,
  })

  const isFirst = row.index === 0
  const isLast = row.index === total - 1
  const missing = !row.mediaId
  const thumb = meta?.thumbnailUrl
  const alt = meta?.alt || meta?.filename || `Photo ${row.index + 1}`

  return (
    <div className="dnj-gg__card" data-missing={missing || undefined}>
      {/* Image zone (top): thumbnail + number badge overlay */}
      <div className="dnj-gg__image">
        {thumb ? (
          <img className="dnj-gg__thumb" src={thumb} alt={alt} loading="lazy" draggable={false} />
        ) : (
          <div className="dnj-gg__thumb dnj-gg__thumb--placeholder">
            <span>{missing ? 'Missing media' : 'Loading…'}</span>
          </div>
        )}
        <span className="dnj-gg__badge" aria-label={`Photo ${row.index + 1} of ${total}`}>
          {row.index + 1}
        </span>
      </div>

      {/* Toolbar (bottom): left = reorder nav, right = edit + delete */}
      <div className="dnj-gg__toolbar">
        <div className="dnj-gg__group dnj-gg__group--nav">
          <button
            type="button"
            className="dnj-gg__btn dnj-gg__btn--nav"
            title="Move left"
            aria-label="Move photo left"
            onClick={() => onMove(row.index, row.index - 1)}
            disabled={isFirst}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="dnj-gg__btn dnj-gg__btn--nav"
            title="Move right"
            aria-label="Move photo right"
            onClick={() => onMove(row.index, row.index + 1)}
            disabled={isLast}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="dnj-gg__group dnj-gg__group--actions">
          {row.mediaId ? (
            <DocumentDrawerToggler
              className="dnj-gg__btn dnj-gg__btn--edit"
              title="Edit / replace this photo"
              aria-label="Edit photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </DocumentDrawerToggler>
          ) : null}
          <button
            type="button"
            className="dnj-gg__btn dnj-gg__btn--delete"
            title="Remove this photo"
            aria-label="Remove photo"
            onClick={() => onRemove(row.index)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {/* The drawer itself (mounted when open) */}
      {row.mediaId ? (
        <DocumentDrawer
          onSave={() => onEditSaved(row.mediaId!)}
        />
      ) : null}
    </div>
  )
}

const GalleryGrid: React.FC = () => {
  const { dispatchFields, setModified } = useForm()
  const [fields] = useAllFormFields()
  const rows = useMemo(() => readRows(fields), [fields])
  const idsKey = rows.map((r) => r.mediaId ?? '_').join(',')

  const [metaById, setMetaById] = useState<Record<string, MediaMeta>>({})
  const abortRef = useRef<AbortController | null>(null)

  const loadMissing = useCallback(async (ids: Array<number | string>) => {
    if (ids.length === 0) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const fetched = await fetchMediaMeta(ids, ctrl.signal)
      setMetaById((prev) => ({ ...prev, ...fetched }))
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      // eslint-disable-next-line no-console
      console.error('[GalleryGrid] media fetch failed', e)
    }
  }, [])

  // Refetch metadata for any newly-appearing ids.
  useEffect(() => {
    const wanted = Array.from(new Set(rows.map((r) => r.mediaId).filter((v): v is number | string => v !== null)))
    const missing = wanted.filter((id) => !metaById[String(id)])
    if (missing.length > 0) void loadMissing(missing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || to < 0 || to >= rows.length) return
      dispatchFields({
        type: 'MOVE_ROW',
        path: GALLERY_PATH,
        moveFromIndex: from,
        moveToIndex: to,
      })
      if (typeof setModified === 'function') setModified(true)
    },
    [rows.length, dispatchFields, setModified],
  )

  const remove = useCallback(
    (index: number) => {
      if (!window.confirm('Remove this photo from the gallery?')) return
      dispatchFields({
        type: 'REMOVE_ROW',
        path: GALLERY_PATH,
        rowIndex: index,
      })
      if (typeof setModified === 'function') setModified(true)
      toast.success('Photo removed. Don\'t forget to Save.')
    },
    [dispatchFields, setModified],
  )

  const onEditSaved = useCallback(
    (mediaId: number | string) => {
      // The Media doc was edited (file replaced or metadata changed).
      // Re-fetch its meta so the thumbnail refreshes.
      void loadMissing([mediaId]).then(() => {
        // Force cache-buster by nudging state.
        setMetaById((prev) => ({ ...prev }))
      })
      if (typeof setModified === 'function') setModified(true)
    },
    [loadMissing, setModified],
  )

  if (rows.length === 0) {
    return (
      <div className="dnj-gg dnj-gg--empty">
        <p>No photos yet — use <strong>Bulk upload</strong> above to add up to 10.</p>
      </div>
    )
  }

  return (
    <div className="dnj-gg">
      {rows.map((row) => (
        <Card
          key={row.rowId}
          row={row}
          total={rows.length}
          meta={row.mediaId ? metaById[String(row.mediaId)] ?? null : null}
          onMove={move}
          onRemove={remove}
          onEditSaved={onEditSaved}
        />
      ))}
    </div>
  )
}

export default GalleryGrid
