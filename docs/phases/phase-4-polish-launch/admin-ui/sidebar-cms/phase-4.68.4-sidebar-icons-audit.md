# Phase 4.68.4 — Sidebar Icons Audit (post reorg)

> **Status:** ✅ Code selesai · ⏳ UAT visual
> **Scope:** Audit `admin-global.css` icon mapping untuk konsekuensi reorg 4.68.1-3. Tambah 2 ikon yang hilang. Zero perubahan selector lama.
> **Date:** 2026-10-08
> **Branch:** `feat/sidebar-cms-reorg-phase-4.68.1`
> **Lanjutan:** [phase-4.68.3](phase-4.68.3-sidebar-ordering.md)

## Audit result

Semua icon-mapping di `apps/cms/src/admin/admin-global.css` pakai selector CSS **berbasis slug**:

```css
.nav__link[href$='/collections/<slug>']  → --i: var(--dnj-ic-xxx)
.nav__link[href$='/globals/<slug>']      → --i: var(--dnj-ic-xxx)
```

Karena **4.68.1-3 tidak mengubah satu slug pun** (hanya `admin.group` + urutan array), **semua 25+ selector existing tetap valid**. Payload render ikon berdasarkan href URL, bukan grup.

### 3 ikon hilang (gap existing, bukan regresi 4.68)

Tiga item tidak punya mapping → fallback ke `--dnj-ic-default` (circle). Sekarang semua berada di grup prominent di sidebar (Bookings grup #1, Popup di Marketing, Locations di Destinations), jadi mending diisi.

| Href | Ikon default sebelum | Ikon baru |
|---|---|---|
| `/collections/bookings` | 🔵 circle | 🎫 ticket (`--dnj-ic-ticket`) |
| `/globals/popup-settings` | 🔵 circle | 💬 dialog window (`--dnj-ic-popup`) |
| `/collections/locations` | 🔵 circle | 🗺️ folded map (`--dnj-ic-map`) |

Semua stroke-based Lucide-style, mengikuti konvensi existing (viewBox 24×24, stroke-width 2, round linecap/linejoin). `--dnj-ic-map` sengaja beda bentuk dari `--dnj-ic-pin` (map-pin, dipakai Destinations) supaya Destinations vs Locations tidak kembar visual.

## Perubahan

Satu file: `apps/cms/src/admin/admin-global.css`

1. **Tambah 3 CSS variable** di `:root` (lanjutan block `--dnj-ic-*` existing):
   - `--dnj-ic-ticket` — SVG tiket dengan perforasi tengah.
   - `--dnj-ic-popup` — SVG dialog window dengan title-bar dots.
   - `--dnj-ic-map` — SVG folded map (3-fold) untuk Locations/ports.
2. **Tambah 3 selector** di bagian icon-mapping:
   ```css
   .nav__link[href$='/collections/bookings']   { --i: var(--dnj-ic-ticket); }
   .nav__link[href$='/globals/popup-settings'] { --i: var(--dnj-ic-popup); }
   .nav__link[href$='/collections/locations']  { --i: var(--dnj-ic-map); }
   ```

## Konsistensi review (no-change items)

Dicek sekilas; tidak ada rekomendasi perubahan di scope ini:

| Observasi | Keputusan |
|---|---|
| `--dnj-ic-doc` dipakai 3× (Pages, Posts, Blog Settings) | OK — konteks grup berbeda, visual-ambiguity kecil. Tak diubah di 4.68.4. |
| 9 service collections pakai `--dnj-ic-layers` seragam | By design (Phase 4.47a). OK. |
| Belum ada icon per-group (accordion header) | Scope expansion, bukan fix. Skip. |

## Non-impact

- ❌ Tidak ada selector lama yang dihapus/diubah.
- ❌ Tidak ada perubahan Payload config, collection, global, slug, access.
- ❌ Tidak ada perubahan selain CSS; AdminStyles provider sudah inject file ini.

## File yang disentuh

```
apps/cms/src/admin/admin-global.css   (+ 2 vars, + 2 selectors)
```

## Next step

- **4.68.5** — QA matrix per-role: login editor / admin / super-admin → screenshot sidebar → bandingkan dgn blueprint 4.68 §4. Verifikasi:
  - 9 grup muncul pada super-admin dengan urutan 4.68.3.
  - Grup yang kosong untuk editor (System, Chat & Messaging, Appearance) tersembunyi otomatis.
  - Ikon Bookings & Popup Settings tak lagi default circle.
