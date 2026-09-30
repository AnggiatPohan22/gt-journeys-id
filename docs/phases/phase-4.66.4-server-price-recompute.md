## Phase: 4.66.4 — Server-side ferry verification + price recompute

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Findings**: S-03 (High), S-06 (Medium), sebagian S-05 snapshot integrity di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
`/api/bookings/create` sekarang mengabaikan hidden input `unitPrice`, `currency`, `ferryClassName`, `originLocation`, `destinationLocation`, `scheduleTimeLabel` dari client. Endpoint fetch ferry ticket dari CMS by numeric id (via API key), verifikasi status published + slug match, cari class yang cocok dengan `ferryClassType`, lalu recompute pricing dari record CMS. Attacker yang kirim `unitPrice=1` tidak lagi berhasil.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/web/src/lib/checkout/store.ts](apps/web/src/lib/checkout/store.ts) | Tambah `getFerryForCheckout(id: number)` — server-side GET `/api/ferry-tickets/{id}?depth=2` dengan API key. Import type `FerryTicket`. |
| [apps/web/src/pages/api/bookings/create.ts](apps/web/src/pages/api/bookings/create.ts) | Rewire pricing block: verifikasi id valid → fetch CMS → guard slug mismatch → pilih class → recompute unit/child/currency + snapshot origin/destination/scheduleTimeLabel/className. Import `resolveLocation` untuk resolve nama lokasi dari relationship. Tambah error codes `invalid_ferry`, `ferry_not_found`, `ferry_slug_mismatch`, `ferry_no_class`, `ferry_no_price`. |
| [apps/web/src/pages/checkout/ferry-tickets/[slug].astro](apps/web/src/pages/checkout/ferry-tickets/%5Bslug%5D.astro) | Tambah copy 5 error message baru di `errorMessages` map. |

### Impact
- **Database**: none (skema Bookings tidak berubah — field `unitPrice`, `currency`, dll sudah ada, hanya sumber datanya berubah).
- **CMS**: none.
- **Frontend**: user experience tidak berubah kalau input valid. Kalau attacker tampering, mereka lihat error message user-friendly dan booking gagal.
- **Routes**: none baru.
- **RBAC**: none.

### Perubahan wire (before → after)

Sebelum:
```
client hidden input:  unitPrice=350000 currency=IDR ferryClassName=Emerald
                       originLocation=Batam destinationLocation=Bali
server:               ambil apa adanya → simpan ke DB
```

Sesudah:
```
client hidden input:  ferryTicketId=42 ferryClassType=emerald (hint only)
server:
  1. ferryTicketId valid?               → error invalid_ferry
  2. fetch /api/ferry-tickets/42        → error ferry_not_found kalau 404
  3. published?                         → error ferry_not_found kalau tidak
  4. ferry.slug === form.slug?          → error ferry_slug_mismatch
  5. cari class where classType===hint  → fallback ke class termurah
  6. unitPrice = cls.adultPrice         (from CMS)
     childUnit = cls.childPrice ?? unitPrice/2
     currency  = cls.currency ?? 'IDR'
     originLocation, destinationLocation = dari relationship location.name
     scheduleTimeLabel, ferryClassName = dari CMS
  7. totalEstimate = adults*unitPrice + children*childUnit
```

### Testing
- [ ] **Happy path** — pilih Ferry di detail page → checkout → submit form valid → booking record punya `unitPrice` sama dengan `ferry.ferryClasses[?].adultPrice` dari CMS.
- [ ] **Tampered price** — buka checkout, edit hidden `<input name="unitPrice" value="1">` via DevTools, submit → booking tetap punya `unitPrice` dari CMS (bukan 1).
- [ ] **Wrong ferryTicketId** — kirim id yang tidak eksis → redirect `?err=ferry_not_found`.
- [ ] **Slug swap** — checkout URL `/checkout/ferry-tickets/slug-A` tapi hidden `ferryTicketId` milik ferry B → redirect `?err=ferry_slug_mismatch`.
- [ ] **Unknown classType** — hidden `ferryClassType=platinum` (bukan ekonomi/emerald) → endpoint pilih class termurah, booking tetap create dengan `ferryClassType` valid.
- [ ] **Missing ferryTicketId** → redirect `?err=invalid_ferry`.

### Rollback
```bash
git revert <commit-hash-of-4.66.4>
```

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66.4-server-price-recompute.md`

### Next Steps
Phase 4.66.5 — S-02: booking access token (schema change, migration).
