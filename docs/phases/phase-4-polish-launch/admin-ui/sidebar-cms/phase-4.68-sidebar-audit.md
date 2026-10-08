# Phase 4.68 — Sidebar CMS Audit & Reorganization Blueprint

> **Status:** 📋 Reported (audit + blueprint, belum eksekusi)
> **Scope:** Audit struktur sidebar admin Payload saat ini → usulan tata ulang grup `admin.group` agar scalable + userfriendly. **Tidak** mengubah schema, access, slug, atau route. Semua perubahan nanti = string `admin.group` + urutan `admin.order` + (opsional) label/breadcrumb.
> **Date:** 2026-10-08
> **Branch:** `feat/checkout-session-timer-phase-4.67.1` (audit saja — implementasi di task 4.68.1+)
> **Lanjutan dari:** [phase-4.36](phase-4.36-settings-sidebar-reorg.md), [phase-4.5](phase-4.5-sidebar-redesign.md), [phase-4.47](phase-4.47-sidebar-icons.md)

---

## 1. Ringkasan masalah (user complaint)

1. **Chat Widget tersebar di 2 tempat berbeda.**
   - `ChatWidgetSettings` (global config widget) → grup **Settings**
   - `ChatMessages` / `ChatVisitors` / `ChatBlockedEvents` (data operasional chat) → grup **Administration**
   - User harus bolak-balik dua grup untuk urus satu fitur yang sama.
2. **Bookings "nebeng" di Administration.**
   - Satu-satunya item transaksional di tengah grup serba-admin (Users, NewsletterSubscribers, Chat*).
   - Padahal roadmap: Bookings akan ekspansi besar (payments, refund, round-trip legs, driver dispatch, invoices, dll — lihat phase 4.67.x).
3. **Grup `Content` kebanyakan tipe campur** (page, testimonial, destinasi, taksonomi).
4. **Belum ada boundary jelas** antara **config** (Settings/Appearance/Marketing globals) vs **data** (collection operasional).

---

## 2. Snapshot sidebar saat ini (as-of 2026-10-08)

Diambil langsung dari `apps/cms/src/collections/*.ts` dan `apps/cms/src/globals/*.ts` (`admin.group`).

### Collections (data)

| Group | Items | Jumlah |
|---|---|---|
| **Content** | Pages, Authors, Categories, Destinations, DestinationTypes, Locations, ServiceTypes, Testimonials | 8 |
| **Posts** | Posts, Tags, BlogCategories | 3 |
| **Services** | Accommodations, Tours, Restaurants, Spa, Yachts, FerryTickets, Rentals, Venues, WaterActivities | 9 |
| **Site Builder** | Media, Menus | 2 |
| **Administration** | Bookings, Users, NewsletterSubscribers, ChatMessages, ChatVisitors, ChatBlockedEvents | 6 |

### Globals (config)

| Group | Items | Jumlah |
|---|---|---|
| **Settings** | SiteSettings, SiteFeatures, BlogSettings, PopupSettings, ChatWidgetSettings | 5 |
| **Appearance** | HeaderSettings, FooterSettings, HomepageContent | 3 |
| **Marketing** | AnnouncementBar, PromoBanner | 2 |

**Total 8 grup** (5 collection groups + 3 global groups) berisi **38 entri sidebar**.

### Diagnosis per-grup

| Grup | Diagnosis |
|---|---|
| Content | **Terlalu heterogen.** Campur page-marketing (Pages, Testimonials) + entity bisnis (Destinations) + taksonomi (Categories, DestinationTypes, Locations, ServiceTypes) + relasi blog (Authors). Authors seharusnya di Blog bareng Posts/Tags/BlogCategories. |
| Posts | OK secara isi, tapi label `Posts` ambigu dengan Pages. Lebih baik `Blog`. |
| Services | OK, 9 produk konsisten. Satu-satunya grup yg memang "jualan". |
| Site Builder | **Terlalu tipis** (2 item). Media & Menus adalah tooling publishing — bisa dilebur ke Content/Blog scope atau grup "Library". |
| Administration | **Overload & campur domain.** Bookings (transaksi) + Chat* (CRM/messaging) + Users (akses) + Newsletter (marketing). Empat domain berbeda. |
| Settings | **Chat Widget nyasar di sini** (seharusnya satu domain dgn Chat*). Popup Settings juga lebih relevan ke Marketing. |
| Appearance | OK (header, footer, homepage fallback). |
| Marketing | Terlalu kecil (2 item) + logis-nya lebih luas (bisa menampung Popup, Newsletter, Testimonials). |

