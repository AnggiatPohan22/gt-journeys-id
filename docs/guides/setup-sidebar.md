# Panduan Setup Sidebar Admin (CMS)

> Panduan praktis untuk **menambah, menghapus, atau mengubah** menu, layout,
> dan warna sidebar admin Payload (`/admin`). Ditulis supaya kamu (atau agent
> AI) tahu **file/direktori mana** yang harus diubah + **langkah terperinci**
> untuk tiap jenis perubahan.
>
> Konteks implementasi: Phase 4.1–4.5 (lihat `docs/phases/phase-4.1…4.5`).
> Semua perubahan sidebar bersifat **UI/UX** — jangan mengubah business logic.

---

## 0. Peta file (siapa mengurus apa)

Semua file admin ada di **`apps/cms/src/admin/`** (kecuali collections/globals).

| File | Tanggung jawab |
|------|----------------|
| `apps/cms/src/payload.config.ts` → `admin.components` | **Registrasi** komponen sidebar (slot `beforeNavLinks`, `afterNavLinks`, `graphics`, `providers`). Titik masuk semua kustomisasi. |
| `apps/cms/src/admin/admin-global.css` | **SEMUA styling sidebar**: warna (CSS variables), item menu, ikon per item, active/hover, chevron accordion, scrollbar, footer, logo, login. |
| `apps/cms/src/admin/AdminStyles.tsx` | Provider yang meng-`import './admin-global.css'` → memuat CSS ke **semua** route admin. Jarang diubah. |
| `apps/cms/src/admin/Giattech.tsx` | **Logo developer giattech** di atas sidebar (slot `beforeNavLinks`). |
| `apps/cms/src/admin/NavDashboardLink.tsx` | Item **"Dashboard"** di atas grup menu (slot `beforeNavLinks`). |
| `apps/cms/src/admin/NavAccordion.tsx` | Perilaku **accordion** grup (default-collapse + single-open). Client. |
| `apps/cms/src/admin/SidebarFooter.tsx` | **Footer sidebar**: kartu profil user + tombol logout + toggle tema. Client. |
| `apps/cms/src/admin/graphics/Logo.tsx` · `Icon.tsx` | **Brand logo/icon** GtJourneysID (halaman login + header app). |
| `apps/cms/public/logo-giattech/` | **Aset gambar** logo giattech (`white-…png`, `navy-…png`). |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Peta import komponen (auto-generate). **Regenerate** setiap tambah/hapus komponen di config. |
| `apps/cms/src/collections/*.ts` · `globals/*.ts` | **Sumber item & grup menu** (`admin.group`, `admin.hidden`). Menu TIDAK di-hardcode di sidebar. |

**Registrasi saat ini** (`payload.config.ts` → `admin.components`):

```ts
components: {
  beforeDashboard: ['/admin/DashboardStats#default'],
  beforeLogin:     ['/admin/BeforeLogin#default'],
  providers:       ['/admin/AdminStyles#default'],      // memuat admin-global.css
  graphics:        { Logo: '/admin/graphics/Logo#default', Icon: '/admin/graphics/Icon#default' },
  beforeNavLinks:  ['/admin/Giattech#default', '/admin/NavDashboardLink#default'], // ATAS menu
  afterNavLinks:   ['/admin/SidebarFooter#default', '/admin/NavAccordion#default'], // BAWAH menu
},
```

Urutan render di dalam sidebar (atas → bawah):
`Giattech (logo)` → `NavDashboardLink (Dashboard)` → **grup menu Payload** → `SidebarFooter (profil+logout+toggle)`.

---

## 1. Prinsip penting (baca dulu)

1. **Item menu berasal dari collections/globals, BUKAN dari file sidebar.**
   Payload otomatis menampilkan tiap collection & global (menghormati akses &
   `admin.hidden`). Untuk menambah/menghapus/rename/reorder item → ubah
   collection/global, **bukan** file di `admin/`.
2. **Styling & warna 100% di `admin-global.css`** via CSS variables. Jangan
   hardcode warna di komponen.
3. **Kapan harus restart / regenerate** (penting):
   - Ubah **CSS** (`admin-global.css`) atau isi komponen → cukup **reload** `/admin` (HMR).
   - **Tambah/hapus** komponen di `admin.components` (config) → jalankan
     **`pnpm --filter @gt-journeys/cms generate:importmap`** lalu **restart** dev
     server (`next dev -p 3030`). importMap di-bundle sekali; HMR tak rebundle.
   - **JANGAN** `rm importMap.js` saat server jalan (bikin error transient).
