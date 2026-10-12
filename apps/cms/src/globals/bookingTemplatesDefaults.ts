/**
 * Default HTML email templates — Phase 4.70.1.
 *
 * Dipakai sebagai default value field HTML di global `booking-templates`.
 * Admin bisa edit via CMS (super-admin only); default menjaga brand saat
 * belum di-customize.
 *
 * Design: email-safe HTML (inline styles + table-based pada bagian
 * critical). Max-width 640px, Plus Jakarta Sans fallback → Arial.
 * Variables pakai pola `{{var}}` yang di-render oleh templateRenderer.
 *
 * HTML escaping: templateRenderer escape values saat `escapeHtml=true`,
 * jadi {{customerName}} dsb aman walau customer input mengandung `<`.
 */

const brand = {
  primary: '#0F172A',       // Midnight slate
  secondary: '#0EA5E9',     // Ocean cyan
  tertiary: '#0284C7',      // Deep marine blue
  bg: '#F0F9FF',            // Sky canvas
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#0F172A',
  textMuted: '#475569',
  textFaint: '#64748B',
  success: '#10B981',
  successBg: '#ECFDF5',
  successText: '#047857',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  dangerText: '#B91C1C',
  warn: '#F59E0B',
  warnBg: '#FFFBEB',
  warnText: '#B45309',
}

const fontStack = `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`
const monoStack = `"Inter", "SF Mono", Consolas, Monaco, "Courier New", monospace`

/* ─────────────────────────────────────────────────────────────────────
 * Shared email shell — wraps body dgn canvas, logo, footer.
 * Dipakai konsisten di 3 template HTML.
 * ───────────────────────────────────────────────────────────────────── */
