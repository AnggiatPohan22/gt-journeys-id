## Phase: 4.23 — Stat Banner Cleanup + 2-Theme System
**Tanggal**: 2026-09-01
**Status**: ✅ **COMPLETE** — Part A + Part B merged to `feature/phase4-polish-launch`, SQLite schema pushed, Theme 1 & Theme 2 both verified rendering on web dev
**Dikerjakan oleh**: Claude Code
**Branches**:
- `fix/stat-banner-cleanup` → merged into `feature/phase4-polish-launch` (commit `ea31379`, merge `7e95d7a`)
- `feature/stat-banner-themes` → merged into `feature/phase4-polish-launch` (commit `73f25d4`, merge `72e43ec`)
- Semua tertahan di `feature/phase4-polish-launch` sampai Phase 4 selesai — **belum di-merge ke `main`** (sesuai keputusan owner)

### Ringkasan
1. Diagnosis penyebab Stat Banner "berantakan" (grid hardcoded 4-col, angka & heading sama besar, icon lari kiri).
2. Part A: surgical fix — dynamic grid by item count, angka 2× lebih besar dari heading, icon centered, editorial dividers.
3. Part B: field `theme` per-instance di CMS (`theme-1` default = Editorial Grid = Part A baseline; `theme-2` = Feature Cards glass-on-dark).
4. Post-merge: audit dan fix CMS 500 error (schema push tidak jalan otomatis karena dev sudah running) — kolom `theme` ditambahkan manual ke 9 collection table via ALTER TABLE. DB backup: `apps/cms/cms.db.bak-4.23-pre-theme`.

---

## Part A — Audit & Root-Cause Diagnosis

### Component & config
| Peran | Path |
|---|---|
| Frontend component | [apps/web/src/components/blocks/StatsBannerBlock.astro](../../apps/web/src/components/blocks/StatsBannerBlock.astro) |
| CMS block config | [apps/cms/src/blocks/index.ts:686-727](../../apps/cms/src/blocks/index.ts) (const `StatsBanner`, slug `statsBanner`) |
| Block group (admin) | Marketing |
| Renderer wiring | [apps/web/src/components/blocks/BlockRenderer.astro](../../apps/web/src/components/blocks/BlockRenderer.astro) |
| Home fallback data | [apps/web/src/pages/index.astro:57-105](../../apps/web/src/pages/index.astro) (`D_STATS`, `fallbackStats`) |

### Current fields
- `eyebrow` — text (default: "Why Choose Us")
- `heading` — text, required (default: "Your Journey is Our Priority")
- `items` — array, `minRows: 2`, `maxRows: 6` — each item:
  - `iconName` — icon picker (Iconify, Phase 4.19)
  - `value` — text (contoh: "1000+", "24/7", "50+")
  - `caption` — text (label di bawah value)
- `backgroundImage` — upload (subtle bg, opacity 10 di frontend)
- Advanced tab: padding/alignment/container/entryAnimation + textStyle
  (background group sengaja di-filter out — kolisi kolom `background_image_id`)

### Diagnosed issues

| # | Symptom | Root cause (file:line) | Item counts affected |
|---|---|---|---|
| A1 | Grid pincang / cell kosong / row terakhir sepi | `grid-cols-2 md:grid-cols-4` hardcoded di [StatsBannerBlock.astro:53](../../apps/web/src/components/blocks/StatsBannerBlock.astro) padahal CMS izinkan 2-6 items | 2, 3, 5, 6 (hanya 4 yang pas) |
| A2 | Icon tidak center walau text center | `<div class="inline-flex mb-4">` tanpa `justify-center`/mx-auto — icon nempel kiri saat align.text = center | Semua |
| A3 | Angka besar kalah dominan vs heading | Value pakai `text-3xl md:text-4xl` — **sama besar** dengan heading di [line 49](../../apps/web/src/components/blocks/StatsBannerBlock.astro). Number seharusnya jauh lebih besar dari label untuk hierarki visual stat block | Semua |
| A4 | Alignment default tidak explicit-center | `resolveAlignment(b.contentAlignment)` — kalau CMS tidak set contentAlignment, `align.text` bisa kosong/left. Stat items rely on parent's text-align untuk center | Semua instance tanpa contentAlignment |
| A5 | Mobile: 5 items → 2/2/1 (item terakhir sendirian, off-center) | Kombinasi A1 + auto-grid fill | 3, 5 items on mobile |
| A6 | Icon size fixed w-12 h-12 tanpa scale responsif — dominan di mobile, kecil di desktop | Hardcoded utility di [line 57](../../apps/web/src/components/blocks/StatsBannerBlock.astro) | Semua |
| A7 | Tidak ada divider/visual separator antar stat — items terlihat "melayang" di area gelap ocean | By design saat ini, tapi memperparah persepsi "berantakan" ketika count ganjil | Semua |
| A8 | Interaksi dengan spacing v2 (Phase 4.22) OK — block pakai `paddingClass` via `resolvePadding` — **bukan** penyebab messiness | — | — |

