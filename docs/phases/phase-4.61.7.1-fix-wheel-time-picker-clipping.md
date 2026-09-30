## Phase: 4.61.7.1 — Fix WheelTimePicker Popover Clipping (Departure/Arrival Time)
**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Popover wheel time picker pada field `departureTime` & `arrivalTime` di CMS
(`/admin/collections/ferry-tickets/[id]`, tab Overview) ter-clip oleh container
row / collapsible section yang punya `overflow` non-visible, sehingga frame
picker tidak terlihat penuh. Diperbaiki dengan me-render popover via React
portal ke `document.body` dan menggunakan `position: fixed` berbasis
`getBoundingClientRect()` dari tombol trigger, plus auto-flip ke atas kalau
tidak cukup ruang di bawah.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/admin/WheelTimePicker.tsx` | Popover dipindah ke `createPortal(document.body)` dengan `position: fixed`; koordinat dihitung dari button rect, di-update pada `scroll` (capture) dan `resize`; auto-flip di atas trigger bila ruang bawah viewport kurang; horizontal clamp 8px dari tepi viewport; z-index dinaikkan ke 9999; outside-click handler diperluas supaya juga cek `popRef` (portal keluar dari `wrapRef`). |

### Impact
- **Database**: none
- **CMS**: perilaku UI WheelTimePicker berubah (popover tak lagi clipped)
- **Frontend**: none
- **Routes**: none
- **RBAC**: none

### Testing
- [x] Buka `/admin/collections/ferry-tickets/1`, tab Overview → klik Departure Time — popover muncul penuh di atas layout tanpa terpotong row/collapsible.
- [x] Sama untuk Arrival Time.
- [x] Scroll halaman saat popover terbuka → popover mengikuti (atau tetap accurate) via listener capture-phase.
- [x] Klik di luar popover / Esc → menutup normal (regresi outside-click sudah dicek via `popRef`).
- [x] Field di dekat tepi bawah viewport → popover auto-flip ke atas trigger.

### Rollback
`git revert` commit ini, atau kembalikan blok `open && (...)` ke versi
`position: absolute` sebelum perubahan dan hapus state `popRect`,
`buttonRef`, `popRef`, serta effect `updatePopRect`.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.61.7.1-fix-wheel-time-picker-clipping.md` (file ini)

### Next Steps
Kalau nanti wheel picker dipakai di field lain (bukan hanya Ferry Tickets),
component ini sudah aman terhadap parent overflow — tidak perlu perubahan
tambahan.
