/**
 * Consolidated seed — Villa + Tour + Rental landing pages (CMS Pages)
 * + main-navigation menu update.
 *
 * Idempotent: safe run berulang. Existing page → update. Missing → create.
 * Nav item hanya di-append kalau belum ada.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-landing-pages.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

type LandingPageSeed = {
  slug: string
  navLabel: string
  page: any
}

const seeds: LandingPageSeed[] = [
  {
    slug: 'villa',
    navLabel: 'Villa',
    page: {
      title: 'Villas & Hotels Collection',
      slug: 'villa',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          // B1: hero-immersive (was editorial-featured default) — konsisten
          // dgn service landing lain. singleImage di-set runtime di run().
          layout: 'hero-immersive',
          eyebrow: 'The Collection',
          heading: 'Curated Tropical Sanctuary',
          description: "Discover Bali's most exclusive villas and hotels, where refined luxury meets the untamed beauty of the Indonesian archipelago.",
          serviceType: 'accommodations',
          accommodationTypes: ['villa', 'hotel', 'resort'],
          limit: 24,
          featuredMode: 'auto',
          mediaType: 'single',
          imageFit: 'cover',
          imagePosition: 'center',
          lazyLoad: true,
          heroOverlayOpacity: 45,
          heroMinHeight: 'md',
          enableDestinationFilter: true,
          enableSearch: true,
          searchNamePlaceholder: 'Where are you staying?',
          showDatePicker: true,
          showGuestCount: true,
          searchButtonText: 'Search Collection',
          cardVariant: 'detailed',
          showLoadMore: true,
          paginationType: 'pages',
          initialVisibleCount: 3,
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
    },
  },
  {
    slug: 'tour',
    navLabel: 'Tour',
    page: {
      title: 'Curated Bali Journeys',
      slug: 'tour',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          eyebrow: 'The Experiences',
          heading: 'Curated Bali Journeys',
          description: 'From sunrise trek at Mount Batur to hidden temple rituals — every itinerary hand-crafted for meaningful discovery.',
          serviceType: 'tours',
          limit: 24,
          featuredMode: 'auto',
          enableDestinationFilter: true,
          enableSearch: true,
          searchNamePlaceholder: 'Where do you want to explore?',
          sectionPadding: 'normal',
          containerWidth: 'wide',
          entryAnimation: 'reveal',
        },
        {
          blockType: 'trustBadges',
          heading: 'Local Guides, Real Stories',
          description: 'Our tours are led by Balinese guides who share the culture, history, and hidden spots — not tourist scripts.',
          primaryButtonText: 'Plan My Trip',
          primaryButtonLink: 'https://wa.me/6282386357012',
          secondaryButtonText: 'All Tours',
          secondaryButtonLink: '/tour',
          badges: [
            { iconName: 'verified_user',        title: 'Licensed',    subtitle: 'Certified Guides' },
            { iconName: 'group',                title: 'Small Groups', subtitle: 'Max 10 Guests' },
            { iconName: 'sentiment_satisfied',  title: 'Loved',        subtitle: '1000+ Happy Travelers' },
            { iconName: 'headset_mic',          title: '24/7 Support', subtitle: 'Live Assistance' },
          ],
          sectionPadding: 'compact',
          containerWidth: 'wide',
        },
      ],
      seo: {
        metaTitle: 'Bali Tours & Journeys | GtJourneysID',
        metaDescription: 'Hand-crafted tours across Bali, Nusa Penida, and Lembongan — led by local Balinese guides.',
      },
    },
  },
  {
    slug: 'rental',
    navLabel: 'Rental',
    page: {
      title: 'Rentals for Your Bali Journey',
      slug: 'rental',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          eyebrow: 'The Fleet',
          heading: 'Rentals for Every Journey',
          description: 'Motorbikes, cars, scooters, and gear — insured, well-maintained, delivered where you stay.',
          serviceType: 'rentals',
          limit: 24,
          featuredMode: 'auto',
          enableDestinationFilter: true,
          enableSearch: true,
          searchNamePlaceholder: 'What do you need to rent?',
          sectionPadding: 'normal',
          containerWidth: 'wide',
          entryAnimation: 'reveal',
        },
        {
          blockType: 'trustBadges',
          heading: 'Ride with Confidence',
          description: 'Every vehicle is insured, regularly serviced, and delivered to your accommodation. Roadside help available 24/7.',
          primaryButtonText: 'Book a Rental',
          primaryButtonLink: 'https://wa.me/6282386357012',
          secondaryButtonText: 'All Rentals',
          secondaryButtonLink: '/rental',
          badges: [
            { iconName: 'verified_user', title: 'Insured',      subtitle: 'Full Coverage' },
            { iconName: 'sell',          title: 'Best Rates',   subtitle: 'No Hidden Fees' },
            { iconName: 'support_agent', title: 'Road Support', subtitle: '24/7 Live Help' },
            { iconName: 'star',          title: 'Well Maintained', subtitle: 'Serviced Weekly' },
          ],
          sectionPadding: 'compact',
          containerWidth: 'wide',
        },
      ],
      seo: { metaTitle: 'Bali Rentals — Motorbike, Car, Gear | GtJourneysID', metaDescription: 'Insured motorbikes, cars, and gear rentals across Bali. Delivered to your accommodation.' },
    },
  },
  {
    slug: 'water-activity',
    navLabel: 'Water Activities',
    page: {
      title: 'Water Activities Collection',
      slug: 'water-activity',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          eyebrow: 'Ocean Adventures',
          heading: 'Dive Into the Blue',
          description: 'Snorkeling, diving, surfing, and thrilling watersports across the reefs and bays of Bali.',
          serviceType: 'water-activities',
          limit: 24, featuredMode: 'auto',
          enableDestinationFilter: true, enableSearch: true,
          searchNamePlaceholder: 'Find your adventure...',
          sectionPadding: 'normal', containerWidth: 'wide', entryAnimation: 'reveal',
        },
        {
          blockType: 'trustBadges',
          heading: 'Safety First, Fun Always',
          description: 'Certified guides, insured gear, and comprehensive safety briefings before every activity.',
          primaryButtonText: 'Ask Availability', primaryButtonLink: 'https://wa.me/6282386357012',
          secondaryButtonText: 'All Activities', secondaryButtonLink: '/water-activity',
          badges: [
            { iconName: 'verified_user',       title: 'Certified',   subtitle: 'PADI & Local Licensed' },
            { iconName: 'headset_mic',         title: 'Safety Briefing', subtitle: 'Before Every Trip' },
            { iconName: 'sentiment_satisfied', title: 'All Levels',  subtitle: 'Beginner Friendly' },
            { iconName: 'star',                title: 'Top Rated',   subtitle: 'Trusted by Locals' },
          ],
          sectionPadding: 'compact', containerWidth: 'wide',
        },
      ],
      seo: { metaTitle: 'Bali Water Activities | GtJourneysID', metaDescription: 'Snorkeling, diving, surfing, and watersports across Bali and Nusa islands.' },
    },
  },
  {
    slug: 'yacht',
    navLabel: 'Yacht',
    page: {
      title: 'Private Yacht Charters',
      slug: 'yacht',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          eyebrow: 'On the Water',
          heading: 'Private Yacht Experiences',
          description: 'Catamarans, motor yachts, and traditional phinisi — charter your own escape to hidden coves.',
          serviceType: 'yachts',
          limit: 24, featuredMode: 'auto',
          enableDestinationFilter: true, enableSearch: true,
          searchNamePlaceholder: 'Search yacht by name...',
          sectionPadding: 'normal', containerWidth: 'wide', entryAnimation: 'reveal',
        },
        {
          blockType: 'trustBadges',
          heading: 'Sail Bali in Comfort',
          description: 'Professional captain and crew, fully equipped vessels, and bespoke itineraries.',
          primaryButtonText: 'Charter Now', primaryButtonLink: 'https://wa.me/6282386357012',
          secondaryButtonText: 'All Yachts', secondaryButtonLink: '/yacht',
          badges: [
            { iconName: 'verified_user', title: 'Licensed',     subtitle: 'Certified Captains' },
            { iconName: 'star',          title: 'Premium Fleet', subtitle: 'Well-Maintained' },
            { iconName: 'support_agent', title: 'Full Service', subtitle: 'Crew Included' },
            { iconName: 'sell',          title: 'Custom Route', subtitle: 'Design Your Day' },
          ],
          sectionPadding: 'compact', containerWidth: 'wide',
        },
      ],
      seo: { metaTitle: 'Private Yacht Charters Bali | GtJourneysID', metaDescription: 'Charter catamarans, sailing yachts, and phinisi. Full crew, custom itineraries.' },
    },
  },
  {
    slug: 'restaurant',
    navLabel: 'Restaurant',
    page: {
      title: 'Restaurant Reservations',
      slug: 'restaurant',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          eyebrow: 'Taste of Bali',
          heading: 'Curated Dining Reservations',
          description: 'From beachside cafes to fine dining — hand-picked restaurants across the island.',
          serviceType: 'restaurants',
          limit: 24, featuredMode: 'auto',
          enableDestinationFilter: true, enableSearch: true,
          searchNamePlaceholder: 'Find restaurant...',
          sectionPadding: 'normal', containerWidth: 'wide', entryAnimation: 'reveal',
        },
        {
          blockType: 'trustBadges',
          heading: 'Reserve with Ease',
          description: 'We handle the booking so you focus on the meal. Priority tables, birthday setups, dietary requests.',
          primaryButtonText: 'Reserve a Table', primaryButtonLink: 'https://wa.me/6282386357012',
          secondaryButtonText: 'All Restaurants', secondaryButtonLink: '/restaurant',
          badges: [
            { iconName: 'verified_user', title: 'Verified',       subtitle: 'Hand-Picked Spots' },
            { iconName: 'star',          title: 'Top Rated',      subtitle: 'Local Favorites' },
            { iconName: 'headset_mic',   title: 'Priority',       subtitle: 'We Book For You' },
            { iconName: 'celebration',   title: 'Special Occasions', subtitle: 'Birthday, Anniversary' },
          ],
          sectionPadding: 'compact', containerWidth: 'wide',
        },
      ],
      seo: { metaTitle: 'Bali Restaurant Reservations | GtJourneysID', metaDescription: 'Hand-picked restaurants across Bali. We handle bookings, dietary requests, and special occasions.' },
    },
  },
  {
    slug: 'venue',
    navLabel: 'Venue',
    page: {
      title: 'Wedding & Event Venues',
      slug: 'venue',
      status: 'published',
      content: [
        {
          blockType: 'serviceListing',
          eyebrow: 'Your Special Day',
          heading: 'Wedding & Event Venues',
          description: 'Beach, garden, cliff, or chapel — find the perfect setting for your celebration.',
          serviceType: 'venues',
          limit: 24, featuredMode: 'auto',
          enableDestinationFilter: true, enableSearch: true,
          searchNamePlaceholder: 'Find venue...',
          sectionPadding: 'normal', containerWidth: 'wide', entryAnimation: 'reveal',
        },
        {
          blockType: 'trustBadges',
          heading: 'Celebrate in Paradise',
          description: 'Full-service coordination from vendors to decor, so you can enjoy the moment.',
          primaryButtonText: 'Plan Event', primaryButtonLink: 'https://wa.me/6282386357012',
          secondaryButtonText: 'All Venues', secondaryButtonLink: '/venue',
          badges: [
            { iconName: 'verified_user', title: 'Trusted',        subtitle: 'Vetted Venues' },
            { iconName: 'celebration',   title: 'Full Service',   subtitle: 'End-to-End Planning' },
            { iconName: 'support_agent', title: 'Dedicated',      subtitle: 'Personal Coordinator' },
            { iconName: 'star',          title: 'Memorable',      subtitle: 'Cherished Moments' },
          ],
          sectionPadding: 'compact', containerWidth: 'wide',
        },
      ],
      seo: { metaTitle: 'Wedding & Event Venues Bali | GtJourneysID', metaDescription: 'Beach, garden, cliff, chapel — venue for weddings and celebrations across Bali.' },
    },
  },
]

const run = async () => {
  const payload = await getPayload({ config })

  // B1: villa serviceListing (hero-immersive) butuh hero media — assign
  // runtime dari media yang tersedia (owner bisa ganti di admin).
  const mediaRes = await payload.find({ collection: 'media', limit: 30 })
  const heroImage = mediaRes.docs[6 % Math.max(mediaRes.docs.length, 1)]?.id ?? mediaRes.docs[0]?.id
  const villaSeed = seeds.find((s) => s.slug === 'villa')
  if (villaSeed && heroImage) (villaSeed.page.content[0] as any).singleImage = heroImage

  // ── 1. Seed 3 pages ─────────────────────────────────────────
  for (const seed of seeds) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: seed.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: seed.page,
      })
      process.stdout.write(`✓ Updated page "${seed.slug}" (id=${existing.docs[0].id}).\n`)
    } else {
      const created = await payload.create({ collection: 'pages', data: seed.page })
      process.stdout.write(`✓ Created page "${seed.slug}" (id=${created.id}).\n`)
    }
  }

  // ── 2. Update main-navigation menu ─────────────────────────
  const menuRes = await payload.find({
    collection: 'menus',
    where: { slug: { equals: 'main-navigation' } },
    limit: 1,
  })
  const menu = menuRes.docs[0]
  if (!menu) {
    process.stdout.write('\n⚠ Menu "main-navigation" tidak ada — skip nav update. Buat manual di CMS admin.\n')
  } else {
    let items = Array.isArray(menu.items) ? [...menu.items] : []
    const homeIdx = items.findIndex((it: any) => (it.label ?? '').toLowerCase() === 'home')
    let insertAt = homeIdx >= 0 ? homeIdx + 1 : items.length

    for (const seed of seeds) {
      const url = `/${seed.slug}`
      const exists = items.some((it: any) => it.url === url || it.label === seed.navLabel)
      if (exists) {
        process.stdout.write(`  · nav "${seed.navLabel}" already present — skip.\n`)
      } else {
        const newItem = { label: seed.navLabel, type: 'custom_url' as const, url, target: '_self' as const }
        items = [...items.slice(0, insertAt), newItem, ...items.slice(insertAt)]
        insertAt++
        process.stdout.write(`  ✓ nav "${seed.navLabel}" → ${url} added.\n`)
      }
    }

    await payload.update({
      collection: 'menus',
      id: menu.id,
      data: { items: items as any },
    })
    process.stdout.write(`\n✓ main-navigation menu updated (${items.length} items).\n`)
  }

  process.stdout.write('\n📝 Selanjutnya:\n')
  process.stdout.write('  1. Delete coded pages di apps/web/src/pages/villa/, /tour/, /rental/ (kalau ada) supaya CMS Page yg render\n')
  process.stdout.write('  2. Touch apps/web/src/pages/[...slug].astro → getStaticPaths re-scan\n')
  process.stdout.write('  3. Buka /villa, /tour, /rental di browser\n')
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack}\n`)
  process.exit(1)
})
