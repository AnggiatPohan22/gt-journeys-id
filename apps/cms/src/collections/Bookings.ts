import type { CollectionBeforeChangeHook, CollectionConfig, Endpoint } from 'payload'
import { isAdmin, isApiOrAdmin, isSuperAdmin, superAdminFieldAccess } from '../access/roles'
import {
  buildContext,
  buildWaLink,
  computePaymentDeadline,
  formatBankAccountsBlock,
  formatPassengerList,
  formatPaymentDeadlineDisplay,
  renderTemplate,
} from '../lib/templateRenderer'
import { sendEmail } from '../lib/sendEmail'
import {
  generatePaymentReceipt,
  getMakassarYYYYMMDD,
  type ReceiptContext,
} from '../lib/receiptPdf'
import {
  DEFAULT_OTP_EMAIL_BODY_HTML,
  DEFAULT_PAYMENT_EMAIL_BODY_HTML,
  DEFAULT_TICKET_EMAIL_BODY_HTML,
  DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML,
  DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML,
  DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML,
  DEFAULT_CANCEL_DECLINE_EMAIL_BODY_HTML,
  defaultFieldValues as D,
} from '../globals/bookingTemplatesDefaults'

/**
 * Phase 4.70.2 — Build brand context dari global fields.
 * Resolve logo URL (relationship ke Media; perlu depth>=1 saat fetch).
 * Fallback semua ke sensible default kalau admin belum isi.
 */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildBrandContext(tpl: Record<string, unknown>): Record<string, string> {
  const logo = tpl.brandLogo as { url?: string; alt?: string } | number | null | undefined
  const logoUrl = typeof logo === 'object' && logo?.url ? logo.url : ''
  const logoAlt = typeof logo === 'object' && logo?.alt ? logo.alt : 'Brand logo'
  const brandName = (tpl.brandCompanyName as string)?.trim() || 'GtJourneysID'
  const brandNameShort = brandName.length > 24 ? 'GtJourneysID' : brandName

  const brandHeaderHtml = logoUrl
    ? `<img src="${escapeAttr(logoUrl)}" alt="${escapeAttr(logoAlt)}" style="height:36px;max-width:200px;vertical-align:middle;">`
    : `<div style="display:inline-block;width:36px;height:36px;background:#0F172A;color:#fff;border-radius:8px;text-align:center;line-height:36px;font-weight:700;font-size:14px;letter-spacing:0.5px;vertical-align:middle;">GT</div><span style="margin-left:10px;font-size:16px;font-weight:700;color:#0F172A;vertical-align:middle;">${escapeAttr(brandNameShort)}</span>`

  return {
    brandHeaderHtml,
    brandAccentColor: (tpl.brandAccentColor as string) || '#0EA5E9',
    brandCompanyName: brandName,
    supportEmail: (tpl.supportEmail as string) || 'billing@gtjourneys.id',
    footerDisclaimer: (tpl.footerDisclaimer as string) || D.footerDisclaimer,
  }
}

/** Pull per-template editable fields from global, fallback ke D defaults. */
function pickTemplateFields(tpl: Record<string, unknown>, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of keys) {
    const v = tpl[k]
    out[k] = (typeof v === 'string' && v.trim()) ? v : ((D as any)[k] ?? '')
  }
  return out
}

/**
 * Phase 4.71.1 — Narrow pre-render untuk inner deadline vars.
 *
 * `renderTemplate` single-pass: HTML template `{{paymentHeroSubtext}}`
 * di-substitusi dgn nilai subtext yang mungkin isinya
 * `"...sebelum {{paymentDeadlineDisplay}}."` — inner `{{...}}` TIDAK
 * ter-render di pass yang sama → customer lihat literal `{{paymentDeadlineDisplay}}`.
 *
 * Fix: resolve 2 time-var ini di string sebelum injection ke ctx.
 * Scope sengaja narrow (hanya paymentDeadline + paymentDeadlineDisplay)
 * supaya outer renderTemplate tetap validate vars lain seperti biasa.
 */
function resolveInnerDeadlineVars(
  text: string,
  deadlineDisplay: string,
  deadlineIso: string,
): string {
  if (!text) return text
  return text
    .replace(/\{\{\s*paymentDeadlineDisplay\s*\}\}/g, deadlineDisplay)
    .replace(/\{\{\s*paymentDeadline\s*\}\}/g, deadlineIso)
}

/** rawVars set yang value-nya trusted HTML (jangan escape saat render). */
const RAW_VARS = new Set(['brandHeaderHtml', 'departureBlock'])

/**
 * Phase 4.70.2.5 — Compose server-side departureBlock HTML.
 *
 * - Kalau snapshot `originalDepartureDate` ADA → render Previous→New dual
 *   block (strikethrough tanggal awal + highlight tanggal baru).
 * - Kalau snapshot KOSONG (booking legacy pre-migrasi 4.70.2.4) → render
 *   single "New departure" card tanpa comparison. Mencegah block Previous
 *   kosong yang bikin bingung customer.
 *
 * Format pakai pattern yg sama dgn email template (table-based + inline
 * CSS supaya kompatibel dgn semua email client).
 */
