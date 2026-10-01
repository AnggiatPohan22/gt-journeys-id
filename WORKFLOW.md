# WORKFLOW.md — Development Workflow & Sync Guide

Dokumen ini menjelaskan urutan kerja yang benar saat membangun fitur,
dari definisi data (collection) sampai tampil di frontend.
Ikuti urutan ini agar backend dan frontend selalu sinkron.

---

## 1. The Rule: Always Backend First, Frontend Second

```
URUTAN KERJA YANG BENAR:

  ① Collection Config (apps/cms)     ← definisi data
  ② Reusable Fields (apps/cms)       ← field groups kalau perlu
  ③ Access Control (apps/cms)        ← siapa boleh apa
  ④ Test di CMS Admin Panel          ← pastikan form & data benar
  ⑤ Shared Types (packages/shared)   ← TypeScript interfaces
  ⑥ API Client (apps/web/lib)        ← fetch function
  ⑦ Frontend Components (apps/web)   ← UI rendering
  ⑧ Pages (apps/web/pages)           ← routing & data fetching
  ⑨ Animations & Polish              ← GSAP, hover states
  ⑩ SEO & Meta                       ← structured data, sitemap

URUTAN YANG SALAH (jangan lakukan):

  ❌ Bikin frontend dulu, baru mikirin data structure
  ❌ Bikin page tanpa test API response dulu
  ❌ Skip shared types → frontend pakai `any` everywhere
  ❌ Bikin collection tanpa test di admin panel
```

---

## 2. Workflow Per Fitur — Contoh: Tambah Module Baru

Misalnya kita mau tambahkan module "Spa & Wellness".

### Step 1: Definisi Collection (apps/cms)

Buat file baru `apps/cms/src/collections/Spas.ts`:

```typescript
import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { pricingFields } from '../fields/pricing'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'

export const Spas: CollectionConfig = {
  slug: 'spas',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'destination', 'status'],
  },
  access: {
    read: () => true,
    create: adminCreate,
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar' },
    },
    { name: 'destination', type: 'relationship', relationTo: 'destinations' },
    { name: 'description', type: 'richText', required: true },
    // ... fields spesifik spa ...
    pricingFields,
    { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'gallery', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
    ]},
    whatsappField,
    seoFields,
    statusField,
    sortOrderField,
    isFeaturedField,
  ],
}
```

### Step 2: Register di Payload Config

Edit `apps/cms/src/payload.config.ts`:

```typescript
import { Spas } from './collections/Spas'

export default buildConfig({
  collections: [
    // ... existing collections ...
    Spas,  // ← tambah di sini
  ],
  // ...
})
```

### Step 3: Test di CMS Admin Panel

```powershell
cd apps/cms
pnpm dev
```

Buka `http://localhost:3000/admin`:
- ✅ "Spas" muncul di sidebar group "Services"
- ✅ Klik → form muncul dengan semua field
- ✅ Coba tambah 1 entry test → save berhasil
- ✅ Buka `http://localhost:3000/api/spas` → JSON muncul

**JANGAN lanjut ke frontend kalau step ini belum passed.**

### Step 4: Update Shared Types

Edit `packages/shared/src/types/payload-types.ts`:

```typescript
export interface Spa {
  id: string
  name: string
  slug: string
  destination?: Destination
  description: any
  pricing?: Pricing
  featuredImage: Media
  gallery?: { image: Media }[]
  whatsappMessage?: string
  seo?: SEO
  status: 'draft' | 'published'
  sortOrder?: number
  isFeatured?: boolean
  createdAt: string
  updatedAt: string
}
```

Atau jalankan auto-generate (kalau sudah di-setup):
```powershell
pnpm generate:types
```

### Step 5: Tambah API Client Function

Edit `apps/web/src/lib/payload.ts`:

```typescript
export const getSpas = (opts?: Partial<FetchOptions>) =>
  fetchCollection<Spa>({ collection: 'spas', ...opts })

export const getSpaBySlug = (slug: string) =>
  fetchBySlug<Spa>('spas', slug)
```

### Step 6: Test API Response

Sebelum bikin UI, test dulu response-nya:

```typescript
// Temporary test di halaman apapun
const { docs } = await getSpas({ limit: 5 })
console.log(docs)
```

Pastikan data structure sesuai dengan type yang kamu definisikan.

