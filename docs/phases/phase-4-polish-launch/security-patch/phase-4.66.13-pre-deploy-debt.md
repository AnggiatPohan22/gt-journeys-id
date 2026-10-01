## Phase: 4.66.13 — Pre-deploy debt checklist (Phase 4.66 series)

**Tanggal**: 2026-09-30
**Status**: Open — daftar tugas yang **HARUS** diselesaikan sebelum branch `fix/checkout-security` di-merge & di-deploy ke production. Belum ada action yang di-eksekusi di phase ini — dokumen tracking saja.
**Dikerjakan oleh**: Claude Code (kompilasi dari phase 4.66 → 4.66.12)

### Ringkasan
Phase 4.66 series sudah selesai di sisi code + docs. Ada beberapa langkah operasional (secret rotation, migration run, manual verification) + follow-up phase (dep upgrade, KV, retention) yang **belum** dijalankan karena user belum akan deploy. File ini adalah SATU tempat terpadu untuk melacak semuanya, supaya saat siap deploy nanti tidak ada yang terlewat.

---

## 1. WAJIB dilakukan sebelum deploy (blocker)

### 1.1 Migration DB — `access_token`
Kolom baru di `bookings` (Phase 4.66.5). Tanpa ini, endpoint `/api/bookings/create` akan gagal saat submit form (Payload menolak insert karena field `accessToken` `required: true` dan tidak ada di schema).

```bash
cd apps/cms
pnpm schema:migrate
pnpm generate:types    # regenerate payload-types.ts (SUDAH dilakukan di branch ini)
```

Verifikasi:
- [ ] `pnpm schema:status` menampilkan `20260930_231200_phase_4_66_5_booking_access_token` = up.
- [ ] Row existing di `bookings` (kalau ada) memiliki `access_token` non-null (backfill via `hex(randomblob(16))` di migration).
- [ ] Insert booking baru via form → row baru punya token 32 hex.

### 1.2 Set / rotate Worker secrets
`wrangler.toml` sudah tidak menyimpan `PAYLOAD_SECRET` di `[vars]` (Phase 4.66.1). Wajib set via secret store:

```bash
cd apps/cms
wrangler secret put PAYLOAD_SECRET       # 32+ char random string
# Optional tapi disarankan sekalian rotate karena secret lama pernah placeholder public:
wrangler secret put PAYLOAD_API_KEY
wrangler secret put BOOKING_FORM_SECRET
# Optional (baru dipakai di 4.66.9):
wrangler secret put BOOKING_RL_SALT
```

Verifikasi:
- [ ] `wrangler secret list` menampilkan `PAYLOAD_SECRET` dengan `type = secret_text`.
- [ ] Test deploy dev → `wrangler tail` — tidak ada crash `[env] Missing required env …` (dari fail-fast 4.66.8).

### 1.3 Env di Cloudflare Pages (frontend)
Pastikan Pages project untuk `apps/web` punya env berikut (encrypted / secret):
- [ ] `CMS_URL` (URL production CMS Workers)
- [ ] `PAYLOAD_API_KEY` (dari user CMS dengan API key enabled)
- [ ] `BOOKING_FORM_SECRET` (32+ char random)
- [ ] `BOOKING_RL_SALT` (opsional; kalau tidak diset, pakai konstanta fallback)
- [ ] `PUBLIC_FERRY_CHECKOUT_CHANNEL` (`manual_wa` untuk sekarang)
- [ ] `SITE_URL` = `https://dnjourneysbali.com`

Verifikasi:
- [ ] Cloudflare Pages → Settings → Environment Variables → semua terisi + centang **Encrypt** untuk yang sensitif.
- [ ] Deploy preview → cek `/checkout/ferry-tickets/<slug>` render tanpa error.

### 1.4 Manual test — checkout end-to-end
Testing steps dari phase reports individual. Konsolidasi di sini:

**Happy path:**
- [ ] Buka `/ferry-tickets/<slug>` → pilih date + class → klik "Book Now" → checkout page render.
- [ ] Isi form valid → submit → redirect ke `/confirmation/<ref>?t=<token>` → semua data tampil benar, passport masked (`••••1234`).
- [ ] Klik "Kirim ke WhatsApp" → wa.me URL terbuka, message body ringkas (hanya ref, ferry, rute, tanggal, pax, kelas, nama, WA).
- [ ] Buka Booking di CMS admin → semua field terisi, `access_token` visible di edit view (readOnly).