function buildDepartureBlock(
  booking: Record<string, unknown>,
  brandAccentColor: string,
): string {
  const formatDisplay = (dateIso: unknown, time: unknown): string => {
    if (!dateIso || typeof dateIso !== 'string') return ''
    let dateStr = dateIso
    try {
      const d = new Date(dateIso)
      if (!Number.isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    } catch { /* ignore */ }
    const t = typeof time === 'string' ? time.trim() : ''
    return t ? `${dateStr} · ${t}` : dateStr
  }

  const current = formatDisplay(booking.departureDate, booking.scheduleTimeLabel)
  const original = formatDisplay(booking.originalDepartureDate, booking.originalScheduleTimeLabel)

  // No snapshot → single card.
  if (!original) {
    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  <tr>
    <td style="padding:14px 16px;background:#ECFDF5;border:1px solid #86EFAC;border-radius:8px;">
      <div style="font-size:10px;letter-spacing:0.5px;text-transform:uppercase;color:#047857;font-weight:700;">New Departure</div>
      <div style="margin-top:4px;font-size:16px;font-weight:700;color:#047857;line-height:22px;">${escapeAttr(current)}</div>
    </td>
  </tr>
</table>`
  }

  // Snapshot ada → dual block Previous → New.
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  <tr>
    <td style="width:48%;vertical-align:top;padding:12px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:8px;">
      <div style="font-size:10px;letter-spacing:0.5px;text-transform:uppercase;color:#991B1B;font-weight:700;">Previous</div>
      <div style="margin-top:4px;font-size:14px;font-weight:600;color:#991B1B;text-decoration:line-through;line-height:20px;">${escapeAttr(original)}</div>
    </td>
    <td align="center" style="width:4%;vertical-align:middle;font-size:18px;color:${escapeAttr(brandAccentColor)};">→</td>
    <td style="width:48%;vertical-align:top;padding:12px;background:#ECFDF5;border:1px solid #86EFAC;border-radius:8px;">
      <div style="font-size:10px;letter-spacing:0.5px;text-transform:uppercase;color:#047857;font-weight:700;">New</div>
      <div style="margin-top:4px;font-size:14px;font-weight:700;color:#047857;line-height:20px;">${escapeAttr(current)}</div>
    </td>
  </tr>
</table>`
}

/**
 * Phase 4.70.1 fix — Resolve HTML template dari global dgn fallback ke
 * import default. Global row existing (sebelum migration 4.70.1) punya
 * NULL di kolom HTML; Payload tidak backfill `defaultValue` retroaktif.
 * Fallback memastikan customer selalu dapat email branded tanpa butuh
 * admin manual save.
 */
function resolveHtmlTemplate(
  tplValue: unknown,
  fallback: string,
): string {
  if (typeof tplValue === 'string' && tplValue.trim().length > 0) return tplValue
  return fallback
}

/**
 * Admin handoff endpoints — Phase 4.69.7.
 *
 * Dua custom endpoint untuk tombol admin "Send Payment Instructions" dan
 * "Confirm Payment & Send Ticket" di edit view Booking.
 *
 * Flow umum:
 *   1. Load booking + global `booking-templates`.
 *   2. Build context (passengerList, bankAccountsBlock, paymentDeadline, ...).
 *   3. Render subject + body email + body WA. Kalau error → 400 agregat.
 *   4. (Kalau previewOnly=false) Send email via Resend. Kalau gagal → 500,
 *      booking TIDAK diupdate (rollback-safe).
 *   5. (Kalau sukses) Update booking: status + sent*At/By timestamp.
 *   6. Return rendered content + wa.me deep-link (admin klik manual).
 *
 * Semua endpoint auth via `req.user` (session Payload admin). Role gate:
 * admin+ (super-admin inklusif).
 */

interface HandoffBody {
  previewOnly?: boolean
}

interface HandoffResponse {
  ok: boolean
  previewOnly: boolean
  emailSubject?: string
  emailBody?: string
  emailBodyHtml?: string
  whatsappBody?: string
  waUrl?: string | null
  sentEmailId?: string
  newStatus?: string
  errors?: string[]
  // Phase 4.70.3.1 — receipt metadata di response
  receiptNumber?: string
  receiptPreview?: {
    number: string
    willAttachPdf: boolean
    paymentBank: string
    paymentDate: string
  }
  warning?: string
}

async function readTemplates(req: Parameters<Endpoint['handler']>[0]) {
  return req.payload.findGlobal({
    slug: 'booking-templates',
    overrideAccess: true,
    depth: 1, // Phase 4.70.2 — resolve brandLogo relationship ke Media object (butuh .url)
  }) as Promise<Record<string, unknown>>
}

function requireAdmin(req: Parameters<Endpoint['handler']>[0]): Response | null {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super-admin')) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return null
}

function parseIntId(req: Parameters<Endpoint['handler']>[0]): number | null {
  const idRaw = (req.routeParams as { id?: string })?.id
  const id = Number(idRaw)
  return Number.isFinite(id) && id > 0 ? id : null
}

async function readBody(req: Parameters<Endpoint['handler']>[0]): Promise<HandoffBody> {
  try {
    // Payload v3: req.json() tersedia saat Content-Type application/json.
    const body = (await (req as any).json?.()) ?? {}
    return body as HandoffBody
  } catch {
    return {}
  }
}

/**
 * Step 2.3 — Audit log untuk manual edit field sensitif pada booking yang
 * sudah `confirmed` atau later. Hook `beforeChange` menambahkan 1 entry ke
 * `paymentAuditLog` ketika admin mengubah `paymentBank`, `paymentDate`,
 * atau `departureDate` lewat admin UI atau REST biasa.
 *
 * Guard terhadap duplikasi:
 * - `req.context.skipAuditLogHook: true` di-set oleh send-ticket endpoint
 *   yang punya logika audit sendiri (resend flow). Hook skip supaya tidak
 *   append 2 entry untuk satu transisi.
 *
 * Scope: HANYA 3 field tersebut. Tidak log perubahan PII lain (nama,
 * email, phone, passport) — scope sengaja sempit per playbook §2.3.
 *
 * Status yang trigger hook: post-payment states ("confirmed or later")
 * — tidak termasuk `awaiting_review`/`awaiting_payment`/`payment_review`/
 * `pending` di mana paymentBank/paymentDate memang belum ter-set.
 */
const AUDIT_TRIGGER_STATUSES = new Set<string>([
  'confirmed',
  'reschedule_request',
  'cancel_request',
  'cancelled',
  'expired',
])

const normalizeDate = (v: unknown): string =>
  typeof v === 'string' && v ? v.slice(0, 10) : ''

const normalizeStr = (v: unknown): string => (typeof v === 'string' ? v : '')

const auditManualEditHook: CollectionBeforeChangeHook = ({ data, originalDoc, req, operation }) => {
  if (operation !== 'update' || !originalDoc) return data
  if (req?.context?.skipAuditLogHook) return data

  const prevStatus = typeof originalDoc.status === 'string' ? originalDoc.status : ''
  if (!AUDIT_TRIGGER_STATUSES.has(prevStatus)) return data

  const changes: string[] = []

  // paymentBank: text comparison
  if (data.paymentBank !== undefined) {
    const oldV = normalizeStr(originalDoc.paymentBank)
    const newV = normalizeStr(data.paymentBank)
    if (oldV !== newV) changes.push(`paymentBank: ${oldV || '(none)'} -> ${newV || '(none)'}`)
  }
  // paymentDate + departureDate: compare YYYY-MM-DD (ignore time portion
  // supaya "2026-10-15T00:00:00.000Z" vs "2026-10-15" tidak jadi perubahan).
  for (const key of ['paymentDate', 'departureDate'] as const) {
    if ((data as Record<string, unknown>)[key] !== undefined) {
      const oldV = normalizeDate((originalDoc as Record<string, unknown>)[key])
      const newV = normalizeDate((data as Record<string, unknown>)[key])
      if (oldV !== newV) changes.push(`${key}: ${oldV || '(none)'} -> ${newV || '(none)'}`)
    }
  }

  if (changes.length === 0) return data

  const user = req?.user as { email?: string; id?: number | string } | null | undefined
  const userLabel = user?.email ?? (user?.id != null ? `user#${user.id}` : 'unknown')
  const nowIso = new Date().toISOString()
  const entry = `${nowIso} ${userLabel} | ${changes.join(' | ')} | manual-edit`
  const prevLog =
    typeof (originalDoc as Record<string, unknown>).paymentAuditLog === 'string'
      ? ((originalDoc as Record<string, unknown>).paymentAuditLog as string)
      : ''
  ;(data as Record<string, unknown>).paymentAuditLog = prevLog ? `${prevLog}\n${entry}` : entry
  return data
}

const sendPaymentEndpoint: Endpoint = {
  path: '/:id/send-payment',
  method: 'post',
  handler: async (req) => {
    const forbid = requireAdmin(req)
    if (forbid) return forbid
    const id = parseIntId(req)
    if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })
    const body = await readBody(req)
    const previewOnly = body.previewOnly === true

    try {
      const booking = (await req.payload.findByID({
        collection: 'bookings',
        id,
        overrideAccess: true,
        depth: 0,
      })) as Record<string, unknown>

      // Status gate — hanya awaiting_review yang bisa transition ke awaiting_payment.
      // Preview mode diizinkan untuk semua status supaya admin bisa cek template.
      if (!previewOnly) {
        const status = booking.status as string | undefined
        if (status !== 'awaiting_review' && status !== 'pending') {
          return Response.json(
            {
              ok: false,
              errors: [
                `Booking status "${status}" tidak valid untuk Send Payment. Harus "awaiting_review".`,
              ],
            },
            { status: 409 },
          )
        }
      }

      const tpl = await readTemplates(req)
      const banks = Array.isArray(tpl.bankAccounts)
        ? (tpl.bankAccounts as Array<{ bankName?: string; accountHolder?: string; accountNumber?: string }>)
        : []
      const hours = typeof tpl.paymentDeadlineHours === 'number' ? tpl.paymentDeadlineHours : 24
      const adminName = (tpl.adminName as string | undefined) ?? 'GtJourneysID Team'
      const adminWhatsapp = (tpl.adminWhatsapp as string | undefined) ?? ''

      const siteUrl = process.env.SITE_URL ?? 'http://localhost:4321'
      const confirmationUrl =
        booking.bookingRef && booking.accessToken
          ? `${siteUrl}/checkout/ferry-tickets/confirmation/${booking.bookingRef}?t=${booking.accessToken}`
          : null

      // Phase 4.71.1 — paymentDeadlineDisplay = formatted WITA, dipakai di
      // template default (readable). paymentDeadline (raw ISO) tetap valid
      // sebagai backward-compat.
      const deadlineIso = computePaymentDeadline(hours)
      const paymentDeadlineDisplay = formatPaymentDeadlineDisplay(deadlineIso) ?? deadlineIso

      // Phase 4.71.1 — Pre-resolve inner deadline vars di paymentHeroSubtext
      // sebelum injection ke HTML template. renderTemplate single-pass, jadi
      // `{{paymentHeroSubtext}}` di HTML akan substituted BUT inner
      // `{{paymentDeadlineDisplay}}` tidak ter-render di pass yang sama.
      // Resolve narrow (hanya 2 time vars) di sini — vars lain tidak di-touch
      // supaya outer render tetap validate per biasa.
      const pickedPaymentFields = pickTemplateFields(tpl, ['paymentHeroHeadline', 'paymentHeroSubtext', 'paymentSecurityNote'])
      pickedPaymentFields.paymentHeroSubtext = resolveInnerDeadlineVars(
        pickedPaymentFields.paymentHeroSubtext,
        paymentDeadlineDisplay,
        deadlineIso,
      )

      const ctx = buildContext(booking as any, {
        bankAccountsBlock: formatBankAccountsBlock(banks),
        paymentDeadline: deadlineIso,
        paymentDeadlineDisplay,
        adminName,
        adminWhatsapp,
        confirmationUrl: confirmationUrl ?? undefined,
        // Phase 4.70.2 — brand + per-template editable fields
        ...buildBrandContext(tpl),
        ...pickedPaymentFields,
      })

      const emailSubjectR = renderTemplate(String(tpl.paymentEmailSubject ?? ''), ctx)
      const emailBodyR = renderTemplate(String(tpl.paymentEmailBody ?? ''), ctx)
      const paymentHtml = resolveHtmlTemplate(tpl.paymentEmailBodyHtml, DEFAULT_PAYMENT_EMAIL_BODY_HTML)
      const emailBodyHtmlR = renderTemplate(paymentHtml, ctx, { escapeHtml: true, rawVars: RAW_VARS })
      const waBodyR = renderTemplate(String(tpl.paymentWhatsappBody ?? ''), ctx)

      const errors = [
        ...emailSubjectR.errors.map((e) => `[Email Subject] ${e}`),
        ...emailBodyR.errors.map((e) => `[Email Body] ${e}`),
        ...emailBodyHtmlR.errors.map((e) => `[Email HTML] ${e}`),
        ...waBodyR.errors.map((e) => `[WhatsApp Body] ${e}`),
      ]
      if (errors.length > 0) {
        return Response.json(
          { ok: false, previewOnly, errors } satisfies HandoffResponse,
          { status: 400 },
        )
      }

      const waUrl = buildWaLink(booking.customerWhatsapp as string | undefined, waBodyR.rendered)

      if (previewOnly) {
        return Response.json({
          ok: true,
          previewOnly: true,
          emailSubject: emailSubjectR.rendered,
          emailBody: emailBodyR.rendered,
          emailBodyHtml: emailBodyHtmlR.rendered,
          whatsappBody: waBodyR.rendered,
          waUrl,
        } satisfies HandoffResponse)
      }

      const to = booking.customerEmail as string | undefined
      if (!to) {
        return Response.json(
          {
            ok: false,
            errors: ['Customer email kosong di booking — tidak bisa kirim email payment.'],
          },
          { status: 400 },
        )
      }

      // Step 1.3 — Optimistic lock. Lakukan status transition DULU dengan
      // conditional WHERE (status masih awaiting_review | pending). SQL UPDATE
      // di D1/libsql serialized → hanya 1 request paralel yang bisa flip
      // status; yang lain dapat 0 rows → 409 TANPA mengirim email.
      //
      // Email di-send SETELAH lock didapat. Kalau sendEmail fail, rollback
      // status best-effort ke previousStatus. Trade-off: window kecil dimana
      // booking berstatus `awaiting_payment` padahal email belum sampai; kalau
      // rollback juga fail (langka — DB error setelah DB sukses), admin bisa
      // fix manual via status field.
      //
      // Idempotency key tetap per-user `payment:${bookingRef}:${userId}` —
      // beda design dari send-ticket yang per-attempt (karena send-payment
      // tidak support resend, satu admin satu send).
      const previousStatus = booking.status as string | undefined
      const lockNowIso = new Date().toISOString()
      const lockResult = await req.payload.update({
        collection: 'bookings',
        where: {
          and: [
            { id: { equals: id } },
            { status: { in: ['awaiting_review', 'pending'] } },
          ],
        },
        data: {
          status: 'awaiting_payment',
          sentPaymentAt: lockNowIso,
          sentPaymentBy: req.user!.id,
        },
        overrideAccess: true,
      })
      if (!lockResult?.docs || lockResult.docs.length === 0) {
        return Response.json(
          {
            ok: false,
            error: 'send_payment_lock_lost',
            errors: [
              'Booking sudah di-process oleh request lain. Reload halaman untuk status terbaru.',
            ],
          },
          { status: 409 },
        )
      }

      const sent = await sendEmail({
        to,
        subject: emailSubjectR.rendered,
        text: emailBodyR.rendered,
        html: emailBodyHtmlR.rendered,
        idempotencyKey: `payment:${booking.bookingRef}:${req.user!.id}`,
      })
      if (!sent.ok) {
        // Rollback status best-effort. previousStatus dijamin salah satu dari
        // awaiting_review | pending oleh status gate di atas.
        try {
          await req.payload.update({
            collection: 'bookings',
            id,
            data: {
              status: previousStatus ?? 'awaiting_review',
              sentPaymentAt: null,
              sentPaymentBy: null,
            },
            overrideAccess: true,
          })
        } catch (rollbackErr) {
          // eslint-disable-next-line no-console
          console.error('[send-payment] rollback after email failure failed:', rollbackErr)
        }
        return Response.json(
          {
            ok: false,
            errors: [
              `Email gagal terkirim: ${sent.error ?? 'unknown'}. Status booking sudah di-rollback.`,
            ],
          },
          { status: 502 },
        )
      }

      return Response.json({
        ok: true,
        previewOnly: false,
        emailSubject: emailSubjectR.rendered,
        emailBody: emailBodyR.rendered,
        whatsappBody: waBodyR.rendered,
        waUrl,
        sentEmailId: sent.id,
        newStatus: 'awaiting_payment',
      } satisfies HandoffResponse)
    } catch (e) {
      return Response.json(
        { ok: false, errors: [(e as Error).message] },
        { status: 500 },
      )
    }
  },
}

/**
 * Phase 4.69.9 — Shared handler untuk 2 admin "Send Response" endpoints
 * (reschedule, cancel). Template keys berbeda, status transition berbeda.
 */
