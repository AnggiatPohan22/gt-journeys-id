# Phase 4.42a — ColorSwatchField Drag Loop Fix

**Status:** ✅ Code complete · ⏳ Owner UAT re-run
**Branch:** `feature/phase4-polish-launch`
**Scope:** Bugfix pada 1 komponen. Zero schema/migration/dep change.

## Bug (UAT report)

- Klik salah satu titik warna di picker → OK, tidak error.
- **Drag** di area SV atau hue slider untuk menemukan warna tepat → runtime error:
  > **Maximum update depth exceeded.** This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
- Hydration warning tambahan di layout Payload — **red herring**, disebabkan react-colorful meng-inject style tag saat runtime (SSR/CSR beda `<style>` isi). Benign, tidak menghentikan fungsi; tidak diperbaiki di phase ini karena akar penyebab ada di lib pihak ketiga.

## Root cause

`react-colorful` `HexColorPicker` memancarkan `onChange` di setiap `pointermove` saat drag (~60fps). v1 memanggil Payload `setValue` di setiap panggilan → form context re-render kilat → validate loop → Payload internal watcher memicu setState → **Maximum update depth exceeded**.

Klik tunggal tidak memicu loop karena hanya 1 event = 1 setValue.

## Fix

Local `draft` state jadi buffer antara picker dan Payload form:

- `draft` (local `useState`) — di-update **instant** oleh picker/text-input → UI (swatch, hex input, picker prop) selalu responsive.
- `setValue` (Payload) — di-debounce **80ms** via `scheduleCommit`. Panggilan berturut-turut me-reset timer; hanya sekali `setValue` di-fire per burst drag.
- Popover close atau komponen unmount → `flushCommit` memaksa write terakhir supaya `Save` state konsisten.
- `lastCommittedRef` menandai commit terakhir dari sini, sehingga sync external → local (mis. form reset dari luar) tidak menabrak draft yang lagi diketik.

Hasil: rendering picker tetap smooth, tetapi form re-render Payload hanya sekali per pause. Update-depth guard React tidak lagi tercapai.

## Files touched

- **Modified:** `apps/cms/src/components/ColorSwatchField.tsx`

## UAT re-run checklist

1. Login SA → Header Settings → Advanced → klik swatch → popover terbuka.
2. **Drag** di area SV (SV rectangle) — swatch preview + hex text update live, **tidak ada runtime error**.
3. **Drag** hue slider → sama.
4. Lepas mouse → tunggu ~100ms → tombol **Save** aktif dengan warna akhir.
5. Save → refresh → warna persist.
6. Ketik hex manual di text input popover → sama.
7. Tombol Reset (di luar popover) → draft & value kosong; frontend fallback ke default template.

## Catatan hydration warning yang tetap ada

Warning di console:
```
<style>
+  @layer payload-default, payload;
-  {"body {transition: opacity ease-in 0.2s; } …"}
```

Disebabkan `react-colorful` runtime `useLayoutEffect` inject `<style>` ke `<head>`. Server-render tidak punya style tag itu, client-render punya → mismatch warning. **Recoverable** — React regenerate tree, fungsi jalan normal. Kalau ganggu, fix-nya: (a) forward `useLayoutEffect` fallback ke `useEffect` server-side (patchable), atau (b) pertimbangkan swap library ke picker minimal buatan sendiri (~150 baris). Tidak dilakukan di phase ini karena benign.
