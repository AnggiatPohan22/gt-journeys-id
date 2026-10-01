# Panduan Template Header

> Phase 3.24 — Sistem Template Header. Semua path, nama field, dan cuplikan kode di
> bawah diambil dari kode nyata (diinspeksi 2026-08-25).

## Ringkasan

Header bukan lagi satu komponen hardcoded. Sebuah **template registry** (TypeScript
biasa, framework-agnostic) mendeklarasikan layout header yang tersedia dan **slot**
konten apa saja yang didukung tiap layout. Super Admin memilih template di CMS;
frontend membaca pilihan itu lalu me-render komponen Astro yang cocok.

```
packages/shared/src/template-registry.ts   ← sumber kebenaran tunggal (id, name, slots, thumbnail)
        │                                            │
        ▼ (CMS import, path relatif)                 ▼ (Astro import, alias @shared)
apps/cms/src/globals/HeaderSettings.ts        apps/web/src/components/navigation/HeaderRenderer.astro
  - select `template` (opsi dari registry)      - map templateId → HeaderTemplateN.astro
  - field slot muncul via admin.condition        - fetch header-settings + site-settings
        │                                          - resolve nav/cta/social → props `ctx`
        │  simpan                                  - <Template {...ctx} />
        ▼                                            ▲
   Payload DB (global `header-settings`)  ── GET /api/globals/header-settings ──┘
                                          (apps/web/src/lib/payload.ts → getHeaderSettings)
```

Fallback: kalau `header-settings.template` kosong/tak terjangkau, HeaderRenderer memakai
`defaultTemplateId('header')` → `header-1`.

## Template Saat Ini

| ID | Nama (registry) | File komponen | Slot didukung | Thumbnail |
|----|-----------------|---------------|---------------|-----------|
| `header-1` | Classic — Logo · Menu · CTA | `apps/web/src/components/navigation/templates/HeaderTemplate1.astro` | `logo`, `primaryMenu`, `ctaButton` | `apps/cms/public/admin-thumbs/header-1.svg` |
| `header-2` | Search & Social — Logo · Search · Menu · Social | `apps/web/src/components/navigation/templates/HeaderTemplate2.astro` | `logo`, `searchToggle`, `primaryMenu`, `socialLinks` | `apps/cms/public/admin-thumbs/header-2.svg` |
| `header-3` | Top Bar — Address/Phone/Social + Logo · Menu · CTA | `apps/web/src/components/navigation/templates/HeaderTemplate3.astro` | `logo`, `primaryMenu`, `ctaButton`, `address`, `phone`, `socialLinks`, `customText` | `apps/cms/public/admin-thumbs/header-3.svg` |

Gabungan slot (dari tipe `SlotKey` di registry): `logo`, `primaryMenu`, `secondaryMenu`,
`ctaButton`, `searchToggle`, `socialLinks`, `address`, `phone`, `email`, `customText`,
ditambah slot khusus footer. Tidak semua slot punya field CMS — `logo`, `socialLinks`,
`address`, `phone` mengambil datanya dari `SiteSettings`; global header hanya menyimpan
wiring/toggle.

## Peta File