interface ResponseConfig {
  templateSubjectKey: string
  templateEmailBodyKey: string
  templateHtmlKey: string
  defaultHtml: string
  /** Phase 4.70.2.6 — Fallback kalau field CMS global kosong (Payload v3 tidak
   *  backfill defaultValue ke row existing). */
  defaultSubject?: string
  defaultEmailBody?: string
  defaultWaBody?: string
  templateWaBodyKey: string
  extraCtxKeys: readonly string[]
  bodyCtxKey: string // key untuk inject rendered body text ke html template (misal rescheduleEmailBody)
  fromStatuses: string[]
  toStatus: string | null
  idempotencyPrefix: string
  /** Phase 4.70.2.6 — Baca toStatus dari field booking (misal preRequestStatus).
   *  Priority: `toStatusFromField` > `toStatus`. Kalau field null, fallback ke toStatus. */
  toStatusFromField?: string
  /** Phase 4.70.2.6 — Admin note dari request body di-inject ke ctx dgn key ini.
   *  Kalau undefined, tidak ada note handling. */
  adminNoteCtxKey?: string
  /** Phase 4.70.2.6 — Kalau true, adminNote WAJIB terisi (min 10 char). */
  adminNoteRequired?: boolean
}

async function handleSendResponse(
  req: Parameters<Endpoint['handler']>[0],
  config: ResponseConfig,
): Promise<Response> {
  const forbid = requireAdmin(req)
  if (forbid) return forbid
  const id = parseIntId(req)
  if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })
  const body = await readBody(req)
  const previewOnly = body.previewOnly === true
  const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() : ''

  // Phase 4.70.2.6 — Validate adminNote kalau endpoint-nya butuh.
  if (config.adminNoteRequired && adminNote.length < 10) {
    return Response.json(
      {
        ok: false,
        errors: ['Admin note / alasan WAJIB diisi minimal 10 karakter.'],
      },
      { status: 400 },
    )
  }

  try {
    const booking = (await req.payload.findByID({
      collection: 'bookings',
      id,
      overrideAccess: true,
      depth: 0,
    })) as Record<string, unknown>

    if (!previewOnly) {
      const status = booking.status as string | undefined
      if (!status || !config.fromStatuses.includes(status)) {
        return Response.json(
          {
            ok: false,
            errors: [
              `Booking status "${status}" tidak valid untuk endpoint ini. Harus salah satu: ${config.fromStatuses.join(', ')}.`,
            ],
          },
          { status: 409 },
        )
      }
    }

    const tpl = await readTemplates(req)
    const adminName = (tpl.adminName as string | undefined) ?? 'GtJourneysID Team'
    const adminWhatsapp = (tpl.adminWhatsapp as string | undefined) ?? ''

    const siteUrl = process.env.SITE_URL ?? 'http://localhost:4321'
    const confirmationUrl =
      booking.bookingRef && booking.accessToken
        ? `${siteUrl}/checkout/ferry-tickets/confirmation/${booking.bookingRef}?t=${booking.accessToken}`
        : null

    // Phase 4.70.2.4 — reschedule template butuh bank accounts (post-reschedule
    // customer belum bayar). Cancel template tidak butuh.
    const banks = Array.isArray(tpl.bankAccounts)
      ? (tpl.bankAccounts as Array<{ bankName?: string; accountHolder?: string; accountNumber?: string }>)
      : []

    // Phase 4.70.2.5 — Compose server-side departureBlock. Kalau snapshot
     // originalDepartureDate kosong (booking legacy pre-migrasi 4.70.2.4),
     // render single "New departure" card tanpa Previous→New dual block.
    const brandAccent = (tpl.brandAccentColor as string) || '#0EA5E9'
    const departureBlock = buildDepartureBlock(booking, brandAccent)

    // Phase 4.70.2.6 — Admin note untuk confirm/decline reschedule.
    // Default kalau empty string (confirm): render placeholder supaya template
    // tidak kosong secara visual. Decline sudah divalidasi di atas (required).
    const adminNoteCtx: Record<string, string> = {}
    if (config.adminNoteCtxKey) {
      adminNoteCtx[config.adminNoteCtxKey] =
        adminNote || 'Tidak ada catatan tambahan.'
    }

    const ctx = buildContext(booking as any, {
      passengerList: formatPassengerList((booking.passengers as any) ?? []),
      bankAccountsBlock: formatBankAccountsBlock(banks),
      adminName,
      adminWhatsapp,
      confirmationUrl: confirmationUrl ?? undefined,
      // Phase 4.70.2 — brand + per-template fields + customer request reason (audit)
      ...buildBrandContext(tpl),
      ...pickTemplateFields(tpl, config.extraCtxKeys),
      customerRequestReason: (booking.customerRequestReason as string) || '(tidak disebutkan)',
      departureBlock,
      ...adminNoteCtx,
    })

    // Phase 4.70.2.6 — Fallback ke config.default* kalau field CMS kosong.
    const resolveText = (val: unknown, fallback: string | undefined): string => {
      if (typeof val === 'string' && val.trim()) return val
      return fallback ?? ''
    }
    const subjectR = renderTemplate(resolveText(tpl[config.templateSubjectKey], config.defaultSubject), ctx)
    const emailBodyR = renderTemplate(resolveText(tpl[config.templateEmailBodyKey], config.defaultEmailBody), ctx)
    const waBodyR = renderTemplate(resolveText(tpl[config.templateWaBodyKey], config.defaultWaBody), ctx)

    // Phase 4.70.2 — Render HTML dgn body text injected sebagai var (misal
    // {{rescheduleEmailBody}} = rendered admin text). Body SUDAH escaped
    // oleh render pertama (ctx has escape via renderTemplate pass later),
    // tapi karena ini injected ke HTML slot, kita escape manual sekali
    // supaya safe.
    const htmlTemplate = resolveHtmlTemplate(tpl[config.templateHtmlKey], config.defaultHtml)
    const ctxWithBody = { ...ctx, [config.bodyCtxKey]: emailBodyR.rendered }
    const emailBodyHtmlR = renderTemplate(htmlTemplate, ctxWithBody, { escapeHtml: true, rawVars: RAW_VARS })

    const errors = [
      ...subjectR.errors.map((e) => `[Email Subject] ${e}`),
      ...emailBodyR.errors.map((e) => `[Email Body] ${e}`),
      ...emailBodyHtmlR.errors.map((e) => `[Email HTML] ${e}`),
      ...waBodyR.errors.map((e) => `[WhatsApp Body] ${e}`),
    ]
    if (errors.length > 0) {
      return Response.json(
        { ok: false, previewOnly, errors } satisfies HandoffResponse,
        { status: 400 },
      )
    }

    const waUrl = buildWaLink(booking.customerWhatsapp as string | undefined, waBodyR.rendered)

    if (previewOnly) {
      return Response.json({
        ok: true,
        previewOnly: true,
        emailSubject: subjectR.rendered,
        emailBody: emailBodyR.rendered,
        emailBodyHtml: emailBodyHtmlR.rendered,
        whatsappBody: waBodyR.rendered,
        waUrl,
      } satisfies HandoffResponse)
    }

    const to = booking.customerEmail as string | undefined
    if (!to) {
      return Response.json(
        { ok: false, errors: ['Customer email kosong — tidak bisa kirim response.'] },
        { status: 400 },
      )
    }

    const sent = await sendEmail({
      to,
      subject: subjectR.rendered,
      text: emailBodyR.rendered,
      html: emailBodyHtmlR.rendered,
      idempotencyKey: `${config.idempotencyPrefix}:${booking.bookingRef}:${req.user!.id}`,
    })
    if (!sent.ok) {
      return Response.json(
        { ok: false, errors: [`Email gagal terkirim: ${sent.error ?? 'unknown'}`] },
        { status: 502 },
      )
    }

    // Phase 4.70.2.6 — Resolve final toStatus:
    // 1. Kalau config.toStatusFromField ada → baca dari booking field.
    //    Kalau field null, fallback ke config.toStatus.
    // 2. Kalau config.toStatusFromField tidak set → pakai config.toStatus langsung.
    let resolvedToStatus: string | null = config.toStatus
    if (config.toStatusFromField) {
      const fieldVal = booking[config.toStatusFromField]
      if (typeof fieldVal === 'string' && fieldVal) {
        resolvedToStatus = fieldVal
      }
    }

    if (resolvedToStatus !== null) {
      // Phase 4.70.2.6 — Setelah confirm/decline reschedule, bersihkan
      // field customer-request supaya banner alert hilang + snapshot
      // original departure ter-reset (new reschedule request start clean).
      const cleanup =
        config.toStatusFromField === 'preRequestStatus'
          ? {
              customerRequestKind: null,
              customerRequestReason: null,
              customerRequestedAt: null,
              originalDepartureDate: null,
              originalScheduleTimeLabel: null,
              preRequestStatus: null,
            }
          : {}

      await req.payload.update({
        collection: 'bookings',
        id,
        data: { status: resolvedToStatus, ...cleanup },
        overrideAccess: true,
      })
    }

    return Response.json({
      ok: true,
      previewOnly: false,
      emailSubject: subjectR.rendered,
      emailBody: emailBodyR.rendered,
      whatsappBody: waBodyR.rendered,
      waUrl,
      sentEmailId: sent.id,
      newStatus: resolvedToStatus ?? (booking.status as string),
    } satisfies HandoffResponse)
  } catch (e) {
    return Response.json(
      { ok: false, errors: [(e as Error).message] },
      { status: 500 },
    )
  }
}

/**
 * Phase 4.69.9 — Customer-triggered request (reschedule/cancel).
 * Called by web endpoint (API-key auth = role admin). Payload REST PATCH
 * generic failure → custom endpoint pakai Local API.
 */
const customerRequestEndpoint: Endpoint = {
  path: '/:id/customer-request',
  method: 'post',
  handler: async (req) => {
    const forbid = requireAdmin(req)
    if (forbid) return forbid
    const id = parseIntId(req)
    if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })

    const body = await readBody(req) as { kind?: string; reason?: string }
    const kind = body.kind
    const reason = (body.reason ?? '').trim()
    if (kind !== 'reschedule' && kind !== 'cancel') {
      return Response.json({ ok: false, error: 'bad_kind' }, { status: 400 })
    }
    if (reason.length < 10 || reason.length > 500) {
      return Response.json({ ok: false, error: 'reason_length' }, { status: 400 })
    }

    try {
      const booking = (await req.payload.findByID({
        collection: 'bookings',
        id,
        overrideAccess: true,
        depth: 0,
      })) as Record<string, unknown>

      const status = booking.status as string
      // Phase 4.70.2.7 — One-shot: tolak kalau sudah pernah request.
      if (booking.hasRequestedChange === true) {
        return Response.json(
          {
            ok: false,
            error: 'already_requested',
            message:
              'Permintaan perubahan untuk booking ini sudah pernah diajukan. Silakan kontak admin via WhatsApp untuk kebutuhan lanjutan.',
          },
          { status: 409 },
        )
      }
      // Phase 4.70.2.4 + 4.70.2.9 — Semua customer-triggered change
      // request hanya pre-payment:
      // - Reschedule: tiket post-payment sudah issued → reissue kompleks.
      // - Cancel: setelah e-ticket terkirim (confirmed), pembatalan harus
      //   lewat admin manual (refund flow + void tiket operator). Prevent
      //   abuse (customer booking + cancel-refund loop).
      const activeStatuses = [
        'awaiting_review',
        'awaiting_payment',
        'payment_review',
        'pending',
      ]
      if (!activeStatuses.includes(status)) {
        return Response.json(
          {
            ok: false,
            error: 'status_locked',
            message:
              status === 'confirmed'
                ? `${kind === 'reschedule' ? 'Reschedule' : 'Pembatalan'} tidak tersedia setelah e-ticket terkirim. Silakan kontak admin via WhatsApp untuk request khusus.`
                : `Booking status "${status}" tidak bisa di-request change.`,
          },
          { status: 409 },
        )
      }

      const newStatus = kind === 'reschedule' ? 'reschedule_request' : 'cancel_request'
      // Phase 4.70.2.4 — Snapshot original departure saat kind=reschedule
      // supaya admin bisa lihat "Previous → New departure" di email response
      // setelah admin ubah departureDate.
      // Phase 4.70.2.6 — Juga snapshot preRequestStatus supaya setelah
      // admin confirm/decline, booking bisa restore ke status lifecycle
      // yang benar (misal awaiting_payment, payment_review).
      const snapshotData: Record<string, unknown> =
        kind === 'reschedule'
          ? {
              originalDepartureDate: booking.departureDate as string | null,
              originalScheduleTimeLabel: booking.scheduleTimeLabel as string | null,
              preRequestStatus: status,
            }
          : {
              preRequestStatus: status,
            }

      await req.payload.update({
        collection: 'bookings',
        id,
        data: {
          status: newStatus,
          customerRequestKind: kind,
          customerRequestReason: reason,
          customerRequestedAt: new Date().toISOString(),
          hasRequestedChange: true, // Phase 4.70.2.7 — one-shot flag
          ...snapshotData,
        },
        overrideAccess: true,
      })

      return Response.json({ ok: true, newStatus, kind })
    } catch (e) {
      return Response.json(
        { ok: false, error: 'server_error', message: (e as Error).message },
        { status: 500 },
      )
    }
  },
}

