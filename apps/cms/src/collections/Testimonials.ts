import type { CollectionConfig } from 'payload'
import { authenticatedRead, adminCreate, authenticatedUpdate, superAdminDelete } from '../access/roles'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

/**
 * Testimonials — real client testimonials, dipakai:
 * - Fallback homepage (isFeatured=true, status=published)
 * - Block `testimonialsCarousel` bisa consume list ini di masa depan
 *
 * Rating 1–5 dipakai UI untuk render bintang.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'location', 'rating', 'isFeatured', 'status', 'updatedAtRelative'],
  },
  access: {
    read: () => true,
    create: adminCreate,
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'location', type: 'text', admin: { width: '50%', description: 'Kota/negara, e.g. "Sydney, Australia"' } },
      ],
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: { description: 'Isi testimonial. Plain text; keep it concise (1–3 kalimat).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          defaultValue: 5,
          admin: { width: '30%', description: '1–5 bintang' },
        },
        {
          name: 'sourceModule',
          type: 'select',
          admin: { width: '70%', description: 'Untuk filter di masa depan (opsional).' },
          options: [
            { label: '— General —', value: 'general' },
            { label: 'Tours', value: 'tours' },
            { label: 'Accommodations', value: 'accommodations' },
            { label: 'Water Activities', value: 'water-activities' },
            { label: 'Yacht', value: 'yachts' },
            { label: 'Restaurants', value: 'restaurants' },
            { label: 'Weddings & Events', value: 'venues' },
            { label: 'Rentals', value: 'rentals' },
            { label: 'Spa & Wellness', value: 'spa' },
            { label: 'Ferry Tickets', value: 'ferry-tickets' },
          ],
          defaultValue: 'general',
        },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Foto profile (opsional). Kalau kosong, UI render initial.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'destination',
          type: 'relationship',
          relationTo: 'destinations',
          admin: { width: '50%', description: 'Destinasi terkait (opsional) — untuk filter "by destination" di block.' },
        },
        {
          name: 'date',
          type: 'date',
          admin: { width: '50%', description: 'Tanggal testimonial (opsional). Dipakai untuk urutan kronologis.' },
        },
      ],
    },
    isFeaturedField,
    withStatusCell(statusField),
    sortOrderField,
    updatedAtRelativeField,
  ],
}
