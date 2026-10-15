## Phase: 4.69.5 — Bookings Status Enum Expansion + Audit Fields

**Tanggal**: 2026-10-09
**Branch**: `feat/checkout-verification-phase-4.69`
**Status**: Selesai
**Dikerjakan oleh**: Claude Code (Opus 4.7)

### Ringkasan

Fondasi schema untuk admin-handoff flow (Phase 4.69.7). Tambah:
- **4 status enum baru** di `Bookings.status`: `awaiting_review`,
  `payment_review`, `reschedule_request`, `cancel_request`
- **6 audit field** di `bookings` table: 2 timestamp verification
  (`emailVerifiedAt`, `whatsappVerifiedAt`), 4 field "sent by/at"
  (`sentPaymentAt`, `sentPaymentBy`, `sentTicketAt`, `sentTicketBy`)
- **3 index** baru untuk dashboard filter performance

**Default booking baru** sekarang `awaiting_review` (ganti dari `pending`).
Nilai legacy `pending` + `awaiting_payment` tetap valid untuk booking
existing — tidak ada backfill otomatis (admin review manual).

### Keputusan Owner (approved sebelumnya)

- **D5** YES — 4 status enum baru
- **D3** KEEP — `channel=manual_wa` tetap nama legacy; flow baru
  dibedakan via `status` saja, bukan rename channel

### File yang Berubah

| File | Aksi | Perubahan |
|------|------|-----------|
| `apps/cms/src/collections/Bookings.ts` | Edit | (a) `status` enum: tambah 4 opsi + ganti default ke `awaiting_review` + simpan `pending` sebagai legacy. (b) Collapsible section baru "Admin Handoff Audit" di akhir — 6 field read-only (2 verifiedAt, 2 sent*At, 2 sent*By relationship ke users) |
| `apps/cms/src/migrations/20261009_115958_phase_4_69_5_bookings_admin_handoff.ts` | BARU | 6 `ALTER TABLE ADD COLUMN` + 3 CREATE INDEX (status+createdAt composite untuk dashboard filter, 2 FK index) |
| `apps/cms/src/migrations/index.ts` | Edit | Register migration |
| `packages/shared/src/types/payload-types.ts` | Regenerate | Booking type dapat 6 field + enum expanded |
| `apps/web/src/pages/api/bookings/create.ts` | Edit | Status default `pending` → `awaiting_review`. Tambah `emailVerifiedAt: new Date().toISOString()` ke payload (sudah terbukti valid via token verify di Phase 4.69.3 guard) |
| `docs/phases/phase-4-polish-launch/checkout-flow/task 4.69/phase-4.69.5-bookings-status-enum-and-audit.md` | BARU | File ini |

### State Machine (dok visual untuk admin + developer)

```
                    [customer submit via form]
                              │
                              ▼
                   ┌─────────────────────┐
                   │  awaiting_review    │ ◀── default booking baru
                   │  (admin verify)     │
                   └──────────┬──────────┘
                              │ admin klik "Send Payment"
                              ▼
                   ┌─────────────────────┐
       ┌───────────│  awaiting_payment   │
       │           │  (invoice sent)     │
       │           └──────────┬──────────┘
       │                      │ customer kirim bukti bayar
       │                      ▼
       │           ┌─────────────────────┐
       │           │  payment_review     │
       │           │  (admin verify)     │
       │           └──────────┬──────────┘
       │                      │ bukti valid
       │                      ▼
       │           ┌─────────────────────┐
       │           │  confirmed          │
       │           │  (e-ticket sent)    │
       │           └─────────────────────┘
       │
       │  customer minta → reschedule_request / cancel_request
       │  admin tolak    → kembali ke status sebelumnya
       │  admin terima   → confirmed (reschedule) / cancelled (cancel)
       │
       └──→ cancelled / expired (dead-end)

Legacy (Phase 4.62 — tetap valid untuk booking existing):
  pending (deprecated for new bookings — kept for compat)
```

### Field Audit Mapping

