import type { CollectionConfig } from 'payload'
import { authenticatedRead, adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { autoSortOrder } from '../hooks/autoSortOrder'
import { seoFields } from '../fields/seo'
import { statusField, sortOrderField } from '../fields/status'
import { locationFields } from '../fields/location'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'type', 'status', 'sortOrder', 'updatedAtRelative'],
  },
  access: {
    read: () => true,
    create: adminCreate,
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  hooks: {
    // Phase 3.23.1 — sortOrder auto max+1 saat create + swap saat bentrok
    // (perilaku sama dgn collection destination-types). CMS-only, tak pengaruh FE.
    beforeChange: [autoSortOrder],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Destination Name',
    },
    // Phase 4.9 — tabbed sidebar (General / SEO / Publishing). No preview
    // button: destinations are a filter taxonomy with no detail page.
    sidebarTabsField,
    withSidebarTab({
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar' },
    }, 'general'),
    {
      name: 'type',
      type: 'relationship',
      relationTo: 'destination-types',
      // CATATAN: sengaja TIDAK required. Kalau required=true, kolom type_id jadi
      // NOT NULL → Drizzle mencoba `delete from destinations` untuk row lama yang
      // kosong, dan gagal karena FK dari collection service. Isi via seed/migrate,
      // integritas dijaga di level app/editor.
      label: 'Destination Type',
      admin: {
        description: 'Tipe destinasi (dari collection Destination Types). Taksonomi internal — tidak tampil di frontend. Wajib diisi walau tidak required di DB.',
      },
    },
    // ── Hierarchy (Phase 3.22) ──────────────────────────────────────────
    withSidebarTab({
      name: 'parent',
      type: 'relationship',
      relationTo: 'destinations',
      label: 'Parent Destination',
      admin: {
        position: 'sidebar',
        description: 'Opsional — kalau ini sub-lokasi (mis. Kuta → Main Island). Kosongkan untuk destinasi top-level.',
      },
    }, 'general'),
    withSidebarTab({
      name: 'showInFilter',
      type: 'checkbox',
      label: 'Core Destination (tampil di filter)',
      defaultValue: false,
      access: {
        // Hanya Super Admin yang boleh menandai destinasi sebagai "core".
        create: superAdminFieldAccess,
        update: superAdminFieldAccess,
      },
      admin: {
        position: 'sidebar',
        description: 'Super Admin only. Kalau dicentang, destinasi ini muncul sebagai tab filter di listing (butuh fitur Hierarchical Destinations aktif di Pengaturan Fitur).',
      },
    }, 'status'),
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'galleryBulkUpload',
      type: 'ui',
      admin: {
        components: {
          Field: '/admin/GalleryBulkUpload#default',
        },
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Gallery',
      maxRows: 10,
      admin: {
        description: 'Additional photos (max 10). Grid: ← → reorder, ✎ edit/ganti (drawer Payload), 🗑 hapus.',
        className: 'dnj-gallery-grid',
        components: {
          afterInput: ['/admin/GalleryGrid#default'],
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    locationFields,
    withSidebarTab(seoFields,      'seo'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField, 'status'),
    updatedAtRelativeField,
  ],
}
