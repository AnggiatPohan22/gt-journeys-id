# Phase 4.37 — Site Features Module Toggle Enforcement

**Status:** ✅ Code complete · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Access-control patch on 9 service collections + 1 new helper. Zero schema change, zero migration, zero payload-types change.

## Motivasi

Owner report: toggle **Settings → Pengaturan Fitur → Modul Layanan** (Global `site-features`) di-set OFF untuk sebagian modul, tapi koleksinya **masih muncul di sidebar** dan **masih bisa dibuka** oleh admin/editor. Fitur ini tidak jalan sesuai kontraknya.

Audit menemukan akar masalahnya: 9 service collection (Tours, Accommodations, WaterActivities, Yachts, Restaurants, Venues, Rentals, Spa, FerryTickets) semua memakai `access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete }` — **tidak pernah mengintip `site-features.modules[key]`**. Global-nya hanya jadi checkbox untuk frontend (`isModuleEnabled` di `apps/web/src/lib/features.ts`); sisi CMS-nya bocor.

Payload otomatis menyembunyikan koleksi dari sidebar admin ketika user tidak punya `access.read` → satu-satunya hook yang perlu dipatch adalah `access.*`. `admin.hidden` tidak menerima `req`/`payload` → tak bisa fetch global; jalur access lebih tepat.

## Perubahan

### New helper — [`apps/cms/src/access/moduleAccess.ts`](../../apps/cms/src/access/moduleAccess.ts)

Factory `moduleAccess(moduleKey)` mengembalikan `{ read, create, update, delete }` yang seragam:

```ts
export const moduleAccess = (key: ServiceModuleKey) => ({
  read:   moduleRead(key),
  create: moduleCreate(key),
  update: moduleUpdate(key),
  delete: moduleDelete(key),
})
```

Kontrak:

| Caller | read | create | update | delete |
|---|---|---|---|---|
| Anonymous (frontend SSG fetch) | ✓ selalu | ✗ | ✗ | ✗ |
| Super-admin | gate SF | gate SF | gate SF | gate SF |
| Admin | gate SF | gate SF | gate SF | ✗ |
| Editor | gate SF | ✗ | gate SF | ✗ |

`gate SF` = fetch `site-features` global lalu cek `modules[key] !== false`. Fetch gagal → default aman = allow (jangan blokir editor kalau CMS-nya bermasalah).

**Keputusan penting (owner request v2):** super-admin **ikut** kena hide, biar tidak bingung saat lihat sidebar. Toggle-nya sendiri hidup di global `site-features` (Settings) yang tidak ikut kesembunyi → super-admin tetap punya jalan menyalakannya kembali.

### Applied — 9 collection

| Collection | `slug` DB | `moduleKey` (SiteFeatures) |
|---|---|---|
| [Tours.ts:27](../../apps/cms/src/collections/Tours.ts:27) | `tours` | `tours` |
| [Accommodations.ts:27](../../apps/cms/src/collections/Accommodations.ts:27) | `accommodations` | `accommodations` |
| [WaterActivities.ts:27](../../apps/cms/src/collections/WaterActivities.ts:27) | `water-activities` | `waterActivities` |
| [Yachts.ts:26](../../apps/cms/src/collections/Yachts.ts:26) | `yachts` | **`yacht`** |
| [Restaurants.ts:27](../../apps/cms/src/collections/Restaurants.ts:27) | `restaurants` | `restaurants` |
| [Venues.ts:27](../../apps/cms/src/collections/Venues.ts:27) | `venues` | **`weddings`** |
| [Rentals.ts:26](../../apps/cms/src/collections/Rentals.ts:26) | `rentals` | `rentals` |
| [Spa.ts:26](../../apps/cms/src/collections/Spa.ts:26) | `spa` | `spa` |
| [FerryTickets.ts:26](../../apps/cms/src/collections/FerryTickets.ts:26) | `ferry-tickets` | `ferryTickets` |

Perubahan per file cuma 2 baris: swap import (`adminCreate,authenticatedUpdate,superAdminDelete` → tidak dipakai lagi; `superAdminFieldAccess` tetap untuk field-level di `additionalBlocks`) + baris `access:` → `access: moduleAccess('<key>')`.

## Efek

- Super-admin mematikan mis. "Spa" di SiteFeatures → koleksi **Spa hilang dari sidebar untuk semua role** (super-admin, admin, editor). Direct URL `/admin/collections/spa` → forbidden.
- Toggle di SiteFeatures sendiri tetap ada di grup Settings (super-admin only), jadi jalan re-enable-nya jelas.
- Frontend fetch (Astro SSG, no auth) tetap public → static build gate lewat `isModuleEnabled` (perilaku Phase 4.32 tidak berubah).
- Zero perubahan schema, migration, payload-types, package.

## Risiko

- Fetch global via `req.payload.findGlobal` di dalam access → per-request cost kecil (depth:0, satu global). Payload cache-nya biasa aja.
- Kalau `site-features` corrupt / fetch throw → fallback allow (aman untuk editor). Bukan silent-deny.
- Relasi yang mereferensikan koleksi disabled (mis. Pages block memilih Tour) → editor dengan modul off tidak bisa fetch daftar tur untuk di-pick. Ini **secara semantik benar** (modul off = jangan reference), tapi kalau nanti terasa mengganggu bisa longgarkan `read` untuk konteks relasi (belum diperlukan).

## Files touched

- **New:** `apps/cms/src/access/moduleAccess.ts`
- **Modified (9):** `apps/cms/src/collections/{Tours,Accommodations,WaterActivities,Yachts,Restaurants,Venues,Rentals,Spa,FerryTickets}.ts` — swap import + `access:` line

## UAT checklist

1. Login CMS sebagai **super-admin** → Settings → Pengaturan Fitur → Modul Layanan → matikan (uncheck) mis. Spa + Ferry Tickets → save.
2. Refresh sidebar (atau soft-nav ke halaman lain) → grup Services sudah tidak menampilkan Spa & Ferry Tickets.
3. Coba hit langsung `/admin/collections/spa` → forbidden / not-found.
4. Login sebagai **admin** → sidebar Services juga sudah tanpa Spa & Ferry Tickets.
5. Login sebagai **editor** → sama.
6. Nyalakan lagi toggle di SiteFeatures → koleksi kembali muncul di sidebar untuk semua role sesuai matriks role (admin CRUD, editor R/U).
7. Frontend `pnpm --filter @dn-journeys/web dev` → halaman `/spa` / `/ferry-tickets` tetap 404 saat off (Phase 4.32 behavior, tidak berubah).
