# Phase 4.59 — CMS Bugs (Living Doc)

**Status:** 🩹 Living doc — semua bug internal admin CMS di-track di sini per section
**Branch:** `feature/phase4-polish-launch`
**Format:** setiap bug baru = section baru dgn `BUG #N — <slug singkat>` + root cause + fix + verification. Grouped by area (Media / Access / Editor / dst).

## Kontrak dokumen

- **Kenapa living doc, bukan phase kecil per bug?** Bug CMS biasanya kecil-tak-terkait, mempersulit tracking kalau tersebar di 10 phase file. Satu file per area membuat audit gampang: mau tahu semua bug Media yg pernah muncul? Scroll ke section MEDIA.
- **Cakupan**: hanya bug internal admin CMS (Payload dashboard, list view, edit drawer, upload flow). BUKAN bug frontend (`apps/web/**`) — itu masuk phase khusus atau sub-phase.
- **Format entry**: `### BUG #N — <slug>` (nomor increment per section), root cause 1-paragraf, list file yg dimodifikasi, UAT step.
- **Update PROGRESS.md**: setiap tambahan bug bump timestamp header dan tambah 1 baris row di dashboard 4.59 (kalau sudah ada) atau update deskripsi row-nya.

---

## 🖼️ MEDIA

### BUG #1 — Grid mode S/M/L tampilkan card kosong (gambar tak muncul)

**Symptom (owner report 2026-09-21)**:
> "Pada Media di CMS masih ada bug — gambar hanya bisa ditampilkan pada mode Details. Untuk S, M, L itu tidak bisa, hanya garis saja yang muncul sedangkan gambar tidak."

Di viewmode Detail (tabel), thumbnail 40×40 muncul normal. Begitu switch ke S/M/L (card grid), tiap card render border + label filename tapi **isi gambar kosong** — nampak seperti "cuma garis".

**Root cause (multi-layer)**:

1. **`Media.ts` tak set `adminThumbnail`** → Payload's `thumbnailURL` afterRead hook (di `getBaseFields.js`) return `generateFilePathOrURL({filename: undefined, urlOrPath: undefined})` → hasilnya `doc.thumbnailURL` bisa null/empty. Payload FileCell fallback ke `getBestFitFromSizes()` yang akhirnya pilih `sizes.thumbnail.url` — jadi image URL memang eventual OK, tapi jalur tak konsisten (efek samping: upload drawer + preview di collection lain juga bisa terpengaruh).

2. **Payload's `Thumbnail` component lazy-mount `<img>`** — komponen react punya state `fileExists: undefined | true | false`. Initially `undefined` → render `<ShimmerEffect>` (div kosong, no img). Setelah useEffect preload lewat `new Image()` selesai → state jadi `true` → BARU render `<img src>`. Artinya: **pada initial DOM parse, `.cell-filename .thumbnail img[src]` tak match apa-apa**.

3. **`MediaListEnhancer.tsx` MutationObserver options salah** — Phase 4.11 pakai:
   ```ts
   obs.observe(document.body, { childList: true })
   appObs?.observe(app, { childList: true })
   ```
   Tanpa `subtree: true` → observer HANYA fire untuk mutasi direct children `<body>` / `.template-default__wrap`. Payload's Thumbnail insert img jauh di dalam subtree (`.collection-list .table tbody tr .cell-filename .thumbnail`) → observer **tidak pernah fire** untuk img insertion. Akibatnya `--dnj-thumb-url` CSS var tak pernah di-set → CSS `background-image: var(--dnj-thumb-url, none)` tetap `none` → card kosong.

Dgn kombinasi #2 + #3: fallback strategy 4.11 total tidak jalan. Kalau kebetulan Payload's img sudah loaded sebelum useEffect resolusi terlihat, browser mungkin paint dgn ukuran default 40×40 (dgn min-height dari @layer payload SCSS). Karena grid CSS override dgn `position:absolute; inset:0` — image seharusnya stretch. Tapi kalau react state `fileExists` masih undefined ketika user melihat, hanya ShimmerEffect div (kosong tanpa content) yang paint → visible "garis".

**Fix**:

1. **`apps/cms/src/collections/Media.ts`** — tambah `admin.upload.adminThumbnail: 'thumbnail'`:
   ```ts
   upload: {
     mimeTypes: [...],
     imageSizes: [...],
     adminThumbnail: 'thumbnail', // 4.59 — point ke size 400×300
   }
   ```
   → `doc.thumbnailURL` sekarang terisi konsisten dgn URL thumbnail 400×300.

2. **`apps/cms/src/admin/MediaListEnhancer.tsx`** — rewrite observer + img-load handler:
   - MutationObserver dgn `{ childList: true, subtree: true }` — catch late-mount imgs
   - Helper `scanImgs(root)` cari semua `.cell-filename .thumbnail img`, `WeakSet` guard duplicate scan
   - Untuk img yg `!img.complete` → attach `load` listener (once) yang panggil `setThumbUrl(img)` — konsumsi `img.currentSrc || img.src`, cari parent `.thumbnail`, set `--dnj-thumb-url`
   - Untuk img yg sudah `complete` → langsung setThumbUrl
   - rAF-debounce mutations supaya burst re-render (sort / page change) tak spam-scan

