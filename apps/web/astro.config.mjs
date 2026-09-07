import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import cloudflare from '@astrojs/cloudflare'

// Phase 4.33 — switched from `output: 'static'` to `output: 'hybrid'` so
// the newsletter API endpoint (/api/newsletter-subscribe) can run
// server-side on Cloudflare Pages Functions. All existing pages stay
// pre-rendered (SSG) — only files that opt in with
// `export const prerender = false` execute on demand.
export default defineConfig({
  site: 'https://dnjourneysbali.com',
  output: 'hybrid',
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
