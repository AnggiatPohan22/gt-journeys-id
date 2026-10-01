'use client'
/**
 * GtJourneysID — Sidebar tab bar (Phase 4.8, refined Phase 4.9).
 *
 * Registered as a `ui`-type field on the sidebar. Clicking a tab writes
 * `data-sidebar-tab="general" | "seo" | "status"` on the sidebar
 * container. CSS in `edit-view.css` shows/hides field groups by class
 * (`sidebar-field--<tab>` — added via `withSidebarTab` helper).
 *
 * Fields never unmount — only visibility toggles → form state safe.
 *
 * Phase 4.9: tabs list is now configurable via `clientProps.tabs` so
 * collections without SEO (e.g. ServiceTypes) can use a 2-tab layout.
 * Default = all three (General / SEO / Publishing).
 *
 * Persistence: activeTab is stored in localStorage per-collection so
 * jumping between rows keeps the last-used tab.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'

type TabKey = 'general' | 'seo' | 'status'
const ALL_TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'seo',     label: 'SEO' },
  { key: 'status',  label: 'Publishing' },
]

const STORAGE_KEY = 'dnj-sidebar-tab'

const SidebarTabs: React.FC<{ tabs?: TabKey[] }> = ({ tabs: tabsProp }) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  // Filter ALL_TABS by tabsProp if provided; else use all three.
  const tabs = React.useMemo(
    () =>
      Array.isArray(tabsProp) && tabsProp.length > 0
        ? ALL_TABS.filter((t) => tabsProp.includes(t.key))
        : ALL_TABS,
    [tabsProp],
  )
  const [active, setActive] = useState<TabKey>(tabs[0]?.key ?? 'general')

  const findSidebarRoot = useCallback((): HTMLElement | null => {
    let node: HTMLElement | null = hostRef.current
    while (node && node !== document.body) {
      if (node.classList?.contains('document-fields__sidebar')) return node
      if (node.parentElement?.classList?.contains('document-fields__sidebar')) return node.parentElement
      node = node.parentElement
    }
    return document.querySelector<HTMLElement>('.document-fields__sidebar')
  }, [])

  // Restore persisted tab if it's still valid for this collection's tab list.
  useEffect(() => {
    let init: TabKey = tabs[0]?.key ?? 'general'
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as TabKey | null
      if (stored && tabs.some((t) => t.key === stored)) init = stored
    } catch { /* noop */ }
    setActive(init)
  }, [tabs])

  useEffect(() => {
    const root = findSidebarRoot()
    if (root) root.setAttribute('data-sidebar-tab', active)
    try { localStorage.setItem(STORAGE_KEY, active) } catch { /* noop */ }
  }, [active, findSidebarRoot])

  return (
    <div className="dnj-sidebar-tabs" ref={hostRef} role="tablist" aria-label="Page settings sections">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`dnj-sidebar-tabs__tab${active === t.key ? ' dnj-sidebar-tabs__tab--active' : ''}`}
          onClick={() => setActive(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default SidebarTabs
