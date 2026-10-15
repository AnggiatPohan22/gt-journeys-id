# PROMPT 03 — CONTENT-MODEL.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/03-CONTENT-MODEL.md`**

---

## Instruksi

Kamu adalah AI content architect yang sedang mengaudit dan mendokumentasikan pemetaan konten proyek **DnJourneysBali**.

### Konteks Proyek
- **Frontend**: Astro di `apps/web` — components, pages, layouts
- **CMS**: Payload CMS 3.x di `apps/cms` — collections, globals
- **Prinsip Utama**: "No Hardcode" — semua konten website idealnya dikontrol dari CMS
- **Module Toggle**: Modul bisa di-enable/disable per client
- **RBAC**: Super Admin (full), Admin (edit existing + some create), Editor (edit existing only)
- **Status Konten**: Draft / Published system di Payload

### Task

**Langkah 1 — AUDIT:**
- Baca seluruh file halaman, komponen, dan layout di `apps/web` (Astro)
- Baca seluruh collections dan globals di `apps/cms` (Payload CMS)
- Identifikasi mana yang sudah terhubung ke CMS dan mana yang masih hardcoded

**Langkah 2 — GENERATE:**
Buatkan `docs/03-CONTENT-MODEL.md` berdasarkan audit tersebut.

### Konten Wajib

#### 1. DRAFT / PUBLISH & FEATURE TOGGLE SYSTEM
- Mekanisme status konten di Payload (Draft vs Published)
- Bagaimana Astro merespons status tersebut (halaman Draft tidak tampil di production?)
- Daftar modul/komponen yang memiliki toggle Enable/Disable atau Active/Inactive
- Contoh: Banner Promo, Modul Announcement, Form Kontak, Seksi Hero, module service toggle

#### 2. PEMETAAN: CMS-MANAGED vs HARDCODED (No-Hardcode Audit)
Buatkan **tabel matriks audit** dengan format:

| Nama Komponen / Halaman | Lokasi File (apps/web) | Sumber Data CMS (apps/cms) | Status | Deskripsi & Batasan Edit |
|-------------------------|----------------------|---------------------------|--------|------------------------|

Status pengelolaan:
- **[CMS Dynamic]**: Full dikontrol dari Payload CMS (teks, gambar, relasi)
- **[CMS Hybrid]**: Sebagian dinamis dari CMS, sebagian struktur/style masih hardcoded
- **[Hardcoded]**: Murni ditulis langsung di file Astro/TSX, belum terhubung ke CMS

Kelompokkan per area: Header, Footer, Homepage, Service Pages, About, Contact, dll.

#### 3. DAFTAR KONTEN HARDCODED & REKOMENDASI MIGRASI
Inventarisasi seluruh bagian [Hardcoded] dan [CMS Hybrid], lalu berikan rekomendasi:

- **Option A — Tetap Hardcoded**: Alasan mengapa idealnya tetap di kode (konfigurasi layout inti, meta tag teknis, komponen statis yang jarang berubah)
- **Option B — Migrasi ke Payload**: Langkah yang diperlukan jika ingin diintegrasikan ke CMS (Global/Collection baru yang harus dibuat, field yang ditambah)

Prioritaskan berdasarkan impact: mana yang paling sering perlu diubah oleh content manager?

#### 4. BATASAN AKSES & PANDUAN PENGELOLAAN UNTUK ADMIN
Panduan operasional yang jelas:

**BISA dilakukan Admin/Content Manager tanpa developer:**
- Contoh: Ganti teks hero, upload gambar baru, ubah harga tour, toggle module on/off, tambah item tour/villa baru, edit FAQ

**WAJIB melibatkan developer:**
- Contoh: Tambah halaman dengan layout baru, buat komponen/block baru, ubah struktur field CMS, perubahan design system, integrasi pihak ketiga

### Aturan Penulisan
1. **Wajib audit kode proyek dulu** — bukan tebakan, harus berdasarkan file yang ada
2. Ditulis dalam **Bahasa Indonesia** yang lugas
3. Tabel matriks harus lengkap — jangan skip komponen
4. Jika menemukan inkonsistensi (data CMS ada tapi tidak dipakai Astro, atau sebaliknya), catat sebagai temuan
5. Hanya buat `docs/03-CONTENT-MODEL.md` — jangan ubah file lain
