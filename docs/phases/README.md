# docs/phases/ — folder map

> Phase reports dulu flat (127 file di root). Mulai Phase 4.72 (2026-10-01)
> dikelompokkan per topik: `phase-<N>-<nama>/<area>/<topic>/`. File root phase
> (misal `phase-4-polish-launch.md`) tetap sebagai index di folder phase-nya.
> Phase yang isinya cuma 1 file (Phase 1, 2, 5) tetap flat di root.

## Peta cepat

```
docs/phases/
├── phase-1-foundation.md
├── phase-2-service-modules.md
├── phase-5-deploy.md
│
├── phase-3-cms-driven/
│   ├── phase-3-cms-driven.md                   (index)
│   ├── cms-enhancement/        3.14
│   ├── service-listing/        3.20, 3.21
│   ├── destinations/           3.22, 3.23
│   └── header-footer/          3.24
│
└── phase-4-polish-launch/
    ├── phase-4-polish-launch.md                (index)
    │
    ├── admin-ui/
    │   ├── admin-dashboard/    4.1, 4.2, 4.3, 4.6, 4.7, 4.58.*
    │   ├── sidebar-cms/        4.4, 4.5, 4.36, 4.47
    │   ├── editor-ux/          4.8, 4.9
    │   ├── list-view/          4.12
    │   ├── menu-editor/        4.13
    │   ├── users/              4.14
    │   ├── media-library/      4.11, 4.26.*, 4.38, 4.39, 4.40, 4.60.*
    │   └── site-settings/      4.30, 4.31, 4.32, 4.37, 4.49
    │
    ├── blocks-and-content/
    │   ├── service-grid-cards/ 4.15, 4.16, 4.17, 4.18
    │   ├── icon-system/        4.19
    │   ├── block-spacing/      4.20, 4.21.*, 4.22, 4.24
    │   ├── stat-banner/        4.23
    │   ├── hero-gallery/       4.27, 4.27a, 4.28, 4.29
    │   ├── homepage-content/   4.46
    │   └── animations/         4.56, 4.56.1
    │
    ├── theming/
    │   ├── color-and-swatches/ 4.42, 4.42a, 4.55
    │   ├── header-theming/     4.41
    │   ├── footer/             4.43, 4.48
    │   ├── marketing-theming/  4.44
    │   └── theme-cleanup/      4.45
    │
    ├── mobile-polish/
    │   ├── header-mobile/      4.51
    │   ├── announcement-marquee/ 4.52
    │   ├── service-listing-mobile/ 4.53
    │   └── nav-accordion-fix/  4.34
    │
    ├── features/
    │   ├── reserved-features/  4.33
    │   ├── blog/               4.35
    │   └── chat-widget/        4.50.1 .. 4.50.7
    │
    ├── ferry-tickets/
    │   ├── card-design/        4.61, 4.61.1 .. 4.61.6
    │   ├── search-template/    4.61.7, 4.61.7.1, 4.61.8 .. 4.61.11
    │   └── round-trip-filter/  4.64
    │
    ├── checkout-flow/          4.62, 4.62.1, 4.62.2, 4.63, 4.63.1,
    │                           4.63.2, 4.65, 4.65.1
    │
    ├── cms-infra/
    │   ├── cold-start-fix/     4.25
    │   ├── access-control-bugs/ 4.57
    │   └── cms-bugs/           4.59, 4.59.1
    │
    └── security-patch/         4.66, 4.66.1 .. 4.66.14
```

## Aturan menambah phase baru

1. Tentukan domain phase-nya. Kalau cocok dengan folder existing → taruh di sana.
2. Topik baru (belum ada folder yang sesuai) → bikin folder baru dan update peta
   di file ini.
3. Nomor phase tetap jadi prefix nama file (`phase-4.72-xxx.md`) biar urutan
   kronologis tetap kebaca.
4. Reference dari `docs/PROGRESS.md`, `docs/08-SECURITY-PATCH.md`, dokumen lain,
   dan komentar kode harus pakai path lengkap (`phases/<folder>/<file>.md`
   relatif ke `docs/`, atau `docs/phases/<folder>/<file>.md` dari root repo).
