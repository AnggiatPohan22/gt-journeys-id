## Phase: 3.2 — List view masking for customerEmail / WhatsApp / phone

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — VERIFIED via browser automation
**Commit**: `52ee2ba`
**Finding**: #1 (Medium) — UI layer (server lock skip sengaja untuk fix-typo flow)

### Ringkasan
PII customer tidak boleh terlihat sekilas oleh admin yang scroll list. Full value tetap di detail view (admin perlu edit untuk fix typo); server lock sengaja tidak dipasang (konflik dengan support flow).

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/admin/cells/MaskedEmailCell.tsx` | NEW. `jane@gmail.com` → `j••@gmail.com` (preserve domain). Defensive: input tanpa '@' → `•••`. |
| `apps/cms/src/admin/cells/MaskedPhoneCell.tsx` | NEW. Reusable. `+6281234567890` → `+62•••••••90`. Preserve leading '+' + 1–2 head + 2 tail. Short string ≤4 digits → `+1••45` fallback. |
| `apps/cms/src/collections/Bookings.ts` | Register Cell pada `customerEmail`, `customerWhatsapp`, `contactPhone`. |
| `apps/cms/src/admin/list-view.css` | `.dnj-masked-cell*` shared styles. |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Autogen regen. |

### Keputusan sengaja
- `customerName` **TIDAK** di-mask → admin perlu nama untuk recognize booking saat triage. Audit rec sejalan (nama booking sudah public di bukti transfer / tiket).
- Server-side lock skip (lihat Phase 2.2 keputusan `customerEmail`/`customerWhatsapp`/`contactPhone` tidak dilock).

### Testing (verified)
- [x] List: `customerEmail` → `a••@gmail.com`.
- [x] List: `customerWhatsapp` → `+62••••••••12`.
- [x] List: `contactPhone` → `8•••••••12` (tanpa '+', region di kolom lain).
- [x] Hover cell → tooltip "Full ... visible on the booking detail page".
- [x] Detail view: full values penuh.

### Scope
- Zero schema change, zero access rule change, zero endpoint change.

### Rollback
```bash
git revert 52ee2ba
```
