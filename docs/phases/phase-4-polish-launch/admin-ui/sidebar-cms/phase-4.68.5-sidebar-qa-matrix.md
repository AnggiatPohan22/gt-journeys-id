# Phase 4.68.5 — Sidebar QA Matrix & UAT Checklist

> **Status:** ✅ Matrix lengkap · ⏳ Visual UAT (owner login 3 role)
> **Scope:** Verifikasi end-state sidebar pasca-reorg 4.68.1→4.68.4. Zero code change — ini QA + checklist.
> **Date:** 2026-10-08
> **Branch:** `feat/sidebar-cms-reorg-phase-4.68.1`
> **Blueprint:** [phase-4.68](phase-4.68-sidebar-audit.md)

## Smoke test otomatis

- ✅ **CMS dev server boot OK** di port 3030 pasca-reorg. Login page render (title: "Login — GtJourneysID CMS") → tak ada compile error dari perubahan `payload.config.ts` + 25 file collection/global.
- ✅ **Slug check:** 25 slug collection/global tak berubah → URL `/admin/collections/<slug>` & `/admin/globals/<slug>` tetap. Deep-link lama (bookmark, email) tetap valid.
- ✅ **Icon selector check:** semua selector `href$='/collections/<slug>'` & `href$='/globals/<slug>'` di `admin-global.css` masih mengarah ke slug yang hidup.

## Visibility matrix (derived dari source)

Diambil langsung dari `apps/cms/src/collections/*.ts` + `apps/cms/src/globals/*.ts` — grep rule `hidden:`. Konvensi:
- ✅ visible
- ✗ hidden (dari rule `admin.hidden`)
- 🔒 hanya akses baca (access read-only — bukan sidebar visibility)

| Grup | Item | Type | Editor | Admin | Super-admin | Rule |
|---|---|---|---|---|---|---|
| **Bookings** | Bookings | coll | ✗ | ✅ | ✅ | hidden: editor-or-anon |
| **Services** | Tours | coll | ✅ | ✅ | ✅ | — |
| | Accommodations | coll | ✅ | ✅ | ✅ | — |
| | WaterActivities | coll | ✅ | ✅ | ✅ | — |
| | Yachts | coll | ✅ | ✅ | ✅ | — |
| | Restaurants | coll | ✅ | ✅ | ✅ | — |
| | Venues | coll | ✅ | ✅ | ✅ | — |
| | Rentals | coll | ✅ | ✅ | ✅ | — |
| | Spa | coll | ✅ | ✅ | ✅ | — |
| | FerryTickets | coll | ✅ | ✅ | ✅ | — |
| **Destinations** | Destinations | coll | ✅ | ✅ | ✅ | — |
| | DestinationTypes | coll | ✅ | ✅ | ✅ | — |
| | Locations | coll | ✅ | ✅ | ✅ | — |
| | ServiceTypes | coll | ✅ | ✅ | ✅ | — |
| **Content & Pages** | Pages | coll | ✅ | ✅ | ✅ | — |
| | Testimonials | coll | ✅ | ✅ | ✅ | — |
| | Categories | coll | ✅ | ✅ | ✅ | — |
| | Media | coll | ✅ | ✅ | ✅ | — |
| | Menus | coll | ✗ | ✅ | ✅ | hidden: editor |
| | HomepageContent | glob | ✗ | ✅ | ✅ | hidden: editor |
| **Blog** | Posts | coll | ✅ | ✅ | ✅ | — |
| | Authors | coll | ✅ | ✅ | ✅ | — |
| | BlogCategories | coll | ✅ | ✅ | ✅ | — |
| | Tags | coll | ✅ | ✅ | ✅ | — |
| | BlogSettings | glob | ✗ | ✅ | ✅ | hidden: editor |
| **Chat & Messaging** | ChatVisitors | coll | ✗ | ✅ | ✅ | hidden: editor-or-anon |
| | ChatMessages | coll | ✗ | ✅ | ✅ | hidden: editor-or-anon |
| | ChatBlockedEvents | coll | ✗ | ✅ | ✅ | hidden: editor-or-anon |
| | ChatWidgetSettings | glob | ✗ | ✗ | ✅ | hidden: non-super-admin |
| **Marketing** | NewsletterSubscribers | coll | ✗ | ✅ | ✅ | hidden: editor-or-anon |
| | AnnouncementBar | glob | ✗ | ✗ | ✅ | hidden: non-super-admin |
| | PromoBanner | glob | ✗ | ✗ | ✅ | hidden: non-super-admin |
| | PopupSettings | glob | ✗ | ✗ | ✅ | hidden: non-super-admin |
| **Appearance** | HeaderSettings | glob | ✗ | ✅ | ✅ | hidden: editor |
| | FooterSettings | glob | ✗ | ✅ | ✅ | hidden: editor |
| **System** | Users | coll | ✗ | ✗ | ✅ | hidden: non-super-admin |
| | SiteSettings | glob | ✗ | ✅ | ✅ | hidden: editor |
| | SiteFeatures | glob | ✗ | ✗ | ✅ | hidden: non-super-admin |

