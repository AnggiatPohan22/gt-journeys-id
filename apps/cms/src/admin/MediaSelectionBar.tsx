'use client'
/**
 * DnJourneysBali — Media selection bar (Phase 4.61).
 *
 * Registered as Media's `admin.components.beforeListTable`, so it renders
 * INSIDE the list view's SelectionProvider and can drive selection state.
 *
 * Consolidates ALL selection UI in one place above the grid:
 *   {N} selected · Select all · Deselect all · Edit · Delete
 * The native header selection cluster (`.list-selection`) is hidden via CSS
 * on the media route so info isn't duplicated. Edit/Delete reuse Payload's
 * own EditMany/DeleteMany (they read the current selection from context, so
 * they only need the collection config).
 *
 * Shown only when something is selected. Deselect: `toggleAll()` (no arg)
 * reliably clears whenever count > 0 — a provider effect keeps `selectAll`
 * at some/allInPage/allAvailable while any row is selected, and in all those
 * states toggleAll(false) empties the map.
 */
import React from 'react'
import { DeleteMany, EditMany, useConfig, useSelection } from '@payloadcms/ui'

// SelectAllStatus enum isn't part of @payloadcms/ui's public exports; its
// value for "all across pages" is the string 'allAvailable'.
const ALL_AVAILABLE = 'allAvailable'

const MediaSelectionBar: React.FC = () => {
  const { count, totalDocs, selectAll, toggleAll } = useSelection()
  const { getEntityConfig } = useConfig()

  // Always render a fixed-height slot so the image grid never jumps when the
  // selection toggles. When nothing is selected the slot is just empty space
  // (a minimal gap between the filter and the grid); the framed bar only
  // paints in that same space once something is selected.
  if (!count) {
    return <div className="dnj-media-selbar-slot" aria-hidden="true" />
  }

  const collection = getEntityConfig({ collectionSlug: 'media' }) as any
  const allAcross = selectAll === ALL_AVAILABLE
  const canSelectAllAcross = !allAcross && count < totalDocs

  return (
    <div className="dnj-media-selbar-slot">
      <div className="dnj-media-selbar" role="status">
        <span className="dnj-media-selbar__count">
          <span className="dnj-media-selbar__dot" aria-hidden="true" />
          {count} selected{allAcross ? ` (all ${totalDocs})` : ''}
        </span>
        <div className="dnj-media-selbar__actions">
          {canSelectAllAcross ? (
            <button
              type="button"
              className="dnj-media-selbar__link"
              onClick={() => toggleAll(true)}
            >
              Select all {totalDocs}
            </button>
          ) : null}
          <button
            type="button"
            className="dnj-media-selbar__link dnj-media-selbar__link--muted"
            onClick={() => toggleAll()}
          >
            Deselect all
          </button>
          {collection ? (
            <span className="dnj-media-selbar__bulk">
              <EditMany collection={collection} />
              <DeleteMany collection={collection} />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default MediaSelectionBar
