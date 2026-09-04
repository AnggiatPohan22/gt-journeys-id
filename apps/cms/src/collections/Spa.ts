import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
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
import { spaTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg

export const Spa: CollectionConfig = {
  slug: 'spa',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'treatmentType', 'status', 'updatedAtRelative'],
    preview: makePreview('/spa'),
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
                { name: 'title', type: 'text', required: true },
                { name: 'subtitle', type: 'text', admin: { description: 'Short tagline (opsional)' } },
                {
                  type: 'row',
                  fields: [
                    { name: 'treatmentType', type: 'select', required: true, admin: { width: '50%' }, options: [
                      { label: '🏍️ Star' , value: 'Balines Spa' },
                      { label: '🚗 Star', value: 'Traditional Massage' },
                      { label: '🚴 Star', value: 'Thai massage' },
                      { label: '🚤 Star', value: 'Honeymoon package' },
                      { label: '📦 Other', value: 'other' },
                    ]},
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', admin: { width: '50%' } },
                  ],
                },
                { name: 'description', type: 'richText', required: true },
              ],
            },
            {
              type: 'collapsible',
              label: s.overview.sections.quickSpecs.label,
              admin: { initCollapsed: s.overview.sections.quickSpecs.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.quickSpecs.icon) },
              fields: [
                {
                  name: 'quickSpecs',
                  type: 'array',
                  maxRows: 4,
                  admin: { description: 'Max 4 stat cards.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        iconField({ name: 'iconName', required: true, admin: { width: '40%' } }),
                        { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
                        { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                      ],
                    },
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

        // ── 3. Treatments & Pricing (Coral) ─────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.specs.label,
              admin: { initCollapsed: s.tab3.sections.specs.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.specs.icon) },
              fields: [
                {
                  name: 'specifications',
                  type: 'group',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'brand', type: 'text', admin: { width: '33%' } },
                        { name: 'model', type: 'text', admin: { width: '33%' } },
                        { name: 'year', type: 'text', admin: { width: '34%' } },
                      ],
                    },
                    { name: 'details', type: 'textarea', admin: { description: 'Additional spec details' } },
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
                  name: 'features',
                  type: 'array',
                  admin: { description: 'All Detail Package listing Spa Wellness' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                        iconField({ name: 'icon', admin: { width: '40%' } }),
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.pricing.label,
              admin: { initCollapsed: s.tab3.sections.pricing.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.pricing.icon) },
              fields: [
                {
                  name: 'pricingTiers',
                  type: 'array',
                  label: 'Pricing',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'duration', type: 'select', admin: { width: '35%' }, options: [
                          { label: 'One Hour', value: 'hourly' },
                          { label: 'One Hour thirty', value: 'hourly' },
                          { label: 'Two Hour', value: 'hourly' },
                          { label: 'Honeymoon', value: 'package' },
                          { label: 'Couple', value: 'package' },
                        ]},
                        { name: 'price', type: 'number', min: 0, required: true, admin: { width: '35%' } },
                        { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '30%' }, options: [
                          { label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' },
                        ]},
                      ],
                    },
                    { name: 'note', type: 'text', admin: { description: 'Opsional note (mis: "Combine deals")' } },
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

        // ── 4. Includes & Requirements (Teal) ───────
        {
          label: s.tab4.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab4.sections.includes.label,
              admin: { initCollapsed: s.tab4.sections.includes.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.includes.icon) },
              fields: [
                {
                  name: 'includes',
                  type: 'array',
                  label: 'What\'s Included',
                  fields: [{ name: 'item', type: 'text', required: true }],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab4.sections.requirements.label,
              admin: { initCollapsed: s.tab4.sections.requirements.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.requirements.icon) },
              fields: [
                { name: 'requirements', type: 'textarea', admin: { description: 'Welcome drink, Cake and etc' } },
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
                relatedServicesPerServiceFields('spa'),
              ],
            },
            {
              type: 'collapsible',
              label: s.customSections.sections.blocks.label,
              admin: { initCollapsed: s.customSections.sections.blocks.initCollapsed, className: sectionClass(s.customSections.color, s.customSections.sections.blocks.icon) },
              fields: [
                {
                  name: 'additionalBlocks',
                  type: 'blocks',
                  label: 'Additional Blocks',
                  admin: { description: 'Block dirender berurutan setelah main sections.' },
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
