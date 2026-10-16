## Phase: 4.2 — Passenger PII retention policy (12-month passport anonymization)

**Tanggal**: 2026-10-16
**Status**: CODE DONE (PR TBD) — cron trigger activation = USER manual langkah terakhir
**Commit**: (akan diisi setelah commit)
**Finding**: #11 (Medium) — No retention / cleanup for booking PII
**Decision input dari user**: approved — pakai rekomendasi default (12 bulan, hanya 4 field passport, nama/email/WA tetap).

### Ringkasan
Compliance UU PDP (UU 27/2022 Pasal 15): data pribadi harus dihapus/dianonimkan setelah tujuan pemrosesan tercapai. Implement cron-based anonymization untuk 4 field passport PII per passenger pada booking dengan `departureDate < now - 12 months`:
- `passportNumber` → `null`
- `dateOfBirth` → `null`
- `passportIssueDate` → `null`
- `passportExpiryDate` → `null`

Row booking tetap ada (audit keuangan + regulatory). Nama/email/WA sengaja TIDAK di-anonymize (customer service window + "forget me" case-by-case manual).

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/collections/Bookings.ts` | NEW `anonymizePiiEndpoint` (path `/api/bookings/anonymize-pii`). Auth: `admin \| super-admin \| api` role. Body `{ monthsThreshold?: 12, dryRun?: false, batchSize?: 100 }`. Idempotent via filter `passengers.passportNumber: { not_equals: null }`. Append audit entry ke `paymentAuditLog`. Pakai `overrideAccess: true` + `context.skipAuditLogHook: true` (bypass Step 2.1 field access + skip Step 2.3 manual-edit hook). Register di `endpoints: [...]` array. |
| `apps/web/src/pages/api/cron/anonymize-pii.ts` | NEW cron proxy endpoint. Mirror pattern `cleanup-otp.ts`: Bearer CRON_SECRET auth, constant-time compare, loop batches sampai hasMore=false (safety cap: 10 batch × 100 = 1000 booking/invocation), dry-run short-circuit. |

### Audit trail format
Tiap booking yang di-anonymize dapat entry di `paymentAuditLog`:
```
2027-10-16T19:00:00.000Z system | passport PII anonymized (12mo retention) | passengers: 3
```
Super-admin bisa trace via Admin Handoff Audit collapsible.

### Idempotency
Query filter include `'passengers.passportNumber': { not_equals: null }` → booking yang sudah di-anonymize auto-skip di invocation berikutnya. Re-run safe.

### Dry-run mode
Body `{ dryRun: true }` → scan + report count tanpa write. Dipakai:
- Staging verification sebelum go-live.
- Monthly sanity check: "berapa booking yang bakal ter-anonymize bulan depan?"

### USER manual steps post-merge
1. **Set `CRON_SECRET`** di Cloudflare secrets (kalau belum, bareng dengan `cleanup-otp`):
   ```bash
   cd apps/web
   wrangler secret put CRON_SECRET
   # paste random 32+ char string
   ```
2. **Test di staging dulu dengan dry-run**:
   ```bash
   curl -X POST https://staging.gtjourneys.id/api/cron/anonymize-pii \
     -H "Authorization: Bearer $CRON_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"dryRun": true}'
   # Response: { ok, dryRun:true, scanned:N, anonymized:N, ... }
   # Review N — pastikan jumlah masuk akal (= bookings dgn departureDate < now-12mo).
   ```
3. **Jalankan live sekali manual** sebelum setup cron automation:
   ```bash
   curl -X POST https://gtjourneys.id/api/cron/anonymize-pii \
     -H "Authorization: Bearer $CRON_SECRET"
   # Response includes anonymized count.
   # Spot-check 1-2 booking di CMS: passport fields harus null, audit log punya entry baru.
   ```
4. **Setup cron trigger** (pilih salah satu):
   - **Cloudflare Cron Trigger** (recommended): edit `apps/web/wrangler.toml` tambah:
     ```toml
     [triggers]
     crons = ["0 2 * * 0"]  # Sunday 02:00 UTC = Sunday 10:00 WITA
     ```
     Plus wire scheduled handler ke endpoint ini (ada example di `apps/cms` chat-retention).
   - **External cron** (GitHub Actions, Cronhub, dsb): schedule weekly POST ke endpoint dengan Bearer header.
5. **Monitor pertama 1-2 run**: cek Cloudflare Worker logs, confirm `anonymized > 0` kalau ada eligible booking, atau `0` kalau belum ada yang qualify.

### Testing (local)
- [x] `tsc --noEmit` CMS + web — clean (no new error).
- [ ] (post-merge) Dry-run di staging → scanned count matches manual SQL query `SELECT COUNT(*) FROM bookings WHERE departure_date < date('now', '-12 months')`.
- [ ] (post-merge) Live run di staging → spot-check: passport fields null, audit log entry present, re-run → anonymized: 0 (idempotent).
- [ ] (post-merge) Super-admin field access tetap jalan: PATCH `passengers.0.passportNumber` sebagai admin biasa → di-drop; sebagai super-admin → sukses. (Anonymize pakai `overrideAccess: true` dari cron context.)

### Scope reduction / tidak dilakukan
- **Right-to-deletion endpoint** (customer self-service minta hapus) — separate feature, bukan auto-cron.
- **Cron trigger activation** (wrangler.toml edit + scheduled handler wire) — defer ke USER setelah staging smoke, karena butuh pilih timezone/jadwal + wire ke OpenNext scheduled handler.
- **Nama / email / WA anonymization** — per keputusan user Stage 4.2 approve default: TIDAK di-anonymize (customer service window; "forget me" kalau customer minta dilakukan manual case-by-case).

### Scope
- Zero schema change (field passport sudah ada; cuma di-set null).
- Zero new package.
- 2 endpoint baru (1 CMS + 1 web cron proxy).

### Rollback
```bash
git revert <commit-sha>
# Data yang sudah di-anonymize tidak bisa di-restore dari revert (passport
# data sudah hilang permanen). Backup D1 kalau mau rollback data —
# tapi tujuan retention memang bikin hilang permanen.
```
