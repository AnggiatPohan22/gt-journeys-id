## Phase: 4.61.8 — Fix Bug Ticket Filter & Search Template Width
**Tanggal**: 2026-09-29
**Status**: Diagnosis Selesai (READ-ONLY) — menunggu approval untuk apply fix
**Dikerjakan oleh**: Claude Code

### Ringkasan
`ServiceListingTicketSearch.astro` (Template 2 baru) render kartu search/filter
tetap **sempit** di md/desktop, sedangkan `ServiceListingHeroImmersive.astro`
(Template 1) tampil lebar dengan benar. Investigasi mengidentifikasi bahwa
rantai lebar bergantung pada `<form>` dengan class chain
`max-w-lg md:max-w-6xl lg:max-w-[1360px] mx-auto`. Root cause paling mungkin:
**pola arbitrary/responsive Tailwind di file baru tidak reliabel** (JIT cache
dev-server yang stale karena file masih untracked, atau conflict cascade
karena `max-w-lg` unconditional sekelas dengan `md:max-w-6xl` sehingga urutan
CSS bisa bervariasi). Solusi paling robust: scoped CSS `.tsh-form` di `<style>`
block, tidak bergantung ke JIT scan.

---

### 1. Side-by-side Width Chain

| Level | ServiceListingHeroImmersive (Template 1 — WORKS) | ServiceListingTicketSearch (Template 2 — BUG) |
|-------|--------------------------------------------------|-----------------------------------------------|
| **Layout** `PageLayout.astro` | `<main>` tanpa max-width | idem |
| **BlockRenderer wrapper** (BlockRenderer.astro:73) | `<div class="flex flex-col block-stack">` — tidak ada max-w | idem |
| **`<section>`** | `class="relative bg-sand"` — full width | `class="relative bg-sand"` — full width |
| **Booking outer `<div>`** | line 328: `relative z-20 mx-auto px-4 -mt-14 md:-mt-16` **+ `containerClass`** (default = `w-full max-w-5xl px-4 sm:px-6 lg:px-8`) → **cap 5xl (1024px)** | line 336: `relative z-20 mx-auto px-4 -mt-14 md:-mt-16 w-full` — **TIDAK pakai `containerClass`**, tidak ada max-w |
| **Card / form container** | line 329: `<div class="max-w-5xl mx-auto bg-white/95 ...">` — static max-w-5xl (redundant vs parent) | line 337: `<form class="max-w-lg md:max-w-6xl lg:max-w-[1360px] mx-auto">` — responsive chain |
| **Inner variant div** | (n/a, single layout) | line 573: `<div class="hidden md:block ... p-5 lg:p-6 w-full">` — hanya isi 100% form |

**Perbedaan kunci**: Template 1 memakai wrapper `containerClass` (Tailwind class statis, sudah pasti ada di CSS bundle karena dipakai puluhan block lain) untuk cap lebar. Template 2 mengalihkan cap ke `<form>` dengan class **arbitrary + responsive** yang baru muncul di file untracked.

### 2. Parent chain audit
- `PageLayout.astro:30-32` — hanya `<main><slot/></main>`, no width.
- `BlockRenderer.astro:73` — wrapper flex-col, no width.
- `BlockRenderer.astro:91` — `case 'serviceListing'` dispatch ke `<ServiceListingBlock>`; jika `spacingOverride` aktif dibungkus `<div style="margin-top/bottom">` (no width).
- `ServiceListingBlock.astro:24` — pilih template berdasarkan `layout === 'ticket-search'` + `TICKET_SEARCH_LEGACY` env.
  - `TICKET_SEARCH_LEGACY` **tidak** diset di env (verified: tidak ada `.env` override). Yang render = `ServiceListingTicketSearch.astro` (baru). **Bukan** kasus "wrong template rendering".

Tidak ada ancestor yang meng-clamp width. Confirmed via inspection.

### 3. `resolveContainer()` (lib/blockStyles.ts:45–52)
```
'full'   → 'w-full px-4 sm:px-6 lg:px-8'
'wide'   → 'w-full max-w-7xl px-4 sm:px-6 lg:px-8'
'narrow' → 'w-full max-w-3xl px-4 sm:px-6 lg:px-8'
default  → 'w-full max-w-5xl px-4 sm:px-6 lg:px-8'   ← Template 1 pakai ini
```

Template 2 **sengaja skip** `containerClass` di wrapper booking form (line 336) supaya bisa lewat cap 5xl. Bagus untuk niat, tapi pengganti (`max-w-lg md:max-w-6xl lg:max-w-[1360px]` di form) tidak reliabel.

### 4. Tailwind version & class generation
- **Versi**: Tailwind v3 via `@astrojs/tailwind` (astro.config.mjs:2,18).
- **Config**: `apps/web/tailwind.config.mjs`, content = `./src/**/*.{astro,...}`.
- `max-w-6xl` = static token, pasti tergenerate.
- `lg:max-w-[1360px]` = arbitrary JIT — tergenerate hanya kalau content scanner menemukan literal string di file yang diindex.
- File `ServiceListingTicketSearch.astro` masih **untracked** (git status: `??`). Tailwind v3 JIT via astro dev-server watch **seharusnya** deteksi file baru, tapi jika dev server dijalankan sebelum file dibuat + tidak di-restart, arbitrary class bisa hilang dari CSS bundle sampai restart.
- **Tidak ada dev/build output** di repo untuk diverifikasi via grep.

