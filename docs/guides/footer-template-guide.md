# Panduan Template Footer

> Phase 3.24 — Sistem Template Footer. Semua path, nama field, dan cuplikan kode di
> bawah diambil dari kode nyata (diinspeksi 2026-08-25). Mengikuti
> [Panduan Template Header](header-template-guide.md); perbedaan khusus footer
> ditandai eksplisit.

## Ringkasan

Seperti header, footer digerakkan template. **Template registry** yang sama
mendeklarasikan layout footer dan **slot**-nya. Super Admin memilih template footer di
CMS; frontend membaca pilihan itu dan me-render komponen Astro yang cocok.

```
packages/shared/src/template-registry.ts   ← sumber kebenaran tunggal (FOOTER_TEMPLATES)
        │                                            │
        ▼ (CMS import, path relatif)                 ▼ (Astro import, alias @shared)
apps/cms/src/globals/FooterSettings.ts        apps/web/src/components/navigation/FooterRenderer.astro
  - select `template` (opsi dari registry)      - map templateId → FooterTemplateN.astro
  - field slot muncul via admin.condition        - fetch footer-settings + site-settings + service-types
        │                                          - resolve columns/services/social → props `ctx`
        │  simpan                                  - <Template {...ctx} />
        ▼                                            ▲
   Payload DB (global `footer-settings`)  ── GET /api/globals/footer-settings ──┘
                                          (apps/web/src/lib/payload.ts → getFooterSettings)
```