### Step 7: Buat Frontend Components

```
apps/web/src/
  components/
    cards/SpaCard.astro        ← card untuk listing
  pages/
    spas/
      index.astro              ← listing page
      [slug].astro             ← detail page
```

**SpaCard.astro:**
```astro
---
import type { Spa } from '@shared/types/payload-types'
import { formatPrice } from '@shared/utils/format-price'

interface Props { spa: Spa }
const { spa } = Astro.props
---

<article class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
  <img src={spa.featuredImage.url} alt={spa.featuredImage.alt} class="w-full aspect-[4/3] object-cover" />
  <div class="p-4">
    <h3 class="font-display text-lg text-ocean">{spa.name}</h3>
    {spa.pricing?.adultPrice && (
      <p class="text-coral font-semibold">
        {formatPrice(spa.pricing.adultPrice, spa.pricing.currency)}
      </p>
    )}
    <a href={`/spas/${spa.slug}`} class="text-sm text-ocean underline mt-2 inline-block">
      View Details →
    </a>
  </div>
</article>
```

**spas/index.astro:**
```astro
---
import PageLayout from '@layouts/PageLayout.astro'
import SpaCard from '@components/cards/SpaCard.astro'
import { getSpas } from '@lib/payload'

const { docs: spas } = await getSpas({ limit: 20, sort: 'sortOrder' })
---

<PageLayout title="Spa & Wellness">
  <section class="section-padding">
    <div class="container-content">
      <h1 class="font-display text-4xl mb-8" data-animate="reveal">Spa & Wellness</h1>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-animate="stagger">
        {spas.map(spa => <SpaCard spa={spa} />)}
      </div>
    </div>
  </section>
</PageLayout>
```

### Step 8: Register Module di Config

Edit `apps/web/src/config/modules.ts`:

```typescript
export const modules = {
  // ... existing modules ...
  spas: {
    enabled: true,
    label: 'Spa & Wellness',
    slug: 'spas',
    icon: 'sparkles',
    collection: 'spas',
  },
}
```

### Step 9: Test Full Flow

```
✅ CMS: bisa create/edit/delete spa entries
✅ API: /api/spas returns correct JSON
✅ Listing: /spas shows all published spas
✅ Detail: /spas/[slug] shows full spa info
✅ WhatsApp: booking button generates correct WA link
✅ Mobile: responsive layout works
✅ Animation: scroll reveal working
```

### Step 10: Commit

```powershell
git add .
git commit -m "[cms] Add Spas collection
[shared] Add Spa type interface
[web] Add spa listing and detail pages"
```

---

## 3. Workflow: Edit Existing Collection

Misalnya mau tambah field "rating" ke Tours.

### Step 1: Tambah Field di Collection Config

Edit `apps/cms/src/collections/Tours.ts`:

```typescript
fields: [
  // ... existing fields ...

  // Tambah field baru
  {
    name: 'rating',
    type: 'number',
    min: 0,
    max: 5,
    admin: {
      description: 'Average rating (0-5)',
      step: 0.1,
    },
  },

  // ... rest of fields ...
]
```

### Step 2: Restart CMS & Test

```powershell
# Restart CMS dev server
cd apps/cms
# Ctrl+C → pnpm dev

# Buka admin panel → Tours → edit entry → field "rating" muncul
# Isi rating di beberapa tours → save
```

Payload auto-migrate — field baru langsung tersedia,
data existing tetap aman (field baru = null sampai diisi).

### Step 3: Update Shared Type

Edit `packages/shared/src/types/payload-types.ts`:

```typescript
export interface Tour {
  // ... existing fields ...
  rating?: number  // ← tambah
}
```

### Step 4: Update Frontend (kalau perlu tampilkan)

Edit component yang perlu menampilkan rating:

```astro
{tour.rating && (
  <span class="text-coral font-semibold">★ {tour.rating.toFixed(1)}</span>
)}
```

### Step 5: Test & Commit

```powershell
git add .
git commit -m "[cms] Add rating field to Tours
[shared] Update Tour type with rating
[web] Display tour rating on cards"
```

---

## 4. Workflow: Content dari CMS ke Frontend (Sync Flow)

Ini yang terjadi saat content berubah:

### Development (Lokal)

