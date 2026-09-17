# 06 — MAINTENANCE RUNBOOK

> Panduan operasional harian **DnJourneysBali** untuk pemilik solo developer. Kerjakan sebanyak mungkin **Tier 1** (via CMS admin, no-code, aman) → **Tier 2** kalau harus edit kode (dengan panduan step-by-step) → **Tier 3** hanya kalau memang butuh AI/developer.
>
> Filosofi: *"Hal receh maintain sendiri; yang advance baru minta Claude Code."*

---

## Tier 1 — Bisa Sendiri via CMS (No-Code, Zero Risk)

Buka admin panel di **`https://cms.<domain>/admin`** (production) atau **`http://localhost:3030/admin`** (dev). Login pakai akun Super Admin / Admin / Editor sesuai kebutuhan.

Semua operasi di bawah ini **aman** — tidak akan merusak website walaupun salah. Kalau kepalang salah, tinggal edit lagi.

### 1.1 Kelola Konten Service (Tours, Villa, dst.)

Sidebar → **Services** → pilih koleksi (Tours / Accommodations / Water Activities / Yachts / Restaurants / Venues / Rentals).

| Task | Path admin | Role minimal |
|---|---|---|
| Lihat semua tour | Services → Tours | Editor |
| Edit tour existing (judul, deskripsi, harga, gambar) | Tours → klik entry → edit tab yang relevan → **Save** | Editor |
| Buat tour baru | Tours → **Create New** | Admin |
| Publish tour (draft → published) | Buka entry → sidebar **Status** = Published → Save | Admin |
| Unpublish (sembunyikan dari web) | Status = Draft → Save | Admin |
| Hapus tour | Buka entry → tombol **Delete** kanan atas | Super Admin |
| Feature di homepage | Buka entry → sidebar **Featured** = checked → Save | Editor |
| Ubah urutan tampil | Sidebar **Sort Order** — angka kecil = tampil dulu | Editor |

Pola sama untuk semua 7 koleksi service. Tab yang tersedia beda tiap koleksi (mis. Tours punya Itinerary, Accommodations punya Room Types, Rentals punya Pricing Tiers) — semua tab bisa diedit Editor+.

### 1.2 Upload & Manage Media (Gambar/Video)

Sidebar → **Content** → **Media**.

- **Upload baru**: klik **Create New** → drag file (jpeg/png/webp/svg/mp4) → isi **Alt Text** (wajib, untuk SEO & accessibility) → Save.
- **Ganti gambar di entry**: buka entry (mis. Tours) → tab Media → klik gambar → **Change** → pilih dari library atau upload baru.
- **Hapus**: buka Media entry → Delete (Admin+ only). Jangan hapus kalau masih dipakai entry lain — cek dengan search filename.

**Tips ukuran optimal:**
- Featured image (hero): landscape 16:9, min **1600×900px**.
- Gallery / kartu: min **1200×800px**.
- File akan otomatis di-resize jadi 3 varian (thumbnail 400×300, card 800×600, hero 1920×1080).

### 1.3 Edit Halaman & Homepage (Page Builder)

Sidebar → **Layout** → **Pages**.

- **Edit homepage** (kalau ada entry `slug=home`): buka → tab Content → drag & susun blocks (Hero, Gallery, CTA, dst.) → Save + Publish.
- **Buat halaman baru** (Super Admin only): Create New → isi Title + Slug → pilih Template → susun block → Save.
- **Ubah SEO halaman**: sidebar **SEO Settings** → metaTitle / metaDescription / ogImage.

**Blocks yang tersedia** (lihat detail di [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md)):
Hero, RichText, Image, Gallery, CTA, FAQ, Testimonials, ServiceGrid (auto-fetch tours/villas/dst.), Contact, Embed (YouTube/Map), Spacer, ValuePropsBanner, StatsBanner, TestimonialsCarousel, ServiceListing, TrustBadges.

### 1.4 FAQ & Testimonials

