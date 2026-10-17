import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'
import { isAdmin, isApiOrAdmin, isSuperAdmin, superAdminFieldAccess } from '../access/roles'
import { sendEmail } from '../lib/sendEmail'
import { sendTicketEndpoint } from './Bookings'

/**
 * Phase 4.74.2 (create) + 4.74.4 (status update) — beforeChange guard:
 *   - On update + status=rejected: `rejectedReason` wajib terisi.
 *   - On update + status transition pending→approved/rejected: set
 *     `reviewedAt=now` + `reviewedBy=req.user.id`.
 */
const paymentProofGuardHook: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) return data

  const prevStatus = String((originalDoc as { status?: string }).status ?? '')
  const nextStatus = String((data as { status?: string }).status ?? prevStatus)

  if (nextStatus === 'rejected') {
    const reason = String((data as { rejectedReason?: string }).rejectedReason ?? '').trim()
    const prevReason = String((originalDoc as { rejectedReason?: string }).rejectedReason ?? '').trim()
    if (!reason && !prevReason) {
      throw new Error(
        '`rejectedReason` wajib diisi saat set status=rejected (dikirim ke customer).',
      )
    }
  }

  // Status transition pending → approved/rejected: capture reviewer.
  if (
    prevStatus === 'pending' &&
    (nextStatus === 'approved' || nextStatus === 'rejected')
  ) {
    ;(data as Record<string, unknown>).reviewedAt = new Date().toISOString()
    const userId = (req?.user as { id?: number | string } | null | undefined)?.id
    if (userId != null) {
      ;(data as Record<string, unknown>).reviewedBy = userId
    }
  }

  return data
}

/**
 * Phase 4.74.2 (create) + 4.74.4 (status update) — afterChange hook.
 *
 * On create (customer submit):
 *   - bookings.latestPaymentProof = this.id
 *   - bookings.paymentProofAttempts += 1
 *   - bookings.status: awaiting_payment → payment_review
 *   - AdminNotif type=payment_proof_submitted
 *
 * On update + status transition pending → approved:
 *   - bookings.status → confirmed (admin kemudian klik "Confirm Payment &
 *     Send Ticket" existing untuk kirim e-ticket + receipt PDF — flow 2-step
 *     dibiarkan supaya admin bisa verify sekali lagi sebelum e-ticket).
 *   - AdminNotif type=other severity=info "proof approved".
 *
 * On update + status transition pending → rejected:
 *   - bookings.status → awaiting_payment (kembali ke flow bayar).
 *   - Customer email dengan rejectedReason.
 *   - AdminNotif type=payment_rejected severity=warning.
 *
 * Best-effort: wrap try/catch per step. Log error only — satu side-effect
 * gagal tidak block flow utama.
 */
const paymentProofsLifecycleHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const bookingId = typeof (doc as { booking?: unknown }).booking === 'number'
    ? (doc as { booking: number }).booking
    : Number((doc as { booking?: { id?: number } }).booking?.id ?? 0)
  if (!bookingId) {
    req.payload.logger?.warn?.('[Phase 4.74.4] PaymentProof hook tanpa booking id — skip.')
    return doc
  }

  // ─── CREATE: sync booking + notif submitted ───
  if (operation === 'create') {
    try {
      const booking = await req.payload.findByID({
        collection: 'bookings',
        id: bookingId,
        depth: 0,
        overrideAccess: true,
      })
      const prevAttempts = Number((booking as { paymentProofAttempts?: number }).paymentProofAttempts ?? 0)
      const prevStatus = String((booking as { status?: string }).status ?? '')
      const nextStatus = prevStatus === 'awaiting_payment' ? 'payment_review' : prevStatus
      await req.payload.update({
        collection: 'bookings',
        id: bookingId,
        data: {
          latestPaymentProof: (doc as { id: number }).id,
          paymentProofAttempts: prevAttempts + 1,
          status: nextStatus,
        },
        overrideAccess: true,
        context: { skipAuditLogHook: true },
      })
    } catch (e) {
      req.payload.logger?.error?.(`[Phase 4.74.2] PaymentProof create: sync booking failed: ${(e as Error).message}`)
    }

    try {
      const refSnap = String((doc as { bookingRefSnapshot?: string }).bookingRefSnapshot ?? `#${bookingId}`)
      const sender = String((doc as { senderName?: string }).senderName ?? 'unknown')
      const amount = Number((doc as { amount?: number }).amount ?? 0)
      await req.payload.create({
        collection: 'admin-notifications',
        data: {
          type: 'payment_proof_submitted',
          title: `Payment proof submitted for ${refSnap}`,
          body: `From ${sender} — IDR ${amount.toLocaleString('id-ID')}. Review needed.`,
          severity: 'warning',
          booking: bookingId,
          paymentProof: (doc as { id: number }).id,
        },
        overrideAccess: true,
      })
    } catch (e) {
      req.payload.logger?.error?.(`[Phase 4.74.2] PaymentProof create: notif create failed: ${(e as Error).message}`)
    }
    return doc
  }

  // ─── UPDATE: handle status transition pending → approved/rejected ───
  if (operation !== 'update' || !previousDoc) return doc
  const prevStatus = String((previousDoc as { status?: string }).status ?? '')
  const nextStatus = String((doc as { status?: string }).status ?? '')
  if (prevStatus !== 'pending' || prevStatus === nextStatus) return doc

  const refSnap = String((doc as { bookingRefSnapshot?: string }).bookingRefSnapshot ?? `#${bookingId}`)

  if (nextStatus === 'approved') {
    // Phase 4.74.6b — approve = auto send receipt + e-ticket.
    // Derive paymentBank + paymentDate dari booking template + proof:
    //   - paymentBank = first bank dari BookingTemplates.bankAccounts (admin bisa
    //     edit later di booking kalau beda rekening yg menerima)
    //   - paymentDate = proof.transferDate (yg di-auto-set server saat submit)
    // Lalu self-call send-ticket endpoint (yg handle status transition confirmed,
    // audit log, PDF receipt generation, email dgn attachment, idempotency).
    //
    // Catatan: send-ticket endpoint set booking.status=confirmed sendiri,
    // jadi tidak perlu set manual di sini.
    try {
      const tpl = await req.payload.findGlobal({
        slug: 'booking-templates',
        overrideAccess: true,
      })
      const banks = Array.isArray((tpl as { bankAccounts?: unknown }).bankAccounts)
        ? ((tpl as { bankAccounts: Array<{ bankName?: string }> }).bankAccounts)
        : []
      const firstBankName = banks.find((b) => (b.bankName ?? '').trim())?.bankName?.trim() ?? ''
      if (!firstBankName) {
        throw new Error('BookingTemplates.bankAccounts kosong — tidak bisa derive paymentBank untuk send-ticket.')
      }
      const transferDate = String((doc as { transferDate?: string }).transferDate ?? '').slice(0, 10)
        || new Date().toISOString().slice(0, 10)

      // Phase 4.74.6c — Direct handler invoke (bypass HTTP + API-key issue).
      // Reuse admin user context dari hook — sentTicketBy audit = admin yg approve.
      // Fake req: inject routeParams + json() body supaya endpoint handler read-nya
      // identik dgn request HTTP asli.
      if (!sendTicketEndpoint.handler) {
        throw new Error('sendTicketEndpoint.handler undefined — import issue.')
      }
      const bodyPayload = {
        paymentBank: firstBankName,
        paymentDate: transferDate,
      }
      const fakeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, {
        routeParams: { id: String(bookingId) },
        json: async () => bodyPayload,
      })
      const res = await sendTicketEndpoint.handler(fakeReq as typeof req)
      if (!res || !(res as Response).ok) {
        const bodyText = res ? await (res as Response).text().catch(() => '') : '(no response)'
        throw new Error(`send-ticket handler returned ${res ? (res as Response).status : '?'}: ${bodyText.slice(0, 300)}`)
      }
      req.payload.logger?.info?.(`[Phase 4.74.6c] approve auto-send-ticket OK untuk booking #${bookingId} (bank=${firstBankName}, date=${transferDate})`)

      await req.payload.create({
        collection: 'admin-notifications',
        data: {
          type: 'other',
          title: `Payment approved & receipt sent for ${refSnap}`,
          body: `Booking confirmed. E-ticket + payment receipt (PDF) terkirim ke customer. Receiving bank: ${firstBankName}.`,
          severity: 'info',
          booking: bookingId,
          paymentProof: (doc as { id: number }).id,
        },
        overrideAccess: true,
      })
    } catch (e) {
      // Fail-safe: set booking.status=confirmed manual supaya admin tahu
      // workflow approve sudah berhasil, dan muncul notif critical biar
      // admin manual klik Send Ticket di edit view.
      req.payload.logger?.error?.(`[Phase 4.74.6b] approve auto-send-ticket failed: ${(e as Error).message}`)
      try {
        await req.payload.update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'confirmed' },
          overrideAccess: true,
          context: { skipAuditLogHook: true },
        })
      } catch {}
      try {
        await req.payload.create({
          collection: 'admin-notifications',
          data: {
            type: 'other',
            title: `Payment approved for ${refSnap} — manual send-ticket required`,
            body: `Auto-send gagal: ${(e as Error).message.slice(0, 150)}. Admin: buka booking edit → klik "Confirm Payment & Send Ticket" manual.`,
            severity: 'critical',
            booking: bookingId,
            paymentProof: (doc as { id: number }).id,
          },
          overrideAccess: true,
        })
      } catch {}
    }
    return doc
  }

  if (nextStatus === 'rejected') {
    const reason = String((doc as { rejectedReason?: string }).rejectedReason ?? '').trim()
      || 'Bukti transfer tidak dapat diverifikasi oleh admin.'

    // Revert booking status → awaiting_payment (customer bisa resubmit).
    try {
      await req.payload.update({
        collection: 'bookings',
        id: bookingId,
        data: { status: 'awaiting_payment' },
        overrideAccess: true,
        context: { skipAuditLogHook: true },
      })
    } catch (e) {
      req.payload.logger?.error?.(`[Phase 4.74.4] reject → revert booking.awaiting_payment failed: ${(e as Error).message}`)
    }

    // Send customer email (best-effort).
    try {
      const booking = await req.payload.findByID({
        collection: 'bookings',
        id: bookingId,
        depth: 0,
        overrideAccess: true,
      })
      const to = String((booking as { customerEmail?: string }).customerEmail ?? '')
      const name = String((booking as { customerName?: string }).customerName ?? 'Pelanggan')
      const token = String((booking as { accessToken?: string }).accessToken ?? '')
      const ref = String((booking as { bookingRef?: string }).bookingRef ?? refSnap)
      const siteUrl = process.env.SITE_URL ?? 'http://localhost:4321'
      const uploadUrl = token ? `${siteUrl}/payment/${ref}?t=${token}` : ''

      if (to && ref) {
        const subject = `Bukti pembayaran perlu dikirim ulang — Booking ${ref}`
        const text = `Hi ${name},

Maaf, bukti transfer untuk booking ${ref} belum bisa kami verifikasi.

Alasan dari admin:
${reason}

Mohon kirim ulang bukti transfer yang lebih jelas di sini:
${uploadUrl || '(hubungi admin via WhatsApp — link upload tidak tersedia)'}

Terima kasih,
GtJourneysID`
        await sendEmail({
          to,
          subject,
          text,
          idempotencyKey: `payment-reject:${(doc as { id: number }).id}`,
        })
      } else {
        req.payload.logger?.warn?.(`[Phase 4.74.4] reject: email skip (missing to/ref) for proof #${(doc as { id: number }).id}`)
      }
    } catch (e) {
      req.payload.logger?.error?.(`[Phase 4.74.4] reject email failed: ${(e as Error).message}`)
    }

    // Admin notif.
    try {
      await req.payload.create({
        collection: 'admin-notifications',
        data: {
          type: 'payment_rejected',
          title: `Payment rejected for ${refSnap}`,
          body: `Reason: ${reason.slice(0, 120)}${reason.length > 120 ? '…' : ''}`,
          severity: 'warning',
          booking: bookingId,
          paymentProof: (doc as { id: number }).id,
        },
        overrideAccess: true,
      })
    } catch (e) {
      req.payload.logger?.error?.(`[Phase 4.74.4] reject notif failed: ${(e as Error).message}`)
    }
  }

  return doc
}

