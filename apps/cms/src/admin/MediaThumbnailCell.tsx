import React from 'react'
import type { DefaultServerCellComponentProps } from 'payload'

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
 * sendiri dgn href dari `linkURL` prop yg Payload kirim ke Cell yg jadi
 * "linked column" (kolom pertama di active columns). Klik thumbnail → edit.
 *
 * Server Component: static render, no state needed.
 */
const MediaThumbnailCell: React.FC<DefaultServerCellComponentProps> = ({ rowData, link, linkURL, collectionSlug }) => {
  const row = rowData as
    | {
        id?: number | string
        url?: string
        thumbnailURL?: string
        mimeType?: string
        alt?: string
        filename?: string
      }
    | undefined
  const src = row?.thumbnailURL || row?.url
  const isImage = typeof row?.mimeType === 'string' && row.mimeType.startsWith('image/')
  const alt = row?.alt || row?.filename || 'thumbnail'

  // Compute edit URL. Payload sends `linkURL` when this is the "linked" cell.
  // Fallback: build from collectionSlug + rowData.id (aman kalau linkURL kosong
  // karena kolom ini bukan primary linked column).
  const href = linkURL
    || (collectionSlug && row?.id != null ? `/admin/collections/${collectionSlug}/${encodeURIComponent(String(row.id))}` : undefined)

  const content = (
    <>
      {src && isImage ? (
        <img className="dnj-media-thumb__img" src={src} alt={alt} loading="lazy" decoding="async" />
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

  // Wrap in anchor kalau ada href — klik thumbnail langsung ke edit view.
  // Payload's DefaultCell juga wrap seluruh sel (including our cell) dgn `<Link>`
  // hanya untuk "linked column" (accessor pertama aktif). Untuk kolom
  // non-linked (mis. detail mode di posisi kedua), kita render <a> sendiri.
  if (href) {
    return (
      <a
        href={href}
        className="dnj-media-thumb dnj-media-thumb--link"
        aria-label={link ? undefined : `Edit ${alt}`}
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
