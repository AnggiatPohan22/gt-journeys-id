import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { statusField, sortOrderField } from '../fields/status'
import { seoFields } from '../fields/seo'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

// Authors — bylines for blog posts. Kept separate from `Users` supaya
// artikel yang ditulis oleh kontributor eksternal (non-admin) tetap
// menampilkan nama asli mereka. Struktur ringan: nama, foto, bio,
// role tag, social links.
//
// Phase 4.35 (Path B step 2): shipped standalone first — no Posts yet.
// Schema push risk minimal: 1 array (socialLinks) → 1 join table, no
// blocks-nesting, no relationship-hasMany cascades.

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    group: 'Blog',
    defaultColumns: ['name', 'role', 'status', 'updatedAtRelative'],
    listSearchableFields: ['name', 'role'],
  },
  access: {
    read: () => true,
    create: adminCreate,
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    sidebarTabsField,
    withSidebarTab(
      { name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar', description: 'Auto dari name.' } },
      'general',
    ),
    updatedAtRelativeField,
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Photo' },
            {
              name: 'role',
              type: 'text',
              admin: { description: 'Byline label (mis: "Travel Editor", "Guest Contributor").' },
            },
            { name: 'bio', type: 'textarea', admin: { description: 'Short bio (1-2 sentences).' } },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              admin: { description: 'Optional external links (website, Instagram, LinkedIn, dll).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      admin: { width: '40%' },
                      options: [
                        { label: 'Website', value: 'website' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Twitter / X', value: 'twitter' },
                        { label: 'LinkedIn', value: 'linkedin' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'Other', value: 'other' },
                      ],
                    },
                    { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    withSidebarTab(seoFields, 'seo'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField, 'status'),
  ],
}
