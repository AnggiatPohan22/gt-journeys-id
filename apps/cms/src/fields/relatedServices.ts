import type { Field } from 'payload'

/**
 * Shared field definitions for the 3-layer Related Services cascade (Phase 4.17).
 *
 * Layer 1 (Global): `relatedServicesGlobalFields()` → SiteSettings group
 * Layer 2 (Per Service Type): `relatedServicesTypeOverrideFields()` → ServiceTypes collapsible
 * Layer 3 (Per Service): `relatedServicesPerServiceFields(slug)` → each service collection
 */

const CARD_STYLE_OPTIONS = [
  { label: 'Curated (large image, floating price, hover lift)', value: 'curated' },
  { label: 'Compact (image + title + price)', value: 'compact' },
  { label: 'Detailed (multi-image, rating, description, amenities)', value: 'detailed' },
]

const SELECTION_MODE_OPTIONS = [
  { label: 'Same Type (same collection, sorted by order)', value: 'same_type' },
  { label: 'Same Destination (same collection + same destination)', value: 'same_destination' },
  { label: 'Random (same collection, randomized)', value: 'random' },
]

const SELECTION_MODE_WITH_MANUAL = [
  ...SELECTION_MODE_OPTIONS,
  { label: 'Manual Pick (hand-select specific items)', value: 'manual' },
]

export const relatedServicesGlobalFields = (): Field => ({
  name: 'relatedServices',
  type: 'group',
  label: 'Related Services (Default)',
  admin: {
    description:
      'Pengaturan default untuk section "Related Services" di semua halaman detail service. ' +
      'Bisa di-override per Service Type atau per service individual.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Tampilkan Related Services',
      defaultValue: true,
      admin: { description: 'Matikan = section tidak muncul di semua halaman detail (kecuali di-override).' },
    },
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Judul Section',
      admin: { description: 'Kosong = otomatis per tipe layanan (mis: "Curated Alternatives" / "More Yachts").' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'cardStyle',
          type: 'select',
          label: 'Card Style',
          defaultValue: 'curated',
          options: CARD_STYLE_OPTIONS,
          admin: { width: '50%' },
        },
        {
          name: 'maxItems',
          type: 'number',
          label: 'Jumlah Maksimum',
          defaultValue: 3,
          min: 2,
          max: 8,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'selectionMode',
          type: 'select',
          label: 'Mode Seleksi',
          defaultValue: 'same_type',
          options: SELECTION_MODE_OPTIONS,
          admin: { width: '50%' },
        },
        {
          name: 'showExploreAll',
          type: 'checkbox',
          label: 'Tampilkan "Explore All" Link',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
})

export const relatedServicesTypeOverrideFields = (): Field => ({
  type: 'collapsible',
  label: 'Related Services Override',
  admin: {
    initCollapsed: true,
    description:
      'Override pengaturan Related Services untuk SEMUA service di tipe ini. ' +
      'Kosong = pakai default dari Site Settings.',
  },
  fields: [
    {
      name: 'relatedOverrideEnabled',
      type: 'checkbox',
      label: 'Override Global Default',
      defaultValue: false,
      admin: { description: 'Aktifkan untuk meng-custom pengaturan Related Services khusus tipe layanan ini.' },
    },
    {
      name: 'relatedEnabled',
      type: 'checkbox',
      label: 'Tampilkan Related Services',
      defaultValue: true,
      admin: {
        condition: (data) => data?.relatedOverrideEnabled === true,
      },
    },
    {
      name: 'relatedSectionTitle',
      type: 'text',
      label: 'Judul Section',
      admin: {
        description: 'Kosong = otomatis per tipe layanan.',
        condition: (data) => data?.relatedOverrideEnabled === true,
      },
    },
    {
      type: 'row',
      admin: {
        condition: (data) => data?.relatedOverrideEnabled === true,
      },
      fields: [
        {
          name: 'relatedCardStyle',
          type: 'select',
          label: 'Card Style',
          defaultValue: 'curated',
          options: CARD_STYLE_OPTIONS,
          admin: { width: '50%' },
        },
        {
          name: 'relatedMaxItems',
          type: 'number',
          label: 'Jumlah Maksimum',
          defaultValue: 3,
          min: 2,
          max: 8,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      admin: {
        condition: (data) => data?.relatedOverrideEnabled === true,
      },
      fields: [
        {
          name: 'relatedSelectionMode',
          type: 'select',
          label: 'Mode Seleksi',
          defaultValue: 'same_type',
          options: SELECTION_MODE_OPTIONS,
          admin: { width: '50%' },
        },
        {
          name: 'relatedShowExploreAll',
          type: 'checkbox',
          label: 'Tampilkan "Explore All" Link',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
})

export const relatedServicesPerServiceFields = (collectionSlug: string): Field => ({
  type: 'collapsible',
  label: 'Related Services',
  admin: {
    initCollapsed: true,
    description:
      'Override section Related Services untuk halaman ini saja. ' +
      'Default = pakai pengaturan Service Type atau global Site Settings.',
  },
  fields: [
    {
      name: 'relatedOverride',
      type: 'select',
      label: 'Related Services',
      defaultValue: 'default',
      options: [
        { label: 'Gunakan Default (Service Type / Global)', value: 'default' },
        { label: 'Customize (override untuk halaman ini)', value: 'customize' },
        { label: 'Nonaktifkan (sembunyikan section)', value: 'disable' },
      ],
      admin: { description: 'Pilih "Customize" untuk mengatur manual, atau "Nonaktifkan" untuk menyembunyikan section di halaman ini.' },
    },
    {
      name: 'relatedSectionTitle',
      type: 'text',
      label: 'Judul Section',
      admin: {
        description: 'Kosong = otomatis per tipe layanan.',
        condition: (data) => data?.relatedOverride === 'customize',
      },
    },
    {
      type: 'row',
      admin: {
        condition: (data) => data?.relatedOverride === 'customize',
      },
      fields: [
        {
          name: 'relatedCardStyle',
          type: 'select',
          label: 'Card Style',
          defaultValue: 'curated',
          options: CARD_STYLE_OPTIONS,
          admin: { width: '50%' },
        },
        {
          name: 'relatedMaxItems',
          type: 'number',
          label: 'Jumlah Maksimum',
          defaultValue: 3,
          min: 2,
          max: 8,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      admin: {
        condition: (data) => data?.relatedOverride === 'customize',
      },
      fields: [
        {
          name: 'relatedSelectionMode',
          type: 'select',
          label: 'Mode Seleksi',
          defaultValue: 'same_type',
          options: SELECTION_MODE_WITH_MANUAL,
          admin: { width: '50%' },
        },
        {
          name: 'relatedShowExploreAll',
          type: 'checkbox',
          label: 'Tampilkan "Explore All" Link',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'relatedManualPicks',
      type: 'relationship',
      label: 'Pilih Manual',
      relationTo: collectionSlug,
      hasMany: true,
      admin: {
        description: 'Pilih service spesifik yang ingin ditampilkan. Hanya aktif saat Mode Seleksi = Manual Pick.',
        condition: (data) =>
          data?.relatedOverride === 'customize' &&
          data?.relatedSelectionMode === 'manual',
      },
    },
  ],
})
