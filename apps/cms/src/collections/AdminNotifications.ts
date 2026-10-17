import type { CollectionConfig, Endpoint } from 'payload'
import { isAdmin, isApiOrAdmin, isSuperAdmin } from '../access/roles'

/**
 * Phase 4.74.5 — bell top-bar admin endpoints.
 *
 * GET /unread-count → { count, items[] } untuk polling 30s di client.
 *   - `count`: jumlah notif yg user ini belum baca (where readBy[].user ≠ this.user)
 *   - `items`: 20 notif terbaru (sorted -createdAt), each dgn flag `read: boolean`.
 *
 * POST /:id/read → add { user: this.user, readAt: now } ke readBy[].
 *   Idempotent: skip jika user sudah ada di readBy[].
 */
const unreadCountEndpoint: Endpoint = {
  path: '/unread-count',
  method: 'get',
  handler: async (req) => {
    if (!req.user || !['admin', 'super-admin'].includes(req.user.role as string)) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    const userId = req.user.id
    try {
      const result = await req.payload.find({
        collection: 'admin-notifications',
        limit: 20,
        sort: '-createdAt',
        depth: 0,
        overrideAccess: true,
      })
      let unread = 0
      const items = result.docs.map((doc) => {
        const rawReadBy = (doc as unknown as { readBy?: unknown }).readBy
        const readBy = Array.isArray(rawReadBy)
          ? (rawReadBy as Array<{ user?: number | string | { id?: number | string } }>)
          : []
        const read = readBy.some((r) => {
          const uid = typeof r?.user === 'object' && r.user !== null
            ? (r.user as { id?: number | string }).id
            : r?.user
          return String(uid) === String(userId)
        })
        if (!read) unread++
        return {
          id: doc.id,
          type: (doc as { type?: string }).type,
          title: (doc as { title?: string }).title,
          body: (doc as { body?: string }).body,
          severity: (doc as { severity?: string }).severity ?? 'info',
          createdAt: (doc as { createdAt?: string }).createdAt,
          booking: (doc as { booking?: number | { id?: number } }).booking,
          paymentProof: (doc as { paymentProof?: number | { id?: number } }).paymentProof,
          read,
        }
      })
      return Response.json({ ok: true, count: unread, items })
    } catch (e) {
      return Response.json(
        { ok: false, error: (e as Error).message },
        { status: 500 },
      )
    }
  },
}

/**
 * Phase 4.74.6 — TTL cleanup. Hapus notif yg lebih tua dari N hari
 * (default 60). Dipanggil cron external (admin-only). Mirror pola
 * `OtpVerifications.cleanup` (4.69.10).
 */