**Security path:**
- [ ] URL confirmation tanpa `?t=…` → 404.
- [ ] URL confirmation dgn `?t=NOT_HEX` → 404.
- [ ] URL confirmation dgn `?t=<32 hex wrong>` → 404.
- [ ] Tampering di DevTools: edit hidden `<input name="unitPrice" value="1">` sebelum submit → booking record punya `unit_price` sesuai CMS (bukan 1).
- [ ] Tampering `<input name="ferryTicketId" value="999">` (id tidak eksis) → redirect `?err=ferry_not_found`.
- [ ] Ganti slug di URL tapi `ferryTicketId` mismatch → `?err=ferry_slug_mismatch`.
- [ ] Kirim POST 4x cepat dari IP yang sama → attempt ke-4 → `?err=rate_limited`.
- [ ] POST tanpa `formStamp` → `?err=stamp_malformed`.
- [ ] Cross-origin POST ke `/admin/api/users/logout` dari HTML lain → 403 CSRF (Phase 4.66.2).

**Headers:**
- [ ] `curl -I https://<domain>/` → CSP + X-Frame-Options + Referrer-Policy + Permissions-Policy + HSTS visible.
- [ ] `curl -I https://<domain>/checkout/ferry-tickets/<slug>` → sama + `Cache-Control: private, no-store` + `X-Robots-Tag: noindex`.
- [ ] `curl -I https://<domain>/checkout/ferry-tickets/confirmation/FT-…?t=…` → sama.
- [ ] View source halaman checkout → `<meta name="robots" content="noindex, nofollow">` present.
- [ ] Browser devtools Console → **tidak ada** CSP violation di homepage, ferry listing, ferry detail (embed YouTube/Vimeo), checkout, confirmation, chat widget.

### 1.5 Verify no regressions di non-security flow
- [ ] Booking newsletter subscribe masih jalan.
- [ ] Chat widget masih render.
- [ ] Homepage + service listing + detail pages masih render normal.
- [ ] Admin login + edit content masih normal.

---

## 2. Follow-up phases (tech debt — bisa ditunda tapi sebaiknya di-plan)

Tidak blocker untuk deploy Phase 4.66, tapi disarankan dikerjakan di sprint berikutnya.

### 2.1 Phase 4.67 — Dependency upgrade batch
Dari `pnpm audit --audit-level=high` (Phase 4.66.11): **3 Critical, 26 High**. Semua di transitive.

Prioritas:
- [ ] `next` ≥ 15.5.24 (RCE via image optimization AVIF; Windows-only RCE — tidak apply di Workers, tapi high anyway).
- [ ] `astro` line fix (AVIF RCE — mitigasi partial via `imageService: 'passthrough'`).
- [ ] `sharp` bump (libvips CVE-2026-33327 / 33328 / 35590).
- [ ] `wrangler` + transitive `undici` / `ws` / `brace-expansion` (dev-only, low priority).

Deliverable: `docs/phases/phase-4.67-dep-upgrade.md`.

### 2.2 Cloudflare KV untuk rate-limit
Dari Phase 4.66.9 — rate-limit masih in-memory per Worker isolate. Cloudflare Workers punya banyak isolate + restart cepat → mudah di-bypass attacker yang mengetahui.

Plan:
- [ ] Tambah `[[kv_namespaces]]` binding di Pages Functions config untuk `apps/web`.
- [ ] Refactor `apps/web/src/lib/checkout/rateLimit.ts` → cek KV binding di `context.locals.runtime.env.RATE_LIMIT_KV`, fallback ke in-memory kalau tidak ada (dev).
- [ ] Atomic counter via `env.RATE_LIMIT_KV.get/put` dgn TTL 15 menit.

Deliverable: `docs/phases/phase-4.68-kv-rate-limit.md`.

### 2.3 Turnstile di checkout form
Deferred dari Phase 3 Q7. Cloudflare Turnstile = captcha invisible (mostly), gratis.

Plan:
- [ ] Register site key di Cloudflare Turnstile dashboard.
- [ ] Tambah `<div class="cf-turnstile" data-sitekey="…">` di checkout form.
- [ ] Di `/api/bookings/create`: verifikasi `cf-turnstile-response` via `https://challenges.cloudflare.com/turnstile/v0/siteverify` sebelum HMAC stamp check.
- [ ] Env baru: `TURNSTILE_SITE_KEY` (public) + `TURNSTILE_SECRET_KEY` (server).

Deliverable: `docs/phases/phase-4.69-turnstile.md`.

### 2.4 Data retention (PII lifecycle)
Deferred dari Phase 3 Q5. Passport + notes disimpan penuh di CMS.