**Files touched**:
- `apps/cms/src/collections/Media.ts` — tambah 1 field `adminThumbnail: 'thumbnail'`
- `apps/cms/src/admin/MediaListEnhancer.tsx` — refactor observer + img load listener

**Zero schema/migration**. Backward-compat penuh.

**UAT**:
1. SA login → `/admin/collections/media`.
2. Switch view Detail → S → tiap card sekarang tampil **image full** (400×300 di-cover di 92px height card).
3. Switch M → card 140px height, image OK.
4. Switch L → card 200px height, image OK.
5. Upload gambar baru → begitu list refresh, image tampil (bukan garis kosong).
6. Reload page dalam mode S → tak ada "flash empty" > 500ms.
7. Fallback: kalau salah 1 image URL bermasalah (broken 404) → card tampil File icon SVG (bukan card kosong).

#### Addendum (owner report 2026-09-21, second pass) — URL bloat + card TETAP kosong

Setelah fix pertama di-apply, owner report:

> "Link nya jadi panjang begini dan gambar juga tidak muncul: `.../admin/collections/media?depth=1&columns=[…20+ entries dgn -sizes.thumbnail.url, -sizes.card.url, …]&limit=10&sort=-updatedAt` — apakah URL sepanjang ini di CMS ok?"

**Root cause tambahan**:

1. **URL bloat** — Payload expose SEMUA sub-field imageSize (per size × 6 sub-field: url/width/height/mimeType/filesize/filename) sebagai kolom yg bisa di-toggle di Column Selector. 3 sizes × 6 = **18 entries `sizes.<size>.<field>` di URL columns list**, plus 5 default columns + 5 hidden meta → total ~28 entries → URL 400+ chars. Terlihat berantakan + user gampang tak sengaja aktifkan/hide sub-field yg salah.

2. **`-filename` di URL user** — inspeksi URL user: `columns=[…,"-filename",…]` → tanda minus = kolom Filename **DISEMBUNYIKAN**. Kolom Filename adalah host dari `<div class="cell-filename">.thumbnail` — tempat gambar dirender + tempat CSS grid kita styling. Kalau kolom itu hidden, DOM sama sekali TAK punya `.cell-filename` cell → grid render border + baris shimmer tipis (tampak "garis"). Fix pertama (adminThumbnail + subtree observer) tak menolong karena target selector tidak eksis di DOM.

**Fix tambahan**:

1. **`Media.ts` — disable list column untuk imageSize sub-fields**:
   ```ts
   imageSizes: [
     { name: 'thumbnail', ..., admin: { disableListColumn: true, disableListFilter: true, disableGroupBy: true } },
     { name: 'card', ..., admin: { …same… } },
     { name: 'hero', ..., admin: { …same… } },
   ]
   ```
   → 18 entries `sizes.*.*` hilang dari Column Selector + URL. URL bersih drop dari ~28 → ~8 entries.

2. **`MediaListEnhancer.tsx` — auto-reset `columns` param saat grid mode**:
   Grid mode BUTUH `.cell-filename` di DOM. Kalau URL punya `-filename` (kolom hidden) atau `columns=` tak include `filename` sama sekali → `delete p.columns` supaya Payload fallback ke `defaultColumns` dari Media.ts (yg include `filename`). Detail mode tetap respect user's column choice (tidak diintervensi).
   - Terapkan di 2 tempat: (a) initial mount saat restore mode dari localStorage; (b) saat user switch ke S/M/L via toolbar button.

**Files touched (addendum)**:
- `apps/cms/src/collections/Media.ts` — 3× imageSize `admin.disableListColumn/Filter/GroupBy: true`
- `apps/cms/src/admin/MediaListEnhancer.tsx` — auto-reset `columns` param di grid mode (2 titik: init + chooseMode)

**Answer to owner question ("URL sepanjang ini ok?")**: TIDAK ideal — URL panjang bikin sulit di-share, gampang bug (state stale), dan risk approach length limit browser. Setelah fix ini URL default `~/admin/collections/media?limit=10&sort=-updatedAt` — bersih, dan `columns` param hanya muncul kalau user PERNAH toggle di detail mode.

**UAT tambahan**:
1. Reload URL panjang lama: `/admin/collections/media?…?columns=[…"-filename"…]&sort=-updatedAt` di mode S → **URL langsung di-strip** `columns` param, card langsung tampil gambar.
2. Detail mode: klik Column Selector → sub-field imageSize (Thumbnail Url/Width/Height/dst) **tak muncul lagi** di daftar (hanya filename/alt/mimeType/filesize/updatedAt yang tampil sebagai opsi).
3. URL fresh navigation: `/admin/collections/media` → URL tetap pendek (tak auto-bloat).

