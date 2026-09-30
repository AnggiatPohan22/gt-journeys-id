## Phase: 4.59.1 — Fix bug Filter and Search Ticket Template + Popup System
**Tanggal**: 2026-09-30
**Status**: Selesai (pending manual verify + jalankan migration)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Dua perubahan yang menyatu dalam phase ini:

1. **Book Now → Checkout flow.** Klik **Book Now** di list card Ferry
   Ticket (hasil Filter & Search) sekarang langsung navigate ke
   `/checkout/ferry-tickets/{slug}` dengan membawa state filter
   (date, adults, children, infants, trip, return) sebagai query
   string. Kalau lokasi / date belum di-set, popup konfirmasi
   ditampilkan dulu. Field **Departure Date** otomatis terisi hari
   ini saat halaman pertama dibuka (quick chip **Today** aktif +
   card date terisi).

2. **Reusable Popup System (CMS-managed).** Dibuat komponen popup
   global (`window.dnjPopup.confirm/alert`) yang dipasang sekali di
   `PageLayout` dan dikendalikan CMS global baru **Settings → Popup**.
   Super Admin bisa atur judul default, label tombol, ikon, ukuran,
   radius, backdrop, dan warna. Semua trigger popup di frontend
   (mulai dari konfirmasi booking tiket di atas) sekarang pakai
   sistem ini alih-alih `window.confirm` bawaan browser. Kalau
   settings.enabled=false atau fetch gagal, otomatis fallback ke
   `window.confirm`.

### File yang Berubah / Baru
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/PopupSettings.ts` | **BARU**. Payload Global `popup-settings` (label "Popup", group "Settings", visible only super-admin). Tabs: Content (enabled, defaultTitle, confirmLabel, cancelLabel, showCloseButton), Icon & Layout (showIcon, iconName select, size, radius, backdrop), Colors (bgColor, titleColor, textColor, iconColor, confirmBg/Text, cancelBg/Text — pakai `colorPickerField`). |
| `apps/cms/src/payload.config.ts` | Register `PopupSettings` di globals array. |
| `apps/web/src/lib/payload.ts` | Tambah `getPopupSettings()` fetcher. |
| `apps/web/src/components/common/Popup.astro` | **BARU**. Komponen reusable global. Render markup tersembunyi + script yang expose `window.dnjPopup = { confirm(opts), alert(opts) }`. Focus-trap ringan, Esc = cancel, backdrop click = cancel, Enter = confirm. Warna via CSS variables dari CMS. Fallback ke `window.confirm` kalau `settings.enabled === false`. |
| `apps/web/src/layouts/PageLayout.astro` | Import & render `<Popup />` (sekali per page). |
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | (1) `date` default ke `today` bila query kosong. (2) `onBookClick` sekarang **async**, panggil `window.dnjPopup.confirm({title, message, icon:'confirmation_number'})` untuk konfirmasi; fallback ke `window.confirm` bila API belum siap. Selebihnya sama: build query string & navigate ke checkout. (3) Wrapper `.tsh-card-wrap` diberi `x-on:click.capture` yang intercept klik `.tkc__btn--book`. |
| `docs/phases/phase-4.59.1-fix-filter-search-ticket-book-to-checkout.md` | **BARU** — file ini. |

### Impact
- **Database**: **migration baru wajib dibuat & di-apply**. Global baru
  `popup-settings` menambah 1 tabel + 1 row. Jalankan (dari `apps/cms/`):
  ```
  pnpm schema:new -- --name phase-4-59-1-popup-settings
  pnpm schema:migrate
  pnpm generate:types
  ```
- **CMS**: menu baru **Settings → Popup** (hanya visible super-admin).
- **Frontend**: `PageLayout` bertambah 1 komponen (~2KB gzip);
  `window.dnjPopup` global tersedia di semua page.
- **Routes**: none.
- **RBAC**: `popup-settings` global — read public, update super-admin.

### Testing
- [ ] Buka halaman Ferry Ticket → field Departure Date terisi "Today",
      quick chip Today ter-highlight, card menampilkan tanggal hari ini
- [ ] Klik **Book Now** tanpa pilih Origin/Destination → popup custom
      muncul (bukan native browser confirm) dgn title "Konfirmasi
      Pemesanan Tiket", ikon tiket, tanggal + jumlah penumpang tampil
- [ ] Klik **Lanjutkan** di popup → navigate ke
      `/checkout/ferry-tickets/{slug}?date=…&adults=…`
- [ ] Klik **Batal**, backdrop, tombol ×, atau tekan Esc → popup tutup,
      tetap di halaman listing
- [ ] Isi Origin+Destination+Date+Passenger → klik Book Now → langsung
      ke checkout tanpa popup
- [ ] Klik **More info** / area foto → tetap ke detail page, no popup
- [ ] Super-admin: buka **Settings → Popup**, ubah `defaultTitle` /
      `confirmLabel` / warna → save → popup di frontend refresh sesuai
- [ ] Set `enabled = false` di CMS → popup jatuh ke `window.confirm`
      bawaan browser
- [ ] Round Trip + return date → checkout URL bawa `trip=round-trip&return=…`

### Rollback
1. Revert commit ini di git.
2. Kalau migration sudah di-apply: `pnpm schema:down` (satu step
   mundur), atau drop tabel `popup_settings` manual.
3. Hapus import & render `<Popup />` di `PageLayout.astro`.
4. Kembalikan `onBookClick` ke versi `window.confirm` (lihat
   commit sebelumnya).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.59.1-fix-filter-search-ticket-book-to-checkout.md`
- [ ] `docs/03-CONTENT-MODEL.md` — tambah entry Global `popup-settings`
- [ ] `docs/PROGRESS.md` — entry 4.59.1

### Cara Pakai `window.dnjPopup` (developer note)
```ts
// Confirm dialog (2 tombol)
const ok = await window.dnjPopup.confirm({
  title: 'Hapus data?',            // opsional (fallback default CMS)
  message: 'Aksi ini tidak bisa\nundo.',  // \n = line break
  confirmLabel: 'Hapus',           // opsional
  cancelLabel: 'Batal',            // opsional; '' / null = sembunyikan
  icon: 'warning',                 // opsional, override iconName CMS
})
if (ok) { /* proceed */ }

// Alert dialog (1 tombol, tidak return boolean)
await window.dnjPopup.alert({
  title: 'Berhasil',
  message: 'Booking terkirim.',
  icon: 'check_circle',
})
```

### Next Steps
1. Jalankan migration & regenerate types (lihat Impact di atas).
2. Manual verify di browser (checklist Testing).
3. Konsiderasi Phase berikutnya: pakai `window.dnjPopup` untuk
   konfirmasi delete di admin flows lain (mis. hapus item dari cart,
   hapus review, dsb.) — konsisten UX.
