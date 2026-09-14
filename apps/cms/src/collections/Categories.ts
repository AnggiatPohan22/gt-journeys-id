import type { CollectionConfig } from 'payload'
import { authenticatedRead, adminCreate, authenticatedUpdate, superAdminDelete } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { statusField, sortOrderField } from '../fields/status'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'module', 'status', 'updatedAtRelative'],
  },
  access: {
    read: () => true,
    create: adminCreate,
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar' },
    },
    {
      name: 'module',
      type: 'select',
      required: true,
      label: 'Service Module',
      options: [
        { label: 'Tours', value: 'tours' },
        { label: 'Accommodations', value: 'accommodations' },
        { label: 'Water Activities', value: 'water-activities' },
        { label: 'Yacht', value: 'yachts' },
        { label: 'Restaurants', value: 'restaurants' },
        { label: 'Weddings & Events', value: 'venues' },
        { label: 'Rentals', value: 'rentals' },
        { label: 'Spa & Wellness', value: 'spa' },
        { label: 'Ferry Tickets', value: 'ferry-tickets' },
        { label: 'Blog', value: 'blog' },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Parent Category',
      admin: {
        description: 'Optional — for subcategories',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icon',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    withStatusCell(statusField),
    sortOrderField,
    updatedAtRelativeField,
  ],
}
