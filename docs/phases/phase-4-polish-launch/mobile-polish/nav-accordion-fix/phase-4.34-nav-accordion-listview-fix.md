# Phase 4.34 — NavAccordion List-View Auto-Expand Fix

**Date:** 2026-09-11
**Branch:** `feature/phase4-polish-launch`
**Commit:** `6f342a1`
**Scope:** CMS admin sidebar UX bugfix — single file + one-time preference reset

## Problem

Di halaman list-view koleksi CMS (mis. `http://localhost:3030/admin/collections/pages`),
grup sidebar yang memuat halaman aktif — **Content** untuk kasus Pages — muncul dalam
keadaan **collapsed** walau link Pages di dalamnya di-highlight sebagai aktif. Client
harus meng-klik grup manual untuk melihat isinya. Anehnya, di halaman detail view
(mis. `/admin/collections/pages/17`), grup **Content** auto-expand seperti seharusnya.

Perilaku yang diminta: saat client membuka list-view koleksi apapun, grup pemiliknya
harus otomatis terbuka — sama seperti detail-view.

## Root Cause

Dua faktor berlapis:

1. **Payload `DefaultNav` merender link koleksi/global aktif dalam dua bentuk berbeda**
   (`apps/cms/node_modules/@payloadcms/next/dist/elements/Nav/index.client.js:90-96`):
   - Saat `pathname === href` **eksak** (list-view koleksi) → `<div class="nav__link">`
     **tanpa atribut `href`**.
   - Selain itu (dashboard, detail-view, sibling collections) → `<a class="nav__link"
     href="…">`.

2. **`NavAccordion.tsx` (Phase 4.5–4.7) memfilter selector dengan `[href]`**
   ([apps/cms/src/admin/NavAccordion.tsx:31](../../apps/cms/src/admin/NavAccordion.tsx#L31)):
   ```js
   document.querySelectorAll<HTMLAnchorElement>('.nav-group .nav__link[href]')
   ```
   Filter ini secara tidak sengaja mengecualikan elemen `<div>` no-href yang justru
   merupakan penanda paling definitif bahwa link tersebut adalah halaman aktif. Akibatnya
   `findActiveGroup()` return `null` di list-view → tidak ada `toggle.click()` yang
   dipanggil → grup Content tetap collapsed.

Perilaku di detail-view tetap jalan karena pathname ≠ href → Payload render `<Link
href="…">` → `<a href>` → cocok dengan selector lama.

**Kondisi awal DB yang memperparah:** row `payload_preferences.key='nav'` untuk user 1
(id 15) dan user 3 (id 58) menyimpan **semua** 5 grup sebagai `open: false` — jadi
Payload SSR/initial render meng-collapse semua grup dari awal, sepenuhnya mengandalkan
`NavAccordion` untuk membuka yang aktif. Pollusi preferensi ini menumpuk dari perilaku
"single-open" Phase 4.5–4.7 yang menulis `open: false` ke preferensi setiap kali user
berpindah antar grup.

## Fix

### 1. `apps/cms/src/admin/NavAccordion.tsx` — perluas selector

Selector kini menerima semua `.nav-group .nav__link` (tanpa filter `[href]`). Elemen
tanpa `href` diperlakukan sebagai penanda aktif dengan bobot maksimal (`bestLen =
Number.POSITIVE_INFINITY`) — tidak boleh dikalahkan oleh href-match manapun. Elemen
dengan `href` dipertahankan logika lama (longest-prefix match) supaya detail-view dan
route bertingkat tetap resolve ke grup yang benar.

Perubahan minimal: 17 insertions / 2 deletions, satu fungsi (`findActiveGroup`), satu
file project-owned. Tidak menyentuh Payload core, tidak menambah package, tidak
mengubah schema. Perilaku single-open accordion (Phase 4.5–4.7) tetap.

### 2. One-time DB cleanup — reset row `payload_preferences.key='nav'`

Dua row dihapus (id 15 user 1, id 58 user 3):
```bash
node -e "const {createClient}=require('@libsql/client');(async()=>{const c=createClient({url:'file:cms.db'});const r=await c.execute(\"DELETE FROM payload_preferences WHERE key='nav'\");console.log('Deleted:',r.rowsAffected);})();"
```

Hasil: `Deleted rows: 2`. Setelah reset, Payload me-render semua grup expanded by default,
dan preferensi baru akan tersimpan lagi secara natural saat user meng-toggle grup.

Backup JSON kedua row disimpan di scratchpad session (`nav-prefs-backup.json`) sebelum
delete. Rollback data-only tersedia — lihat runbook di bawah.

## Verification

- **Manual test oleh owner (2026-09-11):**
  - `/admin/collections/pages` → grup Content auto-expand ✓
  - `/admin/collections/pages/17` → grup Content tetap terbuka ✓ (parity dengan perilaku
    Phase 4.5–4.7 lama)
  - Klik grup lain → single-open behavior tetap ✓
- Owner konfirmasi "sudah sesuai" sebelum commit.

## Runbook — Rollback

Jika perilaku baru mengganggu / regresi:

**A. Revert kode**
```bash
git revert 6f342a1
```

**B. Restore preferensi user 1 & 3 (opsional — hanya jika ingin kembali ke kondisi
"single-open + semua grup collapsed" seperti sebelum reset):**

Backup disimpan sementara di scratchpad session dan sudah tidak persistent lintas sesi.
Kalau perlu restore, format row-nya adalah (dari inspection sebelum delete):
- user 1 (id 15): `{"groups":{"Settings":{"open":false},"Administration":{"open":false},"Site Builder":{"open":false},"Services":{"open":false},"Content":{"open":false}},"open":true}`
- user 3 (id 58): `{"groups":{"Administration":{"open":false},"Settings":{"open":false}}}`

Namun secara umum **tidak disarankan restore** — preferensi akan terbentuk ulang
otomatis begitu user meng-toggle grup di UI, dan kondisi default expanded lebih ramah.

## Files Touched

- [apps/cms/src/admin/NavAccordion.tsx](../../apps/cms/src/admin/NavAccordion.tsx) —
  fungsi `findActiveGroup()`, perluas selector.

Runtime-only (bukan source):
- `apps/cms/cms.db` — row `payload_preferences.key='nav'` (2 row) di-delete.

## Related Phases

- Phase 4.5 — Sidebar Redesign (accordion, 3-zone layout) — memperkenalkan `NavAccordion`.
- Phase 4.6 → 4.7 — dashboard/sidebar refinement, tidak menyentuh `NavAccordion`.
- Phase 4.8 → 4.9 — page editor UX overhaul, orthogonal.

## Notes

- Payload version terinstal: `payload@^3.33.0`, `@payloadcms/ui@^3.33.0`,
  `@payloadcms/next@^3.33.0`. Perilaku `<div class="nav__link">` vs `<Link>` diverifikasi
  langsung di dist bundle Payload versi ini.
- Selector fix ini **defensif** terhadap upgrade Payload minor — bahkan kalau
  Payload nanti kembali render active-link sebagai `<a>` tanpa dropping href, logika
  baru tetap benar (karena elemen tanpa href hanya menang jika benar-benar tidak ada
  href).
