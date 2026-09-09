import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { pricingFields } from '../fields/pricing'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { iconField } from '../fields/iconOptions'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'
import { toursTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg

export const FerryTickets: CollectionConfig = {
  slug: 'ferry-tickets',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'destination', 'status', 'isFeatured', 'updatedAtRelative'],
    preview: makePreview('/tour'),
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
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                    { name: 'category', type: 'relationship', relationTo: 'categories', filterOptions: { module: { equals: 'ferry-tickets' } }, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'duration', type: 'text', admin: { width: '40%', description: 'Mis: "Full Day", "3 Hours"' } },
                    { name: 'minParticipants', type: 'number', min: 1, defaultValue: 1, admin: { width: '30%' } },
                    { name: 'maxParticipants', type: 'number', admin: { width: '30%' } },
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
                        { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'Mis: "6 Hours"' } },
                        { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.overview.sections.highlights.label,
              admin: { initCollapsed: s.overview.sections.highlights.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.highlights.icon) },
              fields: [
                {
                  name: 'highlights',
                  type: 'array',
                  admin: { description: 'Tour highlights (bullet points, max ~8).' },
                  fields: [
                    { name: 'text', type: 'text', required: true },
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
                { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Main hero image.' } },
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
            {
              type: 'collapsible',
              label: s.media.sections.video.label,
              admin: { initCollapsed: s.media.sections.video.initCollapsed, className: sectionClass(s.media.color, s.media.sections.video.icon) },
              fields: [
                { name: 'videoUrl', type: 'text', label: 'Video URL', admin: { description: 'YouTube atau Vimeo URL' } },
              ],
            },
          ],
        },

        // ── 3. Itinerary & Pricing (Coral) ──────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.itinerary.label,
              admin: { initCollapsed: s.tab3.sections.itinerary.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.itinerary.icon) },
              fields: [
                {
                  name: 'itinerary',
                  type: 'array',
                  label: 'Itinerary Steps',
                  admin: { description: 'Urutan aktivitas tour (drag & drop untuk reorder).' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'time', type: 'text', admin: { width: '25%', description: 'Mis: "09:00" atau "1 hour"' } },
                        { name: 'title', type: 'text', required: true, admin: { width: '35%' } },
                        iconField({ name: 'iconName', admin: { width: '40%' } }),
                      ],
                    },
                    { name: 'description', type: 'textarea' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.meeting.label,
              admin: { initCollapsed: s.tab3.sections.meeting.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.meeting.icon) },
              fields: [
                {
                  name: 'meetingPoint',
                  type: 'group',
                  admin: { description: 'Meeting point info.' },
                  fields: [
                    { name: 'name', type: 'text', admin: { description: 'Mis: "Ubud Palace Main Gate"' } },
                    {
                      type: 'row',
                      fields: [
                        { name: 'time', type: 'text', admin: { width: '30%', description: 'Mis: "08:00"' } },
                        { name: 'address', type: 'text', admin: { width: '70%' } },
                      ],
                    },
                    { name: 'mapEmbed', type: 'text', admin: { description: 'Google Maps embed URL (opsional)' } },
                  ],
                },
                {
                  name: 'pickupService',
                  type: 'group',
                  admin: { description: 'Pickup service info (kalau ada).' },
                  fields: [
                    { name: 'available', type: 'checkbox', defaultValue: false, admin: { description: 'Pickup service tersedia?' } },
                    { name: 'areas', type: 'textarea', admin: {
                      condition: (_, sib) => sib?.available === true,
                      description: 'List area pickup (mis: "Ubud, Canggu, Seminyak, Kuta")',
                    }},
                    { name: 'notes', type: 'text', admin: {
                      condition: (_, sib) => sib?.available === true,
                      description: 'Additional notes (mis: "Free pickup dalam 15km, di luar area kena charge")',
                    }},
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

        // ── 4. Inclusions & Info (Teal) ─────────────
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
              label: s.tab4.sections.excludes.label,
              admin: { initCollapsed: s.tab4.sections.excludes.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.excludes.icon) },
              fields: [
                {
                  name: 'excludes',
                  type: 'array',
                  label: 'What\'s NOT Included',
                  fields: [{ name: 'item', type: 'text', required: true }],
                },
              ],
            },
          ],
        },

        // ── 5. Policies (Stone) ─────────────────────
        {
          label: s.policies.label,
          fields: [
            {
              type: 'collapsible',
              label: s.policies.sections.additional.label,
              admin: { initCollapsed: s.policies.sections.additional.initCollapsed, className: sectionClass(s.policies.color, s.policies.sections.additional.icon) },
              fields: [
                { name: 'additionalInfo', type: 'richText', admin: { description: 'Additional info: dress code, restrictions, cancellation policy, dsb.' } },
              ],
            },
          ],
        },

        // ── 6. Custom Sections (Midnight) ───────────
        {
          label: s.customSections.label,
          fields: [
            {
              type: 'collapsible',
              label: s.customSections.sections.related.label,
              admin: { initCollapsed: s.customSections.sections.related.initCollapsed, className: sectionClass(s.customSections.color, s.customSections.sections.related.icon) },
              fields: [
                relatedServicesPerServiceFields('ferry-tickets'),
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
