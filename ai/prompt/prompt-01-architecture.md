# PROMPT 01 — ARCHITECTURE.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/01-ARCHITECTURE.md`**

---

## Instruksi

Kamu adalah AI architect yang sedang mendokumentasikan proyek **DnJourneysBali** — sebuah website travel agency berbasis monorepo.

### Konteks Proyek
- **Stack**: Astro (frontend) + Payload CMS 3.x (headless CMS/backend)
- **Monorepo Structure**: `apps/web` (Astro) | `apps/cms` (Payload) | `packages/shared` (types & utilities)
- **Hosting**: Full Cloudflare — Pages (frontend), Workers (backend), D1 (database), R2 (media storage)
- **Budget**: ~$5/bulan
- **8 Service Modules**: Tours, Villa/Hotel, Water Activities, Yacht, Restaurant, Wedding/Event, Rental
- **Module Toggle**: Setiap modul bisa di-enable/disable per client (reusable template)
- **Booking**: Via WhatsApp (direct), bukan payment gateway
- **Design**: "Tropical Sophistication" — Deep Ocean #1B3A4B, Warm Sand #F5F0E8, Coral Sunset #E07A5F, Tropical Leaf #6B9080
- **Fonts**: Fraunces (display), Plus Jakarta Sans (body)

### Task

Buatkan file dokumentasi arsitektur komprehensif pada path `docs/01-ARCHITECTURE.md`.

Dokumentasi ini harus:
- Ditulis dalam **Bahasa Indonesia** yang lugas dan mudah dipahami
- Menggunakan bahasa teknis yang jelas tapi accessible untuk developer maupun stakeholder non-teknis
- Dilengkapi dengan **diagram visual menggunakan sintaks Mermaid.js**
- Format Markdown yang rapi dengan Headings, Bold pada istilah penting, dan code blocks

### Konten Wajib

#### 1. OVERVIEW MONOREPO
- Jelaskan konsep struktur Monorepo yang digunakan dalam proyek ini
- Peran direktori `apps/web` — Front-End menggunakan Astro Framework
- Peran direktori `apps/cms` — Headless CMS & Back-End menggunakan Payload CMS 3.x
- Peran direktori `packages/shared` — Shared Types, Utilitas/Helpers, dan Kontrak Data yang digunakan bersama oleh `web` dan `cms`
- **Sertakan diagram Mermaid** yang memperlihatkan struktur Monorepo dan keterkaitan antar package/app

#### 2. PETA ALUR DATA & STRATEGI RENDERING (ASTRO ↔ PAYLOAD)
Dokumentasikan secara mendetail alur komunikasi data antara Astro dan Payload CMS. Bedakan dan jelaskan 3 metode rendering:

a. **SSG (Static Site Generation)**: Kapan data di-fetch (saat build time), implikasinya (perubahan di Payload tidak langsung muncul sebelum rebuild)
b. **SSR (Server-Side Rendering)**: Kapan data di-fetch (setiap HTTP request), dampak performa dan keandalan data real-time
c. **ISR / On-Demand Revalidation**: Mekanisme revalidasi cache via Webhook dari Payload ke Astro, update halaman statis tanpa build ulang penuh

- **Buatkan Mermaid sequence diagram**: Alur dari Konten dibuat di CMS → Diproses → Tampil di Browser

#### 3. "SPOTLIGHT" UNTUK NON-TEKNIS: Mengapa Perubahan CMS Tidak Langsung Tampil?
- Section khusus untuk tim non-teknis / content manager
- Analogi intuitif: beda "Cetakan Statis (SSG)" vs "Restoran Pesan-Langsung (SSR)"
- Panduan troubleshooting: "Konten baru di Payload belum muncul di website — apa langkah pemulihannya?"

#### 4. MODUL, STRUKTUR FOLDER & LOKASI PERUBAHAN (Development Guide)
- Pemetaan folder utama `apps/web` (components, pages, layouts)
- Pemetaan folder utama `apps/cms` (collections, globals, hooks)
- **Panduan "Di Mana Saya Harus Mengubah Kode Jika..."**:
  - Ingin mengubah tampilan komponen halaman → lokasi file di `apps/web`
  - Ingin mengubah struktur field/koleksi di CMS → lokasi file di `apps/cms`
  - Ingin mengubah tipe data TypeScript bersama → lokasi di `packages/shared`

#### 5. ENVIRONMENT VARIABLES & INTEGRASI PIPELINE
- Daftar variabel `.env` kunci yang menghubungkan `apps/web` dengan API endpoint Payload CMS
- Klasifikasi mana yang Public vs Secret
- Contoh `.env.example` untuk masing-masing app

### Aturan Penulisan
1. **Baca dulu** struktur folder proyek yang ada sebelum menulis — jangan mengarang
2. Gunakan informasi nyata dari kode proyek, bukan asumsi
3. Semua diagram Mermaid harus valid dan bisa di-render di VS Code / GitHub
4. Jika ada bagian yang belum diimplementasi, tandai dengan `<!-- TODO: belum diimplementasi -->`
5. Jangan hapus atau ubah file lain — hanya buat `docs/01-ARCHITECTURE.md`
