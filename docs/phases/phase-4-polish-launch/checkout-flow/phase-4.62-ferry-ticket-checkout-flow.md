## Phase: 4.62 — Ferry Ticket Checkout Flow (Customer Info + WA Fallback)
**Tanggal**: 2026-09-27
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menambah flow checkout dua-langkah **khusus Ferry Ticket**:
1. Halaman **Customer Information** (`/checkout/ferry-tickets/[slug]`) —
   form untuk data pemesan (nama, WA, email, negara, catatan), detail
   perjalanan (tanggal, adults, children, kelas ferry), dgn prefill dari
   query string sidebar detail page.
2. Halaman **Confirmation** (`/checkout/ferry-tickets/confirmation/[ref]`) —
   ringkasan booking + tombol "Kirim ke WhatsApp" via strategy pattern
   `CheckoutChannel` (sekarang: `manual_wa`; siap ditambah `xendit`/
   `midtrans` di kemudian hari tanpa mengubah form/schema).

Booking disimpan di collection `bookings` (Payload) sebagai **single
source of truth** untuk manual-WA sekarang & gateway nanti. WhatsApp
button dirancang **tetap ada** sebagai fallback manual admin bahkan
setelah gateway aktif.

### Keputusan owner (approvals sebelum implementasi)
- **[SCHEMA]** OK — buat `Bookings` collection + migration baru.
- **[FIELDS]** OK + tambahan `originLocation` (text snapshot),
  `destinationLocation` (text snapshot), `expiresAt` (datetime nullable).
- **[STATUS ENUM]** `pending / awaiting_payment / confirmed / cancelled /
  expired` (tambah `expired`).
- **[ROUTE]** Pakai `/checkout/ferry-tickets/[slug]` (bukan nested di
  `/ferry-tickets/`) supaya kalau Tour/Hotel/Car Rental nyusul, pola sama.
- **[AUTH]** Tidak install package. Anti-spam: **honeypot** (`website`) +
  **signed time-trap** (HMAC-SHA256 `formStamp` dgn `BOOKING_FORM_SECRET`,
  min 3s / max 30m antara load ↔ submit).
- **[NPM]** Zero new packages. Pakai Web Crypto (globalThis.crypto) &
  stdlib.
- **[LISTING CARD]** Book Now di `TicketRouteCard` → checkout URL,
  konsisten dgn detail page.

### File yang Berubah
| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/collections/Bookings.ts` | BARU | Payload collection — customer + trip snapshot + pricing + status + channel. `create` public tertutup (write via API-key), `read`/`update` admin+, `delete` super-admin. |
| `apps/cms/src/payload.config.ts` | Edit | Register `Bookings` di collections list. |
| `apps/cms/src/migrations/20260927_142814_phase_4_62_bookings.{ts,json}` | BARU | Migration: `CREATE TABLE bookings` (24 cols) + 4 indexes + relasi ke `payload_locked_documents_rels`. |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration entry. |
| `packages/shared/src/types/payload-types.ts` | Regenerate | `Booking` + `BookingsSelect` types. |
| `apps/web/src/lib/checkout/types.ts` | BARU | `CheckoutChannel` interface + `CheckoutHandoff` typing. |
| `apps/web/src/lib/checkout/channels/manualWhatsApp.ts` | BARU | Implementasi `manual_wa`: format pesan WA dari booking snapshot → `wa.me` link. |
| `apps/web/src/lib/checkout/channels/index.ts` | BARU | Registry + `resolveChannel('ferry-ticket')` (baca `PUBLIC_FERRY_CHECKOUT_CHANNEL`) + `getManualWaHandoff()` (fallback tetap tersedia bahkan bila gateway aktif nanti). |
| `apps/web/src/lib/checkout/store.ts` | BARU | REST wrapper untuk `bookings` (API-key auth) + `generateBookingRef('FT')`. |
| `apps/web/src/lib/checkout/signedToken.ts` | BARU | HMAC-SHA256 issue/verify `formStamp` (time-trap 3s–30min). |
| `apps/web/src/pages/api/bookings/create.ts` | BARU | POST endpoint: validasi form, cek honeypot + stamp, buat booking record `manual_wa` pending, redirect ke confirmation. |
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | BARU | Form Customer Information (SSR, prefill dari query params, formStamp injected). |
| `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | BARU | Ringkasan booking + tombol "Kirim ke WhatsApp" dari `resolveChannel()`. |
| `apps/web/src/pages/ferry-tickets/[slug].astro` | Edit | Sidebar `<form>` sekarang `method=GET action="/checkout/ferry-tickets/{slug}"` (prefill date/adults/children). Tombol per-class "Book Now" → checkout URL dgn `?class={classType}`. **"Contact Concierge" tetap `wa.me` langsung** (kontak manual, di luar flow booking). |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Edit | `bookHref` di `TicketRouteCard` → `/checkout/ferry-tickets/{slug}` (bukan detail). More info tetap ke detail. |
| `apps/web/.env.example` | Edit | Tambah `PAYLOAD_API_KEY`, `PUBLIC_FERRY_CHECKOUT_CHANNEL`, `BOOKING_FORM_SECRET`. |
| `apps/web/.env` | Edit | Set dev defaults untuk env baru. |

