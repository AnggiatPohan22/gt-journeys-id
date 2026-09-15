import type { GlobalConfig } from 'payload'
import { isAdmin, superAdminFieldAccess } from '../access/roles'
// Import relatif (bukan alias) — packages/shared di luar root cms; runtime butuh
// resolusi native (Next externalDir + tsx). Single source template registry.
import { toSelectOptions, defaultTemplateId, templateSupports } from '../../../../packages/shared/src/template-registry'

/**
 * Header Settings — Phase 3.24 Template System + Phase 4.41 Advanced Theming.
 *
 * `template` (Super Admin only) memilih layout Header dari registry. Slot content
 * muncul dinamis (admin.condition berbasis registry). Brand (logo/siteName) &
 * social/contact tetap dari SiteSettings (no-dupe); slot di sini hanya kontrol
 * WIRING + toggle tampil + (Phase 4.41) warna aksesorial.
 *
 * Struktur tab (Phase 4.41):
 *   1. General          — template, sticky/transparent behavior.
 *   2. Content          — menu, search, social, CTA text, top-bar content.
 *   3. Advanced (SA)    — warna menu/CTA/icon/top-bar override. Layout theme
 *                         (Classic/Search&Social/TopBar) tetap fixed.
 *   4. Import/Export    — snapshot JSON portable.
 *
 * Access:
 *   - Global read = publik (frontend fetch tanpa auth).
 *   - Global update = admin+ (existing).
 *   - Tab "Advanced" = SA-only via admin.condition({user}) + field-level
 *     access.update = superAdminFieldAccess. Admin/Editor tak melihat tabnya.
 */
const supports = (slot: Parameters<typeof templateSupports>[1]) => (data: any) =>
  templateSupports(data?.template, slot)

// Payload v3 mengirim `{ user }` sebagai arg ketiga ke `admin.condition`,
// walau Condition type resmi hanya `(data, siblingData) => boolean` — jadi
// kita cast ke `any` supaya typecheck lewat.
const isSuperAdminUI: any = (_data: any, _sib: any, ctx?: { user?: { role?: string } | null }) =>
  ctx?.user?.role === 'super-admin'

// ── Reusable field: color hex text input ────────────────────────────
const colorField = (name: string, label: string, description: string, placeholder: string) => ({
  name,
  type: 'text' as const,
  label,
  access: { update: superAdminFieldAccess },
  admin: {
    description,
    placeholder,
    style: { maxWidth: '18ch' },
  },
  validate: (val: string | null | undefined) => {
    if (!val) return true // empty = fallback to template default
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)
      || 'Format harus hex, mis. #1B3A4B atau #FFF.'
  },
})

export const HeaderSettings: GlobalConfig = {
  slug: 'header-settings',
  label: 'Header Settings',
  admin: {
    group: 'Appearance',
    description: 'Layout Header, konten, dan warna aksesorial. Tab "Advanced" khusus Super Admin.',
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
          description: 'Pilih layout Header + perilaku scroll.',
          fields: [
            {
              name: 'template',
              type: 'select',
              required: true,
              defaultValue: defaultTemplateId('header'),
              options: toSelectOptions('header'),
              access: { update: superAdminFieldAccess },
              admin: {
                description: 'Layout Header. Hanya Super Admin. Slot content di tab Content menyesuaikan template.',
                components: { Field: '/components/TemplatePickerField#TemplatePickerField' },
                custom: { templateKind: 'header' },
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'stickyOnScroll',   type: 'checkbox', defaultValue: true,  admin: { width: '50%', description: 'Header sticky saat scroll' } },
                { name: 'transparentOnTop', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Transparan di hero, solid setelah scroll' } },
              ],
            },
          ],
        },

        // ══ Tab 2: Content ══════════════════════════════════════════
        {
          label: 'Content',
          description: 'Menu, tombol CTA, dan konten top-bar. Field muncul dinamis sesuai template.',
          fields: [
            {
              name: 'primaryMenu',
              type: 'relationship',
              relationTo: 'menus',
              admin: { condition: supports('primaryMenu'), description: 'Menu utama Header. Default: main-navigation.' },
            },
            {
              name: 'secondaryMenu',
              type: 'relationship',
              relationTo: 'menus',
              admin: { condition: supports('secondaryMenu'), description: 'Menu sekunder (opsional).' },
            },
            {
              name: 'showSearch',
              type: 'checkbox',
              defaultValue: true,
              admin: { condition: supports('searchToggle'), description: 'Tampilkan tombol/box search.' },
            },
            {
              name: 'showSocialLinks',
              type: 'checkbox',
              defaultValue: true,
              admin: { condition: supports('socialLinks'), description: 'Tampilkan ikon social (dari SiteSettings).' },
            },
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
          ],
        },

        // ══ Tab 3: Advanced — Super Admin only ══════════════════════
        {
          label: 'Advanced',
          description: 'Warna aksesorial Header. Kosongkan = pakai warna default template. Format hex (#1B3A4B). Hanya Super Admin.',
          admin: { condition: isSuperAdminUI },
          fields: [
            {
              name: 'advanced',
              type: 'group',
              label: false,
              access: { update: superAdminFieldAccess },
              admin: {
                description: 'Override warna menu, CTA, icon, dan top-bar. Layout theme tetap sesuai template terpilih.',
              },
              fields: [
                // Menu colors
                {
                  type: 'collapsible',
                  label: 'Menu Colors',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        colorField('menuDefaultColor', 'Default',  'Warna teks menu link biasa.',            '#3D405B'),
                        colorField('menuHoverColor',   'Hover',    'Warna teks saat kursor di atas link.',   '#1B3A4B'),
                        colorField('menuActiveColor',  'Active',   'Warna teks link halaman aktif.',         '#1B3A4B'),
                      ],
                    },
                  ],
                },
                // CTA button colors
                {
                  type: 'collapsible',
                  label: 'CTA Button Colors',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        colorField('ctaBgColor',      'Background',       'Warna background tombol CTA.',       '#1B3A4B'),
                        colorField('ctaBgHoverColor', 'Background hover', 'Warna background saat hover.',       '#2D5F73'),
                        colorField('ctaTextColor',    'Text',             'Warna teks tombol CTA.',             '#FFFFFF'),
                      ],
                    },
                  ],
                },
                // Icon color
                {
                  type: 'collapsible',
                  label: 'Icon Color',
                  admin: { initCollapsed: false },
                  fields: [
                    colorField('iconColor', 'Icon', 'Warna icon (mobile toggle, chevron dropdown).', '#1B3A4B'),
                  ],
                },
                // Top-bar colors (visible only for template-3)
                {
                  type: 'collapsible',
                  label: 'Top Bar Colors (template Top Bar)',
                  admin: {
                    initCollapsed: true,
                    condition: (data: any) => templateSupports(data?.template, 'customText') || templateSupports(data?.template, 'address') || templateSupports(data?.template, 'phone'),
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        colorField('topBarBgColor',   'Background', 'Warna background top-bar.', '#1B3A4B'),
                        colorField('topBarTextColor', 'Text',       'Warna teks top-bar.',        '#FFFFFF'),
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
                custom: { slug: 'header-settings', kind: 'header' },
              },
            },
          ],
        },
      ],
    },
  ],
}
