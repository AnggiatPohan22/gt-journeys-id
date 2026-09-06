## Phase 4.32: Site Features — Refactor Admin Panel into 4 Tabs + Reserved Toggle Audit
**Tanggal**: 2026-09-06
**Status**: ✅ Code complete — menunggu owner UAT (admin UI visual)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Branch**: `feature/phase4-polish-launch`
**Commits**: `a94a70d` (tabs refactor)

### Ringkasan
Merapikan panel admin `/admin/globals/site-features` dari 4 group flat menjadi 4 tab Payload (unnamed/interfaceOnly `type:'tabs'`). Pure UI/admin-config change — data shape tidak berubah, tidak ada migrasi, tidak ada perubahan di `apps/web`. Sekalian audit 3 toggle "(reserved — Phase 4)" (Banner Promo, Newsletter Signup, Announcement Bar) dan konfirmasi ketiganya masih dead placeholder (dipertahankan sesuai keputusan owner: **Option A — leave as-is**).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteFeatures.ts` | 4 top-level `group` (`modules`, `sections`, `destinations`, `features`) dibungkus dalam satu unnamed `type:'tabs'`. Tiap tab berisi 1 group utuh (nama/label/description/field intact). Urutan tab: Modul Layanan · Section Halaman · Destinasi · Fitur Opsional. |

### Data Shape Guarantee
Unnamed tabs tidak menambah key namespace. JSON tersimpan tetap:
```json
{
  "modules":      { "tours": true, "accommodations": true, ... },
  "sections":     { "testimonials": true, "faq": true, "promoBanner": false, "newsletter": false },
  "destinations": { "hierarchicalFilter": false, "destinationTypesEnabled": true },
  "features":     { "whatsappFloat": true, "announcementBar": false }
}
```
Konsumen frontend di `apps/web/src/lib/features.ts` (`getFeatures`, `isModuleEnabled`, `isSectionEnabled`, `isFeatureEnabled`, `enabledModulesAsync`) baca key yang sama — 0 perubahan kode di web.

### Audit 3 Reserved Toggles
| Toggle | Path CMS | Konsumen frontend | Status |
|---|---|---|---|
| Banner Promo | `sections.promoBanner` | none | **DEAD** — typed di `features.ts:21`, default `false`, tidak ada component render. Label sudah "(reserved — Phase 4)". |
| Newsletter Signup | `sections.newsletter` | none | **DEAD** — typed di `features.ts:22`, default `false`, tidak ada component render. |
| Announcement Bar | `features.announcementBar` | none | **DEAD** — typed di `features.ts:26`, default `false`, tidak ada component render. |

**Bandingkan dengan toggle live**: `features.whatsappFloat` dibaca di [`WhatsAppFloating.astro:83`](../../apps/web/src/components/common/WhatsAppFloating.astro), module toggles dikonsumsi via `enabledModulesAsync()`.

**Latent note (bukan bug hari ini)**: `isSectionEnabled` / `isFeatureEnabled` return `f.sections[key] !== false`, artinya nilai yang hilang → `true`. Aman karena `getFeatures()` selalu spread `DEFAULT_FEATURES` dulu (semua reserved default `false`), jadi nilai selalu terdefinisi. Perlu diingat saat Phase 4 next wire mereka: pastikan default di CMS + `DEFAULT_FEATURES` konsisten.

### Keputusan Owner
Owner memilih **Option A — leave as-is**. Ketiga toggle dipertahankan di CMS dengan label "(reserved — Phase 4)" sebagai placeholder siap-pakai saat component-nya nanti dibuat. Tidak dihapus, tidak diwire sekarang.

### Impact
- **Database**: none. Tidak ada schema/data change.
- **CMS admin UI**: 4 tab horizontal di `/admin/globals/site-features` (sebelumnya 4 group flat vertikal). Semua field/label/description sama persis.
- **Frontend Astro**: nol impact. Data key tidak berubah, cache/build behavior sama.
- **payload-types.ts**: unchanged (unnamed tabs tidak masuk generated types).
- **RBAC**: unchanged. Global masih super-admin only (`admin.hidden` + `access.update: isSuperAdmin`).

### Testing
- [x] Grep konfirmasi konsumen: hanya `whatsappFloat` (di `WhatsAppFloating.astro`) dan module keys (di `enabledModulesAsync`) yang punya konsumen. 3 reserved toggle 0 konsumen.
- [x] Git diff commit `a94a70d`: 111 insertions / 82 deletions — semata restructure, field slug + defaultValue tidak berubah.
- [ ] **Manual UI check (owner) — super-admin**: login → `/admin/globals/site-features` → 4 tab tampil urut (Modul Layanan · Section Halaman · Destinasi · Fitur Opsional). Toggle salah satu (mis. `modules.rentals` OFF), save, reload → nilai persist.
- [ ] **Frontend smoke**: `cd apps/web && pnpm build` → build sukses, module OFF hilang dari nav/homepage/sitemap seperti sebelumnya.

### Rollback
```bash
git revert a94a70d
```
Aman & instant — 1 file, no schema.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.32-site-features-tabs.md` (file ini)
- [x] `docs/PROGRESS.md` — row 4.32 ditambahkan setelah row 4.31.

### Constraints yang Dipenuhi
- ✅ Tidak ada rename field/group slug, label, atau description
- ✅ Data shape identik (unnamed tabs)
- ✅ 0 perubahan di `apps/web`
- ✅ 0 perubahan di `payload-types.ts`
- ✅ Tidak ada auto-fix di 3 reserved toggle (owner Option A)

### Next Steps (opsi, tidak dieksekusi)
- **Wire Banner Promo / Newsletter / Announcement Bar** saat Phase 4 hampir launch — perlu component + editorial content field (bukan cuma toggle boolean). Tanpa content field, toggle ON = render kosong.
- **Konsolidasi `isSectionEnabled` / `isFeatureEnabled`** ke satu helper `isEnabled(path, defaultValue)` untuk hilangkan asumsi "missing = true".
