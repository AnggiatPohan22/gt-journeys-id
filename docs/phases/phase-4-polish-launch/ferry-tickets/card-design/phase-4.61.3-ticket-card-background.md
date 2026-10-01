## Phase: 4.61.3 — Ticket Card Background/Corak (per-service, ringan)
**Tanggal**: 2026-09-26
**Status**: Selesai (upload gambar oleh super-admin via admin — perlu login)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Kartu Ticket bisa diberi **background/corak** (mis. peta dunia seperti contoh) yang
**di-upload super-admin** per-service, lengkap dengan kontrol **opacity** & **posisi**.
Dirancang ringan agar pengalaman visitor tetap terjaga.

### Keputusan owner
- Cakupan: **per-service** (tiap service bisa background sendiri).
- Kontrol: **lengkap** (upload + opacity + posisi).

### Strategi ringan (frontend)
- Background dirender sebagai **1 `<div>` CSS** dekoratif (`position:absolute`,
  `aria-hidden`, `pointer-events:none`) — bukan `<img>` konten tambahan.
- Pakai ukuran media **`card` (800px)**, bukan original.
- URL sama untuk semua kartu di listing → **1x download** (browser cache), tak
  bertambah walau banyak kartu.
- Di-resolve **sekali per block** (blocks sudah fetch features) → tak ada fetch
  per-kartu. Hanya dirender bila gambar di-set.
- Opacity default rendah (8%) + teks di layer `relative` di atasnya → keterbacaan terjaga.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteFeatures.ts` | `ticketBgFields()` — per service: `<key>TicketBg` (upload media), `<key>TicketBgOpacity` (0–100, default 8), `<key>TicketBgPosition` (right/cover/tile/center). Collapsible, muncul HANYA saat service aktif & desain=`ticket`. Upload = super-admin only (global di-gate isSuperAdmin). |
| `apps/cms/src/migrations/20260926_052238_phase_4_61_3_ticket_card_bg.ts` | **BARU** — ADD 27 kolom (`modules_<key>_ticket_bg_id` FK media + `_opacity` + `_position`) + index. Additif. |
| `apps/web/src/lib/payload.ts` | `fetchGlobal(slug, depth)`; `getSiteFeatures()` kini `depth=1` agar media background ter-populate. |
| `apps/web/src/lib/serviceCards.ts` | `resolveTicketBackground(serviceType, features)` → `{ url (size card), opacity 0..1, position }` atau undefined. |
| `apps/web/src/components/cards/TicketRouteCard.astro` | Prop `background`; render layer CSS dekoratif (size/repeat/position per mode) + konten dinaikkan ke `relative`. |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Terima & teruskan `ticketBackground`. |
| `ServiceGridBlock.astro`, `ServiceListingEditorial.astro`, `ServiceListingHeroImmersive.astro` | Resolve `ticketBg` (per serviceType) & oper ke FerryTicketsCard. |
| `packages/shared/src/types/payload-types.ts` | Regenerated. |

### Impact
- **Database**: migration `20260926_052238_phase_4_61_3_ticket_card_bg` — additif, tanpa data loss.
- **CMS**: per service (yang pakai ticket) muncul section "… — Ticket Background" (upload + opacity + posisi), super-admin only.
- **Frontend**: kartu Ticket render corak bila di-set; ringan (1 div CSS, ukuran card, 1x download).
- **Deploy needed**: cms + web.

### Testing
- [x] Migration apply + `generate:types` sukses.
- [x] API `/api/globals/site-features?depth=1` → field `*TicketBg/Opacity/Position` muncul (image null → kartu polos).
- [x] `/ferry-tickets` tetap render (bg belum di-set) — 0 console error.
- [x] Preview (temp) buktikan layer background render: `right` (watermark samar kanan, teks terbaca), `cover` (tipis penuh), tanpa bg (polos).
- [ ] Manual (owner, butuh login): Settings → Pengaturan Fitur → Modul Layanan → Ferry Tickets → "Ticket Background" → upload gambar (mis. peta dunia), set opacity/posisi → cek `/ferry-tickets`.

### Rollback
```
cd apps/cms && pnpm schema:down    # drop 27 kolom ticket_bg
# revert: SiteFeatures.ts, payload.ts, serviceCards.ts, TicketRouteCard.astro,
#         FerryTicketsCard.astro, 3 block, payload-types.ts
```

### Catatan
- Gambar background sebaiknya sederhana (watermark/peta) & sudah teroptimasi; ukuran
  `card` (800px) dipakai otomatis. Opacity kecil (5–15%) menjaga keterbacaan.
- Restart `pnpm dev` CMS bila section background belum muncul.

### Next Steps
Opsional: preset corak built-in (SVG pattern) sebagai alternatif upload, atau tint warna brand.
