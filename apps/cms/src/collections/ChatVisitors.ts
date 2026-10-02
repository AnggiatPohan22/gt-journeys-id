import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin } from '../access/roles'

/**
 * ChatVisitors — Phase 4.50.1 (Security addendum).
 *
 * Canonical visitor record for the chat widget. Keyed by an opaque cookie
 * ID (visitorId) plus HMAC-hashed IP for cross-cookie correlation without
 * storing raw IPs (GDPR-friendly).
 *
 * Populated server-to-server from the chat API endpoint using
 * PAYLOAD_API_KEY. Public create/update disabled.
 *
 * Scalability: extra bot signals / rule outputs go into `context` (json)
 * → new detection heuristics ship without schema migration.
 */
export const ChatVisitors: CollectionConfig = {
  slug: 'chat-visitors',
  labels: { singular: 'Chat Visitor', plural: 'Chat Visitors' },
  admin: {
    useAsTitle: 'visitorId',
    group: 'Chat',
    defaultColumns: ['visitorId', 'ipHash', 'status', 'messageCount', 'lastSeenAt'],
    description:
      'Visitor records untuk chat widget. Cookie ID + IP hash (bukan raw IP). Populated server-side.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'visitorId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Opaque cookie ID (server-signed).' },
    },
    {
      name: 'ipHash',
      type: 'text',
      index: true,
      admin: { description: 'HMAC-SHA256(salt, ip). Salt di env (ipHashSaltRef).' },
    },
    {
      name: 'userAgentHash',
      type: 'text',
      admin: { description: 'SHA-256(user-agent). Untuk fingerprinting kasar.' },
    },
    {
      name: 'country',
      type: 'text',
      admin: { description: 'ISO-3166-1 alpha-2 dari CF-IPCountry.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Throttled', value: 'throttled' },
        { label: 'Blocked', value: 'blocked' },
      ],
    },
    {
      name: 'blockedUntil',
      type: 'date',
      admin: { description: 'Cooldown expiry. Null = permanent kalau status=blocked.' },
    },
    {
      name: 'blockReason',
      type: 'text',
    },
    {
      name: 'messageCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'firstSeenAt',
      type: 'date',
    },
    {
      name: 'lastSeenAt',
      type: 'date',
      index: true,
    },
    {
      name: 'context',
      type: 'json',
      admin: {
        description:
          'Free-form signals (bot heuristics, verification history, dsb). Scalability: rule baru menulis di sini tanpa migrasi.',
      },
    },
  ],
  timestamps: true,
}
