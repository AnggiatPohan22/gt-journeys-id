# Phase 4.51 — Header Mobile Polish (3 templates) + Theme Vars Global

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Frontend Astro only — mobile-view polish di 3 template header + theming CSS vars di-scope ulang. Zero schema/migration/payload-types change.

## Motivasi

Tampilan mobile header belum sesuai standard antar-template:

- **Template 1 (Classic)**: title site name di-`hidden sm:inline` (tak tampil di mobile), CTA WhatsApp muncul di header — kurang menonjol saat mobile.
- **Template 2 (Search & Social)**: sama — title tersembunyi di `<md`, social icons di overlay rata kiri.
- **Template 3 (Top Bar)**: title tersembunyi di `<sm`, dan saat menu mobile dibuka, overlay full-screen shared **menutup seluruh header** — top bar (phone + social, ciri khas Template 3) hilang → template terasa sama dengan Template 1 saat menu aktif.
- **Tone warna menu di overlay mobile** tidak mengikuti setting CMS Advanced Header Theming (Phase 4.41) karena vars di-inject hanya ke `#main-header`, sedangkan overlay `#mobile-menu*` di-render di luar element itu.

## Perubahan

### 1. Template 1 — Classic ([HeaderTemplate1.astro](../../apps/web/src/components/navigation/templates/HeaderTemplate1.astro))

- **Title tampil di mobile**: hapus `hidden sm:inline` → `truncate` + `min-w-0` supaya panjang aman.
- **Logo group**: `gap-3` + `shrink-0` pada logo + `truncate` pada span → posisi identik dengan overlay `_HeaderMobile` (tidak ada shift saat menu buka/tutup).
- **CTA WhatsApp**: `hidden sm:inline-flex` → `hidden lg:inline-flex` (di mobile CTA pindah ke dalam overlay).
- **CTA dalam overlay (via slot)**: full-width, warna hijau WhatsApp `#25D366` (hover `#1ebe57`), rounded-lg, shadow — beda visual dari CTA header desktop supaya menonjol saat menu terbuka.

### 2. Template 2 — Search & Social ([HeaderTemplate2.astro](../../apps/web/src/components/navigation/templates/HeaderTemplate2.astro))

- **Title tampil di mobile**: hapus `hidden md:inline` → `truncate` + `min-w-0`.
- **Logo group**: `gap-2` → `gap-3`, tambah `shrink-0` pada logo, `shrink lg:shrink-0` pada anchor.
- **Terima prop `cta`** dari renderer (sebelumnya tak ada).
- **CTA WhatsApp dalam overlay**: full-width hijau seperti Template 1.
- **Social icons dalam overlay**: `justify-center` supaya rata tengah.

### 3. Template 3 — Top Bar ([HeaderTemplate3.astro](../../apps/web/src/components/navigation/templates/HeaderTemplate3.astro))

- **Title tampil di mobile**: hapus `hidden sm:inline` → `truncate`.
- **Logo group**: `gap-2` → `gap-3`, tambah `shrink-0` + `min-w-0`.
- **Desktop CTA**: `hidden sm:inline-flex` → `hidden lg:inline-flex` (hindari tabrakan dengan menu toggle di tablet).
- **Mobile menu overlay dirender di BAWAH header** — bukan pakai `_HeaderMobile` shared. Panel `position: fixed; top: 100px; bottom: 0` menampilkan menu items + WA CTA full-width hijau. **Top bar (phone + social) + main bar tetap terlihat** saat menu terbuka → identitas Template 3 dijaga.
- Script toggle-nya sendiri (`initT3Mobile`) — kelola `aria-expanded`, ikon menu/close, scroll-lock body, ESC handler, dan auto-close saat viewport >= lg.

### 4. Overlay shared ([_HeaderMobile.astro](../../apps/web/src/components/navigation/templates/_HeaderMobile.astro))

- Logo group strip atas: `gap-2` → `gap-3`, tambah `shrink-0` pada logo + `truncate` + `min-w-0` pada anchor. Sekarang match posisi Template 1 & 2.

### 5. Theming CSS vars — pindah dari `#main-header` ke `:root` ([HeaderRenderer.astro](../../apps/web/src/components/navigation/HeaderRenderer.astro))

Sebelumnya:

```css
#main-header .dnj-nav-link { color: var(--h-menu-text); }
```

Vars di-inject inline pada `#main-header`. Overlay `#mobile-menu*` di luar `#main-header` → var tidak resolve → menu items pakai warna default browser (atau `text-stone-light` yang hardcoded).

Sekarang:

```astro
{/* Inject vars ke :root supaya semua overlay mobile bisa akses */}
<style is:global set:html={`:root{${themeStyle}}`}></style>
```

Dan rule di-lepas scope dari `#main-header`:

```css
.dnj-nav-link { color: var(--h-menu-text); }
.dnj-nav-link:hover { color: var(--h-menu-hover); }
.dnj-nav-link--active { color: var(--h-menu-active); font-weight: 700; }
.dnj-cta { background-color: var(--h-cta-bg); ... }
.dnj-cta:hover { background-color: var(--h-cta-bg-hover); }
```

