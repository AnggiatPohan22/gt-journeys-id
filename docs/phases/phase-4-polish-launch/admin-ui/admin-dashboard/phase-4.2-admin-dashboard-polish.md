# Phase 4.2 — Admin Dashboard Polish (Sidebar · Layout · Color Theming)

> **Status:** ✅ Code selesai · login terverifikasi (DOM) · ⏳ screenshot dashboard/sidebar (butuh login)
> **Scope:** UI/UX only — tidak ada perubahan business logic, data model, collection, atau API.
> **Date:** 2026-08-25
> Lanjutan dari [phase-4.1](phase-4.1-admin-dashboard-redesign.md) (doc terpisah, tidak diedit).

## Overview

Tiga area dipoles, meneruskan redesign 4.1:

1. **Sidebar** — nav item jadi *pill* rounded dengan state aktif brand (ocean),
   hover halus, label grup (uppercase caption). CSS-only, **menu tidak diubah**.
2. **Dashboard overview** — layout dirombak sesuai wireframe: baris
   **[Overview frame | Quick Access]** lalu **Recent Activity** full-width.
   Stat box di dalam Overview frame **bisa di-geser** (swipe/scroll). Konten
   default Payload di bawahnya **disembunyikan** biar tidak menumpuk.
3. **Color theming** — sistem warna via CSS variables, pendekatan **hybrid**:
   pakai sistem surface/teks native Payload (light & dark) + aksen brand
   DnJourneysBali (ocean/coral/leaf/stone).

## Design decisions (referensi vs adaptasi)

**Diambil dari referensi (Emerald Voyage):**
- Sidebar: active item = *filled pill* + grup label uppercase kecil.
- Layout: "Overview frame" berisi beberapa box + panel "Quick Access" di
  samping; baris atas lalu Recent Activity di bawah; halaman bersih (no stacking).
- Look "floating rounded": card radius besar, border tipis, hover lift.
- Stat box swipeable (referensi punya carousel-style cards).

**Diadaptasi (keputusan user — opsi "Hybrid"):**
- **Warna:** referensi = emerald hijau. Kita pakai **brand DnJourneysBali**
  sebagai primary/accent (ocean `#1B3A4B` + coral `#E07A5F`) dan sistem
  surface neutral native Payload. Alasan: konsisten dengan situs publik +
  halaman login yang sudah di-brand (4.1). Bukan emerald.
- **Data:** referensi menampilkan "Bookings/Revenue" (tidak ada di CMS ini —
  booking via WhatsApp, tanpa collection). Diganti metrik CMS nyata:
  Pages, Service Listings, Destinations, Testimonials.
- **Sidebar tidak di-detach** jadi floating island (risiko merusak layout
  Payload). Cukup di-style via CSS; struktur & item nav tetap default.

## Color palette (CSS variables)

Didefinisikan di `admin/admin-global.css` (`:root`), dipakai lintas
dashboard + login + sidebar:

| Variable | Hex / value | Dipakai untuk |
|----------|-------------|---------------|
| `--dnj-ocean` | `#1B3A4B` | Primary — active nav pill, tombol login |
| `--dnj-ocean-hover` | `#14303D` | Hover tombol login |
| `--dnj-coral` | `#E07A5F` | Accent — hover log-out, ikon |
| `--dnj-leaf` | `#6B9080` | Accent sekunder (ikon stat) |
| `--dnj-stone` | `#3D405B` | Accent sekunder (ikon stat) |
| `--dnj-active-bg` | light `#1B3A4B` / dark `rgba(255,255,255,.12)` | Background pill nav aktif (adaptif tema) |
| `--dnj-active-fg` | `#ffffff` | Teks pill nav aktif |
| `--dnj-radius` | `14px` | Radius card/frame dashboard |

**Surface/teks TIDAK di-hardcode** — pakai token native Payload
(`--theme-elevation-0/50/100/…`, `--theme-text`) supaya otomatis benar di
light & dark. Inilah "hybrid": brand di atas sistem tema Payload.

## Light / Dark mode — findings

- **Payload v3 native support: YES.** Config `admin.theme: 'all' | 'light' |
  'dark'` (default `all` = toggle aktif). Tema dikendalikan via
  `html[data-theme="dark"]` + CSS custom properties `--theme-*`. Toggle ada
  di menu akun user.
- **Implementasi kita:** *hook into* sistem itu, tidak menggantinya. Semua
  warna surface/teks pakai `--theme-*` → dashboard, sidebar pill, login
  ikut light/dark otomatis. Satu-satunya penyesuaian dark-specific: warna
  pill nav aktif (`--dnj-active-bg`) di-override di bawah
  `html[data-theme="dark"]` karena ocean terlalu gelap di sidebar gelap.
- **Status:** light **terverifikasi (DOM)**; dark memakai mekanisme yang
  sama (theme vars) → diharapkan benar, perlu toggle + screenshot untuk
  konfirmasi final.

## Layout diagram

