# PROMPT 02 — DATABASE-SCHEMA.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/02-DATABASE-SCHEMA.md`**

---

## Instruksi

Kamu adalah AI database architect yang sedang mendokumentasikan skema database proyek **DnJourneysBali**.

### Konteks Proyek
- **CMS**: Payload CMS 3.x (Headless)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Lokasi Collections**: `apps/cms/src/collections/`
- **Lokasi Globals**: `apps/cms/src/globals/`
- **Shared Types**: `packages/shared/`
- **8 Service Modules**: Tours, Villa/Hotel, Water Activities, Yacht, Restaurant, Wedding/Event, Rental
- **Booking**: Via WhatsApp, bukan payment gateway
- **RBAC**: 3 role — Super Admin, Admin, Editor
- **Module Toggle**: Enable/disable per client untuk reusability

### Task

**Langkah 1 — AUDIT DULU:**
Baca dan selidiki seluruh definisi koleksi (collections), globals, dan relasi data yang ada di:
- `apps/cms/src/collections/` — semua file collection config
- `apps/cms/src/globals/` — semua file global config
- `apps/cms/src/payload.config.ts` atau file konfigurasi utama
- File skema/migrasi terkait lainnya

**Langkah 2 — GENERATE:**
Berdasarkan struktur kode nyata, buatkan `docs/02-DATABASE-SCHEMA.md`.

### Konten Wajib

#### 1. ENTITY RELATIONSHIP DIAGRAM (ERD) & TOPOLOGI DATA
- Diagram ERD visual menggunakan **Mermaid.js `erDiagram`**
- Petakan seluruh Tabel/Koleksi, Kolom Utama, serta Relasi antar tabel
- Relasi: One-to-One, One-to-Many, Many-to-Many (Payload Relationship Fields)
- Penanda relasi yang jelas (Post → Category, User → Media, Tour → Destination, dll.)

#### 2. DATA DICTIONARY — DETAIL SKEMA TIAP TABEL
Untuk **SETIAP** koleksi/tabel yang ada di Payload CMS, buatkan tabel rincian:

| Nama Field | Tipe Data (Payload/DB) | Required/Optional | Unique | Deskripsi & Relasi |
|------------|----------------------|-------------------|--------|-------------------|

- Cantumkan field otomatis Payload: `id`, `createdAt`, `updatedAt`, `_status`
- Kelompokkan per modul: Users, Media, Tours, Villas, dll.

#### 3. ALUR SINKRONISASI & KONTRAK DATA (SHARED TYPES)
- Bagaimana perubahan koleksi Payload menghasilkan TypeScript Types di `packages/shared`
- Command: `payload generate:types` atau mekanisme yang digunakan
- Bagaimana tipe data tersebut diimpor dan digunakan oleh Astro di `apps/web`
- Diagram alur sinkronisasi type (Mermaid flowchart)

#### 4. PANDUAN MANDIRI: CARA MENAMBAH TABEL / KOLOM BARU
Langkah demi langkah (SOP) untuk:

a. **Menambah Field/Kolom baru** pada Tabel yang sudah ada
   - File mana yang diedit
   - Contoh snippet kode TypeScript Payload collection config
   - Command setelah perubahan

b. **Menambah Tabel/Koleksi Baru** dari awal
   - File baru yang dibuat
   - Registrasi di `payload.config.ts`
   - Contoh snippet lengkap collection config baru
   - Command CLI setelah perubahan

c. **Membuat Relasi Baru** antar dua tabel
   - Jenis relasi di Payload (relationship, upload, array)
   - Contoh snippet
   - Dampak pada shared types

Sertakan perintah CLI wajib setelah mengubah skema:
- Migrasi database (`payload migrate:create`, `payload migrate`)
- Regenerasi shared types

#### 5. INDEKS & PERFORMA DATABASE
- Field mana yang menggunakan `index: true` atau `unique: true`
- Rekomendasi indeks untuk optimasi query yang sering dipakai

### Aturan Penulisan
1. **Wajib baca kode proyek dulu** — semua informasi harus diekstrak dari kode nyata, BUKAN tebakan
2. Ditulis dalam **Bahasa Indonesia** yang lugas dan terstruktur
3. Diagram Mermaid harus valid
4. Jika koleksi/tabel belum ada tapi disebutkan di rencana, tandai `<!-- PLANNED: belum diimplementasi -->`
5. Hanya buat file `docs/02-DATABASE-SCHEMA.md` — jangan ubah file lain
