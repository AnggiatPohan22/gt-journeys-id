import type { GlobalConfig } from 'payload'
import { isAdmin, superAdminFieldAccess } from '../access/roles'
import { toSelectOptions, defaultTemplateId, templateSupports } from '../../../../packages/shared/src/template-registry'
import { colorPickerField } from '../fields/colorPicker'

/**
 * Footer Settings — Phase 3.24 Template System + Phase 4.43 Advanced Theming.
 *
 * Struktur tab (Phase 4.43, mirror Header 4.41/4.42):
 *   1. General          — template + placeholder behavior (kalau nanti ada).
 *   2. Content          — brand column, columns, services, contact, newsletter, legal, bottom bar.
 *   3. Advanced (SA)    — warna footer override (bg / text / muted / link hover / heading / divider).
 *                         Layout theme (Multi-column/Simple/Minimal) tetap fixed.
 *   4. Import/Export    — snapshot JSON portable.
 */
const supports = (slot: Parameters<typeof templateSupports>[1]) => (data: any) =>
  templateSupports(data?.template, slot)

// Payload v3 runtime mengirim `{ user }` sebagai arg ketiga ke `admin.condition`;
// Condition type resmi hanya `(data, siblingData) => boolean` → cast `any`.
const isSuperAdminUI: any = (_data: any, _sib: any, ctx?: { user?: { role?: string } | null }) =>
  ctx?.user?.role === 'super-admin'

const saAccess = { update: superAdminFieldAccess }

