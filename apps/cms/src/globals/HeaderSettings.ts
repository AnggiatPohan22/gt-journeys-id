import type { GlobalConfig } from 'payload'
import { isAdmin, superAdminFieldAccess } from '../access/roles'
// Import relatif (bukan alias) — packages/shared di luar root cms; runtime butuh
// resolusi native (Next externalDir + tsx). Single source template registry.
import { toSelectOptions, defaultTemplateId, templateSupports } from '../../../../packages/shared/src/template-registry'

/**
 * Header Settings — Phase 3.24 Template System.
 *
 * `template` (Super Admin only) memilih layout Header dari registry. Slot content
 * muncul dinamis (admin.condition berbasis registry). Field lama (primaryMenu,
 * CTA, sticky/transparent) = slot template-1 (Classic) → data existing utuh.
 *
 * Brand (logo/siteName) & social/contact tetap dari SiteSettings (no-dupe);
 * slot di sini hanya kontrol WIRING + toggle tampil.
 */
const supports = (slot: Parameters<typeof templateSupports>[1]) => (data: any) =>
  templateSupports(data?.template, slot)

export const HeaderSettings: GlobalConfig = {
  slug: 'header-settings',
  label: 'Header Settings',
  admin: {
    group: 'Appearance',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    // ── Template selector (Super Admin only) ────────────────────────────
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: defaultTemplateId('header'),
      options: toSelectOptions('header'),
      access: { update: superAdminFieldAccess },
      admin: {
        description: 'Layout Header. Hanya Super Admin. Slot content di bawah menyesuaikan template.',
        components: { Field: '/components/TemplatePickerField#TemplatePickerField' },
        custom: { templateKind: 'header' },
      },
    },

    // ── Behavior (selalu tampil) ────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'stickyOnScroll', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Header sticky saat scroll' } },
        { name: 'transparentOnTop', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Transparan di hero, solid setelah scroll' } },
      ],
    },

    // ── Slot: primaryMenu ───────────────────────────────────────────────
    {
      name: 'primaryMenu',
      type: 'relationship',
      relationTo: 'menus',
      admin: { condition: supports('primaryMenu'), description: 'Menu utama Header. Default: main-navigation.' },
    },

    // ── Slot: secondaryMenu ─────────────────────────────────────────────
    {
      name: 'secondaryMenu',
      type: 'relationship',
      relationTo: 'menus',
      admin: { condition: supports('secondaryMenu'), description: 'Menu sekunder (opsional).' },
    },

    // ── Slot: searchToggle ──────────────────────────────────────────────
    {
      name: 'showSearch',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: supports('searchToggle'), description: 'Tampilkan tombol/box search.' },
    },

    // ── Slot: socialLinks (data dari SiteSettings.socialMedia) ──────────
    {
      name: 'showSocialLinks',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: supports('socialLinks'), description: 'Tampilkan ikon social (dari SiteSettings).' },
    },

    // ── Slot: ctaButton (field lama = slot template-1) ──────────────────
    {
      name: 'showCtaButton',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: supports('ctaButton'), description: 'Tampilkan tombol CTA.' },
    },
    {
      type: 'row',
      admin: { condition: (data: any) => templateSupports(data?.template, 'ctaButton') && data?.showCtaButton !== false },
      fields: [
        { name: 'ctaText', type: 'text', defaultValue: 'WhatsApp Booking', admin: { width: '50%', description: 'Text button (mobile auto "Book")' } },
        {
          name: 'ctaType', type: 'select', defaultValue: 'whatsapp', admin: { width: '50%' },
          options: [
            { label: 'WhatsApp (number dari SiteSettings)', value: 'whatsapp' },
            { label: 'Custom URL', value: 'custom' },
          ],
        },
      ],
    },
    {
      name: 'ctaCustomLink',
      type: 'text',
      admin: {
        condition: (data: any) => templateSupports(data?.template, 'ctaButton') && data?.showCtaButton !== false && data?.ctaType === 'custom',
        description: 'Custom URL (mis: /contact).',
      },
    },

    // ── Slot: address / phone / customText (top bar, mis. header-3) ─────
    {
      name: 'showTopBarAddress',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: supports('address'), description: 'Tampilkan address di top bar (dari SiteSettings.contact).' },
    },
    {
      name: 'showTopBarPhone',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: supports('phone'), description: 'Tampilkan phone di top bar (dari SiteSettings.contact).' },
    },
    {
      name: 'topBarText',
      type: 'text',
      admin: { condition: supports('customText'), description: 'Teks bebas di top bar (mis. "Free cancellation").' },
    },

    // ── Import / Export (portable JSON) ─────────────────────────────────
    {
      name: 'importExport',
      type: 'ui',
      admin: {
        components: { Field: '/components/TemplateImportExport#TemplateImportExport' },
        custom: { slug: 'header-settings', kind: 'header' },
      },
    },
  ],
}