| File | Peran |
|------|-------|
| `packages/shared/src/template-registry.ts` | Registry: `TemplateKind`, `SlotKey`, `TemplateDef`, `HEADER_TEMPLATES`, `REGISTRY_ID`, `REGISTRY_VERSION`, helper (`templatesByKind`, `getTemplate`, `templateSupports`, `toSelectOptions`, `defaultTemplateId`), kontrak export (`TemplateExport`, `validateExport`) |
| `apps/cms/src/globals/HeaderSettings.ts` | Global Payload `header-settings`: select `template` + field slot (kondisional) + UI field `importExport` |
| `apps/cms/src/components/TemplatePickerField.tsx` | Custom Field admin — pemilih template berupa thumbnail radio |
| `apps/cms/src/components/TemplateImportExport.tsx` | Custom UI field admin — panel export/import JSON |
| `apps/cms/public/admin-thumbs/header-*.svg` | Thumbnail yang ditampilkan picker (di-serve CMS di `/admin-thumbs/*`) |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Import map Payload (generated) — WAJIB memuat kedua custom component |
| `apps/cms/src/scripts/seed-header-footer-templates.ts` | Mengeset default `template` pada record global existing |
| `apps/web/src/components/navigation/HeaderRenderer.astro` | Fetch data, membangun `ctx`, dispatch ke `HeaderTemplateN` terpilih |
| `apps/web/src/components/navigation/templates/HeaderTemplate1.astro` | Layout Classic |
| `apps/web/src/components/navigation/templates/HeaderTemplate2.astro` | Layout Search & Social |
| `apps/web/src/components/navigation/templates/HeaderTemplate3.astro` | Layout Top Bar |
| `apps/web/src/components/navigation/templates/_HeaderNavDesktop.astro` | Nav desktop bersama (dropdown buka via klik) |
| `apps/web/src/components/navigation/templates/_HeaderNavMobile.astro` | Nav mobile bersama (sub-menu accordion) |
| `apps/web/src/components/navigation/templates/_HeaderMobile.astro` | Overlay mobile full-screen bersama (memuat `_HeaderNavMobile` + `<slot/>`) |
| `apps/web/src/components/navigation/templates/_SocialIcons.astro` | Ikon social brand bersama (IG/FB/TikTok/YouTube) |
| `apps/web/src/lib/payload.ts` | `getHeaderSettings()` → `fetchGlobal('header-settings')` (REST `GET /api/globals/header-settings`) |
| `apps/web/src/layouts/PageLayout.astro` | Import `HeaderRenderer.astro` sebagai `Header`, render `<Header transparent={transparentHeader} />` |
| `apps/web/src/pages/404.astro` | Juga import `HeaderRenderer.astro` sebagai `Header` |
| `packages/shared/src/types/payload-types.ts` | Tipe generated (`HeaderSetting.template: 'header-1' \| 'header-2' \| 'header-3'`, field slot) |

> Catatan: `apps/web/src/components/navigation/Header.astro` adalah header sebelum 3.24 dan
> sudah tidak diimpor di mana pun (dibiarkan sebagai referensi). `HeaderTemplate1` adalah replikanya.

## Props `ctx` yang dikirim ke setiap template header

`HeaderRenderer.astro` membangun satu objek dan menyebarnya ke template terpilih
(`<Template {...ctx} />`). Template baru menerima persis props ini:

```ts
// Bentuk yang dirakit di HeaderRenderer.astro (longgar — template membaca yang diperlukan)
interface HeaderCtx {
  siteName: string
  logoUrl: string
  logoAlt: string
  items: NavItem[]            // nav yang sudah di-resolve (label, url, target, asSpan, children[])
  currentPath: string
  transparent: boolean
  cta: { show: boolean; text: string; href: string; external: boolean }
  showSearch: boolean         // headerCfg.showSearch !== false
  showSocial: boolean         // headerCfg.showSocialLinks !== false
  social: { instagram: string; facebook: string; tiktok: string; youtube: string }  // URL hasil resolve dari SiteSettings
  topBar: { showAddress: boolean; showPhone: boolean; address: string; phone: string; text: string }
}
// NavItem: { label; url; target?; asSpan?; children?: NavItem[] }  (asSpan = trigger dropdown saja, bukan link)
```

---

## Cara Menambah Template Header Baru

Contoh: menambah `header-4` ("Centered — Logo tengah, menu terbelah").

### Langkah 1: Buat file komponen

- **Direktori:** `apps/web/src/components/navigation/templates/`
- **Penamaan:** `HeaderTemplate<N>.astro` (PascalCase, N berurutan). Untuk template ke-4: `HeaderTemplate4.astro`.
- Mulai dari template paling **sederhana** (`HeaderTemplate1.astro`) lalu sesuaikan. Boilerplate:

