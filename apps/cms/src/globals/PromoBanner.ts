import type { GlobalConfig } from 'payload'
import crypto from 'crypto'
import { isSuperAdmin } from '../access/roles'
import { colorPickerField } from '../fields/colorPicker'
import { buttonStyleFields } from '../fields/buttonStyle'

/**
 * Promo Banner — Phase 4.33.
 *
 * Timed pop-up modal. Master on/off in Site Features (`sections.promoBanner`).
 * By default renders on the homepage only. Trigger timing and per-visitor
 * display frequency are super-admin adjustable.
 *
 * Two themes:
 *   - theme1-with-image: image + copy + CTA (side-by-side)
 *   - theme2-text-only : centered copy + CTA (no image)
 *
 * Read: public. Update: Super Admin only.
 */
export const PromoBanner: GlobalConfig = {
  slug: 'promo-banner',
  label: 'Promo Banner',
  admin: {
    group: 'Marketing',
    description: 'Timed pop-up modal. Master on/off in Site Features → Section Halaman → Banner Promo.',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Version key that invalidates visitor localStorage frequency
        // cookies. Two triggers:
        //   1. Any content change → hash-of-content changes.
        //   2. resetVisitorCookies checkbox ON → append current
        //      timestamp so version changes even without content edit,
        //      then auto-unset the checkbox.
        const contentBits = [
          data?.theme ?? '',
          data?.headline ?? '',
          data?.subheadline ?? '',
          String(data?.image ?? ''),
          data?.cta?.label ?? '',
          data?.cta?.url ?? '',
          data?.displayFrequency ?? '',
        ].join('|')
        const nonce = data?.resetVisitorCookies ? String(Date.now()) : ''
        data.version = crypto
          .createHash('sha256')
          .update(contentBits + nonce)
          .digest('hex')
          .slice(0, 12)
        if (data?.resetVisitorCookies) data.resetVisitorCookies = false
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ══ Tab 1: Content & Theme ═══════════════════════════════════════
        {
          label: 'Content & Theme',
          description: 'Copy and visual variant for the modal.',
          fields: [
            {
              name: 'theme',
              type: 'select',
              required: true,
              defaultValue: 'theme1-with-image',
              options: [
                { label: 'Theme 1 — With image (side-by-side)', value: 'theme1-with-image' },
                { label: 'Theme 2 — Text only (centered)', value: 'theme2-text-only' },
              ],
              admin: { description: 'Layout variant. Theme 1 requires an image; Theme 2 renders headline + CTA only.' },
            },
            {
              name: 'headline',
              type: 'text',
              required: true,
              maxLength: 80,
              admin: { description: 'Main heading (max 80 chars).' },
            },
            {
              name: 'subheadline',
              type: 'textarea',
              maxLength: 240,
              admin: { description: 'Optional supporting copy (max 240 chars).' },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Required when Theme 1 is selected. Recommended 800×600 or landscape.',
                condition: (data) => data?.theme === 'theme1-with-image',
              },
            },
            {
              name: 'cta',
              type: 'group',
              label: 'Call to Action',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, defaultValue: 'Learn More', admin: { width: '40%' } },
                    { name: 'url', type: 'text', required: true, admin: { width: '50%', description: 'Absolute or relative URL' } },
                    { name: 'newTab', type: 'checkbox', defaultValue: false, admin: { width: '10%' } },
                  ],
                },
              ],
            },
          ],
        },

        // ══ Tab 2: Trigger & Behavior ════════════════════════════════════
        {
          label: 'Trigger & Behavior',
          description: 'When the modal appears and how often the same visitor sees it.',
          fields: [
            {
              name: 'triggerDelay',
              type: 'number',
              required: true,
              defaultValue: 5,
              min: 0,
              max: 60,
              admin: {
                description: 'Seconds to wait after page load before showing the modal. Range 0 – 60. Default 5.',
                step: 1,
              },
            },
            {
              name: 'displayFrequency',
              type: 'select',
              required: true,
              defaultValue: '1440',
              options: [
                { label: '30 minutes',  value: '30' },
                { label: '1 hour',      value: '60' },
                { label: '6 hours',     value: '360' },
                { label: '12 hours',    value: '720' },
                { label: '1 day',       value: '1440' },
              ],
              admin: {
                description: 'How long to wait before showing the modal again to a visitor who dismissed or converted.',
              },
            },
            {
              name: 'suppressAfterScroll',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'When ON: do not trigger the modal if the visitor has scrolled past ~50% of the page before the delay elapses (they are already engaged). Recommended.',
              },
            },
            {
              name: 'resetVisitorCookies',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Check this and Save to force the modal to reappear for every visitor (including yourself) on their next page load, regardless of the frequency setting above. Auto-unchecks after save. Any content edit (headline/CTA/image/theme) already triggers the same reset automatically, so use this only when you want to reset without changing the copy.',
              },
            },
            {
              name: 'version',
              type: 'text',
              admin: {
                description: 'Auto-generated hash tied to the current content + reset counter. Do not edit — it keys the visitor localStorage cookie.',
                readOnly: true,
                position: 'sidebar',
              },
            },
          ],
        },

        // ══ Tab 3: Schedule ══════════════════════════════════════════════
        {
          label: 'Schedule',
          description: 'Auto show/hide inside a date window (optional).',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'startDate', type: 'date', admin: { width: '50%', description: 'Do not show before this date.' } },
                { name: 'endDate', type: 'date', admin: { width: '50%', description: 'Auto-hide after this date.' } },
              ],
            },
          ],
        },

        // ══ Tab 4: Advanced ══════════════════════════════════════════════
        {
          label: 'Advanced',
          description: 'Placement + warna/shape aksesorial override.',
          fields: [
            {
              name: 'showOnHomepageOnly',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'When ON (default): modal only triggers on the homepage. When OFF: modal triggers site-wide on every page (frequency cookie still applies). Site-wide can hurt conversion on detail pages — keep this ON unless running a very short campaign.',
              },
            },
            // ── Colors & Shape override (Phase 4.44) ────────────────
            // Kosong = pakai default preset warna Phase 4.33 (panel sand,
            // heading ocean, CTA coral). Layout theme tetap.
            {
              type: 'collapsible',
              label: 'Colors & Shape (override defaults)',
              admin: {
                initCollapsed: true,
                description: 'Override warna panel/CTA + shape tombol. Kosong = pakai default sand/ocean/coral.',
              },
              fields: [
                {
                  name: 'advanced',
                  type: 'group',
                  label: false,
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('panelBgColor',   'Panel background', 'Warna background panel modal.', '#F5F0E8', { width: '50%' }),
                        colorPickerField('backdropColor',  'Backdrop',         'Warna backdrop di belakang modal (dengan alpha kalau perlu).', '#0D1B2A', { width: '50%' }),
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('headingColor',   'Heading',    'Warna heading modal.',             '#1B3A4B', { width: '50%' }),
                        colorPickerField('bodyColor',      'Body text',  'Warna teks subheadline.',          '#1B3A4B', { width: '50%' }),
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('ctaBgColor',      'CTA background',       'Warna background tombol CTA.', '#E07A5F', { width: '33%' }),
                        colorPickerField('ctaBgHoverColor', 'CTA background hover', 'Warna background saat hover.', '#C4583E', { width: '33%' }),
                        colorPickerField('ctaTextColor',    'CTA text',             'Warna teks tombol CTA.',       '#F5F0E8', { width: '34%' }),
                      ],
                    },
                    ...buttonStyleFields({
                      namePrefix: 'cta',
                      radiusLabel: 'CTA button shape',
                      radiusDescription: 'Bentuk sudut tombol CTA modal.',
                      defaultRadius: 'rounded',
                    }),
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
