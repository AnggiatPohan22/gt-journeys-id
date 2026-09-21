import type { GlobalConfig, Field } from 'payload'
import { isSuperAdmin } from '../access/roles'

// ── Modul Layanan registry (Phase 4.49) ─────────────────────────────
// Single source untuk daftar modul layanan — description auto-count di
// tab, row checkbox auto-generate 2-per-baris. Tambah modul baru = 1
// entry di array ini, otomatis muncul di CMS tanpa update description.
// Nama harus match dgn `apps/web/src/config/modules.ts` ServiceModule enum
// dan `apps/web/src/lib/features.ts` DEFAULT_FEATURES.modules.
const SERVICE_MODULES = [
  { name: 'tours',            label: 'Tours & Activities' },
  { name: 'accommodations',   label: 'Villas & Hotels' },
  { name: 'waterActivities',  label: 'Water Activities' },
  { name: 'yacht',            label: 'Private Yacht' },
  { name: 'restaurants',      label: 'Restaurants' },
  { name: 'weddings',         label: 'Weddings & Events' },
  { name: 'rentals',          label: 'Rental Service' },
  { name: 'spa',              label: 'Spa & Wellness' },
  { name: 'ferryTickets',     label: 'Ferry Tickets' },
] as const

// ── Phase 4.58.1 — Dashboard widgets: option registries ────────────
// Kunci di sini SINGLE SOURCE OF TRUTH untuk fetch di DashboardStats.tsx.
// Tambah option baru = 1 entry di array + 1 case di runtime consumer.
const QUICK_ACCESS_OPTIONS = [
  { label: 'Pages', value: 'pages' },
  { label: 'Tours', value: 'tours' },
  { label: 'Accommodations', value: 'accommodations' },
  { label: 'Water Activities', value: 'water-activities' },
  { label: 'Yachts', value: 'yachts' },
  { label: 'Restaurants', value: 'restaurants' },
  { label: 'Venues', value: 'venues' },
  { label: 'Rentals', value: 'rentals' },
  { label: 'Spa', value: 'spa' },
  { label: 'Ferry Tickets', value: 'ferry-tickets' },
  { label: 'Destinations', value: 'destinations' },
  { label: 'Categories', value: 'categories' },
  { label: 'Menu', value: 'menu' },
  { label: 'Media', value: 'media' },
  { label: 'Users', value: 'users' },
  { label: 'Site Features', value: 'site-features' },
  { label: 'Site Settings', value: 'site-settings' },
] as const

const SYSTEM_HEALTH_OPTIONS = [
  { label: 'Media files count', value: 'media' },
  { label: 'Storage usage', value: 'storage' },
  { label: 'Payload version', value: 'payload' },
  { label: 'Node version', value: 'node' },
  { label: 'Last backup', value: 'backup' },
] as const

const quickAccessOptions = () => [...QUICK_ACCESS_OPTIONS]
const systemHealthOptions = () => [...SYSTEM_HEALTH_OPTIONS]

