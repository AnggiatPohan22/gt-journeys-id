import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/roles'
import { relatedServicesGlobalFields } from '../fields/relatedServices'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'DnJourneysBali' },
    { name: 'tagline', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'logoDark', type: 'upload', relationTo: 'media', label: 'Logo (Dark Background)' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'contact', type: 'group', fields: [
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'text' },
      { name: 'whatsapp', type: 'text', label: 'WhatsApp Number', admin: { description: 'Include country code e.g. 6281234567890' } },
      { name: 'address', type: 'textarea' },
      { name: 'mapEmbed', type: 'text', label: 'Google Maps Embed URL' },
    ]},
    { name: 'socialMedia', type: 'group', fields: [
      { name: 'instagram', type: 'text' }, { name: 'facebook', type: 'text' },
      { name: 'tiktok', type: 'text' }, { name: 'youtube', type: 'text' },
      { name: 'tripadvisor', type: 'text' },
    ]},
    { name: 'defaultSeo', type: 'group', label: 'Default SEO', fields: [
      { name: 'metaTitle', type: 'text' },
      { name: 'metaDescription', type: 'textarea', maxLength: 160 },
      { name: 'ogImage', type: 'upload', relationTo: 'media' },
      { name: 'googleAnalyticsId', type: 'text', label: 'Google Analytics ID', admin: { description: 'GA4 Measurement ID, contoh: G-XXXXXXXXXX' } },
      { name: 'cloudflareWebAnalyticsToken', type: 'text', label: 'Cloudflare Web Analytics Token', admin: { description: 'Site token dari Cloudflare Web Analytics (privacy-first, cookieless). Bisa dipakai bareng GA.' } },
    ]},
    { name: 'whatsappDefaults', type: 'group', label: 'WhatsApp Settings', fields: [
      { name: 'defaultNumber', type: 'text' },
      { name: 'greetingMessage', type: 'textarea' },
      { name: 'businessHours', type: 'textarea' },
    ]},
    { name: 'footer', type: 'group', fields: [
      { name: 'copyrightText', type: 'text' },
      { name: 'additionalScripts', type: 'code', label: 'Tracking Scripts', admin: { language: 'html' } },
    ]},
    // ── Layout (global block spacing) ───────────────────────────────────
    { name: 'layout', type: 'group', label: 'Layout', admin: { description: 'Pengaturan layout global — jarak antar block, dll.' }, fields: [
      { name: 'blockGap', type: 'select', defaultValue: 'normal', label: 'Block Gap', admin: { description: 'Jarak vertikal antar block di halaman. Compact = rapat, Normal = standar, Spacious = longgar.' }, options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal (default)', value: 'normal' },
        { label: 'Spacious', value: 'spacious' },
      ]},
      { name: 'beforeFooter', type: 'select', label: 'Before Footer', admin: { description: 'Jarak antara block terakhir dan footer. Kalau kosong, ikut Block Gap.' }, options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
        { label: 'Spacious', value: 'spacious' },
      ]},
      // Phase 4.24 — Global default internal top/bottom padding untuk semua
      // block regular. Angka dalam pixel; per-block override via Advanced tab
      // (Phase 2). Symmetric default 48/64 approved 2026-09-01.
      { name: 'blockPadding', type: 'group', label: 'Block Padding (internal)', admin: { description: 'Padding internal atas/bawah untuk semua block. Default 48 mobile / 64 desktop, simetris. Override per-block via Advanced tab.' }, fields: [
        { name: 'top', type: 'group', label: 'Top', fields: [
          { name: 'mobile',  type: 'number', defaultValue: 48, min: 0, max: 200, admin: { description: 'px, <768px' }},
          { name: 'desktop', type: 'number', defaultValue: 64, min: 0, max: 200, admin: { description: 'px, ≥768px' }},
        ]},
        { name: 'bottom', type: 'group', label: 'Bottom', fields: [
          { name: 'mobile',  type: 'number', defaultValue: 48, min: 0, max: 200, admin: { description: 'px, <768px' }},
          { name: 'desktop', type: 'number', defaultValue: 64, min: 0, max: 200, admin: { description: 'px, ≥768px' }},
        ]},
      ]},
    ]},
    // ── Section pages (listing headers) ────────────────────────────────
    { name: 'sectionPages', type: 'group', label: 'Section Pages', admin: { description: 'Copy untuk header listing di halaman section (villa, tour, dll) — layout hero-immersive.' }, fields: [
      { name: 'listingTitle', type: 'text', label: 'Listing Title', defaultValue: 'Luxury Collections' },
      { name: 'listingSubtitle', type: 'text', label: 'Listing Subtitle', defaultValue: 'properties available in Bali & surrounding islands', admin: { description: 'Ditampilkan setelah angka jumlah hasil (live count). Contoh hasil: "12 properties available in Bali & surrounding islands".' } },
    ]},
    // ── Related Services (default) ───────────────────────────────────────
    relatedServicesGlobalFields(),
    // ── Error / placeholder pages ──────────────────────────────────────
    { name: 'errorPages', type: 'group', label: 'Halaman Error & Placeholder', admin: { description: 'Copy untuk halaman 404 dan Coming Soon pages.' }, fields: [
      { name: 'notFound', type: 'group', label: '404 — Halaman Tidak Ditemukan', fields: [
        { name: 'title', type: 'text', defaultValue: 'Halaman Tidak Ditemukan' },
        { name: 'message', type: 'textarea', defaultValue: 'Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau modul-nya sedang dinonaktifkan.' },
        { name: 'buttonText', type: 'text', defaultValue: 'Kembali ke Beranda' },
      ]},
      { name: 'propertyComingSoon', type: 'group', label: '/property — Coming Soon', fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Coming Soon' },
        { name: 'title', type: 'text', defaultValue: 'Property & Land for Sale' },
        { name: 'description', type: 'textarea', defaultValue: 'Layanan property & land for sale di Bali sedang kami siapkan. Sementara ini, kalau kamu tertarik cari villa, tanah, atau rumah investasi di Bali, hubungi kami langsung — tim lokal kami siap bantu dengan listing eksklusif yang belum masuk website.' },
        { name: 'whatsappMessage', type: 'textarea', defaultValue: 'Halo DnJourneysBali! 👋\n\nSaya tertarik dengan Property & Land for Sale di Bali. Boleh info listing yang tersedia?' },
        { name: 'primaryButtonText', type: 'text', defaultValue: 'Enquire via WhatsApp' },
        { name: 'secondaryButtonText', type: 'text', defaultValue: 'Back to Home' },
      ]},
    ]},
  ],
}
