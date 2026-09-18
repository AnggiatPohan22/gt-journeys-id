import type { Block } from 'payload'
import { mediaFields, buildFitPositionRow, imageFitOptions, imagePositionOptions } from '../fields/media'
import { advancedStyleFields, advancedStyleFieldsNoButton } from '../fields/advancedStyle'
import { superAdminFieldAccess } from '../access/roles'
import { iconField } from '../fields/iconOptions'

// ── Testimonial source fields (inline vs collection) ─────────────────
// Dipakai di block `testimonials` & `testimonialsCarousel`. Nama field select
// SENGAJA pendek (`source`, `svc`) supaya identifier enum tetap < 63 char saat
// block di-embed di collection nama panjang (mis. water_activities). Fungsi
// (bukan konstanta) agar tiap block dapat object field fresh (no shared ref).
const testimonialSourceFields = (defaultMax: number): any[] => [
  {
    name: 'source',
    type: 'select',
    defaultValue: 'inline',
    admin: { description: 'Ambil testimonial dari mana. "Inline" = isi manual di block ini. "Collection" = ambil dari koleksi Testimonials (CMS).' },
    options: [
      { label: 'Inline — isi manual di block ini', value: 'inline' },
      { label: 'From Collection — ambil dari koleksi Testimonials', value: 'collection' },
    ],
  },
  {
    type: 'row',
    admin: { condition: (_: any, s: any) => s?.source === 'collection' },
    fields: [
      {
        name: 'svc',
        type: 'select',
        defaultValue: 'all',
        admin: { width: '50%', description: 'Filter by service type.' },
        options: [
          { label: 'All services', value: 'all' },
          { label: 'General', value: 'general' },
          { label: 'Tours', value: 'tours' },
          { label: 'Accommodations', value: 'accommodations' },
          { label: 'Water Activities', value: 'water-activities' },
          { label: 'Yacht', value: 'yachts' },
          { label: 'Restaurants', value: 'restaurants' },
          { label: 'Weddings & Events', value: 'venues' },
          { label: 'Rentals', value: 'rentals' },
          { label: 'Spa & Wellness', value: 'spa' },
          { label: 'Ferry Tickets', value: 'ferry-tickets' },
        ],
      },
      { name: 'maxItems', type: 'number', defaultValue: defaultMax, min: 1, max: 60, admin: { width: '50%', description: 'Jumlah maksimal ditampilkan.' } },
    ],
  },
  { name: 'filterDest', type: 'relationship', relationTo: 'destinations', admin: { condition: (_: any, s: any) => s?.source === 'collection', description: 'Filter by destination (opsional).' } },
  { name: 'onlyFeatured', type: 'checkbox', defaultValue: false, admin: { condition: (_: any, s: any) => s?.source === 'collection', description: 'Hanya testimonial Featured.' } },
]

// ── Hero (Phase 3.6 enhanced) ─────────────────────────────────────────
// Reorganized into 3 tabs: Content / Media / Advanced.
// Media legacy fields (backgroundImage, overlayOpacity) removed — replaced
// by shared mediaFields (single/multi/video/none) and advancedStyleFields
// (background & button styling). Frontend fallback safe untuk data lama.
// ── Custom Label (Phase 4.8) ─────────────────────────────────────────
// Same collapsed-row Label component for every block; colour + summary
// resolved inside BlockLabel from `data.blockType`. Keeping the reference
// in one const avoids repeating the same string 16 times.
const BLOCK_LABEL = { Label: '/blocks/BlockLabel#default' } as const

const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  admin: { group: 'Layout', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          description: 'Text content displayed over the hero media',
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'subheading', type: 'text' },
            { name: 'ctaText', type: 'text', label: 'CTA Button Text' },
            { name: 'ctaLink', type: 'text', label: 'CTA Button Link' },
          ],
        },
        {
          label: 'Media',
          description: 'Background media — single image, image slider, atau video',
          fields: mediaFields,
        },
        {
          label: 'Advanced',
          description: 'Layout, background, button, text styles & spacing — sections collapsed by default (klik untuk expand).',
          fields: advancedStyleFields({ textElements: ['heading', 'subheading'] }),
        },
      ],
    },
    // Legacy fields — preserved sebagai kolom DB agar Drizzle tidak
    // menanya "rename or create" saat push schema. Hidden dari admin UI.
    // Boleh dihapus permanen post-migrasi manual (setelah user re-save
    // Hero entries + drop kolom via SQL).
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      admin: { hidden: true },
    },
  ],
}

// ── RichText (Phase 3.6.4 enhanced) ──────────────────────────────
const RichText: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text Blocks' },
  admin: { group: 'Content', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'content', type: 'richText', required: true },
          ],
        },
        {
          label: 'Advanced',
          description: 'Section padding, background, container width, entry animation, text style',
          fields: advancedStyleFieldsNoButton({ textElements: ['paragraph'] }),
        },
      ],
    },
    // Legacy alignment field (superseded by advanced.contentAlignment)
    { name: 'alignment', type: 'select', admin: { hidden: true }, options: [
      { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' },
    ]},
  ],
}

