# Phase 4.49 — Site Features Modul Layanan registry + ServiceTypes backfill

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** 2 file: `SiteFeatures.ts` refactor ke registry array + `serviceTypes.ts` backfill missing keys. Zero schema/migration/payload-types change.

## Motivasi (owner report)

Dua bug ditemukan setelah pemakaian:

1. **Description Modul Layanan** di CMS masih tulis "Master on/off untuk **8** modul layanan utama" — padahal aslinya ada 9 (Ferry Tickets ditambah setelah phase awal). Owner ingin **auto-count** supaya kalau ada modul baru ditambah, SA tak perlu update description manual + jelas modul apa yang di-cover.

2. **Ferry Tickets tidak muncul di frontend footer** (kolom services auto) meski toggle Site Features → Modul Layanan → Ferry Tickets sudah dicentang. Bug consistency antara SiteFeatures dan konsumsi frontend.

## Root cause

### Bug 1
`SiteFeatures.ts` hardcode 5 row × 2 checkbox (9 checkbox total) + description string statis "8 modul" — nomor statis lupa di-update saat ferryTickets ditambah.

### Bug 2
`getResolvedServiceTypes()` fetch ServiceTypes CMS dengan `where[status][equals]=active`. Kalau ServiceType record untuk `ferry-tickets` **belum di-seed** (baru ditambah setelah launch) atau status-nya `draft`/`archived`, list yang dikembalikan tanpa Ferry Tickets. Fallback `modules.ts` hanya dipakai kalau CMS list KOSONG total (`res.docs.length > 0` = take CMS path fully). Konsumsi frontend (footer services column) langsung pakai list itu → Ferry Tickets hilang meski SiteFeatures ON.

## Fix

### 1. `SiteFeatures.ts` — single registry array

Ganti hardcode 5 row × 2 checkbox jadi:

```ts
const SERVICE_MODULES = [
  { name: 'tours',            label: 'Tours & Activities' },
  { name: 'accommodations',   label: 'Villas & Hotels' },
  { name: 'waterActivities',  label: 'Water Activities' },
  { name: 'yacht',            label: 'Private Yacht' },
  { name: 'restaurants',      label: 'Restaurants' },
  { name: 'weddings',         label: 'Weddings & Events' },
  { name: 'rentals',          label: 'Rental Service' },
  { name: 'spa',              label: 'Spa & Wellness' },
  { name: 'ferryTickets',     label: 'Ferry Tickets' },
] as const

const moduleRowFields = (): Field[] => { /* 2-per-baris auto */ }
```

Description tab pakai template literal: `` `Master on/off untuk ${SERVICE_MODULES.length} modul layanan utama.` ``. Sekarang otomatis (`9` di sini). Group description tambah note: "Terdaftar {N} modul; menambah modul baru = 1 entry di SERVICE_MODULES registry di globals/SiteFeatures.ts."

**Cara tambah modul di masa depan:** cukup tambah 1 baris di `SERVICE_MODULES`, rows + description auto-update. Zero risk lupa update angka.

### 2. `serviceTypes.ts` — backfill missing keys

Refactor `getResolvedServiceTypes()` supaya merge fallback modul untuk key yang **missing di CMS**:

```ts
const cmsKeys = new Set(fromCms.map((s) => s.key))
const backfill = fallback
  .filter((s) => !cmsKeys.has(s.key))
  .map((s, i) => ({ ...s, order: cmsMaxOrder + i + 1 }))
cache = [...fromCms, ...backfill].sort((a, b) => a.order - b.order)
```

Behavior:
- CMS `ferry-tickets` ada + active → tampil sesuai order CMS.
- CMS `ferry-tickets` tidak ada (belum seed) atau `draft`/`archived` → backfill dari `modules.ts` fallback (label + slug hardcoded) di akhir list.
- Full CMS error → fallback murni (perilaku existing tidak berubah).

Metadata rich (deskripsi, hero image, WA per-service) tetap hanya datang dari CMS. Backfill entry punya minimum viable info (name/slug/icon) — cukup untuk footer / nav / homepage listing.

**Filter Site Features (Phase 4.48.2)** di FooterRenderer tetap berlaku di atas list ini — kalau modul di-off, tetap hilang. Kalau modul ON tapi ServiceType belum ada → sekarang tampil (bukannya hilang lagi).

## Non-impact

- Zero schema / migration.
- Payload-types.ts tidak berubah (`SERVICE_MODULES` const local + `moduleRowFields()` helper — hanya restructure, bukan tambah field baru).
- Konsumen `getResolvedServiceTypes()` lain (homepage service listing, service card grid) juga otomatis dapat backfill — konsisten.
- Kalau SA memang **sengaja** archived Ferry Tickets dan berharap hilang, sekarang backfill akan tetap tampilkan-nya. Mitigasi: nonaktifkan via **SiteFeatures.modules.ferryTickets** (yang sekarang berlaku ke footer via Phase 4.48.2, dan ke sidebar/URL via Phase 4.37).

## Files touched

- **Modified:** `apps/cms/src/globals/SiteFeatures.ts`, `apps/web/src/lib/serviceTypes.ts`
- **New:** `docs/phases/phase-4.49-site-features-registry-and-service-backfill.md`

## UAT checklist

1. CMS → Settings → Pengaturan Fitur → tab **Modul Layanan** → description sekarang **"Master on/off untuk 9 modul layanan utama"**.
2. Group description: "Terdaftar **9** modul; menambah modul baru = 1 entry di SERVICE_MODULES registry di globals/SiteFeatures.ts."
3. 9 checkbox tetap ter-render sama (5 baris × 2, baris ke-5 hanya Ferry Tickets full-width) — layout visual identik.
4. Pastikan **Ferry Tickets** toggle checked → Save.
5. Frontend footer (kolom services auto): kalau ServiceType `ferry-tickets` belum di-seed di CMS, sekarang Ferry Tickets tetap tampil (backfill dari `modules.ts`).
6. Non-aktifkan Ferry Tickets di SiteFeatures → Save → refresh → hilang (filter Phase 4.48.2 aktif).
7. Aktifkan lagi → tampil kembali.

## Follow-up (opsional)

- Roll out backfill juga ke `enabledModulesAsync()` / `getEnabledServiceTypes()` helper baru — sekarang belum ada konsumen lain yang butuh. Aman ditunggu.
- Seed script untuk ServiceType records lengkap 9 modul (biar production DB terisi, backfill jadi fallback saja). Bisa follow-up phase.
