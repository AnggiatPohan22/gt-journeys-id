## Phase: 4.26 — Gallery Bulk Upload + Photo Viewer UX (Pilot)
**Tanggal**: 2026-09-02
**Status**: ✅ **Code complete (pilot)** — B1 + B2 verified via dev browser; A verified via compile + importmap register + code review; A end-to-end still needs owner-login UI test
**Dikerjakan oleh**: Claude Code
**Branch**: `feature/phase4-polish-launch`
**Scope**: Accommodations collection only + `/villa/[slug]` detail page. Tours, WaterActivities, Yachts, Restaurants, Venues, Rentals, Spa **NOT** yet rolled out — pilot first.
**Commits**:
- `a67ce91` [web] fix(villa): clip hero main image so zoom stays in frame
- `105a934` [cms] feat(accommodations): bulk gallery upload (max 10, pilot)
- `4b075d9` [web] feat(villa): photo lightbox + hero swipe (pilot)

### Ringkasan
Tiga issue yang independen digabung dalam satu phase:
- **A — CMS bulk upload**: gallery Accommodations sebelumnya harus di-add satu foto per satu. Payload tidak punya native multi-file picker untuk pola `array + upload`. Custom admin component ditambah (Payload 3 `ui` field dengan `Field` component) yang buka `<input multiple>`, POST tiap file ke `/api/media`, lalu append row ke array via `dispatchFields({type:'ADD_ROW'})`. Max 10 dienforce di kedua sisi.
- **B1 — Zoom keluar frame**: bug CSS 1-baris. Cell utama bento tidak punya `overflow-hidden` (dua cell samping punya), jadi `group-hover:scale-105` bocor ke cell tetangga.
- **B2 — "Show all photos" mati**: anchor `<a href="#gallery-all">` sebenarnya scroll ke section Room Options (id-nya nggak nyambung). Lightbox baru dibuat (`PhotoLightbox.astro`) — reusable via `data-open-lightbox`/`data-index` + global `window.__openPhotoLightbox`. GalleryBlock.astro milik CMS pages **tidak** disentuh (per keputusan owner).

Bonus (di-approve owner, Option 1): hero image di mobile support **swipe in-place** untuk cycle antara [featuredImage, ...gallery]; tap membuka lightbox di index saat ini.

---

## Step 1 — Investigation (findings 2026-09-02)

### Part A — Gallery bulk upload
- **Field config** [apps/cms/src/collections/Accommodations.ts:129](../../apps/cms/src/collections/Accommodations.ts) — `array` field dengan sub-`upload` + `text` caption. Payload 3.87 tidak punya multi-file picker untuk shape ini.
- **Payload options ditolak**:
  1. `upload` `hasMany: true` di top-level: multi-select dari Media library, tapi drop per-image caption dan bukan upload dari disk.
  2. Media collection `bulkUpload`: bulk-create Media doc, tapi tidak attach ke doc Accommodation.
  3. Config-level switch: tidak ada.
- **Media.alt required** ([Media.ts:31](../../apps/cms/src/collections/Media.ts)) → bulk uploader wajib supply alt (dari filename, title-cased).
- **Conclusion**: butuh custom Admin UI component.

### Part B1 — Zoom breaks out of frame
- **File**: [apps/web/src/pages/villa/[slug].astro:159](../../apps/web/src/pages/villa/[slug].astro) (pre-fix).
- Cell utama: `<div class="md:col-span-3 row-span-2 relative group">` — **tanpa** `overflow-hidden`.
- Cell samping (line 171, 184): `<div class="hidden md:block relative group overflow-hidden">`.
- CSS transform bukan GSAP — pure Tailwind `group-hover:scale-105` + `transition-transform`.
- Parent grid punya `overflow-hidden` di outer boundary, tapi cell utama sendiri tidak clip → img scaled bleed ke cell tetangga.

### Part B2 — "Show all photos" does nothing
- **Trigger** ([slug].astro:194 pre-fix): `<a href="#gallery-all">` — scroll ke section Room Options (id `gallery-all` di line 331), **bukan** lightbox.
- **Reusable pattern** yang sudah ada: [GalleryBlock.astro:123-218](../../apps/web/src/components/blocks/GalleryBlock.astro) — lightbox utuh (fixed overlay, prev/next, keyboard, scroll lock, animasi). Kekurangan untuk kebutuhan villa: (a) arrow `hidden md:flex` di mobile, (b) tidak ada touch swipe.
- Dependency swipe: tidak perlu library baru — native `touchstart`/`touchend`.

---

