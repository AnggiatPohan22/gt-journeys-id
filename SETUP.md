# SETUP.md — Installation & Reusable Template Guide

Dokumen ini menjelaskan cara install project dari nol, menjalankan di lokal,
deploy ke production, dan cara reuse template ini untuk client baru.

---

## 1. Prerequisites

Pastikan tools berikut sudah terinstall di komputer kamu:

### Wajib

```
Node.js       v18+       → https://nodejs.org (pilih LTS)
pnpm          v9+        → npm install -g pnpm
Git           latest     → https://git-scm.com
```

### Untuk CMS Development

```
Wrangler CLI  latest     → pnpm add -g wrangler
                           (setelah install, jalankan: wrangler login)
```

### Untuk Production Deploy

```
Cloudflare Account       → https://dash.cloudflare.com (gratis untuk sign up)
Cloudflare Workers Plan  → $5/month (dibutuhkan hanya saat deploy CMS ke cloud)
GitHub Account           → Untuk connect Cloudflare Pages auto-deploy
```

### Cek Semua Sudah Ready

```powershell
node --version          # harus v18+
pnpm --version          # harus v9+
git --version           # harus terinstall
wrangler --version      # harus terinstall (untuk CMS)
```

---

## 2. Fresh Install — Project Baru

### Step 1: Clone Repository

```powershell
cd C:\laragon\www
git clone https://github.com/giattech/gt-journeys-id.git
cd gt-journeys-id
```

### Step 2: Install Dependencies

```powershell
pnpm install
```

Jika muncul prompt `pnpm approve-builds`, tekan `a` (select all) lalu Enter.
Packages yang perlu di-approve: esbuild, sharp, workerd.

### Step 3: Setup Environment Variables

```powershell
# Frontend
copy apps\web\.env.example apps\web\.env

# CMS (jika belum ada .env.example, buat manual)
```

Edit `apps/web/.env`:
```
CMS_URL=http://localhost:3000
SITE_URL=http://localhost:4321
```

Edit `apps/cms/.env` (atau `.dev.vars` untuk Wrangler):
```
PAYLOAD_SECRET=ganti-dengan-random-string-minimal-32-karakter
SERVER_URL=http://localhost:3000
```

Untuk generate random secret:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Jalankan CMS (Terminal 1)

```powershell
cd apps/cms
pnpm dev
```

CMS akan jalan di `http://localhost:3000/admin`.
Buka di browser → buat user pertama → user ini otomatis jadi super-admin.

### Step 5: Jalankan Frontend (Terminal 2)

```powershell
cd apps/web
pnpm dev
```

Frontend jalan di `http://localhost:4321`.
Halaman akan fetch data dari CMS di localhost:3000.

### Step 6: Verifikasi Semuanya Jalan

```
✅ http://localhost:3000/admin    → Payload CMS admin panel muncul
✅ http://localhost:3000/api/tours → Return JSON (mungkin kosong { docs: [] })
✅ http://localhost:4321          → Homepage Astro muncul
```

---

## 3. Troubleshooting Install

### Error: "pnpm not recognized"
```powershell
npm install -g pnpm
# Tutup dan buka ulang PowerShell
```

### Error: "wrangler not recognized"
```powershell
pnpm add -g wrangler
wrangler login
```

### Error: ".open-next/worker.js not found"
CMS belum di-build. Untuk development lokal, gunakan `next dev`
bukan `wrangler dev`. Wrangler hanya untuk production deploy.

### Error: "PAYLOAD_SECRET" warnings
Buat file `apps/cms/.env` dan isi PAYLOAD_SECRET dengan random string.

### Error: Port sudah dipakai
```powershell
# Ganti port CMS
cd apps/cms && pnpm dev -- --port 3001

# Ganti port frontend
cd apps/web && pnpm dev -- --port 4322
```

### Error: Tailwind styles tidak muncul
Pastikan Tailwind versi 3.4.x (bukan 4.x). Cek `apps/web/package.json`.

