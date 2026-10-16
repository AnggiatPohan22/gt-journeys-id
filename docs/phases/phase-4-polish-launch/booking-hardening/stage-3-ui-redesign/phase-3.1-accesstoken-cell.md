## Phase: 3.1 — AccessToken list cell: mask + click-to-reveal + copy

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — VERIFIED via browser automation
**Commit**: `1f8863d`
**Finding**: #7 (Low)

### Ringkasan
`accessToken` plaintext di admin list → PII eksposur. Custom cell render `••••••••••••{last4}` monospace, click reveal full, copy button write FULL token ke clipboard regardless masked/revealed state.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/admin/cells/AccessTokenCell.tsx` | NEW. Default masked, click toggle reveal (per-row local state, non-persistent — reload re-masks), copy button icon ⧉→✓→⧉ 1.2s. No telemetry. |
| `apps/cms/src/collections/Bookings.ts` | Field `accessToken`: `admin.components.Cell` → AccessTokenCell. |
| `apps/cms/src/admin/list-view.css` | `.dnj-token-cell*` styles (hover, focus-visible, theme tokens, dark-mode aman). |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Autogen regen. |

### Testing (verified)
- [x] Default render masked `••••••••••••{last4}`.
- [x] Click value → reveal full 32-hex token. Click lagi → re-mask.
- [x] Click copy icon → clipboard contains full token. Icon ✓ 1.2s, back to ⧉.
- [x] Reload → semua row re-masked.
- [x] Edit page: field `accessToken` tetap plaintext (intended — admin yang buka edit sudah intent).

### Scope
- Zero schema change, zero endpoint change.
- Only `admin.components.Cell` added — field tipe, access, default tetap.

### Rollback
```bash
git revert 1f8863d
```
