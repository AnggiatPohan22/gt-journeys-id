import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin } from '../access/roles'

/**
 * Newsletter Subscribers — Phase 4.33.
 *
 * Storage for email addresses collected via the site's Newsletter Signup
 * component. Populated exclusively server-to-server from
 * `apps/web/src/pages/api/newsletter-subscribe.ts` using PAYLOAD_API_KEY.
 *
 * Access:
 * - create : disabled from public REST (write happens via API-key auth only)
 * - read   : admin+
 * - update : admin+
 * - delete : super-admin only (retention decisions are owner-scope)
 */
export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: { singular: 'Newsletter Subscriber', plural: 'Newsletter Subscribers' },
  admin: {
    useAsTitle: 'email',
    group: 'Marketing',
    defaultColumns: ['email', 'status', 'source', 'createdAt'],
    description: 'Emails collected via the site Newsletter Signup form. Read-only for editors.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    // Public create is closed. The Astro API endpoint authenticates with
    // PAYLOAD_API_KEY (users.enableAPIKey) — that request is treated as an
    // authenticated user matching `isAdmin`. Keeping create restricted here
    // prevents anon POSTs to /api/newsletter-subscribers.
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Subscriber email. Unique.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
      ],
      admin: { description: 'Lifecycle status. Set to "unsubscribed" if the person opts out.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'text',
          admin: {
            width: '50%',
            description: 'URL path where signup happened (auto-filled by the API).',
            readOnly: true,
          },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Browser UA at signup time (diagnostic).',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: {
        description: 'SHA-256(ip + salt). GDPR-friendly; used only for spam forensics.',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal admin notes. Not visible to the subscriber.' },
    },
  ],
  timestamps: true,
}
