import type { CollectionConfig } from 'payload'
import { authenticatedRead, isAdmin } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4'],
    // Phase 4.59 BUG #1 addendum — hide imageSize sub-fields (url/width/
    // height/mimeType/filesize/filename per size × 3 sizes = 18 entries)
    // dari Column Selector Payload. Tanpa ini, tiap sub-field ke-expose
    // sebagai kolom, meng-inflate query `columns=` di URL jadi 400+ chars,
    // dan user bisa tak sengaja toggle-off kolom yang salah.
    imageSizes: [
      {
        name: 'thumbnail', width: 400, height: 300, position: 'centre',
        admin: { disableListColumn: true, disableListFilter: true, disableGroupBy: true },
      },
      {
        name: 'card', width: 800, height: 600, position: 'centre',
        admin: { disableListColumn: true, disableListFilter: true, disableGroupBy: true },
      },
      {
        name: 'hero', width: 1920, height: 1080, position: 'centre',
        admin: { disableListColumn: true, disableListFilter: true, disableGroupBy: true },
      },
    ],
    // Phase 4.59 — explicitly point Payload's admin thumbnail resolver to
    // our `thumbnail` size (400×300). Without this, `doc.thumbnailURL`
    // resolves to undefined and Payload's FileCell fallback to
    // `getBestFitFromSizes` — while that eventually picks thumbnail, an
    // empty `thumbnailURL` also breaks other admin surfaces (upload edit
    // drawer, related-doc previews) that expect it populated.
    adminThumbnail: 'thumbnail',
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Site Builder',
    // Phase 4.59 — minimal defaults. `thumbnail` (UI field below, Cell =
    // MediaThumbnailCell) selalu paling depan supaya S/M/L grid CSS punya
    // hook konsisten. Sub-field imageSizes.* di-hide dari picker via
    // `admin.disableListColumn: true` di setiap size — mencegah URL bloat.
    defaultColumns: ['thumbnail', 'filename', 'alt', 'updatedAt'],
    listSearchableFields: ['alt', 'caption', 'filename'],
  },
  access: {
    read: () => true, // Public — images need to be accessible
    create: authenticatedRead,
    update: authenticatedRead,
    delete: isAdmin,
  },
  fields: [
    // Phase 4.59 — dedicated thumbnail column. UI-only (no DB). Cell
    // component render `<img src={rowData.thumbnailURL || rowData.url}>`
    // langsung, tanpa lifecycle state React Payload yang tak reliable.
    {
      name: 'thumbnail',
      type: 'ui',
      label: 'Preview',
      admin: {
        components: {
          Cell: '/admin/MediaThumbnailCell#default',
        },
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Describe the image for accessibility and SEO (max ~125 chars for screen readers).',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Short caption shown under the image in galleries / lightboxes.',
      },
    },
    // ── Phase 4.59 addendum (2026-09-22) — media library enhancement ─────
    // Field baru untuk organisasi, licensing, dan cross-link ke service.
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      maxLength: 500,
      admin: {
        description: 'Longer descriptive text for gallery detail / lightbox context. Max 500 characters.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'Hero image', value: 'hero' },
        { label: 'Gallery photo', value: 'gallery' },
        { label: 'Thumbnail / preview', value: 'thumbnail' },
        { label: 'Icon / logo', value: 'icon' },
        { label: 'Testimonial photo', value: 'testimonial' },
        { label: 'Background / decorative', value: 'background' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'High-level classification. Helps content editors filter media library.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: 'Tags',
      admin: {
        description: 'Free-form keywords for search + organization. Examples: beach, sunset, villa-interior, wedding-decor, food.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Photo Credit',
      admin: {
        description: 'Attribution shown near the image (photographer name, watermark text, etc.).',
      },
    },
    {
      name: 'license',
      type: 'select',
      label: 'License / Usage Rights',
      defaultValue: 'unknown',
      options: [
        { label: 'Own — created by us or an employee', value: 'own' },
        { label: 'Stock licensed — paid stock (Shutterstock, Getty, Adobe Stock, etc.)', value: 'stock-licensed' },
        { label: 'Creative Commons — attribution required', value: 'cc-attribution' },
        { label: 'Client provided — supplied by property owner / partner', value: 'client-provided' },
        { label: 'Photographer contract — commissioned shoot', value: 'photographer-contract' },
        { label: 'Unknown / to be verified', value: 'unknown' },
      ],
      admin: {
        description: 'Legal usage rights. Pair with Photo Credit for audit trail; helps avoid copyright disputes.',
      },
    },
    {
      name: 'relatedDestination',
      type: 'relationship',
      relationTo: 'destinations',
      label: 'Related Destination',
      admin: {
        description: 'Optional — the location this photo was taken (Ubud, Seminyak, Nusa Penida, etc.).',
      },
    },
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: [
        'tours',
        'accommodations',
        'water-activities',
        'yachts',
        'restaurants',
        'venues',
        'rentals',
        'spa',
        'ferry-tickets',
      ],
      label: 'Related Service',
      admin: {
        description: 'Optional — link to specific service this photo belongs to (a villa, tour package, restaurant, etc.).',
      },
    },
  ],
}