4. **Jangan pernah** menghapus/menyembunyikan item navigasi supaya "rapi" tanpa
   diminta — semua link harus tetap berfungsi.

---

## 2. MENU — tambah / hapus / rename / reorder item

**File:** `apps/cms/src/collections/<Nama>.ts` atau `apps/cms/src/globals/<Nama>.ts`
**Restart:** tidak (perubahan schema di-HMR; kalau nambah collection baru mungkin perlu restart).

Menu dikelompokkan lewat properti `admin.group`. Grup yang ada sekarang:
`Content`, `Services`, `Site Builder`, `Administration`, `Settings`.

### 2a. Menambah item menu baru
Buat collection/global baru seperti biasa, lalu set grupnya:
```ts
export const Promo: CollectionConfig = {
  slug: 'promos',
  admin: {
    group: 'Content',        // ← masuk grup "Content"
    useAsTitle: 'title',
  },
  fields: [ /* … */ ],
}
```
Daftarkan di `payload.config.ts` (`collections: [ …, Promos ]`). Item otomatis
muncul di sidebar. **Tambahkan ikonnya** → lihat §4.

### 2b. Menghapus / menyembunyikan item
- Sembunyikan dari sidebar tanpa hapus data:
  ```ts
  admin: { hidden: true }                    // sembunyi untuk semua
  admin: { hidden: ({ user }) => user?.role !== 'super-admin' } // sembunyi kondisional
  ```
- Hapus permanen: hapus collection dari `collections: [...]` (hati-hati: data).

### 2c. Rename label item
Ubah `labels`/`slug` collection (atau pakai i18n). Contoh:
```ts
labels: { singular: 'Artikel', plural: 'Artikel' }
```

### 2d. Mengubah urutan / grup
- Pindah grup: ganti nilai `admin.group`.
- Urutan grup & item mengikuti urutan array `collections`/`globals` di
  `payload.config.ts` dalam tiap grup. Reorder array untuk mengatur urutan.

### 2e. Item "Dashboard" (custom, bukan collection)
Item Dashboard ditambah manual (Payload default tak punya).
**File:** `apps/cms/src/admin/NavDashboardLink.tsx` (label, href, active state).
Ikon home-nya diatur di `admin-global.css` (`--i` untuk `href$='/admin'`).

---

## 3. GRUP menu — tambah / ubah / hilangkan

**File:** `admin.group` di collection/global terkait.

- **Grup baru**: cukup pakai nama baru, mis. `admin: { group: 'Marketing' }`.
  Otomatis jadi accordion baru. Style label grup ikut `.nav-group__toggle` di
  `admin-global.css`.
- **Rename grup**: ganti string `group` di semua collection anggota grup itu.
- **Hilangkan grup**: hapus `group` (item jadi ungrouped, tampil di atas).

> Perilaku buka/tutup grup (accordion) dikelola `NavAccordion.tsx` (§7).

---

## 4. IKON item menu

**File:** `apps/cms/src/admin/admin-global.css`
**Restart:** tidak (reload saja).

Ikon dirender via CSS `.nav__link::before` (mask-image, ikut `currentColor`).
Tiap item memetakan variabel `--i` ke salah satu ikon `--dnj-ic-*`.

### 4a. Mengubah ikon item yang sudah ada
Cari baris map href → ikon, ganti nilainya:
```css
.nav__link[href$='/collections/pages'] { --i: var(--dnj-ic-doc); }   /* ganti doc → grid, dst */
```

### 4b. Menambah ikon untuk item baru
Tambahkan baris map (end-anchored biar presisi):
```css
.nav__link[href$='/collections/promos'] { --i: var(--dnj-ic-star); }
```
Kalau tak dipetakan, item pakai `--dnj-ic-default` (titik).

### 4c. Membuat ikon BARU
Tambah variabel data-URI SVG di blok `:root` (`admin-global.css`). Pakai
`stroke='%23000' fill='none'` (warna diabaikan, mask pakai alpha):
```css
:root {
  --dnj-ic-rocket: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>");
}
```
Ikon yang tersedia sekarang: `default, home, doc, pin, tag, grid, star, layers,
menu, image, users, gear, layout`.

