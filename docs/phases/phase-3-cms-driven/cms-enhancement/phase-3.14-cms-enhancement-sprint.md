# Phase 3.14–3.19: CMS Enhancement Sprint

**Status:** ✅ Complete (semua sprint ✅) · frontend build verified (76 pages) · beberapa manual test butuh login CMS
**Timeline:** 2026-08-19 → 2026-08-20
**Depends on:** [Phase 3 — CMS-Driven](phase-3-cms-driven.md)

## Tujuan

Sprint terfokus untuk membuat services **fully manageable** oleh client: merapikan
sidebar admin (role-based visibility), seed konten demo lengkap, memindahkan metadata
service ke CMS collection (`ServiceTypes`), WhatsApp per-service (nomor + template),
Testimonials block dari collection, dan Admin Dashboard overview.

## Sprint Ringkasan

Report lengkap: [`sprint-cms-enhancement.md`](../reports/sprint-cms-enhancement.md)

```
Sprint 0  Technical Prerequisites ..... ✅  (schema sync + build 76 pages OK)
Sprint 1  Sidebar Reorganization ....... ✅  → Phase 3.14.1–3.14.3
Sprint 2  Seed Content & Testing ....... ✅  → Phase 3.14.4–3.14.5
Sprint 3  Service Management ........... ✅  → Phase 3.15–3.16 (ServiceTypes collection)
Sprint 4  Quick Wins .................. ✅  → Phase 3.16–3.19 (WA per-service, Testimonials collection, Dashboard)

Verifikasi akhir: pnpm --filter @dn-journeys/web build → 76 pages, Complete! (no error)
Pending manual (perlu login CMS): CRUD UI per role, visual dashboard, set WA number per service
```

## Status Detail per Sub-task

| Sub-phase | Nama | Status |
|-----------|------|--------|
| 3.14 | CMS Admin UX Restructure + Demo Content Seeding | ✅ code · manual admin-login test pending |
| 3.15 | ServiceTypes CMS Collection (Task 3.2) | ✅ |
| 3.16 | Wire ServiceTypes ke Consumer (Task 3.3) | ✅ |
| 3.17 | WhatsApp Deep Integration (template + variables) | ✅ |
| 3.18 | Testimonials: Block dari Collection | ✅ |
| 3.19 | Admin Dashboard Overview | ✅ code · visual post-login pending |

---

## Phase 3.14 — CMS Admin UX Restructure + Demo Content Seeding ✅ DONE

Merapikan sidebar admin (role-based visibility + regrouping + ordering) supaya client
(role admin) hanya melihat menu yang relevan, plus seed konten demo lengkap.

### 3.14.1 Role-based sidebar visibility (`admin.hidden`) ✅ DONE
- [x] Roles dikonfirmasi: `editor` / `admin` / `super-admin` — 2026-08-19
- [x] `Users` — hidden untuk non super-admin — 2026-08-19
- [x] `Menus` — hidden untuk editor (admin+ visible) — 2026-08-19
- [x] Globals SiteSettings, HeaderSettings, FooterSettings, HomepageContent — hidden untuk editor — 2026-08-19
- [x] Global SiteFeatures — hidden untuk non super-admin — 2026-08-19
- [x] `admin.hidden` HANYA sembunyikan dari sidebar UI — access control tetap enforce di API — 2026-08-19

### 3.14.2 Admin access update ✅ DONE
- [x] SiteSettings, HeaderSettings, FooterSettings — `access.update` dari `isSuperAdmin` → `isAdmin` (client bisa adjust brand/kontak/nav/footer). Editor tetap tidak bisa — 2026-08-19

### 3.14.3 Sidebar group restructure + ordering ✅ DONE
- [x] Payload 3.x TIDAK support custom nav icon bawaan — di-skip — 2026-08-19
- [x] Group baru: Content / Services / Site Builder / Administration / Settings — 2026-08-19
- [x] Pindah: Pages→Content, Media→Site Builder, Menus→Site Builder, Users→Administration, globals→Settings — 2026-08-19
- [x] Ordering via urutan registrasi di payload.config.ts — 2026-08-19

