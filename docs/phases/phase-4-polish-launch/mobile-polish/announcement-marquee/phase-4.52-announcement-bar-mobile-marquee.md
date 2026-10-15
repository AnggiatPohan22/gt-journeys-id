# Phase 4.52 — Announcement Bar Mobile Marquee

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Frontend Astro only — [AnnouncementBar.astro](../../apps/web/src/components/common/AnnouncementBar.astro). Zero schema/migration/payload-types change.

## Motivasi

Di mode mobile, Announcement Bar bisa wrap sampai 2–3 baris kalau pesan panjang → bar jadi tinggi, ambil vertical space berlebih di atas header (kelihatan di screenshot Phase 4.51 — 3 baris "Announcement Bar" numpuk). Owner minta:

- **Tetap 1 baris di mobile**, apapun panjang teks.
- Kalau teks melebihi lebar container → **auto jadi running text (marquee)** yang jalan **dari kanan ke kiri**.
- Loop **seamless** — tidak ada jeda kosong / snap balik ke posisi awal.
- Desktop (≥sm) tidak berubah — tetap wrap + center (banyak ruang, marquee tidak perlu).

## Pendekatan

Marquee klasik "dua salinan konten" — cara paling reliable untuk seamless loop:

```
[Container overflow-hidden]
  [Track width:max-content, animate translateX 0 → -50%]
    [Item asli]  [Item clone identik]
```

Karena kedua item identik dan lebar track = 2× lebar item, saat track geser sejauh 50% (= 1× lebar item), item ke-2 pas menempati posisi awal item ke-1. Loop naik ke awal tanpa jeda visual.

Aktivasi kondisional (mobile + teks overflow saja) via JS untuk menghindari:
- Marquee di desktop (ruang cukup, teks bisa center wrap normal).
- Marquee di mobile saat teks pendek (mubazir animasi + boros baterai).

## Perubahan

### Markup

Sebelumnya: `<span class="flex-1 text-center leading-snug">...</span>`.

Sekarang:

```html
<div class="ab-viewport flex-1 min-w-0 overflow-hidden">
  <div class="ab-track flex items-center leading-snug">
    <span class="ab-item shrink-0 whitespace-nowrap sm:whitespace-normal sm:text-center sm:w-full">
      {message}
      {link}
    </span>
    <!-- clone di-inject oleh JS kalau overflow -->
  </div>
</div>
```

- `.ab-viewport` = jendela terlihat (`overflow-hidden`).
- `.ab-track` = pembungkus yang di-animate.
- `.ab-item` = konten. `whitespace-nowrap` di mobile (paksa 1 baris), `sm:whitespace-normal` di desktop (wrap normal).

### CSS

```css
.dnj-ab .ab-track { width: max-content; max-width: 100%; }

/* Non-marquee (mobile teks pendek + semua desktop): item di-center via margin-auto */
.dnj-ab:not([data-ab-marquee="1"]) .ab-item { margin-inline: auto; }

/* Marquee aktif (di-set JS): animate translateX 0 → -50% */
.dnj-ab[data-ab-marquee="1"] .ab-track {
  width: max-content;
  max-width: none;
  animation: ab-marquee var(--ab-marquee-duration, 20s) linear infinite;
}
.dnj-ab[data-ab-marquee="1"] .ab-item { padding-right: 3rem; } /* jarak antar salinan */

@keyframes ab-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* UX: pause on hover (perangkat hover), respect reduced-motion */
@media (hover: hover) { .dnj-ab[data-ab-marquee="1"]:hover .ab-track { animation-play-state: paused; } }
@media (prefers-reduced-motion: reduce) { .dnj-ab[data-ab-marquee="1"] .ab-track { animation: none; transform: none; } }

/* Desktop: force-off marquee + kembalikan wrap normal */
@media (min-width: 640px) {
  .dnj-ab .ab-track { width: 100%; max-width: 100%; animation: none !important; transform: none !important; }
  .dnj-ab .ab-item { padding-right: 0; margin-inline: 0; white-space: normal; }
}
```

### JS — `setupMarquee(bar)`

Dijalankan saat init + `load` + `resize` (debounced 150ms) + `orientationchange` + `ResizeObserver` di `.ab-viewport` (reliable untuk font-load / viewport emulation yang tidak trigger resize event).

Logic:

1. Reset — hapus clone lama, drop attribute `data-ab-marquee`, clear inline `--ab-marquee-duration`.
2. Kalau `window.innerWidth > 639` (desktop) → return, tak ada marquee.
3. Ukur `viewport.width` dan `item.width`. Kalau `itemWidth <= viewportWidth + 1` → return (muat 1 baris tanpa scroll).
4. Kalau overflow → `cloneNode(true)` item asli, tambah class `ab-item--clone`, set `aria-hidden` + `tabindex=-1` di link clone (a11y — screen reader baca 1×, keyboard nav tidak dobel).
5. Hitung durasi: `duration = max(8, itemWidth / 60)` detik (kecepatan konsisten ~60 px/s apapun panjang teks; minimum 8s biar teks pendek tapi overflow tidak lari terlalu cepat).
6. Set `--ab-marquee-duration` + `data-ab-marquee="1"` → CSS aktif.

## Non-impact

- Desktop view (≥640px) sama persis dengan sebelumnya — CSS `@media (min-width: 640px)` force-off marquee dan kembalikan `white-space: normal` + `margin-inline: 0`.
- Zero schema/migration/payload-types change.
- Zero perubahan behavior dismiss (localStorage version-hashed) atau frequency.
- Backward-compatible dengan Phase 4.44 (theming CSS vars) dan Phase 4.45 (alpha color support).

## Files touched

- **Modified:** `apps/web/src/components/common/AnnouncementBar.astro`

## Verifikasi (dev-browser, viewport 375×812)

- `bar.getBoundingClientRect().height` = 44px (1 baris + padding).
- `item.getBoundingClientRect().width` = 663px, `viewport.width` = 307px → overflow → marquee aktif.
- `bar.dataset.abMarquee` = `"1"`, `itemCount` = 2 (asli + clone), `--ab-marquee-duration` = `11.06s`.
- Animation `ab-marquee` running linear infinite.
- Desktop viewport (≥640px): tak ada `data-ab-marquee`, teks kembali wrap + center normal.

## Owner UAT

- Buka homepage di HP asli / DevTools mobile viewport. Bar tampil 1 baris.
- Kalau teks announcement panjang → running text kanan-ke-kiri, mulus tanpa jeda.
- Kalau teks pendek (muat 1 baris) → tetap center, tidak marquee.
- Rotate ke landscape → auto re-evaluasi (marquee mati kalau lebar cukup).
- Desktop resize → wrap normal + center, tidak marquee.
- Pesan diedit via CMS → dismissal reset (version hash Phase 4.44 tetap jalan).
