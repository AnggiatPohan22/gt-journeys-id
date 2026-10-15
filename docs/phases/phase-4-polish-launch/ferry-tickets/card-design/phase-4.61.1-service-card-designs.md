## Phase: 4.61.1 — Service Card Designs (satu pintu di SiteFeatures)
**Tanggal**: 2026-09-26
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Desain kartu tiap service kini ditentukan **terpusat** di Settings → Pengaturan
Fitur → tab **Modul Layanan**. Saat super-admin mengaktifkan sebuah modul, muncul
dropdown "Card design" untuk service itu (single source of truth). Field
`cardVariant` per-block di-*deprecate* (disembunyikan). Dropdown desain hanya
tampil untuk modul yang aktif → tab tetap rapi.

### Keputusan owner
- **Presedensi**: global berkuasa (satu pintu). Field `cardVariant` per-block disembunyikan & diabaikan frontend.
- **Layout tab**: satu modul per baris = [checkbox enable] + [dropdown desain] (dropdown muncul saat modul ON).
- **Opsi desain**: pakai yang ada — Compact/Detailed (service umum), Ticket/Detailed (Ferry).
- **Default**: service umum = `compact` (dekat tampilan lama), Ferry = `ticket`.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteFeatures.ts` | Registry `SERVICE_MODULES` diperkaya `designs` + `defaultDesign`; `moduleRowFields()` → per modul: checkbox + select `<key>Design` (opsi per-service, `admin.condition` tampil saat modul ON). |
| `apps/cms/src/blocks/index.ts` | Field `cardVariant` di 2 block di-DEPRECATE (`condition: () => false`) — kolom DB dibiarkan (non-destruktif). |
| `apps/web/src/lib/features.ts` | `SiteFeaturesShape` + `DEFAULT_FEATURES` tambah `serviceCards`; `getFeatures()` ekstrak `modules.<key>Design` → `serviceCards`, dan modules disaring hanya boolean. |
| `apps/web/src/lib/serviceCards.ts` | **BARU** — `resolveCardVariant(serviceType, rawFeatures)` + map serviceType↔moduleKey (venues↔weddings, yachts↔yacht, dst). Fallback: ferry→ticket, lainnya→compact. |
| `apps/web/src/components/blocks/ServiceListingEditorial.astro` | `cardVariant` = `resolveCardVariant(serviceType, features)` (buang logika hardcode 4.61). |
| `apps/web/src/components/blocks/ServiceListingHeroImmersive.astro` | idem. |
| `apps/web/src/components/blocks/ServiceGridBlock.astro` | fetch `getSiteFeatures()` + `resolveCardVariant(block.serviceType, …)`. |
| `apps/cms/src/migrations/20260925_184020_phase_4_61_1_service_card_designs.ts` | **BARU** — ADD 9 kolom `modules_<key>_design` (default `compact`, ferry `ticket`). Additif murni. |
| `packages/shared/src/types/payload-types.ts` | Regenerated. |

### Impact
- **Database**: migration `20260925_184020_phase_4_61_1_service_card_designs` — additif, tanpa data loss.
- **CMS**: tab Modul Layanan kini per modul punya dropdown Card design (muncul saat aktif).
- **Frontend**: semua listing service membaca desain kartu dari global (single source). Field cardVariant per-block tidak lagi dipakai.
- **RBAC**: none (SiteFeatures tetap super-admin only).
- **Deploy needed**: cms + web.

### ⚠️ Perubahan perilaku
Karena global jadi authoritative, pilihan `cardVariant` per-block yang lama
**digantikan** oleh setting global. Default dibuat `compact` (service umum) &
`ticket` (ferry) agar dekat tampilan lama. Super-admin bisa ubah per service.

### Testing
- [x] Migration apply + `generate:types` sukses.
- [x] API `/api/globals/site-features` → field `*Design` muncul (ferry=ticket, lainnya=compact).
- [x] Frontend `/ferry-tickets` tetap render kartu Ticket full-width (grid 1 kolom) — kini via global.
- [ ] Manual (owner, butuh login admin): buka Settings → Pengaturan Fitur → Modul Layanan → tiap modul aktif tampil dropdown Card design; matikan modul → dropdown-nya hilang.

### Rollback
```
cd apps/cms && pnpm schema:down     # drop 9 kolom *_design
# revert: SiteFeatures.ts, blocks/index.ts, features.ts, serviceCards.ts, 3 block, payload-types.ts
```

### Dokumentasi
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/card-design/phase-4.61.1-service-card-designs.md` (file ini)
- [ ] `docs/PROGRESS.md`
- [ ] `docs/04-RBAC.md` (tidak berubah) / `docs/03-CONTENT-MODEL.md` (opsional catat single-source card design)

### Next Steps
Opsional: tambah tema/komponen kartu baru (menambah opsi di GENERIC_DESIGNS /
FERRY_DESIGNS) bila ingin variasi desain lebih banyak.
