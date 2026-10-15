## Phase: 4.61.9 — Ticket Search UI Refresh + UX Batch
**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Redesign visual Filter & Search di Template 2 (`ServiceListingTicketSearch.astro`)
mengikuti referensi `ai/reference/ticket_booking_filter`, ditambah beberapa
penyempurnaan UX: mutual exclusion Origin↔Destination, 5 quick date chips
(Today, Tomorrow, H+2, H+3, H+4 dengan label tanggal auto), tanggal terpilih
ditampilkan di listing card, submit form tanpa reload halaman + smooth-scroll
ke listing, dan Hero tab CMS dibuka untuk layout `ticket-search`.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/components/blocks/ServiceListingTicketSearch.astro` | Rewrite markup mobile + desktop/tablet (labeled cells 12-col grid, swap overlay, value badges, breakdown pills). Alpine methods baru: `matchesFilter`, `visibleCount`, `cardDate`, `applyFilter`, `smoothScrollTo`. Server-side qFrom/qTo filter dihapus — Alpine yang show/hide. Form pakai `@submit.prevent="applyFilter()"`. Quick chips 5 offset (Today/Tomorrow + toLocaleDateString untuk H+2..4). `filtered(qs, ex)` menerima slug exclude untuk mutual exclusion. |
| `apps/web/src/components/blocks/ServiceListingBlock.astro` | Tambah dispatch env `TICKET_SEARCH_V2` untuk rollback ke UI pre-4.61.9. |
| `apps/web/src/components/blocks/ServiceListingTicketSearchV2.astro` | **BARU** — snapshot identik dengan versi pre-4.61.9, dipakai bila `TICKET_SEARCH_V2=1`. |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Prop baru `selectedDate` diteruskan ke `TicketRouteCard` sebagai `from.date` / `to.date`. Default = hari ini bila tidak dipass. |
| `apps/cms/src/blocks/index.ts` | Hero tab condition diperluas: `layout === 'hero-immersive' \|\| layout === 'ticket-search'` sehingga superadmin bisa ubah gambar hero untuk ticket-search. Tidak ada schema change (fields sudah ada). |

### Impact
- **Database**: none (Hero tab reuse existing fields).
- **CMS**: Hero tab sekarang muncul juga di block Service Listing bila `layout === 'ticket-search'`.
- **Frontend**: Layout ticket-search diperbarui total (desktop/tablet/mobile). Submit no-reload dengan smooth scroll (custom rAF-based easing 600ms cubic ease-out, offset 96px desktop / 80px mobile). Filter Origin↔Destination mutual exclusion. Card menampilkan tanggal terpilih di bawah waktu keberangkatan.
- **Routes**: none.
- **RBAC**: none.

### Testing (browser preview verified)
- [x] Desktop 1440px — 4-col grid, swap overlay, value badges, quick chips 5-item ✓
- [x] Tablet 900px — 4-col grid muat rapi ✓
- [x] Mobile 375px — stacked cards, floating swap, breakdown pills ✓
- [x] Mutual exclusion — lokasi yang dipilih di Starting Point tidak muncul di dropdown Destination ✓
- [x] Card date — "Tue, Sep 29" tampil di bawah 08:20 SGT ✓
- [x] Quick chips — H+2/3/4 auto-format ke weekday+date ✓
- [x] Form submit no-reload — `window.__pageMark` persisted, URL updated via `history.replaceState` ✓
- [x] Client-side filter — visibleCount=0 saat no-match, cards x-show hide/show benar ✓
- [x] Smooth scroll — logic verified (rAF throttling di preview pane menghalangi visual test, tapi kode benar dengan fallback `prefers-reduced-motion`)

### Rollback
1. **Cepat (tanpa git)**: set `TICKET_SEARCH_V2=1` di `apps/web/.env`, restart dev server → render `ServiceListingTicketSearchV2.astro` (identik dengan versi pre-4.61.9). Rekomendasi utama.
2. **Cepat 2**: set `TICKET_SEARCH_LEGACY=1` → render `ServiceListingTicketSearchLegacy.astro` (design 5-col horizontal, lebih lama lagi).
3. **Total**: `git revert <commit>` — kembalikan semua file ke state sebelum 4.61.9.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/search-template/phase-4.61.9-ticket-search-ui-refresh.md` (file ini)
- [x] `docs/PROGRESS.md` — dashboard "Last updated" pointer

### Next Steps
**Phase 4.61.10** (belum dikerjakan — butuh migration):
- Field baru `ticketStatusIndicator` (text) untuk eyebrow "Instant Confirmation · Multi-Route Coverage" di header row Ticket Search.
- Field baru `ticketValueBadges` (array of `{label, color}`) untuk 3 bullet trust di bawah kartu (Instant Confirmation / Flexible Rescheduling / Secure Online Payment).
- Akan butuh `pnpm schema:new` + `pnpm schema:migrate` + regenerate types.
