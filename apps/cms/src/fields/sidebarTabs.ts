import type { Field } from 'payload'

/**
 * DnJourneysBali — Shared sidebar-tabs helpers (Phase 4.9).
 *
 * Extracted from `collections/Pages.ts` (Phase 4.8) so every collection
 * that gets the sidebar-tabs treatment imports the same building blocks:
 *
 *   1. `sidebarTabsField` — a UI field that renders the tab bar
 *      (`admin/SidebarTabs.tsx`). Place it FIRST in the sidebar.
 *
 *   2. `withSidebarTab(field, tab)` — wraps a field to append
 *      `sidebar-field--<tab>` to its `admin.className`. The CSS in
 *      `admin/edit-view.css` shows/hides field groups based on the
 *      active tab written to `.document-fields__sidebar[data-sidebar-tab]`.
 *
 *   3. `sidebarTabsFieldWith(tabs)` — variant that hands the client
 *      component a custom tab list via `clientProps` (used for
 *      collections that don't have SEO — see ServiceTypes in Phase 4.9).
 *
 * Fields never unmount — only visibility toggles via CSS → form state
 * stays intact. See `docs/phases/phase-4-polish-launch/admin-ui/editor-ux/phase-4.9-editor-ux-replication.md` §4.1.
 */

export type SidebarTab = 'general' | 'seo' | 'status'

export const withSidebarTab = <T extends Field>(field: T, tab: SidebarTab): T => ({
  ...field,
  admin: {
    ...((field as any).admin || {}),
    className: [
      ((field as any).admin?.className ?? ''),
      `sidebar-field--${tab}`,
    ].filter(Boolean).join(' '),
  },
}) as T

export const sidebarTabsField: Field = {
  name: 'sidebarTabs',
  type: 'ui',
  admin: {
    position: 'sidebar',
    components: {
      Field: '/admin/SidebarTabs#default',
    },
  },
}

/**
 * Variant with an explicit tab list. `SidebarTabs.tsx` reads
 * `clientProps.tabs` and renders only those tabs (default = all three).
 * Use for collections without SEO (e.g. ServiceTypes → 2-tab layout).
 */
export const sidebarTabsFieldWith = (tabs: SidebarTab[]): Field => ({
  name: 'sidebarTabs',
  type: 'ui',
  admin: {
    position: 'sidebar',
    components: {
      Field: '/admin/SidebarTabs#default',
    },
    // `clientProps` is passed through to the client component instance.
    // Payload v3 propagates these from field.admin.clientProps to the
    // client field renderer.
    clientProps: { tabs } as any,
  } as any,
})
