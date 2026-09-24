'use client'
/**
 * DnJourneysBali — Media Library toolbar (Phase 4.11 · revised 4.60).
 *
 * Mounted globally via `admin.components.providers`. Self-hides on every
 * route except the media library. It enhances TWO surfaces:
 *
 * A) FLAT LIST — `/admin/collections/media`
 *    Portals a toolbar into Payload's `.list-controls`:
 *      1. Group By dropdown (Name / Date / Type / Size) → `?sort=`.
 *      2. Sort direction toggle.
 *      3. View size selector — Detail / S / M / L. Detail keeps Payload's
 *         table; S/M/L transform the table into a card grid via CSS
 *         (`body[data-view-mode]`). Persisted to localStorage.
 *
 * B) FOLDER VIEW (Phase 4.60) — `/admin/browse-by-folder` and
 *    `/admin/collections/media/payload-folders`
 *    Payload's native folder view already renders the folder structure,
 *    a Sort pill and a grid/list toggle. We add the ONE thing it lacks:
 *    card DENSITY. Portals a Detail / S / M / L segmented control into
 *    `.search-bar__actions` (next to the native pills):
 *      - Detail → clicks Payload's native "list" toggle (table view).
 *      - S/M/L  → ensures grid view, then sizes `.item-card-grid` cards
 *        via CSS (`body[data-folder-density]`). Persisted to localStorage.
 *
 * Performance: `usePathname` for route detection (no polling). Portal
 * containers are (re)located via a shallow MutationObserver on <body>
 * to survive SPA navigation.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Mode = 'detail' | 's' | 'm' | 'l'
type SortField = 'filename' | 'updatedAt' | 'mimeType' | 'filesize'

const MODES: Array<{ key: Mode; label: string; title: string }> = [
  { key: 'detail', label: 'Detail', title: 'Table view — 10 per page' },
  { key: 's',      label: 'S',      title: 'Small — 6 × 4 = 24 per page' },
  { key: 'm',      label: 'M',      title: 'Medium — 4 × 3 = 12 per page' },
  { key: 'l',      label: 'L',      title: 'Large — 2 × 2 = 4 per page' },
]

// Phase 4.61 — fixed page size per view so the grid stays a few rows tall
// (no long vertical scroll). Column counts live in media-list.css and are
// paired with these limits: S 6×4, M 4×3, L 2×2, Detail = 10 rows.
const LIMITS: Record<Mode, number> = { detail: 10, s: 24, m: 12, l: 4 }

const GROUPS: Array<{ field: SortField; label: string; ascHint: string; descHint: string }> = [
  { field: 'filename',  label: 'Name',          ascHint: 'A → Z',          descHint: 'Z → A' },
  { field: 'updatedAt', label: 'Date Modified', ascHint: 'Oldest first',   descHint: 'Newest first' },
  { field: 'mimeType',  label: 'Type',          ascHint: 'A → Z',          descHint: 'Z → A' },
  { field: 'filesize',  label: 'Size',          ascHint: 'Smallest first', descHint: 'Largest first' },
]

const STORAGE_KEY = 'dnj-media-view-mode'
const ATTR = 'data-view-mode'

// Phase 4.60 — folder view density.
const FOLDER_STORAGE_KEY = 'dnj-media-folder-density'
const FOLDER_ATTR = 'data-folder-density'

const MEDIA_LIST_RE = /^\/admin\/collections\/media\/?$/
// Payload's per-collection folder view lives at /collections/media/<foldersSlug>
// where foldersSlug defaults to `payload-folders` (NOT `folders`).
const FOLDER_ROUTE_RE = /^\/admin\/(browse-by-folder|collections\/media\/payload-folders)\/?$/
// Media edit/create form: /collections/media/<id> or /create (Phase 4.60.1).
// Excludes the list and the payload-folders view.
const MEDIA_EDIT_RE = /^\/admin\/collections\/media\/(?!payload-folders$)[^/]+\/?$/
const EDIT_ATTR = 'data-media-edit'

const readMode = (): Mode => {
  try {
    const s = localStorage.getItem(STORAGE_KEY) as Mode | null
    if (s && MODES.some((m) => m.key === s)) return s
  } catch { /* noop */ }
  // Phase 4.61 — default to a medium card grid to match the FileBird-style
  // two-pane layout (folder sidebar + asset grid). Users can still pick Detail.
  return 'm'
}

const readFolderMode = (): Mode => {
  try {
    const s = localStorage.getItem(FOLDER_STORAGE_KEY) as Mode | null
    if (s && MODES.some((m) => m.key === s)) return s
  } catch { /* noop */ }
  return 'm'
}