// ── Image (Phase 3.6.3 enhanced) ─────────────────────────────────
// Tabs: Content / Advanced. Menambahkan imageFit + imagePosition supaya
// gambar bisa di-crop dari sisi manapun.
const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  admin: { group: 'Content', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'caption', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'size', type: 'select', defaultValue: 'full', admin: { width: '50%' }, options: [
                  { label: 'Full Width', value: 'full' }, { label: 'Half', value: 'half' }, { label: 'Third', value: 'third' },
                ]},
                { name: 'aspectRatio', type: 'select', defaultValue: 'auto', admin: { width: '50%', description: 'Auto = natural. Fixed ratio buat fit/position berlaku.' }, options: [
                  { label: 'Auto (natural)', value: 'auto' },
                  { label: '16:9 (landscape)', value: '16-9' },
                  { label: '4:3 (photo)', value: '4-3' },
                  { label: '1:1 (square)', value: '1-1' },
                  { label: '3:4 (portrait)', value: '3-4' },
                  { label: '21:9 (cinematic)', value: '21-9' },
                ]},
              ],
            },
            buildFitPositionRow(),
          ],
        },
        {
          label: 'Advanced',
          description: 'Section padding, background, container width, entry animation, caption style',
          fields: advancedStyleFieldsNoButton({ textElements: ['caption'] }),
        },
      ],
    },
  ],
}

// ── Gallery (Phase 3.6.3 enhanced) ───────────────────────────────
// Tabs: Content / Advanced. Per-image fit + position di dalam array.
const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  admin: { group: 'Content', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'images',
              type: 'array',
              required: true,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'imageFit', type: 'select', defaultValue: 'cover', options: imageFitOptions, admin: { width: '50%' } },
                    { name: 'imagePosition', type: 'select', defaultValue: 'center', options: imagePositionOptions, admin: { width: '50%' } },
                  ],
                },
                { name: 'caption', type: 'text' },
              ],
            },
            { name: 'layout', type: 'select', defaultValue: 'grid', options: [
              { label: 'Grid', value: 'grid' }, { label: 'Masonry', value: 'masonry' }, { label: 'Slider', value: 'slider' },
            ]},
            {
              type: 'row',
              fields: [
                { name: 'desktopColumns', type: 'number', min: 1, max: 6, defaultValue: 3, admin: { width: '33%', description: '🖥️ Desktop cols' }},
                { name: 'tabletColumns',  type: 'number', min: 1, max: 4, defaultValue: 2, admin: { width: '33%', description: '💻 Tablet cols' }},
                { name: 'mobileColumns',  type: 'number', min: 1, max: 2, defaultValue: 1, admin: { width: '34%', description: '📱 Mobile cols' }},
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'enableLightbox', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Klik gambar → modal lightbox dgn prev/next.' }},
                { name: 'hoverEffect', type: 'select', defaultValue: 'zoom', admin: { width: '50%', description: 'Efek hover per-image.' }, options: [
                  { label: 'None', value: 'none' },
                  { label: 'Zoom (subtle scale)', value: 'zoom' },
                  { label: 'Lift (shadow + rise)', value: 'lift' },
                  { label: 'Overlay (darken + icon)', value: 'overlay' },
                  { label: 'Grayscale to color', value: 'grayscale' },
                ]},
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          description: 'Section padding, background, container width, entry animation, caption style',
          fields: advancedStyleFieldsNoButton({ textElements: ['caption'] }),
        },
      ],
    },
    // Legacy field — old `columns` preserved as hidden column.
    { name: 'columns', type: 'number', admin: { hidden: true } },
  ],
}

// ── CTA (Phase 3.6.3 enhanced) ───────────────────────────────────
// Tabs: Content / Media / Advanced. Menambahkan optional media (bg/side)
// + Advanced button styling (variant/color/radius/hover) supaya CTA bisa
// dipakai untuk banyak variasi (WA button, promo banner, section CTA).
// Legacy `style` field disembunyikan — frontend fallback ke sana kalau
// button.variant belum di-set (untuk data lama).
const CTA: Block = {
  slug: 'cta',
  labels: { singular: 'Call to Action', plural: 'CTAs' },
  admin: { group: 'Marketing', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'buttonText', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'buttonLink', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Media',
          description: 'Optional media (image/video). Layout = posisi media relatif ke text.',
          fields: [
            ...mediaFields,
            {
              name: 'mediaLayout',
              type: 'select',
              defaultValue: 'background',
              admin: {
                condition: (_, siblingData) => siblingData?.mediaType && siblingData.mediaType !== 'none',
                description: 'Posisi media relatif ke konten text.',
              },
              options: [
                { label: 'Background (media behind text, hero-like)', value: 'background' },
                { label: 'Left of text', value: 'left' },
                { label: 'Right of text', value: 'right' },
                { label: 'Above text', value: 'above' },
                { label: 'Below text', value: 'below' },
                { label: '✨ Scrolling Columns (2 cols vertical loop, needs Multiple mediaType, 5-10 images)', value: 'scrolling-columns' },
                { label: '✨ Dual Frames (2 overlapping cards, needs Multiple mediaType, 2 images)', value: 'dual-frames' },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          description: 'Section padding, background override, button styling, entry animation, text styles',
          fields: advancedStyleFields({ textElements: ['heading', 'description'] }),
        },
      ],
    },
    // Legacy field preserved (hidden) — Drizzle tidak minta rename.
    {
      name: 'style',
      type: 'select',
      admin: { hidden: true },
      options: [
        { label: 'Primary', value: 'primary' }, { label: 'Outline', value: 'outline' }, { label: 'WhatsApp', value: 'whatsapp' },
      ],
    },
  ],
}