### Error: Frontend tidak bisa fetch dari CMS
Pastikan CMS sudah jalan di localhost:3000 SEBELUM start frontend.
Cek `apps/web/.env` → `CMS_URL=http://localhost:3000`.

---

## 4. Production Deploy — Cloudflare

### 4A. Deploy CMS ke Cloudflare Workers

**Pertama kali saja — provisioning resources:**

```powershell
cd apps/cms

# Login ke Cloudflare
wrangler login

# Buat D1 database
wrangler d1 create gt-journeys-db
# Output akan kasih database_id → copy ke wrangler.toml

# Buat R2 bucket untuk media
wrangler r2 bucket create gt-journeys-media
```

Edit `apps/cms/wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gt-journeys-db"
database_id = "paste-id-dari-output-tadi"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "gt-journeys-media"
```

**Deploy:**

```powershell
cd apps/cms
pnpm deploy
```

Setelah deploy selesai, CMS live di:
`https://gt-journeys-cms.<subdomain>.workers.dev/admin`

Buka URL tersebut → buat super-admin user → mulai isi content.

### 4B. Deploy Frontend ke Cloudflare Pages

**Option A — Auto-deploy via GitHub (Recommended):**

1. Push repo ke GitHub
2. Buka https://dash.cloudflare.com → Pages → Create a project
3. Connect GitHub repo
4. Setting:
   ```
   Build command:      cd apps/web && pnpm install && pnpm build
   Build output dir:   apps/web/dist
   Root directory:     /   (root of repo)
   ```
5. Add environment variable:
   ```
   CMS_URL = https://gt-journeys-cms.<subdomain>.workers.dev
   ```
6. Deploy → site live di `<project>.pages.dev`
7. (Optional) Add custom domain di Cloudflare Pages settings

Setiap push ke GitHub, frontend otomatis rebuild dan deploy.

**Option B — Manual deploy:**

```powershell
cd apps/web
pnpm build
wrangler pages deploy dist/ --project-name=gt-journeys-web
```

### 4C. Setup Webhook — CMS Auto-rebuild Frontend

Agar frontend rebuild otomatis saat content di-update di CMS:

1. Di Cloudflare Pages → Settings → Build hooks → Create hook
2. Copy webhook URL
3. Di Payload CMS, tambahkan afterChange hook yang hit webhook URL
   (atau setting di Cloudflare Pages: auto-deploy on webhook)

---

## 5. Reusable Template — Setup Client Baru

Template ini dirancang untuk di-reuse. Berikut step-by-step
untuk spin up website travel client baru.

### Step 1: Clone Template

```powershell
cd C:\laragon\www
git clone https://github.com/giattech/gt-journeys-id.git client-name-site
cd client-name-site

# Hapus git history lama, mulai fresh
Remove-Item -Recurse -Force .git
git init
git add .
git commit -m "Initial: clone from travel template"
```

### Step 2: Update Branding — Colors (5 menit)

Edit `apps/web/tailwind.config.mjs`:

```javascript
colors: {
  // Ganti warna sesuai brand client
  ocean:  { DEFAULT: '#1B3A4B', light: '#2D5F73', dark: '#0D1B2A' },
  sand:   { DEFAULT: '#F5F0E8', dark: '#D4C5A9', light: '#FAF8F4' },
  coral:  { DEFAULT: '#E07A5F', light: '#E9A08D', dark: '#C4583E' },
  leaf:   { DEFAULT: '#6B9080', light: '#8FB3A5', dark: '#4A6B5C' },
  stone:  { DEFAULT: '#3D405B', light: '#6B6E8A', dark: '#2A2D42' },
  midnight: '#0D1B2A',
},
```

Tips: Ganti `coral` (accent color) paling berdampak visual.
Ganti `ocean` (primary) untuk feel yang totally berbeda.

### Step 3: Update Branding — Fonts (10 menit)

Jika client mau font berbeda:
1. Download font .woff2 dari Google Fonts
2. Taruh di `apps/web/public/fonts/`
3. Update `@font-face` di `apps/web/src/styles/global.css`
4. Update `fontFamily` di `tailwind.config.mjs`