/* ══════════════════════════════════════════════════════════════════
   A) FLAT LIST toolbar
   ══════════════════════════════════════════════════════════════════ */
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
      const p = new URLSearchParams(params?.toString() ?? '')
      let changed = false

      // (a) Ensure the thumbnail column is present (see Phase 4.59 note above).
      const cols = p.get('columns') ?? ''
      const needsColFix = !cols || !/"thumbnail"/.test(cols)
      if (needsColFix) {
        // eslint-disable-next-line no-console
        console.info('[dnj-media] resetting stale prefs & URL columns (no thumbnail)')
        try {
          await fetch('/api/payload-preferences/collection-media', {
            method: 'DELETE',
            credentials: 'include',
          }).catch(() => {})
        } catch { /* ignore */ }
        p.set('columns', JSON.stringify(['thumbnail', 'filename', 'alt', 'updatedAt']))
        changed = true
      }

      // (b) Ensure the page limit matches the active view (Phase 4.61).
      const wantLimit = String(LIMITS[m])
      if ((p.get('limit') ?? '') !== wantLimit) {
        p.set('limit', wantLimit)
        changed = true
      }

      if (changed) router.replace(`?${p.toString()}`, { scroll: false })
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

    const p = new URLSearchParams(params?.toString() ?? '')
    // Phase 4.61 — fixed page size per view (no long scroll), reset to page 1.
    p.set('limit', String(LIMITS[m]))
    p.delete('page')

    // Phase 4.59 (final v4) — grid mode butuh `.cell-thumbnail` in DOM.
    // Reset `columns` param kalau `thumbnail` tak included / hidden.
    if (m !== 'detail') {
      const cols = p.get('columns') ?? ''
      const hasThumbHidden = /"-thumbnail"/.test(cols) || (cols && !/"thumbnail"/.test(cols))
      if (hasThumbHidden) p.delete('columns')
    }
    router.push(`?${p.toString()}`, { scroll: false })
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

/* ══════════════════════════════════════════════════════════════════
   B) FOLDER VIEW density control (Phase 4.60)
   ══════════════════════════════════════════════════════════════════ */

/** Payload's native grid/list toggle buttons: [0]=grid, [1]=list. */
const nativeToggleButtons = (): HTMLButtonElement[] =>
  Array.from(
    document.querySelectorAll<HTMLButtonElement>('.folder-view-toggle-button'),
  )

/** True when Payload's native view is currently "list" (table). */
const isNativeListActive = (): boolean => {
  const btns = nativeToggleButtons()
  // The list button is the second one; active class = --active.
  return !!btns[1]?.classList.contains('folder-view-toggle-button--active')
}

const FolderControls: React.FC = () => {
  const [mode, setMode] = useState<Mode>('m')

  useEffect(() => {
    const m = readFolderMode()
    setMode(m)
    // Only apply density when in grid view. If Payload is in list/table
    // mode, density has no visual target — leave the attribute unset.
    if (m === 'detail' || isNativeListActive()) {
      document.body.removeAttribute(FOLDER_ATTR)
    } else {
      document.body.setAttribute(FOLDER_ATTR, m)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = (m: Mode) => {
    setMode(m)
    try { localStorage.setItem(FOLDER_STORAGE_KEY, m) } catch { /* noop */ }

    const btns = nativeToggleButtons()
    if (m === 'detail') {
      // Switch Payload to its native list/table view.
      document.body.removeAttribute(FOLDER_ATTR)
      if (!isNativeListActive()) btns[1]?.click()
    } else {
      // Ensure grid view is active, then apply card density.
      if (isNativeListActive()) btns[0]?.click()
      document.body.setAttribute(FOLDER_ATTR, m)
    }
  }

  return (
    <div className="dnj-folder-density" role="group" aria-label="Card size">
      <span className="dnj-folder-density__label">Size</span>
      <div className="dnj-folder-density__group">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`dnj-folder-density__btn${mode === m.key ? ' dnj-folder-density__btn--active' : ''}`}
            title={m.title}
            aria-pressed={mode === m.key}
            onClick={() => choose(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Mount orchestrator
   ══════════════════════════════════════════════════════════════════ */
const MediaListEnhancer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const isList = useMemo(() => MEDIA_LIST_RE.test(pathname ?? ''), [pathname])
  const isFolder = useMemo(() => FOLDER_ROUTE_RE.test(pathname ?? ''), [pathname])

  const isEdit = useMemo(() => MEDIA_EDIT_RE.test(pathname ?? ''), [pathname])
  const [listContainer, setListContainer] = useState<HTMLElement | null>(null)
  const [folderContainer, setFolderContainer] = useState<HTMLElement | null>(null)

  // Phase 4.60.1 — mark the media edit/create route so CSS can drop Payload's
  // viewport-filling form min-height (keeps the compact edit view scroll-free).
  useEffect(() => {
    if (isEdit) document.body.setAttribute(EDIT_ATTR, '')
    else document.body.removeAttribute(EDIT_ATTR)
    return () => document.body.removeAttribute(EDIT_ATTR)
  }, [isEdit])

  useEffect(() => {
    if (!isList && !isFolder) {
      setListContainer(null)
      setFolderContainer(null)
      document.body.removeAttribute(ATTR)
      document.body.removeAttribute(FOLDER_ATTR)
      return
    }

    const find = () => {
      if (isList) {
        const el = document.querySelector<HTMLElement>('.list-controls')
        setListContainer((prev) => (prev === el ? prev : el))
      }
      if (isFolder) {
        const el = document.querySelector<HTMLElement>('.search-bar__actions')
        setFolderContainer((prev) => (prev === el ? prev : el))
      }
    }
    find()
    let raf = 0
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        find()
      })
    }
    const obs = new MutationObserver(schedule)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      obs.disconnect()
      if (raf) cancelAnimationFrame(raf)
      if (!isList) document.body.removeAttribute(ATTR)
      if (!isFolder) document.body.removeAttribute(FOLDER_ATTR)
    }
  }, [isList, isFolder])

  return (
    <>
      {children}
      {isList && listContainer ? createPortal(<Toolbar />, listContainer) : null}
      {isFolder && folderContainer ? createPortal(<FolderControls />, folderContainer) : null}
    </>
  )
}

export default MediaListEnhancer