### 3.14.4 Demo content seed — main pages ✅ DONE
- [x] `seed-demo-content.ts` + `pnpm seed:demo` — 5 pages: home, about, contact, privacy-policy, terms — 2026-08-19
- [x] Home: Hero + ValuePropsBanner + 3× ServiceGrid + StatsBanner + TestimonialsCarousel + CTA — 2026-08-19
- [x] About: Hero + RichText + StatsBanner + TestimonialsCarousel + CTA; Contact: Hero + Contact + CTA; Privacy/Terms: RichText legal copy — 2026-08-19
- [x] Semua page published, idempotent (upsert by slug), travel-themed — 2026-08-19

### 3.14.5 Service landing pages repair + Explore Bali ✅ DONE
- [x] **Bug ditemukan**: landing pages tour/yacht/restaurant/rental/water-activity/venue kehilangan blok `serviceListing` (hanya trustBadges tersisa). Kemungkinan ter-wipe saat nuclear-reset; hanya /villa lengkap. Data records utuh — 2026-08-19
- [x] `seed-service-landing-content.ts` + `pnpm seed:landing` — re-seed 6 landing (hero-immersive mirror /villa) + trustBadges. NO schema change (data only) — 2026-08-19
- [x] Page baru `explore-bali` — Hero + ValuePropsBanner + 4× ServiceGrid + StatsBanner + CTA. Nav item "Explore Bali" after Home — 2026-08-19
- [x] Script verifikasi in-line: konfirmasi serviceListing ter-persist di 6 page — 2026-08-19

### 3.14.6 Homepage SEO title fix ✅ DONE
- [x] `index.astro` — pageTitle homepage CMS-driven pakai `seo.metaTitle ?? title` — 2026-08-19

### Manual Test Log — Phase 3.14 (frontend rendering, desktop + mobile 375px, zero console errors)
```
  [x] /                → 8 blocks, title = metaTitle (fixed), links functional
  [x] /about           → 5 blocks
  [x] /contact         → 3 blocks (kontak placeholder SiteSettings — expected)
  [x] /privacy-policy  → RichText full copy
  [x] /terms           → RichText full copy
  [x] /tour            → serviceListing 4 tours + trustBadges + pagination
  [x] /yacht           → serviceListing 5 yachts + trustBadges + pagination
  [x] /restaurant      → 4 restaurants + pagination
  [x] /rental          → 4 rentals + pagination
  [x] /water-activity  → 4 activities + pagination
  [x] /venue           → 5 venues + pagination (mobile page-click 3+2)
  [x] /explore-bali    → hero + 4 serviceGrids (12 cards) + stats + CTA
  [x] /villa (regression) → lengkap, mobile cards 327px swipe
```

**Known follow-ups (Phase 4 backlog):**
- [ ] Hero background image landing pages di-assign arbitrer (mis. /yacht foto motor) → client upload & assign per page di CMS
- [ ] RichText privacy/terms: section heading render sebagai paragraph biasa (seed helper cuma emit paragraph) → format di CMS atau upgrade helper
- [x] SiteSettings kontak + map embed — ✅ terisi & diverifikasi 2026-08-23 (lihat [Phase 4](phase-4-polish-launch.md))
- [ ] Manual test admin panel: login role `admin` & `editor` → verify sidebar visibility matrix (butuh CMS restart)

**Pending — butuh CMS restart untuk apply group/hidden/access:**
- [ ] Restart `pnpm dev` di apps/cms → verify sidebar groups + role visibility + admin bisa edit SiteSettings/Header/Footer

---

## Phase 3.15 — ServiceTypes CMS Collection (Task 3.2) ✅ DONE