// ── FAQ (Phase 3.6.4 enhanced) ───────────────────────────────────
const FAQ: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: { group: 'Social Proof', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Frequently Asked Questions' },
            { name: 'items', type: 'array', required: true, fields: [
              { name: 'question', type: 'text', required: true },
              { name: 'answer', type: 'richText', required: true },
            ]},
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading', 'quote'] }),
        },
      ],
    },
  ],
}

// ── Testimonials (Phase 3.6.4 enhanced) ──────────────────────────
const Testimonials: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  admin: { group: 'Social Proof', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'What Our Guests Say' },
            ...testimonialSourceFields(6),
            { name: 'items', type: 'array', required: false,
              admin: { condition: (_, sib) => sib?.source !== 'collection', description: 'Inline testimonials (dipakai kalau source = Inline).' },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'quote', type: 'textarea', required: true },
                { name: 'photo', type: 'upload', relationTo: 'media' },
                { name: 'rating', type: 'number', min: 1, max: 5 },
              ]},
          ],
        },
        {
          label: 'Display',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'paginate', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Show items in batches with pagination' } },
                { name: 'pageMode', type: 'select', defaultValue: 'load-more', options: [
                  { label: 'Load More (reveal next batch)', value: 'load-more' },
                  { label: 'Numbered Pages (1, 2, 3…)', value: 'pages' },
                ], admin: { width: '50%', condition: (_, sib) => sib?.paginate === true } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'pageSize', type: 'number', defaultValue: 6, min: 1, max: 60, admin: { width: '50%', condition: (_, sib) => sib?.paginate === true, description: 'Items per page / per batch' } },
                { name: 'moreText', type: 'text', defaultValue: 'Load More', admin: { width: '50%', condition: (_, sib) => sib?.paginate === true && sib?.pageMode !== 'pages' } },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading', 'quote'] }),
        },
      ],
    },
  ],
}

// ── ServiceGrid (Phase 3.6.4 enhanced) ───────────────────────────
const ServiceGrid: Block = {
  slug: 'serviceGrid',
  labels: { singular: 'Service Grid', plural: 'Service Grids' },
  admin: { group: 'Services', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'serviceType', type: 'select', required: true, options: [
              { label: 'Tours', value: 'tours' }, { label: 'Accommodations', value: 'accommodations' },
              { label: 'Water Activities', value: 'water-activities' }, { label: 'Yachts', value: 'yachts' },
              { label: 'Restaurants', value: 'restaurants' }, { label: 'Venues', value: 'venues' },
              { label: 'Rentals', value: 'rentals' },
              { label: 'Spa & Wellness', value: 'spa' },
              { label: 'Ferry Tickets', value: 'ferry-tickets' },
            ]},
            {
              type: 'row',
              fields: [
                { name: 'limit', type: 'number', defaultValue: 6, min: 1, max: 12, admin: { width: '50%' } },
                { name: 'featuredOnly', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
              ],
            },
            // Phase 4.15 — mirror ServiceListing's card variant so
            // editors can pick between compact grid tiles and richer
            // detailed cards. Default `compact` preserves current
            // rendering byte-for-byte on existing pages.
            {
              name: 'cardVariant',
              type: 'select',
              defaultValue: 'compact',
              options: [
                { label: 'Compact (default — image + title + price)', value: 'compact' },
                { label: 'Detailed (multi-image, rating, description, amenity badges, Book Now)', value: 'detailed' },
              ],
              admin: {
                description: 'Card layout for the Default template. Compact = small grid tile. Detailed = richer per-item info. Ignored when template = Curated.',
                condition: (_, sib) => (sib?.template ?? 'default') === 'default',
              },
            },
            // ── Phase 4.16 (Pass 1) — template + selection mode ───
            // `curated` template mirrors the hardcoded "Curated
            // Alternatives" section on service detail pages: 3-col
            // grid, taller image with hover-zoom, floating price chip,
            // per-service-type meta line. `auto` selectionMode is the
            // right pick when the block sits inside a service detail
            // page's Custom Sections — it fetches same-serviceType,
            // excludes the current doc, takes first N sorted.
            {
              name: 'template',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default (regular service grid)', value: 'default' },
                { label: 'Curated (large image, price chip, per-type meta — matches "Curated Alternatives")', value: 'curated' },
              ],
              admin: {
                description: 'Card presentation template. Curated is designed for the bottom of a service detail page.',
              },
            },
            {
              name: 'selectionMode',
              type: 'select',
              defaultValue: 'manual',
              options: [
                { label: 'Manual (respect serviceType + limit + featuredOnly)', value: 'manual' },
                { label: 'Auto (same serviceType as current page, exclude current doc)', value: 'auto' },
              ],
              admin: {
                description: 'How items are chosen. Auto only works when the block is placed inside a service detail page (Tour/Villa/etc. Custom Sections).',
                condition: (_, sib) => (sib?.template ?? 'default') === 'curated',
              },
            },
            {
              name: 'sectionTitle',
              type: 'text',
              admin: {
                description: 'Optional override for the section heading. Leave empty to use the default ("Curated Alternatives" / "More Yachts" etc. depending on serviceType).',
                condition: (_, sib) => (sib?.template ?? 'default') === 'curated',
              },
            },
            {
              type: 'collapsible',
              label: 'View All Button',
              admin: { initCollapsed: true, description: 'Button "View all" bawah grid. Kosongkan text = pakai default. Kosongkan link = auto-pilih landing sesuai serviceType.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'showViewAll', type: 'checkbox', defaultValue: true, admin: { width: '30%', description: 'Tampilkan button?' }},
                    { name: 'viewAllText', type: 'text', admin: { width: '30%', description: 'Text button (default: "View all")' }},
                    { name: 'viewAllLink', type: 'text', admin: { width: '40%', description: 'URL tujuan (kosong = auto by serviceType)' }},
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Pagination',
              admin: { initCollapsed: true, description: 'Show items in batches. Uses limit field above as total items fetched, pageSize as items per page.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'paginate', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Enable pagination' } },
                    { name: 'pageMode', type: 'select', defaultValue: 'load-more', options: [
                      { label: 'Load More (reveal next batch)', value: 'load-more' },
                      { label: 'Numbered Pages (1, 2, 3…)', value: 'pages' },
                    ], admin: { width: '50%', condition: (_, sib) => sib?.paginate === true } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'pageSize', type: 'number', defaultValue: 3, min: 1, max: 60, admin: { width: '50%', condition: (_, sib) => sib?.paginate === true, description: 'Items per page / per batch' } },
                    { name: 'moreText', type: 'text', defaultValue: 'Load More', admin: { width: '50%', condition: (_, sib) => sib?.paginate === true && sib?.pageMode !== 'pages' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading'] }),
        },
      ],
    },
  ],
}

