## Phase: 4.67.2g — WhatsApp Message 2-Leg

**Tanggal**: 2026-10-08
**Status**: Selesai (one-way regression + round-trip rendering verified via smoke test)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Final sub-phase 4.67.2 series. WhatsApp message template di
`apps/web/src/lib/checkout/channels/manualWhatsApp.ts` sekarang
mendukung **2-leg round-trip**: jika `booking.tripType === 'round-trip'`,
render 2 block (🛫 OUTBOUND + 🔄 RETURN) di body message supaya admin
langsung paham ada 2 leg untuk diverifikasi ketersediaan + harga.

One-way mode: layout message lama **ZERO perubahan**.

Rule S-13 (Phase 4.66.10 — WA message dirampingkan untuk PII hygiene)
tetap dihormati: tidak ada harga, email, notes, atau per-passenger data
di body. Hanya ref + trip essentials (ferry/route/date/class per leg) +
jumlah pax + nama & WhatsApp pemesan.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/web/src/lib/checkout/channels/manualWhatsApp.ts` | Refactor `buildMessage()` jadi 2-mode. One-way branch unchanged. Round-trip branch tambah header "Round Trip" + 2 block emoji (🛫 OUTBOUND, 🔄 RETURN) berisi ferry title, route, tanggal, kelas per leg. Helper `ferryTitleOf(rel)` di-extract untuk DRY (dipakai outbound + return). Copy penutup diubah ke "ketersediaan kedua leg" untuk round-trip. |
| `docs/PROGRESS.md` | Entry baru. |
| `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2g-whatsapp-2leg-message.md` | File ini. |

### Contoh Output Message

**One-way (unchanged):**
```
Halo GtJourneysID! 👋

Saya ingin konfirmasi booking Ferry Ticket:
🔖 *Ref:* FT-123
⛴️ *Ferry:* Batam Fast
📍 *Rute:* Batam → Singapore
📅 *Tanggal:* 2026-10-10
👥 *Jumlah:* 2 dewasa
🎫 *Kelas:* Emerald

*Nama:* Anggi Pohan
*WhatsApp:* +62821-xxxx-xxxx

Mohon konfirmasi ketersediaan & langkah berikutnya. Terima kasih!
```

**Round-trip (baru):**
```
Halo GtJourneysID! 👋

Saya ingin konfirmasi booking *Round Trip* Ferry Ticket:
🔖 *Ref:* FT-123
👥 *Jumlah:* 2 dewasa + 1 anak

🛫 *OUTBOUND*
⛴️ Ferry: Batam Fast
📍 Rute: Batam → Singapore
📅 Tanggal: 2026-10-10
🎫 Kelas: Emerald

🔄 *RETURN*
⛴️ Ferry: Batam Fast SG→BTM
📍 Rute: Singapore → Batam
📅 Tanggal: 2026-10-13
🎫 Kelas: Emerald

*Nama:* Anggi Pohan
*WhatsApp:* +62821-xxxx-xxxx

