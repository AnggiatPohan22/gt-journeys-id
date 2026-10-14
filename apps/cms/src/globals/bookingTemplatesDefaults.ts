/**
 * Default HTML email templates — Phase 4.70.1 (initial) + 4.70.2 (parameterized).
 *
 * Phase 4.70.2 refactor:
 * - Shell wrapper + body sections pakai variables yang di-inject dari
 *   CMS global fields (brandLogoBlock, brandAccentColor, companyName,
 *   supportEmail, footerDisclaimer, {kind}HeroHeadline/Subtext/etc).
 * - Developer edit struktur HTML di sini (SSOT); admin edit teks + logo
 *   + warna via CMS tanpa sentuh HTML.
 * - 2 template baru: reschedule + cancel (sebelumnya cuma plain text).
 *
 * Rendering flow:
 *   1. Endpoint ambil global `booking-templates` (depth: 1 untuk resolve logo URL)
 *   2. Compose brand context (brandLogoBlock HTML snippet, warna, teks)
 *   3. Pass semua ke renderTemplate dgn escapeHtml=true + rawVars untuk
 *      brandLogoBlock (sudah trusted HTML dari composer)
 */

export const brandDefaults = {
  primary: '#0F172A',
  secondaryFallback: '#0EA5E9',
  tertiary: '#0284C7',
  bg: '#F0F9FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#475569',
  textFaint: '#64748B',
  success: '#10B981',
  warn: '#F59E0B',
  warnBg: '#FFFBEB',
  warnText: '#B45309',
  companyName: 'PT GtJourneys Nusantara Indonesia',
  supportEmail: 'billing@gtjourneys.id',
  footerDisclaimer: 'Secure booking · verified operator · Indonesian archipelago travel',
}

const fontStack = `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`
const monoStack = `"Inter", "SF Mono", Consolas, Monaco, "Courier New", monospace`

/* ─────────────────────────────────────────────────────────────────────
 * Shared email shell. Semua var `{{brand*}}` di-inject oleh endpoint.
 * ───────────────────────────────────────────────────────────────────── */