// ── Contact (Phase 3.6.4 enhanced) ───────────────────────────────
const Contact: Block = {
  slug: 'contact',
  labels: { singular: 'Contact', plural: 'Contact Blocks' },
  admin: { group: 'Utility', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'showMap', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
                { name: 'showWhatsApp', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
              ],
            },
            { name: 'additionalText', type: 'richText' },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['paragraph'] }),
        },
      ],
    },
  ],
}

const Embed: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  admin: { group: 'Content', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'embedType', type: 'select', options: [
              { label: 'YouTube', value: 'youtube' }, { label: 'Google Map', value: 'map' }, { label: 'Custom', value: 'custom' },
            ]},
            { name: 'embedCode', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton(),
        },
      ],
    },
  ],
}

const Spacer: Block = {
  slug: 'spacer',
  labels: { singular: 'Spacer', plural: 'Spacers' },
  admin: { group: 'Layout', components: BLOCK_LABEL },
  fields: [
    { name: 'height', type: 'select', defaultValue: 'md', options: [
      { label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg' }, { label: 'Extra Large', value: 'xl' },
    ]},
  ],
}

// ── Phase 3.5 blocks ─────────────────────────────────────────
// New blocks added to match reference Home layout. Icon names refer to
// the frontend Icon.astro component (see apps/web/src/components/common/Icon.astro).

// ── ValuePropsBanner (Phase 3.6.4 enhanced) ──────────────────────
const ValuePropsBanner: Block = {
  slug: 'valuePropsBanner',
  labels: { singular: 'Value Props Banner', plural: 'Value Props Banners' },
  admin: { group: 'Marketing', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 2,
              maxRows: 6,
              admin: { description: '2-6 value props ditampilkan berjajar; biasanya dipasang overlap di bawah Hero' },
              fields: [
                iconField({ name: 'iconName', required: true }),
                { name: 'label', type: 'text', required: true },
                { name: 'subtitle', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['label', 'subheading'] }),
        },
      ],
    },
  ],
}

// ── StatsBanner (Phase 3.6.4 enhanced) ───────────────────────────
// NOTE: skip advanced.background group untuk hindari column bentrok dgn
// existing `backgroundImage` field (kolom sama-sama background_image_id).
// Sisanya (padding/alignment/container/entry animation) tetap available.
const StatsBanner: Block = {
  slug: 'statsBanner',
  labels: { singular: 'Stats Banner', plural: 'Stats Banners' },
  admin: { group: 'Marketing', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'theme',
              type: 'select',
              defaultValue: 'theme-1',
              options: [
                { label: 'Editorial Grid — big centered numbers + dividers (default)', value: 'theme-1' },
                { label: 'Feature Cards — icon-left card with glass background', value: 'theme-2' },
              ],
              admin: {
                description: 'Visual style. Pilih per-instance. Ganti tanpa mengubah data items.',
              },
            },
            { name: 'eyebrow', type: 'text', defaultValue: 'Why Choose Us' },
            { name: 'heading', type: 'text', required: true, defaultValue: 'Your Journey is Our Priority' },
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 2,
              maxRows: 6,
              fields: [
                iconField({ name: 'iconName', required: true }),
                { name: 'value', type: 'text', required: true, admin: { description: 'Nilai besar (mis: "1000+", "24/7", "50+")' }},
                { name: 'caption', type: 'text', required: true, admin: { description: 'Label bawah nilai (mis: "Happy Clients")' }},
              ],
            },
            { name: 'backgroundImage', type: 'upload', relationTo: 'media', admin: {
              description: 'Opsional. Kalau diisi, dijadikan background subtle di stats section.',
            }},
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({
            omitBackground: true, // legacy schema pakai kolom backgroundImage sendiri
            textElements: ['eyebrow', 'heading', 'label', 'caption'],
          }),
        },
      ],
    },
  ],
}

