## Phase: 4.62.1 — Users useAPIKey enabled + API key onboarding
**Tanggal**: 2026-09-27
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Mengaktifkan `useAPIKey` pada collection Users supaya server-side endpoint
(`/api/bookings/create` di Phase 4.62 & `/api/newsletter-subscribe` di
Phase 4.33) bisa authenticate ke Payload REST via
`Authorization: users API-Key <key>`. Sebelum ini, `auth: true` shorthand
tidak menciptakan kolom `api_key` di tabel `users` dan UI admin tidak
memunculkan toggle "Enable API Key" — sehingga `PAYLOAD_API_KEY` env
tidak pernah bisa diisi. Efek samping bonus: newsletter subscribe yang
selama ini code-ready jadi functional.

### File yang Berubah
| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/collections/Users.ts` | Edit | `auth: true` → `auth: { useAPIKey: true }`. Tambah komentar penjelas. |
| `apps/cms/src/migrations/20260927_150653_phase_4_62_1_users_api_key.{ts,json}` | BARU | Migration: `ALTER TABLE users ADD COLUMN enable_a_p_i_key INTEGER; api_key TEXT; api_key_index TEXT`. Down = drop kolom. |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration entry. |
| `packages/shared/src/types/payload-types.ts` | Regenerate | Field `enableAPIKey`/`apiKey` di `User` type. |
| `apps/web/.env.example` | Edit | Reset `PAYLOAD_API_KEY=` (sebelumnya berisi paste URL admin — bukan API key). |

### Impact
- **Database**: migration `20260927_150653_phase_4_62_1_users_api_key` applied ✓. 3 kolom baru di tabel `users`.
- **CMS**: form edit user sekarang menampilkan toggle **"Enable API Key"** + tombol **"Regenerate API Key"** (native Payload UI).
- **Frontend**: tidak ada perubahan kode. `/api/bookings/create` dan `/api/newsletter-subscribe` sekarang bisa berfungsi begitu `PAYLOAD_API_KEY` diisi.
- **RBAC**: tidak berubah.
- **Deploy needed**: **cms only** (migration harus jalan di production DB — di Cloudflare D1 nanti).

### Setup API Key (langkah owner)
1. Buka CMS admin: [http://localhost:3030/admin](http://localhost:3030/admin) → login sebagai super-admin.
2. Sidebar → **Administration → Users** → klik user Anda.
3. Scroll ke form → cari section baru **"API Key"** (di antara field standar).
4. Centang toggle **"Enable API Key"** → simpan.
5. Setelah save, field **"API Key"** menampilkan string UUID-ish (mis. `a1b2c3d4-e5f6-...`). Copy value ini.
6. Buka `apps/web/.env` → isi:
   ```
   PAYLOAD_API_KEY=<paste-value-here>
   ```
7. Restart Astro dev (`pnpm dev` di `apps/web/`) supaya env baru terbaca.
8. Test end-to-end: buka [http://localhost:4321/ferry-tickets/batam-fast](http://localhost:4321/ferry-tickets/batam-fast) → klik "Book Now" → isi form → submit → confirmation page harus muncul dengan tombol WhatsApp.

**Untuk production**: generate API key di admin production, simpan sebagai Cloudflare Workers secret (`wrangler secret put PAYLOAD_API_KEY`).

### Testing
- [x] `pnpm schema:migrate` sukses — kolom baru muncul di tabel `users`.
- [x] `pnpm generate:types` — field `enableAPIKey`/`apiKey` tergenerate.
- [x] CMS dev restart bersih (port 3030 READY).
- [ ] Owner UAT: toggle Enable API Key di admin → paste ke `.env` → submit booking end-to-end.

### Rollback
```
# Revert code
git checkout HEAD -- apps/cms/src/collections/Users.ts \
  apps/cms/src/migrations/index.ts

# Rollback DB
cd apps/cms && pnpm schema:down

# Delete migration files
rm apps/cms/src/migrations/20260927_150653_phase_4_62_1_users_api_key.*

# Regenerate types
pnpm generate:types
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.62.1-users-api-key-enable.md` (file ini)
- [x] `docs/PROGRESS.md`
- [x] `docs/phases/phase-4.62-ferry-ticket-checkout-flow.md` — cross-referensi ke 4.62.1 di section "Setup untuk owner"

### Next Steps
Sama seperti Phase 4.62 — owner UAT end-to-end submit booking begitu API key sudah dipasang di `.env`.
