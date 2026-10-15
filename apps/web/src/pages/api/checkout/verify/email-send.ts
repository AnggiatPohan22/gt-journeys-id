/**
 * POST /api/checkout/verify/email-send — Phase 4.69.2.
 *
 * Generate OTP email + simpan hash di CMS + kirim via Resend. Dipanggil
 * dari form checkout (Phase 4.69.3) saat customer klik tombol "Verify
 * email".
 *
 * Request:
 *   Content-Type: application/json
 *   body: { email: string, formStamp?: string }
 *
 * Response (JSON):
 *   { ok: true,  ttlSeconds: number }                         ← OTP dikirim
 *   { ok: false, error: 'invalid_email' }
 *   { ok: false, error: 'rate_limited', retryAfterSeconds }
 *   { ok: false, error: 'send_failed' }                       ← Resend fail
 *   { ok: false, error: 'misconfigured' }                     ← env/API-key hilang
 *
 * Security:
 *   - Rate-limit per (ipHash, emailHash): 3 send / 15min.
 *   - OTP di-hash sebelum store (jangan simpan raw digit).
 *   - Email di-hash sebelum store (jangan simpan raw email di tabel OTP).
 *   - Response TIDAK berisi OTP mentah (OTP hanya di email).
 */

import type { APIRoute } from 'astro'
import { sendEmail } from '@lib/email'
import { generateOtp, hashOtp, hashWithSalt, expiresAtIso, isValidEmail, OTP_CONFIG } from '@lib/checkout/otp'
import { createOtp } from '@lib/checkout/otpStore'
import { checkOtpSendRateLimit, OTP_RATE_CONFIG } from '@lib/checkout/otpRateLimit'
import { getClientIp, hashIp } from '@lib/checkout/rateLimit'
import { renderTemplate } from '@lib/checkout/templateRenderer'
import { IS_PROD } from '@lib/env'

/**
 * Default OTP HTML — fallback kalau CMS global `otpEmailBodyHtml` kosong.
 * MIRROR dari `apps/cms/src/globals/bookingTemplatesDefaults.ts` SSOT —
 * update dua-duanya kalau design berubah. Phase 4.70.1 / 4.70.2
 * (parameterized dgn brand + otp hero vars).
 */
const DEFAULT_OTP_EMAIL_BODY_HTML = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>GtJourneysID</title></head><body style="margin:0;padding:0;background:#F0F9FF;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#0F172A;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F9FF;padding:24px 12px;"><tr><td align="center"><table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -2px rgba(15,23,42,0.06);border:1px solid #E2E8F0;"><tr><td style="padding:20px 28px;border-bottom:1px solid #E2E8F0;">{{brandHeaderHtml}}</td></tr><tr><td style="padding:0;"><div style="background:{{brandAccentColor}};color:#fff;padding:32px 28px;"><h1 style="margin:0;font-size:22px;font-weight:700;line-height:28px;">{{otpHeroHeadline}}</h1><p style="margin:6px 0 0;font-size:13px;opacity:0.9;">{{otpHeroSubtext}}</p></div><div style="padding:28px;"><p style="margin:0 0 16px;font-size:14px;color:#0F172A;line-height:22px;">Halo,</p><p style="margin:0 0 20px;font-size:14px;color:#0F172A;line-height:22px;">Berikut kode verifikasi untuk menyelesaikan proses booking kamu di GtJourneysID:</p><div style="background:#F8FAFC;border:1.5px solid {{brandAccentColor}};border-radius:12px;padding:24px;text-align:center;margin:20px 0;"><div style="font-family:'Inter','SF Mono',Consolas,monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:#0F172A;">{{otp}}</div><div style="margin-top:10px;font-size:12px;color:#475569;">Berlaku {{otpTtlMinutes}} menit · hanya untuk 1x pakai</div></div><p style="margin:16px 0 0;font-size:13px;color:#475569;line-height:20px;">{{otpSecurityNote}}</p><p style="margin:24px 0 0;font-size:13px;color:#64748B;line-height:20px;">Terima kasih,<br><strong style="color:#0F172A;">Tim GtJourneysID</strong></p></div></td></tr><tr><td style="padding:20px 28px;border-top:1px solid #E2E8F0;background:#F8FAFC;"><p style="margin:0 0 8px;font-size:12px;color:#475569;line-height:18px;"><strong style="color:#0F172A;">{{brandCompanyName}}</strong><br>{{footerDisclaimer}}</p><p style="margin:0 0 8px;font-size:11px;color:#64748B;line-height:16px;">Need help? Email <a href="mailto:{{supportEmail}}" style="color:{{brandAccentColor}};text-decoration:none;">{{supportEmail}}</a></p><p style="margin:12px 0 0;padding-top:12px;border-top:1px solid #E2E8F0;font-size:11px;color:#64748B;line-height:16px;">This verification email was requested from the checkout page. GtJourneysID never asks for your passwords, OTPs, or payments to personal accounts.</p></td></tr></table><p style="margin:16px auto 0;max-width:640px;font-size:11px;color:#64748B;text-align:center;line-height:16px;">© 2026 {{brandCompanyName}}. All rights reserved.</p></td></tr></table></body></html>`