// ── TestimonialsCarousel (Phase 3.6.4 enhanced) ──────────────────
const TestimonialsCarousel: Block = {
  slug: 'testimonialsCarousel',
  labels: { singular: 'Testimonials Carousel', plural: 'Testimonials Carousels' },
  admin: { group: 'Social Proof', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'What Our Clients Say' },
            { name: 'heading', type: 'text', defaultValue: 'Memories That Last Forever' },
            ...testimonialSourceFields(3),
            {
              name: 'items',
              type: 'array',
              required: false,
              admin: { condition: (_, sib) => sib?.source !== 'collection', description: 'Inline testimonials (dipakai kalau source = Inline).' },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'location', type: 'text', admin: { description: 'Kota/negara (mis: "Australia", "UK", "Ubud")' }},
                { name: 'quote', type: 'textarea', required: true },
                { name: 'photo', type: 'upload', relationTo: 'media' },
                { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5 },
              ],
            },
          ],
        },
        {
          label: 'Display',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'paginate', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Show items in batches with pagination' } },
                { name: 'pageMode', type: 'select', defaultValue: 'load-more', options: [
                  { label: 'Load More (reveal next batch)', value: 'load-more' },
                  { label: 'Numbered Pages (1, 2, 3…)', value: 'pages' },
                ], admin: { width: '50%', condition: (_, sib) => sib?.paginate === true } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'pageSize', type: 'number', defaultValue: 3, min: 1, max: 60, admin: { width: '50%', condition: (_, sib) => sib?.paginate === true, description: 'Items per page / per batch' } },
                { name: 'moreText', type: 'text', defaultValue: 'Load More', admin: { width: '50%', condition: (_, sib) => sib?.paginate === true && sib?.pageMode !== 'pages' } },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['eyebrow', 'heading', 'quote'] }),
        },
      ],
    },
  ],
}