**Root cause utama (yang paling terlihat sebagai "berantakan"):** A1 + A3 + A2.
A1 menciptakan grid pincang, A3 menghilangkan hierarki visual angka-vs-label
sehingga block terlihat "datar & tidak selesai", A2 membuat icon lari kiri.

### Pages currently using Stat Banner
Hasil grep `statsBanner` di `apps/web/src/pages`:

| Lokasi | Pemakaian |
|---|---|
| [apps/web/src/pages/index.astro:44,99](../../apps/web/src/pages/index.astro) | Homepage fallback (4 items dari `D_STATS`) — juga path CMS `home?.stats` |

Selain homepage, block tersedia di Page Builder (CMS) untuk semua Pages —
belum diketahui berapa page instance real yang sudah pakai. **Perlu quick
audit di CMS admin** sebelum Part A fix di-apply: jalankan query Payload
Pages → block content dengan `blockType: 'statsBanner'` untuk daftar
lengkap page slug + item count.

---

## Part B — Proposed Plan (pending approval)

### B.1 Requirements yang dikunci
1. **Exactly 2 tema**, dipilih per-instance via field `theme` di CMS.
2. Kedua tema **harus menyelesaikan Part A root-cause**, bukan sekadar
   duplikasi layout berantakan ke "theme-2".
3. Existing instances tidak boleh crash — `defaultValue` explicit + backward
   compatible (field lama dipertahankan).
4. Ikut konvensi Phase 4.15 (`cardVariant` di ServiceGrid) & Phase 4.16
   (`template` di ServiceGrid): single component + conditional class/subtree.

### B.2 Dua tema yang diusulkan

#### Theme 1 — "Editorial Grid" (perbaikan langsung dari layout sekarang)
Visual direction: **stat besar center-aligned, dipisah divider vertikal
tipis**, terkesan editorial/majalah.

- Icon: `w-8 h-8` di atas value, center via `mx-auto` (fix A2 & A6)
- Value: `font-display text-5xl md:text-6xl font-bold` — 2× lebih besar dari heading (fix A3)
- Caption: `text-xs md:text-sm uppercase tracking-widest text-white/70`
- Divider: `border-l border-white/15` antar item (kecuali item pertama tiap row) — memberi ritme visual (fix A7)
- Background: tetap `bg-ocean` + optional bg image opacity 10 (kompatibel)
- Cocok untuk: homepage / landing page brand yang formal

#### Theme 2 — "Feature Cards" (arah visual baru, lebih casual)
Visual direction: **setiap stat dalam card kecil** dengan icon di kiri +
value/caption di kanan (2-col mini per card), background sand/coral accent.

- Card: `rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6` (glass on dark) — atau `bg-sand text-stone` kalau section pakai bg light (auto-detect via bg-classes)
- Layout item: `flex items-start gap-4` — icon di kolom kiri `w-14 h-14 rounded-xl bg-coral/15 text-coral p-3`, teks di kolom kanan (value + caption stack)
- Value: `font-display text-3xl md:text-4xl font-bold`
- Caption: `text-sm text-white/70` (atau `text-stone/70` di light)
- Cocok untuk: service detail page / section yang butuh feel modern-friendly, atau saat brand ingin push accent color

