import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin } from '../access/roles'

/**
 * ChatBlockedEvents — Phase 4.50.1 (Security addendum).
 *
 * Setiap kali sebuah security layer memblokir request, catat 1 event di
 * sini. Berbeda dari `chat-messages` (audit per pesan), ini adalah audit
 * per RULE TRIGGER — bisa jadi 1 request memicu banyak rule (mis.
 * rate-limit + honeypot).
 *
 * `context` (json) menyimpan signal spesifik → tambah rule baru zero-
 * migration. `ruleTriggered` sengaja string bebas (bukan enum ketat)
 * dengan konvensi kebab-case (mis. "rate-limit.5-per-min", "honeypot",
 * "recaptcha-score-below", "keyword-blocklist").
 */
export const ChatBlockedEvents: CollectionConfig = {
  slug: 'chat-blocked-events',
  labels: { singular: 'Blocked Event', plural: 'Blocked Events' },
  admin: {
    useAsTitle: 'ruleTriggered',
    group: 'Administration',
    defaultColumns: ['layer', 'ruleTriggered', 'action', 'ipHash', 'createdAt'],
    description: 'Audit trail setiap kali security layer memblokir/challenge.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'visitor',
      type: 'relationship',
      relationTo: 'chat-visitors',
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
    },
    {
      name: 'message',
      type: 'relationship',
      relationTo: 'chat-messages',
      admin: {
        description:
          'Message yang men-trigger (kalau layer berjalan setelah content parsing). Null kalau block terjadi di layer awal.',
      },
    },
    {
      name: 'layer',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Layer 1 — Rate limit', value: 'rateLimit' },
        { label: 'Layer 2 — Human verification', value: 'humanVerification' },
        { label: 'Layer 3 — Backend validation', value: 'backendValidation' },
        { label: 'Layer 4 — Bot signals', value: 'botSignals' },
        { label: 'Layer 5 — IP / country controls', value: 'ipControls' },
      ],
    },
    {
      name: 'ruleTriggered',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description:
          'Kebab-case rule ID (mis. "rate-limit.5-per-min", "honeypot", "keyword-blocklist"). Tambah rule baru = string baru, no migration.',
      },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Block (rejected)', value: 'block' },
        { label: 'Challenge (asked to verify)', value: 'challenge' },
        { label: 'Log only (allowed)', value: 'log' },
      ],
    },
    {
      name: 'ipHash',
      type: 'text',
      index: true,
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { description: 'Raw UA untuk audit. Bisa hash kalau privacy stricter dibutuhkan.' },
    },
    {
      name: 'context',
      type: 'json',
      admin: {
        description:
          'Snapshot signal (mis. { windowLimit: 5, actualCount: 8, keyword: "***", timingMs: 320 }). Rule baru tulis di sini.',
      },
    },
  ],
  timestamps: true,
}