### Arsitektur — kenapa "sync-ready" untuk gateway
1. **Single source of truth**: booking dibuat sebelum tahu channelnya. WA channel & gateway nanti sama-sama baca `Booking` dari CMS — tidak ada struktur data terpisah.
2. **Strategy pattern**: `CheckoutChannel.handle(booking)` menghasilkan `{ redirectUrl, buttonLabel, channelLabel }`. Halaman confirmation TIDAK tahu implementasinya — cukup panggil `resolveChannel('ferry-ticket')`.
3. **Titik keputusan tunggal**: `slugForService(service)` di `channels/index.ts`. Ubah `PUBLIC_FERRY_CHECKOUT_CHANNEL` di env dari `manual_wa` ke `xendit` (nanti) → tombol otomatis pakai XenditChannel.
4. **Fallback WA permanen**: `getManualWaHandoff()` selalu tersedia (dipakai confirmation page → tombol "Manual WhatsApp" tetap muncul jika channel aktif ≠ manual_wa).
5. **Zero form/schema change** saat gateway diaktifkan — cukup nambah file `channels/xendit.ts` implement `CheckoutChannel` + register di switch.

### Anti-spam (tanpa package baru)
- **Honeypot** field `website` (hidden via `class="hidden" aria-hidden` + `tabindex="-1"`). Jika terisi → 302 redirect silent ke `/` (bot tidak tahu diblokir).
- **Signed time-trap** `formStamp`: `<issued-ms>.<hex-hmac-sha256>` dgn `BOOKING_FORM_SECRET`. Verifikasi HMAC → tolak `bad_signature`. Selisih `now - issued` diverifikasi 3s–30min → tolak `too_fast` / `expired`. Pakai Web Crypto (compatible Cloudflare Workers runtime).

### Impact
- **Database**: migration `20260927_142814_phase_4_62_bookings` (buat tabel `bookings`). Applied ✓.
- **CMS**: collection baru `Bookings` di admin group **Administration**.
- **Frontend**: 2 route dinamis baru (SSR, `prerender=false`) + 1 API endpoint. Detail Ferry Ticket + Listing card **berubah target Book Now** ke checkout (bukan `wa.me` langsung).
- **Routes**:
  - `POST /api/bookings/create`
  - `/checkout/ferry-tickets/[slug]`
  - `/checkout/ferry-tickets/confirmation/[ref]`
- **RBAC**: `Bookings` — create/read/update admin+, delete super-admin (public create tertutup; write via API-key).
- **Deploy needed**: **cms + web** (CMS migration harus jalan; frontend perlu build ulang).

