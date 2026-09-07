import type { GlobalConfig } from 'payload'
import crypto from 'crypto'
import { isSuperAdmin } from '../access/roles'

/**
 * Announcement Bar — Phase 4.33.
 *
 * Slim site-wide bar rendered above the Header in PageLayout.astro.
 * Master on/off in Site Features (`features.announcementBar`); this
 * global carries the message, link, theme, dismissible flag, and an
 * optional date window.
 *
 * `version` is auto-generated in a beforeChange hook by hashing the
 * message text. When the owner edits `message`, `version` changes, and
 * any localStorage dismissal (`dnj:ab-dismissed:{version}`) is
 * invalidated — the bar re-appears for previously-dismissed visitors.
 *
 * Read: public (frontend build fetches without auth).
 * Update: Super Admin only.
 */
export const AnnouncementBar: GlobalConfig = {
  slug: 'announcement-bar',
  label: 'Announcement Bar',
  admin: {
    group: 'Settings',
    description: 'Slim site-wide bar shown above the header. Master on/off in Site Features → Fitur Opsional.',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const msg = (data?.message ?? '').toString()
        data.version = crypto
          .createHash('sha256')
          .update(msg)
          .digest('hex')
          .slice(0, 12)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'message',
      type: 'text',
      required: true,
      maxLength: 140,
      admin: { description: 'Single-line announcement (max 140 chars).' },
    },
    {
      name: 'theme',
      type: 'select',
      required: true,
      defaultValue: 'ocean',
      options: [
        { label: 'Ocean (deep blue)', value: 'ocean' },
        { label: 'Coral (sunset)', value: 'coral' },
        { label: 'Leaf (tropical green)', value: 'leaf' },
        { label: 'Sand (warm cream)', value: 'sand' },
      ],
      admin: { description: 'Background color from the brand palette.' },
    },
    {
      name: 'dismissible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show an "×" button so visitors can dismiss the bar. Dismissal is remembered in the browser until the message text changes.' },
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
    {
      type: 'collapsible',
      label: 'Schedule (optional)',
      admin: { initCollapsed: true, description: 'Auto show/hide inside a date window. Leave empty to always show while the master toggle is ON.' },
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
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Auto-generated hash of the message. Do not edit — it is used to invalidate visitor dismissals.',
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
