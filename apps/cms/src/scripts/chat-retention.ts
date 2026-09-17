/**
 * Chat retention CLI wrapper — Phase 4.50.7.
 *
 * Run manual: cd apps/cms && pnpm retention:chat
 * (matikan `pnpm dev` CMS dulu supaya SQLite tidak lock)
 *
 * Untuk jadwal otomatis (production Cloudflare Workers): pakai HTTP
 * endpoint /api/chat/retention (route.ts) yang di-hit oleh scheduled
 * worker / external cron dengan API key.
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { runChatRetention } from '../lib/chat-retention'

const run = async () => {
  const payload = await getPayload({ config })
  const res = await runChatRetention(payload)
  console.log('[chat-retention]', JSON.stringify(res))
  if (res.reason) console.log('  reason:', res.reason)
  process.exit(0)
}

run().catch((e) => {
  console.error('[chat-retention] FAILED:', e)
  process.exit(1)
})
