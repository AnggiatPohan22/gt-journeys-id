## Phase: 4.25 — CMS Cold-Start Fix (dashboard version warning + duplicate-index race)
**Tanggal**: 2026-09-02
**Status**: ✅ **Complete** — 2 fokus fix, cold-start test 3× pass, tidak ada regresi
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch` (langsung — hotfix scope kecil, 2 file + 1 new file)
**Commits**:
- `2422c21` [cms] fix(dashboard): drop payload/package.json import, read version from cms own package.json
- `c442485` [cms] fix(boot): disable dev schema-push + warm Payload singleton in instrumentation

### Ringkasan
Dua symptom di dev cold start: **(1)** `payload/package.json` resolver warning di terminal setiap render dashboard, dan **(2)** 2-3 request pertama ke `/admin/login` return 500 dengan error "index already exists" (SQLite), lalu semua request setelahnya normal. Investigasi Step 1 mengkonfirmasi keduanya sebagai bug (bukan cosmetic) dan menemukan root cause yang berbeda untuk masing-masing. Fix di-approve owner, di-implement dalam 2 commit terpisah (satu concern per commit sesuai Section 12), verified via 3× cold-start test.

---

## Step 1 — Investigation (findings dari analisis 2026-09-02)

### Error #1 — DashboardStats.tsx `payload/package.json` warning
- **Lokasi**: [apps/cms/src/admin/DashboardStats.tsx:32](../../apps/cms/src/admin/DashboardStats.tsx) (pre-fix) — `req('payload/package.json')?.version` via `createRequire(import.meta.url)`
- **Digunakan di**: line 263 — `<InfoRow ... value={\`v${PAYLOAD_VERSION}\`} />` di "System Health" card
- **Fallback**: try/catch → `'3.x'` kalau require throw
- **Root cause (verified)**: `payload@3.87.0/package.json` mendeklarasikan field `exports` tapi **tidak punya entry `./package.json`** (di-verify: `node -p 'require("payload/package.json").exports["./package.json"]'` = false). Node ESM resolver refuse path itu → require throw → catch swallow → fallback ke `'3.x'`, tapi Next dev tetap log resolver warning setiap render.

### Error #2 — Duplicate-index race di cold start
- **Payload singleton**: ada di library — [payload/dist/index.js:532-648](../../apps/cms/node_modules/payload/dist/index.js) (`global._payload` Map, keyed by config `key`).
- **Race window**: line 548-560 — `_cached.get(key)` dan block `if (!cached) { ... _cached.set(key, cached) }` tidak atomic across paralel request. Dua concurrent RSC/route call di cold start sama-sama lihat `cached === undefined`, dua-duanya bikin object `cached` sendiri, masing-masing hit `cached.promise = new BasePayload().init(options)` di ref mereka sendiri → **dua init konkuren**.
- **Origin request cold-start**: Next dev fire beberapa RSC + prefetch paralel untuk `/admin` pas hit pertama. Boilerplate Payload di [layout.tsx](../../apps/cms/src/app/(payload)/layout.tsx), [page.tsx](../../apps/cms/src/app/(payload)/admin/[[...segments]]/page.tsx), [api/[...slug]/route.ts](../../apps/cms/src/app/(payload)/api/[...slug]/route.ts) masing-masing internal call `getPayload({ config })` — code kita sendiri tidak. Confirmed: `grep 'getPayload(' apps/cms/src` (exclude scripts) = 0 hits.
- **Schema-push default**: [db-sqlite/dist/connect.js:50-51](../../apps/cms/node_modules/@payloadcms/db-sqlite/dist/connect.js) — `if (NODE_ENV !== 'production' && PAYLOAD_MIGRATING !== 'true' && this.push !== false) → pushDevSchema(this)`. Config kita ([payload.config.ts:103](../../apps/cms/src/payload.config.ts)) tidak set `push` → default `undefined`, `undefined !== false` → **push jalan tiap cold start**.
- **Failure sequence**: 2 init paralel → 2 `pushDevSchema` paralel → satu menang bikin index → yang lain crash "index already exists". Init yang crash reset `cached.promise = null` (line 640-642), lalu request berikut hit cached instance yang selamat dan normal. Ini pattern "2-3 error, terus normal".

Kedua-duanya real bugs, bukan cosmetic.

---

## Step 2 — Approved fixes (2026-09-02)

### Fix #1 — DashboardStats version lookup
Read version dari `apps/cms/package.json` yang kita kontrol, bukan reach ke `payload/package.json` yang di-block `exports`.

**File berubah**: `apps/cms/src/admin/DashboardStats.tsx`
- Drop `import { createRequire } from 'module'`
- Add `import cmsPkg from '../../package.json' with { type: 'json' }`
- Ganti try/catch/require block dengan one-liner: `const PAYLOAD_VERSION = (cmsPkg.dependencies?.payload ?? '3.x').replace(/^[\^~>=<\s]+/, '')`

Zero throw, no more resolver warning. Version yang ditampilkan: `v3.33.0` (dari dependency line saat ini) — kalau bump payload di package.json, tile auto-update tanpa touch kode.

### Fix #2 — Cold-start race
Dua knob orthogonal, dua-duanya diaplikasikan (belt-and-braces):

1. **`push: false` di sqliteAdapter** ([payload.config.ts:103-114](../../apps/cms/src/payload.config.ts)) — schema push dev dimatikan. Kita sudah manual push schema anyway (Phase 4.23 `theme` col, Phase 4.24 `pad_*` cols) karena Payload restart-prompt gantung, jadi zero cost. Prod tetap pakai migration path via `PAYLOAD_MIGRATING`.
2. **`apps/cms/instrumentation.ts` (new)** — Next.js server-boot hook, `await getPayload({ config })` sekali di runtime `nodejs` sebelum request pertama masuk. Warm singleton → paralel first request hit cache, race window ilang. Try/catch supaya kalau warm-up gagal (mis. config error), boot tidak block — Payload's Next integration tetap init on-demand.

Kedua knob address root cause berbeda: (1) hilangkan concurrent-push failure mode; (2) hilangkan concurrent-init sama sekali. Even if (1) somehow reverted, (2) prevents the race. Even without (2), (1) prevents the crash.

---

## Step 3 — Implementation (2 commits, sesuai Section 12 one-concern-per-commit)

### Commit `2422c21` — Fix #1
```diff
-import { createRequire } from 'module'
 import type { ServerProps } from 'payload'
+import cmsPkg from '../../package.json' with { type: 'json' }

-// Versi Payload (best-effort, tidak pernah melempar error).
-let PAYLOAD_VERSION = '3.x'
-try {
-  const req = createRequire(import.meta.url)
-  PAYLOAD_VERSION = req('payload/package.json')?.version ?? '3.x'
-} catch { /* fallback */ }
+// Payload version — dibaca dari dependencies apps/cms/package.json (yang
+// kita kontrol) bukan dari `payload/package.json` (di-block oleh exports
+// field di payload@3, memicu resolver warning di Next dev tiap render).
+const PAYLOAD_VERSION = ((cmsPkg as { dependencies?: Record<string, string> }).dependencies?.payload ?? '3.x')
+  .replace(/^[\^~>=<\s]+/, '')
```

### Commit `c442485` — Fix #2

**`apps/cms/src/payload.config.ts`** (add `push: false` line di dalam existing config):
```ts
db: sqliteAdapter({
  client: { url: ... },
  push: false,     // ← new; see comment in file for full rationale
}),
```

**`apps/cms/instrumentation.ts`** (new file, ~30 lines):
```ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  try {
    const { getPayload } = await import('payload')
    const configMod = await import('./src/payload.config')
    await getPayload({ config: configMod.default })
  } catch (e) {
    console.warn('[instrumentation] Payload warm-up failed:', (e as Error)?.message ?? e)
  }
}
```

---

## Step 4 — Verification (2026-09-02)

Owner (Anggiat) cold-start test 3× pass. Confirmed:
- ✅ Tidak ada `payload/package.json` resolver warning di terminal CMS
- ✅ Tidak ada `SQLITE_CONSTRAINT` / "index already exists" saat boot
- ✅ `/admin/login` return 200 di request pertama, tidak ada 500
- ✅ Dashboard tetap load normal, System Health card tampilkan versi
- ✅ Tidak ada regresi behavior lain

### Rollback
- Fix #1: `git revert 2422c21` → kembali ke try/catch/createRequire approach (warning kembali).
- Fix #2: `git revert c442485` → hapus `push: false` + hapus `instrumentation.ts` (cold-start race bisa balik).
- Kedua-duanya independen, bisa di-revert terpisah.

### Dokumentasi
- [x] `docs/phases/phase-4.25-cms-cold-start-fix.md` (file ini, baru)
- [x] `docs/PROGRESS.md` (entry 4.25 ditambahkan)

### Impact
- **Database**: none (push disabled, tidak ada perubahan skema).
- **CMS**: 3 file diubah (2 modified + 1 new).
- **Frontend**: none.
- **Routes**: none.
- **RBAC**: none.
- **Deploy needed**: cms (setelah merge feature/phase4-polish-launch → main → prod). Tidak butuh web redeploy.

### Next Steps
- Instrumentation warm-up + `push: false` juga bermanfaat di prod-like setup (kalau nanti dev branch di-deploy staging).
- Kalau di masa depan mau re-enable auto-push, harus solve Payload's cache race dulu (upstream issue) — atau setup single-init entrypoint yang guaranteed sebelum request server jalan.