Memindahkan METADATA 7 service vertical dari hardcoded `config/modules.ts` ke CMS
collection `service-types` — client bisa adjust label/ikon/urutan/deskripsi/hero/WA/SEO
tanpa deploy. Scope "metadata editable" (7 tipe tetap fixed, schema listing tidak berubah).

### Task 3.1 — Investigation ✅ DONE
- [x] Konfirmasi: service TYPES hardcoded di 6 lapisan (config/modules.ts, lib/features.ts, SiteFeatures, block serviceType select ×2, Categories.module, lib/payload getters). Service LISTINGS di 7 collection terpisah. TIDAK ada collection "Services" sebelumnya — 2026-08-19
- [x] Keputusan user: "Metadata editable (recommended)" — 2026-08-19

### 3.15.1 CMS collection ✅ DONE
- [x] `ServiceTypes.ts` — name, slug (auto), key (select 7 fixed super-admin-only), status, order, description, iconName, coverImage, whatsappNumber, whatsappTemplate, metaTitle, metaDescription. Group Content — 2026-08-19
- [x] **Deviasi spec**: `read: () => true` (public) bukan authenticated — WAJIB karena frontend SSG fetch tanpa auth — 2026-08-19
- [x] **Tambahan spec**: field `key` (7 enum fixed) — pemetaan ke collection listing — 2026-08-19
- [x] Register di payload.config.ts (group Content) — 2026-08-19
- [x] Tabel `service_types` via schema push (additive) — 2026-08-19

### 3.15.2 Data migration ✅ DONE
- [x] `seed-service-types.ts` + `pnpm seed:service-types` — 7 row dari modules.ts, idempotent. Slug diselaraskan ke landing (tour/villa/water-activity/yacht/restaurant/venue/rental) — 2026-08-19
- [x] `pnpm generate:types` — `ServiceType` interface masuk payload-types.ts — 2026-08-19

### 3.15.3 Frontend — CMS-first dengan fallback ✅ DONE
- [x] `lib/payload.ts` — `getServiceTypes()` + `ServiceTypeDoc` — 2026-08-19
- [x] `lib/serviceTypes.ts` — resolver `getResolvedServiceTypes()` + `getServiceTypeByKey()`, CMS-first fallback modules.ts — 2026-08-19
- [x] Footer services column cascade: servicesMenu → ServiceTypes → modules.ts. Bonus fix: slug service kini BENAR (/tour /villa; sebelumnya modules.ts salah /tours /accommodations) — 2026-08-19
- [x] **By design tetap hardcoded**: block `serviceType` select enum (Payload select tak bisa dynamic; convert→relationship = risiko CMS 500) — 2026-08-19

### Manual Test Log — Phase 3.15
```
[x] Seed sukses: 7 service-types
[x] API public-readable: /api/service-types return 7 tanpa auth
[x] Resolver query (status=all + active) → 7 docs CMS names
[x] Footer CMS-driven CONFIRMED
[x] Regression: /yacht landing render 5 cards
[x] Fallback path: CMS down → Footer jatuh ke modules.ts (tidak crash)
```

### Decision Log — Phase 3.15
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-19 | `read: () => true` (public), override spec | Frontend SSG fetch tanpa auth; authenticated-only → fallback selamanya → fitur percuma |
| 2026-08-19 | Tambah field `key` (7 enum fixed, super-admin) | Tanpa key = orphan metadata tak terhubung ke collection listing |
| 2026-08-19 | Block `serviceType` tetap select enum | Convert→relationship = schema change embedded blocks → risiko CMS 500 |
| 2026-08-19 | Resolver CMS-first + fallback (pola features.ts) | Zero-downtime; build jalan kalau CMS kosong/unreachable |

**Follow-ups (Phase 4 backlog):**
- [ ] Wire lebih banyak consumer (landing hero/desc/SEO, block heading, WA per-service) — sebagian dikerjakan di 3.16/3.17
- [ ] Upload coverImage per service type di CMS (saat ini null)
- [ ] iconName rentals sementara `badge` (tak ada ikon car/motor) — tambah ikon
- [ ] Manual test CMS admin: ServiceTypes di group Content, field `key` read-only non-super-admin

