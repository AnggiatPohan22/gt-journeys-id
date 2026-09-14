import type { CollectionConfig } from 'payload'
import { superAdminFieldAccess } from '../access/roles'
import { moduleAccess } from '../access/moduleAccess'
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
import { venuesTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg

export const Venues: CollectionConfig = {
  slug: 'venues',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'venueType', 'status', 'updatedAtRelative'],
    preview: makePreview('/venue'),
  },
  access: moduleAccess('weddings'),
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
                    { name: 'venueType', type: 'select', admin: { width: '50%' }, options: [
                      { label: '🏖️ Beach', value: 'beach' }, { label: '🌿 Garden', value: 'garden' },
                      { label: '🗻 Cliff', value: 'cliff' }, { label: '⛪ Chapel', value: 'chapel' },
                      { label: '💃 Ballroom', value: 'ballroom' }, { label: '🏡 Private Villa', value: 'villa_private' },
                      { label: '📦 Other', value: 'other' },
                    ]},
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                  ],
                },
                { name: 'eventTypes', type: 'select', hasMany: true, options: [
                  { label: '💒 Wedding', value: 'wedding' }, { label: '💍 Engagement', value: 'engagement' },
                  { label: '🎂 Birthday', value: 'birthday' }, { label: '💼 Corporate', value: 'corporate' },
                  { label: '💕 Anniversary', value: 'anniversary' }, { label: '🎉 Other', value: 'other' },
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
            {
              type: 'collapsible',
              label: s.overview.sections.capacity.label,
              admin: { initCollapsed: s.overview.sections.capacity.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.capacity.icon) },
              fields: [
                {
                  name: 'capacity', type: 'group',
                  fields: [
                    { type: 'row', fields: [
                      { name: 'minGuests', type: 'number', min: 1, admin: { width: '50%' } },
                      { name: 'maxGuests', type: 'number', admin: { width: '50%' } },
                    ]},
                  ],
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

        // ── 3. Packages & Pricing (Coral) ───────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.packages.label,
              admin: { initCollapsed: s.tab3.sections.packages.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.packages.icon) },
              fields: [
                {
                  name: 'packages', type: 'array',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'description', type: 'richText' },
                    { name: 'includes', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
                    { type: 'row', fields: [
                      { name: 'startingPrice', type: 'number', min: 0, admin: { width: '60%' } },
                      { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '40%' }, options: [{ label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' }] },
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
                  admin: { description: 'Venue features (bridal suite, sound system, parking, dsb).' },
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
              fields: [locationFields],
            },
            {
              type: 'collapsible',
              label: s.tab4.sections.testimonials.label,
              admin: { initCollapsed: s.tab4.sections.testimonials.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.testimonials.icon) },
              fields: [
                {
                  name: 'testimonials', type: 'array',
                  admin: { description: 'Couple/client testimonials.' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'coupleName', type: 'text', admin: { width: '50%' } },
                      { name: 'eventDate', type: 'date', admin: { width: '30%' } },
                      { name: 'photo', type: 'upload', relationTo: 'media', admin: { width: '20%' } },
                    ]},
                    { name: 'quote', type: 'textarea' },
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
                relatedServicesPerServiceFields('venues'),
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