export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  label: 'Footer Settings',
  admin: {
    group: 'Appearance',
    description: 'Layout Footer, konten, dan warna aksesorial. Tab "Advanced" khusus Super Admin.',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ══ Tab 1: General ═══════════════════════════════════════════
        {
          label: 'General',
          description: 'Pilih layout Footer.',
          fields: [
            {
              name: 'template',
              type: 'select',
              required: true,
              defaultValue: defaultTemplateId('footer'),
              options: toSelectOptions('footer'),
              access: saAccess,
              admin: {
                description: 'Layout Footer. Hanya Super Admin. Slot content di tab Content menyesuaikan template.',
                components: { Field: '/components/TemplatePickerField#TemplatePickerField' },
                custom: { templateKind: 'footer' },
              },
            },
          ],
        },

        // ══ Tab 2: Content ══════════════════════════════════════════
        {
          label: 'Content',
          description: 'Kolom brand, menu, services, contact, newsletter, legal, bottom bar. Field muncul dinamis sesuai template.',
          fields: [
            {
              type: 'collapsible',
              label: 'Brand Column',
              admin: { condition: supports('logo'), description: 'Logo, tagline, social. Data dari SiteSettings.', initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'showBrandColumn', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Tampilkan kolom brand?' } },
                    { name: 'brandTaglineOverride', type: 'text', admin: { width: '50%', description: 'Override tagline footer (kosong = SiteSettings.tagline)' } },
                  ],
                },
              ],
            },
            {
              name: 'showSocialLinks',
              type: 'checkbox',
              defaultValue: true,
              admin: { condition: supports('socialLinks'), description: 'Tampilkan ikon social (dari SiteSettings).' },
            },
            {
              name: 'columns',
              type: 'array',
              label: 'Menu Columns',
              minRows: 0,
              maxRows: 4,
              admin: { condition: supports('columns'), description: 'Kolom menu editorial (mis: Quick Links, Company).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'columnLabel', type: 'text', required: true, admin: { width: '40%', description: 'Mis: "Quick Links"' } },
                    { name: 'menu', type: 'relationship', relationTo: 'menus', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Services Column',
              admin: { condition: supports('columns'), description: 'Kolom services — default auto dari modules/ServiceTypes.', initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'showServicesColumn', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
                    { name: 'servicesColumnLabel', type: 'text', defaultValue: 'Our Services', admin: { width: '30%' } },
                    { name: 'servicesMenu', type: 'relationship', relationTo: 'menus', admin: { width: '40%', description: 'Optional: override auto dgn menu CMS' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Contact Column',
              admin: { condition: supports('address'), description: 'Kolom kontak: phone/email/address dari SiteSettings.contact.', initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'showContactColumn', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
                    { name: 'contactColumnLabel', type: 'text', defaultValue: 'Contact Us', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Newsletter Signup',
              admin: {
                condition: supports('newsletterToggle'),
                description: 'Editorial copy for the footer newsletter form. Master on/off lives in Site Features → Section Halaman → Newsletter Signup.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'newsletter',
                  type: 'group',
                  label: 'Newsletter',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'heading', type: 'text', required: true, defaultValue: 'Get Bali Travel Inspiration', admin: { width: '60%', description: 'Section heading.' } },
                        { name: 'theme', type: 'select', required: true, defaultValue: 'ocean', options: [
                          { label: 'Ocean (deep blue)', value: 'ocean' },
                          { label: 'Sand (warm cream)', value: 'sand' },
                          { label: 'Leaf (tropical green)', value: 'leaf' },
                        ], admin: { width: '40%', description: 'Background theme.' } },
                      ],
                    },
                    { name: 'description', type: 'textarea', admin: { description: 'Optional sub-copy under the heading.' } },
                    {
                      type: 'row',
                      fields: [
                        { name: 'placeholderText', type: 'text', required: true, defaultValue: 'your@email.com', admin: { width: '50%' } },
                        { name: 'buttonLabel', type: 'text', required: true, defaultValue: 'Subscribe', admin: { width: '50%' } },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'successMessage', type: 'text', required: true, defaultValue: "Thanks! We'll be in touch.", admin: { width: '50%', description: 'Shown after a successful signup.' } },
                        { name: 'errorMessage', type: 'text', required: true, defaultValue: 'Something went wrong. Please try again.', admin: { width: '50%', description: 'Shown when the signup fails.' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'legalLinks',
              type: 'relationship',
              relationTo: 'menus',
              admin: { condition: supports('legalLinks'), description: 'Menu link legal (Privacy, Terms) untuk footer minimal.' },
            },
            {
              name: 'bottomBarRightText',
              type: 'text',
              defaultValue: 'Designed with ♥ in Bali',
              admin: { description: 'Teks kanan bawah (copyright pakai SiteSettings.footer.copyrightText).' },
            },
          ],
        },

        // ══ Tab 3: Advanced — Super Admin only ══════════════════════
        {
          label: 'Advanced',
          description: 'Warna aksesorial Footer. Kosongkan = pakai warna default template. Hanya Super Admin.',
          admin: { condition: isSuperAdminUI },
          fields: [
            {
              name: 'advanced',
              type: 'group',
              label: false,
              access: saAccess,
              admin: {
                description: 'Override warna background, teks, heading, link hover, dan divider Footer. Layout theme tetap.',
              },
              fields: [
                {
                  type: 'collapsible',
                  label: 'Surface & Text',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('bgColor',        'Background',   'Warna background footer.',                   '#1B3A4B', { access: saAccess, width: '50%' }),
                        colorPickerField('textColor',      'Text default', 'Warna teks default (paragraph, link normal).', '#D9DEE1', { access: saAccess, width: '50%' }),
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('mutedTextColor', 'Muted text',   'Warna teks kecil (copyright, bottom bar).',  '#8FA0A9', { access: saAccess, width: '50%' }),
                        colorPickerField('linkHoverColor', 'Link hover',   'Warna link saat hover.',                      '#FFFFFF', { access: saAccess, width: '50%' }),
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Headings & Divider',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('headingColor', 'Column headings', 'Warna heading kolom (mis. "Quick Links").', '#FFFFFF', { access: saAccess, width: '50%' }),
                        colorPickerField('dividerColor', 'Divider',         'Warna garis pemisah antar-section.',         '#FFFFFF', { access: saAccess, width: '50%' }),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ══ Tab 4: Import / Export ══════════════════════════════════
        {
          label: 'Import / Export',
          description: 'Snapshot JSON portable — copy antar-project.',
          fields: [
            {
              name: 'importExport',
              type: 'ui',
              admin: {
                components: { Field: '/components/TemplateImportExport#TemplateImportExport' },
                custom: { slug: 'footer-settings', kind: 'footer' },
              },
            },
          ],
        },
      ],
    },
  ],
}
