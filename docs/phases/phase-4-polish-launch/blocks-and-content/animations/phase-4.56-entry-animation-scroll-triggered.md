# Phase 4.56 — Entry Animation Scroll-Triggered + Speed Control

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.55 (Advanced tab compact color picker)

## Motivasi (owner report)

> "Ada sedikit penyesuaian pada Entry Animation untuk setiap block, saya mau itu berjalan saat itu di-scroll mendekati section-nya, bukan dijalankan di awal berbarengan. Sehingga saat website di-scroll dan memasuki masing-masing block, baru animasi entry-nya berjalan. Saya mau ada speed yang bisa di-adjust dan by default itu normal. Karena yang saya temukan di frontend tidak ada transisi saat saya scroll ke bawah, sedangkan entry sudah saya isi per block-nya."

## Root cause

Sistem lama (pre-4.56) punya **2 jalur** Entry Animation:
- `reveal` preset → jalur GSAP ScrollTrigger di `apps/web/src/lib/animations.ts`. **Scroll-triggered** ✓
- `fade` / `zoom` / `slide-left` / `slide-right` → CSS class `.entry-<name>` dengan `@keyframes` di-inline di 3 block (Hero, CTA, Image). Fire on element mount (~= page load). **BUKAN scroll-triggered** ✗

Akibat: kalau editor pilih preset non-`reveal`, animasinya sudah selesai sebelum user scroll ke section itu → user "tidak lihat transisi".

Field `entryAnimation` juga tidak punya kontrol durasi.

## Perubahan

### 1. CMS — 2 field baru di Advanced tab

`apps/cms/src/fields/advancedStyle.ts` — layout row baru (50/50) menampung field lama `entryAnimation` + field baru:

- **`entryAnimationSpeed`** (select, default `'normal'`): slow (1500ms) · normal (900ms, default) · fast (500ms) · custom
- **`entryAnimationDurationMs`** (number, 100–5000): dipakai kalau speed = custom
- Kedua field baru conditional `entryAnimation !== 'none'`

Otomatis muncul di **22 block** karena shared helper `advancedStyleFields[NoButton]`.

### 2. Frontend — resolveEntryAnimation signature baru

`apps/web/src/lib/blockStyles.ts`:

```ts
resolveEntryAnimation(v?, speed?, customMs?): {
  useDataAnimate, className, dataAnimate, durationMs, style
}
```

- `style` = `--entry-duration:{ms}ms` — CSS var yang dibaca CSS transition + GSAP (dibaca lewat `getComputedStyle(el).getPropertyValue('--entry-duration')` di animations.ts).

### 3. Global CSS — scroll-triggered transition

`apps/web/src/styles/global.css`:

```css
.entry-fade, .entry-zoom, .entry-slide-left, .entry-slide-right {
  opacity: 0;
  transition: opacity var(--entry-duration, 900ms) cubic-bezier(0.16, 1, 0.3, 1),
              transform var(--entry-duration, 900ms) cubic-bezier(0.16, 1, 0.3, 1);
}
.entry-zoom        { transform: scale(0.92); }
.entry-slide-left  { transform: translateX(-40px); }
.entry-slide-right { transform: translateX(40px); }

.entry-*.is-in-view { opacity: 1; transform: none; }
```

Element mulai hidden + offset. Class `.is-in-view` di-toggle observer.

### 4. IntersectionObserver di animations.ts

```ts
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-in-view')
      observer.unobserve(e.target)
    }
  })
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })

document.querySelectorAll('.entry-fade, .entry-zoom, .entry-slide-left, .entry-slide-right')
  .forEach(el => io.observe(el))
```

Trigger: 15% element visible + 8% offset dari bottom viewport (biar animasi start persis saat user tepat mau lihat).

GSAP `data-animate="reveal"` juga sekarang baca `--entry-duration` var:

```ts
const dur = readDurationMs(el, 800) / 1000
gsap.from(el, { y: 40, opacity: 0, duration: dur, ... })
```

