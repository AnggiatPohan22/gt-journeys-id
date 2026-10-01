## Phase: 4.61.2 — Service Modules UI (kartu per service) + 3 opsi desain
**Tanggal**: 2026-09-26
**Status**: Selesai (verifikasi UI admin oleh owner — butuh login)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Tab Modul Layanan (SiteFeatures) dirombak jadi **grid kartu per service** (custom
admin component) — tiap service = box berisi ikon + nama, toggle aktif, dan pemilih
desain kartu visual. Ke-3 jenis desain (**Compact / Detailed / Ticket**) kini
tampil untuk **semua** service (termasuk service baru), menjawab kebutuhan owner.

### Keputusan owner
- Tampilan: **custom component** (kartu per service) — bukan sekadar CSS box.
- Opsi desain: **tampilkan 3 (compact/detailed/ticket) untuk semua service**.

### Jawaban pertanyaan owner
Sebelumnya service umum hanya 2 opsi (compact/detailed) dan ferry 2 (ticket/detailed,
tanpa compact) karena **Ticket = kartu rute** yang baru diimplementasikan untuk ferry.
Sekarang ke-3 opsi tampil untuk semua service. Catatan: memilih **Ticket** di service
non-rute (mis. Spa) tetap **fallback ke Compact** sampai service itu punya data rute +
dukungan kartu ticket (mis. modul transport baru → `TicketRouteCard` sudah reusable).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/config/serviceModules.ts` | **BARU** — registry single-source (name, label, icon emoji, defaultDesign) + `CARD_DESIGN_OPTIONS` (3 desain). Dipakai server config + komponen client. |
| `apps/cms/src/admin/ServiceModulesManager.tsx` | **BARU** — custom Field (`ui`): grid kartu per service, toggle aktif + pemilih 3 desain (mini-skema visual), catatan Ticket. Baca/tulis via `useField('modules.<key>' / '<key>Design')`. |
| `apps/cms/src/globals/SiteFeatures.ts` | Import registry dari config; field `modules.<key>` (checkbox) & `<key>Design` (select) jadi `admin.hidden` (data tetap); tambah `ui` field `serviceModulesUI` → ServiceModulesManager. Opsi select kini 3 untuk semua service. |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Regenerated — daftarkan ServiceModulesManager. |
| `packages/shared/src/types/payload-types.ts` | Regenerated (union select `*Design` kini compact/detailed/ticket untuk semua). |

### Impact
- **Database**: none (kolom `modules_*_design` sudah ada dari 4.61.1; opsi select = app-layer, **tanpa migration**).
- **CMS**: tab Modul Layanan = grid kartu custom; 3 opsi desain untuk semua service.
- **Frontend**: none (tetap baca `modules.<key>Design`; ticket non-rute fallback compact di kartu).
- **Deploy needed**: cms (frontend tidak berubah).

### Testing
- [x] `generate:importmap` → ServiceModulesManager terdaftar (importMap.js).
- [x] `generate:types` sukses.
- [x] API `/api/globals/site-features` → field utuh (tours/toursDesign, ferry/ferryTicketsDesign).
- [x] `/admin/globals/site-features` → HTTP 200 (compile tanpa error server).
- [ ] Manual (owner, butuh login): buka tab Modul Layanan → grid kartu tampil; toggle aktif/nonaktif; ganti desain (3 opsi) tersimpan; ubah desain → cek listing frontend berubah.

### Rollback
```
# revert: config/serviceModules.ts, admin/ServiceModulesManager.tsx, globals/SiteFeatures.ts,
#         importMap.js (regenerate), payload-types.ts
# Tidak ada migration untuk di-down (schema tidak berubah).
```

### Catatan
- Field data di-`admin.hidden` (bukan `hidden` top-level) → tetap tersimpan & dibaca `useField`.
- Registry pindah ke `config/serviceModules.ts`: tambah modul baru = 1 entry di sana (muncul otomatis di grid + field).

### Next Steps
- (Opsional) Implementasikan varian kartu tambahan atau dukungan ticket untuk service transport baru.
- Restart `pnpm dev` CMS bila grid belum muncul (Next.js perlu re-compile config + importMap).