---

## 5. WARNA & TEMA

**File:** `apps/cms/src/admin/admin-global.css` (blok `:root` = light, `html[data-theme='dark']` = dark)
**Restart:** tidak (reload saja). Payload punya toggle tema native (Account →
Theme) + toggle di footer sidebar.

### 5a. Model warna (WAJIB paham)
Payload menurunkan semua surface/teks dari **satu ramp** `--color-base-0…1000`:
- light: `--theme-elevation-N = --color-base-N` (0 = paling terang)
- dark : `--theme-elevation-0 = --color-base-900`, dst (ujung gelap = surface dark)

Jadi **mengubah ramp = re-theme dua mode sekaligus**, kontras tetap terjaga.

### 5b. Ubah warna dasar sidebar (light & dark)
Edit ramp di `:root`:
```css
:root {
  --color-base-0:   rgb(250,250,251);  /* light bg   */
  --color-base-900: rgb(17,17,20);     /* dark bg (near-black) */
  --color-base-1000: rgb(4,4,6);       /* dark paling gelap    */
  /* … 0..1000 … */
}
```
- Mau dark **lebih/kurang hitam** → geser `--color-base-850/900/950/1000`.
- Sidebar dark punya efek **glossy**: gradient di rule
  `html[data-theme='dark'] .nav { background: linear-gradient(...) }`.

### 5c. Warna aksen item aktif & hover (token brand)
```css
:root {                        /* LIGHT */
  --dnj-accent:    #1b3a4b;              /* teks/ikon/bar item aktif */
  --dnj-active-bg: rgba(27,58,75,0.08);  /* tint background aktif    */
  --dnj-hover-bg:  rgba(0,0,0,0.05);     /* background hover         */
}
html[data-theme='dark'] {      /* DARK */
  --dnj-accent:    #8bd6b6;              /* mint (kontras di hitam)  */
  --dnj-active-bg: rgba(139,214,182,0.12);
  --dnj-hover-bg:  rgba(255,255,255,0.05);
}
```
Ubah nilai-nilai ini untuk mengganti "warna tema" sidebar. Aksen dipakai juga
untuk **ikon** item aktif (karena `::before` pakai `currentColor`).

### 5d. Warna brand lain
`--dnj-ocean #1B3A4B · --dnj-coral #E07A5F · --dnj-leaf #6B9080 · --dnj-stone
#3D405B`. `--dnj-active-grad` = gradient untuk **avatar** & **tombol login**
(bukan nav). `--dnj-coral` = hover logout.

> Referensi lengkap tabel warna: `docs/phases/phase-4-polish-launch/admin-ui/sidebar-cms/phase-4.5-sidebar-redesign.md`
> bagian "Polish Pass".

---

## 6. LAYOUT & interaksi

Semua di `apps/cms/src/admin/admin-global.css` kecuali disebut lain.

| Elemen | Selector / file | Catatan |
|--------|-----------------|---------|
| Padding/radius item | `.nav__link` | radius 8px, padding 8×12px, margin 2px |
| Bar aktif kiri | `.nav__link.active::after` | 3×18px, warna `--dnj-accent` |
| Label grup | `.nav-group__toggle` | 11px uppercase bold |
| Chevron | `.nav-group--collapsed .nav-group__toggle svg` | rotate 180°, 250ms |
| Scrollbar | `.nav__scroll::-webkit-scrollbar` + `scrollbar-color` | lebar 4px, muncul saat hover |
| Footer pinned | `.dnj-footer` | `position:sticky; bottom:0; margin-top:auto` → selalu terlihat |
| Header logo row | `.dnj-navhead` + `.dnj-giattech__img` | logo kiri (tinggi 30px) |
| Tombol close native | `@media (min-width:769px) .nav__header-content` | digeser ke kanan |
| Transisi tema | rule `transition` di `.nav, .dnj-footer, …` | 200ms |

Struktur 3-seksi (header / menu scroll / footer fixed) dibahas di
`docs/phases/phase-4-polish-launch/admin-ui/sidebar-cms/phase-4.5-sidebar-redesign.md`.

---

## 7. ACCORDION (buka/tutup grup)

**File:** `apps/cms/src/admin/NavAccordion.tsx` (client, slot `afterNavLinks`)
**Restart:** ya jika baru mendaftarkan; kalau hanya edit isi → reload.

