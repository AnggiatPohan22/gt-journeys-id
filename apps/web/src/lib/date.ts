/**
 * Phase 4.61.7 — date helpers.
 *
 * `todayLocalISO()` returns YYYY-MM-DD for the SERVER's local date. This
 * is used as `min` on <input type="date"> across ferry ticket flows so
 * visitors cannot pick past dates. In production the server runs in UTC;
 * clients in later timezones (WIB = UTC+7) may see "today" is still
 * yesterday in UTC for a few hours after midnight local. Small-window
 * caveat — server-side validation on POST /api/bookings/create is the
 * defense-in-depth backstop (also uses this helper).
 */
export const todayLocalISO = (): string => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** True if `dateStr` (YYYY-MM-DD) is strictly before today (local). */
export const isPastDate = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
  return dateStr < todayLocalISO()
}
