# Dev Reference — Cross-Phase Decisions, Known Issues & Commands

> Referensi lintas-fase yang dipindahkan dari `PROGRESS.md` saat restrukturisasi
> dokumentasi (2026-08-23). Decision log **per-fase** hidup di masing-masing file
> [`docs/phases/`](phases/). Yang di sini adalah keputusan **fondasional** (arsitektur
> awal), daftar tech-debt cross-phase, dan perintah cepat.

---

## Scope Dokumentasi (apa yang di-audit & dijadikan report)

- **In-scope:** `docs/**` (dashboard, phases, reports, guides, reference docs),
  `AGENTS.md`, `README.md`, `SETUP.md`, `WORKFLOW.md`.
- **OUT of scope — jangan dibaca/di-audit/dijadikan report kecuali owner
  memerintahkan eksplisit:** `ai/prompt/**`. Isinya prompt **sekali-pakai**
  (throwaway task input), bukan dokumentasi hidup. Perlakukan sebagai tidak terlihat.
- `ai/reference/**` = material referensi desain (DESIGN.md dll), bukan progress log —
  rujuk hanya saat mengerjakan fitur terkait, tidak masuk report progress.

---

## Decision Log (Foundational / Cross-Phase)

Catatan keputusan penting yang diambil selama development, supaya tidak perlu tanya
ulang alasan di belakang keputusan.

| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-08-04 | Payload CMS dipilih, bukan Keystatic | Butuh RBAC multi-user + relational data untuk 7 modules |
| 2026-08-04 | Full Cloudflare (Pages + Workers) | Termurah ($5/bln), bandwidth unlimited, single ecosystem |
| 2026-08-04 | Tailwind 3.4, bukan 4.x | @astrojs/tailwind plugin belum compatible dengan v4 syntax |
| 2026-08-04 | Monorepo dengan pnpm workspace | Frontend & backend perlu deploy terpisah tapi share types |
| 2026-08-04 | CMS port 3030 (bukan default 3000) | Port 3000 dipakai proses lain saat scaffolding pertama; 3030 dipilih sebagai port tetap agar tidak konflik dengan tool lain (langganan Laragon dsb.) |
| 2026-08-04 | Frontend fonts self-hosted (latin subset variable) | Privacy (bebas Google Fonts CDN tracking) + performa (preload di BaseLayout, tanpa DNS extra ke fonts.gstatic.com) |
| 2026-08-04 | Seed script pakai `tsx` (bukan `payload run`) | `payload run` silent-exit di Windows/Node 22; tsx (~5MB devDep) transpile TS on-the-fly dengan reliable stdout |
| 2026-08-04 | Homepage index.astro punya section E2E test | Bukti koneksi frontend↔backend live; wajib DIHAPUS begitu Phase 2.2 (TourCard + listing) real content mengganti |
| 2026-08-04 | Astro dynamic route pakai `getStaticPaths()`, bukan SSR | astro.config `output: 'static'` — build-time prerender lebih murah di Cloudflare Pages (free tier); SSR baru dipertimbangkan kalau ada halaman yang perlu real-time (harga dinamis, availability) |
| 2026-08-04 | Rich-text lexical → plain text extractor sederhana (bukan lexical-to-HTML) | MVP Tour detail cukup teks (whitespace-pre-line); rendering full formatted lexical (bold/list/link) ditunda ke Phase 3 saat BlockRenderer dibuat |
| 2026-08-04 | Phase 3 — extend `lib/lexical.ts` dengan `lexicalToHtml()`, bukan install `@payloadcms/richtext-lexical/html` | Custom converter ~50 baris, tanpa dep baru (aturan AGENTS.md §11), coverage cukup: p/heading/list/link/bold/italic/underline/strike/code/blockquote/linebreak |
| 2026-08-04 | Homepage `/` pakai hybrid CMS-Page + fallback (bukan pure CMS-driven atau pure hardcoded) | (1) Editor bisa restructure via CMS Page slug='home' tanpa deploy, (2) fallback tetap render homepage bermakna kalau CMS home belum diisi, (3) reuse block components (ServiceGrid, Hero, CTA) — nol duplikasi markup |
| 2026-08-04 | Fix bug lama `fetchBySlug` (Phase 2) — `where[slug[equals]]` → nested `{slug:{equals:...}}` yg di-flatten benar | Payload silently mengabaikan filter salah dan return doc pertama published. Tersamar karena tiap collection cuma 1 published entry saat Phase 2. Ditemukan saat Step 5 homepage — getPageBySlug('home') return About page. |
| 2026-08-04 | Pindahkan item "Content webhook auto-rebuild" dari Phase 3 → Phase 5 | Butuh Cloudflare Pages build hook yang live — tidak bisa dites di lokal, jadi baru relevan saat production deploy |
| 2026-08-05 | Phase 3.5 — mapped reference color palette (teal/orange M3) ke existing token (ocean/coral/leaf/sand/stone) alih-alih adopt palette M3 penuh | Zero breaking change untuk 30+ existing Phase 2 components; visual close enough dgn reference; tokens existing sudah battle-tested |
| 2026-08-05 | Icon inline SVG per-icon (helper `Icon.astro`), bukan Material Symbols CDN | Konsisten no-CDN policy (Phase 1 decision), controllable size, ~1KB per icon acceptable. 33+ icon terdaftar; tambah per step saat needed |
| 2026-08-05 | Property page = coming-soon dedicated `property.astro` (bukan `#` no-op) | Nav link "Property" di Header berfungsi meaningful; landing yang menghubungkan visitor ke WhatsApp untuk enquiry sementara collection belum ada |
| 2026-08-05 | Component reusable baru (FilterBookingBar, WhatsAppFloating, Icon) di folder `apps/web/src/components/common/` | Folder baru — konsisten dgn existing `cards/` + `navigation/`. `common/` = utility reusable lintas-page yg bukan navigation atau card |
| 2026-08-05 | WhatsAppFloating pakai popup pattern (Intercom-style), bukan direct-to-WA button | Higher engagement — visitor lebih intentional sebelum initiate chat. Multi-option support siap dipakai kalau nanti perlu. Backward compatible: 1 option default auto dari CMS |
| 2026-08-05 | Homepage fallback = hardcoded komposisi block (Hero+VP+3×SG+Stats+Test+CTA), bukan wajib pakai CMS Page | Sensible default kalau editor belum susun 'home' di CMS. Hybrid preserved: CMS Page 'home' published → override fallback. Zero markup duplication |
| 2026-08-05 | 3 CMS block baru (`ValuePropsBanner`, `StatsBanner`, `TestimonialsCarousel`) — schema change ke Pages | Extend Phase 3 architecture dgn tetap CMS-driven. Editor bisa remake homepage dari admin tanpa deploy. Icon name reference lookup ke Icon.astro map |