Perilaku sekarang:
- **First load**: hanya grup yang memuat halaman aktif yang terbuka.
- **Single-open**: membuka satu grup menutup grup lain.

Untuk mengubah (mis. izinkan banyak grup terbuka), edit logika di file ini
(hapus bagian "Single-open"). Animasi tinggi grup = bawaan Payload (Collapsible).

---

## 8. FOOTER (profil, logout, toggle tema)

**File:** `apps/cms/src/admin/SidebarFooter.tsx` (client) + style `.dnj-user*`,
`.dnj-theme-toggle*`, `.dnj-footer` di `admin-global.css`.

- **Profil**: avatar (inisial), nama, baris kedua = **role** (`ROLE_LABEL`).
  Ganti `secondary` untuk menampilkan email/lainnya.
- **Logout**: tombol ikon kanan = **link ke route logout bawaan** Payload
  `<a href="/admin/logout">` → clear sesi + redirect ke login. (JANGAN pakai
  `useAuth().logOut()` saja — ia tidak redirect, jadi terlihat "tidak jalan".)
- **Toggle tema**: `useTheme()` resmi. Untuk menghapus toggle → hapus blok
  `<button className="dnj-theme-toggle">` di file ini.
- Foto profil asli: tambah field `avatar` (upload) di `collections/Users.ts`,
  lalu render `<img>` di UserCard menggantikan inisial.

---

## 9. LOGO

### 9a. Logo developer giattech (di sidebar)
**Aset:** `apps/cms/public/logo-giattech/` — `white-logo-giattech.png` (dark),
`navy-logo-giattech.png` (light). Disajikan Next di root `/logo-giattech/…`.
**Komponen:** `apps/cms/src/admin/Giattech.tsx` (ganti `src` / ukuran).
CSS swap per tema: `.dnj-giattech__img--dark/--light` di `admin-global.css`.

### 9b. Brand logo GtJourneysID (halaman login + header)
**File:** `apps/cms/src/admin/graphics/Logo.tsx` (login, besar) &
`graphics/Icon.tsx` (header, kecil). Terdaftar di `admin.components.graphics`.

---

## 10. Checklist saat menambah **komponen sidebar baru**

Kalau bikin komponen baru (mis. banner promo di atas menu):
1. Buat file di `apps/cms/src/admin/NamaKomponen.tsx` (server/client sesuai
   kebutuhan; client kalau pakai hook Payload seperti `useAuth`/`useNav`).
2. Daftarkan di `payload.config.ts` → slot yang tepat:
   - `beforeNavLinks` = atas menu · `afterNavLinks` = bawah menu.
3. **`pnpm --filter @gt-journeys/cms generate:importmap`**.
4. **Restart** dev server.
5. Tambah styling di `admin-global.css` (scope dengan prefix `.dnj-`).

---

## 11. Aturan keselamatan (untuk kamu & agent AI)

- UI/UX only — **jangan** ubah data, endpoint, atau logika.
- **Jangan** rename/hapus/sembunyikan item menu tanpa diminta; semua link harus
  tetap jalan.
- Semua warna lewat **CSS variables**, jangan hardcode di komponen.
- Scope CSS kustom dengan prefix `.dnj-` atau target class Payload spesifik saja
  (`.nav__link`, `.nav-group__toggle`, dll) — jangan menyentuh form/list/editor.
- Setelah perubahan: **typecheck** (`npx tsc --noEmit` di `apps/cms`) dan reload
  `/admin` (atau restart bila ubah config components).

---

## 12. Panduan rinci (topik yang sering diminta)

### 12.1 Menyusun URUTAN menu (siapa di atas / bawah)

Urutan sidebar = **Dashboard** (paling atas) → grup **Content, Services, Site
Builder, Administration, Settings**.

**a) Item "Dashboard"** — custom, dirender lewat `beforeNavLinks`, jadi SELALU
di atas semua grup. Urutannya diatur di array `beforeNavLinks`
(`payload.config.ts`): `['/admin/Giattech#default', '/admin/NavDashboardLink#default']`
→ Giattech (logo) dulu, lalu Dashboard. Tukar urutan array untuk menukar posisinya.