**Beda dengan header:** footer **tidak punya toggle/overlay mobile**. Ini bukan menu yang
bisa di-collapse — melainkan grid responsif yang menumpuk di layar kecil (Tailwind
`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). Tak ada padanan `_HeaderMobile` /
`_HeaderNavDesktop` / `_HeaderNavMobile` di footer.

Fallback: kalau `footer-settings.template` kosong/tak terjangkau, FooterRenderer memakai
`defaultTemplateId('footer')` → `footer-1`.

## Template Saat Ini

| ID | Nama (registry) | File komponen | Slot didukung | Thumbnail |
|----|-----------------|---------------|---------------|-----------|
| `footer-1` | Multi-column — Brand · Columns · Services · Contact | `apps/web/src/components/navigation/templates/FooterTemplate1.astro` | `logo`, `columns`, `socialLinks`, `address`, `phone`, `email`, `copyrightText`, `newsletterToggle` | `apps/cms/public/admin-thumbs/footer-1.svg` |
| `footer-2` | Simple — Logo · Copyright · Social | `apps/web/src/components/navigation/templates/FooterTemplate2.astro` | `logo`, `copyrightText`, `socialLinks` | `apps/cms/public/admin-thumbs/footer-2.svg` |
| `footer-3` | Minimal — Copyright · Legal Links | `apps/web/src/components/navigation/templates/FooterTemplate3.astro` | `copyrightText`, `legalLinks` | `apps/cms/public/admin-thumbs/footer-3.svg` |

Slot khusus footer (dari `SlotKey` di registry): `columns`, `copyrightText`,
`newsletterToggle`, `legalLinks` (ditambah slot bersama `logo`, `socialLinks`, `address`,
`phone`, `email`). Sama seperti header, beberapa slot menarik data dari `SiteSettings`
(logo, social, contact, copyright) — `footer-settings` mayoritas menyimpan struktur kolom
dan toggle.

## Peta File

| File | Peran |
|------|-------|
| `packages/shared/src/template-registry.ts` | Registry termasuk `FOOTER_TEMPLATES` dan helper/kontrak bersama (file yang sama dengan header) |
| `apps/cms/src/globals/FooterSettings.ts` | Global Payload `footer-settings`: select `template` + field slot (kondisional) + UI field `importExport` |
| `apps/cms/src/components/TemplatePickerField.tsx` | Picker bersama (membaca `custom.templateKind: 'footer'`) |
| `apps/cms/src/components/TemplateImportExport.tsx` | Panel export/import bersama (membaca `custom.kind: 'footer'`, `custom.slug: 'footer-settings'`) |
| `apps/cms/public/admin-thumbs/footer-*.svg` | Thumbnail footer |
| `apps/cms/src/scripts/seed-header-footer-templates.ts` | Mengeset default `footer-settings.template` pada record existing |
| `apps/web/src/components/navigation/FooterRenderer.astro` | Fetch data, membangun `ctx`, dispatch ke `FooterTemplateN` terpilih |
| `apps/web/src/components/navigation/templates/FooterTemplate1.astro` | Layout multi-kolom |
| `apps/web/src/components/navigation/templates/FooterTemplate2.astro` | Layout simple (tengah) |
| `apps/web/src/components/navigation/templates/FooterTemplate3.astro` | Layout minimal (satu baris) |
| `apps/web/src/components/navigation/templates/_FooterSocial.astro` | Ikon social footer (gaya gelap) — **khusus footer** (header pakai `_SocialIcons.astro`) |
| `apps/web/src/lib/payload.ts` | `getFooterSettings()` → `fetchGlobal('footer-settings')`; juga `getResolvedServiceTypes()` untuk kolom services |
| `apps/web/src/layouts/PageLayout.astro` | Import `FooterRenderer.astro` sebagai `Footer`, render `<Footer />` |
| `apps/web/src/pages/404.astro` | Juga import `FooterRenderer.astro` sebagai `Footer` |
| `packages/shared/src/types/payload-types.ts` | Tipe generated (`FooterSetting.template: 'footer-1' \| 'footer-2' \| 'footer-3'`, field slot) |

> Catatan: `apps/web/src/components/navigation/Footer.astro` adalah footer sebelum 3.24 dan
> sudah tidak diimpor di mana pun. `FooterTemplate1` adalah replikanya.

## Props `ctx` yang dikirim ke setiap template footer

`FooterRenderer.astro` membangun satu objek dan menyebarnya ke template terpilih
(`<Template {...ctx} />`):

```ts
// Bentuk yang dirakit di FooterRenderer.astro (longgar — template membaca yang diperlukan)
interface FooterCtx {
  siteName: string
  brandTagline: string                       // footerCfg.brandTaglineOverride || SiteSettings.tagline
  logoUrl: string
  logoAlt: string
  contact: { email: string; phone: string; address: string }   // dari SiteSettings.contact
  businessHours?: string
  social: { instagram: string; facebook: string; tiktok: string; youtube: string }  // URL hasil resolve
  showSocial: boolean                        // footerCfg.showSocialLinks !== false
  copyright?: string                         // SiteSettings.footer.copyrightText
  footerColumns: { label: string; items: { label: string; url: string; target?: string }[] }[]
  useFallbackQuickLinks: boolean             // true saat footerColumns kosong
  showBrand: boolean; showServices: boolean; servicesLabel: string
  servicesItems: { label: string; url: string; target?: string }[]  // servicesMenu → ServiceTypes → modules
  showContact: boolean; contactLabel: string
  legalLinks: { label: string; url: string; target?: string }[]     // footer-3
  bottomRight: string                        // footerCfg.bottomBarRightText
  showNewsletter: boolean                    // footerCfg.showNewsletter === true (reserved)
  currentYear: number
}
```

Catatan: `additionalScripts` (HTML tracking dari `SiteSettings.footer.additionalScripts`)
di-render oleh `FooterRenderer.astro` sendiri via `<Fragment set:html={...} />`, bukan oleh
template.

---

## Cara Menambah Template Footer Baru

Contoh: menambah `footer-4` ("Two-column — links kiri, kontak kanan").

### Langkah 1: Buat file komponen

- **Direktori:** `apps/web/src/components/navigation/templates/`
- **Penamaan:** `FooterTemplate<N>.astro`. Untuk ke-4: `FooterTemplate4.astro`.
- Mulai dari footer paling **sederhana** (`FooterTemplate3.astro`) atau layout yang paling mirip.
  Boilerplate berdasarkan template nyata:

```astro
---
// FooterTemplate4 — "Two-column". Menerima props ctx dari FooterRenderer.
import Icon from '@components/common/Icon.astro'      // jika me-render ikon kontak
import FooterSocial from './_FooterSocial.astro'       // ikon social footer (gelap)
const { siteName, brandTagline, logoUrl, logoAlt, contact = {}, social = {}, showSocial = true,
        footerColumns = [], copyright, bottomRight, currentYear } = Astro.props as any
---
<footer class="bg-ocean text-white/85">
  <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
    {/* Slot: columns */}
    <div>
      {footerColumns.map((col: any) => (
        <div class="mb-8">
          <h4 class="font-display text-white text-sm uppercase tracking-widest mb-4">{col.label}</h4>
          <ul class="space-y-2 text-sm">
            {col.items.map((it: any) => (
              <li><a href={it.url} class="text-white/70 hover:text-white no-underline">{it.label}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    {/* Slot: address/phone/email + social */}
    <div class="text-sm space-y-3">
      {contact.phone && <p><a href={`tel:${contact.phone}`} class="text-white/70 hover:text-white no-underline">{contact.phone}</a></p>}
      {contact.email && <p><a href={`mailto:${contact.email}`} class="text-white/70 hover:text-white no-underline">{contact.email}</a></p>}
      {contact.address && <p class="text-white/70">{contact.address}</p>}
      {showSocial && <div class="pt-2"><FooterSocial social={social} /></div>}
    </div>
  </div>
  {/* Slot: copyrightText (bottom bar) */}
  <div class="border-t border-white/10 py-5 text-center text-xs text-white/50">
    &copy; {currentYear} {copyright ?? `${siteName}. All rights reserved.`} · {bottomRight}
  </div>
</footer>
```

**Antarmuka props/slot:** lihat [Props `ctx`](#props-ctx-yang-dikirim-ke-setiap-template-footer)
di atas — destructure hanya props yang cocok dengan slot yang dideklarasikan template.

**Bagian wajib:** satu elemen root `<footer>` dan (untuk bottom bar) baris copyright.
Sisanya opsional per slot.

**Slot kondisional:** template footer umumnya *selalu* me-render slot yang dideklarasikan
(daftar slot sudah membatasi data yang dikirim), tapi Anda tetap bisa membungkus bagian
opsional dengan toggle ctx: `{showBrand && ...}`, `{showServices && servicesItems.length > 0 && ...}`,
`{showContact && ...}`, `{showSocial && ...}`, `{showNewsletter && ...}`.

**Responsif:** gunakan grid stacking Tailwind, mis. `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
**Tidak ada** drawer/toggle mobile untuk footer — otomatis menumpuk.

**Ikon social:** pakai `<FooterSocial social={social} />` (partial footer gaya gelap). **Jangan**
pakai `<Icon name="instagram" />` (tak ada ikon brand di lookup Icon).

### Langkah 2: Daftarkan template

- **File:** `packages/shared/src/template-registry.ts` — tambah ke `FOOTER_TEMPLATES`:

```ts
export const FOOTER_TEMPLATES: TemplateDef[] = [
  // ...footer-1, footer-2, footer-3 yang sudah ada...
  {
    templateId: 'footer-4',                 // unik + sama dgn key map renderer
    name: 'Two-column — links kiri, kontak kanan',
    kind: 'footer',                         // WAJIB 'footer'
    slots: ['columns', 'address', 'phone', 'email', 'socialLinks', 'copyrightText'],
    thumbnail: '/admin-thumbs/footer-4.svg',
  },
]
```

- **File:** `apps/web/src/components/navigation/FooterRenderer.astro` — import + map:

```astro
import FooterTemplate4 from './templates/FooterTemplate4.astro'   // tambah import
// ...
const TEMPLATES: Record<string, any> = {
  'footer-1': FooterTemplate1,
  'footer-2': FooterTemplate2,
  'footer-3': FooterTemplate3,
  'footer-4': FooterTemplate4,   // tambah entri map (key === templateId)
}
```

### Langkah 3: Tambah ke config Payload CMS

- **File:** `apps/cms/src/globals/FooterSettings.ts`
- Opsi select `template` berasal dari `toSelectOptions('footer')` (digerakkan registry) —
  **tak perlu edit dropdown manual**.
- Edit hanya kalau template Anda memperkenalkan **slot baru** tanpa field yang ada. File sudah
  mendefinisikan helper:

```ts
const supports = (slot) => (data) => templateSupports(data?.template, slot)
```

Pemetaan slot→field footer existing (referensi saat memakai ulang slot):

| Slot | Field CMS di FooterSettings.ts | Kondisi |
|------|--------------------------------|---------|
| `logo` | `showBrandColumn`, `brandTaglineOverride` (collapsible Brand) | `supports('logo')` |
| `socialLinks` | `showSocialLinks` | `supports('socialLinks')` |
| `columns` | array `columns`; collapsible Services (`showServicesColumn`, `servicesColumnLabel`, `servicesMenu`) | `supports('columns')` |
| `address` | collapsible Contact (`showContactColumn`, `contactColumnLabel`) | `supports('address')` |
| `newsletterToggle` | `showNewsletter` | `supports('newsletterToggle')` |
| `legalLinks` | `legalLinks` (relationship → menus) | `supports('legalLinks')` |
| (selalu) | `bottomBarRightText` | tidak ada |

### Langkah 4: Tambah thumbnail preview

- **Direktori:** `apps/cms/public/admin-thumbs/`
- **Penamaan:** `<templateId>.svg` → `footer-4.svg` (samakan dgn `thumbnail` di registry).
- **Format/ukuran:** thumbnail footer existing berupa SVG `viewBox="0 0 320 130"` (±320×130).

### Langkah 5: Build & verifikasi
```bash
cd apps/cms && pnpm generate:types       # perubahan registry → perbarui union select
cd apps/cms && pnpm generate:importmap   # hanya kalau custom admin component berubah
cd apps/cms && pnpm dev                   # schema push hanya jika menambah field baru
cd apps/web && pnpm dev                   # atau pnpm --filter @gt-journeys/web build
```
- **Admin:** `Footer Settings` → picker menampilkan thumbnail baru; hanya field slot yang dideklarasikan muncul.
- **Frontend:** pilih `footer-4`, reload → layout baru; kecilkan viewport → kolom menumpuk.

---

## Cara Menghapus Template Footer

### Checklist pra-hapus
- **Aktif?** Menghapus footer yang sedang terpilih membuat renderer fallback ke
  `TEMPLATES[templateId] ?? FooterTemplate1` dan `footerCfg?.template || defaultTemplateId('footer')`
  → `footer-1`. Arahkan CMS ke template valid dulu (union `FooterSetting.template` jika tidak akan
  error type-check sampai di-save ulang).
- **Data tersimpan:** nilai slot (columns, legalLinks, dll) tetap ada di DB, tak dirender.

### Langkah 1: Cek pemakaian aktif
```bash
curl -s "http://localhost:3030/api/globals/footer-settings?depth=0" \
  | python -c "import sys,json;print(json.load(sys.stdin).get('template'))"
```

### Langkah 2: Hapus dari config CMS
- `apps/cms/src/globals/FooterSettings.ts` — hapus field yang Anda tambah khusus untuk template
  ini. Opsi `template` digerakkan registry (tak ada yang dihapus di situ).

### Langkah 3: Hapus dari registry
- `packages/shared/src/template-registry.ts` — hapus entri `FOOTER_TEMPLATES`.
- `apps/web/src/components/navigation/FooterRenderer.astro` — hapus import + entri `TEMPLATES`.

### Langkah 4: Hapus file komponen
- Hapus `apps/web/src/components/navigation/templates/FooterTemplate<N>.astro`.

### Langkah 5: Bersih-bersih
- Hapus `apps/cms/public/admin-thumbs/footer-<N>.svg`.
- Hapus `SlotKey` khusus footer yang Anda tambah untuknya.
- `cd apps/cms && pnpm generate:types`, lalu build kedua app.

---

## Cara Memodifikasi Template Footer yang Ada

### Mengubah layout/struktur
- Edit file komponen (mis. `FooterTemplate1.astro`). Berlaku ke semua site yang memakainya.
- Tes: jalankan dev `apps/web`, pilih template footer tsb di CMS, reload, cek desktop + viewport
  sempit (kolom harus menumpuk, tidak overflow).

### Menambah opsi konfigurasi baru (mis. jumlah kolom / background)
Contoh: menambah toggle background `dark` ke footer-2.
1. **Field Payload** — `apps/cms/src/globals/FooterSettings.ts`:
```ts
{ name: 'darkVariant', type: 'checkbox', defaultValue: false, admin: { condition: supports('logo') } }
```
2. **Tipe** — `cd apps/cms && pnpm generate:types`.
3. **ctx** — di `FooterRenderer.astro`: `darkVariant: footerCfg?.darkVariant === true`.
4. **Komponen** — di `FooterTemplate2.astro`:
```astro
const { /* ... */, darkVariant = false } = Astro.props as any
<footer class:list={['', darkVariant ? 'bg-midnight' : 'bg-ocean', 'text-white/85']}>
```

### Mengubah slot yang didukung template
1. Perbarui array `slots` untuk entri itu di `packages/shared/src/template-registry.ts`.
2. Tambah/hapus field kondisional yang sesuai di `FooterSettings.ts` (lihat tabel slot→field).
3. Perbarui komponen + tambah prop baru ke `ctx` di `FooterRenderer.astro`.
4. `pnpm generate:types` + restart CMS.

---

## Troubleshooting

**Template tidak muncul di dropdown CMS**
- Entri hilang dari `FOOTER_TEMPLATES`, atau `kind` bukan `'footer'`. Opsi berasal dari
  `toSelectOptions('footer')`. Regenerate tipe + restart CMS.

**Template dipilih tapi frontend menampilkan template salah/lama**
- `templateId` tak cocok dengan key map `TEMPLATES` di `FooterRenderer.astro` → fallback ke `footer-1`.
- Frontend statis — rebuild `apps/web` / reload dev setelah mengubah pilihan CMS.

**Field konten (slot) tidak muncul setelah memilih template**
- Slot tak ada di array `slots` template → `admin.condition` (`supports(...)`) menyembunyikan field.
- Untuk `columns`/services/contact, ingat mereka di dalam field `collapsible` — buka dulu.

**Build gagal setelah menambah/menghapus template**
- `FooterRenderer.astro` mengimpor komponen yang dihapus atau map `TEMPLATES` mengacu import yang
  hilang. Jaga registry + import + map tetap sinkron.
- Union `FooterSetting.template` tak lagi memuat nilai tersimpan → save ulang global.

**Import gagal karena template tidak ditemukan**
- `validateExport(data, 'footer')` mengembalikan `template not found` saat `templateId` JSON tak ada
  di registry (atau `kind` ≠ `footer`). Tambah template atau perbaiki JSON.

**Picker / panel import-export tidak render** (`getFromImportMap: PayloadComponent not found`)
- Jalankan `cd apps/cms && pnpm generate:importmap`, restart CMS.

**Template aktif terhapus — footer "rusak"**
- Renderer fallback ke `footer-1`, jadi halaman tetap render. Kalau union tipe error saat build:
  daftarkan lagi template ke registry ATAU set `footer-settings.template` ke id valid (admin atau
  `pnpm tsx src/scripts/seed-header-footer-templates.ts`), lalu `pnpm generate:types`.

**Layout footer tidak menumpuk / overflow di mobile**
- Pastikan grid pakai `grid-cols-1 md:grid-cols-2 ...` (mobile-first). Beda dengan header, footer
  tak punya toggle/overlay — responsivitas murni dari grid stacking.

**Kolom services kosong**
- `servicesItems` cascade: `footerCfg.servicesMenu` → `getResolvedServiceTypes()` → `modules`.
  Kalau kosong, cek ServiceTypes ada/aktif atau set `servicesMenu`.

---

## Keterbatasan yang Diketahui (ditemukan saat inspeksi)

1. **Satu footer per site.** `footer-settings` adalah **global** Payload (satu record) → footer
   bersifat site-wide.
2. **Dua komponen ikon social terpisah.** Footer memakai `_FooterSocial.astro` (gaya gelap,
   me-render **Instagram/Facebook/YouTube saja — tanpa TikTok**), sedangkan header memakai
   `_SocialIcons.astro` (empat brand, class bisa dikonfigurasi). Template footer yang butuh TikTok
   harus memakai `_SocialIcons` dengan class gelap, bukan `_FooterSocial`.
   *(Inkonsistensi antara sistem header dan footer.)*
3. **`newsletterToggle` masih reserved.** `showNewsletter` ada dan dikirim sebagai `showNewsletter`,
   tapi tak ada template footer yang me-render form newsletter (Phase 4).
4. **Slot `email` tak punya field CMS khusus.** Email dibaca dari `SiteSettings.contact.email`
   via kolom Contact; tak ada field email tingkat footer.
5. **Menghapus template aktif bisa menggagalkan type-check** (union `FooterSetting.template`)
   sampai global di-save ulang, walau runtime fallback ke `footer-1`.
6. **Injeksi `additionalScripts`** dilakukan oleh `FooterRenderer.astro` (raw `set:html`), bukan
   oleh template — dipercaya karena `SiteSettings` admin-only, tapi template tak bisa mengontrolnya.
7. **Import/Export berupa UI field in-page**, bukan admin view/route tersendiri.
8. **Import CMS↔shared memakai path relatif dalam** dan bergantung pada Next
   `experimental.externalDir: true` (`apps/cms/next.config.mjs`) — sama seperti sistem header.
