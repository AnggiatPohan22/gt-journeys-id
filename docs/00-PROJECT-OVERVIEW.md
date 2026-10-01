# 00 — PROJECT OVERVIEW

> Pintu masuk dokumentasi proyek **GtJourneysID**. Baca file ini dulu sebelum yang lain. Detail teknis ada di file-file `01`-`07`.
>
> Estimasi baca: **5-10 menit**.

---

## 1. Tentang Proyek

**GtJourneysID** adalah website travel agency berbasis di Bali dengan **7 modul layanan** — tours, akomodasi, water activities, yacht, restoran, wedding venue, rental. Website ini juga dirancang sebagai **template reusable** yang bisa dideploy ulang untuk client travel agency lain dengan modifikasi minimal (ganti brand + toggle modul + isi konten).

### Tujuan bisnis
- Landing pengunjung dari organic search / social → convert jadi lead lewat **WhatsApp direct booking** (bukan payment gateway online). Match pola konsumsi turis Bali & customer lokal Indonesia.
- Menampilkan katalog lengkap layanan dengan foto berkualitas + informasi lengkap (itinerary, pricing tier, amenity, dsb.).

### Tujuan teknis
- **Fast + murah**: LCP < 1s, hosting ~$5/bulan.
- **CMS-driven**: content team bisa maintain 90%+ website tanpa developer.
- **Reusable**: satu codebase → banyak client. Setup client baru ~1 jam (lihat [05-INFRA.md](docs/05-INFRA.md) §7).

### Siapa yang pakai
- **Pengunjung website** — turis (domestik + internasional) yang cari tour/villa/wedding di Bali.
- **Editor/Content staff** — bikin/update entry tour, upload foto, edit deskripsi.
- **Manager/Admin travel agency** — publish konten, kelola operasi harian, add product baru.
- **Owner (Super Admin)** — kelola brand, setting global, user, halaman baru.

---

## 2. Stack Teknologi (Ringkas)

| Layer | Teknologi | Fungsi |
|---|---|---|
| **Frontend** | Astro 5 + Tailwind CSS + GSAP + Alpine.js | Static site, HTML-first (zero JS by default), deploy ke Cloudflare Pages. |
| **CMS / Backend** | Payload CMS 3.x (Next.js 15) | Admin panel, REST API, auth, RBAC. Deploy ke Cloudflare Workers via OpenNext. |
| **Database** | Cloudflare D1 (SQLite serverless) | Data konten. Native binding di Worker. |
| **Media Storage** | Cloudflare R2 (S3-compatible) | Upload gambar/video editor. Egress gratis. |
| **Hosting** | Cloudflare Pages + Workers | Full stack di satu vendor, ~$5/bulan. |
| **Shared** | `packages/shared` — TypeScript types + utils | Kontrak data antara web ↔ cms. |

Detail: [01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md).

---

## 3. Modul Layanan

Ada **7 modul service** (prompt awal menyebut 8, tapi implementasi = 7 + Destinations sebagai supporting collection):

| Modul | Collection Payload | Halaman detail | Contoh use case |
|---|---|---|---|
| Tours & Activities | `tours` | `/tour/[slug]` | Day trip, cultural tour, private guide |
| Villas & Hotels (Accommodations) | `accommodations` | `/villa/[slug]` atau `/accommodations/[slug]` | Villa Uluwatu, hotel Ubud, guesthouse Canggu |
| Water Activities | `water-activities` | `/water-activity/[slug]` | Snorkeling, diving, surf, jet ski |
| Private Yacht | `yachts` | `/yacht/[slug]` | Sunset cruise, private charter |
| Restaurants | `restaurants` | `/restaurant/[slug]` | Cliffside dining, cafe, bar |
| Weddings & Events (Venues) | `venues` | `/venue/[slug]` | Beach wedding, garden ceremony |
| Rental Service | `rentals` | `/rental/[slug]` | Motorbike, car, surfboard, gear |

### Module Toggle

Setiap modul bisa di-**enable/disable per client** lewat [apps/web/src/config/modules.ts](apps/web/src/config/modules.ts). Client yang cuma jual villa? Matikan 6 modul lain — nav & footer otomatis menyesuaikan.

⚠️ Saat ini toggle masih di file (butuh deploy). Rekomendasi migrasi ke CMS global ada di [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md) §3.4.

Detail struktur data tiap modul: [02-DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md).

---

