## Phase: 4.61.5 — Ferry Ticket card compact di mobile & tablet (foto hanya desktop)
**Tanggal**: 2026-09-27
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Memperbaiki tampilan kartu Ferry Tickets (desain `ticket` / `TicketRouteCard`) di
**mobile & tablet**: foto besar dihilangkan agar kartu tetap **compact** (tidak
memanjang ke bawah), identitas ferry cukup diwakili **logo operator** di header
kartu. Baris rute dibuat 3 kolom (Origin → Ferry → Arrival) di semua ukuran.
**Desktop (lg+) tidak berubah** — foto tetap tampil sebagai thumbnail di sisi kiri rute.

### Keputusan owner
- Mobile & tablet: sembunyikan foto, tampilkan logo ferry saja → informatif tapi ringkas.
- Desain compact ini berlaku untuk **mobile DAN tablet** (foto muncul lagi hanya di desktop).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/cards/TicketRouteCard.astro` | Foto rute: `w-full md:w-32 lg:w-40 … md:aspect-square` → `hidden lg:flex lg:w-40 aspect-square` (foto hanya desktop lg+). Container rute: `md:flex-row md:items-center` → `lg:flex-row lg:items-center`. Grid rute: `grid-cols-1 md:grid-cols-3` → `grid-cols-3` (3 kolom di semua ukuran) + gap `gap-2 sm:gap-4`. Font Origin/Arrival & jam dibuat responsif (lebih kecil di mobile), kolom `To` diberi `text-right`. |

### Revisi mobile (2026-09-27) — alignment & font
Owner UAT: di mobile kolom terasa tidak sejajar & nama terpotong (nimpa, beda tinggi
antar kolom). Perbaikan pada file yang sama:
- Grid rute: `items-center` → **`items-start lg:items-center`** — baris atas tiap kolom
  (nama · terminal · jam) kini sejajar antar kolom di mobile/tablet; center kembali
  hanya di desktop (agar rute center thd foto).
- Nama Origin/Arrival & terminal: `truncate` → **`line-clamp-2` + `leading-tight/snug`**
  — nama panjang wrap max 2 baris (tidak lagi terpotong "…"), mengikuti referensi mobile.
- Ukuran font mobile diturunkan supaya 3 kolom muat rapi: nama `text-[13px]`, terminal
  `text-[11px]`, jam `text-base` (turun dari `text-lg`), tanggal `text-[10px]`; ikon
  tengah `w-5 h-5 sm:w-6 sm:h-6`. Ukuran `sm/md/lg` (tablet/desktop) tidak berubah.

### Revisi header kartu (2026-09-27) — logo frame + nama + price sejajar
Owner UAT lanjutan: di mobile, blok price/diskon **turun ke bawah & tidak sejajar**
karena nama operator (`text-lg`) masih besar + baris atas `flex-wrap`. Perbaikan header
(`TicketRouteCard.astro`):
- **Badges** dipindah ke **baris full-width sendiri** di atas (sebelumnya nested di kolom
  kiri bareng operator) → mengikuti referensi mobile (gambar 3).
- Baris **operator · price** dibuat `flex-nowrap` + operator `min-w-0` + price `shrink-0`
  → price/diskon **tidak pernah wrap ke bawah**, tetap di kanan & sejajar dengan logo
  walau nama panjang.
- **Logo dipaskan ke frame tetap**: `<span>` `h-9 w-14` (mobile) / `sm:h-8 sm:w-auto
  sm:max-w-[120px]` (tablet+), `<img>` `max-h-full max-w-full object-contain` → logo
  ukuran apa pun muat rapi tanpa melar/distorsi (jaga accessibility).
- **Nama operator** kecil di mobile + wrap max 2 baris: `text-sm sm:text-lg leading-tight
  line-clamp-2 min-w-0`.
- **Harga** sedikit dikecilkan di mobile agar muat sebaris: `text-xl sm:text-2xl
  md:text-3xl` (dari `text-2xl md:text-3xl`).
- Verified via production build (mobile/tablet/desktop): nama "Bintan Resort Ferries"
  wrap 2 baris di samping logo, price "Rp 550.000/Per person/Ekonomi" tetap di kanan
  sejajar; tidak ada lagi price yang jatuh ke bawah.

### Revisi ukuran & wave divider (2026-09-27)
Owner UAT lanjutan. Penyesuaian ukuran per-breakpoint + tambah pembatas dekoratif:
- **Logo operator (frame)** dibesarkan: mobile `h-9 w-14` → **`h-11 w-16`**; tablet
  `sm:h-8` → **`sm:h-12` `sm:max-w-[150px]`**; desktop dijaga moderat via **`lg:h-9`**.
  Tetap `object-contain` (logo ukuran apa pun muat, tak melar).
- **Nama operator**: mobile diperkecil `text-sm` → **`text-xs`**; tablet diperbesar
  `sm:text-lg` → **`sm:text-xl`**, desktop dikembalikan **`lg:text-lg`**. Wrap
  `line-clamp-2` → **`line-clamp-3`** supaya nama panjang mengalir ke bawah penuh.
- **Ikon ferry (tengah)** diperbesar: `w-5 h-5 sm:w-6 sm:h-6` → **`w-7 h-7 sm:w-9 sm:h-9`**.
- **Pembatas siluet ombak** (BARU): `border-t` tipis di atas tombol diganti **2 lapis
  SVG wave** (leaf/20 + ocean/20, `preserveAspectRatio="none"`, full-width via
  `-mx-5 md:-mx-6`, `aria-hidden`) sebagai pemisah dekoratif antara info teks (rute)
  dan tombol More info / Book Now. Ringan (inline SVG, tanpa request tambahan).
- Verified production build di mobile/tablet/desktop: ukuran naik sesuai breakpoint,
  wave tampil rapi memisahkan teks & tombol di ketiga ukuran.

### Revisi ukuran lanjutan + wave "air" (2026-09-27)
Owner UAT: perubahan tablet tidak terlihat (lihat catatan **dev duplication** di bawah).
Penyesuaian lanjutan + wave diubah jadi kolam air:
- **Tablet** diperbesar lagi: logo `sm:h-12 max-w-[150px]` → **`sm:h-14 max-w-[180px]`**;
  nama `sm:text-xl` → **`sm:text-2xl`**; ikon ferry `sm:w-9` → **`sm:w-11`** (desktop
  tetap `lg:h-9` / `lg:text-lg`).
- **Nama operator** wrap `line-clamp-3` → **`line-clamp-2`** (2 baris rapi; di tablet+
  muat 1 baris karena font lebih besar & ruang lebih lega).
- **Wave** diubah dari garis pemisah tipis → **kolam air biru muda `#DCEEFB`** yang
  mengisi PENUH dari crest ombak sampai **dasar kartu**, berada **di belakang tombol**
  (container melebar via `-mx/-mb`, padding di-set ulang, tombol `relative` di atas).
  Tombol "More info" diubah `bg-sand` → `bg-white/90` agar kontras di atas air biru.

