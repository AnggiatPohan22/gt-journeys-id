import type { CollectionConfig } from 'payload'
import { isSuperAdmin, adminCreate, authenticatedUpdate } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { autoSortOrder } from '../hooks/autoSortOrder'

/**
 * Locations — taksonomi lokasi generik & reusable yang CRUD-able dari CMS
 * (Phase 4.61). Menggantikan field `select` lokasi hardcoded (origin/arrival,
 * departurePort/arrivalPort) di FerryTickets, sehingga admin bisa menambah
 * lokasi/pelabuhan baru tanpa perlu ubah kode & deploy.
 *
 * Sengaja generik (bukan `ferry-ports`) agar bisa dipakai ulang oleh modul
 * transport lain ke depan (bus, train, transfer, dll).
 *
 * Access read = PUBLIC (konsisten dgn taksonomi lain spt DestinationTypes;
 * frontend SSG fetch tanpa auth untuk resolve nama lokasi di card & detail).
 */
export const Locations: CollectionConfig = {
  slug: 'locations',
  labels: { singular: 'Location', plural: 'Locations' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'terminalName', 'country', 'code', 'sortOrder'],
    defaultSort: 'sortOrder',
    description: 'Lokasi / pelabuhan reusable (mis. Batam, Singapore). Dipakai sebagai Origin/Arrival di Ferry Tickets. Tambah lokasi baru di sini — otomatis muncul sebagai pilihan.',
  },
  access: {
    read: () => true, // PUBLIC — frontend butuh resolve nama lokasi
    create: adminCreate,
    update: authenticatedUpdate,
    delete: isSuperAdmin,
  },
  hooks: {
    beforeChange: [autoSortOrder],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Nama tampilan lokasi, mis: "Batam", "Singapore", "Tanjung Pinang".' },
    },
    {
      name: 'terminalName',
      type: 'text',
      label: 'Terminal / Sub-title',
      admin: { description: 'Nama terminal/pelabuhan (opsional), mis: "Singapore Cruise Center", "Batam Centre Terminal-BTC". Tampil sebagai baris kedua di card.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          type: 'text',
          admin: { width: '50%', description: 'Negara (opsional), mis: "Indonesia", "Singapore".' },
        },
        {
          name: 'code',
          type: 'text',
          admin: { width: '50%', description: 'Kode singkat (opsional), mis: "BTM", "SIN".' },
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar', description: 'Auto dari name.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Nonaktifkan untuk menyembunyikan lokasi dari pilihan (data tetap ada).' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      admin: {
        position: 'sidebar',
        description: 'Kosongkan saat create → otomatis max+1. Kecil di atas.',
      },
    },
  ],
}
