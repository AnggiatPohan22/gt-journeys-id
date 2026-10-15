## Phase: 4.61.10 — Ticket Search CMS Fields (Eyebrow + Value Badges)
**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menaikkan 2 elemen konten di layout `ticket-search` dari hardcoded ke CMS
sehingga superadmin bisa mengeditnya tanpa deploy code:
1. Eyebrow "Instant Confirmation · Multi-Route Coverage" di header row
   kartu filter.
2. 3 trust badges di bawah kartu filter (Instant Confirmation / Flexible
   Rescheduling / Secure Online Payment) — masing-masing label + warna dot.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/blocks/index.ts` | Tambah 2 field di block `service-listing` (dalam collapsible "Ticket Search — Template 2 Config"): `ticketStatusIndicator` (text, default eyebrow lama), `ticketBadges` (array 0–3 rows dgn label+color). Color options: leaf/ocean/coral/amber. Rename dari draft `ticketValueBadges` → `ticketBadges` untuk mencegah enum overflow 63-char (kombinasi prefix `restaurants_blocks_service_listing_...` + suffix `_color`). |
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | Baca `b.ticketStatusIndicator` (fallback default) + normalize `b.ticketBadges` → `valueBadges[]`. Markup: eyebrow section wrap `{statusIndicator ? ... : <span></span>}`, value badges section wrap `{valueBadges.length > 0 && ...}` + map render dgn `badgeDotClass` lookup. Semua fallback dipertahankan supaya block existing yang belum diisi tetap render seperti sebelum 4.61.10. |
| `apps/cms/src/migrations/20260930_044533_phase_4_61_10_ticket_cms_fields.{ts,json}` | **BARU** — 8 tabel array `<coll>_blocks_service_listing_ticket_badges` (1 per collection yang memakai serviceListing block) + kolom `ticket_status_indicator` di 8 tabel `<coll>_blocks_service_listing`. Non-destructive (semua ADD, tidak ada drop/rename). |
| `apps/cms/src/migrations/index.ts` | Register migration baru. |
| `packages/shared/src/types/payload-types.ts` | Regenerated (32 occurrence baru `ticketBadges`/`ticketStatusIndicator`). |

### Impact
- **Database**: Migration `20260930_044533_phase_4_61_10_ticket_cms_fields`
  applied ke local SQLite. Reversible via `down()` (drop tables + drop columns).
- **CMS**: 2 field baru muncul di Content Editor block Service Listing bila
  layout = `ticket-search`. Default value diisi otomatis supaya block existing
  langsung punya value yang identik dgn hardcoded 4.61.9.
- **Frontend**: Rendering identik dgn 4.61.9 saat field belum diubah. Kalau
  user mengosongkan `ticketStatusIndicator` → eyebrow hilang. Kalau semua row
  `ticketBadges` dihapus → seksi 3 badges di bawah kartu ikut hilang.
- **Routes**: none.
- **RBAC**: none (mengikuti access control block-level yang ada).

### Testing
- [x] `pnpm schema:migrate` sukses tanpa error (1 migration applied, 281ms).
- [x] `pnpm generate:types` sukses; types regenerated (`ticketBadges` di 8
      collection blocks, `ticketStatusIndicator` sama).
- [x] Enum length aman (65 → 59 char setelah rename ke `ticketBadges`).
- [ ] Manual: buka admin → Page block Service Listing (ticket-search) → ubah
      eyebrow & badges → publish → verifikasi frontend render.

### Rollback
1. **Data-level (paling cepat)**: kosongkan `ticketStatusIndicator` dan semua
   row `ticketBadges` di CMS → frontend jatuh ke seksi tersembunyi (bukan ke
   hardcoded lama). Untuk kembali ke tampilan default: isi ulang dgn nilai
   default yang tertera di block config.
2. **UI-level**: `TICKET_SEARCH_V2=1` di `apps/web/.env` → render snapshot
   pre-4.61.9 (`ServiceListingTicketSearchV2.astro`) yang tidak membaca field
   baru — konten kembali ke hardcoded.
3. **Schema-level (terakhir)**: `git revert <commit>` lalu regenerate types.
   Migration down() tersedia untuk drop tabel + kolom, tapi jalankan hanya di
   env non-produksi (data yang sudah diisi user akan hilang).

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/search-template/phase-4.61.10-ticket-search-cms-fields.md` (file ini)
- [x] `docs/PROGRESS.md` — dashboard "Last updated" pointer

### Next Steps
- Optional: expose `statusIndicator` dot color juga ke CMS (saat ini
  tetap `bg-leaf` + pulse). Kecil, bisa gabung ke fase 4.61.11 kalau
  request.
- Phase 4.65 (Round Trip booking flow) masih pending — belum sentuh
  UI selain "Coming soon" pill.