---

## Phase 3.16 — Wire ServiceTypes ke Consumer (Task 3.3) ✅ DONE

Menyambungkan `service-types` ke consumer frontend supaya metadata client reflect di
situs. Semua wiring **additive/fallback** → nol regresi. Scope user: "Semua di atas".

### 3.16.1 Block enrichment ✅ DONE
- [x] `ServiceListingBlock.astro` dispatcher — fetch `getServiceTypeByKey(serviceType)`, pass `serviceMeta` — 2026-08-20
- [x] Hero Immersive + Editorial — heading/description fallback ke ServiceType.name/description; hero singleImage fallback ke coverImage — 2026-08-20
- [x] `ServiceGridBlock.astro` — heading fallback ke ServiceType.name — 2026-08-20
- [x] Pola: field blok = OVERRIDE, ServiceType = fallback — 2026-08-20

### 3.16.2 SEO fallback ✅ DONE
- [x] `[...slug].astro` — kalau slug page == ServiceType.slug, SEO fallback ke metaTitle/metaDescription (Page.seo tetap menang) — 2026-08-20

### 3.16.3 WhatsApp per-service ✅ DONE
- [x] `lib/serviceTypes.ts` — `getServiceWhatsApp(key, fallbackNumber)` — 2026-08-20
- [x] Wire 7 detail page NEW routes — precedence: ServiceType.whatsappNumber → SiteSettings → siteConfig. Pesan tetap per-listing builder — 2026-08-20
- [x] Legacy plural routes tidak disentuh (deprecated) — 2026-08-20

### 3.16.4 Footer (dari 3.15) ✅
- [x] Footer services column CMS-driven via `getResolvedServiceTypes()` — 2026-08-20

### Manual Test Log — Phase 3.16
```
[x] Footer CMS-driven (label "Private Yachts"/"Rentals"/"Restaurants & Dining")
[x] /villa landing render OK — override heading jalan, 4 cards, hero
[x] /villa/[slug] — 4 WA links, nomor fallback benar (ServiceType null → SiteSettings)
[x] /yacht/[slug] + /tour/[slug] — WA present, no page error
[x] Semua page: hanya error HMR WebSocket (dev-only)
```

### Batas "fully manageable"
- ✅ Editable via CMS: label/ikon/urutan (nav+footer), SEO per-service, WA number per-service, hero cover, deskripsi (fallback)
- ⚠️ Editorial heading/description landing = block override (page-specific, sengaja)
- 🔒 TETAP butuh code: tambah TIPE service baru (mis. "Spa")

### Decision Log — Phase 3.16
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Block heading/description = override, ServiceType = fallback | Copy hero landing legit page-specific; strip = kehilangan polish + risiko re-persist blok rapuh |
| 2026-08-20 | WA: wire NUMBER ke 7 detail, message tetap per-listing | Nomor per-service = nilai utama; builder lebih kaya drpd template generik |
| 2026-08-20 | Header nav tidak di-override ke ServiceTypes | Header sudah pakai CMS Menu (hand-curated); Footer + block heading cukup |

---

## Phase 3.17 — WhatsApp Deep Integration (template + variables) ✅ DONE

Menyempurnakan WA per-service: wire TEMPLATE pesan (CMS-editable) dengan variabel
placeholder, plus verifikasi empiris penuh.

### 3.17.1 Field verification ✅
- [x] `whatsappNumber` + `whatsappTemplate` sudah ada di ServiceTypes (dari 3.15). SiteSettings punya WA default — 2026-08-20