/**
 * Phase 4.70.2.6 — Admin CONFIRM reschedule.
 * - Admin sudah update departureDate manual sebelum klik.
 * - Email dikirim pakai template "Disetujui" (confirm variant).
 * - adminNote OPSIONAL (misal info biaya tambahan).
 * - Status restore ke preRequestStatus (sebelum customer request).
 */
const DEFAULT_RESCHEDULE_CONFIRM_SUBJECT = 'Reschedule Disetujui — Booking {{bookingRef}}'
const DEFAULT_RESCHEDULE_CONFIRM_BODY = 'Hi {{customerName}},\n\nPermintaan reschedule untuk booking {{bookingRef}} sudah DISETUJUI.\n\nJadwal baru: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nCatatan tambahan:\n{{rescheduleConfirmNote}}\n\nSilakan selesaikan pembayaran sebelum keberangkatan.\n\nTerima kasih,\nGtJourneysID'
const DEFAULT_RESCHEDULE_CONFIRM_WA = '✅ Reschedule DISETUJUI untuk booking {{bookingRef}}.\n\n📅 Jadwal baru: {{departureDisplay}}\n📍 Route: {{originLocation}} → {{destinationLocation}}\n\nCatatan: {{rescheduleConfirmNote}}\n\nSelesaikan pembayaran sebelum keberangkatan ya. Terima kasih! 🙏'
const DEFAULT_RESCHEDULE_DECLINE_SUBJECT = 'Reschedule Belum Bisa Diproses — Booking {{bookingRef}}'
const DEFAULT_RESCHEDULE_DECLINE_BODY = 'Hi {{customerName}},\n\nMohon maaf, permintaan reschedule untuk booking {{bookingRef}} BELUM BISA kami proses.\n\nAlasan:\n{{rescheduleDeclineReason}}\n\nBooking Anda tetap berlaku sesuai jadwal semula: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nKalau butuh diskusi alternatif, hubungi admin via WhatsApp.\n\nTerima kasih,\nGtJourneysID'
const DEFAULT_RESCHEDULE_DECLINE_WA = '❌ Mohon maaf, reschedule booking {{bookingRef}} belum bisa diproses.\n\nAlasan: {{rescheduleDeclineReason}}\n\nBooking tetap berlaku jadwal semula: {{departureDisplay}}.\nKontak admin kalau butuh diskusi alternatif ya.'

const confirmRescheduleEndpoint: Endpoint = {
  path: '/:id/confirm-reschedule',
  method: 'post',
  handler: (req) =>
    handleSendResponse(req, {
      templateSubjectKey: 'rescheduleConfirmEmailSubject',
      templateEmailBodyKey: 'rescheduleConfirmEmailBody',
      templateHtmlKey: 'rescheduleConfirmEmailBodyHtml',
      defaultHtml: DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML,
      defaultSubject: DEFAULT_RESCHEDULE_CONFIRM_SUBJECT,
      defaultEmailBody: DEFAULT_RESCHEDULE_CONFIRM_BODY,
      defaultWaBody: DEFAULT_RESCHEDULE_CONFIRM_WA,
      templateWaBodyKey: 'rescheduleConfirmWhatsappBody',
      extraCtxKeys: ['rescheduleConfirmHeroHeadline', 'rescheduleConfirmHeroSubtext'],
      bodyCtxKey: 'rescheduleConfirmEmailBody',
      fromStatuses: ['reschedule_request'],
      toStatus: 'awaiting_payment', // fallback kalau preRequestStatus null
      toStatusFromField: 'preRequestStatus',
      adminNoteCtxKey: 'rescheduleConfirmNote',
      adminNoteRequired: false,
      idempotencyPrefix: 'reschedule-confirm',
    }),
}

/**
 * Phase 4.70.2.6 — Admin DECLINE reschedule.
 * - Jadwal TIDAK berubah; admin diingatkan jangan edit departureDate.
 * - Email dikirim pakai template "Mohon Maaf" (decline variant).
 * - adminNote WAJIB (alasan — min 10 char).
 * - Status restore ke preRequestStatus.
 */
const declineRescheduleEndpoint: Endpoint = {
  path: '/:id/decline-reschedule',
  method: 'post',
  handler: (req) =>
    handleSendResponse(req, {
      templateSubjectKey: 'rescheduleDeclineEmailSubject',
      templateEmailBodyKey: 'rescheduleDeclineEmailBody',
      templateHtmlKey: 'rescheduleDeclineEmailBodyHtml',
      defaultHtml: DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML,
      defaultSubject: DEFAULT_RESCHEDULE_DECLINE_SUBJECT,
      defaultEmailBody: DEFAULT_RESCHEDULE_DECLINE_BODY,
      defaultWaBody: DEFAULT_RESCHEDULE_DECLINE_WA,
      templateWaBodyKey: 'rescheduleDeclineWhatsappBody',
      extraCtxKeys: ['rescheduleDeclineHeroHeadline', 'rescheduleDeclineHeroSubtext'],
      bodyCtxKey: 'rescheduleDeclineEmailBody',
      fromStatuses: ['reschedule_request'],
      toStatus: 'awaiting_payment',
      toStatusFromField: 'preRequestStatus',
      adminNoteCtxKey: 'rescheduleDeclineReason',
      adminNoteRequired: true,
      idempotencyPrefix: 'reschedule-decline',
    }),
}

// Phase 4.70.2.8 — Cancel Confirm/Decline split (mirror reschedule 4.70.2.6)
const DEFAULT_CANCEL_CONFIRM_SUBJECT = 'Pembatalan Booking {{bookingRef}} Dikonfirmasi'
const DEFAULT_CANCEL_CONFIRM_BODY = 'Hi {{customerName}},\n\nPembatalan untuk booking {{bookingRef}} sudah DIKONFIRMASI.\n\nJadwal yang dibatalkan: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nCatatan dari admin:\n{{cancelConfirmNote}}\n\nTerima kasih,\nGtJourneysID'
const DEFAULT_CANCEL_CONFIRM_WA = '❌ Pembatalan DIKONFIRMASI untuk booking {{bookingRef}}.\n\n📅 Jadwal yg dibatalkan: {{departureDisplay}}\n📍 Route: {{originLocation}} → {{destinationLocation}}\n\nCatatan: {{cancelConfirmNote}}\n\nTerima kasih! 🙏'
const DEFAULT_CANCEL_DECLINE_SUBJECT = 'Pembatalan Booking {{bookingRef}} Belum Bisa Diproses'
const DEFAULT_CANCEL_DECLINE_BODY = 'Hi {{customerName}},\n\nMohon maaf, permintaan pembatalan untuk booking {{bookingRef}} BELUM BISA kami proses.\n\nAlasan:\n{{cancelDeclineReason}}\n\nBooking Anda tetap berlaku sesuai jadwal semula: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nSilakan lanjut pembayaran kalau belum selesai. Kalau butuh diskusi, hubungi admin via WhatsApp.\n\nTerima kasih,\nGtJourneysID'
const DEFAULT_CANCEL_DECLINE_WA = '⚠ Mohon maaf, pembatalan booking {{bookingRef}} belum bisa diproses.\n\nAlasan: {{cancelDeclineReason}}\n\nBooking tetap berlaku: {{departureDisplay}}.\nLanjut pembayaran atau diskusi via WA ya.'

const confirmCancelEndpoint: Endpoint = {
  path: '/:id/confirm-cancel',
  method: 'post',
  handler: (req) =>
    handleSendResponse(req, {
      templateSubjectKey: 'cancelConfirmEmailSubject',
      templateEmailBodyKey: 'cancelConfirmEmailBody',
      templateHtmlKey: 'cancelConfirmEmailBodyHtml',
      defaultHtml: DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML,
      defaultSubject: DEFAULT_CANCEL_CONFIRM_SUBJECT,
      defaultEmailBody: DEFAULT_CANCEL_CONFIRM_BODY,
      defaultWaBody: DEFAULT_CANCEL_CONFIRM_WA,
      templateWaBodyKey: 'cancelConfirmWhatsappBody',
      extraCtxKeys: ['cancelConfirmHeroHeadline', 'cancelConfirmHeroSubtext'],
      bodyCtxKey: 'cancelConfirmEmailBody',
      fromStatuses: ['cancel_request'],
      toStatus: 'cancelled',
      adminNoteCtxKey: 'cancelConfirmNote',
      adminNoteRequired: false,
      idempotencyPrefix: 'cancel-confirm',
    }),
}

const declineCancelEndpoint: Endpoint = {
  path: '/:id/decline-cancel',
  method: 'post',
  handler: (req) =>
    handleSendResponse(req, {
      templateSubjectKey: 'cancelDeclineEmailSubject',
      templateEmailBodyKey: 'cancelDeclineEmailBody',
      templateHtmlKey: 'cancelDeclineEmailBodyHtml',
      defaultHtml: DEFAULT_CANCEL_DECLINE_EMAIL_BODY_HTML,
      defaultSubject: DEFAULT_CANCEL_DECLINE_SUBJECT,
      defaultEmailBody: DEFAULT_CANCEL_DECLINE_BODY,
      defaultWaBody: DEFAULT_CANCEL_DECLINE_WA,
      templateWaBodyKey: 'cancelDeclineWhatsappBody',
      extraCtxKeys: ['cancelDeclineHeroHeadline', 'cancelDeclineHeroSubtext'],
      bodyCtxKey: 'cancelDeclineEmailBody',
      fromStatuses: ['cancel_request'],
      toStatus: 'awaiting_payment',
      toStatusFromField: 'preRequestStatus',
      adminNoteCtxKey: 'cancelDeclineReason',
      adminNoteRequired: true,
      idempotencyPrefix: 'cancel-decline',
    }),
}

