'use client'
/**
 * DnJourneysBali — User avatar list cell (Phase 4.14 · Track A).
 *
 * Reads `rowData.avatar` (populated media doc when depth >= 1) and
 * renders a small circular thumbnail. Falls back to initials from
 * `rowData.name` / `rowData.email` — same visual as SidebarFooter's
 * avatar chip so both surfaces feel consistent.
 *
 * Phase 4.59 audit fix (2026-09-23) — click-to-edit regression: this cell
 * is the FIRST column in `defaultColumns`, so Payload treats it as the
 * "linked column" and passes `link`/`linkURL` props for us to wrap in an
 * anchor. The original version ignored those props and rendered a plain
 * `<span>` — which meant NO cell in the row got a link, since only the
 * first active column receives link treatment (verified same root cause
 * as the Media thumbnail bug, phase-4.59). Result: clicking anywhere on a
 * Users list row did nothing; you had to navigate to `/admin/collections/
 * users/<id>` by hand. Fixed by rendering an `<a href>` here, same pattern
 * as `MediaThumbnailCell.tsx`.
 */
import React from 'react'
import type { DefaultServerCellComponentProps } from 'payload'

type Row = {
  id?: number | string
  avatar?: { url?: string | null; thumbnailURL?: string | null } | string | null
  name?: string | null
  email?: string | null
}

const initialsFor = (row?: Row): string => {
  const src = (row?.name || row?.email || 'U').toString().trim()
  return src
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}

const urlFor = (row?: Row): string | null => {
  const a = row?.avatar
  if (!a || typeof a === 'string') return null
  return a.thumbnailURL || a.url || null
}

const UserAvatarCell: React.FC<DefaultServerCellComponentProps> = ({ rowData, linkURL, collectionSlug }) => {
  const row = rowData as Row | undefined
  const url = urlFor(row)
  const href = linkURL
    || (collectionSlug && row?.id != null ? `/admin/collections/${collectionSlug}/${encodeURIComponent(String(row.id))}` : undefined)

  const content = url ? (
    <img className="dnj-user-avatar-cell__img" src={url} alt="" />
  ) : (
    <span className="dnj-user-avatar-cell__initials">{initialsFor(row)}</span>
  )

  if (href) {
    return (
      <a href={href} className="dnj-user-avatar-cell dnj-user-avatar-cell--link" aria-label={`Edit ${row?.name || row?.email || 'user'}`}>
        {content}
      </a>
    )
  }
  return (
    <span className="dnj-user-avatar-cell" aria-hidden={url ? undefined : 'true'}>
      {content}
    </span>
  )
}

export default UserAvatarCell
