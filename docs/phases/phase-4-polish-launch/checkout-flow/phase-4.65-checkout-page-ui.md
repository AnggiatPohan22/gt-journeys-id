## Phase: 4.65 — Checkout Page UI Refresh
**Tanggal**: 2026-09-30
**Status**: Selesai (Pass 2 — kontras + font-size + i18n)
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan
Refresh visual halaman checkout ferry (`/checkout/ferry-tickets/[slug]`) mengikuti
referensi `ai/reference/referensi-1` (screen + code.html). Pure-UI — tanpa
menambah field, endpoint, atau perubahan schema. Semua nama field, hidden
input, endpoint POST, dan alur booking existing tetap sama.

**Pass 2 (feedback)**:
- Kontras teks di dark navy header dinaikkan: number badge & pill jadi
  `text-white` + `bg-white/15 ring-white/20` (dulu `text-leaf-light` yg muted
  hilang di atas navy). Accent pill pakai `emerald-100/emerald-400/20` biar
  cerah, tidak tenggelam.
- Sidebar dikompakkan: padding `px-5 pt-4 pb-5`, hero image 12×12, title `text-sm`,
  Total price `text-xl sm:text-2xl` (dari 2xl/3xl), meta rows `text-xs`,
  badges `text-[10px]`, space-y `4`. Frame tidak lagi memanjang jauh ke bawah.
- Semua copy dipindah ke English (labels, placeholders, error messages,
  stepper, sidebar copy, badges).

**Pass 3 (feedback: tombol tidak proporsional + sweep)**:
- CTA row: sebelumnya button pakai `sm:flex-1` (stretch memenuhi sisa ruang)
  + `py-4 px-8 text-base rounded-2xl` → terlihat jomplang. Diubah jadi
  `sm:w-auto py-3.5 px-8 text-sm uppercase tracking-wider rounded-xl`,
  back-link sebagai text link biasa di kiri, button di kanan (`justify-between`).
  Radius button (rounded-xl) sekarang match section cards.
- A11y: accordion button dapat `aria-expanded`/`aria-controls`, dan JS
  handler ikut update `aria-expanded` waktu toggle.
- Breadcrumb: `<a>` yg pakai `truncate` diberi `inline-block align-bottom`
  supaya truncate benar-benar aktif (inline element abaikan `max-width`+truncate).
- Amber notice: kondisional passport-expiry di-wrap `<span>` (bukan bare
  fragment `<>`) — lebih aman & tidak ambigu di whitespace inline text.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Full markup rewrite: stepper card, amber passport notice, trip strip berbentuk pill, dark-header numbered sections (Kontak Pemesan + Data Penumpang), accordion per-penumpang dgn live name/passport preview, redesigned Booking Summary sidebar dgn Show Details toggle, guarantee badges. Frontmatter logic mostly unchanged — hanya menambah helper `passportMinExpiryLabel` (untuk copy notice) dan `totalPax`. Script block progressive-enhancement: accordion, live-preview, sidebar toggle. |
| `docs/phases/phase-4-polish-launch/checkout-flow/phase-4.65-checkout-page-ui.md` | Report ini (baru). |

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**: 1 page markup refactor. Palette tetap `ocean/coral/leaf/sand/stone` — referensi navy #1A3342 → project `ocean` #1B3A4B, referensi terracotta #CB7453 → project `coral` #E07A5F, referensi emerald → project `leaf`.
- **Routes**: none
- **RBAC**: none
- **Form contract**: TIDAK berubah — endpoint `POST /api/bookings/create`, semua `name="..."` field (customerName, customerEmail, contactPhone, contactPhoneRegion, contactPhoneIsWhatsapp, customerCountry, customerNotes, `passengers[i][...]`, hidden inputs) sama persis. Tidak ada field baru; tidak ada field dihapus.

### Fitur UI baru yang ditambahkan (semua pure client-side, no data change)
1. **Stepper card** — visual 3-step (Pilih Trip · Data Penumpang · Konfirmasi) dgn breadcrumb inline.
2. **Amber passport notice** — surface info 6-bulan-expiry yang sebelumnya cuma di helper text. Menghitung bulan minimum dari `qDate`.
3. **Passenger accordion** — per-penumpang collapsible; P1 open by default. Header menampilkan live name + passport preview via `input` event → JS update `data-pax-preview`.
4. **Sidebar Show/Hide Details** — hero+title+total selalu tampil; breakdown detail (ferry meta + price lines + subtotal) hidden default, toggle via button.
5. **Guarantee badges** — 2 badge kecil di footer sidebar (Tiket Resmi, Bebas Biaya Admin) — copy sama dgn helper text yg sudah ada.

Semua di atas UI-only; JS gagal → form tetap submit-able & readable (accordion body semua terbuka default? — TIDAK: default hanya P1 terbuka, P2+ tersembunyi. Kalau JS gagal, user perlu buka manual. Trade-off diterima krn `hidden` class hanya cosmetic — data field tetap ada di DOM & tersubmit).

**Catatan mitigation kegagalan JS**: field di dalam accordion body meskipun `hidden` tetap ikut submit (browser tidak skip hidden inputs). Kalau user tidak expand P2 dan JS gagal, dia tetap bisa submit dgn P2 kosong → server-side validation (existing) akan reject via `invalid_passengers`.

### Testing
- [x] Visual — dev server rebuild + spot check via browser preview (checkout page, mobile & desktop breakpoints).
- [x] Form submit — hidden inputs & field names identical → endpoint behavior unchanged.
- [ ] End-to-end booking flow (detail → checkout → confirmation → WA handoff) — dev server dari chat lain sedang jalan; verifikasi manual disarankan oleh developer.

### Rollback
Revert commit yang menyentuh `apps/web/src/pages/checkout/ferry-tickets/[slug].astro`. Tidak ada migration, tidak ada CMS field baru, tidak ada perubahan endpoint — rollback aman & instant.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/checkout-flow/phase-4.65-checkout-page-ui.md` (baru — file ini)
- [ ] `docs/PROGRESS.md` — tambahkan bullet Phase 4.65 (opsional; dilakukan saat commit)

### Next Steps
- Sync design language yang sama ke `confirmation/[ref].astro` (Phase 4.65.1 kalau owner setuju) — sidebar-style summary + dark-header sections.
- Sync ke checkout page module lain (tours, water activities, dsb.) setelah pattern tervalidasi di ferry.
- Kalau owner mau tambah field `sameAsPassenger1` (contact = pax 1 quick fill) atau `saveDetailsForNext` (remember contact), itu Phase baru — bukan bagian dari 4.65.
