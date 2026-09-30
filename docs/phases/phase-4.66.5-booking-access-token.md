## Phase: 4.66.5 — Booking access token (IDOR fix)

**Tanggal**: 2026-09-30
**Status**: Selesai — menunggu `pnpm --filter cms schema:migrate` di dev/prod
**Dikerjakan oleh**: Claude Code
**Finding**: S-02 (High) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
`bookingRef` (~24-bit hex/day) mudah ditebak → confirmation page publik + fetch server-side dengan API key = IDOR. Solusi: tambah kolom `accessToken` (128-bit hex random) di Bookings. URL konfirmasi jadi `/checkout/ferry-tickets/confirmation/<ref>?t=<token>`. Constant-time compare di server. Ref tanpa token yang valid → 404 (bukan 403 — supaya attacker tidak bisa membedakan ref yang eksis).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/cms/src/collections/Bookings.ts](apps/cms/src/collections/Bookings.ts) | Tambah field `accessToken` (text, required, unique, index, readOnly di admin). |
| [apps/cms/src/migrations/20260930_231200_phase_4_66_5_booking_access_token.ts](apps/cms/src/migrations/20260930_231200_phase_4_66_5_booking_access_token.ts) | **New**. `ALTER TABLE bookings ADD access_token text` + backfill row lama dengan `hex(randomblob(16))` + `CREATE UNIQUE INDEX`. |
| [apps/cms/src/migrations/index.ts](apps/cms/src/migrations/index.ts) | Register migration baru. |
| [apps/web/src/lib/checkout/store.ts](apps/web/src/lib/checkout/store.ts) | Tambah `getBookingByRefAndToken(ref, token)` (validasi format hex + constant-time compare), `generateAccessToken()` (16 byte via `crypto.getRandomValues`), helper `constantTimeEqual`. |
| [apps/web/src/pages/api/bookings/create.ts](apps/web/src/pages/api/bookings/create.ts) | Generate `accessToken`, kirim ke `createBooking`, redirect ke `confirmation/<ref>?t=<token>`. |
| [apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](apps/web/src/pages/checkout/ferry-tickets/confirmation/%5Bref%5D.astro) | Baca `?t=<token>` dari query, pakai `getBookingByRefAndToken`. Tanpa token/valid → redirect 404. |

### Impact
- **Database**: 1 kolom baru `access_token` di `bookings` + 1 unique index. Migration di-run via `pnpm --filter cms schema:migrate`.
- **CMS**: field baru `accessToken` muncul di edit view Booking (readOnly). Tidak terlihat di list default.
- **Frontend**: URL confirmation format berubah → wajib menyertakan `?t=<token>` untuk buka. URL lama tanpa token → 404. Setiap redirect setelah submit form otomatis membawa token; UX customer tidak berubah.
- **Routes**: `/checkout/ferry-tickets/confirmation/[ref]` sekarang requires query param.
- **RBAC**: none.

### Langkah setelah pull

Wajib jalankan migration sebelum server-CMS dinyalakan:
```bash
cd apps/cms
pnpm schema:migrate
pnpm generate:types    # regenerate payload-types.ts supaya accessToken tetap known TS-side
```

### Testing
- [ ] `pnpm schema:migrate` → status "Migrated": `20260930_231200_phase_4_66_5_booking_access_token`.
- [ ] `pnpm schema:status` → migration di-list "up".
- [ ] Buka checkout → submit form valid → confirmation page terbuka (URL punya `?t=…`).
- [ ] Copy URL, hapus `?t=…` bagiannya, buka lagi → redirect ke `/404`.
- [ ] Ganti `t=abc123` (tidak match) → redirect ke `/404`.
- [ ] Ganti `t=NOT_HEX` → redirect ke `/404` (regex reject).
- [ ] Existing booking record di DB (kalau ada dari testing sebelumnya) — buka via admin CMS → field `accessToken` sudah terisi 32 hex (dari backfill migration).

### Rollback
```bash
# Kalau sudah production dan mau full revert:
git revert <commit-hash-of-4.66.5>
cd apps/cms
pnpm schema:down    # jalankan sesuai jumlah step yang perlu di-rollback
# Kolom access_token & index-nya akan di-DROP.
```

### Catatan operasional
- Kalau customer kehilangan URL, admin bisa buka Booking di CMS → salin `accessToken` → susun kembali URL: `https://dnjourneysbali.com/checkout/ferry-tickets/confirmation/<ref>?t=<token>`.
- Kalau perlu invalidate URL (mis. leaked), admin regenerate: edit booking → clear `accessToken` → generate baru (bisa via UI custom di phase berikutnya, atau lewat DB direct untuk sekarang).
- Manual WhatsApp message TIDAK menyertakan URL — sesuai kebijakan minimalisasi PII (finding S-13, akan di-trim di Phase 4.66.10). Kalau butuh, tambahkan link di WA message sebagai enhancement mendatang.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.5-booking-access-token.md`
- [ ] `docs/02-DATABASE-SCHEMA.md` — akan diupdate setelah semua schema perubahan phase 4.66.* selesai (batch update).

### Next Steps
Phase 4.66.6 — S-08: response header `Cache-Control: no-store` + `<meta noindex>` di confirmation page (double-defense di atas `_headers` yang sudah di-set Phase 4.66.3).