### 3.17.2 Template renderer + variables ✅ DONE
- [x] `lib/whatsapp.ts` — `renderWhatsAppTemplate(template, vars)` — ganti `{{serviceName}}`, `{{destination}}`, `{{date}}`, `{{userName}}`, `{{price}}`. Variabel kosong → `[nama]` untuk visitor isi — 2026-08-20
- [x] `ServiceTypes.whatsappTemplate` description didokumentasikan dgn daftar variabel — 2026-08-20
- [x] `seed-service-types.ts` — 7 template di-upgrade pakai variabel + re-seed — 2026-08-20

### 3.17.3 Frontend integration (7 detail pages) ✅ DONE
- [x] Priority pesan WA: `item.whatsappMessage` → `ServiceType.whatsappTemplate` (rendered) → builder per-collection — 2026-08-20
- [x] Priority nomor WA: `ServiceType.whatsappNumber` → SiteSettings → siteConfig — 2026-08-20
- [x] Wire villa/tour/rental/yacht/venue/restaurant/water-activity — 2026-08-20
- [x] CTA/Contact block generik tetap WA global — by design — 2026-08-20

### Manual Test Log — Phase 3.17 (empiris)
```
[x] Variable replacement — /villa/seaside-villa-lembongan:
    "...booking *Seaside Villa Lembongan* di Lembongan. Check-in: [date]..." ✅
[x] Custom WA number — yachts.whatsappNumber=6280000000009 → /yacht/ocean-serenity-catamaran → number match ✅ (di-clear setelah test)
[x] Fallback global — villa tanpa custom → 6282386357012 (SiteSettings) ✅
[x] 7 detail page render tanpa error (hanya HMR WebSocket)
```

### Decision Log — Phase 3.17
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Template = priority DI ATAS builder (di bawah item override) | Client kontrol pesan; builder jadi fallback |
| 2026-08-20 | Variabel tak terisi → `[nama]` | {{userName}}/{{date}} tak ada di SSG → visitor isi sendiri |
| 2026-08-20 | CTA/Contact block generik tetap WA global | Block generik tidak punya konteks service type |

---

## Phase 3.18 — Testimonials: Block dari Collection ✅ DONE

Menyambungkan block `testimonials` & `testimonialsCarousel` supaya bisa pilih sumber:
**inline** (existing) atau **collection** (Testimonials collection dgn filter).

### 3.18.1 Collection enhancement (additive) ✅ DONE
- [x] Testimonials TIDAK dibuat ulang (sudah ada dari 3.11) — hanya tambah 2 field: `destination` (relationship) + `date` (urutan kronologis) — 2026-08-20

### 3.18.2 Block config — source toggle ✅ DONE
- [x] Helper `testimonialSourceFields()` — `source` (inline/collection), `svc`, `filterDest`, `onlyFeatured`, `maxItems`. Dipakai di kedua block — 2026-08-20
- [x] Nama field select SENGAJA pendek (`source`/`svc`) — worst case enum 57 char (<63). `items` array conditional (source≠collection) — 2026-08-20

### 3.18.3 Frontend ✅ DONE
- [x] `TestimonialsBlock.astro` + `TestimonialsCarouselBlock.astro` — source=collection: fetch `getTestimonials` where {sourceModule, isFeatured, destination} + limit + sort '-date'; inline: block.items — 2026-08-20
- [x] `seed-testimonials.ts` (+ `pnpm seed:testimonials`) — 7 record — 2026-08-20
- [x] About page source=collection (featured only) sebagai demo; homepage tetap inline — 2026-08-20

### ⚠️ Schema migration recovery (Payload SQLite push bug)
- [x] Menambah field ke block existing memicu bug: push emit `CREATE INDEX` dobel untuk block sub-table → gagal. Drop index tak cukup — 2026-08-20
- [x] **Recovery**: drop 26 tabel `*_blocks_testimonials*` (bukan tabel utama `testimonials`/`venues_testimonials`) → push recreate fresh → sukses. Data block inline di-restore via re-seed — 2026-08-20
- [x] Pola drop-and-recreate konsisten dgn recovery block sebelumnya — 2026-08-20

