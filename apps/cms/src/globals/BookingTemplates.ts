import type { GlobalConfig } from 'payload'
import { isAdmin, superAdminFieldAccess } from '../access/roles'
import {
  DEFAULT_OTP_EMAIL_BODY_HTML,
  DEFAULT_PAYMENT_EMAIL_BODY_HTML,
  DEFAULT_TICKET_EMAIL_BODY_HTML,
  DEFAULT_RESCHEDULE_EMAIL_BODY_HTML,
  DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML,
  DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML,
  DEFAULT_CANCEL_EMAIL_BODY_HTML,
  DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML,
  DEFAULT_CANCEL_DECLINE_EMAIL_BODY_HTML,
  defaultFieldValues as D,
} from './bookingTemplatesDefaults'

/**
 * Booking Templates — Phase 4.69.6.
 *
 * Template editable untuk pesan email + WhatsApp yang dikirim admin
 * saat flow handoff booking:
 *   - Payment Instructions (saat `awaiting_review` → `awaiting_payment`)
 *   - Confirmation / E-Ticket (saat `payment_review` → `confirmed`)
 *   - Reschedule Response
 *   - Cancellation Response
 *   - OTP Email (Phase 4.69.2 — reserved untuk saat admin ingin kustomisasi)
 *
 * + Bank accounts array (snapshot ke pesan payment)
 *
 * Variable substitution: `{{varname}}` di body → di-replace oleh engine
 * (lihat `apps/web/src/lib/checkout/templateRenderer.ts`). Whitelist
 * strict + D10=ERROR saat variable tidak ter-resolve.
 *
 * Access:
 * - read:   isAdmin (semua admin+ bisa preview + lihat variable info)
 * - update: isSuperAdmin (SUPER-ADMIN ONLY — D7 approval)
 */
