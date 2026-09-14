import type { CollectionConfig } from 'payload'
import { superAdminFieldAccess } from '../access/roles'
import { moduleAccess } from '../access/moduleAccess'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { iconField } from '../fields/iconOptions'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'
import { yachtsTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg

export const Yachts: CollectionConfig = {
  slug: 'yachts',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'yachtType', 'capacity', 'status', 'updatedAtRelative'],
    preview: makePreview('/yacht'),
  },
  access: moduleAccess('yacht'),
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
                    { name: 'yachtType', type: 'select', admin: { width: '50%' }, options: [
                      { label: '⛵ Catamaran', value: 'catamaran' }, { label: '🚤 Speedboat', value: 'speedboat' },
                      { label: '⛵ Sailing Yacht', value: 'sailing' }, { label: '🛥️ Motor Yacht', value: 'motor_yacht' },
                      { label: '🚢 Phinisi', value: 'phinisi' },
                    ]},
                    { name: 'capacity', type: 'number', min: 1, admin: { width: '50%', description: 'Max guests' } },
                  ],
                },
                { name: 'destination', type: 'relationship', relationTo: 'destinations', admin: { description: 'Departure port / area' } },
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

        // ── 3. Charter & Pricing (Coral) ────────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.specs.label,
              admin: { initCollapsed: s.tab3.sections.specs.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.specs.icon) },
              fields: [
                {
                  name: 'specifications', type: 'group',
                  fields: [
                    { type: 'row', fields: [
                      { name: 'length', type: 'text', admin: { width: '25%', description: 'Mis: "24m"' } },
                      { name: 'engine', type: 'text', admin: { width: '25%' } },
                      { name: 'crewSize', type: 'number', admin: { width: '25%' } },
                      { name: 'yearBuilt', type: 'text', admin: { width: '25%' } },
                    ]},
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.packages.label,
              admin: { initCollapsed: s.tab3.sections.packages.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.packages.icon) },
              fields: [
                {
                  name: 'packages', type: 'array', label: 'Packages',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'duration', type: 'text', admin: { description: 'Mis: "4 hours", "Full day"' } },
                    { name: 'description', type: 'textarea' },
                    { name: 'includes', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
                    { type: 'row', fields: [
                      { name: 'price', type: 'number', min: 0, admin: { width: '50%' } },
                      { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '25%' }, options: [{ label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' }] },
                      { name: 'priceNote', type: 'text', admin: { width: '25%' } },
                    ]},
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

        // ── 4. Amenities (Teal) ─────────────────────
        {
          label: s.tab4.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab4.sections.amenities.label,
              admin: { initCollapsed: s.tab4.sections.amenities.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.amenities.icon) },
              fields: [
                {
                  name: 'amenities', type: 'array',
                  admin: { description: 'On-board amenities (bar, sun deck, chef, dsb).' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                      iconField({ name: 'icon', admin: { width: '40%' } }),
                    ]},
                  ],
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
                relatedServicesPerServiceFields('yachts'),
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
                  blocks,
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