### 5. Hapus @keyframes inline dari 3 block

`HeroBlock.astro`, `CTABlock.astro`, `ImageBlock.astro` — hapus block CSS `.entry-fade { animation-name: entryFade }` + `@keyframes` lokal. Style sekarang **exclusively** dari global.css (transition-based, scroll-triggered).

### 6. Update 15 block frontend

Semua block yang panggil `resolveEntryAnimation(b.entryAnimation)` disesuaikan:
- Pass 3 args: `resolveEntryAnimation(b.entryAnimation, b.entryAnimationSpeed, b.entryAnimationDurationMs)`
- Section `style` attribute inject `entry.style` (CSS var `--entry-duration`)

Batch sed replacement pada 13 block, plus manual pada ValuePropsBanner, ServiceListingHeroImmersive, HeroBlock.

### 7. HeroBlock refactor

Sebelumnya inline `entryAnimation`/`entryClass`. Sekarang pakai shared `resolveEntryAnimation` + apply `entryClass` + `style={entryStyle}` ke root `<section class="hero-block">`.

## Non-impact / backward compat

- Data lama tanpa `entryAnimationSpeed` → default `'normal'` (900ms) → identik ritme animasi lama.
- Data `entryAnimation = 'reveal'` (default lama) → tetap GSAP path, sudah scroll-triggered → **no visible change**.
- Data `entryAnimation = 'none'` → `className` + `style` kosong → tidak ada animasi (identik).
- Element rendering & DOM structure tidak berubah.
- Zero schema migration — 2 field baru optional.

## Files touched

**Modified:**
- `apps/cms/src/fields/advancedStyle.ts` — tambah `entryAnimationRow` + `entryAnimationCustomField`
- `apps/web/src/lib/blockStyles.ts` — `resolveEntryAnimation` signature baru dgn speed + durationMs
- `apps/web/src/styles/global.css` — CSS `.entry-*` transition-based
- `apps/web/src/lib/animations.ts` — IntersectionObserver untuk `.entry-*` + `readDurationMs` untuk GSAP path
- `apps/web/src/components/blocks/HeroBlock.astro` — pakai shared resolver, root section apply `entryClass` + `entryStyle`
- `apps/web/src/components/blocks/CTABlock.astro` — remove inline `@keyframes cFade/cZoom/dst`
- `apps/web/src/components/blocks/ImageBlock.astro` — remove inline `@keyframes iFade/iZoom/dst`
- 15 block lain (Contact, FAQ, Gallery, Newsletter, RichText, ServiceGrid, ServiceListingEditorial, ServiceListingHeroImmersive, StatsBanner, Testimonials, TestimonialsCarousel, TrustBadges, ValuePropsBanner) — `resolveEntryAnimation(3 args)` + section style inject `entry.style`
- `packages/shared/src/types/payload-types.ts` — regen (22 block × 2 field baru)

## UAT checklist

1. SA login → home page (atau any page dgn multi block) → CMS admin buka block Advanced tab. Cek row baru: **Entry Animation** (kiri) + **Speed** (kanan). Speed default = Normal.
2. Set Entry Animation = **Slide from Left**, Speed = **Slow**. Save.
3. Buka frontend `/` → scroll dari atas. Section itu **tidak** langsung visible — dia mulai off-screen kanan (translateX). Saat scroll mendekati section, dia slide in dari kiri dengan durasi ~1.5 detik.
4. Ubah Speed ke **Fast** → same section slide in cepat ~0.5 detik.
5. Ubah Speed ke **Custom**, isi 2000. Verify animasi jalan 2 detik.
6. Test preset lain (Fade In, Zoom In, Slide from Right, Fade Up = reveal) semua scroll-triggered.
7. Reload page dari tengah viewport (scroll dulu, lalu F5) → section di viewport langsung visible (observer tetap trigger karena element sudah intersecting saat mount).
8. `prefers-reduced-motion: reduce` — no animation, element langsung visible.
