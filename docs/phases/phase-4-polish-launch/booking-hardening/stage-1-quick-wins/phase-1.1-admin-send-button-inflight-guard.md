## Phase: 1.1 — Admin send-button in-flight guard

**Tanggal**: 2026-10-15
**Status**: MERGED (PR #3)
**Commit**: `4c860d5`
**Finding**: #2 (Medium), #3 (High) — client-side portion

### Ringkasan
Admin bisa klik "Send Payment" / "Confirm & Send Receipt" 2x sebelum state loading propagate → request duplicate, email dobel ke customer. Step 1.1 add client-side in-flight guard (useRef) + disable close controls saat request on-flight. Server-side cover di 1.2 + 1.3.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/admin/BookingAdminActions.tsx` | Add `previewInflightRef` mirror ke existing `inflightRef` (confirmSend). `close()` refuse saat loading → cegah ghost-send (admin klik Confirm lalu buru-buru Cancel/backdrop/Esc, email tetap terkirim). Disable "×" header-close + "Cancel/Close & Reload" footer saat loading. `aria-busy` pada primary buttons untuk a11y. |

### Testing
- [x] Double-click "Send Payment" cepat → 1 request fired (bukan 2).
- [x] Double-click "Preview" cepat → 1 request fired.
- [x] Klik "Confirm & Send" → langsung klik backdrop / Esc / Cancel → modal **tidak tertutup** sampai request selesai. Email tidak jadi "ghost" karena close dibatalkan tapi fetch lanjut.

### Scope
- Zero schema change, zero endpoint change, zero new package.
- Client-side only — server-side defense di Step 1.2 + 1.3.

### Rollback
```bash
git revert 4c860d5
```