### Manual Test Log — Phase 3.18 (empiris)
```
[x] Schema push sukses setelah recovery — /api/testimonials → 200 (7 records)
[x] Filter API: sourceModule=tours + featured → Sarah Mitchell ✅
[x] Source=collection (About): 4 featured dari collection; nama inline lama hilang ✅
[x] Source=inline (Homepage): tetap inline — regresi OK ✅
[x] Semua page 200 server-side; warm reload 59 resources 200
```

### Decision Log — Phase 3.18
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Tidak recreate collection, hanya tambah destination+date | Collection sudah ada; field existing cukup untuk sebagian filter |
| 2026-08-20 | Field select block nama pendek `source`/`svc` | Embed di additionalBlocks water_activities → prefix 51 char, budget 12 |
| 2026-08-20 | Recovery via drop block TABLES (bukan index) | Bug Payload emit CREATE INDEX dobel; drop tabel → recreate fresh |
| 2026-08-20 | About page → source=collection sebagai demo | Bukti end-to-end + improvement nyata |

**Catatan dev:** `/explore-bali` sempat 404 di dev (getStaticPaths cache) — touch `[...slug].astro`. Production build selalu fresh.

---

## Phase 3.19 — Admin Dashboard Overview (nice-to-have) ✅ DONE

Custom overview stats + recent activity di atas dashboard admin Payload via
`admin.components.beforeDashboard` (Server Component).

### Implementasi ✅ DONE
- [x] `apps/cms/src/admin/DashboardStats.tsx` — async Server Component. Query via `payload` local API — 2026-08-20
- [x] Stat cards: Pages (published/draft), Active Services, Testimonials, Media — 2026-08-20
- [x] Recent Activity: last 5 edits across 12 collections (sort -updatedAt), link ke edit view — 2026-08-20
- [x] Styling pakai CSS var tema Payload → konsisten light/dark. Accent border design token — 2026-08-20
- [x] Register di payload.config.ts `beforeDashboard: ['/admin/DashboardStats#default']` + `pnpm generate:importmap` — 2026-08-20

### Manual Test Log — Phase 3.19
```
[x] importMap ter-generate dgn entry DashboardStats
[x] CMS boot bersih, /admin (login) render 200 tanpa console error
[x] Data queries via REST: Pages 12 pub/1 draft, Services 7, Testimonials 7, Media 22, recent activity timestamp benar
[ ] Visual render dashboard (post-login) — PERLU login super-admin (password entry di luar kemampuan agent)
```

### Decision Log — Phase 3.19
| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-20 | Pakai `beforeDashboard` (bukan override full dashboard) | Lebih ringan & aman — nambah section di atas default |
| 2026-08-20 | Server Component + `payload` local API | Query langsung tanpa HTTP; standar Payload 3 admin RSC |
| 2026-08-20 | safeCount() try/catch per query | Graceful degradation kalau satu collection error |

---

## Yang Masih Pending / Bisa Di-improve

- Manual admin-login tests (sidebar visibility matrix, dashboard visual, ServiceTypes CRUD per role) — butuh login CMS.
- CMS restart untuk apply group/hidden/access changes (3.14).
- Follow-ups landing hero images, RichText heading formatting, SiteSettings kontak (lihat 3.14/3.15 backlog di atas).

## File/Modul yang Terpengaruh

- `apps/cms`: collections restructure (hidden/access/group), `ServiceTypes.ts`, `admin/DashboardStats.tsx`, seed scripts (demo-content, service-landing-content, service-types, testimonials)
- `apps/web`: `lib/serviceTypes.ts`, `lib/whatsapp.ts`, block dispatchers (ServiceListing/ServiceGrid), Testimonials blocks, 7 detail routes, `[...slug].astro`

## Related Reports

- [sprint-cms-enhancement.md](../reports/sprint-cms-enhancement.md) — report utama sprint 3.14–3.19
