/**
 * Seed the /blog index page — CMS Page slug='blog' with 5 blocks
 * matching ai/reference/blog:
 *
 *   1. Hero              — full-bleed heading + subheading + bg image
 *   2. FeaturedPost      — "Popular Posts" (auto: isFeatured first)
 *   3. CategoryGrid      — "Explore by Category" tiles (module=blog)
 *   4. PostList          — "Latest Stories" 3-col grid
 *   5. Newsletter        — inline signup (sand theme, stacked layout)
 *
 * Idempotent: existing page (slug='blog') → update; missing → create.
 * Also appends "Blog" to the main-navigation menu if not already there.
 *
 * Run:
 *   cd apps/cms
 *   pnpm tsx src/scripts/seed-blog-index-page.ts
 *
 * NOTE: stop `pnpm dev` for CMS first (SQLite exclusive lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const run = async () => {
  const payload = await getPayload({ config })

  // ── Pick a hero image (first available Media) ─────────────
  const mediaRes = await payload.find({ collection: 'media', limit: 30 })
  const heroImageId = mediaRes.docs[0]?.id
  if (!heroImageId) {
    process.stdout.write('⚠ No media in Media library — upload at least 1 image to /admin/collections/media then re-run.\n')
    process.exit(1)
  }

  // ── Compose the page content (5 blocks) ───────────────────
  const pageData: any = {
    title: 'Blog',
    slug: 'blog',
    status: 'published',
    template: 'landing',
    content: [
      // 1. Hero
      {
        blockType: 'hero',
        heading: 'Travel Stories from Bali',
        subheading: 'Explore the island through expert guides, hidden gems, and unforgettable adventures curated by our travel editors.',
        mediaType: 'single',
        singleImage: heroImageId,
        imageFit: 'cover',
        imagePosition: 'center',
        // Advanced (from advancedStyleFields):
        contentAlignment: 'center',
        containerWidth: 'wide',
      },

      // 2. FeaturedPost (auto → isFeatured first + latest)
      {
        blockType: 'featuredPost',
        heading: 'Popular Posts',
        selectionMode: 'auto',
      },

      // 3. CategoryGrid — "Explore by Category" (module=blog)
      {
        blockType: 'categoryGrid',
        heading: 'Explore by Category',
        module: 'blog',
        limit: 6,
        columns: '3',
        showCount: true,
      },

      // 4. PostList — "Latest Stories" 3-col
      {
        blockType: 'postList',
        heading: 'Latest Stories',
        description: 'The freshest guides, itineraries, and island stories.',
        limit: 6,
        featuredOnly: false,
        columns: '3',
        showViewAll: false, // no "View All" needed — this IS the index
        viewAllText: 'View All',
        viewAllLink: '/blog',
      },

      // 5. Newsletter (inline, stacked layout — matches reference)
      {
        blockType: 'newsletter',
        heading: 'Never Miss a Story',
        description: 'Subscribe to our newsletter for the latest travel insights, exclusive offers, and island inspiration delivered directly to your inbox.',
        placeholderText: 'Your email address',
        buttonLabel: 'Subscribe',
        successMessage: "Thanks! We'll be in touch.",
        errorMessage: 'Something went wrong. Please try again.',
        theme: 'sand',
        layout: 'stacked',
      },
    ],
    seo: {
      metaTitle: 'Bali Travel Stories & Guides | GtJourneysID',
      metaDescription: 'Expert travel guides, hidden gems, and unforgettable adventures — stories from the heart of Bali by our editors.',
    },
  }

  // ── Upsert page ───────────────────────────────────────────
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'blog' } },
    limit: 1,
  })
  if (existing.docs[0]) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data: pageData })
    process.stdout.write(`✓ Updated /blog page (id=${existing.docs[0].id}) — 5 blocks refreshed.\n`)
  } else {
    const created = await payload.create({ collection: 'pages', data: pageData })
    process.stdout.write(`✓ Created /blog page (id=${created.id}) with 5 blocks.\n`)
  }

  // ── Append "Blog" to main-navigation menu (idempotent) ────
  const menuRes = await payload.find({
    collection: 'menus',
    where: { slug: { equals: 'main-navigation' } },
    limit: 1,
  })
  const menu = menuRes.docs[0]
  if (!menu) {
    process.stdout.write('\n⚠ menu "main-navigation" not found — skip nav add. Add "Blog → /blog" manually via CMS admin.\n')
  } else {
    const items: any[] = Array.isArray(menu.items) ? [...menu.items] : []
    const exists = items.some((it: any) => it.url === '/blog' || (it.label ?? '').toLowerCase() === 'blog')
    if (exists) {
      process.stdout.write('  · nav "Blog" already present — skip.\n')
    } else {
      items.push({ label: 'Blog', type: 'custom_url', url: '/blog', target: '_self' })
      await payload.update({ collection: 'menus', id: menu.id, data: { items: items as any } })
      process.stdout.write('  ✓ nav "Blog → /blog" added to main-navigation.\n')
    }
  }

  process.stdout.write('\n📝 Next:\n')
  process.stdout.write('  1. Touch apps/web/src/pages/[...slug].astro so Astro re-runs getStaticPaths.\n')
  process.stdout.write('  2. Open http://localhost:4321/blog — verify all 5 sections.\n')
  process.stdout.write('  3. Optional: swap Hero image in CMS admin (Pages → Blog → Hero block → Media).\n')
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`✗ seed failed: ${e?.message ?? String(e)}\n`)
  if (e?.stack) process.stderr.write(e.stack + '\n')
  process.exit(1)
})
