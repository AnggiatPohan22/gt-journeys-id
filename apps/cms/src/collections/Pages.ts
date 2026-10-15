import type { CollectionConfig, Field } from 'payload'
import { authenticatedUpdate, isSuperAdmin } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { statusField, sortOrderField } from '../fields/status'
import { validateReservedSlug } from '../fields/reservedSlugs'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { blocks } from '../blocks'

// ── Phase 4.12: list-view virtual cells ──────────────────────────────
// blockCount is Pages-specific (reads rowData.content = the Page's
// blocks array). updatedAtRelativeField is shared and reusable.
const blockCountField: Field = {
  name: 'blockCount',
  type: 'ui',
  label: 'Blocks',
  admin: { components: { Cell: '/admin/cells/BlockCountCell#default' } },
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content & Pages',
    // Phase 4.12 — enrich list view. Order: title / status chip /
    // template chip / slug / block count / relative timestamp.
    defaultColumns: ['title', 'status', 'template', 'slug', 'blockCount', 'updatedAtRelative'],
    listSearchableFields: ['title', 'slug'],
    // Phase 4.8 · Preview button (conditional on status=published).
    // Pages needs a custom base (slug=`home` → `/`, not `/home`), so we
    // don't use the shared `makePreview()` helper here.
    preview: (doc: any) => {
      if (!doc || doc.status !== 'published' || !doc.slug) return null
      const siteUrl = (process.env.SITE_URL || 'http://localhost:4321').replace(/\/$/, '')
      const path = doc.slug === 'home' ? '' : `/${doc.slug}`
      return `${siteUrl}${path}`
    },
  },
  access: {
    read: () => true,
    create: isSuperAdmin,     // Only super-admin can create pages
    update: authenticatedUpdate, // Editors can edit content
    delete: isSuperAdmin,     // Only super-admin can delete
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    sidebarTabsField,
    withSidebarTab(
      { name: 'slug', type: 'text', required: true, unique: true, validate: validateReservedSlug, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar', description: 'Auto dari title. Slug tertentu (tours, accommodations, yacht, dst) di-reserve halaman statis — lihat fields/reservedSlugs.ts.' } },
      'general',
    ),
    withSidebarTab(
      { name: 'template', type: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Service Listing', value: 'service_listing' },
      ], admin: { position: 'sidebar', components: { Cell: '/admin/cells/TemplateCell#default' } } },
      'general',
    ),
    blockCountField,
    updatedAtRelativeField,
    {
      name: 'content',
      type: 'blocks',
      label: 'Page Content',
      blocks,
    },
    withSidebarTab(
      { name: 'parent', type: 'relationship', relationTo: 'pages', label: 'Parent Page', admin: { position: 'sidebar' } },
      'general',
    ),
    withSidebarTab(seoFields, 'seo'),
    // Phase 4.12 — attach StatusCell chip via shared helper.
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField, 'status'),
  ],
}