const cleanupEndpoint: Endpoint = {
  path: '/cleanup',
  method: 'post',
  handler: async (req) => {
    if (!req.user || !['admin', 'super-admin'].includes(req.user.role as string)) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    let body: { olderThanDays?: number } = {}
    try {
      body = (await (req as any).json?.()) ?? {}
    } catch {}
    const days = Math.max(7, Math.min(365, body.olderThanDays ?? 60))
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const cutoffISO = cutoff.toISOString()
    try {
      const result = await req.payload.find({
        collection: 'admin-notifications',
        where: { createdAt: { less_than: cutoffISO } },
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      })
      let deleted = 0
      for (const doc of result.docs) {
        try {
          await req.payload.delete({
            collection: 'admin-notifications',
            id: doc.id,
            overrideAccess: true,
          })
          deleted++
        } catch {}
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

const markReadEndpoint: Endpoint = {
  path: '/:id/read',
  method: 'post',
  handler: async (req) => {
    if (!req.user || !['admin', 'super-admin'].includes(req.user.role as string)) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    const idRaw = (req.routeParams as { id?: string })?.id
    const id = Number(idRaw)
    if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 })
    const userId = req.user.id
    try {
      const current = await req.payload.findByID({
        collection: 'admin-notifications',
        id,
        depth: 0,
        overrideAccess: true,
      })
      const rawReadBy = (current as unknown as { readBy?: unknown }).readBy
      const readBy = Array.isArray(rawReadBy)
        ? (rawReadBy as Array<{ user?: number | string | { id?: number | string }; readAt?: string }>)
        : []
      const already = readBy.some((r) => {
        const uid = typeof r?.user === 'object' && r.user !== null
          ? (r.user as { id?: number | string }).id
          : r?.user
        return String(uid) === String(userId)
      })
      if (already) return Response.json({ ok: true, idempotent: true })
      await req.payload.update({
        collection: 'admin-notifications',
        id,
        data: {
          readBy: [...readBy, { user: userId as number, readAt: new Date().toISOString() }],
        },
        overrideAccess: true,
      })
      return Response.json({ ok: true })
    } catch (e) {
      return Response.json(
        { ok: false, error: (e as Error).message },
        { status: 500 },
      )
    }
  },
}

/**
 * AdminNotifications — Phase 4.74.1.
 *
 * Feed real-time untuk top-bar bell admin Payload. MVP: polling 30s dari
 * komponen custom di `admin.components.beforeNavLinks` (sub-phase 4.74.5).
 * Future: swap ke SSE / Durable Object kalau polling cost tinggi.
 *
 * Rekord dibuat oleh hook `afterChange` di 2 collection:
 *   - Bookings create (status=awaiting_review) → type: `booking_new`
 *   - PaymentProofs create                     → type: `payment_proof_submitted`
 *
 * Scope: global pool + per-user `readBy[]` array. Supaya shift admin bisa
 * lihat unread shift sebelumnya (konsisten dgn Q3 di analysis doc §10).
 *
 * Retention: TTL cron purge > 60 hari (defer ke 4.74.6).
 *
 * Access:
 *   - create: via API-key / hook internal (isApiOrAdmin — bukan public)
 *   - read:   admin+ (editor tidak dapat notif management)
 *   - update: admin+ (mark-read own entry via readBy[])
 *   - delete: super-admin (manual cleanup; retention cron future)
 */
export const AdminNotifications: CollectionConfig = {
  slug: 'admin-notifications',
  labels: { singular: 'Admin Notification', plural: 'Admin Notifications' },
  admin: {
    useAsTitle: 'title',
    group: 'Bookings',
    defaultColumns: ['type', 'title', 'severity', 'createdAt'],
    defaultSort: '-createdAt',
    description: 'Feed in-app untuk top-bar bell admin. Auto-created oleh hook; manual edit tidak disarankan.',
    hidden: ({ user }) => !user || user.role === 'editor',
  },
  access: {
    create: isApiOrAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  endpoints: [unreadCountEndpoint, markReadEndpoint, cleanupEndpoint],
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'New booking',             value: 'booking_new' },
        { label: 'Payment proof submitted', value: 'payment_proof_submitted' },
        { label: 'Payment rejected (by admin)', value: 'payment_rejected' },
        { label: 'Reschedule request',      value: 'reschedule_request' },
        { label: 'Cancel request',          value: 'cancel_request' },
        { label: 'Other',                   value: 'other' },
      ],
      index: true,
      admin: { description: 'Jenis event. Dipakai untuk icon + filter di side-panel bell.' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Short title untuk bell row. E.g. "New booking #BK-xxxx — Batam → Singapore".' },
    },
    {
      name: 'body',
      type: 'text',
      admin: { description: 'Short preview body (max ~140 char). Detail lengkap di deep-link ke booking.' },
    },
    {
      name: 'severity',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info',     value: 'info' },
        { label: 'Warning',  value: 'warning' },
        { label: 'Critical', value: 'critical' },
      ],
      admin: { description: 'Color coding bell row. Default info.' },
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      index: true,
      admin: { description: 'Deep-link target (optional).' },
    },
    {
      name: 'paymentProof',
      type: 'relationship',
      relationTo: 'payment-proofs',
      admin: { description: 'Deep-link target (optional, untuk type=payment_proof_submitted).' },
    },
    {
      name: 'readBy',
      type: 'array',
      admin: {
        description:
          'Per-user read tracker. Record di-mark read PER-USER (bukan global) supaya shift admin bisa lihat unread shift sebelumnya.',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'readAt',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
  ],
  timestamps: true,
}
