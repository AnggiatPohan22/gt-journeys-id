# Phase 4.68.3 — Sidebar Deterministic Ordering

> **Status:** ✅ Code selesai · ⏳ UAT visual
> **Scope:** Reorder array `collections` dan `globals` di `apps/cms/src/payload.config.ts` sesuai blueprint 4.68. Zero schema, zero access, zero file collection/global.
> **Date:** 2026-10-08
> **Branch:** `feat/sidebar-cms-reorg-phase-4.68.1`
> **Blueprint:** [phase-4.68](phase-4.68-sidebar-audit.md) §4

## Catatan teknis — kenapa bukan `admin.order`

Rencana awal 4.68 §8 menyebut "set `admin.order` eksplisit (10/20/30…)". **Ternyata Payload v3 tak punya properti `admin.order`.** Urutan sidebar dikontrol murni oleh posisi item dalam array `collections` dan `globals` di `payload.config.ts` — sudah dijelaskan oleh comment di file: *"Order determines admin sidebar accordion sequence (Payload groups by admin.group; first-appearance sets group position)"*.

Mekanisme:
- Dalam grup → item muncul sesuai urutan di array.
- Antar grup → grup pertama yang muncul = grup dengan item ber-indeks terkecil.
- Collections selalu dirender sebelum globals, jadi grup yang **murni global** (contoh: `Appearance` setelah reorg) akan tampil setelah semua grup yang punya minimal 1 collection.

Karena itu, satu-satunya titik kontrol adalah urutan import — dan di sini sudah di-apply.

## Perubahan

Satu file: `apps/cms/src/payload.config.ts` (lines ~174-226).

### Collections — urutan baru

```
BOOKINGS      → Bookings
SERVICES      → Tours · Accommodations · WaterActivities · Yachts
                · Restaurants · Venues · Rentals · Spa · FerryTickets
DESTINATIONS  → Destinations · DestinationTypes · Locations · ServiceTypes
CONTENT & PAGES → Pages · Testimonials · Categories · Media · Menus
BLOG          → Posts · Authors · BlogCategories · Tags
CHAT & MESSAGING → ChatVisitors · ChatMessages · ChatBlockedEvents
MARKETING     → NewsletterSubscribers
SYSTEM        → Users
```

### Globals — urutan baru

Dirancang supaya setiap global **append** ke grup eksisting (yang sudah di-anchor sebuah collection), kecuali Appearance yang murni global:

```
Content & Pages (append)    → HomepageContent
Blog (append)               → BlogSettings
Chat & Messaging (append)   → ChatWidgetSettings
Marketing (append)          → AnnouncementBar · PromoBanner · PopupSettings
Appearance (new)            → HeaderSettings · FooterSettings
System (append)             → SiteSettings · SiteFeatures
```

### Urutan grup final di sidebar

```
1. Bookings
2. Services
3. Destinations
4. Content & Pages        (+ HomepageContent)
5. Blog                   (+ BlogSettings)
6. Chat & Messaging       (+ ChatWidgetSettings)
7. Marketing              (+ 3 globals)
8. System                 (+ SiteSettings, SiteFeatures)
9. Appearance             (globals-only → selalu di akhir)
```

> ⚠️ **Urutan Appearance ≠ blueprint awal (yang menaruhnya sebelum System).** Konsekuensi dari aturan Payload: grup globals-only tak bisa disisipkan di tengah-tengah grup collection. Pilihan trade-off:
>
> **A. Terima** urutan "Appearance paling akhir" (default dari aturan Payload). Simple, zero kode tambahan. ← dipilih
>
> **B. Tambah "anchor collection" dummy** di Appearance supaya grupnya naik. Mahal (bikin collection cuma untuk ordering) & tak bersih.
>
> **C. Pindah salah satu item (misal HomepageContent) jadi collection** supaya Appearance punya anchor. Butuh schema change, tak sesuai scope 4.68.
>
> **D. Pindah HeaderSettings + FooterSettings ke grup lain** (misal Content & Pages). Appearance hilang. Dilema UX: header/footer tetap konsep "Appearance", lebih baik di grup sendiri meski akhir.
>
> Rekomendasi tetap **A** — Appearance di akhir masih logis (visual-styling di urutan paling akhir mirip pola konvensi WordPress/Shopify yang menaruh "Appearance/Theme" di bawah).

## Non-impact

- ❌ Tidak ada file collection/global yang disentuh di task ini (hanya payload.config.ts).
- ❌ Tidak ada schema, migration, slug, access, atau label berubah.
- ❌ Tidak ada perubahan apps/web.

## File yang disentuh

```
apps/cms/src/payload.config.ts   (reorder collections[] + globals[])
```

## Next step

- **4.68.4** — review `apps/cms/src/admin/styles/nav-icons.css`:
  - Pastikan selector per-item (`href$='/collections/<slug>'`) masih benar (slug tak berubah → OK).
  - Tambah/sesuaikan icon per grup baru jika ada selector grup-level.
- **4.68.5** — QA matrix per-role + screenshot sidebar untuk editor / admin / super-admin.
