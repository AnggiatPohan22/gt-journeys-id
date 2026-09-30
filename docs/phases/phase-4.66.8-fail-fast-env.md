## Phase: 4.66.8 — Fail-fast env checks

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Findings**: S-10 + S-11 (Medium/Low) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
Sebelumnya `PAYLOAD_API_KEY`, `BOOKING_FORM_SECRET` diakses dengan `import.meta.env.NAME || <fallback>` yang berarti kalau env production kosong, code silently pakai default string yang publik di git. Untuk `BOOKING_FORM_SECRET` = HMAC secret → default publik = HMAC bisa dipalsukan attacker. Sekarang: di build production, request pertama crash dengan pesan jelas. Dev tetap boleh pakai fallback + console.warn.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/web/src/lib/env.ts](apps/web/src/lib/env.ts) | **New**. Helper `IS_PROD`, `requireEnv(name, value, fallback)`, `requireEnvStrict(name, value)`. |
| [apps/web/src/lib/checkout/signedToken.ts](apps/web/src/lib/checkout/signedToken.ts) | Pakai `requireEnv('BOOKING_FORM_SECRET', ..., <dev fallback>)`. Prod tanpa env → throw. |
| [apps/web/src/lib/checkout/store.ts](apps/web/src/lib/checkout/store.ts) | Pakai `requireEnvStrict('PAYLOAD_API_KEY', ...)` di prod. Dev boleh kosong (endpoint akan return `misconfigured` seperti sebelumnya). |

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**:
  - Dev: perilaku sama, plus `console.warn` kalau env kosong.
  - Prod: kalau env `BOOKING_FORM_SECRET` atau `PAYLOAD_API_KEY` lupa di-set di Cloudflare Pages, request pertama yang menyentuh module ini akan throw dengan pesan `[env] Missing required env <NAME> in production. Set it via wrangler secret / Pages env.` Ini lebih baik dari silent fallback ke default value.
- **Routes**: none.
- **RBAC**: none.

### Testing
- [x] `pnpm --filter web dev` tanpa `.env` → server jalan + console warning: `[env] BOOKING_FORM_SECRET is empty — using dev fallback` dan `[env] PAYLOAD_API_KEY is empty in dev — related feature will be disabled`.
- [ ] `pnpm --filter web build` — build sukses (env helper tidak throw di build time, hanya module init time; Astro build tidak eksekusi endpoint).
- [ ] Simulasi prod: `NODE_ENV=production wrangler pages dev --no-bundle` tanpa `BOOKING_FORM_SECRET` → visit `/checkout/…` → 500 log yang mengandung `[env] Missing required env BOOKING_FORM_SECRET in production`.

### Rollback
```bash
git revert <commit-hash-of-4.66.8>
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.8-fail-fast-env.md`

### Next Steps
Phase 4.66.9 — S-07: rate-limit hardening (turunkan RATE_MAX, salt IP di key). KV upgrade di-defer sampai binding tersedia.
