## Phase: 4.1 — Dedicated API user role untuk web→CMS (`PAYLOAD_API_KEY` scoped)

**Tanggal**: 2026-10-16
**Status**: CODE DONE (PR TBD) — menunggu USER manual steps post-merge untuk rotate
**Commit**: (akan diisi setelah commit)
**Finding**: #9 (High) — `PAYLOAD_API_KEY` belongs to admin-role user
**Decision input dari user**:
- Arsitektur: Option A (role baru di Users).
- API user email: `api-web@internal.gtjourneys.id`.

### Ringkasan
Scope `PAYLOAD_API_KEY` dari admin-role (full power) ke role baru `'api'` yang HANYA punya akses ke 3 collection yang web→CMS panggil lewat HTTP (bookings, otp-verifications, newsletter-subscribers). Role baru tidak login admin UI secara efektif (super-admin tetap bisa manage; manusia tidak pernah assigned).

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/access/roles.ts` | Add `isApi` + `isApiOrAdmin` helpers (tidak mengubah `isAdmin` existing). |
| `apps/cms/src/collections/Users.ts` | Add role option `{ label: 'API Integration (web→CMS, non-human)', value: 'api' }` di role select. Description notes "non-human". |
| `apps/cms/src/collections/Bookings.ts` | `access.create` + `access.update` → `isApiOrAdmin`. `read` + `delete` tetap admin-only (API user tidak perlu list / delete; endpoint send-* pakai `overrideAccess` internally). |
| `apps/cms/src/collections/OtpVerifications.ts` | `access.create/read/update/delete` → `isApiOrAdmin` (full CRUD, karena cron cleanup perlu delete). |
| `apps/cms/src/collections/NewsletterSubscribers.ts` | `access.create/read/update` → `isApiOrAdmin`. `delete` tetap super-admin. |

### Yang TIDAK berubah
- `ChatMessages` + `ChatVisitors` + `ChatBlockedEvents` — pre-existing `create: () => false` (overrideAccess-only); fix orthogonal, bukan Stage 4.1 scope.
- `Media`, `ServiceTypes` collections yang pakai `isAdmin` — API user tidak perlu akses.
- Field-level `superAdminFieldAccess` (passport dates, dsb) — tetap super-admin only.

### USER manual steps (REQUIRED post-merge)

1. **Login CMS sebagai super-admin** di production (atau staging dulu untuk test).
2. **Buat user baru**:
   - **Email**: `api-web@internal.gtjourneys.id`
   - **Name**: `Web API Integration`
   - **Role** (sidebar): `API Integration (web→CMS, non-human)`
   - **Password**: generate 32+ karakter random (jangan dicatat; password tidak dipakai — login via API key saja). Pakai Security tab > Password Generator.
   - **Enabled**: ✅ (default checked).
   - Save.
3. **Enable API Key** untuk user tersebut:
   - Buka edit page user → Security tab (built-in Payload).
   - Tick "Enable API Key".
   - Save.
   - Copy API key value yang tampil (hanya tampil sekali saat generate).
4. **Rotate di Cloudflare Workers secret**:
   ```bash
   cd apps/cms
   wrangler secret put PAYLOAD_API_KEY
   # paste nilai dari step 3, Enter
   ```
   dan di apps/web (kalau terpisah):
   ```bash
   cd apps/web
   wrangler secret put PAYLOAD_API_KEY
   ```
5. **Smoke test production** flow yang pakai API key:
   - Submit newsletter form di homepage → cek entry baru di CMS `newsletter-subscribers`.
   - Create booking lewat checkout flow → cek entry baru di CMS `bookings`.
   - Cron cleanup OTP → cek log Cloudflare (manual trigger via `wrangler trigger` kalau mau).
6. **Disable API key di user admin lama** (OPTIONAL tapi disarankan):
   - Login super-admin → Users → user admin yang sebelumnya hosting API key.
   - Security tab → uncheck "Enable API Key" → Save.
   - Alternatif: regenerate key milik user admin (makes old key invalid).

### Testing (local dev, sudah di-verify)
- [x] `pnpm generate:types` — Payload types compile, role union sekarang punya `'api'`.
- [x] `tsc --noEmit` — no new error (pre-existing defaultSort / archive scripts tetap).
- [ ] (post-merge) Login super-admin → buat user role `api` → enable API key → smoke test request-change endpoint dengan API key baru → sukses.
- [ ] (post-merge) Login sebagai user role `api` ke admin UI → bisa login tapi tidak melihat navigation booking/otp/newsletter (hidden gate `hidden: ({ user }) => !user || user.role === 'editor'` → saat ini role `api` TIDAK termasuk editor, jadi collection TAMPIL. **Potential refinement**: tambah `|| user.role === 'api'` ke hidden gate kalau mau sembunyikan dari API user admin UI).

### Scope reduction / known limitation
- API user kalau login manual akan **tetap melihat** collection bookings/otp/newsletter di sidebar (hidden gate hanya exclude editor saat ini). Risk rendah — API user password panjang + dedicated, bukan untuk human login. Follow-up kalau mau: tambah role 'api' ke hidden gate (`|| user.role === 'api'`).
- Chat collections (chat-visitors/chat-messages) tetap `create: () => false` → PayloadChatStore via HTTP memang broken (pre-existing). Tidak di-fix di Stage 4.1 (orthogonal).

### Scope
- Zero schema change — role field adalah text column; enum options cuma application-layer.
- Zero endpoint change.
- Zero new package.

### Rollback
```bash
git revert <commit-sha>
# Kalau USER manual steps sudah dijalankan, revert ini bikin role 'api'
# ter-store di DB tapi helper isApiOrAdmin ikut hilang → user API 'api'
# role akan di-reject dari semua collection. Rotate PAYLOAD_API_KEY
# kembali ke user admin-role lama DAN re-enable API key-nya.
```
