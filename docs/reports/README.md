# Phase Reports

Folder ini berisi laporan untuk setiap fase/task yang dikerjakan di
DnJourneysBali.

## Aturan

- Setiap fase yang selesai → buat file `phase-[nama-fase].md`
- Format wajib mengikuti template di [`AGENTS.md` Section 14](../../AGENTS.md)
- Setelah membuat report, update `docs/PROGRESS.md` dan docs lain
  yang relevan (lihat matrix di AGENTS.md Section 14)

## Format Nama File

```
phase-[nama-fase-kebab-case].md
```

Contoh:
- `phase-feature-toggle.md`
- `phase-footer-migration.md`
- `phase-hardcoded-content-migration.md`

## Daftar Report

Newest-first. Kolom "Fase terkait" menautkan ke file detail fase di
[`docs/phases/`](../phases/).

| File | Topik | Tanggal | Status | Fase terkait |
|------|-------|---------|--------|--------------|
| [service-listing-visual-audit.md](service-listing-visual-audit.md) | Audit — Service Listing Visual Consistency + CMS Integration (read-only + plan + execution log) | 2026-08-21 · exec 2026-08-23 | Audit selesai · plan dieksekusi di branch | [3.20](../phases/phase-3-cms-driven/service-listing/phase-3.20-service-listing-fixes.md) |
| [hardcoded-pages-audit.md](hardcoded-pages-audit.md) | Audit — Halaman Hardcoded vs CMS-Managed (read-only, 23 route) | 2026-08-20 | Selesai | [3.20](../phases/phase-3-cms-driven/service-listing/phase-3.20-service-listing-fixes.md) |
| [sprint-cms-enhancement.md](sprint-cms-enhancement.md) | Sprint — CMS Enhancement (Sidebar, Content, Services, Quick Wins) | 2026-08-19 → 2026-08-20 | Selesai (semua sprint ✅) | [3.14–3.19](../phases/phase-3-cms-driven/cms-enhancement/phase-3.14-cms-enhancement-sprint.md) |
| [phase-menu-manager-ux.md](phase-menu-manager-ux.md) | Menu Manager — UX & Fleksibilitas (RowLabel, initCollapsed, sub-menu type) | 2026-08-07 | Selesai | [3.12](../phases/phase-3-cms-driven/phase-3-cms-driven.md) |
| [phase-hardcoded-migration.md](phase-hardcoded-migration.md) | Migrasi Konten Hardcoded ke CMS (Homepage + Testimonials + errorPages + cleanup) | 2026-08-07 | Selesai | [3.11](../phases/phase-3-cms-driven/phase-3-cms-driven.md) |
| [phase-footer-cms-migration.md](phase-footer-cms-migration.md) | Footer & Utility Sections — Wiring ke CMS | 2026-08-07 | Selesai | [3.10](../phases/phase-3-cms-driven/phase-3-cms-driven.md) |
| [phase-feature-toggle.md](phase-feature-toggle.md) | Feature Toggle CMS Integration | 2026-08-07 | Selesai | [3.9](../phases/phase-3-cms-driven/phase-3-cms-driven.md) |

> Tambahkan baris baru ke tabel ini setiap kali membuat report baru,
> newest-first di atas.

## Cara Baca Report

- **Butuh status/garis besar sebuah fase?** → mulai dari [`docs/PROGRESS.md`](../PROGRESS.md)
  (dashboard) lalu ke file fase di [`docs/phases/`](../phases/).
- **Butuh detail teknis sebuah task fase** (apa yang diubah, keputusan, test log)?
  → report `phase-*.md` atau `sprint-*.md` di folder ini.
- **Butuh audit read-only** (peta kondisi kode, gap, rekomendasi)? → file `*-audit.md`.
- Report bersifat **historis** — mencerminkan kondisi saat ditulis; status terbaru
  selalu di file fase / dashboard.

## Referensi

- **Aturan reporting & template lengkap** → [`AGENTS.md`](../../AGENTS.md) Section 14
- **Progress overview keseluruhan** → [`docs/PROGRESS.md`](../PROGRESS.md)
- **Detail per fase** → [`docs/phases/`](../phases/)
- **Development workflow** → [`WORKFLOW.md`](../../WORKFLOW.md) (root)
