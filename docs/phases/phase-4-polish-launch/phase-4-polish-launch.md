# Phase 4: Polish & Launch

**Status:** ⬜ Not Started (sebagian SEO technical sudah dikerjakan lebih awal di [Phase 3.20](phase-3.20-service-listing-fixes.md))
**Timeline:** —
**Depends on:** [Phase 3.14–3.19 Sprint](phase-3.14-cms-enhancement-sprint.md), [Phase 3.20](phase-3.20-service-listing-fixes.md)

## Tujuan

Polish visual (animasi, "Journey Path" signature), SEO lengkap, audit performa &
aksesibilitas, dan QA lintas-device/browser sebelum deploy produksi.

## Yang Dikerjakan / Direncanakan

- [ ] GSAP animations semua preset terpasang
- [ ] "Journey Path" visual signature diimplementasi
- [ ] SEO: structured data (Schema.org) per module — **sebagian ✅ di Phase 3.20** (JSON-LD per-type, breadcrumbs, canonical/OG). Sisanya: validasi produksi via Rich Results Test → [post-deploy-todo.md](../post-deploy-todo.md)
- [x] Sitemap generation terverifikasi — **✅** `@astrojs/sitemap` men-generate `sitemap-index.xml` otomatis saat `pnpm build` (2026-08-23). Submit ke Search Console = [post-deploy-todo.md](../post-deploy-todo.md)
- [ ] Meta tags dinamis per halaman — **sebagian ✅ di Phase 3.20** (canonical, OG, Twitter, robots via BaseLayout)
- [ ] Performance audit: Lighthouse 90+ (semua kategori)
- [ ] Mobile responsive QA — test semua breakpoint
- [ ] Cross-browser test (Chrome, Safari, Firefox)
- [ ] WhatsApp flow end-to-end test
- [ ] Accessibility check (alt text, contrast, keyboard nav)

## Status Detail per Sub-task

| Sub-task | Status | Catatan |
|----------|--------|---------|
| GSAP animations | ⬜ | Belum mulai |
| Journey Path signature | ⬜ | Belum mulai |
| Structured data per module | 🔨 | Code ✅ (Phase 3.20); validasi produksi pending |
| Sitemap generation | ✅ | Auto-generated saat build (`sitemap-index.xml`); submit pending (post-deploy) |
| Meta tags dinamis | 🔨 | Canonical/OG/Twitter ✅ (Phase 3.20) |
| Lighthouse 90+ | ⬜ | Belum diaudit |
| Mobile responsive QA | 🔨 | Spot-check per halaman sudah (3.14); QA menyeluruh pending |
| Cross-browser test | ⬜ | Belum |
| WhatsApp flow E2E | 🔨 | Empiris per detail page ✅ (3.17); flow lengkap pending |
| Accessibility check | ⬜ | Belum |

## Backlog carry-over dari Phase 3 (dikerjakan di Phase 4)

Dikumpulkan dari follow-ups fase sebelumnya:
- [ ] Hero background image landing pages di-assign arbitrer → client upload & assign per page di CMS (dari 3.14.5)
- [ ] RichText privacy/terms: section heading render sebagai paragraph → format di CMS atau upgrade seed helper (dari 3.14.5)
- [x] SiteSettings kontak + map embed — **✅ terisi** (email/phone/whatsapp/address + Google Maps iframe, diverifikasi 2026-08-23). Contact block tidak lagi placeholder.
- [ ] Upload coverImage per service type di CMS (dari 3.15)
- [ ] iconName rentals sementara `badge` — tambah ikon kendaraan (dari 3.15)
- [ ] Wire lebih banyak consumer ke ServiceTypes (sebagian ✅ di 3.16/3.17)

## Yang Masih Pending / Bisa Di-improve

Seluruh fase belum dimulai secara formal. Item yang **hanya bisa diselesaikan setelah
deploy** (validasi structured data, sitemap submit, redirect 301, canonical produksi)
dipindahkan ke [post-deploy-todo.md](../post-deploy-todo.md).

## Related Reports

- [service-listing-visual-audit.md](../reports/service-listing-visual-audit.md) — referensi implementasi SEO
