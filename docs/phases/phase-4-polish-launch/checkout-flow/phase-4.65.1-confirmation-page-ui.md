## Phase: 4.65.1 — Confirmation Page UI Sync (referensi-1)
**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan
Redesign halaman confirmation ferry (`/checkout/ferry-tickets/confirmation/[ref]`)
agar sejalan visual dengan halaman checkout (Phase 4.65). Sekarang customer
melihat urutan alur yang jelas: **Select Trip → Passenger Info → Confirmation**
lewat stepper card yang sama di kedua halaman. Pure-UI — tidak ada perubahan
data flow, endpoint, channel resolution, atau schema.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | Full markup rewrite: stepper card 3-step (step 3 aktif, 1 & 2 done), breadcrumb inline, success hero card + tombol Copy booking ref, dark-header numbered sections (Contact Information + Passenger Information dgn accordion + passport masked), handoff card dgn gradient ocean→midnight, Booking Summary sidebar (compact, Show/Hide Details toggle) — pola visual identik dgn checkout. Copy 100% English. |
| `packages/shared/src/icon-map.ts` | Tambah legacy alias `content_copy → lucide:copy` (untuk tombol Copy di success hero). |
| `docs/phases/phase-4-polish-launch/checkout-flow/phase-4.65.1-confirmation-page-ui.md` | Report ini (baru). |

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**: 1 page markup refactor + 1 icon-map entry (satu baris).
- **Routes**: none
- **RBAC**: none
- **Channel logic**: TIDAK berubah — masih pakai `resolveChannel('ferry-ticket')`
  + `getManualWaHandoff` fallback. Tombol WhatsApp handoff pakai `handoff.redirectUrl`
  & `handoff.buttonLabel` seperti sebelumnya; ketika gateway (Xendit/Midtrans)
  masuk nanti, page ini render otomatis label channel-nya.
- **Data contract**: TIDAK berubah — semua field yang dibaca (`bookingRef`,
  `customerName`, `customerWhatsapp`, `customerEmail`, `customerCountry`,
  `customerNotes`, `passengers[]`, `originLocation`, `destinationLocation`,
  `scheduleTimeLabel`, `departureDate`, `ferryClassName`, `unitPrice`,
  `totalEstimate`, `currency`, `ferryTicket` relation) sudah ada di Bookings
  collection sejak Phase 4.62/4.63.

### Fitur UI baru (semua pure client-side)
1. **Stepper card** — visual 3-step yang identik dgn checkout (step 1 & 2
   ✓, step 3 active). Reassurance bagi customer bahwa mereka sudah di
   ujung alur.
2. **Success hero card** — big check icon, "Booking Created" label,
   heading kalem ("Your booking is submitted successfully"), booking ref
   dengan **tombol Copy** (progressive enhancement, fallback: select text
   jika clipboard API blocked).
3. **Passenger accordion** — header preview: nama lengkap, nationality,
   dan passport masked (`••••1234`). Detail (title, gender, DOB, issue
   date, expiry date) di dalam body accordion. P1 open by default.
4. **Handoff card dgn gradient ocean→midnight** — big CTA "Confirm via
   WhatsApp" + emerald pulse indicator "Next Step" + 3 badge kecil
   (Encrypted / Official / <30 min reply).
5. **Booking Summary sidebar** — sticky sidebar identik dgn checkout:
   Show/Hide Details toggle, hero+title+total selalu tampil, breakdown
   detail (ferry, class, pax, booking ref, price lines) hidden default.
   Total price serif besar coral.

### Progressive-enhancement (JS off tetap OK)
- Accordion body: default hanya P1 terbuka; P2+ tersembunyi. Kalau JS
  gagal, user perlu view-source untuk lihat P2+, TAPI: semua data sudah
  tercetak di HTML (tinggal remove `hidden`). Data primary contact & Handoff
  card selalu visible tanpa JS.
- Sidebar toggle: default collapsed; Total dan header tetap visible tanpa JS.
- Copy button: kalau `navigator.clipboard` blocked → fallback selectRange
  supaya user bisa Ctrl+C manual.

### Konsistensi visual dengan checkout
| Element | Checkout | Confirmation |
|---------|----------|--------------|
| Stepper card | 3 step, step 2 active | 3 step, step 3 active |
| Breadcrumb | inline di stepper card | inline di stepper card |
| Section header | dark `bg-ocean`, `w-9 h-9 bg-white/15` number badge, emerald pill accent | ✅ identik |
| Accordion | bg-sand/40 button, chevron rotate, aria-expanded | ✅ identik |
| Sidebar | ocean header, `px-5 pt-4 pb-5`, hero 12×12, Total `text-xl sm:text-2xl` | ✅ identik |
| Show/Hide Details | ✅ | ✅ |
| Bottom CTA row | back link + coral button | back link + Home link (button di handoff card) |

### Testing
- [x] Type-check via Astro (semua field baca sesuai Payload types Bookings).
- [x] Icon `content_copy` di-map ke `lucide:copy` (build-time resolve).
- [ ] Visual — dev server dari chat lain sedang jalan; verifikasi manual
      disarankan pada breakpoint sm/md/lg + JS-off.
- [ ] End-to-end: submit checkout → landing di confirmation → cek stepper
      step 3 highlighted, semua field render, CTA WA opens deep-link.

### Rollback
Revert dua file:
- `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro`
- `packages/shared/src/icon-map.ts` (baris `content_copy`)

Tidak ada migration, tidak ada CMS change, tidak ada endpoint change —
rollback aman & instant.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/checkout-flow/phase-4.65.1-confirmation-page-ui.md` (baru — file ini)
- [ ] `docs/PROGRESS.md` — tambah bullet Phase 4.65.1 (opsional, saat next housekeeping)

### Next Steps
- Sync pola yang sama ke module checkout lain (tours, water activities)
  setelah pattern tervalidasi di ferry.
- Kalau gateway channel (Xendit/Midtrans) ditambah nanti, handoff card
  otomatis render label channel baru — no change needed di page ini.
- Optional: tambah tombol "Print / Save PDF" di success hero card
  (Phase baru bila owner setuju).