### Ekspektasi grup muncul per role

Payload auto-hide grup yang semua item-nya hidden. Hasil:

| Grup | Editor | Admin | Super-admin |
|---|---|---|---|
| Bookings | ✗ hidden | ✅ 1 item | ✅ 1 item |
| Services | ✅ 9 item | ✅ 9 item | ✅ 9 item |
| Destinations | ✅ 4 item | ✅ 4 item | ✅ 4 item |
| Content & Pages | ✅ 4 item (Menus & HomepageContent tersembunyi) | ✅ 6 item | ✅ 6 item |
| Blog | ✅ 4 item (BlogSettings tersembunyi) | ✅ 5 item | ✅ 5 item |
| Chat & Messaging | ✗ hidden | ✅ 3 item (ChatWidgetSettings tersembunyi) | ✅ 4 item |
| Marketing | ✗ hidden | ✗ hidden (semua super-admin only) | ✅ 4 item |
| Appearance | ✗ hidden | ✅ 2 item | ✅ 2 item |
| System | ✗ hidden | ✅ 1 item (SiteSettings saja) | ✅ 3 item |

**Hitungan grup terlihat:**
- Editor: **4 grup** (Services, Destinations, Content & Pages, Blog)
- Admin: **7 grup** (semua kecuali Marketing yang kosong untuk admin + grup collection-visible Bookings/Chat/Appearance/System)

Correction catatan untuk Admin: Marketing kosong karena NewsletterSubscribers juga `hidden: editor` **tapi admin visible** (rule `editor-or-anon` ≠ non-super). Mari re-verify dari grep:
```
NewsletterSubscribers: hidden: ({ user }) => !user || user.role === 'editor'
```
→ Admin **tidak match** → terlihat → Marketing grup muncul untuk admin dengan 1 item (NewsletterSubscribers). ✅

