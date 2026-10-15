import type { CollectionConfig, Access } from 'payload'
import { isSuperAdmin } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { autoSortOrder } from '../hooks/autoSortOrder'

/**
 * DestinationTypes — taksonomi tipe destinasi yang CRUD-able dari CMS
 * (Phase 3.23). Menggantikan field `type` select hardcoded di Destinations.
 *
 * Scope keputusan owner (2026-08-24):
 * - Type = taksonomi INTERNAL. TIDAK dirender di frontend (Goal 5 dibatalkan).
 * - Toggle admin = SOFT: collection tetap terlihat; toggle `destinationTypesEnabled`
 *   (SiteFeatures) hanya meng-gate `update` untuk admin (super-admin selalu bisa).
 * - `isActive` = checkbox (bukan pola status draft/published).
 * - Orthogonal terhadap hierarki destinasi Phase 3.22 (parent/showInFilter).
 *
 * Access read = PUBLIC (konsisten dgn content collection lain; frontend SSG
 * fetch tanpa auth walau saat ini type tak dipakai di FE).
 */

/** admin boleh update HANYA saat toggle aktif; super-admin selalu boleh. */
const canUpdateDestinationType: Access = async ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'super-admin') return true
  if (user.role === 'admin') {
    try {
      const sf = await req.payload.findGlobal({ slug: 'site-features', depth: 0 })
      return (sf as any)?.destinations?.destinationTypesEnabled === true
    } catch {
      return false
    }
  }
  return false
}

export const DestinationTypes: CollectionConfig = {
  slug: 'destination-types',
  labels: { singular: 'Destination Type', plural: 'Destination Types' },
  admin: {
    useAsTitle: 'name',
    group: 'Destinations',
    defaultColumns: ['name', 'slug', 'isActive', 'sortOrder'],
    defaultSort: 'sortOrder',
    description: 'Tipe destinasi (mis. Island, Mainland). Taksonomi internal — dipakai di collection Destinations, tidak tampil di frontend.',
  },
  access: {
    read: () => true, // PUBLIC
    create: isSuperAdmin,
    update: canUpdateDestinationType,
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
      admin: { description: 'Nama tampilan tipe, mis: "Island", "Mainland".' },
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
      admin: { position: 'sidebar', description: 'Nonaktifkan untuk menyembunyikan tipe dari pilihan (data tetap ada).' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      admin: {
        position: 'sidebar',
        description: 'Kosongkan saat create → otomatis max+1. Ubah manual → tukar (swap) otomatis kalau bentrok. Kecil di atas.',
      },
    },
  ],
}