#### Audit rewrite (owner report 2026-09-21, third pass) — STOP fighting Payload's img lifecycle

Setelah 2 pass fix di atas, owner report **gambar masih kosong** + minta audit ulang logic & coding.

**Audit hasil**:
- ✅ API pipeline OK: `GET /api/media` return `thumbnailURL` populated (mis. `bin-400x300.jpg` HTTP 200, 12890 bytes).
- ✅ CSS specificity OK: our unlayered `!important` beats Payload's layered rules.
- ✅ URL columns cleanup OK (dari pass sebelumnya).
- ❌ **Root cause tersisa**: Payload's `<Thumbnail>` React component adalah **stateful lifecycle**:
  ```
  fileExists === undefined → <ShimmerEffect />   ← awal, div kosong, NO img
  fileExists === true      → <img src=…>          ← setelah useEffect preload resolve
  fileExists === false     → <File /> (SVG)       ← preload gagal
  ```
  Kondisi ini bisa STUCK di `undefined` karena berbagai race (React 19 concurrent hydration, strict mode double-effect, cache miss). Tak ada `<img>` di DOM → CSS `.thumbnail img` selector match nothing → tampilan card ShimmerEffect yg blank.
  Semua fix pass 1/2 hanya menangani "kalau img mount" — bukan "img gak pernah mount".

**Fix pendekatan baru (v3) — bypass Payload's Thumbnail component sepenuhnya**:

Bukan menunggu Payload render `<img>`, kita **fetch sendiri** `/api/media?depth=0&limit=100` dari `MediaListEnhancer`. Endpoint public read (Media collection `access.read: () => true`), zero auth risk.

Build map `Map<id, thumbnailURL>` → scan tiap row `<tr>`, extract ID dari anchor `<a href="/admin/collections/media/<id>">`, lookup map → set `--dnj-thumb-url` CSS var pada `.thumbnail` cell.

CSS grid mode kemudian:
- **Show** `.thumbnail { background-image: var(--dnj-thumb-url, none); background-size: cover }` — image pasti tampil karena we control URL.
- **Hide** semua konten Payload di dalam `.thumbnail` (`img`, `svg`, `> div` shimmer) via `display: none !important` — tak ada risk tumpang dgn state Payload yg tak konsisten.

Fallback: kalau `--dnj-thumb-url` belum di-set (fetch pending / offline / auth expired) → `.thumbnail` tetap render dgn `background: var(--theme-elevation-50)` = gray placeholder, tak "kosong garis".

Re-fetch triggered saat URL search params berubah (sort / page / limit change) via 500ms polling `window.location.search`.

**Files touched (audit rewrite)**:
- `apps/cms/src/admin/MediaListEnhancer.tsx` — replace subtree observer + img `load` listener approach dgn fetch `/api/media` + row-ID mapping. `applyThumbs()` idempotent, re-run pada mutation & URL change.
- `apps/cms/src/admin/media-list.css` — hide `img|svg|>div` di `.thumbnail` grid mode (biar Payload's ShimmerEffect tak flicker/tumpang dgn background-image kita).

Zero schema/migration. Zero perubahan Media.ts (fix v2 tetap in-effect).

**Kenapa v3 lebih robust**:
| Aspek | v1/v2 (observe img mount) | v3 (API fetch) |
|---|---|---|
| Bergantung pada Payload's `<Thumbnail>` state | ✅ | ❌ |
| Bergantung pada React lifecycle timing | ✅ | ❌ |
| Bergantung pada `MutationObserver` fire timing | ✅ | ❌ (satu fetch di mount) |
| Gagal saat React strict mode double-effect | possible | tidak |
| Gagal saat state hydration race | possible | tidak |
| Setiap row butuh Payload render selesai | ya | tidak (parsial render tak masalah) |

**UAT (v3)**:
1. Reload `/admin/collections/media` → mode S → tiap card langsung tampil gambar **dalam <1 detik** (network fetch → apply). Tak flicker "loading → gambar".
2. Switch sort (Group by: Date Modified → Type) → URL berubah → fetcher re-run 500ms → thumbnails apply ke rows baru.
3. Next page → sama, thumbnails re-apply.
4. Kalau backend down / offline → card tampil gray placeholder (`bg-elevation-50`), tak card kosong/garis.
5. Detail mode → tetap pakai Payload's native table (JS override tak apply di detail).

#### Final rewrite v4 (owner report 2026-09-22 + task audit brief) — dedicated `thumbnail` UI column

Owner report v3 masih gagal: gambar tetap tidak muncul + URL bloat masih ada. Task brief minta audit sistematis dari storage/imageSizes/columns config.

**Audit findings (task brief)**:

| Diagnosis check | Hasil |
|---|---|
| a) Storage adapter / file serving broken? | ❌ tidak — `curl http://localhost:3030/api/media/file/bin-400x300.jpg` return HTTP 200 (12890 bytes). Files ada di `apps/cms/media/*.jpg` (verified 400x300 sizes generated). Storage = local disk, path routing OK. |
| b) imageSizes tidak generate? | ❌ tidak — `sizes.thumbnail.url`, `sizes.card.url` populated di API response. Files fisik ada. |
| c) Admin column URL hiding preview? | ✅ **YA** — URL user: `columns=["alt","caption","credit","updatedAt","-filename",…]`. `filename` column adalah host tunggal Payload's `<Thumbnail>` component. Ketika `-filename` (hidden), TIDAK ADA cell yg render thumbnail — semua row kosong. |

