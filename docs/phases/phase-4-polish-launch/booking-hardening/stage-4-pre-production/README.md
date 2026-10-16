# Stage 4 — Pre-production Checklist (Booking Hardening)

**Scope**: Checklist sebelum deploy production. Mix AGENT + USER items.
Playbook: [`../../../../security-hardening-playbook.md`](../../../../security-hardening-playbook.md) §4.

> Playbook rule: **"Do not start any of these unless the user names the item."**

## Status

| # | Item | Owner | Status |
|---|---|---|---|
| 4.1 | Dedicated API user + rotate `PAYLOAD_API_KEY` (#9 High) | AGENT (code) + USER (admin UI steps post-merge) | ✅ CODE DONE (PR TBD) · ⏳ USER steps pending |
| 4.2 | Data retention policy passenger PII (#11 Medium) | USER decision then AGENT | 📋 planned |
| 4.3 | Fix type error `[[...segments]]/not-found.tsx:12` | AGENT | ✅ MERGED (TBD) |
| 4.4 | Replace `https://example.com` placeholder → `https://gtjourneys.id` | AGENT | ✅ MERGED (TBD) |
| 4.5 | Build + test `opennextjs-cloudflare build && preview` on Linux/WSL2/CI | USER | 📋 planned |
| 4.6 | Test 55+ migrations from EMPTY DB on staging | USER | 📋 planned |
| 4.7 | Set Cloudflare secrets + verify `cleanup-otp` cron (#10 Low) | USER | 📋 planned |
| 4.8 | Fill real business name/address di CMS Receipt tab | USER | 📋 planned |
| 4.9 | Verify `_redirects` + staging smoke checkout | USER | 📋 planned |
| 4.10 | 2FA super-admin (#17 Low) | LATER post-launch | 📋 deferred |

## Phase reports

- [4.1 Dedicated API user role](phase-4.1-api-user-role.md)
- [4.3 Fix admin scaffold types](phase-4.3-fix-admin-scaffold-types.md)
- [4.4 Set production domain](phase-4.4-set-production-domain.md)
