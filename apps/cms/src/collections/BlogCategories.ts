import type { CollectionConfig } from 'payload'
import { authenticatedUpdate, superAdminDelete } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { statusField, sortOrderField } from '../fields/status'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

// ── Blog Categories ─────────────────────────────────────────
// Primary category taxonomy for blog Posts, split out from the
// cross-module Categories collection (Phase 4.35.3). Same shape as
// Categories minus the `module` discriminator — because this
// collection is blog-only by construction.
//
// Editor-createable so clients can classify their own posts. Sits
// under the "Posts" admin group.
//
// Fields mirror Categories.ts (name, slug, parent, description,
// icon, featuredImage) so the existing frontend patterns (chip,
// tile grid, page filter) work identically after the fetcher swap.

export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  admin: {
    useAsTitle: 'name',
    group: 'Posts',
    defaultColumns: ['name', 'slug', 'status', 'updatedAtRelative'],
    listSearchableFields: ['name', 'slug'],
  },
  access: {
    read: () => true,
    create: authenticatedUpdate,     // editors can create blog categories
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar', description: 'Auto dari name.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'blog-categories',
      label: 'Parent Category',
      admin: { description: 'Optional — for subcategories.' },
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icon',
      admin: { description: 'Small icon for sidebar/inline chip contexts (optional).' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Tile image for CategoryGrid — the "Explore by Category" section.' },
    },
    withStatusCell(statusField),
    sortOrderField,
    updatedAtRelativeField,
  ],
}
