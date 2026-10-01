# Phase 5: Production Deploy

**Status:** ⬜ Not Started
**Timeline:** —
**Depends on:** [Phase 4 — Polish & Launch](phase-4-polish-launch.md)

## Tujuan

Deploy CMS ke Cloudflare Workers + frontend ke Cloudflare Pages, provisioning storage
(D1, R2), custom domain + SSL, dan build/content webhook untuk auto-rebuild.

## Yang Direncanakan

- [ ] Cloudflare account setup + Workers paid plan ($5/mo)
- [ ] D1 database provisioned
- [ ] R2 bucket provisioned
- [ ] CMS deployed ke Cloudflare Workers
- [ ] Super-admin user dibuat di production
- [ ] Real content di-input (bukan dummy data)
- [ ] Frontend connected ke Cloudflare Pages (GitHub auto-deploy)
- [ ] Environment variables production di-set
- [ ] Custom domain pointing (dnjourneysbali.com)
- [ ] SSL terverifikasi aktif
- [ ] Build webhook CMS → Pages terpasang
- [ ] Content webhook → auto-rebuild frontend saat CMS save (pindah dari Phase 3 — hanya bisa dites di production dgn Cloudflare Pages build hook)
- [ ] Final smoke test di production URL

## Catatan

- Item **auto-rebuild webhook** (`site-features` & content save) di-defer dari Phase 3
  karena butuh Cloudflare Pages build hook yang live — tidak bisa dites di lokal.
- Verifikasi pasca-deploy (301 redirect, canonical produksi, structured data, sitemap,
  Search Console) dikumpulkan di [post-deploy-todo.md](../post-deploy-todo.md).

## Related Reports

- Belum ada. Lihat [05-INFRA.md](../05-INFRA.md) untuk arsitektur infra target.

---

## Phase 6 — Documentation & Template Packaging ⬜ NOT STARTED

Fase penutup: memaketkan project sebagai template reusable untuk client berikutnya.

- [ ] Update SETUP.md dengan langkah final yang sudah teruji
- [ ] Content guide untuk client (cara pakai CMS admin)
- [ ] Screenshot/video tutorial CMS usage
- [ ] Template checklist final untuk reuse ke client berikutnya
- [ ] Git tag versi template: v1.0.0
