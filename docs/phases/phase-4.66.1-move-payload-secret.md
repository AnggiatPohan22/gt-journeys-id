## Phase: 4.66.1 — Move PAYLOAD_SECRET dari `[vars]` ke Worker secret

**Tanggal**: 2026-09-30
**Status**: Selesai
**Dikerjakan oleh**: Claude Code
**Finding**: S-01 (Critical) di [phase-4.66-security-patch-v0.1.md](phase-4.66-security-patch-v0.1.md)

### Ringkasan
`[vars] PAYLOAD_SECRET` di `apps/cms/wrangler.toml` (file tracked di git) diganti komentar yang mengarahkan ke `wrangler secret put PAYLOAD_SECRET`. Nilai lama = placeholder `"CHANGE-THIS-TO-A-RANDOM-32-CHAR-STRING"`, jadi tidak ada rotasi secret hidup — hanya penghilangan slot yang mengundang commit secret nyata.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| [apps/cms/wrangler.toml](apps/cms/wrangler.toml) | Hapus `PAYLOAD_SECRET = "CHANGE-THIS-TO-A-RANDOM-32-CHAR-STRING"` dari `[vars]`. Tambah komentar arahkan ke `wrangler secret put` + list secret lain (PAYLOAD_API_KEY, BOOKING_FORM_SECRET). |
| [docs/05-INFRA.md](docs/05-INFRA.md) | §2.4 & §2.5: sample `wrangler.toml` diperbaharui + langkah "Yang perlu diubah sebelum production" ditulis ulang untuk merefleksikan bahwa Phase 4.66.1 sudah menghapus baris tersebut. |

### Impact
- **Database**: none
- **CMS**: Wajib set `wrangler secret put PAYLOAD_SECRET` sebelum deploy berikutnya. Kalau lupa, `getPayload()` akan crash (Payload check secret length). Fail-fast di boot — visible di `wrangler tail`.
- **Frontend**: none
- **Routes**: none
- **RBAC**: none

### Testing
- [x] Grep — tidak ada literal `PAYLOAD_SECRET =` di file yang di-track git selain `.env.example`:
  ```
  git grep 'PAYLOAD_SECRET *=' -- ':!*.example' ':!docs/*'
  ```
  → hanya `apps/cms/src/payload.config.ts:244` (`process.env.PAYLOAD_SECRET || 'CHANGE-THIS-SECRET-IN-PRODUCTION'`), yang akan diperkuat fail-fast di Phase 4.66.8.
- [ ] Manual (butuh Cloudflare access): `wrangler secret put PAYLOAD_SECRET` di project `dn-journeys-cms`.
- [ ] Manual: `wrangler deploy` lalu `wrangler tail` — pastikan tidak ada crash `Missing PAYLOAD_SECRET`.

### Rollback
```bash
git revert <commit-hash-of-4.66.1>
# Kalau env sudah diset via `wrangler secret put`, remove:
wrangler secret delete PAYLOAD_SECRET
```

### Dokumentasi yang Diupdate
- [x] `docs/05-INFRA.md` §2.4 + §2.5
- [x] `docs/phases/phase-4.66.1-move-payload-secret.md` (this file)

### Next Steps
Phase 4.66.2 — S-05: tambah `csrf: [...]` di Payload config.