## 4. Peta Dokumentasi

Baca sesuai kebutuhan — tidak wajib berurutan setelah file ini.

| No | File | Isi | Baca kapan |
|---|---|---|---|
| **00** | **PROJECT-OVERVIEW.md** *(kamu di sini)* | Ringkasan & peta navigasi | **Pertama kali** kenal proyek |
| 01 | [ARCHITECTURE.md](docs/01-ARCHITECTURE.md) | Struktur monorepo, alur data Astro ↔ Payload, strategi rendering (SSG/SSR/ISR), lokasi file per task | Mau paham struktur kode, kenapa perubahan CMS tidak langsung tampil |
| 02 | [DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md) | ERD, data dictionary tiap collection & global, SOP tambah field/collection, indexing | Mau tambah/ubah tabel/field/relasi, atau ngerti struktur data |
| 03 | [CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md) | Audit no-hardcode: mana CMS-driven vs hardcoded, rekomendasi migrasi, panduan akses per role | Mau tau apa yang bisa diubah dari CMS vs harus edit kode |
| 04 | [RBAC.md](docs/04-RBAC.md) | Matriks akses 3 role (Super Admin/Admin/Editor), snippet implementasi access, cara tambah role baru, testing | Mau ubah access control atau tambah user |
| 05 | [INFRA.md](docs/05-INFRA.md) | Topologi Cloudflare, env vars, domain setup, CLI cheat sheet, backup, checklist deploy client baru | Setup deploy pertama, provisioning, ganti domain, atau setup client baru |
| 06 | [MAINTENANCE-RUNBOOK.md](docs/06-MAINTENANCE-RUNBOOK.md) | 3-Tier task guide (CMS / edit kode / dev), FAQ troubleshoot, jadwal maintenance berkala | **Setiap hari** — buka saat mau kerjain task rutin |
| 07 | [DECISION-LOG.md](docs/07-DECISION-LOG.md) | 17 ADR — konteks + trade-off setiap keputusan arsitektur besar | Mau tau "kenapa dulu kita pilih X, bukan Y?" atau sebelum bikin perubahan besar |

**Rekomendasi urutan baca**:
- Onboarding developer baru: 00 → 01 → 02 → 04 → 05
- Content manager / editor: 00 → 06 (Tier 1)
- Solo maintainer harian: 06 (semua tier)
- Mau ambil keputusan besar: 07 dulu — jangan repeat diskusi

---

## 5. Status Proyek & Roadmap

### Yang sudah jadi ✅
- **Fase 1** — Setup monorepo, Astro + Payload skeleton, D1 + R2 config lokal.
- **Fase 2** — 7 service collections lengkap dengan field-field domain (pricing, quickSpecs, itinerary, room types, dsb.).
- **Fase 3** — Page builder Payload blocks (16 block types), rich text Lexical dengan design token, Header/Footer CMS-driven, homepage hybrid (CMS + fallback).
- **Fase 3.7** — Custom Sections per service (super-admin only), Service Listing block, Trust Badges, filter/search.
- **RBAC 3-role** — implementasi collection & field-level access.

### Yang sedang / segera ⚠️
- **Deploy production** ke Cloudflare (config `wrangler.toml` ada, tapi ada gap):
  - `r2Storage` plugin belum di-register di [payload.config.ts](apps/cms/src/payload.config.ts) — **kritis**, kalau tidak upload media di production akan gagal.
  - D1 adapter masih pakai `@libsql/client` file-based; produksi butuh switch ke D1 binding native.
  - `PAYLOAD_SECRET` masih plaintext di `[vars]` — harus pindah ke `wrangler secret put`.
- Beberapa field CMS didefinisikan tapi belum di-render frontend: `favicon`, `defaultSeo.ogImage` (fallback), `googleAnalyticsId`, `footer.additionalScripts`, `showNewsletter`. Lihat inkonsistensi di [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md) §2.9.
- Halaman `/property` masih hardcoded Bahasa Indonesia — kandidat migrasi ke Page CMS.

### Roadmap ⏳
- **Migrasi Module Toggle ke CMS** — global `module-toggle` di Payload agar Super Admin bisa on/off modul tanpa deploy.
- **ISR / Deploy Hook otomatis** — trigger rebuild Astro dari Payload `afterChange` hook, biar editor publish → 1-2 menit muncul di web (sekarang manual rebuild).
- **Integrasi Analytics** — inject Google Analytics ID + additional scripts dari SiteSettings.
- **Newsletter** — implementasi field `showNewsletter` yang saat ini reserved.
- **Multi-language (opsional)** — belum di-scope, tapi Payload native support locales.
- **Client baru** — deploy template untuk agency lain, sesuai checklist [05-INFRA.md](docs/05-INFRA.md) §7.

