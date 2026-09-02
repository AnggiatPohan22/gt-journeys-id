'use client'
/**
 * DnJourneysBali — Gallery card overlay (Phase 4.26b, pilot).
 *
 * Rendered via `admin.components.beforeInput` on the `image` upload
 * field INSIDE each `gallery` array row. One instance per row.
 *
 * Draws the overlay controls on top of Payload's upload cell (which
 * remains the primary Edit / Choose-from-library UX):
 *   - index badge (top-left)
 *   - delete button (top-right, red)
 *   - reorder-left arrow (bottom-left)
 *   - reorder-right arrow (bottom-right)
 *
 * State mutations dispatch the same reducer actions Payload's own
 * array UI uses (REMOVE_ROW / MOVE_ROW), so the underlying `gallery`
 * data structure and save flow are unchanged.
 */
import React, { useMemo } from 'react'
import { useAllFormFields, useForm } from '@payloadcms/ui'

const GALLERY_PATH = 'gallery'

type Props = {
  path?: string
}

/** Parse row index from a field path like "gallery.2.image". */
const rowIndexFromPath = (path: string | undefined): number | null => {
  if (!path) return null
  const m = /^gallery\.(\d+)\.image$/.exec(path)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : null
}

const GalleryCardOverlay: React.FC<Props> = (props) => {
  const path = props.path
  const idx = rowIndexFromPath(path)

  const { dispatchFields, setModified } = useForm()
  const [fields] = useAllFormFields()

  const rowCount = useMemo(() => {
    const v = fields?.[GALLERY_PATH]?.value
    if (typeof v === 'number') return v
    const rows = fields?.[GALLERY_PATH]?.rows
    return Array.isArray(rows) ? rows.length : 0
  }, [fields])

  if (idx === null) return null

  const isFirst = idx === 0
  const isLast = idx === rowCount - 1

  const modify = () => {
    if (typeof setModified === 'function') setModified(true)
  }

  const move = (delta: -1 | 1) => {
    const to = idx + delta
    if (to < 0 || to >= rowCount) return
    dispatchFields({
      type: 'MOVE_ROW',
      path: GALLERY_PATH,
      moveFromIndex: idx,
      moveToIndex: to,
    })
    modify()
  }

  const remove = () => {
    if (!window.confirm('Remove this photo from the gallery?')) return
    dispatchFields({
      type: 'REMOVE_ROW',
      path: GALLERY_PATH,
      rowIndex: idx,
    })
    modify()
  }

  return (
    <div className="dnj-card-overlay" aria-hidden={false}>
      <span className="dnj-card-overlay__badge" aria-label={`Photo ${idx + 1} of ${rowCount}`}>
        {idx + 1}
      </span>

      <button
        type="button"
        className="dnj-card-overlay__btn dnj-card-overlay__btn--delete"
        title="Remove this photo"
        aria-label="Remove this photo"
        onClick={remove}
      >
        {/* trash icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>

      <button
        type="button"
        className="dnj-card-overlay__btn dnj-card-overlay__btn--prev"
        title="Move left"
        aria-label="Move photo left"
        onClick={() => move(-1)}
        disabled={isFirst}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        type="button"
        className="dnj-card-overlay__btn dnj-card-overlay__btn--next"
        title="Move right"
        aria-label="Move photo right"
        onClick={() => move(1)}
        disabled={isLast}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

export default GalleryCardOverlay
