## Phase: 4.67.1 — Checkout Session Timer (Passenger Info Overdue Guard)
**Tanggal**: 2026-10-06
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan
Menambahkan **client-side countdown timer 15 menit** di halaman passenger info checkout ferry-tickets. Saat waktu habis, muncul modal "Session Expired" dengan tombol OK yang mengembalikan visitor ke halaman detail ferry — form di-disable supaya POST ke `/api/bookings/create` tidak pernah dieksekusi, sehingga tidak ada entry gagal yang mengotori booking store/database.

Server-side guard untuk hal yang sama (`formStamp` TTL 30 menit, verify sebelum `store.create`) sudah ada sejak Phase 4.62 — perubahan ini murni **UX layer** dengan margin aman 15 menit (client) < 30 menit (server) terhadap drift jam / latency submit.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/checkout/ferry-tickets/[slug].astro` | Tambah: (a) timer strip di sidebar Booking Summary, (b) markup modal "Session Expired" (fixed overlay, role=dialog), (c) `<script>` countdown — tick setiap detik, warning state saat ≤ 2 menit, modal + form disable saat 0, tombol OK → `window.location.href = detailUrl` |

### Impact
- **Database**: none (guard sepenuhnya di client; server-side guard sudah existing)
- **CMS**: none
- **Frontend**: Visitor sekarang melihat countdown real-time di sidebar + blocking modal saat timeout
- **Routes**: none
- **RBAC**: none

### Testing
- [x] Timer tampil `14:59` saat load, tick turun tiap detik
- [x] Warna timer berubah coral + pulse saat ≤ 2:00
- [x] Submit button auto-disable saat timer habis
- [x] Modal muncul saat 0:00, klik OK → redirect ke `/ferry-tickets/[slug]?...`
- [x] Reload halaman → timer reset ke 15:00 (karena formStamp baru di-issue)

### Rollback
Revert single commit — semua perubahan terisolasi di 1 file (`[slug].astro`).

### Dokumentasi yang Diupdate
- [x] `docs/PROGRESS.md` — tambah 1 baris Phase 4.67.1
- [ ] `docs/02-DATABASE-SCHEMA.md` — tidak perlu (no DB change)
- [ ] `docs/04-RBAC.md` — tidak perlu
- [ ] `docs/08-SECURITY-PATCH.md` — tidak perlu (bukan security hardening; server-side guard sudah ada)

### Next Steps
- Jika telemetry nanti menunjukkan banyak user kehabisan waktu, bisa ditambah: (a) "extend session" button yang re-issue `formStamp` via AJAX, (b) warning toast di 5:00 selain pulse di 2:00.
- Konsistensi: terapkan pola yang sama ke modul lain yang pakai `formStamp` (saat ini hanya ferry-tickets).
