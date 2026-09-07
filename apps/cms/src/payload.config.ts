import { buildConfig } from 'payload'
import {
  lexicalEditor,
  BoldFeature, ItalicFeature, UnderlineFeature, StrikethroughFeature,
  SubscriptFeature, SuperscriptFeature, InlineCodeFeature,
  ParagraphFeature, HeadingFeature, AlignFeature, IndentFeature,
  UnorderedListFeature, OrderedListFeature,
  LinkFeature, UploadFeature, RelationshipFeature,
  BlockquoteFeature, HorizontalRuleFeature,
  InlineToolbarFeature, FixedToolbarFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Tours } from './collections/Tours'
import { Accommodations } from './collections/Accommodations'
import { WaterActivities } from './collections/WaterActivities'
import { Yachts } from './collections/Yachts'
import { Restaurants } from './collections/Restaurants'
import { Venues } from './collections/Venues'
import { Rentals } from './collections/Rentals'
import { Destinations } from './collections/Destinations'
import { DestinationTypes } from './collections/DestinationTypes'
import { Categories } from './collections/Categories'
import { Menus } from './collections/Menus'
import { Testimonials } from './collections/Testimonials'
import { ServiceTypes } from './collections/ServiceTypes'
import { Spa } from './collections/Spa'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { HeaderSettings } from './globals/HeaderSettings'
import { FooterSettings } from './globals/FooterSettings'
import { SiteFeatures } from './globals/SiteFeatures'
import { HomepageContent } from './globals/HomepageContent'

export default buildConfig({
  // ── Editor ──────────────────────────────────
  // Explicit feature list untuk rich text editing (Phase 3.6):
  // paragraph, heading (h2-h4), bold/italic/underline/strike/sub/sup/code,
  // align/indent, ul/ol, link/upload/relationship, blockquote/hr,
  // inline & fixed toolbars, text color via TextStateFeature (mapped ke design tokens).
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      SubscriptFeature(),
      SuperscriptFeature(),
      InlineCodeFeature(),
      AlignFeature(),
      IndentFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature(),
      UploadFeature(),
      RelationshipFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      InlineToolbarFeature(),
      FixedToolbarFeature(),
      TextStateFeature({
        state: {
          color: {
            ocean:    { css: { color: '#1B3A4B' }, label: 'Ocean' },
            coral:    { css: { color: '#E07A5F' }, label: 'Coral' },
            leaf:     { css: { color: '#6B9080' }, label: 'Leaf' },
            stone:    { css: { color: '#3D405B' }, label: 'Stone' },
            midnight: { css: { color: '#0D1B2A' }, label: 'Midnight' },
          },
        },
      }),
    ],
  }),
  sharp, // auto resize gambar

  // ── CORS ────────────────────────────────────
  // Allow frontend origins to fetch API (metadata + media). Tanpa ini,
  // browser browser preview/frontend akan gagal load /api/media/file/*
  // dengan "Failed to fetch" karena Payload default same-origin only.
  cors: [
    'http://localhost:4321', // Astro dev
    'http://localhost:3030', // CMS admin self-origin
    process.env.SITE_URL ?? 'https://dnjourneysbali.com',
  ],

  // ── Database ────────────────────────────────
  // Local dev: file-based SQLite (auto-created)
  // Production (Cloudflare Workers): swap with D1 adapter driven by env.DB
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || `file:${path.resolve(dirname, '../cms.db')}`,
    },
    // Dev schema-push disabled: cold-start bisa memicu 2+ init paralel
    // (Payload's own getPayload cache tidak fully race-safe di boot),
    // dan dua `pushDevSchema` konkuren → "index already exists" 500.
    // Schema push kita jalankan manual/via migrasi (lihat docs/DB-SCHEMA-
    // CHANGES.md). Prod deploy tetap pakai migrations (PAYLOAD_MIGRATING).
    push: false,
  }),

  // ── Collections ─────────────────────────────
  collections: [
    // Content
    Pages,
    ServiceTypes,
    Destinations,
    DestinationTypes,
    Categories,
    Testimonials,
    // Services
    Tours,
    Accommodations,
    WaterActivities,
    Yachts,
    Restaurants,
    Venues,
    Rentals,
    Spa,
    // Site Builder
    Menus,
    Media,
    // Administration
    Users,
    NewsletterSubscribers,
  ],

  // ── Globals (Settings) ─────────────────────
  globals: [SiteSettings, HeaderSettings, FooterSettings, HomepageContent, SiteFeatures],

  // ── Admin ───────────────────────────────────
  admin: {
    user: Users.slug,
    // baseDir untuk resolve component paths di importMap.
    // Path yang mulai dgn `/` (mis. `/components/X#X`) di-resolve relatif ke baseDir ini.
    // Default Payload = project root, tapi struktur kita pakai `src/`.
    importMap: {
      baseDir: dirname,
    },
    components: {
      // Overview stats + recent activity di atas dashboard admin.
      beforeDashboard: ['/admin/DashboardStats#default'],
      // Tagline sambutan di halaman login.
      beforeLogin: ['/admin/BeforeLogin#default'],
      // Provider global: inject CSS brand ke semua route admin (Phase 4.1).
      // Phase 4.11: tambah MediaListEnhancer → self-mount View selector di
      // /admin/collections/media (self-hide di route lain).
      providers: [
        '/admin/AdminStyles#default',
        '/admin/MediaListEnhancer#default',
      ],
      // Brand mark menggantikan logo/icon default Payload (login + sidebar).
      graphics: {
        Logo: '/admin/graphics/Logo#default',
        Icon: '/admin/graphics/Icon#default',
      },
      // Header sidebar (logo giattech + close) lalu item Dashboard, di atas grup menu.
      beforeNavLinks: ['/admin/Giattech#default', '/admin/NavDashboardLink#default'],
      // Panel bawah sidebar (sticky, selalu terlihat): profil user + logout +
      // toggle tema, lalu accordion default-collapse (Phase 4.5).
      afterNavLinks: [
        '/admin/SidebarFooter#default',
        '/admin/NavAccordion#default',
      ],
    },
    meta: {
      titleSuffix: ' — DnJourneysBali CMS',
    },
  },

  // ── TypeScript ──────────────────────────────
  typescript: {
    outputFile: path.resolve(dirname, '../../../packages/shared/src/types/payload-types.ts'),
  },

  // ── Auth ────────────────────────────────────
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-THIS-SECRET-IN-PRODUCTION',
  serverURL: process.env.SERVER_URL || '',
})