```
Editor save content di CMS admin
        ↓
Data masuk ke SQLite (lokal)
        ↓
Frontend `pnpm dev` auto-refresh (HMR)
        ↓
Astro re-fetch dari CMS API
        ↓
Halaman update di browser
```

Astro dev server otomatis re-fetch saat page di-refresh.
Tidak perlu restart Astro — cukup refresh browser.

### Production

```
Editor save content di CMS admin (Cloudflare Workers)
        ↓
Data masuk ke D1 database
        ↓
Payload afterChange hook fires
        ↓
Webhook hit Cloudflare Pages build hook
        ↓
Cloudflare Pages rebuild frontend (30-60 detik)
        ↓
New static HTML deployed ke CDN
        ↓
Visitor lihat content terbaru
```

Build time 30-60 detik itu normal untuk static site.
Content yang sering berubah (harga, availability) bisa pakai
Astro hybrid mode (SSR untuk halaman tertentu) agar real-time.

---

## 5. Workflow: Menambah Block Baru (Page Builder)

Misalnya mau tambah block "Pricing Table".

### Step 1: Definisi Block (apps/cms)

Edit `apps/cms/src/blocks/index.ts`:

```typescript
const PricingTable: Block = {
  slug: 'pricingTable',
  labels: { singular: 'Pricing Table', plural: 'Pricing Tables' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Our Packages' },
    {
      name: 'packages',
      type: 'array',
      required: true,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'currency', type: 'select', defaultValue: 'IDR',
          options: [{ label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' }],
        },
        { name: 'features', type: 'array', fields: [
          { name: 'text', type: 'text', required: true },
        ]},
        { name: 'isPopular', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}

// Tambah ke export
export const blocks: Block[] = [
  Hero, RichText, ImageBlock, Gallery, CTA, FAQ,
  Testimonials, ServiceGrid, Contact, Embed, Spacer,
  PricingTable,  // ← tambah
]
```

### Step 2: Test di CMS

Buka admin → Pages → edit halaman → tambah block "Pricing Table" →
isi data → save → cek API response di `/api/pages/[id]`.

### Step 3: Buat Block Renderer (apps/web)

Buat `apps/web/src/components/blocks/PricingTableBlock.astro`:

```astro
---
import { formatPrice } from '@shared/utils/format-price'

interface Props {
  heading?: string
  packages: {
    name: string
    price: number
    currency: 'IDR' | 'USD'
    features?: { text: string }[]
    isPopular?: boolean
  }[]
}

const { heading, packages } = Astro.props
---

<section class="section-padding bg-sand-light" data-animate="reveal">
  <div class="container-content">
    {heading && <h2 class="font-display text-3xl text-center mb-12">{heading}</h2>}
    <div class="grid md:grid-cols-3 gap-6" data-animate="stagger">
      {packages.map(pkg => (
        <div class:list={[
          'bg-white rounded-xl p-6 text-center',
          pkg.isPopular && 'ring-2 ring-coral shadow-lg scale-105',
        ]}>
          {pkg.isPopular && <span class="text-xs font-semibold text-coral uppercase">Most Popular</span>}
          <h3 class="font-display text-xl mt-2">{pkg.name}</h3>
          <p class="text-3xl font-bold text-coral my-4">
            {formatPrice(pkg.price, pkg.currency)}
          </p>
          <ul class="text-sm text-stone space-y-2">
            {pkg.features?.map(f => <li>✓ {f.text}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Step 4: Register di BlockRenderer

Edit `apps/web/src/components/blocks/BlockRenderer.astro`:

```astro
---
import PricingTableBlock from './PricingTableBlock.astro'

// Tambah ke blockComponents map
const blockComponents = {
  // ... existing blocks ...
  pricingTable: PricingTableBlock,
}
---
```

### Step 5: Test & Commit

```
✅ CMS: block muncul di page editor, bisa diisi
✅ API: block data muncul di page JSON response
✅ Frontend: halaman menampilkan pricing table
✅ Responsive: layout stack di mobile
```

---

## 6. Workflow: Menu & Navigation Sync

### Step 1: Isi Menu di CMS

CMS admin → Menus → buat menu "main-navigation":

```
Main Navigation
├── Home          → /
├── Tours         → /tours
├── Stay          → /accommodations
│   ├── Villas    → /accommodations?type=villa
│   └── Hotels    → /accommodations?type=hotel
├── Water Sports  → /water-activities
├── Yacht         → /yacht
├── Dining        → /restaurants
├── Weddings      → /weddings
├── Rentals       → /rentals
├── About         → /about
└── Contact       → /contact
```

### Step 2: Frontend Fetch Menu

```astro
---
// Di Header.astro
import { getMenuBySlug } from '@lib/payload'