## Step 2 — Fix plan (approved 2026-09-02)
- **Hero swipe UX**: Option 1 (in-place cycle + tap → lightbox). Option 2 (mobile carousel) ditolak.
- **GalleryBlock refactor**: skip (biar aman, pilot dulu). Lightbox baru dibuat terpisah, GalleryBlock tetap punya lightbox lamanya.
- Tiga commit terpisah, fokus per issue.

---

## Step 3 — Implementation

### Commit A — `105a934` (CMS)
**Files:**
- **New** [apps/cms/src/admin/GalleryBulkUpload.tsx](../../apps/cms/src/admin/GalleryBulkUpload.tsx) — client component. Pakai `useForm().dispatchFields` (`ADD_ROW`), `useAllFormFields` (baca current row count), `toast` (feedback). Upload lewat `/api/media` multipart dengan `_payload` JSON field (contract sudah di-verify: [payload/dist/utilities/addDataAndFileToRequest.js:49-50](../../apps/cms/node_modules/payload/dist/utilities/addDataAndFileToRequest.js)). Alt auto: `filename.replace(/[-_]+/g,' ').replace(/\.[^.]+$/,'')` → title case.
- **Edit** [apps/cms/src/collections/Accommodations.ts:129](../../apps/cms/src/collections/Accommodations.ts) — tambah `maxRows: 10` di gallery array + sibling `ui` field `galleryBulkUpload` (mount `Field: '/admin/GalleryBulkUpload#default'`).
- **Regen** [apps/cms/src/app/(payload)/admin/importMap.js](../../apps/cms/src/app/(payload)/admin/importMap.js) via `pnpm --filter cms generate:importmap` — component ter-register (line 32, 85).

**Guarantees:**
- `insertAt = currentCount`; row baru selalu di-append, tidak overwrite existing.
- Overflow > 10 di-truncate + `toast.warning` "Only N slots left".
- Kegagalan per-file di-tangkap; sukses lain tetap masuk; failure list di-toast.
- `input.value = ''` di-reset supaya pilih file sama dua kali tetap fire onChange.

**No new npm dependency** — semua dari `@payloadcms/ui`.

### Commit B1 — `a67ce91` (Web)
**File**: [apps/web/src/pages/villa/[slug].astro:159](../../apps/web/src/pages/villa/[slug].astro).
Tambah `overflow-hidden` ke `<div class="md:col-span-3 row-span-2 relative group ...">`. 1 baris.

### Commit B2 — `4b075d9` (Web)
**Files:**
- **New** [apps/web/src/components/gallery/PhotoLightbox.astro](../../apps/web/src/components/gallery/PhotoLightbox.astro) — full lightbox. Prev/next visible di mobile (`hidden md:flex` dihapus), touch swipe di `.lb-inner` (threshold 50px, horizontal-dominant), keyboard (Esc/←/→), scroll lock. Registry `window.__photoLightboxes[id] = { open, show, close }` + helper `window.__openPhotoLightbox(id, index)`. Trigger auto-bind ke semua `[data-open-lightbox]` (guarded via `__lbBound`). Data disematkan lewat `<script type="application/json" data-lightbox-data={id}>` (JSON string, bukan pass ke inline script → aman dari escaping).
- **Edit** [apps/web/src/pages/villa/[slug].astro](../../apps/web/src/pages/villa/[slug].astro):
  - Bangun `allPhotos = [heroImg, ...galleryEntries]` (pakai `hero` size url).
  - `<PhotoLightbox id="villa-photos" photos={allPhotos} />` di bawah section hero.
  - Anchor `#gallery-all` → `<button data-open-lightbox="villa-photos" data-index="0">`.
  - Semua 3 cell bento dapat `data-open-lightbox` + `data-index` (main = 0, side1 = 1, side2 = 2).
  - Mobile-only "Show all N photos" pill di bawah bento (desktop tetap pakai hover overlay).
  - Inline script Astro `define:vars={{ heroPhotos: allPhotos }}` — hero swipe (touchstart → touchmove → touchend). Threshold swipe 50px horizontal-dominant; tap = movement < 10px + duration < 400ms → `__openPhotoLightbox('villa-photos', idx)`. Cycle wrap-around via modulo.
  - Drop stray `id="gallery-all"` di Room Options (grep = 1 hit, itu doang, aman dihapus).
- Overlay hover diberi `pointer-events-none` supaya click tembus ke cell.

---

## Step 4 — Verification

### B1 + B2 verified via dev browser (this session)
Dev server: `http://localhost:4321/villa/cliff-resort-uluwatu` (Astro sudah jalan).

