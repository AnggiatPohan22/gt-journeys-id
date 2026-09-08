import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import cloudflare from '@astrojs/cloudflare'

// Phase 4.33 — added @astrojs/cloudflare adapter so the newsletter
// API endpoint (/api/newsletter-subscribe) can run server-side on
// Cloudflare Pages Functions. Astro 5 removed the "hybrid" output
// option: `output: 'static'` (the default) now natively supports
// on-demand routes via `export const prerender = false`. All existing
// pages remain pre-rendered; only files that opt in execute on demand.
export default defineConfig({
  site: 'https://dnjourneysbali.com',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough' }),

  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],

  image: {
    domains: ['dn-journeys-media.r2.cloudflarestorage.com'],
  },
})
