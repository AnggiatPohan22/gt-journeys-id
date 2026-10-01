/**
 * Seed / repair service landing pages content.
 *
 * Restores the `serviceListing` block (which shows the actual listing cards)
 * to the service landing pages that currently only have `trustBadges`, and
 * adds a new "Explore Bali" showcase page.
 *
 * Pages: tour, yacht, restaurant, rental, water-activity, venue, explore-bali
 *
 * NO schema change — only Page content (data). Safe from CMS 500.
 * serviceListing block shape mirrors the working /villa page (hero-immersive).
 *
 * Idempotent: existing page → update, missing → create.
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-service-landing-content.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

const WA = 'https://wa.me/6282386357012'

// Build a hero-immersive serviceListing block matching the working /villa shape.
const serviceListing = (opts: {
  eyebrow: string
  heading: string
  description: string
  serviceType: string
  heroImage: number
  searchPlaceholder: string
  accommodationTypes?: string[]
}) => ({
  blockType: 'serviceListing',
  layout: 'hero-immersive',
  eyebrow: opts.eyebrow,
  heading: opts.heading,
  description: opts.description,
  serviceType: opts.serviceType,
  accommodationTypes: opts.accommodationTypes ?? [],
  limit: 24,
  featuredMode: 'auto',
  // Hero media
  mediaType: 'single',
  singleImage: opts.heroImage,
  imageFit: 'cover',
  imagePosition: 'center',
  lazyLoad: true,
  heroOverlayOpacity: 45,
  heroMinHeight: 'md',
  // Filter & search
  enableDestinationFilter: true,
  enableSearch: true,
  searchNamePlaceholder: opts.searchPlaceholder,
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
})

const trustBadges = (opts: {
  heading: string
  description: string
  primaryText: string
  secondaryText: string
  secondaryLink: string
  badges: { iconName: string; title: string; subtitle: string }[]
}) => ({
  blockType: 'trustBadges',
  heading: opts.heading,
  description: opts.description,
  primaryButtonText: opts.primaryText,
  primaryButtonLink: WA,
  secondaryButtonText: opts.secondaryText,
  secondaryButtonLink: opts.secondaryLink,
  badges: opts.badges,
  sectionPadding: 'compact',
  containerWidth: 'wide',
})

const run = async () => {
  const payload = await getPayload({ config })

  // Fetch media IDs for hero backgrounds
  const mediaRes = await payload.find({ collection: 'media', limit: 30 })
  const mediaIds = mediaRes.docs.map((m) => m.id as number)
  if (mediaIds.length === 0) {
    process.stderr.write('❌ No media found. Upload images via CMS first.\n')
    process.exit(1)
  }
  const heroImg = (i: number) => mediaIds[i % mediaIds.length]

  // ── Page definitions ─────────────────────────────────────────
  const pages: { slug: string; navLabel: string; data: any }[] = [
    {
      slug: 'tour',
      navLabel: 'Tour',
      data: {
        title: 'Curated Bali Journeys',
        slug: 'tour',
        status: 'published',
        content: [
          serviceListing({
            eyebrow: 'The Experiences',
            heading: 'Curated Bali Journeys',
            description: 'From sunrise treks at Mount Batur to hidden temple rituals — every itinerary hand-crafted for meaningful discovery.',
            serviceType: 'tours',
            heroImage: heroImg(4),
            searchPlaceholder: 'Where do you want to explore?',
          }),
          trustBadges({
            heading: 'Local Guides, Real Stories',
            description: 'Our tours are led by Balinese guides who share the culture, history, and hidden spots — not tourist scripts.',
            primaryText: 'Plan My Trip', secondaryText: 'All Tours', secondaryLink: '/tour',
            badges: [
              { iconName: 'verified_user', title: 'Licensed', subtitle: 'Certified Guides' },
              { iconName: 'group', title: 'Small Groups', subtitle: 'Max 10 Guests' },
              { iconName: 'sentiment_satisfied', title: 'Loved', subtitle: '1000+ Happy Travelers' },
              { iconName: 'headset_mic', title: '24/7 Support', subtitle: 'Live Assistance' },
            ],
          }),
        ],
        seo: { metaTitle: 'Bali Tours & Journeys | GtJourneysID', metaDescription: 'Hand-crafted tours across Bali, Nusa Penida, and Lembongan — led by local Balinese guides.' },
      },
    },
    {
      slug: 'yacht',
      navLabel: 'Yacht',
      data: {
        title: 'Private Yacht Charters',
        slug: 'yacht',
        status: 'published',
        content: [
          serviceListing({
            eyebrow: 'On the Water',
            heading: 'Private Yacht Experiences',
            description: 'Catamarans, motor yachts, and traditional phinisi — charter your own escape to hidden coves and untouched reefs.',
            serviceType: 'yachts',
            heroImage: heroImg(8),
            searchPlaceholder: 'Search yacht by name...',
          }),
          trustBadges({
            heading: 'Sail Bali in Comfort',
            description: 'Professional captain and crew, fully equipped vessels, and bespoke itineraries tailored to your day.',
            primaryText: 'Charter Now', secondaryText: 'All Yachts', secondaryLink: '/yacht',
            badges: [
              { iconName: 'verified_user', title: 'Licensed', subtitle: 'Certified Captains' },
              { iconName: 'star', title: 'Premium Fleet', subtitle: 'Well-Maintained' },
              { iconName: 'support_agent', title: 'Full Service', subtitle: 'Crew Included' },
              { iconName: 'sell', title: 'Custom Route', subtitle: 'Design Your Day' },
            ],
          }),
        ],
        seo: { metaTitle: 'Private Yacht Charters Bali | GtJourneysID', metaDescription: 'Charter catamarans, sailing yachts, and phinisi across Bali. Full crew, custom itineraries.' },
      },
    },
    {
      slug: 'restaurant',
      navLabel: 'Restaurant',
      data: {
        title: 'Restaurant Reservations',
        slug: 'restaurant',
        status: 'published',
        content: [
          serviceListing({
            eyebrow: 'Taste of Bali',
            heading: 'Curated Dining Reservations',
            description: 'From beachside cafes to cliff-top fine dining — hand-picked restaurants across the island, booked for you.',
            serviceType: 'restaurants',
            heroImage: heroImg(12),
            searchPlaceholder: 'Find a restaurant...',
          }),
          trustBadges({
            heading: 'Reserve with Ease',
            description: 'We handle the booking so you focus on the meal. Priority tables, birthday setups, and dietary requests.',
            primaryText: 'Reserve a Table', secondaryText: 'All Restaurants', secondaryLink: '/restaurant',
            badges: [
              { iconName: 'verified_user', title: 'Verified', subtitle: 'Hand-Picked Spots' },
              { iconName: 'star', title: 'Top Rated', subtitle: 'Local Favorites' },
              { iconName: 'headset_mic', title: 'Priority', subtitle: 'We Book For You' },
              { iconName: 'celebration', title: 'Occasions', subtitle: 'Birthday, Anniversary' },
            ],
          }),
        ],
        seo: { metaTitle: 'Bali Restaurant Reservations | GtJourneysID', metaDescription: 'Hand-picked restaurants across Bali. We handle bookings, dietary requests, and special occasions.' },
      },
    },
    {
      slug: 'rental',
      navLabel: 'Rental',
      data: {
        title: 'Rentals for Your Bali Journey',
        slug: 'rental',
        status: 'published',
        content: [
          serviceListing({
            eyebrow: 'The Fleet',
            heading: 'Rentals for Every Journey',
            description: 'Motorbikes, cars, scooters, and gear — insured, well-maintained, and delivered where you stay.',
            serviceType: 'rentals',
            heroImage: heroImg(16),
            searchPlaceholder: 'What do you need to rent?',
          }),
          trustBadges({
            heading: 'Ride with Confidence',
            description: 'Every vehicle is insured, regularly serviced, and delivered to your accommodation. Roadside help available 24/7.',
            primaryText: 'Book a Rental', secondaryText: 'All Rentals', secondaryLink: '/rental',
            badges: [
              { iconName: 'verified_user', title: 'Insured', subtitle: 'Full Coverage' },
              { iconName: 'sell', title: 'Best Rates', subtitle: 'No Hidden Fees' },
              { iconName: 'support_agent', title: 'Road Support', subtitle: '24/7 Live Help' },
              { iconName: 'star', title: 'Maintained', subtitle: 'Serviced Weekly' },
            ],
          }),
        ],
        seo: { metaTitle: 'Bali Rentals — Motorbike, Car, Gear | GtJourneysID', metaDescription: 'Insured motorbikes, cars, and gear rentals across Bali. Delivered to your accommodation.' },
      },
    },
    {
      slug: 'water-activity',
      navLabel: 'Water Activities',
      data: {
        title: 'Water Activities Collection',
        slug: 'water-activity',
        status: 'published',
        content: [
          serviceListing({
            eyebrow: 'Ocean Adventures',
            heading: 'Dive Into the Blue',
            description: 'Snorkeling, diving, surfing, and thrilling watersports across the reefs and bays of Bali and the Nusa islands.',
            serviceType: 'water-activities',
            heroImage: heroImg(0),
            searchPlaceholder: 'Find your adventure...',
          }),
          trustBadges({
            heading: 'Safety First, Fun Always',
            description: 'Certified guides, insured gear, and comprehensive safety briefings before every activity.',
            primaryText: 'Ask Availability', secondaryText: 'All Activities', secondaryLink: '/water-activity',
            badges: [
              { iconName: 'verified_user', title: 'Certified', subtitle: 'PADI & Local Licensed' },
              { iconName: 'headset_mic', title: 'Safety Briefing', subtitle: 'Before Every Trip' },
              { iconName: 'sentiment_satisfied', title: 'All Levels', subtitle: 'Beginner Friendly' },
              { iconName: 'star', title: 'Top Rated', subtitle: 'Trusted by Locals' },
            ],
          }),
        ],
        seo: { metaTitle: 'Bali Water Activities | GtJourneysID', metaDescription: 'Snorkeling, diving, surfing, and watersports across Bali and Nusa islands.' },
      },
    },
    {
      slug: 'venue',
      navLabel: 'Wedding & Event',
      data: {
        title: 'Wedding & Event Venues',
        slug: 'venue',
        status: 'published',
        content: [
          serviceListing({
            eyebrow: 'Your Special Day',
            heading: 'Wedding & Event Venues',
            description: 'Beach, garden, cliff, or chapel — find the perfect setting for your celebration in paradise.',
            serviceType: 'venues',
            heroImage: heroImg(20),
            searchPlaceholder: 'Find a venue...',
          }),
          trustBadges({
            heading: 'Celebrate in Paradise',
            description: 'Full-service coordination from vendors to decor, so you can simply enjoy the moment.',
            primaryText: 'Plan Event', secondaryText: 'All Venues', secondaryLink: '/venue',
            badges: [
              { iconName: 'verified_user', title: 'Trusted', subtitle: 'Vetted Venues' },
              { iconName: 'celebration', title: 'Full Service', subtitle: 'End-to-End Planning' },
              { iconName: 'support_agent', title: 'Dedicated', subtitle: 'Personal Coordinator' },
              { iconName: 'star', title: 'Memorable', subtitle: 'Cherished Moments' },
            ],
          }),
        ],
        seo: { metaTitle: 'Wedding & Event Venues Bali | GtJourneysID', metaDescription: 'Beach, garden, cliff, chapel — venues for weddings and celebrations across Bali.' },
      },
    },
    // ── Explore Bali — multi-service showcase ────────────────────
    {
      slug: 'explore-bali',
      navLabel: 'Explore Bali',
      data: {
        title: 'Explore Bali',
        slug: 'explore-bali',
        status: 'published',
        content: [
          {
            blockType: 'hero',
            heading: 'Explore the Island of the Gods',
            subheading: 'One island, endless experiences. Discover tours, stays, adventures, and celebrations — all curated by local experts.',
            ctaText: 'Start Planning',
            ctaLink: WA,
            mediaType: 'single',
            singleImage: heroImg(2),
            imageFit: 'cover',
            imagePosition: 'center',
            sectionPadding: 'spacious',
          },
          {
            blockType: 'valuePropsBanner',
            items: [
              { iconName: 'map', label: '50+ Destinations', subtitle: 'Across Bali & Nusa Islands' },
              { iconName: 'badge', label: 'Local Experts', subtitle: 'Born & raised guides' },
              { iconName: 'support_agent', label: '24/7 Concierge', subtitle: 'Always here to help' },
              { iconName: 'verified_user', label: 'Trusted Partners', subtitle: 'Every vendor vetted' },
            ],
          },
          {
            blockType: 'serviceGrid', heading: 'Popular Tours', serviceType: 'tours',
            limit: 3, featuredOnly: false, showViewAll: true, viewAllText: 'All Tours', viewAllLink: '/tour',
          },
          {
            blockType: 'serviceGrid', heading: 'Where to Stay', serviceType: 'accommodations',
            limit: 3, featuredOnly: false, showViewAll: true, viewAllText: 'All Stays', viewAllLink: '/villa',
          },
          {
            blockType: 'serviceGrid', heading: 'Ocean Adventures', serviceType: 'water-activities',
            limit: 3, featuredOnly: false, showViewAll: true, viewAllText: 'All Activities', viewAllLink: '/water-activity',
          },
          {
            blockType: 'serviceGrid', heading: 'Private Yachts', serviceType: 'yachts',
            limit: 3, featuredOnly: false, showViewAll: true, viewAllText: 'All Yachts', viewAllLink: '/yacht',
          },
          {
            blockType: 'statsBanner',
            eyebrow: 'Why Explore With Us',
            heading: 'Your Island, Perfectly Planned',
            items: [
              { iconName: 'sentiment_satisfied', value: '8000+', caption: 'Happy Travelers' },
              { iconName: 'location_on', value: '50+', caption: 'Destinations' },
              { iconName: 'map', value: '7', caption: 'Service Categories' },
              { iconName: 'star', value: '4.9', caption: 'Average Rating' },
            ],
          },
          {
            blockType: 'cta',
            heading: 'Ready to Explore Bali?',
            description: "Tell us your travel dates and interests — our local team will craft a personalized itinerary just for you. No booking fees, no pressure.",
            buttonText: 'Chat on WhatsApp',
            buttonLink: WA,
            mediaType: 'none',
          },
        ],
        seo: { metaTitle: 'Explore Bali — Tours, Stays & Adventures | GtJourneysID', metaDescription: 'Discover everything Bali offers: tours, villas, water activities, yachts, dining, and events — curated by local experts.' },
      },
    },
  ]

  log('═══ Seeding Service Landing Pages ═══\n')
  for (const { slug, data } of pages) {
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
    if (existing.docs[0]) {
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data })
      log(`✓ Updated "${slug}" (id=${existing.docs[0].id})`)
    } else {
      const created = await payload.create({ collection: 'pages', data })
      log(`✓ Created "${slug}" (id=${created.id})`)
    }
  }

  // ── Verify serviceListing persisted ──────────────────────────
  log('\n── Verifying serviceListing persisted ──')
  for (const { slug } of pages) {
    const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const blocks = ((res.docs[0] as any)?.content ?? []).map((b: any) => b.blockType)
    log(`  /${slug}: ${blocks.join(', ')}`)
  }

  // ── Add "Explore Bali" nav item ──────────────────────────────
  log('\n── Updating navigation ──')
  const menuRes = await payload.find({ collection: 'menus', where: { slug: { equals: 'main-navigation' } }, limit: 1 })
  const menu = menuRes.docs[0]
  if (menu) {
    let items = Array.isArray(menu.items) ? [...menu.items] : []
    const exists = items.some((it: any) => it.url === '/explore-bali' || it.label === 'Explore Bali')
    if (exists) {
      log('  · "Explore Bali" already in nav — skip')
    } else {
      // Insert after Home
      const homeIdx = items.findIndex((it: any) => (it.label ?? '').toLowerCase() === 'home')
      const at = homeIdx >= 0 ? homeIdx + 1 : items.length
      items = [...items.slice(0, at), { label: 'Explore Bali', type: 'custom_url' as const, url: '/explore-bali', target: '_self' as const }, ...items.slice(at)]
      await payload.update({ collection: 'menus', id: menu.id, data: { items: items as any } })
      log('  ✓ Added "Explore Bali" → /explore-bali')
    }
  } else {
    log('  ⚠ main-navigation not found — skip')
  }

  log('\n═══ Done ═══')
  log('Next: restart web dev + touch [...slug].astro, then verify pages.')
  process.exit(0)
}

run().catch((e) => { process.stderr.write(`Error: ${e.message}\n${e.stack}\n`); process.exit(1) })
