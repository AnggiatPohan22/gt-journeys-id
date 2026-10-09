import type { CollectionConfig, Endpoint } from 'payload'
import { isAdmin, isSuperAdmin, superAdminFieldAccess } from '../access/roles'
import {
  buildContext,
  buildWaLink,
  computePaymentDeadline,
  formatBankAccountsBlock,
  formatPassengerList,
  renderTemplate,
} from '../lib/templateRenderer'
import { sendEmail } from '../lib/sendEmail'

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
  whatsappBody?: string
  waUrl?: string | null
  sentEmailId?: string
  newStatus?: string
  errors?: string[]
}

async function readTemplates(req: Parameters<Endpoint['handler']>[0]) {
  return req.payload.findGlobal({
    slug: 'booking-templates',
    overrideAccess: true,
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

      const ctx = buildContext(booking as any, {
        bankAccountsBlock: formatBankAccountsBlock(banks),
        paymentDeadline: computePaymentDeadline(hours),
        adminName,
        adminWhatsapp,
        confirmationUrl: confirmationUrl ?? undefined,
      })

      const emailSubjectR = renderTemplate(String(tpl.paymentEmailSubject ?? ''), ctx)
      const emailBodyR = renderTemplate(String(tpl.paymentEmailBody ?? ''), ctx)
      const waBodyR = renderTemplate(String(tpl.paymentWhatsappBody ?? ''), ctx)

      const errors = [
        ...emailSubjectR.errors.map((e) => `[Email Subject] ${e}`),
        ...emailBodyR.errors.map((e) => `[Email Body] ${e}`),
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

      const sent = await sendEmail({
        to,
        subject: emailSubjectR.rendered,
        text: emailBodyR.rendered,
        idempotencyKey: `payment:${booking.bookingRef}:${req.user!.id}`,
      })
      if (!sent.ok) {
        return Response.json(
          { ok: false, errors: [`Email gagal terkirim: ${sent.error ?? 'unknown'}`] },
          { status: 502 },
        )
      }

      await req.payload.update({
        collection: 'bookings',
        id,
        data: {
          status: 'awaiting_payment',
          sentPaymentAt: new Date().toISOString(),
          sentPaymentBy: req.user!.id,
        },
        overrideAccess: true,
      })

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

    try {
      const booking = (await req.payload.findByID({
        collection: 'bookings',
        id,
        overrideAccess: true,
        depth: 0,
      })) as Record<string, unknown>

      if (!previewOnly) {
        const status = booking.status as string | undefined
        if (status !== 'payment_review' && status !== 'awaiting_payment') {
          return Response.json(
            {
              ok: false,
              errors: [
                `Booking status "${status}" tidak valid untuk Send Ticket. Harus "payment_review" (atau "awaiting_payment" sebagai shortcut).`,
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

      const ctx = buildContext(booking as any, {
        passengerList: formatPassengerList((booking.passengers as any) ?? []),
        adminName,
        adminWhatsapp,
        confirmationUrl: confirmationUrl ?? undefined,
      })

      const emailSubjectR = renderTemplate(String(tpl.ticketEmailSubject ?? ''), ctx)
      const emailBodyR = renderTemplate(String(tpl.ticketEmailBody ?? ''), ctx)
      const waBodyR = renderTemplate(String(tpl.ticketWhatsappBody ?? ''), ctx)

      const errors = [
        ...emailSubjectR.errors.map((e) => `[Email Subject] ${e}`),
        ...emailBodyR.errors.map((e) => `[Email Body] ${e}`),
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
          whatsappBody: waBodyR.rendered,
          waUrl,
        } satisfies HandoffResponse)
      }

      const to = booking.customerEmail as string | undefined
      if (!to) {
        return Response.json(
          { ok: false, errors: ['Customer email kosong — tidak bisa kirim e-ticket.'] },
          { status: 400 },
        )
      }

      const sent = await sendEmail({
        to,
        subject: emailSubjectR.rendered,
        text: emailBodyR.rendered,
        idempotencyKey: `ticket:${booking.bookingRef}:${req.user!.id}`,
      })
      if (!sent.ok) {
        return Response.json(
          { ok: false, errors: [`Email gagal terkirim: ${sent.error ?? 'unknown'}`] },
          { status: 502 },
        )
      }

      await req.payload.update({
        collection: 'bookings',
        id,
        data: {
          status: 'confirmed',
          sentTicketAt: new Date().toISOString(),
          sentTicketBy: req.user!.id,
        },
        overrideAccess: true,
      })

      return Response.json({
        ok: true,
        previewOnly: false,
        emailSubject: emailSubjectR.rendered,
        emailBody: emailBodyR.rendered,
        whatsappBody: waBodyR.rendered,
        waUrl,
        sentEmailId: sent.id,
        newStatus: 'confirmed',
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
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  endpoints: [sendPaymentEndpoint, sendTicketEndpoint],
  fields: [
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
        description: '128-bit random capability token. Never share screenshot yang mengandung ini.',
        readOnly: true,
        hidden: false,
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
        { name: 'customerEmail', type: 'email',                  admin: { width: '50%' } },
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
        { name: 'contactPhone',       type: 'text', admin: { width: '50%', description: 'Nomor telepon tanpa kode negara.' } },
        { name: 'contactPhoneIsWhatsapp', type: 'checkbox', defaultValue: true, admin: { width: '30%', description: 'Nomor ini juga WhatsApp.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'customerWhatsapp', type: 'text', required: true, admin: { width: '50%', description: 'Snapshot WA final ({region}{phone}). Dipakai channel WA & gateway.' } },
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
            { name: 'dateOfBirth',        type: 'date', admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
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
            { name: 'passportIssueDate',  type: 'date', admin: { width: '17%', date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'passportExpiryDate', type: 'date', admin: { width: '33%', date: { pickerAppearance: 'dayOnly' }, description: 'Minimal 6 bulan setelah departureDate.' } },
          ],
        },
      ],
    },

    // ── Booking details (snapshot) ───────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'departureDate', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
        { name: 'adults',        type: 'number', required: true, defaultValue: 1, min: 0, admin: { width: '33%' } },
        { name: 'children',      type: 'number', defaultValue: 0, min: 0, admin: { width: '33%' } },
      ],
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
            { name: 'returnUnitPrice',     type: 'number', admin: { width: '50%', description: 'Harga adult leg return (snapshot).' } },
            { name: 'returnTotalEstimate', type: 'number', admin: { width: '50%', description: 'Total leg return (adults×unitPrice + children×childPrice).' } },
          ],
        },
      ],
    },

    // ── Pricing (snapshot) ───────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'unitPrice',     type: 'number', admin: { width: '33%', description: 'Harga per adult saat booking dibuat.' } },
        { name: 'currency',      type: 'text',   defaultValue: 'IDR', admin: { width: '33%' } },
        { name: 'totalEstimate', type: 'number', admin: { width: '33%', description: 'Estimasi total GRAND. Round-trip: outbound + return. One-way: outbound saja.' } },
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
            { name: 'sentTicketAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' }, readOnly: true, description: 'Di-set oleh admin "Confirm Payment & Send Ticket" (Phase 4.69.7).' } },
            { name: 'sentTicketBy', type: 'relationship', relationTo: 'users', admin: { width: '50%', readOnly: true, description: 'Admin yang kirim e-ticket.' } },
          ],
        },
      ],
    },
  ],
}