### ⚠️ Dev duplication (KONFIRMASI 2026-09-27) — kenapa perubahan responsif tak terlihat di `pnpm dev`
Root cause dipastikan: **Tailwind dimuat 2×** di dev — (1) integrasi `@astrojs/tailwind`
di `astro.config.mjs`, dan (2) `@import '../styles/global.css'` (punya `@tailwind base/
components/utilities`) di `BaseLayout.astro`. Di dev, base utility dari bundle ke-2
menimpa varian responsif bundle ke-1 → **semua `sm:`/`md:`/`lg:` diabaikan di dev**
(mis. logo tablet stuck `h-11`, title stuck `text-xs`). Diverifikasi di dev 4321:
title 12px & logo 44px padahal seharusnya 20px & 48px di tablet.
- **Produksi TIDAK terpengaruh** (urutan cascade benar setelah `pnpm build`).
- **Base class (mobile) tetap jalan di dev.**
- **Keputusan owner (2026-09-27): JANGAN ubah `astro.config`.** Konsekuensi: perubahan
  tablet/desktop hanya kelihatan lewat `pnpm build`, bukan `pnpm dev`. Fix 1-baris
  (`tailwind({ applyBaseStyles: false })`) tersedia bila nanti diizinkan.

### Redesign penuh mengikuti referensi + responsif via scoped CSS (2026-09-27)
Owner: "tampilan berantakan, ikutin `ai/reference/cards-ticket/` (mode-mobile/tablet/
dekstop.png), smoke test jangan sampai satu benar satu rusak." **`TicketRouteCard.astro`
ditulis ulang total.**
- **Responsivitas pindah dari util `sm:`/`lg:` Tailwind → `<style>` scoped ber-`@media`.**
  Ini SOLUSI atas dev-duplication: CSS scoped Astro (spesifisitas kelas + tak masuk layer
  utility Tailwind) TIDAK ketimpa bundle Tailwind ganda → **konsisten di `pnpm dev` DAN
  production**. Semua ukuran/spacing/tampil-sembunyi digerakkan class semantik `.tkc*`.