// ── ServiceListing (Phase 3.7 — service landing page block) ───────
// Bundle heading + destination filter tabs + search bar + featured editorial
// + grid. Auto-fetch dari service collection sesuai `serviceType`. Client-
// side filter berdasarkan destination + name search. Featured mode: auto
// (isFeatured pertama, fallback first) atau none.
const ServiceListing: Block = {
  slug: 'serviceListing',
  labels: { singular: 'Service Listing', plural: 'Service Listings' },
  admin: { group: 'Services', components: BLOCK_LABEL },
  fields: [
    // Layout selector — super-admin only. Placed OUTSIDE tabs so it's
    // always visible at the top; determines which template renders.
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'editorial-featured',
      required: true,
      options: [
        { label: 'Editorial Featured (default — heading, filter tabs, featured card, grid)', value: 'editorial-featured' },
        { label: 'Hero Immersive (hero image + floating filter, no featured card)', value: 'hero-immersive' },
      ],
      access: { update: superAdminFieldAccess },
      admin: {
        description: 'Template layout. Hanya Super Admin yang bisa mengubah. Editor lain read-only.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text', admin: { description: 'Small label above heading (mis: "The Collection")' } },
            { name: 'heading', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            {
              name: 'serviceType',
              type: 'select',
              required: true,
              options: [
                { label: 'Accommodations (Villa/Hotel/Resort/Guesthouse)', value: 'accommodations' },
                { label: 'Tours', value: 'tours' },
                { label: 'Water Activities', value: 'water-activities' },
                { label: 'Yachts', value: 'yachts' },
                { label: 'Restaurants', value: 'restaurants' },
                { label: 'Venues (Weddings)', value: 'venues' },
                { label: 'Rentals', value: 'rentals' },
                { label: 'Spa & Wellness', value: 'spa' },
                { label: 'Ferry Tickets', value: 'ferry-tickets' },
              ],
            },
            {
              name: 'accommodationTypes',
              type: 'select',
              hasMany: true,
              admin: {
                condition: (_, sib) => sib?.serviceType === 'accommodations',
                description: 'Filter subset accommodation types. Kosong = semua.',
              },
              options: [
                { label: 'Villa', value: 'villa' },
                { label: 'Hotel', value: 'hotel' },
                { label: 'Resort', value: 'resort' },
                { label: 'Guesthouse', value: 'guesthouse' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'limit', type: 'number', defaultValue: 24, min: 3, max: 100, admin: { width: '50%', description: 'Max items dari CMS' }},
                { name: 'featuredMode', type: 'select', defaultValue: 'auto', admin: { width: '50%' }, options: [
                  { label: 'Auto (isFeatured first, fallback first)', value: 'auto' },
                  { label: 'None (no featured card)', value: 'none' },
                ]},
              ],
            },
          ],
        },
        {
          label: 'Hero',
          admin: { condition: (_, sib) => sib?.layout === 'hero-immersive' },
          description: 'Hero background media + overlay (Hero Immersive layout only). Supports single image, multiple images with slider transition, or video background.',
          fields: [
            // Drop per-slide fit/position row from imageSlider (slides inherit
            // block-level imageFit/imagePosition). Reason: the auto-generated
            // enum name for `<longest_col>_blocks_service_listing_image_slider_image_position`
            // hit 66+ chars — over the Postgres 63-char identifier limit.
            // NOTE: don't set `dbName` on the array — Payload treats it as the
            // LITERAL global table name (not a prefix), which caused all block
            // instances across collections to share one `slides` table → FK
            // constraint violation on multi-image insert.
            ...mediaFields.map((f: any) => {
              if (f?.type === 'array' && f?.name === 'imageSlider') {
                return {
                  ...f,
                  fields: f.fields.filter((sub: any) =>
                    !(sub?.type === 'row' && Array.isArray(sub?.fields) && sub.fields.some((s: any) => s?.name === 'imageFit'))
                  ),
                }
              }
              return f
            }),
            {
              name: 'heroOverlayOpacity',
              type: 'number',
              defaultValue: 40,
              min: 0,
              max: 100,
              admin: { description: '0–100 dark overlay on top of media for text readability.' },
            },
            {
              name: 'heroMinHeight',
              type: 'select',
              defaultValue: 'md',
              options: [
                { label: 'Small (420px)', value: 'sm' },
                { label: 'Medium (560px)', value: 'md' },
                { label: 'Large (680px)', value: 'lg' },
                { label: 'Full viewport', value: 'full' },
              ],
            },
          ],
        },
        {
          label: 'Filter & Search',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'enableDestinationFilter', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Destination pill tabs (dari CMS Destinations)' }},
                { name: 'enableSearch', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Search bar (name/dates/guests)' }},
              ],
            },
            {
              name: 'searchNamePlaceholder',
              type: 'text',
              defaultValue: 'Where are you staying?',
              admin: { condition: (_, sib) => sib?.enableSearch !== false },
            },
            {
              type: 'row',
              admin: { condition: (_, sib) => sib?.enableSearch !== false },
              fields: [
                { name: 'showDatePicker', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
                { name: 'showGuestCount', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
              ],
            },
            {
              name: 'searchButtonText',
              type: 'text',
              defaultValue: 'Search Collection',
              admin: { condition: (_, sib) => sib?.enableSearch !== false },
            },
          ],
        },
        {
          label: 'Card Style',
          fields: [
            {
              name: 'cardVariant',
              type: 'select',
              defaultValue: 'compact',
              options: [
                { label: 'Compact (default — image + title + price)', value: 'compact' },
                { label: 'Detailed (multi-image, rating, description, amenity badges, Book Now)', value: 'detailed' },
              ],
              admin: { description: 'Detailed variant matches Hero Immersive template but works with any layout.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'showLoadMore', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Enable pagination — show items in batches' } },
                { name: 'paginationType', type: 'select', defaultValue: 'load-more', options: [
                  { label: 'Load More (infinite scroll — reveal next batch)', value: 'load-more' },
                  { label: 'Numbered Pages (1, 2, 3… pagination)', value: 'pages' },
                ], admin: { width: '50%', condition: (_, sib) => sib?.showLoadMore === true } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'loadMoreText', type: 'text', defaultValue: 'Load More', admin: { width: '50%', condition: (_, sib) => sib?.showLoadMore === true && sib?.paginationType !== 'pages' } },
                {
                  name: 'initialVisibleCount',
                  type: 'number',
                  label: 'Initial Visible Count (Desktop)',
                  defaultValue: 6,
                  min: 3,
                  max: 60,
                  admin: {
                    width: '50%',
                    condition: (_, sib) => sib?.showLoadMore === true,
                    description: 'Items per page / per batch pada layar Desktop (≥1024px)',
                  },
                },
              ],
            },
            // Phase 4.53 — per-breakpoint pagination counts. Sebelumnya cuma
            // 1 nilai (`initialVisibleCount`) yang dipakai global untuk semua
            // ukuran layar. Sekarang tablet & mobile bisa dikonfigurasi
            // terpisah, tanpa hardcode di komponen.
            {
              type: 'row',
              admin: { condition: (_, sib) => sib?.showLoadMore === true },
              fields: [
                {
                  name: 'initialVisibleCountTablet',
                  type: 'number',
                  label: 'Initial Visible Count (Tablet)',
                  defaultValue: 4,
                  min: 1,
                  max: 60,
                  admin: {
                    width: '50%',
                    description: 'Items per page / per batch pada Tablet (640–1023px). Kosongkan → pakai nilai Desktop.',
                  },
                },
                {
                  name: 'initialVisibleCountMobile',
                  type: 'number',
                  label: 'Initial Visible Count (Mobile)',
                  defaultValue: 3,
                  min: 1,
                  max: 60,
                  admin: {
                    width: '50%',
                    description: 'Items per page / per batch pada Mobile (<640px). Kosongkan → pakai nilai Desktop.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['eyebrow', 'heading', 'description'] }),
        },
      ],
    },
  ],
}