| Field | Set by | Phase |
|---|---|---|
| `emailVerifiedAt` | `/api/bookings/create` (saat emailVerifiedToken valid) | 4.69.3 → 4.69.5 |
| `whatsappVerifiedAt` | Reserved (WA OTP endpoint) | 4.69.11 future |
| `sentPaymentAt` + `sentPaymentBy` | Admin CMS button "Send Payment Instructions" | 4.69.7 |
| `sentTicketAt` + `sentTicketBy` | Admin CMS button "Confirm Payment & Send Ticket" | 4.69.7 |

Semua field `readOnly: true` di admin UI — set otomatis oleh endpoint.
Super-admin tetap bisa override via DB kalau butuh koreksi (collection
`update: isAdmin`, field-level tidak di-restrict super-admin).

### Testing

#### Migration up/down

- `pnpm schema:migrate` → `Migrated: 20261009_115958_phase_4_69_5_bookings_admin_handoff (139ms)` ✓
- Verify 6 kolom baru + 3 index ada di `bookings` table ✓

#### Create booking via Payload REST dengan status baru

```bash
POST /api/bookings { ..., status: "awaiting_review", emailVerifiedAt: "..." }
→ 201 doc.id=10, status=awaiting_review, emailVerifiedAt persisted ✓
```

#### TypeScript check

Zero error baru. 2 pre-existing error unrelated (`newsletter/index.ts`, `payload-types.ts` module augmentation).

### Impact

- **Database**: 6 kolom baru + 3 index di `bookings` (migration applied). Backward compatible — existing booking row tidak ter-sentuh.
- **CMS**: field "Admin Handoff Audit" tampil di edit view booking (collapsible, default collapsed). Status dropdown punya 4 opsi baru + legacy `pending`.
- **Frontend**: `/api/bookings/create` sekarang set `status=awaiting_review` + `emailVerifiedAt`. Customer-facing confirmation page tetap sama (belum render status baru — kalau mau, defer ke 4.69.9).
- **Routes**: tidak ada route baru
- **RBAC**: tidak ada perubahan access rule (collection-level `update: isAdmin` tetap; field-level readOnly di UI tapi masih bisa di-set via REST — SSOT di endpoint caller).
- **Deploy needed**: **cms + web**

### Rollback

```bash
pnpm --filter @gt-journeys/cms run schema:down  # 1 batch
```

Revert 2 file (collection + API endpoint). Status enum di collection
back-port otomatis karena SQLite tidak enforce enum di DB level — booking
yang sudah masuk dengan status baru akan tetap muncul (tapi tidak
di-select-able di dropdown post-rollback — admin bisa edit via DB).

### Security Notes

- `emailVerifiedAt` audit timestamp — bukan field security-critical, cuma
  trail. Verifikasi actual tetap via HMAC token di guard endpoint.
- `sentPaymentBy` + `sentTicketBy` = FK ke users — ON DELETE SET NULL
  supaya hapus user admin tidak kaskade hapus booking.
- Index `(status, created_at)` optimasi filter dashboard — tidak expose
  data sensitif.
- Status transition BELUM di-restrict (admin bisa pindah ke status
  manapun). Enforcement workflow (misal: `confirmed` tidak boleh balik
  ke `awaiting_review` tanpa super-admin) defer ke Phase 4.69.7+ via
  hook.

### Dokumentasi yang Diupdate

- [x] File phase ini
- [ ] `docs/02-DATABASE-SCHEMA.md` — update saat series 4.69 complete (tambah 6 kolom + join `otp_verifications`)
- [ ] `docs/04-RBAC.md` — update saat series 4.69 complete
- [ ] `docs/PROGRESS.md` — update saat series 4.69 complete

### Next Steps

**Phase 4.69.6 — BookingTemplates global**:
1. New global `booking-templates` dgn 5 tab template (payment, ticket, reschedule, cancel, OTP email) + bank accounts array
2. Access: `read: isAdmin`, `update: isSuperAdmin` (D7 approval)
3. Variable substitution helper (`{{bookingRef}}`, `{{customerName}}`, dst) dengan whitelist + fail-safe mode (D10 ERROR saat variable missing)
4. Register di `collections[]` under group `Bookings`
5. Smoke test substitution engine
