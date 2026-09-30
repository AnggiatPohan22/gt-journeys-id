## Phase: 4.66.10 — Trim Manual WhatsApp message

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Finding**: S-13 (Low) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
`wa.me/?text=…` URL disimpan browser history + kemungkinan referrer ke wa.me. Sebelumnya message body membawa email, negara, notes, dan tiap passenger (nama/DOB/nationality/masked passport). Sekarang minimal: ref + ferry + rute + tanggal + jumlah pax + nama + WA. Detail lain tetap ada di halaman confirmation (protected by access token dari Phase 4.66.5) dan di CMS admin.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/web/src/lib/checkout/channels/manualWhatsApp.ts](apps/web/src/lib/checkout/channels/manualWhatsApp.ts) | Rewrite `buildMessage()`. Hapus loop passenger detail, hapus email/country/notes/price dari body. Import `maskPassport` dan `formatPrice` di-drop (tidak dipakai lagi). |

### Impact
- **Database**: none
- **CMS**: none
- **Frontend**: WA link dari halaman confirmation sekarang membawa message yang lebih pendek. Admin tetap punya semua detail:
  1. Buka Booking di CMS via ref.
  2. Kalau customer share URL confirmation → sudah include token → bisa dibuka langsung.
- **Routes**: none.
- **RBAC**: none.

### Diff message body

Before (excerpt):
```
🔖 Ref: FT-…
⛴️ Ferry: …
📍 Rute: …
🕒 Jadwal: …
📅 Tanggal: …
👥 Jumlah: 2 dewasa + 1 anak
🎫 Kelas: Emerald
💰 Harga: Rp 350.000 / dewasa (est. total Rp 875.000)

Nama pemesan: ...
WhatsApp: ...
Email: ...
Negara: ...
Catatan: ...

Data Penumpang:
1. [Adult] Mr. John Doe · Indonesia · DOB 1990-… · Passport ••••1234
2. [Adult] Mrs. Jane Doe · Indonesia · DOB 1992-… · Passport ••••5678
3. [Child] Kid Doe · Indonesia · DOB 2018-…
```

After:
```
🔖 Ref: FT-…
⛴️ Ferry: …
📍 Rute: …
📅 Tanggal: …
👥 Jumlah: 2 dewasa + 1 anak
🎫 Kelas: Emerald

Nama: ...
WhatsApp: ...
```

### Testing
- [ ] Submit booking → di halaman confirmation → klik tombol WhatsApp → URL wa.me hanya membawa 8–10 baris (bukan 25+).
- [ ] Admin buka Booking di CMS → semua detail original tetap tersedia.
- [ ] Admin dapat re-share URL confirmation ke customer (dengan token) untuk lihat detail lengkap.

### Rollback
```bash
git revert <commit-hash-of-4.66.10>
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.10-wa-message-trim.md`

### Next Steps
Phase 4.66.11 — F6: `pnpm audit --audit-level=high` di web + cms, report saja (no auto-fix).
