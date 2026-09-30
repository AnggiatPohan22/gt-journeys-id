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
    description: 'Reusable locations / ports (e.g. Batam, Singapore). Used as Origin/Arrival on Ferry Tickets. Add new locations here — they show up automatically as options.',
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
      admin: { placeholder: 'Batam', description: 'Display name, e.g. "Batam", "Singapore", "Tanjung Pinang".' },
    },
    {
      name: 'locationType',
      type: 'select',
      defaultValue: 'ferry-port',
      admin: {
        description: 'Location category. Filters which service search widgets can pick this location (e.g. ferry search only shows ferry-port).',
      },
      options: [
        { label: 'Ferry Port', value: 'ferry-port' },
        { label: 'Train Station', value: 'train-station' },
        { label: 'Airport', value: 'airport' },
        { label: 'Bus Terminal', value: 'bus-terminal' },
        { label: 'City / General', value: 'city' },
      ],
    },
    {
      name: 'terminalName',
      type: 'text',
      label: 'Terminal / Sub-title',
      admin: { placeholder: 'Batam Centre Terminal-BTC', description: 'Terminal / port name (optional). E.g. "Singapore Cruise Center", "Batam Centre Terminal-BTC". Rendered as the second line on cards.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          type: 'text',
          admin: { width: '34%', placeholder: 'Indonesia', description: 'Country (optional). E.g. "Indonesia", "Singapore".' },
        },
        {
          name: 'code',
          type: 'text',
          admin: { width: '33%', placeholder: 'BTM', description: 'Short code (optional). E.g. "BTM", "SIN".' },
        },
        {
          name: 'timezone',
          type: 'select',
          defaultValue: 'Asia/Jakarta',
          admin: {
            width: '33%',
            description: 'IANA timezone. Used to compute cross-timezone ferry duration (e.g. Batam WIB → Singapore SGT). Required for ferry locations.',
          },
          options: [
            { label: 'WIB (Asia/Jakarta)', value: 'Asia/Jakarta' },
            { label: 'WITA (Asia/Makassar)', value: 'Asia/Makassar' },
            { label: 'WIT (Asia/Jayapura)', value: 'Asia/Jayapura' },
            { label: 'SGT (Asia/Singapore)', value: 'Asia/Singapore' },
            { label: 'MYT (Asia/Kuala_Lumpur)', value: 'Asia/Kuala_Lumpur' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Map (optional)',
      admin: { initCollapsed: true, description: 'Google Maps embed & link for the "Location Port" section on the ferry page. Leave empty for non-ferry locations.' },
      fields: [
        {
          name: 'mapEmbedUrl',
          type: 'text',
          label: 'Map Embed URL (iframe src)',
          admin: {
            placeholder: 'https://www.google.com/maps/embed?pb=!1m18...',
            description: 'Google Maps → "Share" → "Embed a map" tab → copy only the src value from the <iframe>. Example: https://www.google.com/maps/embed?pb=!1m18...',
          },
        },
        {
          name: 'mapLink',
          type: 'text',
          label: 'Map Directions URL (click-through)',
          admin: {
            placeholder: 'https://maps.google.com/?q=1.234,103.456',
            description: 'Plain Google Maps URL for the "Open in Maps" button (opens native Google/Apple Maps on mobile). Example: https://maps.google.com/?q=1.234,103.456 or a share link. Leave empty to fall back to the embed URL.',
          },
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar', description: 'Auto-generated from name.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Uncheck to hide this location from selection (data preserved).' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      admin: {
        position: 'sidebar',
        description: 'Leave empty on create → auto max+1. Lower values appear first.',
      },
    },
  ],
}