```
┌───────────────────────────── .dnj-dash ──────────────────────────────┐
│ Overview  · subtitle                                                  │
│                                                                       │
│ ┌───────── .dnj-frame (1fr) ─────────┐  ┌── .dnj-quick (300px) ──┐    │
│ │ AT A GLANCE                swipe → │  │ QUICK ACCESS           │    │
│ │ ┌──────┐┌──────┐┌──────┐┌──────┐   │  │ + Add New Page         │    │
│ │ │Pages ││Servs ││Dest. ││Testi.│ ← │  │ + Add New Tour         │    │
│ │ └──────┘└──────┘└──────┘└──────┘   │  │ ▣ Media Library        │    │
│ │  (SwipeTrack: wheel/drag/touch)    │  │ ★ Testimonials         │    │
│ └────────────────────────────────────┘  │ ≡ Header & Footer      │    │
│                                          │ ⚙ Site Settings        │    │
│                                          └────────────────────────┘    │
│ ┌───────────────── .dnj-panel (Recent activity) ──────────────────┐   │
│ │ • latest updated items across 13 collections (last 8)           │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│  ↓ default Payload cards di bawah → display:none (no stacking)         │
└───────────────────────────────────────────────────────────────────────┘

< 1024px: kolom tunggal (Quick Access pindah ke bawah frame).
Stat box jadi carousel geser (min 78% lebar → swipe).
```

## File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/DashboardStats.tsx` | **Modified** | Layout baru: Overview frame (SwipeTrack + 4 stat box) + Quick Access panel + Recent Activity (8 item). |
| `apps/cms/src/admin/SwipeTrack.tsx` | **Created** | Client component (`'use client'`) — swipe/scroll horizontal stat box: wheel→scroll, drag-to-scroll, native touch. Tanpa library. Di-import langsung (bukan via config). |
| `apps/cms/src/admin/custom.css` | **Rewritten** | Style layout baru (frame, track, stat, quick access, panel) + rule sembunyikan konten default: `.dashboard > .dnj-dash ~ * { display:none }`. Scoped `.dnj-dash`. |
| `apps/cms/src/admin/admin-global.css` | **Rewritten** | Sidebar: nav pill + active brand + grup label; palet `--dnj-*` + token adaptif light/dark; login button (dari 4.1). |
| `apps/cms/src/app/(payload)/admin/importMap.js` | **Regenerated** | `payload generate:importmap` (tidak ada komponen config baru di 4.2; regen untuk konsistensi). |

> **Tidak ada** perubahan `payload.config.ts` di 4.2 (komponen config sudah
> terdaftar di 4.1). SwipeTrack di-import langsung oleh DashboardStats.

**Payload class yang di-target (audit/rollback):** `.nav__link`,
`.nav__link-indicator`, `.nav-group__toggle`, `.nav__log-out`,
`.login .btn--style-primary`, `.dashboard > .dnj-dash ~ *`. Tidak menyentuh
form/list/editor.

## Verification

- **Login page — TERVERIFIKASI (DOM):** logo brand, tagline, tombol ocean
  `rgb(27,58,75)`, var `--dnj-ocean`/`--dnj-active-bg` resolve, rule pill nav
  ter-load. Render tetap utuh.
- **Dashboard overview & sidebar pill — ⏳ butuh login** untuk screenshot.
  Typecheck bersih; selector hide sudah dicek terhadap struktur DOM Gutter
  Payload (children langsung di `.dashboard`).
- **Catatan dev-server:** menambah/mengubah komponen config Payload butuh
  **restart dev server** (importMap di-bundle sekali; HMR tidak rebundle).
  Setelah 4.1 menambah komponen, restart diperlukan agar log
  `getFromImportMap … not found` hilang. File importMap di disk sudah benar.

## Known limitations

- Dark mode belum di-screenshot (mekanisme theme-var sama → seharusnya benar).
- Sidebar tidak "floating island" penuh seperti referensi (dijaga agar layout
  Payload tidak rusak) — hanya pill + spacing yang dipoles.
- Stat box swipe: di layar sangat lebar keempat box muat tanpa perlu geser
  (by design); geser aktif saat overflow (tablet/phone).
- Rule sembunyikan konten default mengandalkan struktur DOM `.dashboard` +
  Gutter Payload. Jika Payload mengubah struktur ini di update besar, rule
  perlu ditinjau (fail-safe: konten muncul lagi, tidak error).

## Future improvements

- **Dark mode:** verifikasi + tuning kontras (pill, shadow) via toggle akun.
- **Custom Dashboard view penuh** (`admin.components.views.dashboard`) kalau
  ingin kontrol total (mis. drag-and-drop widget) — lebih idiomatik daripada
  hide-via-CSS, tapi lebih invasif.
- **Sidebar collapse** kustom (icon-only) — saat ini pakai toggler native
  Payload (off-canvas di mobile).
- Real-time counts / grafik tren kalau nanti ada data time-series.
