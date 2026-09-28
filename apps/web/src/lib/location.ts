/**
 * Phase 4.61 — resolve nama lokasi untuk render frontend.
 *
 * Sumber lokasi (Origin/Arrival ferry, dll) sekarang adalah relationship ke
 * collection `locations`. Helper ini menerima nilai relationship (objek Location
 * saat depth≥1, atau id/null) dan fallback ke value enum lama (`origin`/`arrival`
 * string) selama masa transisi (sebelum field enum lama dihapus di Stage 4).
 *
 * Reusable: dipakai FerryTicketsCard, detail page, dan modul transport lain
 * yang memakai relationship `locations`.
 */

/** Label enum legacy — dipertahankan sebagai fallback selama transisi. */
const legacyLocationLabel: Record<string, string> = {
  batam: 'Batam',
  tanjungpinang: 'Tanjung Pinang',
  singapore: 'Singapore',
  malaysia: 'Malaysia',
}

export interface ResolvedLocation {
  name: string
  /** Nama terminal/sub-title (baris kedua di card), bila ada. */
  terminal?: string
  code?: string
  /** Zona waktu IANA (Phase 4.61.6), dipakai untuk render label "WIB", "SGT", dst. */
  timezone?: string
  /** Google Maps embed src URL (Phase 4.61.6). */
  mapEmbedUrl?: string
  /** Google/Apple Maps click-through URL (Phase 4.61.6). Fallback → mapEmbedUrl. */
  mapLink?: string
}

/** Singkatan zona waktu untuk badge/label frontend. */
export const TIMEZONE_ABBR: Record<string, string> = {
  'Asia/Jakarta': 'WIB',
  'Asia/Makassar': 'WITA',
  'Asia/Jayapura': 'WIT',
  'Asia/Singapore': 'SGT',
  'Asia/Kuala_Lumpur': 'MYT',
}

export const tzLabel = (tz?: string): string | undefined => (tz ? TIMEZONE_ABBR[tz] : undefined)

/**
 * @param rel    Nilai field relationship (Location object bila depth≥1, atau id/null).
 * @param legacy Value enum lama (opsional) sebagai fallback.
 */
export function resolveLocation(rel: unknown, legacy?: string | null): ResolvedLocation | undefined {
  if (rel && typeof rel === 'object') {
    const l = rel as {
      name?: string
      terminalName?: string
      code?: string
      timezone?: string
      mapEmbedUrl?: string
      mapLink?: string
    }
    if (l.name) {
      return {
        name: l.name,
        terminal: l.terminalName || undefined,
        code: l.code || undefined,
        timezone: l.timezone || undefined,
        mapEmbedUrl: l.mapEmbedUrl || undefined,
        mapLink: l.mapLink || undefined,
      }
    }
  }
  if (legacy) {
    return { name: legacyLocationLabel[legacy] ?? legacy }
  }
  return undefined
}

/** Route label ringkas "A → B" dari dua lokasi (relationship + fallback enum). */
export function routeLabelFrom(
  originRel: unknown,
  arrivalRel: unknown,
  legacyOrigin?: string | null,
  legacyArrival?: string | null,
): string | undefined {
  const o = resolveLocation(originRel, legacyOrigin)
  const a = resolveLocation(arrivalRel, legacyArrival)
  return o && a ? `${o.name} → ${a.name}` : undefined
}