- **Layout mengikuti referensi** per mode:
  - Mobile/Tablet: badges → (logo+nama · harga[amount/per/total/Economy·coret·Save]) →
    rute 3 kolom (From · Ferry+ikon+durasi+booked · To) → **pembatas gaya tiket**
    (garis putus + takik lingkaran di tepi kiri/kanan) → tombol. Tanpa foto.
  - Desktop: sama + **foto 170px** di kiri baris rute.
- **Pembatas "siluet ombak / air biru" DIGANTI** → **perforasi tiket** (dashed + notch)
  sesuai referensi. (Wave dari revisi sebelumnya dibuang.)
- Ukuran per breakpoint (mobile → tablet → desktop): logo 44→58→44px; nama 13→20→22px;
  jam 16→22→30px; nama stasiun 13→16→20px; ikon ferry 28→38→40px; harga 18→24→32px.
- Warna tetap brand (ocean/coral/leaf) — referensi memakai biru, tapi tombol/aksen
  dipertahankan coral agar konsisten dgn seluruh situs (owner minta "layout", bukan warna).
- **Smoke test (dev 4321 + production build) — mobile/tablet/desktop:**
  - Tablet dev: opname 20px, logo 58px, ikon 38px, foto `display:none` — **media query
    JALAN di dev** (bukti dev-duplication ter-bypass).
  - Desktop dev: foto `display:block` 170px, nama 22px, harga 32px.
  - 0 overflow horizontal dari kartu di ketiga ukuran (overflow kecil sisa `hero-block`
    pre-existing, di luar scope).
  - `pnpm build` sukses tanpa error.

### Revisi finetune MOBILE (2026-09-27)
Khusus mobile (tablet & desktop TIDAK berubah — diverifikasi computed style):
- Logo diperbesar `64×88` → **`72×100`**.
- Nama operator `13px` → **`8px`**, `line-clamp` `2` → **`4`** (nama panjang turun ke bawah,
  wrap di spasi — bukan per-huruf). Sempat pakai `word-break:break-word` → dibatalkan
  karena memecah "Batam Fast" jadi huruf vertikal; kini wrap normal di spasi.
- "Per orang"/"Total" `11px` → **`9px`**; pill "Economy" `11px` → **`9px`** (padding turun);
  harga coret `12px` → **`9px`**; badge "Save %" `11px` → **`9px`** — supaya tak mepet ke
  title. Ditambah `@media (min-width:640px)` **restore** utk `.tkc__class/.tkc__orig/.tkc__save`
  supaya tablet/desktop tetap 11/12/11.
- Smoke test: mobile (logo 72/100, opname 8px/clamp4, per/orig/save/class 9px, 0 overflow),
  tablet (logo 68, opname 20, per 12, orig 12, save 11, class 11 — utuh), desktop (logo 64,
  opname 22, amount 32, per 13, foto tampil — utuh). `pnpm build` sukses.

