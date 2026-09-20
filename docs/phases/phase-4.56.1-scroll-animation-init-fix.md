# Phase 4.56.1 — Scroll Animation Init Fix (hard-refresh)

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Depends on:** Phase 4.56 (Entry Animation scroll-triggered)

## Motivasi (owner report)

> "Disaat saya coba refresh dan scroll animation-nya tidak berjalan. Kemungkinan disaat di-refresh semua animasi berjalan sehingga saat scrolling sudah tampil seutuhnya. Saya mau disaat di-scroll ke bawah dan masuk ke section tersebut, baru animation (block atau text) di-proses."

## Root cause

Phase 4.56 memasang `initAnimations()` hanya via listener `astro:page-load` di `apps/web/src/layouts/BaseLayout.astro`:

```ts
document.addEventListener('astro:page-load', initAnimations)
```

Namun event `astro:page-load` **hanya fire kalau Astro `<ClientRouter />` (View Transitions) aktif**. Project ini tidak pakai ClientRouter (verified via grep — nol pemakaian di `apps/web/**`). Konsekuensi:

- Hard refresh (F5) → `astro:page-load` tidak pernah fire → `initAnimations()` tidak dipanggil.
- GSAP ScrollTrigger untuk `data-animate="reveal"` tak terdaftar → element render normal tanpa animasi (`gsap.from` tak jalan → tak ada state awal `opacity:0`).
- IntersectionObserver untuk `.entry-fade/-zoom/-slide-*` tak terpasang → element stuck di state awal CSS (`opacity:0`) — TAPI karena semua block default `entryAnimation='reveal'` (GSAP path, bukan CSS class), user melihat mereka fully rendered.

**Efek net yang dilihat owner:** section muncul langsung tanpa transisi apapun saat halaman di-scroll — bahkan block dengan preset non-`reveal` (fade/zoom/slide) juga tak animate karena observer tak pernah dipasang.

Bonus root-cause: ScrollTrigger start/end positions dihitung saat init dari layout awal. Kalau gambar tinggi di atas section belum load (LCP delay), posisi trigger geser → sebagian animasi bisa terlanjur "fired" sebelum user scroll.

## Perubahan

### 1. `apps/web/src/layouts/BaseLayout.astro` — trigger init pada DOM ready

```ts
// Sebelum
document.addEventListener('astro:page-load', initAnimations)

// Sesudah
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initAnimations())
} else {
  initAnimations()
}
document.addEventListener('astro:page-load', () => initAnimations()) // future-proof kalau ClientRouter ditambah
```

Init sekarang jalan pada hard-refresh normal. Listener `astro:page-load` disimpan supaya kalau nanti View Transitions diaktifkan, navigasi client-side tetap re-init.

### 2. `apps/web/src/lib/animations.ts` — idempotency guard

Karena BaseLayout bisa memanggil `initAnimations()` dua kali (DOMContentLoaded + astro:page-load, atau immediate + astro:page-load), tambah guard sederhana lewat window flag:

```ts
export function initAnimations() {
  if ((window as any).__dnjbAnimationsInited) return
  ;(window as any).__dnjbAnimationsInited = true
  …
}
```

Tanpa guard: double register → dua IntersectionObserver + dua GSAP ScrollTrigger per element → animasi bisa flicker / durasi ganda / state kacau.

### 3. `apps/web/src/lib/animations.ts` — `ScrollTrigger.refresh()` on window load

Tambah di akhir `initAnimations`:

```ts
if (document.readyState === 'complete') {
  ScrollTrigger.refresh()
} else {
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
}
```

Setelah semua gambar/font load, ScrollTrigger recalc posisi start/end. Mencegah situasi di mana trigger yang seharusnya "top 85%" ternyata sudah lewat karena layout expand setelah init.

## Non-impact / backward compat

- Field CMS tidak berubah. Field `entryAnimation` + `entryAnimationSpeed` + `entryAnimationDurationMs` (dari 4.56) tetap sama.
- CSS `.entry-*` di `global.css` tidak berubah.
- `resolveEntryAnimation` signature tidak berubah.
- 22 block frontend tidak disentuh.
- Zero migration.
- Kalau nanti Astro `<ClientRouter />` diaktifkan → listener `astro:page-load` sudah terpasang, plus guard idempotent memastikan init tak double-fire pada initial load.

## Files touched

**Modified:**
- `apps/web/src/layouts/BaseLayout.astro` — invoke `initAnimations()` on DOMContentLoaded/immediate (bukan cuma listener `astro:page-load`)
- `apps/web/src/lib/animations.ts` — guard `__dnjbAnimationsInited` (idempotent), `ScrollTrigger.refresh()` on window load

## UAT checklist

1. `pnpm --filter web dev` → buka `http://localhost:4321/` di browser bersih (Ctrl+Shift+R hard-refresh biar clear cache).
2. Halaman load → **section pertama di viewport** animate normal (Hero fade/reveal).
3. Section di bawah fold **BELUM visible** (opacity:0 / offset). Scroll perlahan.
4. Saat section mendekati viewport (~15% masuk) → animasi entry jalan (fade/zoom/slide sesuai setting di CMS).
5. Test preset per block via CMS Admin → Advanced tab:
   - `Entry Animation = Slide from Left`, `Speed = Slow` → section slide dari kiri, ~1.5s, hanya saat scroll ke section.
   - `Speed = Fast` → ~0.5s.
   - `Speed = Custom = 2000` → 2 detik.
6. Test `data-animate="reveal"` (default GSAP path) — juga scroll-triggered dgn duration dari `--entry-duration`.
7. DevTools → Application → clear cache → reload beberapa kali → animasi selalu jalan dari refresh, tak stuck invisible.
8. `prefers-reduced-motion: reduce` (DevTools Rendering panel) → no animation, element langsung visible.
9. Console → tak ada error terkait GSAP/ScrollTrigger.