Konteks kenapa memilih pola-pola di atas: lihat [07-DECISION-LOG.md](docs/07-DECISION-LOG.md) (17 ADR).

---

## 6. Quick Start — Jalankan Lokal

### Prerequisites

- **Node.js** ≥ 18 (rekomendasi 20+)
- **pnpm** ≥ 9 — install: `npm install -g pnpm`
- **Wrangler CLI** — sudah termasuk sebagai dev dep, tidak perlu install global
- Editor: VS Code + extension Astro + Tailwind

### Setup (5 menit)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup env
# apps/web/.env
echo "CMS_URL=http://localhost:3030" > apps/web/.env

# apps/cms/.env — isi PAYLOAD_SECRET random (min 32 char)
echo "PAYLOAD_SECRET=$(openssl rand -hex 32)" > apps/cms/.env
echo "SERVER_URL=http://localhost:3030" >> apps/cms/.env
echo "SITE_URL=http://localhost:4321" >> apps/cms/.env

# 3. Generate TypeScript types dari schema Payload
pnpm generate:types
```

### Run

Buka dua terminal:

```bash
# Terminal 1 — CMS (Payload/Next di port 3030)
pnpm dev:cms
# → http://localhost:3030/admin (login pertama → auto-create super-admin)

# Terminal 2 — Frontend (Astro di port 4321)
pnpm dev:web
# → http://localhost:4321
```

CMS lokal pakai SQLite file (`apps/cms/cms.db`) — auto-created. Tidak perlu setup Cloudflare untuk dev.

### Langkah pertama setelah run

1. Login admin CMS → buat Super Admin (email + password).
2. Sidebar → **Content → Destinations** → buat minimal 1 destination (mis. "Bali", type=mainland).
3. Sidebar → **Services → Tours** → Create New → isi minimal title, slug, destination, description, featured image → Status = Published → Save.
4. Buka `http://localhost:4321/tours` → tour muncul.

Detail selanjutnya (deploy production, custom domain, seed data) → [05-INFRA.md](docs/05-INFRA.md).

---

## 7. Kontak & Ownership

- **Owner / Maintainer**: solo developer (anggiatcool1@gmail.com per env session).
- **Workflow development**: **Claude Code-assisted** — semua fitur, refactor, dan dokumentasi dibangun via pairing dengan Claude Code (sub-agents untuk research, main agent untuk implementasi). Aturan pembagian task manual vs AI ada di [06-MAINTENANCE-RUNBOOK.md](docs/06-MAINTENANCE-RUNBOOK.md) (3-tier system).
- **Repository**: monorepo lokal di `C:\laragon\www\gt-journeys-id` (belum di-inisialisasi git per env — kalau sudah, tambah remote di sini).
- **Deployment**: Cloudflare account owner-managed.

### Untuk kontribusi / handover

- Jangan skip `pnpm generate:types` setelah ubah schema — frontend akan kehilangan type safety.
- Jangan commit `.env` atau file dengan `PAYLOAD_SECRET`.
- Backup D1 mingguan (`wrangler d1 export`) — [06-MAINTENANCE-RUNBOOK.md](docs/06-MAINTENANCE-RUNBOOK.md) §Jadwal.
- Sebelum keputusan arsitektur besar (ganti CMS, ganti hosting, tambah role) → **tulis ADR** dulu di [07-DECISION-LOG.md](docs/07-DECISION-LOG.md).

---

## Ringkasan 30 Detik

**GtJourneysID** = website travel agency Bali + template reusable. **Astro** static frontend + **Payload CMS** on Cloudflare Workers + D1 + R2. Booking via **WhatsApp**. **7 modul** (Tours/Villa/WaterAct/Yacht/Restaurant/Wedding/Rental) togglable per client. **3-role RBAC** (Super Admin/Admin/Editor). Total infra **~$5/bulan**. Content team maintain 90%+ dari CMS; sisanya edit kode dgn panduan 3-tier di [06-MAINTENANCE-RUNBOOK.md](docs/06-MAINTENANCE-RUNBOOK.md).