**Perbedaan konkret:** Theme 1 memaksimalkan angka (numbers as hero),
Theme 2 memaksimalkan card structure (stats as feature list).

### B.3 Solusi grid pincang (berlaku untuk KEDUA tema — fix A1)

Ganti `grid-cols-2 md:grid-cols-4` dengan **grid dinamis berdasarkan
`items.length`**:

| Item count | Mobile | Tablet | Desktop |
|---|---|---|---|
| 2 | grid-cols-2 | grid-cols-2 | grid-cols-2 |
| 3 | grid-cols-1 | grid-cols-3 | grid-cols-3 |
| 4 | grid-cols-2 | grid-cols-2 | grid-cols-4 |
| 5 | grid-cols-1 | grid-cols-2 → last centered / atau flex-wrap justify-center | grid-cols-5 |
| 6 | grid-cols-2 | grid-cols-3 | grid-cols-3 (2 rows) atau grid-cols-6 |

Implementasi: helper `getStatGridClass(count: number)` di
[apps/web/src/lib/blockStyles.ts](../../apps/web/src/lib/blockStyles.ts) atau
inline di component. Untuk count ganjil (3, 5), gunakan `justify-items-center`
di parent + `place-content-center` supaya row terakhir tidak "sepi".

### B.4 Responsive breakpoint per tema
- **Theme 1 (Editorial Grid)**: divider vertikal hilang di mobile
  (`md:border-l` only), stack ke row baru saat count > 2 di mobile.
- **Theme 2 (Feature Cards)**: card tetap card di semua breakpoint; grid
  merapat jadi 1 kolom di mobile untuk count > 3.

### B.5 Field sharing
Kedua tema **pakai field yang persis sama** (`iconName`, `value`, `caption`).
Tidak ada field baru per-tema — hanya field selector `theme`. Ini konsisten
dengan pola `cardVariant` di ServiceGrid (Phase 4.15).

### B.6 Schema change proposal (butuh approval — masuk kategori Section 11)

Tambahan field di [apps/cms/src/blocks/index.ts](../../apps/cms/src/blocks/index.ts) `StatsBanner`:

```ts
{
  name: 'theme',
  type: 'select',
  defaultValue: 'theme-1',       // ← default: Editorial Grid
  options: [
    { label: 'Editorial Grid (big numbers + dividers)', value: 'theme-1' },
    { label: 'Feature Cards (icon-left card style)', value: 'theme-2' },
  ],
  admin: {
    description: 'Visual style. Dipilih per-instance. Ganti tanpa mengubah data items.',
  },
}
```

**Default decision yang perlu dikonfirmasi owner:**
`theme-1` (Editorial Grid) → existing instances (homepage + page mana pun
yang pakai block ini) otomatis me-render dengan Editorial Grid. Karena Part A
memang mem-fix layout messy jadi Editorial Grid look, ini pilihan yang paling
"aman-tapi-berubah" — visual sudah pasti berubah dari sekarang, tidak ada
opsi "identik dengan versi sekarang" (unlike Phase 4.22 spacing).

Alternative yang bisa dipertimbangkan: default `theme-2` (Feature Cards)
kalau owner lebih suka feel modern-friendly. **Keputusan ini di tangan
owner — tolong pilih.**

**DB impact (per docs/DB-SCHEMA-CHANGES.md):**
- Column baru: `pages_blocks_stats_banner_theme` (text) — di bawah 63 char.
- Pada `pnpm dev` CMS pertama setelah field ditambahkan, Drizzle akan prompt
  `+ create column theme` — jawab **create** (bukan rename).
- Tidak ada enum overflow risk.

### B.7 File yang berubah (Part B, kalau di-approve)

