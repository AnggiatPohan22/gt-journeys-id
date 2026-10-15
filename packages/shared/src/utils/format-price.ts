/**
 * Phase 4.72 — Centralized price formatting.
 *
 * Rules:
 * - IDR → id-ID locale, dot thousands separator, NO decimals ("Rp 250.000").
 * - Other currencies → en-US locale, standard Intl rules for that currency
 *   (max 2 decimals). Unsupported ISO codes fall back to "{code} {number}".
 * - `amount` null/undefined/non-finite → "-" (safe placeholder).
 * - All formatting goes through this helper; callers never hand-roll.
 *
 * NBSP handling:
 * - `formatPrice` keeps the locale's native NBSP (U+00A0) between symbol
 *   and number — HTML/web/text contexts render it fine.
 * - `formatPriceAscii` replaces U+00A0 with a regular space, for contexts
 *   that need strict ASCII/WinAnsi (PDF receipt, plain-ASCII logs).
 *
 * Runtime: pure `Intl.NumberFormat` — works in Node, Cloudflare Workers,
 * and browser without additional polyfills.
 */

const NBSP = ' '

export function formatPrice(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '-'
  const ccy = (typeof currency === 'string' ? currency : '').trim().toUpperCase() || 'IDR'

  try {
    if (ccy === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ccy,
      // Non-IDR: show standard 2 decimals (e.g. $1,234.50, SGD 1,200.00).
      // Keep sub-unit precision; call-site may further round upstream.
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Unsupported ISO code — fallback to code + plain number.
    const n = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
    return `${ccy} ${n}`
  }
}

/**
 * PDF-safe variant — NBSP (U+00A0) replaced with regular space. Keeps
 * output strictly within printable ASCII when combined with ASCII-only
 * currency symbols; for Rp/£/€ etc the symbol itself remains, which the
 * caller (e.g. PDF renderer) may further sanitize via its own helper.
 */
export function formatPriceAscii(amount: number | null | undefined, currency: string | null | undefined): string {
  return formatPrice(amount, currency).replace(new RegExp(NBSP, 'g'), ' ')
}