const sendTicketEndpoint: Endpoint = {
  path: '/:id/send-ticket',
  method: 'post',
  handler: async (req) => {
    const forbid = requireAdmin(req)
    if (forbid) return forbid
    const id = parseIntId(req)
    if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })
    const body = await readBody(req)
    const previewOnly = body.previewOnly === true
    const paymentBankInput = typeof body.paymentBank === 'string' ? body.paymentBank.trim() : ''
    const paymentDateInput = typeof body.paymentDate === 'string' ? body.paymentDate.trim() : ''

    try {
      const booking = (await req.payload.findByID({
        collection: 'bookings',
        id,
        overrideAccess: true,
        depth: 0,
      })) as Record<string, unknown>

      // Phase 4.70.3.1 — Allow resend dari status `confirmed` (misal PDF
      // gagal di first send, admin retry). Dari `payment_review`/`awaiting_payment`
      // = first send. Dari `confirmed` = resend, reuse receiptNumber + receiptIssuedAt.
      const bookingStatus = booking.status as string | undefined
      const isResend = bookingStatus === 'confirmed'
      if (!previewOnly) {
        const allowed = ['payment_review', 'awaiting_payment', 'confirmed']
        if (!bookingStatus || !allowed.includes(bookingStatus)) {
          return Response.json(
            {
              ok: false,
              errors: [
                `Booking status "${bookingStatus}" tidak valid untuk Send Receipt. Harus salah satu: ${allowed.join(', ')}.`,
              ],
            },
            { status: 409 },
          )
        }

        // Step 1.2 — Server-side 30s rate-limit guard. Reject duplicate
        // send-ticket attempts within 30 detik dari previous attempt. Pakai
        // field existing:
        // - `sentTicketAt`: set di first-send, frozen di resend. Anchor
        //   "booking ini pernah di-send".
        // - `updatedAt`: Payload auto-field, bump setiap write (termasuk
        //   resend). Timestamp "last activity".
        // Guard aktif HANYA kalau sentTicketAt sudah set (first-send fresh
        // booking tidak terblokir oleh manual-edit yang bump updatedAt).
        // previewOnly di-skip per playbook §1.2. Idempotency key per-attempt
        // tetap dipertahankan (lihat line ~1136) supaya resend setelah
        // 30 detik atau setelah PDF failure tetap kirim email baru.
        if (typeof booking.sentTicketAt === 'string') {
          const sentAtMs = new Date(booking.sentTicketAt).getTime()
          let lastAttemptMs = Number.isNaN(sentAtMs) ? null : sentAtMs
          if (typeof booking.updatedAt === 'string') {
            const updatedAtMs = new Date(booking.updatedAt).getTime()
            if (!Number.isNaN(updatedAtMs) && (lastAttemptMs === null || updatedAtMs > lastAttemptMs)) {
              lastAttemptMs = updatedAtMs
            }
          }
          if (lastAttemptMs !== null) {
            const elapsed = Date.now() - lastAttemptMs
            if (elapsed < 30_000) {
              const secondsLeft = Math.ceil((30_000 - elapsed) / 1000)
              return Response.json(
                {
                  ok: false,
                  error: 'send_ticket_rate_limited',
                  errors: [
                    `Receipt baru saja dikirim atau booking baru di-update. Mohon tunggu ${secondsLeft} detik sebelum mencoba lagi (proteksi anti-duplikat).`,
                  ],
                },
                { status: 409 },
              )
            }
          }
        }
      }

      const tpl = await readTemplates(req)
      const adminName = (tpl.adminName as string | undefined) ?? 'GtJourneysID Team'
      const adminWhatsapp = (tpl.adminWhatsapp as string | undefined) ?? ''

      // Phase 4.70.3.1 — Payment validation (skip untuk previewOnly supaya
      // admin bisa cek template tanpa input bank/date lengkap).
      const banks = Array.isArray(tpl.bankAccounts)
        ? (tpl.bankAccounts as Array<{ bankName?: string; accountHolder?: string; accountNumber?: string }>)
        : []
      if (!previewOnly) {
        if (banks.length === 0) {
          return Response.json(
            { ok: false, errors: ['Bank Accounts belum dikonfigurasi di global Booking Templates → tab Bank Accounts.'] },
            { status: 400 },
          )
        }
        if (!paymentBankInput) {
          return Response.json(
            { ok: false, errors: ['Payment Bank wajib diisi.'] },
            { status: 400 },
          )
        }
        const bankNames = banks.map((b) => (b.bankName ?? '').trim()).filter(Boolean)
        if (!bankNames.includes(paymentBankInput)) {
          return Response.json(
            { ok: false, errors: [`Payment Bank "${paymentBankInput}" tidak terdaftar di bank accounts.`] },
            { status: 400 },
          )
        }
        if (!paymentDateInput) {
          return Response.json(
            { ok: false, errors: ['Payment Date wajib diisi.'] },
            { status: 400 },
          )
        }
        // Reject future date (Asia/Makassar comparison via YYYYMMDD).
        const todayMakassar = getMakassarYYYYMMDD()
        const inputYYYYMMDD = (() => {
          try {
            return getMakassarYYYYMMDD(new Date(paymentDateInput))
          } catch { return '99999999' }
        })()
        if (inputYYYYMMDD > todayMakassar) {
          return Response.json(
            { ok: false, error: 'payment_date_future', errors: ['Tanggal pembayaran tidak boleh di masa depan.'] },
            { status: 400 },
          )
        }
      }

      const siteUrl = process.env.SITE_URL ?? 'http://localhost:4321'
      const confirmationUrl =
        booking.bookingRef && booking.accessToken
          ? `${siteUrl}/checkout/ferry-tickets/confirmation/${booking.bookingRef}?t=${booking.accessToken}`
          : null

      // Phase 4.70.3.1 — Receipt metadata (frozen on first-issue; reuse on resend).
      const existingReceiptNumber = typeof booking.receiptNumber === 'string' ? booking.receiptNumber : null
      const existingReceiptIssuedAt = typeof booking.receiptIssuedAt === 'string' ? booking.receiptIssuedAt : null
      const issueDateObj = new Date()
      const receiptNumber =
        existingReceiptNumber ??
        `RCPT-${booking.bookingRef}-${getMakassarYYYYMMDD(issueDateObj)}`
      const receiptIssuedAt = existingReceiptIssuedAt ?? issueDateObj.toISOString()

      // Phase 4.70.3.1 — Build receipt context + try generate PDF.
      // Fallbacks runtime untuk field receipt yang kosong di CMS.
      const receiptBusinessName =
        (typeof tpl.receiptBusinessName === 'string' && tpl.receiptBusinessName.trim())
          ? tpl.receiptBusinessName
          : (D.receiptBusinessName as string)
      const receiptDisclaimerText =
        (typeof tpl.receiptDisclaimerText === 'string' && tpl.receiptDisclaimerText.trim())
          ? tpl.receiptDisclaimerText
          : (D.receiptDisclaimerText as string)

      let pdfBytes: Uint8Array | null = null
      let pdfError: string | null = null
      if (!previewOnly) {
        try {
          const passengersList = Array.isArray(booking.passengers)
            ? (booking.passengers as Array<Record<string, unknown>>)
            : []
          const receiptCtx: ReceiptContext = {
            businessName: receiptBusinessName,
            businessAddress: typeof tpl.receiptAddress === 'string' ? tpl.receiptAddress : undefined,
            businessId: typeof tpl.receiptBusinessId === 'string' && tpl.receiptBusinessId.trim()
              ? tpl.receiptBusinessId
              : undefined,
            receiptNumber,
            issueDate: receiptIssuedAt,
            customerName: String(booking.customerName ?? ''),
            customerEmail: String(booking.customerEmail ?? ''),
            bookingRef: String(booking.bookingRef ?? ''),
            originLocation: String(booking.originLocation ?? ''),
            destinationLocation: String(booking.destinationLocation ?? ''),
            departureDisplay: formatDeparture(booking.departureDate as string | null, booking.scheduleTimeLabel as string | null),
            ferryClassName: String(booking.ferryClassName ?? ''),
            adults: Number(booking.adults ?? 0),
            children: Number(booking.children ?? 0),
            passengers: passengersList.map((p) => ({
              fullName: [p.firstName, p.lastName].filter(Boolean).join(' ') || '-',
              type: (p.passengerType === 'child' ? 'child' : 'adult') as 'adult' | 'child',
            })),
            currency: String(booking.currency ?? 'IDR'),
            totalEstimate: (booking.totalEstimate as number) ?? 0,
            paymentBank: paymentBankInput || String(booking.paymentBank ?? '-'),
            paymentDate: paymentDateInput || String(booking.paymentDate ?? issueDateObj.toISOString()),
            disclaimerText: receiptDisclaimerText,
            footerNote: typeof tpl.receiptFooterNote === 'string' ? tpl.receiptFooterNote : undefined,
          }
          pdfBytes = await generatePaymentReceipt(receiptCtx)
        } catch (e) {
          pdfError = (e as Error).message
          // eslint-disable-next-line no-console
          console.error('[send-ticket] PDF generation failed:', pdfError)
        }
      }

      // Phase 4.70.3.1 — Inject receiptAttachedNote variant berdasarkan hasil PDF.
      const receiptAttachedNote = pdfBytes
        ? (D.receiptAttachedNoteSuccess as string)
        : (D.receiptAttachedNoteFailed as string)

      const ctx = buildContext(booking as any, {
        passengerList: formatPassengerList((booking.passengers as any) ?? []),
        adminName,
        adminWhatsapp,
        confirmationUrl: confirmationUrl ?? undefined,
        // Phase 4.70.2
        ...buildBrandContext(tpl),
        ...pickTemplateFields(tpl, ['ticketHeroHeadline', 'ticketHeroSubtext', 'ticketChecklistTitle']),
        // Phase 4.70.3.1
        receiptAttachedNote,
      })

      const emailSubjectR = renderTemplate(String(tpl.ticketEmailSubject ?? ''), ctx)
      const emailBodyR = renderTemplate(String(tpl.ticketEmailBody ?? ''), ctx)
      const ticketHtml = resolveHtmlTemplate(tpl.ticketEmailBodyHtml, DEFAULT_TICKET_EMAIL_BODY_HTML)
      const emailBodyHtmlR = renderTemplate(ticketHtml, ctx, { escapeHtml: true, rawVars: RAW_VARS })
      const waBodyR = renderTemplate(String(tpl.ticketWhatsappBody ?? ''), ctx)

      const errors = [
        ...emailSubjectR.errors.map((e) => `[Email Subject] ${e}`),
        ...emailBodyR.errors.map((e) => `[Email Body] ${e}`),
        ...emailBodyHtmlR.errors.map((e) => `[Email HTML] ${e}`),
        ...waBodyR.errors.map((e) => `[WhatsApp Body] ${e}`),
      ]
      if (errors.length > 0) {
        return Response.json(
          { ok: false, previewOnly, errors } satisfies HandoffResponse,
          { status: 400 },
        )
      }

      const waUrl = buildWaLink(booking.customerWhatsapp as string | undefined, waBodyR.rendered)

      if (previewOnly) {
        return Response.json({
          ok: true,
          previewOnly: true,
          emailSubject: emailSubjectR.rendered,
          emailBody: emailBodyR.rendered,
          emailBodyHtml: emailBodyHtmlR.rendered,
          whatsappBody: waBodyR.rendered,
          waUrl,
          // Hint untuk admin UI
          receiptPreview: {
            number: receiptNumber,
            willAttachPdf: true,
            paymentBank: paymentBankInput || (banks[0]?.bankName ?? ''),
            paymentDate: paymentDateInput,
          },
        } satisfies HandoffResponse)
      }

      const to = booking.customerEmail as string | undefined
      if (!to) {
        return Response.json(
          { ok: false, errors: ['Customer email kosong — tidak bisa kirim payment receipt.'] },
          { status: 400 },
        )
      }

      // Phase 4.70.3.1 — Email attachments (opsional, hanya kalau PDF berhasil).
      const attachments = pdfBytes
        ? [{
            filename: `${receiptNumber}.pdf`,
            content: uint8ArrayToBase64(pdfBytes),
            content_type: 'application/pdf',
          }]
        : undefined

      // Idempotency key per-attempt (Date.now ms) supaya resend tidak dedup.
      const sent = await sendEmail({
        to,
        subject: emailSubjectR.rendered,
        text: emailBodyR.rendered,
        html: emailBodyHtmlR.rendered,
        attachments,
        idempotencyKey: `ticket:${booking.bookingRef}:${Date.now()}`,
      })
      if (!sent.ok) {
        return Response.json(
          { ok: false, errors: [`Email gagal terkirim: ${sent.error ?? 'unknown'}`] },
          { status: 502 },
        )
      }

      // Phase 4.70.3.1 — Persist metadata. FROZEN on first-issue, overwrite
      // paymentBank/Date on resend. sentTicketAt juga frozen kalau sudah set.
      const nowIso = new Date().toISOString()
      const updateData: Record<string, unknown> = {
        status: 'confirmed',
        sentTicketAt: isResend && booking.sentTicketAt ? booking.sentTicketAt : nowIso,
        sentTicketBy: isResend && booking.sentTicketBy ? booking.sentTicketBy : req.user!.id,
        receiptNumber,
        receiptIssuedAt,
        paymentBank: paymentBankInput,
        paymentDate: paymentDateInput,
      }

      // Phase 4.70.3.1 (post-review) — Audit log untuk resend changes.
      // Hanya tulis saat RESEND (status pre-send sudah `confirmed`) dan ada
      // perubahan bank atau date dari nilai sebelumnya.
      if (isResend) {
        const prevBank = typeof booking.paymentBank === 'string' ? booking.paymentBank : ''
        const prevDate = typeof booking.paymentDate === 'string' ? booking.paymentDate.slice(0, 10) : ''
        const newDate = paymentDateInput.slice(0, 10)
        const changes: string[] = []
        if (prevBank !== paymentBankInput) {
          changes.push(`paymentBank: ${prevBank || '(none)'} -> ${paymentBankInput}`)
        }
        if (prevDate !== newDate) {
          changes.push(`paymentDate: ${prevDate || '(none)'} -> ${newDate}`)
        }
        const userEmail = (req.user as { email?: string } | null)?.email ?? `user#${req.user!.id}`
        const prevLog = typeof booking.paymentAuditLog === 'string' ? booking.paymentAuditLog : ''
        const header = `${nowIso} ${userEmail}`
        const entry = changes.length > 0
          ? `${header} | ${changes.join(' | ')}`
          : `${header} | resend (no field changes)`
        updateData.paymentAuditLog = prevLog ? `${prevLog}\n${entry}` : entry
      }
      await req.payload.update({
        collection: 'bookings',
        id,
        data: updateData,
        overrideAccess: true,
        // Step 2.3 — Skip beforeChange audit hook: send-ticket resend
        // sudah tulis entry audit sendiri (lihat updateData.paymentAuditLog
        // di atas). Tanpa flag ini akan dapat 2 entry per resend.
        context: { skipAuditLogHook: true },
      })

      const response: HandoffResponse = {
        ok: true,
        previewOnly: false,
        emailSubject: emailSubjectR.rendered,
        emailBody: emailBodyR.rendered,
        whatsappBody: waBodyR.rendered,
        waUrl,
        sentEmailId: sent.id,
        newStatus: 'confirmed',
        receiptNumber,
      }
      if (pdfError) {
        response.warning = `pdf_generation_failed: ${pdfError}. Email terkirim tanpa attachment. Admin bisa klik "Confirm & Send" lagi untuk retry.`
      }
      return Response.json(response)
    } catch (e) {
      return Response.json(
        { ok: false, errors: [(e as Error).message] },
        { status: 500 },
      )
    }
  },
}