export const BookingTemplates: GlobalConfig = {
  slug: 'booking-templates',
  label: 'Booking Templates',
  admin: {
    group: 'Bookings',
    description: 'Template pesan untuk invoice, konfirmasi, reschedule, cancel. Variables: {{bookingRef}}, {{customerName}}, {{totalEstimate}}, dst. Super-admin only untuk edit.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    read: isAdmin,
    update: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          description: 'Phase 4.70.2 — Shared brand elements. Apply ke SEMUA 5 template email (OTP, Payment, Confirmation, Reschedule, Cancel).',
          fields: [
            {
              name: 'brandLogo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Logo header di semua email. Pakai PNG 400×100 transparent bg. Kalau kosong, fallback ke "GT" text badge.',
              },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'brandAccentColor',
              type: 'text',
              defaultValue: '#0EA5E9',
              admin: {
                description: 'Warna accent (hero gradient start, link, button). Hex format. Default: #0EA5E9 (ocean cyan).',
              },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'brandCompanyName',
              type: 'text',
              defaultValue: 'PT GtJourneys Nusantara Indonesia',
              admin: { description: 'Nama perusahaan di footer email.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'supportEmail',
              type: 'text',
              defaultValue: 'billing@gtjourneys.id',
              admin: { description: 'Email contact di footer email semua template.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'footerDisclaimer',
              type: 'textarea',
              defaultValue: D.footerDisclaimer,
              admin: { rows: 2, description: 'Tagline singkat di footer email.' },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Payment Instructions',
          description: 'Dikirim saat admin klik "Send Payment Instructions" (Phase 4.69.7).',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentHeroHeadline',
                  type: 'text',
                  defaultValue: D.paymentHeroHeadline,
                  admin: { width: '50%', description: 'Headline besar di hero section.' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'paymentHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.paymentHeroSubtext,
                  admin: { width: '50%', rows: 2, description: 'Sub-text di hero. Variables: {{paymentDeadline}}.' },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'paymentSecurityNote',
              type: 'textarea',
              defaultValue: D.paymentSecurityNote,
              admin: { rows: 2, description: 'Security notice box bawah email.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'paymentEmailSubject',
              type: 'text',
              required: true,
              defaultValue: 'Payment Instructions for Booking {{bookingRef}}',
              admin: { description: 'Boleh pakai variable di subject.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'paymentEmailBody',
              type: 'textarea',
              required: true,
              defaultValue: 'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDate}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{currency}} {{totalEstimate}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadline}}.\n\nTerima kasih,\nGtJourneysID',
              admin: { description: 'HTML/plain text. Variables: lihat tab Variables Reference.', rows: 15 },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'paymentEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_PAYMENT_EMAIL_BODY_HTML,
              admin: {
                // Phase 4.70.1 fix — hide dari UI: raw HTML tidak user-friendly.
                // Default compose di `bookingTemplatesDefaults.ts` (SSOT).
                // Advanced override masih bisa via direct DB write atau un-hide
                // sementara untuk developer. Phase 4.70.2 akan tambah structured
                // fields (logo, warna, teks) untuk edit UX yang friendly.
                hidden: true,
                rows: 20,
                description: '[Advanced/dev-only] Raw HTML override. Default auto-populate dari code SSOT kalau kosong.',
              },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'paymentWhatsappBody',
              type: 'textarea',
              required: true,
              defaultValue: 'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDate}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{currency}} {{totalEstimate}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadline}}.',
              admin: { description: 'Pesan WA — plain text, emoji OK. Max ~1500 char.', rows: 12 },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Confirmation / E-Ticket',
          description: 'Dikirim saat admin klik "Confirm Payment & Send Ticket".',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'ticketHeroHeadline',
                  type: 'text',
                  defaultValue: D.ticketHeroHeadline,
                  admin: { width: '50%' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'ticketHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.ticketHeroSubtext,
                  admin: { width: '50%', rows: 2 },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'ticketChecklistTitle',
              type: 'text',
              defaultValue: D.ticketChecklistTitle,
              admin: { description: 'Judul section checklist check-in.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'ticketEmailSubject',
              type: 'text',
              required: true,
              defaultValue: 'Booking {{bookingRef}} Dikonfirmasi — Payment Receipt Terlampir',
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'ticketEmailBody',
              type: 'textarea',
              required: true,
              defaultValue: 'Hi {{customerName}},\n\nPembayaran kamu sudah kami terima — booking {{bookingRef}} CONFIRMED.\n\n{{receiptAttachedNote}}\n\n*Detail Perjalanan:*\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDate}}\n*Class:* {{ferryClassName}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n\n{{passengerList}}\n\nTiket resmi diterbitkan oleh operator ferry saat check-in di terminal. Mohon tiba 60 menit sebelum keberangkatan dengan passport fisik.\n\nTerima kasih,\nGtJourneysID',
              admin: { rows: 15, description: 'Variable {{receiptAttachedNote}} auto-switch wording success vs failed berdasarkan hasil generate PDF.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'ticketEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_TICKET_EMAIL_BODY_HTML,
              admin: {
                hidden: true,
                rows: 20,
                description: '[Advanced/dev-only] Raw HTML override.',
              },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'ticketWhatsappBody',
              type: 'textarea',
              required: true,
              defaultValue: '✅ *Booking Confirmed!*\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDate}}\n🎫 Kelas: {{ferryClassName}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n\n{{receiptAttachedNote}}\n\nTiket resmi diterbitkan oleh operator saat check-in. Tiba di terminal 60 menit sebelum berangkat ya!',
              admin: { rows: 10, description: 'Variable {{receiptAttachedNote}} auto-switch wording success vs failed.' },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Reschedule Response',
          description: 'Phase 4.70.2.6 — Split jadi dua template: Confirm (disetujui) dan Decline (ditolak). Admin pilih via tombol di booking edit view. Variable {{rescheduleConfirmNote}} (opsional) + {{rescheduleDeclineReason}} (wajib) diisi admin pada saat kirim lewat textarea di modal.',
          fields: [
            // ═══════════ CONFIRM (DISETUJUI) ═══════════
            {
              type: 'row',
              fields: [
                {
                  name: 'rescheduleConfirmHeroHeadline',
                  type: 'text',
                  defaultValue: D.rescheduleConfirmHeroHeadline,
                  admin: { width: '50%', description: '✅ CONFIRM — Headline email saat admin APPROVE reschedule.' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'rescheduleConfirmHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.rescheduleConfirmHeroSubtext,
                  admin: { width: '50%', rows: 2 },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'rescheduleConfirmEmailSubject',
              type: 'text',
              defaultValue: 'Reschedule Disetujui — Booking {{bookingRef}}',
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleConfirmEmailBody',
              type: 'textarea',
              defaultValue: 'Hi {{customerName}},\n\nPermintaan reschedule untuk booking {{bookingRef}} sudah DISETUJUI.\n\nJadwal baru: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nCatatan tambahan:\n{{rescheduleConfirmNote}}\n\nSilakan selesaikan pembayaran sebelum keberangkatan.\n\nTerima kasih,\nGtJourneysID',
              admin: { rows: 12, description: 'Plain-text fallback. Variable {{rescheduleConfirmNote}} = catatan dari admin saat kirim.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleConfirmEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_RESCHEDULE_CONFIRM_EMAIL_BODY_HTML,
              admin: { hidden: true, rows: 20, description: '[Advanced/dev-only] Raw HTML override.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleConfirmWhatsappBody',
              type: 'textarea',
              defaultValue: '✅ Reschedule DISETUJUI untuk booking {{bookingRef}}.\n\n📅 Jadwal baru: {{departureDisplay}}\n📍 Route: {{originLocation}} → {{destinationLocation}}\n\nCatatan: {{rescheduleConfirmNote}}\n\nSelesaikan pembayaran sebelum keberangkatan ya. Terima kasih! 🙏',
              admin: { rows: 8 },
              access: { update: superAdminFieldAccess },
            },
            // ═══════════ DECLINE (DITOLAK) ═══════════
            {
              type: 'row',
              fields: [
                {
                  name: 'rescheduleDeclineHeroHeadline',
                  type: 'text',
                  defaultValue: D.rescheduleDeclineHeroHeadline,
                  admin: { width: '50%', description: '❌ DECLINE — Headline email saat admin DECLINE reschedule.' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'rescheduleDeclineHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.rescheduleDeclineHeroSubtext,
                  admin: { width: '50%', rows: 2 },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'rescheduleDeclineEmailSubject',
              type: 'text',
              defaultValue: 'Reschedule Belum Bisa Diproses — Booking {{bookingRef}}',
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleDeclineEmailBody',
              type: 'textarea',
              defaultValue: 'Hi {{customerName}},\n\nMohon maaf, permintaan reschedule untuk booking {{bookingRef}} BELUM BISA kami proses.\n\nAlasan:\n{{rescheduleDeclineReason}}\n\nBooking Anda tetap berlaku sesuai jadwal semula: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nKalau butuh diskusi alternatif, hubungi admin via WhatsApp.\n\nTerima kasih,\nGtJourneysID',
              admin: { rows: 12, description: 'Plain-text fallback. Variable {{rescheduleDeclineReason}} = alasan WAJIB dari admin.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleDeclineEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_RESCHEDULE_DECLINE_EMAIL_BODY_HTML,
              admin: { hidden: true, rows: 20, description: '[Advanced/dev-only] Raw HTML override.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleDeclineWhatsappBody',
              type: 'textarea',
              defaultValue: '❌ Mohon maaf, reschedule booking {{bookingRef}} belum bisa diproses.\n\nAlasan: {{rescheduleDeclineReason}}\n\nBooking tetap berlaku jadwal semula: {{departureDisplay}}.\nKontak admin kalau butuh diskusi alternatif ya.',
              admin: { rows: 8 },
              access: { update: superAdminFieldAccess },
            },
            // ─────────── LEGACY (deprecated 4.70.2.6) ───────────
            {
              name: 'rescheduleHeroHeadline',
              type: 'text',
              defaultValue: D.rescheduleHeroHeadline,
              admin: { hidden: true, description: '[Deprecated 4.70.2.6] Gunakan rescheduleConfirmHeroHeadline / rescheduleDeclineHeroHeadline.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleHeroSubtext',
              type: 'textarea',
              defaultValue: D.rescheduleHeroSubtext,
              admin: { hidden: true },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_RESCHEDULE_EMAIL_BODY_HTML,
              admin: { hidden: true, description: '[Deprecated 4.70.2.6]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleEmailSubject',
              type: 'text',
              defaultValue: 'Reschedule Request — Booking {{bookingRef}}',
              admin: { hidden: true, description: '[Deprecated 4.70.2.6]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleEmailBody',
              type: 'textarea',
              defaultValue: 'Hi {{customerName}},\n\nPermintaan reschedule untuk booking {{bookingRef}} sudah kami review.\n\n[Admin — isi detail reschedule di sini sebelum kirim]\n\nTerima kasih,\nGtJourneysID',
              admin: { hidden: true, description: '[Deprecated 4.70.2.6]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'rescheduleWhatsappBody',
              type: 'textarea',
              defaultValue: 'Halo {{customerName}}, permintaan reschedule booking {{bookingRef}} sudah kami review.\n\n[Admin tambah detail di sini]',
              admin: { hidden: true, description: '[Deprecated 4.70.2.6]' },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Cancellation Response',
          description: 'Phase 4.70.2.8 — Split jadi Confirm (dikonfirmasi) dan Decline (ditolak). Admin pilih via tombol di booking edit view. Variable {{cancelConfirmNote}} (opsional) + {{cancelDeclineReason}} (wajib) diisi admin saat kirim lewat textarea di modal.',
          fields: [
            // ═══════════ CONFIRM (DIKONFIRMASI) ═══════════
            {
              type: 'row',
              fields: [
                {
                  name: 'cancelConfirmHeroHeadline',
                  type: 'text',
                  defaultValue: D.cancelConfirmHeroHeadline,
                  admin: { width: '50%', description: '❌ CONFIRM — Headline saat admin APPROVE cancel.' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'cancelConfirmHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.cancelConfirmHeroSubtext,
                  admin: { width: '50%', rows: 2 },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'cancelConfirmEmailSubject',
              type: 'text',
              defaultValue: 'Pembatalan Booking {{bookingRef}} Dikonfirmasi',
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelConfirmEmailBody',
              type: 'textarea',
              defaultValue: 'Hi {{customerName}},\n\nPembatalan untuk booking {{bookingRef}} sudah DIKONFIRMASI.\n\nJadwal yang dibatalkan: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nCatatan dari admin:\n{{cancelConfirmNote}}\n\nTerima kasih,\nGtJourneysID',
              admin: { rows: 12, description: 'Plain-text fallback. Variable {{cancelConfirmNote}} = catatan dari admin saat kirim.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelConfirmEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_CANCEL_CONFIRM_EMAIL_BODY_HTML,
              admin: { hidden: true, rows: 20, description: '[Advanced/dev-only] Raw HTML override.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelConfirmWhatsappBody',
              type: 'textarea',
              defaultValue: '❌ Pembatalan DIKONFIRMASI untuk booking {{bookingRef}}.\n\n📅 Jadwal yg dibatalkan: {{departureDisplay}}\n📍 Route: {{originLocation}} → {{destinationLocation}}\n\nCatatan: {{cancelConfirmNote}}\n\nTerima kasih! 🙏',
              admin: { rows: 8 },
              access: { update: superAdminFieldAccess },
            },
            // ═══════════ DECLINE (DITOLAK) ═══════════
            {
              type: 'row',
              fields: [
                {
                  name: 'cancelDeclineHeroHeadline',
                  type: 'text',
                  defaultValue: D.cancelDeclineHeroHeadline,
                  admin: { width: '50%', description: '⚠ DECLINE — Headline saat admin DECLINE cancel.' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'cancelDeclineHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.cancelDeclineHeroSubtext,
                  admin: { width: '50%', rows: 2 },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'cancelDeclineEmailSubject',
              type: 'text',
              defaultValue: 'Pembatalan Booking {{bookingRef}} Belum Bisa Diproses',
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelDeclineEmailBody',
              type: 'textarea',
              defaultValue: 'Hi {{customerName}},\n\nMohon maaf, permintaan pembatalan untuk booking {{bookingRef}} BELUM BISA kami proses.\n\nAlasan:\n{{cancelDeclineReason}}\n\nBooking Anda tetap berlaku sesuai jadwal semula: {{departureDisplay}}\nRoute: {{originLocation}} → {{destinationLocation}}\n\nSilakan lanjut pembayaran kalau belum selesai. Kalau butuh diskusi, hubungi admin via WhatsApp.\n\nTerima kasih,\nGtJourneysID',
              admin: { rows: 12, description: 'Plain-text fallback. Variable {{cancelDeclineReason}} = alasan WAJIB dari admin.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelDeclineEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_CANCEL_DECLINE_EMAIL_BODY_HTML,
              admin: { hidden: true, rows: 20, description: '[Advanced/dev-only] Raw HTML override.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelDeclineWhatsappBody',
              type: 'textarea',
              defaultValue: '⚠ Mohon maaf, pembatalan booking {{bookingRef}} belum bisa diproses.\n\nAlasan: {{cancelDeclineReason}}\n\nBooking tetap berlaku: {{departureDisplay}}.\nLanjut pembayaran atau diskusi via WA ya.',
              admin: { rows: 8 },
              access: { update: superAdminFieldAccess },
            },
            // ─────────── LEGACY (deprecated 4.70.2.8) ───────────
            {
              name: 'cancelHeroHeadline',
              type: 'text',
              defaultValue: D.cancelHeroHeadline,
              admin: { hidden: true, description: '[Deprecated 4.70.2.8]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelHeroSubtext',
              type: 'textarea',
              defaultValue: D.cancelHeroSubtext,
              admin: { hidden: true },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_CANCEL_EMAIL_BODY_HTML,
              admin: { hidden: true, description: '[Deprecated 4.70.2.8]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelEmailSubject',
              type: 'text',
              defaultValue: 'Cancellation — Booking {{bookingRef}}',
              admin: { hidden: true, description: '[Deprecated 4.70.2.8]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelEmailBody',
              type: 'textarea',
              defaultValue: 'Hi {{customerName}},\n\nBooking {{bookingRef}} sudah dibatalkan sesuai permintaan.\n\n[Admin — isi detail refund policy di sini]\n\nTerima kasih,\nGtJourneysID',
              admin: { hidden: true, description: '[Deprecated 4.70.2.8]' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'cancelWhatsappBody',
              type: 'textarea',
              defaultValue: 'Halo {{customerName}}, booking {{bookingRef}} sudah dibatalkan.\n\n[Admin tambah detail refund]',
              admin: { hidden: true, description: '[Deprecated 4.70.2.8]' },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'OTP Email',
          description: 'Template email OTP verifikasi (Phase 4.69.2). Variabel wajib: {{otp}}.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'otpHeroHeadline',
                  type: 'text',
                  defaultValue: D.otpHeroHeadline,
                  admin: { width: '50%' },
                  access: { update: superAdminFieldAccess },
                },
                {
                  name: 'otpHeroSubtext',
                  type: 'textarea',
                  defaultValue: D.otpHeroSubtext,
                  admin: { width: '50%', rows: 2 },
                  access: { update: superAdminFieldAccess },
                },
              ],
            },
            {
              name: 'otpSecurityNote',
              type: 'textarea',
              defaultValue: D.otpSecurityNote,
              admin: { rows: 3, description: 'Catatan keamanan/anti-phishing di bawah kode OTP.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'otpEmailSubject',
              type: 'text',
              required: true,
              defaultValue: 'Your GtJourneysID verification code: {{otp}}',
              admin: { description: 'Harus mengandung {{otp}} supaya kode tampil di subject.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'otpEmailBody',
              type: 'textarea',
              required: true,
              defaultValue: 'Halo,\n\nKode verifikasi GtJourneysID kamu: {{otp}}\n\nKode berlaku selama {{otpTtlMinutes}} menit. Jangan bagikan ke siapapun.\n\nKalau kamu tidak meminta kode ini, abaikan email ini.\n\n— GtJourneysID',
              admin: { rows: 10, description: 'Plain text fallback. Harus mengandung {{otp}}.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'otpEmailBodyHtml',
              type: 'textarea',
              defaultValue: DEFAULT_OTP_EMAIL_BODY_HTML,
              admin: {
                hidden: true,
                rows: 20,
                description: '[Advanced/dev-only] Raw HTML override.',
              },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Receipt / Bukti Pembayaran',
          description: 'Phase 4.70.3.1 — Field untuk Payment Receipt PDF yang dilampirkan di email "Confirm Payment & Send Receipt". Platform TIDAK menerbitkan tiket resmi (urusan operator); dokumen ini hanya bukti pembayaran. Super-admin only.',
          fields: [
            {
              name: 'receiptBusinessName',
              type: 'text',
              defaultValue: D.receiptBusinessName,
              admin: { description: 'Nama usaha yang muncul di header PDF. Jangan pakai "PT" / entitas legal selama bisnis masih personal. Fallback: "GtJourneysID" kalau kosong.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'receiptAddress',
              type: 'textarea',
              defaultValue: D.receiptAddress,
              admin: { rows: 3, description: 'Alamat usaha (multi-line OK). Opsional — kosong = tidak render line di PDF.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'receiptBusinessId',
              type: 'text',
              defaultValue: D.receiptBusinessId,
              admin: { description: 'ID usaha (NPWP, NIB, dsb.) kalau ada. Opsional.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'receiptDisclaimerText',
              type: 'textarea',
              required: true,
              defaultValue: D.receiptDisclaimerText,
              admin: { rows: 5, description: 'Disclaimer wajib (ID + EN). Fallback runtime ke default bilingual kalau kosong.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'receiptFooterNote',
              type: 'textarea',
              defaultValue: D.receiptFooterNote,
              admin: { rows: 2, description: 'Catatan penutup di bawah disclaimer. Opsional.' },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Bank Accounts',
          description: 'Daftar rekening yang di-render ke {{bankAccountsBlock}}.',
          fields: [
            {
              name: 'bankAccounts',
              type: 'array',
              label: 'Bank Accounts',
              admin: { description: 'Satu rekening per baris. Format tampil: "Bank — nama holder — rekening".' },
              fields: [
                { name: 'bankName', type: 'text', required: true, admin: { description: 'Contoh: BCA, Mandiri, OCBC.' } },
                { name: 'accountNumber', type: 'text', required: true },
                { name: 'accountHolder', type: 'text', required: true },
              ],
            },
            {
              name: 'adminWhatsapp',
              type: 'text',
              defaultValue: '',
              admin: { description: 'Nomor WA admin untuk kirim bukti bayar (format +62…). Opsional — fallback ke SiteSettings.whatsapp.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'adminName',
              type: 'text',
              defaultValue: 'GtJourneysID Team',
              admin: { description: 'Nama/signature untuk {{adminName}}.' },
              access: { update: superAdminFieldAccess },
            },
            {
              name: 'paymentDeadlineHours',
              type: 'number',
              defaultValue: 24,
              min: 1,
              max: 168,
              admin: { description: 'Window pembayaran dalam JAM. Default 24. Dipakai menghitung {{paymentDeadline}}.' },
              access: { update: superAdminFieldAccess },
            },
          ],
        },
        {
          label: 'Variables Reference',
          description: 'Daftar lengkap variable yang bisa dipakai di template body/subject.',
          fields: [
            {
              name: 'variablesReferenceDoc',
              type: 'textarea',
              admin: {
                readOnly: true,
                rows: 20,
                description: 'Read-only — list variabel yang di-support engine. Variable yang tidak ter-whitelist akan error saat kirim.',
              },
              defaultValue: 'VARIABEL YANG TERSEDIA (D10 ERROR saat missing):\n\n— Booking —\n{{bookingRef}}         Ref booking (contoh: FT-20261009-A1B2C3)\n{{accessToken}}        Token akses halaman konfirmasi\n{{confirmationUrl}}    URL confirmation page lengkap dgn token\n\n— Customer —\n{{customerName}}       Nama pemesan\n{{customerEmail}}      Email pemesan\n{{customerWhatsapp}}   WA pemesan (snapshot composed)\n{{customerCountry}}    Negara asal\n\n— Trip —\n{{tripType}}           "one-way" / "round-trip"\n{{departureDate}}      Format YYYY-MM-DD\n{{returnDate}}         Hanya kalau round-trip, kalau tidak kosong\n{{originLocation}}     Nama kota asal\n{{destinationLocation}} Nama kota tujuan\n{{ferryClassName}}     Nama kelas (contoh: Emerald)\n{{adults}}, {{children}} Jumlah penumpang\n{{passengerList}}      Multi-line: tiap passenger 1 baris\n\n— Pricing —\n{{unitPrice}}, {{totalEstimate}}, {{currency}}\n\n— Payment —\n{{bankAccountsBlock}}  Formatted bank list dari tab Bank Accounts\n{{paymentDeadline}}    Datetime deadline = now + paymentDeadlineHours jam\n\n— Admin —\n{{adminName}}, {{adminWhatsapp}}\n\n— OTP (hanya untuk template OTP Email) —\n{{otp}}                6-digit OTP\n{{otpTtlMinutes}}      TTL dalam menit (dari env OTP_TTL_MINUTES)\n',
            },
          ],
        },
      ],
    },
  ],
}
