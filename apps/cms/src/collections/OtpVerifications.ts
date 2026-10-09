import type { CollectionConfig, Endpoint } from 'payload'
import { isAdmin, isSuperAdmin } from '../access/roles'

/**
 * Custom endpoints — workaround karena Payload v3 REST PATCH generic
 * fail dengan "Something went wrong" (bookings & otp sama-sama kena).
 * API-key dari Astro → langsung panggil Local API via `req.payload`.
 */
const markVerifiedEndpoint: Endpoint = {
  path: '/:id/mark-verified',
  method: 'post',
  handler: async (req) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super-admin')) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    const idRaw = (req.routeParams as { id?: string })?.id
    const id = Number(idRaw)
    if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })
    try {
      const doc = await req.payload.update({
        collection: 'otp-verifications',
        id,
        data: { verifiedAt: new Date().toISOString() },
        overrideAccess: true,
      })
      return Response.json({ ok: true, id: doc.id })
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, { status: 500 })
    }
  },
}

const incrementAttemptEndpoint: Endpoint = {
  path: '/:id/increment-attempt',
  method: 'post',
  handler: async (req) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super-admin')) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    const idRaw = (req.routeParams as { id?: string })?.id
    const id = Number(idRaw)
    if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })
    try {
      const current = await req.payload.findByID({
        collection: 'otp-verifications',
        id,
        overrideAccess: true,
      })
      const doc = await req.payload.update({
        collection: 'otp-verifications',
        id,
        data: { attempts: (current.attempts ?? 0) + 1 },
        overrideAccess: true,
      })
      return Response.json({ ok: true, attempts: doc.attempts })
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, { status: 500 })
    }
  },
}

/**
 * Phase 4.69.10 — Cleanup OTP records lama (expired + grace window).
 *
 * Body: { graceDays?: number } (default 7). Hanya record dengan
 * `expiresAt < now - graceDays * 24h` dihapus. Grace window supaya
 * audit admin masih punya window baca record setelah expired.
 *
 * Return: { ok, deleted, scanned, cutoffISO }
 *
 * Auth: admin role (via API-Key). Dipanggil oleh web endpoint
 * `/api/cron/cleanup-otp` yang disetup external cron.
 */
const cleanupEndpoint: Endpoint = {
  path: '/cleanup',
  method: 'post',
  handler: async (req) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super-admin')) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    let body: { graceDays?: number } = {}
    try {
      body = (await (req as any).json?.()) ?? {}
    } catch {}

    const graceDays = Math.max(0, Math.min(90, body.graceDays ?? 7))
    const cutoff = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000)
    const cutoffISO = cutoff.toISOString()

    try {
      // Find expired records yang lebih tua dari cutoff.
      const result = await req.payload.find({
        collection: 'otp-verifications',
        where: {
          expiresAt: { less_than: cutoffISO },
        },
        limit: 1000, // Batasi per-batch supaya tidak OOM.
        depth: 0,
        overrideAccess: true,
      })

      let deleted = 0
      for (const doc of result.docs) {
        try {
          await req.payload.delete({
            collection: 'otp-verifications',
            id: doc.id,
            overrideAccess: true,
          })
          deleted++
        } catch {
          // Skip errors — mungkin sudah terhapus concurrent.
        }
      }

      return Response.json({
        ok: true,
        deleted,
        scanned: result.docs.length,
        cutoffISO,
        hasMore: result.hasNextPage ?? false,
      })
    } catch (e) {
      return Response.json(
        { ok: false, error: (e as Error).message },
        { status: 500 },
      )
    }
  },
}

/**
 * OtpVerifications — Phase 4.69.2.
 *
 * One-time passcode records untuk verifikasi email (dan nanti WhatsApp
 * di Phase 4.69.11 future). SEMUA sensitive values di-hash:
 *   - `targetHash` = SHA-256(email || OTP_SALT)   → bukan email mentah
 *   - `otpHash`    = SHA-256(otp || OTP_SALT)     → bukan OTP mentah
 *   - `ipHash`     = SHA-256(ip || BOOKING_RL_SALT) (reuse rate-limit salt)
 *
 * Dengan hash, kebocoran DB tidak langsung membocorkan email + OTP;
 * attacker tetap harus brute-force (walau 6-digit OTP mudah). TTL 10
 * menit + 5 attempt limit + rate-limit send mengikat window brute-force.
 *
 * Access:
 * - create: disabled public (write via API-key dari Astro endpoint)
 * - read:   admin+ (debugging; data hashed, bukan PII mentah)
 * - update: disabled public (API-key only — increment attempts, mark verified)
 * - delete: super-admin (manual cleanup bila cron belum jalan)
 */
export const OtpVerifications: CollectionConfig = {
  slug: 'otp-verifications',
  labels: { singular: 'OTP Verification', plural: 'OTP Verifications' },
  admin: {
    useAsTitle: 'id',
    group: 'Bookings',
    defaultColumns: ['kind', 'targetHash', 'attempts', 'verifiedAt', 'expiresAt', 'createdAt'],
    defaultSort: '-createdAt',
    description: 'Ephemeral OTP records (email/WA). Semua nilai sensitif di-hash. Auto-cleanup via cron.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'email',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
      admin: { description: 'Jenis target yang diverifikasi.' },
    },
    {
      name: 'targetHash',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'SHA-256(email_or_waNumber || OTP_SALT). Jangan pernah simpan raw.' },
    },
    {
      name: 'otpHash',
      type: 'text',
      required: true,
      admin: { description: 'SHA-256(otp || OTP_SALT). 6-digit OTP di-hash dengan salt sama.' },
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { description: 'Jumlah percobaan check. >= 5 → invalid tanpa perlu TTL habis.' },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'OTP_TTL_MINUTES setelah createdAt. Setelah ini → invalid.',
      },
    },
    {
      name: 'verifiedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Diisi saat OTP sukses diverifikasi. Record single-use setelah ini.',
      },
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: { description: 'Hash IP pengirim untuk rate-limit audit (jangan pernah raw IP).' },
    },
  ],
  endpoints: [markVerifiedEndpoint, incrementAttemptEndpoint, cleanupEndpoint],
  timestamps: true, // createdAt + updatedAt
}
