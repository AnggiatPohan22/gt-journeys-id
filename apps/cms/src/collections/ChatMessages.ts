import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin } from '../access/roles'

/**
 * ChatMessages — Phase 4.50.1 (Security addendum).
 *
 * Audit log per pesan yang lewat backend (AI chatbot channel & Email
 * channel). Channel WhatsApp/LiveChat client-side redirect — TIDAK dicatat
 * di sini (kita tidak melihat message-nya).
 *
 * Content di-hash + panjangnya dicatat (bukan raw text) by default →
 * privacy-preserving. Field `content` tetap ada tapi optional, dan
 * di-purge otomatis via retention job (auditRetentionDays).
 */
export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  labels: { singular: 'Chat Message', plural: 'Chat Messages' },
  admin: {
    useAsTitle: 'id',
    group: 'Administration',
    defaultColumns: ['channelType', 'direction', 'wasBlocked', 'blockReason', 'createdAt'],
    description: 'Audit log per message untuk channel yang backend-hit (AI, Email).',
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
      admin: { description: 'UUID per panel-open (bukan cookie visitor).' },
    },
    {
      name: 'channelType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'WhatsApp', value: 'whatsappChannel' },
        { label: 'AI Chatbot', value: 'aiChatbotChannel' },
        { label: 'Live Chat', value: 'liveChatChannel' },
        { label: 'Email', value: 'emailChannel' },
      ],
    },
    {
      name: 'direction',
      type: 'select',
      required: true,
      options: [
        { label: 'Inbound (visitor → us)', value: 'in' },
        { label: 'Outbound (us → visitor)', value: 'out' },
      ],
    },
    {
      name: 'contentHash',
      type: 'text',
      index: true,
      admin: { description: 'SHA-256 body. Untuk dedup detection.' },
    },
    {
      name: 'contentLength',
      type: 'number',
    },
    {
      name: 'content',
      type: 'textarea',
      admin: {
        description:
          'Raw body. Optional (retention job akan clear ini setelah auditRetentionDays lewat, meta tetap disimpan).',
      },
    },
    {
      name: 'wasBlocked',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'blockReason',
      type: 'text',
      admin: { description: 'Generic string (mis. "rate_limit_exceeded", "duplicate", "keyword").' },
    },
    {
      name: 'spamScore',
      type: 'number',
      admin: { description: '0.0-1.0. Composite dari signal aktif.' },
    },
    {
      name: 'verificationProvider',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Turnstile', value: 'turnstile' },
        { label: 'reCAPTCHA v3', value: 'recaptcha_v3' },
      ],
    },
    {
      name: 'verificationScore',
      type: 'number',
    },
    {
      name: 'ipHash',
      type: 'text',
      index: true,
    },
    {
      name: 'context',
      type: 'json',
      admin: {
        description:
          'Metadata bebas (mis. AI provider request_id, token count, error). Signal baru tanpa migrasi.',
      },
    },
  ],
  timestamps: true,
}
