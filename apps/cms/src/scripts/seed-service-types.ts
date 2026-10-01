/**
 * Seed ServiceTypes — migrasi 7 service vertical dari config/modules.ts
 * (frontend hardcoded) ke CMS collection `service-types`.
 *
 * Idempotent: upsert by `key`. Slug diselaraskan dgn landing page CMS
 * yang sudah ada (tour, villa, water-activity, yacht, restaurant, venue, rental).
 *
 * PRASYARAT: restart CMS dulu supaya tabel `service_types` dibuat.
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-service-types.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

const richText = (text: string) => ({
  root: {
    type: 'root', version: 1, format: '', indent: 0, direction: 'ltr',
    children: [{
      type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr', textFormat: 0, textStyle: '',
      children: [{ type: 'text', version: 1, format: 0, mode: 'normal', style: '', text, detail: 0 }],
    }],
  },
})

type Seed = {
  key: string
  name: string
  slug: string
  order: number
  iconName: string
  description: string
  metaTitle: string
  metaDescription: string
  whatsappTemplate: string
}

const serviceTypes: Seed[] = [
  {
    key: 'tours', name: 'Tours & Activities', slug: 'tour', order: 1, iconName: 'temple_buddhist',
    description: 'Hand-crafted tours across Bali, Nusa Penida, and Lembongan — led by local Balinese guides.',
    metaTitle: 'Bali Tours & Journeys | GtJourneysID',
    metaDescription: 'Curated tours and activities across Bali — sunrise treks, cultural temples, island hopping.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya tertarik dengan tour *{{serviceName}}*.\nTanggal rencana: {{date}}\nBisa dibantu info & ketersediaan?',
  },
  {
    key: 'accommodations', name: 'Villas & Hotels', slug: 'villa', order: 2, iconName: 'villa',
    description: 'Curated luxury villas, hotels, and resorts across Bali and the Nusa islands.',
    metaTitle: 'Villas & Hotels Collection | GtJourneysID',
    metaDescription: 'Beachfront villas, cliff resorts, and boutique hotels — hand-picked and inspected.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya ingin booking *{{serviceName}}* di {{destination}}.\nCheck-in: {{date}}\nMohon info ketersediaan & harga.',
  },
  {
    key: 'water-activities', name: 'Water Activities', slug: 'water-activity', order: 3, iconName: 'scuba_diving',
    description: 'Snorkeling, diving, surfing, and watersports across the reefs and bays of Bali.',
    metaTitle: 'Bali Water Activities | GtJourneysID',
    metaDescription: 'Snorkeling with manta rays, diving at Crystal Bay, surfing lessons, and more.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya tertarik ikut *{{serviceName}}* di {{destination}}.\nTanggal: {{date}}\nBisa info harga & ketersediaan?',
  },
  {
    key: 'yachts', name: 'Private Yachts', slug: 'yacht', order: 4, iconName: 'sailing',
    description: 'Catamarans, motor yachts, and traditional phinisi — charter your own island escape.',
    metaTitle: 'Private Yacht Charters Bali | GtJourneysID',
    metaDescription: 'Charter catamarans, sailing yachts, and phinisi with full crew and custom itineraries.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya tertarik charter *{{serviceName}}*.\nTanggal: {{date}}\nBisa info paket & harga?',
  },
  {
    key: 'restaurants', name: 'Restaurants & Dining', slug: 'restaurant', order: 5, iconName: 'restaurant',
    description: 'From beachside cafes to cliff-top fine dining — hand-picked restaurants, booked for you.',
    metaTitle: 'Bali Restaurant Reservations | GtJourneysID',
    metaDescription: 'Reserve tables at Bali\'s best restaurants — we handle bookings and special requests.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya ingin reservasi meja di *{{serviceName}}* ({{destination}}).\nTanggal: {{date}}\nMohon konfirmasi ketersediaan.',
  },
  {
    key: 'venues', name: 'Weddings & Events', slug: 'venue', order: 6, iconName: 'celebration',
    description: 'Beach, garden, cliff, or chapel — the perfect setting for your celebration in paradise.',
    metaTitle: 'Wedding & Event Venues Bali | GtJourneysID',
    metaDescription: 'Beach, garden, cliff, and chapel venues for weddings and celebrations across Bali.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya tertarik venue *{{serviceName}}* untuk acara.\nTanggal acara: {{date}}\nBisa info paket & ketersediaan?',
  },
  {
    key: 'rentals', name: 'Rentals', slug: 'rental', order: 7, iconName: 'badge',
    description: 'Motorbikes, cars, scooters, and gear — insured, well-maintained, delivered where you stay.',
    metaTitle: 'Bali Rentals — Motorbike, Car, Gear | GtJourneysID',
    metaDescription: 'Insured motorbikes, cars, and gear rentals across Bali, delivered to your accommodation.',
    whatsappTemplate: 'Halo GtJourneysID! 👋 Saya ingin sewa *{{serviceName}}*.\nTanggal mulai: {{date}}\nBisa info harga & ketersediaan?',
  },
]

const run = async () => {
  const payload = await getPayload({ config })

  log('═══ Seeding Service Types ═══\n')
  for (const st of serviceTypes) {
    const existing = await payload.find({
      collection: 'service-types',
      where: { key: { equals: st.key } },
      limit: 1,
    })
    const data = {
      key: st.key,
      name: st.name,
      slug: st.slug,
      order: st.order,
      status: 'active',
      iconName: st.iconName,
      description: richText(st.description),
      whatsappTemplate: st.whatsappTemplate,
      metaTitle: st.metaTitle,
      metaDescription: st.metaDescription,
    }
    if (existing.docs[0]) {
      await payload.update({ collection: 'service-types', id: existing.docs[0].id, data })
      log(`✓ Updated "${st.name}" (${st.key})`)
    } else {
      await payload.create({ collection: 'service-types', data })
      log(`✓ Created "${st.name}" (${st.key})`)
    }
  }

  log('\n═══ Done — 7 service types seeded ═══')
  log('Next: pnpm generate:types, restart web dev, verify frontend.')
  process.exit(0)
}

run().catch((e) => { process.stderr.write(`Error: ${e.message}\n${e.stack}\n`); process.exit(1) })
