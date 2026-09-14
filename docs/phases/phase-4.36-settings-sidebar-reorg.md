# Phase 4.36 — Settings Sidebar Reorganization (3 Groups)

**Status:** ✅ Code complete · ⏳ Owner UAT (login CMS, cek sidebar)
**Branch:** `feature/phase4-polish-launch`
**Scope:** Pure `admin.group` string change on 5 globals + 1 access-consistency fix. Zero schema change, zero migration.

## Motivasi

Sebelum: satu grup **Settings** menampung 8 globals — Site Settings, Header Settings, Footer Settings, Homepage — Fallback Content, Pengaturan Fitur, Announcement Bar, Promo Banner, Blog Settings. Terlalu panjang & campur-tema (identitas, tampilan, marketing, editorial blog). Ekspansi fitur ke depan bakal makin sesak.

Audit sebelumnya (di sesi ini) mempertimbangkan tiga opsi:
- **Opsi A** — split ke 3 grup via `admin.group` string (zero-risk, pure UI). ← dipilih
- **Opsi B** — merge Announcement + Promo jadi satu global `marketing-popups`. Skipped v1 (butuh migrasi + refactor fetch).
- **Opsi C** — merge Header/Footer/Homepage. Ditolak (slug dipakai di banyak template apps/web).

## Perubahan

| Global | Old group | New group |
|---|---|---|
| `site-settings` | Settings | **Settings** (tetap) |
| `site-features` (Pengaturan Fitur) | Settings | **Settings** (tetap) |
| `blog-settings` | Settings | **Settings** (tetap) |
| `header-settings` | Settings | **Appearance** |
| `footer-settings` | Settings | **Appearance** |
| `homepage-content` (Homepage — Fallback) | Settings | **Appearance** |
| `announcement-bar` | Settings | **Marketing** |
| `promo-banner` | Settings | **Marketing** |

Sidebar sekarang menampilkan **3 accordion** (Settings 3 · Appearance 3 · Marketing 2) alih-alih satu grup panjang isi 8.

### Bug-fix akses BlogSettings

Ditemukan saat audit: [BlogSettings.ts](../../apps/cms/src/globals/BlogSettings.ts) tidak punya `admin.hidden`, sementara peer-nya (SiteSettings/Header/Footer) semua menyembunyikan dari `editor`. Ditambahkan:

```ts
hidden: ({ user }) => user?.role === 'editor',
```

Update-access (`admin+super-admin`) tidak berubah — hanya membereskan visibility sidebar agar konsisten dengan peer domain-config lain.

## Access matrix (setelah perubahan)

| Global | Grup | Editor lihat? | Admin lihat? | Super-admin lihat? |
|---|---|---|---|---|
| Site Settings | Settings | ✗ | ✓ | ✓ |
| Site Features | Settings | ✗ | ✗ | ✓ |
| Blog Settings | Settings | ✗ (**fixed**) | ✓ | ✓ |
| Header Settings | Appearance | ✗ | ✓ | ✓ |
| Footer Settings | Appearance | ✗ | ✓ | ✓ |
| Homepage Fallback | Appearance | ✗ | ✓ | ✓ |
| Announcement Bar | Marketing | ✗ | ✗ | ✓ |
| Promo Banner | Marketing | ✗ | ✗ | ✓ |

Hasil visibility per role:
- **Editor:** semua 3 grup kosong → Payload menyembunyikan grup kosong otomatis, jadi editor tidak lihat Settings/Appearance/Marketing sama sekali.
- **Admin:** Settings (2 item) + Appearance (3 item). Grup Marketing kosong → tidak muncul.
- **Super-admin:** ketiga grup terisi penuh.

## Risiko & non-impact

- **Zero schema change** — tidak ada migration.
- **Zero data change** — slug semua global tetap; fetch di apps/web tidak terpengaruh.
- **Zero payload-types change** — tipe tidak berubah.
- Ordering sidebar: Payload group-by first-appearance di `payload.config.ts` `globals` array. Urutan `[SiteSettings, HeaderSettings, FooterSettings, HomepageContent, SiteFeatures, AnnouncementBar, PromoBanner, BlogSettings]` menghasilkan Settings → Appearance → Marketing, di mana urutan item dalam tiap grup mengikuti posisi array. Tidak perlu ubah order array.

## Files touched

- `apps/cms/src/globals/HeaderSettings.ts` — `group: 'Appearance'`
- `apps/cms/src/globals/FooterSettings.ts` — `group: 'Appearance'`
- `apps/cms/src/globals/HomepageContent.ts` — `group: 'Appearance'`
- `apps/cms/src/globals/AnnouncementBar.ts` — `group: 'Marketing'`
- `apps/cms/src/globals/PromoBanner.ts` — `group: 'Marketing'`
- `apps/cms/src/globals/BlogSettings.ts` — tambah `hidden: editor`

## UAT checklist

1. Login CMS sebagai **super-admin** — sidebar tampil 3 grup (Settings 3, Appearance 3, Marketing 2), setiap grup dapat diakses & item bekerja normal.
2. Login sebagai **admin** — hanya Settings (Site Settings + Blog Settings) & Appearance (Header + Footer + Homepage). Marketing tidak muncul.
3. Login sebagai **editor** — tidak ada satu pun dari 3 grup ini di sidebar.
4. Buka Blog Settings sebagai editor via URL langsung `/admin/globals/blog-settings` → server tetap mengizinkan read (public), tapi tombol Save gagal (update = admin+). *(Perilaku pre-existing; sidebar hiding sekarang konsisten.)*

## Follow-up (nanti, opsional)

- **Opsi B**: gabungkan `announcement-bar` + `promo-banner` menjadi satu global `marketing-popups` bertab (kedua-duanya super-admin only, share pola `version` + `resetVisitorCookies`). Butuh migrasi data + refactor fetch di apps/web. Turunkan Marketing dari 2 item → 1 item.
