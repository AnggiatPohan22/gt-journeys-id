/**
 * Payment Receipt PDF generator — Phase 4.70.3.1.
 *
 * Pure function: ctx → Uint8Array buffer. Pakai pdf-lib (Workers-compatible,
 * zero native deps). Default Helvetica (built-in standard font, WinAnsi
 * encoding) — non-Latin chars disanitasi lewat `sanitizeForPdfText`.
 *
 * Legal: ini BUKAN tiket perjalanan. Hanya bukti pembayaran. Disclaimer
 * prominent di PDF.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

export interface ReceiptContext {
  // Header
  businessName: string
  businessAddress?: string
  businessId?: string

  // Receipt meta
  receiptNumber: string
  issueDate: string // ISO; akan di-format "15 Oct 2026" di Asia/Makassar

  // Customer (name + email only — no WA, no country per policy)
  customerName: string
  customerEmail: string

  // Booking
  bookingRef: string
  originLocation: string
  destinationLocation: string
  departureDisplay: string // sudah include waktu
  ferryClassName: string
  adults: number
  children: number
  passengers: Array<{ fullName: string; type: 'adult' | 'child' }>

  // Payment
  currency: string
  totalEstimate: number | string
  paymentBank: string
  paymentDate: string // ISO date

  // Legal
  disclaimerText: string
  footerNote?: string
}

/* ─────────────────────────────────────────────────────────────────────
 * Text sanitation — WinAnsi/Latin-1 safe.
 * ───────────────────────────────────────────────────────────────────── */

/**
 * Sanitize untuk Helvetica (WinAnsi encoding). Preserve newlines,
 * strip control chars, strip diacritics via NFKD, replace char > 0xFF
 * dengan `?`. Juga collapse 3+ newline ke 2.
 */
export function sanitizeForPdfText(input: string | null | undefined): string {
  if (input == null) return ''
  let s = String(input)
  // Normalize line endings
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  // Strip combining diacritics (é → e, ñ → n)
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
  // Rebuild: keep ASCII + Latin-1 supplement 0xA0–0xFF, keep \n, drop control chars
  let out = ''
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0
    if (ch === '\n') { out += '\n'; continue }
    if (code >= 0x00 && code <= 0x1f) continue // C0 controls
    if (code >= 0x7f && code <= 0x9f) continue // DEL + C1 controls
    if (code <= 0xff) { out += ch; continue }
    out += '?'
  }
  // Collapse 3+ newlines ke 2
  out = out.replace(/\n{3,}/g, '\n\n')
  return out
}

/**
 * Compute YYYYMMDD di timezone Asia/Makassar (WITA, UTC+8).
 * Dipakai untuk receipt number date segment.
 */