---

## 3. Prinsip desain usulan

Target: **scalable, userfriendly, prediktif.**

1. **Satu fitur = satu grup.** Jangan pisah config + data suatu domain ke dua grup berbeda. Contoh: Chat Widget config + Chat Messages harus sekelompok.
2. **Grup berdasarkan _mental model_ user, bukan jenis Payload (collection vs global).** Owner tidak peduli apakah sesuatu itu `collection` atau `global`.
3. **Domain yang akan tumbuh dapat grup sendiri.** Bookings jelas akan ekspansi (payments, legs, refunds) → grup sendiri sekarang, meski awalnya cuma 1-2 item.
4. **Max ±8 item per grup.** Lebih dari itu susah di-scan. Lebih dari 10 → split taksonomi ke grup child/subgroup pakai `admin.order`.
5. **Taksonomi dekat dengan entitas yang mereka klasifikasikan,** bukan di grup "Content" generik.
6. **Config global** untuk suatu domain berada di **grup yang sama** dengan datanya (chat widget bareng chat; blog settings bareng posts/tags; dst).
7. **Order yang konsisten:** domain yang paling sering dipakai di atas (Dashboard → Bookings → Services → Content). Admin-ish & setting-ish di bawah.

---

## 4. Usulan struktur baru (blueprint)

**9 grup final** (vs 8 sekarang; Bookings pecah dari Administration, Chat merge ke 1 grup, Content pecah).

```
📊 Dashboard                        (link custom existing)

🧳 Bookings            ← BARU, pecah dari Administration
   • Bookings
   • (future: Payments, Invoices, Refunds, Dispatch, Legs, …)

🏖  Services                         (tetap, 9 item)
   • Tours · Accommodations · Restaurants · Spa · Yachts
   • Ferry Tickets · Rentals · Venues · Water Activities

🗺  Destinations        ← pecah dari Content
   • Destinations
   • Destination Types
   • Locations
   • Service Types

📄 Content & Pages      ← ramping dari Content lama
   • Pages
   • Testimonials
   • Media                 ← pindah dari Site Builder
   • Menus                 ← pindah dari Site Builder
   • Homepage Fallback     ← pindah dari Appearance (konteks konten homepage)

📰 Blog                 ← rename dari Posts, isi lebih lengkap
   • Posts
   • Authors               ← pindah dari Content
   • Blog Categories
   • Tags
   • Blog Settings         ← pindah dari Settings (config domain blog)

💬 Chat & Messaging     ← MERGE: config + data chat
   • Chat Widget           ← pindah dari Settings
   • Chat Visitors
   • Chat Messages
   • Chat Blocked Events

📣 Marketing            ← diperluas
   • Announcement Bar
   • Promo Banner
   • Popup Settings        ← pindah dari Settings
   • Newsletter Subscribers ← pindah dari Administration

🎨 Appearance                        (tetap, 2 item)
   • Header Settings
   • Footer Settings
   (Homepage Fallback pindah ke Content & Pages — lihat atas)

⚙  System                ← rename dari Administration (sekarang murni platform)
   • Users
   • Site Settings         ← pindah dari Settings
   • Site Features         ← pindah dari Settings (super-admin only)
```

### Rekap pergerakan (28 perubahan grup)

| Item | Dari | Ke |
|---|---|---|
| Bookings | Administration | **Bookings** |
| ChatWidgetSettings | Settings | **Chat & Messaging** |
| ChatVisitors | Administration | Chat & Messaging |
| ChatMessages | Administration | Chat & Messaging |
| ChatBlockedEvents | Administration | Chat & Messaging |
| NewsletterSubscribers | Administration | **Marketing** |
| PopupSettings | Settings | Marketing |
| Users | Administration | **System** |
| SiteSettings | Settings | System |
| SiteFeatures | Settings | System |
| Authors | Content | **Blog** |
| BlogSettings | Settings | Blog |
| Destinations | Content | **Destinations** |
| DestinationTypes | Content | Destinations |
| Locations | Content | Destinations |
| ServiceTypes | Content | Destinations |
| Media | Site Builder | **Content & Pages** |
| Menus | Site Builder | Content & Pages |
| HomepageContent | Appearance | Content & Pages |
| Pages | Content | Content & Pages (rename grup) |
| Testimonials | Content | Content & Pages |

