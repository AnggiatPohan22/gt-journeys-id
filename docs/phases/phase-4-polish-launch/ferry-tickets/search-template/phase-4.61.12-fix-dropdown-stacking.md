## Phase: 4.61.12 — Fix Dropdown Stacking (Passenger / Starting Point tertimpa section bawah)
Tanggal: 2026-10-03
Status: Selesai
Dikerjakan oleh: Claude Code

### Masalah
Di halaman Ticket Search (`/ferry-tickets`), ketika visitor membuka dropdown
Passenger (atau Starting Point / Destination), panel dropdown yang muncul
di bawah card ter-clip / tertimpa oleh section listing di bawahnya:

- Panel Passenger tertutup oleh teks "Sort by" di baris Available Trips.
- Panel Starting Point tertutup oleh grid card "Our Collection" (list trip).

Hasilnya opsi di dalam dropdown jadi tidak bisa dibaca / di-klik.

### Root Cause
Konflik stacking context di `ServiceListingTicketSearch.astro`:

| Element                              | z-index lama |
|--------------------------------------|--------------|
| Form wrapper (membungkus semua card) | `z-20`       |
| Dropdown listbox (passenger/origin)  | `z-40` *(nested di dalam z-20)* |
| Listing header (title + Sort by)     | `z-30`       |
| Grid trip card                       | `z-10`       |

Karena form wrapper = `z-20` membuat stacking context, `z-40` di dropdown
listbox hanya efektif **di dalam** context tersebut. Siblingnya — listing
header dengan `z-30` — merender di atas seluruh form (termasuk dropdown
yang nested di dalamnya). Grid card dengan `z-10` juga membentuk stacking
context terpisah dari grid, tapi secara flow DOM muncul setelah form,
sehingga dropdown yang overflow ke bawah form tertutup.

### Perbaikan
Naikkan prioritas form wrapper di atas section listing + grid, lalu
turunkan z-index section bawah supaya form (termasuk dropdown-nya) selalu
di depan:

| Element                              | z-index baru |
|--------------------------------------|--------------|
| Form wrapper                         | `z-40`       |
| Dropdown listbox (passenger/origin)  | `z-40` (tetap, kini di-top-level) |
| Listing header (title + Sort by)     | `z-10`       |
| Grid trip card                       | `z-0`        |

Dropdown Sort By sendiri sudah `z-50` dan tidak dibatasi stacking lain,
jadi tetap tampil penuh ke bawah menutupi grid card.

### File yang Berubah
- `apps/web/src/components/blocks/ServiceListingTicketSearch.astro`
  - Line ~476: form wrapper `z-20` → `z-40` (+ komentar penjelasan).
  - Line ~1067: `#tsh-listing` wrapper `z-30` → `z-10`.
  - Line ~1121: grid wrapper `z-10` → `z-0`.

### Impact
- Dropdown Passenger (desktop + mobile) sekarang menutupi label "Sort by"
  dan heading "Available Trips" alih-alih tertimpa.
- Dropdown Starting Point / Destination (combobox location) menutupi
  grid card trip di bawahnya ketika terbuka panjang.
- Fungsionalitas Sort By, Find Tickets, filter, swap, dan smooth-scroll
  listing tidak berubah.
- Tidak ada perubahan schema, migration, atau API.
- Tidak ada perubahan RBAC / routes.

### Testing
- OK: review stacking context secara visual via code (form siblings vs
  listing header).
- Belum: smoke test di browser (butuh `pnpm --filter @gt/web dev` →
  `/ferry-tickets`):
  1. Buka dropdown Passenger di desktop → panel harus menutupi "Sort by"
     dan "Available Trips".
  2. Buka Starting Point → list hasil harus menutupi card trip di bawahnya.
  3. Buka Sort By → panel tetap menutupi grid card di bawahnya.
  4. Klik di luar dropdown → semua dropdown tertutup, tidak ada residu.
- Belum: mobile responsive (dropdown mobile tetap `z-40` relatif ke form
  wrapper `z-40` yang sama; tetap di atas section bawahnya).

### Rollback
Revert tiga baris `class="relative z-…"` di `ServiceListingTicketSearch.astro`
ke nilai lama (`z-20` form wrapper, `z-30` listing header, `z-10` grid).

### Dokumentasi yang Diupdate
- OK: `docs/phases/phase-4-polish-launch/ferry-tickets/search-template/phase-4.61.12-fix-dropdown-stacking.md`
- Rekomendasi manual: tambah entry Phase 4.61.12 di `docs/PROGRESS.md`.

### Next Steps
- Audit pattern yang sama di block lain yang punya dropdown overlay
  (ServiceListingEditorialFeatured, HeroImmersive, Hero Simple variants)
  untuk memastikan tidak ada regresi serupa.
- Pertimbangkan refactor: pindahkan dropdown ke `position: fixed` atau
  portal supaya tidak lagi bergantung pada hierarki stacking.