// ── TrustBadges (Phase 3.7 — concierge/trust section block) ───────
// 2-col: text (heading+desc+2 buttons) + badge grid (2-8 items).
const TrustBadges: Block = {
  slug: 'trustBadges',
  labels: { singular: 'Trust Badges', plural: 'Trust Badges' },
  admin: { group: 'Marketing', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', required: true, defaultValue: 'Bespoke Concierge Service' },
            { name: 'description', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'primaryButtonText', type: 'text', admin: { width: '50%' } },
                { name: 'primaryButtonLink', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'secondaryButtonText', type: 'text', admin: { width: '50%' } },
                { name: 'secondaryButtonLink', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'badges',
              type: 'array',
              required: true,
              minRows: 2,
              maxRows: 8,
              admin: { description: '2-8 trust badges (grid 2-col otomatis)' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    iconField({ name: 'iconName', required: true, admin: { width: '40%' } }),
                    { name: 'title', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading', 'description'] }),
        },
      ],
    },
  ],
}

// ── Blog blocks (Phase 4.35) ────────────────────────────────────
// PostList     — grid of latest / filtered posts.
// FeaturedPost — 1 large card (2-col span) + 3 small cards.
// CategoryGrid — tile grid keyed by Categories.module.
// PopularPosts — analytics-driven ranking with isFeatured fallback.
// AdSlot       — manual ad slot (AdSense or custom HTML).

const PostList: Block = {
  slug: 'postList',
  labels: { singular: 'Post List', plural: 'Post Lists' },
  admin: { group: 'Blog', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Latest Stories' },
            { name: 'description', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'limit', type: 'number', defaultValue: 6, min: 1, max: 24, admin: { width: '33%' } },
                { name: 'featuredOnly', type: 'checkbox', defaultValue: false, admin: { width: '33%' } },
                { name: 'columns', type: 'select', defaultValue: '3', options: [
                  { label: '2 columns', value: '2' },
                  { label: '3 columns', value: '3' },
                  { label: '4 columns', value: '4' },
                ], admin: { width: '34%' } },
              ],
            },
            {
              name: 'filterCategory',
              type: 'relationship',
              relationTo: 'blog-categories',
              admin: { description: 'Filter by kategori tertentu (opsional).' },
            },
            {
              type: 'collapsible',
              label: 'View All Button',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'showViewAll', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
                    { name: 'viewAllText', type: 'text', defaultValue: 'View All Articles', admin: { width: '35%' } },
                    { name: 'viewAllLink', type: 'text', defaultValue: '/blog', admin: { width: '35%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading', 'description'] }),
        },
      ],
    },
  ],
}

const FeaturedPost: Block = {
  slug: 'featuredPost',
  labels: { singular: 'Featured Post', plural: 'Featured Posts' },
  admin: { group: 'Blog', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Popular Posts' },
            {
              name: 'selectionMode',
              type: 'select',
              defaultValue: 'auto',
              options: [
                { label: 'Auto (isFeatured + latest — 1 large + 3 small)', value: 'auto' },
                { label: 'Manual (pick specific posts)', value: 'manual' },
              ],
            },
            {
              name: 'featuredPost',
              type: 'relationship',
              relationTo: 'posts',
              admin: {
                condition: (_, sib) => sib?.selectionMode === 'manual',
                description: 'Post besar (kolom 2-span).',
              },
            },
            {
              name: 'sidePosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              maxRows: 3,
              admin: {
                condition: (_, sib) => sib?.selectionMode === 'manual',
                description: 'Post kecil (3 kartu di kanan).',
              },
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading'] }),
        },
      ],
    },
  ],
}

const CategoryGrid: Block = {
  slug: 'categoryGrid',
  labels: { singular: 'Category Grid', plural: 'Category Grids' },
  admin: { group: 'Blog', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Explore by Category' },
            {
              name: 'module',
              type: 'select',
              defaultValue: 'blog',
              options: [
                { label: 'Blog', value: 'blog' },
                { label: 'Tours', value: 'tours' },
                { label: 'Accommodations', value: 'accommodations' },
                { label: 'Water Activities', value: 'water-activities' },
                { label: 'Yachts', value: 'yachts' },
                { label: 'Restaurants', value: 'restaurants' },
                { label: 'Weddings & Events', value: 'venues' },
                { label: 'Rentals', value: 'rentals' },
                { label: 'Spa & Wellness', value: 'spa' },
                { label: 'Ferry Tickets', value: 'ferry-tickets' },
              ],
              admin: { description: 'Kategori dari modul mana yang ditampilkan.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'limit', type: 'number', defaultValue: 6, min: 2, max: 12, admin: { width: '50%' } },
                { name: 'columns', type: 'select', defaultValue: '3', options: [
                  { label: '2 columns', value: '2' },
                  { label: '3 columns', value: '3' },
                  { label: '4 columns', value: '4' },
                  { label: '6 columns', value: '6' },
                ], admin: { width: '50%' } },
              ],
            },
            { name: 'showCount', type: 'checkbox', defaultValue: true, admin: { description: 'Tampilkan jumlah artikel per kategori.' } },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading'] }),
        },
      ],
    },
  ],
}

const PopularPosts: Block = {
  slug: 'popularPosts',
  labels: { singular: 'Popular Posts', plural: 'Popular Posts' },
  admin: { group: 'Blog', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Popular Posts' },
            {
              type: 'row',
              fields: [
                { name: 'limit', type: 'number', defaultValue: 5, min: 3, max: 10, admin: { width: '50%' } },
                { name: 'variant', type: 'select', defaultValue: 'sidebar', options: [
                  { label: 'Sidebar (compact list)', value: 'sidebar' },
                  { label: 'Grid (cards)', value: 'grid' },
                ], admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'daysWindow', type: 'number', defaultValue: 30, min: 7, max: 365, admin: { width: '50%', description: 'Rentang hari untuk hitung view. Default: 30 hari.' } },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading'] }),
        },
      ],
    },
  ],
}

