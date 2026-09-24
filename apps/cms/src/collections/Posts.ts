import type { CollectionConfig } from 'payload'
import { authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { assignMediaFolder } from '../hooks/assignMediaFolder'
import { seoFields } from '../fields/seo'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { blocks } from '../blocks'
import { SELECTION_MODE_OPTIONS } from '../globals/BlogSettings'

// Phase 4.35.3 — Categories split into Content-level (services)
// vs. Posts-level (blog). Posts now relates to `blog-categories` and
// `tags` — separate editor-owned taxonomies under the POSTS admin
// group. See phase-4.35 report §4.35.3 addendum.

// ── Posts (Blog) ──────────────────────────────────────────────
// Blog article collection. Editor role CAN create (unlike Pages /
// service collections) — matches the requirement that the client
// writes their own articles. Structural fields (additionalBlocks)
// remain superadmin-only to prevent accidental block injection.
//
// SEO/GEO/AEO first-class: publishedAt + author + featuredImage
// power BlogPosting JSON-LD (see apps/web/src/lib/structuredData.ts
// blogPostingSchema). Reading-time is manual for now — auto-compute
// from body word count is a follow-up.

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: { afterChange: [assignMediaFolder('posts')] },
  admin: {
    useAsTitle: 'title',
    group: 'Posts',
    defaultColumns: ['title', 'category', 'author', 'status', 'isFeatured', 'publishedAt', 'updatedAtRelative'],
    listSearchableFields: ['title', 'slug', 'excerpt'],
    preview: makePreview('/blog'),
  },
  access: {
    read: () => true,
    create: authenticatedUpdate,   // Editors CAN create articles
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    sidebarTabsField,
    withSidebarTab(
      { name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar', description: 'Auto dari title. URL: /blog/<slug>.' } },
      'general',
    ),
    withSidebarTab(
      { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, description: 'Tanggal publikasi (dipakai untuk sort + JSON-LD datePublished).' } },
      'general',
    ),
    withSidebarTab(
      { name: 'author', type: 'relationship', relationTo: 'authors', required: true, admin: { position: 'sidebar', description: 'Penulis artikel.' } },
      'general',
    ),
    withSidebarTab(
      { name: 'readingTimeMinutes', type: 'number', min: 1, max: 120, admin: { position: 'sidebar', description: 'Perkiraan waktu baca (menit). Contoh: 5 → "5 min read".' } },
      'general',
    ),
    withSidebarTab(isFeaturedField, 'status'),
    // ── Per-post Related Posts override (sidebar / general tab) ──
    // Defaults live in Blog Settings global. Editor may override per
    // post — checkbox reveals compact override group. Manual picks
    // live here (not in global) so per-post choices don't cross-pollute.
    withSidebarTab(
      {
        name: 'relatedOverride',
        type: 'group',
        label: 'Related Posts (override)',
        admin: { position: 'sidebar', description: 'Kosongkan = pakai default dari Blog Settings.' },
        fields: [
          {
            name: 'enabled',
            type: 'checkbox',
            defaultValue: false,
            label: 'Override defaults for this post',
          },
          {
            name: 'heading',
            type: 'text',
            admin: {
              condition: (_, sib) => sib?.enabled === true,
              description: 'Kosong = pakai heading dari Blog Settings.',
            },
          },
          {
            name: 'selectionMode',
            type: 'select',
            options: [...SELECTION_MODE_OPTIONS],
            admin: {
              condition: (_, sib) => sib?.enabled === true,
              description: 'Kosong = pakai mode dari Blog Settings.',
            },
          },
          {
            name: 'limit',
            type: 'number',
            min: 1,
            max: 6,
            admin: {
              condition: (_, sib) => sib?.enabled === true,
              description: 'Kosong = pakai limit dari Blog Settings.',
            },
          },
          {
            name: 'manualPosts',
            type: 'relationship',
            relationTo: 'posts',
            hasMany: true,
            admin: {
              condition: (_, sib) => sib?.enabled === true && sib?.selectionMode === 'manual',
              description: 'Pilih post spesifik. Urutan dipertahankan.',
            },
          },
        ],
      },
      'general',
    ),
    updatedAtRelativeField,
    {
      type: 'tabs',
      tabs: [
        // ── 1. Overview ─────────────────────────
        {
          label: 'Overview',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              maxLength: 240,
              admin: { description: 'Ringkasan singkat (max 240 char). Dipakai di kartu listing, meta description default, dan RSS.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'blog-categories',
                  required: true,
                  admin: { width: '50%', description: 'Kategori utama (dari Blog Categories).' },
                },
                {
                  name: 'tags',
                  type: 'relationship',
                  relationTo: 'tags',
                  hasMany: true,
                  admin: { width: '50%', description: 'Tag tambahan (opsional) — dari collection Tags.' },
                },
              ],
            },
          ],
        },
        // ── 2. Media ────────────────────────────
        {
          label: 'Media',
          fields: [
            { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Hero image artikel + OG image default.' } },
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
                description: 'Gambar tambahan (max 10). Bulk upload di atas mem-pick banyak file sekaligus. Grid: ← → reorder, ✎ edit/ganti (drawer Payload), 🗑 hapus. Bisa dirujuk di body via UploadFeature.',
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
        // ── 3. Body ─────────────────────────────
        {
          label: 'Body',
          fields: [
            {
              name: 'body',
              type: 'richText',
              required: true,
              admin: { description: 'Isi artikel. Dukungan: heading (h2-h4), paragraph, list, blockquote, link, image, code.' },
            },
          ],
        },
        // ── 4. Custom Blocks (SA-only) ──────────
        {
          label: 'Custom Blocks',
          description: 'Block tambahan (CTA, AdSlot, Embed, dll) yang dirender setelah body. Super Admin only.',
          fields: [
            {
              name: 'additionalBlocks',
              type: 'blocks',
              label: 'Additional Blocks',
              access: { update: superAdminFieldAccess },
              blocks,
              admin: { description: 'Dirender setelah article body, sebelum related posts.' },
            },
          ],
        },
      ],
    },
    withSidebarTab(seoFields, 'seo'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField, 'status'),
  ],
}
