# Phase 4.72 — Docs: reorg `docs/phases/` into topic folders

**Status:** ✅ Done
**Date:** 2026-10-01
**Branch:** `docs/reorg-phases-folders`
**Scope:** docs-only (zero code change, zero schema, zero deploy change)

## Alasan

Setelah 127 file menumpuk di `docs/phases/` root, mencari report jadi lambat
dan sulit lihat phase mana yang membentuk 1 workstream (misal semua yang
nyentuh admin dashboard, atau semua yang nyentuh ferry ticket card). File
tetap flat, nomor phase jadi satu-satunya pengelompokan.

Reorg: topik → folder, nomor phase tetap jadi prefix nama file.

## Yang berubah

### Struktur folder baru

Root `docs/phases/` hanya berisi folder phase — tidak ada loose `.md` file.
Setiap phase punya folder sendiri (bahkan yang isinya 1 file). Phase 3 & 4
dapat sub-folder topikal; Phase 4 sampai 2 level nesting.

```
docs/phases/
├── phase-1-foundation/        (1 file)
├── phase-2-service-modules/   (1 file)
├── phase-3-cms-driven/        (index + 4 sub-folder)
├── phase-4-polish-launch/     (index + 10 area → sub-topik + README + 4.72)
│   ├── admin-ui/           8 sub-topik
│   ├── blocks-and-content/ 7 sub-topik
│   ├── theming/            5 sub-topik
│   ├── mobile-polish/      4 sub-topik
│   ├── features/           3 sub-topik
│   ├── ferry-tickets/      3 sub-topik
│   ├── checkout-flow/      (flat, 8 file)
│   ├── cms-infra/          3 sub-topik
│   └── security-patch/     (flat, 15 file)
└── phase-5-deploy/            (1 file)
```

`README.md` (peta folder) dan report ini dipindah ke dalam
`phase-4-polish-launch/` karena Phase 4 adalah phase paling aktif, dan
supaya root `docs/phases/` tetap bersih.

Peta lengkap: lihat [`README.md`](./README.md).

### File operation

- 123 file di-`git mv` (semua kecuali phase-1/2/5 root). Git tracking: semua
  terdeteksi sebagai `R` (rename), sejarah blame tetap utuh.
- 61 file di-rewrite link referensi phase (markdown link + plain-text ref).
- 2 file kode kena rewrite komentar yang reference ke phase doc path:
  - `apps/cms/src/globals/BlogSettings.ts:8` — pointer ke phase-4.35
  - `apps/cms/src/migrations/20260914_121211.ts:717` — pointer ke phase-4.35
  (Keduanya komentar; nol efek runtime.)

### Prinsip pengelompokan

1. **Folder = topik/domain**, bukan nomor. Nomor tetap jadi prefix nama file
   biar urutan kronologis tetap kebaca.
2. **2 level nesting** di bawah `phase-4-polish-launch/`:
   `<area>/<topic>/`. Area = payung besar (admin-ui, theming, dsb.),
   topic = sub-domain konkret (admin-dashboard, color-and-swatches, dsb.).
3. **Phase dengan 1 file** (Phase 1, 2, 5) tidak dibungkus folder.
4. **File index phase** (`phase-3-cms-driven.md`, `phase-4-polish-launch.md`)
   tetap di root folder phase-nya.
5. Semua reference di `PROGRESS.md`, `08-SECURITY-PATCH.md`, `07-DECISION-LOG.md`,
   `docs/guides/*`, `post-deploy-todo.md`, serta `reports/README.md`
   di-rewrite dengan path baru lewat 1 script jalan sekali, bukan edit manual.

## Konvensi baru untuk phase berikutnya

- Phase baru → tentukan topiknya → taruh di folder yang sesuai. Topik baru →
  bikin folder baru + update peta di `docs/phases/phase-4-polish-launch/README.md`.
- Reference phase di dokumen lain WAJIB pakai path lengkap:
  `phases/<folder>/<file>.md` (relatif ke `docs/`) atau
  `docs/phases/<folder>/<file>.md` (dari root repo).

## Tidak termasuk scope

- Isi file phase tidak diubah (hanya di-pindah + rewrite reference link di dalamnya).
- `docs/reports/phase-media-folders.md` dan `docs/reports/phase-media-filebird-layout.md`
  (yang kesebut di `PROGRESS.md`) tetap di `docs/reports/` — bukan bagian dari
  `docs/phases/` dan di luar scope reorg ini.
- Dua phase doc stub masa depan yang disebut di `phase-4.66.13` (phase-4.67,
  phase-4.68, phase-4.69, phase-4.70, phase-4.71) belum ada file-nya → di-skip.

## Rollback

`git revert <this commit>` di branch `docs/reorg-phases-folders` akan undo
semua rename + link rewrite dalam 1 operasi karena satu commit.

## Follow-up

- `pnpm build` di CMS tetap jalan — zero code change (hanya 2 komentar).
- Tidak perlu migration, tidak perlu re-deploy.
- Developer baru dapat scan `docs/phases/phase-4-polish-launch/README.md` untuk peta folder.