/**
 * Phase 4.74.4.2 (Stage 4.2, finding #11) — Anonymize passport PII
 * untuk booking yang `departureDate < now - monthsThreshold`.
 *
 * Scope anonymize (per passenger): `passportNumber`, `dateOfBirth`,
 * `passportIssueDate`, `passportExpiryDate` → null.
 *
 * TIDAK di-anonymize: nama, email, WhatsApp, phone, bookingRef,
 * receipt data, payment data — audit keuangan + customer-service window.
 *
 * Idempotency: query filter include `passengers.passportNumber: {
 * not_equals: null }` → booking yang sudah di-anonymize di-skip.
 *
 * Dry-run: body `{ dryRun: true }` → log yang akan di-anonymize tanpa
 * write. Dipakai untuk staging verification.
 *
 * Audit trail: append entry ke `paymentAuditLog` tiap booking:
 *   `{ISO} system | passport PII anonymized ({N}mo retention) |
 *    passengers: {count}`
 *
 * Auth: admin + super-admin + api role (via isApiOrAdmin). Dipanggil
 * oleh web `/api/cron/anonymize-pii` yang pakai PAYLOAD_API_KEY.
 */
const anonymizePiiEndpoint: Endpoint = {
  path: '/anonymize-pii',
  method: 'post',
  handler: async (req) => {
    if (!req.user || !['admin', 'super-admin', 'api'].includes(req.user.role)) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    let body: { monthsThreshold?: number; dryRun?: boolean; batchSize?: number } = {}
    try {
      body = (await (req as any).json?.()) ?? {}
    } catch {}

    // Default 12 bulan (user decision Stage 4.2). Clamp 1..60 untuk safety.
    const monthsThreshold = Math.max(1, Math.min(60, body.monthsThreshold ?? 12))
    const dryRun = body.dryRun === true
    const batchSize = Math.max(1, Math.min(500, body.batchSize ?? 100))

    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - monthsThreshold)
    const cutoffISO = cutoff.toISOString()

    try {
      // Find candidates — booking dengan departureDate < cutoff DAN masih
      // punya passport data (idempotent — sudah di-anonymize di-skip).
      const result = await req.payload.find({
        collection: 'bookings',
        where: {
          and: [
            { departureDate: { less_than: cutoffISO } },
            { 'passengers.passportNumber': { not_equals: null } },
          ],
        },
        limit: batchSize,
        depth: 0,
        overrideAccess: true,
      })

      let anonymized = 0
      const errors: Array<{ id: string; error: string }> = []

      for (const booking of result.docs) {
        try {
          const passengers = Array.isArray((booking as any).passengers)
            ? (booking as any).passengers
            : []
          if (passengers.length === 0) continue

          // Null-out 4 PII fields per passenger.
          const anonymizedPassengers = passengers.map((p: any) => ({
            ...p,
            passportNumber: null,
            dateOfBirth: null,
            passportIssueDate: null,
            passportExpiryDate: null,
          }))

          // Append audit log entry.
          const existingLog = typeof (booking as any).paymentAuditLog === 'string'
            ? (booking as any).paymentAuditLog
            : ''
          const auditEntry = `${new Date().toISOString()} system | passport PII anonymized (${monthsThreshold}mo retention) | passengers: ${passengers.length}`
          const newLog = existingLog ? `${existingLog}\n${auditEntry}` : auditEntry

          if (!dryRun) {
            await req.payload.update({
              collection: 'bookings',
              id: booking.id,
              data: {
                passengers: anonymizedPassengers,
                paymentAuditLog: newLog,
              },
              overrideAccess: true,
              // Skip Step 2.3 manual-edit hook (kita sudah tulis audit log sendiri).
              context: { skipAuditLogHook: true },
            })
          }
          anonymized++
        } catch (e) {
          errors.push({ id: String(booking.id), error: (e as Error).message })
        }
      }

      return Response.json({
        ok: true,
        dryRun,
        monthsThreshold,
        cutoffISO,
        scanned: result.docs.length,
        anonymized,
        hasMore: result.hasNextPage ?? false,
        errors: errors.length > 0 ? errors : undefined,
      })
    } catch (e) {
      return Response.json(
        { ok: false, error: (e as Error).message },
        { status: 500 },
      )
    }
  },
}

/** Phase 4.70.3.1 — Format departureDate + scheduleTimeLabel ala email templates. */
function formatDeparture(iso: string | null | undefined, time: string | null | undefined): string {
  if (!iso) return ''
  let dateStr = iso
  try {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  } catch { /* keep raw */ }
  const t = (time ?? '').trim()
  return t ? `${dateStr} · ${t}` : dateStr
}

/** Phase 4.70.3.1 — Base64 encode (Workers + Node compatible via btoa + Latin-1 bridge). */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Chunked to avoid "arguments too long" on large PDFs.
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK)
    binary += String.fromCharCode.apply(null, slice as unknown as number[])
  }
  // btoa works di Node 18+ + Workers (global).
  return btoa(binary)
}

