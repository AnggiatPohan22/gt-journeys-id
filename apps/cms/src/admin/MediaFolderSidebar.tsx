'use client'
/**
 * DnJourneysBali — Media Library folder sidebar (Phase 4.61).
 *
 * FileBird-style two-pane layout for the flat media list route
 * (`/admin/collections/media`). Registered as a global provider; it
 * self-hides everywhere else. On the media list it:
 *
 *   1. Sets `body[data-media-filebird]` → `media-list.css` reflows
 *      `.collection-list__wrap` into a 2-column grid (sidebar | native list).
 *   2. Portals this folder panel into `.collection-list__wrap`.
 *
 * The panel REUSES Payload's native list for the grid, pagination, search,
 * selection and upload — it only drives the `?where[folder]` query so the
 * native list filters by folder. This keeps all Payload behavior intact.
 *
 * Data:
 *   - Folders: GET /api/payload-folders (built the tree from `folder` parent).
 *   - Counts:  GET /api/media?limit=1&depth=0&where[folder][equals]=<id>
 *              (reads `totalDocs`; limit=1 because Payload's limit=0 = unlimited).
 *
 * Scope (per product decision): navigation + working "New Folder" + counts +
 * client conveniences (filter, sort A-Z, collapse, refresh). Rename/Delete
 * link to Payload's native folder view for full management.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { disabledModuleFolderNames } from '../config/mediaFolders'

const MEDIA_LIST_RE = /^\/admin\/collections\/media\/?$/
const BODY_ATTR = 'data-media-filebird'
const FOLDERS_API = '/api/payload-folders'
const MEDIA_API = '/api/media'
const COLLAPSE_KEY = 'dnj-media-folder-collapsed'

type FolderDoc = {
  id: number | string
  name: string
  folder?: number | string | { id: number | string } | null
}

type FolderNode = FolderDoc & { children: FolderNode[]; depth: number }

const parentId = (f: FolderDoc): number | string | null => {
  const p = f.folder
  if (p == null) return null
  if (typeof p === 'object') return p.id ?? null
  return p
}

/** Icon helper — inline SVG (no icon-font dep, inherits currentColor). */
const Icon: React.FC<{ path: string; size?: number }> = ({ path, size = 16 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
)
// Feather-style path data.
const P = {
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  folderOff: 'M3 3l18 18M9 3l2 3h9a2 2 0 0 1 2 2v9M2 7v12a2 2 0 0 0 2 2h14',
  layers: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  plus: 'M12 5v14M5 12h14',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  az: 'M3 5h6M3 12h4M3 19h2M14 5l4 8h-8zM16 17v4M14 19h4',
  collapse: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5z',
  chevron: 'M6 9l6 6 6-6',
}

const Sidebar: React.FC = () => {
  const router = useRouter()
  const params = useSearchParams()
  const pathname = usePathname()

  const [folders, setFolders] = useState<FolderDoc[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [allCount, setAllCount] = useState<number | null>(null)
  const [uncatCount, setUncatCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [disabledNames, setDisabledNames] = useState<string[]>([])
  const reqIdRef = useRef(0)

  // Active folder from the current URL `where`.
  //
  // NOTE: read via params.forEach (keys are DECODED) — never via
  // params.toString(), which percent-encodes `[`/`]` so a `where[folder]...`
  // regex would never match and All Files would look active forever (the
  // "active stuck on All Files" bug). Also tolerant of Payload nesting the
  // clause (e.g. where[and][0][folder][equals]) by matching the key suffix.
  const active: 'all' | 'uncategorized' | string = useMemo(() => {
    if (!params) return 'all'
    let equalsVal: string | null = null
    let existsFalse = false
    params.forEach((value, key) => {
      if (key.endsWith('[folder][equals]')) equalsVal = value
      if (key.endsWith('[folder][exists]') && value === 'false') existsFalse = true
    })
    if (equalsVal != null) return equalsVal
    if (existsFalse) return 'uncategorized'
    return 'all'
  }, [params])

  const fetchAll = useCallback(async () => {
    const rid = ++reqIdRef.current
    setLoading(true)
    try {
      // Folders + SiteFeatures module toggles in parallel.
      const [res, featRes] = await Promise.all([
        fetch(`${FOLDERS_API}?limit=1000&depth=0&sort=name`, { credentials: 'include' }),
        fetch('/api/globals/site-features?depth=0', { credentials: 'include' }).catch(() => null),
      ])
      const data = await res.json().catch(() => ({ docs: [] }))
      const docs: FolderDoc[] = Array.isArray(data?.docs) ? data.docs : []
      let disabled: string[] = []
      try {
        const feat = featRes ? await featRes.json() : null
        disabled = disabledModuleFolderNames(feat?.modules)
      } catch { /* noop */ }
      if (rid !== reqIdRef.current) return
      setFolders(docs)
      setDisabledNames(disabled)

      // Counts — parallel, each reads totalDocs (limit=1, not 0).
      const countOne = async (qs: string): Promise<number> => {
        try {
          const r = await fetch(`${MEDIA_API}?limit=1&depth=0&${qs}`, { credentials: 'include' })
          const j = await r.json()
          return typeof j?.totalDocs === 'number' ? j.totalDocs : 0
        } catch { return 0 }
      }
      const [all, uncat, perFolder] = await Promise.all([
        countOne(''),
        countOne('where[folder][exists]=false'),
        Promise.all(
          docs.map(async (f) => [String(f.id), await countOne(`where[folder][equals]=${f.id}`)] as const),
        ),
      ])
      if (rid !== reqIdRef.current) return
      setAllCount(all)
      setUncatCount(uncat)
      setCounts(Object.fromEntries(perFolder))
    } finally {
      if (rid === reqIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1') } catch { /* noop */ }
  }, [fetchAll])

  // Build tree (roots + nested children). Disabled-module root folders (and
  // their whole subtree) are excluded so a turned-off service disappears
  // entirely from the library.
  const tree = useMemo<FolderNode[]>(() => {
    const hidden = new Set(disabledNames)
    const byId = new Map<string, FolderNode>()
    folders.forEach((f) => byId.set(String(f.id), { ...f, children: [], depth: 0 }))
    const roots: FolderNode[] = []
    byId.forEach((node) => {
      const pid = parentId(node)
      const parent = pid != null ? byId.get(String(pid)) : null
      if (parent) parent.children.push(node)
      else roots.push(node)
    })
    const visibleRoots = roots.filter((r) => !hidden.has(r.name))
    const sortRec = (nodes: FolderNode[], depth: number) => {
      nodes.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
      nodes.forEach((n) => { n.depth = depth; sortRec(n.children, depth + 1) })
    }
    sortRec(visibleRoots, 0)
    return visibleRoots
  }, [folders, sortAsc, disabledNames])

  const flatFiltered = useMemo<FolderNode[]>(() => {
    const out: FolderNode[] = []
    const walk = (nodes: FolderNode[]) => {
      nodes.forEach((n) => {
        const match = !filter || n.name.toLowerCase().includes(filter.toLowerCase())
        if (match) out.push(n)
        walk(n.children)
      })
    }
    walk(tree)
    return out
  }, [tree, filter])

  /** Navigate the native list by rewriting the folder `where` clause. */
  const goto = useCallback((target: 'all' | 'uncategorized' | string) => {
    const p = new URLSearchParams(params?.toString() ?? '')
    // Strip any existing folder where + reset page.
    Array.from(p.keys()).forEach((k) => {
      if (k.startsWith('where[folder]')) p.delete(k)
    })
    p.delete('page')
    if (target === 'uncategorized') p.set('where[folder][exists]', 'false')
    else if (target !== 'all') p.set('where[folder][equals]', String(target))
    const qs = p.toString()
    router.push(qs ? `${pathname}?${qs}` : (pathname ?? ''), { scroll: false })
  }, [params, pathname, router])

  const currentParentForNew = active !== 'all' && active !== 'uncategorized' ? active : null

  const createFolder = useCallback(async () => {
    const name = window.prompt('Folder name:')?.trim()
    if (!name) return
    setBusy(true)
    try {
      await fetch(FOLDERS_API, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, folderType: ['media'], folder: currentParentForNew }),
      })
      await fetchAll()
    } finally {
      setBusy(false)
    }
  }, [currentParentForNew, fetchAll])

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c
      try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0') } catch { /* noop */ }
      return next
    })
  }

  // Rename / Delete operate on the currently selected folder (the one the
  // grid is filtered to). Disabled for All Files / Uncategorized.
  const activeIsFolder = active !== 'all' && active !== 'uncategorized'
  const activeFolderName = useMemo(
    () => (activeIsFolder ? folders.find((f) => String(f.id) === active)?.name ?? null : null),
    [activeIsFolder, folders, active],
  )

  const renameFolder = useCallback(async () => {
    if (!activeIsFolder) return
    const current = activeFolderName ?? ''
    const name = window.prompt('Rename folder:', current)?.trim()
    if (!name || name === current) return
    setBusy(true)
    try {
      await fetch(`${FOLDERS_API}/${active}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      await fetchAll()
    } finally {
      setBusy(false)
    }
  }, [active, activeIsFolder, activeFolderName, fetchAll])

  const deleteFolder = useCallback(async () => {
    if (!activeIsFolder) return
    const nm = activeFolderName ?? 'this folder'
    if (!window.confirm(`Delete folder "${nm}"?\nImages inside will move to Uncategorized.`)) return
    setBusy(true)
    try {
      await fetch(`${FOLDERS_API}/${active}`, { method: 'DELETE', credentials: 'include' })
      goto('all')
      await fetchAll()
    } finally {
      setBusy(false)
    }
  }, [active, activeIsFolder, activeFolderName, goto, fetchAll])

  const badge = (n: number | null) => (
    <span className="dnj-fb__count">{n == null ? '·' : n}</span>
  )

  return (
    <aside className="dnj-fb" aria-label="Media folders">
      {/* Header */}
      <div className="dnj-fb__head">
        <div className="dnj-fb__brand">
          <span className="dnj-fb__brand-icon"><Icon path={P.folder} size={18} /></span>
          <span className="dnj-fb__brand-text">Folders</span>
        </div>
        <button type="button" className="dnj-fb__new" onClick={createFolder} disabled={busy}>
          <Icon path={P.plus} size={14} /> New Folder
        </button>
      </div>

      {/* Action toolbar */}
      <div className="dnj-fb__actions">
        <button
          type="button"
          className="dnj-fb__act"
          title={activeIsFolder ? `Rename "${activeFolderName}"` : 'Select a folder to rename'}
          onClick={renameFolder}
          disabled={!activeIsFolder || busy}
        >
          <Icon path={P.edit} />
        </button>
        <button
          type="button"
          className="dnj-fb__act dnj-fb__act--danger"
          title={activeIsFolder ? `Delete "${activeFolderName}"` : 'Select a folder to delete'}
          onClick={deleteFolder}
          disabled={!activeIsFolder || busy}
        >
          <Icon path={P.trash} />
        </button>
        <button type="button" className={`dnj-fb__act${!sortAsc ? ' dnj-fb__act--on' : ''}`} title="Sort A–Z / Z–A" onClick={() => setSortAsc((s) => !s)}>
          <Icon path={P.az} />
        </button>
        <button type="button" className={`dnj-fb__act${collapsed ? ' dnj-fb__act--on' : ''}`} title="Collapse subfolders" onClick={toggleCollapse}>
          <Icon path={P.collapse} />
        </button>
        <button type="button" className="dnj-fb__act dnj-fb__act--end" title="Refresh" onClick={fetchAll} disabled={loading}>
          <Icon path={P.refresh} />
        </button>
      </div>

      {/* Filter */}
      <div className="dnj-fb__filter">
        <span className="dnj-fb__filter-icon"><Icon path={P.filter} size={15} /></span>
        <input
          type="text"
          className="dnj-fb__filter-input"
          placeholder="Filter folder name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Folder list */}
      <nav className="dnj-fb__list">
        <button
          type="button"
          className={`dnj-fb__item dnj-fb__item--root${active === 'all' ? ' dnj-fb__item--active' : ''}`}
          onClick={() => goto('all')}
        >
          <span className="dnj-fb__item-label"><Icon path={P.layers} size={18} /> All Files</span>
          {badge(allCount)}
        </button>
        <button
          type="button"
          className={`dnj-fb__item${active === 'uncategorized' ? ' dnj-fb__item--active' : ''}`}
          onClick={() => goto('uncategorized')}
        >
          <span className="dnj-fb__item-label"><Icon path={P.folderOff} size={18} /> Uncategorized</span>
          {badge(uncatCount)}
        </button>

        <div className="dnj-fb__section">
          <span>Directories</span>
          <Icon path={P.chevron} size={14} />
        </div>

        {flatFiltered.length === 0 && !loading ? (
          <div className="dnj-fb__empty">No folders{filter ? ' match' : ''}.</div>
        ) : null}

        {flatFiltered.map((n) => {
          if (collapsed && n.depth > 0) return null
          return (
            <button
              key={String(n.id)}
              type="button"
              className={`dnj-fb__item${active === String(n.id) ? ' dnj-fb__item--active' : ''}`}
              style={{ paddingLeft: `${10 + n.depth * 14}px` }}
              onClick={() => goto(String(n.id))}
              title={n.name}
            >
              <span className="dnj-fb__item-label">
                <span className="dnj-fb__folder-ico"><Icon path={P.folder} size={16} /></span>
                <span className="dnj-fb__item-name">{n.name}</span>
              </span>
              {badge(counts[String(n.id)] ?? null)}
            </button>
          )
        })}
      </nav>

      <div className="dnj-fb__foot">
        <span className="dnj-fb__foot-badge">
          <Icon path={P.folder} size={13} /> {folders.length} folders
        </span>
      </div>
    </aside>
  )
}

const MediaFolderSidebar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const isMedia = useMemo(() => MEDIA_LIST_RE.test(pathname ?? ''), [pathname])
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!isMedia) {
      setContainer(null)
      document.body.removeAttribute(BODY_ATTR)
      return
    }
    document.body.setAttribute(BODY_ATTR, '')
    const find = () => {
      const el = document.querySelector<HTMLElement>('.collection-list__wrap')
      setContainer((prev) => (prev === el ? prev : el))
    }
    find()
    let raf = 0
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; find() })
    }
    const obs = new MutationObserver(schedule)
    obs.observe(document.body, { childList: true, subtree: true })
    return () => {
      obs.disconnect()
      if (raf) cancelAnimationFrame(raf)
      document.body.removeAttribute(BODY_ATTR)
    }
  }, [isMedia])

  return (
    <>
      {children}
      {isMedia && container ? createPortal(<Sidebar />, container) : null}
    </>
  )
}

export default MediaFolderSidebar