function shell(innerHtml: string, preheader: string = ''): string {
  const b = brandDefaults
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>GtJourneysID</title>
</head>
<body style="margin:0;padding:0;background:${b.bg};font-family:${fontStack};color:${b.text};-webkit-text-size-adjust:100%;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${b.bg};padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${b.surface};border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -2px rgba(15,23,42,0.06);border:1px solid ${b.border};">
        <!-- Brand header (logo + brand name) — rendered via brandHeaderHtml (raw HTML var) -->
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid ${b.border};background:${b.surface};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">{{brandHeaderHtml}}</td>
                <td align="right" style="vertical-align:middle;">
                  <span style="font-size:11px;color:${b.textFaint};letter-spacing:0.5px;text-transform:uppercase;">Secure Transaction</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:0;">
            ${innerHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 28px;border-top:1px solid ${b.border};background:${b.surfaceAlt};">
            <p style="margin:0 0 8px;font-size:12px;color:${b.textMuted};line-height:18px;">
              <strong style="color:${b.text};">{{brandCompanyName}}</strong><br>
              {{footerDisclaimer}}
            </p>
            <p style="margin:0 0 8px;font-size:11px;color:${b.textFaint};line-height:16px;">
              Need help? WhatsApp <a href="https://wa.me/{{adminWhatsapp}}" style="color:{{brandAccentColor}};text-decoration:none;">{{adminWhatsapp}}</a> · Email <a href="mailto:{{supportEmail}}" style="color:{{brandAccentColor}};text-decoration:none;">{{supportEmail}}</a>
            </p>
            <p style="margin:12px 0 0;padding-top:12px;border-top:1px solid ${b.border};font-size:11px;color:${b.textFaint};line-height:16px;">
              This email was sent to <strong>{{customerEmail}}</strong> because of your booking <strong>{{bookingRef}}</strong>.
              <br>GtJourneysID never asks for your passwords, OTPs, or payments to personal accounts.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:16px auto 0;max-width:640px;font-size:11px;color:${b.textFaint};text-align:center;line-height:16px;">
        © 2026 {{brandCompanyName}}. All rights reserved.
      </p>
    </td>
  </tr>
</table>
</body>
</html>`
}

const b = brandDefaults

/* ───────── OTP Email ───────── */
export const DEFAULT_OTP_EMAIL_BODY_HTML = shell(
  `
  <div style="background:{{brandAccentColor}};color:#fff;padding:32px 28px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;line-height:28px;">{{otpHeroHeadline}}</h1>
    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">{{otpHeroSubtext}}</p>
  </div>
  <div style="padding:28px;">
    <p style="margin:0 0 16px;font-size:14px;color:${b.text};line-height:22px;">Halo,</p>
    <p style="margin:0 0 20px;font-size:14px;color:${b.text};line-height:22px;">
      Berikut kode verifikasi untuk menyelesaikan proses booking kamu di GtJourneysID:
    </p>
    <div style="background:${b.surfaceAlt};border:1.5px solid {{brandAccentColor}};border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
      <div style="font-family:${monoStack};font-size:36px;font-weight:700;letter-spacing:8px;color:${b.primary};">{{otp}}</div>
      <div style="margin-top:10px;font-size:12px;color:${b.textMuted};">Berlaku {{otpTtlMinutes}} menit · hanya untuk 1x pakai</div>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:${b.textMuted};line-height:20px;">{{otpSecurityNote}}</p>
    <p style="margin:24px 0 0;font-size:13px;color:${b.textFaint};line-height:20px;">Terima kasih,<br><strong style="color:${b.text};">Tim GtJourneysID</strong></p>
  </div>
  `,
  'Kode verifikasi email GtJourneysID kamu',
)

/* ───────── Payment Instructions ───────── */
export const DEFAULT_PAYMENT_EMAIL_BODY_HTML = shell(
  `
  <div style="background:linear-gradient(135deg,{{brandAccentColor}} 0%,${b.tertiary} 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">Payment Required</div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">{{paymentHeroHeadline}}</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, {{paymentHeroSubtext}}
    </p>
  </div>

  <div style="padding:24px 28px 8px;">
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${b.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:20px;font-weight:700;color:{{brandAccentColor}};letter-spacing:1px;">{{bookingRef}}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px dashed ${b.border};padding-top:16px;">
        <tr><td style="font-size:12px;color:${b.textMuted};">Route</td><td align="right" style="font-size:14px;font-weight:600;color:${b.text};">{{originLocation}} → {{destinationLocation}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Departure</td><td align="right" style="font-size:14px;color:${b.text};">{{departureDate}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Class</td><td align="right" style="font-size:14px;color:${b.text};">{{ferryClassName}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Passengers</td><td align="right" style="font-size:14px;color:${b.text};">{{adults}} Adult · {{children}} Child</td></tr>
      </table>
    </div>
  </div>

  <div style="padding:12px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${b.primary};border-radius:12px;">
      <tr>
        <td style="padding:20px 24px;">
          <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:600;">Total due</div>
          <div style="margin-top:4px;font-size:28px;font-weight:700;color:#fff;">{{currency}} {{totalEstimate}}</div>
        </td>
        <td align="right" style="padding:20px 24px;vertical-align:middle;">
          <div style="font-size:11px;color:rgba(255,255,255,0.75);">Pay before</div>
          <div style="font-size:14px;color:#fff;font-weight:600;">{{paymentDeadline}}</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Bank Transfer</h2>
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{bankAccountsBlock}}</div>
    <p style="margin:10px 0 0;font-size:12px;color:${b.textMuted};line-height:18px;">ℹ Transfer dengan nominal <strong>tepat</strong> supaya auto-match sistem lebih cepat.</p>
  </div>

  <div style="padding:16px 28px 8px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Next Steps</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:33%;vertical-align:top;padding:12px;background:${b.surfaceAlt};border-radius:10px;">
          <div style="width:24px;height:24px;background:{{brandAccentColor}};color:#fff;border-radius:999px;text-align:center;line-height:24px;font-size:12px;font-weight:700;">1</div>
          <div style="margin-top:8px;font-size:13px;font-weight:600;color:${b.text};">Transfer</div>
          <div style="margin-top:4px;font-size:12px;color:${b.textMuted};line-height:18px;">Kirim total sebelum batas waktu.</div>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;vertical-align:top;padding:12px;background:${b.surfaceAlt};border-radius:10px;">
          <div style="width:24px;height:24px;background:{{brandAccentColor}};color:#fff;border-radius:999px;text-align:center;line-height:24px;font-size:12px;font-weight:700;">2</div>
          <div style="margin-top:8px;font-size:13px;font-weight:600;color:${b.text};">Simpan Bukti</div>
          <div style="margin-top:4px;font-size:12px;color:${b.textMuted};line-height:18px;">Screenshot atau resi transfer.</div>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;vertical-align:top;padding:12px;background:${b.surfaceAlt};border-radius:10px;">
          <div style="width:24px;height:24px;background:{{brandAccentColor}};color:#fff;border-radius:999px;text-align:center;line-height:24px;font-size:12px;font-weight:700;">3</div>
          <div style="margin-top:8px;font-size:13px;font-weight:600;color:${b.text};">Kirim ke Admin</div>
          <div style="margin-top:4px;font-size:12px;color:${b.textMuted};line-height:18px;">Via WhatsApp verifikasi di bawah.</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding:16px 28px 24px;text-align:center;">
    <p style="margin:0 0 12px;font-size:13px;color:${b.text};">Sudah transfer? Kirim bukti ke:</p>
    <a href="https://wa.me/{{adminWhatsapp}}?text=Halo%20GtJourneysID%2C%20saya%20sudah%20transfer%20untuk%20booking%20{{bookingRef}}" style="display:inline-block;background:#25D366;color:#fff;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(37,211,102,0.3);">💬 Kirim Bukti via WhatsApp</a>
    <p style="margin:12px 0 0;font-size:11px;color:${b.textFaint};">WhatsApp verifikasi: <strong>{{adminWhatsapp}}</strong></p>
  </div>

  <!-- Change plan — reschedule / cancel (visible SEBELUM payment) -->
  <div style="padding:0 28px 20px;">
    <div style="background:${b.surfaceAlt};border:1px dashed ${b.border};border-radius:12px;padding:16px 20px;">
      <h3 style="margin:0 0 6px;font-size:14px;font-weight:700;color:${b.text};">
        🔁 Berubah pikiran?
      </h3>
      <p style="margin:0 0 12px;font-size:13px;color:${b.textMuted};line-height:20px;">
        Kamu bisa <strong>reschedule</strong> atau <strong>cancel</strong> booking ini
        <strong>sebelum pembayaran</strong>. Klik tombol di bawah untuk buka halaman booking kamu.
      </p>
      <a href="{{confirmationUrl}}" style="display:inline-block;background:${b.surface};border:1px solid {{brandAccentColor}};color:{{brandAccentColor}};padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">
        Kelola booking →
      </a>
      <p style="margin:10px 0 0;font-size:11px;color:${b.textFaint};line-height:16px;">
        Simpan link ini — kamu bisa akses booking kapan saja selama belum di-cancel/expired.
      </p>
    </div>
  </div>

  <div style="padding:0 28px 24px;">
    <div style="background:${b.warnBg};border-left:3px solid ${b.warn};padding:14px 16px;border-radius:4px;">
      <div style="font-size:12px;font-weight:600;color:${b.warnText};margin-bottom:4px;">🛡 Security Notice</div>
      <div style="font-size:12px;color:${b.warnText};line-height:18px;">{{paymentSecurityNote}}</div>
    </div>
  </div>
  `,
  'Instruksi pembayaran booking {{bookingRef}} - GtJourneysID',
)

/* ───────── Ticket Confirmation ───────── */
export const DEFAULT_TICKET_EMAIL_BODY_HTML = shell(
  `
  <div style="background:linear-gradient(135deg,${b.success} 0%,#059669 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">✅ Confirmed</div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">{{ticketHeroHeadline}}</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, {{ticketHeroSubtext}}
    </p>
  </div>

  <div style="padding:24px 28px 8px;">
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${b.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:22px;font-weight:700;color:${b.success};letter-spacing:1px;">{{bookingRef}}</div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px dashed ${b.border};font-size:12px;color:${b.textMuted};line-height:18px;">
        Tunjukkan reference ini saat check-in di terminal — baik via email ini atau screenshot.
      </div>
    </div>
  </div>

  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Trip Details</h2>
    <div style="background:${b.surface};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:45%;vertical-align:top;">
            <div style="font-size:11px;color:${b.textMuted};text-transform:uppercase;letter-spacing:0.5px;">From</div>
            <div style="margin-top:2px;font-size:16px;font-weight:700;color:${b.text};">{{originLocation}}</div>
          </td>
          <td align="center" style="width:10%;vertical-align:middle;padding:0 8px;">
            <div style="font-size:18px;color:{{brandAccentColor}};">→</div>
          </td>
          <td align="right" style="width:45%;vertical-align:top;">
            <div style="font-size:11px;color:${b.textMuted};text-transform:uppercase;letter-spacing:0.5px;">To</div>
            <div style="margin-top:2px;font-size:16px;font-weight:700;color:${b.text};">{{destinationLocation}}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px dashed ${b.border};padding-top:14px;">
        <tr><td style="font-size:12px;color:${b.textMuted};">Departure Date</td><td align="right" style="font-size:14px;font-weight:600;color:${b.text};">{{departureDate}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Class</td><td align="right" style="font-size:14px;color:${b.text};">{{ferryClassName}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Passengers</td><td align="right" style="font-size:14px;color:${b.text};">{{adults}} Adult · {{children}} Child</td></tr>
      </table>
    </div>
  </div>

  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Passenger Manifest</h2>
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{passengerList}}</div>
  </div>

  <div style="padding:16px 28px 8px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">{{ticketChecklistTitle}}</h2>
    <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:10px;padding:16px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#047857;line-height:22px;">
          ✓ Tiba di terminal <strong>60 menit sebelum</strong> keberangkatan.<br>
          ✓ Bawa <strong>passport fisik</strong> (bukan foto/scan).<br>
          ✓ Tunjukkan email ini atau booking reference <strong>{{bookingRef}}</strong> saat check-in.<br>
          ✓ Simpan nomor WA admin: <strong>{{adminWhatsapp}}</strong> untuk darurat.
        </td></tr>
      </table>
    </div>
  </div>

  <div style="padding:16px 28px 24px;text-align:center;">
    <p style="margin:0;font-size:14px;color:${b.text};">Selamat jalan — have a great trip! 🌊</p>
    <p style="margin:4px 0 0;font-size:12px;color:${b.textFaint};">— Tim GtJourneysID</p>
  </div>
  `,
  'Tiket kamu confirmed — booking {{bookingRef}}',
)

/* ───────── Reschedule CONFIRM Response (rewrite 4.70.2.4, split 4.70.2.6) ───────── */
export const DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML = shell(
  `
  <div style="background:linear-gradient(135deg,${b.warn} 0%,#D97706 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">✅ Reschedule Disetujui</div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">{{rescheduleConfirmHeroHeadline}}</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, {{rescheduleConfirmHeroSubtext}}
    </p>
  </div>

  <!-- Previous → New departure (visual contrast) -->
  <div style="padding:24px 28px 8px;">
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${b.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:20px;font-weight:700;color:{{brandAccentColor}};letter-spacing:1px;">{{bookingRef}}</div>

      {{departureBlock}}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px dashed ${b.border};padding-top:14px;">
        <tr><td style="font-size:12px;color:${b.textMuted};">Route</td><td align="right" style="font-size:14px;color:${b.text};">{{originLocation}} → {{destinationLocation}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Class</td><td align="right" style="font-size:14px;color:${b.text};">{{ferryClassName}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Passengers</td><td align="right" style="font-size:14px;color:${b.text};">{{adults}} Adult · {{children}} Child</td></tr>
      </table>
    </div>
  </div>

  <!-- Admin note (opsional untuk confirm — info biaya tambahan dsb.) -->
  <div style="padding:12px 28px;">
    <div style="background:${b.surfaceAlt};border-left:3px solid ${b.success};border-radius:4px;padding:14px 16px;font-size:14px;color:${b.text};line-height:22px;white-space:pre-wrap;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};margin-bottom:6px;">Catatan tambahan</div>
      {{rescheduleConfirmNote}}
    </div>
  </div>

  <!-- Payment Instructions (reschedule hanya terjadi pre-payment, jadi
       customer PASTI belum bayar — reuse pattern Payment email) -->
  <div style="padding:12px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${b.primary};border-radius:12px;">
      <tr>
        <td style="padding:20px 24px;">
          <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:600;">Total due</div>
          <div style="margin-top:4px;font-size:24px;font-weight:700;color:#fff;">{{currency}} {{totalEstimate}}</div>
        </td>
        <td align="right" style="padding:20px 24px;vertical-align:middle;">
          <div style="font-size:11px;color:rgba(255,255,255,0.75);">Status</div>
          <div style="font-size:13px;color:#fff;font-weight:600;">Awaiting payment</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Bank Transfer</h2>
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{bankAccountsBlock}}</div>
    <p style="margin:10px 0 0;font-size:12px;color:${b.textMuted};line-height:18px;">ℹ Transfer dengan nominal <strong>tepat</strong> supaya auto-match sistem lebih cepat. Simpan bukti transfer kamu — kirim ke admin via WhatsApp untuk verifikasi.</p>
  </div>

  <div style="padding:16px 28px 24px;text-align:center;">
    <a href="https://wa.me/{{adminWhatsapp}}?text=Halo%20GtJourneysID%2C%20saya%20sudah%20transfer%20untuk%20booking%20{{bookingRef}}%20(reschedule)" style="display:inline-block;background:#25D366;color:#fff;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(37,211,102,0.3);">💬 Kirim Bukti via WhatsApp</a>
    <p style="margin:12px 0 0;font-size:11px;color:${b.textFaint};">WhatsApp verifikasi: <strong>{{adminWhatsapp}}</strong></p>
  </div>
  `,
  'Reschedule disetujui — booking {{bookingRef}}',
)

/* ───────── Reschedule DECLINE Response (BARU 4.70.2.6) ───────── */
export const DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML = shell(
  `
  <div style="background:linear-gradient(135deg,#DC2626 0%,#991B1B 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">❌ Mohon Maaf</div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">{{rescheduleDeclineHeroHeadline}}</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, {{rescheduleDeclineHeroSubtext}}
    </p>
  </div>

  <div style="padding:24px 28px 8px;">
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${b.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:20px;font-weight:700;color:#DC2626;letter-spacing:1px;">{{bookingRef}}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:1px dashed ${b.border};padding-top:12px;">
        <tr><td style="font-size:12px;color:${b.textMuted};">Jadwal Anda</td><td align="right" style="font-size:14px;font-weight:600;color:${b.text};">{{departureDisplay}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Route</td><td align="right" style="font-size:14px;color:${b.text};">{{originLocation}} → {{destinationLocation}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Status</td><td align="right" style="font-size:14px;font-weight:600;color:${b.success};">Tetap berlaku sesuai jadwal semula</td></tr>
      </table>
    </div>
  </div>

  <!-- Alasan admin tidak bisa proses reschedule (WAJIB) -->
  <div style="padding:12px 28px;">
    <div style="background:#FEF2F2;border-left:3px solid #DC2626;border-radius:4px;padding:14px 16px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#991B1B;margin-bottom:6px;">Alasan</div>
      <div style="font-size:14px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{rescheduleDeclineReason}}</div>
    </div>
  </div>

  <!-- Reminder booking tetap berlaku -->
  <div style="padding:12px 28px;">
    <div style="background:#ECFDF5;border:1px solid #86EFAC;border-radius:8px;padding:14px 16px;">
      <p style="margin:0;font-size:13px;color:#047857;line-height:20px;">
        ℹ Booking Anda <strong>tetap berlaku</strong> sesuai jadwal semula. Tidak ada perubahan tanggal/jam.
        Silakan lanjut selesaikan pembayaran di bawah ini supaya tiket bisa segera di-issue.
      </p>
    </div>
  </div>

  <!-- Payment Instructions (customer belum bayar — tetap perlu info transfer) -->
  <div style="padding:12px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${b.primary};border-radius:12px;">
      <tr>
        <td style="padding:20px 24px;">
          <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:600;">Total due</div>
          <div style="margin-top:4px;font-size:24px;font-weight:700;color:#fff;">{{currency}} {{totalEstimate}}</div>
        </td>
        <td align="right" style="padding:20px 24px;vertical-align:middle;">
          <div style="font-size:11px;color:rgba(255,255,255,0.75);">Status</div>
          <div style="font-size:13px;color:#fff;font-weight:600;">Awaiting payment</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Bank Transfer</h2>
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{bankAccountsBlock}}</div>
    <p style="margin:10px 0 0;font-size:12px;color:${b.textMuted};line-height:18px;">ℹ Transfer dengan nominal <strong>tepat</strong> supaya auto-match sistem lebih cepat. Simpan bukti transfer — kirim ke admin via WhatsApp untuk verifikasi.</p>
  </div>

  <div style="padding:16px 28px 24px;text-align:center;">
    <a href="https://wa.me/{{adminWhatsapp}}?text=Halo%20GtJourneysID%2C%20saya%20sudah%20transfer%20untuk%20booking%20{{bookingRef}}" style="display:inline-block;background:#25D366;color:#fff;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(37,211,102,0.3);">💬 Kirim Bukti via WhatsApp</a>
    <p style="margin:12px 0 0;font-size:11px;color:${b.textFaint};">Admin WhatsApp: <strong>{{adminWhatsapp}}</strong></p>
  </div>
  `,
  'Reschedule belum bisa diproses — booking {{bookingRef}}',
)

/* Alias legacy — maintain export for backward compat kalau ada code yg import */
export const DEFAULT_RESCHEDULE_EMAIL_BODY_HTML = DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML

/* ───────── Cancel CONFIRM Response (split 4.70.2.8) ───────── */
export const DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML = shell(
  `
  <div style="background:linear-gradient(135deg,#DC2626 0%,#991B1B 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">❌ Pembatalan Dikonfirmasi</div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">{{cancelConfirmHeroHeadline}}</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, {{cancelConfirmHeroSubtext}}
    </p>
  </div>

  <div style="padding:24px 28px 8px;">
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${b.textMuted};font-weight:600;">Booking Reference (cancelled)</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:20px;font-weight:700;color:#DC2626;letter-spacing:1px;text-decoration:line-through;">{{bookingRef}}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:1px dashed ${b.border};padding-top:12px;">
        <tr><td style="font-size:12px;color:${b.textMuted};">Original departure</td><td align="right" style="font-size:14px;color:${b.text};">{{departureDisplay}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Route</td><td align="right" style="font-size:14px;color:${b.text};">{{originLocation}} → {{destinationLocation}}</td></tr>
      </table>
    </div>
  </div>

  <!-- Admin note (opsional untuk confirm — info refund/kebijakan) -->
  <div style="padding:12px 28px;">
    <div style="background:${b.surfaceAlt};border-left:3px solid #DC2626;border-radius:4px;padding:14px 16px;font-size:14px;color:${b.text};line-height:22px;white-space:pre-wrap;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};margin-bottom:6px;">Catatan dari admin</div>
      {{cancelConfirmNote}}
    </div>
  </div>

  <div style="padding:16px 28px 24px;text-align:center;">
    <a href="https://wa.me/{{adminWhatsapp}}?text=Halo%20GtJourneysID%2C%20terkait%20pembatalan%20booking%20{{bookingRef}}" style="display:inline-block;background:${b.surface};border:1px solid ${b.border};color:${b.text};padding:12px 24px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;">💬 Diskusi via WhatsApp</a>
  </div>
  `,
  'Pembatalan booking {{bookingRef}} dikonfirmasi',
)

/* ───────── Cancel DECLINE Response (BARU 4.70.2.8) ───────── */
export const DEFAULT_CANCEL_DECLINE_EMAIL_BODY_HTML = shell(
  `
  <div style="background:linear-gradient(135deg,${b.warn} 0%,#D97706 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">⚠ Pembatalan Belum Bisa Diproses</div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">{{cancelDeclineHeroHeadline}}</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, {{cancelDeclineHeroSubtext}}
    </p>
  </div>

  <div style="padding:24px 28px 8px;">
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${b.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:20px;font-weight:700;color:{{brandAccentColor}};letter-spacing:1px;">{{bookingRef}}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:1px dashed ${b.border};padding-top:12px;">
        <tr><td style="font-size:12px;color:${b.textMuted};">Jadwal</td><td align="right" style="font-size:14px;font-weight:600;color:${b.text};">{{departureDisplay}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Route</td><td align="right" style="font-size:14px;color:${b.text};">{{originLocation}} → {{destinationLocation}}</td></tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr><td style="font-size:12px;color:${b.textMuted};">Status</td><td align="right" style="font-size:14px;font-weight:600;color:${b.success};">Tetap berlaku</td></tr>
      </table>
    </div>
  </div>

  <!-- Alasan admin WAJIB -->
  <div style="padding:12px 28px;">
    <div style="background:#FEF2F2;border-left:3px solid #DC2626;border-radius:4px;padding:14px 16px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#991B1B;margin-bottom:6px;">Alasan</div>
      <div style="font-size:14px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{cancelDeclineReason}}</div>
    </div>
  </div>

  <!-- Reminder tetap berlaku -->
  <div style="padding:12px 28px;">
    <div style="background:#ECFDF5;border:1px solid #86EFAC;border-radius:8px;padding:14px 16px;">
      <p style="margin:0;font-size:13px;color:#047857;line-height:20px;">
        ℹ Booking Anda <strong>tetap berlaku</strong> sesuai jadwal semula.
        Kalau Anda belum menyelesaikan pembayaran, silakan lanjut transfer di bawah supaya tiket bisa segera di-issue.
      </p>
    </div>
  </div>

  <!-- Payment Instructions (customer belum bayar — pre-payment) -->
  <div style="padding:12px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${b.primary};border-radius:12px;">
      <tr>
        <td style="padding:20px 24px;">
          <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:600;">Total due</div>
          <div style="margin-top:4px;font-size:24px;font-weight:700;color:#fff;">{{currency}} {{totalEstimate}}</div>
        </td>
        <td align="right" style="padding:20px 24px;vertical-align:middle;">
          <div style="font-size:11px;color:rgba(255,255,255,0.75);">Status</div>
          <div style="font-size:13px;color:#fff;font-weight:600;">Awaiting payment</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${b.textMuted};">Bank Transfer</h2>
    <div style="background:${b.surfaceAlt};border:1px solid ${b.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${b.text};line-height:22px;white-space:pre-wrap;">{{bankAccountsBlock}}</div>
    <p style="margin:10px 0 0;font-size:12px;color:${b.textMuted};line-height:18px;">ℹ Transfer dengan nominal <strong>tepat</strong> supaya auto-match sistem lebih cepat. Simpan bukti transfer — kirim ke admin via WhatsApp untuk verifikasi.</p>
  </div>

  <div style="padding:16px 28px 24px;text-align:center;">
    <a href="https://wa.me/{{adminWhatsapp}}?text=Halo%20GtJourneysID%2C%20terkait%20booking%20{{bookingRef}}" style="display:inline-block;background:#25D366;color:#fff;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(37,211,102,0.3);">💬 Diskusi/Kirim Bukti via WhatsApp</a>
    <p style="margin:12px 0 0;font-size:11px;color:${b.textFaint};">Admin WhatsApp: <strong>{{adminWhatsapp}}</strong></p>
  </div>
  `,
  'Pembatalan booking {{bookingRef}} belum bisa diproses',
)

/* Alias legacy — maintain export untuk BookingTemplates.ts yang masih import */
export const DEFAULT_CANCEL_EMAIL_BODY_HTML = DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML

/* ─────────────────────────────────────────────────────────────────────
 * Default values untuk text/content fields.
 * ───────────────────────────────────────────────────────────────────── */
export const defaultFieldValues = {
  footerDisclaimer: 'Secure booking · verified operator · Indonesian archipelago travel',
  otpHeroHeadline: 'Email Verification Code',
  otpHeroSubtext: 'Confirming your email for a GtJourneysID booking.',
  otpSecurityNote: 'Jika kamu tidak meminta kode ini, abaikan email ini — kode akan kedaluwarsa otomatis. Jangan pernah bagikan kode ini ke siapapun, termasuk staf GtJourneysID.',
  paymentHeroHeadline: 'Please complete your payment',
  paymentHeroSubtext: 'terima kasih sudah memesan tiket di GtJourneysID. Kursi kamu sudah di-reserve sementara — lengkapi pembayaran sebelum {{paymentDeadline}}.',
  paymentSecurityNote: 'Hanya transfer ke rekening yang tertulis di email ini. GtJourneysID tidak pernah minta OTP, PIN, atau pembayaran via rekening pribadi lain.',
  // Phase 4.70.3.1 — wording shift dari "e-ticket" ke "payment receipt".
  // Platform tidak issue tiket resmi (hukum operator); yang dilampirkan =
  // payment receipt PDF sebagai bukti pembayaran.
  ticketHeroHeadline: 'Pembayaran dikonfirmasi — payment receipt terlampir',
  ticketHeroSubtext: 'pembayaran kamu sudah kami terima. Payment receipt (PDF) terlampir sebagai bukti pembayaran. Tiket resmi akan diterbitkan oleh operator ferry saat check-in di terminal.',
  ticketChecklistTitle: 'Check-in Checklist',
  // Phase 4.70.3.1 — Receipt tab fields
  receiptBusinessName: 'GtJourneysID',
  receiptAddress: '',
  receiptBusinessId: '',
  receiptDisclaimerText:
    'Dokumen ini adalah bukti pembayaran, BUKAN tiket perjalanan. Tiket resmi diterbitkan oleh operator ferry saat check-in di terminal.\n\nThis document is proof of payment, NOT a travel ticket. The official ticket is issued by the ferry operator at terminal check-in.',
  receiptFooterNote: 'Terima kasih telah mempercayakan perjalanan Anda bersama kami.',
  // Phase 4.70.3.1 — Variable yang di-inject ke email context (bukan field CMS)
  // Default dipakai sebagai REFERENSI untuk admin saat edit template email
  // yang menggunakan {{receiptAttachedNote}}.
  receiptAttachedNoteSuccess:
    '📎 Payment receipt (PDF) terlampir pada email ini. Mohon simpan sebagai bukti pembayaran.',
  receiptAttachedNoteFailed:
    'Terima kasih atas pembayaran Anda. Payment receipt resmi akan dikirimkan menyusul oleh admin kami.',
  // Legacy (dipakai sebagai fallback kalau endpoint lama di-call)
  rescheduleHeroHeadline: 'Reschedule confirmed — detail tiket baru di bawah',
  rescheduleHeroSubtext: 'tim kami sudah proses permintaan reschedule kamu. Berikut detail tiket terbaru + instruksi pembayaran.',
  // Phase 4.70.2.6 — Confirm/Decline split
  rescheduleConfirmHeroHeadline: 'Reschedule disetujui — detail tiket baru di bawah',
  rescheduleConfirmHeroSubtext: 'tim kami sudah proses permintaan reschedule kamu. Berikut detail tiket terbaru + instruksi pembayaran.',
  rescheduleDeclineHeroHeadline: 'Reschedule belum bisa diproses',
  rescheduleDeclineHeroSubtext: 'kami sudah review permintaan reschedule kamu. Mohon maaf, perubahan jadwal belum bisa kami akomodasi — booking kamu tetap berlaku sesuai jadwal semula.',
  // Legacy (deprecated 4.70.2.8)
  cancelHeroHeadline: 'Booking telah dibatalkan',
  cancelHeroSubtext: 'booking kamu sudah berhasil dibatalkan sesuai permintaan. Berikut detail follow-up dari tim kami.',
  // Phase 4.70.2.8 — Cancel Confirm/Decline split
  cancelConfirmHeroHeadline: 'Pembatalan dikonfirmasi — booking sudah dibatalkan',
  cancelConfirmHeroSubtext: 'pembatalan booking kamu sudah kami proses. Berikut detail follow-up & refund kalau ada.',
  cancelDeclineHeroHeadline: 'Pembatalan belum bisa diproses',
  cancelDeclineHeroSubtext: 'kami sudah review permintaan pembatalan kamu. Mohon maaf, pembatalan belum bisa kami proses — booking kamu tetap berlaku sesuai jadwal semula.',
}
