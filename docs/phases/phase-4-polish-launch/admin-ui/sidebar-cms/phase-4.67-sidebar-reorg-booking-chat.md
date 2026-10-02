# Phase 4.67 — CMS Sidebar Reorganization (Booking & Chat Consolidation)

**Status:** ✅ Code complete · ⏳ Owner UAT (login tiap role — super-admin / admin / editor — cek sidebar)
**Branch:** `refactor/cms-sidebar-reorg-phase-4.67`
**Scope:** Pure `admin.group` string moves across 9 collections + 4 globals, satu access alignment di `HomepageContent`, dan reorder arrays di `payload.config.ts`. Zero schema change, zero migration.

## Motivasi

Sidebar lama: `Dashboard · Content · Posts · Services · Site Builder · Administration · Settings · Appearance · Marketing`. Dua masalah utama:

1. **Chat terpecah dua grup.** `ChatWidgetSettings` (global config) di **Settings**, sementara data percakapan (`ChatVisitors`, `ChatMessages`, `ChatBlockedEvents`) di **Administration**. Secara teknis benar (global vs collection), tapi UX user membingungkan — "kenapa Chat ada di 2 tempat?".
2. **Bookings nyangkut di Administration.** Padahal Booking = transaksi/revenue flow, bukan admin housekeeping. Ke depan akan tumbuh signifikan (page booking, payment gateway, invoice, refund) → butuh grup sendiri sejak sekarang supaya expansion tidak dipaksa muat di Administration.

Masalah tambahan yang ikut dibereskan:

3. **Authors di grup Content** padahal hanya dipakai Posts.
4. **HomepageContent di Appearance** padahal isinya block content (hero, section), bukan styling.
5. **Marketing cuma 2 item** + Popup berkeliaran sendirian di Settings — tiga engagement widget terpisah.
6. **Posts** label kurang luas — grup berisi Posts/Categories/Tags/Authors/Settings lebih tepat disebut **Blog**.

## Perubahan

### Group moves — collections

| Collection | Old group | New group | Alasan |
|---|---|---|---|
| `authors` | Content | **Blog** | Hanya dipakai Posts |
| `posts` | Posts | **Blog** | Rename grup |
| `blog-categories` | Posts | **Blog** | Rename grup |
| `tags` | Posts | **Blog** | Rename grup |
| `bookings` | Administration | **Bookings** (new) | Siap scale: payment, invoice, booking page |
| `chat-visitors` | Administration | **Chat** (new) | Konsolidasi semua chat |
| `chat-messages` | Administration | **Chat** (new) | Konsolidasi semua chat |
| `chat-blocked-events` | Administration | **Chat** (new) | Konsolidasi semua chat |
| `newsletter-subscribers` | Administration | **Marketing** | Engagement, bukan admin housekeeping |

### Group moves — globals

| Global | Old group | New group |
|---|---|---|
| `homepage-content` | Appearance | **Content** |
| `blog-settings` | Settings | **Blog** |
| `chat-widget` | Settings | **Chat** |
| `popup-settings` | Settings | **Marketing** |

### Access alignment

| Global | Field | Old | New | Alasan |
|---|---|---|---|---|
| `homepage-content` | `access.update` | `isSuperAdmin` | `isAdmin` | Sejajar dgn Pages/Destinations/testimonials — admin seharusnya bisa edit copy homepage. `hidden: user.role === 'editor'` tetap (editor tetap tidak lihat). |

### Final sidebar structure

```
Dashboard

Content
  ├─ Pages
  ├─ Homepage — Fallback Content   ← moved
  ├─ Service Types
  ├─ Destinations
  ├─ Destination Types
  ├─ Categories
  ├─ Locations
  └─ Testimonials

Blog                                 ← renamed from "Posts"
  ├─ Posts
  ├─ Blog Categories
  ├─ Tags
  ├─ Authors                        ← moved from Content
  └─ Blog Settings                  ← moved from Settings

Services
  ├─ Tours
  ├─ Accommodations
  ├─ Water Activities
  ├─ Yachts
  ├─ Ferry Tickets                  ← reordered up (service tiket)
  ├─ Rentals
  ├─ Restaurants
  ├─ Venues
  └─ Spa

Bookings                             ← NEW GROUP (siap payment phase)
  └─ Bookings

Chat                                 ← NEW GROUP (konsolidasi)
  ├─ Chat Visitors                  ← moved from Administration
  ├─ Chat Messages                  ← moved from Administration
  ├─ Chat Blocked Events            ← moved from Administration
  └─ Chat Widget                    ← moved from Settings

Marketing
  ├─ Newsletter Subscribers         ← moved from Administration
  ├─ Announcement Bar
  ├─ Promo Banner
  └─ Popup                          ← moved from Settings

Site Builder
  ├─ Menus
  └─ Media

Administration                       (tersisa benar2 user admin)
  └─ Users

Appearance                           (benar2 styling layout)
  ├─ Header Settings
  └─ Footer Settings

Settings                             (global-level config)
  ├─ Site Settings
  └─ Pengaturan Fitur
```

