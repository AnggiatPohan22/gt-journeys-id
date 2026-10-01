## Phase: 4.66.3 — Security headers baseline (`_headers`)

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Finding**: S-04 (High) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
Tambah [`apps/web/public/_headers`](apps/web/public/_headers) — Cloudflare Pages membacanya di root `dist/` dan menerapkan ke setiap response. Baseline mencakup CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, Cross-Origin-Opener-Policy. Confirmation page mendapat aturan tambahan `X-Robots-Tag: noindex` + `Cache-Control: no-store`.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/web/public/_headers](apps/web/public/_headers) | **New**. Global `/*` block + `/checkout/ferry-tickets/confirmation/*` block. |

### CSP baseline yang dipilih

```
default-src   'self'
script-src    'self' 'unsafe-inline'          ; TODO nonce/hash post-audit inline script
style-src     'self' 'unsafe-inline'          ; Tailwind + Astro inline style
img-src       'self' data: blob: https://*.r2.cloudflarestorage.com
font-src      'self'                          ; woff2 self-hosted di /public/fonts
frame-src     https://www.youtube.com
              https://www.youtube-nocookie.com
              https://player.vimeo.com        ; HeroBlock / EmbedBlock / ServiceListingHeroImmersive
connect-src   'self' https://*.r2.cloudflarestorage.com
form-action   'self'                          ; wa.me = <a href>, bukan form submit
frame-ancestors 'none'
base-uri      'self'
object-src    'none'
upgrade-insecure-requests
```

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**: setelah deploy berikutnya, response `/*` dari `dnjourneysbali.com` akan carry header baru. Kalau ada halaman yang load asset dari domain di luar allowlist, CSP akan block-nya — dicek di Testing.
- **Routes**: `/checkout/ferry-tickets/confirmation/*` sekarang punya `X-Robots-Tag: noindex`.
- **RBAC**: none

### Testing
- [x] `astro build` local → verifikasi `dist/_headers` ter-copy (`public/*` di-copy apa adanya ke `dist/` by Astro).
- [ ] Setelah deploy: `curl -I https://dnjourneysbali.com/` → header CSP + friends muncul.
- [ ] Setelah deploy: browser devtools → Network tab → check no CSP violation log di Console pada halaman:
  - Homepage
  - Ferry ticket detail (embed YouTube di HeroBlock/ServiceListingHeroImmersive)
  - Checkout page (form + inline script accordion)
  - Confirmation page (inline script copy-to-clipboard)
  - Chat widget
- [ ] `curl -I https://dnjourneysbali.com/checkout/ferry-tickets/confirmation/FT-…` → `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: private, no-store, ...`.

### Rollback
```bash
git rm apps/web/public/_headers
git commit -m "revert: 4.66.3"
```

Kalau CSP terlalu ketat setelah deploy, longgarkan direktif spesifik (mis. tambah `https://cdn.jsdelivr.net` ke `script-src`) daripada revert total.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/security-patch/phase-4.66.3-security-headers.md`

### Next Steps
Phase 4.66.4 — S-03 + S-06: server-side price recomputation + ferry ticket verification di `/api/bookings/create`.