**b) Urutan GRUP** ditentukan Payload dari **urutan kemunculan pertama** tiap
nama grup saat menelusuri array `collections` **lalu** `globals`
(`payload.config.ts`). Aturannya:
- Grup muncul sesuai collection PERTAMA yang memakai `admin.group` itu.
- Grup yang hanya berisi **globals** muncul **setelah** semua grup dari collections.

Contoh (urutan `collections` sekarang):
```ts
collections: [
  Pages, ServiceTypes, Destinations, …,   // Pages ber-group 'Content'  → grup Content muncul ke-1
  Tours, Accommodations, …,               // Tours 'Services'           → grup Services ke-2
  Menus, Media,                           // 'Site Builder'             → ke-3
  Users,                                  // 'Administration'           → ke-4
]
// globals ber-group 'Settings' → grup Settings terakhir
```

**Untuk memindah grup ke atas/bawah:** pindahkan collection anggotanya di array
`collections`. Mis. supaya **Settings di atas Services**, pindahkan sebuah
collection ber-`group: 'Settings'` ke posisi sebelum `Tours` (atau ubah salah
satu collection Settings agar tampil lebih dulu). Grup yang murni globals selalu
di bawah — untuk menaikkannya, beri satu collection ber-`group: 'Settings'`.

**Urutan ITEM di dalam grup** = urutan collection/global tsb di array
(collections dulu, baru globals). Reorder array = reorder item.

> Tidak ada file "menu list" untuk diedit — semua dari `collections`/`globals`.
> Restart hanya jika menambah collection/global baru.

---

### 12.2 Mengubah tampilan item "Dashboard" (font, warna, posisi ikon)

**Teks & href:** `apps/cms/src/admin/NavDashboardLink.tsx` (mis. label `DASHBOARD`).
**Tampilan di `admin-global.css`** pada selector `.dnj-dashlink`.

**Kondisi sekarang:** font Dashboard sengaja **disamakan dengan LABEL GRUP**
(Content/Services/…/Setting) supaya selaras — 11px, weight 700, uppercase,
letter-spacing 0.08em, warna `--theme-elevation-450`, dan warna **tidak berubah
saat aktif** (indikator halaman aktif cukup dari pill + bar aksen):
```css
.dnj-dashlink {
  font-size: 11px; line-height: 30px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--theme-elevation-450);
}
.dnj-dashlink .nav__link-label { font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; }
.dnj-dashlink.active, .dnj-dashlink.active .nav__link-label { color: var(--theme-elevation-450); font-weight: 700; }
.dnj-dashlink::before { width: 15px; height: 15px; }   /* ukuran ikon */
```

- **Mau Dashboard seperti item biasa (bukan label grup)?** ganti blok di atas
  jadi `font-size: 17.5px; font-weight: 400; text-transform: none; letter-spacing: 0;`
  dan hapus override warna `.active` (biar pakai `--dnj-accent`).
- **Warna:** ubah `color` di `.dnj-dashlink` (teks + ikon ikut, ikon `::before`
  pakai `currentColor`).
- **Ganti ikon:** `.dnj-dashlink { --i: var(--dnj-ic-grid); }` (default `--dnj-ic-home`; daftar §4).
- **Ikon sesudah teks:** `.dnj-dashlink::before { order: 2; margin-inline: 8px 0 0; }`
  `.dnj-dashlink .nav__link-label { order: 1; margin-inline-end: auto; }`.

---

### 12.3 Posisi LOGO + tombol collapse (hide) sidebar

**Struktur (fakta project):** tombol collapse yang dipakai = **NATIVE app-level
Payload** `.template-default__nav-toggler` — sticky di pojok atas, **di LUAR**
`.nav`. Ini satu-satunya tombol yang tetap hidup saat sidebar collapse (grid
`.template-default` jadi `0 auto` → sidebar lebar 0). Logo (`.dnj-navhead`) ada
di dalam sidebar. Keduanya beda container → **jangan** dipaksa satu flex row;
cukup ditaruh di sisi berlawanan (tombol KIRI, logo KANAN) agar tak bertumpuk.