### Revisi title per-kata MOBILE (2026-09-27)
Owner: di mobile, nama operator harus **tiap kata satu baris** (Batam / Fast = 2 baris;
Bintan / Resort / Ferries = 3 baris). Perubahan (mobile saja, tablet/desktop tetap 1 baris
menyamping):
- Markup: nama dipecah per kata → `<span class="tkc__opword">` per kata.
- Mobile: `.tkc__opword { display: block }` (tiap kata turun ke baris bawah);
  tablet/desktop `@media(min-width:640px){ .tkc__opword { display: inline } }` (alir normal).
- Mobile: `.tkc__op` diubah jadi **kolom** (`flex-direction: column`) — logo di atas, nama
  di bawahnya. Sebab: blok harga di kanan lebar (~177px di 375px) sehingga bila nama tetap
  di samping logo, lebar nama tinggal ~4px → tiap kata keclip jadi 1 huruf. Dengan kolom,
  nama dapat lebar penuh kolom kiri → tiap kata tampil utuh. Tablet/desktop dikembalikan
  `flex-direction: row` (logo + nama menyamping seperti semula).
- Smoke test: mobile kata "Batam"(25px)/"Fast"(25px) 2 baris; "Bintan/Resort/Ferries"
  3 baris — semua utuh, 0 overflow. Tablet/desktop: `.tkc__op` row, kata inline, nama 1
  baris (20/22px) — utuh. `pnpm build` sukses.

### Revisi nama di samping logo (mobile) + logo tablet lebih besar (2026-09-27)
Owner: (a) mobile — nama tetap **di samping logo** (bukan di bawah) walau mengecil;
(b) tablet — logo diperbesar & nama dikecilkan agar tak jomplang dgn mobile.
- Mobile: `.tkc__op` dikembalikan **`flex-direction: row`** (nama di samping logo). Agar
  nama tidak keclip oleh blok harga yang lebar, blok harga dibatasi **`.tkc__price {
  max-width: 130px }`** (mobile) + `.tkc__op { flex: 1 }` & `.tkc__opname { flex: 1 }` →
  nama dapat sisa lebar (~51–76px), tiap kata (block) tetap turun ke baris bawah & utuh.
  Tablet+ `.tkc__price { max-width: none }` (restore).
- Tablet: logo `68px` → **`92px`** (max-width `190` → `220`); nama `20px` → **`16px`**;
  `.tkc__opname { flex: none }` di tablet. Sekarang mobile logo 72 < tablet 92 (progresif,
  tidak jomplang). Desktop tetap (logo 64, nama 22, foto tampil).
- Smoke test: mobile row — Batam/Fast (name 51px) & Bintan/Resort/Ferries (76px) utuh,
  0 overflow kartu; tablet logo 92 / nama 16 / row; desktop logo 64 / nama 22 / foto.
  `pnpm build` sukses.

### Revisi logo DESKTOP diperbesar (2026-09-27)
Owner: desktop — frame logo diperbesar & gambar jangan terpotong.
- `.tkc__logo` desktop (`@media min-width:1024px`): tinggi `64px` → **`96px`**,
  `max-width` `220px` → **`260px`**.
- Gambar tidak terpotong: `.tkc__logo img` sudah `object-fit: contain` (skala muat,
  tak pernah crop). Verifikasi: frame 128×96, img 128×96 (natural 400×300) — utuh.
- Mobile & tablet tidak berubah. `pnpm build` sukses, 0 overflow.

---

## 📐 Panduan Adjust Manual — ukuran per mode

Semua angka di bawah ada di **`<style>` dalam `apps/web/src/components/cards/TicketRouteCard.astro`**.
Cara kerja: nilai **Mobile = default** (ditulis langsung di selector, tanpa `@media`).
**Tablet** = di dalam blok `@media (min-width: 640px) { … }`. **Desktop** = di dalam blok
`@media (min-width: 1024px) { … }`. Untuk mengubah 1 breakpoint, cari selector-nya di
blok yang sesuai. Kalau selector belum ada di blok tablet/desktop, artinya breakpoint itu
memakai nilai dari breakpoint sebelumnya (tambahkan saja override baru bila perlu).

