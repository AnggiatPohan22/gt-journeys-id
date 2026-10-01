## Phase: 4.61.11 — Sort By CMS-controlled + No-reload Themed Dropdown
Tanggal: 2026-09-30
Status: Selesai (menunggu apply migration di local karena Payload dev-push warning)
Dikerjakan oleh: Claude Code

### Ringkasan
Sort By di halaman Ticket Search (Available Trips) sekarang bisa dikonfigurasi
super-admin dari CMS (pilih opsi mana yang tampil), dan di frontend berubah
dari native select (yang refresh halaman) menjadi custom Alpine dropdown
themed (icon-circle + labeled cell, mirror gaya kartu Find Ticket's).
Perubahan urutan kartu terjadi tanpa reload: diurut ulang via CSS order
dengan animasi fade-up singkat pada grid.

### File yang Berubah
- apps/cms/src/blocks/index.ts: tambah field ticketSortOptions (select hasMany) di Filter & Search - Ticket Search collapsible. Tweak deskripsi ticketDefaultSort.
- apps/cms/src/migrations/20260930_070209_phase_4_61_11_ticket_sort_options.ts + .json: migration auto-generated. Bikin table blocks_service_listing_ticket_sort_options per parent (pages/posts/tours/yachts/restaurants/venues/rentals/accommodations/waterActivities/spa/ferryTickets).
- apps/cms/src/migrations/index.ts: register migration baru.
- packages/shared/src/types/payload-types.ts: regenerated. ticketSortOptions per parent block.
- packages/shared/src/icon-map.ts: tambah alias swap_vert, check, bolt, nightlight (dipakai sort dropdown).
- apps/web/src/components/blocks/ServiceListingTicketSearch.astro: baca ticketSortOptions dari block dan filter opsi yg tampil; SSR pakai initialSort (fallback aman kalau URL sort di-disable admin); enrich allItems dengan dep/price/dur/id untuk sort client-side; Alpine state sortKey/sortOpen/sortRefreshing + methods rankOf/sortLabel/sortIcon/pickSort; ganti native select ke themed dropdown (icon-circle coral, listbox pill dengan ikon per opsi dan check indicator); grid flex-col supaya CSS order deterministik + fade-up saat sortRefreshing; hidden name=sort di form utama sekarang x-bind:value=sortKey supaya Find Tickets carry pilihan visitor.

### Impact
- Database: migration 20260930_070209_phase_4_61_11_ticket_sort_options ditambah. Belum di-apply ke local DB karena Payload minta konfirmasi (habis dev-push). Apply manual: cd apps/cms lalu pnpm schema:migrate (jawab y).
- CMS: field baru Ticket Sort Options (multi-select 4 opsi). Kosong = tampilkan semua 4 (behavior lama).
- Frontend: sort tanpa reload; grid diurut via CSS order, URL diupdate via history.replaceState, animasi fade-up 380ms.
- Routes/RBAC: none.

### Testing
- OK: type check via pnpm generate:types.
- Belum: manual di admin (butuh migration applied + CMS dev server) untuk verifikasi field baru dan behaviour uncheck.
- Belum: visitor flow di /ferry-tickets untuk verifikasi no-reload sort + fade animation.
- Belum: mobile responsive (dropdown w-64 right-anchored).
- Belum: carry sort dari dropdown ke Find Tickets submit.

### Rollback
1. Revert file-file di atas.
2. cd apps/cms lalu pnpm schema:down (drops table blocks_service_listing_ticket_sort_options).
3. Regenerate types.
4. Frontend akan pakai default (semua 4 opsi) karena field absent.

Alternatif rollback UI ringan: set env TICKET_SEARCH_V2=1 di apps/web/.env; render V2.astro yang masih pakai select native (pre-4.61.11).

### Dokumentasi yang Diupdate
- OK: docs/phases/phase-4-polish-launch/ferry-tickets/search-template/phase-4.61.11-sort-by-cms-and-no-reload.md
- Rekomendasi manual: docs/PROGRESS.md tambah entry Phase 4.61.11.

### Next Steps
- Apply migration di local dan smoke test end-to-end di browser.
- Apply pattern yang sama (themed Alpine dropdown, no-reload sort) ke ServiceListingEditorialFeatured dan HeroImmersive kalau mereka masih pakai select refresh.