function shell(innerHtml: string, preheader: string = ''): string {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>GtJourneysID</title>
</head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:${fontStack};color:${brand.text};-webkit-text-size-adjust:100%;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${brand.surface};border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -2px rgba(15,23,42,0.06);border:1px solid ${brand.border};">
        <!-- Brand header -->
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid ${brand.border};background:${brand.surface};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="display:inline-block;width:36px;height:36px;background:${brand.primary};color:#fff;border-radius:8px;text-align:center;line-height:36px;font-weight:700;font-size:14px;letter-spacing:0.5px;">GT</div>
                  <span style="margin-left:10px;font-size:16px;font-weight:700;color:${brand.text};vertical-align:middle;">GtJourneysID</span>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="font-size:11px;color:${brand.textFaint};letter-spacing:0.5px;text-transform:uppercase;">Secure Transaction</span>
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
          <td style="padding:20px 28px;border-top:1px solid ${brand.border};background:${brand.surfaceAlt};">
            <p style="margin:0 0 8px;font-size:12px;color:${brand.textMuted};line-height:18px;">
              <strong style="color:${brand.text};">PT GtJourneys Nusantara Indonesia</strong><br>
              Secure booking · verified operator · Indonesian archipelago travel
            </p>
            <p style="margin:0 0 8px;font-size:11px;color:${brand.textFaint};line-height:16px;">
              Need help? WhatsApp <a href="https://wa.me/{{adminWhatsapp}}" style="color:${brand.secondary};text-decoration:none;">{{adminWhatsapp}}</a> · Email <a href="mailto:billing@gtjourneys.id" style="color:${brand.secondary};text-decoration:none;">billing@gtjourneys.id</a>
            </p>
            <p style="margin:12px 0 0;padding-top:12px;border-top:1px solid ${brand.border};font-size:11px;color:${brand.textFaint};line-height:16px;">
              This email was sent to <strong>{{customerEmail}}</strong> because of your booking <strong>{{bookingRef}}</strong>.
              <br>GtJourneysID never asks for your passwords, OTPs, or payments to personal accounts.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:16px auto 0;max-width:640px;font-size:11px;color:${brand.textFaint};text-align:center;line-height:16px;">
        © 2026 PT GtJourneys Nusantara Indonesia. All rights reserved.
      </p>
    </td>
  </tr>
</table>
</body>
</html>`
}

/* ─────────────────────────────────────────────────────────────────────
 * OTP Email — Google-style simple.
 * ───────────────────────────────────────────────────────────────────── */
export const DEFAULT_OTP_EMAIL_BODY_HTML = shell(
  `
  <div style="background:${brand.secondary};color:#fff;padding:32px 28px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;line-height:28px;">Email Verification Code</h1>
    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Confirming your email for a GtJourneysID booking.</p>
  </div>
  <div style="padding:28px;">
    <p style="margin:0 0 16px;font-size:14px;color:${brand.text};line-height:22px;">
      Halo,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:${brand.text};line-height:22px;">
      Berikut kode verifikasi untuk menyelesaikan proses booking kamu di GtJourneysID:
    </p>
    <div style="background:${brand.surfaceAlt};border:1.5px solid ${brand.secondary};border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
      <div style="font-family:${monoStack};font-size:36px;font-weight:700;letter-spacing:8px;color:${brand.primary};">{{otp}}</div>
      <div style="margin-top:10px;font-size:12px;color:${brand.textMuted};">Berlaku {{otpTtlMinutes}} menit · hanya untuk 1x pakai</div>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:${brand.textMuted};line-height:20px;">
      Jika kamu <strong>tidak</strong> meminta kode ini, abaikan email ini — kode akan kedaluwarsa otomatis. Jangan pernah bagikan kode ini ke siapapun, termasuk staf GtJourneysID.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:${brand.textFaint};line-height:20px;">Terima kasih,<br><strong style="color:${brand.text};">Tim GtJourneysID</strong></p>
  </div>
  `,
  'Kode verifikasi email GtJourneysID kamu',
)

/* ─────────────────────────────────────────────────────────────────────
 * Payment Instructions Email — full featured.
 * ───────────────────────────────────────────────────────────────────── */
export const DEFAULT_PAYMENT_EMAIL_BODY_HTML = shell(
  `
  <!-- Hero -->
  <div style="background:linear-gradient(135deg,${brand.secondary} 0%,${brand.tertiary} 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">
      Payment Required
    </div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">Please complete your payment</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, terima kasih sudah memesan tiket di GtJourneysID. Kursi kamu sudah di-reserve sementara — lengkapi pembayaran sebelum <strong>{{paymentDeadline}}</strong>.
    </p>
  </div>

  <!-- Booking ref + route -->
  <div style="padding:24px 28px 8px;">
    <div style="background:${brand.surfaceAlt};border:1px solid ${brand.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${brand.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:20px;font-weight:700;color:${brand.secondary};letter-spacing:1px;">{{bookingRef}}</div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px dashed ${brand.border};padding-top:16px;">
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Route</td>
          <td align="right" style="font-size:14px;font-weight:600;color:${brand.text};">{{originLocation}} → {{destinationLocation}}</td>
        </tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Departure</td>
          <td align="right" style="font-size:14px;color:${brand.text};">{{departureDate}}</td>
        </tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Class</td>
          <td align="right" style="font-size:14px;color:${brand.text};">{{ferryClassName}}</td>
        </tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Passengers</td>
          <td align="right" style="font-size:14px;color:${brand.text};">{{adults}} Adult · {{children}} Child</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Total callout -->
  <div style="padding:12px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.primary};border-radius:12px;">
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

  <!-- Bank accounts -->
  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${brand.textMuted};">Bank Transfer</h2>
    <div style="background:${brand.surfaceAlt};border:1px solid ${brand.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${brand.text};line-height:22px;white-space:pre-wrap;">{{bankAccountsBlock}}</div>
    <p style="margin:10px 0 0;font-size:12px;color:${brand.textMuted};line-height:18px;">
      ℹ Transfer dengan nominal <strong>tepat</strong> supaya auto-match sistem lebih cepat.
    </p>
  </div>

  <!-- 3-step -->
  <div style="padding:16px 28px 8px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${brand.textMuted};">Next Steps</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:33%;vertical-align:top;padding:12px;background:${brand.surfaceAlt};border-radius:10px;">
          <div style="width:24px;height:24px;background:${brand.secondary};color:#fff;border-radius:999px;text-align:center;line-height:24px;font-size:12px;font-weight:700;">1</div>
          <div style="margin-top:8px;font-size:13px;font-weight:600;color:${brand.text};">Transfer</div>
          <div style="margin-top:4px;font-size:12px;color:${brand.textMuted};line-height:18px;">Kirim total sebelum batas waktu.</div>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;vertical-align:top;padding:12px;background:${brand.surfaceAlt};border-radius:10px;">
          <div style="width:24px;height:24px;background:${brand.secondary};color:#fff;border-radius:999px;text-align:center;line-height:24px;font-size:12px;font-weight:700;">2</div>
          <div style="margin-top:8px;font-size:13px;font-weight:600;color:${brand.text};">Simpan Bukti</div>
          <div style="margin-top:4px;font-size:12px;color:${brand.textMuted};line-height:18px;">Screenshot atau resi transfer.</div>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;vertical-align:top;padding:12px;background:${brand.surfaceAlt};border-radius:10px;">
          <div style="width:24px;height:24px;background:${brand.secondary};color:#fff;border-radius:999px;text-align:center;line-height:24px;font-size:12px;font-weight:700;">3</div>
          <div style="margin-top:8px;font-size:13px;font-weight:600;color:${brand.text};">Kirim ke Admin</div>
          <div style="margin-top:4px;font-size:12px;color:${brand.textMuted};line-height:18px;">Via WhatsApp verifikasi di bawah.</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- CTA -->
  <div style="padding:16px 28px 24px;text-align:center;">
    <p style="margin:0 0 12px;font-size:13px;color:${brand.text};">Sudah transfer? Kirim bukti ke:</p>
    <a href="https://wa.me/{{adminWhatsapp}}?text=Halo%20GtJourneysID%2C%20saya%20sudah%20transfer%20untuk%20booking%20{{bookingRef}}" style="display:inline-block;background:#25D366;color:#fff;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(37,211,102,0.3);">
      💬 Kirim Bukti via WhatsApp
    </a>
    <p style="margin:12px 0 0;font-size:11px;color:${brand.textFaint};">
      WhatsApp verifikasi: <strong>{{adminWhatsapp}}</strong>
    </p>
  </div>

  <!-- Security notice -->
  <div style="padding:0 28px 24px;">
    <div style="background:${brand.warnBg};border-left:3px solid ${brand.warn};padding:14px 16px;border-radius:4px;">
      <div style="font-size:12px;font-weight:600;color:${brand.warnText};margin-bottom:4px;">🛡 Security Notice</div>
      <div style="font-size:12px;color:${brand.warnText};line-height:18px;">
        Hanya transfer ke rekening yang tertulis di email ini. GtJourneysID tidak pernah minta OTP, PIN, atau pembayaran via rekening pribadi lain.
      </div>
    </div>
  </div>
  `,
  'Instruksi pembayaran booking {{bookingRef}} - GtJourneysID',
)

/* ─────────────────────────────────────────────────────────────────────
 * Ticket Confirmation Email — similar design, success tone.
 * ───────────────────────────────────────────────────────────────────── */
export const DEFAULT_TICKET_EMAIL_BODY_HTML = shell(
  `
  <!-- Hero success -->
  <div style="background:linear-gradient(135deg,${brand.success} 0%,#059669 100%);color:#fff;padding:32px 28px;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">
      ✅ Confirmed
    </div>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:700;line-height:30px;">Your ferry ticket is confirmed!</h1>
    <p style="margin:0;font-size:14px;opacity:0.92;line-height:20px;">
      Halo <strong>{{customerName}}</strong>, pembayaran kamu sudah kami terima. Berikut detail perjalanan kamu — simpan email ini untuk check-in.
    </p>
  </div>

  <!-- Booking ref -->
  <div style="padding:24px 28px 8px;">
    <div style="background:${brand.surfaceAlt};border:1px solid ${brand.border};border-radius:12px;padding:20px;">
      <div style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${brand.textMuted};font-weight:600;">Booking Reference</div>
      <div style="margin-top:4px;font-family:${monoStack};font-size:22px;font-weight:700;color:${brand.success};letter-spacing:1px;">{{bookingRef}}</div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px dashed ${brand.border};">
        <div style="font-size:12px;color:${brand.textMuted};margin-bottom:4px;">Confirmation URL (bookmark this):</div>
        <a href="{{confirmationUrl}}" style="font-size:12px;color:${brand.secondary};word-break:break-all;text-decoration:none;">{{confirmationUrl}}</a>
      </div>
    </div>
  </div>

  <!-- Trip details -->
  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${brand.textMuted};">Trip Details</h2>
    <div style="background:${brand.surface};border:1px solid ${brand.border};border-radius:12px;padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:45%;vertical-align:top;">
            <div style="font-size:11px;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;">From</div>
            <div style="margin-top:2px;font-size:16px;font-weight:700;color:${brand.text};">{{originLocation}}</div>
          </td>
          <td align="center" style="width:10%;vertical-align:middle;padding:0 8px;">
            <div style="font-size:18px;color:${brand.secondary};">→</div>
          </td>
          <td align="right" style="width:45%;vertical-align:top;">
            <div style="font-size:11px;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;">To</div>
            <div style="margin-top:2px;font-size:16px;font-weight:700;color:${brand.text};">{{destinationLocation}}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px dashed ${brand.border};padding-top:14px;">
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Departure Date</td>
          <td align="right" style="font-size:14px;font-weight:600;color:${brand.text};">{{departureDate}}</td>
        </tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Class</td>
          <td align="right" style="font-size:14px;color:${brand.text};">{{ferryClassName}}</td>
        </tr>
        <tr><td colspan="2" style="height:6px;"></td></tr>
        <tr>
          <td style="font-size:12px;color:${brand.textMuted};">Passengers</td>
          <td align="right" style="font-size:14px;color:${brand.text};">{{adults}} Adult · {{children}} Child</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Passenger list -->
  <div style="padding:12px 28px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${brand.textMuted};">Passenger Manifest</h2>
    <div style="background:${brand.surfaceAlt};border:1px solid ${brand.border};border-radius:12px;padding:16px 20px;font-family:${monoStack};font-size:13px;color:${brand.text};line-height:22px;white-space:pre-wrap;">{{passengerList}}</div>
  </div>

  <!-- Check-in checklist -->
  <div style="padding:16px 28px 8px;">
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${brand.textMuted};">Check-in Checklist</h2>
    <div style="background:${brand.successBg};border:1px solid #A7F3D0;border-radius:10px;padding:16px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:${brand.successText};line-height:22px;">
          ✓ Tiba di terminal <strong>60 menit sebelum</strong> keberangkatan.<br>
          ✓ Bawa <strong>passport fisik</strong> (bukan foto/scan).<br>
          ✓ Tunjukkan email ini atau booking reference <strong>{{bookingRef}}</strong> saat check-in.<br>
          ✓ Simpan nomor WA admin: <strong>{{adminWhatsapp}}</strong> untuk darurat.
        </td></tr>
      </table>
    </div>
  </div>

  <!-- Thanks -->
  <div style="padding:16px 28px 24px;text-align:center;">
    <p style="margin:0;font-size:14px;color:${brand.text};">Selamat jalan — have a great trip! 🌊</p>
    <p style="margin:4px 0 0;font-size:12px;color:${brand.textFaint};">— Tim GtJourneysID</p>
  </div>
  `,
  'Tiket kamu confirmed — booking {{bookingRef}}',
)