**Catatan urutan grup:** Payload v3 menentukan posisi grup berdasarkan *first appearance* di `collections[]` dulu lalu `globals[]`. Karena grup **Appearance** dan **Settings** sekarang isinya 100% globals, keduanya natural turun ke bawah **Administration** (yang punya collection `Users`). Hasil akhir: `… Site Builder → Administration → Appearance → Settings`. Minor deviation dari urutan ideal yang saya tawarkan di proposal (Administration terakhir), tapi tidak mengganggu — semua grup housekeeping bawaan tetap mengumpul di bagian bawah sidebar. Mengubah ke urutan "Administration terakhir" butuh custom `admin.components.Nav` override — bukan scope phase ini.

## Dampak role-by-role

Access existing dibiarkan apa adanya (kecuali satu alignment di HomepageContent). Visibility per role setelah reorg:

| Grup | Super-admin | Admin | Editor |
|---|---|---|---|
| Content | ✅ full | ✅ edit most, Homepage edit | ✅ read + edit Pages/dsb (Homepage hidden) |
| Blog | ✅ full | ✅ edit all | ✅ create/edit Posts/Tags/Categories; Blog Settings admin+ only |
| Services | ✅ full (module gate) | ✅ (module gate) | ✅ read/update (module gate) |
| Bookings | ✅ full | ✅ CRUD read/update | ❌ hidden (read=isAdmin) |
| Chat | ✅ full | ✅ CRUD read/update | ❌ hidden (read=isAdmin pada semua chat collections, widget=super-admin only) |
| Marketing | ✅ full | ✅ Newsletter CRUD | ❌ Newsletter hidden (isAdmin); globals read-only |
| Site Builder | ✅ full | ✅ full | ✅ Media + Menus |
| Administration | ✅ full | ✅ view, super-admin create/delete | ✅ view self (users read authenticated) |
| Appearance | ✅ full | ✅ update | 👁️ read-only (hidden via field) |
| Settings | ✅ full | ✅ update SiteSettings; SiteFeatures super-admin only | 👁️ read-only |

Visibility editor pada **Bookings**, **Chat**, **Newsletter Subscribers** sesuai policy existing (data sensitif/operasional). Jika di masa depan ingin "Operator" role (editor + chat/booking access), itu scope tersendiri (bisa dibuka di Phase 4.67.x).

## File yang disentuh

**Collections (9):**
- `apps/cms/src/collections/Authors.ts`
- `apps/cms/src/collections/Posts.ts`
- `apps/cms/src/collections/BlogCategories.ts`
- `apps/cms/src/collections/Tags.ts`
- `apps/cms/src/collections/Bookings.ts`
- `apps/cms/src/collections/ChatVisitors.ts`
- `apps/cms/src/collections/ChatMessages.ts`
- `apps/cms/src/collections/ChatBlockedEvents.ts`
- `apps/cms/src/collections/NewsletterSubscribers.ts`

**Globals (4):**
- `apps/cms/src/globals/HomepageContent.ts` (+ access.update: isSuperAdmin → isAdmin)
- `apps/cms/src/globals/BlogSettings.ts`
- `apps/cms/src/globals/ChatWidgetSettings.ts`
- `apps/cms/src/globals/PopupSettings.ts`

**Config:**
- `apps/cms/src/payload.config.ts` — reorder `collections[]` dan `globals[]` arrays supaya urutan grup konsisten; komentar diperbarui.

## CSS / UI komponen

Tidak ada CSS yang disentuh. Icon per collection di `apps/cms/src/admin/admin-global.css` memakai selector `.nav__link[href$='/collections/<slug>']` — path-based, bukan group-name — jadi semua icon tetap muncul di grup barunya.

`NavAccordion.tsx` dan `NavDashboardLink.tsx` tidak menyentuh nama grup; mereka hanya pakai `.nav-group` + `.nav__link` + pathname matching.

## Validation

- `tsc --noEmit` di `apps/cms` → tidak ada error baru akibat perubahan ini (error pre-existing di `Bookings.defaultSort`, `scripts/archive/*`, Next.js segment types tetap sama seperti sebelum phase ini).
- Zero schema change → tidak ada migration yang dibuat.
- Smoke test manual (ownership UAT): login super-admin → cek sidebar urut sesuai struktur baru. Login admin → cek Bookings/Chat/Newsletter visible. Login editor → cek Bookings/Chat/Newsletter hidden, Blog + Content accessible.

## Risiko

**Rendah.** Perubahan murni UI grouping. Data existing tidak tersentuh. Rollback = revert commit tanpa migration undo.

## Follow-ups (potensi phase 4.67.x)

- **4.67.1** — custom `admin.components.Nav` untuk mem-force urutan grup `… → Appearance → Settings → Administration` (ideal, bukan natural).
- **4.67.2** — role baru "Operator" (editor + chat + booking) kalau ada operator customer-service yang butuh akses Chat/Booking tapi bukan admin.
- **4.67.3** — expand Bookings group: Payments, Invoices, Refunds collections saat payment gateway masuk.
- **4.67.4** — Chat group: visitor-list filter/search enhancement, unread badge di nav.
