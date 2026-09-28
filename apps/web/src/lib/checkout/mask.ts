/**
 * Sensitive-field masking helpers — Phase 4.63.
 *
 * Passport numbers are stored FULL in Payload for admin/ticketing use, but
 * customer-facing surfaces (confirmation page, WhatsApp message) show only
 * last 4 digits prefixed with bullets. Reasoning: reduce shoulder-surf /
 * screenshot exposure if the customer forwards the confirmation.
 */

export function maskPassport(value: string | null | undefined): string {
  const v = (value ?? '').trim()
  if (!v) return '—'
  if (v.length <= 4) return '••••'
  return `••••${v.slice(-4)}`
}
