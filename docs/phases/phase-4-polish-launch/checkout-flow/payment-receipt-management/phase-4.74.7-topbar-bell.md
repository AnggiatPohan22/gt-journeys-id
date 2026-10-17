## Phase: 4.74.7 — Top-Bar Bell Notifications (Move from Sidebar + Per-Type Routing)

**Tanggal**: 2026-10-17
**Status**: ✅ Code selesai · E2E verify di admin UI pending
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74.5-bell-notifications.md`](phase-4.74.5-bell-notifications.md)

### Latar Belakang (User Report)

Phase 4.74.5 mount `BellNotifications` di `admin.components.afterNavLinks` (sidebar footer). Konsekuensi:
- Bell terkubur di dalam sidebar menu — admin tidak notice saat ada notif baru (unread count tidak terlihat sampai scroll ke bawah).
- Saat sidebar collapsed di desktop sempit / mobile view, bell tersembunyi total.
- Deep-link klik "payment approved & receipt sent" ambigu: `targetHref` prefer booking dulu, tapi untuk notif review payment proof (`payment_proof_submitted`) ikut routing ke booking — admin perlu ke payment-proof edit view supaya bisa lihat file bukti.

**User request** (verbatim):
> saya mau penempatan nya dirubah menjadi lonceng di top bar di sebelah icon account sehingga nanti jika ada baik itu reservasi atau booking, upload payment atau aktifikas lain nya itu akan muncul 1,2,3 dan angka lain nya sampai 99+ maksimal nya seperti notifikasi pada umum nya. dan jika di klik seperti payment approved dan receipt send itu nanti jika di klik maka akan masuk ke bookingan id tersebut untuk melihat bahwa status sudah berubah menjadi confirm, bukan ke payment proof lagi

### Pendekatan

Payload v3 tidak expose slot "top-bar actions" global cross-view. Opsi:
1. ❌ Override `admin.components.header` — invasif, replace seluruh header.
2. ❌ Portal ke DOM selector top bar — fragile (class name internal Payload bisa berubah antar versi).
3. ✅ **Provider + fixed-position** — mount via `admin.components.providers` (selalu loaded di seluruh admin route), render floating widget `position: fixed; top: 12px; right: 64px` sehingga visually dekat account icon.

Chosen: #3. Simple, reversible, tidak bergantung internal class Payload. Login/forgot route di-skip via `window.location.pathname` check.

### Perubahan

| File | Perubahan |
|---|---|
| `apps/cms/src/admin/BellNotifications.tsx` | Rewrite style objects: wrapper `position: fixed; top: 12; right: 64; z-index: 100` menggantikan sidebar inline. Button: ikon 36×36 rounded, hover subtle elevation-100 bg, badge absolute top-right dgn ring-2 bg (seperti badge notif umumnya). Panel: `top: calc(100% + 8px); right: 0; width: 360px; max-height: min(70vh, 520px)` drop-down menggantikan side-panel kiri. Tambah ESC key handler. Tambah login-route auto-hide via `useEffect` + `window.location.pathname.startsWith('/admin/login')`. **targetHref per-type policy**: `payment_proof_submitted` → payment-proof edit (admin review); semua tipe lain dgn booking rel → booking edit (lihat status terbaru confirmed/awaiting_payment); fallback payment-proof. |
| `apps/cms/src/admin/BellMount.tsx` | **NEW** — client component provider wrapper. Return `<>{children}<BellNotifications /></>` supaya bell render floating di luar normal sidebar flow tapi tetap di tree admin. |
| `apps/cms/src/payload.config.ts` | (a) Hapus `/admin/BellNotifications#default` dari `afterNavLinks` (sidebar). (b) Tambah `/admin/BellMount#default` di `providers` setelah `MediaFolderSidebar`. |

### Routing Policy (per-type)

| Notification type | Click target | Reason |
|---|---|---|
| `payment_proof_submitted` | `/admin/collections/payment-proofs/<id>` | Admin perlu review file bukti upload sebelum approve/reject |
| `booking_new` | `/admin/collections/bookings/<id>` | Lihat detail reservasi baru |
| `payment_rejected` | `/admin/collections/bookings/<id>` | Lihat status booking (`awaiting_payment` setelah revert) |
| `reschedule_request` | `/admin/collections/bookings/<id>` | Admin confirm reschedule di booking |
| `cancel_request` | `/admin/collections/bookings/<id>` | Admin confirm cancel di booking |
| `other` (payment approved & receipt sent, dsb.) | `/admin/collections/bookings/<id>` | Lihat `status=confirmed` + `sentTicketAt/By` + receipt |
| Any (fallback no booking rel) | `/admin/collections/payment-proofs/<id>` | Last resort |

