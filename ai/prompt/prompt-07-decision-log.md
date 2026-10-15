# PROMPT 07 — DECISION-LOG.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/07-DECISION-LOG.md`**
> 
> ⚠️ **File ini TAMBAHAN** — mencatat semua keputusan arsitektur besar agar konteks strategis tidak hilang dan diskusi yang sama tidak terulang.

---

## Instruksi

Kamu adalah AI technical writer yang sedang mendokumentasikan riwayat keputusan arsitektur proyek **DnJourneysBali**.

### Konteks Proyek
- **Stack**: Astro + Payload CMS 3.x + Cloudflare (Pages, Workers, D1, R2)
- **Monorepo**: `apps/web` + `apps/cms` + `packages/shared`
- **Budget**: ~$5/bulan
- **Asal keputusan**: Banyak keputusan diambil selama sesi development dengan Claude/Claude Code

### Keputusan yang Sudah Diketahui (dari riwayat percakapan)
Berikut keputusan yang sudah tercatat — cari buktinya di kode dan konfigurasi proyek:

1. **Keystatic → Payload CMS 3.x**: Awalnya mau pakai Keystatic, pindah ke Payload karena butuh RBAC & relational data
2. **Cloudflare Full-Stack**: Pages + Workers + D1 + R2 dipilih karena budget $5/bulan
3. **Monorepo Structure**: `apps/web` + `apps/cms` + `packages/shared` — alasan pemisahan
4. **Astro sebagai Frontend**: Alasan memilih Astro dibanding Next.js atau framework lain
5. **WhatsApp Booking**: Booking via WA direct, bukan payment gateway — alasan bisnis
6. **Module Toggle System**: Untuk reusability template antar client travel agency
7. **3 Role RBAC**: Super Admin / Admin / Editor — alasan pembagian
8. **Design Direction**: "Tropical Sophistication" — palet warna dan font choices
9. **D1 (SQLite) vs PostgreSQL**: Kenapa pilih D1

### Task

Buatkan `docs/07-DECISION-LOG.md` dengan format ADR (Architecture Decision Record) yang disederhanakan.

### Konten Wajib

#### Format per Keputusan:
```markdown
### ADR-001: [Judul Keputusan]
- **Tanggal**: [perkiraan, atau "Fase awal proyek"]
- **Status**: Diterima / Direvisi / Diganti
- **Konteks**: Masalah apa yang dihadapi saat itu?
- **Opsi yang Dipertimbangkan**:
  1. Opsi A — pro & kontra
  2. Opsi B — pro & kontra
- **Keputusan**: Apa yang dipilih dan kenapa
- **Konsekuensi**: Dampak positif dan trade-off yang diterima
- **Catatan Revisi**: [jika ada perubahan di kemudian hari]
```

#### Struktur Dokumen:
1. **Pengantar** — Apa itu Decision Log dan kenapa penting
2. **Daftar ADR** — Semua keputusan di atas + keputusan lain yang ditemukan di kode
3. **Template ADR Kosong** — Untuk mencatat keputusan baru di masa mendatang
4. **Panduan Kapan Harus Buat ADR Baru** — Kriteria: jika keputusan mempengaruhi arsitektur, stack, biaya, atau workflow development

### Aturan Penulisan
1. **Scan kode proyek** untuk menemukan keputusan tambahan yang belum tercatat (misal: library tertentu yang dipilih, pola tertentu yang dipakai)
2. Ditulis dalam **Bahasa Indonesia** yang lugas
3. Jika konteks keputusan tidak bisa ditemukan di kode, tetap catat berdasarkan informasi yang tersedia dan tandai `<!-- konteks dari riwayat percakapan, belum diverifikasi di kode -->`
4. Hanya buat `docs/07-DECISION-LOG.md` — jangan ubah file lain