const RL_SALT = import.meta.env.BOOKING_RL_SALT || 'dnj-booking-rl-salt'
const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = import.meta.env.PAYLOAD_API_KEY || ''

interface OtpTemplate {
  subject: string
  text: string
  html: string | null
  // Phase 4.70.2 — brand + per-template editable fields
  brand: Record<string, string>
  otpFields: Record<string, string>
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildBrandCtx(tpl: Record<string, any>): Record<string, string> {
  const logo = tpl.brandLogo
  const logoUrl = typeof logo === 'object' && logo?.url ? logo.url : ''
  const logoAlt = typeof logo === 'object' && logo?.alt ? logo.alt : 'Brand logo'
  const brandName = (tpl.brandCompanyName as string)?.trim() || 'GtJourneysID'
  const brandNameShort = brandName.length > 24 ? 'GtJourneysID' : brandName
  const brandHeaderHtml = logoUrl
    ? `<img src="${escapeAttr(logoUrl)}" alt="${escapeAttr(logoAlt)}" style="height:36px;max-width:200px;vertical-align:middle;">`
    : `<div style="display:inline-block;width:36px;height:36px;background:#0F172A;color:#fff;border-radius:8px;text-align:center;line-height:36px;font-weight:700;font-size:14px;letter-spacing:0.5px;vertical-align:middle;">GT</div><span style="margin-left:10px;font-size:16px;font-weight:700;color:#0F172A;vertical-align:middle;">${escapeAttr(brandNameShort)}</span>`
  return {
    brandHeaderHtml,
    brandAccentColor: tpl.brandAccentColor || '#0EA5E9',
    brandCompanyName: brandName,
    supportEmail: tpl.supportEmail || 'billing@gtjourneys.id',
    footerDisclaimer: tpl.footerDisclaimer || 'Secure booking · verified operator · Indonesian archipelago travel',
  }
}

/** Fetch booking-templates global dari CMS dgn depth=1 untuk resolve logo URL. */
async function fetchOtpTemplate(): Promise<OtpTemplate | null> {
  if (!CMS_URL || !API_KEY) return null
  try {
    const res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/globals/booking-templates?depth=1`, {
      headers: { Authorization: `users API-Key ${API_KEY}` },
    })
    if (!res.ok) return null
    const data = (await res.json().catch(() => ({}))) as Record<string, any>
    return {
      subject: data.otpEmailSubject ?? 'GtJourneysID verification code: {{otp}}',
      text: data.otpEmailBody ?? '',
      html: data.otpEmailBodyHtml ?? null,
      brand: buildBrandCtx(data),
      otpFields: {
        otpHeroHeadline: data.otpHeroHeadline || 'Email Verification Code',
        otpHeroSubtext: data.otpHeroSubtext || 'Confirming your email for a GtJourneysID booking.',
        otpSecurityNote: data.otpSecurityNote || 'Jika kamu tidak meminta kode ini, abaikan email ini — kode akan kedaluwarsa otomatis. Jangan pernah bagikan kode ini ke siapapun, termasuk staf GtJourneysID.',
      },
    }
  } catch {
    return null
  }
}

const RAW_VARS = new Set(['brandHeaderHtml'])

export const prerender = false

interface SendBody {
  email?: unknown
}

function jsonResponse(body: Record<string, unknown>, status: number = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export const POST: APIRoute = async ({ request }) => {
  let payload: SendBody
  try {
    payload = (await request.json()) as SendBody
  } catch {
    return jsonResponse({ ok: false, error: 'malformed_body' }, 400)
  }

  const emailRaw = typeof payload.email === 'string' ? payload.email.trim() : ''
  if (!emailRaw || !isValidEmail(emailRaw)) {
    return jsonResponse({ ok: false, error: 'invalid_email' }, 400)
  }

  const ip = getClientIp(request)
  const [ipHash, targetHash] = await Promise.all([
    hashIp(ip, RL_SALT),
    hashWithSalt(emailRaw),
  ])

  const rlKey = `${ipHash}::${targetHash}`
  if (!checkOtpSendRateLimit(rlKey)) {
    return jsonResponse(
      {
        ok: false,
        error: 'rate_limited',
        retryAfterSeconds: Math.floor(OTP_RATE_CONFIG.windowMs / 1000),
      },
      429,
    )
  }

  // Generate + persist OTP (store hashed).
  const otp = generateOtp()
  const otpHash = await hashOtp(otp)
  const expiresAt = expiresAtIso()

  const store = await createOtp({
    kind: 'email',
    targetHash,
    otpHash,
    expiresAt,
    ipHash,
  })
  if (!store.ok) {
    if (store.reason === 'misconfigured') {
      return jsonResponse({ ok: false, error: 'misconfigured' }, 500)
    }
    return jsonResponse({ ok: false, error: 'send_failed', detail: 'storage' }, 500)
  }

  // Phase 4.70.1/2 — Fetch template + inject brand + per-template fields.
  const tpl = await fetchOtpTemplate()
  const ctx: Record<string, string | number> = {
    otp,
    otpTtlMinutes: OTP_CONFIG.ttlMinutes,
    // Fallback brand defaults jika CMS unreachable
    brandHeaderHtml: tpl?.brand.brandHeaderHtml ?? `<div style="display:inline-block;width:36px;height:36px;background:#0F172A;color:#fff;border-radius:8px;text-align:center;line-height:36px;font-weight:700;font-size:14px;">GT</div><span style="margin-left:10px;font-size:16px;font-weight:700;color:#0F172A;vertical-align:middle;">GtJourneysID</span>`,
    brandAccentColor: tpl?.brand.brandAccentColor ?? '#0EA5E9',
    brandCompanyName: tpl?.brand.brandCompanyName ?? 'PT GtJourneys Nusantara Indonesia',
    supportEmail: tpl?.brand.supportEmail ?? 'billing@gtjourneys.id',
    footerDisclaimer: tpl?.brand.footerDisclaimer ?? 'Secure booking · verified operator · Indonesian archipelago travel',
    otpHeroHeadline: tpl?.otpFields.otpHeroHeadline ?? 'Email Verification Code',
    otpHeroSubtext: tpl?.otpFields.otpHeroSubtext ?? 'Confirming your email for a GtJourneysID booking.',
    otpSecurityNote: tpl?.otpFields.otpSecurityNote ?? '',
    customerEmail: emailRaw,
    bookingRef: '(verification session)',
    adminWhatsapp: '',
  }

  let subject = `GtJourneysID verification code: ${otp}`
  let text = buildOtpText(otp)
  let html: string | undefined

  if (tpl) {
    const subjR = renderTemplate(tpl.subject, ctx)
    const textR = renderTemplate(tpl.text, ctx)
    if (subjR.ok) subject = subjR.rendered
    if (textR.ok) text = textR.rendered
  }

  const htmlTemplate =
    tpl?.html && tpl.html.trim().length > 0 ? tpl.html : DEFAULT_OTP_EMAIL_BODY_HTML
  const htmlR = renderTemplate(htmlTemplate, ctx, { escapeHtml: true, rawVars: RAW_VARS })
  if (htmlR.ok) html = htmlR.rendered

  // Kirim email. Idempotency-key = otp record id supaya retry tidak kirim dua.
  const emailRes = await sendEmail({
    to: emailRaw,
    subject,
    text,
    html,
    idempotencyKey: `otp-${String(store.data.id)}`,
    tags: { phase: '4-70-1', kind: 'email-otp' },
  })

  if (!emailRes.ok) {
    // Log tapi masih return send_failed — jangan expose provider detail.
    // eslint-disable-next-line no-console
    console.warn(`[otp:email-send] email send failed: ${emailRes.error}`)
    return jsonResponse({ ok: false, error: 'send_failed', detail: 'email' }, 502)
  }

  // DEV-ONLY: log raw OTP ke server console supaya tester bisa pakai
  // tanpa harus buka inbox real (Resend sandbox hanya kirim ke email
  // whitelisted). JANGAN pernah expose ini di prod — IS_PROD guard
  // membuat dead-code elimination strip baris ini di build.
  if (!IS_PROD) {
    // eslint-disable-next-line no-console
    console.log(`[otp:dev] email=${emailRaw} otp=${otp} (dev-only log; strip di prod via IS_PROD)`)
  }

  return jsonResponse({
    ok: true,
    ttlSeconds: OTP_CONFIG.ttlMinutes * 60,
  })
}

function buildOtpText(otp: string): string {
  return [
    'Halo,',
    '',
    `Kode verifikasi GtJourneysID kamu: ${otp}`,
    '',
    `Kode berlaku selama ${OTP_CONFIG.ttlMinutes} menit. Jangan bagikan ke siapapun.`,
    '',
    'Kalau kamu tidak meminta kode ini, abaikan email ini.',
    '',
    '— GtJourneysID',
  ].join('\n')
}