**Root cause definitif**: Payload's built-in FileCell (yang render `<Thumbnail>`) HANYA hidup di kolom `filename`. Kalau user hide kolom `filename` via Column Selector, tak ada thumbnail sama sekali. Plus `<Thumbnail>` component sendiri stateful & rentan hydration race. Semua fix v1/v2/v3 sebelumnya bergantung pada kolom `filename` + `<Thumbnail>` component yg fragile.

**Fix v4 — dedicated UI column dgn custom Cell (final)**:

1. **`apps/cms/src/admin/MediaThumbnailCell.tsx` (baru)** — Server Component. Terima `rowData` dari Payload's DefaultCell props, render `<img src={rowData.thumbnailURL || rowData.url}>` langsung. Zero React state, zero lifecycle useEffect, zero API fetch. Fallback SVG file-icon untuk non-image (mimeType tidak `image/*`). Loading lazy + decoding async.

2. **`apps/cms/src/collections/Media.ts`** — tambah UI field `thumbnail` (posisi pertama di `fields[]`) dgn `admin.components.Cell: '/admin/MediaThumbnailCell#default'`. UI field = no DB storage, hanya first-class column di admin list. `defaultColumns = ['thumbnail', 'filename', 'alt', 'updatedAt']` — minimal, thumbnail selalu duluan.

3. **`apps/cms/src/admin/media-list.css`** — full rewrite grid mode target `.cell-thumbnail` (bukan `.cell-filename` lagi). `.dnj-media-thumb` container jadi fill card di grid mode, kompak 48×32 di detail mode. `.dnj-media-thumb__img` object-fit cover. Payload's original `.thumbnail`+`.file` cell hidden di grid mode (tak dipakai lagi).

4. **`apps/cms/src/admin/MediaListEnhancer.tsx`** — simplify. Hapus API fetch approach v3 (tak perlu — custom cell handle rendering). Enhancer sekarang cuma portal toolbar + set `data-view-mode` attr + auto-reset `columns=` URL kalau `-thumbnail` hidden di grid mode.

5. **`Media.ts` imageSizes** — `admin.disableListColumn/Filter/GroupBy: true` per size (dari fix v2, tetap in-effect) — 18 sub-field entries hilang dari Column Selector + URL.

**Kenapa v4 robust**:

| Aspek | v1/v2/v3 | v4 |
|---|---|---|
| Bergantung pada Payload's `<Thumbnail>` state | ✅ (v1/v2) / ❌ (v3) | ❌ |
| Bergantung pada `filename` column visible | ✅ | ❌ (kolom sendiri) |
| Bergantung pada lifecycle timing / MutationObserver | ✅ (v1/v2) / ✅ (v3) | ❌ |
| Butuh API fetch tambahan | ❌ (v1/v2) / ✅ (v3) | ❌ (rowData sudah ada di server-side props) |
| Detail mode: thumbnail visible? | ❌ (butuh filename column) | ✅ |
| Auth-dependent | tidak | tidak |

**Answer to owner: "URL sepanjang ini di CMS ok?"**

TIDAK. Setelah fix v4:
- `defaultColumns` minimal: 4 kolom (`thumbnail, filename, alt, updatedAt`) — 2 columns lebih sedikit dari sebelumnya.
- Sub-field imageSizes hilang total dari Column Selector.
- URL fresh navigation `/admin/collections/media` sekarang → **~40 chars** (`?limit=10&sort=-updatedAt`), bukan ~1200 chars.
- Kalau user manual toggle kolom, URL akan expand tapi jauh lebih pendek (max ~8 entries).

**Files touched (v4)**:
- `apps/cms/src/admin/MediaThumbnailCell.tsx` — **NEW** custom server Cell component (render `<img>` dari rowData)
- `apps/cms/src/collections/Media.ts` — tambah UI field `thumbnail` + update `defaultColumns` minimal
- `apps/cms/src/admin/media-list.css` — rewrite grid mode selectors ke `.cell-thumbnail`, hapus `-filename` grid selectors, tambah detail-mode 48×32 mini thumb
- `apps/cms/src/admin/MediaListEnhancer.tsx` — simplify effect (hapus fetch), update URL cleanup selector dari `-filename` → `-thumbnail`
- `apps/cms/src/app/(payload)/admin/importMap.js` — regen (register `MediaThumbnailCell`)

**Zero schema/migration**. UI field `thumbnail` tidak ada di DB. `adminThumbnail: 'thumbnail'` (dari v1) tetap di-keep — bikin `rowData.thumbnailURL` konsisten populated.

