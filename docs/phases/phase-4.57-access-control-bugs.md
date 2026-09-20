# Phase 4.57 — Access Control Bugs (Living Document)

**Status:** 🔨 In progress (living doc — add new BUG entries di bawah setiap kali ditemukan)
**Branch:** `feature/phase4-polish-launch`
**Scope:** Bug hak akses (RBAC) — Super Admin / Admin / Editor visibility & permission.

> Phase ini sengaja dibuat **living document**: setiap kali ditemukan bug baru
> soal hak akses (menu bocor ke role yang tidak berhak, section muncul walau
> modul di-disable, dll.), tambahkan sebagai **BUG #N** di bawah dengan format
> yang sama. Jangan buat phase baru — cukup update file ini.

---

## BUG #1 — Service Grid render meski Service Type disabled di SiteFeatures

**Reported:** 2026-09-19
**Reporter:** Owner
**Severity:** medium (UX / brand consistency)
**Status:** ✅ Fixed

### Gejala

> "Service Type yang tidak di aktifkan oleh Super Admin itu tidak muncul di
> block atau di manapun seperti block Service Grid, biar tidak ambigu jadi
> client tahu hanya service yang mereka request yang ada."

Block `Service Grid` di halaman CMS tetap mencoba fetch & render item walau
modul-nya di-uncheck di `Settings → Pengaturan Fitur → Modul Layanan`. Kalau
collection modul itu kosong, block-nya tampil dengan heading + "no items"
placeholder — bikin client bingung karena menu-nya sudah di-hide di header/
footer tapi section di homepage/page custom masih muncul.

### Root cause

`ServiceGridBlock.astro` fetch item via `getTours()` / `getAccommodations()` /
dst. tanpa gate ke `SiteFeatures.modules[key]`. Header/footer/homepage-listing
sudah pakai `enabledModulesAsync()` — tapi block Service Grid tidak.

### Fix

- `apps/web/src/lib/features.ts` — tambah helper `isServiceTypeEnabled(key)`
  dengan reverse map dari service-type slug (`water-activities`, `yachts`, …)
  ke `ServiceModule` enum yang dipakai `SiteFeatures.modules`.
- `apps/web/src/components/blocks/ServiceGridBlock.astro` — panggil helper
  sebelum render dan gate seluruh template dengan `!moduleActive ? null : …`.
  Efek: kalau modul di-off di Super Admin, section tidak muncul sama sekali
  (nol whitespace, nol placeholder).

### Catatan

- Cache `getFeatures()` di lib/features.ts sudah bypass di dev
  (`import.meta.env.DEV`), jadi toggle di CMS langsung tercermin tanpa
  restart Astro.
- Block **Service Listing** (Editorial + Immersive) belum diberi guard yang
  sama — mereka biasanya dipakai di landing page per-modul yang sudah 404
  kalau modul off, tapi kalau owner sengaja masukin block itu ke custom page
  scenario-nya sama. Kalau nanti ketemu, tambah sebagai BUG di file ini.

---

## BUG #2 — Menu "Chat Widget" bocor ke Admin & Editor

**Reported:** 2026-09-19
**Reporter:** Owner
**Severity:** medium (privacy / security — config channel + API key ref)
**Status:** ✅ Fixed

### Gejala

> "Untuk Chat Widget hanya Superadmin yang bisa melakukan edit, sehingga admin
> dan editor tidak dapat melihat menu ini, menurut saya di hidden kan saja
> secara visual nya."

Global `Chat Widget` (`slug: chat-widget`) tampil di sidebar admin CMS untuk
semua role. Access-nya sudah `update: isSuperAdmin` (Admin/Editor tidak bisa
save perubahan), tapi menu-nya masih terlihat dan mereka bisa buka form-nya
— termasuk melihat env var name untuk API key, security rules, blocklist, dll.

### Root cause

`ChatWidgetSettings.admin` tidak set `hidden`. Pola yang benar sudah dipakai
`SiteFeatures` (`hidden: ({ user }) => user?.role !== 'super-admin'`).

### Fix

`apps/cms/src/globals/ChatWidgetSettings.ts` — tambah
`admin.hidden: ({ user }) => user?.role !== 'super-admin'`. Menu hilang
seluruhnya dari sidebar untuk role selain super-admin; access-layer tetap
menolak update sebagai defense-in-depth.

### Catatan

- Ini murni visual (Payload admin sidebar). API `/api/globals/chat-widget`
  tetap `read: () => true` supaya frontend bisa fetch tanpa auth — itu
  disengaja: konfigurasi widget = public rendering data.
- Kalau nanti owner mau juga hide global lain (mis. Site Features sudah
  di-hide, tapi ada yang lain sensitif), pakai pola yang sama dan catat di
  BUG baru di bawah.

---

## Template untuk BUG baru

Copy blok ini saat tambah entry:

```markdown
## BUG #N — <judul singkat>

**Reported:** YYYY-MM-DD
**Reporter:** <owner / nama>
**Severity:** low | medium | high
**Status:** 🔨 In progress | ✅ Fixed | ⏸ Deferred

### Gejala
<quote / deskripsi>

### Root cause
<penjelasan>

### Fix
<file path + perubahan singkat>

### Catatan
<edge case, follow-up>
```