### Visual

- Icon bell 20×20 SVG stroke, button 36×36 rounded 8.
- Badge merah `#dc2626` dgn ring putih `box-shadow: 0 0 0 2px var(--theme-bg)` di top-right button, min-width 18px auto expand up to "99+".
- Panel white dgn border elevation-150 + shadow `0 12px 32px rgba(15,23,42,.18)`, radius 10, max-width `calc(100vw - 24px)` responsive.
- Severity dot biru/orange/merah di kiri setiap row.
- Click row → mark-read silent + navigate.

### Testing

#### Programmatic
- [x] TypeScript compiles OK (payload-types.ts tidak berubah, zero schema).
- [x] CMS hot-reload clean (no new runtime import; `BellMount` cuma React fragment).

#### Pending (butuh dev restart + login)
- [ ] Bell muncul top-right di semua route admin (dashboard, list, edit).
- [ ] Bell **tidak** muncul di `/admin/login` + `/admin/logout` + `/admin/forgot*`.
- [ ] Badge count update tiap 30s polling.
- [ ] Click outside / ESC tutup panel.
- [ ] Click notif `payment_proof_submitted` → go to `/admin/collections/payment-proofs/<id>`.
- [ ] Click notif `booking_new` → go to `/admin/collections/bookings/<id>`.
- [ ] Click notif approve (type `other`) → go to `/admin/collections/bookings/<id>` (verify `status=confirmed`).
- [ ] Sidebar footer (SidebarFooter + NavAccordion) tetap render benar tanpa bell.
- [ ] Mobile viewport (<768px): panel tidak overflow, `max-width: calc(100vw - 24px)` effective.

### Known Deferred

- Mark-all-read button di panel header (bulk POST ke `/api/admin-notifications/mark-all-read` — endpoint baru, defer 4.74.8).
- Filter tipe dropdown di panel (info/warning/critical).
- Sound/toast notification baru masuk (defer; perlu permission API + preference setting).
- Portal ke DOM header slot Payload (kalau versi future expose slot resmi — fixed-position masih acceptable).
- Keyboard shortcut buka bell (e.g. `Ctrl+Shift+N`).

### Rollback

Revert 3 file:
1. `apps/cms/src/admin/BellNotifications.tsx` — restore style objects sidebar (position relative, side-panel left:100%).
2. `apps/cms/src/admin/BellMount.tsx` — delete.
3. `apps/cms/src/payload.config.ts` — remove `BellMount` dari providers, restore `BellNotifications` di afterNavLinks.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.7

### Next Step

User restart `pnpm dev` di apps/cms, buka admin, trigger beberapa notif (POST booking baru, submit payment proof, approve/reject), verify UI + click routing policy.

---

## Follow-up 4.74.7a — Spacing + Mark-All-Read + Type Color Coding

**Tanggal**: 2026-10-17 (sama hari, post-E2E feedback)

### User Feedback

> posisi nya terlalu mepet dengan icon account user, sehingga menimpa icon user tersebut, buat space disana. dan tambahkan juga button "sudah baca semua" dan untuk warna nya jika approve hijau, decline merah, request kuning, new booking biru, aktifitas lain nya orange.

### Fix

| Area | Perubahan |
|---|---|
| **Position** | `right: 64` → `right: 120` di `BellNotifications.tsx` wrapper. Jarak ~24px dari account button Payload (sebelumnya overlap). |
| **Mark-all-read endpoint** | `POST /api/admin-notifications/mark-all-read` baru di `AdminNotifications.ts` (`markAllReadEndpoint`). Admin+ auth. Scan 500 notif terbaru sort `-createdAt`, loop per-notif: skip jika user sudah di `readBy[]`, else push `{user: req.user.id, readAt: now}`. Return `{ok, marked, scanned}`. Best-effort try/catch per update. |
| **Mark-all-read UI** | Panel header: tombol "✓ Sudah baca semua" di kanan, border elevation-150, disabled saat `count===0` atau sedang submit. Loading state label "Menyimpan…". Click → POST → re-fetch unread (otomatis refresh badge + opacity row). |
| **Color coding per-type** | Function baru `colorForNotif(n)` replace `SEVERITY_COLORS[severity]` di dot indikator: `booking_new`→biru `#2563eb`, `payment_rejected`→merah `#dc2626`, `reschedule_request`/`cancel_request`→kuning `#ca8a04`, `other` dgn severity=critical atau title mengandung "rejected/declined"→merah, `other` dgn title mengandung "approved"→hijau `#16a34a`, `payment_proof_submitted` + sisanya→orange `#ea580c`. |