const menu = await getMenuBySlug('main-navigation')
---

<nav>
  {menu?.items?.map(item => (
    <div class="relative group">
      <a href={item.url || '#'} target={item.target}>
        {item.label}
      </a>
      {item.children?.length > 0 && (
        <div class="hidden group-hover:block absolute bg-white shadow-lg rounded-lg p-2">
          {item.children.map(child => (
            <a href={child.url} class="block px-4 py-2 hover:bg-sand rounded">
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  ))}
</nav>
```

Menu sepenuhnya CMS-driven — tidak ada hardcoded navigation.
Super-admin bisa ubah menu kapanpun tanpa edit code.

---

## 7. Daily Development Checklist

Setiap kali mulai kerja, ikuti checklist ini:

```
□ Baca AGENTS.md (sudah? skip)
□ Pull latest dari git
□ pnpm install (kalau ada dependency baru)
□ Start CMS: cd apps/cms && pnpm dev
□ Start Frontend: cd apps/web && pnpm dev
□ Buat branch: git checkout -b feature/[area]-[name]
□ Kerjakan fitur (ikuti urutan di Section 2)
□ Test full flow (CMS → API → Frontend)
□ Commit dengan prefix: [web] / [cms] / [shared]
□ Push & create PR
```

---

## 8. Common Patterns — Quick Reference

### Fetch featured items for homepage

```astro
---
const { docs: featuredTours } = await getTours({
  limit: 4,
  where: { 'isFeatured[equals]': 'true' },
  sort: 'sortOrder',
})
---
```

### Fetch by destination

```astro
---
const { docs: penidaTours } = await getTours({
  where: { 'destination.slug[equals]': 'nusa-penida' },
})
---
```

### Dynamic page from CMS

```astro
---
// apps/web/src/pages/[...slug].astro
import { getPages, getPageBySlug } from '@lib/payload'
import BlockRenderer from '@components/blocks/BlockRenderer.astro'

export async function getStaticPaths() {
  const { docs } = await getPages({ limit: 100 })
  return docs.map(page => ({ params: { slug: page.slug } }))
}

const { slug } = Astro.params
const page = await getPageBySlug(slug)
if (!page) return Astro.redirect('/404')
---

<PageLayout title={page.title}>
  <BlockRenderer blocks={page.content} />
</PageLayout>
```

### WhatsApp booking button

```astro
---
import { generateWhatsAppLink, tourBookingMessage } from '@lib/whatsapp'
import { getSiteSettings } from '@lib/payload'

const settings = await getSiteSettings()
const waNumber = tour.whatsappMessage
  ? settings.contact?.whatsapp
  : settings.whatsappDefaults?.defaultNumber

const waLink = generateWhatsAppLink(
  waNumber || '6281234567890',
  tour.whatsappMessage || tourBookingMessage(tour.title, tour.destination.name)
)
---

<a href={waLink} target="_blank" class="px-6 py-3 bg-[#25D366] text-white rounded-lg font-semibold">
  Book via WhatsApp
</a>
```

---

## 9. Sync Troubleshooting

### Frontend menampilkan data lama

**Development:** Refresh browser (Cmd+R / Ctrl+R).
Astro dev server re-fetch saat page load.

**Production:** Trigger rebuild — push ke GitHub atau
hit Cloudflare Pages build hook webhook.

### Field baru tidak muncul di frontend

1. Pastikan field sudah di-save di CMS collection config
2. Restart CMS dev server (`Ctrl+C` → `pnpm dev`)
3. Update shared type di `packages/shared/src/types/`
4. Restart Astro dev server
5. Cek API response: `http://localhost:3000/api/[collection]`

### CMS admin tidak menampilkan collection baru

1. Pastikan collection sudah import di `payload.config.ts`
2. Restart CMS dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Image dari CMS "Failed to fetch" di frontend

**Symptom:** Media URLs (`http://localhost:3030/api/media/file/*`) return
200 saat di-curl langsung, tapi browser di `localhost:4321` tidak bisa
load → gambar blank, console error "Failed to fetch".

**Penyebab:** Payload default same-origin only. Kalau `cors` config
belum diset di `apps/cms/src/payload.config.ts`, header
`access-control-allow-origin` tidak dikirim → browser tolak
cross-origin request dari frontend port ke CMS port.

**Fix:** Cek `apps/cms/src/payload.config.ts` punya:
```typescript
cors: [
  'http://localhost:4321',                                 // Astro dev
  'http://localhost:3030',                                 // CMS admin
  process.env.SITE_URL ?? 'https://gtjourneysid.com',    // production
],
```

Kalau setup project turunan / client baru dgn domain berbeda, update
list ini. Restart CMS dev server untuk pickup.

### Page baru di CMS → 404 di frontend

Setiap kali kamu buat/publish **Page** (atau entry baru di collection
apapun yang dipakai `getStaticPaths()`) saat Astro dev server sudah
jalan, Astro TIDAK auto re-run `getStaticPaths()`. Path baru tidak
masuk list build-time → HTTP 404.

**Fix cepat (per event, no restart):**
```powershell
# Windows PowerShell
(Get-Item apps/web/src/pages/[...slug].astro).LastWriteTime = Get-Date

# Git Bash / WSL
touch apps/web/src/pages/[...slug].astro
```

Astro Vite HMR akan detect file change → re-run `getStaticPaths()` →
path baru masuk → refresh browser → HTTP 200.

**Alternatif nuclear:** `Ctrl+C` di terminal Astro → `pnpm dev` ulang.

**Berlaku juga untuk:** `/tours/[slug]`, `/accommodations/[slug]`,
`/water-activities/[slug]`, `/yacht/[slug]`, `/restaurants/[slug]`,
`/weddings/[slug]`, `/rentals/[slug]` — touch file `[slug].astro`
yang bersangkutan setelah publish entry baru.

**Kenapa tidak diperbaiki permanen?**
- Astro `output: 'static'` sengaja dipilih (Phase 1 Decision Log:
  build-time prerender lebih murah di Cloudflare Pages free tier).
- Ubah ke `output: 'server'` / `'hybrid'` = butuh SSR adapter aktif +
  perubahan deploy strategy. Overkill untuk gain "auto-refresh
  path list saat dev". Production build fresh setiap deploy jadi
  behavior ini invisible di live.

**Kapan pindah ke SSR mode:** pertimbangkan hanya kalau ada halaman
yang butuh data real-time (misal availability booking) yang tidak
tolerate 30-60s rebuild delay per content update.

### Relationship field di Global tidak berubah walau diganti di admin

**Symptom:** Kamu ganti field `relationship` di Global Settings (mis. `HeaderSettings.primaryMenu`, `FooterSettings.columns[].menu`) tapi frontend tetap tampilkan data lama / fallback hardcoded — seolah pilihan di CMS tidak dipedulikan.

**Kemungkinan penyebab #1 — status filter mismatch:**
Kalau frontend kamu re-fetch collection yang direferensikan via `fetchBySlug()`, ingat bahwa `fetchBySlug` default filter `status=published`. Kalau collection target pakai enum status berbeda (mis. `Menus` pakai `'active' | 'inactive'`), filter tidak match → response kosong → jatuh ke fallback.

**Fix:** Payload sudah populate relationship di response Global by default. Konsumsi datanya langsung dari response Global, jangan re-fetch by slug:
```typescript
// ❌ Broken — filter status=published tidak match Menus status enum
const menu = await getMenuBySlug(headerCfg.primaryMenu.slug)

// ✅ Correct — pakai data yang sudah populated
const menu = (typeof headerCfg.primaryMenu === 'object' && Array.isArray(headerCfg.primaryMenu.items))
  ? headerCfg.primaryMenu
  : null
```

**Kemungkinan penyebab #2 — depth kurang (untuk nested relationship):**
Kalau relationship-nya bersarang lebih dalam (relationship di dalam array field di dalam array field), default `depth=1` mungkin tidak cukup. Tambah `?depth=2` (atau lebih) ke URL fetch untuk populate lebih dalam.

### Type mismatch antara CMS dan frontend

Jalankan type generation:
```powershell
pnpm generate:types
```
Ini akan overwrite `packages/shared/src/types/payload-types.ts`
dengan types yang match persis dengan CMS collection configs.
