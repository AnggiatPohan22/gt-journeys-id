import type { CollectionConfig } from 'payload'
import { authenticatedUpdate, superAdminDelete } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { statusField, sortOrderField } from '../fields/status'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

// ── Tags (Blog) ──────────────────────────────────────────────
// Editor-createable taxonomy for blog Posts. Sits under the "Posts"
// admin group alongside Posts + BlogCategories. Fully independent of
// the cross-module Categories collection (which stays for service
// verticals — tours, villa, etc).
//
// Fields kept minimal: name + slug + description + color (chip
// accent, optional). SEO is not needed at this stage — tag pages
// (`/tag/[slug]`) aren't wired yet; retrofit later if needed.

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Blog',
    defaultColumns: ['name', 'slug', 'status', 'updatedAtRelative'],
    listSearchableFields: ['name', 'slug'],
  },
  access: {
    read: () => true,
    create: authenticatedUpdate,     // editors can add tags (same as Posts)
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
    { name: 'description', type: 'textarea', admin: { description: 'Ringkasan singkat (opsional) — bisa dipakai di halaman tag suatu saat.' } },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color untuk chip aksen di frontend (opsional). Contoh: #E07A5F.',
      },
    },
    withStatusCell(statusField),
    sortOrderField,
    updatedAtRelativeField,
  ],
}