### Files Changed (Follow-up 4.74.7a)

- `apps/cms/src/admin/BellNotifications.tsx` — `right: 120`, state `marking`, handler `handleMarkAllRead`, UI button di head, replace `SEVERITY_COLORS` dgn `colorForNotif()`.
- `apps/cms/src/collections/AdminNotifications.ts` — tambah `markAllReadEndpoint` + register di `endpoints[]`.

### Rollback (incremental)

Hapus `markAllReadEndpoint` dari AdminNotifications.ts endpoints array, hapus state `marking` + handler + button di BellNotifications.tsx, kembalikan `SEVERITY_COLORS` + `right: 64`.

---

## Follow-up 4.74.7b — Tabs Unread / Read (Clean UI + Riwayat)

**Tanggal**: 2026-10-17

### User Feedback

> tambahkan di dalam itu ada section yang belum terbaca, dan jika sudah di baca maka akan hilang akan tetapi dia ada di tab yang satu lagi. sehingga jika notifikasi di buka itu nanti ada teks belum ada notifikasi, namum juga user klik tab di sebelah nya baru dia bisa lihat notifikasi yang sudah dibaca. jadi tampilan tetap clean serta informasi tetap terjaga jika user mau baca kembali dari notifikasi.

### Fix

| Area | Perubahan |
|---|---|
| **Tab state** | State baru `tab: 'unread' \| 'read'` default `'unread'`. Auto-reset ke `'unread'` setiap kali `open` berubah ke true (effect baru). |
| **Partition** | Dalam render panel: `unreadItems = items.filter(!read)`, `readItems = items.filter(read)`, `list = tab === 'unread' ? unreadItems : readItems`. |
| **Tabs UI** | 2 tombol tab di bawah header dgn border-bottom indicator (2px elevation-800 kalau aktif, transparent kalau tidak), pill count di kanan setiap label — dark bg kalau active, light bg kalau inactive. Label Bahasa Indonesia: "Belum dibaca" / "Sudah dibaca". `role="tablist"` + `role="tab"` + `aria-selected`. |
| **Empty states** | Tab unread kosong → "Belum ada notifikasi.", tab read kosong → "Belum ada riwayat terbaca.". |
| **Flow** | Click row → mark-read silent → navigate. Row pindah dari tab Belum dibaca ke tab Sudah dibaca otomatis (opacity 0.6 di row terbaca tetap). "Sudah baca semua" button → semua pindah ke tab Sudah dibaca sekaligus. |

### Rationale

- Admin fokus pada actionable items dulu (Belum dibaca).
- Riwayat tetap bisa diakses tanpa clutter default view.
- Reset tab tiap open: supaya user tidak stuck di tab read saat notif baru masuk.

### Rollback (incremental)

Hapus `TabKey`, state `tab`, effect reset, 2 style objects (tabs/tabBtn/tabPill), ganti render panel balik ke single list `items.map()`.

---

## Follow-up 4.74.7c — Scroll-Away Behavior

**Tanggal**: 2026-10-17

### User Feedback

> notifikasi sudah ok, hanya saja saya mau jika halaman di scroll maka posisi sama seperti icon profile jadi tidak ikut muncul saat di scroll, karena akan menimpa tab yang lain nya.

### Fix

Satu-line fix: `position: 'fixed'` → `position: 'absolute'` di `s.wrapper`. Dgn absolute, elemen tetap positioned relatif ke initial containing block (viewport origin top-right) tapi **ikut scroll bareng document** — sama persis seperti account icon Payload yg hilang saat scroll. Fixed sebelumnya nempel ke viewport → saat admin scroll konten panjang (list booking, edit view), bell nutupin header tab di bawahnya.

### Files Changed

- `apps/cms/src/admin/BellNotifications.tsx` — wrapper style: `position: 'absolute' as const`.

