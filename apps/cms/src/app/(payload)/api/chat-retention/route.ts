import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { runChatRetention } from '../../../../lib/chat-retention'

/**
 * POST /api/chat-retention — Phase 4.50.7.
 *
 * Panggil `runChatRetention()` sekali. Gated by `x-cron-key` header
 * (env `CHAT_RETENTION_CRON_KEY`). Response ringkas: jumlah row yang
 * di-redact/delete + reason.
 *
 * Cara panggil:
 *   - Cloudflare scheduled worker (recommended production): tulis Worker
 *     terpisah yang fetch endpoint ini via internal HTTP. Cron di
 *     wrangler.toml.
 *   - External cron (mis. GitHub Actions, cron-job.org): POST dengan
 *     header `x-cron-key: <secret>`.
 *   - Manual/debug: `curl -X POST -H "x-cron-key: xxx" http://localhost:3030/api/chat-retention`
 *
 * Idempotent — aman dipanggil berkali-kali.
 */
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-cron-key') ?? ''
  const expected = process.env.CHAT_RETENTION_CRON_KEY ?? ''
  if (!expected || expected.length < 16) {
    return NextResponse.json(
      { ok: false, code: 'misconfigured', reason: 'CHAT_RETENTION_CRON_KEY missing or weak' },
      { status: 500 },
    )
  }
  if (key !== expected) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const result = await runChatRetention(payload)
    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { ok: false, code: 'server_error', reason: String(e) },
      { status: 500 },
    )
  }
}

/** GET → health check ringan; tidak menjalankan retention. */
export async function GET() {
  return NextResponse.json({ ok: true, note: 'POST with x-cron-key to run retention.' })
}
