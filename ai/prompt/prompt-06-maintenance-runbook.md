# PROMPT 06 — MAINTENANCE-RUNBOOK.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/06-MAINTENANCE-RUNBOOK.md`**
> 
> ⚠️ **File ini TAMBAHAN** — tidak ada di list awal kamu, tapi ini yang paling langsung menjawab kebutuhanmu: "hal receh saya bisa maintenance sendiri, yang advance baru pakai Claude Code."

---

## Instruksi

Kamu adalah AI operations specialist yang sedang membuat panduan maintenance untuk pemilik proyek **DnJourneysBali** — seorang solo developer yang ingin bisa melakukan maintenance rutin sendiri tanpa selalu bergantung pada AI coding assistant.

### Konteks Proyek
- **Stack**: Astro (frontend) + Payload CMS 3.x (backend) + Cloudflare (hosting)
- **8 Service Modules**: Tours, Villa/Hotel, Water Activities, Yacht, Restaurant, Wedding/Event, Rental
- **Booking**: Via WhatsApp
- **Module Toggle**: Enable/disable per client
- **RBAC**: Super Admin, Admin, Editor
- **Owner**: Solo developer, paham dasar coding tapi ingin tahu batas mana yang aman dikerjakan sendiri

### Task

Audit seluruh proyek, lalu buatkan `docs/06-MAINTENANCE-RUNBOOK.md` — panduan operasional harian yang membagi tugas menjadi 3 tier berdasarkan tingkat kesulitan.

### Konten Wajib

#### 1. TIER 1 — BISA DIKERJAKAN SENDIRI VIA CMS (No-Code, Zero Risk)
Daftar semua operasi yang bisa dilakukan langsung dari Payload CMS Admin Panel:
- Mengelola konten (CRUD tours, villas, restaurants, dll.)
- Upload dan ganti gambar/media
- Edit teks halaman, deskripsi, harga
- Toggle modul on/off
- Manage FAQ, testimonial
- Publish/Unpublish konten (Draft ↔ Published)
- Manage user accounts (untuk Super Admin)

Sertakan: **path navigasi di Admin Panel** untuk setiap operasi.

#### 2. TIER 2 — BISA DIKERJAKAN SENDIRI VIA KODE (Low Risk, dengan panduan)
Daftar operasi yang butuh edit kode tapi aman dilakukan sendiri dengan panduan:

Untuk setiap item, sertakan:
- **File yang diedit** (path lengkap)
- **Langkah-langkah** (step by step)
- **Contoh kode** (before → after)
- **Command setelah perubahan** (build, deploy, migrate)
- **Cara rollback** jika gagal

Contoh operasi Tier 2:
- Ganti warna/font design system (CSS variables)
- Edit teks statis yang masih hardcoded di Astro
- Tambah field sederhana ke collection yang sudah ada (misal: tambah field "discount" ke Tours)
- Update konten footer/header yang masih hardcoded
- Ganti logo atau favicon
- Update meta tags SEO statis

#### 3. TIER 3 — WAJIB PAKAI CLAUDE CODE / DEVELOPER (High Complexity)
Daftar operasi yang membutuhkan bantuan AI atau developer berpengalaman:
- Buat halaman dengan layout baru
- Buat komponen Astro baru
- Tambah collection/tabel baru di Payload
- Perubahan skema database (migrasi)
- Integrasi pihak ketiga (analytics, payment, dll.)
- Perubahan RBAC / access control
- Setup deployment untuk client baru
- Performance optimization
- Bug fixing yang melibatkan multiple files

#### 4. CHEAT SHEET COMMAND HARIAN
Kumpulkan semua command yang sering dipakai:

```bash
# Development
pnpm dev                    # Jalankan local dev server
pnpm build                  # Build production

# Database
payload migrate:create      # Buat migrasi baru
payload migrate             # Jalankan migrasi

# Deploy
# ... (sesuai setup Cloudflare)

# Git
git status                  # Cek perubahan
git add .                   # Stage semua perubahan
git commit -m "..."         # Commit
git push                    # Push ke remote
```

#### 5. TROUBLESHOOTING UMUM (FAQ Masalah Harian)
Format: **Masalah → Penyebab Umum → Solusi**

- "Konten sudah diupdate di CMS tapi belum muncul di website"
- "Build error saat deploy"
- "Gambar tidak muncul di website"
- "User baru tidak bisa login ke CMS"
- "Module toggle dimatikan tapi halaman masih muncul"
- "Error saat upload media file besar"
- "Website lambat setelah banyak konten"

#### 6. JADWAL MAINTENANCE BERKALA
Rekomendasi jadwal maintenance rutin:
- **Harian**: Apa yang perlu dicek
- **Mingguan**: Backup, review analytics
- **Bulanan**: Update dependencies, review performa, cleanup media unused
- **Per Quarter**: Security audit, review RBAC, update dokumentasi

### Aturan Penulisan
1. **Wajib audit kode proyek dulu** — path file dan command harus akurat
2. Ditulis dalam **Bahasa Indonesia** yang sangat lugas — bayangkan pembaca adalah developer junior
3. Setiap operasi Tier 2 harus punya langkah yang cukup detail sehingga bisa diikuti tanpa bertanya lagi
4. Jangan pakai jargon tanpa penjelasan
5. Hanya buat `docs/06-MAINTENANCE-RUNBOOK.md` — jangan ubah file lain
