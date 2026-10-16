# Phase 4.73 — Bookings Admin UI: Collapsible Sections

**Status**: ✅ Implemented (UI-only, no schema change)
**Branch**: `feat/phase-4.73-booking-admin-sections`
**Date**: 2026-10-16
**Scope**: CMS admin edit view untuk collection `bookings`

---

## 1. Context

Edit view booking di Payload admin menampilkan field flat berurutan tanpa pengelompokan visual yang jelas:

- `bookingRef` + `accessToken` nempel langsung ke `serviceType`, `ferryTicket`, lalu masuk ke blok kontak (`customerName`, `customerEmail`, phone, dsb) tanpa separator.
- Snapshot leg outbound (`departureDate`, `adults`, `children`, `originLocation`, `destinationLocation`, `scheduleTimeLabel`, `ferryClassName`, `ferryClassType`) juga flat, padahal "Return Trip" di bawah sudah dibungkus `collapsible`.
- Beberapa field full-width (origin/destination/schedule/class) membuat halaman panjang vertikal dan boros horizontal space.

Admin baru atau audit review mudah bingung menentukan "mana info kontak, mana info trip, mana info identitas booking".

---

## 2. Decisions

1. **UI-only** — tidak ada perubahan schema. `type: 'collapsible'` di Payload bersifat presentational: field name & data tetap top-level.
2. Buat 3 collapsible baru (`initCollapsed: false` supaya tetap default terbuka):
   - **Booking Reference** — `bookingRef`, `accessToken`, `serviceType`, `ferryTicket`
   - **Contact Information** — `customerName`, `customerEmail`, `contactPhoneRegion`, `contactPhone`, `contactPhoneIsWhatsapp`, `customerWhatsapp`, `customerCountry`, `customerNotes`
   - **Outbound Trip** — `departureDate`, `adults`, `children`, `originLocation`, `destinationLocation`, `scheduleTimeLabel`, `ferryClassName`, `ferryClassType`
3. Field yang full-width tapi logically pair → bungkus `type: 'row'` untuk memaksimalkan space horizontal (origin/destination 50/50, ferryClassName/Type 50/50).
4. Sidebar fields (`tripType`, `status`, `channel`, `expiresAt`) biarkan di posisi sidebar (tidak dimasukkan ke collapsible — Payload render sidebar fields di luar main area apapun).
5. UI widget `requestAlert`, `adminActions`, `departureDateConfirmGuard`, `hasRequestedChangeConfirmGuard` tetap di luar collapsible supaya banner/modal tetap selalu mounted (tidak terganggu jika section di-collapse).
6. Collapsible existing (`Return Trip`, `Pricing`, `Request History`, `Payment`, `Admin Handoff Audit`) tidak di-touch.

---

## 3. Field layout (sesudah)

```
┌─ main area ───────────────────────────────────────────┐
│  [banner] requestAlert                                │
│  [banner] adminActions                                │
│                                                       │
│  ▼ Booking Reference                                  │
│      [bookingRef 50%] [accessToken 50%]               │
│      [serviceType 30%] [ferryTicket 70%]              │
│                                                       │
│  ▼ Contact Information                                │
│      [customerName 50%] [customerEmail 50%]           │
│      [region 20%] [phone 50%] [isWA 30%]              │
│      [customerWhatsapp 50%] [customerCountry 50%]     │
│      [customerNotes full]                             │
│                                                       │
│  ▼ Passengers (array — existing)                      │
│                                                       │
│  ▼ Outbound Trip                                      │
│      [departureDate 34%] [adults 33%] [children 33%]  │
│      [originLocation 50%] [destinationLocation 50%]   │
│      [scheduleTimeLabel full]                         │
│      [ferryClassName 50%] [ferryClassType 50%]        │
│  [guard] departureDateConfirmGuard                    │
│                                                       │
│  ▶ Return Trip (collapsible, condition round-trip)    │
│  ▼ Pricing (existing)                                 │
│  ▶ Request History (existing)                         │
│  ▶ Payment (existing)                                 │
│  ▶ Admin Handoff Audit (existing)                     │
└───────────────────────────────────────────────────────┘

Sidebar: tripType, status, channel, expiresAt (unchanged)
```

---

## 4. Files changed

```
apps/cms/src/collections/Bookings.ts   (field layout only, 3 collapsible wrappers)
```

**No** migration, no new component, no schema change, no access rule change, no hook change, no endpoint change.

---

## 5. Verification

- Field names tetap top-level (bisa dicek via `grep -c "name: 'bookingRef'"` → 1, dst). ✅
- Semua endpoint & hook yang membaca `data.bookingRef`, `data.customerName`, `data.departureDate`, `data.originLocation` dst tidak terpengaruh karena Payload `collapsible` type tidak nested data.
- `useAsTitle: 'bookingRef'` tetap bekerja.
- `admin.condition` untuk `ferryTicket` (`data?.serviceType === 'ferry-ticket'`) tetap bekerja karena membaca form state via field name, bukan path.
- Pre-existing TypeScript errors di `HandoffBody` type (line 581, 1030) & `defaultSort` (line 1554) **tidak** disebabkan oleh perubahan ini — ada sebelum phase 4.73.

---

## 6. Rollback

Revert single commit. Field names identik, data existing kompatibel 100% — tidak ada migration untuk di-rollback.

---

## 7. Follow-up (future, out of scope)

- Opsional: eksplorasi `type: 'tabs'` kalau nanti section bertambah > 8 (saat ini 8 section + sidebar — masih OK sebagai one-column scroll).
- Opsional: tambah `collapsible` untuk pricing & payment group jadi tabs "Finance" kalau audit minta.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