Jika font sama (Fraunces + Plus Jakarta Sans), skip step ini.

### Step 4: Toggle Service Modules (2 menit)

Edit `apps/web/src/config/modules.ts`:

```typescript
// Client ini hanya butuh Tours, Villas, dan Restaurants
export const modules = {
  tours:           { enabled: true,  ... },
  accommodations:  { enabled: true,  ... },
  waterActivities: { enabled: false, ... },  // ← matikan
  yacht:           { enabled: false, ... },  // ← matikan
  restaurants:     { enabled: true,  ... },
  weddings:        { enabled: false, ... },  // ← matikan
  rentals:         { enabled: false, ... },  // ← matikan
}
```

Module yang disabled: halaman listing/detail return 404,
item tidak muncul di navigasi.

### Step 5: Update Cloudflare Names (5 menit)

Edit `apps/cms/wrangler.toml`:
```toml
name = "client-name-cms"              # ← ganti

[[d1_databases]]
database_name = "client-name-db"       # ← ganti

[[r2_buckets]]
bucket_name = "client-name-media"      # ← ganti
```

### Step 6: Provisioning & Deploy

```powershell
# CMS resources
cd apps/cms
wrangler login
wrangler d1 create client-name-db
# Copy database_id ke wrangler.toml
wrangler r2 bucket create client-name-media

# Deploy CMS
pnpm deploy

# Frontend
# Push ke GitHub → connect Cloudflare Pages → add CMS_URL env var
```

### Step 7: Content Entry (1-3 jam)

1. Buka CMS admin panel
2. Buat super-admin user
3. Isi Site Settings (nama, logo, WA number, social media)
4. Tambah Destinations (lokasi-lokasi yang di-cover)
5. Tambah Categories per module
6. Isi service entries (tours, villas, dll)
7. Setup menus (header, footer navigation)
8. Buat static pages (About, Contact, Privacy Policy)

### Step 8: Final Checks

```
✅ Homepage menampilkan featured content
✅ Semua service listing pages berfungsi
✅ Detail pages menampilkan full info
✅ WhatsApp buttons mengarah ke nomor yang benar
✅ Mobile responsive — test di HP
✅ SEO meta tags terisi di setiap halaman
✅ Google Analytics terpasang (via Site Settings)
✅ Custom domain sudah pointing
```

### Checklist: Reuse Summary

| Step | What | Time |
|------|------|------|
| 1 | Clone + init git | 2 min |
| 2 | Ganti warna di Tailwind config | 5 min |
| 3 | Ganti font (opsional) | 10 min |
| 4 | Toggle modules on/off | 2 min |
| 5 | Update wrangler.toml names | 5 min |
| 6 | Provisioning D1 + R2 + deploy | 15 min |
| 7 | Content entry | 1-3 hours |
| 8 | Final QA checks | 30 min |
| **Total** | | **2-4 hours** |

---

## 6. Ongoing Maintenance

### Update Dependencies

```powershell
# Check outdated
pnpm outdated

# Update carefully (test after each major update)
pnpm update
```

Aturan update:
- Tailwind: stay on 3.4.x (jangan upgrade ke 4.x tanpa migrasi full)
- Payload: update minor versions aman, major versions perlu migrasi
- Astro: update minor versions aman
- GSAP: stable, jarang breaking changes

### Backup

- **Code:** Git + GitHub (sudah aman)
- **Database:** D1 otomatis di-manage Cloudflare (bisa export via wrangler)
- **Media:** R2 bucket (bisa sync ke local backup)

```powershell
# Export D1 database
wrangler d1 export gt-journeys-db --output=backup.sql

# Sync R2 bucket ke local (menggunakan rclone atau wrangler)
wrangler r2 object get gt-journeys-media/path/to/file
```

### Monitoring

- Cloudflare Dashboard → Analytics (traffic, errors)
- Cloudflare Workers → Logs (CMS errors)
- Google Analytics (visitor behavior)
