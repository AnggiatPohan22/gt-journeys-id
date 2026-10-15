import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

/**
 * Menus — collection untuk navigasi (Header, Footer columns, dst.).
 *
 * UX improvements (Phase 3.12):
 * - RowLabel components → item tampil sebagai "📄 Home — /" bukan "Item 01"
 * - `initCollapsed: true` → panel default rapi, expand per item saat butuh
 * - Sub-menu (children) sekarang punya `type` sama dgn parent (page/custom/anchor/none)
 *
 * Backward compat: children legacy hanya punya `label + url + target`.
 * `type` default `custom_url` — behavior identik dgn sebelumnya (url string).
 */
export const Menus: CollectionConfig = {
  slug: 'menus',
  admin: {
    useAsTitle: 'name',
    group: 'Content & Pages',
    defaultColumns: ['name', 'slug', 'status', 'updatedAtRelative'],
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, create: isSuperAdmin, update: isSuperAdmin, delete: isSuperAdmin },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "Main Navigation", "Footer Links"' } },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'items',
      type: 'array',
      label: 'Menu Items',
      admin: {
        initCollapsed: true,
        // Phase 4.13 — marker so `admin/menu-editor.css` can style
        // ONLY this collection's array (main + nested children).
        className: 'dnj-menu-editor',
        components: {
          RowLabel: '/components/MenuItemRowLabel#MenuItemRowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
            {
              name: 'type', type: 'select', required: true, defaultValue: 'custom_url',
              admin: { width: '50%' },
              options: [
                { label: '📄 Halaman Internal', value: 'page' },
                { label: '🧭 Service Index', value: 'service_index' },
                { label: '🔗 Custom URL', value: 'custom_url' },
                { label: '⚓ Anchor (#section)', value: 'anchor' },
                { label: '🏷️ Dropdown Only (no link, hover trigger)', value: 'none' },
              ],
            },
          ],
        },
        { name: 'page', type: 'relationship', relationTo: 'pages', admin: { condition: (_, siblingData) => siblingData?.type === 'page' } },
        { name: 'url', type: 'text', admin: { condition: (_, siblingData) => ['custom_url', 'service_index', 'anchor'].includes(siblingData?.type), description: 'URL lengkap, path (/tours), atau anchor (#contact).' } },
        {
          name: 'target', type: 'select', defaultValue: '_self',
          admin: { condition: (_, siblingData) => siblingData?.type !== 'none' },
          options: [{ label: 'Same Tab', value: '_self' }, { label: 'New Tab', value: '_blank' }],
        },
        {
          name: 'children',
          type: 'array',
          label: 'Sub-menu',
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '/components/MenuChildRowLabel#MenuChildRowLabel',
            },
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                {
                  name: 'type', type: 'select', required: true, defaultValue: 'custom_url',
                  admin: { width: '50%' },
                  options: [
                    { label: '📄 Halaman Internal', value: 'page' },
                    { label: '🔗 Custom URL', value: 'custom_url' },
                    { label: '⚓ Anchor (#section)', value: 'anchor' },
                    { label: '🏷️ Label Only (no link)', value: 'none' },
                  ],
                },
              ],
            },
            { name: 'page', type: 'relationship', relationTo: 'pages', admin: { condition: (_, siblingData) => siblingData?.type === 'page' } },
            { name: 'url', type: 'text', admin: { condition: (_, siblingData) => ['custom_url', 'anchor'].includes(siblingData?.type), description: 'URL lengkap, path, atau anchor (#section).' } },
            {
              name: 'target', type: 'select', defaultValue: '_self',
              admin: { condition: (_, siblingData) => siblingData?.type !== 'none' },
              options: [{ label: 'Same Tab', value: '_self' }, { label: 'New Tab', value: '_blank' }],
            },
          ],
        },
      ],
    },
    withStatusCell({ name: 'status', type: 'select', defaultValue: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }], admin: { position: 'sidebar' } }),
    updatedAtRelativeField,
  ],
}
