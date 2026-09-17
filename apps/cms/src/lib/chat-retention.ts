/**
 * Chat retention — Phase 4.50.7.
 *
 * Purge audit collections berdasarkan `chat-widget.auditRetentionDays`
 * (default 30). Dua-fase supaya admin tetap punya jejak forensik meski
 * body pesan sudah hilang:
 *
 *   Fase 1 (retain / 2): purge `chat-messages.content` (raw body).
 *     `contentHash` + `contentLength` + `wasBlocked` + `blockReason` +
 *     `context` tetap dipertahankan → dedup detection & audit trail masih
 *     jalan tanpa raw text.
 *   Fase 2 (retain): delete row `chat-messages` + `chat-blocked-events`
 *     yang lebih tua dari `auditRetentionDays`.
 *
 * `chat-visitors`: tidak di-delete otomatis di phase ini (visitor cookie
 * lifetime bisa lebih panjang dari retention). Archive job optional di
 * follow-up.
 *
 * Idempotent + safe: bila retention = 0 → skip (retain forever).
 * Kompatibel dengan Payload local API — tidak butuh raw SQL.
 */

import type { Payload } from 'payload'

export interface RetentionResult {
  ok: boolean
  redactedContent: number
  deletedMessages: number
  deletedBlockedEvents: number
  reason?: string
}

interface Options {
  now?: Date
  /** Batch size per iteration. Default 100 — cukup kecil untuk Cloudflare Workers CPU limit. */
  batchSize?: number
  /** Max iterasi guard supaya tidak jalan berjam-jam. Default 50 (= 5000 doc per phase). */
  maxIterations?: number
}

export async function runChatRetention(
  payload: Payload,
  opts: Options = {},
): Promise<RetentionResult> {
  const now = opts.now ?? new Date()
  const batchSize = opts.batchSize ?? 100
  const maxIter = opts.maxIterations ?? 50

  const widget = await payload
    .findGlobal({ slug: 'chat-widget' })
    .catch(() => null)
  const retentionDays = Number((widget as any)?.auditRetentionDays)
  if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
    return {
      ok: true,
      redactedContent: 0,
      deletedMessages: 0,
      deletedBlockedEvents: 0,
      reason: 'retention_disabled',
    }
  }

  const redactCutoff = new Date(now.getTime() - (retentionDays / 2) * 86400_000)
  const deleteCutoff = new Date(now.getTime() - retentionDays * 86400_000)

  // ── Phase 1: redact content di message > retention/2 (tapi masih < retention)
  let redactedContent = 0
  for (let i = 0; i < maxIter; i++) {
    const found = await payload.find({
      collection: 'chat-messages',
      where: {
        and: [
          { createdAt: { less_than: redactCutoff.toISOString() } },
          { content: { not_equals: null } },
        ],
      },
      limit: batchSize,
      depth: 0,
      pagination: false,
    })
    if (!found.docs || found.docs.length === 0) break
    for (const doc of found.docs) {
      await payload
        .update({
          collection: 'chat-messages',
          id: doc.id,
          data: { content: null } as any,
        })
        .catch(() => null)
      redactedContent++
    }
    if (found.docs.length < batchSize) break
  }

  // ── Phase 2a: delete chat-messages > retention
  let deletedMessages = 0
  for (let i = 0; i < maxIter; i++) {
    const found = await payload.find({
      collection: 'chat-messages',
      where: { createdAt: { less_than: deleteCutoff.toISOString() } },
      limit: batchSize,
      depth: 0,
      pagination: false,
    })
    if (!found.docs || found.docs.length === 0) break
    for (const doc of found.docs) {
      await payload
        .delete({ collection: 'chat-messages', id: doc.id })
        .catch(() => null)
      deletedMessages++
    }
    if (found.docs.length < batchSize) break
  }

  // ── Phase 2b: delete chat-blocked-events > retention
  let deletedBlockedEvents = 0
  for (let i = 0; i < maxIter; i++) {
    const found = await payload.find({
      collection: 'chat-blocked-events',
      where: { createdAt: { less_than: deleteCutoff.toISOString() } },
      limit: batchSize,
      depth: 0,
      pagination: false,
    })
    if (!found.docs || found.docs.length === 0) break
    for (const doc of found.docs) {
      await payload
        .delete({ collection: 'chat-blocked-events', id: doc.id })
        .catch(() => null)
      deletedBlockedEvents++
    }
    if (found.docs.length < batchSize) break
  }

  return {
    ok: true,
    redactedContent,
    deletedMessages,
    deletedBlockedEvents,
  }
}