Rule khusus `#main-header .dnj-icon-btn`, `.dnj-topbar`, dan `.dnj-header-surface` tetap scoped ke `#main-header` (element-nya memang hanya di sana).

Hasil: menu items di overlay ketiga template + hover + active state semua ikut tone warna dari CMS Advanced → Header. Verified: `Contact` link aktif rendering `rgb(59, 132, 172)` = `--h-menu-active` (`#3b84ac`) dari CMS.

## Non-impact

- Zero schema/migration/payload-types change.
- Zero perubahan desktop view di ketiga template.
- Kompatibel dengan Phase 4.41 (Header Advanced Theming) — semua CMS setting warna tetap berlaku, cuma sekarang mencakup overlay mobile juga.
- Kompatibel dengan Phase 3.24 (template system) — 3 template ID (`header-1/2/3`) tetap jalan, tak ada rename.

## Files touched

- **Modified:**
  - `apps/web/src/components/navigation/templates/HeaderTemplate1.astro`
  - `apps/web/src/components/navigation/templates/HeaderTemplate2.astro`
  - `apps/web/src/components/navigation/templates/HeaderTemplate3.astro`
  - `apps/web/src/components/navigation/templates/_HeaderMobile.astro`
  - `apps/web/src/components/navigation/HeaderRenderer.astro`

## Verifikasi

- **Template 1 mobile (viewport 375px, template aktif di CMS):** header awal compact (h-20) dengan title tampil, klik menu → overlay full-screen dengan menu + WA hijau full-width, posisi logo/title x=16, y=~20 identik sebelum/sesudah buka.
- **Template 3 mobile:** top bar (phone `082386357012` kiri, IG/FB/TikTok/YT kanan) + main bar tetap tampil saat menu dibuka. Menu items + WA CTA muncul di panel bawah header.
- **Theme colors di overlay:** cek `getComputedStyle` pada `.dnj-nav-link--active` di `#mobile-menu-t3` → `rgb(59, 132, 172)` sesuai `--h-menu-active` CMS.
- **Desktop (≥1024px):** ketiga template tak berubah — smoke-test ke `/` dan `/contact` di viewport desktop.

## Owner UAT

- Ganti ke masing-masing template (`header-1`, `header-2`, `header-3`) via CMS Header Settings, buka `/` di mobile viewport (Chrome DevTools atau HP).
- Verifikasi title tampil, menu bisa buka/tutup, WA button hijau full-width di overlay/panel bawah.
- Ubah tone warna Advanced (menu default/hover/active) di CMS → refresh → menu overlay ikut warna baru.
- Untuk Template 3: pastikan top bar (phone + social) tetap tampil saat menu terbuka.

## Addendum — Fix T1 & T2 header transparent (commit `008e94b`)

**Bug:** setelah Phase 4.51 di-deploy, owner report bahwa di mobile Template 1 & 2 header nampak **transparent** (background tidak muncul) baik di atas maupun setelah scroll.

**Root cause:** `.dnj-header-surface` di [HeaderTemplate1.astro](../../apps/web/src/components/navigation/templates/HeaderTemplate1.astro) & [HeaderTemplate2.astro](../../apps/web/src/components/navigation/templates/HeaderTemplate2.astro) ditaruh di element `#main-header` itu sendiri (`<header id="main-header" class="... dnj-header-surface">`), sedangkan Template 3 menaruhnya di descendant `<div class="dnj-header-surface">` (di dalam main bar). CSS selector Phase 4.41.1 pakai descendant combinator dengan spasi:

```css
#main-header .dnj-header-surface { background-color: var(--h-bg); ... }
```

Descendant combinator (`A B`) hanya match B yang **descendant** dari A, **bukan** A itu sendiri. Jadi rule tidak apply di T1 & T2 → bg tidak di-set → header transparent tanpa peduli scroll state atau mode transparent-on-top.

**Bug ini sudah ada sejak Phase 4.41.1** tapi baru terlihat setelah owner benar-benar test mobile view pada template 1 & 2 di Phase 4.51.

**Fix:** dobel selector — satu tanpa spasi (element sendiri), satu descendant.

```css
#main-header.dnj-header-surface,
#main-header .dnj-header-surface {
  background-color: var(--h-bg);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(212, 197, 169, 0.20);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  ...
}

#main-header[data-transparent-top="1"][data-scrolled="0"].dnj-header-surface,
#main-header[data-transparent-top="1"][data-scrolled="0"] .dnj-header-surface {
  background-color: transparent;
  backdrop-filter: none;
  ...
}
```

**Efek:**
- Template 1 & 2 header sekarang punya bg `--h-bg` + blur + border + shadow sesuai setting CMS. Transparent-on-top juga berfungsi (transparan saat di paling atas + `transparentOnTop = true`; muncul opaque saat scroll >40px).
- Template 3 tidak berubah — descendant selector masih match `.dnj-header-surface` di dalam main bar.

**Verified:** `getComputedStyle(#main-header).backgroundColor` = `rgba(255, 255, 255, 0.9)` (dari `--h-bg` default `#FFFFFFE6`).

**File touched:** `apps/web/src/components/navigation/HeaderRenderer.astro` (CSS block saja, 6 baris changed).