| File | Perubahan |
|---|---|
| `apps/cms/src/blocks/index.ts` | Tambah field `theme` di block `StatsBanner` (lines 686-727) |
| `apps/web/src/components/blocks/StatsBannerBlock.astro` | Refactor: baca `block.theme`, split render menjadi 2 branch (theme-1 / theme-2). Fix grid dinamis. Fix icon centering. |
| `apps/web/src/lib/blockStyles.ts` | (opsional) Helper `getStatGridClass(count)` |
| `packages/shared/types/payload-types.ts` | Auto-regenerate setelah CMS schema push (bukan manual edit) |
| `docs/phases/phase-4.23-stat-banner-audit.md` | Update sub-section "Implementation notes" post-code |
| `docs/PROGRESS.md` | Tambah entry 4.23 |

**Pola component: single-file dengan conditional subtree**, bukan split ke
`StatsBanner/Theme1.astro` + `Theme2.astro` — alasan: konvensi existing
`ServiceGridBlock.astro` (Phase 4.15/4.16) pakai single-file conditional,
2 tema tidak cukup kompleks untuk butuh file split, dan menghindari duplikasi
Advanced tab wiring (align/padding/entry animation/text style).

### B.8 Rollout plan (mengikuti Phase 4.8/4.9 pattern)

1. **Approval owner** untuk:
   - Kedua arah visual (Theme 1 & Theme 2)
   - Default value (`theme-1` atau `theme-2`)
   - Schema change (`theme` field baru)
2. **Cut branch** `feature/stat-banner-themes` (terpisah dari
   `fix/stat-banner-cleanup` — Part A surgical fix, kalau di-approve juga)
3. **Implement** field + component refactor
4. **Local verify** di homepage (fallback data 4 items) — Astro dev + CMS dev
5. **Trial pada 1-2 page** di CMS admin — screenshot Theme 1 dan Theme 2
6. **Owner review** — konfirmasi mana page yang mau assigned Theme 1 vs
   Theme 2 (jangan biarkan semua stuck di default silent)
7. **Batch assign** theme value ke existing instances via CMS admin (manual)
8. **Full rollout** — build 50 pages, deploy web

### B.9 Interaksi dengan Part A surgical fix
Kalau owner setuju Part A dulu (branch `fix/stat-banner-cleanup`) tanpa
theme selector, fix akan mem-refactor rendering saat ini jadi persis
**Theme 1** (Editorial Grid). Kemudian Part B tinggal menambah field `theme`
+ branch untuk Theme 2 — Theme 1 sudah jadi baseline.

Rekomendasi urutan: **Part A dulu → merge → Part B**. Rasional: Part A
bug-fix murni (satu concern), Part B feature baru (satu concern). Sesuai
Section 12 "Keep commits focused on one concern".

---

### Impact (audit stage — belum ada perubahan)
- **Database**: none (belum). Kalau Part B di-approve: 1 kolom baru
  `pages_blocks_stats_banner_theme` (text).
- **CMS**: none (belum). Kalau approved: 1 field `theme` di block `statsBanner`.
- **Frontend**: none (belum). Kalau approved: refactor `StatsBannerBlock.astro`.
- **Routes**: none.
- **RBAC**: none.

### Testing (belum dijalankan — no code changes)
- [ ] Verifikasi CMS admin — daftar semua page yang pakai `statsBanner` +
      item count masing-masing (perlu owner / manual query)
- [ ] Trial Theme 1 di 1 page (post-approval)
- [ ] Trial Theme 2 di 1 page (post-approval)
- [ ] Astro build 50 pages green
- [ ] Responsive check: mobile 375, tablet 768, desktop 1440

