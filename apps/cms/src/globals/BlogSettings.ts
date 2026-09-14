import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'
import { adminFieldAccess } from '../access/roles'

/**
 * Blog Settings — rich configuration for the Blog vertical.
 *
 * Placement rationale (see docs/phases/phase-4.35-...):
 *   - SiteSettings = brand + layout tokens (org-wide)
 *   - SiteFeatures = on/off toggles only (kill switches)
 *   - BlogSettings = editorial defaults for the blog domain
 *
 * Tabs:
 *   1. Related Posts — controls the "You Might Also Like" section
 *      that renders at the bottom of every blog post detail page.
 *      Per-post overrides live on the Posts collection sidebar
 *      (see collections/Posts.ts → relatedOverride group).
 *   2. Sidebar — which widgets appear in the blog detail sidebar
 *      and per-widget config (Popular Posts, Ad Slot, Categories,
 *      Newsletter).
 *
 * Access:
 *   - read: public (frontend needs to fetch without auth).
 *   - update: admin+ (structural editorial defaults — beyond editor scope).
 */

export const SELECTION_MODE_OPTIONS = [
  { label: 'Same Category → latest fallback (recommended)', value: 'same-category' },
  { label: 'Same Tags (any matching tag)', value: 'same-tags' },
  { label: 'Same Author', value: 'same-author' },
  { label: 'Latest (any post)', value: 'latest' },
  { label: 'Manual only (use per-post picks; hide section if none)', value: 'manual' },
] as const

export const CARD_VARIANT_OPTIONS = [
  { label: 'Compact — image on top, title + date', value: 'compact' },
  { label: 'Detailed — image + category + title + excerpt + meta + "Read →"', value: 'detailed' },
  { label: 'Horizontal — image left, text right', value: 'horizontal' },
] as const