```astro
---
// HeaderTemplate4 — "Centered". Menerima props ctx dari HeaderRenderer.
import Icon from '@components/common/Icon.astro'
import NavDesktop from './_HeaderNavDesktop.astro'   // nav desktop + dropdown klik
import HeaderMobile from './_HeaderMobile.astro'      // overlay mobile full-screen
import SocialIcons from './_SocialIcons.astro'        // hanya jika template pakai slot `socialLinks`
// Destructure hanya props ctx sesuai slot yang dibutuhkan template ini:
const { siteName, logoUrl, logoAlt, items = [], currentPath = '/', transparent = false,
        cta = { show: false }, showSocial = true, social = {} } = Astro.props as any
const socials = [ social.instagram, social.facebook, social.tiktok, social.youtube ].filter(Boolean)
---
<header id="main-header" class:list={['fixed top-0 left-0 right-0 z-40 transition-all duration-300',
  transparent ? 'bg-transparent' : 'bg-white/85 backdrop-blur-md border-b border-sand-dark/20 shadow-sm']}>
  <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between h-20" aria-label="Main navigation">
      <a href="/" class="flex items-center gap-3 no-underline text-current">
        {logoUrl
          ? <img src={logoUrl} alt={logoAlt} class="h-10 w-10 rounded-full object-cover" />
          : <span class="h-10 w-10 rounded-full bg-ocean text-white flex items-center justify-center font-display font-bold">{siteName.slice(0,2)}</span>}
        <span class="font-display text-lg font-bold text-ocean hidden sm:inline">{siteName}</span>
      </a>

      {/* Nav desktop — SELALU pakai partial bersama supaya sub-menu/dropdown jalan */}
      <NavDesktop items={items} currentPath={currentPath} />

      <div class="flex items-center gap-3">
        {/* Slot kondisional: CTA (hanya jika template mendeklarasikan `ctaButton`) */}
        {cta.show && cta.href && (
          <a href={cta.href} target={cta.external ? '_blank' : undefined} rel={cta.external ? 'noopener noreferrer' : undefined}
             class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-ocean text-white text-sm font-semibold rounded-full no-underline">
            <Icon name="chat" class="w-4 h-4" /><span class="hidden md:inline">{cta.text}</span><span class="md:hidden">Book</span>
          </a>
        )}
        {/* Tombol toggle mobile — id WAJIB `mobile-toggle`; di-wire oleh _HeaderMobile */}
        <button id="mobile-toggle" type="button" class="lg:hidden p-2 text-ocean rounded-md hover:bg-sand"
                aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
          <Icon name="menu" class="w-6 h-6 mobile-toggle-open" />
          <Icon name="close" class="w-6 h-6 mobile-toggle-close hidden" />
        </button>
      </div>
    </nav>
  </div>
</header>

{/* Overlay mobile full-screen — WAJIB di LUAR <header> (backdrop-blur pada header
    membuat containing block yang akan menjebak overlay fixed). Kirim extras
    (search/social/cta) sebagai children. */}
<HeaderMobile items={items} currentPath={currentPath} siteName={siteName} logoUrl={logoUrl} logoAlt={logoAlt}>
  {cta.show && cta.href && (
    <a href={cta.href} class="mt-5 flex items-center justify-center gap-2 px-5 py-3 bg-ocean text-white text-base font-semibold rounded-full no-underline">
      <Icon name="chat" class="w-5 h-5" />{cta.text}
    </a>
  )}
</HeaderMobile>
<div class="h-20"></div>  {/* spacer = tinggi header */}
```