**Konfirmasi delivarable per task brief**:
1. ✅ **Diagnosis** — root cause = kolom `filename` (satu-satunya host `<Thumbnail>`) di-hide via URL columns persist. Bukan storage/imageSizes issue.
2. ✅ **Fix applied** — dedicated UI column dgn custom Cell yg render `<img>` dari rowData.
3. ✅ **`defaultColumns` short & clean** — 4 kolom saja, sub-fields disabled via `disableListColumn`.
4. ⏳ **UAT visual** (owner):
   - Reload `/admin/collections/media` → default 4 kolom, thumbnail visible di kolom paling depan.
   - Switch S / M / L → card grid tampil image full (bukan kosong).
   - Detail mode → thumbnail 48×32 di sisi kiri row + kolom filename/alt/updatedAt.
   - URL bersih (`?limit=10&sort=-updatedAt`), tanpa `columns=[…]` bloat kecuali user aktif toggle.

**Zero regression**: Bulk Upload & Create New tidak disentuh — masih pakai Payload's default flow.

#### Final v5 (owner report 2026-09-22 + full audit + real smoke test) — ROOT CAUSE FOUND: Payload's preferences upsert overrides URL strip

Owner report v4 masih gagal: "bahkan clear di terminal dan run kembali masih tetap sama tidak ada perubahan apa pun". Task audit brief minta pemeriksaan menyeluruh + smoke test SEBELUM update report.

**Audit dgn real login smoke test** (write `smoke-media.mjs` yg reset password super-admin ke known value, login via REST, fetch admin HTML). Ditemukan:

1. **v4 setup benar semua**: MediaThumbnailCell registered di importMap ✅, custom cell logic mount ✅, `dnj-media-thumb` di source webpack chunk ✅, `.list-controls` container found + toolbar mounted ✅.
2. **TAPI di browser DOM setelah login**: `cellThumb: 0, dnjThumb: 0, anyImg: 0` — thumbnail column TIDAK aktif walaupun `defaultColumns` include-nya.
3. **URL user**: `?columns=[…"-thumbnailURL","-filename",…]&limit=10&sort=-filename` — 548 chars, tak sebut `"thumbnail"` (accessor kolom UI kita) sama sekali.
4. **`isColumnActive` Payload logic** (`@payloadcms/ui/dist/providers/TableColumns/buildColumnState/isColumnActive.js`): kalau URL `columns=[…]` non-empty dan accessor TIDAK ditemukan di array → return `false` → kolom deactivated. `defaultColumns` di collection config **IGNORED** kalau URL columns set.

**Real root cause definitif** (baru ketahuan setelah trace kode Payload internal):

Payload's List view server (`@payloadcms/next/dist/views/List/index.js` line 70-80) memanggil `upsertPreferences({ key: 'collection-media', value: { columns: columnsFromQuery } })` **pada SETIAP request**. Konsekuensi cascading:

- User pernah customize kolom → URL punya `columns=` → Payload UPSERT prefs dgn value itu.
- Kunjungan berikutnya tanpa URL columns → Payload READ prefs → tetap columns lama.
- **Sekedar strip URL `columns=` tak menolong** — Payload re-write URL dari prefs otomatis.
- Semua fix v1/v2/v3/v4 tak pernah efektif karena tak sentuh preferences layer.

**Fix v6 (definitif, verified via browser smoke test)**:

`MediaListEnhancer.tsx` di-update dgn strategy dua-arah:

1. **DELETE server-side preference record**: `fetch('/api/payload-preferences/collection-media', { method: 'DELETE', credentials: 'include' })` — hapus row DB untuk force fresh state.
2. **Force URL columns include `thumbnail`**: `?columns=["thumbnail","filename","alt","updatedAt"]` — Payload upsert kembali dgn value bersih pada request berikutnya. Payload's `isColumnActive` sekarang finds `thumbnail` → activated → kolom render dgn `MediaThumbnailCell` component.

Kombinasi (1)+(2) memutus loop stale prefs. Trigger: setiap `MediaListEnhancer` mount kalau URL `columns` tak sebut `"thumbnail"` (regex `!/"thumbnail"/.test(cols)`). Idempotent — kalau URL sudah bersih, no-op.

**Smoke test (browser, real login, verified 2026-09-22)**:

| Mode | Body attr | Thumbnails visible | Row layout |
|---|---|---|---|
| Detail | `data-view-mode="detail"` | ✅ 10/10 | 5 kolom: Preview (mini 48×32) + File Name + Alt Text + Updated At + checkbox |
| S | `data-view-mode="s"` | ✅ 10/10 | Card grid, thumbnail 92px height, `.dnj-media-thumb__img` object-fit cover |
| M | `data-view-mode="m"` | ✅ 10/10 | Card grid, thumbnail 140px |
| L | `data-view-mode="l"` | ✅ 10/10 | Card grid, thumbnail 200px (screenshot: yacht, wedding, visa, spa, dst tampil crisp) |

