import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin } from '../access/roles'

/**
 * Bookings — Phase 4.62.
 *
 * Single source of truth untuk semua checkout dari frontend. Awalnya hanya
 * dipakai oleh Ferry Ticket (channel `manual_wa`), tapi schema sudah
 * extensible untuk service lain (Tour/Hotel/Car Rental) & payment gateway
 * (Xendit/Midtrans) yang akan aktif nanti — struktur booking TIDAK berubah,
 * cukup nambah `channel` dan isi `channelData`.
 *
 * Access:
 * - create : disabled from public REST (write via API-key dari Astro
 *   endpoint /api/bookings/create, sama pola dgn NewsletterSubscribers).
 * - read   : admin+
 * - update : admin+ (untuk konfirmasi/expire booking manual)
 * - delete : super-admin only
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Booking', plural: 'Bookings' },
  admin: {
    useAsTitle: 'bookingRef',
    group: 'Administration',
    defaultColumns: ['bookingRef', 'serviceType', 'status', 'channel', 'customerName', 'departureDate', 'createdAt'],
    defaultSort: '-createdAt',
    description: 'Data booking dari frontend. Ferry Ticket sekarang; siap untuk gateway (Xendit/Midtrans) nanti.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'bookingRef',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated reference, mis. "FT-20260927-A1B2C3". Jangan diubah manual.',
        readOnly: true,
      },
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      defaultValue: 'ferry-ticket',
      options: [
        { label: 'Ferry Ticket', value: 'ferry-ticket' },
      ],
      admin: { description: 'Jenis layanan yang di-booking.' },
    },

    {
      name: 'ferryTicket',
      type: 'relationship',
      relationTo: 'ferry-tickets',
      admin: {
        description: 'Rujukan ke Ferry Ticket. Data teks disnapshot ke field terpisah supaya booking tidak berubah kalau ticket diedit.',
        condition: (data) => data?.serviceType === 'ferry-ticket',
      },
    },

    {
      type: 'row',
      fields: [
        { name: 'customerName',  type: 'text',  required: true, admin: { width: '50%' } },
        { name: 'customerEmail', type: 'email',                  admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'customerWhatsapp', type: 'text', required: true, admin: { width: '50%', description: 'Nomor WA (format bebas, akan dinormalisasi saat generate link).' } },
        { name: 'customerCountry',  type: 'text',                  admin: { width: '50%', description: 'Negara asal (opsional).' } },
      ],
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      admin: { description: 'Catatan tambahan dari customer (opsional).' },
    },

    {
      type: 'row',
      fields: [
        { name: 'departureDate', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
        { name: 'adults',        type: 'number', required: true, defaultValue: 1, min: 0, admin: { width: '33%' } },
        { name: 'children',      type: 'number', defaultValue: 0, min: 0, admin: { width: '33%' } },
      ],
    },
    {
      name: 'originLocation',
      type: 'text',
      admin: { description: 'Snapshot nama lokasi asal saat booking dibuat.' },
    },
    {
      name: 'destinationLocation',
      type: 'text',
      admin: { description: 'Snapshot nama lokasi tujuan saat booking dibuat.' },
    },
    {
      name: 'scheduleTimeLabel',
      type: 'text',
      admin: { description: 'Snapshot jadwal (mis. "08:20 → 09:10"). Opsional.' },
    },
    {
      name: 'ferryClassName',
      type: 'text',
      admin: { description: 'Snapshot nama kelas (mis. "Ekonomi", "Emerald").' },
    },
    {
      name: 'ferryClassType',
      type: 'text',
      admin: { description: 'Snapshot classType (ekonomi/emerald).' },
    },

    {
      type: 'row',
      fields: [
        { name: 'unitPrice',     type: 'number', admin: { width: '33%', description: 'Harga per adult saat booking dibuat.' } },
        { name: 'currency',      type: 'text',   defaultValue: 'IDR', admin: { width: '33%' } },
        { name: 'totalEstimate', type: 'number', admin: { width: '33%', description: 'Estimasi total = adults*unitPrice + children*childPrice.' } },
      ],
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending',           value: 'pending' },
        { label: 'Awaiting payment',  value: 'awaiting_payment' },
        { label: 'Confirmed',         value: 'confirmed' },
        { label: 'Cancelled',         value: 'cancelled' },
        { label: 'Expired',           value: 'expired' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      defaultValue: 'manual_wa',
      options: [
        { label: 'Manual WhatsApp', value: 'manual_wa' },
      ],
      admin: { position: 'sidebar', description: 'Channel checkout yang dipakai. Manual WA = konfirmasi lewat WhatsApp (fallback).' },
    },
    {
      name: 'channelData',
      type: 'json',
      admin: {
        description: 'Payload data dari channel (mis. gateway invoice id/URL). Kosong untuk manual_wa.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Auto-expire booking pending setelah waktu ini. Nullable.',
      },
    },
  ],
}
