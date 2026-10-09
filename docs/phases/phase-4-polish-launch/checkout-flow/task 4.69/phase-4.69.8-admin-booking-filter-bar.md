## Phase: 4.69.8 — Admin Booking List Filter Bar

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Chip filter bar di atas list Bookings di CMS admin, dengan **live count
per status**. Admin bisa langsung lihat booking mana yang butuh action
dan filter 1-click.

Prioritaskan "needs action" (awaiting_review, payment_review) — ditandai
chip warna urgent (coral) supaya menonjol.

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/admin/BookingStatusFilterBar.tsx` | BARU | Client component dgn 9 chip + live count fetch + URL filter apply via `next/navigation`. |
| `apps/cms/src/collections/Bookings.ts` | Edit | Register `beforeListTable` → `/admin/BookingStatusFilterBar#default`. |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Regenerate | Daftar component path. |

### Chips

| Chip | Status filter | Tone | Priority |
|---|---|---|---|
| All | — (clear filter) | neutral | — |
| ⚠ Needs review | awaiting_review | urgent (coral) | **HIGH** |
| 💳 Payment review | payment_review | urgent (coral) | **HIGH** |
| ❌ Cancel request | cancel_request | warm (amber) | MID |
| 🔁 Reschedule | reschedule_request | warm (amber) | MID |
| 💰 Awaiting payment | awaiting_payment | cool (ocean) | low |
| ✅ Confirmed | confirmed | ok (leaf) | low |
| 🚫 Cancelled | cancelled | neutral | low |
| ⏳ Expired | expired | neutral | low |

### Teknis

**Count fetch**:
- `GET /api/bookings?limit=0&depth=0&where[status][equals]=<X>` per chip
- Response `{ totalDocs: N }` — Payload default behavior
- Parallel fetch on mount (Promise.all)
- Count tidak di-cache antar session — tiap buka list fetch ulang

**URL filter apply**:
- `useRouter().push("?where[status][equals]=X")` via `next/navigation`
- Clear semua `where[*][status][equals]` variants dulu supaya tidak bentrok
- Reset `page=1` tiap ganti filter
- All chip = delete semua status filter (keep sort + search)

**Active state detection**:
- Read `useSearchParams()` → cari key `where[status][equals]` atau variant
  nested (`where[and][0][status][equals]` dsb) via regex
- Match current chip → set `aria-pressed=true` + visual highlight

### Testing

#### Build check
```
pnpm payload generate:importmap → BookingStatusFilterBar registered ✓
pnpm tsc --noEmit → zero new errors (pre-existing defaultSort unrelated)
```

#### Manual (dev)
```
1. Login CMS admin → Bookings list.
2. Chip bar tampil di atas table dengan count per status.
3. Click "⚠ Needs review" → list filter ke awaiting_review, chip highlighted.
4. Click "All" → clear filter.
5. Combine dgn kolom sort (click header "Created At") → URL punya sort + where.
6. Count ter-refresh tiap kali component mount (reload / navigate kembali).
```

### Impact

- **Database**: zero schema change.
- **CMS**: 1 React component baru + 1 register entry di Bookings collection.
- **Frontend web**: tidak terdampak.
- **Env**: tidak ada perubahan.
- **Deploy needed**: **cms only**.

### Known Limitations

- **Count tidak real-time** — fetched sekali on-mount. Admin yang buka tab
  lain & kembali tidak lihat count baru sampai refresh. Trade-off vs
  polling cost. Future: tambah refresh button atau SSE/WebSocket.
- **Count query = 9 fetch parallel** per load — fine untuk < 10K booking,
  nanti bisa di-aggregate ke 1 custom endpoint `/api/bookings/status-counts`
  kalau performance jadi masalah.
- Chip bar tidak persist pilihan admin antar session — tiap buka list default = All.
  Future bisa pakai localStorage.
- Mobile/narrow viewport: chip wrap ke multi-line (flex-wrap). Sudah di-test
  dgn CSS `flex-wrap: wrap`.

### Dokumentasi yang Diupdate

- [x] File phase ini

### Next Steps

**Phase 4.69.9 — Reschedule / Cancel Request Flows**:
1. Form di confirmation page untuk customer request reschedule/cancel
2. Endpoint di web `/api/bookings/request-reschedule` + `/api/bookings/request-cancel`
3. Status transition ke `reschedule_request` / `cancel_request`
4. Admin lihat di chip bar (sudah ada) + kirim respond via tombol handoff lain
   (reuse template `reschedule*` / `cancel*` di global booking-templates)