Plan:
- [ ] Konfirmasi requirement dgn owner (GDPR? PDP Indonesia? Ada regulasi lokal?).
- [ ] Cron job `runBookingRetention()` mirror `runChatRetention` — anonimisasi passport + notes + email untuk booking berstatus `confirmed` atau `expired` yang berumur > N hari (mis. 180 hari).
- [ ] Endpoint `POST /api/booking-retention` gated by `x-cron-key`, mirror pattern `chat-retention`.

Deliverable: `docs/phases/phase-4.70-booking-retention.md`.

### 2.5 Admin UI: regenerate accessToken + resend link
Sekarang kalau customer kehilangan URL confirmation, admin harus:
1. Buka Booking di CMS.
2. Copy `bookingRef` + `accessToken`.
3. Susun manual: `https://<domain>/checkout/ferry-tickets/confirmation/<ref>?t=<token>`.
4. Kirim via WhatsApp.

Enhancement: tombol "Regenerate & Resend Access Link" di edit view Booking yang:
- Generate accessToken baru.
- Kirim WA button ke admin dgn link fresh (sekali klik).

Deliverable: `docs/phases/phase-4.71-booking-resend-link.md`.

### 2.6 CSP tightening — hilangkan `unsafe-inline`
Sekarang CSP `script-src` + `style-src` masih pakai `'unsafe-inline'` (Phase 4.66.3) karena banyak Astro page yang punya inline `<script>` untuk progressive enhancement (accordion, chat widget, checkout form validation).

Plan:
- [ ] Audit semua inline `<script>` di `apps/web/src/**/*.astro`.
- [ ] Pindah ke external files atau tambah `nonce` / `hash` di CSP.
- [ ] Update `_headers` CSP → hapus `'unsafe-inline'`, tambah `'nonce-<random>'` per response.

Deliverable: `docs/phases/phase-4.72-csp-strict.md`.

### 2.7 Payment gateway integration (Xendit / Midtrans)
Phase 4.66.4 sudah membuat schema Bookings gateway-ready (channel + channelData). Ini fase business, bukan security-only, tapi dependency ke security-hardening ini.

Plan (sketch):
- [ ] Pilih gateway (Xendit vs Midtrans) — konfirmasi dgn owner.
- [ ] Implement `apps/web/src/lib/checkout/channels/xendit.ts` (atau `midtrans.ts`) sebagai `CheckoutChannel`.
- [ ] Webhook endpoint di CMS: `apps/cms/src/app/(payload)/api/webhooks/<provider>/route.ts` dgn signature verification.
- [ ] `Bookings.status` transitions: `pending` → `awaiting_payment` (setelah invoice dibuat) → `confirmed` (setelah webhook payment success).
- [ ] Idempotency: unique constraint pada gateway invoice id di `channelData` via hook.

Deliverable: `docs/phases/phase-5.0-payment-gateway.md`.

---

## 3. Update payload-types.ts (auto-generated)

Setelah run `pnpm generate:types` di local, file `packages/shared/src/types/payload-types.ts` update dgn interface baru:
- `Booking.accessToken: string`
- Description passport diperbarui.

File ini ikut di-commit di phase 4.66.13 supaya CI di frontend tidak error TS.

### File yang Berubah (Phase 4.66.13)
| File | Perubahan |
|------|-----------|
| [docs/phases/phase-4-polish-launch/security-patch/phase-4.66.13-pre-deploy-debt.md](docs/phases/phase-4-polish-launch/security-patch/phase-4.66.13-pre-deploy-debt.md) | **New** — konsolidasi debt untuk seluruh series 4.66. |
| [packages/shared/src/types/payload-types.ts](packages/shared/src/types/payload-types.ts) | Regenerated — tambah `Booking.accessToken`, update description `passportNumber`. |

### Impact
- **Database**: none (dokumen + type file saja).
- **CMS**: none.
- **Frontend**: none.
- **Routes**: none.
- **RBAC**: none.

### Testing
- [x] `pnpm --filter web dev` — TS resolve `Booking.accessToken` tanpa error (dipakai di `getBookingByRefAndToken`).
- [x] `pnpm --filter cms dev` — Payload types sync dgn schema collection.

### Rollback
```bash
git revert <commit-hash-of-4.66.13>
```
Tapi `payload-types.ts` akan re-generate lagi begitu `pnpm generate:types` dijalankan.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/security-patch/phase-4.66.13-pre-deploy-debt.md`

### Next Steps
Series **Phase 4.66 → resmi PARKIR** menunggu keputusan deploy owner. Kalau owner sudah siap deploy: kerjakan section 1 (blocker) satu-per-satu, centang checklist, lalu merge branch `fix/checkout-security`. Follow-up section 2 boleh di-schedule sebagai phase terpisah kapanpun.
