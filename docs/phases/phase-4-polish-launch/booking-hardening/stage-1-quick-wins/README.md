# Stage 1 — Quick Wins (Booking Hardening)

**Branch**: `fix/booking-security-quick` (merged → main via PR #3)
**Tanggal**: 2026-10-15 → 2026-10-16
**Scope**: 5 step independent — idempotency + rate-limit + GraphQL
disable + login lockout. Zero schema change.

## Steps

| Step | File | Finding | Commit |
|---|---|---|---|
| 1.1 | [admin-send-button-inflight-guard](phase-1.1-admin-send-button-inflight-guard.md) | #2, #3 | `4c860d5` |
| 1.2 | [send-ticket-rate-limit](phase-1.2-send-ticket-rate-limit.md) | #3 | `284cb4d` |
| 1.3 | [send-payment-optimistic-lock](phase-1.3-send-payment-optimistic-lock.md) | #2 | `637cb08` |
| 1.4 | [disable-graphql](phase-1.4-disable-graphql.md) | #15 | `bcbd18e` |
| 1.5 | [login-lockout-config](phase-1.5-login-lockout-config.md) | #17 (partial) | `e59a993` |

## Smoke test checklist (post-merge)

- [x] Admin double-click "Send Payment" / "Send Receipt" → 1 email (not 2).
- [x] Rapid consecutive "Send Receipt" calls dalam 30s → 2nd dropped at server with 429.
- [x] send-payment email fail → booking status rolled back ke `awaiting_review` (bukan stuck di `awaiting_payment`).
- [x] GET `/api/graphql` → 404.
- [x] Login salah 5x → akun locked 10 menit; super-admin bisa force-unlock via Security tab.

## Follow-up findings addressed

- #2 Medium — send-payment race on double-click → **done**
- #3 High — send-ticket per-attempt idempotency → **done**
- #15 Medium — GraphQL not disabled → **done**
- #17 Low — login lockout implicit, no 2FA → **partial** (lockout done; 2FA deferred)
