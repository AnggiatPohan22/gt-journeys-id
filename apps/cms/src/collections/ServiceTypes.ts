import type { CollectionConfig } from 'payload'
import { isAdmin, isSuperAdmin, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { iconField } from '../fields/iconOptions'
import { sidebarTabsFieldWith, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { relatedServicesTypeOverrideFields } from '../fields/relatedServices'

/**
 * ServiceTypes — CMS-editable METADATA untuk 7 service vertical
 * (Tours, Villa & Hotel, Water Activities, Yacht, Restaurants,
 * Weddings & Events, Rentals).
 *
 * Scope (Task 3.2 — "metadata editable"):
 * - Ini BUKAN listing/produk. Listing tetap di 7 collection masing-masing
 *   (Tours, Accommodations, dst) dengan schema struktur per-tipe.
 * - Collection ini hanya mengontrol tampilan/metadata service type:
 *   label, ikon, hero, deskripsi, urutan, on/off, WA number, dan SEO —
 *   supaya client bisa adjust tanpa deploy.
 *
 * Field `key` = pengikat ke collection listing existing (7 nilai fixed).
 * Tidak bisa tambah tipe baru dari CMS (itu path "full dynamic" yang tidak
 * dipilih) — `key` set-nya tetap, hanya metadata-nya yang editable.
 *
 * Access `read` = PUBLIC (bukan authenticated) — WAJIB, karena frontend
 * static build fetch tanpa auth. Konsisten dgn semua content collection lain.
 * Frontend punya fallback ke `config/modules.ts` kalau CMS kosong/unreachable.
 */
export const ServiceTypes: CollectionConfig = {
  slug: 'service-types',
  labels: { singular: 'Service Type', plural: 'Service Types' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'key', 'order', 'status', 'updatedAtRelative'],
    defaultSort: 'order',
    description: 'Metadata untuk kategori layanan (label, ikon, hero, SEO, WhatsApp). Listing/produk tetap di collection masing-masing.',
  },
  access: {
    read: () => true, // PUBLIC — frontend SSG fetch tanpa auth
    create: isSuperAdmin,
    update: isAdmin, // admin + super-admin
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Nama tampilan, mis: "Tours & Activities", "Villas & Hotels"' },
    },
    // Phase 4.9 — 2-tab sidebar (General / Publishing). No SEO tab because
    // SEO fields live in a collapsible in the main column, not the sidebar.
    sidebarTabsFieldWith(['general', 'status']),
    withSidebarTab({
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar', description: 'Auto dari name. Dipakai untuk URL landing page (mis: /tour).' },
    }, 'general'),
    withSidebarTab({
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Pengikat ke collection listing. TETAP — jangan diubah setelah dibuat.',
      },
      access: { update: superAdminFieldAccess },
      options: [
        { label: 'Tours', value: 'tours' },
        { label: 'Accommodations (Villa/Hotel)', value: 'accommodations' },
        { label: 'Water Activities', value: 'water-activities' },
        { label: 'Yachts', value: 'yachts' },
        { label: 'Restaurants', value: 'restaurants' },
        { label: 'Weddings & Events (Venues)', value: 'venues' },
        { label: 'Rentals', value: 'rentals' },
        { label: 'Spa & Wellness', value: 'spa' },
        { label: 'Ferry Tickets', value: 'ferry-tickets' }
      ],
    }, 'general'),
    withSidebarTab(withStatusCell({
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
    }), 'status'),
    withSidebarTab({
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Urutan tampil. Angka kecil di atas.' },
    }, 'status'),
    updatedAtRelativeField,
    {
      name: 'description',
      type: 'richText',
      admin: { description: 'Deskripsi service type (dipakai di landing page / listing header).' },
    },
    {
      type: 'row',
      fields: [
        iconField({ name: 'iconName', admin: { width: '50%', description: 'Ikon dari Icon.astro (dipakai di nav/footer/cards).' } }),
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%', description: 'Hero/cover image untuk landing page service ini.' },
        },
      ],
    },
    // Phase 4.17 — Related Services override per service type
    relatedServicesTypeOverrideFields(),
    {
      type: 'collapsible',
      label: 'WhatsApp',
      admin: { initCollapsed: true, description: 'Override WhatsApp per service type. Kosong = pakai default SiteSettings.' },
      fields: [
        { name: 'whatsappNumber', type: 'text', admin: { description: 'Nomor WA khusus service ini (opsional). Format: 62xxx. Kosong = pakai nomor default Site Settings.' } },
        { name: 'whatsappTemplate', type: 'textarea', admin: { description: 'Template pesan WA (opsional). Variabel yang bisa dipakai: {{serviceName}}, {{destination}}, {{date}}, {{userName}}, {{price}}. Variabel yang tak terisi jadi placeholder [nama_variabel] untuk diisi visitor. Kosong = pakai pesan default per-listing.' } },
      ],
    },
    {
      type: 'collapsible',
      label: 'SEO',
      admin: { initCollapsed: true },
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
}
