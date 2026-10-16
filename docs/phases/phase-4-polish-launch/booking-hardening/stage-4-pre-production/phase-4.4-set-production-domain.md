## Phase: 4.4 — Set production domain (replace `https://example.com` placeholder)

**Tanggal**: 2026-10-16
**Status**: DONE (PR TBD)
**Commit**: (akan diisi setelah commit)
**Finding**: — (pre-production hygiene)
**Decision input dari user**: production domain = `https://gtjourneys.id`.

### Ringkasan
Playbook §4 item: ganti placeholder `https://example.com` (ditandai `// TODO: set production domain`) dengan domain production. User provide `https://gtjourneys.id` saat memilih item ini.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/web/src/config/site.ts` | Line 11: `url: 'https://example.com', // TODO:` → `url: 'https://gtjourneys.id',`. TODO comment removed. |
| `apps/web/.env.example` | Line 5: `SITE_URL=https://example.com` → `SITE_URL=https://gtjourneys.id`. |

### Scope keputusan
- **Dilakukan**: 2 file di atas — URL fallback + env template.
- **TIDAK dilakukan** (out of TODO scope, user tidak memerintahkan):
  - `apps/web/src/config/site.ts:14` `contact.email: 'hello@example.com'` — bukan URL, user hanya name domain. Config comment states "In production, all values come from CMS SiteSettings global" → fallback risk minimal. Admin isi via CMS SiteSettings.
  - `apps/web/src/pages/checkout/ferry-tickets/[slug].astro:525` `placeholder="you@example.com"` — standard form input UX placeholder, bukan konfigurasi.
  - Docs dengan `example.com` di `ai/prompt/` + historical phase docs — contoh pedagogis / sejarah, tidak boleh di-rewrite.

### Dampak
- `siteConfig.url` fallback sekarang domain real → sitemap/canonical/OG tag fallback mengarah ke `https://gtjourneys.id` kalau SiteSettings belum di-isi admin.
- Developer baru yang copy `.env.example` dapat value realistic (tetap bisa override di `.env`).

### Testing
- [ ] `pnpm --filter web build` → tidak ada reference ke `example.com` di output sitemap / canonical.
- [ ] Fresh install flow (clone + copy `.env.example` → `.env`) → `SITE_URL` resolve ke domain production.

### Scope
- Zero schema change, zero endpoint change, zero package change.
- Pure config/env.example rewrite.

### Follow-up (user action, bukan AGENT)
- Set `SITE_URL=https://gtjourneys.id` sebagai Cloudflare secret / production env (Step 4.7 Stage 4 USER-only).
- Isi CMS SiteSettings → brand/contact/social yang sebenarnya (Step 4.8).

### Rollback
```bash
git revert <commit-sha>
```