Grup **Site Builder** & grup lama **Administration** dibubarkan.

### Jumlah item per grup setelah reorg

| Grup | # | Catatan skalabilitas |
|---|---|---|
| Bookings | 1 (sekarang) → 5-6 (roadmap) | ruang luas untuk payments/legs/refunds |
| Services | 9 | sudah mendekati ceiling 10; kalau tambah lagi → sub-group `Tours & Trips` vs `Stay & Dining` |
| Destinations | 4 | taksonomi geografi — stabil |
| Content & Pages | 5 | pages + support content |
| Blog | 5 | semua yang berkaitan artikel |
| Chat & Messaging | 4 | satu domain penuh |
| Marketing | 4 | semua broadcast/engagement |
| Appearance | 2 | tetap kecil (header+footer) — OK karena fokus |
| System | 3 | platform / super-admin |

---

## 5. Analisa trade-off & alternatif yang ditolak

| Opsi dipertimbangkan | Hasil |
|---|---|
| **Pisah "Posts" dari "Blog Settings"** (biarkan Settings tetap punya blog-settings) | ❌ meninggalkan jejak chat-widget problem yang sama. User harus tetap buka 2 grup. |
| **Satu grup "Operations" untuk Bookings + Chat + Newsletter** | ❌ campur domain lagi (sama seperti Administration sekarang). Bookings terlalu penting untuk digabung. |
| **"Taxonomy" grup terpisah (Categories, Tags, Destination Types, Service Types, Locations)** | ❌ ownernya terbagi (destination-types tak relate ke blog-categories). Lebih baik taksonomi dekat entitasnya. |
| **Hilangkan grup Appearance; sebar ke Content/System** | ❌ header & footer secara mental = "tampilan global" — grup tersendiri lebih prediktif. |
| **Satu grup giant "CMS Config"** menampung semua global | ❌ regresi ke problem phase 4.36 (satu grup gemuk). |

---

## 6. Dampak RBAC & visibility

Reorg ini **murni string `admin.group`** — zero perubahan `access` / `hidden`. Semua rule RBAC existing tetap. Konsekuensi visibility per role (sudah dicek per-collection dari file source):

- **Editor:** tetap tak lihat grup `System`, `Appearance`, `Chat & Messaging` (semua item di dalamnya `hidden` dari editor). Yang terlihat: Bookings (sesuai akses), Services, Destinations, Content & Pages, Blog, Marketing (sebagian).
- **Admin:** lihat semua kecuali `System → Site Features` (super-admin only) & bagian Marketing yang super-admin only (Announcement, Promo).
- **Super-admin:** lihat semua, 9 grup.

> ⚠️ **Validasi wajib di implementasi 4.68.1:** untuk setiap item yang pindah grup, pastikan `admin.hidden` lama masih valid di konteks grup baru. Contoh: ChatWidgetSettings sekarang di Settings dgn `hidden: editor` — ketika pindah ke Chat & Messaging (yang item lain juga `hidden: editor`), grup kosong untuk editor → otomatis tersembunyi oleh Payload. OK, no regression.

---

## 7. Risiko

| Risiko | Mitigasi |
|---|---|
| Owner/editor hafal lokasi lama (muscle memory) | Umumkan di changelog + mention pindahan di PR body. Rilis bareng (satu phase 4.68.1) supaya tidak dua kali bingung. |
| Grup Bookings sekarang cuma 1 item, kelihatan sepi | OK, by design — menyediakan slot untuk ekspansi. Alternatif: tunda pecah sampai item ke-2 ada. **Rekomendasi: pecah sekarang** karena roadmap 4.67.x sudah menandakan beberapa anak-collection akan menyusul dalam fase dekat. |
| `admin.order` default = ikut urutan import → urutan grup di sidebar tak terkendali | Set `admin.group`+`admin.order` **eksplisit** di setiap collection/global saat implementasi, dengan `order` numerik berurutan (10, 20, 30…). |
| Icon sidebar (phase 4.47) perlu disesuaikan ke item yang pindah grup | Review `apps/cms/src/admin/styles/nav-icons.css` di 4.68.1 — pastikan selector `href$='/collections/<slug>'` masih benar (slug tidak berubah → icon aman). Icon per **grup** (kalau ada) perlu di-remap. |

