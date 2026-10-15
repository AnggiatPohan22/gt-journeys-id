## Phase: 4.61.4 — Card Background untuk semua desain (compact/detailed/ticket), per-service
**Tanggal**: 2026-09-26
**Status**: Selesai (upload gambar oleh super-admin — perlu login)
**Dikerjakan oleh**: Claude Code

### Ringkasan
Memperluas background/corak kartu (dibuat di 4.61.3 khusus ticket) agar berlaku
untuk **semua desain kartu** (compact, detailed, ticket), tetap **per-service**
(konsisten dgn ticket 4.61.3, sesuai revisi owner). Satu background per service,
diterapkan pada desain kartu apa pun yang aktif untuk service tsb.

### Keputusan owner
- Revisi: background compact & detailed dibuat **per-service** (seperti ticket), bukan per-template.
- Terapkan **juga di compact** (tile kecil), opacity default rendah agar tidak berantakan.

### Pendekatan (tanpa migration baru)
Reuse kolom per-service dari 4.61.3 (`modules_<key>_ticket_bg_*`) — field di CMS
di-broaden: muncul selama modul aktif (bukan hanya saat desain=ticket), relabel
jadi **"Card Background"**. Frontend menerapkan background ke desain aktif.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteFeatures.ts` | Collapsible bg per-service: label → "Card Background", condition → tampil saat modul aktif (semua desain). Field names tetap `*TicketBg*` (reuse kolom 4.61.3, tanpa migration). |
| `apps/web/src/components/cards/CardBgLayer.astro` | **BARU** — layer background dekoratif reusable (1 `<div>` CSS, aria-hidden, pointer-events none, z-0). |
| `apps/web/src/components/cards/DetailedCard.astro` | Prop `background` + `<CardBgLayer>`; body dibuat `relative` (di atas layer). Menutup SEMUA kartu detailed. |
| `apps/web/src/components/cards/{Tour,Accommodation,WaterActivity,Yacht,Restaurant,Venue,Rental,Spa}Card.astro` | Prop `background`; teruskan ke DetailedCard (detailed) + `<CardBgLayer>` di compact (article `relative`, konten `relative`). |
| `apps/web/src/components/cards/FerryTicketsCard.astro` | Prop rename `ticketBackground`→`background`; diteruskan ke TicketRouteCard (ticket), DetailedCard (detailed), + layer di compact. |
| `apps/web/src/lib/serviceCards.ts` | `resolveTicketBackground`→`resolveCardBackground` (generic, tetap baca kolom `*TicketBg*`); type `CardBackground`. |
| `apps/web/src/components/blocks/{ServiceGridBlock,ServiceListingEditorial,ServiceListingHeroImmersive}.astro` | Resolve `cardBg` per-service & oper `background={cardBg}` ke SEMUA kartu (bukan hanya ferry). |

### Impact
- **Database**: none (reuse kolom 4.61.3 — tanpa migration).
- **CMS**: section "… — Card Background" per service muncul untuk semua desain.
- **Frontend**: compact/detailed/ticket semua bisa punya corak; ringan (1 div CSS, ukuran media `card`, 1x download, resolve sekali/block).
- **Deploy needed**: cms + web.

### Testing
- [x] `/ferry-tickets` (ticket) render — 0 console error.
- [x] Preview (temp): compact & detailed dgn background → corak samar di area teks, teks terbaca; kartu tanpa bg = polos. 0 error.
- [ ] Manual (owner, login): Settings → Pengaturan Fitur → Modul Layanan → pilih service (mis. Tours) → "Card Background" → upload → cek listing service tsb.

### Rollback
```
# revert: SiteFeatures.ts, CardBgLayer.astro (hapus), DetailedCard.astro, 8 service card,
#         FerryTicketsCard.astro, serviceCards.ts, 3 block.
# Tidak ada migration untuk di-down (reuse kolom 4.61.3).
```

### Catatan performa (dijaga)
- Layer = 1 `<div>` CSS (bukan `<img>` konten), aria-hidden, pointer-events none.
- Ukuran media `card` (800px), bukan original.
- URL sama antar kartu → 1x download (cache). Resolve sekali per block.
- Opacity default rendah (8%) + konten `relative` di atas → keterbacaan terjaga.

### Next Steps
- Commit 4.61.3 + 4.61.4 bersama (4.61.3 belum di-commit).
- Opsional: preset corak SVG built-in / tint warna brand.