const AdSlot: Block = {
  slug: 'adSlot',
  labels: { singular: 'Ad Slot', plural: 'Ad Slots' },
  admin: { group: 'Marketing', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'slotName', type: 'text', required: true, admin: { description: 'Nama internal (mis: "sidebar-300x600", "mid-article"). Bukan dipakai di frontend, cuma untuk admin.' } },
            {
              name: 'size',
              type: 'select',
              required: true,
              defaultValue: '300x600',
              options: [
                { label: '300 × 600 (Half Page, sidebar)', value: '300x600' },
                { label: '300 × 250 (Medium Rectangle)', value: '300x250' },
                { label: '728 × 90 (Leaderboard)', value: '728x90' },
                { label: '336 × 280 (Large Rectangle)', value: '336x280' },
                { label: 'Responsive (fills parent)', value: 'responsive' },
              ],
            },
            {
              name: 'provider',
              type: 'select',
              defaultValue: 'adsense',
              options: [
                { label: 'Google AdSense', value: 'adsense' },
                { label: 'Custom HTML (super-admin only)', value: 'custom' },
              ],
            },
            {
              name: 'adsenseClient',
              type: 'text',
              admin: {
                condition: (_, sib) => sib?.provider === 'adsense',
                description: 'AdSense publisher ID (contoh: ca-pub-XXXXXXXXXXXXXXXX).',
              },
            },
            {
              name: 'adsenseSlotId',
              type: 'text',
              admin: {
                condition: (_, sib) => sib?.provider === 'adsense',
                description: 'Ad unit slot ID dari dashboard AdSense.',
              },
            },
            {
              name: 'customHtml',
              type: 'textarea',
              access: { update: superAdminFieldAccess },
              admin: {
                condition: (_, sib) => sib?.provider === 'custom',
                description: 'Raw HTML / script tag. HANYA Super Admin. Tampil apa adanya di halaman.',
              },
            },
            {
              name: 'placement',
              type: 'select',
              defaultValue: 'inline',
              options: [
                { label: 'Sidebar', value: 'sidebar' },
                { label: 'Inline (mid-article)', value: 'inline' },
                { label: 'Bottom (after content)', value: 'bottom' },
              ],
              admin: { description: 'Label posisi. Aktual placement mengikuti dimana editor menaruh block-nya.' },
            },
          ],
        },
      ],
    },
  ],
}

// ── Newsletter (Phase 4.35.2) ────────────────────────────────────
// Inline email-capture section that reuses the /api/newsletter-subscribe
// endpoint (Phase 4.33). Editor can drop it anywhere in Page.content
// or a service's additionalBlocks. Same submit contract, honeypot, and
// rate limit as the footer NewsletterSignup — but independent content
// (heading/description/etc live on the block, not global).

const Newsletter: Block = {
  slug: 'newsletter',
  labels: { singular: 'Newsletter Signup', plural: 'Newsletter Signups' },
  admin: { group: 'Marketing', components: BLOCK_LABEL },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', required: true, defaultValue: 'Never Miss a Story' },
            {
              name: 'description',
              type: 'textarea',
              defaultValue: 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
            },
            {
              type: 'row',
              fields: [
                { name: 'placeholderText', type: 'text', defaultValue: 'Your email address', admin: { width: '50%' } },
                { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'successMessage', type: 'text', defaultValue: "Thanks! We'll be in touch.", admin: { width: '50%' } },
                { name: 'errorMessage', type: 'text', defaultValue: 'Something went wrong. Please try again.', admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Appearance',
          fields: [
            {
              name: 'theme',
              type: 'select',
              defaultValue: 'sand',
              options: [
                { label: 'Sand — matches page background (seamless)', value: 'sand' },
                { label: 'Ocean — dark section, light text', value: 'ocean' },
                { label: 'Leaf — green accent', value: 'leaf' },
                { label: 'White — elevated card look', value: 'white' },
              ],
              admin: { description: 'Palette dari site tokens. Sand = seamless dengan body.' },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'stacked',
              options: [
                { label: 'Stacked (title left, form right — for wide sections)', value: 'stacked' },
                { label: 'Centered (title+form stacked in middle — for narrow / dedicated)', value: 'centered' },
              ],
              admin: { description: 'Layout dalam section. Stacked = 2-column match reference. Centered = single-column.' },
            },
          ],
        },
        {
          label: 'Advanced',
          fields: advancedStyleFieldsNoButton({ textElements: ['heading', 'description'] }),
        },
      ],
    },
  ],
}

export const blocks: Block[] = [
  Hero, RichText, ImageBlock, Gallery, CTA, FAQ,
  Testimonials, ServiceGrid, Contact, Embed, Spacer,
  ValuePropsBanner, StatsBanner, TestimonialsCarousel,
  ServiceListing, TrustBadges,
  PostList, FeaturedPost, CategoryGrid, PopularPosts, AdSlot,
  Newsletter,
]