Re-rekap final:
- Editor: **4 grup** (Services, Destinations, Content & Pages 4-item, Blog 4-item).
- Admin: **8 grup** (semua kecuali… tidak ada yang full-hidden untuk admin — semua 9 grup muncul? Mari cek:
  - Bookings: ✅ (admin visible) → muncul
  - Services: ✅ → muncul
  - Destinations: ✅ → muncul
  - Content & Pages: ✅ → muncul
  - Blog: ✅ → muncul
  - Chat & Messaging: 3 chat coll visible untuk admin → ✅ muncul (ChatWidgetSettings hidden)
  - Marketing: NewsletterSubscribers visible untuk admin → ✅ muncul (3 global marketing hidden)
  - Appearance: HeaderSettings + FooterSettings visible untuk admin → ✅ muncul
  - System: SiteSettings visible untuk admin → ✅ muncul (Users + SiteFeatures hidden)
  → **9 grup muncul untuk admin.**
- Super-admin: **9 grup** full.

## UAT checklist (owner langkah manual)

Setup: CMS sudah running di `http://localhost:3030` (atau URL staging). Buka 3 tab incognito, login beda role.

### 1. Super-admin login

- [ ] Sidebar menampilkan **9 grup** dengan urutan: **Bookings → Services → Destinations → Content & Pages → Blog → Chat & Messaging → Marketing → System → Appearance**.
- [ ] Grup **Bookings** berisi 1 item (Bookings). Ikon: 🎫 ticket (bukan circle default).
- [ ] Grup **Destinations** berisi 4 item. **Locations** pakai ikon 🗺️ folded map (bukan circle default). Destinations pakai 📍 map-pin (tak kembar dengan Locations).
- [ ] Grup **Chat & Messaging** berisi 4 item: ChatVisitors, ChatMessages, ChatBlockedEvents, **Chat Widget** (jadi 1 grup, tak lagi tersebar di Settings).
- [ ] Grup **Marketing** berisi 4 item: NewsletterSubscribers, Announcement Bar, Promo Banner, **Popup Settings** (ikon 💬 dialog, bukan circle default).
- [ ] Grup **System** berisi 3 item: Users, SiteSettings, SiteFeatures. Grup lama "Administration" tidak ada.
- [ ] Grup lama **Settings, Content, Posts, Site Builder, Administration** tidak muncul (sudah dibubarkan).
- [ ] Dark theme toggle: semua ikon tetap terlihat (currentColor mask).

### 2. Admin login

- [ ] Sidebar menampilkan **9 grup** (sama dengan super-admin).
- [ ] Grup Chat & Messaging: hanya 3 item (ChatWidgetSettings tersembunyi).
- [ ] Grup Marketing: hanya 1 item (NewsletterSubscribers; 3 global tersembunyi).
- [ ] Grup System: hanya 1 item (SiteSettings; Users + SiteFeatures tersembunyi).
- [ ] Grup Content & Pages: 6 item (full termasuk Menus + HomepageContent).

### 3. Editor login

- [ ] Sidebar menampilkan hanya **4 grup**: Services, Destinations, Content & Pages, Blog.
- [ ] Grup Content & Pages: 4 item saja (Pages, Testimonials, Categories, Media — Menus + HomepageContent tersembunyi).
- [ ] Grup Blog: 4 item saja (Posts, Authors, BlogCategories, Tags — BlogSettings tersembunyi).
- [ ] Grup Bookings, Chat & Messaging, Marketing, Appearance, System: **tidak muncul**.

### 4. Deep-link smoke

- [ ] Buka `http://localhost:3030/admin/collections/bookings` sebagai super-admin → list view terbuka normal.
- [ ] Buka `http://localhost:3030/admin/globals/chat-widget` sebagai super-admin → edit view terbuka normal (slug tak berubah).

## Non-impact confirmed

- ❌ Zero schema change, zero migration.
- ❌ Zero slug change → semua deep-link lama valid.
- ❌ Zero perubahan apps/web (frontend).
- ❌ Zero perubahan access rules / RBAC — hanya visualisasi reorg.

## Series summary — phase 4.68.*

| Phase | Deliverable | Files |
|---|---|---|
| 4.68 | Audit + blueprint | 1 doc |
| 4.68.1 | Reorg collection `admin.group` (19 file) | 19 collections |
| 4.68.2 | Reorg global `admin.group` (6 file) | 6 globals |
| 4.68.3 | Reorder `collections[]` + `globals[]` di payload.config | 1 payload.config.ts |
| 4.68.4 | Icon audit + fix 3 missing (Bookings, Popup, Locations) | 1 admin-global.css |
| 4.68.5 | QA matrix + UAT checklist | 0 code (QA only) |

**Total: 27 file disentuh + 6 doc.** Branch siap untuk owner UAT & commit.