> **Decision log per-fase** (3.8, 3.13, 3.15, 3.16, 3.17, 3.18, 3.19) ada inline di
> masing-masing file phase. Keputusan arsitektur formal → [`07-DECISION-LOG.md`](07-DECISION-LOG.md).

---

## Known Issues / Tech Debt

Hal-hal yang perlu diperbaiki tapi belum urgent.

- [x] ~~Sharp belum aktif → upload gambar belum auto-resize~~ — resolved 2026-08-04 (aktif via `sharp` property di payload.config.ts)
- [x] ~~`fetchCollection()` hardcode filter `status=published`~~ — resolved 2026-08-04 (sekarang ada opsi `status: 'published' | 'draft' | 'all'`, default tetap published)
- [ ] Data pre-existing di CMS masih banyak status=draft (Kuta, Ceningan, "Kelinging Beach", kategori Tour/Accomodation/Water Activities) — publish/rename/hapus manual
- [ ] Webhook auto-rebuild belum di-setup (masih manual trigger) — Phase 5
- [ ] Belum ada automated testing (unit/e2e)
- [x] ~~Homepage `index.astro` masih pakai E2E test section~~ — resolved 2026-08-04 (Phase 3 Step 5: hybrid CMS Page 'home' + fallback dgn block components)
- [ ] Astro dev caching `getStaticPaths()`: setelah publish/create entry baru di CMS, harus touch file `[slug].astro` supaya path baru muncul. Production build fresh setiap deploy jadi tidak berpengaruh live.
- [ ] **Tailwind JIT cache stale saat tambah file di folder baru**: `@astrojs/tailwind` integration kadang tidak scan file baru yang berada di subfolder yang belum pernah di-scan sebelumnya (misal `components/common/` yang baru dibuat di Phase 3.5). Symptom: kelas Tailwind yang unik (belum dipakai file lain — misal `top-20`, `pl-12`, `pointer-events-none`, `peer-checked`, `md:grid-cols-3`) tidak compile → element render tanpa styling. **Fix:** `touch apps/web/tailwind.config.mjs` untuk force full rebuild. Production build (`pnpm build`) fresh setiap kali jadi tidak berpengaruh live. Setelah folder pertama kali di-scan, HMR normal berikutnya bekerja.
- [ ] Tailwind `container-page` class dipakai Header/Footer tapi tidak jelas di config — perlu audit tailwind.config.mjs vs global.css (mungkin sama dengan `container-content`)

---

## Quick Status Check Commands

```powershell
# Cek CMS jalan
cd apps/cms && pnpm dev            # → localhost:3030/admin

# Cek Frontend jalan
cd apps/web && pnpm dev            # → localhost:4321

# Seed foundation data (Destinations + Categories)
cd apps/cms && pnpm seed           # NOTE: stop `pnpm dev` dulu (SQLite lock)

# Regenerate types dari CMS ke shared package
cd apps/cms && pnpm generate:types

# Cek collections yang sudah ada di CMS
# Buka http://localhost:3030/admin

# Cek API response
curl http://localhost:3030/api/tours
curl http://localhost:3030/api/destinations
curl http://localhost:3030/api/categories
```
