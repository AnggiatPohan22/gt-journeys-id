# Booking Hardening Series — Stage 1 → 3

**Scope**: Hardening lanjutan untuk collection `bookings` setelah
Phase 4.66 (checkout security v0.1 — baseline). Series ini meng-cover
22 finding audit (Oct 2026), dibagi menjadi 4 stage per
[`docs/security-hardening-playbook.md`](../../../security-hardening-playbook.md).

Status series: **✅ All AGENT scope complete** (lihat [CLOSING-SUMMARY.md](CLOSING-SUMMARY.md)).
- **Stage 1 — Quick wins (idempotency / rate-limit / GraphQL / lockout):** ✅ 5 step MERGED
- **Stage 2 — Field-level data integrity locks:** ✅ 3 step MERGED
- **Stage 3 — Admin UI redesign (masking / grouping / modals / resend notice):** ✅ 7 commit MERGED
- **Stage 4 — Pre-production (API user, PII retention, hygiene fixes):** ✅ 4 AGENT item MERGED · ⏳ USER manual steps + USER-only items pending

Tracker lengkap finding + status: [`docs/security-followups.md`](../../../security-followups.md).

## Konvensi folder

- 1 sub-folder per stage.
- 1 `.md` per step (sesuai nomor playbook).
- Setiap stage punya `README.md` sendiri sebagai overview + checklist smoke test.
- Report ringkas: header + ringkasan + file list + commit SHA. Detail penuh ada di commit message (`git show <sha>`).

## Index

| Stage | Scope | Merge PR |
|---|---|---|
| [1](stage-1-quick-wins/README.md) | Idempotency + rate-limit guard + GraphQL off + login lockout | [#3](https://github.com/AnggiatPohan22/gt-journeys-id/pull/3) |
| [2](stage-2-field-locks/README.md) | Server-side lock receipt/audit/passport-dates + manual-edit audit hook | [#4](https://github.com/AnggiatPohan22/gt-journeys-id/pull/4) |
| [3](stage-3-ui-redesign/README.md) | AccessToken cell + list masking + detail collapsibles + confirm modals + resend copy | [#5](https://github.com/AnggiatPohan22/gt-journeys-id/pull/5) |
| [4](stage-4-pre-production/README.md) | Scoped `api` role (4.1) + PII retention (4.2) + admin scaffold TS fix (4.3) + production domain (4.4) | [#7](https://github.com/AnggiatPohan22/gt-journeys-id/pull/7), [#8](https://github.com/AnggiatPohan22/gt-journeys-id/pull/8), [#9](https://github.com/AnggiatPohan22/gt-journeys-id/pull/9), [#10](https://github.com/AnggiatPohan22/gt-journeys-id/pull/10) |

Backfill docs: [#6](https://github.com/AnggiatPohan22/gt-journeys-id/pull/6).

## Updates ke master log

Series ini di-mirror sebagai row di
[`docs/08-SECURITY-PATCH.md`](../../../08-SECURITY-PATCH.md) section
"Phase 4.74 — Booking Hardening (Stage 1→3)". File ini index per
step; master log index per finding.