FAQ dan testimonials **bukan koleksi terpisah** — mereka **block** yang ditaruh di dalam Page.
- **Tambah FAQ ke halaman**: buka Page → Content → Add Block → **FAQ** → isi items (question + answer richText) → Save.
- **Tambah testimonial ke halaman**: Add Block → **Testimonials** atau **Testimonials Carousel** → isi items (name, quote, photo, rating).
- Testimonial khusus Venues (wedding): tab Testimonials di dalam entry Venue.

### 1.5 Kelola Menu Navigasi (Header & Footer)

Sidebar → **Layout** → **Menus** (Super Admin only).

- Menu utama biasanya slug `main-navigation`. Buka → **items[]** → tambah/edit/reorder item.
- Setiap item bisa expand — default **collapsed** biar rapi. Row label akan tampil sebagai `📄 Home — /` (label + preview URL + jumlah sub-item), bukan "Item 01".
- **Type item** (pilih di kanan Label):
  - `📄 Halaman Internal` — pilih Page dari relationship
  - `🧭 Service Index` — path modul (e.g. `/tours`)
  - `🔗 Custom URL` — URL bebas / eksternal
  - `⚓ Anchor` — `#contact`, `#faq`, dst.
  - `🏷️ Dropdown Only` — parent tidak clickable, cuma trigger sub-menu di hover (desktop) / label saja (mobile). Wajib dipakai bareng sub-menu.
- **Sub-menu (dropdown)**: buka item → **Sub-menu → Add sub-item**. Type sub-item punya opsi tambahan:
  - `🏷️ Label Only` — untuk header/group heading di dropdown (tidak clickable, tampil sebagai label bold)
  - Selain itu: `📄 Halaman Internal`, `🔗 Custom URL`, `⚓ Anchor` — sama seperti parent.
- Untuk mengaktifkan menu di header: **System → Header Settings → primaryMenu** → pilih menu.
- Footer kolom: **System → Footer Settings → columns[]** → tiap kolom pilih menu.

### 1.6 Setting Global Site (Logo, Kontak, WhatsApp, Social)

Sidebar → **System** → **Site Settings** (Super Admin only).

| Yang bisa diubah | Field |
|---|---|
| Nama website (title tag) | `siteName` |
| Tagline | `tagline` |
| Logo (light bg) | `logo` — upload |
| Logo (dark bg) | `logoDark` — upload |
| Favicon | `favicon` <!-- catatan: sekarang belum di-render frontend — lihat Tier 2 §2.5 --> |
| Email/Phone/WhatsApp/Address | group `contact` |
| Nomor WA (untuk semua CTA WhatsApp) | `contact.whatsapp` — format: `6281234567890` (dgn kode negara, tanpa `+` atau spasi) |
| Instagram/Facebook/TikTok/YouTube/Tripadvisor | group `socialMedia` |
| Default meta title & description | group `defaultSeo` |
| Google Analytics ID | `defaultSeo.googleAnalyticsId` <!-- belum di-inject, lihat Tier 3 --> |
| Copyright footer | `footer.copyrightText` |
| Business hours (tampil di footer) | `whatsappDefaults.businessHours` |

### 1.7 Header & Footer Behavior

**Header Settings** (System → Header Settings):
- `showCtaButton` — toggle tombol WhatsApp Booking di header
- `ctaText` — text tombol
- `ctaType` — `whatsapp` (pakai nomor dari SiteSettings) atau `custom` (pakai URL manual)
- `stickyOnScroll`, `transparentOnTop` — perilaku scrolling

**Footer Settings** (System → Footer Settings):
- Toggle 4 kolom independen: `showBrandColumn`, `showServicesColumn`, `showContactColumn`
- Isi `columns[]` untuk kolom menu editorial
- `servicesMenu` (opsional) — override daftar services default

### 1.8 Manage User (Super Admin only)

Sidebar → **System** → **Users**.

