import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { locationFields } from '../fields/location'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { iconField } from '../fields/iconOptions'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'
import { restaurantsTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg

export const Restaurants: CollectionConfig = {
  slug: 'restaurants',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'locationType', 'priceRange', 'status', 'updatedAtRelative'],
    preview: makePreview('/restaurant'),
  },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } }, 'general'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField,  'status'),
    withSidebarTab(isFeaturedField, 'status'),
    updatedAtRelativeField,

    {
      type: 'tabs',
      admin: { className: 'dnj-main-tabs' },
      tabs: [
        // ── 1. Overview (Ocean) ──────────────────────
        {
          label: s.overview.label,
          fields: [
            {
              type: 'collapsible',
              label: s.overview.sections.description.label,
              admin: { initCollapsed: s.overview.sections.description.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.description.icon) },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'subtitle', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'priceRange', type: 'select', admin: { width: '50%' }, options: [
                      { label: '💵 Budget ($)', value: 'budget' },
                      { label: '💰 Mid-range ($$)', value: 'mid_range' },
                      { label: '💎 Fine Dining ($$$)', value: 'fine_dining' },
                    ]},
                    { name: 'locationType', type: 'select', admin: { width: '50%' }, options: [
                      { label: 'Island', value: 'island' }, { label: 'Mainland', value: 'mainland' },
                    ]},
                  ],
                },
                { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true },
                { name: 'cuisineType', type: 'select', hasMany: true, options: [
                  { label: '🍛 Indonesian', value: 'indonesian' }, { label: '🍔 Western', value: 'western' },
                  { label: '🦞 Seafood', value: 'seafood' }, { label: '🥢 Fusion', value: 'fusion' },
                  { label: '🍣 Japanese', value: 'japanese' }, { label: '🍝 Italian', value: 'italian' },
                  { label: '☕ Cafe', value: 'cafe' }, { label: '🍹 Bar', value: 'bar' },
                ]},
                { name: 'description', type: 'richText', required: true },
              ],
            },
            {
              type: 'collapsible',
              label: s.overview.sections.quickSpecs.label,
              admin: { initCollapsed: s.overview.sections.quickSpecs.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.quickSpecs.icon) },
              fields: [
                {
                  name: 'quickSpecs', type: 'array', maxRows: 4,
                  fields: [{
                    type: 'row',
                    fields: [
                      iconField({ name: 'iconName', required: true, admin: { width: '40%' } }),
                      { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
                      { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                    ],
                  }],
                },
              ],
            },
          ],
        },

        // ── 2. Media (Leaf) ─────────────────────────
        {
          label: s.media.label,
          fields: [
            {
              type: 'collapsible',
              label: s.media.sections.featured.label,
              admin: { initCollapsed: s.media.sections.featured.initCollapsed, className: sectionClass(s.media.color, s.media.sections.featured.icon) },
              fields: [
                { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true },
              ],
            },
            {
              type: 'collapsible',
              label: s.media.sections.gallery.label,
              admin: { initCollapsed: s.media.sections.gallery.initCollapsed, className: sectionClass(s.media.color, s.media.sections.gallery.icon) },
              fields: [
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
                  maxRows: 10,
                  admin: {
                    description: 'Additional photos (max 10). Grid: ← → reorder, ✎ edit/ganti (drawer Payload), 🗑 hapus.',
                    className: 'dnj-gallery-grid',
                    components: {
                      afterInput: ['/admin/GalleryGrid#default'],
                    },
                  },
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media', required: true },
                    { name: 'caption', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },

        // ── 3. Menu & Dining (Coral) ────────────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.menu.label,
              admin: { initCollapsed: s.tab3.sections.menu.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.menu.icon) },
              fields: [
                {
                  name: 'menuHighlights', type: 'array',
                  admin: { description: 'Signature dishes / recommendation.' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                      { name: 'price', type: 'number', admin: { width: '30%' } },
                      { name: 'image', type: 'upload', relationTo: 'media', admin: { width: '20%' } },
                    ]},
                    { name: 'description', type: 'text' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.booking.label,
              admin: { initCollapsed: s.tab3.sections.booking.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.booking.icon) },
              fields: [whatsappField],
            },
          ],
        },

        // ── 4. Features & Location (Teal) ───────────
        {
          label: s.tab4.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab4.sections.features.label,
              admin: { initCollapsed: s.tab4.sections.features.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.features.icon) },
              fields: [
                {
                  name: 'features', type: 'array',
                  admin: { description: 'Restaurant features (mis: outdoor seating, live music, sea view).' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                      iconField({ name: 'icon', admin: { width: '40%' } }),
                    ]},
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab4.sections.location.label,
              admin: { initCollapsed: s.tab4.sections.location.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.location.icon) },
              fields: [
                locationFields,
              ],
            },
            {
              type: 'collapsible',
              label: s.tab4.sections.hours.label,
              admin: { initCollapsed: s.tab4.sections.hours.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.hours.icon) },
              fields: [
                {
                  name: 'openingHours', type: 'array', label: 'Opening Hours',
                  fields: [{
                    type: 'row',
                    fields: [
                      { name: 'day', type: 'select', admin: { width: '30%' }, options: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => ({ label: d, value: d.toLowerCase() })) },
                      { name: 'open', type: 'text', admin: { width: '25%', description: 'Mis: "11:00"' } },
                      { name: 'close', type: 'text', admin: { width: '25%', description: 'Mis: "22:00"' } },
                      { name: 'isClosed', type: 'checkbox', defaultValue: false, admin: { width: '20%' } },
                    ],
                  }],
                },
              ],
            },
          ],
        },

        // ── 5. Custom Sections (Midnight) ───────────
        {
          label: s.customSections.label,
          fields: [
            {
              type: 'collapsible',
              label: s.customSections.sections.related.label,
              admin: { initCollapsed: s.customSections.sections.related.initCollapsed, className: sectionClass(s.customSections.color, s.customSections.sections.related.icon) },
              fields: [
                relatedServicesPerServiceFields('restaurants'),
              ],
            },
            {
              type: 'collapsible',
              label: s.customSections.sections.blocks.label,
              admin: { initCollapsed: s.customSections.sections.blocks.initCollapsed, className: sectionClass(s.customSections.color, s.customSections.sections.blocks.icon) },
              fields: [
                {
                  name: 'additionalBlocks', type: 'blocks', label: 'Additional Blocks',
                  access: { update: superAdminFieldAccess },
                  blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel'].includes(b.slug)),
                },
              ],
            },
          ],
        },
      ],
    },

    withSidebarTab(seoFields, 'seo'),
  ],
}