/**
 * PaymentProofs — Phase 4.74.1.
 *
 * Evidence trail: bukti transfer yang customer upload lewat halaman
 * self-service `/payment/<ref>?t=<token>` (menggantikan jalur WA admin
 * yg human-error prone). Dipisah dari `Bookings` supaya:
 *   - Multi-attempt per booking (reject → resubmit) ter-record utuh.
 *   - Query terpisah di admin ("semua proof pending review today").
 *   - Field-level access gampang (bukti bisa super-admin-only kalau mau).
 *
 * `bookings.latestPaymentProof` + `bookings.paymentProofAttempts` di-sync
 * oleh hook `afterChange` di sini (lihat §4.74.1 phase doc).
 *
 * File bukti (`proofFile`) relationship ke `media` collection — reuse R2
 * bucket existing dulu di Phase 4.74.1; bucket terpisah `gt-journeys-payment-proofs`
 * dgn 12-month lifecycle purge di-defer ke sub-phase 4.74.6 (hardening).
 *
 * Access:
 *   - create: via API-key dari endpoint `/api/bookings/:id/submit-payment-proof`
 *     (token gate + rate-limit di endpoint-layer, bukan di collection access).
 *   - read:   admin+ (editor read-only untuk audit; super-admin override)
 *   - update: admin+ (approve/reject + reviewer metadata)
 *   - delete: super-admin (manual cleanup; retention 12-bulan via cron future)
 *
 * Status machine (Phase 4.74.4):
 *   pending → approved   → booking.status=confirmed (admin lanjut klik
 *                          "Confirm Payment & Send Ticket" existing endpoint)
 *   pending → rejected   → booking.status=awaiting_payment + customer email
 *                          "mohon kirim ulang: <rejectedReason>"
 *   rejectedReason wajib saat set status=rejected (guard di beforeChange).
 *
 * Field-level access `internalNote` + `submittedFromIpHash` + `submittedUserAgent`
 * = super-admin only (PII hygiene — mirror pola 4.66.7 passportNumber).
 */
