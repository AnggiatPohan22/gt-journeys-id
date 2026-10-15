import type { APIRoute } from 'astro'
import crypto from 'node:crypto'
import { subscribe } from '@lib/newsletter'

/**
 * POST /api/newsletter-subscribe — Phase 4.33.
 *
 * Thin controller. All logic lives in `@lib/newsletter`. To add SMTP /
 * Hostinger / a marketing-tool webhook later, implement a new Notifier
 * and register it there — this file does not change.
 *
 * Requires `output: 'hybrid'` (or 'server') in astro.config.mjs, with
 * this file's `prerender = false`.
 *
 * Body: JSON { email: string, honeypot?: string }
 * Response: JSON { ok: true } or { ok: false, code: string }
 */

export const prerender = false

const IP_SALT = import.meta.env.NEWSLETTER_IP_SALT || 'dnj-default-salt'

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`${ip}::${IP_SALT}`).digest('hex').slice(0, 32)
}

function getClientIp(request: Request): string {
  // Cloudflare sets this on every incoming request.
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

export const POST: APIRoute = async ({ request }) => {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, code: 'invalid_body' }, 400)
  }

  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? ''
  const referer = request.headers.get('referer') ?? ''
  const source = safeUrlPath(referer)

  const outcome = await subscribe({
    email: body?.email,
    honeypot: body?.website, // honeypot field named "website" in the form
    ipKey: ip,
    ipHash: hashIp(ip),
    userAgent,
    source,
  })

  switch (outcome.status) {
    case 'ok':
      return json({ ok: true }, 200)
    case 'duplicate':
      // Treat duplicate as success from the user's POV (idempotent signup).
      return json({ ok: true, duplicate: true }, 200)
    case 'invalid':
      return json({ ok: false, code: outcome.reason }, 400)
    case 'rate_limited':
      return json({ ok: false, code: 'rate_limited' }, 429)
    case 'misconfigured':
      console.error('[newsletter] store misconfigured — check CMS_URL / PAYLOAD_API_KEY')
      return json({ ok: false, code: 'server_error' }, 500)
    case 'server_error':
    default:
      return json({ ok: false, code: 'server_error' }, 500)
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function safeUrlPath(referer: string): string {
  if (!referer) return ''
  try {
    return new URL(referer).pathname
  } catch {
    return ''
  }
}