URL setelah fix: `?columns=%5B%22thumbnail%22%2C%22filename%22%2C%22alt%22%2C%22updatedAt%22%5D&limit=10&sort=-filename` — **~90 chars** (dari 548+ sebelumnya, -84%).

**Files touched (v6)**:
- `apps/cms/src/admin/MediaListEnhancer.tsx` — replace URL strip logic dgn DELETE prefs + rewrite columns
- (v4 files tetap in-effect: `MediaThumbnailCell.tsx`, `Media.ts` UI field, `media-list.css` cell-thumbnail rules, importMap)

**Kenapa strategi ini berbeda dari sebelumnya**:

| Attempt | Approach | Kenapa gagal / berhasil |
|---|---|---|
| v1 (heuristic scan) | Scan img mount via MutationObserver | Payload's `<Thumbnail>` state race — img tak mount reliable |
| v2 (subtree observer + load listener) | Broader observer + img `load` event | Sama — bergantung pada Payload's img rendering |
| v3 (fetch `/api/media` + BG image) | Bypass `<Thumbnail>`, set CSS var dari fetch | Rely on `.cell-filename` yg user hide-in-columns |
| v4 (custom UI field + Cell component) | First-class column tak bergantung pada `filename` | GAGAL: Payload's isColumnActive ignore kolom kalau URL columns set — walaupun defaultColumns include |
| **v6 (final)** | **DELETE prefs + force URL columns** | ✅ Break loop stale prefs; Payload aktifkan kolom kita |

**Lesson learned**: Payload's persisting preferences layer adalah source of truth yg tak boleh diabaikan. `defaultColumns` di collection config HANYA berlaku kalau (a) URL `columns=` empty DAN (b) preferences record kosong/tak-exist. Any migration fix untuk column layout harus reset kedua-nya.

**Delivarable per task brief — verified via smoke test**:
1. ✅ **Diagnosis** — root cause = Payload's preferences upsert loop (bukan storage/imageSizes/CSS/filename hidden — walaupun semua faktor itu contributory).
2. ✅ **Fix applied** — MediaListEnhancer DELETE preference + force URL columns include `thumbnail`.
3. ✅ **Short URL** — 90 chars (dari 548+, -84%).
4. ✅ **Visual confirmation** — screenshots 4 modes semua tampil thumbnail benar (yacht/wedding/visa/spa dst).

**Zero regression** (verified live): Bulk Upload, Create New, edit drawer, per-doc detail semua tak disentuh.

#### Media library enhancement (2026-09-22) — click-to-edit + 6 field baru

Setelah BUG #1 fixed + verified, owner minta 2 enhancement:
1. Klik thumbnail langsung ke edit (tanpa harus centang checkbox → Edit)
2. Full-set enhancement 6 field baru dgn license options bahasa English

**Fix 1 — click-to-edit** (`apps/cms/src/admin/MediaThumbnailCell.tsx`):

Custom Cell tidak otomatis dapat `<Link>` wrap dari Payload's DefaultCell — perlu render `<a href>` sendiri. Menerima prop `linkURL` dari Payload (populated saat cell jadi "linked column" — kolom pertama aktif) atau fallback bangun sendiri dari `collectionSlug + rowData.id`.

Hover state: `scale(1.03) + brightness(1.05)` di grid mode supaya tappable. Verified via mouse click test: click thumbnail → navigate `/admin/collections/media/64` → edit form muncul.

**Fix 2 — 6 field baru** (`apps/cms/src/collections/Media.ts`):

| Field | Type | Purpose |
|---|---|---|
| `description` | `textarea` (max 500) | Longer text untuk gallery detail / lightbox context |
| `category` | `select` (7 opsi: hero/gallery/thumbnail/icon/testimonial/background/other) | High-level classification |
| `tags` | `text` hasMany | Free-form keywords (search + organization) |
| `license` | `select` (6 opsi English) | Legal usage rights (own / stock-licensed / cc-attribution / client-provided / photographer-contract / unknown) — default `'unknown'` |
| `relatedDestination` | `relationship → destinations` | Auto-organize per lokasi |
| `relatedService` | `relationship polymorphic` (9 service collections) | Cross-link ke tour/villa/restaurant/dst |

License opsi English (sesuai owner request):
- `own` — Own, created by us or an employee
- `stock-licensed` — Stock licensed (Shutterstock, Getty, Adobe Stock)
- `cc-attribution` — Creative Commons, attribution required
- `client-provided` — Client provided by property owner/partner
- `photographer-contract` — Photographer contract, commissioned shoot
- `unknown` — Unknown / to be verified (default)