**Fungsional:**
- ✅ `overflow-hidden` terpasang di main hero cell (JS DOM check).
- ✅ Photo data ter-emit: 6 photo (1 hero + 5 gallery).
- ✅ 5 trigger `data-open-lightbox` (hero cell + side1 + side2 + hover overlay + mobile pill).
- ✅ `window.__openPhotoLightbox` global function ter-register.
- ✅ Lightbox open via API → `is-open` class + counter "1 / 6" + body scroll locked.
- ✅ Screenshot desktop: lightbox render (image full-screen, prev/next arrow, close top-right, counter top-left).
- ✅ Next click 2× → "3 / 6"; prev click → "2 / 6"; close click → `is-open` removed + body scroll restored.
- ✅ "Show all photos" button click → lightbox open di index 0.
- ✅ Hero cell click → lightbox open di index 0.

**Mobile (375×812 preset):**
- ✅ Mobile "Show all 6 photos" pill visible (175×38 px).
- ✅ Hero cell punya `.touch-pan-y` + `tabindex="0"`.
- ✅ Screenshot mobile: layout clean, pill di bawah hero.
- ✅ Fabricated swipe → `data-index` naik 0→1→2→3, img src berubah cliff-resort-1.jpg → -2.jpeg → -3.jpeg (idx 0 dan 1 sama file karena data CMS Cliff Resort punya featuredImage sama dengan gallery[0] — bukan bug code).
- ✅ Screenshot setelah 2× swipe: hero jadi photo #3 (bedroom).

### A verified via compile + register
- ✅ `pnpm --filter cms generate:importmap` sukses. `importMap.js` line 32 + 85 register `/admin/GalleryBulkUpload#default`.
- ✅ `payload-types.ts` auto-regenerated (description Accommodations gallery ikut ter-update ke "max 10").
- ✅ CMS boot: dev server jalan (owner sudah menjalankannya), login page rendering normal → tidak ada build error dari component baru.
- ⏳ **End-to-end owner-verify masih tersisa** — assistant tidak boleh login (rule: entering passwords prohibited). Owner perlu:
  1. Login → `/admin/collections/accommodations/4`.
  2. Buka collapsible Media > Gallery — cek tombol "📥 Bulk upload (max 10, N left)" muncul di atas array.
  3. Klik → pilih 5 foto → verify 5 row baru append, existing row tetap.
  4. Save & reload → 5 foto persist.
  5. Coba pilih 12 foto (kalau slot < 10) → verify hanya sisa slot yang dipakai + toast warning.
  6. Cek Media collection: 5 doc baru dengan alt auto-derived.

---

## Rollback

Per-commit:
```
git revert 4b075d9   # B2 (frontend lightbox + swipe)
git revert 105a934   # A  (CMS bulk upload)
git revert a67ce91   # B1 (overflow-hidden)
```

Ketiganya independen, boleh di-revert selective.

## Impact

- **New npm dependency**: **none** (0 packages).
- **DB / schema migration**: none. `maxRows: 10` enforced di code, bukan schema.
- **Files touched**: 5 (+ 1 auto-regen types).
  - `apps/cms/src/admin/GalleryBulkUpload.tsx` (new, 165 lines).
  - `apps/cms/src/collections/Accommodations.ts` (+9/-1).
  - `apps/cms/src/app/(payload)/admin/importMap.js` (auto, +2 line).
  - `apps/web/src/pages/villa/[slug].astro` (+~110/-16).
  - `apps/web/src/components/gallery/PhotoLightbox.astro` (new, 175 lines).
  - `packages/shared/src/types/payload-types.ts` (auto, 1 desc line).

## Next — Rollout decision

Setelah owner validasi Part A end-to-end di CMS admin, decide:
1. **Rollout pattern A (bulk upload)** ke service lain yang punya `gallery` array serupa: Tours, WaterActivities, Yachts, Restaurants, Venues, Rentals, Spa. Kalau semua pakai shape `{image, caption}` sama, tinggal:
   - Register `galleryBulkUpload` ui field + `maxRows: 10` di masing-masing collection.
   - Component `GalleryBulkUpload.tsx` sudah generic — path `gallery` hardcoded, kalau ada field name lain perlu di-generalize.
2. **Rollout pattern B2 (lightbox + swipe)** ke halaman detail service lain yang punya hero bento serupa. Reuse `PhotoLightbox.astro` — id per-page (`tour-photos`, `yacht-photos`, dst).
3. **GalleryBlock.astro refactor** (dedupe lightbox) — opsional, skip untuk sekarang biar rendering di CMS pages tetap stabil.
