import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'

/**
 * Site Features — master toggle untuk modul, section, dan fitur opsional.
 *
 * Kontrak:
 * - Structural metadata (label/slug/icon/collection) tetap di
 *   `apps/web/src/config/modules.ts` — itu bukan editorial.
 * - Global ini cuma menentukan `enabled` per modul, dan on/off untuk
 *   section & fitur opsional yang ada di frontend.
 *
 * Phase 4.33: Banner Promo, Newsletter Signup, and Announcement Bar are
 * now live features — their content lives in dedicated globals (Promo
 * Banner, Announcement Bar) and in Footer Settings (Newsletter group).
 * Toggles here act as master kill-switches.
 *
 * Read: publik (frontend butuh fetch tanpa auth).
 * Update: Super Admin only — toggle modul = keputusan owner, bukan editor.
 */
export const SiteFeatures: GlobalConfig = {
  slug: 'site-features',
  label: 'Pengaturan Fitur',
  admin: {
    group: 'Settings',
    description: 'Enable/disable modul layanan, section halaman, dan fitur opsional. Hanya Super Admin.',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ══ Tab 1: Modul Layanan ═════════════════════════════════════════
        {
          label: 'Modul Layanan',
          description: 'Master on/off untuk 8 modul layanan utama.',
          fields: [
            {
              name: 'modules',
              type: 'group',
              label: 'Modul Layanan',
              admin: {
                description: 'Matikan modul → hilang dari navigasi, homepage, sitemap, dan URL-nya 404.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'tours', type: 'checkbox', label: 'Tours & Activities', defaultValue: true, admin: { width: '50%' } },
                    { name: 'accommodations', type: 'checkbox', label: 'Villas & Hotels', defaultValue: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'waterActivities', type: 'checkbox', label: 'Water Activities', defaultValue: true, admin: { width: '50%' } },
                    { name: 'yacht', type: 'checkbox', label: 'Private Yacht', defaultValue: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'restaurants', type: 'checkbox', label: 'Restaurants', defaultValue: true, admin: { width: '50%' } },
                    { name: 'weddings', type: 'checkbox', label: 'Weddings & Events', defaultValue: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'rentals', type: 'checkbox', label: 'Rental Service', defaultValue: true, admin: { width: '50%' } },
                    { name: 'spa', type: 'checkbox', label: 'Spa & Wellness', defaultValue: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'ferryTickets', type: 'checkbox', label: 'Ferry Tickets', defaultValue: true, admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },

        // ══ Tab 2: Section Halaman ═══════════════════════════════════════
        {
          label: 'Section Halaman',
          description: 'Toggle section besar di homepage / landing pages.',
          fields: [
            {
              name: 'sections',
              type: 'group',
              label: 'Section Halaman',
              admin: {
                description: 'Toggle section besar di homepage / landing pages.',
              },
              fields: [
                { name: 'testimonials', type: 'checkbox', label: 'Testimonials', defaultValue: true },
                { name: 'faq', type: 'checkbox', label: 'FAQ Section', defaultValue: true },
                {
                  name: 'promoBanner',
                  type: 'checkbox',
                  label: 'Banner Promo',
                  defaultValue: false,
                  admin: { description: 'Master switch for the timed promo modal. Content in Settings → Promo Banner.' },
                },
                {
                  name: 'newsletter',
                  type: 'checkbox',
                  label: 'Newsletter Signup',
                  defaultValue: false,
                  admin: { description: 'Master switch for the footer newsletter signup. Content in Settings → Footer Settings → Newsletter.' },
                },
              ],
            },
          ],
        },

        // ══ Tab 3: Destinasi ═════════════════════════════════════════════
        {
          label: 'Destinasi',
          description: 'Kontrol perilaku filter destinasi di listing service.',
          fields: [
            {
              name: 'destinations',
              type: 'group',
              label: 'Destinasi',
              admin: {
                description: 'Kontrol perilaku filter destinasi di listing service.',
              },
              fields: [
                {
                  name: 'hierarchicalFilter',
                  type: 'checkbox',
                  label: 'Hierarchical Destinations',
                  defaultValue: false,
                  admin: {
                    description: 'Kalau aktif: hanya destinasi "core" (Core Destination di collection Destinations) yang jadi tab filter; sub-lokasi (child) disembunyikan tapi ikut cocok saat core-nya dipilih atau dicari. Kalau non-aktif: semua destinasi tampil flat (perilaku lama).',
                  },
                },
                {
                  name: 'destinationTypesEnabled',
                  type: 'checkbox',
                  label: 'Destination Types Management',
                  defaultValue: true,
                  admin: {
                    description: 'Phase 3.23. Kalau aktif: Admin boleh edit collection Destination Types. Kalau non-aktif: hanya Super Admin yang bisa edit (data tetap utuh). Type = taksonomi internal, tidak tampil di frontend.',
                  },
                },
              ],
            },
          ],
        },

        // ══ Tab: Blog & Ads ══════════════════════════════════════════════
        {
          label: 'Blog & Ads',
          description: 'Master switch untuk modul Blog dan Ad Slots (AdSense / custom).',
          fields: [
            {
              name: 'blog',
              type: 'group',
              label: 'Blog',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable Blog',
                  defaultValue: true,
                  admin: { description: 'Off = /blog dan /blog/* return 404, feed RSS kosong.' },
                },
                {
                  name: 'enableAds',
                  type: 'checkbox',
                  label: 'Enable Ad Slots',
                  defaultValue: false,
                  admin: { description: 'Off = block AdSlot dilewati saat render (posisi kosong, tidak ada script AdSense yang dimuat).' },
                },
              ],
            },
          ],
        },

        // ══ Tab 4: Fitur Opsional ════════════════════════════════════════
        {
          label: 'Fitur Opsional',
          description: 'Toggle floating widget & fitur global lain.',
          fields: [
            {
              name: 'features',
              type: 'group',
              label: 'Fitur Opsional',
              admin: {
                description: 'Toggle floating widget & fitur global lain.',
              },
              fields: [
                { name: 'whatsappFloat', type: 'checkbox', label: 'WhatsApp Floating Button', defaultValue: true },
                {
                  name: 'announcementBar',
                  type: 'checkbox',
                  label: 'Announcement Bar',
                  defaultValue: false,
                  admin: { description: 'Master switch for the slim site-wide bar above the header. Content in Settings → Announcement Bar.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