### Rollback
Tidak ada perubahan kode → tidak ada rollback yang perlu dilakukan untuk
laporan ini. Kalau nanti Part A/B implemented:
- Part A: `git revert <commit>` di branch `fix/stat-banner-cleanup`
- Part B: `git revert <commits>` + `ALTER TABLE ... DROP COLUMN theme` di D1
  (setelah verifikasi tidak ada data non-default)

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.23-stat-banner-audit.md` (file ini — baru)
- [x] `docs/PROGRESS.md` (entry 4.23 ditambahkan)
- [ ] `docs/03-CONTENT-MODEL.md` — update saat Part B implemented (field baru)
- [ ] `docs/02-DATABASE-SCHEMA.md` — update saat Part B implemented (kolom baru)

### Next Steps
**Owner approvals sudah masuk (2026-09-01):**
1. ✅ Theme 1 (Editorial Grid) & Theme 2 (Feature Cards) — approved
2. ✅ Default = `theme-1`
3. ✅ Schema change (kolom `theme`) — approved
4. ✅ Urutan: Part A → merge → Part B (all ke `feature/phase4-polish-launch`, bukan `main`)

**Implementasi selesai + finalisasi (post-merge audit):**
- ✅ Part A: [StatsBannerBlock.astro](../../apps/web/src/components/blocks/StatsBannerBlock.astro) di-refactor, verified di dev (4-item, heading 30px vs value 60px, dividers on items 1-3, icons centered)
- ✅ Part B: field `theme` ditambahkan di [apps/cms/src/blocks/index.ts](../../apps/cms/src/blocks/index.ts) `StatsBanner`, component branch on `block.theme` → Theme 2 render sebagai icon-left glass cards
- ✅ Types regenerated: `packages/shared/src/types/payload-types.ts` include `theme?: 'theme-1' | 'theme-2' | null`
- ✅ **SQLite schema pushed** (manual via ALTER TABLE): kolom `theme text DEFAULT 'theme-1'` ditambahkan pada 9 tabel — `{pages,tours,accommodations,water_activities,yachts,restaurants,venues,rentals,spa}_blocks_stats_banner`. Backup DB: `apps/cms/cms.db.bak-4.23-pre-theme`.
- ✅ **CMS API health verified**: 11/11 collection endpoint respond 200 (sebelum fix: 5/11 return 500 karena Drizzle SELECT column yang tidak ada di DB).
- ✅ **Theme 1 verified rendering** — homepage `/` di web dev menampilkan markup `md:border-l md:border-white/15` + `font-display text-4xl md:text-5xl lg:text-6xl` (Editorial Grid).
- ✅ **Theme 2 verified rendering** — sementara flip 1 block ke `theme='theme-2'` di DB, homepage menampilkan `rounded-2xl bg-white/5 backdrop-blur` + `font-display text-3xl md:text-4xl font-bold leading-none` (Feature Cards); di-reset kembali ke `theme-1` setelah verify.

### Root cause 500 error (post-merge audit)
Payload/Drizzle **hanya menjalankan schema push saat CMS start/restart** — bukan pada file save. Karena CMS dev sudah running saat block config diedit, hot-reload me-regenerate `payload-types.ts` tapi **tidak** push schema baru ke SQLite. Akibatnya code baru me-request `SELECT theme` dari tabel yang belum punya kolom itu → error `SQLITE_ERROR: no such column: theme` yang di-mask jadi generic 500 "Something went wrong".

**Fix yang di-apply:** manual `ALTER TABLE "<t>" ADD COLUMN "theme" text DEFAULT 'theme-1'` untuk 9 tabel via one-shot script (script sudah dihapus setelah run). Kolom name = `theme` (5 char), full table+col = `pages_blocks_stats_banner_theme` = 31 char — sama untuk prod deploy nanti, tidak melewati 63-char Postgres/D1 limit.

**Lesson (calon update di `docs/DB-SCHEMA-CHANGES.md`):** setelah menambah field di block/collection config, **restart CMS dev** — jangan andalkan hot-reload untuk push schema. Kalau CMS tidak boleh direstart, fallback: ALTER TABLE manual + verify column presence via `PRAGMA table_info(...)`. Symptom "500 di beberapa collection saja" adalah tanda field baru cuma di code, belum di DB.

**Sisa (post-Phase 4.23, opsional — bukan blocker):**
- Owner assign `theme` per existing page instance via CMS admin (mana yang mau Theme 2). Semua default aman di `theme-1` = Part A baseline, jadi tidak ada page yang broken kalau tidak di-touch.
- Prod deploy (Phase 5): CMS dideploy fresh → Payload push schema otomatis ke D1. Kalau in-place upgrade, jalankan `wrangler d1 execute cms-db --command "ALTER TABLE ..."` dengan 9 ALTER yang sama, atau restart CMS Worker cukup (belum diverifikasi di prod path).
