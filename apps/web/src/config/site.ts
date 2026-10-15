/**
 * Fallback site config — used when CMS data isn't available yet.
 * In production, all values come from CMS SiteSettings global.
 *
 * Brand = GtJourneysID (umbrella, general-purpose). Per-instance deployments
 * (Bali, Jakarta, etc.) override these via CMS SiteSettings.
 */
export const siteConfig = {
  name: 'GtJourneysID',
  tagline: 'Explore Indonesia with Local Expertise',
  url: 'https://example.com', // TODO: set production domain

  contact: {
    email: 'hello@example.com',
    phone: '+62-xxx-xxxx-xxxx',
    whatsapp: '62xxxxxxxxxxx',
    address: 'Indonesia',
  },

  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    tripadvisor: '',
  },

  defaultSeo: {
    title: 'GtJourneysID — Tours, Stays, and Experiences in Indonesia',
    description: 'Discover Indonesia with local expertise. Tours, accommodations, water activities, ferry tickets, dining, and more.',
    ogImage: '/og-default.jpg',
  },
}
