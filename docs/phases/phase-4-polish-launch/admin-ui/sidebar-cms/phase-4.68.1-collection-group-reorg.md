# Phase 4.68.1 — Collection Group Reorganization

> **Status:** ✅ Code selesai · ⏳ UAT (login CMS, verifikasi sidebar per role)
> **Scope:** Pure `admin.group` string change pada 19 collection. Zero schema, zero migration, zero access change.
> **Date:** 2026-10-08
> **Branch:** `feat/sidebar-cms-reorg-phase-4.68.1`
> **Blueprint:** [phase-4.68](phase-4.68-sidebar-audit.md) §4

## Perubahan

19 file di `apps/cms/src/collections/*.ts` — update `admin.group`:

| Collection | Old → New |
|---|---|
| Bookings | Administration → **Bookings** |
| ChatBlockedEvents | Administration → **Chat & Messaging** |
| ChatMessages | Administration → **Chat & Messaging** |
| ChatVisitors | Administration → **Chat & Messaging** |
| Users | Administration → **System** |
| NewsletterSubscribers | Administration → **Marketing** |
| Authors | Content → **Blog** |
| Destinations | Content → **Destinations** |
| DestinationTypes | Content → **Destinations** |
| Locations | Content → **Destinations** |
| ServiceTypes | Content → **Destinations** |
| Media | Site Builder → **Content & Pages** |
| Menus | Site Builder → **Content & Pages** |
| Pages | Content → **Content & Pages** |
| Testimonials | Content → **Content & Pages** |
| Categories | Content → **Content & Pages** |
| Posts | Posts → **Blog** |
| BlogCategories | Posts → **Blog** |
| Tags | Posts → **Blog** |

Collection yang **tidak** disentuh (9 Services + sudah di grup final):
Accommodations, Tours, Restaurants, Spa, Yachts, FerryTickets, Rentals, Venues, WaterActivities — tetap grup `Services`.

## Hasil snapshot sidebar collections (super-admin view)

| Grup | Items (count) |
|---|---|
| Bookings | 1 |
| Services | 9 |
| Destinations | 4 (Destinations, DestinationTypes, Locations, ServiceTypes) |
| Content & Pages | 5 (Pages, Testimonials, Categories, Media, Menus) |
| Blog | 5 (Posts, Authors, BlogCategories, Tags, + BlogSettings akan masuk di 4.68.2) |
| Chat & Messaging | 3 (ChatVisitors, ChatMessages, ChatBlockedEvents) + ChatWidget di 4.68.2 |
| Marketing | 1 (NewsletterSubscribers) + 3 global menyusul di 4.68.2 |
| System | 1 (Users) + 2 global menyusul di 4.68.2 |

Grup `Administration`, `Content`, `Posts`, `Site Builder` lama **otomatis hilang** (tidak ada item lagi).

## Access / visibility — tidak berubah

Semua `access` dan `admin.hidden` dipertahankan apa adanya. Dampak per role:

- **Editor:** masih tidak bisa akses item-item admin (Users, Chat*, Bookings, Newsletter) — `hidden: ({ user }) => user?.role === 'editor'` tetap di file. Grup `System`, `Chat & Messaging`, `Bookings` akan kosong untuk editor → Payload sembunyikan otomatis.
- **Admin:** lihat semua kecuali `Users` (super-admin only — `hidden: ({ user }) => user?.role !== 'super-admin'` tetap). Grup `System` kosong untuk admin → tersembunyi otomatis.
- **Super-admin:** lihat 8 grup collection penuh.

## Non-impact

- ❌ Tidak ada schema change / migration.
- ❌ Tidak ada perubahan slug → semua URL `/admin/collections/<slug>` tetap.
- ❌ Tidak ada perubahan `access`, `hooks`, `fields`, atau label.
- ❌ Tidak ada perubahan apps/web (frontend) — grup sidebar admin-only.
- ❌ Tidak sentuh ikon sidebar (nav-icons.css) — selector `href$='/collections/<slug>'` masih valid karena slug tak berubah. Review ikon per-grup dilakukan di 4.68.4.

## File yang disentuh

```
apps/cms/src/collections/Authors.ts
apps/cms/src/collections/BlogCategories.ts
apps/cms/src/collections/Bookings.ts
apps/cms/src/collections/Categories.ts
apps/cms/src/collections/ChatBlockedEvents.ts
apps/cms/src/collections/ChatMessages.ts
apps/cms/src/collections/ChatVisitors.ts
apps/cms/src/collections/Destinations.ts
apps/cms/src/collections/DestinationTypes.ts
apps/cms/src/collections/Locations.ts
apps/cms/src/collections/Media.ts
apps/cms/src/collections/Menus.ts
apps/cms/src/collections/NewsletterSubscribers.ts
apps/cms/src/collections/Pages.ts
apps/cms/src/collections/Posts.ts
apps/cms/src/collections/ServiceTypes.ts
apps/cms/src/collections/Tags.ts
apps/cms/src/collections/Testimonials.ts
apps/cms/src/collections/Users.ts
```

## Next step

- **4.68.2** — reorg `admin.group` untuk 10 globals (ChatWidget, BlogSettings, PopupSettings, SiteSettings, SiteFeatures, HomepageContent + 4 lain yang tetap).
- **4.68.3** — set `admin.order` eksplisit per grup supaya urutan sidebar deterministik.
- **4.68.4** — review `nav-icons.css` untuk grup baru.
- **4.68.5** — QA matrix per-role (editor / admin / super-admin) dengan screenshot.
