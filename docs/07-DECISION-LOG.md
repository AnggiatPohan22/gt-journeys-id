# 07 — DECISION LOG

> Riwayat keputusan arsitektur proyek **DnJourneysBali** dalam format ADR (Architecture Decision Record) yang disederhanakan.
>
> Tujuan: menjaga konteks strategis agar diskusi yang sama tidak diulang setiap kali onboarding developer baru atau ada usulan perubahan besar.

## Pengantar — Apa itu Decision Log?

Setiap keputusan arsitektur besar (pilih stack, pilih pola, ubah struktur) punya **konteks** (kenapa dulu dipilih) dan **konsekuensi** (trade-off yang diterima). Kalau tidak dicatat, 6 bulan kemudian tim akan bertanya *"kenapa sih kita pakai X, bukan Y?"* — dan tidak ada jawaban selain menebak.

Decision log ini:
- Menyimpan konteks: kondisi teknis/bisnis saat keputusan dibuat.
- Menyimpan opsi yang **tidak** dipilih (biasanya ini yang paling sering hilang).
- Menyimpan trade-off yang secara sadar diterima.
- Bisa diupdate: keputusan boleh direvisi/diganti — tulis ADR baru yang **replaces** ADR lama, jangan hapus.

Format: satu ADR = satu keputusan. Nomornya urut (ADR-001, 002, …) dan tidak pernah dipakai ulang.

---

## Daftar ADR

### ADR-001: Payload CMS 3.x (bukan Keystatic)

- **Tanggal**: Fase awal proyek (Phase 1)
- **Status**: Diterima ✅
- **Konteks**: Butuh CMS untuk mengelola 8 modul layanan travel agency (Tours, Villas, Water Activities, dst.) dengan relasi antar entitas (Tour → Destination, Tour → Category), draft/publish workflow, dan user roles bertingkat (owner, admin travel agency, staff editor).
- **Opsi yang Dipertimbangkan**:
  1. **Keystatic** — CMS git-based, no-database, edit content lewat pull request.
     - ✅ Zero infra cost, semua konten di-version control.
     - ✅ Simpel setup.
     - ❌ Tidak ada RBAC bawaan — semua editor = collaborator repo (butuh akses git).
     - ❌ Relational data lemah — reference antar entity manual.
     - ❌ Bukan pilihan tepat kalau editor bukan developer.
  2. **Sanity / Contentful (SaaS)** — headless CMS managed.
     - ✅ RBAC + relational native.
     - ❌ Biaya bulanan naik cepat dengan traffic/asset (mudah > $50/bulan).
     - ❌ Vendor lock-in.
  3. **Payload CMS 3.x** — self-hosted, TypeScript-first, database-backed.
     - ✅ RBAC per collection + field-level access.
     - ✅ Relational data first-class (relationship fields, upload, blocks).
     - ✅ Admin UI ready-made, TypeScript type auto-generated.
     - ✅ Bisa dijalankan di serverless (Cloudflare Workers via OpenNext).
     - ❌ Perlu database sendiri (D1) + hosting Workers.
- **Keputusan**: **Payload CMS 3.x**. Butuh RBAC (owner vs editor), relational (Tour ↔ Destination), dan page-builder blocks yang tidak feasible di Keystatic. Biaya masih fit di target $5/bulan lewat Cloudflare Workers.
- **Konsekuensi**:
  - ✅ Editor non-teknis bisa pakai admin panel tanpa git.
  - ✅ Type-safety end-to-end via `pnpm generate:types`.
  - ⚠️ Vendor lock-in ke Payload API — migrasi ke CMS lain butuh effort.
  - ⚠️ Perlu maintain database + Worker deployment.
- **Bukti di kode**: [apps/cms/src/payload.config.ts](apps/cms/src/payload.config.ts), semua collections di `apps/cms/src/collections/`.

---

### ADR-002: Cloudflare Full-Stack (Pages + Workers + D1 + R2)

- **Tanggal**: Fase awal proyek
- **Status**: Diterima ✅
- **Konteks**: Target budget hosting **~$5/bulan**. Butuh: static hosting untuk frontend, runtime Node untuk Payload/CMS, database, object storage untuk media.
- **Opsi yang Dipertimbangkan**:
  1. **Vercel + PlanetScale + AWS S3** — mainstream stack.
     - ✅ DX bagus, dokumentasi banyak.
     - ❌ Vercel Pro $20/user/month, PlanetScale $29/mo minimum, S3 egress $0.09/GB.
     - ❌ Total realistis $50-100/bulan.
  2. **Railway / Fly.io + Postgres + S3** — container-based.
     - ✅ Full Node runtime, tidak ada limit worker.
     - ❌ Minimum $5-15/bulan per service; 3 services = $15-45.
  3. **Cloudflare Pages + Workers + D1 + R2** — semua di satu vendor.
     - ✅ Pages free tier generous, Workers Paid $5/bulan include CPU + D1.
     - ✅ R2 egress **gratis** (vs S3 $0.09/GB — signifikan buat media-heavy site).
     - ✅ CDN global edge included.
     - ❌ Worker punya batasan (CPU 30s, request body 100MB).
     - ❌ D1 masih relatively new; ekosistem migrasi belum se-matang Postgres.
