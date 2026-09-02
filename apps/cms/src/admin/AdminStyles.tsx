'use client'
import React from 'react'

/**
 * Provider ringan yang meng-inject stylesheet brand global ke SELURUH
 * route admin (termasuk login & semua collection view) — satu-satunya cara
 * memuat CSS global di Payload v3 (tidak ada opsi `admin.css`).
 *
 * Didaftarkan di `admin.components.providers`. Hanya me-render children;
 * seluruh rule di `admin-global.css` bersifat additive & reversible
 * (menyentuh hanya class Payload tertentu: nav aktif + tombol login).
 */
import './admin-global.css'
// Phase 4.8 — edit-view UX polish (sticky bar, collapsible sidebar,
// sidebar tabs, block row polish). Applies to all collections that use
// the default edit view; all rules are additive & scoped to Payload's
// edit-view classes so they never leak into list/dashboard.
import './edit-view.css'
// Phase 4.11 — media library list redesign (view-size selector +
// table→grid CSS transform). Only activates on /admin/collections/media
// via body[data-view-mode] attribute set by MediaListEnhancer.
import './media-list.css'
// Phase 4.12 — collection list-view cells (status/template chips,
// relative dates, block-count) + step-nav breadcrumb back-arrow polish.
// Chips render only where their Cell components are registered per
// collection; step-nav polish is global.
import './list-view.css'
// Phase 4.13 — menu editor visual polish (main-vs-sub distinction,
// card layout, per-type badges). Scoped via `dnj-menu-editor` marker
// class attached to Menus > items array; other array fields untouched.
import './menu-editor.css'
// Phase 4.14 — Users collection: circular avatar list cell, password
// generator + force unlock cards on the Security tab.
import './users-editor.css'
// Phase 4.18 — accordion sections with color-coded tabs. Section-level
// collapsibles get colored left borders, icon badges, and accordion
// behavior (open one → close others in same tab).
import './accordion-sections.css'
// Phase 4.26b — Accommodations gallery: transform default array-row
// stack into a 4-per-row thumbnail grid. Scoped via `dnj-gallery-grid`
// className on the array field; other array fields untouched. Pairs
// with GalleryCardOverlay for reorder/delete overlay controls.
import './gallery-grid.css'
import AccordionSections from './AccordionSections'

const AdminStyles: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <AccordionSections>{children}</AccordionSections>
}

export default AdminStyles
