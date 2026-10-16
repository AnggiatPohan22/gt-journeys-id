## Phase: 1.4 — Disable Payload GraphQL endpoint

**Tanggal**: 2026-10-16
**Status**: MERGED (PR #3)
**Commit**: `bcbd18e`
**Finding**: #15 (Medium)

### Ringkasan
GraphQL endpoint Payload tidak dipakai aplikasi tapi terbuka → attack surface. Disable via `graphQL: { disable: true }` di payload.config.

### Pre-check
- 0 app code pakai `/api/graphql` atau client library (apollo/urql/graphql-request).
- `apps/cms/src/app/(payload)/api/graphql/route.ts` + `graphql-playground/route.ts`: Payload scaffold route handler → akan no-op setelah disable.
- Dep `graphql@^16.10.0` di `apps/cms/package.json`: transitif Payload (type imports internal) → tetap dibutuhkan, tidak di-remove.

### Catatan API
Option name di Payload v3: `graphQL` (camelCase, capital GL), bukan lowercase `graphql`. Verifikasi via `node_modules/payload/dist/config/types.d.ts` line 1024.

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/payload.config.ts` | Tambah `graphQL: { disable: true }`. |

### Dampak
- POST `/api/graphql` + GET `/api/graphql-playground` → 404.
- Admin panel (REST + internal RPC) tidak terpengaruh.
- Attack surface berkurang: introspection, query complexity DoS, auth bypass via alias batching, field-level access gaps di GraphQL resolver.

### Testing
- [x] GET `/api/graphql` → 404.
- [x] GET `/api/graphql-playground` → 404.
- [x] CMS admin panel + REST API bookings flow → tetap jalan.

### Scope
- Zero schema change, zero new package, zero endpoint change (yang lain).

### Rollback
```bash
git revert bcbd18e
```