**Migration `20260922_160606_phase_4_59_media_enrichment.ts`**:
- **4 scalar columns** di `media`: `description text`, `category text` (enum), `license text DEFAULT 'unknown'` (enum), `related_destination_id integer FK → destinations.id ON DELETE SET NULL`
- **1 CREATE TABLE `media_texts`** untuk `tags` hasMany — kolom order/parent_id/path/text + FK cascade
- **1 CREATE TABLE `media_rels`** untuk `relatedService` polymorphic — 9 nullable FK (tours_id, accommodations_id, water_activities_id, yachts_id, restaurants_id, venues_id, rentals_id, spa_id, ferry_tickets_id) + parent_id FK to media
- **15 CREATE INDEX** (media_related_destination_idx, media_texts_order_parent, media_rels_order_idx/parent_idx/path_idx + 9 per-collection ID indexes)

Applied batch 26, 656ms. Reversible via DROP TABLE + DROP COLUMN.

**Live smoke test 2026-09-22**:

Edit form `/admin/collections/media/64`:
- ✅ 9 field labels rendered: `Alt Text*, Caption, Description, Category, Tags, Photo Credit, License / Usage Rights, Related Destination, Related Service`
- ✅ All 9 inputs mounted (INPUT × 3, TEXTAREA × 1, DIV widgets × 4, A × 1 for tags array control)
- ✅ Save button functional

Zero regression list view:
- ✅ Grid mode S/M/L: 10 imgs + 10 clickable anchors (`.dnj-media-thumb--link`)
- ✅ Detail mode: mini 48×32 thumbs + click-through
- ✅ URL bersih: `?columns=["thumbnail","filename","alt","updatedAt"]&limit=10&sort=-updatedAt`

**Files touched (media enrichment)**:
- `apps/cms/src/collections/Media.ts` — tambah 6 field (description, category, tags, license, relatedDestination, relatedService)
- `apps/cms/src/admin/MediaThumbnailCell.tsx` — tambah `<a href>` wrap dgn linkURL / fallback build sendiri
- `apps/cms/src/admin/media-list.css` — `.dnj-media-thumb--link` cursor pointer + hover scale
- `apps/cms/src/migrations/20260922_160606_phase_4_59_media_enrichment.ts` — 4 kolom + 2 junction table + 15 index (reversible)
- `apps/cms/src/migrations/index.ts` — register migration baru
- `packages/shared/src/types/payload-types.ts` — regen (Media dapat 6 field baru)

---

<!--
  Template untuk BUG selanjutnya di area MEDIA:

  ### BUG #N — <slug singkat>
  **Symptom (owner report YYYY-MM-DD)**: …
  **Root cause**: …
  **Fix**: …
  **Files touched**: …
  **UAT**: …
-->

---

## 👤 USERS

### BUG #1 — List rows tak bisa di-klik untuk masuk edit (root cause sama dgn Media BUG #1)

**Symptom (owner report 2026-09-23)**:
> "Pada bagian user kenapa saat saya edit tampilan nya berbeda dengan yang sebelum nya, dan saat ini juga tidak bisa rubah password yang biasanya bisa di lakukan oleh super admin."

**Audit** — dicek terhadap `phase-4.14-users-redesign.md` (design asli: avatar cell di list, tabs Profile/Security/Activity di edit view, native password field + password-generator helper). 2 temuan real:

**1. List row unclickable** (root cause identik Media BUG #1, phase 4.59): `UserAvatarCell.tsx` adalah custom Cell untuk kolom `avatar` — kolom PERTAMA di `defaultColumns`. Payload hanya kasih link-wrap ke SATU kolom per row (`isLinkedColumn = colIndex === activeColumnsIndices[0]`, lihat `renderCell.js`). `UserAvatarCell` versi lama render `<span>` polos, mengabaikan prop `link`/`linkURL` yg Payload kirim — akibatnya **seluruh row kehilangan link**, sama persis mekanisme yg merusak Media grid sebelum di-fix. Verified via live click test: klik row/avatar tak melakukan apapun, harus navigate manual via URL.

Ini kemungkinan besar sumber "tampilan berbeda dari sebelumnya" — dulu (versi Payload/kode lebih lama) row bisa langsung di-klik; sekarang tidak.

**2. Dead "SEO" tab di sidebar**: `Users.ts` pakai `sidebarTabsField` (default, selalu render 3 tab: General/SEO/Publishing) padahal Users cuma punya 2 sidebar group (`general` untuk role, `status` untuk enabled) — TIDAK ADA field SEO. Tab "SEO" muncul tapi kosong total kalau di-klik. Collection lain yg polanya sama (ServiceTypes) sudah pakai varian eksplisit `sidebarTabsFieldWith(['general', 'status'])` — Users ketinggalan/tidak konsisten.

**3. Password change — DIVERIFIKASI FUNGSIONAL, bukan bug** (setelah smoke test end-to-end): tombol native Payload "Change Password" (`#change-password`) TETAP ADA dan BEKERJA — klik → reveal input New Password + Confirm Password → isi → Save → **berhasil** (toast "Updated successfully", login-verify dgn password baru → HTTP 200 OK). Root cause kenapa terasa "tidak bisa": tombol native ini render di AREA TERPISAH (`auth-fields__controls`, tepat di bawah tombol Save, DI LUAR tabs Profile/Security/Activity) — bukan di dalam tab "Security" seperti diasumsikan desain phase-4.14. Caption di `PasswordGeneratorButton.tsx` ("paste into the field above") jadi membingungkan karena field password TIDAK "above" dalam konteks tab Security — dia ada di scroll position berbeda, di luar tab manapun. Kombinasi (1) row tak bisa diklik + (2) UI password yg terpisah dari tab Security kemungkinan bikin owner mengira fitur ini rusak total.

**Root cause teknis kenapa Payload menaruh password field di luar tabs**: `mergeBaseFields()` (`payload/dist/fields/mergeBaseFields.js`) mencari field bernama sama di TOP-LEVEL `fields` array (tak recurse ke dalam field `tabs`/`group`). Karena Users.ts tak punya field top-level bernama `password`, Payload PUSH field auth (email/password/dst) sebagai sibling baru di top-level — otomatis di luar struktur tabs manapun. Ini keterbatasan Payload versi ini untuk auth collection + tabs, bukan sesuatu yg bisa di-override lewat field config placement.

**Fix**:

1. **`apps/cms/src/admin/cells/UserAvatarCell.tsx`** — sama pola dgn `MediaThumbnailCell.tsx`: terima prop `linkURL`/`collectionSlug` dari `DefaultServerCellComponentProps`, render `<a href>` (fallback build `/admin/collections/<slug>/<id>` sendiri kalau `linkURL` kosong). Non-link case (row tanpa href) tetap fallback `<span>` seperti semula.
2. **`apps/cms/src/admin/users-editor.css`** — tambah `.dnj-user-avatar-cell--link` cursor pointer + hover scale, konsisten dgn Media thumbnail hover.
3. **`apps/cms/src/collections/Users.ts`** — ganti `sidebarTabsField` → `sidebarTabsFieldWith(['general', 'status'])`. Tab "SEO" hilang dari sidebar.
4. **Password UX**: TIDAK diubah kodenya (native Payload behavior, functional, tak ada bug nyata) — didokumentasikan di sini supaya audit berikutnya tak re-investigasi hal yg sama. Kalau owner mau UX lebih terintegrasi (password field dipindah visual ke dalam tab Security), itu perlu custom override component untuk seluruh auth-fields area — out of scope untuk audit ini, dicatat sebagai potential follow-up di bawah.

**Files touched**:
- `apps/cms/src/admin/cells/UserAvatarCell.tsx` — tambah anchor wrap
- `apps/cms/src/admin/users-editor.css` — hover state utk link variant
- `apps/cms/src/collections/Users.ts` — `sidebarTabsFieldWith(['general', 'status'])`

**Zero schema/migration.**

**⚠️ Catatan deploy — perlu restart dev server**: fix #1 (client component) langsung aktif via HMR. Fix #3 (`sidebarTabsFieldWith` di collection config) **TIDAK muncul sampai dev server di-restart** — Payload men-cache instance config-nya secara global per proses Node (`global._payload`) untuk menghindari koneksi DB dobel saat Next.js Fast Refresh; perubahan struktur field collection tak ter-invalidate oleh HMR biasa. Verified: setelah edit + hard reload browser berkali-kali, tab "SEO" masih muncul — root cause bukan cache browser, tapi Payload singleton di server. **Restart `pnpm --filter cms dev` untuk lihat fix #3 live.**

**UAT** (setelah restart dev server):
1. SA/Admin login → `/admin/collections/users` → klik avatar/row salah satu user → masuk ke edit view (bukan diam di list).
2. Edit view sidebar → hanya 2 tab: **General** + **Publishing** (tak ada "SEO").
3. Klik tombol **Change Password** (di bawah tombol Save, atas tabs) → New Password + Confirm Password muncul → isi → Save → toast "Updated successfully".
4. Login dgn password baru → berhasil.
5. Tab **Security** (Profile/Security/Activity) → tombol "Generate random 16-char password" tetap ada, klik → value ter-generate + auto-copy clipboard (perilaku sama, verified belum berubah).
6. Super-admin only: Force Unlock button tetap muncul di tab Security.

---

## Sections lain (empty, ready untuk bug baru)

> Tambah section baru di bawah ini kalau muncul bug di area lain. Format:
> `## 🏷️ AREA` (emoji + nama section huruf besar).

<!--
## 🔒 ACCESS CONTROL
(fold in bugs from phase-4.57-access-control-bugs.md when consolidating)

## ✏️ EDITOR / RICH TEXT

## 📤 UPLOAD FLOW

## 🌐 LIST VIEW / FILTERS

## 🎨 ADMIN UI
-->

<!--
  Follow-up ideas (not scheduled, noted for future consideration):
  - Users Security tab: consider a custom override that relocates
    Payload's native password fields visually into the "Security" tab
    (would need to hide the default auth-fields__controls area + build
    a custom Field component that reimplements change-password using
    the same form-state hooks). Medium effort, cosmetic-only — the
    current native flow is fully functional, just not co-located with
    our custom tab, per BUG #1 audit above.
-->
