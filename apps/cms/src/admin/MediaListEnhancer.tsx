'use client'
/**
 * DnJourneysBali — Media Library toolbar (Phase 4.11 · revised).
 *
 * Mounted globally via `admin.components.providers`. Self-hides on every
 * route except `/admin/collections/media`. On that route it portals a
 * toolbar into Payload's `.list-controls` with:
 *
 *   1. Group By dropdown — Name / Date Modified / Type / Size.
 *      Writes `?sort=<field>` (asc) / `?sort=-<field>` (desc) to the URL
 *      via Next.js router → Payload re-fetches with the new sort.
 *   2. Sort direction toggle — flips the `-` prefix.
 *   3. View size selector — Detail / S / M / L. Detail keeps Payload's
 *      table; S/M/L transform the same table into a card grid via CSS.
 *      Persisted to localStorage.
 *
 * Payload's own Group By / Sort / Where / Columns toggles are hidden by
 * CSS (`media-list.css`) on this route — the custom toolbar covers the
 * cases we care about, and native ones would clutter the UI.
 *
 * Performance: uses `usePathname` for route detection (no polling).
 * `createPortal` re-renders when its container detaches (SPA nav) via a
 * shallow MutationObserver on <body>.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Mode = 'detail' | 's' | 'm' | 'l'
type SortField = 'filename' | 'updatedAt' | 'mimeType' | 'filesize'

const MODES: Array<{ key: Mode; label: string; title: string }> = [
  { key: 'detail', label: 'Detail', title: 'Table view (default)' },
  { key: 's',      label: 'S',      title: 'Small thumbnails' },
  { key: 'm',      label: 'M',      title: 'Medium thumbnails' },
  { key: 'l',      label: 'L',      title: 'Large thumbnails' },
]

const GROUPS: Array<{ field: SortField; label: string; ascHint: string; descHint: string }> = [
  { field: 'filename',  label: 'Name',          ascHint: 'A → Z',          descHint: 'Z → A' },
  { field: 'updatedAt', label: 'Date Modified', ascHint: 'Oldest first',   descHint: 'Newest first' },
  { field: 'mimeType',  label: 'Type',          ascHint: 'A → Z',          descHint: 'Z → A' },
  { field: 'filesize',  label: 'Size',          ascHint: 'Smallest first', descHint: 'Largest first' },
]

const STORAGE_KEY = 'dnj-media-view-mode'
const ATTR = 'data-view-mode'

const MEDIA_LIST_RE = /^\/admin\/collections\/media\/?$/

const readMode = (): Mode => {
  try {
    const s = localStorage.getItem(STORAGE_KEY) as Mode | null
    if (s && MODES.some((m) => m.key === s)) return s
  } catch { /* noop */ }
  return 'detail'
}

