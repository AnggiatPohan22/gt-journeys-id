# Phase 4.68.2 — Global Group Reorganization

> **Status:** ✅ Code selesai · ⏳ UAT (login CMS, verifikasi sidebar per role)
> **Scope:** Pure `admin.group` string change pada 6 globals. Zero schema, zero migration, zero access change.
> **Date:** 2026-10-08
> **Branch:** `feat/sidebar-cms-reorg-phase-4.68.1` (lanjutan commit)
> **Blueprint:** [phase-4.68](phase-4.68-sidebar-audit.md) §4 · lanjutan [phase-4.68.1](phase-4.68.1-collection-group-reorg.md)

## Perubahan

6 file di `apps/cms/src/globals/*.ts` — update `admin.group`:

| Global | Old → New |
|---|---|
| ChatWidgetSettings | Settings → **Chat & Messaging** |
| BlogSettings | Settings → **Blog** |
| PopupSettings | Settings → **Marketing** |
| SiteSettings | Settings → **System** |
| SiteFeatures | Settings → **System** |
| HomepageContent | Appearance → **Content & Pages** |

Global yang **tidak** disentuh (grup final sudah benar):
- HeaderSettings → Appearance
- FooterSettings → Appearance
- AnnouncementBar → Marketing
- PromoBanner → Marketing

Grup lama **Settings** otomatis hilang (tidak ada global lagi di sana).

## Sidebar penuh setelah 4.68.1 + 4.68.2 (super-admin view)

```
📊 Dashboard                       (link custom)

🧳 Bookings           → Bookings

🏖  Services          → Accommodations · Tours · Restaurants · Spa · Yachts
                       · FerryTickets · Rentals · Venues · WaterActivities

🗺  Destinations      → Destinations · DestinationTypes · Locations · ServiceTypes

📄 Content & Pages    → Pages · Testimonials · Categories · Media · Menus
                       · HomepageContent (global)

📰 Blog               → Posts · Authors · BlogCategories · Tags
                       · BlogSettings (global)

💬 Chat & Messaging   → ChatVisitors · ChatMessages · ChatBlockedEvents
                       · ChatWidgetSettings (global)

📣 Marketing          → NewsletterSubscribers
                       · AnnouncementBar · PromoBanner · PopupSettings (global)

🎨 Appearance         → HeaderSettings · FooterSettings (global)

⚙  System             → Users
                       · SiteSettings · SiteFeatures (global)
```

**9 grup total.** Chat Widget sekarang satu grup dengan data chat ✅. Bookings pisah grup sendiri ✅.

## Access / visibility — tidak berubah

Semua `admin.hidden` dipertahankan. Dampak visibility per role:

| Grup | Editor | Admin | Super-admin |
|---|---|---|---|
| Bookings | ✗ (hidden editor) | ✓ | ✓ |
| Services | ✓ | ✓ | ✓ |
| Destinations | ✓ (sebagian; taxonomies hidden editor) | ✓ | ✓ |
| Content & Pages | ✓ (Pages/Testimonials); HomepageContent hidden editor | ✓ | ✓ |
| Blog | ✓ (Posts/Tags/BlogCategories); BlogSettings hidden editor | ✓ | ✓ |
| Chat & Messaging | ✗ (semua hidden editor) → grup tersembunyi | ✓ | ✓ |
| Marketing | ✗ (semua hidden editor atau super-admin only) → grup tersembunyi | ✓ (sebagian; AnnouncementBar + PromoBanner super-admin only) | ✓ |
| Appearance | ✗ (hidden editor) → grup tersembunyi | ✓ | ✓ |
| System | ✗ (hidden editor + super-admin only) → grup tersembunyi | ✓ SiteSettings saja; Users + SiteFeatures super-admin only | ✓ |

## Non-impact

- ❌ Tidak ada schema change / migration.
- ❌ Tidak ada perubahan slug global → URL `/admin/globals/<slug>` tetap.
- ❌ Tidak ada perubahan access, fields, hooks, atau label.
- ❌ Tidak ada perubahan apps/web.

## File yang disentuh

```
apps/cms/src/globals/BlogSettings.ts
apps/cms/src/globals/ChatWidgetSettings.ts
apps/cms/src/globals/HomepageContent.ts
apps/cms/src/globals/PopupSettings.ts
apps/cms/src/globals/SiteFeatures.ts
apps/cms/src/globals/SiteSettings.ts
```

## Next step

- **4.68.3** — set `admin.order` eksplisit per grup (numerik 10/20/30…) agar urutan dalam grup deterministik dan grup-level order mengikuti domain priority (Bookings > Services > Destinations > …).
- **4.68.4** — review `nav-icons.css` untuk grup baru + mapping ikon per-item yang pindah grup.
- **4.68.5** — QA matrix per-role dengan screenshot.