/**
 * Bookings — Phase 4.62.
 *
 * Single source of truth untuk semua checkout dari frontend. Awalnya hanya
 * dipakai oleh Ferry Ticket (channel `manual_wa`), tapi schema sudah
 * extensible untuk service lain (Tour/Hotel/Car Rental) & payment gateway
 * (Xendit/Midtrans) yang akan aktif nanti — struktur booking TIDAK berubah,
 * cukup nambah `channel` dan isi `channelData`.
 *
 * Access:
 * - create : disabled from public REST (write via API-key dari Astro
 *   endpoint /api/bookings/create, sama pola dgn NewsletterSubscribers).
 * - read   : admin+
 * - update : admin+ (untuk konfirmasi/expire booking manual)
 * - delete : super-admin only
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Booking', plural: 'Bookings' },
  admin: {
    useAsTitle: 'bookingRef',
    group: 'Bookings',
    defaultColumns: ['bookingRef', 'serviceType', 'status', 'channel', 'customerName', 'departureDate', 'createdAt'],
    defaultSort: '-createdAt',
    description: 'Data booking dari frontend. Ferry Ticket sekarang; siap untuk gateway (Xendit/Midtrans) nanti.',
    hidden: ({ user }) => !user || user.role === 'editor',
    // Phase 4.69.8 — Chip filter bar di atas list table dengan live count
    // per status. Prioritaskan "needs action" (awaiting_review, payment_review).
    components: {
      beforeListTable: ['/admin/BookingStatusFilterBar#default'],
    },
  },
  access: {
    // Phase 4.74.4.1 — widen create+update to accept 'api' role (web→CMS
    // via PAYLOAD_API_KEY: /api/bookings/create + /api/bookings/request-change).
    // Read + delete tetap admin-only (API user tidak perlu list booking
    // atau delete; endpoint send-* dsb pakai `overrideAccess` internally).
    create: isApiOrAdmin,
    read: isAdmin,
    update: isApiOrAdmin,
    delete: isSuperAdmin,
  },
  // Step 2.3 — Audit hook untuk manual edit paymentBank/paymentDate/
  // departureDate pada booking status confirmed-or-later.
  hooks: {
    beforeChange: [auditManualEditHook],
  },
  endpoints: [sendPaymentEndpoint, sendTicketEndpoint, confirmRescheduleEndpoint, declineRescheduleEndpoint, confirmCancelEndpoint, declineCancelEndpoint, customerRequestEndpoint, anonymizePiiEndpoint],
  fields: [
    // ── Customer Request Alert (Phase 4.70.2.2) ──────────────
    // Banner prominent di PALING ATAS saat booking punya pending request
    // (reschedule_request / cancel_request). Replace collapsible lama
    // yang terlalu tersembunyi — admin sering lewatkan.
    {
      name: 'requestAlert',
      type: 'ui',
      admin: {
        components: {
          Field: '/admin/BookingRequestAlert#default',
        },
      },
    },

    // ── Admin Actions (Phase 4.69.7) ─────────────────────────
    // UI field — tombol "Send Payment Instructions" & "Confirm Payment &
    // Send Ticket" dengan modal preview. Komponen client-side ambil
    // state booking dari form context + call custom endpoints di atas.
    {
      name: 'adminActions',
      type: 'ui',
      admin: {
        condition: (_data, _siblingData, { user }) =>
          !!user && (user.role === 'admin' || user.role === 'super-admin'),
        components: {
          Field: '/admin/BookingAdminActions#default',
        },
      },
    },
    {
      name: 'bookingRef',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated reference, mis. "FT-20260927-A1B2C3". Jangan diubah manual.',
        readOnly: true,
      },
    },
    // Phase 4.66.5 (finding S-02) — random 128-bit access token untuk
    // mengunci halaman confirmation. bookingRef pendek (6 hex/day) mudah
    // ditebak; token ini menyediakan capability yang unguessable. URL
    // konfirmasi = /checkout/.../confirmation/<bookingRef>?t=<token>.
    // Server compare constant-time. Token disembunyikan dari list default;
    // admin dapat melihatnya di edit view untuk regenerate/resend jika
    // customer kehilangan URL.
    {
      name: 'accessToken',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '128-bit random capability token. Never share screenshot yang mengandung ini. List view: masked + click-to-reveal + copy (Step 3.1).',
        readOnly: true,
        hidden: false,
        components: {
          Cell: '/admin/cells/AccessTokenCell#default',
        },
      },
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      defaultValue: 'ferry-ticket',
      options: [
        { label: 'Ferry Ticket', value: 'ferry-ticket' },
        // Extensible — bisa nambah 'tour', 'accommodation', 'rental', dst tanpa migration
        // baru (Payload select enum). Nilai baru → migrate.
      ],
      admin: { description: 'Jenis layanan yang di-booking.' },
    },
    // Phase 4.67.2a — tripType membedakan one-way vs round-trip. Default
    // `one-way` supaya semua booking existing (1-leg) tetap valid tanpa
    // backfill. Field "Return trip" di bawah hanya tampil & diisi saat
    // round-trip (admin.condition).
    //
    // ── Migration path ke MULTI-CITY (future) ────────────────
    // Kalau nanti support 3+ leg, kita migrate ke `legs: array`:
    //   legs[0] ← outbound (departureDate, ferryTicket, scheduleTimeLabel,
    //                       ferryClassName, ferryClassType, unitPrice,
    //                       originLocation, destinationLocation, totalEstimate)
    //   legs[1] ← return   (returnDate, returnFerryTicket, returnScheduleTimeLabel,
    //                       returnFerryClassName, returnFerryClassType,
    //                       returnUnitPrice, returnOriginLocation,
    //                       returnDestinationLocation, returnTotalEstimate)
    // Nama field STRICT PARALLEL supaya backfill script tinggal copy +
    // rename. Lihat dok phase-4.67.2 untuk detail.
    {
      name: 'tripType',
      type: 'select',
      required: true,
      defaultValue: 'one-way',
      options: [
        { label: 'One Way',    value: 'one-way' },
        { label: 'Round Trip', value: 'round-trip' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Round Trip = 2 leg (outbound + return). Isi "Return trip" di bawah.',
      },
    },

    // ── Relationship + snapshot (Ferry Ticket) ───────────────
    {
      name: 'ferryTicket',
      type: 'relationship',
      relationTo: 'ferry-tickets',
      admin: {
        description: 'Rujukan ke Ferry Ticket. Data teks disnapshot ke field terpisah supaya booking tidak berubah kalau ticket diedit.',
        condition: (data) => data?.serviceType === 'ferry-ticket',
      },
    },

    // ── Customer ─────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'customerName',  type: 'text',  required: true, admin: { width: '50%' } },
        {
          name: 'customerEmail',
          type: 'email',
          admin: {
            width: '50%',
            // Step 3.2 — list view masked, full value di detail view.
            components: { Cell: '/admin/cells/MaskedEmailCell#default' },
          },
        },
      ],
    },
    // ── Contact phone (Phase 4.63) — region + number + WA flag ─────────
    // customerWhatsapp tetap dipertahankan sebagai kolom SNAPSHOT FINAL
    // (auto-compose {region}{phone} di endpoint) supaya konsumen (WA
    // channel, payment gateway nanti) punya 1 field siap-pakai.
    {
      type: 'row',
      fields: [
        { name: 'contactPhoneRegion', type: 'text', admin: { width: '20%', description: 'Kode negara telepon (mis. +62, +65).' } },
        {
          name: 'contactPhone',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Nomor telepon tanpa kode negara.',
            // Step 3.2 — list view masked (region/head + bullets + last 2).
            components: { Cell: '/admin/cells/MaskedPhoneCell#default' },
          },
        },
        { name: 'contactPhoneIsWhatsapp', type: 'checkbox', defaultValue: true, admin: { width: '30%', description: 'Nomor ini juga WhatsApp.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerWhatsapp',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'Snapshot WA final ({region}{phone}). Dipakai channel WA & gateway.',
            // Step 3.2 — list view masked (region + bullets + last 2).
            components: { Cell: '/admin/cells/MaskedPhoneCell#default' },
          },
        },
        { name: 'customerCountry',  type: 'text',                  admin: { width: '50%', description: 'Negara asal (opsional).' } },
      ],
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      admin: { description: 'Catatan tambahan dari customer (opsional).' },
    },

    // ── Passengers array (Phase 4.63) ──────────────────────────────────
    // Ukuran = adults + children. Endpoint memastikan jumlah cocok saat
    // submit. Passport disimpan mentah di sini untuk keperluan admin &
    // gateway; frontend confirmation/WA message me-mask (last 4 digits).
    {
      name: 'passengers',
      type: 'array',
      label: 'Passengers',
      admin: {
        description: 'Data lengkap tiap penumpang untuk keperluan ticketing / manifest / payment gateway.',
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'passengerType',
              type: 'select',
              required: true,
              defaultValue: 'adult',
              options: [
                { label: 'Adult', value: 'adult' },
                { label: 'Child', value: 'child' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'title',
              type: 'select',
              options: [
                { label: 'Mr',     value: 'mr' },
                { label: 'Mrs',    value: 'mrs' },
                { label: 'Ms',     value: 'ms' },
                { label: 'Master', value: 'master' },
                { label: 'Miss',   value: 'miss' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'gender',
              type: 'select',
              options: [
                { label: 'Male',   value: 'male' },
                { label: 'Female', value: 'female' },
              ],
              admin: { width: '25%' },
            },
            { name: 'nationality', type: 'text', admin: { width: '25%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'lastName',  type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dateOfBirth',
              type: 'date',
              // Step 2.2 — PII sensitif setingkat passport. Update dibatasi
              // super-admin (collection-level `update: isAdmin` sudah ketat,
              // tapi field access memberi tambahan defense: admin biasa
              // tidak bisa ubah tanpa naik ke super-admin dulu).
              access: { update: superAdminFieldAccess },
              admin: { width: '33%', date: { pickerAppearance: 'dayOnly' }, description: 'Update dibatasi super-admin (Step 2.2).' },
            },
            {
              name: 'passportNumber',
              type: 'text',
              // Phase 4.66.7 (finding S-09) — passport = data paling sensitif
              // di collection ini. Update dibatasi ke super-admin (walaupun
              // collection-level `update: isAdmin` sudah cukup ketat, ini
              // memberi tambahan defense: seorang admin yang login juga tidak
              // bisa mengubah passport tanpa naik ke super-admin dulu).
              access: {
                update: superAdminFieldAccess,
              },
              admin: {
                width: '33%',
                description: 'Disimpan penuh di CMS; di frontend hanya 4 digit terakhir yang terlihat. Update dibatasi super-admin.',
              },
            },
            {
              name: 'passportIssueDate',
              type: 'date',
              // Step 2.2 — bagian dari passport bundle. Konsisten dengan
              // passportNumber: super-admin only untuk update.
              access: { update: superAdminFieldAccess },
              admin: { width: '17%', date: { pickerAppearance: 'dayOnly' }, description: 'Update dibatasi super-admin (Step 2.2).' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'passportExpiryDate',
              type: 'date',
              // Step 2.2 — bagian dari passport bundle. Konsisten dengan
              // passportNumber: super-admin only untuk update.
              access: { update: superAdminFieldAccess },
              admin: { width: '33%', date: { pickerAppearance: 'dayOnly' }, description: 'Minimal 6 bulan setelah departureDate. Update dibatasi super-admin (Step 2.2).' },
            },
          ],
        },
      ],
    },

    // ── Booking details (snapshot) ───────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'departureDate', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' }, description: 'Ubah pada booking confirmed+ akan ter-prompt (Step 3.4) dan ter-audit (Step 2.3).' } },
        { name: 'adults',        type: 'number', required: true, defaultValue: 1, min: 0, admin: { width: '33%' } },
        { name: 'children',      type: 'number', defaultValue: 0, min: 0, admin: { width: '33%' } },
      ],
    },
    // Step 3.4 — UI sibling: watches departureDate + status, shows
    // confirm modal when editing a confirmed+ booking. Renders null
    // most of the time; mounts the modal only when triggered.
    {
      name: 'departureDateConfirmGuard',
      type: 'ui',
      admin: {
        components: {
          Field: '/admin/fields/DepartureDateConfirmGuard#default',
        },
      },
    },
    {
      name: 'originLocation',
      type: 'text',
      admin: { description: 'Snapshot nama lokasi asal saat booking dibuat.' },
    },
    {
      name: 'destinationLocation',
      type: 'text',
      admin: { description: 'Snapshot nama lokasi tujuan saat booking dibuat.' },
    },
    {
      name: 'scheduleTimeLabel',
      type: 'text',
      admin: { description: 'Snapshot jadwal (mis. "08:20 → 09:10"). Opsional.' },
    },
    {
      name: 'ferryClassName',
      type: 'text',
      admin: { description: 'Snapshot nama kelas (mis. "Ekonomi", "Emerald").' },
    },
    {
      name: 'ferryClassType',
      type: 'text',
      admin: { description: 'Snapshot classType (ekonomi/emerald).' },
    },

    // ── Return trip snapshot (Phase 4.67.2a) ─────────────────
    // Semua field opsional — hanya diisi saat tripType=round-trip.
    // Nama strict-parallel ke outbound (lihat komentar `tripType` di atas
    // untuk migration path ke multi-city `legs[]`).
    {
      type: 'collapsible',
      label: 'Return Trip',
      admin: {
        condition: (data) => data?.tripType === 'round-trip',
        initCollapsed: false,
        description: 'Snapshot leg kedua (pulang). Diisi otomatis oleh endpoint checkout saat round-trip.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'returnDate', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayOnly' }, description: 'Harus >= departureDate.' } },
            {
              name: 'returnFerryTicket',
              type: 'relationship',
              relationTo: 'ferry-tickets',
              admin: { width: '50%', description: 'Rujukan ferry leg return. Bisa beda ferry dari outbound.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'returnOriginLocation',      type: 'text', admin: { width: '50%', description: 'Snapshot origin leg return (= destination outbound).' } },
            { name: 'returnDestinationLocation', type: 'text', admin: { width: '50%', description: 'Snapshot destination leg return (= origin outbound).' } },
          ],
        },
        {
          name: 'returnScheduleTimeLabel',
          type: 'text',
          admin: { description: 'Snapshot jadwal leg return (mis. "17:30 → 18:45").' },
        },
        {
          type: 'row',
          fields: [
            { name: 'returnFerryClassName', type: 'text', admin: { width: '50%', description: 'Snapshot nama kelas leg return.' } },
            { name: 'returnFerryClassType', type: 'text', admin: { width: '50%', description: 'Snapshot classType leg return (ekonomi/emerald/…).' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'returnUnitPrice',     type: 'number', admin: { width: '50%', description: 'Harga adult leg return (snapshot).', components: { Cell: '/admin/cells/PriceCell#default' } } },
            { name: 'returnTotalEstimate', type: 'number', admin: { width: '50%', description: 'Total leg return (adults×unitPrice + children×childPrice).', components: { Cell: '/admin/cells/PriceCell#default' } } },
          ],
        },
      ],
    },

    // ── Pricing (snapshot) — Step 3.3 collapsible wrapper ──────
    {
      type: 'collapsible',
      label: 'Pricing',
      admin: {
        initCollapsed: false,
        description: 'Snapshot harga saat booking dibuat. Grand total round-trip = outbound + return.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'unitPrice',     type: 'number', admin: { width: '33%', description: 'Harga per adult saat booking dibuat.', components: { Cell: '/admin/cells/PriceCell#default' } } },
            { name: 'currency',      type: 'text',   defaultValue: 'IDR', admin: { width: '33%' } },
            { name: 'totalEstimate', type: 'number', admin: { width: '33%', description: 'Estimasi total GRAND. Round-trip: outbound + return. One-way: outbound saja.', components: { Cell: '/admin/cells/PriceCell#default' } } },
          ],
        },
      ],
    },

    // ── Status + channel ─────────────────────────────────────
    // ── Status (Phase 4.69.5 — expanded enum untuk admin-handoff flow) ──
    // Flow baru (default `awaiting_review`):
    //   awaiting_review   → admin verify tanggal/kuota (default booking baru)
    //   awaiting_payment  → setelah admin klik "Send Payment Instructions"
    //   payment_review    → customer kirim bukti bayar, admin verify
    //   confirmed         → payment verified, e-ticket terkirim
    //   reschedule_request → customer minta reschedule
    //   cancel_request    → customer minta cancel
    //   cancelled         → final cancel
    //   expired           → auto-expired (admin tidak respond dalam window)
    //
    // Legacy value `pending` + `awaiting_payment` tetap valid untuk
    // backward compat booking existing — tidak di-remove.
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'awaiting_review',
      options: [
        { label: 'Awaiting review',       value: 'awaiting_review' },
        { label: 'Awaiting payment',      value: 'awaiting_payment' },
        { label: 'Payment review',        value: 'payment_review' },
        { label: 'Confirmed',             value: 'confirmed' },
        { label: 'Reschedule request',    value: 'reschedule_request' },
        { label: 'Cancel request',        value: 'cancel_request' },
        { label: 'Cancelled',             value: 'cancelled' },
        { label: 'Expired',               value: 'expired' },
        // Legacy (Phase 4.62) — biarkan supaya booking lama tetap valid.
        { label: 'Pending (legacy)',      value: 'pending' },
      ],
      admin: { position: 'sidebar', description: 'Flow: awaiting_review → awaiting_payment → confirmed. Lihat phase 4.69.5 untuk state machine.' },
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      defaultValue: 'manual_wa',
      options: [
        { label: 'Manual WhatsApp', value: 'manual_wa' },
        // Placeholder utk nanti — cukup tambah nilai baru di sini + implement di
        // apps/web/src/lib/checkout/channels/. Tidak butuh migration schema.
        // { label: 'Xendit',   value: 'xendit' },
        // { label: 'Midtrans', value: 'midtrans' },
      ],
      admin: { position: 'sidebar', description: 'Channel checkout yang dipakai. Manual WA = konfirmasi lewat WhatsApp (fallback).' },
    },
    {
      name: 'channelData',
      type: 'json',
      admin: {
        description: 'Payload data dari channel (mis. gateway invoice id/URL). Kosong untuk manual_wa.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Auto-expire booking pending setelah waktu ini. Nullable.',
      },
    },

    // ── Request History ─ Step 3.3 collapsible wrapper ───────
    // Dulu `hidden: true` (Phase 4.70.2.2) karena banner alert
    // sudah menampilkan info ini. Step 3.3 un-hide dan group di
    // satu collapsible (initCollapsed: true) untuk audit visibility
    // tanpa clutter default view. Semua field readOnly kecuali
    // `hasRequestedChange` (super-admin boleh toggle untuk exceptional
    // case — confirm modal datang di Step 3.4).
    {
      type: 'collapsible',
      label: 'Request History',
      admin: {
        initCollapsed: true,
        description: 'Catatan request reschedule / cancel dari customer + snapshot untuk restore flow. Banner di atas menampilkan info aktif; section ini untuk audit lengkap.',
      },
      fields: [
        {
          name: 'customerRequestKind',
          type: 'select',
          options: [
            { label: 'Reschedule', value: 'reschedule' },
            { label: 'Cancel', value: 'cancel' },
          ],
          admin: { readOnly: true, description: 'Dibaca oleh BookingRequestAlert banner.' },
        },
        {
          name: 'customerRequestedAt',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            readOnly: true,
          },
        },
        {
          name: 'customerRequestReason',
          type: 'textarea',
          admin: {
            readOnly: true,
            rows: 4,
          },
        },
        // Phase 4.70.2.4 — snapshot original departure (reschedule flow).
        {
          name: 'originalDepartureDate',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayOnly' },
            description: 'Snapshot departureDate sebelum reschedule — Phase 4.70.2.4.',
          },
        },
        {
          name: 'originalScheduleTimeLabel',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Snapshot scheduleTimeLabel sebelum reschedule — Phase 4.70.2.4.',
          },
        },
        // Phase 4.70.2.6 — Snapshot status asli (sebelum customer request).
        {
          name: 'preRequestStatus',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Snapshot status asli sebelum customer request change — Phase 4.70.2.6.',
          },
        },
        // Phase 4.70.2.7 — One-shot flag. Confirm modal via Step 3.4.
        {
          name: 'hasRequestedChange',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Set true saat customer pertama kali request reschedule/cancel. Prevent spam di confirmation page. Admin boleh un-check manual untuk exceptional case (confirm modal — Step 3.4).',
          },
        },
        // Step 3.4 — UI sibling: intercepts un-check (true → false)
        // dan tampilkan confirm modal.
        {
          name: 'hasRequestedChangeConfirmGuard',
          type: 'ui',
          admin: {
            components: {
              Field: '/admin/fields/HasRequestedChangeConfirmGuard#default',
            },
          },
        },
      ],
    },
    // ── Payment ─ Step 3.3 collapsible wrapper ───────────────
    // Dulu `hidden: true` (Phase 4.70.3.1) — di-set otomatis saat admin
    // klik "Confirm Payment & Send Receipt". Step 3.3 un-hide dan group:
    // - receiptNumber + receiptIssuedAt: server-side immutable (Step 2.1).
    // - paymentDate + paymentBank: boleh di-update admin pada resend
    //   (confirm modal + enhanced warning — Step 3.4/3.5).
    {
      type: 'collapsible',
      label: 'Payment',
      admin: {
        initCollapsed: true,
        description: 'Metadata receipt + payment. receiptNumber & receiptIssuedAt FROZEN on first send. paymentDate & paymentBank boleh di-update admin (akan trigger audit log — Step 2.3).',
      },
      fields: [
        {
          name: 'receiptNumber',
          type: 'text',
          // Step 2.1 — Server-side immutable (lihat komentar lama).
          access: { update: () => false },
          admin: {
            readOnly: true,
            description: 'Format: RCPT-{bookingRef}-{YYYYMMDD(Makassar)}. FROZEN on first send — Phase 4.70.3.1. Server-side immutable (Step 2.1).',
          },
        },
        {
          name: 'receiptIssuedAt',
          type: 'date',
          // Step 2.1 — Server-side immutable (same alasan dengan receiptNumber).
          access: { update: () => false },
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Timestamp first receipt issue (Asia/Makassar). FROZEN on first send. Server-side immutable (Step 2.1).',
          },
        },
        {
          name: 'paymentDate',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayOnly' },
            description: 'Tanggal customer transfer (admin pick di modal Confirm Payment). Edit manual pada booking confirmed+ akan ter-audit (Step 2.3).',
          },
        },
        {
          name: 'paymentBank',
          type: 'text',
          admin: {
            description: 'Nama bank tujuan transfer (admin pick dari global bankAccounts dropdown). Edit manual pada booking confirmed+ akan ter-audit (Step 2.3).',
          },
        },
      ],
    },

    // ── Admin-handoff audit (Phase 4.69.5) ─────────────
    // Semua field read-only di UI — otomatis diisi oleh endpoint
    // relevant (/api/bookings/create set emailVerifiedAt; admin
    // button "Send Payment" di Phase 4.69.7 set sentPayment*; dst).
    // Super-admin masih bisa edit manual untuk koreksi.
    {
      type: 'collapsible',
      label: 'Admin Handoff Audit',
      admin: { initCollapsed: true, description: 'Timestamp + user yang trigger tiap transisi. Auto-filled oleh endpoint.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'emailVerifiedAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' }, readOnly: true, description: 'Di-set saat booking dibuat dengan email verified token valid (Phase 4.69.3).' } },
            { name: 'whatsappVerifiedAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' }, readOnly: true, description: 'Reserved — Phase 4.69.11 (WA OTP future).' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'sentPaymentAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' }, readOnly: true, description: 'Di-set oleh admin "Send Payment Instructions" (Phase 4.69.7).' } },
            { name: 'sentPaymentBy', type: 'relationship', relationTo: 'users', admin: { width: '50%', readOnly: true, description: 'Admin yang klik Send Payment.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'sentTicketAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' }, readOnly: true, description: 'Di-set oleh admin "Confirm Payment & Send Receipt" (Phase 4.69.7 + 4.70.3.1 rename). FROZEN on resend.' } },
            { name: 'sentTicketBy', type: 'relationship', relationTo: 'users', admin: { width: '50%', readOnly: true, description: 'Admin yang kirim payment receipt pertama kali. FROZEN on resend.' } },
          ],
        },
        {
          name: 'paymentAuditLog',
          type: 'textarea',
          // Step 2.1 — Server-side immutable append-only. `readOnly: true`
          // UI tidak cukup; sebelum ini super-admin masih bisa edit via
          // REST/GraphQL. Endpoint send-ticket pakai `overrideAccess: true`
          // untuk append entry → tetap jalan. Finding #4 di security audit.
          access: { update: () => false },
          admin: {
            readOnly: true,
            rows: 6,
            description: 'Phase 4.70.3.1 — audit trail setiap kali admin resend receipt (status already confirmed) dan ubah paymentBank / paymentDate. Append-only. Server-side immutable (Step 2.1).',
          },
        },
      ],
    },
  ],
}
