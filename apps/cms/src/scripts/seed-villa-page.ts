/**
 * Seed Villa page (CMS Pages collection) — idempotent.
 * Insert atau update Page slug='villa' dgn 2 block:
 *   1. ServiceListing (serviceType=accommodations, accommodationTypes=villa/hotel/resort)
 *   2. TrustBadges (concierge section, 4 badges)
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-villa-page.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const SLUG = 'villa'

const run = async () => {
  const payload = await getPayload({ config })

  // Hero image for hero-immersive layout (B1 — standardize villa to match
  // the other service landing pages). Pick any available media; owner can
  // swap in CMS admin.
  const mediaRes = await payload.find({ collection: 'media', limit: 30 })
  const heroImage = mediaRes.docs[6 % Math.max(mediaRes.docs.length, 1)]?.id ?? mediaRes.docs[0]?.id

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: SLUG } },
    limit: 1,
  })

  const pageData: any = {
    title: 'Villas & Hotels Collection',
    slug: SLUG,
    status: 'published',
    content: [
      {
        blockType: 'serviceListing',
        // B1: hero-immersive (was editorial-featured) — konsisten dgn
        // /tour, /restaurant, /yacht, dst.
        layout: 'hero-immersive',
        eyebrow: 'The Collection',
        heading: 'Curated Tropical Sanctuary',
        description: "Discover Bali's most exclusive villas and hotels, where refined luxury meets the untamed beauty of the Indonesian archipelago.",
        serviceType: 'accommodations',
        accommodationTypes: ['villa', 'hotel', 'resort'],
        limit: 24,
        featuredMode: 'auto',
        // Hero media
        mediaType: 'single',
        singleImage: heroImage,
        imageFit: 'cover',
        imagePosition: 'center',
        lazyLoad: true,
        heroOverlayOpacity: 45,
        heroMinHeight: 'md',
        // Filter & search
        enableDestinationFilter: true,
        enableSearch: true,
        searchNamePlaceholder: 'Where are you staying?',
        showDatePicker: true,
        showGuestCount: true,
        searchButtonText: 'Search Collection',
        // Cards + pagination
        cardVariant: 'detailed',
        showLoadMore: true,
        paginationType: 'pages',
        initialVisibleCount: 3,
        // Layout
        sectionPadding: 'normal',
        contentAlignment: 'center',
        containerWidth: 'wide',
        entryAnimation: 'reveal',
      },
      {
        blockType: 'trustBadges',
        heading: 'Bespoke Concierge Service',
        description: 'Beyond just a booking, we curate your entire journey. From private airport transfers to exclusive island expeditions, our local experts are at your service.',
        primaryButtonText: 'Inquire Now',
        primaryButtonLink: 'https://wa.me/6282386357012',
        secondaryButtonText: 'All Accommodations',
        secondaryButtonLink: '/villa',
        badges: [
          { iconName: 'verified_user', title: 'Verified',    subtitle: 'Inspected Property' },
          { iconName: 'support_agent', title: '24/7 Support', subtitle: 'On-Ground Help' },
          { iconName: 'sell',          title: 'Best Price',   subtitle: 'No Booking Fees' },
          { iconName: 'star',          title: 'Curated',      subtitle: 'Unique Experiences' },
        ],
        sectionPadding: 'compact',
        containerWidth: 'wide',
      },
    ],
    seo: {
      metaTitle: 'Villas & Hotels Collection | GtJourneysID',
      metaDescription: 'Curated luxury villas, hotels, and resorts across Bali, Nusa Penida, Lembongan, and Ceningan.',
    },
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data: pageData,
    })
    process.stdout.write(`✓ Updated existing "villa" page (id=${existing.docs[0].id}).\n`)
  } else {
    const created = await payload.create({
      collection: 'pages',
      data: pageData,
    })
    process.stdout.write(`✓ Created "villa" page (id=${created.id}).\n`)
  }

  process.stdout.write(`\nSetelah ini, delete coded page \`apps/web/src/pages/villa/index.astro\` supaya\n`)
  process.stdout.write(`CMS Page (via [...slug].astro) yg render /villa.\n`)
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack}\n`)
  process.exit(1)
})