- **Buat user baru**: Create New → isi email, password, name, pilih role (Editor / Admin / Super Admin).
- **Ubah role**: buka user → sidebar Role → pilih baru → Save (hanya field yang bisa diubah Super Admin).
- **Reset password**: user login sendiri → klik nama kanan atas → Account → Change Password.

Role summary (detail di [04-RBAC.md](docs/04-RBAC.md)):
- **Editor** — edit isi existing service. Tidak bisa publish/create/delete.
- **Admin** — Editor + create + publish + toggle status service.
- **Super Admin** — semua + globals, menus, pages, users.

### 1.9 Chat Widget (Phase 4.50)

Chat widget mengambang di kanan-bawah setiap halaman. Konfigurasi lengkap di `/admin/globals/chat-widget` (Super Admin only).

**Master toggle**: `/admin/globals/site-features` → tab **Fitur Opsional** → `WhatsApp Floating Button` (nama flag legacy — sekarang mengontrol seluruh chat widget).

**8 tab konfigurasi**:
| Tab | Fungsi |
|---|---|
| General | enable, displayScope (all/home/custom), hide-mobile/desktop |
| Appearance | posisi, offset, warna, ukuran, animasi |
| Popup | title, subtitle, brand name, avatar header |
| Channels | blocks: WhatsApp / AI Chatbot / Live Chat / Email — drag reorder = urutan di popup |
| Availability | business hours + offline behavior (Phase 4.50.7 masih partial; UI ada, enforcement server datang kemudian) |
| Behavior | delay, scroll trigger, auto-open, exit intent, dismissible |
| Tracking | GA event name, UTM params, cookie consent gate |
| Security | 5 layer anti-spam: rate-limit + Turnstile/reCAPTCHA + backend validation + bot signals + IP/country |

**Menambah channel baru** (mis. buka WhatsApp CS baru):
1. Buka tab **Channels** → **Add Block** → **WhatsApp**.
2. Isi label, whatsappNumber (kosong = fallback ke SiteSettings.contact.whatsapp), prefilledMessage.
3. Save. Kartu baru muncul di popup frontend.

**Mengaktifkan AI Chatbot** (butuh env var + Anthropic API key):
1. Set env `ANTHROPIC_API_KEY` via `wrangler secret put ANTHROPIC_API_KEY`.
2. Set `CHAT_IP_HASH_SALT` (min 32 char) + `CHAT_VISITOR_COOKIE_SECRET` (min 32 char) sebagai secrets.
3. Provision KV: `wrangler kv:namespace create chat-rl` → salin id ke `wrangler.toml` binding `CHAT_RATE_LIMIT_KV`.
4. Di `/admin/globals/chat-widget` tab Channels → **Add Block** → **AI Chatbot** → isi provider=Anthropic, model, systemPrompt, welcomeMessage, `apiKeyRef=ANTHROPIC_API_KEY`.
5. Deploy web app.

**Audit trail** (`/admin/collections/*`):
- `chat-visitors` — cookie ID + IP hash + status. Read-only.
- `chat-messages` — inbound/outbound message log dengan content-hash + wasBlocked.
- `chat-blocked-events` — audit per rule triggered (rate-limit / honeypot / verification fail).

**Retention** — Otomatis via cron `0 3 * * *` (03:00 UTC = 10:00 WITA). Config di `chat-widget.auditRetentionDays` (default 30 hari). Manual jalankan:

```bash
cd apps/cms && pnpm retention:chat
```

Endpoint HTTP untuk external cron: `POST /api/chat-retention` dengan header `x-cron-key: <CHAT_RETENTION_CRON_KEY>`.

### 1.10 Toggle Module (semi-CMS)

⚠️ **Saat ini toggle module masih di file kode** ([apps/web/src/config/modules.ts](apps/web/src/config/modules.ts)) — bukan di CMS. Untuk enable/disable modul (mis. matikan "Weddings" karena klien tidak menawarkan), lihat Tier 2 §2.6.

---

## Tier 2 — Edit Kode Sendiri (Low Risk, dengan Panduan)

