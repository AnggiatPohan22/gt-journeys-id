/**
 * Unit tests for format-price. Run with:
 *   node --import tsx --test packages/shared/src/utils/format-price.test.ts
 * (tsx is a devDep somewhere in the monorepo; if not, run via CMS/web test
 * harness or compile first.)
 */
import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { formatPrice, formatPriceAscii } from './format-price'

// Intl output embeds NBSP (U+00A0) between symbol and number for some
// locale/currency pairs — tests use a tolerant matcher via normalizing
// NBSP to space before comparing.
const norm = (s: string) => s.replace(/ /g, ' ')

describe('formatPrice — IDR', () => {
  it('formats a typical price with dot thousands and NO decimals', () => {
    assert.equal(norm(formatPrice(250000, 'IDR')), 'Rp 250.000')
  })

  it('formats large numbers correctly', () => {
    assert.equal(norm(formatPrice(1_500_000_000, 'IDR')), 'Rp 1.500.000.000')
  })

  it('formats zero', () => {
    assert.equal(norm(formatPrice(0, 'IDR')), 'Rp 0')
  })

  it('rounds away decimals (IDR has no sen in practice)', () => {
    assert.equal(norm(formatPrice(250000.75, 'IDR')), 'Rp 250.001')
  })

  it('defaults to IDR when currency is nullish', () => {
    assert.equal(norm(formatPrice(50_000, null)), 'Rp 50.000')
    assert.equal(norm(formatPrice(50_000, undefined)), 'Rp 50.000')
    assert.equal(norm(formatPrice(50_000, '')), 'Rp 50.000')
  })

  it('is case-insensitive on currency code', () => {
    assert.equal(norm(formatPrice(100, 'idr')), 'Rp 100')
  })
})

describe('formatPrice — non-IDR', () => {
  it('formats USD with $ symbol and 2 decimals', () => {
    assert.equal(norm(formatPrice(1234.5, 'USD')), '$1,234.50')
  })

  it('formats zero USD', () => {
    assert.equal(norm(formatPrice(0, 'USD')), '$0.00')
  })

  it('formats SGD', () => {
    const out = norm(formatPrice(1200, 'SGD'))
    assert.match(out, /^SGD\s?1,200(\.00)?$/)
  })

  it('still produces a readable string for an unknown ISO code', () => {
    // Intl accepts any 3-letter code and treats as generic. Either path
    // (Intl success or fallback) must produce "{code} {number}".
    const out = norm(formatPrice(1000, 'XYZ'))
    assert.match(out, /^XYZ\s?1,000(\.00)?$/)
  })
})

describe('formatPrice — edge cases', () => {
  it('returns "-" for null/undefined amount', () => {
    assert.equal(formatPrice(null, 'IDR'), '-')
    assert.equal(formatPrice(undefined, 'IDR'), '-')
  })

  it('returns "-" for NaN/Infinity', () => {
    assert.equal(formatPrice(Number.NaN, 'IDR'), '-')
    assert.equal(formatPrice(Number.POSITIVE_INFINITY, 'IDR'), '-')
  })
})

describe('formatPriceAscii', () => {
  it('strips NBSP from IDR output', () => {
    const out = formatPriceAscii(250000, 'IDR')
    assert.ok(!out.includes(' '), 'should not contain NBSP')
    assert.equal(out, 'Rp 250.000')
  })

  it('strips NBSP from non-IDR output', () => {
    const out = formatPriceAscii(1234.5, 'USD')
    assert.ok(!out.includes(' '), 'should not contain NBSP')
    // USD output is $1,234.50 (no NBSP typically) — still safe.
    assert.equal(out, '$1,234.50')
  })

  it('preserves zero and placeholder', () => {
    assert.equal(formatPriceAscii(0, 'IDR'), 'Rp 0')
    assert.equal(formatPriceAscii(null, 'IDR'), '-')
  })
})
