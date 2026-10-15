/**
 * Newsletter — notifier interface.
 *
 * Fire-and-forget side-effects after a subscriber is stored: welcome
 * email, Slack ping, third-party webhook, etc. Kept behind an interface
 * so we can chain SMTP/Hostinger/Resend/webhook later without touching
 * the endpoint controller.
 *
 * Contract: notifiers MUST NOT throw. Failures are swallowed after a log
 * so a misbehaving notifier can't fail the user's signup.
 */

export interface NotifierPayload {
  email: string
  source?: string
}

export interface Notifier {
  readonly name: string
  onSubscribe(payload: NotifierPayload): Promise<void>
}

// ── Default: no-op logger. Replace with real notifiers when ready. ──
export class LogNotifier implements Notifier {
  readonly name = 'log'
  async onSubscribe(payload: NotifierPayload): Promise<void> {
    // Structured so future log-forwarding in Cloudflare can pick it up.
    console.log(JSON.stringify({ event: 'newsletter.subscribed', ...payload }))
  }
}

// ── Chain runner: safe for future multi-notifier fan-out. ──────────
export async function runNotifiers(
  notifiers: readonly Notifier[],
  payload: NotifierPayload,
): Promise<void> {
  await Promise.all(
    notifiers.map(async (n) => {
      try {
        await n.onSubscribe(payload)
      } catch (err) {
        console.error(`[newsletter] notifier "${n.name}" failed`, err)
      }
    }),
  )
}
