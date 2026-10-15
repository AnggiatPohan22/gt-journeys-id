# PROMPT 08 — PROJECT-OVERVIEW.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/00-PROJECT-OVERVIEW.md`**
> 
> ⚠️ **File ini TAMBAHAN** — ini "pintu masuk" utama. Siapa pun (termasuk kamu 6 bulan dari sekarang) baca ini dulu sebelum file docs lain. Jalankan prompt ini **TERAKHIR** setelah semua docs lain sudah jadi, supaya bisa mereferensikan isi docs lainnya.

---

## Instruksi

Kamu adalah AI technical writer yang sedang membuat ringkasan eksekutif proyek **DnJourneysBali**.

### Konteks Proyek
- **Brand**: DnJourneysBali — travel agency berbasis di Bali
- **Stack**: Astro (frontend) + Payload CMS 3.x (headless CMS) + Cloudflare (hosting)
- **Monorepo**: `apps/web` + `apps/cms` + `packages/shared`
- **8 Service Modules**: Tours, Villa/Hotel, Water Activities, Yacht, Restaurant, Wedding/Event, Rental
- **Module Toggle**: Bisa enable/disable per client — ini template reusable
- **Booking**: Via WhatsApp direct
- **Design**: "Tropical Sophistication"
- **Budget Hosting**: ~$5/bulan (full Cloudflare)
- **Target**: Bukan cuma untuk DnJourneysBali, tapi jadi template yang bisa di-deploy ulang untuk client travel agency lain

### Prerequisite
File-file docs berikut **sudah harus ada** sebelum menjalankan prompt ini:
- `docs/01-ARCHITECTURE.md`
- `docs/02-DATABASE-SCHEMA.md`
- `docs/03-CONTENT-MODEL.md`
- `docs/04-RBAC.md`
- `docs/05-INFRA.md`
- `docs/06-MAINTENANCE-RUNBOOK.md`
- `docs/07-DECISION-LOG.md`

### Task

Baca semua file docs di atas, lalu buatkan `docs/00-PROJECT-OVERVIEW.md` sebagai ringkasan dan "peta navigasi" seluruh dokumentasi.

### Konten Wajib

#### 1. TENTANG PROYEK
- Apa itu DnJourneysBali — tujuan bisnis dan tujuan teknis
- Siapa target pengguna website (wisatawan) dan siapa pengelola (tim travel agency)
- Kenapa dibangun sebagai template reusable

#### 2. STACK TEKNOLOGI (Ringkasan)
- Frontend, Backend/CMS, Database, Storage, Hosting — masing-masing 1-2 kalimat
- Link ke `01-ARCHITECTURE.md` untuk detail

#### 3. MODUL LAYANAN
- Daftar 8 modul + penjelasan singkat masing-masing
- Konsep module toggle

#### 4. PETA DOKUMENTASI (Documentation Map)
Tabel navigasi ke semua file docs:

| No | File | Isi | Baca Kapan |
|----|------|-----|-----------|
| 00 | PROJECT-OVERVIEW.md | Ringkasan proyek | Pertama kali baca proyek ini |
| 01 | ARCHITECTURE.md | Arsitektur monorepo & alur data | Mau paham struktur kode |
| 02 | DATABASE-SCHEMA.md | ERD & skema database | Mau tambah/ubah tabel/field |
| ... | ... | ... | ... |

#### 5. STATUS PROYEK & ROADMAP
- Fase saat ini (apa yang sudah jadi, apa yang sedang dikerjakan)
- Fase berikutnya (rencana fitur mendatang)
- Link ke Decision Log untuk konteks keputusan

#### 6. QUICK START: CARA MENJALANKAN PROYEK
- Prerequisites (Node.js version, pnpm, dll.)
- Clone → Install → Setup env → Run dev
- Langkah-langkah minimal untuk bisa run di lokal

#### 7. KONTAK & OWNERSHIP
- Siapa pemilik/maintainer proyek
- Workflow development (Claude Code assisted)

### Aturan Penulisan
1. **Baca semua file docs yang sudah ada** — ringkaskan, jangan duplikasi
2. Ditulis dalam **Bahasa Indonesia** yang lugas dan ringkas
3. Ini file "elevator pitch" — harus bisa dibaca dalam 5-10 menit
4. Jangan terlalu detail — arahkan ke file docs spesifik untuk detail
5. Hanya buat `docs/00-PROJECT-OVERVIEW.md` — jangan ubah file lain
