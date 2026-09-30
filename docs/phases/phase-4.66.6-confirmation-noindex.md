## Phase: 4.66.6 — Cache-Control + noindex di checkout/confirmation

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Finding**: S-08 (Medium) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
Halaman yang berisi PII (checkout form + confirmation) sekarang mendapat header no-store + noindex baik dari `_headers` (Cloudflare edge) maupun dari `Astro.response.headers` di route SSR. Meta `<meta name="robots" content="noindex,nofollow">` juga di-inject via prop `noindex={true}` ke `PageLayout` → `BaseLayout`. Triple-defense mencegah CDN cache, browser back-button restore, dan indexing search engine.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](apps/web/src/pages/checkout/ferry-tickets/confirmation/%5Bref%5D.astro) | Set `Astro.response.headers` untuk Cache-Control + Pragma + X-Robots-Tag. Pass `noindex={true}` ke PageLayout. |
| [apps/web/src/pages/checkout/ferry-tickets/[slug].astro](apps/web/src/pages/checkout/ferry-tickets/%5Bslug%5D.astro) | Pass `noindex={true}` ke PageLayout. |
| [apps/web/public/_headers](apps/web/public/_headers) | Tambah rule `/checkout/ferry-tickets/*` sebelum `.../confirmation/*`. Yang paling spesifik menang, jadi confirmation tetap dapat rule-nya. |

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**: user tidak lihat perubahan visual. `<meta name="robots" content="noindex, nofollow">` sekarang muncul di `<head>` halaman checkout & confirmation. Response headers dari SSR route menang atas `_headers` untuk halaman yang dinamis.
- **Routes**: none baru.
- **RBAC**: none.

### Testing
- [ ] `curl -I http://localhost:4321/checkout/ferry-tickets/some-slug` → `Cache-Control: private, no-store` + `X-Robots-Tag: noindex, nofollow, noarchive`.
- [ ] `curl -I http://localhost:4321/checkout/ferry-tickets/confirmation/FT-…?t=…` → same headers.
- [ ] View source → `<meta name="robots" content="noindex, nofollow">` present.
- [ ] Setelah submit form → tekan tombol Back di browser → halaman confirmation tidak muncul dari bfcache (harus fresh fetch, kalau ref/token sudah invalid → 404).

### Rollback
```bash
git revert <commit-hash-of-4.66.6>
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.6-confirmation-noindex.md`

### Next Steps
Phase 4.66.7 — S-09: `access.update = superAdminFieldAccess` di field passportNumber untuk defense-in-depth.