**Batas breakpoint:** Mobile `< 640px` · Tablet `640–1023px` · Desktop `≥ 1024px`.
(Khusus padding kartu `.tkc__inner` memakai batas `768px`, bukan 640px.)

### Elemen & ukuran (Mobile → Tablet → Desktop)

| Elemen | Class CSS | Properti | Mobile | Tablet | Desktop |
|--------|-----------|----------|--------|--------|---------|
| **Logo operator (frame)** | `.tkc__logo` | tinggi / lebar | `72px` / `100px` | `92px` / auto (maks `220px`) | `96px` / auto (maks `260px`) |
| **Nama operator / title** | `.tkc__opname` | `font-size` | `8px` | `16px` | `22px` |
| Lebar maks blok harga | `.tkc__price` | `max-width` | `130px` | `none` | `none` |
| Nama operator — pemecahan baris | `.tkc__opword` | `display` | `block` (tiap kata 1 baris) | `inline` (1 baris) | `inline` (1 baris) |
| Header operator (logo vs nama) | `.tkc__op` | `flex-direction` | `row` (nama di samping logo) | `row` (menyamping) | `row` (menyamping) |
| **Harga utama** | `.tkc__amount` | `font-size` | `18px` | `24px` | `32px` |
| Label "Per orang…" | `.tkc__per` | `font-size` | `9px` | `12px` | `13px` |
| Label "Total …" | `.tkc__total` | `font-size` | `9px` | `12px` | `13px` |
| Pill kelas ("Economy") | `.tkc__class` | `font-size` | `9px` | `11px` | `11px` |
| Harga coret (asli) | `.tkc__orig` | `font-size` | `9px` | `12px` | `12px` |
| Badge "Save %" | `.tkc__save` | `font-size` | `9px` | `11px` | `11px` |
| Badge atas (Rekomendasi dll) | `.tkc__badge` | `font-size` | `11px` | `12px` | `12px` |
| **Nama stasiun** (From/To) | `.tkc__name` | `font-size` | `13px` | `16px` | `20px` |
| Nama stasiun — maks baris | `.tkc__name` | `-webkit-line-clamp` | `2` | `2` | `2` |
| Terminal (sub nama) | `.tkc__term` | `font-size` | `11px` | `13px` | `14px` |
| **Jam** (08:20 / 08:10) | `.tkc__time` | `font-size` | `16px` | `22px` | `30px` |
| Tanggal | `.tkc__date` | `font-size` | `10px` | `12px` | `12px` |
| Label tengah ("Ferry") | `.tkc__midlabel` | `font-size` | `11px` | `12px` | `12px` |
| **Ikon ferry** | `.tkc__midicon` | lebar & tinggi | `28px` | `38px` | `40px` |
| Durasi ("50 menit") | `.tkc__dur` | `font-size` | `11px` | `14px` | `14px` |
| Jumlah dipesan | `.tkc__booked` | `font-size` | `10px` | `12px` | `12px` |
| **Foto kapal** | `.tkc__photo` | tampil? / ukuran | hidden | hidden | `display:block`, `170px` persegi |
| **Tombol** (More/Book) | `.tkc__btn` | `font-size` / padding | `14px` / `.75rem 1.25rem` | `15px` / `.8rem 1.5rem` | `15px` / `.8rem 1.5rem` |
| Padding dalam kartu | `.tkc__inner` | `padding` | `1.25rem` (20px) | `1.5rem` (24px, ≥768px) | `1.5rem` |
| Jarak antar kolom rute | `.tkc__cols` | `gap` | `0.5rem` | `1rem` | `1.5rem` |

### Warna (ubah 1 tempat → berlaku semua)
Token warna didefinisikan di selector `.tkc` (paling atas `<style>`). Ubah di sini saja:

