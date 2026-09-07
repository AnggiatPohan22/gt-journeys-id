import type { GlobalConfig } from 'payload'
import { isAdmin, superAdminFieldAccess } from '../access/roles'
import { toSelectOptions, defaultTemplateId, templateSupports } from '../../../../packages/shared/src/template-registry'

/**
 * Footer Settings — Phase 3.24 Template System.
 *
 * `template` (Super Admin only) memilih layout Footer. Slot muncul dinamis
 * (admin.condition berbasis registry). Field lama (columns, brand, services,
 * contact, newsletter) = slot footer-1 (Multi-column) → data existing utuh.
 * Contact/social/copyright tetap dari SiteSettings.
 */
const supports = (slot: Parameters<typeof templateSupports>[1]) => (data: any) =>
  templateSupports(data?.template, slot)

export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  label: 'Footer Settings',
  admin: {
    group: 'Settings',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    // ── Template selector (Super Admin only) ────────────────────────────
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: defaultTemplateId('footer'),
      options: toSelectOptions('footer'),
      access: { update: superAdminFieldAccess },
      admin: {
        description: 'Layout Footer. Hanya Super Admin. Slot content di bawah menyesuaikan template.',
        components: { Field: '/components/TemplatePickerField#TemplatePickerField' },
        custom: { templateKind: 'footer' },
      },
    },

    // ── Slot: logo / brand column ───────────────────────────────────────
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

    // ── Slot: socialLinks (footer-2 & footer-1) ─────────────────────────
    {
      name: 'showSocialLinks',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: supports('socialLinks'), description: 'Tampilkan ikon social (dari SiteSettings).' },
    },

    // ── Slot: columns (footer-1) ────────────────────────────────────────
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

    // ── Services column (footer-1 multi-column) ─────────────────────────
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

    // ── Slot: address / phone / email (contact column, footer-1) ────────
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

    // ── Slot: newsletter (Phase 4.33) ───────────────────────────────────
    // Content for the footer Newsletter Signup section. The master on/off
    // stays in Site Features (`sections.newsletter`); this group carries
    // the editorial copy and theme.
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

    // ── Slot: legalLinks (footer-3 minimal) ─────────────────────────────
    {
      name: 'legalLinks',
      type: 'relationship',
      relationTo: 'menus',
      admin: { condition: supports('legalLinks'), description: 'Menu link legal (Privacy, Terms) untuk footer minimal.' },
    },

    // ── Bottom bar (semua footer) ───────────────────────────────────────
    {
      name: 'bottomBarRightText',
      type: 'text',
      defaultValue: 'Designed with ♥ in Bali',
      admin: { description: 'Teks kanan bawah (copyright pakai SiteSettings.footer.copyrightText).' },
    },

    // ── Import / Export (portable JSON) ─────────────────────────────────
    {
      name: 'importExport',
      type: 'ui',
      admin: {
        components: { Field: '/components/TemplateImportExport#TemplateImportExport' },
        custom: { slug: 'footer-settings', kind: 'footer' },
      },
    },
  ],
}