// Bagi dua-per-baris (row) supaya layout tetap seperti sebelumnya.
const moduleRowFields = (): Field[] => {
  const rows: Field[] = []
  for (let i = 0; i < SERVICE_MODULES.length; i += 2) {
    const pair = SERVICE_MODULES.slice(i, i + 2)
    rows.push({
      type: 'row',
      fields: pair.map((m) => ({
        name: m.name,
        type: 'checkbox' as const,
        label: m.label,
        defaultValue: true,
        admin: { width: pair.length === 1 ? '100%' : '50%' },
      })),
    })
  }
  return rows
}

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
          description: `Master on/off untuk ${SERVICE_MODULES.length} modul layanan utama.`,
          fields: [
            {
              name: 'modules',
              type: 'group',
              label: 'Modul Layanan',
              admin: {
                description: `Matikan modul → hilang dari navigasi, homepage, sitemap, footer, dan URL-nya 404. Terdaftar ${SERVICE_MODULES.length} modul; menambah modul baru = 1 entry di SERVICE_MODULES registry di globals/SiteFeatures.ts.`,
              },
              fields: moduleRowFields(),
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

        // ══ Tab: Dashboard Widgets (Phase 4.58 → 4.58.1 → 4.58.2) ════════
        {
          label: 'Dashboard Widgets',
          description: 'Konfigurasi 6 widget di admin dashboard, dikelompokkan jadi 3 seksi: Core Panels · Access Control (per-role) · Insight Widgets.',
          fields: [
            {
              name: 'dashboardWidgets',
              type: 'group',
              label: 'Dashboard Widgets',
              admin: {
                description: 'Kosongkan field pemilihan (multi-select) → dashboard fallback ke default hardcoded. Modul layanan yang di-off di tab "Modul Layanan" otomatis di-skip di Quick Access & At A Glance walaupun terpilih di sini.',
              },
              fields: [
                // ═════════ SEKSI 0 — DASHBOARD HEADER (Phase 4.58.3) ═══
                // Header title + subtitle di atas dashboard.
                {
                  type: 'collapsible',
                  label: '🎯 Header · Judul & Subjudul Dashboard',
                  admin: {
                    initCollapsed: true,
                    description: 'Text di paling atas dashboard admin. Kosongkan → default: "Overview" + "Welcome back, {name} — …".',
                  },
                  fields: [
                    {
                      name: 'headerTitle',
                      type: 'text',
                      label: 'Judul Dashboard',
                      admin: {
                        placeholder: 'Overview',
                        description: 'Kosongkan → "Overview". Bisa disesuaikan mis. "Beranda Admin" / "Ringkasan Situs".',
                      },
                    },
                    {
                      name: 'headerSubtitle',
                      type: 'textarea',
                      label: 'Subjudul Dashboard',
                      admin: {
                        placeholder: 'Welcome back, {name} — here’s what’s happening across your site.',
                        description: 'Gunakan `{name}` sebagai placeholder nama user. Kosongkan → pakai default English.',
                      },
                    },
                  ],
                },

                // ═════════ SEKSI 1 — CORE PANELS ═══════════════════════
                // At A Glance + Recent Activity — 2 panel dasar di semua role.

                // ── At A Glance ──────────────────────────────────────
                {
                  type: 'collapsible',
                  label: '📊 Core · At A Glance (Stat Row)',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      name: 'atAGlanceTitle',
                      type: 'text',
                      label: 'Judul panel',
                      admin: {
                        placeholder: 'At a glance',
                        description: 'Kosongkan → "At a glance".',
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'atAGlanceEnabled',
                          type: 'checkbox',
                          label: 'Tampilkan panel',
                          defaultValue: true,
                          admin: { width: '50%', description: 'Master switch untuk stat row.' },
                        },
                        {
                          name: 'atAGlanceClickable',
                          type: 'checkbox',
                          label: 'Klik → collection listing',
                          defaultValue: true,
                          admin: { width: '50%', description: 'Setiap kotak jadi link ke listing terkait.' },
                        },
                      ],
                    },
                    {
                      name: 'atAGlanceStats',
                      type: 'select',
                      label: 'Pilih stat (max 6)',
                      hasMany: true,
                      defaultValue: ['pages', 'destinations', 'categories', 'services', 'media', 'users'],
                      options: [
                        { label: 'Pages', value: 'pages' },
                        { label: 'Destinations', value: 'destinations' },
                        { label: 'Categories', value: 'categories' },
                        { label: 'Services (agregat semua modul)', value: 'services' },
                        { label: 'Media', value: 'media' },
                        { label: 'Users (super-admin only)', value: 'users' },
                        { label: 'Tours', value: 'tours' },
                        { label: 'Accommodations', value: 'accommodations' },
                        { label: 'Water Activities', value: 'water-activities' },
                        { label: 'Yachts', value: 'yachts' },
                        { label: 'Restaurants', value: 'restaurants' },
                      ],
                      admin: {
                        description: 'Kosongkan → default 6 stat (Pages/Destinations/Categories/Services/Media/Users). Runtime cap 6, "Users" hanya super-admin.',
                      },
                    },
                  ],
                },

                // ── Recent Activity ──────────────────────────────────
                {
                  type: 'collapsible',
                  label: '🕒 Core · Recent Activity',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      name: 'recentActivityTitle',
                      type: 'text',
                      label: 'Judul panel',
                      admin: {
                        placeholder: 'Recent activity',
                        description: 'Kosongkan → "Recent activity".',
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'recentActivityEnabled',
                          type: 'checkbox',
                          label: 'Tampilkan panel',
                          defaultValue: true,
                          admin: { width: '50%' },
                        },
                        {
                          name: 'recentActivityLimit',
                          type: 'number',
                          label: 'Jumlah item (3–20)',
                          defaultValue: 10,
                          min: 3,
                          max: 20,
                          admin: { width: '50%', description: 'Berlaku untuk semua role.' },
                        },
                      ],
                    },
                  ],
                },

                // ═════════ SEKSI 2 — ACCESS CONTROL (per-role) ═════════
                // Super-admin memilih item yg tampil di Quick Access & System
                // Health untuk role Admin & Editor. Super sendiri = set penuh.

                // ── Quick Access ─────────────────────────────────────
                {
                  type: 'collapsible',
                  label: '⚡ Access · Quick Access (per role)',
                  admin: {
                    initCollapsed: true,
                    description: 'Max 12 icon per baris (di-cap runtime supaya tetap 1 baris). Modul layanan yang di-off di tab "Modul Layanan" otomatis di-hide walaupun terpilih di sini.',
                  },
                  fields: [
                    {
                      name: 'quickAccessTitle',
                      type: 'text',
                      label: 'Judul panel',
                      admin: {
                        placeholder: 'Quick access',
                        description: 'Kosongkan → "Quick access".',
                      },
                    },
                    {
                      name: 'quickAccessAdmin',
                      type: 'select',
                      label: 'Admin — pilih icon',
                      hasMany: true,
                      options: quickAccessOptions(),
                      admin: { description: 'Kosongkan → default: semua service module aktif + Menu. Order sesuai urutan pilih.' },
                    },
                    {
                      name: 'quickAccessEditor',
                      type: 'select',
                      label: 'Editor — pilih icon',
                      hasMany: true,
                      options: quickAccessOptions(),
                      admin: { description: 'Kosongkan → default: semua service module aktif + Media. Order sesuai urutan pilih.' },
                    },
                  ],
                },

                // ── System Health ────────────────────────────────────
                {
                  type: 'collapsible',
                  label: '🩺 Access · System Health (per role)',
                  admin: {
                    initCollapsed: true,
                    description: 'Info teknis di bawah dashboard. Super-admin selalu lihat set lengkap.',
                  },
                  fields: [
                    {
                      name: 'systemHealthTitle',
                      type: 'text',
                      label: 'Judul panel (opsional)',
                      admin: {
                        placeholder: 'System Health / Media Usage (auto)',
                        description: 'Kosongkan → auto: "Media Usage" kalau hanya Media+Storage, else "System Health". Isi manual untuk override.',
                      },
                    },
                    {
                      name: 'systemHealthAdmin',
                      type: 'select',
                      label: 'Admin — pilih info',
                      hasMany: true,
                      options: systemHealthOptions(),
                      admin: { description: 'Kosongkan → default: semua 5 info (Media/Storage/Payload/Node/Backup).' },
                    },
                    {
                      name: 'systemHealthEditor',
                      type: 'select',
                      label: 'Editor — pilih info',
                      hasMany: true,
                      options: systemHealthOptions(),
                      admin: { description: 'Kosongkan → default: Media + Storage (title jadi "Media Usage" kalau hanya 2 itu).' },
                    },
                  ],
                },

                // ═════════ SEKSI 3 — INSIGHT WIDGETS (admin+) ══════════
                // Widget analitik & AI, admin + super-admin only. Smart
                // Insight = heuristic, real AI menyusul di phase 4.58.4.

                // ── Smart Insight ────────────────────────────────────
                {
                  type: 'collapsible',
                  label: '✨ Insight · AI Smart Insight',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'smartInsightTitle',
                      type: 'text',
                      label: 'Judul panel',
                      admin: {
                        placeholder: 'Smart Insight',
                        description: 'Kosongkan → "Smart Insight".',
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'smartInsightSeo',
                          type: 'checkbox',
                          label: 'SEO & Content Suggestions',
                          defaultValue: true,
                          admin: {
                            width: '50%',
                            description: 'Scan issue SEO umum (rule-based heuristic).',
                          },
                        },
                        {
                          name: 'smartInsightImageTag',
                          type: 'checkbox',
                          label: 'Auto Image Tagging',
                          defaultValue: false,
                          admin: {
                            width: '50%',
                            description: 'Placeholder untuk AI vision (butuh provider). Wiring 4.58.4.',
                          },
                        },
                      ],
                    },
                  ],
                },

                // ── Traffic & Performance ────────────────────────────
                {
                  type: 'collapsible',
                  label: '📈 Insight · Traffic & Top Performing',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'analyticsCardTitle',
                          type: 'text',
                          label: 'Judul kartu Traffic',
                          admin: {
                            width: '50%',
                            placeholder: 'Traffic & Performance',
                            description: 'Kartu GA setup. Kosongkan → default.',
                          },
                        },
                        {
                          name: 'topPerformingTitle',
                          type: 'text',
                          label: 'Judul Top Performing',
                          admin: {
                            width: '50%',
                            placeholder: 'Top Performing',
                            description: 'Widget analytics. Kosongkan → default.',
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'topPerformingViews',
                          type: 'checkbox',
                          label: 'Top Views',
                          defaultValue: true,
                          admin: { width: '50%', description: 'Destinasi/service dgn view tertinggi.' },
                        },
                        {
                          name: 'topPerformingInquiries',
                          type: 'checkbox',
                          label: 'Top Inquiries',
                          defaultValue: true,
                          admin: { width: '50%', description: 'Yg dpt WhatsApp click / form submit terbanyak.' },
                        },
                      ],
                    },
                    {
                      name: 'analyticsProvider',
                      type: 'select',
                      label: 'Analytics Provider',
                      defaultValue: 'none',
                      options: [
                        { label: '⏸️  Belum diaktifkan (placeholder)', value: 'none' },
                        { label: '🗄️  Own counter (frontend beacon → DB) — phase 4.58.2', value: 'own' },
                        { label: '📊  Google Analytics 4 Data API — phase 4.58.3', value: 'ga' },
                      ],
                      admin: {
                        description: 'Sumber data widget Top Performing. `none` → tampil placeholder. Provider wiring akan datang di phase berikutnya.',
                      },
                    },
                  ],
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
