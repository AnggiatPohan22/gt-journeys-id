# Guideline: Menambahkan Service Baru

> Panduan step-by-step untuk developer/AI agent menambahkan **service type baru**
> ke DnJourneysBali (service ke-8 dan seterusnya).
>
> **Estimasi waktu:** 45–90 menit
> **Skill level:** Mid-level developer / AI agent (bukan pure-junior — ada ~17 file seam wajib)
> **Risiko:** Rendah-menengah — semua perubahan **additive**, tapi menyentuh banyak
> titik hardcoded karena arsitektur sengaja dibuat "7 vertical fixed" (lihat
> [keputusan Phase 3.15](../phases/phase-3-cms-driven/cms-enhancement/phase-3.14-cms-enhancement-sprint.md#phase-315--servicetypes-cms-collection-task-32)).

---

## ⚠️ Baca dulu: kenapa ini butuh code, bukan CMS saja

CMS `ServiceTypes` hanya menyimpan **metadata** (label, ikon, hero, SEO, WhatsApp)
untuk 7 vertical yang **sudah ada**. Menambah TIPE service baru = jalur "full
dynamic" yang **tidak dipilih** saat desain. Jadi service baru butuh:

1. **Collection CMS baru** (data produk/listing punya schema sendiri per tipe).
2. **Detail page code** (`pages/<svc>/[slug].astro`).
3. **~15 seam hardcoded** di frontend + CMS yang meng-enumerasi 7 tipe (select block,
   Categories, Testimonials, SiteFeatures, DashboardStats, route maps, SEO maps, dll).

Listing page **BUKAN** file `.astro` — sejak [Phase 3.20](../phases/phase-3-cms-driven/service-listing/phase-3.20-service-listing-fixes.md)
semua listing (`/tour`, `/villa`, …) adalah **CMS Page** ber-block `serviceListing`,
di-render oleh catch-all [`pages/[...slug].astro`](../../apps/web/src/pages/%5B...slug%5D.astro).
Jadi listing service baru = bikin CMS Page, bukan file kode.

### 🔑 Tiga namespace key (SUMBER BUG PALING UMUM)

Satu service punya **tiga** identifier di lapisan berbeda. Untuk 7 service lama
ketiganya sengaja beda (alasan historis). **Untuk service baru: samakan ketiganya**
agar tidak perlu isi mapping tambahan.

| Namespace | Dipakai di | Contoh lama (Villa) | Rekomendasi service baru (Spa) |
|-----------|-----------|---------------------|-------------------------------|
| **Module key** (camelCase) | [`config/modules.ts`](../../apps/web/src/config/modules.ts) `ServiceModule` | `accommodations` | `spa` |
| **serviceType / collection key** | `ServiceTypes.key`, block `serviceType`, slug collection Payload | `accommodations` | `spa` |
| **Landing/URL slug** | URL listing + folder `pages/<slug>/` + detail base | `villa` | `spa` |

> Villa "rugi" karena module key `accommodations` ≠ URL slug `villa` → butuh
> `MODULE_TO_KEY` + `KEY_TO_SLUG`. Kalau service baru pakai string yang **sama**
> (`spa` di ketiga tempat), mapping itu jadi trivial (`spa → spa → spa`).

---

## LANGKAH 1 (referensi): Inventory pattern 7 service existing

| Service | Listing (CMS Page slug) | Detail file | serviceType/key | Module key (modules.ts) | Collection Payload | URL listing | URL detail | Template |
|---------|------------------------|-------------|-----------------|-------------------------|--------------------|-------------|-----------|----------|
| Tours | `tour` | [`pages/tour/[slug].astro`](../../apps/web/src/pages/tour/%5Bslug%5D.astro) | `tours` | `tours` | `tours` | `/tour` | `/tour/[slug]` | bento 12-col |
| Villa/Hotel | `villa` | [`pages/villa/[slug].astro`](../../apps/web/src/pages/villa/%5Bslug%5D.astro) | `accommodations` | `accommodations` | `accommodations` | `/villa` | `/villa/[slug]` | bento 12-col (pilot) |
| Water Activities | `water-activity` | `pages/water-activity/[slug].astro` | `water-activities` | `waterActivities` | `water-activities` | `/water-activity` | `/water-activity/[slug]` | bento 12-col |
| Yacht | `yacht` | `pages/yacht/[slug].astro` | `yachts` | `yacht` | `yachts` | `/yacht` | `/yacht/[slug]` | bento 12-col |
| Restaurant | `restaurant` | `pages/restaurant/[slug].astro` | `restaurants` | `restaurants` | `restaurants` | `/restaurant` | `/restaurant/[slug]` | bento 12-col |
| Weddings/Venue | `venue` | `pages/venue/[slug].astro` | `venues` | `weddings` | `venues` | `/venue` | `/venue/[slug]` | bento 12-col |
| Rental | `rental` | [`pages/rental/[slug].astro`](../../apps/web/src/pages/rental/%5Bslug%5D.astro) | `rentals` | `rentals` | `rentals` | `/rental` | `/rental/[slug]` | bento 12-col |

**Pola yang berlaku ke semua:**
- **Detail page**: `getStaticPaths()` → fetch collection (`get<Svc>s`) → map slug; guard `isModuleEnabled(<moduleKey>)`; layout "mirror villa" (hero bento + grid 12-col: 8 konten + 4 sidebar booking sticky); breadcrumbs + JSON-LD; WhatsApp via `getServiceWhatsApp(<key>, fallback)`.
- **Listing**: CMS Page + block `serviceListing` (`layout: hero-immersive`) + `trustBadges`.
- **Card → URL**: setiap block punya `detailRouteMap` / `hrefBaseMap` (serviceType → `/singular`).
- **SEO**: `SERVICE_SCHEMA_TYPE` + `SERVICE_DETAIL_BASE` di [`lib/structuredData.ts`](../../apps/web/src/lib/structuredData.ts).

---

## LANGKAH 2: Template service yang dipilih → **Rental**

Gunakan **Rental** ([`pages/rental/[slug].astro`](../../apps/web/src/pages/rental/%5Bslug%5D.astro))
sebagai template copy. Alasan:

- **Paling generic & self-contained**: hanya `description + gallery + pricingTiers +
  specifications + features + includes + requirements`. Tidak ada relasi lintas-collection
  rumit (bukan `rooms` seperti Villa, `itinerary/meetingPoint` seperti Tours, atau
  `packages/testimonials` seperti Venue).
- **Template layout standar** ("mirror villa" bento + 12-col) yang identik dengan 6
  service lain, jadi representatif.
- **Kode bersih & ber-komentar section** (Quick Specs / Features / Specifications /
  Requirements / Pricing Options / Includes) yang gampang di-rename ke domain baru.

> Kalau service baru butuh **rating bintang + amenities kompleks**, pakai Villa
> ([`pages/villa/[slug].astro`](../../apps/web/src/pages/villa/%5Bslug%5D.astro)) sebagai template.
> Kalau butuh **jadwal/itinerary**, pakai Tours.

---

## Prerequisites

- Akses codebase (git pull terbaru), berada di branch fitur baru.
- CMS running: `cd apps/cms && pnpm dev` (localhost:3030).
- Frontend running: `cd apps/web && pnpm dev` (localhost:4321).
- Sudah tentukan: **Service Name**, **key/slug** (samakan — lihat §Tiga namespace).

## Contoh yang Digunakan

Guideline ini memakai **"Spa & Wellness"** sebagai contoh. Ganti `spa` dengan key
service Anda saat mengikuti.

| Parameter | Contoh | Dipakai di |
|-----------|--------|-----------|
| Service Name | Spa & Wellness | display (CMS `name`) |
| Key (semua namespace) | `spa` | module key + serviceType + collection slug + URL slug |
| Listing URL | `/spa` | CMS Page slug `spa` |
| Detail URL | `/spa/[slug]` | folder `pages/spa/` |
| Collection Payload | `spa` | `apps/cms/src/collections/Spa.ts` |
| Schema.org type | `HealthAndBeautyBusiness` | pilih dari schema.org sesuai domain |

---

## Bagian A — CMS (apps/cms)

### Step A1: Buat Collection baru

- Copy [`apps/cms/src/collections/Rentals.ts`](../../apps/cms/src/collections/Rentals.ts) → `apps/cms/src/collections/Spa.ts`.
- Ganti:
  - `slug: 'rentals'` → `slug: 'spa'`
  - `labels`, `useAsTitle`, `admin.group: 'Services'` (biarkan group Services)
  - `rentalType` / field domain-spesifik → field yang relevan untuk spa (mis. `treatmentType`, `durationMinutes`). **Pertahankan** field generik reusable: `title`, `slug`, `featuredImage`, `gallery`, `description`, `destination`, `pricingFields`/`pricingTiers`, `subtitle`, `quickSpecs`, `features`, `additionalBlocks`, `seoFields`.
- ⚠️ **Schema push SQLite rawan** kalau nama identifier > 63 char (lihat pola recovery
  di [Phase 3.18](../phases/phase-3-cms-driven/cms-enhancement/phase-3.14-cms-enhancement-sprint.md#phase-318--testimonials-block-dari-collection)).
  Jaga nama field pendek; hindari block sub-table dengan prefix panjang.

### Step A2: Register collection

- File: [`apps/cms/src/payload.config.ts`](../../apps/cms/src/payload.config.ts)
- Import: `import { Spa } from './collections/Spa'`
- Tambah `Spa` ke array `collections: [ ... ]` (kelompok Services, setelah `Rentals`).

### Step A3: Tambah `key` ke ServiceTypes

- File: [`apps/cms/src/collections/ServiceTypes.ts`](../../apps/cms/src/collections/ServiceTypes.ts) (field `key`, options ~line 67–75)
- Tambah option: `{ label: 'Spa & Wellness', value: 'spa' }`

### Step A4: Tambah `spa` ke SEMUA select/enumerasi service (CMS)

> 🚨 **Ada BANYAK select yang meng-enumerasi 7 service hardcoded — bukan cuma block.**
> Lewatkan satu → di CMS admin service baru **hilang dari dropdown** field itu
> (mis. "di Categories, Service Module `spa` tidak muncul"). Semua di bawah pakai
> **serviceType/collection key** (`spa`), kecuali SiteFeatures yang pakai **module key**
> (di sini kebetulan sama = `spa`).

Tambah `{ label: 'Spa & Wellness', value: 'spa' }` (atau checkbox `spa`) di **semua** titik ini:

| File | Field / lokasi | Nilai | Wajib? |
|------|---------------|-------|--------|
| [`blocks/index.ts`](../../apps/cms/src/blocks/index.ts) | **ServiceGrid** `serviceType` (~426) | `value: 'spa'` | ✅ |
| [`blocks/index.ts`](../../apps/cms/src/blocks/index.ts) | **ServiceListing** `serviceType` (~740) | `value: 'spa'` | ✅ |
| [`blocks/index.ts`](../../apps/cms/src/blocks/index.ts) | **Testimonials** block filter `svc` (~32) | `value: 'spa'` | Opsional |
| [`collections/Categories.ts`](../../apps/cms/src/collections/Categories.ts) | `module` (Service Module) select | `value: 'spa'` | ✅ (kalau pakai kategori) |
| [`collections/Testimonials.ts`](../../apps/cms/src/collections/Testimonials.ts) | `sourceModule` select | `value: 'spa'` | Opsional |
| [`globals/SiteFeatures.ts`](../../apps/cms/src/globals/SiteFeatures.ts) | group `modules` — **checkbox baru** | `{ name: 'spa', type: 'checkbox', label: 'Spa & Wellness', defaultValue: true }` | ✅ |
| [`admin/DashboardStats.tsx`](../../apps/cms/src/admin/DashboardStats.tsx) | array `collections` | `{ slug: 'spa', titleField: 'title', label: 'Spa' }` | ✅ (biar dihitung di dashboard) |

> **Kenapa `isModuleEnabled('spa')` tetap true walau SiteFeatures belum ada checkbox `spa`?**
> Karena `f.modules['spa']` `undefined` dan cek-nya `!== false` → true (fail-open). Jadi halaman
> spa **jalan**, tapi owner **tak bisa mematikan** modul spa dari CMS sampai checkbox ditambah.
> Wajib tetap tambah agar toggle lengkap + tipe `Record<ServiceModule, boolean>` konsisten
> (lihat pasangannya di frontend, Step B0).

### Step A5: Regen types

```
cd apps/cms
pnpm generate:types          # menambah interface Spa + slug 'spa' ke payload-types.ts
```
> Butuh CMS bisa baca schema; jalankan setelah collection ter-register. Kalau perlu
> schema push (tabel baru), stop `pnpm dev` dulu (SQLite lock).

### Step A6: Push schema + fix Drizzle silent-skip

Stop CMS dulu. Push schema (bikin tabel baru untuk collection service):

```
cd apps/cms
pnpm tsx src/scripts/push-schema-loop.ts
```

Loop akan auto-drop duplicate index & retry. Kalau ada prompt "created or renamed?",
jawab `+ create column` / `+ create table` untuk collection baru (safe: no existing data).

**⚠️ WAJIB lanjut** — Drizzle-kit SQLite adapter punya bug: ADD COLUMN ke tabel FK-heavy
(`payload_locked_documents_rels`) dan global besar (`site_features`) **di-skip diam-diam**
(push finish hijau, error hanya muncul saat query). Jalankan helper:

```
pnpm tsx src/scripts/add-service-missing-cols.ts spa      # ganti "spa" dgn slug service anda
```

Helper akan audit + ALTER TABLE ADD COLUMN yang missing:
- `site_features.modules_<snake>` (module toggle checkbox)
- `payload_locked_documents_rels.<snake>_id` (+ FK index)

Idempotent — aman di-jalankan berulang. Kalau nanti muncul error `no such column: X` di
tabel lain, tambahkan ALTER di script itu untuk service ke-9 nanti.

**Verifikasi cepat** — start `pnpm dev`, login CMS, buka Settings → Site Features.
Kalau muncul "Nothing Found" atau terminal error `no such column: modules_<snake>`,
helper belum jalan atau ada tabel lain yang missing.

---

## Bagian B — Frontend (apps/web)

### Step B1: Daftarkan module

- File: [`apps/web/src/config/modules.ts`](../../apps/web/src/config/modules.ts)
- Tambah `'spa'` ke union `ServiceModule`.
- Tambah entry ke `modules`:
  ```ts
  spa: { enabled: true, label: 'Spa & Wellness', slug: 'spa', icon: 'sparkles', collection: 'spa' },
  ```
  (`icon` = nama yang ada di `Icon.astro`; tambah ikon dulu kalau belum ada.)

> Setelah `ServiceModule` menyertakan `'spa'`, tipe `Record<ServiceModule, boolean>` di
> [`lib/features.ts`](../../apps/web/src/lib/features.ts) **wajib** punya key `spa` juga (Step B1b),
> atau muncul type error / fallback tak lengkap.

### Step B1b: Feature-toggle default (pasangan SiteFeatures)

- File: [`apps/web/src/lib/features.ts`](../../apps/web/src/lib/features.ts)
- Tambah `spa: true` ke `DEFAULT_FEATURES.modules` (pakai **module key** = `spa`, sama seperti
  `waterActivities`/`yacht`/`weddings`). Ini fallback saat CMS unreachable + memenuhi tipe
  `Record<ServiceModule, boolean>`. Pasangannya di CMS = checkbox `spa` di SiteFeatures (Step A4).

### Step B2: Getter data

- File: [`apps/web/src/lib/payload.ts`](../../apps/web/src/lib/payload.ts) (setelah `getRentals`, ~line 140)
  ```ts
  export const getSpas = (opts?: Partial<FetchOptions>) =>
    fetchCollection<Spa>({ collection: 'spa', ...opts })
  export const getSpaBySlug = (slug: string) => fetchBySlug<Spa>('spa', slug)
  ```
  (import `Spa` dari `@shared/types/payload-types`.)
- ⚠️ **`collection: 'spa'` harus PERSIS = `slug` collection Payload** (Step A1). Nama
  fungsi `getSpas` boleh plural (konvensi), tapi argumen `collection` **bukan** — kalau
  ditulis `'spas'` padahal slug collection `spa`, fetch kena `/api/spas` → **404 fetching spas**
  saat build. Cek `slug:` di `collections/Spa.ts` dan samakan.

### Step B3: Resolver mapping

- File: [`apps/web/src/lib/serviceTypes.ts`](../../apps/web/src/lib/serviceTypes.ts)
  - `MODULE_TO_KEY`: `spa: 'spa'`
  - `KEY_TO_SLUG`: `spa: 'spa'`

### Step B4: SEO mapping

- File: [`apps/web/src/lib/structuredData.ts`](../../apps/web/src/lib/structuredData.ts)
  - `SERVICE_SCHEMA_TYPE`: `spa: 'HealthAndBeautyBusiness'` (pilih @type sesuai domain)
  - `SERVICE_DETAIL_BASE`: `spa: '/spa'`

### Step B5: Detail page

- Copy [`apps/web/src/pages/rental/[slug].astro`](../../apps/web/src/pages/rental/%5Bslug%5D.astro) → `apps/web/src/pages/spa/[slug].astro`
- Wajib diganti:
  - Import getter: `getRentals, getRentalBySlug` → `getSpas, getSpaBySlug`
  - `getStaticPaths()`: `isModuleEnabled('rentals')` → `isModuleEnabled('spa')`; `getRentals` → `getSpas`
  - Redirect kosong: `/rental` → `/spa`
  - `getRentalBySlug` → `getSpaBySlug`
  - WhatsApp: `getServiceWhatsApp('rentals', …)` → `getServiceWhatsApp('spa', …)`; ganti `rentalMessage` (lihat B7)
  - Breadcrumb: `{ name: 'Rentals', url: '/rental' }` → `{ name: 'Spa & Wellness', url: '/spa' }`; `detailUrl = /spa/${slug}`
  - `serviceItemSchema({ serviceType: 'rentals', … })` → `'spa'`
  - Recommended: `getRentals` filter `rentalType` → field domain spa (mis. `treatmentType`), href `/rental/` → `/spa/`
  - Ganti label/field domain (`rentalTypeLabel`, `specifications`, `pricingTiers`) sesuai schema Spa; rename heading section bila perlu.
- **Jangan ubah**: struktur layout (hero bento, grid 12-col, sidebar sticky), class Tailwind, pola `additionalBlocks` (super-admin custom sections).

> 🚨 **Setiap referensi field domain harus ada di schema collection Spa (Step A1).**
> Sisa copy-paste seperti `item.rentalType` / `Record<Spa['rentalType'], …>` yang **tidak Anda
> ganti** ke field spa (mis. `treatmentType`) = **type error saat build** (`Property 'rentalType'
> does not exist on type 'Spa'`) — atau lebih buruk, `Record<Spa['spaType'], …>` untuk field
> yang **tidak pernah ada** di collection. Setelah copy, **grep** file untuk nama field template
> lama (`rentalType`, `spaType`, dll) dan pastikan **nol** yang tersisa; label-map `Record<Spa['<field>'], string>`
> harus persis meng-cover nilai `options` field itu di `Spa.ts`.
> Ini berlaku di **kedua** file: `pages/spa/[slug].astro` **dan** `cards/SpaCard.astro`.

### Step B6: Card component + route maps

- Copy [`apps/web/src/components/cards/RentalCard.astro`](../../apps/web/src/components/cards/RentalCard.astro) → `SpaCard.astro`; sesuaikan field & pertahankan prop `hrefBase` (default `/spa`) + `variant` (delegasi `DetailedCard`).

> 🚨 **PALING SERING SALAH — tiap block butuh DUA baris import baru.** Menambah
> `case 'spa': … getSpas(…)` dan `<SpaCard spa={item} …>` **tanpa** import-nya =
> `getSpas is not defined` / `SpaCard is not defined` saat runtime. Lebih jahat lagi:
> fetch switch dibungkus `try/catch`, jadi `getSpas is not defined` **tertelan diam-diam**
> → `pnpm build` tetap **Complete!** tapi `/spa` render **alert "gagal memuat listing"**.
> **Green build ≠ listing jalan.** Lihat [Studi Kasus: Spa listing kosong](#studi-kasus-spa-listing-kosong-meski-build-hijau).

Di **tiap** dari 3 block, tambahkan **(a) import getter**, **(b) import Card**, lalu baru (c) 4 seam:

```ts
// (a) ke import { … } from '@lib/payload'  → tambahkan getSpas
import { …, getRentals, getSpas, … } from '@lib/payload'
// (b) tepat setelah import RentalCard
import SpaCard from '@components/cards/SpaCard.astro'
```

| Block | (c) fetch switch | route map | card switch |
|-------|-----------------|-----------|-------------|
| [`ServiceGridBlock.astro`](../../apps/web/src/components/blocks/ServiceGridBlock.astro) | ~44: `case 'spa': allItems = (await getSpas(opts)).docs; break` | `defaultViewAllHref` (~67) **&** `hrefBaseMap` (~82): `spa: '/spa'` | ~129: `{serviceType === 'spa' && <SpaCard spa={item} hrefBase={hrefBase} />}` |
| [`ServiceListingEditorial.astro`](../../apps/web/src/components/blocks/ServiceListingEditorial.astro) | ~49: `case 'spa': itemsPromise = getSpas(opts); break` | `detailRouteMap` (~74): `spa: '/spa'` | ~324: `{serviceType === 'spa' && <SpaCard spa={item} hrefBase={detailBase} variant={cardVariant} />}` |
| [`ServiceListingHeroImmersive.astro`](../../apps/web/src/components/blocks/ServiceListingHeroImmersive.astro) | ~48: `case 'spa': itemsPromise = getSpas(opts); break` | `detailRouteMap` (~67): `spa: '/spa'` | ~378: `{serviceType === 'spa' && <SpaCard spa={item} hrefBase={detailBase} variant={cardVariant} />}` |

> ⚠️ **Key harus `spa` (bukan `spas`).** Nilai `case`, key route-map, dan `serviceType ===`
> **harus persis** = `ServiceTypes.key` yang tersimpan di CMS. Kalau CMS simpan `spa` tapi
> kode pakai `case 'spas'`, switch jatuh ke `default` → fetch **collection lain** (biasanya
> accommodations) → grid salah/kosong tanpa error.
> ⚠️ **Prop Card = `spa={item}`**, bukan `rental={item}` sisa copy-paste. Prop name harus
> cocok dengan `interface Props` di `SpaCard.astro`.

### Step B7 (opsional): WhatsApp message builder

- File: [`apps/web/src/lib/whatsapp.ts`](../../apps/web/src/lib/whatsapp.ts) — tambah `spaMessage(title)` (copy `rentalMessage`). Dipakai sebagai fallback di detail page kalau `ServiceType.whatsappTemplate` kosong.

### Step B8: ItemList JSON-LD listing page

- File: [`apps/web/src/pages/[...slug].astro`](../../apps/web/src/pages/%5B...slug%5D.astro) — tambah ke `fetchers` map (~line 48):
  `spa: () => getSpas({ limit: 50 }),`
  (Tanpa ini, listing `/spa` tidak emit ItemList schema — tapi tetap render.)

---

## Bagian C — Reserved Slugs & Redirects

### Step C1: Reserved slugs — biasanya TIDAK perlu

- File: [`apps/cms/src/fields/reservedSlugs.ts`](../../apps/cms/src/fields/reservedSlugs.ts)
- Slug singular landing (`spa`) **sengaja TIDAK di-reserve** — memang dipakai CMS Page
  (`[...slug].astro`), sama seperti `villa`/`tour`. **Jangan tambahkan `spa`.**
- Tambahkan ke `RESERVED_PAGE_SLUGS` **hanya kalau** Anda membuat rute **plural** statis/redirect
  (mis. `spas`) yang men-shadow CMS Page ber-slug sama.

### Step C2: `_redirects` — hanya kalau ada URL plural lama

- File: [`apps/web/public/_redirects`](../../apps/web/public/_redirects)
- Untuk service **baru** tidak ada URL plural legacy → **skip**.
- Tambah hanya kalau perlu alias, mis:
  ```
  /spas            /spa            301
  /spas/*          /spa/:splat     301
  ```

---

## Bagian D — Konten CMS (setelah code siap)

### Step D1: Buat ServiceType
CMS admin → **Service Types** → Create:
- name: `Spa & Wellness`, key: `spa`, slug: `spa`, order, description, coverImage, metaTitle/Description.
- status: **draft** dulu (aktifkan setelah semua code + test hijau).

### Step D2: Buat Listing Page (INI listing-nya)
CMS admin → **Pages** → Create:
- slug: `spa`, status: published.
- Blocks: **ServiceListing** (`serviceType: spa`, `layout: hero-immersive`) + **TrustBadges**.
- (Tip: contek isian Page `rental`/`villa` sebagai referensi bentuk block.)

### Step D3: Sample products
CMS admin → **Spa** (collection baru) → buat 2–3 entry `status: published`, `slug` unik,
`featuredImage`, `pricingTiers`/harga.

### Step D4: Activate + nav
- Set ServiceType `spa` → status **active**.
- (Opsional) tambah item nav `/spa` di CMS Menu `main-navigation`.

---

## Test Checklist

### CMS
- [ ] Collection **Spa** muncul di group Services; bisa create/publish entry.
- [ ] **Service Types** punya entry `spa`; `key` read-only untuk non-super-admin.
- [ ] Reserved-slug guard: bikin Page slug `spa` **boleh** (tidak di-reserve); slug plural yang di-reserve tetap ditolak.
- [ ] Block ServiceListing/ServiceGrid: dropdown `serviceType` punya opsi Spa.

### Frontend — Listing (`/spa`)
- [ ] `http://localhost:4321/spa` load, no error, no console error.
- [ ] Hero/heading dari CMS (block override → fallback `ServiceType.name`).
- [ ] Grid menampilkan sample products; card → `/spa/<slug>`.
- [ ] View source: `<title>`, `<meta name=description>`, `og:title` ter-set; ada JSON-LD `WebPage` + `BreadcrumbList` + (kalau B8) `ItemList` dengan URL `/spa/...`.
- [ ] Mobile 375px OK.

### Frontend — Detail (`/spa/<slug>`)
- [ ] Load, no error; data render (title, gambar, harga, deskripsi, sections).
- [ ] Breadcrumb: `Home / Spa & Wellness / <Product>`; link `/spa` berfungsi.
- [ ] JSON-LD detail = @type yang dipilih + `Offer` (kalau ada harga).
- [ ] Tombol WhatsApp benar (nomor `ServiceType.whatsappNumber` → SiteSettings fallback).
- [ ] Mobile OK, no console error.

### Navigasi & cross-service (regression)
- [ ] Card di ServiceGrid & ServiceListing block → `/spa` & `/spa/<slug>`.
- [ ] `/tour /villa /yacht /water-activity /restaurant /venue /rental` **semua masih** load & render.

### Build
- [ ] `cd apps/web && pnpm build` → **Complete!**, tanpa error.
- [ ] Output `dist/` memuat `/spa/index.html`? (hanya kalau CMS Page `spa` published) + `/spa/<slug>/index.html` per produk.
- [ ] `sitemap-index.xml` ter-generate.
- [ ] ⚠️ **Build hijau BELUM cukup** — buka `dist/spa/index.html` (atau `/spa` di dev) dan pastikan **kartu produk benar-benar render**, BUKAN alert "gagal memuat listing". Fetch listing dibungkus `try/catch`, jadi error import bisa lolos build. Cek cepat: `grep -c "gagal memuat" dist/spa/index.html` harus `0`, dan nama produk muncul di HTML.

---

## Troubleshooting

**Listing `/spa` → 404**
- CMS Page slug `spa` sudah `published`? Listing = CMS Page, bukan file.
- Astro dev cache: `touch apps/web/src/pages/[...slug].astro` (getStaticPaths cache). Prod build selalu fresh.

**Detail `/spa/<slug>` → 404**
- `getStaticPaths()` return slug benar? `isModuleEnabled('spa')` true (modules.ts `enabled: true`)?
- Minimal 1 produk `status: published`.
- Astro dev cache: `touch apps/web/src/pages/spa/[slug].astro`.

**Produk tidak muncul di grid / card link ke `/`**
- `serviceType` di block match `spa`? Fetch switch di 3 block sudah ada `case 'spa'`?
- `detailRouteMap`/`hrefBaseMap`/`defaultViewAllHref` sudah ada entry `spa`? (kalau tidak → `?? '/'`).
- Card switch di block sudah render `<SpaCard>`?

**Listing `/spa` render alert "gagal memuat listing: getSpas is not defined"** *(build tetap Complete!)*
- `getSpas` dipakai tapi **belum di-import** di block itu. Tambah ke `import { … } from '@lib/payload'` (Step B6a).
- Errornya tertelan `try/catch` fetch → build hijau tapi page render alert. **Wajib buka `/spa` dan cek kartu render**, jangan andalkan exit code build.

**Build gagal: `SpaCard is not defined`**
- Card di-pakai di JSX block tapi **belum di-import**. Tambah `import SpaCard from '@components/cards/SpaCard.astro'` (Step B6b) di ketiga block.

**Build gagal: `CMS error: 404 fetching spas`**
- `getSpas` fetch `collection: 'spas'` (plural) padahal slug collection Payload `spa`. Samakan ke `collection: 'spa'` (Step B2).

**Build gagal: `Property 'rentalType'/'spaType' does not exist on type 'Spa'`**
- Referensi field template lama belum diganti ke field schema Spa. Grep `pages/spa/[slug].astro` + `cards/SpaCard.astro` untuk nama field lama, ganti ke field asli (Step B5 callout).

**Type error `Spa` tidak dikenal**
- Jalankan `pnpm generate:types` di apps/cms setelah collection ter-register.

**CMS 500 / schema push gagal saat bikin collection**
- Nama identifier > 63 char (SQLite). Pendekkan nama field/block. Lihat pola recovery drop-and-recreate di [Phase 3.18](../phases/phase-3-cms-driven/cms-enhancement/phase-3.14-cms-enhancement-sprint.md#-schema-migration-recovery-payload-sqlite-push-bug).
- Jalankan schema push dengan `pnpm dev` CMS **stop** (SQLite exclusive lock).

**Kelas Tailwind tidak ter-styling di file baru**
- JIT cache stale untuk folder baru: `touch apps/web/tailwind.config.mjs`. Prod build fresh.

**Di CMS admin, `spa` tak muncul di dropdown suatu field** (mis. Categories → Service Module, Testimonials → sourceModule)
- Select field itu meng-enumerasi service hardcoded dan `spa` belum ditambah. Lihat tabel **Step A4** — lengkapi semua titik (Categories `module`, Testimonials `sourceModule`, SiteFeatures checkbox, DashboardStats).
- Setelah edit collection/global CMS: **restart `pnpm dev` CMS** agar schema/opsi ke-load ulang (checkbox baru di SiteFeatures = kolom baru → schema push, butuh CMS restart / dev stop dulu).

---

## Studi Kasus: Spa listing kosong meski build hijau

> Insiden nyata saat Spa & Wellness (service ke-8) dibuat mengikuti guide ini
> (2026-08-23). Berguna sebagai contoh bagaimana **1 gejala menyembunyikan rantai bug**
> — dan semuanya bersumber dari **Step B6 yang tidak menambahkan import**.

**Gejala awal:** `pnpm dev` → `/spa` menampilkan alert **"gagal memuat listing: getSpas is not defined"**.
Sebelumnya `pnpm build` bahkan **Complete! (47 pages)** — jadi build seolah "lolos".

**Kenapa build lolos padahal error:** fetch switch di listing block dibungkus `try/catch`.
`getSpas is not defined` (ReferenceError) tertangkap → variabel `error` di-set → block
render **alert error**, bukan throw. Page `/spa/index.html` tetap ter-generate (isinya alert).
→ **Pelajaran: exit code build hijau TIDAK menjamin listing render. Selalu cek isi halaman.**

**Rantai bug yang terungkap satu per satu** (tiap fix membuka error berikutnya):

| # | Error | Akar masalah | Fix | Dicegah oleh |
|---|-------|--------------|-----|--------------|
| 1 | `getSpas is not defined` (tertelan try/catch → alert) | `getSpas` dipakai di 3 block tapi **tak di-import** | tambah ke `import … from '@lib/payload'` | Step B6a |
| 2 | `CMS error: 404 fetching spas` | `getSpas` fetch `collection: 'spas'` (plural), slug asli `spa` | `collection: 'spa'` | Step B2 callout |
| 3 | `SpaCard is not defined` | `<SpaCard>` dipakai di 3 block tapi **tak di-import** | tambah `import SpaCard …` | Step B6b |
| 4 | `serviceType === 'spas'` tak match | CMS simpan key `spa`, kode pakai `'spas'` → jatuh ke `default` (fetch accommodations) | samakan `case`/key/`===` ke `spa` | Step B6 callout key |
| 5 | prop `rental={item}` di `<SpaCard>` | sisa copy-paste RentalCard | `spa={item}` | Step B6 callout prop |
| 6 | `Record<Spa['spaType'], …>`, `item.spaType` | field `spaType` **tak ada** — collection pakai `treatmentType` | ganti semua ke `treatmentType` + label map | Step B5 callout field |
| 7 | `SERVICE_SCHEMA_TYPE.spa = 'spa'`, `SERVICE_DETAIL_BASE.spa = 'spa'` | placeholder belum diisi (bukan @type valid; slash hilang) | `'HealthAndBeautyBusiness'` + `'/spa'` | Step B4 |

**Benang merahnya:** semua bug ini **satu kelas** = *"referensi ditambahkan tapi
deklarasi/import/nilai pendukungnya tidak"*. Copy-paste dari service template (Rental)
menyalin **pemakaian** (`case`, `<Card>`, `item.field`) tapi **tidak** otomatis membawa
**import** dan **tidak** mengganti **nama identifier domain**.

**Pencegahan permanen (lakukan setiap tambah service):**
1. Setelah edit 3 block, **grep import**: pastikan tiap `getXxx`/`XxxCard` yang dipakai punya baris import di file yang sama.
2. **Grep sisa nama template**: `grep -rn "rental\|Rental" apps/web/src/pages/spa apps/web/src/components/cards/SpaCard.astro` → harus nol (kecuali yang memang sengaja).
3. **Grep key salah**: pastikan tak ada `'spas'` di mana pun (`grep -rn "'spas'" apps/web/src`).
4. **Verifikasi konten, bukan cuma build**: `pnpm build` **lalu** `grep -c "gagal memuat" dist/spa/index.html` = 0 dan nama produk muncul.
5. Confirm `collection:` di getter == `slug:` di collection == `key` di ServiceType == nilai `case` di block. Empat tempat, satu string.

---

## Quick Reference — File Checklist

| # | File | Action | Wajib? |
|---|------|--------|--------|
| 1 | `apps/cms/src/collections/Spa.ts` | Create (copy Rentals.ts) | ✅ |
| 2 | `apps/cms/src/payload.config.ts` | Register collection | ✅ |
| 3 | `apps/cms/src/collections/ServiceTypes.ts` | Add `key` option `spa` | ✅ |
| 4 | `apps/cms/src/blocks/index.ts` | Add `spa` ke 2 select `serviceType` (ServiceGrid + ServiceListing) | ✅ |
| 5 | `apps/cms/` → `pnpm generate:types` | Regen payload-types | ✅ |
| 5b | `apps/cms/` → `pnpm tsx src/scripts/push-schema-loop.ts` + `add-service-missing-cols.ts <slug>` | Push schema + fix Drizzle silent-skip | ✅ |
| 6 | `apps/web/src/config/modules.ts` | Add module `spa` (union + entry) | ✅ |
| 7 | `apps/web/src/lib/features.ts` | Add `spa: true` ke `DEFAULT_FEATURES.modules` | ✅ |
| 8 | `apps/web/src/lib/payload.ts` | Add `getSpas` + `getSpaBySlug` (`collection: 'spa'`) | ✅ |
| 9 | `apps/web/src/lib/serviceTypes.ts` | `MODULE_TO_KEY` + `KEY_TO_SLUG` | ✅ |
| 10 | `apps/web/src/lib/structuredData.ts` | `SERVICE_SCHEMA_TYPE` + `SERVICE_DETAIL_BASE` | ✅ |
| 11 | `apps/web/src/pages/spa/[slug].astro` | Create (copy rental) | ✅ |
| 12 | `apps/web/src/components/cards/SpaCard.astro` | Create (copy RentalCard) | ✅ |
| 13 | ServiceGridBlock + ServiceListingEditorial + ServiceListingHeroImmersive | Add `spa`: **import getter + import Card** + fetch switch + route map + card switch | ✅ |
| 14 | `apps/web/src/pages/[...slug].astro` | Add `spa` ke `fetchers` (ItemList) | ✅ |
| 15 | `apps/cms/src/globals/SiteFeatures.ts` | Add checkbox `spa` di group `modules` | ✅ |
| 16 | `apps/cms/src/admin/DashboardStats.tsx` | Add `{ slug: 'spa', … }` ke `collections` | ✅ |
| 17 | `apps/cms/src/collections/Categories.ts` | Add `spa` ke `module` select | ✅ (kalau pakai kategori) |
| 18 | `apps/cms/src/collections/Testimonials.ts` | Add `spa` ke `sourceModule` | Opsional |
| 19 | `apps/cms/src/blocks/index.ts` | Add `spa` ke Testimonials block `svc` filter | Opsional |
| 20 | `apps/web/src/lib/whatsapp.ts` | Add `spaMessage()` | Opsional |
| 21 | `apps/cms/src/fields/reservedSlugs.ts` | Add slug | Hanya jika ada plural route |
| 22 | `apps/web/public/_redirects` | Add redirect | Hanya jika ada URL plural |
| 23 | CMS: ServiceType + Page `spa` + sample products | Create konten | ✅ |

Item 1–17 + 23 = **wajib**. Item 18–22 = kondisional/opsional.

---

## Prompt untuk AI Agent

> Delegasikan ke Claude Code / AI agent dengan prompt di bawah. Ganti `Spa & Wellness`
> / `spa` dengan service Anda.

```
TASK: Tambahkan service baru "Spa & Wellness" (key: spa) ke DnJourneysBali.

Ikuti PERSIS docs/guides/adding-new-service.md. Aturan:
- JANGAN ubah 7 service existing; semua perubahan additive.
- Samakan ketiga namespace key = "spa" (module key = serviceType = collection slug = URL slug).
- Template detail page: copy apps/web/src/pages/rental/[slug].astro.
- Template collection: copy apps/cms/src/collections/Rentals.ts.
- Template card: copy apps/web/src/components/cards/RentalCard.astro.
- Schema.org @type untuk spa: HealthAndBeautyBusiness.

Kerjakan Bagian A (CMS: collection, register, ServiceTypes key, block selects, generate:types),
Bagian B (frontend: modules.ts, payload.ts getters, serviceTypes.ts maps, structuredData.ts maps,
detail page, SpaCard, 3 block route maps, [...slug].astro fetchers), dan Bagian C (reserved/redirects
— skip kecuali ada plural URL).

Untuk konten CMS (Bagian D: ServiceType, Page listing, sample products) — HANYA jika CMS bisa
di-stop untuk schema push; kalau tidak, siapkan seed script dan serahkan langkah run ke owner.

Di tiap dari 3 block (ServiceGrid/ServiceListingEditorial/ServiceListingHeroImmersive)
WAJIB tambahkan DUA import (getSpas dari @lib/payload + SpaCard) SEBELUM menambah
case/route-map/card-switch. Key = "spa" persis (bukan "spas"). Prop card = spa={item}.

Setelah copy detail page + card: grep sisa nama template lama (rentalType/rental/spaType)
dan pastikan nol; tiap Record<Spa['<field>'], …> harus cover options field asli di Spa.ts.

Verifikasi (jangan berhenti di exit code):
1. `cd apps/web && pnpm build` → Complete! tanpa error.
2. `grep -rn "'spas'" apps/web/src` → nol.
3. Konfirmasi collection getter == slug collection == ServiceType key == nilai `case` block (satu string di 4 tempat).
4. `grep -c "gagal memuat" dist/spa/index.html` == 0 DAN nama sample product muncul di HTML
   (build hijau bisa menyembunyikan error import karena fetch dibungkus try/catch).

Lapor via docs/phases/ + update dashboard docs/PROGRESS.md (lihat AGENTS.md §14).
Jangan sentuh ai/prompt/.
```

---

## Related

- [Phase 3.15 — ServiceTypes CMS Collection](../phases/phase-3-cms-driven/cms-enhancement/phase-3.14-cms-enhancement-sprint.md#phase-315--servicetypes-cms-collection-task-32) — kenapa 7 tipe fixed
- [Phase 3.7 — Service Landing Pages](../phases/phase-3-cms-driven/phase-3-cms-driven.md#phase-37--service-landing-pages--code--2-manual-test-villa-pending) — asal pola detail "mirror villa"
- [Phase 3.20 — Service Listing Fixes](../phases/phase-3-cms-driven/service-listing/phase-3.20-service-listing-fixes.md) — konsolidasi singular + SEO
- [service-listing-visual-audit.md](../reports/service-listing-visual-audit.md) — arsitektur listing/detail + SEO
