# Post-Deploy TODO

> Item-item ini **TIDAK bisa diselesaikan/diverifikasi di local dev**. Kerjakan
> **SETELAH** deploy ke Cloudflare Pages dan register ke Google Search Console /
> webmaster tools lainnya.
>
> Sumber: di-defer dari [Phase 4](phases/phase-4-polish-launch/phase-4-polish-launch.md) SEO work &
> [Phase 3.20](phases/phase-3-cms-driven/service-listing/phase-3.20-service-listing-fixes.md) — butuh environment produksi.
> Referensi implementasi: [service-listing-visual-audit.md](reports/service-listing-visual-audit.md).

---

## Setelah Deploy ke Cloudflare Pages

- [ ] **Verify `_redirects` aktif** — test semua 301 redirect (plural → singular).
      Cloudflare Pages membaca `apps/web/public/_redirects` dari root output (`dist/`).
      Pasangan yang harus dites (dari `apps/web/public/_redirects`):
  - **Listing roots (exact):**
    * `/tours` → `/tour`
    * `/accommodations` → `/villa`
    * `/restaurants` → `/restaurant`
    * `/rentals` → `/rental`
    * `/weddings` → `/venue`
    * `/water-activities` → `/water-activity`
  - **Detail routes (splat):**
    * `/tours/*` → `/tour/:splat`
    * `/accommodations/*` → `/villa/:splat`
    * `/restaurants/*` → `/restaurant/:splat`
    * `/rentals/*` → `/rental/:splat`
    * `/weddings/*` → `/venue/:splat`
    * `/water-activities/*` → `/water-activity/:splat`
  - Catatan: `/yacht` TIDAK di-redirect (sudah jadi CMS landing page singular sejak Phase 3.20).
- [ ] Verify canonical tags render dengan **absolute production URL** (bukan localhost)
- [ ] Test semua halaman load di production environment
- [ ] Verify environment variables production sudah benar (PUBLIC_SITE_URL / site URL untuk canonical, CMS API endpoint, dll)
- [ ] **Apply 2 data-seed yang pending dari Phase 3.20** (kalau belum di-apply saat dev):
      villa layout → hero-immersive + button links "All X" → singular
      (`pnpm tsx src/scripts/seed-landing-pages.ts` + `seed-service-landing-content.ts`, CMS stop dulu)

## Setelah Register ke Google Search Console

- [ ] Submit `sitemap.xml`
- [ ] Validate structured data via Google Rich Results Test:
      https://search.google.com/test/rich-results
  * BreadcrumbList schema
  * ItemList schema (listing pages)
  * Product/service schema (detail pages: TouristTrip / LodgingBusiness / Restaurant / EventVenue / SportsActivityLocation / Product)
  * WebPage schema (CMS pages) + WebSite/Organization (homepage)
- [ ] Request indexing untuk halaman utama
- [ ] Monitor coverage report — pastikan tidak ada halaman yang ke-block atau error
- [ ] Verify canonical URLs dihormati Google (tidak ada duplicate content warning
      antara rute plural lama & singular baru)
- [ ] Check mobile usability report
- [ ] Verify redirect chains tidak ada (301 langsung, bukan redirect berlapis)

## SEO Monitoring (ongoing setelah launch)

- [ ] Setup Google Analytics / analytics tool (GA4 id + Cloudflare Web Analytics token sudah wired di SiteSettings.defaultSeo dari Phase 3.10 — tinggal isi)
- [ ] Monitor Core Web Vitals di Search Console
- [ ] Track indexing status service listing pages (target keyword: "Bali tours", "Bali villa", dll)
- [ ] Verify OG tags render benar saat di-share (test via social media debugger)

## Webmaster Tools Lain (opsional)

- [ ] Bing Webmaster Tools — submit sitemap
- [ ] Register ke webmaster tools lain sesuai target market

---

## Deferred

> Item di bawah ini sengaja **tidak dibangun sekarang** (bukan post-deploy
> SEO, tapi work-items dari phase bookings/checkout yang di-pause). Masuk di
> file ini supaya satu tempat untuk semua "nanti dulu". Sumber keputusan:
> [`docs/security-hardening-playbook.md`](security-hardening-playbook.md) §5.

- **4.70.3.2 — Upload operator e-ticket per booking.**
  Alasan: menunggu operator ferry. Belum ada perjanjian agen, format tiket
  dari operator belum diketahui, jadi skema upload/attachment belum bisa
  difinalkan.
- **4.70.3.3 — Voucher PDF.**
  Alasan: hanya dikerjakan **jika** operator mengizinkan voucher dari agen
  pihak ketiga. Tanpa izin tertulis, voucher berisiko dianggap tiket palsu.
- **4.71 Fix C — Admin list cell untuk `departureDate` (date-only display).**
  Alasan: cosmetic fix di admin list view, bukan security/correctness
  blocker. Boleh dikerjakan setelah Stage 3 UI redesign supaya tidak dobel
  kerja.
- **4.71.1 extras — Deadline reminder email, timezone selector di CMS, rename
  tab "Bank Accounts" → "Payment Settings & Banks".**
  Alasan: nice-to-have. Reminder email butuh keputusan bisnis (cadence,
  template). Timezone selector & rename tab belum urgent sebelum go-live.

Jangan reintroduce item di atas tanpa instruksi eksplisit dari user.

---

*Item di file ini di-defer dari Phase 4 SEO work karena butuh environment production.
Referensi implementasi: [`docs/reports/service-listing-visual-audit.md`](reports/service-listing-visual-audit.md).*
