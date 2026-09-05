## Phase: Site Settings — Admin UX Cleanup
**Tanggal**: 2026-09-05
**Status**: Selesai (menunggu verifikasi UI oleh owner)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Branch**: `refactor/site-settings-ux-cleanup`

### Ringkasan
Membungkus seluruh Site Settings global (`apps/cms/src/globals/SiteSettings.ts`) di dalam `type: 'tabs'` (6 tab: Brand · Contact & Socials · SEO & Analytics · Layout · Content Defaults · Advanced) dan menambahkan/menerjemahkan seluruh `admin.description` ke bahasa Inggris. Murni presentation-layer — tidak ada perubahan skema DB, tidak ada rename `name` attribute, tidak ada perpindahan `relatedServices`.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteSettings.ts` | Full rewrite dari struktur flat ke `type:'tabs'` dengan 6 tab tidak bernama (unnamed tabs → data tetap di root). Semua `name` attrs dipertahankan identik. Ditambahkan `admin.description` bahasa Inggris pada setiap field. Split visual `defaultSeo` jadi 2 collapsibles (SEO Metadata + Analytics). Warning `⚠️ DANGER ZONE` pada `footer.additionalScripts`. Helper text WhatsApp menjelaskan primary vs fallback. |
| `packages/shared/src/types/payload-types.ts` | Regen (`payload generate:types`). Diff = JSDoc comments + property reorder di interface `SiteSetting` / `SiteSettingsSelect`. Shape TypeScript identik (order optional properties tidak semantic). |

### Impact
- **Database**: none. Tab wrapper tidak mengubah kolom D1. Semua field `name`, type, dan nesting sama.
- **CMS**: Payload admin UI untuk Site Settings sekarang bertab (6). Tidak ada global baru.
- **Frontend**: none. 35 file consumer (Header, Footer, WhatsAppFloating, 8 service detail pages, index, property, 404, BaseLayout, dll.) tetap membaca path yang sama (`settings.contact.whatsapp`, `settings.whatsappDefaults.defaultNumber`, `settings.footer.copyrightText`, dst).
- **Routes**: none.
- **RBAC**: none. `hidden: editor` dan `update: isAdmin` dipertahankan.

### WhatsApp Caller Trace (dikerjakan sebelum edit)
| Field | # Callers | Konsumen utama |
|-------|-----------|----------------|
| `contact.whatsapp` | 12 | Header, Footer, WhatsAppFloating (primary), 8 detail pages, index, property, ContactBlock |
| `whatsappDefaults.defaultNumber` | 1 | WhatsAppFloating (fallback saja) |
| `whatsappDefaults.greetingMessage` | 1 | WhatsAppFloating |
| `whatsappDefaults.businessHours` | 2 | Footer, FooterRenderer |

Kesimpulan: kedua group aktif dipakai. Tidak boleh dihapus/di-merge. Solusi UI: keduanya diletakkan berurutan di tab **Contact & Socials** dengan helper text yang membuat peran primary vs fallback jelas.

### Struktur Tab (baru)
1. **Brand** — siteName, tagline, logo, logoDark, favicon
2. **Contact & Socials** — contact (group), whatsappDefaults (group), socialMedia (group)
3. **SEO & Analytics** — defaultSeo (group) split jadi 2 collapsibles: SEO Metadata + Analytics
4. **Layout** — layout (group): blockGap, beforeFooter, blockPadding
5. **Content Defaults** — sectionPages, relatedServices (via `relatedServicesGlobalFields()`), errorPages (split 2 collapsibles: 404 + Property Coming Soon)
6. **Advanced** — footer (group): copyrightText + additionalScripts dengan warning

### Testing
- [x] `payload generate:types` sukses.
- [x] `git diff packages/shared/src/types/payload-types.ts` — hanya JSDoc & reorder property optional. Zero field structural change.
- [x] `pnpm --filter cms exec tsc --noEmit` — error yang muncul semuanya pre-existing (`page.tsx`, `DestinationTypes.ts` `defaultSort`, `ServiceTypes.ts` `defaultSort`). Tidak ada error dari `SiteSettings.ts`.
- [ ] **Manual UI check (owner)** — `cd apps/cms && pnpm dev` → login admin → buka `/admin/globals/site-settings` → verifikasi 6 tab render, isi data lama tetap muncul, save cycle work.
- [ ] **Frontend smoke test (owner)** — `cd apps/web && pnpm dev` → cek Header WA button, floating WhatsApp button, Footer businessHours/copyright, 404 copy, /property placeholder — semua data harus tetap load.

### Rollback
```bash
git checkout main
git branch -D refactor/site-settings-ux-cleanup
```
Atau revert single commit: `git revert e78b95c`.

Karena tidak ada schema change / migration / data write, rollback aman dan instant.

### Dokumentasi yang Diupdate
- [x] `docs/reports/phase-site-settings-ux-cleanup.md` (file ini)
- [ ] `docs/PROGRESS.md` — belum diupdate (owner mungkin ingin memasukkan di batch Phase 4 polish).

### Constraints yang Dipenuhi
- ✅ Tidak ada rename `name` attribute / schema key / DB field
- ✅ `relatedServices` tetap di dalam `SiteSettings.ts` (Phase 4.17 cascade utuh)
- ✅ Perubahan strictly presentation-layer
- ✅ `payload-types.ts` shape tidak berubah (hanya JSDoc + reorder)
- ✅ Tidak ada package npm/composer baru
- ✅ Bahasa admin: English (mixed→English untuk field yang diedit; default value string bahasa Indonesia di `errorPages` sengaja dipertahankan karena itu **content** yang tampil ke user site, bukan admin label)

### Next Steps (opsi, tidak dieksekusi)
- **Rename label `whatsappDefaults` group** kalau owner mau lebih tegas: "WhatsApp — Floating Button Defaults" sekarang → bisa dipendekkan jadi "Floating WhatsApp Button". Hanya perlu ubah `label` string, `name` attr tetap.
- **Preset selector Layout** — dropdown "Compact/Normal/Spacious" yang auto-fill 4 angka padding. Menambah field baru → butuh approval terpisah (schema change).
- **Enabled toggle per social channel** — checkbox next to setiap URL. Menambah field baru → butuh approval terpisah.
- **Pisah `additionalScripts` ke global sendiri** (`SiteScripts`) supaya akses terbatas ke super-admin saja. Butuh approval + migrasi data.
- **PR ke `main`** — belum di-push. Branch lokal saja.
