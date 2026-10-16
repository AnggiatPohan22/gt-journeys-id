## Phase: 3.4 — Confirmation modals: departureDate edit + hasRequestedChange uncheck

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — VERIFIED via browser automation
**Commit**: `4041756`
**Finding**: audit section D (risky-action UX)

### Ringkasan
Dua guard baru pakai pola **sibling-UI** (bukan field replacement) — native Payload date picker + checkbox tetap jalan. Modal muncul SETELAH value berubah; Cancel revert via `setValue(prev)` → audit hook (Step 2.3) tidak fire kalau user batal.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/admin/fields/DepartureDateConfirmGuard.tsx` | NEW. `useField<string>` watch `departureDate` + `status`. `prevValueRef` seed dari `initialValue` di first pass → tidak false-positive saat form hydrate. Gated statuses: `confirmed`, `reschedule_request`, `cancel_request`, `cancelled`, `expired`. Modal body: status + before→after + note audit log + reminder customer tidak otomatis diberitahu. |
| `apps/cms/src/admin/fields/HasRequestedChangeConfirmGuard.tsx` | NEW. Pola sama. Trigger: HANYA TRUE → FALSE (un-check). Set-forward (false → true) tidak di-prompt. Modal body: explain one-shot flag + konsekuensi (customer bisa submit permintaan baru). |
| `apps/cms/src/collections/Bookings.ts` | Register 2 `ui` sibling field setelah `departureDate` row + inside Request History collapsible after `hasRequestedChange`. `departureDate` description tambah hint confirmed+ prompt. |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Autogen regen. |

### Keputusan scope
- **Delete-booking confirm (brief §5.3) SKIP** — Payload native dialog cukup + konsisten dengan finding #8 "admin trusted" accepted.
- **Reuse existing `.bk-modal*` CSS** dari `BookingAdminActions.tsx` (sudah injected di edit page untuk admin/super-admin).

### Testing (verified)
- [x] Booking confirmed, ubah `departureDate` → modal "Ubah tanggal keberangkatan?" dengan status + before→after.
- [x] Cancel → date revert, Save tidak dirty.
- [x] Confirm → modal tutup, Save → audit entry append (Step 2.3 hook).
- [x] Booking awaiting_review, ubah date → tidak ada modal (status tidak gated).
- [x] Un-check `hasRequestedChange` → modal "Reset flag".
- [x] Cancel → re-check otomatis.
- [x] Reset flag → tetap unchecked, Save OK.
- [x] Check-ulang (false → true) → tidak ada modal.

### Known behavior
Programmatic `.click()` di React 19 kadang perlu full `mousedown`+`mouseup`+`click` sequence untuk ter-fire synthetic events. Real user click (pointer event lengkap) tidak terdampak.

### Scope
- Zero schema change, zero access rule change, zero endpoint change.
- No new validate rule.

### Rollback
```bash
git revert 4041756
```