---

## 8. Roadmap implementasi (next tasks)

Audit ini **tidak** mengubah kode. Eksekusi dibagi ke sub-task supaya PR kecil & reversible:

| Task | Deliverable | File yang disentuh |
|---|---|---|
| **4.68.1** — Reorg collection groups | Pindah `admin.group` untuk 11 collection sesuai tabel §4 | `apps/cms/src/collections/*.ts` (Bookings, Chat*, Users, Newsletter, Authors, Destinations, DestinationTypes, Locations, ServiceTypes, Media, Menus) |
| **4.68.2** — Reorg global groups | Pindah `admin.group` untuk 7 global | `apps/cms/src/globals/*.ts` (ChatWidget, BlogSettings, PopupSettings, SiteSettings, SiteFeatures, HomepageContent) |
| **4.68.3** — Set `admin.order` eksplisit per grup | Numerik 10/20/30… tiap collection & global | Semua file di atas |
| **4.68.4** — Icon audit grup baru | Verify `nav-icons.css` tetap akurat untuk grup baru + tambah ikon grup `Bookings`, `Chat & Messaging`, `Destinations`, `Blog`, `System` jika pakai per-group styling | `apps/cms/src/admin/styles/nav-icons.css` |
| **4.68.5** — QA matrix per role | Login sebagai editor / admin / super-admin → screenshot sidebar → bandingkan dgn blueprint §4 | docs/phases |

Setiap sub-task punya phase report sendiri sesuai AGENTS.md §14.

---

## 9. Approval needed (sebelum 4.68.1 dieksekusi)

- [ ] Owner setuju 9-grup blueprint di §4.
- [ ] Owner setuju Bookings pecah **sekarang** (vs tunggu anak-collection pertama).
- [ ] Owner setuju Homepage Fallback pindah dari Appearance → Content & Pages. (Alternatif: tetap di Appearance — tolong konfirmasi.)
- [ ] Owner setuju Site Settings & Site Features pindah ke grup **System** (bukan tetap "Settings"). Rename ini tujuannya memperjelas bahwa isi grup = platform-wide / akses — tidak lagi "misc config".

> Setelah approval, buka task **4.68.1** untuk mulai mindahkan `admin.group` collection.

---

## 10. Appendix — current full mapping (reference)

Dirender dari grep langsung ke source (bukan dokumentasi lama). Timestamp: 2026-10-08.

### Collections

```
Accommodations        → Services
Authors               → Content
BlogCategories        → Posts
Bookings              → Administration
Categories            → Content
ChatBlockedEvents     → Administration
ChatMessages          → Administration
ChatVisitors          → Administration
DestinationTypes      → Content
Destinations          → Content
FerryTickets          → Services
Locations             → Content
Media                 → Site Builder
Menus                 → Site Builder
NewsletterSubscribers → Administration
Pages                 → Content
Posts                 → Posts
Rentals               → Services
Restaurants           → Services
ServiceTypes          → Content
Spa                   → Services
Tags                  → Posts
Testimonials          → Content
Tours                 → Services
Users                 → Administration
Venues                → Services
WaterActivities       → Services
```

### Globals

```
AnnouncementBar       → Marketing
BlogSettings          → Settings
ChatWidgetSettings    → Settings
FooterSettings        → Appearance
HeaderSettings        → Appearance
HomepageContent       → Appearance
PopupSettings         → Settings
PromoBanner           → Marketing
SiteFeatures          → Settings
SiteSettings          → Settings
```

> Catatan: `Categories` masih di grup Content tapi di app praktis dipakai Posts. Di blueprint §4 ia implisit ikut Blog kalau benar-benar blog-only; kalau Categories juga dipakai Services/Destinations, biarkan di Content & Pages. **Perlu konfirmasi owner** — kalau Categories = blog saja, pindah ke Blog; kalau multi-domain, biarkan di Content & Pages.

---

**End of audit — awaiting approval sebelum task 4.68.1.**