**Antarmuka props/slot:** lihat [Props `ctx`](#props-ctx-yang-dikirim-ke-setiap-template-header)
di atas — template hanya men-destructure props yang cocok dengan slot yang dideklarasikannya.

**Bagian wajib disertakan:**
1. `<header id="main-header" ...>` dengan logika class transparent/solid.
2. Logo + `<NavDesktop items currentPath />` untuk nav desktop.
3. Tombol `<button id="mobile-toggle">` dengan ikon `.mobile-toggle-open` / `.mobile-toggle-close`.
4. `<HeaderMobile ...>` **di luar** elemen `<header>`.
5. Spacer `<div class="h-...">` setinggi header.

**Slot kondisional:** bungkus tiap blok opsional dengan flag ctx yang bersesuaian:
`{cta.show && ...}` (ctaButton), `{showSearch && ...}` (searchToggle),
`{showSocial && socials.length > 0 && ...}` (socialLinks), `{topBar.showAddress && topBar.address && ...}`
(address), dst. Gunakan `<SocialIcons social={social} linkClass="..." iconClass="..." />` untuk social —
**jangan** pakai `<Icon name="instagram" />` (lookup Icon tidak punya ikon brand).

**Responsif:** nav desktop `hidden lg:flex` (di dalam `NavDesktop`); tombol mobile `lg:hidden`;
`_HeaderMobile` me-render overlay full-screen `fixed inset-0` dengan scroll-lock body dan
accordion (`_HeaderNavMobile`). Semua ini otomatis didapat dengan memakai partial bersama —
jangan bikin menu mobile manual.

### Langkah 2: Daftarkan template

- **File:** `packages/shared/src/template-registry.ts`
- Tambah entri ke array `HEADER_TEMPLATES`:

```ts
export const HEADER_TEMPLATES: TemplateDef[] = [
  // ...header-1, header-2, header-3 yang sudah ada...
  {
    templateId: 'header-4',                 // wajib unik + sama dgn key di map renderer
    name: 'Centered — Logo tengah, menu terbelah',  // tampil di picker admin
    kind: 'header',                         // 'header' | 'footer'
    slots: ['logo', 'primaryMenu', 'ctaButton'],  // SlotKey[] — mengatur admin.condition
    thumbnail: '/admin-thumbs/header-4.svg',      // di-serve CMS
  },
]
```

- `templateId` adalah kunci penghubung di semua tempat (registry ↔ nilai select CMS ↔ map renderer).
- `name` adalah label yang dibaca manusia di dropdown/picker CMS.
- `slots` menentukan field konten mana yang muncul di CMS untuk template ini — `admin.condition`
  di Payload memanggil `templateSupports(template, slot)` terhadap daftar ini.

Lalu daftarkan komponennya di renderer:

- **File:** `apps/web/src/components/navigation/HeaderRenderer.astro`

```astro
import HeaderTemplate4 from './templates/HeaderTemplate4.astro'   // tambah import
// ...
const TEMPLATES: Record<string, any> = {
  'header-1': HeaderTemplate1,
  'header-2': HeaderTemplate2,
  'header-3': HeaderTemplate3,
  'header-4': HeaderTemplate4,   // tambah entri map (key === templateId)
}
```

### Langkah 3: Tambah ke config Payload CMS

- **File:** `apps/cms/src/globals/HeaderSettings.ts`
- Opsi select `template` berasal dari `toSelectOptions('header')` yang diturunkan dari
  registry — jadi **menambah ke registry otomatis menambah opsi dropdown**. Tak perlu edit opsi manual.
- Edit file ini HANYA jika template Anda memperkenalkan **slot baru** yang belum punya field.
  Tambah field yang di-gate oleh slot. Helper sudah ada di file ini:

```ts
// Sudah didefinisikan di atas HeaderSettings.ts:
const supports = (slot) => (data) => templateSupports(data?.template, slot)

// Contoh: template memperkenalkan slot baru `announcement` →
{
  name: 'announcementText',
  type: 'text',
  admin: {
    condition: supports('announcement'),   // hanya muncul saat template terpilih memuat slot ini
    description: 'Teks announcement bar.',
  },
}
```

(Anda juga menambah `'announcement'` ke union `SlotKey` di registry.)

### Langkah 4: Tambah thumbnail preview

- **Direktori:** `apps/cms/public/admin-thumbs/`
- **Penamaan:** `<templateId>.svg` → `header-4.svg` (harus sama dgn `thumbnail` di entri registry).
- **Format/ukuran:** thumbnail existing berupa SVG `viewBox="0 0 320 90"` (±320×90, ±2.4:1).
  PNG/JPG juga bisa; buat kecil dan gaya wireframe. Di-serve di `http://localhost:3030/admin-thumbs/header-4.svg`.

### Langkah 5: Build & verifikasi

```bash
# 1. Regenerate tipe Payload (perubahan registry memengaruhi union select)
cd apps/cms && pnpm generate:types

# 2. Kalau menambah/rename custom admin component, regenerate import map
cd apps/cms && pnpm generate:importmap

# 3. Restart CMS (schema push hanya jika menambah field baru)
cd apps/cms && pnpm dev

# 4. Frontend
cd apps/web && pnpm dev      # atau: pnpm --filter @gt-journeys/web build
```

- **Admin:** buka `Header Settings` → picker menampilkan thumbnail baru; memilihnya hanya
  menampilkan field slot yang dideklarasikannya.
- **Frontend:** pilih `header-4`, reload `/` → layout baru ter-render.
- **Responsif:** kecilkan ke <1024px → tombol mobile muncul; buka → overlay full-screen;
  item menu induk mengembang saat di-tap.

---

## Cara Menghapus Template Header

### Checklist pra-hapus
- **Apakah sedang aktif?** Cek global CMS (lihat Langkah 1). Kalau template ini yang sedang
  terpilih, ganti ke template lain dulu.
- **Menghapus template aktif:** frontend fallback ke
  `TEMPLATES[templateId] ?? HeaderTemplate1` dan `headerCfg?.template || defaultTemplateId('header')`
  — jadi id yang basah/terhapus akan me-render `header-1`. Tapi record CMS tetap menyimpan id
  terhapus, dan tipe `HeaderSetting.template` tak lagi memuatnya → **error tipe saat build**
  sampai di-save ulang. Selalu arahkan CMS ke template valid sebelum menghapus.
- **Data konten tersimpan:** nilai field slot (mis. `topBarText`) tetap ada di DB walau
  template tak memakainya lagi; hanya tidak dirender. Tidak ada migrasi destruktif.

### Langkah 1: Cek pemakaian aktif
```bash
curl -s "http://localhost:3030/api/globals/header-settings?depth=0" \
  | python -c "import sys,json;print(json.load(sys.stdin).get('template'))"
```
Kalau mencetak id yang mau dihapus, ganti dulu di admin.

### Langkah 2: Hapus dari config CMS
- **File:** `apps/cms/src/globals/HeaderSettings.ts` — hanya kalau Anda menambah field slot
  khusus untuk template ini, hapus field tsb. Opsi `template` digerakkan registry, jadi tak ada
  yang perlu dihapus di situ.

### Langkah 3: Hapus dari registry
- **File:** `packages/shared/src/template-registry.ts` — hapus entri dari `HEADER_TEMPLATES`.
- **File:** `apps/web/src/components/navigation/HeaderRenderer.astro` — hapus import dan
  entri map `TEMPLATES`.

### Langkah 4: Hapus file komponen
- Hapus `apps/web/src/components/navigation/templates/HeaderTemplate<N>.astro`.

### Langkah 5: Bersih-bersih
- Hapus `apps/cms/public/admin-thumbs/header-<N>.svg`.
- Hapus slot key yang Anda tambah khusus untuk template ini dari union `SlotKey`.
- `cd apps/cms && pnpm generate:types` lalu build kedua app untuk memastikan tak ada error tipe/import.

---

## Cara Memodifikasi Template Header yang Ada

### Mengubah layout/struktur
- Edit langsung file komponen, mis. `HeaderTemplate2.astro`.
- **Penting:** perubahan berlaku ke setiap site/build yang memilih template ini.
- Tes dengan aman: jalankan dev `apps/web`, ganti CMS ke template tsb, reload, cek desktop +
  mobile sebelum deploy.

### Menambah opsi konfigurasi baru (toggle / alignment / width)
Contoh: menambah toggle `compact` ke header-2.

1. **Field Payload** — `apps/cms/src/globals/HeaderSettings.ts`:
```ts
{
  name: 'compact',
  type: 'checkbox',
  defaultValue: false,
  admin: { condition: supports('primaryMenu'), description: 'Header versi ringkas.' },
}
```
2. **Tipe** — `cd apps/cms && pnpm generate:types` (menambah `compact?: boolean | null`).
3. **Teruskan** — `apps/web/src/components/navigation/HeaderRenderer.astro`, tambah ke `ctx`:
```ts
const ctx = { /* ...existing... */, compact: headerCfg?.compact === true }
```
4. **Pakai** — di `HeaderTemplate2.astro`:
```astro
const { /* ... */, compact = false } = Astro.props as any
<nav class:list={['flex items-center gap-4', compact ? 'h-14' : 'h-20']}>
```

### Mengubah slot yang didukung template
1. Perbarui array `slots` untuk entri itu di `packages/shared/src/template-registry.ts`.
2. Kalau menambah slot yang belum punya field, tambah field kondisional di `HeaderSettings.ts`
   (`admin.condition: supports('<slot>')`); kalau menghapus, hapus/ungate field-nya.
3. Perbarui komponen untuk me-render (atau berhenti me-render) slot itu, dan tambah prop ke
   `ctx` di `HeaderRenderer.astro` bila butuh data baru.
4. `pnpm generate:types` + restart CMS.

---

## Troubleshooting

**Template tidak muncul di dropdown CMS**
- Entri hilang dari `HEADER_TEMPLATES` (registry) atau `kind` salah (`'header'`). Opsi berasal
  dari `toSelectOptions('header')`.
- Tipe basi → jalankan `cd apps/cms && pnpm generate:types`, restart CMS.

**Template dipilih tapi frontend menampilkan template salah/lama**
- `templateId` di registry tidak sama dengan key di map `TEMPLATES` `HeaderRenderer.astro`
  → fallback ke `HeaderTemplate1`.
- Frontend statis — rebuild `apps/web` (atau reload dev) setelah mengubah pilihan CMS.

**Field konten (slot) tidak muncul setelah memilih template**
- Slot tidak ada di array `slots` template itu → `admin.condition` (`supports(...)`) menyembunyikan field.
- `admin.condition` field mengacu ke slot key yang salah.

**Build gagal setelah menambah/menghapus template**
- `HeaderRenderer.astro` mengimpor komponen yang sudah dihapus, atau map `TEMPLATES` mengacu ke
  import yang hilang. Jaga import + entri map + registry tetap sinkron.
- Union `HeaderSetting.template` tak lagi memuat nilai yang tersimpan di DB — save ulang global-nya
  ke template valid.

**Import gagal karena template tidak ditemukan**
- `validateExport` mengembalikan `template not found` saat `templateId` di JSON tidak ada di
  registry project target. Target harus mendaftarkan `templateId` yang sama (lihat bagian
  Import/Export di phase doc / panduan footer). Perbaiki dengan menambah template atau mengubah
  `templateId` di JSON.

**Picker / panel import-export tidak render** (`getFromImportMap: PayloadComponent not found`)
- Jalankan `cd apps/cms && pnpm generate:importmap`, lalu restart CMS. Wajib setiap kali
  `TemplatePickerField`/`TemplateImportExport` (atau custom admin component apa pun) ditambah/dipindah.

**Template aktif terhapus — site "rusak"**
- Renderer fallback ke `header-1`, jadi site tetap render. Kalau union tipe CMS memicu error build:
  daftarkan lagi template ke registry ATAU set `header-settings.template` ke id valid (via admin
  atau `pnpm tsx src/scripts/seed-header-footer-templates.ts`), lalu `pnpm generate:types`.

**Masalah layout responsif/mobile dengan template baru**
- Menu mobile tidak full-screen / terpotong setinggi header → Anda me-render `<HeaderMobile>`
  **di dalam** `<header>`; `backdrop-blur` header menjebak overlay fixed. Pindahkan
  `<HeaderMobile>` menjadi sibling **setelah** `</header>`.
- Toggle tidak berfungsi → tombol harus punya `id="mobile-toggle"` dan dua ikonnya harus punya
  `.mobile-toggle-open` / `.mobile-toggle-close`.
- Sub-menu hilang di mobile → pakai `_HeaderMobile` (yang me-render `_HeaderNavMobile`), bukan
  list buatan tangan.

---

## Keterbatasan yang Diketahui (ditemukan saat inspeksi)

1. **Satu header/footer per site.** `header-settings` adalah **global** Payload (satu record),
   jadi template + konten bersifat site-wide. Header per-halaman butuh collection.
2. **Tidak ada backend search.** Slot `searchToggle` hanya me-render `<input>` search; belum ada
   handler search — sifatnya presentasional.
3. **Slot `secondaryMenu` belum ada consumer.** Field ada (di-gate `supports('secondaryMenu')`)
   tapi tak ada template yang men-list `secondaryMenu`, jadi tak pernah dirender.
4. **Item menu induk yang punya children bukan link.** Baik desktop (`_HeaderNavDesktop`) maupun
   mobile (`_HeaderNavMobile`) memperlakukan induk-ber-children sebagai toggle saja; induk yang
   juga punya URL sendiri tidak bisa langsung dinavigasi — children yang membawa tujuannya.
5. **Menghapus template aktif bisa menggagalkan type-check** (union `HeaderSetting.template`)
   sampai global di-save ulang, walau runtime fallback ke `header-1`.
6. **Icon set adalah lookup tetap** (`apps/web/src/components/common/Icon.astro`) tanpa ikon
   brand — pakai `_SocialIcons.astro` untuk social, bukan `<Icon>`.
7. **Import/Export berupa UI field in-page**, bukan admin view/route tersendiri.
8. **Import CMS↔shared memakai path relatif dalam** (`../../../../packages/shared/src/template-registry`)
   dan bergantung pada Next `experimental.externalDir: true` (`apps/cms/next.config.mjs`).
