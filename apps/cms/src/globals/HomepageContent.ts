import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'
import { iconField } from '../fields/iconOptions'

/**
 * Homepage Content — fallback konten yang tampil di homepage kalau
 * belum ada `Page(slug=home)` di CMS. Editor bisa tweak copy tanpa
 * harus bangun full block system.
 *
 * Cascade di pages/index.astro:
 *   1. Page(slug=home) published (block system) → override semua
 *   2. HomepageContent global → dipakai untuk isi block fallback
 *   3. Hardcoded defaults di file (safety net) → dipakai kalau global kosong
 *
 * Kalau editor mau full kontrol layout → buat Page(slug=home). Kalau cuma
 * mau ganti copy dan pertahankan layout referensi → cukup edit global ini.
 */
export const HomepageContent: GlobalConfig = {
  slug: 'homepage-content',
  label: 'Homepage — Fallback Content',
  admin: {
    group: 'Appearance',
    description: 'Copy fallback untuk homepage. Kalau Page(slug=home) ada, semua field di sini diabaikan.',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    // ── Hero ────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Hero Section',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'heroHeading', type: 'text', defaultValue: 'Discover Bali Beyond Ordinary', admin: { width: '60%' } },
            { name: 'heroCtaText', type: 'text', defaultValue: 'Explore Tours', admin: { width: '40%' } },
          ],
        },
        { name: 'heroSubheading', type: 'textarea', defaultValue: 'Explore breathtaking destinations, stay in exclusive villas, enjoy adventures, and create unforgettable memories.' },
        { name: 'heroCtaLink', type: 'text', defaultValue: '/tours' },
      ],
    },

    // ── Value Props ─────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Value Propositions (4 items)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'valueProps',
          type: 'array',
          minRows: 0,
          maxRows: 4,
          admin: { description: 'Kalau kosong, pakai default hardcoded (Local Expert / Best Price / 24/7 / Safe).' },
          fields: [
            {
              type: 'row',
              fields: [
                iconField({ name: 'iconName', required: true, admin: { width: '30%' } }),
                { name: 'label', type: 'text', required: true, admin: { width: '35%' } },
                { name: 'subtitle', type: 'text', admin: { width: '35%' } },
              ],
            },
          ],
        },
      ],
    },

    // ── Stats ───────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Stats Banner',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'statsEyebrow', type: 'text', defaultValue: 'Why Choose Us', admin: { width: '40%' } },
            { name: 'statsHeading', type: 'text', defaultValue: 'Your Journey is Our Priority', admin: { width: '60%' } },
          ],
        },
        {
          name: 'stats',
          type: 'array',
          minRows: 0,
          maxRows: 4,
          admin: { description: 'Kalau kosong, pakai default (1000+ / 50+ / 10+ / 24/7).' },
          fields: [
            {
              type: 'row',
              fields: [
                iconField({ name: 'iconName', required: true, admin: { width: '25%' } }),
                { name: 'value', type: 'text', required: true, admin: { width: '25%' } },
                { name: 'caption', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },

    // ── Testimonials override ───────────────────────────────────────────
    // Testimonials sekarang punya collection sendiri. Field di sini hanya
    // untuk heading/eyebrow; item ambil dari collection `testimonials`
    // (isFeatured=true → dipakai di fallback homepage).
    {
      type: 'collapsible',
      label: 'Testimonials Section',
      admin: {
        initCollapsed: true,
        description: 'Isi testimonial diambil dari collection Testimonials (yang isFeatured=true, sortOrder ASC).',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'testimonialsEyebrow', type: 'text', defaultValue: 'What Our Clients Say', admin: { width: '40%' } },
            { name: 'testimonialsHeading', type: 'text', defaultValue: 'Memories That Last Forever', admin: { width: '60%' } },
          ],
        },
      ],
    },

    // ── CTA ─────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Bottom CTA',
      admin: { initCollapsed: true },
      fields: [
        { name: 'ctaHeading', type: 'text', defaultValue: 'Ready to Plan Your Perfect Trip?' },
        { name: 'ctaDescription', type: 'textarea', defaultValue: 'Chat with us on WhatsApp and get the best offers!' },
        {
          type: 'row',
          fields: [
            { name: 'ctaButtonText', type: 'text', defaultValue: 'Chat on WhatsApp', admin: { width: '50%' } },
            { name: 'ctaButtonLinkOverride', type: 'text', admin: { width: '50%', description: 'Kosong = auto pakai WhatsApp number dari SiteSettings.' } },
          ],
        },
      ],
    },
  ],
}
