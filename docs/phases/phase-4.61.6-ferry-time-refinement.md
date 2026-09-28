## Phase: 4.61.6 — Ferry Ticket Time & Location Port Refinement
**Tanggal**: 2026-09-28
**Status**: Selesai (pending manual verify di admin & frontend)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Ferry Tickets pindah dari multi-jadwal `scheduleTime[]` ke single-schedule
(`departureTime` + `arrivalTime` di TAB Overview) dengan validasi `HH:mm`.
Duration di-compute otomatis lintas timezone via hook + toggle override.
Section "Location Port" baru menampilkan peta pelabuhan asal (dari data
`Locations`) untuk memudahkan customer buka Google/Apple Maps. `quickSpecs`,
`highlights`, dan `scheduleTime` di-hide di UI (data dipertahankan).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Locations.ts` | Tambah field `timezone` (IANA select, required, default Asia/Jakarta), collapsible "Map (opsional)" berisi `mapEmbedUrl` & `mapLink` |
| `apps/cms/src/collections/FerryTickets.ts` | Overview: `departureTime` jadi single HH:mm + validasi, tambah `arrivalTime`, `duration` dgn `durationOverride`. Hide `quickSpecs` & `highlights`. Tab 3: hide `scheduleTime`, reorder ke Pricing → Location Port (UI info) → Additional Remark → Booking. Register hook `computeFerryDuration`. |
| `apps/cms/src/hooks/computeFerryDuration.ts` | **NEW** — beforeChange hook: hitung `duration` dari departureTime/arrivalTime + timezone origin & arrival (map IANA→offset menit). Skip jika `durationOverride=true` atau data belum lengkap. |
| `apps/cms/src/admin/LocationPortInfo.tsx` | **NEW** — `ui` field: fetch origin location via REST, render preview iframe + link edit lokasi. Hint jelas kalau map/origin belum di-set. |
| `apps/cms/src/admin/WheelTimePicker.tsx` | **NEW** (addendum) — custom Payload Field untuk `departureTime` & `arrivalTime`. Klik → popover dgn 2 kolom scroll snap (jam 00–23, menit 00–59). Klik item / scroll = pilih. Set / Cancel / Clear. Nilai persist tetap `HH:mm` (kompatibel validate regex). Inherit width class `field-type--width-33` supaya sejajar `operator` di row 3-kolom. |
| `apps/cms/src/admin/DescriptionsToTooltips.tsx` | **NEW** (addendum, v3.1) — mounted sebagai `ui` field di FerryTickets. useEffect + MutationObserver. **Icon placement**: pada collapsible section header, target `.collapsible__header-wrap` (bukan `.collapsible__toggle` invisible full-cover button) → icon `?` sejajar setelah title text ("Location Port", "Related Services"), tidak jatuh ke baris di atas. Icon di-mark `.dnj-tt-icon--in-header` untuk raise z-index di atas toggle + block click bubbling supaya klik `?` tidak collapse section. **Tooltip**: body-portal `position:fixed`. Positioning strategy: RIGHT → LEFT → BELOW → ABOVE (sejajar label, tidak menutup konten). Arrow ikut side. Auto-hide on scroll/resize. Zero per-field wiring. |
| `apps/cms/src/admin/admin-global.css` | Append: (1) scrollbar hide untuk wheel picker; (2) styling `.dnj-tt-icon` (circle 15×15). Tooltip styling & positioning kini semua di JS (tidak pakai `::after` lagi). |
| `apps/cms/src/collections/FerryTickets.ts` | Semua `admin.description` diterjemahkan ke English (38 replacements). Row Overview compact: **Operator 25% \| Departure 20% \| Arrival 20% \| Duration 20% \| Override 15%** — 5 field dalam 1 baris (sebelumnya 2 baris). Label `Override duration manual` → `Override`. Plus hidden `ui` field `durationLock` (registered `DurationLock`) untuk kunci Duration input. |
| `apps/cms/src/admin/DurationLock.tsx` | **NEW** — `ui` field sibling di row Overview. `useField({ path: 'durationOverride' })` → toggle `disabled` + visual dim pada `<input name="duration">`. Kalau checkbox mati → Duration disabled (auto-compute mode); kalau centang → editable (manual override). Render null. |
| `apps/cms/src/collections/Locations.ts` | Semua `admin.description` diterjemahkan ke English (12 replacements) + label `Map (opsional)` → `Map (optional)`. |
| `apps/cms/src/collections/FerryTickets.ts` | Placeholder ditambah ke `title`, `subtitle`, `operator`, `duration`, `caption` (gallery), `videoUrl`, `bookedCount`, `badges.text`, `ferryClasses.name`, `ferryClasses.description`, `adultPrice`, `childPrice`, `originalPrice`. `descriptionsToTooltips` ui field ditambah paling atas. |
| `apps/cms/src/collections/Locations.ts` | Placeholder ditambah ke `name`, `terminalName`, `country`, `code`, `mapEmbedUrl`, `mapLink`. |
| `apps/cms/src/migrations/20260928_085851_phase_4_61_6_ferry_time_and_maps.ts` | **NEW** — ADD COLUMN `locations.timezone`, `locations.map_embed_url`, `locations.map_link`, `ferry_tickets.arrival_time`, `ferry_tickets.duration_override`. |
| `apps/cms/src/migrations/index.ts` | Register migration baru |
| `packages/shared/src/types/payload-types.ts` | Auto-regenerated (payload generate:types) |
| `apps/web/src/lib/location.ts` | `ResolvedLocation` diperluas dgn `timezone`, `mapEmbedUrl`, `mapLink`. Tambah `TIMEZONE_ABBR` & helper `tzLabel()` (WIB/WITA/WIT/SGT/MYT). |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Fallback `departureTime`/`arrivalTime` top-level → `scheduleTime[0]`. Tampilkan `HH:mm TZ` (mis. `08:00 WIB`) di ticket variant. |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Baca `arrivalTime` + resolve origin/arrival lengkap. Ganti section "Schedule Time" (array) → "Departure & Arrival" (single) + label TZ. Tambah section baru "Location Port" (iframe origin map + tombol Open in Google/Apple Maps). Sidebar summary: 3 kolom (Departure / Arrival / Duration) dengan TZ badge. QuickSpecs order: Departure → Arrival → Duration → Operator. |

### Impact
- **Database**: migration `20260928_085851_phase_4_61_6_ferry_time_and_maps` (5 kolom ADD, semua nullable/default → non-destructive).
- **CMS**: Locations dapat field baru (timezone required, mapEmbedUrl/mapLink opsional). Ferry Tickets Overview struktur berubah, Tab 3 reorder + Location Port UI baru. `quickSpecs`, `highlights`, `scheduleTime` disembunyikan (data tetap ada di DB).
- **Frontend**: Detail page ferry render 5 area baru (Departure/Arrival card, Location Port map, sidebar 3-kolom, quickSpecs Departure+Arrival). Card ticket variant sekarang tampilkan `HH:mm TZ`.
- **Routes**: none.
- **RBAC**: none (mengikuti moduleAccess ferry existing).

### Design Decisions

**Kenapa timezone di Locations, bukan per schedule row?**
Locations adalah single source of truth reusable. Setiap pelabuhan hanya
punya 1 timezone, jadi tempat paling tepat menyimpan. Ferry/modul transport
lain (bus, train) ke depan bisa langsung pakai.

**Kenapa duration auto-compute, bukan text bebas?**
Kasus Batam→Singapore (WIB→SGT): admin sering salah hitung karena beda 1
jam UTC. Auto-compute pakai IANA offset menghilangkan bug. Override manual
disediakan untuk edge case (mis. ferry lintas hari).

**Kenapa `admin.hidden` bukan hapus field?**
Data existing (`scheduleTime[]`, `highlights[]`, `quickSpecs[]`) tetap ada
di DB. Ferry Ticket ID 2 di localhost tidak rusak. Hard-delete field ditunda
sampai konfirmasi tidak ada nilai penting. Un-hide cukup dgn hapus 1 baris
`hidden: true`.

**Kenapa Location Port di CMS = `ui` info-only, bukan field terpisah?**
Menghindari duplikasi (map sudah ada di Locations). Admin cukup edit Locations
sekali → semua ferry yang pakai lokasi tsb ikut update. Section di CMS jadi
"preview + shortcut edit" lokasi.

**Timezone offset: static map vs `date-fns-tz`?**
Static map (5 timezone yang di-support) dipilih untuk hindari tambah
dependency + hindari bundle-size ke Cloudflare Workers. Cukup untuk scope
(Batam-SG-MY-Indonesia).

### Testing (manual — pending user verify)
- [ ] Admin: buka Ferry Ticket ID 2 → Overview → cek departureTime/arrivalTime text HH:mm dgn placeholder & validate. `quickSpecs`/`highlights` tidak muncul.
- [ ] Admin: isi arrivalTime, save → cek `duration` terisi otomatis. Centang override, ubah manual → save → nilai manual bertahan.
- [ ] Admin: Tab 3 → urutan Pricing → Location Port → Additional Remark → Booking. Section "Schedule Time" tidak muncul.
- [ ] Admin: Location Port section → sebelum pilih origin: hint. Setelah pilih origin tanpa mapEmbedUrl: hint edit lokasi. Setelah lokasi punya mapEmbedUrl: iframe preview + link ke Google/Apple Maps.
- [ ] Content → Locations: field baru `timezone`, `mapEmbedUrl`, `mapLink` muncul. Isi manual timezone untuk lokasi existing (Batam→Asia/Jakarta, Singapore→Asia/Singapore, Tanjung Pinang→Asia/Jakarta, Malaysia→Asia/Kuala_Lumpur).
- [ ] Frontend `/ferry-tickets/[slug]`: quickSpecs = [Departure WIB, Arrival SGT, Duration, Operator]. Section "Departure & Arrival" tampilkan pelabuhan + waktu + TZ. Section "Location Port" (jika origin punya map) tampilkan iframe + tombol Open in Google/Apple Maps.
- [ ] Frontend card ticket: `08:00 WIB → 09:15 SGT`.
- [ ] Sidebar detail: 3 kolom Departure / Arrival / Duration.

### Rollback
1. `cd apps/cms && pnpm payload migrate:down` (drop 5 kolom baru)
2. `git revert <commit-phase-4.61.6>` (kembalikan seluruh perubahan file)
3. `pnpm generate:types` untuk sync ulang types

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.61.6-ferry-time-refinement.md` (file ini)
- [ ] `docs/PROGRESS.md` (add entry)
- [ ] `docs/02-DATABASE-SCHEMA.md` (jika ada — tambah kolom baru)
- [ ] `docs/03-CONTENT-MODEL.md` (jika ada — jelaskan Locations.timezone/mapEmbedUrl/mapLink)

### Next Steps
- **Phase 4.64 — Service Section Visibility Framework**: Global CMS
  `service-ui-config` di mana super-admin bisa toggle on/off section per
  service module (mis. hide `quickSpecs` untuk semua tour, dsb). Admin/editor
  hanya melihat section yang aktif. Prasyarat: 4.61.6 stabil.
- **Cleanup Stage** (opsional, setelah data existing dibersihkan): hapus
  `scheduleTime`, `quickSpecs`, `highlights` dari FerryTickets + drop kolom
  DB via migration baru. Backfill/prune data lama dulu di admin.
- **Backfill timezone**: user manual isi timezone di semua Locations
  existing (2–4 record). Setelah itu bisa evaluate apakah field jadi wajib
  saat form save (currently just default).
