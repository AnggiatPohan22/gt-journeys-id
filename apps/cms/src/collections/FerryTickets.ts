import type { CollectionConfig } from 'payload'
import { superAdminFieldAccess } from '../access/roles'
import { moduleAccess } from '../access/moduleAccess'
import { generateSlug } from '../hooks/generateSlug'
import { assignMediaFolder } from '../hooks/assignMediaFolder'
import { seoFields } from '../fields/seo'
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
  hooks: { afterChange: [assignMediaFolder('ferry-tickets')] },
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'destination', 'status', 'isFeatured', 'updatedAtRelative'],
    preview: makePreview('/ferry-tickets'),
  },
  access: moduleAccess('ferryTickets'),
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
                    {
                      name: 'originLocation',
                      type: 'relationship',
                      relationTo: 'locations',
                      admin: { width: '50%', description: 'Lokasi/pelabuhan asal keberangkatan. Tambah lokasi baru di Content → Locations.' },
                    },
                    {
                      name: 'arrivalLocation',
                      type: 'relationship',
                      relationTo: 'locations',
                      admin: { width: '50%', description: 'Lokasi/pelabuhan tujuan.' },
                    },
                  ],
                },
                {
                  type: 'row',
                  admin: { condition: () => false }, // DEPRECATED (Phase 4.61) — disembunyikan; dihapus di Stage 4 setelah backfill
                  fields: [
                    {
                      name: 'origin',
                      type: 'select',
                      admin: { width: '50%', description: 'DEPRECATED — dipindah ke Origin Location (relationship).' },
                      options: [
                        { label: 'Batam', value: 'batam' },
                        { label: 'Tanjung Pinang', value: 'tanjungpinang' },
                        { label: 'Singapore', value: 'singapore' },
                        { label: 'Malaysia', value: 'malaysia' },
                      ],
                    },
                    {
                      name: 'arrival',
                      type: 'select',
                      admin: { width: '50%', description: 'DEPRECATED — dipindah ke Arrival Location (relationship).' },
                      options: [
                        { label: 'Batam', value: 'batam' },
                        { label: 'Tanjung Pinang', value: 'tanjungpinang' },
                        { label: 'Singapore', value: 'singapore' },
                        { label: 'Malaysia', value: 'malaysia' },
                      ],
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'duration', type: 'text', admin: { width: '34%', description: 'Mis: "1h 15m", "2 Hours"' } },
                    { name: 'operator', type: 'text', admin: { width: '33%', description: 'Nama operator ferry (mis: "Batam Fast", "Majestic Ferry")' } },
                    { name: 'departureTime', type: 'text', admin: { width: '33%', description: 'Jam keberangkatan (mis: "08:00, 12:00, 17:00")' } },
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
            // ── Card Display (Ticket) — Phase 4.61 Stage 5 ──
            // Field OPSIONAL untuk tampilan kartu "Ticket Route" (variant=ticket).
            // Kosongkan → elemen terkait otomatis disembunyikan di kartu.
            {
              type: 'collapsible',
              label: 'Card Display (Ticket)',
              admin: { initCollapsed: true, className: sectionClass(s.overview.color, s.overview.sections.quickSpecs.icon) },
              fields: [
                {
                  name: 'operatorLogo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Logo operator (opsional), tampil di kartu Ticket. Mis. logo "Batam Fast".' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'bookedCount', type: 'number', min: 0, admin: { width: '50%', description: 'Jumlah booking (opsional), mis. 1707 → tampil "1,707 booked".' } },
                  ],
                },
                {
                  name: 'badges',
                  type: 'array',
                  maxRows: 3,
                  label: 'Badges',
                  admin: { description: 'Badge kecil di atas kartu (opsional, max 3). Mis. "Recommended", "Instant confirmation".' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'text', type: 'text', required: true, admin: { width: '60%' } },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'leaf',
                          admin: { width: '40%' },
                          options: [
                            { label: 'Blue (Recommended)', value: 'ocean' },
                            { label: 'Green (Instant confirmation)', value: 'leaf' },
                            { label: 'Coral', value: 'coral' },
                          ],
                        },
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

        // ── 3. Schedule & Pricing (Coral) ──────────
        {
          label: s.tab3.label,
          fields: [
            {
              type: 'collapsible',
              label: 'Schedule Time',
              admin: { initCollapsed: s.tab3.sections.itinerary.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.itinerary.icon) },
              fields: [
                {
                  name: 'scheduleTime',
                  type: 'array',
                  label: 'Ferry Schedule',
                  admin: { description: 'Jadwal keberangkatan & kedatangan ferry. Bisa multi-schedule (mis. pagi, siang, sore).' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'departureLocation',
                          type: 'relationship',
                          relationTo: 'locations',
                          admin: { width: '50%', description: 'Pelabuhan asal. Tambah lokasi baru di Content → Locations.' },
                        },
                        {
                          name: 'arrivalLocation',
                          type: 'relationship',
                          relationTo: 'locations',
                          admin: { width: '50%', description: 'Pelabuhan tujuan.' },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      admin: { condition: () => false }, // DEPRECATED (Phase 4.61) — dihapus di Stage 4 setelah backfill
                      fields: [
                        {
                          name: 'departurePort',
                          type: 'select',
                          admin: { width: '50%', description: 'DEPRECATED — dipindah ke Departure Location.' },
                          options: [
                            { label: 'Batam (Batam Center / Harbour Bay / Sekupang)', value: 'batam' },
                            { label: 'Tanjung Pinang (Sri Bintan Pura)', value: 'tanjungpinang' },
                            { label: 'Singapore (HarbourFront / Tanah Merah)', value: 'singapore' },
                            { label: 'Malaysia (Stulang Laut / Puteri Harbour)', value: 'malaysia' },
                          ],
                        },
                        {
                          name: 'arrivalPort',
                          type: 'select',
                          admin: { width: '50%', description: 'DEPRECATED — dipindah ke Arrival Location.' },
                          options: [
                            { label: 'Batam (Batam Center / Harbour Bay / Sekupang)', value: 'batam' },
                            { label: 'Tanjung Pinang (Sri Bintan Pura)', value: 'tanjungpinang' },
                            { label: 'Singapore (HarbourFront / Tanah Merah)', value: 'singapore' },
                            { label: 'Malaysia (Stulang Laut / Puteri Harbour)', value: 'malaysia' },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'departureTime', type: 'text', required: true, admin: { width: '33%', description: 'Mis: "08:00"' } },
                        { name: 'arrivalTime', type: 'text', required: true, admin: { width: '33%', description: 'Mis: "09:15"' } },
                        { name: 'duration', type: 'text', admin: { width: '34%', description: 'Mis: "1h 15m"' } },
                      ],
                    },
                    { name: 'notes', type: 'textarea', admin: { description: 'Catatan tambahan (opsional). Mis: "Weekday only", "Return trip available".' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Additional Remark',
              admin: { initCollapsed: s.tab3.sections.meeting.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.meeting.icon) },
              fields: [
                {
                  name: 'additionalRemark',
                  type: 'richText',
                  admin: { description: 'Informasi tambahan / catatan penting mengenai keberangkatan (opsional). Mis: instruksi khusus, kontak pelabuhan, dsb.' },
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.tab3.sections.pricing.label,
              admin: { initCollapsed: s.tab3.sections.pricing.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.pricing.icon) },
              fields: [
                {
                  name: 'ferryClasses',
                  type: 'array',
                  label: 'Ferry Classes',
                  admin: { description: 'Kelas / cabin options (mis: Ekonomi, Emerald). Setiap kelas punya harga adult & child.' },
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { description: 'Nama ferry / kelas (mis: "Batam Fast — Emerald").' } },
                    { name: 'description', type: 'textarea' },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'classType',
                          type: 'select',
                          required: true,
                          admin: { width: '50%', description: 'Tipe kelas.' },
                          options: [
                            { label: 'Ekonomi', value: 'ekonomi' },
                            { label: 'Emerald', value: 'emerald' },
                          ],
                        },
                        {
                          name: 'currency',
                          type: 'select',
                          defaultValue: 'IDR',
                          admin: { width: '50%' },
                          options: [
                            { label: 'IDR', value: 'IDR' },
                            { label: 'USD', value: 'USD' },
                            { label: 'SGD', value: 'SGD' },
                            { label: 'MYR', value: 'MYR' },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'adultPrice', type: 'number', min: 0, required: true, admin: { width: '34%', description: 'Harga per adult.' } },
                        { name: 'childPrice', type: 'number', min: 0, admin: { width: '33%', description: 'Harga per child (opsional).' } },
                        { name: 'originalPrice', type: 'number', min: 0, admin: { width: '33%', description: 'Harga asli sebelum diskon (opsional). Jika > adultPrice → tampil harga coret + "Save X%" di kartu.' } },
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
              fields: [whatsappField],
            },
          ],
        },

        // ── 4. Info (Teal) ─────────────
        {
          label: s.tab4.label,
          fields: [
            {
              type: 'collapsible',
              label: 'How to Check-in',
              admin: { initCollapsed: s.tab4.sections.includes.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.includes.icon) },
              fields: [
                {
                  name: 'howToCheckIn',
                  type: 'richText',
                  admin: { description: 'Instruksi check-in di pelabuhan (mis. datang 60 menit sebelum keberangkatan, bawa passport, dsb).' },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Purchase Notice',
              admin: { initCollapsed: s.tab4.sections.excludes.initCollapsed, className: sectionClass(s.tab4.color, s.tab4.sections.excludes.icon) },
              fields: [
                {
                  name: 'purchaseNotice',
                  type: 'richText',
                  admin: { description: 'Ketentuan pembelian & refund (mis. tiket tidak dapat direfund, wajib passport valid > 6 bulan, dsb).' },
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
