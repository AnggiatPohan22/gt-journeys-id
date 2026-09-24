import type { CollectionConfig } from 'payload'
import { superAdminFieldAccess } from '../access/roles'
import { moduleAccess } from '../access/moduleAccess'
import { generateSlug } from '../hooks/generateSlug'
import { assignMediaFolder } from '../hooks/assignMediaFolder'
import { seoFields } from '../fields/seo'
import { pricingFields } from '../fields/pricing'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { iconField } from '../fields/iconOptions'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'
import { waterActivitiesTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg

export const WaterActivities: CollectionConfig = {
  slug: 'water-activities',
  hooks: { afterChange: [assignMediaFolder('water-activities')] },
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'activityType', 'status', 'updatedAtRelative'],
    preview: makePreview('/water-activity'),
  },
  access: moduleAccess('waterActivities'),
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
                { name: 'subtitle', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'activityType', type: 'select', required: true, admin: { width: '50%' }, options: [
                      { label: '🤿 Snorkeling', value: 'snorkeling' }, { label: '🐠 Diving', value: 'diving' },
                      { label: '🏄 Surfing', value: 'surfing' }, { label: '🛶 Kayaking', value: 'kayaking' },
                      { label: '🪂 Parasailing', value: 'parasailing' }, { label: '🌊 Jet Ski', value: 'jetski' },
                      { label: '🍌 Banana Boat', value: 'banana_boat' }, { label: '🚀 Flyboard', value: 'flyboard' },
                      { label: '📦 Other', value: 'other' },
                    ]},
                    { name: 'difficultyLevel', type: 'select', admin: { width: '50%' }, options: [
                      { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' },
                      { label: 'Advanced', value: 'advanced' }, { label: 'All Levels', value: 'all_levels' },
                    ]},
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                    { name: 'category', type: 'relationship', relationTo: 'categories', filterOptions: { module: { equals: 'water-activities' } }, admin: { width: '50%' } },
                  ],
                },
                { name: 'duration', type: 'text', admin: { description: 'Mis: "2 hours", "Full day"' } },
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

        // ── 3. Activity & Pricing (Coral) ───────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.whatToBring.label,
              admin: { initCollapsed: s.tab3.sections.whatToBring.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.whatToBring.icon) },
              fields: [
                {
                  name: 'whatToBring', type: 'array',
                  admin: { description: 'Items yg perlu dibawa peserta.' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'item', type: 'text', required: true, admin: { width: '60%' } },
                      iconField({ name: 'icon', admin: { width: '40%' } }),
                    ]},
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.pricing.label,
              admin: { initCollapsed: s.tab3.sections.pricing.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.pricing.icon) },
              fields: [pricingFields],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.booking.label,
              admin: { initCollapsed: s.tab3.sections.booking.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.booking.icon) },
              fields: [whatsappField],
            },
          ],
        },

        // ── 4. Safety & Requirements (Stone) ────────
        {
          label: s.tab4.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab4.sections.safety.label,
              admin: { initCollapsed: s.tab4.sections.safety.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.safety.icon) },
              fields: [
                { name: 'requirements', type: 'textarea', admin: { description: 'Age limits, health requirements' } },
                { name: 'safetyInfo', type: 'richText', admin: { description: 'Safety briefing, guides, insurance.' } },
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
                relatedServicesPerServiceFields('water-activities'),
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
                  blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel', 'serviceListing', 'trustBadges'].includes(b.slug)),
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
