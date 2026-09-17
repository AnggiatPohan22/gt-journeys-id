# 03 — CONTENT MODEL

> Audit pemetaan konten proyek **DnJourneysBali** — mana yang sudah dikontrol dari **Payload CMS**, mana yang masih **hardcoded** di kode Astro, dan panduan pengelolaan untuk admin/content manager.
>
> Prinsip: *"No Hardcode"* — semua konten yang bisa berubah tanpa perubahan struktur/design harus dikelola dari CMS.

---

## 1. Draft / Publish & Feature Toggle System

### 1.1 Draft vs Published

Semua koleksi service (Tours, Accommodations, Water Activities, Yachts, Restaurants, Venues, Rentals) + Destinations, Categories, dan Pages menggunakan field `status` custom dengan dua nilai:

- `draft` (default) — tidak muncul di website publik
- `published` — muncul di website

Field-nya didefinisikan di [apps/cms/src/fields/status.ts](apps/cms/src/fields/status.ts) dan hanya bisa di-set/ubah oleh **Admin+** (super-admin & admin), tidak oleh Editor biasa.

Cara Astro merespons: helper `fetchCollection` di [apps/web/src/lib/payload.ts:81](apps/web/src/lib/payload.ts#L81) selalu meng-append `where[status][equals]=published` secara default. Artinya:

- Halaman listing (`/tours`, `/accommodations`, dst.) **hanya menampilkan** entry yang `status=published`.
- Halaman detail (`/tour/[slug]`, `/villa/[slug]`, dst.) juga menggunakan `fetchBySlug` yang default `status=published` → entry draft mengembalikan 404 di web.
- Karena Astro mode `output: 'static'` (lihat [astro.config.mjs:7](apps/web/astro.config.mjs#L7)), draft tidak akan tampil sampai:
  1. Editor mengubah status jadi `published` di admin.
  2. Website di-rebuild ulang.

### 1.2 Feature Toggle yang Sudah Ada

| Toggle | Lokasi | Efek |
|---|---|---|
| **`isFeatured` per entry** | [fields/status.ts:32](apps/cms/src/fields/status.ts#L32) — checkbox sidebar di semua service | Menandai entry sebagai unggulan (dipakai block `serviceGrid` dgn `featuredOnly=true`). |
| **`status` menus** | [Menus.ts:38](apps/cms/src/collections/Menus.ts#L38) | `active` / `inactive` — inactive menu tidak dipakai. |
| **Header CTA** | [HeaderSettings.ts:31](apps/cms/src/globals/HeaderSettings.ts#L31) — `showCtaButton` (bool) | Tampilkan/sembunyikan tombol CTA WhatsApp di header. |
| **Header behavior** | `stickyOnScroll`, `transparentOnTop` | Perilaku fixed header + transparansi over hero. |
| **Footer per-kolom** | [FooterSettings.ts](apps/cms/src/globals/FooterSettings.ts) — `showBrandColumn`, `showServicesColumn`, `showContactColumn`, `showNewsletter` | Toggle 4 kolom footer independen. |
| **Newsletter footer** | `showNewsletter` (bool) | Reserved — belum diimplementasi di frontend (Phase 4). |
| **Meeting/Pickup on Tour** | Tours: `pickupService.available` (bool) | Menampilkan section pickup di detail tour. |
| **`enabled` per module** | [apps/web/src/config/modules.ts](apps/web/src/config/modules.ts) + [globals/SiteFeatures.ts](apps/cms/src/globals/SiteFeatures.ts) | **CMS Hybrid** — metadata (label/slug/icon) tetap di file, `enabled` flag di CMS global `site-features.modules.*`. Super Admin only. |
| **`site-features.sections.*`** | [globals/SiteFeatures.ts](apps/cms/src/globals/SiteFeatures.ts) — `testimonials`, `faq`, `promoBanner` (reserved), `newsletter` (reserved) | Toggle section besar. `promoBanner` + `newsletter` reserved untuk Phase 4. |
| **`site-features.features.whatsappFloat`** | [ChatWidget.astro](apps/web/src/components/common/ChatWidget.astro) via [`isFeatureEnabled`](apps/web/src/lib/features.ts) | Master toggle chat widget global (Phase 4.50 — nama flag legacy, sudah channel-agnostic). |
| **`chat-widget` global** | [ChatWidgetSettings.ts](apps/cms/src/globals/ChatWidgetSettings.ts) → [ChatWidget.astro](apps/web/src/components/common/ChatWidget.astro) | 8 tab: General, Appearance, Popup, Channels (blocks: WA/AI/LiveChat/Email), Availability, Behavior, Tracking, Security (5 layer anti-spam). |
| **`site-features.features.announcementBar`** | reserved — komponen belum ada | Phase 4. |

**Route guards**: kalau modul di-disable, `getStaticPaths` untuk `[slug].astro` return `[]` (tidak build detail pages) dan `index.astro` `Astro.rewrite('/404')`. Halaman [404.astro](apps/web/src/pages/404.astro) menangani state ini.

### 1.3 Alur Publish

```
Editor buka admin → edit entry → set status=published → Save
  ↓
Entry masuk DB dgn status=published
  ↓
(Rebuild `apps/web` diperlukan — SSG mode)
  ↓
Halaman detail + listing tampil di production
```

---

## 2. Pemetaan CMS-Managed vs Hardcoded (No-Hardcode Audit)

Legenda:
- **[CMS Dynamic]** — 100% dari Payload (dgn fallback minor untuk error).
- **[CMS Hybrid]** — Sebagian dari CMS, sebagian hardcoded (biasanya fallback saat CMS kosong).
- **[Hardcoded]** — Belum terhubung ke CMS.

### 2.1 Navigasi — Header

| Komponen / Elemen | File Astro | Sumber CMS | Status | Catatan |
|---|---|---|---|---|
| Header shell (fixed + spacer) | [Header.astro](apps/web/src/components/navigation/Header.astro) | — | Hardcoded | Struktur & style layout. |
| Logo + siteName | Header.astro:31-34 | `site-settings.logo`, `site-settings.siteName` | CMS Hybrid | Fallback `siteConfig.name` kalau CMS off. |
| Menu utama (primary nav) | Header.astro:24-28 | `header-settings.primaryMenu` → `menus` collection | CMS Dynamic | Fallback 3 link (Home/Tours/Contact) kalau menu belum di-set. |
| Dropdown sub-menu | Header.astro:104-136 | `menus.items.children[]` | CMS Dynamic | |
| CTA button (WhatsApp Booking) | Header.astro:37-45 | `header-settings.showCtaButton/ctaText/ctaType/ctaCustomLink` + `site-settings.contact.whatsapp` | CMS Dynamic | Fallback text "WhatsApp Booking". |
| Mobile drawer | Header.astro:189-245 | idem menu | CMS Dynamic | Skrip toggle hardcoded. |
| Kelas warna (`text-ocean`, `bg-ocean`, dst.) | Header.astro | — | Hardcoded | Design tokens Tailwind, memang tetap kode. |

### 2.2 Navigasi — Footer

| Komponen / Elemen | File Astro | Sumber CMS | Status |
|---|---|---|---|
| Brand column (logo, tagline, social icons) | [Footer.astro:104-152](apps/web/src/components/navigation/Footer.astro#L104) | `site-settings.logo/siteName/tagline/socialMedia` + `footer-settings.showBrandColumn/brandTaglineOverride` | CMS Dynamic |
| Kolom menu editorial | Footer.astro:155-172 | `footer-settings.columns[]` → `menus` | CMS Dynamic |
| Fallback Quick Links | Footer.astro:174-186 | — | Hardcoded | Aktif hanya kalau `footer-settings.columns` kosong. |
| Kolom Services | Footer.astro:189-205 | `footer-settings.servicesMenu` (kalau di-set) **atau** `enabledModules()` dari [config/modules.ts](apps/web/src/config/modules.ts) | CMS Hybrid | Default = file config, override via CMS menu. |
| Kolom Contact | Footer.astro:208-242 | `site-settings.contact.*` + `site-settings.whatsappDefaults.businessHours` | CMS Dynamic |
| Copyright | Footer.astro:247 | `site-settings.footer.copyrightText` | CMS Hybrid | Fallback: `© YYYY {siteName}. All rights reserved.` |
| Bottom-right text | Footer.astro:248 | `footer-settings.bottomBarRightText` | CMS Dynamic | Default "Designed with ♥ in Bali". |
| Ikon social (Instagram/FB/TikTok/YT SVG) | Footer.astro:126-149 | — | Hardcoded | SVG path inline, memang statis. |

### 2.3 Homepage `/`

File: [apps/web/src/pages/index.astro](apps/web/src/pages/index.astro)

Dua mode operasi:
1. **CMS-driven** — kalau ada Page dengan `slug=home` (status published), full render via `BlockRenderer`.
2. **Fallback hardcoded** — kalau belum ada, render 7 block predefined (Hero + ValueProps + 3 ServiceGrid + Stats + Testimonials + CTA).

| Elemen | Status | Sumber |
|---|---|---|
| Header + Footer | CMS Dynamic (via layout) | |
| Konten body — mode CMS | **[CMS Dynamic]** | `pages` (slug=home).content[] |
| Konten body — mode fallback | **[CMS Hybrid]** | Konstanta di file jadi safety-net; primary source = Global `homepage-content` + collection `testimonials`. |
| Hero copy fallback | **CMS Dynamic** | `homepage-content.heroHeading/heroSubheading/heroCtaText/heroCtaLink` — fallback hardcoded string kalau kosong. |
| ValueProps fallback (4 item) | **CMS Dynamic** | `homepage-content.valueProps[]` — kalau array kosong, pakai default 4-item hardcoded. |
| ServiceGrid fetch tours/stays/activities | CMS Dynamic | Query koleksi service |
| Stats fallback | **CMS Dynamic** | `homepage-content.stats[]` + `statsEyebrow/statsHeading` — default array 1000+/50+/10+/24/7 kalau kosong. |
| Testimonials | **CMS Dynamic** | Collection `testimonials` (isFeatured=true, sortOrder ASC, max 6). Fallback dummy Sarah/James/Maya HANYA kalau collection kosong. |
| CTA fallback | **CMS Dynamic** | `homepage-content.ctaHeading/ctaDescription/ctaButtonText/ctaButtonLinkOverride` — link default = WhatsApp dari `site-settings`. |

### 2.4 Halaman CMS Dinamis `/*` (catch-all)

File: [pages/[...slug].astro](apps/web/src/pages/[...slug].astro)

- **[CMS Dynamic]** penuh — untuk setiap `Page` di CMS, `getStaticPaths` bikin route.
- Judul + meta description dari `page.seo.metaTitle/metaDescription`.
- Body dirender oleh `BlockRenderer` — semua 16 block di [apps/cms/src/blocks/index.ts](apps/cms/src/blocks/index.ts) tersedia.

### 2.5 Service Modules — Listing & Detail

Pola sama untuk semua 8 modul (tours, accommodations, water-activities, yachts, restaurants, venues/weddings, rentals).

| Halaman | File | Status | Catatan |
|---|---|---|---|
| `/tours` (list) | [pages/tours/index.astro](apps/web/src/pages/tours/index.astro) | CMS Hybrid | Grid + judul dari CMS; heading page, eyebrow, deskripsi, warna, empty-state copy — **hardcoded**. |
| `/tour/[slug]` (detail) | [pages/tour/[slug].astro](apps/web/src/pages/tour/[slug].astro) | CMS Dynamic | Layout hero + section (bento/quickspecs/highlights/itinerary/includes/pricing) — struktur hardcoded, semua konten dari `tours` collection. |
| `/accommodations` (list) | [pages/accommodations/index.astro](apps/web/src/pages/accommodations/index.astro) | CMS Hybrid | idem tours. |
| `/villa/[slug]` (detail) | [pages/villa/[slug].astro](apps/web/src/pages/villa/[slug].astro) | CMS Dynamic | Villa/hotel/resort route. |
| `/accommodations/[slug]` | [pages/accommodations/[slug].astro](apps/web/src/pages/accommodations/[slug].astro) | CMS Dynamic | Legacy route (guesthouse). |
| `/water-activities` + `/water-activity/[slug]` | Same pattern | CMS Hybrid / CMS Dynamic | |
| `/yacht/[slug]` | [pages/yacht/[slug].astro](apps/web/src/pages/yacht/[slug].astro) | CMS Dynamic | Belum ada listing `/yacht`. <!-- Catatan: listing yacht belum ada. --> |
| `/restaurants` + `/restaurant/[slug]` | Same pattern | CMS Hybrid / CMS Dynamic | |
| `/weddings` + `/venue/[slug]` | idem venues | CMS Hybrid / CMS Dynamic | |
| `/rentals` + `/rental/[slug]` | idem rentals | CMS Hybrid / CMS Dynamic | |
| Empty-state text | tiap `<module>/index.astro` | — | Hardcoded generic Bahasa Indonesia ("Belum ada X tersedia. Silakan cek lagi nanti."). Instruksi CMS admin dihapus 2026-08-07 (Grup C — tidak perlu di CMS). |
| Listing header (judul + subtitle, layout hero-immersive) | [ServiceListingHeroImmersive.astro](apps/web/src/components/blocks/ServiceListingHeroImmersive.astro) | **CMS Hybrid** (Phase 3.21) | Judul & subtitle baca `site-settings.sectionPages.{listingTitle,listingSubtitle}` dgn hardcoded fallback ("Luxury Collections" / "properties available in Bali & surrounding islands"). Angka jumlah hasil tetap live (filter/search JS). |
| Filter destinasi (tab + search) di listing | ServiceListing* (immersive + editorial) | **CMS Dynamic** (Phase 3.22) | Digate `site-features.destinations.hierarchicalFilter` (Super Admin). ON → tab = destinasi `showInFilter` (core) saja; child (punya `parent`) disembunyikan tapi cocok saat core dipilih/dicari. OFF → flat (semua destinasi jadi tab). `showInFilter` = Super Admin only; `parent` = admin. |

### 2.6 Halaman Statis Khusus

| Halaman | File | Status |
|---|---|---|
| `/property` (Coming Soon) | [pages/property.astro](apps/web/src/pages/property.astro) | **CMS Hybrid** — retain-with-fallback: baca `site-settings.errorPages.propertyComingSoon.{eyebrow,title,description,whatsappMessage,primaryButtonText,secondaryButtonText}` dgn hardcoded fallback identik. |
| `/404` | [pages/404.astro](apps/web/src/pages/404.astro) | **CMS Hybrid** — baca `site-settings.errorPages.notFound.{title,message,buttonText}` dgn hardcoded fallback. |
| `/demo-filter` | — | **DIHAPUS** (2026-08-07) — dev preview yang tidak perlu di production, sesuai rekomendasi §3-🟢. |

### 2.7 Block Renderer & Block Components

| Elemen | Status | Catatan |
|---|---|---|
| `BlockRenderer.astro` mapping | Hardcoded (mapping struktural) | Cocok tetap di kode — dispatch `blockType` ke komponen. |
| 16 block components (`HeroBlock`, `CTABlock`, `GalleryBlock`, dst.) | CMS Dynamic (isi) + Hardcoded (struktur/style) | Content dari `page.content[]` / `service.additionalBlocks[]`. |

### 2.8 Kartu (Cards)

| Komponen | File | Status |
|---|---|---|
| TourCard, AccommodationCard, WaterActivityCard, YachtCard, RestaurantCard, VenueCard, RentalCard | [components/cards/](apps/web/src/components/cards) | CMS Dynamic (data) + Hardcoded (layout/style). Wajib di kode karena bagian design system. |

### 2.9 Utility & Config

| Item | File | Status |
|---|---|---|
| `siteConfig` fallback (name, tagline, contact, social, defaultSeo) | [apps/web/src/config/site.ts](apps/web/src/config/site.ts) | Hardcoded — fallback saat CMS tidak available. Diganti oleh `site-settings` di production. |
| `modules.enabled` per service | [apps/web/src/config/modules.ts](apps/web/src/config/modules.ts) | **Hardcoded** — belum di-CMS-kan. Dipakai Footer services column default. |
| WhatsApp helpers | [lib/whatsapp.ts](apps/web/src/lib/whatsapp.ts) | Hardcoded logic — nomor tetap dari CMS. |
| Fonts (Fraunces, Plus Jakarta Sans) preload | [BaseLayout.astro:30-31](apps/web/src/layouts/BaseLayout.astro#L30) | Hardcoded — aset di `public/fonts/`. |
| Favicon | [BaseLayout.astro](apps/web/src/layouts/BaseLayout.astro) | **CMS Hybrid** — cascade: `site-settings.favicon` → `/favicon.svg` fallback. |
| Default meta title/description | BaseLayout.astro | **CMS Hybrid** — cascade: prop → `site-settings.defaultSeo.metaTitle/metaDescription` → hardcoded fallback. |
| OG image default | BaseLayout.astro | **CMS Hybrid** — cascade: prop → `site-settings.defaultSeo.ogImage`. |
| Google Analytics (gtag GA4) | BaseLayout.astro `<head>` | **CMS Dynamic** — injected saat `site-settings.defaultSeo.googleAnalyticsId` diisi. Kosong = skip. |
| Cloudflare Web Analytics | BaseLayout.astro end-of-body | **CMS Dynamic** — injected saat `site-settings.defaultSeo.cloudflareWebAnalyticsToken` diisi. Cookieless, privacy-first. Bisa dipakai bareng GA. |
| Tracking / additional scripts | Footer.astro end (after `</footer>`) | **CMS Dynamic** — `site-settings.footer.additionalScripts` di-inject via `set:html`. Trusted karena update super-admin only. |

---

## 3. Daftar Hardcoded / Hybrid & Rekomendasi Migrasi

Diurutkan berdasarkan dampak untuk content manager.

### 🔴 Prioritas TINGGI — sering diubah, kandidat migrasi

#### 3.1 Homepage fallback content (Hero copy, ValueProps, Stats, Testimonials)

- **Sekarang**: konstanta di `pages/index.astro` (fallbackHero/ValueProps/Stats/Testimonials/CTA).
- **Ideal**: **Option B — migrasi ke Payload.** Buat entry `Page(slug=home)` di CMS dengan blocks yang mirror struktur fallback. Sistem sudah support (kondisional di file). Setelah editor mengisi, fallback otomatis tidak dipakai.
- **Effort**: Zero coding — cukup masuk admin, buat page slug=home, susun block, publish. Namun 4 sample testimonials di fallback dummy (Sarah/James/Maya) sebaiknya diganti data asli lewat CMS.

#### 3.2 Halaman `/property` (Coming Soon)

- **Sekarang**: Judul, subheading, CTA text semua hardcoded di [property.astro](apps/web/src/pages/property.astro).
- **Ideal**: **Option B** — buat `Page(slug=property)` di CMS dengan template `landing`, isi block hero + CTA. Hapus file khusus `property.astro` (biarkan catch-all `[...slug].astro` yang render).
- **Effort**: Rendah — pindah copy dari Astro ke block di CMS.

#### 3.3 Empty-state copy di listing pages

- **Sekarang**: pesan "No X published yet — Buka CMS admin → …" di tiap `<module>/index.astro`.
- **Ideal**: **Option A** (tetap hardcoded) untuk sekarang — pesan ini technical debt yang bantu developer. Untuk production, cukup ganti jadi 1 pesan generic ("Coming soon") atau sembunyikan section.

#### 3.4 Module Toggle (`apps/web/src/config/modules.ts`)

- **Sekarang**: file TypeScript, tidak bisa diubah tanpa deploy.
- **Ideal**: **Option B** — bikin global baru di Payload, mis. `module-toggle`:

  ```ts
  // apps/cms/src/globals/ModuleToggle.ts
  {
    slug: 'module-toggle',
    fields: [
      { name: 'tours',           type: 'checkbox', defaultValue: true, label: 'Tours & Activities' },
      { name: 'accommodations',  type: 'checkbox', defaultValue: true, label: 'Villas & Hotels' },
      { name: 'waterActivities', type: 'checkbox', defaultValue: true, label: 'Water Activities' },
      { name: 'yacht',           type: 'checkbox', defaultValue: true, label: 'Private Yacht' },
      { name: 'restaurants',     type: 'checkbox', defaultValue: true, label: 'Restaurants' },
      { name: 'weddings',        type: 'checkbox', defaultValue: true, label: 'Weddings & Events' },
      { name: 'rentals',         type: 'checkbox', defaultValue: true, label: 'Rentals' },
    ],
  }
  ```

  Lalu di [config/modules.ts](apps/web/src/config/modules.ts), `enabledModules()` merge dgn global toggle (CMS overrides default).
- **Effort**: Medium — perlu 1 global baru + adaptasi Footer + potensi middleware untuk mem-block route yang di-disable.

### 🟡 Prioritas SEDANG — inkonsistensi schema vs frontend

#### 3.5 Favicon dari CMS (`site-settings.favicon`)

- **Sekarang**: BaseLayout hardcode `/favicon.svg`.
- **Ideal**: **Option B** — di [BaseLayout.astro](apps/web/src/layouts/BaseLayout.astro), fetch `getSiteSettings()` dan pakai `settings.favicon.url` kalau ada; fallback `/favicon.svg`.

#### 3.6 OG image default dari CMS (`site-settings.defaultSeo.ogImage`)

- **Sekarang**: prop `ogImage` per-page saja.
- **Ideal**: **Option B** — di BaseLayout, kalau `ogImage` prop kosong pakai `settings.defaultSeo.ogImage.url`.

#### 3.7 Google Analytics ID + Additional Scripts

- **Sekarang**: field ada di schema (`site-settings.defaultSeo.googleAnalyticsId`, `site-settings.footer.additionalScripts`), tapi **tidak di-render** di manapun.
- **Ideal**: **Option B** — inject di BaseLayout `<head>` (GA) atau sebelum `</body>` (additional scripts).
- **Effort**: Rendah — 5-10 baris di BaseLayout.

#### 3.8 Meta tag default site-wide

- **Sekarang**: `BaseLayout.astro` mem-format `siteTitle = "{title} — DnJourneysBali"` hardcoded.
- **Ideal**: **Option B** — `— {siteName}` dari `site-settings.siteName`.

### 🟢 Prioritas RENDAH — biarkan hardcoded

- Design tokens Tailwind (warna, spacing, font family).
- SVG icon markup (Instagram/FB/TikTok/YouTube di Footer).
- Skrip mobile-menu toggle di Header.
- Block component structure (`HeroBlock.astro`, dst.) — struktur tetap kode, konten dari CMS.
- File `demo-filter.astro` — sebaiknya **dihapus** post-Phase 3.5 (comment di file mengonfirmasi).

### Ringkasan temuan inkonsistensi

| Temuan | Impact |
|---|---|
| `site-settings.favicon` didefinisikan tapi tidak dipakai frontend | Editor upload favicon tidak berubah di web. |
| `site-settings.defaultSeo.ogImage` tidak dipakai sebagai fallback | Halaman tanpa `ogImage` prop punya OG kosong. |
| `site-settings.defaultSeo.googleAnalyticsId` tidak di-inject | Analytics tidak berjalan meski di-set. |
| `site-settings.footer.additionalScripts` (code HTML) tidak di-render | Snippet tracking pixel/heatmap tidak jalan. |
| `showNewsletter` bool di FooterSettings — belum ada implementasi frontend | Toggle tanpa efek. |
| Modul toggle live di file, bukan CMS | Perlu deploy untuk enable/disable. |
| `/demo-filter.astro` masih ada | Halaman dev tidak boleh live di production. |

---

## 4. Batasan Akses & Panduan Pengelolaan

### 4.1 BISA dilakukan Admin/Content Manager tanpa developer

Ini pekerjaan yang bisa langsung dikerjakan di admin panel (`http://localhost:3030/admin` di dev, URL production di produksi). RBAC berlaku (lihat [access/roles.ts](apps/cms/src/access/roles.ts)):

**Semua role (Editor+):**
- Edit teks / gambar entry service yang sudah ada (Tours, Villas, Water Activities, Yachts, Restaurants, Venues, Rentals):
  - Ganti judul, subtitle, deskripsi, richText
  - Upload/ganti featured image, gallery
  - Ubah harga / room types / packages / pricing tiers
  - Ubah highlights, itinerary, includes, amenities
  - Update WhatsApp pre-filled message per entry
- Upload media baru ke koleksi Media (foto/video)
- Edit Destinations dan Categories yang sudah ada

**Admin & Super Admin (bukan Editor):**
- Toggle `status` entry (draft ↔ published)
- Buat entry service baru (Tours, Villas, dst.)
- Buat Destination / Category baru
- Ubah `sortOrder` & `isFeatured`

**Super Admin only:**
- Ubah `site-settings` (brand, kontak, social, WhatsApp defaults, footer copyright, dsb.)
- Ubah `header-settings` (menu utama, CTA behavior)
- Ubah `footer-settings` (kolom footer, services override)
- Ubah `menus` (main-navigation, footer menus)
- Buat / hapus **Pages** (termasuk homepage `slug=home`) — susun blocks page-builder
- Isi **Custom Sections** (`additionalBlocks` di setiap service entry) — extra block CTA/Gallery/RichText di detail page
- Create/delete users, ubah role user
- Delete entry service

### 4.2 WAJIB melibatkan developer

Tugas yang butuh perubahan kode di `apps/`:

- **Menambah field baru** ke koleksi (mis. field `bookingLeadTime` di Tours). Butuh edit `apps/cms/src/collections/*.ts` + `pnpm generate:types` + migrate DB. Lihat [02-DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md).
- **Menambah koleksi baru** (mis. `blog-posts`, `packages`).
- **Menambah block baru** ke page-builder (mis. `pricingTable`, `mapExplorer`). Butuh:
  - Definisi di `apps/cms/src/blocks/index.ts`
  - Komponen render di `apps/web/src/components/blocks/`
  - Registrasi di `BlockRenderer.astro`
- **Menambah halaman dgn layout unik** yang tidak bisa disusun dari block yang ada. (Kalau bisa disusun dari block existing → cukup buat `Page` di CMS — no code.)
- **Menambah service module baru** (mis. "Spa & Wellness"). Butuh: collection baru + kartu + halaman listing + detail template + entry di `modules.ts`.
- **Ubah design system** — warna, font, spacing tokens (di [tailwind.config.mjs](apps/web/tailwind.config.mjs) + `styles/global.css`).
- **Integrasi pihak ketiga** — payment gateway, live chat, Google Analytics injection, newsletter provider, dsb.
- **Perubahan alur booking** (misal switch dari WhatsApp ke form).
- **Perubahan struktur URL / routing** (mis. rename `/villa` jadi `/stays`).
- **Migrasi DB** kapanpun schema Payload berubah — `pnpm generate:types` + `payload migrate:create` + `payload migrate`.
- **Membuat toggle module CMS-based** (rekomendasi 3.4 di atas).
- **Memasang tracking / analytics** dari `site-settings.defaultSeo.googleAnalyticsId` atau `additionalScripts` (rekomendasi 3.7).

### 4.3 Aturan singkat

> Kalau kamu mengubah **isi** (teks/gambar/nomor/harga) — bisa dari CMS.
> Kalau kamu mengubah **struktur** (field baru, block baru, layout baru) — panggil developer.

---

## Referensi silang

- Arsitektur monorepo & alur data → [01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md)
- Skema field lengkap tiap koleksi → [02-DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md)
- Access control (siapa boleh apa) → **04-RBAC.md**