- **Keputusan**: **Cloudflare full stack**. Semua kebutuhan tercover ~$5.15/bulan, egress gratis krusial untuk site yang banyak gambar villa/tour.
- **Konsekuensi**:
  - ✅ Total biaya masuk budget dengan margin.
  - ✅ Semua di satu dashboard, satu CLI (wrangler).
  - ⚠️ Vendor lock-in ke Cloudflare API (D1 binding, R2 binding).
  - ⚠️ Terikat batas Worker — kalau ada operasi > 30s CPU (mis. bulk image processing), harus queue/split.
  - ⚠️ Payload perlu adaptasi via OpenNext adapter — bukan setup default Next.js.
- **Bukti di kode**: [apps/cms/wrangler.toml](apps/cms/wrangler.toml), `deploy` scripts di [apps/cms/package.json](apps/cms/package.json) & [apps/web/package.json](apps/web/package.json).

---

### ADR-003: Struktur Monorepo (`apps/web` + `apps/cms` + `packages/shared`)

- **Tanggal**: Fase awal proyek
- **Status**: Diterima ✅
- **Konteks**: Frontend Astro dan backend Payload adalah dua aplikasi berbeda (framework, deploy target, lifecycle), tapi berbagi **kontrak data**: tipe TypeScript yang di-generate Payload harus dipakai Astro.
- **Opsi yang Dipertimbangkan**:
  1. **Dua repo terpisah** — `dn-journeys-web` + `dn-journeys-cms`.
     - ✅ Isolasi lebih tegas, deploy independen di-enforce infra.
     - ❌ Duplikasi tipe → drift antara schema CMS dan konsumen frontend.
     - ❌ Perlu setup npm package publish untuk shared types.
  2. **Single package all-in-one** — semua di satu `src/`.
     - ✅ Simpel.
     - ❌ Dependency antara Astro & Next/Payload konflik.
     - ❌ Sulit deploy dua target berbeda.
  3. **Monorepo dengan pnpm workspaces** — dua apps + satu shared package.
     - ✅ Tipe di-share via workspace import (`@shared/types/payload-types`).
     - ✅ Payload bisa langsung tulis output types ke `packages/shared/src/types/payload-types.ts` — zero manual publish.
     - ✅ Command terpusat via `--filter` di root package.json.
     - ❌ Tooling monorepo bisa complicated (workspace protocol, tsconfig paths).
- **Keputusan**: **Monorepo pnpm workspaces**. Sync tipe otomatis + deploy tetap terpisah.
- **Konsekuensi**:
  - ✅ `pnpm generate:types` update tipe langsung terlihat di frontend.
  - ✅ CI/CD per app tetap bisa (deploy Pages independen dari Workers).
  - ⚠️ Contributor perlu tahu convention workspace (`workspace:*`, path alias).
