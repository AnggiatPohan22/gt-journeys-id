/**
 * Seed demo content — Pages with blocks sesuai page→block mapping.
 *
 * Pages: home, about, contact, privacy-policy, terms
 * (Landing pages villa/tour/rental/etc sudah ada di seed-landing-pages.ts)
 *
 * Idempotent: existing page → update, missing → create.
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-demo-content.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

const WA_LINK = 'https://wa.me/6282386357012?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services'

const richNode = (text: string) => ({
  root: {
    type: 'root',
    children: text.split('\n\n').map((para) => ({
      type: 'paragraph',
      children: [{ type: 'text', text: para, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const pages: { slug: string; data: any }[] = [
  // ── Homepage ────────────────────────────────────────────────────
  {
    slug: 'home',
    data: {
      title: 'Home',
      slug: 'home',
      status: 'published',
      content: [
        {
          blockType: 'hero',
          heading: "Discover Bali's Hidden Gems",
          subheading: 'Curated experiences across the Island of the Gods — from sacred temples to pristine shores.',
          ctaText: 'Explore Tours',
          ctaLink: '/tour',
          mediaType: 'none',
          sectionPadding: 'spacious',
        },
        {
          blockType: 'valuePropsBanner',
          items: [
            { iconName: 'badge', label: 'Curated Experiences', subtitle: 'Hand-picked by locals' },
            { iconName: 'support_agent', label: '24/7 Support', subtitle: 'On-ground assistance' },
            { iconName: 'sell', label: 'Best Price Guarantee', subtitle: 'No hidden booking fees' },
            { iconName: 'verified_user', label: 'Verified Partners', subtitle: 'Inspected & trusted' },
          ],
        },
        {
          blockType: 'serviceGrid',
          heading: 'Featured Tours',
          serviceType: 'tours',
          limit: 3,
          featuredOnly: true,
          showViewAll: true,
          viewAllText: 'View All Tours',
          viewAllLink: '/tour',
        },
        {
          blockType: 'serviceGrid',
          heading: 'Where to Stay',
          serviceType: 'accommodations',
          limit: 3,
          featuredOnly: true,
          showViewAll: true,
          viewAllText: 'View All Villas',
          viewAllLink: '/villa',
        },
        {
          blockType: 'serviceGrid',
          heading: 'On the Water',
          serviceType: 'water-activities',
          limit: 3,
          featuredOnly: true,
          showViewAll: true,
          viewAllText: 'View All Activities',
          viewAllLink: '/water-activity',
        },
        {
          blockType: 'statsBanner',
          eyebrow: 'Why Choose Us',
          heading: 'Your Journey is Our Priority',
          items: [
            { iconName: 'sentiment_satisfied', value: '1000+', caption: 'Happy Travelers' },
            { iconName: 'location_on', value: '50+', caption: 'Destinations' },
            { iconName: 'headset_mic', value: '24/7', caption: 'Live Support' },
            { iconName: 'star', value: '4.9', caption: 'Average Rating' },
          ],
        },
        {
          blockType: 'testimonialsCarousel',
          eyebrow: 'What Our Clients Say',
          heading: 'Memories That Last Forever',
          items: [
            { name: 'Sarah Mitchell', location: 'Australia', quote: 'The sunrise trek to Mount Batur was life-changing. Our guide knew every hidden path and shared stories that made the experience truly unforgettable. The breakfast overlooking the caldera was the cherry on top.', rating: 5 },
            { name: 'James & Emma', location: 'United Kingdom', quote: "We booked the villa through DN Journeys and couldn't have been happier. The property was even more beautiful than the photos, and the concierge team arranged everything from airport pickup to a private dinner on the beach.", rating: 5 },
            { name: 'Thomas Bergmann', location: 'Germany', quote: 'Best snorkeling experience of my life at Nusa Penida. The team took care of everything — gear, boat, lunch. Crystal clear waters and we saw manta rays up close. Absolutely worth every penny.', rating: 5 },
            { name: 'Yuki Tanaka', location: 'Japan', quote: 'The cultural tour around Ubud exceeded all expectations. Visiting the local temples with a Balinese guide who explained the ceremonies and traditions gave us such a deep appreciation for the culture.', rating: 5 },
            { name: 'Maria Santos', location: 'Brazil', quote: 'Rented a scooter for a week and explored the island at our own pace. The bike was in perfect condition and they delivered it right to our hotel. When we had a flat tire, roadside support came in 20 minutes!', rating: 4 },
            { name: 'David & Lisa Chen', location: 'Singapore', quote: 'Our wedding at the cliff-top venue was a dream come true. The DN Journeys team coordinated everything with the venue, florist, and photographer. We just showed up and enjoyed our special day.', rating: 5 },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Plan Your Bali Trip with Us',
          description: "Ready to explore the Island of the Gods? Our local team is here to craft your perfect Bali experience — from hidden waterfalls to sunset dinners, we'll handle every detail.",
          buttonText: 'Chat on WhatsApp',
          buttonLink: WA_LINK,
          mediaType: 'none',
        },
      ],
      seo: {
        metaTitle: 'GtJourneysID — Curated Bali Experiences',
        metaDescription: 'Discover curated tours, luxury villas, water activities, yacht charters, and more across Bali, Nusa Penida, and Lembongan.',
      },
    },
  },

  // ── About ───────────────────────────────────────────────────────
  {
    slug: 'about',
    data: {
      title: 'About Us',
      slug: 'about',
      status: 'published',
      content: [
        {
          blockType: 'hero',
          heading: 'About GtJourneysID',
          subheading: 'Your trusted partner for authentic Bali experiences since day one.',
          mediaType: 'none',
          sectionPadding: 'normal',
        },
        {
          blockType: 'richText',
          content: richNode(
            'Born from a deep love for Bali and a desire to share its hidden treasures with the world, GtJourneysID was founded by a team of local experts and travel enthusiasts. We believe that the best travel experiences come from authentic connections — with the land, the culture, and the people.\n\n' +
            'Our journey started in Nusa Ceningan, a small island nestled between Lembongan and Penida. From this tranquil base, we expanded our network across all of Bali, forging partnerships with villa owners, tour guides, boat captains, and restaurant chefs who share our commitment to quality.\n\n' +
            'Every experience we offer has been personally vetted. We visit the properties, we join the tours, we taste the food. When we recommend something, it is because we have experienced it ourselves and know it meets the standard our guests deserve.\n\n' +
            'Our mission is simple: to make every moment of your Bali journey exceptional. Whether you are seeking adventure on the waves, tranquility in a private villa, or celebration at a cliff-top venue, our concierge team is here to make it happen — seamlessly and memorably.'
          ),
          sectionPadding: 'normal',
          containerWidth: 'narrow',
        },
        {
          blockType: 'statsBanner',
          eyebrow: 'Our Track Record',
          heading: 'Numbers That Speak',
          items: [
            { iconName: 'calendar_month', value: '5+', caption: 'Years Experience' },
            { iconName: 'map', value: '2000+', caption: 'Tours Completed' },
            { iconName: 'group', value: '8000+', caption: 'Happy Guests' },
            { iconName: 'location_on', value: '50+', caption: 'Destinations Covered' },
          ],
        },
        {
          blockType: 'testimonialsCarousel',
          eyebrow: 'Guest Stories',
          heading: 'What Our Guests Say',
          // Source dari koleksi Testimonials (CMS) — featured only. Demonstrasi
          // block "use from collection" (bukan inline).
          source: 'collection',
          svc: 'all',
          onlyFeatured: true,
          maxItems: 6,
        },
        {
          blockType: 'cta',
          heading: 'Ready to Explore Bali?',
          description: 'Let our local experts craft your perfect island experience. No booking fees, no hidden costs — just unforgettable memories.',
          buttonText: 'Contact Us',
          buttonLink: WA_LINK,
          mediaType: 'none',
        },
      ],
      seo: {
        metaTitle: 'About Us | GtJourneysID',
        metaDescription: 'Meet the team behind GtJourneysID — local experts curating authentic Bali experiences since Nusa Ceningan.',
      },
    },
  },

  // ── Contact ─────────────────────────────────────────────────────
  {
    slug: 'contact',
    data: {
      title: 'Contact Us',
      slug: 'contact',
      status: 'published',
      content: [
        {
          blockType: 'hero',
          heading: 'Get in Touch',
          subheading: "We'd love to hear from you — whether you are planning a trip or just have a question.",
          mediaType: 'none',
          sectionPadding: 'compact',
        },
        {
          blockType: 'contact',
          showMap: true,
          showWhatsApp: true,
        },
        {
          blockType: 'cta',
          heading: 'Prefer WhatsApp?',
          description: 'Most of our guests find it easiest to reach us on WhatsApp. Send us a message and our team will respond within minutes during business hours.',
          buttonText: 'Chat on WhatsApp',
          buttonLink: WA_LINK,
          mediaType: 'none',
        },
      ],
      seo: {
        metaTitle: 'Contact | GtJourneysID',
        metaDescription: 'Reach us via WhatsApp, email, or visit our office in Nusa Ceningan, Bali.',
      },
    },
  },

  // ── Privacy Policy ──────────────────────────────────────────────
  {
    slug: 'privacy-policy',
    data: {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      status: 'published',
      content: [
        {
          blockType: 'richText',
          content: richNode(
            'Privacy Policy — GtJourneysID\n\n' +
            'Last updated: August 2026\n\n' +
            '1. Information We Collect\n\n' +
            'We collect personal information that you voluntarily provide when making inquiries or bookings through our website or WhatsApp. This includes your name, email address, phone number, travel dates, and booking preferences. We also collect standard web analytics data (page views, device type, browser) through privacy-respecting analytics tools.\n\n' +
            '2. How We Use Your Information\n\n' +
            'Your personal information is used solely to process your bookings, respond to inquiries, and improve our services. We do not sell, rent, or trade your personal data to third parties. Booking details are shared only with the specific service providers (hotels, tour operators, etc.) necessary to fulfill your reservation.\n\n' +
            '3. Data Storage and Security\n\n' +
            'Your data is stored securely using industry-standard encryption. We retain booking records for the duration required by Indonesian business regulations. You may request deletion of your personal data at any time by contacting us via WhatsApp or email.\n\n' +
            '4. Cookies\n\n' +
            'Our website uses essential cookies for basic functionality. We use privacy-respecting analytics (Cloudflare Web Analytics) that do not use cookies or track individual users. No third-party advertising cookies are used.\n\n' +
            '5. Third-Party Services\n\n' +
            'We use WhatsApp (Meta) for customer communication, Google Maps for location display, and Cloudflare for hosting and analytics. Each service has its own privacy policy. We do not control data collected directly by these platforms.\n\n' +
            '6. Your Rights\n\n' +
            'You have the right to access, correct, or delete your personal information. You may also withdraw consent for communications at any time. Contact us at the email or WhatsApp number listed on our Contact page to exercise these rights.\n\n' +
            '7. Changes to This Policy\n\n' +
            'We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.\n\n' +
            '8. Contact\n\n' +
            'For privacy-related questions, reach us via WhatsApp or email as listed on our Contact page.'
          ),
          sectionPadding: 'normal',
          containerWidth: 'narrow',
        },
      ],
      seo: {
        metaTitle: 'Privacy Policy | GtJourneysID',
        metaDescription: 'How GtJourneysID collects, uses, and protects your personal information.',
      },
    },
  },

  // ── Terms & Conditions ──────────────────────────────────────────
  {
    slug: 'terms',
    data: {
      title: 'Terms & Conditions',
      slug: 'terms',
      status: 'published',
      content: [
        {
          blockType: 'richText',
          content: richNode(
            'Terms & Conditions — GtJourneysID\n\n' +
            'Last updated: August 2026\n\n' +
            '1. General\n\n' +
            'GtJourneysID acts as a booking facilitator connecting travelers with local service providers including but not limited to hotels, villas, tour operators, yacht charters, restaurants, and rental companies in Bali, Indonesia. By using our services, you agree to these terms.\n\n' +
            '2. Bookings and Payments\n\n' +
            'All bookings are subject to availability. Prices displayed are indicative and may vary based on dates, group size, and specific requirements. Final pricing is confirmed via WhatsApp before payment. Payment methods and terms are communicated during the booking process. A deposit may be required to secure certain bookings.\n\n' +
            '3. Cancellations and Refunds\n\n' +
            'Cancellation policies vary by service provider. Generally, cancellations made more than 48 hours before the scheduled service are eligible for a full refund minus any processing fees. Cancellations within 48 hours may be subject to partial or no refund depending on the provider. Force majeure events (natural disasters, government restrictions) are handled on a case-by-case basis.\n\n' +
            '4. Service Provider Responsibility\n\n' +
            'GtJourneysID facilitates bookings but the services are provided by independent third-party operators. We vet all partners for quality and safety, but the service provider bears direct responsibility for the delivery of their service. Any disputes regarding service quality should be raised with us within 7 days of the service date.\n\n' +
            '5. Liability\n\n' +
            'GtJourneysID is not liable for injuries, losses, or damages arising from activities booked through our platform. Travelers are strongly advised to obtain comprehensive travel insurance covering medical emergencies, trip cancellations, and adventure activities. Participation in water activities, tours, and vehicle rentals is at your own risk.\n\n' +
            '6. Intellectual Property\n\n' +
            'All content on this website including text, images, logos, and design is the property of GtJourneysID and may not be reproduced without written permission.\n\n' +
            '7. Governing Law\n\n' +
            'These terms are governed by the laws of the Republic of Indonesia. Any disputes shall be resolved in the courts of Denpasar, Bali.\n\n' +
            '8. Changes\n\n' +
            'We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.\n\n' +
            '9. Contact\n\n' +
            'For questions about these terms, contact us via WhatsApp or email as listed on our Contact page.'
          ),
          sectionPadding: 'normal',
          containerWidth: 'narrow',
        },
      ],
      seo: {
        metaTitle: 'Terms & Conditions | GtJourneysID',
        metaDescription: 'Booking terms, cancellation policies, and conditions for using GtJourneysID services.',
      },
    },
  },
]

// ── Nav items to add ──────────────────────────────────────────────
const navItems = [
  { label: 'About', url: '/about' },
  { label: 'Contact', url: '/contact' },
]

const run = async () => {
  const payload = await getPayload({ config })

  log('═══ Seeding Demo Content Pages ═══\n')

  for (const { slug, data } of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data,
      })
      log(`✓ Updated page "${slug}" (id=${existing.docs[0].id})`)
    } else {
      const created = await payload.create({ collection: 'pages', data })
      log(`✓ Created page "${slug}" (id=${created.id})`)
    }
  }

  // ── Update main-navigation ──────────────────────────────────
  log('\n── Updating navigation ──')
  const menuRes = await payload.find({
    collection: 'menus',
    where: { slug: { equals: 'main-navigation' } },
    limit: 1,
  })
  const menu = menuRes.docs[0]
  if (!menu) {
    log('⚠ Menu "main-navigation" not found — skip nav update.')
  } else {
    let items = Array.isArray(menu.items) ? [...menu.items] : []

    for (const nav of navItems) {
      const exists = items.some((it: any) => it.url === nav.url || it.label === nav.label)
      if (exists) {
        log(`  · "${nav.label}" already in nav — skip`)
      } else {
        items.push({ label: nav.label, type: 'custom_url' as const, url: nav.url, target: '_self' as const })
        log(`  ✓ Added "${nav.label}" → ${nav.url}`)
      }
    }

    await payload.update({
      collection: 'menus',
      id: menu.id,
      data: { items: items as any },
    })
    log(`✓ Nav updated (${items.length} items)`)
  }

  log('\n═══ Done ═══')
  log('Pages seeded: ' + pages.map((p) => `/${p.slug}`).join(', '))
  log('\nNext steps:')
  log('  1. Start CMS: pnpm dev')
  log('  2. Start web: cd ../web && pnpm dev')
  log('  3. Open pages in browser to verify')
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack}\n`)
  process.exit(1)
})