Untuk operasi di bawah, kamu perlu editor kode (VS Code) + terminal. Setelah edit, **wajib** rebuild + deploy web.

**Perintah rebuild + deploy setelah tiap perubahan Tier 2:**

```bash
pnpm build:web && pnpm deploy:web
```

Kalau perubahan menyentuh CMS/schema, tambahkan:

```bash
pnpm generate:types
pnpm deploy:cms
```

### 2.1 Ganti Warna Design System

**File**: [apps/web/tailwind.config.mjs](apps/web/tailwind.config.mjs)

Palette saat ini ("Tropical Sophistication"):

```js
colors: {
  ocean:    { DEFAULT: '#1B3A4B', light: '#2D5F73', dark: '#0D1B2A' },
  sand:     { DEFAULT: '#F5F0E8', dark: '#D4C5A9', light: '#FAF8F4' },
  coral:    { DEFAULT: '#E07A5F', light: '#E9A08D', dark: '#C4583E' },
  leaf:     { DEFAULT: '#6B9080', light: '#8FB3A5', dark: '#4A6B5C' },
  stone:    { DEFAULT: '#3D405B', light: '#6B6E8A', dark: '#2A2D42' },
  midnight: '#0D1B2A',
},
```

**Langkah:**
1. Tentukan warna baru (pakai [coolors.co](https://coolors.co) atau design tool).
2. Ganti nilai hex. Contoh ganti coral jadi merah bata:

   ```diff
   - coral: { DEFAULT: '#E07A5F', light: '#E9A08D', dark: '#C4583E' },
   + coral: { DEFAULT: '#B84C3C', light: '#D67566', dark: '#8B3529' },
   ```

3. Test lokal: `pnpm dev:web` → cek `http://localhost:4321`.
4. Deploy: `pnpm build:web && pnpm deploy:web`.

**Rollback**: `git checkout apps/web/tailwind.config.mjs` → redeploy.

### 2.2 Ganti Font

**File**: [apps/web/tailwind.config.mjs](apps/web/tailwind.config.mjs) + [apps/web/src/layouts/BaseLayout.astro](apps/web/src/layouts/BaseLayout.astro)

1. Download font woff2 baru (mis. dari Google Fonts) → taruh di `apps/web/public/fonts/`.
2. Update preload di BaseLayout.astro:

   ```diff
   - <link rel="preload" href="/fonts/plus-jakarta-sans-variable.woff2" as="font" type="font/woff2" crossorigin />
   + <link rel="preload" href="/fonts/nama-font-baru.woff2" as="font" type="font/woff2" crossorigin />
   ```

3. Update `@font-face` di [apps/web/src/styles/global.css](apps/web/src/styles/global.css) (kalau ada).
4. Update `fontFamily` di tailwind.config.mjs:

   ```diff
   - body: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
   + body: ['Nama Font Baru', ...defaultTheme.fontFamily.sans],
   ```

5. Rebuild + deploy.

### 2.3 Ganti Logo

**Option A — via CMS** (paling gampang, Tier 1):
Upload ke Media → Site Settings → field `logo` → pilih → Save.

**Option B — ganti fallback default** (kalau CMS SiteSettings kosong):
1. Taruh file logo baru di `apps/web/public/` (mis. `logo.svg`).
2. Header/Footer akan tampilkan huruf inisial kalau logo CMS kosong — untuk pakai file static, edit [apps/web/src/components/navigation/Header.astro:93](apps/web/src/components/navigation/Header.astro#L93):

   ```diff
   - <span aria-hidden="true" class="h-10 w-10 rounded-full bg-ocean...">{siteName.slice(0, 2)}</span>
   + <img src="/logo.svg" alt={logoAlt} class="h-10 w-10 object-contain" />
   ```

### 2.4 Ganti Favicon

**File**: [apps/web/public/favicon.svg](apps/web/public/favicon.svg) — ganti file dengan favicon baru (nama sama).

Rebuild + deploy. Cache browser mungkin tahan lama — test dengan hard refresh (Ctrl+Shift+R).

<!-- Catatan inkonsistensi: Site Settings punya field `favicon` upload tapi frontend belum baca. Untuk pakai favicon dari CMS, lihat Tier 3. -->

### 2.5 Edit Meta Tags SEO Default (fallback saat CMS kosong)

**File**: [apps/web/src/config/site.ts](apps/web/src/config/site.ts)

```ts
defaultSeo: {
  title: 'DnJourneysBali — Tours, Villas, Activities in Bali',
  description: 'Discover the best of Bali...',
  ogImage: '/og-default.jpg',
},
```

Ganti nilai → rebuild + deploy.

**Preferred**: isi via CMS — Site Settings → `defaultSeo`. (Meskipun sekarang frontend belum baca `defaultSeo.ogImage` sebagai fallback — Tier 3.)

### 2.6 Enable/Disable Module

**File**: [apps/web/src/config/modules.ts](apps/web/src/config/modules.ts)

Contoh: matikan "Weddings" karena klien tidak menawarkan.

```diff
- weddings: { enabled: true,  label: 'Weddings & Events', slug: 'weddings', icon: 'heart', collection: 'venues' },
+ weddings: { enabled: false, label: 'Weddings & Events', slug: 'weddings', icon: 'heart', collection: 'venues' },
```

Efek: modul hilang dari Footer services column default. Halaman `/weddings/*` tetap teregister (routing Astro), tapi tidak di-link.

Untuk full-block route juga, hapus/skip file `apps/web/src/pages/weddings/*.astro` dan `venue/*.astro`. **Rollback**: `git checkout apps/web/src/config/modules.ts`.

### 2.7 Tambah Field Sederhana ke Collection Existing

Contoh: tambah field `bookingLeadTime` (text) ke Tours.

1. Edit [apps/cms/src/collections/Tours.ts](apps/cms/src/collections/Tours.ts) — sisipkan di tab Overview:

   ```ts
   { name: 'bookingLeadTime', type: 'text', admin: { description: 'Mis: "Min. H-1", "48 jam"' } },
   ```

2. Regenerate types:

   ```bash
   pnpm generate:types
   ```

3. Migrate DB (dev):

   ```bash
   pnpm dev:cms
   # Drizzle akan menanyakan "add column?" — jawab Yes
   ```

4. Migrate production D1:

   ```bash
   cd apps/cms
   pnpm payload migrate:create
   wrangler d1 migrations apply dn-journeys-db --remote
   ```

5. Deploy CMS: `pnpm deploy:cms`.

6. (Opsional) Render field di frontend — edit [apps/web/src/pages/tour/[slug].astro](apps/web/src/pages/tour/[slug].astro), tambahkan:

   ```astro
   {item.bookingLeadTime && (
     <p class="text-sm text-stone">Lead time: {item.bookingLeadTime}</p>
   )}
   ```

7. Rebuild + deploy web.

**Rollback**: revert file collection + regenerate types + migrate rollback (backup D1 dulu).

### 2.8 Update Konten Statis Hardcoded

Halaman/konten yang **masih hardcoded** (lihat [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md) §2):

| Konten | File |
|---|---|
| Halaman `/property` (Coming Soon) | [apps/web/src/pages/property.astro](apps/web/src/pages/property.astro) |
| Empty-state text di listing pages | `apps/web/src/pages/<module>/index.astro` |
| Header/Footer nav fallback (kalau menu CMS kosong) | Header.astro & Footer.astro |
| Homepage fallback (jika Page slug=home tidak ada) | [apps/web/src/pages/index.astro](apps/web/src/pages/index.astro) — konstanta `fallbackHero`, `fallbackValueProps`, dst. |

Edit teks → rebuild + deploy. **Solusi lebih baik**: pindahkan ke CMS lewat Page slug=home (Tier 1).

---

## Tier 3 — Wajib Claude Code / Developer

Kalau tugas kamu ada di daftar ini, jangan coba-coba tangan kosong — pakai Claude Code atau panggil developer.

- **Buat halaman dgn layout unik** yang tidak bisa disusun dari 16 block yang ada (mis. halaman booking calendar interactive).
- **Buat block baru** untuk page builder (mis. `PricingTable`, `MapExplorer`). Butuh definisi block di `apps/cms/src/blocks/index.ts` + komponen render di `apps/web/src/components/blocks/` + register di `BlockRenderer.astro`.
- **Tambah collection baru** (mis. `blog-posts`, `packages`).
- **Ubah struktur URL routing** (mis. rename `/villa` → `/stays`).
- **Migrasi database besar** — restructure field, split collection, ubah tipe field yang sudah punya data.
- **Integrasi pihak ketiga**:
  - Google Analytics — inject `googleAnalyticsId` dari SiteSettings ke `<head>` (gap saat ini).
  - Payment gateway (Midtrans/Xendit).
  - Newsletter provider (Mailchimp/Resend).
  - Live chat (Tawk.to, Intercom).
  - Booking calendar (Calendly, custom).
- **Perubahan RBAC** — tambah role baru, ubah field-level access, tambah row-level ownership.
- **Setup client baru** dari template — provisioning Cloudflare, custom domain, seed data awal. Lihat [05-INFRA.md](docs/05-INFRA.md) §7.
- **Performance optimization** — image lazy loading strategy, code splitting, bundle analysis, LCP/INP tuning.
- **Bug hunting cross-file** — TypeScript error yang menyebar, race condition, memory leak.
- **Register `r2Storage` plugin di payload.config.ts** — belum di-wire (bug latent kalau media upload di production Worker).
- **Setup CI/CD pipeline** — GitHub Actions untuk auto-deploy.
- **Cloudflare Deploy Hook / ISR webhook** — trigger rebuild web otomatis saat editor publish.

Untuk pakai Claude Code, jelaskan konteks + file yang mau diubah + goal-nya. AI akan minta lihat file dulu sebelum modif.

---

## Cheat Sheet Command Harian

### Development

```bash
# Root repo
pnpm dev:cms                  # start CMS (localhost:3030)
pnpm dev:web                  # start Astro (localhost:4321)

# Build produksi (uji lokal)
pnpm build:web                # → apps/web/dist/
pnpm build:cms                # next build
```

### Deploy

```bash
pnpm deploy:web               # astro build + wrangler pages deploy
pnpm deploy:cms               # next build + opennextjs + wrangler deploy

# Deploy dua-duanya
pnpm deploy:cms && pnpm deploy:web
```

### Database (Payload + D1)

```bash
pnpm generate:types           # regenerate packages/shared/src/types/payload-types.ts

cd apps/cms
pnpm payload migrate:create   # bikin file migrasi baru
pnpm payload migrate          # jalankan migrasi ke DB lokal

# Production D1
wrangler d1 migrations apply dn-journeys-db --remote

# Backup
wrangler d1 export dn-journeys-db --remote --output=backup-$(date +%Y%m%d).sql

# Query manual
wrangler d1 execute dn-journeys-db --remote --command "SELECT COUNT(*) FROM tours;"
```

### Media (R2)

```bash
wrangler r2 bucket list                           # cek bucket
wrangler r2 object list dn-journeys-media --remote

# Backup ke lokal (kecil-kecilan)
wrangler r2 object get dn-journeys-media/<key> --file=./backup/<key>

# Backup masif → pakai rclone (setup sekali)
rclone sync r2:dn-journeys-media ./r2-backup --transfers=8
```

### Monitoring

```bash
wrangler tail dn-journeys-cms                    # log real-time Worker
wrangler tail dn-journeys-cms --status error     # error only
```

### Secrets

```bash
cd apps/cms
wrangler secret put PAYLOAD_SECRET               # set/update
wrangler secret list                             # cek nama secret (nilai tidak tampil)
wrangler secret delete OLD_SECRET_NAME
```

### Git basics

```bash
git status                    # cek perubahan
git diff                      # lihat isi perubahan
git add <file>                # stage file tertentu (hindari `git add .`)
git commit -m "feat: tambah field bookingLeadTime di Tours"
git push
git log --oneline -20         # 20 commit terakhir
git checkout <file>           # rollback file yang belum di-commit
```

---

## Troubleshooting Umum (FAQ)

### "Konten sudah diupdate di CMS tapi belum muncul di website"

**Penyebab umum:**
1. Website mode **SSG (static)** — harus rebuild web setelah publish.
2. Status entry masih **Draft** (bukan Published).
3. Cache CDN Cloudflare masih menyimpan versi lama.

**Solusi:**
1. Cek status entry — sidebar Status = Published.
2. Trigger rebuild: `pnpm deploy:web` (atau setup deploy hook di CF Pages → auto trigger dari CMS afterChange hook — lihat Tier 3).
3. Hard refresh browser (Ctrl+Shift+R) atau purge cache di CF Dashboard → Caching → Purge Everything.

### "Build error saat deploy"

**Cek langkah:**
1. Baca output error — biasanya ada file:line.
2. `pnpm build:web` lokal dulu — apakah reproduces?
3. TypeScript error → cek apakah `pnpm generate:types` sudah dijalankan setelah ubah schema.
4. Astro fetch fail di build → cek `CMS_URL` env di Pages dashboard, dan cek CMS Worker live (`curl https://cms.<domain>/api/tours`).
5. Cek build log di Cloudflare Dashboard → Pages → Deployments → klik deploy → View log.

### "Gambar tidak muncul di website"

1. **Cek URL image** di browser DevTools → Network tab → status 404? → media file hilang di R2. Cek `wrangler r2 object list dn-journeys-media --remote`.
2. **CORS error** di console? → `SITE_URL` di CMS salah — update di `wrangler.toml [vars]` + redeploy.
3. **`r2Storage` plugin belum di-register** di [payload.config.ts](apps/cms/src/payload.config.ts) — media disimpan di filesystem worker (ephemeral). Perbaikan: Tier 3.
4. **Alt text kosong** — bukan error tapi bikin gambar tidak accessible; isi alt di Media entry.

### "User baru tidak bisa login ke CMS"

1. Verifikasi email + password benar (case-sensitive).
2. Reset password: login sebagai Super Admin → Users → buka user → **Save** dengan password baru (atau minta user pakai fitur forgot password kalau sudah di-enable).
3. Cek `PAYLOAD_SECRET` di production — kalau baru diganti, session lama invalidated (semua user harus re-login).
4. Cek koneksi CMS — buka `/api/users/me` dgn credential — status 200 = OK.

### "Module toggle dimatikan tapi halaman masih muncul"

Toggle di `modules.ts` **hanya menyembunyikan link di footer** — routing Astro tetap ada.

Solusi:
1. Hapus/rename folder halaman: mis. rename `apps/web/src/pages/weddings/` → tidak akan di-build.
2. Atau tambah guard di halaman:
   ```astro
   ---
   import { modules } from '@config/modules'
   if (!modules.weddings.enabled) return Astro.redirect('/')
   ---
   ```
3. Rebuild + deploy.

### "Error saat upload media file besar"

- Batas upload Cloudflare Workers: **~100MB request body**.
- Batas image `sharp` processing default: ~50MB.
- Solusi:
  - Compress video/foto sebelum upload (mis. HandBrake untuk video, TinyPNG untuk foto).
  - Untuk video besar (>50MB), upload ke Cloudflare Stream / YouTube dan pakai block `Embed`.

### "Website lambat setelah banyak konten"

1. **Build time lama?** — normal kalau > 500 entries di SSG mode. Consider incremental / hybrid mode (Tier 3).
2. **Halaman list lama load?** — kurangi `limit` di query, atau tambah client-side pagination.
3. **Image belum optimized** — pastikan pakai varian `sizes.card` / `sizes.thumbnail` bukan original hero, di kartu.
4. **Cache CDN off** — cek Cloudflare Caching Level = Standard, browser TTL ≥ 4h.
5. Cek Web Vitals via CF Analytics → Web Analytics.

### Lainnya

- **"CMS admin lambat / hang"** → biasanya D1 cold start (worker baru dimulai). Tunggu 5-10 detik. Kalau persist, `wrangler tail` untuk lihat error.
- **"Perubahan di `apps/cms/src/collections/*.ts` tidak refresh"** → matikan dev server (Ctrl+C) → `rm -rf apps/cms/.next` → `pnpm dev:cms` lagi.

---

## Jadwal Maintenance Berkala

### Harian (5 menit)

- [ ] Cek CMS bisa login (`https://cms.<domain>/admin`) — kalau tidak bisa, lihat troubleshoot §5.
- [ ] Sekilas cek `wrangler tail dn-journeys-cms --status error` — ada error unusual?
- [ ] Balas inquiry WhatsApp yang masuk dari CTA site.

### Mingguan (15-30 menit)

- [ ] **Backup D1**: `wrangler d1 export dn-journeys-db --remote --output=backup/db-$(date +%Y%m%d).sql`
- [ ] **Backup R2**: `rclone sync r2:dn-journeys-media ./r2-backup` (setelah setup rclone sekali).
- [ ] Review Cloudflare Analytics — traffic normal? Ada spike error?
- [ ] Cek Web Analytics — top pages, referrer, bounce rate.
- [ ] Reply ke inquiries / update konten sesuai marketing plan.

### Bulanan (1-2 jam)

- [ ] Update dependencies non-major:
  ```bash
  pnpm update -r --interactive
  ```
  Test lokal sebelum deploy. Skip major bump kecuali Tier 3.
- [ ] Cleanup Media unused — cari file yang tidak referenced di entry manapun, hapus.
- [ ] Review performance:
  - PageSpeed Insights untuk halaman utama & 3 detail service teratas.
  - Cek Core Web Vitals.
- [ ] Audit content — buang tour/villa yang tidak aktif lagi, refresh copy.
- [ ] Rebuild web full — pastikan build masih sehat: `pnpm build:web`.

### Per Quarter (3 bulan sekali, ~1 hari)

- [ ] **Security audit**:
  - Rotate `PAYLOAD_SECRET` (setelah rotate, semua user re-login).
  - Review daftar user aktif — hapus akun mantan editor.
  - Cek log untuk failed login patterns.
- [ ] **RBAC review** — perubahan struktur tim? Update role assignment.
- [ ] **Dependencies major update** — Astro, Payload, Next, Wrangler. Test di branch terpisah dulu.
- [ ] **Update dokumentasi** — kalau ada perubahan schema/flow, sync `docs/*.md`.
- [ ] **Test disaster recovery**: restore backup D1 ke DB staging → verifikasi data.
- [ ] Cek Cloudflare billing — apakah masih di ~$5/bulan? Kalau naik, cari penyebab (traffic spike / R2 growth).

---

## Kalau ragu — Aturan 3-Tier Sederhana

1. **Hanya ubah konten (teks, gambar, angka)?** → Tier 1 (CMS).
2. **Ubah warna, font, atau teks yang belum bisa dari CMS?** → Tier 2 (edit kode + rebuild).
3. **Ubah struktur (field baru, halaman layout baru, integrasi)?** → Tier 3 (Claude Code).

## Referensi silang

- Arsitektur & alur data → [01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md)
- Skema database & SOP tambah field/collection → [02-DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md)
- CMS-managed vs hardcoded audit → [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md)
- Access control per role → [04-RBAC.md](docs/04-RBAC.md)
- Infrastruktur Cloudflare & deploy client baru → [05-INFRA.md](docs/05-INFRA.md)
