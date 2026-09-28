import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Phase 4.61.6 — Auto-compute `duration` (mis. "1h 15m") dari `departureTime`
 * & `arrivalTime` di FerryTickets, memperhitungkan beda timezone antara
 * originLocation dan arrivalLocation (mis. Batam WIB → Singapore SGT).
 *
 * Skip / no-op jika:
 *  - `durationOverride === true` (admin isi manual)
 *  - departureTime/arrivalTime kosong / bukan format "HH:mm"
 *  - origin atau arrival location belum di-set (tidak bisa hitung offset)
 *  - location doc tidak punya timezone
 *
 * Asumsi: ferry tiba di hari yang sama; jika arrival < departure setelah
 * konversi ke menit-UTC → dianggap next day (+24 jam).
 */

const TIMEZONE_OFFSETS: Record<string, number> = {
  'Asia/Jakarta': 7 * 60,
  'Asia/Makassar': 8 * 60,
  'Asia/Jayapura': 9 * 60,
  'Asia/Singapore': 8 * 60,
  'Asia/Kuala_Lumpur': 8 * 60,
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/

const toMinutes = (hhmm: string): number | null => {
  const m = HHMM.exec(hhmm)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

const formatDuration = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const computeFerryDuration: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return data
  if (data.durationOverride) return data

  const dep = typeof data.departureTime === 'string' ? data.departureTime.trim() : ''
  const arr = typeof data.arrivalTime === 'string' ? data.arrivalTime.trim() : ''
  const depMin = toMinutes(dep)
  const arrMin = toMinutes(arr)
  if (depMin === null || arrMin === null) return data

  const originId = typeof data.originLocation === 'object' ? data.originLocation?.id : data.originLocation
  const arrivalId = typeof data.arrivalLocation === 'object' ? data.arrivalLocation?.id : data.arrivalLocation
  if (!originId || !arrivalId) return data

  try {
    const [origin, arrival] = await Promise.all([
      req.payload.findByID({ collection: 'locations', id: originId, depth: 0 }),
      req.payload.findByID({ collection: 'locations', id: arrivalId, depth: 0 }),
    ])
    const originTz = (origin as any)?.timezone as string | undefined
    const arrivalTz = (arrival as any)?.timezone as string | undefined
    if (!originTz || !arrivalTz) return data
    const originOffset = TIMEZONE_OFFSETS[originTz]
    const arrivalOffset = TIMEZONE_OFFSETS[arrivalTz]
    if (originOffset === undefined || arrivalOffset === undefined) return data

    // Konversi ke menit UTC
    const depUtc = depMin - originOffset
    let arrUtc = arrMin - arrivalOffset
    let diff = arrUtc - depUtc
    if (diff < 0) diff += 24 * 60 // asumsi next day
    if (diff <= 0 || diff > 24 * 60) return data // sanity

    data.duration = formatDuration(diff)
  } catch {
    // fail-silent — jangan block save karena hitung durasi gagal
  }
  return data
}
