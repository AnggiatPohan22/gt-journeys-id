import type { CollectionConfig } from 'payload'
import { superAdminFieldAccess } from '../access/roles'
import { moduleAccess } from '../access/moduleAccess'
import { generateSlug } from '../hooks/generateSlug'
import { assignMediaFolder } from '../hooks/assignMediaFolder'
import { computeFerryDuration } from '../hooks/computeFerryDuration'
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
  hooks: {
    beforeChange: [computeFerryDuration],
    afterChange: [assignMediaFolder('ferry-tickets')],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'destination', 'status', 'isFeatured', 'updatedAtRelative'],
    preview: makePreview('/ferry-tickets'),
  },
  access: moduleAccess('ferryTickets'),
  fields: [
    // Phase 4.61.6 refinement — convert admin.description into hover tooltips.
    {
      name: 'descriptionsToTooltips',
      type: 'ui',
      label: false as unknown as string,
      admin: {
        components: {
          Field: '/admin/DescriptionsToTooltips#default',
        },
      },
    },
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar', placeholder: 'auto dari title' } }, 'general'),
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
                { name: 'title', type: 'text', required: true, admin: { placeholder: 'Ferry Batam → Singapore (Batam Fast)' } },
                { name: 'subtitle', type: 'text', admin: { placeholder: 'Fast ferry service, 60 min crossing', description: 'Short tagline (optional).' } },
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
                      admin: { width: '50%', description: 'Departure port / location. Add new locations under Content → Locations.' },
                    },
                    {
                      name: 'arrivalLocation',
                      type: 'relationship',
                      relationTo: 'locations',
                      admin: { width: '50%', description: 'Arrival port / location.' },
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
                      admin: { width: '50%', description: 'DEPRECATED — moved to Origin Location (relationship).' },
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
                      admin: { width: '50%', description: 'DEPRECATED — moved to Arrival Location (relationship).' },
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
                  // Phase 4.61.6 — 5-column row: Operator | Departure | Arrival | Duration | Override.
                  type: 'row',
                  fields: [
                    { name: 'operator', type: 'text', admin: { width: '25%', placeholder: 'Batam Fast', description: 'Ferry operator name (e.g. "Batam Fast", "Majestic Ferry").' } },
                    {
                      name: 'departureTime',
                      type: 'text',
                      admin: {
                        width: '20%',
                        placeholder: '08:00',
                        description: 'Departure time in HH:mm (24-hour). Click to open the wheel picker (scroll hours & minutes). One ticket = one departure.',
                        components: {
                          Field: '/admin/WheelTimePicker#default',
                        },
                      },
                      validate: (val: unknown) => {
                        if (val === null || val === undefined || val === '') return true
                        if (typeof val === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(val)) return true
                        return 'Must be HH:mm (e.g. 08:00, 17:30).'
                      },
                    },
                    {
                      name: 'arrivalTime',
                      type: 'text',
                      admin: {
                        width: '20%',
                        placeholder: '09:15',
                        description: 'Arrival time at the destination port (local time). Click to open the wheel picker. Used to auto-compute the duration.',
                        components: {
                          Field: '/admin/WheelTimePicker#default',
                        },
                      },
                      validate: (val: unknown) => {
                        if (val === null || val === undefined || val === '') return true
                        if (typeof val === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(val)) return true
                        return 'Must be HH:mm (e.g. 09:15).'
                      },
                    },
                    {
                      name: 'duration',
                      type: 'text',
                      admin: {
                        width: '20%',
                        placeholder: '1h 15m',
                        description: 'Auto-computed on save from departure/arrival times and location timezones. Enable "Override" to keep a manual value (e.g. "1h 15m", "2 Hours").',
                      },
                    },
                    {
                      name: 'durationOverride',
                      type: 'checkbox',
                      label: 'Override',
                      admin: {
                        width: '15%',
                        description: 'Check to disable auto-compute (e.g. overnight ferry or special cases).',
                      },
                    },
                  ],
                },
                // Phase 4.61.6 — hidden ui field: watches durationOverride
                // and disables the <input name="duration"> when unchecked.
                {
                  name: 'durationLock',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '/admin/DurationLock#default',
                    },
                  },
                },
                { name: 'description', type: 'richText', required: true },
              ],
            },
            {
              // Phase 4.61.6 — di-hide dari UI (khusus Ferry Tickets). Data
              // existing dipertahankan. Un-hide dengan hapus `hidden: true`.
              type: 'collapsible',
              label: s.overview.sections.quickSpecs.label,
              admin: { hidden: true, initCollapsed: s.overview.sections.quickSpecs.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.quickSpecs.icon) },
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
                        { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'E.g. "6 Hours".' } },
                        { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              // Phase 4.61.6 — di-hide (data dipertahankan).
              type: 'collapsible',
              label: s.overview.sections.highlights.label,
              admin: { hidden: true, initCollapsed: s.overview.sections.highlights.initCollapsed, className: sectionClass(s.overview.color, s.overview.sections.highlights.icon) },
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
                  admin: { description: 'Operator logo (optional). Shown on the Ticket card. E.g. "Batam Fast" logo.' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'bookedCount', type: 'number', min: 0, admin: { width: '50%', placeholder: '1707', description: 'Booking count (optional). E.g. 1707 renders as "1,707 booked".' } },
                  ],
                },
                {
                  name: 'badges',
                  type: 'array',
                  maxRows: 3,
                  label: 'Badges',
                  admin: { description: 'Small badges above the card (optional, max 3). E.g. "Recommended", "Instant confirmation".' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'text', type: 'text', required: true, admin: { width: '60%', placeholder: 'Instant confirmation' } },
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
                    description: 'Additional photos (max 10). Grid: ← → reorder, ✎ edit/replace (Payload drawer), 🗑 delete.',
                    className: 'dnj-gallery-grid',
                    components: {
                      afterInput: ['/admin/GalleryGrid#default'],
                    },
                  },
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media', required: true },
                    { name: 'caption', type: 'text', admin: { placeholder: 'Batam Fast ferry di dermaga' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: s.media.sections.video.label,
              admin: { initCollapsed: s.media.sections.video.initCollapsed, className: sectionClass(s.media.color, s.media.sections.video.icon) },
              fields: [
                { name: 'videoUrl', type: 'text', label: 'Video URL', admin: { placeholder: 'https://youtu.be/xxxxxx atau https://vimeo.com/xxxxxx', description: 'YouTube or Vimeo URL.' } },
              ],
            },
          ],
        },

        // ── 3. Schedule & Pricing (Coral) ──────────
        // Phase 4.61.6 — urutan: Pricing → Location Port → Additional Remark
        // → Booking. Schedule Time di-hide (jadwal single via Overview).
        {
          label: s.tab3.label,
          fields: [
            {
              // Phase 4.61.6 — di-hide. Ferry Tickets pindah ke single-schedule
              // (departureTime & arrivalTime di Overview). Data existing dipertahankan.
              type: 'collapsible',
              label: 'Schedule Time',
              admin: { hidden: true, initCollapsed: s.tab3.sections.itinerary.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.itinerary.icon) },
              fields: [
                {
                  name: 'scheduleTime',
                  type: 'array',
                  label: 'Ferry Schedule',
                  admin: { description: 'Ferry departure & arrival schedule. Supports multiple entries.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'departureLocation',
                          type: 'relationship',
                          relationTo: 'locations',
                          admin: { width: '50%', description: 'Departure port. Add new locations under Content → Locations.' },
                        },
                        {
                          name: 'arrivalLocation',
                          type: 'relationship',
                          relationTo: 'locations',
                          admin: { width: '50%', description: 'Arrival port.' },
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
                          admin: { width: '50%', description: 'DEPRECATED — moved to Departure Location.' },
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
                          admin: { width: '50%', description: 'DEPRECATED — moved to Arrival Location.' },
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
                        { name: 'departureTime', type: 'text', required: true, admin: { width: '33%', description: 'E.g. "08:00".' } },
                        { name: 'arrivalTime', type: 'text', required: true, admin: { width: '33%', description: 'E.g. "09:15".' } },
                        { name: 'duration', type: 'text', admin: { width: '34%', description: 'E.g. "1h 15m".' } },
                      ],
                    },
                    { name: 'notes', type: 'textarea', admin: { description: 'Extra notes (optional). E.g. "Weekday only", "Return trip available".' } },
                  ],
                },
              ],
            },
            // ── Pricing (Phase 4.61.6 — pindah ke posisi 1) ──
            {
              type: 'collapsible',
              label: s.tab3.sections.pricing.label,
              admin: { initCollapsed: s.tab3.sections.pricing.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.pricing.icon) },
              fields: [
                {
                  name: 'ferryClasses',
                  type: 'array',
                  label: 'Ferry Classes',
                  admin: { description: 'Class / cabin options (e.g. Economy, Emerald). Each class has adult & child pricing.' },
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { placeholder: 'Batam Fast — Emerald', description: 'Ferry / class name (e.g. "Batam Fast — Emerald").' } },
                    { name: 'description', type: 'textarea', admin: { placeholder: 'Kelas premium dengan seat lebih luas, snack & minuman gratis.' } },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'classType',
                          type: 'select',
                          required: true,
                          admin: { width: '50%', description: 'Class type.' },
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
                        { name: 'adultPrice', type: 'number', min: 0, required: true, admin: { width: '34%', placeholder: '350000', description: 'Adult price.' } },
                        { name: 'childPrice', type: 'number', min: 0, admin: { width: '33%', placeholder: '175000', description: 'Child price (optional).' } },
                        { name: 'originalPrice', type: 'number', min: 0, admin: { width: '33%', placeholder: '400000', description: 'Original price before discount (optional). If greater than adultPrice → renders a strikethrough price + "Save X%" on the card.' } },
                      ],
                    },
                    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
                  ],
                },
              ],
            },
            // ── Location Port (Phase 4.61.6) ──
            // Info-only section: peta di-render otomatis dari
            // originLocation.mapEmbedUrl. Edit datanya di Content → Locations.
            {
              type: 'collapsible',
              label: 'Location Port',
              admin: {
                initCollapsed: true,
                className: sectionClass(s.tab3.color, 'location_on'),
                description: 'Origin port map to help customers find the departure location. Automatically read from the selected Origin Location. To edit / add a map: go to Content → Locations → open the location → fill in "Map Embed URL" & "Map Directions URL".',
              },
              fields: [
                {
                  name: 'locationPortInfo',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '/admin/LocationPortInfo#default',
                    },
                  },
                },
              ],
            },
            // ── Additional Remark (Phase 4.61.6 — sekarang di posisi 3) ──
            {
              type: 'collapsible',
              label: 'Additional Remark',
              admin: { initCollapsed: s.tab3.sections.meeting.initCollapsed, className: sectionClass(s.tab3.color, s.tab3.sections.meeting.icon) },
              fields: [
                {
                  name: 'additionalRemark',
                  type: 'richText',
                  admin: { description: 'Additional info / important notes about the departure (optional). E.g. special instructions, port contact, etc.' },
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
                  admin: { description: 'Port check-in instructions (e.g. arrive 60 minutes before departure, bring passport, etc.).' },
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
                  admin: { description: 'Purchase & refund terms (e.g. non-refundable ticket, passport must be valid > 6 months, etc.).' },
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
                { name: 'additionalInfo', type: 'richText', admin: { description: 'Additional info: dress code, restrictions, cancellation policy, etc.' } },
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
                  admin: { description: 'Blocks rendered in order after the main sections.' },
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