export const BlogSettings: GlobalConfig = {
  slug: 'blog-settings',
  label: 'Blog Settings',
  admin: {
    group: 'Settings',
    description: 'Editorial defaults untuk blog: Related Posts section + Sidebar widgets. Per-post override tersedia di sidebar Posts.',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user && ['admin', 'super-admin'].includes(user.role),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ══ Tab 1: Related Posts ══════════════════════════════════════════
        {
          label: 'Related Posts',
          description: 'Section "You Might Also Like" di bawah setiap article. Editor bisa override per-post di sidebar Posts.',
          fields: [
            {
              name: 'relatedPosts',
              type: 'group',
              label: 'Related Posts Section',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable Related Posts section',
                  defaultValue: true,
                  admin: { description: 'Off = section-nya tidak tampil di semua post (kecuali override per-post nyalakan).' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'heading', type: 'text', defaultValue: 'You Might Also Like', admin: { width: '50%' } },
                    { name: 'subtitle', type: 'text', defaultValue: 'Continue your journey with more insights from our travel editors.', admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'selectionMode',
                      type: 'select',
                      defaultValue: 'same-category',
                      options: [...SELECTION_MODE_OPTIONS],
                      admin: { width: '50%', description: 'Bagaimana related posts dipilih.' },
                    },
                    { name: 'limit', type: 'number', min: 1, max: 6, defaultValue: 3, admin: { width: '25%', description: 'Jumlah max post.' } },
                    {
                      name: 'columns',
                      type: 'select',
                      defaultValue: '3',
                      options: [
                        { label: '2 columns', value: '2' },
                        { label: '3 columns', value: '3' },
                        { label: '4 columns', value: '4' },
                      ],
                      admin: { width: '25%' },
                    },
                  ],
                },
                {
                  name: 'cardVariant',
                  type: 'select',
                  defaultValue: 'compact',
                  options: [...CARD_VARIANT_OPTIONS],
                  admin: { description: 'Preset tampilan kartu. Ganti tanpa mengubah data post.' },
                },
                {
                  type: 'collapsible',
                  label: 'Card content — what to show on each card',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'showCategory', type: 'checkbox', defaultValue: true, admin: { width: '25%', description: 'Category chip' } },
                        { name: 'showExcerpt', type: 'checkbox', defaultValue: true, admin: { width: '25%', description: 'Excerpt (2-3 baris)' } },
                        { name: 'showDate', type: 'checkbox', defaultValue: true, admin: { width: '25%', description: 'Tanggal publish' } },
                        { name: 'showReadingTime', type: 'checkbox', defaultValue: false, admin: { width: '25%', description: 'X min read' } },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'View All button',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'showViewAll', type: 'checkbox', defaultValue: true, admin: { width: '30%', description: 'Tampilkan tombol?' } },
                        { name: 'viewAllText', type: 'text', defaultValue: 'View All Articles', admin: { width: '35%' } },
                        { name: 'viewAllLink', type: 'text', defaultValue: '/blog', admin: { width: '35%' } },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Section styling',
                  admin: { initCollapsed: true, description: 'Warna background + padding. Struktural — Super Admin only.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'background',
                          type: 'select',
                          defaultValue: 'sand',
                          options: [
                            { label: 'Sand — matches page background (seamless, recommended)', value: 'sand' },
                            { label: 'Sand light — very subtle warm contrast', value: 'sand-light' },
                            { label: 'White — elevated card look', value: 'white' },
                            { label: 'Ocean tint — subtle blue wash', value: 'ocean-tint' },
                            { label: 'Ocean — dark section, light text', value: 'ocean' },
                            { label: 'Transparent — inherit from parent', value: 'transparent' },
                          ],
                          admin: {
                            width: '50%',
                            description: 'Warna diambil dari palette site (sand/ocean). "Sand" = seamless dengan body page.',
                          },
                          access: { update: adminFieldAccess },
                        },
                        {
                          name: 'padding',
                          type: 'select',
                          defaultValue: 'md',
                          options: [
                            { label: 'Small', value: 'sm' },
                            { label: 'Medium (default)', value: 'md' },
                            { label: 'Large', value: 'lg' },
                          ],
                          admin: { width: '50%' },
                          access: { update: adminFieldAccess },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ══ Tab 2: Sidebar ════════════════════════════════════════════════
        {
          label: 'Sidebar',
          description: 'Widget di sidebar blog detail page. Order top-down: Popular Posts → Ad Slot → Categories → Newsletter.',
          fields: [
            {
              name: 'sidebar',
              type: 'group',
              label: 'Blog Sidebar Widgets',
              fields: [
                {
                  type: 'collapsible',
                  label: 'Popular Posts widget',
                  admin: { initCollapsed: false },
                  fields: [
                    { name: 'showPopularPosts', type: 'checkbox', defaultValue: true, label: 'Show Popular Posts' },
                    {
                      type: 'row',
                      admin: { condition: (_, sib) => sib?.showPopularPosts !== false },
                      fields: [
                        { name: 'popularPostsHeading', type: 'text', defaultValue: 'Popular Posts', admin: { width: '60%' } },
                        { name: 'popularPostsLimit', type: 'number', min: 3, max: 10, defaultValue: 5, admin: { width: '40%', description: 'Jumlah item (3-10)' } },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Ad Slot (300 × 600)',
                  admin: { initCollapsed: false, description: 'Placeholder di antara Popular Posts dan Categories. Aktif hanya jika SiteFeatures → Enable Ad Slots ON.' },
                  fields: [
                    { name: 'showAdSlot', type: 'checkbox', defaultValue: true, label: 'Show Ad Slot placeholder in sidebar' },
                    {
                      name: 'adSlotPosition',
                      type: 'select',
                      defaultValue: 'between',
                      options: [
                        { label: 'Between Popular Posts and Categories (recommended)', value: 'between' },
                        { label: 'Above Popular Posts', value: 'top' },
                        { label: 'Below Categories', value: 'bottom' },
                      ],
                      admin: { condition: (_, sib) => sib?.showAdSlot !== false },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Categories widget',
                  admin: { initCollapsed: false },
                  fields: [
                    { name: 'showCategories', type: 'checkbox', defaultValue: true, label: 'Show Categories tag cloud' },
                    {
                      type: 'row',
                      admin: { condition: (_, sib) => sib?.showCategories !== false },
                      fields: [
                        { name: 'categoriesHeading', type: 'text', defaultValue: 'Categories', admin: { width: '60%' } },
                        { name: 'categoriesLimit', type: 'number', min: 3, max: 30, defaultValue: 12, admin: { width: '40%', description: 'Jumlah tag ditampilkan' } },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Newsletter widget',
                  admin: { initCollapsed: true, description: 'Kotak signup email di sidebar. Content newsletter (heading/text/submit) tetap dari Footer Settings → Newsletter.' },
                  fields: [
                    { name: 'showNewsletter', type: 'checkbox', defaultValue: false, label: 'Show Newsletter signup in sidebar' },
                    {
                      name: 'newsletterHeading',
                      type: 'text',
                      defaultValue: 'Stay Inspired',
                      admin: { condition: (_, sib) => sib?.showNewsletter === true, description: 'Override heading (kosong = pakai dari Footer Settings)' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
