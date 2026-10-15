'use client'
import React from 'react'
import type { DefaultCellComponentProps } from 'payload'
import { useListDrawerContext } from '@payloadcms/ui'

/**
 * Phase 4.59 — dedicated cell untuk column `thumbnail` (UI field) di Media
 * collection. Render `<img>` langsung dari `rowData.thumbnailURL` (fallback
 * `rowData.url`) — TANPA melewati Payload's stateful `<Thumbnail>` component
 * yang bermasalah dgn lifecycle hydration race (fileExists stuck `undefined`).
 *
 * Cell ini bertindak sebagai first-class column, ditambahkan di
 * `defaultColumns` paling depan. Tidak bergantung pada visibility kolom
 * `filename` — user boleh hide `filename` tanpa merusak tampilan thumbnail.
 *
 * Phase 4.59 addendum (2026-09-22) — click-through: karena ini custom Cell,
 * Payload's DefaultCell auto-wrap `<Link>` TIDAK berlaku. Kita render `<a>`
 * sendiri dgn href dari `linkURL`/fallback. Klik thumbnail → edit view.
 *
 * Phase 4.60.2 (2026-09-25) — drawer-aware selection. Kolom thumbnail adalah
 * "linked column" (paling depan). Untuk custom Cell, Payload's
 * `RenderDefaultCell` (yg biasanya membungkus linked cell dgn
 * `<button onClick={onSelect}>` di dalam ListDrawer) TIDAK dipakai — jadi di
 * picker "Choose from existing" klik thumbnail justru NAVIGASI ke edit view,
 * bukan memilih gambar. Fix: baca `useListDrawerContext()`. Kalau di dalam
 * drawer (`isInDrawer`), render `<button>` yg memanggil `onSelect` → set value
 * + tutup drawer. Di luar drawer, tetap `<a>` ke edit view (perilaku list lama).
 *
 * Client Component: butuh `useListDrawerContext` (hook) untuk deteksi drawer.
 * Di luar drawer context defaultnya `{}` (aman, `isInDrawer`/`onSelect` undefined).
 */
type MediaRow = {
  id?: number | string
  url?: string
  thumbnailURL?: string
  mimeType?: string
  alt?: string
  filename?: string
}

const MediaThumbnailCell: React.FC<DefaultCellComponentProps> = ({
  rowData,
  linkURL,
  collectionSlug,
}) => {
  const row = rowData as MediaRow | undefined
  const src = row?.thumbnailURL || row?.url
  const mimeType = typeof row?.mimeType === 'string' ? row.mimeType : ''
  const isImage = mimeType.startsWith('image/')
  const isVideo = mimeType.startsWith('video/')
  const alt = row?.alt || row?.filename || 'thumbnail'

  const { isInDrawer, onSelect } = useListDrawerContext() as {
    isInDrawer?: boolean
    onSelect?: (args: { collectionSlug?: string; doc: unknown; docID?: number | string }) => void
  }

  const content = (
    <>
      {src && isImage ? (
        <img className="dnj-media-thumb__img" src={src} alt={alt} loading="lazy" decoding="async" />
      ) : isVideo ? (
        // Video (e.g. video/mp4) has no generated image thumbnail — show a
        // recognizable play-badge so image + video read consistently in the
        // picker/grid (Phase 4.60.2). If the media is a poster image it takes
        // the isImage branch above instead.
        <svg
          className="dnj-media-thumb__icon dnj-media-thumb__icon--video"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M10 9.2v5.6l4.8-2.8-4.8-2.8Z" fill="currentColor" stroke="none" />
        </svg>
      ) : src ? (
        <svg
          className="dnj-media-thumb__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        </svg>
      ) : null}
    </>
  )

  // Inside a ListDrawer picker ("Choose from existing"): clicking the thumbnail
  // must SELECT the media (set value + close drawer), never navigate to edit.
  if (isInDrawer && typeof onSelect === 'function') {
    return (
      <button
        type="button"
        className="dnj-media-thumb dnj-media-thumb--select"
        aria-label={`Select ${alt}`}
        aria-hidden={src ? 'false' : 'true'}
        onClick={() => onSelect({ collectionSlug, doc: rowData, docID: row?.id })}
      >
        {content}
      </button>
    )
  }

  // Normal list view — wrap in anchor kalau ada href: klik thumbnail → edit view.
  const href =
    linkURL ||
    (collectionSlug && row?.id != null
      ? `/admin/collections/${collectionSlug}/${encodeURIComponent(String(row.id))}`
      : undefined)

  if (href) {
    return (
      <a
        href={href}
        className="dnj-media-thumb dnj-media-thumb--link"
        aria-label={`Edit ${alt}`}
        aria-hidden={src ? 'false' : 'true'}
      >
        {content}
      </a>
    )
  }
  return (
    <div className="dnj-media-thumb" aria-hidden={src ? 'false' : 'true'}>
      {content}
    </div>
  )
}

export default MediaThumbnailCell