**Implementasi aktif** (di `admin-global.css`):
```css
.nav__header { display: none !important; }        /* hamburger DALAM-sidebar bawaan: off */
.nav { --nav-padding-block-start: 0px; }          /* logo/menu mulai dari atas */

/* LOGO — di KANAN, sisi kiri dikosongkan untuk tombol native (anti-tumpuk) */
.dnj-navhead {
  display: flex; align-items: center; justify-content: flex-end;
  min-height: var(--app-header-height);
  padding: 0 16px 0 64px;      /* left 64px = zona bebas tombol native */
  margin-bottom: 16px;          /* GAP ke menu di bawah */
  border-bottom: 1px solid var(--theme-elevation-100);
}
.dnj-giattech__img { height: 30px; }   /* UKURAN LOGO */

/* TOMBOL NATIVE — dipaksa ke KIRI + di-styling */
.template-default__nav-toggler-wrapper { left: 0 !important; right: auto !important; }
.template-default__nav-toggler-container { padding-inline-start: 16px; }  /* jarak dari tepi kiri */
.template-default__nav-toggler {
  padding: 6px; border-radius: 8px;
  border: 1px solid var(--theme-elevation-200);
  background: var(--theme-elevation-50); color: var(--theme-elevation-800);
}
.template-default__nav-toggler:hover { background: var(--dnj-hover-bg); color: var(--dnj-accent); }
.template-default__nav-toggler .hamburger,
.template-default__nav-toggler .hamburger svg { width: 22px; height: 22px; }  /* IKON besar/proporsional */
.template-default__nav-toggler .hamburger svg * { stroke-width: 2; }          /* garis lebih jelas */
```

**Cara mengatur:**
- **Ukuran logo:** `.dnj-giattech__img { height: 30px; }` (naik/turunkan angka).
- **Geser logo lebih ke kanan / kiri:** `.dnj-navhead { justify-content: flex-end | center | flex-start }`
  dan atur `padding` (kiri = zona tombol; besarkan bila logo masih menyentuh tombol).
- **Naik/turun logo:** `.nav { --nav-padding-block-start: 0px }` (besarkan = turun).
- **Ukuran ikon tombol:** `.template-default__nav-toggler .hamburger svg { width; height }`.
- **Warna tombol/ikon:** `.template-default__nav-toggler { color; background; border-color }`.
- **Frame tombol:** `.template-default__nav-toggler { padding; border-radius; border }`
  (padding kecil → ikon makin dominan).
- **Sisi tombol (kiri/kanan):** `.template-default__nav-toggler-wrapper { left/right }`.
- **Gap header → menu:** `.dnj-navhead { margin-bottom }`.

> **Mau 1 tombol PERMANEN tanpa native?** Perlu mode **rail** (collapse jadi
> sidebar sempit ikon-only, bukan lebar 0), lalu tombol custom bisa tetap
> terlihat. Fitur lebih besar — belum dibuat.

---

### 12.4 Posisi FOOTER (profil + logout + toggle) — naik / turun

Footer = `.dnj-footer` di `admin-global.css` (isi komponen
`SidebarFooter.tsx`). Di-pin di bawah (`position: sticky; bottom: 0`).

- **Turunkan / rapatkan ke tepi bawah:** `bottom: 0` (default).
- **Naikkan (beri jarak dari tepi bawah):**
  ```css
  .dnj-footer { bottom: 16px; }         /* mengambang 16px dari bawah */
  ```
- **Atur tinggi/padding footer:**
  ```css
  .dnj-footer { padding-top: 12px; padding-bottom: calc(var(--base,20px) * 2); }
  ```
  > `padding-bottom` + `margin-bottom` negatif mengisi padding bawah
  > `.nav__scroll`. Kalau mengubah `bottom`, sesuaikan `scroll-padding-block-end`
  > di `.nav__scroll` (§12.5) agar item terakhir tetap tidak ketutup.
- **Jarak antar bagian (profil ↔ toggle):** `.dnj-theme-toggle { margin-top: 8px; }`.
- **Urutan isi footer** (profil dulu atau toggle dulu): ubah urutan elemen di
  `SidebarFooter.tsx`.
- **Garis pemisah dari menu:** `.dnj-footer { border-top: 1px solid var(--theme-elevation-100); }`.

---

### 12.5 Scroll menu (header & footer FIXED, hanya menu yang scroll)

**File:** `admin-global.css`, selector `.nav__scroll` (kontainer scroll menu
bawaan Payload).