export function getMakassarYYYYMMDD(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970'
  const m = parts.find((p) => p.type === 'month')?.value ?? '01'
  const day = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${y}${m}${day}`
}

/**
 * Format tanggal ISO ke "15 Oct 2026" di timezone Asia/Makassar.
 */
export function formatDateMakassar(iso: string | Date): string {
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    if (Number.isNaN(d.getTime())) return String(iso)
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return String(iso)
  }
}

/* ─────────────────────────────────────────────────────────────────────
 * Layout primitives.
 * ───────────────────────────────────────────────────────────────────── */

const PAGE_WIDTH = 595.28 // A4 width
const PAGE_HEIGHT = 841.89 // A4 height
const MARGIN_X = 50
const MARGIN_TOP = 50
const MARGIN_BOTTOM = 60
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2

const COLOR_TEXT = rgb(0.1, 0.1, 0.12)
const COLOR_MUTED = rgb(0.42, 0.47, 0.54)
const COLOR_BORDER = rgb(0.86, 0.89, 0.93)
const COLOR_ACCENT = rgb(0.057, 0.09, 0.164) // #0F172A primary
const COLOR_WARN_BG = rgb(1.0, 0.98, 0.92) // light amber
const COLOR_WARN_BORDER = rgb(0.98, 0.75, 0.14) // amber
const COLOR_WARN_TEXT = rgb(0.4, 0.19, 0.03)

interface DrawState {
  pdfDoc: PDFDocument
  page: PDFPage
  font: PDFFont
  fontBold: PDFFont
  y: number // cursor from top (converted internal: PDF uses y-from-bottom)
  pageIndex: number
}

/**
 * Word-wrap text ke multi-line array, respect existing \n.
 */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const outLines: string[] = []
  const paragraphs = text.split('\n')
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      outLines.push('')
      continue
    }
    const words = paragraph.split(/\s+/)
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      const w = font.widthOfTextAtSize(candidate, size)
      if (w > maxWidth && current) {
        outLines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    if (current) outLines.push(current)
  }
  return outLines
}

/**
 * Ensure cursor has `required` vertical space; else add new page + continuation header.
 * Return updated state.
 */
function ensureSpace(state: DrawState, required: number, continuationLabel?: string): DrawState {
  const yBottom = PAGE_HEIGHT - state.y
  if (yBottom - required >= MARGIN_BOTTOM) return state
  // Add page
  const next = state.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  state.pageIndex += 1
  state.page = next
  state.y = MARGIN_TOP
  if (continuationLabel) {
    state.page.drawText(sanitizeForPdfText(`${continuationLabel} (page ${state.pageIndex})`), {
      x: MARGIN_X,
      y: PAGE_HEIGHT - state.y - 10,
      size: 9,
      font: state.font,
      color: COLOR_MUTED,
    })
    state.y += 20
  }
  return state
}

function drawText(
  state: DrawState,
  text: string,
  opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; indent?: number } = {},
) {
  const size = opts.size ?? 10
  const font = opts.font ?? state.font
  const x = opts.x ?? MARGIN_X + (opts.indent ?? 0)
  const yFromBottom = PAGE_HEIGHT - state.y - size
  state.page.drawText(sanitizeForPdfText(text), {
    x,
    y: yFromBottom,
    size,
    font,
    color: opts.color ?? COLOR_TEXT,
  })
  state.y += size + 2
}

function drawTextWrapped(
  state: DrawState,
  text: string,
  opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; maxWidth?: number; indent?: number } = {},
) {
  const size = opts.size ?? 10
  const font = opts.font ?? state.font
  const maxWidth = opts.maxWidth ?? CONTENT_WIDTH - (opts.indent ?? 0)
  const indent = opts.indent ?? 0
  const lines = wrapText(sanitizeForPdfText(text), font, size, maxWidth)
  for (const line of lines) {
    ensureSpace(state, size + 4)
    state.page.drawText(line, {
      x: MARGIN_X + indent,
      y: PAGE_HEIGHT - state.y - size,
      size,
      font,
      color: opts.color ?? COLOR_TEXT,
    })
    state.y += size + 3
  }
}

function drawHRule(state: DrawState, color = COLOR_BORDER) {
  ensureSpace(state, 10)
  state.page.drawLine({
    start: { x: MARGIN_X, y: PAGE_HEIGHT - state.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - state.y },
    thickness: 0.5,
    color,
  })
  state.y += 10
}

function drawSectionTitle(state: DrawState, title: string) {
  ensureSpace(state, 18)
  state.y += 4
  drawText(state, title.toUpperCase(), { size: 9, font: state.fontBold, color: COLOR_MUTED })
  state.y += 2
}

function drawLabelValue(state: DrawState, label: string, value: string, labelWidth = 90) {
  ensureSpace(state, 14)
  const size = 10
  const yFromBottom = PAGE_HEIGHT - state.y - size
  state.page.drawText(sanitizeForPdfText(label), {
    x: MARGIN_X,
    y: yFromBottom,
    size,
    font: state.font,
    color: COLOR_MUTED,
  })
  state.page.drawText(sanitizeForPdfText(value), {
    x: MARGIN_X + labelWidth,
    y: yFromBottom,
    size,
    font: state.font,
    color: COLOR_TEXT,
  })
  state.y += size + 4
}

function drawDisclaimerBox(state: DrawState, text: string) {
  const padding = 10
  const size = 9.5
  const titleSize = 10
  const lines = wrapText(sanitizeForPdfText(text), state.font, size, CONTENT_WIDTH - padding * 2)
  const contentHeight = titleSize + 6 + lines.length * (size + 3) + padding * 2
  ensureSpace(state, contentHeight + 10)
  const yTop = PAGE_HEIGHT - state.y
  const yBottom = yTop - contentHeight
  // Box
  state.page.drawRectangle({
    x: MARGIN_X,
    y: yBottom,
    width: CONTENT_WIDTH,
    height: contentHeight,
    color: COLOR_WARN_BG,
    borderColor: COLOR_WARN_BORDER,
    borderWidth: 1,
  })
  // Title
  state.page.drawText(sanitizeForPdfText('DISCLAIMER'), {
    x: MARGIN_X + padding,
    y: yTop - padding - titleSize,
    size: titleSize,
    font: state.fontBold,
    color: COLOR_WARN_TEXT,
  })
  // Lines
  let yCursor = yTop - padding - titleSize - 8
  for (const line of lines) {
    state.page.drawText(line, {
      x: MARGIN_X + padding,
      y: yCursor - size,
      size,
      font: state.font,
      color: COLOR_WARN_TEXT,
    })
    yCursor -= size + 3
  }
  state.y += contentHeight + 10
}

/* ─────────────────────────────────────────────────────────────────────
 * Main generator.
 * ───────────────────────────────────────────────────────────────────── */

export async function generatePaymentReceipt(ctx: ReceiptContext): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  const state: DrawState = {
    pdfDoc,
    page,
    font,
    fontBold,
    y: MARGIN_TOP,
    pageIndex: 1,
  }

  // ─── Header: Business info ───
  drawText(state, ctx.businessName, { size: 16, font: fontBold, color: COLOR_ACCENT })
  if (ctx.businessAddress) {
    drawTextWrapped(state, ctx.businessAddress, { size: 9, color: COLOR_MUTED })
  }
  if (ctx.businessId) {
    drawText(state, ctx.businessId, { size: 9, color: COLOR_MUTED })
  }
  drawHRule(state)

  // ─── Receipt title ───
  state.y += 4
  drawText(state, 'BUKTI PEMBAYARAN - PAYMENT RECEIPT', {
    size: 14,
    font: fontBold,
    color: COLOR_ACCENT,
  })
  drawLabelValue(state, 'No', ctx.receiptNumber)
  drawLabelValue(state, 'Tanggal terbit', formatDateMakassar(ctx.issueDate))
  drawHRule(state)

  // ─── Customer ───
  drawSectionTitle(state, 'Customer')
  drawLabelValue(state, 'Nama', ctx.customerName)
  drawLabelValue(state, 'Email', ctx.customerEmail)
  drawHRule(state)

  // ─── Booking Detail ───
  drawSectionTitle(state, 'Booking Detail')
  drawLabelValue(state, 'Ref', ctx.bookingRef)
  drawLabelValue(state, 'Rute', `${ctx.originLocation} -> ${ctx.destinationLocation}`)
  drawLabelValue(state, 'Jadwal', ctx.departureDisplay)
  drawLabelValue(state, 'Kelas', ctx.ferryClassName)
  drawLabelValue(state, 'Jumlah pax', `${ctx.adults} Adult + ${ctx.children} Child`)

  // Passenger list (potensi multi-page)
  if (ctx.passengers.length > 0) {
    state.y += 2
    drawText(state, 'Daftar penumpang:', { size: 9, font: fontBold, color: COLOR_MUTED })
    ctx.passengers.forEach((p, i) => {
      ensureSpace(state, 14, 'Continued - Passenger List')
      const label = `  ${i + 1}. ${p.fullName} (${p.type === 'child' ? 'Child' : 'Adult'})`
      drawText(state, label, { size: 10 })
    })
  }
  drawHRule(state)

  // ─── Payment ───
  drawSectionTitle(state, 'Pembayaran')
  drawLabelValue(state, 'Metode', 'Bank Transfer')
  drawLabelValue(state, 'Bank', ctx.paymentBank)
  drawLabelValue(state, 'Tanggal bayar', formatDateMakassar(ctx.paymentDate))
  const totalFormatted = formatAmount(ctx.totalEstimate, ctx.currency)
  drawLabelValue(state, 'Total', totalFormatted)
  drawHRule(state)

  // ─── Disclaimer (prominent) ───
  drawDisclaimerBox(state, ctx.disclaimerText)

  // ─── Footer note ───
  if (ctx.footerNote && ctx.footerNote.trim()) {
    state.y += 4
    drawTextWrapped(state, ctx.footerNote, { size: 9.5, color: COLOR_MUTED })
  }

  const bytes = await pdfDoc.save()
  return bytes
}

function formatAmount(amount: number | string, currency: string): string {
  const n = typeof amount === 'number' ? amount : Number(String(amount).replace(/,/g, ''))
  if (!Number.isFinite(n)) return `${currency} ${amount}`
  // Thousands separator (Indonesia: titik, atau internasional: koma — pakai en-US biar aman WinAnsi)
  const formatted = n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${currency} ${formatted}`
}
