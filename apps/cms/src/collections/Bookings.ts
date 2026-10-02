import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin, superAdminFieldAccess } from '../access/roles'

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
    group: 'Bookings',
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
    // Phase 4.66.5 (finding S-02) — random 128-bit access token untuk
    // mengunci halaman confirmation. bookingRef pendek (6 hex/day) mudah
    // ditebak; token ini menyediakan capability yang unguessable. URL
    // konfirmasi = /checkout/.../confirmation/<bookingRef>?t=<token>.
    // Server compare constant-time. Token disembunyikan dari list default;
    // admin dapat melihatnya di edit view untuk regenerate/resend jika
    // customer kehilangan URL.
    {
      name: 'accessToken',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '128-bit random capability token. Never share screenshot yang mengandung ini.',
        readOnly: true,
        hidden: false,
      },
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      defaultValue: 'ferry-ticket',
      options: [
        { label: 'Ferry Ticket', value: 'ferry-ticket' },
        // Extensible — bisa nambah 'tour', 'accommodation', 'rental', dst tanpa migration
        // baru (Payload select enum). Nilai baru → migrate.
      ],
      admin: { description: 'Jenis layanan yang di-booking.' },
    },

    // ── Relationship + snapshot (Ferry Ticket) ───────────────
    {
      name: 'ferryTicket',
      type: 'relationship',
      relationTo: 'ferry-tickets',
      admin: {
        description: 'Rujukan ke Ferry Ticket. Data teks disnapshot ke field terpisah supaya booking tidak berubah kalau ticket diedit.',
        condition: (data) => data?.serviceType === 'ferry-ticket',
      },
    },

    // ── Customer ─────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'customerName',  type: 'text',  required: true, admin: { width: '50%' } },
        { name: 'customerEmail', type: 'email',                  admin: { width: '50%' } },
      ],
    },
    // ── Contact phone (Phase 4.63) — region + number + WA flag ─────────
    // customerWhatsapp tetap dipertahankan sebagai kolom SNAPSHOT FINAL
    // (auto-compose {region}{phone} di endpoint) supaya konsumen (WA
    // channel, payment gateway nanti) punya 1 field siap-pakai.
    {
      type: 'row',
      fields: [
        { name: 'contactPhoneRegion', type: 'text', admin: { width: '20%', description: 'Kode negara telepon (mis. +62, +65).' } },
        { name: 'contactPhone',       type: 'text', admin: { width: '50%', description: 'Nomor telepon tanpa kode negara.' } },
        { name: 'contactPhoneIsWhatsapp', type: 'checkbox', defaultValue: true, admin: { width: '30%', description: 'Nomor ini juga WhatsApp.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'customerWhatsapp', type: 'text', required: true, admin: { width: '50%', description: 'Snapshot WA final ({region}{phone}). Dipakai channel WA & gateway.' } },
        { name: 'customerCountry',  type: 'text',                  admin: { width: '50%', description: 'Negara asal (opsional).' } },
      ],
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      admin: { description: 'Catatan tambahan dari customer (opsional).' },
    },

    // ── Passengers array (Phase 4.63) ──────────────────────────────────
    // Ukuran = adults + children. Endpoint memastikan jumlah cocok saat
    // submit. Passport disimpan mentah di sini untuk keperluan admin &
    // gateway; frontend confirmation/WA message me-mask (last 4 digits).
    {
      name: 'passengers',
      type: 'array',
      label: 'Passengers',
      admin: {
        description: 'Data lengkap tiap penumpang untuk keperluan ticketing / manifest / payment gateway.',
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'passengerType',
              type: 'select',
              required: true,
              defaultValue: 'adult',
              options: [
                { label: 'Adult', value: 'adult' },
                { label: 'Child', value: 'child' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'title',
              type: 'select',
              options: [
                { label: 'Mr',     value: 'mr' },
                { label: 'Mrs',    value: 'mrs' },
                { label: 'Ms',     value: 'ms' },
                { label: 'Master', value: 'master' },
                { label: 'Miss',   value: 'miss' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'gender',
              type: 'select',
              options: [
                { label: 'Male',   value: 'male' },
                { label: 'Female', value: 'female' },
              ],
              admin: { width: '25%' },
            },
            { name: 'nationality', type: 'text', admin: { width: '25%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'lastName',  type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'dateOfBirth',        type: 'date', admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
            {
              name: 'passportNumber',
              type: 'text',
              // Phase 4.66.7 (finding S-09) — passport = data paling sensitif
              // di collection ini. Update dibatasi ke super-admin (walaupun
              // collection-level `update: isAdmin` sudah cukup ketat, ini
              // memberi tambahan defense: seorang admin yang login juga tidak
              // bisa mengubah passport tanpa naik ke super-admin dulu).
              access: {
                update: superAdminFieldAccess,
              },
              admin: {
                width: '33%',
                description: 'Disimpan penuh di CMS; di frontend hanya 4 digit terakhir yang terlihat. Update dibatasi super-admin.',
              },
            },
            { name: 'passportIssueDate',  type: 'date', admin: { width: '17%', date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'passportExpiryDate', type: 'date', admin: { width: '33%', date: { pickerAppearance: 'dayOnly' }, description: 'Minimal 6 bulan setelah departureDate.' } },
          ],
        },
      ],
    },

    // ── Booking details (snapshot) ───────────────────────────
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

    // ── Pricing (snapshot) ───────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'unitPrice',     type: 'number', admin: { width: '33%', description: 'Harga per adult saat booking dibuat.' } },
        { name: 'currency',      type: 'text',   defaultValue: 'IDR', admin: { width: '33%' } },
        { name: 'totalEstimate', type: 'number', admin: { width: '33%', description: 'Estimasi total = adults*unitPrice + children*childPrice.' } },
      ],
    },

    // ── Status + channel ─────────────────────────────────────
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
        // Placeholder utk nanti — cukup tambah nilai baru di sini + implement di
        // apps/web/src/lib/checkout/channels/. Tidak butuh migration schema.
        // { label: 'Xendit',   value: 'xendit' },
        // { label: 'Midtrans', value: 'midtrans' },
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
