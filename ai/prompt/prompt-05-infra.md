# PROMPT 05 — INFRA.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/05-INFRA.md`**

---

## Instruksi

Kamu adalah AI DevOps engineer yang sedang mendokumentasikan infrastruktur proyek **DnJourneysBali**.

### Konteks Proyek
- **Frontend** (`apps/web` - Astro): Deploy ke **Cloudflare Pages** (Free Tier)
- **Backend/CMS** (`apps/cms` - Payload CMS 3.x): Deploy ke **Cloudflare Workers** (Paid $5/bulan)
- **Database**: **Cloudflare D1** (SQLite-compatible, serverless)
- **Media Storage**: **Cloudflare R2** (S3-compatible object storage)
- **Budget**: ~$5/bulan total
- **Monorepo**: `apps/web` + `apps/cms` + `packages/shared`
- **Tujuan**: Template reusable — deploy stack yang sama untuk client lain dengan minimal perubahan

### Task

**Langkah 1 — AUDIT:**
- Baca `wrangler.toml` atau `wrangler.jsonc` jika ada
- Baca konfigurasi build di `apps/web` dan `apps/cms`
- Baca `.env.example` atau environment config yang ada
- Baca `package.json` scripts di root dan masing-masing app

**Langkah 2 — GENERATE:**
Buatkan `docs/05-INFRA.md` sebagai blueprint dan SOP deployment.

### Konten Wajib

#### 1. ARSITEKTUR INFRASTRUKTUR & TOPOLOGI CLOUDFLARE
- **Diagram Mermaid** topologi jaringan/infrastruktur
- Alur trafik: User → Cloudflare DNS → Pages (Astro) → Workers (Payload API) → D1 (Database) & R2 (Media)
- Penjelasan peran masing-masing layanan Cloudflare
- Estimasi biaya per layanan dan total bulanan

#### 2. ENVIRONMENT VARIABLES & SECRETS
Daftar lengkap variabel `.env` untuk masing-masing app:

**`apps/web` (Cloudflare Pages):**
| Variable | Tipe | Contoh | Deskripsi |
|----------|------|--------|-----------|

**`apps/cms` (Cloudflare Workers):**
| Variable | Tipe | Contoh | Deskripsi |
|----------|------|--------|-----------|

- Klasifikasi: **Publik** (PUBLIC_*) vs **Secret** (API keys, credentials)
- Panduan menyimpan Secrets:
  - Via Cloudflare Dashboard (langkah + screenshot path)
  - Via Wrangler CLI: `wrangler secret put VARIABLE_NAME`

#### 3. KONFIGURASI DOMAIN & DNS
- Menghubungkan Custom Domain ke Cloudflare Pages (`example.com`, `www.example.com`)
- Menghubungkan Subdomain ke Workers (`cms.example.com` atau `api.example.com`)
- SSL/TLS setup (Full/Strict)
- CORS rules di Workers agar API Payload bisa diakses dari Astro frontend
- Langkah demi langkah dengan path navigasi di Cloudflare Dashboard

#### 4. KONFIGURASI FILE UTAMA
- Template/contoh `wrangler.jsonc` / `wrangler.toml` untuk `apps/cms`:
  - Binding D1 Database (`d1_databases`)
  - Binding R2 Bucket (`r2_buckets`)
  - Compatibility flags
- Konfigurasi build Astro (`astro.config.mjs`) untuk Cloudflare Pages adapter
- Konfigurasi Payload untuk D1 + R2

#### 5. CHEAT SHEET PERINTAH CLI
Daftarkan semua command yang dibutuhkan sehari-hari:

**Setup Awal (sekali saja):**
```
# Buat D1 Database
# Buat R2 Bucket
# Set secrets
```

**Local Development:**
```
# Jalankan Astro dev server
# Jalankan Payload/Workers dev server lokal (miniflare/wrangler dev)
# Emulator D1/R2 lokal
```

**Database Migration:**
```
# Buat migrasi baru
# Jalankan migrasi di lokal
# Jalankan migrasi di production D1
```

**Build & Deploy:**
```
# Build + Deploy Frontend ke Pages
# Build + Deploy Backend ke Workers
# Deploy keduanya sekaligus (jika ada script)
```

#### 6. MAINTENANCE, BACKUP & TROUBLESHOOTING
- **Backup D1**: Cara export/backup data dari D1
- **Backup R2**: Cara backup media files dari R2
- **Monitoring Logs**: `wrangler tail` untuk real-time logs
- **Troubleshooting umum**:
  - Workers error 500 → cek apa?
  - D1 migration gagal → langkah recovery?
  - R2 upload gagal → kemungkinan penyebab?
  - Pages build gagal → cek apa di dashboard?

#### 7. CHECKLIST DEPLOY CLIENT BARU (Template Reuse)
Karena ini template reusable, buatkan checklist langkah deploy untuk client travel agency baru:
- [ ] Fork/clone repo
- [ ] Buat D1 database baru
- [ ] Buat R2 bucket baru
- [ ] Set environment variables
- [ ] Jalankan migrasi
- [ ] Deploy Pages + Workers
- [ ] Konfigurasi domain
- [ ] Seed data awal

### Aturan Penulisan
1. **Wajib baca konfigurasi proyek dulu** — jangan mengarang command atau config
2. Ditulis dalam **Bahasa Indonesia** yang lugas
3. Diagram Mermaid harus valid
4. Command CLI harus akurat sesuai Cloudflare/Wrangler terbaru
5. Jika konfigurasi belum ada (misal wrangler.toml belum dibuat), tandai `<!-- TODO: file belum ada, perlu dibuat -->` dan berikan template yang direkomendasikan
6. Hanya buat `docs/05-INFRA.md` — jangan ubah file lain