- **Bukti**: [pnpm-workspace.yaml](pnpm-workspace.yaml), [packages/shared/package.json](packages/shared/package.json), output path di [payload.config.ts:137](apps/cms/src/payload.config.ts#L137).

---

### ADR-004: Astro sebagai Frontend

- **Tanggal**: Fase awal proyek
- **Status**: Diterima ✅
- **Konteks**: Website travel agency = brochureware content-heavy. Konten jarang berubah realtime, SEO penting, performance/LCP critical (mobile market, Indonesia network patchy).
- **Opsi yang Dipertimbangkan**:
  1. **Next.js** — SSR/SSG hybrid, ekosistem React.
     - ✅ Familiar untuk developer React.
     - ✅ Bisa share komponen dengan Payload admin (juga Next).
     - ❌ JS bundle default lebih besar; hydration cost untuk site brochureware jadi mubazir.
     - ❌ Deploy Next di Cloudflare = OpenNext (sudah dipakai backend) — over-engineering untuk static content.
  2. **Nuxt/SvelteKit** — alternative meta-framework.
     - ✅ Bundle lebih kecil dari Next.
     - ❌ Ekosistem Payload plugin sedikit; type integration tidak semulus.
  3. **Astro** — MPA-first, zero-JS by default, framework-agnostic islands.
     - ✅ HTML statis default, JS hanya diinject per komponen yang butuh (`client:*`).
     - ✅ Native content collection, file-based routing.
     - ✅ Deploy Pages tanpa adapter (mode `output: 'static'`).
     - ✅ Bisa mix React/Svelte/Vue island kalau nanti butuh.
     - ❌ Ecosystem lebih baru — plugin third-party lebih sedikit.
- **Keputusan**: **Astro** (mode static). Perfect fit untuk brochureware content-driven, LCP super cepat, Pages hosting gratis, tidak perlu Cloudflare adapter.
- **Konsekuensi**:
  - ✅ Bundle < 50KB per halaman biasa.
  - ✅ Build → deploy Pages simpel (static assets).
  - ⚠️ Interaktivitas tinggi butuh Alpine/vanilla JS atau island (lihat [package.json:19](apps/web/package.json#L19) — Alpine.js di-install).
  - ⚠️ SSR/hybrid mode butuh switch config + adapter kalau nanti dibutuhkan.
- **Bukti**: [apps/web/astro.config.mjs](apps/web/astro.config.mjs) `output: 'static'`.

---

### ADR-005: WhatsApp Direct Booking (bukan Payment Gateway)

- **Tanggal**: Fase awal proyek
- **Status**: Diterima ✅
- **Konteks**: Travel agency Bali umumnya mengonversi lead via WhatsApp — customer chat langsung untuk custom itinerary, harga negotiable, pertanyaan lokal. Payment biasanya via transfer bank / kartu on-arrival, bukan online booking.
- **Opsi yang Dipertimbangkan**:
  1. **Payment gateway** (Midtrans / Xendit / Stripe).
     - ✅ Booking end-to-end online.
     - ❌ Setup butuh KYC bisnis, dokumen legal, integrasi backend.
     - ❌ Fee 2-3% per transaksi.
     - ❌ Butuh ownership booking flow: kalender, availability, cancellation policy — semua fitur besar.
  2. **Form kontak → email**.
     - ✅ Sederhana.
     - ❌ Response time editor lambat (email diperiksa jarang), conversion drop.
  3. **WhatsApp CTA direct** — button `wa.me/<nomor>?text=<pre-filled>`.
     - ✅ Match kebiasaan customer Indonesia + turis Bali.
     - ✅ Zero setup — cukup nomor WA business + pre-filled message per entry.
     - ✅ Editor bisa customize pesan per tour/villa via field `whatsappMessage`.
     - ❌ Bukan booking terstruktur — tim harus track manual.
- **Keputusan**: **WhatsApp direct booking**. Fit market Bali + zero infra + mudah dipahami editor.
- **Konsekuensi**:
  - ✅ Time-to-launch cepat, no legal/fintech setup.
  - ✅ Setiap entry punya WA message custom (field `whatsappMessage` di semua service collection).
  - ⚠️ Tim harus disciplined balas cepat — miss = lost lead.
  - ⚠️ Tidak ada data analytic conversion end-to-end (perlu manual tracking).
  - ⚠️ Kalau nanti mau ekspansi ke online payment, perlu ADR baru + refactor besar.
- **Bukti**: [apps/web/src/lib/whatsapp.ts](apps/web/src/lib/whatsapp.ts), field `whatsappMessage` di setiap service collection, [WhatsAppFloating.astro](apps/web/src/components/common/WhatsAppFloating.astro), tab Booking di [Tours.ts:208](apps/cms/src/collections/Tours.ts#L208).

---

### ADR-006: Module Toggle System untuk Template Reusable

- **Tanggal**: Fase awal proyek (design phase)
- **Status**: Diterima (partial implementasi) ⚠️
- **Konteks**: Proyek ini dirancang jadi **template reusable** — bisa deploy untuk client travel agency lain dengan modifikasi minimal. Tidak semua client punya semua 8 modul (mis. villa-only, atau tour-only, tanpa wedding).
- **Opsi yang Dipertimbangkan**:
  1. **Semua modul selalu on** — client tidak pakai → biarkan kosong.
     - ✅ Simple, no config.
     - ❌ Nav/footer nampilkan modul kosong — bikin bingung visitor.
  2. **Fork repo per client**, hapus modul yang tidak dipakai.
     - ✅ Bundle lebih kecil.
     - ❌ Divergence per client → maintain fix di multiple repo.
  3. **Toggle flag per modul** dalam satu codebase.
     - ✅ Codebase tunggal, per-client cukup update config.
     - ✅ Bisa on/off tanpa hapus kode.
     - ❌ Perlu guard di banyak titik (nav, footer, routing).
- **Keputusan**: **Toggle flag**, saat ini di file [apps/web/src/config/modules.ts](apps/web/src/config/modules.ts).
- **Konsekuensi**:
  - ✅ Satu codebase melayani multi client dengan modul berbeda.
  - ⚠️ Toggle di file → perubahan butuh deploy (bukan runtime toggle).
  - ⚠️ Toggle hanya efek ke Footer services default; halaman module tetap accessible via URL langsung (perlu guard tambahan).
- **Catatan Revisi**: Rekomendasi migrasi toggle ke Payload global (`module-toggle`) supaya bisa dikontrol Super Admin dari CMS tanpa deploy. Detail rekomendasi di [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md) §3.4. Kalau diimplementasi, tulis ADR-XXX baru yang menggantikan.

---

### ADR-007: RBAC 3-Role (Super Admin / Admin / Editor)

- **Tanggal**: Fase awal proyek
- **Status**: Diterima ✅
- **Konteks**: Client travel agency biasanya punya struktur tim: **owner** (setup + ubah brand), **manager** (approve konten, add product), **content staff** (tulis deskripsi, upload foto). Perlu tiga level akses berbeda.
- **Opsi yang Dipertimbangkan**:
  1. **Single role** — semua user login bisa segalanya.
     - ✅ Simple.
     - ❌ Staff bisa tidak sengaja hapus modul / ubah setting brand → berbahaya.
  2. **2-role: Admin + Editor**.
     - ✅ Cukup untuk tim kecil.
     - ❌ Tidak ada pemisah "owner setup" vs "manager operasi harian".
  3. **3-role: Super Admin / Admin / Editor**.
     - ✅ Match struktur travel agency (owner / manager / staff).
     - ✅ Owner tetap punya control full untuk config/brand.
     - ✅ Manager bisa publish + create tanpa menyentuh setting global.
     - ✅ Staff aman: hanya edit isi existing, tidak bisa publish/delete/create.
- **Keputusan**: **3-role RBAC**. Super Admin = owner, Admin = manager operasi, Editor = staff content.
- **Konsekuensi**:
  - ✅ Aman by default — Editor tidak bisa merusak walau salah klik.
  - ✅ Owner bisa delegasi tanpa share credential Super Admin.
  - ⚠️ Perlu maintain rule per role di setiap collection ([access/roles.ts](apps/cms/src/access/roles.ts) — sudah shared, DRY).
  - ⚠️ Belum ada row-level ownership (Editor A ≠ Editor B dari sisi entry akses). Kalau nanti butuh, perlu ADR baru.
- **Bukti**: [apps/cms/src/collections/Users.ts:29-44](apps/cms/src/collections/Users.ts#L29) (enum role), [apps/cms/src/access/roles.ts](apps/cms/src/access/roles.ts), lihat detail di [04-RBAC.md](docs/04-RBAC.md).

---

### ADR-008: Design Direction "Tropical Sophistication"

- **Tanggal**: Fase awal proyek (design phase)
- **Status**: Diterima ✅
- **Konteks**: Positioning brand: bukan mass-market tour operator (harga murah loud color), tapi curated local expertise (Kabar Bali tapi elevated). Butuh visual language yang menyampaikan trust + local warmth + a bit of premium.
- **Opsi yang Dipertimbangkan**:
  1. **Bright tropical** (turquoise + yellow + palm green).
     - ✅ Instant "Bali" association.
     - ❌ Terlalu generic/touristy, kurang sophisticated.
  2. **Minimal luxury** (all monochrome, black+white+gold).
     - ✅ Premium feel.
     - ❌ Cold, hilang karakter Bali.
  3. **Tropical Sophistication** — warna Bali direfined:
     - **Deep Ocean** `#1B3A4B` — primary, trust + laut Bali.
     - **Warm Sand** `#F5F0E8` — background hangat, pasir + earth tone.
     - **Coral Sunset** `#E07A5F` — accent CTA, energi sunset.
     - **Tropical Leaf** `#6B9080` — natural, hutan Ubud.
     - **Font**: Fraunces (display, serif elegant) + Plus Jakarta Sans (body, humanist sans).
- **Keputusan**: **Tropical Sophistication** palette + font pair.
- **Konsekuensi**:
  - ✅ Konsisten di seluruh site via Tailwind design tokens.
  - ✅ Warna & font bisa di-swap untuk client baru dengan edit satu file ([tailwind.config.mjs](apps/web/tailwind.config.mjs)).
  - ⚠️ Locked-in di kode — belum bisa di-CMS-kan (Tier 3 di runbook).
- **Bukti**: [apps/web/tailwind.config.mjs](apps/web/tailwind.config.mjs) colors + fontFamily. Font woff2 di `apps/web/public/fonts/`.

---

### ADR-009: D1 (SQLite) sebagai Database

- **Tanggal**: Fase awal proyek
- **Status**: Diterima ✅
- **Konteks**: Payload butuh database. Kandidat: Postgres (Neon, Supabase, PlanetScale MySQL), atau SQLite (D1). Volume data travel agency: ratusan-ribuan entries maksimum, read-heavy, write jarang.
- **Opsi yang Dipertimbangkan**:
  1. **Postgres (Neon serverless)**.
     - ✅ Fitur SQL kaya, JSON operators native, ecosystem matang.
     - ✅ Free tier lumayan (0.5GB, cukup untuk MVP).
     - ❌ Butuh koneksi tambahan (via HTTP driver / Neon serverless driver) di Worker.
     - ❌ Kalau melebihi free tier, cost naik ($19+ / bulan).
  2. **Postgres (Supabase)**.
     - ✅ Include auth + storage.
     - ❌ Overlap dengan Payload auth + R2 storage → double-stack.
  3. **MySQL (PlanetScale)**.
     - ✅ Global replicas.
     - ❌ Free tier dicabut Q1 2024 — sekarang $29/mo minimum.
  4. **D1 (SQLite serverless Cloudflare)**.
     - ✅ Native Worker binding — zero-latency dari Payload.
     - ✅ Free untuk 5GB / 5M read hari / 100K write hari — over-provisioned untuk travel agency.
     - ✅ Include gratis di Workers Paid plan.
     - ❌ SQLite feature-set (no full-text search built-in, no advanced JSON operators seperti Postgres).
     - ❌ Ekosistem migrasi (Drizzle) masih dalam pengembangan.
     - ❌ Backup manual via `wrangler d1 export` (tidak ada point-in-time recovery).
- **Keputusan**: **D1**. Volume data proyek fit dengan SQLite, integrasi native Cloudflare, no extra cost.
- **Konsekuensi**:
  - ✅ Payload akses DB via binding (no connection string, no pool).
  - ✅ Total infra: 100% di Cloudflare (single-vendor simplicity).
  - ⚠️ Kalau nanti butuh full-text search (mis. autosuggest tour name), perlu solusi separate (mis. Cloudflare Vectorize atau JSON+LIKE query).
  - ⚠️ Backup harus rutin manual (mingguan, lihat [06-MAINTENANCE-RUNBOOK.md](docs/06-MAINTENANCE-RUNBOOK.md)).
- **Bukti**: [apps/cms/src/payload.config.ts:97-101](apps/cms/src/payload.config.ts#L97) (sqliteAdapter), [wrangler.toml](apps/cms/wrangler.toml) binding `DB`.

---

### ADR-010: Payload SQLite Adapter via `@libsql/client` (lokal) + D1 binding (produksi)

- **Tanggal**: Fase awal
- **Status**: Diterima ✅ (partial — produksi belum switched)
- **Konteks**: Payload sqliteAdapter di-config dgn `client.url = file:...` — cocok untuk dev lokal. Produksi butuh binding D1 native.
- **Keputusan**: Dev lokal pakai SQLite file (`apps/cms/cms.db`), produksi (belum diaktifkan) akan switch ke D1 binding.
- **Konsekuensi**:
  - ✅ Dev lokal cepat, no cloud dependency.
  - ⚠️ Config produksi belum di-wire ke `env.DB` — perlu switch adapter sebelum deploy. Lihat [05-INFRA.md](docs/05-INFRA.md) §4.3.
- **Catatan Revisi**: Perlu ADR follow-up saat migrasi ke D1 binding beneran di production.
- **Bukti**: [payload.config.ts:97](apps/cms/src/payload.config.ts#L97), package `@libsql/client` di [apps/cms/package.json:16](apps/cms/package.json#L16).

---

### ADR-011: Lexical Rich-Text Editor dengan Feature List Eksplisit

- **Tanggal**: Phase 3.6
- **Status**: Diterima ✅
- **Konteks**: Payload 3.x default richText pakai Lexical dengan preset feature. Butuh explicit control atas fitur (h2-h4 saja, warna text via design token) supaya konten editor sesuai design system.
- **Opsi yang Dipertimbangkan**:
  1. **Default Lexical preset** — semua feature on.
     - ❌ Editor bisa pakai h1 (bentrok dgn page title), warna sembarang.
  2. **Slate (adapter Payload lain)**.
     - ❌ Payload 3.x deprecate Slate.
  3. **Explicit Lexical feature list** — enable per fitur.
     - ✅ Full control: h2-h4 saja, warna dibatasi 5 preset (`ocean`, `coral`, `leaf`, `stone`, `midnight`) — sync dgn Tailwind tokens.
- **Keputusan**: Explicit feature list.
- **Konsekuensi**:
  - ✅ Konten editor konsisten dengan design system.
  - ⚠️ Setiap fitur baru harus di-add manual di payload.config.ts.
- **Bukti**: [apps/cms/src/payload.config.ts:47-81](apps/cms/src/payload.config.ts#L47).

---

### ADR-012: Page Builder via Payload Blocks

- **Tanggal**: Phase 3.5-3.7
- **Status**: Diterima ✅
- **Konteks**: Halaman tidak boleh hardcoded — Super Admin harus bisa buat/edit halaman dengan komposisi section (hero, gallery, CTA, dst.).
- **Opsi yang Dipertimbangkan**:
  1. **Halaman full richText** — semua konten satu blob rich text.
     - ✅ Simpel.
     - ❌ Layout jadi 1-column, tidak bisa hero/gallery kompleks.
  2. **Halaman per template hardcoded** — About, Contact, dst. tiap ada layout kustom.
     - ✅ Design tight.
     - ❌ Non-scalable, bikin halaman baru = coding.
  3. **Payload `blocks` field** — array of typed blocks yang di-render per type.
     - ✅ Editor drag & compose block.
     - ✅ 16 block type available (Hero, RichText, Image, Gallery, CTA, FAQ, Testimonials, ServiceGrid, Contact, Embed, Spacer, ValuePropsBanner, StatsBanner, TestimonialsCarousel, ServiceListing, TrustBadges).
     - ✅ Sama block library dipakai `pages.content` dan `<service>.additionalBlocks`.
- **Keputusan**: **Payload blocks**. Semua page & custom sections dibangun dari block library.
- **Konsekuensi**:
  - ✅ Halaman baru (About, Contact, Landing) → cukup buat entry Page, susun block, publish.
  - ✅ Custom section per-service (mis. testimonial khusus villa X) via `additionalBlocks`.
  - ⚠️ Block baru = coding (Tier 3): definisi di [blocks/index.ts](apps/cms/src/blocks/index.ts) + komponen render di `apps/web/src/components/blocks/` + register di `BlockRenderer.astro`.
  - ⚠️ Payload SQLite adapter meng-generate tabel per block type — hati-hati batas 63-char enum name (contoh workaround: exclude `valuePropsBanner`, `testimonialsCarousel`, `serviceListing` dari `accommodations.additionalBlocks` — lihat [Accommodations.ts:239](apps/cms/src/collections/Accommodations.ts#L239)).
- **Bukti**: [apps/cms/src/blocks/index.ts](apps/cms/src/blocks/index.ts), [BlockRenderer.astro](apps/web/src/components/blocks/BlockRenderer.astro), [Pages.ts:28](apps/cms/src/collections/Pages.ts#L28).

---

### ADR-013: OpenNext Adapter untuk Deploy Payload/Next ke Cloudflare Workers

- **Tanggal**: Fase awal deployment
- **Status**: Diterima ✅
- **Konteks**: Payload 3.x = Next.js app. Cloudflare Workers **bukan Node runtime** — perlu adapter yang mem-bundle Next agar jalan di edge runtime.
- **Opsi yang Dipertimbangkan**:
  1. **Deploy Payload di Vercel** — native Next.
     - ✅ Zero adapter.
     - ❌ Vercel cost + DB terpisah → beyond budget.
  2. **Deploy Payload di Railway / Fly.io** container.
     - ✅ Full Node.
     - ❌ ~$5-15/mo per service.
  3. **OpenNext for Cloudflare** — open-source adapter yang bundle Next → Worker.
     - ✅ Deploy Next.js/Payload di Workers Paid $5/mo.
     - ✅ Stay in Cloudflare ecosystem.
     - ❌ Beberapa Next feature terbatas / butuh flag khusus.
     - ❌ Bundle size besar; cold start ~500ms-1s.
- **Keputusan**: **OpenNext adapter** — deploy Payload/Next ke Workers.
- **Konsekuensi**:
  - ✅ Full stack tetap $5/bulan.
  - ⚠️ Perlu `compatibility_flags = ["nodejs_compat"]` di wrangler.toml.
  - ⚠️ Cold start noticeable (1-2 detik pertama request setelah idle).
  - ⚠️ Debugging deploy issue butuh cek OpenNext output di `.open-next/`.
- **Bukti**: [apps/cms/package.json:10,21](apps/cms/package.json#L10) (`@opennextjs/cloudflare`, deploy script), [wrangler.toml:3,6](apps/cms/wrangler.toml#L3).

---

### ADR-014: Astro `output: 'static'` (bukan hybrid/SSR)

- **Tanggal**: Fase awal
- **Status**: Diterima ✅
- **Konteks**: Konten travel agency jarang berubah realtime — publish tour baru rate mingguan, bukan menit. Butuh performance maksimal (LCP mobile).
- **Opsi yang Dipertimbangkan**:
  1. **SSR** setiap request fetch data.
     - ✅ Data selalu fresh.
     - ❌ Perlu Cloudflare adapter runtime, konsumsi Worker request, lebih lambat.
  2. **Hybrid (SSG + SSR per page)**.
     - ✅ Balance.
     - ❌ Complexity: perlu decide per page.
  3. **Static (SSG penuh)** — fetch semua data saat build.
     - ✅ HTML statis di CDN edge — LCP < 1s.
     - ✅ Deploy Pages tanpa adapter.
     - ❌ Perubahan konten butuh rebuild + redeploy.
- **Keputusan**: **Static (SSG)**. Trade-off latency data acceptable untuk brochureware.
- **Konsekuensi**:
  - ✅ Site super cepat, hosting gratis di Pages.
  - ⚠️ Editor publish → website update butuh rebuild manual (atau ISR webhook di masa depan).
  - ⚠️ `@astrojs/cloudflare` adapter ter-install tapi tidak dipakai — bisa dihapus atau di-keep untuk future.
- **Catatan Revisi**: Kalau nanti butuh rute realtime (mis. availability check, live inventory), switch ke `hybrid` mode + adapter. ADR follow-up dibuat saat perubahan.
- **Bukti**: [apps/web/astro.config.mjs:7](apps/web/astro.config.mjs#L7).

---

### ADR-015: Tailwind CSS + Design Tokens (bukan CSS-in-JS)

- **Tanggal**: Fase awal
- **Status**: Diterima ✅
- **Konteks**: Butuh styling system yang cepat di-develop + design token centralize.
- **Opsi yang Dipertimbangkan**:
  1. **Vanilla CSS / SCSS**.
     - ✅ No dependency.
     - ❌ Verbose, styling scoping manual.
  2. **CSS-in-JS (styled-components / Emotion)**.
     - ❌ Runtime overhead — bertentangan dgn zero-JS Astro.
  3. **Tailwind CSS + custom theme**.
     - ✅ Utility-first, cepat.
     - ✅ Design tokens (color, font, radius) centralized di config.
     - ✅ Purge automatic — bundle CSS kecil.
- **Keputusan**: **Tailwind CSS** dengan custom theme "Tropical Sophistication".
- **Konsekuensi**:
  - ✅ Design token ganti = update satu file (`tailwind.config.mjs`).
  - ⚠️ Kelas Tailwind panjang di JSX (trade-off standar).
- **Bukti**: [apps/web/tailwind.config.mjs](apps/web/tailwind.config.mjs), integration di [astro.config.mjs:10](apps/web/astro.config.mjs#L10).

---

### ADR-016: WhatsApp Message Template di Level Entry + Global Defaults

- **Tanggal**: Fase awal service collection design
- **Status**: Diterima ✅
- **Konteks**: Setiap tur/villa punya pesan pre-filled WhatsApp berbeda (mis. "Hi, saya tertarik Tour Sunrise Batur"), sementara ada juga default greeting umum.
- **Keputusan**: Field `whatsappMessage` (textarea) di setiap service collection (Tours, Accommodations, dst.) + global default di `site-settings.whatsappDefaults.greetingMessage`. Fallback cascade: per-entry → global → static template di [lib/whatsapp.ts](apps/web/src/lib/whatsapp.ts).
- **Konsekuensi**:
  - ✅ Editor bisa customize per entry.
  - ✅ Fallback aman kalau entry kosong.
- **Bukti**: [apps/cms/src/fields/whatsapp.ts](apps/cms/src/fields/whatsapp.ts), [apps/cms/src/globals/SiteSettings.ts:33-37](apps/cms/src/globals/SiteSettings.ts#L33), [apps/web/src/lib/whatsapp.ts](apps/web/src/lib/whatsapp.ts).

---

### ADR-017: Auto-Generated Slug via Field Hook

- **Tanggal**: Fase awal
- **Status**: Diterima ✅
- **Konteks**: Editor lupa isi slug atau isi dengan karakter invalid → URL 404. Butuh auto-generate slug dari `title` / `name`, tapi tetap allow override manual.
- **Keputusan**: Field hook `generateSlug` (beforeValidate) — kalau slug kosong, generate dari `title` atau `name`; kalau di-set manual, normalisasi karakter.
- **Konsekuensi**:
  - ✅ Slug selalu ada, konsisten format (lowercase, hyphen).
  - ⚠️ Kalau editor rename title, slug tidak auto-update (intentional — kalau slug berubah = URL rusak untuk SEO/link existing).
- **Bukti**: [apps/cms/src/hooks/generateSlug.ts](apps/cms/src/hooks/generateSlug.ts), dipakai di semua collection service.

---

### ADR-018: Chat Widget — Blocks Field untuk Channel-Agnostic Configuration

- **Tanggal**: 2026-09-17 (Phase 4.50.1)
- **Status**: Diterima ✅
- **Konteks**: `WhatsAppFloating` awalnya WA-only + 3 field di `SiteSettings.whatsappDefaults`. Owner minta channel-agnostic (WA + AI chatbot + live chat + email) supaya tambah channel baru tidak merombak schema. Dua opsi di Payload 3.33:
  - **(a) `array` + `admin.condition`**: 1 tabel array flat dengan conditional field. Cepat tapi menumpuk kolom NULL saat channel schema divergen.
  - **(b) `blocks` field**: 1 block per channel type = 1 file schema sendiri. Tabel terpisah per block-type di SQLite.
- **Keputusan**: **Pola blocks**. Channel WA (`whatsappNumber` + `prefilledMessage`) vs AI (`provider` + `model` + `systemPrompt` + `streaming` + `apiKeyRef`) schema-nya divergen signifikan; nambah Telegram/SMS di kemudian hari = tambah 1 file block + 1 branch dispatcher. Zero perubahan channel lama.
- **Konsekuensi**:
  - ✅ Discriminated union by `blockType` — TS narrow otomatis.
  - ✅ Migration Payload auto-generate tabel per block-type.
  - ✅ Admin UX: "Add Block" dropdown lebih deklaratif dibanding row uniform dengan conditional field.
  - ⚠️ Shared field (label/enabled/subtitle/agentAvatar/iconOverride/brandColorOverride) di-duplicate di setiap block schema → mitigasi: helper `commonChannelFields` untuk avoid drift.
- **Bukti**: [ChatWidgetSettings.ts](apps/cms/src/globals/ChatWidgetSettings.ts), [phase-4.50.1](docs/phases/phase-4-polish-launch/features/chat-widget/phase-4.50.1-chat-widget-schema-and-security.md).

---

### ADR-019: IP Address Storage sebagai HMAC Hash (bukan Raw)

- **Tanggal**: 2026-09-17 (Phase 4.50.1/4.50.4)
- **Status**: Diterima ✅
- **Konteks**: Endpoint `/api/chat/send` perlu simpan IP visitor untuk audit rate-limit & forensik. Raw IP = PII sensitif (GDPR). Opsi:
  - **(a) Raw IP di kolom `ipRaw`** — mudah debug tapi PII vulnerability + retention risk.
  - **(b) HMAC-SHA256 dengan salt di env** — cukup unik untuk uniqueness dedup, tidak reversible ke IP asli.
  - **(c) Truncated IP (mis. `1.2.3.0`)** — kompromi GDPR, tapi masih partial identifiable.
- **Keputusan**: **(b) HMAC-SHA256 dengan salt (`CHAT_IP_HASH_SALT`), truncated 128-bit (32 hex char)**. Salt rotasi = invalidate history (privacy feature, bukan bug). Fail-loud saat salt < 16 char (throw at construction) — bukan silent fallback.
- **Konsekuensi**:
  - ✅ GDPR-friendly: IP tidak recoverable.
  - ✅ Dedup + rate-limit tetap jalan via hash equality.
  - ⚠️ Salt hilang = semua history hash rusak (mitigasi: salt disimpan di Wrangler secrets, ada di runbook).
- **Bukti**: [ip-hasher.ts](apps/web/src/lib/chat-security/ip-hasher.ts), [phase-4.50.4](docs/phases/phase-4-polish-launch/features/chat-widget/phase-4.50.4-chat-security-lib.md).

---

### ADR-020: Rate-Limit Counter di Cloudflare KV (bukan Payload Collection)

- **Tanggal**: 2026-09-17 (Phase 4.50.4)
- **Status**: Diterima ✅
- **Konteks**: Sliding-window rate-limit butuh counter dengan TTL + atomic-ish increment per key. Opsi store:
  - **(a) Payload collection `chat-rate-counters`** — konsisten dgn store lain, admin bisa lihat. Tapi hot-path = tiap request tulis DB, latency +50-100ms.
  - **(b) Cloudflare KV** — TTL native (`expirationTtl`), edge-cached, latency <10ms. Eventual consistency (bukan hard atomic).
  - **(c) Durable Object** — hard atomic, tapi single-region + biaya lebih tinggi.
- **Keputusan**: **(b) KV dengan interface `RateLimitStore`** yang bisa di-swap ke DO/Redis nanti tanpa perubahan consumer. Untuk spam prevention, eventual consistency cukup (spammer tidak bisa exploit race window <100ms).
- **Konsekuensi**:
  - ✅ Zero DB write di hot path.
  - ✅ Interface abstract — swap ke DO/Redis = 1 class baru.
  - ⚠️ Race window: 2 request paralel bisa lolos counter, mitigasi: pilih rule dengan buffer (mis. limit=5 dengan expected traffic 3-4/menit).
- **Bukti**: [rate-limit-store.ts](apps/web/src/lib/chat-security/rate-limit-store.ts), [phase-4.50.4](docs/phases/phase-4-polish-launch/features/chat-widget/phase-4.50.4-chat-security-lib.md).

---

## Template ADR Kosong

Copy template di bawah untuk keputusan baru. Nomor ADR selalu **increment**, tidak pernah reuse (walau lama sudah diganti).

```markdown
### ADR-XXX: [Judul Keputusan Singkat]

- **Tanggal**: YYYY-MM-DD
- **Status**: Diterima ✅ / Direvisi ⚠️ / Diganti ❌ (superseded by ADR-YYY)
- **Konteks**: (2-4 kalimat) Kondisi teknis atau bisnis yang mendorong keputusan ini. Kenapa harus diputuskan sekarang?
- **Opsi yang Dipertimbangkan**:
  1. **Opsi A** — deskripsi singkat.
     - ✅ Pro …
     - ❌ Kontra …
  2. **Opsi B** — deskripsi singkat.
     - ✅ Pro …
     - ❌ Kontra …
  3. **Opsi C** — deskripsi singkat.
     - ✅ Pro …
     - ❌ Kontra …
- **Keputusan**: Opsi yang dipilih dan alasan singkat (1-2 kalimat inti).
- **Konsekuensi**:
  - ✅ Dampak positif …
  - ⚠️ Trade-off yang secara sadar diterima …
- **Catatan Revisi**: (opsional) Kalau ada perubahan di masa depan, catat ADR follow-up di sini.
- **Bukti di kode**: link file/line yang mengimplementasikan keputusan ini.
```

---

## Panduan: Kapan Harus Buat ADR Baru?

Tulis ADR **sebelum** melakukan perubahan (kalau bisa) atau segera setelahnya. Kriteria:

### 🟢 Wajib ADR

- Ganti / tambah komponen stack utama (framework, database, CMS, hosting).
- Perubahan biaya bulanan signifikan (>20% budget total).
- Ubah struktur monorepo (pindah/split package).
- Ubah RBAC (tambah role, ubah semantics existing).
- Ubah mekanisme rendering global (SSG → SSR, dll.).
- Ubah booking / payment flow.
- Tambah integrasi pihak ketiga baru (analytics, payment, chat, email provider).
- Migrasi database besar (rename collection, split field, restructure relation).
- Ubah authentication mekanisme.
- Ubah struktur URL routing global.

### 🟡 Disarankan ADR

- Pilih library non-trivial baru (mis. state manager, animation lib).
- Adopsi convention baru (mis. commit convention, folder pattern).
- Ubah CI/CD workflow.
- Restructure feature module.

### 🔴 Tidak perlu ADR

- Bug fix.
- Add field ke collection existing.
- Ubah style/CSS.
- Update konten (yg memang untuk CMS).
- Update dependency non-breaking.
- Refactor internal komponen tanpa perubahan API.

### Aturan format

- Nomor urut naik (**ADR-021 selanjutnya**), tidak pernah reuse.
- Kalau keputusan direvisi total, buat ADR baru dgn status "Menggantikan ADR-XXX" — jangan hapus ADR lama.
- Tulis konteks apa adanya. Termasuk opsi yang **ditolak** — 6 bulan lagi kamu (atau developer lain) akan bertanya "kenapa kita tidak pakai X?" — jawabannya harus ada di sini.

---

## Referensi silang

- Arsitektur teknis → [01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md)
- Skema database → [02-DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md)
- Content model & inkonsistensi → [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md)
- RBAC implementation → [04-RBAC.md](docs/04-RBAC.md)
- Infra Cloudflare → [05-INFRA.md](docs/05-INFRA.md)
- Runbook maintenance → [06-MAINTENANCE-RUNBOOK.md](docs/06-MAINTENANCE-RUNBOOK.md)
