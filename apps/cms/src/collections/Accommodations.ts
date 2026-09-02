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
import { accommodationsTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

const s = cfg // shorthand for section lookups

export const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'type', 'destination', 'status', 'updatedAtRelative'],
    preview: makePreview('/villa'),
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
        // ── 1. Overview (Ocean/Blue) ─────────────────────────
        {
          label: s.overview.label,
          fields: [
            {
              type: 'collapsible',
              label: s.overview.sections.description.label,
              admin: { initCollapsed: s.overview.sections.description.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.description.icon) },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'subtitle', type: 'text', admin: { description: 'Short tagline di bawah title (opsional, mis: "Cliffside sanctuary in Uluwatu")' } },
                {
                  type: 'row',
                  fields: [
                    { name: 'type', type: 'select', required: true, admin: { width: '50%' }, options: [
                      { label: 'Villa', value: 'villa' }, { label: 'Hotel', value: 'hotel' },
                      { label: 'Resort', value: 'resort' }, { label: 'Guesthouse', value: 'guesthouse' },
                    ]},
                    { name: 'starRating', type: 'number', min: 1, max: 5, label: 'Star Rating', admin: { width: '50%', description: '1-5, opsional' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                    { name: 'category', type: 'relationship', relationTo: 'categories', filterOptions: { module: { equals: 'accommodations' } }, admin: { width: '50%' } },
                  ],
                },
                { name: 'description', type: 'richText', required: true, admin: { description: 'Description panjang. Yg tampil di detail = teks plain (200 char untuk featured).' } },
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
                  admin: { description: '4 kotak stat di atas amenities. Kosong = frontend auto-derive. Icon + label + subtitle.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        iconField({ name: 'iconName', required: true, admin: { width: '40%' } }),
                        { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'Big label (mis: "5 Rooms")' } },
                        { name: 'subtitle', type: 'text', admin: { width: '30%', description: 'Small text di bawah (mis: "King Suites")' } },
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
                  name: 'highlightTags',
                  type: 'array',
                  maxRows: 6,
                  admin: { description: 'Tag chips di sidebar booking (max 6). Kosong = otomatis pakai 4 amenity pertama.' },
                  fields: [
                    { name: 'text', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },

        // ── 2. Media (Leaf/Green) ────────────────────────────
        {
          label: s.media.label,
          fields: [
            {
              type: 'collapsible',
              label: s.media.sections.featured.label,
              admin: { initCollapsed: s.media.sections.featured.initCollapsed, className: sectionClass(s.media.color, s.media.sections.featured.icon) },
              fields: [
                { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Main hero image (big, kiri). Rekomendasi landscape 16:9 min 1600px.' } },
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
                    description: 'Additional photos (max 10). First 2 = side bento. Sisanya diakses via "Show all photos". Grid: ← → reorder, ✎ edit/ganti (drawer Payload), 🗑 hapus.',
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

        // ── 3. Rooms & Pricing (Coral/Orange) ────────────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab3.sections.checkInOut.label,
              admin: { initCollapsed: s.tab3.sections.checkInOut.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.checkInOut.icon) },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'checkInTime', type: 'text', label: 'Check-in Time', admin: { width: '50%', description: 'Mis: "14:00" atau "2 PM"' } },
                    { name: 'checkOutTime', type: 'text', label: 'Check-out Time', admin: { width: '50%', description: 'Mis: "12:00"' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.rooms.label,
              admin: { initCollapsed: s.tab3.sections.rooms.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.rooms.icon) },
              fields: [
                {
                  name: 'roomTypes',
                  type: 'array',
                  label: 'Room Types',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                    {
                      type: 'row',
                      fields: [
                        { name: 'bedType', type: 'text', admin: { width: '50%', description: 'Mis: "King Bed", "2 Queen"' } },
                        { name: 'maxGuests', type: 'number', min: 1, admin: { width: '50%' } },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'pricePerNight', type: 'number', min: 0, admin: { width: '60%' } },
                        { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '40%' }, options: [
                          { label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' },
                        ]},
                      ],
                    },
                    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.booking.label,
              admin: { initCollapsed: s.tab3.sections.booking.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.booking.icon) },
              fields: [
                whatsappField,
              ],
            },
          ],
        },

        // ── 4. Amenities & Location (Teal/Cyan) ─────────────
        {
          label: s.tab4.label,
          fields: [
            {
              type: 'collapsible',
              label: s.tab4.sections.amenities.label,
              admin: { initCollapsed: s.tab4.sections.amenities.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.amenities.icon) },
              fields: [
                {
                  name: 'amenities',
                  type: 'array',
                  admin: { description: 'Amenity list yg tampil di grid dgn icon bulat (mis: Pool, WiFi, AC).' },
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
              label: s.tab4.sections.facilities.label,
              admin: { initCollapsed: s.tab4.sections.facilities.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.facilities.icon) },
              fields: [
                {
                  name: 'facilities',
                  type: 'array',
                  admin: { description: 'Fasilitas detail per kategori (seperti Booking.com). Mis: "Outdoor" → Pool, Garden; "Getting Around" → Car park, Shuttle.' },
                  fields: [
                    { name: 'category', type: 'text', required: true, label: 'Category Name', admin: { description: 'Mis: "Languages Spoken", "Outdoor", "Getting Around", "Things to Do"' } },
                    {
                      name: 'items',
                      type: 'array',
                      label: 'Items',
                      fields: [
                        { name: 'name', type: 'text', required: true, admin: { description: 'Mis: "Swimming pool", "Car park [free of charge]"' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab4.sections.location.label,
              admin: { initCollapsed: s.tab4.sections.location.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.location.icon) },
              fields: [
                { name: 'locationType', type: 'select', label: 'Location Type', options: [
                  { label: 'Island', value: 'island' }, { label: 'Mainland', value: 'mainland' },
                ]},
                locationFields,
              ],
            },
            {
              type: 'collapsible',
              label: s.tab4.sections.experiences.label,
              admin: { initCollapsed: s.tab4.sections.experiences.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.experiences.icon) },
              fields: [
                {
                  name: 'nearbyLandmarks',
                  type: 'array',
                  maxRows: 8,
                  admin: { description: 'Landmarks di sekitar (max 8). Tampil di section Location kolom kiri.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'name', type: 'text', required: true, admin: { width: '65%', description: 'Mis: "Uluwatu Temple"' } },
                        { name: 'distance', type: 'text', admin: { width: '35%', description: 'Mis: "10 mins" atau "2 km"' } },
                      ],
                    },
                  ],
                },
                {
                  name: 'curatedExperiences',
                  type: 'array',
                  maxRows: 8,
                  admin: { description: 'Curated experiences yg bisa di-arrange (max 8). Tampil di section Location kolom kanan.' },
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { description: 'Mis: "Private Cliffside Dinner", "In-Villa Spa"' } },
                  ],
                },
              ],
            },
          ],
        },

        // ── 5. Policies (Stone/Gray) ─────────────────────────
        {
          label: s.policies.label,
          fields: [
            {
              type: 'collapsible',
              label: s.policies.sections.booking.label,
              admin: { initCollapsed: s.policies.sections.booking.initCollapsed, className: sectionClass(s.policies.color, s.policies.sections.booking.icon) },
              fields: [
                { name: 'policies', type: 'richText' },
              ],
            },
          ],
        },

        // ── 6. Custom Sections (Midnight/Indigo) ─────────────
        {
          label: s.customSections.label,
          fields: [
            {
              type: 'collapsible',
              label: s.customSections.sections.related.label,
              admin: { initCollapsed: s.customSections.sections.related.initCollapsed, className: sectionClass(s.customSections.color, s.customSections.sections.related.icon) },
              fields: [
                relatedServicesPerServiceFields('accommodations'),
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
                  admin: { description: 'Block dirender berurutan di detail page setelah Room Options.' },
                  access: { update: superAdminFieldAccess },
                  blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel', 'serviceListing'].includes(b.slug)),
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