const Toolbar: React.FC = () => {
  const router = useRouter()
  const params = useSearchParams()

  const currentSort = params?.get('sort') ?? '-updatedAt'
  const isDesc = currentSort.startsWith('-')
  const sortField = (isDesc ? currentSort.slice(1) : currentSort) as SortField
  const known = GROUPS.some((g) => g.field === sortField) ? sortField : 'updatedAt'
  const activeGroup = GROUPS.find((g) => g.field === known) ?? GROUPS[1]

  const [mode, setMode] = useState<Mode>('detail')
  useEffect(() => {
    const m = readMode()
    setMode(m)
    document.body.setAttribute(ATTR, m)
    // Phase 4.59 (v6 - definitif) — audit findings:
    //
    // Payload list view server (@payloadcms/next views/List/index.js L70)
    // UPSERTS preferences on every request with columns from URL. On next
    // request, prefs.columns override defaults. Just stripping URL params
    // is NOT enough — Payload re-writes URL from prefs.
    //
    // Fix: (a) DELETE server-side preference record for `collection-media`
    // via REST API; (b) rewrite URL `columns` to include `thumbnail`
    // explicitly + strip disabled sub-field entries. This forces Payload's
    // isColumnActive to return true for thumbnail on next render.
    ;(async () => {
      const cols = params?.get('columns') ?? ''
      const needsFix = !cols || !/"thumbnail"/.test(cols)
      if (!needsFix) return
      // eslint-disable-next-line no-console
      console.info('[dnj-media] resetting stale prefs & URL columns (no thumbnail)')
      try {
        // Delete preference record. Endpoint: DELETE /api/payload-preferences/collection-media
        await fetch('/api/payload-preferences/collection-media', {
          method: 'DELETE',
          credentials: 'include',
        }).catch(() => {})
      } catch { /* ignore */ }
      // Push fresh URL with clean defaults — Payload will re-upsert prefs
      // from these clean columns on next request.
      const p = new URLSearchParams(params?.toString() ?? '')
      const freshCols = ['thumbnail', 'filename', 'alt', 'updatedAt']
      p.set('columns', JSON.stringify(freshCols))
      router.replace(`?${p.toString()}`, { scroll: false })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pushSort = (nextField: SortField, nextDesc: boolean) => {
    const p = new URLSearchParams(params?.toString() ?? '')
    p.set('sort', nextDesc ? `-${nextField}` : nextField)
    // Reset to page 1 whenever the sort changes.
    p.delete('page')
    router.push(`?${p.toString()}`, { scroll: false })
  }

  const chooseGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    pushSort(e.target.value as SortField, isDesc)
  }
  const flipDirection = () => {
    pushSort(known, !isDesc)
  }
  const chooseMode = (m: Mode) => {
    setMode(m)
    document.body.setAttribute(ATTR, m)
    try { localStorage.setItem(STORAGE_KEY, m) } catch { /* noop */ }

    // Phase 4.59 (final v4) — grid mode butuh `.cell-thumbnail` in DOM.
    // Reset `columns` param kalau `thumbnail` tak included / hidden.
    if (m !== 'detail') {
      const cols = params?.get('columns') ?? ''
      const hasThumbHidden = /"-thumbnail"/.test(cols) || (cols && !/"thumbnail"/.test(cols))
      if (hasThumbHidden) {
        const p = new URLSearchParams(params?.toString() ?? '')
        p.delete('columns')
        router.push(`?${p.toString()}`, { scroll: false })
      }
    }
  }

  return (
    <div className="dnj-media-toolbar" role="group" aria-label="Media library controls">
      <div className="dnj-media-toolbar__section">
        <label className="dnj-media-toolbar__label" htmlFor="dnj-media-groupby">Group by</label>
        <select
          id="dnj-media-groupby"
          className="dnj-media-toolbar__select"
          value={known}
          onChange={chooseGroup}
        >
          {GROUPS.map((g) => (
            <option key={g.field} value={g.field}>{g.label}</option>
          ))}
        </select>
        <button
          type="button"
          className="dnj-media-toolbar__dir"
          onClick={flipDirection}
          title={isDesc ? activeGroup.descHint : activeGroup.ascHint}
          aria-label={`Sort direction: ${isDesc ? 'descending' : 'ascending'}`}
        >
          {isDesc ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          )}
        </button>
      </div>

      <div className="dnj-media-toolbar__section dnj-media-toolbar__section--view">
        <span className="dnj-media-toolbar__label">View</span>
        <div className="dnj-media-toolbar__viewgroup">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`dnj-media-toolbar__viewbtn${mode === m.key ? ' dnj-media-toolbar__viewbtn--active' : ''}`}
              title={m.title}
              aria-pressed={mode === m.key}
              onClick={() => chooseMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const MediaListEnhancer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const isMedia = useMemo(() => MEDIA_LIST_RE.test(pathname ?? ''), [pathname])

  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!isMedia) {
      setContainer(null)
      document.body.removeAttribute(ATTR)
      return
    }

    // Phase 4.59 (final v4) — thumbnail rendering pindah ke custom Cell
    // component `MediaThumbnailCell.tsx` (registered pada UI field
    // `thumbnail` di Media collection). Cell render `<img>` langsung dari
    // rowData.thumbnailURL — zero lifecycle state, zero API fetch.
    // Enhancer sekarang cuma:
    //   1. Portal toolbar (Group by + View mode)
    //   2. Set `body[data-view-mode]` attribute untuk CSS grid transform
    //   3. Locate `.list-controls` container untuk portal target
    const findContainer = () => {
      const el = document.querySelector<HTMLElement>('.list-controls')
      setContainer((prev) => (prev === el ? prev : el))
    }
    findContainer()
    let raf = 0
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        findContainer()
      })
    }
    const obs = new MutationObserver(schedule)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      obs.disconnect()
      if (raf) cancelAnimationFrame(raf)
      document.body.removeAttribute(ATTR)
    }
  }, [isMedia])

  return (
    <>
      {children}
      {isMedia && container ? createPortal(<Toolbar />, container) : null}
    </>
  )
}

export default MediaListEnhancer
