## Phase: 4.3 — Fix type error di admin scaffold (`[[...segments]]/not-found.tsx` + `page.tsx`)

**Tanggal**: 2026-10-16
**Status**: DONE (PR TBD)
**Commit**: (akan diisi setelah commit)
**Finding**: — (code hygiene, blocker potential untuk strict CI typecheck)

### Ringkasan
Playbook §4 item: `apps/cms/src/app/(payload)/admin/[[...segments]]/not-found.tsx:12` TS2322 — searchParams prop type mismatch antara Next.js 15 standard (`string | string[] | undefined`) dan Payload v3 `generatePageMetadata` / `NotFoundPage` / `RootPage` API (yang expect `string | string[]`, tanpa `undefined`). Fix: narrow local `Args` type di scaffold file untuk match Payload API.

`page.tsx` di folder yang sama punya error identik → fix sekalian supaya konsisten (playbook hanya sebut `not-found.tsx` tapi `page.tsx` adalah sibling scaffold yang sama pattern).

### Perubahan
| File | Perubahan |
|---|---|
| `apps/cms/src/app/(payload)/admin/[[...segments]]/not-found.tsx` | `Args.searchParams`: hapus `\| undefined` dari value union. Tambah inline comment menjelaskan safety (file ini hanya pass-through ke Payload, tidak baca values). |
| `apps/cms/src/app/(payload)/admin/[[...segments]]/page.tsx` | Perubahan identik. |

### Safety rationale
Next.js 15 runtime values CAN be `undefined` (query param tidak ada → `undefined`). Narrowing TS type ke `string | string[]` membuat TS tidak tahu kemungkinan `undefined`, TAPI:
1. File ini **tidak baca** values — hanya pass-through ke Payload `generatePageMetadata` / `RootPage` / `NotFoundPage`.
2. Payload API internally handle `undefined` di runtime (query dengan key hilang tetap valid).
3. Narrower type → TS2322 silenced, zero runtime perubahan.

### Testing
- [x] `npx tsc --noEmit -p tsconfig.json` → 2 error TS2322 untuk file ini hilang.
- [x] Pre-existing errors (defaultSort di collection types, archive scripts, HandoffBody) tidak terpengaruh.
- [ ] Smoke test `/admin/collections/anything-not-found` → 404 page render normal (Payload default UI).
- [ ] Smoke test `/admin` root → render normal.

### Scope
- Zero schema change, zero endpoint change, zero behavior change.
- Pure TypeScript type narrowing di 2 scaffold file.
- Zero new package.

### Rollback
```bash
git revert <commit-sha>
```
