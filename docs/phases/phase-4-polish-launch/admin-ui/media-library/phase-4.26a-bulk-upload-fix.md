## Phase: 4.26a — Bulk Upload Stuck-on-Loading Fix
**Tanggal**: 2026-09-02
**Status**: ✅ Complete — user-verified end-to-end
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Accommodations `GalleryBulkUpload.tsx` component only (pilot from Phase 4.26).
**Commits**:
- `200c7b9` [cms] fix(accommodations): unstick bulk gallery upload — timeout + inline errors + save-modified

### Ringkasan
Post-4.26 owner testing found: bulk upload 3 images → tombol stuck "Uploading X/N" tanpa henti, tidak ada foto muncul, tidak ada error di UI. v1 (dari Phase 4.26) meng-await fetch tanpa timeout + tanpa try/finally + hanya `console.error` untuk failure — jadi satu stall di fetch atau `res.json()` mem-block seluruh loop dan `setBusy(false)` tidak pernah tercapai. User juga silently tidak bisa Save karena `setModified(true)` tidak pernah dipanggil.

### Root Cause
- **Where it hangs**: `await fetch('/api/media', ...)` di dalam sequential loop — v1 tidak punya timeout / AbortController. Satu fetch yang stall memblok seluruh function.
- **Why loading never clears**: `setBusy(false)` sit AFTER the loop tanpa `try/finally`. Await yang tidak resolve → cleanup tidak jalan.
- **Why no error visible**: v1 hanya `console.error` — non-devtools editor tidak melihat apapun.
- **Second bug (also fixed)**: v1 tidak pernah panggil `useForm().setModified(true)` setelah append rows — Save button silent tidak menyala meski data client-side sudah masuk.

### Fix (v2 rewrite of GalleryBulkUpload.tsx)
- **`uploadOne(file)` helper** returning tagged `{ok, id}` | `{ok:false, error}`.
- **60s `AbortController` timeout per file** → "Timed out after 60s" instead of silent hang.
- **`try/finally` around the whole handler** → guarantees `setBusy(false)` + progress reset no matter what.
- **Two-phase flow**: upload all files first, THEN batch-dispatch `ADD_ROW` for each success. Avoids interleaving fetches with form re-renders.
- **JSON error body read first**, fallback to statusText → real Payload errors (400/403/500) become human-readable.
- **Inline error panel** (`role="alert"`) below the button, lists per-file `<filename> — <reason>`.
- **`useForm().setModified(true)`** after successful dispatches → Save button activates.
- **`console.info` at each step** + explicit filename in `fd.append('file', file, file.name)` (defensive).
- Toast success now says "Don't forget to Save".

### Files Changed
- [apps/cms/src/admin/GalleryBulkUpload.tsx](../../apps/cms/src/admin/GalleryBulkUpload.tsx) — full rewrite (168+ / 60-)

### Impact
- **New dependency**: none.
- **DB/Schema**: none.
- **Contract with `/api/media`**: unchanged — same shape Payload's own `BulkUpload` uses (verified against `@payloadcms/ui/dist/elements/BulkUpload/FormsManager/createFormData.js`).
- **No importmap regen** — same component path.

### Verification
- ✅ Owner tested bulk upload — works end-to-end.
- ✅ `useForm().setModified` verified exists in `@payloadcms/ui` Context type before code write.
- ✅ ADD_ROW reducer contract identical to v1 (append-preserving, no data mutation).
- ✅ AbortController timeout + `finally` cleanup path exercised.

### Rollback
```
git revert 200c7b9
```

### Next
Follow-up UI-polish work (thumbnail grid) documented under Phase 4.26b onwards.
