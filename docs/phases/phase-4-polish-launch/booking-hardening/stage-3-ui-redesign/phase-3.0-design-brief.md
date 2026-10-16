## Phase: 3.0 — Design brief (no code)

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #5) — approved by user dengan defaults
**Commit**: `67062c6`
**Finding**: — (prep step)

### Ringkasan
STOP point per playbook: hasilkan `docs/booking-ui-redesign-brief.md` (Bahasa Indonesia, ~370 baris) sebelum menulis code apapun untuk Stage 3. User review + approve 5 keputusan di §12 brief → defaults semua.

### Perubahan
| File | Perubahan |
|---|---|
| `docs/booking-ui-redesign-brief.md` | NEW. 12 section mencakup current UI problems, proposed list masking, detail re-group, 4 confirmation modal, resend notice copy, per-role matrix, file list per step 3.1→3.5, pertanyaan ke user. |

### Keputusan yang di-approve
1. Grouping pakai `collapsible` (bukan `tabs`) — preserve requestAlert + adminActions di atas.
2. `customerName` tetap full di list (triage necessity).
3. Delete-booking confirm **skip** (Payload native cukup).
4. AccessToken reveal **permanent sampai click lagi** (tidak auto re-mask).
5. Un-hide payment & request-history fields di 3.3 — **approve**.

### Scope
- Zero code.

### Rollback
```bash
git revert 67062c6
```
