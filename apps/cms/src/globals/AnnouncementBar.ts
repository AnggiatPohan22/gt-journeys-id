import type { GlobalConfig } from 'payload'
import crypto from 'crypto'
import { isSuperAdmin } from '../access/roles'
import { colorPickerField } from '../fields/colorPicker'

/**
 * Announcement Bar — Phase 4.33.
 *
 * Slim site-wide bar rendered above the header in PageLayout.astro.
 * Master on/off in Site Features (`features.announcementBar`); this
 * global carries the message, link, theme, dismiss behavior, schedule,
 * and page scope.
 *
 * `version` is auto-generated in a beforeChange hook by hashing the
 * message + related fields (+ a reset nonce). When the owner edits any
 * of those, `version` changes, and any localStorage dismissal
 * (`dnj:ab-dismissed:{version}`) is invalidated — the bar re-appears
 * for previously-dismissed visitors. Checking `resetVisitorCookies` +
 * Save also forces a fresh version even without a content edit.
 *
 * Read: public (frontend build fetches without auth).
 * Update: Super Admin only.
 */
export const AnnouncementBar: GlobalConfig = {
  slug: 'announcement-bar',
  label: 'Announcement Bar',
  admin: {
    group: 'Marketing',
    description: 'Slim site-wide bar shown below the header. Master on/off in Site Features → Fitur Opsional.',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Phase 4.45 — `theme` field removed; warna via advanced group.
        const contentBits = [
          data?.message ?? '',
          data?.dismissible ? '1' : '0',
          data?.displayFrequency ?? '',
          data?.link?.enabled ? '1' : '0',
          data?.link?.label ?? '',
          data?.link?.url ?? '',
          data?.showOnHomepageOnly ? '1' : '0',
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
          description: 'Message, link, and visual variant.',
          fields: [
            {
              name: 'message',
              type: 'text',
              required: true,
              maxLength: 140,
              admin: { description: 'Single-line announcement (max 140 chars).' },
            },
            // Phase 4.45 — `theme` preset select removed. Warna sekarang
            // di tab Advanced → Colors (bgColor / textColor / linkColor /
            // linkHoverColor). Single source of truth, mendukung alpha.
            {
              name: 'dismissible',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Show an "×" button so visitors can dismiss the bar. Dismissal is remembered for the duration set in the Trigger & Behavior tab.' },
            },
            {
              type: 'collapsible',
              label: 'Optional Link',
              admin: { initCollapsed: true, description: 'Optional CTA link at the end of the bar.' },
              fields: [
                {
                  name: 'link',
                  type: 'group',
                  label: 'Link',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'enabled', type: 'checkbox', defaultValue: false, admin: { width: '30%' } },
                        { name: 'label', type: 'text', admin: { width: '35%', description: 'e.g. "Learn more"', condition: (_, siblingData) => !!siblingData?.enabled } },
                        { name: 'url', type: 'text', admin: { width: '35%', description: 'Absolute or relative URL', condition: (_, siblingData) => !!siblingData?.enabled } },
                      ],
                    },
                    {
                      name: 'newTab',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { description: 'Open in a new tab.', condition: (_, siblingData) => !!siblingData?.enabled },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ══ Tab 2: Trigger & Behavior ════════════════════════════════════
        {
          label: 'Trigger & Behavior',
          description: 'How long a dismissal lasts, and how to reset visitor cookies.',
          fields: [
            {
              name: 'displayFrequency',
              type: 'select',
              required: true,
              defaultValue: '1440',
              options: [
                { label: '30 minutes', value: '30' },
                { label: '1 hour',     value: '60' },
                { label: '6 hours',    value: '360' },
                { label: '12 hours',   value: '720' },
                { label: '1 day',      value: '1440' },
              ],
              admin: {
                description: 'After a visitor dismisses the bar, wait this long before showing it to them again.',
              },
            },
            {
              name: 'resetVisitorCookies',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Check this and Save to force the bar to reappear for every visitor (including yourself) on their next page load, regardless of the duration setting above. Auto-unchecks after save. Any content edit (message/link/theme/frequency) already triggers the same reset automatically.',
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
                { name: 'endDate',   type: 'date', admin: { width: '50%', description: 'Auto-hide after this date.' } },
              ],
            },
          ],
        },

        // ══ Tab 4: Advanced ══════════════════════════════════════════════
        {
          label: 'Advanced',
          description: 'Rarely-changed placement + warna aksesorial override.',
          fields: [
            {
              name: 'showOnHomepageOnly',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'When ON: bar only shows on the homepage. When OFF (default): bar shows site-wide on every page. Announcement bars are usually site-wide (that\'s their point), so leave this OFF unless you specifically want a homepage-only teaser.',
              },
            },
            // ── Colors (Phase 4.44 → 4.45 sole warna source) ─────────
            // Preset theme select sudah dihapus di Phase 4.45.
            // Warna bar sepenuhnya dari group ini; alpha didukung (8-digit hex).
            {
              type: 'collapsible',
              label: 'Colors',
              admin: {
                initCollapsed: false,
                description: 'Warna bar. Kosong = pakai default ocean. Dukung 8-digit hex (mis. `#1B3A4B99` untuk 60% alpha).',
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
                        colorPickerField('bgColor',       'Background', 'Warna background bar.',        '#1B3A4B', { width: '50%' }),
                        colorPickerField('textColor',     'Text',       'Warna teks utama bar.',        '#F5F0E8', { width: '50%' }),
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        colorPickerField('linkColor',      'Link',       'Warna link CTA (kalau ada).', '#F5F0E8', { width: '50%' }),
                        colorPickerField('linkHoverColor', 'Link hover', 'Warna link saat hover.',      '#FFFFFF', { width: '50%' }),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Auto-generated hash of the content + reset counter. Do not edit — it keys the visitor dismissal cookie.',
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
