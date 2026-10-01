## Phase 4.30: Site Settings — Admin UX Cleanup (Tabs + Accordions)
**Tanggal**: 2026-09-05
**Status**: ✅ Code complete — menunggu owner UAT
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Branch**: `refactor/site-settings-ux-cleanup`
**Commits**: `e78b95c` (tabs + English) → `e6176dc` (collapsible accordions)

### Ringkasan
Refactor UI Site Settings global (`apps/cms/src/globals/SiteSettings.ts`) menjadi struktur bertingkat: 6 tab (`type:'tabs'`) yang di dalamnya setiap sub-section dibungkus `type:'collapsible'` accordion. Semua label & description ditulis ulang ke Bahasa Inggris. Murni presentation-layer — nol perubahan skema, nol rename `name` attribute, nol perpindahan `relatedServices`.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteSettings.ts` | Full rewrite: wrap semua field ke dalam `type:'tabs'` (6 tab unnamed → data tetap di root), lalu bungkus setiap sub-section dengan `type:'collapsible'` (10 accordion total di 6 tab). Semua `name` attrs identik. Ditambahkan `admin.description` bahasa Inggris pada tiap field. Warning `⚠️ DANGER ZONE` pada `footer.additionalScripts`. Helper text WhatsApp menjelaskan primary vs fallback. |
| `packages/shared/src/types/payload-types.ts` | Regen 2x. Diff akhir: JSDoc comments (Bahasa→English + tambahan) + reorder property optional di interface `SiteSetting`/`SiteSettingsSelect`. Shape TypeScript identik — semua 35 konsumen frontend compile sama. |

### Struktur Baru
| # | Tab | Sub-sections (accordion) | Default open |
|---|---|---|---|
| 1 | Brand | Names & Tagline · Brand Assets | first only |
| 2 | Contact & Socials | Contact Details · WhatsApp — Floating Button Defaults · Social Profiles | first only |
| 3 | SEO & Analytics | SEO Metadata (Fallback) · Analytics (Optional) | first only |
| 4 | Layout | Vertical Gaps · Block Padding (Internal) | first only |
| 5 | Content Defaults | Listing Page Headline · Related Services (Global Default) · Error & Placeholder Pages | first only |
| 6 | Advanced | Footer Copyright · ⚠️ Tracking Scripts (Advanced) | first only; Tracking Scripts always collapsed |

**Keputusan default state**: sub-section pertama tiap tab expanded, sisanya collapsed. Rasional: user langsung lihat konten paling umum tanpa scroll, sub-section spesialis tetap terlipat. Pengecualian: **Tracking Scripts** selalu collapsed karena danger zone (raw HTML injection).

**Keputusan multi-open**: independent accordions (bukan exclusive). Rasional: admin kadang perlu compare/copy antar sub-section (mis. WhatsApp primary vs fallback).

### Impact
- **Database**: none. Tabs + collapsibles adalah wrapper presentational — Payload tidak menambah kolom D1 apapun. Semua field `name`, type, dan nesting sama persis.
- **CMS**: Payload admin UI untuk Site Settings sekarang bertab (6) dengan accordion (10) di dalamnya. Tidak ada global baru.
- **Frontend**: none. 35 file konsumen tetap membaca path yang sama (`settings.contact.whatsapp`, `settings.whatsappDefaults.defaultNumber`, `settings.footer.copyrightText`, `settings.layout.blockPadding.top.mobile`, dst).
- **Routes**: none.
- **RBAC**: none. `hidden: editor` dan `update: isAdmin` dipertahankan.
- **Accessibility**: mewarisi built-in Payload collapsible (`aria-expanded`, keyboard toggle Enter/Space, smooth transitions React).

### WhatsApp Caller Trace (verifikasi sebelum edit)
| Field | # Callers | Konsumen utama |
|-------|-----------|----------------|
| `contact.whatsapp` | 12 | Header, Footer, WhatsAppFloating (primary), 8 detail pages, index, property, ContactBlock |
| `whatsappDefaults.defaultNumber` | 1 | WhatsAppFloating (fallback saja) |
| `whatsappDefaults.greetingMessage` | 1 | WhatsAppFloating |
| `whatsappDefaults.businessHours` | 2 | Footer, FooterRenderer |

Kesimpulan: kedua group aktif dipakai. Tidak boleh dihapus/di-merge. Solusi UI: keduanya diletakkan berurutan di tab **Contact & Socials** sebagai 2 accordion terpisah dengan helper text yang membuat peran primary vs fallback eksplisit.

### Catatan Teknis Payload
- **Unnamed tabs** (tanpa `name`) → data tetap di root global, payload-types shape tak berubah.
- **Collapsible tidak boleh punya `name`** — solusinya: bungkus `group` yang sudah ada di dalam collapsible (`collapsible > group > fields`). Data path 100% tak berubah. `admin.hideGutter: true` dipasang di group biar tidak double-frame secara visual.

### Testing
- [x] `payload generate:types` sukses 2x (pass 1: tabs; pass 2: accordions).
- [x] `git diff packages/shared/src/types/payload-types.ts` — hanya JSDoc + reorder property optional. Zero field structural change.
- [x] `pnpm --filter cms exec tsc --noEmit` — error yang muncul semuanya pre-existing (`page.tsx`, `DestinationTypes.ts` `defaultSort`, `ServiceTypes.ts` `defaultSort`). Tidak ada error dari `SiteSettings.ts`.
- [ ] **Manual UI check (owner)** — `cd apps/cms && pnpm dev` → login admin → buka `/admin/globals/site-settings` → verifikasi 6 tab render, dalam tiap tab accordion buka-tutup smooth, isi data lama tetap muncul, save cycle work.
- [ ] **Frontend smoke test (owner)** — `cd apps/web && pnpm dev` → cek Header WA button, floating WhatsApp button, Footer businessHours/copyright, 404 copy, /property placeholder — semua data harus tetap load.

### Rollback
```bash
git checkout main
git branch -D refactor/site-settings-ux-cleanup
```
Atau revert 2 commit: `git revert e6176dc e78b95c`.

Karena tidak ada schema change / migration / data write, rollback aman dan instant.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/admin-ui/site-settings/phase-4.30-site-settings-ux-cleanup.md` (file ini — rename dari `docs/reports/phase-site-settings-ux-cleanup.md`)
- [x] `docs/PROGRESS.md` — row 4.30 ditambahkan setelah row 4.29.

### Constraints yang Dipenuhi
- ✅ Tidak ada rename `name` attribute / schema key / DB field
- ✅ `relatedServices` tetap di dalam `SiteSettings.ts` (Phase 4.17 cascade utuh)
- ✅ Perubahan strictly presentation-layer
- ✅ `payload-types.ts` shape tidak berubah (hanya JSDoc + reorder)
- ✅ Tidak ada package npm/composer baru
- ✅ Bahasa admin: English (mixed→English untuk field yang diedit; default value string bahasa Indonesia di `errorPages` sengaja dipertahankan karena itu **content** yang tampil ke user site, bukan admin label)

### Next Steps (opsi, tidak dieksekusi)
- **Preset selector Layout** — dropdown "Compact/Normal/Spacious" yang auto-fill 4 angka padding. Menambah field baru → butuh approval terpisah (schema change).
- **Enabled toggle per social channel** — checkbox next to setiap URL. Menambah field baru → butuh approval terpisah.
- **Pisah `additionalScripts` ke global sendiri** (`SiteScripts`) supaya akses terbatas ke super-admin saja. Butuh approval + migrasi data.
- **PR ke `main`** — belum di-push. Branch lokal saja (`refactor/site-settings-ux-cleanup`).