Mohon konfirmasi ketersediaan kedua leg & langkah berikutnya. Terima kasih!
```

### Impact
- **Database**: none.
- **CMS**: none.
- **Frontend**: none (channel lib hanya dipakai oleh confirmation page + manual-WA
  fallback button, markup page tidak berubah).
- **Routes**: none.
- **RBAC**: none.
- **URL/privacy**: tetap sesuai S-13 — tidak nambah PII baru ke query
  `wa.me/?text=...`. Hanya field yang sudah ada di one-way message (ferry
  title, rute, tanggal, kelas) di-ulang untuk return leg.

### Design Decisions

**Branch per tripType, bukan merge via template string**
Alternatif: 1 template dengan `{{outbound_block}}{{return_block}}` yang
conditional `{{#if roundTrip}}`. Dipilih: 2 explicit branch (early return
untuk one-way). Alasan: template string lebih sulit dibaca saat ada
nested conditionals, dan one-way adalah path yang sudah stabil sejak
Phase 4.62 — biarkan utuh supaya regression risk nol. Round-trip branch
sepenuhnya baru, mudah di-rollback kalau perlu.

**Header "Round Trip" di baris intro**
Mirror pattern confirmation page (Phase 4.67.2f) yang pakai badge
"Round Trip" di hero. Admin yang terima WA bisa langsung tahu ini bukan
booking one-way biasa (perlu check 2 leg).

**Emoji block header: 🛫 OUTBOUND / 🔄 RETURN**
Konsisten dengan icon di UI (checkout page `flight_takeoff` + confirmation
`event_repeat`). Emoji dipilih yang jelas di WhatsApp (universal unicode,
tidak butuh font khusus). Alternatif ✈️ untuk outbound dirasa confusing
(ferry, bukan flight) — 🛫 lebih netral "berangkat".

**Copy penutup berbeda per mode**
One-way: "ketersediaan & langkah berikutnya" (unchanged).
Round-trip: "ketersediaan **kedua leg** & langkah berikutnya" — reminder
eksplisit ke admin bahwa harus verifikasi 2 leg.

**Tidak sertakan grand total di WA**
Konsisten dengan rule S-13 (harga tidak di URL message). Admin akan
lihat harga + breakdown di CMS admin panel atau halaman confirmation
(via access token URL).

### Testing

**Smoke test (programmatic, 2026-10-08):**
Script Node mock Booking object untuk kedua mode → render message →
cocokkan dengan expected output di atas. Both passed:
- One-way: 15 baris, no `*Round Trip*`, no OUTBOUND/RETURN blocks.
- Round-trip: 22 baris, header "Round Trip" + 2 block + penutup "kedua leg".

**Manual verify (pending user):**
- [ ] Submit booking round-trip baru end-to-end (Phase 4.67.2e persist +
      4.67.2f confirmation render).
- [ ] Di halaman confirmation, klik tombol "Kirim ke WhatsApp" / "Confirm
      via WhatsApp".
- [ ] WhatsApp opens dengan pre-filled message matching format round-trip
      di atas.
- [ ] Admin terima pesan: terbaca jelas 2 leg + semua field benar.

**One-way regression:**
- [ ] Submit booking one-way baru → tombol WA → message format lama
      (header "booking Ferry Ticket", no "Round Trip", no OUTBOUND/RETURN
      blocks, penutup lama).

### Rollback
`git revert <commit-4.67.2g>` → `buildMessage()` kembali ke pre-4.67.2g:
- Hanya 1 branch (one-way-style).
- Booking round-trip dapat message yang MISLEADING (hanya tampilkan
  outbound leg, admin tidak tahu ada return — risiko admin lupa book
  return leg). Mitigasi sementara: admin check CMS admin panel field
  `tripType` + `returnXxx` fields.

Zero schema change, zero data loss.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4-polish-launch/ferry-tickets/round-trip-filter/phase-4.67.2g-whatsapp-2leg-message.md` (file ini)
- [x] `docs/PROGRESS.md` — entry baru

### Status Phase 4.67.2 Series
**COMPLETE.** All 7 sub-phase 4.67.2a–g selesai:
- ✅ 4.67.2a — Bookings schema (10 return fields).
- ✅ 4.67.2b — Detail page round-trip CTA.
- ✅ 4.67.2c — Listing return-pick mode.
- ✅ 4.67.2d — Checkout 2-leg render.
- ✅ 4.67.2e — API 2-leg persist.
- ✅ 4.67.2f — Confirmation 2-leg render.
- ✅ 4.67.2g — WhatsApp message 2-leg (sub-phase ini).

Round-trip booking flow sekarang end-to-end: widget filter → listing
Step 1 outbound pick → listing Step 2 return pick → checkout 2-leg
form → API persist 2-leg → confirmation 2-leg render → WhatsApp handoff
2-leg.