| Variabel | Nilai | Dipakai untuk |
|----------|-------|---------------|
| `--ocean` | `#1B3A4B` | nama operator, nama stasiun, jam, harga |
| `--coral` | `#E07A5F` | ikon ferry, durasi, badge "Save", tombol "Book Now" |
| `--coral-d` | `#C4583E` | hover tombol Book Now, teks badge coral |
| `--leaf` | `#4A6B5C` | teks badge leaf |
| `--stone` | `#3D405B` | teks tombol "More info", pill kelas |
| `--stoneL` | `#6B6E8A` | terminal, tanggal, per/total, dipesan (teks abu) |
| `--sand` | `#F5F0E8` | latar tombol "More info", latar frame foto |
| `--sandD` | `#D4C5A9` | garis putus pembatas tiket, hover More info |
| `--tkc-notch` | `#F5F0E8` | warna takik (samakan dgn latar section listing) |

> Catatan: bila mau **tombol/aksen jadi biru** seperti referensi, cukup ganti `--coral`
> (+ `--coral-d` hover). Kalau latar halaman listing bukan sand, samakan `--tkc-notch`
> supaya takik pembatas menyatu.

### Contoh adjust
- Perbesar jam di desktop → di blok `@media (min-width:1024px)` cari `.tkc__time { font-size: 30px; }` → ubah angkanya.
- Logo mobile lebih besar → di selector `.tkc__logo` (default/mobile) ubah `height: 44px;` dan/atau `width: 68px;`.
- Nama operator boleh 3 baris di mobile → di `.tkc__opname` ubah `-webkit-line-clamp: 2;` → `3`.

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**: kartu ferry (variant `ticket`) di mobile/tablet tanpa foto & compact; desktop tetap sama.
- **Routes**: none.
- **RBAC**: none.
- **Deploy needed**: web.

### Testing (production build `pnpm --filter @dn-journeys/web build`, dist di-serve)
- [x] Desktop 1280px — foto tampil, rute horizontal (row). `flexDirection: row`, `imgW: 160`.
- [x] Tablet 768px — tanpa foto, rute 3 kolom compact (sesuai target owner).
- [x] Mobile 375px — tanpa foto, rute 3 kolom compact (sesuai target owner).
- [x] Tidak ada horizontal overflow baru dari kartu (overflow 8px yg ada berasal dari `hero-block`, pre-existing, di luar scope).

### Catatan teknis (penting utk verifikasi berikutnya)
- **Dev server (`pnpm dev`) menampilkan kartu ini seolah rusak** di desktop (foto tak
  muncul, rute tetap column). Penyebab: artefak **dev-mode Astro+Tailwind** — ada 2
  bundle Tailwind ter-inject sebagai `<style>` inline, sehingga base utility (`.hidden`,
  `.flex-col`) dari bundle terakhir meng-override varian responsif (`.lg:flex`,
  `.lg:flex-row`) dari bundle sebelumnya.
- **Production build BENAR**: satu urutan cascade, varian responsif berada setelah base
  utility (diverifikasi via offset di `dist/_astro/*.css`). Jadi **verifikasi kartu
  responsif harus lewat build, bukan dev server**.
- `lg:flex` dipakai (bukan `lg:block`) karena `lg:flex`/`md:flex` terbukti stabil di
  environment ini; wrapper hanya berisi 1 `<img>` full-size sehingga `flex` setara.

### Rollback
```
# git checkout apps/web/src/components/cards/TicketRouteCard.astro
# (kembalikan blok "Route row": w-full md:w-32 lg:w-40 aspect-[4/3] md:aspect-square,
#  flex flex-col md:flex-row, grid-cols-1 md:grid-cols-3, font non-responsif)
# Tidak ada migration / perubahan CMS.
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.61.5-ferry-ticket-card-mobile-tablet.md` (file ini)
- [ ] `docs/PROGRESS.md`

### Next Steps
- Commit `[web]` fokus perubahan ini.
- Opsional (di luar scope): rapikan duplikasi bundle CSS Tailwind di dev, dan overflow
  horizontal dari `hero-block`.
