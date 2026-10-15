import type { TextFieldSingleValidation } from 'payload'

/**
 * Reserved page slugs — URL yang di-handle file statis Astro di
 * `apps/web/src/pages/` dan akan MENANG atas CMS Page ber-slug sama, karena
 * catch-all `[...slug].astro` sengaja jalan setelah route statis. Bikin Page
 * dgn salah satu slug ini = Page-nya ke-shadow diam-diam (tidak pernah tampil).
 *
 * Lihat `docs/reports/hardcoded-pages-audit.md` §C.2.
 *
 * DILARANG untuk Page — single-segment root yang di-handle file statis /
 *   redirect Astro dan akan menang atas CMS Page:
 *   plural listing roots (tours, accommodations, restaurants, rentals,
 *   weddings, water-activities) + utility (property, 404).
 *   Catatan: plural roots kini 301-redirect ke singular (C-opsi 1), tapi tetap
 *   di-reserve karena redirect tetap men-shadow CMS Page ber-slug sama.
 *
 * TIDAK di-reserve (sengaja tersedia untuk CMS Page):
 *   - Slug singular bare (tour, villa, restaurant, rental, venue,
 *     water-activity, `yacht`) → dialokasikan untuk landing page per service
 *     via `[...slug].astro` (lihat `apps/web/src/lib/serviceTypes.ts`
 *     KEY_TO_SLUG). `yacht` DIKELUARKAN dari reserved (audit A2): `/yacht`
 *     sekarang CMS landing page, bukan file statis.
 *   - `home` → homepage memang consume Page slug `home`.
 */
export const RESERVED_PAGE_SLUGS = [
  'tours',
  'accommodations',
  'restaurants',
  'rentals',
  'weddings',
  'water-activities',
  'property',
  '404',
] as const

/**
 * Field `validate` untuk slug Pages. Jalan SETELAH `generateSlug` memformat
 * value, jadi membandingkan slug final. Mengembalikan pesan error (string)
 * kalau reserved; `true` kalau lolos.
 *
 * Catatan: tetap kembalikan `true` untuk value kosong — biar aturan
 * required/unique bawaan field yang menangani kasus itu (kita hanya menambah
 * cek reserved di atasnya).
 */
export const validateReservedSlug: TextFieldSingleValidation = (value) => {
  if (
    typeof value === 'string' &&
    (RESERVED_PAGE_SLUGS as readonly string[]).includes(value)
  ) {
    return `Slug "${value}" sudah dipakai halaman statis (reserved) dan akan ke-override oleh file di apps/web/src/pages/. Pilih slug lain.`
  }
  return true
}