### 5. Custom CSS / cascade override
- `apps/web/src/styles/global.css` — grep `^form|^\.form|^section` → **0 match**. Tidak ada global rule yang meng-override.
- `<style>` block di `ServiceListingTicketSearch.astro:874-900` — hanya `.tsh-slider`, `.no-scrollbar`, `[x-cloak]`. Tidak ada yang menyentuh form/max-width.
- **Cascade risiko**: `max-w-lg` (unconditional) dan `md:max-w-6xl` di Tailwind v3 memiliki specificity yang sama. `md:` wins hanya jika di-emit **setelah** `max-w-lg` di CSS output. Ini bergantung urutan yang dihasilkan Tailwind — biasanya media queries selalu belakangan, tapi kalau ada CSS layers / stale build cache, aturannya bisa terbalik.

---

### Root Cause (paling mungkin)
**(a) Class not generated / not scanned reliably** — kombinasi:
1. File baru masih untracked; jika dev server tidak di-restart, `lg:max-w-[1360px]` (arbitrary) mungkin hilang dari CSS bundle.
2. Fallback ke `md:max-w-6xl` seharusnya jalan, tapi karena `max-w-lg` di class chain sama specificity-nya, ada risiko cascade order pas dev-cache warm.

**Evidence bahwa "class ada di CSS":** user melaporkan mengedit wrapper class di DevTools DOES widen the card. Artinya beberapa class max-w-* memang tersedia di stylesheet. Tapi belum tentu spesifik `md:max-w-6xl` / `lg:max-w-[1360px]` yang efektif menang cascade di kondisi user.

**Bukan (b) parent clamp**: rantai parent bersih.
**Bukan (d) wrong template**: dispatcher benar, LEGACY env off.
**Bukan (c) custom CSS**: tidak ada override di global.css.

---

### Proposed Minimal Fix (belum di-apply, tunggu approval)

Ganti responsive-Tailwind di `<form>` dengan **scoped CSS class `.tsh-form`** di `<style>` block yang sudah ada. Tidak mengubah struktur, tidak menyentuh cell layout, tidak menyentuh mobile card.

**File**: `apps/web/src/components/blocks/ServiceListingTicketSearch.astro`

Diff:
```diff
@@ line 336-337
-  <div class="relative z-20 mx-auto px-4 -mt-14 md:-mt-16 w-full">
-    <form method="get" class="max-w-lg md:max-w-6xl lg:max-w-[1360px] mx-auto">
+  <div class="relative z-20 mx-auto px-4 -mt-14 md:-mt-16 w-full">
+    <form method="get" class="tsh-form mx-auto">
```

Tambahan di `<style>` block (setelah line 877 `.no-scrollbar`):
```css
/* Round 7 (Phase 4.61.8) — pindahkan width chain dari Tailwind
   responsive class ke scoped CSS. Alasan: max-w-lg + md:max-w-6xl
   + arbitrary lg:max-w-[1360px] tidak reliabel di JIT dev cache
   untuk file yang baru dibuat. Scoped CSS = deterministik. */
.tsh-form { width: 100%; max-width: 32rem; }         /* mobile: ~max-w-lg */
@media (min-width: 768px)  { .tsh-form { max-width: 72rem; } }   /* md: ~max-w-6xl */
@media (min-width: 1024px) { .tsh-form { max-width: 1360px; } }  /* lg: custom */
```

**Kenapa robust**:
- Scoped `<style>` di Astro component → di-scope otomatis + selalu ter-bundle terlepas dari Tailwind scan.
- Explicit `@media` beats any Tailwind cascade ambiguity.
- Mempertahankan niat original comment (mobile 32rem, md 72rem, lg 1360px).
- Tidak menyentuh cell layout, mobile variant, atau Alpine state.

### Testing (setelah fix di-apply)
- [ ] Buka halaman ferry-tickets di viewport ≥ 1024px → card lebar (≤1360px, hampir full lebar container 1360)
- [ ] 768–1023px (md/tablet) → card lebar ~72rem, cell tidak truncate
- [ ] < 768px (mobile) → card tetap max 32rem, tidak berubah
- [ ] Legacy env `TICKET_SEARCH_LEGACY=1` → template lama tetap render (tidak terpengaruh)

### Rollback
Revert diff di atas — 2 baris class change + block `.tsh-form` di `<style>`.

### Dokumentasi yang Perlu Diupdate (setelah apply)
- [ ] `docs/PROGRESS.md` — tambah entri Phase 4.61.8
- [ ] `docs/phases/phase-4.61.7-ticket-search-template.md` — tambah note "width bug fixed in 4.61.8"

### Next Steps
Menunggu approval user untuk apply diff di atas.