**Struktur 3-zona: header FIXED · menu SCROLL · footer FIXED.**
Header (`.dnj-navhead`) & footer (`.dnj-footer`) DIKELUARKAN dari alur scroll
dengan `position: absolute` relatif ke `.nav` (sticky = containing block). Lalu
`.nav__scroll` diberi padding atas/bawah = tinggi header/footer, sehingga
**hanya menu** (Dashboard + grup) yang men-scroll di `.nav__scroll` —
grup panjang (mis. SERVICES/SETTINGS) bisa di-scroll penuh.
```css
.dnj-navhead { position: absolute; top: 0; left: 0; right: 0; z-index: 3; background: var(--theme-elevation-0); }
html[data-theme='dark'] .dnj-navhead { background: rgb(28,28,32); }
.dnj-footer  { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; background: var(--theme-elevation-0); }
.nav {
  --nav-padding-block-start: calc(var(--app-header-height) + 12px); /* = tinggi header */
  --nav-padding-block-end: 150px;                                   /* = tinggi footer */
}
```
**Penting:**
- `background` header/footer **wajib opaque** (menutup menu yang lewat + menutup
  ujung scrollbar → scrollbar tampil hanya di area menu).
- Kalau tinggi footer berubah (mis. tambah baris), sesuaikan
  `--nav-padding-block-end` agar item menu terakhir tidak ketutup.
- `.nav` harus tetap `position: sticky`/positioned (bawaan Payload) agar jadi
  containing block header/footer.


Penyebab dulu: scrollbar di-set transparan (muncul hanya saat hover) → terkesan
"tak ada scroll", dan item terakhir bisa ketutup footer sticky. **Sudah
diperbaiki** jadi:
```css
.nav__scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--theme-elevation-300) transparent; /* SELALU terlihat */
  scroll-padding-block-end: 170px;   /* ruang biar item terakhir tak ketutup footer */
  overscroll-behavior: contain;
}
.nav__scroll::-webkit-scrollbar { width: 8px; }            /* lebar scrollbar */
.nav__scroll::-webkit-scrollbar-thumb {
  background: var(--theme-elevation-300);                   /* warna thumb */
  border-radius: 8px; border: 2px solid transparent; background-clip: padding-box;
}
.nav__scroll::-webkit-scrollbar-thumb:hover { background: var(--theme-elevation-400); }
```

**Cara tuning:**
- **Scrollbar lebih tebal/tipis:** ubah `::-webkit-scrollbar { width }` (Chrome)
  + `scrollbar-width: thin | auto` (Firefox).
- **Warna scrollbar:** `--theme-elevation-300` (thumb) → naik/turunkan angka
  elevation untuk lebih terang/gelap.
- **Item terakhir masih ketutup footer?** perbesar `scroll-padding-block-end`
  (≥ tinggi footer). Kalau `bottom` footer diubah (§12.4), samakan nilai ini.
- **Sembunyikan scrollbar lagi (muncul saat hover saja):** set
  `scrollbar-color: transparent transparent` dan pindahkan warna thumb ke
  `.nav__scroll:hover`.

> Grup panjang (mis. **Settings**) yang melebihi tinggi layar kini bisa
> di-scroll dan semua item terjangkau. Menu overflow → scrollbar tampil; menu
> pendek → tidak ada scrollbar.

---

## 13. Tabel rujukan cepat (tugas → file → butuh restart?)

| Tugas | File utama | Restart? |
|-------|-----------|:--------:|
| Tambah/hapus/rename item menu | `collections/*.ts`, `globals/*.ts` | reload (restart bila collection baru) |
| Pindah/rename/tambah grup | `admin.group` di collection/global | reload |
| Ganti/tambah ikon item | `admin-global.css` (`--i`, `--dnj-ic-*`) | reload |
| Warna sidebar (light/dark) | `admin-global.css` (`--color-base-*`, `--dnj-*`) | reload |
| Item "Dashboard" | `admin/NavDashboardLink.tsx` | reload |
| Accordion (perilaku) | `admin/NavAccordion.tsx` | reload |
| Footer profil/logout/toggle | `admin/SidebarFooter.tsx` + CSS | reload |
| Logo giattech | `public/logo-giattech/` + `admin/Giattech.tsx` | reload |
| Brand logo login/header | `admin/graphics/Logo.tsx`, `Icon.tsx` | reload |
| Layout/spacing/scrollbar | `admin-global.css` | reload |
| **Tambah/hapus komponen di config** | `payload.config.ts` + `generate:importmap` | **restart** |