### Testing (dev 4321 + CMS 3030)
- [x] `pnpm schema:migrate` sukses — tabel `bookings` created.
- [x] `pnpm generate:types` — `Booking` & `BookingsSelect` types tergenerate.
- [x] `pnpm build` (web) sukses (24s). Static routes tetap prerender (ferry-tickets/[slug] 2 tiket). Checkout & confirmation jadi worker routes.
- [x] GET `/checkout/ferry-tickets/batam-fast?date=2026-10-15&adults=2&children=1&class=ekonomi` — 200 OK, form ter-render, `date=2026-10-15` prefilled, `formStamp` di-sign server-side.
- [x] POST `/api/bookings/create` dgn honeypot terisi → 302 → `/` (silent).
- [x] POST tanpa `formStamp` valid → 302 → `?err=stamp_malformed`.
- [x] POST dgn `formStamp` <3s → 302 → `?err=stamp_too_fast`.
- [x] POST dgn semua field valid + stamp sah + honeypot kosong → mencapai step create booking (butuh `PAYLOAD_API_KEY` di env supaya benar-benar sampai ke CMS write; sekarang return `store_misconfigured` — expected di dev tanpa API key setup).
- [x] Detail page: form Reserve Now → `action="/checkout/ferry-tickets/batam-fast"`, per-class Book Now href `/checkout/ferry-tickets/batam-fast?class=emerald`. Concierge WA link tidak berubah (3 wa.me hits).
- [x] Listing page card ticket variant: `bookHref` sudah checkout URL.
- [ ] End-to-end submit → confirmation page (butuh super-admin generate API key di `/admin` → paste ke `.env` `PAYLOAD_API_KEY` → owner UAT).

### Setup untuk owner (sebelum go-live dev)
1. Login ke CMS `/admin` sbg super-admin.
2. Edit user → enable API Key (tab profile Payload) → copy value.
3. Isi `apps/web/.env`:
   ```
   PAYLOAD_API_KEY=<copied-value>
   BOOKING_FORM_SECRET=<long-random-string>
   ```
4. Restart Astro dev (`pnpm dev`).
5. Coba klik "Book Now" di ferry ticket → isi form → submit → confirmation.

### Rollback
```
# 1. Revert code
git checkout HEAD -- apps/cms/src/collections/Bookings.ts \
  apps/cms/src/payload.config.ts \
  apps/cms/src/migrations/index.ts \
  apps/web/src/lib/checkout/ \
  apps/web/src/pages/api/bookings/ \
  apps/web/src/pages/checkout/ \
  apps/web/src/pages/ferry-tickets/[slug].astro \
  apps/web/src/components/cards/FerryTicketsCard.astro \
  apps/web/.env.example apps/web/.env

# 2. Rollback DB
cd apps/cms
pnpm schema:down    # drops `bookings` table

# 3. Delete migration files
rm apps/cms/src/migrations/20260927_142814_phase_4_62_bookings.*

# 4. Regenerate types
pnpm generate:types
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/checkout-flow/phase-4.62-ferry-ticket-checkout-flow.md` (file ini)
- [x] `docs/PROGRESS.md`
- [ ] `docs/02-DATABASE-SCHEMA.md` — perlu ditambahkan tabel `bookings` (bila dokumen ini di-maintain manual)
- [ ] `docs/04-RBAC.md` — tambah baris untuk `bookings` (admin create/read/update, super-admin delete)

### Next Steps
1. **Owner UAT**: setup API key, coba end-to-end submit → cek record di admin `/admin/collections/bookings`.
2. **Phase 4.62.1 (opsional)** — rate-limiting per IP hash di `/api/bookings/create` (mirroring newsletter's IP hash pattern) bila spam menjadi masalah.
3. **Phase 4.63 (nanti)** — integrasi payment gateway pertama (Xendit atau Midtrans). Tambah `channels/xendit.ts`, tambah nilai `xendit` di select `channel` collection Bookings (via migration), toggle env `PUBLIC_FERRY_CHECKOUT_CHANNEL=xendit`. Form & confirmation page tidak perlu berubah.
4. **Phase 4.6x** — cron auto-expire booking pending: query `WHERE status='pending' AND expiresAt<NOW()` → set status `expired` (bisa run harian).
5. **Phase 4.6x** — extend flow ke Tour/Hotel/Car Rental (schema sudah extensible via `serviceType` enum + snapshot fields).