export const PaymentProofs: CollectionConfig = {
  slug: 'payment-proofs',
  labels: { singular: 'Payment Proof', plural: 'Payment Proofs' },
  admin: {
    useAsTitle: 'bookingRefSnapshot',
    group: 'Bookings',
    defaultColumns: ['bookingRefSnapshot', 'senderName', 'amount', 'status', 'submittedAt'],
    // Phase 4.74.4 — sort pending oldest first (FIFO fairness) via sort+filter
    // di URL default: `?limit=25&sort=submittedAt&where[status][equals]=pending`.
    // Payload admin UI tak support `defaultFilter` di config → kalau mau default
    // view filtered, admin bookmark URL. Sort di sini pakai `-submittedAt`
    // (newest first) untuk list penuh (konsisten workflow "lihat yg terbaru").
    defaultSort: '-submittedAt',
    description:
      'Bukti transfer dari customer. Edit view: ubah status → approved/rejected (reject wajib isi rejectedReason). Reject auto-kirim email customer dgn link upload ulang.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    create: isApiOrAdmin,
    read: isApiOrAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  hooks: {
    // Phase 4.74.4 — guard: rejectedReason wajib + capture reviewer.
    beforeChange: [paymentProofGuardHook],
    // Phase 4.74.2 (create) + 4.74.4 (update): sync booking + notif + email.
    afterChange: [paymentProofsLifecycleHook],
  },
  fields: [
    // ── Relation + denormalized snapshot ───────────────────
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
      index: true,
      admin: { description: 'Booking yang bukti ini milik. 1 booking bisa punya banyak proof (resubmit).' },
    },
    {
      name: 'bookingRefSnapshot',
      type: 'text',
      admin: {
        description: 'Snapshot `bookings.bookingRef` saat submit — dipakai di list view supaya tak perlu join.',
        readOnly: true,
      },
    },

    // ── Submission data (dari customer) ────────────────────
    {
      name: 'senderName',
      type: 'text',
      required: true,
      admin: { description: 'Nama pengirim di rekening sumber transfer.' },
    },
    {
      name: 'senderBank',
      type: 'text',
      required: true,
      admin: { description: 'Bank asal transfer (free text — customer bisa pilih dari dropdown atau isi manual).' },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Nominal transfer (IDR). Pre-filled dari booking.totalEstimate di form customer.',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'IDR',
      admin: { description: 'Konsisten dgn booking.currency. MVP: IDR only.' },
    },
    {
      name: 'transferDate',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Tanggal transfer dilakukan (max = hari ini).',
      },
    },
    {
      name: 'transferTime',
      type: 'text',
      admin: { description: 'Jam transfer (HH:MM). Optional — bantu admin reconcile mutasi.' },
    },
    {
      name: 'proofFile',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Bukti transfer (JPG/PNG/WebP/PDF, max 5MB). EXIF akan di-strip di endpoint-layer sebelum simpan.',
      },
    },
    {
      name: 'customerNote',
      type: 'textarea',
      maxLength: 500,
      admin: { description: 'Catatan opsional dari customer (max 500 char).' },
    },

    // ── Submission context (admin-only, PII hygiene) ───────
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
        description: 'Timestamp submission dari endpoint (bukan createdAt — supaya audit terpisah).',
      },
    },
    {
      name: 'submittedFromIpHash',
      type: 'text',
      access: {
        read: superAdminFieldAccess,
        update: superAdminFieldAccess,
      },
      admin: {
        readOnly: true,
        description: 'SHA-256(ip || BOOKING_RL_SALT). Super-admin only — audit abuse/fraud.',
      },
    },
    {
      name: 'submittedUserAgent',
      type: 'text',
      access: {
        read: superAdminFieldAccess,
        update: superAdminFieldAccess,
      },
      admin: {
        readOnly: true,
        description: 'User-agent header saat submit. Super-admin only — audit bot/scripted upload.',
      },
    },

    // ── Admin verification ──────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending review', value: 'pending' },
        { label: 'Approved',       value: 'approved' },
        { label: 'Rejected',       value: 'rejected' },
      ],
      admin: { position: 'sidebar', description: 'Workflow: pending → approved (auto booking.status=confirmed, admin lanjut Send Ticket) atau rejected (auto email customer + revert booking.status=awaiting_payment).' },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
        readOnly: true,
        description: 'Timestamp admin set status != pending. Auto-filled oleh hook.',
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true, description: 'Admin yang approve/reject. Auto-filled oleh hook.' },
    },
    {
      name: 'rejectedReason',
      type: 'textarea',
      admin: {
        description: 'Alasan reject yang dikirim ke customer (via email). WAJIB saat status=rejected (guard di beforeChange).',
      },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      access: {
        read: superAdminFieldAccess,
        update: superAdminFieldAccess,
      },
      admin: {
        description: 'Catatan internal admin (PII hygiene — super-admin only). Tidak dikirim ke customer.',
      },
    },
  ],
  timestamps: true,
}
