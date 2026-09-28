/**
 * Checkout channel abstraction — Phase 4.62.
 *
 * A channel decides HOW a booking gets handed off after the customer submits
 * the checkout form. Today only `manual_wa` exists (WhatsApp fallback);
 * `xendit` / `midtrans` slots are reserved but NOT implemented — plug new
 * channels here without touching the checkout form, the booking schema, or
 * the confirmation page.
 *
 * `resolveChannel(serviceType)` returns the active implementation from env
 * (see `apps/web/.env.example` → `PUBLIC_FERRY_CHECKOUT_CHANNEL`).
 */

import type { Booking } from '@shared/types/payload-types'

export interface CheckoutHandoff {
  /** Absolute URL to send the customer to when they click the primary button. */
  redirectUrl: string
  /** Label to render on the primary button. */
  buttonLabel: string
  /** Free-text summary of the handoff (shown to the customer & to admins). */
  channelLabel: string
}

export interface CheckoutChannel {
  /** Slug identifier — matches the `channel` field in the Bookings collection. */
  readonly slug: string
  /**
   * Build the handoff payload for a booking. Pure — must not mutate the
   * booking record. For payment gateways this is where you'd create the
   * invoice and persist gateway ids back to `channelData` (via the caller).
   */
  handle(booking: Booking): Promise<CheckoutHandoff>
}
